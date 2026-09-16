import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin/verifyAdminRequest';
import { confirmCampaign } from '@/lib/outreach/confirmCampaign';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req, { params }) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing campaign id' }, { status: 400 });

  try {
    const body = await req.json();
    const snap = await auth.adminDb.collection('campaigns').doc(id).get();
    if (!snap.exists) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });

    const result = await confirmCampaign({
      adminDb: auth.adminDb,
      uid: auth.uid,
      campaignId: id,
      campaign: { id, ...snap.data() },
      body
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error, count: result.count },
        { status: result.status || 400 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[outreach/campaigns/:id/confirm]', err);
    return NextResponse.json({ error: err.message || 'Failed to confirm campaign' }, { status: 500 });
  }
}
