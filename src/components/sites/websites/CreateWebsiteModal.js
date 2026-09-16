'use client';

import React, { useState } from 'react';
import { X, Sparkles, Layout, Globe, ArrowRight, Check } from 'lucide-react';
import { PREBUILT_WEBSITE_TEMPLATES } from './websiteTemplates';

export default function CreateWebsiteModal({
  isOpen,
  onClose,
  onCreateBlank,
  onCreateFromTemplate,
  isRtl
}) {
  const [selectedMode, setSelectedMode] = useState('blank'); // 'blank' | 'templates'
  const [websiteName, setWebsiteName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(PREBUILT_WEBSITE_TEMPLATES[0]?.id || '');
  const [templateStep, setTemplateStep] = useState(false); // false = main choice, true = template gallery

  if (!isOpen) return null;

  const handleCreate = () => {
    if (selectedMode === 'blank') {
      onCreateBlank(websiteName.trim() || (isRtl ? 'موقع إلكتروني جديد' : 'Sales website'));
      onClose();
    } else {
      if (!templateStep) {
        setTemplateStep(true);
      } else {
        onCreateFromTemplate(selectedTemplateId, websiteName.trim());
        onClose();
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '16px',
      boxSizing: 'border-box',
      direction: isRtl ? 'rtl' : 'ltr'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: templateStep ? '820px' : '580px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        color: '#1e293b',
        boxSizing: 'border-box',
        animation: 'scaleUp 0.25s ease'
      }}>
        <style>{`
          @keyframes scaleUp {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .ghl-option-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
            gap: 16px;
          }
          .ghl-option-card {
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: ${isRtl ? 'right' : 'left'};
            background: #ffffff;
            display: flex;
            flex-direction: column;
            justifyContent: space-between;
            box-sizing: border-box;
          }
          .ghl-option-card:hover {
            border-color: #93c5fd;
            background: #f8fafc;
          }
          .ghl-option-card.selected {
            border-color: #2563eb;
            background: #eff6ff;
            box-shadow: 0 0 0 1px #2563eb;
          }
        `}</style>

        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>
            {templateStep 
              ? (isRtl ? 'اختر قالباً لموقعك الجديد' : 'Select a Website Template')
              : (isRtl ? 'إنشاء موقع إلكتروني جديد' : 'Create new website')
            }
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, minHeight: 0 }}>
          {!templateStep ? (
            <div className="ghl-option-grid">
              
              {/* Option 1: From blank (Matches Screenshot 2) */}
              <div
                className={`ghl-option-card ${selectedMode === 'blank' ? 'selected' : ''}`}
                onClick={() => setSelectedMode('blank')}
              >
                {/* Dotted Box Graphic */}
                <div style={{
                  height: '110px',
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px',
                  marginBottom: '16px'
                }}>
                  <input
                    type="text"
                    value={selectedMode === 'blank' ? websiteName : ''}
                    onChange={(e) => {
                      setSelectedMode('blank');
                      setWebsiteName(e.target.value);
                    }}
                    placeholder={isRtl ? 'مثال: موقع المبيعات' : 'e.g. Sales website'}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff',
                      color: '#0f172a',
                      outline: 'none',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                    {isRtl ? 'من الصفر' : 'From blank'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', lineHeight: '1.4' }}>
                    {isRtl ? 'صمم موقعك بالكامل من البداية باستخدام محرر الصفحات.' : 'Design from scratch using the funnel builder.'}
                  </p>
                </div>
              </div>

              {/* Option 2: From templates (Matches Screenshot 2) */}
              <div
                className={`ghl-option-card ${selectedMode === 'templates' ? 'selected' : ''}`}
                onClick={() => setSelectedMode('templates')}
              >
                {/* Graphic Banner */}
                <div style={{
                  height: '110px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #fed7aa 0%, #fbcfe8 50%, #e9d5ff 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(4px)',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: '800',
                    color: '#c2410c',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)'
                  }}>
                    {isRtl ? 'أكثر من 1000+ قالب جاهز' : 'Over 1000+ Templates'}
                  </div>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                    {isRtl ? 'من القوالب الجاهزة' : 'From templates'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', lineHeight: '1.4' }}>
                    {isRtl ? 'ابدأ فوراً بموقع احترافي جاهز متعدد الصفحات.' : 'Jump start with an awesome prebuilt website.'}
                  </p>
                </div>
              </div>

            </div>
          ) : (
            /* Template Selection Gallery */
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  {isRtl ? 'اسم الموقع الإلكتروني:' : 'Website Name:'}
                </label>
                <input
                  type="text"
                  value={websiteName}
                  onChange={(e) => setWebsiteName(e.target.value)}
                  placeholder={isRtl ? 'مثال: موقع أعمالي الجديد' : 'e.g. My Agency Website'}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    background: '#ffffff',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                gap: '14px',
                maxHeight: '340px',
                overflowY: 'auto',
                padding: '4px'
              }}>
                {PREBUILT_WEBSITE_TEMPLATES.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      style={{
                        border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: isSelected ? '#eff6ff' : '#ffffff',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 0 0 1px #2563eb' : 'none'
                      }}
                    >
                      <div style={{ height: '110px', overflow: 'hidden', position: 'relative' }}>
                        <img
                          src={tpl.thumbnail}
                          alt={tpl.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <span style={{
                          position: 'absolute',
                          bottom: '6px',
                          right: isRtl ? 'auto' : '6px',
                          left: isRtl ? '6px' : 'auto',
                          background: 'rgba(15, 23, 42, 0.8)',
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {tpl.pages.length} {isRtl ? 'صفحات' : 'Pages'}
                        </span>
                      </div>
                      <div style={{ padding: '10px 12px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>
                          {isRtl ? (tpl.nameAr || tpl.name) : tpl.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {tpl.category}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
          background: '#f8fafc',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          {templateStep ? (
            <button
              onClick={() => setTemplateStep(false)}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              {isRtl ? 'السابق' : 'Previous'}
            </button>
          ) : (
            <button
              onClick={onClose}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
          )}

          <button
            onClick={handleCreate}
            style={{
              background: '#2563eb',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: '700',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {templateStep ? (isRtl ? 'إنشاء الموقع الآن 🚀' : 'Create Website') : (isRtl ? 'متابعة' : 'Create')}
          </button>
        </div>

      </div>
    </div>
  );
}
