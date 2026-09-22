'use client';

import React, { useState, useMemo } from 'react';
import {
  Home,
  Users,
  Search,
  Sun,
  Moon,
  Grid,
  Bell,
  Video,
  Settings,
  Plus,
  Calendar,
  Lock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  ExternalLink,
  Copy,
  Check,
  X,
  Megaphone,
  Heart,
  MessageSquare,
  Share2,
  Clock,
  Mail,
  Shield,
  BookOpen,
  Play,
  Layers
} from 'lucide-react';

export default function CommunityGroupExperience({
  group,
  onClose,
  coachName = 'Mohamed Hesham',
  userData = {},
  coachId = 'demo-coach',
  isRTL = false,
  showToast = () => {},
  courses = [],
  students = [],
  communities = [],
  onUpdateGroup = () => {},
  currentTheme,
  onToggleTheme
}) {
  // Theme state: defaults to currentTheme or saved theme, or dark if dashboard is dark
  const [theme, setTheme] = useState(() => {
    if (currentTheme) return currentTheme;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('upklick_theme');
      if (saved) return saved;
      const docTheme = document.documentElement.getAttribute('data-theme') || document.body.getAttribute('data-theme');
      if (docTheme) return docTheme;
    }
    return 'dark'; // matches UpKlick dashboard default
  });

  // Sync with external theme if changed outside
  React.useEffect(() => {
    if (currentTheme && currentTheme !== theme) {
      setTheme(currentTheme);
    }
  }, [currentTheme]);

  const isLight = theme === 'light';

  const toggleTheme = (targetTheme) => {
    const next = targetTheme || (isLight ? 'dark' : 'light');
    setTheme(next);
    if (onToggleTheme) onToggleTheme(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('upklick_theme', next);
      document.body.setAttribute('data-theme', next);
      document.documentElement.setAttribute('data-theme', next);
    }
  };

  // Navigation state
  const [activeTab, setActiveTab] = useState('discussion'); // 'discussion' | 'learning' | 'events' | 'leaderboard' | 'members' | 'about'
  const [activeChannel, setActiveChannel] = useState('home');
  const [channels, setChannels] = useState([
    { id: 'home', name: 'Home', icon: 'home' },
    { id: 'announcements', name: 'Announcements', icon: 'megaphone' }
  ]);

  // Modals state
  const [showAddChannelModal, setShowAddChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');

  const [showPostModal, setShowPostModal] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [newPostChannel, setNewPostChannel] = useState('home');

  const [showGoLiveModal, setShowGoLiveModal] = useState(false);
  const [goLiveForm, setGoLiveForm] = useState({ title: 'Community Live Q&A', link: '' });

  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    date: '2026-09-24',
    time: '18:00',
    link: '',
    description: ''
  });

  const [showLinkCourseModal, setShowLinkCourseModal] = useState(false);
  const [linkedCourseIds, setLinkedCourseIds] = useState([]);

  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [rewardForm, setRewardForm] = useState({ level: 2, title: '' });
  const [rewardsList, setRewardsList] = useState([
    { level: 2, title: 'VIP Resource Library Access' },
    { level: 3, title: 'Private 1-on-1 Strategy Pass' }
  ]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    name: group.name || '',
    slug: group.slug || '',
    description: group.description || '',
    discovery: group.discovery !== false
  });

  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: '1',
      sender: coachName,
      initials: 'SS',
      text: 'Welcome to our official community! Feel free to ask questions and connect with fellow members.',
      time: 'Just now',
      isMe: true
    }
  ]);

  // Posts Feed State
  const [posts, setPosts] = useState([]);

  // Events Calendar State
  const [events, setEvents] = useState([]);
  const [calViewMode, setCalViewMode] = useState('month'); // 'list' | 'week' | 'month' | 'recordings'
  const [calDate, setCalDate] = useState(new Date(2026, 8, 22)); // September 22, 2026

  // Members Filter State
  const [memberFilter, setMemberFilter] = useState('Active'); // 'Active' | 'Admins' | 'Contributors' | 'Requested' | 'Banned'
  const [memberSearch, setMemberSearch] = useState('');

  // Styling Tokens for Dark Mode & White Mode
  const cBg = isLight ? '#f8fafc' : '#0b0f19';
  const cCardBg = isLight ? '#ffffff' : '#111827';
  const cBorder = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)';
  const cText = isLight ? '#0f172a' : '#f8fafc';
  const cTextSub = isLight ? '#64748b' : '#94a3b8';
  const cTextMuted = isLight ? '#94a3b8' : '#64748b';
  const cNavy = isLight ? '#1a365d' : '#2563eb'; // Deep ClientClub navy in white mode, vibrant sapphire blue in dark mode
  const cActiveTabIndicator = isLight ? '#1a365d' : '#38bdf8';
  const cShadow = isLight ? '0 4px 20px rgba(0,0,0,0.06)' : '0 20px 40px rgba(0,0,0,0.4)';
  const cHover = isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.06)';

  const authorInitials = (coachName || 'Mohamed Hesham')
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'SS';

  const authorHandle = `@${(userData?.username || coachName || 'mohamed-hesham').toLowerCase().replace(/[^a-z0-9]/g, '-')}-0oJ8Mp`;
  const authorEmail = userData?.email || 'mohamedhesham011010@gmail.com';

  // Handlers
  const handleCreatePost = (e) => {
    e?.preventDefault();
    if (!newPostText.trim()) return;
    const newP = {
      id: `post_${Date.now()}`,
      author: coachName,
      authorHandle,
      initials: authorInitials,
      channelId: newPostChannel,
      channelName: channels.find(c => c.id === newPostChannel)?.name || 'Home',
      content: newPostText.trim(),
      likes: 0,
      liked: false,
      comments: [],
      createdAt: 'Just now'
    };
    setPosts([newP, ...posts]);
    setNewPostText('');
    setShowPostModal(false);
    showToast(isRTL ? 'تم نشر المنشور بنجاح!' : 'Post published successfully!');
  };

  const handleLikePost = (postId) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        const liked = !p.liked;
        return {
          ...p,
          liked,
          likes: liked ? (p.likes || 0) + 1 : Math.max(0, (p.likes || 1) - 1)
        };
      }
      return p;
    }));
  };

  const handleAddChannel = (e) => {
    e?.preventDefault();
    if (!newChannelName.trim()) return;
    const id = newChannelName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    setChannels([...channels, { id, name: newChannelName.trim(), icon: 'message' }]);
    setActiveChannel(id);
    setNewChannelName('');
    setShowAddChannelModal(false);
    showToast(isRTL ? 'تمت إضافة القناة بنجاح!' : 'Channel created successfully!');
  };

  const handleCreateEvent = (e) => {
    e?.preventDefault();
    if (!eventForm.title.trim()) return;
    const newEv = {
      id: `ev_${Date.now()}`,
      ...eventForm,
      host: coachName,
      createdAt: 'Just now'
    };
    setEvents([...events, newEv]);
    setEventForm({ title: '', date: '2026-09-24', time: '18:00', link: '', description: '' });
    setShowEventModal(false);
    showToast(isRTL ? 'تمت جدولة الفعالية بنجاح!' : 'Event scheduled successfully!');
  };

  const handleLinkCourse = (courseId) => {
    if (!courseId) return;
    if (!linkedCourseIds.includes(courseId)) {
      setLinkedCourseIds([...linkedCourseIds, courseId]);
      showToast(isRTL ? 'تم ربط الكورس بالمجتمع!' : 'Course linked to community!');
    }
    setShowLinkCourseModal(false);
  };

  const handleAddReward = (e) => {
    e?.preventDefault();
    if (!rewardForm.title.trim()) return;
    setRewardsList([...rewardsList, { level: Number(rewardForm.level), title: rewardForm.title.trim() }]);
    setRewardForm({ level: 2, title: '' });
    setShowRewardsModal(false);
    showToast(isRTL ? 'تمت إضافة المكافأة!' : 'Level reward added!');
  };

  const handleSendChat = (e) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: coachName,
      initials: authorInitials,
      text: chatInput.trim(),
      time: 'Just now',
      isMe: true
    };
    setChatMessages([...chatMessages, newMsg]);
    setChatInput('');
  };

  const handleSaveSettings = (e) => {
    e?.preventDefault();
    const updated = {
      ...group,
      name: settingsForm.name.trim() || group.name,
      slug: settingsForm.slug.trim() || group.slug,
      description: settingsForm.description.trim(),
      discovery: settingsForm.discovery
    };
    onUpdateGroup(updated);
    setShowSettingsModal(false);
    showToast(isRTL ? 'تم تحديث إعدادات المجتمع!' : 'Group settings saved!');
  };

  const copyGroupLink = () => {
    const url = `${window.location.origin}/portal/${userData?.username || 'coach'}/community/${group.slug || 'group'}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    showToast(isRTL ? 'تم نسخ رابط المجتمع!' : 'Group link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Calendar calculations for September 2026
  const calendarDays = useMemo(() => {
    const cells = [];
    cells.push({ day: 30, isCurrentMonth: false, dateStr: '2026-08-30' });
    cells.push({ day: 31, isCurrentMonth: false, dateStr: '2026-08-31' });
    for (let d = 1; d <= 30; d++) {
      cells.push({
        day: d,
        isCurrentMonth: true,
        isToday: d === 22,
        dateStr: `2026-09-${d < 10 ? '0' + d : d}`
      });
    }
    for (let d = 1; d <= 3; d++) {
      cells.push({ day: d, isCurrentMonth: false, dateStr: `2026-10-0${d}` });
    }
    return cells;
  }, []);

  return (
    <div style={{
      background: cBg,
      color: cText,
      borderRadius: '16px',
      border: `1px solid ${cBorder}`,
      boxShadow: isLight ? '0 4px 20px rgba(0,0,0,0.06)' : '0 20px 40px rgba(0,0,0,0.4)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '860px',
      transition: 'background 0.2s, color 0.2s',
      fontFamily: 'inherit'
    }}>

      {/* ========================================================================= */}
      {/* 1. TOP APP BAR                                                            */}
      {/* ========================================================================= */}
      <div style={{
        height: '60px',
        background: cCardBg,
        borderBottom: `1px solid ${cBorder}`,
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Left: Home Icon + Group Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onClose}
            title={isRTL ? 'الرجوع إلى المجتمعات' : 'Return to Groups Hub'}
            style={{
              background: 'transparent',
              border: 'none',
              color: cTextSub,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '6px',
              transition: 'color 0.15s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#2563eb'}
            onMouseOut={(e) => e.currentTarget.style.color = cTextSub}
          >
            <Home size={19} />
          </button>

          {/* Group Name Selector Capsule */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '8px'
          }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '800'
            }}>
              {group.logoUrl ? (
                <img src={group.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <Users size={14} />
              )}
            </div>
            <span style={{ fontSize: '14px', fontWeight: '800', color: cText }}>
              {group.name}
            </span>
            <ChevronDown size={14} style={{ color: cTextSub }} />
          </div>
        </div>

        {/* Center: Search Capsule */}
        <div style={{
          width: '380px',
          maxWidth: '420px',
          background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${cBorder}`,
          borderRadius: '9999px',
          padding: '6px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Search size={15} style={{ color: cTextMuted }} />
          <input
            type="text"
            placeholder={isRTL ? 'بحث...' : 'Search'}
            style={{
              background: 'transparent',
              border: 'none',
              color: cText,
              fontSize: '13px',
              width: '100%',
              outline: 'none'
            }}
          />
        </div>

        {/* Right: Theme Toggle Capsule, Grid, Bell, User Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Theme Switcher Pill (Dark Mode / White Mode) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.06)',
            border: `1px solid ${cBorder}`,
            borderRadius: '9999px',
            padding: '3px',
            gap: '2px'
          }}>
            <button
              onClick={() => toggleTheme('light')}
              title={isRTL ? 'الوضع الفاتح (White Mode)' : 'White / Light Mode'}
              style={{
                background: isLight ? '#ffffff' : 'transparent',
                color: isLight ? '#0f172a' : cTextSub,
                border: 'none',
                borderRadius: '9999px',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Sun size={13} color={isLight ? '#f59e0b' : '#94a3b8'} />
              <span>{isRTL ? 'فاتح' : 'Light'}</span>
            </button>
            <button
              onClick={() => toggleTheme('dark')}
              title={isRTL ? 'الوضع الداكن (Dark Mode)' : 'Dark Mode'}
              style={{
                background: !isLight ? '#2563eb' : 'transparent',
                color: !isLight ? '#ffffff' : cTextSub,
                border: 'none',
                borderRadius: '9999px',
                padding: '4px 10px',
                fontSize: '11.5px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: !isLight ? '0 1px 4px rgba(37, 99, 235, 0.4)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Moon size={13} color={!isLight ? '#ffffff' : '#94a3b8'} />
              <span>{isRTL ? 'داكن' : 'Dark'}</span>
            </button>
          </div>

          <button
            onClick={() => showToast(isRTL ? 'قائمة تطبيقات المجتمع' : 'App Switcher')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: cTextSub, padding: '4px' }}
          >
            <Grid size={17} />
          </button>

          <button
            onClick={() => showToast(isRTL ? 'لا توجد إشعارات جديدة' : 'No new notifications')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: cTextSub, padding: '4px', position: 'relative' }}
          >
            <Bell size={17} />
            <span style={{ position: 'absolute', top: '2px', right: '2px', width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
          </button>

          {/* User Avatar Circle (SS) */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#e11d48',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '800',
              boxShadow: '0 2px 6px rgba(225, 29, 72, 0.35)',
              cursor: 'pointer'
            }}
            title={coachName}
          >
            {authorInitials}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUB-NAV TABS BAR                                                       */}
      {/* ========================================================================= */}
      <div style={{
        background: cCardBg,
        borderBottom: `1px solid ${cBorder}`,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Horizontal Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { id: 'discussion', label: isRTL ? 'المناقشات' : 'Discussion' },
            { id: 'learning', label: isRTL ? 'التعليم' : 'Learning' },
            { id: 'events', label: isRTL ? 'الفعاليات' : 'Events' },
            { id: 'leaderboard', label: isRTL ? 'لوحة المتصدرين' : 'Leaderboard' },
            { id: 'members', label: isRTL ? 'الأعضاء' : 'Members' },
            { id: 'about', label: isRTL ? 'عن المجتمع' : 'About' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? `2px solid ${cActiveTabIndicator}` : '2px solid transparent',
                  color: isActive ? (isLight ? '#0f172a' : '#ffffff') : cTextSub,
                  padding: '14px 18px',
                  fontSize: '13.5px',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Pill: Chat Button */}
        <button
          onClick={() => setShowChat(!showChat)}
          style={{
            background: cNavy,
            color: '#ffffff',
            border: 'none',
            borderRadius: '9999px',
            padding: '6px 20px',
            fontSize: '12.5px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: isLight ? '0 2px 8px rgba(26, 54, 93, 0.3)' : '0 2px 8px rgba(37, 99, 235, 0.4)'
          }}
        >
          <span>{isRTL ? 'المحادثة' : 'Chat'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN WORKSPACE / CONTENT AREA                                           */}
      {/* ========================================================================= */}
      <div style={{
        padding: '24px 28px',
        display: 'flex',
        gap: '24px',
        flex: 1,
        background: cBg
      }}>

        {/* LEFT CHANNELS SIDEBAR */}
        <div style={{
          width: '210px',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0
        }}>
          {/* Channels List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {channels.map(chan => {
              const isActive = activeChannel === chan.id;
              return (
                <button
                  key={chan.id}
                  onClick={() => setActiveChannel(chan.id)}
                  style={{
                    background: isActive ? cNavy : 'transparent',
                    color: isActive ? '#ffffff' : cTextSub,
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    fontSize: '13px',
                    fontWeight: isActive ? '700' : '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    textAlign: isRTL ? 'right' : 'left',
                    transition: 'all 0.15s'
                  }}
                >
                  {chan.icon === 'megaphone' ? <Megaphone size={16} /> : <Home size={16} />}
                  <span>{chan.name}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Add Channel Button */}
          <div style={{ marginTop: 'auto', paddingTop: '340px' }}>
            <button
              onClick={() => setShowAddChannelModal(true)}
              style={{
                width: '100%',
                background: cNavy,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Plus size={14} />
              <span>{isRTL ? 'إضافة قناة' : '+ ADD CHANNEL'}</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUB-VIEW 1: DISCUSSION TAB (Screenshot 1)                                  */}
        {/* ========================================================================= */}
        {activeTab === 'discussion' && (
          <>
            {/* Center Feed Column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Post Composer Bar */}
              <div
                style={{
                  background: cCardBg,
                  border: `1px solid ${cBorder}`,
                  borderRadius: '12px',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.04)' : 'none'
                }}
              >
                {/* User Avatar */}
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: '#e11d48',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '800',
                  flexShrink: 0
                }}>
                  {authorInitials}
                </div>

                {/* Input Placeholder Clickable */}
                <div
                  onClick={() => setShowPostModal(true)}
                  style={{
                    flex: 1,
                    color: cTextMuted,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    padding: '8px 4px'
                  }}
                >
                  {isRTL ? `ما الذي يدور في ذهنك، ${coachName.split(' ')[0]}؟` : `What's on your mind, ${coachName.split(' ')[0].toLowerCase()}?`}
                </div>

                {/* Go Live Button */}
                <button
                  onClick={() => setShowGoLiveModal(true)}
                  style={{
                    background: cCardBg,
                    border: `1px solid ${cBorder}`,
                    borderRadius: '8px',
                    padding: '7px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#dc2626',
                    fontWeight: '700',
                    fontSize: '12.5px',
                    cursor: 'pointer'
                  }}
                >
                  <Video size={15} color="#dc2626" />
                  <span>{isRTL ? 'بث مباشر' : 'Go Live'}</span>
                </button>
              </div>

              {/* Feed Content */}
              {posts.length === 0 ? (
                /* Empty State with Kite Flyer Illustration matching Screenshot 1 */
                <div style={{
                  padding: '90px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}>
                  {/* Kite Flyer Line Art SVG */}
                  <svg width="180" height="150" viewBox="0 0 200 160" fill="none" style={{ opacity: isLight ? 0.85 : 0.95 }}>
                    <polygon points="40,20 60,10 50,35 30,25" stroke={isLight ? '#94a3b8' : '#64748b'} strokeWidth="1.5" fill="none" />
                    <line x1="45" y1="15" x2="45" y2="30" stroke={isLight ? '#94a3b8' : '#64748b'} strokeWidth="1" />
                    <line x1="35" y1="22" x2="55" y2="22" stroke={isLight ? '#94a3b8' : '#64748b'} strokeWidth="1" />
                    <path d="M40 30 Q35 40 42 45 T38 55" stroke={isLight ? '#cbd5e1' : '#334155'} strokeWidth="1.2" fill="none" />
                    <path d="M45 28 Q80 70 120 95" stroke={isLight ? '#cbd5e1' : '#334155'} strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
                    <path d="M90 140 Q130 135 170 140" stroke={isLight ? '#cbd5e1' : '#334155'} strokeWidth="1.5" fill="none" />
                    <path d="M100 137 L102 133 L104 137" stroke={isLight ? '#94a3b8' : '#64748b'} strokeWidth="1.2" />
                    <path d="M150 138 L152 134 L154 138" stroke={isLight ? '#94a3b8' : '#64748b'} strokeWidth="1.2" />
                    <circle cx="126" cy="78" r="6" stroke={isLight ? '#475569' : '#94a3b8'} strokeWidth="2" fill="none" />
                    <line x1="126" y1="84" x2="124" y2="108" stroke={isLight ? '#475569' : '#94a3b8'} strokeWidth="2" />
                    <line x1="125" y1="90" x2="120" y2="95" stroke={isLight ? '#475569' : '#94a3b8'} strokeWidth="2" />
                    <line x1="125" y1="90" x2="132" y2="98" stroke={isLight ? '#475569' : '#94a3b8'} strokeWidth="2" />
                    <line x1="124" y1="108" x2="114" y2="132" stroke={isLight ? '#475569' : '#94a3b8'} strokeWidth="2" />
                    <line x1="124" y1="108" x2="136" y2="132" stroke={isLight ? '#475569' : '#94a3b8'} strokeWidth="2" />
                  </svg>

                  <div style={{ fontSize: '14.5px', color: cTextSub, fontWeight: '600', marginTop: '14px' }}>
                    {isRTL ? 'لم يتم العثور على منشورات' : 'No posts found'}
                  </div>
                </div>
              ) : (
                /* Posts List */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {posts.map(post => (
                    <div
                      key={post.id}
                      style={{
                        background: cCardBg,
                        border: `1px solid ${cBorder}`,
                        borderRadius: '12px',
                        padding: '18px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.03)' : 'none'
                      }}
                    >
                      {/* Post Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: '#e11d48',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '13px'
                          }}>
                            {post.initials || 'SS'}
                          </div>
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: '800', color: cText }}>
                              {post.author}
                            </div>
                            <div style={{ fontSize: '11px', color: cTextSub, display: 'flex', gap: '6px' }}>
                              <span>{post.authorHandle}</span>
                              <span>•</span>
                              <span>{post.createdAt}</span>
                            </div>
                          </div>
                        </div>

                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.08)',
                          color: cTextSub
                        }}>
                          #{post.channelName}
                        </span>
                      </div>

                      {/* Post Body */}
                      <div style={{ fontSize: '13.5px', color: cText, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                        {post.content}
                      </div>

                      {/* Post Actions Row */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '18px',
                        borderTop: `1px solid ${cBorder}`,
                        paddingTop: '12px',
                        fontSize: '12.5px',
                        color: cTextSub
                      }}>
                        <button
                          onClick={() => handleLikePost(post.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: post.liked ? '#ef4444' : cTextSub,
                            fontWeight: '600'
                          }}
                        >
                          <Heart size={15} fill={post.liked ? '#ef4444' : 'none'} color={post.liked ? '#ef4444' : cTextSub} />
                          <span>{post.likes || 0}</span>
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                          <MessageSquare size={15} />
                          <span>{post.comments?.length || 0}</span>
                        </div>

                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(window.location.href);
                            showToast(isRTL ? 'تم نسخ رابط المنشور!' : 'Post link copied!');
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: cTextSub,
                            marginLeft: 'auto'
                          }}
                        >
                          <Share2 size={15} />
                          <span>{isRTL ? 'مشاركة' : 'Share'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Sidebar Column (Screenshots 1 & 5) */}
            <div style={{ width: '310px', display: 'flex', flexDirection: 'column', gap: '20px', flexShrink: 0 }}>
              {/* Card 1: Group Identity Card */}
              <div style={{
                background: cCardBg,
                border: `1px solid ${cBorder}`,
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.04)' : 'none'
              }}>
                {/* Sunset Cover Banner */}
                <div style={{
                  height: '130px',
                  background: group.coverImageUrl
                    ? `url(${group.coverImageUrl}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #ec4899 0%, #f97316 50%, #eab308 100%)'
                }} />

                {/* Card Body */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '900', color: cText }}>
                      {group.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: cTextSub }}>
                      <Users size={13} />
                      <span>{isRTL ? 'مجموعة عامة' : 'Public Group'}</span>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '12.5px', color: cTextSub, lineHeight: '1.5' }}>
                    {group.description || 'Welcome to our official community space.'}
                  </p>

                  {/* 3-Column Stats Row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    textAlign: 'center',
                    borderTop: `1px solid ${cBorder}`,
                    borderBottom: `1px solid ${cBorder}`,
                    padding: '12px 0'
                  }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '900', color: cText }}>{group.memberCount || 1}</div>
                      <div style={{ fontSize: '11px', color: cTextSub }}>{isRTL ? 'أعضاء' : 'Members'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '900', color: cText }}>{posts.length}</div>
                      <div style={{ fontSize: '11px', color: cTextSub }}>{isRTL ? 'منشورات' : 'Posts'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '900', color: cText }}>1</div>
                      <div style={{ fontSize: '11px', color: cTextSub }}>{isRTL ? 'مدير' : 'Admin'}</div>
                    </div>
                  </div>

                  {/* Author / Creator Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#e11d48',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: '800'
                    }}>
                      {authorInitials}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
                    <button
                      onClick={() => setShowSettingsModal(true)}
                      style={{
                        width: '100%',
                        background: isLight ? '#ffffff' : 'rgba(255,255,255,0.06)',
                        border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '8px',
                        padding: '10px',
                        fontSize: '12.5px',
                        fontWeight: '800',
                        letterSpacing: '0.5px',
                        color: isLight ? '#334155' : '#f8fafc',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {isRTL ? 'الإعدادات' : 'SETTINGS'}
                    </button>

                    <button
                      onClick={() => setShowInviteModal(true)}
                      style={{
                        width: '100%',
                        background: cNavy,
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '11px',
                        fontSize: '12.5px',
                        fontWeight: '800',
                        letterSpacing: '0.5px',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      {isRTL ? 'دعوة الأعضاء' : 'INVITE MEMBERS'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Leaderboard (30-days) Widget */}
              <div style={{
                background: cCardBg,
                border: `1px solid ${cBorder}`,
                borderRadius: '12px',
                padding: '18px 20px',
                boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <div style={{ fontSize: '13.5px', fontWeight: '800', color: cText }}>
                  {isRTL ? 'لوحة الصدارة (30 يوماً)' : 'Leaderboard (30-days)'}
                </div>

                <div style={{
                  padding: '24px 0',
                  textAlign: 'center',
                  fontSize: '12.5px',
                  color: cTextMuted
                }}>
                  {isRTL ? 'لا يوجد نشاط لعرضه' : 'No activity to show'}
                </div>

                <div
                  onClick={() => setActiveTab('leaderboard')}
                  style={{
                    fontSize: '12.5px',
                    color: '#2563eb',
                    fontWeight: '700',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {isRTL ? 'عرض جميع لوحات الصدارة' : 'See all leaderboards'}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* SUB-VIEW 2: LEARNING TAB (Screenshot 2)                                   */}
        {/* ========================================================================= */}
        {activeTab === 'learning' && (
          <div style={{ flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {courses
                .filter(c => linkedCourseIds.includes(c.id))
                .map(course => (
                  <div
                    key={course.id}
                    style={{
                      background: cCardBg,
                      border: `1px solid ${cBorder}`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.04)' : 'none'
                    }}
                  >
                    <div style={{
                      height: '140px',
                      background: course.thumbnailUrl
                        ? `url(${course.thumbnailUrl}) center/cover no-repeat`
                        : 'linear-gradient(135deg, #1e1b4b, #4338ca)',
                      position: 'relative'
                    }} />
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: cText }}>
                        {course.title}
                      </h4>
                      <div style={{ fontSize: '12px', color: cTextSub }}>
                        {course.modules?.length || 0} {isRTL ? 'فصول' : 'modules'} • {course.category || 'Business'}
                      </div>
                      <button
                        onClick={() => showToast(isRTL ? 'فتح الكورس للتعلم' : 'Opening course viewer...')}
                        style={{
                          marginTop: 'auto',
                          background: cNavy,
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px',
                          fontSize: '12.5px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {isRTL ? 'بدء التعلم' : 'Start Course'}
                      </button>
                    </div>
                  </div>
                ))}

              {/* Dashed Add Course Card (Screenshot 2) */}
              <div
                onClick={() => setShowLinkCourseModal(true)}
                style={{
                  minHeight: '280px',
                  border: `2px dashed ${isLight ? '#cbd5e1' : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: cTextSub,
                  transition: 'border-color 0.2s, background 0.2s',
                  background: 'transparent'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb';
                  e.currentTarget.style.color = '#2563eb';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = isLight ? '#cbd5e1' : 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.color = cTextSub;
                }}
              >
                <Plus size={24} style={{ marginBottom: '8px' }} />
                <span style={{ fontSize: '15px', fontWeight: '800' }}>
                  {isRTL ? '+ إضافة كورس' : '+ Add Course'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-VIEW 3: EVENTS TAB (Screenshot 3)                                     */}
        {/* ========================================================================= */}
        {activeTab === 'events' && (
          <div style={{ flex: 1, display: 'flex', gap: '24px' }}>
            {/* Left Events Summary Column (Screenshot 3) */}
            <div style={{
              width: '200px',
              display: 'flex',
              flexDirection: 'column',
              gap: '30px',
              flexShrink: 0
            }}>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '800', color: cText, marginBottom: '24px' }}>
                  {isRTL ? 'لا توجد فعاليات قادمة' : 'No Upcoming Events'}
                </div>

                {/* Megaphone Coming Up Events Illustration */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <svg width="100" height="90" viewBox="0 0 100 90" fill="none" style={{ opacity: isLight ? 0.85 : 0.95 }}>
                    <path d="M25 45 L50 25 L50 65 Z" stroke={isLight ? '#64748b' : '#94a3b8'} strokeWidth="2" fill="none" />
                    <rect x="50" y="32" width="22" height="26" rx="2" stroke={isLight ? '#64748b' : '#94a3b8'} strokeWidth="2" fill="none" />
                    <path d="M72 40 Q80 45 72 50" stroke={isLight ? '#94a3b8' : '#64748b'} strokeWidth="1.5" />
                    <path d="M76 35 Q88 45 76 55" stroke={isLight ? '#94a3b8' : '#64748b'} strokeWidth="1.5" />
                    <line x1="38" y1="55" x2="32" y2="70" stroke={isLight ? '#64748b' : '#94a3b8'} strokeWidth="2.5" />
                  </svg>
                  <div style={{ fontSize: '12px', color: cTextSub, fontWeight: '700', marginTop: '10px' }}>
                    {isRTL ? 'فعاليات قادمة قريباً!' : 'Coming up events!'}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '800', color: cTextMuted }}>
                  {isRTL ? 'لا توجد فعاليات سابقة' : 'No Past Events'}
                </div>
              </div>
            </div>

            {/* Center Calendar Month Grid (Screenshot 3) */}
            <div style={{
              flex: 1,
              background: cCardBg,
              border: `1px solid ${cBorder}`,
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Calendar Top Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: cText }}>
                      September 2026
                    </h3>
                    <div style={{ fontSize: '11px', color: cTextSub }}>
                      Africa/Cairo (+03:00)
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={() => showToast('Previous month')}
                      style={{ background: 'transparent', border: `1px solid ${cBorder}`, borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', color: cText }}
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => showToast('Next month')}
                      style={{ background: 'transparent', border: `1px solid ${cBorder}`, borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', color: cText }}
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <button
                    onClick={() => showToast('Current Date: Sep 22 2026')}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${cBorder}`,
                      borderRadius: '6px',
                      padding: '5px 12px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: cText,
                      cursor: 'pointer'
                    }}
                  >
                    Today
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                    padding: '3px',
                    border: `1px solid ${cBorder}`
                  }}>
                    {['Week', 'Month', 'Recordings'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => setCalViewMode(mode.toLowerCase())}
                        style={{
                          background: calViewMode === mode.toLowerCase() ? cCardBg : 'transparent',
                          color: calViewMode === mode.toLowerCase() ? cText : cTextSub,
                          border: 'none',
                          borderRadius: '6px',
                          padding: '4px 12px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          boxShadow: calViewMode === mode.toLowerCase() && isLight ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                        }}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowEventModal(true)}
                    style={{
                      background: cNavy,
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '7px 16px',
                      fontSize: '12.5px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Plus size={14} />
                    <span>{isRTL ? 'إضافة فعالية' : '+ Event'}</span>
                  </button>
                </div>
              </div>

              {/* 7-Column Calendar Grid */}
              <div style={{ border: `1px solid ${cBorder}`, borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)',
                  borderBottom: `1px solid ${cBorder}`,
                  textAlign: 'center',
                  fontSize: '11px',
                  fontWeight: '800',
                  color: cTextSub,
                  padding: '8px 0'
                }}>
                  <div>SUN</div>
                  <div>MON</div>
                  <div>TUE</div>
                  <div>WED</div>
                  <div>THU</div>
                  <div>FRI</div>
                  <div>SAT</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                  {calendarDays.map((cell, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setEventForm({ ...eventForm, date: cell.dateStr });
                        setShowEventModal(true);
                      }}
                      style={{
                        minHeight: '85px',
                        borderRight: (idx + 1) % 7 !== 0 ? `1px solid ${cBorder}` : 'none',
                        borderBottom: idx < 28 ? `1px solid ${cBorder}` : 'none',
                        padding: '8px',
                        background: cell.isToday ? (isLight ? 'rgba(37, 99, 235, 0.04)' : 'rgba(37, 99, 235, 0.12)') : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '4px' }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: cell.isToday ? '900' : '600',
                          color: cell.isCurrentMonth ? (cell.isToday ? '#2563eb' : cText) : cTextMuted,
                          width: cell.isToday ? '20px' : 'auto',
                          height: cell.isToday ? '20px' : 'auto',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: cell.isToday ? 'rgba(37, 99, 235, 0.12)' : 'transparent'
                        }}>
                          {cell.day}
                        </span>
                      </div>

                      {events
                        .filter(e => e.date === cell.dateStr)
                        .map(ev => (
                          <div
                            key={ev.id}
                            style={{
                              background: '#2563eb',
                              color: '#ffffff',
                              borderRadius: '4px',
                              padding: '2px 5px',
                              fontSize: '10px',
                              fontWeight: '700',
                              marginTop: '2px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {ev.title}
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-VIEW 4: LEADERBOARD TAB (Screenshot 4)                                */}
        {/* ========================================================================= */}
        {activeTab === 'leaderboard' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Top Card: Level Avatar & 9-Level Progression Ladder */}
            <div style={{
              background: cCardBg,
              border: `1px solid ${cBorder}`,
              borderRadius: '16px',
              padding: '32px 40px',
              boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
              display: 'grid',
              gridTemplateColumns: 'minmax(240px, 320px) 1fr',
              gap: '40px',
              alignItems: 'center'
            }}>
              {/* Left Profile Section */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{
                  position: 'relative',
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  border: isLight ? '3px dashed #cbd5e1' : '3px dashed rgba(255, 255, 255, 0.2)',
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px'
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: isLight ? '#ffffff' : '#1e293b',
                    border: `1px solid ${cBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '26px', fontWeight: '900', color: '#e11d48', fontStyle: 'italic', letterSpacing: '-1px' }}>
                      SS
                    </span>
                  </div>

                  <div style={{
                    position: 'absolute',
                    bottom: '0px',
                    right: '4px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    background: cNavy,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '900',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                  }}>
                    1
                  </div>
                </div>

                <div style={{ fontSize: '17px', fontWeight: '900', color: cText, marginBottom: '2px' }}>
                  {coachName.toLowerCase()}
                </div>
                <div style={{ fontSize: '12.5px', color: cTextSub }}>
                  Level 1
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: cTextMuted, marginTop: '4px' }}>
                  <span>+5 points to level up</span>
                  <Info size={12} style={{ cursor: 'help' }} />
                </div>
              </div>

              {/* Right 9-Level Progression Ladder (2 Columns) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 36px' }}>
                {[
                  { level: 1, pct: '100%', unlocked: true },
                  { level: 6, pct: '0%', unlocked: false },
                  { level: 2, pct: '0%', unlocked: false },
                  { level: 7, pct: '0%', unlocked: false },
                  { level: 3, pct: '0%', unlocked: false },
                  { level: 8, pct: '0%', unlocked: false },
                  { level: 4, pct: '0%', unlocked: false },
                  { level: 9, pct: '0%', unlocked: false },
                  { level: 5, pct: '0%', unlocked: false }
                ].sort((a, b) => a.level - b.level).map(lvl => (
                  <div key={lvl.level} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {lvl.unlocked ? (
                      <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: cNavy,
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '800'
                      }}>
                        {lvl.level}
                      </div>
                    ) : (
                      <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.06)',
                        color: cTextMuted,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Lock size={12} />
                      </div>
                    )}

                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: lvl.unlocked ? cText : cTextSub }}>
                        Level {lvl.level}
                      </div>
                      <div style={{ fontSize: '11px', color: cTextMuted }}>
                        {lvl.pct} of members
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Section: Timestamp & 3 Leaderboard Cards */}
            <div>
              <div style={{ fontSize: '12px', color: cTextMuted, marginBottom: '14px' }}>
                Last updated: Sep 22 2026 05:48
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                {['Leaderboard (7-days)', 'Leaderboard (30-days)', 'Leaderboard (All time)'].map(title => (
                  <div
                    key={title}
                    style={{
                      background: cCardBg,
                      border: `1px solid ${cBorder}`,
                      borderRadius: '12px',
                      padding: '20px',
                      boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.04)' : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}
                  >
                    <div style={{ fontSize: '13.5px', fontWeight: '800', color: cText }}>
                      {title}
                    </div>
                    <div style={{ padding: '32px 0', textAlign: 'center', fontSize: '12.5px', color: cTextMuted }}>
                      {isRTL ? 'لا يوجد نشاط لعرضه' : 'No activity to show'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom-Left Action: + ADD REWARDS */}
            <div>
              <button
                onClick={() => setShowRewardsModal(true)}
                style={{
                  background: cNavy,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={14} />
                <span>{isRTL ? 'إضافة مكافآت' : '+ ADD REWARDS'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-VIEW 5: MEMBERS TAB (Screenshot 5)                                    */}
        {/* ========================================================================= */}
        {activeTab === 'members' && (
          <>
            {/* Center Members List Column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Top Filter Pills + Search */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {[
                    { id: 'Active', label: 'Active 1' },
                    { id: 'Admins', label: 'Admins 1' },
                    { id: 'Contributors', label: 'Contributors' },
                    { id: 'Requested', label: 'Requested 0' },
                    { id: 'Banned', label: 'Banned' }
                  ].map(f => {
                    const isActive = memberFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setMemberFilter(f.id)}
                        style={{
                          background: isActive ? cNavy : (isLight ? '#f1f5f9' : 'rgba(255,255,255,0.06)'),
                          color: isActive ? '#ffffff' : cTextSub,
                          border: 'none',
                          borderRadius: '8px',
                          padding: '6px 14px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>

                <div style={{
                  background: isLight ? '#ffffff' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${cBorder}`,
                  borderRadius: '8px',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '200px'
                }}>
                  <Search size={14} style={{ color: cTextMuted }} />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder={isRTL ? 'بحث عن عضو...' : 'Search Member'}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: cText,
                      fontSize: '12px',
                      width: '100%',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Members Directory List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  background: cCardBg,
                  border: `1px solid ${cBorder}`,
                  borderRadius: '12px',
                  padding: '18px 24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.04)' : 'none'
                }}>
                  {/* Avatar with Shield 1 Badge */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: isLight ? '#ffffff' : '#1e293b',
                      border: `1px solid ${cBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: '13px', fontWeight: '900', color: '#e11d48', fontStyle: 'italic' }}>
                        SS
                      </span>
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '3px',
                      background: cNavy,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9.5px',
                      fontWeight: '900'
                    }}>
                      1
                    </div>
                  </div>

                  {/* Member Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14.5px', fontWeight: '800', color: cText }}>
                        {coachName.toLowerCase()}
                      </span>
                    </div>

                    <div style={{ fontSize: '11.5px', color: cTextSub }}>
                      {authorHandle}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11.5px', color: cTextSub, marginTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        <span>Active 24s ago</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} />
                        <span>Joined 22 Sept 2026</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: cTextSub }}>
                      <Mail size={12} />
                      <span>{authorEmail}</span>
                    </div>
                  </div>
                </div>

                {students.map(student => (
                  <div
                    key={student.id}
                    style={{
                      background: cCardBg,
                      border: `1px solid ${cBorder}`,
                      borderRadius: '12px',
                      padding: '16px 24px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '14px'
                    }}>
                      {(student.name || 'S')[0].toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: cText }}>
                        {student.name}
                      </div>
                      <div style={{ fontSize: '11.5px', color: cTextSub }}>
                        {student.email}
                      </div>
                      <div style={{ fontSize: '11px', color: '#22c55e', fontWeight: '700' }}>
                        ● Active Student
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Sidebar Column */}
            <div style={{ width: '310px', display: 'flex', flexDirection: 'column', gap: '20px', flexShrink: 0 }}>
              <div style={{
                background: cCardBg,
                border: `1px solid ${cBorder}`,
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.04)' : 'none'
              }}>
                <div style={{
                  height: '130px',
                  background: group.coverImageUrl
                    ? `url(${group.coverImageUrl}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #ec4899 0%, #f97316 50%, #eab308 100%)'
                }} />

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '900', color: cText }}>
                      {group.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: cTextSub }}>
                      <Users size={13} />
                      <span>{isRTL ? 'مجموعة عامة' : 'Public Group'}</span>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '12.5px', color: cTextSub, lineHeight: '1.5' }}>
                    {group.description || 'Welcome to our official community space.'}
                  </p>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    textAlign: 'center',
                    borderTop: `1px solid ${cBorder}`,
                    borderBottom: `1px solid ${cBorder}`,
                    padding: '12px 0'
                  }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '900', color: cText }}>{group.memberCount || 1}</div>
                      <div style={{ fontSize: '11px', color: cTextSub }}>{isRTL ? 'أعضاء' : 'Members'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '900', color: cText }}>{posts.length}</div>
                      <div style={{ fontSize: '11px', color: cTextSub }}>{isRTL ? 'منشورات' : 'Posts'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '900', color: cText }}>1</div>
                      <div style={{ fontSize: '11px', color: cTextSub }}>{isRTL ? 'مدير' : 'Admin'}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
                    <button
                      onClick={() => setShowSettingsModal(true)}
                      style={{
                        width: '100%',
                        background: cCardBg,
                        border: `1px solid ${cBorder}`,
                        borderRadius: '8px',
                        padding: '10px',
                        fontSize: '12.5px',
                        fontWeight: '800',
                        color: cText,
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      {isRTL ? 'الإعدادات' : 'SETTINGS'}
                    </button>

                    <button
                      onClick={() => setShowInviteModal(true)}
                      style={{
                        width: '100%',
                        background: cNavy,
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '11px',
                        fontSize: '12.5px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      {isRTL ? 'دعوة الأعضاء' : 'INVITE MEMBERS'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========================================================================= */}
        {/* SUB-VIEW 6: ABOUT TAB                                                     */}
        {/* ========================================================================= */}
        {activeTab === 'about' && (
          <div style={{ flex: 1, maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              background: cCardBg,
              border: `1px solid ${cBorder}`,
              borderRadius: '12px',
              padding: '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: cText }}>
                {isRTL ? 'حول هذا المجتمع' : `About ${group.name}`}
              </h3>
              <p style={{ margin: 0, fontSize: '13.5px', color: cTextSub, lineHeight: '1.6' }}>
                {group.description || 'This community is an interactive space where students and cohort members connect, share learnings, ask questions, and attend weekly live mastermind sessions.'}
              </p>

              <div style={{ borderTop: `1px solid ${cBorder}`, paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: cText }}>
                  {isRTL ? 'قواعد المجتمع وإرشادات المشاركة' : 'Community Guidelines & Rules'}
                </h4>
                <ul style={{ margin: 0, paddingInlineStart: '20px', fontSize: '13px', color: cTextSub, lineHeight: '1.8' }}>
                  <li>{isRTL ? 'الاحترام المتبادل بين جميع الأعضاء ومشاركة الخبرات بإيجابية.' : 'Be respectful to all members and provide constructive feedback.'}</li>
                  <li>{isRTL ? 'عدم مشاركة روابط إعلانية أو غير ذات صلة بمحتوى التدريب.' : 'No spamming or posting unsolicited promotional links.'}</li>
                  <li>{isRTL ? 'طرح الأسئلة في القناة المخصصة لتنظيم الإجابات والمشاركات.' : 'Keep discussions categorized in the appropriate channels.'}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 4. COMMUNITY LIVE CHAT DRAWER (Clicking 'Chat')                            */}
      {/* ========================================================================= */}
      {showChat && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '360px',
          height: '480px',
          background: cCardBg,
          border: `1px solid ${cBorder}`,
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 99999,
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '14px 18px',
            background: cNavy,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontSize: '13.5px', fontWeight: '800' }}>
                {group.name} {isRTL ? 'شات مباشر' : 'Live Chat'}
              </span>
            </div>
            <button
              onClick={() => setShowChat(false)}
              style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '2px' }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: isLight ? '#f8fafc' : '#0b0f19'
          }}>
            {chatMessages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{ fontSize: '10.5px', color: cTextMuted, marginBottom: '2px' }}>
                  {msg.sender} • {msg.time}
                </div>
                <div style={{
                  background: msg.isMe ? cNavy : (isLight ? '#ffffff' : '#1e293b'),
                  color: msg.isMe ? '#ffffff' : cText,
                  padding: '9px 14px',
                  borderRadius: '12px',
                  fontSize: '12.5px',
                  maxWidth: '85%',
                  lineHeight: '1.4',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} style={{
            padding: '12px',
            borderTop: `1px solid ${cBorder}`,
            display: 'flex',
            gap: '8px',
            background: cCardBg
          }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={isRTL ? 'اكتب رسالة...' : 'Type a message...'}
              style={{
                flex: 1,
                background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${cBorder}`,
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12.5px',
                color: cText,
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                background: cNavy,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {isRTL ? 'إرسال' : 'Send'}
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE MODALS                                                     */}
      {/* ========================================================================= */}

      {/* MODAL: POST COMPOSER */}
      {showPostModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: cCardBg, border: `1px solid ${cBorder}`, borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: cText }}>
                {isRTL ? 'إنشاء منشور جديد' : 'Create a Post'}
              </h3>
              <button onClick={() => setShowPostModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: cTextSub }}><X size={16} /></button>
            </div>

            <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: '700', color: cTextSub, display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'القناة' : 'Channel'}
                </label>
                <select
                  value={newPostChannel}
                  onChange={(e) => setNewPostChannel(e.target.value)}
                  style={{ width: '100%', background: isLight ? '#f8fafc' : '#1e293b', border: `1px solid ${cBorder}`, borderRadius: '8px', padding: '8px 12px', color: cText, fontSize: '13px' }}
                >
                  {channels.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: '700', color: cTextSub, display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'محتوى المنشور' : 'Post Content'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder={isRTL ? 'شارك أفكارك مع المجتمع...' : 'Share what is on your mind...'}
                  style={{ width: '100%', background: isLight ? '#f8fafc' : '#1e293b', border: `1px solid ${cBorder}`, borderRadius: '8px', padding: '10px 12px', color: cText, fontSize: '13px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" onClick={() => setShowPostModal(false)} style={{ background: 'transparent', border: `1px solid ${cBorder}`, borderRadius: '8px', padding: '8px 16px', color: cTextSub, fontSize: '12.5px', cursor: 'pointer' }}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" style={{ background: cNavy, color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                  {isRTL ? 'نشر' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CHANNEL */}
      {showAddChannelModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: cCardBg, border: `1px solid ${cBorder}`, borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: cText }}>
                {isRTL ? 'إضافة قناة جديدة' : 'Add New Channel'}
              </h3>
              <button onClick={() => setShowAddChannelModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: cTextSub }}><X size={16} /></button>
            </div>

            <form onSubmit={handleAddChannel} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: '700', color: cTextSub, display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'اسم القناة' : 'Channel Name'}
                </label>
                <input
                  type="text"
                  required
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="e.g. Q&A, Wins, General"
                  style={{ width: '100%', background: isLight ? '#f8fafc' : '#1e293b', border: `1px solid ${cBorder}`, borderRadius: '8px', padding: '8px 12px', color: cText, fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" onClick={() => setShowAddChannelModal(false)} style={{ background: 'transparent', border: `1px solid ${cBorder}`, borderRadius: '8px', padding: '8px 16px', color: cTextSub, fontSize: '12.5px', cursor: 'pointer' }}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" style={{ background: cNavy, color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                  {isRTL ? 'إنشاء' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE EVENT */}
      {showEventModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: cCardBg, border: `1px solid ${cBorder}`, borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: cText }}>
                {isRTL ? 'جدولة فعالية جديدة' : 'Schedule Community Event'}
              </h3>
              <button onClick={() => setShowEventModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: cTextSub }}><X size={16} /></button>
            </div>

            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: '700', color: cTextSub, display: 'block', marginBottom: '4px' }}>
                  {isRTL ? 'عنوان الفعالية' : 'Event Title'}
                </label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="e.g. Weekly Q&A Mastermind"
                  style={{ width: '100%', background: isLight ? '#f8fafc' : '#1e293b', border: `1px solid ${cBorder}`, borderRadius: '8px', padding: '8px 12px', color: cText, fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: '700', color: cTextSub, display: 'block', marginBottom: '4px' }}>
                    {isRTL ? 'التاريخ' : 'Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={eventForm.date}
                    onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                    style={{ width: '100%', background: isLight ? '#f8fafc' : '#1e293b', border: `1px solid ${cBorder}`, borderRadius: '8px', padding: '8px 12px', color: cText, fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: '700', color: cTextSub, display: 'block', marginBottom: '4px' }}>
                    {isRTL ? 'الوقت' : 'Time'}
                  </label>
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                    style={{ width: '100%', background: isLight ? '#f8fafc' : '#1e293b', border: `1px solid ${cBorder}`, borderRadius: '8px', padding: '8px 12px', color: cText, fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: '700', color: cTextSub, display: 'block', marginBottom: '4px' }}>
                  {isRTL ? 'رابط اللقاء (Zoom / Google Meet)' : 'Meeting Link'}
                </label>
                <input
                  type="url"
                  value={eventForm.link}
                  onChange={(e) => setEventForm({ ...eventForm, link: e.target.value })}
                  placeholder="https://zoom.us/j/..."
                  style={{ width: '100%', background: isLight ? '#f8fafc' : '#1e293b', border: `1px solid ${cBorder}`, borderRadius: '8px', padding: '8px 12px', color: cText, fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowEventModal(false)} style={{ background: 'transparent', border: `1px solid ${cBorder}`, borderRadius: '8px', padding: '8px 16px', color: cTextSub, fontSize: '12.5px', cursor: 'pointer' }}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" style={{ background: cNavy, color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                  {isRTL ? 'جدولة' : 'Schedule Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LINK COURSE TO COMMUNITY */}
      {showLinkCourseModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: cCardBg, border: `1px solid ${cBorder}`, borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '460px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: cText }}>
                {isRTL ? 'ربط كورس بهذا المجتمع' : 'Connect Course to Community'}
              </h3>
              <button onClick={() => setShowLinkCourseModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: cTextSub }}><X size={16} /></button>
            </div>

            {courses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: cTextSub, fontSize: '13px' }}>
                {isRTL ? 'لا توجد كورسات منشأة بعد في الأكاديمية.' : 'No courses created yet in your academy.'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {courses.map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleLinkCourse(c.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: `1px solid ${cBorder}`,
                      background: linkedCourseIds.includes(c.id) ? (isLight ? '#f1f5f9' : 'rgba(255,255,255,0.08)') : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: '700', color: cText }}>{c.title}</div>
                      <div style={{ fontSize: '11px', color: cTextSub }}>{c.category || 'Course'}</div>
                    </div>
                    {linkedCourseIds.includes(c.id) ? (
                      <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: '700' }}>✓ Connected</span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: '700' }}>+ Link</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD REWARDS */}
      {showRewardsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: cCardBg, border: `1px solid ${cBorder}`, borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: cText }}>
                {isRTL ? 'إضافة مكافأة مستوى' : 'Add Level Reward'}
              </h3>
              <button onClick={() => setShowRewardsModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: cTextSub }}><X size={16} /></button>
            </div>

            <form onSubmit={handleAddReward} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: '700', color: cTextSub, display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'المستوى المطلوب' : 'Unlock Level'}
                </label>
                <select
                  value={rewardForm.level}
                  onChange={(e) => setRewardForm({ ...rewardForm, level: Number(e.target.value) })}
                  style={{ width: '100%', background: isLight ? '#f8fafc' : '#1e293b', border: `1px solid ${cBorder}`, borderRadius: '8px', padding: '8px 12px', color: cText, fontSize: '13px' }}
                >
                  {[2, 3, 4, 5, 6, 7, 8, 9].map(l => (
                    <option key={l} value={l}>Level {l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: '700', color: cTextSub, display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'عنوان المكافأة' : 'Reward Title'}
                </label>
                <input
                  type="text"
                  required
                  value={rewardForm.title}
                  onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
                  placeholder="e.g. VIP Resource Library Pass"
                  style={{ width: '100%', background: isLight ? '#f8fafc' : '#1e293b', border: `1px solid ${cBorder}`, borderRadius: '8px', padding: '8px 12px', color: cText, fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" onClick={() => setShowRewardsModal(false)} style={{ background: 'transparent', border: `1px solid ${cBorder}`, borderRadius: '8px', padding: '8px 16px', color: cTextSub, fontSize: '12.5px', cursor: 'pointer' }}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" style={{ background: cNavy, color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                  {isRTL ? 'إضافة' : 'Add Reward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INVITE MEMBERS */}
      {showInviteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: cCardBg, border: `1px solid ${cBorder}`, borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: cText }}>
                {isRTL ? 'دعوة أعضاء للمجتمع' : 'Invite Members'}
              </h3>
              <button onClick={() => setShowInviteModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: cTextSub }}><X size={16} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: '700', color: cTextSub, display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'رابط المجتمع المباشر' : 'Direct Share Link'}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/portal/${userData?.username || 'coach'}/community/${group.slug || 'group'}`}
                    style={{ flex: 1, background: isLight ? '#f1f5f9' : '#1e293b', border: `1px solid ${cBorder}`, borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: cText, outline: 'none' }}
                  />
                  <button
                    onClick={copyGroupLink}
                    style={{ background: cNavy, color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedLink ? (isRTL ? 'تم النسخ!' : 'Copied!') : (isRTL ? 'نسخ' : 'Copy')}</span>
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: '700', color: cTextSub, display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'إرسال دعوة عبر البريد' : 'Send Invite via Email'}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="student@example.com"
                    style={{ flex: 1, background: isLight ? '#f8fafc' : '#1e293b', border: `1px solid ${cBorder}`, borderRadius: '8px', padding: '8px 12px', fontSize: '12.5px', color: cText, outline: 'none' }}
                  />
                  <button
                    onClick={() => {
                      if (!inviteEmail) return;
                      showToast(isRTL ? `تم إرسال الدعوة إلى ${inviteEmail}` : `Invitation sent to ${inviteEmail}`);
                      setInviteEmail('');
                      setShowInviteModal(false);
                    }}
                    style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    {isRTL ? 'إرسال' : 'Send Invite'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SETTINGS */}
      {showSettingsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: cCardBg, border: `1px solid ${cBorder}`, borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: cText }}>
                {isRTL ? 'إعدادات المجتمع' : 'Group Settings'}
              </h3>
              <button onClick={() => setShowSettingsModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: cTextSub }}><X size={16} /></button>
            </div>

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: '700', color: cTextSub, display: 'block', marginBottom: '4px' }}>
                  {isRTL ? 'اسم المجتمع' : 'Group Name'}
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  style={{ width: '100%', background: isLight ? '#f8fafc' : '#1e293b', border: `1px solid ${cBorder}`, borderRadius: '8px', padding: '8px 12px', color: cText, fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: '700', color: cTextSub, display: 'block', marginBottom: '4px' }}>
                  {isRTL ? 'الرابط التعريفي (Slug)' : 'Group Slug'}
                </label>
                <input
                  type="text"
                  value={settingsForm.slug}
                  onChange={(e) => setSettingsForm({ ...settingsForm, slug: e.target.value })}
                  style={{ width: '100%', background: isLight ? '#f8fafc' : '#1e293b', border: `1px solid ${cBorder}`, borderRadius: '8px', padding: '8px 12px', color: cText, fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: '700', color: cTextSub, display: 'block', marginBottom: '4px' }}>
                  {isRTL ? 'الوصف' : 'Description'}
                </label>
                <textarea
                  rows={3}
                  value={settingsForm.description}
                  onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                  style={{ width: '100%', background: isLight ? '#f8fafc' : '#1e293b', border: `1px solid ${cBorder}`, borderRadius: '8px', padding: '8px 12px', color: cText, fontSize: '13px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowSettingsModal(false)} style={{ background: 'transparent', border: `1px solid ${cBorder}`, borderRadius: '8px', padding: '8px 16px', color: cTextSub, fontSize: '12.5px', cursor: 'pointer' }}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit" style={{ background: cNavy, color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}>
                  {isRTL ? 'حفظ' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GO LIVE */}
      {showGoLiveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: cCardBg, border: `1px solid ${cBorder}`, borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Video size={18} color="#dc2626" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: cText }}>
                  {isRTL ? 'بدء بث مباشر' : 'Go Live in Community'}
                </h3>
              </div>
              <button onClick={() => setShowGoLiveModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: cTextSub }}><X size={16} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: '700', color: cTextSub, display: 'block', marginBottom: '4px' }}>
                  {isRTL ? 'عنوان الجلسة' : 'Session Title'}
                </label>
                <input
                  type="text"
                  value={goLiveForm.title}
                  onChange={(e) => setGoLiveForm({ ...goLiveForm, title: e.target.value })}
                  style={{ width: '100%', background: isLight ? '#f8fafc' : '#1e293b', border: `1px solid ${cBorder}`, borderRadius: '8px', padding: '8px 12px', color: cText, fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: '700', color: cTextSub, display: 'block', marginBottom: '4px' }}>
                  {isRTL ? 'رابط البث (Zoom / Meet / UpKlick Room)' : 'Live Room Link'}
                </label>
                <input
                  type="url"
                  value={goLiveForm.link}
                  onChange={(e) => setGoLiveForm({ ...goLiveForm, link: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  style={{ width: '100%', background: isLight ? '#f8fafc' : '#1e293b', border: `1px solid ${cBorder}`, borderRadius: '8px', padding: '8px 12px', color: cText, fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" onClick={() => setShowGoLiveModal(false)} style={{ background: 'transparent', border: `1px solid ${cBorder}`, borderRadius: '8px', padding: '8px 16px', color: cTextSub, fontSize: '12.5px', cursor: 'pointer' }}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast(isRTL ? 'تم بدء جلسة البث المباشر وإشعار الطلاب!' : 'Live session broadcasted to community members!');
                    setShowGoLiveModal(false);
                  }}
                  style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer' }}
                >
                  {isRTL ? 'بدء البث الآن' : 'Start Live Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
