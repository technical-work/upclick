'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BusinessProvider, useBusiness } from '@/context/BusinessContext';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';

// Core layout components
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import AIPanel from '@/components/AIPanel';
import Onboarding from '@/components/Onboarding';
import ActiveSessionTracker from '@/components/ActiveSessionTracker';

// Modals
import LeadModal from '@/components/Modals/LeadModal';
import TaskModal from '@/components/Modals/TaskModal';
import FinanceModal from '@/components/Modals/FinanceModal';
import LandingPagePreviewModal from '@/components/Modals/LandingPagePreviewModal';
import DigitalProductDetailModal from '@/components/Modals/DigitalProductDetailModal';
import SocialConnectModal from '@/components/Modals/SocialConnectModal';
import UpgradeToolModal from '@/components/Modals/UpgradeToolModal';

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
import CoursesView from '@/components/Views/CoursesView';
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
import BillingView from '@/components/Views/BillingView';
import SupportView from '@/components/Views/SupportView';
import SitesView from '@/components/Views/SitesView';
import DomainsView from '@/components/Views/DomainsView';
function DashboardShell() {
  const { currentPage, setCurrentPage, onboardingDone, mobileMenuOpen, setMobileMenuOpen, tenantConfig, lang, theme, lockedToolModal, closeUpgradeModal } = useBusiness();
  const { user, userData, loading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifyingStripe, setVerifyingStripe] = useState(false);

  const stripeStatus = searchParams?.get('stripe');
  const stripeKind = searchParams?.get('kind');
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
          if (stripeKind === 'domain' || data.kind === 'domain') {
            if (typeof window !== 'undefined') {
              localStorage.setItem('upklick_current_page', 'my-domains');
            }
            if (data.success === false && data.error) {
              alert(lang === 'ar'
                ? `تم استلام الدفع لكن التسجيل لم يكتمل: ${data.error}`
                : `Payment received, but registration is pending: ${data.error}`
              );
            } else {
              alert(lang === 'ar'
                ? 'تم دفع النطاق بنجاح. سيظهر في «نطاقاتي» بعد إتمام التسجيل.'
                : 'Domain payment confirmed. It will appear under My Domains once registration finishes.'
              );
            }
            window.location.href = '/dashboard';
            return;
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
  }, [stripeStatus, stripeKind, sessionId, user?.uid, userData?.adminId, lang]);

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

  // Email Verification Lock Screen
  if (user && !user.emailVerified) {
    return (
      <EmailVerificationLock user={user} lang={lang} logout={logout} />
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
                    src={tenantConfig?.logoUrl || (theme === 'light' ? "/best_logo_light.png" : "/best_logo_dark.png")}
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
                  src={tenantConfig?.logoUrl || (theme === 'light' ? "/best_logo_light.png" : "/best_logo_dark.png")}
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
    const isAllowed = !allowedTools || allowedTools.includes(currentPage) || ['home', 'profile', 'billing', 'support', 'courses', 'sites', 'domains', 'my-domains', 'domain-pricing', 'domain-settings'].includes(currentPage);
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
      case 'courses':
        return <CoursesView />;
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
      case 'billing':
        return <BillingView />;
      case 'support':
        return <SupportView />;
      case 'sites':
        return <SitesView />;
      case 'domains':
      case 'my-domains':
      case 'domain-pricing':
      case 'domain-settings':
        return <DomainsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <>
      <ActiveSessionTracker />
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
      <SocialConnectModal />

      {lockedToolModal?.isOpen && (
        <UpgradeToolModal
          toolInfo={lockedToolModal.toolInfo}
          targetPlans={lockedToolModal.targetPlans}
          onClose={closeUpgradeModal}
          onSelectPlan={() => {
            setCurrentPage('billing');
          }}
        />
      )}

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

function EmailVerificationLock({ user, lang, logout }) {
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setResendMessage(lang === 'ar' ? '⚠️ يرجى إدخال رمز مكوّن من 6 أرقام' : '⚠️ Please enter 6-digit code');
      return;
    }
    setVerifyLoading(true);
    setResendMessage('');
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: auth.currentUser?.email, uid: auth.currentUser?.uid, code: otpCode.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResendMessage(lang === 'ar' ? '🎉 تم تفعيل الحساب بنجاح!' : '🎉 Account verified successfully!');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setResendMessage(`❌ ${data.error || 'رمز غير صحيح'}`);
      }
    } catch (err) {
      console.error(err);
      setResendMessage(lang === 'ar' ? '❌ حدث خطأ أثناء تفعيل الرمز' : '❌ Verification error');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleCheck = async () => {
    setStatusLoading(true);
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          window.location.reload();
        } else {
          alert(lang === 'ar'
            ? 'لم يتم تفعيل الحساب بعد. يرجى إدخال رمز التحقق المكون من 6 أرقام.'
            : 'Email not verified yet. Please enter the 6-digit verification code.'
          );
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage('');
    try {
      if (auth.currentUser) {
        const res = await fetch('/api/auth/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: auth.currentUser.email, name: user?.displayName || '', uid: auth.currentUser.uid })
        });
        if (res.ok) {
          setResendMessage(lang === 'ar' ? '✅ تم إرسال رمز التحقق بنجاح!' : '✅ Code sent successfully!');
        } else {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed');
        }
      }
    } catch (err) {
      console.error(err);
      setResendMessage(lang === 'ar'
        ? '❌ فشل إرسال الرمز. يرجى المحاولة لاحقاً.'
        : '❌ Failed to send code. Please try again later.'
      );
    } finally {
      setResendLoading(false);
    }
  };

  const isAr = lang === 'ar';

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#08080f',
      backgroundImage: 'radial-gradient(circle at top right, rgba(255, 107, 53, 0.07), transparent 45%), radial-gradient(circle at bottom left, rgba(108, 53, 255, 0.07), transparent 45%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: isAr ? '"IBM Plex Sans Arabic", sans-serif' : '"DM Sans", sans-serif',
      padding: '24px',
      boxSizing: 'border-box',
      color: '#fff',
      direction: isAr ? 'rtl' : 'ltr'
    }}>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
        .glowing-circle {
          animation: pulse 3s infinite ease-in-out;
        }
        .btn-glow-verify:hover {
          box-shadow: 0 0 20px rgba(108, 53, 255, 0.5) !important;
          transform: translateY(-1px);
        }
        .btn-verify-ghost:hover {
          background: rgba(255, 255, 255, 0.05) !important;
        }
      `}</style>

      <div style={{
        maxWidth: '460px',
        width: '100%',
        background: 'rgba(15, 15, 25, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '40px 32px',
        textAlign: 'center',
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Glow Envelope Icon */}
        <div className="glowing-circle" style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.15), rgba(108, 53, 255, 0.15))',
          border: '1px solid rgba(108, 53, 255, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '32px'
        }}>
          📧
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '22px',
          fontWeight: '800',
          marginBottom: '16px',
          background: 'linear-gradient(90deg, #FF6B35, #6C35FF)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: '#fff'
        }}>
          {isAr ? 'تفعيل الحساب مطلوب' : 'Verify Your Email'}
        </h2>

        {/* Description */}
        <p style={{
          color: '#9090b0',
          fontSize: '14px',
          lineHeight: '1.7',
          marginBottom: '20px'
        }}>
          {isAr ? (
            <>
              أرسلنا رمز التفعيل المكون من 6 أرقام إلى بريدك الإلكتروني <strong>{user?.email}</strong> عبر <strong>Resend</strong>.
            </>
          ) : (
            <>
              We sent a 6-digit verification code to <strong>{user?.email}</strong> via <strong>Resend</strong>.
            </>
          )}
        </p>

        {/* Response message */}
        {resendMessage && (
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: (resendMessage.includes('✅') || resendMessage.includes('🎉')) ? '#00ff88' : '#ff4d4d',
            backgroundColor: (resendMessage.includes('✅') || resendMessage.includes('🎉')) ? 'rgba(0, 255, 136, 0.08)' : 'rgba(255, 77, 77, 0.08)',
            padding: '10px 14px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: `1px solid ${(resendMessage.includes('✅') || resendMessage.includes('🎉')) ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 77, 77, 0.15)'}`
          }}>
            {resendMessage}
          </div>
        )}

        {/* OTP Form */}
        <form onSubmit={handleVerifyOtp} style={{ width: '100%', marginBottom: '20px' }}>
          <div style={{ marginBottom: '14px' }}>
            <input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="123456"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: '1.5px solid rgba(108, 53, 255, 0.4)',
                backgroundColor: 'rgba(10, 10, 18, 0.8)',
                color: '#FF6B35',
                fontSize: '24px',
                fontWeight: '800',
                letterSpacing: '8px',
                textAlign: 'center',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              dir="ltr"
            />
          </div>
          <button
            type="submit"
            disabled={verifyLoading || otpCode.length !== 6}
            className="btn-glow-verify"
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #FF6B35, #6C35FF)',
              color: '#fff',
              fontWeight: '700',
              fontSize: '14.5px',
              cursor: (verifyLoading || otpCode.length !== 6) ? 'not-allowed' : 'pointer',
              opacity: (verifyLoading || otpCode.length !== 6) ? 0.6 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {verifyLoading ? (isAr ? 'جاري التحقق...' : 'Verifying...') : (isAr ? 'تأكيد الرمز والتفعيل ✨' : 'Confirm Code & Verify')}
          </button>
        </form>

        {/* Secondary Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="btn-verify-ghost"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'transparent',
              color: '#fff',
              fontWeight: '600',
              fontSize: '13.5px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {resendLoading ? '...' : (isAr ? 'إعادة إرسال رابط التفعيل' : 'Resend Verification Link')}
          </button>

          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: 'transparent',
              color: '#9090b0',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              textDecoration: 'underline',
              marginTop: '8px'
            }}
          >
            {isAr ? 'تسجيل الخروج والعودة' : 'Sign Out / Switch Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
