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

// 1. Portal Settings
export async function getCoachPortalSettings(coachIdOrSlug) {
  if (!coachIdOrSlug) return DEFAULT_PORTAL_SETTINGS;
  try {
    // Check by doc ID first (coachId)
    const docRef = doc(db, 'coach_portals', coachIdOrSlug);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...DEFAULT_PORTAL_SETTINGS, ...snap.data() };
    }

    // Otherwise search by portalSlug
    const q = query(
      collection(db, 'coach_portals'),
      where('portalSlug', '==', coachIdOrSlug.toLowerCase())
    );
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const first = querySnap.docs[0];
      return { id: first.id, ...DEFAULT_PORTAL_SETTINGS, ...first.data() };
    }

    // If still not found, check if coach exists in users collection to synthesize defaults
    const userDoc = await getDoc(doc(db, 'users', coachIdOrSlug));
    if (userDoc.exists()) {
      const u = userDoc.data();
      return {
        ...DEFAULT_PORTAL_SETTINGS,
        coachId: coachIdOrSlug,
        portalTitle: `${u.name || u.email?.split('@')[0] || 'Coach'} Academy`,
        portalSlug: (u.name || u.email?.split('@')[0] || 'coach').toLowerCase().replace(/\s+/g, '-')
      };
    }

    return DEFAULT_PORTAL_SETTINGS;
  } catch (err) {
    console.warn('[membershipsService] Error fetching portal settings:', err.message);
    return DEFAULT_PORTAL_SETTINGS;
  }
}

export async function saveCoachPortalSettings(coachId, settings) {
  if (!coachId) throw new Error('Coach ID is required');
  const docRef = doc(db, 'coach_portals', coachId);
  const data = {
    ...settings,
    coachId,
    portalSlug: (settings.portalSlug || 'academy').toLowerCase().trim(),
    updatedAt: serverTimestamp()
  };
  await setDoc(docRef, data, { merge: true });
  return data;
}

// 2. Courses CRUD
export async function getCoachCourses(coachId) {
  if (!coachId) return [];
  try {
    const q = query(
      collection(db, 'courses'),
      where('coachId', '==', coachId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('[membershipsService] Error fetching courses:', err.message);
    return [];
  }
}

export function subscribeCoachCourses(coachId, callback) {
  if (!coachId) return () => {};
  const q = query(
    collection(db, 'courses'),
    where('coachId', '==', coachId)
  );
  return onSnapshot(q, (snap) => {
    const courses = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(courses);
  }, (err) => {
    console.warn('[membershipsService] Courses subscription warning:', err.message);
  });
}

export async function saveCourse(coachId, courseData) {
  if (!coachId) throw new Error('Coach ID is required');
  const courseId = courseData.id;
  const payload = {
    ...courseData,
    coachId,
    updatedAt: serverTimestamp()
  };
  delete payload.id;

  if (courseId) {
    const ref = doc(db, 'courses', courseId);
    await setDoc(ref, payload, { merge: true });
    return { id: courseId, ...payload };
  } else {
    payload.createdAt = serverTimestamp();
    payload.studentCount = 0;
    const ref = await addDoc(collection(db, 'courses'), payload);
    return { id: ref.id, ...payload };
  }
}

export async function deleteCourse(courseId) {
  if (!courseId) return;
  await deleteDoc(doc(db, 'courses', courseId));
}

// 3. Students Management
export async function getCoachStudents(coachId) {
  if (!coachId) return [];
  try {
    const q = query(
      collection(db, 'portal_students'),
      where('coachId', '==', coachId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('[membershipsService] Error fetching students:', err.message);
    return [];
  }
}

export function subscribeCoachStudents(coachId, callback) {
  if (!coachId) return () => {};
  const q = query(
    collection(db, 'portal_students'),
    where('coachId', '==', coachId)
  );
  return onSnapshot(q, (snap) => {
    const students = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(students);
  }, (err) => {
    console.warn('[membershipsService] Students subscription warning:', err.message);
  });
}

export async function enrollStudent(coachId, studentData) {
  if (!coachId || !studentData.email) throw new Error('Coach ID & email are required');
  const cleanEmail = studentData.email.toLowerCase().trim();
  const studentDocId = `${coachId}_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
  const docRef = doc(db, 'portal_students', studentDocId);

  const existing = await getDoc(docRef);
  const enrolledCourses = Array.from(new Set([
    ...(existing.exists() ? existing.data().enrolledCourses || [] : []),
    ...(studentData.enrolledCourses || [])
  ]));

  const payload = {
    coachId,
    email: cleanEmail,
    name: studentData.name || cleanEmail.split('@')[0],
    enrolledCourses,
    status: studentData.status || 'active',
    updatedAt: serverTimestamp()
  };

  if (!existing.exists()) {
    payload.createdAt = serverTimestamp();
    payload.completedLessons = {};
    payload.progress = {};
  }

  await setDoc(docRef, payload, { merge: true });
  return { id: studentDocId, ...payload };
}

// 4. Progress Tracking
export async function updateStudentLessonProgress(coachId, studentEmail, courseId, lessonId, isCompleted = true) {
  if (!coachId || !studentEmail || !courseId || !lessonId) return;
  const cleanEmail = studentEmail.toLowerCase().trim();
  const studentDocId = `${coachId}_${cleanEmail.replace(/[^a-z0-9]/g, '_')}`;
  const docRef = doc(db, 'portal_students', studentDocId);

  const snap = await getDoc(docRef);
  let currentCompleted = [];
  if (snap.exists()) {
    currentCompleted = snap.data().completedLessons?.[courseId] || [];
  }

  let updatedCompleted;
  if (isCompleted) {
    updatedCompleted = Array.from(new Set([...currentCompleted, lessonId]));
  } else {
    updatedCompleted = currentCompleted.filter(id => id !== lessonId);
  }

  // Calculate progress percentage
  const courseDoc = await getDoc(doc(db, 'courses', courseId));
  let totalLessons = 1;
  if (courseDoc.exists()) {
    const modules = courseDoc.data().modules || [];
    totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 1;
  }
  const progressPercent = Math.min(100, Math.round((updatedCompleted.length / totalLessons) * 100));

  await setDoc(docRef, {
    completedLessons: {
      ...(snap.exists() ? snap.data().completedLessons || {} : {}),
      [courseId]: updatedCompleted
    },
    progress: {
      ...(snap.exists() ? snap.data().progress || {} : {}),
      [courseId]: progressPercent
    },
    lastActiveAt: serverTimestamp()
  }, { merge: true });

  return { progressPercent, completedLessons: updatedCompleted };
}

// 5. Communities & Discussions
export async function getCoachCommunities(coachId) {
  if (!coachId) return [];
  try {
    const q = query(
      collection(db, 'portal_communities'),
      where('coachId', '==', coachId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn('[membershipsService] Error fetching communities:', err.message);
    return [];
  }
}

export function subscribeCoachCommunities(coachId, callback) {
  if (!coachId) return () => {};
  const q = query(
    collection(db, 'portal_communities'),
    where('coachId', '==', coachId)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, (err) => console.warn('[membershipsService] Communities warning:', err.message));
}

export async function saveCommunityGroup(coachId, groupData) {
  if (!coachId) throw new Error('Coach ID is required');
  const payload = {
    ...groupData,
    coachId,
    updatedAt: serverTimestamp()
  };
  if (groupData.id) {
    const id = groupData.id;
    delete payload.id;
    await setDoc(doc(db, 'portal_communities', id), payload, { merge: true });
    return { id, ...payload };
  } else {
    payload.createdAt = serverTimestamp();
    payload.memberCount = payload.memberCount || 1;
    const ref = await addDoc(collection(db, 'portal_communities'), payload);
    return { id: ref.id, ...payload };
  }
}

export async function getCommunityPosts(communityId) {
  if (!communityId) return [];
  try {
    const q = query(
      collection(db, 'portal_posts'),
      where('communityId', '==', communityId)
    );
    const snap = await getDocs(q);
    const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    posts.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
    return posts;
  } catch (err) {
    console.warn('[membershipsService] Error fetching posts:', err.message);
    return [];
  }
}

export async function createCommunityPost(postData) {
  const payload = {
    ...postData,
    likesCount: 0,
    commentsCount: 0,
    createdAt: serverTimestamp()
  };
  const ref = await addDoc(collection(db, 'portal_posts'), payload);
  return { id: ref.id, ...payload };
}
