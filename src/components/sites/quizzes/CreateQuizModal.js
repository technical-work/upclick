'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Plus,
  ArrowRight,
  HelpCircle,
  Award,
  Layers,
  CheckCircle2,
  Zap,
  Target
} from 'lucide-react';
import { QUIZ_TEMPLATES } from './quizTemplates';

export default function CreateQuizModal({
  isRtl = false,
  onClose,
  onCreateBlank,
  onCreateFromTemplate
}) {
  const [step, setStep] = useState('choose'); // 'choose' | 'scratch' | 'templates'
  const [blankName, setBlankName] = useState('');
  const [passingScore, setPassingScore] = useState(70);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleCreateBlankSubmit = (e) => {
    e.preventDefault();
    if (!blankName.trim()) return;
    onCreateBlank(blankName.trim(), Number(passingScore) || 70);
  };

  const handleSelectTemplate = (template) => {
    onCreateFromTemplate(template);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        animation: 'fadeIn 0.2s ease'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--edge)',
          borderRadius: '16px',
          maxWidth: step === 'templates' ? '920px' : '620px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          padding: '28px',
          direction: isRtl ? 'rtl' : 'ltr',
          transition: 'max-width 0.3s ease'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--edge)',
            paddingBottom: '16px',
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.12)',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Award size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--t1)' }}>
                {step === 'choose' && (isRtl ? 'إنشاء اختبار جديد' : 'Create a New Quiz')}
                {step === 'scratch' && (isRtl ? 'إنشاء اختبار من الصفر' : 'Create Blank Quiz')}
                {step === 'templates' && (isRtl ? 'اختر من قوالب الاختبارات الجاهزة' : 'Choose a Quiz Template')}
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--t2)' }}>
                {isRtl
                  ? 'اختر طريقة البدء لتصميم اختبار تفاعلي مع تصحيح تلقائي.'
                  : 'Select your preferred starting method to build interactive scored assessments.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--t2)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Step 1: Choose Starting Method (Dual Cards) */}
        {step === 'choose' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {/* Start from Scratch */}
            <div
              onClick={() => setStep('scratch')}
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--edge)',
                borderRadius: '14px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--a)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--edge)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(37, 99, 235, 0.12)',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}
                >
                  <Plus size={24} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--t1)', margin: '0 0 8px' }}>
                  {isRtl ? 'البدء من الصفر (Blank Quiz)' : 'Start from Scratch'}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--t2)', margin: 0, lineHeight: '1.4' }}>
                  {isRtl
                    ? 'ابدأ باختبار مخصص بالكامل وأضف أسئلتك، خيارات الإجابات، والدرجات بنفسك.'
                    : 'Create a custom quiz with your own questions, options, point grading, and pass/fail rules.'}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--a)',
                  fontWeight: '700',
                  fontSize: '13px',
                  marginTop: '20px'
                }}
              >
                {isRtl ? 'ابدأ الآن' : 'Start building'}
                <ArrowRight size={14} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
              </div>
            </div>

            {/* Choose from Template */}
            <div
              onClick={() => setStep('templates')}
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--edge)',
                borderRadius: '14px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#f59e0b';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--edge)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(245, 158, 11, 0.12)',
                    color: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}
                >
                  <Sparkles size={24} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--t1)', margin: '0 0 8px' }}>
                  {isRtl ? 'قوالب اختبارات جاهزة' : 'Pre-built Templates'}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--t2)', margin: 0, lineHeight: '1.4' }}>
                  {isRtl
                    ? 'اختر من قوالب تسويق، SaaS، لياقة، أو تقييم ليدات جاهزة بالأسئلة والإجابات الصحيحة والشرح.'
                    : 'Choose from tested marketing, SaaS, trivia, or lead scoring quizzes with rich explanations.'}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#f59e0b',
                  fontWeight: '700',
                  fontSize: '13px',
                  marginTop: '20px'
                }}
              >
                {isRtl ? 'تصفح القوالب' : 'Browse templates'}
                <ArrowRight size={14} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Scratch Form */}
        {step === 'scratch' && (
          <form onSubmit={handleCreateBlankSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--t1)', marginBottom: '8px' }}>
                {isRtl ? 'اسم الاختبار' : 'Quiz Name'} *
              </label>
              <input
                type="text"
                required
                placeholder={isRtl ? 'مثال: اختبار المعرفة التسويقية' : 'e.g. Product Knowledge Quiz'}
                value={blankName}
                onChange={(e) => setBlankName(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--surface2)',
                  border: '1px solid var(--edge)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  color: 'var(--t1)',
                  fontSize: '14px',
                  outline: 'none'
                }}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--t1)', marginBottom: '8px' }}>
                {isRtl ? 'النسبة المئوية للاجتياز والنجاح (Passing Score %)' : 'Passing Score Percentage (%)'}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="range"
                  min="40"
                  max="100"
                  step="5"
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value)}
                  style={{ flex: 1, accentColor: 'var(--a)' }}
                />
                <span
                  style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--edge)',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontWeight: '800',
                    color: 'var(--a)',
                    minWidth: '54px',
                    textAlign: 'center'
                  }}
                >
                  {passingScore}%
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--t2)', margin: '6px 0 0' }}>
                {isRtl
                  ? 'المرشح الذي يحصل على هذه النسبة أو أعلى سيحصل على رسالة النجاح والاجتياز.'
                  : 'Candidates scoring at or above this percentage will see the Passing celebration screen.'}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setStep('choose')}
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--edge)',
                  color: 'var(--t1)',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontSize: '13.5px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {isRtl ? 'رجوع' : 'Back'}
              </button>
              <button
                type="submit"
                style={{
                  background: 'var(--a)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 22px',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
                }}
              >
                {isRtl ? 'إنشاء وفتح في البيلدر' : 'Create & Open in Builder'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Pre-built Templates Gallery */}
        {step === 'templates' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {QUIZ_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--edge)',
                    borderRadius: '12px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--a)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--edge)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onClick={() => handleSelectTemplate(tpl)}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '24px' }}>{tpl.icon}</span>
                      <span
                        style={{
                          background: 'rgba(245, 158, 11, 0.12)',
                          color: '#f59e0b',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700'
                        }}
                      >
                        {isRtl ? tpl.categoryAr || tpl.category : tpl.category}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--t1)', margin: '0 0 6px' }}>
                      {isRtl ? tpl.nameAr || tpl.name : tpl.name}
                    </h4>
                    <p style={{ fontSize: '12.5px', color: 'var(--t2)', margin: '0 0 14px', lineHeight: '1.4' }}>
                      {isRtl ? tpl.descriptionAr || tpl.description : tpl.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--t2)' }}>
                      <span>📝 {tpl.questions?.length || 0} {isRtl ? 'أسئلة' : 'questions'}</span>
                      <span>🎯 {tpl.passingScore || 70}% {isRtl ? 'اجتياز' : 'pass'}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTemplate(tpl);
                    }}
                    style={{
                      marginTop: '16px',
                      background: 'var(--a)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    {isRtl ? 'استخدام هذا القالب' : 'Use This Template'}
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <button
                type="button"
                onClick={() => setStep('choose')}
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--edge)',
                  color: 'var(--t1)',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {isRtl ? 'رجوع' : 'Back'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
