import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { apiKey } = await request.json();
    if (!apiKey) {
      return NextResponse.json({ error: 'مفتاح API مطلوب للتحقق' }, { status: 400 });
    }

    const res = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ success: true, modelsCount: data.data?.length || 0 });
    } else {
      const errText = await res.text();
      let errorMsg = 'مفتاح API غير صالح أو غير مصرح به';
      try {
        const errJson = JSON.parse(errText);
        errorMsg = errJson.error?.message || errorMsg;
      } catch (e) {}
      return NextResponse.json({ success: false, error: errorMsg }, { status: res.status });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message || 'خطأ داخلي في الخادم' }, { status: 500 });
  }
}
