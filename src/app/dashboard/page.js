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
  const { currentPage, onboardingDone, mobileMenuOpen, setMobileMenuOpen } = useBusiness();
  const { user, userData, loading } = useAuth();
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
        return <WhatsAppHubView />;
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
