'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';

export default function LeadModal() {
  const {
    lang,
    L,
    t,
    leadModalOpen,
    setLeadModalOpen,
    leadModalStage,
    addLead
  } = useBusiness();

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
      setStage(leadModalStage || 'new');
    }
  }, [leadModalOpen, leadModalStage]);

  if (!leadModalOpen) return null;

  const handleSave = () => {
    if (!name.trim()) {
      alert(L('Please enter a name', 'يرجى إدخال الاسم'));
      return;
    }
    addLead({
      name,
      phone,
      email,
      stage,
      value,
      source,
      notes,
      followupDate
    });
    // Clear inputs and close
    setName('');
    setPhone('');
    setEmail('');
    setStage('new');
    setValue('');
    setNotes('');
    setFollowupDate('');
    setLeadModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setLeadModalOpen(false)}>
      <div className="modal-box" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-close" onClick={() => setLeadModalOpen(false)}>
          ✕
        </div>
        <div style={{ padding: '22px' }}>
          <div style={{ fontFamily: 'var(--ff)', fontSize: '16px', fontWeight: 800, color: 'var(--t1)', marginBottom: '16px' }}>
            {t('Add New Lead')}
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
                  {L('Phone / WhatsApp', 'الهاتف / واتساب')}
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
                  <option value="new">🆕 {L('New Lead', 'عميل جديد')}</option>
                  <option value="contacted">📞 {L('Contacted', 'تم التواصل')}</option>
                  <option value="qualified">✅ {L('Qualified', 'مؤهل')}</option>
                  <option value="proposal">📋 {L('Proposal Sent', 'تم إرسال العرض')}</option>
                  <option value="closed">🏆 {L('Closed Won', 'صفقة ناجحة')}</option>
                  <option value="lost">❌ {L('Lost', 'صفقة خاسرة')}</option>
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
              <select
                className="inp"
                id="lead-source"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              >
                <option>Instagram DM</option>
                <option>Referral</option>
                <option>Website</option>
                <option>WhatsApp</option>
                <option>Other</option>
              </select>
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
              />
            </div>
            <button className="btn btn-prime" onClick={handleSave} style={{ width: '100%', justifyContent: 'center' }}>
              {L('Save Lead', 'حفظ العميل')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
