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
      try {
        event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
      } catch (err) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
      }
    } else {
      // Direct parse for local testing if STRIPE_WEBHOOK_SECRET is empty
      event = JSON.parse(body);
      console.warn('⚠️ Webhook Signature verification skipped. Define STRIPE_WEBHOOK_SECRET in production.');
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required' || session.status === 'complete') {
        const metadata = session.metadata || {};

        // 1. Resolve userId from session metadata, client_reference_id, subscription metadata, or customer email
        let userId = metadata.userId || metadata.user_id || metadata.uid || session.client_reference_id || '';

        // 2. If not found and subscription exists, try reading subscription metadata
        if (!userId && session.subscription) {
          if (typeof session.subscription === 'object' && session.subscription?.metadata) {
            userId = session.subscription.metadata.userId || session.subscription.metadata.user_id || session.subscription.metadata.uid || '';
          } else if (typeof session.subscription === 'string' && secretKey) {
            try {
              const sub = await stripe.subscriptions.retrieve(session.subscription);
              userId = sub?.metadata?.userId || sub?.metadata?.user_id || sub?.metadata?.uid || '';
            } catch (e) {
              console.warn('Could not retrieve subscription metadata for user lookup:', e.message);
            }
          }
        }

        // 3. If still not found, try fallback lookup by customer email in Firestore
        if (!userId) {
          const customerEmail = (session.customer_details?.email || session.customer_email || '').trim().toLowerCase();
          if (customerEmail) {
            try {
              const userEmailSnap = await adminDb.collection('users').where('email', '==', customerEmail).limit(1).get();
              if (!userEmailSnap.empty) {
                userId = userEmailSnap.docs[0].id;
                console.log(`ℹ️ Resolved userId ${userId} from customer email ${customerEmail}`);
              }
            } catch (e) {
              console.warn('Could not query user by email:', e.message);
            }
          }
        }

        if (!userId) {
          console.error('❌ Webhook error: Missing userId in session metadata, subscription metadata, and client_reference_id');
          return NextResponse.json({ error: 'Missing userId in metadata' }, { status: 400 });
        }

        const adminId = metadata.adminId || '';
        const planDuration = metadata.planDuration || (session.mode === 'subscription' ? 'monthly' : 'monthly');
        const creditsToAdd = metadata.creditsToAdd || '0';
        const planName = metadata.planName || '';
        const amount = parseFloat(metadata.amount || (session.amount_total ? session.amount_total / 100 : 0));
        const currency = (metadata.currency || session.currency || 'USD').toUpperCase();

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
        const webhookRef = adminDb.collection('processed_webhooks').doc(event.id || `evt_${session.id}`);
        const sessionLockRef = adminDb.collection('processed_webhooks').doc(`session_${session.id}`);

        try {
          await adminDb.runTransaction(async (transaction) => {
            // 1. Check if Stripe Webhook event or session was already processed (strict idempotency)
            const [webhookSnap, sessionLockSnap] = await Promise.all([
              transaction.get(webhookRef),
              transaction.get(sessionLockRef)
            ]);

            if (webhookSnap.exists || sessionLockSnap.exists) {
              throw new Error('already_processed');
            }

            // 2. Fetch user details inside transaction
            const userSnap = await transaction.get(userRef);
            if (!userSnap.exists) {
              throw new Error('user_not_found');
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
              userId: userId,
              eventId: event.id
            });
            transaction.set(sessionLockRef, {
              processedAt: FieldValue.serverTimestamp(),
              stripeSessionId: session.id,
              userId: userId,
              eventId: event.id
            });

            // Add payment document to collection inside transaction
            const paymentRef = adminDb.collection('payments').doc();
            transaction.set(paymentRef, {
              userId,
              userName: userData.name || userData.email?.split('@')[0] || 'User',
              userEmail: userData.email || '',
              adminId: userData.adminId || null,
              amount: amount,
              currency: currency,
              paymentMethod: 'stripe',
              planDuration: planDuration,
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
              amount: amount,
              adminId: userData.adminId || null,
              createdAt: FieldValue.serverTimestamp()
            });
          });

          console.log(`✅ Webhook success: User ${userId} subscription activated successfully via Stripe.`);
        } catch (txError) {
          if (txError.message === 'already_processed') {
            console.log(`ℹ️ Webhook event ${event.id} (Session ${session.id}) already processed. Skipping duplicate activation.`);
            return NextResponse.json({ success: true, message: 'Already processed' });
          }
          if (txError.message === 'user_not_found') {
            console.error(`❌ Webhook error: User ${userId} not found`);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
          }
          throw txError;
        }
      }
    } else if (event.type === 'invoice.payment_succeeded') {
      // Handle automatic recurring subscription renewal
      const invoice = event.data.object;
      if (invoice.billing_reason === 'subscription_cycle') {
        const subId = invoice.subscription;
        let userId = invoice.subscription_details?.metadata?.userId || invoice.lines?.data?.[0]?.metadata?.userId || '';

        if (!userId && subId && secretKey) {
          try {
            const sub = await stripe.subscriptions.retrieve(subId);
            userId = sub?.metadata?.userId || '';
          } catch (e) {
            console.warn('Could not retrieve subscription for recurring invoice:', e.message);
          }
        }

        if (userId) {
          const userRef = adminDb.collection('users').doc(userId);
          const webhookRef = adminDb.collection('processed_webhooks').doc(event.id);

          try {
            await adminDb.runTransaction(async (transaction) => {
              const webhookSnap = await transaction.get(webhookRef);
              if (webhookSnap.exists) throw new Error('already_processed');

              const userSnap = await transaction.get(userRef);
              if (!userSnap.exists) throw new Error('user_not_found');
              const userData = userSnap.data();

              let baseDate = Date.now();
              if (userData.expiresAt) {
                const currentMs = userData.expiresAt.toDate ? userData.expiresAt.toDate().getTime() : new Date(userData.expiresAt).getTime();
                if (currentMs > Date.now()) baseDate = currentMs;
              }
              const newExpiresDate = new Date(baseDate);
              newExpiresDate.setDate(newExpiresDate.getDate() + 30);

              transaction.set(userRef, {
                expiresAt: newExpiresDate,
                isTrial: false
              }, { merge: true });

              transaction.set(webhookRef, {
                processedAt: FieldValue.serverTimestamp(),
                invoiceId: invoice.id,
                userId: userId
              });
            });
            console.log(`✅ Webhook success: User ${userId} subscription renewed via invoice ${invoice.id}.`);
          } catch (err) {
            if (err.message !== 'already_processed') {
              console.error('❌ Error renewing subscription on invoice.payment_succeeded:', err);
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error handler:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
