'use client';

import React, { useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';
import { CURRENCIES } from '../data/mockData';
import { 
  Home, 
  Target, 
  MessageSquare, 
  Brain, 
  Megaphone, 
  Sparkles, 
  Zap, 
  Radio, 
  TrendingUp, 
  Link2, 
  Layers, 
  Globe,
  BookOpen, 
  Package, 
  Compass, 
  Users, 
  Palette, 
  CheckSquare, 
  Calendar, 
  CreditCard, 
  Workflow, 
  Network, 
  HelpCircle, 
  Clock, 
  Cpu, 
  LogOut 
} from 'lucide-react';

export default function Sidebar() {
  const {
    lang,
    setLang,
    currentPage,
    setCurrentPage,
    GC,
    saveGC,
    t,
    setAiPanelOpen,
    mobileMenuOpen,
    setMobileMenuOpen,
    tenantConfig,
    theme,
    setTheme,
    currency,
    setCurrency,
    rates,
    guideActive,
    setGuideActive,
    guideFlowKey,
    setGuideFlowKey,
    isToolAllowedForUser,
    openUpgradeModalForTool
  } = useBusiness();

  const { logout, userData } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const isRtl = lang === 'ar';

  const [openSections, setOpenSections] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sb_open_sections_v3');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) { }
      }
    }
    return {
      Dashboard: true,
      Grow: true,
      'Marketing Lab': true,
      Creator: true,
      Build: true,
      Manage: true,
      Settings: true
    };
  });

  const toggleSection = (title) => {
    setOpenSections(prev => {
      const next = { ...prev, [title]: !prev[title] };
      if (typeof window !== 'undefined') {
        localStorage.setItem('sb_open_sections_v3', JSON.stringify(next));
      }
      return next;
    });
  };

  React.useEffect(() => {
    const parentSection = sections.find(sec => sec.items.some(item => item.page === currentPage));
    if (parentSection && openSections[parentSection.title] === false) {
      setOpenSections(prev => {
        const next = { ...prev, [parentSection.title]: true };
        if (typeof window !== 'undefined') {
          localStorage.setItem('sb_open_sections_v3', JSON.stringify(next));
        }
        return next;
      });
    }
  }, [currentPage]);

  // Compute badges
  const allLeads = GC.crm?.workspaces
    ? GC.crm.workspaces.flatMap(w => w.leads || [])
    : (GC.crm?.leads || []);
  const hotLeads = allLeads.filter(l => l.stage === 'qualified' || l.stage === 'proposal').length;
  const highTasks = GC.tasks?.items?.filter(t => !t.done && t.priority === 'high').length || 0;

  const displayName = userData?.name || GC?.profile?.name || userData?.email?.split('@')[0] || 'User';
  const initials = displayName
    ? displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const sections = [
    {
      title: 'Dashboard',
      items: [
        { page: 'home', label: 'Dashboard', icon: Home }
      ]
    },
    {
      title: 'Grow',
      items: [
        { page: 'crm', label: 'Smart CRM', icon: Target, badge: hotLeads },
        { page: 'telegram', label: 'Telegram Hub', icon: MessageSquare },
        { page: 'strategy', label: 'Strategy Lab', icon: Brain }
      ]
    },
    {
      title: 'Marketing Lab',
      items: [
        { page: 'marketing', label: 'Marketing OS', icon: Megaphone, id: 'sb-marketing' },
        { page: 'content', label: 'Content Hub', icon: Sparkles },
        { page: 'automation', label: 'Automation Hub', icon: Zap },
        { page: 'ai-growth', label: 'AI Growth Intel', icon: TrendingUp }
      ]
    },
    {
      title: 'Creator',
      items: [
        { page: 'revenue', label: 'Creator Hub', icon: Layers },
        { page: 'social', label: 'Social Accounts', icon: Network },
        { page: 'tiktok-trends', label: 'Social Trends', icon: TrendingUp },
        { page: 'bio', label: 'Bio Link', icon: Link2 }
      ]
    },
    {
      title: 'Build',
      items: [
        { page: 'landing', label: 'Landing Page AI', icon: Globe },
        { page: 'courses', label: 'Courses', icon: BookOpen },
        { page: 'digital', label: 'Digital Products', icon: Package },
        { page: 'niche', label: 'Niche & Brand Studio', icon: Compass },
        { page: 'community', label: 'Community Hub', icon: Users },
        { page: 'design', label: 'Design Studio', icon: Palette }
      ]
    },
    {
      title: 'Manage',
      items: [
        { page: 'tasks', label: 'Task Board', icon: CheckSquare, badge: highTasks },
        { page: 'calendar', label: 'Calendar', icon: Calendar },
        { page: 'finance', label: 'Finance', icon: CreditCard },
        { page: 'ops', label: 'Ops Hub', icon: Workflow },
        { page: 'team', label: 'Team Hub', icon: Users }
      ]
    },
    {
      title: 'Settings',
      items: [
        { page: 'integrations', label: 'Integrations', icon: Link2 },
        { page: 'analytics', label: 'Analytics', icon: TrendingUp },
        { page: 'billing', label: 'Billing & Credits', icon: CreditCard },
        { page: 'support', label: 'Technical Support', icon: HelpCircle },
        { page: 'model-test', label: 'اختبار الموديل', icon: Clock }
      ]
    }
  ];

  return (
    <nav id="sb" className={`${collapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
      <button
        id="sb-tog"
        onClick={() => {
          if (typeof window !== 'undefined' && window.innerWidth <= 768) {
            setMobileMenuOpen(false);
          } else {
            setCollapsed(!collapsed);
          }
        }}
      >
        {collapsed ? '›' : '‹'}
      </button>

      {(() => {
        const isDefaultLogo = !tenantConfig?.logoUrl;
        const logoContainerStyle = isDefaultLogo ? {
          height: collapsed ? '80px' : '75px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid var(--edge)',
          padding: collapsed ? '10px 5px' : '10px 14px',
          transition: 'all 0.3s ease'
        } : {
          justifyContent: 'center',
          padding: '20px 14px',
          borderBottom: '1px solid var(--edge)',
          display: 'flex',
          alignItems: 'center'
        };

        const logoImgStyle = isDefaultLogo ? (
          collapsed ? {
            height: '110px',
            objectFit: 'contain',
            marginTop: '15px',
            transition: 'all 0.3s ease'
          } : {
            height: '300px',
            objectFit: 'contain',
            marginTop: '22px',
            transition: 'all 0.3s ease'
          }
        ) : {
          maxHeight: '35px',
          maxWidth: '100%',
          objectFit: 'contain',
          transition: 'all 0.3s ease'
        };

        return (
          <div className="sb-logo" style={logoContainerStyle}>
            <img
              src={tenantConfig?.logoUrl || (theme === 'light' ? "/best_logo_light.png" : "/best_logo_dark.png")}
              alt={tenantConfig?.appName || "UpKlick Logo"}
              style={logoImgStyle}
              className={collapsed ? 'logo-collapsed' : 'logo-expanded'}
            />
          </div>
        );
      })()}

      <div className="sb-sections">
        <div style={{ padding: '5px 7px 3px' }}>
          <button
            className="sb-btn sidebar-ai-btn"
            onClick={() => {
              if (guideActive && guideFlowKey) {
                setGuideActive(false);
                setGuideFlowKey('');
                setAiPanelOpen(true);
                if (typeof window !== 'undefined' && window.innerWidth <= 768) {
                  setMobileMenuOpen(false);
                }
              } else {
                if (typeof window !== 'undefined' && window.innerWidth <= 768) {
                  setMobileMenuOpen(false);
                  setAiPanelOpen(prev => !prev);
                } else {
                  setAiPanelOpen(prev => !prev);
                }
              }
            }}
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
            <Sparkles size={16} />
            <span className="sb-lbl">{t('AI Assistant')}</span>
          </button>
        </div>

        {sections.map((sec, idx) => {
          const isDashboard = sec.title === 'Dashboard';
          const isOpen = openSections[sec.title] !== false;

          return (
            <div className="sb-sec" key={idx} style={idx === 0 ? { marginTop: '4px' } : {}}>
              {!isDashboard && !collapsed && (
                <div
                  className="sb-sec-header"
                  onClick={() => toggleSection(sec.title)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                    padding: '6px 8px 3px',
                    borderRadius: '6px',
                    marginInlineEnd: '4px'
                  }}
                >
                  <span className="sb-sec-title" style={{ padding: 0, margin: 0 }}>{t(sec.title)}</span>
                  <span style={{ fontSize: '7.5px', color: 'var(--t3)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(0deg)' : (isRtl ? 'rotate(90deg)' : 'rotate(-90deg)') }}>
                    ▼
                  </span>
                </div>
              )}
              {!isDashboard && collapsed && (
                <div style={{ height: '1px', background: 'var(--edge)', margin: '8px 4px' }} />
              )}
              <div style={{
                maxHeight: isDashboard || collapsed || isOpen ? '500px' : '0px',
                overflow: 'hidden',
                transition: 'max-height 0.22s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                {sec.items.map((item) => {
                  const IconComponent = item.icon;
                  const isAllowed = isToolAllowedForUser ? isToolAllowedForUser(item.page) : true;

                  return (
                    <button
                      key={item.page}
                      id={item.id || `sb-${item.page}`}
                      className={`sb-btn ${currentPage === item.page ? 'on' : ''}`}
                      onClick={() => {
                        if (!isAllowed) {
                          if (openUpgradeModalForTool) openUpgradeModalForTool(item.page);
                        } else {
                          setCurrentPage(item.page);
                        }
                      }}
                      style={!isAllowed ? { opacity: 0.85 } : {}}
                    >
                      <span className="sb-icon">
                        <IconComponent size={16} />
                      </span>
                      <span className="sb-lbl">{t(item.label)}</span>
                      {!isAllowed ? (
                        <span style={{ fontSize: '10px', background: 'rgba(249, 115, 22, 0.15)', color: 'var(--orange)', padding: '2px 5px', borderRadius: '6px', fontWeight: 'bold', marginInlineStart: 'auto', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
                          🔒 PRO
                        </span>
                      ) : (
                        item.badge !== undefined && item.badge > 0 && (
                          <span className="sb-badge">{item.badge}</span>
                        )
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sb-foot">        {/* User profile row */}
        <div
          id="sb-profile"
          className="sb-user"
          onClick={() => setCurrentPage('profile')}
          title={isRtl ? 'عرض الملف الشخصي' : 'View Profile'}
        >
          <div className="sb-avatar" id="sb-avatar-initials">
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div className="sb-user-name" id="sb-user-name-lbl">
              {displayName}
            </div>
            <div className="sb-user-plan" id="t-plan">
              {userData?.role === 'team_member' ? (isRtl ? 'عضو فريق' : 'Team Member') : GC.profile.type ? `${GC.profile.type} — Pro` : (userData?.role === 'admin' ? 'Admin — Pro' : t('t-plan'))}
            </div>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--t3)', flexShrink: 0 }}>
            {isRtl ? '←' : '→'}
          </span>
        </div>

        {!collapsed && userData?.aiCredits !== undefined && (
          <div style={{
            fontSize: '11.5px',
            color: 'var(--orange)',
            fontWeight: 'bold',
            marginTop: '8px',
            marginBottom: '4px',
            background: 'rgba(255, 107, 53, 0.08)',
            padding: '5px 12px',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            border: '1px solid rgba(255, 107, 53, 0.15)',
            width: '100%',
            justifyContent: 'center',
            boxSizing: 'border-box'
          }}>
            <Cpu size={14} />
            <span>{isRtl ? 'رصيد الذكاء الاصطناعي:' : 'AI Credits:'} {Math.round(userData.aiCredits)} {isRtl ? 'كريديت' : 'cr'}</span>
          </div>
        )}

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
          <LogOut size={16} />
          <span>{isRtl ? 'تسجيل الخروج' : 'Sign Out'}</span>
        </button>
      </div>
    </nav>
  );
}
