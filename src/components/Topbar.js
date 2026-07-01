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
    currency,
    setCurrency,
    t,
    setAiPanelOpen,
    setMobileMenuOpen,
    tenantConfig,
    GC,
    saveGC,
    L,
    rates
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

  const [currOpen, setCurrOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [currSearch, setCurrSearch] = useState('');

  const currRef = useRef(null);
  const themeRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (currRef.current && !currRef.current.contains(event.target)) {
        setCurrOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target)) {
        setThemeOpen(false);
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
          <div style={{
            background: 'rgba(255, 107, 53, 0.1)',
            border: '1px solid var(--orange, #FF6B35)',
            color: 'var(--orange, #FF6B35)',
            fontSize: '11px',
            fontWeight: '800',
            padding: '4px 10px',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            marginLeft: lang === 'ar' ? '0' : '14px',
            marginRight: lang === 'ar' ? '14px' : '0',
            direction: 'rtl'
          }}>
            <span>🔥 {lang === 'ar' ? 'فترة تجريبية' : 'Trial Period'}: {getTrialDaysLeft()} {lang === 'ar' ? 'أيام متبقية' : 'days left'}</span>
          </div>
        )}
      </div>

      <div className="tb-actions">
        {/* EGP Rate Box */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,107,53,0.06), rgba(108,53,255,0.06))',
          border: '1px solid var(--edge)',
          borderRadius: '10px',
          padding: '4px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '11.5px',
          color: 'var(--t1)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginLeft: lang === 'ar' ? '0' : '8px',
          marginRight: lang === 'ar' ? '8px' : '0'
        }}>
          <span style={{ fontWeight: 'bold' }}>🇪🇬 {L('EGP Exchange:', 'صرف الجنيه:')}</span>
          <span>💵 $1 = {(rates?.EGP || 48.50).toFixed(2)} ج.م</span>
          <span style={{ color: 'var(--edge2)' }}>|</span>
          <span>💶 €1 = {(rates?.EGP && rates?.EUR ? (rates.EGP / rates.EUR) : 52.30).toFixed(2)} ج.م</span>
        </div>

        {/* AI Model Selector */}
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
        <button className="tb-icon" onClick={() => setAiPanelOpen((prev) => !prev)}>
          ✦
        </button>
      </div>
    </div>
  );
}
