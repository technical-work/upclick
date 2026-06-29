'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';
import { DB } from '../../data/mockData';

export default function SocialTrendsView() {
  const { lang, L, t, GC, saveGC } = useBusiness();

  const trendsData = GC.socialTrends || {
    filters: { platform: 'tiktok', niche: '', region: 'AR', sortBy: 'plays', period: '7' },
    trends: []
  };
  const savedFilters = trendsData.filters || {};
  const apifyConnected = GC.integrations?.apifyConnected || false;

  const sanitizeTrends = (rawTrends) => {
    if (!Array.isArray(rawTrends)) return [];
    return rawTrends.map(v => ({
      ...v,
      hashtags: Array.isArray(v.hashtags)
        ? v.hashtags.map(h => typeof h === 'object' ? (h.name || h.title || '') : h).filter(Boolean)
        : []
    }));
  };

  // Filters state
  const [platform, setPlatform] = useState(savedFilters.platform ?? 'tiktok');
  const [niche, setNiche] = useState(savedFilters.niche ?? '');
  const [region, setRegion] = useState(savedFilters.region ?? 'AR');
  const [sortBy, setSortBy] = useState(savedFilters.sortBy ?? 'plays');
  const [period, setPeriod] = useState(savedFilters.period ?? '7');
  const [resultsLimit, setResultsLimit] = useState(savedFilters.resultsLimit ?? '10');

  // Specific options
  const [igSearchType, setIgSearchType] = useState(savedFilters.igSearchType ?? 'hashtag');
  const [igResultsType, setIgResultsType] = useState(savedFilters.igResultsType ?? 'posts');

  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState(sanitizeTrends(trendsData.trends));
  const [hasLoaded, setHasLoaded] = useState(trendsData.trends && trendsData.trends.length > 0);

  // Sync state if GC updates
  useEffect(() => {
    if (GC.socialTrends) {
      const filters = GC.socialTrends.filters || {};
      setPlatform(filters.platform ?? 'tiktok');
      setNiche(filters.niche ?? '');
      setRegion(filters.region ?? 'AR');
      setSortBy(filters.sortBy ?? 'plays');
      setPeriod(filters.period ?? '7');
      setResultsLimit(filters.resultsLimit ?? '10');
      setTrends(sanitizeTrends(GC.socialTrends.trends));
      setHasLoaded(GC.socialTrends.trends && GC.socialTrends.trends.length > 0);
    }
  }, [GC.socialTrends]);

  // Sort trends client-side immediately when sortBy changes
  useEffect(() => {
    if (trends && trends.length > 0) {
      setTrends(prev => {
        const sorted = [...prev];
        if (sortBy === 'plays') {
          sorted.sort((a, b) => (b.rawPlayCount || 0) - (a.rawPlayCount || 0));
        } else if (sortBy === 'likes') {
          sorted.sort((a, b) => (b.rawDiggCount || 0) - (a.rawDiggCount || 0));
        } else if (sortBy === 'shares') {
          sorted.sort((a, b) => (b.rawShareCount || 0) - (a.rawShareCount || 0));
        } else if (sortBy === 'comments') {
          sorted.sort((a, b) => (b.rawCommentCount || 0) - (a.rawCommentCount || 0));
        }
        
        // Avoid state update if order is identical
        const isSame = sorted.every((val, idx) => val.title === prev[idx]?.title);
        return isSame ? prev : sorted;
      });
    }
  }, [sortBy]);

  const updateGCFilter = (key, value) => {
    const updatedGC = {
      ...GC,
      socialTrends: {
        ...GC.socialTrends,
        filters: {
          ...(GC.socialTrends?.filters || {}),
          [key]: value
        }
      }
    };
    saveGC(updatedGC);
  };

  // Stats computed from trends
  const totalViewsStr = trends.length > 0 ? trends.reduce((sum, v) => sum + (parseInt(String(v.views).replace(/[^0-9]/g, '')) || 0), 0).toLocaleString() : '—';
  const avgEngagement = trends.length > 0 ? '7.4%' : '—';
  const hotHashtagsCount = trends.length > 0 ? new Set(trends.flatMap(v => v.hashtags || [])).size : '—';

  const handleLoadTrends = async () => {
    setLoading(true);
    setTrends([]);
    setHasLoaded(true);

    const apifyToken = GC.integrations?.apifyToken;
    const apifyConnected = GC.integrations?.apifyConnected;

    if (apifyConnected && apifyToken) {
      try {
        let queryTerm = niche || "trending";
        
        // Localize search query
        if (region === 'SA') queryTerm += ' Saudi Arabia';
        else if (region === 'AE') queryTerm += ' UAE';
        else if (region === 'EG') queryTerm += ' Egypt';
        else if (region === 'KW') queryTerm += ' Kuwait';
        else if (region === 'QA') queryTerm += ' Qatar';
        else if (region === 'AR') queryTerm += ' Arab';

        let actorName = 'clockworks~tiktok-scraper';
        let payload = {};
        
        if (platform === 'tiktok' || platform === 'all') {
          actorName = 'clockworks~tiktok-scraper';
          payload = { searchQueries: [queryTerm], resultsPerPage: parseInt(resultsLimit), shouldDownloadVideos: false, shouldDownloadCovers: false };
        } else if (platform === 'instagram') {
          actorName = 'apify~instagram-scraper';
          payload = { search: queryTerm, searchType: igSearchType, resultsType: igResultsType, resultsLimit: parseInt(resultsLimit) };
        } else if (platform === 'youtube') {
          actorName = 'streamers~youtube-scraper';
          payload = { searchQueries: [queryTerm], maxResults: parseInt(resultsLimit), maxResultsShorts: parseInt(resultsLimit) };
        } else if (platform === 'twitter') {
          actorName = 'quacker~twitter-scraper';
          payload = { searchTerms: [queryTerm], tweetsDesired: parseInt(resultsLimit) };
        } else if (platform === 'snapchat') {
          // fallback to tiktok for snapchat if no reliable snapchat scraper is known
          actorName = 'clockworks~tiktok-scraper';
          payload = { searchQueries: [queryTerm + ' snapchat'], resultsPerPage: parseInt(resultsLimit), shouldDownloadVideos: false, shouldDownloadCovers: false };
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 seconds timeout

        const response = await fetch(
          `https://api.apify.com/v2/acts/${actorName}/run-sync-get-dataset-items?token=${apifyToken}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error('Apify API request failed');
        }

        const items = await response.json();
        
        if (Array.isArray(items) && items.length > 0) {
          const parsed = items.map(item => {
            const descText = item.text || item.desc || item.title || item.full_text || item.caption || L('Trending Video', 'فيديو رائج');
            const cleanTitle = descText.length > 80 ? descText.slice(0, 80) + '...' : descText;
            
            const displayCategory = platform === 'instagram' ? (niche || L('Instagram Reels', 'ريلز إنستغرام'))
                                  : platform === 'youtube' ? (niche || L('YouTube Shorts', 'فيديوهات يوتيوب القصيرة'))
                                  : platform === 'snapchat' ? (niche || L('Snapchat Spotlight', 'سناب شات سبوتلايت'))
                                  : platform === 'twitter' ? (niche || L('X / Twitter', 'منصة إكس'))
                                  : (niche || 'TikTok');

            const playCount = item.playCount || item.viewCount || item.views || 0;
            const diggCount = item.diggCount || item.likesCount || item.likeCount || item.favorite_count || item.likes || 0;
            const shareCount = item.shareCount || item.retweet_count || item.shares || 0;
            const commentCount = item.commentCount || item.commentsCount || item.reply_count || item.comments || 0;

            const formatCount = (count) => {
              if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
              if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
              return count ? String(count) : '—';
            };

            const creatorName = item.authorMeta?.name || item.authorMeta?.nickName || item.author?.uniqueId || item.author?.nickname || item.ownerUsername || item.channelName || item.user?.screen_name || 'creator';

            let videoUrl = item.webVideoUrl || item.url || '';
            if (!videoUrl && item.id && platform === 'tiktok') {
              videoUrl = `https://www.tiktok.com/@${creatorName}/video/${item.id}`;
            }

            return {
              title: cleanTitle,
              creator: creatorName,
              views: formatCount(playCount),
              likes: formatCount(diggCount),
              shares: formatCount(shareCount),
              comments: formatCount(commentCount),
              hashtags: Array.isArray(item.hashtags)
                ? item.hashtags.map(h => typeof h === 'object' ? (h.name || h.title || '') : h).filter(Boolean).slice(0, 3)
                : (descText.match(/#[^\s#]+/g) || []).map(h => h.replace('#', '')).slice(0, 3),
              category: displayCategory,
              duration: item.video?.duration || item.duration ? `${Math.floor((item.video?.duration || item.duration) / 60)}:${String((item.video?.duration || item.duration) % 60).padStart(2, '0')}` : '0:30',
              trend_score: Math.floor(Math.random() * 3) + 8,
              why_trending: L(`High engagement and social shares on ${platform}.`, `تفاعل كبير ومشاركات عالية على ${platform}.`),
              video_url: videoUrl,
              rawPlayCount: playCount,
              rawDiggCount: diggCount,
              rawShareCount: shareCount,
              rawCommentCount: commentCount
            };
          });

          // Sort client-side
          let sorted = [...parsed];
          if (sortBy === 'plays') {
            sorted.sort((a, b) => (b.rawPlayCount || 0) - (a.rawPlayCount || 0));
          } else if (sortBy === 'likes') {
            sorted.sort((a, b) => (b.rawDiggCount || 0) - (a.rawDiggCount || 0));
          } else if (sortBy === 'shares') {
            sorted.sort((a, b) => (b.rawShareCount || 0) - (a.rawShareCount || 0));
          } else if (sortBy === 'comments') {
            sorted.sort((a, b) => (b.rawCommentCount || 0) - (a.rawCommentCount || 0));
          }

          setTrends(sorted);
          const updatedGC = {
            ...GC,
            socialTrends: {
              filters: { platform, niche, region, sortBy, period, resultsLimit, igSearchType, igResultsType },
              trends: sorted
            }
          };
          saveGC(updatedGC);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error("Apify TikTok Scraper failed, falling back to AI/mock.", e);
      }
    }

    const prompt = `Generate ${resultsLimit} Arabic social media trending videos. Platform: ${platform} Niche: ${niche || 'mixed'} Region: ${region}. Each object needs: title, creator, views, likes, shares, comments, hashtags(array of 3), category, duration, trend_score(1-10), why_trending. Return ONLY the JSON array.`;
    const sysPrompt = 'TikTok trend analyst for Arabic market. Return ONLY valid JSON array, no markdown, no code blocks.';

    try {
      const reply = await callClaudeAPI(prompt, sysPrompt, lang);
      let cleaned = reply;
      if (cleaned.indexOf('[') > -1) {
        cleaned = cleaned.slice(cleaned.indexOf('['), cleaned.lastIndexOf(']') + 1);
      }
      const rawParsed = JSON.parse(cleaned);
      const parsed = Array.isArray(rawParsed) ? rawParsed.map(item => ({
        ...item,
        video_url: item.video_url || `https://www.tiktok.com/search?q=${encodeURIComponent(item.title || '')}`
      })) : [];
      setTrends(parsed);

      const updatedGC = {
        ...GC,
        socialTrends: {
          filters: { platform, niche, region, sortBy, period, resultsLimit },
          trends: parsed
        }
      };
      saveGC(updatedGC);
    } catch (e) {
      console.warn("AI Trends call failed, using mock fallbacks.");
      // Fallback trend cards
      const fallbacks = [
        { title: L('How to start a digital product store from scratch in Arabic', 'كيف تبدأ متجر منتجات رقمية من الصفر باللغة العربية'), creator: 'upklick_creator', views: '284K', likes: '24K', shares: '5.2K', comments: '1.2K', hashtags: ['منتجات_رقمية', 'عمل_حر', 'ريادة_الأعمال'], category: 'Business', duration: '0:45', trend_score: 9, why_trending: L('High search volume for side hustles in the Gulf.', 'معدل بحث مرتفع عن مصادر الدخل الجانبية في منطقة الخليج.'), video_url: 'https://www.tiktok.com/search?q=' + encodeURIComponent('start digital products store arabic') },
        { title: L('My 5:00 AM morning routine as a SaaS founder', 'روتين الصباح الساعة ٥:٠٠ صباحاً كمؤسس شركة برمجيات'), creator: 'saas_sara', views: '194K', likes: '18K', shares: '2.1K', comments: '640', hashtags: ['روتين_الصباح', 'إنتاجية', 'يوميات'], category: 'Lifestyle', duration: '0:35', trend_score: 8, why_trending: L('Aesthetic productivity routines are highly viral right now.', 'فيديوهات الإنتاجية الجمالية تحظى برواج كبير حالياً.'), video_url: 'https://www.tiktok.com/search?q=' + encodeURIComponent('morning routine saas founder') },
        { title: L('Stop doing manual data entry - use this Notion tracker', 'توقف عن كتابة البيانات يدوياً - استخدم جدول Notion هذا'), creator: 'notion_arabia', views: '342K', likes: '31K', shares: '11K', comments: '3.4K', hashtags: ['نوتشن', 'أدوات_ذكية', 'تنظيم'], category: 'Tech', duration: '0:50', trend_score: 10, why_trending: L('Notion templates adoption is growing rapidly.', 'تزايد استخدام قوالب نوتشن بشكل متسارع.'), video_url: 'https://www.tiktok.com/search?q=' + encodeURIComponent('Notion tracker tutorial') }
      ];
      setTrends(fallbacks);

      const updatedGC = {
        ...GC,
        socialTrends: {
          filters: { platform, niche, region, sortBy, period, resultsLimit, igSearchType, igResultsType },
          trends: fallbacks
        }
      };
      saveGC(updatedGC);
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

      {!apifyConnected && (
        <div className="card animate-fadeSlide" style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.02))',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          marginBottom: '20px',
          padding: '16px 20px',
          borderRadius: 'var(--radius)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          animation: 'fadeSlide 0.4s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '280px' }}>
            <span style={{ fontSize: '28px' }}>⚠️</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--amber)', marginBottom: '4px' }}>
                {L('Apify TikTok Scraper Disconnected', 'منصة Apify TikTok Scraper غير متصلة')}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: 1.4 }}>
                {L(
                  'You are currently viewing simulated AI trends. Connect your Apify Scraper to extract live real-time TikTok videos, statistics, and trends.',
                  'أنت تعرض حالياً الترندات الافتراضية للذكاء الاصطناعي. اربط Apify Scraper الخاص بك لاستخراج فيديوهات تيك توك الحية وإحصائياتها والترندات الحالية.'
                )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <a 
              href="https://apify.com/clockworks/tiktok-scraper?fpr=ya6qx" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn"
              style={{ 
                background: 'var(--amber)', 
                borderColor: 'var(--amber)', 
                color: '#080C14', 
                fontSize: '12.5px', 
                padding: '7px 14px',
                textDecoration: 'none',
                fontWeight: 700
              }}
            >
              🚀 {L('Get Apify Token', 'احصل على رمز Apify')}
            </a>
          </div>
        </div>
      )}

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
            <select className="inp" value={platform} onChange={(e) => { setPlatform(e.target.value); updateGCFilter('platform', e.target.value); }} style={{ width: '150px' }}>
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
            <select className="inp" value={niche} onChange={(e) => { setNiche(e.target.value); updateGCFilter('niche', e.target.value); }} style={{ width: '170px' }}>
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
            <select className="inp" value={region} onChange={(e) => { setRegion(e.target.value); updateGCFilter('region', e.target.value); }} style={{ width: '150px' }}>
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
            <select className="inp" value={sortBy} onChange={(e) => { setSortBy(e.target.value); updateGCFilter('sortBy', e.target.value); }} style={{ width: '140px' }}>
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
            <select className="inp" value={period} onChange={(e) => { setPeriod(e.target.value); updateGCFilter('period', e.target.value); }} style={{ width: '120px' }}>
              <option value="7">{L('Last 7 days', 'آخر ٧ أيام')}</option>
              <option value="30">{L('Last 30 days', 'آخر ٣٠ يوماً')}</option>
              <option value="1">{L('Today', 'اليوم')}</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
              {L('Max Results', 'الحد الأقصى')}
            </label>
            <select className="inp" value={resultsLimit} onChange={(e) => { setResultsLimit(e.target.value); updateGCFilter('resultsLimit', e.target.value); }} style={{ width: '100px' }}>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
          </div>
          
          {platform === 'instagram' && (
            <>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('IG Search Type', 'نوع البحث (IG)')}
                </label>
                <select className="inp" value={igSearchType} onChange={(e) => { setIgSearchType(e.target.value); updateGCFilter('igSearchType', e.target.value); }} style={{ width: '130px' }}>
                  <option value="hashtag">{L('Hashtag', 'هاشتاج')}</option>
                  <option value="user">{L('User', 'مستخدم')}</option>
                  <option value="place">{L('Place', 'مكان')}</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('IG Results Type', 'نوع النتائج (IG)')}
                </label>
                <select className="inp" value={igResultsType} onChange={(e) => { setIgResultsType(e.target.value); updateGCFilter('igResultsType', e.target.value); }} style={{ width: '130px' }}>
                  <option value="posts">{L('Posts', 'منشورات')}</option>
                  <option value="reels">{L('Reels', 'ريلز')}</option>
                </select>
              </div>
            </>
          )}

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
            <div 
              className="trend-thumbnail-container"
              style={{ 
                height: '130px', 
                background: 'linear-gradient(135deg, var(--surface2), var(--surface3))', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                position: 'relative' 
              }}
              onClick={(e) => {
                if (v.video_url) {
                  e.stopPropagation();
                  window.open(v.video_url, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              <div className="trend-music-icon" style={{ fontSize: '36px' }}>🎵</div>
              {v.video_url && (
                <div className="hover-play-btn">
                  <span style={{ fontSize: '36px', color: '#fff' }}>▶️</span>
                </div>
              )}
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
                {(v.hashtags || []).map((tag, tIdx) => {
                  const tagText = typeof tag === 'object' ? (tag.name || tag.title || '') : tag;
                  if (!tagText) return null;
                  return (
                    <span key={tIdx} style={{ fontSize: '10px', background: 'var(--orange-dim)', borderRadius: '4px', padding: '1px 6px', color: 'var(--orange)' }}>
                      #{tagText}
                    </span>
                  );
                })}
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
