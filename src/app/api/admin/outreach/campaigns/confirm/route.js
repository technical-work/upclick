import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin/verifyAdminRequest';
import { upsertDraftCampaign, confirmCampaign } from '@/lib/outreach/confirmCampaign';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const drafted = await upsertDraftCampaign(auth.adminDb, auth, body);
    if (drafted.error) {
      return NextResponse.json({ error: drafted.error }, { status: drafted.status || 400 });
    }

    const result = await confirmCampaign({
      adminDb: auth.adminDb,
      uid: auth.uid,
      campaignId: drafted.id,
      campaign: drafted.campaign,
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
    console.error('[outreach/campaigns/confirm]', err);
    return NextResponse.json({ error: err.message || 'Failed to confirm campaign' }, { status: 500 });
  }
}
