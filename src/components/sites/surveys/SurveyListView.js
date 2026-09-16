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
  FileText,
  Sparkles,
  BarChart3,
  Calendar,
  User,
  CheckCircle2,
  ArrowRight,
  Download,
  FolderPlus,
  Layers,
  Inbox,
  TrendingUp,
  Clock
} from 'lucide-react';
import CreateSurveyModal from './CreateSurveyModal';
import SurveyIntegrateModal from './SurveyIntegrateModal';
import SurveySubmissionsModal from './SurveySubmissionsModal';

export default function SurveyListView({
  surveys = [],
  onOpenBuilder,
  onCreateBlank,
  onCreateFromTemplate,
  onDeleteSurvey,
  onDuplicateSurvey,
  onUpdateSurveyName,
  isRtl = false,
  showToast = () => {}
}) {
  const [activeSubTab, setActiveSubTab] = useState('all'); // 'all' | 'analytics' | 'submissions'
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeActionMenuId, setActiveActionMenuId] = useState(null);
  const [selectedSurveyForIntegrate, setSelectedSurveyForIntegrate] = useState(null);
  const [selectedSurveyForSubmissions, setSelectedSurveyForSubmissions] = useState(null);
  const [renamingSurveyId, setRenamingSurveyId] = useState(null);
  const [renamingValue, setRenamingValue] = useState('');
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState('');

  // Filtered surveys
  const filteredSurveys = useMemo(() => {
    return surveys.filter((s) =>
      (s.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [surveys, searchQuery]);

  // Aggregate submissions across all surveys
  const allSubmissions = useMemo(() => {
    const list = [];
    surveys.forEach((s) => {
      (s.submissions || []).forEach((sub) => {
        list.push({
          ...sub,
          surveyId: s.id,
          surveyName: s.name
        });
      });
    });
    return list.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
  }, [surveys]);

  const filteredSubmissions = useMemo(() => {
    return allSubmissions.filter((sub) => {
      const text = `${sub.name || ''} ${sub.email || ''} ${sub.surveyName || ''} ${JSON.stringify(sub.data || {})}`.toLowerCase();
      return text.includes(searchQuery.toLowerCase());
    });
  }, [allSubmissions, searchQuery]);

  // Aggregate analytics
  const totalViews = useMemo(() => surveys.reduce((acc, s) => acc + (s.analytics?.views || s.viewsCount || (s.submissions?.length ? s.submissions.length * 2 + 5 : 0)), 0), [surveys]);
  const totalSubmissions = useMemo(() => allSubmissions.length, [allSubmissions]);
  const avgCompletion = totalViews > 0 ? ((totalSubmissions / totalViews) * 100).toFixed(1) : '0.0';

  const handleStartRename = (survey) => {
    setRenamingSurveyId(survey.id);
    setRenamingValue(survey.name);
    setActiveActionMenuId(null);
  };

  const handleSaveRename = (surveyId) => {
    if (renamingValue.trim() && onUpdateSurveyName) {
      onUpdateSurveyName(surveyId, renamingValue.trim());
      showToast(isRtl ? 'تم تغيير اسم الاستبيان بنجاح' : 'Survey renamed successfully');
    }
    setRenamingSurveyId(null);
  };

  const exportAllSubmissionsCsv = () => {
    if (allSubmissions.length === 0) {
      showToast(isRtl ? 'لا توجد استجابات للتصدير' : 'No submissions to export');
      return;
    }

    const headers = ['Survey Name', 'Submission ID', 'Date & Time', 'Respondent Name', 'Email', 'Phone', 'Data Summary'];
    const rows = allSubmissions.map((s) => [
      `"${s.surveyName.replace(/"/g, '""')}"`,
      s.id,
      s.submittedAt,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${(s.email || '').replace(/"/g, '""')}"`,
      `"${(s.phone || '').replace(/"/g, '""')}"`,
      `"${JSON.stringify(s.data || {}).replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `all_surveys_submissions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(isRtl ? 'تم تصدير ملف الاستجابات (CSV) بنجاح' : 'CSV exported successfully');
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
      {/* Top Header matching Screenshot 1 with dark theme variables */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--edge)',
          paddingBottom: '0px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        {/* Left Sub-tabs: Surveys | All surveys | Analytics | Submissions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--t1)', padding: '12px 0' }}>
            {isRtl ? 'الاستبيانات' : 'Surveys'}
          </span>
          <button
            onClick={() => setActiveSubTab('all')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeSubTab === 'all' ? '2px solid var(--a)' : '2px solid transparent',
              color: activeSubTab === 'all' ? 'var(--a)' : 'var(--t2)',
              fontWeight: activeSubTab === 'all' ? '700' : '500',
              fontSize: '14px',
              padding: '12px 4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isRtl ? 'جميع الاستبيانات' : 'All surveys'}
          </button>
          <button
            onClick={() => setActiveSubTab('analytics')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeSubTab === 'analytics' ? '2px solid var(--a)' : '2px solid transparent',
              color: activeSubTab === 'analytics' ? 'var(--a)' : 'var(--t2)',
              fontWeight: activeSubTab === 'analytics' ? '700' : '500',
              fontSize: '14px',
              padding: '12px 4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isRtl ? 'التحليلات' : 'Analytics'}
          </button>
          <button
            onClick={() => setActiveSubTab('submissions')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeSubTab === 'submissions' ? '2px solid var(--a)' : '2px solid transparent',
              color: activeSubTab === 'submissions' ? 'var(--a)' : 'var(--t2)',
              fontWeight: activeSubTab === 'submissions' ? '700' : '500',
              fontSize: '14px',
              padding: '12px 4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isRtl ? 'الاستجابات' : 'Submissions'}
          </button>
        </div>

        {/* Right Action buttons matching Screenshot 1 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => {
              if (showToast) showToast(isRtl ? 'ميزات وتفضيلات الاستبيانات' : 'Survey features & preferences');
            }}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--edge)',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--t1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} color="#3b82f6" />
            <span>{isRtl ? 'ميزات الاستبيان' : 'Survey features'}</span>
          </button>

          <button
            onClick={() => setIsFolderModalOpen(true)}
            title={isRtl ? 'مجلد جديد' : 'New Folder'}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--edge)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '13px',
              color: 'var(--t1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FolderPlus size={16} />
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 18px',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}
          >
            <Plus size={16} />
            <span>{isRtl ? '+ إنشاء استبيان' : '+ Create survey'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area based on activeSubTab */}
      {activeSubTab === 'all' && (
        <div>
          {/* Search & View Mode Switcher bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              gap: '12px'
            }}
          >
            <div style={{ position: 'relative', width: '340px', maxWidth: '100%' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  [isRtl ? 'right' : 'left']: '12px',
                  color: 'var(--t3)'
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'البحث عن استبيان...' : 'Search for surveys'}
                className="inp"
                style={{
                  width: '100%',
                  padding: isRtl ? '8px 36px 8px 12px' : '8px 12px 8px 36px',
                  fontSize: '13px'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--surface2)', padding: '3px', borderRadius: '6px', border: '1px solid var(--edge)' }}>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  background: viewMode === 'list' ? 'var(--surface)' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px',
                  color: viewMode === 'list' ? 'var(--a)' : 'var(--t2)',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                }}
                title={isRtl ? 'عرض القائمة' : 'List View'}
              >
                <LayoutList size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  background: viewMode === 'grid' ? 'var(--surface)' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px',
                  color: viewMode === 'grid' ? 'var(--a)' : 'var(--t2)',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'grid' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                }}
                title={isRtl ? 'عرض الشبكة' : 'Grid View'}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>

          {/* Survey List Table / Grid */}
          {filteredSurveys.length === 0 ? (
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: '12px',
                border: '1px solid var(--edge)',
                padding: '56px 24px',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(37, 99, 235, 0.1)',
                  color: 'var(--a)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <FileText size={30} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--t1)', margin: '0 0 6px' }}>
                {isRtl ? 'لا توجد استبيانات حالياً' : 'No surveys found'}
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--t2)', maxWidth: '440px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                {isRtl
                  ? 'أنشئ أول استبيان تفاعلي متعدد الشرائح لجمع التقييمات وتأهيل العملاء المحتملين في المنشئ المرئي الكامل.'
                  : 'Create your first interactive multi-step survey in the visual builder to qualify leads and collect customer feedback.'}
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 22px',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                }}
              >
                <Plus size={16} />
                <span>{isRtl ? 'إنشاء استبيان جديد' : 'Create New Survey'}</span>
              </button>
            </div>
          ) : viewMode === 'list' ? (
            /* Table View matching Screenshot 1 */
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: '12px',
                border: '1px solid var(--edge)',
                overflow: 'hidden'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                <thead>
                  <tr
                    style={{
                      background: 'var(--surface2)',
                      borderBottom: '1px solid var(--edge)',
                      textAlign: isRtl ? 'right' : 'left'
                    }}
                  >
                    <th style={{ padding: '14px 20px', fontWeight: '700', color: 'var(--t2)', fontSize: '12px', textTransform: 'uppercase' }}>
                      {isRtl ? 'الاسم' : 'Name'}
                    </th>
                    <th style={{ padding: '14px 20px', fontWeight: '700', color: 'var(--t2)', fontSize: '12px', textTransform: 'uppercase' }}>
                      {isRtl ? 'آخر تحديث' : 'Last updated'}
                    </th>
                    <th style={{ padding: '14px 20px', fontWeight: '700', color: 'var(--t2)', fontSize: '12px', textTransform: 'uppercase' }}>
                      {isRtl ? 'تم التحديث بواسطة' : 'Updated by'}
                    </th>
                    <th style={{ padding: '14px 20px', fontWeight: '700', color: 'var(--t2)', fontSize: '12px', textTransform: 'uppercase' }}>
                      {isRtl ? 'الاستجابات' : 'Submissions'}
                    </th>
                    <th style={{ padding: '14px 20px', textAlign: 'center', fontWeight: '700', color: 'var(--t2)', width: '60px' }}>
                      •••
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSurveys.map((survey) => (
                    <tr
                      key={survey.id}
                      style={{
                        borderBottom: '1px solid var(--edge)',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Survey Name Column */}
                      <td style={{ padding: '16px 20px' }}>
                        {renamingSurveyId === survey.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="text"
                              value={renamingValue}
                              autoFocus
                              onChange={(e) => setRenamingValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRename(survey.id);
                                if (e.key === 'Escape') setRenamingSurveyId(null);
                              }}
                              className="inp"
                              style={{ padding: '4px 8px', fontSize: '13px', width: '200px' }}
                            />
                            <button
                              onClick={() => handleSaveRename(survey.id)}
                              style={{
                                background: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              ✓
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => onOpenBuilder(survey)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                background: 'rgba(37, 99, 235, 0.12)',
                                color: 'var(--a)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <FileText size={18} />
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', color: 'var(--t1)' }}>{survey.name}</div>
                              <div style={{ fontSize: '12px', color: 'var(--t2)' }}>
                                {survey.slides?.length || 1} {isRtl ? 'شرائح' : 'slides'}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Last Updated Column */}
                      <td style={{ padding: '16px 20px', color: 'var(--t2)' }}>
                        {survey.updatedAt || new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
                      </td>

                      {/* Updated By Column */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: 'var(--surface2)',
                              border: '1px solid var(--edge)',
                              color: 'var(--t1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: '700'
                            }}
                          >
                            MH
                          </div>
                          <span style={{ color: 'var(--t1)', fontWeight: '600' }}>
                            {survey.updatedBy || 'Mohamed Hesham'}
                          </span>
                        </div>
                      </td>

                      {/* Submissions Column */}
                      <td style={{ padding: '16px 20px' }}>
                        <button
                          onClick={() => setSelectedSurveyForSubmissions(survey)}
                          style={{
                            background: 'rgba(37, 99, 235, 0.1)',
                            border: '1px solid rgba(37, 99, 235, 0.3)',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12.5px',
                            fontWeight: '700',
                            color: 'var(--a)',
                            cursor: 'pointer'
                          }}
                        >
                          {survey.submissions?.length || 0} {isRtl ? 'استجابة' : 'responses'}
                        </button>
                      </td>

                      {/* Action Menu (3 dots) */}
                      <td style={{ padding: '16px 20px', textAlign: 'center', position: 'relative' }}>
                        <button
                          onClick={() => setActiveActionMenuId(activeActionMenuId === survey.id ? null : survey.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--t2)',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px'
                          }}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeActionMenuId === survey.id && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '44px',
                              [isRtl ? 'left' : 'right']: '18px',
                              background: 'var(--surface)',
                              border: '1px solid var(--edge)',
                              borderRadius: '10px',
                              boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                              zIndex: 100,
                              minWidth: '190px',
                              padding: '6px 0'
                            }}
                          >
                            <button
                              onClick={() => {
                                onOpenBuilder(survey);
                                setActiveActionMenuId(null);
                              }}
                              style={{
                                width: '100%',
                                textAlign: isRtl ? 'right' : 'left',
                                padding: '9px 14px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: 'var(--t1)',
                                cursor: 'pointer'
                              }}
                            >
                              <Edit3 size={14} color="#3b82f6" />
                              <span>{isRtl ? 'تعديل في المنشئ المرئي' : 'Edit in Builder'}</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedSurveyForIntegrate(survey);
                                setActiveActionMenuId(null);
                              }}
                              style={{
                                width: '100%',
                                textAlign: isRtl ? 'right' : 'left',
                                padding: '9px 14px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: 'var(--t1)',
                                cursor: 'pointer'
                              }}
                            >
                              <Share2 size={14} color="#10b981" />
                              <span>{isRtl ? 'رابط التضمين والمشاركة' : 'Share & Integrate'}</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedSurveyForSubmissions(survey);
                                setActiveActionMenuId(null);
                              }}
                              style={{
                                width: '100%',
                                textAlign: isRtl ? 'right' : 'left',
                                padding: '9px 14px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: 'var(--t1)',
                                cursor: 'pointer'
                              }}
                            >
                              <Eye size={14} color="#818cf8" />
                              <span>{isRtl ? 'عرض الاستجابات' : 'View Submissions'}</span>
                            </button>

                            <button
                              onClick={() => handleStartRename(survey)}
                              style={{
                                width: '100%',
                                textAlign: isRtl ? 'right' : 'left',
                                padding: '9px 14px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: 'var(--t1)',
                                cursor: 'pointer'
                              }}
                            >
                              <Edit3 size={14} color="#fbbf24" />
                              <span>{isRtl ? 'إعادة تسمية' : 'Rename'}</span>
                            </button>

                            <button
                              onClick={() => {
                                onDuplicateSurvey(survey);
                                setActiveActionMenuId(null);
                              }}
                              style={{
                                width: '100%',
                                textAlign: isRtl ? 'right' : 'left',
                                padding: '9px 14px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: 'var(--t1)',
                                cursor: 'pointer'
                              }}
                            >
                              <Copy size={14} color="var(--t2)" />
                              <span>{isRtl ? 'تكرار الاستبيان' : 'Duplicate'}</span>
                            </button>

                            <div style={{ height: '1px', background: 'var(--edge)', margin: '4px 0' }} />

                            <button
                              onClick={() => {
                                onDeleteSurvey(survey.id);
                                setActiveActionMenuId(null);
                              }}
                              style={{
                                width: '100%',
                                textAlign: isRtl ? 'right' : 'left',
                                padding: '9px 14px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#ef4444',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={14} />
                              <span>{isRtl ? 'حذف' : 'Delete'}</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Grid View */
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px'
              }}
            >
              {filteredSurveys.map((survey) => (
                <div
                  key={survey.id}
                  style={{
                    background: 'var(--surface)',
                    borderRadius: '12px',
                    border: '1px solid var(--edge)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--a)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--edge)';
                    e.currentTarget.style.transform = 'none';
                  }}
                  onClick={() => onOpenBuilder(survey)}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: 'rgba(37, 99, 235, 0.12)',
                          color: 'var(--a)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FileText size={20} />
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--t2)', background: 'var(--surface2)', padding: '2px 8px', borderRadius: '12px' }}>
                        {survey.slides?.length || 1} {isRtl ? 'شرائح' : 'slides'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--t1)', margin: '0 0 6px' }}>{survey.name}</h4>
                    <p style={{ fontSize: '12.5px', color: 'var(--t2)', margin: '0 0 16px' }}>
                      {survey.submissions?.length || 0} {isRtl ? 'استجابة مسجلة' : 'submissions collected'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid var(--edge)' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSurveyForIntegrate(survey);
                      }}
                      className="btn btn-ghost"
                      style={{
                        padding: '6px 10px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: 'var(--a)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Share2 size={14} />
                      <span>{isRtl ? 'مشاركة' : 'Share'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenBuilder(survey);
                      }}
                      style={{
                        background: 'rgba(37, 99, 235, 0.12)',
                        border: '1px solid rgba(37, 99, 235, 0.3)',
                        color: 'var(--a)',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      {isRtl ? 'تعديل' : 'Edit'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Analytics Subtab */}
      {activeSubTab === 'analytics' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--t2)', textTransform: 'uppercase', marginBottom: '8px' }}>
                {isRtl ? 'إجمالي الاستبيانات' : 'Total Surveys'}
              </div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--t1)' }}>{surveys.length}</div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--t2)', textTransform: 'uppercase', marginBottom: '8px' }}>
                {isRtl ? 'إجمالي الاستجابات المستلمة' : 'Total Submissions'}
              </div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--a)' }}>{totalSubmissions}</div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--t2)', textTransform: 'uppercase', marginBottom: '8px' }}>
                {isRtl ? 'متوسط نسبة الإكمال' : 'Avg Completion Rate'}
              </div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#10b981' }}>
                {avgCompletion}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submissions Subtab */}
      {activeSubTab === 'submissions' && (
        <div style={{ background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--edge)', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '800', color: 'var(--t1)' }}>
                {isRtl ? 'جميع الاستجابات الواردة' : 'All Submissions Log'}
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--t2)' }}>
                {allSubmissions.length} {isRtl ? 'استجابة عبر كافة استبياناتك' : 'total submissions across all surveys'}
              </p>
            </div>

            <button
              onClick={exportAllSubmissionsCsv}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <Download size={15} />
              <span>{isRtl ? 'تصدير الكل CSV' : 'Export All (CSV)'}</span>
            </button>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div style={{ padding: '40px 12px', textAlign: 'center', color: 'var(--t2)' }}>
              {isRtl ? 'لا توجد أي استجابات مسجلة حتى الآن' : 'No submissions found yet.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--edge)', textAlign: isRtl ? 'right' : 'left' }}>
                    <th style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--t2)', fontSize: '12px' }}>{isRtl ? 'الاستبيان' : 'Survey'}</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--t2)', fontSize: '12px' }}>{isRtl ? 'الاسم' : 'Name'}</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--t2)', fontSize: '12px' }}>{isRtl ? 'البريد' : 'Email'}</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--t2)', fontSize: '12px' }}>{isRtl ? 'التاريخ' : 'Date'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((sub, sIdx) => (
                    <tr key={sub.id || sIdx} style={{ borderBottom: '1px solid var(--edge)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--a)' }}>{sub.surveyName}</td>
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--t1)' }}>{sub.name || 'Anonymous'}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--t2)' }}>{sub.email || '—'}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--t3)', fontSize: '12px' }}>{sub.submittedAt || 'Recent'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateSurveyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateBlank={onCreateBlank}
        onCreateFromTemplate={onCreateFromTemplate}
        isRtl={isRtl}
        nextSurveyNumber={surveys.length}
      />

      <SurveyIntegrateModal
        isOpen={!!selectedSurveyForIntegrate}
        onClose={() => setSelectedSurveyForIntegrate(null)}
        survey={selectedSurveyForIntegrate}
        isRtl={isRtl}
        showToast={showToast}
      />

      <SurveySubmissionsModal
        isOpen={!!selectedSurveyForSubmissions}
        onClose={() => setSelectedSurveyForSubmissions(null)}
        survey={selectedSurveyForSubmissions}
        isRtl={isRtl}
        showToast={showToast}
      />
    </div>
  );
}
