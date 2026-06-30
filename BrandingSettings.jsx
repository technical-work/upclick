import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Palette, Type, Image, Save, RefreshCw, Eye, Upload, X, CreditCard, Plus, Trash2, Link, Copy, MessageCircle, Clock } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, libStorage } from '../services/firebase';
import { useAuth } from '../auth/AuthContext';
import { useTranslation } from 'react-i18next';
import { LANG, DICTIONARY_GROUPS } from '../constants/landingPageDict';

const DEFAULT_PLAN = {
  visible: false,
  name: 'الباقة الاحترافية',
  price: '99',
  currency: 'ج.م',
  period: 'شهرياً',
  badge: 'الأكثر شعبية',
  ctaText: 'اشترك الآن',
  features: [
    'ابدأ من هنا — تأسيس ملفك الشخصي',
    'التخصص والمهارات',
    'رادار المنصات',
    'حاسبة التسعير',
    'مولد الاستراتيجية بالذكاء الاصطناعي',
    'صياغة المهارات',
    'معرض الأعمال',
    'كاتب العروض الاحترافي',
    'رادار المشاريع',
  ],
  nameEn: 'Pro Plan',
  badgeEn: 'Most Popular',
  currencyEn: 'EGP',
  periodEn: 'monthly',
  ctaTextEn: 'Subscribe Now',
  featuresEn: [
    'Start Here — Profile Foundation',
    'Specialization & Skills',
    'Platforms Radar',
    'Pricing Calculator',
    'AI Strategy Generator',
    'Skills Pitching',
    'Portfolio',
    'Pro Proposal Writer',
    'Projects Radar',
  ]
};

const DEFAULT_PLAN_ANNUAL = {
  visible: false,
  name: 'الباقة السنوية',
  price: '999',
  currency: 'ج.م',
  period: 'سنوياً',
  badge: 'أفضل قيمة',
  ctaText: 'اشترك الآن',
  features: [
    'ابدأ من هنا — تأسيس ملفك الشخصي',
    'التخصص والمهارات',
    'رادار المنصات',
    'حاسبة التسعير',
    'مولد الاستراتيجية بالذكاء الاصطناعي',
    'صياغة المهارات',
    'معرض الأعمال',
    'كاتب العروض الاحترافي',
    'رادار المشاريع',
  ],
  nameEn: 'Annual Plan',
  badgeEn: 'Best Value',
  currencyEn: 'EGP',
  periodEn: 'yearly',
  ctaTextEn: 'Subscribe Now',
  featuresEn: [
    'Start Here — Profile Foundation',
    'Specialization & Skills',
    'Platforms Radar',
    'Pricing Calculator',
    'AI Strategy Generator',
    'Skills Pitching',
    'Portfolio',
    'Pro Proposal Writer',
    'Projects Radar',
  ]
};

const DEFAULTS = {
  appName: 'upKlick',
  appNameEn: 'upKlick',
  tagline: 'بوابتك للنجاح في العمل الحر',
  taglineEn: 'Your Gateway to Success in Freelancing',
  primaryColor: '#3B82F6',
  accentColor: '#1D4ED8',
  bgColor: '#080C14',
  panelColor: '#0F1628',
  navBgColor: '#080C14',
  sidebarBgColor: '#0F1628',
  footerBgColor: '#080C14',
  textColor: '#E8EDF5',
  text2Color: '#8B96A8',
  btnTextColor: '#ffffff',
  logoUrl: '',
  footerText: '© 2025 upKlick — بوابتك للنجاح في العمل الحر',
  footerTextEn: '© 2025 upKlick — Your Gateway to Success in Freelancing',
  heroBadge: 'الأداة الأولى عربياً للفريلانسر الذكي',
  heroBadgeEn: 'The #1 Tool for the Smart Arab Freelancer',
  heroSub: 'upKlick مش مجرد أداة — هو مرشدك الشخصي الكامل.',
  heroSubEn: 'upKlick is not just a tool — it\'s your complete personal guide.',
  domain: '',
  plan: DEFAULT_PLAN,
  planAnnual: DEFAULT_PLAN_ANNUAL,
  telegramNumber: '',
  freeTrial: { enabled: false, days: 7 },
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
    getDoc(doc(db, 'tenants', currentUser.uid))
      .then(snap => {
        const data = snap.exists() ? snap.data() : {};
        // Auto-detect parent platform domain when embedded in iframe
        try {
          if (window !== window.top) {
            let parentHost = null;
            // ancestorOrigins: most reliable, works even without referrer header
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
          const mergedPlan = {
            ...prev.plan,
            ...(data.plan || {}),
          };
          if (!data.plan?.featuresEn) mergedPlan.featuresEn = prev.plan.featuresEn;
          if (!data.plan?.features) mergedPlan.features = prev.plan.features;

          const mergedPlanAnnual = {
            ...prev.planAnnual,
            ...(data.planAnnual || {}),
          };
          if (!data.planAnnual?.featuresEn) mergedPlanAnnual.featuresEn = prev.planAnnual?.featuresEn || prev.plan.featuresEn;
          if (!data.planAnnual?.features) mergedPlanAnnual.features = prev.planAnnual?.features || prev.plan.features;

          return {
            ...prev,
            ...data,
            plan: mergedPlan,
            planAnnual: mergedPlanAnnual,
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
    // Push current config once iframe is ready
    setTimeout(() => pushToIframe(config), 300);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const storageRef = ref(libStorage, `tenants/${currentUser.uid}/logo_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      handleChange('logoUrl', url);
    } catch {
      // silently fail — user can retry
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'tenants', currentUser.uid), {
        ...config,
        adminId: currentUser.uid,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // keep saving=false so user can retry
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(DEFAULTS);
    pushToIframe(DEFAULTS);
    setSaved(false);
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
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', height: 'calc(100vh - 120px)', minHeight: 0 }}>

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

          {/* UpKlick tenant URL */}
          {/* <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>رابط الـ Landing Page (للـ UpKlick)</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ ...inputStyle, flex: 1, fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                {`${window.location.origin}/gigsniper_v2.html?tenant=${currentUser?.uid || 'UID'}`}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/gigsniper_v2.html?tenant=${currentUser?.uid}`)}
                className="btn"
                title="نسخ الرابط"
                style={{ background: 'var(--bg3)', border: '1px solid var(--line2)', color: 'var(--text2)', padding: '0 12px', flexShrink: 0 }}
              >
                <Copy size={14} />
              </button>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '5px' }}>
              حط الرابط ده كـ iframe src في صفحة UpKlick بتاعتك
            </div>
          </div> */}
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
        {/* Free Trial & Telegram */}
        <div className="card" style={{ marginBottom: '12px' }}>
          <div style={sectionHeader}>
            <MessageCircle size={16} />
            <span>{t('branding.trialTelegram')}</span>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>{t('branding.telegramLabel')}</label>
            <input
              type="tel"
              value={config.telegramNumber}
              onChange={e => handleChange('telegramNumber', e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="201xxxxxxxx"
              dir="ltr"
              style={{ ...inputStyle, textAlign: 'left', fontFamily: 'var(--mono)' }}
            />
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
              {t('branding.telegramHint')}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg3)', borderRadius: '10px', border: '1px solid var(--line2)', marginBottom: config.freeTrial?.enabled ? '12px' : '0' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} />
                {t('branding.freeTrialLabel')}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '3px' }}>
                {t('branding.freeTrialHint')}
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.freeTrial?.enabled || false}
                onChange={e => handleChange('freeTrial', { ...config.freeTrial, enabled: e.target.checked })}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
            </label>
          </div>

          {config.freeTrial?.enabled && (
            <div>
              <label style={labelStyle}>{t('branding.trialDays')}</label>
              <input
                type="number"
                min="1"
                max="365"
                value={config.freeTrial?.days || 7}
                onChange={e => handleChange('freeTrial', { ...config.freeTrial, days: Math.max(1, parseInt(e.target.value) || 7) })}
                style={{ ...inputStyle, width: '140px' }}
              />
            </div>
          )}
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

        {/* Content */}

        {/* Plan & Pricing */}
        <div className="card" style={{ marginBottom: '12px' }}>
          <div style={sectionHeader}>
            <CreditCard size={16} />
            <span>{t('branding.planPricing')}</span>
            <label style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: 'var(--text2)', fontWeight: '600' }}>
              <input
                type="checkbox"
                checked={config.plan?.visible || false}
                onChange={e => handleChange('plan', { ...config.plan, visible: e.target.checked })}
                style={{ width: '14px', height: '14px', accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
              {t('branding.showOnSite')}
            </label>
          </div>

          {/* Plan name + badge */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>{t('branding.planName')}</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input type="text" dir="rtl" value={config.plan?.name || ''} onChange={e => handleChange('plan', { ...config.plan, name: e.target.value })} placeholder={t('branding.placeholderPlanName')} style={inputStyle} />
                <input type="text" dir="ltr" value={config.plan?.nameEn || ''} onChange={e => handleChange('plan', { ...config.plan, nameEn: e.target.value })} placeholder={t('branding.placeholderPlanName') + ' ' + t('branding.english')} style={{ ...inputStyle, textAlign: 'left' }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>{t('branding.planBadge')}</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input type="text" dir="rtl" value={config.plan?.badge || ''} onChange={e => handleChange('plan', { ...config.plan, badge: e.target.value })} placeholder={t('branding.placeholderBadge')} style={inputStyle} />
                <input type="text" dir="ltr" value={config.plan?.badgeEn || ''} onChange={e => handleChange('plan', { ...config.plan, badgeEn: e.target.value })} placeholder={t('branding.placeholderBadge') + ' ' + t('branding.english')} style={{ ...inputStyle, textAlign: 'left' }} />
              </div>
            </div>
          </div>

          {/* Price + currency + period */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>{t('branding.planPrice')}</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input type="number" min="0" value={config.plan?.price || ''} onChange={e => handleChange('plan', { ...config.plan, price: e.target.value })} placeholder="99" style={{ ...inputStyle, height: '100%' }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>{t('branding.planCurrency')}</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <select dir="rtl" value={config.plan?.currency || 'ج.م'} onChange={e => handleChange('plan', { ...config.plan, currency: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="ج.م">ج.م (EGP)</option>
                  <option value="$">$ (USD)</option>
                  <option value="ر.س">ر.س (SAR)</option>
                  <option value="د.إ">د.إ (AED)</option>
                  <option value="€">€ (EUR)</option>
                </select>
                <select dir="ltr" value={config.plan?.currencyEn || 'EGP'} onChange={e => handleChange('plan', { ...config.plan, currencyEn: e.target.value })} style={{ ...inputStyle, cursor: 'pointer', textAlign: 'left' }}>
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
                <select dir="rtl" value={config.plan?.period || 'شهرياً'} onChange={e => handleChange('plan', { ...config.plan, period: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="شهرياً">{t('branding.monthly')}</option>
                  <option value="سنوياً">{t('branding.yearly')}</option>
                  <option value="مرة واحدة">{t('branding.onetime')}</option>
                </select>
                <select dir="ltr" value={config.plan?.periodEn || 'monthly'} onChange={e => handleChange('plan', { ...config.plan, periodEn: e.target.value })} style={{ ...inputStyle, cursor: 'pointer', textAlign: 'left' }}>
                  <option value="monthly">monthly</option>
                  <option value="yearly">yearly</option>
                  <option value="one-time">one-time</option>
                </select>
              </div>
            </div>
          </div>

          {/* CTA text */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>{t('branding.ctaText')}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input type="text" dir="rtl" value={config.plan?.ctaText || ''} onChange={e => handleChange('plan', { ...config.plan, ctaText: e.target.value })} placeholder={t('branding.placeholderCta')} style={inputStyle} />
              <input type="text" dir="ltr" value={config.plan?.ctaTextEn || ''} onChange={e => handleChange('plan', { ...config.plan, ctaTextEn: e.target.value })} placeholder={t('branding.placeholderCta') + ' ' + t('branding.english')} style={{ ...inputStyle, textAlign: 'left' }} />
            </div>
          </div>

          {/* Features list */}
          <div>
            <label style={labelStyle}>{t('branding.planFeatures')}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
              {(config.plan?.features || []).map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input
                      type="text"
                      dir="rtl"
                      value={feat}
                      onChange={e => {
                        const next = [...(config.plan?.features || [])];
                        next[idx] = e.target.value;
                        handleChange('plan', { ...config.plan, features: next });
                      }}
                      style={{ ...inputStyle, padding: '8px 12px', fontSize: '12px' }}
                      placeholder={t('branding.planFeatures')}
                    />
                    <input
                      type="text"
                      dir="ltr"
                      value={(config.plan?.featuresEn || [])[idx] || ''}
                      onChange={e => {
                        const nextEn = [...(config.plan?.featuresEn || config.plan?.features || [])];
                        while (nextEn.length < config.plan.features.length) nextEn.push('');
                        nextEn[idx] = e.target.value;
                        handleChange('plan', { ...config.plan, featuresEn: nextEn });
                      }}
                      style={{ ...inputStyle, padding: '8px 12px', fontSize: '12px', textAlign: 'left' }}
                      placeholder={t('branding.planFeatures') + ' ' + t('branding.english')}
                    />
                  </div>
                  <button
                    onClick={() => {
                      const next = (config.plan?.features || []).filter((_, i) => i !== idx);
                      const nextEn = (config.plan?.featuresEn || config.plan?.features || []).filter((_, i) => i !== idx);
                      handleChange('plan', { ...config.plan, features: next, featuresEn: nextEn });
                    }}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: '4px', marginTop: '6px', flexShrink: 0 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => handleChange('plan', { ...config.plan, features: [...(config.plan?.features || []), ''] })}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg3)', border: '1px dashed var(--line2)', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: 'var(--text2)', cursor: 'pointer', width: '100%', justifyContent: 'center' }}
            >
              <Plus size={14} />
              {t('branding.addFeature')}
            </button>
          </div>
        </div>

        {/* Annual Plan & Pricing */}
        <div className="card" style={{ marginBottom: '12px' }}>
          <div style={sectionHeader}>
            <CreditCard size={16} />
            <span>{isRTL ? 'الباقة السنوية' : 'Annual Plan'}</span>
            <label style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: 'var(--text2)', fontWeight: '600' }}>
              <input
                type="checkbox"
                checked={config.planAnnual?.visible || false}
                onChange={e => handleChange('planAnnual', { ...config.planAnnual, visible: e.target.checked })}
                style={{ width: '14px', height: '14px', accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
              {t('branding.showOnSite')}
            </label>
          </div>

          {/* Plan name + badge */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>{t('branding.planName')}</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input type="text" dir="rtl" value={config.planAnnual?.name || ''} onChange={e => handleChange('planAnnual', { ...config.planAnnual, name: e.target.value })} placeholder={t('branding.placeholderPlanName')} style={inputStyle} />
                <input type="text" dir="ltr" value={config.planAnnual?.nameEn || ''} onChange={e => handleChange('planAnnual', { ...config.planAnnual, nameEn: e.target.value })} placeholder={t('branding.placeholderPlanName') + ' ' + t('branding.english')} style={{ ...inputStyle, textAlign: 'left' }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>{t('branding.planBadge')}</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input type="text" dir="rtl" value={config.planAnnual?.badge || ''} onChange={e => handleChange('planAnnual', { ...config.planAnnual, badge: e.target.value })} placeholder={t('branding.placeholderBadge')} style={inputStyle} />
                <input type="text" dir="ltr" value={config.planAnnual?.badgeEn || ''} onChange={e => handleChange('planAnnual', { ...config.planAnnual, badgeEn: e.target.value })} placeholder={t('branding.placeholderBadge') + ' ' + t('branding.english')} style={{ ...inputStyle, textAlign: 'left' }} />
              </div>
            </div>
          </div>

          {/* Price + currency + period */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={labelStyle}>{t('branding.planPrice')}</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input type="number" min="0" value={config.planAnnual?.price || ''} onChange={e => handleChange('planAnnual', { ...config.planAnnual, price: e.target.value })} placeholder="999" style={{ ...inputStyle, height: '100%' }} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>{t('branding.planCurrency')}</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <select dir="rtl" value={config.planAnnual?.currency || 'ج.م'} onChange={e => handleChange('planAnnual', { ...config.planAnnual, currency: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="ج.م">ج.م (EGP)</option>
                  <option value="$">$ (USD)</option>
                  <option value="ر.س">ر.س (SAR)</option>
                  <option value="د.إ">د.إ (AED)</option>
                  <option value="€">€ (EUR)</option>
                </select>
                <select dir="ltr" value={config.planAnnual?.currencyEn || 'EGP'} onChange={e => handleChange('planAnnual', { ...config.planAnnual, currencyEn: e.target.value })} style={{ ...inputStyle, cursor: 'pointer', textAlign: 'left' }}>
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
                <select dir="rtl" value={config.planAnnual?.period || 'سنوياً'} onChange={e => handleChange('planAnnual', { ...config.planAnnual, period: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="شهرياً">{t('branding.monthly')}</option>
                  <option value="سنوياً">{t('branding.yearly')}</option>
                  <option value="مرة واحدة">{t('branding.onetime')}</option>
                </select>
                <select dir="ltr" value={config.planAnnual?.periodEn || 'yearly'} onChange={e => handleChange('planAnnual', { ...config.planAnnual, periodEn: e.target.value })} style={{ ...inputStyle, cursor: 'pointer', textAlign: 'left' }}>
                  <option value="monthly">monthly</option>
                  <option value="yearly">yearly</option>
                  <option value="one-time">one-time</option>
                </select>
              </div>
            </div>
          </div>

          {/* CTA text */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>{t('branding.ctaText')}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <input type="text" dir="rtl" value={config.planAnnual?.ctaText || ''} onChange={e => handleChange('planAnnual', { ...config.planAnnual, ctaText: e.target.value })} placeholder={t('branding.placeholderCta')} style={inputStyle} />
              <input type="text" dir="ltr" value={config.planAnnual?.ctaTextEn || ''} onChange={e => handleChange('planAnnual', { ...config.planAnnual, ctaTextEn: e.target.value })} placeholder={t('branding.placeholderCta') + ' ' + t('branding.english')} style={{ ...inputStyle, textAlign: 'left' }} />
            </div>
          </div>

          {/* Features list */}
          <div>
            <label style={labelStyle}>{t('branding.planFeatures')}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
              {(config.planAnnual?.features || []).map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input
                      type="text"
                      dir="rtl"
                      value={feat}
                      onChange={e => {
                        const next = [...(config.planAnnual?.features || [])];
                        next[idx] = e.target.value;
                        handleChange('planAnnual', { ...config.planAnnual, features: next });
                      }}
                      style={{ ...inputStyle, padding: '8px 12px', fontSize: '12px' }}
                      placeholder={t('branding.planFeatures')}
                    />
                    <input
                      type="text"
                      dir="ltr"
                      value={(config.planAnnual?.featuresEn || [])[idx] || ''}
                      onChange={e => {
                        const nextEn = [...(config.planAnnual?.featuresEn || config.planAnnual?.features || [])];
                        while (nextEn.length < config.planAnnual.features.length) nextEn.push('');
                        nextEn[idx] = e.target.value;
                        handleChange('planAnnual', { ...config.planAnnual, featuresEn: nextEn });
                      }}
                      style={{ ...inputStyle, padding: '8px 12px', fontSize: '12px', textAlign: 'left' }}
                      placeholder={t('branding.planFeatures') + ' ' + t('branding.english')}
                    />
                  </div>
                  <button
                    onClick={() => {
                      const next = (config.planAnnual?.features || []).filter((_, i) => i !== idx);
                      const nextEn = (config.planAnnual?.featuresEn || config.planAnnual?.features || []).filter((_, i) => i !== idx);
                      handleChange('planAnnual', { ...config.planAnnual, features: next, featuresEn: nextEn });
                    }}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: '4px', marginTop: '6px', flexShrink: 0 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => handleChange('planAnnual', { ...config.planAnnual, features: [...(config.planAnnual?.features || []), ''] })}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg3)', border: '1px dashed var(--line2)', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: 'var(--text2)', cursor: 'pointer', width: '100%', justifyContent: 'center' }}
            >
              <Plus size={14} />
              {t('branding.addFeature')}
            </button>
          </div>
        </div>

        {/* Advanced Dictionary Overrides */}
        <div className="card" style={{ marginBottom: '12px' }}>
          <div style={sectionHeader}>
            <Type size={16} />
            <span>{t('branding.advancedTitle')}</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '16px' }}>
            {t('branding.advancedSub')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {DICTIONARY_GROUPS.map(group => {
              const isOpen = openGroup === group.id;
              return (
                <div key={group.id} style={{ border: '1px solid var(--line2)', borderRadius: '8px', overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenGroup(isOpen ? null : group.id)}
                    style={{ width: '100%', background: 'var(--bg3)', border: 'none', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: 'var(--text)', fontSize: '13px', fontWeight: '600' }}
                  >
                    <span>{t(group.titleKey) || group.titleKey}</span>
                    <span style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text3)' }}>
                      ▼
                    </span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '16px', background: 'var(--bg2)', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--line2)' }}>
                      {group.keys.map(key => {
                        const defaultAr = LANG.ar[key] || '';
                        const defaultEn = LANG.en[key] || defaultAr;
                        const valAr = config.i18nOverrides?.ar?.[key] || '';
                        const valEn = config.i18nOverrides?.en?.[key] || '';
                        return (
                          <div key={key}>
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
                    </div>
                  )}
                </div>
              );
            })}
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
      <div style={{ display: 'flex', flexDirection: 'column', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--line)', background: 'var(--bg2)' }}>
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
          src="/gigsniper_v2.html?preview=true"
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
