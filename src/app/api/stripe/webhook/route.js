import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirebaseAdmin } from '@/utils/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// No fallback key for security. Must be configured in Firestore or environment variables.
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  let secretKey = process.env.STRIPE_SECRET_KEY || '';

  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const { adminDb } = await getFirebaseAdmin();

    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin SDK not initialized' }, { status: 500 });
    }

    // Try to load the global secretKey if not loaded from env
    if (!secretKey) {
      const globalDoc = await adminDb.collection('tenants').doc('global').get();
      if (globalDoc.exists) {
        const data = globalDoc.data();
        const stripeConfig = data.paymentMethods?.stripe;
        if (stripeConfig?.enabled && stripeConfig?.secretKey) {
          secretKey = stripeConfig.secretKey;
        }
      }
    }

    // Use a placeholder if no key is configured to construct Stripe instance safely
    let stripe = new Stripe(secretKey || 'no_key_configured', { apiVersion: '2023-10-16' });

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
        const { userId, planDuration, amount, currency, adminId, creditsToAdd, planName } = session.metadata || {};

        if (!userId) {
          console.error('❌ Webhook error: Missing userId in session metadata');
          return NextResponse.json({ error: 'Missing userId in metadata' }, { status: 400 });
        }

        // Fetch custom key if adminId is provided
        if (adminId && adminId !== 'global') {
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

        // Fallback to global config if no tenant key is found or adminId is global/missing
        if (!secretKey) {
          const globalDoc = await adminDb.collection('tenants').doc('global').get();
          if (globalDoc.exists) {
            const data = globalDoc.data();
            const stripeConfig = data.paymentMethods?.stripe;
            if (stripeConfig?.enabled && stripeConfig?.secretKey) {
              secretKey = stripeConfig.secretKey;
              stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' });
            }
          }
        }

        // Fallback to environment variables if still not found
        if (!secretKey && process.env.STRIPE_SECRET_KEY) {
          secretKey = process.env.STRIPE_SECRET_KEY;
          stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' });
        }

        // Fetch user details
        const userRef = adminDb.collection('users').doc(userId);
        const webhookRef = adminDb.collection('processed_webhooks').doc(event.id || 'missing_event_id');

        try {
          await adminDb.runTransaction(async (transaction) => {
            // 1. Check if Stripe Webhook event was already processed
            const webhookSnap = await transaction.get(webhookRef);
            if (webhookSnap.exists) {
              throw new Error('already_processed');
            }

            // 2. Fetch user details inside transaction
            const userSnap = await transaction.get(userRef);
            if (!userSnap.exists) {
              throw new Error('user_not_found');
            }
            const userData = userSnap.data();

            // 3. Check if Stripe session payment has already been credited
            // Since queries are not allowed in transaction reads directly without locks,
            // the primary lock is done on the webhookRef event.id. We can do a final double-check here.
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
              // Fallback to global configurations
              const globalDocRef = adminDb.collection('tenants').doc('global');
              const globalSnap = await transaction.get(globalDocRef);
              const globalData = globalSnap.exists ? globalSnap.data() : {};

              if (planDuration === 'annual') {
                creditToAdd = globalData.creditAnnualPlan !== undefined ? Number(globalData.creditAnnualPlan) : 120.00;
              } else if (planDuration === 'one-time') {
                creditToAdd = globalData.creditLifetimePlan !== undefined ? Number(globalData.creditLifetimePlan) : 500.00;
              } else {
                creditToAdd = globalData.creditMonthlyPlan !== undefined ? Number(globalData.creditMonthlyPlan) : 10.00;
              }
            }

            const currentUserCredits = userData.aiCredits !== undefined ? Number(userData.aiCredits) : 0;

            const userUpdates = {
              aiCredits: currentUserCredits + creditToAdd
            };
            if (!isRecharge) {
              userUpdates.expiresAt = newExpiresDate;
              userUpdates.isTrial = false;
              userUpdates.plan = planName || (planDuration === 'annual' ? 'Pro Annual' : (planDuration === 'one-time' ? 'Pro Lifetime' : 'Pro Monthly'));
            }

            // Update user subscription state inside transaction
            transaction.set(userRef, userUpdates, { merge: true });

            // Record webhook event to processed_webhooks collection to ensure idempotency
            transaction.set(webhookRef, {
              processedAt: FieldValue.serverTimestamp(),
              stripeSessionId: session.id,
              userId: userId
            });

            // Add payment document to collection inside transaction
            const paymentRef = adminDb.collection('payments').doc();
            transaction.set(paymentRef, {
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

            // Add sale document to collection inside transaction
            const salesRef = adminDb.collection('sales').doc();
            transaction.set(salesRef, {
              userId,
              customerName: userData.name || userData.email?.split('@')[0] || 'User',
              amount: parseFloat(amount || 0),
              adminId: userData.adminId || null,
              createdAt: FieldValue.serverTimestamp()
            });
          });

          console.log(`✅ Webhook success: User ${userId} subscription activated successfully via Stripe.`);
        } catch (txError) {
          if (txError.message === 'already_processed') {
            console.log(`ℹ️ Webhook event ${event.id} (Session ${session.id}) already processed. Skipping webhook activation.`);
            return NextResponse.json({ success: true, message: 'Already processed' });
          }
          if (txError.message === 'user_not_found') {
            console.error(`❌ Webhook error: User ${userId} not found`);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
          }
          throw txError;
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error handler:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
