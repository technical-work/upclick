'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tr, ARTEXT } from '../data/translations';
import { CURRENCIES, PAGE_META } from '../data/mockData';

const BusinessContext = createContext();

const initialGC = {
  profile: {
    name: 'Sara Hassan',
    desc: '',
    niche: 'Fashion & Lifestyle',
    stage: 'Idea',
    type: 'Content Creator',
    level: 'beginner',
    challenge: '',
    offer: { name: '', price: '', transform: '', duration: '', market: '' },
    goal: ''
  },
  strategy: { idea_analysis: '', icp: '', swot: { s: '', w: '', o: '', t: '' }, roadmap: '' },
  crm: { leads: [] },
  tasks: { items: [] },
  finance: { entries: [], subscriptions: [] },
  calendar: { events: [] },
  creator: { followers: '284K', engagement: '6.8%', revenue_monthly: '$4,320' },
  _lastSaved: null
};

const themeColors = {
  dark: '#FF6B35',
  light: '#6C35FF',
  neon: '#00F0B4',
  cosmic: '#FF007F'
};

export function BusinessProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState('dark');
  const [currentPage, setCurrentPage] = useState('home');
  const [currency, setCurrencyState] = useState({ code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' });
  const [GC, setGC] = useState(initialGC);
  const [savedNotes, setSavedNotes] = useState([]);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(true);

  // Modal control states
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadModalStage, setLeadModalStage] = useState('new');
  const [aiQuery, setAiQuery] = useState('');
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [financeModalOpen, setFinanceModalOpen] = useState(false);
  const [financeModalType, setFinanceModalType] = useState('income');
  const [lpPreviewOpen, setLpPreviewOpen] = useState(false);
  const [lpPreviewHtml, setLpPreviewHtml] = useState('');
  const [dpDetailOpen, setDpDetailOpen] = useState(false);
  const [dpDetailIndex, setDpDetailIndex] = useState(null);

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

      const onboardDone = localStorage.getItem('ba_onboard_done');
      setOnboardingDone(onboardDone === '1');
    }
  }, []);

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

  // Sync GC to localStorage
  const saveGC = (updatedGC) => {
    const gcWithSaved = { ...updatedGC, _lastSaved: new Date().toISOString() };
    setGC(gcWithSaved);
    localStorage.setItem('ba_context', JSON.stringify(gcWithSaved));
  };

  // Translation function
  const t = (keyOrText) => {
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
    return `${currency.symbol}${amt.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ${currency.code}`;
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
  const addLead = (lead) => {
    const newLead = {
      id: Date.now(),
      name: lead.name || 'Unnamed Lead',
      phone: lead.phone || '',
      email: lead.email || '',
      value: parseFloat(lead.value) || 0,
      stage: lead.stage || 'Prospect',
      followupDate: lead.followupDate || '',
      created: new Date().toISOString()
    };
    const updated = {
      ...GC,
      crm: {
        ...GC.crm,
        leads: [...GC.crm.leads, newLead]
      }
    };
    saveGC(updated);
  };

  const updateLeadStage = (leadId, stage) => {
    const updated = {
      ...GC,
      crm: {
        ...GC.crm,
        leads: GC.crm.leads.map((l) => (l.id === leadId ? { ...l, stage } : l))
      }
    };
    saveGC(updated);
  };

  const deleteLead = (leadId) => {
    const updated = {
      ...GC,
      crm: {
        ...GC.crm,
        leads: GC.crm.leads.filter((l) => l.id !== leadId)
      }
    };
    saveGC(updated);
  };

  // Tasks management
  const addTask = (title, priority = 'medium') => {
    const newTask = {
      id: Date.now(),
      title,
      priority,
      done: false,
      created: new Date().toISOString()
    };
    const updated = {
      ...GC,
      tasks: {
        ...GC.tasks,
        items: [...GC.tasks.items, newTask]
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

  // Finance management
  const addFinanceEntry = (type, amount, desc, category) => {
    const newEntry = {
      id: Date.now(),
      type, // 'income' or 'expense'
      amount: parseFloat(amount) || 0,
      desc: desc || '',
      category: category || 'General',
      date: new Date().toLocaleDateString('en-US')
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
  };

  const resetOnboarding = () => {
    localStorage.removeItem('ba_onboard_done');
    setOnboardingDone(false);
  };

  return (
    <BusinessContext.Provider
      value={{
        lang,
        setLang,
        theme,
        setTheme,
        currentPage,
        setCurrentPage,
        currency,
        setCurrency,
        formatMoney,
        GC,
        saveGC,
        t,
        L,
        updateProfile,
        addLead,
        updateLeadStage,
        deleteLead,
        addTask,
        toggleTask,
        deleteTask,
        addFinanceEntry,
        addSubscription,
        deleteSubscription,
        savedNotes,
        addNote,
        clearNotes,
        aiPanelOpen,
        setAiPanelOpen,
        supportOpen,
        setSupportOpen,
        onboardingDone,
        finishOnboarding,
        resetOnboarding,
        leadModalOpen,
        setLeadModalOpen,
        leadModalStage,
        setLeadModalStage,
        aiQuery,
        setAiQuery,
        openAIFor,
        taskModalOpen,
        setTaskModalOpen,
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
        dpDetailIndex,
        setDpDetailIndex
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  return useContext(BusinessContext);
}
