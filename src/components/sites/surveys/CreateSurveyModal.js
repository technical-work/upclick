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
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
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
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: step === 'browse_templates' ? '820px' : '640px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          animation: 'scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              {step === 'browse_templates'
                ? (isRtl ? 'اختر قالب الاستبيان' : 'Choose a Survey Template')
                : (isRtl ? 'إنشاء استبيان جديد' : 'Create new survey')}
            </h3>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
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
              color: '#94a3b8',
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
        {step === 'select_mode' ? (
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                {isRtl ? 'اسم الاستبيان' : 'Survey Name'}
              </label>
              <input
                type="text"
                className="inp"
                value={surveyName}
                onChange={(e) => setSurveyName(e.target.value)}
                placeholder="Survey 0"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {/* Option 1: Start from Scratch matching Screenshot 2 */}
              <div
                onClick={() => setMode('scratch')}
                style={{
                  border: mode === 'scratch' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px',
                  cursor: 'pointer',
                  background: mode === 'scratch' ? '#f8fafc' : '#ffffff',
                  boxShadow: mode === 'scratch' ? '0 4px 14px rgba(37, 99, 235, 0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                      {isRtl ? 'ابدأ من الصفر' : 'Start from Scratch'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                      {isRtl ? 'صمم استبيانك بالكامل خطوة بخطوة' : 'Design from scratch using the survey builder'}
                    </p>
                  </div>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: mode === 'scratch' ? '5px solid #2563eb' : '2px solid #cbd5e1',
                      background: '#ffffff',
                      flexShrink: 0
                    }}
                  />
                </div>

                {/* Box Graphic with + */}
                <div
                  style={{
                    height: '140px',
                    borderRadius: '8px',
                    border: '1px dashed #cbd5e1',
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '14px',
                    color: '#94a3b8'
                  }}
                >
                  <Plus size={36} strokeWidth={1.5} />
                </div>
              </div>

              {/* Option 2: From templates matching Screenshot 2 */}
              <div
                onClick={() => setMode('templates')}
                style={{
                  border: mode === 'templates' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px',
                  cursor: 'pointer',
                  background: mode === 'templates' ? '#f8fafc' : '#ffffff',
                  boxShadow: mode === 'templates' ? '0 4px 14px rgba(37, 99, 235, 0.08)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                      {isRtl ? 'من القوالب الجاهزة' : 'From templates'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                      {isRtl ? 'انطلق بسرعة مع استبيان مصمم ومجهز' : 'Jump start with an awesome prebuilt survey'}
                    </p>
                  </div>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: mode === 'templates' ? '5px solid #2563eb' : '2px solid #cbd5e1',
                      background: '#ffffff',
                      flexShrink: 0
                    }}
                  />
                </div>

                {/* Graphic with Over 1000+ Templates */}
                <div
                  style={{
                    height: '140px',
                    borderRadius: '8px',
                    border: '1px solid #fed7aa',
                    background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '14px',
                    padding: '16px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#c2410c', marginBottom: '4px' }}>
                    {isRtl ? 'أكثر من 1000+ قالب جاهز' : 'Over 1000+ Templates'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#ea580c' }}>
                    {isRtl ? 'NPS، مبيعات، رضا العملاء، وأبحاث السوق' : 'NPS, CSAT, Discovery & Lead Scoring'}
                  </div>
                  <Sparkles size={24} style={{ color: '#f97316', position: 'absolute', top: 12, right: 12, opacity: 0.7 }} />
                </div>
              </div>
            </div>

            {/* Modal Actions matching Screenshot 2 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '9px 20px',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleCreate}
                style={{
                  background: '#2563eb',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 26px',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                }}
              >
                {mode === 'templates' ? (isRtl ? 'متابعة لاختيار القالب ←' : 'Browse Templates →') : (isRtl ? 'إنشاء الاستبيان' : 'Create')}
              </button>
            </div>
          </div>
        ) : (
          /* Template Browser */
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', maxHeight: '420px', overflowY: 'auto', marginBottom: '20px' }}>
              {SURVEY_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  style={{
                    border: selectedTemplate?.id === tpl.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    background: selectedTemplate?.id === tpl.id ? '#eff6ff' : '#ffffff',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '22px' }}>{tpl.icon}</span>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb', background: '#dbeafe', padding: '2px 8px', borderRadius: '999px' }}>
                      {tpl.category}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                    {tpl.name}
                  </h4>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                    {tpl.description}
                  </p>
                  <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#475569' }}>
                    📋 {tpl.slides?.length || 0} {isRtl ? 'شرائح استبيان' : 'Survey Slides'}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setStep('select_mode')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                ← {isRtl ? 'الرجوع للاختيار' : 'Back'}
              </button>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '9px 18px',
                    fontSize: '13.5px',
                    fontWeight: '700',
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => handlePickTemplate(selectedTemplate)}
                  style={{
                    background: '#2563eb',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 24px',
                    fontSize: '13.5px',
                    fontWeight: '700',
                    color: '#ffffff',
                    cursor: 'pointer'
                  }}
                >
                  {isRtl ? 'استخدام هذا القالب' : 'Use this Template'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
