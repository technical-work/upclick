'use client';

import React, { useState } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { firebaseConfig } from '@/lib/firebase';

export default function CreateAdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
      const auth = getAuth(app);
      const db = getFirestore(app);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        uid: uid,
        email: email,
        name: role === 'admin' ? 'Admin User' : 'Normal User',
        role: role,
        createdAt: new Date()
      });

      setMessage(
        role === 'admin' 
          ? 'تم إنشاء حساب Admin بنجاح!' 
          : 'تم إنشاء حساب المستخدم بنجاح!'
      );
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء إنشاء الحساب.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src="/upklick-logo.png" alt="UpKlick" style={styles.logo} />
        <h1 style={styles.title}>تهيئة حساب مسؤول جديد</h1>
        <p style={styles.subtitle}>أدخل البريد الإلكتروني وكلمة المرور لإنشاء حساب إداري في Firestore</p>

        {message && <div style={styles.success}>{message}</div>}
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>البريد الإلكتروني</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="admin@upklick.com"
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
          <div style={styles.inputGroup}>
            <label style={styles.label}>الدور والصلاحية</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              style={styles.select}
            >
              <option value="user">مستخدم عادي (User)</option>
              <option value="admin">مسؤول عادي (Admin)</option>
            </select>
          </div>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'جاري تهيئة الحساب...' : 'إنشاء الحساب'}
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
    maxWidth: '450px',
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
    marginBottom: '8px',
    textAlign: 'center'
  },
  subtitle: {
    color: '#9090b0',
    fontSize: '14px',
    marginBottom: '30px',
    textAlign: 'center',
    lineHeight: '1.5'
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
  select: {
    padding: '12px 16px',
    borderRadius: '10px',
    backgroundColor: '#101018',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#f8f4ff',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer'
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
  success: {
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '13px',
    marginBottom: '20px',
    width: '100%',
    textAlign: 'center',
    border: '1px solid rgba(16, 185, 129, 0.2)'
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
