import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/utils/firebaseAdmin';
import emailService from '@/services/email';
import { creditFieldsForNewUser } from '@/lib/credits/buckets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { uid, email, name, phoneNumber, country, userGC, isTrial, trialStartedAt, trialCredits, cleanUsername, initialGC } = await req.json();

    if (!uid || !email) {
      return NextResponse.json({ error: 'Missing required user parameters' }, { status: 400 });
    }

    const { adminDb } = await getFirebaseAdmin();

    if (!adminDb) {
      console.warn('[create-user-doc] Admin DB not initialized. Client fallback will handle it.');
      return NextResponse.json({ success: false, fallbackRequired: true, warning: 'Admin DB not initialized' }, { status: 200 });
    }

    const now = new Date().toISOString();
    const effectiveTrialStartedAt = trialStartedAt || now;
    const startingCredits = isTrial
      ? (trialCredits !== undefined ? Number(trialCredits) : 500)
      : 500;
    const creditFields = creditFieldsForNewUser(startingCredits);

    // 1. Create/Update User document safely using Admin SDK
    await adminDb.collection('users').doc(uid).set({
      uid: uid,
      name: name || '',
      email: email,
      phoneNumber: phoneNumber || '',
      country: country || 'EG',
      role: 'user',
      roleCategory: 'user',
      isTeamMember: false,
      lang: 'ar',
      theme: 'dark',
      onboardingDone: false,
      GC: userGC || {},
      isTrial: isTrial !== undefined ? !!isTrial : true,
      trialStartedAt: effectiveTrialStartedAt,
      trialWelcomeEmailSent: true,
      trial7DaysEmailSent: false,
      trialEndedEmailSent: false,
      aiCredits: startingCredits,
      ...creditFields,
      adminId: 'global',
      createdAt: now
    }, { merge: true });

    // 2. Create Bio Link document safely using Admin SDK
    if (cleanUsername) {
      await adminDb.collection('bio_links').doc(cleanUsername).set({
        ownerUid: uid,
        displayName: name || '',
        bioTagline: initialGC?.bioLink?.bioTagline || 'Coach | Entrepreneur | Content Creator 🚀',
        username: cleanUsername,
        bioTheme: initialGC?.bioLink?.bioTheme || 'dark',
        layout: 'classic',
        font: 'Tajawal',
        avatarUrl: '',
        links: initialGC?.bioLink?.links || [],
        socials: initialGC?.bioLink?.socials || {},
        cvEnabled: false,
        lang: 'ar',
        cvSections: { experience: [], education: [], skills: [] },
        updatedAt: now
      }, { merge: true });
    }

    // 3. Send Trial Email 1 — Welcome Email via Resend asynchronously
    try {
      await emailService.sendTrialWelcomeEmail({
        to: email,
        name: name || ''
      });
      console.log(`[create-user-doc] Trial Welcome Email successfully sent to ${email}`);
    } catch (emailErr) {
      console.error('[create-user-doc] Error sending Trial Welcome Email:', emailErr);
    }

    return NextResponse.json({ success: true, message: 'User document initialized and Welcome email sent successfully' });
  } catch (error) {
    console.error('[create-user-doc] Error initializing user doc:', error);
    return NextResponse.json({ success: false, fallbackRequired: true, error: error.message || 'Server error' }, { status: 200 });
  }
}

