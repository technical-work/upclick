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
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(5px)',
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
          background: 'var(--surface)',
          border: '1px solid var(--edge)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: isChoosingTemplate ? '800px' : '640px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
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
            borderBottom: '1px solid var(--edge)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--t1)' }}>
            {isChoosingTemplate
              ? (isRtl ? 'اختر قالباً جاهزاً' : 'Choose a Form Template')
              : (isRtl ? 'إنشاء نموذج جديد' : 'Create new form')}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--t2)',
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
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--t1)', marginBottom: '6px' }}>
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
                border: '1px solid var(--edge)',
                background: 'var(--surface2)',
                fontSize: '14px',
                outline: 'none',
                color: 'var(--t1)'
              }}
            />
          </div>

          {!isChoosingTemplate ? (
            /* Cards Selection matching Screenshot 2 with theme variables */
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              
              {/* Option 1: Start from Scratch */}
              <div
                onClick={() => setSelectedOption('scratch')}
                style={{
                  border: selectedOption === 'scratch' ? '2px solid var(--a)' : '1px solid var(--edge)',
                  borderRadius: '12px',
                  padding: '18px',
                  cursor: 'pointer',
                  position: 'relative',
                  background: selectedOption === 'scratch' ? 'rgba(37, 99, 235, 0.08)' : 'var(--surface2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: 'var(--t1)' }}>
                      {isRtl ? 'البدء من الصفر' : 'Start from Scratch'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--t2)' }}>
                      {isRtl ? 'صمم من البداية باستخدام منشئ النماذج' : 'Design from scratch using the form builder'}
                    </p>
                  </div>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: selectedOption === 'scratch' ? '5px solid var(--a)' : '2px solid var(--edge)',
                      background: 'var(--surface)',
                      flexShrink: 0
                    }}
                  />
                </div>

                {/* Box inside scratch card */}
                <div
                  style={{
                    height: '130px',
                    borderRadius: '8px',
                    background: 'var(--surface)',
                    border: '1px dashed var(--edge)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--t2)'
                  }}
                >
                  <Plus size={36} strokeWidth={1.5} />
                </div>
              </div>

              {/* Option 2: From templates */}
              <div
                onClick={() => setSelectedOption('templates')}
                style={{
                  border: selectedOption === 'templates' ? '2px solid var(--a)' : '1px solid var(--edge)',
                  borderRadius: '12px',
                  padding: '18px',
                  cursor: 'pointer',
                  position: 'relative',
                  background: selectedOption === 'templates' ? 'rgba(37, 99, 235, 0.08)' : 'var(--surface2)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: 'var(--t1)' }}>
                      {isRtl ? 'من القوالب' : 'From templates'}
                    </h3>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--t2)' }}>
                      {isRtl ? 'انطلاقة سريعة مع قوالب احترافية مجهزة' : 'Jump start with an awesome prebuilt form'}
                    </p>
                  </div>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: selectedOption === 'templates' ? '5px solid var(--a)' : '2px solid var(--edge)',
                      background: 'var(--surface)',
                      flexShrink: 0
                    }}
                  />
                </div>

                {/* Box inside templates card matching Screenshot 2 */}
                <div
                  style={{
                    height: '130px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.25) 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
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
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#f59e0b', zIndex: 1 }}>
                    {isRtl ? 'أكثر من 1000+ قالب' : 'Over 1000+'}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#fbbf24', zIndex: 1 }}>
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
                        border: isSelected ? '2px solid var(--a)' : '1px solid var(--edge)',
                        borderRadius: '12px',
                        padding: '16px',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(37, 99, 235, 0.1)' : 'var(--surface2)',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--a)', background: 'rgba(37,99,235,0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                            {tpl.category}
                          </span>
                          {isSelected && (
                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--a)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: '700', color: 'var(--t1)' }}>
                          {isRtl ? tpl.nameAr || tpl.name : tpl.name}
                        </h4>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--t2)', lineHeight: 1.4 }}>
                          {tpl.description}
                        </p>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--t3)', borderTop: '1px solid var(--edge)', paddingTop: '8px' }}>
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
            borderTop: '1px solid var(--edge)',
            background: 'var(--surface2)',
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
                border: '1px solid var(--edge)',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--t1)',
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
                color: 'var(--t2)',
                cursor: 'pointer'
              }}
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              onClick={handleCreate}
              style={{
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 22px',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
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
