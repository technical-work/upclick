'use client';

import React, { Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import LiveSiteView from '@/components/sites/LiveSiteView';
import PublicFormRunner from '@/components/sites/forms/PublicFormRunner';
import PublicSurveyRunner from '@/components/sites/surveys/PublicSurveyRunner';
import PublicQuizRunner from '@/components/sites/quizzes/PublicQuizRunner';
import PublicQRRunner from '@/components/sites/qrcodes/PublicQRRunner';

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

  // Handle /s/qr/[qrId] or /s/qr_[id]
  if (rawFunnelId === 'qr' && segments[0]) {
    return <PublicQRRunner qrId={segments[0]} />;
  }
  if (funnelId.startsWith('qr_') || funnelId.startsWith('qr-')) {
    return <PublicQRRunner qrId={funnelId} />;
  }

  // Handle /s/quiz/[quizId] or /s/quiz_[id] or /s/qz_[id]
  if (rawFunnelId === 'quiz' && segments[0]) {
    return <PublicQuizRunner quizId={segments[0]} />;
  }
  if (funnelId.startsWith('quiz_') || funnelId.startsWith('qz_')) {
    return <PublicQuizRunner quizId={funnelId} />;
  }

  // Handle /s/survey/[surveyId] or /s/survey_[id] or /s/srv_[id]
  if (rawFunnelId === 'survey' && segments[0]) {
    return <PublicSurveyRunner surveyId={segments[0]} />;
  }
  if (funnelId.startsWith('survey_') || funnelId.startsWith('srv_')) {
    return <PublicSurveyRunner surveyId={funnelId} />;
  }

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
