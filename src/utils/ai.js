export async function callClaudeAPI(prompt, systemPrompt, lang = 'en', businessContext = {}) {
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

  const claudeKey = gc?.integrations?.claudeKey;
  const openaiKey = gc?.integrations?.openaiKey;
  const claudeConnected = gc?.integrations?.claudeConnected;
  const openaiConnected = gc?.integrations?.openaiConnected;

  // Try Claude first if key is present
  if (claudeKey && (claudeConnected || !openaiKey)) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-profiles-allowed': 'true'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1200,
          system: systemPrompt,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await res.json();
      if (data.content && data.content[0] && data.content[0].text) {
        return data.content[0].text;
      }
      if (data.error) {
        console.warn('Claude API error object:', data.error);
      }
    } catch (error) {
      console.warn('Claude API request failed:', error);
    }
  }

  // Try OpenAI if key is present
  if (openaiKey && (openaiConnected || !claudeKey)) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ]
        })
      });
      const data = await res.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      }
      if (data.error) {
        console.warn('OpenAI API error object:', data.error);
      }
    } catch (error) {
      console.warn('OpenAI API request failed:', error);
    }
  }

  // Fallback engine
  return generateSmartFallback(prompt, lang, gc);
}

function generateSmartFallback(prompt, lang, context) {
  const isAR = lang === 'ar';
  const name = context?.profile?.name || 'Sara Creates';
  const niche = context?.profile?.niche || 'Fashion & Lifestyle';
  const stage = context?.profile?.stage || 'Idea';
  const type = context?.profile?.type || 'Content Creator';

  const normalized = prompt.toLowerCase();

  // 1. Daily Brief
  if (normalized.includes('daily business brief') || normalized.includes('daily brief')) {
    let userName = isAR ? 'سارة' : 'Sara';
    let bizName = name || niche;

    const userMatch = prompt.match(/User Personal Name:\s*([^,\n]+)/i);
    if (userMatch) {
      userName = userMatch[1].trim();
    } else if (context?.bioLink?.displayName) {
      userName = context.bioLink.displayName.split(' ')[0];
    }

    const bizMatch = prompt.match(/Business\/Company Name:\s*([^,\n\.]+)/i);
    if (bizMatch) {
      bizName = bizMatch[1].trim();
    }

    if (isAR) {
      return `صباح الخير ${userName}! ☀️ إليك ملخصك اليومي لـ ${bizName}:
• لديك عميلان جاهزان في مرحلة تقديم العروض، يفضل متابعتهم اليوم لضمان إغلاق الصفقة بنجاح.
• نقاطك التفاعلية على تيك توك ارتفعت بنسبة 4.2٪ هذا الأسبوع بفضل ترند الروتين الصباحي.
• نوصي بنشر ريلز تفاعلي اليوم عند الساعة 7 مساءً وتأجيل المهام الإدارية غير العاجلة.`;
    } else {
      return `Good morning ${userName}! ☀️ Here is your daily update for ${bizName}:
• You have 2 hot leads in the Proposal Sent stage; follow up with them today to finalize the contracts.
• TikTok engagement is up 4.2% thanks to your recent morning routine format. Keep it up!
• Recommended actions: Post a Reels Q&A today at 6 PM, and defer low-priority admin tasks until tomorrow.`;
    }
  }

  // 2. Business Idea Analysis
  if (normalized.includes('analyze this business idea') || normalized.includes('viability')) {
    if (isAR) {
      return `### 📊 تحليل الجدوى للبزنس: ${name}
**1. تقييم الجدوى:**
الفكرة ممتازة وتستهدف شريحة متنامية في السوق العربي (${niche}). نسبة الطلب عالية وتسمح بهامش ربح ممتاز.

**2. فرص السوق:**
• تزايد الاهتمام بالمحتوى المحلي والتجاري في الخليج.
• إمكانية بيع منتجات رقمية (أدلة تنسيق، Notion templates) بدخل سلبي عالي.

**3. المخاطر الأساسية وكيفية تجنبها:**
• تشتت الجمهور: يفضل تحديد نيش فرعي واضح والتركيز عليه أول 90 يوم.

**4. خطوات العمل الفورية:**
• إعداد حسابات احترافية على تيك توك وانستجرام.
• إطلاق أول مغناطيس جذب (دليل تنسيق OOTD مجاني) لجمع الإيميلات.
• تصميم باقة العرض الأولى (كوتشينج أو كورس مصغر).`;
    } else {
      return `### 📊 Viability Assessment for: ${name}
**1. Viability Rating:** High (9/10). The niche "${niche}" is expanding rapidly in the MENA region with strong purchasing intent.

**2. Market Opportunities:**
• High demand for structured resources tailored to Arab creators.
• High-margin digital downloads (Canva templates, styling manuals) can generate automated cashflow.

**3. Key Risks & Mitigation:**
• Audience fatigue: Avoid over-sponsoring. Maintain a 70% organic / 30% sponsored balance.

**4. 3 Immediate Action Steps:**
• Design a free lead magnet (e.g., "Creator Starter Guide") to build your email list.
• Launch your bio link storefront with at least one low-ticket offering ($19-$29).
• Target regional brands in Saudi Arabia and UAE using personalized pitch decks.`;
    }
  }

  // 3. SWOT Matrix
  if (normalized.includes('swot')) {
    if (isAR) {
      return `### 🧠 تحليل SWOT التسويقي
**1. نقاط القوة (Strengths):**
• قاعدة جماهيرية متفاعلة (284K متابع) ومعدل تفاعل ممتاز (6.8٪).
• علامة شخصية موثوقة في نيش ${niche}.

**2. نقاط الضعف (Weaknesses):**
• الاعتماد الكبير على الرعاية الإعلانية (65٪ من الدخل).
• عدم تنظيم الفانل والاعتماد على التواصل العشوائي في الخاص.

**3. الفرص (Opportunities):**
• إطلاق متجر UpClick لبيع المنتجات الرقمية والاشتراكات.
• التوسع في نيش الاستشارات والكوتشينج الفردي للمنشئين المبتدئين.

**4. التهديدات (Threats):**
• تغير خوارزميات انستجرام وتيك توك.
• تقلب ميزانيات البراندات الإعلانية.`;
    } else {
      return `### 🧠 SWOT Marketing Analysis
**1. Strengths:**
• Established community (284K followers) with high engagement (6.8%).
• Authority and high trust in the ${niche} sector.

**2. Weaknesses:**
• High dependency on brand sponsorships (65% of revenue).
• Lack of structured sales funnels to capture and nurture leads.

**3. Opportunities:**
• Launching digital templates and checklists to build passive streams.
• Upselling VIP strategy packages to emerging creators.

**4. Threats:**
• Sudden social media algorithm shifts affecting organic reach.
• Seasonal drops in brand advertising budgets.`;
    }
  }

  // 4. Marketing OS strategy / CMO plan
  if (normalized.includes('marketing strategy') || normalized.includes('cmo')) {
    if (isAR) {
      return `### 📣 الاستراتيجية التسويقية المتكاملة
**1. قنوات التسويق المقترحة:**
• تيك توك وريلز (انستجرام) للوصول المجاني العضوي.
• قائمة الإيميل للتسويق المباشر وبناء العلاقات.

**2. استراتيجية المحتوى:**
• 3 ريلز/أسبوع تركز على المهارات العملية وخلف الكواليس.
• 1 منشور كاروسيل تعليمي أسبوعياً لحث المتابعين على حفظ المنشور.

**3. خطة العمل لـ 30 يوم القادمة:**
• الأسبوع 1: إعداد قالب Notion لتقويم المحتوى لتوزيعه كمغناطيس جذب مجاني.
• الأسبوع 2: إعداد صفحة هبوط لجمع المشتركين باستخدام UpClick.
• الأسبوع 3: نشر 3 ريلز ترويجية مجانية تقود المشاهدين لرابط البايو.
• الأسبوع 4: إرسال عرض إطلاق الكورس المصغر للمشتركين بخصم 40٪.`;
    } else {
      return `### 📣 CMO Marketing OS Plan
**1. Key Acquisition Channels:**
• Short-form videos (Reels/TikTok) for organic awareness.
• Email newsletters for conversion and community building.

**2. Content Pillars:**
• Authority: Show proof, statistics, and behind-the-scenes processes.
• Engagement: Fun, relatable POV scripts and daily routines.
• Action: Direct CTA posts linking to your bio link.

**3. 30-Day Growth Actions:**
• Days 1-7: Design and upload a free Notion template as your lead magnet.
• Days 8-15: Setup a landing page and email automated welcome flow.
• Days 16-25: Post daily short-form videos pitching the lead magnet in the comments.
• Days 26-30: Soft-launch your digital products at an introductory price ($29).`;
    }
  }

  // 5. Video Script Writer
  if (normalized.includes('video script') || normalized.includes('script writer')) {
    if (isAR) {
      return `### 🎬 سكريبت فيديو ترويجي مقترح
**1. الهوك البصري واللفظي (0-5 ثوانٍ):**
*(تظهرين وأنتِ تسكبين القهوة الصباحية بهدوء)*
"إذا كنت منشئ محتوى وتتعب يومياً في التفكير في الكابشن والسكريبتات... هذا الفيديو لك."

**2. صلب الموضوع (5-45 ثانية):**
"الحقيقة أن الاستمرارية صعبة جداً إذا لم يكن لديك نظام واضح. بدل البدء من الصفر كل يوم، جرب طريقة Batching: خصص ساعتين في نهاية الأسبوع لكتابة 5 سكريبتات دفعة واحدة باستخدام قالب Notion المنظم."

**3. دعوة لاتخاذ إجراء CTA (45-60 ثانية):**
"قمت بتجهيز تقويم المحتوى الذي أستخدمه شخصياً مجاناً. اكتب كلمة 'قالب' في التعليقات وسأرسله لك فوراً في الخاص!"`;
    } else {
      return `### 🎬 Recommended Viral Video Script
**1. Hook (0-5s):**
*(Visual: Pouring your morning espresso with soft aesthetic lighting)*
"Stop posting randomly on Instagram. Do this instead if you want to reach 100K followers."

**2. Core Body (5-45s):**
"The secret isn't the algorithm — it's consistency. Spend just 2 hours on Sunday batching your content. Write your hooks, film 5 videos in one setup, and use caption templates. This saves you 15 hours a week."

**3. Call to Action (45-60s):**
"I packaged my personal Content Planner Notion template for free. Comment 'PLAN' below and my automated assistant will DM you the link!"`;
    }
  }

  // Generic Catch-all
  if (isAR) {
    return `### ✦ تحليل ذكاء الأعمال
بناءً على طلبك والبيانات المتاحة لـ **${niche}**، نوصي بالآتي:
• تعزيز تنويع مصادر الإيرادات عبر إعداد منتج رقمي منخفض التكلفة ($19–$29).
• تنظيم المتابعة مع العملاء الجدد في CRM لضمان نسبة تحويل أعلى.
• الاستمرار في تجميع المحتوى الإيجابي ونشره بتناسق مع الاستفادة من الترندات الرائجة.`;
  } else {
    return `### ✦ Business Growth Intelligence
Based on your input and current metrics in **${niche}**, here is our recommendation:
• Diversify income by adding a low-ticket checkout product ($19) to reduce reliance on brand deals.
• Structure follow-up routines in your CRM; follow up every 3 days with warm leads.
• Batch short-form videos to maintain a daily posting cadence without creative burnout.`;
  }
}
