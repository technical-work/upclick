'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CommunityGroupExperience from '../../../../../../components/Memberships/CommunityGroupExperience';
import {
  getCoachPortalSettings,
  getCoachCommunities,
  getCoachCourses,
  getCoachStudents,
  saveCommunityGroup,
  DEFAULT_PORTAL_SETTINGS
} from '../../../../../../lib/membershipsService';

export default function PortalCommunityGroupTabSubPage() {
  const params = useParams();
  const router = useRouter();

  const coachUsername = params?.coachUsername || 'coach';
  const slug = params?.slug || 'community';
  const tab = params?.tab || 'discussion';

  // Map route tab names (e.g. 'home' -> 'discussion', 'about' -> 'about', etc.)
  const mappedTab = tab === 'home' ? 'discussion' : tab;

  const [portalSettings, setPortalSettings] = useState(DEFAULT_PORTAL_SETTINGS);
  const [communityGroup, setCommunityGroup] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);

        const settings = await getCoachPortalSettings(coachUsername);
        if (!isMounted) return;
        setPortalSettings(settings);

        const coachId = settings.coachId || settings.id || coachUsername;

        const [commList, cList, sList] = await Promise.all([
          getCoachCommunities(coachId),
          getCoachCourses(coachId),
          getCoachStudents(coachId)
        ]);

        if (!isMounted) return;

        const allComm = Array.isArray(commList) ? commList : [];
        setCommunities(allComm);
        setCourses(Array.isArray(cList) ? cList : []);
        setStudents(Array.isArray(sList) ? sList : []);

        const matched = allComm.find(
          c => (c.slug && c.slug.toLowerCase() === slug.toLowerCase()) ||
               (c.id && c.id.toLowerCase() === slug.toLowerCase())
        );

        if (matched) {
          setCommunityGroup(matched);
        } else {
          const formattedName = slug
            .split('-')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');

          const fallbackGroup = {
            id: slug,
            slug: slug,
            name: formattedName || 'Community Group',
            description: `Welcome to the official ${formattedName} community group. Connect, learn, and grow together with fellow members.`,
            privacy: 'public',
            membersCount: 2,
            postsCount: 1,
            adminsCount: 1,
            status: 'Active',
            owner: settings.portalTitle ? settings.portalTitle.replace(' Academy', '') : 'Coach',
            coverImageUrl: '',
            logoUrl: '',
            colorTheme: 'default',
            hiddenTabs: [],
            discovery: true
          };

          setCommunityGroup(fallbackGroup);
          saveCommunityGroup(coachId, fallbackGroup).catch(() => {});
        }
      } catch (err) {
        console.error('[PortalCommunityTabSubPage] Error loading data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [coachUsername, slug]);

  const handleUpdateGroup = async (updated) => {
    setCommunityGroup(updated);
    const coachId = portalSettings.coachId || portalSettings.id || coachUsername;
    try {
      await saveCommunityGroup(coachId, updated);
      showToast('تم تحديث إعدادات المجتمع بنجاح!');
    } catch (e) {
      showToast('تم حفظ الإعدادات محلياً!');
    }
  };

  const handleClose = () => {
    router.push(`/portal/${coachUsername}`);
  };

  if (loading && !communityGroup) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0b0f19',
        color: '#ffffff',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <div style={{ fontSize: '14px', fontWeight: '700' }}>Loading...</div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const coachName = portalSettings.portalTitle
    ? portalSettings.portalTitle.replace(' Academy', '')
    : (coachUsername === 'moha' ? 'Mohamed Hesham' : 'Coach');

  return (
    <div style={{ minHeight: '100vh', width: '100%', position: 'relative' }}>
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#1e293b',
          border: '1px solid #334155',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: '8px',
          zIndex: 999999,
          boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
          fontSize: '13px',
          fontWeight: '700'
        }}>
          {toastMessage}
        </div>
      )}

      {communityGroup && (
        <CommunityGroupExperience
          group={communityGroup}
          onClose={handleClose}
          coachName={coachName}
          coachId={portalSettings.coachId || portalSettings.id || coachUsername}
          userData={{
            username: coachUsername,
            name: coachName
          }}
          isRTL={false}
          showToast={showToast}
          courses={courses}
          students={students}
          communities={communities}
          onUpdateGroup={handleUpdateGroup}
          initialTab={mappedTab}
          initialChannel={tab === 'home' ? 'home' : undefined}
        />
      )}
    </div>
  );
}
