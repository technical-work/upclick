'use client';

import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';

export default function AutomationHubView() {
  const { t, L, setAiPanelOpen } = useBusiness();
  const [activeTab, setActiveTab] = useState('all');

  // Helper for tab switching
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  // State for Custom Builder
  const [cbTrigger, setCbTrigger] = useState('New WhatsApp message received');
  const [cbAction, setCbAction] = useState('');
  const [cbApps, setCbApps] = useState([]);
  const [cbCreds, setCbCreds] = useState('');
  const [building, setBuilding] = useState(false);
  const [buildResult, setBuildResult] = useState('');

  const handleAppToggle = (app) => {
    if (cbApps.includes(app)) {
      setCbApps(cbApps.filter(a => a !== app));
    } else {
      setCbApps([...cbApps, app]);
    }
  };

  const handleBuildCustom = () => {
    if (!cbAction.trim()) {
      alert(L('Please describe the action first', 'الرجاء وصف الإجراء المطلوب أولاً'));
      return;
    }
    setBuilding(true);
    setBuildResult('');
    
    // Simulate API call
    setTimeout(() => {
      setBuilding(false);
      setBuildResult(L('Automation JSON generated successfully! You can copy and import it into n8n.', 'تم إنشاء كود JSON للأتمتة بنجاح! يمكنك نسخه واستيراده إلى n8n.'));
    }, 2000);
  };

  const tabs = [
    { id: 'all', label: L('🔥 All Templates', '🔥 كل القوالب') },
    { id: 'sales', label: L('💰 Sales & CRM', '💰 المبيعات') },
    { id: 'content', label: L('✍️ Content', '✍️ المحتوى') },
    { id: 'whatsapp', label: L('💬 WhatsApp', '💬 واتساب') },
    { id: 'social', label: L('📱 Social Media', '📱 السوشيال ميديا') },
    { id: 'finance', label: L('💳 Finance', '💳 المالية') },
    { id: 'community', label: L('👥 Community', '👥 المجتمع') },
    { id: 'ai', label: L('🤖 AI Workflows', '🤖 مسارات الذكاء') },
    { id: 'custom', label: L('✦ Custom Builder', '✦ البناء المخصص') },
  ];

  return (
    <div className="pg on" id="pg-automation">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">⚡</span>
          {L('Automation Hub', 'مركز الأتمتة')}
          <span style={{ fontSize: '12px', color: 'var(--t3)', fontFamily: 'var(--fb)', fontWeight: 400, marginLeft: '8px' }}>
            powered by n8n
          </span>
        </div>
        <div className="pg-actions">
          <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '6px 13px' }}>
            📋 {L('My Automations', 'أتمتاتي')}
          </button>
          <button 
            className="btn-ai" 
            onClick={() => setAiPanelOpen(true)}
          >
            ✦ {L('AI Suggest', 'اقتراح الذكاء')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="g4 stagger mb">
        <div className="stat-card">
          <div className="stat-lbl">⚡ {L('Templates', 'القوالب')}</div>
          <div className="stat-val ch-up">24</div>
          <div className="stat-ch ch-nu">{L('ready to use', 'جاهزة للاستخدام')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">✅ {L('My Automations', 'أتمتاتي')}</div>
          <div className="stat-val">0</div>
          <div className="stat-ch ch-nu">{L('configured', 'تم إعدادها')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">⏱ {L('Time Saved', 'الوقت الموفر')}</div>
          <div className="stat-val ch-up">0h</div>
          <div className="stat-ch ch-nu">{L('estimated/month', 'مقدر/شهر')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">🔗 {L('n8n Status', 'حالة n8n')}</div>
          <div className="stat-val" style={{ fontSize: '14px' }}>{L('Not connected', 'غير متصل')}</div>
          <div className="stat-ch ch-nu">{L('Connect below', 'اتصل بالأسفل')}</div>
        </div>
      </div>

      {/* n8n Connection Banner */}
      <div className="card mb" style={{ background: 'linear-gradient(135deg,rgba(255,107,53,.08),rgba(108,53,255,.08))', borderColor: 'rgba(255,107,53,.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '32px' }}>⚡</div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontFamily: 'var(--ff)', fontSize: '15px', fontWeight: 800, color: 'var(--t1)', marginBottom: '4px' }}>
              {L('Connect your n8n instance', 'اربط حسابك في n8n')}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--t2)' }}>
              {L('Enter your n8n URL to deploy automations directly. Use n8n.cloud or self-hosted.', 'أدخل رابط n8n لنشر الأتمتة مباشرة.')}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input className="inp" placeholder="https://your-instance.n8n.cloud" style={{ width: '260px', fontSize: '13px' }} />
            <input className="inp" placeholder={L('API Key (optional)', 'مفتاح API (اختياري)')} style={{ width: '160px', fontSize: '13px' }} />
            <button className="btn btn-prime" style={{ whiteSpace: 'nowrap' }}>{L('Connect ⚡', 'توصيل ⚡')}</button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="tabs-bar" style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'on' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab !== 'custom' && (
        <div className="tab-panel on">
          <div className="empty-state" style={{ padding: '40px' }}>
            <div className="es-icon">⚡</div>
            <div className="es-title">{L('Templates coming soon', 'القوالب قريباً')}</div>
            <div className="es-sub">{L('Automations for this category are being prepared.', 'يتم تجهيز قوالب الأتمتة لهذا القسم.')}</div>
          </div>
        </div>
      )}

      {/* CUSTOM BUILDER */}
      {activeTab === 'custom' && (
        <div className="tab-panel on" id="at-custom">
          <div className="g2" style={{ alignItems: 'start' }}>
            <div className="card">
              <div className="sec-hd"><div className="sec-title">✦ {L('AI Automation Builder', 'بناء الأتمتة بالذكاء الاصطناعي')}</div></div>
              <div style={{ fontSize: '13.5px', color: 'var(--t2)', marginBottom: '16px', lineHeight: 1.7 }}>
                {L('Describe what you want to automate — I\'ll build the complete n8n workflow JSON for you, ready to import.', 'صف ما تريد أتمتته وسأقوم بإنشاء كود JSON كامل لمسار عمل n8n جاهز للاستيراد.')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('What trigger starts this automation?', 'ما الذي يطلق هذه الأتمتة؟')}
                  </label>
                  <select className="inp" value={cbTrigger} onChange={(e) => setCbTrigger(e.target.value)}>
                    <option>{L('New WhatsApp message received', 'استلام رسالة واتساب جديدة')}</option>
                    <option>{L('New lead added in CRM', 'إضافة عميل محتمل في CRM')}</option>
                    <option>{L('New form submission', 'إرسال نموذج جديد')}</option>
                    <option>{L('New payment received', 'استلام دفعة جديدة')}</option>
                    <option>{L('Scheduled time (daily/weekly)', 'وقت مجدول (يومي/أسبوعي)')}</option>
                    <option>{L('Webhook (custom)', 'Webhook مخصص')}</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('What should happen? (describe clearly)', 'ما الذي يجب أن يحدث؟ (اشرح بوضوح)')}
                  </label>
                  <textarea 
                    className="inp" 
                    rows="3" 
                    value={cbAction}
                    onChange={(e) => setCbAction(e.target.value)}
                    placeholder={L('e.g. Send a welcome WhatsApp message, then add them to my CRM as a new lead...', 'مثال: إرسال رسالة ترحيب عبر الواتساب ثم إضافتهم إلى CRM كعميل محتمل...')}
                  ></textarea>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Apps / Services involved', 'التطبيقات/الخدمات المعنية')}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '7px' }}>
                    {[
                      { id: 'whatsapp', icon: '💬', name: 'WhatsApp' },
                      { id: 'telegram', icon: '✈️', name: 'Telegram' },
                      { id: 'gmail', icon: '📧', name: 'Gmail' },
                      { id: 'sheets', icon: '📊', name: 'Sheets' },
                      { id: 'notion', icon: '📝', name: 'Notion' },
                      { id: 'stripe', icon: '💳', name: 'Stripe' },
                      { id: 'openai', icon: '🤖', name: 'OpenAI' }
                    ].map(app => (
                      <label 
                        key={app.id} 
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 9px', background: 'var(--surface2)', borderRadius: '8px', cursor: 'pointer', fontSize: '12.5px', color: 'var(--t2)' }}
                      >
                        <input 
                          type="checkbox" 
                          checked={cbApps.includes(app.id)}
                          onChange={() => handleAppToggle(app.id)}
                          style={{ accentColor: 'var(--orange)' }} 
                        /> 
                        {app.icon} {app.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Any specific account info / credentials needed?', 'هل هناك تفاصيل أو بيانات اعتماد مطلوبة؟')}
                  </label>
                  <textarea 
                    className="inp" 
                    rows="2" 
                    value={cbCreds}
                    onChange={(e) => setCbCreds(e.target.value)}
                    placeholder={L('e.g. My WhatsApp Business number: +966...', 'مثال: رقم الواتساب للأعمال الخاص بي...')}
                  ></textarea>
                </div>
                <button 
                  className="btn btn-prime" 
                  onClick={handleBuildCustom} 
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px' }}
                >
                  ⚡ {L('Build My Automation', 'بناء الأتمتة')}
                </button>
              </div>
              
              {building && (
                <div className="ai-box" style={{ marginTop: '14px', animation: 'pulse 1.5s infinite', textAlign: 'center' }}>
                  {L('Generating JSON workflow...', 'جاري إنشاء مسار العمل JSON...')}
                </div>
              )}

              {buildResult && !building && (
                <div className="ai-box" style={{ marginTop: '14px' }}>
                  {buildResult}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="card" style={{ borderColor: 'rgba(255,107,53,.2)' }}>
                <div className="sec-hd"><div className="sec-title" style={{ color: 'var(--orange)' }}>📖 {L('How to Import to n8n', 'كيفية الاستيراد لـ n8n')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { step: 1, title: L('Copy the JSON', 'نسخ JSON'), desc: L('Click "Copy JSON" on any generated automation', 'انقر على نسخ من أي أتمتة تم توليدها') },
                    { step: 2, title: L('Open n8n', 'افتح n8n'), desc: L('Go to New Workflow → Menu (⋮) → Import from JSON', 'اذهب لمسار عمل جديد واستورد من القائمة') },
                    { step: 3, title: L('Connect your credentials', 'اربط حساباتك'), desc: L('Fill in your API keys for each service', 'أدخل مفاتيح الربط لكل خدمة') },
                    { step: 4, title: L('Activate & Test', 'تفعيل واختبار'), desc: L('Toggle the switch and run a test execution', 'شغل مسار العمل وجربه') }
                  ].map(s => (
                    <div key={s.step} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                        {s.step}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)', marginBottom: '2px' }}>{s.title}</div>
                        <div style={{ fontSize: '12.5px', color: 'var(--t2)' }}>{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <a href="https://n8n.io/cloud" target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: '12px', fontSize: '13px' }}>
                  Get n8n Free → n8n.io/cloud
                </a>
              </div>

              <div className="card">
                <div className="sec-hd"><div className="sec-title">💡 {L('Automation Ideas', 'أفكار للأتمتة')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '13px' }}>
                  {[
                    '💬 Auto-reply to WhatsApp inquiries with AI',
                    '📊 Daily revenue report to Telegram at 8am',
                    '🎓 Auto-enroll paid students to course platform',
                    '📱 Post to all social media from one trigger',
                    '🧾 Auto-generate and email invoices on payment',
                    '🤖 AI writes captions for your content automatically'
                  ].map((idea, i) => (
                    <div 
                      key={i} 
                      style={{ padding: '9px 12px', background: 'var(--surface2)', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--edge)', transition: 'all .15s' }}
                    >
                      {idea}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
