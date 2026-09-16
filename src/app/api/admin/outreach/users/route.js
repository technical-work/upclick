import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin/verifyAdminRequest';
import { searchUsers } from '@/lib/outreach/audience';
import { maskEmail, maskPhone } from '@/lib/outreach/tokens';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = req.nextUrl;
    const q = searchParams.get('q') || '';
    const page = Number(searchParams.get('page') || 1);
    const pageSize = Number(searchParams.get('pageSize') || 20);
    const trialOnly = searchParams.get('trialOnly') === 'true';
    const result = await searchUsers(auth.adminDb, { q, page, pageSize, trialOnly });
    return NextResponse.json({
      success: true,
      ...result,
      users: result.users.map((u) => ({
        ...u,
        emailMasked: maskEmail(u.email),
        phoneMasked: maskPhone(u.phone)
      }))
    });
  } catch (err) {
    console.error('[outreach/users]', err);
    return NextResponse.json({ error: err.message || 'User search failed' }, { status: 500 });
  }
}
