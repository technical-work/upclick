import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { token, chatId, message } = await req.json();

    if (!token || !chatId || !message) {
      return NextResponse.json({ error: 'Token, Chat ID, and Message are required' }, { status: 400 });
    }

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    const data = await response.json();

    if (data.ok) {
      return NextResponse.json({ ok: true, result: data.result });
    } else {
      return NextResponse.json({ error: data.description || 'Failed to send message' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error sending test message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
