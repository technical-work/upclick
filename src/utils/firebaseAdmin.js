const cleanEnvVar = (val) => {
  if (!val) return null;
  let cleaned = String(val).trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  cleaned = cleaned.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').trim();
  return cleaned || null;
};

function parsePrivateKey(rawKey) {
  if (!rawKey) return null;
  let key = cleanEnvVar(rawKey);
  if (!key) return null;

  // Handle potential base64 encoded private key
  if (!key.includes('BEGIN') && /^[A-Za-z0-9+/=\s]+$/.test(key) && key.length > 200) {
    try {
      const decoded = Buffer.from(key, 'base64').toString('utf8');
      if (decoded.includes('BEGIN PRIVATE KEY') || decoded.includes('BEGIN RSA PRIVATE KEY')) {
        key = decoded;
      }
    } catch {
      // not base64
    }
  }

  // Ensure escaped \n are converted to real line breaks
  key = key.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').trim();
  return key;
}

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

    let projectId = cleanEnvVar(process.env.FIREBASE_PROJECT_ID);
    let clientEmail = cleanEnvVar(process.env.FIREBASE_CLIENT_EMAIL);
    let privateKey = parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    // Also support full JSON if passed via FIREBASE_SERVICE_ACCOUNT
    if ((!projectId || !privateKey) && process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        projectId = parsed.project_id || projectId;
        clientEmail = parsed.client_email || clientEmail;
        privateKey = parsePrivateKey(parsed.private_key) || privateKey;
      } catch (e) {
        console.warn('[firebaseAdmin] Could not parse FIREBASE_SERVICE_ACCOUNT JSON:', e.message);
      }
    }

    if (!projectId || !privateKey || !privateKey.includes('PRIVATE KEY')) {
      console.warn('[firebaseAdmin] Invalid or missing FIREBASE_PRIVATE_KEY/FIREBASE_PROJECT_ID in environment variables.');
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
