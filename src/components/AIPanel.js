'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { GUIDE_FLOWS } from '../data/mockData';
import { callClaudeAPI } from '../utils/ai';
import { parseMarkdown } from '../utils/markdown';

export default function AIPanel() {
  const {
    lang,
    theme,
    GC,
    t,
    L,
    aiPanelOpen,
    setAiPanelOpen,
    currentPage,
    setCurrentPage,
    aiQuery,
    setAiQuery,
    mobileMenuOpen,
    setMobileMenuOpen,
    guideActive,
    setGuideActive,
    guideFlowKey,
    setGuideFlowKey,
    guideStepIdx,
    setGuideStepIdx
  } = useBusiness();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Guide Mode State
  const [guideStepText, setGuideStepText] = useState('Choose a guide walkthrough below.');
  const overlaysRef = useRef([]);

  // Voice Input State
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef(null);

  const chatBodyRef = useRef(null);
  const panelRef = useRef(null);

  // Close panel on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      // If a guide walkthrough is active, do not close the panel on outside clicks
      if (guideActive) {
        return;
      }
      if (aiPanelOpen && panelRef.current && !panelRef.current.contains(event.target)) {
        // If the target element is detached from the document body, ignore it (common React re-render behavior)
        if (!document.body.contains(event.target)) {
          return;
        }
        const isToggle = event.target.closest('.tb-icon') || 
                         event.target.closest('.btn-ai') || 
                         event.target.closest('.sidebar-ai-btn') || 
                         event.target.closest('.ai-qa-btn') ||
                         event.target.closest('.guide-tooltip') ||
                         event.target.closest('.guide-highlight');
        const isModal = event.target.closest('.modal-overlay') || event.target.closest('.modal-box') || event.target.closest('#toast');
        if (!isToggle && !isModal) {
          setAiPanelOpen(false);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [aiPanelOpen, guideActive, setAiPanelOpen]);

  // Add initial message on mount
  useEffect(() => {
    setMessages([
      {
        sender: 'ai',
        text: L(
          "Hello! I'm your AI business partner. What would you like to work on today?",
          "أهلاً بك! أنا شريكك الذكي في العمل. ماذا تحب أن ننجز اليوم؟"
        )
      }
    ]);
  }, [lang]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, aiPanelOpen]);

  // Cleanup guide overlays on close or unmount
  useEffect(() => {
    if (!aiPanelOpen) {
      clearGuideOverlays();
      stopVoiceInput();
      setGuideActive(false);
      setGuideFlowKey('');
    }
  }, [aiPanelOpen]);

  // Sync with global query trigger
  useEffect(() => {
    if (aiQuery) {
      setAiPanelOpen(true);
      askAI(aiQuery);
      setAiQuery('');
    }
  }, [aiQuery]);

  // FAQ Buttons with associated navigation destinations
  const faqs = lang === 'ar' ? [
    { q: 'كيف أضيف عميل جديد؟ (إدارة العملاء)', nav: 'crm' },
    { q: 'كيف أدير مشاريعي؟ (المهام)', nav: 'tasks' },
    { q: 'كيف أسجل مبيعاتي؟ (المالية)', nav: 'finance' },
    { q: 'كيف أكتب محتوى ذكي؟ (المحتوى)', nav: 'content' },
    { q: 'كيف أربط حساب التليجرام الخاص بي؟ (المساعد التلقائي)', nav: 'telegram' },
    { q: 'كيف أنشئ رابط بايولينك مخصص؟ (أستوديو التصميم)', nav: 'design' },
    { q: 'كيف أربط حساب الفيس والانستا لجلب المتابعين؟', nav: 'social' },
    { q: 'كيف أعدل ألوان النظام واللوجو؟ (الإعدادات)', nav: 'profile' },
    { q: 'كيف أضيف أعضاء فريق عمل جدد؟ (الفريق)', nav: 'team' },
    { q: 'كيف أغير عملة النظام الافتراضية؟ (المالية)', nav: 'finance' }
  ] : [
    { q: 'How to add a new lead? (CRM)', nav: 'crm' },
    { q: 'How to manage my tasks? (Tasks)', nav: 'tasks' },
    { q: 'How to record sales? (Finance)', nav: 'finance' },
    { q: 'How to generate AI content? (Content)', nav: 'content' },
    { q: 'How to connect my Telegram Bot? (Telegram Hub)', nav: 'telegram' },
    { q: 'How to build my Bio Link page? (Design Studio)', nav: 'design' },
    { q: 'How to connect Facebook/Instagram for followers?', nav: 'social' },
    { q: 'How to change colors and branding? (Settings)', nav: 'profile' },
    { q: 'How to invite team members? (Team)', nav: 'team' },
    { q: 'How to change default currency? (Finance)', nav: 'finance' }
  ];

  const handleFaqClick = (faq) => {
    if (faq.nav) {
      setCurrentPage(faq.nav);
    }
    askAI(faq.q);
  };

  const getContextSummary = () => {
    try {
      const entries = GC?.finance?.entries || [];
      const revenue = entries
        .filter(e => e && e.type === 'income')
        .reduce((a, b) => a + Number(b.amount || 0), 0);
      return `Business: ${GC?.profile?.name || 'Unnamed'} | Niche: ${GC?.profile?.niche || 'Not set'} | Stage: ${GC?.profile?.stage || 'Idea'} | Leads: ${(GC?.crm?.leads || []).length} | Tasks: ${(GC?.tasks?.items || []).length} | Monthly Revenue: $${revenue}`;
    } catch (e) {
      return 'Business context loading...';
    }
  };

  const askAI = async (question) => {
    if (!question.trim()) return;

    // Append user message only at first
    setMessages(prev => [
      ...prev,
      { sender: 'user', text: question }
    ]);
    setLoading(true);

    try {
      const context = getContextSummary();
      const leadsCount = (GC?.crm?.leads || []).length;
      const tasksCount = (GC?.tasks?.items || []).length;
      
      const systemPrompt = `You are Business Architect AI, a premium business partner, consultant, and operating system assistant for the UpKlick software.
Context about this user: ${context}
You have access to their CRM (${leadsCount} leads), tasks (${tasksCount} tasks), and finance data inside the platform.

Your goal is to help the user grow, manage, and optimize their business using UpKlick. 
You should act as an advanced business consultant, copywriter, strategist, and guide. 
Provide detailed, friendly, and actionable answers. You are fully capable of writing social media copy, brainstorming product/course concepts, recommending sales strategies, analyzing their current stats (like leads and finances), and explaining how to use UpKlick tools.
Ensure you remain helpful for any business or copywriting inquiry. If a query is completely off-topic (e.g. cooking recipes, history trivia, general coding outside this app), politely steer the conversation back to their business growth and how they can build operations here.

Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;

      const constraintInstruction = lang === 'ar'
        ? `[تعليمات: ركّز إجابتك على مساعدة المستخدم في إدارة وتنمية أعماله وصناعة المحتوى مستخدماً أدوات منصة UpKlick وسياق البزنس الخاص به هنا.]`
        : `[Instruction: Focus your answer on helping the user manage and grow their business or create content using the tools of the UpKlick platform.]`;

      const formattedQuestion = `${constraintInstruction}\n\nQuestion: ${question}`;

      let hasReceivedFirstChunk = false;
      const resText = await callClaudeAPI(
        formattedQuestion, 
        systemPrompt, 
        lang, 
        GC, 
        'AI Assistant', 
        (chunk) => {
          if (!hasReceivedFirstChunk) {
            hasReceivedFirstChunk = true;
            setLoading(false); // Turn off loading bubble as first chunk arrives
            setMessages(prev => [
              ...prev,
              { sender: 'ai', text: chunk }
            ]);
          } else {
            setMessages(prev => {
              if (prev.length === 0) return prev;
              const next = [...prev];
              const lastIdx = next.length - 1;
              const last = next[lastIdx];
              if (last && last.sender === 'ai') {
                next[lastIdx] = {
                  ...last,
                  text: last.text + chunk
                };
              }
              return next;
            });
          }
        }
      );

      if (!hasReceivedFirstChunk || !resText) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: L(
              "I'm sorry, I am a dedicated assistant for the UpKlick platform and your business operations inside it. I cannot answer questions outside this scope.",
              "عذراً، أنا هنا لمساعدتك في منصة UpKlick وإدارة أعمالك داخل التطبيق فقط. لا يمكنني الإجابة على أسئلة خارجة عن هذا النطاق."
            )
          }
        ]);
      }
    } catch (e) {
      console.error('AI Panel askAI error:', e);
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: L('Could not reach AI. Check connection.', 'لم نتمكن من الوصول للذكاء الاصطناعي. تحقق من الاتصال.')
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    askAI(input);
    setInput('');
  };

  // ─── GUIDE MODE IMPLEMENTATION ───
  const startGuideMode = () => {
    setGuideActive(true);
    setGuideStepText(L('Choose a walkthrough task below to start:', 'اختر مهمة إرشادية من الأسفل للبدء:'));

    setMessages(prev => [
      ...prev,
      {
        sender: 'ai',
        text: L(
          "🧭 **Guide mode activated!** Choose what you want to do and I'll walk you through it step by step with visual arrows. Or just type what you need help with!",
          "🧭 **تم تفعيل وضع المرشد!** اختر ما تريد فعله وسأقوم بإرشادك خطوة بخطوة بالأسهم البصرية. أو اكتب ما تحتاج المساعدة فيه!"
        )
      }
    ]);
  };

  const runGuideFlow = (flowKey) => {
    const flow = GUIDE_FLOWS[flowKey];
    if (!flow) return;
    setGuideFlowKey(flowKey);
    setGuideStepIdx(0);
    setMessages(prev => [
      ...prev,
      { sender: 'ai', text: L(`Let's go! Follow the highlights 🧭`, `لنبدأ! تتبع الإشارات المضيئة 🧭`) }
    ]);
    showGuideStep(flowKey, 0);
  };

  const showGuideStep = (flowKey, stepIdx) => {
    const flow = GUIDE_FLOWS[flowKey];
    if (!flow || stepIdx >= flow.steps.length) {
      finishGuideFlow(flowKey);
      return;
    }

    const step = flow.steps[stepIdx];
    clearGuideOverlays();
    setGuideStepIdx(stepIdx);
    setGuideStepText(L(`Step ${stepIdx + 1} of ${flow.steps.length}: ${step.text}`, `الخطوة ${stepIdx + 1} من ${flow.steps.length}: ${step.textAr || step.text}`));

    // Navigate to page if defined
    if (step.nav) {
      setCurrentPage(step.nav);
    }

    // Mobile Sidebar Handling: Open sidebar if target is sidebar-related; otherwise, close it.
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const isSidebarTarget = step.target.includes('onclick*="crm"') || 
                            step.target.includes('onclick*="tasks"') || 
                            step.target.includes('onclick*="finance"') || 
                            step.target.includes('onclick*="profile"') || 
                            step.target.includes('onclick*="content"') || 
                            step.target.includes('sb-') || 
                            step.target.includes('#sb') || 
                            step.target.includes('.sb-');
                            
    let delay = step.nav ? 500 : 150;
    
    if (isMobile) {
      const shouldOpen = !!isSidebarTarget;
      if (mobileMenuOpen !== shouldOpen) {
        setMobileMenuOpen(shouldOpen);
        delay = 550; // Give sufficient time for slide animation transition (normally 300ms)
      }
    }

    setTimeout(() => {
      // Find element in rendered DOM
      let selector = step.target;
      // Adapt selector to match React structure
      if (selector.includes('onclick*="crm"')) selector = '[id="sb-crm"], .sb-btn[onClick*="crm"]';
      if (selector.includes('onclick*="tasks"')) selector = '[id="sb-tasks"], .sb-btn[onClick*="tasks"]';
      if (selector.includes('onclick*="finance"')) selector = '[id="sb-finance"], .sb-btn[onClick*="finance"]';
      if (selector.includes('onclick*="profile"')) selector = '[id="sb-profile"], .sb-btn[onClick*="profile"]';
      if (selector.includes('onclick*="content"')) selector = '[id="sb-content"], .sb-btn[onClick*="content"]';
      
      let targetEl = document.querySelector(selector);
      if (!targetEl) {
        // Try fallback selector strategies
        if (selector.includes('crm')) targetEl = document.querySelector('.sb-btn:nth-child(3)');
        else if (selector.includes('tasks')) targetEl = document.querySelector('.sb-btn[onClick*="tasks"]');
        else if (selector.includes('finance')) targetEl = document.querySelector('.sb-btn[onClick*="finance"]');
      }

      if (targetEl) {
        showGuideHighlight(targetEl, L(step.text, step.textAr || step.text), stepIdx, flow.steps.length, flowKey);
      } else {
        // Skip
        showGuideStep(flowKey, stepIdx + 1);
      }
    }, delay);
  };

  const showGuideHighlight = (el, text, stepIdx, totalSteps, flowKey) => {
    el.scrollIntoView({ behavior: 'auto', block: 'center' });
    const rect = el.getBoundingClientRect();

    // Create highlight box overlay
    const highlight = document.createElement('div');
    highlight.className = 'guide-highlight';
    highlight.style.cssText = `top:${rect.top - 4 + window.scrollY}px;left:${rect.left - 4 + window.scrollX}px;width:${rect.width + 8}px;height:${rect.height + 8}px;position:absolute;z-index:9999;border:2px solid var(--orange);border-radius:6px;box-shadow:0 0 10px var(--orange);pointer-events:none;`;
    document.body.appendChild(highlight);
    overlaysRef.current.push(highlight);

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'guide-tooltip';

    let ttTop = rect.bottom + 10 + window.scrollY;
    let ttLeft = rect.left + window.scrollX;

    if (rect.bottom + 120 > window.innerHeight) {
      ttTop = rect.top - 10 + window.scrollY - 80;
    }
    if (ttLeft + 240 > window.innerWidth) {
      ttLeft = window.innerWidth - 250;
    }

    tooltip.style.cssText = `top:${ttTop}px;left:${ttLeft}px;position:absolute;z-index:10000;background:var(--surface3);border:1px solid var(--edge2);border-radius:8px;padding:12px;width:220px;box-shadow:0 4px 12px rgba(0,0,0,.3);color:var(--t1);font-size:12px;pointer-events:auto;`;
    
    // Tooltip Content
    const isLast = stepIdx + 1 === totalSteps;
    tooltip.innerHTML = `
      <div style="margin-bottom:8px;line-height:1.4">${t(text)}</div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:10px;opacity:.7">${stepIdx + 1} / ${totalSteps}</span>
        <div style="display:flex;gap:6px">
          <button id="guide-cancel-btn" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:4px;color:var(--t2);padding:3px 8px;cursor:pointer;font-size:11px">
            ${L('Cancel', 'إلغاء')}
          </button>
          <button id="guide-next-btn" style="background:var(--orange);border:none;border-radius:4px;color:#fff;padding:3px 8px;cursor:pointer;font-size:11px;font-weight:600">
            ${isLast ? L('Done ✓', 'تم ✓') : L('Next →', 'التالي →')}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(tooltip);
    overlaysRef.current.push(tooltip);

    // Attach click handlers
    const cancelBtn = tooltip.querySelector('#guide-cancel-btn');
    if (cancelBtn) {
      cancelBtn.onclick = () => {
        clearGuideOverlays();
        setGuideActive(false);
        setGuideFlowKey('');
      };
    }

    const btn = tooltip.querySelector('#guide-next-btn');
    if (btn) {
      btn.onclick = () => {
        if (isLast) {
          finishGuideFlow(flowKey);
        } else {
          showGuideStep(flowKey, stepIdx + 1);
        }
      };
    }
  };

  const clearGuideOverlays = () => {
    overlaysRef.current.forEach(el => {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
    overlaysRef.current = [];
  };

  const finishGuideFlow = (flowKey) => {
    clearGuideOverlays();
    setGuideActive(false);
    setGuideFlowKey('');
    setMessages(prev => [
      ...prev,
      {
        sender: 'ai',
        text: L(
          `✅ **Walkthrough complete!** Great job. Need help with anything else?`,
          `✅ **اكتمل الإرشاد البصري!** عمل ممتاز. هل تحتاج مساعدة في أي شيء آخر؟`
        )
      }
    ]);
  };

  // ─── VOICE INPUT IMPLEMENTATION ───
  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(L('Voice input is not supported in this browser.', 'إدخال الصوت غيرsupported في هذا المتصفح.'));
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = lang === 'ar' ? 'ar-SA' : 'en-US';

     rec.onstart = () => {
      setVoiceActive(true);
      setVoiceStatus(L('Listening... speak now', 'جاري الاستماع... تحدث الآن'));
      setVoiceTranscript('');
    };

    rec.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setVoiceTranscript(transcript);
      setInput(transcript);
    };

    rec.onend = () => {
      setVoiceActive(false);
    };

    rec.onerror = (e) => {
      setVoiceActive(false);
      setVoiceStatus(e.error === 'not-allowed' ? L('Mic access denied', 'تم رفض الوصول للميكروفون') : e.error);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setVoiceActive(false);
  };

  const toggleVoiceInput = () => {
    if (voiceActive) {
      stopVoiceInput();
    } else {
      startVoiceInput();
    }
  };

  if (!aiPanelOpen) return null;

  return (
    <div 
      id="ai-panel" 
      className="open" 
      ref={panelRef}
      style={{
        transform: (guideActive && guideFlowKey) ? 'translateX(105%)' : 'translateX(0)',
        opacity: (guideActive && guideFlowKey) ? 0 : 1,
        pointerEvents: (guideActive && guideFlowKey) ? 'none' : 'auto',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div className="ai-panel-hd">
        <div className="ai-panel-title">
          <div className="ai-status-dot"></div>
          {t('AI Assistant')}
        </div>
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          <button
            className="tb-icon"
            onClick={startGuideMode}
            style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderColor: 'rgba(255,107,53,.3)', color: 'var(--orange)' }}
            title={L("Guided Walkthrough", "إرشاد تفاعلي")}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
          </button>
          <button
            className="tb-icon"
            onClick={() => setAiPanelOpen(false)}
            style={{ width: '28px', height: '28px', fontSize: '13px' }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Guide Mode Banner */}
      {guideActive && (
        <div
          id="ai-guide-banner"
          style={{
            background: 'linear-gradient(135deg,var(--orange-d),var(--purple-dim))',
            borderBottom: '1px solid var(--edge)',
            padding: '10px 14px'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--orange)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            <span>{L('Guide Mode Active', 'وضع المرشد نشط')}</span>
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--t1)' }}>{guideStepText}</div>
          <div style={{ display: 'flex', gap: '5px', marginTop: '8px', flexWrap: 'wrap' }}>
            {Object.keys(GUIDE_FLOWS).map(k => (
              <button
                key={k}
                className="btn btn-ghost"
                style={{ fontSize: '11px', padding: '4px 10px', borderColor: 'rgba(255,107,53,.3)' }}
                onClick={() => runGuideFlow(k)}
              >
                {L(GUIDE_FLOWS[k].title, GUIDE_FLOWS[k].titleAr || GUIDE_FLOWS[k].title)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice Input Banner */}
      {voiceActive && (
        <div
          id="ai-voice-banner"
          style={{
            background: 'var(--red-d)',
            borderBottom: '1px solid rgba(255,61,110,.2)',
            padding: '8px 14px',
            textAlign: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: 'var(--red)', fontWeight: 600 }}>
            <span style={{ display: 'inline-flex', animation: 'pulse 1.5s infinite ease-in-out' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </span>
            {voiceStatus}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--t2)', marginTop: '3px' }}>{voiceTranscript}</div>
        </div>
      )}

      {/* Messages List */}
      <div className="ai-panel-body" id="ai-chat-body" ref={chatBodyRef}>
        {/* Quick actions buttons grid */}
        {!loading && (
          <div className="ai-quick-actions" style={{ marginBottom: '14px', marginTop: '4px' }}>
            {faqs.map((faq, index) => (
              <button
                className="ai-qa-btn"
                key={index}
                onClick={() => handleFaqClick(faq)}
              >
                {faq.q}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, idx) => (
          <div className="ai-chat-msg" key={idx}>
            <div className="ai-msg-label">{m.sender === 'user' ? t('You') : t('Business Architect AI')}</div>
            <div
              className={m.sender === 'user' ? 'ai-msg-user' : 'ai-msg-ai'}
              dangerouslySetInnerHTML={{ __html: parseMarkdown(m.text) }}
            ></div>
          </div>
        ))}
        {loading && (
          <div className="ai-chat-msg">
            <div className="ai-msg-label">{t('Business Architect AI')}</div>
            <div className="ai-msg-ai ai-thinking">
              {L('Analyzing business context...', 'جاري تحليل سياق البزنس...')}
            </div>
          </div>
        )}
      </div>

      <div className="ai-panel-foot" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <input
          className="inp"
          id="ai-inp"
          placeholder={L("Ask anything...", "اسأل أي شيء...")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          style={{ flex: 1, fontSize: '12.5px', padding: '8px 12px' }}
        />
        <button 
          className="btn" 
          onClick={toggleVoiceInput}
          style={{
            padding: '8px',
            flexShrink: 0,
            width: '35px',
            height: '35px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '15px',
            background: voiceActive ? 'rgba(255, 59, 48, 0.15)' : 'var(--s2)',
            border: voiceActive ? '1px solid var(--red)' : '1px solid var(--edge)',
            color: voiceActive ? 'var(--red)' : 'var(--t2)',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
          title={L("Voice Input", "إدخال صوتي")}
        >
          {voiceActive ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          )}
        </button>
        <button className="btn btn-prime" style={{ padding: '8px 12px', flexShrink: 0 }} onClick={handleSend}>
          ➤
        </button>
      </div>
    </div>
  );
}
