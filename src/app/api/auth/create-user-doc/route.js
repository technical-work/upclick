import { NextResponse } from 'next/server';
import { adminDb } from '@/utils/firebaseAdmin';

export async function POST(req) {
  try {
    const { uid, email, name, userGC, isTrial, trialStartedAt, cleanUsername, initialGC } = await req.json();

    if (!uid || !email) {
      return NextResponse.json({ error: 'Missing required user parameters' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Admin database not initialized' }, { status: 500 });
    }

    // 1. Create/Update User document safely using Admin SDK
    await adminDb.collection('users').doc(uid).set({
      uid: uid,
      name: name || '',
      email: email,
      role: 'user',
      lang: 'ar',
      theme: 'dark',
      onboardingDone: false,
      GC: userGC || {},
      isTrial: !!isTrial,
      trialStartedAt: trialStartedAt || null,
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
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
