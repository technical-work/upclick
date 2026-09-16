'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  Inbox,
  Award,
  TrendingUp,
  Calendar,
  Eye,
  FileQuestion
} from 'lucide-react';

export default function QuizSubmissionsModal({
  quiz,
  isRtl = false,
  onClose,
  showToast = () => {}
}) {
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'passed' | 'failed'
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingSub, setInspectingSub] = useState(null);

  if (!quiz) return null;

  const submissions = Array.isArray(quiz.submissions) ? quiz.submissions : [];

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'passed' && sub.passed) ||
        (filterStatus === 'failed' && !sub.passed);

      const text = `${sub.name || ''} ${sub.email || ''} ${sub.phone || ''}`.toLowerCase();
      const matchQuery = text.includes(searchQuery.toLowerCase());

      return matchStatus && matchQuery;
    });
  }, [submissions, filterStatus, searchQuery]);

  const passedCount = submissions.filter((s) => s.passed).length;
  const failedCount = submissions.length - passedCount;
  const avgScore = submissions.length > 0 ? Math.round(submissions.reduce((acc, s) => acc + (s.percentage || 0), 0) / submissions.length) : 0;

  const exportCsv = () => {
    if (submissions.length === 0) {
      showToast(isRtl ? 'لا توجد بيانات للتصدير' : 'No submissions to export');
      return;
    }

    const headers = ['Submission ID', 'Date', 'Respondent Name', 'Email', 'Phone', 'Score %', 'Points Scored', 'Status'];
    const rows = submissions.map((s) => [
      s.id,
      s.submittedAt,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${(s.email || '').replace(/"/g, '""')}"`,
      `"${(s.phone || '').replace(/"/g, '""')}"`,
      `${s.percentage || 0}%`,
      `${s.score || 0}/${s.totalPoints || s.totalPossibleScore || 100}`,
      s.passed ? 'PASSED' : 'FAILED'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `quiz_${quiz.id}_submissions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(isRtl ? 'تم تصدير ملف النتائج بنجاح' : 'CSV exported successfully');
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
          maxWidth: '920px',
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
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Award size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--t1)' }}>
                {isRtl ? 'نتائج ومحاولات الاختبار' : 'Quiz Submissions & Grading'}
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--t2)' }}>
                {quiz.name} • {isRtl ? `درجة الاجتياز: ${quiz.passingScore || 70}%` : `Passing threshold: ${quiz.passingScore || 70}%`}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={exportCsv}
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--edge)',
                color: 'var(--t1)',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Download size={15} />
              {isRtl ? 'تصدير CSV' : 'Export CSV'}
            </button>
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
        </div>

        {/* Metrics Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
          <div style={{ background: 'var(--surface2)', borderRadius: '10px', padding: '12px 16px' }}>
            <div style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--t2)' }}>{isRtl ? 'إجمالي المحاولات' : 'Total Attempts'}</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--t1)' }}>{submissions.length}</div>
          </div>

          <div style={{ background: 'var(--surface2)', borderRadius: '10px', padding: '12px 16px' }}>
            <div style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--t2)' }}>{isRtl ? 'الناجحين (Pass)' : 'Passed'}</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#10b981' }}>{passedCount}</div>
          </div>

          <div style={{ background: 'var(--surface2)', borderRadius: '10px', padding: '12px 16px' }}>
            <div style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--t2)' }}>{isRtl ? 'غير المجتازين' : 'Failed'}</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#ef4444' }}>{failedCount}</div>
          </div>

          <div style={{ background: 'var(--surface2)', borderRadius: '10px', padding: '12px 16px' }}>
            <div style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--t2)' }}>{isRtl ? 'متوسط الدرجات' : 'Average Score'}</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--a)' }}>{avgScore}%</div>
          </div>
        </div>

        {/* Filter & Search Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setFilterStatus('all')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: filterStatus === 'all' ? 'var(--a)' : 'var(--surface2)',
                color: filterStatus === 'all' ? '#fff' : 'var(--t2)',
                fontSize: '12.5px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {isRtl ? 'الكل' : 'All'} ({submissions.length})
            </button>
            <button
              onClick={() => setFilterStatus('passed')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: filterStatus === 'passed' ? 'rgba(16, 185, 129, 0.2)' : 'var(--surface2)',
                color: filterStatus === 'passed' ? '#10b981' : 'var(--t2)',
                fontSize: '12.5px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {isRtl ? 'ناجح' : 'Passed'} ({passedCount})
            </button>
            <button
              onClick={() => setFilterStatus('failed')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: filterStatus === 'failed' ? 'rgba(239, 68, 68, 0.2)' : 'var(--surface2)',
                color: filterStatus === 'failed' ? '#ef4444' : 'var(--t2)',
                fontSize: '12.5px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {isRtl ? 'راسب' : 'Failed'} ({failedCount})
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '6px', padding: '4px 10px' }}>
            <Search size={14} color="var(--t2)" />
            <input
              type="text"
              placeholder={isRtl ? 'بحث في المرشحين...' : 'Search respondents...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--t1)', fontSize: '12.5px', width: '180px' }}
            />
          </div>
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <div style={{ background: 'var(--surface2)', border: '1px dashed var(--edge)', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
            <Inbox size={32} color="var(--t2)" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--t1)' }}>
              {isRtl ? 'لا توجد نتائج مسجلة تطابق البحث' : 'No matching submissions found'}
            </div>
          </div>
        ) : (
          <div style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '10px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--edge)' }}>
                  <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: '700', color: 'var(--t2)' }}>{isRtl ? 'المرشح' : 'Respondent'}</th>
                  <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: '700', color: 'var(--t2)' }}>{isRtl ? 'النتيجة %' : 'Score %'}</th>
                  <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: '700', color: 'var(--t2)' }}>{isRtl ? 'الحالة' : 'Status'}</th>
                  <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: '700', color: 'var(--t2)' }}>{isRtl ? 'النقاط' : 'Points'}</th>
                  <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: '700', color: 'var(--t2)' }}>{isRtl ? 'التاريخ' : 'Date'}</th>
                  <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: '700', color: 'var(--t2)', textAlign: 'center' }}>{isRtl ? 'الإجراء' : 'Action'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((sub, idx) => (
                  <tr key={sub.id || idx} style={{ borderBottom: '1px solid var(--edge)' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--t1)' }}>{sub.name || 'Anonymous'}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--t2)' }}>{sub.email || sub.phone || '-'}</div>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '13.5px', fontWeight: '800' }}>
                      <span style={{ color: sub.passed ? '#10b981' : '#ef4444' }}>{sub.percentage || 0}%</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {sub.passed ? (
                        <span style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                          PASSED
                        </span>
                      ) : (
                        <span style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                          FAILED
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '12.5px', color: 'var(--t1)' }}>
                      {sub.score || 0}/{sub.totalPoints || sub.totalPossibleScore || 100}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '12px', color: 'var(--t2)' }}>
                      {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'Recently'}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                      <button
                        onClick={() => setInspectingSub(sub)}
                        style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--edge)',
                          color: 'var(--a)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '11.5px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {isRtl ? 'عرض الإجابات' : 'View Answers'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Detailed Answer Inspection Modal */}
        {inspectingSub && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1100,
              padding: '20px'
            }}
            onClick={() => setInspectingSub(null)}
          >
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--edge)',
                borderRadius: '16px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '85vh',
                overflowY: 'auto',
                padding: '24px',
                direction: isRtl ? 'rtl' : 'ltr'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--edge)', paddingBottom: '12px', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--t1)' }}>
                    {inspectingSub.name || 'Anonymous'} - {inspectingSub.percentage}%
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--t2)' }}>{inspectingSub.email || 'No email provided'}</div>
                </div>
                <button
                  onClick={() => setInspectingSub(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(inspectingSub.answers || []).map((ans, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--surface2)',
                      border: `1px solid ${ans.isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      borderRadius: '8px',
                      padding: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--t1)' }}>
                        Q{idx + 1}: {ans.questionTitle || ans.title || `Question ${idx + 1}`}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: ans.isCorrect ? '#10b981' : '#ef4444' }}>
                        {ans.isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--t1)', margin: '3px 0' }}>
                      <strong>{isRtl ? 'إجابة المرشح:' : 'Selected:'}</strong> {ans.selectedAnswer || 'None'}
                    </div>
                    {!ans.isCorrect && ans.correctAnswer && (
                      <div style={{ fontSize: '12px', color: '#10b981', margin: '3px 0' }}>
                        <strong>{isRtl ? 'الإجابة الصحيحة:' : 'Correct Answer:'}</strong> {ans.correctAnswer}
                      </div>
                    )}
                    {ans.explanation && (
                      <div style={{ fontSize: '11.5px', color: 'var(--t2)', background: 'var(--surface)', padding: '6px 10px', borderRadius: '6px', marginTop: '6px' }}>
                        💡 {ans.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '16px', textAlign: isRtl ? 'left' : 'right' }}>
                <button
                  onClick={() => setInspectingSub(null)}
                  style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', color: 'var(--t1)', padding: '6px 16px', borderRadius: '6px', fontSize: '12.5px', cursor: 'pointer' }}
                >
                  {isRtl ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
