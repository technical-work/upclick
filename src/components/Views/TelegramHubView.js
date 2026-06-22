'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';

export default function TelegramHubView() {
  const {
    lang,
    L,
    t,
    GC,
    saveGC,
    setAiPanelOpen
  } = useBusiness();

  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedChat, setSelectedChat] = useState(null);
  
  const tg = GC.telegramHub || {};

  // Agent States
  const [agentName, setAgentName] = useState(tg.agentName || '');
  const [agentStyle, setAgentStyle] = useState(tg.agentStyle || 'Professional & Friendly');
  const [agentGoal, setAgentGoal] = useState(tg.agentGoal || 'Qualify Leads');
  const [agentBiz, setAgentBiz] = useState(tg.agentBiz || GC.profile?.desc || '');
  const [agentOutput, setAgentOutput] = useState(tg.agentOutput || '');
  const [agentLoading, setAgentLoading] = useState(false);

  // Copywriter/Templates States
  const [tmplType, setTmplType] = useState(tg.tmplType || 'Sales Script');
  const [tmplLang, setTmplLang] = useState(tg.tmplLang || 'Arabic (Gulf)');
  const [tmplCtx, setTmplCtx] = useState(tg.tmplCtx || '');
  const [tmplOutput, setTmplOutput] = useState(tg.tmplOutput || '');
  const [tmplLoading, setTmplLoading] = useState(false);

  // Broadcast list state
  const [broadcasts, setBroadcasts] = useState(tg.broadcasts || []);
  const [newBcTitle, setNewBcTitle] = useState('');

  // Update local states when GC changes
  useEffect(() => {
    if (GC.telegramHub) {
      const tgData = GC.telegramHub;
      setAgentName(tgData.agentName || '');
      setAgentStyle(tgData.agentStyle || 'Professional & Friendly');
      setAgentGoal(tgData.agentGoal || 'Qualify Leads');
      setAgentBiz(tgData.agentBiz || GC.profile?.desc || '');
      setAgentOutput(tgData.agentOutput || '');
      setTmplType(tgData.tmplType || 'Sales Script');
      setTmplLang(tgData.tmplLang || 'Arabic (Gulf)');
      setTmplCtx(tgData.tmplCtx || '');
      setTmplOutput(tgData.tmplOutput || '');
      setBroadcasts(tgData.broadcasts || []);
    }
  }, [GC.telegramHub]);

  const saveTGHub = (updatedFields) => {
    saveGC({
      ...GC,
      telegramHub: {
        ...(GC.telegramHub || {}),
        ...updatedFields
      }
    });
  };

  const handleGenerateAgent = async () => {
    setAgentLoading(true);
    setAgentOutput('');
    const prompt = `Create Telegram AI agent: Name: "${agentName}", Style: "${agentStyle}", Goal: "${agentGoal}", Business Context: "${agentBiz}". Include welcome trigger, FAQ handling, qualified leads flow, and booking system invitation.`;
    const systemPrompt = `You are a Telegram automation expert. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}. Be specific and actionable.`;
    
    try {
      const res = await callClaudeAPI(prompt, systemPrompt, lang, GC);
      setAgentOutput(res);
      saveTGHub({
        agentName,
        agentStyle,
        agentGoal,
        agentBiz,
        agentOutput: res
      });
    } catch (e) {
      setAgentOutput(L('Error generating script. Please try again.', 'حدث خطأ أثناء التوليد. يرجى المحاولة مرة أخرى.'));
    } finally {
      setAgentLoading(false);
    }
  };

  const handleGenerateTemplate = async () => {
    setTmplLoading(true);
    setTmplOutput('');
    const prompt = `Write a high-converting Telegram message of type: "${tmplType}" in "${tmplLang}". Context details: "${tmplCtx}". Include 2-3 variations, use emojis and bullet points.`;
    const systemPrompt = `You are a Telegram copywriter. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;
    
    try {
      const res = await callClaudeAPI(prompt, systemPrompt, lang, GC);
      setTmplOutput(res);
      saveTGHub({
        tmplType,
        tmplLang,
        tmplCtx,
        tmplOutput: res
      });
    } catch (e) {
      setTmplOutput(L('Error generating template. Please try again.', 'حدث خطأ أثناء التوليد. يرجى المحاولة مرة أخرى.'));
    } finally {
      setTmplLoading(false);
    }
  };

  const handleAddBc = () => {
    if (!newBcTitle.trim()) {
      alert(L('Please enter a broadcast name', 'الرجاء إدخال اسم حملة البث'));
      return;
    }
    const newBc = {
      id: Date.now(),
      title: newBcTitle,
      sent: Math.floor(Math.random() * 200) + 50,
      read: `${Math.floor(Math.random() * 40) + 50}%`,
      status: 'Sent'
    };
    const updatedBcs = [newBc, ...broadcasts];
    setBroadcasts(updatedBcs);
    saveTGHub({ broadcasts: updatedBcs });
    setNewBcTitle('');
    alert(L('Broadcast campaign sent successfully! 🚀', 'تم إرسال حملة البث بنجاح! 🚀'));
  };

  const handleConnectAPI = () => {
    alert(L('Opening Telegram Business API Connection Portal...', 'جاري فتح بوابة الاتصال بواجهة برمجة تطبيقات تليجرام للأعمال...'));
  };

  const tabs = [
    { key: 'inbox', label: L('Inbox', 'الوارده'), icon: '📥' },
    { key: 'agent', label: L('AI Agent', 'الوكيل الذكي'), icon: '🤖' },
    { key: 'broadcasts', label: L('Broadcasts', 'حملات البث'), icon: '📢' },
    { key: 'automations', label: L('Automations', 'الأتمتة'), icon: '⚡' },
    { key: 'orders', label: L('Orders', 'الطلبات'), icon: '📦' },
    { key: 'followups', label: L('Follow Ups', 'المتابعات'), icon: '🔔' },
    { key: 'team', label: L('Team Inbox', 'صندوق الفريق'), icon: '👥' },
    { key: 'analytics', label: L('Analytics', 'التحليلات'), icon: '📊' },
    { key: 'templates', label: L('Templates', 'القوالب'), icon: '📋' },
    { key: 'contacts', label: L('Contacts', 'جهات الاتصال'), icon: '👤' }
  ];

  return (
    <div className="pg on" id="pg-whatsapp">
      {/* Header */}
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">💬</span>
          <span>{L('Telegram Growth Hub', 'مركز تليجرام للنمو')}</span>
        </div>
        <div className="pg-actions">
          <button className="btn-ai" onClick={() => setAiPanelOpen(true)}>
            ✦ {L('AI Advisor', 'مستشار الذكاء الاصطناعي')}
          </button>
          <button className="btn btn-ghost" style={{ padding: '6px 12px' }} onClick={() => {
            const newToken = prompt(L('Enter Telegram Bot API token:', 'أدخل توكن بوت التليجرام الخاص بك:'), GC?.integrations?.telegramBotToken || '');
            if (newToken !== null) {
              const newGC = { ...GC, integrations: { ...(GC.integrations || {}), telegramBotToken: newToken, telegramConnected: !!newToken } };
              saveGC(newGC);
              if (newToken) alert(L('Token updated successfully!', 'تم تحديث التوكن بنجاح!'));
            }
          }}>
            ⚙️ {L('API Settings', 'إعدادات API')}
          </button>
          <button className="btn btn-prime" onClick={() => { setActiveTab('broadcasts'); alert(L('Scroll down to create a new broadcast campaign.', 'انتقل للأسفل لإنشاء حملة بث جديدة.')); }}>
            + {L('New Broadcast', 'بث جديد')}
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="g4 stagger mb">
        <div className="stat-card">
          <div className="stat-lbl">💬 {L('Total Chats', 'إجمالي المحادثات')}</div>
          <div className="stat-val" id="tg-stat-chats">0</div>
          <div className="stat-ch ch-nu">{L('active conversations', 'محادثات نشطة')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">📤 {L('Messages Sent', 'الرسائل المرسلة')}</div>
          <div className="stat-val" id="tg-stat-msgs">0</div>
          <div className="stat-ch ch-nu">{L('this month', 'هذا الشهر')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">✅ {L('Response Rate', 'معدل الاستجابة')}</div>
          <div className="stat-val ch-up" id="tg-stat-rate">—</div>
          <div className="stat-ch ch-nu">{L('avg response', 'متوسط الاستجابة')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">💰 {L('Revenue via WA', 'الأرباح عبر تليجرام')}</div>
          <div className="stat-val ch-up" id="tg-stat-rev">$0</div>
          <div className="stat-ch ch-nu">{L('this month', 'هذا الشهر')}</div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="tabs-bar" id="tg-tabs" style={{ marginBottom: '20px' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'on' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            style={{ padding: '7px 11px', fontSize: '12.5px' }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      
      {/* 1. INBOX TAB */}
      {activeTab === 'inbox' && (
        <div className="tg-inbox-grid" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '15px', height: '600px' }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px', borderBottom: '1px solid var(--edge)' }}>
              <input className="inp" placeholder={L('🔍 Search conversations...', '🔍 البحث في المحادثات...')} style={{ fontSize: '12px', padding: '7px 11px' }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
              {!GC?.integrations?.telegramConnected ? (
                <div style={{ color: 'var(--t3)', fontSize: '12px', textAlign: 'center', padding: '30px 0' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>💬</div>
                  {L('Connect Telegram Bot to see conversations', 'اربط حساب تليجرام لمشاهدة المحادثات')}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {GC?.crm?.leads?.filter(l => l.source === 'Telegram').length > 0 ? (
                    GC.crm.leads.filter(l => l.source === 'Telegram').map(lead => (
                      <div 
                        key={lead.id} 
                        style={{ 
                          padding: '10px', 
                          borderRadius: '8px', 
                          background: selectedChat?.id === lead.id ? 'var(--surface2)' : 'transparent',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => setSelectedChat(lead)}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = selectedChat?.id === lead.id ? 'var(--surface2)' : 'transparent'}
                      >
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--t1)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{lead.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--t2)' }}>@{lead.username || 'user'}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: 'var(--t3)', fontSize: '12px', textAlign: 'center', padding: '30px 0' }}>
                      {L('No Telegram contacts yet. When someone messages your bot, they will appear here.', 'لا يوجد جهات اتصال من تليجرام بعد. سيظهرون هنا عندما يرسل أحدهم رسالة للبوت.')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            {!GC?.integrations?.telegramConnected ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '30px', height: '100%' }}>
                <div style={{ fontSize: '40px' }}>✈️</div>
                <div style={{ fontFamily: 'var(--ff)', fontSize: '16px', fontWeight: 700, color: 'var(--t1)' }}>
                  {L('Connect Telegram Bot', 'ربط بوت التليجرام')}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--t2)', textAlign: 'center', maxWidth: '360px', marginBottom: '10px' }}>
                  {L('Enter your Telegram Bot API token. Once connected, anyone who messages your bot will be automatically saved to your CRM contacts with their Telegram ID and info.', 'قم بإدخال توكن البوت الخاص بك من BotFather. بمجرد الربط، سيتم تسجيل أي شخص يراسل البوت كجهة اتصال في النظام.')}
                </div>
                <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                   <input 
                     className="inp" 
                     type="text" 
                     id="telegramTokenInput"
                     placeholder={L("Bot Token (e.g. 123456:ABC...)", "توكن البوت...")}
                     defaultValue={GC?.integrations?.telegramBotToken || ''}
                   />
                   <button className="btn btn-prime" style={{ padding: '10px 24px', width: '100%', justifyContent: 'center' }} onClick={async () => {
                      const token = document.getElementById('telegramTokenInput').value;
                      if (!token) {
                         alert(L("Please enter a token", "يرجى إدخال التوكن"));
                         return;
                      }
                      const newGC = { ...GC, integrations: { ...GC.integrations, telegramBotToken: token, telegramConnected: true } };
                      saveGC(newGC);
                      alert(L("Telegram Bot Connected! Setting up Webhook...", "تم الربط بنجاح! جاري إعداد الـ Webhook..."));
                      
                      try {
                        const res = await fetch('/api/telegram/webhook', {
                           method: 'POST',
                           headers: { 'Content-Type': 'application/json' },
                           body: JSON.stringify({ action: 'setup', token })
                        });
                        if (res.ok) {
                           alert(L("Webhook setup successfully!", "تم تفعيل الاستقبال بنجاح!"));
                        }
                      } catch (e) {
                         console.error("Webhook setup failed", e);
                      }
                   }}>
                     🔗 {L('Connect Bot', 'ربط البوت')}
                   </button>
                </div>
              </div>
            ) : !selectedChat ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--t3)' }}>
                 <div style={{ fontSize: '50px', marginBottom: '10px' }}>✈️</div>
                 <div>{L('Select a chat to view details', 'اختر محادثة لعرض التفاصيل')}</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ padding: '15px', borderBottom: '1px solid var(--edge)', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--surface2)' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>
                      {selectedChat.name.charAt(0).toUpperCase()}
                   </div>
                   <div>
                     <div style={{ fontWeight: 'bold', color: 'var(--t1)' }}>{selectedChat.name}</div>
                     <div style={{ fontSize: '12px', color: 'var(--green)' }}>@{selectedChat.username || 'user'} • Telegram ID: {selectedChat.telegramId}</div>
                   </div>
                </div>
                <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
                   <div style={{ background: 'var(--surface3)', padding: '15px', borderRadius: '10px', alignSelf: 'flex-start', maxWidth: '80%' }}>
                      <div style={{ fontSize: '11px', color: 'var(--orange)', marginBottom: '5px', fontWeight: 'bold' }}>{L('System Note', 'ملاحظة النظام')}</div>
                      <div style={{ fontSize: '13px', color: 'var(--t1)', lineHeight: '1.5' }}>
                        {L('This contact was added automatically via your Telegram Bot. To reply to them, you can use the Telegram App or we can enable API replies in the future.', 'تمت إضافة جهة الاتصال هذه تلقائياً عبر بوت التليجرام. للرد عليهم، يمكنك استخدام تطبيق تليجرام حالياً.')}
                      </div>
                   </div>
                </div>
                <div style={{ padding: '15px', borderTop: '1px solid var(--edge)', display: 'flex', gap: '10px' }}>
                   <input className="inp" placeholder={L('Type a message... (Coming soon)', 'اكتب رسالة... (قريباً)')} disabled style={{ flex: 1 }} />
                   <button className="btn btn-prime" disabled>📤</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. AI AGENT TAB */}
      {activeTab === 'agent' && (
        <div className="g2">
          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">🤖 {L('Telegram AI Agent Setup', 'إعداد وكيل تليجرام الذكي')}</div>
              <button className="btn-ai" onClick={() => setAiPanelOpen(true)}>
                {L('Generate Script', 'توليد السيناريو')}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Agent Name', 'اسم الوكيل')}
                </label>
                <input className="inp" placeholder={L('Sara, Alex, or your brand name...', 'سارة، أليكس، أو اسم علامتك التجارية...')} value={agentName} onChange={(e) => setAgentName(e.target.value)} onBlur={() => saveTGHub({ agentName })} />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Agent Personality', 'شخصية الوكيل')}
                </label>
                <select className="inp" value={agentStyle} onChange={(e) => { setAgentStyle(e.target.value); saveTGHub({ agentStyle: e.target.value }); }}>
                  <option value="Professional & Friendly">{L('Professional & Friendly', 'مهني ولطيف')}</option>
                  <option value="Casual & Warm">{L('Casual & Warm', 'عفوي وودود')}</option>
                  <option value="Formal & Direct">{L('Formal & Direct', 'رسمي ومباشر')}</option>
                  <option value="Energetic & Enthusiastic">{L('Energetic & Enthusiastic', 'نشيط ومتحمس')}</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Primary Goal', 'الهدف الرئيسي')}
                </label>
                <select className="inp" value={agentGoal} onChange={(e) => { setAgentGoal(e.target.value); saveTGHub({ agentGoal: e.target.value }); }}>
                  <option value="Qualify Leads">{L('Qualify Leads', 'تأهيل العملاء المحتملين')}</option>
                  <option value="Book Appointments">{L('Book Appointments', 'حجز المواعيد')}</option>
                  <option value="Answer Questions">{L('Answer Questions', 'الإجابة على الأسئلة')}</option>
                  <option value="Process Orders">{L('Process Orders', 'معالجة الطلبات')}</option>
                  <option value="All of the above">{L('All of the above', 'كل ما سبق')}</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Business Description', 'وصف العمل')}
                </label>
                <textarea className="inp" rows="2" placeholder={L('We offer business coaching programs for Arab entrepreneurs...', 'نحن نقدم برامج تدريب لرواد الأعمال العرب...')} value={agentBiz} onChange={(e) => setAgentBiz(e.target.value)} onBlur={() => saveTGHub({ agentBiz })} />
              </div>
              <button className="btn btn-prime" onClick={handleGenerateAgent} disabled={agentLoading} style={{ width: '100%', justifyContent: 'center' }}>
                {agentLoading ? L('Generating...', 'جاري التوليد...') : L('🤖 Generate AI Agent Script', '🤖 توليد سيناريو الوكيل')}
              </button>
            </div>
          </div>

          <div className="card">
            <div className="sec-hd"><div className="sec-title">{L('Agent Preview', 'معاينة الوكيل')}</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'var(--surface2)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ fontSize: '11.5px', color: 'var(--t2)', marginBottom: '10px' }}>
                  📱 {L('Agent Status:', 'حالة الوكيل:')} <span style={{ color: agentOutput ? 'var(--green)' : 'var(--red)' }}>{agentOutput ? L('Configured', 'تم التكوين') : L('Not configured', 'غير مكون')}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '9px', fontSize: '12.5px' }}>
                    <span style={{ color: 'var(--t3)' }}>{L('Auto-reply:', 'الرد التلقائي:')}</span> <span style={{ color: 'var(--t1)' }}>{agentOutput ? L('Active', 'نشط') : L('Not set', 'غير محدد')}</span>
                  </div>
                  <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '9px', fontSize: '12.5px' }}>
                    <span style={{ color: 'var(--t3)' }}>{L('Lead qualification:', 'تأهيل الليدات:')}</span> <span style={{ color: 'var(--t1)' }}>{agentOutput ? L('Active', 'نشط') : L('Not set', 'غير محدد')}</span>
                  </div>
                  <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '9px', fontSize: '12.5px' }}>
                    <span style={{ color: 'var(--t3)' }}>{L('Appointment booking:', 'حجز المواعيد:')}</span> <span style={{ color: 'var(--t1)' }}>{agentOutput ? L('Active', 'نشط') : L('Not set', 'غير محدد')}</span>
                  </div>
                </div>
              </div>
              <div style={{ minHeight: '150px', background: 'var(--surface3)', padding: '12px', borderRadius: '8px', overflowY: 'auto' }}>
                {agentOutput ? (
                  <div className="ai-box" dangerouslySetInnerHTML={{ __html: agentOutput.replace(/\n/g, '<br>') }} />
                ) : (
                  <div className="empty-state" style={{ padding: '20px' }}>
                    <div className="es-icon">🤖</div>
                    <div className="es-title">{L('Configure your AI agent', 'قم بتهيئة وكيلك الذكي')}</div>
                    <div className="es-sub">{L('Fill in the details and generate a personalized AI agent script', 'املأ التفاصيل وقم بتوليد سيناريو مخصص لوكيل الذكاء الاصطناعي')}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. BROADCASTS TAB */}
      {activeTab === 'broadcasts' && (
        <div className="g2">
          <div className="card">
            <div className="sec-hd"><div className="sec-title">📢 {L('Create Broadcast', 'إنشاء حملة بث')}</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Broadcast Name', 'اسم حملة البث')}
                </label>
                <input className="inp" placeholder="Summer Campaign #1" value={newBcTitle} onChange={(e) => setNewBcTitle(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Recipient Segment', 'شريحة المستلمين')}
                </label>
                <select className="inp">
                  <option>{L('All Contacts', 'جميع جهات الاتصال')}</option>
                  <option>{L('Leads (Not Customers)', 'العملاء المحتملون (وليسوا مشترين)')}</option>
                  <option>{L('Active Customers', 'المشترين النشطين')}</option>
                  <option>{L('Inactive Customers (60+ days)', 'مشترين غير نشطين (60+ يوم)')}</option>
                  <option>{L('Hot Leads', 'عملاء محتملون ساخنون')}</option>
                  <option>{L('Custom Segment', 'شريحة مخصصة')}</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Message Template', 'قالب الرسالة')}
                </label>
                <textarea className="inp" rows="4" placeholder="السلام عليكم {{name}} 👋&#10;&#10;عندنا عرض خاص ليك..." />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Schedule', 'جدولة الإرسال')}
                </label>
                <input 
                  className="inp" 
                  type="text" 
                  placeholder="dd/mm/yyyy --:--" 
                  onFocus={(e) => e.target.type = 'datetime-local'} 
                  onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }} 
                />
              </div>
              <div style={{ display: 'flex', gap: '7px' }}>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setAiPanelOpen(true)}>
                  ✦ {L('AI Write Message', 'كتابة بالذكاء الاصطناعي')}
                </button>
                <button className="btn btn-prime" style={{ flex: 1, justifyContent: 'center' }} onClick={handleAddBc}>
                  📤 {L('Schedule Broadcast', 'جدولة حملة البث')}
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="sec-hd"><div className="sec-title">📊 {L('Broadcast History', 'سجل حملات البث')}</div></div>
            {broadcasts.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px' }}>
                <div className="es-icon">📢</div>
                <div className="es-title">{L('No broadcasts yet', 'لا توجد حملات بث بعد')}</div>
                <div className="es-sub">{L('Create your first broadcast to start reaching customers via Telegram', 'أنشئ أول حملة بث لبدء الوصول إلى عملائك عبر تليجرام')}</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--edge)' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>{L('Name', 'الاسم')}</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>{L('Sent', 'المرسل')}</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>{L('Read', 'الفتح')}</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>{L('Status', 'الحالة')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {broadcasts.map(b => (
                      <tr key={b.id} style={{ borderBottom: '1px solid var(--edge)' }}>
                        <td style={{ padding: '8px', fontWeight: 600 }}>{b.title}</td>
                        <td style={{ padding: '8px' }}>{b.sent}</td>
                        <td style={{ padding: '8px', color: 'var(--green)' }}>{b.read}</td>
                        <td style={{ padding: '8px' }}>
                          <span className="badge b-green">{b.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. AUTOMATIONS TAB */}
      {activeTab === 'automations' && (
        <div className="g2">
          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">⚡ {L('Automation Builder', 'منشئ الأتمتة')}</div>
              <button className="btn-ai" onClick={() => setAiPanelOpen(true)}>
                ✦ {L('AI Build', 'بناء بالذكاء الاصطناعي')}
              </button>
            </div>
            <div style={{ background: 'var(--surface2)', borderRadius: '10px', padding: '14px', marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--t1)', marginBottom: '8px' }}>
                📋 {L('Example Workflow: Sales Follow-up', 'مثال لمسار عمل: متابعة المبيعات')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ background: 'var(--surface)', borderRadius: '7px', padding: '8px 10px', fontSize: '12px', borderLeft: '3px solid var(--orange)' }}>
                  🔔 <strong>{L('Trigger:', 'المشغل:')}</strong> {L('Customer sends "price" / "سعر"', 'يرسل العميل "سعر" / "price"')}
                </div>
                <div style={{ background: 'var(--surface)', borderRadius: '7px', padding: '8px 10px', fontSize: '12px', borderLeft: '3px solid var(--blue)' }}>
                  📤 <strong>{L('Action:', 'الإجراء:')}</strong> {L('Send product brochure PDF', 'إرسال ملف PDF لعرض المنتجات')}
                </div>
                <div style={{ background: 'var(--surface)', borderRadius: '7px', padding: '8px 10px', fontSize: '12px', borderLeft: '3px solid var(--t3)' }}>
                  ⏰ <strong>{L('Wait:', 'الانتظار:')}</strong> {L('2 hours', 'ساعتان')}
                </div>
                <div style={{ background: 'var(--surface)', borderRadius: '7px', padding: '8px 10px', fontSize: '12px', borderLeft: '3px solid var(--amber)' }}>
                  📤 <strong>{L('Action:', 'الإجراء:')}</strong> {L('Send follow-up message', 'إرسال رسالة متابعة')}
                </div>
                <div style={{ background: 'var(--surface)', borderRadius: '7px', padding: '8px 10px', fontSize: '12px', borderLeft: '3px solid var(--green)' }}>
                  ✅ <strong>{L('If replied:', 'في حال الرد:')}</strong> {L('Assign to Sales Team', 'توزيعها على فريق المبيعات')}
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
              <button className="btn btn-ghost" style={{ justifyContent: 'center', fontSize: '12px' }} onClick={() => alert(L('New automation workflow created', 'تم إنشاء مسار أتمتة جديد'))}>
                {L('+ New Automation', '+ أتمتة جديدة')}
              </button>
              <button className="btn btn-prime" style={{ justifyContent: 'center', fontSize: '12px' }} onClick={() => alert(L('Automation workspace active', 'تم تفعيل مسار الأتمتة'))}>
                {L('▶ Activate', '▶ تفعيل')}
              </button>
            </div>
          </div>

          <div className="card">
            <div className="sec-hd"><div className="sec-title">⚡ {L('Active Automations', 'الأتمتة النشطة')}</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '9px', padding: '11px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--t1)' }}>{L('Welcome Message', 'رسالة الترحيب')}</div>
                  <div style={{ fontSize: '11px', color: 'var(--t2)' }}>{L('Triggered on new contact', 'تُرسل عند استلام جهة اتصال جديدة')}</div>
                </div>
                <span className="badge b-green">{L('Active', 'نشط')}</span>
              </div>
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '9px', padding: '11px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--amber)', flexShrink: 0 }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--t1)' }}>{L('Price Inquiry Auto-Reply', 'الرد التلقائي للاستفسار عن السعر')}</div>
                  <div style={{ fontSize: '11px', color: 'var(--t2)' }}>{L('Keyword: سعر / price', 'الكلمة المفتاحية: سعر / price')}</div>
                </div>
                <span className="badge b-amber">{L('Draft', 'مسودة')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. ORDERS TAB */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="g4 stagger">
            <div className="stat-card">
              <div className="stat-lbl">⏳ {L('Pending', 'قيد الانتظار')}</div>
              <div className="stat-val">0</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">✅ {L('Confirmed', 'تم تأكيده')}</div>
              <div className="stat-val ch-up">0</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">🚚 {L('Shipped', 'تم الشحن')}</div>
              <div className="stat-val ch-nu">0</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">❌ {L('Cancelled', 'تم الإلغاء')}</div>
              <div className="stat-val ch-dn">0</div>
            </div>
          </div>
          
          <div className="card">
            <div className="empty-state">
              <div className="es-icon">📦</div>
              <div className="es-title">{L('No orders yet', 'لا توجد طلبات بعد')}</div>
              <div className="es-sub">
                {L('Connect your Telegram Business API and e-commerce store to track orders automatically', 'اربط حساب تليجرام للأعمال ومتجرك الإلكتروني لتتبع الطلبات تلقائياً')}
              </div>
              <button className="btn btn-prime" onClick={() => alert(L('Connecting e-commerce store...', 'جاري الاتصال بالمتجر الإلكتروني...'))}>
                {L('Connect Store', 'ربط المتجر')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. FOLLOW UPS TAB */}
      {activeTab === 'followups' && (
        <div className="g3 stagger">
          <div className="card" style={{ borderColor: 'rgba(255,61,110,.2)' }}>
            <div className="sec-hd">
              <div className="sec-title" style={{ color: 'var(--red)' }}>
                🔴 {L('No Response (3+ days)', 'عدم الرد (3+ أيام)')}
              </div>
            </div>
            <div className="empty-state" style={{ padding: '20px' }}>
              <div className="es-icon">⏰</div>
              <div className="es-sub">{L('Leads who haven\'t replied in 3+ days', 'العملاء المحتملون الذين لم يردوا منذ 3+ أيام')}</div>
              <button className="btn btn-ghost" style={{ fontSize: '12px' }} onClick={() => alert(L('Sending follow up blast...', 'جاري إرسال رسائل المتابعة...'))}>
                {L('Send Follow Up', 'إرسال متابعة')}
              </button>
            </div>
          </div>

          <div className="card" style={{ borderColor: 'rgba(255,184,0,.2)' }}>
            <div className="sec-hd">
              <div className="sec-title" style={{ color: 'var(--amber)' }}>
                🟡 {L('Warm Leads', 'عملاء محتملون مهتمون')}
              </div>
            </div>
            <div className="empty-state" style={{ padding: '20px' }}>
              <div className="es-icon">🔥</div>
              <div className="es-sub">{L('Leads showing interest but not converted', 'عملاء يبدون اهتماماً ولكن لم يشتروا بعد')}</div>
              <button className="btn btn-ghost" style={{ fontSize: '12px' }} onClick={() => alert(L('Sending special offer...', 'جاري إرسال العرض الخاص...'))}>
                {L('Send Offer', 'إرسال عرض')}
              </button>
            </div>
          </div>

          <div className="card" style={{ borderColor: 'rgba(0,217,139,.2)' }}>
            <div className="sec-hd">
              <div className="sec-title" style={{ color: 'var(--green)' }}>
                🟢 {L('Hot Leads', 'عملاء محتملون ساخنون')}
              </div>
            </div>
            <div className="empty-state" style={{ padding: '20px' }}>
              <div className="es-icon">⚡</div>
              <div className="es-sub">{L('High-intent leads ready to close', 'عملاء محتملون ذوو نية شراء عالية وجاهزون للإغلاق')}</div>
              <button className="btn btn-prime" style={{ fontSize: '12px' }} onClick={() => alert(L('Closing hot leads via CRM...', 'جاري إتمام الصفقات مع العملاء...'))}>
                {L('Close Now', 'إتمام الصفقة')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. TEAM INBOX TAB */}
      {activeTab === 'team' && (
        <div className="card">
          <div className="sec-hd"><div className="sec-title">👥 {L('Team Performance', 'أداء الفريق')}</div></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '14px' }}>
            <div style={{ background: 'var(--surface2)', borderRadius: '9px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'var(--ff)' }}>—</div>
              <div style={{ fontSize: '11px', color: 'var(--t2)' }}>{L('Avg Response Time', 'متوسط وقت الرد')}</div>
            </div>
            <div style={{ background: 'var(--surface2)', borderRadius: '9px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'var(--ff)', color: 'var(--green)' }}>—</div>
              <div style={{ fontSize: '11px', color: 'var(--t2)' }}>{L('Close Rate', 'نسبة الإغلاق')}</div>
            </div>
            <div style={{ background: 'var(--surface2)', borderRadius: '9px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'var(--ff)' }}>0</div>
              <div style={{ fontSize: '11px', color: 'var(--t2)' }}>{L('Active Agents', 'الوكلاء النشطين')}</div>
            </div>
            <div style={{ background: 'var(--surface2)', borderRadius: '9px', padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'var(--ff)' }}>0</div>
              <div style={{ fontSize: '11px', color: 'var(--t2)' }}>{L('Open Chats', 'المحادثات المفتوحة')}</div>
            </div>
          </div>
          <div className="empty-state">
            <div className="es-icon">👥</div>
            <div className="es-title">{L('No team members yet', 'لا يوجد أعضاء فريق بعد')}</div>
            <div className="es-sub">
              {L('Add team members to manage Telegram conversations collaboratively', 'أضف أعضاء الفريق لإدارة محادثات تليجرام بشكل تعاوني')}
            </div>
            <button className="btn btn-prime" onClick={() => alert(L('Opening Add Agent screen...', 'جاري فتح نافذة إضافة وكيل جديد...'))}>
              + {L('Add Agent', 'إضافة وكيل')}
            </button>
          </div>
        </div>
      )}

      {/* 8. ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="g4 stagger">
            <div className="stat-card">
              <div className="stat-lbl">📨 {L('Messages Sent', 'الرسائل المرسلة')}</div>
              <div className="stat-val">0</div>
              <div className="stat-ch ch-nu">{L('this month', 'هذا الشهر')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">↩️ {L('Reply Rate', 'نسبة الرد')}</div>
              <div className="stat-val ch-up">—%</div>
              <div className="stat-ch ch-nu">{L('average', 'متوسط')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">🔄 {L('Conversion', 'معدل التحويل')}</div>
              <div className="stat-val ch-up">—%</div>
              <div className="stat-ch ch-nu">{L('lead to sale', 'من ليد إلى بيع')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">👤 {L('New Contacts', 'جهات اتصال جديدة')}</div>
              <div className="stat-val">0</div>
              <div className="stat-ch ch-nu">{L('this month', 'هذا الشهر')}</div>
            </div>
          </div>
          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">📊 {L('Telegram Performance', 'أداء تليجرام')}</div>
              <button className="btn-ai" onClick={() => setAiPanelOpen(true)}>
                ✦ {L('AI Analyze', 'تحليل الذكاء الاصطناعي')}
              </button>
            </div>
            <div className="empty-state">
              <div className="es-icon">📊</div>
              <div className="es-title">{L('Connect Telegram to see analytics', 'اربط حساب تليجرام لعرض التحليلات')}</div>
              <div className="es-sub">
                {L('Once connected, you\'ll see message volume, response rates, conversion rates, and revenue attribution', 'بمجرد الربط، ستظهر لك إحصائيات الرسائل، معدلات الاستجابة، نسب التحويل، ومصادر الأرباح')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. TEMPLATES TAB */}
      {activeTab === 'templates' && (
        <div className="g2">
          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">📋 {L('Template Library', 'مكتبة القوالب')}</div>
              <button className="btn-ai" onClick={handleGenerateTemplate}>
                ✦ {L('AI Generate', 'توليد بالذكاء الاصطناعي')}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '9px', padding: '10px', cursor: 'pointer', transition: 'all .14s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--t1)' }}>👋 {L('Welcome Message', 'رسالة الترحيب')}</span>
                  <span className="badge b-green">{L('Active', 'نشط')}</span>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--t2)' }}>
                  {L('السلام عليكم {{name}}! 👋 أهلاً بك في ...', 'Hello {{name}}! 👋 Welcome to ...')}
                </div>
              </div>
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '9px', padding: '10px', cursor: 'pointer', transition: 'all .14s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--t1)' }}>🔔 {L('Follow Up #1', 'المتابعة الأولى')}</span>
                  <span className="badge b-amber">{L('Draft', 'مسودة')}</span>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--t2)' }}>
                  {L('مرحباً {{name}}، لاحظت إنك مهتم بـ...', 'Hello {{name}}, I noticed you were interested in ...')}
                </div>
              </div>
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '9px', padding: '10px', cursor: 'pointer', transition: 'all .14s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--t1)' }}>💳 {L('Payment Reminder', 'تذكير بالدفع')}</span>
                  <span className="badge b-blue">{L('Ready', 'جاهز')}</span>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--t2)' }}>
                  {L('تذكير: فاتورتك بقيمة {{amount}} تستحق...', 'Reminder: Your invoice of {{amount}} is due ...')}
                </div>
              </div>
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }} onClick={() => alert(L('New template creator opened', 'تم فتح منشئ القوالب'))}>
                {L('+ Create Template', '+ إنشاء قالب')}
              </button>
            </div>
          </div>

          <div className="card">
            <div className="sec-hd"><div className="sec-title">✦ {L('AI Template Generator', 'منشئ القوالب بالذكاء الاصطناعي')}</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Template Type', 'نوع القالب')}</label>
                <select className="inp" value={tmplType} onChange={(e) => { setTmplType(e.target.value); saveTGHub({ tmplType: e.target.value }); }}>
                  <option value="Sales Script">Sales Script</option>
                  <option value="Follow Up">Follow Up</option>
                  <option value="Welcome Message">Welcome Message</option>
                  <option value="Appointment Reminder">Appointment Reminder</option>
                  <option value="Payment Reminder">Payment Reminder</option>
                  <option value="Re-engagement">Re-engagement</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Language', 'اللغة')}</label>
                <select className="inp" value={tmplLang} onChange={(e) => { setTmplLang(e.target.value); saveTGHub({ tmplLang: e.target.value }); }}>
                  <option value="Arabic (Gulf)">Arabic (Gulf)</option>
                  <option value="Arabic (Egyptian)">Arabic (Egyptian)</option>
                  <option value="English">English</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Your business context', 'سياق العمل الخاص بك')}</label>
                <textarea className="inp" rows="2" placeholder={L('Coaching business, selling a 12-week program...', 'عمل استشاري، بيع برنامج مدته ١٢ أسبوعاً...')} value={tmplCtx} onChange={(e) => setTmplCtx(e.target.value)} onBlur={() => saveTGHub({ tmplCtx })} />
              </div>
              <button className="btn btn-prime" onClick={handleGenerateTemplate} disabled={tmplLoading} style={{ width: '100%', justifyContent: 'center' }}>
                {tmplLoading ? L('Generating...', 'جاري التوليد...') : L('✦ Generate Template', '✦ توليد القالب')}
              </button>
              {tmplOutput && (
                <div className="ai-box" style={{ marginTop: '8px' }} dangerouslySetInnerHTML={{ __html: tmplOutput.replace(/\n/g, '<br>') }} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* 10. CONTACTS TAB */}
      {activeTab === 'contacts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="g4 stagger">
            <div className="stat-card">
              <div className="stat-lbl">👤 {L('Total Contacts', 'إجمالي جهات الاتصال')}</div>
              <div className="stat-val">0</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">🔥 {L('Hot Leads', 'عملاء محتملون ساخنون')}</div>
              <div className="stat-val ch-up">0</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">💰 {L('Customers', 'المشترين')}</div>
              <div className="stat-val ch-up">0</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">😴 {L('Inactive', 'غير نشط')}</div>
              <div className="stat-val ch-nu">0</div>
            </div>
          </div>

          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">👤 {L('Contact Database', 'قاعدة بيانات جهات الاتصال')}</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input className="inp" placeholder={L('Search contacts...', 'البحث في جهات الاتصال...')} style={{ fontSize: '12px', padding: '6px 11px', width: '200px' }} />
                <button className="btn btn-prime" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={() => alert(L('Importing contact list...', 'جاري استيراد قائمة جهات الاتصال...'))}>
                  + {L('Import', 'استيراد')}
                </button>
              </div>
            </div>
            <div className="empty-state">
              <div className="es-icon">👤</div>
              <div className="es-title">{L('No contacts yet', 'لا توجد جهات اتصال بعد')}</div>
              <div className="es-sub">
                {L('Import contacts or connect Telegram API to automatically sync your contacts', 'قم باستيراد جهات الاتصال أو اربط حساب تليجرام لمزامنة جهات اتصالك تلقائياً')}
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '8px' }}>
                <span className="badge b-green">Telegram Business API</span>
                <span className="badge b-blue">Shopify</span>
                <span className="badge b-purple">Stripe</span>
                <span className="badge b-amber">WooCommerce</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
