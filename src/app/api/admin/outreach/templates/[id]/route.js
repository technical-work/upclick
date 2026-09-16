import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { verifyAdminRequest } from '@/lib/admin/verifyAdminRequest';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(req, { params }) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.ok) return auth.response;

    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Missing template id' }, { status: 400 });

    await auth.adminDb.collection('email_custom_templates').doc(id).delete();
    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error('[outreach/templates DELETE]', err);
    return NextResponse.json({ error: err.message || 'Failed to delete template' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.ok) return auth.response;

    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Missing template id' }, { status: 400 });

    const body = await req.json();
    const updateData = {
      updatedAt: FieldValue.serverTimestamp()
    };

    if (body.name) updateData.name = String(body.name).trim();
    if (body.description !== undefined) updateData.description = String(body.description).trim();
    if (body.thumbnail) updateData.thumbnail = String(body.thumbnail).trim();
    if (body.blocks) updateData.blocks = body.blocks;
    if (body.theme) updateData.theme = body.theme;

    const ref = auth.adminDb.collection('email_custom_templates').doc(id);
    await ref.set(updateData, { merge: true });

    const snap = await ref.get();
    return NextResponse.json({ success: true, template: { id: snap.id, ...snap.data() } });
  } catch (err) {
    console.error('[outreach/templates PATCH]', err);
    return NextResponse.json({ error: err.message || 'Failed to update template' }, { status: 500 });
  }
}
