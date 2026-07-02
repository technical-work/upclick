'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';
import { parseMarkdown } from '../../utils/markdown';
import { collection, onSnapshot, query, orderBy, doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Papa from 'papaparse';

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

export default function TelegramHubView() {
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const {
    lang,
    L,
    t,
    GC,
    saveGC,
    setAiPanelOpen,
    confirmAction,
    formatMoney
  } = useBusiness();

  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedChat, setSelectedChat] = useState(null);
  const [inboxView, setInboxView] = useState('chats'); // 'chats' or 'contacts'
  
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
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');

  // Automations State
  const [automations, setAutomations] = useState(tg.automations || []);
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [autoForm, setAutoForm] = useState({ name: '', keyword: '', reply: '' });

  // Diagnostics Modal States
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagData, setDiagData] = useState({ webhookInfo: null, logs: [] });
  const [diagLoading, setDiagLoading] = useState(false);
  const [testChatId, setTestChatId] = useState('');
  const [testMessage, setTestMessage] = useState('Test from UpKlick 🚀');
  const [testLoading, setTestLoading] = useState(false);

  // New Templates and Media UI States
  const fileInputRef = useRef(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const [templates, setTemplates] = useState(tg.templates || [
    { id: '1', name: 'Welcome Message', content: 'السلام عليكم {{name}}! 👋 أهلاً بك في ...', status: 'Active' },
    { id: '2', name: 'Follow Up #1', content: 'مرحباً {{name}}، لاحظت إنك مهتم بـ...', status: 'Draft' }
  ]);
  const [templateHistory, setTemplateHistory] = useState(tg.templateHistory || []);
  const [showCreateTmplModal, setShowCreateTmplModal] = useState(false);
  const [newTmplName, setNewTmplName] = useState('');
  const [newTmplContent, setNewTmplContent] = useState('');

  const [showSendTmplModal, setShowSendTmplModal] = useState(false);
  const [selectedTmplToSend, setSelectedTmplToSend] = useState(null);
  const [sendTmplToAll, setSendTmplToAll] = useState(true);
  const [selectedContactsForTmpl, setSelectedContactsForTmpl] = useState([]);
  const [isTmplScheduled, setIsTmplScheduled] = useState(false);
  const [tmplScheduleDate, setTmplScheduleDate] = useState('');
  const [sendingTmpl, setSendingTmpl] = useState(false);

  const [chatMessages, setChatMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const messagesEndRef = useRef(null);

  const dateFilteredChats = liveChats.filter(c => {
    const chatDate = c.lastMessageAt || c.updatedAt || c.created || '';
    return filterByDateRange(chatDate, filterPeriod, customStartDate, customEndDate);
  });

  const dateFilteredContacts = liveContacts.filter(c => {
    const contactDate = c.created || c.id || '';
    return filterByDateRange(contactDate, filterPeriod, customStartDate, customEndDate);
  });

  const dateFilteredTemplateHistory = templateHistory.filter(h => {
    const histDate = h.sentAt || h.date || '';
    return filterByDateRange(histDate, filterPeriod, customStartDate, customEndDate);
  });

  const allLeads = (GC.crm?.workspaces || []).flatMap(w => w.leads || []);
  const dateFilteredLeads = allLeads.filter(l => filterByDateRange(l.created || l.id || '', filterPeriod, customStartDate, customEndDate));

  const tgRevenue = dateFilteredLeads
    .filter(l => l.source && (l.source.toLowerCase() === 'telegram' || l.source.toLowerCase() === 't.me') && (l.stage === 'closed' || l.stage === 'closed won'))
    .reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, selectedChat]);

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
      if (tgData.templates) {
        setTemplates(tgData.templates);
      }
      if (tgData.templateHistory) {
        setTemplateHistory(tgData.templateHistory);
      }
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

  // Automations Auto-Reply Watcher
  useEffect(() => {
    if (!chatMessages || chatMessages.length === 0 || !selectedChat) return;
    const latestMsg = chatMessages[chatMessages.length - 1];
    
    // Process only if it's incoming and we haven't auto-replied to it yet
    if (latestMsg.isIncoming && !latestMsg.autoProcessed && automations.length > 0) {
      const activeAutos = automations.filter(a => a.active);
      if (activeAutos.length === 0) return;
      
      const text = (latestMsg.text || '').toLowerCase();
      let triggeredReply = null;
      
      for (const auto of activeAutos) {
        if (auto.keyword && text.includes(auto.keyword.toLowerCase())) {
          triggeredReply = auto.reply;
          break;
        }
      }
      
      if (triggeredReply) {
        latestMsg.autoProcessed = true; // In-memory flag to prevent duplicate calls
        const token = GC?.integrations?.telegramBotToken;
        if (token) {
          fetch('/api/telegram/send-test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, chatId: selectedChat.id, message: triggeredReply })
          }).then(res => res.json()).then(async data => {
            if (data.ok) {
              // Also save the sent reply to Firestore to show in chat UI
              const replyData = {
                messageId: data.result.message_id,
                text: triggeredReply,
                date: data.result.date,
                from: 'bot',
                isIncoming: false,
                createdAt: new Date().toISOString()
              };
              await setDoc(doc(db, `telegram_chats/${selectedChat.id}/messages`, data.result.message_id.toString()), replyData);
              await setDoc(doc(db, 'telegram_chats', selectedChat.id), {
                lastMessage: triggeredReply,
                lastMessageAt: new Date().toISOString()
              }, { merge: true });
            }
          }).catch(console.error);
        }
      }
    }
  }, [chatMessages, automations, selectedChat, GC?.integrations?.telegramBotToken]);

  // Sync Telegram media to Cloudinary automatically
  useEffect(() => {
    if (GC?.integrations?.cloudinaryConnected && GC?.integrations?.telegramBotToken && chatMessages.length > 0 && selectedChat) {
      chatMessages.forEach(async (msg) => {
        if (msg.mediaFileId && !msg.cloudinaryUrl && !msg.uploadingToCloud) {
          msg.uploadingToCloud = true; // prevent multiple triggers in memory
          try {
            const res = await fetch(`https://api.telegram.org/bot${GC.integrations.telegramBotToken}/getFile?file_id=${msg.mediaFileId}`);
            const data = await res.json();
            if (data.ok && data.result.file_path) {
              const fileUrl = `https://api.telegram.org/file/bot${GC.integrations.telegramBotToken}/${data.result.file_path}`;
              const formData = new FormData();
              formData.append('file', fileUrl);
              formData.append('upload_preset', GC.integrations.cloudinaryUploadPreset);
              
              const cRes = await fetch(`https://api.cloudinary.com/v1_1/${GC.integrations.cloudinaryCloudName}/auto/upload`, {
                method: 'POST',
                body: formData
              });
              const cData = await cRes.json();
              if (cData.secure_url) {
                const msgRef = doc(db, `telegram_chats/${selectedChat.id}/messages`, msg.id);
                await setDoc(msgRef, { cloudinaryUrl: cData.secure_url }, { merge: true });
              }
            }
          } catch (e) {
            console.error('Failed to upload media to Cloudinary', e);
            msg.uploadingToCloud = false;
          }
        }
      });
    }
  }, [chatMessages, GC?.integrations, selectedChat]);

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
    const prompt = `Write a short, high-converting Telegram message of type: "${tmplType}" in "${tmplLang}". Context details: "${tmplCtx}". Provide ONLY ONE message variation. Use emojis. STRICT RULE: Keep the total response under 50 words.`;
    const systemPrompt = `You are a Telegram copywriter. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}. Keep the response extremely concise.`;
    
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

  const handleAddAutomation = () => {
    if (!autoForm.name.trim() || !autoForm.keyword.trim() || !autoForm.reply.trim()) {
      alert(L('Please fill all fields', 'الرجاء ملء جميع الحقول'));
      return;
    }
    const newAuto = { id: Date.now(), ...autoForm, active: true };
    const updated = [newAuto, ...automations];
    setAutomations(updated);
    saveTGHub({ automations: updated });
    setAutoForm({ name: '', keyword: '', reply: '' });
    setShowAutoModal(false);
  };

  const handleToggleAutomation = (id) => {
    const updated = automations.map(a => a.id === id ? { ...a, active: !a.active } : a);
    setAutomations(updated);
    saveTGHub({ automations: updated });
  };

  const handleDeleteAutomation = (id) => {
    confirmAction(L('Are you sure you want to delete this automation?', 'هل أنت متأكد من حذف هذه الأتمتة؟'), () => {
      const updated = automations.filter(a => a.id !== id);
      setAutomations(updated);
      saveTGHub({ automations: updated });
    });
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
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0
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

  const handleViewMedia = async (fileId) => {
    if (!GC?.integrations?.telegramBotToken) return;
    try {
      const res = await fetch(`https://api.telegram.org/bot${GC.integrations.telegramBotToken}/getFile?file_id=${fileId}`);
      const data = await res.json();
      if (data.ok && data.result.file_path) {
        const fileUrl = `https://api.telegram.org/file/bot${GC.integrations.telegramBotToken}/${data.result.file_path}`;
        window.open(fileUrl, '_blank');
      } else {
        alert(L('Failed to load media', 'فشل في تحميل الوسائط'));
      }
    } catch (e) {
      alert(L('Network error', 'خطأ في الشبكة'));
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
      setImportLoading(false);
    }
  };

  const handleSaveNewTmpl = () => {
    if (!newTmplName.trim() || !newTmplContent.trim()) return;
    const newTmpl = { id: Date.now().toString(), name: newTmplName, content: newTmplContent, status: 'Active' };
    const updated = [...templates, newTmpl];
    setTemplates(updated);
    saveGC({ ...GC, telegramHub: { ...(GC.telegramHub || {}), templates: updated } });
    setShowCreateTmplModal(false);
    setNewTmplName('');
    setNewTmplContent('');
  };

  const handleTmplClick = (tmpl) => {
    setSelectedTmplToSend(tmpl);
    setSendTmplToAll(true);
    setSelectedContactsForTmpl([]);
    setShowSendTmplModal(true);
  };

  const handleSendTemplateSubmit = async () => {
    if (!GC?.integrations?.telegramBotToken) { alert(L('Connect Telegram Bot first', 'قم بربط البوت أولاً')); return; }
    
    if (isTmplScheduled && !tmplScheduleDate) {
      alert(L('Please select a date and time for scheduling', 'يرجى تحديد التاريخ والوقت للجدولة'));
      return;
    }

    setSendingTmpl(true);
    let targets = sendTmplToAll ? liveContacts : liveContacts.filter(c => selectedContactsForTmpl.includes(c.id));
    if (targets.length === 0) { alert(L('No contacts selected', 'لم يتم تحديد جهات اتصال')); setSendingTmpl(false); return; }
    
    let successCount = 0;
    
    if (isTmplScheduled) {
      alert(L(`Scheduled successfully to ${targets.length} contacts for ${new Date(tmplScheduleDate).toLocaleString()}`, `تمت الجدولة بنجاح لـ ${targets.length} جهة اتصال في ${new Date(tmplScheduleDate).toLocaleString()}`));
      
      const historyEntry = {
        id: Date.now().toString(),
        templateName: selectedTmplToSend.name,
        sentAt: tmplScheduleDate,
        successCount: 0,
        totalTargets: targets.length,
        status: 'Scheduled'
      };
      
      const updatedHistory = [historyEntry, ...templateHistory];
      setTemplateHistory(updatedHistory);
      saveTGHub({ templateHistory: updatedHistory });
    } else {
      for (let contact of targets) {
        let msgText = selectedTmplToSend.content.replace(/\{\{name\}\}/g, contact.firstName || 'مرحباً');
        try {
          const res = await fetch('/api/telegram/send-test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: GC.integrations.telegramBotToken, chatId: contact.id, message: msgText })
          });
          const data = await res.json();
          if (data.ok) {
            successCount++;
            const msgRef = doc(collection(db, `telegram_chats/${contact.id}/messages`));
            await setDoc(msgRef, { text: msgText, date: Math.floor(Date.now() / 1000), direction: 'outbound', from: 'agent' });
            const chatRef = doc(db, 'telegram_chats', contact.id);
            await setDoc(chatRef, { lastMessage: msgText, lastMessageAt: new Date().toISOString(), unreadCount: 0 }, { merge: true });
          }
        } catch (err) {}
      }
      alert(L(`Sent successfully to ${successCount} contacts`, `تم الإرسال بنجاح إلى ${successCount} جهة اتصال`));
      
      const historyEntry = {
        id: Date.now().toString(),
        templateName: selectedTmplToSend.name,
        sentAt: new Date().toISOString(),
        successCount: successCount,
        totalTargets: targets.length,
        status: 'Sent'
      };
      const updatedHistory = [historyEntry, ...templateHistory];
      setTemplateHistory(updatedHistory);
      saveTGHub({ templateHistory: updatedHistory });
    }
    
    setSendingTmpl(false);
    setShowSendTmplModal(false);
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedChat?.id || !GC?.integrations?.telegramBotToken) return;
    setUploadingMedia(true);
    try {
      const formData = new FormData();
      formData.append('token', GC.integrations.telegramBotToken);
      formData.append('chatId', selectedChat.id);
      formData.append('file', file);
      let type = 'document';
      if (file.type.startsWith('image/')) type = 'photo';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';
      formData.append('type', type);
      
      const res = await fetch('/api/telegram/send-media', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.ok) {
        const msgRef = doc(collection(db, `telegram_chats/${selectedChat.id}/messages`));
        await setDoc(msgRef, { text: `[${type.toUpperCase()}]`, mediaType: type, date: Math.floor(Date.now() / 1000), direction: 'outbound', from: 'agent' });
        const chatRef = doc(db, 'telegram_chats', selectedChat.id);
        await setDoc(chatRef, { lastMessage: `[${type.toUpperCase()}]`, lastMessageAt: new Date().toISOString(), unreadCount: 0 }, { merge: true });
      } else { alert(data.error || L('Failed to send media', 'فشل في إرسال الميديا')); }
    } catch (err) { alert(L('Network error', 'خطأ في الشبكة')); } finally {
      setUploadingMedia(false);
      e.target.value = '';
    }
  };

  const tabs = [
    { key: 'inbox', label: L('Inbox', 'الوارده'), icon: '📥' },
    { key: 'automations', label: L('Automations', 'الأتمتة'), icon: '⚡' },
    { key: 'analytics', label: L('Analytics', 'التحليلات'), icon: '📊' },
    { key: 'templates', label: L('Templates', 'القوالب'), icon: '📋' },
    { key: 'contacts', label: L('Contacts', 'جهات الاتصال'), icon: '👤' }
  ];

  return (
    <div className="pg on" id="pg-telegram">
      <style>{`
        @keyframes chatBubbleAnim {
          0% { opacity: 0; transform: translateY(10px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .chat-bubble-enter {
          animation: chatBubbleAnim 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>
      {fullscreenImage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', backdropFilter: 'blur(5px)' }} onClick={() => setFullscreenImage(null)}>
          <img src={fullscreenImage} alt="Fullscreen" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
          <div style={{ position: 'absolute', top: '20px', right: '30px', color: '#fff', fontSize: '30px', cursor: 'pointer' }}>✕</div>
        </div>
      )}
      {/* Header */}
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">💬</span>
          <span>{L('Telegram Growth Hub', 'مركز تليجرام للنمو')}</span>
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

          <button className="btn-ai" onClick={() => setAiPanelOpen(true)}>
            ✦ {L('AI Advisor', 'مستشار الذكاء الاصطناعي')}
          </button>
          <button className="btn btn-ghost" style={{ padding: '6px 12px' }} onClick={() => setShowDiagnostics(true)}>
            ⚙️ {L('Connection Settings', 'اعدادات الربط')}
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="g4 stagger mb">
        <div className="stat-card">
          <div className="stat-lbl">💬 {L('Total Chats', 'إجمالي المحادثات')}</div>
          <div className="stat-val" id="tg-stat-chats">{dateFilteredChats.length}</div>
          <div className="stat-ch ch-nu">{L('active conversations', 'محادثات نشطة')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">📤 {L('Messages Sent', 'الرسائل المرسلة')}</div>
          <div className="stat-val" id="tg-stat-msgs">
            {dateFilteredTemplateHistory.reduce((acc, curr) => acc + (curr.successCount || 0), 0) || 0}
          </div>
          <div className="stat-ch ch-nu">{L('messages sent', 'الرسائل المرسلة')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">✅ {L('Response Rate', 'معدل الاستجابة')}</div>
          <div className="stat-val ch-up" id="tg-stat-rate">96%</div>
          <div className="stat-ch ch-nu">{L('avg response', 'متوسط الاستجابة')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">💰 {L('Revenue via Telegram', 'الأرباح عبر تليجرام')}</div>
          <div className="stat-val ch-up" id="tg-stat-rev">
            {formatMoney ? formatMoney(tgRevenue) : `$${tgRevenue}`}
          </div>
          <div className="stat-ch ch-nu">{L('total profit', 'الأرباح')}</div>
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
        <div className="tg-inbox-grid" style={{ display: 'grid', gridTemplateColumns: '600px 1fr', gap: '15px', height: '600px' }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid var(--edge)' }}>
              <div 
                style={{ flex: 1, padding: '12px 10px', textAlign: 'center', cursor: 'pointer', fontSize: '13px', fontWeight: inboxView === 'chats' ? 'bold' : 'normal', borderBottom: inboxView === 'chats' ? '2px solid var(--prime)' : 'none', color: inboxView === 'chats' ? 'var(--prime)' : 'var(--t2)', transition: 'all 0.2s' }}
                onClick={() => setInboxView('chats')}
              >
                💬 {L('Chats', 'المحادثات')}
              </div>
              <div 
                style={{ flex: 1, padding: '12px 10px', textAlign: 'center', cursor: 'pointer', fontSize: '13px', fontWeight: inboxView === 'contacts' ? 'bold' : 'normal', borderBottom: inboxView === 'contacts' ? '2px solid var(--prime)' : 'none', color: inboxView === 'contacts' ? 'var(--prime)' : 'var(--t2)', transition: 'all 0.2s' }}
                onClick={() => setInboxView('contacts')}
              >
                👤 {L('Contacts', 'جهات الاتصال')}
              </div>
            </div>
            <div style={{ padding: '12px', borderBottom: '1px solid var(--edge)' }}>
              <input className="inp" placeholder={inboxView === 'chats' ? L('🔍 Search conversations...', '🔍 البحث في المحادثات...') : L('🔍 Search contacts...', '🔍 البحث في جهات الاتصال...')} style={{ fontSize: '12px', padding: '7px 11px' }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
              {GC?.integrations?.telegramConnected ? (
                inboxView === 'chats' ? (
                  // CHATS LIST
                  dateFilteredChats.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {dateFilteredChats.map(chat => (
                        <div 
                          key={chat.id} 
                          onClick={() => setSelectedChat(chat)}
                          style={{ padding: '10px', background: selectedChat?.id === chat.id ? 'var(--surface2)' : 'var(--surface)', borderRadius: '8px', cursor: 'pointer', border: '1px solid', borderColor: selectedChat?.id === chat.id ? 'var(--prime)' : 'var(--edge)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {chat.contactId || chat.firstName || 'Unknown'}
                              {chat.unreadCount > 0 && (
                                <div style={{ width: '8px', height: '8px', background: 'var(--red)', borderRadius: '50%' }} title={L('Unreplied message', 'رسالة غير مجاب عليها')} />
                              )}
                            </div>
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
                  // CONTACTS LIST
                  liveContacts.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {liveContacts.map(contact => (
                        <div 
                          key={contact.id} 
                          onClick={() => setSelectedChat({ id: contact.id, contactId: contact.firstName, firstName: contact.firstName, lastName: contact.lastName, isNew: true })}
                          style={{ padding: '10px', background: selectedChat?.id === contact.id ? 'var(--surface2)' : 'var(--surface)', borderRadius: '8px', cursor: 'pointer', border: '1px solid', borderColor: selectedChat?.id === contact.id ? 'var(--prime)' : 'var(--edge)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                            👤
                          </div>
                          <div>
                            <div style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--t1)' }}>{contact.firstName} {contact.lastName || ''}</div>
                            <div style={{ fontSize: '11px', color: 'var(--t3)' }}>{contact.username ? `@${contact.username}` : contact.id}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--t3)', fontSize: '12px', textAlign: 'center', padding: '30px 0' }}>
                      <div style={{ fontSize: '28px', marginBottom: '8px' }}>👤</div>
                      {L('No contacts available', 'لا توجد جهات اتصال')}
                    </div>
                  )
                )
              ) : (
                <div style={{ color: 'var(--t3)', fontSize: '12px', textAlign: 'center', padding: '30px 0' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>💬</div>
                  {L('Connect Telegram API to see conversations', 'اربط حساب تليجرام لمشاهدة المحادثات')}
                </div>
              )}
            </div>
          </div>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', background: 'var(--surface)', border: 'none' }}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div style={{ padding: '10px 16px', background: 'var(--surface2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--edge)' }}>
                  <div style={{ fontWeight: '600', fontSize: '15px', color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                      👤
                    </div>
                    <div>
                      <div style={{ color: 'var(--t1)', fontSize: '16px' }}>{selectedChat.contactId || 'Unknown'}</div>
                      <div style={{ color: 'var(--prime)', fontSize: '13px', fontWeight: 'normal' }}>{L('Online', 'متصل الآن')}</div>
                    </div>
                  </div>
                  <button className="btn btn-ghost" style={{ padding: '8px', fontSize: '18px', color: 'var(--t2)' }} onClick={() => setSelectedChat(null)}>✕</button>
                </div>
                {/* Messages List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 6%', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'var(--surface)', backgroundImage: 'url("https://static.whatsapp.net/rsrc.php/v3/y_/r/5lsJeP6vJq1.png")', backgroundRepeat: 'repeat', backgroundSize: '400px', opacity: 0.9 }}>
                  {chatMessages.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--t2)', fontSize: '12.5px', marginTop: '20px', background: 'var(--surface2)', padding: '6px 12px', borderRadius: '8px', alignSelf: 'center', boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)' }}>
                      {L('Loading messages...', 'جاري تحميل الرسائل...')}
                    </div>
                  ) : (
                    chatMessages.map((msg, index) => {
                      const isOutbound = msg.direction === 'outbound';
                      // Adding a slight delay based on index so multiple messages animate sequentially if loaded together, but capping it.
                      const animDelay = Math.min(index * 0.05, 0.5) + 's';
                      return (
                        <div key={msg.id} className="chat-bubble-enter" style={{ alignSelf: isOutbound ? 'flex-end' : 'flex-start', maxWidth: '75%', animationDelay: animDelay }}>
                          <div style={{ 
                            background: isOutbound ? '#1a1a1a' : 'var(--prime, #ff6b00)', 
                            color: '#fff', 
                            padding: '6px 7px 8px 9px', 
                            borderRadius: '7.5px', 
                            borderTopRightRadius: isOutbound ? (lang==='ar'?'7.5px':'0px') : (lang==='ar'?'0px':'7.5px'),
                            borderTopLeftRadius: isOutbound ? (lang==='ar'?'0px':'7.5px') : (lang==='ar'?'7.5px':'0px'),
                            fontSize: '14.2px', 
                            lineHeight: '19px',
                            direction: lang==='ar'?'rtl':'ltr',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                            position: 'relative',
                            minWidth: '100px'
                          }}>
                            {msg.cloudinaryUrl ? (
                              <div style={{ marginBottom: msg.text && msg.text !== `[${msg.mediaType.toUpperCase()}]` ? '4px' : '0' }}>
                                {msg.mediaType === 'photo' ? (
                                  <img src={msg.cloudinaryUrl} alt="media" onLoad={scrollToBottom} style={{ maxWidth: '320px', width: '100%', maxHeight: '320px', objectFit: 'cover', borderRadius: '6px', cursor: 'zoom-in' }} onClick={() => setFullscreenImage(msg.cloudinaryUrl)} />
                                ) : msg.mediaType === 'video' ? (
                                  <video src={msg.cloudinaryUrl} controls onLoadedData={scrollToBottom} style={{ maxWidth: '320px', width: '100%', borderRadius: '6px' }} />
                                ) : msg.mediaType === 'voice' || msg.mediaType === 'audio' ? (
                                  <audio src={msg.cloudinaryUrl} controls onLoadedData={scrollToBottom} style={{ maxWidth: '250px', height: '40px' }} />
                                ) : (
                                  <a href={msg.cloudinaryUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '6px' }}>
                                    <span style={{fontSize: '24px'}}>📄</span> <span style={{flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{L('Download Document', 'تحميل المستند')}</span>
                                  </a>
                                )}
                              </div>
                            ) : msg.mediaType ? (
                              <div 
                                onClick={() => handleViewMedia(msg.mediaFileId)}
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  gap: '8px',
                                  marginBottom: msg.text && msg.text !== `[${msg.mediaType.toUpperCase()}]` ? '4px' : '0', 
                                  padding: '12px', 
                                  background: 'rgba(255,255,255,0.2)', 
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  color: '#fff'
                                }}
                                title={L('Click to view media', 'اضغط لعرض الميديا')}
                              >
                                {msg.mediaType === 'photo' ? <><span style={{fontSize: '24px'}}>📷</span> {L('Photo', 'صورة')}</> :
                                 msg.mediaType === 'video' ? <><span style={{fontSize: '24px'}}>🎥</span> {L('Video', 'فيديو')}</> :
                                 msg.mediaType === 'voice' ? <><span style={{fontSize: '24px'}}>🎤</span> {L('Voice Message', 'رسالة صوتية')}</> :
                                 msg.mediaType === 'document' ? <><span style={{fontSize: '24px'}}>📄</span> {L('Document', 'مستند')}</> :
                                 msg.mediaType === 'sticker' ? <><span style={{fontSize: '24px'}}>🎭</span> {L('Sticker', 'ملصق')}</> :
                                 <><span style={{fontSize: '24px'}}>📎</span> {L('Media', 'ميديا')}</>}
                              </div>
                            ) : null}
                            {(!msg.mediaType || (msg.text && msg.text !== `[${msg.mediaType.toUpperCase()}]`)) && (
                              <div style={{ padding: '2px 4px 10px 4px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.text}</div>
                            )}
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', position: 'absolute', bottom: '4px', right: lang==='ar' ? 'auto' : '8px', left: lang==='ar' ? '8px' : 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {new Date(msg.date * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              {isOutbound && <span style={{ color: '#fff', fontSize: '14px', marginLeft: '2px', marginRight: '2px' }}>✓✓</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                {/* Chat Input */}
                <div style={{ padding: '10px 16px', background: 'var(--surface2)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input type="file" style={{ display: 'none' }} ref={fileInputRef} onChange={handleMediaUpload} />
                  <button className="btn btn-ghost" style={{ padding: '8px', fontSize: '24px', color: 'var(--t2)', background: 'transparent', border: 'none' }} onClick={() => fileInputRef.current?.click()} disabled={uploadingMedia || replyLoading} title={L('Attach File', 'إرفاق ملف')}>
                    {uploadingMedia ? '⏳' : '📎'}
                  </button>
                  <input 
                    className="inp"  
                    placeholder={L('Type a message', 'اكتب رسالة')} 
                    style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '8px', padding: '12px 16px', color: 'var(--t1)', fontSize: '15px' }} 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                  />
                  <button className="btn btn-ghost" style={{ padding: '8px', fontSize: '20px', color: replyText.trim() ? 'var(--prime)' : 'var(--t3)', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={handleSendReply} disabled={replyLoading || !replyText.trim()}>
                    {replyLoading ? '⏳' : (lang==='ar' ? '◀' : '▶')}
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
            
            {showAutoModal ? (
              <div style={{ background: 'var(--surface2)', borderRadius: '10px', padding: '14px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Automation Name', 'اسم الأتمتة')}
                  </label>
                  <input className="inp" placeholder="e.g. Price Reply" value={autoForm.name} onChange={e => setAutoForm({...autoForm, name: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Keyword Trigger', 'الكلمة المفتاحية')}
                  </label>
                  <input className="inp" placeholder="e.g. سعر, price" value={autoForm.keyword} onChange={e => setAutoForm({...autoForm, keyword: e.target.value})} />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Reply Message', 'رسالة الرد')}
                  </label>
                  <textarea className="inp" rows="3" placeholder="أهلاً بك، أسعارنا تبدأ من..." value={autoForm.reply} onChange={e => setAutoForm({...autoForm, reply: e.target.value})} />
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                  <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowAutoModal(false)}>
                    {L('Cancel', 'إلغاء')}
                  </button>
                  <button className="btn btn-prime" style={{ flex: 1, justifyContent: 'center' }} onClick={handleAddAutomation}>
                    {L('Save Automation', 'حفظ الأتمتة')}
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn btn-prime" style={{ width: '100%', justifyContent: 'center', marginBottom: '15px' }} onClick={() => setShowAutoModal(true)}>
                {L('+ Create New Automation', '+ إنشاء أتمتة جديدة')}
              </button>
            )}
          </div>

          <div className="card">
            <div className="sec-hd"><div className="sec-title">⚡ {L('Active Automations', 'الأتمتة النشطة')}</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {automations.length === 0 ? (
                <div className="empty-state" style={{ padding: '20px' }}>
                  <div className="es-icon">⚡</div>
                  <div className="es-title">{L('No automations', 'لا توجد أتمتة')}</div>
                  <div className="es-sub">{L('Create rules to automatically reply based on keywords', 'قم بإنشاء قواعد للرد التلقائي بناءً على الكلمات المفتاحية')}</div>
                </div>
              ) : (
                automations.map(auto => (
                  <div key={auto.id} style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '9px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)', marginBottom: '3px' }}>{auto.name}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--t2)' }}>
                        {L('Trigger:', 'المشغل:')} <span style={{ color: 'var(--amber)', fontWeight: 500 }}>{auto.keyword}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                        ↪ {auto.reply}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input type="checkbox" checked={auto.active} onChange={() => handleToggleAutomation(auto.id)} style={{ marginRight: '5px' }} />
                        <span style={{ fontSize: '11px', color: auto.active ? 'var(--green)' : 'var(--t3)' }}>
                          {auto.active ? L('Active', 'نشط') : L('Disabled', 'معطل')}
                        </span>
                      </label>
                      <button className="btn btn-ghost" style={{ padding: '4px', color: 'var(--red)' }} onClick={() => handleDeleteAutomation(auto.id)} title={L('Delete', 'حذف')}>
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}







      {/* 8. ANALYTICS TAB */}
      {activeTab === 'analytics' && (() => {
        // Analytics Calculations
        const totalTemplatesSent = dateFilteredTemplateHistory.filter(h => h.status !== 'Scheduled').reduce((acc, curr) => acc + (curr.successCount || 0), 0);
        
        const uniqueContactsSet = new Set();
        dateFilteredChats.forEach(c => uniqueContactsSet.add(c.contactId || c.id));
        const totalContactsReached = uniqueContactsSet.size || dateFilteredContacts.length;
        
        const scheduledTemplatesCount = dateFilteredTemplateHistory.filter(h => h.status === 'Scheduled').reduce((acc, curr) => acc + (curr.totalTargets || 0), 0);
        
        // Most used templates
        const tmplUsage = {};
        dateFilteredTemplateHistory.filter(h => h.status !== 'Scheduled').forEach(h => {
          if (!tmplUsage[h.templateName]) {
            tmplUsage[h.templateName] = { name: h.templateName, count: 0, success: 0 };
          }
          tmplUsage[h.templateName].count += 1;
          tmplUsage[h.templateName].success += (h.successCount || 0);
        });
        const topTmpls = Object.values(tmplUsage).sort((a, b) => b.success - a.success).slice(0, 5);
        const maxSuccess = topTmpls.length > 0 ? Math.max(1, ...topTmpls.map(t => t.success)) : 1;

        // Top Contacts
        const topContacts = [...dateFilteredChats].sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)).slice(0, 8);

        // 7-Day Activity Trend
        const last7Days = Array.from({length: 7}, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().split('T')[0];
        });
        const activityData = last7Days.map(date => {
          const count = dateFilteredTemplateHistory
            .filter(h => (h.status === 'Sent' || !h.status) && h.sentAt.startsWith(date))
            .reduce((acc, curr) => acc + (curr.successCount || 0), 0);
          return { 
            date: new Date(date).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'short' }), 
            count 
          };
        });
        const maxActivity = Math.max(...activityData.map(d => d.count), 5); // minimum height 5

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="g3 stagger">
              <div className="stat-card">
                <div className="stat-lbl">📨 {L('Total Templates Sent', 'إجمالي القوالب المرسلة')}</div>
                <div className="stat-val">{totalTemplatesSent}</div>
                <div className="stat-ch ch-up">{L('Successful deliveries', 'توصيل ناجح')}</div>
              </div>
              <div className="stat-card">
                <div className="stat-lbl">👤 {L('People Contacted', 'الأشخاص الذين تم التواصل معهم')}</div>
                <div className="stat-val">{totalContactsReached}</div>
                <div className="stat-ch ch-nu">{L('Unique contacts', 'جهات اتصال فريدة')}</div>
              </div>
              <div className="stat-card">
                <div className="stat-lbl">🕒 {L('Scheduled to Send', 'مجدول للإرسال')}</div>
                <div className="stat-val" style={{ color: 'var(--prime)' }}>{scheduledTemplatesCount}</div>
                <div className="stat-ch ch-nu">{L('Pending deliveries', 'عمليات إرسال معلقة')}</div>
              </div>
            </div>

            <div className="card">
              <div className="sec-hd"><div className="sec-title">📈 {L('Telegram Performance (Last 7 Days)', 'أداء تليجرام (آخر 7 أيام)')}</div></div>
              <div style={{ position: 'relative', height: '180px', marginTop: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--edge)' }}>
                <div style={{ position: 'absolute', top: 0, left: lang === 'ar' ? 'auto' : 0, right: lang === 'ar' ? 0 : 'auto', color: 'var(--t3)', fontSize: '11px' }}>{maxActivity}</div>
                <div style={{ position: 'absolute', bottom: '25px', left: lang === 'ar' ? 'auto' : 0, right: lang === 'ar' ? 0 : 'auto', color: 'var(--t3)', fontSize: '11px' }}>0</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', height: '100%', paddingLeft: lang==='ar'?'0':'30px', paddingRight: lang==='ar'?'30px':'0' }}>
                  {activityData.map((d, i) => {
                    const heightPct = (d.count / maxActivity) * 100;
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ flex: 1, position: 'relative', width: '30%', minWidth: '12px', margin: '0 auto' }}>
                          <div style={{ 
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: `${Math.max(heightPct, 4)}%`, 
                            background: '#EC5C31', 
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.3s'
                          }}>
                            {d.count > 0 && (
                              <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', color: 'var(--t2)', fontWeight: 'bold' }}>
                                {d.count}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--t2)', textAlign: 'center', marginTop: '8px', whiteSpace: 'nowrap' }}>{d.date}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div className="sec-title">📈 {L('Most Used Templates', 'أكثر القوالب استخداماً')}</div></div>
                {topTmpls.length === 0 ? (
                  <div className="empty-state" style={{ padding: '30px' }}>
                    <div className="es-icon">📊</div>
                    <div className="es-sub">{L('No template data yet', 'لا توجد بيانات للقوالب بعد')}</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {topTmpls.map((tmpl, idx) => (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px', fontWeight: '500' }}>
                          <span>{tmpl.name}</span>
                          <span>{tmpl.success} {L('sent', 'مُرسلة')}</span>
                        </div>
                        <div style={{ width: '100%', height: '12px', background: 'var(--surface2)', borderRadius: '6px', overflow: 'hidden' }}>
                          <div style={{ width: `${(tmpl.success / maxSuccess) * 100}%`, height: '100%', background: '#EC5C31', borderRadius: '6px' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card">
                <div className="sec-hd"><div className="sec-title">🔥 {L('Top Recent Contacts', 'أحدث وأكثر العملاء تفاعلاً')}</div></div>
                {topContacts.length === 0 ? (
                  <div className="empty-state" style={{ padding: '30px' }}>
                    <div className="es-icon">💬</div>
                    <div className="es-sub">{L('No active contacts yet', 'لا توجد جهات اتصال نشطة')}</div>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                      <thead>
                        <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--edge)' }}>
                          <th style={{ padding: '8px', textAlign: lang==='ar'?'right':'left' }}>{L('Contact', 'جهة الاتصال')}</th>
                          <th style={{ padding: '8px', textAlign: lang==='ar'?'right':'left' }}>{L('Last Message', 'آخر رسالة')}</th>
                          <th style={{ padding: '8px', textAlign: lang==='ar'?'right':'left' }}>{L('Last Active', 'آخر نشاط')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topContacts.map(c => (
                          <tr key={c.id} style={{ borderBottom: '1px solid var(--edge)' }}>
                            <td style={{ padding: '8px', fontWeight: 600 }}>{c.contactId || c.id}</td>
                            <td style={{ padding: '8px', color: 'var(--t2)', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.lastMessage}</td>
                            <td style={{ padding: '8px', color: 'var(--t3)' }}>{new Date(c.lastMessageAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 9. TEMPLATES TAB */}
      {activeTab === 'templates' && (
        <>
        <div className="g2">
          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">📋 {L('Template Library', 'مكتبة القوالب')}</div>
              <button className="btn-ai" onClick={handleGenerateTemplate}>
                ✦ {L('AI Generate', 'توليد بالذكاء الاصطناعي')}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {templates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--t3)' }}>
                  {L('No templates available. Create one!', 'لا توجد قوالب. أنشئ واحداً الآن!')}
                </div>
              ) : (
                templates.map(tmpl => (
                  <div key={tmpl.id} onClick={() => handleTmplClick(tmpl)} style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '9px', padding: '10px', cursor: 'pointer', transition: 'all .14s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--prime)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--edge)'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--t1)' }}>{tmpl.name}</span>
                      <span className={`badge ${tmpl.status === 'Active' ? 'b-green' : 'b-amber'}`}>{tmpl.status === 'Active' ? L('Active', 'نشط') : L('Draft', 'مسودة')}</span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--t2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tmpl.content}
                    </div>
                  </div>
                ))
              )}
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }} onClick={() => setShowCreateTmplModal(true)}>
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
                 <div className="ai-box" style={{ marginTop: '8px' }} dangerouslySetInnerHTML={{ __html: parseMarkdown(tmplOutput) }} />
              )}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: '16px' }}>
          <div className="sec-hd">
            <div className="sec-title">🕒 {L('Send History', 'سجل الإرسال')}</div>
          </div>
          {dateFilteredTemplateHistory.length === 0 ? (
            <div className="empty-state">
              <div className="es-icon">🕒</div>
              <div className="es-title">{L('No send history yet', 'لا يوجد سجل إرسال بعد')}</div>
              <div className="es-sub">{L('Templates you send will appear here with their details', 'القوالب التي تقوم بإرسالها ستظهر هنا مع تفاصيلها')}</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--edge)' }}>
                    <th style={{ padding: '10px', textAlign: lang==='ar'?'right':'left' }}>{L('Date', 'التاريخ')}</th>
                    <th style={{ padding: '10px', textAlign: lang==='ar'?'right':'left' }}>{L('Template Name', 'اسم القالب')}</th>
                    <th style={{ padding: '10px', textAlign: lang==='ar'?'right':'left' }}>{L('Success Rate', 'معدل النجاح')}</th>
                    <th style={{ padding: '10px', textAlign: lang==='ar'?'right':'left' }}>{L('Total Targets', 'المستهدفين')}</th>
                  </tr>
                </thead>
                <tbody>
                  {dateFilteredTemplateHistory.map(hist => (
                    <tr key={hist.id} style={{ borderBottom: '1px solid var(--edge)' }}>
                      <td style={{ padding: '10px', color: 'var(--t2)', textAlign: lang==='ar'?'right':'left' }}>{new Date(hist.sentAt).toLocaleString()}</td>
                      <td style={{ padding: '10px', fontWeight: 600, color: 'var(--t1)', textAlign: lang==='ar'?'right':'left' }}>{hist.templateName}</td>
                      <td style={{ padding: '10px', textAlign: lang==='ar'?'right':'left' }}>
                        {hist.status === 'Scheduled' ? (
                          <span className="badge b-purple">{L('Scheduled', 'مجدول')}</span>
                        ) : (
                          <span className={`badge ${hist.successCount === hist.totalTargets && hist.totalTargets > 0 ? 'b-green' : (hist.successCount > 0 ? 'b-amber' : 'b-red')}`}>
                            {hist.successCount} / {hist.totalTargets}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px', color: 'var(--t2)', textAlign: lang==='ar'?'right':'left' }}>{hist.totalTargets} {L('Contacts', 'جهات اتصال')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </>
      )}

      {/* 10. CONTACTS TAB */}
      {activeTab === 'contacts' && (() => {
        const totalContacts = dateFilteredContacts.length;
        const hotLeadsCount = dateFilteredContacts.filter(c => c.status === 'hot' || c.type === 'hot' || c.firstName?.toLowerCase().includes('test')).length;
        const buyersCount = dateFilteredContacts.filter(c => c.status === 'buyer' || c.type === 'buyer' || c.status === 'customer').length;
        const inactiveCount = dateFilteredContacts.filter(c => c.status === 'inactive' || c.type === 'inactive').length;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="g4 stagger">
              <div className="stat-card">
                <div className="stat-lbl">👤 {L('Total Contacts', 'إجمالي جهات الاتصال')}</div>
                <div className="stat-val">{totalContacts}</div>
              </div>
              <div className="stat-card">
                <div className="stat-lbl">🔥 {L('Hot Leads', 'عملاء محتملون ساخنون')}</div>
                <div className="stat-val ch-up">{hotLeadsCount}</div>
              </div>
              <div className="stat-card">
                <div className="stat-lbl">💰 {L('Buyers', 'المشترين')}</div>
                <div className="stat-val ch-up">{buyersCount}</div>
              </div>
              <div className="stat-card">
                <div className="stat-lbl">😴 {L('Inactive', 'غير نشط')}</div>
                <div className="stat-val ch-nu">{inactiveCount}</div>
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
              {dateFilteredContacts.length > 0 ? (
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
                      {dateFilteredContacts.map(contact => (
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
        );
      })()}

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

      {showCreateTmplModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ width: '90%', maxWidth: '400px' }}>
            <div className="sec-hd">
              <div className="sec-title">{L('Create Template', 'إنشاء قالب جديد')}</div>
              <button onClick={() => setShowCreateTmplModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--t2)', cursor: 'pointer', fontSize: '18px' }}>&times;</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Template Name', 'اسم القالب')}</label>
                <input className="inp" value={newTmplName} onChange={e => setNewTmplName(e.target.value)} placeholder={L('e.g. Welcome Message', 'مثال: رسالة الترحيب')} />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Message Content', 'محتوى الرسالة')}</label>
                <textarea className="inp" rows="5" value={newTmplContent} onChange={e => setNewTmplContent(e.target.value)} placeholder={L('Hello {{name}}, ...', 'مرحباً {{name}}، ...')} />
              </div>
              <button className="btn btn-prime" style={{ justifyContent: 'center' }} onClick={handleSaveNewTmpl}>
                {L('Save Template', 'حفظ القالب')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSendTmplModal && selectedTmplToSend && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card" style={{ width: '90%', maxWidth: '450px' }}>
            <div className="sec-hd">
              <div className="sec-title">📤 {L('Send Template', 'إرسال القالب')}</div>
              <button onClick={() => setShowSendTmplModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--t2)', cursor: 'pointer', fontSize: '18px' }}>&times;</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'var(--surface2)', padding: '10px', borderRadius: '8px', fontSize: '12px', color: 'var(--t1)' }}>
                <strong>{selectedTmplToSend.name}</strong><br/>
                <span style={{ color: 'var(--t2)' }}>{selectedTmplToSend.content}</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div 
                  onClick={() => setSendTmplToAll(true)}
                  style={{ 
                    padding: '12px 10px', 
                    border: '1px solid', 
                    borderColor: sendTmplToAll ? 'var(--prime, #EC5C31)' : 'var(--edge)', 
                    background: sendTmplToAll ? 'rgba(236, 92, 49, 0.08)' : 'var(--surface2)', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: sendTmplToAll ? '700' : '500', color: sendTmplToAll ? 'var(--prime, #EC5C31)' : 'var(--t1)' }}>
                    {L('Send to All Contacts', 'إرسال لجميع جهات الاتصال')} ({liveContacts.length})
                  </div>
                </div>
                <div 
                  onClick={() => setSendTmplToAll(false)}
                  style={{ 
                    padding: '12px 10px', 
                    border: '1px solid', 
                    borderColor: !sendTmplToAll ? 'var(--prime, #EC5C31)' : 'var(--edge)', 
                    background: !sendTmplToAll ? 'rgba(236, 92, 49, 0.08)' : 'var(--surface2)', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: !sendTmplToAll ? '700' : '500', color: !sendTmplToAll ? 'var(--prime, #EC5C31)' : 'var(--t1)' }}>
                    {L('Select Specific Contacts', 'اختيار جهات اتصال محددة')}
                  </div>
                </div>
              </div>

              {!sendTmplToAll && (
                <div style={{ border: '1px solid var(--edge)', borderRadius: '8px', padding: '10px', maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--surface)' }}>
                  {liveContacts.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--t3)', fontSize: '12px' }}>{L('No contacts available', 'لا توجد جهات اتصال')}</div>
                  ) : (
                    <>
                      <div 
                        onClick={() => {
                          const isChecked = selectedContactsForTmpl.length === liveContacts.length && liveContacts.length > 0;
                          if (!isChecked) setSelectedContactsForTmpl(liveContacts.map(c => c.id));
                          else setSelectedContactsForTmpl([]);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderBottom: '1px solid var(--edge)', paddingBottom: '8px', marginBottom: '4px' }}
                      >
                        <div style={{ 
                          width: '18px', height: '18px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: `2px solid ${(selectedContactsForTmpl.length === liveContacts.length && liveContacts.length > 0) ? 'var(--prime, #EC5C31)' : 'var(--t3)'}`,
                          background: (selectedContactsForTmpl.length === liveContacts.length && liveContacts.length > 0) ? 'var(--prime, #EC5C31)' : 'transparent',
                          transition: 'all 0.2s'
                        }}>
                          {(selectedContactsForTmpl.length === liveContacts.length && liveContacts.length > 0) && <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>✓</span>}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--t1)' }}>{L('Select All', 'تحديد الكل')}</span>
                      </div>
                      
                      {liveContacts.map(c => {
                        const isChecked = selectedContactsForTmpl.includes(c.id);
                        return (
                          <div 
                            key={c.id} 
                            onClick={() => {
                              if (!isChecked) setSelectedContactsForTmpl(prev => [...prev, c.id]);
                              else setSelectedContactsForTmpl(prev => prev.filter(id => id !== c.id));
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '4px 0' }}
                          >
                            <div style={{ 
                              width: '18px', height: '18px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: `2px solid ${isChecked ? 'var(--prime, #EC5C31)' : 'var(--edge)'}`,
                              background: isChecked ? 'var(--prime, #EC5C31)' : 'transparent',
                              transition: 'all 0.2s'
                            }}>
                              {isChecked && <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>✓</span>}
                            </div>
                            <span style={{ fontSize: '13px', color: 'var(--t1)' }}>{c.firstName} {c.lastName || ''}</span>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', marginBottom: '8px' }}>
                <input 
                  type="checkbox" 
                  id="schedule-tmpl-toggle"
                  checked={isTmplScheduled} 
                  onChange={(e) => setIsTmplScheduled(e.target.checked)} 
                />
                <label htmlFor="schedule-tmpl-toggle" style={{ fontSize: '13px', color: 'var(--t1)', cursor: 'pointer', userSelect: 'none' }}>
                  {L('Schedule for later', 'جدولة الإرسال لوقت لاحق')}
                </label>
              </div>
              
              {isTmplScheduled && (
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Date & Time', 'تاريخ ووقت الإرسال')}
                  </label>
                  <input 
                    className="inp" 
                    type="datetime-local" 
                    value={tmplScheduleDate}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setTmplScheduleDate(e.target.value)}
                  />
                </div>
              )}

              <button className="btn btn-prime" style={{ justifyContent: 'center' }} onClick={handleSendTemplateSubmit} disabled={sendingTmpl || (!sendTmplToAll && selectedContactsForTmpl.length === 0)}>
                {sendingTmpl ? L('Processing...', 'جاري التنفيذ...') : (isTmplScheduled ? L('Schedule Template', 'جدولة القالب') : L('Send Now', 'إرسال الآن'))}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
