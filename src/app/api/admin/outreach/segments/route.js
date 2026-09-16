import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin/verifyAdminRequest';
import { collectAudienceUsers } from '@/lib/outreach/audience';
import { CREDIT_BUCKETS } from '@/lib/credits/buckets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return auth.response;

  try {
    const trialOnly = req.nextUrl.searchParams.get('trialOnly') !== 'false';
    const result = await collectAudienceUsers(auth.adminDb, { type: 'all', trialOnly }, { sampleLimit: 0 });
    const buckets = CREDIT_BUCKETS.map((b) => ({
      key: b.key,
      min: b.min,
      max: b.max,
      labelAr: b.labelAr,
      labelEn: b.labelEn,
      count: result.countsByBucket[b.key] || 0
    }));
    const total = buckets.reduce((sum, b) => sum + b.count, 0);
    return NextResponse.json({ success: true, trialOnly, total, buckets, scanned: result.scanned });
  } catch (err) {
    console.error('[outreach/segments]', err);
    return NextResponse.json({ error: err.message || 'Failed to load segments' }, { status: 500 });
  }
}
