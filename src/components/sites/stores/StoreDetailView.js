'use client';

import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Share2, 
  Settings, 
  ExternalLink, 
  Copy, 
  Check, 
  Globe, 
  Plus, 
  Layout, 
  ShoppingBag, 
  BarChart2, 
  DollarSign, 
  Shield, 
  Activity
} from 'lucide-react';
import StorePagesTab from './StorePagesTab';
import StoreProductsTab from './StoreProductsTab';
import StoreStatsTab from './StoreStatsTab';
import StoreSalesTab from './StoreSalesTab';
import StoreSecurityTab from './StoreSecurityTab';
import StoreEventsTab from './StoreEventsTab';
import StoreSettingsTab from './StoreSettingsTab';
import { defaultStoreCanvas, DEFAULT_PAGE } from '@/lib/builder/elementRegistry';

export default function StoreDetailView({
  store,
  isRtl,
  ownerUid,
  showToast,
  onBack,
  onOpenBuilderForPage,
  onUpdateStore,
  onPublishStore,
  initialTab = 'pages'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [copiedLink, setCopiedLink] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isAddPageModalOpen, setIsAddPageModalOpen] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageType, setNewPageType] = useState('catalog');

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const tabs = [
    { key: 'pages', label: isRtl ? 'الصفحات' : 'Pages', icon: Layout },
    { key: 'products', label: isRtl ? 'المنتجات' : 'Products', icon: ShoppingBag },
    { key: 'stats', label: isRtl ? 'الإحصائيات' : 'Stats', icon: BarChart2 },
    { key: 'sales', label: isRtl ? 'المبيعات' : 'Sales', icon: DollarSign },
    { key: 'security', label: isRtl ? 'الأمان' : 'Security', icon: Shield },
    { key: 'events', label: isRtl ? 'الأحداث' : 'Events', icon: Activity },
    { key: 'settings', label: isRtl ? 'الإعدادات' : 'Settings', icon: Settings }
  ];

  const productionUrl = (pageIdx = 0) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const targetPage = store.pages?.[pageIdx] || store.pages?.find((p) => p.type === 'home') || store.pages?.[0];
    const path = targetPage?.path && targetPage.path !== '/' ? targetPage.path : '';
    if (store.domain) return `https://${store.domain}${path}`;
    return `${origin}/s/${encodeURIComponent(store.id)}${path}`;
  };

  const ensurePublished = async () => {
    if (store.published) return true;
    if (!onPublishStore) return false;
    setPublishing(true);
    try {
      await onPublishStore();
      return true;
    } catch {
      return false;
    } finally {
      setPublishing(false);
    }
  };

  const handleCopyLink = async () => {
    await ensurePublished();
    const url = productionUrl(0);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      if (showToast) showToast(isRtl ? 'تم نسخ رابط المتجر' : 'Store link copied to clipboard');
    } catch {
      window.prompt(isRtl ? 'انسخ رابط المتجر:' : 'Copy store URL:', url);
    }
  };

  const handleOpenLive = async (pageIdx = 0, isProd = false) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const targetPage = store.pages?.[pageIdx] || store.pages?.[0];
    if (isProd) await ensurePublished();
    const url = isProd
      ? productionUrl(pageIdx)
      : `${origin}/preview-site?storeId=${encodeURIComponent(store.id)}&pageIdx=${pageIdx}&path=${encodeURIComponent(targetPage?.path || '/')}&draft=1`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Page Actions
  const handleAddPage = () => {
    if (!newPageName.trim()) return;
    const path = '/' + newPageName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newPage = {
      id: 'sp_' + Date.now(),
      name: newPageName.trim(),
      nameAr: newPageName.trim(),
      path,
      type: newPageType,
      views: 0,
      uniqueViews: 0,
      optins: 0,
      orders: 0,
      salesAmount: 0,
      page: { ...DEFAULT_PAGE },
      canvas: defaultStoreCanvas(newPageType, newPageName.trim())
    };

    const updatedPages = [...(store.pages || []), newPage];
    onUpdateStore({ ...store, pages: updatedPages });
    setIsAddPageModalOpen(false);
    setNewPageName('');
  };

  const handleDeletePage = (pageIdx) => {
    if (confirm(isRtl ? 'هل تريد حذف هذه الصفحة من المتجر؟' : 'Delete this page from the store?')) {
      const updatedPages = (store.pages || []).filter((_, idx) => idx !== pageIdx);
      onUpdateStore({ ...store, pages: updatedPages });
    }
  };

  const handleDuplicatePage = (pageIdx) => {
    const target = store.pages?.[pageIdx];
    if (!target) return;
    const cloned = {
      ...target,
      id: 'sp_' + Date.now(),
      name: `${target.name} (Copy)`,
      nameAr: `${target.nameAr || target.name} (نسخة)`,
      path: `${target.path}-copy`
    };
    const updatedPages = [...(store.pages || [])];
    updatedPages.splice(pageIdx + 1, 0, cloned);
    onUpdateStore({ ...store, pages: updatedPages });
  };

  const handleUpdatePageName = (pageId, newName) => {
    const updatedPages = (store.pages || []).map(p => p.id === pageId ? { ...p, name: newName, nameAr: newName } : p);
    onUpdateStore({ ...store, pages: updatedPages });
  };

  // Product Actions
  const handleAddProduct = (newProd) => {
    const updatedProducts = [newProd, ...(store.products || [])];
    onUpdateStore({ ...store, products: updatedProducts });
  };

  const handleUpdateProduct = (prodId, patch) => {
    const updatedProducts = (store.products || []).map(p => p.id === prodId ? { ...p, ...patch } : p);
    onUpdateStore({ ...store, products: updatedProducts });
  };

  const handleDeleteProduct = (prodId) => {
    const updatedProducts = (store.products || []).filter(p => p.id !== prodId);
    onUpdateStore({ ...store, products: updatedProducts });
  };

  return (
    <div style={{ padding: '0 24px', animation: 'fadeIn 0.2s ease' }}>
      
      {/* Top Breadcrumb & Header matching Screenshots 2, 3, 4, 5 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--edge)',
              color: 'var(--t1)',
              padding: '7px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '700'
            }}
          >
            <ArrowLeft size={16} />
            <span>{isRtl ? 'رجوع للمتاجر' : 'Back to Stores'}</span>
          </button>

          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: 'var(--t1)' }}>
              {store.name}
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--t2)', marginTop: '2px' }}>
              {store.pages?.length || 0} {isRtl ? 'صفحات متجر' : 'Store Pages'} · {store.products?.length || 0} {isRtl ? 'منتجات معروضة' : 'Products in catalog'}
              {store.published ? (
                <span style={{ marginInlineStart: 8, color: '#16a34a', fontWeight: 800 }}>{isRtl ? 'منشور' : 'Published'}</span>
              ) : (
                <span style={{ marginInlineStart: 8, color: '#f97316', fontWeight: 800 }}>{isRtl ? 'مسودة' : 'Draft'}</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleCopyLink}
            className="btn btn-ghost"
            style={{
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: copiedLink ? '#16a34a' : 'var(--t1)',
              background: copiedLink ? 'rgba(22, 163, 74, 0.1)' : 'var(--surface2)',
              border: '1px solid var(--edge)'
            }}
          >
            {copiedLink ? <Check size={14} /> : <Share2 size={14} />}
            <span>{copiedLink ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'مشاركة الرابط' : 'Share')}</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              if (!onPublishStore) return;
              setPublishing(true);
              try {
                await onPublishStore();
              } finally {
                setPublishing(false);
              }
            }}
            disabled={publishing}
            style={{
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {publishing
              ? (isRtl ? 'جاري النشر...' : 'Publishing...')
              : (isRtl ? 'نشر المتجر' : 'Publish store')}
          </button>

          <button
            type="button"
            onClick={() => handleOpenLive(0, true)}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
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
            <ExternalLink size={15} />
            <span>{isRtl ? 'فتح المتجر المباشر' : 'Live Store'}</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation Bar matching Screenshots 2, 3, 4, 5 */}
      <div style={{
        display: 'flex',
        gap: '24px',
        borderBottom: '1px solid var(--edge)',
        marginBottom: '24px',
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }}>
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--a)' : '2px solid transparent',
                color: isActive ? 'var(--a)' : 'var(--t2)',
                padding: '10px 4px',
                fontWeight: isActive ? '700' : '500',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <TabIcon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {activeTab === 'pages' && (
        <StorePagesTab
          store={store}
          isRtl={isRtl}
          onOpenBuilder={(pageIdx) => onOpenBuilderForPage(pageIdx)}
          onOpenLivePage={(pageIdx, isProd) => handleOpenLive(pageIdx, isProd)}
          onAddPage={() => setIsAddPageModalOpen(true)}
          onDeletePage={handleDeletePage}
          onDuplicatePage={handleDuplicatePage}
          onUpdatePageName={handleUpdatePageName}
        />
      )}

      {activeTab === 'products' && (
        <StoreProductsTab
          store={store}
          isRtl={isRtl}
          onAddProduct={handleAddProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      {activeTab === 'stats' && (
        <StoreStatsTab
          store={store}
          isRtl={isRtl}
        />
      )}

      {activeTab === 'sales' && (
        <StoreSalesTab
          store={store}
          isRtl={isRtl}
        />
      )}

      {activeTab === 'security' && (
        <StoreSecurityTab
          store={store}
          isRtl={isRtl}
          onSaveSettings={(patch) => onUpdateStore({ ...store, ...patch })}
        />
      )}

      {activeTab === 'events' && (
        <StoreEventsTab
          store={store}
          isRtl={isRtl}
        />
      )}

      {activeTab === 'settings' && (
        <StoreSettingsTab
          store={store}
          isRtl={isRtl}
          ownerUid={ownerUid}
          showToast={showToast}
          onSaveSettings={(patch) => onUpdateStore({ ...store, ...patch })}
        />
      )}

      {/* Add New Page Modal */}
      {isAddPageModalOpen && (
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
            maxWidth: '480px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', margin: '0 0 16px', color: 'var(--t1)' }}>
              {isRtl ? 'إضافة صفحة جديدة للمتجر' : 'Add New Store Page'}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--t1)' }}>
                  {isRtl ? 'اسم الصفحة' : 'Page Name'}
                </label>
                <input
                  type="text"
                  className="inp"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  placeholder={isRtl ? 'مثال: عروض التخفيضات الكبرى' : 'e.g. Flash Deals Page'}
                  style={{ width: '100%' }}
                  autoFocus
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--t1)' }}>
                  {isRtl ? 'نوع وتخطيط الصفحة' : 'Page Template Type'}
                </label>
                <select
                  className="inp"
                  value={newPageType}
                  onChange={(e) => setNewPageType(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="catalog">{isRtl ? 'قائمة وكتالوج المنتجات (Catalog)' : 'Products Catalog Grid'}</option>
                  <option value="product_detail">{isRtl ? 'تفاصيل المنتج (Product Details)' : 'Product Details Page'}</option>
                  <option value="cart">{isRtl ? 'سلة التسوق (Shopping Cart)' : 'Shopping Cart Page'}</option>
                  <option value="checkout">{isRtl ? 'صفحة الدفع (Checkout)' : 'Checkout Page'}</option>
                  <option value="thankyou">{isRtl ? 'صفحة الشكر (Thank You)' : 'Thank You Confirmation Page'}</option>
                  <option value="home">{isRtl ? 'صفحة رئيسية (Home)' : 'Store Home Page'}</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={() => setIsAddPageModalOpen(false)}
                  className="btn btn-ghost"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handleAddPage}
                  style={{
                    background: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {isRtl ? 'إنشاء الصفحة' : 'Create Page'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
