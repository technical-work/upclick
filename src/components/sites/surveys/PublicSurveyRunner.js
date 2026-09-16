'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Star,
  Package,
  CreditCard,
  Building,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { saveSurveySubmission, trackSurveyView, findLocalSurveyById } from '@/lib/sites/userSitesScope';

export default function PublicSurveyRunner({ survey: initialSurvey, surveyId, isRtl = false }) {
  const [survey, setSurvey] = useState(initialSurvey || null);
  const [loading, setLoading] = useState(!initialSurvey && !!surveyId);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialSurvey) {
      setSurvey(initialSurvey);
      setLoading(false);
      trackSurveyView(initialSurvey.id);
      return;
    }

    if (surveyId) {
      const cleanId = surveyId.startsWith('survey_') ? surveyId.replace('survey_', '') : surveyId;
      const found = findLocalSurveyById(surveyId) || findLocalSurveyById(cleanId) || findLocalSurveyById(`srv_${cleanId}`);
      if (found) {
        setSurvey(found);
        trackSurveyView(found.id);
      }
      setLoading(false);
    }
  }, [initialSurvey, surveyId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
        Loading survey...
      </div>
    );
  }

  if (!survey) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          padding: '20px',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <h2>{isRtl ? 'الاستبيان غير موجود' : 'Survey not found'}</h2>
          <p>{isRtl ? 'تأكد من صحة الرابط أو اتصل بمسؤول الحساب.' : 'Please check the URL or contact the survey owner.'}</p>
        </div>
      </div>
    );
  }

  const slides = Array.isArray(survey.slides) && survey.slides.length > 0
    ? survey.slides
    : [
        {
          id: 'slide_1',
          title: survey.name || 'Survey',
          subtitle: '',
          elements: [],
          buttonText: 'Submit'
        }
      ];

  const currentSlide = slides[currentSlideIndex] || slides[0];
  const totalSlides = slides.length;
  const progressPercent = Math.round(((currentSlideIndex + 1) / totalSlides) * 100);

  const handleInputChange = (elemId, value) => {
    setFormData((prev) => ({
      ...prev,
      [elemId]: value
    }));
    // Clear error for this field if any
    if (errors[elemId]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[elemId];
        return copy;
      });
    }

    // If auto-advance is enabled and it's a single choice or rating on the only question in the slide
    if (
      survey.settings?.autoAdvance &&
      currentSlide.elements?.length === 1 &&
      ['radio', 'rating', 'nps'].includes(currentSlide.elements[0].type)
    ) {
      setTimeout(() => {
        handleNextSlide();
      }, 250);
    }
  };

  const handleNextSlide = () => {
    // Validate current slide required elements
    const newErrors = {};
    (currentSlide.elements || []).forEach((el) => {
      if (el.required) {
        const val = formData[el.id];
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          newErrors[el.id] = isRtl ? 'هذا الحقل مطلوب' : 'This field is required';
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmitSurvey();
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmitSurvey = async () => {
    setIsSubmitting(true);

    // Extract primary contact data if present in answers
    let respondentName = '';
    let respondentEmail = '';
    let respondentPhone = '';

    slides.forEach((s) => {
      (s.elements || []).forEach((el) => {
        if (el.type === 'full_name' || el.type === 'first_name') respondentName = formData[el.id] || respondentName;
        if (el.type === 'email') respondentEmail = formData[el.id] || respondentEmail;
        if (el.type === 'phone') respondentPhone = formData[el.id] || respondentPhone;
      });
    });

    const submissionPayload = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: respondentName || 'Anonymous Respondent',
      email: respondentEmail,
      phone: respondentPhone,
      data: formData,
      submittedAt: new Date().toLocaleString()
    };

    saveSurveySubmission(survey.id, submissionPayload);

    // If notifications enabled, call background dispatch or API
    try {
      if (survey.notifications?.enableEmail && survey.notifications?.recipients) {
        fetch('/api/admin/outreach/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: survey.notifications.recipients,
            subject: survey.notifications.subject || `New Survey Submission: ${survey.name}`,
            text: `A new response was submitted for survey "${survey.name}".\n\nRespondent: ${respondentName || 'Anonymous'}\nEmail: ${respondentEmail || 'N/A'}\n\nData:\n${JSON.stringify(formData, null, 2)}`
          })
        }).catch(() => {});
      }
    } catch (e) {
      // Ignore notification fail on client
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 400);
  };

  const primaryColor = survey.settings?.buttonColor || '#2563eb';
  const borderRadius = survey.settings?.borderRadius || '16px';
  const showProgress = survey.settings?.progressBar !== false;
  const showBack = survey.settings?.showBackButton !== false;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        direction: isRtl ? 'rtl' : 'ltr',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          background: '#ffffff',
          borderRadius: borderRadius,
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Progress Bar */}
        {showProgress && !isSubmitted && totalSlides > 1 && (
          <div style={{ background: '#f1f5f9', height: '6px', width: '100%', position: 'relative' }}>
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: primaryColor,
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        )}

        {/* Survey Content */}
        <div style={{ padding: '36px 32px' }}>
          {isSubmitted ? (
            /* Success State */
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
                {survey.settings?.successTitle || (isRtl ? 'شكراً لمشاركتك! 🎉' : 'Thank You for Your Submission! 🎉')}
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, maxWidth: '440px', margin: '0 auto' }}>
                {survey.settings?.successMessage ||
                  (isRtl
                    ? 'تم تسجيل إجاباتك بنجاح. نقدر وقتك ومشاركتك القيّمة.'
                    : 'Your responses have been recorded successfully. We appreciate your time.')}
              </p>
            </div>
          ) : (
            <div>
              {/* Slide Title & Subtitle */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    {currentSlide.title || `Slide ${currentSlideIndex + 1}`}
                  </h2>
                  {totalSlides > 1 && (
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px' }}>
                      {currentSlideIndex + 1} / {totalSlides}
                    </span>
                  )}
                </div>
                {currentSlide.subtitle && (
                  <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                    {currentSlide.subtitle}
                  </p>
                )}
              </div>

              {/* Slide Questions Elements */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', marginBottom: '32px' }}>
                {(!currentSlide.elements || currentSlide.elements.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                    {isRtl ? 'لا توجد أسئلة في هذه الشريحة' : 'No questions on this slide'}
                  </div>
                ) : (
                  currentSlide.elements.map((elem) => (
                    <div key={elem.id}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
                        {elem.label}
                        {elem.required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
                      </label>

                      {renderRunnerElement(elem, formData[elem.id], (val) => handleInputChange(elem.id, val), primaryColor, isRtl)}

                      {errors[elem.id] && (
                        <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', fontWeight: 500 }}>
                          {errors[elem.id]}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Slide Footer Navigation (Back / Next / Submit) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                {showBack && currentSlideIndex > 0 ? (
                  <button
                    type="button"
                    onClick={handlePrevSlide}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'transparent',
                      border: '1px solid #cbd5e1',
                      color: '#475569',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    <span>{isRtl ? 'السابق' : 'Back'}</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  onClick={handleNextSlide}
                  disabled={isSubmitting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: primaryColor,
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                    opacity: isSubmitting ? 0.7 : 1,
                    transition: 'all 0.15s'
                  }}
                >
                  <span>
                    {isSubmitting
                      ? isRtl ? 'جاري الإرسال...' : 'Submitting...'
                      : currentSlide.buttonText || (currentSlideIndex === totalSlides - 1 ? (isRtl ? 'إرسال' : 'Submit') : (isRtl ? 'التالي' : 'Next'))}
                  </span>
                  {currentSlideIndex < totalSlides - 1 && (isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Powered by UpKlick branding */}
      <div style={{ marginTop: '16px', fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span>Powered by</span>
        <strong style={{ color: '#64748b' }}>UpKlick Surveys</strong>
      </div>
    </div>
  );
}

// Runner element renderer
function renderRunnerElement(elem, value, onChange, primaryColor, isRtl) {
  switch (elem.type) {
    case 'rating': {
      const max = elem.maxRating || 5;
      const currentVal = Number(value) || 0;
      return (
        <div style={{ display: 'flex', gap: '8px', margin: '4px 0' }}>
          {Array.from({ length: max }).map((_, i) => {
            const starNum = i + 1;
            const isFilled = starNum <= currentVal;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onChange(starNum)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: isFilled ? '#f59e0b' : '#cbd5e1',
                  transition: 'transform 0.1s'
                }}
              >
                <Star size={32} fill={isFilled ? '#f59e0b' : 'transparent'} strokeWidth={1.5} />
              </button>
            );
          })}
        </div>
      );
    }

    case 'nps': {
      const currentVal = value !== undefined ? Number(value) : null;
      return (
        <div style={{ margin: '8px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: '4px' }}>
            {Array.from({ length: 11 }).map((_, i) => {
              const isSelected = currentVal === i;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onChange(i)}
                  style={{
                    padding: '10px 2px',
                    borderRadius: '8px',
                    border: isSelected ? `2px solid ${primaryColor}` : '1px solid #cbd5e1',
                    background: isSelected ? primaryColor : '#ffffff',
                    color: isSelected ? '#ffffff' : '#1e293b',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  {i}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
            <span>{isRtl ? 'غير مرجح على الإطلاق (0)' : 'Not at all likely (0)'}</span>
            <span>{isRtl ? 'مرجح للغاية (10)' : 'Extremely likely (10)'}</span>
          </div>
        </div>
      );
    }

    case 'radio': {
      const opts = elem.options || ['Option 1', 'Option 2'];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {opts.map((opt, i) => {
            const isChecked = value === opt;
            return (
              <label
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: isChecked ? `1.5px solid ${primaryColor}` : '1px solid #e2e8f0',
                  background: isChecked ? '#eff6ff' : '#ffffff',
                  color: isChecked ? primaryColor : '#334155',
                  cursor: 'pointer',
                  fontWeight: isChecked ? 600 : 400,
                  fontSize: '14px',
                  transition: 'all 0.15s'
                }}
              >
                <input
                  type="radio"
                  name={elem.id}
                  checked={isChecked}
                  onChange={() => onChange(opt)}
                  style={{ accentColor: primaryColor }}
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
      );
    }

    case 'checkbox': {
      const opts = elem.options || ['Option 1', 'Option 2'];
      const currentList = Array.isArray(value) ? value : [];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {opts.map((opt, i) => {
            const isChecked = currentList.includes(opt);
            return (
              <label
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: isChecked ? `1.5px solid ${primaryColor}` : '1px solid #e2e8f0',
                  background: isChecked ? '#eff6ff' : '#ffffff',
                  color: isChecked ? primaryColor : '#334155',
                  cursor: 'pointer',
                  fontWeight: isChecked ? 600 : 400,
                  fontSize: '14px',
                  transition: 'all 0.15s'
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...currentList, opt]);
                    } else {
                      onChange(currentList.filter((item) => item !== opt));
                    }
                  }}
                  style={{ accentColor: primaryColor }}
                />
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
      );
    }

    case 'dropdown': {
      const opts = elem.options || ['Select an option...'];
      return (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            fontSize: '14px',
            color: '#1e293b',
            outline: 'none'
          }}
        >
          <option value="" disabled>
            {isRtl ? 'اختر إجابة...' : 'Select an option...'}
          </option>
          {opts.map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    case 'textarea': {
      return (
        <textarea
          rows={3}
          value={value || ''}
          placeholder={elem.placeholder || (isRtl ? 'اكتب إجابتك هنا...' : 'Type your response here...')}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '14px',
            resize: 'vertical',
            outline: 'none'
          }}
        />
      );
    }

    case 'sell_products': {
      const opts = elem.options || ['Standard Plan - $29/mo', 'Pro Plan - $79/mo'];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {opts.map((opt, i) => {
            const isChecked = value === opt;
            return (
              <label
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: isChecked ? `1.5px solid ${primaryColor}` : '1px solid #cbd5e1',
                  background: isChecked ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={18} color={primaryColor} />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{opt}</span>
                </div>
                <input
                  type="radio"
                  name={elem.id}
                  checked={isChecked}
                  onChange={() => onChange(opt)}
                  style={{ accentColor: primaryColor }}
                />
              </label>
            );
          })}
        </div>
      );
    }

    case 'collect_payment': {
      return (
        <div
          style={{
            padding: '14px 18px',
            border: '1px solid #bfdbfe',
            borderRadius: '10px',
            background: '#eff6ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CreditCard size={20} color={primaryColor} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>
                {isRtl ? 'دفع آمن بالبطاقة البنكية' : 'Secure Card Checkout'}
              </div>
              <div style={{ fontSize: '12px', color: '#3b82f6' }}>Powered by Stripe</div>
            </div>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#1e40af' }}>
            ${elem.amount || 49} {elem.currency || 'USD'}
          </span>
        </div>
      );
    }

    default: {
      return (
        <input
          type={elem.type === 'email' ? 'email' : elem.type === 'phone' ? 'tel' : elem.type === 'date_of_birth' ? 'date' : 'text'}
          value={value || ''}
          placeholder={elem.placeholder || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '14px',
            outline: 'none'
          }}
        />
      );
    }
  }
}
