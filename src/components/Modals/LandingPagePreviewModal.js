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
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--edge)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--ff)', fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }} id="lp-modal-title">
            {L('Landing Page Preview', 'معاينة صفحة الهبوط')}
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn btn-ghost" style={{ fontSize: '11px', padding: '4px 10px' }} onClick={handleCopy}>
              {L('Copy HTML Code 📋', 'نسخ كود الـ HTML 📋')}
            </button>
            <button className="btn btn-prime" style={{ fontSize: '11px', padding: '4px 10px' }} onClick={() => setLpPreviewOpen(false)}>
              {L('Close', 'إغلاق')}
            </button>
          </div>
        </div>
        <div style={{ padding: '12px', height: '65vh' }}>
          <iframe
            srcDoc={lpPreviewHtml}
            style={{ width: '100%', height: '100%', border: '1px solid var(--edge)', borderRadius: '8px', background: '#fff' }}
            title="Landing Page Preview"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
