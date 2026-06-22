'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';

export default function AnalyticsView() {
  const { lang, L, t, GC } = useBusiness();

  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysisText, setAiAnalysisText] = useState('');
  const [period, setPeriod] = useState('30d');

  // Compute stats from global context GC
  const totalLeads = GC.crm.leads.length;
  const completedTasks = GC.tasks.items.filter(t => t.done).length;

  // Compute total monthly revenue from finance entries
  const totalRevenueThisMonth = GC.finance.entries
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    setAiAnalysisText('');

    const prompt = `Analyze my business metrics: Monthly Revenue: $${totalRevenueThisMonth}, CRM Leads: ${totalLeads}, Completed Tasks: ${completedTasks}. Provide 3 specific and actionable strategic advice for the upcoming month.`;
    const sysPrompt = 'Professional growth advisor and startup mentor.';

    try {
      const reply = await callClaudeAPI(prompt, sysPrompt, lang);
      setAiAnalysisText(reply);
    } catch (e) {
      setAiAnalysisText(L('Good business health. Keep up your active outreach funnel.', 'صحة الأعمال ممتازة. استمري في تشغيل مسار الترويج النشط.'));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="pg on" id="pg-analytics">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">◈</span>
          {L('Analytics', 'التحليلات')}
        </div>
        <div className="pg-actions">
          <button className="btn-ai" onClick={handleAIAnalysis}>
            ✦ {L('AI Analysis', 'تحليل الذكاء')}
          </button>
          <button className="btn btn-ghost" onClick={() => alert('Exporting analytics...')}>
            📥 {L('Export', 'تصدير')}
          </button>
        </div>
      </div>

      <div className="g4 stagger mb">
        <div className="stat-card">
          <div className="stat-lbl">💰 {L('Monthly Revenue', 'الدخل الشهري')}</div>
          <div className="stat-val ch-up">${totalRevenueThisMonth.toLocaleString()}</div>
          <div className="stat-ch ch-up">{L('this month', 'هذا الشهر')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">🎯 {L('New Leads', 'العملاء الجدد')}</div>
          <div className="stat-val">{totalLeads}</div>
          <div className="stat-ch ch-nu">{L('this month', 'هذا الشهر')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">✅ {L('Tasks Done', 'المهام المكتملة')}</div>
          <div className="stat-val">{completedTasks}</div>
          <div className="stat-ch ch-nu">{L('completed', 'مكتملة')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">📈 {L('Growth Score', 'معدل النمو')}</div>
          <div className="stat-val ch-up">84%</div>
          <div className="stat-ch ch-nu">{L('business health', 'صحة العمل')}</div>
        </div>
      </div>

      <div className="g2 mb">
        <div className="card">
          <div className="sec-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div className="sec-title">📈 {L('Revenue Trend', 'اتجاه الإيرادات')}</div>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button 
                className={`btn ${period === '30d' ? 'btn-prime' : 'btn-ghost'}`} 
                onClick={() => setPeriod('30d')}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                30d
              </button>
              <button 
                className={`btn ${period === '7d' ? 'btn-prime' : 'btn-ghost'}`} 
                onClick={() => setPeriod('7d')}
                style={{ fontSize: '11px', padding: '4px 10px' }}
              >
                7d
              </button>
            </div>
          </div>
          <div className="bch" style={{ height: '160px', display: 'flex', alignItems: 'flex-end', gap: '16px', padding: '10px 0' }}>
            {period === '30d' ? (
              [350, 480, 520, 610, 780, 890, 1100, 1340, totalRevenueThisMonth || 1500].map((h, idx) => (
                <div key={idx} style={{ flex: 1, background: 'var(--orange)', height: `${Math.min(100, (h / 1800) * 100)}%`, borderRadius: '4px 4px 0 0', position: 'relative' }}></div>
              ))
            ) : (
              [120, 180, 240, 220, 310, 280, totalRevenueThisMonth / 4 || 350].map((h, idx) => (
                <div key={idx} style={{ flex: 1, background: 'var(--orange)', height: `${Math.min(100, (h / 500) * 100)}%`, borderRadius: '4px 4px 0 0', position: 'relative' }}></div>
              ))
            )}
          </div>
        </div>
        <div className="card">
          <div className="sec-hd"><div className="sec-title">🎯 {L('Lead Sources', 'مصادر العملاء المحتملين')}</div></div>
          <div id="an-lead-sources" style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
            {[
              { label: 'Instagram', w: 45, color: 'linear-gradient(90deg,var(--orange),var(--purple))' },
              { label: 'WhatsApp', w: 30, color: 'linear-gradient(90deg,var(--green),#06b6d4)' },
              { label: 'TikTok', w: 15, color: 'linear-gradient(90deg,#0088CC,#6C35FF)' },
              { label: 'Referral', w: 10, color: 'linear-gradient(90deg,var(--amber),var(--orange))' }
            ].map((s, idx) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} key={idx}>
                <span style={{ fontSize: '12.5px', color: 'var(--t2)', width: '100px' }}>{s.label}</span>
                <div style={{ flex: 1, height: '8px', background: 'var(--surface2)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${s.w}%`, height: '100%', background: s.color, borderRadius: '4px', transition: 'width 1s' }}></div>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--t2)', minWidth: '28px' }}>
                  {totalLeads > 0 ? Math.round((s.w / 100) * totalLeads) : 0}
                </span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--t3)', marginTop: '10px', textAlign: 'center' }}>
            {L('Add leads with sources in CRM to see real data', 'قم بإضافة العملاء مع تحديد مصادرهم في الـ CRM لعرض البيانات الدقيقة')}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="sec-hd"><div className="sec-title">✦ {L('AI Business Insights', 'رؤى البزنس بالذكاء')}</div></div>
        <div id="an-ai-insights">
          {analyzing ? (
            <div className="ai-box" style={{ animation: 'pulse 1.5s infinite', textAlign: 'center', padding: '20px' }}>
              {L('⚡ Analyzing business data...', '⚡ جاري فحص وتحليل بيانات البزنس...')}
            </div>
          ) : aiAnalysisText ? (
            <div className="ai-box" style={{ whiteSpace: 'pre-line', fontSize: '13px', lineHeight: '1.6' }}>
              {aiAnalysisText}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '20px' }}>
              <div className="es-icon">✦</div>
              <div className="es-title">{L('Get AI-powered insights', 'احصل على تحليل شامل لنشاطك')}</div>
              <div className="es-sub">
                {L('Based on your CRM, finance, and task data — personalized recommendations for growth', 'توصيات ذكية ومخصصة بناءً على فواتيرك، ومهامك وعملائك في الـ CRM')}
              </div>
              <button className="btn btn-prime" onClick={handleAIAnalysis}>
                ✦ {L('Analyze My Business', 'حلل أداء البزنس الخاص بي')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
