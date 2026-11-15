import React, { Suspense } from 'react';
import LegalPageContent from '@/components/LegalPageContent';

export const metadata = {
  title: 'Refund & Cancellation Policy | UpKlick',
  description:
    'UpKlick Refund & Cancellation Policy — There is no refund on digital SaaS subscriptions once activated. Learn about our subscription cancellation terms.',
  robots: {
    index: true,
    follow: true
  }
};

export default function RefundPolicyPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#08080f', color: '#fff', padding: 40 }}>Loading Refund Policy...</div>}>
      <LegalPageContent section="refund" />
    </Suspense>
  );
}

