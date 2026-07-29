'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Key, DollarSign, Cpu, Save, RefreshCw, BarChart2, List, Settings, Search } from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_AI_TOOLS } from '../../constants/aiTools';

const DEFAULTS = {
  openaiApiKey: '',
  defaultUserCredit: 5.00,
  creditsPerDollar: 100,
  openaiModel: 'gpt-4o-mini',
  aiEnabled: true,
  aiMarkupMultiplier: 1.0,
  creditMonthlyPlan: 10.00,
  creditAnnualPlan: 120.00,
  creditLifetimePlan: 500.00,
  aiTemperature: 0.7,
  aiMaxTokens: 1000,
  aiSystemInstruction: '',
  aiMaxMonthlyBudget: 100.00,

  planStarterName: 'Starter',
  planStarterPrice: 499,
  planStarterCredits: 200,
  planGrowthName: 'Growth',
  planGrowthPrice: 799,
  planGrowthCredits: 600,
  planProName: 'Pro',
  planProPrice: 1497,
  planProCredits: 2000,

  recharge1Credits: 100,
  recharge1Price: 299,
  recharge2Credits: 250,
  recharge2Price: 599,
  recharge3Credits: 500,
  recharge3Price: 999,

  costGenerateScript: 15,
  costGenerateLogo: 30,
  costSwotAnalysis: 30,
  costCompetitorAnalysis: 50,
  costStrategyBuilder: 70,
  costCrmLeadInsight: 10,
  costTelegramAgent: 5,
  costTelegramBroadcast: 15,
  costIcpAnalysis: 25,
  costMarketingFunnel: 35,
  costMarketingOffer: 25,
  costContentIdeas: 20,
  costContentHook: 10,
  costAutomationExecution: 15,
  costGrowthIntelReport: 40,
  costCreatorMonetization: 30,
  costSocialTrendAnalysis: 20,
  costBioLinkAi: 15,
  costLandingPageAi: 50,
  costCourseOutline: 45,
  costDigitalProductGenerator: 40,
  costNicheBrandIdentity: 35,
  costCommunityAiReply: 5,
  costDesignBanner: 25,
  costTaskAiBreakdown: 10,
  costCalendarSchedule: 10,
  costOpsFinanceInsight: 20,
  aiToolsConfig: [],
  customPlans: [],
  customRechargePacks: []
};

const AiSettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const isRTL = i18n.language?.startsWith('ar');

  const [activeSubTab, setActiveSubTab] = useState('config'); // 'config' | 'logs' | 'analytics'
  const [settings, setSettings] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // API Key Testing states
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Advanced Logs & Analytics State
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTool, setFilterTool] = useState('all');
  const [filterModel, setFilterModel] = useState('all');
  const [timeRange, setTimeRange] = useState('all'); // 'all' | 'today' | 'week' | 'month' | 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination State for Logs
  const [logPage, setLogPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(25);

  useEffect(() => {
    setLogPage(1);
  }, [searchTerm, filterTool, filterModel, timeRange, startDate, endDate]);

  // Refill Modal state
  const [refillModalUser, setRefillModalUser] = useState(null); // { userId, email, name, currentCredits }
  const [refillAmount, setRefillAmount] = useState('');
  const [refilling, setRefilling] = useState(false);

  const [globalStats, setGlobalStats] = useState({
    totalAiSpend: 0,
    totalAiTokens: 0,
    totalAiCalls: 0
  });

  // Load global AI configuration & reactive aggregates
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsub = onSnapshot(doc(db, 'tenants', 'global'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSettings({
          openaiApiKey: data.openaiApiKey || '',
          defaultUserCredit: data.defaultUserCredit !== undefined ? Number(data.defaultUserCredit) : 5.00,
          creditsPerDollar: data.creditsPerDollar !== undefined ? Number(data.creditsPerDollar) : 100,
          openaiModel: data.openaiModel || 'gpt-4o-mini',
          aiEnabled: data.aiEnabled !== false,
          aiMarkupMultiplier: data.aiMarkupMultiplier !== undefined ? Number(data.aiMarkupMultiplier) : 1.0,
          creditMonthlyPlan: data.creditMonthlyPlan !== undefined ? Number(data.creditMonthlyPlan) : 10.00,
          creditAnnualPlan: data.creditAnnualPlan !== undefined ? Number(data.creditAnnualPlan) : 120.00,
          creditLifetimePlan: data.creditLifetimePlan !== undefined ? Number(data.creditLifetimePlan) : 500.00,
          aiTemperature: data.aiTemperature !== undefined ? Number(data.aiTemperature) : 0.7,
          aiMaxTokens: data.aiMaxTokens !== undefined ? Number(data.aiMaxTokens) : 1000,
          aiSystemInstruction: data.aiSystemInstruction || '',
          aiMaxMonthlyBudget: data.aiMaxMonthlyBudget !== undefined ? Number(data.aiMaxMonthlyBudget) : 100.00,

          planStarterName: data.planStarterName || 'Starter',
          planStarterPrice: data.planStarterPrice !== undefined ? Number(data.planStarterPrice) : 499,
          planStarterCredits: data.planStarterCredits !== undefined ? Number(data.planStarterCredits) : 200,
          planGrowthName: data.planGrowthName || 'Growth',
          planGrowthPrice: data.planGrowthPrice !== undefined ? Number(data.planGrowthPrice) : 799,
          planGrowthCredits: data.planGrowthCredits !== undefined ? Number(data.planGrowthCredits) : 600,
          planProName: data.planProName || 'Pro',
          planProPrice: data.planProPrice !== undefined ? Number(data.planProPrice) : 1497,
          planProCredits: data.planProCredits !== undefined ? Number(data.planProCredits) : 2000,

          recharge1Credits: data.recharge1Credits !== undefined ? Number(data.recharge1Credits) : 100,
          recharge1Price: data.recharge1Price !== undefined ? Number(data.recharge1Price) : 299,
          recharge2Credits: data.recharge2Credits !== undefined ? Number(data.recharge2Credits) : 250,
          recharge2Price: data.recharge2Price !== undefined ? Number(data.recharge2Price) : 599,
          recharge3Credits: data.recharge3Credits !== undefined ? Number(data.recharge3Credits) : 500,
          recharge3Price: data.recharge3Price !== undefined ? Number(data.recharge3Price) : 999,

          costGenerateScript: data.costGenerateScript !== undefined ? Number(data.costGenerateScript) : 15,
          costGenerateLogo: data.costGenerateLogo !== undefined ? Number(data.costGenerateLogo) : 30,
          costSwotAnalysis: data.costSwotAnalysis !== undefined ? Number(data.costSwotAnalysis) : 30,
          costCompetitorAnalysis: data.costCompetitorAnalysis !== undefined ? Number(data.costCompetitorAnalysis) : 50,
          costStrategyBuilder: data.costStrategyBuilder !== undefined ? Number(data.costStrategyBuilder) : 70,
          costCrmLeadInsight: data.costCrmLeadInsight !== undefined ? Number(data.costCrmLeadInsight) : 10,
          costTelegramAgent: data.costTelegramAgent !== undefined ? Number(data.costTelegramAgent) : 5,
          costTelegramBroadcast: data.costTelegramBroadcast !== undefined ? Number(data.costTelegramBroadcast) : 15,
          costIcpAnalysis: data.costIcpAnalysis !== undefined ? Number(data.costIcpAnalysis) : 25,
          costMarketingFunnel: data.costMarketingFunnel !== undefined ? Number(data.costMarketingFunnel) : 35,
          costMarketingOffer: data.costMarketingOffer !== undefined ? Number(data.costMarketingOffer) : 25,
          costContentIdeas: data.costContentIdeas !== undefined ? Number(data.costContentIdeas) : 20,
          costContentHook: data.costContentHook !== undefined ? Number(data.costContentHook) : 10,
          costAutomationExecution: data.costAutomationExecution !== undefined ? Number(data.costAutomationExecution) : 15,
          costGrowthIntelReport: data.costGrowthIntelReport !== undefined ? Number(data.costGrowthIntelReport) : 40,
          costCreatorMonetization: data.costCreatorMonetization !== undefined ? Number(data.costCreatorMonetization) : 30,
          costSocialTrendAnalysis: data.costSocialTrendAnalysis !== undefined ? Number(data.costSocialTrendAnalysis) : 20,
          costBioLinkAi: data.costBioLinkAi !== undefined ? Number(data.costBioLinkAi) : 15,
          costLandingPageAi: data.costLandingPageAi !== undefined ? Number(data.costLandingPageAi) : 50,
          costCourseOutline: data.costCourseOutline !== undefined ? Number(data.costCourseOutline) : 45,
          costDigitalProductGenerator: data.costDigitalProductGenerator !== undefined ? Number(data.costDigitalProductGenerator) : 40,
          costNicheBrandIdentity: data.costNicheBrandIdentity !== undefined ? Number(data.costNicheBrandIdentity) : 35,
          costCommunityAiReply: data.costCommunityAiReply !== undefined ? Number(data.costCommunityAiReply) : 5,
          costDesignBanner: data.costDesignBanner !== undefined ? Number(data.costDesignBanner) : 25,
          costTaskAiBreakdown: data.costTaskAiBreakdown !== undefined ? Number(data.costTaskAiBreakdown) : 10,
          costCalendarSchedule: data.costCalendarSchedule !== undefined ? Number(data.costCalendarSchedule) : 10,
          costOpsFinanceInsight: data.costOpsFinanceInsight !== undefined ? Number(data.costOpsFinanceInsight) : 20,
          aiToolsConfig: data.aiToolsConfig || [],
          customPlans: Array.isArray(data.customPlans) ? data.customPlans : [],
          customRechargePacks: Array.isArray(data.customRechargePacks) ? data.customRechargePacks : []
        });
        setGlobalStats({
          totalAiSpend: data.totalAiSpend !== undefined ? Number(data.totalAiSpend) : 0,
          totalAiTokens: data.totalAiTokens !== undefined ? Number(data.totalAiTokens) : 0,
          totalAiCalls: data.totalAiCalls !== undefined ? Number(data.totalAiCalls) : 0
        });
      }
    }, (err) => {
      console.error(err);
      setLoadError(isRTL ? 'حدث خطأ أثناء تحميل البيانات' : 'Error loading settings');
    });
    return () => unsub();
  }, [currentUser?.uid, isRTL]);

  // Load live AI logs when switching to logs or analytics sub-tabs
  useEffect(() => {
    if (activeSubTab !== 'logs' && activeSubTab !== 'analytics') return;
    setLoadingLogs(true);
    const q = query(collection(db, 'ai_logs'), orderBy('timestamp', 'desc'), limit(1000));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = [];
      snapshot.forEach(docSnap => {
        docs.push({ id: docSnap.id, ...docSnap.data() });
      });
      setLogs(docs);
      setLoadingLogs(false);
    }, (err) => {
      console.error("Error fetching AI logs:", err);
      setLoadingLogs(false);
    });
    return () => unsubscribe();
  }, [activeSubTab]);

  const handleFieldChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddCustomPlan = () => {
    const newPlan = {
      id: 'custom_plan_' + Date.now(),
      name: isRTL ? 'باقة مخصصة جديدة' : 'New Custom Plan',
      price: 999,
      credits: 15000,
      icon: '🚀'
    };
    setSettings(prev => ({
      ...prev,
      customPlans: [...(prev.customPlans || []), newPlan]
    }));
  };

  const handleUpdateCustomPlan = (id, field, value) => {
    setSettings(prev => ({
      ...prev,
      customPlans: (prev.customPlans || []).map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const handleDeleteCustomPlan = (id) => {
    setSettings(prev => ({
      ...prev,
      customPlans: (prev.customPlans || []).filter(p => p.id !== id)
    }));
  };

  const handleAddCustomRechargePack = () => {
    const newPack = {
      id: 'custom_recharge_' + Date.now(),
      name: isRTL ? 'حزمة شحن مخصصة' : 'Custom Recharge Pack',
      price: 499,
      credits: 5000,
      icon: '⚡'
    };
    setSettings(prev => ({
      ...prev,
      customRechargePacks: [...(prev.customRechargePacks || []), newPack]
    }));
  };

  const handleUpdateCustomRechargePack = (id, field, value) => {
    setSettings(prev => ({
      ...prev,
      customRechargePacks: (prev.customRechargePacks || []).map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const handleDeleteCustomRechargePack = (id) => {
    setSettings(prev => ({
      ...prev,
      customRechargePacks: (prev.customRechargePacks || []).filter(p => p.id !== id)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'tenants', 'global'), {
        openaiApiKey: settings.openaiApiKey,
        defaultUserCredit: Number(settings.defaultUserCredit),
        creditsPerDollar: Number(settings.creditsPerDollar || 100),
        openaiModel: settings.openaiModel,
        aiEnabled: settings.aiEnabled,
        aiMarkupMultiplier: Number(settings.aiMarkupMultiplier),
        creditMonthlyPlan: Number(settings.creditMonthlyPlan),
        creditAnnualPlan: Number(settings.creditAnnualPlan),
        creditLifetimePlan: Number(settings.creditLifetimePlan),
        aiTemperature: Number(settings.aiTemperature),
        aiMaxTokens: Number(settings.aiMaxTokens),
        aiSystemInstruction: settings.aiSystemInstruction,
        aiMaxMonthlyBudget: Number(settings.aiMaxMonthlyBudget || 100.00),

        planStarterName: settings.planStarterName,
        planStarterPrice: Number(settings.planStarterPrice),
        planStarterCredits: Number(settings.planStarterCredits),
        planGrowthName: settings.planGrowthName,
        planGrowthPrice: Number(settings.planGrowthPrice),
        planGrowthCredits: Number(settings.planGrowthCredits),
        planProName: settings.planProName,
        planProPrice: Number(settings.planProPrice),
        planProCredits: Number(settings.planProCredits),

        recharge1Credits: Number(settings.recharge1Credits),
        recharge1Price: Number(settings.recharge1Price),
        recharge2Credits: Number(settings.recharge2Credits),
        recharge2Price: Number(settings.recharge2Price),
        recharge3Credits: Number(settings.recharge3Credits),
        recharge3Price: Number(settings.recharge3Price),

        costGenerateScript: Number(settings.costGenerateScript),
        costGenerateLogo: Number(settings.costGenerateLogo),
        costSwotAnalysis: Number(settings.costSwotAnalysis),
        costCompetitorAnalysis: Number(settings.costCompetitorAnalysis),
        costStrategyBuilder: Number(settings.costStrategyBuilder),
        costCrmLeadInsight: Number(settings.costCrmLeadInsight),
        costTelegramAgent: Number(settings.costTelegramAgent),
        costTelegramBroadcast: Number(settings.costTelegramBroadcast),
        costIcpAnalysis: Number(settings.costIcpAnalysis),
        costMarketingFunnel: Number(settings.costMarketingFunnel),
        costMarketingOffer: Number(settings.costMarketingOffer),
        costContentIdeas: Number(settings.costContentIdeas),
        costContentHook: Number(settings.costContentHook),
        costAutomationExecution: Number(settings.costAutomationExecution),
        costGrowthIntelReport: Number(settings.costGrowthIntelReport),
        costCreatorMonetization: Number(settings.costCreatorMonetization),
        costSocialTrendAnalysis: Number(settings.costSocialTrendAnalysis),
        costBioLinkAi: Number(settings.costBioLinkAi),
        costLandingPageAi: Number(settings.costLandingPageAi),
        costCourseOutline: Number(settings.costCourseOutline),
        costDigitalProductGenerator: Number(settings.costDigitalProductGenerator),
        costNicheBrandIdentity: Number(settings.costNicheBrandIdentity),
        costCommunityAiReply: Number(settings.costCommunityAiReply),
        costDesignBanner: Number(settings.costDesignBanner),
        costTaskAiBreakdown: Number(settings.costTaskAiBreakdown),
        costCalendarSchedule: Number(settings.costCalendarSchedule),
        costOpsFinanceInsight: Number(settings.costOpsFinanceInsight),
        aiToolsConfig: settings.aiToolsConfig || [],
        customPlans: settings.customPlans || [],
        customRechargePacks: settings.customRechargePacks || [],

        updatedAt: serverTimestamp(),
      }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const testApiKeyConnection = async () => {
    if (!settings.openaiApiKey) {
      setTestResult({ success: false, error: isRTL ? 'الرجاء إدخال المفتاح أولاً' : 'Please enter the API key first' });
      return;
    }
    setTestingKey(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ai/test-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey: settings.openaiApiKey })
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true, modelsCount: data.modelsCount });
      } else {
        setTestResult({ success: false, error: data.error });
      }
    } catch (e) {
      setTestResult({ success: false, error: e.message || 'Error connecting to test route' });
    } finally {
      setTestingKey(false);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULTS);
    setSaved(false);
    setTestResult(null);
  };

  // Filter logs by date range
  const filterLogsByDate = (logList) => {
    const now = new Date();
    return logList.filter(log => {
      const ts = log.timestamp;
      const dateObj = ts?.toDate ? ts.toDate() : (ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts));

      if (timeRange === 'today') {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return dateObj >= todayStart;
      }
      if (timeRange === 'week') {
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return dateObj >= weekStart;
      }
      if (timeRange === 'month') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return dateObj >= monthStart;
      }
      if (timeRange === 'custom') {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (dateObj < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (dateObj > end) return false;
        }
      }
      return true;
    });
  };

  const dateFilteredLogs = filterLogsByDate(logs);

  // Compute stats for Analytics Dashboard (from date-filtered logs!)
  const getAnalytics = () => {
    const userStats = {};
    const toolStats = {};

    dateFilteredLogs.forEach(log => {
      // User Aggregates
      const userKey = log.userEmail || log.userId || 'Unknown User';
      if (!userStats[userKey]) {
        userStats[userKey] = { email: userKey, name: log.userName || '', cost: 0, credits: 0, calls: 0, userId: log.userId };
      }
      userStats[userKey].cost += (log.cost || 0);
      userStats[userKey].credits += (log.creditsDeducted || 0);
      userStats[userKey].calls += 1;

      // Tool Aggregates
      const toolKey = log.tool || 'General';
      if (!toolStats[toolKey]) {
        toolStats[toolKey] = { tool: toolKey, cost: 0, credits: 0, calls: 0 };
      }
      toolStats[toolKey].cost += (log.cost || 0);
      toolStats[toolKey].credits += (log.creditsDeducted || 0);
      toolStats[toolKey].calls += 1;
    });

    const topUsers = Object.values(userStats)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);

    const topTools = Object.values(toolStats)
      .sort((a, b) => b.calls - a.calls)
      .slice(0, 5);

    return { topUsers, topTools };
  };

  const { topUsers, topTools } = getAnalytics();

  // Compute dynamic stats for the selected period
  const getPeriodStats = () => {
    let spend = 0;
    let tokens = 0;
    let calls = dateFilteredLogs.length;

    dateFilteredLogs.forEach(l => {
      spend += (l.cost || 0);
      tokens += ((l.inputTokens || 0) + (l.outputTokens || 0));
    });

    return {
      totalAiSpend: timeRange === 'all' ? globalStats.totalAiSpend : spend,
      totalAiTokens: timeRange === 'all' ? globalStats.totalAiTokens : tokens,
      totalAiCalls: timeRange === 'all' ? globalStats.totalAiCalls : calls
    };
  };

  const periodStats = getPeriodStats();

  // Dynamic filter lists
  const uniqueTools = Array.from(new Set(logs.map(l => l.tool || 'General')));
  const uniqueModels = Array.from(new Set(logs.map(l => l.model).filter(Boolean)));

  // Filter logs for search and dropdown filters (from date-filtered logs!)
  const filteredLogs = dateFilteredLogs.filter(log => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      (log.userEmail || '').toLowerCase().includes(term) ||
      (log.userName || '').toLowerCase().includes(term) ||
      (log.tool || '').toLowerCase().includes(term) ||
      (log.model || '').toLowerCase().includes(term)
    );
    const matchesTool = filterTool === 'all' || (log.tool || 'General') === filterTool;
    const matchesModel = filterModel === 'all' || log.model === filterModel;
    return matchesSearch && matchesTool && matchesModel;
  });

  // Export filtered logs to CSV file
  const exportLogsToCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = isRTL
      ? ['المستخدم', 'البريد الإلكتروني', 'الأداة', 'النموذج', 'المدخلات (Tokens)', 'المخرجات (Tokens)', 'التكلفة ($)', 'الوقت']
      : ['User', 'Email', 'Tool', 'Model', 'Input Tokens', 'Output Tokens', 'Cost ($)', 'Timestamp'];
    const rows = filteredLogs.map(log => {
      const ts = log.timestamp;
      const dateObj = ts?.toDate ? ts.toDate() : (ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts));
      const dateStr = dateObj.toISOString().replace(/T/, ' ').replace(/\..+/, '');
      return [
        log.userName || 'Anonymous',
        log.userEmail || '',
        log.tool || 'General',
        log.model || '',
        log.inputTokens || 0,
        log.outputTokens || 0,
        Number(log.cost || 0).toFixed(6),
        dateStr
      ];
    });
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ai_usage_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open quick refill modal
  const openRefillModal = async (userId, email, name) => {
    setRefillModalUser({ userId, email, name, currentCredits: '...' });
    setRefillAmount('');
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setRefillModalUser({
          userId,
          email,
          name,
          currentCredits: data.aiCredits !== undefined ? Math.round(Number(data.aiCredits)).toString() : '500'
        });
      } else {
        setRefillModalUser(prev => ({ ...prev, currentCredits: '0' }));
      }
    } catch (e) {
      console.error(e);
      setRefillModalUser(prev => ({ ...prev, currentCredits: '0' }));
    }
  };

  // Submit quick credit refill to Firestore
  const handleRefillSubmit = async () => {
    if (!refillModalUser?.userId || !refillAmount) return;
    setRefilling(true);
    try {
      const userRef = doc(db, 'users', refillModalUser.userId);
      const amountToAdd = Number(refillAmount);
      if (isNaN(amountToAdd)) {
        alert(isRTL ? 'الرجاء إدخال رقم صحيح' : 'Please enter a valid number');
        setRefilling(false);
        return;
      }
      const currentVal = refillModalUser.currentCredits === '...' ? 0 : Number(refillModalUser.currentCredits);
      const newVal = Math.round(Math.max(0, currentVal + amountToAdd));
      await updateDoc(userRef, {
        aiCredits: newVal
      });
      alert(isRTL ? 'تم شحن الرصيد بنجاح!' : 'Credits refilled successfully!');
      setRefillModalUser(null);
    } catch (err) {
      console.error(err);
      alert(isRTL ? 'فشل شحن الرصيد' : 'Failed to refill credits');
    } finally {
      setRefilling(false);
    }
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text2)',
    marginBottom: '6px',
    textTransform: 'uppercase',
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--bg3)',
    border: '1px solid var(--line2)',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '13px',
    color: 'var(--text)',
    outline: 'none',
    fontFamily: 'var(--font)',
    transition: 'border-color 0.2s',
  };

  const cardStyle = {
    background: 'var(--panel)',
    border: '1px solid var(--line)',
    borderRadius: '16px',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden'
  };

  const tableHeaderStyle = {
    padding: '12px 16px',
    fontSize: '12px',
    color: 'var(--text2)',
    fontWeight: 'bold',
    borderBottom: '1px solid var(--line)',
    textAlign: isRTL ? 'right' : 'left'
  };

  const tableRowStyle = {
    borderBottom: '1px solid var(--line2)',
    fontSize: '13px',
    color: 'var(--text)'
  };

  const tableCellStyle = {
    padding: '12px 16px',
    verticalAlign: 'middle'
  };

  return (
    <div className="ai-settings-container" style={{ animation: 'fadeSlide 0.4s ease', maxWidth: '1000px', margin: '0 auto', transition: 'max-width 0.3s ease' }}>
      <style>{`
        /* AI Settings Responsive Overrides */
        @media (max-width: 768px) {
          /* Container Padding */
          .ai-settings-container {
            padding: 10px 4px !important;
          }
          
          /* Sub Tabs Navigation */
          .ai-settings-subtabs {
            flex-wrap: wrap !important;
            gap: 6px !important;
            padding-bottom: 6px !important;
          }
          .ai-settings-tab-btn {
            flex: 1 1 calc(50% - 6px) !important; /* Stack to 2 columns on mobile */
            justify-content: center !important;
            padding: 8px 12px !important;
            font-size: 12px !important;
          }
          @media (max-width: 480px) {
            .ai-settings-tab-btn {
              flex: 1 1 100% !important; /* Full width stacked on very small mobile */
            }
          }
          
          /* Filter and search bar */
          .ai-settings-filter-bar {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 10px !important;
            padding: 12px 14px !important;
          }
          .ai-settings-filter-bar > div {
            width: 100% !important;
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
          }
          .ai-settings-filter-input {
            width: 100% !important;
          }
          .ai-settings-filter-bar .btn {
            width: 100% !important;
            justify-content: center !important;
          }
          .ai-settings-search-wrapper {
            width: 100% !important; /* Search bar input occupies full width */
          }

          /* Configuration forms */
          .ai-settings-config-card {
            padding: 14px !important;
          }
          .ai-settings-credits-grid {
            grid-template-columns: 1fr !important; /* Stack monthly/annual/lifetime credit fields */
            gap: 10px !important;
          }
          .ai-settings-params-grid {
            grid-template-columns: 1fr !important; /* Stack temperature/max tokens/safety budget */
            gap: 10px !important;
          }

          /* Table responsiveness & Typography */
          .ai-settings-logs-table {
            min-width: 800px !important;
          }
          .ai-settings-table-header {
            padding: 8px 6px !important;
            font-size: 11px !important;
            white-space: nowrap !important;
          }
          .ai-settings-table-cell {
            padding: 8px 6px !important;
            font-size: 11.5px !important;
            white-space: nowrap !important;
          }
          .ai-settings-table-cell code, 
          .ai-settings-table-cell span, 
          .ai-settings-table-cell div {
            font-size: 11px !important;
            white-space: nowrap !important;
            display: inline-block !important;
          }
          .ai-settings-table-cell div {
            display: block !important;
          }
          
          /* Pagination Bar wrapping */
          .ai-settings-pagination {
            flex-direction: column !important;
            align-items: center !important;
            gap: 10px !important;
            padding: 12px 10px !important;
          }
          
          /* Stats Cards Grid (Analytics Dashboard) */
          .ai-settings-stats-grid {
            grid-template-columns: 1fr !important; /* Stacks 3 cards vertically */
            gap: 10px !important;
          }
          .ai-settings-stats-card {
            padding: 14px !important;
          }
          .ai-settings-stats-val {
            font-size: 22px !important; /* Shrink text size of large currency values */
          }

          /* Detailed Tables Grid (Top Users & Features) */
          .ai-settings-detailed-grid {
            grid-template-columns: 1fr !important; /* Stacks Top Users and Top Features side-by-side grids vertically */
            gap: 12px !important;
          }
        }
      `}</style>

      {/* Sub Tabs Navigation */}
      <div className="ai-settings-subtabs" style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
        <button
          onClick={() => setActiveSubTab('config')}
          className="ai-settings-tab-btn"
          style={{
            background: activeSubTab === 'config' ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            color: activeSubTab === 'config' ? 'var(--orange)' : 'var(--text2)',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Settings size={14} />
          <span>{isRTL ? 'إعدادات الخدمة' : 'AI Config'}</span>
        </button>
        <button
          onClick={() => setActiveSubTab('logs')}
          className="ai-settings-tab-btn"
          style={{
            background: activeSubTab === 'logs' ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            color: activeSubTab === 'logs' ? 'var(--orange)' : 'var(--text2)',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <List size={14} />
          <span>{isRTL ? 'سجل الاستهلاك الفعلي' : 'Live Usage Logs'}</span>
        </button>
        <button
          onClick={() => setActiveSubTab('analytics')}
          className="ai-settings-tab-btn"
          style={{
            background: activeSubTab === 'analytics' ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            color: activeSubTab === 'analytics' ? 'var(--orange)' : 'var(--text2)',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <BarChart2 size={14} />
          <span>{isRTL ? 'لوحة التحليلات' : 'Analytics Dashboard'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('tools')}
          className="ai-settings-tab-btn"
          style={{
            background: activeSubTab === 'tools' ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            color: activeSubTab === 'tools' ? 'var(--orange)' : 'var(--text2)',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Settings size={14} />
          <span>{isRTL ? 'صلاحيات الأدوات' : 'Tools Permissions'}</span>
        </button>

      </div>

      {activeSubTab !== 'config' && activeSubTab !== 'tools' && (
        <div className="card ai-settings-filter-bar" style={{
          ...cardStyle,
          marginBottom: '16px',
          padding: '12px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 'bold', color: 'var(--text)' }}>
            <span>📅 {isRTL ? 'تصفية الفترة الزمنية:' : 'Filter Time Period:'}</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              className="ai-settings-filter-input"
              style={{
                background: 'var(--bg3)',
                border: '1px solid var(--line2)',
                color: 'var(--text)',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12.5px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">{isRTL ? 'كل الأوقات' : 'All Time'}</option>
              <option value="today">{isRTL ? 'اليوم' : 'Today'}</option>
              <option value="week">{isRTL ? 'هذا الأسبوع' : 'This Week'}</option>
              <option value="month">{isRTL ? 'هذا الشهر' : 'This Month'}</option>
              <option value="custom">{isRTL ? 'فترة مخصصة...' : 'Custom Range...'}</option>
            </select>

            {timeRange === 'custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="ai-settings-filter-input"
                  style={{
                    background: 'var(--bg3)',
                    border: '1px solid var(--line2)',
                    color: 'var(--text)',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{isRTL ? 'إلى' : 'to'}</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="ai-settings-filter-input"
                  style={{
                    background: 'var(--bg3)',
                    border: '1px solid var(--line2)',
                    color: 'var(--text)',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    outline: 'none'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {loadError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px', border: '1px solid rgba(239,68,68,0.2)' }}>
          ⚠️ {loadError}
        </div>
      )}

      {/* SUB TAB 1: CONFIGURATION */}
      {activeSubTab === 'config' && (
        <>
          <div className="card ai-settings-config-card" style={cardStyle}>
            <div style={{
              position: 'absolute',
              top: '-100px',
              right: '-100px',
              width: '240px',
              height: '240px',
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0
            }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '800', color: 'var(--text)', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid var(--line)' }}>
              <Cpu size={16} style={{ color: 'var(--accent)' }} />
              <span>{isRTL ? 'إعدادات مفتاح الذكاء الاصطناعي (OpenAI)' : 'OpenAI AI Integration Settings'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 }}>
              {/* OpenAI API Key */}
              <div>
                <label style={labelStyle}>
                  <Key size={12} style={{ marginInlineEnd: '4px', verticalAlign: 'middle' }} />
                  {isRTL ? 'مفتاح OpenAI API (Secret Key)' : 'OpenAI API Secret Key'}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={settings.openaiApiKey}
                    onChange={e => handleFieldChange('openaiApiKey', e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    onClick={testApiKeyConnection}
                    disabled={testingKey}
                    style={{
                      background: 'var(--bg3)',
                      border: '1.5px solid var(--orange)',
                      borderRadius: '10px',
                      padding: '0 16px',
                      color: 'var(--orange)',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {testingKey ? (isRTL ? 'جاري التحقق...' : 'Testing...') : (isRTL ? 'تحقق من المفتاح' : 'Test Key')}
                  </button>
                </div>
                {testResult && (
                  <div style={{
                    fontSize: '12px',
                    marginTop: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid',
                    backgroundColor: testResult.success ? 'rgba(40, 200, 64, 0.08)' : 'rgba(255, 95, 87, 0.08)',
                    borderColor: testResult.success ? 'rgba(40, 200, 64, 0.2)' : 'rgba(255, 95, 87, 0.2)',
                    color: testResult.success ? 'var(--green, #28c840)' : 'var(--red, #ff5f57)'
                  }}>
                    {testResult.success
                      ? (isRTL ? `✓ المفتاح يعمل بنجاح! تم استيراد عدد النماذج المتوفرة: ${testResult.modelsCount}` : `✓ Key verified! Successfully loaded ${testResult.modelsCount} models.`)
                      : (isRTL ? `⚠️ خطأ في التحقق: ${testResult.error}` : `⚠️ Verification failed: ${testResult.error}`)
                    }
                  </div>
                )}
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
                  {isRTL ? 'سيتم استخدام هذا المفتاح لتشغيل جميع استفسارات الذكاء الاصطناعي لجميع مستخدمي المنصة.' : 'All users will run their queries using this global API key.'}
                </div>
              </div>

              {/* Grid: Financial & Conversion configurations */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {/* Default User Credit */}
                <div>
                  <label style={labelStyle}>
                    <DollarSign size={12} style={{ marginInlineEnd: '4px', verticalAlign: 'middle' }} />
                    {isRTL ? 'الرصيد الافتراضي للمستخدمين الجدد ($)' : 'Default Starting Balance for New Users ($)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="5.00"
                    value={settings.defaultUserCredit}
                    onChange={e => handleFieldChange('defaultUserCredit', e.target.value)}
                    style={inputStyle}
                  />
                  <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
                    {isRTL ? 'قيمة الرصيد المالي الافتراضي الذي يحصل عليه المستخدم الجديد.' : 'The default starting dollar balance for new accounts.'}
                  </div>
                </div>

                {/* Credits Per Dollar */}
                <div>
                  <label style={labelStyle}>
                    <RefreshCw size={12} style={{ marginInlineEnd: '4px', verticalAlign: 'middle' }} />
                    {isRTL ? 'عدد الكريديت مقابل الدولار الواحد' : 'Credits Per One Dollar ($1)'}
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    placeholder="100"
                    value={settings.creditsPerDollar || 100}
                    onChange={e => handleFieldChange('creditsPerDollar', e.target.value)}
                    style={inputStyle}
                  />
                  <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
                    {isRTL
                      ? `معدل التحويل: $1 دولار يساوي ${settings.creditsPerDollar || 100} كريديت.`
                      : `Conversion rate: $1 equals ${settings.creditsPerDollar || 100} credits.`
                    }
                  </div>
                </div>

                {/* Pricing Markup Multiplier */}
                <div>
                  <label style={labelStyle}>
                    <DollarSign size={12} style={{ marginInlineEnd: '4px', verticalAlign: 'middle' }} />
                    {isRTL ? 'مضاعف تسعير الاستهلاك للمستخدمين' : 'Usage Markup Cost Multiplier'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="1.0"
                    value={settings.aiMarkupMultiplier}
                    onChange={e => handleFieldChange('aiMarkupMultiplier', e.target.value)}
                    style={inputStyle}
                  />
                  <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
                    {isRTL
                      ? 'يتم ضرب تكلفة الاستهلاك الحقيقية بهذا الرقم عند الخصم.'
                      : 'Deducted credits are multiplied by this factor.'}
                  </div>
                </div>
              </div>

              {/* Grid: Execution & Status configurations */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {/* Model Selection */}
                <div>
                  <label style={labelStyle}>
                    <Cpu size={12} style={{ marginInlineEnd: '4px', verticalAlign: 'middle' }} />
                    {isRTL ? 'النموذج الافتراضي للذكاء الاصطناعي' : 'Default AI Model Selection'}
                  </label>
                  <select
                    value={settings.openaiModel}
                    onChange={e => handleFieldChange('openaiModel', e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    <option value="gpt-4o-mini">GPT-4o-Mini (Recommended/Cost-efficient)</option>
                    <option value="gpt-4o">GPT-4o (High intelligence / Standard rates)</option>
                    <option value="o3-mini">o3-mini (Reasoning / Advanced tasks)</option>
                    <option value="o1">o1 (Full Reasoning / Premium rates)</option>
                    <option value="gpt-3.5-turbo">GPT-3.5-Turbo (Legacy)</option>
                  </select>
                </div>

                {/* Global AI Switch (Master Enable/Disable) */}
                <div>
                  <label style={labelStyle}>
                    <Settings size={12} style={{ marginInlineEnd: '4px', verticalAlign: 'middle' }} />
                    {isRTL ? 'حالة خدمات الذكاء الاصطناعي' : 'Global AI Status'}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg3)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--line2)', height: '44px' }}>
                    <input
                      type="checkbox"
                      id="aiEnabledSwitch"
                      checked={settings.aiEnabled}
                      onChange={e => handleFieldChange('aiEnabled', e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="aiEnabledSwitch" style={{ fontSize: '13px', color: 'var(--text)', cursor: 'pointer', userSelect: 'none', fontWeight: 'bold' }}>
                      {settings.aiEnabled
                        ? (isRTL ? '🟢 مفعّل بالكامل لجميع المستخدمين' : '🟢 Fully Enabled for all users')
                        : (isRTL ? '🔴 معطّل وموقوف بالكامل للمنصة' : '🔴 Fully Disabled globally')
                      }
                    </label>
                  </div>
                </div>
              </div>

              {/* Divider: Subscription Packages Settings */}
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px', marginTop: '8px' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '12px' }}>
                  {isRTL ? 'إعدادات باقات الاشتراك الأساسية (Subscription Plans)' : 'Subscription Plans Settings'}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  {/* Starter Plan */}
                  <div style={{ background: 'var(--bg2)', padding: '14px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '10px', color: 'var(--text)', fontSize: '13px' }}>
                      Starter Plan
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'اسم الباقة' : 'Plan Name'}</label>
                        <input type="text" value={settings.planStarterName || ''} onChange={e => handleFieldChange('planStarterName', e.target.value)} style={inputStyle} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'السعر (ج.م)' : 'Price (EGP)'}</label>
                          <input type="number" value={settings.planStarterPrice || 0} onChange={e => handleFieldChange('planStarterPrice', e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'الكريديت' : 'Credits'}</label>
                          <input type="number" value={settings.planStarterCredits || 0} onChange={e => handleFieldChange('planStarterCredits', e.target.value)} style={inputStyle} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Growth Plan */}
                  <div style={{ background: 'var(--bg2)', padding: '14px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '10px', color: 'var(--text)', fontSize: '13px' }}>
                      Growth Plan
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'اسم الباقة' : 'Plan Name'}</label>
                        <input type="text" value={settings.planGrowthName || ''} onChange={e => handleFieldChange('planGrowthName', e.target.value)} style={inputStyle} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'السعر (ج.م)' : 'Price (EGP)'}</label>
                          <input type="number" value={settings.planGrowthPrice || 0} onChange={e => handleFieldChange('planGrowthPrice', e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'الكريديت' : 'Credits'}</label>
                          <input type="number" value={settings.planGrowthCredits || 0} onChange={e => handleFieldChange('planGrowthCredits', e.target.value)} style={inputStyle} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pro Plan */}
                  <div style={{ background: 'var(--bg2)', padding: '14px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '10px', color: 'var(--text)', fontSize: '13px' }}>
                      Pro Plan
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'اسم الباقة' : 'Plan Name'}</label>
                        <input type="text" value={settings.planProName || ''} onChange={e => handleFieldChange('planProName', e.target.value)} style={inputStyle} />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'السعر (ج.م)' : 'Price (EGP)'}</label>
                          <input type="number" value={settings.planProPrice || 0} onChange={e => handleFieldChange('planProPrice', e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'الكريديت' : 'Credits'}</label>
                          <input type="number" value={settings.planProCredits || 0} onChange={e => handleFieldChange('planProCredits', e.target.value)} style={inputStyle} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Custom Subscription Plans */}
                  {(settings.customPlans || []).map((plan) => (
                    <div key={plan.id} style={{ background: 'var(--bg2)', padding: '14px', borderRadius: '12px', border: '1px dashed var(--accent)', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--accent)', fontSize: '13px' }}>
                          {plan.name || (isRTL ? 'باقة مخصصة' : 'Custom Plan')}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomPlan(plan.id)}
                          style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer' }}
                        >
                          🗑️ {isRTL ? 'حذف' : 'Delete'}
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'اسم الباقة' : 'Plan Name'}</label>
                            <input type="text" value={plan.name || ''} onChange={e => handleUpdateCustomPlan(plan.id, 'name', e.target.value)} style={inputStyle} />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'الأيقونة' : 'Icon'}</label>
                            <input type="text" value={plan.icon || '🚀'} onChange={e => handleUpdateCustomPlan(plan.id, 'icon', e.target.value)} style={inputStyle} />
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'السعر (ج.م)' : 'Price (EGP)'}</label>
                            <input type="number" value={plan.price || 0} onChange={e => handleUpdateCustomPlan(plan.id, 'price', e.target.value)} style={inputStyle} />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'الكريديت' : 'Credits'}</label>
                            <input type="number" value={plan.credits || 0} onChange={e => handleUpdateCustomPlan(plan.id, 'credits', e.target.value)} style={inputStyle} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={handleAddCustomPlan}
                    style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: 'var(--accent)',
                      border: '1px dashed var(--accent)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    ➕ {isRTL ? 'إضافة باقة اشتراك جديدة' : 'Add New Subscription Plan'}
                  </button>
                </div>
              </div>

              {/* Divider: Recharge Packages Settings */}
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '12px' }}>
                  {isRTL ? 'إعدادات حزم شحن الرصيد الإضافية (Refill / Recharge Packages)' : 'Credits Recharge Packages Settings'}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  {/* Package 1 */}
                  <div style={{ background: 'var(--bg2)', padding: '12px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)', fontSize: '12px' }}>
                      Recharge Pack 1
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'الكريديت' : 'Credits'}</label>
                        <input type="number" value={settings.recharge1Credits || 0} onChange={e => handleFieldChange('recharge1Credits', e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'السعر (ج.م)' : 'Price (EGP)'}</label>
                        <input type="number" value={settings.recharge1Price || 0} onChange={e => handleFieldChange('recharge1Price', e.target.value)} style={inputStyle} />
                      </div>
                    </div>
                  </div>

                  {/* Package 2 */}
                  <div style={{ background: 'var(--bg2)', padding: '12px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)', fontSize: '12px' }}>
                      Recharge Pack 2
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'الكريديت' : 'Credits'}</label>
                        <input type="number" value={settings.recharge2Credits || 0} onChange={e => handleFieldChange('recharge2Credits', e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'السعر (ج.م)' : 'Price (EGP)'}</label>
                        <input type="number" value={settings.recharge2Price || 0} onChange={e => handleFieldChange('recharge2Price', e.target.value)} style={inputStyle} />
                      </div>
                    </div>
                  </div>

                  {/* Package 3 */}
                  <div style={{ background: 'var(--bg2)', padding: '12px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)', fontSize: '12px' }}>
                      Recharge Pack 3
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'الكريديت' : 'Credits'}</label>
                        <input type="number" value={settings.recharge3Credits || 0} onChange={e => handleFieldChange('recharge3Credits', e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'السعر (ج.م)' : 'Price (EGP)'}</label>
                        <input type="number" value={settings.recharge3Price || 0} onChange={e => handleFieldChange('recharge3Price', e.target.value)} style={inputStyle} />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Custom Recharge Packages */}
                  {(settings.customRechargePacks || []).map((pack) => (
                    <div key={pack.id} style={{ background: 'var(--bg2)', padding: '12px', borderRadius: '10px', border: '1px dashed var(--orange)', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ fontWeight: 'bold', color: 'var(--orange)', fontSize: '12px' }}>
                          {pack.name || (isRTL ? 'حزمة مخصصة' : 'Custom Pack')}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomRechargePack(pack.id)}
                          style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer' }}
                        >
                          🗑️ {isRTL ? 'حذف' : 'Delete'}
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'اسم الحزمة' : 'Pack Name'}</label>
                            <input type="text" value={pack.name || ''} onChange={e => handleUpdateCustomRechargePack(pack.id, 'name', e.target.value)} style={inputStyle} />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'الأيقونة' : 'Icon'}</label>
                            <input type="text" value={pack.icon || '⚡'} onChange={e => handleUpdateCustomRechargePack(pack.id, 'icon', e.target.value)} style={inputStyle} />
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'الكريديت' : 'Credits'}</label>
                            <input type="number" value={pack.credits || 0} onChange={e => handleUpdateCustomRechargePack(pack.id, 'credits', e.target.value)} style={inputStyle} />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '2px' }}>{isRTL ? 'السعر (ج.م)' : 'Price (EGP)'}</label>
                            <input type="number" value={pack.price || 0} onChange={e => handleUpdateCustomRechargePack(pack.id, 'price', e.target.value)} style={inputStyle} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={handleAddCustomRechargePack}
                    style={{
                      background: 'rgba(249, 115, 22, 0.1)',
                      color: 'var(--orange)',
                      border: '1px dashed var(--orange)',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    ➕ {isRTL ? 'إضافة حزمة شحن رصيد جديدة' : 'Add New Recharge Pack'}
                  </button>
                </div>
              </div>

              {/* Divider: AI Tool Cost Settings */}
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⚡</span>
                  <span>{isRTL ? 'تسعير استهلاك الكريديت لجميع أدوات الذكاء الاصطناعي في المنصة' : 'All AI Tools Credits Cost Settings'}</span>
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '16px' }}>
                  {/* Strategy Lab */}
                  <div style={{ background: 'var(--bg2)', padding: '12px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', color: 'var(--orange)', marginBottom: '8px' }}>🧠 مختبر الاستراتيجية (Strategy Lab)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'بناء خطة الاستراتيجية الكاملة' : 'Strategy Builder Cost'}</label>
                        <input type="number" value={settings.costStrategyBuilder || 0} onChange={e => handleFieldChange('costStrategyBuilder', e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'تحليل المنافسين والفجوات' : 'Competitor Analysis Cost'}</label>
                        <input type="number" value={settings.costCompetitorAnalysis || 0} onChange={e => handleFieldChange('costCompetitorAnalysis', e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'تحليل SWOT الاستراتيجي' : 'SWOT Analysis Cost'}</label>
                        <input type="number" value={settings.costSwotAnalysis || 0} onChange={e => handleFieldChange('costSwotAnalysis', e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'تحليل العميل المثالي (ICP Profile)' : 'ICP Profile Cost'}</label>
                        <input type="number" value={settings.costIcpAnalysis || 0} onChange={e => handleFieldChange('costIcpAnalysis', e.target.value)} style={inputStyle} />
                      </div>
                    </div>
                  </div>

                  {/* Marketing OS & Content */}
                  <div style={{ background: 'var(--bg2)', padding: '12px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', color: 'var(--accent)', marginBottom: '8px' }}>📣 التسويق والمحتوى (Marketing & Content)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'توليد السكربت والمنشورات' : 'Generate Script & Post'}</label>
                        <input type="number" value={settings.costGenerateScript || 0} onChange={e => handleFieldChange('costGenerateScript', e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'توليد قمع المبيعات (Sales Funnel)' : 'Sales Funnel Cost'}</label>
                        <input type="number" value={settings.costMarketingFunnel || 0} onChange={e => handleFieldChange('costMarketingFunnel', e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'إنشاء العرض التسويقي (Offer)' : 'Offer Generator Cost'}</label>
                        <input type="number" value={settings.costMarketingOffer || 0} onChange={e => handleFieldChange('costMarketingOffer', e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'توليد خطة المحتوى (Content Ideas)' : 'Content Ideas Cost'}</label>
                        <input type="number" value={settings.costContentIdeas || 0} onChange={e => handleFieldChange('costContentIdeas', e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'صياغة الهوك والافتتاحية (Hooks)' : 'Content Hooks Cost'}</label>
                        <input type="number" value={settings.costContentHook || 0} onChange={e => handleFieldChange('costContentHook', e.target.value)} style={inputStyle} />
                      </div>
                    </div>
                  </div>

                  {/* Landing & Web Tools */}
                  <div style={{ background: 'var(--bg2)', padding: '12px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#10B981', marginBottom: '8px' }}>🌐 صفحات الهبوط والبايو (Landing & Bio)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'إنشاء صفحة هبوط بالذكاء (Landing Page)' : 'Landing Page AI Cost'}</label>
                        <input type="number" value={settings.costLandingPageAi || 0} onChange={e => handleFieldChange('costLandingPageAi', e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'توليد محتوى رابط البايو (Bio Link AI)' : 'Bio Link AI Cost'}</label>
                        <input type="number" value={settings.costBioLinkAi || 0} onChange={e => handleFieldChange('costBioLinkAi', e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'إنشاء المنتجات الرقمية (Digital Products)' : 'Digital Products Cost'}</label>
                        <input type="number" value={settings.costDigitalProductGenerator || 0} onChange={e => handleFieldChange('costDigitalProductGenerator', e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'إنشاء هياكل الكورسات (Courses AI)' : 'Courses AI Cost'}</label>
                        <input type="number" value={settings.costCourseOutline || 0} onChange={e => handleFieldChange('costCourseOutline', e.target.value)} style={inputStyle} />
                      </div>
                    </div>
                  </div>

                  {/* Design & Media */}
                  <div style={{ background: 'var(--bg2)', padding: '12px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#EC4899', marginBottom: '8px' }}>🎨 استوديو التصميم والصور (Design Studio)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'تصميم اللوجو بالـ AI (Logo Generator)' : 'Generate Logo Cost'}</label>
                        <input type="number" value={settings.costGenerateLogo || 0} onChange={e => handleFieldChange('costGenerateLogo', e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'تصميم البانر والسوشيال ميديا' : 'Design Banner Cost'}</label>
                        <input type="number" value={settings.costDesignBanner || 0} onChange={e => handleFieldChange('costDesignBanner', e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'هوية النيش والبراند (Brand Studio)' : 'Niche Brand Studio Cost'}</label>
                        <input type="number" value={settings.costNicheBrandIdentity || 0} onChange={e => handleFieldChange('costNicheBrandIdentity', e.target.value)} style={inputStyle} />
                      </div>
                    </div>
                  </div>

                  {/* Automation & Telegram */}
                  <div style={{ background: 'var(--bg2)', padding: '12px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#8B5CF6', marginBottom: '8px' }}>💬 التليجرام والأتمتة (Telegram & Automation)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'رد وكيل التليجرام الآلي (Telegram Agent)' : 'Telegram Agent Reply'}</label>
                        <input type="number" value={settings.costTelegramAgent || 0} onChange={e => handleFieldChange('costTelegramAgent', e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'حملات التليجرام الجماعية (Broadcast)' : 'Telegram Broadcast Cost'}</label>
                        <input type="number" value={settings.costTelegramBroadcast || 0} onChange={e => handleFieldChange('costTelegramBroadcast', e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'تنفيذ مسارات الأتمتة (Automation AI)' : 'Automation Execution Cost'}</label>
                        <input type="number" value={settings.costAutomationExecution || 0} onChange={e => handleFieldChange('costAutomationExecution', e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'تحليل صفقات CRM الذكي (Smart CRM)' : 'Smart CRM Lead Insight'}</label>
                        <input type="number" value={settings.costCrmLeadInsight || 0} onChange={e => handleFieldChange('costCrmLeadInsight', e.target.value)} style={inputStyle} />
                      </div>
                    </div>
                  </div>

                  {/* Intelligence & Operations */}
                  <div style={{ background: 'var(--bg2)', padding: '12px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#F59E0B', marginBottom: '8px' }}>📈 الاستخبارات والعمليات (Intel & Ops)</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'رادار استخبارات النمو (Growth Intel)' : 'Growth Intel Report'}</label>
                        <input type="number" value={settings.costGrowthIntelReport || 0} onChange={e => handleFieldChange('costGrowthIntelReport', e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'تحليل ترندات السوشيال (Social Trends)' : 'Social Trends Analysis'}</label>
                        <input type="number" value={settings.costSocialTrendAnalysis || 0} onChange={e => handleFieldChange('costSocialTrendAnalysis', e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'تحقيق دخل المبدع (Creator Monetization)' : 'Creator Monetization Cost'}</label>
                        <input type="number" value={settings.costCreatorMonetization || 0} onChange={e => handleFieldChange('costCreatorMonetization', e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'تفكيك وترتيب المهام (Task AI Breakdown)' : 'Task AI Breakdown Cost'}</label>
                        <input type="number" value={settings.costTaskAiBreakdown || 0} onChange={e => handleFieldChange('costTaskAiBreakdown', e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'جدولة الأحداث الذكية (Calendar AI)' : 'Calendar Schedule Cost'}</label>
                        <input type="number" value={settings.costCalendarSchedule || 0} onChange={e => handleFieldChange('costCalendarSchedule', e.target.value)} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>{isRTL ? 'تحليل تقارير العمليات والمالية (Ops AI)' : 'Ops & Finance Insight Cost'}</label>
                        <input type="number" value={settings.costOpsFinanceInsight || 0} onChange={e => handleFieldChange('costOpsFinanceInsight', e.target.value)} style={inputStyle} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider: AI Model & Parameter Controls */}
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '12px' }}>
                  {isRTL ? 'إعدادات التحكم في الأداء الإبداعي والحدود' : 'AI Performance & Usage Controls'}
                </h4>
                <div className="ai-settings-params-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>{isRTL ? 'درجة الإبداع والحرارة (Temperature)' : 'Creativity & Temperature'}</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      placeholder="0.7"
                      value={settings.aiTemperature}
                      onChange={e => handleFieldChange('aiTemperature', e.target.value)}
                      style={inputStyle}
                    />
                    <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '4px' }}>
                      {isRTL ? '0.0 تعني دقة متناهية، 0.7 توازن جيد، و 1.2 أو أكثر تعني إبداعية عالية جداً.' : '0.0 is deterministic, 0.7 is balanced, 1.2+ is highly creative.'}
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>{isRTL ? 'الحد الأقصى للتوكنز (Max Tokens)' : 'Max Output Tokens Limit'}</label>
                    <input
                      type="number"
                      step="50"
                      min="100"
                      max="8000"
                      placeholder="1000"
                      value={settings.aiMaxTokens}
                      onChange={e => handleFieldChange('aiMaxTokens', e.target.value)}
                      style={inputStyle}
                    />
                    <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '4px' }}>
                      {isRTL ? 'يمنع العملاء من استهلاك رصيدك بالكامل في استفسار واحد ضخم (ينصح بـ 1000 إلى 2000).' : 'Prevents users from wiping out your API key balance in a single query (1000-2000 recommended).'}
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>{isRTL ? 'درع الأمان والميزانية القصوى ($)' : 'Safety Budget Guard ($)'}</label>
                    <input
                      type="number"
                      step="5"
                      min="1"
                      placeholder="100.00"
                      value={settings.aiMaxMonthlyBudget}
                      onChange={e => handleFieldChange('aiMaxMonthlyBudget', e.target.value)}
                      style={inputStyle}
                    />
                    <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '4px' }}>
                      {isRTL ? 'يتوقف الاستهلاك تلقائياً لحسابك كلياً بمجرد تخطي تكلفة استخدام المنصة لهذا المبلغ.' : 'Automatically stops usage when platform accumulated costs exceed this setting.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider: System Instructions branding */}
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '8px' }}>
                  {isRTL ? 'تخصيص هوية وسلوك الذكاء الاصطناعي (System Prompt)' : 'Custom System Prompt & Assistant Behavior'}
                </h4>
                <textarea
                  placeholder={isRTL ? "مثال: أنت مساعد ذكاء اصطناعي ذكي تابع لمنصة upKlick، تتحدث باللغة العربية وتساعد المستخدمين في إنشاء وإدارة صفحات الهبوط بحماس واحترافية..." : "e.g., You are upKlick AI assistant. Be helpful, professional, and guide users on how to optimize landing pages..."}
                  value={settings.aiSystemInstruction}
                  onChange={e => handleFieldChange('aiSystemInstruction', e.target.value)}
                  style={{
                    ...inputStyle,
                    width: '100%',
                    minHeight: '80px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    padding: '10px 12px',
                    fontSize: '12.5px'
                  }}
                />
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
                  {isRTL
                    ? 'اكتب التعليمات التي ترغب في توجيهها للذكاء الاصطناعي لتخصيص إجاباته وجعله يمثل علامتك التجارية بحرفية.'
                    : 'System-level instructions injected at the start of all chat conversations to brand your AI and tailor its responses.'}
                </div>
              </div>
            </div>
          </div>

          {/* Save Buttons */}
          <div style={{ display: 'flex', gap: '10px', paddingBottom: '20px' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              <Save size={16} />
              <span>
                {saving
                  ? (isRTL ? 'جاري الحفظ...' : 'Saving...')
                  : saved
                    ? (isRTL ? 'تم الحفظ بنجاح! ✓' : 'Saved Successfully! ✓')
                    : (isRTL ? 'حفظ إعدادات الذكاء الاصطناعي' : 'Save AI Settings')
                }
              </span>
            </button>
            <button
              onClick={handleReset}
              className="btn"
              style={{ background: 'var(--bg3)', border: '1px solid var(--line)', color: 'var(--text2)' }}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </>
      )}

      {/* SUB TAB 2: LIVE USAGE LOGS */}
      {activeSubTab === 'logs' && (
        <div className="card" style={cardStyle}>
          {/* Header & Search */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '800', color: 'var(--text)' }}>
              <List size={16} style={{ color: 'var(--orange)' }} />
              <span>{isRTL ? 'سجلات استهلاك الذكاء الاصطناعي الفورية' : 'Live AI Transactions Logs'}</span>
            </div>

            {/* Search, Filters & Export controls */}
            <div className="ai-settings-filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              {/* Tool Filter */}
              <select
                value={filterTool}
                onChange={e => setFilterTool(e.target.value)}
                className="ai-settings-filter-input"
                style={{
                  background: 'var(--bg3)',
                  border: '1px solid var(--line2)',
                  color: 'var(--text)',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">{isRTL ? 'جميع الأدوات' : 'All Tools'}</option>
                {uniqueTools.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              {/* Model Filter */}
              <select
                value={filterModel}
                onChange={e => setFilterModel(e.target.value)}
                className="ai-settings-filter-input"
                style={{
                  background: 'var(--bg3)',
                  border: '1px solid var(--line2)',
                  color: 'var(--text)',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">{isRTL ? 'جميع النماذج' : 'All Models'}</option>
                {uniqueModels.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              {/* Export Button */}
              <button
                onClick={exportLogsToCSV}
                className="btn"
                style={{
                  background: 'var(--bg3)',
                  border: '1px solid var(--line2)',
                  color: 'var(--text)',
                  padding: '9px 14px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <span>📥 {isRTL ? 'تصدير CSV' : 'Export CSV'}</span>
              </button>

              {/* Search Box */}
              <div className="ai-settings-search-wrapper" style={{ position: 'relative', width: '220px' }}>
                <span style={{ position: 'absolute', top: '10px', [isRTL ? 'right' : 'left']: '12px', color: 'var(--text3)' }}>
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder={isRTL ? 'ابحث بالمستخدم...' : 'Search user...'}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="ai-settings-filter-input"
                  style={{ ...inputStyle, paddingLeft: isRTL ? '14px' : '34px', paddingRight: isRTL ? '34px' : '14px' }}
                />
              </div>
            </div>
          </div>

          {loadingLogs && logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
              <RefreshCw size={24} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '8px' }} />
              <div>{isRTL ? 'جاري تحميل السجلات الفورية...' : 'Streaming live log entries...'}</div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text3)' }}>
              {isRTL ? 'لم يتم العثور على سجلات تطابق البحث.' : 'No matching transactions logs found.'}
            </div>
          ) : (
            <div>
              <div className="ai-settings-logs-table-container" style={{ overflowX: 'auto', maxHeight: '550px' }}>
                <table className="ai-settings-logs-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th className="ai-settings-table-header" style={tableHeaderStyle}>{isRTL ? 'المستخدم' : 'User'}</th>
                      <th className="ai-settings-table-header" style={tableHeaderStyle}>{isRTL ? 'الأداة' : 'Feature / Tool'}</th>
                      <th className="ai-settings-table-header" style={tableHeaderStyle}>{isRTL ? 'النموذج' : 'Model'}</th>
                      <th className="ai-settings-table-header" style={tableHeaderStyle}>{isRTL ? 'التوكينز المستهلكة' : 'Tokens Consumed'}</th>
                      <th className="ai-settings-table-header" style={tableHeaderStyle}>{isRTL ? 'التكلفة الإجمالية ($)' : 'Cost Incurred'}</th>
                      <th className="ai-settings-table-header" style={tableHeaderStyle}>{isRTL ? 'الوقت والتاريخ' : 'Date & Time'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const indexOfLastLog = logPage * logsPerPage;
                      const indexOfFirstLog = indexOfLastLog - logsPerPage;
                      const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
                      return currentLogs.map((log) => {
                        const ts = log.timestamp;
                        const dateObj = ts?.toDate ? ts.toDate() : (ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts));
                        const formattedDate = dateObj.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        });

                        return (
                          <tr key={log.id} className="ai-settings-table-row" style={tableRowStyle}>
                            <td className="ai-settings-table-cell" style={tableCellStyle}>
                              <div style={{ fontWeight: 'bold' }}>{log.userName || 'Anonymous'}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{log.userEmail}</div>
                            </td>
                            <td className="ai-settings-table-cell" style={tableCellStyle}>
                              <span style={{ background: 'var(--bg3)', border: '1px solid var(--line2)', borderRadius: '6px', padding: '3px 8px', fontSize: '11.5px', fontWeight: '600' }}>
                                {log.tool || 'General'}
                              </span>
                            </td>
                            <td className="ai-settings-table-cell" style={tableCellStyle}>
                              <code style={{ fontSize: '12px', color: 'var(--orange)' }}>{log.model}</code>
                            </td>
                            <td className="ai-settings-table-cell" style={tableCellStyle}>
                              <div style={{ fontSize: '12px' }}>
                                📥 {log.inputTokens?.toLocaleString()} / 📤 {log.outputTokens?.toLocaleString()}
                              </div>
                              <div style={{ fontSize: '10px', color: 'var(--text3)' }}>
                                {isRTL ? 'الإجمالي:' : 'Total:'} {((log.inputTokens || 0) + (log.outputTokens || 0)).toLocaleString()}
                              </div>
                            </td>
                            <td className="ai-settings-table-cell" style={tableCellStyle}>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>
                                  ${Number(log.cost || 0).toFixed(6)}
                                </span>
                                <span style={{ fontSize: '10.5px', color: 'var(--text3)' }}>
                                  {log.creditsDeducted || 0} Credits
                                </span>
                              </div>
                            </td>
                            <td className="ai-settings-table-cell" style={{ ...tableCellStyle, color: 'var(--text3)', fontSize: '12px' }}>
                              {formattedDate}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {filteredLogs.length > logsPerPage && (
                <div className="ai-settings-pagination" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderTop: '1px solid var(--line2)',
                  background: 'var(--bg3)',
                  flexWrap: 'wrap',
                  gap: '12px',
                  borderRadius: '0 0 10px 10px'
                }}>
                  <div style={{ fontSize: '13px', color: 'var(--text3)', fontWeight: '600' }}>
                    {isRTL
                      ? `عرض ${Math.min(filteredLogs.length, (logPage - 1) * logsPerPage + 1)}-${Math.min(filteredLogs.length, logPage * logsPerPage)} من أصل ${filteredLogs.length} سجل`
                      : `Showing ${Math.min(filteredLogs.length, (logPage - 1) * logsPerPage + 1)}-${Math.min(filteredLogs.length, logPage * logsPerPage)} of ${filteredLogs.length} entries`
                    }
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => setLogPage(prev => Math.max(prev - 1, 1))}
                      disabled={logPage === 1}
                      className="btn"
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        background: logPage === 1 ? 'transparent' : 'var(--bg2)',
                        borderColor: 'var(--line2)',
                        color: logPage === 1 ? 'var(--text3)' : 'var(--text)',
                        cursor: logPage === 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isRTL ? 'السابق' : 'Previous'}
                    </button>
                    {(() => {
                      const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
                      const pageNumbers = [];
                      const startPage = Math.max(1, logPage - 2);
                      const endPage = Math.min(totalPages, logPage + 2);

                      for (let i = startPage; i <= endPage; i++) {
                        pageNumbers.push(i);
                      }

                      return (
                        <>
                          {startPage > 1 && (
                            <>
                              <button
                                onClick={() => setLogPage(1)}
                                className="btn"
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  background: logPage === 1 ? 'var(--orange)' : 'var(--bg2)',
                                  borderColor: logPage === 1 ? 'var(--orange)' : 'var(--line2)',
                                  color: logPage === 1 ? '#fff' : 'var(--text)',
                                  cursor: 'pointer'
                                }}
                              >
                                1
                              </button>
                              {startPage > 2 && <span style={{ color: 'var(--text3)', padding: '0 4px' }}>...</span>}
                            </>
                          )}
                          {pageNumbers.map(number => (
                            <button
                              key={number}
                              onClick={() => setLogPage(number)}
                              className="btn"
                              style={{
                                padding: '6px 12px',
                                fontSize: '12px',
                                background: logPage === number ? 'var(--orange)' : 'var(--bg2)',
                                borderColor: logPage === number ? 'var(--orange)' : 'var(--line2)',
                                color: logPage === number ? '#fff' : 'var(--text)',
                                cursor: 'pointer',
                                fontWeight: logPage === number ? 'bold' : 'normal'
                              }}
                            >
                              {number}
                            </button>
                          ))}
                          {endPage < totalPages && (
                            <>
                              {endPage < totalPages - 1 && <span style={{ color: 'var(--text3)', padding: '0 4px' }}>...</span>}
                              <button
                                onClick={() => setLogPage(totalPages)}
                                className="btn"
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '12px',
                                  background: logPage === totalPages ? 'var(--orange)' : 'var(--bg2)',
                                  borderColor: logPage === totalPages ? 'var(--orange)' : 'var(--line2)',
                                  color: logPage === totalPages ? '#fff' : 'var(--text)',
                                  cursor: 'pointer'
                                }}
                              >
                                {totalPages}
                              </button>
                            </>
                          )}
                        </>
                      );
                    })()}
                    <button
                      onClick={() => setLogPage(prev => Math.min(prev + 1, Math.ceil(filteredLogs.length / logsPerPage)))}
                      disabled={logPage === Math.ceil(filteredLogs.length / logsPerPage)}
                      className="btn"
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        background: logPage === Math.ceil(filteredLogs.length / logsPerPage) ? 'transparent' : 'var(--bg2)',
                        borderColor: 'var(--line2)',
                        color: logPage === Math.ceil(filteredLogs.length / logsPerPage) ? 'var(--text3)' : 'var(--text)',
                        cursor: logPage === Math.ceil(filteredLogs.length / logsPerPage) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isRTL ? 'التالي' : 'Next'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUB TAB 3: ANALYTICS DASHBOARD */}
      {activeSubTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Global Aggregates Cards */}
          <div className="ai-settings-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {/* Spend Card */}
            <div className="card ai-settings-stats-card" style={{ ...cardStyle, borderLeft: '4px solid var(--green)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 'bold' }}>
                💰 {isRTL ? 'إجمالي تكلفة المنصة بالدولار' : 'TOTAL PLATFORM SPEND ($)'}
              </div>
              <div className="ai-settings-stats-val" style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--green)', marginTop: '8px' }}>
                ${periodStats.totalAiSpend.toFixed(4)}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text3)', marginTop: '6px' }}>
                {isRTL ? 'يتم التحديث لحظياً مع كل استعلام' : 'Updates in real-time with each request'}
              </div>
            </div>

            {/* Tokens Card */}
            <div className="card ai-settings-stats-card" style={{ ...cardStyle, borderLeft: '4px solid var(--orange)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 'bold' }}>
                ⚡ {isRTL ? 'إجمالي التوكينز المستهلكة' : 'TOTAL TOKENS CONSUMED'}
              </div>
              <div className="ai-settings-stats-val" style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text)', marginTop: '8px' }}>
                {periodStats.totalAiTokens.toLocaleString()}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text3)', marginTop: '6px' }}>
                {isRTL ? 'الحجم الكلي لمدخلات ومخرجات النصوص' : 'Total size of prompts & responses'}
              </div>
            </div>

            {/* API Calls Card */}
            <div className="card ai-settings-stats-card" style={{ ...cardStyle, borderLeft: '4px solid var(--accent)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 'bold' }}>
                🤖 {isRTL ? 'إجمالي طلبات الذكاء الاصطناعي' : 'TOTAL AI CALLS'}
              </div>
              <div className="ai-settings-stats-val" style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--accent)', marginTop: '8px' }}>
                {periodStats.totalAiCalls.toLocaleString()}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text3)', marginTop: '6px' }}>
                {isRTL ? 'عدد المعاملات الناجحة المنفذة' : 'Total successful transactions executed'}
              </div>
            </div>
          </div>

          {/* Detailed Analytics Tables */}
          <div className="ai-settings-detailed-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px' }}>

            {/* Top Users Card */}
            <div className="card ai-settings-table-card" style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '800', color: 'var(--text)', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid var(--line)' }}>
                <DollarSign size={15} style={{ color: 'var(--green)' }} />
                <span>{isRTL ? 'المستخدمين الأكثر استهلاكاً للرصيد' : 'Top 5 Most Active Users (Cost)'}</span>
              </div>

              {topUsers.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '20px 0' }}>
                  {isRTL ? 'لا توجد بيانات كافية للحساب حالياً.' : 'Insufficient data to compute.'}
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={tableHeaderStyle}>{isRTL ? 'المستخدم' : 'User'}</th>
                      <th style={tableHeaderStyle}>{isRTL ? 'الطلبات' : 'Calls'}</th>
                      <th style={tableHeaderStyle}>{isRTL ? 'إجمالي الاستهلاك ($)' : 'Spend ($)'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topUsers.map((user, index) => (
                      <tr key={index} style={tableRowStyle}>
                        <td style={tableCellStyle}>
                          <div style={{ fontWeight: 'bold' }}>{user.name || 'Anonymous'}</div>
                          <div style={{ fontSize: '10.5px', color: 'var(--text3)' }}>{user.email}</div>
                        </td>
                        <td style={tableCellStyle}>{user.calls}</td>
                        <td style={tableCellStyle}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>
                                ${user.cost.toFixed(5)}
                              </span>
                              <span style={{ fontSize: '10.5px', color: 'var(--text3)' }}>
                                {user.credits || 0} Credits
                              </span>
                            </div>
                            {user.userId && (
                              <button
                                onClick={() => openRefillModal(user.userId, user.email, user.name)}
                                className="btn"
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '11px',
                                  background: 'rgba(255, 107, 53, 0.12)',
                                  border: '1px solid var(--orange)',
                                  color: 'var(--orange)',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontWeight: 'bold'
                                }}
                              >
                                {isRTL ? 'شحن رصيد' : 'Refill'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Top Features Card */}
            <div className="card ai-settings-table-card" style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '800', color: 'var(--text)', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid var(--line)' }}>
                <Cpu size={15} style={{ color: 'var(--orange)' }} />
                <span>{isRTL ? 'الأدوات الأكثر استخداماً' : 'Top 5 Used AI Features (Calls)'}</span>
              </div>

              {topTools.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '20px 0' }}>
                  {isRTL ? 'لا توجد بيانات كافية للحساب حالياً.' : 'Insufficient data to compute.'}
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={tableHeaderStyle}>{isRTL ? 'الأداة / الميزة' : 'Tool / Feature'}</th>
                      <th style={tableHeaderStyle}>{isRTL ? 'الاستخدامات' : 'Uses'}</th>
                      <th style={tableHeaderStyle}>{isRTL ? 'تكلفة التشغيل ($)' : 'Incurred Cost ($)'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topTools.map((tool, index) => (
                      <tr key={index} style={tableRowStyle}>
                        <td style={tableCellStyle}>
                          <span style={{ background: 'var(--bg3)', border: '1px solid var(--line2)', borderRadius: '6px', padding: '3px 8px', fontSize: '12px', fontWeight: '600' }}>
                            {tool.tool}
                          </span>
                        </td>
                        <td style={tableCellStyle}>{tool.calls}</td>
                        <td style={tableCellStyle}>
                          <span style={{ color: 'var(--green)', fontWeight: '600' }}>
                            ${tool.cost.toFixed(5)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Refill Modal Overlay */}
      {refillModalUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(8, 8, 15, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div className="card" style={{
            width: '95%',
            maxWidth: '420px',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'var(--panelColor, #101018)',
            border: '1px solid var(--line, var(--edge))',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '8px' }}>
              ⚡ {isRTL ? 'شحن رصيد ذكاء اصطناعي سريع' : 'Quick AI Credit Refill'}
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text2)', marginBottom: '16px', lineHeight: '1.4' }}>
              {isRTL ? `إضافة رصيد للمستخدم: ` : `Refill balance for: `}
              <strong style={{ color: 'var(--text)' }}>{refillModalUser.name || 'Anonymous'}</strong>
              <br />
              <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{refillModalUser.email}</span>
            </p>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text3)' }}>{isRTL ? 'الرصيد الحالي للمستخدم:' : 'User Current Balance:'}</span>
                <span style={{ color: 'var(--orange)', fontWeight: 'bold' }}>{refillModalUser.currentCredits} Credits</span>
              </div>
              <label style={labelStyle}>{isRTL ? 'الرصيد المراد إضافته (Credits)' : 'Credits to Add'}</label>
              <input
                type="number"
                step="1"
                placeholder={isRTL ? "مثال: 100 أو -50 لخصم الرصيد" : "e.g. 100 or -50 to deduct"}
                value={refillAmount}
                onChange={e => setRefillAmount(e.target.value)}
                style={inputStyle}
                autoFocus
              />
              <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '4px' }}>
                {isRTL ? 'يمكنك كتابة رقم سالب للخصم من الرصيد.' : 'Use negative values to deduct credit.'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleRefillSubmit}
                disabled={refilling || !refillAmount}
                className="btn btn-primary"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {refilling ? (isRTL ? 'جاري الشحن...' : 'Processing...') : (isRTL ? 'تأكيد الشحن' : 'Confirm Refill')}
              </button>
              <button
                onClick={() => setRefillModalUser(null)}
                className="btn"
                style={{
                  background: 'var(--bg3)',
                  border: '1px solid var(--line2)',
                  color: 'var(--text2)',
                  padding: '9px 16px'
                }}
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* SUB TAB 4: TOOLS & PERMISSIONS */}
      {activeSubTab === 'tools' && (
        <div className="card" style={{ padding: '24px', background: 'var(--panelColor, #101018)', border: '1px solid var(--line, var(--edge))', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '800', color: 'var(--text)', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid var(--line)' }}>
            <span style={{ color: 'var(--orange)' }}>⚙️</span>
            <span>{isRTL ? 'إدارة أدوات الذكاء الاصطناعي والصلاحيات' : 'AI Tools & Permissions Management'}</span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '20px' }}>
            {isRTL
              ? 'قم بتخصيص تكلفة كل أداة بالكريديت، وتحديد الباقات المسموح لها باستخدام الأداة، وإضافة تاج (Tag) مميز يظهر فوق الأداة للعميل.'
              : 'Customize the credit cost of each tool, specify which plans are allowed to use it, and add a custom Tag to display above it.'}
          </p>

          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
            {DEFAULT_AI_TOOLS.map((baseTool) => {
              const customConfig = (settings.aiToolsConfig || []).find(t => t.id === baseTool.id) || {};
              const currentCost = customConfig.cost !== undefined ? customConfig.cost : baseTool.cost;
              const currentAllowedPlans = customConfig.allowedPlans || ['starter', 'growth', 'pro'];
              const currentTag = customConfig.tag || '';

              const handleToolUpdate = (key, value) => {
                let newConfigList = [...(settings.aiToolsConfig || [])];
                let existingIdx = newConfigList.findIndex(t => t.id === baseTool.id);

                if (existingIdx === -1) {
                  newConfigList.push({
                    id: baseTool.id,
                    name: baseTool.name,
                    cost: baseTool.cost,
                    allowedPlans: ['starter', 'growth', 'pro'],
                    tag: '',
                    [key]: value
                  });
                } else {
                  newConfigList[existingIdx][key] = value;
                }

                handleFieldChange('aiToolsConfig', newConfigList);
              };

              const togglePlan = (planName) => {
                let newPlans = [...currentAllowedPlans];
                if (newPlans.includes(planName)) {
                  newPlans = newPlans.filter(p => p !== planName);
                } else {
                  newPlans.push(planName);
                }
                handleToolUpdate('allowedPlans', newPlans);
              };

              return (
                <div key={baseTool.id} style={{ border: '1px solid var(--line2)', borderRadius: '12px', padding: '16px', background: 'var(--bg3)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 'bold', color: 'var(--text)' }}>
                    {baseTool.name}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>
                        {isRTL ? 'تكلفة الكريديت' : 'Credit Cost'}
                      </label>
                      <input
                        type="number"
                        value={currentCost}
                        onChange={(e) => handleToolUpdate('cost', Number(e.target.value))}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg2)', color: 'var(--text)' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '4px' }}>
                        {isRTL ? 'نص التاج (Tag)' : 'Badge Tag'}
                      </label>
                      <input
                        type="text"
                        placeholder={isRTL ? 'مثال: حصري، جديد..' : 'e.g., Premium, New'}
                        value={currentTag}
                        onChange={(e) => handleToolUpdate('tag', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--bg2)', color: 'var(--text)' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--text2)', display: 'block', marginBottom: '6px' }}>
                      {isRTL ? 'الباقات المسموح لها:' : 'Allowed Plans:'}
                    </label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {['starter', 'growth', 'pro'].map(plan => {
                        const isSelected = currentAllowedPlans.includes(plan);
                        return (
                          <button
                            key={plan}
                            onClick={() => togglePlan(plan)}
                            style={{
                              padding: '4px 10px',
                              fontSize: '11px',
                              borderRadius: '20px',
                              border: `1px solid ${isSelected ? 'var(--orange)' : 'var(--line)'}`,
                              background: isSelected ? 'var(--orange)' : 'transparent',
                              color: isSelected ? '#fff' : 'var(--text2)',
                              cursor: 'pointer',
                              fontWeight: '600'
                            }}
                          >
                            {plan.charAt(0).toUpperCase() + plan.slice(1)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-prime"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 'bold',
                minWidth: '140px',
                justifyContent: 'center'
              }}
            >
              {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ التعديلات' : 'Save Changes')}
            </button>
          </div>
          {saved && (
            <div style={{ color: 'var(--green)', fontSize: '13px', marginTop: '10px', textAlign: 'right', fontWeight: 'bold' }}>
              ✓ {isRTL ? 'تم الحفظ بنجاح!' : 'Settings Saved!'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AiSettingsPage;
