import Stripe from 'stripe';

export async function resolveStripeSecret(adminDb, adminId) {
  let secretKey = '';
  if (adminId && adminId !== 'global') {
    const tenantDoc = await adminDb.collection('tenants').doc(adminId).get();
    if (tenantDoc.exists) {
      const stripeConfig = tenantDoc.data()?.paymentMethods?.stripe;
      if (stripeConfig?.enabled && stripeConfig?.secretKey) secretKey = stripeConfig.secretKey;
    }
  }
  if (!secretKey) {
    const globalDoc = await adminDb.collection('tenants').doc('global').get();
    if (globalDoc.exists) {
      const stripeConfig = globalDoc.data()?.paymentMethods?.stripe;
      if (stripeConfig?.enabled && stripeConfig?.secretKey) secretKey = stripeConfig.secretKey;
    }
  }
  if (!secretKey && process.env.STRIPE_SECRET_KEY) secretKey = process.env.STRIPE_SECRET_KEY;
  return secretKey;
}

export function stripeClient(secretKey) {
  return new Stripe(secretKey, { apiVersion: '2023-10-16' });
}
