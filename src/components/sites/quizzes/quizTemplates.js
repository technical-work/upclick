export const QUIZ_TEMPLATES = [
  {
    id: 'tpl_digital_marketing_quiz',
    name: 'Digital Marketing & SEO Mastery Quiz',
    nameAr: 'اختبار احتراف التسويق الرقمي والسيو',
    description: 'Test your knowledge on SEO, PPC, conversion rate optimization, and growth metrics.',
    descriptionAr: 'اختبر معلوماتك في تحسين محركات البحث، الإعلانات الممولة، ومعدلات التحويل.',
    category: 'Marketing',
    categoryAr: 'تسويق',
    icon: '🚀',
    passingScore: 75,
    totalPoints: 100,
    questions: [
      {
        id: 'q1',
        title: 'What does CTR stand for in digital advertising?',
        titleAr: 'ماذا يعني اختصار CTR في الإعلانات الرقمية؟',
        description: 'Select the most accurate industry standard definition.',
        descriptionAr: 'اختر التعريف الأكثر دقة واحترافية.',
        type: 'radio',
        options: [
          'Click-Through Rate',
          'Customer Transition Ratio',
          'Conversion Tracking Return',
          'Cost To Reach'
        ],
        optionsAr: [
          'معدل النقر إلى الظهور (Click-Through Rate)',
          'نسبة انتقال العملاء (Customer Transition Ratio)',
          'عائد تتبع التحويل (Conversion Tracking Return)',
          'تكلفة الوصول للجمهور (Cost To Reach)'
        ],
        correctAnswer: 'Click-Through Rate',
        correctAnswerAr: 'معدل النقر إلى الظهور (Click-Through Rate)',
        points: 20,
        explanation: 'CTR (Click-Through Rate) is the percentage of people who see your ad and click on it. It is calculated as (Clicks / Impressions) * 100.',
        explanationAr: 'معدل النقر إلى الظهور هو النسبة المئوية للمستخدمين الذين يشاهدون الإعلان وينقرون عليه، ويحسب بقسمة النقرات على مرات الظهور ضرب 100.'
      },
      {
        id: 'q2',
        title: 'Which HTTP status code signifies a permanent 301 redirect for SEO?',
        titleAr: 'ما هو رمز استجابة HTTP الذي يدل على إعادة التوجيه الدائم (301 Redirect) للسيو؟',
        type: 'radio',
        options: [
          '301 Moved Permanently',
          '302 Found / Temporary',
          '404 Not Found',
          '500 Internal Server Error'
        ],
        optionsAr: [
          '301 Moved Permanently (نقل دائم)',
          '302 Found / Temporary (نقل مؤقت)',
          '404 Not Found (غير موجود)',
          '500 Internal Server Error (خطأ خادم)'
        ],
        correctAnswer: '301 Moved Permanently',
        correctAnswerAr: '301 Moved Permanently (نقل دائم)',
        points: 20,
        explanation: 'A 301 redirect informs search engine crawlers that the page has permanently moved, passing full link equity (PageRank) to the target URL.',
        explanationAr: 'رمز 301 يخبر عناكب محركات البحث بأن الصفحة انتقلت نهائياً، مما ينقل قوة الرابط والسيو إلى الرابط الجديد.'
      },
      {
        id: 'q3',
        title: 'Which element is most critical for increasing landing page conversion rate (CRO)?',
        titleAr: 'ما هو العنصر الأكثر تأثيراً في رفع معدل تحويل الصفحة الهبوط (CRO)؟',
        type: 'radio',
        options: [
          'A clear, compelling value proposition and strong Call-to-Action (CTA)',
          'Adding 10 different colors to the background',
          'Hiding the pricing and contact form',
          'Writing 5,000 words of unformatted text'
        ],
        optionsAr: [
          'عرض قيمة واضح ومقنع وزر إجراء رئيسي واضح (CTA)',
          'إضافة 10 ألوان مختلفة للخلفية',
          'إخفاء الأسعار ونموذج التواصل',
          'كتابة 5000 كلمة بدون تنسيق'
        ],
        correctAnswer: 'A clear, compelling value proposition and strong Call-to-Action (CTA)',
        correctAnswerAr: 'عرض قيمة واضح ومقنع وزر إجراء رئيسي واضح (CTA)',
        points: 20,
        explanation: 'Clarity and value alignment with a single frictionless Call-to-Action drives the highest conversion lift on modern funnels.',
        explanationAr: 'وضوح القيمة المقدمة وسلاسة زر الإجراء المباشر (CTA) هما العامل الأهم لرفع التحويلات.'
      },
      {
        id: 'q4',
        title: 'What is the primary benefit of Retargeting (Remarketing) campaigns?',
        titleAr: 'ما هي الفائدة الرئيسية لحملات إعادة الاستهداف (Retargeting)؟',
        type: 'radio',
        options: [
          'Engaging warm visitors who already visited your site but did not convert yet',
          'Targeting people who have never heard of your brand',
          'Increasing domain registration costs',
          'Deleting spam emails'
        ],
        optionsAr: [
          'إعادة استهداف الزوار المهتمين الذين تصفحوا موقعك ولم يشتروا بعد',
          'استهداف جمهور لم يسمع بمنتجك إطلاقاً',
          'زيادة تكاليف الدومين',
          'حذف الرسائل المزعجة'
        ],
        correctAnswer: 'Engaging warm visitors who already visited your site but did not convert yet',
        correctAnswerAr: 'إعادة استهداف الزوار المهتمين الذين تصفحوا موقعك ولم يشتروا بعد',
        points: 20,
        explanation: 'Retargeting keeps your brand top of mind for qualified warm leads, significantly reducing Customer Acquisition Cost (CAC).',
        explanationAr: 'إعادة الاستهداف تبقي علامتك حاضرة أمام العملاء المهتمين، وتقلل تكلفة الاستحواذ على العميل CAC بشكل كبير.'
      },
      {
        id: 'q5',
        title: 'In email marketing, what is considered a healthy Open Rate benchmark?',
        titleAr: 'في التسويق بالبريد الإلكتروني، ما هي نسبة الفتح (Open Rate) الجيدة عموماً؟',
        type: 'radio',
        options: [
          '20% - 35%+',
          '0.5% - 1%',
          '99% - 100%',
          '5% only'
        ],
        optionsAr: [
          '20% إلى 35% فأكثر',
          '0.5% إلى 1%',
          '99% إلى 100%',
          '5% فقط'
        ],
        correctAnswer: '20% - 35%+',
        correctAnswerAr: '20% إلى 35% فأكثر',
        points: 20,
        explanation: 'Across industries, an open rate between 20% and 35% indicates high domain reputation, strong subject lines, and active subscribers.',
        explanationAr: 'معدل فتح بين 20% و 35% يعتبر مؤشراً ممتازاً على جودة العناوين وسمعة الدومين وتفاعل المشتركين.'
      }
    ],
    settings: {
      progressBar: true,
      showTimer: true,
      timeLimitMinutes: 10,
      showInstantFeedback: false,
      showExplanationsAtEnd: true,
      allowRetry: true,
      requireLeadCapture: true,
      leadCapturePosition: 'before_results', // 'start' | 'before_results' | 'none'
      buttonColor: '#2563eb',
      backgroundColor: '#0f172a',
      cardBg: '#1e293b',
      textColor: '#ffffff',
      borderRadius: '16px',
      passTitle: '🎉 Congratulations! You Passed with Mastery!',
      passTitleAr: '🎉 تهانينا! لقد اجتزت الاختبار بتفوق!',
      passMessage: 'Your deep marketing and growth knowledge puts you in the top tier of practitioners.',
      passMessageAr: 'مستواك في التسويق والنمو الرقمي متقدم وممتاز.',
      failTitle: 'Nice Effort! You were close!',
      failTitleAr: 'محاولة جيدة! كنت قريباً من النجاح!',
      failMessage: 'You need 75% or higher to pass. Review the correct explanations below and retry.',
      failMessageAr: 'تحتاج إلى 75% أو أكثر للاجتياز. راجع الإجابات الصحيحة والشرح بالأسفل وأعد المحاولة.'
    }
  },
  {
    id: 'tpl_saas_product_quiz',
    name: 'SaaS & Product Strategy Skills Assessment',
    nameAr: 'تقييم مهارات واستراتيجيات البرمجيات والـ SaaS',
    description: 'Assess understanding of MRR, Churn, Product-Led Growth (PLG), and LTV:CAC ratios.',
    descriptionAr: 'قياس الفهم لمقاييس SaaS مثل MRR ونسبة الانسحاب Churn ونمو المنتج PLG.',
    category: 'SaaS',
    categoryAr: 'برمجيات و SaaS',
    icon: '⚡',
    passingScore: 70,
    totalPoints: 100,
    questions: [
      {
        id: 'q1',
        title: 'What does MRR stand for in subscription businesses?',
        titleAr: 'ماذا يعني اختصار MRR في مشاريع الاشتراكات؟',
        type: 'radio',
        options: [
          'Monthly Recurring Revenue',
          'Maximum Reach Ratio',
          'Marketing Return Rate',
          'Minimum Required Resource'
        ],
        optionsAr: [
          'الإيرادات الشهرية المتكررة (Monthly Recurring Revenue)',
          'نسبة الوصول القصوى (Maximum Reach Ratio)',
          'معدل عائد التسويق (Marketing Return Rate)',
          'الموارد الدنيا المطلوبة (Minimum Required Resource)'
        ],
        correctAnswer: 'Monthly Recurring Revenue',
        correctAnswerAr: 'الإيرادات الشهرية المتكررة (Monthly Recurring Revenue)',
        points: 25,
        explanation: 'MRR is the predictable revenue a subscription business can count on receiving every month.',
        explanationAr: 'MRR هو الإيراد الشهري المتكرر والمضمون من اشتراكات العملاء.'
      },
      {
        id: 'q2',
        title: 'What is considered a healthy SaaS LTV to CAC ratio?',
        titleAr: 'ما هي النسبة الصحية بين القيمة الدائمة للعميل وتكلفة الاستحواذ (LTV:CAC)؟',
        type: 'radio',
        options: [
          '3:1 or higher',
          '1:3 (Losing money)',
          '1:1 (Break even)',
          '0.5:1'
        ],
        optionsAr: [
          '3:1 أو أعلى',
          '1:3 (خسارة)',
          '1:1 (تعادل فقط)',
          '0.5:1'
        ],
        correctAnswer: '3:1 or higher',
        correctAnswerAr: '3:1 أو أعلى',
        points: 25,
        explanation: 'A 3:1 LTV:CAC ratio means you generate $3 in customer lifetime value for every $1 spent on sales and marketing.',
        explanationAr: 'نسبة 3:1 تعني أن كل دولار ينفق على التسويق يولد 3 دولارات من قيمة العميل الدائمة.'
      },
      {
        id: 'q3',
        title: 'What is Net Negative Churn (Expansion MRR)?',
        titleAr: 'ما هو الـ Net Negative Churn (التوسع الإيجابي للاشتراكات)؟',
        type: 'radio',
        options: [
          'When revenue expansion from existing customers exceeds lost revenue from cancellations',
          'When all customers cancel their accounts simultaneously',
          'When your server crashes',
          'When marketing budget is zero'
        ],
        optionsAr: [
          'عندما تفوق ترقيات وتوسعات العملاء الحاليين قيمة الاشتراكات الملغاة',
          'عندما يلغي جميع العملاء حساباتهم',
          'عندما يتعطل الخادم',
          'عندما تكون ميزانية التسويق صفر'
        ],
        correctAnswer: 'When revenue expansion from existing customers exceeds lost revenue from cancellations',
        correctAnswerAr: 'عندما تفوق ترقيات وتوسعات العملاء الحاليين قيمة الاشتراكات الملغاة',
        points: 25,
        explanation: 'Net negative churn is the Holy Grail of SaaS, meaning revenue grows naturally even without adding new customers.',
        explanationAr: 'هذا هو المقياس الذهبي في SaaS ويعني أن إيراداتك تنمو تلقائياً من العملاء الحاليين حتى بدون عملاء جدد.'
      },
      {
        id: 'q4',
        title: 'Which strategy best defines Product-Led Growth (PLG)?',
        titleAr: 'ما هو المفهوم الأساسي لنموذج نمو المنتج (Product-Led Growth - PLG)؟',
        type: 'radio',
        options: [
          'Using the product itself (free trial / freemium) as the main driver of acquisition and retention',
          'Relying purely on heavy telemarketing calls',
          'Hiding the software until a 6-month contract is signed',
          'Selling hardware only'
        ],
        optionsAr: [
          'الاعتماد على تجربة المنتج وقيمته المباشرة (Freemium/Free Trial) كمحرك رئيسي لجذب العملاء',
          'الاعتماد فقط على الاتصالات الهاتفية الباردة',
          'إخفاء المنتج حتى توقيع عقد طويل الأجل',
          'بيع أجهزة فقط'
        ],
        correctAnswer: 'Using the product itself (free trial / freemium) as the main driver of acquisition and retention',
        correctAnswerAr: 'الاعتماد على تجربة المنتج وقيمته المباشرة (Freemium/Free Trial) كمحرك رئيسي لجذب العملاء',
        points: 25,
        explanation: 'PLG puts the product at the center of the customer journey, enabling seamless self-serve onboarding.',
        explanationAr: 'نموذج PLG يضع تجربة المستخدم والمنتج في المركز ليقوم العميل بتجربة القيمة فوراً بنفسه.'
      }
    ],
    settings: {
      progressBar: true,
      showTimer: true,
      timeLimitMinutes: 8,
      showInstantFeedback: false,
      showExplanationsAtEnd: true,
      allowRetry: true,
      requireLeadCapture: true,
      leadCapturePosition: 'before_results',
      buttonColor: '#3b82f6',
      backgroundColor: '#090d16',
      cardBg: '#131b2e',
      textColor: '#ffffff',
      borderRadius: '16px',
      passTitle: '🏆 Elite Product Strategist!',
      passTitleAr: '🏆 تهانينا! خبير استراتيجيات منتجات برمجية!',
      passMessage: 'You scored above 70%. You demonstrate an outstanding grasp of modern SaaS metrics.',
      passMessageAr: 'حققت أكثر من 70% وتملك فهماً عميقاً لأهم مقاييس الـ SaaS.',
      failTitle: 'Keep Honing Your Skills!',
      failTitleAr: 'استمر في تطوير مهاراتك!',
      failMessage: 'Review the metrics and insights below, and give it another shot!',
      failMessageAr: 'راجع المقاييس والشروحات بالأسفل وجرّب مرة أخرى!'
    }
  },
  {
    id: 'tpl_fitness_nutrition_quiz',
    name: 'Fitness, Health & Nutrition Knowledge Quiz',
    nameAr: 'اختبار المعرفة باللياقة البدنية والتغذية الصحية',
    description: 'Engage wellness clients with a fun and educational lifestyle & fitness trivia quiz.',
    descriptionAr: 'اختبار تفاعلي وتعليمي لعملاء اللياقة والصحة والتغذية السليمة.',
    category: 'Health & Fitness',
    categoryAr: 'صحة ولياقة',
    icon: '🥗',
    passingScore: 60,
    totalPoints: 100,
    questions: [
      {
        id: 'q1',
        title: 'How many calories are in 1 gram of dietary protein?',
        titleAr: 'كم عدد السعرات الحرارية في غرام واحد من البروتين؟',
        type: 'radio',
        options: ['4 Calories', '9 Calories', '7 Calories', '0 Calories'],
        optionsAr: ['4 سعرات حرارية', '9 سعرات حرارية', '7 سعرات حرارية', '0 سعرة'],
        correctAnswer: '4 Calories',
        correctAnswerAr: '4 سعرات حرارية',
        points: 25,
        explanation: 'Protein and Carbohydrates contain 4 kcal per gram, while Fats contain 9 kcal per gram.',
        explanationAr: 'البروتين والكربوهيدرات يحتويان على 4 سعرات لكل غرام، بينما الدهون تحتوي على 9 سعرات.'
      },
      {
        id: 'q2',
        title: 'What is the recommended minimum daily water intake for general adult health?',
        titleAr: 'ما هو الحد الأدنى اليومي الموصى به لشرب الماء للشخص البالغ؟',
        type: 'radio',
        options: ['2 to 3 Liters (8-12 cups)', '0.5 Liter only', '10 Liters', '1 glass per week'],
        optionsAr: ['2 إلى 3 لتر (8-12 كوب)', 'نصف لتر فقط', '10 لترات', 'كوب واحد أسبوعياً'],
        correctAnswer: '2 to 3 Liters (8-12 cups)',
        correctAnswerAr: '2 إلى 3 لتر (8-12 كوب)',
        points: 25,
        explanation: 'Adequate hydration supports muscle recovery, cognitive focus, digestion, and metabolic health.',
        explanationAr: 'الترطيب الكافي ضروري جداً لصحة العضلات والتركيز والهضم وعمليات الأيض.'
      },
      {
        id: 'q3',
        title: 'Which macronutrient is the primary energy source for high-intensity workouts?',
        titleAr: 'ما هو العنصر الغذائي الرئيسي لتزويد الجسم بالطاقة أثناء التمارين عالية الكثافة؟',
        type: 'radio',
        options: ['Carbohydrates (Glycogen)', 'Fiber only', 'Vitamins', 'Sodium'],
        optionsAr: ['الكربوهيدرات (الجليكوجين)', 'الألياف فقط', 'الفيتامينات', 'الصوديوم'],
        correctAnswer: 'Carbohydrates (Glycogen)',
        correctAnswerAr: 'الكربوهيدرات (الجليكوجين)',
        points: 25,
        explanation: 'Stored muscle and liver glycogen (from carbs) is the fastest fuel source for explosive muscle contraction.',
        explanationAr: 'الجليكوجين المخزن من الكربوهيدرات هو أسرع مصدر طاقة للعضلات أثناء المجهود البدني الشديد.'
      },
      {
        id: 'q4',
        title: 'How many hours of sleep per night are ideal for muscle recovery and hormonal balance?',
        titleAr: 'كم عدد ساعات النوم المثالية ليلاً للاستشفاء العضلي وتوازن الهرمونات؟',
        type: 'radio',
        options: ['7 to 9 Hours', '3 to 4 Hours', '12+ Hours', 'Sleep is not needed'],
        optionsAr: ['7 إلى 9 ساعات', '3 إلى 4 ساعات', 'أكثر من 12 ساعة', 'النوم غير مهم'],
        correctAnswer: '7 to 9 Hours',
        correctAnswerAr: '7 إلى 9 ساعات',
        points: 25,
        explanation: 'Growth hormone release and cellular repair peak during deep stage 3 & REM sleep cycles.',
        explanationAr: 'إفراز هرمون النمو وإصلاح الأنسجة يحدث بنسبة عظمى أثناء مراحل النوم العميق (7-9 ساعات).'
      }
    ],
    settings: {
      progressBar: true,
      showTimer: false,
      showInstantFeedback: false,
      showExplanationsAtEnd: true,
      allowRetry: true,
      requireLeadCapture: true,
      leadCapturePosition: 'before_results',
      buttonColor: '#10b981',
      backgroundColor: '#064e3b',
      cardBg: '#065f46',
      textColor: '#ffffff',
      borderRadius: '16px',
      passTitle: '🌟 Health & Wellness Champion!',
      passTitleAr: '🌟 بطل الصحة واللياقة!',
      passMessage: 'Great job! You have solid foundational knowledge of nutrition and recovery.',
      passMessageAr: 'أداء رائع! لديك معرفة ممتازة بأساسيات التغذية والاستشفاء الصحي.',
      failTitle: 'Good Try! Keep Learning!',
      failTitleAr: 'محاولة جيدة! واصل التعلم!',
      failMessage: 'Check the correct answers below to improve your health insights.',
      failMessageAr: 'راجع الإجابات التوضيحية بالأسفل لتعزيز معلوماتك الصحية.'
    }
  },
  {
    id: 'tpl_lead_readiness_quiz',
    name: 'B2B Client Readiness & Qualification Quiz',
    nameAr: 'اختبار جاهزية وتقييم العملاء المحتملين',
    description: 'Score and qualify inbound prospects based on their budget, stage, and tech maturity.',
    descriptionAr: 'تقييم وتصنيف العملاء المؤهلين تلقائياً بناءً على الميزانية والمرحلة الحالية.',
    category: 'Sales',
    categoryAr: 'مبيعات وتأهيل',
    icon: '🎯',
    passingScore: 60,
    totalPoints: 100,
    questions: [
      {
        id: 'q1',
        title: 'What is your current monthly marketing & advertising budget?',
        titleAr: 'ما هي ميزانيتك الشهرية الحالية للتسويق والإعلانات؟',
        type: 'radio',
        options: [
          '$5,000 to $20,000+ / month',
          '$2,000 to $5,000 / month',
          '$500 to $2,000 / month',
          'Under $500 / month'
        ],
        optionsAr: [
          '5,000$ إلى 20,000$+ شهرياً (مؤهل للنمو السريع)',
          '2,000$ إلى 5,000$ شهرياً',
          '500$ إلى 2,000$ شهرياً',
          'أقل من 500$ شهرياً'
        ],
        correctAnswer: '$5,000 to $20,000+ / month',
        correctAnswerAr: '5,000$ إلى 20,000$+ شهرياً (مؤهل للنمو السريع)',
        points: 30,
        explanation: 'Budgets above $2,000/mo allow for scalable multi-channel growth and rapid testing.',
        explanationAr: 'الميزانيات الأكبر تسمح بإطلاق استراتيجيات نمو متقدمة واختبارات متعددة القنوات.'
      },
      {
        id: 'q2',
        title: 'How soon do you plan to launch or scale your new marketing campaign?',
        titleAr: 'متى تخطط لإطلاق أو توسيع حملتك التسويقية الجديدة؟',
        type: 'radio',
        options: [
          'Immediately within 1 to 2 weeks',
          'Within the next 30 days',
          'In 3 to 6 months',
          'Just exploring ideas'
        ],
        optionsAr: [
          'فوراً خلال أسبوع إلى أسبوعين',
          'خلال 30 يوماً القادمة',
          'خلال 3 إلى 6 أشهر',
          'أستكشف الأفكار فقط حالياً'
        ],
        correctAnswer: 'Immediately within 1 to 2 weeks',
        correctAnswerAr: 'فوراً خلال أسبوع إلى أسبوعين',
        points: 30,
        explanation: 'Immediate intent signals high urgency and prioritized execution.',
        explanationAr: 'النية الفورية تدل على جاهزية عالية للبدء وتحقيق نتائج سريعة.'
      },
      {
        id: 'q3',
        title: 'Do you currently use a CRM or Marketing Automation tool?',
        titleAr: 'هل تستخدم حالياً نظام إدارة علاقات العملاء (CRM) أو أدوات أتمتة؟',
        type: 'radio',
        options: [
          'Yes, actively using CRM and automation',
          'Partially, using spreadsheets and basic tools',
          'No, everything is manual right now'
        ],
        optionsAr: [
          'نعم، نستخدم نظام CRM وأتمتة بشكل نشط',
          'جزئياً، نستخدم جداول Excel وأدوات بسيطة',
          'لا، كل العمليات يدوية حالياً'
        ],
        correctAnswer: 'Yes, actively using CRM and automation',
        correctAnswerAr: 'نعم، نستخدم نظام CRM وأتمتة بشكل نشط',
        points: 40,
        explanation: 'Existing CRM infrastructure speeds up automation onboarding by 3x.',
        explanationAr: 'وجود نظام CRM يسرع إطلاق حملات الأتمتة والنتائج بمعدل 3 أضعاف.'
      }
    ],
    settings: {
      progressBar: true,
      showTimer: false,
      showInstantFeedback: false,
      showExplanationsAtEnd: true,
      allowRetry: true,
      requireLeadCapture: true,
      leadCapturePosition: 'before_results',
      buttonColor: '#f59e0b',
      backgroundColor: '#18181b',
      cardBg: '#27272a',
      textColor: '#ffffff',
      borderRadius: '16px',
      passTitle: '🚀 High-Priority Qualified Lead!',
      passTitleAr: '🚀 عميل عالي الجاهزية والأولوية!',
      passMessage: 'Based on your score, your business is primed for rapid scaling and VIP onboarding.',
      passMessageAr: 'بناءً على نتيجتك، مشروعك مؤهل تماماً للنمو السريع والبدء الفوري.'
    }
  }
];
