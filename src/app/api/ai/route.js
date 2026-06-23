import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { endpoint, apiKey, model, messages } = body;

    if (!endpoint || !apiKey) {
      return NextResponse.json({ error: 'Missing endpoint or API key' }, { status: 400 });
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages
      })
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy AI Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
