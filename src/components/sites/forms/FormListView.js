'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  MoreVertical,
  FolderPlus,
  SlidersHorizontal,
  Clock,
  List,
  Grid,
  FileText,
  Trash2,
  Copy,
  ExternalLink,
  Code2,
  Eye,
  Edit3,
  Calendar,
  User,
  AtSign,
  ChevronRight,
  TrendingUp,
  Inbox,
  Share2,
  Check
} from 'lucide-react';

export default function FormListView({
  forms = [],
  isRtl,
  onSelectForm,
  onOpenCreateModal,
  onDuplicateForm,
  onDeleteForm,
  onOpenSubmissions,
  onOpenIntegrate,
  onPreviewLiveForm,
  showToast
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'analytics' | 'submissions'
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('all');

  // Filtered forms
  const filteredForms = useMemo(() => {
    return forms.filter((form) => {
      const matchesSearch = !searchQuery || form.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFolder = selectedFolder === 'all' || form.folderId === selectedFolder;
      return matchesSearch && matchesFolder;
    });
  }, [forms, searchQuery, selectedFolder]);

  // Aggregate submissions across all forms
  const allSubmissions = useMemo(() => {
    const list = [];
    forms.forEach((form) => {
      (form.submissions || []).forEach((sub) => {
        list.push({
          ...sub,
          formName: form.name,
          formId: form.id
        });
      });
    });
    return list.sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
  }, [forms]);

  // Aggregate analytics
  const totalViews = useMemo(() => forms.reduce((acc, f) => acc + (f.analytics?.views || 0), 0), [forms]);
  const totalSubmissions = useMemo(() => forms.reduce((acc, f) => acc + (f.submissions?.length || f.analytics?.submissions || 0), 0), [forms]);
  const avgConversion = totalViews > 0 ? ((totalSubmissions / totalViews) * 100).toFixed(1) : '0.0';

  const handleCreateFolder = () => {
    if (!folderName.trim()) return;
    const newFolder = {
      id: `folder_${Date.now()}`,
      name: folderName.trim(),
      createdAt: new Date().toISOString()
    };
    setFolders([...folders, newFolder]);
    setFolderName('');
    setIsFolderModalOpen(false);
    if (showToast) showToast(isRtl ? 'تم إنشاء المجلد بنجاح' : 'Folder created successfully');
  };

  return (
    <div style={{ padding: '0 24px', direction: isRtl ? 'rtl' : 'ltr', animation: 'fadeIn 0.25s ease' }}>
      
      {/* Top Header matching Screenshot 1 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '0px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        {/* Left Sub-tabs: Forms | All forms | Analytics | Submissions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', padding: '12px 0' }}>
            {isRtl ? 'النماذج' : 'Forms'}
          </span>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'all' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'all' ? '#2563eb' : '#64748b',
              fontWeight: activeTab === 'all' ? '700' : '500',
              fontSize: '14px',
              padding: '12px 4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isRtl ? 'جميع النماذج' : 'All forms'}
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'analytics' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'analytics' ? '#2563eb' : '#64748b',
              fontWeight: activeTab === 'analytics' ? '700' : '500',
              fontSize: '14px',
              padding: '12px 4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isRtl ? 'التحليلات' : 'Analytics'}
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'submissions' ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === 'submissions' ? '#2563eb' : '#64748b',
              fontWeight: activeTab === 'submissions' ? '700' : '500',
              fontSize: '14px',
              padding: '12px 4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isRtl ? 'الاستجابات والمشاركات' : 'Submissions'}
          </button>
        </div>

        {/* Right Action buttons matching Screenshot 1 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => {
              if (showToast) showToast(isRtl ? 'ميزات وتفضيلات النماذج' : 'Form features & preferences');
            }}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <SlidersHorizontal size={14} />
            <span>{isRtl ? 'ميزات النماذج' : 'Form features'}</span>
          </button>

          <button
            onClick={() => setIsFolderModalOpen(true)}
            title={isRtl ? 'مجلد جديد' : 'New Folder'}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '13px',
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FolderPlus size={16} />
          </button>

          <button
            onClick={onOpenCreateModal}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 18px',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>{isRtl ? '+ إنشاء نموذج' : '+ Create form'}</span>
          </button>
        </div>
      </div>

      {/* Main Tab View Handling */}
      {activeTab === 'all' && (
        <>
          {/* Filter / Search bar matching Screenshot 1 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '2px'
                }}
              >
                <button
                  title={isRtl ? 'الأحدث' : 'Recent'}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Clock size={15} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  title={isRtl ? 'عرض القائمة' : 'List View'}
                  style={{
                    background: viewMode === 'list' ? '#ffffff' : 'none',
                    border: 'none',
                    boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    color: viewMode === 'list' ? '#2563eb' : '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <List size={15} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  title={isRtl ? 'عرض الشبكة' : 'Grid View'}
                  style={{
                    background: viewMode === 'grid' ? '#ffffff' : 'none',
                    border: 'none',
                    boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    color: viewMode === 'grid' ? '#2563eb' : '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Grid size={15} />
                </button>
              </div>

              {folders.length > 0 && (
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    background: '#ffffff',
                    color: '#334155'
                  }}
                >
                  <option value="all">{isRtl ? 'جميع المجلدات' : 'All Folders'}</option>
                  {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              )}
            </div>

            {/* Search Input matching Screenshot 1 */}
            <div style={{ position: 'relative', width: '280px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  [isRtl ? 'right' : 'left']: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }}
              />
              <input
                type="text"
                placeholder={isRtl ? 'بحث في النماذج...' : 'Search for forms'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  [isRtl ? 'paddingRight' : 'paddingLeft']: '36px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  background: '#ffffff',
                  outline: 'none',
                  color: '#0f172a'
                }}
              />
            </div>
          </div>

          {/* Forms Table / Grid */}
          {filteredForms.length === 0 ? (
            /* Empty State */
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '60px 20px',
                textAlign: 'center',
                color: '#64748b'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <FileText size={30} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', margin: '0 0 6px 0', color: '#0f172a' }}>
                {searchQuery
                  ? (isRtl ? 'لم يتم العثور على نماذج مطابقة' : 'No matching forms found')
                  : (isRtl ? 'لا توجد نماذج تم إنشاؤها بعد' : 'No forms created yet')}
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748b', maxWidth: '440px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
                {isRtl
                  ? 'قم ببناء نماذج احترافية مخصصة لجمع بيانات العملاء، الحجوزات، والمدفوعات ومشاركتها في أي مكان.'
                  : 'Build custom high-converting forms to capture leads, feedback, registrations and receive payments.'}
              </p>
              <button
                onClick={onOpenCreateModal}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)'
                }}
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>{isRtl ? 'إنشاء أول نموذج' : 'Create First Form'}</span>
              </button>
            </div>
          ) : viewMode === 'list' ? (
            /* Table matching Screenshot 1 */
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                overflow: 'visible'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
                <thead>
                  <tr
                    style={{
                      background: '#ffffff',
                      borderBottom: '1px solid #e2e8f0',
                      fontSize: '12.5px',
                      fontWeight: '600',
                      color: '#64748b'
                    }}
                  >
                    <th style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AtSign size={14} style={{ color: '#94a3b8' }} />
                      <span>{isRtl ? 'الاسم' : 'Name'}</span>
                    </th>
                    <th style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} style={{ color: '#94a3b8' }} />
                        <span>{isRtl ? 'تم التحديث في' : 'Updated on'}</span>
                      </div>
                    </th>
                    <th style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} style={{ color: '#94a3b8' }} />
                        <span>{isRtl ? 'تم التحديث بواسطة' : 'Updated by'}</span>
                      </div>
                    </th>
                    <th style={{ padding: '14px 20px', width: '60px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredForms.map((form) => (
                    <tr
                      key={form.id}
                      onClick={() => onSelectForm(form)}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                    >
                      <td style={{ padding: '16px 20px', fontWeight: '600', color: '#0f172a', fontSize: '13.5px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: '#2563eb' }}>{form.name}</span>
                          {form.submissions?.length > 0 && (
                            <span
                              style={{
                                background: '#eff6ff',
                                color: '#2563eb',
                                fontSize: '11px',
                                fontWeight: '700',
                                padding: '2px 8px',
                                borderRadius: '12px'
                              }}
                            >
                              {form.submissions.length} {isRtl ? 'استجابة' : 'subs'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', color: '#64748b', fontSize: '13px' }}>
                        {form.lastUpdated || 'Recently'}
                      </td>
                      <td style={{ padding: '16px 20px', color: '#475569', fontSize: '13px' }}>
                        {form.createdBy || 'Admin'}
                      </td>
                      <td
                        style={{ padding: '16px 20px', position: 'relative' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === form.id ? null : form.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {/* Action Menu Popup */}
                        {activeMenuId === form.id && (
                          <div
                            style={{
                              position: 'absolute',
                              [isRtl ? 'left' : 'right']: '20px',
                              top: '40px',
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '10px',
                              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.12)',
                              zIndex: 100,
                              minWidth: '180px',
                              padding: '6px 0',
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                          >
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onSelectForm(form);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: '9px 16px',
                                fontSize: '13px',
                                color: '#334155',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                textAlign: isRtl ? 'right' : 'left'
                              }}
                            >
                              <Edit3 size={14} />
                              <span>{isRtl ? 'تعديل في المنشئ' : 'Edit in Builder'}</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onOpenSubmissions(form);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: '9px 16px',
                                fontSize: '13px',
                                color: '#334155',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                textAlign: isRtl ? 'right' : 'left'
                              }}
                            >
                              <Inbox size={14} />
                              <span>{isRtl ? 'عرض الاستجابات' : 'Submissions'}</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onOpenIntegrate(form);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: '9px 16px',
                                fontSize: '13px',
                                color: '#334155',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                textAlign: isRtl ? 'right' : 'left'
                              }}
                            >
                              <Share2 size={14} />
                              <span>{isRtl ? 'تضمين ومشاركة' : 'Integrate'}</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onPreviewLiveForm(form);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: '9px 16px',
                                fontSize: '13px',
                                color: '#334155',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                textAlign: isRtl ? 'right' : 'left'
                              }}
                            >
                              <Eye size={14} />
                              <span>{isRtl ? 'معاينة النموذج مباشرة' : 'Preview Live'}</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                onDuplicateForm(form);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: '9px 16px',
                                fontSize: '13px',
                                color: '#334155',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                textAlign: isRtl ? 'right' : 'left'
                              }}
                            >
                              <Copy size={14} />
                              <span>{isRtl ? 'نسخ النموذج' : 'Duplicate'}</span>
                            </button>

                            <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0' }} />

                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                if (confirm(isRtl ? 'هل أنت متأكد من حذف هذا النموذج؟' : 'Are you sure you want to delete this form?')) {
                                  onDeleteForm(form.id);
                                }
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: '9px 16px',
                                fontSize: '13px',
                                color: '#dc2626',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                textAlign: isRtl ? 'right' : 'left'
                              }}
                            >
                              <Trash2 size={14} />
                              <span>{isRtl ? 'حذف النموذج' : 'Delete'}</span>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {filteredForms.map((form) => (
                <div
                  key={form.id}
                  onClick={() => onSelectForm(form)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                  }}
                >
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
                    <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                      {form.fields?.length || 0} {isRtl ? 'حقول' : 'fields'}
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                    {form.name}
                  </h3>
                  <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: '#64748b' }}>
                    {isRtl ? 'تم التحديث:' : 'Updated:'} {form.lastUpdated || 'Recently'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>
                      {form.submissions?.length || 0} {isRtl ? 'استجابة' : 'submissions'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectForm(form);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>{isRtl ? 'فتح' : 'Open'}</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Analytics Sub-Tab */}
      {activeTab === 'analytics' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>
                {isRtl ? 'إجمالي مشاهدات النماذج' : 'Total Form Views'}
              </span>
              <h2 style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>
                {totalViews}
              </h2>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>
                {isRtl ? 'إجمالي الاستجابات المستلمة' : 'Total Submissions'}
              </span>
              <h2 style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: '800', color: '#2563eb' }}>
                {totalSubmissions}
              </h2>
            </div>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>
                {isRtl ? 'متوسط معدل التحويل' : 'Avg Conversion Rate'}
              </span>
              <h2 style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: '800', color: '#16a34a' }}>
                {avgConversion}%
              </h2>
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
              {isRtl ? 'أداء النماذج الفردية' : 'Form Performance Breakdown'}
            </h3>
            {forms.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '13.5px' }}>{isRtl ? 'لا توجد بيانات متاحة بعد' : 'No form data available yet'}</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b' }}>
                    <th style={{ padding: '10px' }}>{isRtl ? 'النموذج' : 'Form'}</th>
                    <th style={{ padding: '10px' }}>{isRtl ? 'المشاهدات' : 'Views'}</th>
                    <th style={{ padding: '10px' }}>{isRtl ? 'الاستجابات' : 'Submissions'}</th>
                    <th style={{ padding: '10px' }}>{isRtl ? 'معدل التحويل' : 'Conversion'}</th>
                  </tr>
                </thead>
                <tbody>
                  {forms.map(f => {
                    const views = f.analytics?.views || 0;
                    const subs = f.submissions?.length || f.analytics?.submissions || 0;
                    const cr = views > 0 ? ((subs / views) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 10px', fontWeight: '600', color: '#0f172a' }}>{f.name}</td>
                        <td style={{ padding: '14px 10px', color: '#64748b' }}>{views}</td>
                        <td style={{ padding: '14px 10px', color: '#2563eb', fontWeight: '600' }}>{subs}</td>
                        <td style={{ padding: '14px 10px', color: '#16a34a', fontWeight: '700' }}>{cr}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Submissions Sub-Tab */}
      {activeTab === 'submissions' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
              {isRtl ? 'جميع الاستجابات الواردة' : 'All Form Submissions'}
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {allSubmissions.length} {isRtl ? 'استجابة إجمالية' : 'total submissions'}
            </span>
          </div>
          {allSubmissions.length === 0 ? (
            <div style={{ padding: '50px 20px', textAlign: 'center', color: '#64748b' }}>
              <Inbox size={32} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>
                {isRtl ? 'لا توجد استجابات بعد' : 'No submissions yet'}
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                {isRtl ? 'ستظهر الاستجابات هنا بمجرد أن يقوم الزوار بملء نماذجك.' : 'Submissions will appear here once someone fills out your forms.'}
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b' }}>
                  <th style={{ padding: '12px 16px' }}>{isRtl ? 'التاريخ' : 'Submitted At'}</th>
                  <th style={{ padding: '12px 16px' }}>{isRtl ? 'النموذج' : 'Form'}</th>
                  <th style={{ padding: '12px 16px' }}>{isRtl ? 'الاسم' : 'Name'}</th>
                  <th style={{ padding: '12px 16px' }}>{isRtl ? 'البريد الإلكتروني' : 'Email'}</th>
                  <th style={{ padding: '12px 16px' }}>{isRtl ? 'الهاتف' : 'Phone'}</th>
                </tr>
              </thead>
              <tbody>
                {allSubmissions.map((sub, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12.5px' }}>{sub.submittedAt || 'Today'}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#2563eb', fontSize: '13px' }}>{sub.formName}</td>
                    <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: '600', fontSize: '13px' }}>{sub.name || sub.firstName ? `${sub.firstName || ''} ${sub.lastName || ''}`.trim() : 'Anonymous'}</td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: '13px' }}>{sub.email || '-'}</td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: '13px' }}>{sub.phone || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* CREATE FOLDER MODAL */}
      {isFolderModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
          }}
        >
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
              {isRtl ? 'إنشاء مجلد جديد' : 'Create New Folder'}
            </h3>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder={isRtl ? 'اسم المجلد...' : 'Folder name...'}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13.5px',
                marginBottom: '16px',
                outline: 'none'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setIsFolderModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', padding: '8px 14px', cursor: 'pointer' }}
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleCreateFolder}
                style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 18px', fontWeight: '700', cursor: 'pointer' }}
              >
                {isRtl ? 'إنشاء' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
