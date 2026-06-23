'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';

export default function LaunchpadView() {
  const { lang, L, t, setCurrentPage } = useBusiness();

  // Load checklist steps checked state from localStorage
  const [checkedSteps, setCheckedSteps] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false
  });

  const [daysCount, setDaysCount] = useState(0);
  const [aiCoachOutput, setAiCoachOutput] = useState('');
  const [generatingCoachPlan, setGeneratingCoachPlan] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedChecked = localStorage.getItem('lp_checked_steps');
      if (savedChecked) {
        try { setCheckedSteps(JSON.parse(savedChecked)); } catch (e) {}
      }

      // Track days count (e.g. from onboarding date)
      const signupDate = localStorage.getItem('ba_signup_date');
      if (signupDate) {
        const diffTime = Math.abs(new Date() - new Date(signupDate));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysCount(diffDays);
      } else {
        localStorage.setItem('ba_signup_date', new Date().toISOString());
        setDaysCount(1);
      }
    }
  }, []);

  const toggleStep = (stepId) => {
    const updated = {
      ...checkedSteps,
      [stepId]: !checkedSteps[stepId]
    };
    setCheckedSteps(updated);
    localStorage.setItem('lp_checked_steps', JSON.stringify(updated));
  };

  const completedCount = Object.values(checkedSteps).filter(Boolean).length;
  const readinessPercentage = Math.round((completedCount / 8) * 100);

  const handleGetLaunchPlan = async () => {
    setGeneratingCoachPlan(true);
    setAiCoachOutput('');
    const prompt = `I want to launch my business idea. Give me a step-by-step action plan for the first 30 days. Niche: ${L('Fashion & Lifestyle', 'الأزياء وأسلوب الحياة')}`;
    const sysPrompt = 'World-class startup launcher coach. Actionable, step-by-step layout.';
    try {
      const reply = await callClaudeAPI(prompt, sysPrompt, lang);
      setAiCoachOutput(reply);
    } catch (e) {
      setAiCoachOutput('Connection error - please try again.');
    } finally {
      setGeneratingCoachPlan(false);
    }
  };

  const steps = [
    {
      id: 1,
      title: L('Complete your business profile', 'أكمل ملف تعريف عملك'),
      desc: L('Tell the AI your niche, audience, and offer', 'أخبر الذكاء الاصطناعي بمجالك وجمهورك وعرضك'),
      btnLabel: L('Open Profile →', 'افتح الملف الشخصي ←'),
      action: () => setCurrentPage('profile')
    },
    {
      id: 2,
      title: L('Define your offer', 'حدد عرضك الرئيسي'),
      desc: L('What do you sell? Price? Who is it for?', 'ماذا تبيع؟ السعر؟ لمن هذا العرض؟'),
      btnLabel: L('✦ AI Help →', '✦ مساعدة الذكاء ←'),
      action: () => alert('Ask AI: Help me define my core offer — pricing, positioning, and target audience')
    },
    {
      id: 3,
      title: L('Build your landing page', 'أنشئ صفحة الهبوط الخاصة بك'),
      desc: L('Create a simple page to capture leads or sell', 'أنشئ صفحة بسيطة لجمع بيانات العملاء أو البيع'),
      btnLabel: L('Landing Page AI →', 'صفحة الهبوط بالذكاء ←'),
      action: () => setCurrentPage('landing')
    },
    {
      id: 4,
      title: L('Set up Telegram for sales', 'إعداد تليجرام للمبيعات'),
      desc: L('Your primary sales channel in the Arab market', 'قناة مبيعاتك الأساسية في السوق العربي'),
      btnLabel: L('Telegram Hub →', 'مركز التليجرام ←'),
      action: () => setCurrentPage('telegram')
    },
    {
      id: 5,
      title: L('Add your first 10 leads to CRM', 'أضف أول 10 عملاء لـ CRM'),
      desc: L('Start tracking potential customers now', 'ابدأ في تتبع العملاء المحتملين الآن'),
      btnLabel: L('Open CRM →', 'افتح CRM ←'),
      action: () => setCurrentPage('crm')
    },
    {
      id: 6,
      title: L('Create your first content piece', 'أنشئ أول منشور أو فيديو'),
      desc: L('One viral post or video to announce your launch', 'منشور أو فيديو ترويجي واحد للإعلان عن الإطلاق'),
      btnLabel: L('Content Hub →', 'مركز صناعة المحتوى ←'),
      action: () => setCurrentPage('content')
    },
    {
      id: 7,
      title: L('Connect a payment method', 'ربط وسيلة الدفع'),
      desc: L('Stripe, PayPal, or Tap Payments for Arab market', 'ربط بوابة الدفع Stripe أو PayPal أو Tap لتبدأ استقبال الأموال'),
      btnLabel: L('Integrations →', 'التكامل بوابات الدفع ←'),
      action: () => setCurrentPage('integrations')
    },
    {
      id: 8,
      title: L('Make your first sale 🎉', 'حقق أول عملية بيع 🎉'),
      desc: L('Record it in Finance — your first win!', 'سجلها في الأرباح — فوزك الأول!'),
      btnLabel: L('Record in Finance →', 'تسجيل في المالية ←'),
      action: () => setCurrentPage('finance')
    }
  ];

  return (
    <div className="pg on" id="pg-launchpad">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">🚀</span>
          {L('Launchpad', 'لوحة الإطلاق')}
        </div>
        <div className="pg-actions">
          <button className="btn-ai" onClick={handleGetLaunchPlan}>
            ✦ {L('30-Day Plan', 'خطة ٣٠ يوماً')}
          </button>
        </div>
      </div>

      <div 
        className="card mb" 
        style={{ 
          background: 'linear-gradient(135deg, var(--orange-d), var(--purple-dim))',
          borderColor: 'rgba(255,107,53,.2)' 
        }}
      >
        <div style={{ fontFamily: 'var(--ff)', fontSize: '18px', fontWeight: 800, color: 'var(--t1)', marginBottom: '6px' }}>
          🚀 {L('Ready to launch?', 'هل أنت مستعد للإطلاق؟')}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--t2)', marginBottom: '14px' }}>
          {L('Complete these steps to go from idea to your first paying customer', 'أكمل هذه الخطوات لتتحول من مجرد فكرة إلى أول عميل يدفع لك')}
        </div>
        <div id="lp-progress-bar" style={{ background: 'var(--surface2)', borderRadius: '20px', height: '8px', overflow: 'hidden', marginBottom: '6px' }}>
          <div 
            style={{ 
              width: `${readinessPercentage}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, var(--orange), var(--purple))', 
              borderRadius: '20px', 
              transition: 'width 1s' 
            }}
          ></div>
        </div>
        <div style={{ fontSize: '11.5px', color: 'var(--t2)' }}>
          <span>{completedCount}</span> / 8 {L('steps completed', 'خطوات مكتملة')}
        </div>
      </div>

      <div className="g2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} id="lp-checklist">
          {steps.map((step) => {
            const isChecked = checkedSteps[step.id];
            return (
              <div 
                className="lp-step" 
                key={step.id}
                onClick={() => toggleStep(step.id)}
                style={{ 
                  background: 'var(--surface2)', 
                  borderRadius: '11px', 
                  padding: '13px 15px', 
                  cursor: 'pointer', 
                  border: isChecked ? '1px solid var(--orange)' : '1px solid var(--edge)', 
                  display: 'flex', 
                  gap: '11px', 
                  alignItems: 'flex-start', 
                  transition: 'all .15s' 
                }}
              >
                <div 
                  className="lp-check" 
                  style={{ 
                    width: '22px', 
                    height: '22px', 
                    borderRadius: '50%', 
                    border: isChecked ? '2px solid var(--orange)' : '2px solid var(--edge)', 
                    background: isChecked ? 'var(--orange)' : 'none',
                    color: '#fff',
                    flexShrink: 0, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '12px', 
                    transition: 'all .2s' 
                  }}
                >
                  {isChecked && '✓'}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)', marginBottom: '3px', textDecoration: isChecked ? 'line-through' : 'none' }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--t2)' }}>
                    {step.desc}
                  </div>
                  <button 
                    className="btn btn-ghost" 
                    style={{ fontSize: '11px', padding: '3px 10px', marginTop: '6px' }} 
                    onClick={(e) => { e.stopPropagation(); step.action(); }}
                  >
                    {step.btnLabel}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <div className="card mb">
            <div className="sec-hd"><div className="sec-title">✦ {L('AI Launch Coach', 'مستشار الإطلاق بالذكاء')}</div></div>
            <div id="lp-ai-out">
              {generatingCoachPlan && (
                <div className="ai-box" style={{ animation: 'pulse 1.5s infinite', textAlign: 'center', padding: '24px' }}>
                  {L('⚡ Generating your launch plan...', '⚡ جاري إنشاء خطة الإطلاق...')}
                </div>
              )}

              {!generatingCoachPlan && !aiCoachOutput && (
                <div className="empty-state" style={{ padding: '20px' }}>
                  <div className="es-icon">🚀</div>
                  <div className="es-sub">{L('Get a personalized launch plan based on your niche and goals', 'احصل على خطة إطلاق مخصصة ومبنية على مجالك المستهدف')}</div>
                  <button className="btn btn-prime" onClick={handleGetLaunchPlan}>
                    ✦ {L('Generate My Launch Plan', 'إنشاء خطة إطلاقي بالذكاء')}
                  </button>
                </div>
              )}

              {!generatingCoachPlan && aiCoachOutput && (
                <div className="ai-box" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                  {aiCoachOutput}
                </div>
              )}
            </div>
          </div>
          <div className="card">
            <div className="sec-hd"><div className="sec-title">📊 {L('Launch Stats', 'إحصائيات الإطلاق')}</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--edge)' }}>
                <span style={{ fontSize: '12.5px', color: 'var(--t2)' }}>{L('Days since start', 'أيام منذ البدء')}</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--t1)' }} id="lp-days-count">{daysCount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--edge)' }}>
                <span style={{ fontSize: '12.5px', color: 'var(--t2)' }}>{L('Steps completed', 'الخطوات المكتملة')}</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--orange)' }} id="lp-steps-stat">{completedCount} / 8</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span style={{ fontSize: '12.5px', color: 'var(--t2)' }}>{L('Launch readiness', 'مستوى الجاهزية')}</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--green)' }} id="lp-readiness">{readinessPercentage}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
