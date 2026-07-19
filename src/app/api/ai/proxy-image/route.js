import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const res = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch image from source: ${res.statusText}`);
    }

    const blob = await res.blob();
    const headers = new Headers();
    headers.set('Content-Type', res.headers.get('Content-Type') || 'image/png');
    headers.set('Cache-Control', 'public, max-age=86400');

    return new Response(blob, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Image Proxy Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
