import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirebaseAdmin } from '@/utils/firebaseAdmin';
import { resolveStripeSecret } from '@/lib/stripe/secret';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

function sanitizeUserFacingError(err) {
  const msg = (err?.message || String(err || '')).toLowerCase();
  
  if (
    msg.includes('unauthenticated') ||
    msg.includes('oauth 2') ||
    msg.includes('devconsole-project') ||
    msg.includes('invalid authentication credentials') ||
    msg.includes('firebase admin')
  ) {
    return 'خدمة الدفع بالبطاقة غير متوفرة مؤقتاً. يرجى المحاولة لاحقاً أو استخدام وسيلة دفع بديلة مثل انستاباي وفودافون كاش.';
  }

  if (msg.includes('api key') || msg.includes('not configured')) {
    return 'بوابة الدفع بالبطاقة غير مهيأة حالياً. يرجى التواصل مع إدارة المنصة أو اختيار وسيلة دفع أخرى.';
  }

  return err?.message || 'فشل إتمام طلب الدفع. يرجى المحاولة مرة أخرى.';
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

    let adminDb = null;
    try {
      const adminObj = await getFirebaseAdmin();
      adminDb = adminObj?.adminDb || null;
    } catch (adminErr) {
      console.warn('[Stripe Checkout] Firebase Admin initialization error (proceeding to fallback):', adminErr.message);
    }

    // Resolve Stripe Secret Key (checks Tenant doc -> Global doc -> Environment Variables)
    const secretKey = await resolveStripeSecret(adminDb, adminId);

    if (!secretKey) {
      return NextResponse.json({ 
        error: 'بوابة الدفع بالبطاقة غير مهيأة حالياً. يرجى التواصل مع إدارة المنصة أو الدفع عبر انستاباي / فودافون كاش.' 
      }, { status: 400 });
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
    });

    const targetCurrency = mapCurrency(currency);
    const sessionMode = explicitMode || (planDuration === 'one-time' || planDuration === 'recharge' ? 'payment' : 'payment');

    // Fetch user email if not provided directly
    let userEmail = customer_email || '';
    if (!userEmail && cleanUserId && adminDb) {
      try {
        const userSnap = await adminDb.collection('users').doc(cleanUserId).get();
        if (userSnap.exists) {
          userEmail = userSnap.data()?.email || '';
        }
      } catch (e) {
        console.warn('[Stripe Checkout] Could not fetch user email for Stripe checkout:', e.message);
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
    console.error('[Stripe Checkout Session Error]:', error);
    const friendlyError = sanitizeUserFacingError(error);
    return NextResponse.json({ error: friendlyError }, { status: 500 });
  }
}
