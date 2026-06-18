'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { useAuth } from '../../context/AuthContext';
import { callClaudeAPI } from '../../utils/ai';

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
    toggleTask
  } = useBusiness();
  const { user, userData } = useAuth();

  const [chartPeriod, setChartPeriod] = useState('7d');
  const [dailyBrief, setDailyBrief] = useState('');
  const [briefLoading, setBriefLoading] = useState(false);

  const monthlyIncome = GC.finance.entries
    .filter(e => e.type === 'income')
    .reduce((a, b) => a + b.amount, 0);

  const monthlyExpenses = GC.finance.entries
    .filter(e => e.type === 'expense')
    .reduce((a, b) => a + b.amount, 0);

  const activeDeals = GC.crm.leads.filter(l => l.stage !== 'won' && l.stage !== 'lost').length;
  const openTasks = GC.tasks.items.filter(t => !t.done).length;

  // Calculate dynamic follower counts based on connected profiles
  const connectedSocials = GC.socialAccounts?.connected || { instagram: true, tiktok: true };
  const dynamicFollowers = connectedSocials.instagram && connectedSocials.tiktok ? '373K' 
                          : connectedSocials.instagram ? '284K' 
                          : connectedSocials.tiktok ? '89K' 
                          : '0';
  
  const dynamicFollowerGrowth = connectedSocials.instagram && connectedSocials.tiktok ? '+2.4%'
                               : connectedSocials.instagram ? '+1.8%'
                               : connectedSocials.tiktok ? '+4.2%'
                               : '0%';

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
  const generateDailyBrief = async () => {
    setBriefLoading(true);
    const today = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });

    const overdueLeads = GC.crm.leads.filter(l => {
      if (!l.followupDate) return false;
      return new Date(l.followupDate) < new Date() && l.stage !== 'closed' && l.stage !== 'lost';
    }).length;

    const highPri = GC.tasks.items.filter(t => !t.done && t.priority === 'high').length;

    const pName = userData?.name || user?.displayName || L('Sara', 'سارة');
    const bName = GC.profile.name || L('your business', 'عملك التجاري');

    const prompt = `Generate a concise daily business brief for ${today}.
User Personal Name: ${pName}, Business/Company Name: ${bName}.
Data: ${openTasks} open tasks (${highPri} high priority), ${GC.crm.leads.length} CRM leads (${overdueLeads} overdue follow-ups), Monthly income so far: $${monthlyIncome}, Monthly expenses: $${monthlyExpenses}.
Business Niche: ${GC.profile.niche || 'Not specified'}, Stage: ${GC.profile.stage || 'Getting started'}.
Address the user directly by their personal name (${pName}) and refer to their business (${bName}). Be direct and motivating. 3-4 sentences max.`;

    const systemPrompt = `You are Business Architect AI. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}. Be direct and motivating.`;

    const brief = await callClaudeAPI(prompt, systemPrompt, lang, GC);
    setDailyBrief(brief);
    setBriefLoading(false);
  };

  useEffect(() => {
    generateDailyBrief();
  }, [GC.crm.leads, GC.tasks.items, GC.finance.entries, lang]);

  // Compute Health Score
  let healthScore = 40;
  if (GC.profile.name) healthScore += 10;
  if (GC.crm.leads.length > 0) healthScore += 10;
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
    { label: L('CRM Active', 'CRM نشط'), val: Math.min(GC.crm.leads.length * 20, 100) },
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

  const overdueLeadsList = GC.crm.leads.filter(l => l.followupDate && new Date(l.followupDate) < new Date() && l.stage !== 'closed' && l.stage !== 'lost');
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
              onClick={() => setCurrentPage('crm')}
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
          background: 'linear-gradient(135deg, var(--bg2), rgba(59, 130, 246, 0.04))',
          border: '1px solid rgba(59, 130, 246, 0.15)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
          borderRadius: 'var(--radius)'
        }}>
          <div className="stat-lbl">💰 {t('t-s4')}</div>
          <div className="stat-val" id="stat-revenue" style={{ color: 'var(--t1)' }}>{formatMoney(monthlyIncome)}</div>
          <div className="stat-ch ch-up" style={{ color: 'var(--green)' }}>↑ {L('Getting started', 'في البداية')}</div>
        </div>
        <div className="stat-card" style={{
          background: 'linear-gradient(135deg, var(--bg2), rgba(139, 92, 246, 0.04))',
          border: '1px solid rgba(139, 92, 246, 0.15)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
          borderRadius: 'var(--radius)'
        }}>
          <div className="stat-lbl">🎯 {t('Active Deals')}</div>
          <div className="stat-val" id="stat-deals" style={{ color: 'var(--t1)' }}>{activeDeals}</div>
          <div className="stat-ch ch-nu">{L('in pipeline', 'في الخط')}</div>
        </div>
        <div className="stat-card" style={{
          background: 'linear-gradient(135deg, var(--bg2), rgba(16, 185, 129, 0.04))',
          border: '1px solid rgba(16, 185, 129, 0.15)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
          borderRadius: 'var(--radius)'
        }}>
          <div className="stat-lbl">◉ {L('Open Tasks', 'المهام المفتوحة')}</div>
          <div className="stat-val" id="stat-tasks" style={{ color: 'var(--t1)' }}>{openTasks}</div>
          <div className="stat-ch ch-nu">{L('to complete', 'للإكمال')}</div>
        </div>
        <div className="stat-card" style={{
          background: 'linear-gradient(135deg, var(--bg2), rgba(245, 158, 11, 0.04))',
          border: '1px solid rgba(245, 158, 11, 0.15)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
          borderRadius: 'var(--radius)'
        }}>
          <div className="stat-lbl">👥 {t('t-s1')}</div>
          <div className="stat-val" style={{ color: 'var(--t1)' }}>{dynamicFollowers}</div>
          <div className="stat-ch ch-up" style={{ color: 'var(--amber)' }}>↑ {dynamicFollowerGrowth} {t('t-sw')}</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="g21">
        {/* LEFT column */}
        <div>
          {/* AI Brief */}
          <div className="card mb">
            <div className="sec-hd">
              <div className="sec-title">✦ {t('AI Daily Brief')}</div>
              <button className="btn-ai" onClick={generateDailyBrief} disabled={briefLoading}>
                {L('Refresh', 'تحديث')}
              </button>
            </div>
            <div id="ai-brief">
              <div className="ai-box" id="ai-brief-content" style={{ whiteSpace: 'pre-line' }}>
                {briefLoading ? L('Generating brief...', 'جاري توليد الملخص...') : dailyBrief}
              </div>
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
              <button
                className="btn btn-ghost"
                style={{ flexDirection: 'column', padding: '10px 5px', gap: '4px', fontSize: '11px', justifyContent: 'center', borderRadius: '11px', height: '64px' }}
                onClick={() => setCurrentPage('launchpad')}
              >
                🚀 <span>{L('Launch', 'أطلق')}</span>
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

          {/* Pipeline summary */}
          <div className="card mb">
            <div className="sec-hd">
              <div className="sec-title">📊 {L('Pipeline Summary', 'ملخص الصفقات')}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {GC.crm.leads.length === 0 ? (
                <div className="empty-state" style={{ padding: '16px' }}>
                  <div className="es-icon">🎯</div>
                  <div className="es-title">{L('No leads yet', 'لا يوجد عملاء بعد')}</div>
                  <button className="btn btn-prime" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={() => setLeadModalOpen(true)}>
                    {L('+ Add First Lead', '+ أضف أول عميل')}
                  </button>
                </div>
              ) : (
                pipelineStages.map(stage => {
                  const cnt = GC.crm.leads.filter(l => l.stage === stage.key).length;
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {GC.tasks.items.filter(t => !t.done).length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--t3)', padding: '12px 0', textAlign: 'center' }}>
                  {L('No tasks today. Add some! ✅', 'لا توجد مهام اليوم. أضف بعضها! ✅')}
                </div>
              ) : (
                GC.tasks.items
                  .filter(t => !t.done)
                  .slice(0, 4)
                  .map(task => (
                    <div className="task-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }} key={task.id}>
                      <div className="task-check" style={{ border: '1px solid var(--edge3)', borderRadius: '3px', width: '16px', height: '16px', cursor: 'pointer' }} onClick={() => toggleTask(task.id)}></div>
                      <div className={`task-priority p-${task.priority}`} style={{ width: '6px', height: '6px', borderRadius: '50%', background: task.priority === 'high' ? 'var(--red)' : task.priority === 'medium' ? 'var(--amber)' : 'var(--green)' }}></div>
                      <div style={{ flex: 1, fontSize: '12.5px', color: 'var(--t1)' }}>{task.title}</div>
                    </div>
                  ))
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
