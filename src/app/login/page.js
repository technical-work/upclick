'use client';

import React, { useState, useEffect } from 'react';
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
  const { login, resetPassword, user, userData, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tenantConfig, setTenantConfig] = useState(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isRTL = typeof window !== 'undefined' ? (document.documentElement.dir === 'rtl') : true;
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('upklick_theme');
      if (savedTheme) setTheme(savedTheme);
      try { Tracking.page('/login'); } catch (e) {}
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
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'Contact', { content_name: 'Login Submission', email });
      }
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
      await resetPassword(email);
      setResetEmailSent(true);
      setError('');
    } catch (err) {
      console.error(err);
      setError('فشل إرسال البريد الإلكتروني. يرجى التأكد من كتابة البريد بشكل صحيح.');
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
            ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.'
            : tenantConfig?.tagline || 'أدخل بياناتك للوصول إلى لوحة التحكم'
          }
        </p>

        {error && <div style={styles.error}>{error}</div>}

        {isForgotPassword ? (
          resetEmailSent ? (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <div style={{
                color: '#00F0B4',
                backgroundColor: 'rgba(0, 240, 180, 0.1)',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '13.5px',
                marginBottom: '24px',
                border: '1px solid rgba(0, 240, 180, 0.2)',
                lineHeight: '1.5'
              }}>
                تم إرسال بريد إعادة تعيين كلمة المرور بنجاح! 
                <br />
                يرجى التحقق من صندوق البريد الخاص بك (Gmail).
              </div>
              <button 
                onClick={() => { setIsForgotPassword(false); setResetEmailSent(false); }}
                style={{
                  ...styles.button,
                  width: '100%',
                  background: 'var(--bg3, #101018)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text2, #9090b0)',
                  boxShadow: 'none'
                }}
              >
                العودة لتسجيل الدخول
              </button>
            </div>
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
                {loading ? 'جاري الإرسال...' : 'إرسال رابط استعادة كلمة المرور'}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ ...styles.label, ...(tenantConfig?.textColor ? { color: tenantConfig.textColor } : {}) }}>كلمة المرور</label>
                <span 
                  onClick={() => { setIsForgotPassword(true); setError(''); setResetEmailSent(false); }}
                  style={{ fontSize: '12px', color: tenantConfig?.primaryColor || '#FF6B35', cursor: 'pointer', fontWeight: '500' }}
                >
                  هل نسيت كلمة المرور؟
                </span>
              </div>
              <div style={{ position: 'relative', width: '100%' }}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...styles.input, width: '100%', paddingLeft: isRTL ? '40px' : '16px', paddingRight: isRTL ? '16px' : '40px' }}
                  placeholder="••••••••"
                  required 
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    [isRTL ? 'left' : 'right']: '12px',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text2, #9090b0)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                    outline: 'none',
                    zIndex: 2
                  }}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
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
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>
        )}

        {tenantConfig?.freeTrial?.enabled && (
          <div style={styles.registerContainer}>
            <div style={{
              width: '100%',
              height: '1px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              margin: '22px 0'
            }} />
            <span style={{
              display: 'block',
              fontSize: '12.5px',
              color: '#9090b0',
              marginBottom: '12px'
            }}>
              ليس لديك حساب؟
            </span>
            <a 
              href="/register" 
              onClick={() => {
                if (typeof window !== 'undefined') {
                  if (typeof window.fbq === 'function') {
                    window.fbq('track', 'Lead', { content_name: 'إنشاء حساب جديد (تجربة مجانية)' });
                    window.fbq('track', 'InitiateCheckout', { content_name: 'Free Trial Signup Click' });
                    window.fbq('trackCustom', 'SignUpClick', { button_text: 'إنشاء حساب جديد (تجربة مجانية)' });
                  }
                  Tracking.lead({ source: 'login_page_signup_button' });
                }
              }}
              style={{ 
                ...styles.registerButton, 
                ...(tenantConfig?.primaryColor 
                  ? { 
                      borderColor: `${tenantConfig.primaryColor}50`, 
                      background: `${tenantConfig.primaryColor}0d`,
                      color: tenantConfig.textColor || '#f8f4ff' 
                    } 
                  : {}) 
              }}
            >
              🚀 إنشاء حساب جديد (تجربة مجانية)
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#08080f',
    fontFamily: '"IBM Plex Sans Arabic", "DM Sans", sans-serif',
    direction: 'rtl',
    zIndex: 9999,
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#181825',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  logo: {
    height: '48px',
    width: 'auto',
    maxWidth: '180px',
    objectFit: 'contain',
    marginBottom: '24px',
  },
  title: {
    color: '#f8f4ff',
    fontSize: '22px',
    fontWeight: '700',
    marginBottom: '8px'
  },
  subtitle: {
    color: '#9090b0',
    fontSize: '14px',
    marginBottom: '30px'
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
    gap: '8px',
    width: '100%'
  },
  label: {
    color: '#f8f4ff',
    fontSize: '13px',
    fontWeight: '500'
  },
  input: {
    padding: '12px 16px',
    borderRadius: '10px',
    backgroundColor: '#101018',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#f8f4ff',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  button: {
    marginTop: '10px',
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #FF6B35, #6C35FF)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 24px rgba(255,107,53,0.3)'
  },
  error: {
    color: '#ff5f57',
    backgroundColor: 'rgba(255, 95, 87, 0.1)',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '20px',
    width: '100%',
    textAlign: 'center',
    border: '1px solid rgba(255, 95, 87, 0.2)'
  },
  registerContainer: {
    marginTop: '10px',
    textAlign: 'center',
    width: '100%'
  },
  registerButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    border: '1.5px solid rgba(255, 107, 53, 0.4)',
    background: 'rgba(255, 107, 53, 0.04)',
    color: '#f8f4ff',
    fontSize: '14px',
    fontWeight: '700',
    textDecoration: 'none',
    transition: 'all 0.2s',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(255,107,53,0.05)'
  }
};
