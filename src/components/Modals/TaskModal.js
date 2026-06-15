'use client';

import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';

export default function TaskModal() {
  const {
    lang,
    L,
    t,
    taskModalOpen,
    setTaskModalOpen,
    addTask
  } = useBusiness();

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('medium');
  const [due, setDue] = useState('');
  const [category, setCategory] = useState('General');

  if (!taskModalOpen) return null;

  const handleSave = () => {
    if (!title.trim()) {
      alert(L('Please enter a task title', 'يرجى إدخال عنوان المهمة'));
      return;
    }
    addTask(title, priority);
    // Clear inputs and close
    setTitle('');
    setDesc('');
    setPriority('medium');
    setDue('');
    setCategory('General');
    setTaskModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setTaskModalOpen(false)}>
      <div className="modal-box" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-close" onClick={() => setTaskModalOpen(false)}>
          ✕
        </div>
        <div style={{ padding: '22px' }}>
          <div style={{ fontFamily: 'var(--ff)', fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>
            {t('Add New Task')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            <div>
              <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                {L('Task Title *', 'عنوان المهمة *')}
              </label>
              <input
                className="inp"
                id="task-title"
                placeholder="Write proposal..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                {L('Description', 'الوصف')}
              </label>
              <textarea
                className="inp"
                id="task-desc"
                rows="2"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              ></textarea>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Priority', 'الأولوية')}
                </label>
                <select
                  className="inp"
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="high">🔴 {L('High', 'عالية')}</option>
                  <option value="medium">🟡 {L('Medium', 'متوسطة')}</option>
                  <option value="low">🟢 {L('Low', 'منخفضة')}</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Due Date', 'تاريخ الاستحقاق')}
                </label>
                <input
                  className="inp"
                  id="task-due"
                  type={due ? "date" : "text"}
                  placeholder="dd/mm/yyyy"
                  onFocus={(e) => e.target.type = 'date'}
                  onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                {L('Category', 'الفئة')}
              </label>
              <select
                className="inp"
                id="task-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>General</option>
                <option>Sales / CRM</option>
                <option>Content</option>
                <option>Marketing</option>
                <option>Finance</option>
              </select>
            </div>
            <button className="btn btn-prime" onClick={handleSave} style={{ width: '100%', justifyContent: 'center' }}>
              {L('Add Task', 'إضافة المهمة')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
