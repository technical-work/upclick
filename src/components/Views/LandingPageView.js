'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { buildFullLP } from '../../utils/lpBuilder';

export default function LandingPageView() {
  const {
    lang,
    L,
    t,
    GC,
    saveGC,
    updateProfile,
    setLpPreviewOpen,
    setLpPreviewHtml
  } = useBusiness();

  const lpData = GC.landingPage || {};

  const [name, setName] = useState(lpData.name || GC.profile.name || 'Sara Hassan');
  const [niche, setNiche] = useState(lpData.niche || GC.profile.niche || 'Fashion & Lifestyle');
  const [offer, setOffer] = useState(lpData.offer || GC.profile.offer?.name || 'Style Masterclass');
  const [tagline, setTagline] = useState(lpData.tagline || L('Learn to grow on Instagram', 'تعلم كيفية النمو على انستجرام'));
  const [color, setColor] = useState(lpData.color || '#6c35ff');
  const [template, setTemplate] = useState(lpData.template || 'bold');
  const [price, setPrice] = useState(lpData.price ?? 29);
  const [lpCode, setLpCode] = useState(lpData.lpCode || '');

  // Brand Color Palette Options
  const brandColors = [
    { code: '#6c35ff', name: L('Purple', 'بنفسجي') },
    { code: '#FF6B35', name: L('Orange', 'برتقالي') },
    { code: '#00d98b', name: L('Emerald', 'أخضر زمردي') },
    { code: '#ff3d6e', name: L('Pink', 'وردي') },
    { code: '#3b82f6', name: L('Blue', 'أزرق') }
  ];

  // Template Styles
  const templates = [
    { key: 'bold', name: L('Bold Hero', 'بطل جريء') },
    { key: 'clean', name: L('Clean Minimal', 'نظيف ومينيمال') },
    { key: 'story', name: L('Story-Led', 'مبني على القصة') },
    { key: 'dark', name: L('Dark Premium', 'داكن بريميوم') },
    { key: 'gradient', name: L('Gradient Pop', 'جراديانت ملفت') },
    { key: 'arabic', name: L('Arabic Style', 'بنمط عربي') }
  ];

  const saveLPData = (updatedFields) => {
    const updatedGC = {
      ...GC,
      landingPage: {
        ...(GC.landingPage || {}),
        ...updatedFields
      }
    };
    saveGC(updatedGC);
  };

  const handleGenerate = () => {
    const code = buildFullLP(name, niche, offer, tagline, color, lang === 'ar', template, price);
    setLpCode(code);
    setLpPreviewHtml(code);
    saveLPData({ name, niche, offer, tagline, color, template, price, lpCode: code });
  };

  useEffect(() => {
    handleGenerate();
  }, [name, niche, offer, tagline, color, template, price, lang]);

  // Sync state if GC updates
  useEffect(() => {
    if (GC.landingPage) {
      setName(GC.landingPage.name || GC.profile.name || 'Sara Hassan');
      setNiche(GC.landingPage.niche || GC.profile.niche || 'Fashion & Lifestyle');
      setOffer(GC.landingPage.offer || GC.profile.offer?.name || 'Style Masterclass');
      setTagline(GC.landingPage.tagline || L('Learn to grow on Instagram', 'تعلم كيفية النمو على انستجرام'));
      setColor(GC.landingPage.color || '#6c35ff');
      setTemplate(GC.landingPage.template || 'bold');
      setPrice(GC.landingPage.price ?? 29);
      setLpCode(GC.landingPage.lpCode || '');
    }
  }, [GC.landingPage]);

  const handleCopy = () => {
    if (!lpCode) return;
    navigator.clipboard.writeText(lpCode)
      .then(() => alert(L('Code copied to clipboard! 📋', 'تم نسخ الكود! 📋')))
      .catch(() => alert('Could not copy'));
  };

  const handleFullscreen = () => {
    if (!lpCode) return;
    const blob = new Blob([lpCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="pg on" id="pg-landing">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">⚡</span>
          <span>{L('Landing Page AI', 'مولّد صفحة الهبوط')}</span>
        </div>
        <div className="pg-actions">
          <button className="btn btn-ghost" onClick={handleCopy}>
            📋 {L('Copy HTML Code', 'نسخ كود HTML')}
          </button>
          <button className="btn btn-prime" onClick={() => setLpPreviewOpen(true)}>
            🔍 {L('Fullscreen', 'شاشة كاملة')}
          </button>
        </div>
      </div>

      <div className="g21">
        {/* Left Side: Controls */}
        <div className="card">
          <div className="sec-hd">
            <div className="sec-title">{L('Your Settings', 'الإعدادات')}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                {L('Your Name / Brand', 'الاسم / البراند')}
              </label>
              <input
                className="inp"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={(e) => saveLPData({ name: e.target.value })}
                placeholder="Sara Hassan"
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                {L('Your Niche', 'النيش')}
              </label>
              <input
                className="inp"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                onBlur={(e) => saveLPData({ niche: e.target.value })}
                placeholder="Fashion & Lifestyle"
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                {L('Main Offer / Product', 'العرض الرئيسي / المنتج')}
              </label>
              <input
                className="inp"
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                onBlur={(e) => saveLPData({ offer: e.target.value })}
                placeholder="Style Masterclass"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Price ($)', 'السعر ($)')}
                </label>
                <input
                  className="inp"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                  onBlur={(e) => saveLPData({ price: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Template Style', 'نمط القالب')}
                </label>
                <select
                  className="inp"
                  value={template}
                  onChange={(e) => { setTemplate(e.target.value); saveLPData({ template: e.target.value }); }}
                >
                  {templates.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                {L('Tagline', 'العنوان الفرعي للمنتج')}
              </label>
              <input
                className="inp"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                onBlur={(e) => saveLPData({ tagline: e.target.value })}
                placeholder="Learn to grow on Instagram"
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '8px' }}>
                {L('Brand Accent Color', 'لون الهوية')}
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {brandColors.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => { setColor(c.code); saveLPData({ color: c.code }); }}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: c.code,
                      border: color === c.code ? '2px solid #fff' : 'none',
                      cursor: 'pointer',
                      boxShadow: color === c.code ? '0 0 6px var(--orange)' : 'none'
                    }}
                    title={c.name}
                  />
                ))}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => { setColor(e.target.value); saveLPData({ color: e.target.value }); }}
                  style={{
                    width: '28px',
                    height: '28px',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    background: 'none'
                  }}
                />
              </div>
            </div>

            <button className="btn btn-prime" onClick={handleGenerate} style={{ marginTop: '8px' }}>
              ✦ {L('Regenerate Landing Page', 'إعادة توليد الصفحة')}
            </button>
          </div>
        </div>

        {/* Right Side: Live Iframe Preview */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '600px', padding: '0' }}>
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--edge)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--surface2)'
            }}
          >
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--t1)' }}>
              🖥️ {L('Live Desktop Preview', 'معاينة مباشرة')}
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                className="btn btn-ghost"
                style={{ padding: '3px 8px', fontSize: '11px', height: '26px' }}
                onClick={handleFullscreen}
              >
                🔗 {L('Open New Tab', 'افتح في علامة جديدة')}
              </button>
            </div>
          </div>
          <div style={{ flex: 1, padding: '12px', background: 'var(--surface3)' }}>
            {lpCode ? (
              <iframe
                srcDoc={lpCode}
                style={{
                  width: '100%',
                  height: '100%',
                  border: '1px solid var(--edge)',
                  borderRadius: '8px',
                  background: '#fff'
                }}
                title="LP live preview"
              />
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)' }}>
                {L('Click Generate to see preview', 'اضغط توليد لرؤية المعاينة')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
