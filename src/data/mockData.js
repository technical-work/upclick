export const PAGE_META = {
  home: { section: 'Dashboard', page: 'Overview' },
  strategy: { section: 'Manage', page: 'Strategy & Planning' },
  launchpad: { section: 'Build', page: 'Launchpad' },
  content: { section: 'Create', page: 'Content Hub' },
  social: { section: 'Create', page: 'Social Accounts' },
  bio: { section: 'Create', page: 'Bio Link Builder' },
  growth: { section: 'Grow', page: 'Growth Hub' },
  landing: { section: 'Build', page: 'Landing Page AI' },
  upclick: { section: 'Build', page: 'UpClick Builder' },
  'ai-growth': { section: 'Discover', page: 'AI Growth Intelligence' },
  'tiktok-trends': { section: 'Discover', page: 'Social Trends' },
  crm: { section: 'Grow', page: 'Smart CRM' },
  revenue: { section: 'Grow', page: 'Revenue Hub' },
  digital: { section: 'Build', page: 'Digital Products' },
  telegram: { section: 'Grow', page: 'Telegram Hub' },
  marketing: { section: 'Grow', page: 'Marketing OS' },
  'mkt-research': { section: 'Marketing OS', page: 'Research' },
  'mkt-strategy': { section: 'Marketing OS', page: 'Strategy' },
  'mkt-offers': { section: 'Marketing OS', page: 'Offers' },
  'mkt-ads': { section: 'Marketing OS', page: 'Ads' },
  'mkt-content': { section: 'Marketing OS', page: 'Content' },
  'mkt-funnels': { section: 'Marketing OS', page: 'Funnels' },
  'mkt-analytics': { section: 'Marketing OS', page: 'Analytics' },
  'mkt-ai': { section: 'Marketing OS', page: 'AI Consultant' },
  tasks: { section: 'Manage', page: 'Task Board' },
  calendar: { section: 'Manage', page: 'Smart Calendar' },
  ops: { section: 'Manage', page: 'Ops Hub' },
  finance: { section: 'Manage', page: 'Finance' },
  community: { section: 'Community', page: 'Community Hub' },
  analytics: { section: 'Settings', page: 'Analytics' },
  integrations: { section: 'Settings', page: 'Integrations' },
  profile: { section: 'Account', page: 'My Profile' }
};

export const OB_OPTS = {
  types: {
    en: [
      { e: '🎓', l: 'Coach / Trainer' },
      { e: '📱', l: 'Content Creator' },
      { e: '🏢', l: 'Agency / Consultancy' },
      { e: '🛍️', l: 'Product Business' },
      { e: '👤', l: 'Personal Brand' },
      { e: '🚀', l: 'Starting from Zero' }
    ],
    ar: [
      { e: '🎓', l: 'مدرب / مدربة' },
      { e: '📱', l: 'صانع محتوى' },
      { e: '🏢', l: 'وكالة / استشارية' },
      { e: '🛍️', l: 'بزنس منتجات' },
      { e: '👤', l: 'براند شخصي' },
      { e: '🚀', l: 'مبتدئ من الصفر' }
    ]
  },
  levels: {
    en: [
      { e: '🌱', l: 'Beginner' },
      { e: '📈', l: 'Growing' },
      { e: '🌟', l: 'Established' }
    ],
    ar: [
      { e: '🌱', l: 'مبتدئ' },
      { e: '📈', l: 'في النمو' },
      { e: '🌟', l: 'راسخ' }
    ]
  },
  challenges: {
    en: [
      { e: '💰', l: 'Getting clients & revenue' },
      { e: '📣', l: 'Marketing & visibility' },
      { e: '⚙️', l: 'Systems & organization' },
      { e: '🎯', l: 'Clear strategy & direction' },
      { e: '⏰', l: 'Time management' },
      { e: '📦', l: 'Products & offers' }
    ],
    ar: [
      { e: '💰', l: 'الحصول على عملاء ودخل' },
      { e: '📣', l: 'التسويق والظهور' },
      { e: '⚙️', l: 'الأنظمة والتنظيم' },
      { e: '🎯', l: 'استراتيجية وتوجه واضح' },
      { e: '⏰', l: 'إدارة الوقت' },
      { e: '📦', l: 'منتجات وعروض' }
    ]
  }
};

export const DB = {
  platforms: [
    { e: '📸', n: { en: 'Instagram', ar: 'انستجرام' }, c: '#e8519a', f: '142K', ch: '+1.8%', p: 70 },
    { e: '🎵', n: { en: 'TikTok', ar: 'تيك توك' }, c: '#7c6ff7', f: '89K', ch: '+4.2%', p: 45 },
    { e: '▶️', n: { en: 'YouTube', ar: 'يوتيوب' }, c: '#f0623a', f: '35K', ch: '+0.9%', p: 20 },
    { e: '🐦', n: { en: 'Twitter/X', ar: 'تويتر/X' }, c: '#1ec98e', f: '18K', ch: '+2.1%', p: 12 }
  ],
  upcoming: [
    { e: '🎵', n: { en: 'Morning Routine Reel', ar: 'ريل روتين الصباح' }, t: { en: 'Today 9:00 AM', ar: 'اليوم ٩:٠٠ ص' }, b: 'bdg' },
    { e: '📸', n: { en: 'Product Review Carousel', ar: 'كاروسيل مراجعة منتج' }, t: { en: 'Tomorrow 6:00 PM', ar: 'غداً ٦:٠٠ م' }, b: 'bdo' },
    { e: '▶️', n: { en: 'Q&A Session', ar: 'جلسة أسئلة وأجوبة' }, t: { en: 'Fri 3:00 PM', ar: 'الجمعة ٣:٠٠ م' }, b: 'bdp' }
  ],
  ideas: {
    en: [
      { t: '5 morning habits that changed my life', p: 'Reel', ty: 'Educational', tm: '7–9 AM' },
      { t: 'What I eat in a day (real version)', p: 'Carousel', ty: 'Personal', tm: '12–2 PM' },
      { t: 'Answering your most asked DMs', p: 'Story', ty: 'Community', tm: '6–8 PM' },
      { t: 'POV: My workspace 2025', p: 'TikTok', ty: 'Lifestyle', tm: '8–10 PM' },
      { t: '3 tools I use daily as a creator', p: 'Carousel', ty: 'Educational', tm: '9 AM' }
    ],
    ar: [
      { t: '٥ عادات صباحية غيّرت حياتي', p: 'ريل', ty: 'تعليمي', tm: '٧–٩ ص' },
      { t: 'ماذا آكل في يوم كامل (الحقيقة)', p: 'كاروسيل', ty: 'شخصي', tm: '١٢–٢ م' },
      { t: 'أجيب على أكثر أسئلتكم في DM', p: 'ستوري', ty: 'مجتمع', tm: '٦–٨ م' },
      { t: 'POV: مكتبي في ٢٠٢٥', p: 'تيك توك', ty: 'لايف ستايل', tm: '٨–١٠ م' },
      { t: '٣ أدوات أستخدمها يومياً', p: 'كاروسيل', ty: 'تعليمي', tm: '٩ ص' }
    ]
  },
  capSets: {
    en: [
      ['Woke up and chose chaos ☕ What\'s your morning vibe?', 'This coffee didn\'t ask for my problems but here we are 😭☕', 'POV: you before 8AM vs after coffee ⬇️'],
      ['3 things I do every morning before checking my phone 👇', 'Your morning routine IS your success routine. Here\'s what I learned:', 'The 5-min ritual that changed my productivity completely'],
      ['Some mornings feel heavy. Today was one of those. But I showed up 💙', 'There\'s something magical about quiet early mornings ☀️', 'This moment right here is why I love what I do 💫'],
      ['What\'s your #1 morning habit? Drop it below 👇', 'Save this for your next slow morning ☕ Tag a friend!', 'Follow for daily inspo ✨ New post every day at 7AM!']
    ],
    ar: [
      ['صحيت الصبح واخترت الفوضى ☕ إيه جو صباحك؟', 'القهوة دي مش طلبت مشاكلي بس أهي هنا 😭☕', 'POV: أنت قبل ٨ الصبح مقارنة بعد القهوة ⬇️'],
      ['٣ حاجات بعملهم كل صباح قبل ما أفتح التليفون 👇', 'روتين الصباح هو روتين نجاحك بالظبط. إليك ما تعلمته:', 'طقوس الـ ٥ دقايق اللي غيّرت إنتاجيتي كلياً'],
      ['فيه صبحيات تكون تقيلة. النهارده كانت منهم. بس جيت 💙', 'فيه حاجة سحرية في البكري الهادي ☀️', 'اللحظة دي هي اللي بتخليني أحب شغلي 💫'],
      ['إيه عادتك رقم ١ في الصباح؟ حطيها في التعليق 👇', 'احفظ ده للصبحية الجاية ☕ تاق صاحبتك!', 'فولو للإلهام اليومي ✨ بوست جديد كل يوم الساعة ٧!']
    ]
  },
  trendHot: {
    en: ['#MorningRoutine +340%', '#WorkFromHome +280%', '#GlowUp +190%', '#DayInMyLife +155%'],
    ar: ['#روتين_الصباح +٣٤٠٪', '#العمل_من_المنزل +٢٨٠٪', '#تغيير_الشكل +١٩٠٪', '#يومي +١٥٥٪']
  },
  trendEmer: {
    en: ['#ProductivityTips +85%', '#SkincareRoutine +72%', '#CoffeeTok +68%'],
    ar: ['#نصائح_الإنتاجية +٨٥٪', '#روتين_العناية +٧٢٪', '#قهوة_تيك +٦٨٪']
  },
  trendSoon: {
    en: ['#BackToSchool +45%', '#TravelVibes +40%', '#HomeDeco +38%'],
    ar: ['#العودة_للمدرسة +٤٥٪', '#السفر +٤٠٪', '#ديكور_البيت +٣٨٪']
  },
  trendAudio: [
    { n: 'Espresso – Sabrina Carpenter', u: { en: '2.4M uses', ar: '٢.٤م استخدام' }, hot: true },
    { n: "Levii's Jeans – Beyoncé", u: { en: '1.8M uses', ar: '١.٨م استخدام' }, hot: true },
    { n: 'APT. – Rose & Bruno Mars', u: { en: '3.1M uses', ar: '٣.١م استخدام' }, hot: true },
    { n: 'Birds of a Feather', u: { en: '980K uses', ar: '٩٨٠ألف استخدام' }, hot: false }
  ],
  repurposeFormats: {
    en: ['📱 TikTok/Reels Script (60s)', '🐦 Twitter/X Thread (5 tweets)', '📧 Email Newsletter intro', '📸 Instagram Carousel (5 slides)', '📝 Blog post opening'],
    ar: ['📱 سكريبت تيك توك/ريلز (٦٠ ثانية)', '🐦 ثريد تويتر/X (٥ تغريدات)', '📧 مقدمة نيوزليتر إيميل', '📸 كاروسيل انستجرام (٥ شرائح)', '📝 مقدمة مقالة مدونة']
  },
  qaFreq: {
    en: ['How did you grow to 284K followers?', 'What camera do you use?', 'How do you find brand deals?', 'How many hours do you work daily?', 'What\'s your editing app?'],
    ar: ['إزاي وصلتِ لـ ٢٨٤ ألف متابع؟', 'إيه الكاميرا اللي بتصوري بيها؟', 'إزاي بتلاقي صفقات البراندات؟', 'بتشتغلي كام ساعة في اليوم؟', 'إيه تطبيق المونتاج بتاعك؟']
  },
  socialAccounts: [
    { e: '📸', name: 'Instagram', color: '#e8519a', handle: '@sarahahassan', followers: '142K', eng: '7.2%', growth: '+1.8%', connected: true },
    { e: '🎵', name: 'TikTok', color: '#7c6ff7', handle: '@sara.creates', followers: '89K', eng: '9.1%', growth: '+4.2%', connected: true },
    { e: '▶️', name: 'YouTube', color: '#f0623a', handle: 'Sara Hassan', followers: '35K', eng: '4.8%', growth: '+0.9%', connected: true },
    { e: '🐦', name: 'Twitter/X', color: '#1ec98e', handle: '@sarahahassan', followers: '18K', eng: '2.1%', growth: '+2.1%', connected: false },
    { e: '👻', name: 'Snapchat', color: '#f5c842', handle: 'sarahahassan', followers: '—', eng: '—', growth: '—', connected: false },
    { e: '📌', name: 'Pinterest', color: '#E60023', handle: 'sarahahassan', followers: '—', eng: '—', growth: '—', connected: false }
  ],
  socialAI: {
    en: {
      overall: 'Based on your 3 connected accounts, your strongest platform is TikTok (9.1% engagement vs 3.5% industry average). Your Instagram has the highest follower count but lower engagement — consider repurposing your TikToks as Reels to boost reach.',
      instagram: 'Instagram: Your 7.2% engagement is excellent (top 5% of creators). Reels get 3x more reach than carousels in your niche. Best time to post: 7–9 AM and 6–8 PM (your audience is most active). Consider posting 5 Reels/week instead of 3.',
      tiktok: 'TikTok: Your fastest-growing platform (+4.2%/week). Your "morning routine" content gets 2x average views. Suggested: post 1 TikTok daily. The algorithm rewards consistency here more than any other platform.',
      youtube: 'YouTube: Lowest engagement but highest revenue potential per view ($2–5 RPM vs $0.10 for Instagram). Your Q&A videos get the most comments. Suggested: post 2 videos/week and add chapters to boost watch time.'
    },
    ar: {
      overall: 'بناءً على حساباتك الـ ٣ المتصلة، منصتك الأقوى هي تيك توك (٩.١٪ تفاعل مقابل متوسط الصناعة ٣.٥٪). انستجرام لديه أكبر عدد متابعين لكن تفاعل أقل — فكري في إعادة استخدام تيك توك الخاصة بك كريلز لزيادة الوصول.',
      instagram: 'انستجرام: تفاعلك ٧.٢٪ ممتاز (أفضل ٥٪ من المنشئين). الريلز يحصل على وصول ٣ أضعاف الكاروسيل في نيشك. أفضل وقت للنشر: ٧–٩ ص و٦–٨ م. فكري في نشر ٥ ريلز أسبوعياً بدل ٣.',
      tiktok: 'تيك توك: منصتك الأسرع نمواً (+٤.٢٪/أسبوع). محتوى "روتين الصباح" يحصل على ضعف متوسط المشاهدات. المقترح: انشري تيك توك واحد يومياً. الخوارزمية تكافئ الاستمرارية هنا أكثر من أي منصة أخرى.',
      youtube: 'يوتيوب: أقل تفاعل لكن أعلى إمكانية دخل لكل مشاهدة ($٢–٥ لكل ١٠٠٠ مشاهدة). فيديوهات الأسئلة والأجوبة تحصل على أكثر تعليقات. المقترح: انشري فيديوهين أسبوعياً وأضيفي فصول لتحسين مدة المشاهدة.'
    }
  },
  burnWeeks: {
    en: [{ w: 'Week 1', posts: 5, e: 80 }, { w: 'Week 2', posts: 6, e: 72 }, { w: 'Week 3', posts: 4, e: 60 }, { w: 'Week 4', posts: 4, e: 75 }],
    ar: [{ w: 'الأسبوع ١', posts: 5, e: 80 }, { w: 'الأسبوع ٢', posts: 6, e: 72 }, { w: 'الأسبوع ٣', posts: 4, e: 60 }, { w: 'الأسبوع ٤', posts: 4, e: 75 }]
  },
  burnTips: {
    en: [
      { e: '😴', t: 'Schedule a Rest Day', d: '4 days straight posting. Engagement peaks after 1 day off — take tomorrow off.' },
      { e: '🔄', t: 'Batch Your Content', d: '3 hours Sunday = content for the whole week. Reduces daily stress by 70%.' },
      { e: '♻', t: 'Repurpose Old Content', d: 'Your Reel from 2 weeks ago got 8K views. Turn it into a Carousel and save 2 hours.' }
    ],
    ar: [
      { e: '😴', t: 'جدولي يوم راحة', d: '٤ أيام نشر متتالية. التفاعل يصل للذروة بعد يوم راحة — خدي بكرة إجازة.' },
      { e: '🔄', t: 'اعملي الكونتنت بالجملة', d: '٣ ساعات الأحد = كونتنت الأسبوع كله. يقلل الضغط اليومي ٧٠٪.' },
      { e: '♻', t: 'أعيدي استخدام المحتوى القديم', d: 'الريل اللي عملتيه من أسبوعين أخد ٨ آلاف مشاهدة. حوليه كاروسيل — يوفر ساعتين.' }
    ]
  },
  streamsLegend: {
    en: [
      { l: 'Sponsorships', v: '$2,800 · 65%', c: 'var(--a)' },
      { l: 'Affiliate', v: '$820 · 19%', c: 'var(--a2)' },
      { l: 'Products', v: '$450 · 10%', c: 'var(--a3)' },
      { l: 'Coaching', v: '$250 · 6%', c: 'var(--go)' }
    ],
    ar: [
      { l: 'الإعلانات المدفوعة', v: '$٢,٨٠٠ · ٦٥٪', c: 'var(--a)' },
      { l: 'الأفيليت', v: '$٨٢٠ · ١٩٪', c: 'var(--a2)' },
      { l: 'المنتجات', v: '$٤٥٠ · ١٠٪', c: 'var(--a3)' },
      { l: 'الكوتشينج', v: '$٢٥٠ · ٦٪', c: 'var(--go)' }
    ]
  },
  streamsLauncher: {
    en: [
      { e: '📦', n: 'Digital Product', est: '$200–800/mo', t: '2 weeks', a: true },
      { e: '🎓', n: 'Online Course', est: '$500–2K launch', t: '4 weeks', a: true },
      { e: '🏆', n: 'Paid Membership', est: '$100–500/mo', t: '1 week', a: true },
      { e: '📧', n: 'Email Newsletter', est: '$50–300/mo', t: '3 days', a: false },
      { e: '👕', n: 'Merch Store', est: '$200–1K/mo', t: '1 week', a: true },
      { e: '🎯', n: 'Coaching', est: '$300–1K/mo', t: 'Immediate', a: true },
      { e: '🔗', n: 'Affiliate Marketing', est: '$100–500/mo', t: 'Immediate', a: true }
    ],
    ar: [
      { e: '📦', n: 'منتج رقمي', est: '$٢٠٠–٨٠٠/شهر', t: 'أسبوعان', a: true },
      { e: '🎓', n: 'كورس أونلاين', est: '$٥٠٠–٢ألف', t: '٤ أسابيع', a: true },
      { e: '🏆', n: 'عضوية مدفوعة', est: '$١٠٠–٥٠٠/شهر', t: 'أسبوع', a: true },
      { e: '📧', n: 'نيوزليتر', est: '$٥٠–٣٠٠/شهر', t: '٣ أيام', a: false },
      { e: '👕', n: 'متجر مرش', est: '$٢٠٠–١ألف/شهر', t: 'أسبوع', a: true },
      { e: '🎯', n: 'كوتشينج', est: '$٣٠٠–١ألف/شهر', t: 'فوري', a: true },
      { e: '🔗', n: 'أفيليت ماركتينج', est: '$١٠٠–٥٠٠/شهر', t: 'فوري', a: true }
    ]
  },
  deals: {
    Prospect: [{ n: 'Huawei ME', a: '$600', ty: { en: 'Unboxing', ar: 'فتح علبة' } }, { n: "L'Oréal", a: '$500', ty: { en: '3x Carousel', ar: '٣ كاروسيل' } }],
    Negotiating: [{ n: 'Samsung', a: '$800', ty: { en: 'Product Review', ar: 'مراجعة منتج' } }],
    Contracted: [{ n: 'Nike Digital', a: '$800', ty: { en: '2x Reels', ar: '٢ ريلز' } }, { n: 'Sephora MENA', a: '$1,200', ty: { en: 'Stories Pack', ar: 'باقة ستوريز' } }],
    Completed: [{ n: 'Adidas', a: '$950', ty: { en: 'Campaign', ar: 'حملة' } }, { n: 'Dyson', a: '$700', ty: { en: 'Reel', ar: 'ريل' } }]
  },
  bestBrands: {
    en: [
      { n: 'Sephora MENA', deals: 3, rev: '$3,600', eng: '+12%', rec: true },
      { n: 'Nike Digital', deals: 2, rev: '$1,600', eng: '+8%', rec: true },
      { n: 'Adidas', deals: 1, rev: '$950', eng: '+5%', rec: false }
    ],
    ar: [
      { n: 'سيفورا MENA', deals: 3, rev: '$٣,٦٠٠', eng: '+١٢٪', rec: true },
      { n: 'نايك الرقمي', deals: 2, rev: '$١,٦٠٠', eng: '+٨٪', rec: true },
      { n: 'أديداس', deals: 1, rev: '$٩٥٠', eng: '+٥٪', rec: false }
    ]
  },
  priceTmpl: {
    en: [
      { n: 'Bronze', p: '$200–400', items: ['1x Post', '5x Stories', '30-day rights'], c: '#cd7f32' },
      { n: 'Silver', p: '$500–800', items: ['1x Reel', '1x Post', '15x Stories', '60-day rights'], c: '#a0a0a0' },
      { n: 'Gold', p: '$1K–2K', items: ['Reel + Carousel + TikTok', 'Full rights', 'Monthly report'], c: '#f5c842' }
    ],
    ar: [
      { n: 'برونز', p: '$٢٠٠–٤٠٠', items: ['منشور واحد', '٥ ستوريز', 'حقوق ٣٠ يوم'], c: '#cd7f32' },
      { n: 'فضي', p: '$٥٠٠–٨٠٠', items: ['١ ريل', '١ منشور', '١٥ ستوري', 'حقوق ٦٠ يوم'], c: '#a0a0a0' },
      { n: 'ذهبي', p: '$١ألف–٢ألف', items: ['ريل + كاروسيل + تيك توك', 'حقوق كاملة', 'تقرير شهري'], c: '#f5c842' }
    ]
  },
  digitalIdeas: {
    en: [
      { n: 'Instagram Growth Blueprint', p: '$29', ty: 'PDF', why: '#1 asked question' },
      { n: 'Content Calendar Template', p: '$19', ty: 'Notion', why: 'Sell what you use' },
      { n: 'Caption Swipe File (100)', p: '$15', ty: 'PDF', why: 'Low price = high volume' },
      { n: 'Influencer Starter Kit', p: '$49', ty: 'Bundle', why: 'Bundle = higher value' },
      { n: 'Morning Routine Planner', p: '$12', ty: 'Printable', why: 'Top engagement topic' },
      { n: 'Collab Email Templates', p: '$25', ty: 'Templates', why: 'Creators need this' },
      { n: 'Creator Finance Tracker', p: '$19', ty: 'Spreadsheet', why: 'Every creator needs this' },
      { n: 'TikTok Script Templates', p: '$29', ty: 'Notion', why: 'Short-form = #1 challenge' },
      { n: 'Personal Brand Workbook', p: '$39', ty: 'PDF', why: 'Brand story = biggest asset' },
      { n: 'Video Editing Presets', p: '$22', ty: 'Download', why: 'Aesthetic = advantage' }
    ],
    ar: [
      { n: 'خطة نمو انستجرام', p: '$٢٩', ty: 'PDF', why: 'سؤال رقم ١ من جمهورك' },
      { n: 'قالب تقويم المحتوى', p: '$١٩', ty: 'Notion', why: 'بيعي ما تستخدمينه' },
      { n: 'ملف كابشن (١٠٠)', p: '$١٥', ty: 'PDF', why: 'سعر منخفض = حجم عالي' },
      { n: 'كيت بداية المنشئ', p: '$٤٩', ty: 'باندل', why: 'الباندل = قيمة أعلى' },
      { n: 'مخطط روتين الصباح', p: '$١٢', ty: 'طباعة', why: 'موضوع التفاعل الأعلى' },
      { n: 'قوالب إيميل الكولاب', p: '$٢٥', ty: 'قوالب', why: 'المنشئون يحتاجونها' },
      { n: 'متتبع مالية المنشئ', p: '$١٩', ty: 'جدول', why: 'كل منشئ محتاجه' },
      { n: 'قوالب سكريبت تيك توك', p: '$٢٩', ty: 'Notion', why: 'المحتوى القصير = التحدي رقم ١' },
      { n: 'كتاب البراند الشخصي', p: '$٣٩', ty: 'PDF', why: 'قصة براندك = أكبر أصولك' },
      { n: 'بريسيتات المونتاج', p: '$٢٢', ty: 'تنزيل', why: 'الجماليات = ميزتك' }
    ]
  },
  courseOutline: {
    en: [
      { m: 'Module 1: Foundation', ls: ['Personal brand basics', 'Niche in Arab market', 'Algorithm success setup', 'Content pillars strategy'] },
      { m: 'Module 2: Content Creation', ls: ['Perfect Reel formula', 'Pro phone filming', 'Time-saving editing', 'Converting captions'] },
      { m: 'Module 3: Growth', ls: ['Hashtag mastery', 'Collab strategy', 'Community Stories', 'Going viral formula'] },
      { m: 'Module 4: Monetization', ls: ['When to work with brands', 'Pricing your worth', 'Passive income streams', 'Followers to customers'] },
      { m: 'Module 5: Scaling', ls: ['Building a team', 'Content batching systems', 'Analytics: what matters', 'Media kit that gets YES'] }
    ],
    ar: [
      { m: 'الوحدة ١: الأساسيات', ls: ['أساسيات البراند الشخصي', 'النيش في السوق العربي', 'إعداد نجاح الخوارزمية', 'استراتيجية أعمدة المحتوى'] },
      { m: 'الوحدة ٢: إنشاء المحتوى', ls: ['معادلة الريل المثالية', 'التصوير بالهاتف كالمحترفين', 'مونتاج سريع وموفر', 'كابشن يحول المتابعين'] },
      { m: 'الوحدة ٣: النمو', ls: ['إتقان الهاشتاق', 'استراتيجية الكولاب', 'ستوريز تبني مجتمعاً', 'معادلة الترند'] },
      { m: 'الوحدة ٤: الدخل', ls: ['متى تبدأي مع البراندات', 'تسعير قيمتك', 'مصادر الدخل السلبي', 'تحويل المتابعين لعملاء'] },
      { m: 'الوحدة ٥: التوسع', ls: ['بناء فريق', 'تجميع المحتوى', 'التحليلات: ما يهم', 'ميديا كيت يحصل على نعم'] }
    ]
  },
  products: [
    { e: '📘', n: { en: 'Content Strategy Guide', ar: 'دليل استراتيجية المحتوى' }, ty: { en: 'Digital PDF', ar: 'PDF رقمي' }, price: '$29', sales: 142, c: '#7c6ff7' },
    { e: '🎥', n: { en: 'Video Editing Course', ar: 'كورس المونتاج' }, ty: { en: 'Online Course', ar: 'كورس أونلاين' }, price: '$99', sales: 58, c: '#1ec98e' },
    { e: '👕', n: { en: 'BOOM Hoodie', ar: 'هودي BOOM' }, ty: { en: 'Physical Merch', ar: 'مرش مادي' }, price: '$45', sales: 23, c: '#f0623a' },
    { e: '📱', n: { en: 'Caption Templates', ar: 'قوالب كابشن' }, ty: { en: 'Digital', ar: 'رقمي' }, price: '$19', sales: 89, c: '#e8519a' },
    { e: '🎓', n: { en: '1-on-1 Coaching', ar: 'كوتشينج فردي' }, ty: { en: 'Session', ar: 'جلسة' }, price: '$150', sales: 12, c: '#f5c842' },
    { e: '📊', n: { en: 'Analytics Workbook', ar: 'كتاب التحليلات' }, ty: { en: 'Digital', ar: 'رقمي' }, price: '$25', sales: 67, c: '#534ab7' }
  ],
  affLinks: [
    { n: 'Amazon Storefront', cl: '8.4K', cv: '312', earn: '$280', cvr: '3.7%' },
    { n: 'Sephora Collection', cl: '5.2K', cv: '198', earn: '$176', cvr: '3.8%' },
    { n: 'Nike Store', cl: '4.8K', cv: '156', earn: '$204', cvr: '3.3%' },
    { n: 'iHerb', cl: '3.1K', cv: '94', earn: '$88', cvr: '3.0%' },
    { n: 'SHEIN', cl: '6.9K', cv: '82', earn: '$72', cvr: '1.2%' }
  ],
  affRecs: {
    en: [
      { n: 'LTK (LikeToKnowIt)', why: 'Perfect for fashion. Avg $0.10/click for your niche.', cvr: '4.2%' },
      { n: 'Sephora Affiliate', why: 'Beauty content matches your 63% female demographic.', cvr: '3.8%' },
      { n: 'Amazon Associates', why: 'Broad range + high trust. Great for lifestyle.', cvr: '3.5%' }
    ],
    ar: [
      { n: 'LTK (LikeToKnowIt)', why: 'مثالي للموضة. متوسط $٠.١٠/كليك لنيشك.', cvr: '٤.٢٪' },
      { n: 'أفيليت سيفورا', why: 'محتوى الجمال يتوافق مع جمهورك الأنثوي ٦٣٪.', cvr: '٣.٨٪' },
      { n: 'أمازون أسوشيتس', why: 'نطاق واسع + ثقة عالية. ممتاز للايف ستايل.', cvr: '٣.٥٪' }
    ]
  },
  patTiers: {
    'Fashion & Beauty': {
      en: [
        { t: 'Supporter', p: '$5', b: ['Early access to content', 'Behind-the-scenes photos', 'Monthly lookbook PDF'], m: 48 },
        { t: 'Creator Friend', p: '$15', b: ['All above', 'Weekly style Q&A', 'Product discounts', 'Discord community'], m: 64 },
        { t: 'VIP', p: '$50', b: ['All above', 'Monthly 15-min 1-on-1', 'Name in credits', 'Priority DM response'], m: 15 }
      ],
      ar: [
        { t: 'داعم', p: '$٥', b: ['وصول مبكر للمحتوى', 'صور خلف الكواليس', 'PDF لوك بوك شهري'], m: 48 },
        { t: 'صديق المنشئة', p: '$١٥', b: ['كل ما سبق', 'أسئلة وأجوبة أسبوعية', 'خصومات على المنتجات', 'مجتمع Discord'], m: 64 },
        { t: 'VIP', p: '$٥٠', b: ['كل ما سبق', 'دردشة فردية ١٥ دقيقة', 'اسمك في الكريدت', 'أولوية الرد على DM'], m: 15 }
      ]
    },
    'Fitness & Health': {
      en: [
        { t: 'Warrior', p: '$5', b: ['Weekly workout plan', 'Nutrition tips PDF', 'Progress tracking'], m: 35 },
        { t: 'Athlete', p: '$15', b: ['All above', 'Personalized adjustments', 'Recipe book', 'Private group'], m: 52 },
        { t: 'Coach Access', p: '$50', b: ['All above', 'Monthly check-in call', 'Custom meal plan'], m: 10 }
      ],
      ar: [
        { t: 'المحارب', p: '$٥', b: ['خطة تمرين أسبوعية', 'PDF نصائح التغذية', 'تتبع التقدم'], m: 35 },
        { t: 'الرياضي', p: '$١٥', b: ['كل ما سبق', 'تعديلات شخصية', 'كتاب وصفات', 'مجموعة خاصة'], m: 52 },
        { t: 'وصول المدرب', p: '$٥٠', b: ['كل ما سبق', 'مكالمة شهرية', 'خطة وجبات مخصصة'], m: 10 }
      ]
    },
    'Business & Finance': {
      en: [
        { t: 'Student', p: '$10', b: ['Weekly tips', 'Resource library', 'Case studies'], m: 42 },
        { t: 'Entrepreneur', p: '$25', b: ['All above', 'Monthly strategy session', 'Templates', 'Private community'], m: 31 },
        { t: 'Mentee', p: '$100', b: ['All above', 'Bi-weekly consult', 'Custom review'], m: 8 }
      ],
      ar: [
        { t: 'الطالب', p: '$١٠', b: ['نصائح أسبوعية', 'مكتبة موارد', 'دراسات حالة'], m: 42 },
        { t: 'رائد الأعمال', p: '$٢٥', b: ['كل ما سبق', 'جلسة استراتيجية', 'قوالب', 'مجتمع خاص'], m: 31 },
        { t: 'المتدرب', p: '$١٠٠', b: ['كل ما سبق', 'استشارة أسبوعية', 'مراجعة مخصصة'], m: 8 }
      ]
    },
    'Tech & Education': {
      en: [
        { t: 'Learner', p: '$8', b: ['Weekly tech tips', 'Resource links', 'Q&A access'], m: 55 },
        { t: 'Builder', p: '$20', b: ['All above', 'Monthly live workshop', 'Code templates'], m: 38 },
        { t: 'Pro', p: '$60', b: ['All above', '1-on-1 mentoring', 'Project review'], m: 12 }
      ],
      ar: [
        { t: 'المتعلم', p: '$٨', b: ['نصائح تقنية أسبوعية', 'روابط موارد', 'الوصول للأسئلة والأجوبة'], m: 55 },
        { t: 'المبني', p: '$٢٠', b: ['كل ما سبق', 'ورشة شهرية', 'قوالب كود'], m: 38 },
        { t: 'المحترف', p: '$٦٠', b: ['كل ما سبق', 'إرشاد فردي', 'مراجعة مشروع'], m: 12 }
      ]
    },
    'Food & Lifestyle': {
      en: [
        { t: 'Foodie', p: '$5', b: ['Weekly recipes', 'Shopping lists', 'Cooking tips'], m: 62 },
        { t: 'Chef', p: '$15', b: ['All above', 'Monthly cooking workshop', 'Meal plans'], m: 45 },
        { t: 'Kitchen VIP', p: '$40', b: ['All above', 'Personal recipe requests', 'Nutrition coaching'], m: 18 }
      ],
      ar: [
        { t: 'عاشق الطعام', p: '$٥', b: ['وصفات أسبوعية', 'قوائم تسوق', 'نصائح الطبخ'], m: 62 },
        { t: 'الشيف', p: '$١٥', b: ['كل ما سبق', 'ورشة طبخ شهرية', 'خطط وجبات'], m: 45 },
        { t: 'VIP المطبخ', p: '$٤٠', b: ['كل ما سبق', 'طلبات وصفات شخصية', 'إرشاد تغذية'], m: 18 }
      ]
    }
  },
  leadMagnets: {
    en: [
      { n: 'Content Calendar Template', subs: '+1,240', cvr: '38%', e: '📅' },
      { n: 'Instagram Growth Checklist', subs: '+890', cvr: '29%', e: '✅' },
      { n: 'Caption Swipe File (50)', subs: '+650', cvr: '24%', e: '✍️' }
    ],
    ar: [
      { n: 'قالب تقويم المحتوى', subs: '+١,٢٤٠', cvr: '٣٨٪', e: '📅' },
      { n: 'قائمة نمو انستجرام', subs: '+٨٩٠', cvr: '٢٩٪', e: '✅' },
      { n: 'ملف كابشن (٥٠)', subs: '+٦٥٠', cvr: '٢٤٪', e: '✍️' }
    ]
  },
  emailSeqs: {
    en: [
      { n: 'Welcome Sequence', emails: 5, opens: '58%', s: 'bdg', sl: 'Active' },
      { n: 'Product Launch', emails: 7, opens: '44%', s: 'bdo', sl: 'Draft' },
      { n: 'Re-engagement', emails: 3, opens: '32%', s: 'bdp', sl: 'Active' }
    ],
    ar: [
      { n: 'تسلسل الترحيب', emails: 5, opens: '٥٨٪', s: 'bdg', sl: 'نشط' },
      { n: 'إطلاق منتج', emails: 7, opens: '٤٤٪', s: 'bdo', sl: 'مسودة' },
      { n: 'إعادة التفاعل', emails: 3, opens: '٣٢٪', s: 'bdp', sl: 'نشط' }
    ]
  },
  coachSessions: {
    en: [
      { n: 'Nora Al-Rashidi', ty: '1hr Strategy Session', t: 'Mon 10:00 AM', s: 'bdg', sl: 'Confirmed' },
      { n: 'Ahmed Khalil', ty: '30min Quick Consult', t: 'Tue 3:00 PM', s: 'bdg', sl: 'Confirmed' },
      { n: 'Mona Saber', ty: '1hr Strategy Session', t: 'Thu 2:00 PM', s: 'bdo', sl: 'Pending' }
    ],
    ar: [
      { n: 'نورة الراشدي', ty: 'جلسة استراتيجية ١ ساعة', t: 'الاثنين ١٠:٠٠ ص', s: 'bdg', sl: 'مؤكدة' },
      { n: 'أحمد خليل', ty: 'استشارة سريعة ٣٠ دقيقة', t: 'الثلاثاء ٣:٠٠ م', s: 'bdg', sl: 'مؤكدة' },
      { n: 'منى صابر', ty: 'جلسة استراتيجية ١ ساعة', t: 'الخميس ٢:٠٠ م', s: 'bdo', sl: 'قيد الانتظار' }
    ]
  },
  coachTypes: {
    en: [
      { n: '30-min Quick Consult', p: '$75', b: 24, e: '⚡' },
      { n: '1-hr Strategy Session', p: '$150', b: 18, e: '🎯' },
      { n: '3-Session Bundle', p: '$400', b: 8, e: '🏆' },
      { n: 'Monthly Mentorship', p: '$600/mo', b: 5, e: '👑' }
    ],
    ar: [
      { n: 'استشارة سريعة ٣٠ دقيقة', p: '$٧٥', b: 24, e: '⚡' },
      { n: 'جلسة استراتيجية ١ ساعة', p: '$١٥٠', b: 18, e: '🎯' },
      { n: 'باندل ٣ جلسات', p: '$٤٠٠', b: 8, e: '🏆' },
      { n: 'إرشاد شهري', p: '$٦٠٠/شهر', b: 5, e: '👑' }
    ]
  },
  testimonials: [
    { i: 'N', n: 'Nora Al-Rashidi', tx: { en: 'Sara helped me go from 5K to 40K in 3 months. Game changer!', ar: 'سارة ساعدتني من ٥ آلاف لـ ٤٠ ألف متابع في ٣ أشهر. غيّرت المعادلة!' }, r: 5 },
    { i: 'A', n: 'Ahmed K.', tx: { en: 'Strategy session was worth every penny. Clear, actionable advice.', ar: 'الجلسة كانت تستحق كل قرش. نصائح واضحة وقابلة للتطبيق.' }, r: 5 },
    { i: 'M', n: 'Mona Saber', tx: { en: 'Finally someone who understands the Arab market. Highly recommend!', ar: 'أخيراً شخص يفهم السوق العربي. أوصي به بشدة!' }, r: 5 }
  ],
  merchItems: [
    { e: '👕', n: { en: 'BOOM Logo Hoodie', ar: 'هودي شعار BOOM' }, p: '$45', s: 34, c: '#7c6ff7' },
    { e: '☕', n: { en: 'Morning Chaos Mug', ar: 'كوب الفوضى الصباحية' }, p: '$22', s: 28, c: '#e8519a' },
    { e: '👜', n: { en: 'Creator Tote Bag', ar: 'شنطة المنشئ' }, p: '$30', s: 18, c: '#1ec98e' },
    { e: '📓', n: { en: 'Creator Notebook', ar: 'دفتر المنشئ' }, p: '$25', s: 9, c: '#f5c842' }
  ],
  divBreakdown: {
    en: [
      { l: 'Sponsorships', pct: 65, c: 'var(--a)', note: 'Too high — risk if brands pull back' },
      { l: 'Affiliate', pct: 19, c: 'var(--a2)', note: 'Good passive income stream' },
      { l: 'Products', pct: 10, c: 'var(--a3)', note: 'Growing — needs more focus' },
      { l: 'Coaching', pct: 6, c: 'var(--go)', note: 'High margin, scalable' }
    ],
    ar: [
      { l: 'الإعلانات', pct: 65, c: 'var(--a)', note: 'مرتفع جداً — خطر إذا انسحبت البراندات' },
      { l: 'الأفيليت', pct: 19, c: 'var(--a2)', note: 'مصدر دخل سلبي جيد' },
      { l: 'المنتجات', pct: 10, c: 'var(--a3)', note: 'في نمو — يحتاج تركيزاً أكثر' },
      { l: 'الكوتشينج', pct: 6, c: 'var(--go)', note: 'هامش ربح عالٍ، قابل للتوسع' }
    ]
  },
  divRecs: {
    en: [
      { icon: '📦', t: 'Launch a digital product', d: '10% product income. One $29 PDF = $300–500/month passive.', u: 'High' },
      { icon: '📧', t: 'Build your email list', d: '8,420 subscribers but only $180/mo. Right sequence = 5x this.', u: 'High' },
      { icon: '🏆', t: 'Expand membership tiers', d: '127 members = demand proven. $50 VIP tier = $500/mo.', u: 'Medium' }
    ],
    ar: [
      { icon: '📦', t: 'أطلقي منتجاً رقمياً', d: '١٠٪ دخل المنتجات. ملف PDF واحد بـ ٢٩$ = ٣٠٠–٥٠٠$ شهرياً دخل سلبي.', u: 'عالي' },
      { icon: '📧', t: 'ابني قائمة إيميلك', d: '٨,٤٢٠ مشتركاً لكن الدخل ١٨٠$ فقط. التسلسل الصحيح = ٥ أضعاف.', u: 'عالي' },
      { icon: '🏆', t: 'وسعي تيرات العضوية', d: '١٢٧ عضواً = الطلب مثبت بالفعل. تير VIP بـ ٥٠$ = ٥٠٠$/شهر.', u: 'متوسط' }
    ]
  }
};

export const tvDB = {
  TikTok: {
    en: [
      { t: 'Silent Morning Routine (aesthetic)', v: '8.4M', e: '14.2%', s: 'Birds + ambient', w: 'Silent aesthetic has 3x saves rate' },
      { t: 'What I eat in a day (realistic)', v: '5.1M', e: '11.8%', s: 'Soft lo-fi', w: 'Authenticity trend — real over perfect' },
      { t: 'POV: You just started creator journey', v: '12.3M', e: '18.1%', s: 'Trending instrumental', w: 'POV format has highest share rate now' },
      { t: 'Rate my morning routine', v: '4.7M', e: '9.3%', s: 'Upbeat trending', w: 'Interactive content — audiences love participating' },
      { t: 'Honest day in my life as a creator', v: '6.8M', e: '13.4%', s: 'Trending pop', w: '"Honest" + "creator" trending 400% this week' }
    ],
    ar: [
      { t: 'روتين صباحي صامت (إيستيتك)', v: '٨.٤م', e: '١٤.٢٪', s: 'أصوات طبيعية', w: 'محتوى الإيستيتك الصامت معدل حفظ ٣ أضعاف' },
      { t: 'ماذا آكل في يوم كامل (الحقيقي)', v: '٥.١م', e: '١١.٨٪', s: 'لو-في ناعم', w: 'ترند الأصالة — الواقعي على المثالي' },
      { t: 'POV: بدأت للتو رحلتك كمنشئ', v: '١٢.٣م', e: '١٨.١٪', s: 'موسيقى ترند', w: 'صيغة POV لديها أعلى معدل مشاركة الآن' },
      { t: 'قيّموا روتين صباحي', v: '٤.٧م', e: '٩.٣٪', s: 'موسيقى نشطة', w: 'المحتوى التفاعلي — الجمهور يحب المشاركة' },
      { t: 'يوم صادق في حياتي كمنشئ', v: '٦.٨م', e: '١٣.٤٪', s: 'بوب رائج', w: '"صادق" + "منشئ" ترند ٤٠٠٪ هذا الأسبوع' }
    ]
  },
  'Instagram Reels': {
    en: [
      { t: 'OOTD — casual luxury look', v: '3.2M', e: '8.7%', s: 'Trending fashion audio', w: 'OOTD content up 280% this week' },
      { t: 'Get ready with me (realistic 60s)', v: '5.8M', e: '12.1%', s: 'Trending GRWM audio', w: 'GRWM is the most saved format on Reels' },
      { t: '5 things I stopped doing for my skin', v: '4.4M', e: '10.3%', s: 'Soft aesthetic', w: '"Things I stopped doing" viral this month' },
      { t: 'Morning routine 2025 aesthetic', v: '9.1M', e: '16.2%', s: 'Trending lo-fi', w: 'Morning aesthetic peaks at 7-9 AM posts' }
    ],
    ar: [
      { t: 'أوتفيت اليوم — كاجوال فاخر', v: '٣.٢م', e: '٨.٧٪', s: 'أوديو موضة رائج', w: 'محتوى OOTD ارتفع ٢٨٠٪ هذا الأسبوع' },
      { t: 'استعدي معي (واقعي ٦٠ ثانية)', v: '٥.٨م', e: '١٢.١٪', s: 'أوديو GRWM رائج', w: 'GRWM أكثر صيغة محفوظة على ريلز' },
      { t: '٥ حاجات توقفت عن عملها لبشرتي', v: '٤.٤م', e: '١٠.٣٪', s: 'إيستيتك ناعم', w: 'صيغة "حاجات توقفت" فيروسية هذا الشهر' },
      { t: 'روتين الصباح ٢٠٢٥ إيستيتك', v: '٩.١م', e: '١٦.٢٪', s: 'لو-في رائج', w: 'محتوى الصباح الإيستيتك يذروه ٧–٩ ص' }
    ]
  },
  'YouTube Shorts': {
    en: [
      { t: 'What nobody tells you about growing on YouTube', v: '2.1M', e: '7.4%', s: 'Energetic intro', w: '"Nobody tells you" = high click-through' },
      { t: 'I tried posting every day for 30 days', v: '8.7M', e: '15.3%', s: 'Motivational', w: 'Challenge format with results = viral formula' }
    ],
    ar: [
      { t: 'ما لا يخبرك به أحد عن النمو على يوتيوب', v: '٢.١م', e: '٧.٤٪', s: 'مقدمة نشطة', w: 'صيغة "ما لا يخبرك" معدل نقر عالٍ' },
      { t: 'جربت النشر يومياً لمدة ٣٠ يوم', v: '٨.٧م', e: '١٥.٣٪', s: 'موتيفيشن', w: 'صيغة التحدي مع النتائج = معادلة فيروسية' }
    ]
  }
};

export const soundsDB = {
  en: [
    { n: 'Espresso – Sabrina Carpenter', u: '4.2M', t: 'Fashion/Lifestyle', h: true },
    { n: "APT. – Rose & Bruno Mars", u: '3.8M', t: 'Any niche', h: true },
    { n: 'Birds of a Feather – Billie Eilish', u: '2.9M', t: 'Aesthetic/Personal', h: true },
    { n: 'Good Luck, Babe! – Chappell Roan', u: '1.7M', t: 'Fashion/Lifestyle', h: false },
    { n: 'Calm Lo-fi Aesthetic Beat', u: '890K', t: 'Morning Routine/Study', h: false },
    { n: 'Arabic Viral Sound #342', u: '2.1M', t: 'Arab Content', h: true },
    { n: 'Arabic Trap Instrumental', u: '1.4M', t: 'Arab Motivation', h: false }
  ],
  ar: [
    { n: 'Espresso – Sabrina Carpenter', u: '٤.٢م', t: 'موضة/لايف ستايل', h: true },
    { n: "APT. – Rose & Bruno Mars", u: '٣.٨م', t: 'أي نيش', h: true },
    { n: 'Birds of a Feather – Billie Eilish', u: '٢.٩م', t: 'إيستيتك/شخصي', h: true },
    { n: 'موسيقى لو-في إيستيتك', u: '٨٩٠ألف', t: 'روتين صباحي/دراسة', h: false },
    { n: 'صوت ترند عربي #٣٤٢', u: '٢.١م', t: 'محتوى عربي', h: true },
    { n: 'تراب إنسترومنتال عربي', u: '١.٤م', t: 'موتيفيشن عربي', h: false }
  ]
};

export const DP_WIZARD = {
  steps: {
    en: [
      { lbl: 'Step 1: Your main niche?', opts: [{ e: '👗', l: 'Fashion & Beauty' }, { e: '💪', l: 'Fitness & Health' }, { e: '💼', l: 'Business & Finance' }, { e: '📱', l: 'Tech & Education' }, { e: '🍕', l: 'Food & Cooking' }, { e: '✈️', l: 'Travel & Lifestyle' }] },
      { lbl: 'Step 2: Your main expertise?', opts: [{ e: '📹', l: 'Content Creation' }, { e: '🎯', l: 'Marketing & Growth' }, { e: '💡', l: 'Personal Development' }, { e: '💰', l: 'Making Money Online' }, { e: '📸', l: 'Photography & Video' }, { e: '🧘', l: 'Wellness & Mindset' }] },
      { lbl: 'Step 3: Target audience?', opts: [{ e: '🌱', l: 'Beginners (0-1K)' }, { e: '📈', l: 'Growing (1K-50K)' }, { e: '🌟', l: 'Established (50K+)' }, { e: '🏢', l: 'Businesses & Brands' }, { e: '👩‍🎓', l: 'Students' }, { e: '🌍', l: 'Arab Market' }] },
      { lbl: 'Step 4: Price range?', opts: [{ e: '💧', l: '$9–29 impulse' }, { e: '💎', l: '$29–97 considered' }, { e: '🚀', l: '$97–297 premium' }, { e: '👑', l: '$297+ high ticket' }] },
      { lbl: 'Step 5: Main goal?', opts: [{ e: '💰', l: 'Passive income' }, { e: '📣', l: 'Grow my brand' }, { e: '🤝', l: 'Help my audience' }, { e: '🎓', l: 'Establish authority' }] }
    ],
    ar: [
      { lbl: 'الخطوة ١: نيشك الرئيسي؟', opts: [{ e: '👗', l: 'موضة وجمال' }, { e: '💪', l: 'لياقة وصحة' }, { e: '💼', l: 'أعمال ومال' }, { e: '📱', l: 'تقنية وتعليم' }, { e: '🍕', l: 'طعام وطبخ' }, { e: '✈️', l: 'سفر ولايف ستايل' }] },
      { lbl: 'الخطوة ٢: خبرتك الرئيسية؟', opts: [{ e: '📹', l: 'إنشاء المحتوى' }, { e: '🎯', l: 'التسويق والنمو' }, { e: '💡', l: 'التطوير الشخصي' }, { e: '💰', l: 'الربح من الإنترنت' }, { e: '📸', l: 'التصوير والفيديو' }, { e: '🧘', l: 'الصحة والعقلية' }] },
      { lbl: 'الخطوة ٣: جمهورك المستهدف؟', opts: [{ e: '🌱', l: 'مبتدئون (٠–١ألف)' }, { e: '📈', l: 'في النمو (١–٥٠ألف)' }, { e: '🌟', l: 'راسخ (٥٠ألف+)' }, { e: '🏢', l: 'شركات وبراندات' }, { e: '👩‍🎓', l: 'طلاب' }, { e: '🌍', l: 'السوق العربي' }] },
      { lbl: 'الخطوة ٤: النطاق السعري؟', opts: [{ e: '💧', l: '$٩–٢٩ اندفاعي' }, { e: '💎', l: '$٢٩–٩٧ متأنٍّ' }, { e: '🚀', l: '$٩٧–٢٩٧ بريميوم' }, { e: '👑', l: '$٢٩٧+ تذكرة عالية' }] },
      { lbl: 'الخطوة ٥: هدفك الرئيسي؟', opts: [{ e: '💰', l: 'دخل سلبي' }, { e: '📣', l: 'تنمية براندي' }, { e: '🤝', l: 'مساعدة جمهوري' }, { e: '🎓', l: 'ترسيخ الخبرة' }] }
    ]
  },
  products: {
    'Fashion & Beauty': {
      en: [
        { n: 'Instagram Growth Blueprint', p: '$29', ty: 'PDF Guide', icon: '📘', opp: 'Your audience asks about Instagram growth constantly. Proven PDF that solves their #1 pain point.', challenges: 'Creating compelling visuals and keeping updated with algorithm changes.', revenue: 'Est. $300–800/month on autopilot with proper promotion.', create: '1. Outline 15–20 growth strategies you personally use\n2. Add screenshots of your actual analytics\n3. Include a 30-day action plan\n4. Design in Canva — 20–30 pages\n5. Export as PDF', sell: 'Upload to Gumroad → Share link in bio → Mention 3x/week in Stories → Create a Reel showing results' },
        { n: 'Outfit Styling Formula PDF', p: '$19', ty: 'Style Guide', icon: '👗', opp: 'Followers want to know how you put outfits together. This simple PDF sells on impulse every OOTD.', challenges: 'Making it relatable for different body types and budgets.', revenue: '$200–500/month with consistent promotion.', create: '1. Document your 5 core styling rules\n2. Create capsule wardrobe graphics\n3. Add outfit formula charts\n4. Include shopping links (affiliate opportunity)', sell: 'Promote every OOTD post → Add to bio link → Bundle with another PDF for higher price' },
        { n: 'Content Calendar Template', p: '$19', ty: 'Notion Template', icon: '📅', opp: 'Every creator needs a content calendar. You already use one — just package and sell yours.', challenges: 'Making it customizable for different niches.', revenue: '$400–700/month (repeat purchases + word of mouth).', create: '1. Build in Notion or Google Sheets\n2. Add 30-day + monthly planning sections\n3. Include hashtag banks and caption templates\n4. Record a 5-min tutorial video', sell: 'Duplicate as Notion template → Sell on Gumroad → Promote in Reels showing your organized process' }
      ],
      ar: [
        { n: 'خطة نمو انستجرام', p: '$٢٩', ty: 'دليل PDF', icon: '📘', opp: 'جمهورك يسأل عن النمو على انستجرام باستمرار. هذا PDF جاهز يحل نقطة ألمهم الأولى.', challenges: 'إنشاء محتوى بصري جذاب والتحديث مع تغيرات الخوارزمية.', revenue: 'تقدير $٣٠٠–٨٠٠/شهر بشكل تلقائي مع الترويج الصحيح.', create: '١. حدد ١٥–٢٠ استراتيجية نمو تستخدمها شخصياً\n٢. أضف لقطات من تحليلاتك الحقيقية\n٣. أضف خطة عمل ٣٠ يوم\n٤. صمم في Canva ٢٠–٣٠ صفحة\n٥. صدّر كـ PDF', sell: 'ارفع على Gumroad → شارك الرابط في البيو → اذكره ٣ مرات/أسبوع في الستوريز → اعملي ريل بالنتائج' },
        { n: 'معادلة تنسيق الإطلالات', p: '$١٩', ty: 'دليل ستايل', icon: '👗', opp: 'متابعوك يريدون معرفة كيفية تنسيق إطلالاتك. هذا PDF البسيط يُباع بشكل اندفاعي.', challenges: 'جعله ملائماً لأجسام مختلفة وميزانيات متعددة.', revenue: '$٢٠٠–٥٠٠/شهر مع الترويج المستمر.', create: '١. وثّق ٥ قواعد ستايل أساسية\n٢. اعمل رسوم خزانة ملابس أساسية\n٣. أضف مخططات معادلات الإطلالات\n٤. أضف روابط شراء (فرصة أفيليت)', sell: 'روّج مع كل منشور OOTD → أضف للبيو لينك → اجمعه مع PDF آخر لسعر أعلى' },
        { n: 'قالب تقويم المحتوى', p: '$١٩', ty: 'قالب Notion', icon: '📅', opp: 'كل منشئ يحتاج تقويم محتوى. أنتِ تستخدمين واحداً بالفعل — فقط بيعيه.', challenges: 'جعله قابلاً للتخصيص لنيشات مختلفة.', revenue: '$٤٠٠–٧٠٠/شهر مشتريات متكررة وكلام الفم.', create: '١. ابنيه في Notion أو Google Sheets\n٢. أضيفي أقسام تخطيط ٣٠ يوم وشهري\n٣. أضيفي بنك هاشتاق وقوالب كابشن\n٤. سجّلي فيديو تيوتوريال ٥ دقائق', sell: 'كرّريه كقالب Notion → بيعيه على Gumroad → روّجيه في ريلز تُظهر فيه عمليتك المنظمة' }
      ]
    },
    'Business & Finance': {
      en: [
        { n: '6-Figure Creator Blueprint', p: '$49', ty: 'PDF + Spreadsheet', icon: '💰', opp: 'Business creators have high-value audiences willing to pay premium. This comprehensive guide is exactly what they need.', challenges: 'Making it actionable and not theoretical.', revenue: '$800–2,000/month with email list promotion.', create: '1. Document your income sources with actual numbers\n2. Create monetization timeline template\n3. Add negotiation scripts for brand deals\n4. Include pitch deck template', sell: 'Sell at premium ($49–97) → Promote on LinkedIn + Instagram → Free sample chapter as lead magnet' },
        { n: 'Brand Deal Pitch Templates', p: '$29', ty: 'Template Pack', icon: '📧', opp: 'Every creator struggles with how to pitch brands. Your real templates are invaluable.', challenges: 'Making templates adaptable for different niches.', revenue: '$400–900/month on autopilot.', create: '1. Write 5 pitch templates (cold, warm, follow-up)\n2. Add your negotiation scripts\n3. Include pricing calculator\n4. Add email subject examples', sell: 'Reel showing how you land brand deals → Lead to purchase → Follow-up email sequence' }
      ],
      ar: [
        { n: 'خطة منشئ ٦ أرقام', p: '$٤٩', ty: 'PDF + جدول بيانات', icon: '💰', opp: 'منشئو الأعمال لديهم جمهور عالي القيمة. هذا الدليل الشامل هو بالضبط ما يحتاجونه.', challenges: 'جعله عملياً وليس نظرياً.', revenue: '$٨٠٠–٢,٠٠٠/شهر مع ترويج قائمة الإيميل.', create: '١. وثّق مصادر دخلك بأرقام حقيقية\n٢. اعمل قالب جدول زمني لتحقيق الدخل\n٣. أضف سكريبتات التفاوض\n٤. أضف قالب عرض ترويجي', sell: 'بيع بسعر بريميوم ($٤٩–٩٧) → روّج على LinkedIn → فصل عينة مجاني كمغناطيس جذب' },
        { n: 'قوالب عرض صفقات البراندات', p: '$٢٩', ty: 'حزمة قوالب', icon: '📧', opp: 'كل منشئ يصارع في كيفية تقديم عرض للبراندات. قوالبك الحقيقية لا تقدر بثمن.', challenges: 'جعل القوالب قابلة للتكيف مع نيشات مختلفة.', revenue: '$٤٠٠–٩٠٠/شهر بشكل تلقائي.', create: '١. اكتب ٥ قوالب عرض (بارد، دافئ، متابعة)\n٢. أضف سكريبتات التفاوض\n٣. أضف حاسبة تسعير\n٤. أضف أمثلة عناوين البريد', sell: 'ريل واحد يُظهر كيف تحصل على صفقات → يقود للشراء → تسلسل إيميل للبيع الإضافي' }
      ]
    }
  }
};

export const DP_POPUP_DATA = {
  en: {
    opportunity: 'Your audience is already asking you about this. The demand is proven — you just need to package your knowledge.',
    challenges: 'Key challenges:\n• Creating the initial content (3–10 hours)\n• Marketing consistently (most creators stop too soon)\n• Pricing confidence (charge what it\'s worth!)',
    revenue_note: 'Revenue estimate based on your 284K followers and current 6.8% engagement rate.',
    create_title: 'How to Create & Prepare',
    sell_title: 'How to Sell It',
    boom_tip: 'Use BOOM OS Caption AI to write promotional captions, and the Landing Page Generator to create a sales page in minutes!'
  },
  ar: {
    opportunity: 'جمهورك يسألك عن هذا بالفعل. الطلب مثبت — فقط تحتاج لتعبئة معرفتك.',
    challenges: 'التحديات الرئيسية:\n• إنشاء المحتوى الأولي (٣–١٠ ساعات)\n• التسويق بشكل مستمر (معظم المنشئين يتوقفون مبكراً)\n• ثقة التسعير (اشحن ما تستحق!)',
    revenue_note: 'تقدير الإيرادات مبني على ٢٨٤ ألف متابع ومعدل تفاعل ٦.٨٪ الحالي.',
    create_title: 'كيف تنشئ وتحضر',
    sell_title: 'كيف تبيع',
    boom_tip: 'استخدم BOOM OS Caption AI لكتابة كابشن ترويجي، ومولّد صفحة الهبوط لإنشاء صفحة مبيعات في دقائق!'
  }
};

export const MICRO_NICHES = {
  coaching: ['Business Coaching', 'Life Coaching', 'Career Coaching', 'Relationship Coaching', 'Health Coaching', 'Mindset & Productivity'],
  marketing: ['Social Media Marketing', 'Email Marketing', 'Content Marketing', 'SEO & Blogging', 'Paid Ads Strategy', 'Personal Branding'],
  finance: ['Personal Budgeting', 'Investment Basics', 'Freelancer Finance', 'Business Finance', 'Debt Freedom', 'Passive Income'],
  ai: ['ChatGPT Prompts', 'AI for Business', 'AI Image Prompts', 'AI Writing', 'AI Automation', 'AI Tools Directory'],
  fitness: ['Home Workouts', 'Nutrition Planning', 'Weight Loss', 'Muscle Building', 'Yoga & Wellness', 'Running Plans'],
  content: ['Instagram Growth', 'YouTube Strategy', 'TikTok Content', 'Podcast Launch', 'Newsletter Building', 'Content Calendar'],
  business: ['Freelancing Setup', 'Agency Building', 'SaaS Ideas', 'E-commerce', 'Consulting', 'Online Course Creation'],
  design: ['Canva Templates', 'Brand Identity', 'Social Media Kits', 'Presentation Design', 'Logo Design Pack', 'UX/UI Resources'],
  ucFeatures: {
    en: [
      { icon: '🏗️', t: 'Drag & Drop Builder', d: 'No code needed. Build your entire store, funnel, or landing page visually in minutes.' },
      { icon: '🌐', t: 'Custom Domain', d: 'Connect your own domain (e.g. www.sara.com) easily. Free SSL included.' },
      { icon: '💳', t: 'Payment Processing', d: 'Accept payments in EGP, SAR, AED, USD. Connect Stripe, PayPal, Fawry, and more.' },
      { icon: '📧', t: 'Email Marketing Built-in', d: 'Send newsletters, automation sequences, and cart recovery emails — no extra tools.' },
      { icon: '🎨', t: '100+ Arabic Templates', d: 'Ready-made templates optimized for Arab audience. RTL, Arabic fonts, and local design.' },
      { icon: '📊', t: 'Advanced Analytics', d: 'Track conversions, revenue, visitor behavior. Make data-driven decisions easily.' },
      { icon: '🚀', t: 'Instant Funnel Builder', d: 'Build complete sales funnels (optin → upsell → thank you) in under 10 minutes.' }
    ],
    ar: [
      { icon: '🏗️', t: 'منشئ السحب والإفلات', d: 'بدون كود. ابن متجرك أو فانلك أو صفحتك بصرياً في دقائق.' },
      { icon: '🌐', t: 'دومين مخصص', d: 'اربط دومينك الخاص (مثلاً www.sara.com) بسهولة. SSL مجاني.' },
      { icon: '💳', t: 'معالجة الدفع', d: 'اقبل مدفوعات بالجنيه والريال والدرهم والدولار. اربط Stripe وPayPal وفوري وأكثر.' },
      { icon: '📧', t: 'تسويق البريد الإلكتروني', d: 'أرسل نيوزليتر وتسلسلات أتمتة ورسائل استرداد السلة — بدون أدوات إضافية.' },
      { icon: '🎨', t: 'أكثر من ١٠٠ قالب عربي', d: 'قوالب جاهزة محسّنة للجمهور العربي. RTL وخطوط عربية وتصميم محلي.' },
      { icon: '📊', t: 'تحليلات متقدمة', d: 'تتبع التحويلات والإيرادات وسلوك الزوار. اتخذ قرارات مبنية على البيانات.' },
      { icon: '🚀', t: 'منشئ الفانل الفوري', d: 'ابن فانل مبيعات كامل (اشتراك → بيع إضافي → شكراً) في أقل من ١٠ دقائق.' }
    ]
  },
  ucSteps: {
    en: [
      { n: '1', icon: '📝', t: 'Register on UpClick', d: 'Go to upclick.com → Click "Start Free" → Create your account using email or Google.' },
      { n: '2', icon: '🎨', t: 'Choose Your Template', d: 'Browse 100+ templates → Filter by niche → Select one and customize with your colors, logo, and content.' },
      { n: '3', icon: '📋', t: 'Add Your Landing Page Code', d: 'Go to Funnels → Create New → Select "Custom Page" → Paste the HTML code generated by BOOM OS → Save.' },
      { n: '4', icon: '🌐', t: 'Connect Domain & Go Live', d: 'Go to Settings → Domain → Add your domain → Update DNS records → Wait 24-48 hours → Your page is LIVE!' }
    ],
    ar: [
      { n: '١', icon: '📝', t: 'سجّل في UpClick', d: 'اذهب إلى upclick.com → اضغط "ابدأ مجاناً" → أنشئ حسابك بالإيميل أو Google.' },
      { n: '٢', icon: '🎨', t: 'اختر قالبك', d: 'تصفح أكثر من ١٠٠ قالب → فلتر حسب النيش → اختر واحداً وخصصه بألوانك وشعارك ومحتواك.' },
      { n: '٣', icon: '📋', t: 'أضف كود صفحة الهبوط', d: 'اذهب للفانلات → إنشاء جديد → اختر "صفحة مخصصة" → الصق كود HTML من BOOM OS → احفظ.' },
      { n: '٤', icon: '🌐', t: 'اربط الدومين وابدأ', d: 'اذهب للإعدادات → الدومين → أضف دومينك → حدّث سجلات DNS → انتظر ٢٤–٤٨ ساعة → صفحتك مباشرة!' }
    ]
  }
};

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', flag: '🇰🇼' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', flag: '🇶🇦' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', flag: '🇧🇭' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع', flag: '🇴🇲' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'ج.م', flag: '🇪🇬' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', flag: '🇯🇴' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م', flag: '🇲🇦' },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'دج', flag: '🇩🇿' },
  { code: 'IQD', name: 'Iraqi Dinar', symbol: 'ع.د', flag: '🇮🇶' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', flag: '🇮🇱' }
];

export const GUIDE_FLOWS = {
  add_lead: {
    title: 'Add a New Lead',
    steps: [
      { target: '[onclick*="crm"]', text: 'First, click on Smart CRM in the sidebar', nav: 'crm' },
      { target: '#btn-new-lead, [onclick*="openLeadModal"]', text: 'Click "+ New Lead" to add a lead', highlight: true },
      { target: '#lead-name', text: 'Enter the lead\'s name here', highlight: true },
      { target: '#lead-phone', text: 'Add their phone number', highlight: true },
      { target: '[onclick*="saveLead"]', text: 'Click Save to add the lead!', highlight: true }
    ]
  },
  add_task: {
    title: 'Add a Task',
    steps: [
      { target: '[onclick*="tasks"]', text: 'Click Task Board in the sidebar', nav: 'tasks' },
      { target: '[onclick*="openTaskModal"]', text: 'Click "+ Add Task"', highlight: true },
      { target: '#task-title', text: 'Enter your task title', highlight: true },
      { target: '[onclick*="saveTask"]', text: 'Save the task!', highlight: true }
    ]
  },
  record_income: {
    title: 'Record Income',
    steps: [
      { target: '[onclick*="finance"]', text: 'Go to Finance Dashboard', nav: 'finance' },
      { target: '[onclick*="openFinanceModal.*income"]', text: 'Click "+ Add Income"', highlight: true },
      { target: '#fin-amount', text: 'Enter the amount', highlight: true },
      { target: '#fin-desc', text: 'Add a description', highlight: true },
      { target: '[onclick*="saveFinanceEntry"]', text: 'Save to record it!', highlight: true }
    ]
  },
  setup_telegram: {
    title: 'Setup Telegram Bot',
    steps: [
      { target: '[onclick*="profile"]', text: 'Go to your Profile', nav: 'profile' },
      { target: '#tg-user-id', text: 'Enter your Telegram User ID here (send /start to @userinfobot on Telegram to get it)', highlight: true },
      { target: '#tg-connect-btn', text: 'Click Connect Telegram!', highlight: true }
    ]
  },
  change_currency: {
    title: 'Change Currency',
    steps: [
      { target: '#curr-sel', text: 'Click the currency flag in the top bar', highlight: true },
      { target: '#curr-list', text: 'Search and select your currency', highlight: true }
    ]
  },
  create_content: {
    title: 'Create Content',
    steps: [
      { target: '[onclick*="content"]', text: 'Go to Content Hub', nav: 'content' },
      { target: '.tab-btn', text: 'Choose a content tool from the tabs', highlight: true }
    ]
  }
};
