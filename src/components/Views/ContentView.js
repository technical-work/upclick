'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { DB, tvDB, soundsDB } from '../../data/mockData';
import { callClaudeAPI } from '../../utils/ai';
import { parseMarkdown } from '../../utils/markdown';
import CustomSelect from '../CustomSelect';

export default function ContentView() {
  const { lang, L, t, GC, saveGC } = useBusiness();

  // Tab state inside Content Hub
  const [activeSubTab, setActiveSubTab] = useState('ct-ideas'); // 'ct-ideas', etc.

  // 1. Calendar Tab States
  const events = GC.calendar?.events || [];

  // Get dynamic today's date
  const todayDate = new Date();
  const tDay = todayDate.getDate();
  const tMonth = todayDate.getMonth();
  const tYear = todayDate.getFullYear();

  const [currentMonth, setCurrentMonth] = useState(tMonth);
  const [currentYear, setCurrentYear] = useState(tYear);
  const [selectedDay, setSelectedDay] = useState(tDay);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostDay, setNewPostDay] = useState(tDay);
  const [newPostTime, setNewPostTime] = useState('6:00 PM');

  useEffect(() => {
    if (selectedDay) {
      setNewPostDay(selectedDay);
    }
  }, [selectedDay]);

  const getEventMonth = (ev) => ev.month !== undefined ? ev.month : 5;
  const getEventYear = (ev) => ev.year !== undefined ? ev.year : 2026;

  // Filter events for the currently visible month and year
  const visibleEvents = events.filter(e => {
    const m = getEventMonth(e);
    const y = getEventYear(e);
    return m === currentMonth && y === currentYear;
  });

  const eventDays = visibleEvents.filter(e => e.type === 'content').map(e => e.day);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startWeekday = new Date(currentYear, currentMonth, 1).getDay();

  const paddingCells = Array.from({ length: startWeekday }, (_, i) => null);
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const gridCells = [...paddingCells, ...dayCells];

  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthNamesAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
    setSelectedDay(1);
  };

  // 2. Ideas Tab States
  const [todayIdeas, setTodayIdeas] = useState(GC.contentHub?.todayIdeas || []);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const savedIdeas = GC.contentHub?.savedIdeas || [];
 
  const handleGenIdeas = async () => {
    setLoadingIdeas(true);
    const isArabic = lang === 'ar';
    const systemPrompt = isArabic
      ? `أنت مدير شبكات تواصل اجتماعي وصانع محتوى خبير. تقوم بتوليد أفكار ريلز وكاروسيل وتيك توك مبتكرة وخاطفة للانتباه ومخصصة بدقة لمجال المستخدم.
يجب أن تعود بالإجابة كـ JSON Array صالح فقط بدون أي نصوص أو توضيحات أخرى.`
      : `You are an expert social media manager and content creator. You generate attention-grabbing, highly viral ideas for Reels, Carousels, Stories, and TikToks, strictly tailored to the user's business niche.
You MUST return the output strictly as a clean JSON array (no conversational filler, no markdown formatting blocks except the array itself).`;

    const prompt = isArabic
      ? `قم بتوليد 5 أفكار محتوى يومية مخصصة ومبتكرة جداً ومناسبة للجمهور العربي.
بيانات البزنس الحالية:
- المجال: "${GC?.profile?.niche || 'صناعة المحتوى والنمو الرقمي'}"
- الجمهور المستهدف: "${GC?.profile?.offer?.audience || 'المهتمين بالنمو والتطوير'}"
- نموذج العمل: "${GC?.profile?.type || 'صانع محتوى'}"

يرجى مراعاة ما يقوم به كبار صناع المحتوى والمنافسين في هذا المجال وجلب أفكار ريلز وتيك توك وكاروسيل مواكبة للترند وتخص هذا النطاق تحديداً.

أرجع المخرجات بالصيغة التالية (JSON Array):
[
  { "t": "عنوان الفكرة الجذاب المبتكر المتلائم مع المجال", "p": "ريل / كاروسيل / ستوري / تيك توك", "ty": "تعليمي / شخصي / مجتمع / لايف ستايل", "tm": "٧–٩ ص / ١٢–٢ م" }
]`
      : `Generate 5 daily customized and highly engaging content ideas matching current social media trends in the user's niche.
Business Context:
- Niche: "${GC?.profile?.niche || 'Content Creation & Digital Growth'}"
- Target Audience: "${GC?.profile?.offer?.audience || 'Ambition professionals'}"
- Model: "${GC?.profile?.type || 'Content Creator'}"

Analyze what top creators and competitors in this niche are posting. Generate modern content templates.

Return format (JSON Array):
[
  { "t": "Engaging idea title tailored to the niche", "p": "Reel / Carousel / Story / TikTok", "ty": "Educational / Personal / Community / Lifestyle", "tm": "7-9 AM / 12-2 PM" }
]`;

    try {
      const resText = await callClaudeAPI(prompt, systemPrompt, lang, GC);
      let cleanJson = resText.trim();
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
      }
      const parsed = JSON.parse(cleanJson);
      const finalIdeas = (Array.isArray(parsed) && parsed.length > 0) ? parsed : (DB.ideas[lang] || DB.ideas.en);
      setTodayIdeas(finalIdeas);
      saveGC({
        ...GC,
        contentHub: {
          ...GC.contentHub,
          todayIdeas: finalIdeas
        }
      });
    } catch (e) {
      console.error(e);
      const finalIdeas = DB.ideas[lang] || DB.ideas.en;
      setTodayIdeas(finalIdeas);
      saveGC({
        ...GC,
        contentHub: {
          ...GC.contentHub,
          todayIdeas: finalIdeas
        }
      });
    } finally {
      setLoadingIdeas(false);
    }
  };

  const handleSaveIdea = (idea) => {
    if (savedIdeas.some(i => i.t === idea.t)) return;
    const updated = [idea, ...savedIdeas];
    saveGC({
      ...GC,
      contentHub: {
        ...GC.contentHub,
        savedIdeas: updated
      }
    });
    alert(L('Idea saved! 📌', 'تم حفظ الفكرة! 📌'));
  };

  const handleAddPostClick = (selectedDay = 15) => {
    setSelectedDay(selectedDay);
    setNewPostDay(selectedDay);
    setShowAddModal(true);
  };

  const handleAddPostSubmit = (e) => {
    if (e) e.preventDefault();
    if (!newPostTitle.trim()) return;

    const newEv = {
      id: Date.now(),
      title: newPostTitle,
      day: parseInt(newPostDay) || 1,
      month: currentMonth,
      year: currentYear,
      type: 'content',
      time: newPostTime
    };

    saveGC({
      ...GC,
      calendar: {
        ...GC.calendar,
        events: [...events, newEv]
      }
    });

    setNewPostTitle('');
    setShowAddModal(false);
    alert(L('Post scheduled successfully! 🚀', 'تمت جدولة المنشور بنجاح! 🚀'));
  };

  // 3. Captions Tab States
  const [capInp, setCapInp] = useState(GC.contentHub?.capInp || '');
  const [selectedTone, setSelectedTone] = useState(GC.contentHub?.selectedTone || 0); // 0: Funny, 1: Educational, 2: Emotional, 3: CTA
  const [capHookType, setCapHookType] = useState(GC.contentHub?.capHookType || 'question'); // 'question', 'stat', 'pov', 'story', 'challenge'
  const [generatedCaptions, setGeneratedCaptions] = useState(GC.contentHub?.generatedCaptions || []);
  const [generatingCaptions, setGeneratingCaptions] = useState(false);

  const handleGenCaps = async () => {
    if (!capInp.trim()) {
      alert(L('Please enter a description first', 'الرجاء كتابة وصف المنشور أولاً'));
      return;
    }
    setGeneratingCaptions(true);
    setGeneratedCaptions([]);

    const tones = ['Funny', 'Educational', 'Emotional', 'CTA'];
    const hookNames = {
      question: 'Question (سؤال)',
      stat: 'Statistic (إحصائية)',
      pov: 'POV',
      story: 'Story (قصة)',
      challenge: 'Challenge (تحدي)'
    };

    const prompt = `Generate 3 captions with tone: ${tones[selectedTone]} starting with a Hook type: "${hookNames[capHookType] || capHookType}" for a post about: "${capInp}". Language: ${lang}. Focus on Arab audience. Output them as a list.`;
    const sysPrompt = 'Arabic/English social media copywriter. Engaging, specific, emojis included.';

    try {
      const reply = await callClaudeAPI(prompt, sysPrompt, lang);
      const splitCaps = reply.split('\n\n').filter(Boolean).map(c => c.replace(/^\d+[\.\s]/, '').trim());
      const finalCaps = splitCaps.length > 0 ? splitCaps : [reply];
      setGeneratedCaptions(finalCaps);
      
      saveGC({
        ...GC,
        contentHub: {
          ...GC.contentHub,
          capInp,
          selectedTone,
          capHookType,
          generatedCaptions: finalCaps
        }
      });
    } catch (e) {
      // Fallback captions
      const fallbacks = DB.capSets[lang] && DB.capSets[lang][selectedTone] || ['Generated caption fallback'];
      setGeneratedCaptions(fallbacks);
      
      saveGC({
        ...GC,
        contentHub: {
          ...GC.contentHub,
          capInp,
          selectedTone,
          capHookType,
          generatedCaptions: fallbacks
        }
      });
    } finally {
      setGeneratingCaptions(false);
    }
  };

  // 4. Script Writer Tab States
  const [scrTopic, setScrTopic] = useState(GC.contentHub?.scrTopic || '');
  const [scrPlatform, setScrPlatform] = useState(GC.contentHub?.scrPlatform || 'Instagram Reel (30–60s)');
  const [scrStyle, setScrStyle] = useState(GC.contentHub?.scrStyle || 'Educational + Tips');
  const [scrHookType, setScrHookType] = useState(GC.contentHub?.scrHookType || 'question'); // 'question', 'stat', 'pov', 'story', 'challenge'
  const [generatedScript, setGeneratedScript] = useState(GC.contentHub?.generatedScript || '');
  const [generatingScript, setGeneratingScript] = useState(false);

  const triggerContentAI = async (toolKey, loadingSetter, outputSetter, prompt, system, isArrayOutput = false, fallbackFn = null) => {
    loadingSetter(true);
    outputSetter(isArrayOutput ? [] : '');
    let accumulated = '';
    let hasReceivedFirstChunk = false;

    try {
      const response = await callClaudeAPI(prompt, system, lang, GC, `Content Hub - ${toolKey}`, (chunk) => {
        if (!hasReceivedFirstChunk) {
          hasReceivedFirstChunk = true;
          loadingSetter(false);
        }
        accumulated += chunk;
        if (isArrayOutput) {
          const parts = accumulated.split(/(?=\d\.\s*)/g).filter(Boolean);
          outputSetter(parts);
        } else {
          outputSetter(accumulated);
        }
      });
      const finalRes = response || accumulated;
      if (isArrayOutput) {
        const parts = finalRes.split(/(?=\d\.\s*)/g).filter(Boolean);
        outputSetter(parts);
      } else {
        outputSetter(finalRes);
      }
      return finalRes;
    } catch (e) {
      console.warn("AI generation failed, trying fallback:", e);
      if (fallbackFn) {
        fallbackFn();
      } else {
        outputSetter(isArrayOutput ? ['Error generating content'] : 'Error generating content');
      }
      return null;
    } finally {
      loadingSetter(false);
    }
  };

  const handleGenerateScript = async () => {
    if (!scrTopic.trim()) {
      alert(L('Please enter a video topic first', 'من فضلك أدخل موضوع الفيديو أولاً'));
      return;
    }

    const prompt = `Write a video script for platform: ${scrPlatform}, style: ${scrStyle}, hook type: ${scrHookType}, about topic: "${scrTopic}". Target audience: Arab creators. Generate complete structure (Hook, Body, CTA, and Production notes).`;
    const sysPrompt = 'World-class short form video scriptwriter specializing in high retention hook rates.';

    const fallbackFn = () => {
      const isShort = !scrPlatform.includes('YouTube Video');
      const isAR = lang === 'ar';
      const hooksEN = {
        question: `❓ HOOK: "Do you struggle with ${scrTopic}? Watch this before you try anything else..."`,
        stat: `📊 HOOK: "${Math.floor(Math.random() * 70) + 20}% of creators get this wrong with ${scrTopic}. Here's why..."`,
        pov: `👁️ HOOK: "POV: You finally learned how to ${scrTopic}"`,
        story: `📖 HOOK: "One year ago I was completely lost at ${scrTopic}. Here's what changed:"`,
        challenge: `🎯 HOOK: "Try this ${scrTopic} challenge for 7 days and see what happens"`
      };
      const hooksAR = {
        question: `❓ الهوك: "بتعاني مع ${scrTopic}؟ شوف ده قبل ما تجرب أي حاجة..."`,
        stat: `📊 الهوك: "${Math.floor(Math.random() * 70) + 20}٪ من المنشئين بيغلطوا في ${scrTopic}. إليك السبب..."`,
        pov: `👁️ الهوك: "POV: اتعلمت أخيراً إزاي ${scrTopic}"`,
        story: `📖 الهوك: "قبل سنة كنت ضايع تماماً في ${scrTopic}. إليك ما تغيّر:"`,
        challenge: `🎯 الهوك: "جرّب تحدي ${scrTopic} لـ ٧ أيام وشوف ما سيحدث"`
      };
      const hook = isAR ? (hooksAR[scrHookType] || hooksAR.question) : (hooksEN[scrHookType] || hooksEN.question);
      const body = isAR
        ? `[النقطة ١] "المشكلة الأساسية في ${scrTopic} هي أن الناس بيفكروا في [خطأ شائع]..."\n[النقطة ٢] "الحل الحقيقي هو [الطريقة الصح]. وهنا كيف تطبقها:"\n[النقطة ٣] "النتيجة اللي هتشوفها: [التحسن المتوقع]"`
        : `[Point 1] "The core problem with ${scrTopic} is that people think [common mistake]..."\n[Point 2] "The real solution is [correct approach]. Here's how you apply it:"\n[Point 3] "The result you'll see: [expected improvement]"`;
      const cta = isAR
        ? `"لو ده فادك، ${isShort ? 'فولو لنصايح يومية! 👇' : 'اكتب في التعليق أكبر تحديك في ' + scrTopic + '!'}".\n احفظ الفيديو ده.`
        : `"If this helped, ${isShort ? 'follow for daily tips! 👇' : 'comment your biggest challenge with ' + scrTopic + ' below!'}"\n"Save this video."`;

      const fallbackText = `📱 Platform: ${scrPlatform}\n⏱️ Duration: ${isShort ? '30–60 sec' : '6–9 min'}\n\n🎬 OPENING\n${hook}\n\n💡 BODY\n${body}\n\n🎯 CTA\n${cta}`;
      setGeneratedScript(fallbackText);
      saveGC({
        ...GC,
        contentHub: {
          ...GC.contentHub,
          scrTopic,
          scrPlatform,
          scrStyle,
          scrHookType,
          generatedScript: fallbackText
        }
      });
    };

    const finalRes = await triggerContentAI('Script Writer', setGeneratingScript, setGeneratedScript, prompt, sysPrompt, false, fallbackFn);
    if (finalRes) {
      saveGC({
        ...GC,
        contentHub: {
          ...GC.contentHub,
          scrTopic,
          scrPlatform,
          scrStyle,
          scrHookType,
          generatedScript: finalRes
        }
      });
    }
  };

  const handleCopyScript = () => {
    if (!generatedScript) return;
    navigator.clipboard.writeText(generatedScript).then(() => {
      alert(L('Script copied to clipboard!', 'تم نسخ السكريبت للحافظة!'));
    });
  };

  // 5. Trending Videos Tab States
  const [tvPlatform, setTvPlatform] = useState(GC.contentHub?.tvPlatform || 'TikTok');
  const [tvSelectedTrend, setTvSelectedTrend] = useState(GC.contentHub?.tvSelectedTrend || 'Morning Routine Format');
  const [trendIdeasOut, setTrendIdeasOut] = useState(GC.contentHub?.trendIdeasOut || '');
  const [generatingTrendVersion, setGeneratingTrendVersion] = useState(false);

  const getTrendingVideos = () => {
    return (tvDB[tvPlatform] && tvDB[tvPlatform][lang]) || (tvDB[tvPlatform] && tvDB[tvPlatform].en) || [];
  };

  const handleGenFromTrend = async (customTrendTitle = null) => {
    const targetTrend = customTrendTitle || tvSelectedTrend;
    const prompt = `Write a viral version/ideas of the following social media trend: "${targetTrend}" for my niche. Language: ${lang}. Offer actionable steps.`;
    const sysPrompt = 'Viral video ideator specializing in MENA niche audience targeting.';

    const fallbackFn = () => {
      const fbText = L('Click "Generate My Version" to customize your script.', 'اضغط على زر توليد نسختي للحصول على أفكار مخصصة.');
      setTrendIdeasOut(fbText);
      saveGC({
        ...GC,
        contentHub: {
          ...GC.contentHub,
          tvPlatform,
          tvSelectedTrend,
          trendIdeasOut: fbText
        }
      });
    };

    const finalRes = await triggerContentAI('Gen From Trend', setGeneratingTrendVersion, setTrendIdeasOut, prompt, sysPrompt, false, fallbackFn);
    if (finalRes) {
      saveGC({
        ...GC,
        contentHub: {
          ...GC.contentHub,
          tvPlatform,
          tvSelectedTrend,
          trendIdeasOut: finalRes
        }
      });
    }
  };

  // 6. Repurpose Tab States
  const [repInp, setRepInp] = useState(GC.contentHub?.repInp || '');
  const [repType, setRepType] = useState(GC.contentHub?.repType || 'Instagram Reel script');
  const [repOutputs, setRepOutputs] = useState(GC.contentHub?.repOutputs || []);
  const [repurposing, setRepurposing] = useState(false);

  const handleRepurposeContent = async () => {
    if (!repInp.trim()) {
      alert(L('Please enter original content first', 'الرجاء إدخال المحتوى الأصلي أولاً'));
      return;
    }

    const prompt = `Repurpose the following content into 5 formats: 1. Reel script, 2. Twitter Thread, 3. Email Newsletter, 4. Carousel slides layout, 5. Blog intro paragraph. Original format: ${repType}. Content: "${repInp}". Language: ${lang}.`;
    const sysPrompt = 'Content repurposing machine. Return the 5 formats labeled clearly.';

    const fallbackFn = () => {
      const fbOutputs = lang === 'ar'
        ? ['١. سكريبت ريل معاد صياغته', '٢. ثريد تويتر', '٣. نيوزليتر إيميل', '٤. تصميم شرائح كاروسيل', '٥. مقدمة مقال']
        : ['1. Repurposed Reel script', '2. Twitter Thread', '3. Email newsletter', '4. Carousel slides outline', '5. Blog post intro'];
      setRepOutputs(fbOutputs);
      saveGC({
        ...GC,
        contentHub: {
          ...GC.contentHub,
          repInp,
          repType,
          repOutputs: fbOutputs
        }
      });
    };

    const finalRes = await triggerContentAI('Repurpose', setRepurposing, setRepOutputs, prompt, sysPrompt, true, fallbackFn);
    if (finalRes) {
      const parts = finalRes.split(/(?=\d\.\s*)/g).filter(Boolean);
      saveGC({
        ...GC,
        contentHub: {
          ...GC.contentHub,
          repInp,
          repType,
          repOutputs: parts
        }
      });
    }
  };

  // 7. Radar Tab (Trends) Lists
  const hotRadar = DB.trendHot[lang] || [];
  const emergingRadar = DB.trendEmer[lang] || [];
  const soonRadar = DB.trendSoon[lang] || [];
  const audioRadar = DB.trendAudio || [];

  // 8. Q&A Tab States
  const [qaInp, setQaInp] = useState(GC.contentHub?.qaInp || '');
  const [qaStyle, setQaStyle] = useState(GC.contentHub?.qaStyle || 'Friendly & Casual');
  const [qaFormat, setQaFormat] = useState(GC.contentHub?.qaFormat || 'Story reply');
  const [qaAnswer, setQaAnswer] = useState(GC.contentHub?.qaAnswer || '');
  const [generatingQA, setGeneratingQA] = useState(false);

  const handleGenQA = async () => {
    if (!qaInp.trim()) {
      alert(L('Please enter a question first', 'الرجاء إدخال السؤال أولاً'));
      return;
    }

    const prompt = `Create a reply/answer to this question: "${qaInp}".
Style: ${qaStyle}
Format: ${qaFormat}
Language: ${lang === 'ar' ? 'Arabic' : 'English'}

Write the output directly as if you are replying.
IMPORTANT: You MUST use rich Markdown styling to format the output.
- Use headings (###) to separate logical sections.
- Highlight key terms, metrics, numbers, and important lessons using bold text (**bold words**) so they stand out beautifully.
- Use lists (- or 1.) for tips or step-by-step guidance.`;
    const sysPrompt = 'You are a professional social media manager. You write replies using rich markdown format (headings, lists, bold highlights) to make them visually premium and highly structured.';

    const fallbackFn = () => {
      const fbAnswer = L('Reply answer generated.', 'تم توليد الرد.');
      setQaAnswer(fbAnswer);
      saveGC({
        ...GC,
        contentHub: {
          ...GC.contentHub,
          qaInp,
          qaStyle,
          qaFormat,
          qaAnswer: fbAnswer
        }
      });
    };

    const finalRes = await triggerContentAI('Community Q&A', setGeneratingQA, setQaAnswer, prompt, sysPrompt, false, fallbackFn);
    if (finalRes) {
      saveGC({
        ...GC,
        contentHub: {
          ...GC.contentHub,
          qaInp,
          qaStyle,
          qaFormat,
          qaAnswer: finalRes
        }
      });
    }
  };

  const handleCopyQA = () => {
    if (!qaAnswer) return;
    navigator.clipboard.writeText(qaAnswer).then(() => {
      alert(L('Answer copied to clipboard!', 'تم نسخ الرد للحافظة!'));
    });
  };

  const handleImproveQA = async (instruction) => {
    if (!qaAnswer) return;
    setGeneratingQA(true);
    
    const prompt = `Modify this generated response to follow this instruction: "${instruction}".
Current response: "${qaAnswer}"
Keep the reply format as selected: ${qaFormat}. Respond in same language: ${lang}.
Make sure to keep/use rich Markdown formatting (headings, lists, and bold text for highlights) to structure the improved version.`;
    const sysPrompt = 'You are a professional social media manager. You rewrite and optimize replies using rich markdown format (headings, lists, bold highlights) to make them visually premium.';

    const fallbackFn = () => {
      alert('Failed to modify reply.');
    };

    const finalRes = await triggerContentAI('Community Q&A Update', setGeneratingQA, setQaAnswer, prompt, sysPrompt, false, fallbackFn);
    if (finalRes) {
      saveGC({
        ...GC,
        contentHub: {
          ...GC.contentHub,
          qaInp,
          qaStyle,
          qaFormat,
          qaAnswer: finalRes
        }
      });
    }
  };

  // 8.5 Trending Sounds AI generator
  const [trendingSounds, setTrendingSounds] = useState(GC.contentHub?.trendingSounds || soundsDB[lang] || soundsDB.en || []);
  const [generatingSounds, setGeneratingSounds] = useState(false);

  const handleGenTrendingSounds = async () => {
    setGeneratingSounds(true);
    const isArabic = lang === 'ar';
    const systemPrompt = `You are a social media trend analyst specializing in social media viral audio tracking.
You MUST return the output strictly as a clean JSON array (no markdown block wrapper except json, no extra explanation text).`;

    const prompt = `Generate a list of 6 trending sounds/songs/audio styles currently popular on social media (TikTok/Instagram Reels) that are highly relevant to my niche.
Business Context:
- Niche: "${GC?.profile?.niche || 'Digital Growth'}"
- Audience: "${GC?.profile?.offer?.audience || 'General'}"
- Model: "${GC?.profile?.type || 'Content Creator'}"
Preferred Language: ${isArabic ? 'Arabic' : 'English'}

For each sound, provide:
1. Sound Name (e.g. popular song title and artist, or audio trend description).
2. Relevant tags/niche match.
3. Estimate of usage count (e.g. "1.2M uses" or "450K uses").
4. Whether it is hot/viral right now (boolean).

Return strictly as a JSON array of objects:
[
  { "n": "Sound Name", "t": "Niche Match / Tags", "u": "Usage Count (e.g. 1.2M or 450K)", "h": true }
]`;

    try {
      const resText = await callClaudeAPI(prompt, systemPrompt, lang, GC);
      let cleanJson = resText.trim();
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
      }
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setTrendingSounds(parsed);
        saveGC({
          ...GC,
          contentHub: {
            ...GC.contentHub,
            trendingSounds: parsed
          }
        });
      } else {
        throw new Error("Invalid format");
      }
    } catch (e) {
      console.error(e);
      const fb = soundsDB[lang] || soundsDB.en || [];
      setTrendingSounds(fb);
      saveGC({
        ...GC,
        contentHub: {
          ...GC.contentHub,
          trendingSounds: fb
        }
      });
    } finally {
      setGeneratingSounds(false);
    }
  };

  const audioPlayerRef = useRef(null);
  const [playingIdx, setPlayingIdx] = useState(null);

  const togglePlaySound = (idx, soundName) => {
    const mp3Urls = [
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
    ];
    const url = mp3Urls[idx % mp3Urls.length];

    if (playingIdx === idx) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setPlayingIdx(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const newAudio = new Audio(url);
      newAudio.volume = 0.4;
      newAudio.play().catch(err => console.log('Audio playback error:', err));
      newAudio.onended = () => {
        setPlayingIdx(null);
      };
      audioPlayerRef.current = newAudio;
      setPlayingIdx(idx);
    }
  };

  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };
  }, []);

  // 9. Burnout Tab States
  const [energyLevel, setEnergyLevel] = useState(80); // 0, 40, 65, 80, 100
  const [energyLoggedEmoji, setEnergyLoggedEmoji] = useState('😊');

  const getBurnoutAIAnalysis = () => {
    const msgs = {
      en: {
        0: '⚠️ Critical burnout risk. Energy at 0%. Take 2 full days off. Your audience will wait — your mental health won\'t.',
        40: '⚠️ Low energy. Do only easy content today — Stories or resharing. Your creativity needs rest.',
        65: '🟡 Moderate energy. You can create but keep it simple. One piece of content max.',
        80: '✅ Great energy! Perfect day for your best content. Batch 2-3 pieces while you\'re in the zone.',
        100: '🔥 Peak energy! Create your boldest content today. Film multiple pieces — this energy is rare!'
      },
      ar: {
        0: '⚠️ خطر إرهاق حرج. الطاقة صفر. خدي يومين راحة كاملين. جمهورك هينتظر — صحتك النفسية لأ.',
        40: '⚠️ طاقة منخفضة. افعلي كونتنت سهل فقط اليوم — ستوريز أو إعادة نشر. إبداعك محتاج راحة.',
        65: '🟡 طاقة متوسطة. تقدري تنشري بس خليه بسيط. قطعة واحدة كحد أقصى.',
        80: '✅ طاقة ممتازة! يوم مثالي لأفضل محتوى. اعملي ٢-٣ قطع وانتي في الزون.',
        100: '🔥 طاقة ذروة! اعملي أجرأ محتوى اليوم. صوري أكتر من قطعة — هذه الطاقة نادرة!'
      }
    };
    const k = energyLevel <= 0 ? 0 : energyLevel <= 40 ? 40 : energyLevel <= 65 ? 65 : energyLevel <= 80 ? 80 : 100;
    return msgs[lang][k];
  };

  return (
    <div className="pg on" id="pg-content">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">✨</span>
          {L('Content Hub', 'مركز صناعة المحتوى')}
        </div>
      </div>

      <div className="tool-tabs" id="content-tabs" style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
        {[
          { key: 'ct-ideas', label: L('Ideas Lab', 'مختبر الأفكار'), emoji: '💡' },
          { key: 'ct-cap', label: L('Captions', 'كتابة كابشن'), emoji: '✍️' },
          { key: 'ct-script', label: L('Script Writer', 'كاتب السكريبت'), emoji: '🎬' },
          { key: 'ct-trendvid', label: L('Trending Videos', 'الفيديوهات الرائجة'), emoji: '📹' },
          { key: 'ct-rep', label: L('Repurpose', 'إعادة الصياغة'), emoji: '♻️' },
          { key: 'ct-trend', label: L('Radar', 'الرادار'), emoji: '🔥' },
          { key: 'ct-qa', label: L('Q&A', 'الأسئلة والأجوبة'), emoji: '💬' },
          { key: 'ct-burn', label: L('Burnout', 'حماية الإرهاق'), emoji: '💚' }
        ].map(tab => (
          <button
            key={tab.key}
            className={`tbb ${activeSubTab === tab.key ? 'on' : ''}`}
            onClick={() => setActiveSubTab(tab.key)}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>



      {/* ================= IDEAS PANEL ================= */}
      {activeSubTab === 'ct-ideas' && (
        <div className="tool-panel on" id="ct-ideas">
          <div className="sh mb">
            <button 
              className="btn btn-prime" 
              onClick={handleGenIdeas} 
              disabled={loadingIdeas}
            >
              {loadingIdeas ? L('Generating...', 'جاري التوليد...') : `✨ ${L('Generate Ideas', 'توليد أفكار')}`}
            </button>
          </div>
          <div className="g2">
            <div className="card mb">
              <div className="sh"><div className="st">{L('Today\'s Ideas', 'أفكار اليوم')}</div></div>
              <div id="ideaslist" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {todayIdeas.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--t3)' }}>
                    {L('Click "Generate Ideas" above to get AI recommendations', 'اضغط على زر توليد أفكار للحصول على اقتراحات')}
                  </div>
                ) : (
                  todayIdeas.map((idea, idx) => (
                    <div className="idea" key={idx} style={{ background: 'var(--surface2)', padding: '10px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--t1)', marginBottom: '5px' }}>{idea.t}</div>
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className="tag">{idea.p}</span>
                        <span className="tag">{idea.ty}</span>
                        <span className="tag">⏰ {idea.tm}</span>
                        <button onClick={() => handleSaveIdea(idea)} className="btn btn-ghost" style={{ marginLeft: 'auto', padding: '2px 8px', fontSize: '10.5px' }}>
                          + {L('Save', 'حفظ')}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="card mb">
              <div className="sh"><div className="st">{L('Saved Ideas', 'الأفكار المحفوظة')}</div></div>
              <div id="savedideas" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {savedIdeas.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--t3)' }}>
                    {L('Click + Save on any idea to store it here', 'اضغط على حفظ بجوار أي فكرة لتظهر هنا')}
                  </div>
                ) : (
                  savedIdeas.map((idea, idx) => (
                    <div className="idea" key={idx} style={{ background: 'var(--surface2)', padding: '10px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--t1)', marginBottom: '4px' }}>{idea.t}</div>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <span className="badge b-green">{L('Saved', 'محفوظة')}</span>
                        <span className="badge">{idea.p}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= CAPTIONS PANEL ================= */}
      {activeSubTab === 'ct-cap' && (
        <div className="tool-panel on" id="ct-cap">
          <div className="g2">
            <div className="card mb">
              <div className="sh"><div className="st">{L('Describe Your Post', 'وصف موضوع المنشور')}</div></div>
              <textarea
                className="nb-area"
                value={capInp}
                onChange={(e) => setCapInp(e.target.value)}
                rows="4"
                placeholder={L('Morning coffee, productive vibes...', 'قهوة الصباح، أجواء الإنتاجية...')}
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--edge)', color: 'var(--t1)', padding: '10px', borderRadius: '8px' }}
              ></textarea>
              <div style={{ marginTop: '9px' }}>
                <div style={{ fontSize: '11.5px', color: 'var(--t2)', marginBottom: '6px' }}>{L('Tone', 'النبرة')}</div>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {[L('😄 Funny', '😄 كوميدي'), L('💡 Educational', '💡 تعليمي'), L('❤️ Emotional', '❤️ عاطفي'), L('🎯 CTA', '🎯 تفاعلي')].map((tText, tIdx) => (
                    <button
                      key={tIdx}
                      className={`btn ${selectedTone === tIdx ? 'btn-prime' : 'btn-ghost'}`}
                      onClick={() => setSelectedTone(tIdx)}
                      style={{ fontSize: '11.5px', padding: '5px 10px' }}
                    >
                      {tText}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '11.5px', color: 'var(--t2)', marginBottom: '6px' }}>{L('Hook Type', 'نوع الجذب')}</div>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {[
                    { key: 'question', label: L('❓ Question', '❓ سؤال') },
                    { key: 'stat', label: L('📊 Statistic', '📊 إحصائية') },
                    { key: 'pov', label: L('👁️ POV', '👁️ POV') },
                    { key: 'story', label: L('📖 Story', '📖 قصة') },
                    { key: 'challenge', label: L('🎯 Challenge', '🎯 تحدي') }
                  ].map((hookItem) => (
                    <button
                      key={hookItem.key}
                      className={`btn ${capHookType === hookItem.key ? 'btn-prime' : 'btn-ghost'}`}
                      onClick={() => setCapHookType(hookItem.key)}
                      style={{ fontSize: '11.5px', padding: '5px 10px' }}
                    >
                      {hookItem.label}
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn btn-prime" onClick={handleGenCaps} style={{ width: '100%', justifyContent: 'center', marginTop: '14px' }}>
                {generatingCaptions ? L('Generating...', 'جاري الكتابة...') : L('✨ Generate Captions', '✨ كتابة كابشن')}
              </button>
            </div>
            <div className="card mb">
              <div className="sh"><div className="st">{L('Generated Captions', 'الكابشن المقترح')}</div></div>
              <div id="capout">
                {generatedCaptions.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--t3)', textAlign: 'center', padding: '36px 0' }}>
                    {L('Captions will appear here...', 'سوف تظهر الاقتراحات هنا...')}
                  </div>
                ) : (
                  generatedCaptions.map((caption, idx) => (
                    <div className="ai mb" key={idx} style={{ background: 'var(--orange-dim)', padding: '12px', borderRadius: '8px', border: '1px solid var(--orange-d)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '7px' }}>
                        <div style={{ fontSize: '13px', lineHeight: 1.6 }}>{caption}</div>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '2px 8px', fontSize: '11px', flexShrink: 0 }}
                          onClick={() => {
                            navigator.clipboard.writeText(caption);
                            alert(L('Copied!', 'تم النسخ!'));
                          }}
                        >
                          {L('Copy', 'نسخ')}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SCRIPT WRITER PANEL ================= */}
      {activeSubTab === 'ct-script' && (
        <div className="tool-panel on" id="ct-script">
          <div className="g2">
            <div className="card mb">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Video Topic / Idea', 'فكرة أو موضوع الفيديو')}
                  </label>
                  <textarea
                    className="nb-area"
                    value={scrTopic}
                    onChange={(e) => setScrTopic(e.target.value)}
                    rows="3"
                    placeholder="e.g. 5 morning habits that changed my life..."
                    style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--edge)', color: 'var(--t1)', padding: '10px', borderRadius: '8px' }}
                  ></textarea>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Platform', 'المنصة')}</label>
                    <CustomSelect className="inp" value={scrPlatform} onChange={(e) => setScrPlatform(e.target.value)}>
                      <option value="Instagram Reel (30–60s)">Instagram Reel (30–60s)</option>
                      <option value="TikTok (60–90s)">TikTok (60–90s)</option>
                      <option value="YouTube Short">YouTube Short</option>
                      <option value="YouTube Video (5–10min)">YouTube Video (5–10min)</option>
                    </CustomSelect>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Style', 'الأسلوب')}</label>
                    <CustomSelect className="inp" value={scrStyle} onChange={(e) => setScrStyle(e.target.value)}>
                      <option value="Educational + Tips">Educational + Tips</option>
                      <option value="Story / Personal">Story / Personal</option>
                      <option value="POV / Trending">POV / Trending</option>
                      <option value="Tutorial">Tutorial</option>
                      <option value="Viral Hook">Viral Hook</option>
                    </CustomSelect>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '5px' }}>{L('Hook Type', 'نوع الجذب (Hook)')}</label>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {[
                      { key: 'question', label: L('❓ Question', '❓ سؤال') },
                      { key: 'stat', label: L('📊 Stat', '📊 إحصائية') },
                      { key: 'pov', label: L('👁️ POV', '👁️ POV') },
                      { key: 'story', label: L('📖 Story', '📖 قصة') },
                      { key: 'challenge', label: L('🎯 Challenge', '🎯 تحدي') }
                    ].map(h => (
                      <button
                        key={h.key}
                        className={`btn ${scrHookType === h.key ? 'btn-prime' : 'btn-ghost'}`}
                        onClick={() => setScrHookType(h.key)}
                        style={{ fontSize: '11px', padding: '4px 10px' }}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button className="btn btn-prime" onClick={handleGenerateScript} style={{ width: '100%', justifyContent: 'center' }}>
                  {generatingScript ? L('Generating...', 'جاري الكتابة...') : L('🎬 Generate Full Script', '🎬 كتابة سكريبت كامل')}
                </button>
              </div>
            </div>
            <div className="card mb">
              <div className="sh" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div className="st">{L('Generated Script', 'السكريبت المكتوب')}</div>
                <button className="btn btn-ghost" style={{ padding: '4px 9px', fontSize: '11px' }} onClick={handleCopyScript}>
                  📋 {L('Copy', 'نسخ')}
                </button>
              </div>
              <div id="script-output">
                {!generatedScript ? (
                  <div style={{ fontSize: '12px', color: 'var(--t3)', textAlign: 'center', padding: '36px 0' }}>
                    {L('Fill details and generate script', 'املأ التفاصيل واضغط لكتابة السكريبت')}
                  </div>
                ) : (
                  <div 
                    className="ai-box" 
                    style={{ background: 'var(--orange-dim)', padding: '16px', borderRadius: '10px', border: '1px solid var(--orange-d)', color: 'var(--t1)', fontSize: '13px', lineHeight: '1.8', maxHeight: '480px', overflowY: 'auto' }}
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(generatedScript) }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TRENDING VIDEOS PANEL ================= */}
      {activeSubTab === 'ct-trendvid' && (
        <div className="tool-panel on" id="ct-trendvid">
          <div className="g4 stagger mb">
            <div className="stat"><div className="slbl">🔥 {L('Trending Now', 'الرائج الآن')}</div><div className="sval" style={{ color: 'var(--red)' }}>24</div></div>
            <div className="stat"><div className="slbl">📈 {L('Viral Threshold', 'الحد الفيروسي')}</div><div className="sval">1M+</div></div>
            <div className="stat"><div className="slbl">🎵 {L('Trending Sounds', 'أصوات رائجة')}</div><div className="sval" style={{ color: 'var(--green)' }}>8</div></div>
            <div className="stat"><div className="slbl">🎯 {L('Niche Match', 'تطابق المجال')}</div><div className="sval">14</div></div>
          </div>
          <div className="g2">
            <div className="card mb">
              <div className="sh" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div className="st">{L('Trending Videos', 'فيديوهات ترند')}</div>
                <select className="inp" value={tvPlatform} onChange={(e) => setTvPlatform(e.target.value)} style={{ width: 'auto', fontSize: '11.5px' }}>
                  <option>TikTok</option>
                  <option>Instagram Reels</option>
                  <option>YouTube Shorts</option>
                </select>
              </div>
              <div id="trending-videos-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {getTrendingVideos().map((v, i) => (
                  <div
                    key={i}
                    style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '10px', padding: '13px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '7px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--orange-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>📹</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)' }}>{v.t}</div>
                        <div style={{ fontSize: '11px', color: 'var(--t2)' }}>🎵 {v.s}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--orange)' }}>{v.v} {L('views', 'مشاهدة')}</div>
                        <div style={{ fontSize: '11px', color: 'var(--green)' }}>{v.e} {L('eng', 'تفاعل')}</div>
                      </div>
                    </div>
                    <div style={{ background: 'var(--orange-dim)', borderRadius: '6px', padding: '6px 10px', fontSize: '11.5px', color: 'var(--t2)' }}>
                      💡 {v.w}
                    </div>
                    <button
                      className="btn btn-prime"
                      style={{ marginTop: '8px', padding: '4px 12px', fontSize: '11.5px', width: '100%', justifyContent: 'center' }}
                      onClick={() => handleGenFromTrend(v.t)}
                    >
                      🤖 {L('Generate My Version', 'توليد نسختي الخاصة')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="card mb">
              <div className="sh"><div className="st">{L('AI Ideas From Trends', 'أفكار الذكاء من الترند')}</div></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                <select className="inp" value={tvSelectedTrend} onChange={(e) => setTvSelectedTrend(e.target.value)} style={{ width: '100%' }}>
                  {getTrendingVideos().map((v, i) => (
                    <option key={i}>{v.t}</option>
                  ))}
                </select>
                <button className="btn btn-prime" onClick={() => handleGenFromTrend()} style={{ width: '100%', justifyContent: 'center' }}>
                  🤖 {L('Generate My Version', 'توليد نسختي')}
                </button>
                <div id="trend-ideas-output" style={{ width: '100%' }}>
                  {generatingTrendVersion && (
                    <div className="ai-box" style={{ animation: 'pulse 1.5s infinite', width: '100%' }}>{L('⚡ Rewriting trend format...', '⚡ جاري كتابة أفكار مناسبة...')}</div>
                  )}
                  {!generatingTrendVersion && !trendIdeasOut && (
                    <div style={{ fontSize: '12px', color: 'var(--t3)', width: '100%', textAlign: 'center', padding: '16px 0' }}>
                      {L('Select a trend and generate ideas', 'اختر ترند من الأعلى لتوليد أفكار مخصصة')}
                    </div>
                  )}
                  {!generatingTrendVersion && trendIdeasOut && (
                    <div
                      className="ai-box"
                      style={{ background: 'var(--orange-dim)', padding: '16px', borderRadius: '10px', border: '1px solid var(--orange-d)', color: 'var(--t1)', fontSize: '13px', lineHeight: '1.8', width: '100%', maxHeight: '550px', overflowY: 'auto', boxSizing: 'border-box' }}
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(trendIdeasOut) }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="card mb">
            <div className="sh" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div className="st">🎵 {L('Trending Sounds', 'أصوات ترند رائجة')}</div>
              <button 
                className="btn btn-ai" 
                onClick={handleGenTrendingSounds} 
                disabled={generatingSounds} 
                style={{ padding: '4px 10px', fontSize: '11px' }}
              >
                {generatingSounds ? L('Generating...', 'جاري التوليد...') : L('🤖 Generate Custom Sounds', '🤖 توليد أصوات لمجالي')}
              </button>
            </div>
            <div id="trending-sounds-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {trendingSounds.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderBottom: i < trendingSounds.length - 1 ? '1px solid var(--edge)' : 'none' }}>
                  <button 
                    className="btn btn-ghost" 
                    style={{ padding: '0', minWidth: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }} 
                    onClick={() => togglePlaySound(i, s.n)}
                  >
                    {playingIdx === i ? '⏹️' : '▶️'}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--t1)' }}>{s.n}</div>
                    <div style={{ fontSize: '11px', color: 'var(--t2)' }}>{s.t} · {s.u} {L('uses', 'استخدام')}</div>
                  </div>
                  {s.h && <span className="badge b-red" style={{ flexShrink: 0 }}>🔥 {L('Hot', 'حار')}</span>}
                  <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
                    <a 
                      href={`https://www.tiktok.com/search?q=${encodeURIComponent(s.n)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost" 
                      style={{ padding: '4px 10px', fontSize: '11px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      🎵 TikTok
                    </a>
                    <button className="btn btn-prime" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => alert(L('Sound saved! 🎵', 'تم حفظ الصوت! 🎵'))}>
                      {L('Use', 'استخدم')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= REPURPOSE PANEL ================= */}
      {activeSubTab === 'ct-rep' && (
        <div className="tool-panel on" id="ct-rep">
          <div className="g2">
            <div className="card mb">
              <div className="sh"><div className="st">{L('Your Original Content', 'محتواك الأصلي')}</div></div>
              <textarea
                className="nb-area"
                value={repInp}
                onChange={(e) => setRepInp(e.target.value)}
                rows="5"
                placeholder={L('Paste your script, blog, or video transcript...', 'الصق السكريبت، التغريدات، أو المقال هنا...')}
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--edge)', color: 'var(--t1)', padding: '10px', borderRadius: '8px' }}
              ></textarea>
              <div style={{ marginTop: '9px' }}>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Original Format', 'الصيغة الأصلية')}</label>
                <CustomSelect className="inp" value={repType} onChange={(e) => setRepType(e.target.value)} style={{ width: '100%' }}>
                  <option value="Instagram Reel script">Instagram Reel script</option>
                  <option value="Blog post / Article">Blog post / Article</option>
                  <option value="YouTube script">YouTube script</option>
                  <option value="Podcast points">Podcast points</option>
                </CustomSelect>
              </div>
              <button className="btn btn-prime" onClick={handleRepurposeContent} style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
                {repurposing ? L('Repurposing...', 'جاري الصياغة...') : L('♻️ Repurpose to 5 Formats', '♻️ إعادة الصياغة لـ ٥ أشكال')}
              </button>
            </div>
            <div className="card mb">
              <div className="sh"><div className="st">{L('Repurposed Versions', 'الصيغ الجديدة')}</div></div>
              <div id="repout" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                {repOutputs.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--t3)', textAlign: 'center', padding: '36px 0' }}>
                    {L('Enter content and click Repurpose', 'أدخل المحتوى واضغط لبدء إعادة التشكيل')}
                  </div>
                ) : (
                  repOutputs.map((fText, i) => (
                    <div className="ai mb" key={i} style={{ background: 'var(--orange-dim)', padding: '15px', borderRadius: '10px', border: '1px solid var(--orange-d)', marginBottom: '10px' }}>
                      <div 
                        style={{ fontSize: '13px', color: 'var(--t1)', lineHeight: '1.7' }}
                        dangerouslySetInnerHTML={{ __html: parseMarkdown(fText) }}
                      />
                      <button className="btn btn-ghost" onClick={() => { navigator.clipboard.writeText(fText); alert(L('Copied!', 'تم النسخ!')); }} style={{ marginTop: '9px', padding: '3px 9px', fontSize: '11px' }}>
                        {L('Copy', 'نسخ')}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TRENDING RADAR PANEL ================= */}
      {activeSubTab === 'ct-trend' && (
        <div className="tool-panel on" id="ct-trend">
          <div className="g3">
            <div className="card mb">
              <div className="sh"><div className="st">{L('Hot Right Now', 'رائج جداً الآن')}</div></div>
              <div id="th" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {hotRadar.map((tText, idx) => (
                  <div className="row" key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid var(--edge)' }}>
                    <div style={{ fontSize: '14px' }}>🔥</div>
                    <div style={{ flex: 1, fontSize: '13px', color: 'var(--t1)' }}>{tText.split('+')[0]}</div>
                    <span className="badge b-red">+{tText.split('+')[1]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card mb">
              <div className="sh"><div className="st">{L('Emerging', 'ترندات ناشئة')}</div></div>
              <div id="te" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {emergingRadar.map((tText, idx) => (
                  <div className="row" key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid var(--edge)' }}>
                    <div style={{ fontSize: '14px' }}>📈</div>
                    <div style={{ flex: 1, fontSize: '13px', color: 'var(--t1)' }}>{tText.split('+')[0]}</div>
                    <span className="badge b-purple">+{tText.split('+')[1]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card mb">
              <div className="sh"><div className="st">{L('Trending Soon', 'رائج قريباً')}</div></div>
              <div id="ts2" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {soonRadar.map((tText, idx) => (
                  <div className="row" key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid var(--edge)' }}>
                    <div style={{ fontSize: '14px' }}>🕐</div>
                    <div style={{ flex: 1, fontSize: '13px', color: 'var(--t1)' }}>{tText.split('+')[0]}</div>
                    <span className="badge b-orange">+{tText.split('+')[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="card mb">
            <div className="sh"><div className="st">{L('Trending Audio', 'الموسيقى والأصوات الرائجة')}</div></div>
            <div id="taudio" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {audioRadar.map((a, idx) => (
                <div className="row" key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid var(--edge)' }}>
                  <div style={{ fontSize: '14px' }}>🎵</div>
                  <div style={{ flex: 1 }}>
                    <div className="rn" style={{ fontWeight: 600, fontSize: '12.5px' }}>{a.n}</div>
                    <div className="rs" style={{ fontSize: '11px', color: 'var(--t2)' }}>{a.u[lang] || a.u.en}</div>
                  </div>
                  {a.hot && <span className="badge b-red">🔥 {L('Hot', 'ساخن')}</span>}
                  <button className="btn btn-ghost" style={{ padding: '3px 9px', fontSize: '11px', marginLeft: '6px' }} onClick={() => alert(L('Audio saved! 🎵', 'تم حفظ الصوت! 🎵'))}>
                    {L('Use', 'استخدم')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= Q&A PANEL ================= */}
      {activeSubTab === 'ct-qa' && (
        <div className="tool-panel on" id="ct-qa">
          <div className="g2">
            <div className="card mb">
              <textarea
                className="nb-area"
                value={qaInp}
                onChange={(e) => setQaInp(e.target.value)}
                rows="3"
                placeholder={L('e.g. How did you grow to 284K followers?', 'مثال: كيف وصلت لـ ٢٨٤ ألف متابع؟')}
                style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--edge)', color: 'var(--t1)', padding: '10px', borderRadius: '8px' }}
              ></textarea>
              <div style={{ marginTop: '9px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Style', 'الأسلوب')}</label>
                  <CustomSelect className="inp" value={qaStyle} onChange={(e) => setQaStyle(e.target.value)} style={{ width: '100%' }}>
                    <option value="Friendly & Casual">{L('Friendly & Casual', 'ودود وعفوي')}</option>
                    <option value="Educational">{L('Educational', 'تعليمي ومفصل')}</option>
                    <option value="Short & Inspiring">{L('Short & Inspiring', 'قصير وملهم')}</option>
                    <option value="Funny & Relatable">{L('Funny & Relatable', 'مضحك ومقرب')}</option>
                  </CustomSelect>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Format', 'الصيغة')}</label>
                  <CustomSelect className="inp" value={qaFormat} onChange={(e) => setQaFormat(e.target.value)} style={{ width: '100%' }}>
                    <option value="Story reply">{L('Story reply', 'رد ستوري')}</option>
                    <option value="Comment reply">{L('Comment reply', 'رد تعليق')}</option>
                    <option value="Dedicated Reel">{L('Dedicated Reel', 'ريل مخصص')}</option>
                  </CustomSelect>
                </div>
              </div>
              <button className="btn btn-prime" onClick={handleGenQA} style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
                {generatingQA ? L('Generating...', 'جاري الكتابة...') : L('💬 Generate Answer', '💬 توليد الإجابة')}
              </button>
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--edge)' }}>
                <div style={{ fontSize: '11.5px', color: 'var(--t2)', marginBottom: '7px' }}>{L('Frequently Asked', 'الأسئلة المتكررة')}</div>
                <div id="qa-freq-list" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(DB.qaFreq[lang] || []).map((qText, idx) => (
                    <div
                      key={idx}
                      style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                      onClick={() => setQaInp(qText)}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.background = 'var(--surface3)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--edge)'; e.currentTarget.style.background = 'var(--surface2)'; }}
                    >
                      <div style={{ fontSize: '12.5px', color: 'var(--t1)' }}>💬 {qText}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card mb" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="sh" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div className="st">{L('Generated Answer', 'الرد المقترح')}</div>
                {qaAnswer && (
                  <button className="btn btn-ghost" style={{ padding: '4px 9px', fontSize: '11px' }} onClick={handleCopyQA}>
                    📋 {L('Copy', 'نسخ')}
                  </button>
                )}
              </div>
              <div id="qaout" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {generatingQA && (
                  <div className="ai-box" style={{ animation: 'pulse 1.5s infinite', flex: 1 }}>{L('⚡ Generating response...', '⚡ جاري صياغة الرد...')}</div>
                )}
                {!generatingQA && !qaAnswer && (
                  <div style={{ fontSize: '12px', color: 'var(--t3)', textAlign: 'center', padding: '36px 0', flex: 1 }}>
                    {L('Type a question and generate', 'اكتب سؤالك على اليسار لتوليد رد ذكي')}
                  </div>
                )}
                {!generatingQA && qaAnswer && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                    <div
                      className="ai-box"
                      style={{ background: 'var(--orange-dim)', padding: '16px', borderRadius: '10px', border: '1px solid var(--orange-d)', color: 'var(--t1)', fontSize: '13px', lineHeight: '1.8', maxHeight: '420px', overflowY: 'auto', boxSizing: 'border-box' }}
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(qaAnswer) }}
                    />
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                      <button 
                        className="btn btn-ghost" 
                        style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px' }}
                        onClick={() => handleImproveQA('make it shorter')}
                      >
                        ⚡ {L('Shorter', 'تبسيط وتقصير')}
                      </button>
                      <button 
                        className="btn btn-ghost" 
                        style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px' }}
                        onClick={() => handleImproveQA('add emojis')}
                      >
                        🔥 {L('Add Emojis', 'إضافة إيموجي')}
                      </button>
                      <button 
                        className="btn btn-ghost" 
                        style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px' }}
                        onClick={() => handleImproveQA('add Call-to-Action')}
                      >
                        🎯 {L('Add Call-to-Action', 'دعوة تفاعل (CTA)')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= BURNOUT PANEL ================= */}
      {activeSubTab === 'ct-burn' && (
        <div className="tool-panel on" id="ct-burn">
          <div className="g4 stagger mb">
            <div className="stat">
              <div className="slbl">🔋 {L('Energy', 'طاقة الإبداع')}</div>
              <div className="sval" style={{ color: 'var(--green)' }}>{energyLevel}%</div>
              <div className="sch up">{L('Good shape', 'حالة جيدة')}</div>
            </div>
            <div className="stat">
              <div className="slbl">📅 {L('Posts This Week', 'منشورات هذا الأسبوع')}</div>
              <div className="sval">4</div>
              <div className="sch nu">{L('Recommended: 5', 'الموصى به: ٥')}</div>
            </div>
            <div className="stat">
              <div className="slbl">⏱️ {L('Avg Creation Time', 'متوسط وقت التحضير')}</div>
              <div className="sval">2.4h</div>
              <div className="sch nu">{L('per post', 'لكل منشور')}</div>
            </div>
            <div className="stat">
              <div className="slbl">😴 {L('Rest Days', 'أيام الراحة')}</div>
              <div className="sval">6</div>
              <div className="sch up">{L('On track', 'على المسار')}</div>
            </div>
          </div>
          <div className="g2">
            <div className="card mb">
              <div className="sh"><div className="st">{L('Weekly Energy', 'مستوى الطاقة الأسبوعي')}</div></div>
              <div id="burn-weeks" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(DB.burnWeeks[lang] || []).map((w, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderBottom: i < DB.burnWeeks[lang].length - 1 ? '1px solid var(--edge)' : 'none' }}>
                    <div style={{ fontSize: '12px', color: 'var(--t2)', width: '80px', flexShrink: 0 }}>{w.w}</div>
                    <div style={{ flex: 1 }}>
                      <div className="gbw" style={{ height: '6px', background: 'var(--surface3)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div className="gbf" style={{ width: `${w.e}%`, background: w.e > 75 ? 'var(--green)' : w.e > 50 ? 'var(--amber)' : 'var(--red)', height: '100%' }}></div>
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t1)', marginLeft: '8px' }}>{w.e}%</div>
                    <div style={{ fontSize: '11px', color: 'var(--t2)' }}>{w.posts} {L('posts', 'منشور')}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--edge)' }}>
                <div style={{ fontSize: '12px', color: 'var(--t2)', marginBottom: '7px' }}>{L('Log today\'s energy', 'سجل طاقتك اليوم')}</div>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                  {[
                    { label: L('😩 Exhausted', '😩 مرهق'), level: 20, emoji: '😩' },
                    { label: L('😐 Tired', '😐 متعب'), level: 40, emoji: '😐' },
                    { label: L('🙂 OK', '🙂 عادي'), level: 65, emoji: '🙂' },
                    { label: L('😊 Good', '😊 جيد'), level: 80, emoji: '😊' },
                    { label: L('🔥 Amazing', '🔥 رائع'), level: 100, emoji: '🔥' }
                  ].map(lvl => (
                    <button
                      key={lvl.level}
                      className={`btn ${energyLevel === lvl.level ? 'btn-prime' : 'btn-ghost'}`}
                      onClick={() => {
                        setEnergyLevel(lvl.level);
                        setEnergyLoggedEmoji(lvl.emoji);
                        alert(L(`Energy logged: ${lvl.emoji}`, `تم تسجيل الطاقة: ${lvl.emoji}`));
                      }}
                      style={{ fontSize: '12px' }}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="card mb">
              <div className="sh"><div className="st">{L('AI Analysis', 'تحليل الذكاء')}</div></div>
              <div id="burn-ai">
                <div className="ai" style={{ padding: '12px', background: 'var(--orange-dim)', borderRadius: '8px', border: '1px solid var(--orange-d)' }}>
                  {getBurnoutAIAnalysis()}
                </div>
              </div>
            </div>
          </div>
          <div className="card mb">
            <div className="sh"><div className="st">{L('Recovery Tips', 'نصائح الاستشفاء والراحة')}</div></div>
            <div className="g3" id="burn-tips-list">
              {(DB.burnTips[lang] || []).map((tItem, idx) => (
                <div className="card" key={idx} style={{ textAlign: 'center', background: 'var(--surface2)' }}>
                  <div style={{ fontSize: '24px', marginBottom: '7px' }}>{tItem.e}</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)', marginBottom: '5px' }}>{tItem.t}</div>
                  <div style={{ fontSize: '12px', color: 'var(--t2)' }}>{tItem.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
