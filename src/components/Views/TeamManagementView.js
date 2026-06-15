'use client';

import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';

export default function TeamManagementView() {
  const { t, L, setAiPanelOpen } = useBusiness();
  const [activeTab, setActiveTab] = useState('members');
  
  // Modals state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
          <div className="stat-val">0</div>
          <div className="stat-ch ch-nu">{L('active', 'نشط')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">💰 {L('Monthly Payroll', 'الرواتب الشهرية')}</div>
          <div className="stat-val">$0</div>
          <div className="stat-ch ch-nu">{L('total salaries', 'إجمالي الرواتب')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">✅ {L('Tasks Done', 'المهام المنجزة')}</div>
          <div className="stat-val ch-up">0</div>
          <div className="stat-ch ch-nu">{L('this month', 'هذا الشهر')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">📊 {L('Payroll / Revenue', 'الرواتب / الدخل')}</div>
          <div className="stat-val">0%</div>
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
          <div className="empty-state" style={{ padding: '40px' }}>
            <div className="es-icon">👥</div>
            <div className="es-title">{L('No team members yet', 'لا يوجد أعضاء في الفريق بعد')}</div>
            <div className="es-sub">
              {L('Add your first team member to get started. Salaries sync automatically with Finance.', 'أضف أول عضو في فريقك للبدء. تتزامن الرواتب تلقائياً مع قسم المالية.')}
            </div>
            <button className="btn btn-prime" onClick={() => setIsAddMemberOpen(true)}>
              + {L('Add First Member', 'إضافة أول عضو')}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: PAYROLL */}
      {activeTab === 'payroll' && (
        <div className="tab-panel on">
          <div className="g3 stagger mb">
            <div className="stat-card"><div className="stat-lbl">💰 {L('Monthly Payroll', 'الرواتب الشهرية')}</div><div className="stat-val">$0</div></div>
            <div className="stat-card"><div className="stat-lbl">📅 {L('Annual Payroll', 'الرواتب السنوية')}</div><div className="stat-val">$0</div></div>
            <div className="stat-card"><div className="stat-lbl">📊 {L('Next Payment', 'الدفعة القادمة')}</div><div className="stat-val">—</div></div>
          </div>
          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">💰 {L('Payroll Table', 'جدول الرواتب')}</div>
              <button className="btn btn-prime" style={{ fontSize: '12px', padding: '6px 14px' }}>
                💸 {L('Pay All', 'دفع للكل')}
              </button>
            </div>
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="es-icon">💰</div>
              <div className="es-sub">{L('No team members to show payroll', 'لا يوجد أعضاء لعرض رواتبهم')}</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PERMISSIONS */}
      {activeTab === 'perms' && (
        <div className="tab-panel on">
          <div className="card">
            <div className="sec-hd"><div className="sec-title">🔐 {L('Permissions Matrix', 'مصفوفة الصلاحيات')}</div></div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '5px' }}>
                {L('Select Member', 'اختر العضو')}
              </label>
              <select className="inp" style={{ maxWidth: '300px' }}>
                <option value="">-- {L('Select member', 'اختر العضو')} --</option>
              </select>
            </div>
            <div className="empty-state" style={{ padding: '30px' }}>
              <div className="es-icon">🔐</div>
              <div className="es-sub">{L('Select a team member to manage their permissions', 'اختر عضواً لإدارة صلاحياته')}</div>
            </div>
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
          <div className="empty-state" style={{ padding: '30px' }}>
            <div className="es-icon">✅</div>
            <div className="es-sub">{L('No tasks found', 'لا توجد مهام')}</div>
          </div>
        </div>
      )}

      {/* TAB 5: ACTIVITY LOG */}
      {activeTab === 'log' && (
        <div className="tab-panel on">
          <div className="sec-hd" style={{ marginBottom: '14px' }}>
            <div className="sec-title">📋 {L('Activity Log', 'سجل النشاط')}</div>
            <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '6px 14px' }}>
              {L('Clear Log', 'مسح السجل')}
            </button>
          </div>
          <div className="empty-state" style={{ padding: '30px' }}>
            <div className="es-icon">📋</div>
            <div className="es-sub">{L('Activity will appear here as you manage your team', 'سيظهر النشاط هنا عندما تدير فريقك')}</div>
          </div>
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
                {L('Salary will auto-sync with Finance dashboard', 'سيتزامن الراتب تلقائياً مع قسم المالية')}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Full Name *', 'الاسم الكامل *')}</label><input className="inp" placeholder="Ahmed Al-Rashid" /></div>
                <div><label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Email', 'البريد الإلكتروني')}</label><input className="inp" placeholder="ahmed@company.com" type="email" /></div>
                <div><label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Phone', 'رقم الهاتف')}</label><input className="inp" placeholder="+966 50 123 4567" /></div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Role *', 'الدور *')}</label>
                  <select className="inp">
                    <option value="admin">🔑 Admin</option>
                    <option value="sales">💼 Sales</option>
                    <option value="content">✍️ Content</option>
                    <option value="trainer">🎓 Trainer/Coach</option>
                    <option value="support">🎧 Support</option>
                    <option value="marketing">📣 Marketing</option>
                    <option value="finance">💰 Finance</option>
                    <option value="operations">⚙️ Operations</option>
                    <option value="developer">💻 Developer</option>
                  </select>
                </div>
                <div><label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Department', 'القسم')}</label><input className="inp" placeholder="e.g. Growth, Content, Finance" /></div>
                <div><label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Monthly Salary (USD) *', 'الراتب الشهري (دولار) *')}</label><input className="inp" type="number" placeholder="1500" min="0" /></div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Contract Type', 'نوع العقد')}</label>
                  <select className="inp">
                    <option>Full-time</option><option>Part-time</option><option>Freelancer</option><option>Intern</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Join Date', 'تاريخ الانضمام')}</label>
                  <input className="inp" type="text" placeholder="dd/mm/yyyy" onFocus={(e) => e.target.type = 'date'} onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }} />
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--t1)', marginBottom: '10px' }}>🔐 {L('Platform Permissions', 'صلاحيات المنصة')}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {[
                    { id: 'dashboard', label: 'Dashboard' },
                    { id: 'crm', label: 'Smart CRM' },
                    { id: 'whatsapp', label: 'WhatsApp Hub' },
                    { id: 'marketing', label: 'Marketing OS' },
                    { id: 'content', label: 'Content Hub' },
                    { id: 'finance', label: 'Finance' },
                    { id: 'tasks', label: 'Task Board' },
                    { id: 'community', label: 'Community' },
                    { id: 'analytics', label: 'Analytics' },
                    { id: 'integrations', label: 'Integrations' },
                    { id: 'team', label: 'Team Mgmt' }
                  ].map(perm => (
                    <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontSize: '13px', color: 'var(--t2)' }}>
                      <input type="checkbox" value={perm.id} style={{ accentColor: 'var(--orange)' }} /> {perm.label}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsAddMemberOpen(false)}>
                  {L('Cancel', 'إلغاء')}
                </button>
                <button className="btn btn-prime" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsAddMemberOpen(false)}>
                  + {L('Add Member', 'إضافة عضو')}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div><label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Task Title *', 'عنوان المهمة *')}</label><input className="inp" placeholder="e.g. Write 10 TikTok scripts" /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Assign To', 'تعيين إلى')}</label>
                    <select className="inp"><option value="">{L('Unassigned', 'غير معين')}</option></select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Priority', 'الأولوية')}</label>
                    <select className="inp" defaultValue="medium">
                      <option value="high">🔴 High</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="low">🟢 Low</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Due Date', 'تاريخ الاستحقاق')}</label>
                  <input className="inp" type="text" placeholder="dd/mm/yyyy" onFocus={(e) => e.target.type = 'date'} onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }} />
                </div>
                <div><label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Description', 'الوصف')}</label><textarea className="inp" rows="2" placeholder="Details..."></textarea></div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsAddTaskOpen(false)}>
                  {L('Cancel', 'إلغاء')}
                </button>
                <button className="btn btn-prime" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsAddTaskOpen(false)}>
                  + {L('Add Task', 'إضافة مهمة')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
