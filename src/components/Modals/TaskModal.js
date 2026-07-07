'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function TaskModal() {
  const {
    lang,
    L,
    t,
    taskModalOpen,
    setTaskModalOpen,
    addTask,
    taskToEdit,
    setTaskToEdit,
    updateTask
  } = useBusiness();

  const { user: currentUser, userData } = useAuth();
  const ownerUid = userData?.ownerUid || currentUser?.uid || '';

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('medium');
  const [due, setDue] = useState('');
  const [category, setCategory] = useState('General');
  const [assignee, setAssignee] = useState('');
  const [members, setMembers] = useState([]);

  // Fetch team members dynamically
  useEffect(() => {
    if (!ownerUid) return;
    const q = query(collection(db, 'users'), where('adminId', '==', ownerUid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({
        uid: d.id,
        name: d.data().name || d.data().email || 'Team Member'
      }));
      setMembers(list);
    });
    return unsubscribe;
  }, [ownerUid]);

  const selectOptions = [
    { uid: ownerUid, name: L('Myself (Owner)', 'نفسي (المالك)') },
    ...members
  ];

  // Sync state when editing a task
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDesc(taskToEdit.desc || '');
      setPriority(taskToEdit.priority || 'medium');
      setDue(taskToEdit.due || '');
      setCategory(taskToEdit.category || 'General');
      
      const foundOption = selectOptions.find(opt => opt.name === taskToEdit.assignee);
      setAssignee(foundOption ? foundOption.uid : '');
    } else {
      setTitle('');
      setDesc('');
      setPriority('medium');
      setDue('');
      setCategory('General');
      setAssignee('');
    }
  }, [taskToEdit, taskModalOpen]);

  if (!taskModalOpen) return null;

  const handleClose = () => {
    setTitle('');
    setDesc('');
    setPriority('medium');
    setDue('');
    setCategory('General');
    setAssignee('');
    setTaskToEdit(null);
    setTaskModalOpen(false);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert(L('Please enter a task title', 'يرجى إدخال عنوان المهمة'));
      return;
    }

    const assignedName = assignee === ownerUid 
      ? (userData?.name || currentUser?.displayName || currentUser?.email || 'Owner')
      : (members.find(m => m.uid === assignee)?.name || '');

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title,
        desc,
        priority,
        due,
        category,
        assignee: assignedName
      });
    } else {
      addTask(title, priority, desc, due, category, assignedName);
    }

    handleClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-box" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-close" onClick={handleClose}>✕</div>
        <div style={{ padding: '22px' }}>
          <div style={{ fontFamily: 'var(--ff)', fontSize: '16px', fontWeight: 800, marginBottom: '16px', color: 'var(--t1)' }}>
            {taskToEdit ? `✏️ ${L('Edit Task', 'تعديل المهمة')}` : `➕ ${L('Add New Task', 'إضافة مهمة جديدة')}`}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            <div>
              <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                {L('Task Title *', 'عنوان المهمة *')}
              </label>
              <input
                className="inp"
                id="task-title"
                placeholder={L('e.g. Write business proposal', 'مثال: كتابة عرض العمل')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                {L('Description', 'الوصف والتفاصيل')}
              </label>
              <textarea
                className="inp"
                id="task-desc"
                rows="2"
                placeholder={L('Add task description...', 'أدخل تفاصيل المهمة...')}
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
                  <option value="high">🔴 {L('High Priority', 'عاجلة وعالية')}</option>
                  <option value="medium">🟡 {L('Medium Priority', 'متوسطة')}</option>
                  <option value="low">🟢 {L('Low Priority', 'منخفضة والمؤجلات')}</option>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Category', 'الفئة والمجال')}
                </label>
                <select
                  className="inp"
                  id="task-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="General">💼 General (عام)</option>
                  <option value="Sales / CRM">🤝 Sales / CRM (مبيعات)</option>
                  <option value="Content">📝 Content (محتوى)</option>
                  <option value="Marketing">📣 Marketing (تسويق)</option>
                  <option value="Finance">💳 Finance (مالية)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Assignee', 'المسؤول المكلف')}
                </label>
                <select
                  className="inp"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                >
                  <option value="">{L('Unassigned', 'غير مكلف لأحد')}</option>
                  {selectOptions.map(opt => (
                    <option key={opt.uid} value={opt.uid}>{opt.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button id="btn-save-task" className="btn btn-prime" onClick={handleSave} style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
              {taskToEdit ? L('Save Changes', 'حفظ التعديلات') : L('Save & Create Task', 'حفظ وإنشاء المهمة')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
