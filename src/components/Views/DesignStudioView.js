'use client';

import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';

export default function DesignStudioView() {
  const { t, L, setAiPanelOpen } = useBusiness();
  const [activeTab, setActiveTab] = useState('logo'); // 'logo', 'social', 'cover', 'card', 'gallery'
  
  // Tab states for selection highlighting
  const [logoStyle, setLogoStyle] = useState('modern');
  const [logoType, setLogoType] = useState('wordmark');
  const [logoColor, setLogoColor] = useState('orange-purple');
  const [isGenerating, setIsGenerating] = useState(false);

  const [socialSize, setSocialSize] = useState('1080x1080');
  const [socialStyle, setSocialStyle] = useState('gradient-dark');

  const [coverType, setCoverType] = useState('linkedin');
  const [cardStyle, setCardStyle] = useState('dark-premium');

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const tabs = [
    { id: 'logo', label: L('🏷 Logo Maker', '🏷 صانع الشعارات') },
    { id: 'social', label: L('📱 Social Media', '📱 السوشيال ميديا') },
    { id: 'cover', label: L('🖼 Cover & Banner', '🖼 أغلفة ولافتات') },
    { id: 'card', label: L('💳 Business Card', '💳 بطاقة عمل') },
    { id: 'gallery', label: L('💾 Saved', '💾 المحفوظات') },
  ];

  return (
    <div className="pg on" id="pg-design">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">🎨</span>
          {L('Design Studio', 'استوديو التصميم')}
        </div>
        <div className="pg-actions">
          <button 
            className="btn btn-ghost" 
            style={{ fontSize: '12px', padding: '6px 13px' }} 
            onClick={() => setActiveTab('gallery')}
          >
            🖼 {L('My Designs', 'تصاميمي')}
          </button>
        </div>
      </div>

      <div className="tabs-bar">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'on' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ LOGO MAKER ═══ */}
      {activeTab === 'logo' && (
        <div className="tab-panel on">
          <div className="g2" style={{ alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Brand Name */}
              <div className="card">
                <div className="sec-hd"><div className="sec-title">✍️ {L('Brand Name', 'اسم العلامة')}</div></div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input className="inp" placeholder={L('Type your brand name...', 'اكتب اسم علامتك...')} style={{ flex: 1 }} />
                  <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '6px 12px', flexShrink: 0 }}>
                    ↗ {L('From Names', 'من الأسماء')}
                  </button>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <input className="inp" placeholder={L('Tagline (optional)', 'شعار لفظي (اختياري)')} style={{ fontSize: '12.5px' }} />
                </div>
              </div>

              {/* Style */}
              <div className="card">
                <div className="sec-hd"><div className="sec-title">🎨 {L('Logo Style', 'أسلوب الشعار')}</div></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { id: 'modern', icon: '✦', name: 'Modern / Minimal' },
                    { id: 'bold', icon: '💪', name: 'Bold / Strong' },
                    { id: 'luxury', icon: '💎', name: 'Luxury / Premium' },
                    { id: 'playful', icon: '🎉', name: 'Playful / Fun' },
                    { id: 'tech', icon: '🤖', name: 'Tech / AI' },
                    { id: 'arabic', icon: '🕌', name: 'Arabic Heritage' }
                  ].map(style => (
                    <div 
                      key={style.id}
                      onClick={() => setLogoStyle(style.id)}
                      style={{ padding: '10px 12px', borderRadius: '10px', border: logoStyle === style.id ? '2px solid var(--orange)' : '1px solid var(--edge)', background: logoStyle === style.id ? 'var(--or-d)' : 'var(--surface2)', cursor: 'pointer', textAlign: 'center' }}
                    >
                      <div style={{ fontSize: '18px', marginBottom: '3px' }}>{style.icon}</div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: logoStyle === style.id ? 'var(--orange)' : 'var(--t2)' }}>{style.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logo Type */}
              <div className="card">
                <div className="sec-hd"><div className="sec-title">🔤 {L('Logo Type', 'نوع الشعار')}</div></div>
                <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'wordmark', label: 'Wordmark' },
                    { id: 'monogram', label: 'Monogram' },
                    { id: 'icon+text', label: 'Icon + Text' },
                    { id: 'abstract', label: 'Abstract Mark' },
                    { id: 'badge', label: 'Badge / Emblem' }
                  ].map(type => (
                    <div 
                      key={type.id}
                      onClick={() => setLogoType(type.id)}
                      style={{ padding: '8px 14px', borderRadius: '8px', border: logoType === type.id ? '2px solid var(--orange)' : '1px solid var(--edge)', background: logoType === type.id ? 'var(--or-d)' : 'var(--surface2)', cursor: 'pointer', fontSize: '12.5px', fontWeight: 600, color: logoType === type.id ? 'var(--orange)' : 'var(--t2)' }}
                    >
                      {type.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="card">
                <div className="sec-hd"><div className="sec-title">🎨 {L('Color Scheme', 'الألوان')}</div></div>
                <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'orange-purple', gradient: 'linear-gradient(135deg,#FF6B35,#6C35FF)', name: 'Orange + Purple' },
                    { id: 'black-gold', gradient: 'linear-gradient(135deg,#111,#FFD700)', name: 'Black + Gold' },
                    { id: 'blue-white', gradient: 'linear-gradient(135deg,#0088CC,#fff)', name: 'Blue + White' },
                    { id: 'green-white', gradient: 'linear-gradient(135deg,#00d98b,#fff)', name: 'Green + White' },
                    { id: 'red-white', gradient: 'linear-gradient(135deg,#ef4444,#fff)', name: 'Red + White' },
                    { id: 'monochrome', gradient: 'linear-gradient(135deg,#111,#888)', name: 'Monochrome' }
                  ].map(color => (
                    <div 
                      key={color.id}
                      onClick={() => setLogoColor(color.id)}
                      style={{ padding: '7px 12px', borderRadius: '8px', border: logoColor === color.id ? '2px solid var(--orange)' : '1px solid var(--edge)', background: logoColor === color.id ? 'var(--or-d)' : 'var(--surface2)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: logoColor === color.id ? 'var(--orange)' : 'var(--t2)' }}
                    >
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: color.gradient, display: 'inline-block' }}></span>
                      {color.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Industry */}
              <div className="card">
                <div className="sec-hd"><div className="sec-title">🏢 {L('Industry', 'الصناعة')}</div></div>
                <select className="inp">
                  <option value="coaching">Coaching & Training</option>
                  <option value="tech">Tech / AI / SaaS</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="food">Food & Restaurant</option>
                </select>
              </div>

              <button className="btn btn-prime" onClick={handleGenerate} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>
                ✦ {L('Generate Logo', 'توليد الشعار')}
              </button>
            </div>

            {/* Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="card" style={{ position: 'sticky', top: '14px' }}>
                <div className="sec-hd">
                  <div className="sec-title">👁 {L('Live Preview', 'معاينة حية')}</div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '5px 11px' }}>💾 {L('Save', 'حفظ')}</button>
                  </div>
                </div>

                {isGenerating ? (
                  <div style={{ textAlign: 'center', padding: '28px' }}>
                    <div style={{ fontSize: '28px', animation: 'pulse 1s infinite' }}>✦</div>
                    <div style={{ fontSize: '13px', color: 'var(--t2)', marginTop: '8px' }}>{L('Designing your logo...', 'جاري تصميم الشعار...')}</div>
                  </div>
                ) : (
                  <div style={{ background: '#111', borderRadius: '14px', padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', transition: 'background .3s' }}>
                    <div style={{ textAlign: 'center', color: '#555' }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎨</div>
                      <div style={{ fontSize: '13px' }}>{L('Your logo will appear here', 'سيظهر شعارك هنا')}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SOCIAL MEDIA ═══ */}
      {activeTab === 'social' && (
        <div className="tab-panel on">
          <div className="g2" style={{ alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="card">
                <div className="sec-hd"><div className="sec-title">📐 {L('Post Size', 'حجم المنشور')}</div></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { id: '1080x1080', icon: '⬛', size: '1080×1080', desc: 'Square (IG/TikTok)' },
                    { id: '1080x1920', icon: '📱', size: '1080×1920', desc: 'Story / Reel' },
                    { id: '1200x628', icon: '🖼', size: '1200×628', desc: 'FB / LinkedIn' },
                    { id: '1280x720', icon: '📺', size: '1280×720', desc: 'YouTube Thumb' }
                  ].map(s => (
                    <div 
                      key={s.id}
                      onClick={() => setSocialSize(s.id)}
                      style={{ padding: '10px', borderRadius: '10px', border: socialSize === s.id ? '2px solid var(--orange)' : '1px solid var(--edge)', background: socialSize === s.id ? 'var(--or-d)' : 'var(--surface2)', cursor: 'pointer', textAlign: 'center' }}
                    >
                      <div style={{ fontSize: '15px', marginBottom: '3px' }}>{s.icon}</div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: socialSize === s.id ? 'var(--orange)' : 'var(--t2)' }}>{s.size}</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--t3)' }}>{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="sec-hd"><div className="sec-title">📝 {L('Content', 'المحتوى')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div><label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Main Title / Headline', 'العنوان الرئيسي')}</label><input className="inp" placeholder="e.g. 3 Ways to Double Your Income" /></div>
                  <div><label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Subtitle (optional)', 'عنوان فرعي')}</label><input className="inp" placeholder="e.g. Arabic Creator Edition 🔥" /></div>
                </div>
              </div>

              <div className="card">
                <div className="sec-hd"><div className="sec-title">🎨 {L('Design Style', 'نمط التصميم')}</div></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
                  {[
                    { id: 'gradient-dark', icon: '🌌', label: 'Dark Gradient' },
                    { id: 'clean-white', icon: '☁️', label: 'Clean White' },
                    { id: 'bold-typographic', icon: '⬛', label: 'Bold Type' },
                    { id: 'neon-glow', icon: '⚡', label: 'Neon Glow' }
                  ].map(s => (
                    <div 
                      key={s.id}
                      onClick={() => setSocialStyle(s.id)}
                      style={{ padding: '9px', borderRadius: '9px', border: socialStyle === s.id ? '2px solid var(--orange)' : '1px solid var(--edge)', background: socialStyle === s.id ? 'var(--or-d)' : 'var(--surface2)', cursor: 'pointer', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: socialStyle === s.id ? 'var(--orange)' : 'var(--t2)' }}
                    >
                      {s.icon} {s.label}
                    </div>
                  ))}
                </div>
              </div>

              <button className="btn btn-prime" onClick={handleGenerate} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>
                ✦ {L('Generate Design', 'توليد التصميم')}
              </button>
            </div>

            <div className="card" style={{ position: 'sticky', top: '14px' }}>
              <div className="sec-hd"><div className="sec-title">👁 {L('Preview', 'معاينة')}</div></div>
              {isGenerating ? (
                <div style={{ textAlign: 'center', padding: '28px' }}><div style={{ fontSize: '28px', animation: 'pulse 1s infinite' }}>🎨</div><div style={{ fontSize: '13px', color: 'var(--t2)', marginTop: '8px' }}>{L('Creating your design...', 'يتم إنشاء تصميمك...')}</div></div>
              ) : (
                <div style={{ background: '#111', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '280px' }}>
                  <div style={{ textAlign: 'center', color: '#555' }}><div style={{ fontSize: '28px', marginBottom: '8px' }}>📱</div><div style={{ fontSize: '13px' }}>{L('Social post design', 'تصميم السوشيال ميديا')}</div></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ COVER & BANNER ═══ */}
      {activeTab === 'cover' && (
        <div className="tab-panel on">
          <div className="g2" style={{ alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="card">
                <div className="sec-hd"><div className="sec-title">📐 {L('Banner Type', 'نوع الغلاف')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {[
                    { id: 'linkedin', icon: '💼', name: 'LinkedIn Banner', dims: '1584×396' },
                    { id: 'youtube', icon: '▶️', name: 'YouTube Channel Art', dims: '2560×1440' },
                    { id: 'twitter', icon: '🐦', name: 'X / Twitter Header', dims: '1500×500' }
                  ].map(c => (
                    <div 
                      key={c.id}
                      onClick={() => setCoverType(c.id)}
                      style={{ padding: '10px 14px', borderRadius: '10px', border: coverType === c.id ? '2px solid var(--orange)' : '1px solid var(--edge)', background: coverType === c.id ? 'var(--or-d)' : 'var(--surface2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                    >
                      <span style={{ fontSize: '18px' }}>{c.icon}</span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: coverType === c.id ? 'var(--orange)' : 'var(--t2)' }}>{c.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--t3)' }}>{c.dims}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="btn btn-prime" onClick={handleGenerate} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>
                ✦ {L('Generate Banner', 'توليد الغلاف')}
              </button>
            </div>
            
            <div className="card" style={{ position: 'sticky', top: '14px' }}>
              <div className="sec-hd"><div className="sec-title">👁 {L('Preview', 'معاينة')}</div></div>
              {isGenerating ? (
                <div style={{ textAlign: 'center', padding: '28px' }}><div style={{ fontSize: '28px', animation: 'pulse 1s infinite' }}>🖼</div><div style={{ fontSize: '13px', color: 'var(--t2)', marginTop: '8px' }}>{L('Creating banner...', 'يتم تصميم الغلاف...')}</div></div>
              ) : (
                <div style={{ background: '#111', borderRadius: '12px', overflow: 'hidden', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center', color: '#555' }}><div style={{ fontSize: '28px', marginBottom: '8px' }}>🖼</div><div style={{ fontSize: '13px' }}>{L('Banner preview', 'معاينة الغلاف')}</div></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ BUSINESS CARD ═══ */}
      {activeTab === 'card' && (
        <div className="tab-panel on">
          <div className="g2" style={{ alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="card">
                <div className="sec-hd"><div className="sec-title">👤 {L('Your Info', 'بياناتك')}</div></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div><label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Full Name', 'الاسم')}</label><input className="inp" placeholder="Ahmed Al-Rashid" /></div>
                  <div><label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Title / Role', 'المسمى الوظيفي')}</label><input className="inp" placeholder="Business Coach" /></div>
                </div>
              </div>
              <button className="btn btn-prime" onClick={handleGenerate} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>
                ✦ {L('Generate Business Card', 'توليد بطاقة العمل')}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'sticky', top: '14px' }}>
              <div className="card">
                <div className="sec-hd"><div className="sec-title">👁 {L('Front', 'الوجه')}</div></div>
                {isGenerating ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}><div style={{ fontSize: '24px', animation: 'pulse 1s infinite' }}>💳</div></div>
                ) : (
                  <div style={{ background: '#111', borderRadius: '10px', overflow: 'hidden', minHeight: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center', color: '#555' }}><div style={{ fontSize: '24px', marginBottom: '6px' }}>💳</div><div style={{ fontSize: '12px' }}>{L('Business card front', 'وجه البطاقة')}</div></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SAVED GALLERY ═══ */}
      {activeTab === 'gallery' && (
        <div className="tab-panel on">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
            <div className="empty-state" style={{ gridColumn: '1/-1', padding: '40px' }}>
              <div className="es-icon">🎨</div>
              <div className="es-title">{L('No saved designs yet', 'لا توجد تصاميم محفوظة')}</div>
              <div className="es-sub">{L('Generate logos, social posts, banners, or cards and save them here', 'قم بتوليد الشعارات واحفظها هنا')}</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
