import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Globe } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useTranslation } from 'react-i18next';

const DashboardLayout = () => {
  const { userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

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
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const navGroups = [
    {
      label: t('nav.adminCtrl'),
      items: [
        { path: '/admin?tab=stats', label: t('nav.statsPanel'), step: 1, roles: ['admin', 'super_admin'] }
      ]
    },
    {
      label: t('nav.userMgmt'),
      items: [
        { path: '/super-admin?tab=users_managers', label: t('nav.managersMgmt'), step: 1, roles: ['super_admin', 'employee'] },
        { path: '/super-admin?tab=users_clients', label: t('nav.clientsMgmt'), step: 2, roles: ['super_admin', 'employee'] },
        { path: '/super-admin?tab=users_team', label: t('nav.teamMgmt'), step: 3, roles: ['super_admin', 'employee'] },
        { path: '/admin?tab=users', label: t('nav.myUsersMgmt'), step: 2, roles: ['admin'] }
      ]
    },
    {
      label: t('nav.contentMgmt'),
      items: [
        { path: '/super-admin?tab=library', label: t('nav.libraryMgmt'), step: 1, roles: ['super_admin', 'employee'] },
        { path: '/super-admin?tab=templates', label: t('nav.templatesMgmt'), step: 2, roles: ['super_admin', 'employee'] },

        { path: '/admin?tab=sales', label: t('nav.salesMgmt'), step: 1, roles: ['admin'] },
        { path: '/admin?tab=branding', label: t('nav.brandingSettings'), step: 2, roles: ['admin'] },
        { path: '/admin?tab=payments', label: t('nav.paymentSettings'), step: 3, roles: ['admin'] },
      ]
    }
  ];

  // Helper to check if a link is active including query params
  const isLinkActive = (path) => {
    const currentFull = location.pathname + location.search;
    if (path.includes('?')) {
      return currentFull === path;
    }
    return location.pathname === path;
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg viewBox="0 0 24 24" style={{ width: '17px', height: '17px', fill: 'none', stroke: '#fff', strokeWidth: '2.5', strokeLinecap: 'round', strokeLinejoin: 'round' }}>
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1>GigSniper Pro</h1>
            <span>إصدار المسؤولين · V2.0</span>
          </div>
        </div>

        <div className="user-card">
          <div className="user-card-inner">
            <div className="user-avatar">
              {userData?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <div className="user-name">{userData?.email?.split('@')[0]}</div>
              <div className="user-meta">
                {userData?.role === 'super_admin' ? t('dashboard.superAdmin') : userData?.role === 'employee' ? 'موظف' : t('dashboard.admin')}
              </div>
            </div>
          </div>
          <div className={`user-badge ${userData?.role === 'super_admin' ? 'blue' : userData?.role === 'employee' ? 'purple' : 'amber'}`}>
            {userData?.role === 'super_admin' ? 'Super Admin' : userData?.role === 'employee' ? 'Employee' : 'Admin'}
          </div>
        </div>

        {/* Sidebar progress removed as requested (static data) */}

        <nav style={{ flex: 1, overflowY: 'auto', padding: '0 6px' }}>
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="nav-section">
              <div className="nav-label">{group.label}</div>
              {group.items.map((item, iIdx) => (
                item.roles.includes(userData?.role) && (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={() => isLinkActive(item.path) ? 'nav-item active' : 'nav-item'}
                  >
                    <div className="nav-step">{item.step}</div>
                    <span>{item.label}</span>
                  </NavLink>
                )
              ))}
            </div>
          ))}

        </nav>

        <div className="sidebar-footer">
          <button onClick={toggleLanguage} className="footer-btn">🌐 {i18n.language === 'ar' ? 'English' : 'عربي'}</button>
          <button onClick={handleLogout} className="footer-btn">{t('nav.logout')}</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="topbar-title">
              {userData?.role === 'super_admin' ? t('dashboard.superAdminCenter') : userData?.role === 'employee' ? 'لوحة الموظفين' : t('dashboard.adminPanel')}
            </div>
            <div className="topbar-subtitle">{t('dashboard.systemMonitoring')}</div>
          </div>
          <div className="topbar-actions">
            <div className="topbar-chip active">
              <div className="api-dot active" style={{ width: '6px', height: '6px', background: 'var(--green)', borderRadius: '50%', display: 'inline-block', marginInlineEnd: '8px' }}></div>
              <span>{t('dashboard.systemRunning')}</span>
            </div>
          </div>
        </header>

        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
