import { NextResponse } from 'next/server';
import { adminAuth } from '@/utils/firebaseAdmin';
import emailService from '@/services/email';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!adminAuth) {
      console.error('[send-reset-password] Firebase Admin Auth is not initialized.');
      return NextResponse.json({ error: 'Firebase Admin Auth is not initialized on server' }, { status: 500 });
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
      console.error('[send-reset-password] Email send failed:', emailResult.error);
      return NextResponse.json({ error: 'Failed to send password reset email', details: emailResult.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully',
      simulated: emailResult.simulated || false
    });
  } catch (error) {
    console.error('[send-reset-password] Server Error:', error);
    // Standardize error message for safety (e.g. user not found)
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 });
  }
}
