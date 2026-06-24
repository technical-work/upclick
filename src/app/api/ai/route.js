import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const maxDuration = 60;


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

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch(e) {
      return NextResponse.json({ error: 'API returned HTML (Cloudflare block?)', html: text.substring(0, 500) }, { status: 502 });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy AI Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
