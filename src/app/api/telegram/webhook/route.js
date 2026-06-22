import { NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';
import { collection, query, getDocs, setDoc, doc, getDoc } from 'firebase/firestore';

export async function POST(request) {
  try {
    const body = await request.json();

    // 1. Setup Action from the Frontend
    if (body.action === 'setup' && body.token) {
      const host = request.headers.get('host') || 'localhost:3000';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const webhookUrl = `${protocol}://${host}/api/telegram/webhook`;
      
      if (!host.includes('localhost')) {
        const tgRes = await fetch(`https://api.telegram.org/bot${body.token}/setWebhook?url=${webhookUrl}`);
        const tgData = await tgRes.json();
        if (!tgData.ok) {
          console.error("Telegram setWebhook error:", tgData);
          return NextResponse.json({ success: false, error: tgData.description }, { status: 400 });
        }
      } else {
         console.warn("Cannot set Telegram webhook on localhost. Please use ngrok or deploy to a public server.");
      }
      
      return NextResponse.json({ success: true, message: 'Webhook setup initiated' });
    }

    // 2. Incoming Webhook from Telegram
    if (body.message || body.callback_query) {
      const msg = body.message || body.callback_query.message;
      if (!msg) return NextResponse.json({ success: true });

      const chatId = msg.chat.id;
      const firstName = msg.from.first_name || '';
      const lastName = msg.from.last_name || '';
      const username = msg.from.username || '';
      const fullName = `${firstName} ${lastName}`.trim();
      const phone = msg.contact ? msg.contact.phone_number : '';
      
      const searchUid = request.nextUrl.searchParams.get('uid');
      let targetUser = null;

      if (searchUid) {
         targetUser = searchUid;
      } else {
         // Fallback: Just grab the first user (for local dev or single tenant)
         const usersRef = collection(db, 'users');
         const q = query(usersRef);
         const snaps = await getDocs(q);
         if (!snaps.empty) {
            targetUser = snaps.docs[0].id;
            
            // Try to find the specific user who has telegram integration connected
            for (const docSnap of snaps.docs) {
               const data = docSnap.data();
               if (data.GC?.integrations?.telegramConnected) {
                  targetUser = docSnap.id;
                  break;
               }
            }
         }
      }

      if (targetUser) {
        const userDocRef = doc(db, 'users', targetUser);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
           const userData = userDocSnap.data();
           const GC = userData.GC || {};
           const leads = GC.crm?.leads || [];
           
           // Check if lead already exists based on Telegram ID
           const existingLeadIndex = leads.findIndex(l => l.telegramId === chatId);
           
           if (existingLeadIndex === -1) {
              const newLead = {
                 id: Date.now(),
                 telegramId: chatId,
                 name: fullName || 'Telegram User',
                 username: username,
                 phone: phone,
                 email: '',
                 value: 0,
                 stage: 'Prospect',
                 source: 'Telegram',
                 created: new Date().toISOString()
              };
              
              leads.push(newLead);
              
              const updatedGC = {
                 ...GC,
                 crm: {
                    ...GC.crm,
                    leads
                 }
              };
              
              await setDoc(userDocRef, { GC: updatedGC }, { merge: true });
           }
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
