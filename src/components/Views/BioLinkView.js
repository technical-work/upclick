'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';

export default function BioLinkView() {
  const { lang, L, t } = useBusiness();

  const [displayName, setDisplayName] = useState('Sara Hassan');
  const [bioTagline, setBioTagline] = useState('Coach | Entrepreneur | Content Creator 🚀');
  const [username, setUsername] = useState('sarahassan');
  const [bioTheme, setBioTheme] = useState('dark'); // 'dark', 'purple', 'orange', 'white', 'green'

  const [links, setLinks] = useState([
    { title: 'My Website', url: 'https://sarahassan.com', icon: '🌐' },
    { title: 'Free Course', url: 'https://upklick.bio/sarahassan/free', icon: '📚' },
    { title: 'Book a Call', url: 'https://calendly.com/sarahassan', icon: '💬', highlighted: true }
  ]);

  const [socials, setSocials] = useState({
    ig: '@sarahassan',
    tt: '@sarahassan',
    yt: 'Sarah Hassan',
    li: '',
    tg: '',
    wa: ''
  });

  const addLink = () => {
    setLinks(prev => [...prev, { title: 'New Link', url: 'https://', icon: '🔗' }]);
  };

  const updateLink = (idx, field, value) => {
    setLinks(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  };

  const removeLink = (idx) => {
    setLinks(prev => prev.filter((_, i) => i !== idx));
  };

  const selectBioTheme = (themeName) => {
    setBioTheme(themeName);
  };

  const saveBioLink = () => {
    const data = { displayName, bioTagline, username, bioTheme, links, socials };
    localStorage.setItem('upklick_bio_data', JSON.stringify(data));
    alert(L('Bio link saved & published successfully!', 'تم حفظ ونشر رابط البايو بنجاح!'));
  };

  const getThemeStyle = () => {
    switch (bioTheme) {
      case 'purple':
        return { background: 'linear-gradient(135deg,#6C35FF,#a855f7)', color: '#fff' };
      case 'orange':
        return { background: 'linear-gradient(135deg,#FF6B35,#f59e0b)', color: '#fff' };
      case 'white':
        return { background: '#ffffff', color: '#0a0818', border: '1px solid #ddd' };
      case 'green':
        return { background: 'linear-gradient(135deg,#059669,#10b981)', color: '#fff' };
      case 'dark':
      default:
        return { background: '#08080f', color: '#fff' };
    }
  };

  const getLinkStyle = (isHighlighted) => {
    if (bioTheme === 'white') {
      return {
        background: isHighlighted ? 'var(--orange)' : '#f3f4f6',
        color: isHighlighted ? '#fff' : '#000',
        borderRadius: '10px',
        padding: '11px',
        fontSize: '13px',
        fontWeight: '600',
        border: '1px solid #ddd'
      };
    }
    return {
      background: isHighlighted ? 'var(--orange)' : 'rgba(255, 255, 255, 0.1)',
      color: '#fff',
      borderRadius: '10px',
      padding: '11px',
      fontSize: '13px',
      fontWeight: '600'
    };
  };

  return (
    <div className="pg on" id="pg-bio">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">🔗</span>
          {L('Bio Link Builder', 'مطور رابط البايو')}
        </div>
        <div className="pg-actions">
          <button className="btn btn-ghost" onClick={() => alert(L('Mock Preview opened', 'تم فتح المعاينة'))}>
            👁️ {L('Preview', 'معاينة')}
          </button>
          <button className="btn btn-prime" onClick={saveBioLink}>
            💾 {L('Save & Publish', 'حفظ ونشر')}
          </button>
        </div>
      </div>

      <div className="g2">
        <div>
          <div className="card mb">
            <div className="sec-hd"><div className="sec-title">{L('Page Setup', 'إعداد الصفحة')}</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Display Name', 'الاسم المعروض')}
                </label>
                <input className="inp" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your Name or Brand" />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Bio / Tagline', 'الوصف القصير')}
                </label>
                <textarea className="inp" value={bioTagline} onChange={(e) => setBioTagline(e.target.value)} rows="2" placeholder="Coach | Entrepreneur | Content Creator 🚀"></textarea>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Username (your link)', 'اسم المستخدم (رابطك الخاص)')}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface2)', borderRadius: '9px', border: '1px solid var(--edge)', overflow: 'hidden' }}>
                  <span style={{ padding: '9px 10px', fontSize: '12px', color: 'var(--t3)', borderRight: '1px solid var(--edge)', whiteSpace: 'nowrap' }}>upklick.bio/</span>
                  <input 
                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', padding: '9px 12px', fontSize: '13px', color: 'var(--t1)' }} 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="yourname" 
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Theme', 'المظهر')}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { key: 'dark', color: '#08080f' },
                    { key: 'purple', color: 'linear-gradient(135deg,#6C35FF,#a855f7)' },
                    { key: 'orange', color: 'linear-gradient(135deg,#FF6B35,#f59e0b)' },
                    { key: 'white', color: '#ffffff' },
                    { key: 'green', color: 'linear-gradient(135deg,#059669,#10b981)' }
                  ].map(theme => (
                    <div 
                      key={theme.key}
                      onClick={() => selectBioTheme(theme.key)}
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '8px', 
                        background: theme.color, 
                        border: bioTheme === theme.key ? '2px solid var(--orange)' : '2px solid var(--edge)', 
                        cursor: 'pointer', 
                        flexShrink: 0 
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card mb">
            <div className="sec-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div className="sec-title">🔗 {L('Links', 'الروابط')}</div>
              <button className="btn btn-prime" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={addLink}>
                + {L('Add Link', 'إضافة رابط')}
              </button>
            </div>
            <div id="bio-links-list" style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {links.map((link, idx) => (
                <div className="bio-link-item" key={idx} style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
                  <span style={{ fontSize: '18px' }}>{link.icon || '🔗'}</span>
                  <input 
                    className="inp" 
                    value={link.title} 
                    onChange={(e) => updateLink(idx, 'title', e.target.value)} 
                    placeholder="Link title" 
                    style={{ flex: 1, fontSize: '12.5px' }} 
                  />
                  <input 
                    className="inp" 
                    value={link.url} 
                    onChange={(e) => updateLink(idx, 'url', e.target.value)} 
                    placeholder="URL" 
                    style={{ flex: 1.5, fontSize: '12.5px' }} 
                  />
                  <button 
                    onClick={() => removeLink(idx)} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', fontSize: '16px' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button className="btn btn-ghost" onClick={addLink} style={{ width: '100%', justifyContent: 'center', marginTop: '8px', fontSize: '12.5px' }}>
              + {L('Add Another Link', 'إضافة رابط آخر')}
            </button>
          </div>

          <div className="card">
            <div className="sec-hd"><div className="sec-title">📱 {L('Social Profiles', 'حسابات التواصل')}</div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { key: 'ig', icon: '📸', placeholder: '@instagram' },
                { key: 'tt', icon: '🎵', placeholder: '@tiktok' },
                { key: 'yt', icon: '▶️', placeholder: 'YouTube channel' },
                { key: 'li', icon: '💼', placeholder: 'LinkedIn URL' },
                { key: 'tg', icon: '✈️', placeholder: '@telegram' },
                { key: 'wa', icon: '💬', placeholder: 'WhatsApp number' }
              ].map(s => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }} key={s.key}>
                  <span>{s.icon}</span>
                  <input 
                    className="inp" 
                    value={socials[s.key]} 
                    onChange={(e) => setSocials(prev => ({ ...prev, [s.key]: e.target.value }))} 
                    placeholder={s.placeholder} 
                    style={{ fontSize: '12.5px' }} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ position: 'sticky', top: '14px', height: 'fit-content' }}>
          <div className="sec-hd"><div className="sec-title">📱 {L('Live Preview', 'معاينة مباشرة')}</div></div>
          <div 
            id="bio-preview" 
            style={{ 
              ...getThemeStyle(),
              borderRadius: '16px', 
              padding: '28px 20px', 
              textAlign: 'center', 
              minHeight: '400px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: 0, 
              transition: 'all .3s' 
            }}
          >
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--orange),var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: '#fff', marginBottom: '12px' }} id="bio-prev-avatar">
              {displayName ? displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U'}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, marginStyle: '4px', marginBottom: '4px' }} id="bio-prev-name">
              {displayName || 'Your Name'}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '20px' }} id="bio-prev-tagline">
              {bioTagline || 'Coach | Entrepreneur'}
            </div>
            <div id="bio-prev-links" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {links.map((link, i) => (
                <div 
                  key={i} 
                  style={getLinkStyle(link.highlighted)}
                >
                  {link.icon} {link.title || 'Link Title'}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', fontSize: '18px' }} id="bio-prev-socials">
              {socials.ig && <span>📸</span>}
              {socials.tt && <span>🎵</span>}
              {socials.yt && <span>▶️</span>}
              {socials.tg && <span>✈️</span>}
              {socials.wa && <span>💬</span>}
            </div>
            <div style={{ fontSize: '10px', opacity: 0.3, marginTop: '16px' }}>powered by UpKlick</div>
          </div>
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '11.5px', color: 'var(--t2)', marginBottom: '6px' }}>{L('Your link:', 'رابطك الخاص:')}</div>
            <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '8px 12px', fontSize: '12.5px', color: 'var(--orange)', fontFamily: 'monospace' }}>
              upklick.bio/<span id="bio-link-preview">{username || 'yourname'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
