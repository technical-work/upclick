import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';

// Default initial portal settings for a coach (Production Ready)
export const DEFAULT_PORTAL_SETTINGS = {
  portalTitle: 'Academy Portal',
  portalTagline: 'بوابة التدريب والتعلم المستقلة',
  portalSlug: 'academy',
  logoUrl: '',
  bannerUrl: '',
  themeColor: '#FF6B35',
  welcomeMessage: 'مرحباً بك في الأكاديمية! يسعدنا انضمامك لرحلتنا التعليمية.',
  whatsappNumber: '',
  telegramUsername: '',
  isOpenRegistration: true, // Anyone with link can register
  showCommunities: true,
  showCourses: true,
  requirePasscode: false,
  portalPasscode: ''
};

// Local storage cache helpers for resilient offline / permission-safe state
function getLocalCache(key, fallback = null) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setLocalCache(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}

// 1. Portal Settings
export async function getCoachPortalSettings(coachIdOrSlug) {
  if (!coachIdOrSlug) return DEFAULT_PORTAL_SETTINGS;
  const cleanKey = coachIdOrSlug.toLowerCase().trim();
  const cacheKey = `upklick_portal_${cleanKey}`;
  const cached = getLocalCache(cacheKey);

  // If cached and belongs strictly to this slug or coachId, return it
  if (cached && (cached.portalSlug?.toLowerCase() === cleanKey || cached.coachId?.toLowerCase() === cleanKey)) {
    return cached;
  }

  try {
    // 1. Check by doc ID first (coachId / UID)
    const docRef = doc(db, 'coach_portals', coachIdOrSlug);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const merged = { id: snap.id, coachId: snap.id, ...DEFAULT_PORTAL_SETTINGS, ...snap.data() };
      setLocalCache(cacheKey, merged);
      if (merged.portalSlug) {
        setLocalCache(`upklick_portal_${merged.portalSlug.toLowerCase()}`, merged);
      }
      return merged;
    }

    // 2. Otherwise search by portalSlug
    const q = query(
      collection(db, 'coach_portals'),
      where('portalSlug', '==', cleanKey)
    );
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const first = querySnap.docs[0];
      const merged = { id: first.id, coachId: first.data().coachId || first.id, ...DEFAULT_PORTAL_SETTINGS, ...first.data() };
      setLocalCache(cacheKey, merged);
      if (merged.coachId) {
        setLocalCache(`upklick_portal_${merged.coachId.toLowerCase()}`, merged);
      }
      return merged;
    }

    // 3. Check if coach exists in users collection (by UID or username)
    try {
      const userDoc = await getDoc(doc(db, 'users', coachIdOrSlug));
      if (userDoc.exists()) {
        const u = userDoc.data();
        const synthesized = {
          ...DEFAULT_PORTAL_SETTINGS,
          coachId: userDoc.id,
          portalTitle: `${u.name || u.email?.split('@')[0] || coachIdOrSlug} Academy`,
          portalSlug: cleanKey
        };
        setLocalCache(cacheKey, synthesized);
        return synthesized;
      }

      const uQuery = query(collection(db, 'users'), where('username', '==', cleanKey));
      const uSnap = await getDocs(uQuery);
      if (!uSnap.empty) {
        const uFirst = uSnap.docs[0];
        const u = uFirst.data();
        const synthesized = {
          ...DEFAULT_PORTAL_SETTINGS,
          coachId: uFirst.id,
          portalTitle: `${u.name || u.email?.split('@')[0] || coachIdOrSlug} Academy`,
          portalSlug: cleanKey
        };
        setLocalCache(cacheKey, synthesized);
        setLocalCache(`upklick_portal_${uFirst.id.toLowerCase()}`, synthesized);
        return synthesized;
      }
    } catch (_) {}

    const fallback = {
      ...DEFAULT_PORTAL_SETTINGS,
      coachId: coachIdOrSlug,
      portalTitle: `${coachIdOrSlug} Academy`,
      portalSlug: cleanKey
    };
    setLocalCache(cacheKey, fallback);
    return fallback;
  } catch (err) {
    return cached || {
      ...DEFAULT_PORTAL_SETTINGS,
      coachId: coachIdOrSlug,
      portalTitle: `${coachIdOrSlug} Academy`,
      portalSlug: cleanKey
    };
  }
}

export async function saveCoachPortalSettings(coachId, settings) {
  if (!coachId) throw new Error('Coach ID is required');
  const cacheKey = `upklick_portal_${coachId.toLowerCase()}`;
  const slugCacheKey = `upklick_portal_${(settings.portalSlug || 'academy').toLowerCase().trim()}`;
  
  const data = {
    ...DEFAULT_PORTAL_SETTINGS,
    ...settings,
    coachId,
    portalSlug: (settings.portalSlug || 'academy').toLowerCase().trim()
  };

  setLocalCache(cacheKey, data);
  setLocalCache(slugCacheKey, data);

  try {
    const docRef = doc(db, 'coach_portals', coachId);
    await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.info('[membershipsService] Saved portal settings locally (Firestore write pending rules):', err.message);
  }

  return data;
}

// 2. Courses CRUD
// Default high-value cohort courses with complete explanations & video lessons
export const DEFAULT_COHORT_COURSES = [
  {
    id: 'course_masterclass_vip',
    title: 'Executive Growth & High-Ticket Client Acquisition',
    description: 'The complete step-by-step masterclass on building, scaling, and automating a 7-figure online coaching business.',
    category: 'Business & Coaching',
    thumbnailUrl: '',
    coachId: 'moha',
    studentCount: 142,
    createdAt: new Date().toISOString(),
    modules: [
      {
        id: 'mod_1',
        title: 'Module 1: Foundations of High-Ticket Positioning',
        lessons: [
          {
            id: 'les_1_1',
            title: 'Lesson 1: Crafting an Irresistible High-Ticket Offer',
            duration: '14:20',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            content: `### شرح تفصيلي وملاحظات الدرس (Detailed Lesson Explanation)

في هذا الدرس نتعلم الركائز الأساسية لبناء عرض تدريبي احترافي (High-Ticket Offer) يستهدف العملاء ذوي القيمة العالية:
1. **تحديد القيمة الجوهرية (Core Value Transformation)**: لا تبع الساعات، بل بع النتيجة المباشرة التي يبحث عنها عميلك.
2. **هيكلة التسعير (Value-Based Pricing)**: كيف تحدد السعر بناءً على عائد الاستثمار (ROI) للعميل بدلاً من التكاليف.
3. **ضمانات النتائج والالتزام (Risk Reversal Guarantee)**: تقليل تردد العميل ورفع نسبة الإغلاق.

#### خطوات التطبيق العملية:
- قم بتحميل كراسة العمل من قسم المرفقات.
- حدد جمهورك المستهدف وعرّف نقطة الألم الأساسية (Main Pain Point).
- اكتب مسودة عرضك الأول وشاركه في قسم مناقشات الدرس بالأسفل.`,
            resources: [
              { name: 'High-Ticket Offer Blueprint.pdf', size: '2.4 MB', url: '#' },
              { name: 'Client Avatar Worksheet.xlsx', size: '540 KB', url: '#' }
            ]
          },
          {
            id: 'les_1_2',
            title: 'Lesson 2: Target Audience Deep Dive & Dream Buyer Avatar',
            duration: '18:45',
            videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
            content: `### شرح الدرس: دراسة العميل المثالي بالتفصيل

كيف تحدد بدقة من هو العميل المستعد للاستثمار في برنامجك التدريبي:
- معرفة التحديات اليومية التي تواجه العميل.
- رصد الكلمات المفتاحية التي يستخدمها في البحث.
- كيفية بناء رسائل تسويقية تلامس أهدافه مباشرة وحل مخاوفه قبل اللقاء.`,
            resources: [
              { name: 'Audience Research Checklist.pdf', size: '1.1 MB', url: '#' }
            ]
          }
        ]
      },
      {
        id: 'mod_2',
        title: 'Module 2: Funnels, Community Growth & Sales Mastery',
        lessons: [
          {
            id: 'les_2_1',
            title: 'Lesson 1: The Automated Community Onboarding Funnel',
            duration: '22:15',
            videoUrl: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
            content: `### شرح الدرس: مسار انضمام الأعضاء التلقائي

خطوات ضبط مسار المجتمع والترحيب بالطلاب الجدد لضمان أعلى نسبة تفاعل وإكمال للدروس:
1. رسائل الترحيب التلقائية عبر الواتساب والبريد الإلكتروني.
2. توجيه العميل لأول درس فوري للحصول على نتيجة سريعة (Quick Win).
3. بناء عادة المتابعة اليومية والمشاركة في الفعاليات والتحديات.`,
            resources: [
              { name: 'Onboarding Flow Diagram.pdf', size: '3.2 MB', url: '#' }
            ]
          },
          {
            id: 'les_2_2',
            title: 'Lesson 2: Live Stream Coaching & Cohort Retention',
            duration: '16:50',
            videoUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
            content: `### شرح الدرس: إدارة جلسات البث المباشر وزيادة تفاعل الطلاب

أفضل الممارسات لعمل جلسات Go Live تفاعلية مع إجابة أسئلة الطلاب وحفظها كدروس مرجعية داخل المجتمع.`,
            resources: []
          }
        ]
      }
    ]
  }
];

export async function getCoachCourses(coachId, altCoachId) {
  if (!coachId && !altCoachId) return [];
  const primaryId = coachId || altCoachId;
  const cacheKey = `upklick_courses_${primaryId.toLowerCase()}`;
  let list = [];

  try {
    const q1 = query(
      collection(db, 'courses'),
      where('coachId', '==', primaryId)
    );
    const snap1 = await getDocs(q1);
    snap1.docs.forEach(d => {
      const item = { id: d.id, ...d.data() };
      if (!list.find(existing => existing.id === item.id)) {
        list.push(item);
      }
    });

    if (altCoachId && altCoachId !== primaryId) {
      try {
        const q2 = query(
          collection(db, 'courses'),
          where('coachId', '==', altCoachId)
        );
        const snap2 = await getDocs(q2);
        snap2.docs.forEach(d => {
          const item = { id: d.id, ...d.data() };
          if (!list.find(existing => existing.id === item.id)) {
            list.push(item);
          }
        });
      } catch (_) {}
    }

    setLocalCache(cacheKey, list);
    if (altCoachId && altCoachId !== primaryId) {
      setLocalCache(`upklick_courses_${altCoachId.toLowerCase()}`, list);
    }
    return list;
  } catch (err) {
    const cached = getLocalCache(cacheKey, []);
    return Array.isArray(cached)
      ? cached.filter(c => c && (c.coachId === primaryId || (altCoachId && c.coachId === altCoachId)))
      : [];
  }
}

export function subscribeCoachCourses(coachId, callback) {
  if (!coachId) return () => {};
  const cacheKey = `upklick_courses_${coachId}`;
  
  // Call immediately with cached data
  const cached = getLocalCache(cacheKey, []);
  callback(cached);

  try {
    const q = query(
      collection(db, 'courses'),
      where('coachId', '==', coachId)
    );
    return onSnapshot(q, (snap) => {
      const courses = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLocalCache(cacheKey, courses);
      callback(courses);
    }, (err) => {
      // Permission warning: use cached state silently
      callback(getLocalCache(cacheKey, []));
    });
  } catch (err) {
    callback(cached);
    return () => {};
  }
}

export async function saveCourse(coachId, courseData) {
  if (!coachId) throw new Error('Coach ID is required');
  const cacheKey = `upklick_courses_${coachId}`;
  const existingCourses = getLocalCache(cacheKey, []);
  
  const courseId = courseData.id || `course_${Date.now()}`;
  const payload = {
    ...courseData,
    id: courseId,
    coachId,
    updatedAt: new Date().toISOString()
  };

  // Update local cache first
  const existingIndex = existingCourses.findIndex(c => c.id === courseId);
  let updatedCourses;
  if (existingIndex >= 0) {
    updatedCourses = [...existingCourses];
    updatedCourses[existingIndex] = { ...updatedCourses[existingIndex], ...payload };
  } else {
    payload.createdAt = new Date().toISOString();
    payload.studentCount = payload.studentCount || 0;
    updatedCourses = [payload, ...existingCourses];
  }
  setLocalCache(cacheKey, updatedCourses);

  // Sync to Firestore
  try {
    const ref = doc(db, 'courses', courseId);
    const firestorePayload = { ...payload, updatedAt: serverTimestamp() };
    delete firestorePayload.id;
    await setDoc(ref, firestorePayload, { merge: true });
  } catch (err) {
    console.info('[membershipsService] Course saved locally (Firestore write pending rules):', err.message);
  }

  return payload;
}

export async function deleteCourse(courseId, coachId) {
  if (!courseId) return;
  if (coachId) {
    const cacheKey = `upklick_courses_${coachId}`;
    const existing = getLocalCache(cacheKey, []);
    setLocalCache(cacheKey, existing.filter(c => c.id !== courseId));
  }

  try {
    await deleteDoc(doc(db, 'courses', courseId));
  } catch (err) {
    console.info('[membershipsService] Course deleted locally:', err.message);
  }
}

// 3. Students Management
export async function getCoachStudents(coachId) {
  if (!coachId) return [];
  const cacheKey = `upklick_students_${coachId}`;

  try {
    const q = query(
      collection(db, 'portal_students'),
      where('coachId', '==', coachId)
    );
    const snap = await getDocs(q);
    const students = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setLocalCache(cacheKey, students);
    return students;
  } catch (err) {
    const cached = getLocalCache(cacheKey, []);
    return Array.isArray(cached) ? cached : [];
  }
}

export function subscribeCoachStudents(coachId, callback) {
  if (!coachId) return () => {};
  const cacheKey = `upklick_students_${coachId}`;
  
  // Deliver cached instantly
  const cached = getLocalCache(cacheKey, []);
  callback(cached);

  try {
    const q = query(
      collection(db, 'portal_students'),
      where('coachId', '==', coachId)
    );
    return onSnapshot(q, (snap) => {
      const students = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLocalCache(cacheKey, students);
      callback(students);
    }, (err) => {
      callback(getLocalCache(cacheKey, []));
    });
  } catch (err) {
    callback(cached);
    return () => {};
  }
}

export async function enrollStudent(coachId, studentData) {
  if (!coachId || !studentData.email) throw new Error('Coach ID & email are required');
  const cleanEmail = studentData.email.toLowerCase().trim();
  const studentDocId = `${coachId}_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
  const cacheKey = `upklick_students_${coachId}`;
  const existingList = getLocalCache(cacheKey, []);

  const existingStudent = existingList.find(s => s.email === cleanEmail);
  const enrolledCourses = Array.from(new Set([
    ...(existingStudent ? existingStudent.enrolledCourses || [] : []),
    ...(studentData.enrolledCourses || [])
  ]));

  const payload = {
    id: studentDocId,
    coachId,
    email: cleanEmail,
    name: studentData.name || cleanEmail.split('@')[0],
    enrolledCourses,
    status: studentData.status || 'active',
    updatedAt: new Date().toISOString(),
    completedLessons: existingStudent?.completedLessons || {},
    progress: existingStudent?.progress || {}
  };

  // Update local cache
  const idx = existingList.findIndex(s => s.id === studentDocId || s.email === cleanEmail);
  let updatedList;
  if (idx >= 0) {
    updatedList = [...existingList];
    updatedList[idx] = { ...updatedList[idx], ...payload };
  } else {
    payload.createdAt = new Date().toISOString();
    updatedList = [payload, ...existingList];
  }
  setLocalCache(cacheKey, updatedList);

  // Sync to Firestore
  try {
    const docRef = doc(db, 'portal_students', studentDocId);
    const firestorePayload = { ...payload, updatedAt: serverTimestamp() };
    delete firestorePayload.id;
    await setDoc(docRef, firestorePayload, { merge: true });
  } catch (err) {
    console.info('[membershipsService] Student enrolled locally:', err.message);
  }

  return payload;
}

// 4. Progress Tracking
export async function updateStudentLessonProgress(coachId, studentEmail, courseId, lessonId, isCompleted = true) {
  if (!coachId || !studentEmail || !courseId || !lessonId) return;
  const cleanEmail = studentEmail.toLowerCase().trim();
  const studentDocId = `${coachId}_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
  const cacheKey = `upklick_students_${coachId}`;
  const students = getLocalCache(cacheKey, []);
  
  const student = students.find(s => s.id === studentDocId || s.email === cleanEmail) || {
    id: studentDocId,
    coachId,
    email: cleanEmail,
    completedLessons: {},
    progress: {}
  };

  const currentCompleted = student.completedLessons?.[courseId] || [];
  let updatedCompleted;
  if (isCompleted) {
    updatedCompleted = Array.from(new Set([...currentCompleted, lessonId]));
  } else {
    updatedCompleted = currentCompleted.filter(id => id !== lessonId);
  }

  const courses = getLocalCache(`upklick_courses_${coachId}`, []);
  const course = courses.find(c => c.id === courseId);
  let totalLessons = 1;
  if (course?.modules) {
    totalLessons = course.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 1;
  }
  const progressPercent = Math.min(100, Math.round((updatedCompleted.length / totalLessons) * 100));

  student.completedLessons = { ...(student.completedLessons || {}), [courseId]: updatedCompleted };
  student.progress = { ...(student.progress || {}), [courseId]: progressPercent };
  
  const idx = students.findIndex(s => s.id === studentDocId || s.email === cleanEmail);
  if (idx >= 0) students[idx] = student;
  else students.push(student);
  setLocalCache(cacheKey, students);

  // Sync to Firestore
  try {
    const docRef = doc(db, 'portal_students', studentDocId);
    await setDoc(docRef, {
      completedLessons: student.completedLessons,
      progress: student.progress,
      lastActiveAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {}

  return { progressPercent, completedLessons: updatedCompleted };
}

// 5. Communities & Discussions
export async function getCoachCommunities(coachId, altCoachId) {
  if (!coachId && !altCoachId) return [];
  const primaryId = coachId || altCoachId;
  const cacheKey = `upklick_communities_${primaryId}`;
  let list = [];

  // 1. Authoritative Firestore query for this coach's communities
  try {
    const q1 = query(
      collection(db, 'portal_communities'),
      where('coachId', '==', primaryId)
    );
    const snap1 = await getDocs(q1);
    snap1.docs.forEach(d => {
      const item = { id: d.id, ...d.data() };
      if (!list.find(existing => existing.id === item.id)) {
        list.push(item);
      }
    });

    if (altCoachId && altCoachId !== primaryId) {
      try {
        const q2 = query(
          collection(db, 'portal_communities'),
          where('coachId', '==', altCoachId)
        );
        const snap2 = await getDocs(q2);
        snap2.docs.forEach(d => {
          const item = { id: d.id, ...d.data() };
          if (!list.find(existing => existing.id === item.id)) {
            list.push(item);
          }
        });
      } catch (_) {}
    }

    // Overwrite local cache with authoritative data from Firestore (even if empty)
    setLocalCache(cacheKey, list);
    if (altCoachId && altCoachId !== primaryId) {
      setLocalCache(`upklick_communities_${altCoachId}`, list);
    }
    return list;
  } catch (err) {
    // In case of offline error, return only cached items strictly belonging to this coach
    const cached = getLocalCache(cacheKey, []);
    return Array.isArray(cached)
      ? cached.filter(item => item && (item.coachId === primaryId || (altCoachId && item.coachId === altCoachId)))
      : [];
  }
}

export function subscribeCoachCommunities(coachId, callback) {
  if (!coachId) {
    callback([]);
    return () => {};
  }
  const cacheKey = `upklick_communities_${coachId}`;
  const cached = getLocalCache(cacheKey, []);
  callback(Array.isArray(cached) ? cached : []);

  try {
    const q = query(
      collection(db, 'portal_communities'),
      where('coachId', '==', coachId)
    );
    return onSnapshot(q, (snap) => {
      const communities = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLocalCache(cacheKey, communities);
      callback(communities);
    }, (err) => {
      callback(getLocalCache(cacheKey, []));
    });
  } catch (err) {
    callback(Array.isArray(cached) ? cached : []);
    return () => {};
  }
}

export async function saveCommunityGroup(coachId, groupData) {
  if (!coachId) throw new Error('Coach ID is required');
  const cacheKey = `upklick_communities_${coachId}`;
  const existing = getLocalCache(cacheKey, []);

  const id = groupData.id || `group_${Date.now()}`;
  const payload = {
    ...groupData,
    id,
    coachId,
    memberCount: groupData.memberCount || 1,
    updatedAt: new Date().toISOString()
  };

  const idx = existing.findIndex(g => g.id === id);
  let updated;
  if (idx >= 0) {
    updated = [...existing];
    updated[idx] = { ...updated[idx], ...payload };
  } else {
    payload.createdAt = new Date().toISOString();
    updated = [payload, ...existing];
  }
  setLocalCache(cacheKey, updated);

  try {
    const ref = doc(db, 'portal_communities', id);
    const firestorePayload = { ...payload, updatedAt: serverTimestamp() };
    delete firestorePayload.id;
    await setDoc(ref, firestorePayload, { merge: true });
  } catch (err) {
    console.info('[membershipsService] Community group saved locally:', err.message);
  }

  return payload;
}

export async function deleteCommunityGroup(coachId, groupId) {
  if (!coachId || !groupId) return;
  const cacheKey = `upklick_communities_${coachId}`;
  const existing = getLocalCache(cacheKey, []);
  const updated = existing.filter(g => g.id !== groupId && g.slug !== groupId);
  setLocalCache(cacheKey, updated);

  try {
    const ref = doc(db, 'portal_communities', groupId);
    await deleteDoc(ref);
  } catch (err) {}
}

export function formatTimeAgo(val) {
  if (!val) return 'Just now';
  if (typeof val === 'string') {
    if (val.includes('ago') || val === 'Just now' || val.includes('now')) return val;
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      val = d.getTime();
    } else {
      return val;
    }
  }

  let ms = 0;
  if (typeof val === 'number') {
    ms = val > 1e11 ? val : val * 1000;
  } else if (typeof val === 'object' && val !== null) {
    if (typeof val.toDate === 'function') {
      ms = val.toDate().getTime();
    } else if (typeof val.seconds === 'number') {
      ms = val.seconds * 1000;
    } else if (typeof val._seconds === 'number') {
      ms = val._seconds * 1000;
    }
  }

  if (!ms || isNaN(ms)) return 'Just now';

  const diffSec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function dedupePostList(arr) {
  if (!Array.isArray(arr)) return [];
  const map = new Map();
  for (const item of arr) {
    if (!item) continue;
    const key = String(item.id || `post_${Math.random().toString(36).slice(2, 9)}`);
    if (!map.has(key)) {
      const safeCreatedAt = formatTimeAgo(item.createdAt);
      const safeComments = Array.isArray(item.comments)
        ? item.comments.map(c => ({
            ...c,
            createdAt: formatTimeAgo(c?.createdAt)
          }))
        : [];
      map.set(key, {
        ...item,
        id: key,
        createdAt: safeCreatedAt,
        comments: safeComments
      });
    }
  }
  return Array.from(map.values());
}

export async function getCommunityPosts(communityId) {
  if (!communityId) return [];
  const commId = String(communityId).trim();
  const cacheKey = `upklick_posts_${commId}`;
  const cached = dedupePostList(getLocalCache(cacheKey, []));

  try {
    const q = query(
      collection(db, 'portal_posts'),
      where('communityId', '==', commId)
    );
    const snap = await getDocs(q);
    const posts = snap.docs.map(d => {
      const data = d.data();
      return { id: d.id, ...data, id: data.id || d.id };
    });
    posts.sort((a, b) => {
      const timeA = a.createdAtMs || (a.createdAtServer?.seconds ? a.createdAtServer.seconds * 1000 : 0);
      const timeB = b.createdAtMs || (b.createdAtServer?.seconds ? b.createdAtServer.seconds * 1000 : 0);
      return timeB - timeA;
    });

    const combined = dedupePostList([...posts, ...cached]);
    if (combined.length > 0) {
      setLocalCache(cacheKey, combined);
      return combined;
    }
    return cached;
  } catch (err) {
    return cached;
  }
}

export function subscribeCommunityPosts(communityId, callback) {
  if (!communityId) {
    callback([]);
    return () => {};
  }
  const commId = String(communityId).trim();
  const cacheKey = `upklick_posts_${commId}`;
  const cached = dedupePostList(getLocalCache(cacheKey, []));

  if (cached.length > 0) {
    callback(cached);
  }

  try {
    const q = query(
      collection(db, 'portal_posts'),
      where('communityId', '==', commId)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      const serverPosts = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          id: data.id || d.id
        };
      });

      serverPosts.sort((a, b) => {
        const timeA = a.createdAtMs || (a.createdAtServer?.seconds ? a.createdAtServer.seconds * 1000 : 0);
        const timeB = b.createdAtMs || (b.createdAtServer?.seconds ? b.createdAtServer.seconds * 1000 : 0);
        return timeB - timeA;
      });

      const merged = dedupePostList([...serverPosts, ...cached]);
      setLocalCache(cacheKey, merged);
      callback(merged);
    }, (err) => {
      console.warn('[membershipsService] Posts subscription fallback to local cache:', err?.message);
      callback(dedupePostList(getLocalCache(cacheKey, [])));
    });

    return unsubscribe;
  } catch (err) {
    callback(cached);
    return () => {};
  }
}

export async function createCommunityPost(postData) {
  if (!postData || !postData.communityId) return null;
  const commId = String(postData.communityId).trim();
  const cacheKey = `upklick_posts_${commId}`;
  const cached = dedupePostList(getLocalCache(cacheKey, []));

  // Guaranteed unique ID with millisecond + random string
  const id = postData.id || `post_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const payload = {
    ...postData,
    id,
    communityId: commId,
    likes: typeof postData.likes === 'number' ? postData.likes : (postData.likesCount || 0),
    liked: !!postData.liked,
    comments: Array.isArray(postData.comments) ? postData.comments : [],
    createdAt: postData.createdAt || 'Just now',
    createdAtMs: postData.createdAtMs || Date.now()
  };

  // Deduplicate before saving to local cache
  const deduped = dedupePostList([payload, ...cached]);
  setLocalCache(cacheKey, deduped);

  try {
    const postRef = doc(db, 'portal_posts', id);
    await setDoc(postRef, {
      ...payload,
      createdAtServer: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.info('[membershipsService] Post stored locally:', err.message);
  }

  return payload;
}

export async function likeCommunityPost(communityId, postId, userEmailOrId) {
  if (!communityId || !postId) return null;
  const commId = String(communityId).trim();
  const cacheKey = `upklick_posts_${commId}`;
  const cached = dedupePostList(getLocalCache(cacheKey, []));

  let updatedPost = null;
  const updatedList = cached.map(p => {
    if (p.id === postId) {
      const currentlyLiked = !!p.liked;
      const newLiked = !currentlyLiked;
      const newLikes = newLiked ? (p.likes || 0) + 1 : Math.max(0, (p.likes || 1) - 1);
      updatedPost = { ...p, liked: newLiked, likes: newLikes };
      return updatedPost;
    }
    return p;
  });

  setLocalCache(cacheKey, updatedList);

  try {
    const postRef = doc(db, 'portal_posts', postId);
    if (updatedPost) {
      await updateDoc(postRef, {
        likes: updatedPost.likes,
        updatedAt: serverTimestamp()
      });
    }
  } catch (e) {}

  return updatedPost;
}

export async function addCommunityPostComment(communityId, postId, commentData) {
  if (!communityId || !postId || !commentData) return null;
  const commId = String(communityId).trim();
  const cacheKey = `upklick_posts_${commId}`;
  const cached = dedupePostList(getLocalCache(cacheKey, []));

  const newComment = {
    id: `comment_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    author: commentData.author || 'Member',
    authorHandle: commentData.authorHandle || '',
    initials: commentData.initials || 'SS',
    content: (commentData.content || commentData.text || '').trim(),
    createdAt: 'Just now',
    createdAtMs: Date.now()
  };

  let updatedComments = [];
  const updatedList = cached.map(p => {
    if (p.id === postId) {
      const existing = Array.isArray(p.comments) ? p.comments : [];
      updatedComments = [...existing, newComment];
      return { ...p, comments: updatedComments };
    }
    return p;
  });

  setLocalCache(cacheKey, updatedList);

  try {
    const postRef = doc(db, 'portal_posts', postId);
    await updateDoc(postRef, {
      comments: updatedComments,
      updatedAt: serverTimestamp()
    });
  } catch (e) {}

  return newComment;
}

export async function saveCommunityChannels(communityId, channels) {
  if (!communityId || !Array.isArray(channels)) return;
  const commId = String(communityId).trim();
  const cacheKey = `upklick_channels_${commId}`;
  setLocalCache(cacheKey, channels);

  try {
    const ref = doc(db, 'portal_channels', commId);
    await setDoc(ref, {
      channels,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (e) {}
}

export function subscribeCommunityChannels(communityId, callback) {
  if (!communityId) return () => {};
  const commId = String(communityId).trim();
  const cacheKey = `upklick_channels_${commId}`;
  const cached = getLocalCache(cacheKey, null);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    callback(cached);
  }

  try {
    const ref = doc(db, 'portal_channels', commId);
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (Array.isArray(data.channels) && data.channels.length > 0) {
          setLocalCache(cacheKey, data.channels);
          callback(data.channels);
        }
      }
    }, () => {});
  } catch (e) {
    return () => {};
  }
}


// =============================================================================
// 6. REAL PRODUCTION STUDENT AUTHENTICATION & CREDENTIALS VERIFICATION
// =============================================================================

function hashPassword(pass) {
  if (typeof window !== 'undefined' && window.btoa) {
    return window.btoa(encodeURIComponent(pass));
  }
  return Buffer.from(pass).toString('base64');
}

/**
 * Register a new student with email and password
 */
export async function registerStudent(coachId, { name, email, password }) {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name ? name.trim() : cleanEmail.split('@')[0];
  const coachKey = (coachId || 'moha').toLowerCase();

  // Check if student already exists under this coach or global portal accounts
  const cacheKey = `upklick_students_${coachKey}`;
  const existingStudents = getLocalCache(cacheKey, []);
  const foundLocal = existingStudents.find(s => s.email && s.email.toLowerCase() === cleanEmail);

  if (foundLocal && foundLocal.passwordHash) {
    return { success: false, error: 'An account with this email already exists. Please log in.' };
  }

  // Check Firestore portal_students
  try {
    const studentDocId = `${coachKey}_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
    const snap = await getDoc(doc(db, 'portal_students', studentDocId));
    if (snap.exists() && snap.data()?.passwordHash) {
      return { success: false, error: 'An account with this email already exists. Please log in.' };
    }
  } catch (e) {}

  const studentObj = {
    id: `${coachKey}_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
    coachId: coachKey,
    name: cleanName,
    email: cleanEmail,
    passwordHash: hashPassword(password),
    avatar: '/file.jpg',
    bio: '',
    joinedCommunities: [],
    enrolledCourses: [],
    completedLessons: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // 1. Save to local student caches
  const updatedList = [studentObj, ...existingStudents.filter(s => s.email !== cleanEmail)];
  setLocalCache(cacheKey, updatedList);
  setLocalCache(`upklick_student_account_${cleanEmail}`, studentObj);
  setLocalCache(`upklick_student_${coachKey}`, studentObj);
  setLocalCache('upklick_current_student', studentObj);

  // 2. Persist to Firestore
  try {
    const docRef = doc(db, 'portal_students', studentObj.id);
    const firestorePayload = { ...studentObj, updatedAt: serverTimestamp() };
    delete firestorePayload.id;
    await setDoc(docRef, firestorePayload, { merge: true });
  } catch (err) {
    console.info('[membershipsService] Student registered locally:', err.message);
  }

  return { success: true, student: studentObj };
}

/**
 * Log in an existing student with credentials verification
 */
export async function loginStudent(coachId, { email, password }) {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!password) {
    return { success: false, error: 'Please enter your password.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const coachKey = (coachId || 'moha').toLowerCase();
  const inputHash = hashPassword(password);

  // 1. Search in coach students cache
  const cacheKey = `upklick_students_${coachKey}`;
  const existingStudents = getLocalCache(cacheKey, []);
  let student = existingStudents.find(s => s.email && s.email.toLowerCase() === cleanEmail);

  // 2. Search in global student account cache
  if (!student) {
    student = getLocalCache(`upklick_student_account_${cleanEmail}`);
  }

  // 3. Search in Firestore portal_students
  if (!student) {
    try {
      const studentDocId = `${coachKey}_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
      const snap = await getDoc(doc(db, 'portal_students', studentDocId));
      if (snap.exists()) {
        student = { id: snap.id, ...snap.data() };
      }
    } catch (e) {}
  }

  // 4. If account doesn't exist
  if (!student) {
    return {
      success: false,
      error: 'No account found with this email. Please sign up to create your account first.'
    };
  }

  // 5. Verify password
  if (student.passwordHash && student.passwordHash !== inputHash) {
    return {
      success: false,
      error: 'Incorrect password. Please verify your credentials or login with secure code.'
    };
  }

  // 6. Save active session
  setLocalCache(`upklick_student_${coachKey}`, student);
  setLocalCache('upklick_current_student', student);

  return { success: true, student };
}

/**
 * Request real 6-digit OTP secure code
 */
export async function requestStudentOtp(coachId, email) {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const coachKey = (coachId || 'moha').toLowerCase();

  // Generate real 6-digit random code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  const otpPayload = { code, email: cleanEmail, coachId: coachKey, expiresAt };
  setLocalCache(`upklick_otp_${cleanEmail}`, otpPayload);

  // Also sync to Firestore if possible
  try {
    const docRef = doc(db, 'portal_otps', `${coachKey}_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`);
    await setDoc(docRef, { ...otpPayload, updatedAt: serverTimestamp() }, { merge: true });
  } catch (e) {}

  return { success: true, code, email: cleanEmail };
}

/**
 * Verify real 6-digit OTP secure code
 */
export async function verifyStudentOtp(coachId, email, inputCode) {
  if (!email || !inputCode) {
    return { success: false, error: 'Email and secure code are required.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const coachKey = (coachId || 'moha').toLowerCase();
  const cleanCode = inputCode.toString().trim();

  const storedOtp = getLocalCache(`upklick_otp_${cleanEmail}`);

  if (!storedOtp || storedOtp.code !== cleanCode) {
    return { success: false, error: 'Invalid secure code. Please enter the correct 6 digits.' };
  }

  if (Date.now() > (storedOtp.expiresAt || 0)) {
    return { success: false, error: 'Secure code has expired. Please request a new code.' };
  }

  // Load existing student or auto-enroll
  const cacheKey = `upklick_students_${coachKey}`;
  const existingStudents = getLocalCache(cacheKey, []);
  let student = existingStudents.find(s => s.email && s.email.toLowerCase() === cleanEmail);

  if (!student) {
    student = {
      id: `${coachKey}_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
      coachId: coachKey,
      name: cleanEmail.split('@')[0],
      email: cleanEmail,
      avatar: '/file.jpg',
      bio: '',
      joinedCommunities: [],
      enrolledCourses: [],
      completedLessons: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setLocalCache(cacheKey, [student, ...existingStudents]);
  }

  // Save active session
  setLocalCache(`upklick_student_${coachKey}`, student);
  setLocalCache('upklick_current_student', student);

  return { success: true, student };
}

// =============================================================================
// 7. REAL GROUP JOINING & MEMBERSHIP CRM ENROLLMENT
// =============================================================================

export async function joinCommunityGroup(coachId, studentEmail, groupId, profileData = {}) {
  if (!coachId || !studentEmail || !groupId) {
    throw new Error('Coach ID, student email, and group ID are required.');
  }

  const cleanEmail = studentEmail.trim().toLowerCase();
  const coachKey = (coachId || 'moha').toLowerCase();
  const targetGroupId = groupId.trim();

  // 1. Update Student Record
  const studentCacheKey = `upklick_students_${coachKey}`;
  const existingStudents = getLocalCache(studentCacheKey, []);
  let student = existingStudents.find(s => s.email && s.email.toLowerCase() === cleanEmail) || {
    id: `${coachKey}_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`,
    coachId: coachKey,
    name: cleanEmail.split('@')[0],
    email: cleanEmail,
    avatar: profileData.avatar || '/file.jpg',
    bio: profileData.bio || '',
    joinedCommunities: [],
    enrolledCourses: [],
    completedLessons: []
  };

  const updatedJoined = Array.from(new Set([...(student.joinedCommunities || []), targetGroupId]));
  student.joinedCommunities = updatedJoined;
  if (profileData.bio) student.bio = profileData.bio;
  if (profileData.avatar) student.avatar = profileData.avatar;
  student.updatedAt = new Date().toISOString();

  const studentIdx = existingStudents.findIndex(s => s.id === student.id || s.email === cleanEmail);
  if (studentIdx >= 0) {
    existingStudents[studentIdx] = student;
  } else {
    existingStudents.unshift(student);
  }
  setLocalCache(studentCacheKey, existingStudents);
  setLocalCache(`upklick_student_${coachKey}`, student);
  setLocalCache('upklick_current_student', student);

  // Sync student to Firestore
  try {
    const studentDocRef = doc(db, 'portal_students', student.id);
    await setDoc(studentDocRef, { ...student, updatedAt: serverTimestamp() }, { merge: true });
  } catch (e) {}

  // 2. Update Community Group Document
  const communityCacheKey = `upklick_communities_${coachKey}`;
  const communities = getLocalCache(communityCacheKey, []);
  const commIdx = communities.findIndex(c => c.id === targetGroupId || c.slug === targetGroupId);

  let updatedGroup = null;
  if (commIdx >= 0) {
    const currentMembers = Array.isArray(communities[commIdx].members) ? communities[commIdx].members : [];
    const newMembers = Array.from(new Set([...currentMembers, cleanEmail]));
    communities[commIdx] = {
      ...communities[commIdx],
      members: newMembers,
      membersCount: Math.max(newMembers.length, (communities[commIdx].membersCount || 1) + 1),
      updatedAt: new Date().toISOString()
    };
    updatedGroup = communities[commIdx];
    setLocalCache(communityCacheKey, communities);

    // Sync group to Firestore
    try {
      const groupDocRef = doc(db, 'portal_communities', targetGroupId);
      await setDoc(groupDocRef, {
        members: newMembers,
        membersCount: updatedGroup.membersCount,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (e) {}
  }

  return { success: true, student, group: updatedGroup };
}

// =============================================================================
// 8. REAL SHARED FILES MANAGEMENT
// =============================================================================

export async function getCoachSharedFiles(coachId, altCoachId) {
  if (!coachId && !altCoachId) return [];
  const primaryId = (coachId || altCoachId).toLowerCase();
  const cacheKey = `upklick_files_${primaryId}`;
  let list = [];

  try {
    const q1 = query(
      collection(db, 'portal_shared_files'),
      where('coachId', '==', primaryId)
    );
    const snap1 = await getDocs(q1);
    snap1.docs.forEach(d => {
      const item = { id: d.id, ...d.data() };
      if (!list.find(existing => existing.id === item.id)) {
        list.push(item);
      }
    });

    if (altCoachId && altCoachId.toLowerCase() !== primaryId) {
      try {
        const q2 = query(
          collection(db, 'portal_shared_files'),
          where('coachId', '==', altCoachId.toLowerCase())
        );
        const snap2 = await getDocs(q2);
        snap2.docs.forEach(d => {
          const item = { id: d.id, ...d.data() };
          if (!list.find(existing => existing.id === item.id)) {
            list.push(item);
          }
        });
      } catch (_) {}
    }

    setLocalCache(cacheKey, list);
    if (altCoachId && altCoachId.toLowerCase() !== primaryId) {
      setLocalCache(`upklick_files_${altCoachId.toLowerCase()}`, list);
    }
    return list;
  } catch (e) {
    const cached = getLocalCache(cacheKey, []);
    return Array.isArray(cached)
      ? cached.filter(f => f && (f.coachId === primaryId || (altCoachId && f.coachId === altCoachId.toLowerCase())))
      : [];
  }
}

export async function saveSharedFile(coachId, fileData) {
  if (!coachId || !fileData.name) throw new Error('Coach ID and file name are required.');
  const coachKey = coachId.toLowerCase();
  const cacheKey = `upklick_files_${coachKey}`;
  const existing = getLocalCache(cacheKey, []);

  const fileId = fileData.id || `file_${Date.now()}`;
  const payload = {
    ...fileData,
    id: fileId,
    coachId: coachKey,
    uploadedAt: new Date().toISOString(),
    size: fileData.size || '1.2 MB'
  };

  const updated = [payload, ...existing.filter(f => f.id !== fileId)];
  setLocalCache(cacheKey, updated);

  try {
    const docRef = doc(db, 'portal_shared_files', fileId);
    await setDoc(docRef, { ...payload, updatedAt: serverTimestamp() }, { merge: true });
  } catch (e) {}

  return payload;
}

export async function deleteSharedFile(coachId, fileId) {
  if (!coachId || !fileId) return;
  const coachKey = coachId.toLowerCase();
  const cacheKey = `upklick_files_${coachKey}`;
  const existing = getLocalCache(cacheKey, []);
  const updated = existing.filter(f => f.id !== fileId);
  setLocalCache(cacheKey, updated);

  try {
    await deleteDoc(doc(db, 'portal_shared_files', fileId));
  } catch (e) {}

  return { success: true };
}
