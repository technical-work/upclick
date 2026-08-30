'use client';

import React, { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import LiveSiteView from '@/components/sites/LiveSiteView';

function PublicSiteContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const funnelId = decodeURIComponent(params?.funnelId || '');
  const segments = Array.isArray(params?.path) ? params.path : [];
  const path = segments.length ? `/${segments.join('/')}` : '/';
  const productId = searchParams?.get('productId') || '';
  const isStore = funnelId.startsWith('store_');

  return (
    <LiveSiteView
      funnelId={funnelId}
      storeId={isStore ? funnelId : ''}
      path={path}
      productId={productId}
    />
  );
}

export default function PublicFunnelPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', background: '#0a0a0f', color: '#fff' }}>Loading store...</div>}>
      <PublicSiteContent />
    </Suspense>
  );
}
