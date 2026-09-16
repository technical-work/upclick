'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Share2, 
  Settings as SettingsIcon, 
  Eye, 
  Copy, 
  Trash2, 
  Edit3, 
  Globe, 
  Lock, 
  BarChart3, 
  DollarSign, 
  Calendar,
  Layers,
  FileText,
  ExternalLink,
  CheckCircle2,
  X,
  Code,
  MoreVertical,
  ChevronDown,
  ShoppingBag,
  Package,
  Sparkles
} from 'lucide-react';
import DomainSettings from '../DomainSettings';
import { defaultStepCanvas, createCanvasForPageType, DEFAULT_PAGE } from '@/lib/builder/elementRegistry';

// Miniature visual layout mockup for each page card tailored by page type
function PageMiniMockup({ page, websiteName }) {
  const canvas = page?.canvas || [];
  const name = page?.name || 'Page';
  const type = page?.type || 'landing';

  // Find elements from canvas if present
  const heroEl = canvas.find(el => el.type === 'hero' || el.type === 'store_hero_banner');
  const headingEl = canvas.find(el => el.type === 'headline' || el.type === 'heading' || el.type === 'h1' || el.type === 'h2');
  const btnEl = canvas.find(el => el.type === 'button' || el.type === 'cta');
  const rowEl = canvas.find(el => el.type === 'row');

  // Page title / hero text to display
  const headline = headingEl?.content || heroEl?.headline || heroEl?.title || heroEl?.content || page?.page?.title || name;
  const subtext = heroEl?.subtitle || heroEl?.subhead || heroEl?.description || 'Build high-converting funnels & pages';
  const btnLabel = btnEl?.text || btnEl?.content || heroEl?.btnText || 'Get Started Now';

  // Render specific layout preview based on page type
  const renderLayoutContent = () => {
    switch (type) {
      case 'store':
      case 'catalog':
      case 'products':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' }}>
              <span style={{ fontSize: '9px', fontWeight: '800', color: '#0f172a' }}>🛍️ Catalog</span>
              <span style={{ fontSize: '7px', background: '#eff6ff', color: '#2563eb', padding: '1px 4px', borderRadius: '3px', fontWeight: '700' }}>Filter & Search</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '3px', display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left' }}>
                  <div style={{ width: '100%', height: '24px', background: i === 1 ? '#e0e7ff' : i === 2 ? '#fef3c7' : '#dcfce7', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                    {i === 1 ? '🎧' : i === 2 ? '⌚' : '🎒'}
                  </div>
                  <div style={{ width: '80%', height: '2.5px', background: '#475569', borderRadius: '1px' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '6.5px', fontWeight: '800', color: '#2563eb' }}>${i * 49}</span>
                    <span style={{ fontSize: '5.5px', color: '#f59e0b' }}>★4.8</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'detail':
      case 'product_detail':
        return (
          <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '40% 60%', gap: '6px', alignItems: 'center', zIndex: 1 }}>
            <div style={{ height: '56px', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderRadius: '4px', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              📦
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', textAlign: 'left' }}>
              <div style={{ fontSize: '8.5px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>{headline}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ fontSize: '8px', fontWeight: '900', color: '#16a34a' }}>$199.00</span>
                <span style={{ fontSize: '6.5px', color: '#94a3b8', textDecoration: 'line-through' }}>$280</span>
              </div>
              <div style={{ background: '#2563eb', color: '#fff', fontSize: '6.5px', fontWeight: '800', padding: '2.5px 6px', borderRadius: '3px', textAlign: 'center', width: 'fit-content' }}>
                🛒 Add to Cart
              </div>
            </div>
          </div>
        );

      case 'cart':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 1 }}>
            <div style={{ fontSize: '8.5px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span>🛒</span> Your Cart (2 Items)
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '6.5px' }}>
                <span style={{ color: '#334155', fontWeight: '600' }}>Item 1: Smart Watch</span>
                <span style={{ fontWeight: '800', color: '#0f172a' }}>$149.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '6.5px' }}>
                <span style={{ color: '#334155', fontWeight: '600' }}>Item 2: Wireless Pods</span>
                <span style={{ fontWeight: '800', color: '#0f172a' }}>$89.00</span>
              </div>
            </div>
            <div style={{ background: '#16a34a', color: '#ffffff', fontSize: '7px', fontWeight: '800', padding: '3px', borderRadius: '3px', textAlign: 'center' }}>
              Proceed to Checkout →
            </div>
          </div>
        );

      case 'checkout':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '8px', fontWeight: '800', color: '#0f172a' }}>🔒 Express Checkout</span>
              <span style={{ fontSize: '6px', color: '#16a34a', fontWeight: '700' }}>SSL 256-Bit</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ height: '7px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '2px', padding: '0 4px', fontSize: '5px', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>Shipping Address</div>
              <div style={{ height: '7px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '2px', padding: '0 4px', fontSize: '5px', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>Card Number •••• 4242</div>
            </div>
            <div style={{ background: '#2563eb', color: '#ffffff', fontSize: '7px', fontWeight: '800', padding: '3px', borderRadius: '3px', textAlign: 'center' }}>
              Pay & Complete Order 💳
            </div>
          </div>
        );

      case 'thankyou':
      case 'confirmation':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', zIndex: 1 }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#dcfce7', border: '1px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
              ✓
            </div>
            <div style={{ fontSize: '9px', fontWeight: '900', color: '#16a34a' }}>Thank You! Order Placed</div>
            <div style={{ fontSize: '6.5px', color: '#64748b' }}>Order confirmation sent to your email</div>
            <div style={{ display: 'flex', gap: '3px', marginTop: '2px' }}>
              <span style={{ fontSize: '6px', background: '#f1f5f9', padding: '1.5px 5px', borderRadius: '2px' }}>📦 Processing</span>
              <span style={{ fontSize: '6px', background: '#f1f5f9', padding: '1.5px 5px', borderRadius: '2px' }}>🚚 Dispatch</span>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '3px', zIndex: 1 }}>
            <div style={{ fontSize: '8.5px', fontWeight: '800', color: '#0f172a' }}>💬 Get In Touch</div>
            <div style={{ height: '6px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '2px' }} />
            <div style={{ height: '6px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '2px' }} />
            <div style={{ height: '12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '2px' }} />
            <div style={{ display: 'flex', gap: '3px' }}>
              <div style={{ flex: 1, background: '#2563eb', color: '#fff', fontSize: '6px', fontWeight: '700', padding: '2px', borderRadius: '2px', textAlign: 'center' }}>Send Message</div>
              <div style={{ flex: 1, background: '#22c55e', color: '#fff', fontSize: '6px', fontWeight: '700', padding: '2px', borderRadius: '2px', textAlign: 'center' }}>WhatsApp</div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 1 }}>
            <div style={{ fontSize: '8.5px', fontWeight: '900', color: '#0f172a' }}>Our Mission & Story</div>
            <div style={{ width: '100%', height: '24px', background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#ffffff' }}>
              🏢 Global Team
            </div>
            <div style={{ display: 'flex', gap: '3px', width: '100%', justifyContent: 'center' }}>
              <span style={{ fontSize: '6px', background: '#eff6ff', color: '#1e40af', padding: '1px 3px', borderRadius: '2px' }}>🎯 Innovation</span>
              <span style={{ fontSize: '6px', background: '#f0fdf4', color: '#166534', padding: '1px 3px', borderRadius: '2px' }}>⚡ Speed</span>
              <span style={{ fontSize: '6px', background: '#fef3c7', color: '#92400e', padding: '1px 3px', borderRadius: '2px' }}>🤝 Trust</span>
            </div>
          </div>
        );

      case 'landing':
      default:
        return (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', zIndex: 1 }}>
              <span style={{ fontSize: '13px' }}>🚀</span>
              <span style={{ fontSize: '9px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.2px' }}>
                {websiteName || 'UpKlick'}
              </span>
            </div>
            <div style={{
              fontSize: '11.5px',
              fontWeight: '900',
              color: '#0f172a',
              lineHeight: '1.2',
              maxWidth: '92%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              zIndex: 1
            }}>
              {headline}
            </div>
            <div style={{
              fontSize: '7.5px',
              color: '#64748b',
              maxWidth: '85%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              zIndex: 1
            }}>
              {subtext}
            </div>
            <div style={{
              background: '#2563eb',
              color: '#ffffff',
              fontSize: '8px',
              fontWeight: '800',
              padding: '3.5px 10px',
              borderRadius: '4px',
              boxShadow: '0 2px 5px rgba(37, 99, 235, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              zIndex: 1
            }}>
              <span>{btnLabel}</span>
              <span style={{ fontSize: '7px' }}>→</span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '4px',
              width: '100%',
              marginTop: '2px',
              zIndex: 1
            }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '3px',
                  padding: '3px 2px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px'
                }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '6px' }}>
                    {i === 1 ? '⚡' : i === 2 ? '🎯' : '✨'}
                  </div>
                  <div style={{ width: '80%', height: '2.5px', background: '#94a3b8', borderRadius: '1px' }} />
                </div>
              ))}
            </div>
          </>
        );
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#ffffff',
      color: '#0f172a',
      fontFamily: '"DM Sans", system-ui, sans-serif',
      position: 'relative',
      userSelect: 'none',
      overflow: 'hidden'
    }}>
      {/* Top Browser Bar */}
      <div style={{
        height: '24px',
        background: '#f1f5f9',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 8px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', gap: '3px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#eab308' }} />
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
        </div>
        <div style={{
          flex: 1,
          height: '14px',
          background: '#ffffff',
          borderRadius: '3px',
          border: '1px solid #cbd5e1',
          fontSize: '8px',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          padding: '0 6px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          direction: 'ltr'
        }}>
          🔒 upklick.com{page.path || '/'}
        </div>
      </div>

      {/* Miniature Web Page Body */}
      <div style={{
        flex: 1,
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: '6px',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        position: 'relative'
      }}>
        {/* Subtle decorative grid background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.04,
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '10px 10px'
        }} />

        {renderLayoutContent()}
      </div>
    </div>
  );
}

export default function WebsiteDetailView({
  website,
  isRtl,
  ownerUid,
  showToast,
  onBack,
  onOpenBuilderForPage,
  onUpdateWebsite,
  onPublishWebsite
}) {
  const [activeTab, setActiveTab] = useState('pages'); // 'pages' | 'products' | 'stats' | 'sales' | 'security' | 'events' | 'settings'
  const [activeCardMenuIdx, setActiveCardMenuIdx] = useState(null);
  const [activeEditMenuIdx, setActiveEditMenuIdx] = useState(null);
  const [isAddPageModalOpen, setIsAddPageModalOpen] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPagePath, setNewPagePath] = useState('');
  const [newPageType, setNewPageType] = useState('landing');
  const [pageSettingsModalIdx, setPageSettingsModalIdx] = useState(null);
  const [pageToDeleteIdx, setPageToDeleteIdx] = useState(null);

  // Close menus on outside click
  React.useEffect(() => {
    const handleOutsideClick = () => {
      setActiveCardMenuIdx(null);
      setActiveEditMenuIdx(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  if (!website) return null;

  const pages = website.pages || [];
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const getPagePreviewUrl = (pageIdx) => {
    return `${origin}/preview-site?funnelId=${encodeURIComponent(website.id)}&stepIdx=${pageIdx}&draft=1`;
  };

  const handlePageTypeChange = (type) => {
    setNewPageType(type);
    const presets = {
      landing: { name: isRtl ? 'الصفحة الرئيسية' : 'Home / Landing', path: '/home' },
      store: { name: isRtl ? 'قائمة المنتجات والمتجر' : 'Products & Shop', path: '/products' },
      detail: { name: isRtl ? 'تفاصيل المنتج' : 'Product Details', path: '/product-details' },
      cart: { name: isRtl ? 'سلة المشتريات' : 'Shopping Cart', path: '/cart' },
      checkout: { name: isRtl ? 'إتمام الطلب والدفع' : 'Checkout', path: '/checkout' },
      thankyou: { name: isRtl ? 'صفحة الشكر وتأكيد الطلب' : 'Thank You', path: '/thank-you' },
      contact: { name: isRtl ? 'تواصل معنا' : 'Contact Us', path: '/contact' },
      about: { name: isRtl ? 'من نحن وقصتنا' : 'About Us', path: '/about' },
    };
    if (presets[type]) {
      setNewPageName(presets[type].name);
      setNewPagePath(presets[type].path);
    }
  };

  const handleAddPage = () => {
    const title = newPageName.trim() || `Page ${pages.length + 1}`;
    const cleanPath = newPagePath.trim() 
      ? (newPagePath.startsWith('/') ? newPagePath : '/' + newPagePath)
      : '/' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newPage = {
      id: 'wp_' + Date.now() + '_' + pages.length,
      name: title,
      path: cleanPath,
      type: newPageType,
      views: 0,
      optins: 0,
      page: { ...DEFAULT_PAGE, title: `${website.name} | ${title}` },
      canvas: createCanvasForPageType(newPageType, title, website.name)
    };

    const updatedPages = [...pages, newPage];
    const updatedWebsite = { ...website, pages: updatedPages };
    onUpdateWebsite(updatedWebsite);

    setIsAddPageModalOpen(false);
    setNewPageName('');
    setNewPagePath('');
    setNewPageType('landing');
    if (showToast) showToast(isRtl ? 'تم إضافة الصفحة مع القالب التفاعلي بنجاح' : 'Page added with interactive template successfully');
  };

  const handleDuplicatePage = (pageIdx) => {
    const target = pages[pageIdx];
    if (!target) return;
    const cloned = {
      ...target,
      id: 'wp_' + Date.now(),
      name: `${target.name} (Copy)`,
      path: `${target.path}-copy`
    };
    const updatedPages = [...pages];
    updatedPages.splice(pageIdx + 1, 0, cloned);
    const updatedWebsite = { ...website, pages: updatedPages };
    onUpdateWebsite(updatedWebsite);
    if (showToast) showToast(isRtl ? 'تم تكرار الصفحة' : 'Page duplicated');
  };

  const handleDeletePage = (pageIdx) => {
    if (pages.length <= 1) {
      if (showToast) showToast(isRtl ? 'لا يمكن حذف الصفحة الوحيدة المتبقية في الموقع.' : 'Cannot delete the only remaining page.', 'error');
      return;
    }
    setPageToDeleteIdx(pageIdx);
  };

  const handleConfirmDeletePage = () => {
    if (pageToDeleteIdx === null) return;
    const targetIdx = pageToDeleteIdx;
    if (pages.length <= 1) {
      if (showToast) showToast(isRtl ? 'لا يمكن حذف الصفحة الوحيدة المتبقية في الموقع.' : 'Cannot delete the only remaining page.', 'error');
      setPageToDeleteIdx(null);
      return;
    }
    const updatedPages = pages.filter((_, idx) => idx !== targetIdx);
    const updatedWebsite = { ...website, pages: updatedPages };
    onUpdateWebsite(updatedWebsite);
    setPageToDeleteIdx(null);
    if (showToast) showToast(isRtl ? 'تم حذف الصفحة بنجاح' : 'Page deleted successfully');
  };

  const handleShare = () => {
    const shareUrl = website.domain 
      ? `https://${website.domain}`
      : `${origin}/s/${website.id}`;
    navigator.clipboard.writeText(shareUrl);
    if (showToast) showToast(isRtl ? 'تم نسخ رابط الموقع إلى الحافظة' : 'Website link copied to clipboard');
  };

  return (
    <div style={{
      padding: '0 24px 60px',
      direction: isRtl ? 'rtl' : 'ltr',
      color: 'var(--t1)'
    }}>
      <style>{`
        .ghl-tab-btn {
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--t2);
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ghl-tab-btn:hover {
          color: var(--t1);
        }
        .ghl-tab-btn.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }
        .ghl-page-card-grid {
          background: var(--surface);
          border: 1px solid var(--edge2);
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .ghl-page-card-grid:hover {
          border-color: rgba(59, 130, 246, 0.4);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          transform: translateY(-2px);
        }
        .ghl-page-card-grid:hover .ghl-preview-overlay {
          opacity: 1 !important;
        }
      `}</style>

      {/* Top Breadcrumb Navigation */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#3b82f6',
            fontSize: '13.5px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: 0
          }}
        >
          <ArrowLeft size={16} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
          <span>{isRtl ? 'رجوع إلى المواقع' : 'Back to Websites'}</span>
        </button>
      </div>

      {/* Website Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '22px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '900',
            margin: 0,
            color: 'var(--t1)'
          }}>
            {website.name}
          </h1>
          {website.domain && (
            <span style={{
              background: 'rgba(0, 217, 139, 0.12)',
              color: 'var(--green)',
              border: '1px solid rgba(0, 217, 139, 0.25)',
              fontSize: '12px',
              padding: '3px 10px',
              borderRadius: '6px',
              fontWeight: '700'
            }}>
              🔗 {website.domain}
            </span>
          )}
        </div>

        {/* Action icons on right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleShare}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '700',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
            }}
            title={isRtl ? 'مشاركة رابط الموقع' : 'Share Website'}
          >
            <Share2 size={15} />
            <span>{isRtl ? 'مشاركة' : 'Share'}</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--edge2)',
              color: 'var(--t2)',
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '600'
            }}
            title={isRtl ? 'إعدادات الموقع' : 'Website Settings'}
          >
            <SettingsIcon size={15} />
            <span>{isRtl ? 'الإعدادات' : 'Settings'}</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs Navigation Matching GoHighLevel */}
      <div style={{
        borderBottom: '1px solid var(--edge2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '26px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {[
            { id: 'pages', labelAr: 'الصفحات', labelEn: 'Pages' },
            { id: 'products', labelAr: 'المنتجات', labelEn: 'Products' },
            { id: 'stats', labelAr: 'الإحصائيات', labelEn: 'Stats' },
            { id: 'sales', labelAr: 'المبيعات', labelEn: 'Sales' },
            { id: 'security', labelAr: 'الأمان', labelEn: 'Security' },
            { id: 'events', labelAr: 'الأحداث', labelEn: 'Events' },
            { id: 'settings', labelAr: 'الإعدادات', labelEn: 'Settings' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`ghl-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {isRtl ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Top Right Action Button */}
        {activeTab === 'pages' && (
          <button
            onClick={() => setIsAddPageModalOpen(true)}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
              marginBottom: '6px'
            }}
          >
            <Plus size={16} />
            <span>{isRtl ? 'إضافة صفحة جديدة' : '+ Add new page'}</span>
          </button>
        )}
      </div>

      {/* TAB 1: PAGES (GoHighLevel Multi-column Card Grid) */}
      {activeTab === 'pages' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 340px))',
          gap: '24px',
          justifyContent: 'start'
        }}>
          {pages.map((page, idx) => {
            const isMenuOpen = activeCardMenuIdx === idx;
            const isEditOpen = activeEditMenuIdx === idx;
            const previewUrl = getPagePreviewUrl(idx);

            return (
              <div
                key={page.id || idx}
                className="ghl-page-card-grid"
                style={{ direction: isRtl ? 'rtl' : 'ltr' }}
              >
                {/* Card Header: Title + 3-dots */}
                <div style={{
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--edge)',
                  background: 'var(--surface)'
                }}>
                  <div
                    onClick={() => onOpenBuilderForPage(idx)}
                    style={{
                      fontSize: '14.5px',
                      fontWeight: '700',
                      color: 'var(--t1)',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}
                    title={page.name}
                  >
                    {page.name}
                  </div>

                  {/* 3-dots kebab menu */}
                  <div style={{ position: 'relative' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCardMenuIdx(isMenuOpen ? null : idx);
                        setActiveEditMenuIdx(null);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--t3)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color 0.15s'
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>

                    {isMenuOpen && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 4px)',
                          [isRtl ? 'left' : 'right']: 0,
                          background: 'var(--surface2)',
                          border: '1px solid var(--edge2)',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.35)',
                          zIndex: 9999,
                          minWidth: '175px',
                          padding: '6px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => { setActiveCardMenuIdx(null); onOpenBuilderForPage(idx); }}
                          style={{ background: 'none', border: 'none', padding: '8px 10px', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600', color: 'var(--t1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: isRtl ? 'right' : 'left', width: '100%' }}
                        >
                          <Edit3 size={14} color="#3b82f6" /> {isRtl ? 'تحرير الصفحة' : 'Edit Page'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setActiveCardMenuIdx(null); window.open(previewUrl, '_blank'); }}
                          style={{ background: 'none', border: 'none', padding: '8px 10px', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600', color: 'var(--t1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: isRtl ? 'right' : 'left', width: '100%' }}
                        >
                          <ExternalLink size={14} color="var(--t2)" /> {isRtl ? 'معاينة في نافذة جديدة' : 'Preview in New Tab'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setActiveCardMenuIdx(null); handleDuplicatePage(idx); }}
                          style={{ background: 'none', border: 'none', padding: '8px 10px', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600', color: 'var(--t1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: isRtl ? 'right' : 'left', width: '100%' }}
                        >
                          <Copy size={14} color="var(--t2)" /> {isRtl ? 'تكرار الصفحة' : 'Clone Page'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setActiveCardMenuIdx(null); setPageSettingsModalIdx(idx); }}
                          style={{ background: 'none', border: 'none', padding: '8px 10px', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600', color: 'var(--t1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: isRtl ? 'right' : 'left', width: '100%' }}
                        >
                          <SettingsIcon size={14} color="var(--t2)" /> {isRtl ? 'إعدادات وسيو' : 'Page Settings'}
                        </button>
                        <div style={{ height: '1px', background: 'var(--edge)', margin: '4px 0' }} />
                        <button
                          type="button"
                          onClick={() => { setActiveCardMenuIdx(null); handleDeletePage(idx); }}
                          style={{ background: 'none', border: 'none', padding: '8px 10px', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600', color: '#ff3d6e', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: isRtl ? 'right' : 'left', width: '100%' }}
                        >
                          <Trash2 size={14} color="#ff3d6e" /> {isRtl ? 'حذف الصفحة' : 'Delete Page'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Center: Page Miniature Mockup Preview */}
                <div
                  onClick={() => onOpenBuilderForPage(idx)}
                  style={{
                    height: '180px',
                    background: '#ffffff',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    borderBottom: '1px solid var(--edge)'
                  }}
                >
                  <PageMiniMockup page={page} websiteName={website.name} />

                  {/* Hover Overlay */}
                  <div className="ghl-preview-overlay" style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(2px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '700',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                    pointerEvents: 'none'
                  }}>
                    <Edit3 size={16} />
                    <span>{isRtl ? 'انقر للتحرير في المنشئ' : 'Click to Edit Page'}</span>
                  </div>
                </div>

                {/* Card Bottom Action Bar */}
                <div style={{
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--surface)'
                }}>
                  {/* Split Edit Button */}
                  <div style={{ display: 'inline-flex', alignItems: 'stretch', position: 'relative', height: '34px' }}>
                    <button
                      type="button"
                      onClick={() => onOpenBuilderForPage(idx)}
                      style={{
                        background: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        padding: '0 16px',
                        borderRadius: isRtl ? '0 8px 8px 0' : '8px 0 0 8px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background 0.15s'
                      }}
                    >
                      <Edit3 size={14} />
                      <span>{isRtl ? 'تعديل' : 'Edit'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveEditMenuIdx(isEditOpen ? null : idx);
                        setActiveCardMenuIdx(null);
                      }}
                      style={{
                        background: '#1d4ed8',
                        color: '#ffffff',
                        border: 'none',
                        borderLeft: isRtl ? 'none' : '1px solid rgba(255,255,255,0.25)',
                        borderRight: isRtl ? '1px solid rgba(255,255,255,0.25)' : 'none',
                        padding: '0 10px',
                        borderRadius: isRtl ? '8px 0 0 8px' : '0 8px 8px 0',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.15s'
                      }}
                      title={isRtl ? 'خيارات إضافية' : 'More options'}
                    >
                      <ChevronDown size={14} />
                    </button>

                    {isEditOpen && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          position: 'absolute',
                          top: 'calc(100% + 6px)',
                          [isRtl ? 'right' : 'left']: 0,
                          background: 'var(--surface2)',
                          border: '1px solid var(--edge2)',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                          zIndex: 9999,
                          minWidth: '170px',
                          padding: '6px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => { setActiveEditMenuIdx(null); onOpenBuilderForPage(idx); }}
                          style={{ background: 'none', border: 'none', padding: '8px 10px', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600', color: 'var(--t1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: isRtl ? 'right' : 'left', width: '100%' }}
                        >
                          <Edit3 size={14} color="#3b82f6" /> {isRtl ? 'تحرير في المنشئ' : 'Edit Page'}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setActiveEditMenuIdx(null); window.open(previewUrl, '_blank'); }}
                          style={{ background: 'none', border: 'none', padding: '8px 10px', borderRadius: '6px', fontSize: '12.5px', fontWeight: '600', color: 'var(--t1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: isRtl ? 'right' : 'left', width: '100%' }}
                        >
                          <ExternalLink size={14} color="var(--t2)" /> {isRtl ? 'معاينة في نافذة جديدة' : 'Preview in New Tab'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* External Link icon button */}
                  <button
                    type="button"
                    onClick={() => window.open(previewUrl, '_blank')}
                    style={{
                      background: 'var(--surface2)',
                      border: '1px solid var(--edge2)',
                      borderRadius: '8px',
                      height: '34px',
                      padding: '0 12px',
                      color: 'var(--t2)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s'
                    }}
                    title={isRtl ? 'فتح في نافذة جديدة' : 'Open live / preview'}
                  >
                    <ExternalLink size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: PRODUCTS */}
      {activeTab === 'products' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--edge2)', borderRadius: '14px', padding: '36px 24px', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <ShoppingBag size={30} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 8px', color: 'var(--t1)' }}>
            {isRtl ? 'كتالوج منتجات الموقع' : 'Website Products & Inventory'}
          </h3>
          <p style={{ fontSize: '13.5px', color: 'var(--t2)', maxWidth: '480px', margin: '0 auto 22px', lineHeight: '1.6' }}>
            {isRtl ? 'أضف المنتجات الرقمية أو المادية وقم بربطها تلقائياً مع صفحات الدفع والسلة في موقعك.' : 'Connect physical or digital products to checkout and cart pages across this website.'}
          </p>
          <button
            type="button"
            onClick={() => showToast && showToast(isRtl ? 'كتالوج المنتجات جاهز ومرتبط بالسلة' : 'Products catalog connected')}
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
              gap: '6px',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
            }}
          >
            <Plus size={16} />
            <span>{isRtl ? '+ إضافة منتج جديد' : '+ Add Product'}</span>
          </button>
        </div>
      )}

      {/* TAB 3: STATS */}
      {activeTab === 'stats' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ color: 'var(--t3)', fontSize: '13px', marginBottom: '6px' }}>{isRtl ? 'إجمالي المشاهدات' : 'Total Pageviews'}</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--t1)' }}>1,482</div>
            <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>↑ +18.4% this week</div>
          </div>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ color: 'var(--t3)', fontSize: '13px', marginBottom: '6px' }}>{isRtl ? 'الزوار الفريدون' : 'Unique Visitors'}</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#2563eb' }}>924</div>
            <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>↑ +12.1% this week</div>
          </div>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ color: 'var(--t3)', fontSize: '13px', marginBottom: '6px' }}>{isRtl ? 'التحويلات وتعبئة النماذج' : 'Opt-ins / Inquiries'}</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--orange)' }}>86</div>
            <div style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '4px' }}>9.3% conversion rate</div>
          </div>
        </div>
      )}

      {/* TAB 4: SALES */}
      {activeTab === 'sales' && (
        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <DollarSign size={36} style={{ color: 'var(--green)', margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 6px' }}>{isRtl ? 'مبيعات ومدفوعات الموقع' : 'Website Orders & Sales'}</h3>
          <p style={{ fontSize: '13px', color: 'var(--t3)', margin: '0 0 16px' }}>
            {isRtl ? 'تتبع كل المدفوعات والطلبات المستلمة من خلال نماذج الدفع في صفحات موقعك.' : 'Track all transactions processed through your website pages.'}
          </p>
          <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--green)' }}>0.00 EGP</div>
        </div>
      )}

      {/* TAB 5: SECURITY */}
      {activeTab === 'security' && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Lock size={22} style={{ color: '#2563eb' }} />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{isRtl ? 'حماية وأمان الموقع' : 'Website Security & Protection'}</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--t2)', lineHeight: '1.6' }}>
            {isRtl ? 'شهادة SSL التلقائية مفعلة مجاناً لجميع النطاقات المربوطة. حماية ضد هجمات DDoS وتشفير شامل للبيانات.' : 'Automatic SSL certificate enabled. Full DDoS protection and secure asset delivery.'}
          </p>
        </div>
      )}

      {/* TAB 6: EVENTS */}
      {activeTab === 'events' && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Calendar size={22} style={{ color: 'var(--orange)' }} />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{isRtl ? 'الأحداث والتتبعات' : 'Custom Tracking Events'}</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--t2)' }}>
            {isRtl ? 'ربط أحداث بكسل فيسبوك، جوجل أناليتكس، وتيك توك بكسل تلقائياً مع تفاعلات الزوار.' : 'Trigger custom Facebook Pixel, Google Analytics, and TikTok events on user clicks.'}
          </p>
        </div>
      )}

      {/* TAB 7: SETTINGS */}
      {activeTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Custom Domain Settings Card */}
          <DomainSettings
            funnel={website}
            stepIdx={0}
            ownerUid={ownerUid}
            isRtl={isRtl}
            showToast={showToast}
            onSaveFunnel={onUpdateWebsite}
          />

          {/* SEO & Tracking Scripts */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>
              {isRtl ? 'إعدادات الـ SEO والأكواد المخصصة' : 'SEO & Header Code Injection'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: 'var(--t2)', marginBottom: '4px' }}>
                  {isRtl ? 'عنوان الموقع في محركات البحث (SEO Title)' : 'SEO Title'}
                </label>
                <input
                  type="text"
                  value={website.settings?.seoTitle || website.name || ''}
                  onChange={(e) => onUpdateWebsite({
                    ...website,
                    settings: { ...(website.settings || {}), seoTitle: e.target.value }
                  })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--edge)',
                    background: 'var(--surface2)',
                    color: 'var(--t1)',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: 'var(--t2)', marginBottom: '4px' }}>
                  {isRtl ? 'وصف الموقع (SEO Description)' : 'SEO Meta Description'}
                </label>
                <textarea
                  rows={3}
                  value={website.settings?.seoDescription || ''}
                  onChange={(e) => onUpdateWebsite({
                    ...website,
                    settings: { ...(website.settings || {}), seoDescription: e.target.value }
                  })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--edge)',
                    background: 'var(--surface2)',
                    color: 'var(--t1)',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Page Modal */}
      {isAddPageModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px',
          direction: isRtl ? 'rtl' : 'ltr'
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--edge2)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '480px',
            padding: '24px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--t1)' }}>
                {isRtl ? 'إضافة صفحة جديدة للموقع' : 'Add New Page to Website'}
              </h3>
              <button onClick={() => setIsAddPageModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--t2)', marginBottom: '4px' }}>
                  {isRtl ? 'اسم الصفحة' : 'Page Name'}
                </label>
                <input
                  type="text"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  placeholder={isRtl ? 'مثال: Products List, Cart, Checkout, About' : 'e.g. Products List, Cart, Checkout, About'}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--edge2)',
                    background: 'var(--surface2)',
                    color: 'var(--t1)',
                    fontSize: '13.5px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--t2)', marginBottom: '4px' }}>
                  {isRtl ? 'مسار الرابط (Path)' : 'URL Path'}
                </label>
                <input
                  type="text"
                  value={newPagePath}
                  onChange={(e) => setNewPagePath(e.target.value)}
                  placeholder="/products"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--edge2)',
                    background: 'var(--surface2)',
                    color: 'var(--t1)',
                    fontSize: '13.5px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--t2)', marginBottom: '4px' }}>
                  {isRtl ? 'نوع الصفحة' : 'Page Type'}
                </label>
                <select
                  value={newPageType}
                  onChange={(e) => handlePageTypeChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--edge2)',
                    background: 'var(--surface2)',
                    color: 'var(--t1)',
                    fontSize: '13.5px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="landing">{isRtl ? 'صفحة عادية (Standard / Landing)' : 'Standard / Landing'}</option>
                  <option value="store">{isRtl ? 'قائمة المنتجات (Products List / Shop)' : 'Products List / Shop'}</option>
                  <option value="detail">{isRtl ? 'تفاصيل المنتج (Product Details)' : 'Product Details'}</option>
                  <option value="cart">{isRtl ? 'سلة المشتريات (Cart)' : 'Cart'}</option>
                  <option value="checkout">{isRtl ? 'إتمام الطلب والدفع (Checkout)' : 'Checkout'}</option>
                  <option value="thankyou">{isRtl ? 'صفحة الشكر وتأكيد الطلب (Thank You)' : 'Thank You / Confirmation'}</option>
                  <option value="contact">{isRtl ? 'تواصل معنا (Contact Us)' : 'Contact Us'}</option>
                  <option value="about">{isRtl ? 'من نحن (About Us)' : 'About Us'}</option>
                </select>

                {/* Feature breakdown badge */}
                <div style={{
                  marginTop: '10px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'rgba(37, 99, 235, 0.08)',
                  border: '1px solid rgba(37, 99, 235, 0.2)',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  color: 'var(--t1)'
                }}>
                  <div style={{ fontWeight: '700', color: '#2563eb', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Sparkles size={14} />
                    {isRtl ? 'عناصر القالب التفاعلي في البيلدر:' : 'Interactive Builder Canvas Elements:'}
                  </div>
                  <div style={{ color: 'var(--t2)', fontSize: '11.5px' }}>
                    {newPageType === 'landing' && (isRtl ? 'هيدر تصفح + واجهة هيرو رئيسية + أزرار CTA + شبكة مميزات + أسئلة شائعة FAQ + فوتر' : 'Header + Hero Banner + CTA buttons + Features grid + FAQ accordion + Footer')}
                    {newPageType === 'store' && (isRtl ? 'هيدر + بانر متجر ترويجي + شريط بحث وتصفية + شبكة منتجات حية بالأسعار + ميزات المتجر والضمانات + فوتر' : 'Header + Store Hero Banner + Filter bar + Live Products Grid + Guarantee features + Footer')}
                    {newPageType === 'detail' && (isRtl ? 'هيدر + معرض صور المنتج + مواصفات واختيار الكمية + زر إضافة للسلة + منتجات مقترحة + فوتر' : 'Header + Product Gallery & Specs + Quantity selector + Add to Cart + Related products + Footer')}
                    {newPageType === 'cart' && (isRtl ? 'هيدر + جدول سلة مشتريات تفاعلي + ملخص الحساب والإجمالي + شريط شحن مجاني + فوتر' : 'Header + Live Cart Table + Order Totals + Free shipping notice + Footer')}
                    {newPageType === 'checkout' && (isRtl ? 'هيدر + شارة حماية مشفرة SSL + نموذج الشحن وبيانات العميل + وسائل الدفع + ملخص الطلب + فوتر' : 'Header + SSL Protection Badge + 2-step Checkout & Shipping form + Payment options + Footer')}
                    {newPageType === 'thankyou' && (isRtl ? 'شارة رقم الطلب + رسالة شكر متحركة + تفاصيل الشحن + خط زمني لمراحل التوصيل + أزرار المتابعة' : 'Order ID Badge + Animated Thank You + Delivery Timeline + Action buttons + Footer')}
                    {newPageType === 'contact' && (isRtl ? 'هيدر + نموذج مراسلة متقدم + زر دردشة واتساب مباشر + بطاقات قنوات الدعم والموقع + فوتر' : 'Header + Interactive Contact & Lead Form + WhatsApp Direct Chat + Support channels + Footer')}
                    {newPageType === 'about' && (isRtl ? 'هيدر + قصة البراند والرؤية + صورة الفريق + قيم الشركة الجوهرية + آراء وتوصيات العملاء + فوتر' : 'Header + Brand Vision + Showcase media + Core Values grid + Client testimonial + Footer')}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setIsAddPageModalOpen(false)}
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--edge2)',
                  color: 'var(--t2)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleAddPage}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {isRtl ? 'إضافة الصفحة' : 'Add Page'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Page Settings Modal */}
      {pageSettingsModalIdx !== null && pages[pageSettingsModalIdx] && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px',
          direction: isRtl ? 'rtl' : 'ltr'
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--edge2)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            padding: '24px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--t1)' }}>
                {isRtl ? 'إعدادات وسيو الصفحة' : 'Page Settings & SEO'}
              </h3>
              <button onClick={() => setPageSettingsModalIdx(null)} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--t2)', marginBottom: '4px' }}>
                  {isRtl ? 'اسم الصفحة' : 'Page Name'}
                </label>
                <input
                  type="text"
                  value={pages[pageSettingsModalIdx]?.name || ''}
                  onChange={(e) => {
                    const updated = [...pages];
                    updated[pageSettingsModalIdx] = { ...updated[pageSettingsModalIdx], name: e.target.value };
                    onUpdateWebsite({ ...website, pages: updated });
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--edge2)',
                    background: 'var(--surface2)',
                    color: 'var(--t1)',
                    fontSize: '13.5px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--t2)', marginBottom: '4px' }}>
                  {isRtl ? 'مسار الرابط (Path)' : 'URL Path'}
                </label>
                <input
                  type="text"
                  value={pages[pageSettingsModalIdx]?.path || ''}
                  onChange={(e) => {
                    const updated = [...pages];
                    updated[pageSettingsModalIdx] = { ...updated[pageSettingsModalIdx], path: e.target.value };
                    onUpdateWebsite({ ...website, pages: updated });
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--edge2)',
                    background: 'var(--surface2)',
                    color: 'var(--t1)',
                    fontSize: '13.5px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--t2)', marginBottom: '4px' }}>
                  {isRtl ? 'عنوان محركات البحث (SEO Title)' : 'SEO Title'}
                </label>
                <input
                  type="text"
                  value={pages[pageSettingsModalIdx]?.page?.title || ''}
                  onChange={(e) => {
                    const updated = [...pages];
                    updated[pageSettingsModalIdx] = { 
                      ...updated[pageSettingsModalIdx], 
                      page: { ...(updated[pageSettingsModalIdx].page || {}), title: e.target.value } 
                    };
                    onUpdateWebsite({ ...website, pages: updated });
                  }}
                  placeholder={`${website.name} | ${pages[pageSettingsModalIdx]?.name}`}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--edge2)',
                    background: 'var(--surface2)',
                    color: 'var(--t1)',
                    fontSize: '13.5px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setPageSettingsModalIdx(null)}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {isRtl ? 'حفظ وإغلاق' : 'Save & Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Page Confirmation Modal */}
      {pageToDeleteIdx !== null && pages[pageToDeleteIdx] && (
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
              onClick={() => setPageToDeleteIdx(null)}
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
              {isRtl ? 'هل أنت متأكد من حذف هذه الصفحة؟' : 'Delete this page?'}
            </h3>

            {/* Explanation Note */}
            <p style={{
              fontSize: '13.5px',
              color: 'var(--t2)',
              lineHeight: '1.5',
              margin: '0 0 16px 0'
            }}>
              {isRtl
                ? 'سيتم حذف هذه الصفحة ومحتواها وعناصرها بالكامل من هذا الموقع. لن تتمكن من التراجع أو استرجاع المحتوى بعد الحذف.'
                : 'This page and all of its design blocks and content will be permanently removed from this website. This action cannot be undone.'
              }
            </p>

            {/* Target Page Info Box */}
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
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: '800',
                flexShrink: 0
              }}>
                {pageToDeleteIdx + 1}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {pages[pageToDeleteIdx].name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--t3)', direction: 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
                  {pages[pageToDeleteIdx].path}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setPageToDeleteIdx(null)}
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
                onClick={handleConfirmDeletePage}
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
                <span>{isRtl ? 'نعم، احذف الصفحة' : 'Delete Page'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
