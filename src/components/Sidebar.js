'use client';

import React, { useState } from 'react';
import { useBusiness } from '../context/BusinessContext';

export default function Sidebar() {
  const {
    lang,
    currentPage,
    setCurrentPage,
    GC,
    t,
    setAiPanelOpen
  } = useBusiness();

  const [collapsed, setCollapsed] = useState(false);

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
        { page: 'marketing', label: 'Marketing OS', icon: '📣', id: 'sb-marketing' },
        { page: 'revenue', label: 'Revenue Hub', icon: '💰' }
      ]
    },
    {
      title: 'Discover',
      items: [
        { page: 'ai-growth', label: 'AI Growth Intel', icon: '🔮' },
        { page: 'tiktok-trends', label: 'Social Trends', icon: '📡' }
      ]
    },
    {
      title: 'Create',
      items: [
        { page: 'content', label: 'Content Hub', icon: '✦' },
        { page: 'social', label: 'Social Accounts', icon: '📡' },
        { page: 'bio', label: 'Bio Link', icon: '🔗' }
      ]
    },
    {
      title: 'Build',
      items: [
        { page: 'landing', label: 'Landing Page AI', icon: '⚡' },
        { page: 'digital', label: 'Digital Products', icon: '📦' },
        { page: 'upclick', label: 'UpClick Builder', icon: '⬆' }
      ]
    },
    {
      title: 'Manage',
      items: [
        { page: 'tasks', label: 'Task Board', icon: '◉', badge: highTasks },
        { page: 'calendar', label: 'Calendar', icon: '📅' },
        { page: 'finance', label: 'Finance', icon: '💳' },
        { page: 'strategy', label: 'Strategy', icon: '🧠' },
        { page: 'ops', label: 'Ops Hub', icon: '⚙' }
      ]
    },
    {
      title: 'Community',
      items: [
        { page: 'community', label: 'Community', icon: '👥' }
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
    <nav id="sb" className={collapsed ? 'collapsed' : ''}>
      <button id="sb-tog" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? '›' : '‹'}
      </button>

      <div className="sb-logo">
        <div className="sb-logo-mark">U</div>
        <div className="sb-logo-text">
          <div className="sb-logo-name">UpKlick</div>
          <div className="sb-logo-sub">{t('t-sub')}</div>
        </div>
      </div>

      <div className="sb-sections">
        {/* AI Assistant */}
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
        <div className="sb-user" onClick={() => setCurrentPage('profile')} title="View Profile">
          <div className="sb-avatar" id="sb-avatar-initials">
            {initials}
          </div>
          <div>
            <div className="sb-user-name" id="sb-user-name-lbl">
              {GC.profile.name ? GC.profile.name.split(' ')[0] : 'Sara'}
            </div>
            <div className="sb-user-plan" id="t-plan">
              {GC.profile.type ? `${GC.profile.type} — Pro` : t('t-plan')}
            </div>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--t3)' }} className="sb-lbl">
            →
          </span>
        </div>
      </div>
    </nav>
  );
}
