'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { CURRENCIES, PAGE_META } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export default function Topbar() {
  const {
    lang,
    setLang,
    theme,
    setTheme,
    currentPage,
    setCurrentPage,
    currency,
    setCurrency,
    t,
    setAiPanelOpen,
    setMobileMenuOpen,
    tenantConfig,
    GC,
    saveGC,
    L,
    rates,
    guideActive,
    setGuideActive,
    guideFlowKey,
    setGuideFlowKey
  } = useBusiness();

  const { userData } = useAuth();

  const getTrialDaysLeft = () => {
    if (!userData?.trialStartedAt) return 0;
    const trialDays = tenantConfig?.freeTrial?.days || 7;
    const startMs = new Date(userData.trialStartedAt).getTime();
    const expiresMs = startMs + trialDays * 86400000;
    const diff = expiresMs - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  };

  // Calculations for AI Credits progress
  const planStarterCredits = tenantConfig?.planStarterCredits !== undefined ? Number(tenantConfig.planStarterCredits) : 200;
  const planGrowthCredits = tenantConfig?.planGrowthCredits !== undefined ? Number(tenantConfig.planGrowthCredits) : 600;
  const planProCredits = tenantConfig?.planProCredits !== undefined ? Number(tenantConfig.planProCredits) : 2000;

  const currentPlanName = userData?.plan || 'Starter';
  const userCredits = userData?.aiCredits !== undefined ? Number(userData.aiCredits) : planStarterCredits;

  let totalPlanCredits = planStarterCredits;
  if (currentPlanName.toLowerCase().includes('growth')) {
    totalPlanCredits = planGrowthCredits;
  } else if (currentPlanName.toLowerCase().includes('pro') || currentPlanName.toLowerCase().includes('lifetime')) {
    totalPlanCredits = planProCredits;
  }

  const creditProgress = Math.min(100, Math.max(0, (userCredits / totalPlanCredits) * 100));

  const [currOpen, setCurrOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const [currSearch, setCurrSearch] = useState('');

  const currRef = useRef(null);
  const themeRef = useRef(null);
  const mobileSettingsRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (currRef.current && !currRef.current.contains(event.target)) {
        setCurrOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target)) {
        setThemeOpen(false);
      }
      if (mobileSettingsRef.current && !mobileSettingsRef.current.contains(event.target)) {
        setMobileSettingsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const meta = PAGE_META[currentPage] || { section: 'Command Center', page: currentPage };

  const filteredCurrencies = CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(currSearch.toLowerCase()) ||
      c.name.toLowerCase().includes(currSearch.toLowerCase())
  );

  const themeOptions = [
    { key: 'dark', label: 'Dark', desc: 'UpKlick default', swatch: 'linear-gradient(135deg,#08080f 40%,#FF6B35)' },
    { key: 'light', label: 'Light', desc: 'Clean white', swatch: 'linear-gradient(135deg,#f5f3ff 40%,#FF6B35)' },
    { key: 'neon', label: 'Neon', desc: 'Cyber grid', swatch: 'linear-gradient(135deg,#010a05 40%,#00f0b0)', glow: '0 0 6px rgba(0,240,176,.4)' },
    { key: 'cosmic', label: 'Cosmic', desc: 'Deep violet', swatch: 'linear-gradient(135deg,#050210 40%,#b060ff)', glow: '0 0 6px rgba(176,96,255,.4)' }
  ];

  const currentThemeOpt = themeOptions.find((t) => t.key === theme) || themeOptions[0];

  return (
    <div id="tb">
      <button className="tb-menu-toggle" onClick={() => setMobileMenuOpen(true)}>
        ☰
      </button>
      <div className="tb-breadcrumb" style={{ display: 'flex', alignItems: 'center' }}>
        <span className="bc-section" id="tb-section">
          {t(meta.section)}
        </span>
        <span className="bc-sep">›</span>
        <span className="bc-page" id="tb-page">
          {t(meta.page)}
        </span>

        {userData?.isTrial && getTrialDaysLeft() > 0 && (
          <div className="trial-badge" style={{ direction: 'rtl' }}>
            <span className="tb-label">{lang === 'ar' ? 'فترة تجريبية' : 'Trial Period'}: </span>
            <span>🔥 {getTrialDaysLeft()} {lang === 'ar' ? 'أيام متبقية' : 'days left'}</span>
          </div>
        )}
      </div>

      <style>{`
        .tb-credits-wrapper {
          background: linear-gradient(135deg, rgba(108,53,255,0.06), rgba(255,107,53,0.06));
          border: 1px solid var(--edge);
          border-radius: 10px;
          padding: 4px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: var(--t1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          cursor: pointer;
          min-width: 300px;
          flex-shrink: 0;
          box-sizing: border-box;
          transition: all 0.2s ease;
          margin-left: ${lang === 'ar' ? '8px' : '0'};
          margin-right: ${lang === 'ar' ? '0' : '8px'};
        }
        .tb-credits-wrapper:hover {
          background: linear-gradient(135deg, rgba(108,53,255,0.1), rgba(255,107,53,0.1));
          border-color: var(--orange);
          transform: translateY(-1px);
        }
        .tb-credits-bar-container {
          width: 100%; 
          height: 4px; 
          background: var(--surface2); 
          border-radius: 3px; 
          overflow: hidden; 
          border: 1px solid var(--edge2);
          margin-top: 2px;
        }
        @media (max-width: 768px) {
          .tb-credits-wrapper {
            margin-left: 0 !important;
            margin-right: 0 !important;
            width: 100% !important;
            min-width: 100% !important;
            padding: 4px 12px;
            font-size: 10.5px;
            order: 3;
            margin-top: 6px !important;
          }
        }
      `}</style>

      {/* Credit Progress Box (Always visible / responsive) */}
      {userData && (
        <div
          onClick={() => setCurrentPage('billing')}
          className="tb-credits-wrapper"
          title={L('Click to view subscription details', 'اضغط لعرض تفاصيل الاشتراك')}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 'bold' }}>⚡ {L('Credits:', 'الرصيد:')}</span>
              <span style={{ fontWeight: '800', color: 'var(--orange)' }}>
                {userCredits} / {totalPlanCredits} <span style={{ fontSize: '9px', opacity: 0.8 }}>cr</span>
              </span>
            </div>
            <div className="tb-credits-bar-container">
              <div style={{
                width: `${creditProgress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, var(--orange) 0%, var(--purple) 100%)',
                borderRadius: '3px',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>
      )}

      <div className="tb-actions">
        {/* EGP Rate Box */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,107,53,0.06), rgba(108,53,255,0.06))',
          border: '1px solid var(--edge)',
          borderRadius: '10px',
          padding: '4px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11.5px',
          color: 'var(--t1)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginLeft: lang === 'ar' ? '0' : '8px',
          marginRight: lang === 'ar' ? '8px' : '0'
        }}>
          <span style={{ fontWeight: 'bold' }}>🇪🇬 {L('EGP Exchange:', 'صرف الجنيه:')}</span>
          <span>💵 $1 = {(rates?.EGP || 48.50).toFixed(2)} ج.م</span>
        </div>

        {/* AI Model Selector */}
        {GC?.integrations?.bynaraConnected && (
          <div className="model-sel">
            <select
              className="inp"
              style={{
                padding: '0 8px',
                fontSize: '11px',
                height: '28px',
                borderRadius: '6px',
                background: 'transparent',
                border: '1px solid var(--edge)',
                color: 'var(--t2)',
                outline: 'none',
                cursor: 'pointer',
                minWidth: '130px'
              }}
              value={GC?.integrations?.bynaraModel || 'mistral-large'}
              onChange={(e) => {
                saveGC({
                  ...GC,
                  integrations: {
                    ...(GC?.integrations || {}),
                    bynaraModel: e.target.value,
                    bynaraConnected: true
                  }
                });
              }}
            >
              {[
                'mistral-large',
                'mimo-v2.5-free',
                'mimo-v2.5-pro-free',
                'mistral-medium-3-5',
                'mimo-v2.5-hermes',
                'mimo-v2.5-pro-hermes'
              ].map(m => (
                <option key={m} value={m} style={{ background: 'var(--surface)', color: 'var(--t1)' }}>{m}</option>
              ))}
            </select>
          </div>
        )}

        {/* Language Switcher */}
        <div className="lang-sw">
          <button
            className={`lang-btn ${lang === 'en' ? 'on' : ''}`}
            onClick={() => setLang('en')}
            id="btn-en"
          >
            EN
          </button>
          <button
            className={`lang-btn ${lang === 'ar' ? 'on' : ''}`}
            onClick={() => setLang('ar')}
            id="btn-ar"
          >
            AR
          </button>
        </div>

        {/* Currency Selector */}
        <div className={`curr-sel ${currOpen ? 'open' : ''}`} ref={currRef}>
          <button
            className="curr-pill"
            onClick={(e) => {
              e.stopPropagation();
              setCurrOpen(!currOpen);
              setThemeOpen(false);
            }}
          >
            <span id="curr-flag">{currency.flag}</span>
            <span id="curr-label">{currency.code}</span> ▾
          </button>
          {currOpen && (
            <div
              className="curr-menu open"
              id="curr-menu"
              style={lang === 'ar' ? { left: 0, right: 'auto' } : { right: 0, left: 'auto' }}
            >
              <div className="curr-search-wrap">
                <input
                  className="inp curr-search"
                  id="curr-search"
                  placeholder="Search..."
                  value={currSearch}
                  onChange={(e) => setCurrSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="curr-list" id="curr-list">
                {filteredCurrencies.map((c) => (
                  <div
                    key={c.code}
                    className={`curr-item ${c.code === currency.code ? 'on' : ''}`}
                    onClick={() => {
                      setCurrency(c.code);
                      setCurrOpen(false);
                      setCurrSearch('');
                    }}
                  >
                    <span className="curr-item-flag">{c.flag}</span>
                    <span className="curr-item-code">{c.code}</span>
                    <span className="curr-item-name">{c.name}</span>
                    <span className="curr-item-symbol">{c.symbol}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Switcher */}
        <div className="lang-sw">
          <button
            className={`lang-btn ${theme === 'dark' ? 'on' : ''}`}
            onClick={() => setTheme('dark')}
          >
            {t('Dark', 'داكن')}
          </button>
          <button
            className={`lang-btn ${theme === 'light' ? 'on' : ''}`}
            onClick={() => setTheme('light')}
          >
            {t('Light', 'فاتح')}
          </button>
        </div>

        {/* AI assistant toggle icon */}
        <button
          className="tb-icon"
          onClick={() => {
            if (guideActive && guideFlowKey) {
              setGuideActive(false);
              setGuideFlowKey('');
              setAiPanelOpen(true);
            } else {
              setAiPanelOpen((prev) => !prev);
            }
          }}
        >
          ✦
        </button>
      </div>

      {/* MOBILE SETTINGS POPUP */}
      <div className="tb-mobile-actions" ref={mobileSettingsRef} style={{ position: 'relative' }}>
        <button
          className="btn btn-ghost"
          onClick={() => setMobileSettingsOpen(!mobileSettingsOpen)}
          style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}
        >
          ⚙️ {lang === 'ar' ? 'الإعدادات العامة' : 'General Settings'}
        </button>

        {mobileSettingsOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            [lang === 'ar' ? 'left' : 'right']: 0,
            marginTop: '8px',
            background: 'var(--surface)',
            border: '1px solid var(--edge)',
            borderRadius: '12px',
            padding: '16px',
            width: '280px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            zIndex: 100
          }}>
            {/* EGP Rate Box */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255,107,53,0.04), rgba(108,53,255,0.04))',
              border: '1px solid var(--edge)',
              borderRadius: '8px',
              padding: '8px 10px',
              fontSize: '11px',
              color: 'var(--t1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              textAlign: lang === 'ar' ? 'right' : 'left'
            }}>
              <span style={{ fontWeight: 'bold' }}>🇪🇬 {lang === 'ar' ? 'صرف الجنيه:' : 'EGP Exchange:'}</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                <span>💵 $1 = {(rates?.EGP || 48.50).toFixed(2)} ج.م</span>
              </div>
            </div>

            {/* Language & Theme Selectors inline */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: lang === 'ar' ? 'right' : 'left' }}>
              {/* Language Switcher */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10.5px', color: 'var(--t3)', fontWeight: 'bold' }}>{lang === 'ar' ? '🌐 اللغة:' : '🌐 Language:'}</label>
                <div className="lang-sw" style={{ width: '100%', display: 'flex' }}>
                  <button
                    className={`lang-btn ${lang === 'en' ? 'on' : ''}`}
                    onClick={() => setLang('en')}
                    style={{ flex: 1, padding: '5px 0', fontSize: '11px' }}
                  >
                    EN
                  </button>
                  <button
                    className={`lang-btn ${lang === 'ar' ? 'on' : ''}`}
                    onClick={() => setLang('ar')}
                    style={{ flex: 1, padding: '5px 0', fontSize: '11px' }}
                  >
                    AR
                  </button>
                </div>
              </div>

              {/* Theme Switcher */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '10.5px', color: 'var(--t3)', fontWeight: 'bold' }}>{lang === 'ar' ? '🎨 المظهر:' : '🎨 Theme:'}</label>
                <div className="lang-sw" style={{ width: '100%', display: 'flex' }}>
                  <button
                    className={`lang-btn ${theme === 'dark' ? 'on' : ''}`}
                    onClick={() => setTheme('dark')}
                    style={{ flex: 1, padding: '5px 0', fontSize: '11px' }}
                  >
                    {lang === 'ar' ? 'داكن' : 'Dark'}
                  </button>
                  <button
                    className={`lang-btn ${theme === 'light' ? 'on' : ''}`}
                    onClick={() => setTheme('light')}
                    style={{ flex: 1, padding: '5px 0', fontSize: '11px' }}
                  >
                    {lang === 'ar' ? 'فاتح' : 'Light'}
                  </button>
                </div>
              </div>
            </div>

            {/* Currency Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: lang === 'ar' ? 'right' : 'left' }}>
              <label style={{ fontSize: '10.5px', color: 'var(--t3)', fontWeight: 'bold' }}>{lang === 'ar' ? '💵 العملة:' : '💵 Currency:'}</label>
              <select
                className="inp"
                style={{
                  padding: '6px 8px',
                  fontSize: '11.5px',
                  borderRadius: '6px',
                  background: 'var(--surface2)',
                  border: '1px solid var(--edge)',
                  color: 'var(--t2)',
                  outline: 'none',
                  cursor: 'pointer',
                  width: '100%'
                }}
                value={currency?.code || 'USD'}
                onChange={(e) => {
                  setCurrency(e.target.value);
                }}
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code} style={{ background: 'var(--surface)', color: 'var(--t1)' }}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
