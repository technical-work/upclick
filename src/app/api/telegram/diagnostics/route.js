import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/utils/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const { adminDb: db } = await getFirebaseAdmin();

    // 1. Fetch Webhook Info from Telegram
    let webhookInfo = null;
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
      const data = await response.json();
      if (data.ok) {
        webhookInfo = data.result;
      } else {
        webhookInfo = { error: data.description };
      }
    } catch (e) {
      webhookInfo = { error: e.message };
    }

    // 2. Fetch Latest Webhook Logs from Firestore
    const logs = [];
    if (db) {
      try {
        const querySnapshot = await db.collection('telegram_webhook_logs')
          .orderBy('receivedAt', 'desc')
          .limit(50)
          .get();
        
        querySnapshot.forEach((doc) => {
          logs.push({ id: doc.id, ...doc.data() });
        });
      } catch (e) {
        console.error("Error fetching logs from firestore", e);
      }
    }

    return NextResponse.json({ ok: true, webhookInfo, logs });
  } catch (error) {
    console.error('Error in diagnostics API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
