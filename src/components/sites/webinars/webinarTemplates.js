import { createCanvasForWebinarPage, DEFAULT_PAGE } from '@/lib/builder/elementRegistry';

export const PREBUILT_WEBINAR_TEMPLATES = [
  {
    id: 'tpl_ai_masterclass',
    name: 'AI & Business Growth Masterclass',
    nameAr: 'ماستركلاس نمو الأعمال بالذكاء الاصطناعي',
    category: 'Business & AI',
    description: 'High-converting 4-step webinar funnel designed for live workshops, masterclasses, and digital product launches.',
    descriptionAr: 'مسار ويبينار متكامل من 4 خطوات لورش العمل المباشرة والمسجلة وإطلاق المنتجات الرقمية والتدريبية.',
    thumbnail: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
    type: 'on_demand',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    pages: [
      {
        id: 'p_reg',
        name: 'Registration Page',
        path: '/register',
        type: 'registration',
        page: { ...DEFAULT_PAGE, title: 'Reserve Seat | AI Growth Masterclass' }
      },
      {
        id: 'p_conf',
        name: 'Confirmation Page',
        path: '/thank-you',
        type: 'confirmation',
        page: { ...DEFAULT_PAGE, title: 'Seat Confirmed | AI Growth Masterclass' }
      },
      {
        id: 'p_broadcast',
        name: 'Webinar Broadcast Room',
        path: '/watch',
        type: 'broadcast',
        page: { ...DEFAULT_PAGE, title: 'Live Broadcast Room | Masterclass' }
      },
      {
        id: 'p_replay',
        name: 'Replay & Special Offer',
        path: '/replay',
        type: 'replay',
        page: { ...DEFAULT_PAGE, title: 'Masterclass Replay & Limited Offer' }
      }
    ]
  },
  {
    id: 'tpl_ecommerce_secrets',
    name: 'E-Commerce 7-Figure Scaling Secrets',
    nameAr: 'أسرار مضاعفة مبيعات التجارة الإلكترونية',
    category: 'E-Commerce',
    description: 'Specialized webinar funnel for online store owners, dropshippers, and retail brands.',
    descriptionAr: 'مسار ويبينار مخصص لأصحاب المتاجر الإلكترونية لزيادة المبيعات ومعدلات التحويل وتوسيع التجارة.',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    type: 'live',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    pages: [
      {
        id: 'p_reg',
        name: 'Registration Page',
        path: '/register',
        type: 'registration',
        page: { ...DEFAULT_PAGE, title: 'Register | E-Commerce Scaling Secrets' }
      },
      {
        id: 'p_conf',
        name: 'Confirmation Page',
        path: '/thank-you',
        type: 'confirmation',
        page: { ...DEFAULT_PAGE, title: 'Confirmation | E-Commerce Scaling Secrets' }
      },
      {
        id: 'p_broadcast',
        name: 'Webinar Broadcast Room',
        path: '/watch',
        type: 'broadcast',
        page: { ...DEFAULT_PAGE, title: 'Live Stream | E-Commerce Secrets' }
      },
      {
        id: 'p_replay',
        name: 'Replay & Special Offer',
        path: '/replay',
        type: 'replay',
        page: { ...DEFAULT_PAGE, title: 'Replay & Accelerator Discount' }
      }
    ]
  },
  {
    id: 'tpl_marketing_funnels',
    name: 'High-Ticket Client Acquisition Blueprint',
    nameAr: 'استراتيجيات جذب العملاء ذوي القيمة العالية',
    category: 'Marketing & Agency',
    description: 'Designed for agencies, coaches, and B2B service providers to close high-ticket clients on autopilot.',
    descriptionAr: 'مخطط جذب وإغلاق عقود العملاء الكبار مخصص للوكالات الإعلانية والمدربين والشركات الخدمية.',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    type: 'on_demand',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    pages: [
      {
        id: 'p_reg',
        name: 'Registration Page',
        path: '/register',
        type: 'registration',
        page: { ...DEFAULT_PAGE, title: 'Register | High-Ticket Client Blueprint' }
      },
      {
        id: 'p_conf',
        name: 'Confirmation Page',
        path: '/thank-you',
        type: 'confirmation',
        page: { ...DEFAULT_PAGE, title: 'Registered | Check Calendar' }
      },
      {
        id: 'p_broadcast',
        name: 'Webinar Broadcast Room',
        path: '/watch',
        type: 'broadcast',
        page: { ...DEFAULT_PAGE, title: 'Workshop Stream | High-Ticket Blueprint' }
      },
      {
        id: 'p_replay',
        name: 'Replay & Special Offer',
        path: '/replay',
        type: 'replay',
        page: { ...DEFAULT_PAGE, title: 'Replay & Agency Growth Offer' }
      }
    ]
  },
  {
    id: 'tpl_realestate_summit',
    name: 'Real Estate Wealth & Investment Summit',
    nameAr: 'قمة الاستثمار العقاري وصناعة الثروة',
    category: 'Real Estate & Wealth',
    description: 'Comprehensive funnel for real estate advisors, property developers, and wealth management seminars.',
    descriptionAr: 'مسار ويبينار للمطورين والمستشارين العقاريين وندوات الاستثمار وإدارة الأصول العقارية.',
    thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    type: 'live',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    pages: [
      {
        id: 'p_reg',
        name: 'Registration Page',
        path: '/register',
        type: 'registration',
        page: { ...DEFAULT_PAGE, title: 'Register | Real Estate Summit' }
      },
      {
        id: 'p_conf',
        name: 'Confirmation Page',
        path: '/thank-you',
        type: 'confirmation',
        page: { ...DEFAULT_PAGE, title: 'Confirmed | Real Estate Summit' }
      },
      {
        id: 'p_broadcast',
        name: 'Webinar Broadcast Room',
        path: '/watch',
        type: 'broadcast',
        page: { ...DEFAULT_PAGE, title: 'Live Summit Room | Broadcast' }
      },
      {
        id: 'p_replay',
        name: 'Replay & Special Offer',
        path: '/replay',
        type: 'replay',
        page: { ...DEFAULT_PAGE, title: 'Summit Replay & VIP Package' }
      }
    ]
  }
];

export function createWebinarFromTemplate({
  templateId,
  webinarName = '',
  webinarType = 'on_demand', // 'on_demand' | 'live'
  selectedForm = 'Default Webinar Registration Form',
  videoUrl = '',
  accountUid = ''
}) {
  const template = PREBUILT_WEBINAR_TEMPLATES.find(t => t.id === templateId) || PREBUILT_WEBINAR_TEMPLATES[0];
  const finalName = webinarName.trim() || template.name;
  const nowStr = new Date().toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const webinarId = `webinar_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const resolvedVideo = videoUrl.trim() || template.videoUrl;

  const pages = template.pages.map((p, idx) => ({
    ...p,
    id: `wbp_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
    views: 0,
    optins: 0,
    orders: 0,
    canvas: createCanvasForWebinarPage(p.type, finalName, {
      name: finalName,
      type: webinarType,
      videoUrl: resolvedVideo
    })
  }));

  return {
    id: webinarId,
    name: finalName,
    type: webinarType,
    formName: selectedForm,
    videoUrl: resolvedVideo,
    category: template.category,
    lastUpdated: nowStr,
    ownerUid: accountUid,
    published: false,
    domain: '',
    domainStatus: '',
    pages: pages,
    attendees: [],
    stats: {
      totalViews: 0,
      registrations: 0,
      attendanceRate: '0%',
      replayViews: 0,
      orders: 0,
      conversionRate: '0%',
      revenue: '$0'
    },
    settings: {
      chatEnabled: true,
      autoRedirectUrl: '/replay',
      countdownDurationMinutes: 60,
      seoTitle: finalName,
      seoDescription: template.description
    }
  };
}

export function createBlankWebinar({
  webinarName = 'Webinar Funnel',
  webinarType = 'on_demand',
  selectedForm = 'Default Webinar Registration Form',
  videoUrl = '',
  accountUid = ''
}) {
  const finalName = webinarName.trim() || 'New Webinar Funnel';
  const nowStr = new Date().toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const webinarId = `webinar_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const resolvedVideo = videoUrl.trim() || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

  const defaultStepTypes = [
    { type: 'registration', name: 'Registration Page', path: '/register' },
    { type: 'confirmation', name: 'Confirmation Page', path: '/thank-you' },
    { type: 'broadcast', name: 'Broadcast Room', path: '/watch' },
    { type: 'replay', name: 'Replay & Offer', path: '/replay' }
  ];

  const pages = defaultStepTypes.map((step, idx) => ({
    id: `wbp_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
    name: step.name,
    path: step.path,
    type: step.type,
    views: 0,
    optins: 0,
    orders: 0,
    page: { ...DEFAULT_PAGE, title: `${finalName} | ${step.name}` },
    canvas: createCanvasForWebinarPage(step.type, finalName, {
      name: finalName,
      type: webinarType,
      videoUrl: resolvedVideo
    })
  }));

  return {
    id: webinarId,
    name: finalName,
    type: webinarType,
    formName: selectedForm,
    videoUrl: resolvedVideo,
    lastUpdated: nowStr,
    ownerUid: accountUid,
    published: false,
    domain: '',
    domainStatus: '',
    pages: pages,
    attendees: [],
    stats: {
      totalViews: 0,
      registrations: 0,
      attendanceRate: '0%',
      replayViews: 0,
      orders: 0,
      conversionRate: '0%',
      revenue: '$0'
    },
    settings: {
      chatEnabled: true,
      autoRedirectUrl: '/replay',
      countdownDurationMinutes: 60,
      seoTitle: finalName,
      seoDescription: 'Created with UpKlick Webinar Builder'
    }
  };
}
