import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/utils/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { targetUid } = await req.json();

    if (!targetUid) {
      return NextResponse.json({ error: 'Missing target user ID' }, { status: 400 });
    }

    const { adminAuth, adminDb } = await getFirebaseAdmin();

    // 1. Delete user from Firebase Authentication if adminAuth is initialized
    if (adminAuth) {
      try {
        await adminAuth.deleteUser(targetUid);
      } catch (authErr) {
        console.warn(`[admin-delete-user] Warning: Failed to delete user from Firebase Auth:`, authErr.message);
      }
    }

    // 2. Delete user document from Firestore
    if (adminDb) {
      await adminDb.collection('users').doc(targetUid).delete();
    }

    return NextResponse.json({ success: true, message: 'تم حذف المستخدم من Firestore ومن نظام المصادقة بنجاح' }, { status: 200 });
  } catch (err) {
    console.error('[admin-delete-user] Error:', err);
    return NextResponse.json({ error: err.message || 'فشل في حذف الحساب' }, { status: 500 });
  }
}
