import React, { Suspense } from 'react';
import LegalPageContent from '@/components/LegalPageContent';

export const metadata = {
  title: 'Privacy Policy | UpKlick',
  description:
    'UpKlick Privacy Policy — Learn how we collect, use, store, and protect your personal data and Meta Platform integrations.',
  robots: {
    index: true,
    follow: true
  }
};

export default function PrivacyPolicyPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#08080f', color: '#fff', padding: 40 }}>Loading Privacy Policy...</div>}>
      <LegalPageContent section="privacy" />
    </Suspense>
  );
}

