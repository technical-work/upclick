import React, { Suspense } from 'react';
import CheckoutPageContent from '@/components/CheckoutPageContent';

export const metadata = {
  title: 'Checkout & Subscription Plans | UpKlick',
  description:
    'Subscribe to UpKlick digital SaaS plans (Starter 299 EGP, Growth 499 EGP, Pro 799 EGP) via secure Paymob checkout.',
  robots: {
    index: true,
    follow: true
  }
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#08080f', color: '#fff', padding: 40 }}>Loading Secure Checkout...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}

