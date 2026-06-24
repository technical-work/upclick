import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, collection, increment } from 'firebase/firestore';

export async function POST(req) {
  try {
    const body = await req.json();
    
    if (db) {
      // Log the webhook request for diagnostics
      const logRef = doc(collection(db, 'telegram_webhook_logs'));
      await setDoc(logRef, {
        payload: body,
        receivedAt: new Date().toISOString(),
        status: 'received'
      });
    }

    // Check if it's a message
    if (body.message) {
      const msg = body.message;
      const chatId = msg.chat.id.toString();
      let text = msg.text || msg.caption || '';
      let mediaType = null;
      let mediaFileId = null;

      if (msg.photo && msg.photo.length > 0) {
        mediaType = 'photo';
        mediaFileId = msg.photo[msg.photo.length - 1].file_id;
      } else if (msg.video) {
        mediaType = 'video';
        mediaFileId = msg.video.file_id;
      } else if (msg.document) {
        mediaType = 'document';
        mediaFileId = msg.document.file_id;
      } else if (msg.voice) {
        mediaType = 'voice';
        mediaFileId = msg.voice.file_id;
      } else if (msg.audio) {
        mediaType = 'audio';
        mediaFileId = msg.audio.file_id;
      } else if (msg.sticker) {
        mediaType = 'sticker';
        mediaFileId = msg.sticker.file_id;
      }

      if (!text && mediaType) {
        text = `[${mediaType.toUpperCase()}]`;
      }      
      const user = msg.from;
      const contactData = {
        id: user.id.toString(),
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        username: user.username || '',
        languageCode: user.language_code || '',
        updatedAt: new Date().toISOString(),
      };

      if (db) {
        // Save contact to telegram_contacts
        const contactRef = doc(db, 'telegram_contacts', contactData.id);
        await setDoc(contactRef, contactData, { merge: true });

        // Save chat message
        const messageData = {
          messageId: msg.message_id,
          text: text,
          date: msg.date,
          from: contactData.id,
          isIncoming: true,
          mediaType: mediaType || null,
          mediaFileId: mediaFileId || null,
          createdAt: new Date().toISOString()
        };

        // Add to the specific chat's messages subcollection
        const messageRef = doc(collection(db, `telegram_chats/${chatId}/messages`), msg.message_id.toString());
        await setDoc(messageRef, messageData);

        // Update the last message in the chat document
        const chatRef = doc(db, 'telegram_chats', chatId);
        await setDoc(chatRef, {
          lastMessage: text,
          lastMessageAt: new Date().toISOString(),
          contactId: contactData.id,
          updatedAt: new Date().toISOString(),
          unreadCount: increment(1)
        }, { merge: true });
      } else {
        console.warn('Firebase Client DB is not initialized. Message not saved to database.');
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error handling Telegram webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
