'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';

export default function SocialConnectModal() {
  const {
    lang,
    L,
    t,
    socialConnectModalOpen,
    setSocialConnectModalOpen,
    GC,
    saveGC
  } = useBusiness();

  // Local inputs
  const [fbProfile, setFbProfile] = useState('');
  const [igProfile, setIgProfile] = useState('');
  const [ttProfile, setTtProfile] = useState('');

  // Follower counts
  const [fbFollowers, setFbFollowers] = useState(0);
  const [igFollowers, setIgFollowers] = useState(0);
  const [ttFollowers, setTtFollowers] = useState(0);

  // Connection states
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [tempApifyToken, setTempApifyToken] = useState('');

  const apifyToken = GC.integrations?.apifyToken || tempApifyToken;
  const hasApifyToken = !!apifyToken;

  useEffect(() => {
    if (socialConnectModalOpen) {
      const accounts = GC.socialAccounts || {};
      const profiles = accounts.profiles || {};
      const followers = accounts.followers || {};

      setFbProfile(profiles.facebook || '');
      setIgProfile(profiles.instagram || '');
      setTtProfile(profiles.tiktok || '');

      setFbFollowers(followers.facebook || 0);
      setIgFollowers(followers.instagram || 0);
      setTtFollowers(followers.tiktok || 0);
      
      setStatusMsg('');
      setLoading(false);
    }
  }, [socialConnectModalOpen, GC.socialAccounts]);

  if (!socialConnectModalOpen) return null;

  const handleClose = () => {
    setSocialConnectModalOpen(false);
  };

  const formatCount = (count) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return String(count);
  };

  const handleSyncApify = async () => {
    if (!apifyToken) {
      alert(L('Please enter an Apify API Token to sync', 'يرجى إدخال رمز واجهة برمجة تطبيقات Apify (Token) للمزامنة'));
      return;
    }

    setLoading(true);
    setStatusMsg(L('Starting Apify Scraping Actors...', 'جاري بدء سكرابر Apify...'));

    let newFb = fbFollowers;
    let newIg = igFollowers;
    let newTt = ttFollowers;
    let errors = [];

    // 1. Sync Instagram
    if (igProfile.trim()) {
      try {
        setStatusMsg(L('Fetching Instagram followers for @' + igProfile + '...', 'جاري جلب متابعين إنستغرام لـ @' + igProfile + '...'));
        const cleanIg = igProfile.replace('@', '').trim();
        const res = await fetch(`https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${apifyToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usernames: [cleanIg] })
        });
        if (!res.ok) throw new Error('Instagram scraper response error');
        const data = await res.json();
        const count = data?.[0]?.followersCount || data?.[0]?.followers || 0;
        if (count > 0) {
          newIg = count;
          setIgFollowers(count);
        } else {
          throw new Error('No follower data found in Instagram response');
        }
      } catch (e) {
        console.error(e);
        errors.push(L('Instagram Sync failed. You can enter count manually.', 'فشل مزامنة إنستغرام. يمكنك إدخال الرقم يدوياً.'));
      }
    }

    // 2. Sync TikTok
    if (ttProfile.trim()) {
      try {
        setStatusMsg(L('Fetching TikTok followers for @' + ttProfile + '...', 'جاري جلب متابعين تيك توك لـ @' + ttProfile + '...'));
        const cleanTt = ttProfile.replace('@', '').trim();
        const res = await fetch(`https://api.apify.com/v2/acts/apify~tiktok-profile-scraper/run-sync-get-dataset-items?token=${apifyToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profiles: [cleanTt] })
        });
        if (!res.ok) throw new Error('TikTok scraper response error');
        const data = await res.json();
        const count = data?.[0]?.followers || data?.[0]?.followersCount || 0;
        if (count > 0) {
          newTt = count;
          setTtFollowers(count);
        } else {
          throw new Error('No follower data found in TikTok response');
        }
      } catch (e) {
        console.error(e);
        errors.push(L('TikTok Sync failed. You can enter count manually.', 'فشل مزامنة تيك توك. يمكنك إدخال الرقم يدوياً.'));
      }
    }

    // 3. Sync Facebook
    if (fbProfile.trim()) {
      try {
        setStatusMsg(L('Fetching Facebook page likes...', 'جاري جلب معجبي صفحة فيسبوك...'));
        const url = fbProfile.startsWith('http') ? fbProfile : `https://www.facebook.com/${fbProfile}`;
        const res = await fetch(`https://api.apify.com/v2/acts/apify~facebook-pages-scraper/run-sync-get-dataset-items?token=${apifyToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls: [url] })
        });
        if (!res.ok) throw new Error('Facebook scraper response error');
        const data = await res.json();
        const count = data?.[0]?.followersCount || data?.[0]?.likes || data?.[0]?.likesCount || data?.[0]?.followers || 0;
        if (count > 0) {
          newFb = count;
          setFbFollowers(count);
        } else {
          throw new Error('No page likes data found in Facebook response');
        }
      } catch (e) {
        console.error(e);
        errors.push(L('Facebook Sync failed. You can enter count manually.', 'فشل مزامنة فيسبوك. يمكنك إدخال الرقم يدوياً.'));
      }
    }

    setLoading(false);
    if (errors.length > 0) {
      setStatusMsg(errors.join(' | '));
      alert(L('Sync completed with some failures. Verify details and edit counts manually if needed.', 'اكتملت المزامنة مع بعض الأخطاء. تحقق من التفاصيل واكتب الأرقام يدوياً إذا لزم الأمر.'));
    } else {
      setStatusMsg(L('Successfully synced all profiles!', 'تمت مزامنة جميع الحسابات بنجاح!'));
    }
  };

  const handleSave = () => {
    const total = (parseInt(fbFollowers) || 0) + (parseInt(igFollowers) || 0) + (parseInt(ttFollowers) || 0);

    const updatedGC = {
      ...GC,
      creator: {
        ...GC.creator,
        followers: formatCount(total)
      },
      socialAccounts: {
        ...GC.socialAccounts,
        connected: {
          ...GC.socialAccounts?.connected,
          facebook: fbProfile.trim().length > 0 && fbFollowers > 0,
          instagram: igProfile.trim().length > 0 && igFollowers > 0,
          tiktok: ttProfile.trim().length > 0 && ttFollowers > 0
        },
        profiles: {
          facebook: fbProfile.trim(),
          instagram: igProfile.trim(),
          tiktok: ttProfile.trim()
        },
        followers: {
          facebook: parseInt(fbFollowers) || 0,
          instagram: parseInt(igFollowers) || 0,
          tiktok: parseInt(ttFollowers) || 0,
          total: total
        }
      }
    };

    // If a temporary token was entered, save it to integrations as well
    if (tempApifyToken && !GC.integrations?.apifyToken) {
      if (!updatedGC.integrations) updatedGC.integrations = {};
      updatedGC.integrations.apifyToken = tempApifyToken;
      updatedGC.integrations.apifyConnected = true;
    }

    saveGC(updatedGC);
    handleClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-box" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-close" onClick={handleClose}>✕</div>
        <div style={{ padding: '24px' }}>
          
          <div style={{ fontFamily: 'var(--ff)', fontSize: '18px', fontWeight: 800, color: 'var(--t1)', marginBottom: '4px' }}>
            👥 {L('Connect Social Profiles', 'ربط الحسابات الاجتماعية')}
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--t3)', marginBottom: '20px' }}>
            {L('Enter your social links to display real-time follower counts on your dashboard.', 'أدخل روابط حساباتك الاجتماعية لعرض أعداد المتابعين الحية في لوحة التحكم.')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Facebook Row */}
            <div className="card" style={{ background: 'var(--surface2)', padding: '12px', borderColor: 'rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>🔵</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }}>Facebook</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Username or Page URL', 'اسم المستخدم أو رابط الصفحة')}
                  </label>
                  <input
                    className="inp"
                    placeholder="e.g. upklick"
                    value={fbProfile}
                    onChange={(e) => setFbProfile(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Followers / Likes', 'المتابعين / الإعجابات')}
                  </label>
                  <input
                    className="inp"
                    type="number"
                    placeholder="0"
                    value={fbFollowers}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFbFollowers(val === '' ? '' : parseInt(val) || 0);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Instagram Row */}
            <div className="card" style={{ background: 'var(--surface2)', padding: '12px', borderColor: 'rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>📸</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }}>Instagram</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Instagram Username', 'اسم المستخدم')}
                  </label>
                  <input
                    className="inp"
                    placeholder="e.g. sarah.creates"
                    value={igProfile}
                    onChange={(e) => setIgProfile(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Follower Count', 'عدد المتابعين')}
                  </label>
                  <input
                    className="inp"
                    type="number"
                    placeholder="0"
                    value={igFollowers}
                    onChange={(e) => {
                      const val = e.target.value;
                      setIgFollowers(val === '' ? '' : parseInt(val) || 0);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* TikTok Row */}
            <div className="card" style={{ background: 'var(--surface2)', padding: '12px', borderColor: 'rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>🎵</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }}>TikTok</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('TikTok Username', 'اسم المستخدم')}
                  </label>
                  <input
                    className="inp"
                    placeholder="e.g. sara.creates"
                    value={ttProfile}
                    onChange={(e) => setTtProfile(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Follower Count', 'عدد المتابعين')}
                  </label>
                  <input
                    className="inp"
                    type="number"
                    placeholder="0"
                    value={ttFollowers}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTtFollowers(val === '' ? '' : parseInt(val) || 0);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Apify API Key Area */}
            <div className="card" style={{ background: 'rgba(255,107,53,0.02)', padding: '12px', border: '1px dashed var(--edge)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--t1)' }}>🤖 Apify Scraper Sync</span>
                <span style={{ fontSize: '11px', color: hasApifyToken ? 'var(--green)' : 'var(--amber)' }}>
                  {hasApifyToken ? L('Connected 🟢', 'متصل 🟢') : L('Token Missing ⚠️', 'الرمز مفقود ⚠️')}
                </span>
              </div>

              {!hasApifyToken && (
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontSize: '11px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Enter Apify API Token (Optional)', 'أدخل رمز Apify API (اختياري)')}
                  </label>
                  <input
                    className="inp"
                    type="password"
                    placeholder="apify_api_..."
                    value={tempApifyToken}
                    onChange={(e) => setTempApifyToken(e.target.value)}
                    style={{ fontSize: '12px' }}
                  />
                  <div style={{ fontSize: '10px', color: 'var(--t3)', marginTop: '4px' }}>
                    {L('Get token from ', 'احصل على الرمز من ')}
                    <a href="https://apify.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--orange)' }}>apify.com</a>
                  </div>
                </div>
              )}

              <button
                className="btn btn-ghost"
                type="button"
                onClick={handleSyncApify}
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', fontSize: '12px', height: '36px' }}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="spinner" style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <span>{L('Syncing...', 'جاري المزامنة...')}</span>
                  </div>
                ) : (
                  <span>🔄 {L('Sync Live Followers via Apify', 'مزامنة المتابعين الحية عبر Apify')}</span>
                )}
              </button>

              {statusMsg && (
                <div style={{ fontSize: '11px', color: 'var(--t2)', marginTop: '8px', padding: '6px', background: 'var(--surface3)', borderRadius: '6px', textAlign: 'center' }}>
                  {statusMsg}
                </div>
              )}
            </div>

            {/* Save Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                className="btn"
                type="button"
                onClick={handleClose}
                style={{ flex: 1, justifyContent: 'center', background: 'var(--surface3)' }}
              >
                {L('Cancel', 'إلغاء')}
              </button>
              <button
                className="btn btn-prime"
                type="button"
                onClick={handleSave}
                style={{ flex: 2, justifyContent: 'center' }}
              >
                💾 {L('Connect & Save', 'ربط وحفظ البيانات')}
              </button>
            </div>

          </div>

        </div>
      </div>
      
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
