'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';
import { parseMarkdown } from '../../utils/markdown';

const filterByDateRange = (itemDate, rangeType, customStart, customEnd) => {
  if (!itemDate) return rangeType === 'all';
  const date = new Date(itemDate);
  if (isNaN(date.getTime())) return rangeType === 'all';

  const now = new Date();

  switch (rangeType) {
    case 'today': {
      const today = new Date();
      today.setHours(0,0,0,0);
      return date >= today;
    }
    case 'week': {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return date >= startOfWeek;
    }
    case 'month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return date >= startOfMonth;
    }
    case 'year': {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return date >= startOfYear;
    }
    case 'last30': {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      return date >= thirtyDaysAgo;
    }
    case 'custom': {
      if (customStart && customEnd) {
        const start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
        const end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;
      }
      return true;
    }
    case 'all':
    default:
      return true;
  }
};

export default function AnalyticsView() {
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const { lang, L, t, GC, saveGC } = useBusiness();

  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysisText, setAiAnalysisText] = useState(GC.analytics?.aiAnalysisText || '');
  const [period, setPeriod] = useState('30d');

  // Compute stats from global context GC
  const allLeads = (GC.crm?.workspaces || []).flatMap(w => w.leads || []);
  const dateFilteredLeads = allLeads.filter(l => {
    const leadDate = l.created || l.id || '';
    return filterByDateRange(leadDate, filterPeriod, customStartDate, customEndDate);
  });
  const totalLeads = dateFilteredLeads.length;

  const allTasks = [...(GC.tasks?.items || []), ...(GC.team?.tasks || [])];
  const dateFilteredTasks = allTasks.filter(t => {
    const taskDate = t.created || t.id || '';
    return filterByDateRange(taskDate, filterPeriod, customStartDate, customEndDate);
  });
  const completedTasks = dateFilteredTasks.filter(t => t.done || t.status === 'completed').length;

  // Compute total monthly revenue from finance entries
  const dateFilteredFinance = (GC.finance?.entries || []).filter(e => {
    const entryDate = e.date || e.id || '';
    return filterByDateRange(entryDate, filterPeriod, customStartDate, customEndDate);
  });
  const totalRevenueThisMonth = dateFilteredFinance
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
      saveGC({
        ...GC,
        analytics: {
          ...GC.analytics,
          aiAnalysisText: reply
        }
      });
    } catch (e) {
      const fbText = L('Good business health. Keep up your active outreach funnel.', 'صحة الأعمال ممتازة. استمري في تشغيل مسار الترويج النشط.');
      setAiAnalysisText(fbText);
      saveGC({
        ...GC,
        analytics: {
          ...GC.analytics,
          aiAnalysisText: fbText
        }
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExport = () => {
    let csvContent = '\uFEFF'; // Add BOM for Excel UTF-8 Arabic support!
    
    // Section 1: Summary Stats
    csvContent += `Summary Statistics,الاحصائيات العامة\n`;
    csvContent += `Attribute,Value,الصفة,القيمة\n`;
    csvContent += `Filter Period,${filterPeriod},فترة الفلترة,${filterPeriod}\n`;
    csvContent += `Total Revenue,$${totalRevenueThisMonth},إجمالي الإيرادات,${totalRevenueThisMonth} $\n`;
    csvContent += `Total CRM Leads,${totalLeads},إجمالي العملاء المحتملين,${totalLeads}\n`;
    csvContent += `Completed Tasks,${completedTasks},المهام المكتملة,${completedTasks}\n`;
    csvContent += `Growth Score,84%,معدل النمو,84%\n\n`;

    // Section 2: Finance Entries
    csvContent += `Finance Entries,حركات المالية\n`;
    csvContent += `Date,Title,Type,Category,Amount,التاريخ,العنوان,النوع,التصنيف,المبلغ\n`;
    dateFilteredFinance.forEach(entry => {
      const date = entry.date || '';
      const title = (entry.title || '').replace(/"/g, '""');
      const type = entry.type || '';
      const category = (entry.category || '').replace(/"/g, '""');
      const amount = entry.amount || 0;
      csvContent += `"${date}","${title}","${type}","${category}",${amount},"${date}","${title}","${type}","${category}",${amount}\n`;
    });
    csvContent += `\n`;

    // Section 3: CRM Leads
    csvContent += `CRM Leads,العملاء المحتملين\n`;
    csvContent += `Name,Email,Stage,Date,الاسم,البريد الإلكتروني,المرحلة,التاريخ\n`;
    dateFilteredLeads.forEach(lead => {
      const name = (lead.name || '').replace(/"/g, '""');
      const email = (lead.email || '').replace(/"/g, '""');
      const stage = (lead.stage || '').replace(/"/g, '""');
      const date = lead.created || lead.id || '';
      csvContent += `"${name}","${email}","${stage}","${date}","${name}","${email}","${stage}","${date}"\n`;
    });
    csvContent += `\n`;

    // Section 4: Tasks
    csvContent += `Tasks,المهام\n`;
    csvContent += `Task,Status,Source,المهمة,الحالة,المصدر\n`;
    dateFilteredTasks.forEach(task => {
      const title = (task.title || '').replace(/"/g, '""');
      const status = task.done || task.status === 'completed' ? 'Completed' : 'Pending';
      const statusAr = task.done || task.status === 'completed' ? 'مكتملة' : 'قيد الانتظار';
      const source = task.source || 'Manual';
      const sourceAr = task.source === 'team' ? 'فريق العمل' : 'شخصي';
      csvContent += `"${title}","${status}","${source}","${title}","${statusAr}","${sourceAr}"\n`;
    });

    // Create Download Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `upklick_analytics_${filterPeriod}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pg on" id="pg-analytics">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">◈</span>
          {L('Analytics', 'التحليلات')}
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

          <button className="btn-ai" onClick={handleAIAnalysis}>
            ✦ {L('AI Analysis', 'تحليل الذكاء')}
          </button>
          <button className="btn btn-ghost" onClick={handleExport}>
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
              { label: 'Telegram', w: 30, color: 'linear-gradient(90deg,var(--green),#06b6d4)' },
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
            <div 
              className="ai-box" 
              style={{ fontSize: '13px', lineHeight: '1.6' }}
              dangerouslySetInnerHTML={{ __html: parseMarkdown(aiAnalysisText) }}
            />
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
