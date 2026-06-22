'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';

export default function CommunityHubView() {
  const { lang, L, t, GC, saveGC } = useBusiness();

  const [postText, setPostText] = useState('');
  const communityData = GC.communityHub || {};

  const [feed, setFeed] = useState(communityData.feed && communityData.feed.length ? communityData.feed : [
    {
      id: 1,
      author: 'Sara Hassan',
      role: L('Owner', 'المالك'),
      content: L('Welcome to our new community channel! Let\'s use this space to share wins and strategies.', 'مرحباً بكم في مجتمعنا الجديد! لنستغل هذه المساحة لمشاركة الأرباح والاستراتيجيات.'),
      likes: 12,
      commentsCount: 3,
      date: '2h ago'
    }
  ]);

  const [membersCount, setMembersCount] = useState(communityData.membersCount ?? 124);
  const [activeToday, setActiveToday] = useState(communityData.activeToday ?? 42);

  // Sync state if GC updates
  useEffect(() => {
    if (GC.communityHub) {
      if (GC.communityHub.feed) setFeed(GC.communityHub.feed);
      if (GC.communityHub.membersCount !== undefined) setMembersCount(GC.communityHub.membersCount);
      if (GC.communityHub.activeToday !== undefined) setActiveToday(GC.communityHub.activeToday);
    }
  }, [GC.communityHub]);

  const saveCommunityData = (updatedFields) => {
    const updatedGC = {
      ...GC,
      communityHub: {
        ...(GC.communityHub || {}),
        ...updatedFields
      }
    };
    saveGC(updatedGC);
  };

  const handlePost = () => {
    if (!postText.trim()) return;
    const newPost = {
      id: Date.now(),
      author: GC.profile.name || 'Sara Hassan',
      role: GC.profile.type || L('Member', 'عضو'),
      content: postText,
      likes: 0,
      commentsCount: 0,
      date: L('Just now', 'الآن')
    };

    const newFeed = [newPost, ...feed];
    setFeed(newFeed);
    setPostText('');
    saveCommunityData({ feed: newFeed });
    alert(L('Posted successfully!', 'تم النشر بنجاح!'));
  };

  const handleLike = (id) => {
    const newFeed = feed.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p);
    setFeed(newFeed);
    saveCommunityData({ feed: newFeed });
  };

  return (
    <div className="pg on" id="pg-community">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">👥</span>
          {L('Community Hub', 'مجتمع UpKlick')}
        </div>
        <div className="pg-actions">
          <button className="btn btn-ghost" onClick={() => alert('Community Settings')}>
            ⚙️ {L('Manage', 'إدارة')}
          </button>
          <button className="btn btn-prime" onClick={() => alert('+ New Post')}>
            + {L('New Post', 'منشور جديد')}
          </button>
        </div>
      </div>

      <div className="g4 stagger mb">
        <div className="stat-card">
          <div className="stat-lbl">👥 {L('Members', 'الأعضاء')}</div>
          <div className="stat-val">{membersCount}</div>
          <div className="stat-ch ch-nu">{L('total', 'إجمالي')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">📝 {L('Posts', 'المنشورات')}</div>
          <div className="stat-val">{feed.length}</div>
          <div className="stat-ch ch-nu">{L('this month', 'هذا الشهر')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">💬 {L('Interactions', 'التفاعلات')}</div>
          <div className="stat-val">1.4K</div>
          <div className="stat-ch ch-nu">{L('total', 'إجمالي')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">🔥 {L('Active Today', 'نشطين اليوم')}</div>
          <div className="stat-val ch-up">{activeToday}</div>
          <div className="stat-ch ch-nu">{L('members', 'عضو')}</div>
        </div>
      </div>

      <div className="g2">
        <div>
          <div className="card mb">
            <div className="sec-hd"><div className="sec-title">{L('Post to Community', 'اكتب منشوراً للمجتمع')}</div></div>
            <textarea 
              className="inp" 
              value={postText} 
              onChange={(e) => setPostText(e.target.value)} 
              rows="3" 
              placeholder={L('Share an insight, win, or question with the community...', 'شارك فكرة، إنجاز، أو سؤال مع زملائك في المجتمع...')} 
              style={{ marginBottom: '10px', width: '100%', padding: '10px', background: 'var(--surface2)', color: 'var(--t1)', border: '1px solid var(--edge)', borderRadius: '8px' }}
            ></textarea>
            <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
              <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '5px 12px' }}>📷 {L('Photo', 'صورة')}</button>
              <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '5px 12px' }}>🔗 {L('Link', 'رابط')}</button>
              <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '5px 12px' }}>📊 {L('Poll', 'تصويت')}</button>
              <button 
                className="btn btn-prime" 
                style={{ fontSize: '12px', padding: '5px 16px', marginLeft: lang === 'ar' ? '0' : 'auto', marginRight: lang === 'ar' ? 'auto' : '0' }} 
                onClick={handlePost}
              >
                {L('Post →', 'انشر ←')}
              </button>
            </div>
          </div>
          <div className="card">
            <div className="sec-hd"><div className="sec-title">{L('Trending Topics', 'المواضيع الأكثر رواجاً')}</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} id="cm-trending">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'var(--surface2)', borderRadius: '8px', cursor: 'pointer' }}>
                <span style={{ background: 'var(--orange-d)', color: 'var(--orange)', borderRadius: '6px', padding: '3px 7px', fontSize: '11px', fontWeight: 700 }}>#1</span>
                <span style={{ fontSize: '12.5px', color: 'var(--t1)' }}>{L('AI Tools for Business', 'أدوات الذكاء للأعمال')}</span>
                <span style={{ marginLeft: lang === 'ar' ? '0' : 'auto', marginRight: lang === 'ar' ? 'auto' : '0', fontSize: '11px', color: 'var(--t3)' }}>42 posts</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'var(--surface2)', borderRadius: '8px', cursor: 'pointer' }}>
                <span style={{ background: 'var(--surface3)', color: 'var(--t2)', borderRadius: '6px', padding: '3px 7px', fontSize: '11px', fontWeight: 700 }}>#2</span>
                <span style={{ fontSize: '12.5px', color: 'var(--t1)' }}>{L('Digital Product Launch', 'إطلاق المنتجات الرقمية')}</span>
                <span style={{ marginLeft: lang === 'ar' ? '0' : 'auto', marginRight: lang === 'ar' ? 'auto' : '0', fontSize: '11px', color: 'var(--t3)' }}>38 posts</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'var(--surface2)', borderRadius: '8px', cursor: 'pointer' }}>
                <span style={{ background: 'var(--surface3)', color: 'var(--t2)', borderRadius: '6px', padding: '3px 7px', fontSize: '11px', fontWeight: 700 }}>#3</span>
                <span style={{ fontSize: '12.5px', color: 'var(--t1)' }}>{L('Content Strategy 2026', 'استراتيجية المحتوى ٢٠٢٦')}</span>
                <span style={{ marginLeft: lang === 'ar' ? '0' : 'auto', marginRight: lang === 'ar' ? 'auto' : '0', fontSize: '11px', color: 'var(--t3)' }}>31 posts</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card mb">
            <div className="sec-hd"><div className="sec-title">📰 {L('Community Feed', 'تحديثات الأعضاء')}</div></div>
            <div id="cm-feed" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {feed.map((post) => (
                <div key={post.id} style={{ background: 'var(--surface2)', padding: '12px', borderRadius: '10px', border: '1px solid var(--edge)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#fff' }}>
                      {post.author[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--t1)' }}>{post.author}</div>
                      <div style={{ fontSize: '10px', color: 'var(--t3)' }}>{post.role} · {post.date}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--t1)', lineHeight: 1.5, marginBottom: '8px', whiteSpace: 'pre-line' }}>
                    {post.content}
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={() => handleLike(post.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11.5px', color: 'var(--t2)' }}
                    >
                      ❤️ {post.likes} {L('Likes', 'إعجاب')}
                    </button>
                    <span style={{ fontSize: '11.5px', color: 'var(--t3)' }}>
                      💬 {post.commentsCount} {L('Comments', 'تعليق')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="sec-hd"><div className="sec-title">🏆 {L('Top Members', 'الأعضاء الأكثر نشاطاً')}</div></div>
            <div id="cm-top-members">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--orange-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: 'var(--orange)' }}>
                    F
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 500 }}>Fatima Al-Harbi</div>
                  <span className="badge b-green" style={{ marginLeft: lang === 'ar' ? '0' : 'auto', marginRight: lang === 'ar' ? 'auto' : '0' }}>140 pts</span>
                </div>
              </div>
            </div>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: '8px', fontSize: '12.5px' }} onClick={() => alert('Invite link copied')}>
              📧 {L('Invite Members', 'دعوة الأعضاء')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
