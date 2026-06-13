'use client';

import React, { useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const {
    lang,
    currentPage,
    setCurrentPage,
    GC,
    t,
    setAiPanelOpen,
    mobileMenuOpen
  } = useBusiness();

  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const isRtl = lang === 'ar';

  // Compute badges
  const hotLeads = GC.crm.leads.filter(l => l.stage === 'qualified' || l.stage === 'proposal').length;
  const highTasks = GC.tasks.items.filter(t => !t.done && t.priority === 'high').length;

  const initials = GC.profile.name
    ? GC.profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const sections = [
    {
      title: 'Dashboard',
      items: [
        { page: 'home', label: 'Dashboard', icon: '⌂' }
      ]
    },
    {
      title: 'Grow',
      items: [
        { page: 'crm', label: 'Smart CRM', icon: '🎯', badge: hotLeads },
        { page: 'whatsapp', label: 'WhatsApp Hub', icon: '💬' },
        { page: 'strategy', label: 'Strategy Lab', icon: '🧠' }
      ]
    },
    {
      title: 'Marketing Lab',
      items: [
        { page: 'marketing', label: 'Marketing OS', icon: '📣', id: 'sb-marketing' },
        { page: 'content', label: 'Content Hub', icon: '✦' },
        { page: 'automation', label: 'Automation Hub', icon: '⚡' },
        { page: 'ai-growth', label: 'AI Growth Intel', icon: '🔮' }
      ]
    },
    {
      title: 'Creator',
      items: [
        { page: 'revenue', label: 'Creator Hub', icon: '⚡' },
        { page: 'social', label: 'Social Accounts', icon: '📡' },
        { page: 'tiktok-trends', label: 'Social Trends', icon: '📡' },
        { page: 'bio', label: 'Bio Link', icon: '🔗' }
      ]
    },
    {
      title: 'Build',
      items: [
        { page: 'landing', label: 'Landing Page AI', icon: '⚡' },
        { page: 'digital', label: 'Digital Products', icon: '📦' },
        { page: 'niche', label: 'Niche & Brand Studio', icon: '🎯' },
        { page: 'community', label: 'Community Hub', icon: '🏘️' },
        { page: 'design', label: 'Design Studio', icon: '🎨' },
        { page: 'upclick', label: 'UpClick Builder', icon: '⬆' }
      ]
    },
    {
      title: 'Manage',
      items: [
        { page: 'tasks', label: 'Task Board', icon: '◉', badge: highTasks },
        { page: 'calendar', label: 'Calendar', icon: '📅' },
        { page: 'finance', label: 'Finance', icon: '💳' },
        { page: 'ops', label: 'Ops Hub', icon: '⚙' },
        { page: 'team', label: 'Team', icon: '👥' },
        { page: 'teamchat', label: 'Team Chat', icon: '💬' }
      ]
    },
    {
      title: 'Settings',
      items: [
        { page: 'integrations', label: 'Integrations', icon: '⛓' },
        { page: 'analytics', label: 'Analytics', icon: '◈' }
      ]
    }
  ];

  return (
    <nav id="sb" className={`${collapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
      <button id="sb-tog" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? '›' : '‹'}
      </button>

      <div className="sb-logo" style={{ justifyContent: 'center', padding: '20px 14px' }}>
        <img 
          src="https://storage.googleapis.com/msgsndr/GRFYul19fkMHp7sNiPF0/media/69447879aca6ab0633721cf7.png" 
          alt="UpKlick Logo" 
          style={{ maxHeight: '35px', maxWidth: '100%', objectFit: 'contain', transition: 'all 0.3s ease' }}
          className={collapsed ? 'logo-collapsed' : 'logo-expanded'}
        />
      </div>

      <div className="sb-sections">
        <div style={{ padding: '5px 7px 3px' }}>
          <button
            className="sb-btn"
            onClick={() => setAiPanelOpen(prev => !prev)}
            style={{
              background: 'var(--orange-d)',
              color: 'var(--orange)',
              borderRadius: '8px',
              width: '100%',
              justifyContent: 'center',
              gap: '6px',
              fontWeight: 600
            }}
          >
            <span>✦</span>
            <span className="sb-lbl">{t('AI Assistant')}</span>
          </button>
        </div>

        {sections.map((sec, idx) => (
          <div className="sb-sec" key={idx} style={idx === 0 ? { marginTop: '4px' } : {}}>
            {sec.title !== 'Dashboard' && <div className="sb-sec-title">{t(sec.title)}</div>}
            {sec.items.map((item) => (
              <button
                key={item.page}
                id={item.id}
                className={`sb-btn ${currentPage === item.page ? 'on' : ''}`}
                onClick={() => setCurrentPage(item.page)}
              >
                <span className="sb-icon">{item.icon}</span>
                <span className="sb-lbl">{t(item.label)}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="sb-badge">{item.badge}</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="sb-foot">
        {/* User profile row */}
        <div
          className="sb-user"
          onClick={() => setCurrentPage('profile')}
          title={isRtl ? 'عرض الملف الشخصي' : 'View Profile'}
        >
          <div className="sb-avatar" id="sb-avatar-initials">
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div className="sb-user-name" id="sb-user-name-lbl">
              {GC.profile.name ? GC.profile.name.split(' ')[0] : 'Sara'}
            </div>
            <div className="sb-user-plan" id="t-plan">
              {GC.profile.type ? `${GC.profile.type} — Pro` : t('t-plan')}
            </div>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--t3)', flexShrink: 0 }}>
            {isRtl ? '←' : '→'}
          </span>
        </div>

        {/* Logout button */}
        <button
          className="sb-logout-btn"
          onClick={async (e) => { e.stopPropagation(); await logout(); }}
          title={isRtl ? 'تسجيل الخروج' : 'Sign Out'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isRtl ? 'flex-end' : 'flex-start',
            flexDirection: isRtl ? 'row-reverse' : 'row',
            gap: '8px',
            width: '100%',
            padding: '9px 12px',
            margin: '4px 0 0',
            background: 'transparent',
            border: '1px solid rgba(255, 61, 110, 0.15)',
            borderRadius: '8px',
            color: 'var(--red)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: 'var(--ff)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,61,110,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,61,110,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,61,110,0.15)'; }}
        >
          <span>⎋</span>
          <span>{isRtl ? 'تسجيل الخروج' : 'Sign Out'}</span>
        </button>
      </div>
    </nav>
  );
}
