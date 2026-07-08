'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';
import { DB } from '../../data/mockData';
import { parseMarkdown } from '../../utils/markdown';

export default function SocialAccountsView() {
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const getPeriodMultiplier = (period, start, end) => {
    switch (period) {
      case 'today': return 0.03;
      case 'week': return 0.22;
      case 'month': return 0.85;
      case 'last30': return 1.0;
      case 'year': return 8.5;
      case 'custom': {
        if (start && end) {
          const days = Math.max(1, Math.round((new Date(end) - new Date(start)) / (86400000)));
          return days / 30;
        }
        return 1.0;
      }
      case 'all':
      default:
        return 1.0;
    }
  };

  const formatFollowersCount = (val) => {
    if (!val || isNaN(val)) return '0';
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
    return String(val);
  };

  const scaleFollowers = (baseVal) => {
    const mult = getPeriodMultiplier(filterPeriod, customStartDate, customEndDate);
    if (filterPeriod === 'all' || filterPeriod === 'year') {
      return formatFollowersCount(Math.round(baseVal * (filterPeriod === 'year' ? 0.95 : 1)));
    }
    return formatFollowersCount(Math.max(1, Math.round(baseVal * 0.05 * mult)));
  };

  const scaleReach = (baseVal) => {
    const mult = getPeriodMultiplier(filterPeriod, customStartDate, customEndDate);
    const finalVal = Math.round(baseVal * mult);
    if (finalVal >= 1000) return (finalVal / 1000).toFixed(1) + 'M';
    return finalVal + 'K';
  };

  const scalePosts = (baseVal) => {
    const mult = getPeriodMultiplier(filterPeriod, customStartDate, customEndDate);
    return Math.max(0, Math.round(baseVal * mult));
  };

  const scaleEngagement = (baseVal) => {
    const val = parseFloat(baseVal);
    if (isNaN(val)) return baseVal;
    if (filterPeriod === 'today') return (val * 1.05).toFixed(1) + '%';
    if (filterPeriod === 'week') return (val * 1.02).toFixed(1) + '%';
    return baseVal;
  };

  const { lang, L, t, GC, saveGC, setSocialConnectModalOpen } = useBusiness();

  const socialData = GC.socialAccounts || {
    connected: { instagram: true, tiktok: true, youtube: false, snapchat: false, x: false },
    aiAnalysis: ''
  };

  const [connected, setConnected] = useState(socialData.connected || {
    instagram: true,
    tiktok: true,
    youtube: false,
    snapchat: false,
    x: false
  });

  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysisText, setAiAnalysisText] = useState(socialData.aiAnalysis || '');

  // Sync state if GC updates
  useEffect(() => {
    if (GC.socialAccounts) {
      if (GC.socialAccounts.connected) setConnected(GC.socialAccounts.connected);
      if (GC.socialAccounts.aiAnalysis !== undefined) setAiAnalysisText(GC.socialAccounts.aiAnalysis);
    }
  }, [GC.socialAccounts]);

  const toggleConnection = (platform) => {
    const newConnected = {
      ...connected,
      [platform]: !connected[platform]
    };
    setConnected(newConnected);
    const updatedGC = {
      ...GC,
      socialAccounts: {
        ...GC.socialAccounts,
        connected: newConnected
      }
    };
    saveGC(updatedGC);
  };

  const handleAnalyzeAll = async () => {
    setAnalyzing(true);
    setAiAnalysisText('');

    const prompt = `Analyze my social media profiles reach & engagement. Connected: ${Object.entries(connected).filter(([_, v]) => v).map(([k]) => k).join(', ')}. My niche is: Fashion & Lifestyle. Followers: ${GC.creator?.followers || '284K'}. Write a short 3-step action plan to optimize reach.`;
    const sysPrompt = 'Social Media Growth Consultant. Concrete and actionable guidelines.';

    try {
      const reply = await callClaudeAPI(prompt, sysPrompt, lang);
      setAiAnalysisText(reply);
      const updatedGC = {
        ...GC,
        socialAccounts: {
          ...GC.socialAccounts,
          aiAnalysis: reply
        }
      };
      saveGC(updatedGC);
    } catch (e) {
      const fallback = L('Analysis complete. Highlight Reels & short video formats.', 'اكتمل التحليل. ركزي على الفيديوهات القصيرة والريلز.');
      setAiAnalysisText(fallback);
      const updatedGC = {
        ...GC,
        socialAccounts: {
          ...GC.socialAccounts,
          aiAnalysis: fallback
        }
      };
      saveGC(updatedGC);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="pg on" id="pg-social">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">📡</span>
          {L('Social Accounts Hub', 'مركز الحسابات الاجتماعية')}
        </div>
        <div className="pg-actions">
          {/* Period Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginInlineEnd: '10px' }}>
            <span style={{ fontSize: '13px' }}>📅</span>
            <select
              className="inp"
              style={{ padding: '4px 8px', fontSize: '12px', width: 'auto', minWidth: '110px', height: '32px', borderRadius: '8px' }}
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
            >
              <option value="all">{L('All Time', 'كل الأوقات')}</option>
              <option value="today">{L('Today', 'اليوم')}</option>
              <option value="week">{L('This Week', 'هذا الأسبوع')}</option>
              <option value="month">{L('This Month', 'هذا الشهر')}</option>
              <option value="last30">{L('Last 30 Days', 'آخر ٣٠ يوم')}</option>
              <option value="year">{L('This Year', 'هذا العام')}</option>
              <option value="custom">{L('Custom Range', 'نطاق مخصص')}</option>
            </select>

            {filterPeriod === 'custom' && (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input
                  type="date"
                  className="inp"
                  style={{ padding: '4px 8px', fontSize: '11px', width: '120px', height: '32px', borderRadius: '8px' }}
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
                <span style={{ fontSize: '11px', color: 'var(--t3)' }}>{L('to', 'إلى')}</span>
                <input
                  type="date"
                  className="inp"
                  style={{ padding: '4px 8px', fontSize: '11px', width: '120px', height: '32px', borderRadius: '8px' }}
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            )}
          </div>

          <button className="btn btn-ghost" onClick={handleAnalyzeAll}>
            {analyzing ? L('Analyzing...', 'جاري التحليل...') : L('🤖 Analyze All', '🤖 تحليل الكل')}
          </button>
          <button className="btn btn-prime" onClick={() => setSocialConnectModalOpen(true)}>
            + {L('Connect Account', 'ربط حساب')}
          </button>
        </div>
      </div>

      <div className="g4 stagger mb">
        <div className="stat-card">
          <div className="stat-lbl">👥 {L('Total Followers', 'إجمالي المتابعين')}</div>
          <div className="stat-val" id="soc-total-followers">
            {scaleFollowers(GC.socialAccounts?.followers?.total || 0)}
          </div>
          <div className="stat-ch ch-nu">{L('across all platforms', 'عبر كافة المنصات')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">💫 {L('Avg Engagement', 'متوسط التفاعل')}</div>
          <div className="stat-val ch-up" id="soc-avg-eng">
            {connected.instagram && connected.tiktok ? scaleEngagement('6.2%') : connected.instagram ? scaleEngagement('6.8%') : connected.tiktok ? scaleEngagement('4.2%') : '0%'}
          </div>
          <div className="stat-ch ch-nu">{L('rate', 'معدل التفاعل')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">📝 {L('Posts In Period', 'المنشورات')}</div>
          <div className="stat-val" id="soc-posts">
            {connected.instagram && connected.tiktok ? scalePosts(24) : connected.instagram ? scalePosts(14) : connected.tiktok ? scalePosts(10) : '0'}
          </div>
          <div className="stat-ch ch-nu">{L('published', 'تم النشر')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">👁️ {L('Total Reach', 'إجمالي الوصول')}</div>
          <div className="stat-val" id="soc-reach">
            {connected.instagram && connected.tiktok ? scaleReach(1200) : connected.instagram ? scaleReach(890) : connected.tiktok ? scaleReach(310) : '0'}
          </div>
          <div className="stat-ch ch-nu">{L('reach', 'الوصول')}</div>
        </div>
      </div>

      <div className="g2">
        <div className="card mb">
          <div className="sec-hd">
            <div className="sec-title" id="t-social-connect">{L('Connected Accounts', 'الحسابات المربوطة')}</div>
          </div>
          <div id="social-connect-list">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { key: 'facebook', label: 'Facebook', emoji: '🔵' },
                { key: 'instagram', label: 'Instagram', emoji: '📸' },
                { key: 'tiktok', label: 'TikTok', emoji: '🎵' },
                { key: 'youtube', label: 'YouTube', emoji: '▶️' },
                { key: 'snapchat', label: 'Snapchat', emoji: '👻' },
                { key: 'x', label: 'X (Twitter)', emoji: '🐦' }
              ].map(plat => {
                const isConn = connected[plat.key];
                const isConnectModalPlatform = ['facebook', 'instagram', 'tiktok'].includes(plat.key);
                const handleAction = (e) => {
                  if (e) e.stopPropagation();
                  if (isConnectModalPlatform) {
                    setSocialConnectModalOpen(true);
                  } else {
                    toggleConnection(plat.key);
                  }
                };
                return (
                  <div 
                    key={plat.key}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--surface2)', borderRadius: '10px', cursor: 'pointer' }}
                    onClick={handleAction}
                  >
                    <span style={{ fontSize: '24px' }}>{plat.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)' }}>{plat.label}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--t3)' }}>
                        {isConn ? L('Connected', 'متصل') : L('Not connected', 'غير متصل')}
                      </div>
                    </div>
                    <button 
                      className={`btn ${isConn ? 'btn-prime' : 'btn-ghost'}`} 
                      style={{ fontSize: '12px', padding: '5px 12px' }}
                      onClick={handleAction}
                    >
                      {isConn ? L('Disconnect', 'قطع الاتصال') : L('Connect', 'ربط')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div>
          <div className="card mb">
            <div className="sec-hd"><div className="sec-title">{L('Top Performing Content', 'المحتوى الأعلى أداء')}</div></div>
            <div id="social-top-content">
              {connected.instagram || connected.tiktok ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'var(--surface2)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '18px' }}>🎥</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t1)' }}>{L('Morning Routine Vibe Reel', 'ريل روتين الصباح')}</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--t3)' }}>Instagram Reels · {L('Engagement:', 'التفاعل:')} 8.2%</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--green)' }}>124K views</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'var(--surface2)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '18px' }}>🎥</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t1)' }}>{L('Notion Calendar Setup Shorts', 'فيديو كورس نوتشن')}</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--t3)' }}>TikTok · {L('Engagement:', 'التفاعل:')} 6.4%</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--green)' }}>89K views</div>
                  </div>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '20px' }}>
                  <div className="es-icon">📊</div>
                  <div className="es-sub">{L('Connect accounts to see your best performing posts', 'اربط الحسابات لعرض تفاصيل منشوراتك الأكثر رواجاً')}</div>
                </div>
              )}
            </div>
          </div>
          <div className="card">
            <div className="sec-hd"><div className="sec-title">🤖 {L('AI Analysis', 'تحليل الذكاء')}</div></div>
            <div id="social-ai-output">
              {analyzing ? (
                <div className="ai-box" style={{ animation: 'pulse 1.5s infinite' }}>{L('⚡ Running reach check...', '⚡ جاري التحقق من الوصول...')}</div>
              ) : aiAnalysisText ? (
                <div 
                  className="ai-box" 
                  style={{ lineHeight: '1.6', fontSize: '13px', background: 'transparent', border: 'none', padding: '0' }}
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(aiAnalysisText) }}
                />
              ) : (
                <div style={{ fontSize: '12px', color: 'var(--t3)', textAlign: 'center', padding: '20px' }} id="t-social-empty">
                  {L('Connect accounts and click Analyze All', 'اربط حساباتك واضغط على تحليل الكل')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
