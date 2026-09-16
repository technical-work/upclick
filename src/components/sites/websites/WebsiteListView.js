'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Clock, 
  List, 
  LayoutGrid, 
  Folder, 
  Globe, 
  Copy, 
  Trash2, 
  Settings, 
  ExternalLink,
  ChevronDown,
  Layers,
  FolderPlus,
  X
} from 'lucide-react';

export default function WebsiteListView({
  websites = [],
  isRtl,
  onSelectWebsite,
  onOpenCreateModal,
  onDuplicateWebsite,
  onDeleteWebsite
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [websiteToDelete, setWebsiteToDelete] = useState(null);

  const filteredWebsites = useMemo(() => {
    return websites.filter((w) => {
      const q = (searchQuery || '').toLowerCase();
      return !q || (w.name && w.name.toLowerCase().includes(q));
    });
  }, [websites, searchQuery]);

  const totalRows = filteredWebsites.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
  const displayedWebsites = filteredWebsites.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div style={{
      padding: '0 24px 40px',
      direction: isRtl ? 'rtl' : 'ltr',
      color: 'var(--t1)'
    }}>
      <style>{`
        .ghl-websites-table {
          width: 100%;
          border-collapse: collapse;
          text-align: ${isRtl ? 'right' : 'left'};
          font-size: 13.5px;
        }
        .ghl-websites-table th {
          padding: 12px 16px;
          border-bottom: 1px solid var(--edge);
          color: var(--t2);
          font-weight: 600;
          font-size: 12.5px;
          background: rgba(255, 255, 255, 0.02);
        }
        .ghl-websites-table td {
          padding: 14px 16px;
          border-bottom: 1px solid var(--edge);
          color: var(--t1);
        }
        .ghl-websites-row {
          transition: background 0.15s ease;
          cursor: pointer;
        }
        .ghl-websites-row:hover {
          background: rgba(255, 255, 255, 0.035);
        }
        .ghl-action-btn {
          background: none;
          border: none;
          color: var(--t2);
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .ghl-action-btn:hover {
          background: var(--surface2);
          color: var(--t1);
        }
      `}</style>

      {/* Top Header Section Matching Screenshot 1 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: '700',
            margin: '0 0 6px 0',
            color: 'var(--t1)',
            letterSpacing: '-0.3px'
          }}>
            {isRtl ? 'المواقع الإلكترونية' : 'Websites'}
          </h1>
          <p style={{
            fontSize: '13.5px',
            color: 'var(--t2)',
            margin: 0
          }}>
            {isRtl
              ? 'أنشئ وأدر مواقع إلكترونية متكاملة لعرض منتجاتك وخدماتك وبناء علامتك التجارية.'
              : 'Build websites to showcase your products and build a trusted brand.'
            }
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => onOpenCreateModal(true)}
            className="ghl-action-btn"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--edge)',
              padding: '8px 12px',
              borderRadius: '8px',
              color: 'var(--t2)'
            }}
            title={isRtl ? 'قوالب المواقع' : 'Website Templates'}
          >
            <FolderPlus size={18} />
          </button>

          <button
            onClick={() => onOpenCreateModal(false)}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
              transition: 'background 0.2s'
            }}
          >
            <Plus size={16} />
            <span>{isRtl ? 'موقع جديد' : 'New website'}</span>
          </button>
        </div>
      </div>

      {/* Main Container Card */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--edge)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}>

        {/* Toolbar: Breadcrumbs on Left, View & Search on Right */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--edge)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'rgba(255, 255, 255, 0.015)'
        }}>
          {/* Breadcrumb Folder Icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--t2)' }}>
            <div style={{
              background: 'var(--surface2)',
              border: '1px solid var(--edge)',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Folder size={15} />
            </div>
          </div>

          {/* Search and View Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className="ghl-action-btn"
              style={{ padding: '6px 8px' }}
              title={isRtl ? 'الأحدث' : 'Recent'}
            >
              <Clock size={16} />
            </button>

            <div style={{
              display: 'flex',
              background: 'var(--surface2)',
              border: '1px solid var(--edge)',
              borderRadius: '6px',
              padding: '2px'
            }}>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  background: viewMode === 'list' ? 'var(--surface)' : 'transparent',
                  border: 'none',
                  color: viewMode === 'list' ? 'var(--t1)' : 'var(--t3)',
                  padding: '4px 6px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <List size={15} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  background: viewMode === 'grid' ? 'var(--surface)' : 'transparent',
                  border: 'none',
                  color: viewMode === 'grid' ? 'var(--t1)' : 'var(--t3)',
                  padding: '4px 6px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <LayoutGrid size={15} />
              </button>
            </div>

            {/* Search Input Box */}
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  [isRtl ? 'right' : 'left']: '10px',
                  color: 'var(--t3)',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'بحث عن المواقع الإلكترونية...' : 'Search for websites'}
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--edge)',
                  borderRadius: '6px',
                  padding: isRtl ? '6px 32px 6px 12px' : '6px 12px 6px 32px',
                  fontSize: '13px',
                  color: 'var(--t1)',
                  outline: 'none',
                  width: '200px'
                }}
              />
            </div>
          </div>
        </div>

        {/* Websites List / Grid View */}
        {displayedWebsites.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--t2)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(37, 99, 235, 0.1)',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Globe size={26} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 6px 0', color: 'var(--t1)' }}>
              {searchQuery ? (isRtl ? 'لم يتم العثور على نتائج' : 'No matching websites') : (isRtl ? 'لا توجد مواقع إلكترونية بعد' : 'No websites created yet')}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--t3)', margin: '0 0 20px 0' }}>
              {isRtl ? 'ابدأ الآن بإنشاء أول موقع إلكتروني لك من الصفر أو من القوالب الجاهزة.' : 'Start by creating your first website from blank or prebuilt templates.'}
            </p>
            <button
              onClick={() => onOpenCreateModal(false)}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 18px',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={16} />
              <span>{isRtl ? 'إنشاء موقع جديد' : 'Create new website'}</span>
            </button>
          </div>
        ) : viewMode === 'list' ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="ghl-websites-table">
              <thead>
                <tr>
                  <th style={{ width: '45%' }}>{isRtl ? 'الاسم' : 'Name'}</th>
                  <th style={{ width: '25%' }}>{isRtl ? 'آخر تحديث' : 'Last updated'}</th>
                  <th style={{ width: '20%' }}>{isRtl ? 'صفحات الموقع' : 'Website pages'}</th>
                  <th style={{ width: '10%', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {displayedWebsites.map((site) => {
                  const pagesCount = site.pages?.length || 1;
                  return (
                    <tr
                      key={site.id}
                      className="ghl-websites-row"
                      onClick={() => onSelectWebsite(site)}
                    >
                      <td style={{ fontWeight: '600', color: 'var(--t1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            background: 'rgba(37, 99, 235, 0.08)',
                            color: '#2563eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Globe size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: '600' }}>{site.name}</div>
                            {site.domain && (
                              <div style={{ fontSize: '11px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <span>🔗 {site.domain}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--t2)', fontSize: '12.5px' }}>
                        {site.lastUpdated || '—'}
                      </td>
                      <td style={{ color: 'var(--t2)', fontSize: '12.5px' }}>
                        <span style={{
                          background: 'var(--surface2)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid var(--edge)',
                          fontSize: '12px'
                        }}>
                          {pagesCount} {pagesCount === 1 ? (isRtl ? 'صفحة' : 'Page') : (isRtl ? 'صفحات' : 'Pages')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === site.id ? null : site.id)}
                          className="ghl-action-btn"
                          style={{ margin: '0 auto' }}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === site.id && (
                          <div style={{
                            position: 'absolute',
                            [isRtl ? 'left' : 'right']: '16px',
                            top: '38px',
                            background: 'var(--surface)',
                            border: '1px solid var(--edge2)',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
                            zIndex: 100,
                            minWidth: '150px',
                            padding: '4px',
                            textAlign: isRtl ? 'right' : 'left'
                          }}>
                            <button
                              onClick={() => {
                                onSelectWebsite(site);
                                setActiveMenuId(null);
                              }}
                              style={{
                                width: '100%',
                                background: 'none',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                color: 'var(--t1)',
                                fontSize: '12.5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer'
                              }}
                              className="ghl-menu-item"
                            >
                              <Globe size={14} />
                              <span>{isRtl ? 'فتح وتعديل' : 'Edit Website'}</span>
                            </button>

                            <button
                              onClick={() => {
                                onDuplicateWebsite(site.id);
                                setActiveMenuId(null);
                              }}
                              style={{
                                width: '100%',
                                background: 'none',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                color: 'var(--t1)',
                                fontSize: '12.5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer'
                              }}
                              className="ghl-menu-item"
                            >
                              <Copy size={14} />
                              <span>{isRtl ? 'تكرار / نسخ' : 'Duplicate'}</span>
                            </button>

                            <button
                              onClick={() => {
                                setWebsiteToDelete(site);
                                setActiveMenuId(null);
                              }}
                              style={{
                                width: '100%',
                                background: 'none',
                                border: 'none',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                color: 'var(--red)',
                                fontSize: '12.5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer'
                              }}
                              className="ghl-menu-item"
                            >
                              <Trash2 size={14} />
                              <span>{isRtl ? 'حذف الموقع' : 'Delete'}</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
            padding: '16px'
          }}>
            {displayedWebsites.map((site) => (
              <div
                key={site.id}
                onClick={() => onSelectWebsite(site)}
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--edge)',
                  borderRadius: '10px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'rgba(37, 99, 235, 0.1)',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Globe size={18} />
                    </div>
                    <span style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--edge)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      color: 'var(--t2)'
                    }}>
                      {site.pages?.length || 1} {isRtl ? 'صفحات' : 'Pages'}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '700', color: 'var(--t1)' }}>
                    {site.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--t3)' }}>
                    {isRtl ? 'آخر تحديث: ' : 'Updated: '} {site.lastUpdated || '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Pagination Bar (Matching Screenshot 1) */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--edge)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '16px',
          fontSize: '12.5px',
          color: 'var(--t2)',
          background: 'rgba(255, 255, 255, 0.01)'
        }}>
          <div>
            <span>{isRtl ? 'عدد الصفوف لكل صفحة: ' : 'Rows per page: '}</span>
            <span style={{ fontWeight: '700', color: 'var(--t1)' }}>{rowsPerPage}</span>
          </div>

          <div>
            {totalRows > 0 ? `1 - ${totalRows} of ${totalRows}` : '0 - 0 of 0'}
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--edge)',
                color: currentPage <= 1 ? 'var(--t3)' : 'var(--t1)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
              }}
            >
              {isRtl ? 'السابق' : 'Previous'}
            </button>
            <span style={{
              background: '#2563eb',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700'
            }}>
              {currentPage}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--edge)',
                color: currentPage >= totalPages ? 'var(--t3)' : 'var(--t1)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              {isRtl ? 'التالي' : 'Next'}
            </button>
          </div>
        </div>

      </div>

      {/* Delete Website Confirmation Modal */}
      {websiteToDelete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '20px',
          direction: isRtl ? 'rtl' : 'ltr'
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--edge2)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '460px',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            color: 'var(--t1)',
            position: 'relative',
            animation: 'scaleUp 0.2s ease'
          }}>
            {/* Close icon */}
            <button
              onClick={() => setWebsiteToDelete(null)}
              style={{
                position: 'absolute',
                top: '18px',
                [isRtl ? 'left' : 'right']: '18px',
                background: 'none',
                border: 'none',
                color: 'var(--t3)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={18} />
            </button>

            {/* Red Danger Warning Icon */}
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Trash2 size={26} />
            </div>

            {/* Modal Title */}
            <h3 style={{
              fontSize: '18px',
              fontWeight: '800',
              margin: '0 0 8px 0',
              color: 'var(--t1)',
              letterSpacing: '-0.2px'
            }}>
              {isRtl ? 'هل أنت متأكد من حذف هذا الموقع؟' : 'Delete this website?'}
            </h3>

            {/* Explanation Note */}
            <p style={{
              fontSize: '13.5px',
              color: 'var(--t2)',
              lineHeight: '1.5',
              margin: '0 0 16px 0'
            }}>
              {isRtl
                ? 'سيتم حذف هذا الموقع وجميع صفحاته ومحتواه بشكل نهائي. لن تتمكن من التراجع أو استرجاع الموقع بعد الحذف.'
                : 'This website and all of its pages and data will be permanently removed. This action cannot be undone.'
              }
            </p>

            {/* Target Website Info Box */}
            <div style={{
              background: 'var(--surface2)',
              border: '1px solid var(--edge)',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '22px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Globe size={18} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {websiteToDelete.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--t3)' }}>
                  {websiteToDelete.pages?.length || 1} {isRtl ? 'صفحات' : 'Pages'}
                  {websiteToDelete.domain ? ` • ${websiteToDelete.domain}` : ''}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setWebsiteToDelete(null)}
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--edge)',
                  color: 'var(--t1)',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  onDeleteWebsite(websiteToDelete.id);
                  setWebsiteToDelete(null);
                }}
                style={{
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.35)',
                  transition: 'opacity 0.15s'
                }}
              >
                <Trash2 size={15} />
                <span>{isRtl ? 'نعم، احذف الموقع' : 'Delete Website'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
