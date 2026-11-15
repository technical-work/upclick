'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Shield,
  CreditCard,
  CheckCircle2,
  Lock,
  Globe,
  Phone,
  Mail,
  MapPin,
  Wallet,
  Building2,
  ArrowRight
} from 'lucide-react';
import { UPKLICK_CONTACT_INFO } from './LegalPageContent';

const DEFAULT_PLANS = [
  {
    id: 'starter',
    nameEn: 'Starter Plan',
    nameAr: 'باقة البداية (Starter Plan)',
    priceEgp: 299,
    periodEn: '/ month',
    periodAr: '/ شهرياً',
    descEn:
      'Digital SaaS subscription for solo founders: Funnel & Website Builder, CRM (up to 1,000 contacts), and essential AI marketing tools.',
    descAr:
      'اشتراك سحابي رقمي لرواد الأعمال المبتدئين: بناء صفحات الهبوط والمواقع، نظام إدارة العملاء CRM، وأدوات الذكاء الاصطناعي الأساسية.',
    featuresEn: [
      'Up to 3 Funnels & Websites',
      'CRM & Lead Management (1,000 Contacts)',
      'Email & WhatsApp Campaign Tools',
      'Instant Digital Cloud Activation (No Shipping)'
    ],
    featuresAr: [
      'بناء حتى 3 مواقع وفانلز احترافية',
      'نظام إدارة العملاء CRM (حتى 1,000 عميل)',
      'أدوات التسويق عبر البريد الإلكتروني وواتساب',
      'تفعيل سحابي رقمي فوري (بدون شحن مادي)'
    ]
  },
  {
    id: 'growth',
    nameEn: 'Growth Plan',
    nameAr: 'باقة النمو (Growth Plan)',
    priceEgp: 499,
    periodEn: '/ month',
    periodAr: '/ شهرياً',
    descEn:
      'Complete digital growth suite for scaling businesses: E-commerce Store Builder, Meta Pixel & CAPI Tracking, and AI Content Studio.',
    descAr:
      'باقة النمو المتكاملة للشركات المتنامية: بناء المتاجر الإلكترونية، مركز تتبع إعلانات Meta Pixel & CAPI، واستوديو المحتوى بالذكاء الاصطناعي.',
    featuresEn: [
      'Up to 10 Funnels, Websites & Online Stores',
      'CRM & Pipelines (10,000 Contacts)',
      'Meta Pixel, Conversions API & Lead Ads Sync',
      'AI Copywriting & Funnel Generator',
      'Instant Digital Cloud Activation (No Shipping)'
    ],
    featuresAr: [
      'بناء حتى 10 مواقع وفانلز ومتاجر إلكترونية',
      'نظام CRM متقدم (حتى 10,000 عميل)',
      'ربط Meta Pixel و Conversions API ومزامنة الإعلانات',
      'استوديو الذكاء الاصطناعي لكتابة المحتوى والفانلز',
      'تفعيل سحابي رقمي فوري (بدون شحن مادي)'
    ]
  },
  {
    id: 'pro',
    nameEn: 'Pro Plan',
    nameAr: 'الباقة الاحترافية (Pro Plan)',
    priceEgp: 799,
    periodEn: '/ month',
    periodAr: '/ شهرياً',
    popular: true,
    descEn:
      'Full AI Operating System with unlimited access to all 17+ digital tools, custom domains, communities, courses, and priority support.',
    descAr:
      'نظام التشغيل الكامل بالذكاء الاصطناعي مع وصول غير محدود لجميع الأدوات الـ 17+، ربط الدومينات الخاصة، إدارة المجتمعات والدورات، ودعم فني أولوية.',
    featuresEn: [
      'Unlimited Funnels, Websites & E-Commerce Stores',
      'All 17+ AI Business & Automation Tools Unlocked',
      'Custom Domains, Courses & Community Hub',
      'Priority Support in Egypt (Phone, WhatsApp & Email)',
      'Instant Digital Cloud Activation (No Shipping)'
    ],
    featuresAr: [
      'عدد غير محدود من المواقع والفانلز والمتاجر',
      'فتح جميع أدوات المنصة الـ 17+ بالذكاء الاصطناعي',
      'ربط الدومينات الخاصة وإدارة الدورات والمجتمعات',
      'دعم فني ذو أولوية داخل مصر (هاتف، واتساب، بريد إلكتروني)',
      'تفعيل سحابي رقمي فوري (بدون شحن مادي)'
    ]
  }
];

export default function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const planParam = (searchParams?.get('plan') || 'pro').toLowerCase();

  const [lang, setLang] = useState('ar');
  const isAr = lang === 'ar';

  const [selectedPlanId, setSelectedPlanId] = useState(
    DEFAULT_PLANS.some((p) => p.id === planParam) ? planParam : 'pro'
  );
  const [paymentMethod, setPaymentMethod] = useState('paymob_card');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Cairo, Egypt');
  const [address, setAddress] = useState('');
  const [agreedPolicies, setAgreedPolicies] = useState(true);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderRef, setOrderRef] = useState('');

  useEffect(() => {
    if (planParam && DEFAULT_PLANS.some((p) => p.id === planParam)) {
      setSelectedPlanId(planParam);
    }
  }, [planParam]);

  const selectedPlan =
    DEFAULT_PLANS.find((p) => p.id === selectedPlanId) || DEFAULT_PLANS[2];

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!agreedPolicies) return;
    const generatedRef = `UPK-${Date.now().toString(36).toUpperCase()}`;
    setOrderRef(generatedRef);
    setOrderSubmitted(true);
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        background: '#08080f',
        color: '#f8f4ff',
        fontFamily: "'IBM Plex Sans Arabic', 'DM Sans', sans-serif"
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(16, 16, 24, 0.9)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: '0 auto',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}
        >
          <a
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 52,
              width: 180,
              overflow: 'hidden',
              textDecoration: 'none'
            }}
          >
            <img
              src="/best_logo_dark.png"
              alt="UpKlick"
              style={{ height: 250, width: 'auto', objectFit: 'contain', marginTop: 12 }}
            />
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                color: '#00d98b',
                background: 'rgba(0, 217, 139, 0.1)',
                border: '1px solid rgba(0, 217, 139, 0.3)',
                padding: '6px 12px',
                borderRadius: 999,
                fontWeight: 700
              }}
            >
              <Lock size={14} />
              <span>{isAr ? 'دفع إلكتروني آمن ومشفر 256-bit SSL' : '256-Bit SSL Encrypted Secure Checkout'}</span>
            </span>

            <button
              type="button"
              onClick={() => setLang(isAr ? 'en' : 'ar')}
              style={{
                background: '#181825',
                border: '1px solid rgba(255,255,255,0.14)',
                color: '#fff',
                borderRadius: 10,
                padding: '7px 14px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Globe size={14} style={{ color: '#FF6B35' }} />
              <span>{isAr ? 'English' : 'عربي'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Checkout Layout */}
      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '40px 20px 80px' }}>
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 107, 53, 0.14)',
              border: '1px solid rgba(255, 107, 53, 0.35)',
              color: '#FF6B35',
              padding: '5px 14px',
              borderRadius: 999,
              fontSize: 12.5,
              fontWeight: 800,
              marginBottom: 12
            }}
          >
            <span>✦</span>
            <span>{isAr ? 'صفحة الدفع والاشتراك الرسمية · OFFICIAL CHECKOUT' : 'OFFICIAL SUBSCRIPTION CHECKOUT'}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900, margin: '0 0 8px' }}>
            {isAr ? 'إتمام الاشتراك والدفع الإلكتروني' : 'Complete Your Subscription & Checkout'}
          </h1>
          <p style={{ color: '#9090b0', margin: 0, fontSize: 15 }}>
            {isAr
              ? 'اختر الباقة المناسبة لعملك وأكمل بيانات الفوترة لتفعيل اشتراكك السحابي الرقمي فوراً.'
              : 'Select your digital SaaS plan and complete your billing details for instant cloud activation.'}
          </p>
        </div>

        {/* Plan Selector Cards */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 14 }}>
            {isAr ? '1. اختر باقة الاشتراك (الأسعار بالجنيه المصري EGP)' : '1. Select Your Plan (Prices in EGP)'}
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16
            }}
          >
            {DEFAULT_PLANS.map((plan) => {
              const active = plan.id === selectedPlanId;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  style={{
                    cursor: 'pointer',
                    background: active
                      ? 'linear-gradient(145deg, rgba(255, 107, 53, 0.14), rgba(108, 53, 255, 0.14))'
                      : '#101018',
                    border: active
                      ? '2px solid #FF6B35'
                      : '1px solid rgba(255, 255, 255, 0.09)',
                    borderRadius: 18,
                    padding: '20px 22px',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 17, color: '#fff' }}>
                      {isAr ? plan.nameAr : plan.nameEn}
                    </span>
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: active ? '6px solid #FF6B35' : '2px solid rgba(255,255,255,0.25)',
                        display: 'inline-block'
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#FF6B35', marginBottom: 8 }}>
                    {plan.priceEgp} EGP{' '}
                    <span style={{ fontSize: 13.5, fontWeight: 500, color: '#9090b0' }}>
                      {isAr ? plan.periodAr : plan.periodEn}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#9090b0', margin: '0 0 12px', lineHeight: 1.6 }}>
                    {isAr ? plan.descAr : plan.descEn}
                  </p>
                  <ul style={{ margin: 0, paddingInlineStart: 18, fontSize: 12.5, color: '#d8d4e8' }}>
                    {(isAr ? plan.featuresAr : plan.featuresEn).map((f, idx) => (
                      <li key={idx} style={{ marginBottom: 4 }}>{f}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Two-column Billing Form & Order Summary */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 28,
            alignItems: 'start'
          }}
        >
          {/* Billing & Payment Form */}
          <div
            style={{
              background: '#101018',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 20,
              padding: '28px 26px'
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 800, marginTop: 0, marginBottom: 18 }}>
              {isAr ? '2. بيانات المشترك والفوترة' : '2. Customer & Billing Information'}
            </h2>

            {orderSubmitted ? (
              <div
                style={{
                  background: 'rgba(0, 217, 139, 0.1)',
                  border: '1px solid rgba(0, 217, 139, 0.4)',
                  borderRadius: 16,
                  padding: 24
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <CheckCircle2 size={26} style={{ color: '#00d98b' }} />
                  <h3 style={{ margin: 0, fontSize: 19, color: '#fff' }}>
                    {isAr ? 'تم تسجيل طلب الاشتراك بنجاح!' : 'Checkout Order Created Successfully!'}
                  </h3>
                </div>
                <p style={{ color: '#d0d0e8', fontSize: 14, marginBottom: 14 }}>
                  {isAr
                    ? `رقم الطلب المرجعي: ${orderRef} — الباقة المختارة: ${selectedPlan.nameAr} (${selectedPlan.priceEgp} EGP).`
                    : `Order Reference: ${orderRef} — Selected Plan: ${selectedPlan.nameEn} (${selectedPlan.priceEgp} EGP).`}
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <a
                    href={`/register?plan=${selectedPlan.id}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(fullName)}`}
                    style={{
                      background: 'linear-gradient(135deg, #FF6B35, #ff4500)',
                      color: '#fff',
                      textDecoration: 'none',
                      padding: '11px 22px',
                      borderRadius: 12,
                      fontWeight: 800,
                      fontSize: 14,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8
                    }}
                  >
                    <span>{isAr ? 'إكمال إعداد الحساب ولوحة التحكم' : 'Proceed to Account & Payment Gateway'}</span>
                    <ArrowRight size={16} />
                  </a>
                  <button
                    type="button"
                    onClick={() => setOrderSubmitted(false)}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#fff',
                      padding: '11px 18px',
                      borderRadius: 12,
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                  >
                    {isAr ? 'تعديل البيانات' : 'Edit Details'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                    {isAr ? 'الاسم بالكامل *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isAr ? 'مثال: أحمد محمد' : 'e.g. Ahmed Mohamed'}
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                      {isAr ? 'البريد الإلكتروني *' : 'Email Address *'}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                      {isAr ? 'رقم الموبايل داخل مصر *' : 'Mobile Number (Egypt) *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+20 10XXXXXXXX"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                      {isAr ? 'المدينة / المحافظة *' : 'City / Governorate *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder={isAr ? 'القاهرة، مصر' : 'Cairo, Egypt'}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                      {isAr ? 'عنوان الفوترة *' : 'Billing Address *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={isAr ? 'الشارع، المنطقة، المدينة' : 'Street address, District'}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div style={{ marginTop: 8 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 800, marginBottom: 10 }}>
                    {isAr ? '3. وسيلة الدفع الإلكتروني (Paymob Egypt)' : '3. Payment Method (Paymob Egypt)'}
                  </label>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        borderRadius: 14,
                        border:
                          paymentMethod === 'paymob_card'
                            ? '2px solid #FF6B35'
                            : '1px solid rgba(255,255,255,0.1)',
                        background: '#181825',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'paymob_card'}
                          onChange={() => setPaymentMethod('paymob_card')}
                        />
                        <CreditCard size={18} style={{ color: '#FF6B35' }} />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 14 }}>
                            {isAr
                              ? 'البطاقات البنكية عبر Paymob (Visa / Mastercard / ميزة Meeza)'
                              : 'Credit / Debit Card via Paymob (Visa / Mastercard / Meeza)'}
                          </div>
                          <div style={{ fontSize: 12, color: '#9090b0' }}>
                            {isAr
                              ? 'دفع فوري آمن بالجنيه المصري وتفعيل تلقائي للباقة'
                              : 'Instant secure EGP payment & automatic plan activation'}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: '#FF6B35' }}>
                        VISA · MC · MEEZA
                      </span>
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        borderRadius: 14,
                        border:
                          paymentMethod === 'paymob_wallet'
                            ? '2px solid #FF6B35'
                            : '1px solid rgba(255,255,255,0.1)',
                        background: '#181825',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'paymob_wallet'}
                          onChange={() => setPaymentMethod('paymob_wallet')}
                        />
                        <Wallet size={18} style={{ color: '#00d98b' }} />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 14 }}>
                            {isAr
                              ? 'المحافظ الإلكترونية المصرية (فودافون كاش / أورانج / اتصالات / WE)'
                              : 'Egyptian Mobile Wallets (Vodafone Cash / Orange / Etisalat / WE)'}
                          </div>
                          <div style={{ fontSize: 12, color: '#9090b0' }}>
                            {isAr
                              ? `عبر بوابة Paymob أو التحويل المباشر على رقم ${UPKLICK_CONTACT_INFO.phoneLocal}`
                              : `Via Paymob Wallet Gateway or direct transfer to ${UPKLICK_CONTACT_INFO.phoneLocal}`}
                          </div>
                        </div>
                      </div>
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        borderRadius: 14,
                        border:
                          paymentMethod === 'instapay'
                            ? '2px solid #FF6B35'
                            : '1px solid rgba(255,255,255,0.1)',
                        background: '#181825',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'instapay'}
                          onChange={() => setPaymentMethod('instapay')}
                        />
                        <Building2 size={18} style={{ color: '#6C35FF' }} />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 14 }}>
                            {isAr ? 'إنستاباي مصر (InstaPay Egypt)' : 'InstaPay Egypt'}
                          </div>
                          <div style={{ fontSize: 12, color: '#9090b0' }}>
                            {isAr ? 'تحويل بنكي لحظي داخل مصر' : 'Instant Egyptian bank transfer via IPN'}
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Policy Agreement Checkbox */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    fontSize: 13,
                    color: '#d0d0e8',
                    background: '#181825',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    required
                    checked={agreedPolicies}
                    onChange={(e) => setAgreedPolicies(e.target.checked)}
                    style={{ marginTop: 4 }}
                  />
                  <span>
                    {isAr ? (
                      <>
                        أوافق على <a href="/terms-of-service" style={{ color: '#FF6B35' }}>شروط الخدمة</a>،{' '}
                        <a href="/privacy-policy" style={{ color: '#FF6B35' }}>سياسة الخصوصية</a>،{' '}
                        <a href="/refund-policy" style={{ color: '#FF6B35' }}>سياسة الاسترجاع والإلغاء (There is no refund)</a>، و
                        <a href="/shipping-policy" style={{ color: '#FF6B35' }}>سياسة الشحن والتسليم الرقمي الفوري (There is no shipping)</a>.
                      </>
                    ) : (
                      <>
                        I agree to the <a href="/terms-of-service" style={{ color: '#FF6B35' }}>Terms of Service</a>,{' '}
                        <a href="/privacy-policy" style={{ color: '#FF6B35' }}>Privacy Policy</a>,{' '}
                        <a href="/refund-policy" style={{ color: '#FF6B35' }}>Refund Policy (&ldquo;There is no refund&rdquo;)</a>, and{' '}
                        <a href="/shipping-policy" style={{ color: '#FF6B35' }}>Shipping Policy (&ldquo;There is no shipping&rdquo;)</a>.
                      </>
                    )}
                  </span>
                </label>

                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B35, #ff4500)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 14,
                    padding: '15px 24px',
                    fontSize: 16,
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(255, 107, 53, 0.35)'
                  }}
                >
                  {isAr
                    ? `تأكيد الطلب والدفع الآن (${selectedPlan.priceEgp} EGP)`
                    : `Complete Secure Payment (${selectedPlan.priceEgp} EGP)`}
                </button>
              </form>
            )}
          </div>

          {/* Order Summary & Compliance Box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div
              style={{
                background: '#101018',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 20,
                padding: '24px 24px'
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: 14, fontSize: 17, fontWeight: 800 }}>
                {isAr ? 'ملخص الطلب (Order Summary)' : 'Order Summary'}
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
                <span style={{ color: '#9090b0' }}>{isAr ? 'الخدمة / الباقة:' : 'Product / Service:'}</span>
                <strong style={{ color: '#fff' }}>{isAr ? selectedPlan.nameAr : selectedPlan.nameEn}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
                <span style={{ color: '#9090b0' }}>{isAr ? 'نوع التسليم:' : 'Delivery Method:'}</span>
                <strong style={{ color: '#00d98b' }}>
                  {isAr ? 'تسليم رقمي فوري (There is no shipping)' : 'Instant Digital SaaS (There is no shipping)'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontSize: 14 }}>
                <span style={{ color: '#9090b0' }}>{isAr ? 'رسوم الشحن:' : 'Shipping Fee:'}</span>
                <strong>0 EGP (There is no shipping)</strong>
              </div>
              <div
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  paddingTop: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 800 }}>{isAr ? 'الإجمالي المستحق:' : 'Total Due:'}</span>
                <span style={{ fontSize: 26, fontWeight: 900, color: '#FF6B35' }}>
                  {selectedPlan.priceEgp} EGP
                </span>
              </div>
            </div>

            {/* Official Policies & Contact Box */}
            <div
              style={{
                background: '#101018',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 20,
                padding: '22px 24px',
                fontSize: 13.5,
                color: '#b8b8d0'
              }}
            >
              <h4 style={{ marginTop: 0, marginBottom: 10, color: '#fff', fontSize: 15 }}>
                {isAr ? 'السياسات الرسمية وبيانات التواصل (مصر)' : 'Official Policies & Contact Us (Egypt)'}
              </h4>
              <ul style={{ margin: '0 0 14px', paddingInlineStart: 18, lineHeight: 1.7 }}>
                <li>
                  <strong>{isAr ? 'سياسة الاسترجاع:' : 'Refund Policy:'}</strong>{' '}
                  <a href="/refund-policy" style={{ color: '#FF6B35' }}>
                    There is no refund (/refund-policy)
                  </a>
                </li>
                <li>
                  <strong>{isAr ? 'سياسة الشحن والتسليم:' : 'Shipping Policy:'}</strong>{' '}
                  <a href="/shipping-policy" style={{ color: '#FF6B35' }}>
                    There is no shipping (/shipping-policy)
                  </a>
                </li>
                <li>
                  <strong>{isAr ? 'سياسة الخصوصية:' : 'Privacy Policy:'}</strong>{' '}
                  <a href="/privacy-policy" style={{ color: '#FF6B35' }}>
                    /privacy-policy
                  </a>
                </li>
              </ul>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Phone size={14} style={{ color: '#FF6B35' }} />
                  <span dir="ltr">{UPKLICK_CONTACT_INFO.phoneDisplay} ({UPKLICK_CONTACT_INFO.phoneLocal})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Mail size={14} style={{ color: '#FF6B35' }} />
                  <span>{UPKLICK_CONTACT_INFO.emailPrimary}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MapPin size={14} style={{ color: '#FF6B35' }} />
                  <span>{isAr ? UPKLICK_CONTACT_INFO.addressAr : UPKLICK_CONTACT_INFO.addressEn}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  background: '#181825',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12,
  padding: '11px 14px',
  color: '#fff',
  fontSize: 14,
  outline: 'none'
};

