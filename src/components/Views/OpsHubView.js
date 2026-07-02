'use client';

import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';

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
  const [activeSubTab, setActiveSubTab] = useState('ops-automations');
  const [generatingSOP, setGeneratingSOP] = useState(false);

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

  const handleAddTeamMember = () => {
    const name = prompt(L('Enter Team Member Name:', 'أدخل اسم عضو الفريق:'));
    if (!name) return;
    const role = prompt(L('Enter Role (e.g. Assistant VA):', 'أدخل الدور الوظيفي:'), 'VA Assistant');
    if (!role) return;

    const newMember = {
      name,
      role,
      status: 'active',
      email: `${name.toLowerCase().replace(/\s/g, '')}@upklick.com`,
      phone: '',
      department: 'Operations',
      salary: 1000,
      contractType: 'Full-time',
      joinDate: new Date().toLocaleDateString('en-GB'),
      permissions: ['dashboard']
    };

    const updatedMembers = [...teamList, newMember];
    const newLog = {
      id: Date.now(),
      action: L(`Added team member ${name}`, `تم إضافة عضو الفريق ${name}`),
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

      <div className="g4 stagger mb">
        <div className="stat-card">
          <div className="stat-lbl">⏱️ {L('Hours Saved', 'ساعات تم توفيرها')}</div>
          <div className="stat-val ch-up">{hoursSavedCount}</div>
          <div className="stat-ch ch-nu">{L('via automation', 'من خلال الأتمتة')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">🔄 {L('Active Automations', 'الأتمتة النشطة')}</div>
          <div className="stat-val">{activeAutomationsCount}</div>
          <div className="stat-ch ch-nu">{L('running', 'قيد التشغيل')}</div>
        </div>
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
        <button className={`tab-btn ${activeSubTab === 'ops-automations' ? 'on' : ''}`} onClick={() => setActiveSubTab('ops-automations')}>
          🔄 {L('Automations', 'الأتمتة')}
        </button>
        <button className={`tab-btn ${activeSubTab === 'ops-sops' ? 'on' : ''}`} onClick={() => setActiveSubTab('ops-sops')}>
          📋 {L('SOPs', 'أدلة التشغيل SOPs')}
        </button>
        <button className={`tab-btn ${activeSubTab === 'ops-team' ? 'on' : ''}`} onClick={() => setActiveSubTab('ops-team')}>
          👥 {L('Team', 'الفريق')}
        </button>
        <button className={`tab-btn ${activeSubTab === 'ops-tools' ? 'on' : ''}`} onClick={() => setActiveSubTab('ops-tools')}>
          🛠️ {L('Tools Stack', 'مجموعة الأدوات')}
        </button>
      </div>

      {/* AUTOMATIONS TAB */}
      {activeSubTab === 'ops-automations' && (
        <div className="tab-panel on" id="ops-automations">
          <div className="card mb">
            <div className="sec-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div className="sec-title">⚡ {L('Quick Automations', 'الأتمتة السريعة')}</div>
              <button className="btn btn-prime" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={() => alert('+ New Automation')}>
                + {L('New Automation', 'أتمتة جديدة')}
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '10px' }}>
              {[
                { key: 'welcome', icon: '👋', title: L('New Lead Welcome', 'ترحيب بالعميل الجديد'), desc: L('Auto-send welcome message when new lead added', 'إرسال رسالة ترحيبية فورية عند إضافة عميل محتمل جديد للـ CRM') },
                { key: 'followup', icon: '📤', title: L('3-Day Follow-up', 'متابعة بعد ٣ أيام'), desc: L('Auto-remind leads who haven\'t replied in 3 days', 'تذكير العملاء تلقائياً في حال عدم الرد بعد ٣ أيام من إرسال العرض') },
                { key: 'report', icon: '📊', title: L('Daily Report', 'التقرير اليومي'), desc: L('Send yourself a Telegram report every morning at 8am', 'إرسال تقرير ملخص لحالة البزنس يومياً لتيليجرام الخاص بك الساعة ٨ صباحاً') },
                { key: 'invoice', icon: '🧾', title: L('Auto Invoice', 'الفواتير التلقائية'), desc: L('Generate and send invoice when deal is marked Won', 'توليد وإرسال الفاتورة تلقائياً للعميل عند إغلاق الصفقة بنجاح') }
              ].map(auto => {
                const isActive = automations[auto.key];
                return (
                  <div 
                    key={auto.key}
                    onClick={() => toggleAutomation(auto.key)}
                    style={{ 
                      background: 'var(--surface2)', 
                      borderRadius: '10px', 
                      padding: '13px', 
                      border: isActive ? '1px solid var(--orange)' : '1px solid var(--edge)', 
                      cursor: 'pointer', 
                      transition: 'all .14s' 
                    }}
                  >
                    <div style={{ fontSize: '20px', marginBottom: '7px' }}>{auto.icon}</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)', marginBottom: '4px' }}>{auto.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--t2)', marginBottom: '8px' }}>{auto.desc}</div>
                    <span className="badge" style={{ background: isActive ? 'var(--green-d)' : 'var(--surface3)', color: isActive ? 'var(--green)' : 'var(--t2)' }}>
                      {isActive ? L('Active', 'نشط') : L('Not Active', 'غير نشط')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
                    <div style={{ whiteSpace: 'pre-line', fontSize: '12.5px', lineHeight: 1.6 }} className="ai-box">
                      {sop.content}
                    </div>
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
              <button className="btn btn-prime" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={handleAddTeamMember}>
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
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{member.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--t2)' }}>{member.role} · {member.email}</div>
                    </div>
                    <span className="badge b-green" style={{ marginRight: '8px', marginLeft: '8px' }}>{L('Active', 'نشط')}</span>
                    <button 
                      className="btn btn-ghost" 
                      style={{ padding: '3px 8px', fontSize: '11px', color: 'var(--red)', borderColor: 'var(--red)' }}
                      onClick={() => handleDeleteTeamMember(index)}
                    >
                      {L('Remove', 'إزالة')}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOOLS TAB */}
      {activeSubTab === 'ops-tools' && (
        <div className="tab-panel on" id="ops-tools">
          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">🛠️ {L('Your Tech Stack', 'البنية البرمجية الخاصة بك')}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }} id="ops-tools-grid">
              <div style={{ background: 'var(--surface2)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>✦</div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--t1)' }}>UpKlick</div>
                <div style={{ fontSize: '11px', color: 'var(--orange)' }}>✅ {L('Active', 'نشط')}</div>
              </div>
              <div style={{ background: 'var(--surface2)', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>💬</div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--t1)' }}>Telegram API</div>
                <div style={{ fontSize: '11px', color: 'var(--green)' }}>✅ {L('Connected', 'متصل')}</div>
              </div>
              <div style={{ background: 'var(--surface2)', borderRadius: '10px', padding: '12px', textAlign: 'center', opacity: 0.5, cursor: 'pointer' }} onClick={() => alert('Integrations link clicked')}>
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>+</div>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--t1)' }}>{L('Add Tool', 'أضف أداة')}</div>
                <div style={{ fontSize: '11px', color: 'var(--t3)' }}>{L('From Integrations', 'من الإضافات')}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
