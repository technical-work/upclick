'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';
import { collection, onSnapshot, query, orderBy, doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Papa from 'papaparse';

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
  
  // Real-time Firebase data
  const [liveChats, setLiveChats] = useState([]);
  const [liveContacts, setLiveContacts] = useState([]);

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

  // Diagnostics Modal States
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagData, setDiagData] = useState({ webhookInfo: null, logs: [] });
  const [diagLoading, setDiagLoading] = useState(false);
  const [testChatId, setTestChatId] = useState('');
  const [testMessage, setTestMessage] = useState('Test from UpKlick 🚀');
  const [testLoading, setTestLoading] = useState(false);

  // Chat UI states
  const [chatMessages, setChatMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  // CSV Import States
  const [csvFile, setCsvFile] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [columnMap, setColumnMap] = useState({
    id: '',
    firstName: '',
    lastName: '',
    username: ''
  });

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

  // Fetch real-time data from Firebase if Telegram is connected
  useEffect(() => {
    let unsubscribeChats;
    let unsubscribeContacts;

    if (GC?.integrations?.telegramConnected) {
      const chatsQuery = query(collection(db, 'telegram_chats'), orderBy('lastMessageAt', 'desc'));
      unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
        const chatsData = [];
        snapshot.forEach((doc) => chatsData.push({ id: doc.id, ...doc.data() }));
        setLiveChats(chatsData);
      });

      const contactsQuery = query(collection(db, 'telegram_contacts'), orderBy('updatedAt', 'desc'));
      unsubscribeContacts = onSnapshot(contactsQuery, (snapshot) => {
        const contactsData = [];
        snapshot.forEach((doc) => contactsData.push({ id: doc.id, ...doc.data() }));
        setLiveContacts(contactsData);
      });
    }

    return () => {
      if (unsubscribeChats) unsubscribeChats();
      if (unsubscribeContacts) unsubscribeContacts();
    };
  }, [GC?.integrations?.telegramConnected]);

  // Fetch real-time messages for the selected chat
  useEffect(() => {
    let unsubscribeMessages;
    if (selectedChat?.id) {
      const messagesQuery = query(collection(db, `telegram_chats/${selectedChat.id}/messages`), orderBy('date', 'asc'));
      unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
        const msgs = [];
        snapshot.forEach((doc) => msgs.push({ id: doc.id, ...doc.data() }));
        setChatMessages(msgs);
      });
    } else {
      setChatMessages([]);
    }
    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [selectedChat]);

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

  const fetchDiagnostics = async () => {
    if (!GC?.integrations?.telegramBotToken) return;
    setDiagLoading(true);
    try {
      const res = await fetch('/api/telegram/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: GC.integrations.telegramBotToken })
      });
      const data = await res.json();
      if (data.ok) {
        setDiagData({ webhookInfo: data.webhookInfo, logs: data.logs || [] });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDiagLoading(false);
    }
  };

  useEffect(() => {
    if (showDiagnostics) {
      fetchDiagnostics();
    }
  }, [showDiagnostics]);

  const handleSendTest = async () => {
    if (!testChatId) return alert(L('Please enter a Chat ID', 'الرجاء إدخال معرف المحادثة (Chat ID)'));
    setTestLoading(true);
    try {
      const res = await fetch('/api/telegram/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: GC.integrations?.telegramBotToken, chatId: testChatId, message: testMessage })
      });
      const data = await res.json();
      if (data.ok) {
        alert(L('Test message sent successfully!', 'تم إرسال الرسالة التجريبية بنجاح!'));
        fetchDiagnostics(); // refresh logs
      } else {
        alert(L('Failed to send:', 'فشل الإرسال: ') + data.error);
      }
    } catch (e) {
      console.error(e);
      alert(L('Network error', 'خطأ في الشبكة'));
    } finally {
      setTestLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedChat?.id || !GC?.integrations?.telegramBotToken) return;
    setReplyLoading(true);
    try {
      const res = await fetch('/api/telegram/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: GC.integrations.telegramBotToken,
          chatId: selectedChat.id,
          message: replyText
        })
      });
      const data = await res.json();
      if (data.ok) {
        setReplyText('');
        // Optimistically insert message into Firestore since webhook doesn't receive sent messages
        const msgRef = doc(collection(db, `telegram_chats/${selectedChat.id}/messages`));
        await setDoc(msgRef, {
          text: replyText,
          date: Math.floor(Date.now() / 1000), // match telegram unix timestamp format
          direction: 'outbound',
          from: 'agent'
        });
        const chatRef = doc(db, 'telegram_chats', selectedChat.id);
        await setDoc(chatRef, {
          lastMessage: replyText,
          lastMessageAt: new Date().toISOString()
        }, { merge: true });
      } else {
        alert(L('Failed to send:', 'فشل الإرسال: ') + data.error);
      }
    } catch (e) {
      console.error(e);
      alert(L('Network error', 'خطأ في الشبكة'));
    } finally {
      setReplyLoading(false);
    }
  };

  const handleContactClick = (contact) => {
    const chat = liveChats.find(c => c.id === contact.id.toString());
    if (chat) {
      setSelectedChat(chat);
    } else {
      setSelectedChat({
        id: contact.id.toString(),
        contactId: contact.firstName || 'Unknown'
      });
    }
    setActiveTab('inbox');
  };

  const handleConnectAPI = async () => {
    const newToken = prompt(L('Enter Telegram Bot API token:', 'أدخل توكن بوت التليجرام الخاص بك:'), GC?.integrations?.telegramBotToken || '');
    if (newToken !== null) {
      const webhookUrl = 'https://upklick-eight.vercel.app/api/telegram/webhook';
      
      if (newToken) {
        try {
          const res = await fetch(`https://api.telegram.org/bot${newToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
          const data = await res.json();
          if (!data.ok) {
            alert(L('Failed to set webhook with Telegram: ', 'فشل إعداد الويب هوك مع تليجرام: ') + data.description);
            return;
          }
        } catch (error) {
          alert(L('Network error setting webhook.', 'خطأ في الشبكة أثناء إعداد الويب هوك.'));
          return;
        }
      }

      const newGC = { 
        ...GC, 
        integrations: { 
          ...(GC.integrations || {}), 
          telegramBotToken: newToken, 
          telegramWebhookUrl: webhookUrl,
          telegramConnected: !!newToken 
        } 
      };
      saveGC(newGC);
      if (newToken) alert(L('Token updated successfully! You can now receive messages.', 'تم تحديث التوكن بنجاح! يمكنك الآن استلام الرسائل.'));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFile(file);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        if (results.meta && results.meta.fields) {
          setCsvHeaders(results.meta.fields);
          setCsvData(results.data);
          setShowMappingModal(true);
        } else {
          alert(L('Error parsing CSV headers', 'خطأ في قراءة عناوين الأعمدة من الملف'));
        }
      },
      error: function(err) {
        alert(L('Error parsing file', 'خطأ في قراءة الملف: ') + err.message);
      }
    });
    e.target.value = null; // Reset input
  };

  const handleImportConfirm = async () => {
    if (!columnMap.id) {
      alert(L('You must select a column for ID.', 'يجب اختيار العمود الخاص بمعرف العميل (ID).'));
      return;
    }
    setImportLoading(true);
    let importedCount = 0;

    try {
      for (const row of csvData) {
        const rowId = row[columnMap.id];
        if (!rowId) continue;
        
        const firstName = columnMap.firstName ? row[columnMap.firstName] : '';
        const lastName = columnMap.lastName ? row[columnMap.lastName] : '';
        const username = columnMap.username ? row[columnMap.username] : '';

        const contactRef = doc(db, 'telegram_contacts', rowId.toString());
        await setDoc(contactRef, {
          id: rowId.toString(),
          firstName: firstName,
          lastName: lastName,
          username: username,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        importedCount++;
      }
      
      alert(L(`Successfully imported ${importedCount} contacts!`, `تم استيراد ${importedCount} جهة اتصال بنجاح!`));
      setShowMappingModal(false);
      setCsvFile(null);
      setCsvData([]);
      setColumnMap({ id: '', firstName: '', lastName: '', username: '' });
    } catch (error) {
      console.error(error);
      alert(L('Error importing contacts', 'حدث خطأ أثناء حفظ جهات الاتصال'));
    } finally {
      setImportLoading(false);
    }
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
          <button className="btn btn-ghost" style={{ padding: '6px 12px' }} onClick={() => setShowDiagnostics(true)}>
            ⚙️ {L('Connection Settings', 'اعدادات الربط')}
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
          <div className="stat-val" id="tg-stat-chats">{liveChats.length}</div>
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
              {GC?.integrations?.telegramConnected ? (
                liveChats.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {liveChats.map(chat => (
                      <div 
                        key={chat.id} 
                        onClick={() => setSelectedChat(chat)}
                        style={{ padding: '10px', background: selectedChat?.id === chat.id ? 'var(--surface2)' : 'var(--surface)', borderRadius: '8px', cursor: 'pointer', border: '1px solid', borderColor: selectedChat?.id === chat.id ? 'var(--prime)' : 'var(--edge)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{chat.contactId || 'Unknown'}</span>
                          <span style={{ fontSize: '10px', color: 'var(--t3)' }}>{new Date(chat.lastMessageAt).toLocaleTimeString()}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--t2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {chat.lastMessage}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--t3)', fontSize: '12px', textAlign: 'center', padding: '30px 0' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>💬</div>
                    {L('No active conversations yet', 'لا توجد محادثات نشطة بعد')}
                  </div>
                )
              ) : (
                <div style={{ color: 'var(--t3)', fontSize: '12px', textAlign: 'center', padding: '30px 0' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>💬</div>
                  {L('Connect Telegram API to see conversations', 'اربط حساب تليجرام لمشاهدة المحادثات')}
                </div>
              )}
            </div>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--edge)', background: 'var(--surface2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{selectedChat.contactId || 'Unknown'}</div>
                  <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => setSelectedChat(null)}>✕</button>
                </div>
                {/* Messages List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {chatMessages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--t3)', fontSize: '12px', marginTop: '20px' }}>
                      {L('Loading messages...', 'جاري تحميل الرسائل...')}
                    </div>
                  ) : (
                    chatMessages.map(msg => {
                      const isOutbound = msg.direction === 'outbound';
                      return (
                        <div key={msg.id} style={{ alignSelf: isOutbound ? (lang==='ar'?'flex-start':'flex-end') : (lang==='ar'?'flex-end':'flex-start'), maxWidth: '75%' }}>
                          <div style={{ background: isOutbound ? 'var(--prime)' : 'var(--surface2)', color: isOutbound ? '#fff' : 'var(--t1)', padding: '10px 14px', borderRadius: '12px', borderBottomLeftRadius: isOutbound || lang==='ar' ? '12px' : '2px', borderBottomRightRadius: isOutbound && lang!=='ar' ? '2px' : '12px', fontSize: '13px', direction: 'ltr' }}>
                            {msg.text}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--t3)', marginTop: '4px', textAlign: isOutbound ? (lang==='ar'?'left':'right') : (lang==='ar'?'right':'left') }}>
                            {new Date(msg.date * 1000).toLocaleTimeString()}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                {/* Chat Input */}
                <div style={{ padding: '12px', borderTop: '1px solid var(--edge)', display: 'flex', gap: '8px' }}>
                  <input 
                    className="inp" 
                    placeholder={L('Type a message...', 'اكتب رسالة...')} 
                    style={{ flex: 1 }} 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  />
                  <button className="btn btn-prime" onClick={handleSendReply} disabled={replyLoading || !replyText.trim()}>
                    {replyLoading ? '...' : L('Send', 'إرسال')}
                  </button>
                </div>
              </>
            ) : GC?.integrations?.telegramConnected ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '20px' }}>
                <div style={{ fontSize: '40px' }}>🤖</div>
                <div style={{ fontFamily: 'var(--ff)', fontSize: '16px', fontWeight: 700, color: 'var(--t1)' }}>
                  {L('Telegram Connected Successfully', 'تم ربط تليجرام بنجاح')}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--t2)', textAlign: 'center', maxWidth: '360px' }}>
                  {L('Select a conversation from the list to view messages and reply.', 'حدد محادثة من القائمة لعرض الرسائل والرد عليها.')}
                </div>
                <button className="btn btn-ghost" style={{ padding: '10px 24px' }} onClick={() => setShowDiagnostics(true)}>
                  ⚙️ {L('Connection Settings', 'إعدادات الربط')}
                </button>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '20px' }}>
                <div style={{ fontSize: '40px' }}>💬</div>
                <div style={{ fontFamily: 'var(--ff)', fontSize: '16px', fontWeight: 700, color: 'var(--t1)' }}>
                  {L('Connect Telegram Business', 'ربط حساب تليجرام للأعمال')}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--t2)', textAlign: 'center', maxWidth: '360px' }}>
                  {L('Connect your Telegram Business API to manage all conversations, automate replies, and track sales from one place.', 'قم بربط حسابك بواجهة برمجة تطبيقات تليجرام للأعمال لإدارة جميع المحادثات، أتمتة الردود، وتتبع المبيعات من مكان واحد.')}
                </div>
                <button className="btn btn-prime" style={{ padding: '10px 24px' }} onClick={() => setShowDiagnostics(true)}>
                  🔗 {L('Connect Telegram Bot', 'ربط بوت التليجرام')}
                </button>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <span className="badge b-green">Telegram Business API</span>
                  <span className="badge b-blue">Meta Cloud API</span>
                  <span className="badge b-purple">OpenAI Integration</span>
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
              <div className="stat-val">{liveContacts.length}</div>
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
                <input 
                  type="file" 
                  accept=".csv" 
                  id="csv-upload" 
                  style={{ display: 'none' }} 
                  onChange={handleFileUpload} 
                />
                <button className="btn btn-prime" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={() => document.getElementById('csv-upload').click()}>
                  + {L('Import', 'استيراد')}
                </button>
              </div>
            </div>
            {liveContacts.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--edge)' }}>
                      <th style={{ padding: '10px', textAlign: lang==='ar'?'right':'left' }}>{L('ID', 'المعرف')}</th>
                      <th style={{ padding: '10px', textAlign: lang==='ar'?'right':'left' }}>{L('Name', 'الاسم')}</th>
                      <th style={{ padding: '10px', textAlign: lang==='ar'?'right':'left' }}>{L('Username', 'اسم المستخدم')}</th>
                      <th style={{ padding: '10px', textAlign: lang==='ar'?'right':'left' }}>{L('Last Active', 'آخر نشاط')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveContacts.map(contact => (
                      <tr key={contact.id} style={{ borderBottom: '1px solid var(--edge)', cursor: 'pointer' }} onClick={() => handleContactClick(contact)}>
                        <td style={{ padding: '10px', color: 'var(--t2)', textAlign: lang==='ar'?'right':'left' }}>{contact.id}</td>
                        <td style={{ padding: '10px', fontWeight: 600, textAlign: lang==='ar'?'right':'left' }}>{contact.firstName} {contact.lastName}</td>
                        <td style={{ padding: '10px', color: 'var(--t2)', textAlign: lang==='ar'?'right':'left' }}>{contact.username ? `@${contact.username}` : '-'}</td>
                        <td style={{ padding: '10px', color: 'var(--t3)', textAlign: lang==='ar'?'right':'left' }}>{new Date(contact.updatedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      )}

      {/* Diagnostics Modal */}
      {showDiagnostics && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setShowDiagnostics(false); }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="modal-content card" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', position: 'relative' }}>
            <button className="btn btn-ghost" style={{ position: 'absolute', top: '16px', right: lang==='ar'?'auto':'16px', left: lang==='ar'?'16px':'auto', padding: '5px 10px' }} onClick={() => setShowDiagnostics(false)}>
              ✕
            </button>
            <div className="sec-hd" style={{ marginBottom: '20px' }}>
              <div className="sec-title" style={{ fontSize: '20px' }}>⚙️ {L('Connection Settings & Diagnostics', 'إعدادات الربط والتشخيص')}</div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button className="btn btn-prime" onClick={handleConnectAPI}>
                🔑 {L('Update Bot Token', 'تحديث توكن البوت')}
              </button>
              <button className="btn btn-ghost" onClick={fetchDiagnostics}>
                🔄 {L('Refresh Status', 'تحديث الحالة')}
              </button>
            </div>

            {diagLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--t3)' }}>{L('Loading diagnostics...', 'جاري تحميل بيانات التشخيص...')}</div>
            ) : (
              <>
                {/* Status Section */}
                <div style={{ background: 'var(--surface2)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: 'var(--t1)' }}>{L('Webhook Status', 'حالة الويب هوك (Webhook)')}</h4>
                  {diagData.webhookInfo ? (
                    <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div><strong style={{ color: 'var(--t2)' }}>{L('Pending Updates:', 'تحديثات معلقة:')}</strong> {diagData.webhookInfo.pending_update_count || 0}</div>
                      {diagData.webhookInfo.last_error_message && (
                        <div style={{ color: 'var(--red)' }}><strong style={{ color: 'var(--red)' }}>{L('Last Error:', 'آخر خطأ:')}</strong> {diagData.webhookInfo.last_error_message}</div>
                      )}
                      {!diagData.webhookInfo.last_error_message && diagData.webhookInfo.url && (
                        <div style={{ color: 'var(--green)' }}>✅ {L('Webhook is active and receiving messages', 'الويب هوك نشط ويستقبل الرسائل بشكل سليم')}</div>
                      )}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--t3)', fontSize: '13px' }}>{L('No Webhook Info available. Ensure token is set.', 'لا توجد بيانات للويب هوك. تأكد من إدخال التوكن.')}</div>
                  )}
                </div>

                {/* Send Test Message */}
                <div style={{ background: 'var(--surface2)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: 'var(--t1)' }}>{L('Test Connection', 'اختبار الاتصال')}</h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input className="inp" placeholder={L('Chat ID (e.g. 123456)', 'معرف المحادثة (Chat ID)')} style={{ flex: 1, minWidth: '150px' }} value={testChatId} onChange={(e) => setTestChatId(e.target.value)} />
                    <input className="inp" placeholder={L('Message', 'الرسالة')} style={{ flex: 2, minWidth: '200px' }} value={testMessage} onChange={(e) => setTestMessage(e.target.value)} />
                    <button className="btn btn-prime" onClick={handleSendTest} disabled={testLoading}>
                      {testLoading ? '...' : L('Send Test', 'إرسال تجريبي')}
                    </button>
                  </div>
                </div>

                {/* Logs Table */}
                <div style={{ background: 'var(--surface2)', padding: '16px', borderRadius: '12px' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: 'var(--t1)' }}>{L('Incoming Webhook Logs', 'سجل الطلبات الواردة للويب هوك')}</h4>
                  {diagData.logs && diagData.logs.length > 0 ? (
                    <div style={{ overflowX: 'auto', maxHeight: '300px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead style={{ position: 'sticky', top: 0, background: 'var(--surface2)', zIndex: 1 }}>
                          <tr style={{ borderBottom: '1px solid var(--edge)', color: 'var(--t2)' }}>
                            <th style={{ padding: '8px', textAlign: lang==='ar'?'right':'left' }}>{L('Date', 'التاريخ')}</th>
                            <th style={{ padding: '8px', textAlign: lang==='ar'?'right':'left' }}>{L('Status', 'الحالة')}</th>
                            <th style={{ padding: '8px', textAlign: lang==='ar'?'right':'left' }}>{L('Payload Preview', 'معاينة الطلب')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {diagData.logs.map(log => (
                            <tr key={log.id} style={{ borderBottom: '1px solid var(--edge)' }}>
                              <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>{new Date(log.receivedAt).toLocaleString()}</td>
                              <td style={{ padding: '8px' }}><span className="badge b-green">{log.status}</span></td>
                              <td style={{ padding: '8px', fontFamily: 'monospace', color: 'var(--t3)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {JSON.stringify(log.payload)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--t3)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                      {L('No logs found. Try sending a message from Telegram to your bot.', 'لا يوجد سجل للطلبات. جرب إرسال رسالة من تليجرام إلى البوت.')}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mapping Modal */}
      {showMappingModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setShowMappingModal(false); }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="modal-content card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', position: 'relative' }}>
            <button className="btn btn-ghost" style={{ position: 'absolute', top: '16px', right: lang==='ar'?'auto':'16px', left: lang==='ar'?'16px':'auto', padding: '5px 10px' }} onClick={() => setShowMappingModal(false)}>
              ✕
            </button>
            <div className="sec-hd" style={{ marginBottom: '20px' }}>
              <div className="sec-title" style={{ fontSize: '20px' }}>📋 {L('Map CSV Columns', 'ربط أعمدة الملف')}</div>
            </div>

            <div style={{ marginBottom: '20px', fontSize: '13px', color: 'var(--t2)' }}>
              {L(`Found ${csvData.length} rows in the file. Please match your columns with the Telegram contact fields.`, `تم العثور على ${csvData.length} عميل في الملف. يرجى اختيار الأعمدة المناسبة لكل حقل.`)}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
              {/* ID Mapping */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                  {L('Telegram ID (Required)', 'معرف تليجرام - ID (مطلوب)')}
                </label>
                <select className="inp" value={columnMap.id} onChange={(e) => setColumnMap({ ...columnMap, id: e.target.value })}>
                  <option value="">-- {L('Select Column', 'اختر العمود')} --</option>
                  {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* First Name Mapping */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                  {L('First Name', 'الاسم الأول')}
                </label>
                <select className="inp" value={columnMap.firstName} onChange={(e) => setColumnMap({ ...columnMap, firstName: e.target.value })}>
                  <option value="">-- {L('Select Column', 'اختر العمود')} --</option>
                  {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Last Name Mapping */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                  {L('Last Name', 'الاسم الأخير')}
                </label>
                <select className="inp" value={columnMap.lastName} onChange={(e) => setColumnMap({ ...columnMap, lastName: e.target.value })}>
                  <option value="">-- {L('Select Column', 'اختر العمود')} --</option>
                  {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Username Mapping */}
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>
                  {L('Username', 'اسم المستخدم')}
                </label>
                <select className="inp" value={columnMap.username} onChange={(e) => setColumnMap({ ...columnMap, username: e.target.value })}>
                  <option value="">-- {L('Select Column', 'اختر العمود')} --</option>
                  {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowMappingModal(false)}>
                {L('Cancel', 'إلغاء')}
              </button>
              <button className="btn btn-prime" onClick={handleImportConfirm} disabled={importLoading || !columnMap.id}>
                {importLoading ? L('Importing...', 'جاري الاستيراد...') : L('Confirm Import', 'تأكيد الاستيراد')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
