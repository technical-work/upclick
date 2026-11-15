import React, { Suspense } from 'react';
import LegalPageContent from '@/components/LegalPageContent';

export const metadata = {
  title: 'Contact Us | UpKlick',
  description:
    'Contact UpKlick in Egypt — Mobile: +20 103 897 9275 (01038979275), Email: upklickofficial@gmail.com, Address: 14 Makram Ebeid St., Nasr City, Cairo, Egypt.',
  robots: {
    index: true,
    follow: true
  }
};

export default function ContactUsPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#08080f', color: '#fff', padding: 40 }}>Loading Contact Us...</div>}>
      <LegalPageContent section="contact" />
    </Suspense>
  );
}

