'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function PublicPromoPage() {
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      try {
        const decodedUsername = decodeURIComponent(username).toLowerCase();
        const docRef = doc(db, 'bio_links', decodedUsername);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching landing page:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', background: '#08080f', color: '#8275A3', fontFamily: 'sans-serif', flexDirection: 'column', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,107,53,0.3)', borderTopColor: '#FF6B35', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
        <div>جاري تحميل الصفحة...</div>
      </div>
    );
  }

  if (!profile || !profile.landingPageHtml) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', background: '#08080f', color: '#AEA4CA', fontFamily: 'sans-serif', flexDirection: 'column', gap: '16px', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px' }}>⚡</div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#F8F6FC' }}>صفحة الهبوط غير جاهزة بعد / Landing Page Not Active</h1>
        <p style={{ maxWidth: '400px', fontSize: '14px', color: '#8275A3', lineHeight: '1.6' }}>
          لم يتم نشر صفحة الهبوط لهذا المستخدم بعد. تأكد من أن المالك قد قام بالضغط على "نشر واجعله مباشراً".
          <br />
          No landing page has been published for this user yet.
        </p>
        <a href={`/${username}`} style={{ marginTop: '10px', background: '#FF6B35', color: '#fff', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>
          زيارة رابط البايو / Visit Bio Link
        </a>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media(max-width:768px){
          section {
            padding: 40px 16px !important;
          }
          div[style*="grid-template-columns:repeat(3"],
          div[style*="grid-template-columns: repeat(3"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-template-columns:1fr 1fr"],
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-template-columns:1fr 1.5fr"],
          div[style*="grid-template-columns: 1fr 1.5fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-template-columns:repeat(4"],
          div[style*="grid-template-columns: repeat(4"] {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
        }
        @media(max-width:480px){
          div[style*="grid-template-columns:repeat(4"],
          div[style*="grid-template-columns: repeat(4"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <div 
        style={{ width: '100%', minHeight: '100vh', margin: 0, padding: 0 }}
        dangerouslySetInnerHTML={{ __html: profile.landingPageHtml }} 
      />
    </>
  );
}
