'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BusinessProvider, useBusiness } from '@/context/BusinessContext';
import { useAuth } from '@/context/AuthContext';

// Core layout components
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import AIPanel from '@/components/AIPanel';
import SupportWidget from '@/components/SupportWidget';
import Onboarding from '@/components/Onboarding';

// Modals
import LeadModal from '@/components/Modals/LeadModal';
import TaskModal from '@/components/Modals/TaskModal';
import FinanceModal from '@/components/Modals/FinanceModal';
import LandingPagePreviewModal from '@/components/Modals/LandingPagePreviewModal';
import DigitalProductDetailModal from '@/components/Modals/DigitalProductDetailModal';

// Sub-views
import HomeView from '@/components/Views/HomeView';
import CRMView from '@/components/Views/CRMView';
import WhatsAppHubView from '@/components/Views/WhatsAppHubView';
import TelegramHubView from '@/components/Views/TelegramHubView';
import LandingPageView from '@/components/Views/LandingPageView';
import MarketingView from '@/components/Views/MarketingView';
import TaskBoardView from '@/components/Views/TaskBoardView';
import FinanceView from '@/components/Views/FinanceView';
import StrategyView from '@/components/Views/StrategyView';
import DigitalProductsView from '@/components/Views/DigitalProductsView';
import RevenueView from '@/components/Views/RevenueView';
import LaunchpadView from '@/components/Views/LaunchpadView';
import AIGrowthIntelView from '@/components/Views/AIGrowthIntelView';
import SocialTrendsView from '@/components/Views/SocialTrendsView';
import ContentView from '@/components/Views/ContentView';
import SocialAccountsView from '@/components/Views/SocialAccountsView';
import BioLinkView from '@/components/Views/BioLinkView';
import CalendarView from '@/components/Views/CalendarView';
import OpsHubView from '@/components/Views/OpsHubView';
import CommunityHubView from '@/components/Views/CommunityHubView';
import AnalyticsView from '@/components/Views/AnalyticsView';
import IntegrationsView from '@/components/Views/IntegrationsView';
import ProfileView from '@/components/Views/ProfileView';
import UpClickBuilderView from '@/components/Views/UpClickBuilderView';
import AutomationHubView from '@/components/Views/AutomationHubView';
import TeamManagementView from '@/components/Views/TeamManagementView';
import TeamChatView from '@/components/Views/TeamChatView';
import NicheStudioView from '@/components/Views/NicheStudioView';
import DesignStudioView from '@/components/Views/DesignStudioView';
function DashboardShell() {
  const { currentPage, onboardingDone, mobileMenuOpen, setMobileMenuOpen, tenantConfig, lang } = useBusiness();
  const { user, userData, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && userData) {
      if (userData.role === 'admin' || userData.role === 'super_admin') {
        router.push('/admin');
      }
    }
  }, [user, userData, loading, router]);

  useEffect(() => {
    document.body.classList.add('dashboard-body');
    return () => document.body.classList.remove('dashboard-body');
  }, []);

  if (loading || !user || !userData || userData.role === 'admin' || userData.role === 'super_admin') return null; // Show nothing or a spinner until redirected

  const getMs = (val) => {
    if (!val) return 0;
    if (typeof val === 'string') return new Date(val).getTime();
    if (typeof val === 'number') return val;
    if (val.toDate) return val.toDate().getTime();
    if (val.seconds) return val.seconds * 1000;
    return 0;
  };

  const isTrialExpired = () => {
    if (!userData?.isTrial || !userData?.trialStartedAt) return false;
    const trialDays = tenantConfig?.freeTrial?.days || 7;
    const startMs = getMs(userData.trialStartedAt);
    if (!startMs) return false;
    const expiresMs = startMs + trialDays * 86400000;
    return Date.now() > expiresMs;
  };

  const isSubscriptionExpired = () => {
    if (!userData?.expiresAt) return false;
    const expiresMs = getMs(userData.expiresAt);
    if (!expiresMs) return false;
    return Date.now() > expiresMs;
  };

  const isExpired = isTrialExpired() || isSubscriptionExpired();

  if (isExpired) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0a0a0f',
        backgroundImage: 'radial-gradient(circle at top right, rgba(255, 107, 53, 0.08), transparent 40%), radial-gradient(circle at bottom left, rgba(108, 53, 255, 0.08), transparent 40%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"IBM Plex Sans Arabic", "DM Sans", sans-serif',
        zIndex: 999999,
        padding: '20px'
      }}>
        {/* Blocker Card */}
        <div style={{
          backgroundColor: '#12121e',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          padding: '40px 32px',
          maxWidth: '440px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
          direction: lang === 'ar' ? 'rtl' : 'ltr'
        }}>
          {/* Clock Icon */}
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '24px' }}>
            <circle cx="12" cy="13" r="8" />
            <path d="M12 9v4l2 2" />
            <path d="M5 3L2 6" />
            <path d="M19 3l3 3" />
            <path d="M6.3 19.8l-1.3 1.3" />
            <path d="M17.7 19.8l1.3 1.3" />
          </svg>

          {/* Title */}
          <h2 style={{
            fontSize: '22px',
            fontWeight: '800',
            color: '#ffffff',
            margin: '0 0 12px 0',
            lineHeight: '1.4'
          }}>
            {isTrialExpired() 
              ? (lang === 'ar' ? 'انتهت فترة التجربة المجانية' : 'Free Trial Expired') 
              : (lang === 'ar' ? 'انتهت صلاحية اشتراكك' : 'Subscription Expired')
            }
          </h2>

          {/* Description */}
          <p style={{
            fontSize: '14.5px',
            lineHeight: '1.6',
            color: '#a0a0c0',
            margin: '0 0 32px 0'
          }}>
            {isTrialExpired()
              ? (lang === 'ar' 
                  ? `انتهت فترة التجربة المجانية في ${tenantConfig?.appName || 'UpKlick'}. للاستمرار في الاستخدام تواصل معنا على الواتساب وسنقوم بتفعيل حسابك خلال دقائق.`
                  : `Your free trial in ${tenantConfig?.appName || 'UpKlick'} has expired. To continue using the service, please contact us on WhatsApp and we will activate your account within minutes.`
                )
              : (lang === 'ar'
                  ? `انتهت صلاحية اشتراكك في ${tenantConfig?.appName || 'UpKlick'}. للاستمرار في الاستخدام تواصل معنا على الواتساب وسنقوم بتجديد حسابك خلال دقائق.`
                  : `Your subscription in ${tenantConfig?.appName || 'UpKlick'} has expired. To continue using the service, please contact us on WhatsApp and we will renew your account within minutes.`
                )
            }
          </p>

          {/* WhatsApp Support CTA */}
          <a 
            href={`https://wa.me/${tenantConfig?.whatsappNumber || '201000000000'}`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              background: '#25D366',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '14px 28px',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '15px',
              textDecoration: 'none',
              width: '100%',
              marginBottom: '20px',
              boxShadow: '0 8px 24px rgba(37, 211, 102, 0.25)',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: lang === 'ar' ? '0' : '8px', marginLeft: lang === 'ar' ? '8px' : '0' }}>
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 1.977 14.053.953 11.428.953c-5.44 0-9.866 4.372-9.87 9.802 0 1.634.459 3.234 1.33 4.646L1.87 20.893l5.592-1.443.185-.096zm12.012-7.39c-.198-.1-.177-.167-.775-.466-.299-.149-1.764-.868-2.039-.967-.276-.099-.477-.149-.676.15-.199.299-.773.967-.948 1.165-.175.199-.349.224-.648.075-.3-.15-1.266-.466-2.41-1.484-.89-.794-1.49-1.773-1.665-2.072-.174-.3-.019-.462.13-.61.135-.133.3-.349.449-.523.149-.174.199-.299.299-.498.099-.2.049-.374-.025-.523-.075-.15-.676-1.63-.925-2.228-.243-.582-.488-.504-.676-.513-.175-.008-.374-.01-.573-.01-.199 0-.523.075-.797.373-.274.299-1.045 1.022-1.045 2.49 0 1.47 1.07 2.888 1.219 3.087.149.199 2.106 3.216 5.102 4.51.713.308 1.27.492 1.704.63.717.227 1.37.195 1.886.118.575-.086 1.765-.722 2.013-1.42.249-.697.249-1.295.174-1.42-.075-.125-.274-.224-.473-.323z"/>
            </svg>
            <span>{lang === 'ar' ? 'تواصل معنا على واتساب' : 'Contact us on WhatsApp'}</span>
          </a>

          {/* Logout Button */}
          <button 
            onClick={() => logout()}
            style={{
              background: 'none',
              border: 'none',
              color: '#9090b0',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: '8px',
              transition: 'color 0.2s'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: lang === 'ar' ? '0' : '6px', marginLeft: lang === 'ar' ? '6px' : '0' }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Log Out'}</span>
          </button>
        </div>
      </div>
    );
  }



  const renderActiveView = () => {
    const allowedTools = userData?.allowedTools;
    const isAllowed = !allowedTools || allowedTools.includes(currentPage) || ['home', 'profile'].includes(currentPage);
    const activeView = isAllowed ? currentPage : 'home';

    switch (activeView) {
      case 'home':
        return <HomeView />;
      case 'crm':
        return <CRMView />;
      case 'whatsapp':
        return <TelegramHubView />;
      case 'landing':
        return <LandingPageView />;
      case 'marketing':
        return <MarketingView />;
      case 'tasks':
        return <TaskBoardView />;
      case 'finance':
        return <FinanceView />;
      case 'strategy':
        return <StrategyView />;
      case 'digital':
        return <DigitalProductsView />;
      case 'revenue':
        return <RevenueView />;
      case 'launchpad':
        return <LaunchpadView />;
      case 'ai-growth':
        return <AIGrowthIntelView />;
      case 'tiktok-trends':
        return <SocialTrendsView />;
      case 'content':
        return <ContentView />;
      case 'social':
        return <SocialAccountsView />;
      case 'bio':
        return <BioLinkView />;
      case 'calendar':
        return <CalendarView />;
      case 'ops':
        return <OpsHubView />;
      case 'community':
        return <CommunityHubView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'integrations':
        return <IntegrationsView />;
      case 'profile':
        return <ProfileView />;
      case 'upclick':
        return <UpClickBuilderView />;
      case 'automation':
        return <AutomationHubView />;
      case 'team':
        return <TeamManagementView />;
      case 'teamchat':
        return <TeamChatView />;
      case 'niche':
        return <NicheStudioView />;
      case 'design':
        return <DesignStudioView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <>
      {/* Ambient background particles/glows for premium dark styling */}
      <div className="ambient">
        <div className="ambient-orb ao1"></div>
        <div className="ambient-orb ao2"></div>
        <div className="ambient-orb ao3"></div>
      </div>

      <Sidebar />
      {mobileMenuOpen && (
        <div className="sb-overlay" onClick={() => setMobileMenuOpen(false)}></div>
      )}
      
      <div id="mn">
        <Topbar />
        <div id="ct">
          {renderActiveView()}
        </div>
      </div>

      <AIPanel />
      <SupportWidget />

      {/* Setup wizard onboarding overlay */}
      {!onboardingDone && <Onboarding />}

      {/* Modals & Dialogs */}
      <LeadModal />
      <TaskModal />
      <FinanceModal />
      <LandingPagePreviewModal />
      <DigitalProductDetailModal />

      {/* Toast popup message holder */}
      <div id="toast" className="toast"></div>
    </>
  );
}

export default function Home() {
  return (
    <BusinessProvider>
      <DashboardShell />
    </BusinessProvider>
  );
}
