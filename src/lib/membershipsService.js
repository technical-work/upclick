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
  portalTitle: 'UpKlick MasterClass Academy',
  portalTagline: 'بوابة النخبة للتعلم واحتراف المهارات وتطوير الأعمال مع التدريب المباشر',
  portalSlug: 'academy',
  logoUrl: '',
  bannerUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop',
  themeColor: '#FF6B35',
  welcomeMessage: 'مرحباً بك في الأكاديمية! يسعدنا انضمامك لرحلتنا التعليمية للوصول لأعلى مستويات الاحتراف.',
  whatsappNumber: '+201000000000',
  telegramUsername: '',
  isOpenRegistration: true, // Anyone with link can register
  showCommunities: true,
  showCourses: true,
  requirePasscode: false,
  portalPasscode: ''
};

// Rich cinema-grade masterclasses for live demonstration and immediate student value
export const SAMPLE_MASTERCLASS_COURSES = [
  {
    id: 'course_masterclass_marketing',
    title: 'ماستر كلاس التسويق الرقمي وبناء الحملات الإعلانية عالية التحويل',
    category: 'التسويق والإعلانات',
    level: 'احترافي (Mastery)',
    duration: '4.5 ساعات',
    rating: 4.95,
    studentCount: 1420,
    instructorName: 'Mohamed Hesham',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
    description: 'المنهج المتكامل لإطلاق وإدارة حملات إعلانية رابحة على منصات Meta و Google و TikTok، وضبط التتبع السحابي ومضاعفة العائد على الإنفاق ROAS.',
    badge: '🔥 الأكثر طلباً',
    modules: [
      {
        id: 'mod_mkt_1',
        title: 'الوحدة الأولى: استراتيجية الحملات وهندسة العروض التي لا تقاوم (Irresistible Offers)',
        lessons: [
          {
            id: 'les_mkt_1',
            title: '1. المدخل الشامل: كيف يفكر المسوق المليوني وهندسة العرض الرابح',
            duration: '14:20',
            videoUrl: 'https://www.youtube.com/watch?v=kXYiU_JCYtU',
            notes: '📌 أهم نقاط المحاضرة:\n1. تحديد الـ Core Offer بدقة متناهية وحساب الـ Customer Lifetime Value (LTV).\n2. فهم دوافع الشراء النفسية لجمهورك المستهدف والتغلب على التردد.\n3. صياغة العنوان الجذاب (Hook) الذي يوقف تمرير الشاشة في أول ثانيتين.',
            attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            attachmentName: 'دليل_هندسة_العروض_المقنعة_2026.pdf',
            resources: ['نموذج AIDA الإعلاني', 'قائمة تدقيق العرض التجاري', 'ملف حساب الـ ROAS']
          },
          {
            id: 'les_mkt_2',
            title: '2. كتابة النصوص الإعلانية المقنعة (Copywriting Frameworks: AIDA & PAS)',
            duration: '18:45',
            videoUrl: 'https://www.youtube.com/watch?v=2b9x7o7y0w4',
            notes: '📌 استراتيجيات كتابة الإعلانات المقنعة:\n• خطاف الانتباه (Attention Hook)\n• تحديد المشكلة وتضخيمها بالأرقام الواقعية (Agitation)\n• تقديم الحل كخيار وحيد مثالي (Solution & Offer)\n• نداء العمل القاطع والصريح (Direct CTA).',
            attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            attachmentName: 'نماذج_كتابة_الإعلانات_الجاهزة.pdf',
            resources: ['50 فكرة إعلانية جاهزة', 'سكريبتات الفيديوهات القصيرة']
          }
        ]
      },
      {
        id: 'mod_mkt_2',
        title: 'الوحدة الثانية: التتبع الذكي والـ CAPI وإعادة الاستهداف متعدد المراحل',
        lessons: [
          {
            id: 'les_mkt_3',
            title: '3. ضبط الـ Pixel و Conversions API بدقة 100% لتجاوز حظر الكوكيز',
            duration: '22:15',
            videoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
            notes: 'دليل الربط التقني الكامل لتتبع المبيعات والبيكسل على مستوى الخادم (Server-Side Tracking) لضمان دقة التقارير وتحسين خوارزميات التوصيل الإعلاني.',
            attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            attachmentName: 'تشيك_ليست_ضبط_البيكسل_والتتبع.pdf',
            resources: ['دليل إعداد CAPI', 'أداة اختبار الأحداث']
          },
          {
            id: 'les_mkt_4',
            title: '4. سلاسل إعادة الاستهداف الذكية (Smart Omnichannel Retargeting)',
            duration: '19:30',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            notes: 'كيف تبني مسار إعلاني متعدد الحلقات للعميل الذي زار موقعك، وتقديم حوافز تدريجية عبر إعلانات مخصصة ترفع نسبة التحويل بنسبة +320%.',
            attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            attachmentName: 'خريطة_مسار_إعادة_الاستهداف.pdf',
            resources: ['مخطط مسار المبيعات']
          }
        ]
      }
    ]
  },
  {
    id: 'course_masterclass_sales',
    title: 'فن إغلاق الصفقات الكبرى والمبيعات الاستشارية (High-Ticket Sales Mastery)',
    category: 'المبيعات وتطوير الأعمال',
    level: 'متقدم (Advanced)',
    duration: '3.8 ساعات',
    rating: 5.0,
    studentCount: 980,
    instructorName: 'Mohamed Hesham',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1200&auto=format&fit=crop',
    description: 'البروتوكول النفسي والعملي لإدارة مكالمات البيع الاستشاري، تفكيك اعتراضات الأسعار، وإبرام عقود خدمات ومنتجات عالية القيمة بثقة مطلقة.',
    badge: '💎 برنامج نخبوي',
    modules: [
      {
        id: 'mod_sales_1',
        title: 'الوحدة الأولى: هندسة مكالمة البيع الاستشارية (The Diagnostic Protocol)',
        lessons: [
          {
            id: 'les_sales_1',
            title: '1. بناء السلطة والمصداقية المطلقة في الدقائق الخمس الأولى من الجلسة',
            duration: '16:15',
            videoUrl: 'https://www.youtube.com/watch?v=kXYiU_JCYtU',
            notes: 'القواعد السيكولوجية لوضع نفسك في موقع "الطبيب المشخص" بدلاً من "البائع المتوسل"، وتحديد جدول أعمال المكالمة باحترافية كاملة.',
            attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            attachmentName: 'سكريبت_افتتاح_مكالمة_البيع_الاستشارية.pdf',
            resources: ['جدول أسئلة التشخيص', 'نموذج تقييم العميل المحتمل']
          },
          {
            id: 'les_sales_2',
            title: '2. تفكيك وتجاوز اعتراض "السعر مرتفع" و"سأفكر في الأمر لاحقاً"',
            duration: '21:00',
            videoUrl: 'https://www.youtube.com/watch?v=2b9x7o7y0w4',
            notes: 'كيف تحول مناقشة السعر إلى نقاش حول تكلفة عدم اتخاذ القرار ومعدل العائد الاستثماري الحقيقي (Cost of Inaction).',
            attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            attachmentName: 'مصفوفة_الرد_على_كافة_الاعتراضات.pdf',
            resources: ['بطاقات الردود السريعة على الاعتراضات']
          }
        ]
      }
    ]
  },
  {
    id: 'course_masterclass_ai',
    title: 'أتمتة الأعمال والذكاء الاصطناعي للمؤسسين والمدربين (AI Operations)',
    category: 'الذكاء الاصطناعي والأتمتة',
    level: 'شامل لكافة المستويات',
    duration: '5.2 ساعات',
    rating: 4.92,
    studentCount: 1650,
    instructorName: 'Mohamed Hesham',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    description: 'بناء أنظمة آلية ذكية لخدمة العملاء، ومتابعة الحجوزات، وأتمتة مسارات التسويق والتدريب لتعمل شركتك ذاتياً على مدار 24 ساعة.',
    badge: '⚡ أحدث تقنيات 2026',
    modules: [
      {
        id: 'mod_ai_1',
        title: 'الوحدة الأولى: بناء مساعدي الذكاء الاصطناعي التفاعليين (Custom AI Agents)',
        lessons: [
          {
            id: 'les_ai_1',
            title: '1. بناء وتدريب الـ AI Agent الخاص بأكاديميتك والرد التلقائي على العملاء',
            duration: '24:40',
            videoUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U',
            notes: 'ربط قاعدة بيانات الأكاديمية بنظام ذكاء اصطناعي فائق السرعة يجيب على أسئلة الطلاب ويوجههم للدروس المناسبة آلياً.',
            attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            attachmentName: 'مخطط_سير_العمل_الآلي_AI_Agents.pdf',
            resources: ['Prompts احترافية لتوجيه الذكاء الاصطناعي']
          }
        ]
      }
    ]
  }
];

export const SAMPLE_COMMUNITY_POSTS = [
  {
    id: 'post_pinned_coach',
    authorName: 'Mohamed Hesham (المدرب)',
    isCoach: true,
    isPinned: true,
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 3600 },
    content: '🎉 مرحباً بكم جميعاً في صالون مجتمع الأكاديمية VIP!\n\nهذا المجتمع مخصص لتبادل الخبرات، وطرح الاستفسارات حول الدروس وتطبيقاتها العملية، ومشاركة قصص النجاح وإغلاق الصفقات.\n\n👇 شاركونا في التعليقات: ما هو التحدي الأكبر أو الهدف الرئيسي الذي تعمل عليه هذا الأسبوع؟',
    likesCount: 38,
    comments: [
      {
        id: 'c1',
        authorName: 'أحمد محمود',
        content: 'شكراً جزيلاً كوتش محمد على هذا الماستر كلاس المتكامل! طبقت استراتيجية الإعلانات في الدرس الثاني وحققنا اليوم أعلى نسبة مبيعات منذ بداية الشهر 🚀',
        createdAt: 'منذ ساعة'
      },
      {
        id: 'c2',
        authorName: 'سارة خالد',
        content: 'ملفات ونماذج العمل المرفقة مع الدروس لا تُقدّر بثمن، سهلت عليّ إعداد جلسات الاستشارة جداً!',
        createdAt: 'منذ ساعتين'
      }
    ]
  },
  {
    id: 'post_student_discussion',
    authorName: 'طارق عبد الله',
    isCoach: false,
    isPinned: false,
    createdAt: { seconds: Math.floor(Date.now() / 1000) - 7200 },
    content: '💡 سؤال للنقاش مع الزملاء: بخصوص ضبط التتبع السحابي CAPI في كورس التسويق، هل واجه أحدكم أي تأخير في ظهور الأحداث في Ads Manager خلال أول 24 ساعة؟',
    likesCount: 14,
    comments: [
      {
        id: 'c3',
        authorName: 'Mohamed Hesham (المدرب)',
        isCoach: true,
        content: 'طبيعي جداً يا طارق في أول 24-48 ساعة أن يحدث تأخير طفيف في معالجة خوارزمية Attribution، لكن التتبع السحابي يسجل الحدث فوراً في الـ Event History.',
        createdAt: 'منذ 40 دقيقة'
      }
    ]
  }
];

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

  // Check if any portal in localStorage matches this slug
  if (typeof window !== 'undefined') {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('upklick_portal_')) {
        try {
          const item = JSON.parse(localStorage.getItem(k));
          if (item?.portalSlug?.toLowerCase() === coachIdOrSlug.toLowerCase()) {
            return item;
          }
        } catch (e) {}
      }
    }
  }

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

    return cached || {
      ...DEFAULT_PORTAL_SETTINGS,
      coachId: coachIdOrSlug,
      portalTitle: `${coachIdOrSlug.toUpperCase()} MasterClass Academy`,
      portalSlug: coachIdOrSlug.toLowerCase()
    };
  } catch (err) {
    return cached || {
      ...DEFAULT_PORTAL_SETTINGS,
      coachId: coachIdOrSlug,
      portalTitle: `${coachIdOrSlug.toUpperCase()} MasterClass Academy`,
      portalSlug: coachIdOrSlug.toLowerCase()
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
  if (!coachId) return SAMPLE_MASTERCLASS_COURSES;
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
    if (cached && cached.length > 0) return cached;

    // Check if there are any cached courses under any key in localStorage
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('upklick_courses_')) {
          try {
            const list = JSON.parse(localStorage.getItem(k));
            if (Array.isArray(list) && list.length > 0) {
              return list;
            }
          } catch (e) {}
        }
      }
    }

    return SAMPLE_MASTERCLASS_COURSES;
  } catch (err) {
    if (cached && cached.length > 0) return cached;
    // Check fallback in any localStorage course list
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('upklick_courses_')) {
          try {
            const list = JSON.parse(localStorage.getItem(k));
            if (Array.isArray(list) && list.length > 0) {
              return list;
            }
          } catch (e) {}
        }
      }
    }
    return SAMPLE_MASTERCLASS_COURSES;
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
  const defaultCommunity = [{
    id: 'vip_lounge',
    coachId: coachId || 'vip',
    name: 'صالون النقاشات الحصري VIP',
    icon: '💎',
    description: 'مجتمع الطلاب والنقاشات التفاعلية المباشرة مع المدرب',
    memberCount: 248
  }];

  if (!coachId) return defaultCommunity;
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
    return (cached && cached.length > 0) ? cached : defaultCommunity;
  } catch (err) {
    return (cached && cached.length > 0) ? cached : defaultCommunity;
  }
}

export function subscribeCoachCommunities(coachId, callback) {
  const defaultCommunity = [{
    id: 'vip_lounge',
    coachId: coachId || 'vip',
    name: 'صالون النقاشات الحصري VIP',
    icon: '💎',
    description: 'مجتمع الطلاب والنقاشات التفاعلية المباشرة مع المدرب',
    memberCount: 248
  }];

  if (!coachId) {
    callback(defaultCommunity);
    return () => {};
  }
  const cacheKey = `upklick_communities_${coachId}`;
  
  const cached = getLocalCache(cacheKey, []);
  callback(cached.length > 0 ? cached : defaultCommunity);

  try {
    const q = query(
      collection(db, 'portal_communities'),
      where('coachId', '==', coachId)
    );
    return onSnapshot(q, (snap) => {
      const communities = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const list = communities.length > 0 ? communities : defaultCommunity;
      setLocalCache(cacheKey, list);
      callback(list);
    }, (err) => {
      callback(getLocalCache(cacheKey, defaultCommunity));
    });
  } catch (err) {
    callback(cached.length > 0 ? cached : defaultCommunity);
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
  if (!communityId) return SAMPLE_COMMUNITY_POSTS;
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
    return (cached && cached.length > 0) ? cached : SAMPLE_COMMUNITY_POSTS;
  } catch (err) {
    return (cached && cached.length > 0) ? cached : SAMPLE_COMMUNITY_POSTS;
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
