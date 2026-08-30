import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/utils/firebaseAdmin';
import { verifyUnsubscribeToken } from '@/lib/outreach/tokens';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function htmlPage(title, message) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${title}</title></head>
<body style="font-family:Segoe UI,Tahoma,sans-serif;background:#08080f;color:#e2e8f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
  <div style="max-width:420px;background:#141422;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;text-align:center;">
    <h1 style="color:#FF6B35;font-size:22px;">${title}</h1>
    <p style="color:#a0aec0;line-height:1.7;">${message}</p>
  </div>
</body>
</html>`;
}

async function optOut(userId) {
  const { adminDb } = await getFirebaseAdmin();
  if (!adminDb) throw new Error('Admin DB not initialized');
  await adminDb.collection('users').doc(userId).set({
    marketingOptOut: true,
    emailOptOut: true,
    marketingOptOutAt: new Date().toISOString()
  }, { merge: true });
}

export async function GET(req) {
  const token = req.nextUrl.searchParams.get('token') || '';
  const userId = verifyUnsubscribeToken(token);
  if (!userId) {
    return new NextResponse(htmlPage('رابط غير صالح', 'تعذر تأكيد طلب إلغاء الاشتراك.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
  try {
    await optOut(userId);
    return new NextResponse(htmlPage('تم إلغاء الاشتراك', 'لن يصلك بريد تسويقي من UpKlick بعد الآن.'), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (err) {
    return new NextResponse(htmlPage('حدث خطأ', 'حاول مرة أخرى لاحقاً.'), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
}

export async function POST(req) {
  const token = req.nextUrl.searchParams.get('token') || '';
  const userId = verifyUnsubscribeToken(token);
  if (!userId) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }
  try {
    await optOut(userId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 });
  }
}
