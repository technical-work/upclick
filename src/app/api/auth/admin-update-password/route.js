import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/utils/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { targetUid, newPassword } = await req.json();

    if (!targetUid) {
      return NextResponse.json({ error: 'Missing target user ID' }, { status: 400 });
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'كلمة المرور يجب أن تتكون من 6 أحرف أو أرقام على الأقل' }, { status: 400 });
    }

    const { adminAuth, adminDb } = await getFirebaseAdmin();

    if (!adminAuth) {
      return NextResponse.json({ error: 'سيرفر خادم الإدارة غير مهيأ' }, { status: 500 });
    }

    // Update password in Firebase Authentication
    await adminAuth.updateUser(targetUid, {
      password: newPassword
    });

    // Update timestamp in Firestore
    if (adminDb) {
      await adminDb.collection('users').doc(targetUid).set({
        passwordUpdatedAt: new Date().toISOString()
      }, { merge: true });
    }

    return NextResponse.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' }, { status: 200 });
  } catch (err) {
    console.error('[admin-update-password] Error:', err);
    return NextResponse.json({ error: err.message || 'فشل في تحديث كلمة المرور' }, { status: 500 });
  }
}
