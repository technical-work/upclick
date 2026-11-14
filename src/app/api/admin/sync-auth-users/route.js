import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyAdminRequest } from '@/lib/admin/verifyAdminRequest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const cleanEnvVar = (val) => {
  if (!val) return '';
  let cleaned = String(val).trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').trim();
};

async function getGoogleAccessToken() {
  let projectId = cleanEnvVar(process.env.FIREBASE_PROJECT_ID);
  let clientEmail = cleanEnvVar(process.env.FIREBASE_CLIENT_EMAIL);
  let privateKey = cleanEnvVar(process.env.FIREBASE_PRIVATE_KEY);

  if ((!projectId || !privateKey) && process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      projectId = parsed.project_id || projectId;
      clientEmail = parsed.client_email || clientEmail;
      privateKey = cleanEnvVar(parsed.private_key) || privateKey;
    } catch {
      // ignore
    }
  }

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin credentials in environment');
  }

  let serverNowSec = Math.floor(Date.now() / 1000);
  try {
    const head = await fetch('https://www.googleapis.com', { method: 'HEAD', cache: 'no-store' });
    const dateHdr = head.headers.get('date');
    if (dateHdr) {
      const parsedMs = new Date(dateHdr).getTime();
      if (!isNaN(parsedMs)) serverNowSec = Math.floor(parsedMs / 1000);
    }
  } catch {
    // fallback to local clock
  }

  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claim = Buffer.from(
    JSON.stringify({
      iss: clientEmail,
      scope:
        'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/firebase https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/datastore',
      aud: 'https://oauth2.googleapis.com/token',
      iat: serverNowSec - 10,
      exp: serverNowSec + 3500
    })
  ).toString('base64url');

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${header}.${claim}`);
  const jwt = `${header}.${claim}.${sign.sign(privateKey, 'base64url')}`;

  const tokRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });
  const tokData = await tokRes.json();
  if (!tokData.access_token) {
    throw new Error(tokData.error_description || tokData.error || 'Failed to obtain Google OAuth2 token');
  }

  return { token: tokData.access_token, projectId, serverNowSec };
}

export async function POST(req) {
  const authCheck = await verifyAdminRequest(req);
  if (!authCheck.ok) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const { token, projectId, serverNowSec } = await getGoogleAccessToken();

    // 1. Fetch all Firebase Auth accounts
    const authUsers = [];
    let nextPageToken = '';
    do {
      const url = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:batchGet?maxResults=500${
        nextPageToken ? '&nextPageToken=' + encodeURIComponent(nextPageToken) : ''
      }`;
      const authRes = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const authData = await authRes.json();
      if (authData.users) authUsers.push(...authData.users);
      nextPageToken = authData.nextPageToken || '';
    } while (nextPageToken);

    // 2. Fetch all Firestore user documents
    const firestoreUsers = new Map();
    let pageToken = '';
    do {
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users?pageSize=300${
        pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : ''
      }`;
      const fsRes = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const fsData = await fsRes.json();
      for (const doc of fsData.documents || []) {
        const uid = doc.name.split('/').pop();
        firestoreUsers.set(uid, doc.fields || {});
      }
      pageToken = fsData.nextPageToken || '';
    } while (pageToken);

    // 3. Find any Auth user missing from Firestore or missing email/uid
    const toPatch = [];
    for (const u of authUsers) {
      if (!u.email) continue;
      const fsFields = firestoreUsers.get(u.localId);
      const existingEmail = fsFields?.email?.stringValue || '';
      if (!fsFields || !existingEmail) {
        const gcProfileName =
          fsFields?.GC?.mapValue?.fields?.profile?.mapValue?.fields?.name?.stringValue || '';
        const existingName = fsFields?.name?.stringValue || '';
        const derivedName = existingName || u.displayName || gcProfileName || u.email.split('@')[0];
        const createdIso = u.createdAt
          ? new Date(Number(u.createdAt)).toISOString()
          : new Date(serverNowSec * 1000).toISOString();

        const patchFields = {
          uid: { stringValue: u.localId },
          email: { stringValue: u.email }
        };
        const updateMask = ['uid', 'email'];

        if (!existingName) {
          patchFields.name = { stringValue: derivedName };
          updateMask.push('name');
        }
        if (!fsFields?.role?.stringValue) {
          patchFields.role = { stringValue: 'user' };
          updateMask.push('role');
        }
        if (!fsFields?.adminId?.stringValue) {
          patchFields.adminId = { stringValue: 'global' };
          updateMask.push('adminId');
        }
        if (!fsFields?.createdAt) {
          patchFields.createdAt = { stringValue: createdIso };
          updateMask.push('createdAt');
        }
        if (fsFields?.isTrial === undefined && !fsFields?.plan && !fsFields?.expiresAt) {
          patchFields.isTrial = { booleanValue: true };
          updateMask.push('isTrial');
        }
        if (!fsFields?.trialStartedAt && !fsFields?.plan && !fsFields?.expiresAt) {
          patchFields.trialStartedAt = { stringValue: createdIso };
          updateMask.push('trialStartedAt');
        }
        if (fsFields?.aiCredits === undefined) {
          patchFields.aiCredits = { integerValue: '500' };
          updateMask.push('aiCredits');
        }

        toPatch.push({ uid: u.localId, email: u.email, patchFields, updateMask });
      }
    }

    const BATCH_SIZE = 200;
    let syncedCount = 0;
    for (let i = 0; i < toPatch.length; i += BATCH_SIZE) {
      const chunk = toPatch.slice(i, i + BATCH_SIZE);
      const writes = chunk.map((item) => ({
        update: {
          name: `projects/${projectId}/databases/(default)/documents/users/${item.uid}`,
          fields: item.patchFields
        },
        updateMask: {
          fieldPaths: item.updateMask
        }
      }));

      const commitRes = await fetch(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ writes })
        }
      );

      if (commitRes.ok) {
        syncedCount += chunk.length;
      }
    }

    return NextResponse.json({
      success: true,
      totalAuthUsers: authUsers.length,
      totalFirestoreUsers: firestoreUsers.size,
      syncedCount,
      syncedEmails: toPatch.slice(0, 30).map((x) => x.email)
    });
  } catch (err) {
    console.error('[sync-auth-users] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to sync users' }, { status: 500 });
  }
}

