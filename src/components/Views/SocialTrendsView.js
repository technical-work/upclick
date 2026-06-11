'use client';

import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';
import { DB } from '../../data/mockData';

export default function SocialTrendsView() {
  const { lang, L, t } = useBusiness();

  // Filters state
  const [platform, setPlatform] = useState('tiktok');
  const [niche, setNiche] = useState('');
  const [region, setRegion] = useState('AR');
  const [sortBy, setSortBy] = useState('plays');
  const [period, setPeriod] = useState('7');

  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Stats computed from trends
  const totalViewsStr = trends.length > 0 ? trends.reduce((sum, v) => sum + (parseInt(String(v.views).replace(/[^0-9]/g, '')) || 0), 0).toLocaleString() : '—';
  const avgEngagement = trends.length > 0 ? '7.4%' : '—';
  const hotHashtagsCount = trends.length > 0 ? new Set(trends.flatMap(v => v.hashtags || [])).size : '—';

  const handleLoadTrends = async () => {
    setLoading(true);
    setTrends([]);
    setHasLoaded(true);

    const prompt = `Generate 12 Arabic social media trending videos. Platform: ${platform} Niche: ${niche || 'mixed'} Region: ${region}. Each object needs: title, creator, views, likes, shares, comments, hashtags(array of 3), category, duration, trend_score(1-10), why_trending. Return ONLY the JSON array.`;
    const sysPrompt = 'TikTok trend analyst for Arabic market. Return ONLY valid JSON array, no markdown, no code blocks.';

    try {
      const reply = await callClaudeAPI(prompt, sysPrompt, lang);
      let cleaned = reply;
      if (cleaned.indexOf('[') > -1) {
        cleaned = cleaned.slice(cleaned.indexOf('['), cleaned.lastIndexOf(']') + 1);
      }
      const parsed = JSON.parse(cleaned);
      setTrends(parsed);
    } catch (e) {
      console.warn("AI Trends call failed, using mock fallbacks.");
      // Fallback trend cards
      const fallbacks = [
        { title: L('How to start a digital product store from scratch in Arabic', 'كيف تبدأ متجر منتجات رقمية من الصفر باللغة العربية'), creator: 'upklick_creator', views: '284K', likes: '24K', shares: '5.2K', comments: '1.2K', hashtags: ['منتجات_رقمية', 'عمل_حر', 'ريادة_الأعمال'], category: 'Business', duration: '0:45', trend_score: 9, why_trending: L('High search volume for side hustles in the Gulf.', 'معدل بحث مرتفع عن مصادر الدخل الجانبية في منطقة الخليج.') },
        { title: L('My 5:00 AM morning routine as a SaaS founder', 'روتين الصباح الساعة ٥:٠٠ صباحاً كمؤسس شركة برمجيات'), creator: 'saas_sara', views: '194K', likes: '18K', shares: '2.1K', comments: '640', hashtags: ['روتين_الصباح', 'إنتاجية', 'يوميات'], category: 'Lifestyle', duration: '0:35', trend_score: 8, why_trending: L('Aesthetic productivity routines are highly viral right now.', 'فيديوهات الإنتاجية الجمالية تحظى برواج كبير حالياً.') },
        { title: L('Stop doing manual data entry - use this Notion tracker', 'توقف عن كتابة البيانات يدوياً - استخدم جدول Notion هذا'), creator: 'notion_arabia', views: '342K', likes: '31K', shares: '11K', comments: '3.4K', hashtags: ['نوتشن', 'أدوات_ذكية', 'تنظيم'], category: 'Tech', duration: '0:50', trend_score: 10, why_trending: L('Notion templates adoption is growing rapidly.', 'تزايد استخدام قوالب نوتشن بشكل متسارع.') }
      ];
      setTrends(fallbacks);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTitle = (title) => {
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(title).then(() => {
        alert(L('Copied title to clipboard!', 'تم نسخ العنوان للحافظة!'));
      });
    }
  };

  return (
    <div className="pg on" id="pg-tiktok-trends">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">📡</span>
          {L('Social Trends', 'الترندات الاجتماعية')}
        </div>
        <div className="pg-actions">
          <button className="btn btn-ghost" onClick={handleLoadTrends} style={{ fontSize: '12px' }}>
            🔄 {L('Refresh', 'تحديث')}
          </button>
          <button className="btn btn-prime" onClick={handleLoadTrends}>
            🔍 {L('Load Trends', 'تحميل الترندات')}
          </button>
        </div>
      </div>

      <div className="g4 stagger mb">
        <div className="stat-card">
          <div className="stat-lbl">🔥 {L('Trending Now', 'الرائج الآن')}</div>
          <div className="stat-val" id="tt-stat-total">{trends.length || '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">👁️ {L('Total Views', 'إجمالي المشاهدات')}</div>
          <div className="stat-val" id="tt-stat-views">{totalViewsStr}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">❤️ {L('Avg Engagement', 'متوسط التفاعل')}</div>
          <div className="stat-val" id="tt-stat-eng">{avgEngagement}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">🏷️ {L('Hot Hashtags', 'الهاشتاجات الرائجة')}</div>
          <div className="stat-val" id="tt-stat-tags">{hotHashtagsCount}</div>
        </div>
      </div>

      <div className="card mb">
        <div className="sec-hd"><div className="sec-title">🎯 {L('Filter Trends', 'فلترة الترندات')}</div></div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
              {L('Platform', 'المنصة')}
            </label>
            <select className="inp" value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ width: '150px' }}>
              <option value="all">{L('All Platforms', 'جميع المنصات')}</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram Reels</option>
              <option value="youtube">YouTube Shorts</option>
              <option value="snapchat">Snapchat</option>
              <option value="twitter">X (Twitter)</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
              {L('Niche', 'المجال')}
            </label>
            <select className="inp" value={niche} onChange={(e) => setNiche(e.target.value)} style={{ width: '170px' }}>
              <option value="">{L('All Niches', 'جميع المجالات')}</option>
              <option>Business & Money</option>
              <option>Coaching & Education</option>
              <option>Marketing & Ads</option>
              <option>E-commerce</option>
              <option>Real Estate</option>
              <option>Fitness & Health</option>
              <option>Beauty & Fashion</option>
              <option>Food & Cooking</option>
              <option>Tech & AI</option>
              <option>Motivation</option>
              <option>Entertainment</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
              {L('Region', 'المنطقة')}
            </label>
            <select className="inp" value={region} onChange={(e) => setRegion(e.target.value)} style={{ width: '150px' }}>
              <option value="AR">{L('Arab World', 'العالم العربي')}</option>
              <option value="SA">{L('Saudi Arabia', 'المملكة العربية السعودية')}</option>
              <option value="AE">{L('UAE', 'الإمارات العربية المتحدة')}</option>
              <option value="EG">{L('Egypt', 'مصر')}</option>
              <option value="KW">{L('Kuwait', 'الكويت')}</option>
              <option value="QA">{L('Qatar', 'قطر')}</option>
              <option value="GLOBAL">{L('Global', 'عالمي')}</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
              {L('Sort By', 'ترتيب حسب')}
            </label>
            <select className="inp" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: '140px' }}>
              <option value="plays">{L('Most Played', 'الأكثر مشاهدة')}</option>
              <option value="likes">{L('Most Liked', 'الأكثر إعجاباً')}</option>
              <option value="shares">{L('Most Shared', 'الأكثر مشاركة')}</option>
              <option value="comments">{L('Most Comments', 'الأكثر تعليقاً')}</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
              {L('Period', 'الفترة الزمنية')}
            </label>
            <select className="inp" value={period} onChange={(e) => setPeriod(e.target.value)} style={{ width: '120px' }}>
              <option value="7">{L('Last 7 days', 'آخر ٧ أيام')}</option>
              <option value="30">{L('Last 30 days', 'آخر ٣٠ يوماً')}</option>
              <option value="1">{L('Today', 'اليوم')}</option>
            </select>
          </div>
          <button className="btn btn-prime" onClick={handleLoadTrends}>
            🔍 {L('Search', 'بحث')}
          </button>
        </div>
      </div>

      {loading && (
        <div id="tiktok-loading" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px', animation: 'pulse 1s ease-in-out infinite' }}>📡</div>
          <div style={{ fontFamily: 'var(--ff)', fontSize: '15px', fontWeight: 600, color: 'var(--t1)', marginBottom: '6px' }}>
            {L('Scanning trending content...', 'جاري البحث في المحتوى الرائج...')}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--t2)' }} id="tt-loading-platform">
            {L(`Analyzing viral videos across platforms`, `تحليل الفيديوهات الفيروسية عبر المنصات`)}
          </div>
        </div>
      )}

      <div id="tiktok-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
        {!loading && trends.length === 0 && (
          <div style={{ gridColumn: '1/-1' }}>
            <div className="empty-state">
              <div className="es-icon">📡</div>
              <div className="es-title">{L('Discover What\'s Trending', 'اكتشف ما هو رائج')}</div>
              <div className="es-sub">
                {L('Find viral content ideas across TikTok, Instagram Reels, YouTube Shorts, and more — filtered for the Arab market', 'ابحث عن أفكار محتوى فيروسية ورائجة على تيك توك وإنستجرام ويوتيوب')}
              </div>
              <button className="btn btn-prime" onClick={handleLoadTrends}>
                🔥 {L('Load Trending Now', 'تحميل الرائج الآن')}
              </button>
            </div>
          </div>
        )}

        {!loading && trends.map((v, i) => (
          <div 
            className="card" 
            key={i} 
            style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
            onClick={() => handleCopyTitle(v.title)}
          >
            <div style={{ height: '130px', background: 'linear-gradient(135deg, var(--surface2), var(--surface3))', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ fontSize: '36px' }}>🎵</div>
              <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,.75)', borderRadius: '5px', padding: '2px 7px', fontSize: '11px', color: 'var(--orange)', fontWeight: 700 }}>
                🔥 {v.trend_score || 8}/10
              </div>
              <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,.7)', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', color: '#fff' }}>
                {v.duration || '0:30'}
              </div>
            </div>
            <div style={{ padding: '11px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--t1)', marginBottom: '4px', lineHeight: 1.4 }}>
                {v.title}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--t2)', marginBottom: '7px' }}>
                @{v.creator || 'creator'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', marginBottom: '7px' }}>
                <div style={{ fontSize: '10.5px', color: 'var(--t2)' }}>
                  👁️ {v.views} {L('views', 'مشاهدة')}
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--t2)', textAlign: lang === 'ar' ? 'left' : 'right' }}>
                  ❤️ {v.likes} {L('likes', 'إعجاب')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {(v.hashtags || []).map((tag, tIdx) => (
                  <span key={tIdx} style={{ fontSize: '10px', background: 'var(--orange-dim)', borderRadius: '4px', padding: '1px 6px', color: 'var(--orange)' }}>
                    #{tag}
                  </span>
                ))}
              </div>
              <div style={{ background: 'var(--surface2)', borderRadius: '6px', padding: '8px', fontSize: '11px', color: 'var(--t2)', border: '1px solid var(--edge)' }}>
                <strong>💡 Why:</strong> {v.why_trending}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
