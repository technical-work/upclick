'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { ALL_SYSTEM_TOOLS } from '../../context/BusinessContext';

const DEFAULT_PLAN_STARTER = {
  visible: true,
  name: 'باقة المبتدئين',
  nameEn: 'Starter Plan',
  badge: 'البداية السريعة',
  badgeEn: 'Quick Start',
  price: 299,
  currency: 'ج.م',
  currencyEn: 'EGP',
  period: 'شهرياً',
  periodEn: 'monthly',
  ctaText: 'اشتراك',
  ctaTextEn: 'Subscribe',
  credits: 2000,
  features: [
    '2000 كريديت شهرياً',
    'مساعد الذكاء الاصطناعي',
    'بناء صفحة هبوط واحدة',
    'عملاء ومبيعات محدودة (25 عميل)'
  ],
  featuresEn: [
    '2000 credits monthly',
    'AI Assistant',
    'Build 1 landing page',
    'Limited CRM leads (25 leads)'
  ],
  allowedTools: ['crm', 'landing', 'tasks', 'calendar', 'bio', 'courses', 'social', 'design']
};

const DEFAULT_PLAN_GROWTH = {
  visible: true,
  name: 'باقة النمو',
  nameEn: 'Growth Plan',
  badge: 'ترقية',
  badgeEn: 'Upgrade',
  price: 499,
  currency: 'ج.م',
  currencyEn: 'EGP',
  period: 'شهرياً',
  periodEn: 'monthly',
  ctaText: 'ترقية',
  ctaTextEn: 'Upgrade',
  credits: 5000,
  features: [
    '5000 كريديت شهرياً',
    'مساعد الذكاء الاصطناعي (أسرع)',
    'صفحات هبوط غير محدودة',
    'عملاء ومبيعات غير محدودة',
    'تكاملات أساسية'
  ],
  featuresEn: [
    '5000 credits monthly',
    'AI Assistant (faster)',
    'Unlimited landing pages',
    'Unlimited CRM leads',
    'Basic integrations'
  ],
  allowedTools: ['crm', 'telegram', 'strategy', 'marketing', 'content', 'ai-growth', 'social', 'tiktok-trends', 'bio', 'landing', 'courses', 'digital', 'niche', 'design', 'tasks', 'calendar', 'finance', 'analytics', 'integrations']
};

const DEFAULT_PLAN_PRO = {
  visible: true,
  name: 'باقة المحترفين',
  nameEn: 'Pro Plan',
  badge: 'الأكثر شعبية',
  badgeEn: 'Most Popular',
  price: 799,
  currency: 'ج.م',
  currencyEn: 'EGP',
  period: 'شهرياً',
  periodEn: 'monthly',
  ctaText: 'ابدأ تجربة مجانية لمدة 15 يوم',
  ctaTextEn: 'Start 15-Day Free Trial',
  credits: 10000,
  features: [
    'كل شيء في باقة النمو',
    '10000 كريديت شهرياً',
    'مساعد الذكاء الاصطناعي (غير محدود)',
    'عملاء ومبيعات غير محدودة',
    'نظام التسويق الذكي (8 أدوات)',
    'مركز تليجرام + وكيل الرد التلقائي',
    'ذكاء النمو وتحليل المنافسين',
    'مركز المنتجات الرقمية',
    'التحكم عبر بوت تيليجرام',
    'جميع التكاملات والربط'
  ],
  featuresEn: [
    'Everything in Growth',
    '10000 credits monthly',
    'AI Assistant (unlimited)',
    'Unlimited CRM leads',
    'Marketing OS (8 tools)',
    'Telegram Hub + AI Agent',
    'AI Growth Intelligence',
    'Digital Products Hub',
    'Telegram Bot Control',
    'All integrations'
  ],
  allowedTools: ALL_SYSTEM_TOOLS.map(t => t.key)
};

const PlansSettingsPage = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [planStarter, setPlanStarter] = useState(DEFAULT_PLAN_STARTER);
  const [planGrowth, setPlanGrowth] = useState(DEFAULT_PLAN_GROWTH);
  const [planPro, setPlanPro] = useState(DEFAULT_PLAN_PRO);

  const [recharge1, setRecharge1] = useState({ credits: 1000, price: 26 });
  const [recharge2, setRecharge2] = useState({ credits: 3500, price: 399 });
  const [recharge3, setRecharge3] = useState({ credits: 6000, price: 699 });

  const [customPlans, setCustomPlans] = useState([]);
  const [customRechargePacks, setCustomRechargePacks] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'tenants', 'global'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.planStarterConfig) setPlanStarter({ ...DEFAULT_PLAN_STARTER, ...data.planStarterConfig });
        else if (data.planStarterName) {
          setPlanStarter(prev => ({
            ...prev,
            nameEn: data.planStarterName,
            price: Number(data.planStarterPrice || 299),
            credits: Number(data.planStarterCredits || 2000)
          }));
        }

        if (data.planGrowthConfig) setPlanGrowth({ ...DEFAULT_PLAN_GROWTH, ...data.planGrowthConfig });
        else if (data.planGrowthName) {
          setPlanGrowth(prev => ({
            ...prev,
            nameEn: data.planGrowthName,
            price: Number(data.planGrowthPrice || 499),
            credits: Number(data.planGrowthCredits || 5000)
          }));
        }

        if (data.planProConfig) setPlanPro({ ...DEFAULT_PLAN_PRO, ...data.planProConfig });
        else if (data.planProName) {
          setPlanPro(prev => ({
            ...prev,
            nameEn: data.planProName,
            price: Number(data.planProPrice || 799),
            credits: Number(data.planProCredits || 10000)
          }));
        }

        if (data.recharge1Credits) setRecharge1({ credits: Number(data.recharge1Credits), price: Number(data.recharge1Price || 26) });
        if (data.recharge2Credits) setRecharge2({ credits: Number(data.recharge2Credits), price: Number(data.recharge2Price || 399) });
        if (data.recharge3Credits) setRecharge3({ credits: Number(data.recharge3Credits), price: Number(data.recharge3Price || 699) });

        if (Array.isArray(data.customPlans)) setCustomPlans(data.customPlans);
        if (Array.isArray(data.customRechargePacks)) setCustomRechargePacks(data.customRechargePacks);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'tenants', 'global'), {
        planStarterConfig: planStarter,
        planStarterName: planStarter.nameEn || planStarter.name,
        planStarterPrice: Number(planStarter.price),
        planStarterCredits: Number(planStarter.credits),

        planGrowthConfig: planGrowth,
        planGrowthName: planGrowth.nameEn || planGrowth.name,
        planGrowthPrice: Number(planGrowth.price),
        planGrowthCredits: Number(planGrowth.credits),

        planProConfig: planPro,
        planProName: planPro.nameEn || planPro.name,
        planProPrice: Number(planPro.price),
        planProCredits: Number(planPro.credits),

        recharge1Credits: Number(recharge1.credits),
        recharge1Price: Number(recharge1.price),
        recharge2Credits: Number(recharge2.credits),
        recharge2Price: Number(recharge2.price),
        recharge3Credits: Number(recharge3.credits),
        recharge3Price: Number(recharge3.price),

        customPlans: customPlans,
        customRechargePacks: customRechargePacks,

        updatedAt: serverTimestamp()
      }, { merge: true });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving plan settings:", err);
      alert(isRTL ? "حدث خطأ أثناء حفظ البيانات" : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Helper for updating features
  const handleFeatureChange = (planSetter, featuresKey, index, value) => {
    planSetter(prev => {
      const list = [...(prev[featuresKey] || [])];
      list[index] = value;
      return { ...prev, [featuresKey]: list };
    });
  };

  const handleAddFeature = (planSetter, featuresKey) => {
    planSetter(prev => ({
      ...prev,
      [featuresKey]: [...(prev[featuresKey] || []), '']
    }));
  };

  const handleRemoveFeature = (planSetter, featuresKey, index) => {
    planSetter(prev => {
      const list = [...(prev[featuresKey] || [])];
      list.splice(index, 1);
      return { ...prev, [featuresKey]: list };
    });
  };

  // Handlers for Custom Plans
  const handleAddCustomPlan = () => {
    setCustomPlans(prev => [
      ...prev,
      {
        id: 'custom_plan_' + Date.now(),
        visible: true,
        name: isRTL ? 'باقة جديدة' : 'New Custom Plan',
        nameEn: 'New Custom Plan',
        badge: isRTL ? 'مخصص' : 'Custom',
        badgeEn: 'Custom',
        price: 999,
        credits: 15000,
        currency: 'ج.م',
        currencyEn: 'EGP',
        period: 'شهرياً',
        periodEn: 'monthly',
        ctaText: 'اشتراك',
        ctaTextEn: 'Subscribe',
        icon: '🚀',
        features: [isRTL ? 'ميزة 1' : 'Feature 1'],
        featuresEn: ['Feature 1']
      }
    ]);
  };

  const handleUpdateCustomPlan = (id, field, value) => {
    setCustomPlans(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleDeleteCustomPlan = (id) => {
    setCustomPlans(prev => prev.filter(p => p.id !== id));
  };

  // Handlers for Custom Recharge Packs
  const handleAddCustomRechargePack = () => {
    setCustomRechargePacks(prev => [
      ...prev,
      {
        id: 'custom_recharge_' + Date.now(),
        name: isRTL ? 'حزمة شحن مخصصة' : 'Custom Recharge Pack',
        credits: 5000,
        price: 499,
        icon: '⚡'
      }
    ]);
  };

  const handleUpdateCustomRechargePack = (id, field, value) => {
    setCustomRechargePacks(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleDeleteCustomRechargePack = (id) => {
    setCustomRechargePacks(prev => prev.filter(p => p.id !== id));
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid var(--line)',
    background: 'var(--bg)',
    color: 'var(--text)',
    fontSize: '12.5px',
    boxSizing: 'border-box'
  };

  const renderPlanEditor = (planState, planSetter, titleAr, titleEn, defaultEmoji) => (
    <div className="card" style={{ padding: '20px', marginBottom: '24px', border: '1px solid var(--line)', borderRadius: '16px', background: 'var(--card-bg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
          <span>{defaultEmoji}</span>
          {isRTL ? titleAr : titleEn}
        </h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--accent)', fontWeight: 'bold' }}>
          <input
            type="checkbox"
            checked={planState.visible !== false}
            onChange={e => planSetter(prev => ({ ...prev, visible: e.target.checked }))}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          {isRTL ? 'عرض في الموقع' : 'Show on website'}
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        {/* Name AR & EN */}
        <div>
          <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>
            {isRTL ? 'اسم الباقة (عربي)' : 'Plan Name (AR)'}
          </label>
          <input
            type="text"
            value={planState.name || ''}
            onChange={e => planSetter(prev => ({ ...prev, name: e.target.value }))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>
            {isRTL ? 'اسم الباقة (EN)' : 'Plan Name (EN)'}
          </label>
          <input
            type="text"
            value={planState.nameEn || ''}
            onChange={e => planSetter(prev => ({ ...prev, nameEn: e.target.value }))}
            style={inputStyle}
          />
        </div>

        {/* Badge AR & EN */}
        <div>
          <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>
            {isRTL ? 'شارة مميزة (Badge AR)' : 'Badge (AR)'}
          </label>
          <input
            type="text"
            value={planState.badge || ''}
            onChange={e => planSetter(prev => ({ ...prev, badge: e.target.value }))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>
            {isRTL ? 'شارة مميزة (Badge EN)' : 'Badge (EN)'}
          </label>
          <input
            type="text"
            value={planState.badgeEn || ''}
            onChange={e => planSetter(prev => ({ ...prev, badgeEn: e.target.value }))}
            style={inputStyle}
          />
        </div>

        {/* Price & Credits */}
        <div>
          <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>
            {isRTL ? 'سعر الاشتراك' : 'Subscription Price'}
          </label>
          <input
            type="number"
            value={planState.price || 0}
            onChange={e => planSetter(prev => ({ ...prev, price: Number(e.target.value) }))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>
            {isRTL ? 'الكريديت الشهري' : 'Monthly Credits'}
          </label>
          <input
            type="number"
            value={planState.credits || 0}
            onChange={e => planSetter(prev => ({ ...prev, credits: Number(e.target.value) }))}
            style={inputStyle}
          />
        </div>

        {/* Currency & Period */}
        <div>
          <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>
            {isRTL ? 'العملة' : 'Currency'}
          </label>
          <input
            type="text"
            value={planState.currency || 'ج.م'}
            onChange={e => planSetter(prev => ({ ...prev, currency: e.target.value }))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>
            {isRTL ? 'دورية الاشتراك' : 'Billing Period'}
          </label>
          <input
            type="text"
            value={planState.period || 'شهرياً'}
            onChange={e => planSetter(prev => ({ ...prev, period: e.target.value }))}
            style={inputStyle}
          />
        </div>

        {/* CTA Text AR & EN */}
        <div style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>
                {isRTL ? 'نص زر الإجراء (CTA AR)' : 'CTA Button Text (AR)'}
              </label>
              <input
                type="text"
                value={planState.ctaText || ''}
                onChange={e => planSetter(prev => ({ ...prev, ctaText: e.target.value }))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>
                {isRTL ? 'نص زر الإجراء (CTA EN)' : 'CTA Button Text (EN)'}
              </label>
              <input
                type="text"
                value={planState.ctaTextEn || ''}
                onChange={e => planSetter(prev => ({ ...prev, ctaTextEn: e.target.value }))}
                style={inputStyle}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Lists */}
      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--line)' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '12px' }}>
          {isRTL ? 'ميزات الباقة (Features List)' : 'Plan Features List'}
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Features AR */}
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
              {isRTL ? 'الميزات بالعربية' : 'Features (Arabic)'}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(planState.features || []).map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    value={feat}
                    onChange={e => handleFeatureChange(planSetter, 'features', idx, e.target.value)}
                    placeholder={isRTL ? `ميزة ${idx + 1}` : `Feature ${idx + 1}`}
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(planSetter, 'features', idx)}
                    style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: 'none', borderRadius: '6px', padding: '0 10px', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddFeature(planSetter, 'features')}
                style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)', border: '1px dashed var(--accent)', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginTop: '4px' }}
              >
                ➕ {isRTL ? 'إضافة ميزة جديدة' : 'Add New Feature'}
              </button>
            </div>
          </div>

          {/* Features EN */}
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
              {isRTL ? 'الميزات بالإنجليزية' : 'Features (English)'}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(planState.featuresEn || []).map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    value={feat}
                    onChange={e => handleFeatureChange(planSetter, 'featuresEn', idx, e.target.value)}
                    placeholder={isRTL ? `Feature ${idx + 1}` : `Feature ${idx + 1}`}
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(planSetter, 'featuresEn', idx)}
                    style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: 'none', borderRadius: '6px', padding: '0 10px', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => handleAddFeature(planSetter, 'featuresEn')}
                style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)', border: '1px dashed var(--accent)', borderRadius: '6px', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginTop: '4px' }}
              >
                ➕ {isRTL ? 'إضافة ميزة بالإنجليزية' : 'Add English Feature'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tool Permissions Matrix */}
      <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed var(--line)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h4 style={{ fontSize: '13.5px', fontWeight: 'bold', color: 'var(--orange)', margin: 0 }}>
            🔒 {isRTL ? 'تحديد الأدوات المتاحة والمفتوحة في هذه الباقة' : 'Enabled Tools & Permissions'}
          </h4>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => planSetter(prev => ({ ...prev, allowedTools: ALL_SYSTEM_TOOLS.map(t => t.key) }))}
              style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}
            >
              ✓ {isRTL ? 'تحديد الكل' : 'Select All'}
            </button>
            <button
              type="button"
              onClick={() => planSetter(prev => ({ ...prev, allowedTools: [] }))}
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid #EF4444', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}
            >
              ✕ {isRTL ? 'إلغاء الكل' : 'Deselect All'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '10px', background: 'var(--bg2)', padding: '14px', borderRadius: '12px', border: '1px solid var(--line)' }}>
          {ALL_SYSTEM_TOOLS.map((tool) => {
            const isChecked = (planState.allowedTools || ALL_SYSTEM_TOOLS.map(t => t.key)).includes(tool.key);
            return (
              <label
                key={tool.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: isChecked ? 'var(--text)' : 'var(--text3)',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  background: isChecked ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                  border: isChecked ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent'
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    planSetter(prev => {
                      const current = prev.allowedTools || ALL_SYSTEM_TOOLS.map(t => t.key);
                      const updated = current.includes(tool.key)
                        ? current.filter(k => k !== tool.key)
                        : [...current, tool.key];
                      return { ...prev, allowedTools: updated };
                    });
                  }}
                  style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                />
                <span>{tool.icon}</span>
                <span>{isRTL ? tool.labelAr : tool.labelEn}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--text2)' }}>Loading plan settings...</div>;
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: 'var(--card-bg)', padding: '20px 24px', borderRadius: '16px', border: '1px solid var(--line)' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text)', margin: 0 }}>
            💎 {isRTL ? 'إدارة الباقات والاشتراكات والأسعار' : 'Plans & Subscriptions Management'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text2)', margin: '4px 0 0 0' }}>
            {isRTL ? 'تحكم كامل بباقات الموقع، الأسعار، شارات العرض، زر الاشتراكات، والكريديت الممنوح لكل باقة' : 'Manage main site subscription plans, pricing, badges, features lists, and credit packages'}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
          style={{ padding: '10px 24px', fontWeight: 'bold', fontSize: '13px' }}
        >
          {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ التعديلات' : 'Save All Changes')}
        </button>
      </div>

      {saved && (
        <div style={{ background: 'rgba(34, 197, 94, 0.15)', color: 'var(--green)', padding: '12px 20px', borderRadius: '10px', marginBottom: '20px', fontWeight: 'bold', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
          ✓ {isRTL ? 'تم حفظ التعديلات بنجاح وتحديث الباقات في الموقع!' : 'Plan settings saved successfully!'}
        </div>
      )}

      {/* Main Standard Subscription Plans */}
      {renderPlanEditor(planStarter, setPlanStarter, 'إعدادات باقة المبتدئين (Starter Plan)', 'Starter Plan Settings', '🌱')}
      {renderPlanEditor(planGrowth, setPlanGrowth, 'إعدادات باقة النمو (Growth Plan)', 'Growth Plan Settings', '📈')}
      {renderPlanEditor(planPro, setPlanPro, 'إعدادات باقة المحترفين (Pro Plan)', 'Pro Plan Settings', '👑')}

      {/* Dynamic Custom Subscription Plans */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px', border: '1px solid var(--line)', borderRadius: '16px', background: 'var(--card-bg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: 'var(--text)' }}>
            ✨ {isRTL ? 'باقات الاشتراك المخصصة الإضافية' : 'Custom Subscription Plans'}
          </h3>
          <button
            type="button"
            onClick={handleAddCustomPlan}
            style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent)', border: '1px dashed var(--accent)', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            ➕ {isRTL ? 'إضافة باقة اشتراك مخصصة جديدة' : 'Add New Custom Plan'}
          </button>
        </div>

        {customPlans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text3)', fontSize: '13px' }}>
            {isRTL ? 'لا يوجد باقات مخصصة حالياً. اضغط على الزر أعلاه لإضافة باقة جديدة.' : 'No custom plans configured yet. Click above to add one.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {customPlans.map((plan) => (
              <div key={plan.id} style={{ background: 'var(--bg2)', padding: '16px', borderRadius: '12px', border: '1px dashed var(--accent)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--accent)', fontSize: '14px' }}>
                    {plan.name || (isRTL ? 'باقة مخصصة' : 'Custom Plan')}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCustomPlan(plan.id)}
                    style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    🗑️ {isRTL ? 'حذف' : 'Delete'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'اسم الباقة' : 'Plan Name'}</label>
                    <input type="text" value={plan.name || ''} onChange={e => handleUpdateCustomPlan(plan.id, 'name', e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'الأيقونة' : 'Icon Emoji'}</label>
                    <input type="text" value={plan.icon || '🚀'} onChange={e => handleUpdateCustomPlan(plan.id, 'icon', e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'السعر (ج.م)' : 'Price'}</label>
                    <input type="number" value={plan.price || 0} onChange={e => handleUpdateCustomPlan(plan.id, 'price', Number(e.target.value))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'الكريديت' : 'Credits'}</label>
                    <input type="number" value={plan.credits || 0} onChange={e => handleUpdateCustomPlan(plan.id, 'credits', Number(e.target.value))} style={inputStyle} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recharge Packages Section */}
      <div className="card" style={{ padding: '20px', border: '1px solid var(--line)', borderRadius: '16px', background: 'var(--card-bg)' }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: 'var(--orange)' }}>
          ⚡ {isRTL ? 'إعدادات حزم شحن الرصيد الإضافية (Refill Packages)' : 'Credits Recharge Packages Settings'}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          {/* Pack 1 */}
          <div style={{ background: 'var(--bg2)', padding: '14px', borderRadius: '10px', border: '1px solid var(--line)' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)', fontSize: '12px' }}>Recharge Pack 1</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block' }}>{isRTL ? 'الكريديت' : 'Credits'}</label>
                <input type="number" value={recharge1.credits} onChange={e => setRecharge1(prev => ({ ...prev, credits: Number(e.target.value) }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block' }}>{isRTL ? 'السعر' : 'Price'}</label>
                <input type="number" value={recharge1.price} onChange={e => setRecharge1(prev => ({ ...prev, price: Number(e.target.value) }))} style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Pack 2 */}
          <div style={{ background: 'var(--bg2)', padding: '14px', borderRadius: '10px', border: '1px solid var(--line)' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)', fontSize: '12px' }}>Recharge Pack 2</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block' }}>{isRTL ? 'الكريديت' : 'Credits'}</label>
                <input type="number" value={recharge2.credits} onChange={e => setRecharge2(prev => ({ ...prev, credits: Number(e.target.value) }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block' }}>{isRTL ? 'السعر' : 'Price'}</label>
                <input type="number" value={recharge2.price} onChange={e => setRecharge2(prev => ({ ...prev, price: Number(e.target.value) }))} style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Pack 3 */}
          <div style={{ background: 'var(--bg2)', padding: '14px', borderRadius: '10px', border: '1px solid var(--line)' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)', fontSize: '12px' }}>Recharge Pack 3</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block' }}>{isRTL ? 'الكريديت' : 'Credits'}</label>
                <input type="number" value={recharge3.credits} onChange={e => setRecharge3(prev => ({ ...prev, credits: Number(e.target.value) }))} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block' }}>{isRTL ? 'السعر' : 'Price'}</label>
                <input type="number" value={recharge3.price} onChange={e => setRecharge3(prev => ({ ...prev, price: Number(e.target.value) }))} style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Dynamic Custom Recharge Packs */}
          {customRechargePacks.map((pack) => (
            <div key={pack.id} style={{ background: 'var(--bg2)', padding: '14px', borderRadius: '10px', border: '1px dashed var(--orange)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--orange)', fontSize: '12px' }}>
                  {pack.name || (isRTL ? 'حزمة مخصصة' : 'Custom Pack')}
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteCustomRechargePack(pack.id)}
                  style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: 'none', borderRadius: '6px', padding: '2px 6px', fontSize: '10px', cursor: 'pointer' }}
                >
                  🗑️ {isRTL ? 'حذف' : 'Delete'}
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block' }}>{isRTL ? 'الكريديت' : 'Credits'}</label>
                  <input type="number" value={pack.credits || 0} onChange={e => handleUpdateCustomRechargePack(pack.id, 'credits', Number(e.target.value))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block' }}>{isRTL ? 'السعر' : 'Price'}</label>
                  <input type="number" value={pack.price || 0} onChange={e => handleUpdateCustomRechargePack(pack.id, 'price', Number(e.target.value))} style={inputStyle} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddCustomRechargePack}
          style={{ background: 'rgba(249, 115, 22, 0.15)', color: 'var(--orange)', border: '1px dashed var(--orange)', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          ➕ {isRTL ? 'إضافة حزمة شحن مخصصة جديدة' : 'Add New Recharge Pack'}
        </button>
      </div>
    </div>
  );
};

export default PlansSettingsPage;
