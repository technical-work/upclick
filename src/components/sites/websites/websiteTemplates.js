import { defaultStepCanvas, createCanvasForPageType, DEFAULT_PAGE } from '@/lib/builder/elementRegistry';

export const PREBUILT_WEBSITE_TEMPLATES = [
  {
    id: 'tpl_financial_planner',
    name: 'Financial Planner',
    nameAr: 'مخطط مالي ومستشار استثماري',
    category: 'Finance & Consulting',
    description: 'Professional multi-page website for wealth managers, financial planners, and accounting consultants.',
    descriptionAr: 'موقع إلكتروني متكامل للشركات المالية والاستشارات الاستثمارية وتخطيط الثروات.',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    pages: [
      {
        id: 'p_home',
        name: 'Home',
        path: '/home',
        type: 'landing',
        page: { ...DEFAULT_PAGE, title: 'Financial Planner | Home' },
        canvas: createCanvasForPageType('landing', 'Smart Financial Planning for Your Future 📈', 'Financial Planner')
      },
      {
        id: 'p_about',
        name: 'About Us',
        path: '/about',
        type: 'about',
        page: { ...DEFAULT_PAGE, title: 'About Our Firm' },
        canvas: createCanvasForPageType('about', 'About Our Financial Advisory Firm 🏛️', 'Financial Planner')
      },
      {
        id: 'p_services',
        name: 'Services',
        path: '/services',
        type: 'landing',
        page: { ...DEFAULT_PAGE, title: 'Our Services' },
        canvas: createCanvasForPageType('landing', 'Comprehensive Financial & Wealth Services 💼', 'Financial Planner')
      },
      {
        id: 'p_pricing',
        name: 'Pricing & Plans',
        path: '/pricing',
        type: 'landing',
        page: { ...DEFAULT_PAGE, title: 'Advisory Packages' },
        canvas: createCanvasForPageType('landing', 'Transparent Wealth Management Pricing 💳', 'Financial Planner')
      },
      {
        id: 'p_case_studies',
        name: 'Case Studies',
        path: '/case-studies',
        type: 'landing',
        page: { ...DEFAULT_PAGE, title: 'Client Success Stories' },
        canvas: createCanvasForPageType('landing', 'Client Success Stories & Portfolio 🏆', 'Financial Planner')
      },
      {
        id: 'p_blog',
        name: 'Market Insights',
        path: '/blog',
        type: 'landing',
        page: { ...DEFAULT_PAGE, title: 'Financial Blog' },
        canvas: createCanvasForPageType('landing', 'Market Insights, News & Strategies 📰', 'Financial Planner')
      },
      {
        id: 'p_contact',
        name: 'Contact & Booking',
        path: '/contact',
        type: 'contact',
        page: { ...DEFAULT_PAGE, title: 'Schedule a Consultation' },
        canvas: createCanvasForPageType('contact', 'Book Your Free Financial Consultation 📅', 'Financial Planner')
      },
      {
        id: 'p_thank_you',
        name: 'Thank You',
        path: '/thank-you',
        type: 'thankyou',
        page: { ...DEFAULT_PAGE, title: 'Thank You' },
        canvas: createCanvasForPageType('thankyou', 'Thank You! We Will Contact You Shortly ✨', 'Financial Planner')
      }
    ]
  },
  {
    id: 'tpl_agency_designer',
    name: 'Website Designer & Creative Agency',
    nameAr: 'وكالة تصميم مواقع وتجارب رقمية',
    category: 'Design & Agency',
    description: 'High-converting creative agency and web designer portfolio website with projects, pricing, and inquiry forms.',
    descriptionAr: 'موقع وكالة إبداعية وتصميم مواقع لعرض الأعمال والخدمات والباقات والتواصل مع العملاء.',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    pages: [
      {
        id: 'p1',
        name: 'Homepage',
        path: '/home',
        type: 'home',
        page: { ...DEFAULT_PAGE, title: 'Creative Agency | Home' },
        canvas: defaultStepCanvas('Crafting World-Class Digital Experiences 🚀')
      },
      {
        id: 'p2',
        name: 'Work / Portfolio',
        path: '/work',
        type: 'portfolio',
        page: { ...DEFAULT_PAGE, title: 'Featured Projects' },
        canvas: defaultStepCanvas('Our Latest Work & Case Studies 🎨')
      },
      {
        id: 'p3',
        name: 'Services',
        path: '/services',
        type: 'services',
        page: { ...DEFAULT_PAGE, title: 'Design & Development Services' },
        canvas: defaultStepCanvas('Full-Stack Web Design & Growth Services ⚡')
      },
      {
        id: 'p4',
        name: 'Pricing',
        path: '/pricing',
        type: 'pricing',
        page: { ...DEFAULT_PAGE, title: 'Design Packages' },
        canvas: defaultStepCanvas('Simple, Transparent Project Packages 💎')
      },
      {
        id: 'p5',
        name: 'About Agency',
        path: '/about',
        type: 'about',
        page: { ...DEFAULT_PAGE, title: 'About Our Team' },
        canvas: defaultStepCanvas('Meet The Creative Minds Behind UpKlick 👥')
      },
      {
        id: 'p6',
        name: 'Contact Us',
        path: '/contact',
        type: 'contact',
        page: { ...DEFAULT_PAGE, title: 'Start a Project' },
        canvas: defaultStepCanvas('Let’s Build Something Amazing Together 💬')
      }
    ]
  },
  {
    id: 'tpl_furniture_decor',
    name: 'قالب لعرض منتجات الاثاث المنزلي مميز',
    nameAr: 'قالب لعرض منتجات الاثاث المنزلي مميز',
    category: 'E-Commerce & Interior',
    description: 'Modern luxury furniture showcase and home decor catalog website.',
    descriptionAr: 'موقع وتصميم راقي لمعارض الأثاث المنزلي والديكورات العصرية وقوائم المنتجات المميزة.',
    thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    pages: [
      {
        id: 'p1',
        name: 'الرئيسية (Home)',
        path: '/home',
        type: 'home',
        page: { ...DEFAULT_PAGE, title: 'معرض الأثاث الراقي' },
        canvas: defaultStepCanvas('أفخم تصميمات الأثاث المنزلي والديكور العصري 🛋️')
      },
      {
        id: 'p2',
        name: 'الكتالوج (Catalog)',
        path: '/catalog',
        type: 'catalog',
        page: { ...DEFAULT_PAGE, title: 'كتالوج الأثاث' },
        canvas: defaultStepCanvas('تصفح تشكيلة غرف المعيشة والنوم الفاخرة 🪑')
      },
      {
        id: 'p3',
        name: 'عروض الموسم (Offers)',
        path: '/offers',
        type: 'offers',
        page: { ...DEFAULT_PAGE, title: 'عروض حصرية' },
        canvas: defaultStepCanvas('خصومات موسمية تصل إلى 40% على جميع الموديلات 🔥')
      },
      {
        id: 'p4',
        name: 'من نحن (About)',
        path: '/about',
        type: 'about',
        page: { ...DEFAULT_PAGE, title: 'قصة نجاحنا' },
        canvas: defaultStepCanvas('أكثر من 15 عاماً من التميز في صناعة الأثاث 🌟')
      },
      {
        id: 'p5',
        name: 'الفروع والمعارض (Showrooms)',
        path: '/showrooms',
        type: 'locations',
        page: { ...DEFAULT_PAGE, title: 'فروعنا' },
        canvas: defaultStepCanvas('زوروا معارضنا وتعرفوا على أحدث التشكيلات 📍')
      },
      {
        id: 'p6',
        name: 'تواصل معنا (Contact)',
        path: '/contact',
        type: 'contact',
        page: { ...DEFAULT_PAGE, title: 'اتصل بنا' },
        canvas: defaultStepCanvas('فريق خدمة العملاء جاهز للإجابة على استفساراتكم 📞')
      }
    ]
  },
  {
    id: 'tpl_fashion_apparel',
    name: 'قالب لمنتجات الملابس مميز',
    nameAr: 'قالب لمنتجات الملابس مميز',
    category: 'Fashion & Apparel',
    description: 'High-energy fashion brand website with lookbooks, collections, and influencer features.',
    descriptionAr: 'موقع متكامل لبراندات الملابس والأزياء مع لوك بوك، المجموعات الجديدة وصفحات العروض.',
    thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
    pages: [
      {
        id: 'p1',
        name: 'الرئيسية (Home)',
        path: '/home',
        type: 'home',
        page: { ...DEFAULT_PAGE, title: 'أحدث صيحات الموضة' },
        canvas: defaultStepCanvas('تشكيلة الموسم الجديد — أناقة تناسب كل الأوقات 👗')
      },
      {
        id: 'p2',
        name: 'المجموعات (Collections)',
        path: '/collections',
        type: 'collections',
        page: { ...DEFAULT_PAGE, title: 'أقسام الملابس' },
        canvas: defaultStepCanvas('تسوق تشكيلات الرجال والنساء والأطفال 🛍️')
      },
      {
        id: 'p3',
        name: 'لوك بوك (Lookbook)',
        path: '/lookbook',
        type: 'lookbook',
        page: { ...DEFAULT_PAGE, title: 'Lookbook' },
        canvas: defaultStepCanvas('إلهام وتنسيقات حصرية من مصممي الأزياء ✨')
      },
      {
        id: 'p4',
        name: 'الأكثر مبيعاً (Best Sellers)',
        path: '/best-sellers',
        type: 'products',
        page: { ...DEFAULT_PAGE, title: 'Best Sellers' },
        canvas: defaultStepCanvas('القطع الأكثر طلباً ورواجاً هذا الأسبوع 🔥')
      },
      {
        id: 'p5',
        name: 'جدول المقاسات (Size Guide)',
        path: '/size-guide',
        type: 'guide',
        page: { ...DEFAULT_PAGE, title: 'Size Guide' },
        canvas: defaultStepCanvas('دليل المقاسات الدقيق لاختيار المقاس المثالي 📏')
      },
      {
        id: 'p6',
        name: 'عن البراند (Our Story)',
        path: '/story',
        type: 'about',
        page: { ...DEFAULT_PAGE, title: 'Our Story' },
        canvas: defaultStepCanvas('قصة البراند والشغف وراء كل تصميم 🧵')
      },
      {
        id: 'p7',
        name: 'الشحن والإرجاع (Shipping & Returns)',
        path: '/shipping',
        type: 'policy',
        page: { ...DEFAULT_PAGE, title: 'Shipping & Returns' },
        canvas: defaultStepCanvas('شحن سريع وضمان استبدال وإرجاع مجاني 📦')
      },
      {
        id: 'p8',
        name: 'تواصل معنا (Contact)',
        path: '/contact',
        type: 'contact',
        page: { ...DEFAULT_PAGE, title: 'Customer Care' },
        canvas: defaultStepCanvas('خدمة العملاء والدعم السريع عبر واتساب 💬')
      }
    ]
  }
];

export function createWebsiteFromTemplate(templateId, customName = '', accountUid = '') {
  const template = PREBUILT_WEBSITE_TEMPLATES.find(t => t.id === templateId) || PREBUILT_WEBSITE_TEMPLATES[0];
  const nowStr = new Date().toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const websiteId = 'web_' + Date.now();
  const pages = template.pages.map((p, idx) => ({
    ...p,
    id: `wp_${Date.now()}_${idx}`,
    views: 0,
    optins: 0,
    orders: 0
  }));

  return {
    id: websiteId,
    name: customName.trim() || template.name,
    category: template.category,
    lastUpdated: nowStr,
    ownerUid: accountUid,
    published: false,
    domain: '',
    domainStatus: '',
    pages: pages,
    settings: {
      favicon: '',
      headerCode: '',
      footerCode: '',
      seoTitle: customName.trim() || template.name,
      seoDescription: template.description
    }
  };
}

export function createBlankWebsite(name = 'Sales website', accountUid = '') {
  const nowStr = new Date().toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const websiteId = 'web_' + Date.now();
  const defaultPage = {
    id: 'wp_' + Date.now() + '_0',
    name: 'Home',
    path: '/home',
    type: 'home',
    views: 0,
    optins: 0,
    page: { ...DEFAULT_PAGE, title: (name || 'Website') + ' | Home' },
    canvas: createCanvasForPageType('landing', 'Welcome to ' + (name || 'My Website') + ' 🚀', name || 'Website')
  };

  return {
    id: websiteId,
    name: name.trim() || 'Sales website',
    lastUpdated: nowStr,
    ownerUid: accountUid,
    published: false,
    domain: '',
    domainStatus: '',
    pages: [defaultPage],
    settings: {
      favicon: '',
      headerCode: '',
      footerCode: '',
      seoTitle: name.trim() || 'Sales website',
      seoDescription: 'Created with UpKlick Website Builder'
    }
  };
}
