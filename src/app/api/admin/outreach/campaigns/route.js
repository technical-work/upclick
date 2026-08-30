import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { verifyAdminRequest } from '@/lib/admin/verifyAdminRequest';
import { whatsappStatus } from '@/services/whatsapp/TwilioWhatsAppProvider';
import { normalizeCampaignInput, serializeCampaign } from '@/lib/outreach/campaigns';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handleGet(req) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.ok) return auth.response;

    let snap;
    try {
      snap = await auth.adminDb.collection('campaigns').orderBy('createdAt', 'desc').limit(50).get();
    } catch (err) {
      console.warn('[outreach/campaigns GET] falling back without orderBy', err.message);
      snap = await auth.adminDb.collection('campaigns').limit(50).get();
    }

    return NextResponse.json({
      success: true,
      campaigns: snap.docs.map(serializeCampaign),
      whatsapp: whatsappStatus()
    });
  } catch (err) {
    console.error('[outreach/campaigns GET]', err);
    return NextResponse.json({ error: err.message || 'Failed to list campaigns' }, { status: 500 });
  }
}

async function handlePost(req) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const normalized = normalizeCampaignInput(body, { requireContent: false });
    if (normalized.error) {
      return NextResponse.json({ error: normalized.error }, { status: 400 });
    }

    const ref = await auth.adminDb.collection('campaigns').add({
      ...normalized.data,
      status: 'draft',
      previewCount: Number(body.previewCount) || 0,
      total: 0,
      pending: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      testSentAt: null,
      scheduledAt: null,
      createdBy: { uid: auth.uid, email: auth.email },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    const snap = await ref.get();
    return NextResponse.json({ success: true, campaign: serializeCampaign(snap) });
  } catch (err) {
    console.error('[outreach/campaigns POST]', err);
    return NextResponse.json({ error: err.message || 'Failed to create campaign' }, { status: 500 });
  }
}

export const GET = handleGet;
export const POST = handlePost;
