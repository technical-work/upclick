'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, updatePassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            setUserData({ role: 'user', email: firebaseUser.email });
          }
        } catch (error) {
          console.error('Error fetching user document:', error);
          setUserData({ role: 'user', email: firebaseUser.email });
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
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

  return (
    <AuthContext.Provider value={{ user, currentUser: user, userData, login, logout, updateUserAccount, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

