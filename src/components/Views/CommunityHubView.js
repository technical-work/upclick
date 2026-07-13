'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { useAuth } from '../../context/AuthContext';
import { parseMarkdown } from '../../utils/markdown';
import { db } from '../../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';

import { initializeApp, getApps } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const secondaryFirebaseConfig = {
  apiKey: "AIzaSyCaswftcLmfIepG_F8fzizqGXFl5mnXvj8",
  authDomain: "aibrand-vision.firebaseapp.com",
  projectId: "aibrand-vision",
  storageBucket: "aibrand-vision.firebasestorage.app",
  messagingSenderId: "36898907108",
  appId: "1:36898907108:web:423352bb5b0f5825d65df1",
  measurementId: "G-G0CFX66Q3V"
};

// Initialize secondary Firebase App instance safely
const secondaryApp = getApps().find(app => app.name === 'supportStorageApp') 
  || initializeApp(secondaryFirebaseConfig, 'supportStorageApp');

const supportStorage = getStorage(secondaryApp);

export default function CommunityHubView() {
  const { lang, L, t, GC, saveGC, formatMoney } = useBusiness();
  const { user: currentUser, userData } = useAuth();

  const isPlatformAdmin = userData?.role === 'admin' || userData?.role === 'super_admin';
  const isWorkspaceOwner = currentUser?.uid && (!userData?.role || userData?.role === 'user');
  
  // Can manage community spaces, challenges, library assets
  const canManageCommunity = isPlatformAdmin || isWorkspaceOwner;

  // Selected Community Channel/Space
  const [activeSpaceId, setActiveSpaceId] = useState('');
  const [isAddSpaceOpen, setIsAddSpaceOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceType, setNewSpaceType] = useState('Paid');
  const [newSpacePrice, setNewSpacePrice] = useState('$97');

  // Sub-tabs for the active space: posts, members, challenges, library
  const [activeSubTab, setActiveSubTab] = useState('posts');

  // Form states for creating a new post
  const [postText, setPostText] = useState('');
  const [postTag, setPostTag] = useState('win'); // win, question, idea, announcement
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollOptionsText, setPollOptionsText] = useState('');

  // Community Post image upload states
  const [postFile, setPostFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  
  // Edit post file upload states
  const [editPostFile, setEditPostFile] = useState(null);
  const [editUploadProgress, setEditUploadProgress] = useState(0);
  const [editUploading, setEditUploading] = useState(false);

  const handleUploadFile = (file, isEdit = false) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      if (isEdit) {
        setEditUploading(true);
        setEditUploadProgress(0);
      } else {
        setUploading(true);
        setUploadProgress(0);
      }
      
      const fileRef = ref(supportStorage, `community_posts/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);
      
      uploadTask.on('state_changed',
        (snapshot) => {
          const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          if (isEdit) {
            setEditUploadProgress(prog);
          } else {
            setUploadProgress(prog);
          }
        },
        (error) => {
          console.error("Error uploading community image:", error);
          if (isEdit) setEditUploading(false);
          else setUploading(false);
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (isEdit) setEditUploading(false);
            else setUploading(false);
            resolve(downloadUrl);
          } catch (err) {
            if (isEdit) setEditUploading(false);
            else setUploading(false);
            reject(err);
          }
        }
      );
    });
  };

  // Edit Post states
  const [isEditPostOpen, setIsEditPostOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState('');
  const [editPostText, setEditPostText] = useState('');
  const [editPostTag, setEditPostTag] = useState('win');
  const [editPostImageUrl, setEditPostImageUrl] = useState('');
  const [editPostLinkUrl, setEditPostLinkUrl] = useState('');

  // Comment input state (keyed by post ID)
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  // Dynamic lists loaded from Firestore
  const [spaces, setSpaces] = useState([]);
  const [feed, setFeed] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [library, setLibrary] = useState([]);

  // Modals for adding Challenges, Resources
  const [isAddChallengeOpen, setIsAddChallengeOpen] = useState(false);
  const [cTitle, setCTitle] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cPoints, setCPoints] = useState(50);

  const [isAddLibraryOpen, setIsAddLibraryOpen] = useState(false);
  const [lTitle, setLTitle] = useState('');
  const [lCategory, setLCategory] = useState('PDF');
  const [lDownloadUrl, setLDownloadUrl] = useState('');

  // 1. Subscribe to spaces globally (no adminId filter, so any user can see all spaces)
  useEffect(() => {
    const q = query(collection(db, 'community_spaces'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setSpaces(list);

      // Auto select first space if none active
      if (list.length > 0 && !activeSpaceId) {
        const hasGold = list.find(s => s.id === 'gold-community');
        setActiveSpaceId(hasGold ? 'gold-community' : list[0].id);
      }
    });
    return unsubscribe;
  }, [activeSpaceId]);

  // 2. Subscribe to posts globally for this space
  useEffect(() => {
    if (!activeSpaceId) return;
    const q = query(
      collection(db, 'community_posts'), 
      where('spaceId', '==', activeSpaceId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setFeed(list);
    });
    return unsubscribe;
  }, [activeSpaceId]);

  // 3. Subscribe to challenges globally for this space
  useEffect(() => {
    if (!activeSpaceId) return;
    const q = query(
      collection(db, 'community_challenges'), 
      where('spaceId', '==', activeSpaceId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setChallenges(list);
    });
    return unsubscribe;
  }, [activeSpaceId]);

  // 4. Subscribe to library globally for this space
  useEffect(() => {
    if (!activeSpaceId) return;
    const q = query(
      collection(db, 'community_library'), 
      where('spaceId', '==', activeSpaceId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setLibrary(list);
    });
    return unsubscribe;
  }, [activeSpaceId]);

  // 5. Subscribe to ALL users in the entire system for global leaderboard
  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allUsers = snapshot.docs.map(d => ({ uid: d.id, ...d.data() }));
      
      const mapped = allUsers.map(u => ({
        uid: u.uid,
        name: u.name || u.email || 'Member',
        points: u.communityPoints || 0,
        avatar: (u.name || u.email || 'M')[0].toUpperCase(),
        role: u.role || 'Member'
      }));

      mapped.sort((a, b) => b.points - a.points);
      setLeaderboard(mapped);
    });
    return unsubscribe;
  }, []);

  // Get current user's name
  const getUserName = () => {
    return userData?.name || currentUser?.displayName || currentUser?.email || 'User';
  };

  // Add leaderboard points inside Firestore /users/{userId}
  const addLeaderboardPoints = async (userUid, pointsToAdd) => {
    if (!userUid) return;
    try {
      const userRef = doc(db, 'users', userUid);
      const userDoc = leaderboard.find(u => u.uid === userUid);
      const currentPoints = userDoc ? userDoc.points : 0;
      await updateDoc(userRef, {
        communityPoints: currentPoints + pointsToAdd
      });
    } catch (err) {
      console.error('Error adding points:', err);
    }
  };

  // CREATE CHANNEL / SPACE
  const handleAddSpace = async (e) => {
    e.preventDefault();
    if (!newSpaceName.trim()) return;

    try {
      const spaceId = newSpaceName.toLowerCase().replace(/\s+/g, '-');
      const newSpace = {
        name: newSpaceName.trim(),
        type: newSpaceType,
        price: newSpaceType === 'Paid' ? newSpacePrice : 'Free',
        membersCount: 1,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'community_spaces', spaceId), newSpace);
      setActiveSpaceId(spaceId);
      setIsAddSpaceOpen(false);
      setNewSpaceName('');
      alert(L('New community space created!', 'تم إنشاء مجتمع جديد بنجاح!'));
    } catch (err) {
      console.error(err);
      alert(L('Error creating space: ' + err.message, 'حدث خطأ أثناء إنشاء المجموعة: ' + err.message));
    }
  };

  // CREATE NEW POST
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postText.trim() || !activeSpaceId) return;

    const authorName = getUserName();
    let poll = null;
    if (showPollCreator && pollOptionsText.trim()) {
      poll = {
        question: postText,
        options: pollOptionsText.split(',').map((o, idx) => ({ id: idx, text: o.trim(), votes: 0 })),
        userVotedOptionId: null
      };
    }

    try {
      let finalImageUrl = null;
      if (showImageInput && postFile) {
        finalImageUrl = await handleUploadFile(postFile, false);
      }

      const newPost = {
        spaceId: activeSpaceId,
        author: authorName,
        role: isPlatformAdmin ? 'Platform Admin' : isWorkspaceOwner ? L('Owner', 'المالك') : L('Member', 'عضو'),
        avatar: authorName[0].toUpperCase(),
        tag: postTag,
        content: postText,
        likes: 0,
        celebrates: 0,
        insights: 0,
        reactions: {},
        imageUrl: finalImageUrl,
        linkUrl: showLinkInput ? linkUrl.trim() : null,
        poll: poll,
        comments: [],
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'community_posts'), newPost);

      // Reset fields
      setPostText('');
      setImageUrl('');
      setPostFile(null);
      setLinkUrl('');
      setPollOptionsText('');
      setShowImageInput(false);
      setShowLinkInput(false);
      setShowPollCreator(false);

      await addLeaderboardPoints(currentUser?.uid, 10);
    } catch (err) {
      console.error(err);
      alert(L('Error creating post: ' + err.message, 'حدث خطأ أثناء نشر المنشور: ' + err.message));
    }
  };

  // OPEN EDIT POST
  const handleOpenEditPost = (post) => {
    setEditingPostId(post.id);
    setEditPostText(post.content);
    setEditPostTag(post.tag || 'win');
    setEditPostImageUrl(post.imageUrl || '');
    setEditPostLinkUrl(post.linkUrl || '');
    setIsEditPostOpen(true);
  };

  // SAVE EDIT POST
  const handleSaveEditPost = async (e) => {
    e.preventDefault();
    if (!editPostText.trim()) return;

    try {
      let finalImageUrl = editPostImageUrl;
      if (editPostFile) {
        finalImageUrl = await handleUploadFile(editPostFile, true);
      }

      const postRef = doc(db, 'community_posts', editingPostId);
      await updateDoc(postRef, {
        content: editPostText,
        tag: editPostTag,
        imageUrl: finalImageUrl || null,
        linkUrl: editPostLinkUrl.trim() || null
      });
      setIsEditPostOpen(false);
      setEditPostFile(null);
      alert(L('Post updated successfully!', 'تم تحديث المنشور بنجاح!'));
    } catch (err) {
      console.error(err);
      alert(L('Error updating post: ' + err.message, 'خطأ أثناء تحديث المنشور: ' + err.message));
    }
  };

  // DELETE POST
  const handleDeletePost = async (postId) => {
    if (!window.confirm(L('Are you sure you want to delete this post?', 'هل أنت متأكد من رغبتك في حذف هذا المنشور؟'))) return;
    try {
      const postRef = doc(db, 'community_posts', postId);
      await deleteDoc(postRef);
      alert(L('Post deleted successfully!', 'تم حذف المنشور بنجاح!'));
    } catch (err) {
      console.error(err);
      alert(L('Error deleting post: ' + err.message, 'خطأ أثناء حذف المنشور: ' + err.message));
    }
  };

  // REACTION HANDLER
  const handleReaction = async (postId, reactionType) => {
    const post = feed.find(p => p.id === postId);
    if (!post) return;

    const userName = getUserName();
    const reactions = post.reactions || {};
    const userHasReacted = reactions[userName] === reactionType;

    const newReactions = { ...reactions };
    let likeDiff = 0, celebDiff = 0, insightDiff = 0;

    if (userHasReacted) {
      delete newReactions[userName];
      if (reactionType === 'like') likeDiff = -1;
      if (reactionType === 'celebrate') celebDiff = -1;
      if (reactionType === 'insight') insightDiff = -1;
    } else {
      const oldReaction = reactions[userName];
      if (oldReaction === 'like') likeDiff = -1;
      if (oldReaction === 'celebrate') celebDiff = -1;
      if (oldReaction === 'insight') insightDiff = -1;

      newReactions[userName] = reactionType;
      if (reactionType === 'like') likeDiff = 1;
      if (reactionType === 'celebrate') celebDiff = 1;
      if (reactionType === 'insight') insightDiff = 1;

      await addLeaderboardPoints(currentUser?.uid, 1);
    }

    try {
      const postRef = doc(db, 'community_posts', postId);
      await updateDoc(postRef, {
        likes: Math.max(0, (post.likes || 0) + likeDiff),
        celebrates: Math.max(0, (post.celebrates || 0) + celebDiff),
        insights: Math.max(0, (post.insights || 0) + insightDiff),
        reactions: newReactions
      });
    } catch (err) {
      console.error(err);
    }
  };

  // COMMENT SUBMISSION
  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    const post = feed.find(p => p.id === postId);
    if (!post) return;

    const authorName = getUserName();
    const newComment = {
      author: authorName,
      content: text.trim(),
      date: L('Just now', 'الآن')
    };

    try {
      const postRef = doc(db, 'community_posts', postId);
      await updateDoc(postRef, {
        comments: [...(post.comments || []), newComment]
      });

      setCommentInputs({ ...commentInputs, [postId]: '' });
      await addLeaderboardPoints(currentUser?.uid, 5);
    } catch (err) {
      console.error(err);
    }
  };

  // POLL VOTING
  const handleVotePoll = async (postId, optionId) => {
    const post = feed.find(p => p.id === postId);
    if (!post || !post.poll) return;

    const poll = post.poll;
    const votedOptionId = poll.userVotedOptionId;

    const updatedOptions = poll.options.map(opt => {
      let diff = 0;
      if (votedOptionId === opt.id) diff = -1;
      if (optionId === opt.id) diff = 1;
      return { ...opt, votes: Math.max(0, opt.votes + diff) };
    });

    try {
      const postRef = doc(db, 'community_posts', postId);
      await updateDoc(postRef, {
        poll: {
          ...poll,
          options: updatedOptions,
          userVotedOptionId: votedOptionId === optionId ? null : optionId
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  // CHALLENGE JOIN / COMPLETE
  const handleToggleChallenge = async (challengeId, isCompleteAction) => {
    const challenge = challenges.find(ch => ch.id === challengeId);
    if (!challenge) return;

    const userName = getUserName();
    const challengeRef = doc(db, 'community_challenges', challengeId);

    try {
      if (isCompleteAction) {
        const completedUsers = challenge.completedUsers || [];
        if (!completedUsers.includes(userName)) {
          await updateDoc(challengeRef, {
            completedUsers: [...completedUsers, userName],
            participantsCount: (challenge.participantsCount || 0) + 1
          });
          await addLeaderboardPoints(currentUser?.uid, challenge.points);
          alert(L('Challenge completed! You earned points.', 'تم إكمال التحدي بنجاح وحصلت على النقاط!'));
        }
      } else {
        const participants = challenge.participants || [];
        const isJoined = participants.includes(userName);
        const nextParticipants = isJoined 
          ? participants.filter(p => p !== userName)
          : [...participants, userName];

        await updateDoc(challengeRef, {
          participants: nextParticipants
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ADD CHALLENGE
  const handleAddChallenge = async (e) => {
    e.preventDefault();
    if (!cTitle.trim() || !activeSpaceId) return;

    try {
      const newCh = {
        spaceId: activeSpaceId,
        title: cTitle.trim(),
        desc: cDesc.trim(),
        points: parseInt(cPoints) || 50,
        participantsCount: 0,
        participants: [],
        completedUsers: [],
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'community_challenges'), newCh);
      setIsAddChallengeOpen(false);
      setCTitle('');
      setCDesc('');
      setCPoints(50);
      alert(L('Challenge added to community!', 'تم إضافة التحدي للمجتمع بنجاح!'));
    } catch (err) {
      console.error(err);
      alert(L('Error adding challenge: ' + err.message, 'خطأ أثناء إضافة التحدي: ' + err.message));
    }
  };

  // ADD FILE RESOURCE
  const handleAddLibrary = async (e) => {
    e.preventDefault();
    if (!lTitle.trim() || !activeSpaceId) return;

    try {
      const newLib = {
        spaceId: activeSpaceId,
        title: lTitle.trim(),
        category: lCategory,
        downloadUrl: lDownloadUrl || '#',
        downloads: 0,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'community_library'), newLib);
      setIsAddLibraryOpen(false);
      setLTitle('');
      setLDownloadUrl('');
      alert(L('Resource added to library!', 'تم إضافة الملف للمكتبة بنجاح!'));
    } catch (err) {
      console.error(err);
      alert(L('Error adding resource: ' + err.message, 'خطأ أثناء إضافة الملف: ' + err.message));
    }
  };

  // Helper stats calculation
  const getPostsTodayCount = () => {
    const todayStr = new Date().toDateString();
    return feed.filter(post => {
      if (!post.createdAt) return false;
      return new Date(post.createdAt).toDateString() === todayStr;
    }).length;
  };

  const getEngagementRate = () => {
    if (leaderboard.length === 0) return 0;
    const activeCount = leaderboard.filter(u => u.points > 0).length;
    return Math.round((activeCount / leaderboard.length) * 100);
  };

  const getTagColor = (tag) => {
    switch (tag) {
      case 'win': return 'var(--green)';
      case 'question': return 'var(--red)';
      case 'idea': return 'var(--blue)';
      case 'announcement': return 'var(--orange)';
      default: return 'var(--t2)';
    }
  };

  const activeSpace = spaces.find(s => s.id === activeSpaceId);

  return (
    <div className="pg on" id="pg-community-hub">
      <div className="pg-header" style={{ marginBottom: '14px' }}>
        <div className="pg-title">
          <span className="pg-icon">👥</span>
          {L('Workspace Community spaces', 'مركز إدارة وتفاعل مجتمعات الأعمال')}
        </div>
        <div className="pg-actions">
          {canManageCommunity && (
            <button 
              className="btn btn-prime" 
              style={{ background: 'linear-gradient(135deg, var(--orange) 0%, #f43f5e 100%)', border: 'none' }}
              onClick={() => setIsAddSpaceOpen(true)}
            >
              ➕ {L('Create Community', 'إنشاء مجتمع جديد')}
            </button>
          )}
        </div>
      </div>

      {/* TOP COMMUNITY SPACES BAR */}
      <div className="mobile-scroll-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {spaces.map((space) => {
          const isActive = activeSpaceId === space.id;
          return (
            <div 
              key={space.id}
              onClick={() => setActiveSpaceId(space.id) || setActiveSubTab('posts')}
              style={{
                background: isActive ? 'rgba(249, 115, 22, 0.06)' : 'var(--surface2)',
                border: isActive ? '2px solid var(--orange)' : '1px solid var(--edge2)',
                borderRadius: '12px',
                padding: '14px 18px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: isActive ? '0 4px 12px rgba(249, 115, 22, 0.15)' : 'none',
                minWidth: '240px'
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '13.5px', color: isActive ? 'var(--orange)' : 'var(--t1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {space.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>
                  {space.type === 'Paid' ? L('Premium Community', 'مجتمع كوتشنج مدفوع') : 
                   space.type === 'Private' ? L('Private VIP Group', 'مجموعة خاصة VIP') : 
                   L('Public Space / Reviews', 'مساحة مفتوحة للتقييمات')}
                </div>
              </div>
              <span className="badge" style={{ 
                background: space.type === 'Paid' ? 'rgba(249,115,22,0.15)' : 'var(--surface3)', 
                color: space.type === 'Paid' ? 'var(--orange)' : 'var(--t2)',
                fontSize: '10.5px' 
              }}>
                {space.membersCount ? `${space.membersCount} 👤` : `${space.rating || '4.0'} ⭐`}
              </span>
            </div>
          );
        })}
        {spaces.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '16px', background: 'var(--surface2)', borderRadius: '10px', textAlign: 'center', color: 'var(--t3)', fontSize: '12.5px', border: '1px dashed var(--edge2)' }}>
            {canManageCommunity ? L('No spaces created yet. Click "+ Create Community" above to build your first group!', 'لا توجد مجتمعات منشأة بعد. اضغط على "+ إنشاء مجتمع جديد" بالأعلى للبدء!') : L('No community spaces created in this workspace yet.', 'لم يتم إنشاء أي قنوات أو مجتمعات تفاعل في حساب العمل هذا بعد.')}
          </div>
        )}
      </div>

      {/* SPACE INTERACTION TABS */}
      {activeSpaceId && (
        <div style={{ 
          marginBottom: '20px', 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '6px', 
          background: 'var(--surface2)', 
          padding: '6px', 
          borderRadius: '12px', 
          border: '1px solid var(--edge2)',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', flex: 1 }}>
            {[
              { key: 'posts', label: L('Posts Feed', 'تحديثات الأعضاء'), icon: '📝' },
              { key: 'members', label: L('Members Directory', 'أعضاء ومحفزي المجتمع'), icon: '👥' },
              { key: 'challenges', label: L('Weekly Challenges', 'تحديات ومسابقات الأسبوع'), icon: '🏆' },
              { key: 'library', label: L('Resource Library', 'مكتبة الملفات والمصادر'), icon: '📚' }
            ].map((subTab) => (
              <button 
                key={subTab.key}
                style={{
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: activeSubTab === subTab.key ? 'var(--orange)' : 'transparent',
                  color: activeSubTab === subTab.key ? '#fff' : 'var(--t2)',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onClick={() => setActiveSubTab(subTab.key)}
              >
                <span>{subTab.icon}</span>
                <span>{subTab.label}</span>
              </button>
            ))}
          </div>

          {/* Admin additions button in sub tabs */}
          {canManageCommunity && activeSubTab === 'challenges' && (
            <button className="btn btn-prime" style={{ fontSize: '11px', padding: '6px 12px' }} onClick={() => setIsAddChallengeOpen(true)}>
              ➕ {L('Create Challenge', 'إضافة تحدي جديد')}
            </button>
          )}
          {canManageCommunity && activeSubTab === 'library' && (
            <button className="btn btn-prime" style={{ fontSize: '11px', padding: '6px 12px' }} onClick={() => setIsAddLibraryOpen(true)}>
              ➕ {L('Add Resource', 'إضافة ملف جديد')}
            </button>
          )}
        </div>
      )}

      {/* VIEW GRID SECTION */}
      {activeSpaceId ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
          
          {/* LEFT COLUMN: ACTIVE SUBTAB MAIN VIEW */}
          <div>
            
            {/* TAB 1: POSTS FEED */}
            {activeSubTab === 'posts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Write Post Box */}
                <div className="card" style={{ background: 'var(--surface2)', border: '1px solid var(--edge2)', padding: '18px', borderRadius: '12px' }}>
                  <form onSubmit={handleCreatePost}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }}>📝 {L('Create new community post', 'اكتب منشوراً جديداً للمجتمع')}</span>
                      
                      {/* Tag Selector */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--t3)' }}>{L('Tag:', 'نوع المنشور:')}</span>
                        <select 
                          className="inp" 
                          style={{ fontSize: '11px', padding: '2px 8px', height: '26px' }}
                          value={postTag}
                          onChange={(e) => setPostTag(e.target.value)}
                        >
                          <option value="win">🏆 {L('Win / Achievement', 'إنجاز')}</option>
                          <option value="question">❓ {L('Question', 'سؤال')}</option>
                          <option value="idea">💡 {L('Idea', 'فكرة')}</option>
                          <option value="announcement">📢 {L('Announcement', 'إعلان')}</option>
                        </select>
                      </div>
                    </div>

                    <textarea 
                      className="inp" 
                      value={postText} 
                      onChange={(e) => setPostText(e.target.value)} 
                      rows="3" 
                      required
                      placeholder={L('Share an insight, question, or win with your peers...', 'شارك فكرة، إنجاز، أو سؤالاً مهماً مع بقية الأعضاء في هذا المجتمع...')} 
                      style={{ marginBottom: '12px', width: '100%', padding: '12px', background: 'var(--surface3)', color: 'var(--t1)', border: '1px solid var(--edge2)', borderRadius: '8px', fontSize: '13px' }}
                    ></textarea>

                    {/* Optional Inputs */}
                    {showImageInput && (
                      <div style={{ marginBottom: '12px', padding: '12px', background: 'var(--surface3)', borderRadius: '8px', border: '1px solid var(--edge2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                          <input 
                            type="file" 
                            accept="image/*"
                            id="community-post-image-file"
                            style={{ display: 'none' }}
                            onChange={(e) => setPostFile(e.target.files[0])}
                            disabled={uploading}
                          />
                          <label 
                            htmlFor="community-post-image-file"
                            style={{ 
                              background: 'var(--surface2)', 
                              border: '1px solid var(--edge2)', 
                              padding: '6px 12px', 
                              borderRadius: '6px', 
                              cursor: 'pointer',
                              fontSize: '11.5px',
                              color: 'var(--t1)',
                              display: 'inline-block'
                            }}
                          >
                            📁 {postFile ? L('Change Photo', 'تغيير الصورة') : L('Select Photo', 'اختر صورة من جهازك')}
                          </label>
                          <span style={{ fontSize: '11px', color: 'var(--t2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {postFile ? postFile.name : L('No image selected', 'لم يتم اختيار صورة')}
                          </span>
                        </div>
                        {uploading && (
                          <div style={{ marginTop: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--orange)', marginBottom: '4px' }}>
                              <span>{L('Uploading image...', 'جاري رفع الصورة...')}</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'linear-gradient(90deg, var(--orange), #f43f5e)' }}></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {showLinkInput && (
                      <input 
                        className="inp" 
                        placeholder={L('Enter Link URL...', 'أدخل الرابط...')} 
                        value={linkUrl} 
                        onChange={(e) => setLinkUrl(e.target.value)} 
                        style={{ marginBottom: '10px', fontSize: '12px' }}
                      />
                    )}
                    {showPollCreator && (
                      <input 
                        className="inp" 
                        placeholder={L('Enter poll choices separated by commas (e.g. Yes, No, Maybe)...', 'أدخل خيارات التصويت مفصولة بفواصل (مثال: نعم، لا، ربما)...')} 
                        value={pollOptionsText} 
                        onChange={(e) => setPollOptionsText(e.target.value)} 
                        style={{ marginBottom: '10px', fontSize: '12px' }}
                      />
                    )}

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button type="button" className={`btn ${showImageInput ? 'btn-prime' : 'btn-ghost'}`} style={{ fontSize: '11.5px', padding: '4px 10px' }} onClick={() => setShowImageInput(!showImageInput)}>
                        🖼️ {L('Photo', 'صورة')}
                      </button>
                      <button type="button" className={`btn ${showLinkInput ? 'btn-prime' : 'btn-ghost'}`} style={{ fontSize: '11.5px', padding: '4px 10px' }} onClick={() => setShowLinkInput(!showLinkInput)}>
                        🔗 {L('Link', 'رابط')}
                      </button>
                      <button type="button" className={`btn ${showPollCreator ? 'btn-prime' : 'btn-ghost'}`} style={{ fontSize: '11.5px', padding: '4px 10px' }} onClick={() => setShowPollCreator(!showPollCreator)}>
                        📊 {L('Poll', 'تصويت')}
                      </button>
                      
                      <button 
                        type="submit" 
                        className="btn btn-prime" 
                        style={{ fontSize: '12px', padding: '6px 20px', marginInlineStart: 'auto', background: 'linear-gradient(135deg, var(--orange) 0%, #f43f5e 100%)', border: 'none' }}
                      >
                        {L('Publish Post', 'نشر المنشور')}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Feed posts list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {feed.map((post) => {
                    const commentsOpen = expandedComments[post.id] !== false;
                    const hasImage = !!post.imageUrl;
                    const hasLink = !!post.linkUrl;
                    const hasPoll = !!post.poll;
                    
                    return (
                      <div 
                        key={post.id} 
                        className="card" 
                        style={{ 
                          background: 'var(--surface2)', 
                          border: '1px solid var(--edge2)', 
                          borderRadius: '12px', 
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}
                      >
                        {/* Post Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--orange-d)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                              {post.avatar || (post.author ? post.author[0].toUpperCase() : 'M')}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <strong style={{ fontSize: '13px', color: 'var(--t1)' }}>{post.author}</strong>
                                <span className="badge" style={{ background: getTagColor(post.tag), color: '#fff', fontSize: '9px', padding: '1px 6px' }}>
                                  {post.tag === 'win' ? L('Achievement', 'إنجاز') : 
                                   post.tag === 'question' ? L('Question', 'سؤال') : 
                                   post.tag === 'announcement' ? L('Announcement', 'إعلان') : 
                                   L('Idea', 'فكرة')}
                                </span>
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '2px' }}>
                                {post.role} · {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : post.date}
                              </div>
                            </div>
                          </div>

                          {/* Edit / Delete action buttons */}
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {post.author === getUserName() && (
                              <button 
                                className="btn btn-ghost" 
                                style={{ padding: '4px 8px', fontSize: '11px', minWidth: 'auto' }} 
                                onClick={() => handleOpenEditPost(post)}
                                title={L('Edit Post', 'تعديل المنشور')}
                              >
                                ✏️
                              </button>
                            )}
                            {(post.author === getUserName() || canManageCommunity) && (
                              <button 
                                className="btn btn-ghost" 
                                style={{ padding: '4px 8px', fontSize: '11px', minWidth: 'auto', color: 'var(--red)' }} 
                                onClick={() => handleDeletePost(post.id)}
                                title={L('Delete Post', 'حذف المنشور')}
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Post Content */}
                        <div style={{ fontSize: '13px', color: 'var(--t1)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                          {post.content}
                        </div>

                        {/* Attached Image */}
                        {hasImage && (
                          <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--edge2)', maxWidth: '360px', marginTop: '4px' }}>
                            <img src={post.imageUrl} alt="Attached attachment" style={{ width: '100%', height: 'auto', display: 'block' }} onError={(e) => e.target.style.display = 'none'} />
                          </div>
                        )}

                        {/* Attached Link */}
                        {hasLink && (
                          <div style={{ padding: '8px 12px', background: 'var(--surface3)', borderRadius: '8px', border: '1px solid var(--edge2)' }}>
                            🔗 <a href={post.linkUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--orange)', fontSize: '12px', textDecoration: 'underline' }}>{post.linkUrl}</a>
                          </div>
                        )}

                        {/* Attached Poll */}
                        {hasPoll && (
                          <div style={{ padding: '12px 14px', background: 'var(--surface3)', borderRadius: '10px', border: '1px solid var(--edge2)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <strong style={{ fontSize: '12.5px', color: 'var(--t1)' }}>📊 {L('Community Poll / Questionnaire', 'استبيان وتصويت للجمهور')}</strong>
                            {post.poll.options.map(opt => {
                              const totalVotes = post.poll.options.reduce((sum, o) => sum + o.votes, 0) || 1;
                              const pct = Math.round((opt.votes / totalVotes) * 100);
                              const isVoted = post.poll.userVotedOptionId === opt.id;
                              
                              return (
                                <div 
                                  key={opt.id}
                                  onClick={() => handleVotePoll(post.id, opt.id)}
                                  style={{
                                    padding: '8px 12px',
                                    background: isVoted ? 'rgba(249, 115, 22, 0.08)' : 'var(--surface2)',
                                    border: isVoted ? '1px solid var(--orange)' : '1px solid var(--edge2)',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                  }}
                                >
                                  {/* Progress bar background */}
                                  <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${pct}%`, background: isVoted ? 'rgba(249, 115, 22, 0.12)' : 'rgba(255,255,255,0.02)', zIndex: 0 }} />
                                  <span style={{ zIndex: 1, fontSize: '12px', fontWeight: isVoted ? 'bold' : 'normal', color: 'var(--t1)' }}>
                                    {isVoted ? '✓ ' : ''}{opt.text}
                                  </span>
                                  <span style={{ zIndex: 1, fontSize: '11px', color: 'var(--t3)' }}>
                                    {opt.votes} votes ({pct}%)
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Post Actions & Reactions Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--edge2)', paddingTop: '10px', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => handleReaction(post.id, 'like')}
                              style={{ 
                                background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: (post.reactions || {})[getUserName()] === 'like' ? 'var(--orange)' : 'var(--t2)',
                                display: 'flex', alignItems: 'center', gap: '4px'
                              }}
                            >
                              ❤️ <span>{post.likes || 0}</span>
                            </button>
                            <button 
                              onClick={() => handleReaction(post.id, 'celebrate')}
                              style={{ 
                                background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: (post.reactions || {})[getUserName()] === 'celebrate' ? 'var(--orange)' : 'var(--t2)',
                                display: 'flex', alignItems: 'center', gap: '4px'
                              }}
                            >
                              🎉 <span>{post.celebrates || 0}</span>
                            </button>
                            <button 
                              onClick={() => handleReaction(post.id, 'insight')}
                              style={{ 
                                background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: (post.reactions || {})[getUserName()] === 'insight' ? 'var(--orange)' : 'var(--t2)',
                                display: 'flex', alignItems: 'center', gap: '4px'
                              }}
                            >
                              💡 <span>{post.insights || 0}</span>
                            </button>
                          </div>

                          <button 
                            onClick={() => setExpandedComments({ ...expandedComments, [post.id]: commentsOpen ? false : true })}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            💬 <span>{post.comments?.length || 0} {L('Comments', 'تعليقات')}</span>
                          </button>
                        </div>

                        {/* Expanded Comments Panel */}
                        {commentsOpen && (
                          <div style={{ borderTop: '1px solid var(--edge2)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            
                            {/* Comments List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {post.comments?.map((comment, cidx) => (
                                <div key={cidx} style={{ background: 'var(--surface3)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--edge2)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <strong style={{ fontSize: '12px', color: 'var(--t1)' }}>{comment.author}</strong>
                                    <small style={{ fontSize: '10px', color: 'var(--t3)' }}>{comment.date}</small>
                                  </div>
                                  <div style={{ fontSize: '12px', color: 'var(--t2)', lineHeight: 1.4 }}>
                                    {comment.content}
                                  </div>
                                </div>
                              ))}
                              {(!post.comments || post.comments.length === 0) && (
                                <div style={{ fontSize: '11px', color: 'var(--t3)', textAlign: 'center', padding: '10px' }}>
                                  {L('No comments yet. Be the first to reply!', 'لا توجد تعليقات بعد. كن أول من يعلق!')}
                                </div>
                              )}
                            </div>

                            {/* Write Comment Form */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input 
                                className="inp" 
                                placeholder={L('Write a comment reply...', 'اكتب تعليقاً أو رداً للمناقشة...')} 
                                value={commentInputs[post.id] || ''}
                                onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                style={{ flex: 1, fontSize: '12.5px', height: '36px' }}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(post.id); }}
                              />
                              <button 
                                className="btn btn-prime" 
                                onClick={() => handleAddComment(post.id)}
                                style={{ background: 'linear-gradient(135deg, var(--orange) 0%, #f43f5e 100%)', border: 'none', padding: '6px 14px', fontSize: '12px' }}
                              >
                                {L('Send', 'إرسال')}
                              </button>
                            </div>

                          </div>
                        )}

                      </div>
                    );
                  })}
                  {feed.length === 0 && (
                    <div className="empty-state" style={{ padding: '60px' }}>
                      <div className="es-icon">📰</div>
                      <div className="es-title">{L('No posts published yet', 'لا توجد منشورات')}</div>
                      <div className="es-sub">{L('Be the first to publish a post in this community channel.', 'كن أول من ينشر خبراً أو إنجازاً أو فكرة ملهمة في هذه المساحة.')}</div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 2: MEMBERS DIRECTORY */}
            {activeSubTab === 'members' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--t1)' }}>👥 {L('Community Directory', 'قائمة أعضاء وتفاعلات المجتمع')}</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                  {leaderboard.map((m, idx) => (
                    <div 
                      key={idx} 
                      className="card" 
                      style={{ 
                        padding: '16px', 
                        background: 'var(--surface2)', 
                        border: '1px solid var(--edge2)', 
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--orange-d)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                        {m.avatar || m.name[0].toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '13.5px', color: 'var(--t1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {m.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                          <span className="badge b-green" style={{ fontSize: '9px', padding: '1px 6px' }}>🔥 {m.points} {L('Points', 'نقطة تفاعل')}</span>
                          <span style={{ fontSize: '10.5px', color: 'var(--t3)' }}>Rank #{idx + 1}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: WEEKLY CHALLENGES */}
            {activeSubTab === 'challenges' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--t1)' }}>🏆 {L('Gamified Community Challenges', 'التحديات التنافسية للأسبوع')}</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {challenges.map((ch) => {
                    const hasJoined = (ch.participants || []).includes(getUserName());
                    const hasCompleted = (ch.completedUsers || []).includes(getUserName());
                    
                    return (
                      <div 
                        key={ch.id} 
                        className="card" 
                        style={{ 
                          padding: '16px', 
                          background: 'var(--surface2)', 
                          border: hasCompleted ? '1px solid var(--green)' : '1px solid var(--edge2)', 
                          borderRadius: '12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '16px',
                          opacity: hasCompleted ? 0.85 : 1
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <strong style={{ fontSize: '14px', color: 'var(--t1)' }}>{ch.title}</strong>
                            <span className="badge b-blue" style={{ fontSize: '10px' }}>+{ch.points} PTS</span>
                          </div>
                          <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--t3)', lineHeight: 1.4 }}>
                            {ch.desc}
                          </p>
                          <div style={{ fontSize: '11px', color: 'var(--orange)', fontWeight: 600, marginTop: '8px' }}>
                            🔥 {ch.participantsCount || (ch.participants || []).length} {L('participants joined this challenge', 'شخص يشارك في هذا التحدي')}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                          {hasCompleted ? (
                            <span className="badge b-green" style={{ padding: '6px 16px', fontSize: '11px' }}>✅ {L('Completed', 'مكتمل')}</span>
                          ) : (
                            <>
                              <button 
                                className="btn btn-prime"
                                style={{ 
                                  padding: '6px 14px', 
                                  fontSize: '11px', 
                                  background: hasJoined ? 'var(--surface3)' : 'linear-gradient(135deg, var(--orange) 0%, #f43f5e 100%)',
                                  border: hasJoined ? '1px solid var(--edge2)' : 'none',
                                  color: hasJoined ? 'var(--t2)' : '#fff'
                                }}
                                onClick={() => handleToggleChallenge(ch.id, false)}
                              >
                                {hasJoined ? L('Leave', 'مغادرة التحدي') : L('Join', 'انضمام')}
                              </button>
                              {hasJoined && (
                                <button 
                                  className="btn btn-prime"
                                  style={{ padding: '6px 14px', fontSize: '11px', background: 'var(--green)', border: 'none' }}
                                  onClick={() => handleToggleChallenge(ch.id, true)}
                                >
                                  ⭐ {L('Complete', 'إكمال التحدي')}
                                </button>
                              )}
                            </>
                          )}
                        </div>

                      </div>
                    );
                  })}
                  {challenges.length === 0 && (
                    <div className="empty-state" style={{ padding: '50px' }}>
                      <div className="es-icon">🏆</div>
                      <div className="es-title">{L('No active challenges', 'لا توجد تحديات حالية')}</div>
                      <div className="es-sub">{L('Weekly challenges will be posted by the admin or AI Community Manager soon.', 'سيتم تحديث التحديات الأسبوعية للمجموعات بواسطة المشرف قريباً.')}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: LIBRARY */}
            {activeSubTab === 'library' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--t1)' }}>📚 {L('Resource Library', 'مكتبة مصادر وملفات الأعضاء')}</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {library.map((lib) => (
                    <div 
                      key={lib.id} 
                      className="card" 
                      style={{ 
                        padding: '16px', 
                        background: 'var(--surface2)', 
                        border: '1px solid var(--edge2)', 
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '10px'
                      }}
                    >
                      <div>
                        <span className="badge b-blue" style={{ fontSize: '9px', padding: '1px 6px' }}>{lib.category}</span>
                        <strong style={{ fontSize: '13px', color: 'var(--t1)', display: 'block', marginTop: '6px' }}>{lib.title}</strong>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--edge2)', paddingTop: '8px', marginTop: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--t3)' }}>⬇️ {lib.downloads || 0} downloads</span>
                        <a 
                          href={lib.downloadUrl} 
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-ghost" 
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                        >
                          {L('Download', 'تحميل الملف')}
                        </a>
                      </div>
                    </div>
                  ))}
                  {library.length === 0 && (
                    <div className="card" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--t3)' }}>
                      {L('No assets uploaded yet.', 'مكتبة الملفات لا تحتوي على ملفات حالياً.')}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: ANALYTICS, LEADERBOARD */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Today's Stats card */}
            <div className="card" style={{ background: 'var(--surface2)', border: '1px solid var(--edge2)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--orange)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>
                📊 {L('Today\'s Space Stats', 'إحصائيات المجموعة اليوم')}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px', color: 'var(--t2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--t3)' }}>👥 {L('Active Members', 'أعضاء نشطون')}</span>
                  <span style={{ fontWeight: 'bold' }}>{leaderboard.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--t3)' }}>📝 {L('Posts Today', 'منشورات اليوم')}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--green)' }}>{getPostsTodayCount()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--t3)' }}>📈 {L('Engagement Rate', 'معدل التفاعل')}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--blue)' }}>{getEngagementRate()}%</span>
                </div>
              </div>
            </div>

            {/* Leaderboard Card */}
            <div className="card" style={{ background: 'var(--surface2)', border: '1px solid var(--edge2)', padding: '16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--orange)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>
                🏆 {L('Community Leaderboard', 'المتصدرون الأكثر نشاطاً')}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {leaderboard.slice(0, 5).map((user, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '50%', 
                      background: index === 0 ? 'rgba(249,115,22,0.15)' : 'var(--surface3)', 
                      color: index === 0 ? 'var(--orange)' : 'var(--t2)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '10px', 
                      fontWeight: 'bold' 
                    }}>
                      {user.avatar || user.name[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, color: 'var(--t1)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.name}
                    </div>
                    <span className="badge b-green" style={{ fontSize: '8.5px', padding: '1px 5px' }}>{user.points} pts</span>
                  </div>
                ))}
                {leaderboard.length === 0 && (
                  <div style={{ fontSize: '11px', color: 'var(--t3)', textAlign: 'center' }}>
                    {L('No engagement points awarded yet.', 'لا توجد نقاط تفاعل بعد.')}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div style={{ padding: '80px 20px', background: 'var(--surface2)', borderRadius: '16px', border: '1px solid var(--edge2)', textAlign: 'center' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px' }}>👥</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--t1)' }}>
            {L('No Active Community Group Select', 'لم يتم اختيار مجتمع نشط')}
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--t3)', margin: '8px 0 16px', lineHeight: 1.5 }}>
            {canManageCommunity ? L('Please click "+ Create Community" in the header to initialize your first group channel.', 'يرجى الضغط على زر "+ إنشاء مجتمع جديد" بالأعلى لتهيئة أول مجموعة تفاعل خاصة بك.') : L('Ask your workspace admin to register the first community space.', 'يرجى من مشرف الحساب إنشاء وتهيئة أول مجتمع تفاعلي للبدء.')}
          </p>
        </div>
      )}

      {/* CREATE NEW SPACE MODAL */}
      {isAddSpaceOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setIsAddSpaceOpen(false); }}>
          <div className="modal-box" style={{ maxWidth: '440px', padding: '24px', boxSizing: 'border-box' }}>
            <div className="modal-close" onClick={() => setIsAddSpaceOpen(false)}>✕</div>
            <div>
              <div style={{ fontFamily: 'var(--ff)', fontSize: '16px', fontWeight: 800, marginBottom: '14px', color: 'var(--t1)' }}>
                ➕ {L('Create New Community Channel', 'إنشاء قناة ومجتمع تفاعلي جديد')}
              </div>
              <form onSubmit={handleAddSpace}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Community Space Name *', 'اسم القناة والمجموعة *')}</label>
                    <input className="inp" required placeholder="e.g. VIP Mastermind" value={newSpaceName} onChange={(e) => setNewSpaceName(e.target.value)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Access Type', 'الخصوصية / الدخول')}</label>
                      <select className="inp" value={newSpaceType} onChange={(e) => setNewSpaceType(e.target.value)}>
                        <option value="Paid">🔓 Paid (مدفوع)</option>
                        <option value="Free">🔓 Free (مفتوح)</option>
                        <option value="Private">🔒 Private (خاص)</option>
                      </select>
                    </div>
                    {newSpaceType === 'Paid' && (
                      <div>
                        <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Price Category', 'فئة السعر')}</label>
                        <input className="inp" placeholder="e.g. $97" value={newSpacePrice} onChange={(e) => setNewSpacePrice(e.target.value)} />
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsAddSpaceOpen(false)}>
                    {L('Cancel', 'إلغاء')}
                  </button>
                  <button type="submit" className="btn btn-prime" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, var(--orange) 0%, #f43f5e 100%)', border: 'none' }}>
                    {L('Create Space', 'إنشاء المجموعة')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW CHALLENGE MODAL */}
      {isAddChallengeOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setIsAddChallengeOpen(false); }}>
          <div className="modal-box" style={{ maxWidth: '440px', padding: '24px', boxSizing: 'border-box' }}>
            <div className="modal-close" onClick={() => setIsAddChallengeOpen(false)}>✕</div>
            <div>
              <div style={{ fontFamily: 'var(--ff)', fontSize: '16px', fontWeight: 800, marginBottom: '14px', color: 'var(--t1)' }}>
                ➕ {L('Create New Challenge', 'إنشاء تحدي جديد للمجتمع')}
              </div>
              <form onSubmit={handleAddChallenge}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Challenge Title *', 'عنوان التحدي *')}</label>
                    <input className="inp" required placeholder="e.g. 30-Day Daily Posting" value={cTitle} onChange={(e) => setCTitle(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Award Points *', 'نقاط الجائزة *')}</label>
                    <input className="inp" type="number" required value={cPoints} onChange={(e) => setCPoints(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Description', 'الوصف / متطلبات التحدي')}</label>
                    <textarea className="inp" rows="3" placeholder="Explain rules..." value={cDesc} onChange={(e) => setCDesc(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsAddChallengeOpen(false)}>
                    {L('Cancel', 'إلغاء')}
                  </button>
                  <button type="submit" className="btn btn-prime" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, var(--orange) 0%, #f43f5e 100%)', border: 'none' }}>
                    {L('Create Challenge', 'حفظ التحدي')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW LIBRARY RESOURCE MODAL */}
      {isAddLibraryOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setIsAddLibraryOpen(false); }}>
          <div className="modal-box" style={{ maxWidth: '440px', padding: '24px', boxSizing: 'border-box' }}>
            <div className="modal-close" onClick={() => setIsAddLibraryOpen(false)}>✕</div>
            <div>
              <div style={{ fontFamily: 'var(--ff)', fontSize: '16px', fontWeight: 800, marginBottom: '14px', color: 'var(--t1)' }}>
                ➕ {L('Upload New File / Resource', 'إضافة ملف أو مصدر جديد للمكتبة')}
              </div>
              <form onSubmit={handleAddLibrary}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('File Title *', 'اسم الملف أو المصدر *')}</label>
                    <input className="inp" required placeholder="e.g. 30-Day Content Roadmap Blueprint" value={lTitle} onChange={(e) => setLTitle(e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Resource Category *', 'التصنيف *')}</label>
                    <select className="inp" value={lCategory} onChange={(e) => setLCategory(e.target.value)}>
                      <option value="PDF">Blueprint / PDF Document</option>
                      <option value="Template">Notion / Sheets Template</option>
                      <option value="Video">Video Training Tutorial</option>
                      <option value="Blueprint">Checklist / Blueprint</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Download URL', 'رابط التحميل أو المشاهدة')}</label>
                    <input className="inp" placeholder="e.g. https://link-to-file.com" value={lDownloadUrl} onChange={(e) => setLDownloadUrl(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsAddLibraryOpen(false)}>
                    {L('Cancel', 'إلغاء')}
                  </button>
                  <button type="submit" className="btn btn-prime" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, var(--orange) 0%, #f43f5e 100%)', border: 'none' }}>
                    {L('Add Resource', 'حفظ وإضافة للمكتبة')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT POST MODAL */}
      {isEditPostOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') setIsEditPostOpen(false); }}>
          <div className="modal-box" style={{ maxWidth: '460px', padding: '24px', boxSizing: 'border-box' }}>
            <div className="modal-close" onClick={() => setIsEditPostOpen(false)}>✕</div>
            <div>
              <div style={{ fontFamily: 'var(--ff)', fontSize: '16px', fontWeight: 800, marginBottom: '14px', color: 'var(--t1)' }}>
                ✏️ {L('Edit Community Post', 'تعديل المنشور')}
              </div>
              <form onSubmit={handleSaveEditPost}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Category Tag *', 'تصنيف المنشور *')}</label>
                    <select 
                      className="inp" 
                      value={editPostTag}
                      onChange={(e) => setEditPostTag(e.target.value)}
                    >
                      <option value="win">🏆 {L('Win / Achievement', 'إنجاز')}</option>
                      <option value="question">❓ {L('Question', 'سؤال')}</option>
                      <option value="idea">💡 {L('Idea', 'فكرة')}</option>
                      <option value="announcement">📢 {L('Announcement', 'إعلان')}</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Post Content *', 'محتوى المنشور *')}</label>
                    <textarea 
                      className="inp" 
                      rows="4" 
                      required
                      value={editPostText} 
                      onChange={(e) => setEditPostText(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Image Attachment', 'مرفق الصورة')}</label>
                    <div style={{ padding: '10px', background: 'var(--surface3)', borderRadius: '8px', border: '1px solid var(--edge2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                          type="file" 
                          accept="image/*"
                          id="edit-post-image-file"
                          style={{ display: 'none' }}
                          onChange={(e) => setEditPostFile(e.target.files[0])}
                          disabled={editUploading}
                        />
                        <label 
                          htmlFor="edit-post-image-file"
                          style={{ 
                            background: 'var(--surface2)', 
                            border: '1px solid var(--edge2)', 
                            padding: '5px 10px', 
                            borderRadius: '6px', 
                            cursor: 'pointer',
                            fontSize: '11px',
                            color: 'var(--t1)'
                          }}
                        >
                          📁 {editPostFile ? L('Change Photo', 'تغيير الصورة') : L('Select Photo', 'اختر صورة')}
                        </label>
                        <span style={{ fontSize: '11px', color: 'var(--t2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {editPostFile ? editPostFile.name : (editPostImageUrl ? L('Has current image', 'يوجد صورة للمنشور حالياً') : L('No image', 'لا توجد صورة'))}
                        </span>
                      </div>
                      {editUploading && (
                        <div style={{ marginTop: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--orange)', marginBottom: '3px' }}>
                            <span>{L('Uploading...', 'جاري الرفع...')}</span>
                            <span>{editUploadProgress}%</span>
                          </div>
                          <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '1.5px', overflow: 'hidden' }}>
                            <div style={{ width: `${editUploadProgress}%`, height: '100%', background: 'var(--orange)' }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Link URL (Optional)', 'الرابط (اختياري)')}</label>
                    <input className="inp" value={editPostLinkUrl} onChange={(e) => setEditPostLinkUrl(e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsEditPostOpen(false)}>
                    {L('Cancel', 'إلغاء')}
                  </button>
                  <button type="submit" className="btn btn-prime" style={{ flex: 1, justifyContent: 'center', background: 'linear-gradient(135deg, var(--orange) 0%, #f43f5e 100%)', border: 'none' }}>
                    {L('Save Changes', 'حفظ التعديلات')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
