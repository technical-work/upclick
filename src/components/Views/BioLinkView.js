'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { auth, db } from '../../lib/firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

export default function BioLinkView() {
  const { lang, L, t, GC, saveGC } = useBusiness();

  const bioData = GC.bioLink || {
    displayName: 'Sara Hassan',
    bioTagline: 'Coach | Entrepreneur | Content Creator 🚀',
    username: 'sarahassan',
    bioTheme: 'dark',
    layout: 'classic',
    font: 'Tajawal',
    avatarUrl: '',
    links: [
      { title: 'My Website', url: 'https://sarahassan.com', icon: '🌐' },
      { title: 'Free Course', url: 'https://upklick.bio/sarahassan/free', icon: '📚' },
      { title: 'Book a Call', url: 'https://calendly.com/sarahassan', icon: '💬', highlighted: true }
    ],
    socials: { ig: '@sarahassan', tt: '@sarahassan', yt: 'Sarah Hassan', li: '', tg: '', wa: '' },
    cvEnabled: false,
    cvSections: {
      summary: '',
      contact: { email: '', phone: '', location: '' },
      experience: [],
      education: [],
      skillsList: [],
      languages: [],
      certifications: [],
      projects: []
    }
  };

  const [displayName, setDisplayName] = useState(bioData.displayName || '');
  const [bioTagline, setBioTagline] = useState(bioData.bioTagline || '');
  const [username, setUsername] = useState(bioData.username || '');
  const [bioTheme, setBioTheme] = useState(bioData.bioTheme || 'dark');
  const [layout, setLayout] = useState(bioData.layout || 'classic');
  const [font, setFont] = useState(bioData.font || 'Tajawal');
  const [avatarUrl, setAvatarUrl] = useState(bioData.avatarUrl || '');
  const [showLandingPage, setShowLandingPage] = useState(bioData.showLandingPage || false);

  const [links, setLinks] = useState(bioData.links || []);
  const [socials, setSocials] = useState(bioData.socials || {});

  // CV / Resume states
  const [cvEnabled, setCvEnabled] = useState(bioData.cvEnabled || false);
  const [cvSummary, setCvSummary] = useState(bioData.cvSections?.summary || '');
  const [cvContact, setCvContact] = useState(bioData.cvSections?.contact || { email: '', phone: '', location: '' });
  const [experience, setExperience] = useState(bioData.cvSections?.experience || []);
  const [education, setEducation] = useState(bioData.cvSections?.education || []);
  const [skillsList, setSkillsList] = useState(bioData.cvSections?.skillsList || []);
  const [languages, setLanguages] = useState(bioData.cvSections?.languages || []);
  const [certifications, setCertifications] = useState(bioData.cvSections?.certifications || []);
  const [projects, setProjects] = useState(bioData.cvSections?.projects || []);

  // Editor Tabs
  const [editorTab, setEditorTab] = useState('setup'); // 'setup', 'links', 'cv'
  // Preview Tab
  const [previewTab, setPreviewTab] = useState('links'); // 'links', 'cv'

  // Image Upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Sync state if GC updates
  useEffect(() => {
    if (GC.bioLink) {
      setDisplayName(GC.bioLink.displayName || '');
      setBioTagline(GC.bioLink.bioTagline || '');
      setUsername(GC.bioLink.username || '');
      setBioTheme(GC.bioLink.bioTheme || 'dark');
      setLayout(GC.bioLink.layout || 'classic');
      setFont(GC.bioLink.font || 'Tajawal');
      setAvatarUrl(GC.bioLink.avatarUrl || '');
      setShowLandingPage(GC.bioLink.showLandingPage || false);
      setLinks(GC.bioLink.links || []);
      setSocials(GC.bioLink.socials || {});
      setCvEnabled(GC.bioLink.cvEnabled || false);
      
      // Sync CV nested fields
      setCvSummary(GC.bioLink.cvSections?.summary || '');
      setCvContact(GC.bioLink.cvSections?.contact || { email: '', phone: '', location: '' });
      setExperience(GC.bioLink.cvSections?.experience || []);
      setEducation(GC.bioLink.cvSections?.education || []);
      setSkillsList(GC.bioLink.cvSections?.skillsList || []);
      setLanguages(GC.bioLink.cvSections?.languages || []);
      setCertifications(GC.bioLink.cvSections?.certifications || []);
      setProjects(GC.bioLink.cvSections?.projects || []);
    }
  }, [GC.bioLink]);

  const addLink = () => {
    setLinks(prev => [...prev, { title: 'New Link', url: 'https://', icon: '🔗', description: '', highlighted: false }]);
  };

  const updateLink = (idx, field, value) => {
    setLinks(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  };

  const removeLink = (idx) => {
    setLinks(prev => prev.filter((_, i) => i !== idx));
  };

  // Experience handlers
  const addExperience = () => {
    setExperience(prev => [...prev, { company: '', role: '', period: '', desc: '' }]);
  };

  const updateExperience = (idx, field, value) => {
    setExperience(prev => prev.map((exp, i) => i === idx ? { ...exp, [field]: value } : exp));
  };

  const removeExperience = (idx) => {
    setExperience(prev => prev.filter((_, i) => i !== idx));
  };

  // Education handlers
  const addEducation = () => {
    setEducation(prev => [...prev, { school: '', degree: '', period: '' }]);
  };

  const updateEducation = (idx, field, value) => {
    setEducation(prev => prev.map((edu, i) => i === idx ? { ...edu, [field]: value } : edu));
  };

  const removeEducation = (idx) => {
    setEducation(prev => prev.filter((_, i) => i !== idx));
  };

  // Skills List handlers
  const addSkill = () => {
    setSkillsList(prev => [...prev, { name: '', level: 'Advanced' }]);
  };

  const updateSkill = (idx, field, value) => {
    setSkillsList(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const removeSkill = (idx) => {
    setSkillsList(prev => prev.filter((_, i) => i !== idx));
  };

  // Languages handlers
  const addLanguage = () => {
    setLanguages(prev => [...prev, { name: '', level: 'Fluent' }]);
  };

  const updateLanguage = (idx, field, value) => {
    setLanguages(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  };

  const removeLanguage = (idx) => {
    setLanguages(prev => prev.filter((_, i) => i !== idx));
  };

  // Certifications handlers
  const addCertification = () => {
    setCertifications(prev => [...prev, { name: '', org: '', year: '' }]);
  };

  const updateCertification = (idx, field, value) => {
    setCertifications(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const removeCertification = (idx) => {
    setCertifications(prev => prev.filter((_, i) => i !== idx));
  };

  // Projects handlers
  const addProject = () => {
    setProjects(prev => [...prev, { title: '', desc: '', url: '' }]);
  };

  const updateProject = (idx, field, value) => {
    setProjects(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const removeProject = (idx) => {
    setProjects(prev => prev.filter((_, i) => i !== idx));
  };

  // Photo Upload Handler - Client-side Resizing and Base64 Compression to bypass CORS / Storage rules
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    setUploadProgress(20);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 150;
        const MAX_HEIGHT = 150;
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

        // Convert to highly optimized Base64 JPEG (fits in Firestore document easily, bypasses CORS & storage permission)
        const base64Url = canvas.toDataURL('image/jpeg', 0.75);
        setAvatarUrl(base64Url);
        setUploadProgress(100);
        setUploadingAvatar(false);
      };
      img.onerror = () => {
        alert(L('Error loading image. Please try another file.', 'خطأ أثناء تحميل الصورة. يرجى تجربة ملف آخر.'));
        setUploadingAvatar(false);
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      alert(L('Error reading file.', 'خطأ أثناء قراءة الملف.'));
      setUploadingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  // Check username and Save Bio Link
  const saveBioLink = async () => {
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!cleanUsername) {
      alert(L('Username cannot be empty!', 'اسم المستخدم لا يمكن أن يكون فارغاً!'));
      return;
    }

    const uid = auth?.currentUser?.uid;
    if (!uid) {
      alert(L('You must be logged in to save!', 'يجب عليك تسجيل الدخول لحفظ الرابط!'));
      return;
    }

    try {
      // Query check if username is claimed by another user
      const docRef = doc(db, 'bio_links', cleanUsername);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().ownerUid !== uid) {
        alert(L('Username is already taken by another user!', 'اسم المستخدم محجوز بالفعل لمستخدم آخر!'));
        return;
      }

      const data = {
        ownerUid: uid,
        displayName,
        bioTagline,
        username: cleanUsername,
        bioTheme,
        layout,
        font,
        avatarUrl,
        links,
        socials,
        cvEnabled,
        showLandingPage,
        landingPageHtml: bioData.landingPageHtml || '',
        lang,
        cvSections: {
          summary: cvSummary,
          contact: cvContact,
          experience,
          education,
          skillsList,
          languages,
          certifications,
          projects
        },
        updatedAt: new Date().toISOString()
      };

      // 1. Save to public `bio_links` collection
      await setDoc(docRef, data);

      // 2. Delete old username document if changed
      if (GC.bioLink?.username && GC.bioLink.username !== cleanUsername) {
        await deleteDoc(doc(db, 'bio_links', GC.bioLink.username));
      }

      // 3. Save locally and in user profile
      const updatedGC = {
        ...GC,
        bioLink: data
      };
      saveGC(updatedGC);

      alert(L('Bio Link & CV saved & published successfully!', 'تم حفظ ونشر رابط البايو والسيرة الذاتية بنجاح!'));
    } catch (err) {
      console.error("Error saving bio link:", err);
      alert(L('Error saving: ' + err.message, 'خطأ أثناء الحفظ: ' + err.message));
    }
  };

  const openPreview = () => {
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!cleanUsername) {
      alert(L('Please configure a username first!', 'يرجى كتابة اسم مستخدم أولاً!'));
      return;
    }
    window.open(`/${cleanUsername}`, '_blank');
  };

  // Theme style mapping for live preview
  const getThemeStyle = () => {
    switch (bioTheme) {
      case 'purple':
        return { background: 'linear-gradient(135deg,#1e0b36,#0c0214)', color: '#fff' };
      case 'orange':
        return { background: 'linear-gradient(135deg,#2b0f05,#0f0502)', color: '#fff' };
      case 'white':
        return { background: '#fbfbfe', color: '#1a0f30', border: '1px solid #eee' };
      case 'green':
        return { background: 'linear-gradient(135deg,#022c22,#020617)', color: '#fff' };
      case 'cosmic':
        return { background: 'linear-gradient(135deg, #090514, #120c24, #05020a)', color: '#f1eef8' };
      case 'lavender':
        return { background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', color: '#3b0764' };
      case 'emerald':
        return { background: 'linear-gradient(135deg, #022c22, #064e3b)', color: '#ecfdf5' };
      case 'midnight':
        return { background: 'radial-gradient(circle at top, #0f172a, #020617)', color: '#f8fafc' };
      case 'cyberpunk':
        return { background: '#02000a', color: '#00f0ff', border: '1px solid #00f0ff' };
      case 'dark':
      default:
        return { background: '#08080f', color: '#fff' };
    }
  };

  const getThemeTextMutedColor = () => {
    if (bioTheme === 'white') return '#5c527a';
    if (bioTheme === 'lavender') return '#7c3aed';
    if (bioTheme === 'cyberpunk') return '#39ff14';
    if (bioTheme === 'purple') return '#c084fc';
    if (bioTheme === 'orange') return '#ff9a76';
    if (bioTheme === 'green') return '#6ee7b7';
    if (bioTheme === 'cosmic') return '#ec4899';
    if (bioTheme === 'emerald') return '#a7f3d0';
    if (bioTheme === 'midnight') return '#94a3b8';
    return '#8275A3';
  };

  const getThemeAccentColor = () => {
    if (bioTheme === 'white' || bioTheme === 'orange') return '#FF6B35';
    if (bioTheme === 'purple') return '#a855f7';
    if (bioTheme === 'green') return '#10b981';
    if (bioTheme === 'cosmic') return '#ff007f';
    if (bioTheme === 'lavender') return '#7c3aed';
    if (bioTheme === 'emerald') return '#34d399';
    if (bioTheme === 'midnight') return '#3b82f6';
    if (bioTheme === 'cyberpunk') return '#39ff14';
    return '#FF6B35';
  };

  const getLinkStyle = (isHighlighted) => {
    const accent = getThemeAccentColor();
    if (bioTheme === 'white' || bioTheme === 'lavender') {
      return {
        background: isHighlighted ? accent : '#ffffff',
        color: isHighlighted ? '#fff' : '#1a0f30',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '12px',
        fontWeight: '600',
        border: `1px solid ${isHighlighted ? accent : '#ddd'}`,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%'
      };
    }
    if (bioTheme === 'cyberpunk') {
      return {
        background: 'rgba(0, 240, 255, 0.05)',
        color: '#39ff14',
        borderRadius: '6px',
        padding: '10px 14px',
        fontSize: '12px',
        fontWeight: '600',
        border: '1px solid #00f0ff',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        boxShadow: isHighlighted ? '0 0 8px rgba(0, 240, 255, 0.3)' : 'none'
      };
    }
    return {
      background: isHighlighted ? accent : 'rgba(255, 255, 255, 0.06)',
      color: '#fff',
      borderRadius: '10px',
      padding: '10px 14px',
      fontSize: '12px',
      fontWeight: '600',
      border: `1px solid ${isHighlighted ? accent : 'rgba(255, 255, 255, 0.08)'}`,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      width: '100%'
    };
  };

  const fontsMap = {
    Tajawal: "'Tajawal', sans-serif",
    Cairo: "'Cairo', sans-serif",
    Outfit: "'Outfit', sans-serif",
    Inter: "'Inter', sans-serif"
  };

  const isRtl = lang === 'ar';

  return (
    <div className="pg on" id="pg-bio">
      {/* HEADER ACTIONS */}
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">🔗</span>
          {L('CV & Bio Link Builder', 'مطور السيرة الذاتية ورابط البايو')}
        </div>
        <div className="pg-actions">
          <button className="btn btn-ghost" onClick={openPreview}>
            👁️ {L('Live Preview', 'معاينة مباشرة')}
          </button>
          <button className="btn btn-prime" onClick={saveBioLink}>
            💾 {L('Save & Publish', 'حفظ ونشر')}
          </button>
        </div>
      </div>

      <div className="g2" style={{ gap: '20px', direction: isRtl ? 'rtl' : 'ltr' }}>
        {/* LEFT COLUMN: EDITOR TABS */}
        <div style={{ minWidth: 0 }}>
          {/* EDITOR NAV TABS */}
          <div 
            className="tabs-bar" 
            style={{ 
              display: 'flex', 
              background: 'var(--surface2)', 
              borderRadius: '10px', 
              padding: '4px', 
              marginBottom: '14px', 
              border: '1px solid var(--edge)',
              flexWrap: 'nowrap',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            <button 
              onClick={() => setEditorTab('setup')}
              style={{
                flex: '1 0 auto',
                whiteSpace: 'nowrap',
                background: editorTab === 'setup' ? 'var(--orange)' : 'none',
                color: editorTab === 'setup' ? '#fff' : 'var(--t2)',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🎨 {L('Design & Setup', 'التصميم والتهيئة')}
            </button>
            <button 
              onClick={() => setEditorTab('links')}
              style={{
                flex: '1 0 auto',
                whiteSpace: 'nowrap',
                background: editorTab === 'links' ? 'var(--orange)' : 'none',
                color: editorTab === 'links' ? '#fff' : 'var(--t2)',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🔗 {L('Links & Socials', 'الروابط وحسابات التواصل')}
            </button>
            <button 
              onClick={() => setEditorTab('cv')}
              style={{
                flex: '1 0 auto',
                whiteSpace: 'nowrap',
                background: editorTab === 'cv' ? 'var(--orange)' : 'none',
                color: editorTab === 'cv' ? '#fff' : 'var(--t2)',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              💼 {L('CV Sections', 'أقسام السيرة الذاتية')}
            </button>
          </div>

          {/* TAB 1: DESIGN & SETUP */}
          {editorTab === 'setup' && (
            <div className="card">
              <div className="sec-hd"><div className="sec-title">{L('Page Customization', 'تخصيص مظهر الصفحة')}</div></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* Profile Photo Uploader */}
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '6px' }}>
                    {L('Profile Photo', 'الصورة الشخصية')}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--surface2)', padding: '12px', borderRadius: '10px', border: '1px dashed var(--edge)' }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--orange)' }} />
                    ) : (
                      <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--orange), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#fff', fontWeight: 'bold' }}>
                        {displayName ? displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <input type="file" id="bio-avatar-upload" style={{ display: 'none' }} accept="image/*" onChange={handleAvatarUpload} />
                      <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '5px 12px', height: 'auto' }} onClick={() => document.getElementById('bio-avatar-upload').click()} disabled={uploadingAvatar}>
                        {uploadingAvatar ? L('Uploading...', 'جاري الرفع...') : L('Upload Photo', 'رفع صورة')}
                      </button>
                      {avatarUrl && (
                        <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '5px 12px', marginLeft: '6px', height: 'auto', color: 'var(--red)' }} onClick={() => setAvatarUrl('')}>
                          {L('Delete', 'حذف')}
                        </button>
                      )}
                      {uploadingAvatar && (
                        <div style={{ width: '100%', height: '4px', background: 'var(--edge)', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                          <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--orange)', transition: 'width 0.2s' }}></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Display Name', 'الاسم المعروض')}
                  </label>
                  <input className="inp" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Sara Hassan" />
                </div>
                
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Short Bio Tagline', 'الوصف القصير / النبذة')}
                  </label>
                  <textarea className="inp" value={bioTagline} onChange={(e) => setBioTagline(e.target.value)} rows="2" placeholder="Coach | Entrepreneur | Content Creator 🚀"></textarea>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Public Page Mode', 'نمط الصفحة العامة')}
                  </label>
                  <select 
                    className="inp" 
                    value={showLandingPage ? 'landing' : 'bio'} 
                    onChange={(e) => setShowLandingPage(e.target.value === 'landing')}
                  >
                    <option value="bio">{L('Classic Bio Link & CV', 'رابط البايو الكلاسيكي والسيرة الذاتية')}</option>
                    <option value="landing">{L('Custom AI Landing Page', 'صفحة الهبوط المخصصة بالذكاء الاصطناعي')}</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Username (your link)', 'اسم المستخدم (رابطك الخاص)')}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface2)', borderRadius: '9px', border: '1px solid var(--edge)', overflow: 'hidden' }}>
                    <span style={{ padding: '9px 10px', fontSize: '12px', color: 'var(--t3)', borderRight: isRtl ? 'none' : '1px solid var(--edge)', borderLeft: isRtl ? '1px solid var(--edge)' : 'none', whiteSpace: 'nowrap' }}>upklick.bio/</span>
                    <input 
                      style={{ flex: 1, background: 'none', border: 'none', outline: 'none', padding: '9px 12px', fontSize: '13px', color: 'var(--t1)' }} 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      placeholder="sarahassan" 
                    />
                  </div>
                </div>

                {/* Font Selector */}
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '6px' }}>{L('Font', 'نوع الخط')}</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['Tajawal', 'Cairo', 'Outfit', 'Inter'].map(f => (
                      <button 
                        key={f}
                        onClick={() => setFont(f)}
                        style={{
                          background: font === f ? 'var(--orange)' : 'var(--surface2)',
                          color: font === f ? '#fff' : 'var(--t2)',
                          border: '1px solid var(--edge)',
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layout Selector */}
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '6px' }}>{L('Layout Style', 'نمط التخطيط')}</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[
                      { key: 'classic', icon: '☰', label: L('Classic', 'كلاسيكي') },
                      { key: 'grid', icon: '⊞', label: L('Grid', 'شبكي') },
                      { key: 'glass', icon: '🪟', label: L('Glass', 'زجاجي') }
                    ].map(lay => (
                      <button 
                        key={lay.key}
                        onClick={() => setLayout(lay.key)}
                        style={{
                          flex: '1 1 0',
                          minWidth: '70px',
                          background: layout === lay.key ? 'var(--orange)' : 'var(--surface2)',
                          color: layout === lay.key ? '#fff' : 'var(--t2)',
                          border: '1px solid var(--edge)',
                          padding: '8px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>{lay.icon}</span>
                        <span>{lay.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Selector */}
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '6px' }}>{L('Theme Palette', 'مظهر الألوان')}</label>
                  <div className="bio-theme-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                    {[
                      { key: 'dark', color: '#08080f', name: L('Dark', 'داكن') },
                      { key: 'purple', color: 'linear-gradient(135deg,#6C35FF,#a855f7)', name: L('Purple', 'بنفسجي') },
                      { key: 'orange', color: 'linear-gradient(135deg,#FF6B35,#f59e0b)', name: L('Orange', 'برتقالي') },
                      { key: 'white', color: '#ffffff', name: L('Light', 'فاتح') },
                      { key: 'green', color: 'linear-gradient(135deg,#059669,#10b981)', name: L('Green', 'أخضر') },
                      { key: 'cosmic', color: 'linear-gradient(135deg,#090514,#ff007f)', name: L('Cosmic', 'كوني') },
                      { key: 'lavender', color: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', name: L('Lavender', 'خزامى') },
                      { key: 'emerald', color: 'linear-gradient(135deg,#022c22,#064e3b)', name: L('Emerald', 'زمردي') },
                      { key: 'midnight', color: 'radial-gradient(circle,#0f172a,#020617)', name: L('Midnight', 'فضائي') },
                      { key: 'cyberpunk', color: 'linear-gradient(135deg,#02000a,#00f0ff)', name: L('Cyber', 'سايبر') }
                    ].map(theme => (
                      <div 
                        key={theme.key}
                        onClick={() => setBioTheme(theme.key)}
                        title={theme.name}
                        style={{ 
                          height: '42px', 
                          borderRadius: '8px', 
                          background: theme.color, 
                          border: bioTheme === theme.key ? '3px solid var(--orange)' : '2px solid var(--edge)', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxSizing: 'border-box'
                        }}
                      >
                        {bioTheme === theme.key && <span style={{ color: theme.key === 'white' ? '#000' : '#fff', fontSize: '12px' }}>✓</span>}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: LINKS & SOCIALS */}
          {editorTab === 'links' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Dynamic Links List */}
              <div className="card">
                <div className="sec-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div className="sec-title">🔗 {L('Links', 'الروابط')}</div>
                  <button className="btn btn-prime" style={{ fontSize: '12px', padding: '5px 12px', height: 'auto' }} onClick={addLink}>
                    + {L('Add Link', 'إضافة رابط')}
                  </button>
                </div>
                
                <div id="bio-links-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {links.map((link, idx) => (
                    <div key={idx} style={{ background: 'var(--surface2)', padding: '12px', borderRadius: '10px', border: '1px solid var(--edge)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {/* Icon Picker / Emojis */}
                        <input 
                          className="inp" 
                          value={link.icon || '🔗'} 
                          onChange={(e) => updateLink(idx, 'icon', e.target.value)} 
                          placeholder="Emoji" 
                          style={{ width: '45px', textAlign: 'center', padding: '8px 0', fontSize: '16px' }} 
                        />
                        <input 
                          className="inp" 
                          value={link.title} 
                          onChange={(e) => updateLink(idx, 'title', e.target.value)} 
                          placeholder={L('Link Title', 'عنوان الرابط')} 
                          style={{ flex: 1, fontSize: '13px' }} 
                        />
                        <button 
                          onClick={() => removeLink(idx)} 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', fontSize: '14px', padding: '0 4px' }}
                          title={L('Remove Link', 'حذف الرابط')}
                        >
                          ✕
                        </button>
                      </div>
                      
                      <input 
                        className="inp" 
                        value={link.url} 
                        onChange={(e) => updateLink(idx, 'url', e.target.value)} 
                        placeholder="https://..." 
                        style={{ fontSize: '12px' }} 
                      />

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input 
                          className="inp" 
                          value={link.description || ''} 
                          onChange={(e) => updateLink(idx, 'description', e.target.value)} 
                          placeholder={L('Short description (optional)', 'وصف مختصر للرابط (اختياري)')} 
                          style={{ flex: 1, fontSize: '12px', padding: '6px 10px' }} 
                        />
                        
                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--t2)', cursor: 'pointer', userSelect: 'none' }}>
                          <input 
                            type="checkbox" 
                            checked={!!link.highlighted} 
                            onChange={(e) => updateLink(idx, 'highlighted', e.target.checked)} 
                          />
                          {L('Highlight', 'تمييز')}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="btn btn-ghost" onClick={addLink} style={{ width: '100%', justifyContent: 'center', marginTop: '12px', fontSize: '12.5px' }}>
                  + {L('Add Another Link', 'إضافة رابط آخر')}
                </button>
              </div>

              {/* Social Accounts Handles */}
              <div className="card">
                <div className="sec-hd"><div className="sec-title">📱 {L('Social Profiles', 'حسابات التواصل')}</div></div>
                <div className="g2" style={{ gap: '10px', marginBottom: 0 }}>
                  {[
                    { key: 'ig', icon: '📸', placeholder: '@instagram' },
                    { key: 'tt', icon: '🎵', placeholder: '@tiktok' },
                    { key: 'yt', icon: '▶️', placeholder: 'YouTube channel' },
                    { key: 'li', icon: '💼', placeholder: 'LinkedIn URL' },
                    { key: 'tg', icon: '✈️', placeholder: '@telegram' },
                    { key: 'wa', icon: '💬', placeholder: 'WhatsApp number' }
                  ].map(s => (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }} key={s.key}>
                      <span style={{ fontSize: '16px' }}>{s.icon}</span>
                      <input 
                        className="inp" 
                        value={socials[s.key] || ''} 
                        onChange={(e) => setSocials(prev => ({ ...prev, [s.key]: e.target.value }))} 
                        placeholder={s.placeholder} 
                        style={{ fontSize: '12px', padding: '8px 10px' }} 
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: CV / RESUME SECTIONS */}
          {editorTab === 'cv' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* CV Enable toggle */}
              <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--t1)' }}>{L('Show CV Tab', 'تفعيل السيرة الذاتية')}</div>
                  <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>{L('Enable to render a resume section under a second tab', 'تفعيل هذا الخيار لإظهار قسم كامل للسيرة الذاتية')}</div>
                </div>
                <div 
                  onClick={() => setCvEnabled(!cvEnabled)}
                  style={{
                    width: '46px',
                    height: '24px',
                    borderRadius: '12px',
                    background: cvEnabled ? 'var(--orange)' : 'var(--surface3)',
                    border: '1px solid var(--edge2)',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    flexShrink: 0
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: '2px',
                    left: cvEnabled ? '24px' : '2px',
                    transition: 'left 0.2s ease-in-out',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }} />
                </div>
              </div>

              {cvEnabled && (
                <>
                  {/* Summary & Contact Details Card */}
                  <div className="card">
                    <div className="sec-hd"><div className="sec-title">📝 {L('Summary & Contact', 'النبذة ومعلومات الاتصال')}</div></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                          {L('Professional Summary', 'النبذة المهنية')}
                        </label>
                        <textarea 
                          className="inp" 
                          value={cvSummary} 
                          onChange={(e) => setCvSummary(e.target.value)} 
                          rows="4" 
                          placeholder={L('Experienced developer specializing in...', 'نبذة تفصيلية عن خبراتك ومؤهلاتك المهنية...')}
                        />
                      </div>
                      
                      <div className="g2" style={{ gap: '10px', marginTop: '6px', marginBottom: 0 }}>
                        <div>
                          <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                            {L('Email Address', 'البريد الإلكتروني')}
                          </label>
                          <input 
                            className="inp" 
                            value={cvContact.email || ''} 
                            onChange={(e) => setCvContact(prev => ({ ...prev, email: e.target.value }))} 
                            placeholder="mail@example.com" 
                            style={{ fontSize: '12px' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                            {L('Phone Number', 'رقم الهاتف')}
                          </label>
                          <input 
                            className="inp" 
                            value={cvContact.phone || ''} 
                            onChange={(e) => setCvContact(prev => ({ ...prev, phone: e.target.value }))} 
                            placeholder="+20 123456789" 
                            style={{ fontSize: '12px' }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                          {L('Location (City, Country)', 'الموقع (المدينة، الدولة)')}
                        </label>
                        <input 
                          className="inp" 
                          value={cvContact.location || ''} 
                          onChange={(e) => setCvContact(prev => ({ ...prev, location: e.target.value }))} 
                          placeholder="Cairo, Egypt" 
                          style={{ fontSize: '12px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Experience Card */}
                  <div className="card">
                    <div className="sec-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div className="sec-title">💼 {L('Work Experience', 'الخبرات المهنية')}</div>
                      <button className="btn btn-prime" style={{ fontSize: '11.5px', padding: '4px 10px', height: 'auto' }} onClick={addExperience}>
                        + {L('Add', 'إضافة')}
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {experience.map((exp, idx) => (
                        <div key={idx} style={{ background: 'var(--surface2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--edge)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--orange)' }}>#{idx + 1}</span>
                            <button onClick={() => removeExperience(idx)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '13px' }}>✕</button>
                          </div>
                          
                          <div className="g2" style={{ gap: '8px', marginBottom: 0 }}>
                            <input 
                              className="inp" 
                              value={exp.role || ''} 
                              onChange={(e) => updateExperience(idx, 'role', e.target.value)} 
                              placeholder={L('Role title (e.g. Senior Coach)', 'المسمى الوظيفي')} 
                              style={{ fontSize: '12px', padding: '6px 10px' }} 
                            />
                            <input 
                              className="inp" 
                              value={exp.period || ''} 
                              onChange={(e) => updateExperience(idx, 'period', e.target.value)} 
                              placeholder={L('Period (e.g. 2022 - Present)', 'الفترة')} 
                              style={{ fontSize: '12px', padding: '6px 10px' }} 
                            />
                          </div>

                          <input 
                            className="inp" 
                            value={exp.company || ''} 
                            onChange={(e) => updateExperience(idx, 'company', e.target.value)} 
                            placeholder={L('Company Name', 'اسم الشركة')} 
                            style={{ fontSize: '12px', padding: '6px 10px' }} 
                          />
                          
                          <textarea 
                            className="inp" 
                            value={exp.desc || ''} 
                            onChange={(e) => updateExperience(idx, 'desc', e.target.value)} 
                            placeholder={L('Describe your responsibilities...', 'صف مهامك ومسؤولياتك...')} 
                            rows="2"
                            style={{ fontSize: '12px', padding: '6px 10px' }} 
                          />
                        </div>
                      ))}
                      {experience.length === 0 && (
                        <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--t3)', padding: '10px 0' }}>{L('No experience added yet.', 'لم يتم إضافة خبرات مهنية بعد.')}</div>
                      )}
                    </div>
                  </div>

                  {/* Education Card */}
                  <div className="card">
                    <div className="sec-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div className="sec-title">🎓 {L('Education', 'التعليم والدراسة')}</div>
                      <button className="btn btn-prime" style={{ fontSize: '11.5px', padding: '4px 10px', height: 'auto' }} onClick={addEducation}>
                        + {L('Add', 'إضافة')}
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {education.map((edu, idx) => (
                        <div key={idx} style={{ background: 'var(--surface2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--edge)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--orange)' }}>#{idx + 1}</span>
                            <button onClick={() => removeEducation(idx)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '13px' }}>✕</button>
                          </div>
                          
                          <div className="g2" style={{ gap: '8px', marginBottom: 0 }}>
                            <input 
                              className="inp" 
                              value={edu.degree || ''} 
                              onChange={(e) => updateEducation(idx, 'degree', e.target.value)} 
                              placeholder={L('Degree (e.g. Bachelor in Art)', 'الدرجة العلمية')} 
                              style={{ fontSize: '12px', padding: '6px 10px' }} 
                            />
                            <input 
                              className="inp" 
                              value={edu.period || ''} 
                              onChange={(e) => updateEducation(idx, 'period', e.target.value)} 
                              placeholder={L('Period (e.g. 2018 - 2022)', 'السنة')} 
                              style={{ fontSize: '12px', padding: '6px 10px' }} 
                            />
                          </div>

                          <input 
                            className="inp" 
                            value={edu.school || ''} 
                            onChange={(e) => updateEducation(idx, 'school', e.target.value)} 
                            placeholder={L('School / University', 'الكلية / المدرسة')} 
                            style={{ fontSize: '12px', padding: '6px 10px' }} 
                          />
                        </div>
                      ))}
                      {education.length === 0 && (
                        <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--t3)', padding: '10px 0' }}>{L('No education added yet.', 'لم يتم إضافة دراسة أو تعليم بعد.')}</div>
                      )}
                    </div>
                  </div>

                  {/* Skills Card with Levels */}
                  <div className="card">
                    <div className="sec-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div className="sec-title">⚡ {L('Skills & Proficiency', 'المهارات ومستوى الإتقان')}</div>
                      <button className="btn btn-prime" style={{ fontSize: '11.5px', padding: '4px 10px', height: 'auto' }} onClick={addSkill}>
                        + {L('Add', 'إضافة')}
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {skillsList.map((skill, idx) => (
                        <div key={idx} style={{ background: 'var(--surface2)', padding: '10px', borderRadius: '8px', border: '1px solid var(--edge)', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'flex-start' }}>
                          <input 
                            className="inp" 
                            value={skill.name || ''} 
                            onChange={(e) => updateSkill(idx, 'name', e.target.value)} 
                            placeholder={L('Skill name (e.g. React)', 'اسم المهارة')} 
                            style={{ flex: 2, fontSize: '12px', padding: '6px 10px' }} 
                          />
                          <select
                            className="inp"
                            value={skill.level || 'Advanced'}
                            onChange={(e) => updateSkill(idx, 'level', e.target.value)}
                            style={{ flex: 1.5, fontSize: '11.5px', padding: '6px 10px', background: 'var(--surface)' }}
                          >
                            <option value="Expert">{L('Expert', 'محترف')}</option>
                            <option value="Advanced">{L('Advanced', 'متقدم')}</option>
                            <option value="Intermediate">{L('Intermediate', 'متوسط')}</option>
                            <option value="Beginner">{L('Beginner', 'مبتدئ')}</option>
                          </select>
                          <button onClick={() => removeSkill(idx)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '13px', padding: '0 4px' }}>✕</button>
                        </div>
                      ))}
                      {skillsList.length === 0 && (
                        <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--t3)', padding: '10px 0' }}>{L('No skills added yet.', 'لم يتم إضافة مهارات بعد.')}</div>
                      )}
                    </div>
                  </div>

                  {/* Languages Card */}
                  <div className="card">
                    <div className="sec-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div className="sec-title">🌐 {L('Languages', 'اللغات')}</div>
                      <button className="btn btn-prime" style={{ fontSize: '11.5px', padding: '4px 10px', height: 'auto' }} onClick={addLanguage}>
                        + {L('Add', 'إضافة')}
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {languages.map((langItem, idx) => (
                        <div key={idx} style={{ background: 'var(--surface2)', padding: '10px', borderRadius: '8px', border: '1px solid var(--edge)', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'flex-start' }}>
                          <input 
                            className="inp" 
                            value={langItem.name || ''} 
                            onChange={(e) => updateLanguage(idx, 'name', e.target.value)} 
                            placeholder={L('Language (e.g. Arabic)', 'اللغة')} 
                            style={{ flex: 2, fontSize: '12px', padding: '6px 10px' }} 
                          />
                          <input 
                            className="inp" 
                            value={langItem.level || ''} 
                            onChange={(e) => updateLanguage(idx, 'level', e.target.value)} 
                            placeholder={L('Level (e.g. Native)', 'المستوى')} 
                            style={{ flex: 1.5, fontSize: '12px', padding: '6px 10px' }} 
                          />
                          <button onClick={() => removeLanguage(idx)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '13px', padding: '0 4px' }}>✕</button>
                        </div>
                      ))}
                      {languages.length === 0 && (
                        <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--t3)', padding: '10px 0' }}>{L('No languages added yet.', 'لم يتم إضافة لغات بعد.')}</div>
                      )}
                    </div>
                  </div>

                  {/* Certifications Card */}
                  <div className="card">
                    <div className="sec-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div className="sec-title">📜 {L('Certifications', 'الشهادات والاعتمادات')}</div>
                      <button className="btn btn-prime" style={{ fontSize: '11.5px', padding: '4px 10px', height: 'auto' }} onClick={addCertification}>
                        + {L('Add', 'إضافة')}
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {certifications.map((cert, idx) => (
                        <div key={idx} style={{ background: 'var(--surface2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--edge)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--orange)' }}>#{idx + 1}</span>
                            <button onClick={() => removeCertification(idx)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '13px' }}>✕</button>
                          </div>
                          
                          <div className="g21" style={{ gap: '8px', marginBottom: 0 }}>
                            <input 
                              className="inp" 
                              value={cert.name || ''} 
                              onChange={(e) => updateCertification(idx, 'name', e.target.value)} 
                              placeholder={L('Certification name', 'اسم الشهادة')} 
                              style={{ fontSize: '12px', padding: '6px 10px' }} 
                            />
                            <input 
                              className="inp" 
                              value={cert.year || ''} 
                              onChange={(e) => updateCertification(idx, 'year', e.target.value)} 
                              placeholder={L('Year', 'السنة')} 
                              style={{ fontSize: '12px', padding: '6px 10px' }} 
                            />
                          </div>
                          <input 
                            className="inp" 
                            value={cert.org || ''} 
                            onChange={(e) => updateCertification(idx, 'org', e.target.value)} 
                            placeholder={L('Issuing organization', 'الجهة المانحة')} 
                            style={{ fontSize: '12px', padding: '6px 10px' }} 
                          />
                        </div>
                      ))}
                      {certifications.length === 0 && (
                        <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--t3)', padding: '10px 0' }}>{L('No certifications added yet.', 'لم يتم إضافة شهادات بعد.')}</div>
                      )}
                    </div>
                  </div>

                  {/* Projects Card */}
                  <div className="card">
                    <div className="sec-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div className="sec-title">🚀 {L('Personal Projects', 'المشاريع الشخصية')}</div>
                      <button className="btn btn-prime" style={{ fontSize: '11.5px', padding: '4px 10px', height: 'auto' }} onClick={addProject}>
                        + {L('Add', 'إضافة')}
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {projects.map((proj, idx) => (
                        <div key={idx} style={{ background: 'var(--surface2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--edge)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--orange)' }}>#{idx + 1}</span>
                            <button onClick={() => removeProject(idx)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '13px' }}>✕</button>
                          </div>
                          
                          <input 
                            className="inp" 
                            value={proj.title || ''} 
                            onChange={(e) => updateProject(idx, 'title', e.target.value)} 
                            placeholder={L('Project Title', 'اسم المشروع')} 
                            style={{ fontSize: '12px', padding: '6px 10px' }} 
                          />
                          <input 
                            className="inp" 
                            value={proj.url || ''} 
                            onChange={(e) => updateProject(idx, 'url', e.target.value)} 
                            placeholder="https://github.com/..." 
                            style={{ fontSize: '12px', padding: '6px 10px' }} 
                          />
                          <textarea 
                            className="inp" 
                            value={proj.desc || ''} 
                            onChange={(e) => updateProject(idx, 'desc', e.target.value)} 
                            placeholder={L('Brief description of the project...', 'وصف مختصر للمشروع...')} 
                            rows="2"
                            style={{ fontSize: '12px', padding: '6px 10px' }} 
                          />
                        </div>
                      ))}
                      {projects.length === 0 && (
                        <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--t3)', padding: '10px 0' }}>{L('No projects added yet.', 'لم يتم إضافة مشاريع بعد.')}</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LIVE MOCK PREVIEW */}
        <div className="card bio-preview-col" style={{ position: 'sticky', top: '14px', height: 'fit-content' }}>
          <div className="sec-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="sec-title">📱 {L('Live Preview', 'معاينة مباشرة')}</div>
            {cvEnabled && (
              <div style={{ display: 'flex', background: 'var(--surface2)', borderRadius: '24px', padding: '4px', border: '1px solid var(--edge)' }}>
                <button 
                  onClick={() => setPreviewTab('links')}
                  style={{
                    background: previewTab === 'links' ? 'var(--orange)' : 'none',
                    color: previewTab === 'links' ? '#fff' : 'var(--t3)',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {L('Links', 'الروابط')}
                </button>
                <button 
                  onClick={() => setPreviewTab('cv')}
                  style={{
                    background: previewTab === 'cv' ? 'var(--orange)' : 'none',
                    color: previewTab === 'cv' ? '#fff' : 'var(--t3)',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {L('CV', 'السيرة')}
                </button>
              </div>
            )}
          </div>
          
          {/* MOCK MOBILE PHONE FRAME */}
          <div 
            id="bio-preview" 
            style={{ 
              ...getThemeStyle(),
              fontFamily: fontsMap[font] || fontsMap.Tajawal,
              borderRadius: '16px', 
              padding: '24px 16px', 
              textAlign: 'center', 
              minHeight: '420px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: 0, 
              transition: 'all .3s',
              direction: isRtl ? 'rtl' : 'ltr'
            }}
          >
            {/* Avatar Initials fallback / Image */}
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Avatar" 
                style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${getThemeAccentColor()}`, marginBottom: '10px' }} 
              />
            ) : (
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--orange),var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#fff', marginBottom: '10px', border: `2px solid ${getThemeAccentColor()}` }} id="bio-prev-avatar">
                {displayName ? displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U'}
              </div>
            )}
            
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }} id="bio-prev-name">
              {displayName || 'Your Name'}
            </div>
            
            <div style={{ fontSize: '11px', color: getThemeTextMutedColor(), marginBottom: '16px' }} id="bio-prev-tagline">
              {bioTagline || 'Coach | Entrepreneur'}
            </div>

            {/* PREVIEW CONTAINER */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              
              {/* LINKS PREVIEW TAB */}
              {(!cvEnabled || previewTab === 'links') && (
                <div 
                  id="bio-prev-links" 
                  style={{ 
                    width: '100%', 
                    display: layout === 'grid' ? 'grid' : 'flex', 
                    gridTemplateColumns: layout === 'grid' ? '1fr 1fr' : 'none',
                    flexDirection: 'column', 
                    gap: '8px' 
                  }}
                >
                  {links.map((link, i) => (
                    <div 
                      key={i} 
                      style={getLinkStyle(link.highlighted)}
                    >
                      <span style={{ fontSize: '14px' }}>{link.icon || '🔗'}</span>
                      <div style={{ textAlign: isRtl ? 'right' : 'left', flex: 1, overflow: 'hidden' }}>
                        <div style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{link.title || 'Link Title'}</div>
                        {link.description && <div style={{ fontSize: '9px', opacity: 0.7, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{link.description}</div>}
                      </div>
                    </div>
                  ))}
                  {links.length === 0 && (
                    <div style={{ fontSize: '11px', opacity: 0.5, marginTop: '20px' }}>{L('No links added yet', 'لا توجد روابط مضافة')}</div>
                  )}
                </div>
              )}

              {/* CV PREVIEW TAB */}
              {cvEnabled && previewTab === 'cv' && (
                <div style={{ width: '100%', textAlign: isRtl ? 'right' : 'left', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  
                  {/* Summary */}
                  {cvSummary && (
                    <div style={{ fontSize: '10.5px', fontStyle: 'italic', opacity: 0.9, lineHeight: '1.4', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px', border: `1px dashed ${getThemeAccentColor()}33` }}>
                      {cvSummary}
                    </div>
                  )}

                  {/* Contact Info Preview */}
                  {(cvContact.email || cvContact.phone || cvContact.location) && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', fontSize: '9.5px', color: getThemeTextMutedColor() }}>
                      {cvContact.email && <span>📧 {cvContact.email}</span>}
                      {cvContact.phone && <span>📞 {cvContact.phone}</span>}
                      {cvContact.location && <span>📍 {cvContact.location}</span>}
                    </div>
                  )}

                  {/* Experience */}
                  {experience.length > 0 && (
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '10.5px', borderBottom: `1px solid ${getThemeAccentColor()}`, paddingBottom: '3px', marginBottom: '6px', color: getThemeAccentColor() }}>
                        {L('Experience', 'الخبرة')}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {experience.slice(0, 2).map((exp, i) => (
                          <div key={i} style={{ borderLeft: isRtl ? 'none' : `1.5px solid ${getThemeTextMutedColor()}`, borderRight: isRtl ? `1.5px solid ${getThemeTextMutedColor()}` : 'none', paddingLeft: isRtl ? 'none' : '6px', paddingRight: isRtl ? '6px' : 'none' }}>
                            <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                              <span>{exp.role || 'Role'}</span>
                              <span style={{ fontSize: '9px', opacity: 0.7 }}>{exp.period}</span>
                            </div>
                            <div style={{ fontSize: '9.5px', color: getThemeTextMutedColor() }}>{exp.company}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {education.length > 0 && (
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '10.5px', borderBottom: `1px solid ${getThemeAccentColor()}`, paddingBottom: '3px', marginBottom: '6px', color: getThemeAccentColor() }}>
                        {L('Education', 'التعليم')}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {education.slice(0, 2).map((edu, i) => (
                          <div key={i} style={{ borderLeft: isRtl ? 'none' : `1.5px solid ${getThemeTextMutedColor()}`, borderRight: isRtl ? `1.5px solid ${getThemeTextMutedColor()}` : 'none', paddingLeft: isRtl ? 'none' : '6px', paddingRight: isRtl ? '6px' : 'none' }}>
                            <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                              <span>{edu.degree || 'Degree'}</span>
                              <span style={{ fontSize: '9px', opacity: 0.7 }}>{edu.period}</span>
                            </div>
                            <div style={{ fontSize: '9.5px', color: getThemeTextMutedColor() }}>{edu.school}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills List with Levels */}
                  {skillsList.length > 0 && (
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '10.5px', borderBottom: `1px solid ${getThemeAccentColor()}`, paddingBottom: '3px', marginBottom: '6px', color: getThemeAccentColor() }}>
                        {L('Skills', 'المهارات')}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {skillsList.map((skill, i) => (
                          <span key={i} style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '10px', fontSize: '9px', border: `1px solid ${getThemeTextMutedColor()}44` }}>
                            {skill.name} <span style={{ opacity: 0.6, fontSize: '8px' }}>({skill.level})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {languages.length > 0 && (
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '10.5px', borderBottom: `1px solid ${getThemeAccentColor()}`, paddingBottom: '3px', marginBottom: '6px', color: getThemeAccentColor() }}>
                        {L('Languages', 'اللغات')}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {languages.map((l, i) => (
                          <span key={i} style={{ fontSize: '9.5px' }}>🗣️ {l.name} ({l.level})</span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Social profiles preview icons */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', fontSize: '15px', justifyContent: 'center' }} id="bio-prev-socials">
              {socials.ig && <span>📸</span>}
              {socials.tt && <span>🎵</span>}
              {socials.yt && <span>▶️</span>}
              {socials.li && <span>💼</span>}
              {socials.tg && <span>✈️</span>}
              {socials.wa && <span>💬</span>}
            </div>

            <div style={{ fontSize: '8px', opacity: 0.3, marginTop: '12px' }}>powered by UpKlick</div>
          </div>

          {/* Link footer */}
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '11.5px', color: 'var(--t2)', marginBottom: '6px' }}>{L('Your live link:', 'رابطك الخاص المباشر:')}</div>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface2)', borderRadius: '8px', border: '1px solid var(--edge)', overflow: 'hidden' }}>
              <div 
                style={{ flex: 1, padding: '8px 12px', fontSize: '12.5px', color: 'var(--orange)', fontFamily: 'monospace', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', cursor: 'pointer' }}
                onClick={openPreview}
              >
                upklick.bio/<span id="bio-link-preview">{username || 'yourname'}</span>
              </div>
              <button 
                onClick={() => {
                  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
                  if (!cleanUsername) return;
                  navigator.clipboard.writeText(`${window.location.origin}/${cleanUsername}`);
                  alert(L('Link copied to clipboard!', 'تم نسخ الرابط إلى الحافظة!'));
                }}
                style={{ background: 'none', border: 'none', borderLeft: '1px solid var(--edge)', color: 'var(--t2)', padding: '8px 12px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
              >
                📋 {L('Copy', 'نسخ')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
