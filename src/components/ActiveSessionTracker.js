'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, increment } from 'firebase/firestore';

const mapPageToSection = (page) => {
  if (['marketing', 'landing', 'upclick', 'niche', 'design'].includes(page)) return 'marketing';
  if (['crm'].includes(page)) return 'crm';
  if (['tasks', 'ops', 'calendar', 'automation'].includes(page)) return 'tasks';
  if (['telegram'].includes(page)) return 'telegram';
  if (['finance', 'billing', 'revenue'].includes(page)) return 'finance';
  return 'other';
};

export default function ActiveSessionTracker() {
  const { user } = useAuth();
  const { currentPage } = useBusiness();
  const lastActiveRef = useRef(0);
  const activeSecondsRef = useRef({});
  const currentPageRef = useRef(currentPage);

  const flushTime = useCallback(async () => {
    if (!user?.uid || !auth.currentUser) return;

    const secondsToFlush = { ...activeSecondsRef.current };
    // Reset local cache immediately to prevent duplicate increments
    activeSecondsRef.current = {};

    const totalSeconds = Object.values(secondsToFlush).reduce((a, b) => a + b, 0);
    if (totalSeconds <= 0) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      const updates = {
        totalTimeSpent: increment(totalSeconds),
        lastActiveAt: new Date().toISOString()
      };

      // Add increments for each specific section
      Object.entries(secondsToFlush).forEach(([sec, val]) => {
        if (val > 0) {
          updates[`sectionUsage.${sec}`] = increment(val);
        }
      });

      await setDoc(userRef, updates, { merge: true });
    } catch (err) {
      console.error('Error writing usage logs to Firestore:', err);
    }
  }, [user]);

  // Sync ref to current page
  useEffect(() => {
    flushTime();
    currentPageRef.current = currentPage;
  }, [currentPage, flushTime]);

  useEffect(() => {
    if (!user?.uid) return;

    lastActiveRef.current = Date.now();

    const handleActivity = () => {
      lastActiveRef.current = Date.now();
    };

    // Activity triggers
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('scroll', handleActivity);

    // Track active seconds every second
    const interval = setInterval(() => {
      // Check if user was active in the last 60 seconds (1 minute idle threshold)
      if (Date.now() - lastActiveRef.current < 60000) {
        const secName = mapPageToSection(currentPageRef.current);
        activeSecondsRef.current[secName] = (activeSecondsRef.current[secName] || 0) + 1;
      }
    }, 1000);

    // Flush to Firestore every 30 seconds
    const flushInterval = setInterval(() => {
      flushTime();
    }, 30000);

    const handleUnload = () => {
      flushTime();
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('blur', handleUnload);

    return () => {
      clearInterval(interval);
      clearInterval(flushInterval);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('blur', handleUnload);
      flushTime(); // Final flush on unmount
    };
  }, [user?.uid, flushTime]);

  return null;
}
