'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight,
  Info, 
  Globe, 
  Layers, 
  Sparkles, 
  Check, 
  ChevronDown,
  FolderOpen
} from 'lucide-react';

export default function CreateBlogSiteView({
  isRtl = false,
  onBack,
  onCreateBlogSite,
  initialData = null,
  connectedDomains = [],
  onOpenDomainSettings
}) {
  const [title, setTitle] = useState(initialData?.name || '');
  const [selectedDomain, setSelectedDomain] = useState(initialData?.domain || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [metaDescription, setMetaDescription] = useState(initialData?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto generate slug from title if user hasn't typed a custom slug
  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (!initialData && (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))) {
      const generatedSlug = val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const newBlogSite = {
      id: initialData?.id || `blogsite_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: title.trim(),
      slug: slug.trim() || 'blog',
      domain: selectedDomain || '',
      domainStatus: selectedDomain ? 'connected' : '',
      description: metaDescription.trim(),
      status: initialData?.status || 'active',
      published: true,
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      posts: initialData?.posts || [],
      categories: initialData?.categories || ['General', 'Marketing', 'News', 'Updates'],
      weeklyVisitors: initialData?.weeklyVisitors || 0,
      views: initialData?.views || 0
    };

    setTimeout(() => {
      onCreateBlogSite(newBlogSite);
      setIsSubmitting(false);
    }, 200);
  };

  return (
    <div style={{
      padding: '0 24px 80px',
      direction: isRtl ? 'rtl' : 'ltr',
      color: 'var(--t1)',
      maxWidth: '860px',
      margin: '0 auto'
    }}>
      
      {/* Top Back Header matching Screenshot 2 */}
      <div style={{ marginBottom: '24px' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#2563eb',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: 0
          }}
        >
          {isRtl ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          <span>{isRtl ? 'رجوع' : 'Back'}</span>
        </button>
      </div>

      {/* Main Setup Card matching Screenshot 2 */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--edge2)',
        borderRadius: '14px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        
        {/* Card Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '28px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--edge2)'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(37, 99, 235, 0.1)',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FolderOpen size={20} />
          </div>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '800',
            color: 'var(--t1)',
            margin: 0
          }}>
            {initialData ? (isRtl ? 'تعديل موقع المدونة' : 'Edit your blog site') : (isRtl ? 'إعداد موقع المدونة' : 'Setup your blog site')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
          
          {/* Field 1: Blog site title * with Info Tooltip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '220px 1fr',
            gap: '20px',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--t1)' }}>
                {isRtl ? 'عنوان موقع المدونة *' : 'Blog site title *'}
              </label>
              <span title={isRtl ? 'الاسم الرئيسي الذي سيظهر لزوار مدونتك' : 'The main public title of your blog site'}>
                <Info size={14} color="var(--t3)" style={{ cursor: 'help' }} />
              </span>
            </div>

            <div>
              <input
                type="text"
                required
                value={title}
                onChange={handleTitleChange}
                placeholder={isRtl ? 'عنوان المدونة (مثال: مدونة التقنية والأعمال)' : 'Blog title'}
                style={{
                  width: '100%',
                  background: 'var(--surface2)',
                  border: '1px solid var(--edge)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  fontSize: '13.5px',
                  color: 'var(--t1)',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--edge2)' }} />

          {/* Field 2: Domain and slug matching Screenshot 2 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '220px 1fr',
            gap: '20px',
            alignItems: 'flex-start'
          }}>
            <div>
              <label style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--t1)', display: 'block', marginBottom: '4px' }}>
                {isRtl ? 'الدومين والرابط المخصص' : 'Domain and slug'}
              </label>
              <div style={{ fontSize: '12px', color: 'var(--t3)' }}>
                {isRtl ? 'اختر النطاق والمسار التعريفي للمدونة' : 'Select custom domain and base slug'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                
                {/* Domain Selector */}
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--surface2)',
                      border: '1px solid var(--edge)',
                      borderRadius: '8px',
                      padding: '10px 30px 10px 12px',
                      fontSize: '13px',
                      color: 'var(--t1)',
                      outline: 'none',
                      appearance: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">{isRtl ? 'اختيار الدومين' : 'Select domain'}</option>
                    <option value="app.upklick.com">app.upklick.com (Default)</option>
                    {connectedDomains.map((d, idx) => (
                      <option key={idx} value={d.domain || d}>{d.domain || d}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', [isRtl ? 'left' : 'right']: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--t3)' }} />
                </div>

                {/* Slug Input */}
                <div>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder={isRtl ? 'مسار المدونة (مثال: blog)' : 'Add your blog slug'}
                    style={{
                      width: '100%',
                      background: 'var(--surface2)',
                      border: '1px solid var(--edge)',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: '13px',
                      color: 'var(--t1)',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

              </div>

              {/* Add/edit domain link button matching Screenshot 2 */}
              <button
                type="button"
                onClick={onOpenDomainSettings}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: 0,
                  width: 'fit-content'
                }}
              >
                <Globe size={14} />
                <span>{isRtl ? 'إضافة / تعديل الدومين' : 'Add/edit domain'}</span>
              </button>
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--edge2)' }} />

          {/* Field 3: Blog meta description with character count matching Screenshot 2 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '220px 1fr',
            gap: '20px',
            alignItems: 'flex-start'
          }}>
            <div>
              <label style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--t1)', display: 'block', marginBottom: '4px' }}>
                {isRtl ? 'الوصف التعريفي (Meta Description)' : 'Blog meta description'}
              </label>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--t3)', lineHeight: 1.4 }}>
                {isRtl 
                  ? 'الوصف التعريفي هو ملخص موجز يظهر في محركات البحث وشبكات التواصل.' 
                  : 'A blog meta description is a concise summary or snippet of your blog site.'}
              </p>
            </div>

            <div>
              <div style={{ position: 'relative' }}>
                <textarea
                  rows={4}
                  maxLength={160}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder={isRtl ? 'اكتب وصفاً جذاباً لمدونتك هنا...' : 'Type something...'}
                  style={{
                    width: '100%',
                    background: 'var(--surface2)',
                    border: '1px solid var(--edge)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '13.5px',
                    color: 'var(--t1)',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
                <div style={{
                  textAlign: isRtl ? 'left' : 'right',
                  fontSize: '11.5px',
                  color: 'var(--t3)',
                  marginTop: '4px'
                }}>
                  {metaDescription.length} / 100
                </div>
              </div>
            </div>
          </div>

          {/* Footer Submit Button matching Screenshot 2 */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            paddingTop: '16px',
            borderTop: '1px solid var(--edge2)'
          }}>
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              style={{
                background: !title.trim() ? '#93c5fd' : '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 24px',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: !title.trim() ? 'not-allowed' : 'pointer',
                boxShadow: !title.trim() ? 'none' : '0 2px 8px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              {isSubmitting 
                ? (isRtl ? 'جاري الحفظ...' : 'Saving...') 
                : initialData 
                  ? (isRtl ? 'حفظ التعديلات' : 'Update blog') 
                  : (isRtl ? 'إنشاء موقع المدونة' : 'Create blog')}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
