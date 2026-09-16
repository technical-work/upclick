import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin/verifyAdminRequest';
import { getConsumedCredits, getCreditBucket, creditFieldsForNewUser } from '@/lib/credits/buckets';
import { invalidateUsersCache } from '@/lib/outreach/audience';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return auth.response;

  try {
    let updated = 0;
    let scanned = 0;
    let last = null;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      let query = auth.adminDb.collection('users').orderBy('__name__').limit(400);
      if (last) query = query.startAfter(last);
      const page = await query.get();
      if (page.empty) break;

      const batch = auth.adminDb.batch();
      let writes = 0;
      page.docs.forEach((doc) => {
        scanned += 1;
        const user = doc.data() || {};
        const consumed = getConsumedCredits(user);
        const bucket = getCreditBucket(consumed);
        const initial = user.initialCredits !== undefined
          ? Number(user.initialCredits)
          : (user.aiCredits !== undefined ? Number(user.aiCredits) + consumed : 500);
        const needsWrite =
          user.creditsUsed !== consumed ||
          user.creditBucket !== bucket ||
          user.initialCredits === undefined;

        if (!needsWrite) return;
        writes += 1;
        updated += 1;
        batch.set(doc.ref, {
          creditsUsed: consumed,
          creditBucket: bucket,
          initialCredits: Number.isNaN(initial) ? creditFieldsForNewUser(500).initialCredits : initial
        }, { merge: true });
      });
      if (writes > 0) await batch.commit();
      last = page.docs[page.docs.length - 1];
      if (page.size < 400) break;
    }

    invalidateUsersCache();
    return NextResponse.json({ success: true, scanned, updated });
  } catch (err) {
    console.error('[outreach/backfill-credits]', err);
    return NextResponse.json({ error: err.message || 'Backfill failed' }, { status: 500 });
  }
}
