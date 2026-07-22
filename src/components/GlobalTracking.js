'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import TrackingScripts from '@/components/TrackingScripts';
import { Tracking } from '@/lib/tracking';

export default function GlobalTracking() {
  const [trackingCenter, setTrackingCenter] = useState(null);
  const pathname = usePathname();

  // 1. Listen to global tenant tracking configuration from tenants/global
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'tenants', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.trackingCenter) {
          setTrackingCenter(data.trackingCenter);
        }
      }
    }, (err) => {
      console.error("Error listening to global tracking config:", err);
    });

    return () => unsub();
  }, []);

  // 2. Automatically dispatch page view tracking on route changes
  useEffect(() => {
    if (pathname && typeof window !== 'undefined') {
      try {
        Tracking.page(pathname);
      } catch (err) {
        console.error("Error dispatching page tracking:", err);
      }
    }
  }, [pathname]);

  if (!trackingCenter) return null;

  return <TrackingScripts trackingCenter={trackingCenter} />;
}
