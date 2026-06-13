'use client';

import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';

export default function TeamChatView() {
  const { t, L, setAiPanelOpen } = useBusiness();
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);
  const [messageText, setMessageText] = useState('');

  return (
    <div className="pg on" id="pg-teamchat">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">💬</span>
          {L('Team Chat & Groups', 'محادثات ومجموعات الفريق')}
        </div>
        <div className="pg-actions">
          <button 
            className="btn btn-ghost" 
            style={{ fontSize: '12px', padding: '6px 13px' }} 
            onClick={() => setIsGroupModalOpen(true)}
          >
            + {L('New Group', 'مجموعة جديدة')}
          </button>
          <button className="btn btn-prime">
            💬 {L('New Message', 'رسالة جديدة')}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 200px)', minHeight: '500px', background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '16px', overflow: 'hidden' }}>
        
        {/* LEFT: Channels & DMs */}
        <div style={{ width: '240px', borderRight: '1px solid var(--edge)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          {/* Workspace */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--edge)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,var(--orange),var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900, color: '#fff', fontFamily: 'var(--ff)' }}>T</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }}>{L('Team Workspace', 'مساحة عمل الفريق')}</div>
              <div style={{ fontSize: '10.5px', color: 'var(--green,#00d98b)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green,#00d98b)', display: 'inline-block' }}></span>
                {L('Online', 'متصل')}
              </div>
            </div>
          </div>

          {/* Channels */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            <div style={{ padding: '6px 16px', fontSize: '10.5px', fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{L('Channels', 'القنوات')}</span>
              <button onClick={() => setIsGroupModalOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', fontSize: '16px', lineHeight: 1 }} title={L('New channel', 'قناة جديدة')}>+</button>
            </div>
            
            <div style={{ padding: '4px 16px', fontSize: '13px', color: 'var(--t2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--t3)' }}>#</span> general
            </div>
            <div style={{ padding: '4px 16px', fontSize: '13px', color: 'var(--t2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--t3)' }}>#</span> marketing
            </div>

            <div style={{ padding: '6px 16px', marginTop: '8px', fontSize: '10.5px', fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{L('Direct Messages', 'رسائل خاصة')}</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', fontSize: '16px', lineHeight: 1 }} title={L('New DM', 'رسالة جديدة')}>+</button>
            </div>
            
            <div style={{ padding: '20px 16px', fontSize: '12px', color: 'var(--t3)', textAlign: 'center' }}>
              {L('No direct messages yet', 'لا توجد رسائل خاصة بعد')}
            </div>
          </div>
        </div>

        {/* RIGHT: Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Chat Header */}
          <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--edge)', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--surface2)' }}>
            <div style={{ fontSize: '18px' }}>#</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--t1)' }}>{L('Select a channel', 'اختر قناة')}</div>
              <div style={{ fontSize: '11.5px', color: 'var(--t3)' }}>{L('Choose a channel or DM from the left', 'اختر قناة أو رسالة من اليسار')}</div>
            </div>
            <button className="btn-ai" onClick={() => setAiPanelOpen(true)} style={{ fontSize: '12px', padding: '5px 12px' }}>✦ {L('Summarize', 'تلخيص')}</button>
            <button 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', fontSize: '18px' }} 
              onClick={() => setIsInfoPanelOpen(!isInfoPanelOpen)} 
              title={L('Channel info', 'معلومات القناة')}
            >
              ℹ
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>💬</div>
              <div style={{ fontFamily: 'var(--ff)', fontSize: '16px', fontWeight: 700, color: 'var(--t1)', marginBottom: '6px' }}>
                {L('Welcome to Team Chat', 'مرحباً في محادثات الفريق')}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--t2)' }}>
                {L('Private workspace for your team — separate from your student communities', 'مساحة عمل خاصة بفريقك - منفصلة عن مجتمعات الطلاب')}
              </div>
            </div>
          </div>

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--edge)' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', background: 'var(--surface2)', border: '1.5px solid var(--edge)', borderRadius: '12px', padding: '8px 12px', transition: 'border-color .2s' }}>
              <textarea 
                rows="1" 
                placeholder={L('Message #general...', 'رسالة للقناة...')} 
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '14px', color: 'var(--t1)', fontFamily: 'var(--fb)', resize: 'none', maxHeight: '120px', lineHeight: 1.5 }} 
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              ></textarea>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--t3)', transition: 'color .15s' }}>😊</button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--t3)', transition: 'color .15s' }}>📎</button>
                <button style={{ background: 'linear-gradient(135deg,var(--orange),var(--purple))', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#fff', transition: 'transform .15s' }}>➤</button>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '5px', padding: '0 4px' }}>
              {L('Enter to send · Shift+Enter for new line', 'اضغط Enter للإرسال · Shift+Enter لسطر جديد')}
            </div>
          </div>
        </div>

        {/* Channel Info Panel */}
        {isInfoPanelOpen && (
          <div style={{ width: '240px', borderLeft: '1px solid var(--edge)', padding: '16px', overflowY: 'auto', background: 'var(--surface2)' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--t1)', marginBottom: '14px' }}>{L('Channel Info', 'معلومات القناة')}</div>
            <div style={{ fontSize: '12px', color: 'var(--t2)' }}>
              {L('No channel selected', 'لم يتم اختيار قناة')}
            </div>
          </div>
        )}
      </div>

      {/* NEW GROUP MODAL */}
      {isGroupModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setIsGroupModalOpen(false); }}>
          <div className="modal-box" style={{ maxWidth: '440px' }}>
            <div className="modal-close" onClick={() => setIsGroupModalOpen(false)}>✕</div>
            <div style={{ padding: '22px' }}>
              <div style={{ fontFamily: 'var(--ff)', fontSize: '17px', fontWeight: 800, marginBottom: '16px', color: 'var(--t1)' }}>
                + {L('New Channel / Group', 'قناة / مجموعة جديدة')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Channel Name *', 'اسم القناة *')}</label>
                  <div style={{ display: 'flex', gap: 0, border: '1.5px solid var(--edge)', borderRadius: '10px', overflow: 'hidden', background: 'var(--surface2)' }}>
                    <span style={{ padding: '9px 10px', fontSize: '13px', color: 'var(--t3)', borderRight: '1px solid var(--edge)' }}>#</span>
                    <input className="inp" placeholder={L('e.g. marketing, design, general', 'مثال: التسويق، التصميم')} style={{ flex: 1, border: 'none', borderRadius: 0, fontSize: '13px' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Channel Type', 'نوع القناة')}</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 12px', background: 'var(--surface2)', borderRadius: '9px', border: '1px solid var(--edge)', cursor: 'pointer', fontSize: '13px', color: 'var(--t1)' }}>
                      <input type="radio" name="tcg-type" value="public" defaultChecked style={{ accentColor: 'var(--orange)' }} /> 🌐 {L('Public', 'عامة')}
                    </label>
                    <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 12px', background: 'var(--surface2)', borderRadius: '9px', border: '1px solid var(--edge)', cursor: 'pointer', fontSize: '13px', color: 'var(--t1)' }}>
                      <input type="radio" name="tcg-type" value="private" style={{ accentColor: 'var(--orange)' }} /> 🔒 {L('Private', 'خاصة')}
                    </label>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Description (optional)', 'وصف (اختياري)')}</label>
                  <input className="inp" placeholder={L("What's this channel for?", 'ما هو الغرض من هذه القناة؟')} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsGroupModalOpen(false)}>
                  {L('Cancel', 'إلغاء')}
                </button>
                <button className="btn btn-prime" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsGroupModalOpen(false)}>
                  + {L('Create Channel', 'إنشاء قناة')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
