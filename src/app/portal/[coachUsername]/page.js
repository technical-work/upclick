'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import {
  getCoachPortalSettings,
  getCoachCourses,
  getCoachCommunities,
  getCommunityPosts,
  createCommunityPost,
  enrollStudent,
  updateStudentLessonProgress,
  DEFAULT_PORTAL_SETTINGS
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
  Clock,
  Send,
  HelpCircle,
  Award
} from 'lucide-react';

export default function StudentClientPortalPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const coachUsername = params?.coachUsername || 'academy';
  const initialCourseId = searchParams.get('course');
  const initialTab = searchParams.get('tab') || 'courses';

  // Portal & Content States
  const [portalSettings, setPortalSettings] = useState(DEFAULT_PORTAL_SETTINGS);
  const [courses, setCourses] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active View Navigation
  const [activeTab, setActiveTab] = useState(initialTab); // 'courses', 'community'
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);

  // Student Auth State (Stored in localStorage for seamless client-portal experience)
  const [currentStudent, setCurrentStudent] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '' });
  const [completedLessons, setCompletedLessons] = useState([]); // Array of lesson IDs completed by student

  // Community Feed State
  const [activeCommunityId, setActiveCommunityId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);

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

        setCourses(cList);
        setCommunities(commList);

        if (commList.length > 0) {
          setActiveCommunityId(commList[0].id);
        }

        // Direct course deep link
        if (initialCourseId && cList.length > 0) {
          const target = cList.find(c => c.id === initialCourseId);
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

  // Student Sign In / Register
  const handleStudentAuth = async (e) => {
    e.preventDefault();
    if (!authForm.email.trim()) return;

    const studentObj = {
      name: authForm.name.trim() || authForm.email.split('@')[0],
      email: authForm.email.trim().toLowerCase(),
      enrolledCourses: courses.map(c => c.id), // grant all courses on open registration
      completedLessons: []
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
    // Select first lesson by default
    const firstModule = (course.modules || [])[0];
    const firstLesson = (firstModule?.lessons || [])[0];
    if (firstLesson) {
      setActiveLesson(firstLesson);
    }
  };

  // Toggle Lesson Completion
  const handleToggleLessonComplete = async (lessonId) => {
    const isCompleted = completedLessons.includes(lessonId);
    let updated;
    if (isCompleted) {
      updated = completedLessons.filter(id => id !== lessonId);
    } else {
      updated = [...completedLessons, lessonId];
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

  // Video embed helper
  const renderVideoPlayer = (lesson) => {
    if (!lesson?.videoUrl) {
      return (
        <div style={{
          width: '100%',
          aspectRatio: '16/9',
          background: '#0d0d15',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text3)',
          border: '1px solid var(--line)'
        }}>
          <Video size={48} color="var(--orange)" style={{ marginBottom: '12px' }} />
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{lesson?.title || 'Course Lesson'}</p>
          <span style={{ fontSize: '12px', opacity: 0.8 }}>No video attached for this lesson yet.</span>
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
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--line)', background: '#000' }}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      );
    }

    // Vimeo
    if (url.includes('vimeo.com')) {
      const vimeoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return (
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--line)', background: '#000' }}>
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}`}
            title={lesson.title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      );
    }

    // Loom
    if (url.includes('loom.com')) {
      const loomUrl = url.replace('/share/', '/embed/');
      return (
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--line)', background: '#000' }}>
          <iframe
            src={loomUrl}
            title={lesson.title}
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      );
    }

    // Direct MP4
    return (
      <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--line)', background: '#000' }}>
        <video
          controls
          src={url}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
    );
  };

  // Submit Community Post
  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() || !activeCommunityId) return;
    setSubmittingPost(true);
    try {
      const authorName = currentStudent?.name || 'Student';
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#08080f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'inherit' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #FF6B35', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }}></div>
          <p style={{ fontSize: '14px', color: '#a1a1aa' }}>Loading Academy...</p>
        </div>
      </div>
    );
  }

  const themeColor = portalSettings.themeColor || '#FF6B35';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#090912',
      color: '#f4f4f5',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>

      {/* 1. Standalone Academy Header (White-label, No UpKlick brand) */}
      <header style={{
        background: 'rgba(18, 18, 28, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '0 24px'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Logo & Portal Name */}
          <div
            onClick={() => { setActiveCourse(null); setActiveTab('courses'); }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          >
            {portalSettings.logoUrl ? (
              <img
                src={portalSettings.logoUrl}
                alt={portalSettings.portalTitle}
                style={{ height: '36px', width: 'auto', borderRadius: '8px', objectFit: 'contain' }}
              />
            ) : (
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${themeColor} 0%, #a855f7 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                color: '#fff',
                fontSize: '18px'
              }}>
                {(portalSettings.portalTitle || 'A')[0]}
              </div>
            )}
            <div>
              <h1 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#fff', letterSpacing: '-0.2px' }}>
                {portalSettings.portalTitle || 'Academy Portal'}
              </h1>
              <span style={{ fontSize: '11px', color: '#a1a1aa' }}>
                {portalSettings.portalTagline || 'Exclusive Student Learning Area'}
              </span>
            </div>
          </div>

          {/* Navigation Items (Courses & Communities) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => { setActiveCourse(null); setActiveTab('courses'); }}
              style={{
                background: activeTab === 'courses' && !activeCourse ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none',
                color: activeTab === 'courses' && !activeCourse ? '#fff' : '#a1a1aa',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <BookOpen size={16} color={activeTab === 'courses' ? themeColor : '#a1a1aa'} />
              <span>الكورسات والمحتوى</span>
            </button>

            {portalSettings.showCommunities !== false && (
              <button
                onClick={() => { setActiveCourse(null); setActiveTab('community'); }}
                style={{
                  background: activeTab === 'community' && !activeCourse ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: 'none',
                  color: activeTab === 'community' && !activeCourse ? '#fff' : '#a1a1aa',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Users size={16} color={activeTab === 'community' ? themeColor : '#a1a1aa'} />
                <span>المجتمع والنقاشات</span>
              </button>
            )}
          </div>

          {/* Student Profile / Login Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {currentStudent ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#fff' }}>{currentStudent.name}</div>
                  <div style={{ fontSize: '10.5px', color: '#a1a1aa' }}>طالب مسجل</div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="تسجيل الخروج"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                style={{
                  background: themeColor,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  boxShadow: `0 4px 14px ${themeColor}40`
                }}
              >
                تسجيل الدخول / البدء
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Portal Body */}
      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '24px' }}>

        {/* ------------------------------------------------------------- */}
        {/* VIEW A: INTERACTIVE VIDEO COURSE PLAYER                       */}
        {/* ------------------------------------------------------------- */}
        {activeCourse ? (
          <div>
            {/* Breadcrumb Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <button
                onClick={() => setActiveCourse(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: themeColor,
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                ← العودة إلى قائمة الكورسات
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: '#a1a1aa' }}>
                  نسبة الإنجاز: <strong style={{ color: themeColor }}>{getCourseProgress(activeCourse)}%</strong>
                </span>
                <div style={{ width: '100px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${getCourseProgress(activeCourse)}%`, height: '100%', background: themeColor, transition: 'width 0.3s ease' }}></div>
                </div>
              </div>
            </div>

            {/* Split Screen: Video Player on Left (70%) + Curriculum Sidebar on Right (30%) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
              {/* Left Column: Player & Notes */}
              <div>
                {renderVideoPlayer(activeLesson)}

                {/* Lesson Details & Actions Bar */}
                <div style={{
                  background: 'rgba(18, 18, 28, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '20px',
                  marginTop: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px', marginBottom: '14px' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#fff' }}>
                        {activeLesson?.title || activeCourse.title}
                      </h2>
                      <span style={{ fontSize: '12px', color: '#a1a1aa' }}>
                        ⏱ {activeLesson?.duration || '15 min'} • {activeCourse.title}
                      </span>
                    </div>

                    {/* Mark as completed button */}
                    {activeLesson && (
                      <button
                        type="button"
                        onClick={() => handleToggleLessonComplete(activeLesson.id)}
                        style={{
                          background: completedLessons.includes(activeLesson.id) ? 'rgba(16, 185, 129, 0.15)' : themeColor,
                          border: completedLessons.includes(activeLesson.id) ? '1px solid #10b981' : 'none',
                          color: completedLessons.includes(activeLesson.id) ? '#10b981' : '#fff',
                          borderRadius: '10px',
                          padding: '8px 16px',
                          fontSize: '12.5px',
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <CheckCircle2 size={16} />
                        <span>
                          {completedLessons.includes(activeLesson.id) ? 'تم إنهاء هذا الدرس ✓' : 'تحديد كمكتمل'}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Study Notes & Attachments */}
                  {activeLesson?.notes && (
                    <div style={{ marginBottom: '14px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#a1a1aa', margin: '0 0 6px' }}>📝 ملخص وملاحظات الدرس:</h4>
                      <div style={{ fontSize: '13px', lineHeight: '1.6', color: '#e4e4e7', background: 'rgba(255,255,255,0.02)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                        {activeLesson.notes}
                      </div>
                    </div>
                  )}

                  {activeLesson?.attachmentUrl && (
                    <div style={{ marginTop: '10px' }}>
                      <a
                        href={activeLesson.attachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'rgba(168, 85, 247, 0.12)',
                          border: '1px solid rgba(168, 85, 247, 0.3)',
                          color: '#c084fc',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          fontWeight: 'bold',
                          textDecoration: 'none'
                        }}
                      >
                        <Download size={14} />
                        <span>تحميل المرفق والملفات الإضافية للدرس</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Course Curriculum Modules & Lessons */}
              <div style={{
                background: 'rgba(18, 18, 28, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '16px',
                maxHeight: '80vh',
                overflowY: 'auto'
              }}>
                <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>منهج الكورس</span>
                  <span style={{ fontSize: '11px', color: '#a1a1aa', fontWeight: 'normal' }}>
                    {(activeCourse.modules || []).length} وحدات
                  </span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(activeCourse.modules || []).map((mod, modIdx) => (
                    <div key={mod.id || modIdx} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.05)', fontSize: '12.5px', fontWeight: '800', color: themeColor }}>
                        {mod.title}
                      </div>
                      <div style={{ padding: '6px' }}>
                        {(mod.lessons || []).map((lesson, lesIdx) => {
                          const isCurrent = activeLesson?.id === lesson.id;
                          const isDone = completedLessons.includes(lesson.id);
                          return (
                            <div
                              key={lesson.id || lesIdx}
                              onClick={() => setActiveLesson(lesson)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 10px',
                                borderRadius: '6px',
                                background: isCurrent ? 'rgba(255, 107, 53, 0.15)' : 'transparent',
                                border: isCurrent ? `1px solid ${themeColor}40` : '1px solid transparent',
                                cursor: 'pointer',
                                fontSize: '12px',
                                color: isCurrent ? '#fff' : '#d4d4d8',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                <span style={{ color: isDone ? '#10b981' : isCurrent ? themeColor : '#71717a' }}>
                                  {isDone ? '✓' : '▶'}
                                </span>
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {lesson.title}
                                </span>
                              </div>
                              <span style={{ fontSize: '10px', color: '#71717a' }}>
                                {lesson.duration || '15m'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'courses' ? (
          /* ------------------------------------------------------------- */
          /* VIEW B: COURSES CATALOG & MY ENROLLED COURSES                 */
          /* ------------------------------------------------------------- */
          <div>
            {/* Hero Welcome Banner */}
            <div style={{
              position: 'relative',
              borderRadius: '20px',
              overflow: 'hidden',
              marginBottom: '28px',
              background: `linear-gradient(135deg, rgba(18, 18, 28, 0.95) 0%, rgba(10, 10, 18, 0.98) 100%)`,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '36px'
            }}>
              {portalSettings.bannerUrl && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${portalSettings.bannerUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.15,
                  zIndex: 0
                }}></div>
              )}
              <div style={{ position: 'relative', zIndex: 1, maxWidth: '680px' }}>
                <span style={{
                  display: 'inline-block',
                  background: 'rgba(255, 107, 53, 0.15)',
                  border: '1px solid rgba(255, 107, 53, 0.3)',
                  color: themeColor,
                  fontSize: '11px',
                  fontWeight: 'bold',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  marginBottom: '10px'
                }}>
                  🎓 مرحباً بك في بوابة التدريب المباشر
                </span>
                <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#fff', margin: '0 0 10px' }}>
                  {portalSettings.portalTitle}
                </h2>
                <p style={{ fontSize: '14px', color: '#a1a1aa', lineHeight: '1.6', margin: 0 }}>
                  {portalSettings.welcomeMessage || 'ابدأ الآن في تصفح الكورسات والمحاضرات المسجلة والمواد التدريبية المخصصة لك.'}
                </p>
              </div>
            </div>

            {/* Courses Grid */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
                الكورسات المتاحة ({courses.length})
              </h3>
            </div>

            {courses.length === 0 ? (
              <div style={{
                background: 'rgba(18, 18, 28, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '60px 20px',
                textAlign: 'center',
                color: '#a1a1aa'
              }}>
                <BookOpen size={40} color={themeColor} style={{ margin: '0 auto 12px' }} />
                <h4 style={{ color: '#fff', fontSize: '16px', margin: '0 0 6px' }}>قريباً.. يتم تجهيز الكورسات</h4>
                <p style={{ fontSize: '13px', margin: 0 }}>المدرب يقوم حالياً برفع المحتوى والدروس التدريبية.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
                {courses.map((course) => {
                  const progress = getCourseProgress(course);
                  const lessonCount = (course.modules || []).reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
                  return (
                    <div
                      key={course.id}
                      style={{
                        background: 'rgba(18, 18, 28, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s ease, border-color 0.2s ease'
                      }}
                    >
                      <div style={{ position: 'relative', width: '100%', height: '175px', background: '#111' }}>
                        <img
                          src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'}
                          alt={course.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {progress > 0 && (
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: 'rgba(0,0,0,0.5)'
                          }}>
                            <div style={{ width: `${progress}%`, height: '100%', background: '#10b981' }}></div>
                          </div>
                        )}
                      </div>

                      <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '11px', color: themeColor, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>
                          {course.category || 'Course'}
                        </span>
                        <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '800', color: '#fff', lineHeight: '1.4' }}>
                          {course.title}
                        </h4>
                        <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: '#a1a1aa', lineHeight: '1.5', flex: 1 }}>
                          {course.description || 'كورس تدريبي شامل يتضمن فيديوهات وشروحات وتطبيقات عملية.'}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', marginBottom: '14px', fontSize: '12px', color: '#71717a' }}>
                          <span>📁 {(course.modules || []).length} وحدات</span>
                          <span>🎥 {lessonCount} محاضرة</span>
                          {progress > 0 ? (
                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>{progress}% مكتمل</span>
                          ) : (
                            <span style={{ color: themeColor, fontWeight: 'bold' }}>جديد</span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectCourse(course)}
                          style={{
                            width: '100%',
                            background: themeColor,
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '10px',
                            fontWeight: '800',
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <Play size={14} />
                          <span>{progress > 0 ? 'متابعة المشاهدة ▶' : 'ابدأ دراسة الكورس الآن'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* VIEW C: COMMUNITY DISCUSSION BOARD                            */
          /* ------------------------------------------------------------- */
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Community Header & Group Selector */}
            <div style={{
              background: 'rgba(18, 18, 28, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: '0 0 10px', fontSize: '17px', fontWeight: '800' }}>
                💬 مجتمع النقاشات والأسئلة
              </h3>
              <p style={{ margin: '0 0 14px', fontSize: '12.5px', color: '#a1a1aa' }}>
                شارك أسئلتك، تجاربك، وتفاعل مع زملائك والمدرب مباشرة داخل الأكاديمية.
              </p>

              {communities.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {communities.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setActiveCommunityId(c.id)}
                      style={{
                        background: activeCommunityId === c.id ? themeColor : 'rgba(255,255,255,0.06)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {c.icon || '💬'} {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Create Post Input */}
            <form onSubmit={handleSubmitPost} style={{
              background: 'rgba(18, 18, 28, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="اكتب سؤالك أو شارك فكرة مع المجتمع..."
                rows={3}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '13px',
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={submittingPost || !newPostContent.trim()}
                  style={{
                    background: themeColor,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 18px',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    cursor: submittingPost ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Send size={13} />
                  <span>نشر في المجتمع</span>
                </button>
              </div>
            </form>

            {/* Posts Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {posts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#71717a' }}>
                  <MessageSquare size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '13px' }}>كن أول من يبدأ النقاش ويشارك مع زملائه!</p>
                </div>
              ) : (
                posts.map(post => (
                  <div key={post.id} style={{
                    background: 'rgba(18, 18, 28, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '14px',
                    padding: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${themeColor} 0%, #a855f7 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        color: '#fff'
                      }}>
                        {(post.authorName || 'U')[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{post.authorName || 'Student'}</div>
                        <div style={{ fontSize: '10.5px', color: '#71717a' }}>
                          {post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: '13.5px', lineHeight: '1.6', color: '#e4e4e7', margin: 0, whiteSpace: 'pre-wrap' }}>
                      {post.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </main>

      {/* Floating WhatsApp Support Button */}
      {portalSettings.whatsappNumber && (
        <a
          href={`https://wa.me/${portalSettings.whatsappNumber.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noreferrer"
          title="تواصل مع الدعم عبر واتساب"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: '#25D366',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)',
            zIndex: 9999,
            textDecoration: 'none'
          }}
        >
          <span style={{ fontSize: '26px' }}>💬</span>
        </a>
      )}

      {/* 3. Student Registration / Login Modal */}
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#12121f',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '18px',
            maxWidth: '420px',
            width: '100%',
            padding: '24px',
            animation: 'scaleUp 0.25s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#fff' }}>
                تسجيل الدخول إلى الأكاديمية
              </h3>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                style={{ background: 'none', border: 'none', color: '#a1a1aa', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
            <p style={{ fontSize: '12.5px', color: '#a1a1aa', margin: '0 0 16px' }}>
              أدخل اسمك وبريدك الإلكتروني لحفظ تقدمك في مشاهدة الدروس والوصول للمجتمع.
            </p>

            <form onSubmit={handleStudentAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#a1a1aa', display: 'block', marginBottom: '4px' }}>
                  اسمك الكامل:
                </label>
                <input
                  type="text"
                  required
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  placeholder="مثال: أحمد محمد"
                  style={{ width: '100%', background: '#1c1c2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#a1a1aa', display: 'block', marginBottom: '4px' }}>
                  بريدك الإلكتروني:
                </label>
                <input
                  type="email"
                  required
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  placeholder="student@example.com"
                  style={{ width: '100%', background: '#1c1c2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px', boxSizing: 'border-box', direction: 'ltr' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '10px',
                  background: themeColor,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontWeight: '800',
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  boxShadow: `0 4px 14px ${themeColor}40`
                }}
              >
                الدخول والمتابعة →
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
