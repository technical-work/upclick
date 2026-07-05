import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp = null;
let adminDb = null;

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

let formattedPrivateKey = privateKey;
if (formattedPrivateKey) {
  if (formattedPrivateKey.startsWith('"') && formattedPrivateKey.endsWith('"')) {
    formattedPrivateKey = formattedPrivateKey.slice(1, -1);
  }
  if (formattedPrivateKey.startsWith("'") && formattedPrivateKey.endsWith("'")) {
    formattedPrivateKey = formattedPrivateKey.slice(1, -1);
  }
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
  } catch (error) {
    console.error('Firebase admin initialization error', error.stack);
  }
} else {
  console.warn('Firebase Admin env vars missing. Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set.');
}

export { adminDb, adminApp };
