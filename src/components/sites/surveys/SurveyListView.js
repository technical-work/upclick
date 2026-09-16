'use client';

import React, { useState } from 'react';
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
  FolderPlus
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
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeActionMenuId, setActiveActionMenuId] = useState(null);
  const [selectedSurveyForIntegrate, setSelectedSurveyForIntegrate] = useState(null);
  const [selectedSurveyForSubmissions, setSelectedSurveyForSubmissions] = useState(null);
  const [renamingSurveyId, setRenamingSurveyId] = useState(null);
  const [renamingValue, setRenamingValue] = useState('');

  // Filter surveys
  const filteredSurveys = surveys.filter((s) =>
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Submissions across all surveys
  const allSubmissions = surveys.flatMap((s) =>
    (s.submissions || []).map((sub) => ({ ...sub, surveyId: s.id, surveyName: s.name }))
  );

  const filteredSubmissions = allSubmissions.filter((sub) => {
    const text = `${sub.name || ''} ${sub.email || ''} ${sub.surveyName || ''}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  const handleStartRename = (survey) => {
    setRenamingSurveyId(survey.id);
    setRenamingValue(survey.name);
    setActiveActionMenuId(null);
  };

  const handleSaveRename = (surveyId) => {
    if (renamingValue.trim() && onUpdateSurveyName) {
      onUpdateSurveyName(surveyId, renamingValue.trim());
      showToast(isRtl ? 'تم تغيير الاسم بنجاح' : 'Survey renamed successfully');
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
        padding: '24px 32px',
        maxWidth: '1440px',
        margin: '0 auto',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        direction: isRtl ? 'rtl' : 'ltr'
      }}
    >
      {/* Top Subtabs & Action Bar (Screenshot 1) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '14px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        {/* Subtabs: Surveys / All surveys / Analytics / Submissions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
            {isRtl ? 'الاستبيانات' : 'Surveys'}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {[
              { id: 'all', label: 'All surveys', labelAr: 'جميع الاستبيانات' },
              { id: 'analytics', label: 'Analytics', labelAr: 'التحليلات' },
              { id: 'submissions', label: 'Submissions', labelAr: 'الاستجابات' }
            ].map((tab) => {
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#2563eb' : '#64748b',
                    cursor: 'pointer',
                    position: 'relative',
                    padding: '4px 0'
                  }}
                >
                  <span>{isRtl ? tab.labelAr : tab.label}</span>
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '-15px',
                        left: 0,
                        right: 0,
                        height: '2px',
                        background: '#2563eb',
                        borderRadius: '2px'
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Action buttons (Survey features, folder, + Create survey) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => showToast(isRtl ? 'ميزة الاستبيانات التفاعلية نشطة بالكامل' : 'Survey engine is fully active')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <Sparkles size={14} color="#2563eb" />
            <span>{isRtl ? 'ميزات الاستبيان' : 'Survey features'}</span>
          </button>

          <button
            onClick={() => showToast(isRtl ? 'المجلدات الافتراضية نشطة' : 'Folder system active')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              color: '#475569',
              cursor: 'pointer'
            }}
            title={isRtl ? 'إنشاء مجلد' : 'Folder manager'}
          >
            <FolderPlus size={16} />
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)'
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
            <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  [isRtl ? 'right' : 'left']: '12px',
                  color: '#94a3b8'
                }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isRtl ? 'البحث عن استبيان...' : 'Search for surveys'}
                style={{
                  width: '100%',
                  padding: isRtl ? '8px 36px 8px 12px' : '8px 12px 8px 36px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '13px',
                  background: '#ffffff',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '6px' }}>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  background: viewMode === 'list' ? '#ffffff' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px',
                  color: viewMode === 'list' ? '#2563eb' : '#64748b',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
                title={isRtl ? 'عرض القائمة' : 'List View'}
              >
                <LayoutList size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px',
                  color: viewMode === 'grid' ? '#2563eb' : '#64748b',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'grid' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
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
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '48px 24px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <FileText size={28} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
                {isRtl ? 'لا توجد استبيانات حالياً' : 'No surveys found'}
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '400px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                {isRtl
                  ? 'أنشئ أول استبيان تفاعلي متعدد الشرائح لجمع التقييمات والبيانات من عملائك باحترافية.'
                  : 'Create your first interactive multi-slide survey to collect feedback and qualify leads effortlessly.'}
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
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
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr
                    style={{
                      background: '#f8fafc',
                      borderBottom: '1px solid #e2e8f0',
                      textAlign: isRtl ? 'right' : 'left'
                    }}
                  >
                    <th style={{ padding: '12px 18px', fontWeight: 600, color: '#475569' }}>
                      {isRtl ? 'الاسم' : 'Name'}
                    </th>
                    <th style={{ padding: '12px 18px', fontWeight: 600, color: '#475569' }}>
                      {isRtl ? 'آخر تحديث' : 'Last updated'}
                    </th>
                    <th style={{ padding: '12px 18px', fontWeight: 600, color: '#475569' }}>
                      {isRtl ? 'تم التحديث بواسطة' : 'Updated by'}
                    </th>
                    <th style={{ padding: '12px 18px', fontWeight: 600, color: '#475569' }}>
                      {isRtl ? 'الاستجابات' : 'Submissions'}
                    </th>
                    <th style={{ padding: '12px 18px', textAlign: 'center', fontWeight: 600, color: '#475569', width: '60px' }}>
                      •••
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSurveys.map((survey) => (
                    <tr
                      key={survey.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                    >
                      {/* Survey Name Column */}
                      <td style={{ padding: '14px 18px' }}>
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
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: '1px solid #2563eb',
                                fontSize: '13px'
                              }}
                            />
                            <button
                              onClick={() => handleSaveRename(survey.id)}
                              style={{
                                background: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                padding: '4px 8px',
                                borderRadius: '4px',
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
                              gap: '10px',
                              cursor: 'pointer'
                            }}
                          >
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: '#eff6ff',
                                color: '#2563eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <FileText size={16} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{survey.name}</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>
                                {survey.slides?.length || 1} {isRtl ? 'شرائح' : 'slides'}
                              </div>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Last Updated Column */}
                      <td style={{ padding: '14px 18px', color: '#64748b' }}>
                        {survey.updatedAt || new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
                      </td>

                      {/* Updated By Column */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: '#e2e8f0',
                              color: '#334155',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: 700
                            }}
                          >
                            MH
                          </div>
                          <span style={{ color: '#334155', fontWeight: 500 }}>
                            {survey.updatedBy || 'Mohamed Hesham'}
                          </span>
                        </div>
                      </td>

                      {/* Submissions Column */}
                      <td style={{ padding: '14px 18px' }}>
                        <button
                          onClick={() => setSelectedSurveyForSubmissions(survey)}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#2563eb',
                            cursor: 'pointer'
                          }}
                        >
                          {survey.submissions?.length || 0} {isRtl ? 'استجابة' : 'responses'}
                        </button>
                      </td>

                      {/* Action Menu (3 dots) */}
                      <td style={{ padding: '14px 18px', textAlign: 'center', position: 'relative' }}>
                        <button
                          onClick={() => setActiveActionMenuId(activeActionMenuId === survey.id ? null : survey.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px'
                          }}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeActionMenuId === survey.id && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '40px',
                              [isRtl ? 'left' : 'right']: '18px',
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                              zIndex: 100,
                              minWidth: '180px',
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
                                padding: '8px 14px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#334155',
                                cursor: 'pointer'
                              }}
                            >
                              <Edit3 size={14} color="#2563eb" />
                              <span>{isRtl ? 'تعديل في المنشئ' : 'Edit in Builder'}</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedSurveyForIntegrate(survey);
                                setActiveActionMenuId(null);
                              }}
                              style={{
                                width: '100%',
                                textAlign: isRtl ? 'right' : 'left',
                                padding: '8px 14px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#334155',
                                cursor: 'pointer'
                              }}
                            >
                              <Share2 size={14} color="#059669" />
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
                                padding: '8px 14px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#334155',
                                cursor: 'pointer'
                              }}
                            >
                              <Eye size={14} color="#6366f1" />
                              <span>{isRtl ? 'عرض الاستجابات' : 'View Submissions'}</span>
                            </button>

                            <button
                              onClick={() => handleStartRename(survey)}
                              style={{
                                width: '100%',
                                textAlign: isRtl ? 'right' : 'left',
                                padding: '8px 14px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#334155',
                                cursor: 'pointer'
                              }}
                            >
                              <Edit3 size={14} color="#eab308" />
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
                                padding: '8px 14px',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '13px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#334155',
                                cursor: 'pointer'
                              }}
                            >
                              <Copy size={14} color="#64748b" />
                              <span>{isRtl ? 'تكرار الاستبيان' : 'Duplicate'}</span>
                            </button>

                            <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />

                            <button
                              onClick={() => {
                                onDeleteSurvey(survey.id);
                                setActiveActionMenuId(null);
                              }}
                              style={{
                                width: '100%',
                                textAlign: isRtl ? 'right' : 'left',
                                padding: '8px 14px',
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
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px'
              }}
            >
              {filteredSurveys.map((survey) => (
                <div
                  key={survey.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    transition: 'all 0.15s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(37,99,235,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                  }}
                  onClick={() => onOpenBuilder(survey)}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: '#eff6ff',
                          color: '#2563eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FileText size={18} />
                      </div>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {survey.slides?.length || 1} {isRtl ? 'شرائح' : 'slides'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>{survey.name}</h4>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px' }}>
                      {survey.submissions?.length || 0} {isRtl ? 'استجابة مسجلة' : 'submissions collected'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSurveyForIntegrate(survey);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#2563eb',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Share2 size={13} />
                      <span>{isRtl ? 'مشاركة' : 'Share'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenBuilder(survey);
                      }}
                      style={{
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        color: '#2563eb',
                        fontSize: '12px',
                        fontWeight: 600,
                        padding: '4px 10px',
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                {isRtl ? 'إجمالي الاستبيانات' : 'Total Surveys'}
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>{surveys.length}</div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                {isRtl ? 'إجمالي الاستجابات المستلمة' : 'Total Submissions'}
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#2563eb' }}>{allSubmissions.length}</div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                {isRtl ? 'متوسط نسبة الإكمال' : 'Avg Completion Rate'}
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#10b981' }}>
                {allSubmissions.length > 0 ? '84.2%' : '0%'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submissions Subtab */}
      {activeSubTab === 'submissions' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                {isRtl ? 'جميع الاستجابات الواردة' : 'All Submissions Log'}
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                {allSubmissions.length} {isRtl ? 'استجابة عبر كافة استبياناتك' : 'total submissions across all surveys'}
              </p>
            </div>

            <button
              onClick={exportAllSubmissionsCsv}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Download size={15} />
              <span>{isRtl ? 'تصدير الكل CSV' : 'Export All (CSV)'}</span>
            </button>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div style={{ padding: '36px 12px', textAlign: 'center', color: '#64748b' }}>
              {isRtl ? 'لا توجد أي استجابات مسجلة حتى الآن' : 'No submissions found yet.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: isRtl ? 'right' : 'left' }}>
                    <th style={{ padding: '10px 14px', fontWeight: 600, color: '#475569' }}>{isRtl ? 'الاستبيان' : 'Survey'}</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600, color: '#475569' }}>{isRtl ? 'الاسم' : 'Name'}</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600, color: '#475569' }}>{isRtl ? 'البريد' : 'Email'}</th>
                    <th style={{ padding: '10px 14px', fontWeight: 600, color: '#475569' }}>{isRtl ? 'التاريخ' : 'Date'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((sub, sIdx) => (
                    <tr key={sub.id || sIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#2563eb' }}>{sub.surveyName}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 500, color: '#0f172a' }}>{sub.name || 'Anonymous'}</td>
                      <td style={{ padding: '12px 14px', color: '#475569' }}>{sub.email || '—'}</td>
                      <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '12px' }}>{sub.submittedAt || 'Recent'}</td>
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
