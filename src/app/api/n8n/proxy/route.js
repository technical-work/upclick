import { NextResponse } from 'next/server';

// Bypass SSL certificate errors for n8n instances on temporary domains
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function POST(req) {
  try {
    const { url, apiKey, endpoint = '/workflows', method = 'GET', payload = null } = await req.json();

    if (!url || !apiKey) {
      return NextResponse.json({ error: 'URL and API Key are required' }, { status: 400 });
    }

    // Format the URL properly
    const baseUrl = url.replace(/\/+$/, ''); // remove trailing slashes
    // the n8n api path is usually /api/v1
    const n8nApiPath = baseUrl.includes('/api/v1') ? baseUrl : `${baseUrl}/api/v1`;
    const fetchUrl = `${n8nApiPath}${endpoint}`;

    const fetchOptions = {
      method: method,
      headers: {
        'Accept': 'application/json',
        'X-N8N-API-KEY': apiKey
      }
    };

    if (payload && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(payload);
    }

    const response = await fetch(fetchUrl, fetchOptions);

    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { message: 'Empty or invalid JSON response' };
    }

    if (response.ok) {
      return NextResponse.json({ ok: true, data });
    } else {
      return NextResponse.json({ error: data.message || 'Failed to fetch from n8n' }, { status: response.status });
    }

  } catch (error) {
    console.error('Error in n8n proxy:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
