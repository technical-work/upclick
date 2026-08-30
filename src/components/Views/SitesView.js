'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { useAuth } from '../../context/AuthContext';
import BuilderWorkspace from '../builder/BuilderWorkspace';
import ElementRenderer from '../builder/ElementRenderer';
import DomainSettings from '../sites/DomainSettings';
import StoreListView from '../sites/stores/StoreListView';
import StoreDetailView from '../sites/stores/StoreDetailView';
import { StorePreviewContext } from '../sites/stores/StorePreviewContext';
import { defaultStepCanvas, DEFAULT_PAGE } from '@/lib/builder/elementRegistry';
import { connectFunnelDomain, getProductionUrls, prepareStoreForPublish, publishFunnelPublic, publishStorePublic } from '@/lib/sites/publicSite';
import {
  clearLegacySiteKeys,
  funnelsStorageKey,
  readJsonList,
  listsHaveSameItems,
  sitesForUser,
  stampSiteOwner,
  storesStorageKey,
  writeJsonList
} from '@/lib/sites/userSitesScope';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  ArrowLeft, 
  Settings, 
  ExternalLink, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  ChevronRight, 
  Mail, 
  Share2, 
  Eye, 
  Link2,
  Store as StoreIcon,
  Globe,
  Layout,
  Video,
  FileText,
  MessageSquare,
  QrCode,
  Layers
} from 'lucide-react';

const EMPTY_CART = [];
const noop = () => {};

export default function SitesView() {
  const { lang, GC, saveGC, showToast } = useBusiness();
  const { user } = useAuth();
  const accountUid = user?.uid || '';
  const ownerUid = accountUid;
  const isRtl = lang === 'ar';
  const persistTimer = useRef(null);
  const storePersistTimer = useRef(null);
  const [storeForceTab, setStoreForceTab] = useState('pages');

  const [activeSubTab, setActiveSubTab] = useState('stores'); // Defaults to stores or funnels
  const [selectedFunnel, setSelectedFunnel] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [detailTab, setDetailTab] = useState('steps');
  const [stepOverviewTab, setStepOverviewTab] = useState('overview');
  
  // Builder state
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [builderStoreMode, setBuilderStoreMode] = useState(false);
  const [storeActivePageIdx, setStoreActivePageIdx] = useState(0);

  const [copiedKey, setCopiedKey] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createOption, setCreateOption] = useState('blank'); // 'blank' | 'ai' | 'templates'
  const [newFunnelName, setNewFunnelName] = useState('');

  // Add Step Modal
  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);
  const [newStepName, setNewStepName] = useState('');
  const [newStepPath, setNewStepPath] = useState('');
  const [newStepType, setNewStepType] = useState('landing');

  // Active step index inside detail builder
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Load funnels / stores for the signed-in user only
  const [funnels, setFunnels] = useState([]);
  const [stores, setStores] = useState([]);
  const loadedAccountUid = useRef('');

  const filteredFunnels = useMemo(() => {
    return sitesForUser(funnels, accountUid).filter((f) => {
      const q = (searchQuery || '').toLowerCase();
      return !q || (f.name && f.name.toLowerCase().includes(q));
    });
  }, [funnels, searchQuery, accountUid]);

  useEffect(() => {
    clearLegacySiteKeys();
    if (!accountUid) {
      setFunnels([]);
      setStores([]);
      setSelectedFunnel(null);
      setSelectedStore(null);
      loadedAccountUid.current = '';
      return;
    }

    const userChanged = loadedAccountUid.current !== accountUid;
    if (userChanged) {
      setSelectedFunnel(null);
      setSelectedStore(null);
      loadedAccountUid.current = accountUid;
    }

    const gcBelongsToAccount = GC?._accountUid === accountUid;
    const scopedFunnels = sitesForUser(readJsonList(funnelsStorageKey(accountUid)), accountUid);
    const scopedStores = sitesForUser(readJsonList(storesStorageKey(accountUid)), accountUid);
    const gcFunnels = gcBelongsToAccount
      ? sitesForUser(GC?.upclickFunnels?.funnels, accountUid)
      : [];
    const gcStores = gcBelongsToAccount
      ? sitesForUser(GC?.upclickStores?.stores, accountUid)
      : [];

    const nextFunnels = gcFunnels.length ? gcFunnels : scopedFunnels;
    const nextStores = gcStores.length ? gcStores : scopedStores;

    setFunnels((prev) => {
      if (userChanged) return nextFunnels;
      const prevMine = sitesForUser(prev, accountUid);
      if (!prevMine.length && nextFunnels.length) return nextFunnels;
      if (listsHaveSameItems(prev, prevMine)) return prev;
      return prevMine;
    });
    setStores((prev) => {
      if (userChanged) return nextStores;
      const prevMine = sitesForUser(prev, accountUid);
      if (!prevMine.length && nextStores.length) return nextStores;
      if (listsHaveSameItems(prev, prevMine)) return prev;
      return prevMine;
    });
  }, [accountUid, GC?._accountUid, GC?.upclickFunnels?.funnels, GC?.upclickStores?.stores]);

  const saveFunnels = (updatedList) => {
    if (!accountUid) return;
    const mine = (updatedList || []).map((item) => stampSiteOwner(item, accountUid));
    setFunnels(mine);
    writeJsonList(funnelsStorageKey(accountUid), mine);
    clearLegacySiteKeys();
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      saveGC({
        ...GC,
        upclickFunnels: {
          funnels: mine
        }
      });
    }, 700);
  };

  const saveStores = (updatedList) => {
    if (!accountUid) return;
    const mine = (updatedList || []).map((item) => stampSiteOwner(item, accountUid));
    setStores(mine);
    writeJsonList(storesStorageKey(accountUid), mine);
    clearLegacySiteKeys();
    if (storePersistTimer.current) clearTimeout(storePersistTimer.current);
    storePersistTimer.current = setTimeout(() => {
      saveGC({
        ...GC,
        upclickStores: {
          stores: mine
        }
      });
    }, 700);
  };

  // Sync selectedFunnel
  useEffect(() => {
    if (!selectedFunnel) return;
    const match = funnels.find((f) => f.id === selectedFunnel.id);
    if (match && match !== selectedFunnel) setSelectedFunnel(match);
  }, [funnels, selectedFunnel]);

  // Sync selectedStore
  useEffect(() => {
    if (!selectedStore) return;
    const match = stores.find((s) => s.id === selectedStore.id);
    if (match && match !== selectedStore) setSelectedStore(match);
  }, [stores, selectedStore]);

  // Store Management Handlers
  const handleCreateStore = (newStore) => {
    const ownedStore = stampSiteOwner(newStore, accountUid);
    const nextStores = [ownedStore, ...stores];
    saveStores(nextStores);
    setSelectedStore(ownedStore);
    if (showToast) showToast(isRtl ? 'تم إنشاء المتجر بنجاح' : 'Store created successfully');
    (async () => {
      try {
        const publishedStore = prepareStoreForPublish(ownedStore);
        await publishStorePublic({ store: publishedStore, ownerUid: accountUid, defaultPageIdx: 0 });
        saveStores([publishedStore, ...stores.filter((s) => s.id !== ownedStore.id)]);
        setSelectedStore(publishedStore);
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        if (showToast) {
          showToast(isRtl
            ? `المتجر منشور: ${origin}/s/${publishedStore.id}`
            : `Store is live at ${origin}/s/${publishedStore.id}`);
        }
      } catch (err) {
        console.error(err);
        if (showToast) showToast(isRtl ? 'تم الحفظ. اضغط «نشر المتجر» لتفعيل الرابط العام.' : 'Saved. Click Publish store to activate the public link.');
      }
    })();
  };

  const handleDuplicateStore = (storeId) => {
    const target = stores.find(s => s.id === storeId);
    if (!target) return;
    const cloned = {
      ...target,
      id: 'store_' + Date.now(),
      name: `${target.name} (Copy)`,
      ownerUid: accountUid,
      published: false,
      publishedAt: null,
      domain: '',
      domainStatus: '',
      lastUpdated: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
    };
    const nextStores = [cloned, ...stores];
    saveStores(nextStores);
    if (showToast) showToast(isRtl ? 'تم تكرار المتجر' : 'Store duplicated');
  };

  const handleDeleteStore = (storeId) => {
    if (confirm(isRtl ? 'هل أنت متأكد من حذف هذا المتجر؟' : 'Are you sure you want to delete this store?')) {
      const nextStores = stores.filter(s => s.id !== storeId);
      saveStores(nextStores);
      if (selectedStore?.id === storeId) {
        setSelectedStore(null);
      }
      if (showToast) showToast(isRtl ? 'تم حذف المتجر' : 'Store deleted');
    }
  };

  const handleUpdateStore = (updatedStore) => {
    const owned = stampSiteOwner(updatedStore, accountUid);
    const prev = stores.find((s) => s.id === owned.id);
    if (prev === owned) {
      setSelectedStore(owned);
      return;
    }
    const nextStores = stores.map(s => s.id === owned.id ? owned : s);
    saveStores(nextStores);
    setSelectedStore(owned);
    const productsChanged = JSON.stringify(prev?.products || []) !== JSON.stringify(owned.products || []);
    const settingsChanged = JSON.stringify(prev?.settings || {}) !== JSON.stringify(owned.settings || {});
    if (owned.published && (productsChanged || settingsChanged)) {
      publishStorePublic({ store: owned, ownerUid: accountUid, defaultPageIdx: storeActivePageIdx }).catch((err) => console.error(err));
    }
  };

  // Funnels Handlers
  const handleCreateFunnel = () => {
    if (!accountUid) return;
    const title = newFunnelName.trim() || (createOption === 'ai' ? 'AI Generated Funnel' : 'New Sales Funnel');
    const nowStr = new Date().toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const newId = 'f_' + Date.now();
    const newFunnel = {
      id: newId,
      name: title,
      lastUpdated: nowStr,
      ownerUid: accountUid,
      steps: createOption === 'blank' ? [] : [
        { 
          id: 's1', 
          name: 'page1', 
          path: '/page1', 
          type: 'landing', 
          views: 0, 
          optins: 0,
          page: { ...DEFAULT_PAGE },
          canvas: defaultStepCanvas('Welcome to ' + title)
        }
      ]
    };

    const nextFunnels = [newFunnel, ...funnels];
    saveFunnels(nextFunnels);

    setIsCreateModalOpen(false);
    setNewFunnelName('');
    setSelectedFunnel(newFunnel);
    setActiveStepIndex(0);
  };

  const handleAddStep = () => {
    if (!selectedFunnel) return;
    const stepName = newStepName.trim() || `page${(selectedFunnel.steps?.length || 0) + 1}`;
    const path = newStepPath.trim() ? (newStepPath.startsWith('/') ? newStepPath : '/' + newStepPath) : '/' + stepName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newStep = {
      id: 'step_' + Date.now(),
      name: stepName,
      path: path,
      type: newStepType,
      views: 0,
      optins: 0,
      page: { ...DEFAULT_PAGE },
      canvas: defaultStepCanvas(stepName)
    };

    const updatedSteps = [...(selectedFunnel.steps || []), newStep];
    const updatedFunnel = { ...selectedFunnel, steps: updatedSteps };
    
    const nextFunnels = funnels.map(f => f.id === selectedFunnel.id ? updatedFunnel : f);
    saveFunnels(nextFunnels);

    setIsAddStepModalOpen(false);
    setNewStepName('');
    setNewStepPath('');
    setActiveStepIndex(updatedSteps.length - 1);
  };

  const handleDeleteStep = (stepIdx) => {
    if (!selectedFunnel) return;
    if (confirm(isRtl ? 'هل أنت تأكد من حذف هذه الخطوة؟' : 'Are you sure you want to delete this funnel step?')) {
      const updatedSteps = selectedFunnel.steps.filter((_, idx) => idx !== stepIdx);
      const updatedFunnel = { ...selectedFunnel, steps: updatedSteps };

      const nextFunnels = funnels.map(f => f.id === selectedFunnel.id ? updatedFunnel : f);
      saveFunnels(nextFunnels);

      setActiveStepIndex(Math.max(0, stepIdx - 1));
    }
  };

  const handleCloneStep = (stepIdx) => {
    if (!selectedFunnel || !selectedFunnel.steps[stepIdx]) return;
    const target = selectedFunnel.steps[stepIdx];
    const cloned = {
      ...target,
      id: 'step_' + Date.now(),
      name: `${target.name} (Copy)`,
      path: `${target.path}-copy`
    };

    const updatedSteps = [...selectedFunnel.steps];
    updatedSteps.splice(stepIdx + 1, 0, cloned);
    const updatedFunnel = { ...selectedFunnel, steps: updatedSteps };

    const nextFunnels = funnels.map(f => f.id === selectedFunnel.id ? updatedFunnel : f);
    saveFunnels(nextFunnels);

    setActiveStepIndex(stepIdx + 1);
  };

  const getActiveStep = () => {
    if (!selectedFunnel || !selectedFunnel.steps) return null;
    return selectedFunnel.steps[activeStepIndex] || selectedFunnel.steps[0] || null;
  };

  const updateActiveStep = (patch) => {
    if (!selectedFunnel) return;
    const step = getActiveStep();
    if (!step) return;

    const updatedStep = { ...step, ...patch };
    const updatedSteps = selectedFunnel.steps.map((s, idx) => idx === activeStepIndex ? updatedStep : s);
    const updatedFunnel = { ...selectedFunnel, steps: updatedSteps };
    const nextFunnels = funnels.map(f => f.id === selectedFunnel.id ? updatedFunnel : f);
    saveFunnels(nextFunnels);
  };

  const updateActiveStepCanvas = (newCanvas) => {
    updateActiveStep({ canvas: newCanvas });
  };

  // Store Page Builder helpers
  const updateActiveStorePage = (patch) => {
    if (!selectedStore || !selectedStore.pages) return;
    const targetPage = selectedStore.pages[storeActivePageIdx] || selectedStore.pages[0];
    if (!targetPage) return;

    const updatedPage = { ...targetPage, ...patch };
    const updatedPages = selectedStore.pages.map((p, idx) => idx === storeActivePageIdx ? updatedPage : p);
    const updatedStore = { ...selectedStore, pages: updatedPages };
    handleUpdateStore(updatedStore);
  };

  const updateActiveStorePageCanvas = (newCanvas) => {
    updateActiveStorePage({ canvas: newCanvas });
  };

  const handlePublishStorePage = async () => {
    if (!selectedStore?.pages) return;
    const updatedStore = prepareStoreForPublish(selectedStore);
    handleUpdateStore(updatedStore);
    try {
      await publishStorePublic({ store: updatedStore, ownerUid, defaultPageIdx: storeActivePageIdx });
      if (updatedStore.domain) {
        await connectFunnelDomain({
          funnelId: updatedStore.id,
          ownerUid,
          host: updatedStore.domain,
          previousHost: ''
        });
      }
      if (showToast) showToast(isRtl ? 'تم نشر المتجر على رابط الإنتاج' : 'Store published. The live link now works on any device.');
      return updatedStore;
    } catch (err) {
      console.error(err);
      if (showToast) showToast(isRtl ? 'حُفظ محلياً، لكن النشر العام فشل. تحقق من تسجيل الدخول.' : 'Saved locally, but public publish failed. Sign in and try again.');
      throw err;
    }
  };

  const getPageUrls = (funnel, stepIdx) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return getProductionUrls({ origin, funnel, stepIdx });
  };

  const patchSelectedFunnel = (patch) => {
    if (!selectedFunnel) return;
    const updatedFunnel = { ...selectedFunnel, ...patch };
    const nextFunnels = funnels.map((f) => f.id === selectedFunnel.id ? updatedFunnel : f);
    saveFunnels(nextFunnels);
  };

  const copyUrl = async (key, url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 2000);
    } catch (e) {
      window.prompt(isRtl ? 'انسخ الرابط' : 'Copy this URL', url);
    }
  };

  const openUrl = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePublishStep = async () => {
    const step = getActiveStep();
    if (!step || !selectedFunnel) return;
    const publishedPatch = {
      published: true,
      publishedAt: new Date().toISOString(),
      publishedCanvas: JSON.parse(JSON.stringify(step.canvas || [])),
      publishedPage: { ...DEFAULT_PAGE, ...(step.page || {}) }
    };
    const updatedStep = { ...step, ...publishedPatch };
    const updatedSteps = selectedFunnel.steps.map((s, idx) => idx === activeStepIndex ? updatedStep : s);
    const updatedFunnel = { ...selectedFunnel, steps: updatedSteps };
    const nextFunnels = funnels.map((f) => f.id === selectedFunnel.id ? updatedFunnel : f);
    saveFunnels(nextFunnels);
    try {
      await publishFunnelPublic({ funnel: updatedFunnel, ownerUid, defaultStepIdx: activeStepIndex });
      if (updatedFunnel.domain) {
        await connectFunnelDomain({
          funnelId: updatedFunnel.id,
          ownerUid,
          host: updatedFunnel.domain,
          previousHost: ''
        });
      }
      if (showToast) showToast(isRtl ? 'تم نشر الصفحة على رابط الإنتاج' : 'Page published to the production URL');
    } catch (err) {
      console.error(err);
      if (showToast) showToast(isRtl ? 'حُفظ محلياً، لكن النشر العام فشل. تحقق من تسجيل الدخول.' : 'Saved locally, but public publish failed.');
    }
  };

  const renderUrlCard = (label, url, key) => (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--t2)', marginBottom: 8, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input readOnly value={url} className="inp" style={{ flex: 1, fontSize: 12, minWidth: 0 }} />
        <button type="button" onClick={() => copyUrl(key, url)} className="btn btn-ghost" style={{ padding: '8px 10px', color: copiedKey === key ? '#16a34a' : undefined }}>
          {copiedKey === key ? 'Copied' : <Copy size={15} />}
        </button>
        <button type="button" onClick={() => openUrl(url)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ExternalLink size={15} />
        </button>
      </div>
    </div>
  );

  // Sub-tabs list matching UpKlick / GoHighLevel
  const subTabs = [
    { key: 'sites', label: isRtl ? 'المواقع' : 'Sites' },
    { key: 'funnels', label: isRtl ? 'الفانلز' : 'Funnels' },
    { key: 'websites', label: isRtl ? 'المواقع الإلكترونية' : 'Websites' },
    { key: 'stores', label: isRtl ? 'المتاجر' : 'Stores', highlight: true },
    { key: 'webinars', label: isRtl ? 'الويبينارات' : 'Webinars' },
    { key: 'analytics', label: isRtl ? 'التحليلات' : 'Analytics' },
    { key: 'blogs', label: isRtl ? 'المدونات' : 'Blogs' },
    { key: 'wordpress', label: isRtl ? 'ووردبريس' : 'WordPress' },
    { key: 'client-portal', label: isRtl ? 'بوابة العملاء' : 'Client Portal' },
    { key: 'forms', label: isRtl ? 'النماذج' : 'Forms' },
    { key: 'surveys', label: isRtl ? 'الاستبيانات' : 'Surveys' },
    { key: 'quizzes', label: isRtl ? 'الاختبارات' : 'Quizzes' },
    { key: 'chat-widget', label: isRtl ? 'ويدجت الدردشة' : 'Chat Widget' },
    { key: 'qr-codes', label: isRtl ? 'رموز QR' : 'QR Codes' }
  ];

  const builderFunnel = useMemo(() => {
    if (builderStoreMode && selectedStore) {
      return {
        id: selectedStore.id,
        name: selectedStore.name,
        steps: selectedStore.pages
      };
    }
    return selectedFunnel;
  }, [builderStoreMode, selectedStore, selectedFunnel]);

  const builderStorePreview = useMemo(() => {
    if (!builderStoreMode || !selectedStore) return null;
    return {
      store: selectedStore,
      isDraft: true,
      cart: EMPTY_CART,
      cartCount: 0,
      catalogQuery: '',
      setCatalogQuery: noop,
      addToCart: noop,
      setItemQty: noop,
      clearCart: noop,
      navigateTo: noop
    };
  }, [builderStoreMode, selectedStore]);

  return (
    <div style={{ paddingBottom: '50px', animation: 'fadeIn 0.3s ease' }}>
      
      {/* Builder Workspace Modal */}
      {isBuilderOpen && (
        <StorePreviewContext.Provider value={builderStorePreview}>
        <BuilderWorkspace
          funnel={builderFunnel}
          stepIndex={builderStoreMode ? storeActivePageIdx : activeStepIndex}
          onChangeStep={builderStoreMode ? setStoreActivePageIdx : setActiveStepIndex}
          onClose={() => {
            setIsBuilderOpen(false);
            setBuilderStoreMode(false);
          }}
          onUpdateCanvas={(newCanvas) => {
            if (builderStoreMode && selectedStore) {
              updateActiveStorePageCanvas(newCanvas);
            } else {
              updateActiveStepCanvas(newCanvas);
            }
          }}
          onUpdateStep={(patch) => {
            if (builderStoreMode && selectedStore) {
              updateActiveStorePage(patch);
            } else {
              updateActiveStep(patch);
            }
          }}
          onPublish={builderStoreMode ? handlePublishStorePage : handlePublishStep}
          isStore={builderStoreMode}
        />
        </StorePreviewContext.Provider>
      )}

      {/* Main Sub-Navigation Bar matching Screenshot 1 */}
      <div style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--edge)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflowX: 'auto',
        marginBottom: '24px',
        scrollbarWidth: 'none'
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', whiteSpace: 'nowrap' }}>
          {subTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveSubTab(tab.key);
                if (tab.key !== 'funnels' && tab.key !== 'websites') setSelectedFunnel(null);
                if (tab.key !== 'stores') setSelectedStore(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeSubTab === tab.key ? '2px solid var(--a)' : '2px solid transparent',
                color: activeSubTab === tab.key ? 'var(--a)' : 'var(--t2)',
                padding: '14px 4px',
                fontWeight: activeSubTab === tab.key ? '700' : '500',
                fontSize: '13.5px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {tab.label}
              {tab.key === 'stores' && (
                <span style={{
                  background: 'rgba(37, 99, 235, 0.12)',
                  color: '#2563eb',
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '1px 5px',
                  borderRadius: '4px'
                }}>
                  {stores.length}
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            if (activeSubTab === 'stores' && selectedStore) {
              setStoreForceTab('settings');
            } else {
              alert(isRtl ? 'إعدادات المواقع والفانلز' : 'Sites & Funnels Settings');
            }
          }}
          style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer', padding: '8px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
        >
          <Settings size={18} />
        </button>
      </div>

      {/* RENDER STORES VIEW WHEN SUBTAB IS 'stores' */}
      {activeSubTab === 'stores' ? (
        selectedStore ? (
          <StoreDetailView
            store={selectedStore}
            isRtl={isRtl}
            ownerUid={ownerUid}
            showToast={showToast}
            initialTab={storeForceTab}
            onBack={() => { setSelectedStore(null); setStoreForceTab('pages'); }}
            onOpenBuilderForPage={(pageIdx) => {
              setBuilderStoreMode(true);
              setStoreActivePageIdx(pageIdx);
              setIsBuilderOpen(true);
            }}
            onUpdateStore={handleUpdateStore}
            onPublishStore={handlePublishStorePage}
          />
        ) : (
          <StoreListView
            stores={stores}
            isRtl={isRtl}
            onSelectStore={(s) => { setStoreForceTab('pages'); setSelectedStore(s); }}
            onCreateStore={handleCreateStore}
            onDuplicateStore={handleDuplicateStore}
            onDeleteStore={handleDeleteStore}
          />
        )
      ) : (
        /* RENDER FUNNELS & WEBSITES VIEW */
        selectedFunnel ? (
          <div style={{ padding: '0 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={() => setSelectedFunnel(null)} style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', color: 'var(--t1)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600' }}>
                  <ArrowLeft size={16} />
                  <span>{isRtl ? 'رجوع' : 'Back'}</span>
                </button>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: 'var(--t1)' }}>{selectedFunnel.name}</h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => {
                    const urls = getPageUrls(selectedFunnel, activeStepIndex);
                    const step = getActiveStep();
                    const url = step?.published ? urls.published : urls.saved;
                    copyUrl('share', url);
                    openUrl(url);
                  }}
                >
                  <Share2 size={14} /><span>{copiedKey === 'share' ? 'Copied' : 'Share'}</span>
                </button>
                <button type="button" onClick={() => setDetailTab('settings')} className="btn btn-ghost" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><Settings size={14} /></button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--edge)', marginBottom: '24px' }}>
              {[{ key: 'steps', label: isRtl ? 'الخطوات' : 'Steps' }, { key: 'stats', label: isRtl ? 'الإحصائيات' : 'Stats' }, { key: 'sales', label: isRtl ? 'المبيعات' : 'Sales' }, { key: 'security', label: isRtl ? 'الأمان' : 'Security' }, { key: 'events', label: isRtl ? 'الأحداث' : 'Events' }, { key: 'settings', label: isRtl ? 'الإعدادات' : 'Settings' }].map(tab => (
                <button key={tab.key} onClick={() => setDetailTab(tab.key)} style={{ background: 'none', border: 'none', borderBottom: detailTab === tab.key ? '2px solid var(--a)' : '2px solid transparent', color: detailTab === tab.key ? 'var(--a)' : 'var(--t2)', padding: '10px 4px', fontWeight: detailTab === tab.key ? '700' : '500', fontSize: '14px', cursor: 'pointer' }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {detailTab === 'steps' && (
              <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', minHeight: '500px' }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--t1)', fontWeight: '700', fontSize: '14px', marginBottom: '16px' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--green)' }} />
                      <span>{isRtl ? 'خطوات الفانل' : 'Funnel steps'}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedFunnel.steps?.map((step, idx) => (
                        <div key={step.id} onClick={() => setActiveStepIndex(idx)} style={{ background: activeStepIndex === idx ? 'rgba(37, 99, 235, 0.12)' : 'var(--surface2)', border: activeStepIndex === idx ? '1px solid var(--a)' : '1px solid var(--edge)', borderRadius: '8px', padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Mail size={16} style={{ color: activeStepIndex === idx ? 'var(--a)' : 'var(--t2)' }} />
                          <span style={{ fontSize: '13.5px', fontWeight: activeStepIndex === idx ? '700' : '600', color: 'var(--t1)' }}>{step.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setIsAddStepModalOpen(true)} style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 14px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Plus size={16} />
                    <span>{isRtl ? '+ إضافة خطوة جديدة' : '+ Add new step or import'}</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {(() => {
                    const currentStep = selectedFunnel.steps[activeStepIndex] || selectedFunnel.steps[0];
                    if (!currentStep) return null;
                    const urls = getPageUrls(selectedFunnel, activeStepIndex);
                    const isPublished = !!currentStep.published;
                    return (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--edge)', paddingBottom: '12px' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--t1)' }}>{currentStep.name}</h3>
                          <div style={{ display: 'flex', gap: '20px' }}>
                            {['Overview', 'Products', 'Publishing'].map(t => (
                              <button key={t} onClick={() => setStepOverviewTab(t.toLowerCase())} style={{ background: 'none', border: 'none', borderBottom: stepOverviewTab === t.toLowerCase() ? '2px solid var(--a)' : '2px solid transparent', color: stepOverviewTab === t.toLowerCase() ? 'var(--a)' : 'var(--t2)', padding: '6px 2px', fontWeight: stepOverviewTab === t.toLowerCase() ? '700' : '500', fontSize: '13.5px', cursor: 'pointer' }}>{t}</button>
                            ))}
                          </div>
                        </div>

                        {(stepOverviewTab === 'overview' || stepOverviewTab === 'publishing') && (
                          <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: 'var(--t1)', fontSize: 14 }}>
                                <Link2 size={16} />
                                <span>{isRtl ? 'روابط الصفحة' : 'Page URLs'}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: isPublished ? '#16a34a' : '#f97316' }}>
                                  {isPublished
                                    ? (isRtl ? 'منشور' : `Published${currentStep.publishedAt ? ` · ${new Date(currentStep.publishedAt).toLocaleString()}` : ''}`)
                                    : (isRtl ? 'لم يُنشر بعد — يظهر آخر حفظ في Saved URL' : 'Not published yet — Saved URL shows your latest edits')}
                                </span>
                                <button
                                  type="button"
                                  onClick={handlePublishStep}
                                  style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                                >
                                  {isRtl ? 'نشر' : 'Publish'}
                                </button>
                              </div>
                            </div>
                            {renderUrlCard(isRtl ? 'الرابط المحفوظ (آخر تعديلات)' : 'Saved URL (latest edits)', urls.saved, 'saved')}
                            {renderUrlCard(isRtl ? 'رابط الإنتاج على UpKlick' : 'UpKlick production URL', urls.appPublished, 'app')}
                            {urls.custom ? renderUrlCard(isRtl ? 'الدومين الخاص' : 'Custom domain URL', urls.custom, 'custom') : null}
                          </div>
                        )}

                        {stepOverviewTab === 'overview' && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--a)', letterSpacing: '0.5px' }}>🚩 CONTROL</span>
                              <div onClick={() => { setBuilderStoreMode(false); setIsBuilderOpen(true); }} style={{ height: '220px', border: '1px solid var(--a)', borderRadius: '10px', background: '#fff', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>
                                <div style={{ transform: 'scale(0.42)', transformOrigin: 'top center', width: '238%', marginLeft: '-69%', pointerEvents: 'none', padding: '20px 16px' }}>
                                  {(currentStep.canvas || []).slice(0, 4).map((el) => (
                                    <div key={el.id} style={{ marginBottom: 12 }}>
                                      <ElementRenderer el={el} interactive={false} />
                                    </div>
                                  ))}
                                  {!(currentStep.canvas || []).length && (
                                    <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>Empty page — click to add elements</div>
                                  )}
                                </div>
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(15,23,42,0.55))', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 16 }}>
                                  <span style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', padding: '10px 22px', borderRadius: 8, fontWeight: 700, fontSize: 13 }}>Edit page in builder</span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <button type="button" onClick={() => { setBuilderStoreMode(false); setIsBuilderOpen(true); }} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><span>Edit</span><ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} /></button>
                                <button type="button" title={isRtl ? 'فتح الرابط المحفوظ' : 'Open saved URL'} onClick={() => openUrl(urls.saved)} className="btn btn-ghost" style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <Eye size={16} /><span style={{ fontSize: 12, fontWeight: 700 }}>Saved</span>
                                </button>
                                <button type="button" title={isRtl ? 'فتح الرابط المنشور' : 'Open published URL'} onClick={() => openUrl(urls.published)} className="btn btn-ghost" style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <ExternalLink size={16} /><span style={{ fontSize: 12, fontWeight: 700 }}>Published</span>
                                </button>
                              </div>
                            </div>

                            <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                              <div>
                                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--t2)', letterSpacing: '0.5px' }}>🚩 VARIATION</span>
                                <div style={{ height: '220px', border: '2px dashed var(--edge)', borderRadius: '10px', margin: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', padding: '20px' }}>
                                  <button onClick={() => alert('Variation created')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer' }}>+ Create variation</button>
                                  <h4 style={{ margin: '14px 0 4px', fontSize: '14px', fontWeight: '700', color: 'var(--t1)' }}>Start split test</h4>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {stepOverviewTab === 'products' && (
                          <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: 12, padding: 28, color: 'var(--t2)', fontSize: 14 }}>
                            {isRtl ? 'منتجات هذه الخطوة ستظهر هنا.' : 'Products for this step will appear here.'}
                          </div>
                        )}

                        {stepOverviewTab === 'publishing' && (
                          <DomainSettings
                            funnel={selectedFunnel}
                            stepIdx={activeStepIndex}
                            ownerUid={ownerUid}
                            isRtl={isRtl}
                            showToast={showToast}
                            onSaveFunnel={patchSelectedFunnel}
                          />
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                          <button onClick={() => handleDeleteStep(activeStepIndex)} style={{ background: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Trash2 size={15} /><span>Delete Funnel Step</span></button>
                          <button onClick={() => handleCloneStep(activeStepIndex)} style={{ background: 'var(--surface)', border: '1px solid var(--edge)', color: 'var(--t1)', borderRadius: '6px', padding: '8px 16px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Copy size={15} /><span>Clone Funnel Step</span></button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {detailTab === 'settings' && (
              <DomainSettings
                funnel={selectedFunnel}
                stepIdx={activeStepIndex}
                ownerUid={ownerUid}
                isRtl={isRtl}
                showToast={showToast}
                onSaveFunnel={patchSelectedFunnel}
              />
            )}
          </div>
        ) : (
          /* Funnels / Websites List View */
          <div style={{ padding: '0 24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--t1)', margin: '0 0 4px' }}>
                {activeSubTab === 'websites' ? (isRtl ? 'المواقع الإلكترونية' : 'Websites') : (isRtl ? 'الفانلز ومسارات البيع' : 'Funnels')}
              </h1>
              <p style={{ color: 'var(--t2)', fontSize: '13.5px', margin: 0 }}>
                {isRtl ? 'أنشئ وأدر صفحات ومسارات البيع لجمع العملاء المحتملين وتلقي المدفوعات.' : 'Create and manage funnels to generate leads, appointments and receive payments.'}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
              <div style={{ position: 'relative', width: '320px' }}>
                <Search size={16} style={{ position: 'absolute', [isRtl ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--t2)' }} />
                <input
                  type="text"
                  className="inp"
                  placeholder={isRtl ? 'بحث عن الفانلز...' : 'Search for funnels'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ [isRtl ? 'paddingRight' : 'paddingLeft']: '38px', width: '100%', fontSize: '13px' }}
                />
              </div>
              <button onClick={() => setIsCreateModalOpen(true)} style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 18px', fontWeight: '700', fontSize: '13.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} /><span>{isRtl ? '+ فانل جديد' : '+ New funnel'}</span>
              </button>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--edge)', fontSize: '12px', fontWeight: '700', color: 'var(--t2)', textTransform: 'uppercase' }}>
                    <th style={{ padding: '14px 20px' }}>{isRtl ? 'الاسم' : 'Name'}</th>
                    <th style={{ padding: '14px 20px' }}>{isRtl ? 'آخر تحديث' : 'Last updated'}</th>
                    <th style={{ padding: '14px 20px' }}>{isRtl ? 'خطوات الفانل' : 'Funnel steps'}</th>
                    <th style={{ padding: '14px 20px', width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFunnels.map((funnel) => (
                    <tr key={funnel.id} onClick={() => { setSelectedFunnel(funnel); setActiveStepIndex(0); }} style={{ borderBottom: '1px solid var(--edge)', cursor: 'pointer' }}>
                      <td style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--t1)' }}>{funnel.name}</td>
                      <td style={{ padding: '16px 20px', color: 'var(--t2)', fontSize: '13px' }}>{funnel.lastUpdated}</td>
                      <td style={{ padding: '16px 20px', color: 'var(--t2)', fontSize: '13px' }}>{funnel.steps?.length || 0} Steps</td>
                      <td style={{ padding: '16px 20px' }} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => {}} style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer' }}><MoreVertical size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* CREATE FUNNEL MODAL */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '16px', width: '100%', maxWidth: '680px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: '800' }}>{isRtl ? 'إنشاء فانل جديد' : 'Create new funnel'}</h3>
            <input type="text" className="inp" placeholder={isRtl ? 'اسم الفانل' : 'Funnel Name'} value={newFunnelName} onChange={(e) => setNewFunnelName(e.target.value)} style={{ width: '100%', marginBottom: '20px' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setIsCreateModalOpen(false)} className="btn btn-ghost">{isRtl ? 'إلغاء' : 'Cancel'}</button>
              <button onClick={handleCreateFunnel} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 24px', borderRadius: '8px', fontWeight: '700' }}>{isRtl ? 'إنشاء' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD STEP MODAL */}
      {isAddStepModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '16px', width: '100%', maxWidth: '500px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '800' }}>{isRtl ? 'إضافة خطوة جديدة' : 'Add New Step'}</h3>
            <input type="text" className="inp" placeholder="Step Name (e.g. page1)" value={newStepName} onChange={(e) => setNewStepName(e.target.value)} style={{ width: '100%', marginBottom: '16px' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setIsAddStepModalOpen(false)} className="btn btn-ghost">{isRtl ? 'إلغاء' : 'Cancel'}</button>
              <button onClick={handleAddStep} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: '700' }}>{isRtl ? 'إنشاء الخطوة' : 'Create Step'}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
