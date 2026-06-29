import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const token = formData.get('token');
    const chatId = formData.get('chatId');
    const file = formData.get('file');
    const type = formData.get('type') || 'document'; // photo, video, document, audio
    const caption = formData.get('caption') || '';

    if (!token || !chatId || !file) {
      return NextResponse.json({ error: 'Token, Chat ID, and File are required' }, { status: 400 });
    }

    let endpoint = 'sendDocument';
    let fileField = 'document';
    
    if (type === 'photo') {
      endpoint = 'sendPhoto';
      fileField = 'photo';
    } else if (type === 'video') {
      endpoint = 'sendVideo';
      fileField = 'video';
    } else if (type === 'audio') {
      endpoint = 'sendAudio';
      fileField = 'audio';
    }

    // Prepare a new FormData to send to Telegram
    const tgFormData = new FormData();
    tgFormData.append('chat_id', chatId);
    tgFormData.append(fileField, file);
    if (caption) {
      tgFormData.append('caption', caption);
    }

    const response = await fetch(`https://api.telegram.org/bot${token}/${endpoint}`, {
      method: 'POST',
      body: tgFormData,
    });

    const data = await response.json();

    if (data.ok) {
      return NextResponse.json({ ok: true, result: data.result });
    } else {
      return NextResponse.json({ error: data.description || 'Failed to send media' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error sending media:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
