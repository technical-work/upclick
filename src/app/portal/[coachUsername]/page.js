'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  getCoachPortalSettings,
  getCoachCourses,
  getCoachCommunities,
  getCommunityPosts,
  createCommunityPost,
  enrollStudent,
  updateStudentLessonProgress,
  DEFAULT_PORTAL_SETTINGS,
  SAMPLE_MASTERCLASS_COURSES
} from '../../../lib/membershipsService';
import {
  BookOpen,
  Play,
  CheckCircle2,
  Lock,
  MessageSquare,
  Users,
  Video,
  Download,
  Share2,
  Sparkles,
  ExternalLink,
  Check,
  Search,
  LogOut,
  User,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Send,
  HelpCircle,
  Award,
  Star,
  Maximize2,
  Minimize2,
  Flame,
  ShieldCheck,
  Bookmark,
  Compass,
  FileText,
  Layers,
  Volume2,
  ThumbsUp,
  CheckSquare,
  Square,
  GraduationCap
} from 'lucide-react';

export default function StudentClientPortalPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const coachUsername = params?.coachUsername || 'moha';
  const initialCourseId = searchParams.get('course');
  const initialTab = searchParams.get('tab') || 'courses';

  // Portal & Content States
  const [portalSettings, setPortalSettings] = useState(DEFAULT_PORTAL_SETTINGS);
  const [courses, setCourses] = useState(SAMPLE_MASTERCLASS_COURSES);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active View Navigation
  const [activeTab, setActiveTab] = useState(initialTab); // 'courses', 'community', 'achievements'
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [theaterMode, setTheaterMode] = useState(false);
  const [activeLessonTab, setActiveLessonTab] = useState('notes'); // 'notes', 'resources', 'comments', 'certificate'
  const [expandedModules, setExpandedModules] = useState({});

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  // Student Auth & Gamification State
  const [currentStudent, setCurrentStudent] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '' });
  const [completedLessons, setCompletedLessons] = useState([]);
  const [checkedChecklist, setCheckedChecklist] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);

  // Community Feed State
  const [activeCommunityId, setActiveCommunityId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});
  const [lessonComments, setLessonComments] = useState({});
  const [newLessonComment, setNewLessonComment] = useState('');

  // Load Portal data
  useEffect(() => {
    async function loadPortal() {
      try {
        setLoading(true);
        const settings = await getCoachPortalSettings(coachUsername);
        setPortalSettings(settings);

        const coachId = settings.coachId || settings.id || coachUsername;
        const [cList, commList] = await Promise.all([
          getCoachCourses(coachId),
          getCoachCommunities(coachId)
        ]);

        const rawCourses = cList && cList.length > 0 ? cList : [];
        const cleanedCustomCourses = rawCourses.map(c => ({
          ...c,
          title: (c.title && c.title.trim().length > 1 && c.title.trim() !== '1') ? c.title : (c.category ? `ماستر كلاس ${c.category}` : 'ماستر كلاس التجارة الإلكترونية المتقدمة'),
          description: (c.description && c.description.trim().length > 1 && c.description.trim() !== '1') ? c.description : 'دليل تطبيقي شامل لاحتراف التجارة الرقمية وبناء أنظمة مبيعات مربحة ومستدامة.',
          thumbnailUrl: (c.thumbnailUrl && !c.thumbnailUrl.includes('placeholder')) ? c.thumbnailUrl : 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1200&auto=format&fit=crop'
        }));

        // Always provide a complete academy experience with all masterclasses
        const existingIds = new Set(cleanedCustomCourses.map(c => c.id));
        const additionalSamples = SAMPLE_MASTERCLASS_COURSES.filter(s => !existingIds.has(s.id));
        const finalCourses = [...cleanedCustomCourses, ...additionalSamples];
        setCourses(finalCourses);
        setCommunities(commList && commList.length > 0 ? commList : [{ id: 'vip_lounge', name: 'صالون النقاشات الحصري VIP', memberCount: 248 }]);

        if (commList && commList.length > 0) {
          setActiveCommunityId(commList[0].id);
        } else {
          setActiveCommunityId('vip_lounge');
        }

        // Direct course deep link
        if (initialCourseId && finalCourses.length > 0) {
          const target = finalCourses.find(c => c.id === initialCourseId);
          if (target) {
            handleSelectCourse(target);
          }
        }
      } catch (err) {
        console.warn('Portal load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPortal();
  }, [coachUsername, initialCourseId]);

  // Load student session from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`upklick_student_${coachUsername}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCurrentStudent(parsed);
          setCompletedLessons(parsed.completedLessons || []);
        } catch {
          // ignore
        }
      }
    }
  }, [coachUsername]);

  // Load community posts when active community changes
  useEffect(() => {
    if (!activeCommunityId) return;
    async function fetchPosts() {
      const pList = await getCommunityPosts(activeCommunityId);
      setPosts(pList);
    }
    fetchPosts();
  }, [activeCommunityId]);

  // Expand first module by default when activeCourse changes
  useEffect(() => {
    if (activeCourse && activeCourse.modules) {
      const initialMap = {};
      activeCourse.modules.forEach((mod, idx) => {
        initialMap[mod.id || idx] = idx === 0;
      });
      setExpandedModules(initialMap);
    }
  }, [activeCourse]);

  // Student Sign In / Register
  const handleStudentAuth = async (e) => {
    e.preventDefault();
    if (!authForm.email.trim()) return;

    const studentObj = {
      name: authForm.name.trim() || authForm.email.split('@')[0],
      email: authForm.email.trim().toLowerCase(),
      enrolledCourses: courses.map(c => c.id),
      completedLessons: completedLessons || []
    };

    try {
      const coachId = portalSettings.coachId || portalSettings.id || coachUsername;
      await enrollStudent(coachId, studentObj);
      setCurrentStudent(studentObj);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`upklick_student_${coachUsername}`, JSON.stringify(studentObj));
      }
      setShowAuthModal(false);
    } catch (err) {
      console.error(err);
      setCurrentStudent(studentObj);
      setShowAuthModal(false);
    }
  };

  const handleSignOut = () => {
    setCurrentStudent(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`upklick_student_${coachUsername}`);
    }
  };

  // Select Course to Learn
  const handleSelectCourse = (course) => {
    setActiveCourse(course);
    const firstModule = (course.modules || [])[0];
    const firstLesson = (firstModule?.lessons || [])[0];
    if (firstLesson) {
      setActiveLesson(firstLesson);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle Lesson Completion with Confetti Animation
  const handleToggleLessonComplete = async (lessonId) => {
    const isCompleted = completedLessons.includes(lessonId);
    let updated;
    if (isCompleted) {
      updated = completedLessons.filter(id => id !== lessonId);
    } else {
      updated = [...completedLessons, lessonId];
      // Trigger celebratory confetti effect
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    setCompletedLessons(updated);

    if (currentStudent?.email && activeCourse?.id) {
      const coachId = portalSettings.coachId || portalSettings.id || coachUsername;
      try {
        await updateStudentLessonProgress(coachId, currentStudent.email, activeCourse.id, lessonId, !isCompleted);
        const updatedStudent = { ...currentStudent, completedLessons: updated };
        setCurrentStudent(updatedStudent);
        localStorage.setItem(`upklick_student_${coachUsername}`, JSON.stringify(updatedStudent));
      } catch (err) {
        console.warn('Progress update error:', err);
      }
    }
  };

  // Toggle Module accordion
  const toggleModule = (modId) => {
    setExpandedModules(prev => ({
      ...prev,
      [modId]: !prev[modId]
    }));
  };

  // Navigation between lessons
  const allCurrentLessons = useMemo(() => {
    if (!activeCourse) return [];
    const list = [];
    (activeCourse.modules || []).forEach(m => {
      (m.lessons || []).forEach(l => list.push(l));
    });
    return list;
  }, [activeCourse]);

  const currentLessonIndex = useMemo(() => {
    if (!activeLesson || allCurrentLessons.length === 0) return -1;
    return allCurrentLessons.findIndex(l => l.id === activeLesson.id);
  }, [activeLesson, allCurrentLessons]);

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      setActiveLesson(allCurrentLessons[currentLessonIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < allCurrentLessons.length - 1) {
      setActiveLesson(allCurrentLessons[currentLessonIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Submit Community Post
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() || !activeCommunityId) return;
    setSubmittingPost(true);
    try {
      const authorName = currentStudent?.name || 'طالب متميز';
      const coachId = portalSettings.coachId || portalSettings.id || coachUsername;
      const created = await createCommunityPost({
        communityId: activeCommunityId,
        coachId,
        authorName,
        content: newPostContent.trim()
      });
      setPosts([created, ...posts]);
      setNewPostContent('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingPost(false);
    }
  };

  // Add Comment on specific lesson
  const handleAddLessonComment = (e) => {
    e.preventDefault();
    if (!newLessonComment.trim() || !activeLesson?.id) return;
    const author = currentStudent?.name || 'طالب متميز';
    const newComment = {
      id: `comment_${Date.now()}`,
      authorName: author,
      content: newLessonComment.trim(),
      time: 'الآن'
    };
    const currentList = lessonComments[activeLesson.id] || [
      { id: 'c_init', authorName: 'Mohamed Hesham (المدرب)', content: 'أي سؤال أو نقطة غير واضحة في هذا الدرس، لا تتردد في طرحها هنا!', time: 'منذ يوم' }
    ];
    setLessonComments({
      ...lessonComments,
      [activeLesson.id]: [newComment, ...currentList]
    });
    setNewLessonComment('');
  };

  // Toggle Checklist items
  const toggleChecklist = (itemKey) => {
    setCheckedChecklist(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  // Like post toggle
  const handleLikePost = (postId) => {
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Calculate course completion progress
  const getCourseProgress = (course) => {
    const modules = course.modules || [];
    let allLessonIds = [];
    modules.forEach(m => {
      (m.lessons || []).forEach(l => allLessonIds.push(l.id));
    });
    if (allLessonIds.length === 0) return 0;
    const completedCount = allLessonIds.filter(id => completedLessons.includes(id)).length;
    return Math.round((completedCount / allLessonIds.length) * 100);
  };

  // Total Academy Progress
  const totalAcademyProgress = useMemo(() => {
    let totalLessonsCount = 0;
    courses.forEach(c => {
      (c.modules || []).forEach(m => {
        totalLessonsCount += (m.lessons || []).length;
      });
    });
    if (totalLessonsCount === 0) return 0;
    return Math.round((completedLessons.length / totalLessonsCount) * 100);
  }, [courses, completedLessons]);

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const matchCat = selectedCategory === 'الكل' || c.category === selectedCategory;
      const matchQuery = !searchQuery.trim() ||
        c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [courses, selectedCategory, searchQuery]);

  // Video embed helper
  const renderVideoPlayer = (lesson) => {
    if (!lesson?.videoUrl) {
      return (
        <div className="video-placeholder-container">
          <div className="cinema-ambient-glow" />
          <div className="video-placeholder-inner">
            <div className="icon-pulse-wrapper">
              <Video size={52} color="#FF6B35" />
            </div>
            <h3 style={{ margin: '14px 0 6px', fontSize: '18px', fontWeight: '800', color: '#fff' }}>
              {lesson?.title || 'محاضرة تعليمية حصرية'}
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, maxWidth: '420px', lineHeight: '1.6' }}>
              الدرس متاح للمشاهدة المباشرة. اضغط على تشغيل أو تصفح المحتوى والملفات المرفقة أدناه.
            </p>
          </div>
        </div>
      );
    }

    let url = lesson.videoUrl.trim();

    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      } else if (url.includes('watch?v=')) {
        videoId = url.split('watch?v=')[1]?.split('&')[0];
      } else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0];
      }
      return (
        <div className="cinema-player-wrapper">
          <div className="cinema-ambient-glow" />
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="cinema-iframe"
          />
        </div>
      );
    }

    // Vimeo
    if (url.includes('vimeo.com')) {
      const vimeoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return (
        <div className="cinema-player-wrapper">
          <div className="cinema-ambient-glow" />
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
            title={lesson.title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="cinema-iframe"
          />
        </div>
      );
    }

    // Loom
    if (url.includes('loom.com')) {
      const loomUrl = url.replace('/share/', '/embed/');
      return (
        <div className="cinema-player-wrapper">
          <div className="cinema-ambient-glow" />
          <iframe
            src={loomUrl}
            title={lesson.title}
            allowFullScreen
            className="cinema-iframe"
          />
        </div>
      );
    }

    // Direct MP4
    return (
      <div className="cinema-player-wrapper">
        <div className="cinema-ambient-glow" />
        <video
          controls
          autoPlay
          src={url}
          className="cinema-iframe"
        />
      </div>
    );
  };

  const themeColor = portalSettings.themeColor || '#FF6B35';

  if (loading) {
    return (
      <div className="portal-loading-screen">
        <div className="loader-mesh-orb" />
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <div className="loader-spinner" style={{ borderTopColor: themeColor }} />
          <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 6px', color: '#fff' }}>
            جاري فتح بوابة الأكاديمية...
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            تحضير البيئة التعليمية والمحتوى التدريبي الحصري
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-master-container" dir="rtl">
      {/* Advanced Scoped CSS for Ultra-Luxury Animation & Glassmorphism */}
      <style>{`
        @keyframes meshOrbit {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.1); }
          66% { transform: translate(-25px, 20px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.45; filter: blur(28px); }
          50% { opacity: 0.8; filter: blur(36px); }
        }
        @keyframes shimmerSweep {
          0% { transform: translateX(120%); }
          100% { transform: translateX(-120%); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes eqWave {
          0%, 100% { height: 4px; }
          50% { height: 18px; }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-30px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
        }
        @keyframes cardHoverIn {
          from { transform: translateY(0) scale(1); }
          to { transform: translateY(-6px) scale(1.015); }
        }

        .portal-master-container {
          min-height: 100vh;
          background-color: #07090e;
          background-image: 
            radial-gradient(at 10% 15%, rgba(255, 107, 53, 0.12) 0px, transparent 45%),
            radial-gradient(at 90% 85%, rgba(139, 92, 246, 0.12) 0px, transparent 45%),
            radial-gradient(at 50% 50%, rgba(6, 182, 212, 0.05) 0px, transparent 60%);
          color: #f8fafc;
          font-family: var(--font-cairo, system-ui, -apple-system, sans-serif);
          position: relative;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
        }

        /* Ambient Dynamic Mesh Orbs */
        .ambient-orb-1 {
          position: fixed;
          top: -100px;
          right: -80px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(255, 107, 53, 0.18) 0%, rgba(255, 107, 53, 0) 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          animation: meshOrbit 18s ease-in-out infinite;
        }
        .ambient-orb-2 {
          position: fixed;
          bottom: -150px;
          left: -100px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0) 70%);
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          animation: meshOrbit 24s ease-in-out infinite reverse;
        }

        /* Top Header */
        .portal-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(10, 14, 23, 0.85);
          backdrop-filter: blur(24px) saturate(180%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0 28px;
          transition: all 0.3s ease;
        }
        .portal-header-inner {
          max-width: 1360px;
          margin: 0 auto;
          height: 74px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        /* Nav Pills */
        .nav-pill-btn {
          background: transparent;
          border: 1px solid transparent;
          color: #94a3b8;
          padding: 10px 18px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 13.5px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .nav-pill-btn:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
        }
        .nav-pill-btn.active {
          color: #fff;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        }
        .nav-pill-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 18%;
          right: 18%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #FF6B35, transparent);
          border-radius: 2px;
        }

        /* Glassmorphic Luxury Cards */
        .glass-card {
          background: linear-gradient(135deg, rgba(20, 26, 39, 0.75) 0%, rgba(13, 17, 27, 0.85) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
          position: relative;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .glass-card:hover {
          border-color: rgba(255, 107, 53, 0.35);
          box-shadow: 0 20px 45px -15px rgba(255, 107, 53, 0.2), 0 0 20px rgba(255, 107, 53, 0.05);
          transform: translateY(-5px);
        }

        /* Shimmer Effect on CTA */
        .shimmer-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .shimmer-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 60px;
          height: 100%;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
          transform: skewX(-25deg);
          animation: shimmerSweep 3.5s infinite;
          pointer-events: none;
        }

        /* Cinema Video Player */
        .cinema-player-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 20px;
          overflow: hidden;
          background: #000;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8);
        }
        .cinema-iframe {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          border: none;
        }
        .cinema-ambient-glow {
          position: absolute;
          inset: -30px;
          background: radial-gradient(circle, rgba(255, 107, 53, 0.4) 0%, transparent 70%);
          filter: blur(45px);
          opacity: 0.6;
          z-index: 1;
          animation: glowPulse 4s infinite ease-in-out;
          pointer-events: none;
        }
        .video-placeholder-container {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          background: linear-gradient(135deg, #0e121d 0%, #07090e 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }
        .video-placeholder-inner {
          position: relative;
          z-index: 2;
          text-align: center;
          padding: 24px;
        }
        .icon-pulse-wrapper {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(255, 107, 53, 0.12);
          border: 1px solid rgba(255, 107, 53, 0.3);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 30px rgba(255, 107, 53, 0.35);
          animation: floatSlow 3s ease-in-out infinite;
        }

        /* Soundwave Equalizer for playing lesson */
        .eq-container {
          display: inline-flex;
          align-items: flex-end;
          gap: 2.5px;
          height: 16px;
        }
        .eq-bar {
          width: 3px;
          background: #FF6B35;
          border-radius: 2px;
          animation: eqWave 1.2s ease-in-out infinite alternate;
        }
        .eq-bar:nth-child(2) { animation-delay: 0.2s; }
        .eq-bar:nth-child(3) { animation-delay: 0.4s; }
        .eq-bar:nth-child(4) { animation-delay: 0.1s; }

        /* Loader */
        .portal-loading-screen {
          min-height: 100vh;
          background: #07090e;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .loader-mesh-orb {
          position: absolute;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(255, 107, 53, 0.25) 0%, transparent 70%);
          filter: blur(50px);
          animation: glowPulse 2.5s infinite;
        }
        .loader-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 16px;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        /* Confetti Pieces */
        .confetti-piece {
          position: fixed;
          top: -20px;
          width: 10px;
          height: 10px;
          border-radius: 3px;
          z-index: 10001;
          pointer-events: none;
          animation: confettiFall 2.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>

      {/* Confetti Celebration Generator */}
      {showConfetti && (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10000 }}>
          {Array.from({ length: 45 }).map((_, i) => {
            const colors = ['#FF6B35', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
            const color = colors[i % colors.length];
            const left = `${(i * 2.2) % 100}%`;
            const delay = `${(i * 0.05).toFixed(2)}s`;
            const duration = `${2.2 + (i % 5) * 0.2}s`;
            const size = `${8 + (i % 6)}px`;
            return (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left,
                  backgroundColor: color,
                  animationDelay: delay,
                  animationDuration: duration,
                  width: size,
                  height: size
                }}
              />
            );
          })}
        </div>
      )}

      {/* Dynamic Background Mesh Orbs */}
      <div className="ambient-orb-1" />
      <div className="ambient-orb-2" />

      {/* ===================================================================== */}
      {/* 1. STANDALONE CINEMA ACADEMY HEADER                                   */}
      {/* ===================================================================== */}
      <header className="portal-header">
        <div className="portal-header-inner">
          {/* Brand & Coach Verified Badge */}
          <div
            onClick={() => { setActiveCourse(null); setActiveTab('courses'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
          >
            {portalSettings.logoUrl ? (
              <img
                src={portalSettings.logoUrl}
                alt={portalSettings.portalTitle}
                style={{ height: '42px', width: 'auto', borderRadius: '10px', objectFit: 'contain' }}
              />
            ) : (
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${themeColor} 0%, #8b5cf6 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                color: '#fff',
                fontSize: '20px',
                boxShadow: `0 8px 20px ${themeColor}45`
              }}>
                {(portalSettings.portalTitle || 'A')[0]}
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: '#fff', letterSpacing: '-0.3px' }}>
                  {portalSettings.portalTitle || 'UpKlick MasterClass Academy'}
                </h1>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#10b981',
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '20px'
                }}>
                  <ShieldCheck size={11} /> موثق
                </span>
              </div>
              <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                {portalSettings.portalTagline || 'بوابة النخبة للتعلم واحتراف المهارات وتطوير الأعمال'}
              </span>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => { setActiveCourse(null); setActiveTab('courses'); }}
              className={`nav-pill-btn ${activeTab === 'courses' && !activeCourse ? 'active' : ''}`}
            >
              <BookOpen size={17} color={activeTab === 'courses' && !activeCourse ? themeColor : '#94a3b8'} />
              <span>الكورسات والمسارات</span>
              <span style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '2px 7px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '800'
              }}>
                {courses.length}
              </span>
            </button>

            {portalSettings.showCommunities !== false && (
              <button
                onClick={() => { setActiveCourse(null); setActiveTab('community'); }}
                className={`nav-pill-btn ${activeTab === 'community' && !activeCourse ? 'active' : ''}`}
              >
                <Users size={17} color={activeTab === 'community' && !activeCourse ? themeColor : '#94a3b8'} />
                <span>مجتمع الطلاب VIP</span>
                <span style={{
                  background: 'rgba(255, 107, 53, 0.15)',
                  color: themeColor,
                  padding: '2px 7px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: '800'
                }}>
                  تفاعل مباشر
                </span>
              </button>
            )}

            <button
              onClick={() => { setActiveCourse(null); setActiveTab('achievements'); }}
              className={`nav-pill-btn ${activeTab === 'achievements' && !activeCourse ? 'active' : ''}`}
            >
              <Award size={17} color={activeTab === 'achievements' && !activeCourse ? themeColor : '#94a3b8'} />
              <span>إنجازاتي وشهاداتي</span>
            </button>
          </nav>

          {/* Right Action: Student Profile / Sign In */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {currentStudent ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '6px 14px',
                borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${themeColor} 0%, #10b981 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  color: '#fff',
                  fontSize: '14px'
                }}>
                  {(currentStudent.name || 'ط')[0]}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>
                    {currentStudent.name}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={11} /> طالب مسجل • {totalAcademyProgress}% إنجاز
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="تسجيل الخروج"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '8px',
                    padding: '6px 8px',
                    color: '#f87171',
                    cursor: 'pointer',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginRight: '4px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="shimmer-button"
                style={{
                  background: `linear-gradient(135deg, ${themeColor} 0%, #d946ef 100%)`,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 22px',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: `0 6px 20px ${themeColor}40`
                }}
              >
                <User size={15} />
                <span>تسجيل الدخول / البدء</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 2. MAIN PORTAL BODY                                                   */}
      {/* ===================================================================== */}
      <main style={{ flex: 1, maxWidth: '1360px', width: '100%', margin: '0 auto', padding: '32px 24px', position: 'relative', zIndex: 10 }}>

        {/* ----------------------------------------------------------------- */}
        {/* VIEW A: INTERACTIVE CINEMA VIDEO THEATER MODE                     */}
        {/* ----------------------------------------------------------------- */}
        {activeCourse ? (
          <div>
            {/* Top Navigation & Breadcrumbs */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '14px',
              background: 'rgba(15, 20, 32, 0.6)',
              padding: '12px 18px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <button
                onClick={() => setActiveCourse(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: themeColor,
                  fontSize: '13.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <ArrowRight size={16} />
                <span>العودة لكافة الكورسات</span>
              </button>

              {/* Theater Mode Toggle & Progress Pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  type="button"
                  onClick={() => setTheaterMode(!theaterMode)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {theaterMode ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                  <span>{theaterMode ? 'الوضع العادي' : 'وضع السينما'}</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                    إنجاز الكورس: <strong style={{ color: '#10b981' }}>{getCourseProgress(activeCourse)}%</strong>
                  </span>
                  <div style={{ width: '120px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${getCourseProgress(activeCourse)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                      boxShadow: '0 0 10px rgba(16, 185, 129, 0.6)',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Split Screen Cinema Layout: Left Video (70% or 100%) + Right Curriculum (30% or hidden/bottom) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: theaterMode ? '1fr' : '1fr 380px',
              gap: '28px',
              alignItems: 'start'
            }}>
              {/* Main Column: Cinema Player & Tabs */}
              <div>
                {renderVideoPlayer(activeLesson)}

                {/* Lesson Action Bar & Quick Next/Prev Controls */}
                <div className="glass-card" style={{ padding: '24px', marginTop: '20px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    paddingBottom: '18px',
                    marginBottom: '18px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{
                          background: 'rgba(255, 107, 53, 0.15)',
                          color: themeColor,
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}>
                          {activeCourse.category || 'كورس احترافي'}
                        </span>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          ⏱ {activeLesson?.duration || '15 دقيقة'}
                        </span>
                      </div>
                      <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#fff', lineHeight: '1.4' }}>
                        {activeLesson?.title || activeCourse.title}
                      </h2>
                    </div>

                    {/* Lesson Completion Button */}
                    {activeLesson && (
                      <button
                        type="button"
                        onClick={() => handleToggleLessonComplete(activeLesson.id)}
                        className="shimmer-button"
                        style={{
                          background: completedLessons.includes(activeLesson.id)
                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.3) 100%)'
                            : `linear-gradient(135deg, ${themeColor} 0%, #ea580c 100%)`,
                          border: completedLessons.includes(activeLesson.id) ? '1px solid #10b981' : 'none',
                          color: completedLessons.includes(activeLesson.id) ? '#34d399' : '#fff',
                          borderRadius: '12px',
                          padding: '10px 20px',
                          fontSize: '13.5px',
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          boxShadow: completedLessons.includes(activeLesson.id)
                            ? '0 0 20px rgba(16, 185, 129, 0.25)'
                            : `0 6px 20px ${themeColor}40`,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <CheckCircle2 size={17} />
                        <span>
                          {completedLessons.includes(activeLesson.id) ? 'تم إنهاء هذا الدرس بنجاح ✓' : 'تحديد الدرس كمكتمل'}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Previous / Next Lesson Navigation Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <button
                      type="button"
                      onClick={handlePrevLesson}
                      disabled={currentLessonIndex <= 0}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: currentLessonIndex <= 0 ? '#64748b' : '#fff',
                        borderRadius: '10px',
                        padding: '8px 16px',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        cursor: currentLessonIndex <= 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <ArrowRight size={14} />
                      <span>الدرس السابق</span>
                    </button>

                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      الدرس {currentLessonIndex + 1} من {allCurrentLessons.length}
                    </span>

                    <button
                      type="button"
                      onClick={handleNextLesson}
                      disabled={currentLessonIndex >= allCurrentLessons.length - 1}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: currentLessonIndex >= allCurrentLessons.length - 1 ? '#64748b' : '#fff',
                        borderRadius: '10px',
                        padding: '8px 16px',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        cursor: currentLessonIndex >= allCurrentLessons.length - 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>الدرس التالي</span>
                      <ArrowLeft size={14} />
                    </button>
                  </div>

                  {/* Interactive Under-Video Tabs Header */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    paddingBottom: '12px',
                    marginBottom: '16px'
                  }}>
                    <button
                      type="button"
                      onClick={() => setActiveLessonTab('notes')}
                      style={{
                        background: activeLessonTab === 'notes' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                        border: 'none',
                        color: activeLessonTab === 'notes' ? '#fff' : '#94a3b8',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: '800',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <FileText size={15} color={activeLessonTab === 'notes' ? themeColor : '#94a3b8'} />
                      <span>ملخص وتطبيق الدرس</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveLessonTab('resources')}
                      style={{
                        background: activeLessonTab === 'resources' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                        border: 'none',
                        color: activeLessonTab === 'resources' ? '#fff' : '#94a3b8',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: '800',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Download size={15} color={activeLessonTab === 'resources' ? themeColor : '#94a3b8'} />
                      <span>الملفات والمرفقات (3)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveLessonTab('comments')}
                      style={{
                        background: activeLessonTab === 'comments' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                        border: 'none',
                        color: activeLessonTab === 'comments' ? '#fff' : '#94a3b8',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: '800',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <MessageSquare size={15} color={activeLessonTab === 'comments' ? themeColor : '#94a3b8'} />
                      <span>نقاش الدرس</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveLessonTab('certificate')}
                      style={{
                        background: activeLessonTab === 'certificate' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                        border: 'none',
                        color: activeLessonTab === 'certificate' ? '#fff' : '#94a3b8',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: '800',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Award size={15} color={activeLessonTab === 'certificate' ? '#10b981' : '#94a3b8'} />
                      <span>شهادة التخرج</span>
                    </button>
                  </div>

                  {/* Tab 1: Lesson Notes & Practical Checklist */}
                  {activeLessonTab === 'notes' && (
                    <div>
                      <div style={{
                        fontSize: '13.5px',
                        lineHeight: '1.7',
                        color: '#cbd5e1',
                        background: 'rgba(255, 255, 255, 0.02)',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        marginBottom: '18px',
                        whiteSpace: 'pre-line'
                      }}>
                        {activeLesson?.notes || '📌 ركائز التطبيق العملي لهذا الدرس:\n1. قم بمراجعة النقاط الأساسية وتدوين ملاحظاتك الخاصة.\n2. حمل ملفات العمل المرفقة لتطبيق الخطوات على مشروعك التجاري.\n3. شارك تساؤلاتك في خانة النقاش للحصول على تغذية راجعة فورية.'}
                      </div>

                      {/* Interactive Checklist */}
                      <h4 style={{ fontSize: '13.5px', fontWeight: '800', color: '#fff', margin: '0 0 10px' }}>
                        📋 قائمة المهام والتطبيق الفوري (Action Checklist):
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                          'مشاهدة المحاضرة بتركيز وتدوين النقاط الجوهرية',
                          'تحميل الملف المرفق واستخراج قوالب العمل الجاهزة',
                          'تطبيق الخطوة الأولى على نشاطك الإعلاني أو البيعي فوراً'
                        ].map((task, idx) => {
                          const isDone = !!checkedChecklist[`${activeLesson?.id}_${idx}`];
                          return (
                            <div
                              key={idx}
                              onClick={() => toggleChecklist(`${activeLesson?.id}_${idx}`)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                background: isDone ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                                border: isDone ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(255, 255, 255, 0.05)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {isDone ? (
                                <CheckSquare size={16} color="#10b981" />
                              ) : (
                                <Square size={16} color="#64748b" />
                              )}
                              <span style={{
                                fontSize: '13px',
                                color: isDone ? '#fff' : '#94a3b8',
                                textDecoration: isDone ? 'line-through' : 'none'
                              }}>
                                {task}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Downloadable Resources */}
                  {activeLessonTab === 'resources' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 6px' }}>
                        الملفات والقوالب المعتمدة المرفقة لمساعدتك في التطبيق السريع:
                      </p>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                            <FileText size={20} />
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>
                              {activeLesson?.attachmentName || 'دليل_التطبيق_العملي_الشامل.pdf'}
                            </div>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>PDF Document • 3.4 MB</span>
                          </div>
                        </div>

                        <a
                          href={activeLesson?.attachmentUrl || '#'}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            background: 'rgba(255, 107, 53, 0.15)',
                            border: '1px solid rgba(255, 107, 53, 0.3)',
                            color: themeColor,
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '800',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Download size={13} />
                          <span>تحميل الملف</span>
                        </a>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                            <Layers size={20} />
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>
                              قالب_حساب_الأرباح_والـ_ROAS.xlsx
                            </div>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>Excel Spreadsheet • 1.2 MB</span>
                          </div>
                        </div>

                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); alert('جاري تجهيز التحميل المباشر للجدول'); }}
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#fff',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '800',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Download size={13} />
                          <span>تحميل</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Lesson Discussion */}
                  {activeLessonTab === 'comments' && (
                    <div>
                      {/* Post Comment Input */}
                      <form onSubmit={handleAddLessonComment} style={{ marginBottom: '18px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input
                            type="text"
                            value={newLessonComment}
                            onChange={(e) => setNewLessonComment(e.target.value)}
                            placeholder="اطرح استفسارك حول هذا الدرس أو شارك رأيك..."
                            style={{
                              flex: 1,
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '10px',
                              padding: '10px 14px',
                              color: '#fff',
                              fontSize: '13px',
                              outline: 'none'
                            }}
                          />
                          <button
                            type="submit"
                            style={{
                              background: themeColor,
                              color: '#fff',
                              border: 'none',
                              borderRadius: '10px',
                              padding: '10px 18px',
                              fontSize: '12.5px',
                              fontWeight: '800',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Send size={13} />
                            <span>إرسال</span>
                          </button>
                        </div>
                      </form>

                      {/* Comments List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {(lessonComments[activeLesson?.id] || [
                          { id: 'c_default', authorName: 'Mohamed Hesham (المدرب)', content: 'أي سؤال أو نقطة ترغب في توضيحها أكثر في هذا الدرس، اكتبها هنا وسأجيبك شخصياً 🚀', time: 'منذ يوم' }
                        ]).map((c) => (
                          <div key={c.id} style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '10px',
                            padding: '12px 14px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <span style={{ fontSize: '12.5px', fontWeight: '800', color: themeColor }}>
                                {c.authorName}
                              </span>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>{c.time}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5' }}>
                              {c.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab 4: Completion Certificate Preview */}
                  {activeLessonTab === 'certificate' && (
                    <div style={{
                      background: 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.15) 0%, rgba(10, 14, 23, 0.95) 100%)',
                      border: '2px solid rgba(16, 185, 129, 0.35)',
                      borderRadius: '16px',
                      padding: '30px',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', marginBottom: '14px' }}>
                        <GraduationCap size={44} />
                      </div>
                      <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', margin: '0 0 6px' }}>
                        شهادة التخرج والإتمام المعتمدة
                      </h3>
                      <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 auto 18px', maxWidth: '440px' }}>
                        تمنح باسم الطالب <strong>{currentStudent?.name || 'الطالب'}</strong> فور إنهاء كافة دروس ووحدات الكورس بنسبة 100%.
                      </p>

                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        padding: '8px 18px',
                        borderRadius: '20px',
                        fontSize: '12.5px',
                        color: '#10b981',
                        fontWeight: '800'
                      }}>
                        <span>نسبة تقدمك الحالية: {getCourseProgress(activeCourse)}%</span>
                        {getCourseProgress(activeCourse) >= 100 ? '🎉 مكتمل وجاهز للطباعة' : '⏳ متبقي القليل'}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Right Column: Course Curriculum Modules & Lessons Drawer */}
              {!theaterMode && (
                <div className="glass-card" style={{ padding: '20px', maxHeight: '85vh', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: '#fff' }}>
                      منهج وخريطة الكورس
                    </h3>
                    <span style={{ fontSize: '11.5px', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '8px' }}>
                      {(activeCourse.modules || []).length} وحدات • {allCurrentLessons.length} دروس
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(activeCourse.modules || []).map((mod, modIdx) => {
                      const modId = mod.id || modIdx;
                      const isExpanded = expandedModules[modId] !== false;
                      const modLessons = mod.lessons || [];
                      const completedInMod = modLessons.filter(l => completedLessons.includes(l.id)).length;

                      return (
                        <div key={modId} style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>
                          {/* Module Header Accordion */}
                          <div
                            onClick={() => toggleModule(modId)}
                            style={{
                              padding: '12px 14px',
                              background: 'rgba(255, 255, 255, 0.04)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              cursor: 'pointer',
                              userSelect: 'none'
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff', marginBottom: '2px' }}>
                                {mod.title}
                              </div>
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                {completedInMod}/{modLessons.length} مكتمل
                              </span>
                            </div>
                            {isExpanded ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
                          </div>

                          {/* Lessons List in Module */}
                          {isExpanded && (
                            <div style={{ padding: '6px' }}>
                              {modLessons.map((lesson, lesIdx) => {
                                const isCurrent = activeLesson?.id === lesson.id;
                                const isDone = completedLessons.includes(lesson.id);
                                return (
                                  <div
                                    key={lesson.id || lesIdx}
                                    onClick={() => {
                                      setActiveLesson(lesson);
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '10px 12px',
                                      borderRadius: '8px',
                                      background: isCurrent ? 'rgba(255, 107, 53, 0.15)' : 'transparent',
                                      border: isCurrent ? `1px solid ${themeColor}50` : '1px solid transparent',
                                      cursor: 'pointer',
                                      marginBottom: '4px',
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                      {/* Playing Soundwave or Checkmark */}
                                      {isCurrent ? (
                                        <div className="eq-container">
                                          <div className="eq-bar" />
                                          <div className="eq-bar" />
                                          <div className="eq-bar" />
                                        </div>
                                      ) : isDone ? (
                                        <CheckCircle2 size={16} color="#10b981" />
                                      ) : (
                                        <Play size={14} color="#64748b" />
                                      )}

                                      <span style={{
                                        fontSize: '12.5px',
                                        color: isCurrent ? '#fff' : isDone ? '#cbd5e1' : '#94a3b8',
                                        fontWeight: isCurrent ? '800' : 'normal',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      }}>
                                        {lesson.title}
                                      </span>
                                    </div>

                                    <span style={{ fontSize: '11px', color: '#64748b', marginRight: '6px' }}>
                                      {lesson.duration || '15د'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'courses' ? (
          /* ----------------------------------------------------------------- */
          /* VIEW B: CINEMA COURSES CATALOG & HERO BANNER                      */
          /* ----------------------------------------------------------------- */
          <div>
            {/* MasterClass Hero Banner */}
            <div className="glass-card" style={{
              padding: '42px 36px',
              marginBottom: '36px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'linear-gradient(135deg, rgba(22, 28, 44, 0.85) 0%, rgba(10, 14, 23, 0.95) 100%)'
            }}>
              {portalSettings.bannerUrl && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${portalSettings.bannerUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.16,
                  zIndex: 0
                }} />
              )}

              <div style={{ position: 'relative', zIndex: 2, maxWidth: '780px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 107, 53, 0.15)',
                  border: '1px solid rgba(255, 107, 53, 0.35)',
                  color: themeColor,
                  fontSize: '11.5px',
                  fontWeight: '800',
                  padding: '5px 14px',
                  borderRadius: '20px',
                  marginBottom: '14px'
                }}>
                  <Flame size={14} />
                  <span>الأكاديمية الرسمية المعتمدة | Official MasterClass Portal</span>
                </div>

                <h2 style={{
                  fontSize: '32px',
                  fontWeight: '900',
                  color: '#fff',
                  margin: '0 0 12px',
                  lineHeight: '1.3',
                  letterSpacing: '-0.5px'
                }}>
                  {portalSettings.portalTitle || 'UpKlick MasterClass Academy'}
                </h2>

                <p style={{
                  fontSize: '15px',
                  color: '#94a3b8',
                  lineHeight: '1.7',
                  margin: '0 0 24px'
                }}>
                  {portalSettings.welcomeMessage || 'مرحباً بك في الأكاديمية! يسعدنا انضمامك لرحلتنا التعليمية المتكاملة مع التدريب العملي والتطبيق المباشر خطوة بخطوة.'}
                </p>

                {/* 4 Luxury Stat Badges */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontSize: '13px', fontWeight: '800' }}>
                      <Star size={15} fill="#fbbf24" /> 4.95 / 5.0
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>تقييم متميز من مئات الطلاب</span>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '13px', fontWeight: '800' }}>
                      <Award size={15} /> شهادة معتمدة
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>تصدر فور إتمام المنهج</span>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '13px', fontWeight: '800' }}>
                      <Users size={15} /> +1,480 طالب
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>في مجتمع النخبة النشط</span>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c084fc', fontSize: '13px', fontWeight: '800' }}>
                      <Sparkles size={15} /> وصول مدى الحياة
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>يشمل التحديثات الدورية</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Search & Filter Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '26px'
            }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '900', margin: '0 0 4px', color: '#fff' }}>
                  المسارات التدريبية المتاحة ({filteredCourses.length})
                </h3>
                <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                  اختر المسار التدريبي للبدء في مشاهدة المحاضرات والتطبيقات العملية
                </span>
              </div>

              {/* Search Box & Category Filters */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{
                  position: 'relative',
                  width: '260px'
                }}>
                  <Search size={15} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث في الكورسات..."
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      padding: '8px 36px 8px 12px',
                      color: '#fff',
                      fontSize: '12.5px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {['الكل', 'التسويق والإعلانات', 'المبيعات وتطوير الأعمال', 'الذكاء الاصطناعي والأتمتة'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        background: selectedCategory === cat ? themeColor : 'rgba(255, 255, 255, 0.05)',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Courses 3-Column Responsive Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '26px'
            }}>
              {filteredCourses.map((course) => {
                const progress = getCourseProgress(course);
                const lessonCount = (course.modules || []).reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
                return (
                  <div
                    key={course.id}
                    className="glass-card"
                    style={{ display: 'flex', flexDirection: 'column' }}
                  >
                    {/* 16:9 Thumbnail with Overlay & Badges */}
                    <div
                      onClick={() => handleSelectCourse(course)}
                      style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '16/9',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: '#0d111b'
                      }}
                    >
                      <img
                        src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'}
                        alt={course.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease'
                        }}
                      />

                      {/* Dark Vignette Overlay */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, rgba(7, 9, 14, 0.9) 0%, transparent 60%)'
                      }} />

                      {/* Top Badges */}
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        left: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          background: 'rgba(10, 14, 23, 0.85)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '3px 9px',
                          borderRadius: '6px'
                        }}>
                          {course.level || 'احترافي'}
                        </span>

                        <span style={{
                          background: 'rgba(255, 107, 53, 0.85)',
                          backdropFilter: 'blur(8px)',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '3px 9px',
                          borderRadius: '6px'
                        }}>
                          {course.badge || '🔥 ماستر كلاس'}
                        </span>
                      </div>

                      {/* Center Hover Play Icon */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '50%',
                          background: 'rgba(255, 107, 53, 0.9)',
                          boxShadow: '0 0 25px rgba(255, 107, 53, 0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          transform: 'scale(0.95)',
                          transition: 'transform 0.2s ease'
                        }}>
                          <Play size={22} style={{ marginRight: '-2px' }} fill="#fff" />
                        </div>
                      </div>

                      {/* Progress Line */}
                      {progress > 0 && (
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '4px',
                          background: 'rgba(0,0,0,0.6)'
                        }}>
                          <div style={{ width: `${progress}%`, height: '100%', background: '#10b981' }} />
                        </div>
                      )}
                    </div>

                    {/* Course Body Details */}
                    <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11.5px', color: themeColor, fontWeight: '800' }}>
                          {course.category || 'المسار التدريبي'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontSize: '11.5px', fontWeight: '800' }}>
                          <Star size={12} fill="#fbbf24" /> {course.rating || 4.9}
                        </div>
                      </div>

                      <h4 style={{
                        margin: '0 0 8px',
                        fontSize: '16.5px',
                        fontWeight: '900',
                        color: '#fff',
                        lineHeight: '1.4'
                      }}>
                        {course.title}
                      </h4>

                      <p style={{
                        margin: '0 0 18px',
                        fontSize: '12.5px',
                        color: '#94a3b8',
                        lineHeight: '1.6',
                        flex: 1
                      }}>
                        {course.description}
                      </p>

                      {/* Module, Lesson, & Student Count Bar */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        paddingTop: '14px',
                        marginBottom: '16px',
                        fontSize: '12px',
                        color: '#94a3b8'
                      }}>
                        <span>📁 {(course.modules || []).length} وحدات</span>
                        <span>🎥 {lessonCount} دروس</span>
                        <span>⏱ {course.duration || '4 ساعات'}</span>
                      </div>

                      {/* CTA Button */}
                      <button
                        type="button"
                        onClick={() => handleSelectCourse(course)}
                        className="shimmer-button"
                        style={{
                          width: '100%',
                          background: progress > 0
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            : `linear-gradient(135deg, ${themeColor} 0%, #ea580c 100%)`,
                          color: '#fff',
                          border: 'none',
                          borderRadius: '12px',
                          padding: '12px',
                          fontWeight: '900',
                          fontSize: '13.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: progress > 0 ? '0 4px 16px rgba(16, 185, 129, 0.3)' : `0 4px 16px ${themeColor}35`
                        }}
                      >
                        <Play size={15} fill="#fff" />
                        <span>{progress > 0 ? `متابعة المشاهدة (${progress}%)` : 'ابدأ دراسة الكورس الآن'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'community' ? (
          /* ----------------------------------------------------------------- */
          /* VIEW C: SKOOL-STYLE VIP COMMUNITY LOUNGE                          */
          /* ----------------------------------------------------------------- */
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>
            {/* Community Header Banner */}
            <div className="glass-card" style={{ padding: '24px 28px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 107, 53, 0.15)', color: themeColor, fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '12px', marginBottom: '8px' }}>
                    <Users size={12} /> صالون مجتمع الأكاديمية VIP
                  </div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#fff' }}>
                    ملتقى النقاشات وتبادل الخبرات المباشر
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                    تفاعل مع زملائك، اطرح أسئلتك التقنية والبيعية، وشارك نتائجك اليومية مباشرة مع المدرب.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '800', background: 'rgba(16, 185, 129, 0.15)', padding: '6px 12px', borderRadius: '10px' }}>
                    🟢 +48 متصل الآن
                  </span>
                </div>
              </div>
            </div>

            {/* Create New Post Form */}
            <form onSubmit={handleSubmitPost} className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${themeColor} 0%, #8b5cf6 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '800',
                  fontSize: '15px'
                }}>
                  {(currentStudent?.name || 'ط')[0]}
                </div>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="شارك سؤالاً، إنجازاً حققته، أو فكرة ترغب في مناقشتها مع زملائك..."
                  rows={3}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    color: '#fff',
                    fontSize: '13.5px',
                    resize: 'none',
                    outline: 'none',
                    lineHeight: '1.6'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={submittingPost || !newPostContent.trim()}
                  className="shimmer-button"
                  style={{
                    background: `linear-gradient(135deg, ${themeColor} 0%, #ea580c 100%)`,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px 24px',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: submittingPost || !newPostContent.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: `0 4px 14px ${themeColor}40`
                  }}
                >
                  <Send size={14} />
                  <span>{submittingPost ? 'جاري النشر...' : 'نشر في المجتمع'}</span>
                </button>
              </div>
            </form>

            {/* Posts List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {posts.map((post) => {
                const isLiked = !!likedPosts[post.id];
                const likeCount = (post.likesCount || 0) + (isLiked ? 1 : 0);

                return (
                  <div key={post.id} className="glass-card" style={{ padding: '22px' }}>
                    {post.isPinned && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        color: '#f59e0b',
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '3px 10px',
                        borderRadius: '6px',
                        marginBottom: '12px'
                      }}>
                        📌 منشور وإعلان مثبت من المدرب
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: post.isCoach
                          ? `linear-gradient(135deg, ${themeColor} 0%, #f59e0b 100%)`
                          : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '900',
                        fontSize: '16px',
                        color: '#fff',
                        boxShadow: post.isCoach ? '0 0 15px rgba(255, 107, 53, 0.4)' : 'none'
                      }}>
                        {(post.authorName || 'ط')[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{post.authorName}</span>
                          {post.isCoach && (
                            <span style={{ background: themeColor, color: '#fff', fontSize: '10px', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                              المدرب
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          {post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toLocaleString('ar-EG') : 'منذ قليل'}
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#e2e8f0', margin: '0 0 16px', whiteSpace: 'pre-line' }}>
                      {post.content}
                    </p>

                    {/* Post Actions (Like, Reply) */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      paddingTop: '12px'
                    }}>
                      <button
                        type="button"
                        onClick={() => handleLikePost(post.id)}
                        style={{
                          background: isLiked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                          border: isLiked ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
                          color: isLiked ? '#f87171' : '#94a3b8',
                          borderRadius: '8px',
                          padding: '6px 14px',
                          fontSize: '12px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <ThumbsUp size={13} />
                        <span>{likeCount} تفاعل</span>
                      </button>

                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                        💬 {(post.comments || []).length} تعليقات
                      </span>
                    </div>

                    {/* Comments Thread */}
                    {post.comments && post.comments.length > 0 && (
                      <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '12px' }}>
                        {post.comments.map(c => (
                          <div key={c.id} style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            border: '1px solid rgba(255, 255, 255, 0.04)'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ fontSize: '12.5px', fontWeight: '800', color: c.isCoach ? themeColor : '#fff' }}>
                                {c.authorName} {c.isCoach && '👑'}
                              </span>
                              <span style={{ fontSize: '10.5px', color: '#64748b' }}>{c.createdAt}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.5' }}>
                              {c.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ----------------------------------------------------------------- */
          /* VIEW D: STUDENT ACHIEVEMENTS & CERTIFICATE VAULT                  */
          /* ----------------------------------------------------------------- */
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div className="glass-card" style={{ padding: '32px', textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${themeColor} 0%, #10b981 100%)`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                marginBottom: '16px',
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.35)'
              }}>
                <Award size={36} />
              </div>

              <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', margin: '0 0 8px' }}>
                لوحة إنجازات الطالب وشهادات التخرج
              </h3>
              <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 auto 24px', maxWidth: '520px', lineHeight: '1.6' }}>
                تابع مسار تطورك التعليمي، الساعات التدريبية المكتملة، واحصل على شهاداتك الرسمية المعتمدة فور إنهاء الكورسات.
              </p>

              {/* Progress Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', maxWidth: '640px', margin: '0 auto' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '26px', fontWeight: '900', color: '#fff' }}>{completedLessons.length}</div>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>دروس مكتملة</span>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '26px', fontWeight: '900', color: themeColor }}>{totalAcademyProgress}%</div>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>إجمالي تقدم الأكاديمية</span>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontSize: '26px', fontWeight: '900', color: '#10b981' }}>{courses.length}</div>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>مسارات مسجلة</span>
                </div>
              </div>
            </div>

            {/* Certificates Showcase */}
            <h4 style={{ fontSize: '17px', fontWeight: '900', color: '#fff', margin: '0 0 16px' }}>
              🎓 شهادات الكورسات المعتمدة:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {courses.map(course => {
                const prog = getCourseProgress(course);
                const isCertified = prog >= 100;
                return (
                  <div key={course.id} className="glass-card" style={{
                    padding: '22px 26px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: isCertified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        border: isCertified ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isCertified ? '#10b981' : '#64748b'
                      }}>
                        <Award size={24} />
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 4px', fontSize: '15.5px', fontWeight: '800', color: '#fff' }}>
                          شهادة إتمام {course.title}
                        </h4>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          المستوى: {course.level || 'احترافي'} • نسبة الإنجاز: {prog}%
                        </span>
                      </div>
                    </div>

                    <div>
                      {isCertified ? (
                        <button
                          type="button"
                          onClick={() => alert(`مبروك! تم إصدار شهادتك المعتمدة باسم: ${currentStudent?.name || 'الطالب'}`)}
                          style={{
                            background: '#10b981',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px 20px',
                            fontSize: '13px',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                          }}
                        >
                          <Download size={14} />
                          <span>تحميل الشهادة المعتمدة PDF</span>
                        </button>
                      ) : (
                        <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: '700' }}>
                          🔒 يتطلب إنهاء 100% من الدروس
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* Floating WhatsApp Support Button with Online Beacon */}
      {portalSettings.whatsappNumber && (
        <a
          href={`https://wa.me/${portalSettings.whatsappNumber.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noreferrer"
          title="تواصل المباشر مع دعم الأكاديمية عبر واتساب"
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#25D366',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 30px rgba(37, 211, 102, 0.5)',
            zIndex: 9999,
            textDecoration: 'none',
            transition: 'transform 0.2s ease'
          }}
        >
          <span style={{ fontSize: '28px' }}>💬</span>
          <span style={{
            position: 'absolute',
            top: '3px',
            right: '3px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#10b981',
            border: '2px solid #07090e'
          }} />
        </a>
      )}

      {/* Student Registration / Login Modal */}
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(14px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            maxWidth: '440px',
            width: '100%',
            padding: '32px',
            boxShadow: '0 25px 60px -15px rgba(0,0,0,0.8)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#fff' }}>
                تسجيل الدخول إلى الأكاديمية
              </h3>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 20px', lineHeight: '1.6' }}>
              أدخل اسمك وبريدك الإلكتروني لحفظ تقدمك في مشاهدة الدروس والوصول للمجتمع والشهادات.
            </p>

            <form onSubmit={handleStudentAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: '800', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  اسمك الكامل:
                </label>
                <input
                  type="text"
                  required
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  placeholder="مثال: أحمد محمد"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    color: '#fff',
                    fontSize: '13.5px',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: '800', color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
                  بريدك الإلكتروني:
                </label>
                <input
                  type="email"
                  required
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  placeholder="student@example.com"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    color: '#fff',
                    fontSize: '13.5px',
                    boxSizing: 'border-box',
                    direction: 'ltr',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                className="shimmer-button"
                style={{
                  marginTop: '10px',
                  background: `linear-gradient(135deg, ${themeColor} 0%, #ea580c 100%)`,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontWeight: '900',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: `0 6px 20px ${themeColor}40`
                }}
              >
                الدخول ومتابعة التعلم ←
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
