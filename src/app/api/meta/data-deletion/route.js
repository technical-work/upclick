import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/utils/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    let scope = 'all_data';
    let notes = '';
    let source = 'meta_callback';

    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => ({}));
      signedRequest = body.signed_request || '';
      email = body.email || '';
      scope = body.scope || 'all_data';
      notes = body.notes || '';
      source = body.source || (signedRequest ? 'meta_callback' : 'web_form');
    } else {
      const formData = await req.formData().catch(() => null);
      if (formData) {
        signedRequest = formData.get('signed_request') || '';
        email = formData.get('email') || '';
        scope = formData.get('scope') || 'all_data';
        notes = formData.get('notes') || '';
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

    const metaUserId = parsedSigned?.user_id || '';
    const confirmationCode = `DEL-${Date.now().toString(36).toUpperCase()}-${crypto
      .randomBytes(3)
      .toString('hex')
      .toUpperCase()}`;

    try {
      if (adminDb) {
        await adminDb
          .collection('data_deletion_requests')
          .doc(confirmationCode)
          .set({
            confirmationCode,
            metaUserId,
            email: String(email || '').trim().toLowerCase(),
            scope,
            notes,
            source,
            status: 'pending',
            createdAt: new Date().toISOString()
          });
      }
    } catch (err) {
      console.warn('[meta/data-deletion] Could not persist deletion log:', err.message);
    }

    const proto = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host') || 'upklick.com';
    const statusUrl = `${proto}://${host}/data-deletion?code=${encodeURIComponent(
      confirmationCode
    )}`;

    return NextResponse.json({
      url: statusUrl,
      confirmation_code: confirmationCode
    });
  } catch (err) {
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
  const host = req.headers.get('host') || 'upklick.com';
  return NextResponse.json({
    status: 'received',
    confirmation_code: code,
    url: `${proto}://${host}/data-deletion?code=${encodeURIComponent(code)}`
  });
}

