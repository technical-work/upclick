'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { useAuth } from '../../context/AuthContext';
import {
  getCoachPortalSettings,
  saveCoachPortalSettings,
  subscribeCoachCourses,
  saveCourse,
  deleteCourse,
  subscribeCoachStudents,
  enrollStudent,
  subscribeCoachCommunities,
  saveCommunityGroup,
  DEFAULT_PORTAL_SETTINGS
} from '../../lib/membershipsService';
import {
  BookOpen,
  Users,
  Settings,
  Globe,
  Plus,
  Play,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Edit,
  Video,
  FileText,
  MessageSquare,
  Award,
  ChevronDown,
  Layers,
  Search,
  Sliders,
  DollarSign,
  TrendingUp,
  BarChart2,
  Lock,
  Eye,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon,
  MessageCircle
} from 'lucide-react';

export default function CoursesView() {
  const { lang, L, t, showToast } = useBusiness();
  const { user, userData } = useAuth();
  const isRTL = lang === 'ar';

  const coachId = user?.uid || 'demo-coach';
  const coachName = userData?.name || user?.displayName || user?.email?.split('@')[0] || 'Mohamed Joe';
  const defaultSlug = (userData?.username || coachName).toLowerCase().replace(/[^a-z0-9]/g, '-');

  // Top Nav State
  const [activeMainTab, setActiveMainTab] = useState('portal'); // 'portal', 'courses', 'communities', 'students', 'credentials'
  const [activeSubTab, setActiveSubTab] = useState('dashboard'); // depends on main tab

  // Data States
  const [portalSettings, setPortalSettings] = useState(DEFAULT_PORTAL_SETTINGS);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Course Builder / Modals State
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [curriculumCourse, setCurriculumCourse] = useState(null); // Course currently editing modules/lessons
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'E-commerce & Business',
    price: 0,
    currency: 'EGP',
    thumbnailUrl: '',
    isPublished: true
  });

  // Module / Lesson Modal
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');
  const [activeModuleIndex, setActiveModuleIndex] = useState(null);

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLessonIndex, setEditingLessonIndex] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    videoUrl: '',
    videoType: 'youtube', // 'youtube', 'vimeo', 'loom', 'mp4'
    duration: '15 min',
    notes: '',
    attachmentUrl: '',
    attachmentName: '',
    isFreePreview: false
  });

  // Student Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    selectedCourses: []
  });

  // Community Group Modal
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    icon: '💬',
    isPrivate: false
  });

  // Settings Save State
  const [savingSettings, setSavingSettings] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // Load portal settings and subscribe to data
  useEffect(() => {
    let unsubCourses = () => {};
    let unsubStudents = () => {};
    let unsubComm = () => {};

    async function init() {
      try {
        const settings = await getCoachPortalSettings(coachId);
        if (!settings.portalSlug) {
          settings.portalSlug = defaultSlug;
        }
        setPortalSettings(settings);

        unsubCourses = subscribeCoachCourses(coachId, (data) => setCourses(data));
        unsubStudents = subscribeCoachStudents(coachId, (data) => setStudents(data));
        unsubComm = subscribeCoachCommunities(coachId, (data) => setCommunities(data));
      } catch (err) {
        console.warn('Memberships load warning:', err);
      } finally {
        setLoading(false);
      }
    }

    init();

    return () => {
      unsubCourses();
      unsubStudents();
      unsubComm();
    };
  }, [coachId, defaultSlug]);

  // Public Portal URL
  const portalSlug = portalSettings.portalSlug || defaultSlug;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://upklick.net';
  const publicPortalUrl = `${baseUrl}/portal/${portalSlug}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(publicPortalUrl);
      setCopied(true);
      showToast(L('Portal link copied to clipboard!', 'تم نسخ رابط الأكاديمية بنجاح!'));
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Save Portal Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await saveCoachPortalSettings(coachId, portalSettings);
      showToast(L('Portal settings saved successfully!', 'تم حفظ إعدادات الأكاديمية بنجاح!'));
    } catch (err) {
      console.error(err);
      showToast(L('Failed to save settings: ' + err.message, 'فشل حفظ الإعدادات: ' + err.message), 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Open Course Modal
  const handleOpenCreateCourse = () => {
    setEditingCourse(null);
    setCourseForm({
      title: '',
      description: '',
      category: 'E-commerce & Business',
      price: 0,
      currency: 'EGP',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
      isPublished: true,
      modules: [
        {
          id: 'mod_1',
          title: isRTL ? 'الوحدة الأولى: البداية والأساسيات' : 'Module 1: Getting Started & Foundations',
          lessons: [
            {
              id: 'les_1',
              title: isRTL ? 'مقدمة ترحيبية وخريطة الطريق' : 'Welcome & Master Roadmap',
              videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              videoType: 'youtube',
              duration: '10 min',
              notes: 'أهلاً بك في هذا الكورس! جهز دفتر ملاحظاتك ولنبدأ.',
              attachmentUrl: '',
              attachmentName: '',
              isFreePreview: true
            }
          ]
        }
      ]
    });
    setShowCourseModal(true);
  };

  const handleEditCourseInfo = (course) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title || '',
      description: course.description || '',
      category: course.category || 'General',
      price: course.price || 0,
      currency: course.currency || 'EGP',
      thumbnailUrl: course.thumbnailUrl || '',
      isPublished: course.isPublished !== false,
      modules: course.modules || []
    });
    setShowCourseModal(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.title.trim()) {
      showToast(L('Please enter a course title', 'يرجى إدخال عنوان الكورس'), 'error');
      return;
    }

    try {
      const payload = {
        ...courseForm,
        coachName,
        id: editingCourse ? editingCourse.id : undefined
      };
      await saveCourse(coachId, payload);
      setShowCourseModal(false);
      showToast(editingCourse ? L('Course updated!', 'تم تحديث الكورس!') : L('Course created successfully!', 'تم إنشاء الكورس بنجاح!'));
    } catch (err) {
      console.error(err);
      showToast(L('Error saving course', 'خطأ أثناء حفظ الكورس'), 'error');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm(isRTL ? 'هل أنت متأكد من حذف هذا الكورس وجميع دروسه؟' : 'Are you sure you want to delete this course and all its lessons?')) return;
    try {
      await deleteCourse(courseId);
      if (curriculumCourse?.id === courseId) setCurriculumCourse(null);
      showToast(L('Course deleted', 'تم حذف الكورس'));
    } catch (err) {
      console.error(err);
    }
  };

  // Curriculum Builder Actions
  const handleOpenCurriculum = (course) => {
    setCurriculumCourse(course);
    setActiveMainTab('courses');
    setActiveSubTab('curriculum');
  };

  const handleAddModule = () => {
    if (!moduleTitle.trim()) return;
    const updatedModules = [
      ...(curriculumCourse.modules || []),
      {
        id: 'mod_' + Date.now(),
        title: moduleTitle.trim(),
        lessons: []
      }
    ];
    saveCurriculumUpdate(updatedModules);
    setModuleTitle('');
    setShowModuleModal(false);
  };

  const handleDeleteModule = (modIdx) => {
    if (!window.confirm(isRTL ? 'حذف هذه الوحدة بجميع دروسها؟' : 'Delete this module and its lessons?')) return;
    const updatedModules = (curriculumCourse.modules || []).filter((_, idx) => idx !== modIdx);
    saveCurriculumUpdate(updatedModules);
  };

  const handleOpenAddLesson = (modIdx) => {
    setActiveModuleIndex(modIdx);
    setEditingLessonIndex(null);
    setLessonForm({
      title: '',
      videoUrl: '',
      videoType: 'youtube',
      duration: '15 min',
      notes: '',
      attachmentUrl: '',
      attachmentName: '',
      isFreePreview: false
    });
    setShowLessonModal(true);
  };

  const handleOpenEditLesson = (modIdx, lessonIdx) => {
    setActiveModuleIndex(modIdx);
    setEditingLessonIndex(lessonIdx);
    const existing = curriculumCourse.modules[modIdx].lessons[lessonIdx];
    setLessonForm({
      title: existing.title || '',
      videoUrl: existing.videoUrl || '',
      videoType: existing.videoType || 'youtube',
      duration: existing.duration || '15 min',
      notes: existing.notes || '',
      attachmentUrl: existing.attachmentUrl || '',
      attachmentName: existing.attachmentName || '',
      isFreePreview: !!existing.isFreePreview
    });
    setShowLessonModal(true);
  };

  const handleSaveLesson = () => {
    if (!lessonForm.title.trim()) {
      showToast(L('Lesson title is required', 'عنوان الدرس مطلوب'), 'error');
      return;
    }

    const currentModules = JSON.parse(JSON.stringify(curriculumCourse.modules || []));
    const targetModule = currentModules[activeModuleIndex];
    if (!targetModule) return;

    if (!targetModule.lessons) targetModule.lessons = [];

    if (editingLessonIndex !== null) {
      targetModule.lessons[editingLessonIndex] = {
        ...targetModule.lessons[editingLessonIndex],
        ...lessonForm
      };
    } else {
      targetModule.lessons.push({
        id: 'les_' + Date.now(),
        ...lessonForm
      });
    }

    saveCurriculumUpdate(currentModules);
    setShowLessonModal(false);
  };

  const handleDeleteLesson = (modIdx, lesIdx) => {
    if (!window.confirm(isRTL ? 'حذف هذا الدرس؟' : 'Delete this lesson?')) return;
    const currentModules = JSON.parse(JSON.stringify(curriculumCourse.modules || []));
    currentModules[modIdx].lessons = currentModules[modIdx].lessons.filter((_, idx) => idx !== lesIdx);
    saveCurriculumUpdate(currentModules);
  };

  const saveCurriculumUpdate = async (updatedModules) => {
    const updated = {
      ...curriculumCourse,
      modules: updatedModules
    };
    setCurriculumCourse(updated);
    try {
      await saveCourse(coachId, updated);
      showToast(L('Curriculum saved!', 'تم حفظ محتوى الكورس!'));
    } catch (err) {
      console.error(err);
      showToast(L('Error updating curriculum', 'حدث خطأ أثناء التحديث'), 'error');
    }
  };

  // Invite Student Action
  const handleInviteStudent = async (e) => {
    e.preventDefault();
    if (!inviteForm.email.trim()) {
      showToast(L('Please enter student email', 'يرجى إدخال البريد الإلكتروني'), 'error');
      return;
    }
    try {
      await enrollStudent(coachId, {
        name: inviteForm.name.trim() || inviteForm.email.split('@')[0],
        email: inviteForm.email.trim(),
        enrolledCourses: inviteForm.selectedCourses
      });
      setShowInviteModal(false);
      setInviteForm({ name: '', email: '', selectedCourses: [] });
      showToast(L('Student added & enrolled successfully!', 'تم إضافة الطالب وتفعيله بنجاح!'));
    } catch (err) {
      console.error(err);
      showToast(L('Error inviting student', 'حدث خطأ أثناء إضافة الطالب'), 'error');
    }
  };

  // Create Community Group
  const handleSaveGroup = async (e) => {
    e.preventDefault();
    if (!groupForm.name.trim()) return;
    try {
      await saveCommunityGroup(coachId, groupForm);
      setShowGroupModal(false);
      setGroupForm({ name: '', description: '', icon: '💬', isPrivate: false });
      showToast(L('Community group created!', 'تم إنشاء مجتمع المحادثة بنجاح!'));
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics calculation
  const totalLessonsCount = courses.reduce((acc, c) => {
    return acc + (c.modules || []).reduce((mAcc, m) => mAcc + (m.lessons?.length || 0), 0);
  }, 0);

  const filteredCourses = courses.filter(c =>
    (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pg on" style={{ maxWidth: '1240px', width: '100%', margin: '0 auto', paddingBottom: '60px' }}>

      {/* 1. GoHighLevel Style Main Header Navigation */}
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        borderRadius: '16px',
        padding: '8px 16px',
        marginBottom: '22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Left Side: Brand title & Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingInlineEnd: '14px',
            borderInlineEnd: '1px solid var(--line)',
            fontWeight: '800',
            fontSize: '15px',
            color: 'var(--orange)'
          }}>
            <BookOpen size={20} />
            <span>{isRTL ? 'الأكاديمية والعضويات' : 'Memberships'}</span>
          </div>

          {/* Sub Navigation Items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* 1. Client Portal */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => { setActiveMainTab('portal'); setActiveSubTab('dashboard'); }}
                className={`btn btn-sm ${activeMainTab === 'portal' ? 'btn-prime' : 'btn-ghost'}`}
                style={{ borderRadius: '8px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Globe size={15} />
                <span>{L('Client Portal', 'بوابة الطلاب')}</span>
              </button>
            </div>

            {/* 2. Courses */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => { setActiveMainTab('courses'); setActiveSubTab('products'); }}
                className={`btn btn-sm ${activeMainTab === 'courses' ? 'btn-prime' : 'btn-ghost'}`}
                style={{ borderRadius: '8px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Layers size={15} />
                <span>{L('Courses', 'الكورسات')}</span>
                <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '10px' }}>
                  {courses.length}
                </span>
              </button>
            </div>

            {/* 3. Communities */}
            <div>
              <button
                type="button"
                onClick={() => { setActiveMainTab('communities'); setActiveSubTab('groups'); }}
                className={`btn btn-sm ${activeMainTab === 'communities' ? 'btn-prime' : 'btn-ghost'}`}
                style={{ borderRadius: '8px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Users size={15} />
                <span>{L('Communities', 'المجتمعات')}</span>
              </button>
            </div>

            {/* 4. Students & Members */}
            <div>
              <button
                type="button"
                onClick={() => { setActiveMainTab('students'); setActiveSubTab('list'); }}
                className={`btn btn-sm ${activeMainTab === 'students' ? 'btn-prime' : 'btn-ghost'}`}
                style={{ borderRadius: '8px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <CheckCircle2 size={15} />
                <span>{L('Students & Members', 'الطلاب والمشتركين')}</span>
                <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '10px' }}>
                  {students.length}
                </span>
              </button>
            </div>

            {/* 5. Credentials */}
            <div>
              <button
                type="button"
                onClick={() => { setActiveMainTab('credentials'); setActiveSubTab('certs'); }}
                className={`btn btn-sm ${activeMainTab === 'credentials' ? 'btn-prime' : 'btn-ghost'}`}
                style={{ borderRadius: '8px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Award size={15} />
                <span>{L('Credentials', 'الشهادات')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Fast Portal URL & Preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handleCopyLink}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '12px', border: '1px solid var(--line)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title={publicPortalUrl}
          >
            {copied ? <Check size={14} color="var(--green)" /> : <Copy size={14} />}
            <span>{copied ? L('Copied!', 'تم النسخ!') : L('Copy Portal Link', 'نسخ رابط البوابة')}</span>
          </button>

          <a
            href={publicPortalUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-prime btn-sm"
            style={{ fontSize: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
          >
            <ExternalLink size={14} />
            <span>{L('Preview Portal', 'معاينة البوابة')}</span>
          </a>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CLIENT PORTAL                                                      */}
      {/* ========================================================================= */}
      {activeMainTab === 'portal' && (
        <div>
          {/* Sub Tabs: Dashboard vs Settings */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
            <button
              onClick={() => setActiveSubTab('dashboard')}
              className={`btn btn-sm ${activeSubTab === 'dashboard' ? 'btn-prime' : 'btn-ghost'}`}
              style={{ borderRadius: '8px' }}
            >
              📊 {L('Dashboard', 'لوحة التحكم')}
            </button>
            <button
              onClick={() => setActiveSubTab('settings')}
              className={`btn btn-sm ${activeSubTab === 'settings' ? 'btn-prime' : 'btn-ghost'}`}
              style={{ borderRadius: '8px' }}
            >
              ⚙️ {L('Client Portal Settings', 'إعدادات وهوية البوابة')}
            </button>
          </div>

          {activeSubTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* GoHighLevel Top Banner */}
              <div style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)',
                borderRadius: '16px',
                padding: '28px 32px',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 10px 30px rgba(124, 58, 237, 0.25)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ maxWidth: '600px', zIndex: 1 }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
                    🚀 {L('White-Label Client Portal', 'بوابة المدرب البيضاء')}
                  </span>
                  <h2 style={{ fontSize: '24px', fontWeight: '900', margin: '10px 0 6px', color: '#fff' }}>
                    {portalSettings.portalTitle || `${coachName}'s Academy`}
                  </h2>
                  <p style={{ fontSize: '13.5px', opacity: 0.9, lineHeight: '1.5', margin: 0 }}>
                    {L(
                      'Launch your custom student gateway. Students access courses and community discussions without seeing any UpKlick branding.',
                      'أطلق بوابتك التعليمية الخاصة. يدخل طلابك لمشاهدة الكورسات والمجتمع بدون ظهور أي أدوات داخلية لـ UpKlick.'
                    )}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', zIndex: 1 }}>
                  <button
                    onClick={() => setActiveSubTab('settings')}
                    className="btn btn-sm"
                    style={{ background: '#fff', color: '#7c3aed', fontWeight: '800', border: 'none', borderRadius: '10px', padding: '10px 18px' }}
                  >
                    🎨 {L('Customize Branding', 'تخصيص الهوية')}
                  </button>
                  <button
                    onClick={handleOpenCreateCourse}
                    className="btn btn-sm"
                    style={{ background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '10px', padding: '10px 18px' }}
                  >
                    + {L('Add Course', 'إضافة كورس')}
                  </button>
                </div>
              </div>

              {/* Public Portal URL Card (from Screenshot 1) */}
              <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                  <div style={{ flex: '1 1 450px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 6px 0', color: 'var(--text)' }}>
                      {L('Creating a protected online gateway for client interactions', 'بوابة تعليمية آمنة مخصصة لطلابك')}
                    </h3>
                    <p style={{ fontSize: '12.5px', color: 'var(--text3)', margin: '0 0 16px 0' }}>
                      {L(
                        'What is a client portal? Your clients and students can log in anytime to access courses, watch video lessons, and interact in your community.',
                        'ما هي بوابة الطلاب؟ هي رابط مخصص يدخل عليه طلابك للتسجيل، دراسة الكورسات، ومتابعة المحادثات داخل مجتمعك.'
                      )}
                    </p>

                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>
                      {L('Client Portal Public URL', 'رابط بوابة الطلاب العامة (أرسله للطلاب)')}
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'var(--bg3)',
                      border: '1px solid var(--line)',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      gap: '10px'
                    }}>
                      <LinkIcon size={16} color="var(--orange)" />
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', direction: 'ltr', textAlign: 'left' }}>
                        {publicPortalUrl}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="btn btn-sm btn-ghost"
                        style={{ padding: '4px 10px', color: 'var(--orange)', fontWeight: 'bold' }}
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Quick Stat Counters from Screenshot 1 */}
                  <div style={{ display: 'flex', gap: '14px', flex: '0 0 auto' }}>
                    <div style={{
                      background: 'var(--bg2)',
                      border: '1px solid var(--line)',
                      borderRadius: '14px',
                      padding: '20px 24px',
                      textAlign: 'center',
                      minWidth: '130px'
                    }}>
                      <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: '700', marginBottom: '4px' }}>
                        {L('Invited', 'المدعوون')}
                      </div>
                      <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text)' }}>
                        {students.length}
                      </div>
                    </div>

                    <div style={{
                      background: 'var(--bg2)',
                      border: '1px solid var(--line)',
                      borderRadius: '14px',
                      padding: '20px 24px',
                      textAlign: 'center',
                      minWidth: '130px'
                    }}>
                      <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: '700', marginBottom: '4px' }}>
                        {L('Active Users', 'الطلاب النشطون')}
                      </div>
                      <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--orange)' }}>
                        {students.filter(s => s.status === 'active').length || students.length}
                      </div>
                    </div>

                    <div style={{
                      background: 'var(--bg2)',
                      border: '1px solid var(--line)',
                      borderRadius: '14px',
                      padding: '20px 24px',
                      textAlign: 'center',
                      minWidth: '130px'
                    }}>
                      <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: '700', marginBottom: '4px' }}>
                        {L('Courses', 'الكورسات')}
                      </div>
                      <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--green)' }}>
                        {courses.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div className="card" style={{ padding: '20px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255, 107, 53, 0.12)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800' }}>{L('Manage Courses', 'إدارة الكورسات والدروس')}</h4>
                      <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text3)' }}>{courses.length} {L('active products created', 'كورس متوفر حالياً')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setActiveMainTab('courses'); setActiveSubTab('products'); }}
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}
                  >
                    {L('Go to Courses', 'عرض الكورسات')} →
                  </button>
                </div>

                <div className="card" style={{ padding: '20px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.12)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800' }}>{L('Invite Students', 'إضافة ودعوة الطلاب')}</h4>
                      <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text3)' }}>{students.length} {L('enrolled members', 'طالب مسجل')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="btn btn-prime btn-sm"
                    style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}
                  >
                    + {L('Add New Student', 'إضافة طالب جديد')}
                  </button>
                </div>

                <div className="card" style={{ padding: '20px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.12)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800' }}>{L('Community Groups', 'مجتمعات النقاش')}</h4>
                      <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text3)' }}>{communities.length} {L('active spaces', 'مجتمع تفاعلي')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setActiveMainTab('communities'); setActiveSubTab('groups'); }}
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}
                  >
                    {L('Open Communities', 'فتح المجتمعات')} →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Settings Sub-Tab (From Screenshot 4) */}
          {activeSubTab === 'settings' && (
            <div className="card" style={{ padding: '28px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', borderBottom: '1px solid var(--line)', paddingBottom: '14px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                    {L('Client Portal Settings', 'إعدادات وهوية بوابة الطلاب')}
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text3)' }}>
                    {L('Configure custom branding, portal URL slug, access permissions, and contact widget', 'خصص هوية الأكاديمية، رابط البوابة، وصلاحيات التسجيل')}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="btn btn-prime"
                  style={{ borderRadius: '10px', padding: '8px 20px', fontWeight: '700' }}
                >
                  {savingSettings ? L('Saving...', 'جاري الحفظ...') : L('Save Settings', 'حفظ الإعدادات')}
                </button>
              </div>

              {/* 6 Settings Cards Grid from Screenshot 4 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {/* 1. Domain & Slug Setup */}
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '14px', padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <Globe size={18} color="var(--orange)" />
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800' }}>{L('Domain & Slug Setup', 'رابط البوابة (Slug)')}</h4>
                  </div>
                  <label style={{ fontSize: '11.5px', color: 'var(--text3)', display: 'block', marginBottom: '6px' }}>
                    {L('Portal URL identifier:', 'معرف الرابط:')}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '8px', padding: '6px 10px', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text3)', direction: 'ltr' }}>/portal/</span>
                    <input
                      type="text"
                      value={portalSettings.portalSlug || ''}
                      onChange={(e) => setPortalSettings({ ...portalSettings, portalSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      placeholder="mohamed-joe"
                      style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: '13px', fontWeight: '700', outline: 'none', width: '100%', direction: 'ltr' }}
                    />
                  </div>
                </div>

                {/* 2. Branding */}
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '14px', padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <Sparkles size={18} color="#a855f7" />
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800' }}>{L('Branding & Academy Name', 'اسم وهوية الأكاديمية')}</h4>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      value={portalSettings.portalTitle || ''}
                      onChange={(e) => setPortalSettings({ ...portalSettings, portalTitle: e.target.value })}
                      placeholder={isRTL ? 'اسم الأكاديمية (مثال: أكاديمية محمد جو)' : 'Academy Name (e.g. Mohamed Joe Academy)'}
                      style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text)', fontSize: '12.5px' }}
                    />
                    <input
                      type="text"
                      value={portalSettings.portalTagline || ''}
                      onChange={(e) => setPortalSettings({ ...portalSettings, portalTagline: e.target.value })}
                      placeholder={isRTL ? 'الوصف الترحيبي أو الشعار' : 'Tagline or short subtitle'}
                      style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text)', fontSize: '12.5px' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '11.5px', color: 'var(--text3)' }}>{L('Accent Color:', 'اللون الرئيسي:')}</span>
                      <input
                        type="color"
                        value={portalSettings.themeColor || '#FF6B35'}
                        onChange={(e) => setPortalSettings({ ...portalSettings, themeColor: e.target.value })}
                        style={{ border: 'none', background: 'none', width: '32px', height: '32px', cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Logo & Banner */}
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '14px', padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <Sliders size={18} color="var(--green)" />
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800' }}>{L('Logo & Cover Banner', 'اللوجو والغلاف')}</h4>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input
                      type="text"
                      value={portalSettings.logoUrl || ''}
                      onChange={(e) => setPortalSettings({ ...portalSettings, logoUrl: e.target.value })}
                      placeholder={L('Logo Image URL', 'رابط اللوجو')}
                      style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text)', fontSize: '12.5px' }}
                    />
                    <input
                      type="text"
                      value={portalSettings.bannerUrl || ''}
                      onChange={(e) => setPortalSettings({ ...portalSettings, bannerUrl: e.target.value })}
                      placeholder={L('Banner Image URL', 'رابط بانر الغلاف')}
                      style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text)', fontSize: '12.5px' }}
                    />
                  </div>
                </div>

                {/* 4. App Permissions & Access */}
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '14px', padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <Lock size={18} color="var(--accent)" />
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800' }}>{L('App Permissions & Access', 'صلاحيات الدخول')}</h4>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={portalSettings.isOpenRegistration !== false}
                        onChange={(e) => setPortalSettings({ ...portalSettings, isOpenRegistration: e.target.checked })}
                      />
                      <span>{L('Open Registration (Anyone with link can join)', 'تسجيل مفتوح (يمكن لأي شخص لديه الرابط التسجيل)')}</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={portalSettings.showCommunities !== false}
                        onChange={(e) => setPortalSettings({ ...portalSettings, showCommunities: e.target.checked })}
                      />
                      <span>{L('Enable Community Discussions', 'تفعيل مجتمعات ونقاشات الطلاب')}</span>
                    </label>
                  </div>
                </div>

                {/* 5. Support & Chat Widget */}
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '14px', padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <MessageCircle size={18} color="var(--green)" />
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800' }}>{L('Chat & Support Widget', 'زر الدعم والتواصل المباشر')}</h4>
                  </div>
                  <input
                    type="text"
                    value={portalSettings.whatsappNumber || ''}
                    onChange={(e) => setPortalSettings({ ...portalSettings, whatsappNumber: e.target.value })}
                    placeholder={isRTL ? 'رقم واتساب للتواصل (مثال: +201012345678)' : 'WhatsApp Support (+2010...)'}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text)', fontSize: '12.5px' }}
                  />
                </div>

                {/* 6. Welcome Message */}
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--line)', borderRadius: '14px', padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <FileText size={18} color="var(--orange)" />
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800' }}>{L('Welcome Message', 'رسالة الترحيب للطلاب')}</h4>
                  </div>
                  <textarea
                    value={portalSettings.welcomeMessage || ''}
                    onChange={(e) => setPortalSettings({ ...portalSettings, welcomeMessage: e.target.value })}
                    rows={3}
                    placeholder={isRTL ? 'رسالة ترحيبية تظهر للطالب عند فتح البوابة...' : 'Welcome announcement for students...'}
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text)', fontSize: '12px', resize: 'none' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: COURSES (PRODUCTS & CURRICULUM BUILDER)                             */}
      {/* ========================================================================= */}
      {activeMainTab === 'courses' && (
        <div>
          {/* Sub Navigation: Products list vs Curriculum builder */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => { setActiveSubTab('products'); setCurriculumCourse(null); }}
                className={`btn btn-sm ${activeSubTab === 'products' ? 'btn-prime' : 'btn-ghost'}`}
                style={{ borderRadius: '8px' }}
              >
                📦 {L('Products (Courses)', 'الكورسات والمنتجات')}
              </button>
              {curriculumCourse && (
                <button
                  onClick={() => setActiveSubTab('curriculum')}
                  className={`btn btn-sm ${activeSubTab === 'curriculum' ? 'btn-prime' : 'btn-ghost'}`}
                  style={{ borderRadius: '8px', background: 'rgba(255,107,53,0.15)', color: 'var(--orange)' }}
                >
                  ⚡ {L('Curriculum:', 'محتوى:')} {curriculumCourse.title}
                </button>
              )}
            </div>

            {activeSubTab === 'products' && (
              <button
                onClick={handleOpenCreateCourse}
                className="btn btn-prime btn-sm"
                style={{ borderRadius: '8px', padding: '8px 16px', fontWeight: '700' }}
              >
                + {L('Create New Course', 'إنشاء كورس جديد')}
              </button>
            )}
          </div>

          {/* 1. Products List (Matches Screenshot 5) */}
          {activeSubTab === 'products' && (
            <div>
              {/* Search & Filter Header */}
              <div style={{
                background: 'var(--panel)',
                border: '1px solid var(--line)',
                borderRadius: '14px',
                padding: '12px 16px',
                marginBottom: '18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '8px', padding: '6px 12px', minWidth: '240px' }}>
                  <Search size={16} color="var(--text3)" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={L('Search Courses...', 'بحث في الكورسات...')}
                    style={{ background: 'none', border: 'none', color: 'var(--text)', outline: 'none', width: '100%', fontSize: '13px' }}
                  />
                </div>

                <div style={{ fontSize: '12.5px', color: 'var(--text3)' }}>
                  {filteredCourses.length} {L('Courses Found', 'كورس متاح')}
                </div>
              </div>

              {/* Course Cards Grid */}
              {filteredCourses.length === 0 ? (
                <div className="card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '16px' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255, 107, 53, 0.1)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <BookOpen size={28} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0' }}>
                    {L('Start Creating Your First Course', 'ابدأ في إنشاء أول كورس لك')}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text3)', maxWidth: '420px', margin: '0 auto 20px' }}>
                    {L(
                      'You haven\'t created any courses yet. Click the button below to upload your videos and build your curriculum.',
                      'لم تقم بإنشاء أي كورس بعد. اضغط على الزر بالأسفل لرفع دروسك وبناء هيكل الكورس لطلابك.'
                    )}
                  </p>
                  <button
                    onClick={handleOpenCreateCourse}
                    className="btn btn-prime"
                    style={{ borderRadius: '10px', padding: '10px 24px', fontWeight: '700' }}
                  >
                    + {L('Create New Course', 'إنشاء كورس جديد')}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {filteredCourses.map((course) => {
                    const lessonCount = (course.modules || []).reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
                    return (
                      <div
                        key={course.id}
                        className="card"
                        style={{
                          borderRadius: '16px',
                          overflow: 'hidden',
                          padding: 0,
                          border: '1px solid var(--line)',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                      >
                        {/* Course Thumbnail */}
                        <div style={{ position: 'relative', width: '100%', height: '170px', background: '#111', overflow: 'hidden' }}>
                          <img
                            src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'}
                            alt={course.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: isRTL ? 'auto' : '12px',
                            left: isRTL ? '12px' : 'auto',
                            background: course.isPublished ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                            color: '#fff',
                            fontSize: '11px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            backdropFilter: 'blur(4px)'
                          }}>
                            {course.isPublished ? L('Published', 'منشور 🟢') : L('Draft', 'مسودة ⚪')}
                          </div>

                          <div style={{
                            position: 'absolute',
                            bottom: '12px',
                            left: isRTL ? 'auto' : '12px',
                            right: isRTL ? '12px' : 'auto',
                            background: 'rgba(0, 0, 0, 0.75)',
                            color: 'var(--orange)',
                            fontSize: '11px',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            backdropFilter: 'blur(4px)'
                          }}>
                            {Number(course.price) > 0 ? `${course.price} ${course.currency || 'EGP'}` : L('Free Access', 'دخول مجاني 🎁')}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>
                            {course.category || 'General'}
                          </span>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '800', color: 'var(--text)', lineHeight: '1.4' }}>
                            {course.title}
                          </h4>
                          <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: 'var(--text3)', lineHeight: '1.5', flex: 1 }}>
                            {course.description || L('No description provided.', 'لا يوجد وصف.')}
                          </p>

                          {/* Stats: Modules & Lessons */}
                          <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--line)', paddingTop: '12px', marginBottom: '14px', fontSize: '11.5px', color: 'var(--text2)' }}>
                            <span>📁 {(course.modules || []).length} {L('Modules', 'وحدات')}</span>
                            <span>🎥 {lessonCount} {L('Lessons', 'دروس')}</span>
                            <span>👥 {course.studentCount || 0} {L('Students', 'طلاب')}</span>
                          </div>

                          {/* Action Buttons */}
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenCurriculum(course)}
                              className="btn btn-prime btn-sm"
                              style={{ flex: 1, justifyContent: 'center', fontSize: '12px', fontWeight: '700', borderRadius: '8px' }}
                            >
                              ⚡ {L('Edit Curriculum', 'إدارة الدروس')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditCourseInfo(course)}
                              className="btn btn-ghost btn-sm"
                              style={{ border: '1px solid var(--line)', borderRadius: '8px', padding: '6px 10px' }}
                              title={L('Edit Course Info', 'تعديل بيانات الكورس')}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCourse(course.id)}
                              className="btn btn-ghost btn-sm"
                              style={{ border: '1px solid var(--line)', borderRadius: '8px', padding: '6px 10px', color: 'var(--red)' }}
                              title={L('Delete Course', 'حذف الكورس')}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 2. Interactive Curriculum Manager */}
          {activeSubTab === 'curriculum' && curriculumCourse && (
            <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--line)', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <button
                    onClick={() => setActiveSubTab('products')}
                    style={{ background: 'none', border: 'none', color: 'var(--orange)', fontSize: '12px', fontWeight: '700', cursor: 'pointer', padding: 0, marginBottom: '4px' }}
                  >
                    ← {L('Back to Courses', 'الرجوع إلى الكورسات')}
                  </button>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                    {curriculumCourse.title}
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
                    {(curriculumCourse.modules || []).length} {L('Modules', 'وحدات')} • {totalLessonsCount} {L('Lessons', 'دروس')}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setShowModuleModal(true)}
                    className="btn btn-prime btn-sm"
                    style={{ borderRadius: '8px' }}
                  >
                    + {L('Add Module (Section)', 'إضافة وحدة جديدة')}
                  </button>
                  <a
                    href={`${publicPortalUrl}?course=${curriculumCourse.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost btn-sm"
                    style={{ border: '1px solid var(--line)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Eye size={14} />
                    <span>{L('View As Student', 'معاينة كطالب')}</span>
                  </a>
                </div>
              </div>

              {/* Modules & Lessons List */}
              {(curriculumCourse.modules || []).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)' }}>
                  <p>{L('No modules created yet. Add your first module to start uploading lessons.', 'لا توجد وحدات تعليمية بعد. أضف وحدتك الأولى لتبدأ بإضافة الدروس.')}</p>
                  <button
                    onClick={() => setShowModuleModal(true)}
                    className="btn btn-prime btn-sm"
                    style={{ borderRadius: '8px', marginTop: '10px' }}
                  >
                    + {L('Add Module', 'إضافة وحدة')}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {curriculumCourse.modules.map((mod, modIdx) => (
                    <div
                      key={mod.id || modIdx}
                      style={{
                        background: 'var(--bg2)',
                        border: '1px solid var(--line)',
                        borderRadius: '12px',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Module Header */}
                      <div style={{
                        padding: '12px 18px',
                        background: 'var(--bg3)',
                        borderBottom: '1px solid var(--line)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: '800', color: 'var(--orange)', fontSize: '13px' }}>
                            #{modIdx + 1}
                          </span>
                          <span style={{ fontWeight: '800', color: 'var(--text)', fontSize: '14px' }}>
                            {mod.title}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text3)', background: 'var(--panel)', padding: '2px 8px', borderRadius: '10px' }}>
                            {(mod.lessons || []).length} {L('Lessons', 'دروس')}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenAddLesson(modIdx)}
                            className="btn btn-sm btn-prime"
                            style={{ fontSize: '11.5px', padding: '4px 10px', borderRadius: '6px' }}
                          >
                            + {L('Add Lesson', 'إضافة درس')}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteModule(modIdx)}
                            className="btn btn-sm btn-ghost"
                            style={{ color: 'var(--red)', padding: '4px 8px' }}
                            title={L('Delete Module', 'حذف الوحدة')}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Lessons in Module */}
                      <div style={{ padding: '8px 14px' }}>
                        {(mod.lessons || []).length === 0 ? (
                          <div style={{ padding: '14px', textAlign: 'center', fontSize: '12px', color: 'var(--text3)' }}>
                            {L('No lessons in this module yet.', 'لا توجد دروس في هذه الوحدة بعد.')}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {mod.lessons.map((lesson, lesIdx) => (
                              <div
                                key={lesson.id || lesIdx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  background: 'var(--panel)',
                                  border: '1px solid var(--line)',
                                  borderRadius: '8px',
                                  padding: '10px 14px',
                                  gap: '12px'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255, 107, 53, 0.12)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Video size={14} />
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text)' }}>
                                      {lesson.title}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text3)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                                      <span>⏱ {lesson.duration || '15 min'}</span>
                                      {lesson.isFreePreview && (
                                        <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>
                                          🎁 {L('Free Preview', 'معاينة مجانية')}
                                        </span>
                                      )}
                                      {lesson.videoUrl && (
                                        <span style={{ color: 'var(--accent)' }}>
                                          ✓ {L('Video Attached', 'فيديو مرفق')}
                                        </span>
                                      )}
                                      {lesson.attachmentUrl && (
                                        <span style={{ color: '#a855f7' }}>
                                          📎 {L('File Resource', 'ملف مرفق')}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditLesson(modIdx, lesIdx)}
                                    className="btn btn-sm btn-ghost"
                                    style={{ padding: '4px 8px' }}
                                    title={L('Edit Lesson', 'تعديل الدرس')}
                                  >
                                    <Edit size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteLesson(modIdx, lesIdx)}
                                    className="btn btn-sm btn-ghost"
                                    style={{ color: 'var(--red)', padding: '4px 8px' }}
                                    title={L('Delete Lesson', 'حذف الدرس')}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COMMUNITIES (GROUPS & FORUMS)                                      */}
      {/* ========================================================================= */}
      {activeMainTab === 'communities' && (
        <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--line)', paddingBottom: '14px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                {L('Community Groups', 'مجتمعات النقاش التفاعلية')}
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text3)' }}>
                {L('Connect your students in exclusive spaces to share insights, discuss assignments, and build network', 'مكان يجمع طلابك لتبادل الخبرات والأسئلة والواجبات')}
              </p>
            </div>

            <button
              onClick={() => setShowGroupModal(true)}
              className="btn btn-prime btn-sm"
              style={{ borderRadius: '8px' }}
            >
              + {L('Create Community Group', 'إنشاء مجتمع جديد')}
            </button>
          </div>

          {communities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Users size={28} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 6px' }}>{L('You don\'t have a community yet', 'ليس لديك أي مجتمع تفاعلي بعد')}</h4>
              <p style={{ fontSize: '12.5px', maxWidth: '400px', margin: '0 auto 18px' }}>
                {L('Create your first group space so students can chat, ask questions, and celebrate their wins!', 'أنشئ أول مجتمع ليتفاعل فيه طلابك مع بعضهم ومع المدرب مباشرة!')}
              </p>
              <button
                onClick={() => setShowGroupModal(true)}
                className="btn btn-prime"
                style={{ borderRadius: '8px', padding: '8px 20px' }}
              >
                + {L('Create Community Group', 'إنشاء مجتمع الآن')}
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {communities.map((g) => (
                <div
                  key={g.id}
                  style={{
                    background: 'var(--bg2)',
                    border: '1px solid var(--line)',
                    borderRadius: '14px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '26px' }}>{g.icon || '💬'}</span>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>{g.name}</h4>
                      <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{g.memberCount || 1} {L('Members', 'عضو')}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text3)', margin: 0, flex: 1, lineHeight: '1.5' }}>
                    {g.description || L('Private coaching and discussion group for enrolled students.', 'مجموعة تدريب ونقاش مخصصة للطلاب المسجلين.')}
                  </p>
                  <a
                    href={`${publicPortalUrl}?tab=community`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: '6px', justifyContent: 'center', fontSize: '12px' }}
                  >
                    💬 {L('Open Discussion Board', 'فتح لوحة النقاش')} →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: STUDENTS & MEMBERS                                                 */}
      {/* ========================================================================= */}
      {activeMainTab === 'students' && (
        <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--line)', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                {L('Enrolled Students & Learners', 'قائمة الطلاب والمشتركين')}
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text3)' }}>
                {L('Track learning progress, active enrollments, and grant access to courses', 'متابعة تقدم الطلاب، الكورسات المفعلة لهم، وإضافة طلاب جدد')}
              </p>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="btn btn-prime btn-sm"
              style={{ borderRadius: '8px', padding: '8px 16px', fontWeight: '700' }}
            >
              + {L('Invite / Enroll Student', 'إضافة وتفعيل طالب')}
            </button>
          </div>

          {students.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text3)' }}>
              <Users size={32} color="var(--orange)" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 6px' }}>{L('No students enrolled yet', 'لم يتم تسجيل أي طالب حتى الآن')}</h4>
              <p style={{ fontSize: '12.5px', maxWidth: '400px', margin: '0 auto 16px' }}>
                {L('Click the button below to manually enroll a student or share your portal link for instant self-registration.', 'أضف طالباً مباشرة أو شارك رابط الأكاديمية ليسجل بنفسه.')}
              </p>
              <button
                onClick={() => setShowInviteModal(true)}
                className="btn btn-prime btn-sm"
                style={{ borderRadius: '8px' }}
              >
                + {L('Enroll First Student', 'إضافة أول طالب')}
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)', textAlign: isRTL ? 'right' : 'left', color: 'var(--text3)' }}>
                    <th style={{ padding: '10px 12px' }}>{L('Student Name', 'اسم الطالب')}</th>
                    <th style={{ padding: '10px 12px' }}>{L('Email', 'البريد')}</th>
                    <th style={{ padding: '10px 12px' }}>{L('Enrolled Courses', 'الكورسات المشترك بها')}</th>
                    <th style={{ padding: '10px 12px' }}>{L('Status', 'الحالة')}</th>
                    <th style={{ padding: '10px 12px' }}>{L('Joined Date', 'تاريخ الانضمام')}</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((st) => (
                    <tr key={st.id || st.email} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '12px', fontWeight: '700', color: 'var(--text)' }}>
                        {st.name || st.email?.split('@')[0]}
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text2)', direction: 'ltr', textAlign: isRTL ? 'right' : 'left' }}>
                        {st.email}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ background: 'rgba(255,107,53,0.12)', color: 'var(--orange)', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '11px' }}>
                          {(st.enrolledCourses || []).length > 0 ? `${st.enrolledCourses.length} ${L('Courses', 'كورسات')}` : L('All Portal Courses', 'جميع الكورسات')}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ color: 'var(--green)', fontWeight: 'bold', fontSize: '11.5px' }}>
                          ● {L('Active', 'نشط')}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text3)', fontSize: '11.5px' }}>
                        {st.createdAt?.seconds ? new Date(st.createdAt.seconds * 1000).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: CREDENTIALS & CERTIFICATES                                         */}
      {/* ========================================================================= */}
      {activeMainTab === 'credentials' && (
        <div className="card" style={{ padding: '28px', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(234, 179, 8, 0.12)', color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Award size={32} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 8px 0' }}>
            {L('Course Completion Certificates', 'شهادات إتمام الكورسات')}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text3)', maxWidth: '500px', margin: '0 auto 20px', lineHeight: '1.5' }}>
            {L(
              'Automated certificates are granted to students who complete 100% of all video lessons in your academy.',
              'يتم إصدار شهادة تخرج معتمدة باسم مدرب الأكاديمية تلقائياً لكل طالب يكمل 100% من دروس الكورس.'
            )}
          </p>
          <div style={{
            maxWidth: '500px',
            margin: '0 auto',
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(234,179,8,0.05) 0%, rgba(255,107,53,0.05) 100%)',
            border: '2px dashed #eab308',
            borderRadius: '16px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#eab308', marginBottom: '6px' }}>
              📜 {portalSettings.portalTitle || `${coachName}'s Academy`}
            </div>
            <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text)', margin: '8px 0' }}>
              {L('Certificate of Achievement', 'شهادة اجتياز وإتمام تدريب')}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text3)', margin: 0 }}>
              {L('Awarded to students upon completing all modules.', 'تمنح للطلاب الملتزمين عند إنهاء جميع الوحدات.')}
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE / EDIT COURSE                                             */}
      {/* ========================================================================= */}
      {showCourseModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '24px', borderRadius: '18px', animation: 'scaleUp 0.25s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>
                {editingCourse ? L('Edit Course Details', 'تعديل بيانات الكورس') : L('Create New Course', 'إنشاء كورس جديد')}
              </h3>
              <button
                type="button"
                onClick={() => setShowCourseModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCourse} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>
                  {L('Course Title *', 'عنوان الكورس *')}
                </label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder={isRTL ? 'مثال: أسرار التجارة الإلكترونية والأتمتة' : 'e.g. E-commerce Mastery & Automation'}
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>
                  {L('Description', 'الوصف')}
                </label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  rows={3}
                  placeholder={isRTL ? 'نبذة عن مخرجات الكورس وما سيتعلمه الطالب...' : 'What students will learn in this course...'}
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text)', fontSize: '12.5px', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>
                    {L('Category', 'التصنيف')}
                  </label>
                  <input
                    type="text"
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    placeholder="Marketing, Coaching..."
                    style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text)', fontSize: '12.5px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>
                    {L('Price (0 for Free)', 'السعر (0 للمجاني)')}
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="number"
                      value={courseForm.price}
                      onChange={(e) => setCourseForm({ ...courseForm, price: Number(e.target.value) })}
                      style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text)', fontSize: '12.5px' }}
                    />
                    <span style={{ alignSelf: 'center', fontSize: '11px', color: 'var(--text3)' }}>{courseForm.currency}</span>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>
                  {L('Thumbnail Image URL', 'رابط صورة الغلاف')}
                </label>
                <input
                  type="text"
                  value={courseForm.thumbnailUrl}
                  onChange={(e) => setCourseForm({ ...courseForm, thumbnailUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text)', fontSize: '12px' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer', margin: '4px 0' }}>
                <input
                  type="checkbox"
                  checked={courseForm.isPublished}
                  onChange={(e) => setCourseForm({ ...courseForm, isPublished: e.target.checked })}
                />
                <span>{L('Publish course immediately in portal', 'نشر الكورس مباشرة في بوابة الطلاب')}</span>
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="btn btn-ghost"
                  style={{ flex: 1, borderRadius: '8px' }}
                >
                  {L('Cancel', 'إلغاء')}
                </button>
                <button
                  type="submit"
                  className="btn btn-prime"
                  style={{ flex: 1.5, borderRadius: '8px', fontWeight: '700' }}
                >
                  {editingCourse ? L('Update Course', 'تحديث الكورس') : L('Create & Open Curriculum', 'إنشاء والبدء بإضافة الدروس')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD MODULE                                                       */}
      {/* ========================================================================= */}
      {showModuleModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '24px', borderRadius: '18px', animation: 'scaleUp 0.25s ease' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: '800' }}>
              {L('Add New Module (Section)', 'إضافة وحدة جديدة')}
            </h3>
            <input
              type="text"
              autoFocus
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              placeholder={isRTL ? 'عنوان الوحدة (مثال: الوحدة 2: إعداد المتجر)' : 'Module Title (e.g. Module 2: Setup)'}
              style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text)', fontSize: '13px', marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => { setShowModuleModal(false); setModuleTitle(''); }}
                className="btn btn-ghost"
                style={{ flex: 1 }}
              >
                {L('Cancel', 'إلغاء')}
              </button>
              <button
                type="button"
                onClick={handleAddModule}
                className="btn btn-prime"
                style={{ flex: 1, fontWeight: '700' }}
              >
                {L('Add Module', 'إضافة الوحدة')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD / EDIT LESSON                                                */}
      {/* ========================================================================= */}
      {showLessonModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', borderRadius: '18px', animation: 'scaleUp 0.25s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>
                {editingLessonIndex !== null ? L('Edit Lesson', 'تعديل الدرس') : L('Add Lesson to Module', 'إضافة درس جديد')}
              </h3>
              <button
                type="button"
                onClick={() => setShowLessonModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>
                  {L('Lesson Title *', 'عنوان الدرس *')}
                </label>
                <input
                  type="text"
                  required
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  placeholder={isRTL ? 'مثال: الدرس الأول: شرح المنظومة' : 'Lesson title...'}
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '8px', padding: '10px 12px', color: 'var(--text)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>
                  {L('Video Hosting & URL (YouTube / Vimeo / Loom / MP4)', 'رابط الفيديو (يوتيوب / فيميو / لوم / MP4)')}
                </label>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                  <select
                    value={lessonForm.videoType}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoType: e.target.value })}
                    style={{ background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--text)', padding: '8px 10px', fontSize: '12px' }}
                  >
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="loom">Loom</option>
                    <option value="mp4">Direct MP4 URL</option>
                  </select>
                  <input
                    type="text"
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text)', fontSize: '12.5px', direction: 'ltr' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>
                  {L('Estimated Duration', 'المدة الزمنية التقديرية')}
                </label>
                <input
                  type="text"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                  placeholder="15 min"
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text)', fontSize: '12.5px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>
                  {L('Lesson Notes & Study Guide (Markdown supported)', 'ملاحظات الدرس والملخص')}
                </label>
                <textarea
                  value={lessonForm.notes}
                  onChange={(e) => setLessonForm({ ...lessonForm, notes: e.target.value })}
                  rows={3}
                  placeholder={isRTL ? 'اكتب ملاحظات الدرس، روابط هامة، ونقاط التركيز...' : 'Notes, summary, key takeaways...'}
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text)', fontSize: '12px', resize: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>
                  {L('Downloadable Resource URL (PDF, Drive file)', 'رابط تحميل ملف مرفق (PDF / ملف درايف)')}
                </label>
                <input
                  type="text"
                  value={lessonForm.attachmentUrl}
                  onChange={(e) => setLessonForm({ ...lessonForm, attachmentUrl: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text)', fontSize: '12px', direction: 'ltr' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer', margin: '4px 0' }}>
                <input
                  type="checkbox"
                  checked={lessonForm.isFreePreview}
                  onChange={(e) => setLessonForm({ ...lessonForm, isFreePreview: e.target.checked })}
                />
                <span>{L('Make this lesson a Free Preview', 'إتاحة هذا الدرس كمعاينة مجانية للمشاهدة')}</span>
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                >
                  {L('Cancel', 'إلغاء')}
                </button>
                <button
                  type="button"
                  onClick={handleSaveLesson}
                  className="btn btn-prime"
                  style={{ flex: 1.5, fontWeight: '700' }}
                >
                  {editingLessonIndex !== null ? L('Update Lesson', 'تحديث الدرس') : L('Add Lesson', 'حفظ الدرس')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: INVITE / ENROLL STUDENT                                          */}
      {/* ========================================================================= */}
      {showInviteModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '460px', padding: '24px', borderRadius: '18px', animation: 'scaleUp 0.25s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>
                {L('Invite & Enroll Student', 'إضافة وتفعيل طالب جديد')}
              </h3>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInviteStudent} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>
                  {L('Student Name', 'اسم الطالب')}
                </label>
                <input
                  type="text"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  placeholder={isRTL ? 'مثال: أحمد محمد' : 'Ahmed Mohamed'}
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>
                  {L('Student Email *', 'البريد الإلكتروني للطالب *')}
                </label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="student@example.com"
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px', direction: 'ltr' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>
                  {L('Grant Access to Courses:', 'تفعيل الكورسات المحددة:')}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto', background: 'var(--bg3)', padding: '10px', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  {courses.map((c) => {
                    const isChecked = inviteForm.selectedCourses.includes(c.id);
                    return (
                      <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            const current = inviteForm.selectedCourses;
                            const next = isChecked ? current.filter(id => id !== c.id) : [...current, c.id];
                            setInviteForm({ ...inviteForm, selectedCourses: next });
                          }}
                        />
                        <span>{c.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                >
                  {L('Cancel', 'إلغاء')}
                </button>
                <button
                  type="submit"
                  className="btn btn-prime"
                  style={{ flex: 1.5, fontWeight: '700' }}
                >
                  {L('Enroll Student', 'تفعيل الطالب')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: CREATE COMMUNITY GROUP                                           */}
      {/* ========================================================================= */}
      {showGroupModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '24px', borderRadius: '18px', animation: 'scaleUp 0.25s ease' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: '800' }}>
              {L('Create Community Group', 'إنشاء مجتمع نقاش جديد')}
            </h3>
            <form onSubmit={handleSaveGroup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>
                  {L('Group Name *', 'اسم المجتمع *')}
                </label>
                <input
                  type="text"
                  required
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder={isRTL ? 'مثال: مجتمع رواد الأعمال 2026' : 'Entrepreneurs Cohort 2026'}
                  style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>
                  {L('Icon & Description', 'الأيقونة والوصف')}
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={groupForm.icon}
                    onChange={(e) => setGroupForm({ ...groupForm, icon: e.target.value })}
                    style={{ width: '45px', textAlign: 'center', background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '8px', fontSize: '18px' }}
                  />
                  <input
                    type="text"
                    value={groupForm.description}
                    onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                    placeholder={isRTL ? 'وصف المجتمع...' : 'Description...'}
                    style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--line)', borderRadius: '8px', padding: '9px 12px', color: 'var(--text)', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                >
                  {L('Cancel', 'إلغاء')}
                </button>
                <button
                  type="submit"
                  className="btn btn-prime"
                  style={{ flex: 1.5, fontWeight: '700' }}
                >
                  {L('Create Group', 'إنشاء')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
