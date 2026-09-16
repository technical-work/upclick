'use client';

import React, { useState } from 'react';
import { X, Download, Search, Calendar, User, Mail, Phone, Eye, CheckCircle2 } from 'lucide-react';

export default function SurveySubmissionsModal({
  isOpen,
  onClose,
  survey,
  isRtl,
  showToast
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSub, setSelectedSub] = useState(null);

  if (!isOpen || !survey) return null;

  const submissions = survey.submissions || [];
  const filtered = submissions.filter((s) => {
    const text = `${s.name || ''} ${s.email || ''} ${s.phone || ''} ${JSON.stringify(s.data || {})}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  const exportCsv = () => {
    if (submissions.length === 0) {
      if (showToast) showToast(isRtl ? 'لا توجد استجابات للتصدير' : 'No submissions to export');
      return;
    }

    const allKeysSet = new Set(['Submission ID', 'Date & Time', 'Name', 'Email', 'Phone']);
    submissions.forEach((s) => {
      Object.keys(s.data || {}).forEach((k) => allKeysSet.add(k));
    });
    const headers = Array.from(allKeysSet);

    const rows = submissions.map((s) => {
      return headers.map((h) => {
        if (h === 'Submission ID') return s.id;
        if (h === 'Date & Time') return s.submittedAt;
        if (h === 'Name') return s.name;
        if (h === 'Email') return s.email;
        if (h === 'Phone') return s.phone;
        const val = s.data?.[h];
        if (Array.isArray(val)) return `"${val.join(', ')}"`;
        if (typeof val === 'object' && val !== null) return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${survey.name.replace(/\s+/g, '_')}_submissions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast(isRtl ? 'تم تحميل ملف الاستجابات (CSV) بنجاح' : 'CSV exported successfully');
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
          maxWidth: '880px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
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
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800', color: 'var(--t1)' }}>
              {isRtl ? 'استجابات الاستبيان' : 'Survey Submissions'}
            </h3>
            <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--t2)' }}>
              {survey.name} • {submissions.length} {isRtl ? 'استجابة' : 'total entries'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={exportCsv}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <Download size={14} />
              <span>{isRtl ? 'تصدير CSV' : 'Export CSV'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', padding: '6px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div
          style={{
            padding: '12px 24px',
            background: 'var(--surface2)',
            borderBottom: '1px solid var(--edge)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0
          }}
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRtl ? 'right' : 'left']: '12px', color: 'var(--t3)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isRtl ? 'بحث في الاستجابات...' : 'Search submissions by name, email, or data...'}
              className="inp"
              style={{ width: '100%', padding: isRtl ? '6px 36px 6px 12px' : '6px 12px 6px 36px', fontSize: '13px' }}
            />
          </div>
        </div>

        {/* Submissions List & Inspector */}
        <div style={{ display: 'grid', gridTemplateColumns: selectedSub ? '1fr 1fr' : '1fr', flex: 1, overflow: 'hidden' }}>
          {/* Table list */}
          <div style={{ overflowY: 'auto', borderRight: selectedSub && !isRtl ? '1px solid var(--edge)' : 'none', borderLeft: selectedSub && isRtl ? '1px solid var(--edge)' : 'none' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--t2)' }}>
                {isRtl ? 'لا توجد استجابات مطابقة' : 'No submissions found'}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--edge)', textAlign: isRtl ? 'right' : 'left' }}>
                    <th style={{ padding: '10px 16px', fontWeight: '700', color: 'var(--t2)' }}>{isRtl ? 'الاسم' : 'Respondent'}</th>
                    <th style={{ padding: '10px 16px', fontWeight: '700', color: 'var(--t2)' }}>{isRtl ? 'التاريخ' : 'Date'}</th>
                    <th style={{ padding: '10px 16px', textAlign: 'center', width: '60px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sub, idx) => {
                    const isSelected = selectedSub?.id === sub.id;
                    return (
                      <tr
                        key={sub.id || idx}
                        onClick={() => setSelectedSub(sub)}
                        style={{
                          borderBottom: '1px solid var(--edge)',
                          background: isSelected ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                          cursor: 'pointer'
                        }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: '700', color: 'var(--t1)' }}>{sub.name || 'Anonymous'}</div>
                          <div style={{ fontSize: '12px', color: 'var(--t2)' }}>{sub.email || 'No email'}</div>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--t2)', fontSize: '12px' }}>
                          {sub.submittedAt}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <Eye size={15} color={isSelected ? 'var(--a)' : 'var(--t3)'} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Details Inspector Panel */}
          {selectedSub && (
            <div style={{ padding: '20px', overflowY: 'auto', background: 'var(--surface2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--t1)' }}>
                  {isRtl ? 'تفاصيل الاستجابة' : 'Submission Details'}
                </h4>
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--edge)', padding: '16px', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--t1)', marginBottom: '4px' }}>{selectedSub.name}</div>
                {selectedSub.email && <div style={{ fontSize: '12px', color: 'var(--t2)', marginBottom: '2px' }}>✉️ {selectedSub.email}</div>}
                {selectedSub.phone && <div style={{ fontSize: '12px', color: 'var(--t2)', marginBottom: '2px' }}>📞 {selectedSub.phone}</div>}
                <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '6px' }}>🕒 {selectedSub.submittedAt}</div>
              </div>

              <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--t2)', textTransform: 'uppercase', marginBottom: '8px' }}>
                {isRtl ? 'الإجابات المسجلة' : 'Recorded Answers'}
              </h5>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(selectedSub.data || {}).map(([key, val], kIdx) => (
                  <div key={kIdx} style={{ background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--edge)', padding: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--t3)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {key}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--t1)', fontWeight: '600' }}>
                      {Array.isArray(val) ? val.join(', ') : (typeof val === 'object' ? JSON.stringify(val) : String(val))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
