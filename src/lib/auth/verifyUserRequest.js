import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/utils/firebaseAdmin';

function unauthorized(message = 'Unauthorized', status = 401) {
  return { ok: false, response: NextResponse.json({ error: message }, { status }) };
}

export async function verifyUserRequest(req) {
  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!token) return unauthorized('Sign in to continue');

    const { adminAuth, adminDb } = await getFirebaseAdmin();
    if (!adminAuth || !adminDb) {
      return unauthorized('Server is not ready. Try again shortly.', 500);
    }

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(token);
    } catch {
      return unauthorized('Your session expired. Sign in again.');
    }

    if (!decoded?.uid) return unauthorized('Invalid session');

    const userSnap = await adminDb.collection('users').doc(decoded.uid).get();
    const userData = userSnap.exists ? (userSnap.data() || {}) : {};

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
    return unauthorized('Authentication failed', 500);
  }
}
