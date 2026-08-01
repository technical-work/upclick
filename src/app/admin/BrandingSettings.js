'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Palette, Type, Image, Save, RefreshCw, Eye, Upload, X, CreditCard, Plus, Trash2, Link, Copy, MessageCircle, Clock } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, libStorage } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';

import { Tr, ARTEXT } from '../../data/translations';
import { adminTranslations } from '../../data/adminTranslations';

const LANG = { ar: {}, en: {} };

// Client translations
if (Tr && Tr.en && Tr.ar) {
  Object.keys(Tr.en).forEach(key => {
    LANG.en[key] = Tr.en[key];
    LANG.ar[key] = Tr.ar[key] || '';
  });
}
if (ARTEXT) {
  Object.keys(ARTEXT).forEach(key => {
    LANG.en[key] = key;
    LANG.ar[key] = ARTEXT[key] || '';
  });
}
// Admin translations
if (adminTranslations && adminTranslations.en && adminTranslations.ar) {
  Object.keys(adminTranslations.en).forEach(key => {
    LANG.en[key] = adminTranslations.en[key];
    LANG.ar[key] = adminTranslations.ar[key] || '';
  });
}

const DICTIONARY_GROUPS = [
  {
    id: 'general_ui',
    titleKey: 'الواجهة العامة / General UI Words',
    keys: Object.keys(ARTEXT || {}).filter(k => typeof LANG.ar[k] === 'string' && typeof LANG.en[k] === 'string')
  },
  {
    id: 'nav_and_core',
    titleKey: 'التنقل واللوحة الرئيسية / Navigation & Main Dashboard',
    keys: Object.keys(Tr?.en || {}).filter(k =>
      (k.startsWith('t-n-') ||
        k.startsWith('t-s') ||
        k.startsWith('t-g') ||
        k.startsWith('t-qa') ||
        k.startsWith('t-pg')) &&
      typeof LANG.ar[k] === 'string' &&
      typeof LANG.en[k] === 'string'
    )
  },
  {
    id: 'tools_and_views',
    titleKey: 'أدوات وصفحات المبدعين / Creator Tools & Pages',
    keys: Object.keys(Tr?.en || {}).filter(k =>
      !(k.startsWith('t-n-') ||
        k.startsWith('t-s') ||
        k.startsWith('t-g') ||
        k.startsWith('t-qa') ||
        k.startsWith('t-pg') ||
        k.startsWith('landing-')) &&
      typeof LANG.ar[k] === 'string' &&
      typeof LANG.en[k] === 'string'
    )
  },
  {
    id: 'landing_page',
    titleKey: 'صفحة الهبوط / Landing Page Texts',
    keys: Object.keys(Tr?.en || {}).filter(k =>
      k.startsWith('landing-') &&
      typeof LANG.ar[k] === 'string' &&
      typeof LANG.en[k] === 'string'
    )
  },
  {
    id: 'admin_control',
    titleKey: 'لوحة التحكم والمسؤولين / Admin Panel & Control',
    keys: Object.keys(adminTranslations?.en || {}).filter(k => typeof LANG.ar[k] === 'string' && typeof LANG.en[k] === 'string')
  }
];

const DEFAULT_PLAN_STARTER = {
  visible: true,
  name: 'باقة المبتدئين',
  price: '499',
  currency: 'ج.م',
  period: 'شهرياً',
  badge: 'البداية السريعة',
  ctaText: 'اشتراك',
  features: [
    '200 كريديت شهرياً',
    'مساعد الذكاء الاصطناعي',
    'بناء صفحة هبوط واحدة',
    'عملاء ومبيعات محدودة (25 عميل)'
  ],
  nameEn: 'Starter Plan',
  badgeEn: 'Quick Start',
  currencyEn: 'EGP',
  periodEn: 'monthly',
  ctaTextEn: 'Subscribe',
  featuresEn: [
    '200 credits monthly',
    'AI Assistant',
    'Build 1 landing page',
    'Limited CRM leads (25 leads)'
  ]
};

const DEFAULT_PLAN_GROWTH = {
  visible: true,
  name: 'باقة النمو',
  price: '799',
  currency: 'ج.م',
  period: 'شهرياً',
  badge: 'ترقية',
  ctaText: 'ترقية',
  features: [
    '600 كريديت شهرياً',
    'مساعد الذكاء الاصطناعي (أسرع)',
    'صفحات هبوط غير محدودة',
    'عملاء ومبيعات غير محدودة',
    'تكاملات أساسية'
  ],
  nameEn: 'Growth Plan',
  badgeEn: 'Upgrade',
  currencyEn: 'EGP',
  periodEn: 'monthly',
  ctaTextEn: 'Upgrade',
  featuresEn: [
    '600 credits monthly',
    'AI Assistant (faster)',
    'Unlimited landing pages',
    'Unlimited CRM leads',
    'Basic integrations'
  ]
};

const DEFAULT_PLAN_PRO = {
  visible: true,
  name: 'باقة المحترفين',
  price: '1497',
  currency: 'ج.م',
  period: 'شهرياً',
  badge: 'الأكثر شعبية',
  ctaText: 'ترقية إلى باقة المحترفين',
  features: [
    'كل شيء في باقة النمو',
    'مساعد الذكاء الاصطناعي (غير محدود)',
    'عملاء ومبيعات غير محدودة',
    'نظام التسويق الذكي (8 أدوات)',
    'مركز تليجرام + وكيل الرد التلقائي',
    'ذكاء النمو وتحليل المنافسين',
    'مركز المنتجات الرقمية',
    'التحكم عبر بوت تيليجرام',
    'جميع التكاملات والربط'
  ],
  nameEn: 'Pro Plan',
  badgeEn: 'Most Popular',
  currencyEn: 'EGP',
  periodEn: 'monthly',
  ctaTextEn: 'Start 14-Day Free Trial',
  featuresEn: [
    'Everything in Growth',
    'AI Assistant (unlimited)',
    'Unlimited CRM leads',
    'Marketing OS (8 tools)',
    'Telegram Hub + AI Agent',
    'AI Growth Intelligence',
    'Digital Products Hub',
    'Telegram Bot Control',
    'All integrations'
  ]
};

const DEFAULTS = {
  appName: 'UpKlick',
  appNameEn: 'UpKlick',
  tagline: 'نظام تشغيل الذكاء الاصطناعي لروادالأعمال ',
  taglineEn: 'The AI OS for Arab Entrepreneurs',
  primaryColor: '#FF6B35',
  accentColor: '#6C35FF',
  bgColor: '#08080f',
  panelColor: '#101018',
  navBgColor: '#08080f',
  sidebarBgColor: '#101018',
  footerBgColor: '#08080f',
  textColor: '#f8f4ff',
  text2Color: '#9090b0',
  btnTextColor: '#ffffff',
  logoUrl: '',
  footerText: '© 2026 UpKlick — مصنوع بـ ❤️ لروادالأعمال ',
  footerTextEn: '© 2026 UpKlick — Made with ❤️ for Arab Entrepreneurs',
  heroBadge: '✦ نظام تشغيل الذكاء الاصطناعي لروادالأعمال ',
  heroBadgeEn: '✦ The AI OS for Arab Entrepreneurs',
  heroSub: 'CRM، تسويق، محتوى، مالية، تليجرام — مدعومون بالذكاء الاصطناعي ومبني للمبدعين والكوتشز وروادالأعمال .',
  heroSubEn: 'CRM, Marketing, Content, Finance, Telegram — all powered by AI and built for Arab creators, coaches, and entrepreneurs.',
  domain: '',
  planStarter: DEFAULT_PLAN_STARTER,
  planGrowth: DEFAULT_PLAN_GROWTH,
  telegramNumber: '',
  i18nOverrides: { ar: {}, en: {} },
};

const BrandingSettings = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { currentUser } = useAuth();
  const [config, setConfig] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const iframeRef = useRef(null);
  const debounceRef = useRef(null);
  const [openGroup, setOpenGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleOverrideChange = (lang, key, value) => {
    const currentOverrides = config.i18nOverrides || { ar: {}, en: {} };
    const nextOverrides = {
      ...currentOverrides,
      [lang]: {
        ...(currentOverrides[lang] || {}),
        [key]: value
      }
    };
    if (!value) {
      delete nextOverrides[lang][key];
    }
    handleChange('i18nOverrides', nextOverrides);
  };

  // Load existing tenant config
  useEffect(() => {
    if (!currentUser?.uid) return;
    getDoc(doc(db, 'tenants', 'global'))
      .then(snap => {
        const data = snap.exists() ? snap.data() : {};
        // Auto-detect parent platform domain when embedded in iframe
        try {
          if (window !== window.top) {
            let parentHost = null;
            if (window.location.ancestorOrigins?.length) {
              parentHost = new URL(window.location.ancestorOrigins[0]).hostname;
            } else if (document.referrer) {
              parentHost = new URL(document.referrer).hostname;
            }
            if (parentHost && parentHost !== window.location.hostname) {
              data.domain = parentHost;
            }
          }
        } catch (_) { }
        setConfig(prev => {
          const planStarterToUse = data.planStarter || {};
          const planGrowthToUse = data.planGrowth || {};
          const planProToUse = data.planPro || {};

          const mergedPlanStarter = {
            ...prev.planStarter,
            ...planStarterToUse,
          };
          if (!planStarterToUse.features) mergedPlanStarter.features = prev.planStarter.features;
          if (!planStarterToUse.featuresEn) mergedPlanStarter.featuresEn = prev.planStarter.featuresEn;

          const mergedPlanGrowth = {
            ...prev.planGrowth,
            ...planGrowthToUse,
          };
          if (!planGrowthToUse.features) mergedPlanGrowth.features = prev.planGrowth.features;
          if (!planGrowthToUse.featuresEn) mergedPlanGrowth.featuresEn = prev.planGrowth.featuresEn;

          const mergedPlanPro = {
            ...prev.planPro,
            ...planProToUse,
          };
          if (!planProToUse.features) mergedPlanPro.features = prev.planPro.features;
          if (!planProToUse.featuresEn) mergedPlanPro.featuresEn = prev.planPro.featuresEn;

          return {
            ...prev,
            ...data,
            planStarter: mergedPlanStarter,
            planGrowth: mergedPlanGrowth,
            planPro: mergedPlanPro,
            i18nOverrides: {
              ...prev.i18nOverrides,
              ...(data.i18nOverrides || {})
            }
          };
        });
      })
      .catch(() => setLoadError(t('branding.loadError')));
  }, [currentUser]);

  // Send branding to iframe with debounce
  const pushToIframe = useCallback((cfg) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'TENANT_BRANDING', config: cfg },
        '*'
      );
    }, 150);
  }, []);

  const handleChange = (field, value) => {
    const next = { ...config, [field]: value };
    setConfig(next);
    pushToIframe(next);
    setSaved(false);
  };

  const handleIframeLoad = () => {
    setTimeout(() => pushToIframe(config), 300);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const storageRef = ref(libStorage, `tenants/global/logo_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      handleChange('logoUrl', url);
    } catch {
      // silently fail
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'tenants', 'global'), {
        ...config,
        adminId: 'global',
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // keep saving=false
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(DEFAULTS);
    pushToIframe(DEFAULTS);
    setSaved(false);
  };

  const renderPlanSection = (planKey, planLabel) => {
    const plan = config[planKey] || {};
    return (
      <div className="card" style={{ marginBottom: '12px' }}>
        <div style={sectionHeader}>
          <CreditCard size={16} />
          <span>{planLabel}</span>
          <label style={{ marginInlineStart: 'auto', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: 'var(--text2)', fontWeight: '600' }}>
            <input
              type="checkbox"
              checked={plan.visible || false}
              onChange={e => handleChange(planKey, { ...plan, visible: e.target.checked })}
              style={{ width: '14px', height: '14px', accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
            {t('branding.showOnSite')}
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>{t('branding.planName')}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input type="text" dir="rtl" value={plan.name || ''} onChange={e => handleChange(planKey, { ...plan, name: e.target.value })} placeholder={t('branding.placeholderPlanName')} style={inputStyle} />
              <input type="text" dir="ltr" value={plan.nameEn || ''} onChange={e => handleChange(planKey, { ...plan, nameEn: e.target.value })} placeholder={t('branding.placeholderPlanName') + ' ' + t('branding.english')} style={{ ...inputStyle, textAlign: 'left' }} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>{t('branding.planBadge')}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input type="text" dir="rtl" value={plan.badge || ''} onChange={e => handleChange(planKey, { ...plan, badge: e.target.value })} placeholder={t('branding.placeholderBadge')} style={inputStyle} />
              <input type="text" dir="ltr" value={plan.badgeEn || ''} onChange={e => handleChange(planKey, { ...plan, badgeEn: e.target.value })} placeholder={t('branding.placeholderBadge') + ' ' + t('branding.english')} style={{ ...inputStyle, textAlign: 'left' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>{t('branding.planPrice')}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input type="number" min="0" value={plan.price || ''} onChange={e => handleChange(planKey, { ...plan, price: e.target.value })} placeholder="99" style={{ ...inputStyle, height: '100%' }} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>{t('branding.planCurrency')}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <select dir="rtl" value={plan.currency || 'ج.م'} onChange={e => handleChange(planKey, { ...plan, currency: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="ج.م">ج.م (EGP)</option>
                <option value="$">$ (USD)</option>
                <option value="ر.س">ر.س (SAR)</option>
                <option value="د.إ">د.إ (AED)</option>
                <option value="€">€ (EUR)</option>
              </select>
              <select dir="ltr" value={plan.currencyEn || 'EGP'} onChange={e => handleChange(planKey, { ...plan, currencyEn: e.target.value })} style={{ ...inputStyle, cursor: 'pointer', textAlign: 'left' }}>
                <option value="EGP">EGP</option>
                <option value="USD">USD</option>
                <option value="SAR">SAR</option>
                <option value="AED">AED</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>{t('branding.planPeriod')}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <select dir="rtl" value={plan.period || 'شهرياً'} onChange={e => handleChange(planKey, { ...plan, period: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="شهرياً">{t('branding.monthly')}</option>
                <option value="سنوياً">{t('branding.yearly')}</option>
                <option value="مرة واحدة">{t('branding.onetime')}</option>
              </select>
              <select dir="ltr" value={plan.periodEn || 'monthly'} onChange={e => handleChange(planKey, { ...plan, periodEn: e.target.value })} style={{ ...inputStyle, cursor: 'pointer', textAlign: 'left' }}>
                <option value="monthly">monthly</option>
                <option value="yearly">yearly</option>
                <option value="one-time">one-time</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>{t('branding.ctaText')}</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <input type="text" dir="rtl" value={plan.ctaText || ''} onChange={e => handleChange(planKey, { ...plan, ctaText: e.target.value })} placeholder={t('branding.placeholderCta')} style={inputStyle} />
            <input type="text" dir="ltr" value={plan.ctaTextEn || ''} onChange={e => handleChange(planKey, { ...plan, ctaTextEn: e.target.value })} placeholder={t('branding.placeholderCta') + ' ' + t('branding.english')} style={{ ...inputStyle, textAlign: 'left' }} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>{t('branding.planFeatures')}</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
            {(plan.features || []).map((feat, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <input
                    type="text"
                    dir="rtl"
                    value={feat}
                    onChange={e => {
                      const next = [...(plan.features || [])];
                      next[idx] = e.target.value;
                      handleChange(planKey, { ...plan, features: next });
                    }}
                    style={{ ...inputStyle, padding: '8px 12px', fontSize: '12px' }}
                    placeholder={t('branding.planFeatures')}
                  />
                  <input
                    type="text"
                    dir="ltr"
                    value={(plan.featuresEn || [])[idx] || ''}
                    onChange={e => {
                      const nextEn = [...(plan.featuresEn || plan.features || [])];
                      while (nextEn.length < plan.features.length) nextEn.push('');
                      nextEn[idx] = e.target.value;
                      handleChange(planKey, { ...plan, featuresEn: nextEn });
                    }}
                    style={{ ...inputStyle, padding: '8px 12px', fontSize: '12px', textAlign: 'left' }}
                    placeholder={t('branding.planFeatures') + ' ' + t('branding.english')}
                  />
                </div>
                <button
                  onClick={() => {
                    const next = (plan.features || []).filter((_, i) => i !== idx);
                    const nextEn = (plan.featuresEn || plan.features || []).filter((_, i) => i !== idx);
                    handleChange(planKey, { ...plan, features: next, featuresEn: nextEn });
                  }}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: '4px', marginTop: '6px', flexShrink: 0 }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => handleChange(planKey, { ...plan, features: [...(plan.features || []), ''] })}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg3)', border: '1px dashed var(--line2)', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: 'var(--text2)', cursor: 'pointer', width: '100%', justifyContent: 'center' }}
          >
            <Plus size={14} />
            {t('branding.addFeature')}
          </button>
        </div>
      </div>
    );
  };

  const field = (label, fieldKey, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text2)', marginBottom: '6px', textTransform: 'uppercase' }}>
        {label}
      </label>
      {type === 'color' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="color"
            value={config[fieldKey]}
            onChange={e => handleChange(fieldKey, e.target.value)}
            style={{ width: '44px', height: '44px', border: 'none', borderRadius: '10px', cursor: 'pointer', background: 'transparent', padding: '2px' }}
          />
          <input
            type="text"
            value={config[fieldKey]}
            onChange={e => handleChange(fieldKey, e.target.value)}
            style={inputStyle}
            maxLength={7}
            placeholder="#3B82F6"
          />
        </div>
      ) : type === 'textarea' ? (
        <textarea
          value={config[fieldKey]}
          onChange={e => handleChange(fieldKey, e.target.value)}
          placeholder={placeholder}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', height: 'auto', padding: '10px 14px' }}
        />
      ) : type === 'text_i18n' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            type="text"
            value={config[fieldKey]}
            onChange={e => handleChange(fieldKey, e.target.value)}
            placeholder={placeholder + ` ${t('branding.arabic')}`}
            style={inputStyle}
            dir="rtl"
          />
          <input
            type="text"
            value={config[`${fieldKey}En`] || ''}
            onChange={e => handleChange(`${fieldKey}En`, e.target.value)}
            placeholder={placeholder + ` ${t('branding.english')}`}
            style={{ ...inputStyle, textAlign: 'left' }}
            dir="ltr"
          />
        </div>
      ) : type === 'textarea_i18n' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <textarea
            value={config[fieldKey]}
            onChange={e => handleChange(fieldKey, e.target.value)}
            placeholder={placeholder + ` ${t('branding.arabic')}`}
            rows={2}
            style={{ ...inputStyle, resize: 'vertical', height: 'auto', padding: '10px 14px' }}
            dir="rtl"
          />
          <textarea
            value={config[`${fieldKey}En`] || ''}
            onChange={e => handleChange(`${fieldKey}En`, e.target.value)}
            placeholder={placeholder + ` ${t('branding.english')}`}
            rows={2}
            style={{ ...inputStyle, resize: 'vertical', height: 'auto', padding: '10px 14px', textAlign: 'left' }}
            dir="ltr"
          />
        </div>
      ) : (
        <input
          type="text"
          value={config[fieldKey]}
          onChange={e => handleChange(fieldKey, e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
        />
      )}
    </div>
  );

  return (
    <div className="branding-container" style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', height: 'calc(100vh - 120px)', minHeight: 0 }}>

      {/* ── Controls Panel ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0', overflowY: 'auto' }}>

        {loadError && (
          <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px', border: '1px solid rgba(239,68,68,0.2)' }}>
            ⚠️ {loadError}
          </div>
        )}

        {/* App Identity */}
        <div className="card" style={{ marginBottom: '12px' }}>
          <div style={sectionHeader}>
            <Type size={16} />
            <span>{t('branding.appIdentity')}</span>
          </div>
          {field(t('branding.appName'), 'appName', 'text_i18n', t('branding.placeholderApp'))}
          {field(t('branding.tagline'), 'tagline', 'text_i18n', t('branding.placeholderTagline'))}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text2)', marginBottom: '6px', textTransform: 'uppercase' }}>
              {t('branding.domainLabel')}
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={config.domain}
                readOnly
                placeholder={t('branding.domainPlaceholder')}
                style={{ ...inputStyle, flex: 1, cursor: 'not-allowed', opacity: 0.7 }}
              />
              <button
                type="button"
                onClick={() => {
                  let detected = window.location.hostname;
                  try {
                    if (window !== window.top) {
                      let parentHost = null;
                      if (window.location.ancestorOrigins?.length) {
                        parentHost = new URL(window.location.ancestorOrigins[0]).hostname;
                      } else if (document.referrer) {
                        parentHost = new URL(document.referrer).hostname;
                      }
                      if (parentHost && parentHost !== window.location.hostname) detected = parentHost;
                    }
                  } catch (_) { }
                  handleChange('domain', detected);
                }}
                className="btn"
                title={t('branding.domainDetectTitle')}
                style={{ background: 'var(--bg3)', border: '1px solid var(--line2)', color: 'var(--text2)', padding: '0 12px', flexShrink: 0, fontSize: '13px', whiteSpace: 'nowrap' }}
              >
                {t('branding.detectDomain')}
              </button>
            </div>
          </div>
        </div>

        {/* Telegram & Support */}
        <div className="card" style={{ marginBottom: '12px' }}>
          <div style={sectionHeader}>
            <MessageCircle size={16} />
            <span>{isRTL ? 'تواصل التليجرام والدعم المباشر' : 'Telegram & Direct Support'}</span>
          </div>

          <div>
            <label style={labelStyle}>{t('branding.telegramLabel')}</label>
            <input
              type="tel"
              value={config.telegramNumber || ''}
              onChange={e => handleChange('telegramNumber', e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="201xxxxxxxx"
              dir="ltr"
              style={{ ...inputStyle, textAlign: 'left', fontFamily: 'var(--mono)' }}
            />
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
              {t('branding.telegramHint')}
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="card" style={{ marginBottom: '12px' }}>
          <div style={sectionHeader}>
            <Palette size={16} />
            <span>{t('branding.mainColors')}</span>
          </div>
          {field(t('branding.primaryColor'), 'primaryColor', 'color')}
          {field(t('branding.accentColor'), 'accentColor', 'color')}
        </div>

        {/* Advanced Colors */}
        <div className="card" style={{ marginBottom: '12px' }}>
          <div style={sectionHeader}>
            <Palette size={16} />
            <span>{t('branding.bgColors')}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>{t('branding.pageBg')}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="color" value={config.bgColor} onChange={e => handleChange('bgColor', e.target.value)} style={colorSwatchStyle} />
                <input type="text" value={config.bgColor} onChange={e => handleChange('bgColor', e.target.value)} style={{ ...inputStyle, fontSize: '12px' }} maxLength={7} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>{t('branding.panelBg')}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="color" value={config.panelColor} onChange={e => handleChange('panelColor', e.target.value)} style={colorSwatchStyle} />
                <input type="text" value={config.panelColor} onChange={e => handleChange('panelColor', e.target.value)} style={{ ...inputStyle, fontSize: '12px' }} maxLength={7} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>{t('branding.navBg')}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="color" value={config.navBgColor} onChange={e => handleChange('navBgColor', e.target.value)} style={colorSwatchStyle} />
                <input type="text" value={config.navBgColor} onChange={e => handleChange('navBgColor', e.target.value)} style={{ ...inputStyle, fontSize: '12px' }} maxLength={7} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>{t('branding.sidebarBg')}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="color" value={config.sidebarBgColor} onChange={e => handleChange('sidebarBgColor', e.target.value)} style={colorSwatchStyle} />
                <input type="text" value={config.sidebarBgColor} onChange={e => handleChange('sidebarBgColor', e.target.value)} style={{ ...inputStyle, fontSize: '12px' }} maxLength={7} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>{t('branding.footerBg')}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="color" value={config.footerBgColor} onChange={e => handleChange('footerBgColor', e.target.value)} style={colorSwatchStyle} />
                <input type="text" value={config.footerBgColor} onChange={e => handleChange('footerBgColor', e.target.value)} style={{ ...inputStyle, fontSize: '12px' }} maxLength={7} />
              </div>
            </div>
          </div>
        </div>

        {/* Text Colors */}
        <div className="card" style={{ marginBottom: '12px' }}>
          <div style={sectionHeader}>
            <Type size={16} />
            <span>{t('branding.textColors')}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>{t('branding.primaryText')}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="color" value={config.textColor} onChange={e => handleChange('textColor', e.target.value)} style={colorSwatchStyle} />
                <input type="text" value={config.textColor} onChange={e => handleChange('textColor', e.target.value)} style={{ ...inputStyle, fontSize: '12px' }} maxLength={7} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>{t('branding.secondaryText')}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="color" value={config.text2Color} onChange={e => handleChange('text2Color', e.target.value)} style={colorSwatchStyle} />
                <input type="text" value={config.text2Color} onChange={e => handleChange('text2Color', e.target.value)} style={{ ...inputStyle, fontSize: '12px' }} maxLength={7} />
              </div>
            </div>
          </div>
          <div>
            <label style={labelStyle}>{isRTL ? 'لون نص أزرار الإجراء (CTA)' : 'Button Text Color'}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="color" value={config.btnTextColor || '#ffffff'} onChange={e => handleChange('btnTextColor', e.target.value)} style={colorSwatchStyle} />
              <input type="text" value={config.btnTextColor || '#ffffff'} onChange={e => handleChange('btnTextColor', e.target.value)} style={{ ...inputStyle, fontSize: '12px' }} maxLength={7} />
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="card" style={{ marginBottom: '12px' }}>
          <div style={sectionHeader}>
            <Image size={16} />
            <span>{t('branding.logo')}</span>
          </div>
          {config.logoUrl && (
            <div style={{ position: 'relative', marginBottom: '12px', display: 'inline-block' }}>
              <img src={config.logoUrl} alt="logo" style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '12px', border: '1px solid var(--line)' }} />
              <button
                onClick={() => handleChange('logoUrl', '')}
                style={{ position: 'absolute', top: '-8px', right: '-8px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--red)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
              >
                <X size={12} />
              </button>
            </div>
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: uploading ? 'not-allowed' : 'pointer', background: 'var(--bg3)', border: '1px dashed var(--line2)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: 'var(--text2)', transition: 'border-color 0.2s' }}>
            <Upload size={16} />
            <span>{uploading ? t('branding.uploading') : t('branding.uploadLogo')}</span>
            <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading} style={{ display: 'none' }} />
          </label>
        </div>


        {/* Advanced Overrides */}
        <div className="card" style={{ marginBottom: '12px' }}>
          <div style={sectionHeader}>
            <Type size={16} />
            <span>{isRTL ? 'تعديل جميع نصوص لوحة التحكم' : 'Dashboard Text Overrides'}</span>
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--text3)', marginBottom: '16px', lineHeight: '1.5' }}>
            {isRTL
              ? 'يمكنك تعديل أي كلمة أو جملة تظهر للمستخدم في لوحة التحكم وتغييرها للعربية والإنجليزية.'
              : 'Edit any text or label visible to users in the dashboard in both Arabic and English.'}
          </div>

          {/* Search Bar */}
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder={isRTL ? 'ابحث عن نص أو كلمة لتعديلها...' : 'Search text or key to edit...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(() => {
              const query = searchQuery.toLowerCase();
              const filteredGroups = DICTIONARY_GROUPS.map(group => {
                const matchedKeys = group.keys.filter(key => {
                  const defAr = typeof LANG.ar[key] === 'string' ? LANG.ar[key] : String(LANG.ar[key] || '');
                  const defEn = typeof LANG.en[key] === 'string' ? LANG.en[key] : String(LANG.en[key] || '');
                  return (
                    key.toLowerCase().includes(query) ||
                    defAr.toLowerCase().includes(query) ||
                    defEn.toLowerCase().includes(query)
                  );
                });
                return { ...group, keys: matchedKeys };
              }).filter(group => group.keys.length > 0);

              if (filteredGroups.length === 0) {
                return (
                  <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '16px', fontSize: '13px' }}>
                    {isRTL ? 'لا توجد نتائج مطابقة لبحثك' : 'No matching translation keys found.'}
                  </div>
                );
              }

              return filteredGroups.map(group => {
                const isOpen = openGroup === group.id || (searchQuery !== '' && group.keys.length > 0);
                return (
                  <div key={group.id} style={{ border: '1px solid var(--line2)', borderRadius: '8px', overflow: 'hidden' }}>
                    <button
                      type="button"
                      onClick={() => setOpenGroup(openGroup === group.id ? null : group.id)}
                      style={{ width: '100%', background: 'var(--bg3)', border: 'none', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: 'var(--text)', fontSize: '13px', fontWeight: '600' }}
                    >
                      <span>{group.titleKey}</span>
                      <span style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text3)' }}>
                        ▼
                      </span>
                    </button>
                    {isOpen && (
                      <div style={{ padding: '16px', background: 'var(--bg2)', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--line2)' }}>
                        {group.keys.slice(0, 100).map(key => {
                          const defaultAr = typeof LANG.ar[key] === 'string' ? LANG.ar[key] : String(LANG.ar[key] || '');
                          const defaultEn = typeof LANG.en[key] === 'string' ? LANG.en[key] : String(LANG.en[key] || defaultAr);
                          const valAr = config.i18nOverrides?.ar?.[key] || '';
                          const valEn = config.i18nOverrides?.en?.[key] || '';
                          return (
                            <div key={key} style={{ borderBottom: '1px solid var(--line2)', paddingBottom: '12px' }}>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text2)', marginBottom: '6px' }}>
                                <span title={defaultAr.replace(/<[^>]*>?/gm, '')}>
                                  {defaultAr.replace(/<[^>]*>?/gm, '').length > 50 ? defaultAr.replace(/<[^>]*>?/gm, '').substring(0, 50) + '...' : defaultAr.replace(/<[^>]*>?/gm, '')}
                                </span>
                                <span style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--mono)', marginInlineStart: '8px', fontWeight: 'normal' }}>
                                  ({key})
                                </span>
                              </label>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <input
                                  type="text"
                                  dir="rtl"
                                  placeholder={defaultAr}
                                  value={valAr}
                                  onChange={e => handleOverrideChange('ar', key, e.target.value)}
                                  style={{ ...inputStyle, fontSize: '12px', padding: '8px 12px' }}
                                  title="عربي"
                                />
                                <input
                                  type="text"
                                  dir="ltr"
                                  placeholder={defaultEn}
                                  value={valEn}
                                  onChange={e => handleOverrideChange('en', key, e.target.value)}
                                  style={{ ...inputStyle, fontSize: '12px', padding: '8px 12px', textAlign: 'left' }}
                                  title="English"
                                />
                              </div>
                            </div>
                          );
                        })}
                        {group.keys.length > 100 && (
                          <div style={{ fontSize: '11px', color: 'var(--text3)', textAlign: 'center', paddingTop: '8px' }}>
                            {isRTL
                              ? `تم عرض أول 100 نتيجة من أصل ${group.keys.length}. يرجى استخدام البحث لتحديد نصوص معينة.`
                              : `Showing first 100 of ${group.keys.length} items. Use search to find specific items.`}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', paddingBottom: '20px' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            <Save size={16} />
            <span>{saving ? t('branding.saving') : saved ? t('branding.saved') : t('branding.saveSettings')}</span>
          </button>
          <button onClick={handleReset} className="btn" style={{ background: 'var(--bg3)', border: '1px solid var(--line)', color: 'var(--text2)' }}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* ── Live Preview ── */}
      <div style={{ display: 'flex', flexDirection: 'column', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--line)', background: 'var(--bg2)', height: '100%', minHeight: '650px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: '1px solid var(--line)', background: 'var(--bg3)' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
          </div>
          <div style={{ flex: 1, background: 'var(--bg4)', borderRadius: '6px', padding: '4px 12px', fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
            {config.domain || 'your-domain.com'} · {t('branding.livePreview')}
          </div>
          <Eye size={14} style={{ color: 'var(--text3)' }} />
        </div>
        <iframe
          ref={iframeRef}
          src="/landing-page.html?preview=true"
          onLoad={handleIframeLoad}
          style={{ flex: 1, border: 'none', width: '100%' }}
          title="Landing Page Preview"
        />
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  background: 'var(--bg3)',
  border: '1px solid var(--line2)',
  borderRadius: '10px',
  padding: '10px 14px',
  fontSize: '13px',
  color: 'var(--text)',
  outline: 'none',
  fontFamily: 'var(--font)',
  transition: 'border-color 0.2s',
};

const colorSwatchStyle = {
  width: '36px',
  height: '36px',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  background: 'transparent',
  padding: '2px',
  flexShrink: 0,
};

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '700',
  color: 'var(--text2)',
  marginBottom: '5px',
  textTransform: 'uppercase',
};

const sectionHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  fontWeight: '800',
  color: 'var(--text)',
  marginBottom: '16px',
  paddingBottom: '10px',
  borderBottom: '1px solid var(--line)',
};

export default BrandingSettings;
