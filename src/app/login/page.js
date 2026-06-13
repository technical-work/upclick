'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('فشل تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src="/upklick-logo.png" alt="UpKlick" style={styles.logo} />
        <h1 style={styles.title}>تسجيل الدخول</h1>
        <p style={styles.subtitle}>أدخل بياناتك للوصول إلى لوحة التحكم</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>البريد الإلكتروني</label>
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
            <label style={styles.label}>كلمة المرور</label>
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
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
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
  }
};
