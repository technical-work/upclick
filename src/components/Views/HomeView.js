'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { useAuth } from '../../context/AuthContext';
import { callClaudeAPI } from '../../utils/ai';
import { parseMarkdown } from '../../utils/markdown';

export default function HomeView() {
  const {
    lang,
    L,
    t,
    GC,
    setCurrentPage,
    formatMoney,
    setLeadModalOpen,
    setTaskModalOpen,
    setFinanceModalOpen,
    setFinanceModalType,
    setAiPanelOpen,
    toggleTask,
    theme,
    showToast,
    setSocialConnectModalOpen,
    setActiveWorkspace,
    setCrmActiveTab
  } = useBusiness();
  const { user, userData } = useAuth();

  const [chartPeriod, setChartPeriod] = useState('7d');
  const [dailyBrief, setDailyBrief] = useState('');
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefStreaming, setBriefStreaming] = useState(false);
  const latestLangRef = useRef(lang);
  const isBriefFetchingRef = useRef(false);

  const monthlyIncome = GC.finance.entries
    .filter(e => e.type === 'income')
    .reduce((a, b) => a + b.amount, 0);

  const monthlyExpenses = GC.finance.entries
    .filter(e => e.type === 'expense')
    .reduce((a, b) => a + b.amount, 0);

  const allLeads = GC.crm?.workspaces 
    ? GC.crm.workspaces.flatMap(w => (w.leads || []).map(l => ({ ...l, workspaceId: w.id })))
    : (GC.crm?.leads || []).map(l => ({ ...l, workspaceId: 'default' }));

  const activeDeals = allLeads.filter(l => l.stage !== 'won' && l.stage !== 'lost' && l.stage !== 'closed').length;
  const openTasks = GC.tasks.items.filter(t => !t.done).length;

  // Revenue Diversity Score Aggregations (Sponsorships, Digital Products, Courses)
  const crmClosedRevenue = allLeads
    .filter(l => l.stage === 'close' || l.stage === 'won' || l.stage === 'complete' || l.stage === 'done')
    .reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);

  const productsList = GC.digitalProducts?.products || [];
  const productsRevenue = productsList.reduce((sum, p) => sum + (parseFloat(p.revenue) || 0), 0);

  const coursesList = GC.revenue?.courses || [];
  const coursesRevenue = coursesList.reduce((sum, c) => sum + (parseFloat(c.revenue) || 0), 0);

  const totalRevenueVal = crmClosedRevenue + productsRevenue + coursesRevenue;

  const streams = [
    { name: L('Sponsorships', 'الرعايات'), val: crmClosedRevenue, c: 'var(--a)' },
    { name: L('Digital Products', 'المنتجات الرقمية'), val: productsRevenue, c: 'var(--a2)' },
    { name: L('Courses', 'الكورسات'), val: coursesRevenue, c: 'var(--a3)' }
  ];

  const sortedStreams = [...streams].sort((a, b) => b.val - a.val);
  const bestStream = totalRevenueVal > 0 ? sortedStreams[0].name : L('None', 'لا يوجد');
  const bestStreamPct = totalRevenueVal > 0 ? Math.round((sortedStreams[0].val / totalRevenueVal) * 100) : 0;

  const calculateDiversityScore = () => {
    if (totalRevenueVal <= 0) return 0;
    const activeCount = streams.filter(s => s.val > 0).length;
    let hhi = 0;
    streams.forEach(s => {
      if (s.val > 0) {
        const pct = s.val / totalRevenueVal;
        hhi += pct * pct;
      }
    });
    const score = Math.round((1 - hhi) * 100 + (activeCount * 5));
    return Math.min(Math.max(score, 10), 100);
  };

  const diversityScore = calculateDiversityScore();

  const getSvgCircles = () => {
    let accumulatedPercent = 0;
    return streams.map(s => {
      const pct = totalRevenueVal > 0 ? Math.round((s.val / totalRevenueVal) * 100) : 0;
      if (pct <= 0) return null;
      const strokeDasharray = `${pct} ${100 - pct}`;
      const strokeDashoffset = -accumulatedPercent;
      accumulatedPercent += pct;
      return {
        strokeDasharray,
        strokeDashoffset,
        color: s.c
      };
    }).filter(Boolean);
  };
  const svgCircles = getSvgCircles();

  // Calculate dynamic follower counts based on connected profiles
  const formatFollowersCount = (val) => {
    if (!val || isNaN(val)) return '0';
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
    return String(val);
  };
  const dynamicFollowers = formatFollowersCount(GC.socialAccounts?.followers?.total || 0);
  const hasFollowers = (GC.socialAccounts?.followers?.total || 0) > 0;
  const dynamicFollowerGrowth = hasFollowers ? '+1.8%' : '0%';

  // Dynamically group chart bars using user transactions
  const getChartData = () => {
    const entries = GC.finance.entries || [];
    const now = new Date();
    const hasRealEntries = entries.length > 0;
    
    if (chartPeriod === '7d') {
      if (!hasRealEntries) {
        return [[55, 40], [62, 50], [58, 45], [70, 60], [65, 55], [78, 68], [82, 72]];
      }
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(now.getDate() - (6 - i));
        return d.toDateString();
      });
      const target = Math.max((monthlyIncome + 1000) / 7, 500);
      return days.map(dayStr => {
        const dailyIncome = entries
          .filter(e => e.type === 'income' && new Date(e.date || e.timestamp).toDateString() === dayStr)
          .reduce((sum, e) => sum + e.amount, 0);
        return [dailyIncome, target];
      });
    } else {
      if (!hasRealEntries) {
        return [[30, 20], [35, 25], [40, 30], [38, 28], [42, 35], [45, 38], [40, 32], [48, 42], [52, 45], [50, 40], [55, 48], [60, 52], [58, 50], [65, 55], [62, 48]];
      }
      const periods = Array.from({ length: 15 }, (_, i) => {
        const d = new Date();
        d.setDate(now.getDate() - (14 - i) * 2);
        return d.toDateString();
      });
      const target = Math.max((monthlyIncome + 1000) / 15, 1000);
      return periods.map(pDay => {
        const dailyIncome = entries
          .filter(e => e.type === 'income' && new Date(e.date || e.timestamp).toDateString() === pDay)
          .reduce((sum, e) => sum + e.amount, 0);
        return [dailyIncome, target];
      });
    }
  };

  const chartData = getChartData();
  const maxBarVal = Math.max(...chartData.map(d => Math.max(d[0], d[1]))) || 100;

  // Generate AI Daily Brief
  const generateDailyBrief = async (manualTrigger = false) => {
    if (isBriefFetchingRef.current && !manualTrigger) return;

    const targetLang = lang;
    const todayStr = new Date().toDateString();

    const overdueLeads = allLeads.filter(l => {
      if (!l.followupDate) return false;
      return new Date(l.followupDate) < new Date() && l.stage !== 'closed' && l.stage !== 'lost';
    }).length;

    const highPri = GC.tasks.items.filter(t => !t.done && t.priority === 'high').length;

    const pName = userData?.name || user?.displayName || L('Sara', 'سارة');
    const bName = GC.profile.name || L('your business', 'عملك التجاري');

    // Unique cache key based on user, state, date, and business details
    const userIdKey = user?.uid || 'guest';
    const cacheStorageKey = `upklick_daily_brief_cache_${userIdKey}`;
    const currentCacheKey = `uid_${userIdKey}|lang_${targetLang}|date_${todayStr}|tasks_${openTasks}_hp_${highPri}|leads_${allLeads.length}_od_${overdueLeads}|income_${monthlyIncome}_exp_${monthlyExpenses}|name_${pName}_biz_${bName}|niche_${GC.profile.niche || ''}_stage_${GC.profile.stage || ''}`;

    // 1. Check local cache
    const cached = localStorage.getItem(cacheStorageKey) || localStorage.getItem('upklick_daily_brief_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.cacheKey === currentCacheKey && parsed.brief) {
          setDailyBrief(parsed.brief);
          setBriefLoading(false);
          setBriefStreaming(false);

          if (manualTrigger && showToast) {
            showToast(L('Your daily brief is already up to date with your latest business data!', 'البيانات الحالية محدثة بالفعل! لم تتغير بيانات أعمالك لاستدعاء ملخص جديد.'));
          }
          return;
        }
      } catch (e) {
        console.error("Error reading cached daily brief:", e);
      }
    }

    // 2. Generate with AI streaming
    isBriefFetchingRef.current = true;
    setBriefLoading(true);
    setBriefStreaming(false);
    setDailyBrief('');

    const today = new Date().toLocaleDateString(targetLang === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });

    const prompt = `Generate a concise daily business brief for ${today}.
User Personal Name: ${pName}, Business/Company Name: ${bName}.
Data: ${openTasks} open tasks (${highPri} high priority), ${allLeads.length} CRM leads (${overdueLeads} overdue follow-ups), Monthly income so far: $${monthlyIncome}, Monthly expenses: $${monthlyExpenses}.
Business Niche: ${GC.profile.niche || 'Not specified'}, Stage: ${GC.profile.stage || 'Getting started'}.
Address the user directly by their personal name (${pName}) and refer to their business (${bName}). Be direct and motivating. 3-4 sentences max.`;

    const systemPrompt = `You are Business Architect AI. Respond in ${targetLang === 'ar' ? 'Arabic' : 'English'}. Be direct and motivating.`;

    try {
      let currentText = '';
      const brief = await callClaudeAPI(prompt, systemPrompt, targetLang, GC, 'General', (chunk) => {
        if (currentText === '') {
          setBriefLoading(false);
          setBriefStreaming(true);
        }
        currentText += chunk;
        if (targetLang === latestLangRef.current) {
          setDailyBrief(currentText);
        }
      });

      if (targetLang === latestLangRef.current) {
        setDailyBrief(brief);
        setBriefLoading(false);
        setBriefStreaming(false);

        // Cache the completed brief
        const cachePayload = JSON.stringify({
          brief,
          cacheKey: currentCacheKey
        });
        localStorage.setItem(cacheStorageKey, cachePayload);
        localStorage.setItem('upklick_daily_brief_cache', cachePayload);

        if (manualTrigger && showToast) {
          showToast(L('Daily brief updated with your latest business data! ✨', 'تم تحديث الملخص اليومي بناءً على أحدث بياناتك! ✨'));
        }
      }
    } catch (err) {
      console.error("Failed to generate daily brief:", err);
      setBriefLoading(false);
      setBriefStreaming(false);
    } finally {
      isBriefFetchingRef.current = false;
    }
  };

  useEffect(() => {
    latestLangRef.current = lang;
    const timer = setTimeout(() => {
      generateDailyBrief(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [
    user?.uid,
    allLeads.length,
    GC.tasks?.items?.length,
    monthlyIncome,
    monthlyExpenses,
    openTasks,
    GC.profile.name,
    GC.profile.niche,
    GC.profile.stage,
    userData?.name,
    lang
  ]);

  // Compute Health Score
  let healthScore = 40;
  if (GC.profile.name) healthScore += 10;
  if (allLeads.length > 0) healthScore += 10;
  if (GC.tasks.items.length > 0) healthScore += 10;
  if (GC.finance.entries.length > 0) healthScore += 15;
  if (GC.profile.niche) healthScore += 10;
  if (GC.strategy.idea_analysis) healthScore += 5;
  healthScore = Math.min(healthScore, 100);

  const dashArrValue = Math.round(88 * healthScore / 100);
  const healthColor = healthScore > 70 ? 'var(--green)' : healthScore > 40 ? 'var(--amber)' : 'var(--red)';
  const healthLabel = healthScore > 70 ? L('Excellent', 'ممتاز') : healthScore > 50 ? L('Good Shape', 'وضع جيد') : L('Needs Work', 'يحتاج عمل');

  const healthChecks = [
    { label: L('Business Profile', 'ملف البزنس'), val: GC.profile.name ? 100 : 10 },
    { label: L('CRM Active', 'CRM نشط'), val: Math.min(allLeads.length * 20, 100) },
    { label: L('Tasks Tracked', 'مهام مسجّلة'), val: Math.min(GC.tasks.items.length * 20, 100) },
    { label: L('Finance Tracked', 'مالية مسجّلة'), val: Math.min(GC.finance.entries.length * 15, 100) }
  ];

  // Pipeline stages lookup
  const pipelineStages = [
    { key: 'new', label: L('New Lead', 'عميل جديد'), color: 'var(--blue)' },
    { key: 'contacted', label: L('Contacted', 'تم التواصل'), color: 'var(--purple)' },
    { key: 'qualified', label: L('Qualified', 'مؤهل'), color: 'var(--amber)' },
    { key: 'proposal', label: L('Proposal Sent', 'تم إرسال العرض'), color: 'var(--accent)' },
    { key: 'won', label: L('Won', 'مكسب'), color: 'var(--green)' },
    { key: 'lost', label: L('Lost', 'خسارة'), color: 'var(--red)' }
  ];

  const overdueLeadsList = allLeads.filter(l => l.followupDate && new Date(l.followupDate) < new Date() && l.stage !== 'closed' && l.stage !== 'lost');
  const highPriorityTasks = GC.tasks.items.filter(t => !t.done && t.priority === 'high');

  return (
    <div className="pg on" id="pg-home">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">⌂</span>
          <span>{t('Command Center')}</span>
        </div>
        <div className="pg-actions">
          <button className="btn-ai" onClick={() => setAiPanelOpen(true)}>
            {L('Analyze my business', 'تحليل بزنسي')}
          </button>
          <button className="btn btn-prime" onClick={() => setLeadModalOpen(true)}>
            {L('+ New Lead', '+ عميل جديد')}
          </button>
        </div>
      </div>

      {/* Smart Alerts */}
      {(overdueLeadsList.length > 0 || highPriorityTasks.length > 0 || !GC.profile.name) && (
        <div id="smart-alerts-bar">
          {overdueLeadsList.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                background: 'var(--amber-d)',
                border: '1px solid rgba(255,184,0,.2)',
                borderRadius: '9px',
                padding: '9px 13px',
                marginBottom: '8px',
                cursor: 'pointer'
              }}
              onClick={() => {
                const firstOverdue = overdueLeadsList[0];
                if (firstOverdue && firstOverdue.workspaceId) {
                  setActiveWorkspace(firstOverdue.workspaceId);
                }
                setCrmActiveTab('followups');
                setCurrentPage('crm');
              }}
            >
              <span style={{ fontSize: '15px' }}>⏰</span>
              <span style={{ flex: 1, fontSize: '13px', color: 'var(--t1)' }}>
                {L(
                  `${overdueLeadsList.length} overdue follow-up${overdueLeadsList.length > 1 ? 's' : ''}`,
                  `${overdueLeadsList.length} متابعات متأخرة`
                )}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--amber)' }}>{L('View →', 'عرض ←')}</span>
            </div>
          )}

          {highPriorityTasks.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                background: 'var(--red-d)',
                border: '1px solid rgba(255,61,110,.2)',
                borderRadius: '9px',
                padding: '9px 13px',
                marginBottom: '8px',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentPage('tasks')}
            >
              <span style={{ fontSize: '15px' }}>🔴</span>
              <span style={{ flex: 1, fontSize: '13px', color: 'var(--t1)' }}>
                {L(
                  `${highPriorityTasks.length} high-priority task${highPriorityTasks.length > 1 ? 's' : ''} pending`,
                  `${highPriorityTasks.length} مهام عاجلة قيد الانتظار`
                )}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--red)' }}>{L('View →', 'عرض ←')}</span>
            </div>
          )}

          {!GC.profile.name && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                background: 'var(--orange-dim)',
                border: '1px solid var(--orange-d)',
                borderRadius: '9px',
                padding: '9px 13px',
                marginBottom: '8px',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentPage('strategy')}
            >
              <span style={{ fontSize: '15px' }}>💡</span>
              <span style={{ flex: 1, fontSize: '13px', color: 'var(--t1)' }}>
                {L('Complete your business profile for personalized AI insights', 'أكمل الملف التجاري للحصول على توصيات مخصصة')}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--a)' }}>{L('View →', 'عرض ←')}</span>
            </div>
          )}
        </div>
      )}

      {/* Stats Row */}
      <div className="g4 stagger" id="home-stats">
        <div className="stat-card" style={{
          background: theme === 'light'
            ? 'rgba(236, 92, 49, 0.04)'
            : 'linear-gradient(135deg, var(--bg2), rgba(236, 92, 49, 0.04))',
          border: theme === 'light'
            ? '1px solid rgba(236, 92, 49, 0.12)'
            : '1px solid rgba(236, 92, 49, 0.15)',
          borderInlineStart: '4px solid var(--orange)',
          boxShadow: theme === 'light'
            ? '0 8px 20px -8px rgba(236, 92, 49, 0.15)'
            : '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
          borderRadius: '12px'
        }}>
          <div className="stat-lbl">💰 {t('t-s4')}</div>
          <div className="stat-val" id="stat-revenue" style={{ color: 'var(--t1)' }}>{formatMoney(monthlyIncome)}</div>
          <div className="stat-ch ch-up" style={{ color: 'var(--green)' }}>↑ {L('Getting started', 'في البداية')}</div>
        </div>
        <div className="stat-card" style={{
          background: theme === 'light'
            ? 'rgba(108, 53, 255, 0.04)'
            : 'linear-gradient(135deg, var(--bg2), rgba(108, 53, 255, 0.04))',
          border: theme === 'light'
            ? '1px solid rgba(108, 53, 255, 0.12)'
            : '1px solid rgba(108, 53, 255, 0.15)',
          borderInlineStart: '4px solid var(--purple)',
          boxShadow: theme === 'light'
            ? '0 8px 20px -8px rgba(108, 53, 255, 0.15)'
            : '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
          borderRadius: '12px'
        }}>
          <div className="stat-lbl">🎯 {t('Active Deals')}</div>
          <div className="stat-val" id="stat-deals" style={{ color: 'var(--t1)' }}>{activeDeals}</div>
          <div className="stat-ch ch-nu">{L('in pipeline', 'في الخط')}</div>
        </div>
        <div className="stat-card" style={{
          background: theme === 'light'
            ? 'rgba(0, 217, 139, 0.04)'
            : 'linear-gradient(135deg, var(--bg2), rgba(16, 185, 129, 0.04))',
          border: theme === 'light'
            ? '1px solid rgba(0, 217, 139, 0.12)'
            : '1px solid rgba(16, 185, 129, 0.15)',
          borderInlineStart: '4px solid var(--green)',
          boxShadow: theme === 'light'
            ? '0 8px 20px -8px rgba(0, 217, 139, 0.15)'
            : '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
          borderRadius: '12px'
        }}>
          <div className="stat-lbl">◉ {L('Open Tasks', 'المهام المفتوحة')}</div>
          <div className="stat-val" id="stat-tasks" style={{ color: 'var(--t1)' }}>{openTasks}</div>
          <div className="stat-ch ch-nu">{L('to complete', 'للإكمال')}</div>
        </div>
        <div className="stat-card" style={{
          background: theme === 'light'
            ? 'rgba(255, 184, 0, 0.04)'
            : 'linear-gradient(135deg, var(--bg2), rgba(245, 158, 11, 0.04))',
          border: theme === 'light'
            ? '1px solid rgba(255, 184, 0, 0.12)'
            : '1px solid rgba(245, 158, 11, 0.15)',
          borderInlineStart: '4px solid var(--amber)',
          boxShadow: theme === 'light'
            ? '0 8px 20px -8px rgba(255, 184, 0, 0.15)'
            : '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
          borderRadius: '12px'
        }}>
          <div className="stat-lbl">👥 {t('t-s1')}</div>
          <div className="stat-val" style={{ color: 'var(--t1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
            <span>{dynamicFollowers}</span>
            <button 
              className="btn btn-ghost" 
              style={{ fontSize: '11px', padding: '2px 8px', minHeight: 'auto', height: '22px', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '6px', background: 'rgba(255,255,255,0.02)' }}
              onClick={() => setSocialConnectModalOpen(true)}
            >
              {dynamicFollowers === '0' ? L('Connect', 'اتصال') : L('Edit', 'تعديل')}
            </button>
          </div>
          <div className="stat-ch ch-up" style={{ color: 'var(--amber)' }}>↑ {hasFollowers ? '+1.8%' : '0%'} {t('t-sw')}</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="g21">
        {/* LEFT column */}
        <div>
          {/* AI Brief */}
          <div className="card mb" style={{
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.03) 0%, rgba(108, 53, 255, 0.02) 100%)',
            border: '1px solid rgba(255, 107, 53, 0.08)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
            borderRadius: '16px',
            padding: '20px'
          }}>
            {/* Ambient subtle glow background */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '100px',
              height: '100px',
              background: 'radial-gradient(circle, rgba(255,107,53,0.15) 0%, transparent 70%)',
              zIndex: 0,
              pointerEvents: 'none'
            }} />
            
            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 0; }
                50% { opacity: 1; }
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              .typing-cursor {
                display: inline-block;
                width: 7px;
                height: 14px;
                background: var(--orange);
                margin-inline-start: 4px;
                animation: pulse 0.8s infinite;
                vertical-align: middle;
              }
              .ai-box p {
                margin: 0 0 10px 0;
              }
              .ai-box p:last-child {
                margin-bottom: 0;
              }
            `}</style>

            <div className="sec-hd" style={{ position: 'relative', zIndex: 1, borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '12px', marginBottom: '16px' }}>
              <div className="sec-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '800', color: 'var(--t1)' }}>
                <span style={{ color: 'var(--orange)', textShadow: '0 0 10px rgba(255,107,53,0.3)' }}>✦</span>
                <span>{t('AI Daily Brief')}</span>
              </div>
              <button 
                className="btn-ai" 
                onClick={() => generateDailyBrief(true)} 
                disabled={briefLoading || briefStreaming}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: 'rgba(255, 107, 53, 0.1)',
                  color: 'var(--orange)',
                  border: '1px solid rgba(255, 107, 53, 0.2)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                {briefLoading || briefStreaming ? (
                  <>
                    <div style={{ width: '12px', height: '12px', border: '1.5px solid rgba(255,107,53,0.3)', borderTopColor: '#FF6B35', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <span>{L('Loading...', 'جاري التحميل...')}</span>
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    <span>{L('Refresh', 'تحديث')}</span>
                  </>
                )}
              </button>
            </div>
            
            <div id="ai-brief" style={{ position: 'relative', zIndex: 1 }}>
              <div 
                className="ai-box" 
                id="ai-brief-content" 
                style={{
                  fontSize: '14.5px',
                  lineHeight: '1.75',
                  color: 'var(--t1)',
                  fontFamily: 'inherit',
                  textAlign: 'justify'
                }}
                dangerouslySetInnerHTML={{ 
                  __html: briefLoading 
                    ? `<div style="display: flex; align-items: center; gap: 10px; color: var(--t2); padding: 8px 0;">
                        <div class="spinner" style="width: 16px; height: 16px; border: 2px solid rgba(255,107,53,0.3); border-top-color: #FF6B35; border-radius: 50%; animation: spin 1s linear infinite; flex-shrink: 0;"></div>
                        <span style="font-size: 13.5px;">${L('Scanning your data & formulating today\'s plan...', 'جاري قراءة البيانات وتشكيل خطة اليوم المخصصة...')}</span>
                       </div>`
                    : parseMarkdown(dailyBrief) + (briefStreaming ? '<span class="typing-cursor"></span>' : '')
                }}
              />
            </div>
          </div>

          {/* Chart */}
          <div className="card mb">
            <div className="sec-hd">
              <div className="sec-title">📈 {t('t-fg')}</div>
              <div style={{ display: 'flex', gap: '2px', background: 'var(--surface2)', borderRadius: '8px', padding: '2px' }}>
                <button
                  className={`tab-btn ${chartPeriod === '7d' ? 'on' : ''}`}
                  onClick={() => setChartPeriod('7d')}
                  style={{ padding: '4px 9px', fontSize: '11px', minWidth: 'auto', flex: 'none' }}
                >
                  7d
                </button>
                <button
                  className={`tab-btn ${chartPeriod === '30d' ? 'on' : ''}`}
                  onClick={() => setChartPeriod('30d')}
                  style={{ padding: '4px 9px', fontSize: '11px', minWidth: 'auto', flex: 'none' }}
                >
                  30d
                </button>
              </div>
            </div>
            <div className="chart-bars" id="mc" style={{ height: '90px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
              {chartData.map((d, i) => (
                <React.Fragment key={i}>
                  <div className="chart-bar" style={{ background: 'var(--a)', height: `${Math.round(d[0] / maxBarVal * 90)}%`, width: '12px', borderRadius: '3px 3px 0 0' }}></div>
                  <div className="chart-bar" style={{ background: 'var(--green)', height: `${Math.round(d[1] / maxBarVal * 90)}%`, opacity: 0.55, width: '12px', borderRadius: '3px 3px 0 0' }}></div>
                </React.Fragment>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '14px', marginTop: '12px', fontSize: '11px', color: 'var(--t2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', background: 'var(--a)', borderRadius: '50%' }}></div>
                <span>{L('Revenue', 'الإيرادات')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '8px', height: '8px', background: 'var(--green)', borderRadius: '50%' }}></div>
                <span>{L('Goal Target', 'المستهدف')}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">🎯 {L('Quick Actions', 'إجراءات سريعة')}</div>
            </div>
            <div className="g4" style={{ gap: '8px' }}>
              <button
                className="btn btn-ghost"
                style={{ flexDirection: 'column', padding: '10px 5px', gap: '4px', fontSize: '11px', justifyContent: 'center', borderRadius: '11px', height: '64px' }}
                onClick={() => setLeadModalOpen(true)}
              >
                🎯 <span>{L('Add Lead', 'أضف ليد')}</span>
              </button>
              <button
                className="btn btn-ghost"
                style={{ flexDirection: 'column', padding: '10px 5px', gap: '4px', fontSize: '11px', justifyContent: 'center', borderRadius: '11px', height: '64px' }}
                onClick={() => setTaskModalOpen(true)}
              >
                ◉ <span>{L('Add Task', 'أضف مهمة')}</span>
              </button>
              <button
                className="btn btn-ghost"
                style={{ flexDirection: 'column', padding: '10px 5px', gap: '4px', fontSize: '11px', justifyContent: 'center', borderRadius: '11px', height: '64px' }}
                onClick={() => {
                  setFinanceModalType('income');
                  setFinanceModalOpen(true);
                }}
              >
                💰 <span>{L('Add Income', 'أضف دخل')}</span>
              </button>
              <button
                className="btn btn-ghost"
                style={{ flexDirection: 'column', padding: '10px 5px', gap: '4px', fontSize: '11px', justifyContent: 'center', borderRadius: '11px', height: '64px' }}
                onClick={() => {
                  setFinanceModalType('expense');
                  setFinanceModalOpen(true);
                }}
              >
                📋 <span>{L('Add Expense', 'أضف مصروف')}</span>
              </button>
              <button
                className="btn btn-ghost"
                style={{ flexDirection: 'column', padding: '10px 5px', gap: '4px', fontSize: '11px', justifyContent: 'center', borderRadius: '11px', height: '64px' }}
                onClick={() => setAiPanelOpen(prev => !prev)}
              >
                ✦ <span>{L('Ask AI', 'اسأل AI')}</span>
              </button>
              <button
                className="btn btn-ghost"
                style={{ flexDirection: 'column', padding: '10px 5px', gap: '4px', fontSize: '11px', justifyContent: 'center', borderRadius: '11px', height: '64px' }}
                onClick={() => setCurrentPage('strategy')}
              >
                🧠 <span>{L('Strategy', 'استراتيجية')}</span>
              </button>
              <button
                className="btn btn-ghost"
                style={{ flexDirection: 'column', padding: '10px 5px', gap: '4px', fontSize: '11px', justifyContent: 'center', borderRadius: '11px', height: '64px' }}
                onClick={() => setCurrentPage('landing')}
              >
                ⚡ <span>{L('Landing Page', 'صفحة هبوط')}</span>
              </button>

            </div>
          </div>
        </div>

        {/* RIGHT column */}
        <div>
          {/* Health Ring */}
          <div className="card mb">
            <div className="sec-hd">
              <div className="sec-title">❤️ {L('Business Health', 'صحة البزنس')}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
              <div style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0 }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <path className="health-track" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--edge)" strokeWidth="3.5" />
                  <path
                    className="health-fill"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={healthColor}
                    strokeDasharray={`${dashArrValue} ${88 - dashArrValue}`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.3s ease' }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, fontFamily: 'var(--ff)', color: 'var(--t1)' }}>{healthScore}</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--t1)' }}>{healthLabel}</div>
                <div style={{ fontSize: '11px', color: 'var(--t2)' }}>{L('Current rating scorecard', 'التقييم الحالي لمؤشر الأعمال')}</div>
              </div>
            </div>
            <div>
              {healthChecks.map((item, idx) => (
                <div style={{ marginBottom: '8px' }} key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--t2)' }}>{item.label}</span>
                    <span style={{ fontSize: '11px', color: 'var(--t1)' }}>{item.val}%</span>
                  </div>
                  <div className="progress-track" style={{ height: '6px', background: 'var(--surface2)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${item.val}%`,
                        height: '100%',
                        background: item.val > 60 ? 'var(--green)' : item.val > 30 ? 'var(--amber)' : 'var(--red)',
                        transition: 'width 0.3s ease'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Diversity Score */}
          <div className="card mb">
            <div className="sec-hd">
              <div className="sec-title">📈 {L('Revenue Diversity', 'تقييم تنوع الإيرادات')}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
              <div style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0 }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--surface3)" strokeWidth="3.5"/>
                  {svgCircles.map((circle, idx) => (
                    <path
                      key={idx}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={circle.color}
                      strokeWidth="3.5"
                      strokeDasharray={circle.strokeDasharray}
                      strokeDashoffset={circle.strokeDashoffset}
                      strokeLinecap="round"
                    />
                  ))}
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, fontFamily: 'var(--ff)', color: 'var(--t1)' }}>{diversityScore}</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--t1)' }}>
                  {diversityScore >= 85 ? L('Excellent Diversity', 'تنوع ممتاز') : diversityScore >= 50 ? L('Moderate Diversity', 'تنوع متوسط') : L('Low Diversity', 'تنوع منخفض')}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--t2)', marginTop: '2px' }}>
                  {totalRevenueVal <= 0
                    ? L('No revenue logged yet', 'لا توجد أرباح مسجلة بعد')
                    : (bestStreamPct > 60
                      ? L(`Relies heavily on ${bestStream} (${bestStreamPct}%)`, `تعتمد بشكل كبير على ${bestStream} (${bestStreamPct}٪)`)
                      : L('Your sources are well diversified!', 'مصادر دخلك متنوعة بشكل ممتاز!'))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {streams.map((s, idx) => {
                const pct = totalRevenueVal > 0 ? Math.round((s.val / totalRevenueVal) * 100) : 0;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.c, flexShrink: 0 }}></div>
                    <div style={{ flex: 1, fontSize: '12px', color: 'var(--t1)' }}>{s.name}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--t3)' }}>
                      {formatMoney(s.val)} ({pct}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pipeline summary */}
          <div className="card mb">
            <div className="sec-hd">
              <div className="sec-title">📊 {L('Pipeline Summary', 'ملخص الصفقات')}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {allLeads.length === 0 ? (
                <div className="empty-state" style={{ padding: '16px' }}>
                  <div className="es-icon">🎯</div>
                  <div className="es-title">{L('No leads yet', 'لا يوجد عملاء بعد')}</div>
                  <button className="btn btn-prime" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={() => setLeadModalOpen(true)}>
                    {L('+ Add First Lead', '+ أضف أول عميل')}
                  </button>
                </div>
              ) : (
                pipelineStages.map(stage => {
                  const cnt = allLeads.filter(l => l.stage === stage.key).length;
                  if (cnt === 0) return null;
                  return (
                    <div className="row" key={stage.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px solid var(--edge)' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: stage.color, flexShrink: 0 }}></div>
                      <div style={{ flex: 1, fontSize: '12.5px', color: 'var(--t1)' }}>{stage.label}</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }}>{cnt}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Today Tasks */}
          <div className="card mb">
            <div className="sec-hd">
              <div className="sec-title">☑ {L('Tasks Checklist', 'قائمة المهام اليومية')}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingInlineEnd: '4px' }}>
              {/* Pending Tasks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {GC.tasks.items.filter(t => !t.done).length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--t3)', padding: '6px 0', textAlign: 'center' }}>
                    {L('No pending tasks. Great job! 🎉', 'لا توجد مهام معلقة. عمل رائع! 🎉')}
                  </div>
                ) : (
                  GC.tasks.items
                    .filter(t => !t.done)
                    .map(task => (
                      <div className="task-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }} key={task.id}>
                        <div className="task-check" style={{ border: '1px solid var(--edge3)', borderRadius: '3px', width: '16px', height: '16px', cursor: 'pointer', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => toggleTask(task.id)}></div>
                        <div className={`task-priority p-${task.priority}`} style={{ width: '6px', height: '6px', borderRadius: '50%', background: task.priority === 'high' ? 'var(--red)' : task.priority === 'medium' ? 'var(--amber)' : 'var(--green)' }}></div>
                        <div style={{ flex: 1, fontSize: '12.5px', color: 'var(--t1)' }}>{task.title}</div>
                      </div>
                    ))
                )}
              </div>

              {/* Completed Tasks */}
              {GC.tasks.items.filter(t => t.done).length > 0 && (
                <>
                  <div style={{ height: '1px', background: 'var(--edge)', margin: '4px 0' }} />
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--green)', opacity: 0.8, marginBottom: '2px' }}>
                    {L('Completed Tasks', 'المهام المكتملة')}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {GC.tasks.items
                      .filter(t => t.done)
                      .map(task => (
                        <div className="task-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0', opacity: 0.6 }} key={task.id}>
                          <div className="task-check" style={{ border: '1px solid var(--green)', borderRadius: '3px', width: '16px', height: '16px', cursor: 'pointer', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px' }} onClick={() => toggleTask(task.id)}>
                            ✓
                          </div>
                          <div style={{ flex: 1, fontSize: '12.5px', color: 'var(--t2)', textDecoration: 'line-through' }}>{task.title}</div>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Finance snap */}
          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">💳 {L('Finance Snapshot', 'الوضعية المالية')}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {monthlyIncome === 0 && monthlyExpenses === 0 ? (
                <div className="empty-state" style={{ padding: '16px' }}>
                  <div className="es-icon">💳</div>
                  <div className="es-title">{L('No transactions recorded', 'لا توجد عمليات مسجلة')}</div>
                  <button className="btn btn-prime" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={() => {
                    setFinanceModalType('income');
                    setFinanceModalOpen(true);
                  }}>
                    {L('+ Add Income', '+ أضف دخلاً')}
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--edge)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--t2)' }}>{L('Income', 'الدخل')}</span>
                    <span style={{ fontWeight: 700, color: 'var(--green)' }}>+{formatMoney(monthlyIncome)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--edge)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--t2)' }}>{L('Expenses', 'المصروفات')}</span>
                    <span style={{ fontWeight: 700, color: 'var(--red)' }}>-{formatMoney(monthlyExpenses)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t1)' }}>{L('Net Profit', 'صافي الأرباح')}</span>
                    <span style={{ fontWeight: 800, color: monthlyIncome - monthlyExpenses >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {monthlyIncome - monthlyExpenses >= 0 ? '+' : ''}
                      {formatMoney(monthlyIncome - monthlyExpenses)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
