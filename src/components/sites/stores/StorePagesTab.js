'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  ExternalLink, 
  MoreVertical, 
  Trash2, 
  Copy, 
  Edit3, 
  Eye, 
  Share2, 
  Settings, 
  Check, 
  Sparkles,
  ShoppingBag,
  ShoppingCart,
  CreditCard,
  CheckCircle,
  PhoneCall,
  Home,
  LayoutGrid
} from 'lucide-react';
import ElementRenderer from '../../builder/ElementRenderer';

export const PAGE_ICONS = {
  catalog: ShoppingBag,
  product_detail: LayoutGrid,
  cart: ShoppingCart,
  checkout: CreditCard,
  thankyou: CheckCircle,
  contact: PhoneCall,
  home: Home
};

export default function StorePagesTab({
  store,
  isRtl,
  onOpenBuilder,
  onOpenLivePage,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
  onUpdatePageName
}) {
  const [activeMenuPageId, setActiveMenuPageId] = useState(null);
  const [editingPageId, setEditingPageId] = useState(null);
  const [tempPageName, setTempPageName] = useState('');
  const [hoveredPageId, setHoveredPageId] = useState(null);

  const pages = store.pages || [];

  const handleStartRename = (page, e) => {
    e.stopPropagation();
    setEditingPageId(page.id);
    setTempPageName(isRtl ? (page.nameAr || page.name) : page.name);
    setActiveMenuPageId(null);
  };

  const handleSaveRename = (pageId) => {
    if (tempPageName.trim()) {
      onUpdatePageName(pageId, tempPageName.trim());
    }
    setEditingPageId(null);
  };

  return (
    <div style={{ animation: 'fadeIn 0.25s ease' }}>
      {/* Header bar with Add Page button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 4px', color: 'var(--t1)' }}>
            {isRtl ? 'صفحات المتجر الإلكتروني' : 'Store Pages'}
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--t2)' }}>
            {isRtl ? 'خصص وصمم صفحات متجرك مثل قائمة المنتجات، السلة، وإتمام الطلب' : 'Design and customize your store catalog, cart, checkout and thank you pages'}
          </p>
        </div>
        <button
          onClick={onAddPage}
          style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={16} />
          <span>{isRtl ? '+ إضافة صفحة جديدة' : '+ Add new page'}</span>
        </button>
      </div>

      {/* Pages Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        {pages.map((page, idx) => {
          const PageIcon = PAGE_ICONS[page.type] || LayoutGrid;
          const isMenuOpen = activeMenuPageId === page.id;
          const isHovered = hoveredPageId === page.id;
          const displayName = isRtl ? (page.nameAr || page.name) : page.name;

          return (
            <div
              key={page.id || idx}
              style={{
                background: 'var(--surface)',
                border: isHovered ? '1px solid #3b82f6' : '1px solid var(--edge)',
                borderRadius: '14px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: isHovered ? '0 12px 28px rgba(0, 0, 0, 0.12)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={() => setHoveredPageId(page.id)}
              onMouseLeave={() => {
                setHoveredPageId(null);
                if (activeMenuPageId === page.id) setActiveMenuPageId(null);
              }}
            >
              {/* Card Header: Title & Actions */}
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--edge)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--surface2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: 'rgba(37, 99, 235, 0.1)',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <PageIcon size={14} />
                  </div>
                  {editingPageId === page.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                      <input
                        type="text"
                        className="inp"
                        value={tempPageName}
                        onChange={(e) => setTempPageName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(page.id);
                          if (e.key === 'Escape') setEditingPageId(null);
                        }}
                        autoFocus
                        style={{ fontSize: '13px', padding: '4px 8px', width: '100%' }}
                      />
                      <button
                        onClick={() => handleSaveRename(page.id)}
                        style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 6px', cursor: 'pointer' }}
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '700',
                      color: 'var(--t1)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {displayName}
                    </span>
                  )}
                </div>

                <div style={{ position: 'relative' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuPageId(isMenuOpen ? null : page.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--t2)',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px'
                    }}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      [isRtl ? 'left' : 'right']: 0,
                      background: 'var(--surface)',
                      border: '1px solid var(--edge)',
                      borderRadius: '8px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                      zIndex: 100,
                      minWidth: '150px',
                      padding: '4px 0',
                      marginTop: '4px'
                    }}>
                      <button
                        onClick={() => {
                          setActiveMenuPageId(null);
                          onOpenBuilder(idx);
                        }}
                        style={{
                          width: '100%',
                          textAlign: isRtl ? 'right' : 'left',
                          background: 'none',
                          border: 'none',
                          padding: '8px 14px',
                          fontSize: '12.5px',
                          color: 'var(--t1)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <Edit3 size={14} />
                        <span>{isRtl ? 'تعديل في المحرر' : 'Edit in Builder'}</span>
                      </button>
                      <button
                        onClick={(e) => handleStartRename(page, e)}
                        style={{
                          width: '100%',
                          textAlign: isRtl ? 'right' : 'left',
                          background: 'none',
                          border: 'none',
                          padding: '8px 14px',
                          fontSize: '12.5px',
                          color: 'var(--t1)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <Settings size={14} />
                        <span>{isRtl ? 'إعادة تسمية' : 'Rename Page'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveMenuPageId(null);
                          onDuplicatePage(idx);
                        }}
                        style={{
                          width: '100%',
                          textAlign: isRtl ? 'right' : 'left',
                          background: 'none',
                          border: 'none',
                          padding: '8px 14px',
                          fontSize: '12.5px',
                          color: 'var(--t1)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <Copy size={14} />
                        <span>{isRtl ? 'تكرار الصفحة' : 'Duplicate Page'}</span>
                      </button>
                      <div style={{ height: '1px', background: 'var(--edge)', margin: '4px 0' }} />
                      <button
                        onClick={() => {
                          setActiveMenuPageId(null);
                          onDeletePage(idx);
                        }}
                        style={{
                          width: '100%',
                          textAlign: isRtl ? 'right' : 'left',
                          background: 'none',
                          border: 'none',
                          padding: '8px 14px',
                          fontSize: '12.5px',
                          color: '#dc2626',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <Trash2 size={14} />
                        <span>{isRtl ? 'حذف الصفحة' : 'Delete Page'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Preview / Wireframe Screen */}
              <div
                onClick={() => onOpenBuilder(idx)}
                style={{
                  height: '165px',
                  background: '#f8fafc',
                  borderBottom: '1px solid var(--edge)',
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {page.thumbnail ? (
                  <img
                    src={page.thumbnail}
                    alt={page.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      filter: isHovered ? 'brightness(0.9)' : 'brightness(0.96)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ) : (
                  <div style={{
                    transform: 'scale(0.35)',
                    transformOrigin: 'top center',
                    width: '280%',
                    marginLeft: '-90%',
                    pointerEvents: 'none',
                    padding: '20px'
                  }}>
                    {(page.canvas || []).slice(0, 3).map((el) => (
                      <div key={el.id} style={{ marginBottom: 12 }}>
                        <ElementRenderer el={el} interactive={false} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Hover overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: isHovered ? 'rgba(15, 23, 42, 0.45)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  opacity: isHovered ? 1 : 0
                }}>
                  <span style={{
                    background: '#2563eb',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}>
                    <Edit3 size={14} />
                    <span>{isRtl ? 'فتح المحرر' : 'Open Builder'}</span>
                  </span>
                </div>
              </div>

              {/* Card Footer: Action Buttons */}
              <div style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    onClick={() => onOpenBuilder(idx)}
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '7px 16px',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
                  >
                    <span>{isRtl ? 'تعديل' : 'Edit'}</span>
                  </button>
                  <button
                    onClick={() => onOpenLivePage(idx, false)}
                    title={isRtl ? 'معاينة المسودة' : 'Preview Draft'}
                    style={{
                      background: 'var(--surface2)',
                      border: '1px solid var(--edge)',
                      color: 'var(--t1)',
                      borderRadius: '6px',
                      padding: '7px 10px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Eye size={14} />
                  </button>
                </div>

                <button
                  onClick={() => onOpenLivePage(idx, true)}
                  title={isRtl ? 'فتح الرابط المباشر' : 'Open Live Page'}
                  style={{
                    background: 'none',
                    border: '1px solid var(--edge)',
                    borderRadius: '6px',
                    padding: '7px 10px',
                    color: 'var(--t2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#2563eb';
                    e.currentTarget.style.borderColor = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--t2)';
                    e.currentTarget.style.borderColor = 'var(--edge)';
                  }}
                >
                  <ExternalLink size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
