import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const cleanEnvVar = (val) => {
  if (!val) return null;
  let cleaned = val.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  cleaned = cleaned.replace(/\\n/g, '\n').trim();
  return cleaned || null;
};

export function getFirebaseAdmin() {
  try {
    const apps = getApps();
    if (apps.length > 0) {
      const app = apps[0];
      return {
        adminApp: app,
        adminDb: getFirestore(app),
        adminAuth: getAuth(app)
      };
    }

    const projectId = cleanEnvVar(process.env.FIREBASE_PROJECT_ID);
    const clientEmail = cleanEnvVar(process.env.FIREBASE_CLIENT_EMAIL);
    const privateKey = cleanEnvVar(process.env.FIREBASE_PRIVATE_KEY);

    if (!projectId || !privateKey || !privateKey.includes('BEGIN PRIVATE KEY')) {
      console.warn('[firebaseAdmin] Invalid or missing FIREBASE_PRIVATE_KEY in environment variables.');
      return { adminApp: null, adminDb: null, adminAuth: null };
    }

    const app = initializeApp({
      credential: cert({
        projectId,
        clientEmail: clientEmail || '',
        privateKey,
      }),
    });

    return {
      adminApp: app,
      adminDb: getFirestore(app),
      adminAuth: getAuth(app)
    };
  } catch (error) {
    console.error('[firebaseAdmin] Initialization error:', error.message);
    return { adminApp: null, adminDb: null, adminAuth: null };
  }
}

let adminApp = null;
let adminDb = null;
let adminAuth = null;

try {
  const res = getFirebaseAdmin();
  adminApp = res.adminApp;
  adminDb = res.adminDb;
  adminAuth = res.adminAuth;
} catch (e) {
  console.warn('[firebaseAdmin] Top-level init suppressed:', e.message);
}

export { adminDb, adminApp, adminAuth };
