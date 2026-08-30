import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/utils/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { targetUid, newEmail, newPassword } = await req.json();

    if (!targetUid) {
      return NextResponse.json({ error: 'Missing target user ID' }, { status: 400 });
    }

    const { adminAuth, adminDb } = await getFirebaseAdmin();

    if (!adminAuth) {
      return NextResponse.json({ error: 'سيرفر خادم الإدارة غير مهيأ' }, { status: 500 });
    }

    const updatePayload = {};

    if (newEmail && typeof newEmail === 'string' && newEmail.trim().length > 0) {
      updatePayload.email = newEmail.trim();
    }

    if (newPassword && typeof newPassword === 'string' && newPassword.trim().length > 0) {
      if (newPassword.trim().length < 6) {
        return NextResponse.json({ error: 'كلمة المرور يجب أن تتكون من 6 أحرف أو أرقام على الأقل' }, { status: 400 });
      }
      updatePayload.password = newPassword.trim();
    }

    // 1. Update Firebase Authentication credentials
    if (Object.keys(updatePayload).length > 0) {
      try {
        await adminAuth.updateUser(targetUid, updatePayload);
      } catch (authErr) {
        console.warn('[admin-update-user] Firebase Auth update warning:', authErr.code || authErr.message);
        if (authErr.code === 'auth/user-not-found' || authErr.message?.includes('no user record')) {
          if (updatePayload.password && updatePayload.email) {
            try {
              await adminAuth.createUser({
                uid: targetUid,
                email: updatePayload.email,
                password: updatePayload.password
              });
            } catch (createErr) {
              console.warn('[admin-update-user] Auth create fallback warning:', createErr.message);
            }
          }
        } else {
          throw authErr;
        }
      }
    }

    // 2. Sync updated credentials in Firestore
    if (adminDb) {
      const fsPayload = {
        updatedAt: new Date().toISOString()
      };
      if (updatePayload.email) {
        fsPayload.email = updatePayload.email;
      }
      await adminDb.collection('users').doc(targetUid).set(fsPayload, { merge: true });
    }

    return NextResponse.json({ success: true, message: 'تم تحديث بيانات الحساب والمصادقة بنجاح' }, { status: 200 });
  } catch (err) {
    console.error('[admin-update-user] Error:', err);
    return NextResponse.json({ error: err.message || 'فشل في تحديث بيانات المستخدم' }, { status: 500 });
  }
}
