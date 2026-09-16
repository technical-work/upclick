import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin/verifyAdminRequest';
import { claimCampaignLock, dispatchCampaignBatch } from '@/lib/outreach/dispatch';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req) {
  return handleAdminDispatch(req);
}

export async function GET(req) {
  return handleAdminDispatch(req);
}

async function handleAdminDispatch(req) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return auth.response;

  try {
    const adminDb = auth.adminDb;
    const now = Date.now();

    const sendingSnap = await adminDb.collection('campaigns').where('status', '==', 'sending').limit(10).get();
    const scheduledSnap = await adminDb.collection('campaigns').where('status', '==', 'scheduled').limit(10).get();

    const due = [];
    sendingSnap.docs.forEach((d) => due.push(d));

    scheduledSnap.docs.forEach((d) => {
      const data = d.data() || {};
      let at = 0;
      if (data.scheduledAt?.toMillis) at = data.scheduledAt.toMillis();
      else if (data.scheduledAt?.seconds) at = data.scheduledAt.seconds * 1000;
      else if (data.scheduledAt) {
        const parsed = new Date(data.scheduledAt).getTime();
        if (!isNaN(parsed)) at = parsed;
      }
      if (!at || at <= now) {
        due.push(d);
      }
    });

    const results = [];
    for (const doc of due) {
      const lockId = crypto.randomBytes(8).toString('hex');
      const claimed = await claimCampaignLock(adminDb, doc.id, lockId);
      if (!claimed.claimed) {
        results.push({ id: doc.id, skipped: claimed.reason });
        continue;
      }
      const batchResult = await dispatchCampaignBatch(adminDb, doc.id, claimed.campaign);
      results.push({ id: doc.id, ...batchResult });
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      processedCount: due.length,
      dispatchedCount: results.length,
      results
    });
  } catch (err) {
    console.error('[admin/outreach/campaigns/dispatch]', err);
    return NextResponse.json({ error: err.message || 'Dispatch failed' }, { status: 500 });
  }
}
