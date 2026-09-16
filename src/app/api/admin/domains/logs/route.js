import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin/verifyAdminRequest';
import { serializeTs } from '@/lib/domains/constants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return auth.response;
  const orderId = String(req.nextUrl.searchParams.get('orderId') || '').trim();
  const snap = await auth.adminDb.collection('domain_registrar_logs').limit(80).get();
  let logs = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: serializeTs(d.data().createdAt)
  }));
  if (orderId) logs = logs.filter((l) => l.orderId === orderId);
  logs.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  return NextResponse.json({ logs: logs.slice(0, 50) });
}
