'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, Send, ExternalLink, ShieldCheck, CreditCard, Lock } from 'lucide-react';

export default function LiveFormModal({
  isOpen,
  onClose,
  form,
  isRtl,
  onSubmitResponse,
  showToast
}) {
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !form) return null;

  const handleChange = (fieldId, val) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: val
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submissionPayload = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      submittedAt: new Date().toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      name: formData.f_full_name || `${formData.f_first_name || ''} ${formData.f_last_name || ''}`.trim() || formData.f_name || 'Anonymous Contact',
      email: formData.f_email || '',
      phone: formData.f_phone || '',
      data: { ...formData }
    };

    setTimeout(() => {
      setIsSubmitting(false);
      if (onSubmitResponse) {
        onSubmitResponse(form.id, submissionPayload);
      }

      if (form.settings?.onSubmitType === 'redirect' && form.settings?.redirectUrl) {
        if (showToast) showToast(isRtl ? 'جاري التحويل إلى الرابط المحدد...' : 'Redirecting...');
        window.open(form.settings.redirectUrl, '_blank');
        onClose();
      } else {
        setSubmitted(true);
      }
    }, 600);
  };

  const handleReset = () => {
    setFormData({});
    setSubmitted(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '20px',
        direction: isRtl ? 'rtl' : 'ltr'
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
          maxWidth: '560px',
          maxHeight: '90vh',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          overflowY: 'auto',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            [isRtl ? 'left' : 'right']: '16px',
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          <X size={16} />
        </button>

        {submitted ? (
          /* Thank You State matching Screenshot 4 WYSIWYG result */
          <div style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div
              dangerouslySetInnerHTML={{
                __html:
                  form.settings?.messageHtml ||
                  '<div style="text-align:center; padding: 20px 0;"><div style="font-size: 40px; margin-bottom: 12px;">😀</div><h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">We appreciate your feedback!</h3><p style="font-size: 14px; color: #64748b; margin: 0;">Thank you for taking the time to complete this form.</p></div>'
              }}
            />
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                onClick={handleReset}
                style={{
                  background: 'none',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '8px 18px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                {isRtl ? 'إرسال استجابة أخرى' : 'Submit Another Response'}
              </button>
              <button
                onClick={onClose}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 22px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {isRtl ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        ) : (
          /* Live Form Form */
          <form onSubmit={handleSubmit} style={{ padding: '32px 28px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
                {form.name}
              </h2>
              <div style={{ height: '3px', width: '40px', background: '#2563eb', borderRadius: '2px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {form.fields?.map((field) => {
                if (field.type === 'submit') {
                  return (
                    <div key={field.id} style={{ marginTop: '8px' }}>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                          width: '100%',
                          background: field.buttonColor || '#2563eb',
                          color: field.textColor || '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '13px 20px',
                          fontSize: '15px',
                          fontWeight: '700',
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          opacity: isSubmitting ? 0.7 : 1,
                          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        {isSubmitting ? (
                          <span>{isRtl ? 'جاري الإرسال...' : 'Submitting...'}</span>
                        ) : (
                          <span>{field.label || 'Submit'}</span>
                        )}
                      </button>
                    </div>
                  );
                }

                if (field.type === 'consent_checkbox') {
                  return (
                    <label
                      key={field.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        fontSize: '12px',
                        color: '#475569',
                        lineHeight: 1.45,
                        cursor: 'pointer',
                        padding: '4px 0'
                      }}
                    >
                      <input
                        type="checkbox"
                        required={field.required}
                        checked={!!formData[field.id]}
                        onChange={(e) => handleChange(field.id, e.target.checked)}
                        style={{ marginTop: '2px', cursor: 'pointer' }}
                      />
                      <span>{field.label}</span>
                    </label>
                  );
                }

                if (field.type === 'textarea') {
                  return (
                    <div key={field.id}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                        {field.label} {field.required && <span style={{ color: '#dc2626' }}>*</span>}
                      </label>
                      <textarea
                        rows={3}
                        required={field.required}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        placeholder={field.placeholder || ''}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13.5px',
                          color: '#0f172a',
                          outline: 'none',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                  );
                }

                if (field.type === 'dropdown') {
                  return (
                    <div key={field.id}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                        {field.label} {field.required && <span style={{ color: '#dc2626' }}>*</span>}
                      </label>
                      <select
                        required={field.required}
                        value={formData[field.id] || ''}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13.5px',
                          color: '#0f172a',
                          outline: 'none',
                          background: '#ffffff'
                        }}
                      >
                        <option value="">{field.placeholder || (isRtl ? 'اختر خياراً...' : 'Select an option...')}</option>
                        {(field.options || []).map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  );
                }

                return (
                  <div key={field.id}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                      {field.label} {field.required && <span style={{ color: '#dc2626' }}>*</span>}
                    </label>
                    <input
                      type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
                      required={field.required}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      placeholder={field.placeholder || ''}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13.5px',
                        color: '#0f172a',
                        outline: 'none'
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {form.settings?.showTermsLinks !== false && (
              <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11.5px', color: '#2563eb' }}>
                <a href="#privacy" style={{ color: '#2563eb', textDecoration: 'none', margin: '0 6px' }}>Privacy Policy</a>
                <span>|</span>
                <a href="#terms" style={{ color: '#2563eb', textDecoration: 'none', margin: '0 6px' }}>Terms of Service</a>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
