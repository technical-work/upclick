import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/utils/firebaseAdmin';
import emailService from '@/services/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 });
    }

    const { adminAuth, adminDb } = await getFirebaseAdmin();

    // 1. Generate 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry

    let userName = '';
    let targetUid = null;

    if (adminAuth) {
      try {
        const userRecord = await adminAuth.getUserByEmail(email);
        targetUid = userRecord.uid;
        userName = userRecord.displayName || '';
      } catch (uErr) {
        console.warn('[send-reset-password] User not found in Firebase Auth:', uErr.message);
      }
    }

    // Save OTP code in Firestore user doc safely
    if (targetUid && adminDb) {
      try {
        await adminDb.collection('users').doc(targetUid).set({
          resetPasswordCode: code,
          resetPasswordExpires: expiresAt
        }, { merge: true });
      } catch (dbErr) {
        console.warn('[send-reset-password] Could not save code in adminDb:', dbErr.message);
      }
    }

    // 2. Generate fallback Firebase password reset link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://upklick.net';
    let resetLink = '';
    if (adminAuth) {
      try {
        resetLink = await adminAuth.generatePasswordResetLink(email, {
          url: `${appUrl}/login`,
          handleCodeInApp: false
        });
      } catch (lErr) {
        console.warn('[send-reset-password] Action link error:', lErr.message);
      }
    }

    // 3. Send email via Resend
    const emailResult = await emailService.sendPasswordResetEmail({
      to: email,
      name: userName,
      code,
      resetLink
    });

    if (!emailResult.success && !emailResult.simulated) {
      console.warn('[send-reset-password] Email send warning:', emailResult.error);
      return NextResponse.json({ success: false, warning: 'Failed to send password reset email', details: emailResult.error }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset code sent successfully',
      simulated: emailResult.simulated || false
    });
  } catch (error) {
    console.error('[send-reset-password] Server Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to process request' }, { status: 200 });
  }
}
