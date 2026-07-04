'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { buildFullLP } from '../../utils/lpBuilder';
import { callClaudeAPI } from '../../utils/ai';
import CustomSelect from '../CustomSelect';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const getDefaultLPData = (isAR) => ({
  aboutText: isAR 
    ? 'أنا رائد أعمال ومصمم ومطور أساعد المنشئين والشركات على بناء هوياتهم الرقمية وتسويق خدماتهم بذكاء.' 
    : 'I am an entrepreneur, designer, and developer helping creators and businesses build their digital brand.',
  features: isAR ? [
    { icon: '🎯', title: 'خطة عمل مخصصة', desc: 'خطة عمل مصممة خصيصاً لأهدافك وظروفك' },
    { icon: '📞', title: 'جلسات فردية أسبوعية', desc: 'لقاءات منتظمة لمتابعة تقدمك وحل التحديات' },
    { icon: '📚', title: 'موارد حصرية', desc: 'مكتبة شاملة من القوالب والأدوات والمواد' },
    { icon: '👥', title: 'مجتمع داعم', desc: 'انضم لمجموعة من المتحمسين يشجعونك للأمام' },
    { icon: '📊', title: 'قياس النتائج', desc: 'متابعة دقيقة للتقدم مع تعديلات مستمرة' },
    { icon: '🏆', title: 'شهادة معتمدة', desc: 'احصل على شهادة إتمام معترف بها' }
  ] : [
    { icon: '🎯', title: 'Personalized Action Plan', desc: 'A roadmap designed specifically for your goals' },
    { icon: '📞', title: 'Weekly 1-on-1 Sessions', desc: 'Regular meetings to track progress and solve challenges' },
    { icon: '📚', title: 'Exclusive Resources', desc: 'Full library of templates, tools, and materials' },
    { icon: '👥', title: 'Supportive Community', desc: 'Join a group of motivated peers cheering you on' },
    { icon: '📊', title: 'Results Tracking', desc: 'Precise progress monitoring with ongoing adjustments' },
    { icon: '🏆', title: 'Certified Achievement', desc: 'Get a recognized completion certificate' }
  ],
  testimonials: isAR ? [
    { initial: 'ن', name: 'نورة الراشدي', loc: 'السعودية', stars: 5, text: 'غيّر مسار حياتي المهنية كلياً. ساعدني أحقق أهدافاً كنت أظنها مستحيلة.' },
    { initial: 'أ', name: 'أحمد خليل', loc: 'مصر', stars: 5, text: 'بدأت أكسب من محتواي في أول ٦٠ يوم. أفضل استثمار في حياتي.' },
    { initial: 'م', name: 'منى صابر', loc: 'الإمارات', stars: 5, text: 'أخيراً مدرب يفهم السوق العربي وتحدياته الفعلية. أنصح به بشدة.' }
  ] : [
    { initial: 'N', name: 'Nora Al-Rashidi', loc: 'Saudi Arabia', stars: 5, text: 'Coaching completely changed my path. Helped me achieve goals I thought were impossible.' },
    { initial: 'A', name: 'Ahmed K.', loc: 'Egypt', stars: 5, text: 'Started earning from my content in the first 60 days. Best investment of my life.' },
    { initial: 'M', name: 'Mona Al-Saber', loc: 'UAE', stars: 5, text: 'Finally someone who truly understands the Arab market. Highly recommend.' }
  ],
  faqs: isAR ? [
    { q: 'هل الكورس مناسب للمبتدئين؟', a: 'نعم، نبدأ خطوة بخطوة من الصفر حتى الاحتراف.' },
    { q: 'ما هي مدة صلاحية المواد؟', a: 'صلاحية وصول مدى الحياة لجميع الدروس والتحديثات.' },
    { q: 'هل توجد ضمانات؟', a: 'نعم، نقدم ضمان استرداد الأموال بنسبة 100% خلال 30 يوماً.' },
    { q: 'هل توجد متابعة شخصية؟', a: 'نعم، يشمل العرض جلسات أسئلة وأجوبة ومراجعات مباشرة.' }
  ] : [
    { q: 'Is it suitable for beginners?', a: 'Yes, we start step-by-step from scratch to advanced.' },
    { q: 'How long do I have access?', a: 'Lifetime access to all lessons and future updates.' },
    { q: 'Is there a money-back guarantee?', a: 'Yes, 30-day 100% money back guarantee.' },
    { q: 'Is there 1-on-1 support?', a: 'Yes, includes Q&A calls and community feedback.' }
  ],
  plans: isAR ? [
    { name: 'أساسي', price: 60, features: ['وصول للمحتوى', 'مجتمع المنشئين', 'تحديثات لمدة سنة'], popular: false },
    { name: 'المتميز', price: 100, features: ['كل ما في الأساسي', 'جلسة إرشاد فردية', 'دعم مستمر ٣٠ يوم'], popular: true },
    { name: 'VIP', price: 180, features: ['كل شيء', 'مراجعة حساباتك الشخصية', 'مكالمة شهرية لمدة ٣ شهور'], popular: false }
  ] : [
    { name: 'Basic', price: 60, features: ['Content access', 'Creator community', '1-year updates'], popular: false },
    { name: 'Premium', price: 100, features: ['Everything in Basic', '1-on-1 coaching session', '30-day ongoing support'], popular: true },
    { name: 'VIP', price: 180, features: ['Everything', 'Personal account review', 'Monthly call for 3 months'], popular: false }
  ]
});

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');

  const [aboutText, setAboutText] = useState(lpData.aboutText || '');
  const [features, setFeatures] = useState(lpData.features || []);
  const [testimonials, setTestimonials] = useState(lpData.testimonials || []);
  const [faqs, setFaqs] = useState(lpData.faqs || []);
  const [plans, setPlans] = useState(lpData.plans || []);
  const [username, setUsername] = useState(GC.bioLink?.username || GC.profile.username || 'username');

  // Sync username from GC
  useEffect(() => {
    if (GC.bioLink?.username && GC.bioLink.username !== username) {
      setUsername(GC.bioLink.username);
    }
  }, [GC.bioLink?.username]);

  const [controlsTab, setControlsTab] = useState('basic'); // 'basic', 'about', 'features', 'testimonials', 'faq', 'plans'

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

  // Real-time rebuild effect on input change
  useEffect(() => {
    const isAr = lang === 'ar';
    const defaults = getDefaultLPData(isAr);

    const activeAbout = aboutText || defaults.aboutText;
    const activeFeatures = (features && features.length === 6) ? features : defaults.features;
    const activeTestimonials = (testimonials && testimonials.length === 3) ? testimonials : defaults.testimonials;
    const activeFaqs = (faqs && faqs.length === 4) ? faqs : defaults.faqs;
    const activePlans = (plans && plans.length === 3) ? plans : defaults.plans;

    const parsedData = {
      tagline,
      aboutText: activeAbout,
      features: activeFeatures,
      testimonials: activeTestimonials,
      faqs: activeFaqs,
      plans: activePlans
    };

    const code = buildFullLP(name, niche, offer, tagline, color, isAr, template, price, parsedData);
    setLpCode(code);
    setLpPreviewHtml(code);

    // Throttle / debounce saves to global context / Firestore
    const timer = setTimeout(() => {
      saveLPData({
        name, niche, offer, tagline, color, template, price,
        aboutText: activeAbout,
        features: activeFeatures,
        testimonials: activeTestimonials,
        faqs: activeFaqs,
        plans: activePlans,
        lpCode: code
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [name, niche, offer, tagline, color, template, price, aboutText, features, testimonials, faqs, plans]);

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const promptText = `Generate high-converting landing page copy based on the following:
Name/Brand: ${name}
Niche/Industry: ${niche}
Main Offer/Product: ${offer}
Price: $${price}

Return ONLY a raw JSON object with this exact structure (no markdown, no extra text):
{
  "tagline": "A compelling 4-8 word subtitle",
  "aboutText": "A persuasive 3-4 sentence 'About Me' bio building trust.",
  "features": [
    { "title": "short feature title", "desc": "short benefit description", "icon": "emoji" },
    ... exactly 6 features ...
  ],
  "testimonials": [
    { "initial": "A", "name": "Fake Arabic Name", "loc": "City/Country", "stars": 5, "text": "Short amazing review" },
    ... exactly 3 reviews ...
  ],
  "faqs": [
    { "q": "Question?", "a": "Answer" },
    ... exactly 4 faqs ...
  ],
  "plans": [
    { "name": "Starter/Basic Plan Name", "price": ${Math.round(price * 0.6)}, "features": ["Benefit 1", "Benefit 2", "Benefit 3"], "popular": false },
    { "name": "Premium/Recommended Plan Name", "price": ${price}, "features": ["Benefit 1", "Benefit 2", "Benefit 3", "Benefit 4"], "popular": true },
    { "name": "VIP/Ultimate Plan Name", "price": ${Math.round(price * 1.8)}, "features": ["Benefit 1", "Benefit 2", "Benefit 3", "Benefit 4", "Benefit 5"], "popular": false }
  ]
}

The language MUST be entirely in ${lang === 'ar' ? 'Arabic' : 'English'}. Make it highly persuasive and professional.`;

      const systemText = "You are a professional conversion copywriter. You only output pure, valid JSON matching the exact requested structure.";

      const res = await callClaudeAPI(promptText, systemText, lang, GC);
      
      if (typeof res === 'string' && res.includes('❌')) {
        alert(res);
        setIsGenerating(false);
        return;
      }

      let parsed;
      try {
        const jsonStr = res.substring(res.indexOf('{'), res.lastIndexOf('}') + 1);
        parsed = JSON.parse(jsonStr);
      } catch (e) {
        console.error("Failed to parse JSON", res);
        alert(`❌ AI Error: Could not parse response as JSON.\nResponse: ${res}`);
        setIsGenerating(false);
        return;
      }

      if (parsed.tagline) setTagline(parsed.tagline);
      if (parsed.aboutText) setAboutText(parsed.aboutText);
      if (parsed.features) setFeatures(parsed.features);
      if (parsed.testimonials) setTestimonials(parsed.testimonials);
      if (parsed.faqs) setFaqs(parsed.faqs);
      if (parsed.plans) setPlans(parsed.plans);

    } catch (e) {
      console.error(e);
      alert(`❌ Unexpected Error: ${e.message}`);
    }
    setIsGenerating(false);
  };

  // Sync state if GC updates (performing shallow check to avoid re-triggering loops)
  useEffect(() => {
    if (GC.landingPage) {
      const lp = GC.landingPage;
      if (lp.name !== undefined && lp.name !== name) setName(lp.name);
      if (lp.niche !== undefined && lp.niche !== niche) setNiche(lp.niche);
      if (lp.offer !== undefined && lp.offer !== offer) setOffer(lp.offer);
      if (lp.tagline !== undefined && lp.tagline !== tagline) setTagline(lp.tagline);
      if (lp.color !== undefined && lp.color !== color) setColor(lp.color);
      if (lp.template !== undefined && lp.template !== template) setTemplate(lp.template);
      if (lp.price !== undefined && lp.price !== price) setPrice(lp.price);
      if (lp.lpCode !== undefined && lp.lpCode !== lpCode) setLpCode(lp.lpCode);
      if (lp.aboutText !== undefined && lp.aboutText !== aboutText) setAboutText(lp.aboutText);
      if (lp.features && JSON.stringify(lp.features) !== JSON.stringify(features)) setFeatures(lp.features);
      if (lp.testimonials && JSON.stringify(lp.testimonials) !== JSON.stringify(testimonials)) setTestimonials(lp.testimonials);
      if (lp.faqs && JSON.stringify(lp.faqs) !== JSON.stringify(faqs)) setFaqs(lp.faqs);
      if (lp.plans && JSON.stringify(lp.plans) !== JSON.stringify(plans)) setPlans(lp.plans);
    }
  }, [GC.landingPage]);

  const handleUsernameChange = (newVal) => {
    const clean = newVal.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    setUsername(clean);
    
    const updatedGC = {
      ...GC,
      bioLink: {
        ...(GC.bioLink || {}),
        username: clean
      }
    };
    saveGC(updatedGC);
  };

  const handlePublish = async () => {
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!cleanUsername) {
      alert(L('Please configure your username first!', 'يرجى كتابة اسم المستخدم الخاص بك أولاً!'));
      return;
    }

    try {
      const uid = auth?.currentUser?.uid || '';
      const docRef = doc(db, 'bio_links', cleanUsername);
      const docSnap = await getDoc(docRef);

      // If doc exists, verify ownership
      if (docSnap.exists() && docSnap.data().ownerUid && docSnap.data().ownerUid !== uid) {
        alert(L('Username is already claimed by another user!', 'اسم المستخدم محجوز بالفعل لمستخدم آخر!'));
        return;
      }

      const existingData = docSnap.exists() ? docSnap.data() : {};
      const data = {
        ...existingData,
        // Preserve all current GC.bioLink fields
        displayName: GC.bioLink?.displayName || existingData.displayName || name || '',
        bioTagline: GC.bioLink?.bioTagline || existingData.bioTagline || tagline || '',
        links: GC.bioLink?.links || existingData.links || [],
        socials: GC.bioLink?.socials || existingData.socials || {},
        bioTheme: GC.bioLink?.bioTheme || existingData.bioTheme || 'dark',
        layout: GC.bioLink?.layout || existingData.layout || 'classic',
        font: GC.bioLink?.font || existingData.font || 'Tajawal',
        avatarUrl: GC.bioLink?.avatarUrl || existingData.avatarUrl || '',
        cvEnabled: GC.bioLink?.cvEnabled || existingData.cvEnabled || false,
        cvSections: GC.bioLink?.cvSections || existingData.cvSections || {},
        
        // Update landing page specific fields
        ownerUid: uid || existingData.ownerUid || '',
        username: cleanUsername,
        landingPageHtml: lpCode,
        showLandingPage: true,
        updatedAt: new Date().toISOString()
      };

      await setDoc(docRef, data);

      // Update local Context as well (merge, do NOT wipe!)
      const updatedGC = {
        ...GC,
        bioLink: {
          ...(GC.bioLink || {}),
          ...data
        }
      };
      saveGC(updatedGC);

      alert(L(`Successfully published! Your landing page is live at: /${cleanUsername}/promo`, `تم النشر بنجاح! صفحة الهبوط الخاصة بك الآن مباشرة على: /${cleanUsername}/promo`));
    } catch (err) {
      console.error("Error publishing landing page:", err);
      alert(L('Error publishing: ' + err.message, 'خطأ أثناء النشر: ' + err.message));
    }
  };

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

  const updateFeature = (idx, field, val) => {
    const isAr = lang === 'ar';
    const defaults = getDefaultLPData(isAr);
    const baseFeats = (features && features.length === 6) ? [...features] : [...defaults.features];
    // Support either title/t and desc/d property mapping
    const titleKey = baseFeats[idx].title !== undefined ? 'title' : baseFeats[idx].t !== undefined ? 't' : 'title';
    const descKey = baseFeats[idx].desc !== undefined ? 'desc' : baseFeats[idx].d !== undefined ? 'd' : 'desc';
    const keyToUse = field === 'title' ? titleKey : field === 'desc' ? descKey : field;
    
    baseFeats[idx] = { ...baseFeats[idx], [keyToUse]: val };
    setFeatures(baseFeats);
    saveLPData({ features: baseFeats });
  };

  const updateTestimonial = (idx, field, val) => {
    const isAr = lang === 'ar';
    const defaults = getDefaultLPData(isAr);
    const baseTestimonials = (testimonials && testimonials.length === 3) ? [...testimonials] : [...defaults.testimonials];
    
    // Support initial/i, text/tx
    const textKey = baseTestimonials[idx].text !== undefined ? 'text' : baseTestimonials[idx].tx !== undefined ? 'tx' : 'text';
    const initialKey = baseTestimonials[idx].initial !== undefined ? 'initial' : baseTestimonials[idx].i !== undefined ? 'i' : 'initial';
    const nameKey = baseTestimonials[idx].name !== undefined ? 'name' : baseTestimonials[idx].n !== undefined ? 'n' : 'name';
    const keyToUse = field === 'text' ? textKey : field === 'initial' ? initialKey : field === 'name' ? nameKey : field;

    baseTestimonials[idx] = { ...baseTestimonials[idx], [keyToUse]: val };
    setTestimonials(baseTestimonials);
    saveLPData({ testimonials: baseTestimonials });
  };

  const updateFaq = (idx, field, val) => {
    const isAr = lang === 'ar';
    const defaults = getDefaultLPData(isAr);
    const baseFaqs = (faqs && faqs.length === 4) ? [...faqs] : [...defaults.faqs];
    baseFaqs[idx] = { ...baseFaqs[idx], [field]: val };
    setFaqs(baseFaqs);
    saveLPData({ faqs: baseFaqs });
  };

  const updatePlan = (idx, field, val) => {
    const isAr = lang === 'ar';
    const defaults = getDefaultLPData(isAr);
    const basePlans = (plans && plans.length === 3) ? [...plans] : [...defaults.plans];

    let finalVal = val;
    if (field === 'features') {
      finalVal = val.split('\n').map(item => item.trim()).filter(Boolean);
    } else if (field === 'price') {
      finalVal = parseInt(val) || 0;
    }

    basePlans[idx] = { ...basePlans[idx], [field]: finalVal };
    setPlans(basePlans);
    saveLPData({ plans: basePlans });
  };

  return (
    <div className="pg on" id="pg-landing">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">⚡</span>
          <span>{L('Landing Page AI', 'مولّد صفحة الهبوط')}</span>
        </div>
        <div className="pg-actions">
          <button className="btn btn-prime" onClick={handlePublish}>
            🚀 {L('Publish & Go Live', 'نشر واجعله مباشراً')}
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              const clean = username.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
              if (clean) window.open(`/${clean}/promo`, '_blank');
            }}
          >
            🔗 {L('View Published Page', 'عرض الصفحة المباشرة')}
          </button>
          <button className="btn btn-ghost" onClick={handleCopy}>
            📋 {L('Copy HTML Code', 'نسخ كود HTML')}
          </button>
          <button className="btn btn-ghost" onClick={() => setLpPreviewOpen(true)}>
            🔍 {L('Fullscreen', 'شاشة كاملة')}
          </button>
        </div>
      </div>

      <div className="g12">
        {/* Left Side: Controls */}
        {/* Left Side: Controls */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="sec-hd" style={{ marginBottom: '8px' }}>
            <div className="sec-title">{L('Landing Page Editor', 'محرر صفحة الهبوط')}</div>
          </div>

          {/* Sub Navigation tabs */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '6px', borderBottom: '1px solid var(--edge)', marginBottom: '14px' }}>
            <button className={`tab-btn ${controlsTab === 'basic' ? 'on' : ''}`} style={{ fontSize: '11px', padding: '4px 10px', height: '30px' }} onClick={() => setControlsTab('basic')}>
              ⚙️ {L('Basic', 'الأساسية')}
            </button>
            <button className={`tab-btn ${controlsTab === 'about' ? 'on' : ''}`} style={{ fontSize: '11px', padding: '4px 10px', height: '30px' }} onClick={() => setControlsTab('about')}>
              ✍️ {L('Bio', 'النبذة')}
            </button>
            <button className={`tab-btn ${controlsTab === 'features' ? 'on' : ''}`} style={{ fontSize: '11px', padding: '4px 10px', height: '30px' }} onClick={() => setControlsTab('features')}>
              🎯 {L('Features', 'المميزات')}
            </button>
            <button className={`tab-btn ${controlsTab === 'testimonials' ? 'on' : ''}`} style={{ fontSize: '11px', padding: '4px 10px', height: '30px' }} onClick={() => setControlsTab('testimonials')}>
              💬 {L('Reviews', 'الآراء')}
            </button>
            <button className={`tab-btn ${controlsTab === 'faq' ? 'on' : ''}`} style={{ fontSize: '11px', padding: '4px 10px', height: '30px' }} onClick={() => setControlsTab('faq')}>
              ❓ {L('FAQ', 'الأسئلة')}
            </button>
            <button className={`tab-btn ${controlsTab === 'plans' ? 'on' : ''}`} style={{ fontSize: '11px', padding: '4px 10px', height: '30px' }} onClick={() => setControlsTab('plans')}>
              💰 {L('Plans', 'الباقات')}
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '420px', paddingInlineEnd: '4px' }}>
            {/* PANEL 1: BASIC INFO */}
            {controlsTab === 'basic' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Public Link / Username', 'اسم المستخدم / الرابط الخاص بك')}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface2)', borderRadius: '8px', padding: '0 10px', border: '1px solid var(--edge)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--t3)', userSelect: 'none', paddingInlineEnd: '4px' }}>upklick.bio/</span>
                    <input
                      className="inp"
                      style={{ border: 'none', background: 'transparent', padding: '8px 0', flex: 1, outline: 'none' }}
                      value={username}
                      onChange={(e) => {
                        const clean = e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '');
                        setUsername(clean);
                      }}
                      onBlur={(e) => handleUsernameChange(e.target.value)}
                      placeholder="username"
                    />
                  </div>
                </div>
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
                    <CustomSelect
                      className="inp"
                      value={template}
                      onChange={(e) => { setTemplate(e.target.value); saveLPData({ template: e.target.value }); }}
                    >
                      {templates.map((t) => (
                        <option key={t.key} value={t.key}>
                          {t.name}
                        </option>
                      ))}
                    </CustomSelect>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '8px' }}>
                    {L('Brand Accent Color', 'لون الهوية')}
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {brandColors.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => { setColor(c.code); saveLPData({ color: c.code }); }}
                        style={{
                          width: '24px',
                          height: '24px',
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
                        width: '24px',
                        height: '24px',
                        border: 'none',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        background: 'none',
                        padding: '0'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 2: HERO & ABOUT */}
            {controlsTab === 'about' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Tagline Subtitle', 'العنوان الفرعي للمنتج')}
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
                  <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('About Me Bio', 'نبذة عني')}
                  </label>
                  <textarea
                    className="inp"
                    rows="5"
                    value={aboutText}
                    onChange={(e) => { setAboutText(e.target.value); saveLPData({ aboutText: e.target.value }); }}
                    placeholder="Provide a persuasive bio description..."
                  />
                </div>
              </div>
            )}

            {/* PANEL 3: FEATURES (6 ITEMS) */}
            {controlsTab === 'features' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {Array.from({ length: 6 }).map((_, idx) => {
                  const isAr = lang === 'ar';
                  const defaults = getDefaultLPData(isAr);
                  const activeFeat = (features && features[idx]) ? features[idx] : (defaults.features[idx] || { icon: '✨', title: '', desc: '' });
                  const displayTitle = activeFeat.title || activeFeat.t || '';
                  const displayDesc = activeFeat.desc || activeFeat.d || '';
                  return (
                    <div key={idx} style={{ background: 'var(--surface2)', padding: '10px', borderRadius: '8px', border: '1px solid var(--edge)' }}>
                      <div style={{ fontWeight: 600, fontSize: '11px', color: 'var(--orange)', marginBottom: '8px' }}>
                        {L(`Feature #${idx + 1}`, `الميزة رقم ${idx + 1}`)}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                        <input
                          className="inp"
                          style={{ width: '45px', textAlign: 'center', padding: '6px 4px' }}
                          value={activeFeat.icon || '✨'}
                          onChange={(e) => updateFeature(idx, 'icon', e.target.value)}
                          placeholder="Icon"
                        />
                        <input
                          className="inp"
                          style={{ flex: 1 }}
                          value={displayTitle}
                          onChange={(e) => updateFeature(idx, 'title', e.target.value)}
                          placeholder={L('Feature title', 'عنوان الميزة')}
                        />
                      </div>
                      <input
                        className="inp"
                        value={displayDesc}
                        onChange={(e) => updateFeature(idx, 'desc', e.target.value)}
                        placeholder={L('Short benefit description', 'وصف الميزة والفائدة')}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* PANEL 4: TESTIMONIALS (3 ITEMS) */}
            {controlsTab === 'testimonials' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {Array.from({ length: 3 }).map((_, idx) => {
                  const isAr = lang === 'ar';
                  const defaults = getDefaultLPData(isAr);
                  const activeTest = (testimonials && testimonials[idx]) ? testimonials[idx] : (defaults.testimonials[idx] || { name: '', stars: 5, text: '', loc: '', initial: '' });
                  const displayInitial = activeTest.initial || activeTest.i || activeTest.name?.[0] || 'A';
                  const displayNameVal = activeTest.name || activeTest.n || '';
                  const displayTextVal = activeTest.text || activeTest.tx || '';
                  return (
                    <div key={idx} style={{ background: 'var(--surface2)', padding: '10px', borderRadius: '8px', border: '1px solid var(--edge)' }}>
                      <div style={{ fontWeight: 600, fontSize: '11px', color: 'var(--orange)', marginBottom: '8px' }}>
                        {L(`Review #${idx + 1}`, `التقييم رقم ${idx + 1}`)}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '40px 1.5fr 1fr', gap: '6px', marginBottom: '6px' }}>
                        <input
                          className="inp"
                          style={{ textAlign: 'center', padding: '6px 4px' }}
                          value={displayInitial}
                          onChange={(e) => updateTestimonial(idx, 'initial', e.target.value)}
                          placeholder="initial"
                        />
                        <input
                          className="inp"
                          value={displayNameVal}
                          onChange={(e) => updateTestimonial(idx, 'name', e.target.value)}
                          placeholder={L('Name', 'الاسم')}
                        />
                        <input
                          className="inp"
                          value={activeTest.loc || ''}
                          onChange={(e) => updateTestimonial(idx, 'loc', e.target.value)}
                          placeholder={L('Location', 'البلد')}
                        />
                      </div>
                      <textarea
                        className="inp"
                        rows="2"
                        value={displayTextVal}
                        onChange={(e) => updateTestimonial(idx, 'text', e.target.value)}
                        placeholder={L('Review copy...', 'نص التقييم والمراجعة...')}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* PANEL 5: FAQS (4 ITEMS) */}
            {controlsTab === 'faq' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {Array.from({ length: 4 }).map((_, idx) => {
                  const isAr = lang === 'ar';
                  const defaults = getDefaultLPData(isAr);
                  const activeFaq = (faqs && faqs[idx]) ? faqs[idx] : (defaults.faqs[idx] || { q: '', a: '' });
                  return (
                    <div key={idx} style={{ background: 'var(--surface2)', padding: '10px', borderRadius: '8px', border: '1px solid var(--edge)' }}>
                      <div style={{ fontWeight: 600, fontSize: '11px', color: 'var(--orange)', marginBottom: '8px' }}>
                        {L(`FAQ #${idx + 1}`, `سؤال ${idx + 1}`)}
                      </div>
                      <input
                        className="inp"
                        style={{ marginBottom: '6px' }}
                        value={activeFaq.q || ''}
                        onChange={(e) => updateFaq(idx, 'q', e.target.value)}
                        placeholder={L('Question', 'السؤال')}
                      />
                      <textarea
                        className="inp"
                        rows="2"
                        value={activeFaq.a || ''}
                        onChange={(e) => updateFaq(idx, 'a', e.target.value)}
                        placeholder={L('Answer', 'الإجابة')}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* PANEL 6: PLANS (3 ITEMS) */}
            {controlsTab === 'plans' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {Array.from({ length: 3 }).map((_, idx) => {
                  const isAr = lang === 'ar';
                  const defaults = getDefaultLPData(isAr);
                  const activePlan = (plans && plans[idx]) ? plans[idx] : (defaults.plans[idx] || { name: '', price: 0, features: [], popular: false });
                  
                  // Feature lines joined by newline
                  const planFeatures = Array.isArray(activePlan.features) 
                    ? activePlan.features 
                    : (activePlan.b || []);
                  const featuresText = planFeatures.join('\n');

                  return (
                    <div key={idx} style={{ background: 'var(--surface2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--edge)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--c1)' }}>
                          {L(`Package #${idx + 1}`, `الباقة رقم ${idx + 1}`)}
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--t2)', cursor: 'pointer' }}>
                          <input 
                            type="checkbox"
                            checked={activePlan.popular || false}
                            onChange={(e) => {
                              const isAr = lang === 'ar';
                              const defaults = getDefaultLPData(isAr);
                              const basePlans = (plans && plans.length === 3) ? [...plans] : [...defaults.plans];
                              basePlans.forEach((p, pIdx) => {
                                basePlans[pIdx] = { ...p, popular: pIdx === idx ? e.target.checked : false };
                              });
                              setPlans(basePlans);
                              saveLPData({ plans: basePlans });
                            }}
                          />
                          {L('Popular (🌟)', 'الأكثر طلباً (🌟)')}
                        </label>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        <div>
                          <label style={{ fontSize: '10px', color: 'var(--t3)', display: 'block', marginBottom: '2px' }}>
                            {L('Plan Name', 'اسم الباقة')}
                          </label>
                          <input
                            className="inp"
                            value={activePlan.name || activePlan.n || ''}
                            onChange={(e) => updatePlan(idx, 'name', e.target.value)}
                            placeholder={L('e.g. Basic', 'مثال: أساسي')}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '10px', color: 'var(--t3)', display: 'block', marginBottom: '2px' }}>
                            {L('Plan Price ($)', 'السعر ($)')}
                          </label>
                          <input
                            className="inp"
                            type="number"
                            value={activePlan.price || activePlan.price === 0 ? activePlan.price : (activePlan.p || '')}
                            onChange={(e) => updatePlan(idx, 'price', e.target.value)}
                            placeholder="60"
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '10px', color: 'var(--t3)', display: 'block', marginBottom: '2px' }}>
                          {L('Features (one per line)', 'المميزات (ميزة في كل سطر)')}
                        </label>
                        <textarea
                          className="inp"
                          rows="3"
                          value={featuresText}
                          onChange={(e) => updatePlan(idx, 'features', e.target.value)}
                          placeholder={L('Feature 1\nFeature 2', 'ميزة ١\nميزة ٢')}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', borderTop: '1px solid var(--edge)', paddingTop: '10px', marginTop: '8px' }}>
            <button className="btn btn-prime" style={{ flex: 1, justifyContent: 'center' }} onClick={handleGenerate} disabled={isGenerating}>
              ✦ {isGenerating ? L('AI Copywriting...', 'صياغة بالذكاء...') : L('AI Copywrite', 'صياغة المحتوى بالـ AI')}
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
              background: 'var(--surface2)',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--t1)' }}>
                {previewMode === 'desktop' ? L('🖥️ Desktop Preview', '🖥️ معاينة الحاسوب') : L('📱 Mobile Preview', '📱 معاينة الهاتف')}
              </span>
              <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '2px' }}>
                <button
                  onClick={() => setPreviewMode('desktop')}
                  style={{
                    border: 'none',
                    background: previewMode === 'desktop' ? 'var(--orange)' : 'transparent',
                    color: previewMode === 'desktop' ? '#fff' : 'var(--t2)',
                    padding: '2px 8px',
                    fontSize: '11px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                  }}
                >
                  {L('Desktop', 'حاسوب')}
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  style={{
                    border: 'none',
                    background: previewMode === 'mobile' ? 'var(--orange)' : 'transparent',
                    color: previewMode === 'mobile' ? '#fff' : 'var(--t2)',
                    padding: '2px 8px',
                    fontSize: '11px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                  }}
                >
                  {L('Mobile', 'هاتف')}
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                className="btn btn-ghost"
                style={{ padding: '3px 8px', fontSize: '11px', height: '26px' }}
                onClick={handleFullscreen}
              >
                🔗 {L('Open New Tab', 'افتح في علامة جديدة')}
              </button>
              <button
                className="btn btn-prime"
                style={{ padding: '3px 8px', fontSize: '11px', height: '26px' }}
                onClick={() => {
                  const clean = username.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
                  if (clean) window.open(`/${clean}/promo`, '_blank');
                }}
              >
                🚀 {L('View Live Page', 'معاينة المباشر')}
              </button>
            </div>
          </div>
          <div style={{ 
            flex: 1, 
            padding: '12px', 
            background: 'var(--surface3)', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            overflow: 'hidden'
          }}>
            {lpCode ? (
              <iframe
                srcDoc={lpCode}
                style={{
                  width: previewMode === 'mobile' ? '375px' : '100%',
                  height: '100%',
                  maxWidth: '100%',
                  border: '1px solid var(--edge)',
                  borderRadius: previewMode === 'mobile' ? '24px' : '8px',
                  background: '#fff',
                  boxShadow: previewMode === 'mobile' ? '0 12px 36px rgba(0,0,0,0.35)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
