'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Store as StoreIcon, 
  ShoppingBag, 
  CheckCircle2, 
  ChevronRight, 
  Layers, 
  Sparkles, 
  LayoutGrid, 
  List, 
  Clock, 
  Copy, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  X, 
  ArrowRight,
  Phone,
  Check
} from 'lucide-react';
import { STORE_TEMPLATES_LIST, createLiveStore, pickTemplateFromNiche } from '@/data/storeTemplates';

export default function StoreListView({
  stores,
  isRtl,
  onSelectStore,
  onCreateStore,
  onDuplicateStore,
  onDeleteStore
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [openMenuStoreId, setOpenMenuStoreId] = useState(null);
  
  // Setup Banner state
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  // Create Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState('blank'); // 'blank' | 'template' | 'ai'
  const [newStoreName, setNewStoreName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(STORE_TEMPLATES_LIST[0]);
  const [aiNiche, setAiNiche] = useState('Luxury Home Decor & Furniture');

  // Filtered stores
  const filteredStores = (stores || []).filter(s => {
    const name = (s.name || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q);
  });

  const setupSteps = [
    { id: 1, label: isRtl ? 'إضافة منتجات لكتالوج المتجر' : 'Add your first products', done: true },
    { id: 2, label: isRtl ? 'تخصيص صفحات المتجر (السلة، الكتالوج، والدفع)' : 'Customize store pages (Cart, Catalog, Checkout)', done: false },
    { id: 3, label: isRtl ? 'تفعيل بوابات الدفع (Stripe, PayPal, الدفع عند الاستلام)' : 'Connect payment gateways (Stripe, PayPal, COD)', done: false },
    { id: 4, label: isRtl ? 'ضبط خيارات وأسعار الشحن' : 'Set up shipping rates & delivery zones', done: false },
    { id: 5, label: isRtl ? 'ربط دومين مخصص للمتجر' : 'Connect custom store domain', done: false },
    { id: 6, label: isRtl ? 'نشر المتجر واستقبال الطلبات' : 'Publish store & start accepting orders', done: false }
  ];

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const title = newStoreName.trim();
    const templateId = createType === 'blank'
      ? ''
      : (createType === 'ai' ? pickTemplateFromNiche(aiNiche) : selectedTemplate?.id);
    const newStore = createLiveStore({
      name: title,
      templateId,
      blank: createType === 'blank'
    });
    onCreateStore(newStore);
    setIsCreateModalOpen(false);
    setNewStoreName('');
  };

  return (
    <div style={{ padding: '0 24px', animation: 'fadeIn 0.25s ease' }}>
      
      {/* Title & Subtitle matching Screenshot 1 */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--t1)', margin: '0 0 4px' }}>
          {isRtl ? 'المتاجر الإلكترونية' : 'Stores'}
        </h1>
        <p style={{ color: 'var(--t2)', fontSize: '13.5px', margin: 0 }}>
          {isRtl
            ? 'أنشئ متجراً إلكترونياً احترافياً لعرض منتجاتك والبيع في جميع أنحاء العالم.'
            : 'Build an online store to showcase your products and sell across the globe.'
          }
        </p>
      </div>

      {/* 6-Step Quick Setup Guide Banner matching Screenshot 1 */}
      {!isBannerDismissed && (
        <div style={{
          background: 'rgba(37, 99, 235, 0.05)',
          border: '1px solid rgba(37, 99, 235, 0.2)',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(37, 99, 235, 0.12)',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <StoreIcon size={20} />
            </div>
            <div>
              <div style={{ fontWeight: '800', color: 'var(--t1)', fontSize: '14px' }}>
                {isRtl ? 'ابنِ متجرك وبِع عالمياً في 6 خطوات سهلة فقط!' : 'Build your store and sell globally in just 6 easy steps!'}
              </div>
              <div style={{ color: 'var(--t2)', fontSize: '12.5px', marginTop: '2px' }}>
                {isRtl ? 'استخدم هذا الدليل المخصص لإطلاق وتشغيل متجرك بنجاح.' : 'Use this personalized guide to get your store up and running.'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--t2)' }}>1/6</span>
              <div style={{ width: '80px', height: '6px', background: 'var(--edge)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '16.6%', height: '100%', background: '#2563eb' }} />
              </div>
            </div>

            <button
              onClick={() => setIsSetupModalOpen(true)}
              style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{isRtl ? 'إكمال الإعداد' : 'Complete setup'}</span>
              <ArrowRight size={14} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
            </button>

            <button
              onClick={() => setIsBannerDismissed(true)}
              style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', padding: '4px' }}
              title={isRtl ? 'إغلاق' : 'Dismiss'}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Actions & Filters Bar matching Screenshot 1 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Breadcrumb Icon */}
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: 'var(--surface2)',
            border: '1px solid var(--edge)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--t2)'
          }}>
            <StoreIcon size={16} />
          </div>

          {/* View switcher: Grid / List */}
          <div style={{
            display: 'flex',
            background: 'var(--surface2)',
            border: '1px solid var(--edge)',
            borderRadius: '8px',
            padding: '2px'
          }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? 'var(--surface)' : 'none',
                border: 'none',
                color: viewMode === 'list' ? 'var(--t1)' : 'var(--t3)',
                padding: '5px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
              title={isRtl ? 'عرض القائمة' : 'List View'}
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'var(--surface)' : 'none',
                border: 'none',
                color: viewMode === 'grid' ? 'var(--t1)' : 'var(--t3)',
                padding: '5px 8px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
              title={isRtl ? 'عرض الشبكة' : 'Grid View'}
            >
              <LayoutGrid size={15} />
            </button>
          </div>
        </div>

        {/* Search & New Store CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
            <Search size={15} style={{ position: 'absolute', [isRtl ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--t2)' }} />
            <input
              type="text"
              className="inp"
              placeholder={isRtl ? 'بحث عن المتاجر...' : 'Search for stores'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                [isRtl ? 'paddingRight' : 'paddingLeft']: '36px',
                width: '100%',
                fontSize: '13px',
                height: '38px'
              }}
            />
          </div>

          <button
            onClick={() => {
              setCreateType('template');
              setIsCreateModalOpen(true);
            }}
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--edge)',
              color: 'var(--t1)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '38px'
            }}
            title={isRtl ? 'مكتبة القوالب الجاهزة' : 'Store Templates'}
          >
            <Layers size={16} />
            <span>{isRtl ? 'القوالب' : 'Templates'}</span>
          </button>

          <button
            onClick={() => {
              setCreateType('blank');
              setIsCreateModalOpen(true);
            }}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 18px',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              height: '38px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}
          >
            <Plus size={16} />
            <span>{isRtl ? '+ متجر جديد' : '+ New store'}</span>
          </button>
        </div>
      </div>

      {/* Stores List / Table matching Screenshot 1 */}
      {viewMode === 'list' ? (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--edge)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
            <thead>
              <tr style={{
                background: 'var(--surface2)',
                borderBottom: '1px solid var(--edge)',
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--t2)',
                textTransform: 'uppercase'
              }}>
                <th style={{ padding: '14px 20px' }}>{isRtl ? 'اسم المتجر' : 'Name'}</th>
                <th style={{ padding: '14px 20px' }}>{isRtl ? 'آخر تحديث' : 'Last updated'}</th>
                <th style={{ padding: '14px 20px' }}>{isRtl ? 'صفحات المتجر' : 'Store pages'}</th>
                <th style={{ padding: '14px 20px', width: '60px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--t2)' }}>
                    {isRtl ? 'لا توجد متاجر بعد. أنشئ متجراً أو اختر قالباً للبدء.' : 'No stores yet. Create a store or start from a template.'}
                  </td>
                </tr>
              ) : null}
              {filteredStores.map((store) => {
                const isMenuOpen = openMenuStoreId === store.id;
                return (
                  <tr
                    key={store.id}
                    onClick={() => onSelectStore(store)}
                    style={{
                      borderBottom: '1px solid var(--edge)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--t1)', fontSize: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <StoreIcon size={16} style={{ color: '#2563eb' }} />
                        <span>{store.name}</span>
                        {store.published ? (
                          <span style={{ background: 'rgba(22,163,74,0.12)', color: '#16a34a', padding: '2px 7px', borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                            {isRtl ? 'مباشر' : 'Live'}
                          </span>
                        ) : (
                          <span style={{ background: 'rgba(249,115,22,0.12)', color: '#f97316', padding: '2px 7px', borderRadius: 6, fontSize: 11, fontWeight: 800 }}>
                            {isRtl ? 'مسودة' : 'Draft'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--t2)', fontSize: '13px' }}>
                      {store.lastUpdated}
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--t2)', fontSize: '13px' }}>
                      <span style={{
                        background: 'rgba(37, 99, 235, 0.1)',
                        color: '#2563eb',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700'
                      }}>
                        {store.pages?.length || 0} {isRtl ? 'صفحات' : 'Pages'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => setOpenMenuStoreId(isMenuOpen ? null : store.id)}
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
                                setOpenMenuStoreId(null);
                                onSelectStore(store);
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
                              <span>{isRtl ? 'إدارة وتعديل' : 'Manage Store'}</span>
                            </button>
                            <button
                              onClick={() => {
                                setOpenMenuStoreId(null);
                                onDuplicateStore(store.id);
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
                              <span>{isRtl ? 'نسخ المتجر' : 'Duplicate'}</span>
                            </button>
                            <div style={{ height: '1px', background: 'var(--edge)', margin: '4px 0' }} />
                            <button
                              onClick={() => {
                                setOpenMenuStoreId(null);
                                onDeleteStore(store.id);
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
                              <span>{isRtl ? 'حذف المتجر' : 'Delete'}</span>
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

          {/* Pagination Footer matching Screenshot 1 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '14px 20px',
            borderTop: '1px solid var(--edge)',
            gap: '16px',
            fontSize: '12.5px',
            color: 'var(--t2)'
          }}>
            <div>{isRtl ? 'صفوف لكل صفحة:' : 'Rows per page'} <strong>15</strong></div>
            <div>1-{filteredStores.length} of {filteredStores.length}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button disabled style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'default' }}>
                {isRtl ? 'السابق' : 'Previous'}
              </button>
              <span style={{
                background: '#2563eb',
                color: '#fff',
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '11px'
              }}>
                1
              </span>
              <button disabled style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'default' }}>
                {isRtl ? 'التالي' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {filteredStores.map((store) => (
            <div
              key={store.id}
              onClick={() => onSelectStore(store)}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--edge)',
                borderRadius: '14px',
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--edge)';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <StoreIcon size={18} />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb', background: 'rgba(37, 99, 235, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                    {store.pages?.length || 0} {isRtl ? 'صفحات' : 'Pages'}
                  </span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--t1)', margin: '0 0 6px' }}>
                  {store.name}
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--t2)' }}>
                  {isRtl ? 'تحديث:' : 'Updated:'} {store.lastUpdated}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--edge)' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#16a34a' }}>
                  {store.products?.length || 0} {isRtl ? 'منتجات' : 'Products'}
                </span>
                <span style={{ color: '#2563eb', fontSize: '12.5px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{isRtl ? 'فتح' : 'Open'}</span>
                  <ChevronRight size={14} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Setup Guide Modal */}
      {isSetupModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--edge)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '560px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--edge)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: 'var(--t1)' }}>
                {isRtl ? 'دليل إطلاق المتجر (6 خطوات)' : 'Store Launch Checklist (6 Steps)'}
              </h3>
              <button onClick={() => setIsSetupModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {setupSteps.map((s) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '8px', background: 'var(--surface2)' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: s.done ? '#16a34a' : 'var(--edge)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                    {s.done ? <Check size={13} /> : s.id}
                  </div>
                  <span style={{ fontSize: '13.5px', fontWeight: s.done ? '600' : '500', color: s.done ? 'var(--t1)' : 'var(--t2)', textDecoration: s.done ? 'none' : 'none' }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setIsSetupModalOpen(false)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 22px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                {isRtl ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW STORE MODAL - MATCHING EXACT SCREENSHOT 1 */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '580px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            color: '#0f172a'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                {isRtl ? 'إنشاء متجر جديد' : 'Create new store'}
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              {/* 2-Card layout matching Screenshot 1 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {/* Quick Start Card */}
                <div
                  onClick={() => setCreateType('blank')}
                  style={{
                    border: createType === 'blank' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    background: createType === 'blank' ? '#ffffff' : '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: createType === 'blank' ? '0 4px 14px rgba(37,99,235,0.08)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    border: '1.5px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: '18px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    background: '#ffffff'
                  }}>
                    <input
                      type="text"
                      value={newStoreName}
                      onChange={(e) => setNewStoreName(e.target.value)}
                      onClick={(e) => { e.stopPropagation(); setCreateType('blank'); }}
                      placeholder="new store"
                      style={{
                        width: '100%',
                        border: '1px solid #2563eb',
                        borderRadius: '4px',
                        padding: '6px 10px',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#0f172a',
                        outline: 'none',
                        textAlign: 'center'
                      }}
                      autoFocus
                    />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                      {isRtl ? 'البدء السريع' : 'Quick start'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                      {isRtl ? 'خصص متجرك الجاهز وانشره بسرعة' : 'Customize your pre-built store and publish quickly'}
                    </p>
                  </div>
                </div>

                {/* From Templates Card */}
                <div
                  onClick={() => setCreateType('template')}
                  style={{
                    border: createType === 'template' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    background: createType === 'template' ? '#ffffff' : '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: createType === 'template' ? '0 4px 14px rgba(37,99,235,0.08)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    background: 'linear-gradient(135deg, #fed7aa, #fdba74)',
                    borderRadius: '8px',
                    padding: '16px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    height: '62px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#7c2d12' }}>Over 1000+</div>
                      <div style={{ fontSize: '13px', fontWeight: '900', color: '#7c2d12' }}>Templates</div>
                    </div>
                    <div style={{
                      position: 'absolute',
                      right: '8px',
                      top: '8px',
                      width: '45px',
                      height: '55px',
                      background: '#fff',
                      borderRadius: '4px',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                      transform: 'rotate(10deg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px'
                    }}>
                      🛍️
                    </div>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                      {isRtl ? 'من القوالب' : 'From templates'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                      {isRtl ? 'اختر الثيم الأنسب لنشاطك التجاري' : 'Choose the right theme for your business'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Template list if templates selected */}
              {createType === 'template' && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {STORE_TEMPLATES_LIST.map((tmpl) => (
                      <div
                        key={tmpl.id}
                        onClick={() => setSelectedTemplate(tmpl)}
                        style={{
                          background: selectedTemplate?.id === tmpl.id ? 'rgba(37, 99, 235, 0.08)' : '#f8fafc',
                          border: selectedTemplate?.id === tmpl.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                      >
                        <img src={tmpl.image} alt={tmpl.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '12px', color: '#0f172a' }}>{isRtl ? tmpl.name : tmpl.nameEn}</div>
                          <div style={{ fontSize: '11px', color: '#2563eb' }}>{tmpl.pagesCount} pages</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{
                    background: '#fff',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 22px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                  }}
                >
                  {isRtl ? 'إنشاء' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
