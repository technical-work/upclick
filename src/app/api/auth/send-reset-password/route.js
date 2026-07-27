import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/utils/firebaseAdmin';
import emailService from '@/services/email';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { adminAuth } = getFirebaseAdmin();

    if (!adminAuth) {
      console.warn('[send-reset-password] Firebase Admin Auth is not initialized.');
      return NextResponse.json({ success: false, warning: 'Firebase Admin Auth is not initialized on server' }, { status: 200 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://upklick.net';
    const actionCodeSettings = {
      url: `${appUrl}/login`,
      handleCodeInApp: false
    };

    // Generate secure Firebase password reset link
    const resetLink = await adminAuth.generatePasswordResetLink(email, actionCodeSettings);

    // Send email using Resend via abstract email service
    const emailResult = await emailService.sendPasswordResetEmail({
      to: email,
      resetLink
    });

    if (!emailResult.success && !emailResult.simulated) {
      console.warn('[send-reset-password] Email send warning:', emailResult.error);
      return NextResponse.json({ success: false, warning: 'Failed to send password reset email', details: emailResult.error }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully',
      simulated: emailResult.simulated || false
    });
  } catch (error) {
    console.error('[send-reset-password] Server Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to process request' }, { status: 200 });
  }
}
