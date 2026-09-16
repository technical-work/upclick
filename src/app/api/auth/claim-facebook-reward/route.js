import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/utils/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { uid } = await req.json();

    if (!uid) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
    }

    const { adminDb } = await getFirebaseAdmin();
    if (!adminDb) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 500 });
    }

    const userRef = adminDb.collection('users').doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userSnap.data();

    // Prevent duplicate claiming
    if (userData.facebookRewardClaimed) {
      return NextResponse.json({
        success: false,
        alreadyClaimed: true,
        message: 'Facebook group reward has already been claimed',
        currentCredits: userData.aiCredits || 0
      });
    }

    const currentCredits = Number(userData.aiCredits || 0);
    const rewardCredits = 200;
    const newTotal = currentCredits + rewardCredits;
    const now = new Date().toISOString();

    await userRef.update({
      facebookRewardClaimed: true,
      facebookRewardClaimedAt: now,
      aiCredits: FieldValue.increment(rewardCredits),
      initialCredits: FieldValue.increment(rewardCredits),
      updatedAt: now
    });

    console.log(`[claim-facebook-reward] Successfully granted +200 credits to user ${uid}. New balance: ${newTotal}`);

    return NextResponse.json({
      success: true,
      rewardCredits: rewardCredits,
      newTotalCredits: newTotal,
      message: 'Successfully claimed 200 AI credits for joining Facebook group'
    });
  } catch (error) {
    console.error('[claim-facebook-reward] Error processing reward:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
