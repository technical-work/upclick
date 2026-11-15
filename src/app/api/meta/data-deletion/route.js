import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getFirebaseAdmin } from '@/utils/firebaseAdmin';
import emailService from '@/services/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OFFICIAL_PRIVACY_EMAIL = 'upklickofficial@gmail.com';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 3;

// In-memory fallback rate limiter per IP/device
const memoryRateMap = new Map();

function checkMemoryRateLimit(key) {
  const now = Date.now();
  const timestamps = (memoryRateMap.get(key) || []).filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  timestamps.push(now);
  memoryRateMap.set(key, timestamps);
  return true;
}

function base64UrlDecode(input) {
  const normalized = String(input || '')
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const pad = normalized.length % 4;
  const padded = pad ? normalized + '='.repeat(4 - pad) : normalized;
  return Buffer.from(padded, 'base64');
}

function parseMetaSignedRequest(signedRequest, appSecret) {
  if (!signedRequest || !String(signedRequest).includes('.')) return null;
  const [encodedSig, payload] = String(signedRequest).split('.', 2);
  try {
    const data = JSON.parse(base64UrlDecode(payload).toString('utf8'));
    if (appSecret) {
      const expectedSig = crypto
        .createHmac('sha256', appSecret)
        .update(payload)
        .digest();
      const actualSig = base64UrlDecode(encodedSig);
      if (
        expectedSig.length !== actualSig.length ||
        !crypto.timingSafeEqual(expectedSig, actualSig)
      ) {
        return null;
      }
    }
    return data;
  } catch {
    return null;
  }
}

export async function POST(req) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let signedRequest = '';
    let email = '';
    let scope = '';
    let details = '';
    let deviceId = '';
    let source = 'meta_callback';

    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      signedRequest = body.signed_request || '';
      email = body.email || '';
      scope = body.deletionScope || body.scope || '';
      details = body.details !== undefined ? body.details : body.notes || '';
      deviceId = body.deviceId || '';
      source = body.source || (signedRequest ? 'meta_callback' : 'web_form');
    } else {
      const formData = await req.formData().catch(() => null);
      if (formData) {
        signedRequest = formData.get('signed_request') || '';
        email = formData.get('email') || '';
        scope = formData.get('deletionScope') || formData.get('scope') || '';
        details = formData.get('details') || formData.get('notes') || '';
        deviceId = formData.get('deviceId') || '';
        source = signedRequest ? 'meta_callback' : 'web_form';
      }
    }

    const forwardedFor = req.headers.get('x-forwarded-for') || '';
    const clientIp = forwardedFor.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
    const rateKey = deviceId ? `dev:${deviceId}` : `ip:${clientIp}`;

    const isWebForm = !signedRequest;
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanScope = String(scope || '').trim();
    const cleanDetails = String(details || '').trim();

    if (isWebForm) {
      if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail)) {
        return NextResponse.json(
          { error: 'Please enter a valid email address.' },
          { status: 400 }
        );
      }
      if (!cleanScope) {
        return NextResponse.json(
          { error: 'Please select a deletion scope.' },
          { status: 400 }
        );
      }
      if (!checkMemoryRateLimit(rateKey)) {
        return NextResponse.json(
          {
            error:
              'Too many requests submitted from this device recently. Please wait 15 minutes or email upklickofficial@gmail.com directly.'
          },
          { status: 429 }
        );
      }
    }

    const appSecret =
      process.env.META_APP_SECRET || process.env.FACEBOOK_APP_SECRET || '';
    const parsedSigned = signedRequest
      ? parseMetaSignedRequest(signedRequest, appSecret)
      : null;

    if (signedRequest && appSecret && !parsedSigned) {
      return NextResponse.json(
        { error: 'Invalid Meta signed_request signature' },
        { status: 400 }
      );
    }

    const { adminDb } = await getFirebaseAdmin();

    // Check Firestore-backed spam rate limit per IP/device for web form submissions
    if (isWebForm && adminDb) {
      try {
        const cutoffIso = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
        const recentSnap = await adminDb
          .collection('data_deletion_requests')
          .where('rateKey', '==', rateKey)
          .limit(10)
          .get();

        const recentCount = recentSnap.docs.filter((doc) => {
          const d = doc.data();
          return (d.date || d.createdAt || '') >= cutoffIso;
        }).length;

        if (recentCount >= MAX_REQUESTS_PER_WINDOW) {
          return NextResponse.json(
            {
              error:
                'Too many requests submitted from this device recently. Please wait 15 minutes or email upklickofficial@gmail.com directly.'
            },
            { status: 429 }
          );
        }
      } catch (rateErr) {
        console.warn('[meta/data-deletion] Rate limit check warning:', rateErr.message);
      }
    }

    const metaUserId = parsedSigned?.user_id || '';
    const confirmationCode = `DEL-${Date.now().toString(36).toUpperCase()}-${crypto
      .randomBytes(3)
      .toString('hex')
      .toUpperCase()}`;
    const createdAt = new Date().toISOString();
    const resolvedScope = cleanScope || 'all_data';

    const recordData = {
      requestId: confirmationCode,
      confirmationCode,
      metaUserId,
      email: cleanEmail,
      deletionScope: resolvedScope,
      scope: resolvedScope,
      details: cleanDetails,
      notes: cleanDetails,
      date: createdAt,
      createdAt,
      status: 'pending',
      source,
      clientIp,
      rateKey
    };

    if (!adminDb) {
      return NextResponse.json(
        { error: 'Database service unavailable. Please try again shortly.' },
        { status: 500 }
      );
    }

    await adminDb
      .collection('data_deletion_requests')
      .doc(confirmationCode)
      .set(recordData);

    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host') || 'www.upklick.net';
    const statusUrl = `${proto}://${host}/data-deletion?code=${encodeURIComponent(
      confirmationCode
    )}`;

    const scopeLabel =
      resolvedScope === 'meta_only'
        ? 'Delete Meta integration data & tokens only (Facebook / Instagram / WhatsApp)'
        : 'Permanently delete entire UpKlick account and all associated data';

    // Send notification email to upklickofficial@gmail.com and confirmation email to requester
    if (cleanEmail) {
      try {
        await Promise.allSettled([
          emailService.sendNotificationEmail({
            to: OFFICIAL_PRIVACY_EMAIL,
            name: 'UpKlick Privacy Team',
            title: `[Data Deletion Request] ${confirmationCode} — ${cleanEmail}`,
            message: `A new data deletion request has been submitted on UpKlick.\n\n• Request ID: ${confirmationCode}\n• Requester Email: ${cleanEmail}\n• Deletion Scope: ${scopeLabel} (${resolvedScope})\n• Details: ${cleanDetails || 'None provided'}\n• Date: ${createdAt}\n• Status: pending`,
            actionUrl: statusUrl,
            actionText: 'View Request Status'
          }),
          emailService.sendNotificationEmail({
            to: cleanEmail,
            name: cleanEmail.split('@')[0],
            title: `UpKlick Data Deletion Request Confirmation (${confirmationCode})`,
            message: `We have received your data deletion request.\n\n• Request ID: ${confirmationCode}\n• Account Email: ${cleanEmail}\n• Deletion Scope: ${scopeLabel}\n• Date Submitted: ${createdAt}\n• Current Status: pending\n\nWe will complete your deletion request within 30 days (usually within 72 hours). If you have any questions, reply to or contact us at ${OFFICIAL_PRIVACY_EMAIL}.`,
            actionUrl: statusUrl,
            actionText: 'View Request Confirmation'
          })
        ]);
      } catch (mailErr) {
        console.warn('[meta/data-deletion] Email dispatch warning:', mailErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      request_id: confirmationCode,
      confirmation_code: confirmationCode,
      status: 'pending',
      date: createdAt,
      url: statusUrl
    });
  } catch (err) {
    console.error('[meta/data-deletion] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Could not process data deletion request' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code') || 'DEL-VERIFIED';
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const host = req.headers.get('host') || 'www.upklick.net';
  return NextResponse.json({
    status: 'pending',
    confirmation_code: code,
    url: `${proto}://${host}/data-deletion?code=${encodeURIComponent(code)}`
  });
}
