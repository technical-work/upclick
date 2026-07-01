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
    setAiQuery
  } = useBusiness();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Guide Mode State
  const [guideActive, setGuideActive] = useState(false);
  const [guideFlowKey, setGuideFlowKey] = useState('');
  const [guideStepIdx, setGuideStepIdx] = useState(0);
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
      if (aiPanelOpen && panelRef.current && !panelRef.current.contains(event.target)) {
        const isToggle = event.target.closest('.tb-icon') || event.target.closest('.btn-ai') || event.target.closest('.sidebar-ai-btn') || event.target.closest('.ai-qa-btn');
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
  }, [aiPanelOpen, setAiPanelOpen]);

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

  // Quick Action Buttons
  const quickActions = L(
    [
      'Analyze my business today',
      'Who should I follow up with?',
      'Summarize this week',
      "What are today's priorities?",
      'Where are my revenue leaks?'
    ],
    [
      'حلل بزنسي اليوم',
      'مين لازم أتابع؟',
      'كم إيراداتي هذا الشهر؟',
      'أعطني ملخص الأسبوع',
      'أولوياتي اليوم؟'
    ]
  );

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

    // Append user message and a placeholder AI message
    setMessages(prev => [
      ...prev,
      { sender: 'user', text: question },
      { sender: 'ai', text: '' }
    ]);
    setLoading(true);

    try {
      const context = getContextSummary();
      const leadsCount = (GC?.crm?.leads || []).length;
      const tasksCount = (GC?.tasks?.items || []).length;
      const systemPrompt = `You are Business Architect AI, a premium business operating system assistant.
Context about this user: ${context}
You have access to their CRM (${leadsCount} leads), tasks (${tasksCount} tasks), and finance data.
Be concise, specific, and actionable. No generic advice. Reference their actual data when available.
Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;

      let hasReceivedFirstChunk = false;
      await callClaudeAPI(
        question, 
        systemPrompt, 
        lang, 
        GC, 
        'AI Assistant', 
        (chunk) => {
          if (!hasReceivedFirstChunk) {
            hasReceivedFirstChunk = true;
            setLoading(false); // Turn off loading spinner as typing begins
          }
          setMessages(prev => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.sender === 'ai') {
              last.text += chunk;
            }
            return next;
          });
        }
      );
    } catch (e) {
      console.error('AI Panel askAI error:', e);
      setMessages(prev => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last && last.sender === 'ai' && !last.text) {
          last.text = L('Could not reach AI. Check connection.', 'لم نتمكن من الوصول للذكاء الاصطناعي. تحقق من الاتصال.');
        }
        return next;
      });
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
    setGuideStepText(L(`Step ${stepIdx + 1} of ${flow.steps.length}: ${step.text}`, `الخطوة ${stepIdx + 1} من ${flow.steps.length}: ${step.text}`));

    // Navigate to page if defined
    if (step.nav) {
      setCurrentPage(step.nav);
    }

    setTimeout(() => {
      // Find element in rendered DOM
      let selector = step.target;
      // Adapt selector to match React structure
      if (selector.includes('onclick*="crm"')) selector = '[id="sb-crm"], .sb-btn[onClick*="crm"], button:contains("Smart CRM")';
      if (selector.includes('onclick*="tasks"')) selector = '[id="sb-tasks"], .sb-btn[onClick*="tasks"]';
      if (selector.includes('onclick*="finance"')) selector = '[id="sb-finance"], .sb-btn[onClick*="finance"]';
      if (selector.includes('onclick*="profile"')) selector = '[id="sb-profile"], .sb-btn[onClick*="profile"]';
      if (selector.includes('onclick*="content"')) selector = '[id="sb-content"], .sb-btn[onClick*="content"]';
      
      let targetEl = document.querySelector(step.target);
      if (!targetEl) {
        // Try fallback selector strategies
        if (step.target.includes('crm')) targetEl = document.querySelector('.sb-btn:nth-child(3)');
        else if (step.target.includes('tasks')) targetEl = document.querySelector('.sb-btn[onClick*="tasks"]');
        else if (step.target.includes('finance')) targetEl = document.querySelector('.sb-btn[onClick*="finance"]');
      }

      if (targetEl) {
        showGuideHighlight(targetEl, step.text, stepIdx, flow.steps.length, flowKey);
      } else {
        // Skip
        showGuideStep(flowKey, stepIdx + 1);
      }
    }, step.nav ? 500 : 150);
  };

  const showGuideHighlight = (el, text, stepIdx, totalSteps, flowKey) => {
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

    tooltip.style.cssText = `top:${ttTop}px;left:${ttLeft}px;position:absolute;z-index:10000;background:var(--surface3);border:1px solid var(--edge2);border-radius:8px;padding:12px;width:220px;box-shadow:0 4px 12px rgba(0,0,0,.3);color:var(--t1);font-size:12px;`;
    
    // Tooltip Content
    const isLast = stepIdx + 1 === totalSteps;
    tooltip.innerHTML = `
      <div style="margin-bottom:8px;line-height:1.4">${t(text)}</div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:10px;opacity:.7">${stepIdx + 1} / ${totalSteps}</span>
        <button id="guide-next-btn" style="background:var(--orange);border:none;border-radius:4px;color:#fff;padding:3px 8px;cursor:pointer;font-size:11px;font-weight:600">
          ${isLast ? L('Done ✓', 'تم ✓') : L('Next →', 'التالي →')}
        </button>
      </div>
    `;

    document.body.appendChild(tooltip);
    overlaysRef.current.push(tooltip);

    // Attach click handler to Next/Done button
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

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      setVoiceStatus(L('🎙️ Listening... speak now', '🎙️ جاري الاستماع... تحدث الآن'));
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
      // Auto-send if we captured text
      if (input.trim() || voiceTranscript.trim()) {
        setTimeout(() => {
          askAI(input || voiceTranscript);
          setInput('');
        }, 500);
      }
    };

    rec.onerror = (e) => {
      setVoiceActive(false);
      setVoiceStatus(`⚠️ ${e.error === 'not-allowed' ? 'Mic denied' : e.error}`);
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
    <div id="ai-panel" className="open" ref={panelRef}>
      <div className="ai-panel-hd">
        <div className="ai-panel-title">
          <div className="ai-status-dot"></div>
          {t('AI Assistant')}
        </div>
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
          <button
            className="tb-icon"
            onClick={startGuideMode}
            style={{ width: '28px', height: '28px', fontSize: '13px', borderColor: 'rgba(255,107,53,.3)', color: 'var(--orange)' }}
            title={L("Guided Walkthrough", "إرشاد تفاعلي")}
          >
            🧭
          </button>
          <button
            className="tb-icon"
            onClick={toggleVoiceInput}
            style={{ width: '28px', height: '28px', fontSize: '13px' }}
            title={L("Voice Input", "إدخال صوتي")}
          >
            🎙️
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
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--orange)', marginBottom: '4px' }}>
            🧭 {L('Guide Mode Active', 'وضع المرشد نشط')}
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
                {t(GUIDE_FLOWS[k].title)}
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
          <div style={{ fontSize: '12px', color: 'var(--red)', fontWeight: 600 }}>{voiceStatus}</div>
          <div style={{ fontSize: '11px', color: 'var(--t2)', marginTop: '3px' }}>{voiceTranscript}</div>
        </div>
      )}

      {/* Messages List */}
      <div className="ai-panel-body" id="ai-chat-body" ref={chatBodyRef}>
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

        {/* Quick actions buttons grid */}
        {!loading && (
          <div className="ai-quick-actions" style={{ marginTop: '14px' }}>
            {quickActions.map((action, index) => (
              <button
                className="ai-qa-btn"
                key={index}
                onClick={() => askAI(action)}
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ai-panel-foot">
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
        <button className="btn btn-prime" style={{ padding: '8px 12px', flexShrink: 0 }} onClick={handleSend}>
          ➤
        </button>
      </div>
    </div>
  );
}
