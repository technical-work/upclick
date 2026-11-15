'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Shield,
  FileText,
  Trash2,
  CheckCircle2,
  Globe,
  Mail,
  Lock,
  RotateCcw,
  Truck,
  Phone,
  MapPin,
  CreditCard
} from 'lucide-react';

const EFFECTIVE_DATE_EN = 'November 16, 2026';
const EFFECTIVE_DATE_AR = '16 نوفمبر 2026';

export const UPKLICK_CONTACT_INFO = {
  phoneDisplay: '+20 103 897 9275',
  phoneLocal: '01038979275',
  phoneHref: 'tel:+201038979275',
  whatsappHref: 'https://wa.me/201038979275',
  emailPrimary: 'upklickofficial@gmail.com',
  addressAr: '14 شارع مكرم عبيد، مدينة نصر، القاهرة، جمهورية مصر العربية',
  addressEn: '14 Makram Ebeid St., Nasr City, Cairo, Arab Republic of Egypt',
  hoursAr: 'يومياً من 9:00 صباحاً حتى 10:00 مساءً (بتوقيت القاهرة)',
  hoursEn: 'Daily from 9:00 AM to 10:00 PM (Cairo Time, GMT+2)'
};

export default function LegalPageContent({ section = 'privacy' }) {
  const searchParams = useSearchParams();
  const confirmationCodeFromUrl = searchParams?.get('code') || '';

  const [lang, setLang] = useState('en');
  const [scrolled, setScrolled] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteReason, setDeleteReason] = useState('all_data');
  const [deleteNotes, setDeleteNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState(confirmationCodeFromUrl);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (confirmationCodeFromUrl) {
      setConfirmationCode(confirmationCodeFromUrl);
    }
  }, [confirmationCodeFromUrl]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isAr = lang === 'ar';

  const handleDeletionSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const cleanEmail = deleteEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setSubmitError(
        isAr
          ? 'يرجى إدخال عنوان بريد إلكتروني صحيح.'
          : 'Please enter a valid email address.'
      );
      return;
    }
    if (!deleteReason) {
      setSubmitError(
        isAr
          ? 'يرجى اختيار نطاق البيانات المطلوب حذفها.'
          : 'Please select a deletion scope.'
      );
      return;
    }

    // Client-side device rate limit (max 3 requests per 15 minutes from the same device)
    let deviceId = '';
    try {
      deviceId = localStorage.getItem('upklick_device_id') || '';
      if (!deviceId) {
        deviceId = `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
        localStorage.setItem('upklick_device_id', deviceId);
      }
      const now = Date.now();
      const windowMs = 15 * 60 * 1000;
      const storedRaw = localStorage.getItem('upklick_del_req_timestamps');
      const timestamps = (storedRaw ? JSON.parse(storedRaw) : []).filter(
        (ts) => now - ts < windowMs
      );
      if (timestamps.length >= 3) {
        setSubmitError(
          isAr
            ? 'لقد أرسلت الحد الأقصى من الطلبات من هذا الجهاز مؤخراً. يرجى الانتظار 15 دقيقة أو مراسلتنا عبر upklickofficial@gmail.com.'
            : 'Too many requests submitted from this device recently. Please wait 15 minutes or email upklickofficial@gmail.com directly.'
        );
        return;
      }
    } catch {
      // ignore storage errors
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/meta/data-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          deletionScope: deleteReason,
          scope: deleteReason,
          details: deleteNotes.trim(),
          notes: deleteNotes.trim(),
          deviceId,
          source: 'web_form'
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || (!data?.confirmation_code && !data?.request_id)) {
        setSubmitError(
          data?.error ||
            (isAr
              ? 'تعذر إرسال طلب حذف البيانات. يرجى المحاولة مرة أخرى أو مراسلتنا على upklickofficial@gmail.com.'
              : 'Failed to submit data deletion request. Please try again or email upklickofficial@gmail.com.')
        );
        return;
      }

      try {
        const now = Date.now();
        const windowMs = 15 * 60 * 1000;
        const storedRaw = localStorage.getItem('upklick_del_req_timestamps');
        const timestamps = (storedRaw ? JSON.parse(storedRaw) : []).filter(
          (ts) => now - ts < windowMs
        );
        timestamps.push(now);
        localStorage.setItem('upklick_del_req_timestamps', JSON.stringify(timestamps));
      } catch {
        // ignore storage errors
      }

      setConfirmationCode(data.request_id || data.confirmation_code);
    } catch {
      setSubmitError(
        isAr
          ? 'حدث خطأ في الاتصال أثناء إرسال الطلب. يرجى المحاولة مرة أخرى أو مراسلتنا على upklickofficial@gmail.com.'
          : 'Network error while submitting your request. Please try again or email upklickofficial@gmail.com.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const navItems = [
    {
      id: 'privacy',
      href: '/privacy-policy',
      labelEn: 'Privacy Policy',
      labelAr: 'سياسة الخصوصية',
      icon: Shield
    },
    {
      id: 'terms',
      href: '/terms-of-service',
      labelEn: 'Terms of Service',
      labelAr: 'شروط الخدمة',
      icon: FileText
    },
    {
      id: 'refund',
      href: '/refund-policy',
      labelEn: 'Refund Policy',
      labelAr: 'سياسة الاسترجاع',
      icon: RotateCcw
    },
    {
      id: 'shipping',
      href: '/shipping-policy',
      labelEn: 'Shipping Policy',
      labelAr: 'سياسة الشحن والتسليم',
      icon: Truck
    },
    {
      id: 'contact',
      href: '/contact-us',
      labelEn: 'Contact Us',
      labelAr: 'تواصل معنا',
      icon: Phone
    },
    {
      id: 'deletion',
      href: '/data-deletion',
      labelEn: 'Data Deletion',
      labelAr: 'حذف البيانات',
      icon: Trash2
    }
  ];

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="uk-legal-root"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap');

        .uk-legal-root {
          --or: #FF6B35;
          --pu: #6C35FF;
          --ink: #08080f;
          --s1: #101018;
          --s2: #181825;
          --s3: #22223a;
          --t1: #f8f4ff;
          --t2: #9090b0;
          --t3: #50506a;
          --edge: rgba(255, 255, 255, 0.07);
          --edge2: rgba(255, 255, 255, 0.13);
          --or-d: rgba(255, 107, 53, 0.15);
          --pu-d: rgba(108, 53, 255, 0.15);
          --ff: 'IBM Plex Sans Arabic', 'Syne', sans-serif;
          --fb: 'IBM Plex Sans Arabic', 'DM Sans', sans-serif;
          --r: 14px;
          --r2: 20px;
          --r3: 28px;
          min-height: 100vh;
          background: var(--ink);
          color: var(--t1);
          font-family: var(--fb);
          font-size: 14.5px;
          line-height: 1.72;
          position: relative;
          overflow-x: hidden;
        }

        /* Ambient Orbs */
        .uk-amb {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .uk-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.35;
        }
        .uk-orb1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, #FF6B35, transparent);
          top: -200px;
          right: -100px;
        }
        .uk-orb2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, #6C35FF, transparent);
          bottom: 10%;
          left: -150px;
        }
        .uk-orb3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(108, 53, 255, 0.5), transparent);
          top: 40%;
          right: 5%;
        }

        /* Floating Glass Header */
        .uk-hdr {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          width: 92%;
          max-width: 1200px;
          z-index: 100;
          background: rgba(8, 8, 15, 0.55);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 0 24px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.25);
        }
        .uk-hdr.scrolled {
          top: 12px;
          background: rgba(8, 8, 15, 0.88);
          border-color: rgba(255, 255, 255, 0.13);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
        }
        .uk-hdr-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 62px;
          gap: 10px;
          flex-wrap: nowrap;
        }
        .uk-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 56px;
          width: 155px;
          overflow: hidden;
          text-decoration: none;
          flex-shrink: 0;
        }
        .uk-logo img {
          height: 240px;
          width: auto;
          object-fit: contain;
          margin-top: 14px;
          display: block;
        }
        .uk-nav {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-wrap: nowrap;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          max-width: 100%;
        }
        .uk-nav::-webkit-scrollbar {
          display: none;
        }
        .uk-nav-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: var(--t2);
          text-decoration: none;
          font-size: 12.5px;
          font-weight: 600;
          padding: 6px 10px;
          border-radius: 10px;
          border: 1px solid transparent;
          transition: all 0.2s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .uk-nav-link:hover {
          color: var(--t1);
          background: rgba(255, 255, 255, 0.05);
        }
        .uk-nav-link.active {
          background: linear-gradient(135deg, rgba(255, 107, 53, 0.22), rgba(108, 53, 255, 0.22));
          border-color: rgba(255, 107, 53, 0.42);
          color: #ffffff;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        }
        .uk-hdr-btns {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .uk-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 8px 16px;
          border-radius: 12px;
          font-family: var(--ff);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s ease;
          border: none;
          white-space: nowrap;
        }
        .uk-btn-ghost {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--edge);
          color: var(--t2);
        }
        .uk-btn-ghost:hover {
          color: var(--t1);
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--edge2);
        }
        .uk-btn-prime {
          background: linear-gradient(135deg, var(--or), var(--pu));
          color: #fff;
          box-shadow: 0 4px 20px rgba(108, 53, 255, 0.35);
        }
        .uk-btn-prime:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(108, 53, 255, 0.48);
          opacity: 0.96;
        }

        /* Hero & Section Titles */
        .uk-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--or-d);
          border: 1px solid rgba(255, 107, 53, 0.25);
          border-radius: 30px;
          padding: 5px 14px 5px 8px;
          font-size: 12px;
          font-weight: 700;
          color: var(--or);
          margin-bottom: 18px;
        }
        .uk-eyebrow-dot {
          background: linear-gradient(135deg, var(--or), var(--pu));
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: #fff;
        }
        .uk-h1 {
          font-family: var(--ff);
          font-size: clamp(28px, 3.6vw, 44px);
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -0.5px;
          margin: 0 0 14px;
          color: var(--t1);
        }
        .uk-grd {
          background: linear-gradient(90deg, var(--or), var(--pu), #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Dash Frame & Cards */
        .uk-card {
          background: rgba(16, 16, 24, 0.82);
          backdrop-filter: blur(16px);
          border: 1px solid var(--edge2);
          border-radius: var(--r2);
          padding: 28px 30px;
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
          transition: border-color 0.2s ease, transform 0.2s ease;
        }
        .uk-card:hover {
          border-color: rgba(255, 107, 53, 0.28);
        }
        .uk-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--or), var(--pu));
        }
        .uk-card-title {
          font-family: var(--ff);
          font-size: 18.5px;
          font-weight: 800;
          color: var(--t1);
          margin: 0 0 14px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .uk-step-num {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--or), var(--pu));
          color: #fff;
          font-weight: 800;
          font-size: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 3px 10px rgba(255, 107, 53, 0.35);
        }
        .uk-card-body {
          color: var(--t2);
          font-size: 14.5px;
        }
        .uk-card-body strong {
          color: var(--t1);
        }
        .uk-card-body ul, .uk-card-body ol {
          margin: 8px 0 0;
          padding-inline-start: 20px;
        }
        .uk-card-body li {
          margin-bottom: 8px;
        }
        .uk-card-body a {
          color: var(--or);
          font-weight: 700;
          text-decoration: none;
        }
        .uk-card-body a:hover {
          text-decoration: underline;
        }

        /* Step Item Box */
        .uk-step-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--edge);
          border-radius: 14px;
          padding: 13px 16px;
          margin-bottom: 10px;
          transition: all 0.2s ease;
        }
        .uk-step-box:hover {
          background: rgba(255, 255, 255, 0.055);
          border-color: rgba(255, 107, 53, 0.3);
        }

        /* Form Inputs */
        .uk-inp {
          width: 100%;
          box-sizing: border-box;
          background: var(--s2);
          border: 1px solid var(--edge2);
          border-radius: 12px;
          padding: 12px 15px;
          color: var(--t1);
          font-family: var(--fb);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .uk-inp:focus {
          border-color: var(--or);
          box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.15);
        }

        /* Footer */
        .uk-footer {
          position: relative;
          z-index: 2;
          padding: 60px 5% 30px;
          border-top: 1px solid var(--edge);
          background: rgba(8, 8, 15, 0.85);
          backdrop-filter: blur(12px);
        }
        .uk-footer-wrap {
          max-width: 1200px;
          margin: 0 auto;
        }
        .uk-footer-top {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }
        .uk-footer-tagline {
          font-size: 13.5px;
          color: var(--t2);
          line-height: 1.7;
          margin: 0 0 16px;
        }
        .uk-footer-socials {
          display: flex;
          gap: 10px;
        }
        .uk-social-btn {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: var(--s2);
          border: 1px solid var(--edge);
          color: var(--t1);
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .uk-social-btn:hover {
          background: var(--or-d);
          color: var(--or);
          border-color: rgba(255, 107, 53, 0.35);
        }
        .uk-footer-col-title {
          font-family: var(--ff);
          font-size: 13px;
          font-weight: 700;
          color: var(--t1);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 14px;
        }
        .uk-footer-col a {
          display: block;
          color: var(--t2);
          text-decoration: none;
          font-size: 14px;
          margin-bottom: 8px;
          transition: color 0.2s ease;
        }
        .uk-footer-col a:hover {
          color: var(--or);
        }
        .uk-footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 24px;
          border-top: 1px solid var(--edge);
          font-size: 13px;
          color: var(--t3);
          flex-wrap: wrap;
          gap: 12px;
        }
        .uk-lang-btn {
          background: var(--s2);
          border: 1px solid var(--edge);
          border-radius: 6px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          color: var(--t2);
          transition: all 0.2s ease;
        }
        .uk-lang-btn.on, .uk-lang-btn:hover {
          background: var(--or-d);
          color: var(--or);
          border-color: rgba(255, 107, 53, 0.3);
        }

        @media (max-width: 1040px) {
          .uk-hdr {
            top: 12px;
            padding: 10px 14px;
            width: 95%;
          }
          .uk-hdr-inner {
            flex-wrap: wrap;
            min-height: 52px;
          }
          .uk-nav {
            order: 3;
            width: 100%;
            padding-top: 8px;
            border-top: 1px solid rgba(255, 255, 255, 0.07);
          }
          .uk-footer-top {
            grid-template-columns: 1fr 1fr;
            gap: 28px;
          }
        }
        @media (max-width: 600px) {
          .uk-logo {
            width: 125px;
            height: 44px;
          }
          .uk-logo img {
            height: 195px;
            margin-top: 10px;
          }
          .uk-hdr-btns .uk-btn {
            padding: 6px 10px;
            font-size: 12px;
          }
          .uk-footer-top {
            grid-template-columns: 1fr;
          }
          .uk-card {
            padding: 22px 20px;
          }
        }
      `}</style>

      {/* Ambient Background Orbs */}
      <div className="uk-amb">
        <div className="uk-orb uk-orb1" />
        <div className="uk-orb uk-orb2" />
        <div className="uk-orb uk-orb3" />
      </div>

      {/* Floating Glass Header */}
      <header className={`uk-hdr${scrolled ? ' scrolled' : ''}`}>
        <div className="uk-hdr-inner">
          <a href="/" className="uk-logo" title="UpKlick Home">
            <img src="/best_logo_dark.png" alt="UpKlick" />
          </a>

          <nav className="uk-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={`uk-nav-link${active ? ' active' : ''}`}
                >
                  <Icon size={15} />
                  <span>{isAr ? item.labelAr : item.labelEn}</span>
                </a>
              );
            })}
          </nav>

          <div className="uk-hdr-btns">
            <button
              type="button"
              onClick={() => setLang(isAr ? 'en' : 'ar')}
              className="uk-btn uk-btn-ghost"
            >
              <Globe size={14} style={{ color: 'var(--or)' }} />
              <span>{isAr ? 'English' : 'عربي'}</span>
            </button>
            <a href="/login" className="uk-btn uk-btn-ghost">
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </a>
            <a href="/register?cta=start_free" className="uk-btn uk-btn-prime">
              {isAr ? 'ابدأ مجاناً ←' : 'Start Free →'}
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 980,
          margin: '0 auto',
          padding: '130px 20px 80px'
        }}
      >
        {section === 'privacy' && <PrivacyPolicySection isAr={isAr} />}
        {section === 'terms' && <TermsOfServiceSection isAr={isAr} />}
        {section === 'refund' && <RefundPolicySection isAr={isAr} />}
        {section === 'shipping' && <ShippingPolicySection isAr={isAr} />}
        {section === 'contact' && <ContactUsSection isAr={isAr} />}
        {section === 'deletion' && (
          <DataDeletionSection
            isAr={isAr}
            deleteEmail={deleteEmail}
            setDeleteEmail={setDeleteEmail}
            deleteReason={deleteReason}
            setDeleteReason={setDeleteReason}
            deleteNotes={deleteNotes}
            setDeleteNotes={setDeleteNotes}
            submitting={submitting}
            confirmationCode={confirmationCode}
            submitError={submitError}
            onSubmit={handleDeletionSubmit}
          />
        )}
      </main>

      {/* Full UpKlick Footer */}
      <footer className="uk-footer">
        <div className="uk-footer-wrap">
          <div className="uk-footer-top">
            <div>
              <a
                href="/"
                className="uk-logo"
                style={{
                  marginBottom: 12,
                  height: 56,
                  width: 200,
                  overflow: 'hidden',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src="/best_logo_dark.png"
                  alt="UpKlick"
                  style={{ height: 260, width: 'auto', objectFit: 'contain', marginTop: 14 }}
                />
              </a>
              <p className="uk-footer-tagline">
                {isAr
                  ? 'نظام التشغيل المتكامل بالذكاء الاصطناعي لرواد الأعمال وصناع المحتوى والشركات. ابنِ ونمِّ وأدر أعمالك بالكامل من لوحة تحكم واحدة.'
                  : 'The AI Operating System for Arab creators, coaches, and entrepreneurs. Build, grow, and manage everything from one dashboard.'}
              </p>
              <div className="uk-footer-socials">
                <a
                  className="uk-social-btn"
                  href="https://www.facebook.com/share/1HTzsrK8Ur/"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Facebook Page"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  className="uk-social-btn"
                  href="https://www.facebook.com/groups/963841463139798"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Facebook Group"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </a>
                <a
                  className="uk-social-btn"
                  href="https://www.instagram.com/upklickapp?igsh=cXpxd2JyYm84YXAy"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Instagram"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  className="uk-social-btn"
                  href="https://youtube.com/@upklick?si=NILmLzFek8kpXgW_"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="YouTube"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="uk-footer-col">
              <div className="uk-footer-col-title">{isAr ? 'المنتج' : 'Product'}</div>
              <a href="/#tools">{isAr ? 'جميع الأدوات' : 'All Tools'}</a>
              <a href="/#pricing">{isAr ? 'الأسعار والخطط' : 'Pricing & Plans'}</a>
              <a href="/checkout">{isAr ? 'صفحة الدفع والاشتراك' : 'Checkout Page'}</a>
              <a href="/login">{isAr ? 'تسجيل الدخول' : 'Login'}</a>
              <a href="/register?cta=start_free">{isAr ? 'حساب مجاني' : 'Sign Up Free'}</a>
            </div>

            <div className="uk-footer-col">
              <div className="uk-footer-col-title">{isAr ? 'تواصل معنا (مصر)' : 'Contact Us (Egypt)'}</div>
              <a href={UPKLICK_CONTACT_INFO.phoneHref} dir="ltr">📞 {UPKLICK_CONTACT_INFO.phoneDisplay} ({UPKLICK_CONTACT_INFO.phoneLocal})</a>
              <a href={`mailto:${UPKLICK_CONTACT_INFO.emailPrimary}`}>✉️ {UPKLICK_CONTACT_INFO.emailPrimary}</a>
              <a href="/contact-us">📍 {isAr ? UPKLICK_CONTACT_INFO.addressAr : UPKLICK_CONTACT_INFO.addressEn}</a>
            </div>

            <div className="uk-footer-col">
              <div className="uk-footer-col-title">{isAr ? 'السياسات والقانونية' : 'Policies & Legal'}</div>
              <a href="/privacy-policy">{isAr ? 'سياسة الخصوصية (Privacy Policy)' : 'Privacy Policy'}</a>
              <a href="/refund-policy">{isAr ? 'سياسة الاسترجاع والإلغاء (Refund Policy)' : 'Refund & Cancellation Policy'}</a>
              <a href="/shipping-policy">{isAr ? 'سياسة الشحن والتسليم (Shipping Policy)' : 'Shipping & Delivery Policy'}</a>
              <a href="/terms-of-service">{isAr ? 'شروط الخدمة (Terms of Service)' : 'Terms of Service'}</a>
              <a href="/contact-us">{isAr ? 'تواصل معنا (Contact Us)' : 'Contact Us'}</a>
              <a href="/data-deletion">{isAr ? 'حذف البيانات (Data Deletion)' : 'Data Deletion'}</a>
            </div>
          </div>

          <div className="uk-footer-bottom">
            <span>
              © {new Date().getFullYear()} UpKlick.{' '}
              {isAr
                ? 'صُنع لرواد الأعمال العرب 🇸🇦🇦🇪🇪🇬🇰🇼🇶🇦🇲🇦'
                : 'Built for Arab entrepreneurs 🇸🇦🇦🇪🇪🇬🇰🇼🇶🇦🇲🇦'}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className={`uk-lang-btn${!isAr ? ' on' : ''}`}
                onClick={() => setLang('en')}
              >
                EN
              </button>
              <button
                type="button"
                className={`uk-lang-btn${isAr ? ' on' : ''}`}
                onClick={() => setLang('ar')}
              >
                AR
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CardSection({ num, title, children }) {
  return (
    <section className="uk-card">
      <h2 className="uk-card-title">
        {num ? <span className="uk-step-num">{num}</span> : null}
        <span>{title}</span>
      </h2>
      <div className="uk-card-body">{children}</div>
    </section>
  );
}

function PageHero({ badge, titleMain, titleGradient, subtitle, isAr }) {
  return (
    <div style={{ marginBottom: 38 }}>
      <div className="uk-eyebrow">
        <span className="uk-eyebrow-dot">✦</span>
        <span>{badge}</span>
      </div>
      <h1 className="uk-h1">
        {titleMain} <span className="uk-grd">{titleGradient}</span>
      </h1>
      <p style={{ margin: 0, color: 'var(--t2)', fontSize: 15, maxWidth: 680 }}>
        {subtitle} ·{' '}
        <strong style={{ color: 'var(--t1)' }}>
          {isAr ? `تاريخ السريان: ${EFFECTIVE_DATE_AR}` : `Last Updated: ${EFFECTIVE_DATE_EN}`}
        </strong>
      </p>
    </div>
  );
}

function PrivacyPolicySection({ isAr }) {
  if (isAr) {
    return (
      <>
        <PageHero
          badge="الخصوصية وحماية البيانات"
          titleMain="سياسة"
          titleGradient="الخصوصية"
          subtitle="توضح هذه السياسة كيفية جمع واستخدام وحماية بياناتك الشخصية وبيانات التكامل مع منصات Meta داخل منصة UpKlick"
          isAr
        />

        <CardSection num="01" title="مقدمة ونطاق السياسة">
          <p style={{ margin: 0 }}>
            نرحب بك في <strong>UpKlick</strong> ("المنصة"، "نحن"). نحن نلتزم بحماية خصوصيتك وأمان بياناتك وفقاً لأعلى المعايير الدولية ولوائح حماية البيانات (بما في ذلك GDPR وCCPA وسياسات منصة Meta للمطورين). تنطبق سياسة الخصوصية هذه على جميع خدماتنا وتطبيقاتنا ومواقعنا وأدوات الذكاء الاصطناعي والتسويق المتاحة عبر UpKlick.
          </p>
        </CardSection>

        <CardSection num="02" title="البيانات التي نقوم بجمعها">
          <ul>
            <li><strong>بيانات الحساب والهوية:</strong> الاسم، البريد الإلكتروني، رقم الهاتف، اسم الشركة، وصورة الملف الشخصي عند التسجيل أو تسجيل الدخول.</li>
            <li><strong>بيانات الأعمال والعملاء (CRM & Funnels):</strong> صفحات الهبوط، المتاجر، النماذج، قوائم جهات الاتصال، وحملات البريد الإلكتروني والواتساب التي تنشئها داخل حسابك.</li>
            <li><strong>بيانات الدفع والفوترة:</strong> تتم معالجة المدفوعات بشكل آمن عبر مزودي دفع معتمدين (مثل Stripe) ولا نقوم بتخزين أرقام البطاقات الائتمانية الكاملة على خوادمنا.</li>
            <li><strong>البيانات التقنية وملفات تعريف الارتباط (Cookies):</strong> عنوان بروتوكول الإنترنت (IP)، نوع المتصفح، الجهاز، وسجلات الاستخدام لتحسين الأداء والأمان.</li>
          </ul>
        </CardSection>

        <CardSection num="03" title="بيانات تكامل منصات Meta (Facebook و Instagram و WhatsApp و Meta Ads)">
          <p style={{ marginTop: 0 }}>
            عند قيامك بربط حسابك في UpKlick مع خدمات شركة <strong>Meta Platforms, Inc.</strong> (بما في ذلك تسجيل الدخول عبر فيسبوك، صفحات فيسبوك، حسابات إنستغرام الاحترافية، واجهة برمجة تطبيقات WhatsApp Business، ومدير إعلانات Meta / Pixel)، نقوم بجمع ومعالجة الصلاحيات والبيانات التي تصرح بها صراحةً فقط:
          </p>
          <ul>
            <li><strong>معلومات الملف الشخصي الأساسية والمصادقة:</strong> المعرف الفريد (Meta User ID)، الاسم، والبريد الإلكتروني المستخدم لتوثيق هويتك وربط حسابك.</li>
            <li><strong>صفحات فيسبوك وحسابات إنستغرام الاحترافية:</strong> معرفات صفحات فيسبوك وحسابات إنستغرام، الأسماء، أسماء المستخدمين، وصور الملف الشخصي للحسابات التي تختار ربطها، وتُستخدم لعرضها داخل لوحة التحكم الخاصة بك وتوجيه رسائلها إلى صندوق الوارد الخاص بك.</li>
            <li><strong>رسائل فيسبوك ماسنجر ورسائل إنستغرام المباشرة (Messenger &amp; Instagram Direct Messages):</strong> عند ربط صفحة فيسبوك أو حساب إنستغرام احترافي، نتلقى الرسائل التي يرسلها العملاء إلى تلك الصفحة أو الحساب (معرف المرسل، الاسم، نص الرسالة، المرفقات، والطوابع الزمنية) عبر إشعارات ويب هوك الخاصة بـ Meta (Webhooks). نقوم بتخزينها في صندوق الوارد (UpKlick Inbox) الخاص بك لتتمكن من قراءتها والرد عليها، سواء يدوياً أو من خلال التدفقات التلقائية (Flows) وردود الذكاء الاصطناعي التي تقوم بإعدادها. نحن نرسل الرسائل فقط كردود على المحادثات التي يبدأها العملاء ضمن نافذة المراسلة المعتمدة من Meta.</li>
            <li><strong>المعالجة بالذكاء الاصطناعي (AI Processing):</strong> إذا قمت بتفعيل ردود الذكاء الاصطناعي، يتم إرسال نص الرسائل الواردة وقاعدة المعرفة الخاصة بك إلى مزودي نماذج الذكاء الاصطناعي لدينا حصرياً لتوليد رد نيابةً عنك. ولا يُسمح لهؤلاء المزودين باستخدام هذه البيانات لتدريب نماذجهم.</li>
            <li><strong>بيانات WhatsApp Business API:</strong> معرف حساب واتساب للأعمال (WABA ID)، أرقام الهواتف المسجلة، قوالب الرسائل، وحالة تسليم الرسائل لإدارة المحادثات والحملات التسويقية المصرح بها.</li>
            <li><strong>بيانات الإعلانات والـ Pixel (Meta Ads &amp; Leads):</strong> معرفات الحساب الإعلاني والبيكسل (Pixel ID)، أداء الحملات الإعلانية، وبيانات العملاء المحتملين (Lead Ads) لمزامنتها تلقائياً مع نظام CRM الخاص بك.</li>
          </ul>
          <p style={{ marginBottom: 0 }}>
            <strong>التزامنا الصارم بخصوص بيانات Meta:</strong> يتم استخدام البيانات المستلمة من واجهات برمجة تطبيقات Meta حصرياً لتشغيل الميزات التي طلبتها داخل لوحة تحكم UpKlick الخاصة بك. نحن <strong>لا نبيع</strong> بيانات Meta مطلقاً، ولا نشاركها مع وسطاء البيانات أو أطراف ثالثة لأغراض إعلانية مستقلة، ولا نستخدمها لبناء ملفات تعريف غير مصرح بها. يتم تخزين جميع رموز الوصول (OAuth Access Tokens) بشكل مشفر ويمكن إلغاؤها في أي وقت.
          </p>
        </CardSection>

        <CardSection num="04" title="كيف نستخدم بياناتك">
          <ul>
            <li>تقديم وتشغيل وتخصيص خدمات المنصة وأدوات الذكاء الاصطناعي وبناء المواقع والمتاجر.</li>
            <li>تشغيل صندوق الوارد الموحد للمحادثات، وتنفيذ عمليات النشر، وإرسال رسائل البريد الإلكتروني ورسائل WhatsApp Business نيابةً عنك وبناءً على طلبك.</li>
            <li>عرض تحليلات الأداء، وتتبع التحويلات الإعلانية، ومزامنة العملاء المحتملين.</li>
            <li>حماية المنصة من الاحتيال أو الاستخدام غير المصرح به والامتثال للمتطلبات القانونية.</li>
          </ul>
        </CardSection>

        <CardSection num="05" title="مشاركة البيانات وتخزينها وأمنها">
          <p style={{ marginTop: 0 }}>
            نطبق ضوابط أمان قياسية تشمل تشفير HTTPS/TLS أثناء النقل، وضوابط وصول مقيدة، وبنية تحتية سحابية آمنة (Google Cloud / Firebase، وAWS SES، وVercel، ومزودي نماذج الذكاء الاصطناعي). نحن نشارك البيانات فقط مع معالجات البنية التحتية الفرعية الأساسية اللازمة لتقديم الخدمة (الاستضافة السحابية عبر Vercel وGoogle Cloud / Firebase، معالجة المدفوعات، مزودي نماذج الذكاء الاصطناعي، وواجهات برمجة التطبيقات التي تربطها صراحةً). نحتفظ بالبيانات الشخصية وبيانات التكامل فقط طوال فترة نشاط حسابك أو حسب الحاجة لتنفيذ طلباتك.
          </p>
          <p style={{ marginBottom: 0 }}>
            يتم الاحتفاظ بالرسائل وبيانات الحسابات المرتبطة طوال فترة بقاء التكامل نشطاً. يؤدي فصل التكامل إلى حذف رموز الوصول الخاصة به فوراً؛ بينما يظل سجل المحادثات محفوظاً في مساحة العمل الخاصة بك حتى تقوم بحذفه أو تطلب حذفه. يتم حذف جميع بيانات Meta خلال 30 يوماً من حذف الحساب أو تقديم طلب حذف البيانات.
          </p>
        </CardSection>

        <CardSection num="06" title="حقوقك وكيفية حذف بياناتك">
          <p style={{ margin: 0 }}>
            يحق لك في أي وقت الوصول إلى بياناتك، تصحيحها، تصديرها، أو طلب حذفها بالكامل. يمكنك إلغاء ربط تكاملات Meta مباشرةً من لوحة التحكم أو طلب الحذف الفوري عبر صفحة{' '}
            <a href="/data-deletion">تعليمات وطلب حذف البيانات (/data-deletion)</a>.
          </p>
        </CardSection>

        <CardSection num="07" title="التواصل معنا (Contact Us)">
          <p style={{ marginTop: 0 }}>
            إذا كانت لديك أي استفسارات حول سياسة الخصوصية أو ممارسات حماية البيانات لدينا، يمكنك التواصل معنا مباشرة:
          </p>
          <ul>
            <li><strong>رقم الهاتف داخل مصر (Mobile No inside Egypt):</strong> <a href={UPKLICK_CONTACT_INFO.phoneHref} dir="ltr">{UPKLICK_CONTACT_INFO.phoneDisplay}</a> ({UPKLICK_CONTACT_INFO.phoneLocal})</li>
            <li><strong>البريد الإلكتروني (Email):</strong> <a href={`mailto:${UPKLICK_CONTACT_INFO.emailPrimary}`}>{UPKLICK_CONTACT_INFO.emailPrimary}</a></li>
            <li><strong>العنوان (Address):</strong> {UPKLICK_CONTACT_INFO.addressAr}</li>
          </ul>
        </CardSection>
      </>
    );
  }

  return (
    <>
      <PageHero
        badge="PRIVACY & DATA PROTECTION"
        titleMain="Privacy"
        titleGradient="Policy"
        subtitle="How UpKlick collects, uses, protects, and handles your personal data and Meta Platform integrations"
        isAr={false}
      />

      <CardSection num="01" title="Introduction & Scope">
        <p style={{ margin: 0 }}>
          Welcome to <strong>UpKlick</strong> (&ldquo;UpKlick&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). This Privacy Policy explains how we collect, use, store, and protect information when you use our platform, websites, funnels, e-commerce stores, AI tools, CRM, outreach tools, and third-party integrations (including Meta Platforms, Inc. services). By using UpKlick, you agree to the practices described in this Privacy Policy.
        </p>
      </CardSection>

      <CardSection num="02" title="Information We Collect">
        <ul>
          <li><strong>Account & Profile Information:</strong> Name, email address, phone number, business name, and profile photo provided when registering or authenticating.</li>
          <li><strong>Business, CRM & Funnel Data:</strong> Websites, funnels, stores, forms, contacts, leads, and campaign content you create or manage within your workspace.</li>
          <li><strong>Billing & Transaction Data:</strong> Subscription and payment details processed securely by PCI-compliant payment processors (such as Stripe). We do not store raw credit card numbers on our servers.</li>
          <li><strong>Technical & Usage Data:</strong> IP address, browser type, device identifiers, log data, and cookies used for authentication, security, and analytics.</li>
        </ul>
      </CardSection>

      <CardSection num="03" title="Meta Platform Data (Facebook, Instagram, WhatsApp Business & Meta Ads)">
        <p style={{ marginTop: 0 }}>
          When you connect your UpKlick account to <strong>Meta Platforms, Inc.</strong> services (including Facebook Login, Facebook Pages, Instagram Business Accounts, WhatsApp Business Platform / Cloud API, Meta Ads Manager, Meta Pixel, and Conversions API), we collect and process only the permissions and data you explicitly authorize:
        </p>
        <ul>
          <li><strong>Authentication & Basic Profile:</strong> Your Meta User ID, name, and email address used to authenticate your identity and link your account.</li>
          <li><strong>Facebook Pages & Instagram Professional Accounts:</strong> Page and Instagram account IDs, names, usernames and profile pictures for the accounts you choose to connect, used to show them in your dashboard and route their messages to your Inbox.</li>
          <li><strong>Messenger & Instagram Direct Messages:</strong> When you connect a Facebook Page or Instagram professional account, we receive the messages that customers send to that Page or account (sender ID, name, message text, attachments and timestamps) through Meta webhooks. We store them in your UpKlick Inbox so you can read and reply to them, either manually or through automated Flows and AI replies that you configure. We only send messages as replies to customer-initiated conversations within Meta&apos;s messaging window.</li>
          <li><strong>AI Processing:</strong> If you enable AI replies, the text of incoming messages and your knowledge base is sent to our AI model providers solely to generate a reply for you. These providers are not allowed to use this data to train their models.</li>
          <li><strong>WhatsApp Business Platform Data:</strong> WhatsApp Business Account (WABA) ID, registered phone number IDs, approved message templates, webhook delivery statuses, and customer-initiated or opt-in messaging metadata.</li>
          <li><strong>Meta Ads, Pixel & Lead Ads Data:</strong> Ad account IDs, Meta Pixel IDs, campaign performance metrics, and lead form submissions synced into your UpKlick CRM at your direction.</li>
        </ul>
        <p style={{ marginBottom: 0 }}>
          <strong>Strict Limitation on Meta Data Use:</strong> Data obtained through Meta APIs is used strictly to provide the features you request inside your UpKlick dashboard. We <strong>never sell, license, or transfer</strong> Meta Platform Data to data brokers or third parties for independent advertising, nor do we use it to build unauthorized user profiles. All OAuth access tokens are stored encrypted and can be revoked at any time.
        </p>
      </CardSection>

      <CardSection num="04" title="How We Use Your Information">
        <ul>
          <li>To provide, operate, maintain, and improve the UpKlick platform and AI-powered business tools.</li>
          <li>To execute social media publishing, analytics reporting, Meta Pixel tracking, and WhatsApp/email outreach campaigns initiated by you.</li>
          <li>To authenticate users, prevent fraud, enforce our Terms of Service, and comply with legal obligations.</li>
          <li>To send transactional notifications, security alerts, and customer support responses.</li>
        </ul>
      </CardSection>

      <CardSection num="05" title="Data Sharing, Storage & Security">
        <p style={{ marginTop: 0 }}>
          We implement industry-standard security controls including HTTPS/TLS encryption in transit, restricted access controls, and secure cloud infrastructure (Vercel, Google Cloud / Firebase, AWS SES, and AI model providers). We share data only with essential infrastructure sub-processors required to deliver the service (cloud hosting on Vercel and Google Cloud / Firebase, payment processing, AI model providers, and APIs you explicitly connect). We retain personal and integration data only for as long as your account remains active or as needed to fulfill your requests.
        </p>
        <p style={{ marginBottom: 0 }}>
          Messages and connected-account data are kept while the integration is active. Disconnecting an integration deletes its access tokens immediately; conversation history is kept in your workspace until you delete it or request deletion. All Meta data is deleted within 30 days of an account deletion or a data deletion request.
        </p>
      </CardSection>

      <CardSection num="06" title="Your Privacy Rights & Data Deletion">
        <p style={{ margin: 0 }}>
          Depending on your jurisdiction (including GDPR, UK GDPR, and CCPA), you have the right to access, correct, export, restrict processing of, or delete your personal data and connected Meta Platform data. You may disconnect Meta integrations at any time from your dashboard or request complete data deletion via our dedicated{' '}
          <a href="/data-deletion">User Data Deletion page (/data-deletion)</a>.
        </p>
      </CardSection>

      <CardSection num="07" title="Contact Us">
        <p style={{ marginTop: 0 }}>
          For any questions, privacy requests, or Data Protection Officer inquiries regarding this Privacy Policy, please contact us at:
        </p>
        <ul>
          <li><strong>Mobile Number (Egypt):</strong> <a href={UPKLICK_CONTACT_INFO.phoneHref}>{UPKLICK_CONTACT_INFO.phoneDisplay}</a> ({UPKLICK_CONTACT_INFO.phoneLocal})</li>
          <li><strong>Email Address:</strong> <a href={`mailto:${UPKLICK_CONTACT_INFO.emailPrimary}`}>{UPKLICK_CONTACT_INFO.emailPrimary}</a></li>
          <li><strong>Physical Address:</strong> {UPKLICK_CONTACT_INFO.addressEn}</li>
        </ul>
      </CardSection>
    </>
  );
}

function TermsOfServiceSection({ isAr }) {
  if (isAr) {
    return (
      <>
        <PageHero
          badge="الشروط والأحكام القانونية"
          titleMain="شروط"
          titleGradient="الخدمة"
          subtitle="الشروط والأحكام التي تنظم استخدامك لمنصة UpKlick وجميع الأدوات والتكاملات المرتبطة بها"
          isAr
        />

        <CardSection num="01" title="قبول الشروط">
          <p style={{ margin: 0 }}>
            باستخدامك لمنصة <strong>UpKlick</strong> أو إنشاء حساب عليها، فإنك توافق على الالتزام بشروط الخدمة هذه وسياسة الخصوصية الخاصة بنا. إذا كنت تستخدم المنصة نيابةً عن شركة أو مؤسسة، فإنك تقر بأن لديك الصلاحية القانونية لإلزام تلك الجهة بهذه الشروط.
          </p>
        </CardSection>

        <CardSection num="02" title="وصف الخدمة">
          <p style={{ margin: 0 }}>
            توفر UpKlick نظام تشغيل متكاملاً مدعوماً بالذكاء الاصطناعي لرواد الأعمال وصناع المحتوى والشركات، ويشمل: بناء الفانلز والمواقع والمتاجر الإلكترونية، إدارة علاقات العملاء (CRM)، صندوق وارد موحد لرسائل فيسبوك ماسنجر ورسائل إنستغرام المباشرة (Facebook Messenger &amp; Instagram Direct messages)، أدوات التسويق عبر البريد الإلكتروني وواتساب، إدارة المجتمعات والدورات،حجز النطاقات، التحليلات، والربط مع منصات التواصل الاجتماعي والإعلانات (بما في ذلك Meta وGoogle وTelegram).
          </p>
        </CardSection>

        <CardSection num="03" title="تسجيل الحساب والأمان">
          <ul>
            <li>يجب أن تكون المعلومات المقدمة عند التسجيل صحيحة ودقيقة ومحدثة.</li>
            <li>أنت مسؤول بالكامل عن الحفاظ على سرية بيانات الدخول الخاصة بحسابك وعن جميع الأنشطة التي تتم من خلاله.</li>
            <li>يجب إخطارنا فوراً عبر <a href="mailto:upklickofficial@gmail.com">upklickofficial@gmail.com</a> عند الاشتباه بأي استخدام غير مصرح به لحسابك.</li>
          </ul>
        </CardSection>

        <CardSection num="04" title="التكامل مع خدمات Meta والجهات الخارجية">
          <p style={{ marginTop: 0 }}>
            عند ربط حسابك في UpKlick مع خدمات <strong>Meta</strong> (فيسبوك، إنستغرام، WhatsApp Business، أو Meta Ads) أو أي منصات خارجية أخرى:
          </p>
          <ul>
            <li>أنت تقر بأن لديك الصلاحية القانونية لربط وإدارة الصفحات وحسابات إنستغرام والحسابات الإعلانية وأرقام WhatsApp Business المرتبطة.</li>
            <li>تلتزم بالامتثال الكامل لشروط منصة Meta (Meta Platform Terms)، والشروط التجارية لـ Meta، وسياسات المراسلة التجارية لـ WhatsApp.</li>
            <li>سوف تستخدم مراسلات Messenger وInstagram فقط للرد على الأشخاص الذين تواصلوا مع صفحتك أو حسابك، ضمن نافذة المراسلة القياسية الخاصة بـ Meta، وبما يتوافق مع سياسة منصة Messenger وسياسة منصة Instagram.</li>
            <li>إذا قمت بتفعيل الردود التلقائية (التدفقات Flows أو الذكاء الاصطناعي AI)، فيجب عليك إبلاغ العملاء بأنهم قد يتحدثون إلى مساعد آلي حيثما كان ذلك مطلوباً، وتوفير وسيلة لهم للتواصل مع موظف بشري.</li>
            <li>أنت مسؤول عن محتوى الرسائل المرسلة من مساحة العمل الخاصة بك، بما في ذلك الردود التلقائية.</li>
            <li>يجب الحصول على موافقة مسبقة صالحة (Opt-in) من المستلمين قبل إرسال رسائل تسويقية عبر حملات واتساب أو البريد الإلكتروني واحترام جميع طلبات إلغاء الاشتراك فوراً.</li>
          </ul>
        </CardSection>

        <CardSection num="05" title="الاشتراكات والمدفوعات والأرصدة">
          <p style={{ margin: 0 }}>
            تخضع الخطط المدفوعة وشراء الدومينات وأرصدة الرسائل للأسعار الموضحة داخل المنصة وقت الشراء. يتم تجديد الاشتراكات الدورية تلقائياً ما لم يتم إلغاؤها قبل موعد التجديد من إعدادات الفوترة.
          </p>
        </CardSection>

        <CardSection num="06" title="الملكية الفكرية والمحتوى">
          <p style={{ margin: 0 }}>
            تحتفظ أنت بملكية جميع البيانات والمحتويات والمواقع وقوائم العملاء التي تنشئها أو ترفعها على UpKlick. وتمنحنا ترخيصاً محدوداً لاستضافة ومعالجة هذا المحتوى فقط بالقدر اللازم لتقديم خدمات المنصة لك. جميع حقوق البرمجيات والعلامات التجارية والتصاميم الخاصة بـ UpKlick محفوظة للمنصة.
          </p>
        </CardSection>

        <CardSection num="07" title="إنهاء الحساب وتحديد المسؤولية">
          <p style={{ margin: 0 }}>
            يمكنك إغلاق حسابك وطلب حذف بياناتك في أي وقت. كما نحتفظ بالحق في تعليق أو إنهاء الحسابات التي تنتهك شروط الاستخدام أو سياسات مكافحة الرسائل المزعجة. يتم تقديم الخدمة "كما هي" دون ضمانات ضمنية، ولا تتجاوز مسؤوليتنا القانونية إجمالي المبالغ المدفوعة من قبلك خلال الاثني عشر شهراً السابقة.
          </p>
        </CardSection>

        <CardSection num="08" title="التواصل والدعم القانوني">
          <p style={{ margin: 0 }}>
            لأي استفسارات تتعلق بشروط الخدمة، يرجى التواصل معنا عبر البريد الإلكتروني:{' '}
            <a href="mailto:upklickofficial@gmail.com">upklickofficial@gmail.com</a>
          </p>
        </CardSection>
      </>
    );
  }

  return (
    <>
      <PageHero
        badge="LEGAL AGREEMENT"
        titleMain="Terms of"
        titleGradient="Service"
        subtitle="The terms and conditions governing your access to and use of the UpKlick platform and integrations"
        isAr={false}
      />

      <CardSection num="01" title="Acceptance of Terms">
        <p style={{ margin: 0 }}>
          By accessing or using <strong>UpKlick</strong> (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service and our{' '}
          <a href="/Privacy-policy">Privacy Policy</a>. If you are using the Service on behalf of a business or legal entity, you represent and warrant that you have the authority to bind that entity to these Terms.
        </p>
      </CardSection>

      <CardSection num="02" title="Description of Service">
        <p style={{ margin: 0 }}>
          UpKlick provides an AI-powered business operating system including website, funnel, and e-commerce store builders, CRM, a unified Inbox for Facebook Messenger and Instagram Direct messages, email and WhatsApp outreach tools, memberships and communities, domain registration, analytics, and integrations with third-party platforms including Meta (Facebook, Instagram, WhatsApp Business, Meta Ads).
        </p>
      </CardSection>

      <CardSection num="03" title="Account Registration & Security">
        <ul>
          <li>You must provide accurate, current, and complete information during registration.</li>
          <li>You are solely responsible for safeguarding your account credentials and for all activity occurring under your account.</li>
          <li>You must notify us immediately at <a href="mailto:upklickofficial@gmail.com">upklickofficial@gmail.com</a> of any unauthorized access or security breach.</li>
        </ul>
      </CardSection>

      <CardSection num="04" title="Meta Platform & Third-Party Integrations">
        <p style={{ marginTop: 0 }}>
          When you connect your UpKlick workspace to <strong>Meta Platforms, Inc.</strong> services (Facebook Login, Facebook Pages, Instagram Professional Accounts, WhatsApp Business Platform, Meta Pixel, or Meta Ads) or other third-party services:
        </p>
        <ul>
          <li>You represent that you are authorized to connect and manage the respective Pages, Instagram accounts, Ad Accounts, and WhatsApp Business numbers.</li>
          <li>You agree to comply with all applicable Meta policies, including the Meta Platform Terms, Meta Commercial Terms, and the WhatsApp Business Messaging Policy.</li>
          <li>You will use Messenger and Instagram messaging only to respond to people who contacted your Page or account, within Meta&apos;s standard messaging window, and in compliance with the Messenger Platform Policy and the Instagram Platform Policy.</li>
          <li>If you enable automated replies (Flows or AI), you must tell customers they may be talking to an automated assistant where required, and give them a way to reach a human.</li>
          <li>You are responsible for the content of messages sent from your workspace, including automated replies.</li>
          <li>You must obtain valid prior opt-in consent from recipients before sending marketing messages via WhatsApp or email campaigns and honor all unsubscribe/opt-out requests promptly.</li>
        </ul>
      </CardSection>

      <CardSection num="05" title="Acceptable Use Policy">
        <p style={{ margin: 0 }}>
          You agree not to use UpKlick to transmit unlawful, deceptive, defamatory, or fraudulent content, send unsolicited bulk spam, distribute malware, violate intellectual property rights, or bypass platform security or rate limits. Violation of this policy may result in immediate suspension or termination of your account.
        </p>
      </CardSection>

      <CardSection num="06" title="Subscriptions, Billing & Credits">
        <p style={{ margin: 0 }}>
          Paid plans, custom domain registrations, and messaging/AI credit bundles are billed in advance according to the pricing displayed at checkout. Recurring subscriptions automatically renew unless cancelled prior to the renewal date in your Billing Settings.
        </p>
      </CardSection>

      <CardSection num="07" title="Intellectual Property & User Content">
        <p style={{ margin: 0 }}>
          You retain full ownership of all content, websites, customer lists, and data you upload or create in UpKlick. You grant UpKlick a limited, non-exclusive license to host, process, and transmit your content solely as necessary to provide the Service. All UpKlick software, branding, templates, and proprietary algorithms remain the exclusive property of UpKlick.
        </p>
      </CardSection>

      <CardSection num="08" title="Termination, Disclaimer & Limitation of Liability">
        <p style={{ margin: 0 }}>
          You may terminate your account and request full data deletion at any time via your dashboard or our{' '}
          <a href="/data-deletion">Data Deletion page</a>. The Service is provided &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; without warranties of any kind. To the maximum extent permitted by law, UpKlick shall not be liable for indirect, incidental, or consequential damages.
        </p>
      </CardSection>

      <CardSection num="09" title="Contact Information">
        <p style={{ margin: 0 }}>
          Questions about these Terms of Service should be sent to:{' '}
          <a href="mailto:upklickofficial@gmail.com">upklickofficial@gmail.com</a>
        </p>
      </CardSection>
    </>
  );
}

function DataDeletionSection({
  isAr,
  deleteEmail,
  setDeleteEmail,
  deleteReason,
  setDeleteReason,
  deleteNotes,
  setDeleteNotes,
  submitting,
  confirmationCode,
  submitError,
  onSubmit
}) {
  const fbSteps = isAr
    ? [
        'انتقل إلى حسابك على Facebook واضغط على القائمة ثم اختر الإعدادات والخصوصية (Settings & Privacy) ← الإعدادات (Settings).',
        'من القائمة الجانبية، انتقل إلى التطبيقات ومواقع الويب (Apps and Websites) أو تكاملات الأعمال (Business Integrations).',
        'ابحث عن تطبيق UpKlick في قائمة التطبيقات النشطة واضغط على زر إزالة (Remove).',
        'أكد عملية الإزالة. يؤدي هذا فوراً إلى إلغاء صلاحية وصول UpKlick إلى بيانات حسابك على فيسبوك وإنستغرام. ولحذف البيانات المخزنة مسبقاً داخل UpKlick، استخدم الطريقة 2 أو الطريقة 3 أدناه.'
      ]
    : [
        'Log into your Facebook account and navigate to Settings & Privacy → Settings.',
        'Select "Apps and Websites" or "Business Integrations" from the left-hand navigation menu.',
        'Find "UpKlick" in your list of connected apps and click the "Remove" button.',
        "Confirm removal. This immediately revokes UpKlick's access to your Facebook and Instagram data. To also delete data already stored in UpKlick, use Method 2 or Method 3 below."
      ];

  const dashSteps = isAr
    ? [
        'سجّل الدخول إلى حسابك في UpKlick عبر الرابط /login.',
        'افتح الإعدادات (Settings) ← التكاملات (Integrations).',
        'اضغط على إلغاء الربط (Disconnect) بجوار Facebook Messenger أو Instagram. يؤدي هذا فوراً إلى حذف رموز الوصول المخزنة وإيقاف استقبال الرسائل الجديدة. ويظل سجل المحادثات الحالي محفوظاً داخل مساحة العمل الخاصة بك حتى تطلب حذفه (الطريقة 3).'
      ]
    : [
        'Sign in to your UpKlick account at /login.',
        'Open Settings → Integrations.',
        'Click Disconnect next to Facebook Messenger or Instagram. This immediately deletes the stored access tokens and stops new messages from being received. Your existing conversation history stays in your workspace until you request deletion (Method 3).'
      ];

  return (
    <>
      <PageHero
        badge={isAr ? 'حذف بيانات المستخدم وبيانات Meta' : 'META & USER DATA DELETION'}
        titleMain={isAr ? 'تعليمات وطلب' : 'User Data'}
        titleGradient={isAr ? 'حذف البيانات' : 'Deletion'}
        subtitle={
          isAr
            ? 'كيفية إزالة صلاحيات تطبيق UpKlick من Meta وحذف بيانات حسابك بالكامل'
            : 'How to disconnect Meta permissions and permanently delete your UpKlick account and associated data'
        }
        isAr={isAr}
      />

      {confirmationCode ? (
        <div
          style={{
            background: 'rgba(0, 217, 139, 0.1)',
            border: '1px solid rgba(0, 217, 139, 0.35)',
            borderRadius: 20,
            padding: '22px 26px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
            boxShadow: '0 14px 40px rgba(0, 0, 0, 0.4)'
          }}
        >
          <CheckCircle2 size={24} style={{ color: '#00d98b', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#ffffff', marginBottom: 4 }}>
              {isAr
                ? 'تم تسجيل طلب حذف البيانات بنجاح'
                : 'Data Deletion Request Recorded & Confirmed'}
            </div>
            <div style={{ color: 'var(--t2)', fontSize: 14 }}>
              {isAr
                ? 'تم استلام طلب حذف البيانات الخاص بك وإرسال رسالة تأكيد إلى بريدك الإلكتروني. رقم الطلب (Request ID) الخاص بك هو:'
                : 'Your data deletion request has been received and a confirmation email has been sent. Your Request ID is:'}
            </div>
            <div
              style={{
                marginTop: 10,
                display: 'inline-block',
                background: 'var(--s2)',
                border: '1px solid rgba(0, 217, 139, 0.4)',
                borderRadius: 10,
                padding: '6px 14px',
                fontFamily: 'monospace',
                fontWeight: 800,
                fontSize: 14,
                color: '#00d98b'
              }}
            >
              {confirmationCode}
            </div>
          </div>
        </div>
      ) : null}

      <CardSection
        num="01"
        title={
          isAr
            ? 'الطريقة 1: إزالة تطبيق UpKlick وبياناته مباشرةً من إعدادات فيسبوك (Meta)'
            : 'Method 1: Remove UpKlick via Your Facebook / Meta Account Settings'
        }
      >
        <p style={{ marginTop: 0, marginBottom: 14 }}>
          {isAr
            ? 'وفقاً لمتطلبات منصة Meta، يمكنك إلغاء صلاحيات وصول UpKlick من حسابك على فيسبوك في أي وقت باتباع الخطوات التالية:'
            : 'In accordance with Meta Platform rules, you can revoke UpKlick permissions directly from your Facebook account:'}
        </p>
        <div>
          {fbSteps.map((stepText, idx) => (
            <div key={idx} className="uk-step-box">
              <span className="uk-step-num" style={{ width: 24, height: 24, fontSize: 11 }}>
                {idx + 1}
              </span>
              <div style={{ color: 'var(--t1)', fontSize: 14 }}>{stepText}</div>
            </div>
          ))}
        </div>
      </CardSection>

      <CardSection
        num="02"
        title={
          isAr
            ? 'الطريقة 2: فصل الحسابات أو حذف البيانات من داخل لوحة تحكم UpKlick'
            : 'Method 2: Disconnect or Delete Data Inside Your UpKlick Dashboard'
        }
      >
        <div>
          {dashSteps.map((stepText, idx) => (
            <div key={idx} className="uk-step-box">
              <span className="uk-step-num" style={{ width: 24, height: 24, fontSize: 11 }}>
                {idx + 1}
              </span>
              <div style={{ color: 'var(--t1)', fontSize: 14 }}>{stepText}</div>
            </div>
          ))}
        </div>
      </CardSection>

      <CardSection
        num="03"
        title={
          isAr
            ? 'الطريقة 3: إرسال طلب مباشر لحذف البيانات'
            : 'Method 3: Submit a Direct Data Deletion Request'
        }
      >
        <p style={{ marginTop: 0 }}>
          {isAr
            ? 'أرسل طلب حذف البيانات باستخدام النموذج أدناه. سنقوم بالتأكيد عبر البريد الإلكتروني وإتمام عملية الحذف خلال 30 يوماً (وعادةً خلال 72 ساعة).'
            : 'Submit a deletion request using the form below. We will confirm by email and complete the deletion within 30 days (usually within 72 hours).'}
        </p>

        {submitError ? (
          <div
            style={{
              background: 'rgba(255, 77, 79, 0.12)',
              border: '1px solid rgba(255, 77, 79, 0.45)',
              borderRadius: 14,
              padding: '14px 18px',
              marginBottom: 16,
              color: '#ffb3b3',
              fontSize: 13.5,
              fontWeight: 600
            }}
          >
            {submitError}
          </div>
        ) : null}

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--t1)' }}>
              {isAr ? 'البريد الإلكتروني المرتبط بالحساب *' : 'Account Email Address *'}
            </label>
            <input
              type="email"
              required
              value={deleteEmail}
              onChange={(e) => setDeleteEmail(e.target.value)}
              placeholder="you@example.com"
              className="uk-inp"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--t1)' }}>
              {isAr ? 'نطاق البيانات المطلوب حذفها *' : 'Deletion Scope *'}
            </label>
            <select
              required
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              className="uk-inp"
            >
              <option value="meta_only">
                {isAr
                  ? 'حذف بيانات وصلاحيات تكامل Meta فقط (Facebook / Instagram / WhatsApp)'
                  : 'Delete Meta integration data & tokens only (Facebook / Instagram / WhatsApp)'}
              </option>
              <option value="all_data">
                {isAr
                  ? 'حذف حساب UpKlick وجميع البيانات المرتبطة نهائياً'
                  : 'Permanently delete entire UpKlick account and all associated data'}
              </option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--t1)' }}>
              {isAr ? 'تفاصيل إضافية (اختياري)' : 'Details (Optional)'}
            </label>
            <textarea
              rows={3}
              value={deleteNotes}
              onChange={(e) => setDeleteNotes(e.target.value)}
              placeholder={
                isAr
                  ? 'أضف أي تفاصيل إضافية تساعدنا في تنفيذ طلبك...'
                  : 'Optional: Include your Meta User ID, Page/Instagram handle, or workspace details...'
              }
              className="uk-inp"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="uk-btn uk-btn-prime"
              style={{ padding: '12px 26px', fontSize: 14 }}
            >
              <Trash2 size={16} />
              <span>
                {submitting
                  ? isAr
                    ? 'جاري إرسال الطلب...'
                    : 'Submitting Request...'
                  : isAr
                    ? 'تأكيد وإرسال طلب حذف البيانات'
                    : 'Submit Data Deletion Request'}
              </span>
            </button>
          </div>
        </form>

        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid var(--edge)',
            fontSize: 13.5,
            color: 'var(--t2)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap'
          }}
        >
          <Mail size={15} style={{ color: 'var(--or)' }} />
          <span>
            {isAr ? 'أو راسل فريق الخصوصية مباشرة عبر:' : 'Or email our privacy team directly at:'}{' '}
            <a href="mailto:upklickofficial@gmail.com">
              upklickofficial@gmail.com
            </a>
          </span>
        </div>
      </CardSection>
    </>
  );
}

function RefundPolicySection({ isAr }) {
  if (isAr) {
    return (
      <>
        <PageHero
          badge="سياسة الاسترجاع والإلغاء · REFUND & CANCELLATION POLICY"
          titleMain="سياسة الاسترجاع"
          titleGradient="والإلغاء"
          subtitle="سياسة الاسترداد وإلغاء الاشتراكات الخاصة بالخدمات الرقمية والاشتراكات السحابية على منصة UpKlick"
          isAr
        />

        <div
          style={{
            background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.16), rgba(108, 53, 255, 0.16))',
            border: '1px solid rgba(255, 107, 53, 0.45)',
            borderRadius: 20,
            padding: '22px 26px',
            marginBottom: 24
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 18, color: '#ffffff', marginBottom: 6 }}>
            بيان سياسة الاسترجاع الرسمي (Official Refund Policy Statement):
          </div>
          <div style={{ color: 'var(--t1)', fontSize: 15.5, fontWeight: 700 }}>
            لا يوجد استرداد نقدي للمبالغ المدفوعة بعد تفعيل الاشتراك الرقمي — &ldquo;There is no refund&rdquo;.
          </div>
        </div>

        <CardSection num="01" title="سياسة عدم الاسترداد (No Refund Policy — There is no refund)">
          <p style={{ marginTop: 0 }}>
            نظراً لأن <strong>UpKlick</strong> تقدم خدمات برمجية سحابية رقمية فورية (SaaS)، وأدوات ذكاء اصطناعي، وأرصدة رسائل وتسويق إلكتروني يتم تفعيلها وإتاحتها للمشترك فور إتمام عملية الدفع، فإن السياسة المعتمدة للمنصة هي: <strong>لا يوجد استرداد (There is no refund)</strong> لأي رسوم اشتراك شهري أو سنوي أو أرصدة إضافية بعد إتمام الدفع وتفعيل الخدمة.
          </p>
          <ul>
            <li><strong>There is no refund:</strong> جميع المدفوعات النهائية غير قابلة للاسترداد النقدي الكلي أو الجزئي بمجرد تفعيل الحساب أو الباقة.</li>
            <li>ننصح جميع المستخدمين بالاستفادة من الباقة التجريبية أو مراجعة تفاصيل ومميزات كل باقة (Starter بـ 299 ج.م، Growth بـ 499 ج.م، Pro بـ 799 ج.م) قبل إتمام عملية الدفع عبر صفحة الدفع (<a href="/checkout">/checkout</a>).</li>
          </ul>
        </CardSection>

        <CardSection num="02" title="سياسة إلغاء الاشتراك (Cancellation Policy)">
          <ul>
            <li><strong>حرية الإلغاء في أي وقت:</strong> يحق للمشترك إلغاء التجديد التلقائي لاشتراكه في أي وقت من خلال لوحة التحكم (إعدادات الفوترة والاشتراك) أو بالتواصل مع فريق الدعم قبل موعد التجديد القادم.</li>
            <li><strong>استمرار الخدمة حتى نهاية الفترة المدفوعة:</strong> عند طلب إلغاء الاشتراك، سيظل حسابك نشطاً وتتمتع بكامل صلاحيات الباقة حتى نهاية دورة الفوترة الحالية المدفوعة بالكامل، ولن يتم خصم أي مبالغ مستقبلية.</li>
            <li><strong>شراء النطاقات (Custom Domains):</strong> رسوم حجز النطاقات الخاصة غير قابلة للإلغاء أو الاسترداد بعد تسجيل النطاق رسمياً باسم العميل لدى مسجل النطاقات الدولي.</li>
          </ul>
        </CardSection>

        <CardSection num="03" title="الأخطاء التقنية أو الخصم المكرر">
          <p style={{ margin: 0 }}>
            في حالة حدوث خطأ تقني ناتج عن بوابة الدفع أدى إلى خصم نفس قيمة الاشتراك مرتين عن طريق الخطأ (Duplicate Charge)، يرجى التواصل مع خدمة العملاء خلال 48 ساعة من العملية مرفقاً بإيصال المعاملة لمراجعتها ومعالجة العملية المكررة.
          </p>
        </CardSection>

        <CardSection num="04" title="التواصل مع قسم الفوترة والدعم (Contact Us)">
          <p style={{ marginTop: 0 }}>
            لأي استفسار يخص الفوترة أو طلبات إلغاء التجديد التلقائي، تواصل معنا عبر البيانات الرسمية التالية داخل جمهورية مصر العربية:
          </p>
          <ul>
            <li><strong>رقم الموبايل داخل مصر:</strong> <a href={UPKLICK_CONTACT_INFO.phoneHref} dir="ltr">{UPKLICK_CONTACT_INFO.phoneDisplay}</a> ({UPKLICK_CONTACT_INFO.phoneLocal})</li>
            <li><strong>البريد الإلكتروني:</strong> <a href={`mailto:${UPKLICK_CONTACT_INFO.emailPrimary}`}>{UPKLICK_CONTACT_INFO.emailPrimary}</a></li>
            <li><strong>العنوان:</strong> {UPKLICK_CONTACT_INFO.addressAr}</li>
          </ul>
        </CardSection>
      </>
    );
  }

  return (
    <>
      <PageHero
        badge="REFUND & CANCELLATION POLICY"
        titleMain="Refund &"
        titleGradient="Cancellation Policy"
        subtitle="Official refund and subscription cancellation terms for UpKlick digital SaaS plans and services"
        isAr={false}
      />

      <div
        style={{
          background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.16), rgba(108, 53, 255, 0.16))',
          border: '1px solid rgba(255, 107, 53, 0.45)',
          borderRadius: 20,
          padding: '22px 26px',
          marginBottom: 24
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 18, color: '#ffffff', marginBottom: 6 }}>
          Official Refund Policy Statement:
        </div>
        <div style={{ color: 'var(--t1)', fontSize: 16, fontWeight: 800 }}>
          There is no refund. All digital subscription fees and digital service purchases are final and non-refundable once activated.
        </div>
      </div>

      <CardSection num="01" title="Refund Policy — There is no refund">
        <p style={{ marginTop: 0 }}>
          <strong>There is no refund.</strong> Because <strong>UpKlick</strong> provides instant-access digital cloud software (SaaS), AI automation tools, funnel/store builders, and digital credits that are provisioned immediately upon payment confirmation, all sales are final and <strong>there is no refund</strong> (neither full nor partial) once a subscription or digital plan is activated.
        </p>
        <ul>
          <li><strong>No Refunds on Subscriptions:</strong> Monthly and annual subscription plans (Starter Plan at 299 EGP, Growth Plan at 499 EGP, Pro Plan at 799 EGP) are non-refundable after payment processing.</li>
          <li><strong>No Refunds on Digital Add-ons & Domains:</strong> AI credits, messaging credits, and custom domain registrations cannot be refunded once provisioned.</li>
        </ul>
      </CardSection>

      <CardSection num="02" title="Subscription Cancellation Policy">
        <ul>
          <li><strong>Cancel Anytime:</strong> You may cancel your recurring subscription renewal at any time directly from your UpKlick Dashboard under Billing Settings or by contacting our support team prior to your next billing date.</li>
          <li><strong>Access Until End of Billing Cycle:</strong> Upon cancellation, your account will remain active with full access to your paid plan features until the end of your current paid billing period, and no further recurring charges will be made.</li>
        </ul>
      </CardSection>

      <CardSection num="03" title="Duplicate Charges & Billing Support">
        <p style={{ margin: 0 }}>
          In the event of an accidental duplicate transaction caused by a technical payment gateway error, please contact our support team within 48 hours with your transaction reference so we can verify and resolve the duplicate charge.
        </p>
      </CardSection>

      <CardSection num="04" title="Contact Us (Billing & Customer Support)">
        <p style={{ marginTop: 0 }}>
          For any billing questions or cancellation assistance, please reach out to us via our official Egypt contact channels:
        </p>
        <ul>
          <li><strong>Mobile No. inside Egypt:</strong> <a href={UPKLICK_CONTACT_INFO.phoneHref}>{UPKLICK_CONTACT_INFO.phoneDisplay}</a> ({UPKLICK_CONTACT_INFO.phoneLocal})</li>
          <li><strong>Email Address:</strong> <a href={`mailto:${UPKLICK_CONTACT_INFO.emailPrimary}`}>{UPKLICK_CONTACT_INFO.emailPrimary}</a></li>
          <li><strong>Physical Address:</strong> {UPKLICK_CONTACT_INFO.addressEn}</li>
        </ul>
      </CardSection>
    </>
  );
}

function ShippingPolicySection({ isAr }) {
  if (isAr) {
    return (
      <>
        <PageHero
          badge="سياسة الشحن والتسليم · SHIPPING & DELIVERY POLICY"
          titleMain="سياسة الشحن"
          titleGradient="والتسليم"
          subtitle="توضيح طبيعة التسليم الرقمي الفوري لخدمات واشتراكات منصة UpKlick السحابية"
          isAr
        />

        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0, 217, 139, 0.14), rgba(108, 53, 255, 0.16))',
            border: '1px solid rgba(0, 217, 139, 0.45)',
            borderRadius: 20,
            padding: '22px 26px',
            marginBottom: 24
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 18, color: '#ffffff', marginBottom: 6 }}>
            بيان سياسة الشحن الرسمي (Official Shipping Policy Statement):
          </div>
          <div style={{ color: 'var(--t1)', fontSize: 15.5, fontWeight: 700 }}>
            لا يوجد شحن مادي للمنتجات — &ldquo;There is no shipping&rdquo; (جميع خدماتنا ومنتجاتنا رقمية سحابية 100% يتم تفعيلها وتسليمها إلكترونياً بشكل فوري).
          </div>
        </div>

        <CardSection num="01" title="سياسة الشحن (Shipping Policy — There is no shipping)">
          <p style={{ marginTop: 0 }}>
            <strong>There is no shipping (لا يوجد شحن مادي).</strong> منصة <strong>UpKlick</strong> هي منصة برمجيات سحابية كخدمة (Cloud SaaS Platform) تقدم أدوات رقمية لرواد الأعمال والشركات (بناء المواقع والفانلز والمتاجر، إدارة علاقات العملاء CRM، أدوات الذكاء الاصطناعي، وأدوات التسويق الرقمي). نحن لا نبيع أو نشحن أي سلع مادية ملموسة، وبالتالي <strong>لا يوجد شحن (There is no shipping)</strong> ولا توجد أي رسوم شحن أو شركات توصيل.
          </p>
        </CardSection>

        <CardSection num="02" title="آلية التسليم الرقمي الفوري (Instant Digital Delivery)">
          <ul>
            <li><strong>التفعيل الفوري (Instant Activation):</strong> فور إتمام عملية الدفع الإلكتروني بنجاح عبر بوابة الدفع (Paymob / البطاقات البنكية / المحافظ الإلكترونية)، يتم تفعيل الباقة المشترك بها (Starter / Growth / Pro) تلقائياً وفوراً على حساب العميل في نفس اللحظة.</li>
            <li><strong>إشعار التأكيد:</strong> يتلقى العميل رسالة تأكيد إلكترونية على البريد الإلكتروني المسجل تتضمن تفاصيل الباقة المفعلة وإيصال الدفع الرقمي.</li>
            <li><strong>كيفية الوصول للخدمة:</strong> يمكن للعميل الدخول مباشرة إلى لوحة التحكم عبر الرابط <a href="/dashboard">https://www.upklick.net/dashboard</a> واستخدام كافة الأدوات والميزات المشمولة في باقته على مدار الساعة.</li>
          </ul>
        </CardSection>

        <CardSection num="03" title="التأخر في التفعيل والدعم الفني (Contact Us)">
          <p style={{ marginTop: 0 }}>
            في حال واجهت أي تأخر غير معتاد في ظهور تفعيل الباقة بعد الدفع، يرجى التواصل الفوري مع فريق الدعم الفني لدينا لتفعيلها فوراً:
          </p>
          <ul>
            <li><strong>رقم الموبايل داخل مصر:</strong> <a href={UPKLICK_CONTACT_INFO.phoneHref} dir="ltr">{UPKLICK_CONTACT_INFO.phoneDisplay}</a> ({UPKLICK_CONTACT_INFO.phoneLocal})</li>
            <li><strong>البريد الإلكتروني:</strong> <a href={`mailto:${UPKLICK_CONTACT_INFO.emailPrimary}`}>{UPKLICK_CONTACT_INFO.emailPrimary}</a></li>
            <li><strong>العنوان:</strong> {UPKLICK_CONTACT_INFO.addressAr}</li>
          </ul>
        </CardSection>
      </>
    );
  }

  return (
    <>
      <PageHero
        badge="SHIPPING & DELIVERY POLICY"
        titleMain="Shipping &"
        titleGradient="Delivery Policy"
        subtitle="Official delivery and fulfillment policy for UpKlick cloud software subscriptions and digital services"
        isAr={false}
      />

      <div
        style={{
          background: 'linear-gradient(135deg, rgba(0, 217, 139, 0.14), rgba(108, 53, 255, 0.16))',
          border: '1px solid rgba(0, 217, 139, 0.45)',
          borderRadius: 20,
          padding: '22px 26px',
          marginBottom: 24
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 18, color: '#ffffff', marginBottom: 6 }}>
          Official Shipping Policy Statement:
        </div>
        <div style={{ color: 'var(--t1)', fontSize: 16, fontWeight: 800 }}>
          There is no shipping. UpKlick is a 100% digital cloud SaaS platform with instant online service delivery.
        </div>
      </div>

      <CardSection num="01" title="Shipping Policy — There is no shipping">
        <p style={{ marginTop: 0 }}>
          <strong>There is no shipping.</strong> <strong>UpKlick</strong> provides cloud-based software-as-a-service (SaaS) subscriptions, AI business tools, website/funnel builders, CRM software, and digital marketing tools. We do not sell or ship physical goods of any kind. Accordingly, <strong>there is no shipping</strong>, no physical courier dispatch, and zero shipping fees.
        </p>
      </CardSection>

      <CardSection num="02" title="Digital Service Delivery & Provisioning Timeframe">
        <ul>
          <li><strong>Instant Online Delivery:</strong> All subscription plans (Starter Plan, Growth Plan, and Pro Plan) and digital features are delivered electronically and activated <strong>immediately</strong> upon successful payment confirmation.</li>
          <li><strong>Confirmation Receipt:</strong> Once your payment is processed on our <a href="/checkout">Checkout Page (/checkout)</a>, your account permissions are upgraded automatically and a confirmation email is sent to your registered email address.</li>
          <li><strong>24/7 Cloud Access:</strong> You can access your activated software tools immediately by signing into your dashboard at <a href="/dashboard">https://www.upklick.net/dashboard</a>.</li>
        </ul>
      </CardSection>

      <CardSection num="03" title="Contact Us for Delivery or Activation Support">
        <p style={{ marginTop: 0 }}>
          If your digital subscription does not appear active within a few minutes of payment, please contact our support team immediately:
        </p>
        <ul>
          <li><strong>Mobile No. inside Egypt:</strong> <a href={UPKLICK_CONTACT_INFO.phoneHref}>{UPKLICK_CONTACT_INFO.phoneDisplay}</a> ({UPKLICK_CONTACT_INFO.phoneLocal})</li>
          <li><strong>Email Address:</strong> <a href={`mailto:${UPKLICK_CONTACT_INFO.emailPrimary}`}>{UPKLICK_CONTACT_INFO.emailPrimary}</a></li>
          <li><strong>Physical Address:</strong> {UPKLICK_CONTACT_INFO.addressEn}</li>
        </ul>
      </CardSection>
    </>
  );
}

function ContactUsSection({ isAr }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <PageHero
        badge={isAr ? 'تواصل معنا · خدمة العملاء والدعم الفني' : 'CONTACT US · CUSTOMER SUPPORT'}
        titleMain={isAr ? 'تواصل' : 'Contact'}
        titleGradient={isAr ? 'معنا' : 'Us'}
        subtitle={
          isAr
            ? 'بيانات التواصل الرسمية لمنصة UpKlick داخل جمهورية مصر العربية (رقم الهاتف، البريد الإلكتروني، والعنوان)'
            : 'Official contact details for UpKlick in the Arab Republic of Egypt (Mobile Number, Email Address, and Physical Address)'
        }
        isAr={isAr}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: 18,
          marginBottom: 24
        }}
      >
        <div className="uk-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span className="uk-step-num" style={{ width: 36, height: 36 }}>
              <Phone size={18} />
            </span>
            <div>
              <div style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 700 }}>
                {isAr ? 'رقم الهاتف داخل مصر (Mobile No. in Egypt)' : 'Mobile No. inside Egypt'}
              </div>
              <a
                href={UPKLICK_CONTACT_INFO.phoneHref}
                dir="ltr"
                style={{ fontSize: 18, fontWeight: 800, color: '#fff', textDecoration: 'none' }}
              >
                {UPKLICK_CONTACT_INFO.phoneDisplay}
              </a>
            </div>
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--t2)' }}>
            {isAr
              ? `الرقم المحلي داخل مصر: ${UPKLICK_CONTACT_INFO.phoneLocal} (متاح اتصال وواتساب)`
              : `Local Egypt Mobile: ${UPKLICK_CONTACT_INFO.phoneLocal} (Voice & WhatsApp Support)`}
          </div>
        </div>

        <div className="uk-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span className="uk-step-num" style={{ width: 36, height: 36 }}>
              <Mail size={18} />
            </span>
            <div>
              <div style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 700 }}>
                {isAr ? 'البريد الإلكتروني الرسمي (Email Address)' : 'Official Email Address'}
              </div>
              <a
                href={`mailto:${UPKLICK_CONTACT_INFO.emailPrimary}`}
                style={{ fontSize: 16.5, fontWeight: 800, color: '#fff', textDecoration: 'none' }}
              >
                {UPKLICK_CONTACT_INFO.emailPrimary}
              </a>
            </div>
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--t2)' }}>
            {isAr ? 'متاح لاستقبال جميع استفسارات العملاء والدعم الفني' : 'Official customer & technical support email'}
          </div>
        </div>

        <div className="uk-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span className="uk-step-num" style={{ width: 36, height: 36 }}>
              <MapPin size={18} />
            </span>
            <div>
              <div style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 700 }}>
                {isAr ? 'العنوان الفعلي (Physical Address - Egypt)' : 'Physical Address (Egypt)'}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>
                {isAr ? UPKLICK_CONTACT_INFO.addressAr : UPKLICK_CONTACT_INFO.addressEn}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--t2)' }}>
            {isAr ? UPKLICK_CONTACT_INFO.hoursAr : UPKLICK_CONTACT_INFO.hoursEn}
          </div>
        </div>
      </div>

      <CardSection
        num="01"
        title={isAr ? 'أرسل لنا رسالة مباشرة' : 'Send Us a Direct Message'}
      >
        {sent ? (
          <div
            style={{
              background: 'rgba(0, 217, 139, 0.12)',
              border: '1px solid rgba(0, 217, 139, 0.4)',
              borderRadius: 14,
              padding: '18px 22px',
              color: '#fff'
            }}
          >
            <strong style={{ color: '#00d98b', display: 'block', marginBottom: 4 }}>
              {isAr ? 'تم إرسال رسالتك بنجاح!' : 'Your message has been received!'}
            </strong>
            <span>
              {isAr
                ? `سيتواصل معك فريق دعم UpKlick قريباً عبر البريد الإلكتروني أو الهاتف (${UPKLICK_CONTACT_INFO.phoneDisplay}).`
                : `Our support team will get back to you shortly via email or phone (${UPKLICK_CONTACT_INFO.phoneDisplay}).`}
            </span>
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--t1)' }}>
                  {isAr ? 'الاسم بالكامل *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isAr ? 'أدخل اسمك بالكامل' : 'Enter your full name'}
                  className="uk-inp"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--t1)' }}>
                  {isAr ? 'البريد الإلكتروني *' : 'Email Address *'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="uk-inp"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--t1)' }}>
                  {isAr ? 'رقم الموبايل (مصر) *' : 'Mobile Number (Egypt) *'}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010XXXXXXXX"
                  className="uk-inp"
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6, color: 'var(--t1)' }}>
                {isAr ? 'رسالتك أو استفسارك *' : 'Your Message or Inquiry *'}
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={isAr ? 'اكتب تفاصيل استفسارك هنا...' : 'How can we help you?'}
                className="uk-inp"
                style={{ resize: 'vertical' }}
              />
            </div>
            <div>
              <button type="submit" className="uk-btn uk-btn-prime" style={{ padding: '12px 26px', fontSize: 14 }}>
                <Mail size={16} />
                <span>{isAr ? 'إرسال الرسالة' : 'Send Message'}</span>
              </button>
            </div>
          </form>
        )}
      </CardSection>

      <CardSection
        num="02"
        title={isAr ? 'روابط السياسات المعتمدة والدفع' : 'Official Policies & Checkout Links'}
      >
        <ul>
          <li><a href="/privacy-policy">{isAr ? 'سياسة الخصوصية (Privacy Policy)' : 'Privacy Policy'}</a></li>
          <li><a href="/refund-policy">{isAr ? 'سياسة الاسترجاع والإلغاء (Refund Policy — There is no refund)' : 'Refund & Cancellation Policy (There is no refund)'}</a></li>
          <li><a href="/shipping-policy">{isAr ? 'سياسة الشحن والتسليم (Shipping Policy — There is no shipping)' : 'Shipping & Delivery Policy (There is no shipping)'}</a></li>
          <li><a href="/terms-of-service">{isAr ? 'شروط الخدمة (Terms of Service)' : 'Terms of Service'}</a></li>
          <li><a href="/checkout">{isAr ? 'صفحة الدفع والاشتراك (Checkout Page)' : 'Checkout & Subscription Page (/checkout)'}</a></li>
        </ul>
      </CardSection>
    </>
  );
}
