'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Tracking } from '@/lib/tracking';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, userData, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tenantConfig, setTenantConfig] = useState(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isRTL = typeof window !== 'undefined' ? (document.documentElement.dir === 'rtl') : true;
  const [theme, setTheme] = useState('dark');

  const hasFiredCtaRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('upklick_theme');
      if (savedTheme) setTheme(savedTheme);
      try { Tracking.page('/login'); } catch (e) { }

      if (hasFiredCtaRef.current) return;

      const search = window.location.search;
      if (search.includes('cta=start_free') || search.includes('cta=signup')) {
        hasFiredCtaRef.current = true;
        if (typeof window.fbq === 'function') {
          window.fbq('trackCustom', 'SignUpClick', { source: 'landing_page' });
        }
      } else if (search.includes('cta=login_click') || search.includes('cta=login')) {
        hasFiredCtaRef.current = true;
        if (typeof window.fbq === 'function') {
          window.fbq('trackCustom', 'LoginClick', { source: 'register_page_or_landing' });
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentHost = window.location.hostname;

    // Fetch tenant by domain match
    const q = query(collection(db, 'tenants'), where('domain', '==', currentHost));
    getDocs(q).then((snap) => {
      if (!snap.empty) {
        setTenantConfig(snap.docs[0].data());
      }
    }).catch(err => console.error("Error fetching login tenant:", err));
  }, []);

  useEffect(() => {
    if (tenantConfig?.appName) {
      document.title = isForgotPassword
        ? `${tenantConfig.appName} - استعادة كلمة المرور`
        : `${tenantConfig.appName} - تسجيل الدخول`;
    }
  }, [tenantConfig, isForgotPassword]);

  useEffect(() => {
    if (!authLoading && user && userData) {
      if (userData.role === 'admin' || userData.role === 'super_admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, userData, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      Tracking.custom('LoginAttempt', { email });
      await login(email, password);
      Tracking.track('Login', { email });
    } catch (err) {
      console.error(err);
      Tracking.custom('LoginFailed', { error: err.message });
      setError('فشل تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور.');
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.error || data.warning || 'فشل إرسال رمز إعادة التعيين');
      }

      setResetEmailSent(true);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'فشل إرسال البريد الإلكتروني. يرجى التأكد من كتابة البريد بشكل صحيح.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetWithCodeSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!resetCode || resetCode.trim().length !== 6) {
      setError('يرجى إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password-with-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code: resetCode,
          newPassword
        })
      });

      const data = await res.json();

      if (!res.ok || data.success === false) {
        throw new Error(data.error || data.warning || 'فشل تغيير كلمة المرور');
      }

      setResetSuccess(true);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء تغيير كلمة المرور.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...styles.container, ...(tenantConfig?.bgColor ? { backgroundColor: tenantConfig.bgColor } : {}) }}>
      <div style={{ ...styles.card, ...(tenantConfig?.panelColor ? { backgroundColor: tenantConfig.panelColor } : {}) }}>
        {(() => {
          const isDefaultLogo = !tenantConfig?.logoUrl;
          return isDefaultLogo ? (
            <div style={{
              height: '80px',
              width: '180px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <img
                src={tenantConfig?.logoUrl || (theme === 'light' ? "/best_logo_light.png" : "/best_logo_dark.png")}
                alt={tenantConfig?.appName || "UpKlick"}
                style={{
                  height: '240px',
                  objectFit: 'contain',
                  marginTop: '-10px'
                }}
              />
            </div>
          ) : (
            <img
              src={tenantConfig?.logoUrl || (theme === 'light' ? "/best_logo_light.png" : "/best_logo_dark.png")}
              alt={tenantConfig?.appName || "UpKlick"}
              style={styles.logo}
            />
          );
        })()}
        <h1 style={{ ...styles.title, ...(tenantConfig?.textColor ? { color: tenantConfig.textColor } : {}) }}>
          {isForgotPassword
            ? 'استعادة كلمة المرور'
            : tenantConfig?.appName ? `تسجيل الدخول - ${tenantConfig.appName}` : 'تسجيل الدخول'
          }
        </h1>
        <p style={{ ...styles.subtitle, ...(tenantConfig?.text2Color ? { color: tenantConfig.text2Color } : {}) }}>
          {isForgotPassword
            ? 'أدخل البريد ورمز التعيين لاختيار كلمة مرور جديدة.'
            : tenantConfig?.tagline || 'أدخل بياناتك للوصول إلى لوحة التحكم'
          }
        </p>

        {error && <div style={styles.error}>{error}</div>}

        {isForgotPassword ? (
          resetSuccess ? (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{
                color: '#00F0B4',
                backgroundColor: 'rgba(0, 240, 180, 0.1)',
                padding: '18px',
                borderRadius: '14px',
                fontSize: '14px',
                marginBottom: '24px',
                border: '1px solid rgba(0, 240, 180, 0.25)',
                lineHeight: '1.6'
              }}>
                🎉 تم تغيير كلمة المرور بنجاح!
                <br />
                يمكنك الآن تسجيل الدخول بحسابك باستخدام كلمة المرور الجديدة.
              </div>
              <button
                onClick={() => {
                  setIsForgotPassword(false);
                  setResetEmailSent(false);
                  setResetSuccess(false);
                  setResetCode('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                style={{
                  ...styles.button,
                  width: '100%',
                  background: 'linear-gradient(135deg, #FF6B35, #6C35FF)',
                  color: '#ffffff',
                  boxShadow: '0 4px 24px rgba(108, 53, 255, 0.35)'
                }}
              >
                التوجه لتسجيل الدخول 🚀
              </button>
            </div>
          ) : resetEmailSent ? (
            <form onSubmit={handleResetWithCodeSubmit} style={styles.form}>
              <div style={{
                backgroundColor: 'rgba(108, 53, 255, 0.1)',
                border: '1px solid rgba(108, 53, 255, 0.25)',
                padding: '12px 14px',
                borderRadius: '10px',
                color: '#a0aec0',
                fontSize: '12.5px',
                lineHeight: '1.5',
                marginBottom: '16px'
              }}>
                تم إرسال رمز مكون من 6 أرقام إلى <strong>{email}</strong>. أدخل الرمز أدناه مع كلمة المرور الجديدة:
              </div>

              <div style={styles.inputGroup}>
                <label style={{ ...styles.label, ...(tenantConfig?.textColor ? { color: tenantConfig.textColor } : {}) }}>رمز التحقق (6 أرقام)</label>
                <input
                  type="text"
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/[^0-9]/g, ''))}
                  style={{
                    ...styles.input,
                    letterSpacing: '8px',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontFamily: 'monospace'
                  }}
                  placeholder="123456"
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={{ ...styles.label, ...(tenantConfig?.textColor ? { color: tenantConfig.textColor } : {}) }}>كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={styles.input}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={{ ...styles.label, ...(tenantConfig?.textColor ? { color: tenantConfig.textColor } : {}) }}>تأكيد كلمة المرور الجديدة</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={styles.input}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.button,
                  ...(tenantConfig?.primaryColor && tenantConfig?.accentColor
                    ? { background: `linear-gradient(135deg, ${tenantConfig.primaryColor}, ${tenantConfig.accentColor})`, boxShadow: `0 4px 24px ${tenantConfig.primaryColor}4D` }
                    : {})
                }}
              >
                {loading ? 'جاري التحديث...' : 'حفظ كلمة المرور الجديدة 🔐'}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', fontSize: '13px' }}>
                <span
                  onClick={() => setResetEmailSent(false)}
                  style={{ color: '#9090b0', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  إعادة إرسال الرمز
                </span>
                <span
                  onClick={() => { setIsForgotPassword(false); setResetEmailSent(false); }}
                  style={{ color: '#9090b0', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  إلغاء والعودة
                </span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotPasswordSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={{ ...styles.label, ...(tenantConfig?.textColor ? { color: tenantConfig.textColor } : {}) }}>البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  placeholder="example@email.com"
                  required
                  dir="ltr"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.button,
                  ...(tenantConfig?.primaryColor && tenantConfig?.accentColor
                    ? { background: `linear-gradient(135deg, ${tenantConfig.primaryColor}, ${tenantConfig.accentColor})`, boxShadow: `0 4px 24px ${tenantConfig.primaryColor}4D` }
                    : {})
                }}
              >
                {loading ? 'جاري الإرسال...' : 'إرسال رمز إعادة التعيين 📩'}
              </button>
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <span
                  onClick={() => setIsForgotPassword(false)}
                  style={{ fontSize: '13px', color: '#9090b0', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  العودة لتسجيل الدخول
                </span>
              </div>
            </form>
          )
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={{ ...styles.label, ...(tenantConfig?.textColor ? { color: tenantConfig.textColor } : {}) }}>البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder="example@email.com"
                required
                dir="ltr"
              />
            </div>
            <div style={styles.inputGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ ...styles.label, marginBottom: 0, ...(tenantConfig?.textColor ? { color: tenantConfig.textColor } : {}) }}>كلمة المرور</label>
                <span
                  onClick={() => { setIsForgotPassword(true); setError(''); }}
                  style={{ fontSize: '12px', color: tenantConfig?.accentColor || '#6C35FF', cursor: 'pointer' }}
                >
                  نسيت كلمة المرور؟
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...styles.input, paddingLeft: isRTL ? '12px' : '40px', paddingRight: isRTL ? '40px' : '12px' }}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    [isRTL ? 'left' : 'right']: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9090b0',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                ...(tenantConfig?.primaryColor && tenantConfig?.accentColor
                  ? { background: `linear-gradient(135deg, ${tenantConfig.primaryColor}, ${tenantConfig.accentColor})`, boxShadow: `0 4px 24px ${tenantConfig.primaryColor}4D` }
                  : {})
              }}
            >
              {loading ? 'جاري تسجيل الدخول...' : (tenantConfig?.loginCtaText || 'تسجيل الدخول')}
            </button>
          </form>
        )}

        <div style={styles.footer}>
          <p style={{ ...styles.footerText, ...(tenantConfig?.text2Color ? { color: tenantConfig.text2Color } : {}) }}>
            {tenantConfig?.signupPromptText || 'ليس لديك حساب؟'}{' '}
            <a
              href="/register"
              onClick={(e) => {
                try { Tracking.custom('SignUpClick', { source: 'login_page_link' }); } catch (err) { }
              }}
              style={{
                ...styles.link,
                ...(tenantConfig?.accentColor ? { color: tenantConfig.accentColor } : {})
              }}
            >
              {tenantConfig?.signupCtaText || '🚀 إنشاء حساب جديد (تجربة مجانية)'}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg, #08080c)',
    padding: '20px',
    fontFamily: 'inherit'
  },
  card: {
    backgroundColor: 'var(--panel, #12121c)',
    borderRadius: '24px',
    padding: '40px',
    width: '100%',
    maxWidth: '440px',
    border: '1px solid var(--border, rgba(255, 255, 255, 0.08))',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  logo: {
    height: '48px',
    marginBottom: '24px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--text, #ffffff)',
    marginBottom: '8px',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text2, #9090b0)',
    marginBottom: '32px',
    textAlign: 'center'
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text, #ffffff)'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    backgroundColor: 'var(--bg3, #1a1a28)',
    border: '1px solid var(--border, rgba(255, 255, 255, 0.1))',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #FF6B35, #6C35FF)',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
    boxShadow: '0 4px 24px rgba(108, 53, 255, 0.35)',
    transition: 'transform 0.2s, opacity 0.2s'
  },
  error: {
    backgroundColor: 'rgba(255, 77, 77, 0.1)',
    border: '1px solid rgba(255, 77, 77, 0.2)',
    color: '#ff4d4d',
    padding: '12px',
    borderRadius: '12px',
    fontSize: '13px',
    width: '100%',
    textAlign: 'center',
    marginBottom: '20px',
    boxSizing: 'border-box'
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center'
  },
  footerText: {
    fontSize: '14px',
    color: 'var(--text2, #9090b0)'
  },
  link: {
    color: '#6C35FF',
    textDecoration: 'none',
    fontWeight: '600'
  }
};
