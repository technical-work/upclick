import React, { Suspense } from 'react';
import LegalPageContent from '@/components/LegalPageContent';

export const metadata = {
  title: 'User Data Deletion Instructions | UpKlick',
  description:
    'Instructions and request form to revoke Meta permissions and permanently delete your UpKlick account and associated user data.',
  robots: {
    index: true,
    follow: true
  }
};

export default function DataDeletionPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#08080f', color: '#fff', padding: 40 }}>Loading Data Deletion Instructions...</div>}>
      <LegalPageContent section="deletion" />
    </Suspense>
  );
}

