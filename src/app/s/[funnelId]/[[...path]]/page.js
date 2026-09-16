'use client';

import React, { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import LiveSiteView from '@/components/sites/LiveSiteView';
import PublicFormRunner from '@/components/sites/forms/PublicFormRunner';

function PublicSiteContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawFunnelId = decodeURIComponent(params?.funnelId || '');
  const isCustomDomainRoute = rawFunnelId === '_custom_domain' || rawFunnelId === '_domain';
  const customHost = searchParams?.get('_host') || (typeof window !== 'undefined' ? window.location.hostname : '');
  const funnelId = isCustomDomainRoute ? '' : rawFunnelId;
  const segments = Array.isArray(params?.path) ? params.path : [];
  const path = segments.length ? `/${segments.join('/')}` : '/';
  const productId = searchParams?.get('productId') || '';
  const isStore = funnelId.startsWith('store_');

  // Handle /s/form/[formId] or /s/form_[id]
  if (rawFunnelId === 'form' && segments[0]) {
    return <PublicFormRunner formId={segments[0]} />;
  }
  if (funnelId.startsWith('form_')) {
    return <PublicFormRunner formId={funnelId} />;
  }

  return (
    <LiveSiteView
      funnelId={funnelId}
      storeId={isStore ? funnelId : ''}
      host={isCustomDomainRoute ? customHost : ''}
      path={path}
      productId={productId}
    />
  );
}

export default function PublicFunnelPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', background: '#0a0a0f', color: '#fff' }}>Loading site...</div>}>
      <PublicSiteContent />
    </Suspense>
  );
}
