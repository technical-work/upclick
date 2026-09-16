'use client';

import React from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { TOOLS_EXPLAINER_DATA } from '../../data/toolsExplainerData';
import { 
  X, 
  Play, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Tv, 
  HelpCircle, 
  Layers, 
  ExternalLink,
  Info
} from 'lucide-react';

export default function ToolExplainerModal({ toolKey, isOpen, onClose }) {
  const { lang, setCurrentPage, t } = useBusiness();
  const isRtl = lang === 'ar';

  if (!isOpen || !toolKey) return null;

  const toolData = TOOLS_EXPLAINER_DATA[toolKey] || {
    page: toolKey,
    titleAr: toolKey,
    titleEn: toolKey,
    categoryAr: 'أداة',
    categoryEn: 'Tool',
    summaryAr: 'أداة متقدمة من منصة UpKlick لتسريع نمو أعمالك وتحقيق أعلى كفاءة تشغيلية.',
    summaryEn: 'An advanced UpKlick tool to accelerate business growth and maximize operational velocity.',
    featuresAr: ['تكامل ذكي مع المنصة', 'تحليلات وتقارير فورية', 'أتمتة وتوفير وقت العمل'],
    featuresEn: ['Seamless platform integration', 'Real-time analytics', 'Time-saving automation'],
    howToUseAr: ['افتح الأداة', 'خصص الإعدادات', 'ابدأ الاستخدام'],
    howToUseEn: ['Open the tool', 'Configure settings', 'Start using'],
    videoUrl: ''
  };

  const title = isRtl ? toolData.titleAr : toolData.titleEn;
  const category = isRtl ? toolData.categoryAr : toolData.categoryEn;
  const summary = isRtl ? toolData.summaryAr : toolData.summaryEn;
  const features = isRtl ? toolData.featuresAr : toolData.featuresEn;
  const howToUse = isRtl ? toolData.howToUseAr : toolData.howToUseEn;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 999999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease',
        direction: isRtl ? 'rtl' : 'ltr'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface, #0f172a)',
          border: '1px solid var(--edge, rgba(255,255,255,0.12))',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          color: 'var(--t1, #f8fafc)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--edge, rgba(255,255,255,0.08))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(147,51,234,0.2))',
              border: '1px solid rgba(37,99,235,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8'
            }}>
              <HelpCircle size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--t1, #fff)' }}>
                  {title}
                </h3>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  background: 'rgba(37,99,235,0.15)',
                  color: '#60a5fa',
                  border: '1px solid rgba(37,99,235,0.3)'
                }}>
                  {category}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: 'var(--t2, #94a3b8)' }}>
                {isRtl ? 'دليل وشرح مميزات واستخدام الأداة' : 'Tool overview, features, and guide'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--t2, #94a3b8)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* VIDEO PLAYER CONTAINER (Ready for video URLs) */}
          <div style={{
            background: '#020617',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            {toolData.videoUrl ? (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={toolData.videoUrl}
                  title={title}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                background: 'radial-gradient(circle at center, rgba(37,99,235,0.12) 0%, rgba(2,6,23,0.95) 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 0 25px rgba(37,99,235,0.5)',
                  marginBottom: '12px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}>
                  <Play size={24} style={{ marginLeft: isRtl ? '0' : '3px', marginRight: isRtl ? '3px' : '0' }} />
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700', color: '#f8fafc' }}>
                  {isRtl ? 'فيديو الشرح التوضيحي' : 'Video Tutorial'}
                </h4>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#94a3b8', maxWidth: '360px' }}>
                  {isRtl 
                    ? 'مشغل الفيديو جاهز لعرض الشرح العملي لهذه الأداة خطوة بخطوة'
                    : 'Video container ready for step-by-step walkthroughs and tutorials'}
                </p>
              </div>
            )}
          </div>

          {/* WHAT THE TOOL DOES */}
          <div style={{
            background: 'var(--surface2, rgba(255,255,255,0.03))',
            border: '1px solid var(--edge, rgba(255,255,255,0.08))',
            borderRadius: '14px',
            padding: '16px 20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#38bdf8', fontWeight: '800', fontSize: '13px' }}>
              <Info size={16} />
              <span>{isRtl ? 'ماذا تقدم لك هذه الأداة؟' : 'What does this tool do?'}</span>
            </div>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.7', color: 'var(--t1, #e2e8f0)' }}>
              {summary}
            </p>
          </div>

          {/* KEY FEATURES */}
          <div>
            <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '800', color: 'var(--t1, #fff)' }}>
              {isRtl ? 'أبرز الإمكانيات والمميزات:' : 'Key Capabilities & Features:'}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--surface2, rgba(255,255,255,0.03))',
                    border: '1px solid var(--edge, rgba(255,255,255,0.06))',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontSize: '13px',
                    color: 'var(--t1, #f1f5f9)',
                    lineHeight: '1.4'
                  }}
                >
                  <CheckCircle2 size={16} style={{ color: '#22c55e', flexShrink: 0, marginTop: '2px' }} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* HOW TO USE (STEPS) */}
          <div style={{
            background: 'rgba(37, 99, 235, 0.04)',
            border: '1px solid rgba(37, 99, 235, 0.15)',
            borderRadius: '14px',
            padding: '16px 20px'
          }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '13.5px', fontWeight: '800', color: '#60a5fa' }}>
              {isRtl ? '💡 خطوات الاستخدام السريع:' : '💡 Quick Start Steps:'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {howToUse.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--t1, #e2e8f0)' }}>
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#2563eb',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--edge, rgba(255,255,255,0.08))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ fontSize: '13px', color: 'var(--t2, #94a3b8)' }}
          >
            {isRtl ? 'إغلاق' : 'Close'}
          </button>

          <button
            onClick={() => {
              setCurrentPage(toolData.page);
              onClose();
            }}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 22px',
              fontWeight: '700',
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
            }}
          >
            <span>{isRtl ? '🚀 فتح الأداة الآن' : '🚀 Open Tool Now'}</span>
            {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          </button>
        </div>

      </div>
    </div>
  );
}
