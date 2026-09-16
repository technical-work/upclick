import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { verifyAdminRequest } from '@/lib/admin/verifyAdminRequest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.ok) return auth.response;

    let snap;
    try {
      snap = await auth.adminDb.collection('email_custom_templates').orderBy('createdAt', 'desc').get();
    } catch {
      snap = await auth.adminDb.collection('email_custom_templates').get();
    }

    const templates = snap.docs.map((doc) => {
      const data = doc.data() || {};
      return {
        id: doc.id,
        name: data.name || 'قالب مخصص',
        description: data.description || '',
        category: data.category || 'custom',
        thumbnail: data.thumbnail || '✨',
        blocks: data.blocks || [],
        theme: data.theme || null,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || null,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt || null,
        createdBy: data.createdBy || null
      };
    });

    return NextResponse.json({ success: true, templates });
  } catch (err) {
    console.error('[outreach/templates GET]', err);
    return NextResponse.json({ error: err.message || 'Failed to list templates' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const name = String(body.name || '').trim();
    if (!name) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
    }

    const templateData = {
      name,
      description: String(body.description || '').trim(),
      category: String(body.category || 'custom').trim(),
      thumbnail: String(body.thumbnail || '🎨').trim(),
      blocks: Array.isArray(body.blocks) ? body.blocks : [],
      theme: body.theme || null,
      createdBy: { uid: auth.uid, email: auth.email },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    const ref = await auth.adminDb.collection('email_custom_templates').add(templateData);
    const snap = await ref.get();
    const data = snap.data() || {};

    return NextResponse.json({
      success: true,
      template: {
        id: ref.id,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('[outreach/templates POST]', err);
    return NextResponse.json({ error: err.message || 'Failed to save custom template' }, { status: 500 });
  }
}
