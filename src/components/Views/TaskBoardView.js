'use client';

import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { useAuth } from '../../context/AuthContext';
import { callClaudeAPI } from '../../utils/ai';
import { parseMarkdown } from '../../utils/markdown';

const filterByDateRange = (itemDate, rangeType, customStart, customEnd) => {
  if (!itemDate) return rangeType === 'all';
  const date = new Date(itemDate);
  if (isNaN(date.getTime())) return rangeType === 'all';

  const now = new Date();

  switch (rangeType) {
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

export default function TaskBoardView() {
  const { 
    lang, 
    L, 
    t, 
    GC, 
    saveGC, 
    toggleTask, 
    deleteTask, 
    setTaskModalOpen, 
    isTeamMember 
  } = useBusiness();
  
  const { userData, user: currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('today');
  const [aiPrioritized, setAiPrioritized] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [draggedOverCol, setDraggedOverCol] = useState(null);
  const [showMyTasks, setShowMyTasks] = useState(isTeamMember);
  const [expandedTaskDesc, setExpandedTaskDesc] = useState({});

  // Date Filtering states
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const memberName = isTeamMember ? (userData?.name || currentUser?.displayName || currentUser?.email || '') : '';

  const handleDragOver = (e, colKey) => {
    e.preventDefault();
    setDraggedOverCol(colKey);
  };

  const handleDragLeave = () => {
    setDraggedOverCol(null);
  };

  const handleDrop = (e, colKey) => {
    setDraggedOverCol(null);
    const taskIdStr = e.dataTransfer.getData('text/plain');
    const taskId = parseInt(taskIdStr);
    if (isNaN(taskId)) return;

    const task = items.find(t => t.id === taskId);
    if (!task) return;

    let updatedTask = { ...task };
    if (colKey === 'done') {
      updatedTask.done = true;
    } else {
      updatedTask.done = false;
      if (colKey === 'todo') {
        updatedTask.priority = 'high';
      } else if (colKey === 'in-progress') {
        updatedTask.priority = 'medium';
      } else if (colKey === 'backlog') {
        updatedTask.priority = 'low';
      }
    }

    // Update inside GC database
    const updatedItems = (GC.tasks.items || []).map(t => t.id === taskId ? updatedTask : t);
    
    // If it's a team task (stored in GC.team.tasks), update it there
    let updatedTeamTasks = GC.team?.tasks || [];
    if (task.isTeamTask) {
      updatedTeamTasks = (GC.team?.tasks || []).map(t => t.id === taskId ? { ...t, done: updatedTask.done, priority: updatedTask.priority } : t);
    }

    saveGC({
      ...GC,
      tasks: {
        ...(GC.tasks || {}),
        items: updatedItems
      },
      team: {
        ...(GC.team || {}),
        tasks: updatedTeamTasks
      }
    });
  };

  // Compute Task Stats — include both GC.tasks.items and GC.team.tasks
  const allItems = [
    ...(GC.tasks?.items || []),
    ...(GC.team?.tasks || []).map(tk => ({ 
      ...tk, 
      id: tk.id || Date.now() + Math.random(),
      title: tk.title, 
      desc: tk.desc || tk.description || '',
      priority: tk.priority || 'medium', 
      done: tk.done || false, 
      due: tk.due || tk.dueDate || '', 
      category: tk.category || 'General',
      assignee: tk.assignee || '', 
      isTeamTask: true 
    }))
  ];

  // Apply Date Range Filter first
  const dateFilteredItems = allItems.filter(t => {
    const taskDate = t.due || t.dueDate || t.created || t.createdAt || '';
    return filterByDateRange(taskDate, filterPeriod, customStartDate, customEndDate);
  });
  
  // Filter by member name if showMyTasks is active
  const items = showMyTasks && memberName 
    ? dateFilteredItems.filter(t => t.assignee && t.assignee.toLowerCase() === memberName.toLowerCase()) 
    : dateFilteredItems;
  
  const totalTasks = items.length;
  const highPriority = items.filter(t => !t.done && t.priority === 'high').length;
  const completedToday = items.filter(t => t.done).length;
  const overdueTasks = items.filter(t => {
    if (t.done) return false;
    const taskDue = t.due || t.dueDate;
    if (!taskDue) return false;
    return new Date(taskDue) < new Date(new Date().setHours(0, 0, 0, 0));
  }).length;

  const runAIPrioritization = async () => {
    setAiLoading(true);
    setAiPrioritized('');
    
    const taskListText = items
      .filter(t => !t.done)
      .map((t, i) => `${i + 1}. [${t.priority.toUpperCase()}] ${t.title} ${t.desc ? `(${t.desc})` : ''} - Due: ${t.due || 'None'}`)
      .join('\n');
      
    const prompt = `Prioritize the following business task list for an entrepreneur. 
Business Niche: "${GC.profile?.niche || 'Digital Creator'}", Stage: "${GC.profile?.stage || 'Growth'}".

Active Uncompleted Tasks:
${taskListText || 'No active tasks added yet.'}

Give me the top 3 critical tasks I must focus on today to make immediate progress, and a brief explanation of why. Respond in a highly motivating and concise bulleted structure.`;

    const system = `You are an elite productivity strategist and time-management coach. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;
    
    try {
      const res = await callClaudeAPI(prompt, system, lang, GC);
      setAiPrioritized(res);
    } catch (e) {
      setAiPrioritized(L('Error generating AI prioritization.', 'حدث خطأ أثناء ترتيب الأولويات بالذكاء الاصطناعي.'));
    } finally {
      setAiLoading(false);
    }
  };

  const getPriorityColor = (p) => {
    if (p === 'high') return 'var(--red)';
    if (p === 'medium') return 'var(--amber)';
    return 'var(--green)';
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Sales / CRM': return 'rgba(16, 185, 129, 0.15)'; // green
      case 'Content': return 'rgba(59, 130, 246, 0.15)'; // blue
      case 'Marketing': return 'rgba(249, 115, 22, 0.15)'; // orange
      case 'Finance': return 'rgba(139, 92, 246, 0.15)'; // purple
      default: return 'var(--surface3)';
    }
  };

  const getCategoryTextColor = (cat) => {
    switch (cat) {
      case 'Sales / CRM': return '#10b981';
      case 'Content': return '#3b82f6';
      case 'Marketing': return 'var(--orange)';
      case 'Finance': return '#8b5cf6';
      default: return 'var(--t2)';
    }
  };

  // Render Kanban Board Columns
  const kanbanColumns = [
    { key: 'todo', label: L('To Do (High)', 'عاجلة وهامة'), filter: t => !t.done && t.priority === 'high', icon: '🔴' },
    { key: 'in-progress', label: L('In Progress (Med)', 'قيد التنفيذ'), filter: t => !t.done && t.priority === 'medium', icon: '🟡' },
    { key: 'backlog', label: L('Backlog (Low)', 'مؤجلات ومنخفضة'), filter: t => !t.done && t.priority === 'low', icon: '🟢' },
    { key: 'done', label: L('Completed', 'المنجزة والمكتملة'), filter: t => t.done, icon: '✅' }
  ];

  const toggleDesc = (id) => {
    setExpandedTaskDesc(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Render Task Item Row (For Today & All tabs)
  const renderTaskRow = (task) => {
    const isOverdue = !task.done && task.due && new Date(task.due) < new Date(new Date().setHours(0,0,0,0));
    const hasDesc = !!task.desc;
    const isExpanded = !!expandedTaskDesc[task.id];
    
    return (
      <div 
        key={task.id} 
        style={{ 
          background: 'var(--surface2)', 
          borderRadius: '12px', 
          border: '1px solid var(--edge2)', 
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          opacity: task.done ? 0.65 : 1,
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Complete Checkbox */}
          <input 
            type="checkbox" 
            checked={task.done} 
            onChange={() => toggleTask(task.id)} 
            style={{ width: '18px', height: '18px', cursor: 'pointer', borderRadius: '4px', accentColor: 'var(--orange)' }} 
          />
          
          {/* Priority Bullet */}
          <span 
            style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: getPriorityColor(task.priority),
              boxShadow: `0 0 8px ${getPriorityColor(task.priority)}`
            }} 
          />

          {/* Title & Toggle */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <span 
              onClick={() => hasDesc && toggleDesc(task.id)}
              style={{ 
                color: 'var(--t1)', 
                fontSize: '13.5px', 
                fontWeight: 600, 
                textDecoration: task.done ? 'line-through' : 'none',
                cursor: hasDesc ? 'pointer' : 'default',
                display: 'block'
              }}
            >
              {task.title} {hasDesc && <small style={{ color: 'var(--orange)', fontSize: '10.5px', marginInlineStart: '6px' }}>{isExpanded ? `▲ ${L('Hide', 'إخفاء')}` : `▼ ${L('Details', 'التفاصيل')}`}</small>}
            </span>
          </div>

          {/* Category Badge */}
          {task.category && (
            <span className="badge" style={{ 
              background: getCategoryColor(task.category), 
              color: getCategoryTextColor(task.category),
              fontSize: '10px',
              padding: '2px 8px',
              fontWeight: 600
            }}>
              {task.category}
            </span>
          )}

          {/* Assignee Badge */}
          {task.assignee && (
            <span className="badge" style={{ background: 'var(--surface3)', color: 'var(--t2)', fontSize: '10.5px' }}>
              👤 {task.assignee}
            </span>
          )}

          {/* Due Date */}
          {task.due && (
            <span className="badge" style={{ 
              background: isOverdue ? 'rgba(239, 68, 68, 0.15)' : 'var(--surface3)', 
              color: isOverdue ? 'var(--red)' : 'var(--t3)',
              fontSize: '10.5px',
              fontWeight: isOverdue ? 'bold' : 'normal'
            }}>
              📅 {task.due}
            </span>
          )}

          {/* Delete Button */}
          <button 
            className="btn btn-ghost" 
            onClick={() => deleteTask(task.id)} 
            style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--red)', minWidth: 'auto' }}
          >
            ✕
          </button>
        </div>

        {/* Expanded Description */}
        {hasDesc && isExpanded && (
          <div style={{ 
            fontSize: '12px', 
            color: 'var(--t3)', 
            background: 'var(--surface3)', 
            padding: '8px 12px', 
            borderRadius: '6px', 
            lineHeight: 1.4,
            borderLeft: '2px solid var(--orange)'
          }}>
            {task.desc}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pg on" id="pg-tasks">
      <div className="pg-header" style={{ marginBottom: '14px' }}>
        <div className="pg-title">
          <span className="pg-icon">📋</span>
          <span>{t('Task Board')}</span>
        </div>
        <div className="pg-actions">
          <button 
            className="btn btn-ai" 
            style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(244,63,94,0.15) 100%)', border: '1px solid var(--orange)', color: 'var(--orange)' }}
            onClick={runAIPrioritization} 
            disabled={aiLoading}
          >
            {aiLoading ? `⏱️ ${L('Analyzing Tasks...', 'تحليل المهام...')}` : `⚡ ${L('AI Prioritizer', 'ترتيب الأولويات بالـ AI')}`}
          </button>
          <button 
            className="btn btn-prime" 
            style={{ background: 'linear-gradient(135deg, var(--orange) 0%, #f43f5e 100%)', border: 'none' }}
            onClick={() => setTaskModalOpen(true)}
          >
            ➕ {L('New Task', 'مهمة جديدة')}
          </button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div className="stat-card" style={{ background: 'var(--surface2)', border: '1px solid var(--edge2)', borderRadius: '12px', padding: '16px' }}>
          <div className="stat-lbl" style={{ color: 'var(--t3)', fontSize: '11px', fontWeight: 600 }}>📋 {L('Total Tasks', 'إجمالي المهام')}</div>
          <div className="stat-val" style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>{totalTasks}</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--surface2)', border: '1px solid var(--edge2)', borderRadius: '12px', padding: '16px' }}>
          <div className="stat-lbl" style={{ color: 'var(--t3)', fontSize: '11px', fontWeight: 600 }}>🔥 {L('High Priority', 'عاجلة')}</div>
          <div className="stat-val" style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: 'var(--red)' }}>{highPriority}</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--surface2)', border: '1px solid var(--edge2)', borderRadius: '12px', padding: '16px' }}>
          <div className="stat-lbl" style={{ color: 'var(--t3)', fontSize: '11px', fontWeight: 600 }}>✅ {L('Completed', 'مكتملة')}</div>
          <div className="stat-val" style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: 'var(--green)' }}>{completedToday}</div>
        </div>
        <div className="stat-card" style={{ background: 'var(--surface2)', border: '1px solid var(--edge2)', borderRadius: '12px', padding: '16px' }}>
          <div className="stat-lbl" style={{ color: 'var(--t3)', fontSize: '11px', fontWeight: 600 }}>⏰ {L('Overdue', 'متأخرة')}</div>
          <div className="stat-val" style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px', color: overdueTasks > 0 ? 'var(--red)' : 'var(--t1)' }}>{overdueTasks}</div>
        </div>
      </div>

      {/* AI Prioritization advice panel */}
      {aiPrioritized && (
        <div className="card mb" style={{ border: '1px solid var(--orange)', background: 'rgba(249, 115, 22, 0.04)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', color: 'var(--t1)', lineHeight: 1.6 }}>
            <strong>⚡ {L('AI Prioritized Focus Today:', 'تركيز الذكاء الاصطناعي اليوم:')}</strong>
            <div 
              style={{ marginTop: '10px' }}
              dangerouslySetInnerHTML={{ __html: parseMarkdown(aiPrioritized) }}
            />
          </div>
        </div>
      )}

      {/* SEGMENTED TAB NAVIGATION & PERIOD FILTERS */}
      <div style={{ 
        marginBottom: '20px', 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '12px', 
        background: 'var(--surface2)', 
        padding: '8px 12px', 
        borderRadius: '12px', 
        border: '1px solid var(--edge2)',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <button 
            style={{
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'today' ? 'var(--orange)' : 'transparent',
              color: activeTab === 'today' ? '#fff' : 'var(--t2)',
              transition: 'all 0.2s ease'
            }} 
            onClick={() => setActiveTab('today')}
          >
            {L('Today Focus', 'تركيز اليوم')}
          </button>
          <button 
            style={{
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'all' ? 'var(--orange)' : 'transparent',
              color: activeTab === 'all' ? '#fff' : 'var(--t2)',
              transition: 'all 0.2s ease'
            }} 
            onClick={() => setActiveTab('all')}
          >
            {L('All Tasks', 'جميع المهام')}
          </button>
          <button 
            style={{
              padding: '8px 16px',
              fontSize: '12.5px',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'kanban' ? 'var(--orange)' : 'transparent',
              color: activeTab === 'kanban' ? '#fff' : 'var(--t2)',
              transition: 'all 0.2s ease'
            }} 
            onClick={() => setActiveTab('kanban')}
          >
            {L('Kanban Board', 'لوحة كانبان')}
          </button>
        </div>

        {/* Filters Group */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          {/* Period Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px' }}>📅</span>
            <select
              className="inp"
              style={{ padding: '4px 8px', fontSize: '12px', width: 'auto', minWidth: '110px', height: '32px', borderRadius: '8px' }}
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
            >
              <option value="all">{L('All Time', 'كل الأوقات')}</option>
              <option value="year">{L('This Year', 'هذا العام')}</option>
              <option value="month">{L('This Month', 'هذا الشهر')}</option>
              <option value="last30">{L('Last 30 Days', 'آخر ٣٠ يوم')}</option>
              <option value="week">{L('This Week', 'هذا الأسبوع')}</option>
              <option value="custom">{L('Custom Range', 'نطاق مخصص')}</option>
            </select>
          </div>

          {/* Custom Date Range Inputs */}
          {filterPeriod === 'custom' && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
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

          {/* Assignee filter switch */}
          {(isTeamMember || (GC.team?.members || []).length > 0) && (
            <button
              style={{
                padding: '6px 12px',
                fontSize: '11.5px',
                fontWeight: 600,
                borderRadius: '8px',
                border: '1px solid var(--edge2)',
                background: 'var(--surface3)',
                color: 'var(--t2)',
                cursor: 'pointer',
                height: '32px',
                display: 'flex',
                alignItems: 'center'
              }}
              onClick={() => setShowMyTasks(!showMyTasks)}
            >
              {showMyTasks ? L('👤 My Tasks', '👤 مهامي') : L('👥 All Tasks', '👥 كل المهام')}
            </button>
          )}
        </div>
      </div>

      {/* TODAY FOCUS PANEL */}
      {activeTab === 'today' && (
        <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.filter(t => !t.done).length === 0 ? (
              <div className="empty-state" style={{ padding: '40px', textAlign: 'center' }}>
                <div className="es-icon" style={{ fontSize: '36px' }}>🎉</div>
                <div className="es-title" style={{ fontWeight: 'bold', margin: '8px 0', color: 'var(--t1)' }}>{L('All caught up!', 'أكملت جميع المهام اليوم!')}</div>
                <div className="es-sub" style={{ color: 'var(--t3)', fontSize: '12.5px' }}>{L('No active tasks scheduled. Enjoy your progress!', 'لا توجد مهام نشطة متبقية لليوم.')}</div>
              </div>
            ) : (
              items.filter(t => !t.done).map(task => renderTaskRow(task))
            )}
          </div>
        </div>
      )}

      {/* ALL TASKS PANEL */}
      {activeTab === 'all' && (
        <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {items.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px', textAlign: 'center' }}>
                <div className="es-icon" style={{ fontSize: '36px' }}>📋</div>
                <div className="es-title" style={{ fontWeight: 'bold', margin: '8px 0', color: 'var(--t1)' }}>{L('No tasks yet', 'لا توجد مهام بعد')}</div>
                <div className="es-sub" style={{ color: 'var(--t3)', fontSize: '12.5px' }}>{L('Add your first task in the dashboard to start tracking.', 'أضف مهمتك الأولى بالأعلى لبدء التتبع.')}</div>
              </div>
            ) : (
              items.map(task => renderTaskRow(task))
            )}
          </div>
        </div>
      )}

      {/* KANBAN BOARD BOARD */}
      {activeTab === 'kanban' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px', alignItems: 'start' }}>
          {kanbanColumns.map(col => {
            const colTasks = items.filter(col.filter);
            return (
              <div 
                key={col.key} 
                className="kanban-col" 
                style={{ 
                  background: draggedOverCol === col.key ? 'rgba(249, 115, 22, 0.06)' : 'var(--surface2)', 
                  border: draggedOverCol === col.key ? '2px dashed var(--orange)' : '1px solid var(--edge2)', 
                  borderRadius: '12px', 
                  padding: '14px',
                  transition: 'background-color 0.2s, border-color 0.2s',
                  minHeight: '450px'
                }}
                onDragOver={(e) => handleDragOver(e, col.key)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.key)}
              >
                {/* Column Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--edge2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold', color: 'var(--t1)' }}>
                    <span>{col.icon}</span>
                    <span>{col.label}</span>
                  </div>
                  <span style={{ background: 'var(--surface3)', borderRadius: '6px', padding: '1px 6px', fontSize: '11px', color: 'var(--t2)', fontWeight: 600 }}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '380px' }}>
                  {colTasks.map(task => {
                    const isOverdue = !task.done && task.due && new Date(task.due) < new Date(new Date().setHours(0,0,0,0));
                    
                    return (
                      <div 
                        key={task.id} 
                        draggable="true"
                        onDragStart={(e) => e.dataTransfer.setData('text/plain', String(task.id))}
                        onDragOver={(e) => e.stopPropagation()}
                        style={{ 
                          background: 'var(--surface)', 
                          border: '1px solid var(--edge2)', 
                          borderRadius: '10px', 
                          padding: '12px', 
                          cursor: 'grab',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                          transition: 'transform 0.1s ease'
                        }}
                      >
                        <div style={{ fontSize: '13px', color: 'var(--t1)', fontWeight: 600, textDecoration: task.done ? 'line-through' : 'none', lineHeight: 1.4 }}>
                          {task.title}
                        </div>

                        {task.desc && (
                          <div style={{ fontSize: '11.5px', color: 'var(--t3)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                            {task.desc}
                          </div>
                        )}

                        {/* Category & Priority Badge Row */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: getPriorityColor(task.priority), display: 'inline-block' }} />
                          
                          {task.category && (
                            <span style={{ 
                              background: getCategoryColor(task.category), 
                              color: getCategoryTextColor(task.category), 
                              fontSize: '9.5px', 
                              padding: '1px 6px', 
                              borderRadius: '4px',
                              fontWeight: 600
                            }}>
                              {task.category}
                            </span>
                          )}
                        </div>

                        {/* Footer details row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--edge2)', paddingTop: '8px', marginTop: '4px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {task.assignee && (
                              <span style={{ fontSize: '10px', color: 'var(--t2)' }}>
                                👤 {task.assignee}
                              </span>
                            )}
                            {task.due && (
                              <span style={{ fontSize: '10px', color: isOverdue ? 'var(--red)' : 'var(--t3)', fontWeight: isOverdue ? 'bold' : 'normal' }}>
                                📅 {task.due}
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <input 
                              type="checkbox" 
                              checked={task.done} 
                              onChange={() => toggleTask(task.id)} 
                              style={{ width: '15px', height: '15px', cursor: 'pointer' }} 
                            />
                            <button 
                              onClick={() => deleteTask(task.id)} 
                              style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: '12px', cursor: 'pointer', padding: '2px' }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                  {colTasks.length === 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', border: '2px dashed var(--edge2)', borderRadius: '10px', color: 'var(--t3)', fontSize: '11px' }}>
                      {L('Drop tasks here', 'اسحب المهام إلى هنا')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
