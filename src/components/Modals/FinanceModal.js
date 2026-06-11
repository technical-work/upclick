'use client';

import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';

export default function FinanceModal() {
  const {
    lang,
    L,
    t,
    financeModalOpen,
    setFinanceModalOpen,
    financeModalType,
    addFinanceEntry
  } = useBusiness();

  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');

  if (!financeModalOpen) return null;

  const handleSave = () => {
    if (!desc.trim()) {
      alert(L('Please enter a description', 'يرجى إدخال الوصف'));
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      alert(L('Please enter a valid amount', 'يرجى إدخال مبلغ صالح'));
      return;
    }

    // Determine default category if not selected
    let selectedCat = category;
    if (!selectedCat) {
      selectedCat = financeModalType === 'income' ? 'Coaching / Services' : 'Tools & Software';
    }

    addFinanceEntry(financeModalType, amount, desc, selectedCat);

    // Reset and close
    setDesc('');
    setAmount('');
    setDate('');
    setCategory('');
    setFinanceModalOpen(false);
  };

  const isIncome = financeModalType === 'income';

  return (
    <div className="modal-overlay" onClick={() => setFinanceModalOpen(false)}>
      <div className="modal-box" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-close" onClick={() => setFinanceModalOpen(false)}>
          ✕
        </div>
        <div style={{ padding: '22px' }}>
          <div style={{ fontFamily: 'var(--ff)', fontSize: '16px', fontWeight: 800, marginBottom: '16px' }} id="fin-modal-title">
            {isIncome ? t('Add Income') : t('Add Expense')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
            <div>
              <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                {L('Description *', 'الوصف *')}
              </label>
              <input
                className="inp"
                id="fin-desc"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder={isIncome ? L('Coaching program...', 'برنامج كوتشينج...') : L('Notion software subscription...', 'اشتراك برنامج Notion...')}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Amount ($) *', 'المبلغ ($) *')}
                </label>
                <input
                  className="inp"
                  id="fin-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Date', 'التاريخ')}
                </label>
                <input
                  className="inp"
                  id="fin-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                {L('Category', 'الفئة')}
              </label>
              {isIncome ? (
                <select
                  className="inp"
                  id="fin-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Coaching / Services">{L('Coaching / Services', 'كوتشينج / خدمات')}</option>
                  <option value="Course / Product">{L('Course / Product', 'كورس / منتج')}</option>
                  <option value="Consulting">{L('Consulting', 'استشارات')}</option>
                  <option value="Other">{L('Other', 'أخرى')}</option>
                </select>
              ) : (
                <select
                  className="inp"
                  id="fin-expense-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Tools & Software">{L('Tools & Software', 'أدوات وبرمجيات')}</option>
                  <option value="Marketing / Ads">{L('Marketing / Ads', 'تسويق / إعلانات')}</option>
                  <option value="Team">{L('Team', 'فريق العمل')}</option>
                  <option value="Other">{L('Other', 'أخرى')}</option>
                </select>
              )}
            </div>
            <button className="btn btn-prime" onClick={handleSave} style={{ width: '100%', justifyContent: 'center' }} id="fin-save-btn">
              {L('Save', 'حفظ')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
