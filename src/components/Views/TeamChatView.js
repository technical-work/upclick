'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { useAuth } from '../../context/AuthContext';
import { callClaudeAPI } from '../../utils/ai';

export default function TeamChatView() {
  const { t, L, lang, setAiPanelOpen, GC, saveGC, isTeamMember } = useBusiness();
  const { userData } = useAuth();
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
  // Channels and active channel state
  const channels = GC.teamChat?.channels || [
    { id: 'general', name: 'general', type: 'public', desc: 'General discussion' },
    { id: 'marketing', name: 'marketing', type: 'public', desc: 'Marketing discussion' }
  ];
  const [activeChannelId, setActiveChannelId] = useState('general');
  const [summarizing, setSummarizing] = useState(false);

  // New channel form state
  const [newChanName, setNewChanName] = useState('');
  const [newChanType, setNewChanType] = useState('public');
  const [newChanDesc, setNewChanDesc] = useState('');

  const channelMsgs = GC.teamChat?.messages?.[activeChannelId] || [];
  const activeChannel = channels.find(c => c.id === activeChannelId) || channels[0] || { name: 'general', desc: 'General discussion' };

  // Team members list
  const teamMembers = GC.team?.members || [];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [channelMsgs.length, activeChannelId]);

  // Get current user display name
  const getAuthorName = () => {
    if (isTeamMember && userData?.name) return userData.name;
    return userData?.name || GC.profile?.name || 'User';
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    const authorName = getAuthorName();
    const newMessage = {
      id: Date.now(),
      author: authorName,
      content: messageText,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {}
    };

    const currentChannelMsgs = GC.teamChat?.messages?.[activeChannelId] || [];
    const updatedMessagesMap = {
      ...(GC.teamChat?.messages || {}),
      [activeChannelId]: [...currentChannelMsgs, newMessage]
    };

    saveGC({
      ...GC,
      teamChat: {
        ...GC.teamChat,
        messages: updatedMessagesMap
      }
    });

    setMessageText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReaction = (msgId, emoji) => {
    const currentChannelMsgs = GC.teamChat?.messages?.[activeChannelId] || [];
    const authorName = getAuthorName();
    
    const updatedMsgs = currentChannelMsgs.map(m => {
      if (m.id === msgId) {
        const reactions = { ...(m.reactions || {}) };
        const users = reactions[emoji] || [];
        if (users.includes(authorName)) {
          // Remove reaction
          reactions[emoji] = users.filter(u => u !== authorName);
          if (reactions[emoji].length === 0) delete reactions[emoji];
        } else {
          // Add reaction
          reactions[emoji] = [...users, authorName];
        }
        return { ...m, reactions };
      }
      return m;
    });

    const updatedMessagesMap = {
      ...(GC.teamChat?.messages || {}),
      [activeChannelId]: updatedMsgs
    };

    saveGC({
      ...GC,
      teamChat: {
        ...GC.teamChat,
        messages: updatedMessagesMap
      }
    });
  };

  const handleDeleteMessage = (msgId) => {
    const currentChannelMsgs = GC.teamChat?.messages?.[activeChannelId] || [];
    const updatedMsgs = currentChannelMsgs.filter(m => m.id !== msgId);

    const updatedMessagesMap = {
      ...(GC.teamChat?.messages || {}),
      [activeChannelId]: updatedMsgs
    };

    saveGC({
      ...GC,
      teamChat: {
        ...GC.teamChat,
        messages: updatedMessagesMap
      }
    });
  };

  const handleCreateChannel = (e) => {
    e.preventDefault();
    if (!newChanName.trim()) {
      alert(L('Please enter a channel name', 'الرجاء إدخال اسم القناة'));
      return;
    }
    const cleanChanName = newChanName.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9-_]/g, '');
    const newChan = {
      id: cleanChanName,
      name: cleanChanName,
      type: newChanType,
      desc: newChanDesc
    };

    const updatedChannels = [...channels, newChan];
    const updatedMessagesMap = {
      ...(GC.teamChat?.messages || {}),
      [cleanChanName]: []
    };

    saveGC({
      ...GC,
      teamChat: {
        ...GC.teamChat,
        channels: updatedChannels,
        messages: updatedMessagesMap
      }
    });

    setNewChanName('');
    setNewChanDesc('');
    setIsGroupModalOpen(false);
    setActiveChannelId(cleanChanName);
    alert(L('Channel created successfully! 🚀', 'تم إنشاء القناة بنجاح! 🚀'));
  };

  const handleAISummarize = async () => {
    if (channelMsgs.length === 0) {
      alert(L('No messages in this channel to summarize.', 'لا توجد رسائل لتلخيصها في هذه القناة.'));
      return;
    }
    setSummarizing(true);
    const msgsStr = channelMsgs.map(m => `${m.author}: ${m.content}`).join('\n');
    const prompt = `Please summarize the following team chat messages briefly, highlighting decisions and action items:\n\n${msgsStr}`;
    const sysPrompt = 'Team Chat Operations Analyst. Provide a very concise bullet-point summary in the same language.';
    try {
      const summary = await callClaudeAPI(prompt, sysPrompt, lang);
      alert(`✦ AI Channel Summary:\n\n${summary}`);
    } catch (e) {
      alert('Failed to generate chat summary.');
    } finally {
      setSummarizing(false);
    }
  };

  const reactionEmojis = ['👍', '❤️', '🎉', '😂', '🔥'];

  // Get avatar color for author
  const getAvatarColor = (name) => {
    const colors = [
      'var(--orange-d)', 'rgba(108,53,255,0.14)', 'rgba(0,217,139,0.14)',
      'rgba(255,59,110,0.14)', 'rgba(59,130,246,0.14)'
    ];
    const textColors = [
      'var(--orange)', '#6c35ff', '#00d98b', '#ff3b6e', '#3b82f6'
    ];
    const idx = name ? name.charCodeAt(0) % colors.length : 0;
    return { bg: colors[idx], text: textColors[idx] };
  };

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
            
            {channels.map(chan => {
              const unread = (GC.teamChat?.messages?.[chan.id] || []).length;
              return (
                <div 
                  key={chan.id} 
                  onClick={() => setActiveChannelId(chan.id)}
                  style={{ 
                    padding: '8px 16px', 
                    fontSize: '13px', 
                    color: activeChannelId === chan.id ? 'var(--orange)' : 'var(--t2)', 
                    background: activeChannelId === chan.id ? 'var(--orange-dim)' : 'none', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    fontWeight: activeChannelId === chan.id ? '600' : '400',
                    justifyContent: 'space-between'
                  }}
                >
                  <span><span style={{ color: 'var(--t3)' }}>#</span> {chan.name}</span>
                  {unread > 0 && activeChannelId !== chan.id && (
                    <span style={{ background: 'var(--orange)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '10px', minWidth: '18px', textAlign: 'center' }}>{unread}</span>
                  )}
                </div>
              );
            })}

            <div style={{ padding: '6px 16px', marginTop: '12px', fontSize: '10.5px', fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{L('Team Members', 'أعضاء الفريق')}</span>
            </div>
            
            {teamMembers.length === 0 ? (
              <div style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--t3)', textAlign: 'center' }}>
                {L('No team members yet', 'لا يوجد أعضاء بعد')}
              </div>
            ) : (
              teamMembers.map((m, i) => {
                const colors = getAvatarColor(m.name);
                return (
                  <div key={i} style={{ padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--t2)' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: colors.text, flexShrink: 0 }}>
                      {m.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                    {m.uid && (
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green, #00d98b)', flexShrink: 0 }}></span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Chat Header */}
          <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--edge)', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--surface2)' }}>
            <div style={{ fontSize: '18px', fontWeight: '700' }}>#</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--t1)' }}>{activeChannel.name}</div>
              <div style={{ fontSize: '11.5px', color: 'var(--t3)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{activeChannel.desc}</div>
            </div>
            <button className="btn-ai" onClick={handleAISummarize} style={{ fontSize: '12px', padding: '5px 12px' }} disabled={summarizing}>
              ✦ {summarizing ? L('Summarizing...', 'جاري التلخيص...') : L('Summarize', 'تلخيص')}
            </button>
            <button 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', fontSize: '18px' }} 
              onClick={() => setIsInfoPanelOpen(!isInfoPanelOpen)} 
              title={L('Channel info', 'معلومات القناة')}
            >
              ℹ
            </button>
          </div>

          {/* Messages Area */}
          <div ref={messagesContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {channelMsgs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>💬</div>
                <div style={{ fontFamily: 'var(--ff)', fontSize: '16px', fontWeight: 700, color: 'var(--t1)', marginBottom: '6px' }}>
                  {L('No messages yet', 'لا توجد رسائل بعد')}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--t2)' }}>
                  {L('Send the first message in this channel to start discussing with your team.', 'أرسل أول رسالة في هذه القناة للبدء في النقاش مع فريقك.')}
                </div>
              </div>
            ) : (
              channelMsgs.map(m => {
                const colors = getAvatarColor(m.author);
                const authorName = getAuthorName();
                const isOwn = m.author === authorName;
                return (
                  <div key={m.id} style={{ display: 'flex', gap: '10px', padding: '8px 10px', borderRadius: '10px', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: colors.text, flexShrink: 0, fontSize: '14px' }}>
                      {m.author ? m.author[0].toUpperCase() : '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '13px', color: isOwn ? 'var(--orange)' : 'var(--t1)' }}>{m.author}</span>
                        <span style={{ fontSize: '10px', color: 'var(--t3)' }}>{m.date}</span>
                        {isOwn && (
                          <button onClick={() => handleDeleteMessage(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', fontSize: '11px', marginLeft: 'auto', opacity: 0.5 }} title={L('Delete', 'حذف')}>✕</button>
                        )}
                      </div>
                      <div style={{ fontSize: '13.5px', color: 'var(--t2)', marginTop: '3px', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                        {m.content}
                      </div>
                      {/* Reactions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                        {Object.entries(m.reactions || {}).map(([emoji, users]) => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(m.id, emoji)}
                            style={{
                              background: users.includes(authorName) ? 'var(--orange-d)' : 'var(--surface3)',
                              border: users.includes(authorName) ? '1px solid var(--orange)' : '1px solid var(--edge)',
                              borderRadius: '12px',
                              padding: '2px 8px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              color: 'var(--t2)',
                              transition: 'all 0.15s'
                            }}
                          >
                            <span>{emoji}</span>
                            <span style={{ fontSize: '10px', fontWeight: 600 }}>{users.length}</span>
                          </button>
                        ))}
                        {/* Quick reaction buttons */}
                        <div style={{ display: 'flex', gap: '2px', marginLeft: '4px', opacity: 0.4, transition: 'opacity 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
                        >
                          {reactionEmojis.filter(e => !Object.keys(m.reactions || {}).includes(e)).slice(0, 3).map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(m.id, emoji)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', padding: '2px' }}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--edge)' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', background: 'var(--surface2)', border: '1.5px solid var(--edge)', borderRadius: '12px', padding: '8px 12px' }}>
              <textarea 
                rows="1" 
                placeholder={`${L('Message', 'رسالة')} #${activeChannel.name}...`} 
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '14px', color: 'var(--t1)', fontFamily: 'var(--ff)', resize: 'none', maxHeight: '120px', lineHeight: 1.5 }} 
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
              ></textarea>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                <button onClick={handleSendMessage} style={{ background: 'linear-gradient(135deg,var(--orange),var(--purple))', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#fff' }}>➤</button>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '5px', padding: '0 4px' }}>
              {L('Enter to send · Shift+Enter for new line', 'اضغط Enter للإرسال · Shift+Enter لسطر جديد')}
            </div>
          </div>
        </div>

        {/* Channel Info Panel */}
        {isInfoPanelOpen && (
          <div style={{ width: '260px', borderLeft: '1px solid var(--edge)', padding: '16px', overflowY: 'auto', background: 'var(--surface2)' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--t1)', marginBottom: '14px' }}>{L('Channel Info', 'معلومات القناة')}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--t3)', display: 'block' }}>{L('Name', 'الاسم')}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)' }}>#{activeChannel.name}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--t3)', display: 'block' }}>{L('Type', 'النوع')}</span>
                <span style={{ fontSize: '13px', color: 'var(--t1)' }}>{activeChannel.type === 'public' ? L('Public 🌐', 'عامة 🌐') : L('Private 🔒', 'خاصة 🔒')}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--t3)', display: 'block' }}>{L('Description', 'الوصف')}</span>
                <span style={{ fontSize: '12px', color: 'var(--t2)' }}>{activeChannel.desc || L('No description set', 'لا يوجد وصف')}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--t3)', display: 'block' }}>{L('Messages', 'الرسائل')}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)' }}>{channelMsgs.length}</span>
              </div>
            </div>

            {/* Team Members in Channel */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--t1)', marginBottom: '10px' }}>{L('Team Members', 'أعضاء الفريق')} ({teamMembers.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Owner */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg,var(--orange),var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff' }}>
                    {(GC.profile?.name || 'O')[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t1)' }}>{GC.profile?.name || L('Owner', 'المالك')}</div>
                    <div style={{ fontSize: '10px', color: 'var(--orange)' }}>{L('Owner', 'المالك')}</div>
                  </div>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green,#00d98b)' }}></span>
                </div>
                {teamMembers.map((m, i) => {
                  const colors = getAvatarColor(m.name);
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: colors.text }}>
                        {m.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t1)' }}>{m.name}</div>
                        <div style={{ fontSize: '10px', color: 'var(--t3)' }}>{m.role}</div>
                      </div>
                      {m.uid && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green,#00d98b)' }}></span>}
                    </div>
                  );
                })}
              </div>
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
              <form onSubmit={handleCreateChannel}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Channel Name *', 'اسم القناة *')}</label>
                    <div style={{ display: 'flex', gap: 0, border: '1.5px solid var(--edge)', borderRadius: '10px', overflow: 'hidden', background: 'var(--surface2)' }}>
                      <span style={{ padding: '9px 10px', fontSize: '13px', color: 'var(--t3)', borderRight: '1px solid var(--edge)' }}>#</span>
                      <input className="inp" placeholder={L('e.g. marketing, design, general', 'مثال: التسويق، التصميم')} style={{ flex: 1, border: 'none', borderRadius: 0, fontSize: '13px' }} value={newChanName} onChange={(e) => setNewChanName(e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Channel Type', 'نوع القناة')}</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 12px', background: 'var(--surface2)', borderRadius: '9px', border: '1px solid var(--edge)', cursor: 'pointer', fontSize: '13px', color: 'var(--t1)' }}>
                        <input type="radio" name="tcg-type" value="public" checked={newChanType === 'public'} onChange={() => setNewChanType('public')} style={{ accentColor: 'var(--orange)' }} /> 🌐 {L('Public', 'عامة')}
                      </label>
                      <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 12px', background: 'var(--surface2)', borderRadius: '9px', border: '1px solid var(--edge)', cursor: 'pointer', fontSize: '13px', color: 'var(--t1)' }}>
                        <input type="radio" name="tcg-type" value="private" checked={newChanType === 'private'} onChange={() => setNewChanType('private')} style={{ accentColor: 'var(--orange)' }} /> 🔒 {L('Private', 'خاصة')}
                      </label>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Description (optional)', 'وصف (اختياري)')}</label>
                    <input className="inp" placeholder={L("What's this channel for?", 'ما هو الغرض من هذه القناة؟')} value={newChanDesc} onChange={(e) => setNewChanDesc(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsGroupModalOpen(false)}>
                    {L('Cancel', 'إلغاء')}
                  </button>
                  <button type="submit" className="btn btn-prime" style={{ flex: 1, justifyContent: 'center' }}>
                    + {L('Create Channel', 'إنشاء قناة')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
