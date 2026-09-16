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
  websitesStorageKey,
  webinarsStorageKey,
  blogsStorageKey,
  writeJsonList
} from '@/lib/sites/userSitesScope';
import WebsiteListView from '../sites/websites/WebsiteListView';
import WebsiteDetailView from '../sites/websites/WebsiteDetailView';
import CreateWebsiteModal from '../sites/websites/CreateWebsiteModal';
import {
  PREBUILT_WEBSITE_TEMPLATES,
  createBlankWebsite,
  createWebsiteFromTemplate
} from '../sites/websites/websiteTemplates';
import WebinarListView from '../sites/webinars/WebinarListView';
import WebinarDetailView from '../sites/webinars/WebinarDetailView';
import CreateWebinarModal from '../sites/webinars/CreateWebinarModal';
import {
  PREBUILT_WEBINAR_TEMPLATES,
  createBlankWebinar,
  createWebinarFromTemplate
} from '../sites/webinars/webinarTemplates';
import SitesAnalyticsView from '../sites/analytics/SitesAnalyticsView';
import BlogListView from '../sites/blogs/BlogListView';
import CreateBlogSiteView from '../sites/blogs/CreateBlogSiteView';
import BlogSiteDetailView from '../sites/blogs/BlogSiteDetailView';
import BlogPostEditor from '../sites/blogs/BlogPostEditor';
import LiveBlogReaderModal from '../sites/blogs/LiveBlogReaderModal';
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
  Layers,
  Radio
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
  const websitePersistTimer = useRef(null);
  const webinarPersistTimer = useRef(null);
  const blogPersistTimer = useRef(null);
  const [storeForceTab, setStoreForceTab] = useState('pages');

  const [activeSubTab, setActiveSubTab] = useState('websites'); // Defaults to websites as requested
  const [selectedFunnel, setSelectedFunnel] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [selectedWebinar, setSelectedWebinar] = useState(null);
  const [selectedBlogSite, setSelectedBlogSite] = useState(null);
  const [isCreatingBlogSite, setIsCreatingBlogSite] = useState(false);
  const [isEditingBlogSite, setIsEditingBlogSite] = useState(false);
  const [activeBlogPost, setActiveBlogPost] = useState(null);
  const [previewingPost, setPreviewingPost] = useState(null);
  const [detailTab, setDetailTab] = useState('steps');
  const [stepOverviewTab, setStepOverviewTab] = useState('overview');
  
  // Builder state
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [builderStoreMode, setBuilderStoreMode] = useState(false);
  const [builderWebsiteMode, setBuilderWebsiteMode] = useState(false);
  const [builderWebinarMode, setBuilderWebinarMode] = useState(false);
  const [builderBlogMode, setBuilderBlogMode] = useState(false);
  const [storeActivePageIdx, setStoreActivePageIdx] = useState(0);
  const [websiteActivePageIdx, setWebsiteActivePageIdx] = useState(0);
  const [webinarActivePageIdx, setWebinarActivePageIdx] = useState(0);
  const [blogActivePostIdx, setBlogActivePostIdx] = useState(0);

  const [copiedKey, setCopiedKey] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Funnel Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createOption, setCreateOption] = useState('blank'); // 'blank' | 'ai' | 'templates'
  const [newFunnelName, setNewFunnelName] = useState('');

  // Website Modal
  const [isCreateWebsiteModalOpen, setIsCreateWebsiteModalOpen] = useState(false);

  // Webinar Modal
  const [isCreateWebinarModalOpen, setIsCreateWebinarModalOpen] = useState(false);

  // Add Step Modal
  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);
  const [newStepName, setNewStepName] = useState('');
  const [newStepPath, setNewStepPath] = useState('');
  const [newStepType, setNewStepType] = useState('landing');

  // Active step index inside detail builder
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Load funnels / stores / websites / webinars / blogs for the signed-in user only
  const [funnels, setFunnels] = useState([]);
  const [stores, setStores] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [webinars, setWebinars] = useState([]);
  const [blogs, setBlogs] = useState([]);
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
      setWebsites([]);
      setWebinars([]);
      setBlogs([]);
      setSelectedFunnel(null);
      setSelectedStore(null);
      setSelectedWebsite(null);
      setSelectedWebinar(null);
      setSelectedBlogSite(null);
      setActiveBlogPost(null);
      loadedAccountUid.current = '';
      return;
    }

    const userChanged = loadedAccountUid.current !== accountUid;
    if (userChanged) {
      setSelectedFunnel(null);
      setSelectedStore(null);
      setSelectedWebsite(null);
      setSelectedWebinar(null);
      setSelectedBlogSite(null);
      setActiveBlogPost(null);
      loadedAccountUid.current = accountUid;
    }

    const gcBelongsToAccount = GC?._accountUid === accountUid;
    const scopedFunnels = sitesForUser(readJsonList(funnelsStorageKey(accountUid)), accountUid);
    const scopedStores = sitesForUser(readJsonList(storesStorageKey(accountUid)), accountUid);
    const scopedWebsites = sitesForUser(readJsonList(websitesStorageKey(accountUid)), accountUid);
    const scopedWebinars = sitesForUser(readJsonList(webinarsStorageKey(accountUid)), accountUid);
    const scopedBlogs = sitesForUser(readJsonList(blogsStorageKey(accountUid)), accountUid);
    const gcFunnels = gcBelongsToAccount
      ? sitesForUser(GC?.upclickFunnels?.funnels, accountUid)
      : [];
    const gcStores = gcBelongsToAccount
      ? sitesForUser(GC?.upclickStores?.stores, accountUid)
      : [];
    const gcWebsites = gcBelongsToAccount
      ? sitesForUser(GC?.upclickWebsites?.websites, accountUid)
      : [];
    const gcWebinars = gcBelongsToAccount
      ? sitesForUser(GC?.upclickWebinars?.webinars, accountUid)
      : [];
    const gcBlogs = gcBelongsToAccount
      ? sitesForUser(GC?.upclickBlogs?.blogs, accountUid)
      : [];

    // Sanitizers to clear any legacy demo stats from stored funnels, stores, webinars
    const sanitizeFunnel = (f) => {
      if (!f) return f;
      const hasRealLogs = Array.isArray(f.visitorLogs) && f.visitorLogs.length > 0;
      const hasRealLeads = Array.isArray(f.leads) && f.leads.length > 0;
      const cleanSteps = (f.steps || []).map(st => ({
        ...st,
        views: hasRealLogs ? (Number(st.views) || 0) : 0,
        optins: hasRealLeads ? (Number(st.optins) || 0) : 0
      }));
      return {
        ...f,
        views: hasRealLogs ? (Number(f.views) || 0) : 0,
        optins: hasRealLeads ? (Number(f.optins) || 0) : 0,
        steps: cleanSteps
      };
    };

    const sanitizeStore = (s) => {
      if (!s || !s.pages) return s;
      const hasRealOrders = Array.isArray(s.orders) && s.orders.length > 0;
      const hasRealLogs = Array.isArray(s.visitorLogs) && s.visitorLogs.length > 0;
      const cleanPages = s.pages.map(p => {
        if (!hasRealLogs || [3420, 2890, 5820, 1450, 980, 860, 640].includes(p.views)) {
          return { ...p, views: hasRealLogs ? (Number(p.views) || 0) : 0, uniqueViews: 0, optins: 0, orders: hasRealOrders ? (Number(p.orders) || 0) : 0, salesAmount: 0 };
        }
        return p;
      });
      return { ...s, pages: cleanPages };
    };

    const sanitizeWebinar = (w) => {
      if (!w) return w;
      const hasRealRegistrations = Array.isArray(w.attendees) && w.attendees.length > 0;
      if (!hasRealRegistrations || w.stats?.totalViews === 3840) {
        return {
          ...w,
          stats: {
            totalViews: hasRealRegistrations ? (Number(w.stats?.totalViews) || 0) : 0,
            registrations: hasRealRegistrations ? w.attendees.length : 0,
            attendanceRate: '0%',
            replayViews: 0,
            orders: 0,
            conversionRate: '0%',
            revenue: '$0'
          }
        };
      }
      return w;
    };

    const isAutoSeededFunnel = (f) => {
      const isPrebuiltName = ['Ai-brand vision', 'Auto Body Shop', 'Business Development', 'Coding Framework', 'Human OS'].includes(f.name);
      return isPrebuiltName && !f.published && !f.domain && (!f.visitorLogs || f.visitorLogs.length === 0);
    };

    const nextFunnels = (gcFunnels.length ? gcFunnels : scopedFunnels).filter(f => !isAutoSeededFunnel(f)).map(sanitizeFunnel);
    const nextStores = (gcStores.length ? gcStores : scopedStores).map(sanitizeStore);
    
    // Deduplication helper to guarantee each site/webinar has a globally unique key
    const dedupeSitesList = (list, prefix = 'item') => {
      const seen = new Set();
      return (list || []).map((item, idx) => {
        if (!item) return null;
        let id = item.id;
        if (!id || seen.has(id)) {
          id = `${prefix}_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`;
          return { ...item, id };
        }
        seen.add(id);
        return item;
      }).filter(Boolean);
    };

    // Filter out any legacy auto-seeded prebuilt items that were not explicitly created or published
    const isAutoSeededWebinar = (w) => {
      const isPrebuiltName = ['tpl_ai_masterclass', 'tpl_ecommerce_secrets', 'tpl_marketing_funnels', 'tpl_real_estate', 'AI & Business Growth Masterclass', 'E-Commerce 7-Figure Scaling Secrets', 'High-Ticket Client Acquisition Blueprint', 'Real Estate Wealth & Investment Summit', 'ماستركلاس نمو الأعمال بالذكاء الاصطناعي', 'أسرار مضاعفة مبيعات التجارة الإلكترونية', 'استراتيجيات جذب العملاء ذوي القيمة العالية', 'قمة الاستثمار العقاري وصناعة الثروة'].includes(w.name) || ['tpl_ai_masterclass', 'tpl_ecommerce_secrets', 'tpl_marketing_funnels', 'tpl_real_estate'].includes(w.id);
      return isPrebuiltName && !w.published && !w.domain && (!w.visitorLogs || w.visitorLogs.length === 0);
    };

    const isAutoSeededWebsite = (w) => {
      const isPrebuiltName = ['tpl_financial_planner', 'tpl_agency_designer', 'tpl_saas_startup', 'tpl_ecommerce_store', 'Financial Planner', 'Website Designer & Creative Agency', 'SaaS Modern Tech Platform', 'Minimalist Fashion Brand', 'مخطط مالي ومستشار استثماري', 'وكالة تصميم مواقع وتجارب رقمية', 'منصة برمجيات وحلول سحابية', 'براند أزياء وتجارة إلكترونية'].includes(w.name) || ['tpl_financial_planner', 'tpl_agency_designer', 'tpl_saas_startup', 'tpl_ecommerce_store'].includes(w.id);
      return isPrebuiltName && !w.published && !w.domain && (!w.visitorLogs || w.visitorLogs.length === 0);
    };

    const nextWebsites = dedupeSitesList((gcWebsites.length ? gcWebsites : scopedWebsites).filter(w => !isAutoSeededWebsite(w)), 'website');
    const nextWebinars = dedupeSitesList((gcWebinars.length ? gcWebinars : scopedWebinars).filter(w => !isAutoSeededWebinar(w)).map(sanitizeWebinar), 'webinar');
    const nextBlogs = dedupeSitesList(gcBlogs.length ? gcBlogs : scopedBlogs, 'blogsite');

    setFunnels((prev) => {
      if (userChanged) return nextFunnels;
      const prevMine = sitesForUser(prev, accountUid).map(sanitizeFunnel);
      if (!prevMine.length && nextFunnels.length) return nextFunnels;
      return nextFunnels;
    });
    setStores((prev) => {
      if (userChanged) return nextStores;
      const prevMine = sitesForUser(prev, accountUid).map(sanitizeStore);
      if (!prevMine.length && nextStores.length) return nextStores;
      return nextStores;
    });
    setWebsites((prev) => {
      if (userChanged) return nextWebsites;
      const prevMine = sitesForUser(prev, accountUid);
      if (!prevMine.length && nextWebsites.length) return nextWebsites;
      return nextWebsites;
    });
    setWebinars((prev) => {
      if (userChanged) return nextWebinars;
      const prevMine = sitesForUser(prev, accountUid).map(sanitizeWebinar);
      if (!prevMine.length && nextWebinars.length) return nextWebinars;
      return nextWebinars;
    });
    setBlogs((prev) => {
      if (userChanged) return nextBlogs;
      const prevMine = sitesForUser(prev, accountUid);
      if (!prevMine.length && nextBlogs.length) return nextBlogs;
      return nextBlogs;
    });
  }, [accountUid, GC?._accountUid, GC?.upclickFunnels?.funnels, GC?.upclickStores?.stores, GC?.upclickWebsites?.websites, GC?.upclickWebinars?.webinars, GC?.upclickBlogs?.blogs, isRtl]);

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

  const saveWebsites = (updatedList) => {
    if (!accountUid) return;
    const mine = (updatedList || []).map((item) => stampSiteOwner(item, accountUid));
    setWebsites(mine);
    writeJsonList(websitesStorageKey(accountUid), mine);
    clearLegacySiteKeys();
    if (websitePersistTimer.current) clearTimeout(websitePersistTimer.current);
    websitePersistTimer.current = setTimeout(() => {
      saveGC({
        ...GC,
        upclickWebsites: {
          websites: mine
        }
      });
    }, 700);
  };

  const saveWebinars = (updatedList) => {
    if (!accountUid) return;
    const mine = (updatedList || []).map((item) => stampSiteOwner(item, accountUid));
    setWebinars(mine);
    writeJsonList(webinarsStorageKey(accountUid), mine);
    clearLegacySiteKeys();
    if (webinarPersistTimer.current) clearTimeout(webinarPersistTimer.current);
    webinarPersistTimer.current = setTimeout(() => {
      saveGC({
        ...GC,
        upclickWebinars: {
          webinars: mine
        }
      });
    }, 700);
  };

  const saveBlogs = (updatedList) => {
    if (!accountUid) return;
    const mine = (updatedList || []).map((item) => stampSiteOwner(item, accountUid));
    setBlogs(mine);
    writeJsonList(blogsStorageKey(accountUid), mine);
    clearLegacySiteKeys();
    if (blogPersistTimer.current) clearTimeout(blogPersistTimer.current);
    blogPersistTimer.current = setTimeout(() => {
      saveGC({
        ...GC,
        upclickBlogs: {
          blogs: mine
        }
      });
    }, 700);
  };

  // Sync selectedBlogSite
  useEffect(() => {
    if (!selectedBlogSite) return;
    const match = blogs.find((b) => b.id === selectedBlogSite.id);
    if (match && match !== selectedBlogSite) setSelectedBlogSite(match);
  }, [blogs, selectedBlogSite]);

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

  // Sync selectedWebsite
  useEffect(() => {
    if (!selectedWebsite) return;
    const match = websites.find((w) => w.id === selectedWebsite.id);
    if (match && match !== selectedWebsite) setSelectedWebsite(match);
  }, [websites, selectedWebsite]);

  // Sync selectedWebinar
  useEffect(() => {
    if (!selectedWebinar) return;
    const match = webinars.find((w) => w.id === selectedWebinar.id);
    if (match && match !== selectedWebinar) setSelectedWebinar(match);
  }, [webinars, selectedWebinar]);

  // Webinar Management Handlers
  const handleCreateWebinar = (params) => {
    let newWebinar;
    if (params.templateId && params.templateId !== 'blank') {
      newWebinar = createWebinarFromTemplate({ ...params, accountUid });
    } else {
      newWebinar = createBlankWebinar({ ...params, accountUid });
    }
    const owned = stampSiteOwner(newWebinar, accountUid);
    const nextWebinars = [owned, ...webinars];
    saveWebinars(nextWebinars);
    setSelectedWebinar(owned);
    if (showToast) showToast(isRtl ? 'تم إنشاء مسار الويبينار بنجاح' : 'Webinar funnel created successfully');
  };

  const handleDuplicateWebinar = (webinar) => {
    const cloned = {
      ...webinar,
      id: `webinar_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: `${webinar.name} (Copy)`,
      ownerUid: accountUid,
      published: false,
      domain: '',
      domainStatus: '',
      pages: (webinar.pages || []).map((p, idx) => ({
        ...p,
        id: `wbp_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`
      })),
      lastUpdated: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
    };
    const nextWebinars = [cloned, ...webinars];
    saveWebinars(nextWebinars);
    if (showToast) showToast(isRtl ? 'تم تكرار الويبينار' : 'Webinar duplicated');
  };

  const handleDeleteWebinar = (webinarId) => {
    const nextWebinars = webinars.filter(w => w.id !== webinarId);
    saveWebinars(nextWebinars);
    if (selectedWebinar?.id === webinarId) {
      setSelectedWebinar(null);
    }
    if (showToast) showToast(isRtl ? 'تم حذف مسار الويبينار' : 'Webinar funnel deleted');
  };

  const handleUpdateWebinar = (updatedWebinar) => {
    const owned = stampSiteOwner(updatedWebinar, accountUid);
    const prev = webinars.find((w) => w.id === owned.id);
    if (prev === owned) {
      setSelectedWebinar(owned);
      return;
    }
    const nextWebinars = webinars.map(w => w.id === owned.id ? owned : w);
    saveWebinars(nextWebinars);
    setSelectedWebinar(owned);
  };

  const updateActiveWebinarPage = (patch) => {
    if (!selectedWebinar || !selectedWebinar.pages) return;
    const targetPage = selectedWebinar.pages[webinarActivePageIdx] || selectedWebinar.pages[0];
    if (!targetPage) return;

    const updatedPage = { ...targetPage, ...patch };
    const updatedPages = selectedWebinar.pages.map((p, idx) => idx === webinarActivePageIdx ? updatedPage : p);
    const updatedWebinar = { ...selectedWebinar, pages: updatedPages };
    handleUpdateWebinar(updatedWebinar);
  };

  const updateActiveWebinarPageCanvas = (newCanvas) => {
    updateActiveWebinarPage({ canvas: newCanvas });
  };

  const handlePublishWebinarPage = async () => {
    if (!selectedWebinar?.pages) return;
    const targetPage = selectedWebinar.pages[webinarActivePageIdx] || selectedWebinar.pages[0];
    if (!targetPage) return;
    const publishedPatch = {
      published: true,
      publishedAt: new Date().toISOString(),
      publishedCanvas: JSON.parse(JSON.stringify(targetPage.canvas || [])),
      publishedPage: { ...DEFAULT_PAGE, ...(targetPage.page || {}) }
    };
    const updatedPage = { ...targetPage, ...publishedPatch };
    const updatedPages = selectedWebinar.pages.map((p, idx) => idx === webinarActivePageIdx ? updatedPage : p);
    const updatedWebinar = { ...selectedWebinar, published: true, publishedAt: new Date().toISOString(), pages: updatedPages };
    handleUpdateWebinar(updatedWebinar);
    try {
      await publishFunnelPublic({
        funnel: {
          id: updatedWebinar.id,
          name: updatedWebinar.name,
          domain: updatedWebinar.domain,
          steps: updatedWebinar.pages
        },
        ownerUid,
        defaultStepIdx: webinarActivePageIdx
      });
      if (updatedWebinar.domain) {
        await connectFunnelDomain({
          funnelId: updatedWebinar.id,
          ownerUid,
          host: updatedWebinar.domain,
          previousHost: ''
        });
      }
      if (showToast) showToast(isRtl ? 'تم نشر صفحة الويبينار' : 'Webinar page published to live URL');
      return updatedWebinar;
    } catch (err) {
      console.error(err);
      if (showToast) showToast(isRtl ? 'حُفظ محلياً، لكن النشر العام فشل.' : 'Saved locally, but public publish failed.');
    }
  };

  // Website Management Handlers
  const handleCreateWebsiteBlank = (name) => {
    const newSite = createBlankWebsite(name, accountUid);
    const owned = stampSiteOwner(newSite, accountUid);
    const nextWebsites = [owned, ...websites];
    saveWebsites(nextWebsites);
    setSelectedWebsite(owned);
    if (showToast) showToast(isRtl ? 'تم إنشاء الموقع بنجاح' : 'Website created successfully');
  };

  const handleCreateWebsiteFromTemplate = (templateId, customName) => {
    const newSite = createWebsiteFromTemplate(templateId, customName, accountUid);
    const owned = stampSiteOwner(newSite, accountUid);
    const nextWebsites = [owned, ...websites];
    saveWebsites(nextWebsites);
    setSelectedWebsite(owned);
    if (showToast) showToast(isRtl ? 'تم إنشاء الموقع من القالب بنجاح' : 'Website created from template');
  };

  const handleDuplicateWebsite = (websiteId) => {
    const target = websites.find(w => w.id === websiteId);
    if (!target) return;
    const cloned = {
      ...target,
      id: 'web_' + Date.now(),
      name: `${target.name} (Copy)`,
      ownerUid: accountUid,
      published: false,
      publishedAt: null,
      domain: '',
      domainStatus: '',
      lastUpdated: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
    };
    const nextWebsites = [cloned, ...websites];
    saveWebsites(nextWebsites);
    if (showToast) showToast(isRtl ? 'تم تكرار الموقع' : 'Website duplicated');
  };

  const handleDeleteWebsite = (websiteId) => {
    const nextWebsites = websites.filter(w => w.id !== websiteId);
    saveWebsites(nextWebsites);
    if (selectedWebsite?.id === websiteId) {
      setSelectedWebsite(null);
    }
    if (showToast) showToast(isRtl ? 'تم حذف الموقع بنجاح' : 'Website deleted successfully');
  };

  const handleUpdateWebsite = (updatedWebsite) => {
    const owned = stampSiteOwner(updatedWebsite, accountUid);
    const prev = websites.find((w) => w.id === owned.id);
    if (prev === owned) {
      setSelectedWebsite(owned);
      return;
    }
    const nextWebsites = websites.map(w => w.id === owned.id ? owned : w);
    saveWebsites(nextWebsites);
    setSelectedWebsite(owned);
  };

  const updateActiveWebsitePage = (patch) => {
    if (!selectedWebsite || !selectedWebsite.pages) return;
    const targetPage = selectedWebsite.pages[websiteActivePageIdx] || selectedWebsite.pages[0];
    if (!targetPage) return;

    const updatedPage = { ...targetPage, ...patch };
    const updatedPages = selectedWebsite.pages.map((p, idx) => idx === websiteActivePageIdx ? updatedPage : p);
    const updatedWebsite = { ...selectedWebsite, pages: updatedPages };
    handleUpdateWebsite(updatedWebsite);
  };

  const updateActiveWebsitePageCanvas = (newCanvas) => {
    updateActiveWebsitePage({ canvas: newCanvas });
  };

  const handlePublishWebsitePage = async () => {
    if (!selectedWebsite?.pages) return;
    const targetPage = selectedWebsite.pages[websiteActivePageIdx] || selectedWebsite.pages[0];
    if (!targetPage) return;
    const publishedPatch = {
      published: true,
      publishedAt: new Date().toISOString(),
      publishedCanvas: JSON.parse(JSON.stringify(targetPage.canvas || [])),
      publishedPage: { ...DEFAULT_PAGE, ...(targetPage.page || {}) }
    };
    const updatedPage = { ...targetPage, ...publishedPatch };
    const updatedPages = selectedWebsite.pages.map((p, idx) => idx === websiteActivePageIdx ? updatedPage : p);
    const updatedWebsite = { ...selectedWebsite, published: true, publishedAt: new Date().toISOString(), pages: updatedPages };
    handleUpdateWebsite(updatedWebsite);
    try {
      await publishFunnelPublic({
        funnel: {
          id: updatedWebsite.id,
          name: updatedWebsite.name,
          domain: updatedWebsite.domain,
          steps: updatedWebsite.pages
        },
        ownerUid,
        defaultStepIdx: websiteActivePageIdx
      });
      if (updatedWebsite.domain) {
        await connectFunnelDomain({
          funnelId: updatedWebsite.id,
          ownerUid,
          host: updatedWebsite.domain,
          previousHost: ''
        });
      }
      if (showToast) showToast(isRtl ? 'تم نشر الصفحة على رابط الإنتاج' : 'Website page published to live URL');
      return updatedWebsite;
    } catch (err) {
      console.error(err);
      if (showToast) showToast(isRtl ? 'حُفظ محلياً، لكن النشر العام فشل.' : 'Saved locally, but public publish failed.');
    }
  };

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

  // Blog Management Handlers
  const handleCreateBlogSite = (newSite) => {
    const stamped = stampSiteOwner(newSite, accountUid);
    const updated = [stamped, ...blogs];
    saveBlogs(updated);
    setIsCreatingBlogSite(false);
    setSelectedBlogSite(stamped);
    if (showToast) showToast(isRtl ? 'تم إنشاء موقع المدونة بنجاح 🚀' : 'Blog site created successfully');
  };

  const handleUpdateBlogSite = (updatedSite) => {
    const stamped = stampSiteOwner(updatedSite, accountUid);
    const updated = blogs.map(s => s.id === stamped.id ? stamped : s);
    saveBlogs(updated);
    setSelectedBlogSite(stamped);
  };

  const handleDeleteBlogSite = (siteId) => {
    const updated = blogs.filter(s => s.id !== siteId);
    saveBlogs(updated);
    if (selectedBlogSite?.id === siteId) setSelectedBlogSite(null);
    if (showToast) showToast(isRtl ? 'تم حذف موقع المدونة' : 'Blog site deleted');
  };

  const handleDuplicateBlogSite = (site) => {
    const dup = {
      ...site,
      id: `blogsite_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: `${site.name} (Copy)`,
      slug: `${site.slug}-copy`,
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };
    const updated = [dup, ...blogs];
    saveBlogs(updated);
    if (showToast) showToast(isRtl ? 'تم تكرار موقع المدونة' : 'Blog site duplicated');
  };

  const handleSaveBlogPost = (updatedPost) => {
    if (!selectedBlogSite) return;
    const existingPosts = selectedBlogSite.posts || [];
    const postIndex = existingPosts.findIndex(p => p.id === updatedPost.id);
    let newPosts;
    if (postIndex >= 0) {
      newPosts = existingPosts.map(p => p.id === updatedPost.id ? updatedPost : p);
    } else {
      newPosts = [updatedPost, ...existingPosts];
    }

    const updatedSite = {
      ...selectedBlogSite,
      posts: newPosts,
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    handleUpdateBlogSite(updatedSite);
    setActiveBlogPost(null);
  };

  const handleDeleteBlogPost = (postId) => {
    if (!selectedBlogSite) return;
    const newPosts = (selectedBlogSite.posts || []).filter(p => p.id !== postId);
    const updatedSite = {
      ...selectedBlogSite,
      posts: newPosts,
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };
    handleUpdateBlogSite(updatedSite);
    if (showToast) showToast(isRtl ? 'تم حذف المقال' : 'Post deleted');
  };

  const handleDuplicateBlogPost = (postToDup) => {
    if (!selectedBlogSite) return;
    const dup = {
      ...postToDup,
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: `${postToDup.title} (Copy)`,
      slug: `${postToDup.slug}-copy`,
      status: 'draft',
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };
    const newPosts = [dup, ...(selectedBlogSite.posts || [])];
    const updatedSite = {
      ...selectedBlogSite,
      posts: newPosts,
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };
    handleUpdateBlogSite(updatedSite);
    if (showToast) showToast(isRtl ? 'تم تكرار المقال كمسودة' : 'Post duplicated as draft');
  };

  const handlePublishBlogPost = (postId, targetStatus = 'published') => {
    if (!selectedBlogSite) return;
    const updatedPosts = (selectedBlogSite.posts || []).map(p => {
      if (p.id === postId) {
        return {
          ...p,
          status: targetStatus,
          publishedAt: targetStatus === 'published' ? new Date().toISOString() : p.publishedAt,
          lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        };
      }
      return p;
    });
    const updatedBlogSite = {
      ...selectedBlogSite,
      posts: updatedPosts,
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };
    handleUpdateBlogSite(updatedBlogSite);
    if (showToast) showToast(targetStatus === 'published' ? (isRtl ? 'تم نشر المقال بنجاح 🚀' : 'Post published successfully 🚀') : (isRtl ? 'تم نقل المقال للمسودة' : 'Post converted to draft'));
  };

  const handleOpenBuilderForBlogPost = (postOrIndex) => {
    if (!selectedBlogSite) return;
    let targetIdx = 0;
    if (typeof postOrIndex === 'number') {
      targetIdx = postOrIndex;
    } else if (postOrIndex && typeof postOrIndex === 'object') {
      const foundIdx = (selectedBlogSite.posts || []).findIndex(p => p.id === postOrIndex.id);
      if (foundIdx >= 0) {
        targetIdx = foundIdx;
      } else {
        const newPosts = [postOrIndex, ...(selectedBlogSite.posts || [])];
        const updatedSite = { ...selectedBlogSite, posts: newPosts };
        handleUpdateBlogSite(updatedSite);
        targetIdx = 0;
      }
    }

    setBuilderBlogMode(true);
    setBuilderStoreMode(false);
    setBuilderWebsiteMode(false);
    setBuilderWebinarMode(false);
    setBlogActivePostIdx(targetIdx);
    setIsBuilderOpen(true);
  };

  const updateActiveBlogPost = (patch) => {
    if (!selectedBlogSite || !selectedBlogSite.posts) return;
    const targetPost = selectedBlogSite.posts[blogActivePostIdx] || selectedBlogSite.posts[0];
    if (!targetPost) return;

    const updatedPost = { 
      ...targetPost, 
      ...patch, 
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) 
    };
    const updatedPosts = selectedBlogSite.posts.map((p, idx) => idx === blogActivePostIdx ? updatedPost : p);
    const updatedBlogSite = { ...selectedBlogSite, posts: updatedPosts };
    handleUpdateBlogSite(updatedBlogSite);
    if (activeBlogPost && activeBlogPost.id === updatedPost.id) {
      setActiveBlogPost(updatedPost);
    }
  };

  const updateActiveBlogPostCanvas = (newCanvas) => {
    updateActiveBlogPost({ canvas: newCanvas });
  };

  const handlePublishBlogPostInBuilder = async () => {
    if (!selectedBlogSite || !selectedBlogSite.posts) return;
    const targetPost = selectedBlogSite.posts[blogActivePostIdx] || selectedBlogSite.posts[0];
    if (!targetPost) return;

    const updatedPost = {
      ...targetPost,
      status: 'published',
      published: true,
      publishedAt: new Date().toISOString(),
      lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };
    const updatedPosts = selectedBlogSite.posts.map((p, idx) => idx === blogActivePostIdx ? updatedPost : p);
    const updatedBlogSite = { ...selectedBlogSite, posts: updatedPosts };
    handleUpdateBlogSite(updatedBlogSite);
    if (activeBlogPost && activeBlogPost.id === updatedPost.id) {
      setActiveBlogPost(updatedPost);
    }
    if (showToast) showToast(isRtl ? 'تم نشر المقال بنجاح 🚀' : 'Blog post published successfully 🚀');
    return updatedBlogSite;
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

  const renderUrlCard = (label, url, key, extraAction) => (
    <div style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: 10, padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--t2)', textTransform: 'uppercase' }}>{label}</div>
        {extraAction || null}
      </div>
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

  const connectedDomains = useMemo(() => {
    const doms = new Set();
    (websites || []).forEach(w => { if (w.domain) doms.add(w.domain); });
    (funnels || []).forEach(f => { if (f.domain) doms.add(f.domain); });
    (stores || []).forEach(s => { if (s.domain) doms.add(s.domain); });
    (blogs || []).forEach(b => { if (b.domain) doms.add(b.domain); });
    return Array.from(doms);
  }, [websites, funnels, stores, blogs]);

  // Sub-tabs list matching UpKlick / GoHighLevel
  const subTabs = [
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
    if (builderBlogMode && selectedBlogSite) {
      const postsAsSteps = (selectedBlogSite.posts || []).map((p, idx) => ({
        id: p.id,
        name: p.title || `Post ${idx + 1}`,
        path: `/${p.slug || p.id}`,
        published: p.status === 'published',
        page: p.page || DEFAULT_PAGE,
        canvas: (p.canvas && p.canvas.length > 0) ? p.canvas : [
          {
            id: `el_badge_${p.id}`,
            type: 'subheadline',
            content: `🏷️ ${p.category || 'Article'} • ${p.readTime || '3 min read'}`,
            fontSize: '14px',
            color: '#2563eb',
            align: 'left',
            weight: '700',
            margin: '0 0 10px'
          },
          {
            id: `el_title_${p.id}`,
            type: 'headline',
            content: p.title || 'New Blog Post',
            fontSize: '36px',
            color: '#0f172a',
            align: 'left',
            weight: '800',
            margin: '0 0 16px'
          },
          {
            id: `el_meta_${p.id}`,
            type: 'paragraph',
            content: `Written by ${p.author || 'Author'} • Last updated ${p.lastUpdated || 'Today'}`,
            fontSize: '13px',
            color: '#64748b',
            align: 'left',
            margin: '0 0 24px'
          },
          ...(p.coverImage ? [{
            id: `el_img_${p.id}`,
            type: 'image',
            src: p.coverImage,
            alt: p.title,
            radius: '12px',
            margin: '0 0 28px',
            shadow: true
          }] : []),
          {
            id: `el_content_${p.id}`,
            type: 'custom_html',
            code: p.content || `<p style="font-size: 16px; line-height: 1.8; color: #334155;">Start writing your amazing article content here...</p>`,
            padding: '10px 0'
          }
        ]
      }));

      if (postsAsSteps.length === 0) {
        postsAsSteps.push({
          id: 'post_draft_new',
          name: 'New Article',
          path: '/new-post',
          published: false,
          page: DEFAULT_PAGE,
          canvas: [
            {
              id: 'el_title_draft',
              type: 'headline',
              content: 'Write your new blog post',
              fontSize: '36px',
              weight: '800'
            },
            {
              id: 'el_p_draft',
              type: 'paragraph',
              content: 'Customize your blog article with images, videos, columns, call-to-actions, and styled copy.'
            }
          ]
        });
      }

      return {
        id: selectedBlogSite.id,
        name: `${selectedBlogSite.name} (Blog Post Builder)`,
        steps: postsAsSteps
      };
    }
    if (builderWebsiteMode && selectedWebsite) {
      return {
        id: selectedWebsite.id,
        name: selectedWebsite.name,
        steps: selectedWebsite.pages || []
      };
    }
    if (builderWebinarMode && selectedWebinar) {
      return {
        id: selectedWebinar.id,
        name: selectedWebinar.name,
        steps: selectedWebinar.pages || []
      };
    }
    if (builderStoreMode && selectedStore) {
      return {
        id: selectedStore.id,
        name: selectedStore.name,
        steps: selectedStore.pages || []
      };
    }
    return selectedFunnel;
  }, [builderBlogMode, selectedBlogSite, builderWebsiteMode, selectedWebsite, builderWebinarMode, selectedWebinar, builderStoreMode, selectedStore, selectedFunnel]);

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
          stepIndex={builderBlogMode ? blogActivePostIdx : (builderWebsiteMode ? websiteActivePageIdx : (builderWebinarMode ? webinarActivePageIdx : (builderStoreMode ? storeActivePageIdx : activeStepIndex)))}
          onChangeStep={builderBlogMode ? setBlogActivePostIdx : (builderWebsiteMode ? setWebsiteActivePageIdx : (builderWebinarMode ? setWebinarActivePageIdx : (builderStoreMode ? setStoreActivePageIdx : setActiveStepIndex)))}
          onClose={() => {
            setIsBuilderOpen(false);
            setBuilderStoreMode(false);
            setBuilderWebsiteMode(false);
            setBuilderWebinarMode(false);
            setBuilderBlogMode(false);
          }}
          onUpdateCanvas={(newCanvas) => {
            if (builderBlogMode && selectedBlogSite) {
              updateActiveBlogPostCanvas(newCanvas);
            } else if (builderWebsiteMode && selectedWebsite) {
              updateActiveWebsitePageCanvas(newCanvas);
            } else if (builderWebinarMode && selectedWebinar) {
              updateActiveWebinarPageCanvas(newCanvas);
            } else if (builderStoreMode && selectedStore) {
              updateActiveStorePageCanvas(newCanvas);
            } else {
              updateActiveStepCanvas(newCanvas);
            }
          }}
          onUpdateStep={(patch) => {
            if (builderBlogMode && selectedBlogSite) {
              updateActiveBlogPost(patch);
            } else if (builderWebsiteMode && selectedWebsite) {
              updateActiveWebsitePage(patch);
            } else if (builderWebinarMode && selectedWebinar) {
              updateActiveWebinarPage(patch);
            } else if (builderStoreMode && selectedStore) {
              updateActiveStorePage(patch);
            } else {
              updateActiveStep(patch);
            }
          }}
          onPublish={builderBlogMode ? handlePublishBlogPostInBuilder : (builderWebsiteMode ? handlePublishWebsitePage : (builderWebinarMode ? handlePublishWebinarPage : (builderStoreMode ? handlePublishStorePage : handlePublishStep)))}
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
                if (tab.key !== 'funnels') setSelectedFunnel(null);
                if (tab.key !== 'websites') setSelectedWebsite(null);
                if (tab.key !== 'webinars') setSelectedWebinar(null);
                if (tab.key !== 'stores') setSelectedStore(null);
                if (tab.key !== 'blogs') {
                  setSelectedBlogSite(null);
                  setActiveBlogPost(null);
                  setIsCreatingBlogSite(false);
                  setIsEditingBlogSite(false);
                }
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
              {tab.key === 'websites' && (
                <span style={{
                  background: 'rgba(37, 99, 235, 0.12)',
                  color: '#2563eb',
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '1px 5px',
                  borderRadius: '4px'
                }}>
                  {websites.length}
                </span>
              )}
              {tab.key === 'webinars' && (
                <span style={{
                  background: 'rgba(37, 99, 235, 0.12)',
                  color: '#2563eb',
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '1px 5px',
                  borderRadius: '4px'
                }}>
                  {webinars.length}
                </span>
              )}
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
              {tab.key === 'blogs' && blogs.length > 0 && (
                <span style={{
                  background: 'rgba(37, 99, 235, 0.12)',
                  color: '#2563eb',
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '1px 5px',
                  borderRadius: '4px'
                }}>
                  {blogs.length}
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
              alert(isRtl ? 'إعدادات المواقع' : 'Settings');
            }
          }}
          style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer', padding: '8px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
        >
          <Settings size={18} />
        </button>
      </div>

      {/* RENDER WEBSITES VIEW WHEN SUBTAB IS 'websites' */}
      {activeSubTab === 'websites' ? (
        selectedWebsite ? (
          <WebsiteDetailView
            website={selectedWebsite}
            isRtl={isRtl}
            ownerUid={ownerUid}
            showToast={showToast}
            onBack={() => setSelectedWebsite(null)}
            onOpenBuilderForPage={(pageIdx) => {
              setBuilderWebsiteMode(true);
              setWebsiteActivePageIdx(pageIdx);
              setIsBuilderOpen(true);
            }}
            onUpdateWebsite={handleUpdateWebsite}
            onPublishWebsite={handlePublishWebsitePage}
          />
        ) : (
          <WebsiteListView
            websites={websites}
            isRtl={isRtl}
            onSelectWebsite={(w) => setSelectedWebsite(w)}
            onOpenCreateModal={() => setIsCreateWebsiteModalOpen(true)}
            onDuplicateWebsite={handleDuplicateWebsite}
            onDeleteWebsite={handleDeleteWebsite}
          />
        )
      ) : activeSubTab === 'webinars' ? (
        /* RENDER WEBINARS VIEW WHEN SUBTAB IS 'webinars' */
        selectedWebinar ? (
          <WebinarDetailView
            webinar={selectedWebinar}
            isRtl={isRtl}
            ownerUid={ownerUid}
            showToast={showToast}
            onBack={() => setSelectedWebinar(null)}
            onOpenBuilderForPage={(pageIdx) => {
              setBuilderWebinarMode(true);
              setWebinarActivePageIdx(pageIdx);
              setIsBuilderOpen(true);
            }}
            onUpdateWebinar={handleUpdateWebinar}
            onPublishWebinar={handlePublishWebinarPage}
          />
        ) : (
          <WebinarListView
            webinars={webinars}
            isRtl={isRtl}
            onSelectWebinar={(w) => setSelectedWebinar(w)}
            onOpenCreateModal={() => setIsCreateWebinarModalOpen(true)}
            onDuplicateWebinar={handleDuplicateWebinar}
            onDeleteWebinar={handleDeleteWebinar}
          />
        )
      ) : activeSubTab === 'stores' ? (
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
      ) : activeSubTab === 'analytics' ? (
        <SitesAnalyticsView
          funnels={funnels}
          websites={websites}
          stores={stores}
          webinars={webinars}
          isRtl={isRtl}
          showToast={showToast}
        />
      ) : activeSubTab === 'blogs' ? (
        activeBlogPost ? (
          <BlogPostEditor
            post={activeBlogPost}
            blogSite={selectedBlogSite}
            isRtl={isRtl}
            onBack={() => setActiveBlogPost(null)}
            onSavePost={handleSaveBlogPost}
            onPublishPost={handlePublishBlogPost}
            onPreviewPost={(post) => setPreviewingPost(post)}
            onOpenBuilder={handleOpenBuilderForBlogPost}
            showToast={showToast}
          />
        ) : isCreatingBlogSite || isEditingBlogSite ? (
          <CreateBlogSiteView
            isRtl={isRtl}
            initialData={isEditingBlogSite ? selectedBlogSite : null}
            connectedDomains={connectedDomains}
            onBack={() => {
              setIsCreatingBlogSite(false);
              setIsEditingBlogSite(false);
            }}
            onCreateBlogSite={isEditingBlogSite ? handleUpdateBlogSite : handleCreateBlogSite}
            onOpenDomainSettings={() => {
              if (showToast) showToast(isRtl ? 'انتقل إلى إعدادات النطاقات لربط دومين مخصص' : 'Manage your domains in Domain Settings');
            }}
          />
        ) : selectedBlogSite ? (
          <BlogSiteDetailView
            blogSite={selectedBlogSite}
            isRtl={isRtl}
            onBack={() => setSelectedBlogSite(null)}
            onOpenEditSite={() => setIsEditingBlogSite(true)}
            onCreateNewPost={() => {
              const newPost = {
                id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                title: 'New Blog Post',
                slug: 'new-blog-post',
                category: 'General',
                author: user?.displayName || user?.email?.split('@')[0] || 'Admin',
                status: 'draft',
                type: 'standard',
                coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80',
                excerpt: '',
                content: '',
                words: 0,
                readTime: '1 min read',
                lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                seo: { metaTitle: '', metaDescription: '', canonicalUrl: '' },
                tags: []
              };
              setActiveBlogPost(newPost);
            }}
            onOpenAiPostCreator={() => {
              const newAiPost = {
                id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                title: 'AI Generated Blog Post',
                slug: 'ai-generated-blog-post',
                category: 'Marketing',
                author: 'Content AI',
                status: 'draft',
                type: 'ai',
                coverImage: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80',
                excerpt: '',
                content: '',
                words: 0,
                readTime: '1 min read',
                lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                seo: { metaTitle: '', metaDescription: '', canonicalUrl: '' },
                tags: ['AI', 'Content']
              };
              setActiveBlogPost(newAiPost);
            }}
            onEditPost={(post) => setActiveBlogPost(post)}
            onOpenBuilderForPost={handleOpenBuilderForBlogPost}
            onDeletePost={handleDeleteBlogPost}
            onDuplicatePost={handleDuplicateBlogPost}
            onPublishPost={handlePublishBlogPost}
            onPreviewPost={(post) => setPreviewingPost(post)}
            onPreviewLiveBlog={(blog) => {
              if (blog.posts && blog.posts.length > 0) {
                setPreviewingPost(blog.posts[0]);
              } else {
                if (showToast) showToast(isRtl ? 'أضف مقالات أولاً لمعاينة المدونة مباشرة' : 'Add posts first to preview live blog');
              }
            }}
            showToast={showToast}
          />
        ) : (
          <BlogListView
            blogSites={blogs}
            isRtl={isRtl}
            onSelectBlogSite={(site) => setSelectedBlogSite(site)}
            onOpenCreateBlogSite={() => {
              setIsEditingBlogSite(false);
              setIsCreatingBlogSite(true);
            }}
            onDuplicateBlogSite={handleDuplicateBlogSite}
            onDeleteBlogSite={handleDeleteBlogSite}
            onOpenSettings={() => {
              if (showToast) showToast(isRtl ? 'إعدادات المدونات العامة' : 'Global Blog Settings');
            }}
            showToast={showToast}
          />
        )
      ) : (
        /* RENDER FUNNELS VIEW */
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
                {selectedFunnel.domain ? (
                  <button
                    type="button"
                    onClick={() => setDetailTab('settings')}
                    className="btn btn-ghost"
                    style={{ fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', color: selectedFunnel.domainStatus === 'connected' ? '#16a34a' : '#f97316', background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '6px', padding: '6px 10px' }}
                  >
                    <Globe size={14} />
                    <span style={{ fontWeight: 700 }}>{selectedFunnel.domain}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDetailTab('settings')}
                    style={{ background: 'rgba(37,99,235,0.1)', color: '#2563eb', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '6px', padding: '6px 12px', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Globe size={14} />
                    <span>{isRtl ? 'ربط دومين' : 'Connect Domain'}</span>
                  </button>
                )}
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
                            {urls.custom ? (
                              renderUrlCard(
                                isRtl ? 'الدومين الخاص' : 'Custom domain URL', 
                                urls.custom, 
                                'custom',
                                <button 
                                  type="button" 
                                  onClick={() => setStepOverviewTab('publishing')} 
                                  style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: 0 }}
                                >
                                  {isRtl ? '⚙️ إعدادات DNS' : '⚙️ DNS Settings'}
                                </button>
                              )
                            ) : (
                              <div style={{ background: 'rgba(37,99,235,0.05)', border: '1px dashed rgba(37,99,235,0.35)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <Globe size={16} style={{ color: '#2563eb' }} />
                                  <div style={{ fontSize: 12.5, color: 'var(--t1)', fontWeight: 600 }}>
                                    {isRtl ? 'هل تريد تشغيل هذا الفانل على دومينك الخاص؟ (مثل offers.yourbrand.com)' : 'Want to run this funnel on your own domain? (e.g. offers.yourbrand.com)'}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setStepOverviewTab('publishing')}
                                  style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                                >
                                  <Globe size={13} />
                                  <span>{isRtl ? 'ربط دومين حقيقي' : 'Connect Real Domain'}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {stepOverviewTab === 'overview' && (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--a)', letterSpacing: '0.5px' }}>🚩 CONTROL</span>
                              <div onClick={() => { setBuilderStoreMode(false); setBuilderWebsiteMode(false); setIsBuilderOpen(true); }} style={{ height: '220px', border: '1px solid var(--edge)', borderRadius: '10px', background: currentStep.page?.bg || '#0f172a', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>
                                <div style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '238.1%',
                                  minHeight: '524px',
                                  transform: 'scale(0.42)',
                                  transformOrigin: 'top left',
                                  pointerEvents: 'none',
                                  padding: 0,
                                  boxSizing: 'border-box',
                                  direction: 'ltr',
                                  textAlign: 'left',
                                  background: currentStep.page?.bg || 'transparent'
                                }}>
                                  {(currentStep.canvas || []).slice(0, 4).map((el) => (
                                    <div key={el.id} style={{ marginBottom: el.type === 'code' || el.type === 'custom_html' ? 0 : 12 }}>
                                      <ElementRenderer el={el} interactive={false} />
                                    </div>
                                  ))}
                                  {!(currentStep.canvas || []).length && (
                                    <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>Empty page — click to add elements</div>
                                  )}
                                </div>
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(15,23,42,0.7))', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 16 }}>
                                  <span style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', padding: '10px 22px', borderRadius: 8, fontWeight: 700, fontSize: 13, boxShadow: '0 4px 14px rgba(0,0,0,0.35)' }}>Edit page in builder</span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <button type="button" onClick={() => { setBuilderStoreMode(false); setBuilderWebsiteMode(false); setIsBuilderOpen(true); }} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><span>Edit</span><ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} /></button>
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
          /* Funnels List View */
          <div style={{ padding: '0 24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--t1)', margin: '0 0 4px' }}>
                {isRtl ? 'الفانلز ومسارات البيع' : 'Funnels'}
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
                  {filteredFunnels.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--t2)' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                          <Layers size={26} />
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 6px 0', color: 'var(--t1)' }}>
                          {searchQuery ? (isRtl ? 'لم يتم العثور على نتائج' : 'No matching funnels') : (isRtl ? 'لا توجد مسارات بيع (فانلز) بعد' : 'No funnels created yet')}
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--t3)', margin: '0 0 20px 0' }}>
                          {isRtl ? 'ابدأ الآن بإنشاء أول فانل لك لجمع العملاء المحتملين والمبيعات.' : 'Start by creating your first sales funnel to capture leads and sales.'}
                        </p>
                        <button
                          onClick={() => setIsCreateModalOpen(true)}
                          style={{ background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '10px 22px', fontSize: '13.5px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                        >
                          <Plus size={16} />
                          <span>{isRtl ? 'إنشاء فانل جديد' : 'Create new funnel'}</span>
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredFunnels.map((funnel) => (
                      <tr key={funnel.id} onClick={() => { setSelectedFunnel(funnel); setActiveStepIndex(0); }} style={{ borderBottom: '1px solid var(--edge)', cursor: 'pointer' }}>
                        <td style={{ padding: '16px 20px', fontWeight: '700', color: 'var(--t1)' }}>{funnel.name}</td>
                        <td style={{ padding: '16px 20px', color: 'var(--t2)', fontSize: '13px' }}>{funnel.lastUpdated}</td>
                        <td style={{ padding: '16px 20px', color: 'var(--t2)', fontSize: '13px' }}>{funnel.steps?.length || 0} Steps</td>
                        <td style={{ padding: '16px 20px' }} onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => {}} style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer' }}><MoreVertical size={16} /></button>
                        </td>
                      </tr>
                    ))
                  )}
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

      {/* CREATE WEBSITE MODAL */}
      <CreateWebsiteModal
        isOpen={isCreateWebsiteModalOpen}
        onClose={() => setIsCreateWebsiteModalOpen(false)}
        onCreateBlank={handleCreateWebsiteBlank}
        onCreateFromTemplate={handleCreateWebsiteFromTemplate}
        isRtl={isRtl}
      />

      {/* CREATE WEBINAR MODAL */}
      <CreateWebinarModal
        isOpen={isCreateWebinarModalOpen}
        onClose={() => setIsCreateWebinarModalOpen(false)}
        onCreateWebinar={handleCreateWebinar}
        isRtl={isRtl}
      />

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

      {/* LIVE BLOG READER MODAL */}
      <LiveBlogReaderModal
        isOpen={!!previewingPost}
        onClose={() => setPreviewingPost(null)}
        post={previewingPost}
        blogSite={selectedBlogSite}
        isRtl={isRtl}
        showToast={showToast}
      />

    </div>
  );
}
