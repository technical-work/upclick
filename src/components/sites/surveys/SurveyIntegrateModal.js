'use client';

import React, { useState } from 'react';
import { Copy, Check, X, ExternalLink, Code2, QrCode, Share2, Layers } from 'lucide-react';

export default function SurveyIntegrateModal({
  isOpen,
  onClose,
  survey,
  isRtl,
  showToast
}) {
  const [copiedType, setCopiedType] = useState('');
  const [activeTab, setActiveTab] = useState('link'); // 'link' | 'embed' | 'popup'

  if (!isOpen || !survey) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.upklick.co';
  const surveyUrl = `${origin}/s/survey_${survey.id}`;

  const iframeEmbedCode = `<iframe 
  src="${surveyUrl}" 
  style="width: 100%; height: 680px; border: none; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.08);" 
  title="${survey.name}">
</iframe>`;

  const popupScriptCode = `<script src="${origin}/embed/survey-popup.js" data-survey-id="${survey.id}" data-trigger="button" defer></script>`;

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    if (showToast) showToast(isRtl ? 'تم نسخ الرابط بنجاح' : 'Copied to clipboard');
    setTimeout(() => setCopiedType(''), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '20px',
        direction: isRtl ? 'rtl' : 'ltr'
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '620px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
              {isRtl ? `مشاركة وتضمين الاستبيان: ${survey.name}` : `Share & Integrate Survey: ${survey.name}`}
            </h3>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
              {isRtl ? 'استخدم الرابط المباشر أو كود التضمين في موقعك' : 'Use the direct link or embed code to collect responses'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 16px' }}>
          {[
            { id: 'link', label: isRtl ? 'الرابط المباشر' : 'Direct Link', icon: Share2 },
            { id: 'embed', label: isRtl ? 'كود التضمين (iFrame)' : 'Embed Code', icon: Code2 },
            { id: 'popup', label: isRtl ? 'نافذة منبثقة (Popup)' : 'Popup Widget', icon: Layers }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                  color: isActive ? '#2563eb' : '#64748b',
                  fontSize: '13px',
                  fontWeight: isActive ? '700' : '600',
                  cursor: 'pointer'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {activeTab === 'link' && (
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                {isRtl ? 'الرابط العام للاستبيان' : 'Public Survey URL'}
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                  type="text"
                  readOnly
                  value={surveyUrl}
                  className="inp"
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    background: '#f8fafc',
                    color: '#0f172a'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleCopy(surveyUrl, 'link')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: copiedType === 'link' ? '#16a34a' : '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {copiedType === 'link' ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedType === 'link' ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'نسخ' : 'Copy')}</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => window.open(surveyUrl, '_blank')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#2563eb',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <ExternalLink size={14} />
                  <span>{isRtl ? 'فتح المعاينة في صفحة جديدة' : 'Open in New Tab'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'embed' && (
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                {isRtl ? 'كود التضمين المباشر (HTML)' : 'Embed Code (HTML iFrame)'}
              </label>
              <textarea
                readOnly
                rows={4}
                value={iframeEmbedCode}
                className="inp"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  background: '#f8fafc',
                  color: '#0f172a',
                  marginBottom: '14px',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => handleCopy(iframeEmbedCode, 'embed')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: copiedType === 'embed' ? '#16a34a' : '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 20px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {copiedType === 'embed' ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedType === 'embed' ? (isRtl ? 'تم نسخ الكود!' : 'Copied!') : (isRtl ? 'نسخ كود التضمين' : 'Copy Embed Code')}</span>
              </button>
            </div>
          )}

          {activeTab === 'popup' && (
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                {isRtl ? 'كود النافذة المنبثقة' : 'Popup Script Code'}
              </label>
              <textarea
                readOnly
                rows={3}
                value={popupScriptCode}
                className="inp"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  background: '#f8fafc',
                  color: '#0f172a',
                  marginBottom: '14px',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => handleCopy(popupScriptCode, 'popup')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: copiedType === 'popup' ? '#16a34a' : '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 20px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {copiedType === 'popup' ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedType === 'popup' ? (isRtl ? 'تم نسخ الكود!' : 'Copied!') : (isRtl ? 'نسخ كود الـ Popup' : 'Copy Popup Script')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
