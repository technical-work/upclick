'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Tr, ARTEXT, ENTEXT } from '../data/translations';
import { CURRENCIES, PAGE_META } from '../data/mockData';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import { DEFAULT_AI_TOOLS } from '../constants/aiTools';
import { doc, setDoc, onSnapshot, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const BusinessContext = createContext();

const initialGC = {
  profile: {
    name: '',
    desc: '',
    niche: '',
    stage: 'Idea',
    type: 'Content Creator',
    level: 'beginner',
    challenge: '',
    offer: { name: '', price: '', transform: '', duration: '', market: '' },
    goal: ''
  },
  strategy: { idea_analysis: '', icp: '', swot: { s: '', w: '', o: '', t: '' }, roadmap: '' },
  crm: { 
    workspaces: [
      {
        id: 'default',
        name: 'Default Workspace',
        stages: [
          { key: 'new', label: 'New Lead', color: 'var(--blue)' },
          { key: 'contacted', label: 'Contacted', color: 'var(--purple)' },
          { key: 'qualified', label: 'Qualified', color: 'var(--amber)' },
          { key: 'proposal', label: 'Proposal Sent', color: 'var(--a)' },
          { key: 'closed', label: 'Closed Won', color: 'var(--green)' },
          { key: 'lost', label: 'Lost', color: 'var(--red)' }
        ],
        leads: []
      }
    ],
    activeWorkspaceId: 'default'
  },
  tasks: { items: [] },
  finance: { entries: [], subscriptions: [] },
  calendar: { events: [] },
  creator: { followers: '0', engagement: '6.8%', revenue_monthly: '$4,320' },
  marketing: {
    inputs: {},
    outputs: {},
    counts: { competitors: 0, audience: 0, trends: 0, personas: 0 },
    savedReports: []
  },
  integrations: {
    claudeKey: '',
    openaiKey: '',
    stripeKey: '',
    tapKey: '',
    telegramBotToken: '',
    telegramChatId: '',
    stripeConnected: false,
    tapConnected: false,
    claudeConnected: false,
    openaiConnected: false,
    telegramConnected: false,
    mailchimpConnected: false,
    apifyConnected: false,
    apifyToken: '',
    cloudinaryConnected: false,
    cloudinaryCloudName: '',
    cloudinaryUploadPreset: ''
  },
  bioLink: {
    displayName: 'Sara Hassan',
    bioTagline: 'Coach | Entrepreneur | Content Creator 🚀',
    username: 'sarahassan',
    bioTheme: 'dark',
    links: [
      { title: 'My Website', url: 'https://sarahassan.com', icon: '🌐' },
      { title: 'Free Course', url: 'https://upklick.bio/sarahassan/free', icon: '📚' },
      { title: 'Book a Call', url: 'https://calendly.com/sarahassan', icon: '💬', highlighted: true }
    ],
    socials: { ig: '@sarahassan', tt: '@sarahassan', yt: 'Sarah Hassan', li: '', tg: '', wa: '' }
  },
  digitalProducts: {
    products: []
  },
  contentHub: {
    savedIdeas: []
  },
  automationHub: {
    connectionUrl: '',
    apiKey: '',
    connected: false,
    cbTrigger: 'New Telegram message received',
    cbAction: '',
    cbApps: [],
    cbCreds: '',
    buildResult: ''
  },
  aiGrowthIntel: {
    inputs: {},
    outputs: {}
  },
  revenue: {
    deals: { Prospect: [], Negotiating: [], Contracted: [], Completed: [] },
    affiliates: [],
    leadMagnets: [],
    coachingSessions: [],
    merch: []
  },
  socialAccounts: {
    connected: { instagram: false, tiktok: false, facebook: false, youtube: false, snapchat: false, x: false },
    profiles: { instagram: '', tiktok: '', facebook: '' },
    followers: { instagram: 0, tiktok: 0, facebook: 0, total: 0 },
    aiAnalysis: ''
  },
  socialTrends: {
    filters: { platform: 'tiktok', niche: '', region: 'AR', sortBy: 'plays', period: '7' },
    trends: []
  },
  landingPage: {
    name: '',
    niche: '',
    offer: '',
    tagline: 'Learn to grow on Instagram',
    color: '#6c35ff',
    template: 'bold',
    price: 29,
    lpCode: ''
  },
  nicheStudio: {
    language: 'ar',
    field: 'coaching',
    styles: ['catchy'],
    wordCount: 1,
    keywords: '',
    audience: 'Arab entrepreneurs',
    generatedNames: [],
    savedNames: [],
    selectedNiche: null,
    selectedMicro: null
  },
  communityHub: {
    feed: [
      {
        id: 1,
        author: 'Sara Hassan',
        role: 'Owner',
        content: 'Welcome to our new community channel! Let\'s use this space to share wins and strategies.',
        likes: 12,
        commentsCount: 3,
        date: '2h ago'
      }
    ],
    membersCount: 124,
    activeToday: 42
  },
  designStudio: {
    logo: { brandName: '', tagline: '', logoStyle: 'modern', logoType: 'wordmark', logoColor: 'orange-purple', industry: 'coaching', generated: [], saved: [] },
    social: { socialSize: '1080x1080', headline: '', subtitle: '', socialStyle: 'gradient-dark', generated: [], saved: [] },
    cover: { coverType: 'linkedin', generated: [], saved: [] },
    card: { fullName: '', title: '', cardStyle: 'dark-premium', generated: [], saved: [] },
    savedDesigns: []
  },
  upclickFunnels: {
    funnels: []
  },
  opsHub: {
    automations: { welcome: false, followup: false, report: false, invoice: false },
    sopsList: []
  },
  team: {
    members: [],
    tasks: [],
    logs: []
  },
  teamChat: {
    channels: [
      { id: 'general', name: 'general', type: 'public', desc: 'General discussion' },
      { id: 'marketing', name: 'marketing', type: 'public', desc: 'Marketing discussion' }
    ],
    messages: {
      general: [
        { id: 1, author: 'Sara Hassan', content: 'Welcome to the team chat general channel!', date: '1d ago' }
      ]
    }
  },
  telegramHub: {
    agentName: '',
    agentStyle: 'Professional & Friendly',
    agentGoal: 'Qualify Leads',
    agentBiz: '',
    agentOutput: '',
    tmplType: 'Sales Script',
    tmplLang: 'Arabic (Gulf)',
    tmplCtx: '',
    tmplOutput: '',
    broadcasts: []
  },
  trackingCenter: {
    meta: { connected: false, business: null, page: null, pixel: { id: '', name: '' } },
    google: { connected: false, property: { name: '', measurementId: '' } },
    customEvents: [],
    advancedMode: false
  },
  _lastSaved: null
};

const themeColors = {
  dark: '#FF6B35',
  light: '#6C35FF',
  neon: '#00F0B4',
  cosmic: '#FF007F'
};

export function BusinessProvider({ children }) {
  const authContext = useAuth();
  const userData = authContext?.userData;

  const [lang, setLang] = useState(() => {
    if (userData?.lang) return userData.lang;
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('upklick_lang');
      if (savedLang) return savedLang;
    }
    return 'ar';
  });

  const [theme, setTheme] = useState(() => {
    if (userData?.theme) return userData.theme;
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('upklick_theme');
      if (savedTheme) return savedTheme;
    }
    return 'dark';
  });

  const [currentPage, setCurrentPage] = useState('home');
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [crmActiveTab, setCrmActiveTab] = useState('pipeline');
  const [currency, setCurrencyState] = useState({ code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' });
  const [GC, setGC] = useState(initialGC);
  const [savedNotes, setSavedNotes] = useState([]);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [guideActive, setGuideActive] = useState(false);
  const [guideFlowKey, setGuideFlowKey] = useState('');
  const [guideStepIdx, setGuideStepIdx] = useState(0);
  const [tenantConfig, setTenantConfig] = useState(null);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  
  const [supportOpen, setSupportOpen] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Team member detection
  const isTeamMember = userData?.role === 'team_member';
  const ownerUid = userData?.ownerUid || null;

  // Close mobile sidebar on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPage]);

  // Modal control states
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadModalStage, setLeadModalStage] = useState('new');
  const [editingLead, setEditingLead] = useState(null);
  const [aiQuery, setAiQuery] = useState('');
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [financeModalOpen, setFinanceModalOpen] = useState(false);
  const [financeModalType, setFinanceModalType] = useState('income');
  const [lpPreviewOpen, setLpPreviewOpen] = useState(false);
  const [lpPreviewHtml, setLpPreviewHtml] = useState('');
  const [dpDetailOpen, setDpDetailOpen] = useState(false);
  const [dpDetailIndex, setDpDetailIndex] = useState(null);
  const [globalAlert, setGlobalAlert] = useState(null);
  const [globalConfirm, setGlobalConfirm] = useState(null); // { message, callback }
  const [globalPrompt, setGlobalPrompt] = useState(null); // { message, defaultValue, callback }
  const [socialConnectModalOpen, setSocialConnectModalOpen] = useState(false);

  const [rates, setRates] = useState({ USD: 1, EGP: 48.5, EUR: 0.92, SAR: 3.75, AED: 3.67 });

  const confirmAction = (message, callback) => {
    setGlobalConfirm({ message, callback });
  };

  const promptAction = (message, defaultValue, callback) => {
    setGlobalPrompt({ message, defaultValue, callback });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.alert = (msg) => {
        setGlobalAlert(msg);
      };
      
      // Fetch live exchange rates relative to USD
      fetch('https://open.er-api.com/v6/latest/USD')
        .then(res => res.json())
        .then(data => {
          if (data && data.rates) {
            setRates(data.rates);
          }
        })
        .catch(err => console.log('Error fetching exchange rates:', err));
    }
  }, []);

  // Load state from local storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('upklick_lang');
      if (savedLang) setLang(savedLang);

      const savedTheme = localStorage.getItem('upklick_theme');
      if (savedTheme) setTheme(savedTheme);

      const savedCurr = localStorage.getItem('upklick_currency');
      if (savedCurr) {
        try {
          setCurrencyState(JSON.parse(savedCurr));
        } catch (e) {}
      }

      const savedGC = localStorage.getItem('ba_context');
      if (savedGC) {
        try {
          setGC(JSON.parse(savedGC));
        } catch (e) {}
      }

      const savedNotesData = localStorage.getItem('ba_notes');
      if (savedNotesData) {
        try {
          setSavedNotes(JSON.parse(savedNotesData));
        } catch (e) {}
      }

      const savedPage = localStorage.getItem('upklick_current_page');
      if (savedPage) setCurrentPage(savedPage);

      const onboardDone = localStorage.getItem('ba_onboard_done');
      setOnboardingDone(onboardDone === '1');
      setIsPageLoaded(true);
    }
  }, []);

  // Save page state to local storage when changed
  useEffect(() => {
    if (typeof window !== 'undefined' && isPageLoaded && currentPage) {
      localStorage.setItem('upklick_current_page', currentPage);
    }
  }, [currentPage, isPageLoaded]);

  // Sync lang/theme from Firebase if available
  useEffect(() => {
    if (userData?.lang) setLang(userData.lang);
    if (userData?.theme) setTheme(userData.theme);
  }, [userData]);

  // Real-time listen to global branding configurations
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'tenants', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setTenantConfig(docSnap.data());
      } else {
        setTenantConfig(null);
      }
    }, (err) => {
      console.error("Error listening to global tenant config:", err);
    });
    return () => unsub();
  }, []);

  // Apply tenant branding styles to CSS variables dynamically
  useEffect(() => {
    if (!tenantConfig) return;
    const root = document.documentElement;

    if (tenantConfig.primaryColor) {
      root.style.setProperty('--orange', tenantConfig.primaryColor);
      root.style.setProperty('--a', tenantConfig.primaryColor);
      
      const hx = tenantConfig.primaryColor.replace('#', '');
      if (hx.length === 6) {
        const r = parseInt(hx.slice(0, 2), 16);
        const g = parseInt(hx.slice(2, 4), 16);
        const b = parseInt(hx.slice(4, 6), 16);
        if (!isNaN(r)) {
          root.style.setProperty('--a-rgb', `${r},${g},${b}`);
          root.style.setProperty('--orange-d', `rgba(${r}, ${g}, ${b}, 0.14)`);
          root.style.setProperty('--orange-dim', `rgba(${r}, ${g}, ${b}, 0.07)`);
        }
      }
    }
    if (tenantConfig.accentColor) {
      root.style.setProperty('--purple', tenantConfig.accentColor);
      
      const hx = tenantConfig.accentColor.replace('#', '');
      if (hx.length === 6) {
        const r = parseInt(hx.slice(0, 2), 16);
        const g = parseInt(hx.slice(2, 4), 16);
        const b = parseInt(hx.slice(4, 6), 16);
        if (!isNaN(r)) {
          root.style.setProperty('--purple-d', `rgba(${r}, ${g}, ${b}, 0.14)`);
          root.style.setProperty('--purple-dim', `rgba(${r}, ${g}, ${b}, 0.07)`);
        }
      }
    }
    if (tenantConfig.bgColor) {
      root.style.setProperty('--ink', tenantConfig.bgColor);
    }
    if (tenantConfig.panelColor) {
      root.style.setProperty('--surface', tenantConfig.panelColor);
    }
    if (tenantConfig.sidebarBgColor) {
      root.style.setProperty('--surface2', tenantConfig.sidebarBgColor);
    }
    if (tenantConfig.navBgColor) {
      root.style.setProperty('--surface3', tenantConfig.navBgColor);
    }
    if (tenantConfig.textColor) {
      root.style.setProperty('--t1', tenantConfig.textColor);
    }
    if (tenantConfig.text2Color) {
      root.style.setProperty('--t2', tenantConfig.text2Color);
    }
  }, [tenantConfig]);

  // Sync GC from Firebase if available
  // For team members, load the OWNER's GC so they share the same workspace
  useEffect(() => {
    if (isTeamMember && ownerUid) {
      // Real-time listener on the owner's user document for GC data
      const unsub = onSnapshot(doc(db, 'users', ownerUid), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.GC) {
            setGC(data.GC);
            localStorage.setItem('ba_context', JSON.stringify(data.GC));
          }
          if (data.onboardingDone) {
            setOnboardingDone(true);
            localStorage.setItem('ba_onboard_done', '1');
          } else {
            setOnboardingDone(false);
            localStorage.setItem('ba_onboard_done', '0');
          }
        }
      }, (err) => {
        console.error('Error loading owner GC for team member:', err);
      });
      return () => unsub();
    } else if (userData) {
      if (userData.GC) {
        setGC(userData.GC);
        localStorage.setItem('ba_context', JSON.stringify(userData.GC));

        // Auto-create missing public bio link/CV in Firestore
        const bio = userData.GC.bioLink;
        if (bio && bio.username) {
          const cleanUsername = bio.username.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
          if (cleanUsername) {
            const bioDocRef = doc(db, 'bio_links', cleanUsername);
            getDoc(bioDocRef).then((bioDocSnap) => {
              if (!bioDocSnap.exists()) {
                console.log("Auto-creating missing public bio link for", cleanUsername);
                setDoc(bioDocRef, {
                  ownerUid: userData.uid || authContext?.user?.uid,
                  displayName: bio.displayName || userData.name || 'User',
                  bioTagline: bio.bioTagline || 'Coach | Entrepreneur | Content Creator 🚀',
                  username: cleanUsername,
                  bioTheme: bio.bioTheme || 'dark',
                  layout: bio.layout || 'classic',
                  font: bio.font || 'Tajawal',
                  avatarUrl: bio.avatarUrl || '',
                  links: bio.links || [],
                  socials: bio.socials || {},
                  cvEnabled: bio.cvEnabled || false,
                  lang: bio.lang || lang || 'ar',
                  cvSections: bio.cvSections || { experience: [], education: [], skills: [] },
                  updatedAt: new Date().toISOString()
                }).catch(err => console.error("Error writing auto-created bio:", err));
              }
            }).catch(err => console.error("Error checking public bio link doc:", err));
          }
        }
      }
      if (userData.onboardingDone) {
        setOnboardingDone(true);
        localStorage.setItem('ba_onboard_done', '1');
      } else {
        setOnboardingDone(false);
        localStorage.setItem('ba_onboard_done', '0');
      }
    }
  }, [userData, isTeamMember, ownerUid]);

  // Sync language attributes to HTML
  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('upklick_lang', lang);
  }, [lang]);

  // Sync theme attributes to HTML
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('upklick_theme', theme);

    // Swap all default logo images on the page using JS
    const swapLogos = () => {
      const logos = document.querySelectorAll('img');
      logos.forEach(img => {
        const src = img.getAttribute('src');
        if (src) {
          if (theme === 'light') {
            if (src.includes('best_logo_dark.png') || src.includes('new-logo.png') || src.includes('upklick-logo.png')) {
              img.src = '/best_logo_light.png';
            }
          } else {
            if (src.includes('best_logo_light.png') || src.includes('new-logo.png') || src.includes('upklick-logo.png')) {
              img.src = '/best_logo_dark.png';
            }
          }
        }
      });
    };
    swapLogos();
    setTimeout(swapLogos, 0);
    setTimeout(swapLogos, 200);

    // Apply color accents
    const color = themeColors[theme] || '#FF6B35';
    document.documentElement.style.setProperty('--a', color);

    const hx = color.replace('#', '');
    if (hx.length === 6) {
      const r = parseInt(hx.slice(0, 2), 16);
      const g = parseInt(hx.slice(2, 4), 16);
      const b = parseInt(hx.slice(4, 6), 16);
      if (!isNaN(r)) {
        document.documentElement.style.setProperty('--a-rgb', `${r},${g},${b}`);
        document.documentElement.style.setProperty('--orange', color);
        document.documentElement.style.setProperty('--lime', color);
      }
    }
  }, [theme]);

  // Custom setters to update Firestore on manual user switches
  const changeLang = (newLang) => {
    setLang(newLang);
    const targetUid = isTeamMember && ownerUid ? ownerUid : authContext?.user?.uid;
    if (targetUid) {
      setDoc(doc(db, 'users', targetUid), { lang: newLang }, { merge: true }).catch((err) => {
        console.error("Error saving lang to Firestore:", err);
      });
    }
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    const targetUid = isTeamMember && ownerUid ? ownerUid : authContext?.user?.uid;
    if (targetUid) {
      setDoc(doc(db, 'users', targetUid), { theme: newTheme }, { merge: true }).catch((err) => {
        console.error("Error saving theme to Firestore:", err);
      });
    }
  };

  // Sync GC to localStorage and Firebase
  // For team members, save to the OWNER's document so the workspace stays shared
  const saveGC = (updatedGC) => {
    const gcWithSaved = { ...updatedGC, _lastSaved: new Date().toISOString() };
    setGC(gcWithSaved);
    localStorage.setItem('ba_context', JSON.stringify(gcWithSaved));
    
    const targetUid = isTeamMember && ownerUid ? ownerUid : authContext?.user?.uid;
    if (targetUid) {
      setDoc(doc(db, 'users', targetUid), { GC: gcWithSaved }, { merge: true }).catch((err) => {
        console.error("Error saving GC to Firebase:", err);
      });
    }
  };

  // Translation function
  const t = (keyOrText) => {
    const override = tenantConfig?.i18nOverrides?.[lang]?.[keyOrText];
    if (override) {
      return override;
    }
    if (Tr[lang] && Tr[lang][keyOrText]) {
      return Tr[lang][keyOrText];
    }
    if (lang === 'ar' && ARTEXT[keyOrText]) {
      return ARTEXT[keyOrText];
    }
    return keyOrText;
  };

  // Mirror text check (L function)
  const L = (en, ar) => (lang === 'ar' ? ar : en);

  // Toast notification
  const showToast = (msg) => {
    const el = document.getElementById('toast');
    if (el) {
      el.innerText = msg;
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 3000);
    }
  };

  // Standardize dates to English DD/MM/YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB'); // en-GB always gives DD/MM/YYYY in English numerals
    } catch {
      return dateStr;
    }
  };

  // Currency switcher
  const setCurrency = (code) => {
    const cur = CURRENCIES.find((c) => c.code === code);
    if (cur) {
      setCurrencyState(cur);
      localStorage.setItem('upklick_currency', JSON.stringify(cur));
    }
  };

  // Money formatter
  const formatMoney = (amount) => {
    const amt = parseFloat(amount) || 0;
    const rate = rates[currency.code] || 1;
    const converted = amt * rate;
    const formattedVal = converted.toLocaleString('en', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    });
    
    const isRTL = lang?.startsWith('ar');
    
    if (isRTL) {
      if (currency.code === 'SAR') {
        return `${formattedVal} ريال`;
      }
      // For Arabic symbols like د.إ, ج.م, etc., put after the number
      const isArabicSymbol = ['د.إ', 'د.ك', 'ر.ق', '.د.ب', 'ر.ع', 'ج.م', 'د.ا', 'د.م', 'دج', 'ع.د'].includes(currency.symbol);
      if (isArabicSymbol) {
        return `${formattedVal} ${currency.symbol}`;
      }
      return `${currency.symbol}${formattedVal}`;
    } else {
      // English
      const isWesternSymbol = ['$', '€', '£', '¥', 'C$', 'A$', '₺', '₹'].includes(currency.symbol);
      if (isWesternSymbol) {
        return `${currency.symbol}${formattedVal}`;
      }
      return `${formattedVal} ${currency.code}`;
    }
  };

  // Profile management
  const updateProfile = (profileUpdates) => {
    const updated = {
      ...GC,
      profile: { ...GC.profile, ...profileUpdates }
    };
    saveGC(updated);
  };

  // AI query trigger helper
  const openAIFor = (tool) => {
    const prompts = {
      dashboard: L(
        `Review my business dashboard. Context: ${GC.profile.name || 'Unnamed'} | Niche: ${GC.profile.niche || 'Not set'} | Stage: ${GC.profile.stage}. Give me 3 specific actionable insights.`,
        `قم بمراجعة لوحة معلومات أعمالي. السياق: الاسم: ${GC.profile.name || 'غير محدد'}، المجال: ${GC.profile.niche || 'غير محدد'}، المرحلة: ${GC.profile.stage}. أعطني 3 نصائح محددة وقابلة للتنفيذ.`
      ),
      strategy: L(
        `Analyze my strategy. Business: ${GC.profile.name || 'unnamed'}, Niche: ${GC.profile.niche || 'not set'}, Stage: ${GC.profile.stage}. What are the 3 most important things to focus on?`,
        `حلل استراتيجيتي. العمل: ${GC.profile.name || 'غير محدد'}، المجال: ${GC.profile.niche || 'غير محدد'}، المرحلة: ${GC.profile.stage}. ما هي أهم 3 أمور يجب التركيز عليها؟`
      ),
      crm: L(
        `I have ${GC.crm.leads.length} leads in my CRM. ${GC.crm.leads.filter(l => l.stage === 'qualified').length} are qualified. Suggest specific follow-up actions.`,
        `لدي ${GC.crm.leads.length} عملاء في نظام إدارة علاقات العملاء (CRM). ${GC.crm.leads.filter(l => l.stage === 'qualified').length} منهم مؤهلين. اقترح إجراءات متابعة محددة.`
      ),
      tasks: L(
        `I have ${GC.tasks.items.filter(t => !t.done).length} open tasks. Suggest how to prioritize them today.`,
        `لدي ${GC.tasks.items.filter(t => !t.done).length} مهام مفتوحة. اقترح كيفية ترتيب أولوياتها اليوم.`
      ),
      finance: L(
        `My income this month: $${GC.finance.entries.filter(e => e.type === 'income').reduce((a, b) => a + b.amount, 0)}, expenses: $${GC.finance.entries.filter(e => e.type === 'expense').reduce((a, b) => a + b.amount, 0)}. Give me financial insights and warnings.`,
        `دخلي هذا الشهر: $${GC.finance.entries.filter(e => e.type === 'income').reduce((a, b) => a + b.amount, 0)}، ومصاريفي: $${GC.finance.entries.filter(e => e.type === 'expense').reduce((a, b) => a + b.amount, 0)}. أعطني تحليلات وتحذيرات مالية.`
      ),
      launchpad: L(
        `Help me plan a business launch. Business type: ${GC.profile.type || 'not set'}, Stage: ${GC.profile.stage}.`,
        `ساعدني في التخطيط لإطلاق مشروعي. نوع العمل: ${GC.profile.type || 'غير محدد'}، المرحلة: ${GC.profile.stage}.`
      ),
      calendar: L(
        `Review my schedule and suggest how to optimize it for maximum productivity.`,
        `راجع جدولي واقترح كيفية تحسينه لتحقيق أقصى قدر من الإنتاجية.`
      )
    };
    const prompt = prompts[tool] || `Help me with ${tool}`;
    setAiQuery(prompt);
  };

  // CRM management
  const getActiveWorkspace = () => {
    let crm = GC.crm;
    // Migration logic on the fly if needed
    if (!crm.workspaces && crm.leads) {
      crm = {
        workspaces: [
          {
            id: 'default',
            name: 'Default Workspace',
            stages: [
              { key: 'new', label: 'New Lead', color: 'var(--blue)' },
              { key: 'contacted', label: 'Contacted', color: 'var(--purple)' },
              { key: 'qualified', label: 'Qualified', color: 'var(--amber)' },
              { key: 'proposal', label: 'Proposal Sent', color: 'var(--a)' },
              { key: 'closed', label: 'Closed Won', color: 'var(--green)' },
              { key: 'lost', label: 'Lost', color: 'var(--red)' }
            ],
            leads: crm.leads || []
          }
        ],
        activeWorkspaceId: 'default'
      };
    } else if (!crm.workspaces) {
      crm = initialGC.crm;
    }
    const activeWs = crm.workspaces.find(w => w.id === crm.activeWorkspaceId) || crm.workspaces[0];
    return { crm, activeWs };
  };

  const addLead = (lead) => {
    const { crm, activeWs } = getActiveWorkspace();
    const newLead = {
      id: Date.now(),
      name: lead.name || 'Unnamed Lead',
      phone: lead.phone || '',
      email: lead.email || '',
      value: parseFloat(lead.value) || 0,
      stage: lead.stage || (activeWs.stages.length > 0 ? activeWs.stages[0].key : 'new'),
      followupDate: lead.followupDate || '',
      created: new Date().toISOString(),
      source: lead.source || ''
    };
    
    const updatedWs = { ...activeWs, leads: [...(activeWs.leads || []), newLead] };
    const updated = {
      ...GC,
      crm: {
        ...crm,
        workspaces: crm.workspaces.map(w => w.id === updatedWs.id ? updatedWs : w)
      }
    };
    saveGC(updated);
  };

  const updateLeadStage = (leadId, stage) => {
    const { crm, activeWs } = getActiveWorkspace();
    const updatedWs = {
      ...activeWs,
      leads: (activeWs.leads || []).map((l) => (l.id === leadId ? { ...l, stage } : l))
    };
    const updated = {
      ...GC,
      crm: {
        ...crm,
        workspaces: crm.workspaces.map(w => w.id === updatedWs.id ? updatedWs : w)
      }
    };
    saveGC(updated);
  };

  const updateLead = (leadId, updates) => {
    const { crm, activeWs } = getActiveWorkspace();
    const updatedWs = {
      ...activeWs,
      leads: (activeWs.leads || []).map((l) => (l.id === leadId ? { ...l, ...updates } : l))
    };
    const updated = {
      ...GC,
      crm: {
        ...crm,
        workspaces: crm.workspaces.map(w => w.id === updatedWs.id ? updatedWs : w)
      }
    };
    saveGC(updated);
  };

  const deleteLead = (leadId) => {
    const { crm, activeWs } = getActiveWorkspace();
    const updatedWs = {
      ...activeWs,
      leads: (activeWs.leads || []).filter((l) => l.id !== leadId)
    };
    const updated = {
      ...GC,
      crm: {
        ...crm,
        workspaces: crm.workspaces.map(w => w.id === updatedWs.id ? updatedWs : w)
      }
    };
    saveGC(updated);
  };

  const addWorkspace = (name, stages) => {
    const { crm } = getActiveWorkspace();
    const newWs = {
      id: 'ws_' + Date.now(),
      name: name || 'New Workspace',
      stages: stages || [],
      leads: []
    };
    const updated = {
      ...GC,
      crm: {
        ...crm,
        workspaces: [...crm.workspaces, newWs],
        activeWorkspaceId: newWs.id
      }
    };
    saveGC(updated);
  };

  const setActiveWorkspace = (id) => {
    const { crm } = getActiveWorkspace();
    const updated = {
      ...GC,
      crm: {
        ...crm,
        activeWorkspaceId: id
      }
    };
    saveGC(updated);
  };

  const updateWorkspace = (id, name, stages) => {
    const { crm } = getActiveWorkspace();
    const updated = {
      ...GC,
      crm: {
        ...crm,
        workspaces: crm.workspaces.map(w => w.id === id ? { ...w, name, stages } : w)
      }
    };
    saveGC(updated);
  };

  const deleteWorkspace = (id) => {
    const { crm } = getActiveWorkspace();
    if (crm.workspaces.length <= 1) return;
    const remaining = crm.workspaces.filter(w => w.id !== id);
    const fallbackId = remaining[0].id;
    const updated = {
      ...GC,
      crm: {
        ...crm,
        workspaces: remaining,
        activeWorkspaceId: crm.activeWorkspaceId === id ? fallbackId : crm.activeWorkspaceId
      }
    };
    saveGC(updated);
  };

  // Tasks management
  const addTask = (title, priority = 'medium', desc = '', due = '', category = 'General', assignee = '') => {
    const newTask = {
      id: Date.now(),
      title,
      priority,
      desc,
      due,
      category,
      assignee,
      done: false,
      created: new Date().toISOString()
    };
    const updated = {
      ...GC,
      tasks: {
        ...GC.tasks,
        items: [...(GC.tasks.items || []), newTask]
      }
    };
    saveGC(updated);
  };

  const toggleTask = (taskId) => {
    const updated = {
      ...GC,
      tasks: {
        ...GC.tasks,
        items: GC.tasks.items.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t))
      }
    };
    saveGC(updated);
  };

  const deleteTask = (taskId) => {
    const updated = {
      ...GC,
      tasks: {
        ...GC.tasks,
        items: GC.tasks.items.filter((t) => t.id !== taskId)
      }
    };
    saveGC(updated);
  };

  const updateTask = (taskId, updatedFields) => {
    const updatedItems = (GC.tasks?.items || []).map((t) => (t.id === taskId ? { ...t, ...updatedFields } : t));
    const updatedTeamTasks = (GC.team?.tasks || []).map((t) => (t.id === taskId ? { ...t, ...updatedFields } : t));
    const updated = {
      ...GC,
      tasks: {
        ...(GC.tasks || {}),
        items: updatedItems
      },
      team: {
        ...(GC.team || {}),
        tasks: updatedTeamTasks
      }
    };
    saveGC(updated);
  };

  // Finance management
  const addFinanceEntry = (type, amount, desc, category, date) => {
    const newEntry = {
      id: Date.now(),
      type, // 'income' or 'expense'
      amount: parseFloat(amount) || 0,
      desc: desc || '',
      category: category || 'General',
      date: date ? new Date(date).toLocaleDateString('en-US') : new Date().toLocaleDateString('en-US')
    };
    const updated = {
      ...GC,
      finance: {
        ...GC.finance,
        entries: [...GC.finance.entries, newEntry]
      }
    };
    saveGC(updated);
  };

  const addSubscription = (name, amount) => {
    const newSub = {
      id: Date.now(),
      name,
      amount: parseFloat(amount) || 0
    };
    const updated = {
      ...GC,
      finance: {
        ...GC.finance,
        subscriptions: [...GC.finance.subscriptions, newSub]
      }
    };
    saveGC(updated);
  };

  const deleteSubscription = (subId) => {
    const updated = {
      ...GC,
      finance: {
        ...GC.finance,
        subscriptions: GC.finance.subscriptions.filter((s) => s.id !== subId)
      }
    };
    saveGC(updated);
  };

  // Notes management
  const addNote = (noteContent) => {
    const updatedNotes = [...savedNotes, { text: noteContent, date: new Date().toLocaleDateString('en-US') }];
    setSavedNotes(updatedNotes);
    localStorage.setItem('ba_notes', JSON.stringify(updatedNotes));
  };

  const clearNotes = () => {
    setSavedNotes([]);
    localStorage.removeItem('ba_notes');
  };

  // Onboarding completion
  const finishOnboarding = (type, level, challenge) => {
    const updated = {
      ...GC,
      profile: {
        ...GC.profile,
        type,
        level,
        challenge
      }
    };
    saveGC(updated);
    setOnboardingDone(true);
    localStorage.setItem('ba_onboard_done', '1');
    
    // Save to Firebase so it persists across logins
    const targetUid = isTeamMember && ownerUid ? ownerUid : authContext?.user?.uid;
    if (targetUid) {
      setDoc(doc(db, 'users', targetUid), { onboardingDone: true }, { merge: true }).catch((err) => {
        console.error("Error saving onboarding state:", err);
      });
    }
  };

  const resetOnboarding = () => {
    localStorage.removeItem('ba_onboard_done');
    setOnboardingDone(false);
    
    const targetUid = isTeamMember && ownerUid ? ownerUid : authContext?.user?.uid;
    if (targetUid) {
      setDoc(doc(db, 'users', targetUid), { onboardingDone: false }, { merge: true }).catch(err => {
        console.error("Error resetting onboarding state:", err);
      });
    }
  };

  
  const getToolConfig = (toolId) => {
    const baseTool = DEFAULT_AI_TOOLS.find(t => t.id === toolId);
    if (!baseTool) return { cost: 0, isAllowed: true, tag: '' }; // Fallback

    const customTools = processedTenantConfig?.aiToolsConfig || [];
    const customTool = customTools.find(t => t.id === toolId);
    
    let cost = customTool && customTool.cost !== undefined ? customTool.cost : baseTool.cost;
    let allowedPlans = customTool && customTool.allowedPlans ? customTool.allowedPlans : ['starter', 'growth', 'pro'];
    let tag = customTool && customTool.tag ? customTool.tag : '';

    const userPlan = userData?.planName ? userData.planName.toLowerCase() : 'starter';
    const standardPlans = ['starter', 'growth', 'pro'];
    let isAllowed = true;
    if (standardPlans.includes(userPlan)) {
      isAllowed = allowedPlans.includes(userPlan);
    }

    return { cost, isAllowed, tag, allowedPlans };
  };


  const checkCredits = (cost) => {
    const cpd = tenantConfig?.creditsPerDollar !== undefined ? Number(tenantConfig.creditsPerDollar) : 100;
    const defCredits = (tenantConfig?.defaultUserCredit !== undefined ? Number(tenantConfig.defaultUserCredit) : 5.00) * cpd;
    const userCredits = Math.round(userData?.aiCredits !== undefined ? Number(userData.aiCredits) : defCredits);
    if (userCredits < cost) {
      setShowCreditsModal(true);
      return false;
    }

    // Check threshold warnings
    const nextCredits = userCredits - cost;
    if (nextCredits <= 10 && userCredits > 10) {
      showToast(L('⚠️ Warning: Only 10 credits left!', '⚠️ تنبيه: متبقي لديك 10 كريديت فقط!'), 'warning');
    } else if (nextCredits <= 20 && userCredits > 20) {
      showToast(L('⚠️ Warning: Only 20 credits left!', '⚠️ تنبيه: متبقي لديك 20 كريديت فقط!'), 'warning');
    } else if (nextCredits <= 50 && userCredits > 50) {
      showToast(L('⚠️ Warning: Only 50 credits left!', '⚠️ تنبيه: متبقي لديك 50 كريديت فقط!'), 'warning');
    }

    return true;
  };

  const processedTenantConfig = {
    ...tenantConfig,
    planStarterName: tenantConfig?.planStarterName || 'Starter',
    planStarterPrice: tenantConfig?.planStarterPrice !== undefined ? Number(tenantConfig.planStarterPrice) : 499,
    planStarterCredits: tenantConfig?.planStarterCredits !== undefined ? Number(tenantConfig.planStarterCredits) : 200,
    planGrowthName: tenantConfig?.planGrowthName || 'Growth',
    planGrowthPrice: tenantConfig?.planGrowthPrice !== undefined ? Number(tenantConfig.planGrowthPrice) : 799,
    planGrowthCredits: tenantConfig?.planGrowthCredits !== undefined ? Number(tenantConfig.planGrowthCredits) : 600,
    planProName: tenantConfig?.planProName || 'Pro',
    planProPrice: tenantConfig?.planProPrice !== undefined ? Number(tenantConfig.planProPrice) : 1497,
    planProCredits: tenantConfig?.planProCredits !== undefined ? Number(tenantConfig.planProCredits) : 2000,
    
    recharge1Credits: tenantConfig?.recharge1Credits !== undefined ? Number(tenantConfig.recharge1Credits) : 100,
    recharge1Price: tenantConfig?.recharge1Price !== undefined ? Number(tenantConfig.recharge1Price) : 299,
    recharge2Credits: tenantConfig?.recharge2Credits !== undefined ? Number(tenantConfig.recharge2Credits) : 250,
    recharge2Price: tenantConfig?.recharge2Price !== undefined ? Number(tenantConfig.recharge2Price) : 599,
    recharge3Credits: tenantConfig?.recharge3Credits !== undefined ? Number(tenantConfig.recharge3Credits) : 500,
    recharge3Price: tenantConfig?.recharge3Price !== undefined ? Number(tenantConfig.recharge3Price) : 999,

    creditsPerDollar: tenantConfig?.creditsPerDollar !== undefined ? Number(tenantConfig.creditsPerDollar) : 100,
    defaultUserCredit: tenantConfig?.defaultUserCredit !== undefined ? Number(tenantConfig.defaultUserCredit) : 5.00,

    costGenerateScript: tenantConfig?.costGenerateScript !== undefined ? Number(tenantConfig.costGenerateScript) : 5,
    costGenerateLogo: tenantConfig?.costGenerateLogo !== undefined ? Number(tenantConfig.costGenerateLogo) : 40,
    costSwotAnalysis: tenantConfig?.costSwotAnalysis !== undefined ? Number(tenantConfig.costSwotAnalysis) : 15,
    costCompetitorAnalysis: tenantConfig?.costCompetitorAnalysis !== undefined ? Number(tenantConfig.costCompetitorAnalysis) : 30,
    costStrategyBuilder: tenantConfig?.costStrategyBuilder !== undefined ? Number(tenantConfig.costStrategyBuilder) : 50,
  };

  return (
    <BusinessContext.Provider
      value={{
        lang,
        setLang: changeLang,
        theme,
        setTheme: changeTheme,
        currentPage,
        setCurrentPage,
        crmActiveTab,
        setCrmActiveTab,
        currency,
        setCurrency,
        formatMoney,
        GC,
        saveGC,
        t,
        L,
        showToast,
        formatDate,
        saveGC,
        addLead,
        updateLeadStage,
        updateLead,
        deleteLead,
        addWorkspace,
        setActiveWorkspace,
        updateWorkspace,
        deleteWorkspace,
        addTask,
        toggleTask,
        deleteTask,
        updateTask,
        addFinanceEntry,
        addSubscription,
        deleteSubscription,
        savedNotes,
        addNote,
        clearNotes,
        aiPanelOpen,
        setAiPanelOpen,
        guideActive,
        setGuideActive,
        guideFlowKey,
        setGuideFlowKey,
        guideStepIdx,
        setGuideStepIdx,
        supportOpen,
        setSupportOpen,
        onboardingDone,
        mobileMenuOpen,
        setMobileMenuOpen,
        finishOnboarding,
        resetOnboarding,
        leadModalOpen,
        setLeadModalOpen,
        leadModalStage,
        setLeadModalStage,
        editingLead,
        setEditingLead,
        aiQuery,
        setAiQuery,
        openAIFor,
        taskModalOpen,
        setTaskModalOpen,
        taskToEdit,
        setTaskToEdit,
        financeModalOpen,
        setFinanceModalOpen,
        financeModalType,
        setFinanceModalType,
        lpPreviewOpen,
        setLpPreviewOpen,
        lpPreviewHtml,
        setLpPreviewHtml,
        dpDetailOpen,
        setDpDetailOpen,
        setDpDetailIndex,
        socialConnectModalOpen,
        setSocialConnectModalOpen,
        tenantConfig: processedTenantConfig,
        isTeamMember,
        confirmAction,
        promptAction,
        rates,
        checkCredits,
        getToolConfig
      }}
    >
      {children}
      {showCreditsModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(8, 8, 15, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            width: '95%',
            maxWidth: '420px',
            background: 'var(--panelColor, #101018)',
            border: '1px solid var(--line, var(--edge))',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '10px' }}>
              {L('Out of Credits', 'لقد انتهى رصيدك')}
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text2)', marginBottom: '24px', lineHeight: '1.5' }}>
              {L(
                'You do not have enough credits to complete this operation. You can upgrade your plan or recharge your balance now.',
                'ليس لديك رصيد كافٍ لإتمام هذه العملية. يمكنك ترقية باقتك أو إعادة شحن رصيدك الآن.'
              )}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => {
                  setShowCreditsModal(false);
                  setCurrentPage('billing');
                }}
                className="btn btn-prime"
                style={{ justifyContent: 'center', padding: '12px' }}
              >
                🚀 {L('Upgrade Plan', 'ترقية الباقة')}
              </button>
              <button
                onClick={() => {
                  setShowCreditsModal(false);
                  setCurrentPage('billing');
                }}
                className="btn"
                style={{
                  background: 'var(--bg3)',
                  border: '1px solid var(--line2)',
                  color: 'var(--text2)',
                  justifyContent: 'center',
                  padding: '12px'
                }}
              >
                ⚡ {L('Recharge Credits', 'شحن رصيد إضافي')}
              </button>
              <button
                onClick={() => setShowCreditsModal(false)}
                className="btn btn-ghost"
                style={{ justifyContent: 'center', padding: '10px', fontSize: '12px' }}
              >
                {L('Later', 'لاحقاً')}
              </button>
            </div>
          </div>
        </div>
      )}
      {globalAlert && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out', zIndex: 999999, position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideDown { from { opacity: 0; transform: translateY(-20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
            .alert-modal-content {
              animation: slideDown 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
              background: var(--surface);
              border: 1px solid var(--edge);
              border-radius: 16px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.4);
              overflow: hidden;
              width: 90%;
              max-width: 420px;
            }
            .alert-modal-body {
              padding: 24px;
              text-align: center;
            }
          `}</style>
          <div className="alert-modal-content">
            <div className="alert-modal-body">
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>💡</div>
              <p style={{ fontSize: '14.5px', color: 'var(--t1)', lineHeight: '1.6', margin: '0 0 24px 0', whiteSpace: 'pre-line' }}>
                {globalAlert}
              </p>
              <button 
                className="btn btn-prime" 
                style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => setGlobalAlert(null)}
              >
                {L('OK', 'موافق')}
              </button>
            </div>
          </div>
        </div>
      )}
      {globalConfirm && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out', zIndex: 999999, position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="alert-modal-content" style={{ maxWidth: '420px' }}>
            <div className="alert-modal-body" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚠️</div>
              <p style={{ fontSize: '14.5px', color: 'var(--t1)', lineHeight: '1.6', margin: '0 0 24px 0', whiteSpace: 'pre-line' }}>
                {globalConfirm.message}
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn" 
                  style={{ flex: 1, background: 'var(--surface2)', color: 'var(--t1)', border: '1px solid var(--edge)', padding: '12px', borderRadius: '10px', fontSize: '14px', cursor: 'pointer' }}
                  onClick={() => setGlobalConfirm(null)}
                >
                  {L('Cancel', 'إلغاء')}
                </button>
                <button 
                  className="btn btn-prime" 
                  style={{ flex: 1, padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => {
                    const cb = globalConfirm.callback;
                    setGlobalConfirm(null);
                    if (cb) cb();
                  }}
                >
                  {L('Confirm', 'تأكيد')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {globalPrompt && (
        <div className="modal-overlay" style={{ backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease-out', zIndex: 999999, position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="alert-modal-content" style={{ maxWidth: '440px', width: '90%' }}>
            <div className="alert-modal-body" style={{ padding: '24px', textAlign: 'start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '24px' }}>✍️</span>
                <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--t1)', fontFamily: 'var(--ff)' }}>
                  {L('Input Required', 'مطلوب إدخال بيانات')}
                </span>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--t2)', lineHeight: '1.6', margin: '0 0 16px 0', whiteSpace: 'pre-wrap' }}>
                {globalPrompt.message}
              </p>
              <div style={{ marginBottom: '24px' }}>
                <input 
                  type="text" 
                  className="inp"
                  id="global-prompt-input"
                  defaultValue={globalPrompt.defaultValue}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = e.target.value;
                      const cb = globalPrompt.callback;
                      setGlobalPrompt(null);
                      if (cb) cb(val);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '13px',
                    borderRadius: '10px',
                    border: '1px solid var(--edge2)',
                    background: 'var(--surface3)',
                    color: 'var(--t1)',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  className="btn" 
                  style={{ background: 'var(--surface2)', color: 'var(--t1)', border: '1px solid var(--edge)', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer' }}
                  onClick={() => {
                    const cb = globalPrompt.callback;
                    setGlobalPrompt(null);
                    if (cb) cb(null);
                  }}
                >
                  {L('Cancel', 'إلغاء')}
                </button>
                <button 
                  className="btn btn-prime" 
                  style={{ padding: '8px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={() => {
                    const input = document.getElementById('global-prompt-input');
                    const val = input ? input.value : '';
                    const cb = globalPrompt.callback;
                    setGlobalPrompt(null);
                    if (cb) cb(val);
                  }}
                >
                  {L('Confirm', 'تأكيد')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  return useContext(BusinessContext);
}
