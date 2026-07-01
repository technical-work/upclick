'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { useAuth } from '../../context/AuthContext';
import { storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function DesignStudioView() {
  const { t, L, setAiPanelOpen, GC, saveGC, showToast } = useBusiness();
  const { user } = useAuth();
  
  // Image URL states
  const [generatedLogoUrl, setGeneratedLogoUrl] = useState('');
  const [generatedSocialUrl, setGeneratedSocialUrl] = useState('');
  const [generatedCoverUrl, setGeneratedCoverUrl] = useState('');
  const [generatedCardUrl, setGeneratedCardUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('logo'); // 'logo', 'social', 'cover', 'card', 'gallery'
  
  const designData = GC.designStudio || {};
  const savedLogo = designData.logo || {};
  const savedSocial = designData.social || {};
  const savedCover = designData.cover || {};
  const savedCard = designData.card || {};

  // Logo maker fields
  const [logoBrandName, setLogoBrandName] = useState(savedLogo.brandName || '');
  const [logoTagline, setLogoTagline] = useState(savedLogo.tagline || '');
  const [logoStyle, setLogoStyle] = useState(savedLogo.logoStyle || 'modern');
  const [logoType, setLogoType] = useState(savedLogo.logoType || 'wordmark');
  const [logoColor, setLogoColor] = useState(savedLogo.logoColor || 'orange-purple');
  const [logoIndustry, setLogoIndustry] = useState(savedLogo.industry || 'coaching');

  // Social fields
  const [socialSize, setSocialSize] = useState(savedSocial.socialSize || '1080x1080');
  const [socialHeadline, setSocialHeadline] = useState(savedSocial.headline || '');
  const [socialSubtitle, setSocialSubtitle] = useState(savedSocial.subtitle || '');
  const [socialStyle, setSocialStyle] = useState(savedSocial.socialStyle || 'gradient-dark');

  // Cover fields
  const [coverType, setCoverType] = useState(savedCover.coverType || 'linkedin');

  // Card fields
  const [cardFullName, setCardFullName] = useState(savedCard.fullName || '');
  const [cardTitle, setCardTitle] = useState(savedCard.title || '');
  const [cardStyle, setCardStyle] = useState(savedCard.cardStyle || 'dark-premium');

  // Saved gallery
  const [savedDesigns, setSavedDesigns] = useState(designData.savedDesigns || []);

  const [isGenerating, setIsGenerating] = useState(false);

  // Sync state if GC updates
  useEffect(() => {
    if (GC.designStudio) {
      const logo = GC.designStudio.logo || {};
      const social = GC.designStudio.social || {};
      const cover = GC.designStudio.cover || {};
      const card = GC.designStudio.card || {};

      setLogoBrandName(logo.brandName || '');
      setLogoTagline(logo.tagline || '');
      setLogoStyle(logo.logoStyle || 'modern');
      setLogoType(logo.logoType || 'wordmark');
      setLogoColor(logo.logoColor || 'orange-purple');
      setLogoIndustry(logo.industry || 'coaching');

      setSocialSize(social.socialSize || '1080x1080');
      setSocialHeadline(social.headline || '');
      setSocialSubtitle(social.subtitle || '');
      setSocialStyle(social.socialStyle || 'gradient-dark');

      setCoverType(cover.coverType || 'linkedin');

      setCardFullName(card.fullName || '');
      setCardTitle(card.title || '');
      setCardStyle(card.cardStyle || 'dark-premium');

      setSavedDesigns(GC.designStudio.savedDesigns || []);
    }
  }, [GC.designStudio]);

  const saveDesignStudioData = (section, updatedFields) => {
    const updatedGC = {
      ...GC,
      designStudio: {
        ...(GC.designStudio || {}),
        [section]: {
          ...(GC.designStudio?.[section] || {}),
          ...updatedFields
        }
      }
    };
    saveGC(updatedGC);
  };

  const saveSavedDesigns = (updatedList) => {
    const updatedGC = {
      ...GC,
      designStudio: {
        ...(GC.designStudio || {}),
        savedDesigns: updatedList
      }
    };
    saveGC(updatedGC);
  };

  const getPromptForTab = (tab) => {
    if (tab === 'logo') {
      return `A high-quality, professional logo design for a brand named "${logoBrandName}". ${logoTagline ? `With tagline "${logoTagline}".` : ''} Logo style is ${logoStyle}. Logo type is ${logoType}. The color scheme is ${logoColor}. The industry is ${logoIndustry}. Modern, clean, vectors, centered, no background, high resolution.`;
    }
    if (tab === 'social') {
      return `A premium, professionally designed social media graphic post. Main headline: "${socialHeadline}". Subtitle: "${socialSubtitle}". Size aspect ratio matches ${socialSize}. Design style is ${socialStyle}. Vibrant, modern graphic design, high contrast, clean typography.`;
    }
    if (tab === 'cover') {
      const coverNames = { linkedin: 'LinkedIn banner', youtube: 'YouTube Channel Art banner', twitter: 'X/Twitter header banner' };
      return `A high-quality, professional digital banner for ${coverNames[coverType] || 'LinkedIn'}. Suitable for ${logoIndustry} industry. Elegant, abstract, modern corporate style, high resolution, suitable for a horizontal profile banner.`;
    }
    if (tab === 'card') {
      return `A premium modern business card design. Showcases name: "${cardFullName}" and title/role: "${cardTitle}". Sophisticated, elegant, minimal layout, high-end professional corporate style, centered.`;
    }
    return '';
  };

  const handleGenerate = async () => {
    const prompt = getPromptForTab(activeTab);
    if (!prompt) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.uid,
          prompt: prompt
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate image');
      }

      const data = await res.json();
      const url = data.url;

      if (activeTab === 'logo') setGeneratedLogoUrl(url);
      else if (activeTab === 'social') setGeneratedSocialUrl(url);
      else if (activeTab === 'cover') setGeneratedCoverUrl(url);
      else if (activeTab === 'card') setGeneratedCardUrl(url);

      showToast(L('Image generated successfully!', 'تم توليد الصورة بنجاح!'));
    } catch (e) {
      console.error("Error generating image:", e);
      showToast(L(`Error: ${e.message}`, `خطأ: ${e.message}`));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (url, type) => {
    if (!url) return;
    setIsSaving(true);
    try {
      showToast(L('Downloading and processing image...', 'جاري تحميل ومعالجة الصورة...'));
      const response = await fetch(url);
      const blob = await response.clone().blob();

      let permanentUrl = '';
      
      // 1. If Cloudinary is connected, upload to Cloudinary
      if (GC?.integrations?.cloudinaryConnected && GC?.integrations?.cloudinaryCloudName && GC?.integrations?.cloudinaryUploadPreset) {
        showToast(L('Uploading to Cloudinary...', 'جاري الرفع إلى Cloudinary...'));
        const formData = new FormData();
        formData.append('file', blob);
        formData.append('upload_preset', GC.integrations.cloudinaryUploadPreset);
        
        const cRes = await fetch(`https://api.cloudinary.com/v1_1/${GC.integrations.cloudinaryCloudName}/auto/upload`, {
          method: 'POST',
          body: formData
        });
        
        if (cRes.ok) {
          const cData = await cRes.json();
          permanentUrl = cData.secure_url;
        } else {
          console.warn("Cloudinary upload failed, falling back to Firebase Storage.");
        }
      }

      // 2. If Cloudinary is not connected or failed, upload to Firebase Storage
      if (!permanentUrl) {
        showToast(L('Uploading to Firebase Storage...', 'جاري الرفع إلى Firebase...'));
        const filename = `designs/${user?.uid}/${type}_${Date.now()}.png`;
        const storageRef = ref(storage, filename);
        const snapshot = await uploadBytes(storageRef, blob);
        permanentUrl = await getDownloadURL(snapshot.ref);
      }

      if (permanentUrl) {
        const newDesign = {
          id: Date.now(),
          type,
          url: permanentUrl,
          date: new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')
        };
        const updatedDesigns = [newDesign, ...savedDesigns];
        setSavedDesigns(updatedDesigns);
        saveSavedDesigns(updatedDesigns);
        showToast(L('Design saved successfully!', 'تم حفظ التصميم بنجاح!'));
      } else {
        throw new Error('Failed to obtain a permanent upload URL.');
      }
    } catch (e) {
      console.error("Error saving image:", e);
      showToast(L(`Failed to save: ${e.message}`, `فشل الحفظ: ${e.message}`));
    } finally {
      setIsSaving(false);
    }
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
                  <input 
                    className="inp" 
                    value={logoBrandName} 
                    onChange={(e) => setLogoBrandName(e.target.value)} 
                    onBlur={(e) => saveDesignStudioData('logo', { brandName: e.target.value })} 
                    placeholder={L('Type your brand name...', 'اكتب اسم علامتك...')} 
                    style={{ flex: 1 }} 
                  />
                  <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '6px 12px', flexShrink: 0 }}>
                    ↗ {L('From Names', 'من الأسماء')}
                  </button>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <input 
                    className="inp" 
                    value={logoTagline} 
                    onChange={(e) => setLogoTagline(e.target.value)} 
                    onBlur={(e) => saveDesignStudioData('logo', { tagline: e.target.value })} 
                    placeholder={L('Tagline (optional)', 'شعار لفظي (اختياري)')} 
                    style={{ fontSize: '12.5px' }} 
                  />
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
                      onClick={() => { setLogoStyle(style.id); saveDesignStudioData('logo', { logoStyle: style.id }); }}
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
                      onClick={() => { setLogoType(type.id); saveDesignStudioData('logo', { logoType: type.id }); }}
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
                      onClick={() => { setLogoColor(color.id); saveDesignStudioData('logo', { logoColor: color.id }); }}
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
                <select className="inp" value={logoIndustry} onChange={(e) => { setLogoIndustry(e.target.value); saveDesignStudioData('logo', { industry: e.target.value }); }}>
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
                  {generatedLogoUrl && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        className="btn btn-ghost" 
                        style={{ fontSize: '12px', padding: '5px 11px' }}
                        onClick={() => handleSave(generatedLogoUrl, 'logo')}
                        disabled={isSaving}
                      >
                        💾 {isSaving ? L('Saving...', 'جاري الحفظ...') : L('Save', 'حفظ')}
                      </button>
                    </div>
                  )}
                </div>

                {isGenerating ? (
                  <div style={{ textAlign: 'center', padding: '28px' }}>
                    <div style={{ fontSize: '28px', animation: 'pulse 1s infinite' }}>✦</div>
                    <div style={{ fontSize: '13px', color: 'var(--t2)', marginTop: '8px' }}>{L('Designing your logo...', 'جاري تصميم الشعار...')}</div>
                  </div>
                ) : generatedLogoUrl ? (
                  <div style={{ textAlign: 'center', background: '#111', borderRadius: '14px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                    <img src={generatedLogoUrl} alt="Generated Logo" style={{ maxWidth: '100%', borderRadius: '10px', maxHeight: '250px' }} />
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
                      onClick={() => { setSocialSize(s.id); saveDesignStudioData('social', { socialSize: s.id }); }}
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
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Main Title / Headline', 'العنوان الرئيسي')}</label>
                    <input 
                      className="inp" 
                      value={socialHeadline} 
                      onChange={(e) => setSocialHeadline(e.target.value)} 
                      onBlur={(e) => saveDesignStudioData('social', { headline: e.target.value })} 
                      placeholder="e.g. 3 Ways to Double Your Income" 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Subtitle (optional)', 'عنوان فرعي')}</label>
                    <input 
                      className="inp" 
                      value={socialSubtitle} 
                      onChange={(e) => setSocialSubtitle(e.target.value)} 
                      onBlur={(e) => saveDesignStudioData('social', { subtitle: e.target.value })} 
                      placeholder="e.g. Arabic Creator Edition 🔥" 
                    />
                  </div>
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
                      onClick={() => { setSocialStyle(s.id); saveDesignStudioData('social', { socialStyle: s.id }); }}
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
              <div className="sec-hd">
                <div className="sec-title">👁 {L('Preview', 'معاينة')}</div>
                {generatedSocialUrl && (
                  <button 
                    className="btn btn-ghost" 
                    style={{ fontSize: '12px', padding: '5px 11px' }}
                    onClick={() => handleSave(generatedSocialUrl, 'social')}
                    disabled={isSaving}
                  >
                    💾 {isSaving ? L('Saving...', 'جاري الحفظ...') : L('Save', 'حفظ')}
                  </button>
                )}
              </div>
              {isGenerating ? (
                <div style={{ textAlign: 'center', padding: '28px' }}><div style={{ fontSize: '28px', animation: 'pulse 1s infinite' }}>🎨</div><div style={{ fontSize: '13px', color: 'var(--t2)', marginTop: '8px' }}>{L('Creating your design...', 'يتم إنشاء تصميمك...')}</div></div>
              ) : generatedSocialUrl ? (
                <div style={{ textAlign: 'center', background: '#111', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '280px' }}>
                  <img src={generatedSocialUrl} alt="Generated Social Post" style={{ maxWidth: '100%', borderRadius: '10px', maxHeight: '300px' }} />
                </div>
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
                      onClick={() => { setCoverType(c.id); saveDesignStudioData('cover', { coverType: c.id }); }}
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
              <div className="sec-hd">
                <div className="sec-title">👁 {L('Preview', 'معاينة')}</div>
                {generatedCoverUrl && (
                  <button 
                    className="btn btn-ghost" 
                    style={{ fontSize: '12px', padding: '5px 11px' }}
                    onClick={() => handleSave(generatedCoverUrl, 'cover')}
                    disabled={isSaving}
                  >
                    💾 {isSaving ? L('Saving...', 'جاري الحفظ...') : L('Save', 'حفظ')}
                  </button>
                )}
              </div>
              {isGenerating ? (
                <div style={{ textAlign: 'center', padding: '28px' }}><div style={{ fontSize: '28px', animation: 'pulse 1s infinite' }}>🖼</div><div style={{ fontSize: '13px', color: 'var(--t2)', marginTop: '8px' }}>{L('Creating banner...', 'يتم تصميم الغلاف...')}</div></div>
              ) : generatedCoverUrl ? (
                <div style={{ textAlign: 'center', background: '#111', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                  <img src={generatedCoverUrl} alt="Generated Cover" style={{ maxWidth: '100%', borderRadius: '10px', maxHeight: '180px' }} />
                </div>
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
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Full Name', 'الاسم')}</label>
                    <input 
                      className="inp" 
                      value={cardFullName} 
                      onChange={(e) => setCardFullName(e.target.value)} 
                      onBlur={(e) => saveDesignStudioData('card', { fullName: e.target.value })} 
                      placeholder="Ahmed Al-Rashid" 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Title / Role', 'المسمى الوظيفي')}</label>
                    <input 
                      className="inp" 
                      value={cardTitle} 
                      onChange={(e) => setCardTitle(e.target.value)} 
                      onBlur={(e) => saveDesignStudioData('card', { title: e.target.value })} 
                      placeholder="Business Coach" 
                    />
                  </div>
                </div>
              </div>
              <button className="btn btn-prime" onClick={handleGenerate} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>
                ✦ {L('Generate Business Card', 'توليد بطاقة العمل')}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'sticky', top: '14px' }}>
              <div className="card">
                <div className="sec-hd">
                  <div className="sec-title">👁 {L('Front', 'الوجه')}</div>
                  {generatedCardUrl && (
                    <button 
                      className="btn btn-ghost" 
                      style={{ fontSize: '12px', padding: '5px 11px' }}
                      onClick={() => handleSave(generatedCardUrl, 'card')}
                      disabled={isSaving}
                    >
                      💾 {isSaving ? L('Saving...', 'جاري الحفظ...') : L('Save', 'حفظ')}
                    </button>
                  )}
                </div>
                {isGenerating ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}><div style={{ fontSize: '24px', animation: 'pulse 1s infinite' }}>💳</div></div>
                ) : generatedCardUrl ? (
                  <div style={{ textAlign: 'center', background: '#111', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '170px' }}>
                    <img src={generatedCardUrl} alt="Generated Business Card" style={{ maxWidth: '100%', borderRadius: '10px', maxHeight: '150px' }} />
                  </div>
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
          {savedDesigns.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {savedDesigns.map((design) => (
                <div key={design.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }}>
                  <div style={{ background: '#111', borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', aspectRatio: '1/1' }}>
                    <img src={design.url} alt="Saved Design" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, textTransform: 'capitalize' }}>
                        {design.type === 'logo' ? L('🏷 Logo', '🏷 شعار')
                         : design.type === 'social' ? L('📱 Social Post', '📱 منشور')
                         : design.type === 'cover' ? L('🖼 Cover', '🖼 غلاف')
                         : L('💳 Card', '💳 بطاقة')}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--t3)' }}>{design.date}</div>
                    </div>
                    <button 
                      className="btn btn-ghost" 
                      style={{ padding: '6px', color: 'var(--red)', fontSize: '12px' }}
                      onClick={() => {
                        const updated = savedDesigns.filter(d => d.id !== design.id);
                        setSavedDesigns(updated);
                        saveSavedDesigns(updated);
                        showToast(L('Design deleted', 'تم حذف التصميم'));
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
              <div className="empty-state" style={{ gridColumn: '1/-1', padding: '40px' }}>
                <div className="es-icon">🎨</div>
                <div className="es-title">{L('No saved designs yet', 'لا توجد تصاميم محفوظة')}</div>
                <div className="es-sub">{L('Generate logos, social posts, banners, or cards and save them here', 'قم بتوليد الشعارات واحفظها هنا')}</div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
