'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  SlidersHorizontal,
  LayoutList,
  LayoutGrid,
  MoreVertical,
  ExternalLink,
  Edit3,
  Copy,
  Trash2,
  Share2,
  Eye,
  FileQuestion,
  Sparkles,
  BarChart3,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Download,
  FolderPlus,
  Layers,
  Inbox,
  TrendingUp,
  Award,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import CreateQuizModal from './CreateQuizModal';
import QuizIntegrateModal from './QuizIntegrateModal';
import QuizSubmissionsModal from './QuizSubmissionsModal';

export default function QuizListView({
  quizzes = [],
  onOpenBuilder,
  onCreateBlank,
  onCreateFromTemplate,
  onDeleteQuiz,
  onDuplicateQuiz,
  onUpdateQuizName,
  isRtl = false,
  showToast = () => {}
}) {
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all' | 'analytics' | 'submissions'
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeActionMenuId, setActiveActionMenuId] = useState(null);
  const [selectedQuizForIntegrate, setSelectedQuizForIntegrate] = useState(null);
  const [selectedQuizForSubmissions, setSelectedQuizForSubmissions] = useState(null);
  const [inspectingSubmission, setInspectingSubmission] = useState(null);
  const [renamingQuizId, setRenamingQuizId] = useState(null);
  const [renamingValue, setRenamingValue] = useState('');

  // Filtered quizzes
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q) =>
      (q.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [quizzes, searchQuery]);

  // Aggregate submissions across all quizzes
  const allSubmissions = useMemo(() => {
    const list = [];
    quizzes.forEach((q) => {
      (q.submissions || []).forEach((sub) => {
        list.push({
          ...sub,
          quizId: q.id,
          quizName: q.name,
          passingScore: q.passingScore || 70
        });
      });
    });
    return list.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
  }, [quizzes]);

  const filteredSubmissions = useMemo(() => {
    return allSubmissions.filter((sub) => {
      const text = `${sub.name || ''} ${sub.email || ''} ${sub.quizName || ''}`.toLowerCase();
      return text.includes(searchQuery.toLowerCase());
    });
  }, [allSubmissions, searchQuery]);

  // Aggregate analytics
  const totalViews = useMemo(() => quizzes.reduce((acc, q) => acc + (q.analytics?.views || (q.submissions?.length ? q.submissions.length * 2 + 5 : 0)), 0), [quizzes]);
  const totalAttempts = useMemo(() => allSubmissions.length, [allSubmissions]);
  const passedAttempts = useMemo(() => allSubmissions.filter(s => s.passed).length, [allSubmissions]);
  const avgPassRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
  const avgScore = totalAttempts > 0 ? Math.round(allSubmissions.reduce((acc, s) => acc + (s.percentage || 0), 0) / totalAttempts) : 0;

  const handleStartRename = (quiz) => {
    setRenamingQuizId(quiz.id);
    setRenamingValue(quiz.name);
    setActiveActionMenuId(null);
  };

  const handleSaveRename = (quizId) => {
    if (renamingValue.trim() && onUpdateQuizName) {
      onUpdateQuizName(quizId, renamingValue.trim());
      showToast(isRtl ? 'تم تغيير اسم الاختبار بنجاح' : 'Quiz renamed successfully');
    }
    setRenamingQuizId(null);
  };

  const exportAllSubmissionsCsv = () => {
    if (allSubmissions.length === 0) {
      showToast(isRtl ? 'لا توجد محاولات للتصدير' : 'No attempts to export');
      return;
    }

    const headers = ['Quiz Name', 'Submission ID', 'Date & Time', 'Respondent Name', 'Email', 'Phone', 'Score %', 'Points', 'Status (Passed/Failed)'];
    const rows = allSubmissions.map((s) => [
      `"${(s.quizName || '').replace(/"/g, '""')}"`,
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
    link.setAttribute('download', `all_quizzes_submissions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(isRtl ? 'تم تصدير نتائج الاختبارات (CSV) بنجاح' : 'CSV exported successfully');
  };

  return (
    <div
      style={{
        padding: '0 24px',
        maxWidth: '1440px',
        margin: '0 auto',
        direction: isRtl ? 'rtl' : 'ltr',
        animation: 'fadeIn 0.25s ease'
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--edge)',
          paddingBottom: '16px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b'
              }}
            >
              <Award size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: 'var(--t1)' }}>
                {isRtl ? 'الاختبارات التفاعلية والتقييمات' : 'Interactive Quizzes & Assessments'}
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--t2)' }}>
                {isRtl
                  ? 'أنشئ اختبارات تفاعلية ذكية مع تصحيح تلقائي، درجات اجتياز، ورسائل نجاح ورسوب مخصصة.'
                  : 'Create smart scored quizzes with automatic grading, passing scores, feedback, and certificate outcomes.'}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, var(--a), #1d4ed8)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 18px',
              fontSize: '13.5px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.2s'
            }}
          >
            <Plus size={16} />
            {isRtl ? 'إنشاء اختبار جديد' : 'Create New Quiz'}
          </button>
        </div>
      </div>

      {/* Sub Tabs: All Quizzes | Analytics | Submissions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--edge)',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setActiveSubTab('all')}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeSubTab === 'all' ? '2px solid var(--a)' : '2px solid transparent',
              color: activeSubTab === 'all' ? 'var(--a)' : 'var(--t2)',
              fontWeight: activeSubTab === 'all' ? '700' : '500',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Layers size={16} />
            {isRtl ? 'جميع الاختبارات' : 'All Quizzes'}
            <span
              style={{
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#f59e0b',
                padding: '2px 7px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '700'
              }}
            >
              {quizzes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('analytics')}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeSubTab === 'analytics' ? '2px solid var(--a)' : '2px solid transparent',
              color: activeSubTab === 'analytics' ? 'var(--a)' : 'var(--t2)',
              fontWeight: activeSubTab === 'analytics' ? '700' : '500',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <BarChart3 size={16} />
            {isRtl ? 'التحليلات ومعدلات النجاح' : 'Analytics & Pass Rates'}
          </button>

          <button
            onClick={() => setActiveSubTab('submissions')}
            style={{
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeSubTab === 'submissions' ? '2px solid var(--a)' : '2px solid transparent',
              color: activeSubTab === 'submissions' ? 'var(--a)' : 'var(--t2)',
              fontWeight: activeSubTab === 'submissions' ? '700' : '500',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Inbox size={16} />
            {isRtl ? 'الاستجابات والنتائج' : 'Submissions & Scores'}
            {allSubmissions.length > 0 && (
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  padding: '2px 7px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '700'
                }}
              >
                {allSubmissions.length}
              </span>
            )}
          </button>
        </div>

        {/* Search and View Mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--surface)',
              border: '1px solid var(--edge)',
              borderRadius: '8px',
              padding: '6px 12px',
              width: '260px'
            }}
          >
            <Search size={15} color="var(--t2)" />
            <input
              type="text"
              placeholder={isRtl ? 'بحث في الاختبارات...' : 'Search quizzes...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--t1)',
                fontSize: '13px',
                width: '100%'
              }}
            />
          </div>

          {activeSubTab === 'all' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--surface)',
                border: '1px solid var(--edge)',
                borderRadius: '8px',
                padding: '2px'
              }}
            >
              <button
                onClick={() => setViewMode('list')}
                style={{
                  background: viewMode === 'list' ? 'var(--surface2)' : 'transparent',
                  border: 'none',
                  color: viewMode === 'list' ? 'var(--t1)' : 'var(--t2)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={isRtl ? 'عرض قائمة' : 'List view'}
              >
                <LayoutList size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  background: viewMode === 'grid' ? 'var(--surface2)' : 'transparent',
                  border: 'none',
                  color: viewMode === 'grid' ? 'var(--t1)' : 'var(--t2)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={isRtl ? 'عرض شبكي' : 'Grid view'}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '24px'
        }}
      >
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--edge)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--t2)' }}>
              {isRtl ? 'إجمالي الاختبارات' : 'Total Quizzes'}
            </div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--t1)' }}>{quizzes.length}</div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--edge)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(37, 99, 235, 0.12)',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FileQuestion size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--t2)' }}>
              {isRtl ? 'المحاولات المستلمة' : 'Total Attempts'}
            </div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--t1)' }}>{totalAttempts}</div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--edge)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--t2)' }}>
              {isRtl ? 'معدل الاجتياز والنجاح' : 'Pass Rate'}
            </div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#10b981' }}>{avgPassRate}%</div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--edge)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(168, 85, 247, 0.12)',
              color: '#a855f7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--t2)' }}>
              {isRtl ? 'متوسط الدرجات' : 'Avg Score'}
            </div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#a855f7' }}>{avgScore}%</div>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeSubTab === 'all' && (
        <>
          {filteredQuizzes.length === 0 ? (
            <div
              style={{
                background: 'var(--surface)',
                border: '1px dashed var(--edge)',
                borderRadius: '16px',
                padding: '60px 24px',
                textAlign: 'center',
                margin: '20px 0'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'rgba(245, 158, 11, 0.12)',
                  color: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <Award size={32} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--t1)', margin: '0 0 8px' }}>
                {isRtl ? 'لا توجد اختبارات حتى الآن' : 'No Quizzes Created Yet'}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--t2)', maxWidth: '460px', margin: '0 auto 20px' }}>
                {isRtl
                  ? 'قم بإنشاء اختبارك الأول لاختبار معرفة العملاء وتوليد ليدات مؤهلة مع تقييم ذكي فوري.'
                  : 'Create your first interactive quiz to test knowledge, score qualified leads, and reward candidates.'}
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                style={{
                  background: 'var(--a)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {isRtl ? 'ابدأ الآن بإنشاء اختبار' : 'Create Quiz Now'}
              </button>
            </div>
          ) : viewMode === 'list' ? (
            /* Table / List View */
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--edge)',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--edge)' }}>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--t2)' }}>
                      {isRtl ? 'اسم الاختبار' : 'Quiz Name'}
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--t2)' }}>
                      {isRtl ? 'عدد الأسئلة' : 'Questions'}
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--t2)' }}>
                      {isRtl ? 'درجة الاجتياز' : 'Passing Score'}
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--t2)' }}>
                      {isRtl ? 'المحاولات' : 'Attempts'}
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--t2)' }}>
                      {isRtl ? 'نسبة النجاح' : 'Pass Rate'}
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--t2)' }}>
                      {isRtl ? 'تاريخ الإنشاء' : 'Created Date'}
                    </th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--t2)', textAlign: 'center' }}>
                      {isRtl ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuizzes.map((quiz) => {
                    const qQuestions = quiz.questions || (quiz.slides ? quiz.slides.map(s => s.elements || []).flat() : []);
                    const qSubmissions = quiz.submissions || [];
                    const qPassed = qSubmissions.filter(s => s.passed).length;
                    const qPassRate = qSubmissions.length > 0 ? Math.round((qPassed / qSubmissions.length) * 100) : 0;

                    return (
                      <tr
                        key={quiz.id}
                        style={{
                          borderBottom: '1px solid var(--edge)',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface2)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '14px 16px' }}>
                          {renamingQuizId === quiz.id ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="text"
                                value={renamingValue}
                                onChange={(e) => setRenamingValue(e.target.value)}
                                style={{
                                  background: 'var(--surface)',
                                  border: '1px solid var(--a)',
                                  borderRadius: '6px',
                                  padding: '4px 8px',
                                  color: 'var(--t1)',
                                  fontSize: '13px'
                                }}
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveRename(quiz.id)}
                                style={{ background: 'var(--a)', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
                              >
                                {isRtl ? 'حفظ' : 'Save'}
                              </button>
                            </div>
                          ) : (
                            <div
                              onClick={() => onOpenBuilder && onOpenBuilder(quiz)}
                              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                            >
                              <div
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  background: 'rgba(245, 158, 11, 0.12)',
                                  color: '#f59e0b',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}
                              >
                                <Award size={16} />
                              </div>
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--t1)' }}>{quiz.name}</div>
                                <div style={{ fontSize: '12px', color: 'var(--t2)' }}>
                                  {quiz.category || 'Custom Quiz'} • ID: {quiz.id}
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--t1)', fontWeight: '600' }}>
                          {qQuestions.length || 3} {isRtl ? 'سؤال' : 'questions'}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '13px' }}>
                          <span
                            style={{
                              background: 'rgba(37, 99, 235, 0.12)',
                              color: '#2563eb',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontWeight: '700',
                              fontSize: '12px'
                            }}
                          >
                            {quiz.passingScore || 70}%
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--t1)' }}>
                          <button
                            onClick={() => setSelectedQuizForSubmissions(quiz)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--a)',
                              textDecoration: 'underline',
                              cursor: 'pointer',
                              fontWeight: '700',
                              fontSize: '13px'
                            }}
                          >
                            {qSubmissions.length} {isRtl ? 'محاولة' : 'attempts'}
                          </button>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '13px' }}>
                          <span
                            style={{
                              color: qPassRate >= (quiz.passingScore || 70) ? '#10b981' : '#f59e0b',
                              fontWeight: '700'
                            }}
                          >
                            {qPassRate}%
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '12.5px', color: 'var(--t2)' }}>
                          {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : 'Recently'}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
                            <button
                              onClick={() => onOpenBuilder && onOpenBuilder(quiz)}
                              style={{
                                background: 'var(--surface2)',
                                border: '1px solid var(--edge)',
                                color: 'var(--t1)',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Edit3 size={13} />
                              {isRtl ? 'تعديل في البيلدر' : 'Edit'}
                            </button>

                            <button
                              onClick={() => setSelectedQuizForIntegrate(quiz)}
                              style={{
                                background: 'none',
                                border: '1px solid var(--edge)',
                                color: 'var(--t2)',
                                borderRadius: '6px',
                                padding: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title={isRtl ? 'مشاركة وتضمين' : 'Share & Embed'}
                            >
                              <Share2 size={14} />
                            </button>

                            <button
                              onClick={() => window.open(`/s/quiz_${quiz.id}`, '_blank')}
                              style={{
                                background: 'none',
                                border: '1px solid var(--edge)',
                                color: 'var(--t2)',
                                borderRadius: '6px',
                                padding: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title={isRtl ? 'معاينة مباشرة' : 'Live Preview'}
                            >
                              <ExternalLink size={14} />
                            </button>

                            <button
                              onClick={() => setActiveActionMenuId(activeActionMenuId === quiz.id ? null : quiz.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--t2)',
                                cursor: 'pointer',
                                padding: '4px'
                              }}
                            >
                              <MoreVertical size={16} />
                            </button>

                            {/* Dropdown Menu */}
                            {activeActionMenuId === quiz.id && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '100%',
                                  [isRtl ? 'left' : 'right']: 0,
                                  marginTop: '4px',
                                  background: 'var(--surface)',
                                  border: '1px solid var(--edge)',
                                  borderRadius: '8px',
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                                  zIndex: 50,
                                  minWidth: '180px',
                                  padding: '4px',
                                  textAlign: isRtl ? 'right' : 'left'
                                }}
                              >
                                <button
                                  onClick={() => {
                                    setSelectedQuizForSubmissions(quiz);
                                    setActiveActionMenuId(null);
                                  }}
                                  style={{
                                    width: '100%',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--t1)',
                                    padding: '8px 12px',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    borderRadius: '4px'
                                  }}
                                >
                                  <Inbox size={14} />
                                  {isRtl ? 'عرض المحاولات' : 'View Submissions'}
                                </button>
                                <button
                                  onClick={() => handleStartRename(quiz)}
                                  style={{
                                    width: '100%',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--t1)',
                                    padding: '8px 12px',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    borderRadius: '4px'
                                  }}
                                >
                                  <Edit3 size={14} />
                                  {isRtl ? 'إعادة تسمية' : 'Rename'}
                                </button>
                                <button
                                  onClick={() => {
                                    if (onDuplicateQuiz) onDuplicateQuiz(quiz);
                                    setActiveActionMenuId(null);
                                  }}
                                  style={{
                                    width: '100%',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--t1)',
                                    padding: '8px 12px',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    borderRadius: '4px'
                                  }}
                                >
                                  <Copy size={14} />
                                  {isRtl ? 'نسخ الاختبار' : 'Duplicate'}
                                </button>
                                <div style={{ height: '1px', background: 'var(--edge)', margin: '4px 0' }} />
                                <button
                                  onClick={() => {
                                    if (confirm(isRtl ? 'هل أنت متأكد من حذف هذا الاختبار؟' : 'Are you sure you want to delete this quiz?')) {
                                      if (onDeleteQuiz) onDeleteQuiz(quiz.id);
                                    }
                                    setActiveActionMenuId(null);
                                  }}
                                  style={{
                                    width: '100%',
                                    background: 'none',
                                    border: 'none',
                                    color: '#ef4444',
                                    padding: '8px 12px',
                                    fontSize: '13px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    borderRadius: '4px'
                                  }}
                                >
                                  <Trash2 size={14} />
                                  {isRtl ? 'حذف الاختبار' : 'Delete Quiz'}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {filteredQuizzes.map((quiz) => {
                const qQuestions = quiz.questions || (quiz.slides ? quiz.slides.map(s => s.elements || []).flat() : []);
                const qSubmissions = quiz.submissions || [];
                const qPassed = qSubmissions.filter(s => s.passed).length;
                const qPassRate = qSubmissions.length > 0 ? Math.round((qPassed / qSubmissions.length) * 100) : 0;

                return (
                  <div
                    key={quiz.id}
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--edge)',
                      borderRadius: '14px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer'
                    }}
                    onClick={() => onOpenBuilder && onOpenBuilder(quiz)}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span
                          style={{
                            background: 'rgba(245, 158, 11, 0.12)',
                            color: '#f59e0b',
                            padding: '3px 9px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: '700'
                          }}
                        >
                          {quiz.category || 'Quiz'}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--t2)' }}>
                          {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : 'Active'}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--t1)', margin: '0 0 8px' }}>
                        {quiz.name}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--t2)', margin: '0 0 16px', lineHeight: '1.4' }}>
                        {quiz.description || (isRtl ? 'اختبار تفاعلي مع درجات وتصحيح ذكي' : 'Interactive scored assessment')}
                      </p>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '8px',
                          background: 'var(--surface2)',
                          padding: '10px',
                          borderRadius: '8px',
                          marginBottom: '16px',
                          textAlign: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--t2)' }}>{isRtl ? 'الأسئلة' : 'Questions'}</div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--t1)' }}>{qQuestions.length || 3}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--t2)' }}>{isRtl ? 'الاجتياز' : 'Pass Min'}</div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#2563eb' }}>{quiz.passingScore || 70}%</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: 'var(--t2)' }}>{isRtl ? 'النجاح' : 'Pass Rate'}</div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#10b981' }}>{qPassRate}%</div>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid var(--edge)',
                        paddingTop: '12px',
                        marginTop: 'auto'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onOpenBuilder && onOpenBuilder(quiz)}
                        style={{
                          background: 'var(--a)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 14px',
                          fontSize: '12.5px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {isRtl ? 'فتح في البيلدر' : 'Open in Builder'}
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => setSelectedQuizForIntegrate(quiz)}
                          style={{
                            background: 'var(--surface2)',
                            border: '1px solid var(--edge)',
                            color: 'var(--t2)',
                            borderRadius: '6px',
                            padding: '6px',
                            cursor: 'pointer'
                          }}
                          title={isRtl ? 'تضمين' : 'Share'}
                        >
                          <Share2 size={14} />
                        </button>
                        <button
                          onClick={() => window.open(`/s/quiz_${quiz.id}`, '_blank')}
                          style={{
                            background: 'var(--surface2)',
                            border: '1px solid var(--edge)',
                            color: 'var(--t2)',
                            borderRadius: '6px',
                            padding: '6px',
                            cursor: 'pointer'
                          }}
                          title={isRtl ? 'معاينة' : 'Preview'}
                        >
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Analytics Subtab */}
      {activeSubTab === 'analytics' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--t2)', textTransform: 'uppercase', marginBottom: '8px' }}>
                {isRtl ? 'إجمالي محاولات الاختبارات' : 'Total Quiz Attempts'}
              </div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--t1)' }}>{totalAttempts}</div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--t2)', textTransform: 'uppercase', marginBottom: '8px' }}>
                {isRtl ? 'المحاولات الناجحة (Pass)' : 'Successful Passes'}
              </div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#10b981' }}>{passedAttempts}</div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--t2)', textTransform: 'uppercase', marginBottom: '8px' }}>
                {isRtl ? 'متوسط نسبة الدرجات' : 'Average Score'}
              </div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#a855f7' }}>{avgScore}%</div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--t2)', textTransform: 'uppercase', marginBottom: '8px' }}>
                {isRtl ? 'معدل النجاح الكلي' : 'Overall Pass Rate'}
              </div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--a)' }}>{avgPassRate}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Submissions Subtab */}
      {activeSubTab === 'submissions' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--t1)', margin: 0 }}>
              {isRtl ? 'جميع نتائج واستجابات المرشحين' : 'All Candidate Quiz Submissions & Grading'}
            </h3>
            <button
              onClick={exportAllSubmissionsCsv}
              style={{
                background: 'var(--surface)',
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
              {isRtl ? 'تصدير CSV' : 'Export All CSV'}
            </button>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div style={{ background: 'var(--surface)', border: '1px dashed var(--edge)', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
              <Inbox size={32} color="var(--t2)" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--t1)' }}>{isRtl ? 'لا توجد محاولات مسجلة' : 'No Submissions Yet'}</div>
              <div style={{ fontSize: '12px', color: 'var(--t2)', marginTop: '4px' }}>
                {isRtl ? 'شارك رابط الاختبار مع جمهورك لتبدأ النتائج بالظهور هنا.' : 'Share your quiz link with respondents to see live scored results.'}
              </div>
            </div>
          ) : (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--edge)' }}>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--t2)' }}>{isRtl ? 'المرشح' : 'Respondent'}</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--t2)' }}>{isRtl ? 'اسم الاختبار' : 'Quiz'}</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--t2)' }}>{isRtl ? 'الدرجة' : 'Score %'}</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--t2)' }}>{isRtl ? 'الحالة' : 'Status'}</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--t2)' }}>{isRtl ? 'النقاط' : 'Points'}</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--t2)' }}>{isRtl ? 'التاريخ' : 'Date'}</th>
                    <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--t2)', textAlign: 'center' }}>{isRtl ? 'فحص الإجابات' : 'Review Answers'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((sub, idx) => (
                    <tr key={sub.id || idx} style={{ borderBottom: '1px solid var(--edge)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--t1)' }}>{sub.name || (isRtl ? 'مرشح مجهول' : 'Anonymous')}</div>
                        <div style={{ fontSize: '12px', color: 'var(--t2)' }}>{sub.email || sub.phone || 'No email provided'}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--t1)' }}>{sub.quizName}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '800' }}>
                        <span style={{ color: sub.passed ? '#10b981' : '#ef4444' }}>{sub.percentage || 0}%</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {sub.passed ? (
                          <span style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={12} /> {isRtl ? 'ناجح' : 'PASSED'}
                          </span>
                        ) : (
                          <span style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <XCircle size={12} /> {isRtl ? 'راسب' : 'FAILED'}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--t1)' }}>
                        {sub.score || 0} / {sub.totalPoints || sub.totalPossibleScore || 100} pts
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '12.5px', color: 'var(--t2)' }}>
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'Recently'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          onClick={() => setInspectingSubmission(sub)}
                          style={{
                            background: 'var(--surface2)',
                            border: '1px solid var(--edge)',
                            color: 'var(--a)',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          {isRtl ? 'تفاصيل الإجابات' : 'View Answers'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Quiz Modal */}
      {isCreateModalOpen && (
        <CreateQuizModal
          isRtl={isRtl}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateBlank={(name) => {
            if (onCreateBlank) onCreateBlank(name);
            setIsCreateModalOpen(false);
          }}
          onCreateFromTemplate={(template) => {
            if (onCreateFromTemplate) onCreateFromTemplate(template);
            setIsCreateModalOpen(false);
          }}
        />
      )}

      {/* Integrate / Embed Modal */}
      {selectedQuizForIntegrate && (
        <QuizIntegrateModal
          quiz={selectedQuizForIntegrate}
          isRtl={isRtl}
          onClose={() => setSelectedQuizForIntegrate(null)}
          showToast={showToast}
        />
      )}

      {/* Quiz Submissions Modal */}
      {selectedQuizForSubmissions && (
        <QuizSubmissionsModal
          quiz={selectedQuizForSubmissions}
          isRtl={isRtl}
          onClose={() => setSelectedQuizForSubmissions(null)}
          showToast={showToast}
        />
      )}

      {/* Individual Submission Inspection Dialog */}
      {inspectingSubmission && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
          onClick={() => setInspectingSubmission(null)}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--edge)',
              borderRadius: '16px',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '24px',
              direction: isRtl ? 'rtl' : 'ltr'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--edge)', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--t1)' }}>
                  {isRtl ? 'تفاصيل إجابات المرشح' : 'Candidate Answers Breakdown'}
                </h3>
                <div style={{ fontSize: '13px', color: 'var(--t2)' }}>
                  {inspectingSubmission.name || 'Anonymous'} ({inspectingSubmission.email || 'No email'})
                </div>
              </div>
              <span
                style={{
                  background: inspectingSubmission.passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: inspectingSubmission.passed ? '#10b981' : '#ef4444',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '13px'
                }}
              >
                {inspectingSubmission.percentage}% • {inspectingSubmission.passed ? (isRtl ? 'ناجح' : 'PASSED') : (isRtl ? 'راسب' : 'FAILED')}
              </span>
            </div>

            {/* Answer Breakdown list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(inspectingSubmission.answers || []).map((ans, aIdx) => (
                <div
                  key={aIdx}
                  style={{
                    background: 'var(--surface2)',
                    border: `1px solid ${ans.isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    borderRadius: '10px',
                    padding: '14px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--t1)' }}>
                      Q{aIdx + 1}: {ans.questionTitle || ans.title || `Question ${aIdx + 1}`}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: ans.isCorrect ? '#10b981' : '#ef4444',
                        background: ans.isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}
                    >
                      {ans.isCorrect ? (isRtl ? 'صحيحة (+ نقاط)' : 'CORRECT') : (isRtl ? 'خاطئة' : 'INCORRECT')}
                    </span>
                  </div>

                  <div style={{ fontSize: '12.5px', color: 'var(--t1)', margin: '4px 0' }}>
                    <strong>{isRtl ? 'إجابة المرشح:' : 'Selected:'}</strong> {ans.selectedAnswer || 'None'}
                  </div>

                  {!ans.isCorrect && ans.correctAnswer && (
                    <div style={{ fontSize: '12.5px', color: '#10b981', margin: '4px 0' }}>
                      <strong>{isRtl ? 'الإجابة الصحيحة:' : 'Correct Answer:'}</strong> {ans.correctAnswer}
                    </div>
                  )}

                  {ans.explanation && (
                    <div style={{ fontSize: '11.5px', color: 'var(--t2)', background: 'var(--surface)', padding: '8px', borderRadius: '6px', marginTop: '6px', borderLeft: '3px solid var(--a)' }}>
                      💡 {ans.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', textAlign: isRtl ? 'left' : 'right' }}>
              <button
                onClick={() => setInspectingSubmission(null)}
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--edge)',
                  color: 'var(--t1)',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {isRtl ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
