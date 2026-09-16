'use client';

import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  ArrowRight,
  Plus, 
  Sparkles, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Copy, 
  ExternalLink, 
  Check, 
  ChevronDown, 
  FileText, 
  Layers, 
  Eye, 
  Clock, 
  Download, 
  Upload, 
  Rss,
  Share2,
  Calendar,
  Tag,
  User,
  Settings,
  Layout
} from 'lucide-react';

export default function BlogSiteDetailView({
  blogSite,
  isRtl = false,
  onBack,
  onOpenEditSite,
  onCreateNewPost,
  onOpenAiPostCreator,
  onEditPost,
  onOpenTextEditor,
  onOpenBuilderForPost,
  onDeletePost,
  onDuplicatePost,
  onPublishPost,
  onPreviewPost,
  onPreviewLiveBlog,
  showToast
}) {
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'imported' | 'csv'
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewPostDropdownOpen, setIsNewPostDropdownOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState([]);
  const [activeMenuPostId, setActiveMenuPostId] = useState(null);

  // Filter states
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const posts = blogSite?.posts || [];

  // Filter posts based on category, status, and search query
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const q = (searchQuery || '').toLowerCase().trim();
      if (q) {
        const title = (post.title || '').toLowerCase();
        const excerpt = (post.excerpt || '').toLowerCase();
        const author = (post.author || '').toLowerCase();
        const cat = (post.category || '').toLowerCase();
        if (!title.includes(q) && !excerpt.includes(q) && !author.includes(q) && !cat.includes(q)) return false;
      }
      if (filterCategory !== 'all' && post.category !== filterCategory) return false;
      if (filterStatus !== 'all' && post.status !== filterStatus) return false;
      return true;
    });
  }, [posts, searchQuery, filterCategory, filterStatus]);

  // Categories list
  const categories = blogSite?.categories || ['Marketing', 'Technology', 'Business', 'SEO', 'Updates'];

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedPostIds(filteredPosts.map(p => p.id));
    } else {
      setSelectedPostIds([]);
    }
  };

  const handleSelectPost = (postId) => {
    if (selectedPostIds.includes(postId)) {
      setSelectedPostIds(selectedPostIds.filter(id => id !== postId));
    } else {
      setSelectedPostIds([...selectedPostIds, postId]);
    }
  };

  return (
    <div style={{
      padding: '0 24px 80px',
      direction: isRtl ? 'rtl' : 'ltr',
      color: 'var(--t1)'
    }}>
      
      {/* Top Header Section matching Screenshot 3 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}>
        
        {/* Left: Back & Blog Site Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={onBack}
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
            {isRtl ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
          </button>
          
          <div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '800',
              color: 'var(--t1)',
              margin: 0
            }}>
              {blogSite?.name || 'My Blog Site'}
            </h1>
            <div style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '2px' }}>
              /{blogSite?.slug || 'blog'} · {posts.length} {isRtl ? 'مقال مسجل' : 'posts total'}
            </div>
          </div>
        </div>

        {/* Right Action Buttons matching Screenshot 3 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Live Blog URL Open & Copy Button */}
          <button
            type="button"
            onClick={() => {
              const origin = typeof window !== 'undefined' ? window.location.origin : '';
              const liveUrl = blogSite?.domain 
                ? `https://${blogSite.domain}` 
                : `${origin}/s/${encodeURIComponent(blogSite?.id || '')}`;
              navigator.clipboard.writeText(liveUrl);
              if (showToast) showToast(isRtl ? 'تم نسخ رابط المدونة المباشر 🔗' : 'Live blog link copied 🔗');
              window.open(liveUrl, '_blank');
            }}
            style={{
              background: 'rgba(37, 99, 235, 0.1)',
              border: '1px solid rgba(37, 99, 235, 0.3)',
              color: '#2563eb',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            title={isRtl ? 'فتح رابط المدونة المباشر في نافذة جديدة' : 'Open live blog link'}
          >
            <ExternalLink size={15} />
            <span>{blogSite?.domain || (isRtl ? 'رابط المدونة المباشر 🔗' : 'Live Blog 🔗')}</span>
          </button>

          {/* + Edit blog site button */}
          <button
            type="button"
            onClick={onOpenEditSite}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--edge2)',
              color: 'var(--t1)',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Edit3 size={15} />
            <span>{isRtl ? 'تعديل موقع المدونة' : 'Edit blog site'}</span>
          </button>

          {/* ✨ Create post with AI button */}
          <button
            type="button"
            onClick={onOpenAiPostCreator}
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15))',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              color: '#8b5cf6',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <Sparkles size={15} color="#8b5cf6" />
            <span>{isRtl ? 'إنشاء مقال بالذكاء الاصطناعي' : 'Create post with AI'}</span>
          </button>

          {/* + New post primary button with dropdown */}
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'inline-flex',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
            }}>
              <button
                type="button"
                onClick={onCreateNewPost}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={15} />
                <span>{isRtl ? 'مقال جديد' : 'New post'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsNewPostDropdownOpen(!isNewPostDropdownOpen)}
                style={{
                  background: '#1d4ed8',
                  color: '#ffffff',
                  border: 'none',
                  borderLeft: '1px solid rgba(255,255,255,0.2)',
                  padding: '8px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ChevronDown size={14} />
              </button>
            </div>

            {/* Dropdown Options */}
            {isNewPostDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  [isRtl ? 'left' : 'right']: 0,
                  marginTop: '6px',
                  background: 'var(--surface)',
                  border: '1px solid var(--edge2)',
                  borderRadius: '10px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  minWidth: '180px',
                  zIndex: 100,
                  overflow: 'hidden'
                }}
              >
                <button
                  type="button"
                  onClick={() => { setIsNewPostDropdownOpen(false); onCreateNewPost(); }}
                  style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: isRtl ? 'right' : 'left', color: 'var(--t1)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Plus size={14} color="#2563eb" />
                  <span>{isRtl ? 'مقال فارغ جديد' : 'Blank post'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setIsNewPostDropdownOpen(false); onOpenAiPostCreator(); }}
                  style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: isRtl ? 'right' : 'left', color: 'var(--t1)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--edge2)' }}
                >
                  <Sparkles size={14} color="#8b5cf6" />
                  <span>{isRtl ? 'كتابة مقال بالذكاء الاصطناعي' : 'Generate with AI'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { 
                    setIsNewPostDropdownOpen(false);
                    if (showToast) showToast(isRtl ? 'اختر ملف CSV لاستيراد المقالات' : 'Select CSV file to import posts');
                  }}
                  style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: isRtl ? 'right' : 'left', color: 'var(--t1)', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--edge2)' }}
                >
                  <Upload size={14} color="#16a34a" />
                  <span>{isRtl ? 'استيراد من CSV' : 'Import from CSV'}</span>
                </button>
              </div>
            )}
          </div>

          {/* More Options Menu ⋮ */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--edge2)',
                color: 'var(--t2)',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <MoreVertical size={16} />
            </button>

            {isMoreMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  [isRtl ? 'left' : 'right']: 0,
                  marginTop: '6px',
                  background: 'var(--surface)',
                  border: '1px solid var(--edge2)',
                  borderRadius: '10px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  minWidth: '200px',
                  zIndex: 100,
                  overflow: 'hidden'
                }}
              >
                <button
                  type="button"
                  onClick={() => { setIsMoreMenuOpen(false); onPreviewLiveBlog(blogSite); }}
                  style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: isRtl ? 'right' : 'left', color: 'var(--t1)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <ExternalLink size={14} color="#2563eb" />
                  <span>{isRtl ? 'معاينة المدونة الحية' : 'View live blog'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { 
                    setIsMoreMenuOpen(false); 
                    navigator.clipboard.writeText(`<iframe src="https://app.upklick.com/blog/${blogSite.slug}" width="100%" height="800"></iframe>`);
                    if (showToast) showToast(isRtl ? 'تم نسخ كود التضمين للموقع' : 'Embed code copied');
                  }}
                  style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: isRtl ? 'right' : 'left', color: 'var(--t1)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--edge2)' }}
                >
                  <Copy size={14} />
                  <span>{isRtl ? 'نسخ كود التضمين (Embed)' : 'Get embed code'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => { 
                    setIsMoreMenuOpen(false);
                    if (showToast) showToast(isRtl ? `رابط RSS: https://app.upklick.com/blog/${blogSite.slug}/feed.xml` : 'RSS feed URL ready');
                  }}
                  style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: isRtl ? 'right' : 'left', color: 'var(--t1)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--edge2)' }}
                >
                  <Rss size={14} color="#f97316" />
                  <span>{isRtl ? 'تغذية RSS' : 'RSS Feed'}</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 3 Detail Tabs matching Screenshot 3 */}
      <div style={{
        display: 'flex',
        gap: '24px',
        borderBottom: '1px solid var(--edge2)',
        marginBottom: '20px'
      }}>
        {[
          { key: 'posts', label: isRtl ? 'مقالات المدونة' : 'Blog posts' },
          { key: 'imported', label: isRtl ? 'المحتوى المستورد' : 'Imported content' },
          { key: 'csv', label: isRtl ? 'ملفات CSV' : 'CSV imports' }
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #2563eb' : '2px solid transparent',
              color: activeTab === tab.key ? '#2563eb' : 'var(--t2)',
              padding: '10px 4px',
              fontWeight: activeTab === tab.key ? '700' : '500',
              fontSize: '13.5px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Tab Content */}
      {activeTab === 'posts' && (
        <div>
          
          {/* Filter & Search Bar matching Screenshot 3 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '16px'
          }}>
            
            {/* Left: + Add filter button & Active Filters */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--edge2)',
                  color: 'var(--t1)',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={14} color="#2563eb" />
                <span>{isRtl ? 'إضافة فلتر' : 'Add filter'}</span>
              </button>

              {/* Filter Dropdown Popover */}
              {isFilterDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    [isRtl ? 'right' : 'left']: 0,
                    marginTop: '6px',
                    background: 'var(--surface)',
                    border: '1px solid var(--edge2)',
                    borderRadius: '10px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    padding: '14px',
                    minWidth: '240px',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--t2)', marginBottom: '4px' }}>
                      {isRtl ? 'التصنيف (Category)' : 'Category'}
                    </label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--edge)', background: 'var(--surface2)', color: 'var(--t1)', fontSize: '12.5px' }}
                    >
                      <option value="all">{isRtl ? 'جميع التصنيفات' : 'All categories'}</option>
                      {categories.map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--t2)', marginBottom: '4px' }}>
                      {isRtl ? 'الحالة (Status)' : 'Status'}
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--edge)', background: 'var(--surface2)', color: 'var(--t1)', fontSize: '12.5px' }}
                    >
                      <option value="all">{isRtl ? 'جميع الحالات' : 'All status'}</option>
                      <option value="published">{isRtl ? 'منشور (Published)' : 'Published'}</option>
                      <option value="draft">{isRtl ? 'مسودة (Draft)' : 'Draft'}</option>
                      <option value="scheduled">{isRtl ? 'مجدول (Scheduled)' : 'Scheduled'}</option>
                    </select>
                  </div>

                  {(filterCategory !== 'all' || filterStatus !== 'all') && (
                    <button
                      type="button"
                      onClick={() => { setFilterCategory('all'); setFilterStatus('all'); setIsFilterDropdownOpen(false); }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: '700', cursor: 'pointer', textAlign: 'center', marginTop: '4px' }}
                    >
                      {isRtl ? 'إعادة ضبط الفلاتر' : 'Reset filters'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right: Search Box */}
            <div style={{ position: 'relative', width: '260px' }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  [isRtl ? 'right' : 'left']: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--t3)',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'بحث في المقالات...' : 'Search'}
                style={{
                  width: '100%',
                  background: 'var(--surface)',
                  border: '1px solid var(--edge2)',
                  borderRadius: '8px',
                  padding: isRtl ? '7px 32px 7px 10px' : '7px 10px 7px 32px',
                  fontSize: '13px',
                  color: 'var(--t1)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

          </div>

          {/* Blog Posts Table Card matching Screenshot 3 */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--edge2)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}>
            
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: isRtl ? 'right' : 'left',
              fontSize: '13.5px'
            }}>
              <thead>
                <tr style={{
                  background: 'var(--surface2)',
                  borderBottom: '1px solid var(--edge2)',
                  color: 'var(--t2)',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  <th style={{ padding: '12px 16px', width: '40px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedPostIds.length > 0 && selectedPostIds.length === filteredPosts.length}
                      onChange={handleSelectAll}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th style={{ padding: '12px 16px' }}>{isRtl ? 'المقال (Blog post)' : 'Blog post'}</th>
                  <th style={{ padding: '12px 16px' }}>{isRtl ? 'آخر تحديث' : 'Last updated'}</th>
                  <th style={{ padding: '12px 16px' }}>{isRtl ? 'الكاتب' : 'Updated by'}</th>
                  <th style={{ padding: '12px 16px' }}>{isRtl ? 'التصنيف' : 'Category'}</th>
                  <th style={{ padding: '12px 16px' }}>{isRtl ? 'الحالة' : 'Status'}</th>
                  <th style={{ padding: '12px 16px' }}>{isRtl ? 'النوع' : 'Type'}</th>
                  <th style={{ padding: '12px 16px', width: '50px', textAlign: 'center' }}>
                    <Settings size={14} color="var(--t3)" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.length === 0 ? (
                  /* Empty State matching Screenshot 3 precisely */
                  <tr>
                    <td colSpan={8} style={{ padding: '70px 20px', textAlign: 'center' }}>
                      
                      {/* Clean Card Mockup matching Screenshot 3 */}
                      <div style={{
                        width: '140px',
                        height: '96px',
                        border: '1.5px solid var(--edge)',
                        borderRadius: '10px',
                        background: 'var(--surface2)',
                        padding: '8px',
                        margin: '0 auto 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
                      }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                        </div>
                        <div style={{
                          height: '46px',
                          background: 'rgba(37, 99, 235, 0.08)',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#2563eb'
                        }}>
                          <FileText size={20} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div style={{ width: '60%', height: '4px', background: 'var(--edge)', borderRadius: '2px' }} />
                          <div style={{ width: '40%', height: '4px', background: 'var(--edge)', borderRadius: '2px' }} />
                        </div>
                      </div>

                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '800',
                        color: 'var(--t1)',
                        margin: '0 0 6px'
                      }}>
                        {searchQuery 
                          ? (isRtl ? 'لم يتم العثور على مقالات تطابق البحث' : 'No matching blog posts found') 
                          : (isRtl ? 'لا توجد مقالات بعد' : 'No blog posts')}
                      </h3>
                      
                      <p style={{
                        fontSize: '13px',
                        color: 'var(--t3)',
                        margin: '0 0 20px'
                      }}>
                        {isRtl ? 'ابدأ الآن بإنشاء أول مقال لمدونتك من الصفر أو باستخدام الذكاء الاصطناعي.' : 'Get started by creating a new post.'}
                      </p>

                      <button
                        type="button"
                        onClick={onCreateNewPost}
                        style={{
                          background: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 22px',
                          fontSize: '13.5px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
                        }}
                      >
                        <Plus size={16} />
                        <span>{isRtl ? '+ مقال جديد' : '+ New post'}</span>
                      </button>

                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post) => (
                    <tr
                      key={post.id}
                      onClick={() => onEditPost(post)}
                      style={{
                        borderBottom: '1px solid var(--edge2)',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface2)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedPostIds.includes(post.id)}
                          onChange={() => handleSelectPost(post.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: '700', color: 'var(--t1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '8px',
                            background: post.coverImage ? `url(${post.coverImage}) center/cover` : 'rgba(37, 99, 235, 0.1)',
                            border: '1px solid var(--edge2)',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#2563eb'
                          }}>
                            {!post.coverImage && <FileText size={18} />}
                          </div>
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--t1)', marginBottom: '2px' }}>
                              {post.title}
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--t3)', fontWeight: '500' }}>
                              /{post.slug || 'post'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', color: 'var(--t2)', fontSize: '12.5px' }}>
                        {post.lastUpdated || (isRtl ? 'اليوم' : 'Today')}
                      </td>

                      <td style={{ padding: '14px 16px', color: 'var(--t2)', fontSize: '12.5px' }}>
                        {post.author || 'Admin'}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          background: 'var(--surface2)',
                          border: '1px solid var(--edge)',
                          borderRadius: '6px',
                          padding: '2px 8px',
                          fontSize: '11.5px',
                          fontWeight: '600',
                          color: 'var(--t1)'
                        }}>
                          {post.category || 'General'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          fontSize: '11.5px',
                          fontWeight: '700',
                          padding: '3px 9px',
                          borderRadius: '10px',
                          background: post.status === 'published' ? 'rgba(22, 163, 74, 0.12)' : (post.status === 'scheduled' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(249, 115, 22, 0.12)'),
                          color: post.status === 'published' ? '#16a34a' : (post.status === 'scheduled' ? '#2563eb' : '#ea580c')
                        }}>
                          {post.status === 'published' 
                            ? (isRtl ? 'منشور' : 'Published') 
                            : (post.status === 'scheduled' ? (isRtl ? 'مجدول' : 'Scheduled') : (isRtl ? 'مسودة' : 'Draft'))}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          fontSize: '11.5px',
                          fontWeight: '600',
                          color: post.type === 'ai' ? '#8b5cf6' : 'var(--t2)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {post.type === 'ai' && <Sparkles size={12} />}
                          <span>{post.type === 'ai' ? 'AI' : 'Standard'}</span>
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ position: 'relative' }}>
                          <button
                            type="button"
                            onClick={() => setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--t3)',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '4px'
                            }}
                          >
                            <MoreVertical size={16} />
                          </button>

                          {activeMenuPostId === post.id && (
                            <div
                              style={{
                                position: 'absolute',
                                top: '100%',
                                [isRtl ? 'left' : 'right']: 0,
                                background: 'var(--surface)',
                                border: '1px solid var(--edge2)',
                                borderRadius: '8px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                minWidth: '150px',
                                zIndex: 50,
                                overflow: 'hidden'
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => { setActiveMenuPostId(null); onEditPost(post); }}
                                style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: isRtl ? 'right' : 'left', color: 'var(--t1)', fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                              >
                                <Edit3 size={14} />
                                <span>{isRtl ? 'تعديل المقال' : 'Edit post'}</span>
                              </button>
                              {onOpenBuilderForPost && (
                                <button
                                  type="button"
                                  onClick={() => { setActiveMenuPostId(null); onOpenBuilderForPost(post); }}
                                  style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: isRtl ? 'right' : 'left', color: '#7c3aed', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                  <Layout size={14} />
                                  <span>{isRtl ? 'تعديل في المنشئ 🎨' : 'Edit in Builder 🎨'}</span>
                                </button>
                              )}
                              {onOpenTextEditor && (
                                <button
                                  type="button"
                                  onClick={() => { setActiveMenuPostId(null); onOpenTextEditor(post); }}
                                  style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: isRtl ? 'right' : 'left', color: 'var(--t1)', fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                  <Sparkles size={14} color="#8b5cf6" />
                                  <span>{isRtl ? 'محرر الذكاء الاصطناعي ✍️' : 'AI Text Editor ✍️'}</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuPostId(null);
                                  const origin = typeof window !== 'undefined' ? window.location.origin : '';
                                  const postUrl = blogSite?.domain 
                                    ? `https://${blogSite.domain}/${post.slug || post.id}` 
                                    : `${origin}/s/${encodeURIComponent(blogSite?.id || '')}/${encodeURIComponent(post.slug || post.id)}`;
                                  navigator.clipboard.writeText(postUrl);
                                  if (showToast) showToast(isRtl ? 'تم نسخ رابط المقال الحي 🔗' : 'Live post link copied 🔗');
                                  window.open(postUrl, '_blank');
                                }}
                                style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: isRtl ? 'right' : 'left', color: '#2563eb', fontSize: '12.5px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                              >
                                <ExternalLink size={14} />
                                <span>{isRtl ? 'فتح الرابط الحي 🔗' : 'Open Live Link 🔗'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => { setActiveMenuPostId(null); onPreviewPost(post); }}
                                style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: isRtl ? 'right' : 'left', color: 'var(--t1)', fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                              >
                                <Eye size={14} />
                                <span>{isRtl ? 'معاينة المقال' : 'Preview'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => { setActiveMenuPostId(null); if (onDuplicatePost) onDuplicatePost(post); }}
                                style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: isRtl ? 'right' : 'left', color: 'var(--t1)', fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                              >
                                <Copy size={14} />
                                <span>{isRtl ? 'تكرار المقال' : 'Duplicate'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => { setActiveMenuPostId(null); if (onDeletePost) onDeletePost(post.id); }}
                                style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: isRtl ? 'right' : 'left', color: '#ef4444', fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--edge2)' }}
                              >
                                <Trash2 size={14} />
                                <span>{isRtl ? 'حذف المقال' : 'Delete'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

          </div>

        </div>
      )}

      {/* Imported Content Tab */}
      {activeTab === 'imported' && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--edge2)',
          borderRadius: '12px',
          padding: '40px 20px',
          textAlign: 'center'
        }}>
          <Rss size={36} color="#f97316" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 6px', color: 'var(--t1)' }}>
            {isRtl ? 'استيراد المقالات عبر RSS / WordPress' : 'Import Content via RSS or WordPress'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--t3)', maxWidth: '440px', margin: '0 auto 20px' }}>
            {isRtl ? 'قم بمزامنة المقالات تلقائياً من موقعك على WordPress أو أي رابط تغذية RSS مباشرة إلى مدونتك.' : 'Automatically sync blog posts from WordPress or any external RSS feed URL.'}
          </p>
          <div style={{ display: 'flex', gap: '10px', maxWidth: '460px', margin: '0 auto' }}>
            <input
              type="url"
              placeholder="https://myblog.com/feed"
              style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--edge)', background: 'var(--surface2)', color: 'var(--t1)', fontSize: '13px' }}
            />
            <button
              type="button"
              onClick={() => { if (showToast) showToast(isRtl ? 'تم ربط تغذية RSS بنجاح' : 'RSS feed synced successfully'); }}
              style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 18px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
            >
              {isRtl ? 'استيراد' : 'Import'}
            </button>
          </div>
        </div>
      )}

      {/* CSV Imports Tab */}
      {activeTab === 'csv' && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--edge2)',
          borderRadius: '12px',
          padding: '40px 20px',
          textAlign: 'center'
        }}>
          <Upload size={36} color="#2563eb" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 6px', color: 'var(--t1)' }}>
            {isRtl ? 'استيراد مقالات مجمعة عبر CSV' : 'Bulk CSV Posts Import'}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--t3)', maxWidth: '440px', margin: '0 auto 20px' }}>
            {isRtl ? 'ارفع ملف CSV يحتوي على العناوين والمحتوى والتصنيفات لنشر عشرات المقالات بنقرة واحدة.' : 'Upload a CSV file containing titles, content, authors, and categories to import posts in bulk.'}
          </p>
          <input type="file" accept=".csv" style={{ display: 'none' }} id="csvFileInput" onChange={() => { if (showToast) showToast(isRtl ? 'تم معالجة ملف CSV واستيراد المقالات' : 'CSV processed and posts imported'); }} />
          <label
            htmlFor="csvFileInput"
            style={{
              background: '#2563eb',
              color: '#fff',
              borderRadius: '8px',
              padding: '10px 22px',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Upload size={15} />
            <span>{isRtl ? 'اختيار ملف CSV' : 'Select CSV file'}</span>
          </label>
        </div>
      )}

    </div>
  );
}
