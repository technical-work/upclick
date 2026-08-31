import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirebaseAdmin } from '@/utils/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// No fallback key for security. Must be configured in Firestore or environment variables.

function mapCurrency(currencyInput) {
  if (!currencyInput) return 'egp';
  const clean = currencyInput.trim().toUpperCase();
  if (clean === '$' || clean === 'USD') return 'usd';
  if (clean === 'ج.م' || clean === 'EGP') return 'egp';
  if (clean === 'ر.س' || clean === 'SAR') return 'sar';
  if (clean === 'د.إ' || clean === 'AED') return 'aed';
  if (clean === '€' || clean === 'EUR') return 'eur';
  if (clean === '£' || clean === 'GBP') return 'gbp';
  return currencyInput.length === 3 ? currencyInput.toLowerCase() : 'egp';
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      amount,
      currency,
      planName,
      planDuration,
      userId,
      adminId,
      creditsToAdd,
      mode: explicitMode,
      customer_email
    } = body;

    const cleanUserId = String(userId || '').trim();
    if (!cleanUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { adminDb } = await getFirebaseAdmin();

    if (!adminDb) {
      return NextResponse.json({ 
        error: 'Firebase Admin SDK is not initialized. Please add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY variables to your .env.local file.' 
      }, { status: 500 });
    }

    let secretKey = '';

    // Fetch custom secret key from tenant config if configured
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

    // Fallback to environment variables if still not found
    if (!secretKey && process.env.STRIPE_SECRET_KEY) {
      secretKey = process.env.STRIPE_SECRET_KEY;
    }

    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe API key is not configured. Please set it in the admin panel.' }, { status: 400 });
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
    });

    const targetCurrency = mapCurrency(currency);
    const sessionMode = explicitMode || (planDuration === 'one-time' || planDuration === 'recharge' ? 'payment' : 'payment');

    // Fetch user email if not provided directly
    let userEmail = customer_email || '';
    if (!userEmail && cleanUserId) {
      try {
        const userSnap = await adminDb.collection('users').doc(cleanUserId).get();
        if (userSnap.exists) {
          userEmail = userSnap.data()?.email || '';
        }
      } catch (e) {
        console.warn('Could not fetch user email for Stripe checkout:', e.message);
      }
    }

    const metadata = {
      userId: cleanUserId,
      adminId: String(adminId || ''),
      amount: String(amount || ''),
      currency: targetCurrency.toUpperCase(),
      planDuration: String(planDuration || 'monthly'),
      creditsToAdd: creditsToAdd ? String(creditsToAdd) : '0',
      planName: String(planName || '')
    };

    const sessionParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: targetCurrency,
            product_data: {
              name: planName || `${planDuration === 'annual' ? 'Annual' : 'Monthly'} Subscription`,
              description: `Subscription renewal - ${planDuration || 'monthly'}`,
            },
            unit_amount: Math.round(Number(amount) * 100), // Stripe expects amount in cents/piastres
            ...(sessionMode === 'subscription' ? { recurring: { interval: planDuration === 'annual' ? 'year' : 'month' } } : {})
          },
          quantity: 1,
        },
      ],
      mode: sessionMode,
      client_reference_id: cleanUserId,
      success_url: `${req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://upklick.net'}/dashboard?stripe=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://upklick.net'}/dashboard?stripe=cancel`,
      metadata: metadata,
    };

    if (userEmail) {
      sessionParams.customer_email = userEmail;
    }

    if (sessionMode === 'subscription') {
      sessionParams.subscription_data = {
        metadata: {
          userId: cleanUserId,
          adminId: String(adminId || ''),
          planDuration: String(planDuration || 'monthly'),
          creditsToAdd: creditsToAdd ? String(creditsToAdd) : '0',
          planName: String(planName || '')
        }
      };
    } else {
      sessionParams.payment_intent_data = {
        metadata: {
          userId: cleanUserId,
          adminId: String(adminId || ''),
          planDuration: String(planDuration || 'monthly'),
          creditsToAdd: creditsToAdd ? String(creditsToAdd) : '0',
          planName: String(planName || '')
        }
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
