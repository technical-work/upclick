'use client';

import React, { useState } from 'react';
import { 
  X, 
  Video, 
  Radio, 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Layout, 
  FileText, 
  Film, 
  Upload,
  ArrowRight
} from 'lucide-react';
import { PREBUILT_WEBINAR_TEMPLATES } from './webinarTemplates';

export default function CreateWebinarModal({
  isOpen,
  onClose,
  onCreateWebinar,
  isRtl
}) {
  // Phase 0: Type choice ('on_demand' vs 'live')
  // Phase 1: 4-Step Wizard (1. Details, 2. Form, 3. Video, 4. Templates)
  const [phase, setPhase] = useState('type_select'); // 'type_select' | 'wizard'
  const [webinarType, setWebinarType] = useState('on_demand'); // 'on_demand' | 'live'
  const [wizardStep, setWizardStep] = useState(1); // 1 to 4

  // Form states
  const [webinarName, setWebinarName] = useState('');
  const [selectedForm, setSelectedForm] = useState('Default Webinar Registration Form');
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [selectedTemplateId, setSelectedTemplateId] = useState(PREBUILT_WEBINAR_TEMPLATES[0]?.id || 'tpl_ai_masterclass');
  const [isCustomTemplate, setIsCustomTemplate] = useState(false);

  if (!isOpen) return null;

  const handleContinueFromTypeSelect = () => {
    setPhase('wizard');
    setWizardStep(1);
    if (!webinarName) {
      setWebinarName(isRtl ? (webinarType === 'live' ? 'ويبينار بث مباشر جديد' : 'ويبينار عند الطلب') : (webinarType === 'live' ? 'Live Stream Masterclass' : 'On-Demand Growth Workshop'));
    }
  };

  const handleFinish = () => {
    onCreateWebinar({
      webinarName: webinarName.trim() || 'New Webinar Funnel',
      webinarType,
      selectedForm,
      videoUrl: videoUrl.trim(),
      templateId: isCustomTemplate ? 'blank' : selectedTemplateId
    });
    handleClose();
  };

  const handleClose = () => {
    setPhase('type_select');
    setWizardStep(1);
    setWebinarName('');
    onClose();
  };

  const stepsList = [
    { num: 1, title: isRtl ? 'تفاصيل الويبينار' : 'Webinar details', desc: isRtl ? 'إعداد اسم وعنوان الويبينار' : 'Configure the details of your webinar' },
    { num: 2, title: isRtl ? 'نموذج التسجيل' : 'Select form', desc: isRtl ? 'اختيار نموذج تسجيل المشاهدين' : 'Viewer registration form' },
    { num: 3, title: isRtl ? 'الفيديو أو البث' : 'Select video', desc: isRtl ? 'تحديد مصدر الفيديو أو رابط البث' : 'Choose your pre-recorded webinar' },
    { num: 4, title: isRtl ? 'القوالب الجاهزة' : 'Templates', desc: isRtl ? 'اختر قالباً لبدء مسار الويبينار' : 'Jump start your webinar funnel' }
  ];

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
        maxWidth: phase === 'type_select' ? '680px' : '820px',
        maxHeight: '90vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        color: '#1e293b',
        boxSizing: 'border-box',
        animation: 'scaleUp 0.25s ease'
      }}>
        <style>{`
          @keyframes scaleUp {
            from { transform: scale(0.96); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .ghl-type-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 16px;
          }
          .ghl-type-card {
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justifyContent: space-between;
            min-height: 220px;
            box-sizing: border-box;
          }
          .ghl-type-card:hover {
            border-color: #93c5fd;
            background: #f8fafc;
          }
          .ghl-type-card.selected {
            border-color: #2563eb;
            background: #eff6ff;
            box-shadow: 0 0 0 1px #2563eb;
          }
          .ghl-wizard-layout {
            display: grid;
            grid-template-columns: 240px 1fr;
            min-height: 420px;
            flex: 1;
            min-height: 0;
            box-sizing: border-box;
          }
          .ghl-wizard-sidebar {
            background: #f8fafc;
            border-right: ${isRtl ? 'none' : '1px solid #e2e8f0'};
            border-left: ${isRtl ? '1px solid #e2e8f0' : 'none'};
            padding: 20px 16px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            box-sizing: border-box;
          }
          .ghl-wizard-body {
            padding: 24px;
            display: flex;
            flex-direction: column;
            justifyContent: space-between;
            min-width: 0;
            overflow-y: auto;
            box-sizing: border-box;
          }
          .ghl-template-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
            gap: 12px;
            max-height: 230px;
            overflow-y: auto;
            padding: 2px;
            box-sizing: border-box;
          }
          @media (max-width: 720px) {
            .ghl-wizard-layout {
              grid-template-columns: 1fr;
              display: flex;
              flex-direction: column;
            }
            .ghl-wizard-sidebar {
              border-right: none !important;
              border-left: none !important;
              border-bottom: 1px solid #e2e8f0;
              padding: 12px 16px;
              flex-direction: row;
              overflow-x: auto;
              gap: 12px;
              align-items: center;
            }
            .ghl-step-desc {
              display: none !important;
            }
            .ghl-wizard-body {
              padding: 16px;
            }
          }
        `}</style>

        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          boxSizing: 'border-box'
        }}>
          <div style={{ minWidth: 0, paddingRight: isRtl ? '0' : '10px', paddingLeft: isRtl ? '10px' : '0' }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {phase === 'type_select'
                ? (isRtl ? 'إنشاء مسار ويبينار' : 'Create webinar funnel')
                : (isRtl ? `إنشاء ويبينار (${webinarType === 'live' ? 'بث مباشر' : 'عند الطلب'})` : `Create webinar (${webinarType === 'live' ? 'Live webinar' : 'On demand webinar'})`)
              }
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {phase === 'type_select'
                ? (isRtl ? 'اختر نوع الويبينار المناسب لأهدافك' : 'Select your webinar type')
                : (isRtl ? 'أنشئ مسار الويبينار الخاص بك في بضع خطوات بسيطة!' : 'Build your webinar funnel in just a few easy steps!')
              }
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '6px',
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
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {phase === 'type_select' ? (
            /* PHASE 1: WEBINAR TYPE SELECT (Screenshot 2) */
            <div style={{ padding: '24px 20px', boxSizing: 'border-box' }}>
              <div className="ghl-type-grid">
                
                {/* Option 1: On demand webinar */}
                <div
                  className={`ghl-type-card ${webinarType === 'on_demand' ? 'selected' : ''}`}
                  onClick={() => setWebinarType('on_demand')}
                >
                  {/* Vector Illustration */}
                  <div style={{
                    width: '100%',
                    height: '110px',
                    background: 'linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)',
                    borderRadius: '8px',
                    border: '1px solid #bfdbfe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px',
                    marginBottom: '14px'
                  }}>
                    👨‍💻
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 6px', fontSize: '15.5px', fontWeight: '800', color: '#0f172a' }}>
                      {isRtl ? 'ويبينار عند الطلب (On demand webinar)' : 'On demand webinar'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                      {isRtl ? 'أنشئ مسار ويبينار لفيديو مسجل مسبقاً يبدأ فوراً أو في أوقات مجدولة' : 'Create a webinar funnel for a pre-recorded, on demand webinar'}
                    </p>
                  </div>
                </div>

                {/* Option 2: Live webinar */}
                <div
                  className={`ghl-type-card ${webinarType === 'live' ? 'selected' : ''}`}
                  onClick={() => setWebinarType('live')}
                >
                  {/* Vector Illustration */}
                  <div style={{
                    width: '100%',
                    height: '110px',
                    background: 'linear-gradient(180deg, #fef2f2 0%, #fee2e2 100%)',
                    borderRadius: '8px',
                    border: '1px solid #fecaca',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    fontSize: '40px',
                    marginBottom: '14px'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: isRtl ? 'auto' : '8px',
                      left: isRtl ? '8px' : 'auto',
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: '800',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      LIVE
                    </div>
                    📡
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 6px', fontSize: '15.5px', fontWeight: '800', color: '#0f172a' }}>
                      {isRtl ? 'ويبينار بث مباشر (Live webinar)' : 'Live webinar'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                      {isRtl ? 'أنشئ مسار ويبينار للبث المباشر المجدول مع غرفة انتظار وبث حية' : 'Create a webinar funnel for a live stream webinar'}
                    </p>
                  </div>
                </div>

              </div>

              {/* Footer Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleContinueFromTypeSelect}
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 22px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)'
                  }}
                >
                  <span>{isRtl ? 'متابعة' : 'Continue'}</span>
                  <ArrowRight size={16} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
                </button>
              </div>
            </div>
          ) : (
            /* PHASE 2: 4-STEP WIZARD (Screenshots 3, 4, 5) */
            <div className="ghl-wizard-layout">
              
              {/* Steps Sidebar / Top Bar */}
              <div className="ghl-wizard-sidebar">
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {isRtl ? 'خطوات الإعداد' : 'Steps'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
                  {stepsList.map(s => {
                    const isDone = wizardStep > s.num;
                    const isActive = wizardStep === s.num;
                    return (
                      <div key={s.num} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: isDone ? '#2563eb' : (isActive ? '#2563eb' : '#ffffff'),
                          color: isDone || isActive ? '#ffffff' : '#94a3b8',
                          border: isDone || isActive ? 'none' : '1px solid #cbd5e1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '800',
                          flexShrink: 0
                        }}>
                          {isDone ? <Check size={13} strokeWidth={3} /> : s.num}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
                          <span style={{ fontSize: '12.5px', fontWeight: isActive ? '800' : '600', color: isActive ? '#0f172a' : '#64748b', whiteSpace: 'nowrap' }}>
                            {s.title}
                          </span>
                          <span className="ghl-step-desc" style={{ fontSize: '10.5px', color: '#94a3b8', lineHeight: '1.2' }}>
                            {s.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Wizard Body Content */}
              <div className="ghl-wizard-body">
                
                {/* Step 1: Webinar Details */}
                {wizardStep === 1 && (
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '15.5px', fontWeight: '800', color: '#0f172a' }}>
                      {isRtl ? 'تفاصيل الويبينار' : 'Webinar details'}
                    </h4>
                    <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: '#64748b' }}>
                      {isRtl ? 'أدخل اسم الويبينار المميز' : 'Give your webinar a name'}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                          {isRtl ? 'اسم الويبينار' : 'Webinar Name'}
                        </label>
                        <input
                          type="text"
                          value={webinarName}
                          onChange={(e) => setWebinarName(e.target.value)}
                          placeholder={isRtl ? 'مثال: ماستركلاس مضاعفة المبيعات بالذكاء الاصطناعي' : 'Name for your awesome webinar'}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '13.5px',
                            color: '#0f172a',
                            background: '#ffffff',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                        💡 {isRtl 
                          ? 'سيقوم هذا المعالج بإنشاء مسار كامل من 4 صفحات: صفحة التسجيل، صفحة التأكيد، غرفة البث، وصفحة إعادة العرض والخصم.'
                          : 'This wizard will automatically generate a high-converting 4-step funnel: Registration, Confirmation, Live Broadcast Room, and Replay & Special Offer.'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Configure Form */}
                {wizardStep === 2 && (
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '15.5px', fontWeight: '800', color: '#0f172a' }}>
                      {isRtl ? 'نموذج التسجيل' : 'Configure form'}
                    </h4>
                    <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: '#64748b' }}>
                      {isRtl ? 'اختر نموذج التسجيل المخصص للويبينار' : 'Select a form for webinar registration'}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                          {isRtl ? 'اختر النموذج' : 'Select Form'}
                        </label>
                        <select
                          value={selectedForm}
                          onChange={(e) => setSelectedForm(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '13.5px',
                            color: '#0f172a',
                            background: '#ffffff',
                            boxSizing: 'border-box'
                          }}
                        >
                          <option value="Default Webinar Registration Form">Default Webinar Registration Form (Name, Email, WhatsApp)</option>
                          <option value="VIP Lead Capture Form">VIP Lead Capture Form</option>
                          <option value="Masterclass Pass Form">Masterclass Pass Form</option>
                          <option value="Custom Embed Form">Custom Lead Form</option>
                        </select>
                      </div>

                      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#1e40af' }}>
                        📋 {isRtl
                          ? 'يتم ربط بيانات المسجلين تلقائياً بتبويب «المشتركون والحضور» لسهولة المتابعة والإحصائيات.'
                          : 'Registrant details will automatically populate your Webinar Attendees table and trigger confirmation emails.'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Select Video / Stream */}
                {wizardStep === 3 && (
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '15.5px', fontWeight: '800', color: '#0f172a' }}>
                      {isRtl ? 'اختيار الفيديو أو رابط البث' : 'Select video'}
                    </h4>
                    <p style={{ margin: '0 0 16px', fontSize: '12.5px', color: '#64748b' }}>
                      {isRtl ? 'اختر الفيديو المسجل للويبينار أو رابط البث' : 'Choose your pre-recorded webinar or stream URL'}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                          {isRtl ? 'رابط الفيديو (YouTube / Vimeo / MP4 / Live)' : 'Video / Stream URL'}
                        </label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <input
                            type="text"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            style={{
                              flex: 1,
                              minWidth: '180px',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              fontSize: '13px',
                              color: '#0f172a',
                              background: '#ffffff',
                              boxSizing: 'border-box'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
                            style={{
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              padding: '0 12px',
                              fontSize: '12.5px',
                              fontWeight: '600',
                              color: '#475569',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              height: '40px'
                            }}
                          >
                            <Upload size={14} />
                            <span>{isRtl ? 'استعراض' : 'Browse'}</span>
                          </button>
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#64748b' }}>
                        🎥 {isRtl
                          ? 'يمكنك تغيير رابط الفيديو أو إضافة فيديوهات وبثوث متعددة في أي وقت من إعدادات الويبينار.'
                          : 'You can update this video source or link custom embedded players at any time in Webinar Settings.'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Choose Template */}
                {wizardStep === 4 && (
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '15.5px', fontWeight: '800', color: '#0f172a' }}>
                      {isRtl ? 'اختر قالباً لمسار الويبينار' : 'Templates'}
                    </h4>
                    <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#64748b' }}>
                      {isRtl ? 'اختر من القوالب المصممة بعناية لتحقيق أعلى معدلات تسجيل ومبيعات' : 'Choose a proven high-converting template to jump start your webinar'}
                    </p>

                    <div className="ghl-template-grid">
                      {PREBUILT_WEBINAR_TEMPLATES.map((tpl) => {
                        const isSelected = !isCustomTemplate && selectedTemplateId === tpl.id;
                        return (
                          <div
                            key={tpl.id}
                            onClick={() => { setIsCustomTemplate(false); setSelectedTemplateId(tpl.id); }}
                            style={{
                              border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                              background: isSelected ? '#eff6ff' : '#ffffff',
                              borderRadius: '8px',
                              padding: '10px',
                              cursor: 'pointer',
                              display: 'flex',
                              gap: '10px',
                              alignItems: 'center',
                              transition: 'all 0.15s ease',
                              boxSizing: 'border-box',
                              minWidth: 0
                            }}
                          >
                            <img src={tpl.thumbnail} alt={tpl.name} style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {isRtl ? tpl.nameAr : tpl.name}
                              </div>
                              <div style={{ fontSize: '10.5px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tpl.category}</div>
                            </div>
                            {isSelected && <Check size={16} color="#2563eb" strokeWidth={3} style={{ flexShrink: 0 }} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Wizard Bottom Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (wizardStep === 1) {
                        setPhase('type_select');
                      } else {
                        setWizardStep(prev => Math.max(1, prev - 1));
                      }
                    }}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#475569',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {isRtl ? 'السابق' : 'Prev'}
                  </button>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {wizardStep < 4 ? (
                      <button
                        type="button"
                        onClick={() => setWizardStep(prev => Math.min(4, prev + 1))}
                        style={{
                          background: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          padding: '8px 18px',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        {isRtl ? 'التالي' : 'Next'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleFinish}
                        style={{
                          background: '#16a34a',
                          color: '#ffffff',
                          border: 'none',
                          padding: '8px 20px',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {isRtl ? 'إنشاء مسار الويبينار 🚀' : 'Create Webinar Funnel 🚀'}
                      </button>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
