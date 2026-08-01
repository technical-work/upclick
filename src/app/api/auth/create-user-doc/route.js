import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/utils/firebaseAdmin';

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

    // 1. Create/Update User document safely using Admin SDK
    await adminDb.collection('users').doc(uid).set({
      uid: uid,
      name: name || '',
      email: email,
      phoneNumber: phoneNumber || '',
      country: country || 'EG',
      role: 'user',
      lang: 'ar',
      theme: 'dark',
      onboardingDone: false,
      GC: userGC || {},
      isTrial: !!isTrial,
      trialStartedAt: trialStartedAt || null,
      aiCredits: isTrial ? (trialCredits !== undefined ? Number(trialCredits) : 500) : 0,
      adminId: 'global',
      createdAt: new Date().toISOString()
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
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    return NextResponse.json({ success: true, message: 'User document initialized successfully' });
  } catch (error) {
    console.error('[create-user-doc] Error initializing user doc:', error);
    return NextResponse.json({ success: false, fallbackRequired: true, error: error.message || 'Server error' }, { status: 200 });
  }
}
