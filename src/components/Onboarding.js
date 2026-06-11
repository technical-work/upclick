'use client';

import React, { useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { OB_OPTS } from '../data/mockData';

export default function Onboarding() {
  const {
    lang,
    L,
    t,
    onboardingDone,
    finishOnboarding
  } = useBusiness();

  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState('');

  if (onboardingDone) return null;

  const handleSelectType = (type) => {
    setSelectedType(type);
    setTimeout(() => {
      setStep(2);
    }, 250);
  };

  const handleSelectLevel = (level) => {
    setSelectedLevel(level);
    setTimeout(() => {
      setStep(3);
    }, 250);
  };

  const handleSelectChallenge = (challenge) => {
    setSelectedChallenge(challenge);
    setTimeout(() => {
      setStep(4);
    }, 250);
  };

  const getWelcomeMessage = () => {
    return L(
      `You're a ${selectedType} focused on "${selectedChallenge}". We've configured your Command Center with the most relevant tools and AI assistance.`,
      `أنت ${selectedType} تركّز على "${selectedChallenge}". قمنا بإعداد مركز القيادة الخاص بك مع أكثر الأدوات والمساعدة الذكية ملاءمة.`
    );
  };

  const stepsCount = [1, 2, 3];

  return (
    <div id="onboarding-overlay">
      <div className="onboard-box">
        <div className="onboard-logo">
          <div className="sb-logo-mark">U</div>
          <div>
            <div style={{ fontFamily: 'var(--ff)', fontSize: '16px', fontWeight: 800, color: 'var(--t1)' }}>
              UpKlick Dashboard
            </div>
            <div style={{ fontSize: '11px', color: 'var(--t3)' }}>
              {L("Let's personalize your workspace", 'دعنا نخصص مساحة عملك')}
            </div>
          </div>
        </div>

        {step === 1 && (
          <div id="ob-step-1" className="onboard-step on">
            <div className="wiz-progress" id="ob-progress">
              {stepsCount.map((s) => (
                <div key={s} className={`wiz-dot ${s <= 1 ? 'done' : ''}`}></div>
              ))}
            </div>
            <div style={{ fontFamily: 'var(--ff)', fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
              {L('Who are you? 👤', 'من أنت؟ 👤')}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--t2)', marginBottom: '20px' }}>
              {L('This helps us personalize your experience.', 'يساعدنا هذا في تخصيص تجربتك.')}
            </div>
            <div className="wiz-opts" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }} id="ob-type-opts">
              {OB_OPTS.types[lang].map((opt) => (
                <div
                  key={opt.l}
                  className={`wiz-opt ${selectedType === opt.l ? 'sel' : ''}`}
                  onClick={() => handleSelectType(opt.l)}
                  style={{ padding: '11px 8px' }}
                >
                  <div className="wiz-opt-icon">{opt.e}</div>
                  <div className="wiz-opt-lbl" style={{ fontSize: '11.5px' }}>
                    {opt.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div id="ob-step-2" className="onboard-step on">
            <div className="wiz-progress" id="ob-progress2">
              {stepsCount.map((s) => (
                <div key={s} className={`wiz-dot ${s <= 2 ? 'done' : ''}`}></div>
              ))}
            </div>
            <div style={{ fontFamily: 'var(--ff)', fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
              {L('Experience level? 🌱', 'مستوى الخبرة؟ 🌱')}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--t2)', marginBottom: '20px' }}>
              {L("We'll adjust recommendations accordingly.", 'سنقوم بتعديل التوصيات وفقاً لذلك.')}
            </div>
            <div className="wiz-opts" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }} id="ob-level-opts">
              {OB_OPTS.levels[lang].map((opt) => (
                <div
                  key={opt.l}
                  className={`wiz-opt ${selectedLevel === opt.l ? 'sel' : ''}`}
                  onClick={() => handleSelectLevel(opt.l)}
                  style={{ padding: '14px 10px' }}
                >
                  <div className="wiz-opt-icon">{opt.e}</div>
                  <div className="wiz-opt-lbl">{opt.l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div id="ob-step-3" className="onboard-step on">
            <div className="wiz-progress" id="ob-progress3">
              {stepsCount.map((s) => (
                <div key={s} className={`wiz-dot ${s <= 3 ? 'done' : ''}`}></div>
              ))}
            </div>
            <div style={{ fontFamily: 'var(--ff)', fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
              {L('Biggest challenge? 🎯', 'أكبر تحدٍ يواجهك؟ 🎯')}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--t2)', marginBottom: '20px' }}>
              {L("We'll prioritize the right tools for you.", 'سنعطي الأولوية للأدوات المناسبة لك.')}
            </div>
            <div className="wiz-opts" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }} id="ob-challenge-opts">
              {OB_OPTS.challenges[lang].map((opt) => (
                <div
                  key={opt.l}
                  className={`wiz-opt ${selectedChallenge === opt.l ? 'sel' : ''}`}
                  onClick={() => handleSelectChallenge(opt.l)}
                  style={{ padding: '11px 8px' }}
                >
                  <div className="wiz-opt-icon">{opt.e}</div>
                  <div className="wiz-opt-lbl" style={{ fontSize: '11.5px' }}>
                    {opt.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div id="ob-step-4" className="onboard-step on">
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
              <div
                style={{ fontFamily: 'var(--ff)', fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}
                id="ob-welcome-msg"
              >
                {L('Your workspace is ready!', 'مساحة عملك جاهزة!')}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--t2)', marginBottom: '24px' }} id="ob-welcome-sub">
                {getWelcomeMessage()}
              </div>
              <button
                className="btn btn-prime"
                onClick={() => finishOnboarding(selectedType, selectedLevel, selectedChallenge)}
                style={{ padding: '12px 28px', fontSize: '14px' }}
              >
                {L('Enter UpKlick Dashboard ➔', 'دخول لوحة تحكم UpKlick ➔')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
