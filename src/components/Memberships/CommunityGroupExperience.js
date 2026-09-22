'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Home,
  Users,
  Search,
  Sun,
  Moon,
  Grid,
  Bell,
  Video,
  VideoOff,
  Mic,
  MicOff,
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
  Layers,
  UploadCloud,
  Globe,
  Palette,
  DollarSign,
  HelpCircle,
  Trophy,
  Link2,
  Flag,
  Compass,
  Eye,
  Sliders,
  FileText,
  Monitor,
  Smile,
  Hand,
  ThumbsUp,
  MoreHorizontal,
  Radio,
  Tv,
  Maximize2
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
  onToggleTheme,
  initialTab = 'discussion',
  initialChannel = 'home'
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
  const [activeTab, setActiveTab] = useState(() => {
    if (initialTab === 'home') return 'discussion';
    return initialTab || 'discussion';
  }); // 'discussion' | 'learning' | 'events' | 'leaderboard' | 'members' | 'about'
  const [activeChannel, setActiveChannel] = useState(initialChannel || 'home');
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

  // Go Live Setup State (Screenshot 2)
  const [showGoLiveModal, setShowGoLiveModal] = useState(false);
  const [goLiveForm, setGoLiveForm] = useState({
    title: 'شييشسب',
    description: 'سشيشنشنشن',
    channel: 'announcements',
    schedule: 'now', // 'now' | 'later'
    videoSource: 'meeting_room', // 'meeting_room' | 'streaming_software'
    selectedCamera: '',
    selectedMic: '',
    keepAsPost: true,
    notifyMembers: true
  });
  const [previewCameraOn, setPreviewCameraOn] = useState(true);
  const [previewMicOn, setPreviewMicOn] = useState(true);
  const [detectedCameras, setDetectedCameras] = useState([
    { deviceId: 'cam-1', label: 'USB2.0 HD UVC WebCam (0bda:57fa)' }
  ]);
  const [detectedMics, setDetectedMics] = useState([
    { deviceId: 'mic-1', label: 'Microphone (High Definition Audio Device)' }
  ]);
  const previewVideoRef = useRef(null);
  const previewStreamRef = useRef(null);

  // Active Live Session State (Screenshot 3: Live Meeting Room)
  const [activeLiveSession, setActiveLiveSession] = useState(null);
  const [liveIsAudioMuted, setLiveIsAudioMuted] = useState(false);
  const [liveIsVideoOff, setLiveIsVideoOff] = useState(false);
  const [liveIsScreenSharing, setLiveIsScreenSharing] = useState(false);
  const [liveConnecting, setLiveConnecting] = useState(true);
  const [liveChatOpen, setLiveChatOpen] = useState(false);
  const [liveParticipantsOpen, setLiveParticipantsOpen] = useState(false);
  const [liveHandRaised, setLiveHandRaised] = useState(false);
  const [liveReactions, setLiveReactions] = useState([]);
  const [showReactPicker, setShowReactPicker] = useState(false);
  const [showDeviceSettingsModal, setShowDeviceSettingsModal] = useState(false);
  const [liveMessages, setLiveMessages] = useState([
    { id: 'lm-1', sender: coachName, time: 'Just now', text: 'Welcome to our Live Session! Drop your questions and comments here.' }
  ]);
  const [liveChatInput, setLiveChatInput] = useState('');
  const liveVideoRef = useRef(null);
  const liveStreamRef = useRef(null);

  // Handle webcam preview when Go Live setup modal opens
  useEffect(() => {
    if (showGoLiveModal) {
      let isMounted = true;
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then(stream => {
            if (!isMounted) {
              stream.getTracks().forEach(t => t.stop());
              return;
            }
            previewStreamRef.current = stream;
            if (previewVideoRef.current) {
              previewVideoRef.current.srcObject = stream;
            }
            return navigator.mediaDevices.enumerateDevices();
          })
          .then(devices => {
            if (!isMounted || !devices) return;
            const cams = devices.filter(d => d.kind === 'videoinput');
            const mics = devices.filter(d => d.kind === 'audioinput');
            if (cams.length > 0) setDetectedCameras(cams);
            if (mics.length > 0) setDetectedMics(mics);
          })
          .catch(() => {
            // Camera not granted or simulated device
          });
      }
      return () => {
        isMounted = false;
        if (previewStreamRef.current) {
          previewStreamRef.current.getTracks().forEach(t => t.stop());
          previewStreamRef.current = null;
        }
      };
    }
  }, [showGoLiveModal]);

  // Handle live room connection & stream
  useEffect(() => {
    if (activeLiveSession) {
      setLiveConnecting(true);
      const timer = setTimeout(() => {
        setLiveConnecting(false);
      }, 1200);

      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia && !liveIsVideoOff) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then(stream => {
            liveStreamRef.current = stream;
            if (liveVideoRef.current) {
              liveVideoRef.current.srcObject = stream;
            }
          })
          .catch(() => {});
      }

      return () => {
        clearTimeout(timer);
        if (liveStreamRef.current) {
          liveStreamRef.current.getTracks().forEach(t => t.stop());
          liveStreamRef.current = null;
        }
      };
    }
  }, [activeLiveSession]);

  const handleTogglePreviewCamera = () => {
    setPreviewCameraOn(prev => {
      const next = !prev;
      if (previewStreamRef.current) {
        previewStreamRef.current.getVideoTracks().forEach(t => { t.enabled = next; });
      }
      return next;
    });
  };

  const handleTogglePreviewMic = () => {
    setPreviewMicOn(prev => {
      const next = !prev;
      if (previewStreamRef.current) {
        previewStreamRef.current.getAudioTracks().forEach(t => { t.enabled = next; });
      }
      return next;
    });
  };

  const handleStartGoLive = (e) => {
    if (e) e.preventDefault();
    if (!goLiveForm.title.trim()) {
      showToast(isRTL ? 'يرجى إدخال عنوان البث المباشر' : 'Please enter stream title');
      return;
    }

    // Stop preview stream before moving to live room
    if (previewStreamRef.current) {
      previewStreamRef.current.getTracks().forEach(t => t.stop());
      previewStreamRef.current = null;
    }

    setShowGoLiveModal(false);

    // Initialize session
    const session = {
      id: `live-${Date.now()}`,
      title: goLiveForm.title.trim(),
      description: goLiveForm.description.trim(),
      channel: goLiveForm.channel || 'announcements',
      videoSource: goLiveForm.videoSource,
      keepAsPost: goLiveForm.keepAsPost,
      notifyMembers: goLiveForm.notifyMembers,
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setActiveLiveSession(session);
    setLiveIsAudioMuted(!previewMicOn);
    setLiveIsVideoOff(!previewCameraOn);
    showToast(isRTL ? 'بدأ البث المباشر بنجاح! 🚀' : 'You are now live! 🚀');
  };

  const handleEndLiveSession = () => {
    if (!activeLiveSession) return;

    if (liveStreamRef.current) {
      liveStreamRef.current.getTracks().forEach(t => t.stop());
      liveStreamRef.current = null;
    }

    if (activeLiveSession.keepAsPost !== false) {
      const newLivePost = {
        id: `live-post-${Date.now()}`,
        author: coachName,
        authorHandle: `@${userData?.username || 'mohamed'}`,
        initials: 'SS',
        channelId: activeLiveSession.channel || 'announcements',
        channelName: channels.find(c => c.id === activeLiveSession.channel)?.name || 'Announcements',
        createdAt: 'Just now',
        isLiveRecording: true,
        liveTitle: activeLiveSession.title || 'Live Session',
        liveDescription: activeLiveSession.description || '',
        recordingStatus: 'processing',
        likes: 0,
        liked: false,
        comments: []
      };

      setPosts(prev => [newLivePost, ...prev]);
    }

    showToast(isRTL ? 'تم إنهاء جلسة البث المباشر وجاري معالجة التسجيل' : 'Stream ended. Recording is being processed.');
    setActiveLiveSession(null);
    setActiveTab('discussion');
    if (activeLiveSession.channel) {
      setActiveChannel(activeLiveSession.channel);
    }
  };

  const handleSendLiveReaction = (emoji) => {
    const id = Date.now() + Math.random();
    setLiveReactions(prev => [...prev, { id, emoji, left: 35 + Math.random() * 30 }]);
    setShowReactPicker(false);
    setTimeout(() => {
      setLiveReactions(prev => prev.filter(r => r.id !== id));
    }, 2200);
  };

  const handleToggleLiveAudio = () => {
    setLiveIsAudioMuted(prev => {
      const next = !prev;
      if (liveStreamRef.current) {
        liveStreamRef.current.getAudioTracks().forEach(t => { t.enabled = !next; });
      }
      return next;
    });
  };

  const handleToggleLiveVideo = () => {
    setLiveIsVideoOff(prev => {
      const next = !prev;
      if (liveStreamRef.current) {
        liveStreamRef.current.getVideoTracks().forEach(t => { t.enabled = !next; });
      }
      return next;
    });
  };

  const handleToggleScreenShare = async () => {
    if (liveIsScreenSharing) {
      setLiveIsScreenSharing(false);
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          liveStreamRef.current = stream;
          if (liveVideoRef.current) liveVideoRef.current.srcObject = stream;
        } catch (e) {}
      }
    } else {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getDisplayMedia) {
        try {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
          liveStreamRef.current = screenStream;
          if (liveVideoRef.current) liveVideoRef.current.srcObject = screenStream;
          setLiveIsScreenSharing(true);
          screenStream.getVideoTracks()[0].onended = () => {
            setLiveIsScreenSharing(false);
          };
        } catch (e) {
          showToast(isRTL ? 'تم إلغاء مشاركة الشاشة' : 'Screen share cancelled');
        }
      } else {
        setLiveIsScreenSharing(true);
        showToast(isRTL ? 'مشاركة الشاشة مفعلة' : 'Screen sharing active');
      }
    }
  };

  const handleSendLiveChat = (e) => {
    if (e) e.preventDefault();
    if (!liveChatInput.trim()) return;
    setLiveMessages(prev => [
      ...prev,
      {
        id: `lm-${Date.now()}`,
        sender: coachName,
        time: 'Just now',
        text: liveChatInput.trim(),
        isMe: true
      }
    ]);
    setLiveChatInput('');
  };

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
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteIsAdmin, setInviteIsAdmin] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState('details'); // 'details' | 'subscriptions' | 'newsletter' | 'branding' | 'themes' | 'tabs' | 'questions' | 'gamification' | 'links' | 'reported' | 'import' | 'discovery'
  const [settingsForm, setSettingsForm] = useState({
    name: group.name || '',
    slug: group.slug || '',
    description: group.description || '',
    privacy: group.privacy || 'public', // 'public' | 'private'
    accessibleFromSwitcher: group.accessibleFromSwitcher !== false,
    allowMemberInvites: group.allowMemberInvites !== false,
    showMandatoryProfileModal: group.showMandatoryProfileModal || false,
    subscriptionType: group.subscriptionType || 'free',
    newsletterFreq: group.newsletterFreq || 'off',
    faviconUrl: group.faviconUrl || '',
    coverImageUrl: group.coverImageUrl || '',
    logoUrl: group.logoUrl || '',
    colorTheme: group.colorTheme || 'default',
    hiddenTabs: group.hiddenTabs || [],
    enableMembershipQuestions: group.enableMembershipQuestions || false,
    membershipQuestions: group.membershipQuestions || [
      'What is your main goal in joining this community?',
      'How did you discover our community?'
    ],
    customLinks: group.customLinks || [
      { title: 'Community Guidelines', url: 'https://upklick.net/terms' }
    ],
    gamificationPoints: group.gamificationPoints || { post: 5, comment: 2, like: 1 },
    gamificationLevels: group.gamificationLevels || [
      { level: 1, name: 'Level 1', points: 0 },
      { level: 2, name: 'Level 2', points: 5 },
      { level: 3, name: 'Level 3', points: 20 },
      { level: 4, name: 'Level 4', points: 65 },
      { level: 5, name: 'Level 5', points: 155 },
      { level: 6, name: 'Level 6', points: 350 },
      { level: 7, name: 'Level 7', points: 700 },
      { level: 8, name: 'Level 8', points: 1400 },
      { level: 9, name: 'Level 9', points: 2800 }
    ],
    rewards: group.rewards || [
      { id: 'rw-1', level: 2, title: 'VIP Resource Library Access', description: 'Unlock instant access to proprietary templates & cheat sheets' },
      { id: 'rw-2', level: 3, title: 'Private 1-on-1 Strategy Pass', description: 'Monthly 30-minute private review session with the coach' }
    ],
    reportedContent: group.reportedContent || [],
    discovery: group.discovery !== false
  });

  // Sub-states for Settings tabs (Screenshots 1-5)
  const [isGamificationAccordionOpen, setIsGamificationAccordionOpen] = useState(false);
  const [isRewardsAccordionOpen, setIsRewardsAccordionOpen] = useState(false);
  const [showAddQuestionInput, setShowAddQuestionInput] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [showAddLinkInput, setShowAddLinkInput] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [showAddRewardInput, setShowAddRewardInput] = useState(false);
  const [newRewardLevel, setNewRewardLevel] = useState(2);
  const [newRewardTitle, setNewRewardTitle] = useState('');

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

  // Posts Feed State (Initial seed matching Screenshot 1)
  const [posts, setPosts] = useState(() => [
    {
      id: 'post-live-initial',
      author: coachName,
      authorHandle: `@${userData?.username || 'mohamed'}`,
      initials: 'SS',
      channelId: 'announcements',
      channelName: 'Announcements',
      createdAt: 'Just now',
      isLiveRecording: true,
      liveTitle: 'شييشسب',
      liveDescription: 'سشيشنشنشن',
      recordingStatus: 'processing',
      likes: 0,
      liked: false,
      comments: []
    },
    {
      id: 'post-reg-1',
      author: coachName,
      authorHandle: `@${userData?.username || 'mohamed'}`,
      initials: 'SS',
      channelId: 'announcements',
      channelName: 'Announcements',
      createdAt: '9m ago',
      content: 'ss\n\nss',
      likes: 0,
      liked: false,
      comments: []
    },
    {
      id: 'post-reg-2',
      author: coachName,
      authorHandle: `@${userData?.username || 'mohamed'}`,
      initials: 'SS',
      channelId: 'announcements',
      channelName: 'Announcements',
      createdAt: '1h ago',
      content: 'ss\n\nss',
      likes: 0,
      liked: false,
      comments: []
    }
  ]);

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
      privacy: settingsForm.privacy,
      accessibleFromSwitcher: settingsForm.accessibleFromSwitcher,
      allowMemberInvites: settingsForm.allowMemberInvites,
      showMandatoryProfileModal: settingsForm.showMandatoryProfileModal,
      subscriptionType: settingsForm.subscriptionType,
      newsletterFreq: settingsForm.newsletterFreq,
      faviconUrl: settingsForm.faviconUrl,
      coverImageUrl: settingsForm.coverImageUrl,
      logoUrl: settingsForm.logoUrl,
      colorTheme: settingsForm.colorTheme,
      hiddenTabs: settingsForm.hiddenTabs,
      enableMembershipQuestions: settingsForm.enableMembershipQuestions,
      membershipQuestions: settingsForm.membershipQuestions,
      gamificationPoints: settingsForm.gamificationPoints,
      gamificationLevels: settingsForm.gamificationLevels,
      rewards: settingsForm.rewards,
      customLinks: settingsForm.customLinks,
      reportedContent: settingsForm.reportedContent,
      discovery: settingsForm.discovery
    };
    onUpdateGroup(updated);
    setShowSettingsModal(false);
    showToast(isRTL ? 'تم حفظ إعدادات المجتمع بنجاح!' : 'Group settings saved successfully!');
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
          ].filter(tab => !(settingsForm.hiddenTabs || []).includes(tab.id)).map(tab => {
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
      {/* 3. MAIN WORKSPACE OR LIVE MEETING ROOM (Screenshot 3)                     */}
      {/* ========================================================================= */}
      {activeLiveSession ? (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#090d16',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* TOP BAR */}
          <div style={{
            padding: '12px 24px',
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ fontSize: '15.5px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.2px' }}>
                {activeLiveSession.title}
              </div>
              <div
                onClick={() => setLiveParticipantsOpen(!liveParticipantsOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '9999px',
                  padding: '3px 10px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                <Users size={13} color="#94a3b8" />
                <span>Participants</span>
                <span style={{
                  background: '#2563eb',
                  color: '#fff',
                  borderRadius: '9999px',
                  padding: '1px 6px',
                  fontSize: '11px',
                  fontWeight: '800'
                }}>1</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => showToast(isRTL ? 'تغيير طريقة العرض' : 'Change View Mode')}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Grid size={13} />
                <span>View</span>
              </button>
            </div>
          </div>

          {/* MAIN STAGE (Center Video / Connecting Avatar) */}
          <div style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000000',
            overflow: 'hidden'
          }}>
            {/* Real Video Element if video is enabled */}
            <video
              ref={liveVideoRef}
              autoPlay
              playsInline
              muted={liveIsAudioMuted}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: (!liveConnecting && !liveIsVideoOff) ? 'block' : 'none'
              }}
            />

            {/* Connecting to room / Avatar State matching Screenshot 3 */}
            {(liveConnecting || liveIsVideoOff) && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px'
              }}>
                <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                  {/* Spinning Ring */}
                  <div style={{
                    position: 'absolute',
                    inset: '-8px',
                    borderRadius: '50%',
                    border: '3px solid transparent',
                    borderTopColor: '#e11d48',
                    borderRightColor: '#e11d48',
                    animation: 'spin 1.2s linear infinite'
                  }} />
                  {/* Avatar Circle SS */}
                  <div style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: '#e11d48',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    fontWeight: '900',
                    letterSpacing: '1px',
                    boxShadow: '0 0 25px rgba(225, 29, 72, 0.4)'
                  }}>
                    {authorInitials}
                  </div>
                </div>

                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#e2e8f0',
                  letterSpacing: '0.3px'
                }}>
                  {liveConnecting ? 'Connecting to room...' : (liveIsVideoOff ? `${coachName} (Camera off)` : 'Live Stream')}
                </div>
              </div>
            )}

            {/* Hand Raised Banner */}
            {liveHandRaised && (
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: 'rgba(234, 179, 8, 0.2)',
                border: '1px solid #eab308',
                borderRadius: '8px',
                padding: '6px 12px',
                color: '#fef08a',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                zIndex: 20
              }}>
                <Hand size={14} color="#eab308" />
                <span>Hand Raised</span>
              </div>
            )}

            {/* Floating Reactions */}
            {liveReactions.map(r => (
              <div
                key={r.id}
                style={{
                  position: 'absolute',
                  bottom: '80px',
                  left: `${r.left}%`,
                  fontSize: '32px',
                  pointerEvents: 'none',
                  animation: 'floatUp 2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
                  zIndex: 25
                }}
              >
                {r.emoji}
              </div>
            ))}

            {/* In-Meeting Live Chat Drawer */}
            {liveChatOpen && (
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                width: '320px',
                background: '#111827',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 30
              }}>
                <div style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#ffffff' }}>Live Chat</div>
                  <button onClick={() => setLiveChatOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={16} /></button>
                </div>
                <div style={{ flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {liveMessages.map(msg => (
                    <div key={msg.id} style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '8px 12px' }}>
                      <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '700', marginBottom: '2px' }}>{msg.sender} <span style={{ color: '#64748b', fontWeight: '400' }}>• {msg.time}</span></div>
                      <div style={{ fontSize: '12.5px', color: '#e2e8f0' }}>{msg.text}</div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendLiveChat} style={{ padding: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={liveChatInput}
                    onChange={(e) => setLiveChatInput(e.target.value)}
                    placeholder="Send a chat message..."
                    style={{ flex: 1, background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '6px', padding: '8px 10px', color: '#ffffff', fontSize: '12px', outline: 'none' }}
                  />
                  <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Send</button>
                </form>
              </div>
            )}

            {/* In-Meeting Participants Drawer */}
            {liveParticipantsOpen && (
              <div style={{
                position: 'absolute',
                top: 0,
                right: liveChatOpen ? '320px' : 0,
                bottom: 0,
                width: '260px',
                background: '#111827',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 30
              }}>
                <div style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#ffffff' }}>Participants (1)</div>
                  <button onClick={() => setLiveParticipantsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={16} /></button>
                </div>
                <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e11d48', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '800' }}>{authorInitials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff' }}>{coachName}</div>
                      <div style={{ fontSize: '10px', color: '#38bdf8' }}>Host (You)</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DOCKED BOTTOM CONTROL BAR (Screenshot 3) */}
          <div style={{
            height: '74px',
            background: '#111827',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'relative',
            zIndex: 40
          }}>
            {/* Left Controls: Audio & Video */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Audio Toggle */}
              <button
                type="button"
                onClick={handleToggleLiveAudio}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: liveIsAudioMuted ? '#ef4444' : '#cbd5e1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: liveIsAudioMuted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {liveIsAudioMuted ? <MicOff size={17} color="#ef4444" /> : <Mic size={17} color="#cbd5e1" />}
                </div>
                <span>Audio</span>
              </button>

              {/* Video Toggle */}
              <button
                type="button"
                onClick={handleToggleLiveVideo}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: liveIsVideoOff ? '#ef4444' : '#cbd5e1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: liveIsVideoOff ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {liveIsVideoOff ? <VideoOff size={17} color="#ef4444" /> : <Video size={17} color="#cbd5e1" />}
                </div>
                <span>Video</span>
              </button>
            </div>

            {/* Center Controls: Participants, Chat, React, Raise, Share, Settings */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '22px', position: 'relative' }}>
              {/* React Picker Popup */}
              {showReactPicker && (
                <div style={{
                  position: 'absolute',
                  bottom: '55px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#1f2937',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '30px',
                  padding: '6px 12px',
                  display: 'flex',
                  gap: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  zIndex: 50
                }}>
                  {['❤️', '👍', '👏', '🔥', '🎉', '🚀'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleSendLiveReaction(emoji)}
                      style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '2px 4px' }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Participants Button */}
              <button
                type="button"
                onClick={() => setLiveParticipantsOpen(!liveParticipantsOpen)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: liveParticipantsOpen ? '#38bdf8' : '#cbd5e1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <Users size={18} />
                  <span style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-8px',
                    background: '#2563eb',
                    color: '#fff',
                    borderRadius: '9999px',
                    fontSize: '9.5px',
                    padding: '1px 5px',
                    fontWeight: '800'
                  }}>1</span>
                </div>
                <span>Participants</span>
              </button>

              {/* Chat Button */}
              <button
                type="button"
                onClick={() => setLiveChatOpen(!liveChatOpen)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: liveChatOpen ? '#38bdf8' : '#cbd5e1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600'
                }}
              >
                <MessageSquare size={18} />
                <span>Chat</span>
              </button>

              {/* React Button */}
              <button
                type="button"
                onClick={() => setShowReactPicker(!showReactPicker)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: showReactPicker ? '#38bdf8' : '#cbd5e1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600'
                }}
              >
                <Smile size={18} />
                <span>React</span>
              </button>

              {/* Raise Button */}
              <button
                type="button"
                onClick={() => {
                  setLiveHandRaised(!liveHandRaised);
                  showToast(!liveHandRaised ? 'Hand raised ✋' : 'Hand lowered');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: liveHandRaised ? '#eab308' : '#cbd5e1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600'
                }}
              >
                <Hand size={18} />
                <span>Raise</span>
              </button>

              {/* Share Screen Button */}
              <button
                type="button"
                onClick={handleToggleScreenShare}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: liveIsScreenSharing ? '#22c55e' : '#cbd5e1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600'
                }}
              >
                <Monitor size={18} />
                <span>Share</span>
              </button>

              {/* Settings Button */}
              <button
                type="button"
                onClick={() => showToast(isRTL ? 'إعدادات الكاميرا والمايكروفون' : 'Camera & Microphone Settings')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#cbd5e1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600'
                }}
              >
                <Settings size={18} />
                <span>Settings</span>
              </button>
            </div>

            {/* Right Action: End Session Button (Screenshot 3) */}
            <div>
              <button
                type="button"
                onClick={handleEndLiveSession}
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 22px',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  letterSpacing: '0.4px',
                  boxShadow: '0 2px 10px rgba(239, 68, 68, 0.4)',
                  transition: 'all 0.15s ease'
                }}
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      ) : (
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
              {posts.filter(p => activeChannel === 'home' || p.channelId === activeChannel).length === 0 ? (
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
                  {posts.filter(p => activeChannel === 'home' || p.channelId === activeChannel).map(post => (
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
                            fontSize: '13px',
                            flexShrink: 0
                          }}>
                            {post.initials || 'SS'}
                          </div>
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: '800', color: cText }}>
                              {post.isLiveRecording ? `${post.author} was live` : post.author}
                            </div>
                            <div style={{ fontSize: '11px', color: cTextSub, display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {post.isLiveRecording ? (
                                <>
                                  <Megaphone size={12} color="#3b82f6" />
                                  <span>{post.createdAt} in {post.channelName}</span>
                                </>
                              ) : (
                                <>
                                  <span>{post.authorHandle}</span>
                                  <span>•</span>
                                  <span>{post.createdAt}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                          <button
                            type="button"
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: cTextSub, padding: '2px' }}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Post Body */}
                      {post.isLiveRecording ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {post.liveTitle && (
                            <div style={{ fontSize: '15.5px', fontWeight: '800', color: cText, lineHeight: '1.3' }}>
                              {post.liveTitle}
                            </div>
                          )}
                          {post.liveDescription && (
                            <div style={{ fontSize: '13.5px', color: cTextSub, lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                              {post.liveDescription}
                            </div>
                          )}

                          {/* Processing Recording Box matching Screenshot 1 */}
                          <div style={{
                            background: isLight ? '#1c1e36' : '#181a2e',
                            borderRadius: '12px',
                            padding: '24px 28px',
                            marginTop: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
                          }}>
                            <div style={{ fontSize: '17px', fontWeight: '800', color: '#ffffff', marginBottom: '8px' }}>
                              Processing Recording
                            </div>
                            <div style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '20px', lineHeight: '1.4' }}>
                              Stream ended. The recording is being processed and will be available shortly.
                            </div>
                            <button
                              type="button"
                              onClick={() => showToast(isRTL ? 'جاري معالجة تسجيل البث المباشر...' : 'Stream recording is currently being processed...')}
                              style={{
                                background: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '8px',
                                padding: '9px 16px',
                                color: '#ffffff',
                                fontSize: '12.5px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                              }}
                            >
                              <Video size={15} color="#ffffff" />
                              <span>Recording in progress</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: '13.5px', color: cText, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                          {post.content}
                        </div>
                      )}

                      {/* Post Actions Row */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
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
                            gap: '6px',
                            color: post.liked ? '#2563eb' : cTextSub,
                            fontWeight: '600'
                          }}
                        >
                          <ThumbsUp size={15} color={post.liked ? '#2563eb' : cTextSub} />
                          <span>{post.likes || 0}</span>
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
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
                            gap: '6px',
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
      )}

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

      {/* MODAL: INVITE MEMBERS (GoHighLevel / ClientClub Replica) */}
      {showInviteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: cCardBg,
            border: `1px solid ${cBorder}`,
            borderRadius: '12px',
            width: '100%',
            maxWidth: '540px',
            boxShadow: isLight ? '0 20px 40px rgba(0,0,0,0.15)' : '0 25px 50px rgba(0,0,0,0.6)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px 16px 24px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${cBorder}`
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: cText }}>
                  {isRTL ? 'دعوة عضو' : 'Invite Member'}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: cTextSub }}>
                  {isRTL ? 'ابنِ مجتمعك بدعوة أعضاء جدد' : 'Build your community by inviting a new member'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: cTextSub,
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column' }}>

              {/* Section 1: Share your group link */}
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '700', color: cText, marginBottom: '10px' }}>
                  {isRTL ? 'مشاركة رابط المجموعة' : 'Share your group link'}
                </div>
                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/portal/${userData?.username || 'coach'}/community/${group.slug || 'group'}`}
                    style={{
                      flex: 1,
                      background: isLight ? '#ffffff' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${cBorder}`,
                      borderRight: isRTL ? `1px solid ${cBorder}` : 'none',
                      borderLeft: isRTL ? 'none' : `1px solid ${cBorder}`,
                      borderRadius: isRTL ? '0 6px 6px 0' : '6px 0 0 6px',
                      padding: '9px 14px',
                      fontSize: '12px',
                      color: cTextSub,
                      outline: 'none',
                      textOverflow: 'ellipsis'
                    }}
                  />
                  <button
                    type="button"
                    onClick={copyGroupLink}
                    style={{
                      background: cNavy,
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: isRTL ? '6px 0 0 6px' : '0 6px 6px 0',
                      padding: '0 22px',
                      fontSize: '11.5px',
                      fontWeight: '800',
                      letterSpacing: '0.5px',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    {copiedLink ? (isRTL ? 'تم النسخ!' : 'COPIED!') : (isRTL ? 'نسخ' : 'COPY')}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: cBorder, margin: '22px 0' }} />

              {/* Section 2: Invite via Email */}
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '700', color: cText }}>
                  {isRTL ? 'دعوة عبر البريد الإلكتروني' : 'Invite via Email'}
                </div>
                <p style={{ margin: '3px 0 16px 0', fontSize: '11.5px', color: cTextSub }}>
                  {isRTL
                    ? 'سيتم قبول الأعضاء المدعوين تلقائياً للانضمام إلى المجموعة'
                    : 'Invited members will be auto approved to join group'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Name Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: cText, width: '130px', flexShrink: 0 }}>
                      {isRTL ? 'الاسم' : 'Name'}
                    </label>
                    <input
                      type="text"
                      placeholder={isRTL ? 'أدخل الاسم' : 'Enter Name'}
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      style={{
                        flex: 1,
                        background: isLight ? '#ffffff' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${cBorder}`,
                        borderRadius: '6px',
                        padding: '9px 14px',
                        fontSize: '12.5px',
                        color: cText,
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Email Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: cText, width: '130px', flexShrink: 0 }}>
                      {isRTL ? 'البريد الإلكتروني' : 'Email'}
                    </label>
                    <input
                      type="email"
                      placeholder={isRTL ? 'أدخل البريد الإلكتروني' : 'Enter Email'}
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      style={{
                        flex: 1,
                        background: isLight ? '#ffffff' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${cBorder}`,
                        borderRadius: '6px',
                        padding: '9px 14px',
                        fontSize: '12.5px',
                        color: cText,
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Give Administrative Privileges */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    marginTop: '6px'
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: cText }}>
                        {isRTL ? 'منح صلاحيات إدارية' : 'Give Administrative Privileges'}
                      </div>
                      <div style={{ fontSize: '11.5px', color: cTextSub, marginTop: '2px' }}>
                        {isRTL
                          ? 'السماح لهذا العضو بالقيام بجميع الإجراءات الإدارية'
                          : 'Allow this member to perform all administrative actions'}
                      </div>
                    </div>

                    {/* iOS Switch */}
                    <div
                      role="switch"
                      aria-checked={inviteIsAdmin}
                      onClick={() => setInviteIsAdmin(!inviteIsAdmin)}
                      style={{
                        width: '38px',
                        height: '22px',
                        borderRadius: '9999px',
                        background: inviteIsAdmin ? '#2563eb' : (isLight ? '#cbd5e1' : '#475569'),
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        flexShrink: 0
                      }}
                    >
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          background: '#ffffff',
                          position: 'absolute',
                          top: '3px',
                          left: inviteIsAdmin ? '19px' : '3px',
                          transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.25)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button: SEND INVITE */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '26px'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    if (!inviteEmail.trim()) {
                      showToast(isRTL ? 'يرجى إدخال البريد الإلكتروني للمدعو' : 'Please enter member email');
                      return;
                    }
                    showToast(
                      isRTL
                        ? `تم إرسال الدعوة بنجاح إلى ${inviteName.trim() ? inviteName.trim() + ' (' + inviteEmail.trim() + ')' : inviteEmail.trim()}`
                        : `Invitation sent successfully to ${inviteName.trim() ? inviteName.trim() + ' (' + inviteEmail.trim() + ')' : inviteEmail.trim()}`
                    );
                    setInviteEmail('');
                    setInviteName('');
                    setInviteIsAdmin(false);
                    setShowInviteModal(false);
                  }}
                  style={{
                    background: cNavy,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 24px',
                    fontSize: '12px',
                    fontWeight: '800',
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    boxShadow: isLight ? '0 2px 8px rgba(26, 54, 93, 0.25)' : '0 2px 8px rgba(37, 99, 235, 0.4)'
                  }}
                >
                  {isRTL ? 'إرسال الدعوة' : 'SEND INVITE'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GO LIVE SETUP (GoHighLevel / ClientClub Exact Replica - Screenshot 2) */}
      {/* ========================================================================= */}
      {showGoLiveModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: cCardBg,
            border: `1px solid ${cBorder}`,
            borderRadius: '16px',
            width: '100%',
            maxWidth: '920px',
            boxShadow: isLight ? '0 25px 50px -12px rgba(0,0,0,0.25)' : '0 25px 50px -12px rgba(0,0,0,0.7)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${cBorder}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: `1px solid ${cBorder}`,
                  background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: cText
                }}>
                  <Video size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: cText }}>
                    Go Live
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: cTextSub }}>
                    Choose how you want to go live
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGoLiveModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: cTextSub,
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: 3-column Layout */}
            <div style={{
              padding: '24px 28px',
              display: 'grid',
              gridTemplateColumns: '210px 1fr 280px',
              gap: '24px',
              maxHeight: '75vh',
              overflowY: 'auto'
            }}>
              {/* LEFT COLUMN: Host & Where to post */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: cText, marginBottom: '12px' }}>
                    Create a live Video
                  </div>
                  {/* Host Row */}
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
                      fontSize: '12.5px',
                      fontWeight: '800'
                    }}>
                      {authorInitials}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: cText }}>
                        {coachName.toLowerCase()}
                      </div>
                      <div style={{ fontSize: '11px', color: cTextSub }}>
                        Host
                      </div>
                    </div>
                  </div>
                </div>

                {/* Choose where to post */}
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: '700', color: cTextSub, display: 'block', marginBottom: '6px' }}>
                    Choose where to post
                  </label>
                  <select
                    value={goLiveForm.channel}
                    onChange={(e) => setGoLiveForm({ ...goLiveForm, channel: e.target.value })}
                    style={{
                      width: '100%',
                      background: isLight ? '#ffffff' : '#1e293b',
                      border: `1px solid ${cBorder}`,
                      borderRadius: '8px',
                      padding: '9px 12px',
                      fontSize: '12.5px',
                      color: cText,
                      outline: 'none'
                    }}
                  >
                    {channels.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* When are you going live */}
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: '700', color: cTextSub, display: 'block', marginBottom: '6px' }}>
                    When are you going live?
                  </label>
                  <select
                    value={goLiveForm.schedule}
                    onChange={(e) => setGoLiveForm({ ...goLiveForm, schedule: e.target.value })}
                    style={{
                      width: '100%',
                      background: isLight ? '#ffffff' : '#1e293b',
                      border: `1px solid ${cBorder}`,
                      borderRadius: '8px',
                      padding: '9px 12px',
                      fontSize: '12.5px',
                      color: cText,
                      outline: 'none'
                    }}
                  >
                    <option value="now">Now</option>
                    <option value="later">Schedule for later</option>
                  </select>
                </div>
              </div>

              {/* CENTER COLUMN: Video Preview & Source Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 16:9 Video Preview Box */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16 / 9',
                  background: '#000000',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <video
                    ref={previewVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: previewCameraOn ? 'block' : 'none'
                    }}
                  />

                  {/* Fallback when camera is toggled off */}
                  {!previewCameraOn && (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: '#e11d48',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '16px'
                      }}>
                        {authorInitials}
                      </div>
                      <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>Camera is off</span>
                    </div>
                  )}

                  {/* Overlaid Camera & Mic Toggle Buttons (Bottom Right of Video) */}
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    zIndex: 5
                  }}>
                    <button
                      type="button"
                      onClick={handleTogglePreviewCamera}
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: '#ef4444',
                        border: 'none',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                      }}
                      title={previewCameraOn ? 'Turn camera off' : 'Turn camera on'}
                    >
                      {previewCameraOn ? <Video size={16} /> : <VideoOff size={16} />}
                    </button>

                    <button
                      type="button"
                      onClick={handleTogglePreviewMic}
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: '#ef4444',
                        border: 'none',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                      }}
                      title={previewMicOn ? 'Mute microphone' : 'Unmute microphone'}
                    >
                      {previewMicOn ? <Mic size={16} /> : <MicOff size={16} />}
                    </button>
                  </div>
                </div>

                {/* Select Video Source */}
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: '800', color: cText, marginBottom: '8px' }}>
                    Select Video Source
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setGoLiveForm({ ...goLiveForm, videoSource: 'meeting_room' })}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: goLiveForm.videoSource === 'meeting_room' ? '1.5px solid #2563eb' : `1px solid ${cBorder}`,
                        background: goLiveForm.videoSource === 'meeting_room' ? (isLight ? '#eff6ff' : 'rgba(37, 99, 235, 0.12)') : 'transparent',
                        color: goLiveForm.videoSource === 'meeting_room' ? (isLight ? '#1d4ed8' : '#60a5fa') : cText,
                        fontSize: '12px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Video size={15} color={goLiveForm.videoSource === 'meeting_room' ? '#2563eb' : cTextSub} />
                      <span>Meeting Room</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setGoLiveForm({ ...goLiveForm, videoSource: 'streaming_software' })}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: goLiveForm.videoSource === 'streaming_software' ? '1.5px solid #2563eb' : `1px solid ${cBorder}`,
                        background: goLiveForm.videoSource === 'streaming_software' ? (isLight ? '#eff6ff' : 'rgba(37, 99, 235, 0.12)') : 'transparent',
                        color: goLiveForm.videoSource === 'streaming_software' ? (isLight ? '#1d4ed8' : '#60a5fa') : cText,
                        fontSize: '12px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Radio size={15} color={goLiveForm.videoSource === 'streaming_software' ? '#2563eb' : cTextSub} />
                      <span>Streaming Software</span>
                    </button>
                  </div>

                  <p style={{ margin: 0, fontSize: '11px', color: cTextSub, lineHeight: '1.5' }}>
                    Use the Meeting Rooms feature to host live sessions where all participants can turn on their webcams, unmute, and interact in real-time. This creates a virtual room experience similar to Zoom or Google Meet, allowing everyone to see and talk to each other face-to-face.
                  </p>
                </div>

                {/* Camera Controls with (i) */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', color: cText, marginBottom: '8px' }}>
                    <span>Camera Controls</span>
                    <Info size={13} color={cTextSub} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Camera Select */}
                    <div style={{ position: 'relative' }}>
                      <select
                        value={goLiveForm.selectedCamera}
                        onChange={(e) => setGoLiveForm({ ...goLiveForm, selectedCamera: e.target.value })}
                        style={{
                          width: '100%',
                          background: isLight ? '#ffffff' : '#1e293b',
                          border: `1px solid ${cBorder}`,
                          borderRadius: '8px',
                          padding: '9px 12px 9px 34px',
                          fontSize: '12px',
                          color: cText,
                          outline: 'none'
                        }}
                      >
                        {detectedCameras.map((cam, idx) => (
                          <option key={cam.deviceId || idx} value={cam.deviceId}>
                            {cam.label || `Camera ${idx + 1}`}
                          </option>
                        ))}
                      </select>
                      <Video size={14} color={cTextSub} style={{ position: 'absolute', left: '10px', top: '12px', pointerEvents: 'none' }} />
                    </div>

                    {/* Microphone Select */}
                    <div style={{ position: 'relative' }}>
                      <select
                        value={goLiveForm.selectedMic}
                        onChange={(e) => setGoLiveForm({ ...goLiveForm, selectedMic: e.target.value })}
                        style={{
                          width: '100%',
                          background: isLight ? '#ffffff' : '#1e293b',
                          border: `1px solid ${cBorder}`,
                          borderRadius: '8px',
                          padding: '9px 12px 9px 34px',
                          fontSize: '12px',
                          color: cText,
                          outline: 'none'
                        }}
                      >
                        {detectedMics.map((mic, idx) => (
                          <option key={mic.deviceId || idx} value={mic.deviceId}>
                            {mic.label || `Microphone ${idx + 1}`}
                          </option>
                        ))}
                      </select>
                      <Mic size={14} color={cTextSub} style={{ position: 'absolute', left: '10px', top: '12px', pointerEvents: 'none' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Add Post Details & Settings */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: cText }}>
                  Add Post Details
                </div>

                {/* Title with Character Counter */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: '700', color: cTextSub }}>
                      Title *
                    </label>
                    <span style={{ fontSize: '11px', color: cTextSub }}>
                      {goLiveForm.title.length} / 50
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={50}
                    required
                    value={goLiveForm.title}
                    onChange={(e) => setGoLiveForm({ ...goLiveForm, title: e.target.value })}
                    placeholder="e.g. Weekly Q&A Session"
                    style={{
                      width: '100%',
                      background: isLight ? '#ffffff' : '#1e293b',
                      border: `1px solid ${cBorder}`,
                      borderRadius: '8px',
                      padding: '9px 12px',
                      fontSize: '12.5px',
                      color: cText,
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontSize: '11.5px', fontWeight: '700', color: cTextSub, display: 'block', marginBottom: '6px' }}>
                    Description *
                  </label>
                  <textarea
                    rows={4}
                    value={goLiveForm.description}
                    onChange={(e) => setGoLiveForm({ ...goLiveForm, description: e.target.value })}
                    placeholder="Brief description of your live session..."
                    style={{
                      width: '100%',
                      background: isLight ? '#ffffff' : '#1e293b',
                      border: `1px solid ${cBorder}`,
                      borderRadius: '8px',
                      padding: '10px 12px',
                      fontSize: '12.5px',
                      color: cText,
                      outline: 'none',
                      resize: 'none'
                    }}
                  />
                </div>

                {/* Settings Section */}
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: '800', color: cText, marginBottom: '10px' }}>
                    Settings
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '12px', color: cText, lineHeight: '1.4' }}>
                      <input
                        type="checkbox"
                        checked={goLiveForm.keepAsPost}
                        onChange={(e) => setGoLiveForm({ ...goLiveForm, keepAsPost: e.target.checked })}
                        style={{ marginTop: '2px' }}
                      />
                      <span>Keep live stream as post</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '12px', color: cTextSub, lineHeight: '1.4' }}>
                      <input
                        type="checkbox"
                        checked={goLiveForm.notifyMembers}
                        onChange={(e) => setGoLiveForm({ ...goLiveForm, notifyMembers: e.target.checked })}
                        style={{ marginTop: '2px' }}
                      />
                      <span>Notify members you're going live (sends only in-app and push notifications)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 24px',
              borderTop: `1px solid ${cBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.02)'
            }}>
              <button
                type="button"
                onClick={() => setShowGoLiveModal(false)}
                style={{
                  background: 'transparent',
                  border: `1px solid ${cBorder}`,
                  borderRadius: '6px',
                  padding: '9px 18px',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  color: cTextSub,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartGoLive}
                style={{
                  background: cNavy,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '9px 24px',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: isLight ? '0 2px 8px rgba(26, 54, 93, 0.25)' : '0 2px 8px rgba(37, 99, 235, 0.4)'
                }}
              >
                Go Live
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GROUP SETTINGS (GoHighLevel / ClientClub Full 12-Tab Replica)      */}
      {/* ========================================================================= */}
      {showSettingsModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: cCardBg,
            border: `1px solid ${cBorder}`,
            borderRadius: '16px',
            width: '100%',
            maxWidth: '920px',
            height: '700px',
            maxHeight: '92vh',
            boxShadow: isLight ? '0 25px 50px -12px rgba(0,0,0,0.25)' : '0 25px 50px -12px rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* 1. Modal Top Header */}
            <div style={{
              padding: '14px 20px',
              borderBottom: `1px solid ${cBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: isLight ? '#ffffff' : 'rgba(255,255,255,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: isLight ? '#e0f2fe' : 'rgba(56, 189, 248, 0.15)',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${isLight ? '#bae6fd' : 'rgba(56, 189, 248, 0.3)'}`
                }}>
                  <Compass size={17} />
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: '800', color: cText, lineHeight: 1.2 }}>
                    {settingsForm.name || group.name || 'Group'}
                  </div>
                  <div style={{ fontSize: '11px', color: cTextSub }}>
                    {isRTL ? 'إعدادات المجتمع' : 'Group Settings'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowSettingsModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: cTextSub,
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* 2. Modal Body (Sidebar + Content) */}
            <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
              
              {/* Left Sidebar Navigation (12 Tabs) */}
              <div style={{
                width: '190px',
                flexShrink: 0,
                borderRight: isRTL ? 'none' : `1px solid ${cBorder}`,
                borderLeft: isRTL ? `1px solid ${cBorder}` : 'none',
                background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.01)',
                padding: '12px 8px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                {[
                  { id: 'details', label: isRTL ? 'التفاصيل' : 'Details' },
                  { id: 'subscriptions', label: isRTL ? 'الاشتراكات' : 'Subscriptions' },
                  { id: 'newsletter', label: isRTL ? 'النشرة البريدية' : 'Newsletter' },
                  { id: 'branding', label: isRTL ? 'الهوية البصرية' : 'Branding' },
                  { id: 'themes', label: isRTL ? 'المظهر والألوان' : 'Themes' },
                  { id: 'tabs', label: isRTL ? 'إظهار / إخفاء التبويبات' : 'Show / Hide Tabs' },
                  { id: 'questions', label: isRTL ? 'أسئلة العضوية' : 'Membership Questions' },
                  { id: 'gamification', label: isRTL ? 'المكافآت والتحفيز' : 'Gamification & Rewards' },
                  { id: 'links', label: isRTL ? 'الروابط المخصصة' : 'Links' },
                  { id: 'reported', label: isRTL ? 'المحتوى المُبلغ عنه' : 'Reported Content' },
                  { id: 'import', label: isRTL ? 'استيراد الأعضاء' : 'Import' },
                  { id: 'discovery', label: isRTL ? 'الاستكشاف' : 'Discovery' }
                ].map(item => {
                  const isActive = settingsTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSettingsTab(item.id)}
                      style={{
                        textAlign: isRTL ? 'right' : 'left',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: isActive ? (isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)') : 'transparent',
                        color: isActive ? cText : cTextSub,
                        fontSize: '12.5px',
                        fontWeight: isActive ? '700' : '500',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* Right Content Panel */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px 28px',
                background: isLight ? '#ffffff' : 'transparent'
              }}>

                {/* ----------------------------------------------------------------- */}
                {/* TAB 1: DETAILS (Screenshot 1)                                     */}
                {/* ----------------------------------------------------------------- */}
                {settingsTab === 'details' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: cText }}>
                        {isRTL ? 'تحديث تفاصيل المجتمع' : 'Update Group Details'}
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: cTextSub }}>
                        {isRTL ? 'قم بتحديث تفاصيل مجتمعك هنا' : 'Update your group details here'}
                      </p>
                    </div>

                    {/* Group Name */}
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: cText, display: 'block', marginBottom: '6px' }}>
                        {isRTL ? 'اسم المجتمع' : 'Group Name'}
                      </label>
                      <input
                        type="text"
                        value={settingsForm.name}
                        onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                        style={{
                          width: '100%',
                          background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${cBorder}`,
                          borderRadius: '8px',
                          padding: '9px 12px',
                          fontSize: '13px',
                          color: cText,
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* URL */}
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: cText, display: 'block', marginBottom: '6px' }}>
                        {isRTL ? 'رابط المجتمع (URL)' : 'URL'}
                      </label>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${cBorder}`,
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}>
                        <span style={{
                          padding: '9px 12px',
                          fontSize: '12px',
                          color: cTextSub,
                          background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.03)',
                          borderRight: isRTL ? 'none' : `1px solid ${cBorder}`,
                          borderLeft: isRTL ? `1px solid ${cBorder}` : 'none',
                          whiteSpace: 'nowrap'
                        }}>
                          https://app.clientclub.net/communities/groups/
                        </span>
                        <input
                          type="text"
                          value={settingsForm.slug}
                          onChange={(e) => setSettingsForm({ ...settingsForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                          style={{
                            flex: 1,
                            border: 'none',
                            padding: '9px 12px',
                            fontSize: '13px',
                            color: cText,
                            background: 'transparent',
                            outline: 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={copyGroupLink}
                          title={isRTL ? 'نسخ الرابط' : 'Copy link'}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '9px 12px',
                            color: cTextSub,
                            cursor: 'pointer'
                          }}
                        >
                          <Link2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: cText }}>
                          {isRTL ? 'الوصف' : 'Description'}
                        </label>
                        <span style={{ fontSize: '11px', color: cTextMuted }}>
                          {settingsForm.description?.length || 0} / 150
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        maxLength={150}
                        value={settingsForm.description}
                        onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                        placeholder={isRTL ? 'اكتب وصفاً موجزاً للمجتمع...' : 'Enter a brief group description...'}
                        style={{
                          width: '100%',
                          background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${cBorder}`,
                          borderRadius: '8px',
                          padding: '9px 12px',
                          fontSize: '13px',
                          color: cText,
                          outline: 'none',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    {/* Privacy Radio Cards */}
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: cText, display: 'block', marginBottom: '8px' }}>
                        {isRTL ? 'الخصوصية' : 'Privacy'}
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        {/* Public Option */}
                        <div
                          onClick={() => setSettingsForm({ ...settingsForm, privacy: 'public' })}
                          style={{
                            border: `1.5px solid ${settingsForm.privacy === 'public' ? '#2563eb' : cBorder}`,
                            borderRadius: '10px',
                            padding: '14px',
                            cursor: 'pointer',
                            background: settingsForm.privacy === 'public' ? (isLight ? '#eff6ff' : 'rgba(37, 99, 235, 0.12)') : (isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.03)'),
                            transition: 'all 0.15s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <div style={{
                              width: '15px',
                              height: '15px',
                              borderRadius: '50%',
                              border: `2px solid ${settingsForm.privacy === 'public' ? '#2563eb' : cBorder}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {settingsForm.privacy === 'public' && (
                                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#2563eb' }} />
                              )}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: '800', color: cText }}>
                              {isRTL ? 'عام (Public)' : 'Public'}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '11px', color: cTextSub, lineHeight: 1.45 }}>
                            {isRTL ? 'يمكن لأي شخص رؤية منشورات المجموعة وأعضائها' : 'Anyone can see the group posts and other members of the group'}
                          </p>
                        </div>

                        {/* Private Option */}
                        <div
                          onClick={() => setSettingsForm({ ...settingsForm, privacy: 'private' })}
                          style={{
                            border: `1.5px solid ${settingsForm.privacy === 'private' ? '#2563eb' : cBorder}`,
                            borderRadius: '10px',
                            padding: '14px',
                            cursor: 'pointer',
                            background: settingsForm.privacy === 'private' ? (isLight ? '#eff6ff' : 'rgba(37, 99, 235, 0.12)') : (isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.03)'),
                            transition: 'all 0.15s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <div style={{
                              width: '15px',
                              height: '15px',
                              borderRadius: '50%',
                              border: `2px solid ${settingsForm.privacy === 'private' ? '#2563eb' : cBorder}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {settingsForm.privacy === 'private' && (
                                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#2563eb' }} />
                              )}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: '800', color: cText }}>
                              {isRTL ? 'خاص (Private)' : 'Private'}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '11px', color: cTextSub, lineHeight: 1.45 }}>
                            {isRTL ? 'فقط الأعضاء يمكنهم رؤية منشورات المجموعة والأعضاء' : 'Only members can see the group posts and other members of the group'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Checkbox 1: Accessible from switcher */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: `1px solid ${cBorder}`,
                      background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)'
                    }}>
                      <input
                        type="checkbox"
                        id="accessibleFromSwitcher"
                        checked={settingsForm.accessibleFromSwitcher}
                        onChange={(e) => setSettingsForm({ ...settingsForm, accessibleFromSwitcher: e.target.checked })}
                        style={{ marginTop: '2px', cursor: 'pointer', width: '15px', height: '15px', accentColor: '#2563eb' }}
                      />
                      <div>
                        <label htmlFor="accessibleFromSwitcher" style={{ fontSize: '12.5px', fontWeight: '700', color: cText, cursor: 'pointer', display: 'block' }}>
                          {isRTL ? 'إمكانية الوصول من محدد المجتمعات (Accessible from switcher)' : 'Accessible from switcher'}
                        </label>
                        <div style={{ fontSize: '11px', color: cTextSub, marginTop: '2px' }}>
                          {isRTL ? 'ستكون مجموعتك مرئية لغير الأعضاء في قائمة التبديل السريع' : 'Your group will be visible to non-group members in the switcher'}
                        </div>
                      </div>
                    </div>

                    {/* Checkbox 2: Allow members to invite new members */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: `1px solid ${cBorder}`,
                      background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)'
                    }}>
                      <input
                        type="checkbox"
                        id="allowMemberInvites"
                        checked={settingsForm.allowMemberInvites}
                        onChange={(e) => setSettingsForm({ ...settingsForm, allowMemberInvites: e.target.checked })}
                        style={{ marginTop: '2px', cursor: 'pointer', width: '15px', height: '15px', accentColor: '#2563eb' }}
                      />
                      <div>
                        <label htmlFor="allowMemberInvites" style={{ fontSize: '12.5px', fontWeight: '700', color: cText, cursor: 'pointer', display: 'block' }}>
                          {isRTL ? 'السماح للأعضاء بدعوة أعضاء جدد (Allow members to invite new members)' : 'Allow members to invite new members'}
                        </label>
                        <div style={{ fontSize: '11px', color: cTextSub, marginTop: '2px' }}>
                          {isRTL ? 'يخفي زر الدعوة للأعضاء عند التعطيل. يمكن للأعضاء دعوة الآخرين فقط إذا تم تفعيل هذا الخيار.' : 'Hides the Invite button for members when turned off. Members can only invite others if this is enabled.'}
                        </div>
                      </div>
                    </div>

                    {/* Checkbox 3: Show mandatory profile modal */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: `1px solid ${cBorder}`,
                      background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)'
                    }}>
                      <input
                        type="checkbox"
                        id="showMandatoryProfileModal"
                        checked={settingsForm.showMandatoryProfileModal}
                        onChange={(e) => setSettingsForm({ ...settingsForm, showMandatoryProfileModal: e.target.checked })}
                        style={{ marginTop: '2px', cursor: 'pointer', width: '15px', height: '15px', accentColor: '#2563eb' }}
                      />
                      <div>
                        <label htmlFor="showMandatoryProfileModal" style={{ fontSize: '12.5px', fontWeight: '700', color: cText, cursor: 'pointer', display: 'block' }}>
                          {isRTL ? 'إظهار نافذة إكمال الملف الشخصي الإلزامية (Show mandatory profile modal)' : 'Show mandatory profile modal'}
                        </label>
                        <div style={{ fontSize: '11px', color: cTextSub, marginTop: '2px' }}>
                          {isRTL ? 'عند التفعيل، سيُطلب من الأعضاء إكمال بيانات ملفهم الشخصي عند الانضمام للمجموعة.' : 'When enabled, members will be prompted to complete their profile information when joining the group.'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ----------------------------------------------------------------- */}
                {/* TAB 2: SUBSCRIPTIONS (Screenshot 2)                               */}
                {/* ----------------------------------------------------------------- */}
                {settingsTab === 'subscriptions' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: cText }}>
                        {isRTL ? 'إدارة الاشتراكات' : 'Manage your Subscriptions'}
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: cTextSub }}>
                        {isRTL ? 'عرض وإدارة خطط أسعار واشتراكات المجموعة' : 'View and manage group subscriptions'}
                      </p>
                    </div>

                    <div style={{
                      border: `1px solid ${cBorder}`,
                      borderRadius: '10px',
                      padding: '16px',
                      background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: '2px solid #2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }} />
                      </div>
                      <span style={{ fontSize: '13.5px', fontWeight: '700', color: cText }}>
                        {isRTL ? 'مجاني (Free)' : 'Free'}
                      </span>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => showToast(isRTL ? 'تم تفعيل نافذة إضافة سعر اشتراك جديد' : 'Add price tier opened')}
                        style={{
                          background: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 18px',
                          fontSize: '12.5px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Plus size={15} />
                        <span>{isRTL ? '+ إضافة سعر' : '+ Add Price'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* ----------------------------------------------------------------- */}
                {/* TAB 3: NEWSLETTER (Screenshot 3)                                  */}
                {/* ----------------------------------------------------------------- */}
                {settingsTab === 'newsletter' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: cText }}>
                        {isRTL ? 'النشرة البريدية' : 'Newsletter'}
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: cTextSub }}>
                        {isRTL ? 'ملخص مجتمعك الدوري' : 'Your Community Digest'}
                      </p>
                    </div>

                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: cText, display: 'block', marginBottom: '6px' }}>
                        {isRTL ? 'تكرار النشرة البريدية' : 'Newsletter Frequency'}
                      </label>
                      <select
                        value={settingsForm.newsletterFreq}
                        onChange={(e) => setSettingsForm({ ...settingsForm, newsletterFreq: e.target.value })}
                        style={{
                          width: '280px',
                          background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${cBorder}`,
                          borderRadius: '8px',
                          padding: '9px 12px',
                          fontSize: '13px',
                          color: cText,
                          outline: 'none'
                        }}
                      >
                        <option value="off">{isRTL ? 'معطل (Off)' : 'Off'}</option>
                        <option value="daily">{isRTL ? 'يومي (Daily)' : 'Daily'}</option>
                        <option value="weekly">{isRTL ? 'أسبوعي (Weekly)' : 'Weekly'}</option>
                        <option value="monthly">{isRTL ? 'شهري (Monthly)' : 'Monthly'}</option>
                      </select>
                      <div style={{ fontSize: '11px', color: cTextSub, marginTop: '6px' }}>
                        {isRTL ? 'ملخص للمنشورات الأكثر شعبية ونشاط الأعضاء والفعاليات من هذه المجموعة' : 'A summary of popular posts, member activity and events from this group'}
                      </div>
                    </div>
                  </div>
                )}

                {/* ----------------------------------------------------------------- */}
                {/* TAB 4: BRANDING (Screenshot 4)                                    */}
                {/* ----------------------------------------------------------------- */}
                {settingsTab === 'branding' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: cText }}>
                        {isRTL ? 'تخصيص الهوية البصرية لمجموعتك' : 'You can brand your group as per your choice here'}
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: cTextSub }}>
                        {isRTL ? 'تحديث الهوية البصرية والشعارات' : 'Update Branding'}
                      </p>
                    </div>

                    {/* Favicon Upload */}
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: cText, display: 'block', marginBottom: '6px' }}>
                        {isRTL ? 'أيقونة الموقع (Favicon)' : 'Favicon'}
                      </label>
                      <div
                        onClick={() => {
                          const url = prompt(isRTL ? 'أدخل رابط أيقونة Favicon:' : 'Enter Favicon URL:');
                          if (url) setSettingsForm({ ...settingsForm, faviconUrl: url });
                        }}
                        style={{
                          border: `1.5px dashed ${isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.2)'}`,
                          borderRadius: '12px',
                          padding: '24px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.02)',
                          transition: 'all 0.15s'
                        }}
                      >
                        <UploadCloud size={24} style={{ color: cTextSub, marginBottom: '6px' }} />
                        <span style={{ fontSize: '12.5px', fontWeight: '700', color: cText }}>
                          {settingsForm.faviconUrl ? (isRTL ? 'تم الرفع بنجاح (انقر للتغيير)' : 'Favicon Uploaded (Click to replace)') : (isRTL ? 'انقر لرفع Favicon' : 'Click to upload Favicon')}
                        </span>
                        <span style={{ fontSize: '11px', color: cTextMuted, marginTop: '2px' }}>
                          Drag and drop a SVG, PNG, JPG, JPEG, WEBP, ICO (Aspect Ratio 1:1)
                        </span>
                      </div>
                    </div>

                    {/* Cover Image Upload */}
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: cText, display: 'block', marginBottom: '6px' }}>
                        {isRTL ? 'صورة الغلاف (Cover Image)' : 'Cover Image'}
                      </label>
                      <div
                        onClick={() => {
                          const url = prompt(isRTL ? 'أدخل رابط صورة الغلاف:' : 'Enter Cover Image URL:');
                          if (url) setSettingsForm({ ...settingsForm, coverImageUrl: url });
                        }}
                        style={{
                          border: `1.5px dashed ${isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.2)'}`,
                          borderRadius: '12px',
                          padding: '28px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.02)',
                          transition: 'all 0.15s'
                        }}
                      >
                        <UploadCloud size={24} style={{ color: cTextSub, marginBottom: '6px' }} />
                        <span style={{ fontSize: '12.5px', fontWeight: '700', color: cText }}>
                          {settingsForm.coverImageUrl ? (isRTL ? 'تم رفع الغلاف بنجاح (انقر للتغيير)' : 'Cover Uploaded (Click to replace)') : (isRTL ? 'انقر لرفع Cover' : 'Click to upload Cover')}
                        </span>
                        <span style={{ fontSize: '11px', color: cTextMuted, marginTop: '2px' }}>
                          Drag and drop a SVG, PNG, JPG, JPEG, WEBP, ICO (Aspect Ratio 16:9)
                        </span>
                      </div>
                    </div>

                    {/* Logo Upload */}
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: cText, display: 'block', marginBottom: '6px' }}>
                        {isRTL ? 'الشعار (Logo)' : 'Logo'}
                      </label>
                      <div
                        onClick={() => {
                          const url = prompt(isRTL ? 'أدخل رابط الشعار:' : 'Enter Logo URL:');
                          if (url) setSettingsForm({ ...settingsForm, logoUrl: url });
                        }}
                        style={{
                          border: `1.5px dashed ${isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.2)'}`,
                          borderRadius: '12px',
                          padding: '24px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.02)',
                          transition: 'all 0.15s'
                        }}
                      >
                        <UploadCloud size={24} style={{ color: cTextSub, marginBottom: '6px' }} />
                        <span style={{ fontSize: '12.5px', fontWeight: '700', color: cText }}>
                          {settingsForm.logoUrl ? (isRTL ? 'تم رفع الشعار بنجاح (انقر للتغيير)' : 'Logo Uploaded (Click to replace)') : (isRTL ? 'انقر لرفع Group Logo' : 'Click to upload Group Logo')}
                        </span>
                        <span style={{ fontSize: '11px', color: cTextMuted, marginTop: '2px' }}>
                          Drag and drop a SVG, PNG, JPG, JPEG, WEBP, ICO (Aspect Ratio 1:1)
                        </span>
                      </div>
                    </div>

                    {/* Advanced Accordion */}
                    <div
                      onClick={() => showToast(isRTL ? 'إعدادات العلامة البيضاء المتقدمة مفعلة' : 'Advanced white-label settings ready')}
                      style={{
                        border: `1px solid ${cBorder}`,
                        borderRadius: '10px',
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)'
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: '700', color: cText }}>
                        {isRTL ? 'إعدادات متقدمة (Advanced)' : 'Advanced'}
                      </span>
                      <ChevronRight size={16} style={{ color: cTextSub }} />
                    </div>
                  </div>
                )}

                {/* ----------------------------------------------------------------- */}
                {/* TAB 5: THEMES (Screenshot 5)                                      */}
                {/* ----------------------------------------------------------------- */}
                {settingsTab === 'themes' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: cText }}>
                        {isRTL ? 'تخصيص مظهر المجموعة' : 'You can configure your group appearance as per your choice here'}
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: cTextSub }}>
                        {isRTL ? 'تحديث مظهر المجموعة والألوان هنا' : 'Update your group appearance here'}
                      </p>
                    </div>

                    {/* Color Mode */}
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: cText, marginBottom: '2px' }}>
                        {isRTL ? 'نمط الألوان (Color Mode)' : 'Color Mode'}
                      </div>
                      <div style={{ fontSize: '11px', color: cTextSub, marginBottom: '10px' }}>
                        {isRTL ? 'معاينة كيف ستبدو مجموعتك في الوضع الفاتح والداكن' : 'Preview how your group will look in light and dark mode'}
                      </div>

                      {/* Segmented Light / Dark */}
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        border: `1px solid ${cBorder}`,
                        borderRadius: '8px',
                        padding: '3px',
                        background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.06)'
                      }}>
                        <button
                          type="button"
                          onClick={() => toggleTheme('light')}
                          style={{
                            background: isLight ? '#ffffff' : 'transparent',
                            color: isLight ? '#0f172a' : cTextSub,
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 16px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                          }}
                        >
                          <Sun size={14} color={isLight ? '#f59e0b' : '#94a3b8'} />
                          <span>{isRTL ? 'فاتح' : 'Light'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleTheme('dark')}
                          style={{
                            background: !isLight ? '#2563eb' : 'transparent',
                            color: !isLight ? '#ffffff' : cTextSub,
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 16px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: !isLight ? '0 1px 4px rgba(37, 99, 235, 0.4)' : 'none'
                          }}
                        >
                          <Moon size={14} color={!isLight ? '#ffffff' : '#94a3b8'} />
                          <span>{isRTL ? 'داكن' : 'Dark'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Sub-Tabs: Community Theme | Custom Theme */}
                    <div style={{ display: 'flex', gap: '20px', borderBottom: `1px solid ${cBorder}`, paddingBottom: '6px' }}>
                      <button
                        type="button"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          fontSize: '13px',
                          fontWeight: '700',
                          color: '#2563eb',
                          cursor: 'pointer',
                          borderBottom: '2px solid #2563eb',
                          paddingBottom: '6px'
                        }}
                      >
                        {isRTL ? 'سمات المجتمع (Community Theme)' : 'Community Theme'}
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast(isRTL ? 'أداة السمة المخصصة جاهزة' : 'Custom theme builder ready')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: cTextSub,
                          cursor: 'pointer',
                          paddingBottom: '6px'
                        }}
                      >
                        {isRTL ? 'سمة مخصصة (Custom Theme)' : 'Custom Theme'}
                      </button>
                    </div>

                    {/* 9 Palette Cards Grid (Screenshot 5) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      {[
                        { id: 'default', name: 'Default', color: '#1a365d', lightColor: '#e2e8f0' },
                        { id: 'zesty-citrus', name: 'Zesty Citrus', color: '#ea580c', lightColor: '#fed7aa' },
                        { id: 'royal-velvet', name: 'Royal Velvet', color: '#4c1d95', lightColor: '#e9d5ff' },
                        { id: 'sunny-delight', name: 'Sunny Delight', color: '#ca8a04', lightColor: '#fef08a' },
                        { id: 'lush-meadow', name: 'Lush Meadow', color: '#059669', lightColor: '#a7f3d0' },
                        { id: 'azure-dreams', name: 'Azure Dreams', color: '#0284c7', lightColor: '#bae6fd' },
                        { id: 'bubblegum-bliss', name: 'Bubblegum Bliss', color: '#db2777', lightColor: '#fbcfe8' },
                        { id: 'ivory-whisper', name: 'Ivory Whisper', color: '#57534e', lightColor: '#f5f5f4' },
                        { id: 'midnight-deep', name: 'Midnight Deep', color: '#1e1b4b', lightColor: '#c7d2fe' }
                      ].map(pal => {
                        const isSelected = (settingsForm.colorTheme || 'default') === pal.id;
                        return (
                          <div
                            key={pal.id}
                            onClick={() => setSettingsForm({ ...settingsForm, colorTheme: pal.id })}
                            style={{
                              border: `1.5px solid ${isSelected ? '#2563eb' : cBorder}`,
                              borderRadius: '10px',
                              padding: '10px 12px',
                              cursor: 'pointer',
                              background: isSelected ? (isLight ? '#eff6ff' : 'rgba(37, 99, 235, 0.12)') : (isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)'),
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              transition: 'all 0.15s'
                            }}
                          >
                            <div style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              background: pal.lightColor,
                              border: `2px solid ${pal.color}`,
                              flexShrink: 0
                            }} />
                            <span style={{ fontSize: '11.5px', fontWeight: isSelected ? '800' : '600', color: cText }}>
                              {pal.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ----------------------------------------------------------------- */}
                {/* ----------------------------------------------------------------- */}
                {/* TAB 6: SHOW / HIDE TABS (Screenshot 1)                            */}
                {/* ----------------------------------------------------------------- */}
                {settingsTab === 'tabs' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: cText }}>
                        {isRTL ? 'إظهار / إخفاء التبويبات' : 'Show / Hide Tabs'}
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: cTextSub, lineHeight: 1.45 }}>
                        {isRTL
                          ? 'تحكم في التبويبات التي تظهر في مجتمعك. قم بتفعيل أو تعطيل كل تبويب لتوفير تجربة مخصصة ومنظمة للأعضاء.'
                          : 'Control which tabs appear in your community. Enable or disable each tab to create a focused, streamlined experience for your members.'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                      {[
                        {
                          id: 'discussion',
                          icon: MessageSquare,
                          label: isRTL ? 'المناقشات' : 'Discussion',
                          description: isRTL
                            ? 'ابدأ محادثات أو انضم إليها لمشاركة التحديثات والأفكار والرؤى مع مجتمعك.'
                            : 'Start or join conversations to share updates, ideas, and insights with your community.'
                        },
                        {
                          id: 'learning',
                          icon: BookOpen,
                          label: isRTL ? 'التعليم' : 'Learning',
                          description: isRTL
                            ? 'أنشئ دورات تدريبية ودروساً تساعد الأعضاء على اكتساب مهارات ومعارف جديدة.'
                            : 'Create and manage courses that help members gain new skills or knowledge.'
                        },
                        {
                          id: 'events',
                          icon: Calendar,
                          label: isRTL ? 'الفعاليات' : 'Events',
                          description: isRTL
                            ? 'خطط ونظم واعرض الجلسات القادمة وورش العمل وفعاليات المجتمع.'
                            : 'Plan, organize, and view upcoming sessions, workshops, or community events.'
                        },
                        {
                          id: 'leaderboard',
                          icon: Trophy,
                          label: isRTL ? 'لوحة المتصدرين' : 'Leaderboard',
                          description: isRTL
                            ? 'ميّز الأعضاء الأكثر تفاعلاً وشجع المنافسة الإيجابية من خلال التصنيفات.'
                            : 'Recognize top-performing members and encourage healthy engagement through rankings.'
                        },
                        {
                          id: 'members',
                          icon: Users,
                          label: isRTL ? 'الأعضاء' : 'Members',
                          description: isRTL
                            ? 'إدارة جميع الأعضاء والأدوار. سيظل هذا التبويب مرئياً للمسؤولين حتى عند تعطيله لضمان سهولة الإدارة دائماً.'
                            : 'Manage all members and roles. This tab will remain visible to admins even when disabled, so member management is always accessible.'
                        },
                        {
                          id: 'about',
                          icon: Info,
                          label: isRTL ? 'عن المجتمع' : 'About',
                          description: isRTL
                            ? 'عرّف بأهداف المجتمع وقيمه وخلفيته لمساعدة الأعضاء على التواصل.'
                            : "Introduce your community's purpose, values, and background to help members connect."
                        }
                      ].map(tItem => {
                        const IconComp = tItem.icon;
                        const isHidden = (settingsForm.hiddenTabs || []).includes(tItem.id);
                        const isChecked = !isHidden;

                        return (
                          <div
                            key={tItem.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '16px',
                              padding: '12px 16px',
                              borderRadius: '8px',
                              border: `1px solid ${cBorder}`,
                              background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
                              transition: 'border-color 0.15s'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                              <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.04)',
                                border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isLight ? '#475569' : '#94a3b8',
                                flexShrink: 0
                              }}>
                                <IconComp size={18} />
                              </div>

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '13.5px', fontWeight: '700', color: cText }}>
                                  {tItem.label}
                                </div>
                                <div style={{ fontSize: '11.5px', color: cTextSub, marginTop: '2px', lineHeight: 1.35 }}>
                                  {tItem.description}
                                </div>
                              </div>
                            </div>

                            {/* iOS Switch */}
                            <div
                              role="switch"
                              aria-checked={isChecked}
                              onClick={() => {
                                const currentHidden = settingsForm.hiddenTabs || [];
                                const updated = isHidden
                                  ? currentHidden.filter(x => x !== tItem.id)
                                  : [...currentHidden, tItem.id];
                                setSettingsForm({ ...settingsForm, hiddenTabs: updated });
                              }}
                              style={{
                                width: '38px',
                                height: '22px',
                                borderRadius: '9999px',
                                background: isChecked ? '#2563eb' : (isLight ? '#cbd5e1' : '#475569'),
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                flexShrink: 0
                              }}
                            >
                              <div
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  background: '#ffffff',
                                  position: 'absolute',
                                  top: '3px',
                                  left: isChecked ? '19px' : '3px',
                                  transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.25)'
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ----------------------------------------------------------------- */}
                {/* TAB 7: MEMBERSHIP QUESTIONS (Screenshot 2)                        */}
                {/* ----------------------------------------------------------------- */}
                {settingsTab === 'questions' && (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: cText }}>
                        {isRTL ? 'تفعيل أسئلة العضوية' : 'Enable Membership Questions'}
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: cTextSub }}>
                        {isRTL
                          ? 'أضف أسئلة للأعضاء للإجابة عليها عند طلب الانضمام إلى مجموعتك.'
                          : 'Add members questions to ask when they request access to your group.'}
                      </p>
                    </div>

                    <div style={{ height: '1px', background: cBorder, margin: '16px 0 20px 0' }} />

                    {/* Enable row with iOS switch */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '20px'
                    }}>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: '700', color: cText }}>
                          {isRTL ? 'أسئلة العضوية' : 'Membership Questions'}
                        </div>
                        <div style={{ fontSize: '11.5px', color: cTextSub, marginTop: '2px' }}>
                          {isRTL
                            ? 'أضف سؤالاً واحداً على الأقل لتفعيل أسئلة العضوية'
                            : 'Add at least one question to enable membership questions'}
                        </div>
                      </div>

                      <div
                        role="switch"
                        aria-checked={Boolean(settingsForm.enableMembershipQuestions)}
                        onClick={() => {
                          const hasQuestions = (settingsForm.membershipQuestions || []).length > 0;
                          if (!hasQuestions && !settingsForm.enableMembershipQuestions) {
                            setShowAddQuestionInput(true);
                          }
                          setSettingsForm({
                            ...settingsForm,
                            enableMembershipQuestions: !settingsForm.enableMembershipQuestions
                          });
                        }}
                        style={{
                          width: '38px',
                          height: '22px',
                          borderRadius: '9999px',
                          background: settingsForm.enableMembershipQuestions ? '#2563eb' : (isLight ? '#cbd5e1' : '#475569'),
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          flexShrink: 0
                        }}
                      >
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: '#ffffff',
                            position: 'absolute',
                            top: '3px',
                            left: settingsForm.enableMembershipQuestions ? '19px' : '3px',
                            transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.25)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Add Question Button (Solid Navy) */}
                    <button
                      type="button"
                      onClick={() => setShowAddQuestionInput(!showAddQuestionInput)}
                      style={{
                        background: cNavy,
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 18px',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        alignSelf: 'flex-start',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Plus size={14} />
                      <span>{isRTL ? 'إضافة سؤال' : 'Add Question'}</span>
                    </button>

                    {/* Inline Question Input Form */}
                    {showAddQuestionInput && (
                      <div style={{
                        marginTop: '16px',
                        padding: '16px',
                        borderRadius: '8px',
                        border: `1px solid ${cBorder}`,
                        background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}>
                        <div style={{ fontSize: '12.5px', fontWeight: '700', color: cText }}>
                          {isRTL ? 'سؤال جديد' : 'New Question'}
                        </div>
                        <input
                          type="text"
                          placeholder={isRTL ? 'اكتب نص السؤال هنا...' : 'Type your question here...'}
                          value={newQuestionText}
                          onChange={(e) => setNewQuestionText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newQuestionText.trim()) {
                              setSettingsForm({
                                ...settingsForm,
                                enableMembershipQuestions: true,
                                membershipQuestions: [...(settingsForm.membershipQuestions || []), newQuestionText.trim()]
                              });
                              setNewQuestionText('');
                              setShowAddQuestionInput(false);
                            }
                          }}
                          style={{
                            padding: '9px 12px',
                            borderRadius: '6px',
                            border: `1px solid ${cBorder}`,
                            background: isLight ? '#ffffff' : 'rgba(255,255,255,0.05)',
                            color: cText,
                            fontSize: '12.5px',
                            outline: 'none'
                          }}
                        />
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddQuestionInput(false);
                              setNewQuestionText('');
                            }}
                            style={{
                              background: 'transparent',
                              border: `1px solid ${cBorder}`,
                              borderRadius: '6px',
                              padding: '6px 14px',
                              fontSize: '12px',
                              color: cTextSub,
                              cursor: 'pointer'
                            }}
                          >
                            {isRTL ? 'إلغاء' : 'Cancel'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (newQuestionText.trim()) {
                                setSettingsForm({
                                  ...settingsForm,
                                  enableMembershipQuestions: true,
                                  membershipQuestions: [...(settingsForm.membershipQuestions || []), newQuestionText.trim()]
                                });
                                setNewQuestionText('');
                                setShowAddQuestionInput(false);
                              }
                            }}
                            style={{
                              background: '#2563eb',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 16px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            {isRTL ? 'حفظ السؤال' : 'Save Question'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Questions List */}
                    {(settingsForm.membershipQuestions || []).length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                        {settingsForm.membershipQuestions.map((q, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 14px',
                              borderRadius: '8px',
                              border: `1px solid ${cBorder}`,
                              background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)',
                                color: cTextSub,
                                fontSize: '11px',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {idx + 1}
                              </span>
                              <span style={{ fontSize: '13px', fontWeight: '600', color: cText }}>
                                {q}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = settingsForm.membershipQuestions.filter((_, i) => i !== idx);
                                setSettingsForm({
                                  ...settingsForm,
                                  membershipQuestions: updated,
                                  enableMembershipQuestions: updated.length > 0 ? settingsForm.enableMembershipQuestions : false
                                });
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px'
                              }}
                            >
                              <X size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ----------------------------------------------------------------- */}
                {/* TAB 8: GAMIFICATION & REWARDS (Screenshot 3)                      */}
                {/* ----------------------------------------------------------------- */}
                {settingsTab === 'gamification' && (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: cText }}>
                        {isRTL ? 'تخصيص المستويات والمكافآت' : 'Customize Levels & Rewards'}
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: cTextSub }}>
                        {isRTL
                          ? 'قم بتخصيص أسماء المستويات وإضافة المكافآت لزيادة تفاعل الأعضاء'
                          : 'Customize level names and add rewards for better engagement of members'}
                      </p>
                    </div>

                    <div style={{ height: '1px', background: cBorder, margin: '16px 0 20px 0' }} />

                    {/* Accordion 1: Gamification */}
                    <div style={{
                      borderRadius: '8px',
                      border: `1px solid ${cBorder}`,
                      background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
                      overflow: 'hidden',
                      marginBottom: '12px'
                    }}>
                      <div
                        onClick={() => setIsGamificationAccordionOpen(!isGamificationAccordionOpen)}
                        style={{
                          padding: '14px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        <div style={{ fontSize: '13.5px', fontWeight: '700', color: cText }}>
                          {isRTL ? 'نظام المستويات والنقاط' : 'Gamification'}
                        </div>
                        <div style={{
                          color: cTextSub,
                          transition: 'transform 0.2s',
                          transform: isGamificationAccordionOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}>
                          <ChevronDown size={17} />
                        </div>
                      </div>

                      {isGamificationAccordionOpen && (
                        <div style={{
                          padding: '16px 18px',
                          borderTop: `1px solid ${cBorder}`,
                          background: isLight ? '#fbfcfe' : 'rgba(255, 255, 255, 0.01)'
                        }}>
                          {/* Points rules */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '10px',
                            marginBottom: '18px'
                          }}>
                            <div style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: `1px solid ${cBorder}`,
                              background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.03)',
                              textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '11px', color: cTextSub }}>{isRTL ? 'نشر منشور' : 'Create a post'}</div>
                              <div style={{ fontSize: '14px', fontWeight: '800', color: '#2563eb', marginTop: '2px' }}>+5 Pts</div>
                            </div>
                            <div style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: `1px solid ${cBorder}`,
                              background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.03)',
                              textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '11px', color: cTextSub }}>{isRTL ? 'كتابة تعليق' : 'Write a comment'}</div>
                              <div style={{ fontSize: '14px', fontWeight: '800', color: '#2563eb', marginTop: '2px' }}>+2 Pts</div>
                            </div>
                            <div style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: `1px solid ${cBorder}`,
                              background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.03)',
                              textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '11px', color: cTextSub }}>{isRTL ? 'استلام إعجاب' : 'Receive a like'}</div>
                              <div style={{ fontSize: '14px', fontWeight: '800', color: '#2563eb', marginTop: '2px' }}>+1 Pt</div>
                            </div>
                          </div>

                          {/* Levels Ladder */}
                          <div style={{ fontSize: '12px', fontWeight: '700', color: cText, marginBottom: '10px' }}>
                            {isRTL ? 'سلّم المستويات (9 مستويات)' : 'Level Tiers (1 to 9)'}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                            {(settingsForm.gamificationLevels || []).map((lvl, lIdx) => (
                              <div
                                key={lvl.level}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '8px 12px',
                                  borderRadius: '6px',
                                  border: `1px solid ${cBorder}`,
                                  background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{
                                    fontSize: '11.5px',
                                    fontWeight: '800',
                                    color: '#2563eb',
                                    width: '55px'
                                  }}>
                                    Level {lvl.level}
                                  </span>
                                  <input
                                    type="text"
                                    value={lvl.name}
                                    onChange={(e) => {
                                      const updated = [...settingsForm.gamificationLevels];
                                      updated[lIdx] = { ...updated[lIdx], name: e.target.value };
                                      setSettingsForm({ ...settingsForm, gamificationLevels: updated });
                                    }}
                                    style={{
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      border: `1px solid ${cBorder}`,
                                      background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                                      color: cText,
                                      fontSize: '12px'
                                    }}
                                  />
                                </div>
                                <span style={{ fontSize: '11.5px', color: cTextSub }}>
                                  {lvl.points} {isRTL ? 'نقطة' : 'pts'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Accordion 2: Rewards */}
                    <div style={{
                      borderRadius: '8px',
                      border: `1px solid ${cBorder}`,
                      background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)',
                      overflow: 'hidden'
                    }}>
                      <div
                        onClick={() => setIsRewardsAccordionOpen(!isRewardsAccordionOpen)}
                        style={{
                          padding: '14px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        <div style={{ fontSize: '13.5px', fontWeight: '700', color: cText }}>
                          {isRTL ? 'مكافآت المستويات' : 'Rewards'}
                        </div>
                        <div style={{
                          color: cTextSub,
                          transition: 'transform 0.2s',
                          transform: isRewardsAccordionOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}>
                          <ChevronDown size={17} />
                        </div>
                      </div>

                      {isRewardsAccordionOpen && (
                        <div style={{
                          padding: '16px 18px',
                          borderTop: `1px solid ${cBorder}`,
                          background: isLight ? '#fbfcfe' : 'rgba(255, 255, 255, 0.01)'
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                            {(settingsForm.rewards || []).map((rw, rIdx) => (
                              <div
                                key={rw.id || rIdx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '10px 14px',
                                  borderRadius: '6px',
                                  border: `1px solid ${cBorder}`,
                                  background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)'
                                }}
                              >
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{
                                      fontSize: '10px',
                                      fontWeight: '800',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      background: '#dbeafe',
                                      color: '#1e40af'
                                    }}>
                                      Level {rw.level}
                                    </span>
                                    <span style={{ fontSize: '12.5px', fontWeight: '700', color: cText }}>
                                      {rw.title}
                                    </span>
                                  </div>
                                  {rw.description && (
                                    <div style={{ fontSize: '11px', color: cTextSub, marginTop: '3px' }}>
                                      {rw.description}
                                    </div>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = settingsForm.rewards.filter((_, i) => i !== rIdx);
                                    setSettingsForm({ ...settingsForm, rewards: updated });
                                  }}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    padding: '4px'
                                  }}
                                >
                                  <X size={15} />
                                </button>
                              </div>
                            ))}
                          </div>

                          {showAddRewardInput ? (
                            <div style={{
                              padding: '14px',
                              borderRadius: '6px',
                              border: `1px solid ${cBorder}`,
                              background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px'
                            }}>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <select
                                  value={newRewardLevel}
                                  onChange={(e) => setNewRewardLevel(Number(e.target.value))}
                                  style={{
                                    padding: '8px',
                                    borderRadius: '6px',
                                    border: `1px solid ${cBorder}`,
                                    background: isLight ? '#ffffff' : 'rgba(255,255,255,0.05)',
                                    color: cText,
                                    fontSize: '12px'
                                  }}
                                >
                                  {[2, 3, 4, 5, 6, 7, 8, 9].map(l => (
                                    <option key={l} value={l}>Level {l}</option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  placeholder={isRTL ? 'عنوان المكافأة (مثال: فتح كورس مجاني)...' : 'Reward title (e.g. Free Template Pack)...'}
                                  value={newRewardTitle}
                                  onChange={(e) => setNewRewardTitle(e.target.value)}
                                  style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    border: `1px solid ${cBorder}`,
                                    background: isLight ? '#ffffff' : 'rgba(255,255,255,0.05)',
                                    color: cText,
                                    fontSize: '12px'
                                  }}
                                />
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowAddRewardInput(false);
                                    setNewRewardTitle('');
                                  }}
                                  style={{
                                    background: 'transparent',
                                    border: `1px solid ${cBorder}`,
                                    borderRadius: '6px',
                                    padding: '5px 12px',
                                    fontSize: '11.5px',
                                    color: cTextSub,
                                    cursor: 'pointer'
                                  }}
                                >
                                  {isRTL ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (newRewardTitle.trim()) {
                                      const newRw = {
                                        id: `rw-${Date.now()}`,
                                        level: newRewardLevel,
                                        title: newRewardTitle.trim(),
                                        description: `Unlocked automatically at Level ${newRewardLevel}`
                                      };
                                      setSettingsForm({
                                        ...settingsForm,
                                        rewards: [...(settingsForm.rewards || []), newRw]
                                      });
                                      setNewRewardTitle('');
                                      setShowAddRewardInput(false);
                                    }
                                  }}
                                  style={{
                                    background: '#2563eb',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '5px 14px',
                                    fontSize: '11.5px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {isRTL ? 'إضافة المكافأة' : 'Add Reward'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowAddRewardInput(true)}
                              style={{
                                background: cNavy,
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 14px',
                                fontSize: '12px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <Plus size={13} />
                              <span>{isRTL ? 'إضافة مكافأة لمستوى' : '+ Add Reward'}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ----------------------------------------------------------------- */}
                {/* TAB 9: LINKS (Screenshot 4)                                       */}
                {/* ----------------------------------------------------------------- */}
                {settingsTab === 'links' && (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: cText }}>
                        {isRTL ? 'الروابط الترويجية' : 'Promotional Links'}
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: cTextSub }}>
                        {isRTL
                          ? 'أنشئ روابط ترويجية لمجموعتك'
                          : 'Create promotional links for your group'}
                      </p>
                    </div>

                    <div style={{ height: '1px', background: cBorder, margin: '16px 0 20px 0' }} />

                    {/* Add Link Button (Solid Navy) */}
                    <button
                      type="button"
                      onClick={() => setShowAddLinkInput(!showAddLinkInput)}
                      style={{
                        background: cNavy,
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 18px',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        alignSelf: 'flex-start',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Plus size={14} />
                      <span>{isRTL ? 'إضافة رابط' : 'Add Link'}</span>
                    </button>

                    {/* Inline Add Link Form */}
                    {showAddLinkInput && (
                      <div style={{
                        marginTop: '16px',
                        padding: '16px',
                        borderRadius: '8px',
                        border: `1px solid ${cBorder}`,
                        background: isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}>
                        <div style={{ fontSize: '12.5px', fontWeight: '700', color: cText }}>
                          {isRTL ? 'رابط ترويجي جديد' : 'New Promotional Link'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder={isRTL ? 'اسم الرابط (مثال: قناة التيليجرام الرسمية)...' : 'Link title (e.g. Official Telegram Channel)...'}
                            value={newLinkTitle}
                            onChange={(e) => setNewLinkTitle(e.target.value)}
                            style={{
                              padding: '9px 12px',
                              borderRadius: '6px',
                              border: `1px solid ${cBorder}`,
                              background: isLight ? '#ffffff' : 'rgba(255,255,255,0.05)',
                              color: cText,
                              fontSize: '12.5px',
                              outline: 'none'
                            }}
                          />
                          <input
                            type="url"
                            placeholder={isRTL ? 'عنوان URL (مثال: https://t.me/yourgroup)...' : 'Link URL (e.g. https://t.me/yourgroup)...'}
                            value={newLinkUrl}
                            onChange={(e) => setNewLinkUrl(e.target.value)}
                            style={{
                              padding: '9px 12px',
                              borderRadius: '6px',
                              border: `1px solid ${cBorder}`,
                              background: isLight ? '#ffffff' : 'rgba(255,255,255,0.05)',
                              color: cText,
                              fontSize: '12.5px',
                              outline: 'none'
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddLinkInput(false);
                              setNewLinkTitle('');
                              setNewLinkUrl('');
                            }}
                            style={{
                              background: 'transparent',
                              border: `1px solid ${cBorder}`,
                              borderRadius: '6px',
                              padding: '6px 14px',
                              fontSize: '12px',
                              color: cTextSub,
                              cursor: 'pointer'
                            }}
                          >
                            {isRTL ? 'إلغاء' : 'Cancel'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (newLinkTitle.trim() && newLinkUrl.trim()) {
                                setSettingsForm({
                                  ...settingsForm,
                                  customLinks: [...(settingsForm.customLinks || []), { title: newLinkTitle.trim(), url: newLinkUrl.trim() }]
                                });
                                setNewLinkTitle('');
                                setNewLinkUrl('');
                                setShowAddLinkInput(false);
                              }
                            }}
                            style={{
                              background: '#2563eb',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 16px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            {isRTL ? 'حفظ الرابط' : 'Save Link'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Links List */}
                    {(settingsForm.customLinks || []).length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                        {settingsForm.customLinks.map((lnk, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 14px',
                              borderRadius: '8px',
                              border: `1px solid ${cBorder}`,
                              background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)'
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '700', color: cText }}>
                                {lnk.title}
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#2563eb', marginTop: '2px', wordBreak: 'break-all' }}>
                                {lnk.url}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard?.writeText(lnk.url);
                                  showToast(isRTL ? 'تم نسخ الرابط!' : 'Link copied!');
                                }}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: cTextSub,
                                  cursor: 'pointer',
                                  padding: '4px'
                                }}
                                title="Copy"
                              >
                                <Copy size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = settingsForm.customLinks.filter((_, i) => i !== idx);
                                  setSettingsForm({ ...settingsForm, customLinks: updated });
                                }}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  padding: '4px'
                                }}
                                title="Delete"
                              >
                                <X size={15} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ----------------------------------------------------------------- */}
                {/* TAB 10: REPORTED CONTENT (Screenshot 5)                           */}
                {/* ----------------------------------------------------------------- */}
                {settingsTab === 'reported' && (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: cText }}>
                        {isRTL ? 'يمكنك استعراض كل المحتوى المُبلّغ عنه هنا' : 'You can view all the reported content here'}
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: cTextSub }}>
                        {isRTL
                          ? 'اتخذ الإجراءات المناسبة بشأن المحتوى المُبلّغ عنه'
                          : 'Take action on the reported content'}
                      </p>
                    </div>

                    <div style={{ height: '1px', background: cBorder, margin: '16px 0 20px 0' }} />

                    {(settingsForm.reportedContent || []).length === 0 ? (
                      /* Exact Empty State matching Screenshot 5 */
                      <div style={{
                        padding: '60px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                      }}>
                        {/* Rounded Document Icon with 3 lines */}
                        <div style={{ color: isLight ? '#94a3b8' : '#64748b', marginBottom: '16px' }}>
                          <svg width="44" height="54" viewBox="0 0 44 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="2" width="40" height="50" rx="8" stroke="currentColor" strokeWidth="2.5" />
                            <line x1="11" y1="17" x2="33" y2="17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            <line x1="11" y1="27" x2="33" y2="27" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                            <line x1="11" y1="37" x2="23" y2="37" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                          </svg>
                        </div>

                        <div style={{ fontSize: '14.5px', fontWeight: '700', color: cText }}>
                          {isRTL ? 'لا يوجد محتوى مُبلّغ عنه من قِبل الأعضاء' : 'No member-reported content'}
                        </div>

                        <p style={{
                          fontSize: '12px',
                          color: cTextSub,
                          maxWidth: '430px',
                          margin: '8px auto 0',
                          lineHeight: 1.55
                        }}>
                          {isRTL
                            ? 'عندما يُبلّغ الأعضاء عن منشورات أو تعليقات، ستظهر هنا لمراجعتها. يمكنك الإبقاء عليها أو حذفها، بالإضافة إلى تعليق أو إزالة أو حظر الأعضاء الذين قاموا بنشرها.'
                            : 'When members report posts or comments, they will appear here for you to review. You can keep or delete them, as well as suspend, remove or block the members who posted them.'}
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {settingsForm.reportedContent.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '14px',
                              borderRadius: '8px',
                              border: `1px solid ${cBorder}`,
                              background: isLight ? '#ffffff' : 'rgba(255,255,255,0.02)'
                            }}
                          >
                            <div style={{ fontSize: '13px', fontWeight: '700', color: cText }}>{item.reason}</div>
                            <div style={{ fontSize: '12px', color: cTextSub, marginTop: '4px' }}>{item.snippet}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ----------------------------------------------------------------- */}
                {/* TAB 11: IMPORT                                                    */}
                {/* ----------------------------------------------------------------- */}
                {settingsTab === 'import' && (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: cText }}>
                        {isRTL ? 'استيراد الأعضاء' : 'Import Members'}
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: cTextSub }}>
                        {isRTL ? 'استيراد الطلاب من ملف CSV أو الكورسات المسجلة' : 'Import members from CSV or enrolled academy students'}
                      </p>
                    </div>

                    <div style={{ height: '1px', background: cBorder, margin: '16px 0 20px 0' }} />

                    <div
                      onClick={() => showToast(isRTL ? 'اختر ملف CSV لاستيراد الأعضاء' : 'Select CSV file to import members')}
                      style={{
                        border: `1.5px dashed ${isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.2)'}`,
                        borderRadius: '12px',
                        padding: '36px 20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.02)'
                      }}
                    >
                      <UploadCloud size={32} style={{ color: cTextSub, marginBottom: '8px' }} />
                      <div style={{ fontSize: '13.5px', fontWeight: '700', color: cText }}>
                        {isRTL ? 'انقر لرفع ملف CSV للأعضاء' : 'Click to upload members CSV'}
                      </div>
                      <div style={{ fontSize: '11.5px', color: cTextMuted, marginTop: '4px' }}>
                        Supports Name, Email, Phone, Role columns
                      </div>
                    </div>
                  </div>
                )}

                {/* ----------------------------------------------------------------- */}
                {/* TAB 12: DISCOVERY                                                 */}
                {/* ----------------------------------------------------------------- */}
                {settingsTab === 'discovery' && (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: cText }}>
                        {isRTL ? 'إعدادات الاستكشاف' : 'Discovery Settings'}
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: cTextSub }}>
                        {isRTL ? 'التحكم في ظهور المجتمع في دليل الاستكشاف العام' : 'Control whether your community appears in the public discovery directory'}
                      </p>
                    </div>

                    <div style={{ height: '1px', background: cBorder, margin: '16px 0 20px 0' }} />

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 18px',
                      borderRadius: '8px',
                      border: `1px solid ${cBorder}`,
                      background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.02)'
                    }}>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: '700', color: cText }}>
                          {isRTL ? 'الظهور في دليل الاستكشاف العام' : 'Show in Community Discovery'}
                        </div>
                        <div style={{ fontSize: '11.5px', color: cTextSub, marginTop: '2px' }}>
                          {isRTL ? 'يسمح للزوار والطلاب الجدد باكتشاف مجتمعك والانضمام إليه' : 'Allow prospective students and visitors to discover and join your group'}
                        </div>
                      </div>

                      {/* iOS Switch */}
                      <div
                        role="switch"
                        aria-checked={settingsForm.discovery !== false}
                        onClick={() => setSettingsForm({ ...settingsForm, discovery: !settingsForm.discovery })}
                        style={{
                          width: '38px',
                          height: '22px',
                          borderRadius: '9999px',
                          background: settingsForm.discovery !== false ? '#2563eb' : (isLight ? '#cbd5e1' : '#475569'),
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          flexShrink: 0
                        }}
                      >
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: '#ffffff',
                            position: 'absolute',
                            top: '3px',
                            left: settingsForm.discovery !== false ? '19px' : '3px',
                            transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.25)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* 3. Modal Footer Actions */}
            <div style={{
              padding: '14px 24px',
              borderTop: `1px solid ${cBorder}`,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              background: isLight ? '#ffffff' : 'rgba(255,255,255,0.02)'
            }}>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                style={{
                  background: 'transparent',
                  border: `1px solid ${cBorder}`,
                  borderRadius: '8px',
                  padding: '8px 20px',
                  color: cTextSub,
                  fontSize: '12.5px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleSaveSettings}
                style={{
                  background: cNavy,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 26px',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: isLight ? '0 2px 6px rgba(26, 54, 93, 0.3)' : '0 2px 8px rgba(37, 99, 235, 0.4)'
                }}
              >
                {isRTL ? 'حفظ' : 'Save'}
              </button>
            </div>

          </div>
        </div>
      )}



    </div>
  );
}
