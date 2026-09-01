import {
  CREDIT_BUCKET_KEYS,
  getConsumedCredits,
  getCreditBucket,
  matchesTrialAudience
} from '@/lib/credits/buckets';
import { isValidEmail, normalizePhone } from '@/lib/outreach/tokens';

export function publicUserPreview(id, user) {
  return {
    id,
    name: user.name || user.displayName || user.fullName || user.email || '—',
    email: user.email || user.userEmail || '',
    phone: user.phoneNumber || '',
    bucket: user.creditBucket || getCreditBucket(getConsumedCredits(user)),
    creditsUsed: getConsumedCredits(user)
  };
}

export function shouldSkipRecipient(user, channel, { allowAdmin = false } = {}) {
  if (!user) return 'missing_user';
  if (user.marketingOptOut === true) return 'opted_out';
  if (!allowAdmin && (user.role === 'admin' || user.role === 'super_admin')) return 'admin_account';
  if (channel === 'email') {
    if (user.emailOptOut === true) return 'email_opted_out';
    const email = user.email || user.userEmail;
    if (!isValidEmail(email)) return 'invalid_email';
  }
  if (channel === 'whatsapp') {
    if (user.whatsappOptOut === true) return 'whatsapp_opted_out';
    const phone = normalizePhone(user.phoneNumber || user.phone);
    if (!phone || phone.replace(/\D/g, '').length < 10) return 'invalid_phone';
  }
  return null;
}

export function userMatchesAudience(user, audience) {
  if (!user) return false;
  const type = audience?.type || 'all';

  if (type === 'selected') {
    return true;
  }

  if (!matchesTrialAudience(user, audience?.trialOnly !== false)) return false;

  if (type === 'all') return true;

  if (type === 'segment') {
    const bucket = user.creditBucket || getCreditBucket(getConsumedCredits(user));
    return bucket === audience.segment;
  }

  return false;
}

function mapUserDoc(doc) {
  const data = doc.data() || {};
  return { id: doc.id, ...data };
}

let cachedUsersList = null;
let cachedUsersTimestamp = 0;
const USERS_CACHE_TTL_MS = 90 * 1000; // 90 seconds

export async function getCachedAllUsers(adminDb, { forceRefresh = false } = {}) {
  const now = Date.now();
  if (!forceRefresh && cachedUsersList && (now - cachedUsersTimestamp < USERS_CACHE_TTL_MS)) {
    return cachedUsersList;
  }

  const all = [];
  let last = null;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let query = adminDb.collection('users').orderBy('__name__').limit(400);
    if (last) query = query.startAfter(last);
    const page = await query.get();
    if (page.empty) break;
    page.docs.forEach((doc) => all.push(mapUserDoc(doc)));
    last = page.docs[page.docs.length - 1];
    if (page.size < 400) break;
  }

  cachedUsersList = all;
  cachedUsersTimestamp = now;
  return all;
}

/**
 * Invalidate the server users cache (e.g. after backfill)
 */
export function invalidateUsersCache() {
  cachedUsersList = null;
  cachedUsersTimestamp = 0;
}

/**
 * Scan users for preview counts / recipient materialization.
 * For selected: fetch those docs only.
 * For all/segment: uses cached users list or paginates once.
 */
export async function collectAudienceUsers(adminDb, audience, { sampleLimit = 10, collectAll = false } = {}) {
  const type = audience?.type || 'all';
  const matched = [];
  const sample = [];
  const countsByBucket = Object.fromEntries(CREDIT_BUCKET_KEYS.map((k) => [k, 0]));
  let scanned = 0;
  let matchCount = 0;

  const consider = (user) => {
    scanned += 1;
    if (type !== 'selected' && (user.role === 'admin' || user.role === 'super_admin')) return;
    const bucket = user.creditBucket || getCreditBucket(getConsumedCredits(user));
    if (CREDIT_BUCKET_KEYS.includes(bucket) && matchesTrialAudience(user, audience?.trialOnly !== false)) {
      countsByBucket[bucket] += 1;
    }
    if (!userMatchesAudience(user, audience)) return;
    matchCount += 1;
    if (collectAll) matched.push(user);
    if (sample.length < sampleLimit) sample.push(publicUserPreview(user.id, user));
  };

  if (type === 'selected') {
    const ids = [...new Set((audience.userIds || []).map(String).filter(Boolean))];
    if (ids.length > 0) {
      const chunks = [];
      for (let i = 0; i < ids.length; i += 100) chunks.push(ids.slice(i, i + 100));
      for (const chunk of chunks) {
        if (chunk.length === 0) continue;
        const refs = chunk.map((id) => adminDb.collection('users').doc(id));
        const snaps = await adminDb.getAll(...refs);
        snaps.forEach((snap) => {
          if (!snap.exists) return;
          consider(mapUserDoc(snap));
        });
      }
    }
  } else {
    const users = await getCachedAllUsers(adminDb);
    users.forEach((user) => consider(user));
  }

  return {
    scanned,
    count: matchCount,
    sample,
    countsByBucket,
    matched: collectAll ? matched : []
  };
}

export async function collectAllMatchingUsers(adminDb, audience) {
  const result = await collectAudienceUsers(adminDb, audience, { sampleLimit: 0, collectAll: true });
  return result.matched;
}

export async function searchUsers(adminDb, { q = '', page = 1, pageSize = 20, trialOnly = false } = {}) {
  const term = String(q || '').trim().toLowerCase();
  const size = Math.min(50, Math.max(5, Number(pageSize) || 20));
  const pageNum = Math.max(1, Number(page) || 1);

  const allUsers = await getCachedAllUsers(adminDb);
  const results = [];

  for (const user of allUsers) {
    if (user.role === 'admin' || user.role === 'super_admin') continue;
    if (trialOnly && !matchesTrialAudience(user, true)) continue;
    const hay = `${user.email || ''} ${user.userEmail || ''} ${user.name || ''} ${user.displayName || ''} ${user.fullName || ''} ${user.phoneNumber || ''} ${user.phone || ''} ${user.username || ''}`.toLowerCase();
    if (term && !hay.includes(term)) continue;
    results.push(publicUserPreview(user.id, user));
  }

  const start = (pageNum - 1) * size;
  return {
    users: results.slice(start, start + size),
    page: pageNum,
    pageSize: size,
    total: results.length,
    hasMore: results.length > start + size
  };
}
