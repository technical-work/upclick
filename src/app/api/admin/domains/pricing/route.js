import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin/verifyAdminRequest';
import { serializeTs } from '@/lib/domains/constants';
import { listPricing, refreshRegistrarCosts, toAdminPricing, upsertPricing, getSettings } from '@/lib/domains/pricing';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return auth.response;
  const settings = await getSettings(auth.adminDb);
  const rows = await listPricing(auth.adminDb);
  return NextResponse.json({
    settings,
    pricing: rows.map(toAdminPricing),
    namecheapConfigured: Boolean(process.env.NAMECHEAP_API_KEY)
  });
}

export async function PUT(req) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return auth.response;
  const body = await req.json().catch(() => ({}));

  if (body.settings) {
    await auth.adminDb.collection('domain_settings').doc('global').set({
      markup: Number(body.settings.markup),
      markup_type: body.settings.markup_type === 'percent' ? 'percent' : 'fixed',
      suggested_tlds: Array.isArray(body.settings.suggested_tlds) ? body.settings.suggested_tlds : undefined,
      currency: body.settings.currency || 'USD',
      updated_at: FieldValue.serverTimestamp()
    }, { merge: true });
  }

  if (body.extension) {
    const saved = await upsertPricing(auth.adminDb, body.extension, body);
    return NextResponse.json({ success: true, pricing: toAdminPricing(saved) });
  }

  if (body.refreshRegistrar) {
    try {
      const updated = await refreshRegistrarCosts(auth.adminDb);
      return NextResponse.json({ success: true, pricing: updated.map(toAdminPricing) });
    } catch (err) {
      return NextResponse.json({ error: err.message || 'Could not refresh registrar costs' }, { status: 502 });
    }
  }

  const settings = await getSettings(auth.adminDb);
  const rows = await listPricing(auth.adminDb);
  return NextResponse.json({ success: true, settings, pricing: rows.map(toAdminPricing) });
}
