'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, updatePassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { clearLegacySiteKeys } from '../lib/sites/userSitesScope';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let unsubSnapshot = null;

    // Fallback timeout in case onAuthStateChanged hangs (e.g. on ngrok free tier without headers)
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("Auth initialization timed out. Forcing loading to false.");
        setLoading(false);
      }
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (unsubSnapshot) unsubSnapshot();

      if (firebaseUser) {
        const docRef = doc(db, 'users', firebaseUser.uid);
        unsubSnapshot = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            setUserData({ role: 'user', email: firebaseUser.email, uid: firebaseUser.uid });
          }
          setLoading(false);
          clearTimeout(timeout);
        }, (error) => {
          console.error('Error listening to user document:', error);
          setUserData({ role: 'user', email: firebaseUser.email, uid: firebaseUser.uid });
          setLoading(false);
          clearTimeout(timeout);
        });
      } else {
        setUserData(null);
        setLoading(false);
        clearTimeout(timeout);
      }
    });

    return () => {
      unsubscribe();
      if (unsubSnapshot) unsubSnapshot();
      clearTimeout(timeout);
    };
  }, []);

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ba_onboard_done');
      localStorage.removeItem('ba_context');
      localStorage.removeItem('ba_notes');
      clearLegacySiteKeys();
    }
    router.push('/login');
  };

  const updateUserAccount = async (newName, newPassword, newLang, newTheme) => {
    if (!user) throw new Error('Not authenticated');
    
    const updates = {};
    if (newName) {
      await updateProfile(user, { displayName: newName });
      updates.name = newName;
    }
    if (newLang) updates.lang = newLang;
    if (newTheme) updates.theme = newTheme;

    if (Object.keys(updates).length > 0) {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, updates, { merge: true });
      setUserData(prev => ({ ...prev, ...updates }));
    }

    if (newPassword) {
      await updatePassword(user, newPassword);
    }
  };

  const resetPassword = async (email) => {
    const res = await fetch('/api/auth/send-reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to send password reset email');
    }
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, currentUser: user, userData, login, logout, updateUserAccount, resetPassword, loading }}>
      {loading ? (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', background: '#08080f', color: '#8275A3', fontFamily: 'sans-serif', flexDirection: 'column', gap: '12px' }}>
          <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid rgba(255,107,53,0.3)', borderTopColor: '#FF6B35', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <div>جاري التحميل...</div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

