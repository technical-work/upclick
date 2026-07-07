'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import CustomSelect from '../CustomSelect';

export default function LeadModal() {
  const {
    lang,
    L,
    t,
    leadModalOpen,
    setLeadModalOpen,
    leadModalStage,
    editingLead,
    setEditingLead,
    addLead,
    updateLead,
    GC
  } = useBusiness();

  const defaultStages = React.useMemo(() => [
    { key: 'new', label: L('New Lead', 'ليد جديد') },
    { key: 'contacted', label: L('Contacted', 'تم التواصل') },
    { key: 'qualified', label: L('Qualified', 'مؤهل') },
    { key: 'proposal', label: L('Proposal Sent', 'تم إرسال العرض') },
    { key: 'closed', label: L('Closed Won', 'صفقة ناجحة') },
    { key: 'lost', label: L('Lost', 'صفقة خاسرة') }
  ], [lang]);

  const workspaces = GC.crm?.workspaces || [];
  const activeWsId = GC.crm?.activeWorkspaceId || 'default';
  const activeWs = workspaces.find(w => w.id === activeWsId) || workspaces[0];
  const stages = React.useMemo(() => activeWs?.stages || defaultStages, [activeWs, defaultStages]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState('new');
  const [value, setValue] = useState('');
  const [source, setSource] = useState('Instagram DM');
  const [notes, setNotes] = useState('');
  const [followupDate, setFollowupDate] = useState('');

  useEffect(() => {
    if (leadModalOpen) {
      if (editingLead) {
        setName(editingLead.name || '');
        setPhone(editingLead.phone || '');
        setEmail(editingLead.email || '');
        setStage(editingLead.stage || (stages.length > 0 ? stages[0].key : 'new'));
        setValue(editingLead.value || '');
        setSource(editingLead.source || 'Instagram DM');
        setNotes(editingLead.notes || '');
        setFollowupDate(editingLead.followupDate || '');
      } else {
        setName('');
        setPhone('');
        setEmail('');
        setStage(leadModalStage || (stages.length > 0 ? stages[0].key : 'new'));
        setValue('');
        setSource('Instagram DM');
        setNotes('');
        setFollowupDate('');
      }
    }
  }, [leadModalOpen, leadModalStage, editingLead, stages]);

  if (!leadModalOpen) return null;

  const handleSave = () => {
    if (!name.trim()) {
      alert(L('Please enter a name', 'يرجى إدخال الاسم'));
      return;
    }
    
    const leadData = {
      name,
      phone,
      email,
      stage,
      value,
      source,
      notes,
      followupDate
    };

    if (editingLead) {
      updateLead(editingLead.id, leadData);
    } else {
      addLead(leadData);
    }

    handleClose();
  };

  const handleClose = () => {
    setLeadModalOpen(false);
    setTimeout(() => {
      setEditingLead(null);
    }, 200);
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-box" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-close" onClick={handleClose}>
          ✕
        </div>
        <div style={{ padding: '22px' }}>
          <div style={{ fontFamily: 'var(--ff)', fontSize: '16px', fontWeight: 800, color: 'var(--t1)', marginBottom: '16px' }}>
            {editingLead ? t('Edit Lead') : t('Add New Lead')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Full Name *', 'الاسم الكامل *')}
                </label>
                <input
                  className="inp"
                  id="lead-name"
                  placeholder="Ahmed Mohamed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Phone / Telegram', 'الهاتف / تليجرام')}
                </label>
                <input
                  className="inp"
                  id="lead-phone"
                  placeholder="+966..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                {L('Email', 'البريد الإلكتروني')}
              </label>
              <input
                className="inp"
                id="lead-email"
                placeholder="ahmed@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Pipeline Stage', 'المرحلة')}
                </label>
                <select
                  className="inp"
                  id="lead-stage"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                >
                  {stages.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Deal Value ($)', 'قيمة الصفقة ($)')}
                </label>
                <input
                  className="inp"
                  id="lead-value"
                  placeholder="2500"
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                {L('Source', 'المصدر')}
              </label>
              <CustomSelect
                className="inp"
                id="lead-source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              >
                <option value="Instagram DM">Instagram DM</option>
                <option value="Referral">Referral</option>
                <option value="Website">Website</option>
                <option value="Telegram">Telegram</option>
                <option value="Other">Other</option>
              </CustomSelect>
            </div>
            <div>
              <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                {L('Notes', 'ملاحظات')}
              </label>
              <textarea
                className="inp"
                id="lead-notes"
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>
            <div>
              <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                {L('Follow-up Date', 'تاريخ المتابعة')}
              </label>
              <input
                className="inp"
                id="lead-followup"
                type="date"
                value={followupDate}
                onChange={(e) => setFollowupDate(e.target.value)}
                onClick={(e) => { try { e.target.showPicker(); } catch (err) {} }}
              />
            </div>
            <button id="btn-save-lead" className="btn btn-prime" onClick={handleSave} style={{ width: '100%', justifyContent: 'center' }}>
              {L('Save Lead', 'حفظ العميل')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
