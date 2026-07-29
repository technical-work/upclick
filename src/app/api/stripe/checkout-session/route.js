import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirebaseAdmin } from '@/utils/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Fallback Sandbox Key (provided by user)
const FALLBACK_SECRET_KEY = "sk_test_51Tn0TnBiA9baLpm0Afb3XXZe8XSpPj4tlDAbpNEZl2cS2LXwHYy0xbtD1w13t92tJXw12Hm2wQPkDE2P95z6kEOm00lESlqpTH";

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
    const { amount, currency, planName, planDuration, userId, adminId, creditsToAdd } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { adminDb } = await getFirebaseAdmin();

    if (!adminDb) {
      return NextResponse.json({ 
        error: 'Firebase Admin SDK is not initialized. Please add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY variables to your .env.local file.' 
      }, { status: 500 });
    }

    let secretKey = FALLBACK_SECRET_KEY;

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

    const targetCurrency = mapCurrency(currency);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: targetCurrency,
            product_data: {
              name: planName || `${planDuration === 'annual' ? 'Annual' : 'Monthly'} Subscription`,
              description: `Subscription renewal - ${planDuration}`,
            },
            unit_amount: Math.round(amount * 100), // Stripe expects amount in cents/piastres
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/dashboard?stripe=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/dashboard?stripe=cancel`,
      metadata: {
        userId,
        adminId: adminId || '',
        amount: String(amount),
        currency: targetCurrency.toUpperCase(),
        planDuration: planDuration || 'monthly',
        creditsToAdd: creditsToAdd ? String(creditsToAdd) : '0',
        planName: planName || ''
      },
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
