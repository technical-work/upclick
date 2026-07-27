import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let adminApp = null;
let adminDb = null;
let adminAuth = null;

const cleanEnvVar = (val) => {
  if (!val) return val;
  let cleaned = val.trim();
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.trim();
};

const projectId = cleanEnvVar(process.env.FIREBASE_PROJECT_ID);
const clientEmail = cleanEnvVar(process.env.FIREBASE_CLIENT_EMAIL);
const privateKey = cleanEnvVar(process.env.FIREBASE_PRIVATE_KEY);

let formattedPrivateKey = privateKey;
if (formattedPrivateKey) {
  // Strip surrounding quotes if present
  if ((formattedPrivateKey.startsWith('"') && formattedPrivateKey.endsWith('"')) ||
      (formattedPrivateKey.startsWith("'") && formattedPrivateKey.endsWith("'"))) {
    formattedPrivateKey = formattedPrivateKey.slice(1, -1);
  }
  // Replace literal escaped newlines with actual newline characters
  formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, '\n');
}

if (projectId && formattedPrivateKey) {
  try {
    const apps = getApps();
    if (apps.length === 0) {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: formattedPrivateKey,
        }),
      });
    } else {
      adminApp = apps[0];
    }
    adminDb = getFirestore(adminApp);
    adminAuth = getAuth(adminApp);
  } catch (error) {
    console.error('Firebase admin initialization error', error.stack);
  }
} else {
  console.warn('Firebase Admin env vars missing. Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set.');
}

export { adminDb, adminApp, adminAuth };
