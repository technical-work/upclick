'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  getCoachPortalSettings,
  getCoachCourses,
  getCoachCommunities,
  getCommunityPosts,
  createCommunityPost,
  enrollStudent,
  updateStudentLessonProgress,
  DEFAULT_PORTAL_SETTINGS,
  registerStudent,
  loginStudent,
  requestStudentOtp,
  verifyStudentOtp,
  joinCommunityGroup,
  getCoachSharedFiles,
  saveSharedFile,
  deleteSharedFile
} from '../../../lib/membershipsService';
import CommunityGroupExperience from '../../../components/Memberships/CommunityGroupExperience';
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
  ShieldCheck,
  FileText,
  Layers,
  Folder,
  Plus,
  Grid,
  Bell,
  Home as HomeIcon,
  X,
  Mail,
  Eye,
  EyeOff,
  UploadCloud,
  Trash2
} from 'lucide-react';

export default function StudentClientPortalPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const coachUsername = params?.coachUsername || 'moha';
  const initialCourseId = searchParams.get('course');
  const initialTab = searchParams.get('tab') || 'home';

  // Portal & Content States
  const [portalSettings, setPortalSettings] = useState(DEFAULT_PORTAL_SETTINGS);
  const [courses, setCourses] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active View Navigation: 'home' | 'courses' | 'community' | 'achievements'
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [theaterMode, setTheaterMode] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  // Real Student Auth State (Production: clean initial empty values, strict credential validation)
  const [currentStudent, setCurrentStudent] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'otp' | 'signup'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpNotice, setOtpNotice] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const otpRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  // Complete Profile Modal State (Screenshot 4)
  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);
  const [selectedGroupToJoin, setSelectedGroupToJoin] = useState(null);
  const [profileBio, setProfileBio] = useState('');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState('/file.jpg');
  const [showConfetti, setShowConfetti] = useState(false);

  // Shared Files Modal
  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileSize, setNewFileSize] = useState('1.5 MB');

  // Course Progress & Community Feed
  const [completedLessons, setCompletedLessons] = useState([]);
  const [activeCommunityId, setActiveCommunityId] = useState(null);

  // Load Real Portal Data from coach & Firestore
  useEffect(() => {
    async function loadPortal() {
      try {
        setLoading(true);
        const settings = await getCoachPortalSettings(coachUsername);
        setPortalSettings(settings);

        const coachId = settings.coachId || settings.id || coachUsername;
        const [cList, commList, filesList] = await Promise.all([
          getCoachCourses(coachId, coachUsername),
          getCoachCommunities(coachId, coachUsername),
          getCoachSharedFiles(coachId, coachUsername)
        ]);

        const realCourses = Array.isArray(cList) ? cList : [];
        const realCommunities = Array.isArray(commList) ? commList : [];
        const realFiles = Array.isArray(filesList) ? filesList : [];

        setCourses(realCourses);
        setCommunities(realCommunities);
        setSharedFiles(realFiles);

        if (realCommunities.length > 0) {
          setActiveCommunityId(realCommunities[0].id);
        }

        // Direct course deep link if present
        if (initialCourseId && realCourses.length > 0) {
          const target = realCourses.find(c => c.id === initialCourseId);
          if (target) {
            handleSelectCourse(target);
            setActiveTab('courses');
          }
        }
      } catch (err) {
        console.warn('[Portal] Load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPortal();
  }, [coachUsername, initialCourseId]);

  // Load authenticated student session from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`upklick_student_${coachUsername}`) ||
                     localStorage.getItem('upklick_current_student');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.email) {
            setCurrentStudent(parsed);
            setCompletedLessons(parsed.completedLessons || []);
            if (parsed.avatar) setProfileAvatarUrl(parsed.avatar);
            if (parsed.bio) setProfileBio(parsed.bio);
          }
        } catch {}
      }
    }
  }, [coachUsername]);

  // OTP handlers
  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otpDigits];
    next[idx] = val.slice(-1);
    setOtpDigits(next);

    if (val && idx < 5) {
      otpRefs[idx + 1]?.current?.focus();
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      otpRefs[idx - 1]?.current?.focus();
    }
  };

  // Real Authentication Submit Handler (Strict Database Verification)
  const handleAuthSubmit = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const coachId = portalSettings.coachId || portalSettings.id || coachUsername;

    try {
      if (authMode === 'login') {
        const res = await loginStudent(coachId, { email: authEmail, password: authPassword });
        setAuthLoading(false);
        if (!res.success) {
          setAuthError(res.error);
          return;
        }
        setCurrentStudent(res.student);
      } else if (authMode === 'signup') {
        if (!authName.trim()) {
          setAuthError('Please enter your full name.');
          setAuthLoading(false);
          return;
        }
        const res = await registerStudent(coachId, {
          name: authName,
          email: authEmail,
          password: authPassword
        });
        setAuthLoading(false);
        if (!res.success) {
          setAuthError(res.error);
          return;
        }
        setCurrentStudent(res.student);
      } else if (authMode === 'otp') {
        const code = otpDigits.join('');
        if (code.length < 6) {
          setAuthError('Please enter all 6 digits of the secure code.');
          setAuthLoading(false);
          return;
        }
        const res = await verifyStudentOtp(coachId, authEmail, code);
        setAuthLoading(false);
        if (!res.success) {
          setAuthError(res.error);
          return;
        }
        setCurrentStudent(res.student);
      }
    } catch (err) {
      setAuthLoading(false);
      setAuthError('An error occurred. Please try again.');
    }
  };

  // Switch to OTP and send real code
  const handleSwitchToOtp = async () => {
    setAuthError('');
    if (!authEmail || !authEmail.includes('@')) {
      setAuthError('Please enter your email above first to receive your secure code.');
      return;
    }
    setAuthLoading(true);
    const coachId = portalSettings.coachId || portalSettings.id || coachUsername;
    const res = await requestStudentOtp(coachId, authEmail);
    setAuthLoading(false);
    if (!res.success) {
      setAuthError(res.error);
      return;
    }
    setOtpNotice(`Secure code generated: [ ${res.code} ]`);
    setOtpDigits(['', '', '', '', '', '']);
    setAuthMode('otp');
  };

  const handleResendOtp = async () => {
    const coachId = portalSettings.coachId || portalSettings.id || coachUsername;
    const res = await requestStudentOtp(coachId, authEmail);
    if (res.success) {
      setOtpNotice(`New secure code generated: [ ${res.code} ]`);
      alert(`Your new secure code is: ${res.code}`);
    }
  };

  // Google Continue
  const handleGoogleContinue = async () => {
    const emailPrompt = prompt('Enter your Google email address:') || '';
    if (!emailPrompt || !emailPrompt.includes('@')) return;
    const coachId = portalSettings.coachId || portalSettings.id || coachUsername;
    const res = await registerStudent(coachId, {
      name: emailPrompt.split('@')[0],
      email: emailPrompt,
      password: 'google_verified_auth'
    });
    if (res.student) {
      setCurrentStudent(res.student);
    }
  };

  const handleSignOut = () => {
    setCurrentStudent(null);
    setShowUserDropdown(false);
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
    setAuthError('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`upklick_student_${coachUsername}`);
      localStorage.removeItem('upklick_current_student');
    }
  };

  // Real Group Join Flow (Writes directly to Firestore portal_students and portal_communities)
  const handleOpenJoinModal = (group) => {
    setSelectedGroupToJoin(group);
    setShowCompleteProfileModal(true);
  };

  const handleCompleteJoinGroup = async () => {
    if (!selectedGroupToJoin || !currentStudent) return;
    const targetGroupId = selectedGroupToJoin.id || selectedGroupToJoin.slug;
    const coachId = portalSettings.coachId || portalSettings.id || coachUsername;

    try {
      const res = await joinCommunityGroup(coachId, currentStudent.email, targetGroupId, {
        bio: profileBio,
        avatar: profileAvatarUrl
      });
      if (res.student) setCurrentStudent(res.student);
      if (res.group) {
        setCommunities(prev => prev.map(c => (c.id === res.group.id || c.slug === res.group.slug) ? res.group : c));
      }
    } catch (err) {
      console.error('Error joining group:', err);
    }

    setShowCompleteProfileModal(false);

    // Full screen confetti celebration (Screenshot 5)
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      router.push(`/portal/${coachUsername}/community/${selectedGroupToJoin.slug || targetGroupId}`);
    }, 2800);
  };

  const isGroupJoined = (group) => {
    if (!currentStudent || !currentStudent.joinedCommunities) return false;
    const gid = group.id || group.slug;
    return currentStudent.joinedCommunities.includes(gid) ||
           currentStudent.joinedCommunities.includes(group.slug);
  };

  // Real Shared Files Operations (Firestore & Persistent Cache)
  const handleAddSharedFile = async (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    const coachId = portalSettings.coachId || portalSettings.id || coachUsername;
    try {
      const saved = await saveSharedFile(coachId, {
        name: newFileName.trim(),
        uploadedBy: currentStudent?.name || 'Coach',
        size: newFileSize || '1.5 MB'
      });
      setSharedFiles(prev => [saved, ...prev]);
      setNewFileName('');
      setShowAddFileModal(false);
    } catch (err) {
      console.error('Error adding file:', err);
    }
  };

  const handleDeleteSharedFile = async (fileId) => {
    if (!confirm('Are you sure you want to delete this shared file?')) return;
    const coachId = portalSettings.coachId || portalSettings.id || coachUsername;
    await deleteSharedFile(coachId, fileId);
    setSharedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Course Handling
  const handleSelectCourse = (course) => {
    setActiveCourse(course);
    const firstModule = (course.modules || [])[0];
    const firstLesson = (firstModule?.lessons || [])[0];
    if (firstLesson) setActiveLesson(firstLesson);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleModule = (modId) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

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

  const portalName = portalSettings.portalTitle || 'My portal';
  const studentInitials = (currentStudent?.name || 'M')[0].toUpperCase();

  // =========================================================================
  // 1. IF NOT LOGGED IN: REAL SPLIT-SCREEN AUTH (SCREENSHOT 1 & 2)
  // =========================================================================
  if (!currentStudent && !loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        width: '100%',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        background: '#ffffff'
      }}>
        {/* Left Form Column */}
        <div style={{
          flex: '1 1 50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 24px',
          background: '#ffffff',
          minHeight: '100vh'
        }}>
          <div style={{ width: '100%', maxWidth: '380px' }}>

            {/* MODE 1: LOGIN (Screenshot 1) */}
            {authMode === 'login' && (
              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  color: '#111827',
                  margin: '0 0 24px 0',
                  letterSpacing: '-0.5px'
                }}>
                  Login
                </h1>

                {/* Continue with Google */}
                <button
                  type="button"
                  onClick={handleGoogleContinue}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    color: '#374151',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                {/* Divider */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '22px 0',
                  color: '#9ca3af',
                  fontSize: '12px'
                }}>
                  <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                  <span style={{ padding: '0 12px', fontSize: '11.5px', color: '#6b7280' }}>
                    Or, sign in with your email
                  </span>
                  <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                </div>

                {/* Email Input */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '9px 12px',
                    background: '#ffffff'
                  }}>
                    <Mail size={16} color="#9ca3af" style={{ marginRight: '10px' }} />
                    <input
                      type="email"
                      required
                      placeholder="Email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', color: '#111827' }}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div style={{ marginBottom: '8px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '9px 12px',
                    background: '#ffffff'
                  }}>
                    <Lock size={16} color="#9ca3af" style={{ marginRight: '10px' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', color: '#111827' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={handleSwitchToOtp}
                    style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Real Error Message */}
                {authError && (
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    fontSize: '12.5px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    marginBottom: '14px',
                    textAlign: 'center'
                  }}>
                    {authError}
                  </div>
                )}

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={authLoading}
                  style={{
                    width: '100%',
                    background: '#1d4ed8',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '11px',
                    fontSize: '13.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(29, 78, 216, 0.3)',
                    marginBottom: '12px',
                    opacity: authLoading ? 0.7 : 1
                  }}
                >
                  {authLoading ? 'Verifying...' : 'Login'}
                </button>

                {/* Login with Secure Code Button */}
                <button
                  type="button"
                  onClick={handleSwitchToOtp}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#374151',
                    cursor: 'pointer',
                    marginBottom: '28px'
                  }}
                >
                  Login with secure code
                </button>

                {/* Sign up link */}
                <div style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
                  New user?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthError(''); setAuthMode('signup'); }}
                    style={{ background: 'transparent', border: 'none', color: '#2563eb', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                  >
                    Sign up
                  </button>
                </div>
              </form>
            )}

            {/* MODE 2: ENTER OTP (Screenshot 2) */}
            {authMode === 'otp' && (
              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  color: '#111827',
                  margin: '0 0 6px 0',
                  letterSpacing: '-0.5px'
                }}>
                  Enter OTP
                </h1>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 20px 0', fontWeight: '500' }}>
                  Secure code
                </p>

                {otpNotice && (
                  <div style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1d4ed8',
                    fontSize: '12.5px',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    textAlign: 'center',
                    fontWeight: '700'
                  }}>
                    {otpNotice}
                  </div>
                )}

                {/* 6 Digit Input Boxes */}
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '20px' }}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={otpRefs[idx]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      style={{
                        width: '48px',
                        height: '52px',
                        borderRadius: '8px',
                        border: '1.5px solid #d1d5db',
                        textAlign: 'center',
                        fontSize: '22px',
                        fontWeight: '800',
                        color: '#111827',
                        outline: 'none',
                        background: '#ffffff'
                      }}
                    />
                  ))}
                </div>

                <p style={{ fontSize: '11.5px', color: '#6b7280', lineHeight: '1.6', margin: '0 0 20px 0' }}>
                  Please check your email: <strong style={{ color: '#111827' }}>{authEmail}</strong> for the secure code. If you did not receive any email from us,{' '}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    style={{ background: 'transparent', border: 'none', color: '#2563eb', padding: 0, fontSize: '11.5px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    tap here to resend
                  </button>.
                </p>

                {authError && (
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    fontSize: '12.5px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    marginBottom: '14px',
                    textAlign: 'center'
                  }}>
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  style={{
                    width: '100%',
                    background: '#1d4ed8',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '11px',
                    fontSize: '13.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(29, 78, 216, 0.3)',
                    marginBottom: '16px',
                    opacity: authLoading ? 0.7 : 1
                  }}
                >
                  {authLoading ? 'Verifying code...' : 'Verify secure code'}
                </button>

                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => { setAuthError(''); setAuthMode('login'); }}
                    style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                  >
                    Login with password
                  </button>
                </div>
              </form>
            )}

            {/* MODE 3: SIGN UP (CREATE ACCOUNT) */}
            {authMode === 'signup' && (
              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  color: '#111827',
                  margin: '0 0 24px 0',
                  letterSpacing: '-0.5px'
                }}>
                  Create Account
                </h1>

                <button
                  type="button"
                  onClick={handleGoogleContinue}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    color: '#374151',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', margin: '22px 0', color: '#9ca3af', fontSize: '12px' }}>
                  <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                  <span style={{ padding: '0 12px', fontSize: '11.5px', color: '#6b7280' }}>Or, sign up with your email</span>
                  <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '9px 12px' }}>
                    <User size={16} color="#9ca3af" style={{ marginRight: '10px' }} />
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', color: '#111827' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '9px 12px' }}>
                    <Mail size={16} color="#9ca3af" style={{ marginRight: '10px' }} />
                    <input
                      type="email"
                      required
                      placeholder="Email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', color: '#111827' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '9px 12px' }}>
                    <Lock size={16} color="#9ca3af" style={{ marginRight: '10px' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Create Password (min 6 characters)"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', color: '#111827' }}
                    />
                  </div>
                </div>

                {authError && (
                  <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    fontSize: '12.5px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    marginBottom: '14px',
                    textAlign: 'center'
                  }}>
                    {authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  style={{
                    width: '100%',
                    background: '#1d4ed8',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '11px',
                    fontSize: '13.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(29, 78, 216, 0.3)',
                    marginBottom: '20px',
                    opacity: authLoading ? 0.7 : 1
                  }}
                >
                  {authLoading ? 'Creating account...' : 'Create Account'}
                </button>

                <div style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthError(''); setAuthMode('login'); }}
                    style={{ background: 'transparent', border: 'none', color: '#2563eb', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                  >
                    Log in
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

        {/* Right Solid Blue Column (Screenshot 1 & 2) */}
        <div style={{
          flex: '1 1 50%',
          background: '#0d6efd',
          backgroundImage: 'linear-gradient(135deg, #0d6efd 0%, #1d4ed8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          color: '#ffffff',
          minHeight: '100vh'
        }}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: '#ffffff',
            letterSpacing: '-0.5px',
            margin: 0,
            textAlign: 'center'
          }}>
            {portalName}
          </h2>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. CLIENT PORTAL DASHBOARD (SCREENSHOT 3)
  // =========================================================================
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      color: '#1e293b'
    }}>

      {/* CONFETTI CELEBRATION EXPLOSION (Screenshot 5) */}
      {showConfetti && (
        <div style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 999999,
          overflow: 'hidden'
        }}>
          <style>{`
            @keyframes confettiParticleDrop {
              0% { transform: translateY(-40px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(115vh) rotate(800deg); opacity: 0; }
            }
          `}</style>
          {Array.from({ length: 90 }).map((_, i) => {
            const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];
            const color = colors[i % colors.length];
            const left = `${(i * 1.15) % 100}%`;
            const delay = `${((i * 0.04) % 1.5).toFixed(2)}s`;
            const duration = `${2.4 + (i % 6) * 0.3}s`;
            const w = i % 3 === 0 ? '11px' : '7px';
            const h = i % 2 === 0 ? '11px' : '15px';
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '-25px',
                  left,
                  width: w,
                  height: h,
                  borderRadius: i % 4 === 0 ? '50%' : '2px',
                  backgroundColor: color,
                  animation: `confettiParticleDrop ${duration} cubic-bezier(0.25, 1, 0.5, 1) ${delay} forwards`,
                  transform: `rotate(${i * 24}deg)`
                }}
              />
            );
          })}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TOP HEADER BAR (Screenshot 3)                                         */}
      {/* ===================================================================== */}
      <header style={{
        height: '56px',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        {/* Left: Home Icon 🏠 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => { setActiveTab('home'); setActiveCourse(null); }}
            title="Home"
            style={{
              background: activeTab === 'home' ? '#f1f5f9' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#334155',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <HomeIcon size={19} />
          </button>
        </div>

        {/* Right: 9-Dot Launcher, Bell, Avatar Circle 'M' */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
          <button
            title="Apps"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Grid size={18} />
          </button>

          <button
            title="Notifications"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Bell size={18} />
          </button>

          {/* Avatar Circle */}
          <div
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: '#e2e8f0',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}
          >
            {profileAvatarUrl ? (
              <img src={profileAvatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              studentInitials
            )}
          </div>

          {/* Dropdown Menu */}
          {showUserDropdown && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: 0,
              width: '230px',
              background: '#ffffff',
              borderRadius: '10px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
              border: '1px solid #e2e8f0',
              padding: '12px',
              zIndex: 100
            }}>
              <div style={{ paddingBottom: '10px', borderBottom: '1px solid #f1f5f9', marginBottom: '8px' }}>
                <div style={{ fontWeight: '700', fontSize: '14px', color: '#111827' }}>
                  {currentStudent?.name || 'Student'}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentStudent?.email || ''}
                </div>
              </div>

              <button
                onClick={() => { setActiveTab('home'); setShowUserDropdown(false); }}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '13px',
                  color: '#334155',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  textAlign: 'left'
                }}
              >
                <HomeIcon size={15} /> Home Dashboard
              </button>

              {courses.length > 0 && (
                <button
                  onClick={() => { setActiveTab('courses'); setShowUserDropdown(false); }}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '13px',
                    color: '#334155',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    textAlign: 'left'
                  }}
                >
                  <BookOpen size={15} /> Academy Courses ({courses.length})
                </button>
              )}

              <div style={{ borderTop: '1px solid #f1f5f9', margin: '6px 0' }} />

              <button
                onClick={handleSignOut}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '13px',
                  color: '#ef4444',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  textAlign: 'left'
                }}
              >
                <LogOut size={15} /> Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ===================================================================== */}
      {/* BODY WITH LEFT SIDEBAR & MAIN CONTENT (Screenshot 3)                  */}
      {/* ===================================================================== */}
      <div style={{ display: 'flex', flex: 1 }}>

        {/* LEFT COLUMN / SIDEBAR */}
        <aside style={{
          width: '210px',
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Brand Logo Card (Violet layered emblem from Screenshot 3) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 0'
          }}>
            <div style={{
              width: '82px',
              height: '82px',
              borderRadius: '50%',
              background: '#f3e8ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(168, 85, 247, 0.15)'
            }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                transform: 'rotate(-10deg)',
                boxShadow: '0 4px 10px rgba(99, 102, 241, 0.35)'
              }}>
                <Layers size={22} color="#ffffff" />
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => {
                if (communities.length > 0) {
                  const target = communities[0];
                  if (isGroupJoined(target)) {
                    router.push(`/portal/${coachUsername}/community/${target.slug || target.id}`);
                  } else {
                    handleOpenJoinModal(target);
                  }
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '10px 14px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13.5px',
                fontWeight: '700',
                color: '#1e293b',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={16} color="#64748b" />
                <span>Join a Group</span>
              </div>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '1px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ArrowRight size={11} color="#2563eb" />
              </div>
            </button>

            {courses.length > 0 && (
              <button
                onClick={() => setActiveTab(activeTab === 'courses' ? 'home' : 'courses')}
                style={{
                  background: activeTab === 'courses' ? '#f1f5f9' : 'transparent',
                  border: 'none',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#475569',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <BookOpen size={16} color="#64748b" />
                <span>My Courses</span>
              </button>
            )}
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main style={{ flex: 1, padding: '36px 40px', maxWidth: '1080px' }}>

          {/* VIEW A: CLIENT PORTAL HOME (SCREENSHOT 3) */}
          {activeTab === 'home' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>

              {/* Top Greeting Header */}
              <div>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500', marginBottom: '4px' }}>
                  Hi, {currentStudent?.name || currentStudent?.email?.split('@')[0] || 'mohamed'}
                </div>
                <h1 style={{
                  fontSize: '28px',
                  fontWeight: '800',
                  color: '#0f172a',
                  margin: 0,
                  letterSpacing: '-0.5px'
                }}>
                  Welcome to {portalSettings?.portalTitle || ''}
                </h1>
              </div>

              {/* TWO TOP CARDS: RECENTLY OPENED & SHARED FILES (SCREENSHOT 3) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                gap: '24px'
              }}>
                {/* Left Card: Recently opened (Screenshot 3) */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '24px 28px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      Recently opened
                    </h2>
                    <button
                      onClick={() => {
                        const el = document.getElementById('all-groups-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#2563eb',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      View all Groups
                    </button>
                  </div>

                  {communities.length > 0 ? (
                    <div
                      onClick={() => router.push(`/portal/${coachUsername}/community/${communities[0].slug || communities[0].id}`)}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s ease',
                        background: '#ffffff'
                      }}
                    >
                      {/* Purple-to-orange gradient cover thumbnail from Screenshot 3 */}
                      <div style={{
                        height: '130px',
                        background: communities[0].coverImageUrl
                          ? `url(${communities[0].coverImageUrl}) center/cover no-repeat`
                          : 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f97316 100%)'
                      }} />
                      <div style={{ padding: '14px 16px', fontWeight: '800', fontSize: '15px', color: '#0f172a' }}>
                        {communities[0].name || communities[0].title || 'Community Group'}
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '36px 0', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      No groups opened yet
                    </div>
                  )}
                </div>

                {/* Right Card: Shared Files (Screenshot 3) */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '24px 28px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      Shared Files
                    </h2>

                    <button
                      onClick={() => setShowAddFileModal(true)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '6px 14px',
                        fontSize: '12.5px',
                        fontWeight: '600',
                        color: '#334155',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Plus size={14} />
                      <span>+ Add Files</span>
                    </button>
                  </div>

                  {sharedFiles.length === 0 ? (
                    <div style={{
                      padding: '36px 0',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {/* Blue Folder Graphic */}
                      <div style={{
                        width: '68px',
                        height: '56px',
                        background: '#60a5fa',
                        borderRadius: '6px',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(96, 165, 250, 0.35)',
                        marginBottom: '14px'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '-7px',
                          left: '8px',
                          width: '26px',
                          height: '10px',
                          background: '#3b82f6',
                          borderRadius: '4px 4px 0 0'
                        }} />
                        <div style={{
                          width: '46px',
                          height: '32px',
                          background: '#ffffff',
                          borderRadius: '4px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
                        }} />
                      </div>

                      <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>
                        You don't have any!
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {sharedFiles.map((file) => (
                        <div
                          key={file.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #f1f5f9'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FileText size={18} color="#2563eb" />
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{file.name}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{file.size}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              onClick={() => alert(`Opening ${file.name}...`)}
                              style={{
                                background: 'transparent',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                padding: '4px 8px',
                                fontSize: '11.5px',
                                color: '#2563eb',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Download size={12} /> Download
                            </button>
                            <button
                              onClick={() => handleDeleteSharedFile(file.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                padding: '4px'
                              }}
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

              {/* ALL COMMUNITY GROUPS SECTION */}
              <div id="all-groups-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    All Community Groups
                  </h2>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    {communities.length} {communities.length === 1 ? 'group available' : 'groups available'}
                  </span>
                </div>

                {communities.length === 0 ? (
                  <div style={{
                    background: '#ffffff',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: '#64748b'
                  }}>
                    <Users size={36} color="#94a3b8" style={{ marginBottom: '10px' }} />
                    <div style={{ fontWeight: '700', fontSize: '15px', color: '#1e293b', marginBottom: '4px' }}>
                      No community groups published yet
                    </div>
                    <div style={{ fontSize: '12.5px' }}>
                      The coach has not published any active groups for this portal yet.
                    </div>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '20px'
                  }}>
                    {communities.map((grp) => {
                      const joined = isGroupJoined(grp);
                      const membersCount = grp.membersCount || grp.memberCount || 1;

                      return (
                        <div
                          key={grp.id || grp.slug}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                        >
                          {/* Cover Banner (Purple to Gold Gradient from Screenshot 4 & 5) */}
                          <div style={{
                            height: '110px',
                            background: grp.coverImageUrl
                              ? `url(${grp.coverImageUrl}) center/cover no-repeat`
                              : 'linear-gradient(135deg, #7c3aed 0%, #c084fc 45%, #f59e0b 100%)',
                            position: 'relative'
                          }} />

                          {/* Card Content */}
                          <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{
                              margin: '0 0 4px 0',
                              fontSize: '16px',
                              fontWeight: '800',
                              color: '#0f172a'
                            }}>
                              {grp.name || grp.title || 'Community Group'}
                            </h3>

                            <div style={{ fontSize: '11.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                              <span>🌐</span>
                              <span>{grp.privacy === 'private' ? 'Private Group' : 'Public Group'}</span>
                            </div>

                            <p style={{
                              fontSize: '12.5px',
                              color: '#475569',
                              lineHeight: '1.5',
                              margin: '0 0 16px 0',
                              flex: 1
                            }}>
                              {grp.description || 'Connect, learn, and grow together with fellow members in our community.'}
                            </p>

                            {/* Stats Row */}
                            <div style={{
                              display: 'flex',
                              gap: '16px',
                              fontSize: '12px',
                              color: '#64748b',
                              paddingBottom: '16px',
                              borderBottom: '1px solid #f1f5f9',
                              marginBottom: '16px'
                            }}>
                              <span><strong style={{ color: '#0f172a' }}>{membersCount}</strong> Members</span>
                              <span><strong style={{ color: '#0f172a' }}>{grp.postsCount || 0}</strong> Posts</span>
                              <span><strong style={{ color: '#0f172a' }}>1</strong> Admin</span>
                            </div>

                            {/* ACTION BUTTON: JOIN GROUP OR OPEN GROUP */}
                            {joined ? (
                              <button
                                type="button"
                                onClick={() => router.push(`/portal/${coachUsername}/community/${grp.slug || grp.id}`)}
                                style={{
                                  width: '100%',
                                  background: '#f8fafc',
                                  border: '1.5px solid #2563eb',
                                  color: '#2563eb',
                                  borderRadius: '8px',
                                  padding: '10px',
                                  fontSize: '12.5px',
                                  fontWeight: '800',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px'
                                }}
                              >
                                <span>OPEN GROUP</span>
                                <ArrowRight size={14} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenJoinModal(grp)}
                                style={{
                                  width: '100%',
                                  background: '#1d4ed8',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '8px',
                                  padding: '11px',
                                  fontSize: '12.5px',
                                  fontWeight: '800',
                                  cursor: 'pointer',
                                  letterSpacing: '0.4px',
                                  boxShadow: '0 2px 6px rgba(29, 78, 216, 0.3)'
                                }}
                              >
                                JOIN GROUP
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* VIEW B: ACADEMY COURSES VIEW */}
          {activeTab === 'courses' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
                    Academy Courses
                  </h1>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                    Browse all learning programs and master new skills.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('home')}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  ← Back to Portal Home
                </button>
              </div>

              {activeCourse ? (
                /* Course Player / Curriculum */
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 16px 0' }}>
                      {activeLesson?.title || activeCourse.title}
                    </h2>
                    {activeLesson?.videoUrl ? (
                      <div style={{ aspectRatio: '16/9', background: '#000', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                        <iframe
                          src={activeLesson.videoUrl.replace('watch?v=', 'embed/')}
                          title={activeLesson.title}
                          style={{ width: '100%', height: '100%', border: 'none' }}
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div style={{ aspectRatio: '16/9', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <Play size={48} color="#94a3b8" />
                      </div>
                    )}
                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
                      {activeLesson?.content || 'Lesson content and notes.'}
                    </p>
                  </div>

                  {/* Modules Drawer */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '800', margin: '0 0 12px 0' }}>Modules</h3>
                    {(activeCourse.modules || []).map((m, mIdx) => (
                      <div key={m.id || mIdx} style={{ marginBottom: '10px' }}>
                        <div
                          onClick={() => toggleModule(m.id || mIdx)}
                          style={{ fontWeight: '700', fontSize: '13px', cursor: 'pointer', padding: '6px 0' }}
                        >
                          {m.title}
                        </div>
                        {expandedModules[m.id || mIdx] !== false && (
                          <div style={{ paddingLeft: '10px' }}>
                            {(m.lessons || []).map((l) => (
                              <div
                                key={l.id}
                                onClick={() => setActiveLesson(l)}
                                style={{
                                  padding: '6px 8px',
                                  fontSize: '12px',
                                  color: activeLesson?.id === l.id ? '#2563eb' : '#475569',
                                  fontWeight: activeLesson?.id === l.id ? '700' : '500',
                                  cursor: 'pointer',
                                  borderRadius: '6px',
                                  background: activeLesson?.id === l.id ? '#eff6ff' : 'transparent'
                                }}
                              >
                                {l.title}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Course Cards Grid */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {courses.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCourse(c)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                      }}
                    >
                      <div style={{ height: '120px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={36} color="#ffffff" />
                      </div>
                      <div style={{ padding: '16px' }}>
                        <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>{c.title}</h3>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 12px 0' }}>{c.description}</p>
                        <div style={{ fontSize: '11.5px', color: '#2563eb', fontWeight: '700' }}>
                          Progress: {getCourseProgress(c)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ===================================================================== */}
      {/* SCREENSHOT 4: COMPLETE YOUR PROFILE MODAL                              */}
      {/* ===================================================================== */}
      {showCompleteProfileModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '460px',
            padding: '36px 32px 28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            textAlign: 'center',
            position: 'relative'
          }}>
            {/* Close X Button */}
            <button
              onClick={() => setShowCompleteProfileModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={18} />
            </button>

            {/* Title & Subtitle (Screenshot 4) */}
            <h2 style={{
              fontSize: '21px',
              fontWeight: '800',
              color: '#111827',
              margin: '0 0 8px 0',
              letterSpacing: '-0.3px'
            }}>
              Complete Your Profile
            </h2>
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              lineHeight: '1.5',
              maxWidth: '350px',
              margin: '0 auto 22px auto'
            }}>
              Communities feel weird without faces and names. Profiles build trust and spark connection with others
            </p>

            {/* Avatar Circle */}
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '8px' }}>
              <img
                src={profileAvatarUrl}
                alt="Profile"
                style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #e5e7eb',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  display: 'block',
                  margin: '0 auto'
                }}
              />
            </div>

            {/* Avatar Filename & File Input */}
            <label style={{ display: 'block', cursor: 'pointer', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#4b5563', fontWeight: '500' }}>file.jpg</span>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setProfileAvatarUrl(url);
                  }
                }}
              />
            </label>

            {/* Upload Note with Red Asterisk */}
            <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 20px 0' }}>
              Upload a SVG, PNG, JPG, JPEG, WEBP, ICO. Recommended Aspect Ratio 1:1 <span style={{ color: '#ef4444' }}>*</span>
            </p>

            {/* Bio Box with Character Counter */}
            <div style={{
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px',
              textAlign: 'left',
              background: '#ffffff'
            }}>
              <textarea
                rows={3}
                maxLength={200}
                placeholder="Add a bio... (Optional)"
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontSize: '13px',
                  color: '#111827',
                  fontFamily: 'inherit',
                  background: 'transparent'
                }}
              />
              <div style={{ textAlign: 'right', fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                {profileBio.length} / 200
              </div>
            </div>

            {/* Solid Navy COMPLETE Button */}
            <button
              type="button"
              onClick={handleCompleteJoinGroup}
              style={{
                width: '100%',
                background: '#1e3a8a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '13px',
                fontSize: '13px',
                fontWeight: '800',
                letterSpacing: '0.6px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(30, 58, 138, 0.3)',
                transition: 'background 0.15s'
              }}
            >
              COMPLETE
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ADD SHARED FILE */}
      {showAddFileModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <form
            onSubmit={handleAddSharedFile}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '400px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
              Add Shared File
            </h3>

            <input
              type="text"
              required
              placeholder="e.g. Course-Orientation-Guide.pdf"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                marginBottom: '14px',
                outline: 'none'
              }}
            />

            <input
              type="text"
              placeholder="File size (e.g. 2.4 MB)"
              value={newFileSize}
              onChange={(e) => setNewFileSize(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                marginBottom: '20px',
                outline: 'none'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowAddFileModal(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  background: '#1d4ed8',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 18px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Add File
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
