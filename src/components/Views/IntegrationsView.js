'use client';

import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';

export default function IntegrationsView() {
  const { lang, L, t } = useBusiness();

  // Tab State
  const [activeTab, setActiveTab] = useState('integ-payment');

  // Connection Toggles
  const [stripeConnected, setStripeConnected] = useState(false);
  const [tapConnected, setTapConnected] = useState(false);
  const [claudeConnected, setClaudeConnected] = useState(true);
  const [openaiConnected, setOpenaiConnected] = useState(false);
  const [mailchimpConnected, setMailchimpConnected] = useState(false);
  const [telegramConnected, setTelegramConnected] = useState(false);

  // Key Fields
  const [stripeKey, setStripeKey] = useState('');
  const [tapKey, setTapKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');

  const handleConnect = (service, isConnected, setConnected) => {
    if (isConnected) {
      setConnected(false);
      alert(L(`${service} disconnected.`, `تم قطع اتصال ${service}.`));
    } else {
      setConnected(true);
      alert(L(`${service} connected successfully!`, `تم ربط ${service} بنجاح!`));
    }
  };

  return (
    <div className="pg on" id="pg-integrations">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">⛓</span>
          {L('Integrations & Settings', 'التكاملات والإعدادات')}
        </div>
      </div>

      <div className="tabs-bar" id="integ-tabs" style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
        {[
          { id: 'integ-payment', label: L('Payments', 'بوابات الدفع'), emoji: '💳' },
          { id: 'integ-ai', label: L('AI Platforms', 'نماذج الذكاء'), emoji: '🤖' },
          { id: 'integ-marketing', label: L('Marketing', 'التسويق'), emoji: '📣' },
          { id: 'integ-ecommerce', label: L('E-commerce', 'التجارة الإلكترونية'), emoji: '🛒' },
          { id: 'integ-crm', label: 'CRM', emoji: '🎯' },
          { id: 'integ-automation', label: L('Automations', 'الأتمتة والربط'), emoji: '⚡' }
        ].map(tab => (
          <button 
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'on' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* ================= TAB 1: PAYMENTS ================= */}
      {activeTab === 'integ-payment' && (
        <div className="tab-panel on" id="integ-payment">
          <div className="g2">
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ fontSize: '32px' }}>💳</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--t1)' }}>Stripe</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--t2)' }}>{L('Accept global credit cards instantly', 'استقبل مدفوعات البطاقات الائتمانية العالمية فورا')}</div>
                </div>
                <span className={`badge ${stripeConnected ? 'b-green' : 'b-ai'}`}>
                  {stripeConnected ? L('Connected', 'متصل') : L('Inactive', 'غير نشط')}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>Stripe API Publishable Key</label>
                  <input className="inp" type="password" value={stripeKey} onChange={(e) => setStripeKey(e.target.value)} placeholder="pk_live_..." />
                </div>
                <button 
                  className={`btn ${stripeConnected ? 'btn-ghost' : 'btn-prime'}`}
                  onClick={() => handleConnect('Stripe', stripeConnected, setStripeConnected)}
                >
                  {stripeConnected ? L('Disconnect', 'إلغاء الربط') : L('Connect Stripe', 'ربط حساب Stripe')}
                </button>
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ fontSize: '32px' }}>⚡</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--t1)' }}>Tap Payments (MENA)</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--t2)' }}>{L('Accept KNET, Mada, Benefit, and regional cards', 'استقبل مدفوعات مدى، كي نت، بنفت والبطاقات المحلية الخليجية')}</div>
                </div>
                <span className={`badge ${tapConnected ? 'b-green' : 'b-ai'}`}>
                  {tapConnected ? L('Connected', 'متصل') : L('Inactive', 'غير نشط')}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>Tap Payments API Key</label>
                  <input className="inp" type="password" value={tapKey} onChange={(e) => setTapKey(e.target.value)} placeholder="sk_live_..." />
                </div>
                <button 
                  className={`btn ${tapConnected ? 'btn-ghost' : 'btn-prime'}`}
                  onClick={() => handleConnect('Tap Payments', tapConnected, setTapConnected)}
                >
                  {tapConnected ? L('Disconnect', 'إلغاء الربط') : L('Connect Tap Payments', 'ربط بوابة Tap Payments')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: AI ================= */}
      {activeTab === 'integ-ai' && (
        <div className="tab-panel on" id="integ-ai">
          <div className="g2">
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ fontSize: '32px' }}>🔮</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--t1)' }}>Anthropic Claude AI</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--t2)' }}>{L('Powers upKlick intelligence and brief scripts', 'يدعم تحليلات الذكاء وصياغة المحتوى والسكريبت')}</div>
                </div>
                <span className="badge b-green">{L('Connected', 'متصل')}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>Claude API Key</label>
                  <input className="inp" type="password" value={claudeKey} onChange={(e) => setClaudeKey(e.target.value)} placeholder="Using upKlick developer key" disabled />
                </div>
                <button className="btn btn-ghost" disabled>{L('Default Connection Active', 'الاتصال الافتراضي نشط')}</button>
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <span style={{ fontSize: '32px' }}>🤖</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--t1)' }}>OpenAI (ChatGPT)</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--t2)' }}>{L('Use GPT-4 models for copywriting fallbacks', 'استعمال نماذج GPT-4 للنسخ والكتابة الاحتياطية')}</div>
                </div>
                <span className={`badge ${openaiConnected ? 'b-green' : 'b-ai'}`}>
                  {openaiConnected ? L('Connected', 'متصل') : L('Inactive', 'غير نشط')}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>OpenAI Secret API Key</label>
                  <input className="inp" type="password" value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} placeholder="sk-..." />
                </div>
                <button 
                  className={`btn ${openaiConnected ? 'btn-ghost' : 'btn-prime'}`}
                  onClick={() => handleConnect('OpenAI', openaiConnected, setOpenaiConnected)}
                >
                  {openaiConnected ? L('Disconnect', 'إلغاء الربط') : L('Connect OpenAI', 'ربط حساب OpenAI')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: MARKETING ================= */}
      {activeTab === 'integ-marketing' && (
        <div className="tab-panel on" id="integ-marketing">
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ fontSize: '32px' }}>📧</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--t1)' }}>Mailchimp / ConvertKit</div>
                <div style={{ fontSize: '11.5px', color: 'var(--t2)' }}>{L('Sync your lead lists with newsletters', 'ربط ومزامنة قوائم العملاء مع النيوزليتر البريدية')}</div>
              </div>
              <span className={`badge ${mailchimpConnected ? 'b-green' : 'b-ai'}`}>
                {mailchimpConnected ? L('Connected', 'متصل') : L('Inactive', 'غير نشط')}
              </span>
            </div>
            <button 
              className={`btn ${mailchimpConnected ? 'btn-ghost' : 'btn-prime'}`}
              onClick={() => handleConnect('Mailchimp', mailchimpConnected, setMailchimpConnected)}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {mailchimpConnected ? L('Disconnect', 'إلغاء الربط') : L('Connect Mailchimp API', 'ربط حساب Mailchimp')}
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 4: E-COMMERCE ================= */}
      {activeTab === 'integ-ecommerce' && (
        <div className="tab-panel on" id="integ-ecommerce">
          <div className="card">
            <div className="sec-hd"><div className="sec-title">{L('Digital Products Store sync', 'مزامنة المتاجر الإلكترونية')}</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Etsy Shop', 'Gumroad Store', 'Payhip Checkout'].map((platform, idx) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--surface2)', borderRadius: '8px' }} key={idx}>
                  <div style={{ fontWeight: 600, fontSize: '13px', flex: 1 }}>{platform}</div>
                  <button className="btn btn-ghost" style={{ fontSize: '11.5px', padding: '4px 10px' }} onClick={() => alert(`${platform} connection sync started.`)}>
                    {L('Sync Connection', 'مزامنة الربط')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: CRM ================= */}
      {activeTab === 'integ-crm' && (
        <div className="tab-panel on" id="integ-crm">
          <div className="card">
            <div className="sec-hd"><div className="sec-title">{L('CRM Integrations', 'تكاملات نظام المبيعات CRM')}</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Google Contacts', 'HubSpot Sync', 'Salesforce Link'].map((crmService, idx) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--surface2)', borderRadius: '8px' }} key={idx}>
                  <div style={{ fontWeight: 600, fontSize: '13px', flex: 1 }}>{crmService}</div>
                  <button className="btn btn-ghost" style={{ fontSize: '11.5px', padding: '4px 10px' }} onClick={() => alert(`${crmService} CRM integration toggled.`)}>
                    {L('Integrate', 'ربط وتفعيل')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 6: AUTOMATIONS ================= */}
      {activeTab === 'integ-automation' && (
        <div className="tab-panel on" id="integ-automation">
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ fontSize: '32px' }}>✈️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--t1)' }}>Telegram Notification Bot</div>
                <div style={{ fontSize: '11.5px', color: 'var(--t2)' }}>{L('Get daily leads & finance alerts directly in Telegram chat', 'استقبل إشعارات المبيعات والعملاء فوريا على حسابك في تيليجرام')}</div>
              </div>
              <span className={`badge ${telegramConnected ? 'b-green' : 'b-ai'}`}>
                {telegramConnected ? L('Connected', 'متصل') : L('Inactive', 'غير نشط')}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>Telegram Bot Token</label>
                <input className="inp" type="password" value={telegramBotToken} onChange={(e) => setTelegramBotToken(e.target.value)} placeholder="123456789:ABCDefgh..." />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>Telegram User/Chat ID</label>
                <input className="inp" value={telegramChatId} onChange={(e) => setTelegramChatId(e.target.value)} placeholder="e.g. 987654321" />
              </div>
              <button 
                className={`btn ${telegramConnected ? 'btn-ghost' : 'btn-prime'}`}
                onClick={() => handleConnect('Telegram Bot', telegramConnected, setTelegramConnected)}
              >
                {telegramConnected ? L('Disconnect Bot', 'قطع الاتصال') : L('Connect Telegram Bot', 'ربط البوت بالتيليجرام')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
