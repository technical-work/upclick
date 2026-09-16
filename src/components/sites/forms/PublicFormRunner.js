'use client';

import React, { useState, useEffect } from 'react';
import { findLocalFormById, saveFormSubmission, trackFormView } from '@/lib/sites/userSitesScope';
import ElementRenderer from '@/components/builder/ElementRenderer';

export default function PublicFormRunner({ formId }) {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!formId) {
      setLoading(false);
      return;
    }
    const found = findLocalFormById(formId);
    if (found) {
      setForm(found);
      trackFormView(formId);
    }
    setLoading(false);
  }, [formId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#64748b' }}>
        Loading form...
      </div>
    );
  }

  if (!form) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#0f172a', padding: '20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 8px 0' }}>Form Not Found</h2>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>This form may have been removed or unpublished.</p>
      </div>
    );
  }

  // If the form has a visual builder canvas, render the full interactive canvas!
  if (form.canvas && form.canvas.length > 0) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 16px',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        }}
      >
        <div style={{ width: '100%', maxWidth: '720px', margin: '0 auto' }}>
          {form.canvas.map((el) => (
            <div key={el.id} style={{ margin: '16px 0' }}>
              <ElementRenderer el={{ ...el, formId: form.id }} interactive />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleChange = (fieldId, val) => {
    setFormData((prev) => ({ ...prev, [fieldId]: val }));
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
      name: formData.f_full_name || `${formData.f_first_name || ''} ${formData.f_last_name || ''}`.trim() || formData.f_name || 'Web Visitor',
      email: formData.f_email || '',
      phone: formData.f_phone || '',
      data: { ...formData }
    };

    saveFormSubmission(form.id, submissionPayload);

    setTimeout(() => {
      setIsSubmitting(false);

      if (form.settings?.onSubmitType === 'redirect' && form.settings?.redirectUrl) {
        window.location.href = form.settings.redirectUrl;
      } else {
        setSubmitted(true);
      }
    }, 500);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: form.settings?.styling?.bg || '#ffffff',
          borderRadius: form.settings?.styling?.borderRadius || '16px',
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e2e8f0',
          padding: '36px 30px'
        }}
      >
        {submitted ? (
          <div
            dangerouslySetInnerHTML={{
              __html:
                form.settings?.messageHtml ||
                '<div style="text-align:center; padding: 20px 0;"><div style="font-size: 40px; margin-bottom: 12px;">😀</div><h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">We appreciate your feedback!</h3><p style="font-size: 14px; color: #64748b; margin: 0;">Thank you for taking the time to complete this form.</p></div>'
            }}
          />
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{ margin: '0 0 6px 0', fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>
                {form.name}
              </h1>
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
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isSubmitting ? 'Submitting...' : field.label || 'Submit'}
                      </button>
                    </div>
                  );
                }

                if (field.type === 'consent_checkbox') {
                  return (
                    <label key={field.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12.5px', color: '#475569', lineHeight: 1.45, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        required={field.required}
                        checked={!!formData[field.id]}
                        onChange={(e) => handleChange(field.id, e.target.checked)}
                        style={{ marginTop: '2px', cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                      <span>{field.label} {field.required && <span style={{ color: '#dc2626' }}>*</span>}</span>
                    </label>
                  );
                }

                const optionsList = Array.isArray(field.options) && field.options.length
                  ? field.options
                  : typeof field.options === 'string' && field.options.trim()
                  ? field.options.split(',').map((s) => s.trim()).filter(Boolean)
                  : ['Option 1', 'Option 2', 'Option 3'];

                if (field.type === 'checkbox') {
                  const currentChecked = Array.isArray(formData[field.id])
                    ? formData[field.id]
                    : typeof formData[field.id] === 'string' && formData[field.id]
                    ? formData[field.id].split(', ')
                    : formData[field.id] ? [String(formData[field.id])] : [];

                  const handleCheckboxToggle = (optVal) => {
                    const next = currentChecked.includes(optVal)
                      ? currentChecked.filter((v) => v !== optVal)
                      : [...currentChecked, optVal];
                    handleChange(field.id, next);
                  };

                  return (
                    <div key={field.id} style={{ margin: '6px 0' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                        {field.label} {field.required && <span style={{ color: '#dc2626' }}>*</span>}
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {optionsList.map((opt, optIdx) => {
                          const isChecked = currentChecked.includes(opt);
                          return (
                            <label
                              key={optIdx}
                              onClick={() => handleCheckboxToggle(opt)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '13.5px',
                                color: isChecked ? '#1d4ed8' : '#334155',
                                cursor: 'pointer',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                background: isChecked ? '#eff6ff' : '#f8fafc',
                                border: isChecked ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                                transition: 'all 0.15s ease',
                                userSelect: 'none'
                              }}
                            >
                              <span
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '4px',
                                  border: isChecked ? '1px solid #2563eb' : '2px solid #cbd5e1',
                                  background: isChecked ? '#2563eb' : '#ffffff',
                                  color: '#ffffff',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                  fontWeight: '900',
                                  flexShrink: 0,
                                  boxSizing: 'border-box',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {isChecked ? '✓' : ''}
                              </span>
                              <span style={{ fontWeight: isChecked ? '700' : '500' }}>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                if (field.type === 'radio') {
                  const selectedOpt = formData[field.id] || '';
                  return (
                    <div key={field.id} style={{ margin: '6px 0' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>
                        {field.label} {field.required && <span style={{ color: '#dc2626' }}>*</span>}
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {optionsList.map((opt, optIdx) => {
                          const isSelected = selectedOpt === opt;
                          return (
                            <label
                              key={optIdx}
                              onClick={() => handleChange(field.id, opt)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '13.5px',
                                color: isSelected ? '#1d4ed8' : '#334155',
                                cursor: 'pointer',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                background: isSelected ? '#eff6ff' : '#f8fafc',
                                border: isSelected ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                                transition: 'all 0.15s ease',
                                userSelect: 'none'
                              }}
                            >
                              <span
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  border: isSelected ? '5px solid #2563eb' : '2px solid #cbd5e1',
                                  background: '#ffffff',
                                  display: 'inline-block',
                                  flexShrink: 0,
                                  boxSizing: 'border-box',
                                  transition: 'all 0.15s ease'
                                }}
                              />
                              <span style={{ fontWeight: isSelected ? '700' : '500' }}>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                if (field.type === 'dropdown' || field.type === 'select') {
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
                        <option value="">{field.placeholder || 'Select an option...'}</option>
                        {optionsList.map((opt, optIdx) => (
                          <option key={optIdx} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
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

                const inputType =
                  field.type === 'email'
                    ? 'email'
                    : field.type === 'phone' || field.type === 'tel'
                    ? 'tel'
                    : field.type === 'number'
                    ? 'number'
                    : field.type === 'date_of_birth' || field.type === 'date'
                    ? 'date'
                    : field.type === 'url'
                    ? 'url'
                    : 'text';

                return (
                  <div key={field.id}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                      {field.label} {field.required && <span style={{ color: '#dc2626' }}>*</span>}
                    </label>
                    <input
                      type={inputType}
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
              <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '11.5px', color: '#2563eb' }}>
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
