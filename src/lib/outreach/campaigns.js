import { CREDIT_BUCKET_KEYS } from '@/lib/credits/buckets';
import { audienceFingerprint, sanitizeCampaignHtml } from '@/lib/outreach/tokens';

export function normalizeAudience(raw = {}, { allowEmptySelected = false } = {}) {
  const type = ['all', 'segment', 'selected'].includes(raw.type) ? raw.type : 'all';
  const trialOnly = raw.trialOnly !== false;
  const audience = { type, trialOnly };
  if (type === 'segment') {
    if (!CREDIT_BUCKET_KEYS.includes(raw.segment)) {
      return { error: 'Invalid credit segment' };
    }
    audience.segment = raw.segment;
  }
  if (type === 'selected') {
    const userIds = [...new Set((raw.userIds || []).map(String).filter(Boolean))];
    if (userIds.length === 0 && !allowEmptySelected) {
      return { error: 'Select at least one user' };
    }
    if (userIds.length > 2000) {
      return { error: 'Too many selected users' };
    }
    audience.userIds = userIds;
  }
  return { audience };
}

export function normalizeCampaignInput(body = {}, { requireContent = true } = {}) {
  const name = String(body.name || '').trim();
  if (!name) return { error: 'Campaign name is required' };

  const channel = body.channel === 'whatsapp' ? 'whatsapp' : 'email';
  const audienceResult = normalizeAudience(body.audience || {}, { allowEmptySelected: !requireContent });
  if (audienceResult.error) return audienceResult;

  const subject = String(body.subject || '').trim().replace(/<[^>]+>/g, '');
  const htmlBody = sanitizeCampaignHtml(body.htmlBody || body.body || '');
  const textBody = String(body.textBody || '').trim();

  if (requireContent && channel === 'email') {
    if (!subject) return { error: 'Email subject is required' };
    if (!htmlBody || htmlBody.replace(/<[^>]+>/g, '').trim().length < 2) {
      return { error: 'Email body is required' };
    }
  }

  return {
    data: {
      name,
      channel,
      audience: audienceResult.audience,
      subject,
      htmlBody,
      textBody,
      actionUrl: body.actionUrl ? String(body.actionUrl).trim() : '',
      actionText: body.actionText ? String(body.actionText).trim() : '',
      whatsappVars: body.whatsappVars && typeof body.whatsappVars === 'object' ? body.whatsappVars : {},
      fingerprint: audienceFingerprint(audienceResult.audience, channel)
    }
  };
}

export function serializeCampaign(doc) {
  const data = doc.data() || {};
  const toIso = (v) => {
    if (!v) return null;
    if (typeof v.toDate === 'function') return v.toDate().toISOString();
    if (v.seconds) return new Date(v.seconds * 1000).toISOString();
    if (v instanceof Date) return v.toISOString();
    return v;
  };
  return {
    id: doc.id,
    name: data.name,
    channel: data.channel,
    audience: data.audience,
    subject: data.subject,
    htmlBody: data.htmlBody,
    textBody: data.textBody,
    actionUrl: data.actionUrl || '',
    actionText: data.actionText || '',
    whatsappVars: data.whatsappVars || {},
    status: data.status,
    scheduledAt: toIso(data.scheduledAt),
    createdAt: toIso(data.createdAt),
    confirmedAt: toIso(data.confirmedAt),
    testSentAt: toIso(data.testSentAt),
    completedAt: toIso(data.completedAt),
    lastDispatchedAt: toIso(data.lastDispatchedAt),
    createdBy: data.createdBy || null,
    previewCount: data.previewCount || 0,
    total: data.total || 0,
    pending: data.pending || 0,
    sent: data.sent || 0,
    failed: data.failed || 0,
    skipped: data.skipped || 0,
    fingerprint: data.fingerprint
  };
}
