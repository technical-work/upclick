'use client';

import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, QrCode, Code, Layers, Sparkles, Globe } from 'lucide-react';

export default function FormIntegrateModal({
  isOpen,
  onClose,
  form,
  isRtl,
  showToast
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [embedType, setEmbedType] = useState('inline'); // 'inline' | 'popup' | 'sidebar'
  const [showQr, setShowQr] = useState(false);

  if (!isOpen || !form) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.upklick.co';
  const shareUrl = `${origin}/s/form/${form.id}`;
  
  const iframeCode = `<iframe
  src="${shareUrl}"
  style="border:none;width:100%;min-height:550px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.06);"
  scrolling="no"
  id="upklick-form-${form.id}"
></iframe>
<script src="${origin}/embed-form.js" async></script>`;

  const popupCode = `<button onclick="window.UpKlickForm && window.UpKlickForm.open('${form.id}')" style="background:#2563eb;color:#fff;padding:12px 24px;border:none;border-radius:8px;font-weight:700;cursor:pointer;">
  ${form.name || 'Open Form'}
</button>
<script src="${origin}/embed-form.js" data-form-id="${form.id}" async></script>`;

  const activeCode = embedType === 'inline' ? iframeCode : popupCode;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    if (showToast) showToast(isRtl ? 'تم نسخ الرابط بنجاح' : 'Form URL copied to clipboard');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCode);
    setCopiedCode(true);
    if (showToast) showToast(isRtl ? 'تم نسخ كود التضمين' : 'Embed code copied to clipboard');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px',
        direction: isRtl ? 'rtl' : 'ltr'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--edge)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '640px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
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
                background: 'rgba(37, 99, 235, 0.15)',
                color: 'var(--a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Code size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--t1)' }}>
                {isRtl ? 'تضمين ومشاركة النموذج' : 'Integrate & Share Form'}
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--t2)' }}>
                {form.name}
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
              padding: '4px',
              borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Share Direct Link Box */}
          <div
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--edge)',
              borderRadius: '12px',
              padding: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={14} style={{ color: 'var(--a)' }} />
                <span>{isRtl ? 'رابط المشاركة المباشر' : 'Direct Share Link'}</span>
              </span>
              <button
                onClick={() => setShowQr(!showQr)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--a)',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <QrCode size={13} />
                <span>{showQr ? (isRtl ? 'إخفاء QR' : 'Hide QR') : (isRtl ? 'عرض QR Code' : 'Show QR')}</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                readOnly
                value={shareUrl}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  background: 'var(--surface)',
                  border: '1px solid var(--edge)',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  color: 'var(--t1)',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleCopyLink}
                style={{
                  background: copiedLink ? '#16a34a' : 'var(--a)',
                  color: '#ffffff',
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
                {copiedLink ? <Check size={15} /> : <Copy size={15} />}
                <span>{copiedLink ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ' : 'Copy')}</span>
              </button>
            </div>

            {showQr && (
              <div style={{ marginTop: '16px', padding: '16px', background: '#ffffff', borderRadius: '8px', border: '1px solid var(--edge)', textAlign: 'center' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareUrl)}`}
                  alt="QR Code"
                  style={{ width: '140px', height: '140px', margin: '0 auto 8px auto', display: 'block' }}
                />
                <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b' }}>
                  {isRtl ? 'امسح الرمز لفتح النموذج مباشرة على هاتفك' : 'Scan this code to test or share on mobile devices'}
                </p>
              </div>
            )}
          </div>

          {/* Embed Types */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--t1)', marginBottom: '10px' }}>
              {isRtl ? 'طريقة التضمين في موقعك' : 'Embed in Website / Funnel'}
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <button
                onClick={() => setEmbedType('inline')}
                style={{
                  background: embedType === 'inline' ? 'rgba(37,99,235,0.12)' : 'var(--surface2)',
                  border: embedType === 'inline' ? '2px solid var(--a)' : '1px solid var(--edge)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  textAlign: isRtl ? 'right' : 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--t1)' }}>
                  {isRtl ? 'تضمين مباشر (Inline)' : 'Inline Embed'}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--t2)' }}>
                  {isRtl ? 'يظهر النموذج مدمجاً داخل محتوى الصفحة' : 'Form renders directly inside your page content'}
                </div>
              </button>

              <button
                onClick={() => setEmbedType('popup')}
                style={{
                  background: embedType === 'popup' ? 'rgba(37,99,235,0.12)' : 'var(--surface2)',
                  border: embedType === 'popup' ? '2px solid var(--a)' : '1px solid var(--edge)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  textAlign: isRtl ? 'right' : 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--t1)' }}>
                  {isRtl ? 'نافذة منبثقة (Popup Button)' : 'Popup Button'}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--t2)' }}>
                  {isRtl ? 'زر يفتح النموذج كنافذة مودال' : 'Button that opens form in a modal popup'}
                </div>
              </button>
            </div>

            {/* Code Box */}
            <div style={{ position: 'relative' }}>
              <pre
                style={{
                  background: '#090d16',
                  color: '#e2e8f0',
                  padding: '14px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  overflowX: 'auto',
                  margin: 0,
                  direction: 'ltr',
                  fontFamily: 'monospace',
                  border: '1px solid var(--edge)'
                }}
              >
                {activeCode}
              </pre>
              <button
                onClick={handleCopyCode}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: copiedCode ? '#16a34a' : 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backdropFilter: 'blur(4px)'
                }}
              >
                {copiedCode ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--edge)',
            background: 'var(--surface2)',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 20px',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {isRtl ? 'تم' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}
