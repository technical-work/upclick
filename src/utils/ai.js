import { auth } from '@/lib/firebase';

export async function callClaudeAPI(prompt, systemPrompt, lang = 'en', businessContext = {}, toolName = 'General', onChunk = null) {
  let gc = businessContext;
  if (!gc || !gc.integrations) {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('ba_context');
        if (saved) gc = JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error loading ba_context from localStorage in callClaudeAPI:", e);
    }
  }

  // Determine credentials to use
  const defaultKey = "sk-nry-sCBhTqkDeBcp8fp53eO5OQIJ96ztTuNCat9lorftjm4";
  const defaultEndpoint = "https://router.bynara.id/v1/chat/completions";
  const defaultModel = "glm-5";

  const customKey = gc?.integrations?.bynaraKey;
  const customEndpoint = gc?.integrations?.bynaraEndpoint;
  const customModel = gc?.integrations?.bynaraModel;
  const isCustomConnected = gc?.integrations?.bynaraConnected;

  const API_KEY = isCustomConnected ? (customKey || undefined) : undefined;
  const ENDPOINT = isCustomConnected ? (customEndpoint || undefined) : undefined;
  const MODEL_NAME = isCustomConnected ? (customModel || undefined) : undefined;

  try {
    let finalSystemPrompt = systemPrompt || "You are a helpful assistant.";
    let finalPrompt = prompt;

    if (lang === 'ar') {
      finalSystemPrompt = `[معلومة هامة جداً]: لغة واجهة المستخدم هي اللغة العربية. يجب عليك كتابة الرد بالكامل (العناوين، النصوص، التفاصيل، الجداول، الملاحظات) باللغة العربية الفصحى فقط. يمنع منعاً باتاً استخدام اللغة الإنجليزية إلا للمصطلحات التقنية التي لا يمكن تعريبها. حتى وإن كان نص الطلب التالي مكتوباً بالإنجليزية، قم بترجمته ذهنياً وصياغة الإجابة كاملة باللغة العربية.\n\n${finalSystemPrompt}`;
      finalPrompt = `[طلب هام]: يرجى صياغة الإجابة كاملة باللغة العربية الفصحى وبشكل احترافي.\n---\n${prompt}`;
    } else {
      finalSystemPrompt = `${finalSystemPrompt}\n\n[SYSTEM NOTE]: Please write the response in English because the user interface is in English.`;
    }

    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: ENDPOINT,
        apiKey: API_KEY,
        model: MODEL_NAME,
        userId: auth?.currentUser?.uid || '',
        tool: toolName,
        messages: [
          { role: 'system', content: finalSystemPrompt },
          { role: 'user', content: finalPrompt }
        ]
      })
    });
    
    if (!res.ok) {
      const text = await res.text();
      let errorMsg = 'AI request failed';
      try {
        const parsed = JSON.parse(text);
        errorMsg = parsed.error || errorMsg;
      } catch (e) {}
      throw new Error(errorMsg);
    }

    if (onChunk) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        accumulated += text;
        onChunk(text);
      }
      return accumulated;
    } else {
      const text = await res.text();
      return text;
    }
  } catch (error) {
    console.warn('Custom API request failed:', error);
    if (error.message && (error.message.includes('رصيد') || error.message.includes('كافٍ') || error.message.includes('not configured') || error.message.includes('User ID'))) {
      return `❌ ${error.message}`;
    }
  }

  // Fallback engine

  try {
    return generateSmartFallback(prompt, lang, gc);
  } catch (fallbackError) {
    console.warn('Fallback engine error:', fallbackError);
    const isArabic = lang === 'ar';
    return isArabic
      ? `### ✦ استشارة ذكاء الأعمال\nنعمل على تحليل طلبك. يرجى التأكد من ملء بيانات البزنس في الملف الشخصي لتحسين جودة النتائج.`
      : `### ✦ Business Intelligence\nWe are processing your request. Please fill in your business profile details to improve the quality of AI recommendations.`;
  }
}

function extract(prompt, key, fallback = '') {
  const pStr = String(prompt || '');
  const regexes = [
    new RegExp(`${key}:\\s*"([^"]+)"`, 'i'),
    new RegExp(`${key}:\\s*'([^']+)'`, 'i'),
    new RegExp(`${key}:\\s*([^,\\n\\.]+)(?:,|\\n|\\.|$)`, 'i'),
    new RegExp(`${key}\\s*"([^"]+)"`, 'i'),
    new RegExp(`${key}\\s*([^,\\n\\.]+)(?:,|\\n|\\.|$)`, 'i')
  ];
  for (const regex of regexes) {
    const match = pStr.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return fallback;
}

const AR_DICTIONARY = {
  'digital marketing': 'التسويق الرقمي',
  'social media management': 'إدارة منصات التواصل الاجتماعي',
  'content creation': 'صناعة المحتوى',
  'content creator': 'صانع محتوى',
  'coaching': 'التدريب والكوتشينج',
  'coaching services': 'خدمات التدريب والكوتشينج',
  'consulting': 'الاستشارات والأعمال',
  'consulting services': 'الخدمات الاستشارية والمهنية',
  'e-commerce': 'التجارة الإلكترونية',
  'fitness & health': 'اللياقة البدنية والصحة',
  'design': 'التصميم وصناعة الهوية البصرية',
  
  'idea': 'مرحلة الفكرة والتحقق والتخطيط المبدئي',
  'validation': 'مرحلة التحقق والتحصيل لجمهور مهتم',
  'growth': 'مرحلة النمو والتوسع وزيادة الإيرادات',
  'scale': 'مرحلة مضاعفة الأرباح وأتمتة العمليات',
  
  'course': 'كورسات تعليمية ودورات مسجلة',
  'digital product': 'منتجات رقمية وقوالب جاهزة',
  'consulting services': 'خدمات استشارية وجلسات كوتشينج',
  'services': 'خدمات تنفيذية (Done-For-You)',
  
  'instagram': 'إنستجرام / ريلز ومحتوى مرئي',
  'tiktok': 'تيك توك / فيديوهات قصيرة سريعة الانتشار',
  'facebook': 'فيسبوك / مجموعات وإعلانات ممولة',
  'linkedin': 'لينكد إن / محتوى احترافي شبكي للشركات',
  'youtube': 'يوتيوب / فيديوهات طويلة وشروحات تعليمية',
  'ads': 'إعلانات جوجل وميتا الممولة',
  'content': 'التسويق بالمحتوى والتدوين العضوي',
  
  '5-10': 'من 5 إلى 10 ساعات أسبوعياً (تركيز عالي)',
  '10-20': 'من 10 إلى 20 ساعة أسبوعياً (توازن تشغيلي)',
  '20-30': 'من 20 إلى 30 ساعة أسبوعياً (شبه تفرغ)',
  '40+': 'تفرغ كامل (أكثر من 40 ساعة أسبوعياً)',
  'full-time': 'تفرغ كامل (أكثر من 40 ساعة أسبوعياً)',

  'lack of consistency & organic reach': 'ضعف الاستمرارية وصعوبة الوصول والانتشار العضوي في المنصات',
  'no automated sales funnel': 'غياب قمع مبيعات مؤتمت يحول المتابعين إلى مشترين تلقائياً',
  'lack of leads': 'ندرة العملاء المحتملين وصعوبة جذب ليدز ذوي جودة عالية',
  'pricing uncertainty': 'عدم اليقين في تحديد الأسعار وتقديم عرض جذاب متكامل'
};

function getAR(val, defaultVal = '') {
  if (!val) return defaultVal || 'غير محدد';
  const strVal = String(val);
  const clean = strVal.toLowerCase().trim();
  if (AR_DICTIONARY[clean]) return AR_DICTIONARY[clean];
  
  for (const [en, ar] of Object.entries(AR_DICTIONARY)) {
    if (clean.includes(en)) return ar;
  }
  return strVal;
}

function generateSmartFallback(prompt, lang, context) {
  const pStr = String(prompt || '');
  // Detect language: ar if lang is 'ar' or contains Arabic chars
  const isAR = lang ? (lang === 'ar') : /[\u0600-\u06FF]/.test(pStr);
  
  // Extract values with helper, falling back to context defaults if missing
  const name = extract(pStr, 'Brand Name') || extract(pStr, 'Name') || extract(pStr, 'Name:') || context?.profile?.name || 'UpKlick Business';
  const niche = extract(pStr, 'Niche') || context?.profile?.niche || 'Digital Marketing';
  const stage = extract(pStr, 'Stage') || context?.profile?.stage || 'Idea';
  const type = extract(pStr, 'Product Type') || extract(pStr, 'Product') || context?.profile?.type || 'Consulting Services';
  const price = extract(pStr, 'Price') || context?.profile?.offer?.price || '$29';
  const transform = extract(pStr, 'Transformation') || context?.profile?.offer?.transform || 'Achieve business growth';
  const duration = extract(pStr, 'Duration') || context?.profile?.offer?.duration || '4 weeks';
  const budget = extract(pStr, 'Budget') || '$500';
  const channels = extract(pStr, 'Online channels') || extract(pStr, 'Primary Channel') || 'Instagram, TikTok';
  const goals = extract(pStr, 'Revenue goal') || extract(pStr, 'Goals') || extract(pStr, 'Goal') || 'Scale to $5,000/month';
  const hours = extract(pStr, 'Hours available/week') || '10';
  const demo = extract(pStr, 'Demographics') || extract(pStr, 'Target market') || extract(pStr, 'Target Audience') || 'Arab creators & freelancers';
  const pain = extract(pStr, 'Pain points') || extract(pStr, 'Pain') || 'Lack of consistency & organic reach';
  
  const strengths = extract(pStr, 'Strengths') || 'Personal brand trust & regional insights';
  const weaknesses = extract(pStr, 'Weaknesses') || 'No automated sales funnel';
  const opportunities = extract(pStr, 'Opportunities') || 'Launching high-margin digital products';
  const threats = extract(pStr, 'Threats') || 'Platform algorithm shifts';

  const localizedNiche = isAR ? getAR(niche, 'التسويق الرقمي') : niche;
  const localizedStage = isAR ? getAR(stage, 'فكرة بزنس') : stage;
  const localizedType = isAR ? getAR(type, 'المنتجات الرقمية') : type;
  const localizedChannel = isAR ? getAR(channels, 'إنستجرام، تيك توك') : channels;
  const localizedHours = isAR ? getAR(hours, '١٠ ساعات') : hours;
  const localizedDemo = isAR ? getAR(demo, 'المستقلين وصناع المحتوى العرب') : demo;
  const localizedPain = isAR ? getAR(pain, 'قلة الاستمرارية وضياع الوصول الطبيعي') : pain;
  const localizedTransform = isAR ? getAR(transform, 'تحقيق نمو ملموس للبزنس') : transform;
  const localizedDuration = isAR ? getAR(duration, '٤ أسابيع') : duration;
  const localizedStrengths = isAR ? getAR(strengths, 'الثقة والمصداقية') : strengths;
  const localizedWeaknesses = isAR ? getAR(weaknesses, 'غياب الأتمتة وقمع المبيعات') : weaknesses;
  const localizedOpportunities = isAR ? getAR(opportunities, 'إطلاق عروض ومنتجات رقمية عالية الهامش') : opportunities;
  const localizedThreats = isAR ? getAR(threats, 'تحديثات خوارزميات شبكات التواصل') : threats;
  // Retrieve user's configured currency symbol & code safely
  let symbol = '$';
  let currencyCode = 'USD';
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('upklick_currency');
      if (saved) {
        const parsed = JSON.parse(saved);
        symbol = parsed.symbol || '$';
        currencyCode = parsed.code || 'USD';
      }
    }
  } catch (e) {}

  const normalized = pStr.toLowerCase();

  // ── OFFERS & PRICING FALLBACK ROUTING ──
  if (normalized.includes('offer-builder') || normalized.includes('irresistible offer') || normalized.includes('offer builder') || normalized.includes('هيكل عرض تجاري')) {
    return generateSmartOfferBuilder(isAR, name, localizedNiche, price, localizedTransform, localizedPain, context, pStr, symbol, currencyCode);
  }

  if (normalized.includes('optimize pricing') || normalized.includes('pricing optimizer') || normalized.includes('pricing-out') || normalized.includes('optimize pricing:')) {
    return generateSmartPricing(isAR, name, localizedNiche, price, localizedTransform, context, pStr, symbol, currencyCode);
  }

  if (normalized.includes('upsell ladder') || normalized.includes('upsell-out') || normalized.includes('upsell & cross-sell')) {
    return generateSmartUpsell(isAR, name, localizedNiche, price, context, pStr, symbol, currencyCode);
  }

  if (normalized.includes('kpi planner') || normalized.includes('kpi-out') || normalized.includes('kpi dashboard') || normalized.includes('مخطط مؤشرات الأداء')) {
    return generateSmartKPIPlanner(isAR, name, localizedNiche, context, pStr, symbol, currencyCode);
  }

  if (normalized.includes('forecast revenue') || normalized.includes('rev-forecast-out') || normalized.includes('revenue projections') || normalized.includes('توقعات الأرباح')) {
    return generateSmartRevenueForecast(isAR, name, localizedNiche, context, pStr, symbol, currencyCode);
  }

  if (normalized.includes('forecast leads') || normalized.includes('lead-forecast-out') || normalized.includes('توقع أعداد عملائي') || normalized.includes('توقعات العملاء')) {
    return generateSmartLeadForecast(isAR, name, localizedNiche, context, pStr, symbol, currencyCode);
  }

  // 0. Landing Page copy generator
  if (normalized.includes('landing') || normalized.includes('landing page') || normalized.includes('صفحة الهبوط') || normalized.includes('copywriter') || normalized.includes('tagline')) {
    const taglineAR = `ضاعف مبيعاتك في مجال ${localizedNiche} مع عرض ${offer} من ${name}`;
    const taglineEN = `Scale your business in ${localizedNiche} with ${name}'s ${offer}`;
    const aboutAR = `أنا ${name}، خبير في ${localizedNiche}. أساعد عملائي وطلابي على تحقيق نتائج استثنائية وبناء حضور رقمي قوي من خلال أدوات مبتكرة وخبرة عملية ممتدة لسنوات.`;
    const aboutEN = `I am ${name}, an expert in ${localizedNiche}. I help my clients and students achieve outstanding results and build a strong digital presence through innovative tools and years of experience.`;

    const featuresAR = [
      { icon: '🎯', title: 'خطة عمل مخصصة', desc: 'خطة عمل مصممة خصيصاً لأهدافك وظروفك لمجال ' + localizedNiche },
      { icon: '📞', title: 'جلسات فردية أسبوعية', desc: 'لقاءات منتظمة لمتابعة تقدمك وحل التحديات' },
      { icon: '📚', title: 'موارد حصرية', desc: 'مكتبة شاملة من القوالب والأدوات والمواد لعرض ' + offer },
      { icon: '👥', title: 'مجتمع داعم', desc: 'انضم لمجموعة من المتحمسين يشجعونك للأمام' },
      { icon: '📊', title: 'قياس النتائج', desc: 'متابعة دقيقة للتقدم مع تعديلات مستمرة' },
      { icon: '🏆', title: 'شهادة معتمدة', desc: 'احصل على شهادة إتمام معترف بها' }
    ];
    const featuresEN = [
      { icon: '🎯', title: 'Personalized Action Plan', desc: `A roadmap designed specifically for your goals in ${localizedNiche}` },
      { icon: '📞', title: 'Weekly 1-on-1 Sessions', desc: 'Regular meetings to track progress and solve challenges' },
      { icon: '📚', title: 'Exclusive Resources', desc: `Full library of templates, tools, and materials for ${offer}` },
      { icon: '👥', title: 'Supportive Community', desc: 'Join a group of motivated peers cheering you on' },
      { icon: '📊', title: 'Results Tracking', desc: 'Precise progress monitoring with ongoing adjustments' },
      { icon: '🏆', title: 'Certified Achievement', desc: 'Get a recognized completion certificate' }
    ];

    const testimonialsAR = [
      { initial: 'ن', name: 'نورة الراشدي', loc: 'السعودية', stars: 5, text: `العمل مع ${name} غيّر مسار حياتي المهنية كلياً. ساعدني أحقق أهدافاً كنت أظنها مستحيلة.` },
      { initial: 'أ', name: 'أحمد خليل', loc: 'مصر', stars: 5, text: `بدأت أكسب من محتواي في أول ٦٠ يوم. أفضل استثمار في حياتي.` },
      { initial: 'م', name: 'منى صابر', loc: 'الإمارات', stars: 5, text: `أخيراً خدمة تفهم السوق العربي وتحدياته الفعلية في ${localizedNiche}. أنصح بها بشدة.` }
    ];
    const testimonialsEN = [
      { initial: 'N', name: 'Nora Al-Rashidi', loc: 'Saudi Arabia', stars: 5, text: `Working with ${name} completely changed my professional path. Helped me achieve goals I thought were impossible.` },
      { initial: 'A', name: 'Ahmed K.', loc: 'Egypt', stars: 5, text: `Started earning from my offer in the first 60 days. Best investment of my life.` },
      { initial: 'M', name: 'Mona Al-Saber', loc: 'UAE', stars: 5, text: `Finally a service that truly understands the market in ${localizedNiche}. Highly recommend.` }
    ];

    const faqsAR = [
      { q: `هل كورس ${offer} مناسب للمبتدئين؟`, a: 'نعم، نبدأ خطوة بخطوة من الصفر حتى الاحتراف.' },
      { q: 'ما هي مدة صلاحية الوصول للمواد؟', a: 'صلاحية وصول مدى الحياة لجميع الدروس والتحديثات المستمرة.' },
      { q: 'هل توجد ضمانات للمنتج؟', a: 'نعم، نقدم ضمان استرداد الأموال بنسبة 100% خلال 30 يوماً.' },
      { q: 'هل توجد متابعة شخصية؟', a: 'نعم، يشمل العرض جلسات أسئلة وأجوبة ومراجعات مباشرة.' }
    ];
    const faqsEN = [
      { q: `Is ${offer} suitable for beginners?`, a: 'Yes, we start step-by-step from scratch to advanced.' },
      { q: 'How long do I have access?', a: 'Lifetime access to all lessons and future updates.' },
      { q: 'Is there a money-back guarantee?', a: 'Yes, 30-day 100% money back guarantee.' },
      { q: 'Is there support included?', a: 'Yes, includes Q&A calls and community feedback.' }
    ];

    const obj = {
      tagline: isAR ? taglineAR : taglineEN,
      aboutText: isAR ? aboutAR : aboutEN,
      features: isAR ? featuresAR : featuresEN,
      testimonials: isAR ? testimonialsAR : testimonialsEN,
      faqs: isAR ? faqsAR : faqsEN
    };

    return JSON.stringify(obj, null, 2);
  }

  // Brand Name Generator fallback
  if (normalized.includes('brand name') || normalized.includes('business/brand names') || normalized.includes('brand namer')) {
    return generateSmartBrandNames(prompt);
  }

  // 1. Daily Brief / Analyze My Business Today / حلل بزنسي اليوم
  if (normalized.includes('daily business brief') || normalized.includes('daily brief') || normalized.includes('analyze my business today') || normalized.includes('حلل بزنسي اليوم')) {
    return generateDailyBrief(isAR, context, name, localizedNiche, localizedChannel, goals, localizedPain);
  }

  // 2. Who should I follow up with? / مين لازم أتابع؟
  if (normalized.includes('who should i follow up') || normalized.includes('who should i follow-up') || normalized.includes('مين لازم أتابع')) {
    return generateCRMInsights(isAR, context);
  }

  // 3. How much is my revenue this month? / كم إيراداتي هذا الشهر؟ / تحليل مالي
  if (
    normalized.includes('revenue this month') || 
    normalized.includes('كم إيراداتي') || 
    normalized.includes('إيراداتي') || 
    normalized.includes('revenue check') ||
    normalized.includes('financial checkup') ||
    normalized.includes('financial') ||
    normalized.includes('finance') ||
    normalized.includes('transaction')
  ) {
    return generateFinanceInsights(isAR, context);
  }

  // 4. What are today's priorities? / أولوياتي اليوم؟
  if (normalized.includes('priority') || normalized.includes('priorities') || normalized.includes('أولوياتي')) {
    return generateTaskPriorities(isAR, context);
  }

  // 5. Summarize this week / أعطني ملخص الأسبوع
  if (normalized.includes('summarize this week') || normalized.includes('weekly summary') || normalized.includes('ملخص الأسبوع') || normalized.includes('أعطني ملخص')) {
    return generateWeeklySummary(isAR, context, name, localizedChannel, goals);
  }

  // 6. Where are my revenue leaks? / تسريبات الإيرادات / تسريب
  if (normalized.includes('revenue leak') || normalized.includes('leaks') || normalized.includes('تسريب') || normalized.includes('تسريبات')) {
    return generateRevenueLeaks(isAR, context);
  }

  // 7. Business Idea Analysis / Viability
  if (normalized.includes('analyze this business idea') || normalized.includes('viability')) {
    return generateViabilityAnalysis(isAR, name, localizedNiche, localizedStage, pStr, price, localizedTransform, localizedDuration, localizedDemo, localizedPain);
  }

  // 8. SWOT Matrix
  if (normalized.includes('swot')) {
    return generateSWOT(isAR, name, localizedNiche, localizedStage, localizedStrengths, localizedWeaknesses, localizedOpportunities, localizedThreats);
  }

  // 9. Marketing OS strategy / CMO plan / Launch Planner
  if (normalized.includes('marketing strategy') || normalized.includes('cmo') || normalized.includes('launch') || normalized.includes('strategy')) {
    return generateMarketingStrategy(isAR, name, budget, localizedNiche, localizedChannel, localizedDuration, localizedPain, price, localizedDemo, localizedTransform);
  }

  // 10. 90-Day Roadmap
  if (normalized.includes('roadmap') || normalized.includes('90-day')) {
    const rmCurrent = extract(pStr, 'Current revenue') || extract(pStr, 'Current Monthly Revenue') || '$0';
    const rmGoal = extract(pStr, 'Revenue goal') || extract(pStr, 'Revenue Goal') || '$5,000/month';
    const rmHours = extract(pStr, 'Hours available/week') || extract(pStr, 'Hours Available') || '10-20';
    const rmChannel = extract(pStr, 'Primary channel') || extract(pStr, 'Primary Growth Channel') || 'Instagram';
    return generateRoadmap(isAR, rmCurrent, rmGoal, rmHours, rmChannel, localizedPain, price);
  }

  // 11. Competitor Finder & Ad Analysis
  if (normalized.includes('competitor') || normalized.includes('ads')) {
    return generateCompetitorFinder(isAR, name, localizedNiche, localizedPain, localizedDemo, price, localizedTransform);
  }

  // 12. Video Script Writer & Content Hub
  if (
    normalized.includes('video script') || 
    normalized.includes('script writer') || 
    (normalized.includes('script') && !normalized.includes('subscription')) || 
    normalized.includes('content') || 
    normalized.includes('hook') || 
    normalized.includes('idea')
  ) {
    return generateVideoScript(isAR, name, localizedNiche, localizedDemo, localizedPain, localizedHours, localizedChannel, goals);
  }

  // 13. Telegram Automation & CRM (from Telegram Hub or CRM view suggestion)
  if (normalized.includes('telegram') || normalized.includes('automation') || normalized.includes('follow-up suggestion') || normalized.includes('followup suggestion')) {
    return generateTelegramAutomation(isAR, name, localizedNiche, localizedPain, goals, price);
  }

  // 14. Ops SOP / automation check
  if (normalized.includes('sop') || normalized.includes('ops') || normalized.includes('standard operating')) {
    return generateOpsSop(isAR, name, localizedNiche, localizedStage);
  }

  // 15. Digital Products check
  if (normalized.includes('product ideas') || normalized.includes('digital product details')) {
    return generateDigitalProductIdeas(isAR, name, localizedNiche, price, localizedTransform);
  }

  // 16. Social Accounts / Trends feedback
  if (normalized.includes('social trend') || normalized.includes('social account') || normalized.includes('instagram analysis')) {
    return generateSocialFeedback(isAR, name, localizedChannel, localizedNiche);
  }

  // 17. Course outline / product syllabus check
  if (normalized.includes('outline') || normalized.includes('syllabus') || normalized.includes('structure')) {
    return `### 📋 الهيكل المقترح للمنتج: **${name}**
**الموديول ١: الأساسيات والتهيئة**
• تحديد الأهداف والجمهور المستهدف لـ **${name}**
• الأدوات والبرمجيات اللازمة للتنفيذ
• هيكلة الموارد وتجهيز الملفات

**الموديول ٢: بناء القيمة الجوهرية**
• صياغة الفصول والدروس الأساسية بالتفصيل
• دمج دراسات الحالة والأمثلة الواقعية للنيش
• تجهيز النماذج والأوراق المساعدة للجمهور المستهدف

**الموديول ٣: المظهر واللمسات البصرية**
• تصميم الأغلفة والواجهات باستخدام Canva أو Notion
• إعداد الروابط الرقمية والتصدير بالصيغة النهائية
• تحسين تجربة المستخدم وسهولة القراءة

**الموديول ٤: الإعداد للإطلاق والتسويق**
• ربط بوابات الدفع وإعداد صفحة المنتج
• صياغة العروض الترويجية وزوايا النصوص التسويقية
• النشر وبدء حملة الترويج عبر منصاتك المفضلة`;
  }

  // 18. Tech Stack Analyzer fallback
  if (normalized.includes('tech stack') || normalized.includes('lead solutions architect')) {
    const d = extract(pStr, 'competitor domain:', 'the competitor');
    return isAR 
      ? `### ⚙️ تقرير البنية التقنية والأدوات (محاكاة ذكية)
الموقع المستهدف: **${d}**

بناءً على معايير السوق الحالية في مجال ${localizedNiche}، إليك تحليل مقدر للأدوات المستخدمة:
1. **المنصات وبناء الصفحات:** غالباً يعتمد على (WordPress / ClickFunnels / Shopify) حسب طبيعة العروض.
2. **إدارة علاقات العملاء (CRM):** أداة مثل (HubSpot / GoHighLevel / ActiveCampaign) لأتمتة المتابعة.
3. **التتبع والتحليلات:** Meta Pixel الأساسي، و Google Analytics (GA4) لقياس التحويلات.
4. **الدفع والمبيعات:** بوابة دفع عالمية (Stripe / PayPal) أو محلية (Paymob / Tap) مع أداة مثل ThriveCart.

*نصيحة تقنية:* يمكنك بناء نظام مشابه وبأقل تكلفة باستخدام منصة متكاملة (All-in-one) لتقليل تشتت الأدوات واشتراكاتها.`
      : `### ⚙️ Tech Stack Report (Smart Estimation)
Target Domain: **${d}**

Based on industry standards in ${localizedNiche}, here is an estimated tech stack:
1. **CMS/Landing Pages:** Likely using (WordPress / ClickFunnels / Shopify).
2. **CRM & Email:** Tools like (HubSpot / GoHighLevel / ActiveCampaign).
3. **Tracking:** Meta Pixel and Google Analytics (GA4).
4. **Payments:** (Stripe / PayPal) or localized gateways via ThriveCart.

*Tech Tip:* Build a similar automated system using an all-in-one platform to reduce subscription bloat.`;
  }

  // 19. Reverse Engineer fallback
  if (normalized.includes('reverse engineer') || normalized.includes('marketing system behind')) {
    const r = extract(pStr, 'URL/Name:', 'the target funnel');
    return isAR
      ? `### 🔁 تقرير الهندسة العكسية للمبيعات (محاكاة ذكية)
الهدف المستهدف: **${r}**

بناءً على مبادئ التسويق وعلم نفس المستهلك في مجال ${localizedNiche}:
1. **مصدر الزيارات (Traffic):** التركيز الأكبر يكون على المحتوى العضوي (Organic) في المنصات السريعة لدعم الإعلانات الممولة وإعادة الاستهداف.
2. **هيكل مسار التحويل (Funnel):** الصفحة تعتمد على (Hook) قوي يجذب الانتباه لمشكلة شائعة، ثم تقدم (Lead Magnet) مجاني أو عرض منخفض التكلفة لكسر حاجز الشراء.
3. **استراتيجية التسعير وما بعد البيع:** يعتمدون على نموذج (Upsell) متدرج؛ حيث يرتفع السعر في الخدمات المتقدمة (Backend Offer) لزيادة متوسط قيمة العميل (LTV).
4. **عوامل الإقناع الرئيسية:** الإثبات الاجتماعي (Social Proof)، الندرة (Scarcity)، وتخفيف المخاطر بضمان واضح.

*كيف تطبق ذلك؟* ابدأ بصناعة "طُعم" مجاني يجذب فئتك المستهدفة، ثم اعرض منتجك الأساسي فور تسجيلهم.`
      : `### 🔁 Reverse Engineering Report (Smart Estimation)
Target: **${r}**

Based on conversion psychology in ${localizedNiche}:
1. **Traffic Source:** Heavy reliance on short-form organic content coupled with retargeting ads.
2. **Funnel Structure:** Uses a strong emotional hook, leading to a low-friction entry offer or free lead magnet.
3. **Backend Strategy:** Monetization happens primarily through high-ticket upsells to maximize LTV.
4. **Conversion Triggers:** Strong social proof, artificial or real scarcity, and risk-reversing guarantees.

*Takeaway:* Build a frictionless front-end offer to build trust before pitching your core service.`;
  }

  // 20. Funnel Explorer fallback
  if (normalized.includes('sales funnels for') || normalized.includes('funnel explorer')) {
    return isAR
      ? `### 🔄 مستكشف مسارات التحويل (محاكاة ذكية)
مسار تحويل مقترح لمجالك (${localizedNiche}):

1. **الخطوة الأولى (الجذب):** محتوى تعليمي قصير يحل مشكلة بسيطة، مع دعوة لتحميل دليل مجاني.
2. **الخطوة الثانية (التقاط البيانات):** صفحة هبوط (Squeeze Page) تطلب البريد والاسم مقابل الدليل المجاني.
3. **الخطوة الثالثة (العرض المبدئي):** صفحة شكر تحتوي على عرض سريع بسعر منخفض (Tripwire) لاسترداد تكاليف الإعلانات.
4. **الخطوة الرابعة (الرعاية):** سلسلة رسائل بريد إلكتروني/تليجرام تبني الثقة وتقدم العرض الأساسي (${price}).`
      : `### 🔄 Funnel Explorer (Smart Estimation)
Recommended Funnel for ${localizedNiche}:

1. **Top of Funnel (Attract):** Short-form content solving a micro-problem, driving to a lead magnet.
2. **Middle of Funnel (Capture):** Squeeze page offering the free asset in exchange for an email.
3. **Tripwire Offer:** Thank you page with a highly discounted entry offer to liquidate ad spend.
4. **Core Offer Pitch:** An automated email sequence nurturing the lead and pitching your core offer (${price}).`;
  }

  // Generic Catch-all / custom chat assistant panel questions
  return generateCustomChatResponse(isAR, pStr, context, name, localizedNiche, localizedStage, price, localizedPain, localizedDemo, localizedChannel, goals);
}

// ── SUB-GENERATORS IMPLEMENTATION ──

function generateDailyBrief(isAR, context, name, niche, channels, goals, pain) {
  let userName = isAR ? 'سارة' : 'Sara';
  if (context?.bioLink?.displayName) {
    userName = context.bioLink.displayName.split(' ')[0];
  }

  const activeLeads = (context?.crm?.leads || []).filter(l => l && l.stage !== 'closed' && l.stage !== 'lost');
  const openTasks = (context?.tasks?.items || []).filter(t => t && !t.done);
  const entries = context?.finance?.entries || [];
  const totalIncome = entries.filter(e => e && e.type === 'income').reduce((a, b) => a + Number(b.amount || 0), 0);
  const totalExpenses = entries.filter(e => e && e.type === 'expense').reduce((a, b) => a + Number(b.amount || 0), 0);
  const profit = totalIncome - totalExpenses;

  if (isAR) {
    let brief = `### ☀️ صباح الخير يا ${userName}! إليك ملخصك الاستشاري اليوم لـ **${name}**:

#### 📊 ملخص الأداء المباشر اليوم:
`;
    if (activeLeads.length > 0) {
      brief += `• **المبيعات (CRM):** لديك حالياً **${activeLeads.length}** عملاء مهتمين قيد المتابعة والتفاوض.
`;
      activeLeads.slice(0, 3).forEach(l => {
        brief += `  - العميل **${l.name}** | قيمة الصفقة المحتملة: \`$${l.value || 0}\` (المرحلة: **${getAR(l.stage)}**)\n`;
      });
    } else {
      brief += `• **المبيعات (CRM):** لا يوجد عملاء مهتمين نشطين حالياً. ننصح بالانتقال لقسم التسويق لإطلاق حملة جذب عملاء.\n`;
    }

    if (openTasks.length > 0) {
      brief += `• **الإنتاجية والعمليات:** متبقي لديك **${openTasks.length}** مهام بحاجة للتنفيذ اليوم.
`;
      openTasks.slice(0, 3).forEach(t => {
        brief += `  - [ ] **${t.title}** (أولوية: ${t.priority === 'high' ? '🔥 عالية' : '📌 عادية'})\n`;
      });
    } else {
      brief += `• **الإنتاجية والعمليات:** عمل ممتاز! لا توجد مهام معلقة لليوم. كل شيء يسير بنجاح.\n`;
    }

    brief += `• **الوضع المالي:** حققت إيرادات بقيمة **$${totalIncome}** مقابل مصروفات بقيمة **$${totalExpenses}** هذا الشهر (صافي أرباحك: **$${profit}**).
`;

    brief += `
#### 💡 اقتراح استشاري مخصص لليوم:
`;
    if (activeLeads.length > 0) {
      brief += `ننصح بالتركيز فوراً اليوم على التواصل الهاتفي أو عبر التليجرام مع العميل **${activeLeads[0].name}** ومحاولة تقديم عرض محدود الوقت لإغلاق الصفقة بقيمة \`$${activeLeads[0].value || 0}\`.`;
    } else {
      brief += `خصص ساعات عملك اليوم لنشر فيديو ترويجي تفاعلي على منصات **${channels}** يستهدف مشكلة جمهورك: "**${pain}**" وادعهم للتسجيل عبر صفحة الهبوط مجاناً.`;
    }
    return brief;
  } else {
    let brief = `### ☀️ Good morning, ${userName}! Here is your strategic update for **${name}**:

#### 📊 Live Performance Digest:
`;
    if (activeLeads.length > 0) {
      brief += `• **Sales (CRM):** You have **${activeLeads.length}** active deals currently in progress.
`;
      activeLeads.slice(0, 3).forEach(l => {
        brief += `  - Client **${l.name}** | Potential Value: \`$${l.value || 0}\` (Stage: **${l.stage}**)\n`;
      });
    } else {
      brief += `• **Sales (CRM):** No active leads in progress. Focus today on generating new prospective leads.\n`;
    }

    if (openTasks.length > 0) {
      brief += `• **Tasks & Operations:** You have **${openTasks.length}** pending tasks for today.
`;
      openTasks.slice(0, 3).forEach(t => {
        brief += `  - [ ] **${t.title}** (Priority: ${t.priority === 'high' ? '🔥 High' : '📌 Normal'})\n`;
      });
    } else {
      brief += `• **Tasks & Operations:** Awesome! You are all caught up. No pending operational tasks left.\n`;
    }

    brief += `• **Financial Standing:** This month you pulled **$${totalIncome}** in revenue with **$${totalExpenses}** in overhead (Net Profit: **$${profit}**).
`;

    brief += `
#### 💡 Immediate Action Item:
`;
    if (activeLeads.length > 0) {
      brief += `Make it a priority today to follow up directly with **${activeLeads[0].name}** to review their proposal and close the deal.`;
    } else {
      brief += `Focus your marketing hours today on **${channels}** to distribute content covering: "**${pain}**" and direct viewers to your bio link.`;
    }
    return brief;
  }
}

function generateViabilityAnalysis(isAR, name, niche, stage, prompt, price, transform, duration, demo, pain) {
  const score = 8.7;
  if (isAR) {
    return `### 📊 تحليل جدوى فكرة البزنس: ${name}
**1. مؤشر نجاح الفكرة:** 🚀 **${score}/10** (جدوى تجارية ممتازة)
المشروع يقع في نيش **${niche}** وفي مرحلة **${stage}**. يتمتع هذا مجال بمعدلات نمو إقليمية مرتفعة لسهولة التطبيق وانخفاض تكلفة التشغيل المبدئية.

**2. الفرص الـ 3 الأهم في السوق حالياً:**
• **مغناطيس عملاء (Lead Magnet) عالي الجودة:** حل مشكلة "**${pain}**" مجاناً لتجميع قاعدة جماهيرية متحمسة.
• **طرح منتج رقمي ميسر التكلفة:** بناء عرض بقيمة **${price}** يقدم تحولاً واضحاً خلال **${duration}**.
• **أتمتة المبيعات:** البيع غير المباشر عبر قمع صفحات هبوط ذكية بدلاً من المحادثات الطويلة المرهقة.

**3. المخاطر الأساسية واستراتيجيات تخفيفها:**
• **صعوبة الانتشار وخوارزميات شبكات التواصل:** تغلب عليها بالتركيز على المنصة المفضلة حالياً وصناعة محتوى تفاعلي يعالج الألم مباشرة.
• **ضعف معدل تحويل العملاء:** حل ذلك عبر تفعيل تليجرام CRM للمتابعة اليومية وإرسال رسائل ترحيبية آلية.

**4. خطة التحقق والتحصيل الفورية (5 خطوات):**
1. **صياغة التحول الرئيسي للخدمة:** أعلن عن تقديم عرضك بقيمة **${price}** والذي يضمن للعميل: "${transform}".
2. **مقابلات استكشافية:** تواصل شخصياً مع 5 أفراد من فئتك المستهدة (**${demo}**) لمناقشة الألم والمشاكل لديهم.
3. **أطلق صفحة الهبوط الأولى:** أنشئ صفحة لجمع البريد الإلكتروني أو أرقام الهواتف للمهتمين بالعرض.
4. **توعية المحتوى الاستراتيجي:** انشر محتوى مخصص يبرز الحلول والمشاكل بشكل تفصيلي.
5. **فتح حجز الدفعة الأولى المسبق (Pre-sales):** تحقق من رغبتهم المادية بالدفع قبل كتابة سطر واحد من مادة الكورس أو بناء الخدمة كاملة.`;
  } else {
    return `### 📊 Business Idea & Viability Assessment: ${name}
**1. Viability Strength Rating:** 🚀 **${score}/10** (Highly Viable)
Operating in the niche "**${niche}**" at the stage "**${stage}**" represents a highly profitable opportunity.

**2. Top 3 Market Opportunities Identified:**
• **Frictionless Lead Magnet:** Solve "**${pain}**" for free to build an eager audience waitlist.
• **High-Margin Entry Product:** Structure a high-value core offer at **${price}** that solves the issue within **${duration}**.
• **Sales Funnel Automation:** Leverage simple sales pages to acquire customers 24/7 without manual sales calls.

**3. Strategic Risks & Actionable Mitigation:**
• **Platform Reach Inconsistency:** Mitigate by capturing emails and Telegram numbers to build your owned database.
• **Initial Trust Barrier:** Leverage client case studies, step-by-step breakdowns, and personal branding.

**4. Instant 5-Step Validation Framework:**
1. **Define Core Transformation:** Clearly state what your **${price}** offer delivers: "${transform}".
2. **Conduct 5 Audience Interviews:** Connect with target prospects (**${demo}**) to validate the severity of their challenge: "${pain}".
3. **Launch a Landing Page:** Set up a dynamic landing page via UpKlick to capture initial interest.
4. **Distribute Targeted Content:** Publish content addressing current struggles and hinting at your solution.
5. **Collect Pre-orders:** Secure actual payments before investing heavy effort into constructing the full product.`;
  }
}

function generateSWOT(isAR, name, niche, stage, strengths, weaknesses, opportunities, threats) {
  if (isAR) {
    return `### 🧠 تحليل SWOT الاستراتيجي لـ **${name}**
*النيش: ${niche} | المرحلة الحالية: ${stage}*

**1. نقاط القوة (Strengths):**
• الميزة التنافسية والخبرة: **${strengths}**
• هوامش ربح رقمية ممتازة وتكلفة تشغيل منخفضة جداً للمشروع.
• القدرة على التعديل السريع للمنتجات بناءً على آراء المشتركين الأوائل.

**2. نقاط الضعف (Weaknesses):**
• التحديات الداخلية: **${weaknesses}**
• محدودية الوقت أو التشتت في قنوات ترويج متعددة دون تركيز.
• عدم وجود نظام أتمتة مبيعات ومتابعة متكامل في البداية.

**3. الفرص (Opportunities):**
• الفرص السوقية المتاحة: **${opportunities}**
• إطلاق منتج رقمي مصغر كخطوة أولى لبناء الثقة وجني أرباح سريعة.
• بناء مجتمع مغلق للمهتمين بنشاطك لزيادة الولاء وتكرار الشراء.

**4. التهديدات (Threats):**
• المخاطر الخارجية: **${threats}**
• تزايد المنافسة العامة وتشتت انتباه العميل بين الكثير من صناع المحتوى.
• تغير خوارزميات المنصات والوصول العضوي بشكل مفاجئ.

---

### 🗺️ المصفوفة الاستراتيجية المتقاطعة (Cross-SWOT Strategy):
• **استراتيجية القوة والفرص (SO):** استخدم ثقة فئتك المستهدفة وخبرتك العميقة في **${strengths}** لإطلاق عرض مصغر يسهل شراؤه ويستثمر الفرصة: **${opportunities}**.
• **استراتيجية التغلب على الضعف (WO):** قم بسد ثغرة **${weaknesses}** عن طريق تفعيل قوالب رسائل المتابعة المؤتمتة عبر التليجرام في CRM لرفع كفاءة مبيعاتك دون هدر الوقت.
• **استراتيجية الدفاع (WT):** واجه خطر **${threats}** من خلال حث الجمهور باستمرار على الانتقال لصفحتك والحصول على دليل مجاني لبناء قاعدة بيانات خارجية تمتلكها بالكامل.`;
  } else {
    return `### 🧠 SWOT Strategic Analysis for: **${name}**
*Niche: ${niche} | Business Stage: ${stage}*

**1. Strengths (S):**
• Authority assets: **${strengths}**
• Low operating cost structures typical of digital business models.
• Direct connection and high feedback velocity from early customers.

**2. Weaknesses (W):**
• Operational challenges: **${weaknesses}**
• Limited hours available to execute marketing campaigns.
• Lack of systematized processes for client onboarding and follow-ups.

**3. Opportunities (O):**
• Growth pathways: **${opportunities}**
• Packaging a fast-action check-out product to convert followers into buyers.
• Hosting interactive webinars or community challenges to build massive trust.

**4. Threats (T):**
• External risks: **${threats}**
• High competition in generic niches drawing prospect attention away.
• Social media algorithm changes reducing organic reach.

---

### 🗺️ Cross-SWOT Strategy Guide:
• **Strength-Opportunity (SO):** Leverage your trust advantage (**${strengths}**) to package a high-margin digital program to capture **${opportunities}**.
• **Weakness-Opportunity (WO):** Offset **${weaknesses}** by setting up simple landing pages to automate the qualification of leads.
• **Defense Strategy (ST/WT):** Protect against **${threats}** by driving social media traffic into your owned database (emails/numbers) using a free guide as bait.`;
  }
}

function generateMarketingStrategy(isAR, name, budget, niche, channels, duration, pain, price, demo, transform) {
  const bStr = String(budget || '$500');
  const totalBudget = Number(bStr.replace(/[^0-9]/g, '')) || 0;
  
  if (isAR) {
    let budgetAllocation = '';
    if (totalBudget === 0) {
      budgetAllocation = `• **إستراتيجية الميزانية الصفرية (عضوية 100%):**
  - **70% صناعة محتوى:** ركز على منصة **${channels}** لنشر فيديوهات ريلز/تيك توك يومية تحكي عن المشكلة: "**${pain}**".
  - **20% مجموعات ومجتمعات:** تواصل مباشر في المجموعات المتخصصة وقدم إجابات وحلولاً مجانية لبناء سمعة طيبة.
  - **10% التسويق المباشر:** ابدأ بمراسلة العملاء المحتملين الذين تفاعلوا مع منشوراتك وعرض دليل مجاني عليهم.`;
    } else {
      budgetAllocation = `• **توزيع ميزانيتك التسويقية المقدرة بـ ($${totalBudget}):**
  - **60% إعلانات تحويل:** توجيه إعلانات ممولة مستهدفة على **${channels}** لاستقطاب العملاء المهتمين بـ "${transform}".
  - **20% إعلانات إعادة استهداف (Retargeting):** لزيادة ثقة العملاء الذين زاروا صفحة هبوطك ولم يشتروا بعد.
  - **20% كفاءة أدوات وبناء صفحات الهبوط وأتمتة رسائل التليجرام والـ CRM.`;
    }

    return `### 📣 الخطة التسويقية الاستشارية الشاملة لـ ${name}

**1. قمع المبيعات المقترح (Sales Funnel Blueprint):**
• **قمة القمع (جذب الانتباه):** نشر مقاطع فيديو قصيرة تفاعلية على **${channels}** تتحدث مباشرة عن ألم العميل: "**${pain}**".
• **منتصف القمع (بناء الثقة):** تقديم مغناطيس ليد مجاني (مثل دليل إرشادي أو ملف Excel مبسط) يحل مشكلة صغيرة فوراً للجمهور المستهدف (**${demo}**).
• **قاعدة القمع (إتمام البيع):** تقديم العرض الرئيسي بقيمة **${price}** (المدة: **${duration}**) والذي يقدم تحولاً واضحاً: "${transform}".

**2. توزيع وإدارة الميزانية التسويقية:**
${budgetAllocation}

**3. جدول إطلاق تفصيلي لـ 30 يوماً:**
• **الأسبوع الأول (التجهيز والتأصيل):** كتابة وتجهيز المغناطيس المجاني وتجهيز صفحة الهبوط لاستقبال الزوار.
• **الأسبوع الثاني (الإطلاق العضوي والتمويل):** نشر 3 فيديوهات قصيرة تدعو للتسجيل، وتفعيل إعلان ممول بسيط بقيمة 5$ يومياً يستهدف شريحة **${demo}**.
• **الأسبوع الثالث (التأهيل التلقائي):** ربط أرقام المسجلين بـ CRM وإرسال رسالة ترحيبية آلية تحتوي على رابط الدليل المجاني.
• **الأسبوع الرابع (تقديم العرض):** إرسال رسالة متابعة للعملاء المهتمين تحتوي على دعوة حصرية للانضمام لعرضك بقيمة **${price}** مع بونص حصري لأول 10 مشترين فقط.`;
  } else {
    let budgetAllocation = '';
    if (totalBudget === 0) {
      budgetAllocation = `• **Zero-Budget Strategy (100% Organic):**
  - **70% Content Volume:** Post daily short-form videos on **${channels}** solving segments of "**${pain}**".
  - **20% Direct Messaging & Networking:** Actively connect with prospects in target communities by providing high-value answers.
  - **10% Warm Outreach:** Reach out to users who engage with your content and offer your free resource.`;
    } else {
      budgetAllocation = `• **Budget Allocation Blueprint (Total: $${totalBudget}):**
  - **60% Conversion Campaigns:** Run targeted social ads on **${channels}** promoting your transformation: "${transform}".
  - **20% Retargeting Campaigns:** Re-engage visitors who browsed your sales page but did not convert.
  - **20% Software & Tech Stack:** Invest in landing page optimization, follow-up automations, and CRM management tools.`;
    }

    return `### 📣 CMO Marketing & Acquisition Strategy for ${name}

**1. Structured Sales Funnel:**
• **Top of Funnel (Awareness):** Address the core pain point "**${pain}**" via viral short-form content on **${channels}**.
• **Middle of Funnel (Trust):** Drive interested traffic to download a free cheat sheet tailored for "**${demo}**".
• **Bottom of Funnel (Conversion):** Pitches your premium program priced at **${price}** (Duration: **${duration}**) promising the transformation: "${transform}".

**2. Acquisition Budget Allocation:**
${budgetAllocation}

**3. Tactical 30-Day Launch Blueprint:**
• **Days 1-7 (Setup Phase):** Construct your free resource (lead magnet) and launch your landing page.
• **Days 8-15 (Traffic Induction):** Publish content leading to your free resource. Set up tracking and initiate paid targeting.
• **Days 16-22 (Follow-up Automation):** Sync registered contacts with CRM. Implement automatic delivery.
• **Days 23-30 (Launch & Pitch):** Open early registrations for your **${price}** core offer with a 48-hour discount hook.`;
  }
}

function generateRoadmap(isAR, rmCurrent, rmGoal, rmHours, rmChannel, pain, price) {
  const currentStr = String(rmCurrent || '$0');
  const goalStr = String(rmGoal || '$5,000');
  const currentNum = Number(currentStr.replace(/[^0-9]/g, '')) || 0;
  const goalNum = Number(goalStr.replace(/[^0-9]/g, '')) || 5000;
  const gap = goalNum - currentNum;
  
  const localizedChannel = isAR ? getAR(rmChannel, 'إنستجرام') : rmChannel;
  const localizedHours = isAR ? getAR(rmHours, '١٠-٢٠ ساعة أسبوعياً') : rmHours;

  if (isAR) {
    return `### 🗺️ خطة الـ 90 يوماً الاستراتيجية لمضاعفة الإيرادات
*الهدف المالي: الانتقال من ${currentStr} إلى ${goalStr} (الفجوة المستهدفة: $${gap})*
*وقت العمل المتاح: ${localizedHours} | القناة التسويقية الأساسية: ${localizedChannel}*

**الشهر الأول: التأسيس وجذب العملاء المهتمين (الأسابيع 1-4)**
• **الأسبوع 1:** قم بإعداد دليل إرشادي أو نموذج عملي (PDF) يحل مشكلة: "**${pain}**". هذا سيكون مغناطيس جذب العملاء الخاص بك.
• **الأسبوع 2:** صمم صفحة هبوط مبسطة لجمع المشتركين مجاناً. تأكد من إدراج رقم التليجرام ليكون للتواصل المباشر.
• **الأسبوع 3:** ابدأ بنشر 3-4 مقاطع فيديو/ريلز أسبوعياً على منصة **${localizedChannel}** تشرح فيها أسباب مشكلة الجمهور وتدعوهم لتحميل دليلك من الرابط.
• **الأسبوع 4:** أرسل رسالة ترحيب تلقائية للمسجلين لتقديم نفسك واقتراح مكالمة استكشافية أو إرسال تفاصيل عرضك بقيمة **${price}**.

**الشهر الثاني: إطلاق العرض والتحقق من الاستعداد المالي (الأسابيع 5-8)**
• **الأسبوع 5-6:** أجرِ مقابلات مع المسجلين في الأسبوع الماضي، واجمع الملاحظات لتحسين عرضك الأساسي بقيمة **${price}**.
• **الأسبوع 7-8:** افتح باب التسجيل لـ 10 مشتركين فقط كدفعة أولى للحصول على الخدمة أو الكورس مع تقديم خصم مؤقت وبونص دعم خاص.

**الشهر الثالث: التوسع وأتمتة المبيعات (الأسابيع 9-12)**
• **الأسبوع 9-10:** عزز التسويق على منصة **${localizedChannel}** من خلال نشر آراء المشتركين الأوائل وقصص نجاحهم.
• **الأسبوع 11-12:** قم بأتمتة المتابعة بالكامل في نظام الـ CRM وأطلق حملات ترويجية إضافية للوصول لهدفك المالي البالغ **${goalStr}** شهرياً بانتظام.`;
  } else {
    return `### 🗺️ 90-Day Step-by-Step Growth Roadmap
*Financial Target: Scale from ${currentStr} to ${goalStr} (Target Gap: $${gap})*
*Execution Plan: Working ${localizedHours} using ${localizedChannel} as primary channel*

**Month 1: Infrastructure & Audience Capture (Weeks 1-4)**
• **Week 1:** Package a high-value cheat sheet or tool solving: "**${pain}**". This acts as your lead magnet.
• **Week 2:** Create a conversion-ready landing page via UpKlick. Sync it with your lead database.
• **Week 3:** Publish 3 reels/TikToks/posts weekly on **${localizedChannel}** addressing this pain point and pointing to your link.
• **Week 4:** Trigger a welcome email or Telegram follow-up sequence presenting your core program priced at **${price}**.

**Month 2: Core Offer Validation & Beta Launch (Weeks 5-8)**
• **Week 5-6:** Interact with your early leads. Adapt features based on real conversations.
• **Week 7-8:** Open beta slots for your **${price}** offering. Offer an exclusive bonus to spark urgency.

**Month 3: Automated Scaling & Pipeline Optimization (Weeks 9-12)**
• **Week 9-10:** Showcase early testimonials and client wins across **${localizedChannel}**.
• **Week 11-12:** Optimize checkout funnels, run retargeting sequences, and secure consistent monthly recurring revenue to hit your **${rmGoal}** target.`;
  }
}

function generateCompetitorFinder(isAR, name, niche, pain, demo, price, transform) {
  if (isAR) {
    return `### 🔍 تقرير تحليل المنافسين ومكامن الفرص في السوق
*المشروع: ${name} | النيش: ${niche}*

**1. تصنيف المنافسين الرئيسيين في السوق:**
• **المنافسون ذوو التكلفة المرتفعة (أكثر من 200$):** يقدمون استشارات وحلولاً شاملة لكنها باهظة ومكلفة على الفئة المستهدفة (**${demo}**).
• **المنافسون التعليميون (أقل من 20$):** يقدمون كورسات مسجلة رخيصة على منصات عامة بدون أي توجيه أو دعم حقيقي، مما يجعل نسبة الإكمال ضعيفة.

**2. الفجوة السوقية المتاحة لمشروعك (Market Gap):**
• يبحث الجمهور (**${demo}**) عن حل عملي وتوجيه داعم متوسط التكلفة يحل ألمهم الرئيسي وهو: "**${pain}**".
• **فرصتك الذهبية:** تقديم الخدمة أو البرنامج التفاعلي بقيمة **${price}** والذي يوفر التوازن المثالي بين التعليم المسجّل والمتابعة الأسبوعية المركزة لضمان حدوث التحول: "${transform}".

**3. استراتيجية الإعلانات الممولة - 3 زوايا إعلانية ناجحة:**

#### 📐 الزاوية الأولى: التركيز على ألم العميل (Pain-Focused Angle)
* **المفهوم البصري:** شخص يبدو متعباً أمام لابتوب مع نصوص متحركة سريعة.
* **الهوك الرئيسي:** "تعبت من قلة الاستمرارية والانتشار العضوي الضعيف؟"
* **نص الإعلان:** "معظم صناع المحتوى يعتقدون أنهم بحاجة للعمل 24 ساعة. السر هو اتباع نظام مبيعات منظم ومؤتمت. احصل على دليلي المجاني اليوم."
* **دعوة للتفاعل (CTA):** تحميل الدليل مجاناً.

#### 📐 الزاوية الثانية: التركيز على النتيجة والتحول (Result-Focused Angle)
* **المفهوم البصري:** لقطة شاشة لنتائج حقيقية أو لوحة تحكم أرباح تنمو.
* **الهوك الرئيسي:** "كيف تحقق ${transform} في أقل من ${price}؟"
* **نص الإعلان:** "بدون تعقيد وبأبسط الأدوات. خطتنا الموجهة تساعدك على بناء مصدر دخل مستقر بمعدل عمل بضع ساعات أسبوعياً."
* **دعوة للتفاعل (CTA):** اشترك الآن.

#### 📐 الزاوية الثالثة: مقارنة ذكية (Comparison Angle)
* **المفهوم البصري:** جدول مقارنة بسيط يوضح الفرق بين كورس مسجل بارد وبرنامجك التفاعلي الداعم.
* **الهوك الرئيسي:** "لماذا تفشل 90% من الكورسات المسجلة في تحقيق أهدافك؟"
* **نص الإعلان:** "نحن لا نبيعك فيديوهات فقط. نحن نمنحك نظاماً تشغيلياً متكاملاً مع دعم يومي ومتابعة مستمرة لتضمن نتائج حقيقية."
* **دعوة للتفاعل (CTA):** احجز مقعدك اليوم.`;
  } else {
    return `### 🔍 Competitor Finder & Ad Intelligence
*Company: ${name} | Market: ${niche}*

**1. Competitor Landscape Map:**
• **High-Ticket Agencies/Consultants:** Charge over $200. Out of budget for most freelancers/creators.
• **Generic Course Warehouses:** Selling $15 lectures with zero access to the mentor, resulting in a 5% completion rate.

**2. Your Market Opportunity (The Gap):**
• Prospects (**${demo}**) are seeking high-guidance transformation to solve "**${pain}**" without paying thousands.
• **Your Edge:** Introduce a structured hybrid solution priced at **${price}** delivering: "${transform}".

**3. High-Converting Social Ad Templates:**

#### 📐 Angle 1: The Agitation Hook (Pain Focus)
* **Visual:** Close-up of a creator staring at analytics with frustration.
* **Text Hook:** "Still struggling with inconsistent reach and zero leads?"
* **Body Copy:** "Stop posting 5 times a day hoping for an algorithm miracle. You need a structured customer acquisition system. Get our free roadmap to see how."
* **CTA:** Download Free Guide

#### 📐 Angle 2: The Direct Transformation (Value Focus)
* **Visual:** A split screen showing 'Before' (unorganized files) and 'After' (smooth UpKlick dashboard).
* **Text Hook:** "The exact framework to achieve ${transform}."
* **Body Copy:** "Get step-by-step guidance to scale your brand to your target goal without creative burnout. All inside our core program for just ${price}."
* **CTA:** Learn More

#### 📐 Angle 3: The Comparison (Authority Focus)
* **Visual:** Simple comparison chart contrasting 'Pre-recorded Courses' vs. 'Your Supported Program'.
* **Text Hook:** "Stop buying courses you'll never finish."
* **Body Copy:** "Information is free. Implementation is what counts. Join our supported blueprint and get daily community help to launch your business."
* **CTA:** Join the Cohort`;
  }
}

function generateVideoScript(isAR, name, niche, demo, pain, hours, channels, goals) {
  if (isAR) {
    return `### 🎬 حزمة سكريبتات الفيديوهات القصيرة والترويجية لـ ${name}

#### 📱 سكريبت 1: فيديو ريلز/تيك توك تفاعلي (فيديو سريع الانتشار - 60 ثانية)
* **المشهد البصري:** تبدأ الكاميرا بتصوير وجهك مباشرة بابتسامة وهدوء، وتظهر كلمات بارزة ملونة على الشاشة.
* **الصوت:** موسيقى حماسية هادئة بالخلفية.
* **الكلام (المنطوق):**
  "إذا كنت من **${demo}** وتعبت من مشكلة **${pain}**... يرجى التوقف عن التمرير لثوانٍ معدودة.
  الخطأ الأكبر ليس في جودة محتواك، الخطأ هو تشتيت نفسك في كل المنصات. 
  بدلاً من ذلك، ركز مجهودك بمعدل **${hours}** فقط على منصة **${channels}** لبناء قمع مبيعات بسيط.
  هذا هو الطريق الوحيد لتصل لهدفك وهو **${goals}** دون تعقيد أو إرهاق.
  لقد لخصت هذه الطريقة خطوة بخطوة في دليل مجاني تماماً.
  اكتب كلمة 'نمو' في التعليقات وسأرسله لك فوراً في رسائل الخاص!"
* **ملاحظة للمونتاج:** أضف تكبير زوم خفيف عند كلمة "التوقف" وأظهر لقطة سريعة لصفحة هبوطك.

---

#### 📚 سكريبت 2: فيديو تعليمي قصير القيمة (Value Reel - 45 ثانية)
* **المشهد البصري:** تقوم بالكتابة على سبورة بيضاء أو تعرض شاشة الآيباد وهي تشرح نموذج عملك.
* **الكلام (المنطوق):**
  "إليك الخطوات الثلاث لتخطي عقبة **${pain}** بشكل نهائي:
  أولاً: حدد عرضاً واحداً بسيطاً يحل مشكلة عاجلة لعملائك.
  ثانياً: ابنِ صفحة هبوط ذات رابط واحد واجعلها واضحة ومباشرة.
  ثالثاً: تواصل مع المهتمين بشكل منظم ومستمر عبر نظام متابعة CRM.
  إذا أردت رؤية كيف نطبق هذا عملياً لمشاريع **${niche}**، اضغط على الرابط في البايو!"

---

#### 💰 سكريبت 3: فيديو العرض المباشر (Direct Promotion - 30 ثانية)
* **المشهد البصري:** لقطة مقربة تظهر ثقتك وتتحدث بجدية وحماس للمشاهد.
* **الكلام (المنطوق):**
  "هل أنت مستعد لنقل مشروعك في **${niche}** للمستوى التالي؟
  لقد فتحنا باب التسجيل في برنامجنا العملي الجديد المصمم خصيصاً لمساعدتك على تحقيق: ${goals}.
  العرض شامل الدعم اليومي ومتابعة صفقاتك خطوة بخطوة.
  المقاعد محدودة جداً لنضمن الجودة. تفضل بزيارة موقعنا وسجل اليوم لتضمن مكانك!"`;
  } else {
    return `### 🎬 Custom High-Converting Video Scripts for ${name}

#### 📱 Script 1: Viral Short-Form Video (Reels/TikTok - 60s)
* **Visual:** Pointing to the screen with dynamic captions flashing.
* **Audio:** High-energy, low-volume background track.
* **Voiceover:**
  "If you are part of the **${demo}** cohort and you are sick of "**${pain}**", stop scrolling.
  The issue isn't your capability. It is trying to do 100 things at once.
  Instead, devote your **${hours}** on **${channels}** to build a single client funnel.
  That is the direct path to hit **${goals}** without creative burnout.
  I mapped out this exact setup inside a free step-by-step checklist.
  Comment 'READY' below and I will send it to your DMs right now!"
* **Editor Note:** Cut on every sentence, keep the pacing fast.

---

#### 📚 Script 2: Educational Actionable Reel (Value Focus - 45s)
* **Visual:** Screencast of you organizing a lead pipeline in UpKlick.
* **Voiceover:**
  "Here is how you actually bypass "**${pain}**" in 3 steps:
  First, package a specific entry-level resource.
  Second, drive traffic to a high-converting landing page.
  Third, use a dedicated follow-up workflow so no hot client gets lost.
  Want to see how we build this out for "**${niche}**" brands? Check the link in my bio!"

---

#### 💰 Script 3: Core Offer Promo Pitch (Sales Focus - 30s)
* **Visual:** Direct talking head camera angle, presenting confidence.
* **Voiceover:**
  "Ready to take your business in **${niche}** seriously?
  Our core program is now open. We show you exactly how to scale to **${goals}** using our proven templates.
  We offer direct weekly feedback and templates.
  Click the link below to view details and secure your slot before the cohort fills up."`;
  }
}

function generateTelegramAutomation(isAR, name, niche, pain, goals, price) {
  if (isAR) {
    return `### 💬 سيناريو رسائل التليجرام الآلية والمتابعة الذكية لـ **${name}**

**الرسالة الأولى (ترسل تلقائياً فور تسجيل العميل لتحميل الملف المجاني):**
"مرحباً [اسم العميل]! أهلاً بك 🌸 
يسعدنا اهتمامك بتحميل دليل التخلص من عقبة: **${pain}**. 
إليك رابط التحميل المباشر والآمن: [رابط الصفحة/الملف].
أتمنى أن تجد فيه قيمة حقيقية تساعدك في مشروعك. إذا كان لديك أي استفسار حول تطبيقات **${niche}**، أنا هنا للمساعدة دائماً!"

---

**الرسالة الثانية (متابعة ودية بعد 24 ساعة لبناء علاقة):**
"مرحباً [اسم العميل]، أتمنى أنك تقضي يوماً جميلاً! 🌟
أردت فقط التأكد من تحميلك للملف بنجاح. 
غالباً ما يخبرني العملاء أن المشكلة الأكبر لديهم هي **${pain}**، هل هذا هو التحدي الأكبر الذي تواجهه حالياً في عملك أيضاً؟ 
يسعدني جداً سماع تجربتك!"

---

**الرسالة الثالثة (تقديم العرض بعد 48 ساعة من تحميل الملف):**
"أهلاً مجدداً [اسم العميل]! 👋
إذا كنت تسعى بجدية لتحقيق هدفك المالي وهو **${goals}** وتود اختصار الوقت والجهد...
فقد صممنا برنامجنا الخاص بقيمة **${price}** لمساعدتك في بناء نظام عمل متكامل.
العرض يشمل متابعة مباشرة ودعماً أسبوعياً. 
هل ترغب في معرفة التفاصيل وكيف يمكننا مساعدتك؟ أجب بـ 'نعم' وسأرسل لك كافة المعلومات!"`;
  } else {
    return `### 💬 3-Step Telegram Follow-up & CRM Automation Sequence

**Message 1 (Sent instantly upon lead magnet request):**
"Hi [Lead Name]! Thanks for checking out our guide to solve "**${pain}**". 🚀
Here is your direct download link: [Link].
Hope it brings immense value to your business. Let me know if you have any questions regarding your strategy in **${niche}**!"

---

**Message 2 (Friendly check-in 24 hours later):**
"Hey [Lead Name], hope you're having a productive day! 🌟
Just wanted to see if you got a chance to download the guide.
Most business owners in **${niche}** tell me that "**${pain}**" is their biggest bottleneck. Are you facing a similar challenge? Love to hear your thoughts!"

---

**Message 3 (Soft Pitch 48 hours later):**
"Hi [Lead Name]! 👋
If you are serious about hitting your target of **${goals}** and want a fast-track roadmap...
We have launched our core implementation program priced at **${price}**.
It includes weekly feedback and direct support.
Would you like to see if it's a fit for you? Reply 'YES' and I'll send over the details!"`;
  }
}

function generateCRMInsights(isAR, context) {
  const leads = context?.crm?.leads || [];
  const activeLeads = leads.filter(l => l && l.stage !== 'closed' && l.stage !== 'lost' && l.stage !== 'won');
  
  if (isAR) {
    if (leads.length === 0) {
      return `### 🎯 تحليلات إدارة العملاء (CRM Insights)
• **الحالة:** لا يوجد عملاء مسجلين حالياً في نظام الـ CRM الخاص بك.
• **خطة عمل مقترحة لتعبئة الخط المالي:**
  1. توجه إلى قسم "صفحات الهبوط" وصمم صفحة عرض مبسطة.
  2. شارك الرابط على منصات تواصلك لجلب أول 10 عملاء مهتمين.
  3. سجل بياناتهم هنا لتتبع خطوات إتمام صفقاتهم بشكل احترافي.`;
    }

    const stageBreakdown = { new: 0, contacted: 0, qualified: 0, proposal: 0 };
    leads.forEach(l => {
      if (l && l.stage && stageBreakdown[l.stage] !== undefined) {
        stageBreakdown[l.stage]++;
      }
    });

    let bottleneck = "قيد الدراسة";
    let recommendation = "";
    if (stageBreakdown.new > stageBreakdown.contacted) {
      bottleneck = "تراكم العملاء الجدد دون تواصل";
      recommendation = "لديك عملاء جدد لم يتم الاتصال بهم بعد! نوصي بتخصيص ساعة واحدة اليوم لمراسلتهم عبر التليجرام ونقلهم لمرحلة 'تم التواصل'.";
    } else if (stageBreakdown.proposal > 0) {
      bottleneck = "صفقات معلقة في انتظار رد العرض المالي";
      recommendation = "هناك عملاء استلموا عروض الأسعار ولم يقرروا بعد. تواصل معهم لتقديم عرض إضافي أو بونص مؤقت لإتمام التعاقد.";
    } else {
      bottleneck = "الحاجة لتأهيل العملاء المهتمين";
      recommendation = "ركز على تحديد مدى ملائمة العملاء المتواصل معهم لمعرفة ما إذا كانوا مؤهلين لشراء خدماتك الأساسية.";
    }

    let leadsList = activeLeads.slice(0, 3).map(l => {
      return `• **${l.name}** | القيمة المتوقعة: \`$${l.value || 0}\` (المرحلة الحالية: **${getAR(l.stage)}**). 
  *قالب رسالة مقترحة للمتابعة:*
  "مرحباً ${l.name}، أتمنى أنك بخير! أردت المتابعة معك بخصوص تفاصيل عرضنا الأخير. هل لديك أي استفسار يمكننا توضيحه لك اليوم؟"`;
    }).join('\n\n');

    return `### 🎯 تحليلات ذكاء المبيعات ونظام الـ CRM:
• **إجمالي العملاء باللوحة:** **${leads.length}** عميل.
• **الصفقات النشطة قيد المتابعة:** **${activeLeads.length}** صفقات.
• **عقبة المبيعات الحالية رصداً:** **${bottleneck}**.
• **💡 توصية المبيعات اليومية:** ${recommendation}

---

#### 📞 مقترحات المتابعة المخصصة لعملائك النشطين:
${leadsList}`;
  } else {
    if (leads.length === 0) {
      return `### 🎯 CRM Pipeline Intelligence
• **Status:** No leads recorded in your CRM dashboard yet.
• **Recommended Action Plan:**
  1. Build a high-value lead magnet and set up an UpKlick landing page.
  2. Direct social media traffic to this landing page to generate sign-ups.
  3. Log prospective buyers in this CRM board to manage pipeline velocity.`;
    }

    const stageBreakdown = { new: 0, contacted: 0, qualified: 0, proposal: 0 };
    leads.forEach(l => {
      if (l && l.stage && stageBreakdown[l.stage] !== undefined) {
        stageBreakdown[l.stage]++;
      }
    });

    let bottleneck = "Pipeline Analysis";
    let recommendation = "";
    if (stageBreakdown.new > stageBreakdown.contacted) {
      bottleneck = "Uncontacted New Leads";
      recommendation = "You have fresh leads sitting in 'New Lead' stage. Allocate 30 minutes today to send introduction messages.";
    } else if (stageBreakdown.proposal > 0) {
      bottleneck = "Proposals Sent Pending Decision";
      recommendation = "Leads are stuck at proposal stage. Send a gentle reminder offering a brief Q&A call to remove conversion friction.";
    } else {
      bottleneck = "Lead Qualification Needed";
      recommendation = "Focus on moving contacted leads into qualified deals by determining budget alignment.";
    }

    let leadsList = activeLeads.slice(0, 3).map(l => {
      return `• **${l.name}** | Value: \`$${l.value || 0}\` (Current Stage: **${l.stage}**).
  *Suggested Quick Follow-up Copy:*
  "Hi ${l.name}, just checking in to see if you had any questions on the proposal details we shared. Let me know if you want to hop on a quick call!"`;
    }).join('\n\n');

    return `### 🎯 CRM Pipeline & Sales Analysis:
• **Total Leads Registered:** **${leads.length}**
• **Active Pipeline Volume:** **${activeLeads.length} deals**
• **Primary Sales Bottleneck:** **${bottleneck}**
• **💡 Sales Action Item:** ${recommendation}

---

#### 📞 Actionable Follow-up Guides for Active Deals:
${leadsList}`;
  }
}

function generateFinanceInsights(isAR, context) {
  const entries = context?.finance?.entries || [];
  const totalIncome = entries.filter(e => e && e.type === 'income').reduce((a, b) => a + Number(b.amount || 0), 0);
  const totalExpenses = entries.filter(e => e && e.type === 'expense').reduce((a, b) => a + Number(b.amount || 0), 0);
  const profit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? Math.round((profit / totalIncome) * 100) : 100;

  // Retrieve user's configured currency symbol & code safely
  let symbol = '$';
  let currencyCode = 'USD';
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('upklick_currency');
      if (saved) {
        const parsed = JSON.parse(saved);
        symbol = parsed.symbol || '$';
        currencyCode = parsed.code || 'USD';
      }
    }
  } catch (e) {}

  const formatLocalVal = (val) => {
    const formatted = Number(val).toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    if (currencyCode === 'SAR') {
      return isAR ? `${formatted} ريال` : `${formatted} SAR`;
    }
    const isArabicSymbol = ['د.إ', 'د.ك', 'ر.ق', '.د.ب', 'ر.ع', 'ج.م', 'د.ا', 'د.م', 'دج', 'ع.د'].includes(symbol);
    if (isArabicSymbol) {
      return isAR ? `${formatted} ${symbol}` : `${formatted} ${currencyCode}`;
    }
    return isAR ? `${symbol}${formatted}` : `${symbol}${formatted}`;
  };

  if (isAR) {
    if (entries.length === 0) {
      return `### 💰 الوضع المالي للبزنس
• **تنبيه:** لم يتم تسجيل أي معاملات مالية هذا الشهر.
• **نصيحة استباقية:** تتبع إيراداتك ومصاريفك بانتظام هو الأساس لمعرفة ربحية مشروعك الحقيقية. توجه لقسم "المالية" وأضف معاملاتك التجريبية اليوم.`;
    }

    let leakCheck = "وضع التدفق النقدي ممتاز ومتوازن.";
    if (totalExpenses > totalIncome * 0.5) {
      leakCheck = `⚠️ **ارتفاع المصاريف التشغيلية:** مصاريفك تمثل **${100 - profitMargin}%** من الدخل. نوصي بمراجعة الاشتراكات الدورية والأدوات غير المستغلة لرفع صافي الأرباح.`;
    }

    return `### 💰 تحليل المؤشرات المالية الذكي لشهر ${new Date().toLocaleString('ar-EG', { month: 'long' })}:
• **إجمالي الإيرادات المسجلة:** **${formatLocalVal(totalIncome)}**
• **إجمالي المصاريف التشغيلية:** **${formatLocalVal(totalExpenses)}**
• **صافي الأرباح:** **${formatLocalVal(profit)}**
• **هامش الربحية الصافي:** **${profitMargin}%**

---

#### 🔍 تقرير تسريب وهدر النقدية:
• ${leakCheck}

#### 💡 خطة تحسين التدفقات النقدية المقترحة:
1. **أعد استثمار الأرباح:** خصص 20% من صافي أرباحك البالغ **${formatLocalVal(profit)}** لإعلانات التسويق المدفوعة لإعادة ملء قمع المبيعات.
2. **الفوترة الفورية:** تفادى التأخر في تحصيل أموال الصفقات المغلقة وصمم فواتير واضحة لعملائك ليدفعوا مباشرة.`;
  } else {
    if (entries.length === 0) {
      return `### 💰 Financial Performance & Health
• **Alert:** No transaction data recorded for the current cycle.
• **Action Point:** Log your monthly revenue and overhead under the "Finance" panel to begin calculating profitability benchmarks.`;
    }

    let leakCheck = "Cash flow ratio looks balanced and sound.";
    if (totalExpenses > totalIncome * 0.5) {
      leakCheck = `⚠️ **Overhead Risk Alert:** Operational expenses consume **${100 - profitMargin}%** of total income. Inspect active subscriptions to trim unnecessary tech stack costs.`;
    }

    return `### 💰 Business Financial Audit:
• **Total Revenue Earned:** **${formatLocalVal(totalIncome)}**
• **Total Operational Cost:** **${formatLocalVal(totalExpenses)}**
• **Net Take-home Profit:** **${formatLocalVal(profit)}**
• **Net Profit Margin:** **${profitMargin}%**

---

#### 🔍 Cost Leakage & Budget Review:
• ${leakCheck}

#### 💡 Financial Acceleration Advice:
1. **Reinvestment Ratio:** Reallocate 15-20% of your **${formatLocalVal(profit)}** profit margin back into lead generation campaigns.
2. **Optimize Operational Leaks:** Reduce processing time and implement upfront payments on contracts to maintain cash flow velocity.`;
  }
}

function generateTaskPriorities(isAR, context) {
  const tasks = context?.tasks?.items || [];
  const openTasks = tasks.filter(t => t && !t.done);
  
  if (isAR) {
    if (openTasks.length === 0) {
      return `### 🎯 ترتيب الأولويات وإدارة الإنتاجية اليوم
• **الحالة:** لا توجد مهام معلقة أو مفتوحة اليوم! عمل رائع ومثالي.
• **توصية:** يمكنك استثمار هذا الفراغ في التخطيط للأسبوع القادم أو تحسين قمع التسويق الخاص بك.`;
    }

    const highPri = openTasks.filter(t => t && t.priority === 'high');
    const normalPri = openTasks.filter(t => t && (t.priority === 'normal' || t.priority === 'medium' || !t.priority));

    let highMarkup = highPri.length > 0 
      ? highPri.map(t => `• 🔥 **${t.title}** (أولوية قصوى) - يجب البدء بها فوراً اليوم.`).join('\n')
      : '• لا توجد مهام ذات أولوية عالية اليوم.';

    let normalMarkup = normalPri.length > 0
      ? normalPri.slice(0, 3).map(t => `• 📌 **${t.title}** - أولوية عادية.`).join('\n')
      : '• لا توجد مهام أخرى قيد الانتظار.';

    return `### 🎯 أولوياتك التشغيلية اليومية:
بناءً على المهام المفتوحة الـ **${openTasks.length}** في لوحتك، إليك ترتيب العمل الأمثل:

#### 1️⃣ مهام يجب تنفيذها اليوم أولاً (أولوية قصوى):
${highMarkup}

#### 2️⃣ مهام تالية (أولوية عادية):
${normalMarkup}

---

#### 💡 نصيحة الإنتاجية اليومية:
ابدأ بتنفيذ المهمة الأولى الأكثر صعوبة في الصباح الباكر دون مراجعة الهاتف أو وسائل التواصل الاجتماعي لتفادي التشتت الذهني وضياع ساعات العمل الثمينة.`;
  } else {
    if (openTasks.length === 0) {
      return `### 🎯 Operational Task Prioritization
• **Status:** Zero pending tasks on your agenda! Outstanding execution.
• **Action:** Use this uptime to map new goals or check feedback from recent clients.`;
    }

    const highPri = openTasks.filter(t => t && t.priority === 'high');
    const normalPri = openTasks.filter(t => t && (t.priority === 'normal' || t.priority === 'medium' || !t.priority));

    let highMarkup = highPri.length > 0 
      ? highPri.map(t => `• 🔥 **${t.title}** (High Priority) - Complete this first today.`).join('\n')
      : '• No high priority tasks listed.';

    let normalMarkup = normalPri.length > 0
      ? normalPri.slice(0, 3).map(t => `• 📌 **${t.title}** (Normal Priority)`).join('\n')
      : '• No other pending tasks.';

    return `### 🎯 Daily Focus & Operational Priorities:
Analyzing your **${openTasks.length}** open roadmap items:

#### 1️⃣ High Impact Tasks (Do First):
${highMarkup}

#### 2️⃣ Secondary Steps (Do Next):
${normalMarkup}

---

#### 💡 Productivity Tip:
Focus on 'eating the frog' — completing your most challenging high-priority task first thing in the morning to drive maximum operational velocity.`;
  }
}

function generateWeeklySummary(isAR, context, name, channels, goals) {
  const leads = context?.crm?.leads || [];
  const tasks = context?.tasks?.items || [];
  const entries = context?.finance?.entries || [];

  const completedTasks = tasks.filter(t => t && t.done).length;
  const activeLeads = leads.filter(l => l && l.stage !== 'closed' && l.stage !== 'lost').length;
  const totalIncome = entries.filter(e => e && e.type === 'income').reduce((a, b) => a + Number(b.amount || 0), 0);
  const totalExpenses = entries.filter(e => e && e.type === 'expense').reduce((a, b) => a + Number(b.amount || 0), 0);

  let healthScore = 50;
  if (leads.length > 0) healthScore += 15;
  if (tasks.length > 0) healthScore += 15;
  if (entries.length > 0) healthScore += 20;

  if (isAR) {
    return `### 📊 التقرير الأسبوعي الشامل لمشروع: **${name}**

• **الإنتاجية والعمليات:** تم إنجاز **${completedTasks}** مهمة بنجاح من أصل **${tasks.length}** مهام مخططة.
• **حالة المبيعات وقمع العملاء:** لديك **${activeLeads}** صفقات تجري متابعتها بنشاط حالياً.
• **مؤشرات التدفق المالي:** حققت إيرادات بقيمة **$${totalIncome}** مقابل نفقات تشغيل بلغت **$${totalExpenses}**.
• **مؤشر صحة البزنس الكلي:** **${healthScore}%** (مستوى جيد جداً ومتنامي).

---

#### 💡 التوصية الاستراتيجية للأسبوع القادم:
استمر في دعم قنواتك التسويقية على **${channels}** وصناعة محتوى يعالج آلام الجمهور لبناء ثقة كافية تقود لتحقيق هدفك الرئيسي: **${goals}**!`;
  } else {
    return `### 📊 Weekly Business Performance Summary for: **${name}**

• **Productivity Status:** Completed **${completedTasks}** out of **${tasks.length}** total operations.
• **Pipeline Activity:** Managing **${activeLeads}** active opportunities in CRM.
• **Weekly Financial Metrics:** Generated **$${totalIncome}** against **$${totalExpenses}** in operating costs.
• **Overall Business Health Score:** **${healthScore}%** (Healthy operational index).

---

#### 💡 Strategic Focus for the Upcoming Week:**
Continue expanding your outreach programs on **${channels}** to capture fresh leads, steering your company towards the goal: "${goals}".`;
  }
}

function generateRevenueLeaks(isAR, context) {
  const leads = context?.crm?.leads || [];
  const entries = context?.finance?.entries || [];

  const totalIncome = entries.filter(e => e && e.type === 'income').reduce((a, b) => a + Number(b.amount || 0), 0);
  const totalExpenses = entries.filter(e => e && e.type === 'expense').reduce((a, b) => a + Number(b.amount || 0), 0);

  const earlyLeads = leads.filter(l => l && (l.stage === 'lead' || l.stage === 'contacted' || l.stage === 'new'));
  const pendingValue = leads.filter(l => l && l.stage !== 'closed' && l.stage !== 'lost').reduce((a, b) => a + Number(b.value || 0), 0);

  if (isAR) {
    let leaks = [];
    if (totalExpenses > totalIncome * 0.5) {
      leaks.push(`• **ارتفاع التكاليف الجانبية:** المصاريف تلتهم **${Math.round((totalExpenses / (totalIncome || 1)) * 100)}%** من دخل البزنس. يرجى إلغاء الاشتراكات والبرمجيات غير المستخدمة.`);
    }
    if (earlyLeads.length > 2) {
      leaks.push(`• **عملاء معلقون في المراحل الأولى:** لديك **${earlyLeads.length}** عملاء مهتمين لم يتم تقديم عروض سعر لهم بعد، مما يقلل احتمالية شرائهم.`);
    }
    if (pendingValue > 100) {
      leaks.push(`• **قيمة معلقة غير مستغلة:** هناك صفقات بقيمة **$${pendingValue}** في الـ CRM لم يتم اتخاذ إجراء نهائي معها. المتابعة المتأخرة تسبب خسارة هذه المبالغ.`);
    }

    if (leaks.length === 0) {
      return `### 🔍 تقرير رصد تسريبات الإيرادات (Revenue Leaks)
• **النتيجة:** لا توجد تسريبات نقدية واضحة حالياً!
• أرقام الدخل والإنفاق ومعدل دوران المبيعات تبدو ممتازة. استمر في المتابعة الجيدة!`;
    }

    return `### 🔍 تقرير رصد تسريبات الإيرادات (Revenue Leaks)
لقد قمنا بتحليل أرقامك المالية وحالة عملائك، ورصدنا تسريبات محتملة للأرباح:

${leaks.join('\n')}

#### 💡 خطة سد تسريبات الأموال:
1. راسل العملاء المعلقين فوراً اليوم واعرض عليهم مكالمة استشارية سريعة.
2. تتبع بدقة كل دولار مصروف في لوحة المالية للسيطرة على تكاليف التشغيل.`;
  } else {
    let leaks = [];
    if (totalExpenses > totalIncome * 0.5) {
      leaks.push(`• **High Operational Overhead:** Cost burns **${Math.round((totalExpenses / (totalIncome || 1)) * 100)}%** of monthly revenue. Review SaaS stack tools.`);
    }
    if (earlyLeads.length > 2) {
      leaks.push(`• **Friction in Lead Qualification:** You have **${earlyLeads.length}** new leads stuck without formal pricing or proposal delivery.`);
    }
    if (pendingValue > 100) {
      leaks.push(`• **Stagnant Pipeline Value:** There is **$${pendingValue}** in pending proposals. Delayed follow-ups directly cause conversions to drop.`);
    }

    if (leaks.length === 0) {
      return `### 🔍 Revenue Leaks Audit
• **Result:** No cash flow leakages detected.
• Your financial ratios and sales pipeline velocity look clean and healthy.`;
    }

    return `### 🔍 Revenue Leaks Audit
Based on your metrics, we identified the following leaks in your operations:

${leaks.join('\n')}

#### 💡 Patching Plan:
1. Move leads from 'New/Contacted' to 'Proposal Sent' by offering a quick discovery session.
2. Review operational expenses monthly to maintain at least a 60% profit margin.`;
  }
}

function generateOpsSop(isAR, name, niche, stage) {
  if (isAR) {
    return `### ⚙️ الدليل التشغيلي القياسي (SOP) والمقترحات لـ **${name}**
*النيش: ${niche} | المرحلة الحالية: ${stage}*

#### 📋 1. إجراء تشغيل قياسي (SOP) لاستقطاب وتأهيل عملاء جدد:
* **الهدف:** تحويل المتابعين على شبكات التواصل لعملاء مسجلين في CRM خلال أقل من ٢٤ ساعة.
* **المسؤول:** صاحب البزنس أو مدير المبيعات.
* **الخطوات التفصيلية:**
  1. مراجعة التعليقات والرسائل الواردة يومياً الساعة ١٠ صباحاً والساعة ٦ مساءً.
  2. تقديم رابط الدليل المجاني للعميل فوراً دون بيع مباشر في أول رسالة.
  3. إذا أبدى العميل اهتماماً، يتم تسجيل اسمه ورقم هاتفه فوراً في لوحة CRM (مرحلة: **عميل جديد**).
  4. متابعة العميل بعد ٢٤ ساعة برسالة ودية لقياس رضاه عن الملف المجاني.

#### 📋 2. إجراء تشغيل قياسي (SOP) لإدارة المحتوى وتنسيق النشر أسبوعياً:
* **الهدف:** ضمان استمرارية النشر دون انقطاع لتفادي تراجع ريتش خوارزميات المنصة.
* **الخطوات:**
  1. كتابة وتصوير الفيديوهات القصيرة دفعة واحدة أسبوعياً (مثلاً كل سبت).
  2. جدولة المنشورات على منصات النشر المفضلة.
  3. الرد على أول ١٠ تعليقات في أول ٣٠ دقيقة من النشر لرفع تقييم الفيديو.

#### 💡 أفكار أتمتة مقترحة لتوفير الوقت:
* **ربط صفحات الهبوط بالتليجرام:** إرسال رسالة ترحيبية آلية لكل مسجل جديد دون تدخل يدوي.
* **أتمتة الفواتير والاشتراكات:** إصدار فاتورة إلكترونية تلقائية بمجرد تأكيد الصفقة في CRM.`;
  } else {
    return `### ⚙️ Standard Operating Procedures (SOPs) & Operations Plan
*Brand: ${name} | Niche: ${niche}*

#### 📋 SOP 1: Lead Qualification & Onboarding
* **Objective:** Move followers to CRM leads in under 24 hours.
* **Steps:**
  1. Monitor direct messages twice daily (10 AM and 6 PM).
  2. Offer the free checklist as a warm introduction without pitching a sale.
  3. Register interested responders into the CRM stage "New Lead".
  4. Follow up 24 hours later with a value-adding question.

#### 📋 SOP 2: Content Batching & Scheduling
* **Objective:** Maintain post consistency without daily creation stress.
* **Steps:**
  1. Dedicate 3 hours on Saturdays to batch and write video scripts.
  2. Schedule postings ahead of time.
  3. Interact with commenters during the first 30 minutes of publishing.

#### 💡 Recommended Automations:
* **Opt-in to Telegram Automation:** Automatically deliver lead magnets via Telegram API upon signup.
* **Invoice Triggers:** Connect CRM won deals to automatic billing software to eliminate manual invoicing.`;
  }
}

function generateDigitalProductIdeas(isAR, name, niche, price, transform) {
  if (isAR) {
    return `### 📦 مقترحات وأفكار المنتجات الرقمية لـ **${name}**
*النيش: ${niche}*

#### 💡 الفكرة الأولى: قوالب جاهزة ونماذج عمل ميسرة (Low-Ticket Template)
* **اسم المنتج المقترح:** دليل التميز العملي لـ ${niche}.
* **السعر المقترح:** **${price}** (شراء فوري من صفحة الهبوط).
* **القيمة المقدمة:** يوفر على المشاهدين عناء البدء من الصفر ويسرع تحقيق: "${transform}".
* **قنوات التسويق:** رابط مباشر في البايو، ريلز قصيرة تشرح كيفية الاستفادة منه.

#### 💡 الفكرة الثانية: دورة تدريبية مكثفة مسجلة (Hybrid Masterclass)
* **الاسم:** كورس التأسيس الشامل والتحول لـ ${niche}.
* **السعر المقترح:** **$99 - $149**.
* **مواصفات العرض:** فيديوهات مسجلة قصيرة لا تتعدى ساعتين إجمالاً، مع توفير جروب دعم تليجرام/تليجرام للإجابة على الأسئلة.
* **القيمة:** يمنحهم خطة عمل واضحة لتنفيذ التحول الأساسي.

#### 📋 قائمة مراجعة لإطلاق منتجك الرقمي الأول:
1. [ ] حدد بدقة نتيجة واحدة واضحة وملموسة للمنتج الرقمي.
2. [ ] صمم الملف أو الكورس باستخدام أدوات بسيطة وسهلة.
3. [ ] أنشئ صفحة الدفع والطلب باستخدام UpKlick.
4. [ ] انشر سلسلة محتوى ترويجي تقدم حلاً لجزء صغير من ألم الجمهور ثم تدعوهم لشراء المنتج الكامل.`;
  } else {
    return `### 📦 Digital Product Ideation & Packaging Strategy
*Niche: ${niche}*

#### 💡 Idea 1: The Quick-Start Digital Blueprint (Low-Ticket Product)
* **Recommended Title:** The ${niche} Accelerator Package.
* **Price Point:** **${price}**
* **Core Deliverable:** Step-by-step templates and worksheets that solve: "${transform}".
* **Marketing Strategy:** Promoted directly inside short-form videos as an easy checkout upgrade.

#### 💡 Idea 2: The Supported Cohort / Masterclass (Medium-Ticket Product)
* **Recommended Title:** Mastery Masterclass in ${niche}.
* **Price Point:** **$99 - $149**
* **Core Deliverable:** 2-hour high-impact recorded lectures combined with access to a members-only community.
* **Core Value:** Provides hands-on guidance to scale operations.

#### 📋 Digital Product Launch Checklist:
1. [ ] Finalize a singular transformation goal for the digital asset.
2. [ ] Construct the templates or record files using easy-to-use software.
3. [ ] Set up the payment checkout integration via UpKlick.
4. [ ] Build an organic content series leading up to the checkout page.`;
  }
}

function generateSocialFeedback(isAR, name, channels, niche) {
  if (isAR) {
    return `### 📱 تقرير تحليل قنوات التواصل واستراتيجية المحتوى
*اسم العلامة التجارية: ${name} | القنوات المفضلة: ${channels}*

#### 📌 1. اقتراح كتابة البايو (Bio Optimization):
* **السطر الأول (تحديد الهوية والتحول):** "أساعدك على تميز عملك في مجال ${niche} وتأهيل العملاء بنجاح 🚀"
* **السطر الثاني (إثبات المصداقية):** "مؤسس ${name} | قوالب واستراتيجيات نمو مبسطة"
* **السطر الثالث (الدعوة للإجراء CTA):** "احصل على دليلك المجاني من الرابط أدناه 👇"

#### 📌 2. ركائز المحتوى الأسبوعي المقترح (Content Pillars):
* **الركيزة 1 (محتوى السلطة والتعليم):** شرح مفاهيم هامة في ${niche} وتبسيطها للمبتدئين لبناء هيبة علمية لك.
* **الركيزة 2 (محتوى الألم والعلاج):** مقاطع فيديو تفاعلية تكشف الأخطاء الشائعة التي تجعل الجمهور يفشل في عمله وكيف يصلحها.
* **الركيزة 3 (محتوى الإقناع والبيع):** استعراض نتائج صفقاتك ومشاريعك، ودعوة المشاهدين للتسجيل في العرض الخاص بك.

#### 💡 نصيحة لتحسين معدلات التفاعل (Engagement Hook):
تأكد من كتابة تعليق مثبت أسفل كل فيديو يسأل المشاهدين سؤالاً مثيراً للجدل في نيشك لحثهم على كتابة تعليقات، مما يدفع خوارزمية المنصة لنشر الفيديو على نطاق أوسع.`;
  } else {
    return `### 📱 Social Media Account Analysis & Profile Optimization
*Brand: ${name} | Channels: ${channels}*

#### 📌 1. Bio Redesign (For Higher Conversion):
* **Line 1 (Transformation):** "Helping coaches and creators in ${niche} automate customer acquisition 🚀"
* **Line 2 (Authority):** "Founder, ${name} | Guided strategies for modern entrepreneurs"
* **Line 3 (CTA):** "Grab your free scaling guide below 👇"

#### 📌 2. Content Pillars Setup:
* **Pillar 1 (Authority & Value):** Actionable tutorials demystifying strategies in ${niche}.
* **Pillar 2 (Problem Solving):** Breaking down top mistakes prospects make and how to bypass them.
* **Pillar 3 (Social Proof & Pitch):** Behind-the-scenes updates of your project, showing results and pitching products.

#### 💡 Engagement Multiplier Hack:
Pin a comment on every new post asking a polarizing question related to your niche. This drives comment velocity, signaling algorithms to boost your organic reach.`;
  }
}

function generateCustomChatResponse(isAR, prompt, context, name, niche, stage, price, pain, demo, channels, goals) {
  const q = String(prompt || '').toLowerCase();
  
  const businessKeywords = [
    'marketing', 'sales', 'crm', 'lead', 'task', 'finance', 'revenue', 'pricing', 'offer', 'brand', 'niche',
    'تسويق', 'بيع', 'عملاء', 'صفقة', 'مبيعات', 'سعر', 'عرض', 'مهمة', 'مهام', 'مالية', 'ارباح', 'إيرادات', 'مشروع',
    'landing', 'page', 'هبوط', 'صفحة', 'موقع', 'business', 'بزنس', 'عمل', 'أرباح', 'مصاريف', 'منتج', 'product',
    'content', 'محتوى', 'منشور', 'post', 'social', 'سوشيال', 'تليجرام', 'telegram', 'instagram', 'انستجرام'
  ];
  const isOffTopic = !businessKeywords.some(keyword => q.includes(keyword));

  if (isOffTopic) {
    return isAR
      ? `عذراً، أنا هنا لمساعدتك في منصة UpKlick وإدارة أعمالك داخل التطبيق فقط. لا يمكنني الإجابة على أسئلة خارجة عن هذا النطاق.`
      : `I'm sorry, I am a dedicated assistant for the UpKlick platform and your business operations inside it. I cannot answer questions outside this scope.`;
  }
  
  if (isAR) {
    if (q.includes('تسويق') || q.includes('حملة') || q.includes('ترويج') || q.includes('marketing') || q.includes('ad')) {
      return `### 📣 استشارة تسويقية مخصصة لـ **${name}**
بناءً على سؤالك حول التسويق في مجال **${niche}**، إليك نصيحتنا الاستراتيجية:
• **أفضل قنوات الاستقطاب:** ركز بالكامل على منصات **${channels}**. لا تحاول التواجد في كل مكان.
• **صياغة الرسالة التسويقية:** يجب أن تلمس الألم الأساسي وهو "**${pain}**". استخدم لغة مباشرة مثل: *"هل تعبت من ${pain}؟ إليك الحل خطوة بخطوة..."*
• **ميزانية التجربة:** ابدأ بنشر محتوى عضوي مستمر، وإذا أردت نتائج أسرع، أطلق إعلانات بسيطة بميزانية صغيرة تستهدف شريحة **${demo}**.
• **نصيحة إضافية:** أطلق دليل مغناطيسي مجاني واجعل الرابط في متناول الجميع لجمع بيانات المهتمين قبل بيع عرضك بقيمة **${price}**.`;
    }
    
    if (q.includes('بيع') || q.includes('عملاء') || q.includes('صفقة') || q.includes('مبيعات') || q.includes('sales') || q.includes('crm')) {
      const activeLeads = (context?.crm?.leads || []).filter(l => l && l.stage !== 'closed' && l.stage !== 'lost');
      return `### 🎯 استشارة مبيعات وإغلاق صفقات لـ **${name}**
بناءً على طلبك بخصوص المبيعات وتأهيل العملاء المهتمين بـ **${niche}**:
• **تحليل نظام المبيعات الحالي:** لديك حالياً **${activeLeads.length}** عملاء نشطين في لوحة الـ CRM.
• **أفضل تكتيك لإغلاق الصفقات:** لا تبيع الخدمة مباشرة. ركز على بيع المكالمة الاستشارية أو جلسة التشخيص المجانية مدتها ١٥ دقيقة لبناء الثقة.
• **قالب رسالة متابعة للعملاء المعلقين:**
  *"أهلاً [اسم العميل]، أردت المتابعة معك بخصوص تفاصيل عرضنا للوصول لـ ${goals}. هل تفضل مناقشة الخطوات التالية في مكالمة سريعة غداً؟"*
• **نصيحة ذهبية:** المتابعة خلال ٢٤ ساعة تزيد من فرصة إتمام التعاقد بنسبة 40%. تأكد من إرسال رسائل ودية بانتظام.`;
    }

    if (q.includes('سعر') || q.includes('عرض') || q.includes('pricing') || q.includes('offer')) {
      return `### 📦 استشارة تسعير وتصميم العروض لـ **${name}**
بناءً على سؤالك بخصوص تسعير عرضك لـ **${niche}**:
• **تقييم التسعير الحالي:** السعر المحدد هو **${price}** بهدف إحداث تحول وهو: "${getAR(context?.profile?.offer?.transform || 'تحقيق نمو ملموس')}".
• **كيفية رفع القيمة المتصورة لعرضك:**
  1. **إضافة بونص حصري:** مثل قوالب جاهزة، أو شيك ليست عملي، أو ساعات دعم إضافية.
  2. **تحديد فترة التحول:** اجعل العرض محدد المدة (مثال: **${duration || '٤ أسابيع'}**) ليشعر العميل بالالتزام والجدية.
  3. **ضمان استرجاع الأموال:** أضف ضماناً خالي من المخاطر لبناء ثقة فورية وتسهيل قرار الشراء.`;
    }

    // Default Arabic advice
    return `### ✦ استشارة ذكاء الأعمال المخصصة لـ **${name}**
أهلاً بك! لقد قمت بتحليل استفسارك بخصوص مشروعك في نيش **${niche}** (المرحلة الحالية: **${stage}**). 

**إليك توصياتنا الاستشارية بناءً على سياق مشروعك المالي والتشغيلي:**
• **الإنتاجية والمهام:** تأكد من ترتيب مهامك اليومية والتركيز على إنجاز المهام عالية الأولوية أولاً لتجنب التشتت وتأخر المشاريع.
• **قمع جذب المبيعات:** ننصح بالتركيز التام على استهداف فئتك المستهدفة (**${demo}**) عبر قنوات **${channels}** وعرض قيمة واضحة وملموسة.
• **التحسين المالي:** تتبع نفقاتك التشغيلية وتجنب تسريبات الإيرادات غير المبررة من خلال مراجعة لوحة المالية بانتظام والتحكم التام في نفقاتك.
• **خطوتك القادمة:** قم بصياغة عرض ميسر القيمة وسهل الشراء بقيمة **${price}** لجمع آرائهم والتحقق الفعلي من جاهزية جمهورك للدفع.

*💡 أنا هنا لمساعدتك دائماً في تفاصيل التسويق، المبيعات، أو تنظيم خطط العمل أسبوعياً. أطرح أي سؤال وسأجيبك فوراً!*`;
  } else {
    if (q.includes('marketing') || q.includes('promote') || q.includes('ad') || q.includes('traffic')) {
      return `### 📣 Custom Marketing Strategy for **${name}**
Regarding your query on marketing and traffic in the "**${niche}**" sector:
• **Primary Channel Focus:** Maintain concentration on **${channels}**. Avoid spreading your bandwidth too thin.
• **Core Hook & Message:** Focus your hooks around solving "**${pain}**".
• **Lead Magnet Delivery:** Always provide a free actionable resource to exchange value for their contact details before pitching your **${price}** program.`;
    }

    if (q.includes('sales') || q.includes('close') || q.includes('leads') || q.includes('crm') || q.includes('deal')) {
      const activeLeads = (context?.crm?.leads || []).filter(l => l && l.stage !== 'closed' && l.stage !== 'lost');
      return `### 🎯 High-Performance Sales Advice for **${name}**
Regarding client acquisition and closing deals for your program in **${niche}**:
• **Pipeline Overview:** You have **${activeLeads.length}** open prospects tracked in your CRM.
• **Follow-up Blueprint:** Send structured follow-ups within 24-48 hours. Example:
  *"Hi [Name], hope you're doing well! Just following up on our proposal to help you reach ${goals}. Let me know if you want to align tomorrow!"*
• **Trust Hook:** Pitch a brief 15-minute diagnostic call rather than trying to sell high-ticket services over chat message text.`;
    }

    // Default English advice
    return `### ✦ Business Growth Intelligence for: **${name}**
Hello! Based on your query and active profile setup in the "**${niche}**" niche (**${stage}** stage):

**Our Custom Recommendations for Your Business Context:**
• **Operations & Tasks:** Prioritize high-priority checklist items to prevent bottlenecking.
• **Client Acquisition:** Drive targeted organic content on **${channels}** focusing directly on target demographics: "**${demo}**".
• **Financial Audit:** Monitor monthly transaction logs in the Finance panel to ensure healthy profit margins and prevent overhead leaks.
• **Next Step:** Structure a clear beta offer at **${price}** delivering the core transformation: "${transform}".

*💡 Tell me more about your challenge (e.g., pricing, video hooks, email sequences) and I will construct a tailored roadmap for you.*`;
  }
}

function generateSmartBrandNames(prompt) {
  const normalized = prompt.toLowerCase();
  const isAR = normalized.includes('arabic') || normalized.includes('عربي') || normalized.includes('language: arabic') || normalized.includes('لغة: عربي');
  
  // Extract niche/field
  let field = 'coaching';
  if (normalized.includes('niche/domain:')) {
    const parts = prompt.split(/niche\/domain:/i);
    if (parts[1]) field = parts[1].split('\n')[0].trim();
  } else if (normalized.includes('domain/niche:')) {
    const parts = prompt.split(/domain\/niche:/i);
    if (parts[1]) field = parts[1].split('\n')[0].trim();
  }

  // Extract keywords
  let keyword = '';
  if (normalized.includes('keywords to incorporate or get inspiration from:')) {
    const parts = prompt.split(/keywords to incorporate or get inspiration from:/i);
    if (parts[1]) keyword = parts[1].split('\n')[0].trim();
  } else if (normalized.includes('keywords to incorporate:')) {
    const parts = prompt.split(/keywords to incorporate:/i);
    if (parts[1]) keyword = parts[1].split('\n')[0].trim();
  } else if (normalized.includes('keywords:')) {
    const parts = prompt.split(/keywords:/i);
    if (parts[1]) keyword = parts[1].split('\n')[0].trim();
  }
  if (keyword.toLowerCase() === 'none' || keyword === 'لا يوجد') {
    keyword = '';
  }

  // Generate dynamic names based on field & language
  let names = [];
  if (isAR) {
    if (field.includes('coach') || field.includes('تدريب') || field.includes('تعليم') || field.includes('استشار')) {
      names = ['تمكين', 'مسار', 'إلهام', 'توجيه', 'روافد', 'منارة'];
    } else if (field.includes('market') || field.includes('تسويق') || field.includes('اعلانات')) {
      names = ['أثر', 'رؤية', 'انتشار', 'نبض', 'مدى', 'وميض'];
    } else if (field.includes('finan') || field.includes('مال') || field.includes('استثمار')) {
      names = ['ثروة', 'نمو', 'أصول', 'رصيد', 'تداول', 'كسب'];
    } else {
      names = ['ريادة', 'انجاز', 'أفق', 'خطوة', 'طموح', 'امتياز'];
    }

    if (keyword) {
      names = [
        `${keyword} ويب`,
        `مركز ${keyword}`,
        `منصة ${keyword}`,
        `${keyword} برو`,
        `${keyword} الذكية`,
        `${keyword} تك`
      ];
    }
  } else {
    // English
    if (field.includes('coach') || field.includes('train') || field.includes('educat') || field.includes('consult')) {
      names = ['Leadify', 'MindPath', 'Coachingly', 'ElevateHub', 'AimUp', 'NextLevel'];
    } else if (field.includes('market') || field.includes('advertis') || field.includes('brand')) {
      names = ['Marketa', 'GrowthFly', 'SpreadPulse', 'BrandVibe', 'AdWave', 'ReachMax'];
    } else if (field.includes('finan') || field.includes('invest') || field.includes('crypto')) {
      names = ['FinFlow', 'Investo', 'CapGrow', 'WealthGrid', 'AssetIQ', 'VaultUp'];
    } else {
      names = ['BizSprint', 'CoreWave', 'UpKlick', 'Najah', 'GrowArabia', 'FutureBiz'];
    }

    if (keyword) {
      const capKey = keyword.charAt(0).toUpperCase() + keyword.slice(1);
      names = [
        `${capKey}ify`,
        `${capKey}Hub`,
        `${capKey}Flow`,
        `${capKey}Core`,
        `Go${capKey}`,
        `Smart${capKey}`
      ];
    }
  }

  return names.join('\n');
}

// ── CUSTOM OFFER / PRICING / UPSELL FALLBACKS ──

function formatCurrencyFallback(amount, symbol, code, isAR) {
  const formattedVal = Math.round(amount).toLocaleString('en');
  if (isAR) {
    if (code === 'SAR') {
      return `${formattedVal} ريال`;
    }
    const isArabicSymbol = ['د.إ', 'د.ك', 'ر.ق', '.د.ب', 'ر.ع', 'ج.م', 'د.ا', 'د.م', 'دج', 'ع.د'].includes(symbol);
    if (isArabicSymbol) {
      return `${formattedVal} ${symbol}`;
    }
    return `${symbol}${formattedVal}`;
  } else {
    const isWesternSymbol = ['$', '€', '£', '¥', 'C$', 'A$', '₺', '₹'].includes(symbol);
    if (isWesternSymbol) {
      return `${symbol}${formattedVal}`;
    }
    return `${formattedVal} ${code}`;
  }
}

function generateSmartOfferBuilder(isAR, name, niche, defaultPrice, defaultTransform, defaultPain, context, prompt, symbol = '$', currencyCode = 'USD') {
  const pStr = String(prompt || '');
  const core = extract(pStr, 'المنتج/الخدمة الأساسية') || extract(pStr, 'Core Product/Service') || extract(pStr, 'Core') || context?.profile?.offer?.core || 'برنامج التوجيه الخاص';
  const audience = extract(pStr, 'الجمهور المستهدف') || extract(pStr, 'Target Audience') || context?.profile?.offer?.audience || 'المهنيين الطموحين';
  const price = extract(pStr, 'السعر الحالي') || extract(pStr, 'Current Price') || defaultPrice || '$997';
  const pain = extract(pStr, 'ألم العميل الأساسي') || extract(pStr, 'Target Customer Pain Point') || defaultPain || 'صعوبة الحصول على عملاء مستقرين';
  const transform = extract(pStr, 'التحول/النتيجة النهائية') || extract(pStr, 'Final Transformation/Dream Outcome') || defaultTransform || 'بناء بزنس مستقر ومربح';
  const format = extract(pStr, 'طريقة التقديم') || extract(pStr, 'Delivery Format') || 'برنامج هجين (مسجل + جلسات مباشرة)';
  const duration = extract(pStr, 'مدة العرض/البرنامج') || extract(pStr, 'Program/Offer Duration') || '8 أسابيع';
  const guarantee = extract(pStr, 'نوع الضمان المقترح') || extract(pStr, 'Guarantee Choice') || 'ضمان استرداد الأموال خلال 30 يوماً';

  // Value stack calculations
  const parsedPrice = parseFloat(price.replace(/[^0-9]/g, '')) || 500;
  const coreValue = parsedPrice * 1.5;
  const bonus1Value = Math.round(parsedPrice * 0.3);
  const bonus2Value = Math.round(parsedPrice * 0.2);
  const bonus3Value = Math.round(parsedPrice * 0.4);
  const totalValue = coreValue + bonus1Value + bonus2Value + bonus3Value;

  const fmtCore = formatCurrencyFallback(coreValue, symbol, currencyCode, isAR);
  const fmtBonus1 = formatCurrencyFallback(bonus1Value, symbol, currencyCode, isAR);
  const fmtBonus2 = formatCurrencyFallback(bonus2Value, symbol, currencyCode, isAR);
  const fmtBonus3 = formatCurrencyFallback(bonus3Value, symbol, currencyCode, isAR);
  const fmtTotal = formatCurrencyFallback(totalValue, symbol, currencyCode, isAR);
  const fmtPrice = formatCurrencyFallback(parsedPrice, symbol, currencyCode, isAR);

  if (isAR) {
    return `### 🎁 هيكل العرض التجاري المتكامل الذي لا يقاوم (Irresistible Offer) لـ **${name}**

مُصممة خصيصاً لاستهداف **${audience}** وحل مشكلتهم الجوهرية: **"${pain}"**.

---

#### 1. اسم العرض والتموضع الاستراتيجي (Name & Positioning Hook)
* **الاسم المقترح:** \`برنامج ${core} الذهبي: ميثاق التحول المالي\`
* **سطر الجذب (Hook Tagline):** *"احصل على ${transform} بالكامل خلال ${duration} من خلال نظام ${format} دون الوقوع في ${pain}."*
* **التموضع (Positioning):** تموضع ذو قيمة عالية يركز على النتائج الفعلية وليس عدد الساعات.

---

#### 2. تفصيل المكونات الجوهرية للعرض (Core Deliverables Breakdown)
طريقة التقديم هي **${format}** ومصممة لتوصيل العميل للهدف خطوة بخطوة:
* **المرحلة الأولى (التهيئة وتفكيك العقبات):** تشخيص ألم العميل الحالي وتجهيز الأدوات الأساسية.
* **المرحلة الثانية (بناء نظام التحول):** البدء العملي في تطبيق المنهج وتخطي عقبة **${pain}**.
* **المرحلة الثالثة (الأتمتة والاستدامة):** ترسيخ النجاح وضمان استمراريته بعد انتهاء مدة الـ **${duration}**.

---

#### 3. مكدس القيمة المقدرة والتسعير (The Value Stack Matrix)

| المكون / الخدمة | القيمة المدركة الفعلية | السعر المضمن في العرض |
| :--- | :---: | :---: |
| **البرنامج الجوهري:** ${core} (مدته ${duration}) | \`${fmtCore}\` | مضمن |
| **بونص 1:** نظام عمل ونماذج جاهزة للتطبيق الفوري لتفادي ${pain} | \`${fmtBonus1}\` | **هدية مجانية** |
| **بونص 2:** مجتمع تفاعلي مغلق مع زملائك وجلسات أسبوعية | \`${fmtBonus2}\` | **هدية مجانية** |
| **بونص 3:** مكتبة الأدوات والاستراتيجيات الخاصة بتسريع النتائج | \`${fmtBonus3}\` | **هدية مجانية** |
| **إجمالي القيمة الفعلية للمكدس:** | **\`${fmtTotal}\`** | |
| **السعر الفعلي المطلوب للاستثمار اليوم:** | | **\`${fmtPrice}\`** |

* **نسبة الخصم المتصورة للعميل:** **${Math.round((1 - parsedPrice / totalValue) * 100)}%** خصم حقيقي على القيمة الإجمالية!

---

#### 4. ثلاثة بونصات استراتيجية للتغلب على الاعتراضات (Objection-Crushing Bonuses)
1. **البونص الأول: شيك-ليست وخارطة طريق الخطوات العملية الجاهزة** (يلغي اعتراض: *"ليس لدي وقت كافٍ للتطبيق"*).
2. **البونص الثاني: مجتمع خاص مغلق ودعم يومي من الموجهين** (يلغي اعتراض: *"أخشى أن أبدأ بمفردي وأتوقف عند مواجهة أي مشكلة"*).
3. **البونص الثالث: قالب أتمتة الأنظمة التشغيلية الجاهز** (يلغي اعتراض: *"التعقيد التقني يعيقني"*).

---

#### 5. الضمان المانع للمخاوف (Risk-Reversal Guarantee Copy)
* **نوع الضمان المطبق:** **${guarantee}**
* **صياغة الضمان الترويجية:** 
  > **ضماننا الحديدي الموجه بالنتائج:** 
  > "نحن نثق تماماً بنظامنا. إذا قمت بالانضمام إلينا اليوم وتطبيق الخطوات الموضحة بالكامل خلال ${duration} ولم تتمكن من تحقيق **${transform}**، أو لم تكن راضياً عن النتائج بنسبة 100%، فكل ما عليك هو إظهار عملك وسنقوم برد كامل استثمارك دون طرح أي أسئلة معقدة. المخاطرة تقع بالكامل على عاتقنا!"

---

#### 6. محفزات الندرة والاستعجال (Scarcity & Urgency Playbook)
* **ندرة الأعداد:** "نظراً لأننا نقدم متابعة مباشرة مكثفة لضمان جودة النتائج، فإننا نقبل **10 مشتركين فقط** في هذه الدفعة."
* **استعجال الوقت:** "البونصات الحصرية المرفقة والخصم الحالي متاحان فقط حتى تاريخ نهاية الأسبوع الحالي، بعدها سيعود السعر لقيمته الأصلية."

---

#### 7. خطة تحويل العميل (Call to Action & Conversion Path)
* **المسار المقترح:** **مكالمة استكشافية وتأهيلية (Discovery & Qualification Call)**.
* **الخطوة العملية للعميل:**
  1. اضغط على الزر لحجز موعد جلسة تشخيص مجانية مدتها 15 دقيقة.
  2. املأ استبيان التأهيل القصير للتأكد من ملاءمتك للبرنامج.
  3. التقي بنا وسنقوم برسم خطة واضحة ومناقشة تفاصيل انضمامك لعرض **${fmtPrice}** إذا تأهلنا للعمل معاً.`;
  } else {
    return `### 🎁 The Irresistible High-Ticket Marketing Offer Blueprint for **${name}**

Tailored specifically to target **${audience}** and solve their core friction: **"${pain}"**.

---

#### 1. Offer Package Name & Positioning Hook
* **Suggested Name:** \`The Elite ${core} Transformation Cohort\`
* **Positioning Tagline:** *"Achieve ${transform} in exactly ${duration} via our ${format} framework, without experiencing ${pain}."*
* **Positioning Angle:** Results-driven premium positioning that focuses on the destination, not hourly metrics.

---

#### 2. Core Deliverables Breakdown
The delivery structure is **${format}**, engineered to move the prospect step-by-step:
* **Phase 1 (Diagnosis & Setup):** Audit current struggles and install the baseline systems.
* **Phase 2 (Core Execution):** Directly work on overcoming "**${pain}**" by launching core campaigns.
* **Phase 3 (Optimization & Offload):** Solidify systems, automate workflows, and guarantee continuity post-cohort.

---

#### 3. The Value Stack & Pricing Matrix

| Component / Deliverable | Perceived Real Value | Special Bundled Price |
| :--- | :---: | :---: |
| **Core Program:** ${core} (${duration}) | \`${fmtCore}\` | Included |
| **Bonus 1:** Step-by-Step Execution Templates to bypass ${pain} | \`${fmtBonus1}\` | **FREE Gift** |
| **Bonus 2:** Private Interactive Cohort & Q&A Board | \`${fmtBonus2}\` | **FREE Gift** |
| **Bonus 3:** Exclusive Implementation Toolkits & SOPs | \`${fmtBonus3}\` | **FREE Gift** |
| **Total Combined Perceived Value:** | **\`${fmtTotal}\`** | |
| **Your Special Investment Today:** | | **\`${fmtPrice}\`** |

* **Calculated Perceived Discount:** **${Math.round((1 - parsedPrice / totalValue) * 100)}% off** the total combined value!

---

#### 4. 3 High-Value Objection-Busting Bonuses
1. **Bonus #1: The Fast-Action Checklist & Blueprint** (Crushes objection: *"I don't have enough time to design this from scratch"*).
2. **Bonus #2: Private Mastermind Group & Daily Mentor Feedback** (Crushes objection: *"I get stuck on technical steps and need advice"*).
3. **Bonus #3: Pre-Built Copywriting & Tech Templates** (Crushes objection: *"I am not good at writing or building funnels"*).

---

#### 5. The Risk-Reversal Guarantee
* **Guarantee Type:** **${guarantee}**
* **Written Copy Statement:**
  > **Our Iron-Clad, Results-Focused Guarantee:**
  > "We back our systems 100%. If you join us today, review the materials, and apply the actions step-by-step for ${duration}, and do not achieve **${transform}**, simply email us your coursework. We will refund 100% of your investment. No hassles. The risk is entirely on our shoulders."

---

#### 6. Urgency & Scarcity Elements
* **Scarcity Hook:** "To ensure premium support quality, we limit enrollment to **only 10 spots** per cohort."
* **Urgency Trigger:** "All objection-busting bonuses and the bundled price expire by the end of this week, after which the price goes up."

---

#### 7. Conversion Path & Call to Action (CTA)
* **Conversion Route:** **Application/Discovery Call Funnel**
* **Action Steps for Prospect:**
  1. Click 'Apply Now' to schedule your free 15-minute diagnostic call.
  2. Complete the short questionnaire so we can review your profile.
  3. Meet with us to map your action roadmap and decide if you're a fit for the **${fmtPrice}** cohort.`;
  }
}

function generateSmartPricing(isAR, name, niche, defaultPrice, defaultTransform, context, prompt, symbol = '$', currencyCode = 'USD') {
  const pStr = String(prompt || '');
  const currentPrice = extract(pStr, 'Current Price') || extract(pStr, 'السعر الحالي') || defaultPrice || '$500';
  const type = extract(pStr, 'Product Type') || extract(pStr, 'نوع المنتج') || 'Online Course';
  const exp = extract(pStr, 'Experience Level') || extract(pStr, 'مستوى الخبرة') || 'Intermediate';
  const targetIncome = extract(pStr, 'Target Monthly Income') || extract(pStr, 'الدخل الشهري المستهدف') || '$5,000';
  const expenses = extract(pStr, 'Monthly Expenses') || extract(pStr, 'المصروفات الشهرية') || extract(pStr, 'Expenses') || '0';

  const priceNum = parseFloat(currentPrice.replace(/[^0-9]/g, '')) || 500;
  const incomeNum = parseFloat(targetIncome.replace(/[^0-9]/g, '')) || 5000;
  const expensesNum = parseFloat(expenses.replace(/[^0-9]/g, '')) || 0;

  // Pricing tiers
  const tierLow = Math.round(priceNum * 0.5);
  const tierMid = priceNum;
  const tierHigh = Math.round(priceNum * 2.5);

  // Sales Volume calculations to hit target net profit after covering expenses
  const totalRequiredRevenue = incomeNum + expensesNum;
  const salesNeededLow = Math.ceil(totalRequiredRevenue / tierLow);
  const salesNeededMid = Math.ceil(totalRequiredRevenue / tierMid);
  const salesNeededHigh = Math.ceil(totalRequiredRevenue / tierHigh);

  const fmtLow = formatCurrencyFallback(tierLow, symbol, currencyCode, isAR);
  const fmtMid = formatCurrencyFallback(tierMid, symbol, currencyCode, isAR);
  const fmtHigh = formatCurrencyFallback(tierHigh, symbol, currencyCode, isAR);
  const fmtIncome = formatCurrencyFallback(incomeNum, symbol, currencyCode, isAR);
  const fmtExpenses = formatCurrencyFallback(expensesNum, symbol, currencyCode, isAR);
  const fmtRequired = formatCurrencyFallback(totalRequiredRevenue, symbol, currencyCode, isAR);

  if (isAR) {
    return `### 💰 تقرير تحسين واستراتيجية التسعير لـ **${name}**

مُعد بناءً على منتجك من نوع **${type}** بمستوى خبرة **${exp}** لتحقيق صافي دخل مستهدف **${fmtIncome}** شهرياً بعد تغطية مصروفات قدرها **${fmtExpenses}** (إجمالي الإيرادات المطلوبة: **${fmtRequired}**).

---

#### 1. خيارات الباقات والتسعير الثلاثي المقترح (Tiered Pricing Strategy)
لتحقيق أقصى ربحية وتلبية احتياجات فئات العملاء المختلفة، ننصح بتقسيم عرضك لثلاث باقات:

| الباقة | السعر المقترح | طبيعة العرض ومحتوياته | مبيعات مطلوبة لـ صافي ${fmtIncome} |
| :--- | :---: | :--- | :---: |
| **الباقة الأساسية (Lite)** | **\`${fmtLow}\`** | وصول ذاتي للمواد المسجلة فقط بدون دعم خاص. | **${salesNeededLow} مبيعات** |
| **الباقة الموصى بها (Pro)** | **\`${fmtMid}\`** | الوصول الكامل للمنهج + الدعم الجماعي الأسبوعي والقوالب. | **${salesNeededMid} مبيعات** |
| **الباقة النخبوية (VIP)** | **\`${fmtHigh}\`** | كل ما سبق + جلسات متابعة فردية 1-on-1 وخدمة مخصصة. | **${salesNeededHigh} مبيعات** |

---

#### 2. الحيل النفسية للتسعير (Pricing Psychology Hacks)
* **تأثير الإرساء (Anchoring Effect):** اعرض الباقة النخبوية بسعر \`${fmtHigh}\` أولاً، ليظهر سعر الباقة الموصى بها \`${fmtMid}\` كخيار معقول واقتصادي للغاية.
* **التسعير الفردي (Odd Pricing):** بدلاً من عرض الباقة بسعر دائري، استخدم الأسعار النفسية المنتهية بـ 7 أو 9 (مثال: \`${formatCurrencyFallback(tierMid - 3, symbol, currencyCode, isAR)}\`).
* **مقارنة القيمة المدركة:** ضع جدول المقارنة ووضح أن الباقة VIP توفر مئات الساعات من الجهد مما يجعل قيمتها الفعلية أضعاف سعرها الحالي.

---

#### 3. حاسبة حجم المبيعات المطلوب (Sales Volume Calculator)
لتحقيق صافي دخل شهري مستهدف قدره **${fmtIncome}** بعد تغطية المصروفات (**${fmtExpenses}**):
* **الباقة الأساسية فقط:** تحتاج إلى **${salesNeededLow} مشتري** شهرياً.
* **الباقة الموصى بها فقط:** تحتاج إلى **${salesNeededMid} مشتري** شهرياً.
* **الباقة النخبوية فقط:** تحتاج إلى **${salesNeededHigh} مشترين** فقط شهرياً.

* **💡 التوصية المثالية:** ركز على بيع الباقة النخبوية VIP لأول عميلين لتحقيق سيولة سريعة، ثم وسع الباقة الموصى بها للحصول على دخل مستقر وتلقائي.`;
  } else {
    return `### 💰 Pricing Strategy & Optimization Report for **${name}**

Optimized for your **${type}** at an **${exp}** tier to achieve your net monthly income of **${fmtIncome}** after covering expenses of **${fmtExpenses}** (Total required revenue: **${fmtRequired}**).

---

#### 1. Tiered Pricing Options
To maximize customer lifetime value (LTV), implement a three-tiered pricing framework:

| Tier | Price Point | Deliverables Included | Sales Needed for Net ${fmtIncome} |
| :--- | :---: | :--- | :---: |
| **Basic (Self-Paced)** | **\`${fmtLow}\`** | Self-study access to resources with no mentoring support. | **${salesNeededLow} sales** |
| **Pro (Supported) ★** | **\`${fmtMid}\`** | Full course/program access + weekly group calls & templates. | **${salesNeededMid} sales** |
| **VIP (Done-With-You)** | **\`${fmtHigh}\`** | Complete Pro tier + 1-on-1 direct coaching & premium reviews. | **${salesNeededHigh} sales** |

---

#### 2. Pricing Psychology Hacks
* **The Anchor Strategy:** Lead your sales pages with the VIP tier at \`${fmtHigh}\`. This sets a high value perception and makes the Pro tier at \`${fmtMid}\` look like an absolute bargain.
* **Charm Pricing:** Instead of round numbers, price it ending in 7 or 9 (e.g., \`${formatCurrencyFallback(tierMid - 1, symbol, currencyCode, isAR)}\`).
* **Perceived Savings Highlight:** State clearly that buying the bundle saves the client over 50% compared to buying items individually.

---

#### 3. Sales Volume & Goal Calculator
To reach your net monthly revenue of **${fmtIncome}** (after covering **${fmtExpenses}** expenses):
* **From Basic Tier:** You need **${salesNeededLow} customers** per month.
* **From Pro Tier (Recommended):** You need **${salesNeededMid} customers** per month.
* **From VIP Tier:** You only need **${salesNeededHigh} customers** per month.

* **💡 Strategic Advice:** Secure 2-3 VIP clients first to build initial cash flow, then scale your Pro tier using automated landing pages.`;
  }
}

function generateSmartUpsell(isAR, name, niche, defaultPrice, context, prompt, symbol = '$', currencyCode = 'USD') {
  const pStr = String(prompt || '');
  const core = extract(pStr, 'Core offer') || extract(pStr, 'المنتج الأساسي') || context?.profile?.offer?.core || 'البرنامج الأساسي';
  const price = extract(pStr, 'Price') || extract(pStr, 'سعر المنتج الأساسي') || defaultPrice || '$997';
  const needs = extract(pStr, 'Client needs after buy') || extract(pStr, 'الاحتياجات بعد الشراء') || 'دعم إضافي وأدوات جاهزة';

  const priceNum = parseFloat(price.replace(/[^0-9]/g, '')) || 500;
  const bumpPrice = Math.round(priceNum * 0.1) || 47;
  const upsellPrice = Math.round(priceNum * 0.4) || 297;
  const backendPrice = Math.round(priceNum * 2.0) || 1500;

  const fmtBump = formatCurrencyFallback(bumpPrice, symbol, currencyCode, isAR);
  const fmtUpsell = formatCurrencyFallback(upsellPrice, symbol, currencyCode, isAR);
  const fmtBackend = formatCurrencyFallback(backendPrice, symbol, currencyCode, isAR);
  const fmtPrice = formatCurrencyFallback(priceNum, symbol, currencyCode, isAR);

  // Smart niche-based analysis
  const nicheName = niche || context?.profile?.niche || 'برمجة وتطوير البرمجيات';
  const isCoding = nicheName.toLowerCase().includes('code') || nicheName.toLowerCase().includes('program') || nicheName.toLowerCase().includes('برمج') || nicheName.toLowerCase().includes('تطوير') || core.toLowerCase().includes('برمج') || core.toLowerCase().includes('كود') || core.toLowerCase().includes('برنامج');

  let smartIdeaAR = '';
  let smartIdeaEN = '';

  if (isCoding) {
    smartIdeaAR = `* **الفكرة المقترحة (البرنامج التدريبي العملي الموجه):** \`معسكر المطور المحترف: الإعداد للعمل المباشر ومراجعة الكود الجماعية\`
* **المفهوم الاستراتيجي:** بعد انتهاء الطالب من كورس البرمجة الأساسي، يواجه فجوة كبيرة في التطبيق العملي وبناء مشاريع حقيقية لسيرته الذاتية. هذا المعسكر يركز 100% على التطبيق العملي، ومراجعة الكود (Code Reviews)، والمحاكاة لبيئة عمل الشركات مع توجيه مباشر.
* **التسعير المقترح:** **\`${fmtUpsell}\`** كعرض إضافي دفعة واحدة، أو **\`${fmtBackend}\`** للتدريب الشخصي الفردي المكثف.`;

    smartIdeaEN = `* **Proposed Solution (Practical Cohort/Mentorship):** \`The Professional Dev Bootcamp & Live Code Review Pass\`
* **Concept:** After finishing a coding course, students struggle with practical setup and building real portfolios. This program bridges that gap with code reviews, mock interviews, and group project collaboration.
* **Suggested Pricing:** **\`${fmtUpsell}\`** for cohort access or **\`${fmtBackend}\`** for premium 1-on-1 career assistance.`;
  } else {
    smartIdeaAR = `* **الفكرة المقترحة (مجموعة مرافقة وتطبيق عملي):** \`مجموعات التنفيذ والمتابعة الأسبوعية المركزة لـ ${nicheName}\`
* **المفهوم الاستراتيجي:** ينتقل العميل من مرحلة التعلم الذاتي إلى مرحلة التطبيق تحت إشراف وتوجيه مباشر، مما يضمن التزامهم وحل مشاكلهم فوراً.
* **التسعير المقترح:** **\`${fmtUpsell}\`** للاشتراك الجماعي الدوري أو **\`${fmtBackend}\`** للاستشارة والخدمة المباشرة الفردية.`;

    smartIdeaEN = `* **Proposed Solution (Weekly Implementation Cohort):** \`The ${nicheName} High-Accountability Action Group\`
* **Concept:** Move the buyer from passive self-study to active, supervised implementation. Direct audits and live feedback sessions ensure maximum success rate.
* **Suggested Pricing:** **\`${fmtUpsell}\`** for group access or **\`${fmtBackend}\`** for high-ticket individual feedback.`;
  }

  if (isAR) {
    return `### ⬆️ خريطة البيع الإضافي والتقاطعي (Upsell Ladder Blueprint) لـ **${name}**

مُصممة استراتيجياً لزيادة متوسط قيمة الطلب (AOV) لمنتجك الأساسي: **"${core}"** بسعر **${fmtPrice}**.

---

### الجزء الأول: اقتراحات وحلول الذكاء الاصطناعي الذكية (AI Smart Upsell Engine)
*بناءً على فهمنا لمجال عملك (**${nicheName}**) والمنافسين، هذا هو الحل الطبيعي والمنطقي الذي سيحتاجه عميلك فوراً بعد إنهاء المنتج الأساسي:*

${smartIdeaAR}

---

### الجزء الثاني: عروض البيع الإضافي المخصصة بناءً على مدخلاتك (Custom-Built Upsell Ladder)
*تم تصميم هذه العروض الثلاثة خصيصاً لحل المشكلة المحددة التي أدخلتها: **"${needs}"**:*

#### 1. عرض الشراء الفوري الصغير (Order Bump)
*ترسل في صفحة الدفع مباشرة كصندوق اختيار بسيط قبل نقر زر الدفع.*
* **اسم المنتج:** \`حقيبة الأدوات والملفات المسرعة لتطبيق ${core}\`
* **السعر المقترح:** **\`${fmtBump}\`** (عرض استثنائي لمرة واحدة)
* **المفهوم:** قالب عملي جاهز يوفر على المشتري عناء كتابة النماذج أو تجهيز الحسابات بمفرده لحل مشكلة: **"${needs}"**.
* **كيفية بيعه:** *"اضغط هنا للحصول على حقيبة الملفات الجاهزة وتوفير 20 ساعة من العمل مقابل ${fmtBump} فقط!"*

---

#### 2. البيع الإضافي المباشر بعد الشراء (One-Time-Offer Upsell)
*تظهر للعميل فوراً بعد نجاح عملية الدفع وقبل الانتقال لصفحة التأكيد.*
* **اسم المنتج:** \`مخيم التنفيذ الجماعي المكثف - جلسات مراجعة أسبوعية لمدة 3 أشهر\`
* **السعر المقترح:** **\`${fmtUpsell}\`** (سعر ترويجي مؤقت، السعر الأصلي ضعف ذلك)
* **المفهوم:** لحل مشكلة احتياج العميل بعد الشراء وهي: **"${needs}"**.
* **كيفية بيعه:** *"تهانينا على شرائك! الآن، هل تود أن نعمل معك جنباً إلى جنب لنراجع خطواتك ونصحح أخطاءك أسبوعياً لتضمن الوصول لأهدافك أسرع؟ احجز مقعدك الآن بخصم 50%."*

---

#### 3. العرض الخلفي عالي القيمة (High-Ticket Backend Offer)
*يُعرض على المشترين المتميزين بعد مرور 14-30 يوماً من تجربة المنتج والاستفادة منه.*
* **اسم المنتج:** \`برنامج التوجيه والمرافقة الفردية 1-on-1 مع ${name}\`
* **السعر المقترح:** **\`${fmtBackend}\`**
* **المفهوم:** تقديم حل كامل متكامل (Done-With-You أو Done-For-You) للعملاء الذين يمتلكون الميزانية ويريدون أقصى درجات الرعاية الفردية.
* **كيفية بيعه:** *"برنامج مرافقة سنوي أو نصف سنوي مغلق لتصميم وتوسيع نظام عملك شخصياً لضمان الوصول لأعلى النتائج الممكنة."*`;
  } else {
    return `### ⬆️ Upsell & Cross-Sell Ladder Blueprint for **${name}**

Strategically designed to maximize Average Order Value (AOV) for your core product: **"${core}"** at **${fmtPrice}**.

---

### Part 1: AI Smart Upsell Engine (Niche Recommendations)
*Based on our understanding of your business niche (**${nicheName}**), this is the next high-value offer to maximize LTV:*

${smartIdeaEN}

---

### Part 2: Custom-Built Upsell Ladder (Based on Your Inputs)
*These three specific offers are engineered to directly address the post-purchase pain point: **"${needs}"**:*

#### 1. The Checkout Order Bump
*A simple checkbox addition on the checkout page before the buy button.*
* **Product Name:** \`The Ultimate Fast-Track Toolkit & Swipe File for ${core}\`
* **Suggested Price:** **\`${fmtBump}\`**
* **Concept:** Ready-made templates, calculators, or worksheets that save hours of work.
* **Copy Hook:** *"Check this box to unlock the complete swipe file and skip 20 hours of setup for just ${fmtBump} today!"*

---

#### 2. Immediate Post-Purchase Upsell (One-Time-Offer / OTO)
*Shown immediately after payment is successful, before the thank-you page.*
* **Product Name:** \`The 90-Day Implementation Cohort & Group Review Pass\`
* **Suggested Price:** **\`${fmtUpsell}\`** (Regularly double this price)
* **Concept:** Directly resolves the buyer's post-purchase need: **"${needs}"**.
* **Copy Hook:** *"Wait! Don't build alone. Add 3 months of weekly implementation reviews and direct community support to your order at an exclusive 50% discount."*

---

#### 3. High-Ticket Backend Program (VIP Level)
*Offered to your best active students/users 14-30 days post-purchase.*
* **Product Name:** \`The VIP 1-on-1 Partnership & Advisory Program with ${name}\`
* **Suggested Price:** **\`${fmtBackend}\`**
* **Concept:** High-ticket private coaching or done-for-you package providing absolute customization.
* **Copy Hook:** *"A high-access private partnership where we audit your campaigns weekly, refine your positioning, and scale your business to maximum capacity."*`;
  }
}

function generateSmartKPIPlanner(isAR, name, niche, context, prompt, symbol = '$', currencyCode = 'USD') {
  const pStr = String(prompt || '');
  const model = extract(pStr, 'Business Model') || extract(pStr, 'نموذج العمل') || 'Coaching / Services';
  const targetRev = extract(pStr, 'Target Monthly Revenue') || extract(pStr, 'هدف الإيرادات الشهري') || '$10,000';
  const stage = extract(pStr, 'Current Business Stage') || extract(pStr, 'المرحلة الحالية') || 'Just starting';
  const aov = extract(pStr, 'Average Order/Ticket Value') || extract(pStr, 'متوسط قيمة الطلب/المبيعة') || '$200';
  const actualRev = extract(pStr, 'Actual Monthly Revenue') || extract(pStr, 'الإيرادات الشهرية الفعلية') || '0';
  const actualLeads = extract(pStr, 'Actual Monthly Traffic/Leads') || extract(pStr, 'الزيارات/العملاء شهرياً') || '0';
  const actualConv = extract(pStr, 'Actual Conversion Rate') || extract(pStr, 'معدل التحويل الحالي') || '0%';

  const targetRevNum = parseFloat(targetRev.replace(/[^0-9.]/g, '')) || 10000;
  const aovNum = parseFloat(aov.replace(/[^0-9.]/g, '')) || 200;
  const actualRevNum = parseFloat(actualRev.replace(/[^0-9.]/g, '')) || 0;
  const actualLeadsNum = parseFloat(actualLeads.replace(/[^0-9.]/g, '')) || 0;
  const actualConvNum = parseFloat(actualConv.replace(/[^0-9.]/g, '')) || 0;

  // Derived Target Calculations
  const targetSales = Math.ceil(targetRevNum / aovNum) || 50;
  // Assume a benchmark conversion rate depending on business model
  let benchmarkConv = 2.0; // 2% default
  if (model.includes('E-commerce')) benchmarkConv = 1.5;
  if (model.includes('Online Courses')) benchmarkConv = 2.5;
  if (model.includes('Coaching')) benchmarkConv = 3.0;
  if (model.includes('SaaS')) benchmarkConv = 1.0;

  const neededLeads = Math.ceil(targetSales / (benchmarkConv / 100)) || 2500;

  // Actual Calculations
  const actualSales = aovNum ? Math.round(actualRevNum / aovNum) : 0;
  const revProgress = Math.min(100, Math.round((actualRevNum / targetRevNum) * 100)) || 0;
  const trafficProgress = Math.min(100, Math.round((actualLeadsNum / neededLeads) * 100)) || 0;
  const convProgress = Math.min(100, Math.round((actualConvNum / benchmarkConv) * 100)) || 0;

  // Status Badges
  const getStatusBadge = (progress) => {
    if (progress >= 80) return '🟢'; // On Track
    if (progress >= 40) return '🟡'; // Warning
    return '🔴'; // Critical
  };

  const revStatus = getStatusBadge(revProgress);
  const trafficStatus = getStatusBadge(trafficProgress);
  const convStatus = getStatusBadge(convProgress);

  const fmtTargetRev = formatCurrencyFallback(targetRevNum, symbol, currencyCode, isAR);
  const fmtActualRev = formatCurrencyFallback(actualRevNum, symbol, currencyCode, isAR);
  const fmtAov = formatCurrencyFallback(aovNum, symbol, currencyCode, isAR);

  if (isAR) {
    return `### 📊 لوحة تقييم ومؤشرات الأداء الرئيسية (KPIs) لـ **${name}**

مُعدة ومحللة بناءً على نموذج العمل **${model}** لمقارنة الأرقام الفعلية بالهدف الشهري المستهدف **${fmtTargetRev}**.

---

#### 1. ملخص تحقيق الأهداف الحالية (Performance Goal Progress Summary)

* **نسبة تحقيق هدف الإيرادات:** \`${revProgress}%\` ${revStatus}
* **نسبة تحقيق الزيارات/العملاء المستهدفة:** \`${trafficProgress}%\` ${trafficStatus}
* **نسبة تحقيق كفاءة معدل التحويل:** \`${convProgress}%\` ${convStatus}

---

#### 2. جدول مقارنة المؤشرات: الهدف مقابل الفعلي (KPI Comparison Dashboard)

| مؤشر الأداء (Metric) | الهدف (Target) | الفعلي الحالي (Actual) | نسبة التحقيق | حالة المؤشر |
| :--- | :---: | :---: | :---: | :---: |
| **الإيرادات الشهرية** | **\`${fmtTargetRev}\`** | **\`${fmtActualRev}\`** | **\`${revProgress}%\`** | ${revStatus} |
| **متوسط قيمة المبيعة (AOV)** | \`${fmtAov}\` | \`${fmtAov}\` | \`100%\` | 🟢 |
| **عدد المبيعات المطلوبة** | \`${targetSales} مبيعة\` | \`${actualSales} مبيعة\` | \`${Math.min(100, Math.round((actualSales / targetSales) * 100)) || 0}%\` | ${revStatus} |
| **العملاء المحتملون/الزيارات** | \`${neededLeads} زيارة\` | \`${actualLeadsNum} زيارة\` | \`${trafficProgress}%\` | ${trafficStatus} |
| **معدل التحويل (CVR)** | \`${benchmarkConv}%\` | \`${actualConvNum}%\` | \`${convProgress}%\` | ${convStatus} |

---

#### 3. تشخيص ثغرات الأداء ومكامن التسريب (Performance Leak Diagnosis)
بناءً على أرقامك الحالية، إليك تقييم مكامن التسريب في البزنس:
${actualLeadsNum < neededLeads * 0.5 
  ? `* 🔴 **ضعف تدفق الزيارات (Traffic Leak):** حجم الزيارات الحالي الخاص بك (${actualLeadsNum}) يمثل أقل من 50% من العدد المطلوب (${neededLeads}). هذا هو العائق الأساسي الذي يمنعك من الوصول لهدف المبيعات حتى وإن كان معدل تحويلك ممتازاً.` 
  : `* 🟢 **حجم الزيارات مقبول:** حجم الزيارات الحالي مناسب وجيد للمرحلة الحالية.`
}
${actualConvNum < benchmarkConv
  ? `* 🔴 **انخفاض معدل التحويل (Conversion Leak):** معدل التحويل الحالي لديك (${actualConvNum}%) يقل عن المؤشر المعياري لموديل ${model} وهو (${benchmarkConv}%). هذا يعني أنك تفقد عملاء محتملين في صفحة الدفع أو في مرحلة الإقناع.`
  : `* 🟢 **معدل التحويل ممتاز:** معدل تحويلك الحالي يتخطى المعيار المتوقع لنموذج عملك.`
}

---

#### 4. خطة العمل المباشرة لتحسين المؤشرات (Action Plan Steps)
1. **إذا كان العائق هو الزيارات:** ركز 100% على قنوات الجذب (إعلانات Meta ممولة أو زيادة وتيرة صناعة المحتوى على TikTok/Instagram) لجلب ${neededLeads - actualLeadsNum} عميل محتمل إضافي شهرياً.
2. **إذا كان العائق هو التحويل:** قم بتبسيط عملية الشراء، أضف ضماناً خالي المخاطر (Risk-Reversal)، وأضف بونصات استثنائية تقضي على اعتراضات العملاء في صفحة الهبوط.
3. **إذا أردت تقليص مبيعاتك المطلوبة:** ارفع متوسط قيمة المبيعة (AOV) من خلال تقديم عروض بيع إضافي (Upsells) أو إطلاق باقة VIP بسعر أعلى.`;
  } else {
    return `### 📊 Key Performance Indicators (KPI) & Progress Dashboard for **${name}**

Analyzed for **${model}** business model, comparing your current performance against the monthly revenue target of **${fmtTargetRev}**.

---

#### 1. Goal Progress Summary

* **Revenue Goal Achieved:** \`${revProgress}%\` ${revStatus}
* **Traffic/Leads Goal Achieved:** \`${trafficProgress}%\` ${trafficStatus}
* **Conversion Rate Efficiency:** \`${convProgress}%\` ${convStatus}

---

#### 2. KPI Targets vs. Actual Dashboard

| Metric Tracked | Target Goal | Current Actual | Achieved % | Health Status |
| :--- | :---: | :---: | :---: | :---: |
| **Monthly Revenue** | **\`${fmtTargetRev}\`** | **\`${fmtActualRev}\`** | **\`${revProgress}%\`** | ${revStatus} |
| **Average Order Value (AOV)** | \`${fmtAov}\` | \`${fmtAov}\` | \`100%\` | 🟢 |
| **Total Sales Needed** | \`${targetSales} sales\` | \`${actualSales} sales\` | \`${Math.min(100, Math.round((actualSales / targetSales) * 100)) || 0}%\` | ${revStatus} |
| **Monthly Traffic/Leads** | \`${neededLeads} visitors\` | \`${actualLeadsNum} visitors\` | \`${trafficProgress}%\` | ${trafficStatus} |
| **Conversion Rate (CVR)** | \`${benchmarkConv}%\` | \`${actualConvNum}%\` | \`${convProgress}%\` | ${convStatus} |

---

#### 3. Performance Leak Diagnostics
Based on your metrics, here is the diagnosis of where your revenue funnel is leaking:
${actualLeadsNum < neededLeads * 0.5 
  ? `* 🔴 **Traffic Bottleneck:** Your traffic levels (${actualLeadsNum}) are under 50% of the required target (${neededLeads}). You must scale acquisition to see reliable sales volume, even with high conversion.` 
  : `* 🟢 **Traffic Health:** Your visitor levels are currently on track for this growth stage.`
}
${actualConvNum < benchmarkConv
  ? `* 🔴 **Conversion Rate Leak:** Your conversion rate (${actualConvNum}%) is below the industry benchmark of (${benchmarkConv}%) for a ${model} model. Traffic is arriving, but your landing page or follow-up offer isn't closing them effectively.`
  : `* 🟢 **Conversion Health:** Your checkout and landing page conversion rate is healthy.`
}

---

#### 4. Priority Action Steps
1. **Traffic Scale Plan:** Launch Meta Ads or optimize Instagram Reels to drive at least ${neededLeads - actualLeadsNum} more leads/visitors per month.
2. **Funnel Conversion Lift:** Simplify registration form lengths, place testimonials above the fold, and add high-ticket bumps to recover lost conversions.
3. **Average Order Value Boost:** Add a checkout order bump or post-purchase OTO upsells to decrease the number of individual sales needed to reach **${fmtTargetRev}**.`;
  }
}

function generateSmartRevenueForecast(isAR, name, niche, context, prompt, symbol = '$', currencyCode = 'USD') {
  const pStr = String(prompt || '');
  const aov = extract(pStr, 'Average Sale Value (AOV)') || extract(pStr, 'Average Sale Value') || '$200';
  const leads = extract(pStr, 'Monthly Leads/Traffic') || extract(pStr, 'Monthly Leads') || '100';
  const close = extract(pStr, 'Current Closing Rate') || extract(pStr, 'Current Close Rate') || '10%';
  const growth = extract(pStr, 'Growth Plan Model') || extract(pStr, 'Growth Plan') || 'Organic only';
  const adBudget = extract(pStr, 'Monthly Ad Budget') || '0';
  const opCosts = extract(pStr, 'Monthly Fixed Operational Costs') || '0';

  const aovNum = parseFloat(aov.replace(/[^0-9.]/g, '')) || 200;
  const leadsNum = parseFloat(leads.replace(/[^0-9.]/g, '')) || 100;
  const closeNum = parseFloat(close.replace(/[^0-9.]/g, '')) || 10;
  const adBudgetNum = parseFloat(adBudget.replace(/[^0-9.]/g, '')) || 0;
  const opCostsNum = parseFloat(opCosts.replace(/[^0-9.]/g, '')) || 0;

  // Scenario Math
  // 1. Conservative (60% close rate, same leads, expenses unchanged)
  const closeRateCons = closeNum * 0.6;
  const leadsCons = leadsNum;
  const salesCons = Math.round(leadsCons * (closeRateCons / 100));
  const revCons30 = salesCons * aovNum;
  const costs30 = adBudgetNum + opCostsNum;
  const profitCons30 = revCons30 - costs30;
  
  const revCons60 = revCons30 * 2.0;
  const profitCons60 = revCons60 - (costs30 * 2);

  const revCons90 = revCons30 * 3.0;
  const profitCons90 = revCons90 - (costs30 * 3);

  // 2. Realistic (100% close rate, 1.2x leads growth per month, expenses unchanged)
  const closeRateReal = closeNum;
  const salesReal30 = Math.round(leadsNum * (closeRateReal / 100));
  const revReal30 = salesReal30 * aovNum;
  const profitReal30 = revReal30 - costs30;

  const leadsReal60 = leadsNum * 1.2;
  const salesReal60 = Math.round(leadsReal60 * (closeRateReal / 100));
  const revReal60 = revReal30 + (salesReal60 * aovNum);
  const profitReal60 = revReal60 - (costs30 * 2);

  const leadsReal90 = leadsNum * 1.4;
  const salesReal90 = Math.round(leadsReal90 * (closeRateReal / 100));
  const revReal90 = revReal60 + (salesReal90 * aovNum);
  const profitReal90 = revReal90 - (costs30 * 3);

  // 3. Aggressive (1.2x close rate, 2x leads growth per month, expenses grows for ads)
  const closeRateAggr = closeNum * 1.2;
  const salesAggr30 = Math.round(leadsNum * (closeRateAggr / 100));
  const revAggr30 = salesAggr30 * aovNum;
  const profitAggr30 = revAggr30 - costs30;

  const leadsAggr60 = leadsNum * 1.5;
  const adBudget60 = adBudgetNum * 1.3;
  const costs60 = adBudget60 + opCostsNum;
  const salesAggr60 = Math.round(leadsAggr60 * (closeRateAggr / 100));
  const revAggr60 = revAggr30 + (salesAggr60 * aovNum);
  const profitAggr60 = revAggr60 - (costs30 + costs60);

  const leadsAggr90 = leadsNum * 2.0;
  const adBudget90 = adBudgetNum * 1.6;
  const costs90 = adBudget90 + opCostsNum;
  const salesAggr90 = Math.round(leadsAggr90 * (closeRateAggr / 100));
  const revAggr90 = revAggr60 + (salesAggr90 * aovNum);
  const profitAggr90 = revAggr90 - (costs30 + costs60 + costs90);

  // Helper formatting function
  const f = (num) => formatCurrencyFallback(num, symbol, currencyCode, isAR);

  if (isAR) {
    return `### 💰 توقعات الأرباح والإيرادات المالية لـ **${name}**

مُعدة بناءً على متوسط قيمة صفقة **${f(aovNum)}**، بمعدل إغلاق **${closeNum}%**، ومصاريف تشغيلية **${f(opCostsNum)}** وميزانية إعلانية **${f(adBudgetNum)}** (إجمالي المصاريف الشهرية: **${f(costs30)}**).

---

#### 1. السيناريو المتحفظ (Conservative Scenario - نمو بطيء)
*يفترض هذا السيناريو انخفاض كفاءة المبيعات بنسبة 40% واستقرار عدد العملاء المحتملين.*

| المدة | عدد المبيعات | إجمالي الإيرادات (Gross) | إجمالي المصاريف | صافي الأرباح (Net Profit) | هامش الربح |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **30 يوماً** | \`${salesCons} مبيعة\` | \`${f(revCons30)}\` | \`${f(costs30)}\` | **\`${f(profitCons30)}\`** | \`${revCons30 ? Math.round((profitCons30 / revCons30) * 100) : 0}%\` |
| **60 يوماً** | \`${salesCons * 2} مبيعة\` | \`${f(revCons60)}\` | \`${f(costs30 * 2)}\` | **\`${f(profitCons60)}\`** | \`${revCons60 ? Math.round((profitCons60 / revCons60) * 100) : 0}%\` |
| **90 يوماً** | \`${salesCons * 3} مبيعة\` | \`${f(revCons90)}\` | \`${f(costs30 * 3)}\` | **\`${f(profitCons90)}\`** | \`${revCons90 ? Math.round((profitCons90 / revCons90) * 100) : 0}%\` |

---

#### 2. السيناريو الواقعي (Realistic Scenario - نمو طبيعي) ★
*يفترض هذا السيناريو الحفاظ على نسبة الإغلاق الحالية (${closeNum}%) مع نمو تدريجي في العملاء بنسبة 20% شهرياً.*

| المدة | عدد المبيعات | إجمالي الإيرادات (Gross) | إجمالي المصاريف | صافي الأرباح (Net Profit) | هامش الربح |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **30 يوماً** | \`${salesReal30} مبيعة\` | \`${f(revReal30)}\` | \`${f(costs30)}\` | **\`${f(profitReal30)}\`** | \`${revReal30 ? Math.round((profitReal30 / revReal30) * 100) : 0}%\` |
| **60 يوماً** | \`${salesReal30 + salesReal60} مبيعة\` | \`${f(revReal60)}\` | \`${f(costs30 * 2)}\` | **\`${f(profitReal60)}\`** | \`${revReal60 ? Math.round((profitReal60 / revReal60) * 100) : 0}%\` |
| **90 يوماً** | \`${salesReal30 + salesReal60 + salesReal90} مبيعة\` | \`${f(revReal90)}\` | \`${f(costs30 * 3)}\` | **\`${f(profitReal90)}\`** | \`${revReal90 ? Math.round((profitReal90 / revReal90) * 100) : 0}%\` |

---

#### 3. السيناريو المتفائل / العدواني (Aggressive Scenario - نمو متسارع)
*يفترض هذا السيناريو تحسين نسبة الإغلاق بنسبة 20% بفضل مهارات المبيعات، ومضاعفة الزيارات بمساعدة الحملات الإعلانية الممولة بقيمة إضافية تدريجية.*

| المدة | عدد المبيعات | إجمالي الإيرادات (Gross) | إجمالي المصاريف | صافي الأرباح (Net Profit) | هامش الربح |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **30 يوماً** | \`${salesAggr30} مبيعة\` | \`${f(revAggr30)}\` | \`${f(costs30)}\` | **\`${f(profitAggr30)}\`** | \`${revAggr30 ? Math.round((profitAggr30 / revAggr30) * 100) : 0}%\` |
| **60 يوماً** | \`${salesAggr30 + salesAggr60} مبيعة\` | \`${f(revAggr60)}\` | \`${f(costs30 + costs60)}\` | **\`${f(profitAggr60)}\`** | \`${revAggr60 ? Math.round((profitAggr60 / revAggr60) * 100) : 0}%\` |
| **90 يوماً** | \`${salesAggr30 + salesAggr60 + salesAggr90} مبيعة\` | \`${f(revAggr90)}\` | \`${f(costs30 + costs60 + costs90)}\` | **\`${f(profitAggr90)}\`** | \`${revAggr90 ? Math.round((profitAggr90 / revAggr90) * 100) : 0}%\` |

---

#### 4. توصية وملاحظة استراتيجية لنموذج البزنس الخاص بك (${growth})
* **تحسين عائد الإعلانات (ROAS):** مع ميزانية إعلانية قدرها **${f(adBudgetNum)}**، يجب الحفاظ على تكلفة اكتساب العميل (CAC) أقل من **${f(aovNum * 0.3)}** لضمان استدامة هامش الربح الإعلاني.
* **الأتمتة وتوسيع التيم:** في السيناريو المتفائل، ستحتاج إلى مبيعات عالية في الشهر الثالث؛ لذا يُنصح بتجهيز أنظمة حجز مواجهات مؤتمتة لتفادي الضغط وتدريب موظف مبيعات عمولة (Commission-based Setter) للمساعدة في المكالمات.`;
  } else {
    return `### 💰 Multi-Scenario Revenue & Profit Projections for **${name}**

Calculated based on an Average Order Value (AOV) of **${f(aovNum)}**, a closing rate of **${closeNum}%**, monthly operational costs of **${f(opCostsNum)}**, and a monthly marketing budget of **${f(adBudgetNum)}** (Total Monthly Costs: **${f(costs30)}**).

---

#### 1. Conservative Scenario (Slow Growth)
*Assumes closing rate drops by 40% due to market friction, with flat lead volume.*

| Period | Sales Volume | Gross Revenue | Total Expenses | Net Profit | Profit Margin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **30 Days** | \`${salesCons} sales\` | \`${f(revCons30)}\` | \`${f(costs30)}\` | **\`${f(profitCons30)}\`** | \`${revCons30 ? Math.round((profitCons30 / revCons30) * 100) : 0}%\` |
| **60 Days** | \`${salesCons * 2} sales\` | \`${f(revCons60)}\` | \`${f(costs30 * 2)}\` | **\`${f(profitCons60)}\`** | \`${revCons60 ? Math.round((profitCons60 / revCons60) * 100) : 0}%\` |
| **90 Days** | \`${salesCons * 3} sales\` | \`${f(revCons90)}\` | \`${f(costs30 * 3)}\` | **\`${f(profitCons90)}\`** | \`${revCons90 ? Math.round((profitCons90 / revCons90) * 100) : 0}%\` |

---

#### 2. Realistic Scenario (Healthy Growth) ★
*Assumes maintaining your ${closeNum}% close rate with organic/paid leads scaling at 20% month-over-month.*

| Period | Sales Volume | Gross Revenue | Total Expenses | Net Profit | Profit Margin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **30 Days** | \`${salesReal30} sales\` | \`${f(revReal30)}\` | \`${f(costs30)}\` | **\`${f(profitReal30)}\`** | \`${revReal30 ? Math.round((profitReal30 / revReal30) * 100) : 0}%\` |
| **60 Days** | \`${salesReal30 + salesReal60} sales\` | \`${f(revReal60)}\` | \`${f(costs30 * 2)}\` | **\`${f(profitReal60)}\`** | \`${revReal60 ? Math.round((profitReal60 / revReal60) * 100) : 0}%\` |
| **90 Days** | \`${salesReal30 + salesReal60 + salesReal90} sales\` | \`${f(revReal90)}\` | \`${f(costs30 * 3)}\` | **\`${f(profitReal90)}\`** | \`${revReal90 ? Math.round((profitReal90 / revReal90) * 100) : 0}%\` |

---

#### 3. Aggressive Scenario (Accelerated Scale)
*Assumes conversion rate optimizes by 20% and traffic doubles by Month 3 using targeted paid advertising.*

| Period | Sales Volume | Gross Revenue | Total Expenses | Net Profit | Profit Margin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **30 Days** | \`${salesAggr30} sales\` | \`${f(revAggr30)}\` | \`${f(costs30)}\` | **\`${f(profitAggr30)}\`** | \`${revAggr30 ? Math.round((profitAggr30 / revAggr30) * 100) : 0}%\` |
| **60 Days** | \`${salesAggr30 + salesAggr60} sales\` | \`${f(revAggr60)}\` | \`${f(costs30 + costs60)}\` | **\`${f(profitAggr60)}\`** | \`${revAggr60 ? Math.round((profitAggr60 / revAggr60) * 100) : 0}%\` |
| **90 Days** | \`${salesAggr30 + salesAggr60 + salesAggr90} sales\` | \`${f(revAggr90)}\` | \`${f(costs30 + costs60 + costs90)}\` | **\`${f(profitAggr90)}\`** | \`${revAggr90 ? Math.round((profitAggr90 / revAggr90) * 100) : 0}%\` |

---

#### 4. Growth Strategy Advice for ${growth} Mode
* **ROAS Target Calculation:** With a monthly ad spend of **${f(adBudgetNum)}**, target a Customer Acquisition Cost (CAC) below **${f(aovNum * 0.3)}** to secure healthy ad margins.
* **Capacity Planning:** Under aggressive projections, ensure delivery automation or contract support is prepared for the Month 3 growth burst.`;
  }
}

function generateSmartLeadForecast(isAR, name, niche, context, prompt, symbol = '$', currencyCode = 'USD') {
  const pStr = String(prompt || '');
  const aud = extract(pStr, 'حجم الجمهور/المتابعين الحالي') || extract(pStr, 'Current Audience Size') || '1500';
  const method = extract(pStr, 'طريقة جذب العملاء المختارة') || extract(pStr, 'Lead Generation Method') || 'Paid ads';
  const revenueGoalStr = extract(pStr, 'هدف الإيرادات الشهري') || extract(pStr, 'Monthly Revenue Goal') || '$5,000';
  const offerPriceStr = extract(pStr, 'سعر الاستثمار') || extract(pStr, 'Price') || '$200';
  const roadmap = context?.strategy?.roadmap || 'خطوات التسويق وتكبير الجمهور العضوي والمدفوع وفقاً للخطة التشغيلية.';

  const audNum = parseFloat(aud.replace(/[^0-9]/g, '')) || 1500;
  const targetRevNum = parseFloat(revenueGoalStr.replace(/[^0-9.]/g, '')) || 5000;
  const priceNum = parseFloat(offerPriceStr.replace(/[^0-9.]/g, '')) || 200;

  // Let's assume conversion rate from leads to sales based on the method
  let leadsToSalesConv = 3; // 3% default
  if (method.includes('Organic')) leadsToSalesConv = 5;
  if (method.includes('email') || method.includes('magnet')) leadsToSalesConv = 4;

  const targetSales = Math.ceil(targetRevNum / priceNum) || 25;
  const targetLeadsNum = Math.ceil(targetSales / (leadsToSalesConv / 100)) || 1000;

  // 30, 60, 90 day lead generation projection
  // Month 1: 40% of target
  const leads30 = Math.round(targetLeadsNum * 0.4);
  const clients30 = Math.round(leads30 * (leadsToSalesConv / 100));

  // Month 2: 75% of target
  const leads60 = Math.round(targetLeadsNum * 0.75);
  const clients60 = Math.round(leads60 * (leadsToSalesConv / 100));

  // Month 3: 120% of target (as traffic optimization scales)
  const leads90 = Math.round(targetLeadsNum * 1.2);
  const clients90 = Math.round(leads90 * (leadsToSalesConv / 100));

  // Calculations for daily metrics
  const dailyLeadsNeeded = Math.ceil(targetLeadsNum / 30);
  // assuming a standard landing page conversion rate of 20% (visitors -> leads)
  const dailyVisitorsNeeded = Math.ceil(dailyLeadsNeeded / 0.2); 
  // assuming 2% CTR for ads/content reach
  const dailyReachNeeded = Math.ceil(dailyVisitorsNeeded / 0.02);

  if (isAR) {
    return `### 👥 لوحة توقعات نمو العملاء والجمهور (Lead & Client Forecast) لـ **${name}**

مُعدة بناءً على طريقة جذب **${method}** وهدف شهري **${targetLeadsNum} عميل محتمل**، بالتكامل مع خارطة طريق البزنس (Strategy Roadmap) في مجال **${niche}**.

---

#### 1. تحليل المواءمة مع خارطة الطريق (Roadmap Alignment Synergy)
بناءً على خطوات الـ Roadmap الخاصة بك ومجال عملك (**${niche}**):
* **تفعيل القنوات:** يشير الـ Roadmap إلى أهمية تكبير قنوات الجذب من خلال **${method}**. حجم الجمهور الحالي لديك (**${audNum} متابع**) يعد قاعدة أساسية ممتازة للانطلاق.
* **قمع المبيعات:** الخطة الاستراتيجية المعتمدة تركز على بناء تدفق مستمر للزيارات وتوجيههم لصفحات الهبوط المخصصة لعرضك الأساسي، مما يرفع نسبة تحويل الزوار إلى عملاء مهتمين بشكل طبيعي وتدريجي.

---

#### 2. جدول توقعات النمو لـ 90 يوماً (30/60/90 Day Forecast Dashboard)

| الفترة الزمنية | أعداد العملاء المحتملين المتوقعة (Leads) | أعداد المشترين الفعليين المتوقعة (Clients) | معدل تحويل المبيعات (CVR) |
| :--- | :---: | :---: | :---: |
| **الشهر الأول (30 يوماً)** | \`${leads30} عميل محتمل\` | \`${clients30} عميل مشترٍ\` | \`${leadsToSalesConv}%\` |
| **الشهر الثاني (60 يوماً)** | \`${leads60} عميل محتمل\` | \`${clients60} عميل مشترٍ\` | \`${leadsToSalesConv}%\` |
| **الشهر الثالث (90 يوماً)** | \`${leads90} عميل محتمل\` | \`${clients90} عميل مشترٍ\` | \`${leadsToSalesConv}%\` |

---

#### 3. متطلبات حركة المرور اليومية للوصول للهدف (Daily Reach Requirements)
لتحقيق هدفك الشهري البالغ **${targetLeadsNum} عميل محتمل** شهرياً:
* **معدل العملاء اليومي المطلوب:** تحتاج إلى جذب **${dailyLeadsNeeded} عميل محتمل يومياً**.
* **عدد زيارات صفحة الهبوط المطلوبة:** تحتاج لـ **${dailyVisitorsNeeded} زائر فريد يومياً** (بافتراض معدل تحويل صفحة هبوط 20%).
* **الوصول اليومي المستهدف (Impressions):** تحتاج إلى ظهور إعلاناتك أو محتواك لـ **${dailyReachNeeded} شخص يومياً** (بافتراض نسبة نقر 2% CTR).

---

#### 4. توجيهات تنفيذ الـ Roadmap لضمان تحقيق التوقعات
1. **استغلال الميزانية الذكية:** بما أنك تعتمد على **${method}**، احرص على تفعيل ميزة اختبار الإعلانات (A/B Testing) للوصول لأفضل تكلفة لكل عميل محتمل (CPL).
2. **صناعة محتوى تكميلي:** قم بنشر دليل مجاني أو مغناطيس عملاء (Lead Magnet) يحل مشكلة جوهرية لجمهورك لتخفيض تكلفة الإعلانات وزيادة معدل التسجيل بصفحة الهبوط.
3. **أتمتة المتابعة بالبريد:** بمجرد دخول العميل المحتمل للقائمة، استخدم سلسلة رسائل بريد إلكتروني ترحيبية تلقائية لتهيئة العميل ودفعه للشراء خلال أول 7 أيام.`;
  } else {
    return `### 👥 Lead & Client Growth Forecast for **${name}**

Calculated based on **${method}** acquisition, targeting **${targetLeadsNum} leads/month** in the **${niche}** niche, integrated with your Strategy Roadmap.

---

#### 1. Roadmap Alignment Synergy Analysis
Based on your business niche (**${niche}**) and strategy roadmap steps:
* **Audience Foundation:** Your starting audience size of **${audNum}** is a solid foundation.
* **Funnel Scaling:** Your roadmap prioritizes scaling traffic via **${method}**. The progressive launch of lead magnets and marketing funnels is expected to accelerate target acquisition month-over-month.

---

#### 2. 30/60/90 Day Growth Forecast Dashboard

| Timeframe | Projected New Leads | Projected Closed Clients | Estimated Lead-to-Sale CVR |
| :--- | :---: | :---: | :---: |
| **Month 1 (30 Days)** | \`${leads30} leads\` | \`${clients30} sales\` | \`${leadsToSalesConv}%\` |
| **Month 2 (60 Days)** | \`${leads60} leads\` | \`${clients60} sales\` | \`${leadsToSalesConv}%\` |
| **Month 3 (90 Days)** | \`${leads90} leads\` | \`${clients90} sales\` | \`${leadsToSalesConv}%\` |

---

#### 3. Daily Funnel Traffic Requirements
To hit your goal of **${targetLeadsNum} leads** per month:
* **Daily New Leads Needed:** You need to generate **${dailyLeadsNeeded} new leads/day**.
* **Daily Landing Page Visitors:** You need **${dailyVisitorsNeeded} unique visitors/day** (assuming a 20% landing page opt-in rate).
* **Daily Campaign Impressions/Reach:** You need your campaigns to be viewed by **${dailyReachNeeded} users/day** (assuming a 2% Click-Through Rate).

---

#### 4. Strategic Recommendations from your Roadmap
1. **Optimize Cost per Lead (CPL):** In **${method}**, run creative testing (angles, hooks) to lower cost and capture highly qualified leads.
2. **Deploy High-Value Lead Magnets:** Pair your ads/organic content with a free template or calculator to drive up landing page conversions.
3. **Automate Nurture Sequences:** Implement email follow-ups to warm up new leads instantly, raising your closing rate from ${leadsToSalesConv}% to the industry benchmark.`;
  }
}
