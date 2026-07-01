'use client';

import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { useAuth } from '../../context/AuthContext';
import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut as fbSignOut } from 'firebase/auth';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { db, firebaseConfig } from '../../lib/firebase';

export default function TeamManagementView() {
  const { t, L, setAiPanelOpen, GC, saveGC, formatMoney, confirmAction } = useBusiness();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('members');
  
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

  // Task Form State
  const [tTitle, setTTitle] = useState('');
  const [tAssignee, setTAssignee] = useState('');
  const [tPriority, setTPriority] = useState('medium');
  const [tDueDate, setTDueDate] = useState('');
  const [tDesc, setTDesc] = useState('');

  // Bind properties to GC
  const members = GC.team?.members || [];
  const tasks = GC.team?.tasks || [];
  const logs = GC.team?.logs || [];

  // Helper values
  const monthlyPayroll = members.reduce((sum, m) => sum + (parseFloat(m.salary) || 0), 0);
  const annualPayroll = monthlyPayroll * 12;
  const tasksDoneCount = tasks.filter(t => t.done).length;
  
  // Calculate revenue from GC.finance.entries
  const totalRevenue = GC.finance?.entries?.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0) || 0;
  const payrollRatio = totalRevenue > 0 ? ((monthlyPayroll / totalRevenue) * 100).toFixed(1) + '%' : '0%';

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
    teamchat: 'teamchat',
    calendar: 'calendar'
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

  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!mName.trim()) {
      alert(L('Please enter Full Name', 'الرجاء إدخال الاسم الكامل'));
      return;
    }

    const memberEmail = mEmail || `${mName.toLowerCase().replace(/\s/g, '')}@team.upklick.com`;
    const memberPassword = mPassword || generatePassword();

    // If email is provided, try to create a Firebase Auth account
    let memberUid = null;
    if (mEmail.trim()) {
      if (!mPassword && !memberPassword) {
        alert(L('Please enter a password for the team member login', 'الرجاء إدخال كلمة مرور لتسجيل دخول عضو الفريق'));
        return;
      }
      
      setIsCreating(true);
      try {
        // Use secondary app to avoid logging out the current user
        const existingApp = getApps().find(a => a.name === 'TeamMemberCreator');
        if (existingApp) await deleteApp(existingApp);
        
        const secondaryApp = initializeApp(firebaseConfig, 'TeamMemberCreator');
        const secondaryAuth = getAuth(secondaryApp);
        
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, mEmail, memberPassword);
        memberUid = userCredential.user.uid;

        // Build allowedTools from permissions
        const allowedTools = mPermissions.map(p => permToToolMap[p] || p).filter(Boolean);
        // Always include home, profile, teamchat
        if (!allowedTools.includes('home')) allowedTools.push('home');
        if (!allowedTools.includes('teamchat')) allowedTools.push('teamchat');

        // Use secondary app's Firestore (authenticated as the new user) to write their document
        // This avoids permission errors since Firestore rules require auth.uid == document ID
        const secondaryDb = getFirestore(secondaryApp);
        await setDoc(doc(secondaryDb, 'users', memberUid), {
          uid: memberUid,
          name: mName,
          email: mEmail,
          phone: mPhone,
          role: 'team_member',
          teamRole: mRole,
          department: mDept || 'Staff',
          adminId: currentUser.uid,
          ownerUid: currentUser.uid,
          allowedTools: allowedTools,
          createdAt: new Date()
        });

        await fbSignOut(secondaryAuth);
        await deleteApp(secondaryApp);

        // Show credentials modal
        setCredsInfo({ email: mEmail, password: memberPassword, name: mName });
        
      } catch (err) {
        setIsCreating(false);
        console.error('Error creating team member account:', err);
        if (err.code === 'auth/email-already-in-use') {
          alert(L('This email is already registered. Please use a different email.', 'هذا البريد مسجل بالفعل. يرجى استخدام بريد آخر.'));
        } else {
          alert(L(`Error creating account: ${err.message}`, `خطأ في إنشاء الحساب: ${err.message}`));
        }
        return;
      }
      setIsCreating(false);
    }

    const newMember = {
      name: mName,
      email: memberEmail,
      phone: mPhone,
      role: mRole,
      department: mDept || 'Staff',
      salary: parseFloat(mSalary) || 0,
      contractType: mContract,
      joinDate: mJoinDate || new Date().toLocaleDateString('en-GB'),
      permissions: mPermissions,
      status: 'active',
      uid: memberUid || null
    };
    
    const updatedMembers = [...members, newMember];
    const newLog = {
      id: Date.now(),
      action: L(`Added team member ${mName} (${mRole})${memberUid ? ' — Account Created ✓' : ''}`, `تم إضافة عضو الفريق ${mName} (${mRole})${memberUid ? ' — تم إنشاء الحساب ✓' : ''}`),
      date: new Date().toLocaleString()
    };
    
    saveGC({
      ...GC,
      team: {
        ...GC.team,
        members: updatedMembers,
        logs: [newLog, ...logs]
      }
    });

    // Reset Form
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
    setIsAddMemberOpen(false);

    if (memberUid) {
      setIsCredsModalOpen(true);
    } else {
      alert(L('Member added successfully! 🚀', 'تم إضافة عضو الفريق بنجاح! 🚀'));
    }
  };

  const handleDeleteMember = (memberIndex) => {
    confirmAction(L('Are you sure you want to remove this member?', 'هل أنت متأكد من إزالة هذا العضو؟'), () => {
      const removed = members[memberIndex];
      const updatedMembers = members.filter((_, i) => i !== memberIndex);
      const newLog = {
        id: Date.now(),
        action: L(`Removed team member ${removed.name}`, `تم إزالة عضو الفريق ${removed.name}`),
        date: new Date().toLocaleString()
      };
      saveGC({
        ...GC,
        team: {
          ...GC.team,
          members: updatedMembers,
          logs: [newLog, ...logs]
        }
      });
      // Adjust selected index if out of bounds
      if (selectedPermMemberIndex >= updatedMembers.length) {
        setSelectedPermMemberIndex(Math.max(0, updatedMembers.length - 1));
      }
    });
  };

  const handleToggleMemberPermission = async (memberIndex, permId) => {
    const updatedMembers = [...members];
    const m = { ...updatedMembers[memberIndex] };
    const perms = m.permissions || [];
    if (perms.includes(permId)) {
      m.permissions = perms.filter(p => p !== permId);
    } else {
      m.permissions = [...perms, permId];
    }
    updatedMembers[memberIndex] = m;
    
    saveGC({
      ...GC,
      team: {
        ...GC.team,
        members: updatedMembers
      }
    });

    // Note: Permission changes are saved in GC.team.members (shared workspace).
    // The member's Firestore allowedTools was set at account creation.
    // To update their Firebase allowedTools, use the Admin panel or recreate the member.
  };

  const handleSaveTask = (e) => {
    e.preventDefault();
    if (!tTitle.trim()) {
      alert(L('Please enter Task Title', 'الرجاء إدخال عنوان المهمة'));
      return;
    }
    const newTask = {
      id: Date.now(),
      title: tTitle,
      assignee: tAssignee,
      priority: tPriority,
      dueDate: tDueDate || new Date().toLocaleDateString('en-GB'),
      desc: tDesc,
      done: false
    };

    const updatedTasks = [newTask, ...tasks];
    const newLog = {
      id: Date.now(),
      action: L(`Created team task: "${tTitle}" assigned to ${tAssignee || 'Unassigned'}`, `تم إنشاء مهمة فريق: "${tTitle}" وتعيينها لـ ${tAssignee || 'غير معين'}`),
      date: new Date().toLocaleString()
    };

    saveGC({
      ...GC,
      team: {
        ...GC.team,
        tasks: updatedTasks,
        logs: [newLog, ...logs]
      }
    });

    setTTitle('');
    setTAssignee('');
    setTPriority('medium');
    setTDueDate('');
    setTDesc('');
    setIsAddTaskOpen(false);
    alert(L('Task created successfully! 🚀', 'تم إنشاء المهمة بنجاح! 🚀'));
  };

  const handleToggleTaskDone = (taskId) => {
    const updatedTasks = tasks.map(tk => {
      if (tk.id === taskId) {
        const nextDone = !tk.done;
        return { ...tk, done: nextDone };
      }
      return tk;
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
    confirmAction(L('Are you sure you want to delete this task?', 'هل أنت متأكد من حذف هذه المهمة؟'), () => {
      const updatedTasks = tasks.filter(tk => tk.id !== taskId);
      saveGC({
        ...GC,
        team: {
          ...GC.team,
          tasks: updatedTasks
        }
      });
    });
  };

  const handleClearLogs = () => {
    confirmAction(L('Are you sure you want to clear the activity log?', 'هل أنت متأكد من مسح سجل النشاط؟'), () => {
      saveGC({
        ...GC,
        team: {
          ...GC.team,
          logs: []
        }
      });
    });
  };

  const handlePayAll = () => {
    if (monthlyPayroll <= 0) {
      alert(L('No salaries to pay.', 'لا توجد رواتب لدفعها.'));
      return;
    }
    confirmAction(L(`Pay total monthly payroll of $${monthlyPayroll.toLocaleString()}? This will create expense entries in Finance dashboard.`, `هل تريد دفع إجمالي رواتب بقيمة $${monthlyPayroll.toLocaleString()}؟ سيؤدي ذلك لإنشاء قيود مصاريف في المالية.`), () => {
      // Create finance expense entries
      const newEntries = members.filter(m => (parseFloat(m.salary) || 0) > 0).map(m => ({
        id: Date.now() + Math.random(),
        type: 'expense',
        amount: parseFloat(m.salary) || 0,
        desc: L(`Payroll: ${m.name} (${m.role})`, `رواتب: ${m.name} (${m.role})`),
        category: 'Payroll',
        date: new Date().toLocaleDateString('en-US')
      }));

      const updatedEntries = [...newEntries, ...(GC.finance?.entries || [])];
      const newLog = {
        id: Date.now(),
        action: L(`Paid monthly payroll to team: $${monthlyPayroll.toLocaleString()}`, `تم دفع الرواتب الشهرية للفريق بقيمة: $${monthlyPayroll.toLocaleString()}`),
        date: new Date().toLocaleString()
      };

      saveGC({
        ...GC,
        finance: {
          ...GC.finance,
          entries: updatedEntries
        },
        team: {
          ...GC.team,
          logs: [newLog, ...logs]
        }
      });

      alert(L('Payroll paid successfully! 💸', 'تم دفع الرواتب بنجاح! 💸'));
    });
  };

  const copyCredsToClipboard = () => {
    const text = `${L('Team Member Login Credentials', 'بيانات تسجيل دخول عضو الفريق')}\n${L('Name', 'الاسم')}: ${credsInfo.name}\n${L('Email', 'البريد')}: ${credsInfo.email}\n${L('Password', 'كلمة المرور')}: ${credsInfo.password}`;
    navigator.clipboard.writeText(text).then(() => {
      alert(L('Credentials copied to clipboard! 📋', 'تم نسخ البيانات! 📋'));
    });
  };

  // Tabs configuration
  const tabs = [
    { id: 'members', label: L('👥 Members', '👥 الأعضاء') },
    { id: 'payroll', label: L('💰 Payroll', '💰 الرواتب') },
    { id: 'perms', label: L('🔐 Permissions', '🔐 الصلاحيات') },
    { id: 'tasks', label: L('✅ Tasks', '✅ المهام') },
    { id: 'log', label: L('📋 Activity Log', '📋 سجل النشاط') },
  ];

  return (
    <div className="pg on" id="pg-team">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">👥</span>
          {L('Team Management', 'إدارة الفريق')}
        </div>
        <div className="pg-actions">
          <button 
            className="btn-ai" 
            onClick={() => setAiPanelOpen(true)}
          >
            ✦ {L('AI Analysis', 'تحليل الذكاء')}
          </button>
          <button 
            className="btn btn-prime" 
            onClick={() => setIsAddMemberOpen(true)}
          >
            + {L('Add Member', 'إضافة عضو')}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="g4 stagger mb">
        <div className="stat-card">
          <div className="stat-lbl">👥 {L('Team Members', 'أعضاء الفريق')}</div>
          <div className="stat-val">{members.length}</div>
          <div className="stat-ch ch-nu">{members.filter(m => m.uid).length} {L('linked', 'مربوط')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">💰 {L('Monthly Payroll', 'الرواتب الشهرية')}</div>
          <div className="stat-val">${monthlyPayroll.toLocaleString()}</div>
          <div className="stat-ch ch-nu">{L('total salaries', 'إجمالي الرواتب')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">✅ {L('Tasks Done', 'المهام المنجزة')}</div>
          <div className="stat-val ch-up">{tasksDoneCount}</div>
          <div className="stat-ch ch-nu">{L('all tasks', 'كل المهام')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">📊 {L('Payroll / Revenue', 'الرواتب / الدخل')}</div>
          <div className="stat-val">{payrollRatio}</div>
          <div className="stat-ch ch-nu">{L('of revenue', 'من الدخل')}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-bar">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'on' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: MEMBERS */}
      {activeTab === 'members' && (
        <div className="tab-panel on">
          {members.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}>
              <div className="es-icon">👥</div>
              <div className="es-title">{L('No team members yet', 'لا يوجد أعضاء في الفريق بعد')}</div>
              <div className="es-sub">
                {L('Add your first team member to get started. Members with email & password can log in to view their tasks and chat.', 'أضف أول عضو في فريقك للبدء. الأعضاء بالبريد الإلكتروني وكلمة المرور يمكنهم تسجيل الدخول لعرض مهامهم والدردشة.')}
              </div>
              <button className="btn btn-prime" onClick={() => setIsAddMemberOpen(true)}>
                + {L('Add First Member', 'إضافة أول عضو')}
              </button>
            </div>
          ) : (
            <div className="card" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--edge)' }}>
                    <th style={{ padding: '12px' }}>{L('Name', 'الاسم')}</th>
                    <th style={{ padding: '12px' }}>{L('Role', 'الدور')}</th>
                    <th style={{ padding: '12px' }}>{L('Department', 'القسم')}</th>
                    <th style={{ padding: '12px' }}>{L('Salary', 'الراتب')}</th>
                    <th style={{ padding: '12px' }}>{L('Status', 'الحالة')}</th>
                    <th style={{ padding: '12px' }}>{L('Join Date', 'تاريخ الانضمام')}</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>{L('Actions', 'الإجراءات')}</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid var(--edge)' }}>
                      <td style={{ padding: '12px', fontWeight: 600, color: 'var(--t1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: m.uid ? 'linear-gradient(135deg, var(--orange-d), var(--purple-d, rgba(108,53,255,0.14)))' : 'var(--orange-d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'var(--orange)' }}>
                            {m.name[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div>{m.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--t2)', fontWeight: 400 }}>{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--t2)' }}>{m.role}</td>
                      <td style={{ padding: '12px', color: 'var(--t2)' }}>{m.department}</td>
                      <td style={{ padding: '12px', fontWeight: 700 }}>${parseFloat(m.salary).toLocaleString()}</td>
                      <td style={{ padding: '12px' }}>
                        {m.uid ? (
                          <span className="badge b-green" style={{ fontSize: '10px', padding: '3px 8px' }}>
                            ✓ {L('Linked', 'مربوط')}
                          </span>
                        ) : (
                          <span className="badge" style={{ background: 'var(--surface3)', color: 'var(--t3)', fontSize: '10px', padding: '3px 8px' }}>
                            {L('Local Only', 'محلي فقط')}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--t3)' }}>{m.joinDate}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button 
                          className="btn btn-ghost" 
                          style={{ padding: '3px 8px', fontSize: '11px', color: 'var(--red)', borderColor: 'var(--red)' }}
                          onClick={() => handleDeleteMember(index)}
                        >
                          {L('Remove', 'إزالة')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PAYROLL */}
      {activeTab === 'payroll' && (
        <div className="tab-panel on">
          <div className="g3 stagger mb">
            <div className="stat-card">
              <div className="stat-lbl">💰 {L('Monthly Payroll', 'الرواتب الشهرية')}</div>
              <div className="stat-val">${monthlyPayroll.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">📅 {L('Annual Payroll', 'الرواتب السنوية')}</div>
              <div className="stat-val">${annualPayroll.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">📊 {L('Total Staff Count', 'عدد الموظفين')}</div>
              <div className="stat-val">{members.length}</div>
            </div>
          </div>
          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">💰 {L('Payroll Table', 'جدول الرواتب')}</div>
              <button className="btn btn-prime" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={handlePayAll}>
                💸 {L('Pay All', 'دفع للكل')}
              </button>
            </div>
            {members.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px' }}>
                <div className="es-icon">💰</div>
                <div className="es-sub">{L('No team members to show payroll', 'لا يوجد أعضاء لعرض رواتبهم')}</div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--edge)' }}>
                      <th style={{ padding: '12px' }}>{L('Employee', 'الموظف')}</th>
                      <th style={{ padding: '12px' }}>{L('Role', 'الدور')}</th>
                      <th style={{ padding: '12px' }}>{L('Monthly Salary', 'الراتب الشهري')}</th>
                      <th style={{ padding: '12px' }}>{L('Annual Salary', 'الراتب السنوي')}</th>
                      <th style={{ padding: '12px' }}>{L('Status', 'الحالة')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid var(--edge)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{m.name}</td>
                        <td style={{ padding: '12px', color: 'var(--t2)' }}>{m.role}</td>
                        <td style={{ padding: '12px', fontWeight: 700, color: 'var(--green)' }}>${parseFloat(m.salary).toLocaleString()}</td>
                        <td style={{ padding: '12px', color: 'var(--t2)' }}>${(parseFloat(m.salary) * 12).toLocaleString()}</td>
                        <td style={{ padding: '12px' }}>
                          <span className="badge b-green">{L('Ready to Pay', 'جاهز للدفع')}</span>
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

      {/* TAB 3: PERMISSIONS */}
      {activeTab === 'perms' && (
        <div className="tab-panel on">
          <div className="card">
            <div className="sec-hd"><div className="sec-title">🔐 {L('Permissions Matrix', 'مصفوفة الصلاحيات')}</div></div>
            {members.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px' }}>
                <div className="es-icon">🔐</div>
                <div className="es-sub">{L('Please add team members first', 'الرجاء إضافة أعضاء في الفريق أولاً')}</div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '5px' }}>
                    {L('Select Member', 'اختر العضو')}
                  </label>
                  <select 
                    className="inp" 
                    style={{ maxWidth: '300px' }}
                    value={selectedPermMemberIndex}
                    onChange={(e) => setSelectedPermMemberIndex(parseInt(e.target.value))}
                  >
                    {members.map((m, i) => (
                      <option key={i} value={i}>{m.name} ({m.role}) {m.uid ? '✓' : ''}</option>
                    ))}
                  </select>
                </div>

                {members[selectedPermMemberIndex] && (
                  <div style={{ background: 'var(--surface2)', padding: '20px', borderRadius: '10px', border: '1px solid var(--edge)' }}>
                    <div style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {L('Access Controls for ', 'صلاحيات الوصول لـ ')} {members[selectedPermMemberIndex].name}
                      {members[selectedPermMemberIndex].uid && (
                        <span className="badge b-green" style={{ fontSize: '10px', padding: '2px 8px' }}>
                          {L('Firebase Linked ✓', 'مربوط بالنظام ✓')}
                        </span>
                      )}
                    </div>
                    {members[selectedPermMemberIndex].uid && (
                      <div style={{ fontSize: '11px', color: 'var(--t3)', marginBottom: '12px' }}>
                        {L('Changes sync automatically to the member\'s login account', 'التغييرات تتم مزامنتها تلقائياً مع حساب تسجيل الدخول')}
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                      {[
                        { id: 'dashboard', label: L('🏠 Dashboard', '🏠 لوحة التحكم') },
                        { id: 'crm', label: L('🎯 Smart CRM', '🎯 إدارة العملاء') },
                        { id: 'telegram', label: L('💬 Telegram Hub', '💬 تليجرام هاب') },
                        { id: 'marketing', label: L('📣 Marketing OS', '📣 ماركتنج سنتر') },
                        { id: 'content', label: L('✦ Content Hub', '✦ صناعة المحتوى') },
                        { id: 'finance', label: L('💳 Finance', '💳 الحسابات والمالية') },
                        { id: 'tasks', label: L('◉ Task Board', '◉ لوحة المهام') },
                        { id: 'calendar', label: L('📅 Calendar', '📅 التقويم') },
                        { id: 'community', label: L('Hub Community', 'المجتمع والمنتدى') },
                        { id: 'analytics', label: L('📊 Analytics', '📊 التحليلات') },
                        { id: 'integrations', label: L('⛓ Integrations', '⛓ الربط والربط البرمجي') },
                        { id: 'team', label: L('👥 Team Mgmt', '👥 إدارة الفريق') },
                        { id: 'teamchat', label: L('💬 Team Chat', '💬 دردشة الفريق') }
                      ].map(perm => {
                        const hasPerm = (members[selectedPermMemberIndex].permissions || []).includes(perm.id);
                        return (
                          <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px', background: 'var(--surface3)', borderRadius: '6px', border: '1px solid var(--edge)' }}>
                            <input 
                              type="checkbox" 
                              checked={hasPerm} 
                              onChange={() => handleToggleMemberPermission(selectedPermMemberIndex, perm.id)}
                              style={{ accentColor: 'var(--orange)' }} 
                            />
                            <span style={{ fontSize: '13px', color: 'var(--t1)' }}>{perm.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: TASKS */}
      {activeTab === 'tasks' && (
        <div className="tab-panel on">
          <div className="sec-hd" style={{ marginBottom: '14px' }}>
            <div className="sec-title">✅ {L('Team Tasks', 'مهام الفريق')}</div>
            <button className="btn btn-prime" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={() => setIsAddTaskOpen(true)}>
              + {L('Add Task', 'إضافة مهمة')}
            </button>
          </div>
          {tasks.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="es-icon">✅</div>
              <div className="es-sub">{L('No tasks found. Create tasks for your team.', 'لا توجد مهام حالياً. أنشئ مهام جديدة لفريقك.')}</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tasks.map(tk => (
                <div 
                  key={tk.id} 
                  style={{ 
                    background: 'var(--surface2)', 
                    padding: '14px', 
                    borderRadius: '10px', 
                    border: '1px solid var(--edge)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    opacity: tk.done ? 0.6 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <input 
                      type="checkbox" 
                      checked={tk.done} 
                      onChange={() => handleToggleTaskDone(tk.id)} 
                      style={{ accentColor: 'var(--orange)', cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13.5px', textDecoration: tk.done ? 'line-through' : 'none', color: 'var(--t1)' }}>{tk.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--t2)', marginTop: '2px' }}>
                        👤 {L('Assignee:', 'المكلف:')} <strong style={{ color: 'var(--orange)' }}>{tk.assignee || L('Unassigned', 'غير معين')}</strong> · 📅 {L('Due:', 'تاريخ الاستحقاق:')} {tk.dueDate}
                      </div>
                      {tk.desc && <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '4px', fontStyle: 'italic' }}>{tk.desc}</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${tk.priority === 'high' ? 'b-red' : tk.priority === 'medium' ? 'b-amber' : 'b-green'}`}>
                      {tk.priority?.toUpperCase()}
                    </span>
                    <button 
                      className="btn btn-ghost" 
                      style={{ padding: '3px 8px', fontSize: '11px', color: 'var(--red)', borderColor: 'var(--red)' }}
                      onClick={() => handleDeleteTask(tk.id)}
                    >
                      {L('Delete', 'حذف')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: ACTIVITY LOG */}
      {activeTab === 'log' && (
        <div className="tab-panel on">
          <div className="sec-hd" style={{ marginBottom: '14px' }}>
            <div className="sec-title">📋 {L('Activity Log', 'سجل النشاط')}</div>
            {logs.length > 0 && (
              <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '6px 14px' }} onClick={handleClearLogs}>
                {L('Clear Log', 'مسح السجل')}
              </button>
            )}
          </div>
          {logs.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="es-icon">📋</div>
              <div className="es-sub">{L('Activity will appear here as you manage your team', 'سيظهر النشاط هنا عندما تدير فريقك')}</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {logs.map(log => (
                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface2)', borderRadius: '8px', border: '1px solid var(--edge)', fontSize: '12px' }}>
                  <span style={{ color: 'var(--t1)', fontWeight: 500 }}>{log.action}</span>
                  <span style={{ color: 'var(--t3)' }}>{log.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ADD MEMBER MODAL */}
      {isAddMemberOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setIsAddMemberOpen(false); }}>
          <div className="modal-box" style={{ maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-close" onClick={() => setIsAddMemberOpen(false)}>✕</div>
            <div style={{ padding: '24px' }}>
              <div style={{ fontFamily: 'var(--ff)', fontSize: '18px', fontWeight: 800, marginBottom: '5px', color: 'var(--t1)' }}>
                + {L('Add Team Member', 'إضافة عضو جديد')}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--t2)', marginBottom: '20px' }}>
                {L('Members with email & password can log in to view tasks & chat', 'الأعضاء بالبريد الإلكتروني وكلمة المرور يمكنهم تسجيل الدخول')}
              </div>
              
              <form onSubmit={handleSaveMember}>
                {/* Login credentials section */}
                <div style={{ background: 'linear-gradient(135deg, rgba(108,53,255,0.06), rgba(255,107,53,0.06))', border: '1px solid var(--edge)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🔑 {L('Login Credentials (Required for Team Login)', 'بيانات تسجيل الدخول (مطلوبة لتسجيل الدخول)')}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Email *', 'البريد الإلكتروني *')}</label>
                      <input className="inp" placeholder="member@company.com" type="email" value={mEmail} onChange={(e) => setMEmail(e.target.value)} required />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Password *', 'كلمة المرور *')}</label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input className="inp" style={{ flex: 1 }} placeholder="Min 6 characters" type="text" value={mPassword} onChange={(e) => setMPassword(e.target.value)} minLength={6} required />
                        <button type="button" className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: '11px', whiteSpace: 'nowrap' }} onClick={() => setMPassword(generatePassword())}>
                          🎲 {L('Generate', 'توليد')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Full Name *', 'الاسم الكامل *')}</label>
                    <input className="inp" placeholder="Ahmed Al-Rashid" value={mName} onChange={(e) => setMName(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Phone', 'رقم الهاتف')}</label>
                    <input className="inp" placeholder="+966 50 123 4567" value={mPhone} onChange={(e) => setMPhone(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Role *', 'الدور *')}</label>
                    <select className="inp" value={mRole} onChange={(e) => setMRole(e.target.value)}>
                      <option value="Admin">🔑 Admin</option>
                      <option value="Sales">💼 Sales</option>
                      <option value="Content">✍️ Content</option>
                      <option value="Trainer/Coach">🎓 Trainer/Coach</option>
                      <option value="Support">🎧 Support</option>
                      <option value="Marketing">📣 Marketing</option>
                      <option value="Finance">💰 Finance</option>
                      <option value="Operations">⚙️ Operations</option>
                      <option value="Developer">💻 Developer</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Department', 'القسم')}</label>
                    <input className="inp" placeholder="e.g. Growth, Content, Finance" value={mDept} onChange={(e) => setMDept(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Monthly Salary (USD) *', 'الراتب الشهري (دولار) *')}</label>
                    <input className="inp" type="number" placeholder="1500" min="0" value={mSalary} onChange={(e) => setMSalary(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Contract Type', 'نوع العقد')}</label>
                    <select className="inp" value={mContract} onChange={(e) => setMContract(e.target.value)}>
                      <option>Full-time</option><option>Part-time</option><option>Freelancer</option><option>Intern</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Join Date', 'تاريخ الانضمام')}</label>
                    <input className="inp" type="text" placeholder="dd/mm/yyyy" value={mJoinDate} onChange={(e) => setMJoinDate(e.target.value)} onFocus={(e) => e.target.type = 'date'} onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }} />
                  </div>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--t1)', marginBottom: '10px' }}>🔐 {L('Platform Permissions', 'صلاحيات المنصة')}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    {[
                      { id: 'dashboard', label: 'Dashboard' },
                      { id: 'crm', label: 'Smart CRM' },
                      { id: 'telegram', label: 'Telegram Hub' },
                      { id: 'marketing', label: 'Marketing OS' },
                      { id: 'content', label: 'Content Hub' },
                      { id: 'finance', label: 'Finance' },
                      { id: 'tasks', label: 'Task Board' },
                      { id: 'calendar', label: 'Calendar' },
                      { id: 'community', label: 'Community' },
                      { id: 'analytics', label: 'Analytics' },
                      { id: 'integrations', label: 'Integrations' },
                      { id: 'team', label: 'Team Mgmt' },
                      { id: 'teamchat', label: 'Team Chat' }
                    ].map(perm => {
                      const isChecked = mPermissions.includes(perm.id);
                      return (
                        <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontSize: '13px', color: 'var(--t2)' }}>
                          <input 
                            type="checkbox" 
                            checked={isChecked} 
                            onChange={() => handleToggleFormPerm(perm.id)}
                            style={{ accentColor: 'var(--orange)' }} 
                          /> 
                          {perm.label}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsAddMemberOpen(false)}>
                    {L('Cancel', 'إلغاء')}
                  </button>
                  <button type="submit" className="btn btn-prime" style={{ flex: 1, justifyContent: 'center' }} disabled={isCreating}>
                    {isCreating ? L('Creating Account...', 'جاري إنشاء الحساب...') : `+ ${L('Add Member', 'إضافة عضو')}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CREDENTIALS MODAL */}
      {isCredsModalOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setIsCredsModalOpen(false); }}>
          <div className="modal-box" style={{ maxWidth: '440px' }}>
            <div className="modal-close" onClick={() => setIsCredsModalOpen(false)}>✕</div>
            <div style={{ padding: '28px', textAlign: 'center' }}>
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
                <button className="btn btn-prime" style={{ flex: 1, justifyContent: 'center' }} onClick={copyCredsToClipboard}>
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
          <div className="modal-box" style={{ maxWidth: '480px' }}>
            <div className="modal-close" onClick={() => setIsAddTaskOpen(false)}>✕</div>
            <div style={{ padding: '22px' }}>
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
                  <button type="submit" className="btn btn-prime" style={{ flex: 1, justifyContent: 'center' }}>
                    + {L('Add Task', 'إضافة مهمة')}
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
