import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin/verifyAdminRequest';
import { normalizeAudience } from '@/lib/outreach/campaigns';
import { collectAudienceUsers } from '@/lib/outreach/audience';
import { maskEmail, maskPhone } from '@/lib/outreach/tokens';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const normalized = normalizeAudience(body.audience || body || {});
    if (normalized.error) {
      return NextResponse.json({ error: normalized.error }, { status: 400 });
    }

    const result = await collectAudienceUsers(auth.adminDb, normalized.audience, { sampleLimit: 10 });
    const sample = result.sample.map((u) => ({
      id: u.id,
      name: u.name,
      email: maskEmail(u.email),
      phone: maskPhone(u.phone),
      bucket: u.bucket,
      creditsUsed: u.creditsUsed
    }));

    return NextResponse.json({
      success: true,
      count: result.count,
      scanned: result.scanned,
      sample,
      countsByBucket: result.countsByBucket,
      audience: normalized.audience
    });
  } catch (err) {
    console.error('[outreach/preview]', err);
    return NextResponse.json({ error: err.message || 'Preview failed' }, { status: 500 });
  }
}
