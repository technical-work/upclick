import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/utils/firebaseAdmin';
import { verifyCronRequest } from '@/lib/admin/verifyAdminRequest';
import { claimCampaignLock, dispatchCampaignBatch } from '@/lib/outreach/dispatch';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req) {
  return handleDispatch(req);
}

export async function POST(req) {
  return handleDispatch(req);
}

async function handleDispatch(req) {
  const cron = verifyCronRequest(req);
  if (!cron.ok) return cron.response;

  try {
    const { adminDb } = await getFirebaseAdmin();
    if (!adminDb) {
      return NextResponse.json({ error: 'Firebase Admin DB not initialized' }, { status: 500 });
    }

    const now = Date.now();
    const sendingSnap = await adminDb.collection('campaigns').where('status', '==', 'sending').limit(5).get();
    const scheduledSnap = await adminDb.collection('campaigns').where('status', '==', 'scheduled').limit(5).get();

    const due = [];
    sendingSnap.docs.forEach((d) => due.push(d));
    scheduledSnap.docs.forEach((d) => {
      const data = d.data() || {};
      const at = data.scheduledAt?.toMillis
        ? data.scheduledAt.toMillis()
        : (data.scheduledAt?.seconds ? data.scheduledAt.seconds * 1000 : 0);
      if (!at || at <= now) due.push(d);
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
      campaigns: results.length,
      results
    });
  } catch (err) {
    console.error('[cron/outreach-dispatch]', err);
    return NextResponse.json({ success: false, error: err.message || 'Dispatch failed' }, { status: 500 });
  }
}
