'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import CustomSelect from '../CustomSelect';
import { useAuth } from '../../context/AuthContext';
import { libStorage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function DesignStudioView() {
  const { t, L, setAiPanelOpen, GC, saveGC, showToast, checkCredits, tenantConfig } = useBusiness();
  const { user } = useAuth();
  const costGenerateLogo = tenantConfig?.costGenerateLogo !== undefined ? Number(tenantConfig.costGenerateLogo) : 40;
  
  // Image URL states
  const [generatedLogoUrl, setGeneratedLogoUrl] = useState('');
  const [generatedSocialUrl, setGeneratedSocialUrl] = useState('');
  const [generatedCoverUrl, setGeneratedCoverUrl] = useState('');
  const [generatedCardUrl, setGeneratedCardUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
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
  const [customColorVal, setCustomColorVal] = useState(savedLogo.logoColor?.startsWith('#') ? savedLogo.logoColor : '#FF6B35');
  const [logoIndustry, setLogoIndustry] = useState(savedLogo.industry || 'coaching');
  const [logoIdea, setLogoIdea] = useState(savedLogo.idea || '');

  // Social fields
  const [socialSize, setSocialSize] = useState(savedSocial.socialSize || '1080x1080');
  const [socialHeadline, setSocialHeadline] = useState(savedSocial.headline || '');
  const [socialSubtitle, setSocialSubtitle] = useState(savedSocial.subtitle || '');
  const [socialIdea, setSocialIdea] = useState(savedSocial.idea || '');
  const [socialColor, setSocialColor] = useState(savedSocial.socialColor || 'gradient-dark');
  const [customSocialColorVal, setCustomSocialColorVal] = useState(savedSocial.socialColor?.startsWith('#') ? savedSocial.socialColor : '#FF6B35');

  // Cover fields
  const [coverType, setCoverType] = useState(savedCover.coverType || 'linkedin');
  const [coverTextMode, setCoverTextMode] = useState(savedCover.textMode || 'ai');
  const [coverHeadline, setCoverHeadline] = useState(savedCover.headline || '');
  const [coverSubtitle, setCoverSubtitle] = useState(savedCover.subtitle || '');
  const [coverIdea, setCoverIdea] = useState(savedCover.idea || '');
  const [coverColor, setCoverColor] = useState(savedCover.coverColor || 'blue-white');
  const [customCoverColorVal, setCustomCoverColorVal] = useState(savedCover.coverColor?.startsWith('#') ? savedCover.coverColor : '#FF6B35');

  // Card fields
  const [cardFullName, setCardFullName] = useState(savedCard.fullName || '');
  const [cardTitle, setCardTitle] = useState(savedCard.title || '');
  const [cardColor, setCardColor] = useState(savedCard.cardColor || 'black-gold');
  const [customCardColorVal, setCustomCardColorVal] = useState(savedCard.cardColor?.startsWith('#') ? savedCard.cardColor : '#FF6B35');
  const [cardIdea, setCardIdea] = useState(savedCard.idea || '');

  // Saved gallery
  const [savedDesigns, setSavedDesigns] = useState(designData.savedDesigns || []);

  const [isGenerating, setIsGenerating] = useState(false);
  const [refImageBase64, setRefImageBase64] = useState('');

  const handleRefImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const base64Url = canvas.toDataURL('image/jpeg', 0.6);
        setRefImageBase64(base64Url);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  // Sync state once when GC loads
  useEffect(() => {
    if (GC.designStudio && !isInitialized) {
      const logo = GC.designStudio.logo || {};
      const social = GC.designStudio.social || {};
      const cover = GC.designStudio.cover || {};
      const card = GC.designStudio.card || {};

      setLogoBrandName(logo.brandName || '');
      setLogoTagline(logo.tagline || '');
      setLogoStyle(logo.logoStyle || 'modern');
      setLogoType(logo.logoType || 'wordmark');
      setLogoColor(logo.logoColor || 'orange-purple');
      if (logo.logoColor?.startsWith('#')) {
        setCustomColorVal(logo.logoColor);
      }
      setLogoIndustry(logo.industry || 'coaching');
      setLogoIdea(logo.idea || '');

      setSocialSize(social.socialSize || '1080x1080');
      setSocialHeadline(social.headline || '');
      setSocialSubtitle(social.subtitle || '');
      setSocialIdea(social.idea || '');
      setSocialColor(social.socialColor || 'gradient-dark');
      if (social.socialColor?.startsWith('#')) {
        setCustomSocialColorVal(social.socialColor);
      }

      setCoverType(cover.coverType || 'linkedin');
      setCoverTextMode(cover.textMode || 'ai');
      setCoverHeadline(cover.headline || '');
      setCoverSubtitle(cover.subtitle || '');
      setCoverIdea(cover.idea || '');
      setCoverColor(cover.coverColor || 'blue-white');
      if (cover.coverColor?.startsWith('#')) {
        setCustomCoverColorVal(cover.coverColor);
      }

      setCardFullName(card.fullName || '');
      setCardTitle(card.title || '');
      setCardColor(card.cardColor || 'black-gold');
      if (card.cardColor?.startsWith('#')) {
        setCustomCardColorVal(card.cardColor);
      }
      setCardIdea(card.idea || '');

      setSavedDesigns(GC.designStudio.savedDesigns || []);
      setIsInitialized(true);
    }
  }, [GC.designStudio, isInitialized]);

  // Sync gallery updates in real-time
  useEffect(() => {
    if (GC.designStudio?.savedDesigns) {
      setSavedDesigns(GC.designStudio.savedDesigns);
    }
  }, [GC.designStudio?.savedDesigns]);

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
      const colorDesc = logoColor.startsWith('#') ? `custom color hex ${logoColor}` : logoColor;
      return `A high-quality, professional logo design for a brand named "${logoBrandName}". ${logoTagline ? `With tagline "${logoTagline}".` : ''} Logo style is ${logoStyle}. Logo type is ${logoType}. The color scheme is ${colorDesc}. The industry is ${logoIndustry}.${logoIdea ? ` The design style should feature this idea: ${logoIdea}.` : ''} Modern, clean, vectors, centered, no background, high resolution.`;
    }
    if (tab === 'social') {
      const colorDesc = socialColor.startsWith('#') ? `custom color hex ${socialColor}` : socialColor;
      return `A premium, professionally designed social media graphic post. Main headline: "${socialHeadline}". Subtitle: "${socialSubtitle}". Size aspect ratio matches ${socialSize}. The color scheme is ${colorDesc}.${socialIdea ? ` The design should feature the following idea: ${socialIdea}.` : ''} Vibrant, modern graphic design, high contrast, clean typography.`;
    }
    if (tab === 'cover') {
      const coverNames = { linkedin: 'LinkedIn banner', youtube: 'YouTube Channel Art banner', twitter: 'X/Twitter header banner' };
      const textPrompt = coverTextMode === 'custom' 
        ? `featuring the main headline text "${coverHeadline}" and tagline text "${coverSubtitle}"`
        : `featuring an AI-generated professional headline and tagline suitable for a creator name "${logoBrandName || GC.profile.name || ''}"`;
      const colorDesc = coverColor.startsWith('#') ? `custom color hex ${coverColor}` : coverColor;
      return `A high-quality, professional digital banner for ${coverNames[coverType] || 'LinkedIn'}. The color scheme is ${colorDesc}. Suitable for ${logoIndustry} industry. ${textPrompt}.${coverIdea ? ` The banner design should be based on the following idea: ${coverIdea}.` : ''} Elegant, abstract, modern corporate style, high resolution, suitable for a horizontal profile banner.`;
    }
    if (tab === 'card') {
      const colorDesc = cardColor.startsWith('#') ? `custom color hex ${cardColor}` : cardColor;
      return `A premium modern business card design. Showcases name: "${cardFullName}" and title/role: "${cardTitle}". The color scheme is ${colorDesc}.${cardIdea ? ` The card layout should incorporate this idea: ${cardIdea}.` : ''} Sophisticated, elegant, minimal layout, high-end professional corporate style, centered.`;
    }
    return '';
  };

  const handleGenerate = async () => {
    if (!checkCredits(costGenerateLogo)) return;
    let prompt = getPromptForTab(activeTab);
    if (!prompt) return;

    setIsGenerating(true);

    // Vision analysis of reference image (if provided) to guide image generation
    let styleDescription = '';
    if (refImageBase64) {
      try {
        const systemPrompt = "You are a professional design analyst. Describe the uploaded image's logo layout, visual style, colors, and graphics in 1 detailed sentence to serve as inspiration for image generation. Do not include markdown or extra text.";
        const visionPrompt = "Describe the style and layout of this design reference for image generation:";

        const res = await fetch('/api/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user?.uid,
            tool: 'Design Studio - Vision Analysis',
            creditsCost: 0,
            messages: [
              { role: 'system', content: systemPrompt },
              { 
                role: 'user', 
                content: [
                  { type: 'text', text: visionPrompt },
                  { type: 'image_url', image_url: { url: refImageBase64 } }
                ]
              }
            ]
          })
        });

        if (res.ok) {
          const text = await res.text();
          if (text && !text.includes('❌')) {
            styleDescription = text.trim();
          }
        }
      } catch (err) {
        console.warn("Reference image analysis failed:", err);
      }
    }

    if (styleDescription) {
      prompt = `${prompt} The design style should be inspired by: ${styleDescription}.`;
    }

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

  const createThumbnail = (blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 300;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(blob);
    });
  };

  const handleSave = async (url, type) => {
    if (!url) return;
    setIsSaving(true);
    try {
      showToast(L('Saving...', 'جاري الحفظ...'));
      
      let blob;
      if (url.startsWith('data:')) {
        const arr = url.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        blob = new Blob([u8arr], { type: mime });
      } else {
        const response = await fetch(`/api/ai/proxy-image?url=${encodeURIComponent(url)}`);
        blob = await response.clone().blob();
      }

      let permanentUrl = '';

      // Upload to Firebase Storage (libStorage) directly, fall back to base64 thumbnail on failure
      try {
        const filename = `designs/${user?.uid}/${type}_${Date.now()}.png`;
        const storageRef = ref(libStorage, filename);
        const snapshot = await uploadBytes(storageRef, blob);
        permanentUrl = await getDownloadURL(snapshot.ref);
      } catch (err) {
        console.warn("Firebase Storage upload failed, falling back to base64 thumbnail:", err);
        permanentUrl = await createThumbnail(blob);
      }

      // Trigger local browser download
      try {
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${type}_design_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);
      } catch (err) {
        console.warn("Failed to trigger local file download:", err);
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

  const colorPresets = [
    { id: 'orange-purple', gradient: 'linear-gradient(135deg,#FF6B35,#6C35FF)', name: L('Orange + Purple', 'برتقالي + بنفسجي') },
    { id: 'black-gold', gradient: 'linear-gradient(135deg,#111,#FFD700)', name: L('Black + Gold', 'أسود + ذهبي') },
    { id: 'blue-white', gradient: 'linear-gradient(135deg,#0088CC,#fff)', name: L('Blue + White', 'أزرق + أبيض') },
    { id: 'green-white', gradient: 'linear-gradient(135deg,#00d98b,#fff)', name: L('Green + White', 'أخضر + أبيض') },
    { id: 'red-white', gradient: 'linear-gradient(135deg,#ef4444,#fff)', name: L('Red + White', 'أحمر + أبيض') },
    { id: 'monochrome', gradient: 'linear-gradient(135deg,#111,#888)', name: L('Monochrome', 'أحادية اللون (أبيض وأسود)') }
  ];

  const renderColorSchemeCard = (activeColor, customVal, onSelectColor, onSelectCustomColor, onSaveColor) => {
    return (
      <div className="card">
        <div className="sec-hd"><div className="sec-title">🎨 {L('Color Scheme', 'الألوان')}</div></div>
        <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
          {colorPresets.map(color => (
            <div 
              key={color.id}
              onClick={() => {
                onSelectColor(color.id);
                onSaveColor(color.id);
              }}
              style={{ padding: '7px 12px', borderRadius: '8px', border: activeColor === color.id ? '2px solid var(--orange)' : '1px solid var(--edge)', background: activeColor === color.id ? 'var(--or-d)' : 'var(--surface2)', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: activeColor === color.id ? 'var(--orange)' : 'var(--t2)' }}
            >
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: color.gradient, display: 'inline-block' }}></span>
              {color.name}
            </div>
          ))}
          
          {/* Custom color wheel picker */}
          <div 
            onClick={() => {
              onSelectColor(customVal);
              onSaveColor(customVal);
            }}
            style={{ 
              padding: '7px 12px', 
              borderRadius: '8px', 
              border: activeColor.startsWith('#') ? '2px solid var(--orange)' : '1px solid var(--edge)', 
              background: activeColor.startsWith('#') ? 'var(--or-d)' : 'var(--surface2)', 
              cursor: 'pointer', 
              fontSize: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: activeColor.startsWith('#') ? 'var(--orange)' : 'var(--t2)',
              position: 'relative'
            }}
          >
            <input 
              type="color" 
              value={customVal} 
              onChange={(e) => {
                onSelectCustomColor(e.target.value);
                onSelectColor(e.target.value);
              }}
              onBlur={(e) => {
                onSaveColor(e.target.value);
              }}
              style={{
                width: '16px',
                height: '16px',
                border: '1px solid var(--edge)',
                borderRadius: '50%',
                cursor: 'pointer',
                background: 'none',
                padding: 0,
                outline: 'none',
                verticalAlign: 'middle'
              }}
            />
            <span>{L('Custom Color Wheel', 'عجلة ألوان مخصصة')} ({customVal})</span>
          </div>
        </div>
      </div>
    );
  };

  const renderReferenceDesignCard = () => {
    return (
      <div className="card" style={{ fontFamily: 'Tajawal, sans-serif' }}>
        <div className="sec-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="sec-title">🖼️ {L('Reference Design (Optional)', 'تصميم مرجعي (اختياري)')}</div>
          {refImageBase64 && (
            <button 
              onClick={() => setRefImageBase64('')}
              style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
            >
              {L('Remove', 'إزالة')}
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px' }}>
          {refImageBase64 ? (
            <img 
              src={refImageBase64} 
              alt="Reference" 
              style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--edge)' }} 
            />
          ) : (
            <div style={{ width: '48px', height: '48px', borderRadius: '6px', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'var(--t3)', border: '1px dashed var(--edge)' }}>
              📷
            </div>
          )}
          <div style={{ flex: 1 }}>
            <label 
              style={{ 
                display: 'inline-block', 
                padding: '6px 12px', 
                background: 'var(--surface2)', 
                border: '1px solid var(--edge)', 
                borderRadius: '6px', 
                fontSize: '12px', 
                fontWeight: 600, 
                color: 'var(--t1)', 
                cursor: 'pointer' 
              }}
            >
              {L('Choose Image', 'اختر صورة')}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleRefImageUpload} 
                style={{ display: 'none' }} 
              />
            </label>
            <div style={{ fontSize: '10px', color: 'var(--t3)', marginTop: '4px' }}>
              {L('Upload reference design for style inspiration', 'ارفع تصميماً مرجعياً ليكون مصدر إلهام للتصميم')}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDesignIdeaCard = (value, onChange, onBlur) => {
    return (
      <div className="card">
        <div className="sec-hd"><div className="sec-title">💡 {L('Design Idea (Optional)', 'فكرة التصميم (اختياري)')}</div></div>
        <textarea 
          className="inp" 
          value={value} 
          onChange={onChange} 
          onBlur={onBlur} 
          placeholder={L('e.g., A minimalist design showing a lightbulb with growth charts...', 'مثال: تصميم بسيط يظهر مصباحاً كهربائياً مع رسوم بيانية للنمو...')} 
          style={{ height: '60px', resize: 'none', padding: '8px', fontSize: '12px', fontFamily: 'Tajawal, sans-serif' }}
        />
      </div>
    );
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
                    { id: 'modern', icon: '✦', name: L('Modern / Minimal', 'حديث / مبسط') },
                    { id: 'bold', icon: '💪', name: L('Bold / Strong', 'قوي / بارز') },
                    { id: 'luxury', icon: '💎', name: L('Luxury / Premium', 'فاخر / راقٍ') },
                    { id: 'playful', icon: '🎉', name: L('Playful / Fun', 'مرح / ممتع') },
                    { id: 'tech', icon: '🤖', name: L('Tech / AI', 'تقني / ذكاء اصطناعي') },
                    { id: 'arabic', icon: '🕌', name: L('Arabic Heritage', 'تراث عربي أصيل') }
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
                    { id: 'wordmark', label: L('Wordmark', 'شعار نصي (كتابي)') },
                    { id: 'monogram', label: L('Monogram', 'شعار حرفي (مونوغرام)') },
                    { id: 'icon+text', label: L('Icon + Text', 'أيقونة + نص') },
                    { id: 'abstract', label: L('Abstract Mark', 'شعار مجرد / رمزي') },
                    { id: 'badge', label: L('Badge / Emblem', 'شعار شارة / درع') }
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
              {renderColorSchemeCard(logoColor, customColorVal, setLogoColor, setCustomColorVal, (val) => saveDesignStudioData('logo', { logoColor: val }))}

              {/* Industry */}
              <div className="card">
                <div className="sec-hd"><div className="sec-title">🏢 {L('Industry', 'الصناعة')}</div></div>
                <CustomSelect className="inp" value={logoIndustry} onChange={(e) => { setLogoIndustry(e.target.value); saveDesignStudioData('logo', { industry: e.target.value }); }}>
                  <option value="coaching">{L('Coaching & Training', 'التدريب والتطوير')}</option>
                  <option value="tech">{L('Tech / AI / SaaS', 'التقنية والذكاء الاصطناعي')}</option>
                  <option value="ecommerce">{L('E-commerce', 'التجارة الإلكترونية')}</option>
                  <option value="food">{L('Food & Restaurant', 'الأغذية والمطاعم')}</option>
                </CustomSelect>
              </div>

              {/* Reference Image */}
              {renderReferenceDesignCard()}

              {/* Design Idea */}
              {renderDesignIdeaCard(logoIdea, (e) => setLogoIdea(e.target.value), (e) => saveDesignStudioData('logo', { idea: e.target.value }))}

              <button className="btn btn-prime" onClick={handleGenerate} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>
                ✦ {isGenerating ? L('Generating...', 'جاري التوليد...') : `${L('Generate Logo', 'توليد الشعار')} (${costGenerateLogo} Credits)`}
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
                    { id: '1080x1080', icon: '⬛', size: '1080×1080', desc: L('Square (IG/TikTok)', 'مربع (إنستغرام/تيك توك)') },
                    { id: '1080x1920', icon: '📱', size: '1080×1920', desc: L('Story / Reel', 'قصة / ريلز عمودي') },
                    { id: '1200x628', icon: '🖼', size: '1200×628', desc: L('FB / LinkedIn', 'فيسبوك / لينكد إن') },
                    { id: '1280x720', icon: '📺', size: '1280×720', desc: L('YouTube Thumb', 'صورة يوتيوب مصغرة') }
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
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Subtitle (optional)', 'عنوان فرعي (اختياري)')}</label>
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

              {/* Colors */}
              {renderColorSchemeCard(socialColor, customSocialColorVal, setSocialColor, setCustomSocialColorVal, (val) => saveDesignStudioData('social', { socialColor: val }))}

              {/* Reference Image */}
              {renderReferenceDesignCard()}

              {/* Design Idea */}
              {renderDesignIdeaCard(socialIdea, (e) => setSocialIdea(e.target.value), (e) => saveDesignStudioData('social', { idea: e.target.value }))}

              <button className="btn btn-prime" onClick={handleGenerate} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>
                ✦ {isGenerating ? L('Generating...', 'جاري التوليد...') : `${L('Generate Post Artwork', 'توليد المنشور')} (${costGenerateLogo} Credits)`}
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
        <div className="tab-panel on" style={{ fontFamily: 'Tajawal, sans-serif' }}>
          <div className="g2" style={{ alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Type */}
              <div className="card">
                <div className="sec-hd"><div className="sec-title">📐 {L('Banner Type', 'نوع الغلاف')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {[
                    { id: 'linkedin', icon: '💼', name: L('LinkedIn Banner', 'غلاف لينكد إن'), dims: '1584×396' },
                    { id: 'youtube', icon: '▶️', name: L('YouTube Channel Art', 'غلاف قناة يوتيوب'), dims: '2560×1440' },
                    { id: 'twitter', icon: '🐦', name: L('X / Twitter Header', 'غلاف منصة إكس/تويتر'), dims: '1500×500' }
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

              {/* Text / Copy Configuration */}
              <div className="card">
                <div className="sec-hd"><div className="sec-title">✍️ {L('Banner Text / Copy', 'الكتابة والنصوص على الغلاف')}</div></div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button 
                    onClick={() => { setCoverTextMode('ai'); saveDesignStudioData('cover', { textMode: 'ai' }); }}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: coverTextMode === 'ai' ? '2px solid var(--orange)' : '1px solid var(--edge)', background: coverTextMode === 'ai' ? 'var(--or-d)' : 'var(--surface2)', color: coverTextMode === 'ai' ? 'var(--orange)' : 'var(--t2)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                  >
                    🤖 {L('AI Auto Text', 'توليد بالـ AI')}
                  </button>
                  <button 
                    onClick={() => { setCoverTextMode('custom'); saveDesignStudioData('cover', { textMode: 'custom' }); }}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: coverTextMode === 'custom' ? '2px solid var(--orange)' : '1px solid var(--edge)', background: coverTextMode === 'custom' ? 'var(--or-d)' : 'var(--surface2)', color: coverTextMode === 'custom' ? 'var(--orange)' : 'var(--t2)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                  >
                    ✏️ {L('Write Custom Text', 'أكتب النص بنفسي')}
                  </button>
                </div>
                {coverTextMode === 'custom' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Main Headline', 'العنوان الرئيسي')}</label>
                      <input 
                        className="inp" 
                        value={coverHeadline} 
                        onChange={(e) => setCoverHeadline(e.target.value)} 
                        onBlur={(e) => saveDesignStudioData('cover', { headline: e.target.value })} 
                        placeholder={L('e.g., Build & Scale Your Brand', 'مثال: ابنِ وطوّر علامتك التجارية')}
                        style={{ fontSize: '12.5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Tagline / Subtitle', 'العنوان الفرعي')}</label>
                      <input 
                        className="inp" 
                        value={coverSubtitle} 
                        onChange={(e) => setCoverSubtitle(e.target.value)} 
                        onBlur={(e) => saveDesignStudioData('cover', { subtitle: e.target.value })} 
                        placeholder={L('e.g., Growth Marketing for Creators', 'مثال: تسويق النمو للمنشئين')}
                        style={{ fontSize: '12.5px' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Colors */}
              {renderColorSchemeCard(coverColor, customCoverColorVal, setCoverColor, setCustomCoverColorVal, (val) => saveDesignStudioData('cover', { coverColor: val }))}

              {/* Reference Image */}
              {renderReferenceDesignCard()}

              {/* Design Idea */}
              {renderDesignIdeaCard(coverIdea, (e) => setCoverIdea(e.target.value), (e) => saveDesignStudioData('cover', { idea: e.target.value }))}

              <button className="btn btn-prime" onClick={handleGenerate} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>
                ✦ {isGenerating ? L('Generating...', 'جاري التوليد...') : `${L('Generate Profile Banner', 'توليد الغلاف')} (${costGenerateLogo} Credits)`}
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

              {/* Colors */}
              {renderColorSchemeCard(cardColor, customCardColorVal, setCardColor, setCustomCardColorVal, (val) => saveDesignStudioData('card', { cardColor: val }))}

              {/* Reference Image */}
              {renderReferenceDesignCard()}

              {/* Design Idea */}
              {renderDesignIdeaCard(cardIdea, (e) => setCardIdea(e.target.value), (e) => saveDesignStudioData('card', { idea: e.target.value }))}

              <button className="btn btn-prime" onClick={handleGenerate} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>
                ✦ {isGenerating ? L('Generating...', 'جاري التوليد...') : `${L('Generate Card Design', 'توليد بطاقة العمل')} (${costGenerateLogo} Credits)`}
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
