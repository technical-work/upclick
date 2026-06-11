'use client';

import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';

export default function TaskBoardView() {
  const { lang, L, t, GC, toggleTask, deleteTask, setTaskModalOpen } = useBusiness();
  const [activeTab, setActiveTab] = useState('today');
  const [aiPrioritized, setAiPrioritized] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Compute Task Stats
  const items = GC.tasks.items || [];
  const totalTasks = items.length;
  const highPriority = items.filter(t => !t.done && t.priority === 'high').length;
  const completedToday = items.filter(t => t.done).length;
  const overdueTasks = items.filter(t => !t.done && t.due && new Date(t.due) < new Date()).length;

  const runAIPrioritization = async () => {
    setAiLoading(true);
    const taskListText = items.map((t, i) => `${i + 1}. [${t.priority.toUpperCase()}] ${t.title} (Done: ${t.done})`).join('\n');
    const prompt = `Prioritize the following task list for an entrepreneur. Business Niche: "${GC.profile.niche}", Stage: "${GC.profile.stage}".
Tasks:
${taskListText || 'No tasks added yet.'}
Give me the top 3 tasks I must focus on today to make progress, and why. Be extremely brief, 3-4 bullet points max.`;

    const system = `You are a productivity and time-management coach. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;
    try {
      const res = await callClaudeAPI(prompt, system, lang, GC);
      setAiPrioritized(res);
    } catch (e) {
      setAiPrioritized(L('Error generating AI prioritization.', 'حدث خطأ أثناء ترتيب الأولويات بالذكاء الاصطناعي.'));
    }
    setAiLoading(false);
  };

  const getPriorityBadgeColor = (p) => {
    if (p === 'high') return 'var(--red)';
    if (p === 'medium') return 'var(--amber)';
    return 'var(--green)';
  };

  // Render Kanban Board Columns
  const kanbanColumns = [
    { key: 'todo', label: L('To Do', 'للقيام به'), filter: t => !t.done && t.priority === 'high' },
    { key: 'in-progress', label: L('In Progress', 'قيد التنفيذ'), filter: t => !t.done && t.priority === 'medium' },
    { key: 'backlog', label: L('Backlog', 'المؤجلات'), filter: t => !t.done && t.priority === 'low' },
    { key: 'done', label: L('Completed', 'المكتملة'), filter: t => t.done }
  ];

  return (
    <div className="pg on" id="pg-tasks">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">◉</span>
          <span>{t('Task Board')}</span>
        </div>
        <div className="pg-actions">
          <button className="btn-ai" onClick={runAIPrioritization} disabled={aiLoading}>
            {aiLoading ? L('Analyzing...', 'جاري التحليل...') : L('Prioritize with AI', 'ترتيب الأولويات بالـ AI')}
          </button>
          <button className="btn btn-prime" onClick={() => setTaskModalOpen(true)}>
            + {L('New Task', 'مهمة جديدة')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="g4 stagger" style={{ marginBottom: '16px' }}>
        <div className="stat-card">
          <div className="stat-lbl">◉ {L('Total Tasks', 'إجمالي المهام')}</div>
          <div className="stat-val">{totalTasks}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">🔥 {L('High Priority', 'عاجلة')}</div>
          <div className="stat-val" style={{ color: 'var(--red)' }}>{highPriority}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">✅ {L('Completed', 'مكتملة')}</div>
          <div className="stat-val" style={{ color: 'var(--green)' }}>{completedToday}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">⏰ {L('Overdue', 'متأخرة')}</div>
          <div className="stat-val" style={{ color: overdueTasks > 0 ? 'var(--red)' : 'var(--t1)' }}>{overdueTasks}</div>
        </div>
      </div>

      {/* AI Prioritization Panel */}
      {aiPrioritized && (
        <div className="card mb" style={{ border: '1px solid var(--orange-d)', background: 'var(--orange-dim)' }}>
          <div style={{ fontStyle: 'normal', fontSize: '13px', color: 'var(--t1)' }}>
            <strong>⚡ {L('AI Prioritized Focus Today:', 'تركيز الذكاء الاصطناعي اليوم:')}</strong>
            <div style={{ marginTop: '8px', lineHeight: '1.5', whiteSpace: 'pre-line' }}>{aiPrioritized}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-bar" id="task-tabs" style={{ marginBottom: '14px' }}>
        <button className={`tab-btn ${activeTab === 'today' ? 'on' : ''}`} onClick={() => setActiveTab('today')}>{L('Today', 'اليوم')}</button>
        <button className={`tab-btn ${activeTab === 'all' ? 'on' : ''}`} onClick={() => setActiveTab('all')}>{L('All Tasks', 'جميع المهام')}</button>
        <button className={`tab-btn ${activeTab === 'kanban' ? 'on' : ''}`} onClick={() => setActiveTab('kanban')}>{L('Kanban', 'كانبان')}</button>
      </div>

      {/* List Panels */}
      {activeTab === 'today' && (
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.filter(t => !t.done).length === 0 ? (
              <div className="empty-state" style={{ padding: '30px' }}>
                <div className="es-icon">🎉</div>
                <div className="es-title">{L('All caught up!', 'أكملت جميع المهام!')}</div>
                <div className="es-sub">{L('You have no active tasks. Add a new one to get started.', 'لا توجد مهام نشطة حالياً. أضف مهمة جديدة للبدء.')}</div>
              </div>
            ) : (
              items.filter(t => !t.done).map(task => (
                <div key={task.id} className="row" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--surface2)', borderRadius: '9px' }}>
                  <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: getPriorityBadgeColor(task.priority) }} />
                  <span style={{ flex: 1, color: 'var(--t1)', fontSize: '13px' }}>{task.title}</span>
                  <button className="btn btn-ghost" onClick={() => deleteTask(task.id)} style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--red)' }}>
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'all' && (
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px' }}>
                <div className="es-icon">◉</div>
                <div className="es-title">{L('No tasks yet', 'لا توجد مهام بعد')}</div>
              </div>
            ) : (
              items.map(task => (
                <div key={task.id} className="row" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: 'var(--surface2)', borderRadius: '9px', opacity: task.done ? 0.6 : 1 }}>
                  <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: getPriorityBadgeColor(task.priority) }} />
                  <span style={{ flex: 1, color: 'var(--t1)', fontSize: '13px', textDecoration: task.done ? 'line-through' : 'none' }}>{task.title}</span>
                  <button className="btn btn-ghost" onClick={() => deleteTask(task.id)} style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--red)' }}>
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'kanban' && (
        <div className="kanban" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {kanbanColumns.map(col => {
            const colTasks = items.filter(col.filter);
            return (
              <div key={col.key} className="kanban-col" style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '12px', padding: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--t1)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{col.label}</span>
                  <span style={{ background: 'var(--surface2)', borderRadius: '6px', padding: '1px 6px', fontSize: '11px' }}>{colTasks.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '300px' }}>
                  {colTasks.map(task => (
                    <div key={task.id} style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '9px', padding: '10px', cursor: 'pointer' }}>
                      <div style={{ fontSize: '12.5px', color: 'var(--t1)', marginBottom: '8px', textDecoration: task.done ? 'line-through' : 'none' }}>{task.title}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: getPriorityBadgeColor(task.priority) }} />
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} />
                          <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: '11px', cursor: 'pointer' }}>✕</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
