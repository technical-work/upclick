'use client';

import React from 'react';
import { useBusiness } from '../../context/BusinessContext';

export default function LandingPagePreviewModal() {
  const {
    lang,
    L,
    t,
    lpPreviewOpen,
    setLpPreviewOpen,
    lpPreviewHtml
  } = useBusiness();

  const [previewMode, setPreviewMode] = React.useState('desktop');

  if (!lpPreviewOpen) return null;

  const handleCopy = () => {
    if (!lpPreviewHtml) return;
    navigator.clipboard.writeText(lpPreviewHtml)
      .then(() => alert(L('HTML code copied to clipboard! 📋', 'تم نسخ كود الـ HTML إلى الحافظة! 📋')))
      .catch(() => alert(L('Please copy manually', 'يرجى النسخ يدوياً')));
  };

  return (
    <div className="modal-overlay" onClick={() => setLpPreviewOpen(false)}>
      <div className="modal-box" style={{ maxWidth: '980px', maxHeight: '92vh', width: '90%' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--edge)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--ff)', fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }} id="lp-modal-title">
              {L('Landing Page Preview', 'معاينة صفحة الهبوط')}
            </span>
            <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '2px' }}>
              <button
                onClick={() => setPreviewMode('desktop')}
                style={{
                  border: 'none',
                  background: previewMode === 'desktop' ? 'var(--orange)' : 'transparent',
                  color: previewMode === 'desktop' ? '#fff' : 'var(--t2)',
                  padding: '2px 8px',
                  fontSize: '11px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
              >
                {L('Desktop', 'حاسوب')}
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                style={{
                  border: 'none',
                  background: previewMode === 'mobile' ? 'var(--orange)' : 'transparent',
                  color: previewMode === 'mobile' ? '#fff' : 'var(--t2)',
                  padding: '2px 8px',
                  fontSize: '11px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
              >
                {L('Mobile', 'هاتف')}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn btn-ghost" style={{ fontSize: '11px', padding: '4px 10px' }} onClick={handleCopy}>
              {L('Copy HTML Code 📋', 'نسخ كود الـ HTML 📋')}
            </button>
            <button className="btn btn-prime" style={{ fontSize: '11px', padding: '4px 10px' }} onClick={() => setLpPreviewOpen(false)}>
              {L('Close', 'إغلاق')}
            </button>
          </div>
        </div>
        <div style={{ 
          padding: '12px', 
          height: '65vh', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          background: 'var(--surface3)', 
          overflow: 'hidden' 
        }}>
          <iframe
            srcDoc={lpPreviewHtml}
            style={{ 
              width: previewMode === 'mobile' ? '375px' : '100%', 
              height: '100%', 
              maxWidth: '100%', 
              border: '1px solid var(--edge)', 
              borderRadius: previewMode === 'mobile' ? '24px' : '8px', 
              background: '#fff',
              boxShadow: previewMode === 'mobile' ? '0 12px 36px rgba(0,0,0,0.35)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            title="Landing Page Preview"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
