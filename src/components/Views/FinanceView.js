'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';

export default function FinanceView() {
  const {
    lang,
    L,
    t,
    GC,
    saveGC,
    formatMoney,
    setFinanceModalOpen,
    setFinanceModalType,
    addSubscription,
    deleteSubscription
  } = useBusiness();

  const [activeTab, setActiveTab] = useState('transactions');
  const [newSubName, setNewSubName] = useState('');
  const [newSubAmount, setNewSubAmount] = useState('');
  const [showSubForm, setShowSubForm] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const entries = GC.finance.entries || [];
  const subscriptions = GC.finance.subscriptions || [];

  // Calculations
  const totalIncome = entries
    .filter(e => e.type === 'income')
    .reduce((a, b) => a + b.amount, 0);

  const totalExpenses = entries
    .filter(e => e.type === 'expense')
    .reduce((a, b) => a + b.amount, 0);

  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  const totalRecurring = subscriptions.reduce((a, b) => a + b.amount, 0);

  const deleteTransaction = (id) => {
    const updated = {
      ...GC,
      finance: {
        ...GC.finance,
        entries: entries.filter(e => e.id !== id)
      }
    };
    saveGC(updated);
  };

  const handleAddSub = (e) => {
    e.preventDefault();
    if (!newSubName || !newSubAmount) return;
    addSubscription(newSubName, newSubAmount);
    setNewSubName('');
    setNewSubAmount('');
    setShowSubForm(false);
  };

  // Run AI Financial Analysis
  const runFinancialAnalysis = async () => {
    setAiLoading(true);
    const transText = entries.map(e => `- [${e.type.toUpperCase()}] ${e.desc}: $${e.amount} (${e.category})`).join('\n');
    const subsText = subscriptions.map(s => `- ${s.name}: $${s.amount}/mo`).join('\n');

    const prompt = `Perform a financial checkup on my business. 
Data: Monthly Income: $${totalIncome}, Monthly Expenses: $${totalExpenses}, Net Profit: $${netProfit} (${profitMargin}% margin), Monthly Subscriptions: $${totalRecurring}.
Transactions:
${transText || 'None recorded yet.'}
Subscriptions:
${subsText || 'None recorded yet.'}

Provide 3 actionable tips to improve profit margin, optimize subscription software costs, and manage cash flow. Keep it short (3-4 sentences max).`;

    const system = `You are a financial consultant for creators and startups. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;
    try {
      const res = await callClaudeAPI(prompt, system, lang, GC);
      setAiAnalysis(res);
    } catch (e) {
      setAiAnalysis(L('Error generating financial analysis.', 'حدث خطأ أثناء تحليل البيانات المالية.'));
    }
    setAiLoading(false);
  };

  useEffect(() => {
    runFinancialAnalysis();
  }, [GC.finance.entries, GC.finance.subscriptions, lang]);

  // Chart data simulation based on real records
  const maxVal = Math.max(totalIncome, totalExpenses, 1000);

  return (
    <div className="pg on" id="pg-finance">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">💳</span>
          <span>{t('Finance OS')}</span>
        </div>
        <div className="pg-actions">
          <button className="btn-ai" onClick={runFinancialAnalysis} disabled={aiLoading}>
            {aiLoading ? L('Analyzing...', 'جاري التحليل...') : L('AI Financial Analysis', 'تحليل مالي بالـ AI')}
          </button>
          <button className="btn btn-prime" onClick={() => {
            setFinanceModalType('income');
            setFinanceModalOpen(true);
          }}>
            + {L('Income', 'إيراد')}
          </button>
          <button className="btn btn-ghost" onClick={() => {
            setFinanceModalType('expense');
            setFinanceModalOpen(true);
          }}>
            + {L('Expense', 'مصروف')}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="g4 stagger" style={{ marginBottom: '16px' }}>
        <div className="stat-card" style={{ borderColor: 'rgba(0, 217, 139, 0.2)' }}>
          <div className="stat-lbl">💚 {L('Total Income', 'إجمالي الدخل')}</div>
          <div className="stat-val" style={{ color: 'var(--green)' }}>{formatMoney(totalIncome)}</div>
        </div>
        <div className="stat-card" style={{ borderColor: 'rgba(255, 61, 110, 0.2)' }}>
          <div className="stat-lbl">🔴 {L('Total Expenses', 'إجمالي المصروفات')}</div>
          <div className="stat-val" style={{ color: 'var(--red)' }}>{formatMoney(totalExpenses)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">💰 {L('Net Profit', 'صافي الربح')}</div>
          <div className="stat-val" style={{ color: netProfit >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatMoney(netProfit)}</div>
          <div className="stat-ch ch-nu">{profitMargin}% {L('margin', 'هامش ربح')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">🔄 {L('Recurring Revenue', 'الإيرادات المتكررة')}</div>
          <div className="stat-val" style={{ color: 'var(--purple)' }}>{formatMoney(totalRecurring)}</div>
          <div className="stat-ch ch-nu">{L('monthly', 'شهرياً')}</div>
        </div>
      </div>

      {/* Cash Flow Chart & AI Insights */}
      <div className="g2 mb">
        <div className="card" style={{ height: '220px', display: 'flex', flexDirection: 'column' }}>
          <div className="sec-hd"><div className="sec-title">{L('Cash Flow Overview', 'نظرة عامة على التدفق النقدي')}</div></div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '30px', padding: '10px 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ background: 'var(--green)', width: '45px', height: `${Math.round((totalIncome / maxVal) * 120)}px`, borderRadius: '4px 4px 0 0', minHeight: '5px' }}></div>
              <span style={{ fontSize: '11px', color: 'var(--t2)', marginTop: '6px' }}>{L('Income', 'الدخل')}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{ background: 'var(--red)', width: '45px', height: `${Math.round((totalExpenses / maxVal) * 120)}px`, borderRadius: '4px 4px 0 0', minHeight: '5px', opacity: 0.85 }}></div>
              <span style={{ fontSize: '11px', color: 'var(--t2)', marginTop: '6px' }}>{L('Expenses', 'المصروفات')}</span>
            </div>
          </div>
        </div>
        <div className="card" style={{ height: '220px', overflowY: 'auto' }}>
          <div className="sec-hd"><div className="sec-title">✦ {L('AI Financial Insights', 'رؤى مالية بالذكاء الاصطناعي')}</div></div>
          <div className="ai-box" style={{ whiteSpace: 'pre-line', fontSize: '12.5px' }}>
            {aiLoading ? L('Calculating metrics...', 'جاري حساب المقاييس...') : (aiAnalysis || L('Add transactions to view financial health suggestions.', 'أضف عمليات مالية لرؤية نصائح تعزيز الأرباح.'))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-bar" id="fin-tabs" style={{ marginBottom: '14px' }}>
        {['transactions', 'income', 'expenses', 'subscriptions'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'on' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'transactions' && L('All Transactions', 'جميع العمليات')}
            {tab === 'income' && L('Income Only', 'الإيرادات فقط')}
            {tab === 'expenses' && L('Expenses Only', 'المصروفات فقط')}
            {tab === 'subscriptions' && L('Subscriptions', 'الاشتراكات')}
          </button>
        ))}
      </div>

      {/* Transaction list panels */}
      {activeTab !== 'subscriptions' && (
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {entries.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px' }}>
                <div className="es-icon">💳</div>
                <div className="es-title">{L('No transactions yet', 'لا توجد عمليات بعد')}</div>
              </div>
            ) : (
              entries
                .filter(e => {
                  if (activeTab === 'income') return e.type === 'income';
                  if (activeTab === 'expenses') return e.type === 'expense';
                  return true;
                })
                .map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '10px', background: 'var(--surface2)', borderRadius: '9px', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>{item.type === 'income' ? '💚' : '🔴'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)' }}>{item.desc}</div>
                      <div style={{ fontSize: '11px', color: 'var(--t3)' }}>{item.category} · {item.date}</div>
                    </div>
                    <span style={{ fontWeight: 'bold', fontSize: '13.5px', color: item.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                      {item.type === 'income' ? '+' : '-'}{formatMoney(item.amount)}
                    </span>
                    <button className="btn btn-ghost" onClick={() => deleteTransaction(item.id)} style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--red)' }}>
                      ✕
                    </button>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="g2">
          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">🔄 {L('Monthly Subscriptions', 'الاشتراكات الشهرية')}</div>
              <button className="btn btn-ghost" style={{ padding: '4px 9px', fontSize: '11.5px' }} onClick={() => setShowSubForm(!showSubForm)}>
                {showSubForm ? L('Cancel', 'إلغاء') : '+ ' + L('Add', 'إضافة')}
              </button>
            </div>

            {showSubForm && (
              <form onSubmit={handleAddSub} style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px', padding: '10px', background: 'var(--surface3)', borderRadius: '8px' }}>
                <input className="inp" placeholder="e.g. ChatGPT Plus, Canva" value={newSubName} onChange={e => setNewSubName(e.target.value)} required />
                <input className="inp" type="number" placeholder="Monthly Cost ($)" value={newSubAmount} onChange={e => setNewSubAmount(e.target.value)} required />
                <button className="btn btn-prime" type="submit" style={{ justifyContent: 'center' }}>{L('Save Subscription', 'حفظ الاشتراك')}</button>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {subscriptions.length === 0 ? (
                <div className="empty-state" style={{ padding: '20px' }}>
                  <div className="es-icon">🔄</div>
                  <div className="es-title">{L('No subscriptions', 'لا توجد اشتراكات')}</div>
                </div>
              ) : (
                subscriptions.map(sub => (
                  <div key={sub.id} style={{ display: 'flex', alignItems: 'center', padding: '10px', background: 'var(--surface2)', borderRadius: '9px', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>⚙️</span>
                    <div style={{ flex: 1, fontSize: '13px', fontWeight: 600, color: 'var(--t1)' }}>{sub.name}</div>
                    <span style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--purple)' }}>{formatMoney(sub.amount)}/{L('mo', 'شهر')}</span>
                    <button className="btn btn-ghost" onClick={() => deleteSubscription(sub.id)} style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--red)' }}>✕</button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <div className="sec-hd"><div className="sec-title">💡 {L('Subscription Insights', 'رؤى الاشتراكات')}</div></div>
            <div className="ai-box" style={{ fontSize: '12.5px' }}>
              {subscriptions.length === 0 ? L('Add subscriptions to get insights.', 'أضف اشتراكات للحصول على تحليلات ذكية.') : (
                lang === 'ar' ? (
                  `• إجمالي تكلفة البرمجيات: ${formatMoney(totalRecurring)} شهرياً.\n• التوصية: قم بمراجعة الاشتراكات غير النشطة بانتظام لتجنب الهدر المالي.`
                ) : (
                  `• Total software overhead: ${formatMoney(totalRecurring)}/mo.\n• Recommendation: Do an audit of your software stack once every 6 months to cancel unused accounts.`
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
