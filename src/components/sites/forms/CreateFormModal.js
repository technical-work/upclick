'use client';

import React, { useState } from 'react';
import { X, Plus, Sparkles, Layout, Check, Layers, ArrowRight } from 'lucide-react';
import { PREBUILT_FORM_TEMPLATES } from './formTemplates';

export default function CreateFormModal({
  isOpen,
  onClose,
  onCreateBlank,
  onCreateFromTemplate,
  isRtl,
  nextFormNumber = 1
}) {
  const [selectedOption, setSelectedOption] = useState('scratch'); // 'scratch' | 'templates'
  const [selectedTemplate, setSelectedTemplate] = useState(PREBUILT_FORM_TEMPLATES[0]);
  const [formName, setFormName] = useState(`Form ${nextFormNumber}`);
  const [isChoosingTemplate, setIsChoosingTemplate] = useState(false);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (selectedOption === 'scratch') {
      onCreateBlank(formName);
      onClose();
    } else {
      if (!isChoosingTemplate) {
        setIsChoosingTemplate(true);
      } else {
        onCreateFromTemplate(selectedTemplate, formName);
        onClose();
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: isChoosingTemplate ? '800px' : '640px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          direction: isRtl ? 'rtl' : 'ltr'
        }}
      >
        {/* Header matching Screenshot 2 */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
            {isChoosingTemplate
              ? (isRtl ? 'اختر قالباً جاهزاً' : 'Choose a Form Template')
              : (isRtl ? 'إنشاء نموذج جديد' : 'Create new form')}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Form Name input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              {isRtl ? 'اسم النموذج' : 'Form Name'}
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder={isRtl ? 'مثال: نموذج الاتصال الرئيسي' : 'e.g. Lead Capture Form'}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
                color: '#0f172a'
              }}
            />
          </div>

          {!isChoosingTemplate ? (
            /* Cards Selection matching Screenshot 2 */
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              {/* Option 1: Start from Scratch */}
              <div
                onClick={() => setSelectedOption('scratch')}
                style={{
                  border: selectedOption === 'scratch' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px',
                  cursor: 'pointer',
                  position: 'relative',
                  background: selectedOption === 'scratch' ? '#f8faff' : '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                      {isRtl ? 'البدء من الصفر' : 'Start from Scratch'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                      {isRtl ? 'صمم من البداية باستخدام منشئ النماذج' : 'Design from scratch using the form builder'}
                    </p>
                  </div>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: selectedOption === 'scratch' ? '5px solid #2563eb' : '2px solid #cbd5e1',
                      background: '#fff',
                      flexShrink: 0
                    }}
                  />
                </div>

                {/* Box inside scratch card */}
                <div
                  style={{
                    height: '130px',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px dashed #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8'
                  }}
                >
                  <Plus size={36} strokeWidth={1.5} />
                </div>
              </div>

              {/* Option 2: From templates */}
              <div
                onClick={() => setSelectedOption('templates')}
                style={{
                  border: selectedOption === 'templates' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px',
                  cursor: 'pointer',
                  position: 'relative',
                  background: selectedOption === 'templates' ? '#f8faff' : '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                      {isRtl ? 'من القوالب' : 'From templates'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                      {isRtl ? 'انطلاقة سريعة مع قوالب احترافية مجهزة' : 'Jump start with an awesome prebuilt form'}
                    </p>
                  </div>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: selectedOption === 'templates' ? '5px solid #2563eb' : '2px solid #cbd5e1',
                      background: '#fff',
                      flexShrink: 0
                    }}
                  />
                </div>

                {/* Box inside templates card matching Screenshot 2 */}
                <div
                  style={{
                    height: '130px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                    border: '1px solid #fde68a',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '12px',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      right: '-15px',
                      bottom: '-15px',
                      width: '80px',
                      height: '100px',
                      background: '#ffffff',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      transform: 'rotate(-10deg)',
                      opacity: 0.85
                    }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#b45309', zIndex: 1 }}>
                    {isRtl ? 'أكثر من 1000+ قالب' : 'Over 1000+'}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#92400e', zIndex: 1 }}>
                    {isRtl ? 'جاهز للاستخدام' : 'Templates'}
                  </span>
                </div>
              </div>

            </div>
          ) : (
            /* Template Selection Grid */
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', maxHeight: '380px', overflowY: 'auto', padding: '4px' }}>
                {PREBUILT_FORM_TEMPLATES.map((tpl) => {
                  const isSelected = selectedTemplate?.id === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl)}
                      style={{
                        border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '16px',
                        cursor: 'pointer',
                        background: isSelected ? '#f8faff' : '#ffffff',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>
                            {tpl.category}
                          </span>
                          {isSelected && (
                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                          {isRtl ? tpl.nameAr || tpl.name : tpl.name}
                        </h4>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                          {tpl.description}
                        </p>
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
                        {tpl.fields.length} {isRtl ? 'حقول مدمجة' : 'included fields'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions matching Screenshot 2 */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #f1f5f9',
            background: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isChoosingTemplate ? 'space-between' : 'flex-end',
            gap: '12px'
          }}
        >
          {isChoosingTemplate && (
            <button
              onClick={() => setIsChoosingTemplate(false)}
              style={{
                background: 'none',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              {isRtl ? 'رجوع' : 'Back'}
            </button>
          )}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 16px',
                fontSize: '13.5px',
                fontWeight: '600',
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              onClick={handleCreate}
              style={{
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 22px',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              {selectedOption === 'templates' && !isChoosingTemplate
                ? (isRtl ? 'التالي (اختيار القالب)' : 'Next: Select Template')
                : (isRtl ? 'إنشاء' : 'Create')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
