'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { useAuth } from '../../context/AuthContext';
import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut as fbSignOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db, firebaseConfig } from '../../lib/firebase';
import { callClaudeAPI } from '../../utils/ai';
import CustomSelect from '../CustomSelect';
import { parseMarkdown } from '../../utils/markdown';

export default function TeamManagementView() {
  const { t, L, lang, GC, saveGC, formatMoney, confirmAction, isTeamMember } = useBusiness();
  const { user: currentUser, userData } = useAuth();
  
  // Tab states: chat, members, tasks, permissions, payroll, logs
  const [activeTab, setActiveTab] = useState('chat');
  
  // Modals state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isCredsModalOpen, setIsCredsModalOpen] = useState(false);
  const [credsInfo, setCredsInfo] = useState({ email: '', password: '', name: '' });
  const [isCreating, setIsCreating] = useState(false);
  
  // Selected member index for Permissions tab
  const [selectedPermMemberIndex, setSelectedPermMemberIndex] = useState(0);

  // Member Form State
  const [mName, setMName] = useState('');
  const [mEmail, setMEmail] = useState('');
  const [mPhone, setMPhone] = useState('');
  const [mRole, setMRole] = useState('Sales');
  const [mDept, setMDept] = useState('');
  const [mSalary, setMSalary] = useState('1500');
  const [mContract, setMContract] = useState('Full-time');
  const [mJoinDate, setMJoinDate] = useState('');
  const [mPassword, setMPassword] = useState('');
  const [mPermissions, setMPermissions] = useState(['dashboard']);

  // Edit Member Form State
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [editingMemberIdx, setEditingMemberIdx] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('Sales');
  const [editDept, setEditDept] = useState('');
  const [editSalary, setEditSalary] = useState('1500');
  const [editContract, setEditContract] = useState('Full-time');
  const [editJoinDate, setEditJoinDate] = useState('');
  const [editPermissions, setEditPermissions] = useState([]);

  // Task Form State
  const [tTitle, setTTitle] = useState('');
  const [tAssignee, setTAssignee] = useState('');
  const [tPriority, setTPriority] = useState('medium');
  const [tDueDate, setTDueDate] = useState('');
  const [tDesc, setTDesc] = useState('');

  // 💬 CHAT STATES
  const [messageText, setMessageText] = useState('');
  const [activeChannelId, setActiveChannelId] = useState('general');
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [newChanName, setNewChanName] = useState('');
  const [newChanType, setNewChanType] = useState('public');
  const [newChanDesc, setNewChanDesc] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const chatEndRef = useRef(null);

  // Bind properties to GC
  const members = GC.team?.members || [];
  const tasks = GC.team?.tasks || [];
  const logs = GC.team?.logs || [];
  const channels = GC.teamChat?.channels || [
    { id: 'general', name: 'general', type: 'public', desc: 'General workspace discussion' },
    { id: 'marketing', name: 'marketing', type: 'public', desc: 'Marketing OS updates' },
    { id: 'announcements', name: 'announcements', type: 'public', desc: 'Company-wide announcements' }
  ];
  const channelMsgs = GC.teamChat?.messages?.[activeChannelId] || [];
  const activeChannel = channels.find(c => c.id === activeChannelId) || channels[0];

  // Task filter states
  const [taskFilter, setTaskFilter] = useState('all'); // all, pending, completed

  // Helper values
  const monthlyPayroll = members.reduce((sum, m) => sum + (parseFloat(m.salary) || 0), 0);
  const annualPayroll = monthlyPayroll * 12;
  const tasksDoneCount = tasks.filter(t => t.done).length;
  
  // Calculate revenue from GC.finance.entries
  const totalRevenue = GC.finance?.entries?.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0) || 0;
  const payrollRatio = totalRevenue > 0 ? ((monthlyPayroll / totalRevenue) * 100).toFixed(1) + '%' : '0%';

  // Scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [channelMsgs.length, activeChannelId, activeTab]);

  // Permission IDs to allowedTools mapping
  const permToToolMap = {
    dashboard: 'home',
    crm: 'crm',
    telegram: 'telegram',
    marketing: 'marketing',
    content: 'content',
    finance: 'finance',
    tasks: 'tasks',
    community: 'community',
    analytics: 'analytics',
    integrations: 'integrations',
    team: 'team',
    calendar: 'calendar',
    support: 'support'
  };

  const handleToggleFormPerm = (permId) => {
    if (mPermissions.includes(permId)) {
      setMPermissions(mPermissions.filter(p => p !== permId));
    } else {
      setMPermissions([...mPermissions, permId]);
    }
  };

  // Generate a random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars[Math.floor(Math.random() * chars.length)];
    }
    return pwd;
  };

  // CHAT SEND MESSAGE
  const getAuthorName = () => {
    if (isTeamMember && userData?.name) return userData.name;
    return userData?.name || GC.profile?.name || 'User';
  };

  const handleSendMessage = async (textToSend = messageText) => {
    const cleanText = textToSend || messageText;
    if (!cleanText.trim()) return;

    const authorName = getAuthorName();
    const newMessage = {
      id: Date.now(),
      author: authorName,
      content: cleanText.trim(),
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {}
    };

    const currentChannelMsgs = GC.teamChat?.messages?.[activeChannelId] || [];
    const updatedMessagesMap = {
      ...(GC.teamChat?.messages || {}),
      [activeChannelId]: [...currentChannelMsgs, newMessage]
    };

    const updatedGC = {
      ...GC,
      teamChat: {
        ...GC.teamChat,
        messages: updatedMessagesMap
      }
    };

    saveGC(updatedGC);
    setMessageText('');

    // Trigger AI response if message starts with @ai or mentions bot
    if (cleanText.trim().toLowerCase().startsWith('@ai')) {
      await handleTriggerAiBot(cleanText.trim().slice(3).trim(), [...currentChannelMsgs, newMessage]);
    }
  };

  // Chat AI Meeting Bot Integration
  const handleTriggerAiBot = async (queryText, historyMsgs) => {
    const activeMsgs = historyMsgs.slice(-10); // last 10 messages for context
    const chatContext = activeMsgs.map(m => `${m.author}: ${m.content}`).join('\n');
    
    const prompt = `You are a helpful AI Team Bot named "@ai" inside the Team Chat.
Active Channel: #${activeChannel.name}
Recent Chat messages:
${chatContext}

User Query: "${queryText}"

Provide a useful, direct, and actionable answer to the team. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}. Keep it concise (2-3 sentences).`;

    const system = "You are a professional business advisor and team assistant. Keep replies concise and formatted in markdown.";
    
    // Temporarily insert typing indicator
    const typingMessage = {
      id: 'typing',
      author: '🤖 AI Bot',
      content: lang === 'ar' ? 'جاري التفكير...' : 'Thinking...',
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reactions: {}
    };

    const updatedWithTyping = {
      ...GC,
      teamChat: {
        ...GC.teamChat,
        messages: {
          ...(GC.teamChat?.messages || {}),
          [activeChannelId]: [...historyMsgs, typingMessage]
        }
      }
    };
    saveGC(updatedWithTyping);

    try {
      const aiReply = await callClaudeAPI(prompt, system, lang, GC);
      
      const responseMessage = {
        id: Date.now() + 1,
        author: '🤖 AI Bot',
        content: aiReply,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reactions: {}
      };

      const finalMessages = {
        ...(GC.teamChat?.messages || {}),
        [activeChannelId]: [...historyMsgs, responseMessage]
      };

      saveGC({
        ...GC,
        teamChat: {
          ...GC.teamChat,
          messages: finalMessages
        }
      });
    } catch (e) {
      console.error(e);
      // Remove typing indicator if failed
      saveGC({
        ...GC,
        teamChat: {
          ...GC.teamChat,
          messages: {
            ...(GC.teamChat?.messages || {}),
            [activeChannelId]: historyMsgs
          }
        }
      });
    }
  };

  // Summarize channel chat with AI
  const handleSummarizeChannel = async () => {
    if (channelMsgs.length === 0) return;
    setAiLoading(true);
    setAiSummary('');

    const contextText = channelMsgs.slice(-30).map(m => `${m.author}: ${m.content}`).join('\n');
    const prompt = `Review this recent team chat conversation:
${contextText}

Generate a concise summary of discussions, key decisions made, and a bulleted action checklist of items for team members. Write it in ${lang === 'ar' ? 'Arabic' : 'English'}.`;

    const system = "You are a professional administrative assistant. Format your output with clear markdown headings and checkbox items.";

    try {
      const summaryRes = await callClaudeAPI(prompt, system, lang, GC);
      setAiSummary(summaryRes);
    } catch (err) {
      setAiSummary(L('Failed to generate summary.', 'فشل توليد التلخيص الذكي.'));
    }
    setAiLoading(false);
  };

  const handleCreateChannel = (e) => {
    e.preventDefault();
    if (!newChanName.trim()) return;

    const cleanChanName = newChanName.toLowerCase().replace(/\s/g, '-').replace(/[^a-z0-9-_]/g, '');
    const newChan = {
      id: cleanChanName,
      name: cleanChanName,
      type: newChanType,
      desc: newChanDesc
    };

    saveGC({
      ...GC,
      teamChat: {
        ...GC.teamChat,
        channels: [...channels, newChan]
      }
    });

    setNewChanName('');
    setNewChanDesc('');
    setIsGroupModalOpen(false);
    setActiveChannelId(cleanChanName);
  };

  const handleDeleteMessage = (msgId) => {
    const updatedMsgs = channelMsgs.filter(m => m.id !== msgId);
    saveGC({
      ...GC,
      teamChat: {
        ...GC.teamChat,
        messages: {
          ...(GC.teamChat?.messages || {}),
          [activeChannelId]: updatedMsgs
        }
      }
    });
  };

  // MEMBER SAVE HANDLER
  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!mName.trim() || !mEmail.trim()) {
      alert(L('Please enter Name and Email', 'الرجاء إدخال الاسم والبريد الإلكتروني'));
      return;
    }

    setIsCreating(true);

    try {
      // 1. Initialize secondary Firebase app to register member authentication credentials
      let secondaryApp;
      const apps = getApps();
      const tempAppName = 'temp-team-register';
      
      const existing = apps.find(app => app.name === tempAppName);
      if (existing) {
        secondaryApp = existing;
      } else {
        secondaryApp = initializeApp(firebaseConfig, tempAppName);
      }

      const secondaryAuth = getAuth(secondaryApp);
      const pass = mPassword.trim() || generatePassword();

      // Create authentication profile
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, mEmail.trim(), pass);
      const uid = userCredential.user.uid;

      // 2. Set client document in users table
      const allowedTools = mPermissions.map(p => permToToolMap[p]).filter(Boolean);
      await setDoc(doc(db, 'users', uid), {
        uid: uid,
        name: mName.trim(),
        email: mEmail.trim(),
        role: 'team_member',
        adminId: currentUser?.uid || '',
        allowedTools: allowedTools,
        aiCredits: 5.0,
        createdAt: new Date().toISOString()
      });

      // 3. Log metadata in project scope
      const newMember = {
        uid: uid,
        name: mName.trim(),
        email: mEmail.trim(),
        phone: mPhone,
        role: mRole,
        dept: mDept || mRole,
        salary: mSalary,
        contract: mContract,
        joinDate: mJoinDate || new Date().toLocaleDateString(),
        permissions: mPermissions,
        status: 'Offline' // Default simulated status
      };

      const newLog = {
        action: L(`Created team member: ${mName}`, `تم إضافة عضو فريق جديد: ${mName}`),
        date: new Date().toLocaleString(),
        user: getAuthorName()
      };

      saveGC({
        ...GC,
        team: {
          ...GC.team,
          members: [...members, newMember],
          logs: [newLog, ...logs]
        }
      });

      // Cleanup
      await secondaryAuth.signOut();
      await deleteApp(secondaryApp);

      setCredsInfo({ email: mEmail.trim(), password: pass, name: mName.trim() });
      setIsAddMemberOpen(false);
      setIsCredsModalOpen(true);
      
      // Clear forms
      setMName('');
      setMEmail('');
      setMPhone('');
      setMRole('Sales');
      setMDept('');
      setMSalary('1500');
      setMContract('Full-time');
      setMJoinDate('');
      setMPassword('');
      setMPermissions(['dashboard']);
    } catch (err) {
      console.error(err);
      alert(L(`Registration error: ${err.message}`, `حدث خطأ أثناء التسجيل: ${err.message}`));
    } finally {
      setIsCreating(false);
    }
  };

  // EDIT MEMBER HANDLERS
  const handleOpenEditMember = (idx) => {
    const m = members[idx];
    if (!m) return;
    setEditingMemberIdx(idx);
    setEditName(m.name || '');
    setEditPhone(m.phone || '');
    setEditRole(m.role || 'Sales');
    setEditDept(m.dept || m.role || '');
    setEditSalary(m.salary || '1500');
    setEditContract(m.contract || 'Full-time');
    setEditJoinDate(m.joinDate || '');
    setEditPermissions(m.permissions || ['dashboard']);
    setIsEditMemberOpen(true);
  };

  const handleToggleEditFormPerm = (permId) => {
    if (editPermissions.includes(permId)) {
      setEditPermissions(editPermissions.filter(p => p !== permId));
    } else {
      setEditPermissions([...editPermissions, permId]);
    }
  };

  const handleSaveEditMember = async (e) => {
    e.preventDefault();
    if (editingMemberIdx === null) return;
    
    const targetMember = members[editingMemberIdx];
    if (!targetMember) return;
    
    setIsCreating(true);
    
    try {
      // 1. Sync updated fields to Firebase users table
      const allowedTools = editPermissions.map(p => permToToolMap[p]).filter(Boolean);
      await setDoc(doc(db, 'users', targetMember.uid), {
        name: editName.trim(),
        allowedTools: allowedTools
      }, { merge: true });
      
      // 2. Build the updated member object
      const updatedMember = {
        ...targetMember,
        name: editName.trim(),
        phone: editPhone,
        role: editRole,
        dept: editDept || editRole,
        salary: editSalary,
        contract: editContract,
        joinDate: editJoinDate || targetMember.joinDate,
        permissions: editPermissions
      };
      
      const updatedMembers = [...members];
      updatedMembers[editingMemberIdx] = updatedMember;
      
      const newLog = {
        action: L(`Updated member details for: ${editName}`, `تم تحديث بيانات العضو: ${editName}`),
        date: new Date().toLocaleString(),
        user: getAuthorName()
      };
      
      saveGC({
        ...GC,
        team: {
          ...GC.team,
          members: updatedMembers,
          logs: [newLog, ...logs]
        }
      });
      
      setIsEditMemberOpen(false);
      setEditingMemberIdx(null);
      alert(L('Member details updated successfully.', 'تم تحديث بيانات عضو الفريق بنجاح.'));
    } catch (err) {
      console.error(err);
      alert(L('Error updating member: ' + err.message, 'حدث خطأ أثناء تعديل البيانات: ' + err.message));
    } finally {
      setIsCreating(false);
    }
  };

  // TASK SAVE HANDLER
  const handleSaveTask = (e) => {
    e.preventDefault();
    if (!tTitle.trim()) return;

    const newTask = {
      id: Date.now(),
      title: tTitle,
      assignee: tAssignee || 'Unassigned',
      priority: tPriority,
      dueDate: tDueDate || '—',
      desc: tDesc,
      done: false
    };

    const newLog = {
      action: L(`Assigned task: "${tTitle}" to ${newTask.assignee}`, `تم إسناد مهمة: "${tTitle}" إلى ${newTask.assignee}`),
      date: new Date().toLocaleString(),
      user: getAuthorName()
    };

    saveGC({
      ...GC,
      team: {
        ...GC.team,
        tasks: [newTask, ...tasks],
        logs: [newLog, ...logs]
      }
    });

    setTTitle('');
    setTAssignee('');
    setTPriority('medium');
    setTDueDate('');
    setTDesc('');
    setIsAddTaskOpen(false);
  };

  const handleToggleTask = (taskId) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        const doneState = !t.done;
        return { ...t, done: doneState };
      }
      return t;
    });

    saveGC({
      ...GC,
      team: {
        ...GC.team,
        tasks: updatedTasks
      }
    });
  };

  const handleDeleteTask = (taskId) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    confirmAction(L('Delete this task?', 'هل تريد حذف هذه المهمة؟'), () => {
      const updated = tasks.filter(t => t.id !== taskId);
      const newLog = {
        action: L(`Deleted task: "${taskToDelete?.title}"`, `تم حذف مهمة: "${taskToDelete?.title}"`),
        date: new Date().toLocaleString(),
        user: getAuthorName()
      };
      saveGC({
        ...GC,
        team: {
          ...GC.team,
          tasks: updated,
          logs: [newLog, ...logs]
        }
      });
    });
  };

  const handleDeleteMember = (idx) => {
    const memberToDelete = members[idx];
    confirmAction(L(`Are you sure you want to remove ${memberToDelete.name} from the team?`, `هل أنت متأكد من إزالة ${memberToDelete.name} من الفريق؟`), () => {
      const updated = members.filter((_, i) => i !== idx);
      const newLog = {
        action: L(`Removed team member: ${memberToDelete.name}`, `تمت إزالة عضو فريق: ${memberToDelete.name}`),
        date: new Date().toLocaleString(),
        user: getAuthorName()
      };
      saveGC({
        ...GC,
        team: {
          ...GC.team,
          members: updated,
          logs: [newLog, ...logs]
        }
      });
      if (selectedPermMemberIndex >= updated.length) {
        setSelectedPermMemberIndex(Math.max(0, updated.length - 1));
      }
    });
  };

  const handleUpdatePermissions = async (memberIdx, newPerms) => {
    const member = members[memberIdx];
    const updatedMembers = [...members];
    updatedMembers[memberIdx] = {
      ...member,
      permissions: newPerms
    };

    // Push permission sync log
    const newLog = {
      action: L(`Updated permissions for ${member.name}`, `تحديث صلاحيات الموظف: ${member.name}`),
      date: new Date().toLocaleString(),
      user: getAuthorName()
    };

    saveGC({
      ...GC,
      team: {
        ...GC.team,
        members: updatedMembers,
        logs: [newLog, ...logs]
      }
    });

    // Write rules to database
    try {
      const allowedTools = newPerms.map(p => permToToolMap[p]).filter(Boolean);
      await setDoc(doc(db, 'users', member.uid), {
        allowedTools: allowedTools
      }, { merge: true });
      alert(L('Permissions updated successfully in database.', 'تم تحديث صلاحيات الموظف في قاعدة البيانات بنجاح.'));
    } catch (err) {
      console.error(err);
      alert(L('Error syncing permissions: ' + err.message, 'خطأ في مزامنة الصلاحيات: ' + err.message));
    }
  };

  // Helper status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
      case 'Online':
        return 'var(--green)';
      case 'Away':
        return 'var(--amber)';
      default:
        return 'var(--t3)';
    }
  };

  // Tasks Filter Logic
  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'pending') return !t.done;
    if (taskFilter === 'completed') return t.done;
    return true;
  });

  return (
    <div className="pg on" id="pg-team-hub">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">👥</span>
          {L('Team Collaboration Hub', 'مركز إدارة وتفاعل الفريق')}
        </div>
        <div className="pg-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {activeTab === 'members' && (
            <button className="btn btn-prime" onClick={() => setIsAddMemberOpen(true)}>
              ➕ {L('Invite Member', 'إضافة عضو جديد')}
            </button>
          )}
          {activeTab === 'tasks' && (
            <button className="btn btn-prime" onClick={() => setIsAddMemberOpen(false) || setIsAddTaskOpen(true)}>
              ➕ {L('Create Task', 'إنشاء مهمة فريق')}
            </button>
          )}
          {activeTab === 'chat' && (
            <>
              <button className="btn" style={{ background: 'var(--surface3)', border: '1px solid var(--edge2)' }} onClick={handleSummarizeChannel}>
                🧠 {L('AI Recap Channel', 'التلخيص الذكي للقناة')}
              </button>
              <button className="btn btn-prime" onClick={() => setIsGroupModalOpen(true)}>
                ➕ {L('Create Channel', 'إنشاء قناة')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs list */}
      <div className="tabs-bar" style={{ 
        marginBottom: '20px', 
        display: 'flex', 
        flexWrap: 'nowrap', 
        overflowX: 'auto',
        gap: '8px', 
        background: 'var(--surface2)', 
        padding: '6px', 
        borderRadius: '12px', 
        border: '1px solid var(--edge2)',
        paddingBottom: '8px'
      }}>
        {[
          { key: 'chat', label: L('Team Chat', 'دردشة الفريق'), icon: '💬' },
          { key: 'members', label: L('Members Directory', 'أعضاء الفريق'), icon: '👥' },
          { key: 'tasks', label: L('Team Tasks', 'مهام الفريق'), icon: '📋' },
          { key: 'permissions', label: L('Role Permissions', 'الصلاحيات'), icon: '🔑' },
          { key: 'payroll', label: L('Payroll & Costs', 'الرواتب والتكاليف'), icon: '📊' },
          { key: 'logs', label: L('Activity Logs', 'سجل النشاط'), icon: '📜' }
        ].map((tab) => (
          <button 
            key={tab.key}
            style={{
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeTab === tab.key ? 'var(--orange)' : 'transparent',
              color: activeTab === tab.key ? '#fff' : 'var(--t2)',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
            onClick={() => setActiveTab(tab.key)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div>

        {/* 1. CHAT TAB */}
        {activeTab === 'chat' && (
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px' }}>
            {/* Chat Sidebar: Channels & Members statuses */}
            <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--surface2)', border: '1px solid var(--edge2)' }}>
              
              <div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--orange)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                  📺 {L('Channels', 'القنوات')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {channels.map((chan) => (
                    <button
                      key={chan.id}
                      onClick={() => setActiveChannelId(chan.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: activeChannelId === chan.id ? 'var(--orange)' : 'var(--surface3)',
                        color: activeChannelId === chan.id ? '#fff' : 'var(--t2)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: lang === 'ar' ? 'right' : 'left',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        width: '100%',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span># {chan.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--edge2)', paddingTop: '12px', flex: 1, overflowY: 'auto', minHeight: '200px' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--t3)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  🟢 {L('Members Active', 'نشاط الفريق')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {members.map((m, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--t2)' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(m.status || 'Online'), flexShrink: 0 }}></span>
                      <span style={{ fontWeight: 500 }}>{m.name}</span>
                      <small style={{ color: 'var(--t3)', fontSize: '9.5px' }}>({m.role})</small>
                    </div>
                  ))}
                  {members.length === 0 && (
                    <div style={{ fontSize: '11px', color: 'var(--t3)', textAlign: 'center', padding: '10px' }}>
                      {L('Invite team members to see activity here.', 'ادعُ الموظفين لمشاهدة نشاطهم.')}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Chat Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '65vh', minHeight: '500px' }}>
              {aiSummary && (
                <div className="card" style={{ background: 'rgba(255, 107, 53, 0.04)', border: '1px dashed var(--orange)', padding: '14px', fontSize: '12px', color: 'var(--t1)', flexShrink: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', borderBottom: '1px dashed rgba(255,107,53,0.15)', paddingBottom: '4px' }}>
                    <strong>🧠 {L('AI Channel Summary & Action Items', 'التلخيص التلقائي للمحادثة والمهام الفورية')}</strong>
                    <button className="btn btn-ghost" style={{ fontSize: '10px', padding: '2px 6px' }} onClick={() => setAiSummary('')}>✕</button>
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: parseMarkdown(aiSummary) }} style={{ lineHeight: '1.4' }}></div>
                </div>
              )}

              <div className="card" style={{ padding: '0', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', border: '1px solid var(--edge2)', background: 'var(--surface2)' }}>
                
                {/* Header */}
                <div style={{ padding: '14px 18px', background: 'var(--surface3)', borderBottom: '1px solid var(--edge)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                  <div>
                    <strong style={{ fontSize: '14px', color: 'var(--t1)' }}># {activeChannel.name}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--t3)', marginInlineStart: '10px' }}>
                      {activeChannel.desc}
                    </span>
                  </div>
                </div>

                {/* Messages Board */}
                <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--surface1)' }}>
                  {channelMsgs.map((msg) => {
                    const isAi = msg.author.includes('AI') || msg.author.includes('Bot');
                    const isCurrentUser = msg.author === getAuthorName();
                    
                    return (
                      <div 
                        key={msg.id} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: isCurrentUser ? 'flex-start' : 'flex-end',
                          width: '100%'
                        }}
                      >
                        <div 
                          style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '4px', 
                            maxWidth: '75%',
                            alignItems: isCurrentUser ? 'flex-start' : 'flex-end'
                          }}
                        >
                          <div style={{ fontSize: '10.5px', color: 'var(--t3)', display: 'flex', gap: '4px', direction: 'ltr' }}>
                            <strong>{msg.author}</strong>
                            <span>·</span>
                            <span>{msg.date}</span>
                          </div>
                          <div
                            style={{
                              padding: '10px 14px',
                              borderRadius: isCurrentUser ? '0px 12px 12px 12px' : '12px 12px 0px 12px',
                              background: isCurrentUser ? 'var(--surface3)' : (isAi ? 'rgba(249, 115, 22, 0.08)' : 'linear-gradient(135deg, var(--orange) 0%, #f43f5e 100%)'),
                              border: isCurrentUser ? '1px solid var(--edge2)' : (isAi ? '1px solid var(--orange)' : 'none'),
                              color: (isCurrentUser || isAi) ? 'var(--t1)' : '#fff',
                              fontSize: '12.5px',
                              lineHeight: '1.5'
                            }}
                          >
                            <div dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {channelMsgs.length === 0 && (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)', fontSize: '12.5px', textAlign: 'center', padding: '40px' }}>
                      {L('Welcome to #' + activeChannel.name + '! Start conversation or type @ai for instant advisor assistant.', 'مرحباً بك في القناة! ابدأ الكتابة، أو اكتب @ai متبوعاً بسؤالك للرد بالذكاء الاصطناعي.')}
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Pinned Form */}
                <div style={{ padding: '12px 16px', background: 'var(--surface3)', borderTop: '1px solid var(--edge)', display: 'flex', gap: '10px', flexShrink: 0 }}>
                  <input
                    className="inp"
                    style={{ flex: 1 }}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                    placeholder={L('Type messages here... Use @ai to query copilot bot', 'اكتب رسالتك هنا... استخدم @ai للاستعانة بالذكاء الاصطناعي')}
                  />
                  <button 
                    className="btn btn-prime" 
                    style={{ padding: '8px 24px', background: 'linear-gradient(135deg, var(--orange) 0%, #f43f5e 100%)', border: 'none', borderRadius: '8px', fontWeight: 600 }} 
                    onClick={() => handleSendMessage()}
                  >
                    {L('Send', 'إرسال')}
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* 2. MEMBERS DIRECTORY TAB */}
        {activeTab === 'members' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--t1)', marginBottom: '4px' }}>
              👥 {L('Active Team Members', 'قائمة الموظفين وأعضاء الفريق')}
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', 
              gap: '16px' 
            }}>
              {members.map((m, idx) => {
                const initials = m.name ? m.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'M';
                return (
                  <div 
                    key={idx} 
                    className="card" 
                    style={{ 
                      padding: '16px', 
                      background: 'var(--surface2)', 
                      border: '1px solid var(--edge2)', 
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      position: 'relative'
                    }}
                  >
                    {/* Header: Avatar, Name, Role badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        background: 'var(--orange-d)', 
                        color: 'var(--orange)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 'bold',
                        fontSize: '14px',
                        position: 'relative',
                        flexShrink: 0
                      }}>
                        {initials}
                        <span style={{ 
                          width: '10px', 
                          height: '10px', 
                          borderRadius: '50%', 
                          background: getStatusColor(m.status || 'Offline'), 
                          position: 'absolute', 
                          bottom: '0', 
                          right: '0', 
                          border: '2px solid var(--surface2)' 
                        }}></span>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--t1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {m.name}
                        </div>
                        <span className="badge b-blue" style={{ fontSize: '10px', padding: '2px 6px', marginTop: '2px', display: 'inline-block' }}>
                          {m.role}
                        </span>
                      </div>
                    </div>

                    {/* Member details list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--t2)', borderTop: '1px solid var(--edge2)', paddingTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--t3)' }}>📧 {L('Email:', 'البريد:')}</span>
                        <span style={{ fontWeight: 500, fontFamily: 'monospace' }}>{m.email}</span>
                      </div>
                      {m.phone && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--t3)' }}>📞 {L('Phone:', 'الهاتف:')}</span>
                          <span style={{ fontWeight: 500 }}>{m.phone}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--t3)' }}>💼 {L('Department:', 'القسم:')}</span>
                        <span style={{ fontWeight: 500 }}>{m.dept || m.role}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--t3)' }}>🤝 {L('Contract:', 'التعاقد:')}</span>
                        <span style={{ fontWeight: 500 }}>{m.contract}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--t3)' }}>💵 {L('Salary:', 'الراتب:')}</span>
                        <span style={{ fontWeight: 'bold', color: 'var(--green)' }}>{formatMoney(m.salary)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--t3)' }}>📅 {L('Joined:', 'الانضمام:')}</span>
                        <span>{m.joinDate}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn" 
                        style={{ 
                          flex: 1,
                          justifyContent: 'center', 
                          padding: '6px', 
                          background: 'var(--surface3)', 
                          color: 'var(--t1)', 
                          border: '1px solid var(--edge2)',
                          fontSize: '12px'
                        }} 
                        onClick={() => handleOpenEditMember(idx)}
                      >
                        ✏️ {L('Edit Details', 'تعديل البيانات')}
                      </button>
                      <button 
                        className="btn" 
                        style={{ 
                          padding: '6px 10px', 
                          background: 'rgba(239, 68, 68, 0.12)', 
                          color: 'var(--red)', 
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          fontSize: '12px'
                        }} 
                        onClick={() => handleDeleteMember(idx)}
                      >
                        🗑️
                      </button>
                    </div>

                  </div>
                );
              })}
              {members.length === 0 && (
                <div className="card" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--t3)' }}>
                  {L('No team members added yet. Click "Invite Member" at top-right to register one.', 'لم يتم إضافة موظفين بعد. اضغط على "إضافة عضو جديد" بالأعلى لإنشاء حساب.')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. TEAM TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="card" style={{ background: 'var(--surface2)', border: '1px solid var(--edge2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--edge)', paddingBottom: '10px' }}>
              <div className="sec-title">📋 {L('Team Tasks Board', 'لوحة وجدول مهام الفريق')}</div>
              {/* Task filters */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {['all', 'pending', 'completed'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setTaskFilter(f)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      background: taskFilter === f ? 'var(--orange)' : 'var(--surface3)',
                      color: taskFilter === f ? '#fff' : 'var(--t2)',
                      border: '1px solid var(--edge2)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {f === 'all' ? L('All', 'الكل') : f === 'pending' ? L('Pending', 'قيد التنفيذ') : L('Completed', 'مكتملة')}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredTasks.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    background: t.done ? 'rgba(16, 185, 129, 0.04)' : 'var(--surface3)',
                    border: t.done ? '1px solid var(--green)' : '1px solid var(--edge2)',
                    borderRadius: '12px',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => handleToggleTask(t.id)}
                      style={{ 
                        width: '20px', 
                        height: '20px', 
                        cursor: 'pointer',
                        accentColor: 'var(--orange)'
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: t.done ? 'var(--t3)' : 'var(--t1)',
                        textDecoration: t.done ? 'line-through' : 'none',
                        lineHeight: '1.4'
                      }}>
                        {t.title}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                        <span className="badge b-blue" style={{ fontSize: '10px', padding: '2px 8px' }}>👤 {t.assignee}</span>
                        {t.priority === 'high' && <span className="badge b-red" style={{ fontSize: '10px', padding: '2px 8px' }}>High</span>}
                        {t.priority === 'medium' && <span className="badge b-ai" style={{ fontSize: '10px', padding: '2px 8px' }}>Medium</span>}
                        {t.priority === 'low' && <span className="badge" style={{ fontSize: '10px', padding: '2px 8px', background: 'var(--surface3)' }}>Low</span>}
                        <span style={{ fontSize: '11px', color: 'var(--t3)' }}>📅 {L('Due:', 'تاريخ الاستحقاق:')} {t.dueDate}</span>
                      </div>
                      {t.desc && (
                        <p style={{ margin: '6px 0 0', fontSize: '11.5px', color: 'var(--t3)', lineHeight: '1.4' }}>
                          {t.desc}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    className="btn"
                    style={{ 
                      padding: '6px 12px', 
                      background: 'rgba(239, 68, 68, 0.12)', 
                      color: 'var(--red)', 
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      fontSize: '12px'
                    }}
                    onClick={() => handleDeleteTask(t.id)}
                  >
                    🗑️ {L('Delete', 'حذف')}
                  </button>
                </div>
              ))}

              {filteredTasks.length === 0 && (
                <div className="empty-state" style={{ padding: '40px' }}>
                  <div className="es-icon">📋</div>
                  <div className="es-title">{L('No tasks found', 'لا توجد مهام')}</div>
                  <div className="es-sub">{L('You have no tasks matching this filter.', 'لا توجد مهام مطابقة لفلتر البحث الحالي.')}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. ROLE PERMISSIONS TAB */}
        {activeTab === 'permissions' && (
          <div className="card" style={{ background: 'var(--surface2)', border: '1px solid var(--edge2)' }}>
            <div className="sec-hd">
              <div className="sec-title">🔑 {L('Feature & Module Permissions', 'توزيع وتعيين صلاحيات الموظفين')}</div>
            </div>
            
            {members.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px' }}>
                <div className="es-icon">🔑</div>
                <div className="es-title">{L('No team members registered', 'لا يوجد موظفون مسجلون')}</div>
                <div className="es-sub">{L('Register a team member first to configure their portal access dashboard permissions.', 'قم بإضافة عضو فريق أولاً لتتمكن من إسناد صلاحيات فتح الأقسام له.')}</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px' }}>
                {/* Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {members.map((m, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPermMemberIndex(idx)}
                      style={{
                        padding: '12px 14px',
                        background: selectedPermMemberIndex === idx ? 'var(--orange)' : 'var(--surface3)',
                        color: selectedPermMemberIndex === idx ? '#fff' : 'var(--t2)',
                        border: selectedPermMemberIndex === idx ? 'none' : '1px solid var(--edge2)',
                        borderRadius: '8px',
                        textAlign: lang === 'ar' ? 'right' : 'left',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                      }}
                    >
                      {m.name} ({m.role})
                    </button>
                  ))}
                </div>

                {/* Checklist editor */}
                {(() => {
                  const m = members[selectedPermMemberIndex];
                  if (!m) return null;
                  
                  return (
                    <div className="card" style={{ background: 'var(--surface3)', padding: '20px', border: '1px solid var(--edge2)', borderRadius: '12px' }}>
                      <div style={{ fontSize: '14.5px', fontWeight: 'bold', color: 'var(--t1)', marginBottom: '14px' }}>
                        🛡️ {L('Allowed Modules for ' + m.name, 'الأقسام المتاحة للموظف: ' + m.name)}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                        {Object.keys(permToToolMap).map((permId) => {
                          const isAllowed = (m.permissions || []).includes(permId);
                          return (
                            <div
                              key={permId}
                              onClick={() => {
                                const list = m.permissions || [];
                                const nextPerms = list.includes(permId)
                                  ? list.filter(p => p !== permId)
                                  : [...list, permId];
                                
                                const updated = [...members];
                                updated[selectedPermMemberIndex] = {
                                  ...m,
                                  permissions: nextPerms
                                };
                                
                                saveGC({
                                  ...GC,
                                  team: {
                                    ...GC.team,
                                    members: updated
                                  }
                                });
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 14px',
                                background: isAllowed ? 'rgba(249, 115, 22, 0.08)' : 'var(--surface2)',
                                border: isAllowed ? '1px solid var(--orange)' : '1px solid var(--edge2)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                width: '100%',
                                boxSizing: 'border-box'
                              }}
                            >
                              <span style={{ 
                                width: '18px', 
                                height: '18px', 
                                borderRadius: '4px', 
                                border: isAllowed ? '2px solid var(--orange)' : '2px solid var(--t3)', 
                                background: isAllowed ? 'var(--orange)' : 'none', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                color: '#fff', 
                                fontSize: '11px', 
                                fontWeight: 'bold',
                                flexShrink: 0
                              }}>
                                {isAllowed && '✓'}
                              </span>
                              <span style={{ fontSize: '12.5px', color: isAllowed ? 'var(--t1)' : 'var(--t2)', fontWeight: isAllowed ? 600 : 500 }}>
                                {permId.toUpperCase()} - {
                                  permId === 'dashboard' ? L('Main Home', 'الرئيسية') :
                                  permId === 'crm' ? L('CRM & Leads', 'إدارة العملاء والصفقات') :
                                  permId === 'telegram' ? L('Telegram Hub', 'مركز التليجرام') :
                                  permId === 'marketing' ? L('Marketing OS', 'مركز التسويق') :
                                  permId === 'content' ? L('Content Ideas', 'صناعة المحتوى') :
                                  permId === 'finance' ? L('Accounting Ledger', 'المحاسبة والمالية') :
                                  permId === 'tasks' ? L('Task Boards', 'لوحات المهام') :
                                  permId === 'calendar' ? L('Calendar Hub', 'التقويم') :
                                  permId === 'support' ? L('Technical Support', 'الدعم الفني') :
                                  L(permId, permId)
                                }
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        className="btn btn-prime"
                        style={{ padding: '10px 24px', fontSize: '13px', fontWeight: 600, background: 'linear-gradient(135deg, var(--orange) 0%, #f43f5e 100%)', border: 'none', borderRadius: '8px' }}
                        onClick={() => handleUpdatePermissions(selectedPermMemberIndex, m.permissions || [])}
                      >
                        💾 {L('Save & Sync Database', 'حفظ ومزامنة الصلاحيات')}
                      </button>
                    </div>
                  );
                })()}

              </div>
            )}
          </div>
        )}

        {/* 5. PAYROLL & STATS TAB */}
        {activeTab === 'payroll' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Visual Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { label: L('Active Staff', 'عدد الموظفين'), value: members.length, color: 'var(--orange)' },
                { label: L('Monthly Payroll', 'إجمالي الرواتب الشهرية'), value: formatMoney(monthlyPayroll), color: 'var(--green)' },
                { label: L('Annual Estimate', 'تقدير الرواتب السنوي'), value: formatMoney(annualPayroll), color: 'var(--t1)' },
                { label: L('Payroll/Revenue Ratio', 'نسبة الرواتب للمبيعات'), value: payrollRatio, color: 'var(--blue)' }
              ].map((stat, idx) => (
                <div 
                  key={idx}
                  style={{ 
                    background: 'var(--surface3)', 
                    border: '1px solid var(--edge2)', 
                    padding: '16px 20px', 
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ fontSize: '12px', color: 'var(--t3)', fontWeight: 600 }}>{stat.label}</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Department Breakdown card */}
            <div className="card" style={{ background: 'var(--surface2)', border: '1px solid var(--edge2)', borderRadius: '12px', padding: '20px' }}>
              <div className="sec-hd" style={{ marginBottom: '14px' }}>
                <div className="sec-title">📊 {L('Department payroll breakdown', 'تحليل تكلفة الرواتب حسب الأقسام')}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {members.map((m, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--surface3)', border: '1px solid var(--edge2)', borderRadius: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '13.5px', color: 'var(--t1)' }}>{m.name}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--t3)', marginInlineStart: '8px' }}>{m.role} ({m.contract})</span>
                    </div>
                    <span style={{ fontWeight: 'bold', color: 'var(--green)', fontSize: '13px' }}>{formatMoney(m.salary)} / mo</span>
                  </div>
                ))}
                {members.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--t3)' }}>
                    {L('No payroll data to visualize.', 'لا تتوفر تكاليف رواتب حالياً.')}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* 6. ACTIVITY LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="card" style={{ background: 'var(--surface2)', border: '1px solid var(--edge2)', borderRadius: '12px', padding: '20px' }}>
            <div className="sec-hd" style={{ marginBottom: '14px' }}>
              <div className="sec-title">📜 {L('Workspace Logs & History', 'سجل عمليات الفريق وسير العمل')}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '50vh', overflowY: 'auto' }}>
              {logs.map((log, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--surface3)', borderRadius: '8px', border: '1px solid var(--edge2)', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', color: 'var(--t1)', fontWeight: 500 }}>{log.action}</div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--t3)' }}>
                    <span>👤 {log.user}</span>
                    <span>·</span>
                    <span>{log.date}</span>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--t3)' }}>
                  {L('No logged actions yet.', 'سجل العمليات فارغ تماماً.')}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ================= MODALS & FORMS ================= */}

      {/* ADD MEMBER MODAL */}
      {isAddMemberOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setIsAddMemberOpen(false); }}>
          <div className="modal-box" style={{ maxWidth: '580px', padding: '24px', boxSizing: 'border-box' }}>
            <div className="modal-close" onClick={() => setIsAddMemberOpen(false)}>✕</div>
            <div>
              <div style={{ fontFamily: 'var(--ff)', fontSize: '17px', fontWeight: 800, marginBottom: '16px', color: 'var(--t1)' }}>
                👤 {L('Register New Team Member', 'إضافة وتسجيل موظف جديد للفريق')}
              </div>
              
              <form onSubmit={handleSaveMember}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Full Name *', 'الاسم الكامل *')}</label>
                    <input className="inp" required placeholder="e.g. Ali Ahmed" value={mName} onChange={(e) => setMName(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Email Address *', 'البريد الإلكتروني *')}</label>
                    <input className="inp" required type="email" placeholder="ali@upklick.com" value={mEmail} onChange={(e) => setMEmail(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Mobile Number', 'رقم الهاتف')}</label>
                    <input className="inp" placeholder="+20 1xxxxxxxxx" value={mPhone} onChange={(e) => setMPhone(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Primary Password *', 'كلمة المرور الافتراضية *')}</label>
                    <input className="inp" required placeholder="Generate password or write one" value={mPassword} onChange={(e) => setMPassword(e.target.value)} />
                    <button type="button" style={{ fontSize: '10px', background: 'none', border: 'none', color: 'var(--orange)', cursor: 'pointer', padding: '2px 0' }} onClick={() => setMPassword(generatePassword())}>
                      ⚡ {L('Generate Password', 'توليد تلقائي')}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Job Title / Role', 'الدور / المسمى الوظيفي')}</label>
                    <CustomSelect className="inp" value={mRole} onChange={(e) => setMRole(e.target.value)}>
                      <option value="Sales">Sales Agent</option>
                      <option value="Marketing">Marketing Lead</option>
                      <option value="Content">Content Writer</option>
                      <option value="Support">Support Desk</option>
                      <option value="Finance">Accountant</option>
                      <option value="Developer">Developer</option>
                    </CustomSelect>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Monthly Salary ($)', 'الراتب الشهري ($)')}</label>
                    <input className="inp" type="number" value={mSalary} onChange={(e) => setMSalary(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Contract', 'نوع العقد')}</label>
                    <CustomSelect className="inp" value={mContract} onChange={(e) => setMContract(e.target.value)}>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contractor">Freelance/Contractor</option>
                    </CustomSelect>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--edge2)', paddingTop: '10px', marginTop: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--t2)', marginBottom: '8px' }}>
                    🔑 {L('Assign Initial Access Permissions', 'تحديد الأقسام والصلاحيات الأولية للموظف')}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    {Object.keys(permToToolMap).map((permId) => {
                      const isAllowed = mPermissions.includes(permId);
                      return (
                        <label key={permId} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer', color: isAllowed ? 'var(--t1)' : 'var(--t3)' }}>
                          <input type="checkbox" checked={isAllowed} onChange={() => handleToggleFormPerm(permId)} />
                          <span>{permId.toUpperCase()}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsAddMemberOpen(false)}>
                    {L('Cancel', 'إلغاء')}
                  </button>
                  <button type="submit" disabled={isCreating} className="btn btn-prime" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, var(--orange) 0%, #f43f5e 100%)', border: 'none', borderRadius: '8px', padding: '10px' }}>
                    {isCreating ? '...' : `➕ ${L('Register & Create Account', 'تسجيل وحفظ الموظف')}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MEMBER MODAL */}
      {isEditMemberOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setIsEditMemberOpen(false); }}>
          <div className="modal-box" style={{ maxWidth: '580px', padding: '24px', boxSizing: 'border-box' }}>
            <div className="modal-close" onClick={() => setIsEditMemberOpen(false)}>✕</div>
            <div>
              <div style={{ fontFamily: 'var(--ff)', fontSize: '17px', fontWeight: 800, marginBottom: '16px', color: 'var(--t1)' }}>
                ✏️ {L('Edit Team Member Details', 'تعديل بيانات عضو الفريق')}
              </div>
              
              <form onSubmit={handleSaveEditMember}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Full Name *', 'الاسم الكامل *')}</label>
                    <input className="inp" required placeholder="e.g. Ali Ahmed" value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Mobile Number', 'رقم الهاتف')}</label>
                    <input className="inp" placeholder="+20 1xxxxxxxxx" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Job Title / Role', 'الدور / المسمى الوظيفي')}</label>
                    <CustomSelect className="inp" value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                      <option value="Sales">Sales Agent</option>
                      <option value="Marketing">Marketing Lead</option>
                      <option value="Content">Content Writer</option>
                      <option value="Support">Support Desk</option>
                      <option value="Finance">Accountant</option>
                      <option value="Developer">Developer</option>
                    </CustomSelect>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Monthly Salary ($)', 'الراتب الشهري ($)')}</label>
                    <input className="inp" type="number" value={editSalary} onChange={(e) => setEditSalary(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Contract', 'نوع العقد')}</label>
                    <CustomSelect className="inp" value={editContract} onChange={(e) => setEditContract(e.target.value)}>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contractor">Freelance/Contractor</option>
                    </CustomSelect>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Department', 'الجمع / القسم')}</label>
                    <input className="inp" placeholder="e.g. Sales" value={editDept} onChange={(e) => setEditDept(e.target.value)} />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--edge2)', paddingTop: '10px', marginTop: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--t2)', marginBottom: '8px' }}>
                    🔑 {L('Assign Access Permissions', 'تحديد الأقسام والصلاحيات المتاحة للموظف')}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    {Object.keys(permToToolMap).map((permId) => {
                      const isAllowed = editPermissions.includes(permId);
                      return (
                        <label key={permId} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer', color: isAllowed ? 'var(--t1)' : 'var(--t3)' }}>
                          <input type="checkbox" checked={isAllowed} onChange={() => handleToggleEditFormPerm(permId)} />
                          <span>{permId.toUpperCase()}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsEditMemberOpen(false)}>
                    {L('Cancel', 'إلغاء')}
                  </button>
                  <button type="submit" disabled={isCreating} className="btn btn-prime" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, var(--orange) 0%, #f43f5e 100%)', border: 'none', borderRadius: '8px', padding: '10px' }}>
                    {isCreating ? '...' : `💾 ${L('Save Changes', 'حفظ التعديلات')}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CREDENTIALS SUCCESS MODAL */}
      {isCredsModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setIsCredsModalOpen(false); }}>
          <div className="modal-box" style={{ maxWidth: '440px', padding: '24px', boxSizing: 'border-box' }}>
            <div className="modal-close" onClick={() => setIsCredsModalOpen(false)}>✕</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <div style={{ fontFamily: 'var(--ff)', fontSize: '18px', fontWeight: 800, color: 'var(--t1)', marginBottom: '8px' }}>
                {L('Team Member Account Created!', 'تم إنشاء حساب عضو الفريق!')}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--t2)', marginBottom: '20px' }}>
                {L('Share these credentials with your team member so they can log in:', 'شارك هذه البيانات مع عضو فريقك ليتمكن من تسجيل الدخول:')}
              </div>
              
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '12px', padding: '16px', textAlign: 'left', marginBottom: '16px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--t3)', display: 'block' }}>{L('Name', 'الاسم')}</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--t1)' }}>{credsInfo.name}</span>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--t3)', display: 'block' }}>{L('Email', 'البريد الإلكتروني')}</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--orange)', fontFamily: 'monospace' }}>{credsInfo.email}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--t3)', display: 'block' }}>{L('Password', 'كلمة المرور')}</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--orange)', fontFamily: 'monospace' }}>{credsInfo.password}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsCredsModalOpen(false)}>
                  {L('Close', 'إغلاق')}
                </button>
                <button className="btn btn-prime" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, var(--orange) 0%, #f43f5e 100%)', border: 'none', borderRadius: '8px' }} onClick={() => {
                  navigator.clipboard.writeText(`Email: ${credsInfo.email}\nPassword: ${credsInfo.password}`);
                  alert(L('Credentials copied to clipboard!', 'تم نسخ بيانات الدخول إلى الحافظة!'));
                }}>
                  📋 {L('Copy Credentials', 'نسخ البيانات')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD TASK MODAL */}
      {isAddTaskOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setIsAddTaskOpen(false); }}>
          <div className="modal-box" style={{ maxWidth: '480px', padding: '24px', boxSizing: 'border-box' }}>
            <div className="modal-close" onClick={() => setIsAddTaskOpen(false)}>✕</div>
            <div>
              <div style={{ fontFamily: 'var(--ff)', fontSize: '17px', fontWeight: 800, marginBottom: '16px', color: 'var(--t1)' }}>
                + {L('New Team Task', 'مهمة فريق جديدة')}
              </div>
              <form onSubmit={handleSaveTask}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Task Title *', 'عنوان المهمة *')}</label>
                    <input className="inp" placeholder="e.g. Write 10 TikTok scripts" value={tTitle} onChange={(e) => setTTitle(e.target.value)} required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Assign To', 'تعيين إلى')}</label>
                      <select className="inp" value={tAssignee} onChange={(e) => setTAssignee(e.target.value)}>
                        <option value="">{L('Unassigned', 'غير معين')}</option>
                        {members.map((m, i) => (
                          <option key={i} value={m.name}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Priority', 'الأولوية')}</label>
                      <select className="inp" value={tPriority} onChange={(e) => setTPriority(e.target.value)}>
                        <option value="high">🔴 High</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="low">🟢 Low</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Due Date', 'تاريخ الاستحقاق')}</label>
                    <input className="inp" type="text" placeholder="dd/mm/yyyy" value={tDueDate} onChange={(e) => setTDueDate(e.target.value)} onFocus={(e) => e.target.type = 'date'} onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Description', 'الوصف')}</label>
                    <textarea className="inp" rows="2" placeholder="Details..." value={tDesc} onChange={(e) => setTDesc(e.target.value)}></textarea>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsAddTaskOpen(false)}>
                    {L('Cancel', 'إلغاء')}
                  </button>
                  <button type="submit" className="btn btn-prime" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, var(--orange) 0%, #f43f5e 100%)', border: 'none', borderRadius: '8px' }}>
                    + {L('Add Task', 'إضافة مهمة')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CREATE CHANNEL MODAL */}
      {isGroupModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setIsGroupModalOpen(false); }}>
          <div className="modal-box" style={{ maxWidth: '440px', padding: '24px', boxSizing: 'border-box' }}>
            <div className="modal-close" onClick={() => setIsGroupModalOpen(false)}>✕</div>
            <div>
              <div style={{ fontFamily: 'var(--ff)', fontSize: '16px', fontWeight: 800, marginBottom: '14px', color: 'var(--t1)' }}>
                ➕ {L('Create New Chat Channel', 'إنشاء قناة دردشة جديدة')}
              </div>
              <form onSubmit={handleCreateChannel}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Channel Name *', 'اسم القناة *')}</label>
                    <input className="inp" required placeholder="e.g. design-updates" value={newChanName} onChange={(e) => setNewChanName(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Channel Purpose', 'الغرض / الوصف')}</label>
                    <input className="inp" placeholder="e.g. Sharing design drafts" value={newChanDesc} onChange={(e) => setNewChanDesc(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Channel Privacy', 'الخصوصية')}</label>
                    <select className="inp" value={newChanType} onChange={(e) => setNewChanType(e.target.value)}>
                      <option value="public">🔓 Public Channel</option>
                      <option value="private">🔒 Private Channel</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsGroupModalOpen(false)}>
                    {L('Cancel', 'إلغاء')}
                  </button>
                  <button type="submit" className="btn btn-prime" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, var(--orange) 0%, #f43f5e 100%)', border: 'none', borderRadius: '8px' }}>
                    {L('Create Channel', 'إنشاء القناة')}
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
