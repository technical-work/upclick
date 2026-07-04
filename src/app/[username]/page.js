'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function PublicBioPage() {
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('links'); // 'links' or 'cv'

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      try {
        const decodedUsername = decodeURIComponent(username).toLowerCase();
        const docRef = doc(db, 'bio_links', decodedUsername);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching bio profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  // Loading state
  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', background: '#08080f', color: '#8275A3', fontFamily: 'sans-serif', flexDirection: 'column', gap: '12px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,107,53,0.3)', borderTopColor: '#FF6B35', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
        <div>جاري تحميل الصفحة...</div>
      </div>
    );
  }

  // Not Found state
  if (!profile) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', background: '#08080f', color: '#AEA4CA', fontFamily: 'sans-serif', flexDirection: 'column', gap: '16px', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px' }}>🔍</div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#F8F6FC' }}>الصفحة غير موجودة / Page Not Found</h1>
        <p style={{ maxWidth: '400px', fontSize: '14px', color: '#8275A3', lineHeight: '1.6' }}>
          هذا الرابط غير مسجل في UpKlick بعد. تأكد من كتابة الرابط بشكل صحيح أو أنشئ صفحتك الخاصة.
          <br />
          This bio page doesn't exist on UpKlick yet. Make sure the username is spelled correctly.
        </p>
        <a href="/" style={{ marginTop: '10px', background: '#FF6B35', color: '#fff', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', transition: 'all 0.2s' }}>
          إنشاء رابط بايو مجاني / Create Yours
        </a>
      </div>
    );
  }

  // Configure Themes
  const themes = {
    dark: {
      bg: '#08080f',
      cardBg: 'rgba(255, 255, 255, 0.05)',
      cardHover: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.08)',
      text: '#ffffff',
      textMuted: '#8275A3',
      accent: '#FF6B35',
      accentHover: '#ff8152',
      btnText: '#fff'
    },
    purple: {
      bg: 'linear-gradient(135deg, #1e0b36, #0c0214)',
      cardBg: 'rgba(168, 85, 247, 0.1)',
      cardHover: 'rgba(168, 85, 247, 0.18)',
      border: 'rgba(168, 85, 247, 0.15)',
      text: '#ffffff',
      textMuted: '#c084fc',
      accent: '#a855f7',
      accentHover: '#c084fc',
      btnText: '#fff'
    },
    orange: {
      bg: 'linear-gradient(135deg, #2b0f05, #0f0502)',
      cardBg: 'rgba(255, 107, 53, 0.08)',
      cardHover: 'rgba(255, 107, 53, 0.15)',
      border: 'rgba(255, 107, 53, 0.12)',
      text: '#ffffff',
      textMuted: '#ff9a76',
      accent: '#FF6B35',
      accentHover: '#ff8152',
      btnText: '#fff'
    },
    white: {
      bg: '#fbfbfe',
      cardBg: '#ffffff',
      cardHover: '#f5f3ff',
      border: 'rgba(0, 0, 0, 0.06)',
      text: '#1a0f30',
      textMuted: '#5c527a',
      accent: '#FF6B35',
      accentHover: '#ff8152',
      btnText: '#fff',
      shadow: '0 4px 12px rgba(0,0,0,0.05)'
    },
    green: {
      bg: 'linear-gradient(135deg, #022c22, #020617)',
      cardBg: 'rgba(16, 185, 129, 0.08)',
      cardHover: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.12)',
      text: '#ffffff',
      textMuted: '#6ee7b7',
      accent: '#10b981',
      accentHover: '#34d399',
      btnText: '#fff'
    },
    cosmic: {
      bg: 'linear-gradient(135deg, #090514, #120c24, #05020a)',
      cardBg: 'rgba(255, 0, 127, 0.05)',
      cardHover: 'rgba(255, 0, 127, 0.1)',
      border: 'rgba(255, 0, 127, 0.15)',
      text: '#f1eef8',
      textMuted: '#ec4899',
      accent: '#ff007f',
      accentHover: '#ff409f',
      btnText: '#fff'
    },
    lavender: {
      bg: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
      cardBg: '#ffffff',
      cardHover: '#f5f3ff',
      border: 'rgba(124, 58, 237, 0.1)',
      text: '#3b0764',
      textMuted: '#7c3aed',
      accent: '#7c3aed',
      accentHover: '#6d28d9',
      btnText: '#fff',
      shadow: '0 4px 15px rgba(124,58,237,0.05)'
    },
    emerald: {
      bg: 'linear-gradient(135deg, #022c22, #064e3b)',
      cardBg: 'rgba(52, 211, 153, 0.06)',
      cardHover: 'rgba(52, 211, 153, 0.12)',
      border: 'rgba(52, 211, 153, 0.1)',
      text: '#ecfdf5',
      textMuted: '#a7f3d0',
      accent: '#34d399',
      accentHover: '#6ee7b7',
      btnText: '#022c22'
    },
    midnight: {
      bg: 'radial-gradient(circle at top, #0f172a, #020617)',
      cardBg: 'rgba(255, 255, 255, 0.03)',
      cardHover: 'rgba(255, 255, 255, 0.07)',
      border: 'rgba(255, 255, 255, 0.06)',
      text: '#f8fafc',
      textMuted: '#94a3b8',
      accent: '#3b82f6',
      accentHover: '#60a5fa',
      btnText: '#fff'
    },
    cyberpunk: {
      bg: '#02000a',
      cardBg: 'rgba(0, 240, 255, 0.03)',
      cardHover: 'rgba(0, 240, 255, 0.08)',
      border: '#00f0ff',
      text: '#00f0ff',
      textMuted: '#39ff14',
      accent: '#39ff14',
      accentHover: '#00f0ff',
      btnText: '#000',
      shadow: '0 0 10px rgba(0, 240, 255, 0.1)'
    }
  };

  const styleTheme = themes[profile.bioTheme] || themes.dark;

  // Configure Fonts
  const fonts = {
    Tajawal: "'Tajawal', sans-serif",
    Cairo: "'Cairo', sans-serif",
    Outfit: "'Outfit', sans-serif",
    Inter: "'Inter', sans-serif"
  };

  const selectedFont = fonts[profile.font] || fonts.Tajawal;

  // Layout Styles
  const isGrid = profile.layout === 'grid';
  const isGlass = profile.layout === 'glass';

  const cardStyle = {
    background: isGlass ? 'rgba(255, 255, 255, 0.03)' : styleTheme.cardBg,
    border: `1px solid ${isGlass ? 'rgba(255, 255, 255, 0.1)' : styleTheme.border}`,
    color: styleTheme.text,
    boxShadow: styleTheme.shadow || 'none',
    backdropFilter: isGlass ? 'blur(12px)' : 'none',
    WebkitBackdropFilter: isGlass ? 'blur(12px)' : 'none',
    padding: '16px',
    borderRadius: '12px',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer'
  };

  // Get social redirect URLs
  const getSocialUrl = (platform, handle) => {
    if (!handle) return '';
    if (handle.startsWith('http')) return handle;
    
    switch (platform) {
      case 'ig': return `https://instagram.com/${handle.replace('@', '')}`;
      case 'tt': return `https://tiktok.com/@${handle.replace('@', '')}`;
      case 'yt': return `https://youtube.com/${handle}`;
      case 'li': return handle.includes('linkedin.com') ? handle : `https://linkedin.com/in/${handle}`;
      case 'tg': return `https://t.me/${handle.replace('@', '')}`;
      case 'wa': return `https://wa.me/${handle.replace(/[^0-9]/g, '')}`;
      default: return '';
    }
  };

  const socialIcons = {
    ig: '📸',
    tt: '🎵',
    yt: '▶️',
    li: '💼',
    tg: '✈️',
    wa: '💬'
  };

  const socialLabels = {
    ig: 'Instagram',
    tt: 'TikTok',
    yt: 'YouTube',
    li: 'LinkedIn',
    tg: 'Telegram',
    wa: 'WhatsApp'
  };

  // Check language of page with robust auto-detection (scans titles, CV summary and tagline for Arabic characters)
  const hasArabic = (str) => typeof str === 'string' && /[\u0600-\u06FF]/.test(str);
  const isAr = profile.lang === 'ar' || 
               hasArabic(profile.displayName) || 
               hasArabic(profile.bioTagline) || 
               hasArabic(profile.cvSections?.summary) ||
               (profile.links && profile.links.some(l => hasArabic(l.title) || hasArabic(l.description)));

  // Destructure CV items safely
  const cvSections = profile.cvSections || {};
  const cvSummary = cvSections.summary || '';
  const cvContact = cvSections.contact || { email: '', phone: '', location: '' };
  const experience = cvSections.experience || [];
  const education = cvSections.education || [];
  const skillsList = cvSections.skillsList || [];
  const languages = cvSections.languages || [];
  const certifications = cvSections.certifications || [];
  const projects = cvSections.projects || [];
  return (
    <div style={{
      background: styleTheme.bg,
      color: styleTheme.text,
      fontFamily: selectedFont,
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      boxSizing: 'border-box',
      direction: isAr ? 'rtl' : 'ltr',
      textAlign: isAr ? 'right' : 'left'
    }}>
      
      {/* Container */}
      <div style={{
        maxWidth: '640px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        
        {/* Profile Card Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px', width: '100%' }}>
          {profile.avatarUrl ? (
            <img 
              src={profile.avatarUrl} 
              alt={profile.displayName} 
              style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${styleTheme.accent}` }}
            />
          ) : (
            <div style={{ 
              width: '96px', 
              height: '96px', 
              borderRadius: '50%', 
              background: `linear-gradient(135deg, ${styleTheme.accent}, #6C35FF)`, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '36px', 
              color: '#fff',
              fontWeight: 'bold',
              border: `3px solid ${styleTheme.accent}`
            }}>
              {profile.displayName ? profile.displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U'}
            </div>
          )}
          
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: '4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              {profile.displayName}
              {profile.isVerified && <span title="Verified" style={{ fontSize: '16px', color: '#3897f0' }}>🛡️</span>}
            </h2>
            <p style={{ fontSize: '14px', color: styleTheme.textMuted, margin: '2px 0 6px 0', opacity: 0.9 }}>
              {profile.bioTagline}
            </p>
            <span style={{ fontSize: '12px', opacity: 0.6, background: styleTheme.cardBg, padding: '4px 10px', borderRadius: '20px', border: `1px solid ${styleTheme.border}` }}>
              @{profile.username}
            </span>
          </div>
        </div>

        {/* Tab Controls (Only if CV details are populated and enabled) */}
        {profile.cvEnabled && (
          <div style={{
            display: 'flex',
            background: styleTheme.cardBg,
            border: `2px solid ${styleTheme.border}`,
            borderRadius: '30px',
            padding: '6px',
            width: '100%',
            maxWidth: '420px',
            marginTop: '12px',
            boxShadow: styleTheme.shadow || '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <button 
              onClick={() => setActiveTab('links')}
              style={{
                flex: 1,
                background: activeTab === 'links' ? styleTheme.accent : 'transparent',
                color: activeTab === 'links' ? styleTheme.btnText : styleTheme.text,
                border: 'none',
                padding: '12px 24px',
                borderRadius: '24px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: activeTab === 'links' ? `0 4px 10px rgba(0,0,0,0.2)` : 'none'
              }}
            >
              🔗 {isAr ? 'الروابط' : 'Links'}
            </button>
            <button 
              onClick={() => setActiveTab('cv')}
              style={{
                flex: 1,
                background: activeTab === 'cv' ? styleTheme.accent : 'transparent',
                color: activeTab === 'cv' ? styleTheme.btnText : styleTheme.text,
                border: 'none',
                padding: '12px 24px',
                borderRadius: '24px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: activeTab === 'cv' ? `0 4px 10px rgba(0,0,0,0.2)` : 'none'
              }}
            >
              💼 {isAr ? 'السيرة الذاتية' : 'Resume / CV'}
            </button>
          </div>
        )}

        {/* --- LINKS TAB --- */}
        {activeTab === 'links' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Links Rendering */}
            <div style={{
              display: isGrid ? 'grid' : 'flex',
              gridTemplateColumns: isGrid ? '1fr 1fr' : 'none',
              flexDirection: 'column',
              gap: '12px',
              width: '100%'
            }}>
              {profile.links && profile.links.map((link, idx) => (
                <a 
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-card-button"
                  style={{
                    ...cardStyle,
                    ...(link.highlighted ? {
                      border: `2px solid ${styleTheme.accent}`,
                      background: `linear-gradient(45deg, ${styleTheme.cardBg}, rgba(${styleTheme.accent === '#FF6B35' ? '255,107,53' : '108,53,255'}, 0.15))`,
                      boxShadow: `0 0 15px rgba(${styleTheme.accent === '#FF6B35' ? '255,107,53' : '108,53,255'}, 0.2)`,
                      animation: 'pulse 2s infinite'
                    } : {})
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{link.icon || '🔗'}</span>
                  <div style={{ textAlign: isAr ? 'right' : 'left', flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{link.title}</div>
                    {link.description && <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>{link.description}</div>}
                  </div>
                </a>
              ))}
            </div>

            {/* Social handles */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'center', 
              gap: '12px', 
              marginTop: '16px',
              padding: '10px 0'
            }}>
              {profile.socials && Object.entries(profile.socials).map(([platform, handle]) => {
                const url = getSocialUrl(platform, handle);
                if (!url) return null;
                return (
                  <a 
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: styleTheme.cardBg,
                      border: `1px solid ${styleTheme.border}`,
                      fontSize: '18px',
                      textDecoration: 'none',
                      color: styleTheme.text,
                      transition: 'transform 0.2s',
                    }}
                    title={socialLabels[platform]}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {socialIcons[platform]}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* --- CV TAB --- */}
        {activeTab === 'cv' && (
          <div style={{ 
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '24px', 
            textAlign: isAr ? 'right' : 'left',
            direction: isAr ? 'rtl' : 'ltr'
          }}>
            
            {/* Professional Summary */}
            {cvSummary && (
              <div style={{
                background: styleTheme.cardBg,
                border: `1px solid ${styleTheme.border}`,
                borderRadius: '12px',
                padding: '18px',
                boxShadow: styleTheme.shadow || 'none'
              }}>
                <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: styleTheme.accent, marginBottom: '8px' }}>
                  👤 {isAr ? 'النبذة المهنية' : 'Professional Summary'}
                </h3>
                <p style={{ fontSize: '13px', opacity: 0.9, lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' }}>
                  {cvSummary}
                </p>
              </div>
            )}

            {/* Contact Details Grid */}
            {(cvContact.email || cvContact.phone || cvContact.location) && (
              <div style={{
                background: styleTheme.cardBg,
                border: `1px solid ${styleTheme.border}`,
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '13px',
                boxShadow: styleTheme.shadow || 'none'
              }}>
                {cvContact.email && (
                  <a href={`mailto:${cvContact.email}`} style={{ textDecoration: 'none', color: styleTheme.text, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📧 {cvContact.email}
                  </a>
                )}
                {cvContact.phone && (
                  <a href={`tel:${cvContact.phone}`} style={{ textDecoration: 'none', color: styleTheme.text, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📞 {cvContact.phone}
                  </a>
                )}
                {cvContact.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    📍 {cvContact.location}
                  </span>
                )}
              </div>
            )}

            {/* Experience Section */}
            {experience.length > 0 && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: `2px solid ${styleTheme.accent}`, paddingBottom: '6px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  💼 {isAr ? 'الخبرات المهنية' : 'Work Experience'}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {experience.map((exp, idx) => (
                    <div 
                      key={idx} 
                      style={{
                        background: styleTheme.cardBg,
                        border: `1px solid ${styleTheme.border}`,
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: styleTheme.shadow || 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                        <span style={{ fontWeight: '700', fontSize: '14px', color: styleTheme.text }}>{exp.role}</span>
                        <span style={{ fontSize: '11px', color: styleTheme.accent, fontWeight: 'bold' }}>{exp.period}</span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: styleTheme.textMuted, fontWeight: '600', marginBottom: '8px' }}>{exp.company}</div>
                      {exp.desc && <p style={{ fontSize: '12px', opacity: 0.85, margin: 0, lineHeight: '1.5', whiteSpace: 'pre-line' }}>{exp.desc}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education Section */}
            {education.length > 0 && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: `2px solid ${styleTheme.accent}`, paddingBottom: '6px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🎓 {isAr ? 'التعليم والدراسة' : 'Education'}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {education.map((edu, idx) => (
                    <div 
                      key={idx} 
                      style={{
                        background: styleTheme.cardBg,
                        border: `1px solid ${styleTheme.border}`,
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: styleTheme.shadow || 'none'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
                        <span style={{ fontWeight: '700', fontSize: '14px', color: styleTheme.text }}>{edu.degree}</span>
                        <span style={{ fontSize: '11px', color: styleTheme.accent, fontWeight: 'bold' }}>{edu.period}</span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: styleTheme.textMuted }}>{edu.school}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills & Levels Section */}
            {skillsList.length > 0 && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: `2px solid ${styleTheme.accent}`, paddingBottom: '6px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ⚡ {isAr ? 'المهارات ومستوى الإتقان' : 'Skills & Proficiency'}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {skillsList.map((skill, idx) => (
                    <span 
                      key={idx}
                      style={{
                        background: styleTheme.cardBg,
                        border: `1px solid ${styleTheme.border}`,
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: styleTheme.text,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {skill.name}
                      <span style={{ fontSize: '10px', color: styleTheme.accent, background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '10px' }}>
                        {skill.level}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages Section */}
            {languages.length > 0 && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: `2px solid ${styleTheme.accent}`, paddingBottom: '6px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🌐 {isAr ? 'اللغات' : 'Languages'}
                </h3>
                <div style={{
                  background: styleTheme.cardBg,
                  border: `1px solid ${styleTheme.border}`,
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px'
                }}>
                  {languages.map((l, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <strong style={{ color: styleTheme.text }}>🗣️ {l.name}</strong>
                      <span style={{ color: styleTheme.textMuted }}>{l.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications Section */}
            {certifications.length > 0 && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: `2px solid ${styleTheme.accent}`, paddingBottom: '6px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📜 {isAr ? 'الشهادات والاعتمادات' : 'Certifications'}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {certifications.map((cert, idx) => (
                    <div 
                      key={idx}
                      style={{
                        background: styleTheme.cardBg,
                        border: `1px solid ${styleTheme.border}`,
                        borderRadius: '12px',
                        padding: '14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '13px'
                      }}
                    >
                      <div>
                        <strong style={{ display: 'block', color: styleTheme.text }}>{cert.name}</strong>
                        <span style={{ fontSize: '11.5px', color: styleTheme.textMuted }}>{cert.org}</span>
                      </div>
                      <span style={{ fontSize: '11.5px', color: styleTheme.accent, fontWeight: 'bold' }}>{cert.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personal Projects Section */}
            {projects.length > 0 && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: `2px solid ${styleTheme.accent}`, paddingBottom: '6px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🚀 {isAr ? 'المشاريع الشخصية' : 'Personal Projects'}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {projects.map((proj, idx) => (
                    <div 
                      key={idx}
                      style={{
                        background: styleTheme.cardBg,
                        border: `1px solid ${styleTheme.border}`,
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '14px', color: styleTheme.text }}>{proj.title}</strong>
                        {proj.url && (
                          <a 
                            href={proj.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ fontSize: '11.5px', color: styleTheme.accent, textDecoration: 'none', fontWeight: 'bold', border: `1px solid ${styleTheme.accent}`, padding: '3px 10px', borderRadius: '20px' }}
                          >
                            {isAr ? 'عرض المشروع ↗' : 'View ↗'}
                          </a>
                        )}
                      </div>
                      {proj.desc && <p style={{ fontSize: '12px', opacity: 0.85, margin: 0, lineHeight: '1.5' }}>{proj.desc}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Footer info */}
        <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', opacity: 0.5, fontSize: '11px' }}>
          <span>Powered by <strong style={{ color: styleTheme.accent }}>UpKlick</strong></span>
        </div>

      </div>

      <style>{`
        .link-card-button:hover {
          transform: translateY(-2px);
          background: ${styleTheme.cardHover} !important;
          box-shadow: ${styleTheme.shadow ? '0 6px 16px rgba(0,0,0,0.1)' : '0 4px 12px rgba(255, 255, 255, 0.05)'};
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(${styleTheme.accent === '#FF6B35' ? '255,107,53' : '108,53,255'}, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(${styleTheme.accent === '#FF6B35' ? '255,107,53' : '108,53,255'}, 0); }
          100% { box-shadow: 0 0 0 0 rgba(${styleTheme.accent === '#FF6B35' ? '255,107,53' : '108,53,255'}, 0); }
        }
      `}</style>
    </div>
  );
}
