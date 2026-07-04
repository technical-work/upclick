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

export default function CRMView() {
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const {
    lang,
    L,
    t,
    GC,
    formatMoney,
    formatDate,
    updateLeadStage,
    deleteLead,
    setLeadModalOpen,
    setLeadModalStage,
    setEditingLead,
    openAIFor,
    addWorkspace,
    setActiveWorkspace,
    updateWorkspace,
    deleteWorkspace,
    crmActiveTab: activeTab,
    setCrmActiveTab: setActiveTab
  } = useBusiness();
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  
  const [showWsDropdown, setShowWsDropdown] = useState(false);
  const [showWsModal, setShowWsModal] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsStages, setNewWsStages] = useState([
    { key: 'new', label: L('New Lead', 'ليد جديد'), color: '#3b82f6' },
    { key: 'contacted', label: L('Contacted', 'تم التواصل'), color: '#a855f7' },
    { key: 'closed', label: L('Closed Won', 'تم الإغلاق'), color: '#10b981' }
  ]);

  const [showEditWsModal, setShowEditWsModal] = useState(false);
  const [editWsName, setEditWsName] = useState('');
  const [editWsStages, setEditWsStages] = useState([]);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);

  const defaultWorkspace = {
    id: 'default',
    name: L('Default Workspace', 'مساحة العمل الافتراضية'),
    stages: [
      { key: 'new', label: L('New Lead', 'ليد جديد'), color: 'var(--blue)' },
      { key: 'contacted', label: L('Contacted', 'تم التواصل'), color: 'var(--purple)' },
      { key: 'qualified', label: L('Qualified', 'مؤهل'), color: 'var(--amber)' },
      { key: 'proposal', label: L('Proposal Sent', 'عرض أُرسل'), color: 'var(--a)' },
      { key: 'closed', label: L('Closed Won', 'تم الإغلاق'), color: 'var(--green)' },
      { key: 'lost', label: L('Lost', 'خسارة'), color: 'var(--red)' }
    ],
    leads: GC.crm?.leads || []
  };

  const workspaces = GC.crm?.workspaces || [defaultWorkspace];
  const activeWsId = GC.crm?.activeWorkspaceId || 'default';
  const activeWs = workspaces.find(w => w.id === activeWsId) || workspaces[0];
  const stages = activeWs.stages || [];
  const leads = activeWs.leads || [];

  const closedStageKey = stages.length > 0 ? stages[stages.length - 1].key : 'closed';
  const hotStageKey = stages.length > 1 ? stages[stages.length - 2].key : 'qualified';

  const dateFilteredLeads = leads.filter(l => {
    const leadDate = l.created || l.id || '';
    return filterByDateRange(leadDate, filterPeriod, customStartDate, customEndDate);
  });

  const activeLeads = dateFilteredLeads.filter(l => l.stage !== closedStageKey && l.stage !== 'lost');
  const hotLeads = dateFilteredLeads.filter(l => l.stage === hotStageKey || l.stage === 'proposal' || l.stage === 'qualified');
  const closedLeads = dateFilteredLeads.filter(l => l.stage === closedStageKey);
  const pipelineValue = activeLeads.reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);


  return (
    <div className="pg on" id="pg-crm">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .ws-modal-content {
          animation: slideDown 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          background: var(--surface);
          border: 1px solid var(--edge);
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          overflow: hidden;
        }
        .ws-modal-header {
          padding: 24px;
          border-bottom: 1px solid var(--edge2);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--surface2);
        }
        .ws-modal-body {
          padding: 24px;
          max-height: 60vh;
          overflow-y: auto;
        }
        .ws-modal-footer {
          padding: 20px 24px;
          border-top: 1px solid var(--edge2);
          background: var(--surface2);
        }
        .stage-row {
          display: flex;
          gap: 12px;
          align-items: center;
          background: var(--surface2);
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 12px;
          border: 1px solid transparent;
          transition: all 0.2s;
        }
        .stage-row:hover {
          border-color: var(--prime);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .color-picker {
          width: 36px;
          height: 36px;
          padding: 0;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          overflow: hidden;
        }
        .color-picker::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        .color-picker::-webkit-color-swatch {
          border: none;
          border-radius: 8px;
        }
      `}</style>
      {/* Header */}
      <div className="pg-header">
        <div className="pg-title" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <span className="pg-icon">🎯</span>
            <span>{L('Smart CRM', 'نظام إدارة العملاء')}</span>
          </div>
          {workspaces.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowWsDropdown(!showWsDropdown)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '6px 14px', height: '36px',
                    background: 'var(--prime)', color: '#fff',
                    border: 'none', borderRadius: '18px',
                    fontSize: '13px', fontWeight: '500',
                    cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                    {activeWs.name}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: showWsDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path d="M6 9l6 6 6-6"/></svg>
                </button>

                {showWsDropdown && (
                  <>
                    <div 
                      style={{ position: 'fixed', inset: 0, zIndex: 99 }} 
                      onClick={() => setShowWsDropdown(false)} 
                    />
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 8px)', right: lang === 'ar' ? '0' : 'auto', left: lang === 'ar' ? 'auto' : '0',
                      background: 'var(--surface)', border: '1px solid var(--edge)',
                      borderRadius: '12px', padding: '6px', minWidth: '180px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)', zIndex: 100,
                      animation: 'fadeIn 0.15s ease-out'
                    }}>
                      {workspaces.map(w => (
                        <button
                          key={w.id}
                          onClick={() => { setActiveWorkspace(w.id); setShowWsDropdown(false); }}
                          style={{
                            display: 'block', width: '100%', textAlign: lang === 'ar' ? 'right' : 'left',
                            padding: '10px 12px', background: w.id === activeWs.id ? 'var(--surface2)' : 'transparent',
                            border: 'none', borderRadius: '8px', color: w.id === activeWs.id ? 'var(--prime)' : 'var(--t1)',
                            fontSize: '13px', cursor: 'pointer', transition: 'background 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                          onMouseLeave={e => e.currentTarget.style.background = w.id === activeWs.id ? 'var(--surface2)' : 'transparent'}
                        >
                          {w.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button 
                className="btn btn-ghost" 
                style={{ padding: '6px', height: '36px', width: '36px', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '18px', background: 'var(--surface2)' }}
                onClick={() => setShowWsModal(true)}
                title={L('New Workspace', 'مساحة عمل جديدة')}
              >
                +
              </button>

              <button 
                className="btn btn-ghost" 
                style={{ padding: '6px', height: '36px', width: '36px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '18px', background: 'var(--surface2)' }}
                onClick={() => {
                  setEditWsName(activeWs.name);
                  setEditWsStages(activeWs.stages.map(s => ({ ...s })));
                  setShowEditWsModal(true);
                }}
                title={L('Edit Workspace', 'تعديل مساحة العمل')}
              >
                ⚙️
              </button>
            </div>
          )}
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

          <button className="btn-ai" onClick={() => openAIFor('crm')}>
            {L('AI Follow-up Suggestions', 'اقتراحات المتابعة بالذكاء الاصطناعي')}
          </button>
          <button
            className="btn btn-prime"
            onClick={() => {
              setLeadModalStage(stages.length > 0 ? stages[0].key : 'new');
              setLeadModalOpen(true);
            }}
          >
            + {L('New Lead', 'عميل جديد')}
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="g4 stagger mb">
        <div className="stat-card">
          <div className="stat-lbl">👥 {L('Total Leads', 'إجمالي العملاء')}</div>
          <div className="stat-val">{dateFilteredLeads.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">🔥 {L('Hot Leads', 'العملاء الساخنون')}</div>
          <div className="stat-val ch-up">{hotLeads.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">💰 {L('Pipeline Value', 'قيمة المبيعات المحتملة')}</div>
          <div className="stat-val">{formatMoney(pipelineValue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">✅ {L('Closed (Month)', 'الصفقات المغلقة')}</div>
          <div className="stat-val ch-up">{closedLeads.length}</div>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="tabs-bar" id="crm-tabs" style={{ marginBottom: '20px' }}>
        <button
          className={`tab-btn ${activeTab === 'pipeline' ? 'on' : ''}`}
          onClick={() => setActiveTab('pipeline')}
        >
          {L('Pipeline Board', 'لوحة الخطوات')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'contacts' ? 'on' : ''}`}
          onClick={() => setActiveTab('contacts')}
        >
          {L('All Contacts', 'كل جهات الاتصال')}
        </button>
        <button
          className={`tab-btn ${activeTab === 'followups' ? 'on' : ''}`}
          onClick={() => setActiveTab('followups')}
        >
          {L('Follow-ups', 'المتابعات')}
        </button>
      </div>

      {/* Sub View Panels */}

      {/* 1. PIPELINE TAB (KANBAN) */}
      {activeTab === 'pipeline' && (
        <div className="kanban" id="crm-kanban-board">
          {stages.map((stage) => {
            const stageLeads = dateFilteredLeads.filter((l) => l.stage === stage.key);
            return (
              <div className="kanban-col" key={stage.key}>
                <div className="kanban-col-hd">
                  <div className="kanban-col-title" style={{ color: stage.color }}>{stage.label}</div>
                  <div className="kanban-col-count">{stageLeads.length}</div>
                </div>

                <div 
                  style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '120px', flex: 1 }}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; }}
                  onDragLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.backgroundColor = 'transparent';
                    if (draggedLeadId) {
                      updateLeadStage(draggedLeadId, stage.key);
                      setDraggedLeadId(null);
                    }
                  }}
                >
                  {stageLeads.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '16px 8px', fontSize: '12px', color: 'var(--t3)' }}>
                      {L('Drop leads here', 'أضف عملاء هنا')}
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        className="kanban-card"
                        key={lead.id}
                        draggable
                        onDragStart={() => setDraggedLeadId(lead.id)}
                        onDragEnd={() => setDraggedLeadId(null)}
                        onClick={() => alert(`${lead.name} — ${formatMoney(lead.value)} — ${stage.label}`)}
                        style={{ cursor: 'grab', opacity: draggedLeadId === lead.id ? 0.5 : 1 }}
                      >
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)', marginBottom: '3px' }}>
                          {lead.name}
                        </div>
                        {lead.value > 0 && (
                          <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--green)' }}>
                            {formatMoney(lead.value)}
                          </div>
                        )}
                        <div style={{ fontSize: '11px', color: 'var(--t2)', marginTop: '4px' }}>
                          {lead.source || 'Other'}
                        </div>
                        {lead.followupDate && (
                          <div style={{ fontSize: '10px', color: 'var(--amber)', marginTop: '3px' }}>
                            📅 {formatDate(lead.followupDate)}
                          </div>
                        )}

                        {/* Edit / Delete actions top-right absolute or inline */}
                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                          <button
                            className="btn btn-ghost"
                            style={{ fontSize: '10px', padding: '3px 8px', flex: 1 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingLead(lead);
                              setLeadModalOpen(true);
                            }}
                          >
                            ✏️ {L('Edit', 'تعديل')}
                          </button>
                          <button
                            className="btn btn-ghost"
                            style={{ fontSize: '10px', padding: '3px 8px', color: 'var(--red)', borderColor: 'var(--red)', flex: 1 }}
                            onClick={(e) => {
                               e.stopPropagation();
                               setLeadToDelete(lead);
                               setDeleteConfirmOpen(true);
                             }}
                          >
                            🗑️ {L('Delete', 'حذف')}
                          </button>
                        </div>

                        {/* Move stage buttons - hidden on desktop, visible on mobile or touch */}
                        <div className="kanban-card-actions" style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                          {stages.filter(s => s.key !== stage.key).map(s => (
                            <button
                              key={s.key}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateLeadStage(lead.id, s.key);
                              }}
                              style={{
                                fontSize: '9px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                border: '1px solid var(--edge2)',
                                background: 'none',
                                cursor: 'pointer',
                                color: 'var(--t2)'
                              }}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '11px', padding: '5px', marginTop: '4px' }}
                  onClick={() => {
                    setLeadModalStage(stage.key);
                    setLeadModalOpen(true);
                  }}
                >
                  + {L('Add', 'إضافة')}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. ALL CONTACTS TAB */}
      {activeTab === 'contacts' && (
        <div className="card">
          <div id="crm-contacts-list">
            {dateFilteredLeads.length === 0 ? (
              <div className="empty-state">
                <div className="es-icon">👥</div>
                <div className="es-title">{L('No contacts yet', 'لا توجد جهات اتصال بعد')}</div>
                <div className="es-sub">{L('Add your first lead to start tracking your pipeline', 'أضف عميلك الأول لبدء تتبع المبيعات')}</div>
                <button className="btn btn-prime" onClick={() => { setLeadModalStage(stages.length > 0 ? stages[0].key : 'new'); setLeadModalOpen(true); }}>
                  + {L('Add First Lead', 'إضافة العميل الأول')}
                </button>
              </div>
            ) : (
              dateFilteredLeads.map((l) => {
                const leadStage = stages.find(s => s.key === l.stage) || stages[0];
                return (
                  <div className="row" key={l.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: 'var(--ag)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '13px',
                          color: 'var(--a)',
                          flexShrink: 0
                        }}
                      >
                        {l.name ? l.name[0].toUpperCase() : 'L'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="rn">{l.name}</div>
                        <div className="rs">{l.email || l.phone || L('No contact info', 'لا تتوفر معلومات اتصال')}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span
                        className="badge"
                        style={{
                          borderColor: `${leadStage.color}33`,
                          background: `${leadStage.color}1a`,
                          color: leadStage.color
                        }}
                      >
                        {leadStage.label}
                      </span>
                      {l.value > 0 && (
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--green)' }}>
                          {formatMoney(l.value)}
                        </div>
                      )}

                      <button
                        className="btn btn-ghost"
                        style={{ padding: '3px 8px', fontSize: '11px' }}
                        onClick={() => {
                          setEditingLead(l);
                          setLeadModalOpen(true);
                        }}
                      >
                        {L('Edit', 'تعديل')}
                      </button>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '3px 8px', fontSize: '11px', color: 'var(--red)', borderColor: 'var(--red)' }}
                         onClick={() => {
                           setLeadToDelete(l);
                           setDeleteConfirmOpen(true);
                         }}
                      >
                        {L('Delete', 'حذف')}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 3. FOLLOW-UPS TAB */}
      {activeTab === 'followups' && (
        <div className="g2">
          {/* Overdue */}
          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">⏰ {L('Overdue Follow-ups', 'متابعات متأخرة')}</div>
            </div>
            <div id="crm-overdue">
              {leads.filter(l => l.followupDate && new Date(l.followupDate) < new Date(new Date().setHours(0,0,0,0)) && l.stage !== 'closed' && l.stage !== 'lost').length === 0 ? (
                <div className="empty-state" style={{ padding: '20px' }}>
                  <div className="es-icon">✅</div>
                  <div className="es-title">{L('All caught up!', 'كل شيء مكتمل!')}</div>
                </div>
              ) : (
                leads.filter(l => l.followupDate && new Date(l.followupDate) < new Date(new Date().setHours(0,0,0,0)) && l.stage !== 'closed' && l.stage !== 'lost').map(l => (
                  <div className="row" key={l.id}>
                    <div style={{ flex: 1 }}>
                      <div className="rn">{l.name}</div>
                      <div className="rs">{L('Due:', 'تاريخ الاستحقاق:')} {formatDate(l.followupDate)}</div>
                    </div>
                    {l.phone && (
                      <a
                        className="btn btn-ghost"
                        style={{ fontSize: '11px', padding: '4px 9px', textDecoration: 'none', color: 'var(--green)', borderColor: 'var(--green)' }}
                        href={`https://t.me/${l.phone.replace(/[+\s-]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {L('Telegram', 'تليجرام')}
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Today */}
          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">📅 {L("Today's Follow-ups", "متابعات اليوم")}</div>
            </div>
            <div id="crm-today-fu">
              {leads.filter(l => l.followupDate && new Date(l.followupDate).toDateString() === new Date().toDateString()).length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--t3)', padding: '16px 0', textAlign: 'center' }}>
                  {L('No follow-ups scheduled for today', 'لا توجد متابعات مجدولة اليوم')}
                </div>
              ) : (
                leads.filter(l => l.followupDate && new Date(l.followupDate).toDateString() === new Date().toDateString()).map(l => {
                  const leadStage = stages.find(s => s.key === l.stage) || stages[0];
                  return (
                    <div className="row" key={l.id}>
                      <div style={{ flex: 1 }}>
                        <div className="rn">{l.name}</div>
                        <div className="rs">{leadStage.label}</div>
                      </div>
                      {l.phone ? (
                        <a
                          className="btn btn-prime"
                          style={{ fontSize: '11px', padding: '4px 9px', textDecoration: 'none' }}
                          href={`https://t.me/${l.phone.replace(/[+\s-]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {L('Follow Up', 'متابعة')}
                        </a>
                      ) : (
                        <button className="btn btn-prime" style={{ fontSize: '11px', padding: '4px 9px' }} onClick={() => alert(L('Opening contact panel...', 'جاري فتح لوحة الاتصال...'))}>
                          {L('Follow Up', 'متابعة')}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Workspace Modal */}
      {showWsModal && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out' }}>
          <div className="modal-content ws-modal-content" style={{ maxWidth: '540px', width: '90%' }}>
            <div className="ws-modal-header">
              <h2 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📁</span> {L('Create New Workspace', 'إنشاء مساحة عمل جديدة')}
              </h2>
              <button className="btn-close" style={{ background: 'var(--surface2)', color: 'var(--t1)', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--edge)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }} onClick={() => setShowWsModal(false)}>✕</button>
            </div>
            <div className="ws-modal-body">
              <div className="form-group">
                <label style={{ fontSize: '14px', color: 'var(--t2)', marginBottom: '8px', display: 'block' }}>{L('Workspace Name', 'اسم مساحة العمل')}</label>
                <input 
                  type="text" 
                  className="input" 
                  style={{ padding: '12px 16px', fontSize: '15px', borderRadius: '10px', background: 'var(--surface2)', color: 'var(--t1)', border: '1px solid var(--edge)', width: '100%' }}
                  placeholder={L('e.g., Real Estate Deals', 'مثال: صفقات العقارات')} 
                  value={newWsName} 
                  onChange={e => setNewWsName(e.target.value)} 
                />
              </div>
              <div className="form-group" style={{ marginTop: '24px' }}>
                <label style={{ fontSize: '14px', color: 'var(--t2)', marginBottom: '12px', display: 'block', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{L('Sales Stages', 'مراحل المبيعات')}</span>
                  <span style={{ fontSize: '12px', color: 'var(--t3)' }}>{newWsStages.length} {L('Stages', 'مراحل')}</span>
                </label>
                {newWsStages.map((stage, idx) => (
                  <div key={idx} className="stage-row">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--t3)', textTransform: 'uppercase' }}>{L('Color', 'اللون')}</span>
                      <input 
                        type="color" 
                        className="color-picker"
                        value={stage.color.startsWith('var') ? '#6c35ff' : stage.color} 
                        onChange={e => {
                          const updated = [...newWsStages];
                          updated[idx].color = e.target.value;
                          setNewWsStages(updated);
                        }} 
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--t3)', textTransform: 'uppercase' }}>{L('Stage Name', 'اسم المرحلة')}</span>
                      <input 
                        type="text" 
                        className="input" 
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--edge)', background: 'var(--surface)', color: 'var(--t1)' }}
                        placeholder={L('Stage Name', 'اسم المرحلة')} 
                        value={stage.label} 
                        onChange={e => {
                          const updated = [...newWsStages];
                          updated[idx].label = e.target.value;
                          updated[idx].key = e.target.value.toLowerCase().replace(/\s+/g, '_');
                          setNewWsStages(updated);
                        }} 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignSelf: 'flex-end' }}>
                      <button 
                        className="btn btn-ghost" 
                        style={{ color: 'var(--red)', height: '42px', width: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,59,48,0.1)', borderRadius: '8px' }}
                        title={L('Remove Stage', 'حذف المرحلة')}
                        onClick={() => {
                          if (newWsStages.length > 1) {
                            setNewWsStages(newWsStages.filter((_, i) => i !== idx));
                          }
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                ))}
                <button 
                  className="btn btn-ghost" 
                  style={{ width: '100%', marginTop: '12px', padding: '12px', border: '1px dashed var(--edge)', borderRadius: '12px', color: 'var(--t2)' }}
                  onClick={() => setNewWsStages([...newWsStages, { key: 'new_stage', label: 'New Stage', color: '#6c35ff' }])}
                >
                  + {L('Add Another Stage', 'إضافة مرحلة أخرى')}
                </button>
              </div>
            </div>
            <div className="ws-modal-footer">
              <button className="btn btn-prime" style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: '10px' }} onClick={() => {
                if (!newWsName.trim()) return alert(L('Please enter a workspace name.', 'يرجى إدخال اسم مساحة العمل.'));
                addWorkspace(newWsName, newWsStages);
                setShowWsModal(false);
                setNewWsName('');
                setNewWsStages([{ key: 'new', label: 'New Lead', color: '#3b82f6' }, { key: 'closed', label: 'Closed', color: '#10b981' }]);
              }}>
                {L('Create Workspace', 'إنشاء مساحة العمل')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Workspace Modal */}
      {showEditWsModal && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out' }}>
          <div className="modal-content ws-modal-content" style={{ maxWidth: '540px', width: '90%' }}>
            <div className="ws-modal-header">
              <h2 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚙️</span> {L('Edit Workspace', 'تعديل مساحة العمل')}
              </h2>
              <button className="btn-close" style={{ background: 'var(--surface2)', color: 'var(--t1)', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--edge)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }} onClick={() => setShowEditWsModal(false)}>✕</button>
            </div>
            <div className="ws-modal-body">
              <div className="form-group">
                <label style={{ fontSize: '14px', color: 'var(--t2)', marginBottom: '8px', display: 'block' }}>{L('Workspace Name', 'اسم مساحة العمل')}</label>
                <input 
                  type="text" 
                  className="input" 
                  style={{ padding: '12px 16px', fontSize: '15px', borderRadius: '10px', background: 'var(--surface2)', color: 'var(--t1)', border: '1px solid var(--edge)', width: '100%' }}
                  placeholder={L('e.g., Real Estate Deals', 'مثال: صفقات العقارات')} 
                  value={editWsName} 
                  onChange={e => setEditWsName(e.target.value)} 
                />
              </div>
              <div className="form-group" style={{ marginTop: '24px' }}>
                <label style={{ fontSize: '14px', color: 'var(--t2)', marginBottom: '12px', display: 'block', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{L('Sales Stages', 'مراحل المبيعات')}</span>
                  <span style={{ fontSize: '12px', color: 'var(--t3)' }}>{editWsStages.length} {L('Stages', 'مراحل')}</span>
                </label>
                {editWsStages.map((stage, idx) => (
                  <div key={idx} className="stage-row">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--t3)', textTransform: 'uppercase' }}>{L('Color', 'اللون')}</span>
                      <input 
                        type="color" 
                        className="color-picker"
                        value={stage.color.startsWith('var') ? '#6c35ff' : stage.color} 
                        onChange={e => {
                          const updated = [...editWsStages];
                          updated[idx].color = e.target.value;
                          setEditWsStages(updated);
                        }} 
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--t3)', textTransform: 'uppercase' }}>{L('Stage Name', 'اسم المرحلة')}</span>
                      <input 
                        type="text" 
                        className="input" 
                        style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--edge)', background: 'var(--surface)', color: 'var(--t1)' }}
                        placeholder={L('Stage Name', 'اسم المرحلة')} 
                        value={stage.label} 
                        onChange={e => {
                          const updated = [...editWsStages];
                          updated[idx].label = e.target.value;
                          updated[idx].key = e.target.value.toLowerCase().replace(/\s+/g, '_');
                          setEditWsStages(updated);
                        }} 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignSelf: 'flex-end' }}>
                      <button 
                        className="btn btn-ghost" 
                        style={{ color: 'var(--red)', height: '42px', width: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,59,48,0.1)', borderRadius: '8px' }}
                        title={L('Remove Stage', 'حذف المرحلة')}
                        onClick={() => {
                          if (editWsStages.length > 1) {
                            setEditWsStages(editWsStages.filter((_, i) => i !== idx));
                          }
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                ))}
                <button 
                  className="btn btn-ghost" 
                  style={{ width: '100%', marginTop: '12px', padding: '12px', border: '1px dashed var(--edge)', borderRadius: '12px', color: 'var(--t2)' }}
                  onClick={() => setEditWsStages([...editWsStages, { key: 'new_stage', label: 'New Stage', color: '#6c35ff' }])}
                >
                  + {L('Add Another Stage', 'إضافة مرحلة أخرى')}
                </button>
              </div>
            </div>
            <div className="ws-modal-footer" style={{ display: 'flex', gap: '12px' }}>
              {workspaces.length > 1 && activeWs.id !== 'default' && (
                <button 
                  className="btn" 
                  style={{ background: 'rgba(255,59,48,0.1)', color: 'var(--red)', border: '1px solid rgba(255,59,48,0.2)', padding: '14px 20px', borderRadius: '10px', fontSize: '15px', cursor: 'pointer' }}
                  onClick={() => {
                    confirmAction(L('Are you sure you want to delete this workspace and all its leads?', 'هل أنت متأكد من حذف مساحة العمل هذه وجميع العملاء بداخلها؟'), () => {
                      deleteWorkspace(activeWs.id);
                      setShowEditWsModal(false);
                    });
                  }}
                >
                  {L('Delete Workspace', 'حذف مساحة العمل')}
                </button>
              )}
              <button className="btn btn-prime" style={{ flex: 1, padding: '14px', fontSize: '15px', borderRadius: '10px' }} onClick={() => {
                if (!editWsName.trim()) return alert(L('Please enter a workspace name.', 'يرجى إدخال اسم مساحة العمل.'));
                updateWorkspace(activeWs.id, editWsName, editWsStages);
                setShowEditWsModal(false);
              }}>
                {L('Save Changes', 'حفظ التعديلات')}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Lead Confirmation Modal */}
      {deleteConfirmOpen && leadToDelete && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out' }}>
          <div className="modal-content ws-modal-content" style={{ maxWidth: '420px', width: '90%' }}>
            <div className="ws-modal-header" style={{ borderBottom: 'none', paddingBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--red)' }}>
                <span>⚠️</span> {L('Confirm Deletion', 'تأكيد الحذف')}
              </h2>
              <button className="btn-close" style={{ background: 'var(--surface2)', color: 'var(--t1)', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--edge)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }} onClick={() => { setDeleteConfirmOpen(false); setLeadToDelete(null); }}>✕</button>
            </div>
            <div className="ws-modal-body" style={{ padding: '0 24px 24px 24px', textAlign: 'center', maxHeight: 'none' }}>
              <p style={{ fontSize: '14.5px', color: 'var(--t1)', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                {L(
                  `Are you sure you want to delete the lead "${leadToDelete.name}"? This action cannot be undone.`,
                  `هل أنت متأكد من رغبتك في حذف العميل "${leadToDelete.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
                )}
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn" 
                  style={{ flex: 1, background: 'var(--surface2)', color: 'var(--t1)', border: '1px solid var(--edge)', padding: '12px', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' }}
                  onClick={() => { setDeleteConfirmOpen(false); setLeadToDelete(null); }}
                >
                  {L('Cancel', 'إلغاء')}
                </button>
                <button 
                  className="btn" 
                  style={{ flex: 1, background: 'var(--red)', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }}
                  onClick={() => {
                    deleteLead(leadToDelete.id);
                    setDeleteConfirmOpen(false);
                    setLeadToDelete(null);
                  }}
                >
                  {L('Delete', 'حذف')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
