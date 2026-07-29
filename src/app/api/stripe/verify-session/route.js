import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirebaseAdmin } from '@/utils/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FALLBACK_SECRET_KEY = "sk_test_51Tn0TnBiA9baLpm0Afb3XXZe8XSpPj4tlDAbpNEZl2cS2LXwHYy0xbtD1w13t92tJXw12Hm2wQPkDE2P95z6kEOm00lESlqpTH";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');
    const adminId = searchParams.get('adminId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const { adminDb } = await getFirebaseAdmin();

    if (!adminDb) {
      return NextResponse.json({ 
        error: 'Firebase Admin SDK is not initialized. Please add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY variables to your .env.local file.' 
      }, { status: 500 });
    }

    // Check if this session has already been verified to prevent double activations
    const alreadyVerifiedSnap = await adminDb.collection('payments')
      .where('stripeSessionId', '==', sessionId)
      .get();
      
    if (!alreadyVerifiedSnap.empty) {
      return NextResponse.json({ success: true, message: 'Already verified' });
    }

    let secretKey = FALLBACK_SECRET_KEY;

    if (adminId && adminId !== 'global') {
      const tenantDoc = await adminDb.collection('tenants').doc(adminId).get();
      if (tenantDoc.exists) {
        const data = tenantDoc.data();
        const stripeConfig = data.paymentMethods?.stripe;
        if (stripeConfig?.enabled && stripeConfig?.secretKey) {
          secretKey = stripeConfig.secretKey;
        }
      }
    }

    // Fallback to global config if no tenant key is found or adminId is global/missing
    if (secretKey === FALLBACK_SECRET_KEY) {
      const globalDoc = await adminDb.collection('tenants').doc('global').get();
      if (globalDoc.exists) {
        const data = globalDoc.data();
        const stripeConfig = data.paymentMethods?.stripe;
        if (stripeConfig?.enabled && stripeConfig?.secretKey) {
          secretKey = stripeConfig.secretKey;
        }
      }
    }

    // Fallback to environment variables if still using fallback key
    if (secretKey === FALLBACK_SECRET_KEY && process.env.STRIPE_SECRET_KEY) {
      secretKey = process.env.STRIPE_SECRET_KEY;
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const { userId, planDuration, amount, currency, creditsToAdd, planName } = session.metadata || {};

    // Fetch user details from Firestore
    const userRef = adminDb.collection('users').doc(userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userSnap.data();

    // Calculate new expiration date
    let baseDate = Date.now();
    let currentExpires = userData.expiresAt;
    
    if (currentExpires) {
      const currentMs = currentExpires.toDate 
        ? currentExpires.toDate().getTime() 
        : (currentExpires.seconds 
            ? currentExpires.seconds * 1000 
            : new Date(currentExpires).getTime());
            
      if (currentMs > Date.now()) {
        baseDate = currentMs;
      }
    }

    let isRecharge = planDuration === 'recharge';
    let daysToAdd = 30;
    if (planDuration === 'annual') daysToAdd = 365;
    else if (planDuration === 'one-time') daysToAdd = 9999;

    const newExpiresDate = new Date(baseDate);
    if (!isRecharge) {
      newExpiresDate.setDate(newExpiresDate.getDate() + daysToAdd);
    }

    let creditToAdd = 0;
    if (creditsToAdd && Number(creditsToAdd) > 0) {
      creditToAdd = Number(creditsToAdd);
    } else {
      // Fetch global settings to get the credit configuration for this plan
      const globalDoc = await adminDb.collection('tenants').doc('global').get();
      if (globalDoc.exists) {
        const globalData = globalDoc.data();
        if (planDuration === 'annual') {
          creditToAdd = globalData.creditAnnualPlan !== undefined ? Number(globalData.creditAnnualPlan) : 120.00;
        } else if (planDuration === 'one-time') {
          creditToAdd = globalData.creditLifetimePlan !== undefined ? Number(globalData.creditLifetimePlan) : 500.00;
        } else {
          creditToAdd = globalData.creditMonthlyPlan !== undefined ? Number(globalData.creditMonthlyPlan) : 10.00;
        }
      } else {
        // Fallback defaults
        if (planDuration === 'annual') creditToAdd = 120.00;
        else if (planDuration === 'one-time') creditToAdd = 500.00;
        else creditToAdd = 10.00;
      }
    }

    const userUpdates = {
      aiCredits: FieldValue.increment(creditToAdd)
    };
    if (!isRecharge) {
      userUpdates.expiresAt = newExpiresDate;
      userUpdates.isTrial = false;
      userUpdates.plan = planName || (planDuration === 'annual' ? 'Pro Annual' : (planDuration === 'one-time' ? 'Pro Lifetime' : 'Pro Monthly'));
    }

    // Update user document to set expiresAt and turn isTrial to false
    await userRef.set(userUpdates, { merge: true });

    // Log the payment in the 'payments' collection
    await adminDb.collection('payments').add({
      userId,
      userName: userData.name || userData.email?.split('@')[0] || 'User',
      userEmail: userData.email || '',
      adminId: userData.adminId || null,
      amount: parseFloat(amount),
      currency: currency || 'EGP',
      paymentMethod: 'stripe',
      planDuration: planDuration || 'monthly',
      receiptUrl: session.invoice ? `https://billing.stripe.com/p/invoices/${session.invoice}` : '',
      status: 'approved',
      approvedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      stripeSessionId: sessionId
    });

    // Log the sale in the 'sales' collection
    await adminDb.collection('sales').add({
      userId,
      customerName: userData.name || userData.email?.split('@')[0] || 'User',
      amount: parseFloat(amount),
      adminId: userData.adminId || null,
      createdAt: FieldValue.serverTimestamp()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Stripe verification session error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
