'use client';

import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Code,
  Globe,
  Share2,
  QrCode
} from 'lucide-react';

export default function QuizIntegrateModal({
  quiz,
  isRtl = false,
  onClose,
  showToast = () => {}
}) {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!quiz) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.upklick.io';
  const directUrl = `${origin}/s/quiz_${quiz.id}`;
  const iframeCode = `<iframe src="${directUrl}" width="100%" height="680" frameborder="0" style="border:none; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.15);" allow="camera; microphone; autoplay"></iframe>`;
  const popupCode = `<button onclick="window.open('${directUrl}', 'upklickQuiz', 'width=700,height=800')" style="background:#2563eb; color:#fff; padding:12px 24px; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">${isRtl ? 'ابدأ الاختبار الآن' : 'Take Quiz Now'}</button>`;

  const copyToClipboard = (text, key) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      showToast(isRtl ? 'تم النسخ بنجاح!' : 'Copied to clipboard!');
      setTimeout(() => setCopiedKey(null), 2000);
    }
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
        zIndex: 1000,
        padding: '20px',
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--edge)',
          borderRadius: '16px',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          padding: '28px',
          direction: isRtl ? 'rtl' : 'ltr'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--edge)',
            paddingBottom: '16px',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(37, 99, 235, 0.12)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Share2 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--t1)' }}>
                {isRtl ? 'مشاركة وتضمين الاختبار' : 'Share & Embed Quiz'}
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--t2)' }}>
                {quiz.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--t2)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* 1. Direct Link */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={15} color="var(--a)" />
              {isRtl ? 'الرابط المباشر للاختبار' : 'Direct Quiz Link'}
            </label>
            <a
              href={directUrl}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: '12px', color: 'var(--a)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {isRtl ? 'فتح في نافذة جديدة' : 'Open Link'}
              <ExternalLink size={12} />
            </a>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              readOnly
              value={directUrl}
              style={{
                flex: 1,
                background: 'var(--surface2)',
                border: '1px solid var(--edge)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'var(--t1)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
            <button
              onClick={() => copyToClipboard(directUrl, 'direct')}
              style={{
                background: copiedKey === 'direct' ? '#10b981' : 'var(--a)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0 16px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background 0.2s'
              }}
            >
              {copiedKey === 'direct' ? <Check size={16} /> : <Copy size={16} />}
              {copiedKey === 'direct' ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ' : 'Copy')}
            </button>
          </div>
        </div>

        {/* 2. Iframe Embed */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--t1)', marginBottom: '8px' }}>
            <Code size={15} color="var(--a)" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
            {isRtl ? 'كود التضمين في موقعك (Iframe Embed)' : 'Embed Code (Iframe)'}
          </label>
          <div style={{ position: 'relative' }}>
            <textarea
              readOnly
              rows={3}
              value={iframeCode}
              style={{
                width: '100%',
                background: 'var(--surface2)',
                border: '1px solid var(--edge)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'var(--t1)',
                fontSize: '12px',
                fontFamily: 'monospace',
                outline: 'none',
                resize: 'none'
              }}
            />
            <button
              onClick={() => copyToClipboard(iframeCode, 'iframe')}
              style={{
                position: 'absolute',
                top: '8px',
                [isRtl ? 'left' : 'right']: '8px',
                background: copiedKey === 'iframe' ? '#10b981' : 'var(--surface)',
                border: '1px solid var(--edge)',
                color: 'var(--t1)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {copiedKey === 'iframe' ? <Check size={14} /> : <Copy size={14} />}
              {copiedKey === 'iframe' ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ الكود' : 'Copy')}
            </button>
          </div>
        </div>

        {/* 3. Popup Button Code */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--t1)', marginBottom: '8px' }}>
            {isRtl ? 'زر الفتح المنبثق (Popup Button Code)' : 'Popup Button Embed'}
          </label>
          <div style={{ position: 'relative' }}>
            <textarea
              readOnly
              rows={2}
              value={popupCode}
              style={{
                width: '100%',
                background: 'var(--surface2)',
                border: '1px solid var(--edge)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'var(--t1)',
                fontSize: '12px',
                fontFamily: 'monospace',
                outline: 'none',
                resize: 'none'
              }}
            />
            <button
              onClick={() => copyToClipboard(popupCode, 'popup')}
              style={{
                position: 'absolute',
                top: '8px',
                [isRtl ? 'left' : 'right']: '8px',
                background: copiedKey === 'popup' ? '#10b981' : 'var(--surface)',
                border: '1px solid var(--edge)',
                color: 'var(--t1)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {copiedKey === 'popup' ? <Check size={14} /> : <Copy size={14} />}
              {copiedKey === 'popup' ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ الكود' : 'Copy')}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--edge)', paddingTop: '16px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--edge)',
              color: 'var(--t1)',
              borderRadius: '8px',
              padding: '8px 20px',
              fontSize: '13.5px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {isRtl ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
