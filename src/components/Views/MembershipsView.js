'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  MessageCircle,
  Share2,
  Zap,
  ArrowRight,
  ArrowLeft,
  Flame,
  ShieldCheck,
  FolderPlus,
  GraduationCap,
  Tv,
  HelpCircle,
  UploadCloud,
  Tag,
  Repeat,
  CreditCard,
  Minus,
  X,
  Image as ImageIcon
} from 'lucide-react';

export default function MembershipsView() {
  const { lang, L, t, showToast } = useBusiness();
  const { user, userData } = useAuth();
  const isRTL = lang === 'ar';

  const coachId = user?.uid || 'demo-coach';
  const coachName = userData?.name || user?.displayName || user?.email?.split('@')[0] || 'Mohamed Joe';
  const defaultSlug = (userData?.username || coachName).toLowerCase().replace(/[^a-z0-9]/g, '-');

  // Top Nav State
  const [activeTab, setActiveTab] = useState('portal'); // 'portal', 'courses', 'communities', 'students', 'settings', 'credentials'
  
  // Data States
  const [portalSettings, setPortalSettings] = useState(DEFAULT_PORTAL_SETTINGS);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all'); // 'all', 'published', 'draft'
  const [studentSearch, setStudentSearch] = useState('');

  // Course Studio (GoHighLevel 3-Step Wizard) State
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [studioStep, setStudioStep] = useState(1); // 1: Details, 2: Upload Thumbnail, 3: Pricing
  const [studioForm, setStudioForm] = useState({
    title: '',
    description: '',
    thumbnailUrl: '',
    offerTitle: '',
    pricingPlan: 'free', // 'free' | 'recurring' | 'one_time'
    billingPeriod: 'Monthly', // 'Monthly' | 'Quarterly' | 'Yearly' | 'Weekly'
    price: 1.00,
    currency: 'EUR',
    trialDays: 0,
    priceTextOverride: '',
    category: 'E-commerce & Business',
    isPublished: true
  });
  const [isSubmittingStudio, setIsSubmittingStudio] = useState(false);
  const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false);
  const fileInputRef = useRef(null);

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
  const [settingsForm, setSettingsForm] = useState(DEFAULT_PORTAL_SETTINGS);

  // Load portal settings & subscriptions
  useEffect(() => {
    let isMounted = true;
    async function initData() {
      try {
        const settings = await getCoachPortalSettings(coachId);
        if (isMounted) {
          const merged = { ...DEFAULT_PORTAL_SETTINGS, ...settings };
          if (!merged.portalSlug || merged.portalSlug === 'academy') {
            merged.portalSlug = defaultSlug || 'academy';
          }
          if (!merged.portalTitle || merged.portalTitle === 'UpKlick Academy') {
            merged.portalTitle = `${coachName} Academy`;
          }
          setPortalSettings(merged);
          setSettingsForm(merged);
        }
      } catch (err) {
        console.warn('Error loading settings:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initData();

    // Real-time subscriptions
    const unsubCourses = subscribeCoachCourses(coachId, (data) => {
      if (isMounted) setCourses(data || []);
    });

    const unsubStudents = subscribeCoachStudents(coachId, (data) => {
      if (isMounted) setStudents(data || []);
    });

    const unsubCommunities = subscribeCoachCommunities(coachId, (data) => {
      if (isMounted) setCommunities(data || []);
    });

    return () => {
      isMounted = false;
      if (unsubCourses) unsubCourses();
      if (unsubStudents) unsubStudents();
      if (unsubCommunities) unsubCommunities();
    };
  }, [coachId, defaultSlug, coachName]);

  // Derived Values
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://upklick.net';
  const portalUrl = `${baseUrl}/portal/${portalSettings.portalSlug || defaultSlug}`;

  const copyPortalLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(portalUrl);
      setCopied(true);
      showToast(L('Portal link copied to clipboard!', 'تم نسخ رابط بوابة الطلاب بنجاح!'));
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const totalLessonsCount = useMemo(() => {
    return courses.reduce((acc, c) => {
      const modCount = c.modules?.reduce((mAcc, m) => mAcc + (m.lessons?.length || 0), 0) || 0;
      return acc + modCount;
    }, 0);
  }, [courses]);

  const totalRevenueGenerated = useMemo(() => {
    return courses.reduce((acc, c) => {
      const price = Number(c.price || 0);
      const studentCount = Number(c.studentCount || students.filter(s => s.enrolledCourses?.includes(c.id)).length || 0);
      return acc + (price * studentCount);
    }, 0);
  }, [courses, students]);

  // Course Studio Handlers (GoHighLevel 3-Step Wizard)
  const handleOpenCourseStudio = (course = null) => {
    setActiveTab('courses');
    setCurriculumCourse(null);
    if (course) {
      setEditingCourse(course);
      const isFree = Number(course.price || 0) === 0;
      const detectedPlan = course.pricingPlan || (isFree ? 'free' : (course.billingPeriod ? 'recurring' : 'one_time'));
      setStudioForm({
        title: course.title || '',
        description: course.description || '',
        thumbnailUrl: course.thumbnailUrl || '',
        offerTitle: course.offerTitle || course.title || '',
        pricingPlan: detectedPlan,
        billingPeriod: course.billingPeriod || 'Monthly',
        price: course.price !== undefined ? Number(course.price) : 1.00,
        currency: course.currency || 'EUR',
        trialDays: course.trialDays || 0,
        priceTextOverride: course.priceTextOverride || '',
        category: course.category || 'E-commerce & Business',
        isPublished: course.isPublished !== undefined ? course.isPublished : true
      });
    } else {
      setEditingCourse(null);
      setStudioForm({
        title: '',
        description: '',
        thumbnailUrl: '',
        offerTitle: '',
        pricingPlan: 'free',
        billingPeriod: 'Monthly',
        price: 1.00,
        currency: 'EUR',
        trialDays: 0,
        priceTextOverride: '',
        category: 'E-commerce & Business',
        isPublished: true
      });
    }
    setStudioStep(1);
    setIsCreatingCourse(true);
  };

  const handleTitleChange = (val) => {
    setStudioForm(prev => ({
      ...prev,
      title: val,
      offerTitle: (!prev.offerTitle || prev.offerTitle === prev.title) ? val : prev.offerTitle
    }));
  };

  const handleProceedToThumbnail = () => {
    if (!studioForm.title.trim()) {
      showToast(isRTL ? 'يرجى إدخال عنوان الكورس أولاً' : 'Please enter a course title first', 'error');
      return;
    }
    if (!studioForm.offerTitle) {
      setStudioForm(prev => ({ ...prev, offerTitle: prev.title.trim() }));
    }
    setStudioStep(2);
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast(isRTL ? 'حجم الصورة كبير جداً (الحد الأقصى 5 ميجابايت)' : 'Image too large (max 5MB)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setStudioForm(prev => ({ ...prev, thumbnailUrl: event.target.result }));
      showToast(isRTL ? 'تم رفع صورة الغلاف بنجاح!' : 'Course thumbnail uploaded!');
    };
    reader.readAsDataURL(file);
  };

  const handleThumbnailDrop = (e) => {
    e.preventDefault();
    setIsDraggingThumbnail(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast(isRTL ? 'يرجى اختيار ملف صورة صالح' : 'Please upload a valid image file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setStudioForm(prev => ({ ...prev, thumbnailUrl: event.target.result }));
      showToast(isRTL ? 'تم رفع صورة الغلاف بنجاح!' : 'Course thumbnail uploaded!');
    };
    reader.readAsDataURL(file);
  };

  const handleStepPrice = (delta) => {
    setStudioForm(prev => ({
      ...prev,
      price: Math.max(0, Number((Number(prev.price || 0) + delta).toFixed(2)))
    }));
  };

  const handleStepTrial = (delta) => {
    setStudioForm(prev => ({
      ...prev,
      trialDays: Math.max(0, Number(prev.trialDays || 0) + delta)
    }));
  };

  const handleCompleteCourseStudio = async () => {
    if (!studioForm.title.trim()) {
      setStudioStep(1);
      showToast(isRTL ? 'يرجى إدخال عنوان الكورس' : 'Please enter a course title', 'error');
      return;
    }

    setIsSubmittingStudio(true);
    try {
      const finalPrice = studioForm.pricingPlan === 'free' ? 0 : (Number(studioForm.price) || 0);
      const payload = {
        title: studioForm.title.trim(),
        description: studioForm.description.trim(),
        thumbnailUrl: studioForm.thumbnailUrl || '',
        category: studioForm.category || 'E-commerce & Business',
        pricingPlan: studioForm.pricingPlan,
        price: finalPrice,
        currency: studioForm.currency || 'EUR',
        billingPeriod: studioForm.pricingPlan === 'recurring' ? studioForm.billingPeriod : null,
        trialDays: studioForm.pricingPlan === 'recurring' ? (Number(studioForm.trialDays) || 0) : 0,
        priceTextOverride: studioForm.priceTextOverride?.trim() || '',
        offerTitle: studioForm.offerTitle?.trim() || studioForm.title.trim(),
        isPublished: studioForm.isPublished,
        coachName,
        id: editingCourse?.id || undefined,
        modules: editingCourse?.modules?.length ? editingCourse.modules : [
          {
            id: `mod_${Date.now()}_1`,
            title: isRTL ? 'الفصل 1: مقدمة الكورس والبداية' : 'Module 1: Introduction & Fundamentals',
            lessons: [
              {
                id: `les_${Date.now()}_1`,
                title: isRTL ? 'مرحباً بك في الكورس: نظرة عامة' : 'Welcome to the Course: Overview & Setup',
                videoUrl: '',
                videoType: 'youtube',
                duration: '10 min',
                isFreePreview: true,
                notes: isRTL ? 'مرحباً بك! في هذه المحاضرة التمهيدية نستعرض المحاور والمخرجات التدريبية.' : 'Welcome! In this introductory lecture, we explore the course outcomes and roadmap.'
              }
            ]
          }
        ]
      };

      const saved = await saveCourse(coachId, payload);
      showToast(editingCourse ? (isRTL ? '🎉 تم تحديث بيانات الكورس!' : '🎉 Course updated successfully!') : (isRTL ? '🎉 تم إنشاء الكورس بنجاح!' : '🎉 Course created successfully!'));
      setIsCreatingCourse(false);
      // Immediately open curriculum builder for the newly created course!
      if (saved) {
        setCurriculumCourse(saved);
      }
    } catch (err) {
      console.error('Error saving course in studio:', err);
      showToast(isRTL ? 'حدث خطأ أثناء حفظ الكورس' : 'Failed to save course', 'error');
    } finally {
      setIsSubmittingStudio(false);
    }
  };

  // Compatibility Handlers
  const handleOpenCourseModal = (course = null) => {
    handleOpenCourseStudio(course);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.title.trim()) return;

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
      await deleteCourse(courseId, coachId);
      if (curriculumCourse?.id === courseId) setCurriculumCourse(null);
      showToast(L('Course deleted', 'تم حذف الكورس'));
    } catch (err) {
      console.error(err);
    }
  };

  // Curriculum Modules & Lessons Handlers
  const handleAddModule = () => {
    if (!moduleTitle.trim() || !curriculumCourse) return;
    const currentModules = curriculumCourse.modules || [];
    const newModule = {
      id: `mod_${Date.now()}`,
      title: moduleTitle.trim(),
      lessons: []
    };
    const updated = { ...curriculumCourse, modules: [...currentModules, newModule] };
    setCurriculumCourse(updated);
    saveCourse(coachId, updated);
    setModuleTitle('');
    setShowModuleModal(false);
    showToast(L('Module added!', 'تمت إضافة الفصل/الموديول!'));
  };

  const handleDeleteModule = (moduleIdx) => {
    if (!curriculumCourse) return;
    const updatedModules = [...(curriculumCourse.modules || [])];
    updatedModules.splice(moduleIdx, 1);
    const updated = { ...curriculumCourse, modules: updatedModules };
    setCurriculumCourse(updated);
    saveCourse(coachId, updated);
    showToast(L('Module removed', 'تم حذف الفصل'));
  };

  const handleOpenLessonModal = (moduleIdx, lessonIdx = null) => {
    setActiveModuleIndex(moduleIdx);
    setEditingLessonIndex(lessonIdx);
    if (lessonIdx !== null) {
      const lesson = curriculumCourse.modules[moduleIdx].lessons[lessonIdx];
      setLessonForm({
        title: lesson.title || '',
        videoUrl: lesson.videoUrl || '',
        videoType: lesson.videoType || 'youtube',
        duration: lesson.duration || '15 min',
        notes: lesson.notes || '',
        attachmentUrl: lesson.attachmentUrl || '',
        attachmentName: lesson.attachmentName || '',
        isFreePreview: lesson.isFreePreview || false
      });
    } else {
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
    }
    setShowLessonModal(true);
  };

  const handleSaveLesson = (e) => {
    e.preventDefault();
    if (!curriculumCourse || activeModuleIndex === null || !lessonForm.title.trim()) return;

    const updatedModules = [...(curriculumCourse.modules || [])];
    const targetModule = { ...updatedModules[activeModuleIndex] };
    const targetLessons = [...(targetModule.lessons || [])];

    const lessonData = {
      id: editingLessonIndex !== null ? targetLessons[editingLessonIndex].id : `lsn_${Date.now()}`,
      ...lessonForm
    };

    if (editingLessonIndex !== null) {
      targetLessons[editingLessonIndex] = lessonData;
    } else {
      targetLessons.push(lessonData);
    }

    targetModule.lessons = targetLessons;
    updatedModules[activeModuleIndex] = targetModule;

    const updatedCourse = { ...curriculumCourse, modules: updatedModules };
    setCurriculumCourse(updatedCourse);
    saveCourse(coachId, updatedCourse);
    setShowLessonModal(false);
    showToast(L('Lesson saved successfully!', 'تم حفظ الدرس بنجاح!'));
  };

  const handleDeleteLesson = (moduleIdx, lessonIdx) => {
    if (!curriculumCourse) return;
    const updatedModules = [...(curriculumCourse.modules || [])];
    const targetModule = { ...updatedModules[moduleIdx] };
    const targetLessons = [...(targetModule.lessons || [])];
    targetLessons.splice(lessonIdx, 1);
    targetModule.lessons = targetLessons;
    updatedModules[moduleIdx] = targetModule;

    const updatedCourse = { ...curriculumCourse, modules: updatedModules };
    setCurriculumCourse(updatedCourse);
    saveCourse(coachId, updatedCourse);
    showToast(L('Lesson deleted', 'تم حذف الدرس'));
  };

  // Student Invite Handlers
  const handleEnrollStudent = async (e) => {
    e.preventDefault();
    if (!inviteForm.email.trim()) return;

    try {
      await enrollStudent(coachId, {
        name: inviteForm.name.trim() || inviteForm.email.split('@')[0],
        email: inviteForm.email.trim(),
        enrolledCourses: inviteForm.selectedCourses,
        status: 'active'
      });
      setShowInviteModal(false);
      setInviteForm({ name: '', email: '', selectedCourses: [] });
      showToast(L('Student enrolled successfully!', 'تم تفعيل حساب الطالب بنجاح!'));
    } catch (err) {
      console.error(err);
      showToast(L('Failed to enroll student', 'فشل تفعيل الطالب'), 'error');
    }
  };

  // Community Group Handler
  const handleSaveGroup = async (e) => {
    e.preventDefault();
    if (!groupForm.name.trim()) return;

    try {
      await saveCommunityGroup(coachId, groupForm);
      setShowGroupModal(false);
      setGroupForm({ name: '', description: '', icon: '💬', isPrivate: false });
      showToast(L('Community group created!', 'تم إنشاء مجتمع النقاش بنجاح!'));
    } catch (err) {
      console.error(err);
      showToast(L('Failed to create group', 'فشل إنشاء المجتمع'), 'error');
    }
  };

  // Settings Save Handler
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const saved = await saveCoachPortalSettings(coachId, settingsForm);
      setPortalSettings(saved);
      showToast(L('Portal settings saved successfully!', 'تم حفظ إعدادات وهوية البوابة بنجاح!'));
    } catch (err) {
      console.error(err);
      showToast(L('Error saving settings', 'خطأ أثناء حفظ الإعدادات'), 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="memberships-container" style={{ direction: isRTL ? 'rtl' : 'ltr', color: 'var(--text, #f8fafc)' }}>
      {/* Scoped Animations & Micro-Interactions */}
      <style jsx>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes shimmerLine {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .glass-panel {
          background: rgba(17, 24, 39, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .interactive-card:hover {
          transform: translateY(-4px);
          border-color: rgba(99, 102, 241, 0.45);
          box-shadow: 0 16px 36px -10px rgba(99, 102, 241, 0.22);
        }
        .glow-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.25s ease;
        }
        .glow-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
        }
        .glow-btn:active {
          transform: translateY(0);
        }
        .nav-pill {
          padding: 8px 18px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid transparent;
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text2, #94a3b8);
          background: transparent;
        }
        .nav-pill:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.05);
        }
        .nav-pill.active {
          color: #ffffff;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(168, 85, 247, 0.25));
          border-color: rgba(99, 102, 241, 0.5);
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.2);
        }
      `}</style>

      {/* ========================================================================= */}
      {/* 1. TOP SUB-NAVBAR (GoHighLevel Clean Architecture)                        */}
      {/* ========================================================================= */}
      <div className="glass-panel" style={{ padding: '12px 20px', marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          
          {/* Brand & Suite Identifier */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 6px 16px rgba(99, 102, 241, 0.35)'
            }}>
              <GraduationCap size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '17px', fontWeight: '900', letterSpacing: '-0.3px' }}>
                  {isRTL ? 'الأكاديمية والعضويات' : 'Memberships & LMS'}
                </span>
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2))',
                  color: '#a5b4fc',
                  border: '1px solid rgba(99, 102, 241, 0.3)'
                }}>
                  {isRTL ? 'نظام GoHighLevel' : 'GHL PRO'}
                </span>
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text3, #64748b)' }}>
                {isRTL ? 'إدارة الكورسات، المناهج، مجتمعات الطلاب، وبوابة التدريب المستقلة' : 'Courses, modules, community hubs & white-label student portal'}
              </div>
            </div>
          </div>

          {/* Central Segmented Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(0, 0, 0, 0.25)',
            padding: '4px',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => { setActiveTab('portal'); setCurriculumCourse(null); }}
              className={`nav-pill ${activeTab === 'portal' ? 'active' : ''}`}
            >
              <Globe size={15} />
              <span>{isRTL ? 'بوابة الطلاب' : 'Client Portal'}</span>
            </button>

            <button
              onClick={() => { setActiveTab('courses'); setCurriculumCourse(null); }}
              className={`nav-pill ${activeTab === 'courses' ? 'active' : ''}`}
            >
              <BookOpen size={15} />
              <span>{isRTL ? 'الكورسات' : 'Courses'}</span>
              <span style={{ fontSize: '10.5px', padding: '1px 6px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.12)' }}>
                {courses.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('communities'); setCurriculumCourse(null); }}
              className={`nav-pill ${activeTab === 'communities' ? 'active' : ''}`}
            >
              <Users size={15} />
              <span>{isRTL ? 'المجتمعات' : 'Communities'}</span>
              <span style={{ fontSize: '10.5px', padding: '1px 6px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.12)' }}>
                {communities.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('students'); setCurriculumCourse(null); }}
              className={`nav-pill ${activeTab === 'students' ? 'active' : ''}`}
            >
              <Flame size={15} />
              <span>{isRTL ? 'الطلاب والمشتركين' : 'Students'}</span>
              <span style={{ fontSize: '10.5px', padding: '1px 6px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.12)' }}>
                {students.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('settings'); setCurriculumCourse(null); }}
              className={`nav-pill ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <Settings size={15} />
              <span>{isRTL ? 'إعدادات الهوية' : 'Portal Settings'}</span>
            </button>
          </div>

          {/* Quick External Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={copyPortalLink}
              className="btn btn-ghost"
              style={{
                fontSize: '12.5px',
                padding: '8px 14px',
                borderRadius: '10px',
                background: copied ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: copied ? '#4ade80' : 'var(--text, #f8fafc)',
                border: copied ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? (isRTL ? 'تم النسخ!' : 'Copied!') : (isRTL ? 'نسخ رابط البوابة' : 'Copy Portal URL')}</span>
            </button>

            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="glow-btn btn"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 16px',
                fontSize: '12.5px',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none'
              }}
            >
              <span>{isRTL ? 'معاينة البوابة المباشرة' : 'Live Portal'}</span>
              <ExternalLink size={13} />
            </a>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUB-VIEW: CLIENT PORTAL DASHBOARD                                      */}
      {/* ========================================================================= */}
      {activeTab === 'portal' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Hero Promotional Banner (Gorgeous Mesh Gradient & Lighting) */}
          <div className="glass-panel" style={{
            position: 'relative',
            overflow: 'hidden',
            padding: '36px 36px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.12) 50%, rgba(236, 72, 153, 0.1) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)'
          }}>
            {/* Ambient Background Glow Orbs */}
            <div style={{
              position: 'absolute',
              top: '-60px',
              left: isRTL ? 'auto' : '-60px',
              right: isRTL ? '-60px' : 'auto',
              width: '240px',
              height: '240px',
              background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)',
              filter: 'blur(30px)',
              pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-80px',
              right: isRTL ? 'auto' : '-80px',
              left: isRTL ? '-80px' : 'auto',
              width: '280px',
              height: '280px',
              background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none'
            }} />

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
              <div style={{ maxWidth: '640px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px', borderRadius: '30px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', marginBottom: '14px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e' }} />
                  <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {isRTL ? 'بوابة المدرب المستقلة • نشطة ومحمية' : 'White-Label Coach Gateway • Active & Protected'}
                  </span>
                </div>

                <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px', lineHeight: '1.25' }}>
                  {portalSettings.portalTitle || `${coachName} Academy`}
                </h1>

                <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: 'var(--text2, #94a3b8)', lineHeight: '1.6' }}>
                  {portalSettings.portalTagline || (isRTL 
                    ? 'أطلق أكاديميتك الخاصة الآن. يدخل طلابك عبر رابط مخصص لمشاهدة المناهج والمحاضرات والمشاركة في المجتمع التفاعلي بدون ظهور أي أدوات داخلية أو كريديت لـ UpKlick.'
                    : 'Launch your branded online academy. Students access courses, video lessons, and communities through your dedicated portal without seeing any UpKlick tools or credits.')}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleOpenCourseModal()}
                    className="glow-btn btn"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '11px 22px',
                      fontSize: '13.5px',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Plus size={16} />
                    <span>{isRTL ? 'إضافة كورس جديد' : 'Create New Course'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('settings')}
                    className="btn"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(10px)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '12px',
                      padding: '11px 20px',
                      fontSize: '13.5px',
                      fontWeight: '700',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Sliders size={16} />
                    <span>{isRTL ? 'تخصيص الهوية والشعار' : 'Branding & Theme'}</span>
                  </button>
                </div>
              </div>

              {/* Live Preview Card Badge */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '20px 24px',
                minWidth: '260px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--text3, #64748b)', textTransform: 'uppercase' }}>
                  {isRTL ? 'حالة البوابة' : 'Portal Status'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(34, 197, 94, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#22c55e'
                  }}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff' }}>
                      {isRTL ? 'بوابة آمنة ومحمية' : 'Secure & Protected'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#22c55e', fontWeight: '600' }}>
                      {isRTL ? 'معزولة تماماً للطلاب' : '100% Student Isolation'}
                    </div>
                  </div>
                </div>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text3, #64748b)' }}>{isRTL ? 'الكورسات المتاحة:' : 'Live Courses:'}</span>
                  <strong style={{ color: '#ffffff' }}>{courses.length} {isRTL ? 'كورس' : 'courses'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text3, #64748b)' }}>{isRTL ? 'المحاضرات:' : 'Total Lessons:'}</span>
                  <strong style={{ color: '#ffffff' }}>{totalLessonsCount} {isRTL ? 'درس' : 'lessons'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Client Gateway Card with Quick Copy & High-Impact Stats */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', alignItems: 'center' }}>
              
              {/* Gateway URL Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#818cf8'
                  }}>
                    <LinkIcon size={16} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                    {isRTL ? 'رابط بوابة الطلاب المباشر (Client Portal URL)' : 'Client Portal URL'}
                  </h3>
                </div>

                <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: 'var(--text2, #94a3b8)', lineHeight: '1.5' }}>
                  {isRTL 
                    ? 'أرسل هذا الرابط المباشر إلى طلابك للتسجيل ومتابعة الدورات والمجتمع. يمكنك أيضاً تخصيص الرابط من الإعدادات.' 
                    : 'Share this link with your enrolled learners to register and access all their training courses and discussions.'}
                </p>

                {/* Sleek Interactive URL Box */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '6px 8px 6px 14px',
                  gap: '10px',
                  transition: 'border-color 0.2s'
                }}>
                  <Globe size={16} style={{ color: '#818cf8', flexShrink: 0 }} />
                  <span style={{
                    flex: 1,
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    color: '#e2e8f0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    direction: 'ltr',
                    textAlign: isRTL ? 'right' : 'left'
                  }}>
                    {portalUrl}
                  </span>

                  <button
                    onClick={copyPortalLink}
                    className="btn glow-btn"
                    style={{
                      background: copied ? '#22c55e' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 14px',
                      fontSize: '12px',
                      fontWeight: '700',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? (isRTL ? 'تم!' : 'Copied') : (isRTL ? 'نسخ' : 'Copy')}</span>
                  </button>
                </div>
              </div>

              {/* 3 Metric Cards Grid (GoHighLevel KPIs) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                
                {/* Metric 1: Invited / Total */}
                <div className="interactive-card glass-panel" style={{ padding: '18px 16px', textAlign: 'center', borderRadius: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text3, #64748b)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    {isRTL ? 'الطلاب المدعوون' : 'Invited'}
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: '900', color: '#818cf8', lineHeight: '1' }}>
                    {students.length}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#22c55e', marginTop: '6px', fontWeight: '700' }}>
                    ● {isRTL ? 'جاهزون للدخول' : 'Access Granted'}
                  </div>
                </div>

                {/* Metric 2: Active Learners */}
                <div className="interactive-card glass-panel" style={{ padding: '18px 16px', textAlign: 'center', borderRadius: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text3, #64748b)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    {isRTL ? 'الطلاب النشطون' : 'Active Users'}
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: '900', color: '#38bdf8', lineHeight: '1' }}>
                    {students.filter(s => s.status === 'active').length}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#38bdf8', marginTop: '6px', fontWeight: '700' }}>
                    ↑ 100% {isRTL ? 'تفاعل' : 'Engagement'}
                  </div>
                </div>

                {/* Metric 3: Total Courses */}
                <div className="interactive-card glass-panel" style={{ padding: '18px 16px', textAlign: 'center', borderRadius: '14px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text3, #64748b)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    {isRTL ? 'الكورسات المنشورة' : 'Courses'}
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: '900', color: '#c084fc', lineHeight: '1' }}>
                    {courses.length}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#c084fc', marginTop: '6px', fontWeight: '700' }}>
                    {totalLessonsCount} {isRTL ? 'محاضرة' : 'Lessons'}
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Quick Action Navigation Cards (4 Interactive Pillars) */}
          <div>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: '800' }}>
              {isRTL ? 'إدارة أقسام الأكاديمية' : 'Academy Management Modules'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              
              {/* Pillar 1: Courses & Modules */}
              <div
                onClick={() => setActiveTab('courses')}
                className="glass-panel interactive-card"
                style={{ padding: '22px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#818cf8'
                }}>
                  <BookOpen size={22} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800' }}>
                    {isRTL ? 'المناهج والكورسات' : 'Courses & Curriculum'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text2, #94a3b8)', lineHeight: '1.5' }}>
                    {isRTL ? 'إنشاء الفصول، رفع الفيديوهات، وإرفاق مذكرات وملفات التحميل.' : 'Build modules, embed video lectures, and attach downloadable notes.'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#818cf8', marginTop: 'auto' }}>
                  <span>{isRTL ? 'فتح الكورسات' : 'Manage Courses'}</span>
                  {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                </div>
              </div>

              {/* Pillar 2: Students & Enrollments */}
              <div
                onClick={() => setActiveTab('students')}
                className="glass-panel interactive-card"
                style={{ padding: '22px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8'
                }}>
                  <Users size={22} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800' }}>
                    {isRTL ? 'إدارة ودعوة الطلاب' : 'Learners & Access'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text2, #94a3b8)', lineHeight: '1.5' }}>
                    {isRTL ? 'إضافة الطلاب يدوياً، تفعيل الكورسات، ومتابعة نسب إنجازهم.' : 'Enroll students, grant course permissions, and monitor completion rates.'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#38bdf8', marginTop: 'auto' }}>
                  <span>{isRTL ? 'قائمة الطلاب' : 'View Students'}</span>
                  {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                </div>
              </div>

              {/* Pillar 3: Communities & Groups */}
              <div
                onClick={() => setActiveTab('communities')}
                className="glass-panel interactive-card"
                style={{ padding: '22px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(192, 132, 252, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#c084fc'
                }}>
                  <MessageSquare size={22} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800' }}>
                    {isRTL ? 'مجتمعات الطلاب' : 'Community Groups'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text2, #94a3b8)', lineHeight: '1.5' }}>
                    {isRTL ? 'مساحات نقاش وتفاعل تشبه Skool تجمع طلابك مع تعليقات وتفاعل.' : 'Interactive discussion feeds where learners ask questions and connect.'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#c084fc', marginTop: 'auto' }}>
                  <span>{isRTL ? 'فتح المجتمعات' : 'Open Groups'}</span>
                  {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                </div>
              </div>

              {/* Pillar 4: Branding & Settings */}
              <div
                onClick={() => setActiveTab('settings')}
                className="glass-panel interactive-card"
                style={{ padding: '22px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(244, 114, 182, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f472b6'
                }}>
                  <Settings size={22} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800' }}>
                    {isRTL ? 'تخصيص الهوية والشعار' : 'Portal Settings'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text2, #94a3b8)', lineHeight: '1.5' }}>
                    {isRTL ? 'تعديل الرابط، الشعار، البانر، ودعم الواتساب المباشر.' : 'Configure custom URL slug, brand logo, colors, and WhatsApp widget.'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#f472b6', marginTop: 'auto' }}>
                  <span>{isRTL ? 'فتح الإعدادات' : 'Custom Branding'}</span>
                  {isRTL ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUB-VIEW: COURSES PRODUCTS & CURRICULUM BUILDER                        */}
      {/* ========================================================================= */}
      {activeTab === 'courses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* A. GoHighLevel 3-Step Course Creation Studio */}
          {isCreatingCourse ? (
            <div className="glass-panel" style={{ padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
              {/* Subtle Ambient Glow */}
              <div style={{
                position: 'absolute',
                top: '-80px',
                right: '-80px',
                width: '280px',
                height: '280px',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
                filter: 'blur(40px)'
              }} />

              {/* Breadcrumb Back Button */}
              <div style={{ marginBottom: '28px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreatingCourse(false)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '14px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  {isRTL ? <ArrowRight size={17} /> : <ArrowLeft size={17} />}
                  <span>{editingCourse ? (isRTL ? 'تعديل الكورس' : 'Edit Course') : (isRTL ? 'إنشاء كورس' : 'Create Course')}</span>
                </button>
              </div>

              {/* Studio 3-Column Workspace */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '220px 1fr 360px',
                gap: '40px',
                alignItems: 'start'
              }}>

                {/* COLUMN 1: VERTICAL PROGRESS STEPPER */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                  {/* Step 1: Details */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setStudioStep(1)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: studioStep > 1 ? '#2563eb' : (studioStep === 1 ? '#2563eb' : 'rgba(255, 255, 255, 0.1)'),
                          color: '#ffffff',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '13px',
                          cursor: 'pointer',
                          zIndex: 2,
                          boxShadow: studioStep === 1 ? '0 0 16px rgba(37, 99, 235, 0.7)' : 'none',
                          transition: 'all 0.25s ease'
                        }}
                      >
                        {studioStep > 1 ? <Check size={16} strokeWidth={3} /> : '1'}
                      </button>
                      <div style={{
                        width: '2px',
                        height: '48px',
                        background: studioStep > 1 ? '#2563eb' : 'rgba(255, 255, 255, 0.12)',
                        transition: 'background 0.3s ease'
                      }} />
                    </div>
                    <div style={{ paddingTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setStudioStep(1)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: studioStep === 1 ? '#ffffff' : (studioStep > 1 ? '#e2e8f0' : '#64748b'),
                          fontWeight: studioStep === 1 ? '800' : '600',
                          fontSize: '14px',
                          cursor: 'pointer',
                          textAlign: isRTL ? 'right' : 'left'
                        }}
                      >
                        {isRTL ? 'التفاصيل' : 'Details'}
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Upload Thumbnail */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => { if (studioForm.title.trim()) setStudioStep(2); }}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: studioStep > 2 ? '#2563eb' : (studioStep === 2 ? '#2563eb' : 'transparent'),
                          color: studioStep >= 2 ? '#ffffff' : '#64748b',
                          border: studioStep >= 2 ? 'none' : '2px solid rgba(255, 255, 255, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '13px',
                          cursor: studioForm.title.trim() ? 'pointer' : 'not-allowed',
                          zIndex: 2,
                          boxShadow: studioStep === 2 ? '0 0 16px rgba(37, 99, 235, 0.7)' : 'none',
                          transition: 'all 0.25s ease'
                        }}
                      >
                        {studioStep > 2 ? <Check size={16} strokeWidth={3} /> : '2'}
                      </button>
                      <div style={{
                        width: '2px',
                        height: '48px',
                        background: studioStep > 2 ? '#2563eb' : 'rgba(255, 255, 255, 0.12)',
                        transition: 'background 0.3s ease'
                      }} />
                    </div>
                    <div style={{ paddingTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => { if (studioForm.title.trim()) setStudioStep(2); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: studioStep === 2 ? '#ffffff' : (studioStep > 2 ? '#e2e8f0' : '#64748b'),
                          fontWeight: studioStep === 2 ? '800' : '600',
                          fontSize: '14px',
                          cursor: studioForm.title.trim() ? 'pointer' : 'not-allowed',
                          textAlign: isRTL ? 'right' : 'left'
                        }}
                      >
                        {isRTL ? 'صورة الغلاف' : 'Upload Thumbnail'}
                      </button>
                    </div>
                  </div>

                  {/* Step 3: Pricing */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => { if (studioForm.title.trim()) setStudioStep(3); }}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: studioStep === 3 ? '#2563eb' : 'transparent',
                          color: studioStep === 3 ? '#ffffff' : '#64748b',
                          border: studioStep === 3 ? 'none' : '2px solid rgba(255, 255, 255, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '13px',
                          cursor: studioForm.title.trim() ? 'pointer' : 'not-allowed',
                          zIndex: 2,
                          boxShadow: studioStep === 3 ? '0 0 16px rgba(37, 99, 235, 0.7)' : 'none',
                          transition: 'all 0.25s ease'
                        }}
                      >
                        3
                      </button>
                    </div>
                    <div style={{ paddingTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => { if (studioForm.title.trim()) setStudioStep(3); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: studioStep === 3 ? '#ffffff' : '#64748b',
                          fontWeight: studioStep === 3 ? '800' : '600',
                          fontSize: '14px',
                          cursor: studioForm.title.trim() ? 'pointer' : 'not-allowed',
                          textAlign: isRTL ? 'right' : 'left'
                        }}
                      >
                        {isRTL ? 'التسعير والعرض' : 'Pricing'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* COLUMN 2: ACTIVE STEP FORM CONTROLS */}
                <div style={{ minWidth: 0 }}>

                  {/* STEP 1: START WITH THE BASICS */}
                  {studioStep === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                      <div>
                        <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#ffffff', margin: '0 0 6px 0', letterSpacing: '-0.4px' }}>
                          {isRTL ? 'ابدأ بالأساسيات' : 'Start with the basics'}
                        </h2>
                        <p style={{ fontSize: '13.5px', color: '#94a3b8', margin: 0 }}>
                          {isRTL ? 'أضف عنواناً ووصفاً للتعريف بكورسك التدريبي.' : 'Add a title and description to introduce your course.'}
                        </p>
                      </div>

                      {/* Course Title */}
                      <div>
                        <label style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0', display: 'block', marginBottom: '8px' }}>
                          {isRTL ? 'عنوان الكورس *' : 'Course Title *'}
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            maxLength={255}
                            value={studioForm.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            placeholder={isRTL ? 'أدخل عنوان الكورس' : 'Enter course title'}
                            style={{
                              width: '100%',
                              padding: isRTL ? '12px 14px 12px 80px' : '12px 80px 12px 14px',
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '10px',
                              color: '#ffffff',
                              fontSize: '14px',
                              outline: 'none',
                              transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                          />
                          <span style={{
                            position: 'absolute',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            [isRTL ? 'left' : 'right']: '14px',
                            fontSize: '11.5px',
                            color: '#64748b',
                            pointerEvents: 'none'
                          }}>
                            {studioForm.title.length} / 255
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                          {isRTL ? 'اختر اسماً وصفياً ومميزاً للكورس.' : 'Give your course a descriptive name.'}
                        </div>
                      </div>

                      {/* Course Description */}
                      <div>
                        <label style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0', display: 'block', marginBottom: '8px' }}>
                          {isRTL ? 'وصف الكورس' : 'Course Description'}
                        </label>
                        <div style={{ position: 'relative' }}>
                          <textarea
                            rows={4}
                            maxLength={2500}
                            value={studioForm.description}
                            onChange={(e) => setStudioForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder={isRTL ? 'أخبر الطلاب بما سيتعلمونه في هذا الكورس' : 'Tell members about this course'}
                            style={{
                              width: '100%',
                              padding: '12px 14px 30px 14px',
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '10px',
                              color: '#ffffff',
                              fontSize: '13.5px',
                              lineHeight: '1.5',
                              resize: 'vertical',
                              outline: 'none',
                              transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)'}
                          />
                          <span style={{
                            position: 'absolute',
                            bottom: '10px',
                            [isRTL ? 'left' : 'right']: '14px',
                            fontSize: '11.5px',
                            color: '#64748b',
                            pointerEvents: 'none'
                          }}>
                            {studioForm.description.length} / 2500
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                          {isRTL ? 'اشرح ما سيتعلمه الأعضاء والنتائج التي سيحققونها.' : 'Explain what members will learn from this course.'}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '16px' }}>
                        <button
                          type="button"
                          onClick={() => setIsCreatingCourse(false)}
                          className="btn btn-ghost"
                          style={{
                            padding: '9px 20px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#94a3b8',
                            fontSize: '13.5px',
                            fontWeight: '700'
                          }}
                        >
                          {isRTL ? 'إلغاء' : 'Cancel'}
                        </button>

                        <button
                          type="button"
                          onClick={handleProceedToThumbnail}
                          disabled={!studioForm.title.trim()}
                          className="glow-btn btn"
                          style={{
                            padding: '10px 22px',
                            borderRadius: '10px',
                            background: studioForm.title.trim() ? '#2563eb' : 'rgba(37, 99, 235, 0.35)',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '13.5px',
                            fontWeight: '800',
                            cursor: studioForm.title.trim() ? 'pointer' : 'not-allowed',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <span>{isRTL ? 'رفع صورة الغلاف' : 'Upload Thumbnail'}</span>
                          {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: ADD A VISUAL IDENTITY */}
                  {studioStep === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                      <div>
                        <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#ffffff', margin: '0 0 6px 0', letterSpacing: '-0.4px' }}>
                          {isRTL ? 'أضف هوية بصرية' : 'Add a visual identity'}
                        </h2>
                        <p style={{ fontSize: '13.5px', color: '#94a3b8', margin: 0 }}>
                          {isRTL ? 'اختر صورة تعبر عن محتوى وتميز كورسك التدريبي' : 'Pick an image that reflects your course'}
                        </p>
                      </div>

                      <div>
                        <label style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0', display: 'block', marginBottom: '8px' }}>
                          {isRTL ? 'رفع صورة غلاف الكورس' : 'Upload Course Thumbnail'}
                        </label>

                        {/* Upload Dropzone */}
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); setIsDraggingThumbnail(true); }}
                          onDragLeave={() => setIsDraggingThumbnail(false)}
                          onDrop={handleThumbnailDrop}
                          style={{
                            border: isDraggingThumbnail ? '2px dashed #3b82f6' : '1px dashed rgba(255, 255, 255, 0.22)',
                            borderRadius: '14px',
                            padding: '44px 20px',
                            textAlign: 'center',
                            background: isDraggingThumbnail ? 'rgba(37, 99, 235, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px'
                          }}
                        >
                          <div style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            background: 'rgba(37, 99, 235, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#3b82f6'
                          }}>
                            <UploadCloud size={28} />
                          </div>

                          {studioForm.thumbnailUrl ? (
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '800', color: '#22c55e', marginBottom: '8px' }}>
                                ✓ {isRTL ? 'تم اختيار صورة الغلاف بنجاح' : 'Thumbnail selected successfully'}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                  style={{
                                    background: 'rgba(37, 99, 235, 0.2)',
                                    border: '1px solid rgba(37, 99, 235, 0.4)',
                                    color: '#60a5fa',
                                    borderRadius: '8px',
                                    padding: '5px 12px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {isRTL ? 'تغيير الصورة' : 'Change Image'}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); setStudioForm(prev => ({ ...prev, thumbnailUrl: '' })); }}
                                  style={{
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    color: '#f87171',
                                    borderRadius: '8px',
                                    padding: '5px 12px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {isRTL ? 'حذف واستخدام الرسم الافتراضي' : 'Use 3D Artwork'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div style={{ fontSize: '14px', color: '#ffffff', marginBottom: '4px' }}>
                                <span style={{ color: '#3b82f6', fontWeight: '800', textDecoration: 'underline' }}>
                                  {isRTL ? 'اضغط للرفع' : 'Click to upload'}
                                </span>
                                {' '}{isRTL ? 'أو اسحب الصورة وأفلتها هنا' : 'or drag and drop'}
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                                {isRTL ? 'الصيغ المدعومة: .svg, .png, .jpg, .jpeg' : 'Supported file types: .svg, .png, .jpg, .jpeg'}
                              </div>
                            </div>
                          )}

                          <input
                            type="file"
                            ref={fileInputRef}
                            accept=".svg,.png,.jpg,.jpeg,image/*"
                            style={{ display: 'none' }}
                            onChange={handleThumbnailUpload}
                          />
                        </div>

                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                          {isRTL ? '(الأبعاد الموصى بها للغلاف: 1280x720)' : '(Recommended aspect ratio for media: 1280x720)'}
                        </div>
                      </div>

                      {/* Optional URL input */}
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                          {isRTL ? 'أو أدخل رابط صورة مباشر (Image URL)' : 'Or paste an Image URL'}
                        </label>
                        <input
                          type="text"
                          value={studioForm.thumbnailUrl.startsWith('data:') ? '' : studioForm.thumbnailUrl}
                          onChange={(e) => setStudioForm(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
                          placeholder="https://images.unsplash.com/..."
                          style={{
                            width: '100%',
                            padding: '9px 12px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '8px',
                            color: '#ffffff',
                            fontSize: '13px',
                            direction: 'ltr'
                          }}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '16px' }}>
                        <button
                          type="button"
                          onClick={() => setStudioStep(1)}
                          className="btn btn-ghost"
                          style={{
                            padding: '9px 20px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#94a3b8',
                            fontSize: '13.5px',
                            fontWeight: '700'
                          }}
                        >
                          {isRTL ? 'السابق' : 'Back'}
                        </button>

                        <button
                          type="button"
                          onClick={() => setStudioStep(3)}
                          className="glow-btn btn"
                          style={{
                            padding: '10px 22px',
                            borderRadius: '10px',
                            background: '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '13.5px',
                            fontWeight: '800',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <span>{isRTL ? 'إعداد التسعير' : 'Set Up Pricing'}</span>
                          {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: CREATE AN OFFER */}
                  {studioStep === 3 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                      <div>
                        <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#ffffff', margin: '0 0 6px 0', letterSpacing: '-0.4px' }}>
                          {isRTL ? 'إنشاء العرض والتسعير' : 'Create an Offer'}
                        </h2>
                        <p style={{ fontSize: '13.5px', color: '#94a3b8', margin: 0 }}>
                          {isRTL ? 'حدد طريقة تقديم الكورس لطلابك' : 'Select how to offer your course'}
                        </p>
                      </div>

                      {/* Offer Title */}
                      <div>
                        <label style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0', display: 'block', marginBottom: '8px' }}>
                          {isRTL ? 'عنوان العرض' : 'Offer Title'}
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="text"
                            maxLength={255}
                            value={studioForm.offerTitle}
                            onChange={(e) => setStudioForm(prev => ({ ...prev, offerTitle: e.target.value }))}
                            placeholder={studioForm.title || (isRTL ? 'عنوان العرض' : 'Offer title')}
                            style={{
                              width: '100%',
                              padding: isRTL ? '12px 14px 12px 80px' : '12px 80px 12px 14px',
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '10px',
                              color: '#ffffff',
                              fontSize: '14px',
                              outline: 'none'
                            }}
                          />
                          <span style={{
                            position: 'absolute',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            [isRTL ? 'left' : 'right']: '14px',
                            fontSize: '11.5px',
                            color: '#64748b',
                            pointerEvents: 'none'
                          }}>
                            {studioForm.offerTitle.length} / 255
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                          {isRTL ? 'اسم العرض الذي يظهر عند الشراء أو التسجيل.' : 'Title of your offer'}
                        </div>
                      </div>

                      {/* Pricing Plan Selector */}
                      <div>
                        <label style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0', display: 'block', marginBottom: '10px' }}>
                          {isRTL ? 'خطة التسعير' : 'Pricing Plan'}
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                          
                          {/* Free Card */}
                          <button
                            type="button"
                            onClick={() => setStudioForm(prev => ({ ...prev, pricingPlan: 'free' }))}
                            style={{
                              padding: '14px 12px',
                              borderRadius: '12px',
                              background: studioForm.pricingPlan === 'free' ? 'rgba(37, 99, 235, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                              border: studioForm.pricingPlan === 'free' ? '2px solid #2563eb' : '1px solid rgba(255, 255, 255, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '10px',
                              cursor: 'pointer',
                              color: studioForm.pricingPlan === 'free' ? '#ffffff' : '#94a3b8',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Tag size={16} style={{ color: studioForm.pricingPlan === 'free' ? '#3b82f6' : '#64748b' }} />
                            <span style={{ fontSize: '13.5px', fontWeight: '800' }}>{isRTL ? 'مجاني' : 'Free'}</span>
                          </button>

                          {/* Recurring Card */}
                          <button
                            type="button"
                            onClick={() => setStudioForm(prev => ({ ...prev, pricingPlan: 'recurring' }))}
                            style={{
                              padding: '14px 12px',
                              borderRadius: '12px',
                              background: studioForm.pricingPlan === 'recurring' ? 'rgba(37, 99, 235, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                              border: studioForm.pricingPlan === 'recurring' ? '2px solid #2563eb' : '1px solid rgba(255, 255, 255, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '10px',
                              cursor: 'pointer',
                              color: studioForm.pricingPlan === 'recurring' ? '#ffffff' : '#94a3b8',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Repeat size={16} style={{ color: studioForm.pricingPlan === 'recurring' ? '#3b82f6' : '#64748b' }} />
                            <span style={{ fontSize: '13.5px', fontWeight: '800' }}>{isRTL ? 'اشتراك متكرر' : 'Recurring'}</span>
                          </button>

                          {/* One Time Card */}
                          <button
                            type="button"
                            onClick={() => setStudioForm(prev => ({ ...prev, pricingPlan: 'one_time' }))}
                            style={{
                              padding: '14px 12px',
                              borderRadius: '12px',
                              background: studioForm.pricingPlan === 'one_time' ? 'rgba(37, 99, 235, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                              border: studioForm.pricingPlan === 'one_time' ? '2px solid #2563eb' : '1px solid rgba(255, 255, 255, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '10px',
                              cursor: 'pointer',
                              color: studioForm.pricingPlan === 'one_time' ? '#ffffff' : '#94a3b8',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <CreditCard size={16} style={{ color: studioForm.pricingPlan === 'one_time' ? '#3b82f6' : '#64748b' }} />
                            <span style={{ fontSize: '13.5px', fontWeight: '800' }}>{isRTL ? 'دفعة واحدة' : 'One Time'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Recurring Configuration (GoHighLevel Screen 4) */}
                      {studioForm.pricingPlan === 'recurring' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                          <div>
                            <label style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0', display: 'block', marginBottom: '8px' }}>
                              {isRTL ? 'فترة الدفع' : 'Billing Period'}
                            </label>
                            <select
                              value={studioForm.billingPeriod}
                              onChange={(e) => setStudioForm(prev => ({ ...prev, billingPeriod: e.target.value }))}
                              style={{
                                width: '100%',
                                padding: '11px 14px',
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '10px',
                                color: '#ffffff',
                                fontSize: '13.5px',
                                outline: 'none'
                              }}
                            >
                              <option value="Monthly" style={{ background: '#1e293b', color: '#fff' }}>{isRTL ? 'شهرياً (Monthly)' : 'Monthly'}</option>
                              <option value="Yearly" style={{ background: '#1e293b', color: '#fff' }}>{isRTL ? 'سنوياً (Yearly)' : 'Yearly'}</option>
                              <option value="Quarterly" style={{ background: '#1e293b', color: '#fff' }}>{isRTL ? 'كل 3 أشهر (Quarterly)' : 'Quarterly'}</option>
                              <option value="Weekly" style={{ background: '#1e293b', color: '#fff' }}>{isRTL ? 'أسبوعياً (Weekly)' : 'Weekly'}</option>
                            </select>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                              {isRTL ? 'دورية تجديد الاشتراك' : 'Frequency of billing'}
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
                            {/* Price Column */}
                            <div>
                              <label style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0', display: 'block', marginBottom: '8px' }}>
                                {isRTL ? 'السعر' : 'Price'}
                              </label>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '10px',
                                padding: '4px 10px'
                              }}>
                                <span style={{ fontSize: '13px', color: '#94a3b8', marginInlineEnd: '6px' }}>
                                  {studioForm.currency === 'EUR' ? '€' : studioForm.currency === 'USD' ? '$' : studioForm.currency}
                                </span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={studioForm.price}
                                  onChange={(e) => setStudioForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                  style={{
                                    width: '100%',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#ffffff',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    outline: 'none'
                                  }}
                                />
                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginInlineEnd: '8px' }}>
                                  {studioForm.currency}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleStepPrice(-1)}
                                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '4px', width: '24px', height: '24px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <Minus size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStepPrice(1)}
                                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '4px', width: '24px', height: '24px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginInlineStart: '4px' }}
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                                {isRTL ? 'قيمة الدفعة في نهاية دورة الفوترة' : 'Amount of each payment at the end of the billing cycle'}
                              </div>
                            </div>

                            {/* Trial Days Column */}
                            <div>
                              <label style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0', display: 'block', marginBottom: '8px' }}>
                                {isRTL ? 'أيام التجربة المجانية' : 'Trial Days'}
                              </label>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                borderRadius: '10px',
                                padding: '4px 10px'
                              }}>
                                <input
                                  type="number"
                                  min="0"
                                  value={studioForm.trialDays}
                                  onChange={(e) => setStudioForm(prev => ({ ...prev, trialDays: parseInt(e.target.value) || 0 }))}
                                  style={{
                                    width: '100%',
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#ffffff',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    outline: 'none'
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => handleStepTrial(-1)}
                                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '4px', width: '24px', height: '24px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                  <Minus size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStepTrial(1)}
                                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '4px', width: '24px', height: '24px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginInlineStart: '4px' }}
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                                {isRTL ? 'عدد الأيام حتى أول عملية دفع' : 'Number of days until first billing'}
                              </div>
                            </div>
                          </div>

                          {/* Price Text Override */}
                          <div>
                            <label style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0', display: 'block', marginBottom: '8px' }}>
                              {isRTL ? 'النص المخصص للسعر (اختياري)' : 'Price Text Override'}
                            </label>
                            <div style={{ position: 'relative' }}>
                              <input
                                type="text"
                                maxLength={255}
                                value={studioForm.priceTextOverride}
                                onChange={(e) => setStudioForm(prev => ({ ...prev, priceTextOverride: e.target.value }))}
                                placeholder={isRTL ? 'عبارة مخصصة' : 'Custom Phrase'}
                                style={{
                                  width: '100%',
                                  padding: isRTL ? '12px 14px 12px 80px' : '12px 80px 12px 14px',
                                  background: 'rgba(255, 255, 255, 0.04)',
                                  border: '1px solid rgba(255, 255, 255, 0.15)',
                                  borderRadius: '10px',
                                  color: '#ffffff',
                                  fontSize: '14px',
                                  outline: 'none'
                                }}
                              />
                              <span style={{
                                position: 'absolute',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                [isRTL ? 'left' : 'right']: '14px',
                                fontSize: '11.5px',
                                color: '#64748b',
                                pointerEvents: 'none'
                              }}>
                                {studioForm.priceTextOverride.length} / 255
                              </span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                              {isRTL ? '(اختياري) استخدم عبارة مخصصة لوصف سعر هذا العرض' : '(Optional) Use a custom phrase to describe the price of this offer'}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* One Time Configuration */}
                      {studioForm.pricingPlan === 'one_time' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                          <div>
                            <label style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0', display: 'block', marginBottom: '8px' }}>
                              {isRTL ? 'السعر لمرة واحدة' : 'One Time Price'}
                            </label>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '10px',
                              padding: '4px 10px'
                            }}>
                              <span style={{ fontSize: '13px', color: '#94a3b8', marginInlineEnd: '6px' }}>
                                {studioForm.currency === 'EUR' ? '€' : studioForm.currency === 'USD' ? '$' : studioForm.currency}
                              </span>
                              <input
                                type="number"
                                step="1"
                                min="0"
                                value={studioForm.price}
                                onChange={(e) => setStudioForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                                style={{
                                  width: '100%',
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#ffffff',
                                  fontSize: '14px',
                                  fontWeight: '700',
                                  outline: 'none'
                                }}
                              />
                              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginInlineEnd: '8px' }}>
                                {studioForm.currency}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleStepPrice(-5)}
                                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '4px', width: '24px', height: '24px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                <Minus size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStepPrice(5)}
                                style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '4px', width: '24px', height: '24px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginInlineStart: '4px' }}
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                              {isRTL ? 'المبلغ المطلوب لمرة واحدة للحصول على وصول دائم' : 'Amount paid one time for full lifetime access'}
                            </div>
                          </div>

                          {/* Price Text Override */}
                          <div>
                            <label style={{ fontSize: '13px', fontWeight: '700', color: '#e2e8f0', display: 'block', marginBottom: '8px' }}>
                              {isRTL ? 'النص المخصص للسعر (اختياري)' : 'Price Text Override'}
                            </label>
                            <div style={{ position: 'relative' }}>
                              <input
                                type="text"
                                maxLength={255}
                                value={studioForm.priceTextOverride}
                                onChange={(e) => setStudioForm(prev => ({ ...prev, priceTextOverride: e.target.value }))}
                                placeholder={isRTL ? 'عبارة مخصصة' : 'Custom Phrase'}
                                style={{
                                  width: '100%',
                                  padding: isRTL ? '12px 14px 12px 80px' : '12px 80px 12px 14px',
                                  background: 'rgba(255, 255, 255, 0.04)',
                                  border: '1px solid rgba(255, 255, 255, 0.15)',
                                  borderRadius: '10px',
                                  color: '#ffffff',
                                  fontSize: '14px',
                                  outline: 'none'
                                }}
                              />
                              <span style={{
                                position: 'absolute',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                [isRTL ? 'left' : 'right']: '14px',
                                fontSize: '11.5px',
                                color: '#64748b',
                                pointerEvents: 'none'
                              }}>
                                {studioForm.priceTextOverride.length} / 255
                              </span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                              {isRTL ? '(اختياري) استخدم عبارة مخصصة لوصف سعر هذا العرض' : '(Optional) Use a custom phrase to describe the price of this offer'}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Free Plan Notice */}
                      {studioForm.pricingPlan === 'free' && (
                        <div style={{
                          padding: '14px 18px',
                          borderRadius: '12px',
                          background: 'rgba(34, 197, 94, 0.1)',
                          border: '1px solid rgba(34, 197, 94, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <span style={{ fontSize: '20px' }}>🎁</span>
                          <div style={{ fontSize: '13px', color: '#86efac' }}>
                            {isRTL 
                              ? 'هذا الكورس مجاني 100%. سيتمكن أي طالب مسجل في بوابتك من مشاهدته والتعلم منه فوراً.' 
                              : 'This course will be 100% free. Any registered student on your portal can access and learn immediately.'}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '16px' }}>
                        <button
                          type="button"
                          onClick={() => setStudioStep(2)}
                          className="btn btn-ghost"
                          style={{
                            padding: '9px 20px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: '#94a3b8',
                            fontSize: '13.5px',
                            fontWeight: '700'
                          }}
                        >
                          {isRTL ? 'السابق' : 'Back'}
                        </button>

                        <button
                          type="button"
                          onClick={handleCompleteCourseStudio}
                          disabled={isSubmittingStudio}
                          className="glow-btn btn"
                          style={{
                            padding: '10px 24px',
                            borderRadius: '10px',
                            background: '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '13.5px',
                            fontWeight: '800',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <span>
                            {isSubmittingStudio 
                              ? (isRTL ? 'جاري الحفظ...' : 'Creating...') 
                              : (editingCourse ? (isRTL ? 'حفظ التعديلات' : 'Save Changes') : (isRTL ? 'إنشاء الكورس' : 'Create Course'))}
                          </span>
                          {!isSubmittingStudio && (isRTL ? <Check size={16} /> : <ArrowRight size={16} />)}
                        </button>
                      </div>
                    </div>
                  )}

                </div>

                {/* COLUMN 3: STICKY LIVE PRODUCT PREVIEW CARD */}
                <div style={{ position: 'sticky', top: '24px' }}>
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    {/* Top Visual Artwork / Thumbnail Area */}
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      height: '195px',
                      background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #ede9fe 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden'
                    }}>
                      {studioForm.thumbnailUrl ? (
                        <img
                          src={studioForm.thumbnailUrl}
                          alt="Course Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        /* High-Fidelity 3D Isometric Play-Book Artwork */
                        <svg viewBox="0 0 400 225" style={{ width: '100%', height: '100%', display: 'block' }}>
                          <defs>
                            <linearGradient id="studioBookBg" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#dbeafe" />
                              <stop offset="50%" stopColor="#e0e7ff" />
                              <stop offset="100%" stopColor="#f3e8ff" />
                            </linearGradient>
                            <linearGradient id="bookCoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#c7d2fe" />
                              <stop offset="40%" stopColor="#a5b4fc" />
                              <stop offset="100%" stopColor="#818cf8" />
                            </linearGradient>
                            <linearGradient id="bookSpineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#818cf8" />
                              <stop offset="100%" stopColor="#6366f1" />
                            </linearGradient>
                            <linearGradient id="bookPagesGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#ffffff" />
                              <stop offset="100%" stopColor="#f1f5f9" />
                            </linearGradient>
                          </defs>
                          
                          <rect width="400" height="225" fill="url(#studioBookBg)" />

                          {/* Isometric 3D Book */}
                          <g transform="translate(200, 115)">
                            {/* Underneath Soft Shadow */}
                            <ellipse cx="0" cy="30" rx="80" ry="20" fill="#4338ca" opacity="0.18" />

                            {/* Bottom Cover Base */}
                            <path d="M-65 14 L0 44 L65 14 L0 -14 Z" fill="#6366f1" />

                            {/* Right Pages Edge */}
                            <path d="M0 40 L62 12 L62 -2 L0 26 Z" fill="url(#bookPagesGrad)" stroke="#cbd5e1" strokeWidth="0.5" />
                            {/* Left Spine Edge */}
                            <path d="M-65 10 L0 40 L0 26 L-65 -4 Z" fill="url(#bookSpineGrad)" />

                            {/* Top Cover Rhombus */}
                            <path d="M-66 -5 L-2 25 L63 -3 L-1 -33 Z" fill="url(#bookCoverGrad)" />

                            {/* Cover Spine Highlight Line */}
                            <path d="M-66 -5 L-2 25" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />

                            {/* Dark Play Triangle Icon on Top Cover */}
                            <polygon points="-5, -6 -5, 8 8, 1" fill="#312e81" opacity="0.75" />
                          </g>
                        </svg>
                      )}

                      {/* Bottom-Right Price Badge */}
                      <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        border: studioForm.pricingPlan === 'free' ? '1px solid #16a34a' : '1px solid #3b82f6',
                        color: studioForm.pricingPlan === 'free' ? '#16a34a' : '#2563eb',
                        fontSize: '11px',
                        fontWeight: '800',
                        letterSpacing: '0.2px',
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)'
                      }}>
                        {studioForm.pricingPlan === 'free' 
                          ? (isRTL ? 'مجاني' : 'Free')
                          : (studioForm.priceTextOverride || `${studioForm.currency === 'EUR' ? '€' : studioForm.currency === 'USD' ? '$' : studioForm.currency} ${Number(studioForm.price || 0).toFixed(2)}${studioForm.pricingPlan === 'recurring' ? (studioForm.billingPeriod === 'Monthly' ? '/mo' : studioForm.billingPeriod === 'Yearly' ? '/yr' : '') : ''}`)}
                      </div>
                    </div>

                    {/* Bottom Card Body */}
                    <div style={{ padding: '16px 18px', background: '#ffffff', color: '#0f172a' }}>
                      <div style={{
                        fontSize: '14.5px',
                        fontWeight: '800',
                        color: '#0f172a',
                        lineHeight: '1.3',
                        marginBottom: '5px',
                        minHeight: '20px'
                      }}>
                        {studioForm.title || (isRTL ? 'عنوان الكورس' : 'Course Title')}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#64748b',
                        lineHeight: '1.45',
                        minHeight: '18px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {studioForm.description || (isRTL ? 'وصف الكورس' : 'Course Description')}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : curriculumCourse ? (
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => setCurriculumCourse(null)}
                    className="btn btn-ghost"
                    style={{ padding: '8px 12px', borderRadius: '10px' }}
                  >
                    {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                    <span>{isRTL ? 'رجوع للكورسات' : 'Back to Courses'}</span>
                  </button>
                  <div>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '900' }}>
                      {curriculumCourse.title}
                    </h2>
                    <div style={{ fontSize: '12px', color: 'var(--text2, #94a3b8)' }}>
                      {isRTL ? 'بناء المنهج: الفصول، المحاضرات، روابط الفيديو، ومصادر التحميل' : 'Curriculum Builder: Modules, video lectures, and student resources'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setShowModuleModal(true)}
                    className="glow-btn btn"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '9px 18px',
                      fontSize: '13px',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FolderPlus size={15} />
                    <span>{isRTL ? '+ إضافة فصل / موديول' : '+ Add Module'}</span>
                  </button>
                </div>
              </div>

              {/* Modules List */}
              {(!curriculumCourse.modules || curriculumCourse.modules.length === 0) ? (
                <div style={{
                  padding: '50px 20px',
                  textAlign: 'center',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '14px',
                  border: '1px dashed rgba(255,255,255,0.15)'
                }}>
                  <div style={{ fontSize: '38px', marginBottom: '10px' }}>📚</div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '800' }}>
                    {isRTL ? 'لا توجد فصول دراسية في هذا الكورس بعد' : 'No Modules Added Yet'}
                  </h3>
                  <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: 'var(--text2, #94a3b8)' }}>
                    {isRTL ? 'ابدأ بإضافة أول فصل دراسي ثم قم بإضافة الدروس والمحاضرات بداخله.' : 'Start by creating your first module to organize lessons and video content.'}
                  </p>
                  <button
                    onClick={() => setShowModuleModal(true)}
                    className="btn glow-btn"
                    style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', padding: '9px 18px', fontWeight: '700', fontSize: '13px' }}
                  >
                    {isRTL ? '+ أضف أول موديول' : '+ Add First Module'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {curriculumCourse.modules.map((module, mIdx) => (
                    <div key={module.id || mIdx} style={{
                      background: 'rgba(0, 0, 0, 0.25)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      overflow: 'hidden'
                    }}>
                      {/* Module Header */}
                      <div style={{
                        padding: '14px 18px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: 'rgba(99, 102, 241, 0.2)',
                            color: '#a5b4fc',
                            fontSize: '11px',
                            fontWeight: '800'
                          }}>
                            {isRTL ? `الفصل ${mIdx + 1}` : `Module ${mIdx + 1}`}
                          </span>
                          <span style={{ fontSize: '15px', fontWeight: '800' }}>{module.title}</span>
                          <span style={{ fontSize: '11.5px', color: 'var(--text3, #64748b)' }}>
                            ({module.lessons?.length || 0} {isRTL ? 'دروس' : 'lessons'})
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => handleOpenLessonModal(mIdx)}
                            className="btn btn-ghost"
                            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px', color: '#818cf8', background: 'rgba(99, 102, 241, 0.1)' }}
                          >
                            <Plus size={14} />
                            <span>{isRTL ? 'إضافة درس' : 'Add Lesson'}</span>
                          </button>

                          <button
                            onClick={() => handleDeleteModule(mIdx)}
                            className="btn btn-ghost"
                            style={{ padding: '6px', color: '#ef4444', borderRadius: '8px' }}
                            title={isRTL ? 'حذف الفصل' : 'Delete Module'}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Lessons List in Module */}
                      <div style={{ padding: '10px 14px' }}>
                        {(!module.lessons || module.lessons.length === 0) ? (
                          <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text3, #64748b)' }}>
                            {isRTL ? 'لا توجد دروس في هذا الفصل بعد. اضغط "+ إضافة درس" لإضافة الفيديو والمذكرات.' : 'No lessons in this module. Click "+ Add Lesson" to upload lectures.'}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {module.lessons.map((lesson, lIdx) => (
                              <div key={lesson.id || lIdx} style={{
                                padding: '10px 14px',
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.04)',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'all 0.2s'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '8px',
                                    background: 'rgba(99, 102, 241, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#818cf8'
                                  }}>
                                    <Video size={15} />
                                  </div>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ fontSize: '13.5px', fontWeight: '700' }}>{lesson.title}</span>
                                      {lesson.isFreePreview && (
                                        <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: '800' }}>
                                          {isRTL ? 'معاينة مجانية' : 'Free Preview'}
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text3, #64748b)', display: 'flex', gap: '10px' }}>
                                      <span>⏱ {lesson.duration || '15 min'}</span>
                                      <span>📺 {lesson.videoType?.toUpperCase() || 'VIDEO'}</span>
                                      {lesson.attachmentUrl && <span>📎 {isRTL ? 'ملف مرفق' : 'Attachment'}</span>}
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <button
                                    onClick={() => handleOpenLessonModal(mIdx, lIdx)}
                                    className="btn btn-ghost"
                                    style={{ padding: '6px', borderRadius: '6px', color: 'var(--text2, #94a3b8)' }}
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLesson(mIdx, lIdx)}
                                    className="btn btn-ghost"
                                    style={{ padding: '6px', borderRadius: '6px', color: '#ef4444' }}
                                  >
                                    <Trash2 size={14} />
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
          ) : (
            /* Courses Catalog & Products Grid */
            <div>
              {/* Header Action Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '420px' }}>
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 12px'
                  }}>
                    <Search size={16} style={{ color: 'var(--text3, #64748b)' }} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={isRTL ? 'بحث في الكورسات...' : 'Search courses...'}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ffffff',
                        padding: '10px 10px',
                        fontSize: '13px',
                        width: '100%',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => handleOpenCourseModal()}
                    className="glow-btn btn"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '10px 20px',
                      fontSize: '13.5px',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Plus size={16} />
                    <span>{isRTL ? 'إنشاء كورس جديد' : 'Create Course'}</span>
                  </button>
                </div>
              </div>

              {/* Courses Grid */}
              {courses.length === 0 ? (
                <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: '44px', marginBottom: '12px' }}>🎓</div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800' }}>
                    {isRTL ? 'ابدأ بإنشاء أول كورس تدريبي لك' : 'Start Creating Your First Course'}
                  </h3>
                  <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--text2, #94a3b8)', maxWidth: '480px', marginInline: 'auto' }}>
                    {isRTL 
                      ? 'قم بإنشاء كورس متكامل، أضف الفصول والدروس التفاعلية، وشارك رابط البوابة مع طلابك لمشاهدته فوراً.'
                      : 'Create structured courses with video modules, downloadable resources, and quizzes for your students.'}
                  </p>
                  <button
                    onClick={() => handleOpenCourseModal()}
                    className="glow-btn btn"
                    style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '12px', padding: '11px 24px', fontWeight: '800', fontSize: '14px' }}
                  >
                    {isRTL ? '+ إنشاء كورس جديد الآن' : '+ Create Course Now'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '20px' }}>
                  {courses
                    .filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((course) => {
                      const modulesCount = course.modules?.length || 0;
                      const lessonsCount = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
                      const enrolledCount = students.filter(s => s.enrolledCourses?.includes(course.id)).length;

                      return (
                        <div key={course.id} className="glass-panel interactive-card" style={{
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative'
                        }}>
                          {/* Course Thumbnail */}
                          <div style={{
                            height: '160px',
                            background: course.thumbnailUrl 
                              ? `url(${course.thumbnailUrl}) center/cover no-repeat` 
                              : 'linear-gradient(135deg, #1e1b4b, #312e81)',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            padding: '12px'
                          }}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '20px',
                              background: 'rgba(0, 0, 0, 0.65)',
                              backdropFilter: 'blur(8px)',
                              color: '#ffffff',
                              fontSize: '11px',
                              fontWeight: '800'
                            }}>
                              {course.category || 'Business'}
                            </span>

                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '20px',
                              background: course.isPublished ? 'rgba(34, 197, 94, 0.85)' : 'rgba(234, 179, 8, 0.85)',
                              color: '#ffffff',
                              fontSize: '11px',
                              fontWeight: '800'
                            }}>
                              {course.isPublished ? (isRTL ? 'منشور' : 'Published') : (isRTL ? 'مسودة' : 'Draft')}
                            </span>
                          </div>

                          {/* Course Content */}
                          <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '800', lineHeight: '1.35' }}>
                              {course.title}
                            </h3>

                            <p style={{
                              margin: '0 0 16px 0',
                              fontSize: '12px',
                              color: 'var(--text2, #94a3b8)',
                              lineHeight: '1.5',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {course.description || (isRTL ? 'لا يوجد وصف لهذا الكورس.' : 'No description provided.')}
                            </p>

                            {/* Meta Info */}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '11.5px',
                              color: 'var(--text3, #64748b)',
                              padding: '10px 0',
                              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                              marginBottom: '16px'
                            }}>
                              <span>📚 {modulesCount} {isRTL ? 'فصول' : 'modules'}</span>
                              <span>🎬 {lessonsCount} {isRTL ? 'دروس' : 'lessons'}</span>
                              <span>👥 {enrolledCount} {isRTL ? 'طالب' : 'students'}</span>
                            </div>

                            {/* Price & Actions */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', gap: '8px' }}>
                              <div>
                                <div style={{ fontSize: '10.5px', color: 'var(--text3, #64748b)', textTransform: 'uppercase' }}>
                                  {isRTL ? 'السعر' : 'Price'}
                                </div>
                                <div style={{ fontSize: '15px', fontWeight: '900', color: Number(course.price) === 0 ? '#4ade80' : '#ffffff' }}>
                                  {Number(course.price) === 0 ? (isRTL ? 'مجاني' : 'FREE') : `${course.price} ${course.currency || 'EGP'}`}
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  onClick={() => setCurriculumCourse(course)}
                                  className="glow-btn btn"
                                  style={{
                                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '7px 12px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                  }}
                                >
                                  <Layers size={13} />
                                  <span>{isRTL ? 'المنهج والدروس' : 'Curriculum'}</span>
                                </button>

                                <button
                                  onClick={() => handleOpenCourseModal(course)}
                                  className="btn btn-ghost"
                                  style={{ padding: '7px 8px', borderRadius: '8px', color: 'var(--text2, #94a3b8)' }}
                                  title={isRTL ? 'تعديل البيانات' : 'Edit Info'}
                                >
                                  <Edit size={14} />
                                </button>

                                <button
                                  onClick={() => handleDeleteCourse(course.id)}
                                  className="btn btn-ghost"
                                  style={{ padding: '7px 8px', borderRadius: '8px', color: '#ef4444' }}
                                  title={isRTL ? 'حذف الكورس' : 'Delete Course'}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUB-VIEW: COMMUNITIES & DISCUSSION GROUPS                              */}
      {/* ========================================================================= */}
      {activeTab === 'communities' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '900' }}>
                {isRTL ? 'مجتمعات الطلاب التفاعلية' : 'Community Discussion Groups'}
              </h2>
              <div style={{ fontSize: '12.5px', color: 'var(--text2, #94a3b8)' }}>
                {isRTL ? 'أنشئ مجموعات نقاش وغرف تفاعلية لطلابك لمشاركة الأسئلة والتفاعل.' : 'Create topic-based discussion groups where students connect and share feedback.'}
              </div>
            </div>

            <button
              onClick={() => setShowGroupModal(true)}
              className="glow-btn btn"
              style={{
                background: 'linear-gradient(135deg, #a855f7, #9333ea)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 20px',
                fontSize: '13.5px',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Plus size={16} />
              <span>{isRTL ? 'إنشاء مجتمع جديد' : 'Create Group'}</span>
            </button>
          </div>

          {communities.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '44px', marginBottom: '12px' }}>💬</div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800' }}>
                {isRTL ? 'لا يوجد مجتمع نقاش مفعل بعد' : 'No Community Groups Yet'}
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--text2, #94a3b8)', maxWidth: '460px', marginInline: 'auto' }}>
                {isRTL ? 'أنشئ أول مجموعة نقاش لطلابك (مثل: مجتمع دورة التجارة الإلكترونية) لتوفير تجربة تشبه Skool.' : 'Launch interactive discussion spaces for your cohorts to build active student engagement.'}
              </p>
              <button
                onClick={() => setShowGroupModal(true)}
                className="btn glow-btn"
                style={{ background: '#a855f7', color: '#fff', border: 'none', borderRadius: '12px', padding: '11px 24px', fontWeight: '800', fontSize: '14px' }}
              >
                {isRTL ? '+ إنشاء أول مجتمع' : '+ Create First Group'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
              {communities.map((group) => (
                <div key={group.id} className="glass-panel interactive-card" style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'rgba(168, 85, 247, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px'
                    }}>
                      {group.icon || '💬'}
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '16px', fontWeight: '800' }}>
                        {group.name}
                      </h4>
                      <div style={{ fontSize: '11px', color: 'var(--text3, #64748b)' }}>
                        👥 {group.memberCount || 1} {isRTL ? 'أعضاء' : 'members'}
                      </div>
                    </div>
                  </div>

                  <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: 'var(--text2, #94a3b8)', lineHeight: '1.5' }}>
                    {group.description || (isRTL ? 'مجتمع نقاش تفاعلي للطلاب.' : 'Active student discussion group.')}
                  </p>

                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    fontSize: '11.5px',
                    color: '#c084fc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>{isRTL ? 'المنشورات في بوابة الطلاب' : 'Live on Student Portal'}</span>
                    <CheckCircle2 size={14} />
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SUB-VIEW: STUDENTS & ENROLLMENTS CRM                                   */}
      {/* ========================================================================= */}
      {activeTab === 'students' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '900' }}>
                {isRTL ? 'الطلاب والمشتركون في الأكاديمية' : 'Learners & Enrollments'}
              </h2>
              <div style={{ fontSize: '12.5px', color: 'var(--text2, #94a3b8)' }}>
                {isRTL ? 'قائمة بجميع الطلاب المسجلين، الكورسات المفعلة لهم، ونسبة إنجازهم للمحاضرات.' : 'Monitor registered students, granted courses, and real-time progress percentages.'}
              </div>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="glow-btn btn"
              style={{
                background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 20px',
                fontSize: '13.5px',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Plus size={16} />
              <span>{isRTL ? 'تسجيل / دعوة طالب' : 'Enroll Student'}</span>
            </button>
          </div>

          {/* Students Table */}
          <div className="glass-panel" style={{ overflowX: 'auto', padding: '16px' }}>
            <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '360px' }}>
              <Search size={15} style={{ color: 'var(--text3, #64748b)' }} />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder={isRTL ? 'بحث بالاسم أو الإيميل...' : 'Filter by name or email...'}
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  color: '#ffffff',
                  fontSize: '12.5px',
                  width: '100%',
                  outline: 'none'
                }}
              />
            </div>

            {students.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>👥</div>
                <div style={{ fontSize: '15px', fontWeight: '800', marginBottom: '4px' }}>
                  {isRTL ? 'لا يوجد طلاب مسجلون بعد' : 'No Students Enrolled Yet'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text3, #64748b)', marginBottom: '16px' }}>
                  {isRTL ? 'سجل الطلاب يدوياً عبر الزر أعلاه أو شارك رابط البوابة العام ليسجل الطلاب بأنفسهم.' : 'Enroll students manually or share your public portal URL for self-registration.'}
                </div>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="btn glow-btn"
                  style={{ background: '#38bdf8', color: '#fff', border: 'none', borderRadius: '10px', padding: '9px 18px', fontWeight: '700', fontSize: '13px' }}
                >
                  {isRTL ? '+ تسجيل طالب جديد' : '+ Enroll First Student'}
                </button>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--text3, #64748b)', fontSize: '11.5px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 14px' }}>{isRTL ? 'الطالب' : 'Student'}</th>
                    <th style={{ padding: '12px 14px' }}>{isRTL ? 'البريد الإلكتروني' : 'Email'}</th>
                    <th style={{ padding: '12px 14px' }}>{isRTL ? 'الكورسات المفعلة' : 'Enrolled Courses'}</th>
                    <th style={{ padding: '12px 14px' }}>{isRTL ? 'نسبة الإنجاز' : 'Progress'}</th>
                    <th style={{ padding: '12px 14px' }}>{isRTL ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {students
                    .filter(s => (s.name || '').toLowerCase().includes(studentSearch.toLowerCase()) || (s.email || '').toLowerCase().includes(studentSearch.toLowerCase()))
                    .map((student) => {
                      const studentCourses = courses.filter(c => student.enrolledCourses?.includes(c.id));
                      const avgProgress = student.progress ? Math.round(Object.values(student.progress).reduce((a, b) => a + b, 0) / (Object.keys(student.progress).length || 1)) : 0;

                      return (
                        <tr key={student.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '13px' }}>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '800',
                                color: '#ffffff',
                                fontSize: '12px'
                              }}>
                                {(student.name || 'S')[0].toUpperCase()}
                              </div>
                              <span style={{ fontWeight: '700' }}>{student.name || 'Student'}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--text2, #94a3b8)', direction: 'ltr', textAlign: isRTL ? 'right' : 'left' }}>
                            {student.email}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {studentCourses.length === 0 ? (
                                <span style={{ fontSize: '11px', color: 'var(--text3, #64748b)' }}>{isRTL ? 'الكل (افتراضي)' : 'All Access'}</span>
                              ) : (
                                studentCourses.map(c => (
                                  <span key={c.id} style={{ fontSize: '10.5px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.15)', color: '#a5b4fc' }}>
                                    {c.title}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ flex: 1, height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
                                <div style={{ width: `${avgProgress}%`, height: '100%', background: '#22c55e', borderRadius: '3px' }} />
                              </div>
                              <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#22c55e' }}>{avgProgress}%</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              padding: '3px 8px',
                              borderRadius: '20px',
                              background: 'rgba(34, 197, 94, 0.15)',
                              color: '#4ade80',
                              fontSize: '11px',
                              fontWeight: '700'
                            }}>
                              ● {student.status || 'Active'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SUB-VIEW: PORTAL BRANDING & DOMAIN SETTINGS                            */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '900' }}>
                {isRTL ? 'إعدادات وهوية بوابة الطلاب' : 'Portal Branding & Settings'}
              </h2>
              <div style={{ fontSize: '12.5px', color: 'var(--text2, #94a3b8)' }}>
                {isRTL ? 'خصص اسم الأكاديمية، الرابط المباشر، الشعار، الألوان، وودجت الدعم المباشر عبر واتساب.' : 'Configure your custom academy title, slug URL, logo, banner, and WhatsApp support.'}
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="glow-btn btn"
              style={{
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 24px',
                fontSize: '13.5px',
                fontWeight: '800',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Check size={16} />
              <span>{savingSettings ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ التعديلات' : 'Save Changes')}</span>
            </button>
          </div>

          {/* Settings Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            
            {/* Card 1: Domain & Slug */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Globe size={18} style={{ color: '#818cf8' }} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>
                  {isRTL ? 'رابط البوابة والـ Slug المخصص' : 'Portal URL Slug'}
                </h3>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'اسم الرابط المخصص (Slug)' : 'URL Slug'}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text3, #64748b)', direction: 'ltr' }}>/portal/</span>
                  <input
                    type="text"
                    value={settingsForm.portalSlug}
                    onChange={(e) => setSettingsForm({ ...settingsForm, portalSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder="my-academy"
                    style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '13px', width: '100%', outline: 'none', direction: 'ltr' }}
                  />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text3, #64748b)', marginTop: '4px' }}>
                  {isRTL ? `الرابط الكامل: ${baseUrl}/portal/${settingsForm.portalSlug || 'slug'}` : `Full URL: ${baseUrl}/portal/${settingsForm.portalSlug || 'slug'}`}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'اسم الأكاديمية المعروض' : 'Academy Display Name'}
                </label>
                <input
                  type="text"
                  value={settingsForm.portalTitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, portalTitle: e.target.value })}
                  placeholder={isRTL ? 'مثال: أكاديمية محمد جو' : 'e.g. Mohamed Joe Academy'}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 12px', color: '#ffffff', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Card 2: Branding & Appearance */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Sliders size={18} style={{ color: '#c084fc' }} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>
                  {isRTL ? 'الشعار والبانر والألوان' : 'Branding & Visuals'}
                </h3>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'رابط الشعار (Logo URL)' : 'Logo Image URL'}
                </label>
                <input
                  type="text"
                  value={settingsForm.logoUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                  placeholder="https://.../logo.png"
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 12px', color: '#ffffff', fontSize: '13px', direction: 'ltr' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'رابط بانر الخلفية (Banner Image URL)' : 'Hero Banner URL'}
                </label>
                <input
                  type="text"
                  value={settingsForm.bannerUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, bannerUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 12px', color: '#ffffff', fontSize: '13px', direction: 'ltr' }}
                />
              </div>
            </div>

            {/* Card 3: Support & Contact Widget */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <MessageCircle size={18} style={{ color: '#22c55e' }} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>
                  {isRTL ? 'زر الدعم المباشر (WhatsApp Widget)' : 'Student Support Widget'}
                </h3>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'رقم الواتساب مع كود الدولة' : 'WhatsApp Number (with country code)'}
                </label>
                <input
                  type="text"
                  value={settingsForm.whatsappNumber}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                  placeholder="201012345678"
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 12px', color: '#ffffff', fontSize: '13px', direction: 'ltr' }}
                />
                <div style={{ fontSize: '11px', color: 'var(--text3, #64748b)', marginTop: '4px' }}>
                  {isRTL ? 'سيظهر زر عائم للطلاب للتواصل معك مباشرة على واتساب عند وجود استفسار.' : 'A floating button will appear on the portal for instant learner help.'}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'رسالة الترحيب للطلاب' : 'Welcome Message'}
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.welcomeMessage}
                  onChange={(e) => setSettingsForm({ ...settingsForm, welcomeMessage: e.target.value })}
                  placeholder={isRTL ? 'أهلاً بك في الأكاديمية...' : 'Welcome to the academy...'}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 12px', color: '#ffffff', fontSize: '12.5px', resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Card 4: Access & Registration Permissions */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Lock size={18} style={{ color: '#f59e0b' }} />
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>
                  {isRTL ? 'صلاحيات التسجيل والدخول' : 'Access Permissions'}
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settingsForm.isOpenRegistration}
                    onChange={(e) => setSettingsForm({ ...settingsForm, isOpenRegistration: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700' }}>{isRTL ? 'السماح للطلاب الجدد بالتسجيل الذاتي' : 'Allow Open Registration'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3, #64748b)' }}>{isRTL ? 'يمكن لأي شخص لديه الرابط التسجيل في البوابة.' : 'Anyone with your portal link can sign up and browse free content.'}</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settingsForm.showCommunities}
                    onChange={(e) => setSettingsForm({ ...settingsForm, showCommunities: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700' }}>{isRTL ? 'تفعيل مجتمع الطلاب التفاعلي' : 'Enable Community Groups'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3, #64748b)' }}>{isRTL ? 'إظهار تبويب المجتمع للمناقشات في بوابة الطلاب.' : 'Show discussion channels on student portal.'}</div>
                  </div>
                </label>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE / EDIT COURSE                                             */}
      {/* ========================================================================= */}
      {showCourseModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '520px', padding: '28px', borderRadius: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '800' }}>
              {editingCourse ? (isRTL ? 'تعديل الكورس التدريبي' : 'Edit Course') : (isRTL ? 'إنشاء كورس تدريبي جديد' : 'Create New Course')}
            </h3>

            <form onSubmit={handleSaveCourse} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'عنوان الكورس *' : 'Course Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder={isRTL ? 'مثال: كورس إتقان التسويق الرقمي 2026' : 'e.g. Master Digital Marketing 2026'}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#ffffff', fontSize: '13.5px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'وصف الكورس' : 'Description'}
                </label>
                <textarea
                  rows={3}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder={isRTL ? 'اكتب نبذة مختصرة عما سيتعلمه الطالب في هذا الكورس...' : 'Brief summary of what students will achieve...'}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#ffffff', fontSize: '13px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                    {isRTL ? 'التصنيف' : 'Category'}
                  </label>
                  <select
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 12px', color: '#ffffff', fontSize: '13px' }}
                  >
                    <option value="E-commerce & Business">{isRTL ? 'تجارة إلكترونية وأعمال' : 'E-commerce & Business'}</option>
                    <option value="Marketing & Ads">{isRTL ? 'تسويق وإعلانات' : 'Marketing & Ads'}</option>
                    <option value="Coaching & Mentorship">{isRTL ? 'كوتشينج وتطوير' : 'Coaching & Mentorship'}</option>
                    <option value="Design & Creative">{isRTL ? 'تصميم وصناعة محتوى' : 'Design & Creative'}</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                    {isRTL ? 'السعر (0 = مجاني)' : 'Price (0 = Free)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 12px', color: '#ffffff', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'رابط صورة الغلاف (Thumbnail URL)' : 'Cover Image URL'}
                </label>
                <input
                  type="text"
                  value={courseForm.thumbnailUrl}
                  onChange={(e) => setCourseForm({ ...courseForm, thumbnailUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 12px', color: '#ffffff', fontSize: '13px', direction: 'ltr' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  checked={courseForm.isPublished}
                  onChange={(e) => setCourseForm({ ...courseForm, isPublished: e.target.checked })}
                />
                <span style={{ fontSize: '13px', fontWeight: '700' }}>{isRTL ? 'نشر الكورس وجعله متاحاً للطلاب في البوابة' : 'Publish course live to student portal'}</span>
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="glow-btn btn"
                  style={{ flex: 1.5, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800' }}
                >
                  {editingCourse ? (isRTL ? 'حفظ التعديلات' : 'Save Changes') : (isRTL ? 'إنشاء الكورس' : 'Create Course')}
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '24px', borderRadius: '18px' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: '800' }}>
              {isRTL ? 'إضافة فصل / موديول جديد' : 'Add New Module'}
            </h3>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                {isRTL ? 'عنوان الفصل *' : 'Module Title *'}
              </label>
              <input
                type="text"
                value={moduleTitle}
                onChange={(e) => setModuleTitle(e.target.value)}
                placeholder={isRTL ? 'مثال: مقدمة في استراتيجيات النمو' : 'e.g. Module 1: Foundations & Setup'}
                style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 12px', color: '#ffffff', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
              <button
                type="button"
                onClick={() => setShowModuleModal(false)}
                className="btn btn-ghost"
                style={{ flex: 1 }}
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleAddModule}
                className="glow-btn btn"
                style={{ flex: 1.5, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800' }}
              >
                {isRTL ? 'إضافة الفصل' : 'Add Module'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD / EDIT LESSON                                                */}
      {/* ========================================================================= */}
      {showLessonModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', padding: '26px', borderRadius: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '800' }}>
              {editingLessonIndex !== null ? (isRTL ? 'تعديل الدرس' : 'Edit Lesson') : (isRTL ? 'إضافة درس جديد' : 'Add New Lesson')}
            </h3>

            <form onSubmit={handleSaveLesson} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'عنوان الدرس *' : 'Lesson Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  placeholder={isRTL ? 'مثال: كيفية إطلاق أول حملة إعلانية ناجحة' : 'e.g. Setting up your tracking pixel'}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 12px', color: '#ffffff', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                    {isRTL ? 'منصة الفيديو' : 'Video Provider'}
                  </label>
                  <select
                    value={lessonForm.videoType}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoType: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 12px', color: '#ffffff', fontSize: '13px' }}
                  >
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="loom">Loom</option>
                    <option value="mp4">Direct MP4 Video</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                    {isRTL ? 'مدة الدرس' : 'Duration'}
                  </label>
                  <input
                    type="text"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                    placeholder="15 min"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 12px', color: '#ffffff', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'رابط الفيديو (YouTube / Vimeo / Loom / MP4)' : 'Video URL'}
                </label>
                <input
                  type="text"
                  value={lessonForm.videoUrl}
                  onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... or https://www.loom.com/share/..."
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 12px', color: '#ffffff', fontSize: '13px', direction: 'ltr' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'مذكرات وشرح الدرس للطالب' : 'Lesson Notes & Description'}
                </label>
                <textarea
                  rows={3}
                  value={lessonForm.notes}
                  onChange={(e) => setLessonForm({ ...lessonForm, notes: e.target.value })}
                  placeholder={isRTL ? 'اكتب ملاحظات الدرس، الروابط المهمة، والنقاط الرئيسية...' : 'Key takeaways, resources, instructions...'}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 12px', color: '#ffffff', fontSize: '12.5px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                    {isRTL ? 'اسم المرفق للتحميل' : 'Attachment Name'}
                  </label>
                  <input
                    type="text"
                    value={lessonForm.attachmentName}
                    onChange={(e) => setLessonForm({ ...lessonForm, attachmentName: e.target.value })}
                    placeholder={isRTL ? 'ملف العمل PDF' : 'Action Plan.pdf'}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 12px', color: '#ffffff', fontSize: '12.5px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                    {isRTL ? 'رابط تحميل المرفق' : 'Attachment URL'}
                  </label>
                  <input
                    type="text"
                    value={lessonForm.attachmentUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, attachmentUrl: e.target.value })}
                    placeholder="https://.../guide.pdf"
                    style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 12px', color: '#ffffff', fontSize: '12.5px', direction: 'ltr' }}
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={lessonForm.isFreePreview}
                  onChange={(e) => setLessonForm({ ...lessonForm, isFreePreview: e.target.checked })}
                />
                <span style={{ fontSize: '12.5px', fontWeight: '700' }}>{isRTL ? 'معاينة مجانية (يمكن لأي زائر مشاهدته قبل الاشتراك)' : 'Free Preview (accessible before enrollment)'}</span>
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="glow-btn btn"
                  style={{ flex: 1.5, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800' }}
                >
                  {isRTL ? 'حفظ الدرس' : 'Save Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ENROLL STUDENT                                                   */}
      {/* ========================================================================= */}
      {showInviteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '26px', borderRadius: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '800' }}>
              {isRTL ? 'تسجيل / تفعيل حساب طالب جديد' : 'Enroll New Student'}
            </h3>

            <form onSubmit={handleEnrollStudent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'اسم الطالب' : 'Student Name'}
                </label>
                <input
                  type="text"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  placeholder={isRTL ? 'مثال: أحمد علي' : 'e.g. John Doe'}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 12px', color: '#ffffff', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'البريد الإلكتروني للطالب *' : 'Student Email *'}
                </label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="student@example.com"
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 12px', color: '#ffffff', fontSize: '13px', direction: 'ltr' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'تفعيل الكورسات المحددة:' : 'Grant Access to Courses:'}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {courses.map((c) => {
                    const isChecked = inviteForm.selectedCourses.includes(c.id);
                    return (
                      <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', cursor: 'pointer' }}>
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
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="glow-btn btn"
                  style={{ flex: 1.5, background: 'linear-gradient(135deg, #38bdf8, #0284c7)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800' }}
                >
                  {isRTL ? 'تفعيل الطالب' : 'Grant Enrollment'}
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '24px', borderRadius: '18px' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: '800' }}>
              {isRTL ? 'إنشاء مجتمع نقاش جديد' : 'Create Community Group'}
            </h3>
            <form onSubmit={handleSaveGroup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'اسم المجتمع *' : 'Group Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder={isRTL ? 'مثال: مجتمع رواد الأعمال 2026' : 'Entrepreneurs Cohort 2026'}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 12px', color: '#ffffff', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text2, #94a3b8)', display: 'block', marginBottom: '6px' }}>
                  {isRTL ? 'الأيقونة والوصف' : 'Icon & Description'}
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={groupForm.icon}
                    onChange={(e) => setGroupForm({ ...groupForm, icon: e.target.value })}
                    style={{ width: '45px', textAlign: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '18px' }}
                  />
                  <input
                    type="text"
                    value={groupForm.description}
                    onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                    placeholder={isRTL ? 'وصف المجتمع...' : 'Description...'}
                    style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '9px 12px', color: '#ffffff', fontSize: '12px' }}
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
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="glow-btn btn"
                  style={{ flex: 1.5, background: 'linear-gradient(135deg, #a855f7, #9333ea)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800' }}
                >
                  {isRTL ? 'إنشاء' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
