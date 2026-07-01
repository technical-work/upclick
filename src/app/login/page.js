'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, userData, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tenantConfig, setTenantConfig] = useState(null);

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
      document.title = `${tenantConfig.appName} - تسجيل الدخول`;
    }
  }, [tenantConfig]);

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
      await login(email, password);
    } catch (err) {
      console.error(err);
      setError('فشل تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور.');
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
                src={tenantConfig?.logoUrl || "/new-logo.png"} 
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
              src={tenantConfig?.logoUrl || "/new-logo.png"} 
              alt={tenantConfig?.appName || "UpKlick"} 
              style={styles.logo} 
            />
          );
        })()}
        <h1 style={{ ...styles.title, ...(tenantConfig?.textColor ? { color: tenantConfig.textColor } : {}) }}>
          {tenantConfig?.appName ? `تسجيل الدخول - ${tenantConfig.appName}` : 'تسجيل الدخول'}
        </h1>
        <p style={{ ...styles.subtitle, ...(tenantConfig?.text2Color ? { color: tenantConfig.text2Color } : {}) }}>
          {tenantConfig?.tagline || 'أدخل بياناتك للوصول إلى لوحة التحكم'}
        </p>

        {error && <div style={styles.error}>{error}</div>}

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
            <label style={{ ...styles.label, ...(tenantConfig?.textColor ? { color: tenantConfig.textColor } : {}) }}>كلمة المرور</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
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
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>

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
