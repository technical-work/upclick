import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { verifyAdminRequest } from '@/lib/admin/verifyAdminRequest';
import { sendToRecipient } from '@/lib/outreach/dispatch';
import { isWhatsAppEnabled } from '@/services/whatsapp/TwilioWhatsAppProvider';
import { serializeCampaign } from '@/lib/outreach/campaigns';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req, { params }) {
  const auth = await verifyAdminRequest(req);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'Missing campaign id' }, { status: 400 });

  const snap = await auth.adminDb.collection('campaigns').doc(id).get();
  if (!snap.exists) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  const campaign = { id, ...snap.data() };

  if (campaign.channel === 'whatsapp' && !isWhatsAppEnabled()) {
    return NextResponse.json({
      error: 'WhatsApp is disabled until Twilio template env vars are configured.'
    }, { status: 400 });
  }

  let reqBody = {};
  try {
    reqBody = await req.json();
  } catch {
    // empty body is acceptable
  }

  const customEmail = String(reqBody.testEmail || '').trim();
  const customPhone = String(reqBody.testPhone || '').trim();

  const targetEmail = customEmail || auth.email || auth.userData?.email;
  const targetPhone = customPhone || auth.userData?.phoneNumber || '';

  const testUser = {
    id: auth.uid,
    email: targetEmail,
    name: auth.userData?.name || 'Admin Preview',
    phoneNumber: targetPhone,
    displayName: auth.userData?.name || 'Admin Preview'
  };

  if (campaign.channel === 'whatsapp' && !testUser.phoneNumber) {
    return NextResponse.json({ error: 'Please provide a valid phone number for the WhatsApp test' }, { status: 400 });
  }
  if (campaign.channel === 'email' && !testUser.email) {
    return NextResponse.json({ error: 'Please provide a valid email address for the test send' }, { status: 400 });
  }

  const result = await sendToRecipient({
    campaign,
    user: { ...testUser, marketingOptOut: false, emailOptOut: false, whatsappOptOut: false },
    userId: auth.uid,
    isTest: true
  });

  if (result.status !== 'sent') {
    return NextResponse.json({
      success: false,
      error: result.error || result.reason || 'Test send failed'
    }, { status: 500 });
  }

  await snap.ref.set({
    testSentAt: FieldValue.serverTimestamp(),
    testSentTo: campaign.channel === 'email' ? testUser.email : testUser.phoneNumber,
    testProviderId: result.providerId || null
  }, { merge: true });

  const updated = await snap.ref.get();
  return NextResponse.json({
    success: true,
    campaign: serializeCampaign(updated),
    sentTo: campaign.channel === 'email' ? testUser.email : testUser.phoneNumber
  });
}
