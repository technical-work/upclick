import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/utils/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { email, code, newPassword } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 });
    }

    if (!code || code.trim().length !== 6) {
      return NextResponse.json({ error: 'رمز التحقق يجب أن يتكون من 6 أرقام' }, { status: 400 });
    }

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'كلمة المرور الجديدة يجب أن تحتوي على 6 أحرف على الأقل' }, { status: 400 });
    }

    const { adminAuth, adminDb } = await getFirebaseAdmin();

    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: 'سيرفر إعادة تعيين كلمة المرور غير مهيأ' }, { status: 500 });
    }

    // 1. Get user by email from Firebase Auth
    let userRecord = null;
    try {
      userRecord = await adminAuth.getUserByEmail(email);
    } catch (e) {
      return NextResponse.json({ error: 'لم يتم العثور على حساب مرتبط بهذا البريد الإلكتروني' }, { status: 404 });
    }

    const targetUid = userRecord.uid;

    // 2. Fetch user doc from Firestore
    const userDocRef = adminDb.collection('users').doc(targetUid);
    const userSnap = await userDocRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'بيانات الحساب غير موجودة' }, { status: 404 });
    }

    const userData = userSnap.data();
    const storedCode = userData.resetPasswordCode;
    const expiresAt = userData.resetPasswordExpires;

    // 3. Validate Code and Expiration
    if (!storedCode || storedCode.trim() !== code.trim()) {
      return NextResponse.json({ error: 'رمز إعادة التعيين غير صحيح' }, { status: 400 });
    }

    if (expiresAt && new Date(expiresAt) < new Date()) {
      return NextResponse.json({ error: 'انتهت صلاحية رمز التعيين. يرجى طلب رمز جديد' }, { status: 400 });
    }

    // 4. Update Password in Firebase Auth & Clear Code in Firestore
    await adminAuth.updateUser(targetUid, { password: newPassword });
    await userDocRef.update({
      resetPasswordCode: null,
      resetPasswordExpires: null,
      passwordChangedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بحسابك الجديد.'
    });
  } catch (error) {
    console.error('[reset-password-with-code] Error:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء تغيير كلمة المرور' }, { status: 500 });
  }
}
