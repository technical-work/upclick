'use client';

import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';
import { DB } from '../../data/mockData';

export default function SocialAccountsView() {
  const { lang, L, t, GC } = useBusiness();

  const [connected, setConnected] = useState({
    instagram: true,
    tiktok: true,
    youtube: false,
    snapchat: false,
    x: false
  });

  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysisText, setAiAnalysisText] = useState('');

  const toggleConnection = (platform) => {
    setConnected(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  const handleAnalyzeAll = async () => {
    setAnalyzing(true);
    setAiAnalysisText('');

    const prompt = `Analyze my social media profiles reach & engagement. Connected: ${Object.entries(connected).filter(([_, v]) => v).map(([k]) => k).join(', ')}. My niche is: Fashion & Lifestyle. Followers: ${GC.creator?.followers || '284K'}. Write a short 3-step action plan to optimize reach.`;
    const sysPrompt = 'Social Media Growth Consultant. Concrete and actionable guidelines.';

    try {
      const reply = await callClaudeAPI(prompt, sysPrompt, lang);
      setAiAnalysisText(reply);
    } catch (e) {
      setAiAnalysisText(L('Analysis complete. Highlight Reels & short video formats.', 'اكتمل التحليل. ركزي على الفيديوهات القصيرة والريلز.'));
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
          <button className="btn btn-ghost" onClick={handleAnalyzeAll}>
            {analyzing ? L('Analyzing...', 'جاري التحليل...') : L('🤖 Analyze All', '🤖 تحليل الكل')}
          </button>
          <button className="btn btn-prime" onClick={() => alert(L('Account connection modal opened', 'تم فتح نافذة ربط الحسابات'))}>
            + {L('Connect Account', 'ربط حساب')}
          </button>
        </div>
      </div>

      <div className="g4 stagger mb">
        <div className="stat-card">
          <div className="stat-lbl">👥 {L('Total Followers', 'إجمالي المتابعين')}</div>
          <div className="stat-val" id="soc-total-followers">
            {connected.instagram && connected.tiktok ? '373K' : connected.instagram ? '284K' : connected.tiktok ? '89K' : '0'}
          </div>
          <div className="stat-ch ch-nu">{L('across all platforms', 'عبر كافة المنصات')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">💫 {L('Avg Engagement', 'متوسط التفاعل')}</div>
          <div className="stat-val ch-up" id="soc-avg-eng">
            {connected.instagram && connected.tiktok ? '6.2%' : connected.instagram ? '6.8%' : connected.tiktok ? '4.2%' : '0%'}
          </div>
          <div className="stat-ch ch-nu">{L('rate', 'معدل التفاعل')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">📝 {L('Posts This Month', 'المنشورات هذا الشهر')}</div>
          <div className="stat-val" id="soc-posts">
            {connected.instagram && connected.tiktok ? '24' : connected.instagram ? '14' : connected.tiktok ? '10' : '0'}
          </div>
          <div className="stat-ch ch-nu">{L('published', 'تم النشر')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">👁️ {L('Total Reach', 'إجمالي الوصول')}</div>
          <div className="stat-val" id="soc-reach">
            {connected.instagram && connected.tiktok ? '1.2M' : connected.instagram ? '890K' : connected.tiktok ? '310K' : '0'}
          </div>
          <div className="stat-ch ch-nu">{L('this month', 'هذا الشهر')}</div>
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
                { key: 'instagram', label: 'Instagram', emoji: '📸' },
                { key: 'tiktok', label: 'TikTok', emoji: '🎵' },
                { key: 'youtube', label: 'YouTube', emoji: '▶️' },
                { key: 'snapchat', label: 'Snapchat', emoji: '👻' },
                { key: 'x', label: 'X (Twitter)', emoji: '🐦' }
              ].map(plat => {
                const isConn = connected[plat.key];
                return (
                  <div 
                    key={plat.key}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--surface2)', borderRadius: '10px', cursor: 'pointer' }}
                    onClick={() => toggleConnection(plat.key)}
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
                      onClick={(e) => { e.stopPropagation(); toggleConnection(plat.key); }}
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
                <div className="ai" style={{ whiteSpace: 'pre-line', lineHeight: '1.6', fontSize: '13px' }}>
                  {aiAnalysisText}
                </div>
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
