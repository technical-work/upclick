import React, { Suspense } from 'react';
import LegalPageContent from '@/components/LegalPageContent';

export const metadata = {
  title: 'Shipping & Delivery Policy | UpKlick',
  description:
    'UpKlick Shipping & Delivery Policy — There is no shipping. UpKlick is a 100% digital cloud SaaS platform with instant online service delivery.',
  robots: {
    index: true,
    follow: true
  }
};

export default function ShippingPolicyPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#08080f', color: '#fff', padding: 40 }}>Loading Shipping Policy...</div>}>
      <LegalPageContent section="shipping" />
    </Suspense>
  );
}

