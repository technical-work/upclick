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

// Default initial portal settings for a coach
export const DEFAULT_PORTAL_SETTINGS = {
  portalTitle: 'UpKlick Academy',
  portalTagline: 'Learn, grow and master skills with exclusive mentorship',
  portalSlug: 'academy',
  logoUrl: '',
  bannerUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop',
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
  const cacheKey = `upklick_portal_${coachIdOrSlug.toLowerCase()}`;
  const cached = getLocalCache(cacheKey);

  try {
    // Check by doc ID first (coachId)
    const docRef = doc(db, 'coach_portals', coachIdOrSlug);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const merged = { id: snap.id, ...DEFAULT_PORTAL_SETTINGS, ...snap.data() };
      setLocalCache(cacheKey, merged);
      return merged;
    }

    // Otherwise search by portalSlug
    const q = query(
      collection(db, 'coach_portals'),
      where('portalSlug', '==', coachIdOrSlug.toLowerCase())
    );
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const first = querySnap.docs[0];
      const merged = { id: first.id, ...DEFAULT_PORTAL_SETTINGS, ...first.data() };
      setLocalCache(cacheKey, merged);
      return merged;
    }

    // Check if coach exists in users collection
    try {
      const userDoc = await getDoc(doc(db, 'users', coachIdOrSlug));
      if (userDoc.exists()) {
        const u = userDoc.data();
        const synthesized = {
          ...DEFAULT_PORTAL_SETTINGS,
          coachId: coachIdOrSlug,
          portalTitle: `${u.name || u.email?.split('@')[0] || 'Coach'} Academy`,
          portalSlug: (u.name || u.email?.split('@')[0] || 'coach').toLowerCase().replace(/\s+/g, '-')
        };
        setLocalCache(cacheKey, synthesized);
        return synthesized;
      }
    } catch (_) {}

    return cached || DEFAULT_PORTAL_SETTINGS;
  } catch (err) {
    // If permission or network issue, fallback gracefully to cached settings
    return cached || {
      ...DEFAULT_PORTAL_SETTINGS,
      coachId: coachIdOrSlug,
      portalTitle: `${coachIdOrSlug} Academy`,
      portalSlug: coachIdOrSlug.toLowerCase().replace(/\s+/g, '-')
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
export async function getCoachCourses(coachId) {
  if (!coachId) return [];
  const cacheKey = `upklick_courses_${coachId}`;
  const cached = getLocalCache(cacheKey, []);

  try {
    const q = query(
      collection(db, 'courses'),
      where('coachId', '==', coachId)
    );
    const snap = await getDocs(q);
    const courses = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (courses.length > 0) {
      setLocalCache(cacheKey, courses);
      return courses;
    }
    return cached;
  } catch (err) {
    return cached;
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
  const cached = getLocalCache(cacheKey, []);

  try {
    const q = query(
      collection(db, 'portal_students'),
      where('coachId', '==', coachId)
    );
    const snap = await getDocs(q);
    const students = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (students.length > 0) {
      setLocalCache(cacheKey, students);
      return students;
    }
    return cached;
  } catch (err) {
    return cached;
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
export async function getCoachCommunities(coachId) {
  if (!coachId) return [];
  const cacheKey = `upklick_communities_${coachId}`;
  const cached = getLocalCache(cacheKey, []);

  try {
    const q = query(
      collection(db, 'portal_communities'),
      where('coachId', '==', coachId)
    );
    const snap = await getDocs(q);
    const communities = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (communities.length > 0) {
      setLocalCache(cacheKey, communities);
      return communities;
    }
    return cached;
  } catch (err) {
    return cached;
  }
}

export function subscribeCoachCommunities(coachId, callback) {
  if (!coachId) return () => {};
  const cacheKey = `upklick_communities_${coachId}`;
  
  const cached = getLocalCache(cacheKey, []);
  callback(cached);

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
    callback(cached);
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

export async function getCommunityPosts(communityId) {
  if (!communityId) return [];
  const cacheKey = `upklick_posts_${communityId}`;
  const cached = getLocalCache(cacheKey, []);

  try {
    const q = query(
      collection(db, 'portal_posts'),
      where('communityId', '==', communityId)
    );
    const snap = await getDocs(q);
    const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    posts.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    if (posts.length > 0) {
      setLocalCache(cacheKey, posts);
      return posts;
    }
    return cached;
  } catch (err) {
    return cached;
  }
}

export async function createCommunityPost(postData) {
  const cacheKey = `upklick_posts_${postData.communityId}`;
  const cached = getLocalCache(cacheKey, []);
  
  const id = `post_${Date.now()}`;
  const payload = {
    ...postData,
    id,
    likesCount: 0,
    commentsCount: 0,
    createdAt: { seconds: Math.floor(Date.now() / 1000) }
  };

  setLocalCache(cacheKey, [payload, ...cached]);

  try {
    const ref = await addDoc(collection(db, 'portal_posts'), {
      ...payload,
      createdAt: serverTimestamp()
    });
    return { ...payload, id: ref.id };
  } catch (err) {
    return payload;
  }
}
