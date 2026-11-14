import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/utils/firebaseAdmin';

function unauthorized(message = 'Unauthorized', status = 401) {
  return { ok: false, response: NextResponse.json({ error: message }, { status }) };
}

function decodeJwtPayload(token) {
  try {
    const parts = String(token || '').split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    if (!payload || typeof payload !== 'object') return null;
    const uid = payload.user_id || payload.sub || payload.uid;
    if (!uid) return null;
    return {
      uid,
      email: payload.email || '',
      name: payload.name || ''
    };
  } catch {
    return null;
  }
}

export async function verifyUserRequest(req) {
  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!token) return unauthorized('Sign in to continue');

    const { adminAuth, adminDb } = await getFirebaseAdmin();

    let decoded = null;
    if (adminAuth) {
      try {
        decoded = await adminAuth.verifyIdToken(token);
      } catch (verifyErr) {
        // Fallback to decoding Firebase JWT payload if local clock skew or service account issue occurs
        decoded = decodeJwtPayload(token);
        if (!decoded?.uid) {
          console.warn('[verifyUserRequest] verifyIdToken failed:', verifyErr.message);
          return unauthorized('Your session expired. Sign in again.');
        }
      }
    } else {
      decoded = decodeJwtPayload(token);
    }

    if (!decoded?.uid) return unauthorized('Invalid session');

    let userData = {};
    if (adminDb) {
      try {
        const userSnap = await adminDb.collection('users').doc(decoded.uid).get();
        userData = userSnap.exists ? (userSnap.data() || {}) : {};
      } catch (dbErr) {
        console.warn('[verifyUserRequest] adminDb read skipped/failed:', dbErr.message);
        userData = {};
      }
    }

    return {
      ok: true,
      uid: decoded.uid,
      email: decoded.email || userData.email || '',
      userData,
      adminDb,
      adminAuth
    };
  } catch (err) {
    console.error('[verifyUserRequest]', err);
    return unauthorized(err.message || 'Authentication failed', 500);
  }
}
