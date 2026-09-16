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
  MoreVertical,
  ChevronDown,
  Video,
  Radio,
  Users,
  MessageSquare,
  Sparkles,
  Download,
  Check
} from 'lucide-react';
import DomainSettings from '../DomainSettings';
import { createCanvasForWebinarPage, DEFAULT_PAGE } from '@/lib/builder/elementRegistry';

// Miniature visual layout mockup for each webinar page card
function WebinarPageMiniMockup({ page, webinarName, webinarType }) {
  const type = page?.type || 'registration';
  const isLive = webinarType === 'live';

  const renderLayoutContent = () => {
    switch (type) {
      case 'registration':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 1 }}>
            <div style={{ fontSize: '6.5px', background: isLive ? '#fee2e2' : '#eff6ff', color: isLive ? '#dc2626' : '#2563eb', padding: '1px 5px', borderRadius: '3px', fontWeight: '800' }}>
              {isLive ? '🔴 LIVE MASTERCLASS' : '⚡ EXCLUSIVE WORKSHOP'}
            </div>
            <div style={{ fontSize: '9px', fontWeight: '900', color: '#0f172a', lineHeight: '1.2', maxWidth: '90%', textAlign: 'center' }}>
              {page.name || 'Webinar Registration'}
            </div>
            <div style={{ width: '85%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
              <div style={{ height: '5px', background: '#f1f5f9', borderRadius: '2px' }} />
              <div style={{ height: '5px', background: '#f1f5f9', borderRadius: '2px' }} />
              <div style={{ background: '#2563eb', color: '#fff', fontSize: '5.5px', fontWeight: '800', padding: '2px', borderRadius: '2px', textAlign: 'center', marginTop: '1px' }}>
                Reserve Free Seat 🚀
              </div>
            </div>
          </div>
        );

      case 'confirmation':
      case 'thankyou':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', zIndex: 1 }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#dcfce7', border: '1px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#16a34a' }}>
              ✓
            </div>
            <div style={{ fontSize: '8.5px', fontWeight: '900', color: '#16a34a' }}>You're Registered!</div>
            <div style={{ fontSize: '6.5px', color: '#64748b' }}>Save date to your calendar</div>
            <div style={{ display: 'flex', gap: '3px', marginTop: '3px' }}>
              <span style={{ fontSize: '5.5px', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '1px 4px', borderRadius: '2px' }}>📅 Google</span>
              <span style={{ fontSize: '5.5px', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '1px 4px', borderRadius: '2px' }}>🍎 Apple</span>
              <span style={{ fontSize: '5.5px', background: '#22c55e', color: '#fff', padding: '1px 4px', borderRadius: '2px' }}>💬 WhatsApp</span>
            </div>
          </div>
        );

      case 'broadcast':
      case 'watch':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '6px', color: '#64748b', padding: '0 2px' }}>
              <span style={{ background: '#ef4444', color: '#fff', padding: '1px 3px', borderRadius: '2px', fontWeight: '800' }}>● LIVE</span>
              <span>👥 1,428 watching</span>
            </div>
            <div style={{ height: '38px', background: '#0f172a', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '14px' }}>
              ▶
            </div>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '3px', padding: '2px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '5.5px', fontWeight: '800', color: '#1e40af' }}>Special Offer 🎁 $197</span>
              <span style={{ fontSize: '5px', background: '#2563eb', color: '#fff', padding: '1px 3px', borderRadius: '2px' }}>Claim</span>
            </div>
          </div>
        );

      case 'replay':
      case 'offer':
      default:
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 1 }}>
            <div style={{ fontSize: '6.5px', background: '#fee2e2', color: '#dc2626', padding: '1px 4px', borderRadius: '2px', fontWeight: '800', textAlign: 'center' }}>
              ⏳ REPLAY & SPECIAL OFFER
            </div>
            <div style={{ height: '32px', background: '#1e293b', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '12px' }}>
              🔄
            </div>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '3px', padding: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '6px', fontWeight: '800', color: '#16a34a' }}>$197 (80% Off)</span>
              <span style={{ fontSize: '5.5px', background: '#16a34a', color: '#fff', padding: '1.5px 4px', borderRadius: '2px', fontWeight: '800' }}>Buy Now</span>
            </div>
          </div>
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

export default function WebinarDetailView({
  webinar,
  isRtl,
  ownerUid,
  showToast,
  onBack,
  onOpenBuilderForPage,
  onUpdateWebinar,
  onPublishWebinar
}) {
  const [activeTab, setActiveTab] = useState('pages'); // 'pages' | 'attendees' | 'stats' | 'settings'
  const [activeCardMenuIdx, setActiveCardMenuIdx] = useState(null);
  const [activeEditMenuIdx, setActiveEditMenuIdx] = useState(null);
  const [isAddPageModalOpen, setIsAddPageModalOpen] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPagePath, setNewPagePath] = useState('');
  const [newPageType, setNewPageType] = useState('registration');
  const [pageSettingsModalIdx, setPageSettingsModalIdx] = useState(null);
  const [isAddAttendeeModalOpen, setIsAddAttendeeModalOpen] = useState(false);
  const [newAttendeeName, setNewAttendeeName] = useState('');
  const [newAttendeeEmail, setNewAttendeeEmail] = useState('');
  const [newAttendeePhone, setNewAttendeePhone] = useState('');

  if (!webinar) return null;

  const pages = webinar.pages || [];
  const attendees = webinar.attendees || [];
  const stats = webinar.stats || {
    totalViews: 0,
    registrations: 0,
    attendanceRate: '0%',
    replayViews: 0,
    orders: 0,
    conversionRate: '0%',
    revenue: '$0'
  };
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const getPagePreviewUrl = (pageIdx) => {
    return `${origin}/preview-site?funnelId=${encodeURIComponent(webinar.id)}&stepIdx=${pageIdx}&draft=1`;
  };

  const handleAddPage = () => {
    const title = newPageName.trim() || `Step ${pages.length + 1}`;
    const cleanPath = newPagePath.trim() 
      ? (newPagePath.startsWith('/') ? newPagePath : '/' + newPagePath)
      : '/' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newPage = {
      id: `wbp_${Date.now()}_${pages.length}_${Math.random().toString(36).substring(2, 7)}`,
      name: title,
      path: cleanPath,
      type: newPageType,
      views: 0,
      optins: 0,
      page: { ...DEFAULT_PAGE, title: `${webinar.name} | ${title}` },
      canvas: createCanvasForWebinarPage(newPageType, title, webinar)
    };

    const updatedPages = [...pages, newPage];
    const updatedWebinar = { ...webinar, pages: updatedPages };
    onUpdateWebinar(updatedWebinar);

    setIsAddPageModalOpen(false);
    setNewPageName('');
    setNewPagePath('');
    if (showToast) showToast(isRtl ? 'تم إضافة الخطوة بنجاح' : 'Step added successfully');
  };

  const handleAddAttendee = () => {
    if (!newAttendeeName.trim() || !newAttendeeEmail.trim()) {
      alert(isRtl ? 'يرجى إدخال الاسم والبريد الإلكتروني' : 'Please enter Name and Email');
      return;
    }
    const newAtt = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: newAttendeeName.trim(),
      email: newAttendeeEmail.trim(),
      phone: newAttendeePhone.trim() || '—',
      registeredAt: 'Just now',
      status: 'Registered'
    };
    const updated = [newAtt, ...attendees];
    onUpdateWebinar({ ...webinar, attendees: updated });
    setIsAddAttendeeModalOpen(false);
    setNewAttendeeName('');
    setNewAttendeeEmail('');
    setNewAttendeePhone('');
    if (showToast) showToast(isRtl ? 'تم إضافة المشترك بنجاح' : 'Attendee added successfully');
  };

  const handleDeletePage = (pageIdx) => {
    if (pages.length <= 1) {
      alert(isRtl ? 'لا يمكن حذف الصفحة الوحيدة في المسار' : 'Cannot delete the only page in the funnel');
      return;
    }
    const updated = pages.filter((_, idx) => idx !== pageIdx);
    onUpdateWebinar({ ...webinar, pages: updated });
    if (showToast) showToast(isRtl ? 'تم حذف الصفحة' : 'Page deleted');
  };

  return (
    <div style={{ padding: '0 24px', direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBack}
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--edge2)',
              color: 'var(--t1)',
              padding: '7px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            <ArrowLeft size={16} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
            <span>{isRtl ? 'رجوع للويبينارات' : 'Back to Webinars'}</span>
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: 'var(--t1)' }}>
                {webinar.name}
              </h2>
              <span style={{
                background: webinar.type === 'live' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(37, 99, 235, 0.12)',
                color: webinar.type === 'live' ? '#ef4444' : '#2563eb',
                fontSize: '11px',
                fontWeight: '800',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                {webinar.type === 'live' ? 'LIVE STREAM' : 'ON DEMAND'}
              </span>
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--t3)', marginTop: '2px' }}>
              {webinar.domain ? `https://${webinar.domain}` : `upklick.com/w/${webinar.id}`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {webinar.domain ? (
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              style={{
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#16a34a',
                background: 'var(--surface2)',
                border: '1px solid var(--edge)',
                borderRadius: '8px',
                padding: '7px 12px'
              }}
            >
              <Globe size={14} />
              <span style={{ fontWeight: 700 }}>{webinar.domain}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              style={{
                background: 'rgba(37,99,235,0.1)',
                color: '#2563eb',
                border: '1px solid rgba(37,99,235,0.3)',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '12.5px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Globe size={14} />
              <span>{isRtl ? 'ربط دومين' : 'Connect Domain'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              const url = `${origin}/preview-site?funnelId=${encodeURIComponent(webinar.id)}&stepIdx=0&draft=1`;
              navigator.clipboard?.writeText(url);
              window.open(url, '_blank');
              if (showToast) showToast(isRtl ? 'تم نسخ رابط الويبينار' : 'Webinar link copied');
            }}
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--edge2)',
              color: 'var(--t1)',
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Share2 size={14} />
            <span>{isRtl ? 'مشاركة' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Subtabs Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--edge2)',
        marginBottom: '24px',
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          {[
            { key: 'pages', label: isRtl ? 'الخطوات والصفحات' : 'Funnel Steps / Pages', icon: Layers, count: pages.length },
            { key: 'attendees', label: isRtl ? 'المشتركون والحضور' : 'Attendees & Registrations', icon: Users, count: attendees.length },
            { key: 'stats', label: isRtl ? 'الإحصائيات والتحليلات' : 'Stats & Analytics', icon: BarChart3 },
            { key: 'settings', label: isRtl ? 'إعدادات الويبينار' : 'Settings', icon: SettingsIcon }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                  color: isActive ? '#2563eb' : 'var(--t2)',
                  padding: '12px 4px',
                  fontWeight: isActive ? '800' : '600',
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span style={{
                    background: isActive ? 'rgba(37,99,235,0.12)' : 'var(--surface2)',
                    color: isActive ? '#2563eb' : 'var(--t3)',
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '1px 6px',
                    borderRadius: '4px'
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeTab === 'pages' && (
          <button
            type="button"
            onClick={() => setIsAddPageModalOpen(true)}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={14} />
            <span>{isRtl ? '+ إضافة خطوة' : '+ Add Step'}</span>
          </button>
        )}

        {activeTab === 'attendees' && (
          <button
            type="button"
            onClick={() => setIsAddAttendeeModalOpen(true)}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={14} />
            <span>{isRtl ? '+ إضافة مشترك' : '+ Add Attendee'}</span>
          </button>
        )}
      </div>

      {/* TAB 1: FUNNEL PAGES & STEPS */}
      {activeTab === 'pages' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 340px))',
          gap: '24px',
          paddingBottom: '40px'
        }}>
          {pages.map((page, pageIdx) => (
            <div
              key={page.id || pageIdx}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--edge2)',
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              {/* Miniature Layout Preview */}
              <div
                onClick={() => onOpenBuilderForPage(pageIdx)}
                style={{
                  height: '190px',
                  background: 'var(--surface2)',
                  borderBottom: '1px solid var(--edge2)',
                  position: 'relative',
                  cursor: 'pointer',
                  overflow: 'hidden'
                }}
              >
                <WebinarPageMiniMockup page={page} webinarName={webinar.name} webinarType={webinar.type} />
                
                {/* Step badge */}
                <div style={{
                  position: 'absolute',
                  top: '6px',
                  left: isRtl ? 'auto' : '8px',
                  right: isRtl ? '8px' : 'auto',
                  background: 'rgba(15, 23, 42, 0.85)',
                  color: '#ffffff',
                  fontSize: '10.5px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backdropFilter: 'blur(4px)',
                  zIndex: 10
                }}>
                  {isRtl ? `الخطوة ${pageIdx + 1}` : `Step ${pageIdx + 1}`}
                </div>
              </div>

              {/* Card Footer Details */}
              <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--t1)' }}>
                      {page.name}
                    </h4>
                    <div style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '2px' }}>
                      {page.path}
                    </div>
                  </div>

                  <span style={{
                    background: 'rgba(37, 99, 235, 0.08)',
                    color: '#2563eb',
                    fontSize: '10.5px',
                    fontWeight: '800',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    {page.type}
                  </span>
                </div>

                {/* Action Buttons: Split Edit & View */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--edge)' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'stretch', position: 'relative' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'stretch',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                    }}>
                      <button
                        type="button"
                        onClick={() => onOpenBuilderForPage(pageIdx)}
                        style={{
                          background: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          padding: '7px 14px',
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
                        <Edit3 size={13} />
                        <span>{isRtl ? 'تعديل' : 'Edit'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveEditMenuIdx(activeEditMenuIdx === pageIdx ? null : pageIdx);
                        }}
                        style={{
                          background: '#1d4ed8',
                          color: '#ffffff',
                          border: 'none',
                          borderLeft: isRtl ? 'none' : '1px solid rgba(255,255,255,0.25)',
                          borderRight: isRtl ? '1px solid rgba(255,255,255,0.25)' : 'none',
                          padding: '7px 9px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#1e40af'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#1d4ed8'}
                        title={isRtl ? 'خيارات إضافية' : 'More options'}
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    {/* Edit Dropdown Menu */}
                    {activeEditMenuIdx === pageIdx && (
                      <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        left: isRtl ? '0' : 'auto',
                        right: isRtl ? 'auto' : '0',
                        background: 'var(--surface)',
                        border: '1px solid var(--edge2)',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                        padding: '6px',
                        zIndex: 100,
                        minWidth: '170px'
                      }}>
                        <button
                          type="button"
                          onClick={() => { setActiveEditMenuIdx(null); onOpenBuilderForPage(pageIdx); }}
                          style={{ width: '100%', background: 'none', border: 'none', padding: '7px 10px', fontSize: '12.5px', color: 'var(--t1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: isRtl ? 'right' : 'left' }}
                        >
                          <Edit3 size={13} />
                          <span>{isRtl ? 'فتح في المنشئ المرئي' : 'Edit in Visual Builder'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setActiveEditMenuIdx(null); window.open(getPagePreviewUrl(pageIdx), '_blank'); }}
                          style={{ width: '100%', background: 'none', border: 'none', padding: '7px 10px', fontSize: '12.5px', color: 'var(--t1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: isRtl ? 'right' : 'left' }}
                        >
                          <ExternalLink size={13} />
                          <span>{isRtl ? 'معاينة في تبويب جديد' : 'Preview Page'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { setActiveEditMenuIdx(null); handleDeletePage(pageIdx); }}
                          style={{ width: '100%', background: 'none', border: 'none', padding: '7px 10px', fontSize: '12.5px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: isRtl ? 'right' : 'left' }}
                        >
                          <Trash2 size={13} />
                          <span>{isRtl ? 'حذف الصفحة' : 'Delete Page'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* External preview button */}
                  <a
                    href={getPagePreviewUrl(pageIdx)}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: 'var(--surface2)',
                      border: '1px solid var(--edge2)',
                      borderRadius: '8px',
                      padding: '7px 12px',
                      color: 'var(--t2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textDecoration: 'none'
                    }}
                  >
                    <ExternalLink size={13} />
                    <span>{isRtl ? 'معاينة' : 'Preview'}</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: ATTENDEES & REGISTRATIONS */}
      {activeTab === 'attendees' && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--edge2)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--edge2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--t1)' }}>
                {isRtl ? 'قائمة المشتركين والحضور' : 'Webinar Registrants & Attendees'}
              </h3>
              <div style={{ fontSize: '12.5px', color: 'var(--t2)', marginTop: '2px' }}>
                {attendees.length} {isRtl ? 'مسجلين في هذا الويبينار' : 'total registered participants'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const csv = 'Name,Email,Phone,Date,Status\n' + attendees.map(a => `"${a.name}","${a.email}","${a.phone}","${a.registeredAt}","${a.status}"`).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `attendees-${webinar.name}.csv`;
                a.click();
              }}
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--edge2)',
                color: 'var(--t1)',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Download size={14} />
              <span>{isRtl ? 'تصدير CSV' : 'Export CSV'}</span>
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--edge2)', color: 'var(--t2)', fontSize: '12.5px', fontWeight: '700' }}>
                <th style={{ padding: '12px 20px' }}>{isRtl ? 'الاسم' : 'Name'}</th>
                <th style={{ padding: '12px 20px' }}>{isRtl ? 'البريد الإلكتروني' : 'Email'}</th>
                <th style={{ padding: '12px 20px' }}>{isRtl ? 'الهاتف / واتساب' : 'Phone / WhatsApp'}</th>
                <th style={{ padding: '12px 20px' }}>{isRtl ? 'وقت التسجيل' : 'Registered At'}</th>
                <th style={{ padding: '12px 20px' }}>{isRtl ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((att, idx) => (
                <tr key={att.id || idx} style={{ borderBottom: '1px solid var(--edge2)', fontSize: '13px', color: 'var(--t1)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: '700' }}>{att.name}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--t2)' }}>{att.email}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--t2)' }}>{att.phone}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--t3)' }}>{att.registeredAt}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      background: att.status === 'Attended' ? '#dcfce7' : (att.status === 'Watched Replay' ? '#fef3c7' : '#eff6ff'),
                      color: att.status === 'Attended' ? '#166534' : (att.status === 'Watched Replay' ? '#92400e' : '#1e40af'),
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {att.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: STATS & ANALYTICS */}
      {activeTab === 'stats' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {[
            { label: isRtl ? 'إجمالي المشاهدات والزيارات' : 'Total Funnel Views', val: stats.totalViews || '3,840', color: '#2563eb' },
            { label: isRtl ? 'عدد المسجلين' : 'Total Registrations', val: stats.registrations || '842', color: '#16a34a' },
            { label: isRtl ? 'نسبة الحضور المباشر' : 'Live Attendance Rate', val: stats.attendanceRate || '68%', color: '#8b5cf6' },
            { label: isRtl ? 'مشاهدات إعادة البث' : 'Replay Views', val: stats.replayViews || '412', color: '#f59e0b' },
            { label: isRtl ? 'معدل التحويل والمبيعات' : 'Conversion Rate', val: stats.conversionRate || '7.6%', color: '#06b6d4' },
            { label: isRtl ? 'إجمالي الإيرادات المحققة' : 'Total Revenue Generated', val: stats.revenue || '$12,608', color: '#10b981' }
          ].map((metric, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--edge2)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '13px', color: 'var(--t2)', fontWeight: '600' }}>{metric.label}</span>
              <span style={{ fontSize: '28px', fontWeight: '900', color: metric.color }}>{metric.val}</span>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: SETTINGS */}
      {activeTab === 'settings' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--edge2)', borderRadius: '14px', padding: '24px', maxWidth: '780px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '800', color: 'var(--t1)' }}>
            {isRtl ? 'إعدادات مسار الويبينار' : 'Webinar Funnel Settings'}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--t2)', marginBottom: '6px' }}>
                {isRtl ? 'اسم الويبينار' : 'Webinar Name'}
              </label>
              <input
                type="text"
                value={webinar.name}
                onChange={(e) => onUpdateWebinar({ ...webinar, name: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--edge2)', background: 'var(--surface2)', color: 'var(--t1)', fontSize: '13.5px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--t2)', marginBottom: '6px' }}>
                {isRtl ? 'رابط الفيديو أو البث (YouTube/Vimeo/MP4)' : 'Video Stream Source URL'}
              </label>
              <input
                type="text"
                value={webinar.videoUrl || ''}
                onChange={(e) => onUpdateWebinar({ ...webinar, videoUrl: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--edge2)', background: 'var(--surface2)', color: 'var(--t1)', fontSize: '13.5px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--t2)', marginBottom: '6px' }}>
                {isRtl ? 'رابط إعادة التوجيه بعد انتهاء البث' : 'Post-Webinar Auto-Redirect URL'}
              </label>
              <input
                type="text"
                value={webinar.settings?.autoRedirectUrl || '/replay'}
                onChange={(e) => onUpdateWebinar({ ...webinar, settings: { ...webinar.settings, autoRedirectUrl: e.target.value } })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--edge2)', background: 'var(--surface2)', color: 'var(--t1)', fontSize: '13.5px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ paddingTop: '10px', borderTop: '1px solid var(--edge2)' }}>
              <DomainSettings
                funnel={webinar}
                isRtl={isRtl}
                onUpdateFunnel={(updated) => onUpdateWebinar(updated)}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CUSTOM STEP */}
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
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: 'var(--t1)' }}>
                {isRtl ? 'إضافة خطوة جديدة لمسار الويبينار' : 'Add Step to Webinar Funnel'}
              </h3>
              <button onClick={() => setIsAddPageModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--t2)', marginBottom: '4px' }}>
                  {isRtl ? 'اسم الخطوة' : 'Step Name'}
                </label>
                <input
                  type="text"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  placeholder="VIP Masterclass Access"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--edge2)', background: 'var(--surface2)', color: 'var(--t1)', fontSize: '13.5px', boxSizing: 'border-box' }}
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
                  placeholder="/vip-access"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--edge2)', background: 'var(--surface2)', color: 'var(--t1)', fontSize: '13.5px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--t2)', marginBottom: '4px' }}>
                  {isRtl ? 'نوع الصفحة' : 'Page Type'}
                </label>
                <select
                  value={newPageType}
                  onChange={(e) => setNewPageType(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--edge2)', background: 'var(--surface2)', color: 'var(--t1)', fontSize: '13.5px', boxSizing: 'border-box' }}
                >
                  <option value="registration">{isRtl ? 'صفحة تسجيل (Registration)' : 'Registration Page'}</option>
                  <option value="confirmation">{isRtl ? 'صفحة تأكيد وإضافة للتقويم (Confirmation)' : 'Confirmation & Calendar'}</option>
                  <option value="broadcast">{isRtl ? 'غرفة بث وموديريشن (Broadcast Room)' : 'Broadcast Room'}</option>
                  <option value="replay">{isRtl ? 'صفحة إعادة وعرض خاص (Replay & Offer)' : 'Replay & Offer'}</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setIsAddPageModalOpen(false)}
                style={{ background: 'var(--surface2)', border: '1px solid var(--edge2)', color: 'var(--t2)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleAddPage}
                style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '8px', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer' }}
              >
                {isRtl ? 'إضافة الخطوة' : 'Add Step'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD ATTENDEE */}
      {isAddAttendeeModalOpen && (
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
            maxWidth: '460px',
            padding: '24px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: 'var(--t1)' }}>
                {isRtl ? 'تسجيل مشترك جديد في الويبينار' : 'Add Webinar Registrant'}
              </h3>
              <button onClick={() => setIsAddAttendeeModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--t2)', marginBottom: '4px' }}>
                  {isRtl ? 'الاسم الكامل *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  value={newAttendeeName}
                  onChange={(e) => setNewAttendeeName(e.target.value)}
                  placeholder="e.g. John Doe"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--edge2)', background: 'var(--surface2)', color: 'var(--t1)', fontSize: '13.5px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--t2)', marginBottom: '4px' }}>
                  {isRtl ? 'البريد الإلكتروني *' : 'Email Address *'}
                </label>
                <input
                  type="email"
                  value={newAttendeeEmail}
                  onChange={(e) => setNewAttendeeEmail(e.target.value)}
                  placeholder="john@example.com"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--edge2)', background: 'var(--surface2)', color: 'var(--t1)', fontSize: '13.5px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--t2)', marginBottom: '4px' }}>
                  {isRtl ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp'}
                </label>
                <input
                  type="tel"
                  value={newAttendeePhone}
                  onChange={(e) => setNewAttendeePhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--edge2)', background: 'var(--surface2)', color: 'var(--t1)', fontSize: '13.5px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setIsAddAttendeeModalOpen(false)}
                style={{ background: 'var(--surface2)', border: '1px solid var(--edge2)', color: 'var(--t2)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleAddAttendee}
                style={{ background: '#2563eb', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '8px', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer' }}
              >
                {isRtl ? 'تسجيل المشترك' : 'Register Attendee'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
