'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LiveSiteView from '@/components/sites/LiveSiteView';

function LiveSiteContent() {
  const searchParams = useSearchParams();
  const funnelId = searchParams?.get('funnelId') || '';
  const storeId = searchParams?.get('storeId') || '';
  const stepIdx = Number(searchParams?.get('stepIdx') || searchParams?.get('pageIdx') || 0);
  const isDraft = searchParams?.get('draft') === '1';
  const host = searchParams?.get('host') || '';
  const path = searchParams?.get('path') || '';
  const productId = searchParams?.get('productId') || '';

  return (
    <LiveSiteView
      funnelId={funnelId}
      storeId={storeId}
      stepIdx={stepIdx}
      path={path}
      host={host}
      isDraft={isDraft}
      productId={productId}
    />
  );
}

export default function LiveSitePage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', background: '#0a0a0f', color: '#fff' }}>Loading website...</div>}>
      <LiveSiteContent />
    </Suspense>
  );
}
