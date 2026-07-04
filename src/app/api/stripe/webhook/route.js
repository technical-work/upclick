import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/utils/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const FALLBACK_SECRET_KEY = "sk_test_51Tn0TnBiA9baLpm0Afb3XXZe8XSpPj4tlDAbpNEZl2cS2LXwHYy0xbtD1w13t92tJXw12Hm2wQPkDE2P95z6kEOm00lESlqpTH";
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  let secretKey = FALLBACK_SECRET_KEY;
  let stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' });

  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin SDK not initialized' }, { status: 500 });
    }

    let event;

    // Verify webhook signature in production if secret is provided
    if (WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
    } else {
      // Direct parse for local testing if STRIPE_WEBHOOK_SECRET is empty
      event = JSON.parse(body);
      console.warn('⚠️ Webhook Signature verification skipped. Define STRIPE_WEBHOOK_SECRET in production.');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      if (session.payment_status === 'paid') {
        const { userId, planDuration, amount, currency, adminId } = session.metadata || {};

        if (!userId) {
          console.error('❌ Webhook error: Missing userId in session metadata');
          return NextResponse.json({ error: 'Missing userId in metadata' }, { status: 400 });
        }

        // Fetch custom key if adminId is provided
        if (adminId) {
          const tenantDoc = await adminDb.collection('tenants').doc(adminId).get();
          if (tenantDoc.exists) {
            const data = tenantDoc.data();
            const stripeConfig = data.paymentMethods?.stripe;
            if (stripeConfig?.enabled && stripeConfig?.secretKey) {
              secretKey = stripeConfig.secretKey;
              stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' });
            }
          }
        }

        // Prevent double activations (check if payment record exists)
        const alreadyVerifiedSnap = await adminDb.collection('payments')
          .where('stripeSessionId', '==', session.id)
          .get();

        if (!alreadyVerifiedSnap.empty) {
          console.log(`ℹ️ Session ${session.id} already verified. Skipping webhook activation.`);
          return NextResponse.json({ success: true, message: 'Already processed' });
        }

        // Fetch user details
        const userRef = adminDb.collection('users').doc(userId);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
          console.error(`❌ Webhook error: User ${userId} not found`);
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

        let daysToAdd = 30;
        if (planDuration === 'annual') daysToAdd = 365;
        else if (planDuration === 'one-time') daysToAdd = 9999;

        const newExpiresDate = new Date(baseDate);
        newExpiresDate.setDate(newExpiresDate.getDate() + daysToAdd);

        // Fetch global settings to get the credit configuration for this plan
        const globalDoc = await adminDb.collection('tenants').doc('global').get();
        let creditToAdd = 0;
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

        const currentUserCredits = userData.aiCredits !== undefined ? Number(userData.aiCredits) : 0;

        // Update user subscription state
        await userRef.set({
          expiresAt: newExpiresDate,
          isTrial: false,
          aiCredits: currentUserCredits + creditToAdd
        }, { merge: true });

        // Add payment document to collection
        await adminDb.collection('payments').add({
          userId,
          userName: userData.name || userData.email?.split('@')[0] || 'User',
          userEmail: userData.email || '',
          adminId: userData.adminId || null,
          amount: parseFloat(amount || 0),
          currency: currency || 'EGP',
          paymentMethod: 'stripe',
          planDuration: planDuration || 'monthly',
          receiptUrl: session.invoice ? `https://billing.stripe.com/p/invoices/${session.invoice}` : '',
          status: 'approved',
          approvedAt: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
          stripeSessionId: session.id
        });

        // Add sale document to collection
        await adminDb.collection('sales').add({
          userId,
          customerName: userData.name || userData.email?.split('@')[0] || 'User',
          amount: parseFloat(amount || 0),
          adminId: userData.adminId || null,
          createdAt: FieldValue.serverTimestamp()
        });

        console.log(`✅ Webhook success: User ${userId} subscription activated successfully via Stripe.`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error handler:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
