import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';
import { isWhatsAppEnabled } from '@/services/whatsapp/TwilioWhatsAppProvider';
import { materializeRecipients, claimCampaignLock, dispatchCampaignBatch } from '@/lib/outreach/dispatch';
import { audienceFingerprint } from '@/lib/outreach/tokens';
import { serializeCampaign, normalizeCampaignInput } from '@/lib/outreach/campaigns';
import { collectAudienceUsers } from '@/lib/outreach/audience';

function draftFields(normalized, body, auth) {
  return {
    ...normalized.data,
    status: 'draft',
    previewCount: Number(body.previewCount) || 0,
    total: 0,
    pending: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
    testSentAt: null,
    scheduledAt: null,
    createdBy: { uid: auth.uid, email: auth.email },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  };
}

export async function upsertDraftCampaign(adminDb, auth, body) {
  const normalized = normalizeCampaignInput(body);
  if (normalized.error) {
    return { error: normalized.error, status: 400 };
  }

  const existingId = String(body.campaignId || body.id || '').trim();
  let ref;

  if (existingId) {
    ref = adminDb.collection('campaigns').doc(existingId);
    const snap = await ref.get();
    if (snap.exists) {
      const current = snap.data() || {};
      if (current.status && current.status !== 'draft') {
        return { error: 'Only draft campaigns can be confirmed', status: 400 };
      }
      await ref.set({
        ...normalized.data,
        previewCount: body.previewCount !== undefined ? Number(body.previewCount) : current.previewCount || 0,
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true });
    } else {
      await ref.set(draftFields(normalized, body, auth));
    }
  } else {
    ref = await adminDb.collection('campaigns').add(draftFields(normalized, body, auth));
  }

  const snap = await ref.get();
  return { ref, id: ref.id, campaign: { id: ref.id, ...(snap.data() || {}) } };
}

export async function confirmCampaign({ adminDb, uid, campaignId, campaign, body }) {
  const confirmText = String(body.confirmText || '').trim().toUpperCase();
  const confirmCount = Number(body.confirmCount);

  if (confirmText !== 'SEND') {
    return { error: 'Type SEND to confirm', status: 400 };
  }

  if ((campaign.status || 'draft') !== 'draft') {
    return { error: 'Only draft campaigns can be confirmed', status: 400 };
  }

  if (campaign.channel === 'whatsapp' && !isWhatsAppEnabled()) {
    return {
      error: 'WhatsApp confirm is blocked until Twilio Content Template env vars are set.',
      status: 400
    };
  }

  const preview = await collectAudienceUsers(adminDb, campaign.audience || { type: 'all', trialOnly: true }, { sampleLimit: 0 });
  if (preview.count < 1) {
    return { error: 'No recipients match this audience', status: 400 };
  }
  if (!Number.isInteger(confirmCount) || confirmCount !== preview.count) {
    return {
      error: `Recipient count mismatch. Type the current count (${preview.count}) to confirm.`,
      count: preview.count,
      status: 400
    };
  }

  const liveFingerprint = audienceFingerprint(campaign.audience, campaign.channel || 'email');
  if (campaign.fingerprint && campaign.fingerprint !== liveFingerprint) {
    return { error: 'Audience changed since draft. Preview again.', status: 400 };
  }

  const sendNow = body.sendNow !== false;
  let scheduledAt = null;
  if (!sendNow) {
    const raw = body.scheduledAt;
    const when = raw ? new Date(raw) : null;
    if (!when || Number.isNaN(when.getTime())) {
      return { error: 'Valid scheduledAt is required when sendNow is false', status: 400 };
    }
    if (when.getTime() < Date.now() - 60 * 1000) {
      return { error: 'Schedule time is in the past', status: 400 };
    }
    scheduledAt = when;
  }

  const ref = adminDb.collection('campaigns').doc(campaignId);
  const materialized = await materializeRecipients(adminDb, campaignId, { ...campaign, id: campaignId });

  await ref.set({
    status: sendNow ? 'sending' : 'scheduled',
    scheduledAt: scheduledAt || FieldValue.serverTimestamp(),
    confirmedAt: FieldValue.serverTimestamp(),
    confirmedBy: uid,
    previewCount: preview.count,
    htmlSnapshot: campaign.htmlBody || '',
    subjectSnapshot: campaign.subject || ''
  }, { merge: true });

  let firstBatch = null;
  if (sendNow) {
    const lockId = crypto.randomBytes(8).toString('hex');
    const claimed = await claimCampaignLock(adminDb, campaignId, lockId);
    if (claimed.claimed) {
      firstBatch = await dispatchCampaignBatch(adminDb, campaignId, { id: campaignId, ...campaign, ...claimed.campaign });
    }
  }

  const updated = await ref.get();
  return {
    success: true,
    campaign: serializeCampaign(updated),
    materialized,
    firstBatch
  };
}
