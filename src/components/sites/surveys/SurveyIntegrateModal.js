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
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
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
          background: 'var(--surface)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '620px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid var(--edge)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--edge)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(37, 99, 235, 0.12)',
                color: 'var(--a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Share2 size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--t1)' }}>
                {isRtl ? 'تضمين ومشاركة الاستبيان' : 'Integrate & Share Survey'}
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--t2)' }}>{survey.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            padding: '8px 16px',
            background: 'var(--surface2)',
            borderBottom: '1px solid var(--edge)',
            gap: '6px'
          }}
        >
          {[
            { id: 'link', label: isRtl ? 'رابط مباشر' : 'Direct Link', icon: ExternalLink },
            { id: 'embed', label: isRtl ? 'تضمين iframe' : 'Embed Iframe', icon: Code2 },
            { id: 'popup', label: isRtl ? 'نافذة منبثقة' : 'Popup Modal', icon: Layers }
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
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  background: isActive ? 'var(--surface)' : 'transparent',
                  color: isActive ? 'var(--a)' : 'var(--t2)',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {activeTab === 'link' && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--t1)', marginBottom: '8px' }}>
                {isRtl ? 'رابط الاستبيان المباشر' : 'Direct Survey URL'}
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                  type="text"
                  readOnly
                  value={surveyUrl}
                  className="inp"
                  style={{ flex: 1, fontSize: '13px' }}
                />
                <button
                  type="button"
                  onClick={() => handleCopy(surveyUrl, 'link')}
                  style={{
                    background: copiedType === 'link' ? '#16a34a' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {copiedType === 'link' ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedType === 'link' ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ' : 'Copy')}</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href={surveyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    color: 'var(--a)'
                  }}
                >
                  <ExternalLink size={14} />
                  <span>{isRtl ? 'فتح في لسان جديد' : 'Open in New Tab'}</span>
                </a>
              </div>
            </div>
          )}

          {activeTab === 'embed' && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--t1)', marginBottom: '8px' }}>
                {isRtl ? 'كود التضمين (HTML Iframe)' : 'Embed Code (HTML Iframe)'}
              </label>
              <textarea
                rows={4}
                readOnly
                value={iframeEmbedCode}
                className="inp"
                style={{
                  width: '100%',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  marginBottom: '16px',
                  resize: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => handleCopy(iframeEmbedCode, 'embed')}
                style={{
                  background: copiedType === 'embed' ? '#16a34a' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {copiedType === 'embed' ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedType === 'embed' ? (isRtl ? 'تم نسخ كود التضمين' : 'Copied') : (isRtl ? 'نسخ كود التضمين' : 'Copy Embed Code')}</span>
              </button>
            </div>
          )}

          {activeTab === 'popup' && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--t1)', marginBottom: '8px' }}>
                {isRtl ? 'كود النافذة المنبثقة (Popup Widget)' : 'Popup Widget Script'}
              </label>
              <textarea
                rows={3}
                readOnly
                value={popupScriptCode}
                className="inp"
                style={{
                  width: '100%',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  marginBottom: '16px',
                  resize: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => handleCopy(popupScriptCode, 'popup')}
                style={{
                  background: copiedType === 'popup' ? '#16a34a' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {copiedType === 'popup' ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedType === 'popup' ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ الكود' : 'Copy Script')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--edge)',
            background: 'var(--surface2)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost"
            style={{ fontSize: '13px', fontWeight: '600' }}
          >
            {isRtl ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
