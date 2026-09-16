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

    // Collect all unique field keys across all submissions
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
          maxWidth: '920px',
          maxHeight: '90vh',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
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
            justifyContent: 'space-between',
            background: '#ffffff'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                {isRtl ? `استجابات: ${survey.name}` : `Submissions: ${survey.name}`}
              </h3>
              <span style={{ fontSize: '12px', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '999px', fontWeight: '700' }}>
                {submissions.length} {isRtl ? 'استجابة' : 'responses'}
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>
              {isRtl ? 'عرض وتحليل كافة إجابات واستجابات المشتركين' : 'Review and analyze all submitted responses'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={exportCsv}
              disabled={submissions.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: submissions.length === 0 ? '#f1f5f9' : '#eff6ff',
                border: '1px solid #bfdbfe',
                color: submissions.length === 0 ? '#94a3b8' : '#2563eb',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12.5px',
                fontWeight: '700',
                cursor: submissions.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <Download size={15} />
              <span>{isRtl ? 'تصدير CSV' : 'Export CSV'}</span>
            </button>
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
        </div>

        {/* Search Bar */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', top: '10px', [isRtl ? 'right' : 'left']: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder={isRtl ? 'بحث في الاستجابات أو الأسماء أو الإيميلات...' : 'Search submissions by name, email, or answers...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="inp"
              style={{
                width: '100%',
                padding: '8px 12px',
                [isRtl ? 'paddingRight' : 'paddingLeft']: '36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Table & Inspector */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Table list */}
          <div style={{ flex: selectedSub ? 1 : 1, overflowY: 'auto', borderRight: selectedSub ? '1px solid #e2e8f0' : 'none' }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <CheckCircle2 size={24} />
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                  {searchTerm ? (isRtl ? 'لا توجد نتائج مطابقة' : 'No matching submissions') : (isRtl ? 'لا توجد استجابات حتى الآن' : 'No survey responses yet')}
                </h4>
                <p style={{ margin: 0, fontSize: '12.5px' }}>
                  {isRtl ? 'شارك رابط الاستبيان لبدء جمع الإجابات والتقييمات.' : 'Share your survey link to start collecting answers.'}
                </p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '12px' }}>
                    <th style={{ padding: '12px 18px', fontWeight: '700' }}>#</th>
                    <th style={{ padding: '12px 18px', fontWeight: '700' }}>{isRtl ? 'المشارك' : 'Respondent'}</th>
                    <th style={{ padding: '12px 18px', fontWeight: '700' }}>{isRtl ? 'البريد / الهاتف' : 'Contact'}</th>
                    <th style={{ padding: '12px 18px', fontWeight: '700' }}>{isRtl ? 'تاريخ الاستجابة' : 'Submitted At'}</th>
                    <th style={{ padding: '12px 18px', width: '70px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sub, idx) => {
                    const isSelected = selectedSub?.id === sub.id;
                    return (
                      <tr
                        key={sub.id || idx}
                        onClick={() => setSelectedSub(isSelected ? null : sub)}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: isSelected ? '#eff6ff' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '14px 18px', color: '#64748b', fontWeight: '600' }}>{idx + 1}</td>
                        <td style={{ padding: '14px 18px', fontWeight: '700', color: '#0f172a' }}>
                          {sub.name || (isRtl ? 'زائر' : 'Anonymous')}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#475569' }}>
                          <div>{sub.email || '-'}</div>
                          {sub.phone && <div style={{ fontSize: '11.5px', color: '#64748b' }}>{sub.phone}</div>}
                        </td>
                        <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '12px' }}>
                          {sub.submittedAt}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSub(isSelected ? null : sub);
                            }}
                            style={{
                              background: isSelected ? '#2563eb' : '#f1f5f9',
                              color: isSelected ? '#ffffff' : '#475569',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              fontSize: '11.5px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            {isRtl ? 'عرض' : 'View'}
                          </button>
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
            <div style={{ width: '380px', background: '#f8fafc', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                  {isRtl ? 'تفاصيل الاستجابة' : 'Response Details'}
                </h4>
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ marginBottom: '14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {isRtl ? 'معلومات المشارك' : 'Respondent Info'}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                  {selectedSub.name || (isRtl ? 'زائر' : 'Anonymous')}
                </div>
                {selectedSub.email && <div style={{ fontSize: '12.5px', color: '#2563eb' }}>✉️ {selectedSub.email}</div>}
                {selectedSub.phone && <div style={{ fontSize: '12.5px', color: '#475569' }}>📞 {selectedSub.phone}</div>}
                <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '6px' }}>🕒 {selectedSub.submittedAt}</div>
              </div>

              <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                {isRtl ? 'الإجابات على الأسئلة' : 'Question Answers'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(selectedSub.data || {}).map(([key, val]) => {
                  let displayVal = val;
                  if (Array.isArray(val)) displayVal = val.join(', ');
                  else if (typeof val === 'boolean') displayVal = val ? (isRtl ? 'نعم / موافق' : 'Yes') : (isRtl ? 'لا' : 'No');
                  else if (typeof val === 'object' && val !== null) displayVal = JSON.stringify(val);

                  return (
                    <div key={key} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '4px' }}>
                        {key}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', wordBreak: 'break-word' }}>
                        {String(displayVal || (isRtl ? 'بدون إجابة' : 'No answer'))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
