'use client';

import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';
import { parseMarkdown } from '../../utils/markdown';

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

export default function OpsHubView() {
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const getPeriodMultiplier = (period, start, end) => {
    switch (period) {
      case 'today': return 0.03;
      case 'week': return 0.22;
      case 'month': return 0.85;
      case 'last30': return 1.0;
      case 'year': return 8.5;
      case 'custom': {
        if (start && end) {
          const days = Math.max(1, Math.round((new Date(end) - new Date(start)) / (86400000)));
          return days / 30;
        }
        return 1.0;
      }
      case 'all':
      default:
        return 1.0;
    }
  };

  const { lang, L, t, GC, saveGC, confirmAction } = useBusiness();

  // Tab state inside Ops Hub
  const [activeSubTab, setActiveSubTab] = useState('ops-sops');
  const [generatingSOP, setGeneratingSOP] = useState(false);

  // Modal & Form States for Team Members
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMemberIndex, setEditingMemberIndex] = useState(null);
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('VA Assistant');
  const [memberDept, setMemberDept] = useState('Operations');
  const [memberSalary, setMemberSalary] = useState(1000);

  // Bind to GC values
  const automations = GC.opsHub?.automations || {
    welcome: false,
    followup: false,
    report: false,
    invoice: false
  };
  const sopsList = GC.opsHub?.sopsList || [];
  const teamList = GC.team?.members || [];

  const toggleAutomation = (key) => {
    const updatedAutomations = {
      ...automations,
      [key]: !automations[key]
    };
    saveGC({
      ...GC,
      opsHub: {
        ...GC.opsHub,
        automations: updatedAutomations
      }
    });
    alert(L('Automation status updated!', 'تم تحديث حالة الأتمتة!'));
  };

  const handleAIAddSOP = async () => {
    setGeneratingSOP(true);
    const prompt = 'Generate a standard operating procedure (SOP) for "Onboarding a new coaching client". Structure it with steps, timeline, and communication tools.';
    const sysPrompt = 'Operations and workflow expert. Highly structured markdown list.';

    try {
      const reply = await callClaudeAPI(prompt, sysPrompt, lang);
      const newSOP = {
        id: Date.now(),
        title: L('Onboarding New Coaching Client', 'تهيئة عميل كوتشينج جديد'),
        content: reply
      };
      const updatedSops = [newSOP, ...sopsList];
      saveGC({
        ...GC,
        opsHub: {
          ...GC.opsHub,
          sopsList: updatedSops
        }
      });
    } catch (e) {
      alert('Failed to generate SOP.');
    } finally {
      setGeneratingSOP(false);
    }
  };

  const handleDeleteSOP = (id) => {
    confirmAction(L('Are you sure you want to delete this SOP?', 'هل أنت متأكد من حذف دليل التشغيل هذا؟'), () => {
      const updatedSops = sopsList.filter(s => s.id !== id);
      saveGC({
        ...GC,
        opsHub: {
          ...GC.opsHub,
          sopsList: updatedSops
        }
      });
    });
  };

  const handleAddTeamMemberClick = () => {
    setEditingMemberIndex(null);
    setMemberName('');
    setMemberEmail('');
    setMemberRole('VA Assistant');
    setMemberDept('Operations');
    setMemberSalary(1000);
    setShowMemberModal(true);
  };

  const handleEditTeamMemberClick = (index) => {
    const member = teamList[index];
    setEditingMemberIndex(index);
    setMemberName(member.name || '');
    setMemberEmail(member.email || '');
    setMemberRole(member.role || 'VA Assistant');
    setMemberDept(member.department || 'Operations');
    setMemberSalary(member.salary || 1000);
    setShowMemberModal(true);
  };

  const handleSaveTeamMember = (e) => {
    e.preventDefault();
    if (!memberName.trim() || !memberEmail.trim()) return;

    let updatedMembers = [...teamList];
    let logMsg = '';

    if (editingMemberIndex === null) {
      // Add mode
      const newMember = {
        name: memberName.trim(),
        role: memberRole.trim(),
        status: 'active',
        email: memberEmail.trim(),
        phone: '',
        department: memberDept,
        salary: parseFloat(memberSalary) || 1000,
        contractType: 'Full-time',
        joinDate: new Date().toLocaleDateString('en-GB'),
        permissions: ['dashboard']
      };
      updatedMembers = [...teamList, newMember];
      logMsg = L(`Added team member ${memberName}`, `تم إضافة عضو الفريق ${memberName}`);
    } else {
      // Edit mode
      const original = teamList[editingMemberIndex];
      const updatedMember = {
        ...original,
        name: memberName.trim(),
        role: memberRole.trim(),
        email: memberEmail.trim(),
        department: memberDept,
        salary: parseFloat(memberSalary) || 1000
      };
      updatedMembers[editingMemberIndex] = updatedMember;
      logMsg = L(`Updated team member ${memberName}`, `تم تحديث بيانات عضو الفريق ${memberName}`);
    }

    const newLog = {
      id: Date.now(),
      action: logMsg,
      date: new Date().toLocaleString()
    };

    saveGC({
      ...GC,
      team: {
        ...GC.team,
        members: updatedMembers,
        logs: [newLog, ...(GC.team?.logs || [])]
      }
    });

    setShowMemberModal(false);
  };

  const handleDeleteTeamMember = (index) => {
    confirmAction(L('Are you sure you want to remove this member?', 'هل أنت متأكد من إزالة هذا العضو؟'), () => {
      const removed = teamList[index];
      const updatedMembers = teamList.filter((_, i) => i !== index);
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
          logs: [newLog, ...(GC.team?.logs || [])]
        }
      });
    });
  };

  const dateFilteredSops = sopsList.filter(s => {
    const sopDate = s.id || '';
    return filterByDateRange(sopDate, filterPeriod, customStartDate, customEndDate);
  });

  const activeAutomationsCount = Object.values(automations).filter(Boolean).length;
  const mult = getPeriodMultiplier(filterPeriod, customStartDate, customEndDate);
  const hoursSavedCount = Math.round(activeAutomationsCount * 4 * mult);

  return (
    <div className="pg on" id="pg-ops">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">⚙</span>
          {L('Ops Hub', 'مركز العمليات')}
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

          <button className="btn-ai" onClick={() => alert('Ops Analysis triggered...')}>
            ✦ {L('Ops Analysis', 'تحليل العمليات')}
          </button>
        </div>
      </div>

      <div className="g2 stagger mb">
        <div className="stat-card">
          <div className="stat-lbl">📋 {L('SOPs Created', 'أدلة العمل SOPs')}</div>
          <div className="stat-val">{dateFilteredSops.length}</div>
          <div className="stat-ch ch-nu">{L('documents', 'ملفات موثقة')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">👥 {L('Team Members', 'أعضاء الفريق')}</div>
          <div className="stat-val">{teamList.length}</div>
          <div className="stat-ch ch-nu">{L('active', 'نشطين')}</div>
        </div>
      </div>

      <div className="tabs-bar" id="ops-tabs">
        <button className={`tab-btn ${activeSubTab === 'ops-sops' ? 'on' : ''}`} onClick={() => setActiveSubTab('ops-sops')}>
          📋 {L('SOPs', 'أدلة التشغيل SOPs')}
        </button>
        <button className={`tab-btn ${activeSubTab === 'ops-team' ? 'on' : ''}`} onClick={() => setActiveSubTab('ops-team')}>
          👥 {L('Team', 'الفريق')}
        </button>
      </div>

      {/* SOPs TAB */}
      {activeSubTab === 'ops-sops' && (
        <div className="tab-panel on" id="ops-sops">
          <div className="card">
            <div className="sec-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div className="sec-title">📋 {L('Standard Operating Procedures', 'أدلة التشغيل القياسية SOPs')}</div>
              <button className="btn btn-prime" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={handleAIAddSOP}>
                {generatingSOP ? L('Generating...', 'جاري الإنشاء...') : `+ ${L('Create SOP', 'إنشاء دليل')}`}
              </button>
            </div>
            {dateFilteredSops.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px' }}>
                <div className="es-icon">📋</div>
                <div className="es-title">{L('No SOPs yet', 'لا توجد أدلة عمل بعد')}</div>
                <div className="es-sub">
                  {L('Document your processes so you (or your team) can repeat them consistently. Use AI to generate SOPs instantly.', 'قم بتوثيق دورات عملياتك التشغيلية لتتمكن من تفويضها للفريق لاحقاً بسهولة.')}
                </div>
                <button className="btn btn-prime" onClick={handleAIAddSOP}>
                  ✦ {L('AI Generate SOP', 'توليد دليل تشغيل بالذكاء')}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {dateFilteredSops.map(sop => (
                  <div key={sop.id} style={{ background: 'var(--surface2)', padding: '15px', borderRadius: '10px', border: '1px solid var(--edge)', position: 'relative' }}>
                    <button 
                      className="btn btn-ghost" 
                      style={{ position: 'absolute', top: '10px', right: lang === 'ar' ? 'auto' : '10px', left: lang === 'ar' ? '10px' : 'auto', padding: '3px 8px', fontSize: '11px', color: 'var(--red)', borderColor: 'var(--red)' }}
                      onClick={() => handleDeleteSOP(sop.id)}
                    >
                      {L('Delete', 'حذف')}
                    </button>
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px', color: 'var(--orange)' }}>
                      {sop.title}
                    </div>
                    <div 
                      style={{ fontSize: '12.5px', lineHeight: 1.6 }} 
                      className="ai-box"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(sop.content) }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TEAM TAB */}
      {activeSubTab === 'ops-team' && (
        <div className="tab-panel on" id="ops-team">
          <div className="card">
            <div className="sec-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div className="sec-title">👥 {L('Team Members', 'أعضاء الفريق')}</div>
              <button className="btn btn-prime" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={handleAddTeamMemberClick}>
                + {L('Add Member', 'إضافة عضو')}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {teamList.length === 0 ? (
                 <div className="empty-state" style={{ padding: '20px' }}>
                   <div className="es-sub">{L('No team members yet', 'لا يوجد أعضاء في الفريق بعد')}</div>
                 </div>
              ) : (
                teamList.map((member, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--surface2)', borderRadius: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--orange-d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: 'var(--orange)' }}>
                      {member.name[0]?.toUpperCase() || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{member.name} <span style={{ fontSize: '10.5px', color: 'var(--orange)', background: 'rgba(255,107,53,0.08)', padding: '2px 6px', borderRadius: '4px', marginInlineStart: '6px' }}>{member.department || 'Operations'}</span></div>
                      <div style={{ fontSize: '11px', color: 'var(--t2)', marginTop: '2px' }}>{member.role} · {member.email} · {member.salary ? `$${member.salary}` : '$1000'}</div>
                    </div>
                    <span className="badge b-green" style={{ marginRight: '8px', marginLeft: '8px' }}>{L('Active', 'نشط')}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button 
                        className="btn" 
                        style={{ padding: '3px 8px', fontSize: '11px', color: 'var(--orange)', borderColor: 'var(--orange)', background: 'none' }}
                        onClick={() => handleEditTeamMemberClick(index)}
                      >
                        {L('Edit', 'تعديل')}
                      </button>
                      <button 
                        className="btn btn-ghost" 
                        style={{ padding: '3px 8px', fontSize: '11px', color: 'var(--red)', borderColor: 'var(--red)' }}
                        onClick={() => handleDeleteTeamMember(index)}
                      >
                        {L('Remove', 'إزالة')}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Team Member Modal */}
      {showMemberModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--surface1)',
            border: '1px solid var(--edge2)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '450px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--t1)' }}>
                👤 {editingMemberIndex === null ? L('Add Team Member', 'إضافة عضو فريق جديد') : L('Edit Team Member', 'تعديل بيانات عضو الفريق')}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowMemberModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--t3)', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTeamMember} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Full Name *', 'الاسم الكامل *')}
                </label>
                <input 
                  className="inp"
                  required
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder={L('e.g. John Doe', 'مثال: أحمد محمد')}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Email Address *', 'البريد الإلكتروني *')}
                </label>
                <input 
                  type="email"
                  className="inp"
                  required
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="name@company.com"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Department', 'القسم')}
                  </label>
                  <select 
                    className="inp"
                    value={memberDept}
                    onChange={(e) => setMemberDept(e.target.value)}
                    style={{ height: '38px', borderRadius: '8px' }}
                  >
                    <option value="Operations">{L('Operations', 'العمليات')}</option>
                    <option value="Marketing">{L('Marketing', 'التسويق')}</option>
                    <option value="CRM/Sales">{L('Sales & CRM', 'المبيعات والعملاء')}</option>
                    <option value="Finance">{L('Finance', 'المالية')}</option>
                    <option value="Support">{L('Technical Support', 'الدعم الفني')}</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Job Title / Role', 'المسمى الوظيفي')}
                  </label>
                  <input 
                    className="inp"
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value)}
                    placeholder="e.g. Lead Developer"
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Monthly Salary ($) *', 'الراتب الشهري ($) *')}
                </label>
                <input 
                  type="number"
                  className="inp"
                  required
                  value={memberSalary}
                  onChange={(e) => setMemberSalary(e.target.value)}
                  placeholder="1000"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-prime"
                style={{ width: '100%', justifyContent: 'center', padding: '10px', background: 'linear-gradient(135deg, var(--orange) 0%, #f43f5e 100%)', border: 'none', borderRadius: '8px', marginTop: '6px' }}
              >
                💾 {editingMemberIndex === null ? L('Add Member', 'إضافة العضو') : L('Save Changes', 'حفظ التعديلات')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
