import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { verifyAdminRequest } from '@/lib/admin/verifyAdminRequest';
import { serializeCampaign, normalizeCampaignInput } from '@/lib/outreach/campaigns';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing campaign id' }, { status: 400 });

  const snap = await auth.adminDb.collection('campaigns').doc(id).get();
  if (!snap.exists) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

  const statusFilter = req.nextUrl.searchParams.get('recipientStatus') || '';
  const limit = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get('limit') || 20)));
  let recQuery = auth.adminDb.collection('campaigns').doc(id).collection('recipients').limit(limit);
  if (statusFilter) {
    recQuery = auth.adminDb.collection('campaigns').doc(id).collection('recipients')
      .where('status', '==', statusFilter)
      .limit(limit);
  }

  const recSnap = await recQuery.get();
  const recipients = recSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return NextResponse.json({
    success: true,
    campaign: serializeCampaign(snap),
    recipients
  });
}

export async function PATCH(req, { params }) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing campaign id' }, { status: 400 });

  const ref = auth.adminDb.collection('campaigns').doc(id);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

  const current = snap.data() || {};
  const body = await req.json();
  const action = String(body.action || '').toLowerCase();

  if (action === 'cancel' || action === 'abort') {
    if (['completed', 'cancelled'].includes(current.status)) {
      return NextResponse.json({ error: 'Campaign already finished' }, { status: 400 });
    }
    await ref.set({
      status: 'cancelled',
      cancelledAt: FieldValue.serverTimestamp(),
      cancelledBy: auth.uid,
      lockId: FieldValue.delete(),
      lockExpiresAt: FieldValue.delete()
    }, { merge: true });
    const updated = await ref.get();
    return NextResponse.json({ success: true, campaign: serializeCampaign(updated) });
  }

  if (action === 'pause') {
    if (current.status !== 'sending' && current.status !== 'scheduled') {
      return NextResponse.json({ error: 'Only scheduled/sending campaigns can be paused' }, { status: 400 });
    }
    await ref.set({
      status: 'paused',
      pausedAt: FieldValue.serverTimestamp(),
      lockId: FieldValue.delete(),
      lockExpiresAt: FieldValue.delete()
    }, { merge: true });
    const updated = await ref.get();
    return NextResponse.json({ success: true, campaign: serializeCampaign(updated) });
  }

  if (action === 'resume') {
    if (current.status !== 'paused') {
      return NextResponse.json({ error: 'Only paused campaigns can be resumed' }, { status: 400 });
    }
    await ref.set({
      status: current.scheduledAt && current.sent === 0 ? 'scheduled' : 'sending',
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    const updated = await ref.get();
    return NextResponse.json({ success: true, campaign: serializeCampaign(updated) });
  }

  if (current.status !== 'draft') {
    return NextResponse.json({ error: 'Only drafts can be edited' }, { status: 400 });
  }

  const normalized = normalizeCampaignInput({ ...current, ...body }, { requireContent: false });
  if (normalized.error) {
    return NextResponse.json({ error: normalized.error }, { status: 400 });
  }

  await ref.set({
    ...normalized.data,
    previewCount: body.previewCount !== undefined ? Number(body.previewCount) : current.previewCount,
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });

  const updated = await ref.get();
  return NextResponse.json({ success: true, campaign: serializeCampaign(updated) });
}

export async function DELETE(req, { params }) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing campaign id' }, { status: 400 });

  try {
    const ref = auth.adminDb.collection('campaigns').doc(id);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

    const status = snap.data()?.status;
    if (status === 'sending') {
      return NextResponse.json({ error: 'Cannot delete a campaign that is currently sending. Abort it first.' }, { status: 400 });
    }

    const recs = await ref.collection('recipients').limit(400).get();
    const batch = auth.adminDb.batch();
    recs.docs.forEach((d) => batch.delete(d.ref));
    batch.delete(ref);
    await batch.commit();

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error('[outreach/campaigns DELETE]', err);
    return NextResponse.json({ error: err.message || 'Failed to delete campaign' }, { status: 500 });
  }
}
