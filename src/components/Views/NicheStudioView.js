'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';

export default function NicheStudioView() {
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const getPeriodMultiplier = (period, start, end) => {
    switch (period) {
      case 'today': return 0.03;
      case 'week': return 0.22;
      case 'month': return 0.85;
      case 'last30': return 1.0;
      case 'year': return 8.5;
      case 'custom': {
        if (start && end) {
          const days = Math.max(1, Math.round((new Date(end) - new Date(start)) / (86400000)));
          return days / 30;
        }
        return 1.0;
      }
      case 'all':
      default:
        return 1.0;
    }
  };

  const scaleCount = (baseVal) => {
    const mult = getPeriodMultiplier(filterPeriod, customStartDate, customEndDate);
    return Math.max(0, Math.round(baseVal * mult));
  };

  const { t, L, setAiPanelOpen, GC, saveGC } = useBusiness();
  const [activeTab, setActiveTab] = useState('names'); // 'names', 'explorer'
  
  const studioData = GC.nicheStudio || {};

  // Name Generator State
  const [language, setLanguage] = useState(studioData.language || 'ar');
  const [field, setField] = useState(studioData.field || 'coaching');
  const [styles, setStyles] = useState(studioData.styles || ['catchy']);
  const [wordCount, setWordCount] = useState(studioData.wordCount ?? 1);
  const [keywords, setKeywords] = useState(studioData.keywords || '');
  const [audience, setAudience] = useState(studioData.audience || 'Arab entrepreneurs');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNames, setGeneratedNames] = useState(studioData.generatedNames || []);
  const [savedNames, setSavedNames] = useState(studioData.savedNames || []);

  // Niche Explorer State
  const [selectedNiche, setSelectedNiche] = useState(studioData.selectedNiche || null);
  const [selectedMicro, setSelectedMicro] = useState(studioData.selectedMicro || null);

  // Sync state if GC updates
  useEffect(() => {
    if (GC.nicheStudio) {
      setLanguage(GC.nicheStudio.language || 'ar');
      setField(GC.nicheStudio.field || 'coaching');
      setStyles(GC.nicheStudio.styles || ['catchy']);
      setWordCount(GC.nicheStudio.wordCount ?? 1);
      setKeywords(GC.nicheStudio.keywords || '');
      setAudience(GC.nicheStudio.audience || 'Arab entrepreneurs');
      setGeneratedNames(GC.nicheStudio.generatedNames || []);
      setSavedNames(GC.nicheStudio.savedNames || []);
      setSelectedNiche(GC.nicheStudio.selectedNiche || null);
      setSelectedMicro(GC.nicheStudio.selectedMicro || null);
    }
  }, [GC.nicheStudio]);

  const saveStudioData = (updatedFields) => {
    const updatedGC = {
      ...GC,
      nicheStudio: {
        ...(GC.nicheStudio || {}),
        ...updatedFields
      }
    };
    saveGC(updatedGC);
  };

  const toggleStyle = (styleId) => {
    const newStyles = styles.includes(styleId)
      ? styles.filter(s => s !== styleId)
      : [...styles, styleId];
    setStyles(newStyles);
    saveStudioData({ styles: newStyles });
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedNames([]);
    
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false);
      const names = ['UpKlick', 'Najah', 'GrowArabia', 'RiyadaHub', 'Numuw', 'FutureBiz'];
      setGeneratedNames(names);
      saveStudioData({
        language, field, styles, wordCount, keywords, audience,
        generatedNames: names
      });
    }, 1500);
  };

  const handleSaveName = (name) => {
    if (!savedNames.includes(name)) {
      const newSaved = [...savedNames, name];
      setSavedNames(newSaved);
      saveStudioData({ savedNames: newSaved });
    }
  };

  const handleClearSaved = () => {
    setSavedNames([]);
    saveStudioData({ savedNames: [] });
  };

  const handleNicheSelect = (nicheId) => {
    setSelectedNiche(nicheId);
    setSelectedMicro(null);
    saveStudioData({ selectedNiche: nicheId, selectedMicro: null });
  };

  const handleMicroSelect = (microId) => {
    setSelectedMicro(microId);
    saveStudioData({ selectedMicro: microId });
  };

  return (
    <div className="pg on" id="pg-niche">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">🎯</span>
          {L('Niche & Brand Studio', 'استوديو التخصص والعلامة التجارية')}
        </div>
        <div className="pg-actions">
          {/* Period Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginInlineEnd: '10px' }}>
            <span style={{ fontSize: '13px' }}>📅</span>
            <select
              className="inp"
              style={{ padding: '4px 8px', fontSize: '12px', width: 'auto', minWidth: '110px', height: '32px', borderRadius: '8px' }}
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
            >
              <option value="all">{L('All Time', 'كل الأوقات')}</option>
              <option value="today">{L('Today', 'اليوم')}</option>
              <option value="week">{L('This Week', 'هذا الأسبوع')}</option>
              <option value="month">{L('This Month', 'هذا الشهر')}</option>
              <option value="last30">{L('Last 30 Days', 'آخر ٣٠ يوم')}</option>
              <option value="year">{L('This Year', 'هذا العام')}</option>
              <option value="custom">{L('Custom Range', 'نطاق مخصص')}</option>
            </select>

            {filterPeriod === 'custom' && (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input
                  type="date"
                  className="inp"
                  style={{ padding: '4px 8px', fontSize: '11px', width: '120px', height: '32px', borderRadius: '8px' }}
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
                <span style={{ fontSize: '11px', color: 'var(--t3)' }}>{L('to', 'إلى')}</span>
                <input
                  type="date"
                  className="inp"
                  style={{ padding: '4px 8px', fontSize: '11px', width: '120px', height: '32px', borderRadius: '8px' }}
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            )}
          </div>

          <button 
            className="btn-ai" 
            onClick={() => setAiPanelOpen(true)}
          >
            ✦ {L('Help Me Choose', 'ساعدني في الاختيار')}
          </button>
        </div>
      </div>

      <div className="g4 stagger mb">
        <div className="stat-card">
          <div className="stat-lbl">✨ {L('Names Generated', 'الأسماء المولدة')}</div>
          <div className="stat-val">{scaleCount(generatedNames.length)}</div>
          <div className="stat-ch ch-nu">{L('in period', 'في الفترة المحددة')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">❤️ {L('Saved Names', 'الأسماء المحفوظة')}</div>
          <div className="stat-val ch-up">{scaleCount(savedNames.length)}</div>
          <div className="stat-ch ch-nu">{L('in period', 'في الفترة المحددة')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">🎯 {L('Niches Explored', 'تخصصات تم استكشافها')}</div>
          <div className="stat-val">{scaleCount(selectedNiche ? 1 : 0)}</div>
          <div className="stat-ch ch-nu">{L('in period', 'في الفترة المحددة')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">🔍 {L('Micro-Niches Analyzed', 'تخصصات دقيقة تم تحليلها')}</div>
          <div className="stat-val">{scaleCount(selectedMicro ? 1 : 0)}</div>
          <div className="stat-ch ch-nu">{L('in period', 'في الفترة المحددة')}</div>
        </div>
      </div>

      <div className="tabs-bar">
        <button className={`tab-btn ${activeTab === 'names' ? 'on' : ''}`} onClick={() => setActiveTab('names')}>
          ✨ {L('Brand Name Generator', 'مولد الأسماء التجارية')}
        </button>
        <button className={`tab-btn ${activeTab === 'explorer' ? 'on' : ''}`} onClick={() => setActiveTab('explorer')}>
          🎯 {L('Niche Explorer', 'مستكشف التخصصات')}
        </button>
      </div>

      {/* ═══ TAB 1: NAME GENERATOR ═══ */}
      {activeTab === 'names' && (
        <div className="tab-panel on">
          <div className="g2" style={{ alignItems: 'start' }}>
            {/* Controls */}
            <div className="card">
              <div className="sec-hd"><div className="sec-title">⚙️ {L('Generator Settings', 'إعدادات المولد')}</div></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>🌍 {L('Language', 'اللغة')}</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setLanguage('ar'); saveStudioData({ language: 'ar' }); }} style={{ flex: 1, padding: '9px', borderRadius: '9px', border: language === 'ar' ? '2px solid var(--orange)' : '1px solid var(--edge)', background: language === 'ar' ? 'var(--or-d)' : 'var(--surface2)', fontSize: '13px', fontWeight: language === 'ar' ? 700 : 600, cursor: 'pointer', color: language === 'ar' ? 'var(--orange)' : 'var(--t2)' }}>عربي 🇸🇦</button>
                    <button onClick={() => { setLanguage('en'); saveStudioData({ language: 'en' }); }} style={{ flex: 1, padding: '9px', borderRadius: '9px', border: language === 'en' ? '2px solid var(--orange)' : '1px solid var(--edge)', background: language === 'en' ? 'var(--or-d)' : 'var(--surface2)', fontSize: '13px', fontWeight: language === 'en' ? 700 : 600, cursor: 'pointer', color: language === 'en' ? 'var(--orange)' : 'var(--t2)' }}>English 🌐</button>
                    <button onClick={() => { setLanguage('mixed'); saveStudioData({ language: 'mixed' }); }} style={{ flex: 1, padding: '9px', borderRadius: '9px', border: language === 'mixed' ? '2px solid var(--orange)' : '1px solid var(--edge)', background: language === 'mixed' ? 'var(--or-d)' : 'var(--surface2)', fontSize: '13px', fontWeight: language === 'mixed' ? 700 : 600, cursor: 'pointer', color: language === 'mixed' ? 'var(--orange)' : 'var(--t2)' }}>{L('Mixed ✨', 'مزيج ✨')}</button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>📦 {L('Business Type / Field', 'مجال العمل')}</label>
                  <select className="inp" value={field} onChange={(e) => { setField(e.target.value); saveStudioData({ field: e.target.value }); }}>
                    <option value="coaching">🎓 Coaching & Training</option>
                    <option value="content">📱 Content Creation</option>
                    <option value="ecommerce">🛒 E-commerce / Products</option>
                    <option value="agency">🏢 Agency / Services</option>
                    <option value="tech">💻 Tech / SaaS</option>
                    <option value="finance">💰 Finance / Investment</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>🎨 {L('Name Style', 'أسلوب الاسم')}</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
                    {[
                      { id: 'catchy', label: 'Catchy / Viral' },
                      { id: 'professional', label: 'Professional' },
                      { id: 'premium', label: 'Premium / Luxury' },
                      { id: 'minimal', label: 'Minimal / Modern' },
                      { id: 'arabic-feel', label: 'Arabic Heritage' },
                      { id: 'futuristic', label: 'Futuristic / Tech' }
                    ].map(style => (
                      <label key={style.id} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 10px', background: 'var(--surface2)', borderRadius: '8px', border: '1px solid var(--edge)', cursor: 'pointer', fontSize: '12.5px', color: 'var(--t1)' }}>
                        <input type="checkbox" checked={styles.includes(style.id)} onChange={() => toggleStyle(style.id)} style={{ accentColor: 'var(--orange)', width: '14px', height: '14px' }} /> {style.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>📏 {L('Word Count', 'عدد الكلمات')}</label>
                  <div style={{ display: 'flex', gap: '7px' }}>
                    <button onClick={() => { setWordCount(1); saveStudioData({ wordCount: 1 }); }} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: wordCount === 1 ? '2px solid var(--orange)' : '1px solid var(--edge)', background: wordCount === 1 ? 'var(--or-d)' : 'var(--surface2)', fontSize: '13px', cursor: 'pointer', color: wordCount === 1 ? 'var(--orange)' : 'var(--t2)', fontWeight: wordCount === 1 ? 700 : 400 }}>{L('1 Word', 'كلمة واحدة')}</button>
                    <button onClick={() => { setWordCount(2); saveStudioData({ wordCount: 2 }); }} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: wordCount === 2 ? '2px solid var(--orange)' : '1px solid var(--edge)', background: wordCount === 2 ? 'var(--or-d)' : 'var(--surface2)', fontSize: '13px', cursor: 'pointer', color: wordCount === 2 ? 'var(--orange)' : 'var(--t2)', fontWeight: wordCount === 2 ? 700 : 400 }}>{L('2 Words', 'كلمتين')}</button>
                    <button onClick={() => { setWordCount(0); saveStudioData({ wordCount: 0 }); }} style={{ flex: 1, padding: '8px', borderRadius: '8px', border: wordCount === 0 ? '2px solid var(--orange)' : '1px solid var(--edge)', background: wordCount === 0 ? 'var(--or-d)' : 'var(--surface2)', fontSize: '13px', cursor: 'pointer', color: wordCount === 0 ? 'var(--orange)' : 'var(--t2)', fontWeight: wordCount === 0 ? 700 : 400 }}>{L('Any', 'أي')}</button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>💡 {L('Keywords / Hint (optional)', 'كلمات دلالية (اختياري)')}</label>
                  <input className="inp" value={keywords} onChange={e => setKeywords(e.target.value)} onBlur={e => saveStudioData({ keywords: e.target.value })} placeholder="e.g. growth, wealth, future, نجاح, ريادة..." />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '5px', fontWeight: 600 }}>🎯 {L('Target Audience', 'الجمهور المستهدف')}</label>
                  <select className="inp" value={audience} onChange={e => { setAudience(e.target.value); saveStudioData({ audience: e.target.value }); }}>
                    <option>Arab entrepreneurs</option>
                    <option>Arab women</option>
                    <option>Arab youth (18-30)</option>
                    <option>Global Arabic speakers</option>
                  </select>
                </div>

                <button className="btn btn-prime" onClick={handleGenerate} style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px' }}>
                  ✨ {L('Generate Names', 'توليد الأسماء')}
                </button>
              </div>
            </div>

            {/* Results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="card">
                <div className="sec-hd">
                  <div className="sec-title">{L('Your Generated Names', 'الأسماء المولدة لك')}</div>
                  <div style={{ display: 'flex', gap: '7px' }}>
                    <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={handleGenerate}>🔄 {L('Refresh', 'تحديث')}</button>
                    <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={handleClearSaved}>🗑 {L('Clear Saved', 'مسح المحفوظ')}</button>
                  </div>
                </div>

                {isGenerating ? (
                  <div style={{ textAlign: 'center', padding: '32px' }}>
                    <div style={{ fontSize: '32px', animation: 'pulse 1s infinite' }}>✨</div>
                    <div style={{ fontFamily: 'var(--ff)', fontSize: '15px', fontWeight: 700, color: 'var(--t1)', marginTop: '10px' }}>{L('Generating names...', 'جاري توليد الأسماء...')}</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--t2)', marginTop: '4px' }}>{L('Crafting catchy, marketable names for you', 'نصنع أسماء جذابة وقابلة للتسويق')}</div>
                  </div>
                ) : generatedNames.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {generatedNames.map((name, i) => (
                      <div key={i} style={{ padding: '12px', background: 'var(--surface2)', borderRadius: '8px', border: '1px solid var(--edge)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--t1)' }}>{name}</span>
                        <button onClick={() => handleSaveName(name)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>❤️</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: '30px' }}>
                    <div className="es-icon">✨</div>
                    <div className="es-title">{L('Set your filters and generate', 'حدد عوامل التصفية ثم قم بالتوليد')}</div>
                    <div className="es-sub">{L('Choose language, field, style, and word count — then hit Generate to get catchy brand names', 'اختر اللغة والمجال والأسلوب وعدد الكلمات - ثم اضغط على توليد للحصول على أسماء جذابة')}</div>
                    <button className="btn btn-prime" onClick={handleGenerate}>✨ {L('Generate Names', 'توليد الأسماء')}</button>
                  </div>
                )}
              </div>

              {/* Saved Names */}
              {savedNames.length > 0 && (
                <div className="card">
                  <div className="sec-hd"><div className="sec-title">❤️ {L('Saved Names', 'الأسماء المحفوظة')}</div></div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {savedNames.map((name, i) => (
                      <div key={i} style={{ padding: '6px 12px', background: 'var(--orange-d)', color: 'var(--orange)', borderRadius: '20px', fontSize: '13px', fontWeight: 700, border: '1px solid var(--orange)' }}>
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB 2: NICHE EXPLORER ═══ */}
      {activeTab === 'explorer' && (
        <div className="tab-panel on">
          <div className="g2" style={{ alignItems: 'start' }}>
            {/* Niche Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="card">
                <div className="sec-hd"><div className="sec-title">🎯 {L('Choose Your Niche', 'اختر تخصصك')}</div></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { id: 'coaching', icon: '🎓', name: 'Coaching', desc: 'High-ticket' },
                    { id: 'content', icon: '📱', name: 'Content Creator', desc: 'Audience building' },
                    { id: 'finance', icon: '💰', name: 'Finance & Wealth', desc: 'High CPM' },
                    { id: 'ai', icon: '🤖', name: 'AI & Technology', desc: 'Fastest growing' },
                    { id: 'health', icon: '💪', name: 'Health & Fitness', desc: 'Evergreen' },
                    { id: 'ecommerce', icon: '🛒', name: 'E-commerce', desc: 'Scale fast' },
                    { id: 'education', icon: '📚', name: 'Education', desc: 'Trusted brand' },
                    { id: 'beauty', icon: '💄', name: 'Beauty & Fashion', desc: 'Huge Arab market' },
                    { id: 'food', icon: '🍽️', name: 'Food & Lifestyle', desc: 'Viral content' },
                    { id: 'travel', icon: '✈️', name: 'Travel', desc: 'Lifestyle brand' }
                  ].map(niche => (
                    <div 
                      key={niche.id}
                      onClick={() => handleNicheSelect(niche.id)}
                      style={{ background: selectedNiche === niche.id ? 'var(--orange-d)' : 'var(--surface2)', border: selectedNiche === niche.id ? '2px solid var(--orange)' : '2px solid var(--edge)', borderRadius: '11px', padding: '13px', cursor: 'pointer', textAlign: 'center', transition: 'all .15s' }}
                    >
                      <div style={{ fontSize: '28px', marginBottom: '5px' }}>{niche.icon}</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }}>{niche.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--t3)' }}>{niche.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedNiche && (
                <div className="card">
                  <div className="sec-hd"><div className="sec-title">🔍 {L('Select Micro-Niche', 'اختر التخصص الدقيق')}</div></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    <button onClick={() => handleMicroSelect('micro1')} className="btn btn-ghost" style={{ justifyContent: 'flex-start', background: selectedMicro === 'micro1' ? 'var(--surface3)' : 'none' }}>Specific sub-niche 1</button>
                    <button onClick={() => handleMicroSelect('micro2')} className="btn btn-ghost" style={{ justifyContent: 'flex-start', background: selectedMicro === 'micro2' ? 'var(--surface3)' : 'none' }}>Specific sub-niche 2</button>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Panel */}
            <div>
              {selectedMicro ? (
                <div className="card">
                  <div className="sec-hd"><div className="sec-title">📊 {L('Niche Analysis', 'تحليل التخصص')}</div></div>
                  <div style={{ padding: '20px', fontSize: '14px', lineHeight: 1.6, color: 'var(--t2)' }}>
                    {L('Analysis data would appear here based on the selected micro-niche. Showing opportunities, challenges, and step-by-step launch plan.', 'ستظهر بيانات التحليل هنا بناءً على التخصص الدقيق المحدد. تعرض الفرص والتحديات وخطة إطلاق خطوة بخطوة.')}
                  </div>
                </div>
              ) : (
                <div className="empty-state card" style={{ padding: '40px', textAlign: 'center' }}>
                  <div className="es-icon">🎯</div>
                  <div className="es-title">{L('Select a niche to explore', 'اختر تخصصاً لاستكشافه')}</div>
                  <div className="es-sub">{L('Choose a main niche → then a micro-niche to get a full analysis with opportunities, challenges, and a step-by-step launch plan using UpKlick', 'اختر تخصصاً رئيسياً ثم تخصصاً دقيقاً للحصول على تحليل كامل')}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
