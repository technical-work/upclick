import crypto from 'crypto';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  return EMAIL_RE.test(String(email || '').trim());
}

export function normalizePhone(phone) {
  const digits = String(phone || '').replace(/[^\d+]/g, '');
  if (!digits) return '';
  if (digits.startsWith('+')) return digits;
  return digits.replace(/^00/, '+');
}

export function maskEmail(email) {
  const value = String(email || '');
  const [local, domain] = value.split('@');
  if (!domain || !local) return value ? '***' : '';
  const shown = local.slice(0, 2);
  return `${shown}***@${domain}`;
}

export function maskPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length < 4) return phone ? '****' : '';
  return `***${digits.slice(-4)}`;
}

function unsubscribeSecret() {
  return String(process.env.OUTREACH_UNSUBSCRIBE_SECRET || process.env.CRON_SECRET || process.env.RESEND_API_KEY || 'upklick-outreach').trim();
}

export function signUnsubscribeToken(userId) {
  const payload = Buffer.from(String(userId), 'utf8').toString('base64url');
  const hmac = crypto.createHmac('sha256', unsubscribeSecret()).update(payload).digest('base64url');
  return `${payload}.${hmac}`;
}

export function verifyUnsubscribeToken(token) {
  const raw = String(token || '');
  const dot = raw.lastIndexOf('.');
  if (dot <= 0) return null;
  const payload = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const expected = crypto.createHmac('sha256', unsubscribeSecret()).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    return Buffer.from(payload, 'base64url').toString('utf8');
  } catch {
    return null;
  }
}

export function appBaseUrl() {
  return String(process.env.NEXT_PUBLIC_APP_URL || 'https://upklick.net').replace(/\/$/, '');
}

export function unsubscribeUrl(userId) {
  return `${appBaseUrl()}/api/outreach/unsubscribe?token=${encodeURIComponent(signUnsubscribeToken(userId))}`;
}

export function sanitizeCampaignHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '');
}

export function personalize(text, user) {
  const name = user?.name || user?.displayName || user?.email?.split('@')[0] || '';
  return String(text || '')
    .replaceAll('{{name}}', name)
    .replaceAll('{{email}}', user?.email || '')
    .replaceAll('{{phone}}', user?.phoneNumber || '');
}

export function audienceFingerprint(audience, channel) {
  const userIds = [...(audience?.userIds || [])].map(String).sort();
  return JSON.stringify({
    type: audience?.type || 'all',
    segment: audience?.segment || null,
    userIds,
    trialOnly: audience?.trialOnly !== false,
    channel: channel || 'email'
  });
}

export const BATCH_WRITE_LIMIT = 400;
export const DISPATCH_BATCH_SIZE = 40;
export const LOCK_MS = 4 * 60 * 1000;
