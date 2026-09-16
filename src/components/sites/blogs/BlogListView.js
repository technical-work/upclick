'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Settings, 
  Globe, 
  FileText, 
  Users, 
  Layers, 
  ChevronDown, 
  MoreVertical, 
  Info, 
  Trash2, 
  Copy, 
  ExternalLink, 
  Edit3, 
  Sparkles,
  Download,
  BookOpen
} from 'lucide-react';

export default function BlogListView({
  blogSites = [],
  isRtl = false,
  onSelectBlogSite,
  onOpenCreateBlogSite,
  onDuplicateBlogSite,
  onDeleteBlogSite,
  onOpenSettings,
  showToast
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Aggregated KPIs across all blog sites
  const totalPostsCount = useMemo(() => {
    return (blogSites || []).reduce((sum, site) => sum + (site.posts?.length || 0), 0);
  }, [blogSites]);

  const publishedSitesCount = useMemo(() => {
    return (blogSites || []).filter(s => s.status === 'active' || s.status === 'published' || s.published).length;
  }, [blogSites]);

  const visitorsPerWeek = useMemo(() => {
    return (blogSites || []).reduce((sum, site) => sum + (Number(site.weeklyVisitors) || Number(site.views) || 0), 0);
  }, [blogSites]);

  // Filter blog sites by search query
  const filteredSites = useMemo(() => {
    return (blogSites || []).filter(site => {
      const q = (searchQuery || '').toLowerCase().trim();
      if (!q) return true;
      const name = (site.name || '').toLowerCase();
      const desc = (site.description || '').toLowerCase();
      const slug = (site.slug || '').toLowerCase();
      return name.includes(q) || desc.includes(q) || slug.includes(q);
    });
  }, [blogSites, searchQuery]);

  return (
    <div style={{
      padding: '0 24px 60px',
      direction: isRtl ? 'rtl' : 'ltr',
      color: 'var(--t1)'
    }}>
      
      {/* Top Header Section matching Screenshot 1 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: '800',
            color: 'var(--t1)',
            margin: '0 0 4px'
          }}>
            {isRtl ? 'المدونات' : 'Blogs'}
          </h1>
          <p style={{
            color: 'var(--t2)',
            fontSize: '13.5px',
            margin: 0
          }}>
            {isRtl 
              ? 'إدارة ومتابعة جميع مواقع ومقالات المدونات التي أنشأتها لعملك.' 
              : 'Manage and oversee all blogs created by you for your business.'}
          </p>
        </div>

        {/* Right Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
          <button
            type="button"
            onClick={onOpenSettings}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--edge2)',
              color: 'var(--t2)',
              padding: '9px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            title={isRtl ? 'إعدادات المدونة' : 'Blog Settings'}
          >
            <Settings size={18} />
          </button>

          {/* + Create blog button with dropdown matching Screenshot 1 */}
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'inline-flex',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
            }}>
              <button
                type="button"
                onClick={onOpenCreateBlogSite}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 16px',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={16} />
                <span>{isRtl ? 'إنشاء مدونة' : 'Create blog'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
                style={{
                  background: '#1d4ed8',
                  color: '#ffffff',
                  border: 'none',
                  borderLeft: '1px solid rgba(255,255,255,0.2)',
                  padding: '9px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ChevronDown size={15} />
              </button>
            </div>

            {/* Create Dropdown Menu */}
            {isCreateDropdownOpen && (
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
                  minWidth: '190px',
                  zIndex: 100,
                  overflow: 'hidden',
                  animation: 'fadeIn 0.15s ease'
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateDropdownOpen(false);
                    onOpenCreateBlogSite();
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'none',
                    border: 'none',
                    textAlign: isRtl ? 'right' : 'left',
                    color: 'var(--t1)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <Plus size={15} color="#2563eb" />
                  <span>{isRtl ? 'إنشاء موقع مدونة جديد' : 'New blog site'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateDropdownOpen(false);
                    if (showToast) showToast(isRtl ? 'ميزة استيراد المدونات من WordPress متاحة' : 'WordPress & RSS import ready');
                    onOpenCreateBlogSite();
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'none',
                    border: 'none',
                    textAlign: isRtl ? 'right' : 'left',
                    color: 'var(--t1)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderTop: '1px solid var(--edge2)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                  <Download size={15} color="#8b5cf6" />
                  <span>{isRtl ? 'استيراد من WordPress / RSS' : 'Import from WordPress'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3 KPI Metric Cards matching Screenshot 1 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '18px',
        marginBottom: '28px'
      }}>
        
        {/* Card 1: Total blog posts */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--edge2)',
          borderRadius: '12px',
          padding: '22px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            background: 'var(--surface2)',
            border: '1px solid var(--edge)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--t2)'
          }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--t2)', marginBottom: '4px' }}>
              {isRtl ? 'إجمالي المقالات المنشورة' : 'Total blog posts'}
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--t1)', lineHeight: 1 }}>
              {totalPostsCount}
            </div>
          </div>
        </div>

        {/* Card 2: Published blog sites */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--edge2)',
          borderRadius: '12px',
          padding: '22px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            background: 'var(--surface2)',
            border: '1px solid var(--edge)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--t2)'
          }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--t2)', marginBottom: '4px' }}>
              {isRtl ? 'مواقع المدونات النشطة' : 'Published blog sites'}
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--t1)', lineHeight: 1 }}>
              {publishedSitesCount}
            </div>
          </div>
        </div>

        {/* Card 3: Visitors per week */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--edge2)',
          borderRadius: '12px',
          padding: '22px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            background: 'var(--surface2)',
            border: '1px solid var(--edge)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--t2)'
          }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--t2)', marginBottom: '4px' }}>
              {isRtl ? 'الزوار أسبوعياً' : 'Visitors per week'}
            </div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--t1)', lineHeight: 1 }}>
              {visitorsPerWeek}
            </div>
          </div>
        </div>

      </div>

      {/* Main Blog Sites Table Card matching Screenshot 1 */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--edge2)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}>
        
        {/* Table Search Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--edge2)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                [isRtl ? 'right' : 'left']: '12px',
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
              placeholder={isRtl ? 'بحث...' : 'Search'}
              style={{
                width: '100%',
                background: 'var(--surface2)',
                border: '1px solid var(--edge)',
                borderRadius: '8px',
                padding: isRtl ? '7px 34px 7px 12px' : '7px 12px 7px 34px',
                fontSize: '13px',
                color: 'var(--t1)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Table Content */}
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
              fontSize: '12.5px',
              fontWeight: '700'
            }}>
              <th style={{ padding: '14px 20px' }}>{isRtl ? 'موقع المدونة' : 'Blog site'}</th>
              <th style={{ padding: '14px 20px' }}>{isRtl ? 'الحالة' : 'Status'}</th>
              <th style={{ padding: '14px 20px' }}>{isRtl ? 'الوصف' : 'Description'}</th>
              <th style={{ padding: '14px 20px' }}>{isRtl ? 'آخر تحديث' : 'Last updated'}</th>
              <th style={{ padding: '14px 20px', width: '50px', textAlign: 'center' }}>
                <Settings size={14} color="var(--t3)" />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredSites.length === 0 ? (
              /* Empty State matching Screenshot 1 precisely */
              <tr>
                <td colSpan={5} style={{ padding: '70px 20px', textAlign: 'center' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <Info size={26} />
                  </div>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '800',
                    color: 'var(--t1)',
                    margin: '0 0 6px'
                  }}>
                    {searchQuery 
                      ? (isRtl ? 'لم يتم العثور على نتائج' : 'No matching blog sites')
                      : (isRtl ? 'لم يتم العثور على أي مواقع مدونات' : 'No blog sites found')}
                  </h3>
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--t3)',
                    margin: '0 0 20px'
                  }}>
                    {isRtl 
                      ? 'ابدأ بإنشاء موقع مدونة جديد لنشر مقالاتك وجذب الزوار.' 
                      : 'Get started by creating a new blog site.'}
                  </p>
                  <button
                    type="button"
                    onClick={onOpenCreateBlogSite}
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
                    <span>{isRtl ? '+ موقع مدونة جديد' : '+ New blog site'}</span>
                  </button>
                </td>
              </tr>
            ) : (
              filteredSites.map((site) => (
                <tr
                  key={site.id}
                  onClick={() => onSelectBlogSite(site)}
                  style={{
                    borderBottom: '1px solid var(--edge2)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--t1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        background: 'rgba(37, 99, 235, 0.1)',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '13px'
                      }}>
                        <BookOpen size={16} />
                      </div>
                      <div>
                        <div>{site.name}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--t3)', fontWeight: '500' }}>
                          /{site.slug || 'blog'} · {site.posts?.length || 0} {isRtl ? 'مقال' : 'posts'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      background: (site.status === 'active' || site.status === 'published' || site.published) ? 'rgba(22, 163, 74, 0.12)' : 'rgba(249, 115, 22, 0.12)',
                      color: (site.status === 'active' || site.status === 'published' || site.published) ? '#16a34a' : '#ea580c'
                    }}>
                      {(site.status === 'active' || site.status === 'published' || site.published) 
                        ? (isRtl ? 'نشط / منشور' : 'Active') 
                        : (isRtl ? 'مسودة' : 'Draft')}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--t2)', fontSize: '13px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {site.description || (isRtl ? 'لا يوجد وصف' : 'No description provided')}
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--t2)', fontSize: '13px' }}>
                    {site.lastUpdated || (isRtl ? 'اليوم' : 'Today')}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(activeMenuId === site.id ? null : site.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--t3)',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '6px'
                        }}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeMenuId === site.id && (
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
                            onClick={() => { setActiveMenuId(null); onSelectBlogSite(site); }}
                            style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: isRtl ? 'right' : 'left', color: 'var(--t1)', fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                          >
                            <Edit3 size={14} />
                            <span>{isRtl ? 'إدارة المقالات' : 'Manage posts'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setActiveMenuId(null); if (onDuplicateBlogSite) onDuplicateBlogSite(site); }}
                            style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: isRtl ? 'right' : 'left', color: 'var(--t1)', fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                          >
                            <Copy size={14} />
                            <span>{isRtl ? 'تكرار المدونة' : 'Duplicate'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setActiveMenuId(null); if (onDeleteBlogSite) onDeleteBlogSite(site.id); }}
                            style={{ width: '100%', padding: '8px 12px', background: 'none', border: 'none', textAlign: isRtl ? 'right' : 'left', color: '#ef4444', fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid var(--edge2)' }}
                          >
                            <Trash2 size={14} />
                            <span>{isRtl ? 'حذف المدونة' : 'Delete'}</span>
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
  );
}
