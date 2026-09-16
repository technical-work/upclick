'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Globe,
  Star,
  Phone,
  MessageSquare,
  Mail,
  CreditCard,
  MessageCircle,
  Layers,
  FileText,
  CheckSquare,
  Award,
  UserCheck,
  Contact,
  Briefcase,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  Check,
  Copy,
  Download,
  Wallet,
  Sparkles,
  Palette,
  Shapes,
  Image as ImageIcon,
  ExternalLink,
  QrCode,
  Share2,
  Sliders,
  ChevronDown,
  Upload,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { QR_TYPES, COUNTRY_CODES, buildQRTargetPayload, generateQRDataURL, generateQRSVGString } from './qrUtils';

export default function CreateQRCodeModal({
  isOpen = true,
  isRtl = false,
  onClose,
  onSave,
  existingQR = null,
  funnels = [],
  forms = [],
  surveys = [],
  quizzes = [],
  showToast = () => {}
}) {
  const [currentStep, setCurrentStep] = useState(1); // 1: Choose type, 2: Additional information, 3: QR color & shape
  const [qrName, setQrName] = useState(existingQR?.name || `QR-${Date.now()}`);
  const [selectedType, setSelectedType] = useState(existingQR?.type || 'website');
  
  // Step 2 Form Data
  const [formData, setFormData] = useState(existingQR?.data || {
    url: '',
    countryCode: '+20',
    phone: '',
    message: '',
    email: '',
    subject: '',
    body: '',
    paymentUrl: '',
    funnelId: funnels[0]?.id || '',
    formId: forms[0]?.id || '',
    surveyId: surveys[0]?.id || '',
    quizId: quizzes[0]?.id || '',
    firstName: '',
    lastName: '',
    company: '',
    jobTitle: '',
    website: '',
    appUrl: '',
    profileUrl: ''
  });

  // Step 3 Design Settings
  const [design, setDesign] = useState(existingQR?.design || {
    bgColor: '#ffffff',
    dotsColor: '#000000',
    markerBorderColor: '#000000',
    markerCenterColor: '#000000',
    bodyShape: 'square', // 'square' | 'rounded' | 'dots' | 'classy'
    eyeFrame: 'square', // 'square' | 'rounded' | 'circle'
    eyeCenter: 'square', // 'square' | 'dot' | 'circle'
    logo: null, // null | 'whatsapp' | 'phone' | 'website' | 'google' | 'upklick' | dataUrl
    logoPreset: ''
  });

  const [activeAccordion, setActiveAccordion] = useState('shape'); // 'color' | 'shape' | 'logo'
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const fileInputRef = useRef(null);

  // Compute final payload
  const targetPayload = useMemo(() => {
    return buildQRTargetPayload(selectedType, formData);
  }, [selectedType, formData]);

  // Update QR code live preview with full custom design properties
  useEffect(() => {
    let isMounted = true;
    generateQRDataURL(targetPayload, {
      bg: design.bgColor || '#ffffff',
      dotsColor: design.dotsColor || '#000000',
      markerBorderColor: design.markerBorderColor || design.dotsColor || '#000000',
      markerCenterColor: design.markerCenterColor || design.dotsColor || '#000000',
      bodyShape: design.bodyShape || 'square',
      eyeFrame: design.eyeFrame || 'square',
      eyeCenter: design.eyeCenter || 'square',
      logo: design.logo || null,
      logoPreset: design.logoPreset || '',
      margin: 2,
      width: 420
    }).then((url) => {
      if (isMounted && url) setQrDataUrl(url);
    });
    return () => { isMounted = false; };
  }, [
    targetPayload,
    design.bgColor,
    design.dotsColor,
    design.markerBorderColor,
    design.markerCenterColor,
    design.bodyShape,
    design.eyeFrame,
    design.eyeCenter,
    design.logo,
    design.logoPreset
  ]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast(isRtl ? 'حجم الصورة كبير جداً (الحد الأقصى 2MB)' : 'File too large (Max 2MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      setDesign((prev) => ({
        ...prev,
        logo: dataUrl,
        logoPreset: ''
      }));
      showToast(isRtl ? 'تم رفع الشعار وتطبيقه في منتصف رمز QR' : 'Custom logo uploaded and centered');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setDesign((prev) => ({
      ...prev,
      logo: null,
      logoPreset: ''
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast(isRtl ? 'تمت إزالة الشعار' : 'Logo removed');
  };

  const handleSaveQR = () => {
    const newQR = {
      id: existingQR?.id || `qr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: qrName.trim() || `QR-${Date.now()}`,
      type: selectedType,
      data: formData,
      design,
      targetPayload,
      previewDataUrl: qrDataUrl,
      scans: existingQR?.scans || 0,
      createdAt: existingQR?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analytics: existingQR?.analytics || { totalScans: 0, uniqueScans: 0 }
    };

    if (onSave) onSave(newQR);
    if (showToast) showToast(isRtl ? 'تم حفظ رمز QR بنجاح!' : 'QR Code saved successfully!');
    if (onClose) onClose();
  };

  const handleDownload = async (format = 'png') => {
    const designOpts = {
      bg: design.bgColor || '#ffffff',
      dotsColor: design.dotsColor || '#000000',
      markerBorderColor: design.markerBorderColor || design.dotsColor || '#000000',
      markerCenterColor: design.markerCenterColor || design.dotsColor || '#000000',
      bodyShape: design.bodyShape || 'square',
      eyeFrame: design.eyeFrame || 'square',
      eyeCenter: design.eyeCenter || 'square',
      logo: design.logo || null,
      logoPreset: design.logoPreset || ''
    };

    if (format === 'png') {
      const dataUrl = qrDataUrl || (await generateQRDataURL(targetPayload, { ...designOpts, width: 600 }));
      const link = document.createElement('a');
      link.download = `${qrName || 'qrcode'}.png`;
      link.href = dataUrl;
      link.click();
    } else {
      const svgString = await generateQRSVGString(targetPayload, designOpts);
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${qrName || 'qrcode'}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
    showToast(isRtl ? `تم تحميل رمز QR بصيغة ${format.toUpperCase()}` : `QR Code downloaded as ${format.toUpperCase()}`);
  };

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(targetPayload);
      setCopiedLink(true);
      showToast(isRtl ? 'تم نسخ الرابط إلى الحافظة' : 'Target payload copied to clipboard');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const renderTypeIcon = (iconName, size = 20) => {
    switch (iconName) {
      case 'Globe': return <Globe size={size} />;
      case 'Star': return <Star size={size} />;
      case 'Phone': return <Phone size={size} />;
      case 'MessageSquare': return <MessageSquare size={size} />;
      case 'Mail': return <Mail size={size} />;
      case 'CreditCard': return <CreditCard size={size} />;
      case 'MessageCircle': return <MessageCircle size={size} />;
      case 'Layers': return <Layers size={size} />;
      case 'FileText': return <FileText size={size} />;
      case 'CheckSquare': return <CheckSquare size={size} />;
      case 'Award': return <Award size={size} />;
      case 'UserCheck': return <UserCheck size={size} />;
      case 'Contact': return <Contact size={size} />;
      case 'Briefcase': return <Briefcase size={size} />;
      case 'Smartphone': return <Smartphone size={size} />;
      default: return <Globe size={size} />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '12px',
        animation: 'fadeIn 0.2s ease',
        direction: isRtl ? 'rtl' : 'ltr'
      }}
      onClick={onClose}
    >
      <style>{`
        .qr-modal-container {
          background: var(--surface);
          border: 1px solid var(--edge);
          border-radius: 18px;
          max-width: 940px;
          width: 95vw;
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45);
          overflow: hidden;
        }
        .qr-body-grid {
          flex: 1;
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(230px, 0.9fr);
          overflow-y: auto;
          min-height: 380px;
        }
        .qr-type-grid-5 {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 7px;
        }
        .qr-type-card-item {
          background: var(--surface2);
          border: 1px solid var(--edge);
          border-radius: 10px;
          padding: 8px 3px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justifyContent: center;
          gap: 5px;
          cursor: pointer;
          text-align: center;
          transition: all 0.15s ease;
          min-height: 64px;
        }
        .qr-type-card-item:hover {
          border-color: var(--a);
          background: rgba(37, 99, 235, 0.04);
          transform: translateY(-1px);
        }
        .qr-type-card-item.selected {
          background: rgba(37, 99, 235, 0.09);
          border: 2px solid var(--a);
        }
        .qr-phone-frame {
          width: 200px;
          height: 330px;
          background: #0f172a;
          border-radius: 28px;
          border: 6px solid #334155;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.35);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }
        @media (max-width: 860px) {
          .qr-body-grid {
            grid-template-columns: 1fr;
          }
          .qr-type-grid-5 {
            grid-template-columns: repeat(3, 1fr);
          }
          .qr-phone-frame {
            width: 170px;
            height: 260px;
          }
        }
        @media (max-width: 520px) {
          .qr-modal-container {
            width: 98vw;
            max-height: 94vh;
            border-radius: 12px;
          }
          .qr-type-grid-5 {
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
          }
        }
      `}</style>
      <div
        className="qr-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--edge)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(37, 99, 235, 0.12)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <QrCode size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: 'var(--t1)' }}>
                {isRtl ? 'إنشاء رمز QR' : 'Create QR code'}
              </h2>
              <div style={{ fontSize: '11.5px', color: 'var(--t2)', marginTop: '1px' }}>
                {isRtl ? 'أنشئ وخصص رمز QR احترافي بكل سهولة' : 'Generate your QR with ease'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--surface2)',
              border: 'none',
              borderRadius: '7px',
              padding: '6px',
              color: 'var(--t2)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div
          style={{
            padding: '10px 20px',
            borderBottom: '1px solid var(--edge)',
            background: 'var(--surface2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px'
          }}
        >
          {[
            { step: 1, label: isRtl ? 'اختيار النوع' : 'Choose type' },
            { step: 2, label: isRtl ? 'معلومات إضافية' : 'Additional information' },
            { step: 3, label: isRtl ? 'الألوان والتصميم' : 'QR color and shape' }
          ].map((s, idx) => {
            const isPassed = currentStep > s.step;
            const isCurrent = currentStep === s.step;

            return (
              <React.Fragment key={s.step}>
                <div
                  onClick={() => setCurrentStep(s.step)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    cursor: 'pointer',
                    opacity: isCurrent || isPassed ? 1 : 0.5
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: isPassed ? '#10b981' : (isCurrent ? 'var(--a)' : 'transparent'),
                      border: isPassed ? 'none' : (isCurrent ? 'none' : '2px solid var(--t2)'),
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: '800'
                    }}
                  >
                    {isPassed ? <Check size={12} /> : s.step}
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: isCurrent ? '700' : '500',
                      color: isCurrent ? 'var(--a)' : 'var(--t1)'
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div
                    style={{
                      width: '28px',
                      height: '2px',
                      background: isPassed ? '#10b981' : 'var(--edge)'
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Modal Body: 2 Columns (Form on left, Mobile Mockup / Live QR on right) */}
        <div className="qr-body-grid">
          {/* Left Column (Inputs / Choices) */}
          <div style={{ padding: '18px 20px', borderRight: isRtl ? 'none' : '1px solid var(--edge)', borderLeft: isRtl ? '1px solid var(--edge)' : 'none', overflowY: 'auto' }}>
            {/* Step 1: Type Selection */}
            {currentStep === 1 && (
              <div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: 'var(--t2)', marginBottom: '5px' }}>
                    {isRtl ? 'اسم رمز الـ QR' : 'QR code name'}
                  </label>
                  <input
                    type="text"
                    value={qrName}
                    onChange={(e) => setQrName(e.target.value)}
                    placeholder="QR-1789540418936"
                    style={{
                      width: '100%',
                      background: 'var(--surface2)',
                      border: '1px solid var(--edge)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '13px',
                      color: 'var(--t1)',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--t1)', marginBottom: '10px' }}>
                  {isRtl ? 'حدد نوع رمز الـ QR (يدعم الروابط الديناميكية)' : "Select QR type (dynamic URL's supported)"}
                </div>

                <div className="qr-type-grid-5">
                  {QR_TYPES.map((t) => {
                    const isSelected = selectedType === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedType(t.id)}
                        className={`qr-type-card-item ${isSelected ? 'selected' : ''}`}
                      >
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '6px',
                            background: isSelected ? 'var(--a)' : 'var(--surface)',
                            color: isSelected ? '#fff' : 'var(--t1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {renderTypeIcon(t.icon, 14)}
                        </div>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: '700',
                            color: isSelected ? 'var(--a)' : 'var(--t1)',
                            lineHeight: 1.15,
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={isRtl ? t.labelAr : t.label}
                        >
                          {isRtl ? t.labelAr : t.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Additional Info Inputs */}
            {currentStep === 2 && (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--t1)', margin: '0 0 16px' }}>
                  {isRtl ? `بيانات ${QR_TYPES.find(t => t.id === selectedType)?.labelAr || 'الرمز'}` : `Configure ${QR_TYPES.find(t => t.id === selectedType)?.label || 'QR'}`}
                </h3>

                {/* Call Type */}
                {selectedType === 'call' && (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                      value={formData.countryCode || '+20'}
                      onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                      style={{
                        width: '130px',
                        background: 'var(--surface2)',
                        border: '1px solid var(--edge)',
                        borderRadius: '8px',
                        padding: '10px',
                        color: 'var(--t1)',
                        fontSize: '13px'
                      }}
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="11 45680938"
                      style={{
                        flex: 1,
                        background: 'var(--surface2)',
                        border: '1px solid var(--edge)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        color: 'var(--t1)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                )}

                {/* Website / Review */}
                {(selectedType === 'website' || selectedType === 'review') && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--t2)', marginBottom: '6px' }}>
                      {selectedType === 'review' ? (isRtl ? 'رابط صفحة التقييم (Google / Trustpilot)' : 'Review Page URL') : (isRtl ? 'رابط الموقع المستهدف' : 'Target Website URL')}
                    </label>
                    <input
                      type="url"
                      value={formData.url || ''}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://yourwebsite.com/offer"
                      style={{
                        width: '100%',
                        background: 'var(--surface2)',
                        border: '1px solid var(--edge)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        color: 'var(--t1)',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                )}

                {/* WhatsApp */}
                {selectedType === 'whatsapp' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <select
                        value={formData.countryCode || '+20'}
                        onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                        style={{ width: '130px', background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '8px', padding: '10px', color: 'var(--t1)' }}
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="11 45680938"
                        style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '8px', padding: '10px 14px', color: 'var(--t1)' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--t2)', marginBottom: '6px' }}>
                        {isRtl ? 'الرسالة الترحيبية المسبقة' : 'Prefilled WhatsApp Message'}
                      </label>
                      <textarea
                        rows={3}
                        value={formData.message || ''}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={isRtl ? 'مرحباً، أود الاستفسار بخصوص...' : 'Hi, I want to inquire about...'}
                        style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '8px', padding: '10px 14px', color: 'var(--t1)' }}
                      />
                    </div>
                  </div>
                )}

                {/* SMS */}
                {selectedType === 'sms' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <select
                        value={formData.countryCode || '+20'}
                        onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                        style={{ width: '130px', background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '8px', padding: '10px', color: 'var(--t1)' }}
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="11 45680938"
                        style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '8px', padding: '10px 14px', color: 'var(--t1)' }}
                      />
                    </div>
                    <textarea
                      rows={3}
                      value={formData.message || ''}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={isRtl ? 'نص الرسالة القصيرة...' : 'SMS body text...'}
                      style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '8px', padding: '10px 14px', color: 'var(--t1)' }}
                    />
                  </div>
                )}

                {/* Email */}
                {selectedType === 'email' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="support@yourbusiness.com"
                      style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '8px', padding: '10px 14px', color: 'var(--t1)' }}
                    />
                    <input
                      type="text"
                      value={formData.subject || ''}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder={isRtl ? 'عنوان الرسالة' : 'Email Subject'}
                      style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '8px', padding: '10px 14px', color: 'var(--t1)' }}
                    />
                    <textarea
                      rows={3}
                      value={formData.body || ''}
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                      placeholder={isRtl ? 'نص البريد الإلكتروني...' : 'Email content...'}
                      style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '8px', padding: '10px 14px', color: 'var(--t1)' }}
                    />
                  </div>
                )}

                {/* Funnel Link */}
                {selectedType === 'funnel' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--t2)', marginBottom: '6px' }}>
                      {isRtl ? 'اختر الفانل' : 'Select Funnel'}
                    </label>
                    <select
                      value={formData.funnelId}
                      onChange={(e) => setFormData({ ...formData, funnelId: e.target.value })}
                      style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '8px', padding: '10px 14px', color: 'var(--t1)', fontSize: '14px' }}
                    >
                      {funnels.map((f) => (
                        <option key={f.id} value={f.id}>{f.name} (ID: {f.id})</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Form Link */}
                {selectedType === 'form' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--t2)', marginBottom: '6px' }}>
                      {isRtl ? 'اختر النموذج' : 'Select Form'}
                    </label>
                    <select
                      value={formData.formId}
                      onChange={(e) => setFormData({ ...formData, formId: e.target.value })}
                      style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '8px', padding: '10px 14px', color: 'var(--t1)', fontSize: '14px' }}
                    >
                      {forms.map((f) => (
                        <option key={f.id} value={f.id}>{f.name || f.title || f.id}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Survey Link */}
                {selectedType === 'survey' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--t2)', marginBottom: '6px' }}>
                      {isRtl ? 'اختر الاستبيان' : 'Select Survey'}
                    </label>
                    <select
                      value={formData.surveyId}
                      onChange={(e) => setFormData({ ...formData, surveyId: e.target.value })}
                      style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '8px', padding: '10px 14px', color: 'var(--t1)', fontSize: '14px' }}
                    >
                      {surveys.map((s) => (
                        <option key={s.id} value={s.id}>{s.name || s.id}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Quiz Link */}
                {selectedType === 'quiz' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--t2)', marginBottom: '6px' }}>
                      {isRtl ? 'اختر الاختبار' : 'Select Quiz'}
                    </label>
                    <select
                      value={formData.quizId}
                      onChange={(e) => setFormData({ ...formData, quizId: e.target.value })}
                      style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '8px', padding: '10px 14px', color: 'var(--t1)', fontSize: '14px' }}
                    >
                      {quizzes.map((q) => (
                        <option key={q.id} value={q.id}>{q.name} (Passing: {q.passingScore || 70}%)</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* VCard & Business Card */}
                {(selectedType === 'vcard' || selectedType === 'business_card') && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input
                      type="text"
                      value={formData.firstName || ''}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder={isRtl ? 'الاسم الأول' : 'First Name'}
                      style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '8px', padding: '9px 12px', color: 'var(--t1)' }}
                    />
                    <input
                      type="text"
                      value={formData.lastName || ''}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder={isRtl ? 'الاسم الأخير' : 'Last Name'}
                      style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '8px', padding: '9px 12px', color: 'var(--t1)' }}
                    />
                    <input
                      type="text"
                      value={formData.company || ''}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder={isRtl ? 'اسم الشركة' : 'Company Name'}
                      style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '8px', padding: '9px 12px', color: 'var(--t1)' }}
                    />
                    <input
                      type="text"
                      value={formData.jobTitle || ''}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      placeholder={isRtl ? 'المسمى الوظيفي' : 'Job Title'}
                      style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '8px', padding: '9px 12px', color: 'var(--t1)' }}
                    />
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder={isRtl ? 'رقم الهاتف' : 'Phone Number'}
                      style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '8px', padding: '9px 12px', color: 'var(--t1)' }}
                    />
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                      style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '8px', padding: '9px 12px', color: 'var(--t1)' }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Color and Shape */}
            {currentStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Accordion 1: Color */}
                <div style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '12px', overflow: 'hidden' }}>
                  <div
                    onClick={() => setActiveAccordion(activeAccordion === 'color' ? null : 'color')}
                    style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontWeight: '700', fontSize: '13.5px', color: 'var(--t1)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Palette size={16} color="var(--a)" />
                      <span>{isRtl ? 'الألوان ولوحة التصميم' : 'Colors & Theme'}</span>
                    </div>
                    <ChevronDown size={16} style={{ transform: activeAccordion === 'color' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>

                  {activeAccordion === 'color' && (
                    <div style={{ padding: '14px 16px', borderTop: '1px solid var(--edge)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {/* Palette Presets */}
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--t2)', marginBottom: '8px' }}>
                          {isRtl ? 'قوالب ألوان جاهزة بضغطة واحدة' : 'Preset Color Themes'}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {[
                            { name: isRtl ? 'كلاسيكي' : 'Classic', bg: '#ffffff', dots: '#000000', border: '#000000', center: '#000000' },
                            { name: isRtl ? 'أزرق ملكي' : 'Royal Blue', bg: '#ffffff', dots: '#2563eb', border: '#1d4ed8', center: '#2563eb' },
                            { name: isRtl ? 'أخضر زمردي' : 'Emerald', bg: '#ffffff', dots: '#16a34a', border: '#15803d', center: '#16a34a' },
                            { name: isRtl ? 'بنفسجي أنيق' : 'Indigo', bg: '#ffffff', dots: '#7c3aed', border: '#6d28d9', center: '#7c3aed' },
                            { name: isRtl ? 'برتقالي دافئ' : 'Amber', bg: '#ffffff', dots: '#ea580c', border: '#c2410c', center: '#ea580c' },
                            { name: isRtl ? 'أحمر قرمزي' : 'Crimson', bg: '#ffffff', dots: '#dc2626', border: '#b91c1c', center: '#dc2626' },
                            { name: isRtl ? 'ليلي داكن' : 'Dark Mode', bg: '#0f172a', dots: '#38bdf8', border: '#0284c7', center: '#38bdf8' }
                          ].map((p, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setDesign((prev) => ({
                                  ...prev,
                                  bgColor: p.bg,
                                  dotsColor: p.dots,
                                  markerBorderColor: p.border,
                                  markerCenterColor: p.center
                                }));
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '5px 10px',
                                borderRadius: '7px',
                                background: design.dotsColor === p.dots && design.bgColor === p.bg ? 'rgba(37, 99, 235, 0.12)' : 'var(--surface)',
                                border: design.dotsColor === p.dots && design.bgColor === p.bg ? '1.5px solid var(--a)' : '1px solid var(--edge)',
                                cursor: 'pointer',
                                fontSize: '11.5px',
                                fontWeight: '700',
                                color: 'var(--t1)'
                              }}
                            >
                              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: p.dots, border: '1px solid rgba(0,0,0,0.1)', display: 'inline-block' }} />
                              <span>{p.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Color Pickers Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        {/* Background Color */}
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--t2)', marginBottom: '4px' }}>
                            {isRtl ? 'لون الخلفية' : 'Background Color'}
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="color"
                              value={design.bgColor}
                              onChange={(e) => setDesign({ ...design, bgColor: e.target.value })}
                              style={{ width: '32px', height: '32px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }}
                            />
                            <input
                              type="text"
                              value={design.bgColor}
                              onChange={(e) => setDesign({ ...design, bgColor: e.target.value })}
                              style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '6px', padding: '6px 8px', fontSize: '12px', color: 'var(--t1)', fontWeight: '600' }}
                            />
                          </div>
                        </div>

                        {/* Dots Color */}
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--t2)', marginBottom: '4px' }}>
                            {isRtl ? 'لون النقاط والباركود' : 'Dots / QR Color'}
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="color"
                              value={design.dotsColor}
                              onChange={(e) => setDesign({ ...design, dotsColor: e.target.value })}
                              style={{ width: '32px', height: '32px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }}
                            />
                            <input
                              type="text"
                              value={design.dotsColor}
                              onChange={(e) => setDesign({ ...design, dotsColor: e.target.value })}
                              style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '6px', padding: '6px 8px', fontSize: '12px', color: 'var(--t1)', fontWeight: '600' }}
                            />
                          </div>
                        </div>

                        {/* Marker Border Color */}
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--t2)', marginBottom: '4px' }}>
                            {isRtl ? 'لون إطار زوايا الأعين' : 'Eye Frame Color'}
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="color"
                              value={design.markerBorderColor || design.dotsColor}
                              onChange={(e) => setDesign({ ...design, markerBorderColor: e.target.value })}
                              style={{ width: '32px', height: '32px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }}
                            />
                            <input
                              type="text"
                              value={design.markerBorderColor || design.dotsColor}
                              onChange={(e) => setDesign({ ...design, markerBorderColor: e.target.value })}
                              style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '6px', padding: '6px 8px', fontSize: '12px', color: 'var(--t1)', fontWeight: '600' }}
                            />
                          </div>
                        </div>

                        {/* Marker Center Color */}
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--t2)', marginBottom: '4px' }}>
                            {isRtl ? 'لون مركز زوايا الأعين' : 'Eye Center Color'}
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                              type="color"
                              value={design.markerCenterColor || design.dotsColor}
                              onChange={(e) => setDesign({ ...design, markerCenterColor: e.target.value })}
                              style={{ width: '32px', height: '32px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'transparent' }}
                            />
                            <input
                              type="text"
                              value={design.markerCenterColor || design.dotsColor}
                              onChange={(e) => setDesign({ ...design, markerCenterColor: e.target.value })}
                              style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '6px', padding: '6px 8px', fontSize: '12px', color: 'var(--t1)', fontWeight: '600' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion 2: Shape & Form */}
                <div style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '12px', overflow: 'hidden' }}>
                  <div
                    onClick={() => setActiveAccordion(activeAccordion === 'shape' ? null : 'shape')}
                    style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontWeight: '700', fontSize: '13.5px', color: 'var(--t1)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Shapes size={16} color="#10b981" />
                      <span>{isRtl ? 'الأشكال ونمط الإطار' : 'Shape & Eye Corners'}</span>
                    </div>
                    <ChevronDown size={16} style={{ transform: activeAccordion === 'shape' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>

                  {activeAccordion === 'shape' && (
                    <div style={{ padding: '14px 16px', borderTop: '1px solid var(--edge)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {/* Section 1: Eye Frames */}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--t1)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>{isRtl ? 'شكل زوايا الأعين (Eye Frames)' : 'Eye Corner Frame Style'}</span>
                          <span style={{ fontSize: '11px', color: 'var(--t2)', fontWeight: '600' }}>{design.eyeFrame || 'square'}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                          {[
                            { id: 'square', label: isRtl ? 'مربع (Square)' : 'Square', rx: '0' },
                            { id: 'rounded', label: isRtl ? 'مستدير (Rounded)' : 'Rounded', rx: '6px' },
                            { id: 'circle', label: isRtl ? 'دائري (Circle)' : 'Circle', rx: '50%' }
                          ].map((shape) => {
                            const isSelected = (design.eyeFrame || 'square') === shape.id;
                            return (
                              <button
                                key={shape.id}
                                type="button"
                                onClick={() => setDesign({ ...design, eyeFrame: shape.id })}
                                style={{
                                  padding: '10px 8px',
                                  background: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'var(--surface)',
                                  border: isSelected ? '2px solid var(--a)' : '1px solid var(--edge)',
                                  borderRadius: '10px',
                                  color: 'var(--t1)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: '8px',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {/* Visual Eye Frame Graphic */}
                                <div
                                  style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: shape.rx,
                                    border: `3.5px solid ${isSelected ? 'var(--a)' : 'var(--t1)'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'transparent'
                                  }}
                                >
                                  <div
                                    style={{
                                      width: '14px',
                                      height: '14px',
                                      borderRadius: shape.rx === '50%' ? '50%' : shape.rx === '6px' ? '3px' : '0px',
                                      background: isSelected ? 'var(--a)' : 'var(--t1)'
                                    }}
                                  />
                                </div>
                                <span style={{ fontSize: '11.5px', fontWeight: isSelected ? '800' : '600' }}>
                                  {shape.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section 2: Eye Center Eyeball */}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--t1)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>{isRtl ? 'شكل مركز العين (Eye Center)' : 'Eye Center Eyeball'}</span>
                          <span style={{ fontSize: '11px', color: 'var(--t2)', fontWeight: '600' }}>{design.eyeCenter || 'square'}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                          {[
                            { id: 'square', label: isRtl ? 'مربع' : 'Square' },
                            { id: 'rounded', label: isRtl ? 'مستدير' : 'Rounded' },
                            { id: 'circle', label: isRtl ? 'دائري / نقطة' : 'Circle / Dot' }
                          ].map((item) => {
                            const isSelected = (design.eyeCenter || 'square') === item.id;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setDesign({ ...design, eyeCenter: item.id })}
                                style={{
                                  padding: '8px',
                                  background: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'var(--surface)',
                                  border: isSelected ? '2px solid var(--a)' : '1px solid var(--edge)',
                                  borderRadius: '8px',
                                  color: 'var(--t1)',
                                  cursor: 'pointer',
                                  fontSize: '11.5px',
                                  fontWeight: isSelected ? '800' : '600'
                                }}
                              >
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section 3: Body Dots Pattern */}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--t1)', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>{isRtl ? 'نمط وشكل النقاط (Body Pattern)' : 'Body Dots Pattern'}</span>
                          <span style={{ fontSize: '11px', color: 'var(--t2)', fontWeight: '600' }}>{design.bodyShape || 'square'}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                          {[
                            { id: 'square', label: isRtl ? 'مربعات' : 'Squares' },
                            { id: 'rounded', label: isRtl ? 'ناعمة' : 'Rounded' },
                            { id: 'dots', label: isRtl ? 'دوائر' : 'Dots' },
                            { id: 'classy', label: isRtl ? 'عصري' : 'Classy' }
                          ].map((p) => {
                            const isSelected = (design.bodyShape || 'square') === p.id;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => setDesign({ ...design, bodyShape: p.id })}
                                style={{
                                  padding: '8px 4px',
                                  background: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'var(--surface)',
                                  border: isSelected ? '2px solid var(--a)' : '1px solid var(--edge)',
                                  borderRadius: '8px',
                                  color: 'var(--t1)',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  fontWeight: isSelected ? '800' : '600',
                                  textAlign: 'center'
                                }}
                              >
                                {p.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Accordion 3: Logo */}
                <div style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '12px', overflow: 'hidden' }}>
                  <div
                    onClick={() => setActiveAccordion(activeAccordion === 'logo' ? null : 'logo')}
                    style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontWeight: '700', fontSize: '13.5px', color: 'var(--t1)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ImageIcon size={16} color="#f59e0b" />
                      <span>{isRtl ? 'شعار في المنتصف' : 'Center Logo'}</span>
                    </div>
                    <ChevronDown size={16} style={{ transform: activeAccordion === 'logo' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </div>

                  {activeAccordion === 'logo' && (
                    <div style={{ padding: '14px 16px', borderTop: '1px solid var(--edge)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {/* Preset Icons */}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--t1)', marginBottom: '8px' }}>
                          {isRtl ? 'اختر أيقونة بارزة في المنتصف' : 'Choose Preset Icon'}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {[
                            { id: 'none', label: isRtl ? 'بدون شعار' : 'None', icon: null },
                            { id: 'whatsapp', label: 'WhatsApp', color: '#22c55e' },
                            { id: 'phone', label: isRtl ? 'اتصال' : 'Call', color: '#2563eb' },
                            { id: 'website', label: isRtl ? 'موقع' : 'Website', color: '#0284c7' },
                            { id: 'star', label: isRtl ? 'تقييم' : 'Review', color: '#f59e0b' },
                            { id: 'mail', label: isRtl ? 'بريد' : 'Email', color: '#dc2626' },
                            { id: 'upklick', label: 'UpKlick', color: '#7c3aed' }
                          ].map((preset) => {
                            const isSelected = (!design.logo && (design.logoPreset === preset.id || (!design.logoPreset && preset.id === 'none')));
                            return (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => setDesign({ ...design, logoPreset: preset.id, logo: null })}
                                style={{
                                  padding: '6px 12px',
                                  background: isSelected ? 'rgba(245, 158, 11, 0.15)' : 'var(--surface)',
                                  border: isSelected ? '1.5px solid #f59e0b' : '1px solid var(--edge)',
                                  borderRadius: '7px',
                                  color: 'var(--t1)',
                                  fontSize: '12px',
                                  fontWeight: isSelected ? '800' : '600',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                              >
                                {preset.color && (
                                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: preset.color }} />
                                )}
                                <span>{preset.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom Logo Upload */}
                      <div style={{ borderTop: '1px solid var(--edge)', paddingTop: '12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--t1)', marginBottom: '8px' }}>
                          {isRtl ? 'أو ارفع شعار علامتك التجارية الخاصة' : 'Or Upload Custom Brand Logo'}
                        </div>

                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleLogoUpload}
                          style={{ display: 'none' }}
                        />

                        {design.logo ? (
                          <div
                            style={{
                              background: 'var(--surface)',
                              border: '1.5px solid var(--a)',
                              borderRadius: '10px',
                              padding: '10px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <img
                                src={design.logo}
                                alt="Custom Logo"
                                style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'contain', background: '#fff', border: '1px solid var(--edge)', padding: '2px' }}
                              />
                              <div>
                                <div style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--t1)' }}>
                                  {isRtl ? 'تم تطبيق الشعار المخصص' : 'Custom Logo Active'}
                                </div>
                                <div style={{ fontSize: '10.5px', color: 'var(--t2)' }}>
                                  {isRtl ? 'يظهر بوضوح في مركز كود QR' : 'Centered on QR code'}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleRemoveLogo}
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.25)',
                                color: '#ef4444',
                                borderRadius: '6px',
                                padding: '5px 10px',
                                fontSize: '11.5px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Trash2 size={13} />
                              <span>{isRtl ? 'إزالة' : 'Remove'}</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                              width: '100%',
                              padding: '12px',
                              background: 'var(--surface)',
                              border: '1.5px dashed var(--edge)',
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              color: 'var(--t1)',
                              fontSize: '12.5px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Upload size={16} color="var(--a)" />
                            <span>{isRtl ? 'اختر صورة شعار (PNG / SVG / JPG)' : 'Choose Logo Image (PNG / SVG / JPG)'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Mockup / Live QR */}
          <div
            style={{
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--surface2)',
              position: 'relative'
            }}
          >
            {currentStep < 3 ? (
              /* Mobile Phone Mockup (Step 1 & 2) */
              <div className="qr-phone-frame">
                {/* Phone Notch */}
                <div
                  style={{
                    width: '70px',
                    height: '14px',
                    background: '#334155',
                    borderRadius: '0 0 8px 8px',
                    margin: '0 auto',
                    zIndex: 20
                  }}
                />

                {/* Phone Screen Live Content */}
                <div
                  style={{
                    flex: 1,
                    background: '#ffffff',
                    padding: '16px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: '#0f172a'
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'rgba(37, 99, 235, 0.1)',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px'
                    }}
                  >
                    {renderTypeIcon(QR_TYPES.find(t => t.id === selectedType)?.icon, 22)}
                  </div>

                  <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a', marginBottom: '3px' }}>
                    {isRtl ? QR_TYPES.find(t => t.id === selectedType)?.labelAr : QR_TYPES.find(t => t.id === selectedType)?.label}
                  </div>

                  <div style={{ fontSize: '10px', color: '#64748b', maxWidth: '160px', wordBreak: 'break-all', marginBottom: '12px' }}>
                    {targetPayload || (isRtl ? 'اختر الإعدادات للمعاينة' : 'Select options to preview')}
                  </div>

                  <div
                    style={{
                      background: '#2563eb',
                      color: '#fff',
                      padding: '6px 16px',
                      borderRadius: '16px',
                      fontSize: '11px',
                      fontWeight: '700',
                      boxShadow: '0 3px 10px rgba(37, 99, 235, 0.35)'
                    }}
                  >
                    {isRtl ? 'تنفيذ الإجراء' : 'Tap to Open'}
                  </div>
                </div>
              </div>
            ) : (
              /* High-Resolution Live QR Code Display (Step 3) */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    background: design.bgColor,
                    padding: '14px',
                    borderRadius: '14px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px'
                  }}
                >
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="QR Code"
                      style={{ width: '170px', height: '170px', display: 'block' }}
                    />
                  ) : (
                    <div style={{ width: '170px', height: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <QrCode size={40} color="var(--t2)" />
                    </div>
                  )}
                </div>

                {/* QR Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    onClick={() => handleDownload('png')}
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--edge)',
                      color: 'var(--t1)',
                      borderRadius: '7px',
                      padding: '7px 10px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer'
                    }}
                    title="Download PNG"
                  >
                    <Download size={13} /> PNG
                  </button>

                  <button
                    onClick={() => handleDownload('svg')}
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--edge)',
                      color: 'var(--t1)',
                      borderRadius: '7px',
                      padding: '7px 10px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer'
                    }}
                    title="Download SVG"
                  >
                    <Download size={13} /> SVG
                  </button>

                  <button
                    onClick={handleCopyLink}
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--edge)',
                      color: 'var(--t1)',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Copy Link"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Controls */}
        <div
          style={{
            padding: '16px 28px',
            borderTop: '1px solid var(--edge)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface)'
          }}
        >
          {currentStep > 1 ? (
            <button
              onClick={handlePrev}
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--edge)',
                color: 'var(--t1)',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ChevronLeft size={16} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
              {isRtl ? 'السابق' : 'Prev'}
            </button>
          ) : <div />}

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              style={{
                background: 'var(--a)',
                color: '#fff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
              }}
            >
              {isRtl ? 'التالي' : 'Next'}
              <ChevronRight size={16} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
            </button>
          ) : (
            <button
              onClick={handleSaveQR}
              style={{
                background: 'var(--a)',
                color: '#fff',
                border: 'none',
                padding: '10px 28px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
              }}
            >
              {isRtl ? 'حفظ رمز الـ QR' : 'Save'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
