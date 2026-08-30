import { NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/admin/verifyAdminRequest';
import { whatsappStatus } from '@/services/whatsapp/TwilioWhatsAppProvider';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.ok) return auth.response;

    return NextResponse.json({
      success: true,
      emailConfigured: Boolean(process.env.RESEND_API_KEY),
      whatsapp: whatsappStatus(),
      cronConfigured: Boolean(String(process.env.CRON_SECRET || '').trim())
    });
  } catch (err) {
    console.error('[outreach/status]', err);
    return NextResponse.json({ error: err.message || 'Status failed' }, { status: 500 });
  }
}
