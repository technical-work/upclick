'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { CreditCard, Smartphone, ShieldCheck, Key, Save, RefreshCw } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

const DEFAULTS = {
  instapay: { enabled: false, address: '' },
  vodafoneCash: { enabled: false, number: '' },
  stripe: { enabled: false, publishableKey: '', secretKey: '', paymentLink: '', paymentLinkAnnual: '' },
  paypal: { enabled: false, email: '' }
};

const PaymentSettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const isRTL = i18n.language?.startsWith('ar');

  const [paymentMethods, setPaymentMethods] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Load existing tenant configuration
  useEffect(() => {
    if (!currentUser?.uid) return;
    getDoc(doc(db, 'tenants', currentUser.uid))
      .then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          const rawMethods = data.paymentMethods || {};

          setPaymentMethods({
            instapay: {
              enabled: false,
              address: '',
              ...(typeof rawMethods.instapay === 'object' ? rawMethods.instapay : {})
            },
            vodafoneCash: {
              enabled: false,
              number: '',
              ...(typeof rawMethods.vodafoneCash === 'object' ? rawMethods.vodafoneCash : {})
            },
            stripe: {
              enabled: false,
              publishableKey: '',
              secretKey: '',
              paymentLink: '',
              paymentLinkAnnual: '',
              ...(typeof rawMethods.stripe === 'object' ? rawMethods.stripe : {})
            },
            paypal: {
              enabled: false,
              email: '',
              ...(typeof rawMethods.paypal === 'object' ? rawMethods.paypal : {})
            }
          });
        }
      })
      .catch(() => setLoadError(t('branding.loadError')));
  }, [currentUser, t]);

  const handleToggle = (method) => {
    setPaymentMethods(prev => ({
      ...prev,
      [method]: {
        ...prev[method],
        enabled: !prev[method].enabled
      }
    }));
  };

  const handleFieldChange = (method, field, value) => {
    setPaymentMethods(prev => ({
      ...prev,
      [method]: {
        ...prev[method],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'tenants', currentUser.uid), {
        paymentMethods,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setPaymentMethods(DEFAULTS);
    setSaved(false);
  };

  return (
    <div style={{ animation: 'fadeSlide 0.4s ease', maxWidth: '600px', margin: '0 auto' }}>

      {loadError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px', border: '1px solid rgba(239,68,68,0.2)' }}>
          ⚠️ {loadError}
        </div>
      )}

      <div className="card" style={{ marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '240px',
          height: '240px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        {/* Header */}
        <div style={sectionHeader}>
          <CreditCard size={16} style={{ color: 'var(--accent)' }} />
          <span>{t('branding.paymentMethods')}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 1 }}>

          {/* ── 1. INSTAPAY SECTION ── */}
          <div style={{
            ...methodContainer,
            borderColor: paymentMethods.instapay.enabled ? 'rgba(139, 92, 246, 0.4)' : 'var(--line2)',
            background: paymentMethods.instapay.enabled ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.06) 0%, rgba(8, 12, 20, 0.2) 100%)' : 'var(--bg3)'
          }}>
            <div style={methodHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  ...iconWrapper,
                  background: paymentMethods.instapay.enabled ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg4)',
                  color: paymentMethods.instapay.enabled ? '#a78bfa' : 'var(--text2)'
                }}>
                  ⚡
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', textAlign: 'start' }}>
                    {t('branding.paymentInstapay')}
                  </div>
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--text3)', textAlign: 'start' }}>
                    {t('branding.paymentInstapayLabel')}
                  </span>
                </div>
              </div>

              {/* Toggle Switch */}
              <label style={toggleSwitch}>
                <input
                  type="checkbox"
                  checked={paymentMethods.instapay.enabled}
                  onChange={() => handleToggle('instapay')}
                  style={toggleInput}
                />
                <span style={{
                  ...toggleSlider,
                  background: paymentMethods.instapay.enabled ? 'var(--purple)' : 'var(--bg4)',
                }}>
                  <span style={{
                    ...toggleKnob,
                    transform: paymentMethods.instapay.enabled ? (isRTL ? 'translateX(-16px)' : 'translateX(16px)') : 'translateX(0)',
                    background: paymentMethods.instapay.enabled ? '#ffffff' : 'var(--text3)'
                  }} />
                </span>
              </label>
            </div>

            {paymentMethods.instapay.enabled && (
              <div style={collapsibleContent}>
                <label style={labelStyle}>{t('branding.paymentInstapayLabel')}</label>
                <input
                  type="text"
                  value={paymentMethods.instapay.address}
                  onChange={e => handleFieldChange('instapay', 'address', e.target.value)}
                  placeholder={t('branding.paymentInstapayPlaceholder')}
                  style={inputStyle}
                  dir="ltr"
                />
              </div>
            )}
          </div>

          {/* ── 2. VODAFONE CASH SECTION ── */}
          <div style={{
            ...methodContainer,
            borderColor: paymentMethods.vodafoneCash.enabled ? 'rgba(239, 68, 68, 0.4)' : 'var(--line2)',
            background: paymentMethods.vodafoneCash.enabled ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(8, 12, 20, 0.2) 100%)' : 'var(--bg3)'
          }}>
            <div style={methodHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  ...iconWrapper,
                  background: paymentMethods.vodafoneCash.enabled ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg4)',
                  color: paymentMethods.vodafoneCash.enabled ? '#EF4444' : 'var(--text2)'
                }}>
                  <Smartphone size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', textAlign: 'start' }}>
                    {t('branding.paymentVodafoneCash')}
                  </div>
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--text3)', textAlign: 'start' }}>
                    {t('branding.paymentVodafoneCashLabel')}
                  </span>
                </div>
              </div>

              <label style={toggleSwitch}>
                <input
                  type="checkbox"
                  checked={paymentMethods.vodafoneCash.enabled}
                  onChange={() => handleToggle('vodafoneCash')}
                  style={toggleInput}
                />
                <span style={{
                  ...toggleSlider,
                  background: paymentMethods.vodafoneCash.enabled ? 'var(--red)' : 'var(--bg4)',
                }}>
                  <span style={{
                    ...toggleKnob,
                    transform: paymentMethods.vodafoneCash.enabled ? (isRTL ? 'translateX(-16px)' : 'translateX(16px)') : 'translateX(0)',
                    background: paymentMethods.vodafoneCash.enabled ? '#ffffff' : 'var(--text3)'
                  }} />
                </span>
              </label>
            </div>

            {paymentMethods.vodafoneCash.enabled && (
              <div style={collapsibleContent}>
                <label style={labelStyle}>{t('branding.paymentVodafoneCashLabel')}</label>
                <input
                  type="tel"
                  value={paymentMethods.vodafoneCash.number}
                  onChange={e => handleFieldChange('vodafoneCash', 'number', e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder={t('branding.paymentVodafoneCashPlaceholder')}
                  style={{ ...inputStyle, fontFamily: 'var(--mono)' }}
                  dir="ltr"
                />
              </div>
            )}
          </div>

          {/* ── 3. STRIPE SECTION ── */}
          <div style={{
            ...methodContainer,
            borderColor: paymentMethods.stripe.enabled ? 'rgba(59, 130, 246, 0.4)' : 'var(--line2)',
            background: paymentMethods.stripe.enabled ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(8, 12, 20, 0.2) 100%)' : 'var(--bg3)'
          }}>
            <div style={methodHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  ...iconWrapper,
                  background: paymentMethods.stripe.enabled ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg4)',
                  color: paymentMethods.stripe.enabled ? 'var(--accent)' : 'var(--text2)'
                }}>
                  <ShieldCheck size={14} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', textAlign: 'start' }}>
                    {t('branding.paymentStripe')}
                  </div>
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--text3)', textAlign: 'start' }}>
                    Credit Card & Global Payments
                  </span>
                </div>
              </div>

              <label style={toggleSwitch}>
                <input
                  type="checkbox"
                  checked={paymentMethods.stripe.enabled}
                  onChange={() => handleToggle('stripe')}
                  style={toggleInput}
                />
                <span style={{
                  ...toggleSlider,
                  background: paymentMethods.stripe.enabled ? 'var(--accent)' : 'var(--bg4)',
                }}>
                  <span style={{
                    ...toggleKnob,
                    transform: paymentMethods.stripe.enabled ? (isRTL ? 'translateX(-16px)' : 'translateX(16px)') : 'translateX(0)',
                    background: paymentMethods.stripe.enabled ? '#ffffff' : 'var(--text3)'
                  }} />
                </span>
              </label>
            </div>

            {paymentMethods.stripe.enabled && (
              <div style={{ ...collapsibleContent, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>{t('branding.paymentStripeLink')}</label>
                  <div style={{ position: 'relative' }}>
                    <Key size={12} style={inputIcon} />
                    <input
                      type="text"
                      value={paymentMethods.stripe.paymentLink || ''}
                      onChange={e => handleFieldChange('stripe', 'paymentLink', e.target.value)}
                      placeholder={t('branding.paymentStripeLinkPlaceholder')}
                      style={inputWithIconStyle}
                      dir="ltr"
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>{t('branding.paymentStripeLinkAnnual')}</label>
                  <div style={{ position: 'relative' }}>
                    <Key size={12} style={inputIcon} />
                    <input
                      type="text"
                      value={paymentMethods.stripe.paymentLinkAnnual || ''}
                      onChange={e => handleFieldChange('stripe', 'paymentLinkAnnual', e.target.value)}
                      placeholder={t('branding.paymentStripeLinkAnnualPlaceholder')}
                      style={inputWithIconStyle}
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── 4. PAYPAL SECTION ── */}
          <div style={{
            ...methodContainer,
            borderColor: paymentMethods.paypal?.enabled ? 'rgba(59, 130, 246, 0.4)' : 'var(--line2)',
            background: paymentMethods.paypal?.enabled ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(8, 12, 20, 0.2) 100%)' : 'var(--bg3)'
          }}>
            <div style={methodHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  ...iconWrapper,
                  background: paymentMethods.paypal?.enabled ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg4)',
                  color: paymentMethods.paypal?.enabled ? '#3b82f6' : 'var(--text2)'
                }}>
                  🌐
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', textAlign: 'start' }}>
                    {t('branding.paymentPaypal')}
                  </div>
                  <span style={{ display: 'block', fontSize: '10px', color: 'var(--text3)', textAlign: 'start' }}>
                    {t('branding.paymentPaypalLabel')}
                  </span>
                </div>
              </div>

              <label style={toggleSwitch}>
                <input
                  type="checkbox"
                  checked={paymentMethods.paypal?.enabled || false}
                  onChange={() => handleToggle('paypal')}
                  style={toggleInput}
                />
                <span style={{
                  ...toggleSlider,
                  background: paymentMethods.paypal?.enabled ? 'var(--accent)' : 'var(--bg4)',
                }}>
                  <span style={{
                    ...toggleKnob,
                    transform: paymentMethods.paypal?.enabled ? (isRTL ? 'translateX(-16px)' : 'translateX(16px)') : 'translateX(0)',
                    background: paymentMethods.paypal?.enabled ? '#ffffff' : 'var(--text3)'
                  }} />
                </span>
              </label>
            </div>

            {paymentMethods.paypal?.enabled && (
              <div style={collapsibleContent}>
                <label style={labelStyle}>{t('branding.paymentPaypalLabel')}</label>
                <input
                  type="email"
                  value={paymentMethods.paypal?.email || ''}
                  onChange={e => handleFieldChange('paypal', 'email', e.target.value)}
                  placeholder={t('branding.paymentPaypalPlaceholder')}
                  style={inputStyle}
                  dir="ltr"
                />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', paddingBottom: '20px' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
          style={{ flex: 1 }}
        >
          <Save size={16} />
          <span>{saving ? t('branding.saving') : saved ? t('branding.saved') : t('branding.saveSettings')}</span>
        </button>
        <button onClick={handleReset} className="btn" style={{ background: 'var(--bg3)', border: '1px solid var(--line)', color: 'var(--text2)' }}>
          <RefreshCw size={16} />
        </button>
      </div>

    </div>
  );
};

// Styling Constants
const sectionHeader = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  fontWeight: '800',
  color: 'var(--text)',
  marginBottom: '16px',
  paddingBottom: '10px',
  borderBottom: '1px solid var(--line)',
};

const methodContainer = {
  border: '1px solid var(--line2)',
  borderRadius: '12px',
  padding: '14px',
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
};

const methodHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const iconWrapper = {
  width: '28px',
  height: '28px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '13px',
  transition: 'all 0.2s',
  flexShrink: 0,
};

const inputStyle = {
  width: '100%',
  background: 'var(--bg3)',
  border: '1px solid var(--line2)',
  borderRadius: '10px',
  padding: '10px 14px',
  fontSize: '13px',
  color: 'var(--text)',
  outline: 'none',
  fontFamily: 'var(--font)',
  transition: 'border-color 0.2s',
};

const inputWithIconStyle = {
  ...inputStyle,
  paddingLeft: '32px',
};

const inputIcon = {
  position: 'absolute',
  left: '10px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--text3)',
  pointerEvents: 'none',
};

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '700',
  color: 'var(--text2)',
  marginBottom: '5px',
  textTransform: 'uppercase',
  textAlign: 'start'
};

const collapsibleContent = {
  marginTop: '12px',
  paddingTop: '12px',
  borderTop: '1px dashed var(--line)',
  animation: 'fadeSlide 0.2s ease forwards',
};

const toggleSwitch = {
  position: 'relative',
  display: 'inline-block',
  width: '36px',
  height: '20px',
  cursor: 'pointer',
};

const toggleInput = {
  opacity: 0,
  width: 0,
  height: 0,
};

const toggleSlider = {
  position: 'absolute',
  cursor: 'pointer',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: '34px',
  transition: '.3s',
  display: 'flex',
  alignItems: 'center',
  padding: '0 2px',
};

const toggleKnob = {
  height: '16px',
  width: '16px',
  borderRadius: '50%',
  transition: '.3s cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'block',
};

export default PaymentSettingsPage;
