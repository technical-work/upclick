'use client';

import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';

export default function CRMView() {
  const {
    lang,
    L,
    t,
    GC,
    formatMoney,
    updateLeadStage,
    deleteLead,
    setLeadModalOpen,
    setLeadModalStage,
    openAIFor
  } = useBusiness();

  const [activeTab, setActiveTab] = useState('pipeline');
  const [aiOutput, setAiOutput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const stages = [
    { key: 'new', label: L('New Lead', 'ليد جديد'), color: 'var(--blue)' },
    { key: 'contacted', label: L('Contacted', 'تم التواصل'), color: 'var(--purple)' },
    { key: 'qualified', label: L('Qualified', 'مؤهل'), color: 'var(--amber)' },
    { key: 'proposal', label: L('Proposal Sent', 'عرض أُرسل'), color: 'var(--a)' },
    { key: 'closed', label: L('Closed Won', 'تم الإغلاق'), color: 'var(--green)' },
    { key: 'lost', label: L('Lost', 'خسارة'), color: 'var(--red)' }
  ];

  const leads = GC.crm.leads || [];
  const activeLeads = leads.filter(l => l.stage !== 'closed' && l.stage !== 'lost');
  const hotLeads = leads.filter(l => l.stage === 'qualified' || l.stage === 'proposal');
  const closedLeads = leads.filter(l => l.stage === 'closed');
  const pipelineValue = activeLeads.reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);

  const handleGenerateInsights = async () => {
    setAiLoading(true);
    setAiOutput('');
    const prompt = `I have ${leads.length} leads in my CRM. Active stages summary:
- New: ${leads.filter(l => l.stage === 'new').length}
- Contacted: ${leads.filter(l => l.stage === 'contacted').length}
- Qualified: ${leads.filter(l => l.stage === 'qualified').length}
- Proposal Sent: ${leads.filter(l => l.stage === 'proposal').length}
- Closed Won: ${leads.filter(l => l.stage === 'closed').length}
- Lost: ${leads.filter(l => l.stage === 'lost').length}

Please analyze this CRM pipeline, identify major sales bottlenecks, point out high-priority deal opportunities, and give me 3 specific next steps to close more deals.`;

    const systemPrompt = `You are a CRM and Sales Optimization expert. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}. Be structured, concise, and highly actionable.`;

    try {
      const res = await callClaudeAPI(prompt, systemPrompt, lang, GC);
      setAiOutput(res);
    } catch (e) {
      setAiOutput(L('Error generating analysis. Please try again.', 'حدث خطأ أثناء تحليل البيانات. الرجاء المحاولة مرة أخرى.'));
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="pg on" id="pg-crm">
      {/* Header */}
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">🎯</span>
          <span>{L('Smart CRM', 'نظام إدارة العملاء')}</span>
        </div>
        <div className="pg-actions">
          <button className="btn-ai" onClick={() => openAIFor('crm')}>
            {L('AI Follow-up Suggestions', 'اقتراحات المتابعة بالذكاء الاصطناعي')}
          </button>
          <button
            className="btn btn-prime"
            onClick={() => {
              setLeadModalStage('new');
              setLeadModalOpen(true);
            }}
          >
            + {L('New Lead', 'عميل جديد')}
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="g4 stagger mb">
        <div className="stat-card">
          <div className="stat-lbl">👥 {L('Total Leads', 'إجمالي العملاء')}</div>
          <div className="stat-val">{leads.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">🔥 {L('Hot Leads', 'العملاء الساخنون')}</div>
          <div className="stat-val ch-up">{hotLeads.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">💰 {L('Pipeline Value', 'قيمة المبيعات المحتملة')}</div>
          <div className="stat-val">{formatMoney(pipelineValue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">✅ {L('Closed (Month)', 'الصفقات المغلقة')}</div>
          <div className="stat-val ch-up">{closedLeads.length}</div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="tabs-bar" id="crm-tabs" style={{ marginBottom: '20px' }}>
        <button
          className={`tab-btn ${activeTab === 'pipeline' ? 'on' : ''}`}
          onClick={() => setActiveTab('pipeline')}
        >
          {L('Pipeline Board', 'لوحة الخطوات')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'contacts' ? 'on' : ''}`}
          onClick={() => setActiveTab('contacts')}
        >
          {L('All Contacts', 'كل جهات الاتصال')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'followups' ? 'on' : ''}`}
          onClick={() => setActiveTab('followups')}
        >
          {L('Follow-ups', 'المتابعات')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'insights' ? 'on' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          {L('AI Insights', 'تحليلات الذكاء الاصطناعي')}
        </button>
      </div>

      {/* Sub View Panels */}

      {/* 1. PIPELINE TAB (KANBAN) */}
      {activeTab === 'pipeline' && (
        <div className="kanban" id="crm-kanban-board">
          {stages.map((stage) => {
            const stageLeads = leads.filter((l) => l.stage === stage.key);
            return (
              <div className="kanban-col" key={stage.key}>
                <div className="kanban-col-hd">
                  <div className="kanban-col-title" style={{ color: stage.color }}>{stage.label}</div>
                  <div className="kanban-col-count">{stageLeads.length}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '120px' }}>
                  {stageLeads.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px 8px', fontSize: '12px', color: 'var(--t3)' }}>
                      {L('Drop leads here', 'أضف عملاء هنا')}
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        className="kanban-card"
                        key={lead.id}
                        onClick={() => alert(`${lead.name} — ${formatMoney(lead.value)} — ${stage.label}`)}
                      >
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)', marginBottom: '3px' }}>
                          {lead.name}
                        </div>
                        {lead.value > 0 && (
                          <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--green)' }}>
                            {formatMoney(lead.value)}
                          </div>
                        )}
                        <div style={{ fontSize: '11px', color: 'var(--t2)', marginTop: '4px' }}>
                          {lead.source || 'Other'}
                        </div>
                        {lead.followupDate && (
                          <div style={{ fontSize: '10px', color: 'var(--amber)', marginTop: '3px' }}>
                            📅 {lead.followupDate}
                          </div>
                        )}

                        {/* Move stage buttons */}
                        <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                          {stages.filter(s => s.key !== stage.key).map(s => (
                            <button
                              key={s.key}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateLeadStage(lead.id, s.key);
                              }}
                              style={{
                                fontSize: '9px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                border: '1px solid var(--edge2)',
                                background: 'none',
                                cursor: 'pointer',
                                color: 'var(--t2)'
                              }}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '11px', padding: '5px', marginTop: '4px' }}
                  onClick={() => {
                    setLeadModalStage(stage.key);
                    setLeadModalOpen(true);
                  }}
                >
                  + {L('Add', 'إضافة')}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. ALL CONTACTS TAB */}
      {activeTab === 'contacts' && (
        <div className="card">
          <div id="crm-contacts-list">
            {leads.length === 0 ? (
              <div className="empty-state">
                <div className="es-icon">👥</div>
                <div className="es-title">{L('No contacts yet', 'لا توجد جهات اتصال بعد')}</div>
                <div className="es-sub">{L('Add your first lead to start tracking your pipeline', 'أضف عميلك الأول لبدء تتبع المبيعات')}</div>
                <button className="btn btn-prime" onClick={() => { setLeadModalStage('new'); setLeadModalOpen(true); }}>
                  + {L('Add First Lead', 'إضافة العميل الأول')}
                </button>
              </div>
            ) : (
              leads.map((l) => {
                const leadStage = stages.find(s => s.key === l.stage) || stages[0];
                return (
                  <div className="row" key={l.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: 'var(--ag)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '13px',
                          color: 'var(--a)',
                          flexShrink: 0
                        }}
                      >
                        {l.name ? l.name[0].toUpperCase() : 'L'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="rn">{l.name}</div>
                        <div className="rs">{l.email || l.phone || L('No contact info', 'لا تتوفر معلومات اتصال')}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span
                        className="badge"
                        style={{
                          borderColor: `${leadStage.color}33`,
                          background: `${leadStage.color}1a`,
                          color: leadStage.color
                        }}
                      >
                        {leadStage.label}
                      </span>
                      {l.value > 0 && (
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--green)' }}>
                          {formatMoney(l.value)}
                        </div>
                      )}

                      <button
                        className="btn btn-ghost"
                        style={{ padding: '3px 8px', fontSize: '11px', color: 'var(--red)', borderColor: 'var(--red)' }}
                        onClick={() => deleteLead(l.id)}
                      >
                        {L('Delete', 'حذف')}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 3. FOLLOW-UPS TAB */}
      {activeTab === 'followups' && (
        <div className="g2">
          {/* Overdue */}
          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">⏰ {L('Overdue Follow-ups', 'متابعات متأخرة')}</div>
            </div>
            <div id="crm-overdue">
              {leads.filter(l => l.followupDate && new Date(l.followupDate) < new Date() && l.stage !== 'closed' && l.stage !== 'lost').length === 0 ? (
                <div className="empty-state" style={{ padding: '20px' }}>
                  <div className="es-icon">✅</div>
                  <div className="es-title">{L('All caught up!', 'كل شيء مكتمل!')}</div>
                </div>
              ) : (
                leads.filter(l => l.followupDate && new Date(l.followupDate) < new Date() && l.stage !== 'closed' && l.stage !== 'lost').map(l => (
                  <div className="row" key={l.id}>
                    <div style={{ flex: 1 }}>
                      <div className="rn">{l.name}</div>
                      <div className="rs">{L('Due:', 'تاريخ الاستحقاق:')} {l.followupDate}</div>
                    </div>
                    {l.phone && (
                      <a
                        className="btn btn-ghost"
                        style={{ fontSize: '11px', padding: '4px 9px', textDecoration: 'none', color: 'var(--green)', borderColor: 'var(--green)' }}
                        href={`https://wa.me/${l.phone.replace(/[+\s-]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {L('WhatsApp', 'واتساب')}
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Today */}
          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">📅 {L("Today's Follow-ups", "متابعات اليوم")}</div>
            </div>
            <div id="crm-today-fu">
              {leads.filter(l => l.followupDate && new Date(l.followupDate).toDateString() === new Date().toDateString()).length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--t3)', padding: '16px 0', textAlign: 'center' }}>
                  {L('No follow-ups scheduled for today', 'لا توجد متابعات مجدولة اليوم')}
                </div>
              ) : (
                leads.filter(l => l.followupDate && new Date(l.followupDate).toDateString() === new Date().toDateString()).map(l => {
                  const leadStage = stages.find(s => s.key === l.stage) || stages[0];
                  return (
                    <div className="row" key={l.id}>
                      <div style={{ flex: 1 }}>
                        <div className="rn">{l.name}</div>
                        <div className="rs">{leadStage.label}</div>
                      </div>
                      {l.phone ? (
                        <a
                          className="btn btn-prime"
                          style={{ fontSize: '11px', padding: '4px 9px', textDecoration: 'none' }}
                          href={`https://wa.me/${l.phone.replace(/[+\s-]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {L('Follow Up', 'متابعة')}
                        </a>
                      ) : (
                        <button className="btn btn-prime" style={{ fontSize: '11px', padding: '4px 9px' }} onClick={() => alert(L('Opening contact panel...', 'جاري فتح لوحة الاتصال...'))}>
                          {L('Follow Up', 'متابعة')}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. AI INSIGHTS TAB */}
      {activeTab === 'insights' && (
        <div className="card">
          <div className="sec-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="sec-title">✦ {L('AI CRM Analysis', 'تحليل نظام العملاء بالذكاء الاصطناعي')}</div>
            {leads.length > 0 && (
              <button
                className="btn-ai"
                onClick={handleGenerateInsights}
                disabled={aiLoading}
              >
                {aiLoading ? L('Analyzing...', 'جاري التحليل...') : L('✦ Generate AI Analysis', '✦ توليد تحليل ذكي')}
              </button>
            )}
          </div>
          <div id="crm-ai-insights" style={{ marginTop: '12px' }}>
            {leads.length === 0 ? (
              <div className="empty-state">
                <div className="es-icon">🎯</div>
                <div className="es-title">{L('Add leads to get AI insights', 'أضف عملاء للحصول على تحليلات ذكية')}</div>
                <div className="es-sub">
                  {L('The AI will analyze your pipeline, identify hot opportunities, and suggest next steps', 'سيقوم الذكاء الاصطناعي بتحليل خطوات مبيعاتك وتحديد الفرص الذهبية واقتراح الخطوات التالية')}
                </div>
              </div>
            ) : aiOutput ? (
              <div
                className="ai-box"
                style={{ padding: '16px', background: 'var(--surface2)', borderRadius: '10px', lineHeight: '1.6' }}
                dangerouslySetInnerHTML={{
                  __html: aiOutput
                    .replace(/\n/g, '<br>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                }}
              />
            ) : (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="es-icon">🤖</div>
                <div className="es-title">{L('Generate pipeline analysis', 'توليد تحليل مسار المبيعات')}</div>
                <div className="es-sub">
                  {L('Click the button above to analyze your CRM pipeline and get custom recommendations.', 'انقر على الزر أعلاه لتحليل مسار المبيعات والحصول على توصيات مخصصة.')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
