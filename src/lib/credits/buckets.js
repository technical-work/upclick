export const CREDIT_BUCKETS = [
  { key: 'unused', min: 0, max: 0, labelAr: 'لم يستهلكوا كريدت', labelEn: 'Unused credits' },
  { key: 'c100', min: 1, max: 100, labelAr: 'استخدموا حتى 100', labelEn: 'Used 1–100' },
  { key: 'c200', min: 101, max: 200, labelAr: 'استخدموا حتى 200', labelEn: 'Used 101–200' },
  { key: 'c300', min: 201, max: 300, labelAr: 'استخدموا حتى 300', labelEn: 'Used 201–300' },
  { key: 'c400', min: 301, max: 400, labelAr: 'استخدموا حتى 400', labelEn: 'Used 301–400' },
  { key: 'c500', min: 401, max: null, labelAr: 'استنفدوا التجربة (401+)', labelEn: 'Trial pack exhausted (401+)' }
];

export const CREDIT_BUCKET_KEYS = CREDIT_BUCKETS.map((b) => b.key);

export function getCreditBucket(consumed) {
  const used = Math.max(0, Number(consumed) || 0);
  if (used === 0) return 'unused';
  if (used <= 100) return 'c100';
  if (used <= 200) return 'c200';
  if (used <= 300) return 'c300';
  if (used <= 400) return 'c400';
  return 'c500';
}

export function getConsumedCredits(user) {
  if (!user) return 0;
  if (user.creditsUsed !== undefined && user.creditsUsed !== null && user.creditsUsed !== '') {
    const stored = Number(user.creditsUsed);
    if (!Number.isNaN(stored) && stored >= 0) return stored;
  }
  const initial = user.initialCredits !== undefined && user.initialCredits !== null
    ? Number(user.initialCredits)
    : 500;
  const current = user.aiCredits !== undefined && user.aiCredits !== null
    ? Number(user.aiCredits)
    : initial;
  if (Number.isNaN(initial) || Number.isNaN(current)) return 0;
  return Math.max(0, initial - current);
}

export function getBucketMeta(key) {
  return CREDIT_BUCKETS.find((b) => b.key === key) || null;
}

export function creditFieldsAfterDeduction(user, deduction) {
  const amount = Math.max(0, Number(deduction) || 0);
  const consumed = getConsumedCredits(user) + amount;
  return {
    creditsUsed: consumed,
    creditBucket: getCreditBucket(consumed)
  };
}

export function creditFieldsForNewUser(trialCredits) {
  const initial = trialCredits !== undefined ? Number(trialCredits) : 500;
  return {
    initialCredits: Number.isNaN(initial) ? 500 : initial,
    creditsUsed: 0,
    creditBucket: 'unused'
  };
}

export function isPaidActiveUser(user) {
  if (!user) return false;
  if (user.subscriptionStatus === 'active') return true;
  if (user.isTrial === false) {
    if (user.expiresAt) {
      const raw = user.expiresAt;
      const ms = raw?.toDate
        ? raw.toDate().getTime()
        : (raw?.seconds ? raw.seconds * 1000 : new Date(raw).getTime());
      if (ms && !Number.isNaN(ms) && ms > Date.now()) return true;
    }
    const plan = String(user.planName || user.plan || '').toLowerCase();
    if (plan && plan !== 'starter' && plan !== 'free trial' && plan !== 'freetrial') return true;
  }
  return false;
}

export function matchesTrialAudience(user, trialOnly) {
  if (!trialOnly) return true;
  return !isPaidActiveUser(user);
}
