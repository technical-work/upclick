'use client';

import React, { useState, useMemo } from 'react';
import { X, Search, Download, Calendar, User, Mail, Phone, FileText, Inbox, CheckCircle2 } from 'lucide-react';

export default function FormSubmissionsModal({
  isOpen,
  onClose,
  form,
  isRtl,
  showToast
}) {
  const [search, setSearch] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  if (!isOpen || !form) return null;

  const submissions = form.submissions || [];

  const filteredSubmissions = submissions.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = (s.name || '').toLowerCase();
    const email = (s.email || '').toLowerCase();
    const phone = (s.phone || '').toLowerCase();
    return name.includes(q) || email.includes(q) || phone.includes(q);
  });

  const handleExportCSV = () => {
    if (!submissions.length) {
      if (showToast) showToast(isRtl ? 'لا توجد استجابات للتصدير' : 'No submissions to export');
      return;
    }

    const headers = ['ID', 'Date', 'Name', 'Email', 'Phone', 'Data'];
    const rows = submissions.map((s) => [
      s.id || '',
      `"${s.submittedAt || ''}"`,
      `"${s.name || ''}"`,
      `"${s.email || ''}"`,
      `"${s.phone || ''}"`,
      `"${JSON.stringify(s.data || {}).replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${form.name || 'form'}_submissions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast(isRtl ? 'تم تحميل ملف الاستجابات بنجاح' : 'Submissions exported as CSV');
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
          maxWidth: '840px',
          maxHeight: '85vh',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
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
                background: 'rgba(37, 99, 235, 0.15)',
                color: 'var(--a)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Inbox size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--t1)' }}>
                {isRtl ? 'استجابات النموذج' : 'Form Submissions'}
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--t2)' }}>
                {form.name} • {submissions.length} {isRtl ? 'استجابة' : 'submissions'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleExportCSV}
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--edge)',
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '12.5px',
                fontWeight: '600',
                color: 'var(--t1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Download size={14} />
              <span>{isRtl ? 'تصدير CSV' : 'Export CSV'}</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--t2)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--edge)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', [isRtl ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--t2)' }} />
            <input
              type="text"
              placeholder={isRtl ? 'بحث في الأسماء، البريد، أو الهاتف...' : 'Search by name, email, or phone...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 14px',
                [isRtl ? 'paddingRight' : 'paddingLeft']: '36px',
                borderRadius: '8px',
                border: '1px solid var(--edge)',
                background: 'var(--surface2)',
                color: 'var(--t1)',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Content Table / Empty */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredSubmissions.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--t2)' }}>
              <Inbox size={40} style={{ margin: '0 auto 12px auto', color: 'var(--t2)' }} />
              <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '700', color: 'var(--t1)' }}>
                {isRtl ? 'لا توجد استجابات بعد' : 'No Submissions Yet'}
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--t2)' }}>
                {isRtl ? 'ستظهر الاستجابات هنا بمجرد أن يقوم شخص ما بتعبئة النموذج.' : 'Responses will appear here when visitors fill out this form.'}
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
              <thead>
                <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--edge)', fontSize: '12px', color: 'var(--t2)' }}>
                  <th style={{ padding: '12px 20px' }}>{isRtl ? 'التاريخ والوقت' : 'Submitted At'}</th>
                  <th style={{ padding: '12px 20px' }}>{isRtl ? 'الاسم' : 'Name'}</th>
                  <th style={{ padding: '12px 20px' }}>{isRtl ? 'البريد الإلكتروني' : 'Email'}</th>
                  <th style={{ padding: '12px 20px' }}>{isRtl ? 'الهاتف' : 'Phone'}</th>
                  <th style={{ padding: '12px 20px' }}>{isRtl ? 'التفاصيل' : 'Details'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((sub, idx) => (
                  <tr
                    key={sub.id || idx}
                    onClick={() => setSelectedSubmission(sub)}
                    style={{ borderBottom: '1px solid var(--edge)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 20px', color: 'var(--t2)', fontSize: '12.5px' }}>
                      {sub.submittedAt || 'Recently'}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: '700', color: 'var(--t1)', fontSize: '13px' }}>
                      {sub.name || 'Lead'}
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--t2)', fontSize: '13px' }}>
                      {sub.email || '-'}
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--t2)', fontSize: '13px' }}>
                      {sub.phone || '-'}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSubmission(sub);
                        }}
                        style={{
                          background: 'rgba(37, 99, 235, 0.1)',
                          color: 'var(--a)',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {isRtl ? 'عرض' : 'View'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Selected Submission Detail Modal */}
        {selectedSubmission && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100000,
              padding: '20px'
            }}
            onClick={() => setSelectedSubmission(null)}
          >
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--edge)',
                borderRadius: '14px',
                width: '100%',
                maxWidth: '480px',
                padding: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                direction: isRtl ? 'rtl' : 'ltr'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--t1)' }}>
                  {isRtl ? 'تفاصيل الاستجابة' : 'Submission Details'}
                </h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '10px 14px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--t2)', display: 'block' }}>{isRtl ? 'التاريخ' : 'Date'}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--t1)' }}>{selectedSubmission.submittedAt}</span>
                </div>

                <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '10px 14px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--t2)', display: 'block' }}>{isRtl ? 'الاسم' : 'Name'}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--t1)' }}>{selectedSubmission.name || '-'}</span>
                </div>

                <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '10px 14px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--t2)', display: 'block' }}>{isRtl ? 'البريد الإلكتروني' : 'Email'}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--t1)' }}>{selectedSubmission.email || '-'}</span>
                </div>

                <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '10px 14px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--t2)', display: 'block' }}>{isRtl ? 'الهاتف' : 'Phone'}</span>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--t1)' }}>{selectedSubmission.phone || '-'}</span>
                </div>

                {selectedSubmission.data && Object.keys(selectedSubmission.data).length > 0 && (
                  <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '10px 14px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--t2)', display: 'block', marginBottom: '6px' }}>{isRtl ? 'البيانات الإضافية' : 'All Form Fields'}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {Object.entries(selectedSubmission.data).map(([k, v]) => (
                        <div key={k} style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--edge)', paddingBottom: '4px' }}>
                          <span style={{ color: 'var(--t2)' }}>{k.replace('f_', '')}:</span>
                          <span style={{ color: 'var(--t1)', fontWeight: '600' }}>{typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedSubmission(null)}
                style={{
                  width: '100%',
                  marginTop: '18px',
                  background: 'var(--a)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                {isRtl ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
