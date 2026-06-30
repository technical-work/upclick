'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { DB, tvDB, soundsDB } from '../../data/mockData';
import { callClaudeAPI } from '../../utils/ai';

export default function ContentView() {
  const { lang, L, t, GC, saveGC } = useBusiness();

  // Tab state inside Content Hub
  const [activeSubTab, setActiveSubTab] = useState('ct-cal'); // 'ct-cal', 'ct-ideas', etc.

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
  const [todayIdeas, setTodayIdeas] = useState([]);
  const savedIdeas = GC.contentHub?.savedIdeas || [];

  const handleGenIdeas = () => {
    setTodayIdeas(DB.ideas[lang] || []);
    alert(L('5 new ideas generated! ✨', 'تم توليد ٥ أفكار جديدة! ✨'));
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
  const [capInp, setCapInp] = useState('');
  const [selectedTone, setSelectedTone] = useState(0); // 0: Funny, 1: Educational, 2: Emotional, 3: CTA
  const [generatedCaptions, setGeneratedCaptions] = useState([]);
  const [generatingCaptions, setGeneratingCaptions] = useState(false);

  const handleGenCaps = async () => {
    if (!capInp.trim()) {
      alert(L('Please enter a description first', 'الرجاء كتابة وصف المنشور أولاً'));
      return;
    }
    setGeneratingCaptions(true);
    setGeneratedCaptions([]);

    const tones = ['Funny', 'Educational', 'Emotional', 'CTA'];
    const prompt = `Generate 3 captions with tone: ${tones[selectedTone]} for a post about: "${capInp}". Language: ${lang}. Focus on Arab audience. Output them as a list.`;
    const sysPrompt = 'Arabic/English social media copywriter. Engaging, specific, emojis included.';

    try {
      const reply = await callClaudeAPI(prompt, sysPrompt, lang);
      const splitCaps = reply.split('\n\n').filter(Boolean).map(c => c.replace(/^\d+[\.\s]/, '').trim());
      setGeneratedCaptions(splitCaps.length > 0 ? splitCaps : [reply]);
    } catch (e) {
      // Fallback captions
      const fallbacks = DB.capSets[lang] && DB.capSets[lang][selectedTone] || ['Generated caption fallback'];
      setGeneratedCaptions(fallbacks);
    } finally {
      setGeneratingCaptions(false);
    }
  };

  // 4. Script Writer Tab States
  const [scrTopic, setScrTopic] = useState('');
  const [scrPlatform, setScrPlatform] = useState('Instagram Reel (30–60s)');
  const [scrStyle, setScrStyle] = useState('Educational + Tips');
  const [scrHookType, setScrHookType] = useState('question'); // 'question', 'stat', 'pov', 'story', 'challenge'
  const [generatedScript, setGeneratedScript] = useState('');
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
    } catch (e) {
      console.warn("AI generation failed, trying fallback:", e);
      if (fallbackFn) {
        fallbackFn();
      } else {
        outputSetter(isArrayOutput ? ['Error generating content'] : 'Error generating content');
      }
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
    };

    await triggerContentAI('Script Writer', setGeneratingScript, setGeneratedScript, prompt, sysPrompt, false, fallbackFn);
  };

  const handleCopyScript = () => {
    if (!generatedScript) return;
    navigator.clipboard.writeText(generatedScript).then(() => {
      alert(L('Script copied to clipboard!', 'تم نسخ السكريبت للحافظة!'));
    });
  };

  // 5. Trending Videos Tab States
  const [tvPlatform, setTvPlatform] = useState('TikTok');
  const [tvSelectedTrend, setTvSelectedTrend] = useState('Morning Routine Format');
  const [trendIdeasOut, setTrendIdeasOut] = useState('');
  const [generatingTrendVersion, setGeneratingTrendVersion] = useState(false);

  const getTrendingVideos = () => {
    return (tvDB[tvPlatform] && tvDB[tvPlatform][lang]) || (tvDB[tvPlatform] && tvDB[tvPlatform].en) || [];
  };

  const handleGenFromTrend = async (customTrendTitle = null) => {
    const targetTrend = customTrendTitle || tvSelectedTrend;
    const prompt = `Write a viral version/ideas of the following social media trend: "${targetTrend}" for my niche. Language: ${lang}. Offer actionable steps.`;
    const sysPrompt = 'Viral video ideator specializing in MENA niche audience targeting.';

    const fallbackFn = () => {
      setTrendIdeasOut(L('Click "Generate My Version" to customize your script.', 'اضغط على زر توليد نسختي للحصول على أفكار مخصصة.'));
    };

    await triggerContentAI('Gen From Trend', setGeneratingTrendVersion, setTrendIdeasOut, prompt, sysPrompt, false, fallbackFn);
  };

  // 6. Repurpose Tab States
  const [repInp, setRepInp] = useState('');
  const [repType, setRepType] = useState('Instagram Reel script');
  const [repOutputs, setRepOutputs] = useState([]);
  const [repurposing, setRepurposing] = useState(false);

  const handleRepurposeContent = async () => {
    if (!repInp.trim()) {
      alert(L('Please enter original content first', 'الرجاء إدخال المحتوى الأصلي أولاً'));
      return;
    }

    const prompt = `Repurpose the following content into 5 formats: 1. Reel script, 2. Twitter Thread, 3. Email Newsletter, 4. Carousel slides layout, 5. Blog intro paragraph. Original format: ${repType}. Content: "${repInp}". Language: ${lang}.`;
    const sysPrompt = 'Content repurposing machine. Return the 5 formats labeled clearly.';

    const fallbackFn = () => {
      setRepOutputs(lang === 'ar'
        ? ['١. سكريبت ريل معاد صياغته', '٢. ثريد تويتر', '٣. نيوزليتر إيميل', '٤. تصميم شرائح كاروسيل', '٥. مقدمة مقال']
        : ['1. Repurposed Reel script', '2. Twitter Thread', '3. Email newsletter', '4. Carousel slides outline', '5. Blog post intro']
      );
    };

    await triggerContentAI('Repurpose', setRepurposing, setRepOutputs, prompt, sysPrompt, true, fallbackFn);
  };

  // 7. Radar Tab (Trends) Lists
  const hotRadar = DB.trendHot[lang] || [];
  const emergingRadar = DB.trendEmer[lang] || [];
  const soonRadar = DB.trendSoon[lang] || [];
  const audioRadar = DB.trendAudio || [];

  // 8. Q&A Tab States
  const [qaInp, setQaInp] = useState('');
  const [qaStyle, setQaStyle] = useState('Friendly & Casual');
  const [qaFormat, setQaFormat] = useState('Story reply');
  const [qaAnswer, setQaAnswer] = useState('');
  const [generatingQA, setGeneratingQA] = useState(false);

  const handleGenQA = async () => {
    if (!qaInp.trim()) {
      alert(L('Please enter a question first', 'الرجاء إدخال السؤال أولاً'));
      return;
    }

    const prompt = `Create an answer to this question: "${qaInp}". Style: ${qaStyle}. Format: ${qaFormat}. Language: ${lang}. Write the output directly as if you are replying.`;
    const sysPrompt = 'Personal assistant answering community questions in an engaging style.';

    const fallbackFn = () => {
      setQaAnswer(L('Reply answer generated.', 'تم توليد الرد.'));
    };

    await triggerContentAI('Community Q&A', setGeneratingQA, setQaAnswer, prompt, sysPrompt, false, fallbackFn);
  };

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
          { key: 'ct-cal', label: L('Calendar', 'تقويم النشر'), emoji: '📅' },
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

      {/* ================= CALENDAR PANEL ================= */}
      {activeSubTab === 'ct-cal' && (
        <div className="tool-panel on" id="ct-cal">
          <div className="g21">
            <div className="card mb">
              <div className="sh" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button className="btn-chevron" onClick={handlePrevMonth} title={L('Previous Month', 'الشهر السابق')}>◀</button>
                  <div className="st" style={{ fontSize: '15px', fontWeight: 800, minWidth: '110px', textAlign: 'center' }}>
                    {L(`${monthNamesEn[currentMonth]} ${currentYear}`, `${monthNamesAr[currentMonth]} ${currentYear}`)}
                  </div>
                  <button className="btn-chevron" onClick={handleNextMonth} title={L('Next Month', 'الشهر التالي')}>▶</button>
                </div>
                <button className="btn btn-prime" style={{ padding: '5px 12px', fontSize: '11.5px' }} onClick={() => handleAddPostClick(selectedDay)}>
                  + {L('Add Post', 'منشور جديد')}
                </button>
              </div>
              <div className="cald" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '6px' }}>
                {(lang === 'ar' ? ['أح', 'اث', 'ثلا', 'أر', 'خم', 'جم', 'سب'] : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']).map(d => (
                  <div className="cal-lbl" style={{ fontWeight: 600, fontSize: '11px', color: 'var(--t2)' }} key={d}>{d}</div>
                ))}
              </div>
              <div className="cald" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                {gridCells.map((day, idx) => {
                  if (day === null) {
                    return (
                      <div 
                        key={`empty-${idx}`} 
                        style={{ 
                          aspectRatio: '1', 
                          background: 'transparent', 
                          border: '1px dashed rgba(255, 255, 255, 0.05)',
                          borderRadius: '6px'
                        }} 
                      />
                    );
                  }

                  const dayEvents = visibleEvents.filter(e => e.day === day && e.type === 'content');
                  const hasEv = dayEvents.length > 0;
                  const isToday = day === tDay && currentMonth === tMonth && currentYear === tYear;
                  const isSelected = day === selectedDay;

                  return (
                    <div 
                      key={`day-${day}`}
                      className={`cal-day cal-day-cell ${hasEv ? 'has-event' : ''} ${isToday ? 'today' : ''}`}
                      style={{
                        aspectRatio: '1',
                        padding: '8px 6px',
                        borderRadius: '8px',
                        background: isToday 
                          ? 'linear-gradient(135deg, var(--orange-d), var(--purple-dim))' 
                          : isSelected 
                            ? 'var(--surface3)' 
                            : 'var(--surface2)',
                        border: isToday 
                          ? '2px solid var(--orange)' 
                          : isSelected 
                            ? '2px solid var(--purple)' 
                            : hasEv 
                              ? '1px solid rgba(255,107,53,0.3)' 
                              : '1px solid var(--edge)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'stretch',
                        fontSize: '13px',
                        fontWeight: isToday || isSelected ? 700 : 500,
                        color: isToday ? 'var(--orange)' : isSelected ? 'var(--purple)' : 'var(--t1)',
                        boxShadow: isSelected ? '0 0 10px rgba(108, 53, 255, 0.25)' : 'none',
                        minWidth: 0,
                        overflow: 'hidden'
                      }}
                      onClick={() => handleAddPostClick(day)}
                    >
                      {/* Day Number Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '4px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700 }}>{day}</span>
                        {isToday && (
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--orange)', boxShadow: '0 0 6px var(--orange)' }} />
                        )}
                      </div>
                      
                      {/* Event pills */}
                      {hasEv && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%', overflow: 'hidden' }}>
                          {dayEvents.slice(0, 2).map((ev, i) => (
                            <div 
                              key={ev.id} 
                              style={{ 
                                width: '100%', 
                                fontSize: '9.5px', 
                                padding: '2px 4px', 
                                borderRadius: '4px', 
                                background: 'rgba(108, 53, 255, 0.12)', 
                                color: 'var(--purple)',
                                borderLeft: '2.5px solid var(--purple)',
                                textAlign: lang === 'ar' ? 'right' : 'left',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                boxSizing: 'border-box',
                                lineHeight: '1.2'
                              }}
                              title={`${ev.time} - ${ev.title}`}
                            >
                              <span style={{ fontWeight: 700, marginRight: '3px' }}>{ev.time.replace(/ AM| PM/g, '')}</span>
                              {ev.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div style={{ fontSize: '8.5px', color: 'var(--t3)', fontWeight: 700, paddingLeft: '4px', paddingTop: '1px' }}>
                              +{dayEvents.length - 2} {L('more', 'المزيد')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="card mb">
                <div className="sh"><div className="st">🕐 {L('Upcoming', 'القادم قريباً')}</div></div>
                <div id="uplist" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {visibleEvents.filter(e => e.type === 'content').length === 0 ? (
                    <div style={{ fontSize: '12px', color: 'var(--t3)', textAlign: 'center', padding: '12px' }}>
                      {L('No posts scheduled yet.', 'لا توجد منشورات مجدولة بعد.')}
                    </div>
                  ) : (
                    visibleEvents.filter(e => e.type === 'content').map((p, idx) => (
                      <div className="row" key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: '1px solid var(--edge)' }}>
                        <div style={{ fontSize: '16px' }}>📱</div>
                        <div style={{ flex: 1 }}>
                          <div className="rn" style={{ 
                            fontWeight: 600, 
                            fontSize: '12.5px',
                            display: '-webkit-box',
                            WebkitLineClamp: '2',
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>{p.title}</div>
                          <div className="rs" style={{ fontSize: '11px', color: 'var(--t2)' }}>
                            {L(`Day ${p.day} @ ${p.time}`, `اليوم ${p.day} @ ${p.time}`)}
                          </div>
                        </div>
                        <button 
                          className="btn btn-ghost" 
                          onClick={() => {
                            const updatedEvents = events.filter(ev => ev.id !== p.id);
                            saveGC({ ...GC, calendar: { ...GC.calendar, events: updatedEvents } });
                          }}
                          style={{ padding: '2px 6px', color: 'var(--red)', border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="card mb">
                <div className="sh"><div className="st">📊 {L('Content Mix', 'توزيع المحتوى')}</div></div>
                <div id="cmixlist" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(lang === 'ar' ? [
                    { l: 'ريلز', v: '٨.٢٪', p: 80, c: 'var(--orange)' },
                    { l: 'كاروسيل', v: '٦.١٪', p: 61, c: 'var(--purple)' },
                    { l: 'ستوريز', v: '٤.٣٪', p: 43, c: 'var(--green)' }
                  ] : [
                    { l: 'Reels', v: '8.2%', p: 80, c: 'var(--orange)' },
                    { l: 'Carousel', v: '6.1%', p: 61, c: 'var(--purple)' },
                    { l: 'Stories', v: '4.3%', p: 43, c: 'var(--green)' }
                  ]).map((x, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, fontSize: '12.5px', color: 'var(--t1)' }}>{x.l}</div>
                      <div className="mw" style={{ width: '100px', background: 'var(--surface3)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                        <div className="mf" style={{ width: `${x.p}%`, background: x.c, height: '100%' }}></div>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t1)', marginLeft: '7px' }}>{x.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content Post Scheduling Modal */}
          {showAddModal && (
            <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
              <div className="modal-box" style={{ maxWidth: '500px', padding: '24px' }} onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
                
                <div className="sec-hd" style={{ marginBottom: '16px', borderBottom: '1px solid var(--edge)', paddingBottom: '10px' }}>
                  <div className="sec-title" style={{ fontSize: '16px', fontWeight: 800 }}>
                    ✍️ {L(`Schedule Post: ${monthNamesEn[currentMonth]} ${newPostDay}, ${currentYear}`, `جدولة منشور: ${newPostDay} ${monthNamesAr[currentMonth]}، ${currentYear}`)}
                  </div>
                </div>
                
                <form onSubmit={handleAddPostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Post Title', 'عنوان المنشور')}</label>
                    <input 
                      className="inp" 
                      value={newPostTitle} 
                      onChange={e => setNewPostTitle(e.target.value)} 
                      placeholder={L('e.g. 5 Content Calendar Tips', 'مثال: ٥ نصائح لتقويم المحتوى')} 
                      required 
                      autoFocus
                    />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L(`Day (1-${daysInMonth})`, `اليوم (١-${daysInMonth})`)}</label>
                      <input 
                        className="inp" 
                        type="number" 
                        min="1" 
                        max={daysInMonth} 
                        value={newPostDay} 
                        onChange={e => setNewPostDay(e.target.value)} 
                        required 
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Posting Time', 'وقت النشر')}</label>
                      <input 
                        className="inp" 
                        value={newPostTime} 
                        onChange={e => setNewPostTime(e.target.value)} 
                        placeholder="e.g. 6:00 PM" 
                        required 
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>
                      {L('Cancel', 'إلغاء')}
                    </button>
                    <button type="submit" className="btn btn-prime">
                      + {L('Schedule Post', 'جدولة المنشور')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= IDEAS PANEL ================= */}
      {activeSubTab === 'ct-ideas' && (
        <div className="tool-panel on" id="ct-ideas">
          <div className="sh mb"><button className="btn btn-prime" onClick={handleGenIdeas}>✨ {L('Generate Ideas', 'توليد أفكار')}</button></div>
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
              <button className="btn btn-prime" onClick={handleGenCaps} style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
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
                    <select className="inp" value={scrPlatform} onChange={(e) => setScrPlatform(e.target.value)}>
                      <option>Instagram Reel (30–60s)</option>
                      <option>TikTok (60–90s)</option>
                      <option>YouTube Short</option>
                      <option>YouTube Video (5–10min)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Style', 'الأسلوب')}</label>
                    <select className="inp" value={scrStyle} onChange={(e) => setScrStyle(e.target.value)}>
                      <option>Educational + Tips</option>
                      <option>Story / Personal</option>
                      <option>POV / Trending</option>
                      <option>Tutorial</option>
                      <option>Viral Hook</option>
                    </select>
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
              <div id="script-output" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {!generatedScript ? (
                  <div style={{ fontSize: '12px', color: 'var(--t3)', textAlign: 'center', padding: '36px 0' }}>
                    {L('Fill details and generate script', 'املأ التفاصيل واضغط لكتابة السكريبت')}
                  </div>
                ) : (
                  <div className="ai" style={{ whiteSpace: 'pre-line', fontSize: '12.5px', lineHeight: '1.8' }}>
                    {generatedScript}
                  </div>
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
              <select className="inp" value={tvSelectedTrend} onChange={(e) => setTvSelectedTrend(e.target.value)} style={{ marginStyle: '10px', width: '100%', marginBottom: '10px' }}>
                {getTrendingVideos().map((v, i) => (
                  <option key={i}>{v.t}</option>
                ))}
              </select>
              <button className="btn btn-prime" onClick={() => handleGenFromTrend()} style={{ width: '100%', justifyContent: 'center', marginBottom: '9px' }}>
                🤖 {L('Generate My Version', 'توليد نسختي')}
              </button>
              <div id="trend-ideas-output" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {generatingTrendVersion && (
                  <div className="ai-box" style={{ animation: 'pulse 1.5s infinite' }}>{L('⚡ Rewriting trend format...', '⚡ جاري كتابة أفكار مناسبة...')}</div>
                )}
                {!generatingTrendVersion && !trendIdeasOut && (
                  <div style={{ fontSize: '12px', color: 'var(--t3)' }}>
                    {L('Select a trend and generate ideas', 'اختر ترند من الأعلى لتوليد أفكار مخصصة')}
                  </div>
                )}
                {!generatingTrendVersion && trendIdeasOut && (
                  <div className="ai-box" style={{ whiteSpace: 'pre-line', fontSize: '12.5px', lineHeight: '1.6' }}>
                    {trendIdeasOut}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="card mb">
            <div className="sh"><div className="st">🎵 {L('Trending Sounds', 'أصوات ترند رائجة')}</div></div>
            <div id="trending-sounds-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(soundsDB[lang] || soundsDB.en || []).map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderBottom: i < (soundsDB[lang] || []).length - 1 ? '1px solid var(--edge)' : 'none' }}>
                  <div style={{ fontSize: '20px' }}>🎵</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--t1)' }}>{s.n}</div>
                    <div style={{ fontSize: '11px', color: 'var(--t2)' }}>{s.t} · {s.u} {L('uses', 'استخدام')}</div>
                  </div>
                  {s.h && <span className="badge b-red">🔥 {L('Hot', 'حار')}</span>}
                  <button className="btn btn-ghost" style={{ padding: '3px 9px', fontSize: '11px' }} onClick={() => alert(L('Sound saved! 🎵', 'تم حفظ الصوت! 🎵'))}>
                    {L('Use', 'استخدم')}
                  </button>
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
                <select className="inp" value={repType} onChange={(e) => setRepType(e.target.value)} style={{ width: '100%' }}>
                  <option>Instagram Reel script</option>
                  <option>Blog post / Article</option>
                  <option>YouTube script</option>
                  <option>Podcast points</option>
                </select>
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
                    <div className="ai mb" key={i} style={{ background: 'var(--surface2)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--orange)' }}>
                      <div style={{ fontSize: '12.5px', color: 'var(--t1)', whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                        {fText}
                      </div>
                      <button className="btn btn-ghost" onClick={() => { navigator.clipboard.writeText(fText); alert(L('Copied!', 'تم النسخ!')); }} style={{ marginTop: '6px', padding: '3px 9px', fontSize: '11px' }}>
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
                  <select className="inp" value={qaStyle} onChange={(e) => setQaStyle(e.target.value)} style={{ width: '100%' }}>
                    <option>{L('Friendly & Casual', 'ودود وعفوي')}</option>
                    <option>{L('Educational', 'تعليمي ومفصل')}</option>
                    <option>{L('Short & Inspiring', 'قصير وملهم')}</option>
                    <option>{L('Funny & Relatable', 'مضحك ومقرب')}</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Format', 'الصيغة')}</label>
                  <select className="inp" value={qaFormat} onChange={(e) => setQaFormat(e.target.value)} style={{ width: '100%' }}>
                    <option>{L('Story reply', 'رد ستوري')}</option>
                    <option>{L('Comment reply', 'رد تعليق')}</option>
                    <option>{L('Dedicated Reel', 'ريل مخصص')}</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-prime" onClick={handleGenQA} style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}>
                {generatingQA ? L('Generating...', 'جاري الكتابة...') : L('💬 Generate Answer', '💬 توليد الإجابة')}
              </button>
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--edge)' }}>
                <div style={{ fontSize: '11.5px', color: 'var(--t2)', marginBottom: '7px' }}>{L('Frequently Asked', 'الأسئلة المتكررة')}</div>
                <div id="qa-freq-list" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {(DB.qaFreq[lang] || []).map((qText, idx) => (
                    <div 
                      className="idea" 
                      key={idx} 
                      style={{ background: 'var(--surface2)', padding: '8px 10px', borderRadius: '6px', cursor: 'pointer' }}
                      onClick={() => setQaInp(qText)}
                    >
                      <div style={{ fontSize: '12.5px', color: 'var(--t1)' }}>{qText}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card mb">
              <div className="sh"><div className="st">{L('Generated Answer', 'الرد المقترح')}</div></div>
              <div id="qaout">
                {generatingQA && (
                  <div className="ai-box" style={{ animation: 'pulse 1.5s infinite' }}>{L('⚡ Generating response...', '⚡ جاري صياغة الرد...')}</div>
                )}
                {!generatingQA && !qaAnswer && (
                  <div style={{ fontSize: '12px', color: 'var(--t3)', textAlign: 'center', padding: '36px 0' }}>
                    {L('Type a question and generate', 'اكتب سؤالك على اليسار لتوليد رد ذكي')}
                  </div>
                )}
                {!generatingQA && qaAnswer && (
                  <div className="ai-box" style={{ whiteSpace: 'pre-line', fontSize: '13px', lineHeight: '1.6' }}>
                    {qaAnswer}
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
