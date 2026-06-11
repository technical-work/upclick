'use client';

import React, { useState } from 'react';
import { useBusiness } from '../context/BusinessContext';

export default function SupportWidget() {
  const {
    lang,
    L,
    t,
    supportOpen,
    setSupportOpen
  } = useBusiness();

  const [input, setInput] = useState('');
  const [supportMessage, setSupportMessage] = useState(
    L('Hey! How can we help? 👋', 'أهلاً! كيف يمكننا مساعدتك؟ 👋')
  );

  const quickBtns = L(
    ['How do I get started?', 'Add a new lead', 'Help with strategy'],
    ['كيف أبدأ؟', 'أضف ليد جديد', 'مساعدة في الاستراتيجية']
  );

  const handleSend = () => {
    if (!input.trim()) return;
    setSupportMessage(
      L("Got it! We'll respond within 2 hours 💜", "تم! سنرد خلال ساعتين 💜")
    );
    setInput('');
  };

  const handleQuickClick = (text) => {
    setInput(text);
    setSupportMessage(
      L("Got it! We'll respond within 2 hours 💜", "تم! سنرد خلال ساعتين 💜")
    );
    setInput('');
  };

  return (
    <>
      {/* Floating Button */}
      <div id="support-btn" onClick={() => setSupportOpen(!supportOpen)}>
        💬
      </div>

      {/* Support Chat Box */}
      <div id="support-panel" className={supportOpen ? 'open' : ''}>
        <div className="sup-hd">
          <div className="sup-av">🧡</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
              UpKlick Support
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.8)' }} id="t-sup-online">
              {L('🟢 Online now', '🟢 متاح الآن')}
            </div>
          </div>
          <button
            onClick={() => setSupportOpen(false)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '12px 14px' }}>
          <div
            style={{
              background: 'var(--surface2)',
              borderRadius: '9px',
              padding: '10px 12px',
              fontSize: '13px',
              lineHeight: 1.5,
              color: 'var(--t1)',
              marginBottom: '10px'
            }}
            id="t-sup-msg"
          >
            {supportMessage}
          </div>

          <div id="sup-qbtns" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {quickBtns.map((btnText, i) => (
              <button
                key={i}
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--edge)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: 'var(--t1)',
                  cursor: 'pointer',
                  transition: 'all .12s',
                  fontFamily: 'var(--fb)',
                  textAlign: 'left',
                  marginBottom: '5px'
                }}
                onClick={() => handleQuickClick(btnText)}
                onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--a)')}
                onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--edge)')}
              >
                {btnText}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '0 12px 12px', display: 'flex', gap: '6px' }}>
          <input
            className="inp"
            id="sup-inp"
            placeholder={L("Type a message...", "اكتب رسالة...")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            style={{ fontSize: '12px', padding: '7px 11px', flex: 1 }}
          />
          <button className="btn btn-prime" style={{ padding: '7px 11px' }} onClick={handleSend}>
            ➤
          </button>
        </div>
      </div>
    </>
  );
}
