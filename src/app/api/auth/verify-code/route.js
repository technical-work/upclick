import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/utils/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { email, uid, code } = await req.json();

    if (!code || code.trim().length !== 6) {
      return NextResponse.json({ error: 'رمز التحقق يجب أن يتكون من 6 أرقام' }, { status: 400 });
    }

    const { adminAuth, adminDb } = await getFirebaseAdmin();

    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: 'سيرفر تفعيل الحسابات غير مهيأ' }, { status: 500 });
    }

    let targetUid = uid;
    if (!targetUid && email) {
      try {
        const userRecord = await adminAuth.getUserByEmail(email);
        targetUid = userRecord.uid;
      } catch (e) {
        console.error('[verify-code] User not found by email:', e);
      }
    }

    if (!targetUid) {
      return NextResponse.json({ error: 'لم يتم العثور على حساب بهذا البريد' }, { status: 404 });
    }

    // 1. Fetch user doc from Firestore
    const userDocRef = adminDb.collection('users').doc(targetUid);
    const userSnap = await userDocRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'بيانات الحساب غير موجودة' }, { status: 404 });
    }

    const userData = userSnap.data();
    const storedCode = userData.emailVerificationCode;
    const expiresAt = userData.emailVerificationExpires;

    // 2. Validate Code and Expiration
    if (!storedCode || storedCode.trim() !== code.trim()) {
      return NextResponse.json({ error: 'رمز التحقق غير صحيح' }, { status: 400 });
    }

    if (expiresAt && new Date(expiresAt) < new Date()) {
      return NextResponse.json({ error: 'انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد' }, { status: 400 });
    }

    // 3. Mark User as Verified in Firebase Auth & Firestore
    await adminAuth.updateUser(targetUid, { emailVerified: true });
    await userDocRef.update({
      emailVerified: true,
      emailVerificationCode: null,
      emailVerificationExpires: null,
      verifiedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'تم تفعيل الحساب بنجاح!'
    });
  } catch (error) {
    console.error('[verify-code] Error:', error);
    return NextResponse.json({ error: error.message || 'حدث خطأ أثناء تفعيل الحساب' }, { status: 500 });
  }
}
