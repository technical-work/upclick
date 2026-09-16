'use client';

import React, { useState } from 'react';
import { Plus, X, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { SURVEY_TEMPLATES } from './surveyTemplates';

export default function CreateSurveyModal({
  isOpen,
  onClose,
  onCreateBlank,
  onCreateFromTemplate,
  isRtl,
  nextSurveyNumber = 1
}) {
  const [mode, setMode] = useState('scratch'); // 'scratch' | 'templates'
  const [selectedTemplate, setSelectedTemplate] = useState(SURVEY_TEMPLATES[0]);
  const [surveyName, setSurveyName] = useState(`Survey ${nextSurveyNumber}`);
  const [step, setStep] = useState('select_mode'); // 'select_mode' | 'browse_templates'

  if (!isOpen) return null;

  const handleCreate = () => {
    if (mode === 'scratch') {
      onCreateBlank({ name: surveyName.trim() || `Survey ${nextSurveyNumber}` });
      onClose();
    } else {
      setStep('browse_templates');
    }
  };

  const handlePickTemplate = (tpl) => {
    onCreateFromTemplate(tpl, { name: surveyName.trim() || tpl.name });
    onClose();
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
        zIndex: 999999,
        padding: '20px',
        direction: isRtl ? 'rtl' : 'ltr'
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: step === 'browse_templates' ? '820px' : '640px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid var(--edge)',
          overflow: 'hidden',
          animation: 'scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--edge)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800', color: 'var(--t1)' }}>
              {step === 'browse_templates'
                ? (isRtl ? 'اختر قالب الاستبيان' : 'Choose a Survey Template')
                : (isRtl ? 'إنشاء استبيان جديد' : 'Create new survey')}
            </h3>
            <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--t2)' }}>
              {step === 'browse_templates'
                ? (isRtl ? 'اختر قالباً لبدء العمل عليه فوراً' : 'Select a prebuilt survey template to get started instantly')
                : (isRtl ? 'اختر طريقة البدء لإنشاء استبيان تفاعلي متعدد الشرائح' : 'Choose how you want to start building your multi-step survey')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--t3)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {step === 'select_mode' ? (
            <div>
              {/* Survey Name Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: 'var(--t1)', marginBottom: '8px' }}>
                  {isRtl ? 'اسم الاستبيان' : 'Survey Name'}
                </label>
                <input
                  type="text"
                  value={surveyName}
                  onChange={(e) => setSurveyName(e.target.value)}
                  placeholder={isRtl ? 'مثال: استبيان رضا العملاء' : 'e.g., Customer Satisfaction Survey'}
                  className="inp"
                  style={{ width: '100%', fontSize: '14px' }}
                />
              </div>

              {/* Dual Mode Cards (Screenshot 2) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '10px'
                }}
              >
                {/* 1. Start from Scratch */}
                <div
                  onClick={() => setMode('scratch')}
                  style={{
                    border: mode === 'scratch' ? '2px solid var(--a)' : '1px solid var(--edge)',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    background: mode === 'scratch' ? 'rgba(37, 99, 235, 0.08)' : 'var(--surface2)',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--t1)' }}>
                        {isRtl ? 'البدء من الصفر' : 'Start from Scratch'}
                      </h4>
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: mode === 'scratch' ? '5px solid var(--a)' : '2px solid var(--edge)',
                          background: mode === 'scratch' ? '#fff' : 'transparent'
                        }}
                      />
                    </div>
                    <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: 'var(--t2)', lineHeight: 1.4 }}>
                      {isRtl
                        ? 'صمم من الصفر باستخدام المنشئ المرئي للاستبيانات'
                        : 'Design from scratch using the full visual survey builder'}
                    </p>
                  </div>

                  {/* Plus Box Placeholder */}
                  <div
                    style={{
                      height: '110px',
                      background: 'var(--surface)',
                      borderRadius: '8px',
                      border: '1px dashed var(--edge)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: mode === 'scratch' ? 'var(--a)' : 'var(--t3)'
                    }}
                  >
                    <Plus size={32} />
                  </div>
                </div>

                {/* 2. From Templates */}
                <div
                  onClick={() => setMode('templates')}
                  style={{
                    border: mode === 'templates' ? '2px solid var(--a)' : '1px solid var(--edge)',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    background: mode === 'templates' ? 'rgba(37, 99, 235, 0.08)' : 'var(--surface2)',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: 'var(--t1)' }}>
                        {isRtl ? 'من القوالب الجاهزة' : 'From templates'}
                      </h4>
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: mode === 'templates' ? '5px solid var(--a)' : '2px solid var(--edge)',
                          background: mode === 'templates' ? '#fff' : 'transparent'
                        }}
                      />
                    </div>
                    <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: 'var(--t2)', lineHeight: 1.4 }}>
                      {isRtl
                        ? 'انطلق سريعاً مع استبيان مصمم ومجهز مسبقاً'
                        : 'Jump start with an awesome prebuilt survey template'}
                    </p>
                  </div>

                  {/* Template graphic preview */}
                  <div
                    style={{
                      height: '110px',
                      background: 'var(--surface)',
                      borderRadius: '8px',
                      border: '1px solid var(--edge)',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '800',
                        color: 'var(--t1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginBottom: '4px'
                      }}
                    >
                      <Sparkles size={14} color="#f59e0b" />
                      <span>Over 1000+ Templates</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--t2)' }}>
                      {isRtl ? 'قوالب CSAT، NPS، والمبيعات' : 'NPS, CSAT & Lead Qualification'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Browse Templates view */
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '14px', maxHeight: '420px', overflowY: 'auto' }}>
                {SURVEY_TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => handlePickTemplate(tpl)}
                    style={{
                      border: '1px solid var(--edge)',
                      borderRadius: '10px',
                      padding: '16px',
                      cursor: 'pointer',
                      background: 'var(--surface2)',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--a)';
                      e.currentTarget.style.background = 'rgba(37, 99, 235, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--edge)';
                      e.currentTarget.style.background = 'var(--surface2)';
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{tpl.icon || '📋'}</div>
                      <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--t1)', margin: '0 0 6px 0' }}>{tpl.name}</h4>
                      <p style={{ fontSize: '11.5px', color: 'var(--t2)', margin: '0 0 12px 0', lineHeight: 1.4 }}>{tpl.description}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--a)', fontWeight: '700' }}>
                      <span>{tpl.slides?.length || 1} {isRtl ? 'شرائح' : 'slides'}</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--edge)',
            background: 'var(--surface2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px'
          }}
        >
          {step === 'browse_templates' ? (
            <button
              type="button"
              onClick={() => setStep('select_mode')}
              className="btn btn-ghost"
              style={{ fontSize: '13px', fontWeight: '600' }}
            >
              {isRtl ? 'رجوع' : 'Back'}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              style={{ fontSize: '13px', fontWeight: '600' }}
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
          )}

          <button
            type="button"
            onClick={handleCreate}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 24px',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
            }}
          >
            {step === 'browse_templates'
              ? (isRtl ? 'استعراض' : 'Browse')
              : (mode === 'scratch' ? (isRtl ? 'إنشاء' : 'Create') : (isRtl ? 'متابعة للقوالب' : 'Next'))}
          </button>
        </div>
      </div>
    </div>
  );
}
