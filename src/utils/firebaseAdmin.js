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

export async function getFirebaseAdmin() {
  try {
    const { getApps, initializeApp, cert } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');
    const { getAuth } = await import('firebase-admin/auth');

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
    console.error('[firebaseAdmin] Dynamic initialization error:', error.message);
    return { adminApp: null, adminDb: null, adminAuth: null };
  }
}

export let adminApp = null;
export let adminDb = null;
export let adminAuth = null;
