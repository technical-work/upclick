'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Briefcase, Globe, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import '../../index.css';

const LayoutContent = ({ children }) => {
  const { userData, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const isAr = i18n.language?.startsWith('ar');
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const navGroups = [
    {
      label: t('nav.adminCtrl'),
      items: [
        { path: '/admin?tab=stats', label: t('nav.statsPanel'), step: 1, roles: ['admin'] }
      ]
    },
    {
      label: t('nav.userMgmt'),
      items: [
        { path: '/admin?tab=users', label: t('nav.myUsersMgmt'), step: 2, roles: ['admin'] }
      ]
    },
    {
      label: t('nav.contentMgmt'),
      items: [
        { path: '/admin?tab=sales', label: t('nav.salesMgmt'), step: 1, roles: ['admin'] },
        { path: '/admin?tab=branding', label: t('nav.brandingSettings'), step: 2, roles: ['admin'] },
        { path: '/admin?tab=payments', label: t('nav.paymentSettings'), step: 3, roles: ['admin'] },
        { path: '/admin?tab=ai', label: i18n.language === 'ar' ? 'إعدادات الذكاء الاصطناعي' : 'AI Settings', step: 4, roles: ['admin'] }
      ]
    },
    {
      label: i18n.language === 'ar' ? 'الدعم الفني والشكاوى' : 'Support Tickets',
      items: [
        { path: '/admin?tab=support', label: i18n.language === 'ar' ? 'تذاكر الدعم' : 'Support Tickets', step: 1, roles: ['admin'] }
      ]
    }
  ];

  // Helper to check if a link is active including query params
  const isLinkActive = (path) => {
    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const currentFull = pathname + queryStr;
    if (path.includes('?')) {
      return currentFull === path;
    }
    return pathname === path;
  };

  return (
    <div className="admin-dashboard-theme" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <div className={`sidebar-overlay ${isMobileMenuOpen ? 'show' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '15px 14px', borderBottom: '1px solid var(--edge)', height: '85px', gap: '4px' }}>
          <div style={{
            height: '45px',
            width: '140px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src="/new-logo.png" 
              alt="UpKlick Admin" 
              style={{
                height: '150px',
                objectFit: 'contain',
                marginTop: '-5px'
              }}
            />
          </div>
          <span style={{ fontSize: '9px', color: '#9090b0', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
            إصدار المسؤولين · V2.0
          </span>
        </div>

        <div className="user-card">
          <div className="user-card-inner">
            <div className="user-avatar">
              {userData?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="user-info">
              <div className="user-name">{userData?.email?.split('@')[0] || 'Admin'}</div>
              <div className="user-meta">
                {t('dashboard.admin')}
              </div>
            </div>
          </div>
          <div className="user-badge amber">
            Admin
          </div>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '0 6px' }}>
          {navGroups.map((group, gIdx) => {
            const hasVisibleItems = group.items.some(item => item.roles.includes(userData?.role));
            if (!hasVisibleItems) return null;
            return (
              <div key={gIdx} className="nav-section">
                <div className="nav-label">{group.label}</div>
                {group.items.map((item) => (
                  item.roles.includes(userData?.role) && (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={isLinkActive(item.path) ? 'nav-item active' : 'nav-item'}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="nav-step">{item.step}</div>
                      <span>{item.label}</span>
                    </Link>
                  )
                ))}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={toggleLanguage} className="footer-btn">🌐 {i18n.language === 'ar' ? 'English' : 'عربي'}</button>
          <button onClick={handleLogout} className="footer-btn">{t('nav.logout')}</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={20} />
            </button>
            <div>
              <div className="topbar-title">
                {t('dashboard.adminPanel')}
              </div>
              <div className="topbar-subtitle">{t('dashboard.systemMonitoring')}</div>
            </div>
          </div>
          <div className="topbar-actions">
            <div className="topbar-chip active">
              <div className="api-dot active" style={{ width: '6px', height: '6px', background: 'var(--green)', borderRadius: '50%', display: 'inline-block', marginInlineEnd: '8px' }}></div>
              <span>{t('dashboard.systemRunning')}</span>
            </div>
          </div>
        </header>

        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
};

export default function DashboardLayout({ children }) {
  return (
    <Suspense fallback={<div style={{ padding: '40px', color: 'var(--text2)' }}>Loading layout...</div>}>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  );
}
