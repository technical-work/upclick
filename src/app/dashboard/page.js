'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BusinessProvider, useBusiness } from '@/context/BusinessContext';
import { useAuth } from '@/context/AuthContext';

// Core layout components
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import AIPanel from '@/components/AIPanel';
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
import NicheStudioView from '@/components/Views/NicheStudioView';
import DesignStudioView from '@/components/Views/DesignStudioView';
import ModelTestView from '@/components/Views/ModelTestView';
import BillingView from '@/components/Views/BillingView';
import SupportView from '@/components/Views/SupportView';
function DashboardShell() {
  const { currentPage, onboardingDone, mobileMenuOpen, setMobileMenuOpen, tenantConfig, lang } = useBusiness();
  const { user, userData, loading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifyingStripe, setVerifyingStripe] = useState(false);

  const stripeStatus = searchParams?.get('stripe');
  const sessionId = searchParams?.get('session_id');

  useEffect(() => {
    if (stripeStatus === 'success' && sessionId && user?.uid) {
      setVerifyingStripe(true);
      const adminId = userData?.adminId || '';
      
      fetch(`/api/stripe/verify-session?session_id=${sessionId}&adminId=${adminId}`)
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Failed to verify session');
          }
          alert(lang === 'ar' 
            ? 'تم تفعيل الاشتراك بنجاح! شكراً لك.' 
            : 'Your subscription has been successfully activated! Thank you.'
          );
          window.location.href = '/dashboard';
        })
        .catch((err) => {
          console.error(err);
          alert(lang === 'ar'
            ? `فشل تفعيل الاشتراك تلقائياً: ${err.message}. يرجى مراجعة الدعم.`
            : `Failed to verify payment: ${err.message}. Please contact support.`
          );
          window.location.href = '/dashboard';
        })
        .finally(() => {
          setVerifyingStripe(false);
        });
    }
  }, [stripeStatus, sessionId, user?.uid, userData?.adminId, lang]);

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

  if (verifyingStripe) {
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
        padding: '20px',
        flexDirection: 'column',
        gap: '16px',
        color: '#fff',
        textAlign: 'center'
      }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,107,53,0.3)', borderTopColor: '#FF6B35', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
          {lang === 'ar' ? 'جاري التحقق من عملية الدفع...' : 'Verifying your payment...'}
        </h3>
        <p style={{ color: 'var(--t2)', fontSize: '13px', margin: 0 }}>
          {lang === 'ar' ? 'يرجى عدم إغلاق أو تحديث هذه الصفحة.' : 'Please do not close or refresh this page.'}
        </p>
      </div>
    );
  }

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

  const isExpired = userData?.expiresAt ? isSubscriptionExpired() : isTrialExpired();

  if (isExpired) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0f',
        backgroundImage: 'radial-gradient(circle at top right, rgba(255, 107, 53, 0.08), transparent 40%), radial-gradient(circle at bottom left, rgba(108, 53, 255, 0.08), transparent 40%)',
        fontFamily: '"IBM Plex Sans Arabic", "DM Sans", sans-serif',
      }}>
        {/* Minimal restricted Topbar/Header */}
        <div style={{
          background: 'var(--surface2)',
          borderBottom: '1px solid var(--brd)',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {(() => {
              const isDefaultLogo = !tenantConfig?.logoUrl;
              return isDefaultLogo ? (
                <div style={{
                  height: '45px',
                  width: '120px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={tenantConfig?.logoUrl || "/new-logo.png"} 
                    alt={tenantConfig?.appName || "UpKlick Logo"} 
                    style={{
                      height: '120px',
                      objectFit: 'contain',
                      marginTop: '-5px'
                    }}
                  />
                </div>
              ) : (
                <img 
                  src={tenantConfig?.logoUrl || "/new-logo.png"} 
                  alt={tenantConfig?.appName || "UpKlick Logo"} 
                  style={{ maxHeight: '30px', objectFit: 'contain' }}
                />
              );
            })()}
            <span style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--red)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '6px',
              fontWeight: '700'
            }}>
              {lang === 'ar' ? 'منتهي الصلاحية - وضع مقيد' : 'Expired - Restricted Mode'}
            </span>
          </div>
          
          <button 
            onClick={() => logout()}
            className="btn btn-ghost"
            style={{
              color: 'var(--red)',
              borderColor: 'rgba(255, 61, 110, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12.5px',
              padding: '6px 12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <span>⎋</span>
            <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}</span>
          </button>
        </div>

        {/* Restricted content area containing only BillingView */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '24px',
          animation: 'fadeSlide 0.4s ease'
        }}>
          {/* A callout explaining the situation */}
          <div className="card mb" style={{ borderColor: 'rgba(239, 68, 68, 0.2)', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.04) 0%, rgba(8, 12, 20, 0.2) 100%)', display: 'flex', gap: '14px', alignItems: 'center', padding: '16px' }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <div style={{ textAlign: 'start' }}>
              <h4 style={{ margin: 0, color: 'var(--t1)', fontSize: '14px', fontWeight: '700' }}>
                {isTrialExpired() 
                  ? (lang === 'ar' ? 'انتهت فترة التجربة المجانية' : 'Free Trial Expired') 
                  : (lang === 'ar' ? 'انتهت صلاحية اشتراكك' : 'Subscription Expired')
                }
              </h4>
              <p style={{ margin: '4px 0 0', color: 'var(--t2)', fontSize: '12.5px', lineHeight: '1.5' }}>
                {isTrialExpired()
                  ? (lang === 'ar' 
                      ? `انتهت فترة التجربة المجانية في ${tenantConfig?.appName || 'UpKlick'}. للاستمرار في الاستخدام يرجى تجديد اشتراكك بالأسفل وإرسال إثبات الدفع، أو الدعم الفني.`
                      : `Your free trial in ${tenantConfig?.appName || 'UpKlick'} has expired. To continue using the service, please renew your subscription below and submit payment proof.`
                    )
                  : (lang === 'ar'
                      ? `انتهت صلاحية اشتراكك في ${tenantConfig?.appName || 'UpKlick'}. للاستمرار في الاستخدام يرجى تجديد اشتراكك بالأسفل وإرسال إثبات الدفع، أو الدعم الفني.`
                      : `Your subscription in ${tenantConfig?.appName || 'UpKlick'} has expired. To continue using the service, please renew your subscription below and submit payment proof.`
                    )
                }
              </p>
            </div>
          </div>

          <BillingView />
        </div>
      </div>
    );
  }



  const renderActiveView = () => {
    const allowedTools = userData?.allowedTools;
    const isAllowed = !allowedTools || allowedTools.includes(currentPage) || ['home', 'profile', 'model-test', 'billing', 'support'].includes(currentPage);
    const activeView = isAllowed ? currentPage : 'home';

    switch (activeView) {
      case 'home':
        return <HomeView />;
      case 'crm':
        return <CRMView />;
      case 'telegram':
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
      case 'niche':
        return <NicheStudioView />;
      case 'design':
        return <DesignStudioView />;
      case 'model-test':
        return <ModelTestView />;
      case 'billing':
        return <BillingView />;
      case 'support':
        return <SupportView />;
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
      <Suspense fallback={
        <div style={{ display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', background: '#08080f', color: '#8275A3' }}>
          Loading dashboard...
        </div>
      }>
        <DashboardShell />
      </Suspense>
    </BusinessProvider>
  );
}
