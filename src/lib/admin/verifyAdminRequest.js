import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/utils/firebaseAdmin';

function unauthorized(message = 'Unauthorized', status = 401) {
  return { ok: false, response: NextResponse.json({ error: message }, { status }) };
}

function errorMessage(err) {
  if (!err) return 'Unknown error';
  const code = err.code || err.errorInfo?.code || '';
  const msg = err.message || String(err);
  if (String(code).includes('resource-exhausted') || /quota/i.test(msg)) {
    return 'Firestore quota exceeded. Wait a few minutes and retry.';
  }
  return msg;
}

const ADMIN_CACHE = new Map();
const ADMIN_CACHE_TTL_MS = 60 * 1000;

/**
 * Verifies a Firebase ID token and that the user is admin or super_admin.
 * Expects: Authorization: Bearer <idToken>
 */
export async function verifyAdminRequest(req) {
  try {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

    if (!token) {
      return unauthorized('Missing admin authorization token');
    }

    const { adminAuth, adminDb } = await getFirebaseAdmin();
    if (!adminAuth || !adminDb) {
      return unauthorized('Firebase Admin SDK is not initialized. Check FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.', 500);
    }

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(token);
    } catch (err) {
      return unauthorized('Invalid or expired admin token');
    }

    if (!decoded?.uid) {
      return unauthorized('Invalid admin token');
    }

    const cached = ADMIN_CACHE.get(decoded.uid);
    const now = Date.now();
    if (cached && (now - cached.timestamp < ADMIN_CACHE_TTL_MS)) {
      return {
        ok: true,
        uid: decoded.uid,
        email: decoded.email || cached.userData.email || '',
        userData: cached.userData,
        adminDb,
        adminAuth
      };
    }

    let userSnap;
    try {
      userSnap = await adminDb.collection('users').doc(decoded.uid).get();
    } catch (err) {
      console.error('[verifyAdminRequest] profile read failed:', err);
      return unauthorized(errorMessage(err), 500);
    }

    if (!userSnap.exists) {
      return unauthorized('Admin profile not found', 403);
    }

    const userData = userSnap.data() || {};
    const role = userData.role;
    if (role !== 'admin' && role !== 'super_admin') {
      return unauthorized('Admin access required', 403);
    }

    ADMIN_CACHE.set(decoded.uid, {
      userData,
      timestamp: now
    });

    return {
      ok: true,
      uid: decoded.uid,
      email: decoded.email || userData.email || '',
      userData,
      adminDb,
      adminAuth
    };
  } catch (err) {
    console.error('[verifyAdminRequest] unexpected error:', err);
    return unauthorized(errorMessage(err), 500);
  }
}

/**
 * Vercel Cron sends Authorization: Bearer $CRON_SECRET when CRON_SECRET is set.
 */
export function verifyCronRequest(req) {
  const secret = String(process.env.CRON_SECRET || '').trim();
  if (!secret) {
    return unauthorized('CRON_SECRET is not configured', 500);
  }

  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const alt = (req.headers.get('x-cron-secret') || '').trim();

  if (bearer !== secret && alt !== secret) {
    return unauthorized('Invalid cron credentials', 401);
  }

  return { ok: true };
}
