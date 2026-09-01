import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/utils/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const storeId = String(body?.storeId || '').trim();
    const firstName = String(body?.firstName || '').trim();
    const lastName = String(body?.lastName || '').trim();
    const email = String(body?.email || '').trim();
    const phone = String(body?.phone || '').trim();
    const address = String(body?.address || '').trim();
    const paymentMethod = body?.paymentMethod === 'card' ? 'card' : 'cod';
    const items = Array.isArray(body?.items) ? body.items : [];

    if (!storeId) {
      return NextResponse.json({ error: 'Missing store' }, { status: 400 });
    }
    if (!firstName || !email || !items.length) {
      return NextResponse.json({ error: 'Name, email, and cart items are required' }, { status: 400 });
    }

    const { adminDb } = await getFirebaseAdmin();
    if (!adminDb) {
      return NextResponse.json({ error: 'Orders are unavailable right now. Try again shortly.' }, { status: 500 });
    }

    const siteRef = adminDb.collection('published_sites').doc(storeId);
    const siteSnap = await siteRef.get();
    if (!siteSnap.exists) {
      return NextResponse.json({ error: 'This store is not published yet.' }, { status: 404 });
    }

    const site = siteSnap.data() || {};
    if (site.kind && site.kind !== 'store') {
      return NextResponse.json({ error: 'Not a store' }, { status: 400 });
    }

    const catalog = Array.isArray(site.products) ? site.products : [];
    const normalizedItems = items.map((item) => {
      const catalogMatch = catalog.find((p) => p.id === item.id) || {};
      const price = toNumber(catalogMatch.price != null ? catalogMatch.price : item.price);
      const qty = Math.max(1, Math.min(99, toNumber(item.qty) || 1));
      return {
        id: item.id || catalogMatch.id || '',
        name: catalogMatch.name || item.name || 'Product',
        price,
        qty,
        image: catalogMatch.image || item.image || ''
      };
    }).filter((item) => item.id && item.price >= 0);

    if (!normalizedItems.length) {
      return NextResponse.json({ error: 'No valid products in this order' }, { status: 400 });
    }

    const settings = site.settings || {};
    const subtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shipping = settings.freeShippingOver && subtotal >= toNumber(settings.freeShippingOver)
      ? 0
      : toNumber(settings.shippingFee);
    const tax = subtotal * (toNumber(settings.taxRate) / 100);
    const total = subtotal + shipping + tax;
    const currency = settings.currency || 'USD';
    const now = new Date();
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const customer = `${firstName} ${lastName}`.trim();

    const order = {
      id: orderId,
      storeId,
      ownerUid: site.ownerUid || '',
      customer,
      email,
      phone,
      address,
      paymentMethod,
      items: normalizedItems,
      productName: normalizedItems.map((item) => item.name).join(', '),
      amount: total,
      currency,
      subtotal,
      shipping,
      tax,
      status: paymentMethod === 'cod' ? 'Completed' : 'Pending payment',
      step: 'Checkout',
      transactionId: orderId,
      purchaseDate: now.toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      createdAt: now.toISOString()
    };

    await adminDb.collection('store_orders').doc(orderId).set(order);

    const existingSales = Array.isArray(site.sales) ? site.sales : [];
    await siteRef.set({
      sales: [order, ...existingSales].slice(0, 200),
      updatedAt: now.toISOString()
    }, { merge: true });

    return NextResponse.json({ ok: true, orderId, total, currency, status: order.status });
  } catch (err) {
    console.error('[stores/order]', err);
    return NextResponse.json({ error: err.message || 'Could not place order' }, { status: 500 });
  }
}
