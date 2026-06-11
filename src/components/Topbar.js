'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { CURRENCIES, PAGE_META } from '../data/mockData';

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
    setAiPanelOpen
  } = useBusiness();

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
      <div className="tb-breadcrumb">
        <span className="bc-section" id="tb-section">
          {t(meta.section)}
        </span>
        <span className="bc-sep">›</span>
        <span className="bc-page" id="tb-page">
          {t(meta.page)}
        </span>
      </div>

      <div className="tb-actions">
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
            <div className="curr-menu" id="curr-menu">
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

        {/* Theme Selector */}
        <div className={`theme-sel ${themeOpen ? 'open' : ''}`} ref={themeRef}>
          <button
            className="theme-pill"
            onClick={(e) => {
              e.stopPropagation();
              setThemeOpen(!themeOpen);
              setCurrOpen(false);
            }}
          >
            <div
              className="theme-dot"
              style={{
                background:
                  theme === 'dark' || theme === 'light'
                    ? '#FF6B35'
                    : theme === 'neon'
                    ? '#00F0B4'
                    : '#b060ff'
              }}
            ></div>
            <span id="theme-label">{t(currentThemeOpt.label)}</span> ▾
          </button>
          {themeOpen && (
            <div className="theme-menu" id="theme-menu">
              {themeOptions.map((opt) => (
                <div
                  key={opt.key}
                  className={`th-item ${opt.key === theme ? 'on' : ''}`}
                  onClick={() => {
                    setTheme(opt.key);
                    setThemeOpen(false);
                  }}
                  id={`ti-${opt.key}`}
                >
                  <div
                    className="th-swatch"
                    style={{
                      background: opt.swatch,
                      boxShadow: opt.glow ? opt.glow : 'none'
                    }}
                  ></div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '12px' }}>{opt.label}</div>
                    <div style={{ fontSize: '10px', color: 'var(--t3)' }}>{t(opt.desc)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI assistant toggle icon */}
        <button className="tb-icon" onClick={() => setAiPanelOpen((prev) => !prev)}>
          ✦
        </button>
      </div>
    </div>
  );
}
