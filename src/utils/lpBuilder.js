'use client';

export function buildFullLP(name, niche, offer, tagline, c, isAR, variant, price = 27) {
  const R = isAR ? 'rtl' : 'ltr';
  const font = isAR ? "'Cairo',sans-serif" : "'Syne','DM Sans',sans-serif";
  const priceStr = '$' + price;
  const offerName = offer.split('—')[0]?.trim() || offer;
  const isDark = variant === 'dark' || variant === 'arabic';
  const bg = isDark ? '#07070e' : '#fff';
  const fg = isDark ? '#f0eeff' : '#0d0d1a';
  const card = isDark ? '#10101a' : '#f7f6ff';
  const border = isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)';
  const sub = isDark ? '#8480a8' : '#5a5880';
  const isCoach =
    niche.toLowerCase().includes('coach') ||
    niche.toLowerCase().includes('كوتش') ||
    niche.toLowerCase().includes('بزنس') ||
    niche.toLowerCase().includes('business');

  // Section helpers
  const S = (id, content, bg2 = '') => `<section id="${id}" style="padding:70px 20px;background:${bg2 || bg}">${content}</section>`;
  const maxW = (content, w = 900) => `<div style="max-width:${w}px;margin:0 auto">${content}</div>`;
  const H = (t, s = '', al = 'center') =>
    `<h2 style="font-size:clamp(26px,4vw,38px);font-weight:800;color:${fg};margin-bottom:${s ? '10px' : '30px'};text-align:${al};line-height:1.15">${t}</h2>${
      s ? `<p style="font-size:17px;color:${sub};text-align:${al};margin-bottom:30px">${s}</p>` : ''
    }`;
  const btn = (t, big = false) =>
    `<button onclick="document.getElementById('offer').scrollIntoView({behavior:'smooth'})" style="background:${c};color:#fff;border:none;padding:${
      big ? '18px 48px' : '14px 36px'
    };border-radius:12px;font-size:${big ? '19px' : '16px'};font-weight:700;cursor:pointer;font-family:inherit;transition:transform .2s,opacity .2s" onmouseover="this.style.opacity='.88';this.style.transform='translateY(-2px)'" onmouseout="this.style.opacity='1';this.style.transform='none'">${t}</button>`;
  const tag = (t) =>
    `<span style="display:inline-block;background:${c}22;color:${c};border:1px solid ${c}44;border-radius:20px;padding:6px 18px;font-size:13px;font-weight:600;margin-bottom:18px">${t}</span>`;

  // ── SECTION 1: HERO ──
  const heroGrad =
    variant === 'gradient'
      ? `linear-gradient(135deg,${c}44,${c}11 60%,${bg} 100%)`
      : variant === 'dark' || variant === 'arabic'
      ? `linear-gradient(160deg,#0a0a15 0%,${c}22 50%,#0a0a15 100%)`
      : variant === 'clean'
      ? bg
      : `linear-gradient(160deg,${bg} 0%,${c}11 100%)`;

  const sec1 = S(
    'hero',
    maxW(
      `<div style="text-align:center;padding:40px 0 20px">
    ${tag(isCoach ? (isAR ? '✨ مدرب معتمد' : '✨ Certified Coach') : isAR ? '✨ منشئ محتوى' : '✨ Content Creator')}
    <h1 style="font-size:clamp(32px,5vw,58px);font-weight:800;line-height:1.1;margin-bottom:18px;${
      variant !== 'clean'
        ? `background:linear-gradient(135deg,${fg} 30%,${c});-webkit-background-clip:text;-webkit-text-fill-color:transparent`
        : `color:${fg}`
    }">${name} — ${tagline}</h1>
    <p style="font-size:19px;color:${sub};max-width:640px;margin:0 auto 28px;line-height:1.6">${
        isAR ? `اكتسب مهاراتك في ${niche} وابدأ نجاحك الحقيقي` : `Master ${niche} and start your real success journey`
      }</p>
    <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:14px">
      ${btn(isAR ? `🚀 ابدأ الآن — ${priceStr}` : `🚀 Start Now — ${priceStr}`, true)}
      <button onclick="document.getElementById('features').scrollIntoView({behavior:'smooth'})" style="background:transparent;color:${c};border:2px solid ${c};padding:16px 32px;border-radius:12px;font-size:17px;font-weight:700;cursor:pointer;font-family:inherit">${
        isAR ? 'اعرف أكثر ▼' : 'Learn More ▼'
      }</button>
    </div>
    <div style="font-size:13px;color:${sub}">✅ ${isAR ? 'ضمان استرداد ٣٠ يوم · بدون مخاطرة' : '30-day money back guarantee · No risk'}</div>
  </div>`,
      1000
    ),
    heroGrad
  );

  // ── SECTION 2: SOCIAL PROOF NUMBERS ──
  const proofItems = isCoach
    ? isAR
      ? [
          { n: '٥٠٠+', l: 'عميل تم تدريبه' },
          { n: '٩٨٪', l: 'معدل رضا العملاء' },
          { n: '١٠+', l: 'سنوات خبرة' },
          { n: '٢٠+', l: 'دولة حول العالم' }
        ]
      : [
          { n: '500+', l: 'Clients Coached' },
          { n: '98%', l: 'Satisfaction Rate' },
          { n: '10+', l: 'Years Experience' },
          { n: '20+', l: 'Countries' }
        ]
    : isAR
    ? [
        { n: '٢٨٤ألف', l: 'متابع نشط' },
        { n: '٦.٨٪', l: 'معدل تفاعل' },
        { n: '٥٠٠+', l: 'طالب سعيد' },
        { n: '٣+', l: 'سنوات في المجال' }
      ]
    : [
        { n: '284K', l: 'Active Followers' },
        { n: '6.8%', l: 'Engagement Rate' },
        { n: '500+', l: 'Happy Students' },
        { n: '3+', l: 'Years in the Field' }
      ];

  const sec2 = S(
    'proof',
    maxW(
      `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;text-align:center">${proofItems
        .map(
          (p) =>
            `<div style="padding:24px 10px;background:${c}11;border-radius:16px;border:1px solid ${c}22"><div style="font-size:clamp(28px,3vw,40px);font-weight:800;color:${c};margin-bottom:6px">${p.n}</div><div style="font-size:13px;color:${sub}">${p.l}</div></div>`
        )
        .join('')}</div>`
    ),
    c + '11'
  );

  // ── SECTION 3: ABOUT / WHO AM I ──
  const sec3 = S(
    'about',
    maxW(`<div style="display:grid;grid-template-columns:1fr 1.5fr;gap:40px;align-items:center">
    <div style="text-align:center">
      <div style="width:200px;height:200px;border-radius:50%;background:linear-gradient(135deg,${c},${c}88);display:flex;align-items:center;justify-content:center;font-size:70px;font-weight:800;color:#fff;margin:0 auto;box-shadow:0 20px 60px ${c}44">${name[0]}</div>
      <div style="margin-top:14px;font-size:18px;font-weight:700;color:${fg}">${name}</div>
      <div style="font-size:13px;color:${sub}">${niche}</div>
    </div>
    <div>
      ${H(isAR ? `من أنا؟` : `About Me`, '', R === 'rtl' ? 'right' : 'left')}
      <p style="font-size:15px;color:${sub};line-height:1.8;margin-bottom:16px">${
        isAR
          ? `أنا ${name}، ${isCoach ? 'مدرب معتمد' : 'منشئ محتوى'} في مجال ${niche} منذ أكثر من ٣ سنوات. ساعدت أكثر من ٥٠٠ شخص على ${
              isCoach ? 'تحقيق أهدافهم المهنية' : 'بناء حضورهم الرقمي والنمو على السوشيال ميديا'
            }.`
          : `I'm ${name}, a ${isCoach ? 'certified coach' : 'content creator'} in ${niche} for over 3 years. I've helped 500+ people ${
              isCoach ? 'achieve their professional goals' : 'build their digital presence and grow on social media'
            }.`
      }</p>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${(isAR
          ? ['✅ خبرة ٣+ سنوات في المجال', '✅ ٥٠٠+ قصة نجاح موثّقة', '✅ محتوى مخصص للسوق العربي', '✅ دعم مستمر بعد الانضمام']
          : ['✅ 3+ years of proven experience', '✅ 500+ documented success stories', '✅ Tailored for Arab market', '✅ Ongoing support after joining']
        )
          .map((p) => `<div style="font-size:14px;color:${fg}">${p}</div>`)
          .join('')}
      </div>
    </div>
  </div>`)
  );

  // ── SECTION 4: FEATURES / WHAT YOU GET ──
  const featItems = isCoach
    ? isAR
      ? [
          { icon: '🎯', t: 'خطة شخصية مخصصة', d: 'خطة عمل مصممة خصيصاً لأهدافك وظروفك' },
          { icon: '📞', t: 'جلسات فردية أسبوعية', d: 'لقاءات منتظمة لمتابعة تقدمك وحل التحديات' },
          { icon: '📚', t: 'موارد حصرية', d: 'مكتبة شاملة من القوالب والأدوات والمواد' },
          { icon: '👥', t: 'مجتمع داعم', d: 'انضم لمجموعة من المتحمسين يشجعونك للأمام' },
          { icon: '📊', t: 'قياس النتائج', d: 'متابعة دقيقة للتقدم مع تعديلات مستمرة' },
          { icon: '🏆', t: 'شهادة معتمدة', d: 'احصل على شهادة إتمام معترف بها' }
        ]
      : [
          { icon: '🎯', t: 'Personalized Action Plan', d: 'A roadmap designed specifically for your goals' },
          { icon: '📞', t: 'Weekly 1-on-1 Sessions', d: 'Regular meetings to track progress and solve challenges' },
          { icon: '📚', t: 'Exclusive Resources', d: 'Full library of templates, tools, and materials' },
          { icon: '👥', t: 'Supportive Community', d: 'Join a group of motivated peers cheering you on' },
          { icon: '📊', t: 'Results Tracking', d: 'Precise progress monitoring with ongoing adjustments' },
          { icon: '🏆', t: 'Certified Achievement', d: 'Get a recognized completion certificate' }
        ]
    : isAR
    ? [
        { icon: '📱', t: 'إنشاء المحتوى', d: 'ريلز وكاروسيل وستوريز تجذب الجمهور الحقيقي' },
        { icon: '📈', t: 'استراتيجيات النمو', d: 'هاشتاق وكولاب وتوقيت مثالي للوصول الأقصى' },
        { icon: '💰', t: 'تحقيق الدخل', d: '٧+ مصادر دخل من محتواك وجمهورك' },
        { icon: '🤝', t: 'صفقات البراندات', d: 'كيف تجد البراندات وتفاوض وتوقع عقوداً مربحة' },
        { icon: '🎯', t: 'بناء البراند الشخصي', d: 'قصتك، هويتك، وكيف تتميز في السوق العربي' },
        { icon: '🌟', t: 'السوق العربي', d: 'استراتيجيات مخصصة لجمهور الخليج ومصر والشام' }
      ]
    : [
        { icon: '📱', t: 'Content Creation', d: 'Reels, carousels & stories that attract real audiences' },
        { icon: '📈', t: 'Growth Strategies', d: 'Hashtags, collabs & optimal timing for max reach' },
        { icon: '💰', t: 'Monetization', d: '7+ income streams from your content and audience' },
        { icon: '🤝', t: 'Brand Deals', d: 'How to find brands, negotiate, and sign profitable contracts' },
        { icon: '🎯', t: 'Personal Branding', d: 'Your story, identity, and how to stand out in Arab market' },
        { icon: '🌟', t: 'Arab Market Focus', d: 'Strategies tailored for Gulf, Egypt & Levant audiences' }
      ];

  const sec4 = S(
    'features',
    maxW(`${H(isAR ? `ماذا ستحصل عليه؟` : `What You Get`, isAR ? `كل ما تحتاجه لتحقيق النجاح في ${niche}` : `Everything you need to succeed in ${niche}`)}
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">${featItems
      .map(
        (f) =>
          `<div style="background:${card};border:1px solid ${border};border-radius:16px;padding:24px;transition:transform .2s,border-color .2s" onmouseover="this.style.transform='translateY(-4px)';this.style.borderColor='${c}'" onmouseout="this.style.transform='none';this.style.borderColor='${border}'"><div style="font-size:36px;margin-bottom:12px">${f.icon}</div><div style="font-size:16px;font-weight:700;color:${fg};margin-bottom:8px">${f.t}</div><div style="font-size:13px;color:${sub};line-height:1.6">${f.d}</div></div>`
      )
      .join('')}</div>`)
  );

  // ── SECTION 5: TESTIMONIALS ──
  const tesItems = isAR
    ? [
        { i: 'ن', n: 'نورة الراشدي', loc: 'السعودية', stars: 5, tx: isCoach ? 'الكوتشينج مع ' + name + ' غيّر مسار حياتي المهنية كلياً. ساعدني أحقق أهدافاً كنت أظنها مستحيلة.' : 'نمت من ٥ آلاف إلى ٤٠ ألف متابع في ٣ أشهر. المحتوى بالعربي أخيراً يعطي نتائج!' },
        { i: 'أ', n: 'أحمد خليل', loc: 'مصر', stars: 5, tx: isCoach ? 'الخطة الشخصية والمتابعة الأسبوعية كانت بالضبط ما احتجته. نتائج حقيقية وملموسة.' : 'بدأت أكسب من محتواي في أول ٦٠ يوم. أفضل استثمار في حياتي.' },
        { i: 'م', n: 'منى صابر', loc: 'الإمارات', stars: 5, tx: isCoach ? 'أخيراً مدرب يفهم السوق العربي وتحدياته الفعلية. أنصح به بشدة.' : 'الكورس يفهم السوق العربي بشكل حقيقي. محتوى عملي وقابل للتطبيق فوراً.' }
      ]
    : [
        { i: 'N', n: 'Nora Al-Rashidi', loc: 'Saudi Arabia', stars: 5, tx: isCoach ? 'Coaching with ' + name + ' completely changed my professional path. Helped me achieve goals I thought were impossible.' : 'Grew from 5K to 40K followers in 3 months. Arabic content finally works!' },
        { i: 'A', n: 'Ahmed K.', loc: 'Egypt', stars: 5, tx: isCoach ? 'The personal plan and weekly follow-ups were exactly what I needed. Real, tangible results.' : 'Started earning from my content in the first 60 days. Best investment of my life.' },
        { i: 'M', n: 'Mona Saber', loc: 'UAE', stars: 5, tx: isCoach ? 'Finally a coach who truly understands the Arab market. Highly recommend.' : 'The course truly understands the Arab market. Practical and instantly applicable.' }
      ];

  const sec5 = S(
    'testimonials',
    maxW(`${H(isAR ? 'ماذا يقول عملائي' : 'What My Clients Say', isAR ? 'نتائج حقيقية من أشخاص حقيقيين' : 'Real results from real people')}
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">${tesItems
      .map(
        (t) =>
          `<div style="background:${card};border:1px solid ${border};border-radius:16px;padding:24px"><div style="font-size:20px;color:${c};margin-bottom:10px">${'⭐'.repeat(
            t.stars
          )}</div><p style="font-size:14px;color:${sub};line-height:1.7;margin-bottom:14px;font-style:italic">"${
            t.tx
          }"</p><div style="display:flex;align-items:center;gap:9px"><div style="width:36px;height:36px;border-radius:50%;background:${c};display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:14px">${
            t.i
          }</div><div><div style="font-size:13px;font-weight:600;color:${fg}">${t.n}</div><div style="font-size:11px;color:${sub}">${
            t.loc
          }</div></div></div></div>`
      )
      .join('')}</div>`),
    isDark ? bg + ' ' : c + '08'
  );

  // ── SECTION 6: PRICING / OFFER ──
  const plans = isCoach
    ? isAR
      ? [
          { n: 'ستارتر', p: '$' + Math.round(parseInt(price) * 0.5), b: ['٣ جلسات فردية', 'خطة عمل شخصية', 'موارد حصرية'], popular: false },
          { n: 'المتميز', p: priceStr, b: ['كل ما في ستارتر', '٦ جلسات فردية', 'دعم واتساب ٣٠ يوم', 'ضمان استرداد'], popular: true },
          { n: 'VIP', p: '$' + Math.round(parseInt(price) * 2), b: ['كل شيء', 'دعم غير محدود ٣ شهور', 'ضمان النتائج'], popular: false }
        ]
      : [
          { n: 'Starter', p: '$' + Math.round(parseInt(price) * 0.5), b: ['3 private sessions', 'Personal action plan', 'Exclusive resources'], popular: false },
          { n: 'Premium', p: priceStr, b: ['Everything in Starter', '6 private sessions', 'WhatsApp support 30 days', 'Money-back guarantee'], popular: true },
          { n: 'VIP', p: '$' + Math.round(parseInt(price) * 2), b: ['Everything', 'Unlimited support 3 months', 'Results guarantee'], popular: false }
        ]
    : isAR
    ? [
        { n: 'أساسي', p: '$' + Math.round(parseInt(price) * 0.6), b: ['وصول للمحتوى', 'مجتمع المنشئين', 'تحديثات لمدة سنة'], popular: false },
        { n: 'المتميز', p: priceStr, b: ['كل ما في الأساسي', 'جلسة إرشاد فردية', 'دعم مستمر ٣٠ يوم'], popular: true },
        { n: 'VIP', p: '$' + Math.round(parseInt(price) * 1.8), b: ['كل شيء', 'مراجعة حساباتك الشخصية', 'مكالمة شهرية لمدة ٣ شهور'], popular: false }
      ]
    : [
        { n: 'Basic', p: '$' + Math.round(parseInt(price) * 0.6), b: ['Content access', 'Creator community', '1-year updates'], popular: false },
        { n: 'Premium', p: priceStr, b: ['Everything in Basic', '1-on-1 coaching session', '30-day ongoing support'], popular: true },
        { n: 'VIP', p: '$' + Math.round(parseInt(price) * 1.8), b: ['Everything', 'Personal account review', 'Monthly call for 3 months'], popular: false }
      ];

  const sec6 = S(
    'offer',
    maxW(`${H(isAR ? 'اختر خطتك' : 'Choose Your Plan', isAR ? 'استثمار في نفسك يدوم مدى الحياة' : 'An investment in yourself that lasts a lifetime')}
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">${plans
      .map(
        (p) =>
          `<div style="background:${p.popular ? c : card};border:2px solid ${p.popular ? c : border};border-radius:16px;padding:28px;text-align:center;position:relative;${
            p.popular ? 'transform:scale(1.04)' : ''
          }">${
            p.popular
              ? `<div style="position:absolute;top:-13px;${
                  R === 'rtl' ? 'right' : 'left'
                }:50%;transform:translateX(${R === 'rtl' ? '50%' : '-50%'});background:${c};color:#fff;padding:4px 16px;border-radius:12px;font-size:12px;font-weight:700">${
                  isAR ? '🌟 الأشهر' : '🌟 Most Popular'
                }</div>`
              : ''
          }<div style="font-size:17px;font-weight:700;color:${p.popular ? '#fff' : fg};margin-bottom:10px">${p.n}</div><div style="font-size:38px;font-weight:800;color:${
            p.popular ? '#fff' : c
          };margin-bottom:16px">${p.p}</div>${p.b
            .map(
              (b) =>
                `<div style="font-size:13px;color:${p.popular ? 'rgba(255,255,255,.85)' : sub};padding:5px 0;border-bottom:1px solid ${
                  p.popular ? 'rgba(255,255,255,.15)' : border
                }">✓ ${b}</div>`
            )
            .join('')}<button onclick="alert('${
            isAR ? 'شكراً! سيتم التواصل معك قريباً.' : 'Thank you! We will contact you soon.'
          }')" style="margin-top:16px;background:${p.popular ? '#fff' : c};color:${p.popular ? c : '#fff'};border:none;padding:12px 28px;border-radius:9px;font-size:14px;font-weight:700;cursor:pointer;width:100%;font-family:inherit">${
            isAR ? 'ابدأ الآن' : 'Start Now'
          }</button></div>`
      )
      .join('')}</div>`),
    c + '08'
  );

  // ── SECTION 7: VIDEO SECTION ──
  const sec7 = S(
    'video',
    maxW(`<div style="text-align:center">${H(isAR ? 'شاهد كيف يبدو البرنامج' : 'See What the Program Looks Like', isAR ? 'نظرة سريعة على ما ستتعلمه' : 'A quick look at what you\'ll learn')}
    <div style="background:${card};border:1px solid ${border};border-radius:20px;padding:50px 30px;max-width:680px;margin:0 auto;cursor:pointer;transition:transform .2s" onmouseover="this.style.transform='scale(1.01)'" onmouseout="this.style.transform='none'" onclick="alert('${
      isAR ? 'الفيديو التعريفي قريباً! تواصل معنا للمزيد.' : 'Intro video coming soon! Contact us for more details.'
    }')">
      <div style="width:80px;height:80px;border-radius:50%;background:${c};display:flex;align-items:center;justify-content:center;font-size:34px;margin:0 auto 18px;box-shadow:0 12px 40px ${c}55">▶</div>
      <div style="font-size:19px;font-weight:700;color:${fg};margin-bottom:8px">${isAR ? `شاهد الفيديو التعريفي لـ ${name}` : `Watch ${name}'s Intro Video`}</div>
      <div style="font-size:14px;color:${sub}">${isAR ? '٢:٤٥ دقيقة — مجاناً' : '2:45 minutes — Free'}</div>
    </div>
    <div style="display:flex;justify-content:center;gap:24px;margin-top:28px;flex-wrap:wrap">${(isAR
      ? ['📱 متاح على كل الأجهزة', '🌐 عربي + إنجليزي', '⚡ بدء فوري بعد الدفع']
      : ['📱 All devices supported', '🌐 Arabic + English', '⚡ Instant access after payment']
    )
      .map((f) => `<div style="font-size:13px;color:${sub}">${f}</div>`)
      .join('')}</div>
  </div>`)
  );

  // ── SECTION 8: FAQ + FINAL CTA ──
  const faqItems = isAR
    ? [
        { q: 'هل هذا البرنامج مناسب للمبتدئين تماماً؟', a: 'نعم! صُمم من الصفر للمبتدئين وحتى المتقدمين. لا تحتاج أي خبرة مسبقة.' },
        { q: 'كم من الوقت أحتاج يومياً؟', a: `${isCoach ? 'ساعة إلى ساعتين أسبوعياً للجلسات + وقت للتطبيق.' : '٣٠ دقيقة إلى ساعة يومياً كافية للتطبيق والنتائج.'}` },
        { q: 'هل يوجد ضمان استرداد؟', a: `نعم! ضمان استرداد كامل خلال ٣٠ يوم إذا لم تكن راضياً ١٠٠٪.` },
        { q: 'هل المحتوى مناسب للسوق العربي؟', a: `نعم تماماً! كل المحتوى مصمم خصيصاً للجمهور العربي في الخليج ومصر والشام.` }
      ]
    : [
        { q: 'Is this program suitable for complete beginners?', a: 'Yes! Designed from scratch for beginners to advanced. No prior experience needed.' },
        { q: 'How much time do I need daily?', a: `${isCoach ? '1-2 hours weekly for sessions + application time.' : '30 minutes to 1 hour daily is enough for application and results.'}` },
        { q: 'Is there a money-back guarantee?', a: `Yes! Full money-back guarantee within 30 days if you're not 100% satisfied.` },
        { q: 'Is the content suitable for the Arab market?', a: `Absolutely! All content is designed specifically for Arab audiences in the Gulf, Egypt, and Levant.` }
      ];

  const sec8 = S(
    'faq-cta',
    maxW(`<div style="display:grid;grid-template-columns:1fr 1fr;gap:40px">
    <div>
      ${H(isAR ? 'أسئلة شائعة' : 'FAQ', '', R === 'rtl' ? 'right' : 'left')}
      ${faqItems
        .map(
          (f) =>
            `<details style="border-bottom:1px solid ${border};padding:16px 0;cursor:pointer"><summary style="font-size:15px;font-weight:600;color:${fg};list-style:none;display:flex;justify-content:space-between">${
              f.q
            }<span style="color:${c}">+</span></summary><p style="font-size:14px;color:${sub};line-height:1.7;margin-top:10px">${
              f.a
            }</p></details>`
        )
        .join('')}
    </div>
    <div style="background:linear-gradient(135deg,${c}22,${c}44);border-radius:20px;padding:36px;text-align:center;align-self:start">
      <div style="font-size:40px;margin-bottom:12px">🚀</div>
      <div style="font-size:24px;font-weight:800;color:${fg};margin-bottom:10px">${isAR ? 'ابدأ رحلتك اليوم' : 'Start Your Journey Today'}</div>
      <div style="font-size:14px;color:${sub};margin-bottom:18px">${isAR ? `انضم لأكثر من ٥٠٠ شخص نجحوا مع ${name}` : `Join 500+ people who succeeded with ${name}`}</div>
      <div style="font-size:42px;font-weight:800;color:${c};margin-bottom:6px">${priceStr}</div>
      <div style="font-size:13px;color:${sub};text-decoration:line-through;margin-bottom:16px">${
        isAR ? 'القيمة الأصلية: $' + Math.round(parseInt(price) * 2.5) : 'Original value: $' + Math.round(parseInt(price) * 2.5)
      }</div>
      ${btn(isAR ? '🎯 انضم الآن' : '🎯 Join Now', true)}
      <div style="font-size:12px;color:${sub};margin-top:10px">✅ ${isAR ? 'ضمان استرداد ٣٠ يوم' : '30-day money back guarantee'}</div>
    </div>
  </div>`)
  );

  const navLinks = isAR ? ['الرئيسية', 'عني', 'البرنامج', 'آراء العملاء', 'الأسعار', 'تواصل'] : ['Home', 'About', 'Program', 'Testimonials', 'Pricing', 'Contact'];
  const navIds = ['hero', 'about', 'features', 'testimonials', 'offer', 'faq-cta'];

  return `<!DOCTYPE html><html lang="${isAR ? 'ar' : 'en'}" dir="${R}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${name} — ${offerName}</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&family=Noto+Kufi+Arabic:wght@400;600;700&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:${font};background:${bg};color:${fg};direction:${R}}nav{position:sticky;top:0;z-index:999;background:${bg}ee;backdrop-filter:blur(12px);padding:14px 24px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid ${border}}nav .logo{font-size:18px;font-weight:800;color:${c}}nav ul{display:flex;gap:20px;list-style:none}nav ul li a{font-size:13px;color:${sub};text-decoration:none;font-weight:500;transition:color .2s}nav ul li a:hover{color:${c}}@media(max-width:768px){nav ul{display:none}section[style*="grid-template-columns:repeat(3"]{grid-template-columns:1fr!important}section[style*="grid-template-columns:1fr 1fr"]{grid-template-columns:1fr!important}section[style*="grid-template-columns:1fr 1.5fr"]{grid-template-columns:1fr!important}section[style*="grid-template-columns:repeat(4"]{grid-template-columns:repeat(2,1fr)!important}}</style>
</head><body>
<nav><div class="logo">${name}</div><ul>${navLinks.map((l, i) => `<li><a href="#${navIds[i]}">${l}</a></li>`).join('')}</ul><button onclick="document.getElementById('offer').scrollIntoView({behavior:'smooth'})" style="background:${c};color:#fff;border:none;padding:9px 20px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">${
    isAR ? 'ابدأ الآن' : 'Start Now'
  }</button></nav>
${sec1}${sec2}${sec3}${sec4}${sec5}${sec6}${sec7}${sec8}
<footer style="background:${card};padding:30px 20px;text-align:center;border-top:1px solid ${border}"><div style="font-size:15px;font-weight:700;color:${fg};margin-bottom:6px">${name}</div><div style="font-size:12px;color:${sub}">${niche} ${
    isAR ? 'منشئ محتوى' : 'Creator'
  } · © 2025 ${name}. ${isAR ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</div></footer>
</body></html>`;
}
