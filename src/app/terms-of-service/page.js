import React, { Suspense } from 'react';
import LegalPageContent from '@/components/LegalPageContent';

export const metadata = {
  title: 'Terms of Service | UpKlick',
  description:
    'UpKlick Terms of Service — The legal terms and conditions governing your access to and use of the UpKlick platform and integrations.',
  robots: {
    index: true,
    follow: true
  }
};

export default function TermsOfServicePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#08080f', color: '#fff', padding: 40 }}>Loading Terms of Service...</div>}>
      <LegalPageContent section="terms" />
    </Suspense>
  );
}

