'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { DB } from '../../data/mockData';
import { callClaudeAPI } from '../../utils/ai';
import { parseMarkdown } from '../../utils/markdown';
import CustomSelect from '../CustomSelect';

const filterByDateRange = (itemDate, rangeType, customStart, customEnd) => {
  if (!itemDate) return true;
  const date = new Date(itemDate);
  if (isNaN(date.getTime())) return true;

  const now = new Date();

  switch (rangeType) {
    case 'week': {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return date >= startOfWeek;
    }
    case 'month': {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return date >= startOfMonth;
    }
    case 'year': {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return date >= startOfYear;
    }
    case 'last30': {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      return date >= thirtyDaysAgo;
    }
    case 'custom': {
      if (customStart && customEnd) {
        const start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
        const end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;
      }
      return true;
    }
    case 'all':
    default:
      return true;
  }
};

export default function RevenueView({ initialTab = 'rv-streams' }) {
  const { lang, L, t, formatMoney, GC, saveGC, updateLeadStage, deleteLead, confirmAction, promptAction, currency, rates } = useBusiness();

  // Tab state inside Revenue Hub
  const [activeSubTab, setActiveSubTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveSubTab(initialTab);
    }
  }, [initialTab]);

  // Global Filters
  const [filterWorkspace, setFilterWorkspace] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // 1. Streams State

  const revenueData = GC.revenue || {};

  // 2. Deals / Pipeline State
  const [pipelineDeals, setPipelineDeals] = useState(revenueData.deals && Object.keys(revenueData.deals).length ? revenueData.deals : (DB.deals || {
    Prospect: [],
    Negotiating: [],
    Contracted: [],
    Completed: []
  }));

  // 6. Affiliates State
  const [affiliatesList, setAffiliatesList] = useState(revenueData.affiliates && revenueData.affiliates.length ? revenueData.affiliates : (DB.affLinks || []));

  // 8. Email / Lead Magnets State
  const [leadMagnets, setLeadMagnets] = useState(revenueData.leadMagnets && revenueData.leadMagnets.length ? revenueData.leadMagnets : (DB.leadMagnets[lang] || []));

  // 9. Coaching Sessions State
  const [coachingSessions, setCoachingSessions] = useState(revenueData.coachingSessions && revenueData.coachingSessions.length ? revenueData.coachingSessions : (DB.coachSessions[lang] || []));

  // 10. Merch State
  const [merchCatalog, setMerchCatalog] = useState(revenueData.merch && revenueData.merch.length ? revenueData.merch : (DB.merchItems || []));

  // Sync state if GC updates
  useEffect(() => {
    if (GC.revenue) {
      if (GC.revenue.deals) setPipelineDeals(GC.revenue.deals);
      if (GC.revenue.affiliates) setAffiliatesList(GC.revenue.affiliates);
      if (GC.revenue.leadMagnets) setLeadMagnets(GC.revenue.leadMagnets);
      if (GC.revenue.coachingSessions) setCoachingSessions(GC.revenue.coachingSessions);
      if (GC.revenue.merch) setMerchCatalog(GC.revenue.merch);
    }
  }, [GC.revenue]);

  const saveRevenueData = (updatedFields) => {
    const updatedGC = {
      ...GC,
      revenue: {
        ...(GC.revenue || {}),
        ...updatedFields
      }
    };
    saveGC(updatedGC);
  };

  // Dynamic aggregations based on filters
  const workspaces = GC.crm?.workspaces || [];
  const selectedWorkspaces = filterWorkspace === 'all'
    ? workspaces
    : workspaces.filter(w => w.id === filterWorkspace);

  const parseArabicAndEnglishFloat = (str) => {
    if (!str) return 0;
    const arabicDigits = /[٠١٢٣٤٥٦٧٨٩]/g;
    const englishDigits = (c) => '0123456789'[c.charCodeAt(0) - 1632];
    let normalized = str.replace(arabicDigits, englishDigits);
    normalized = normalized.replace(/[^0-9.]/g, '');
    return parseFloat(normalized) || 0;
  };

  const allLeads = [];
  selectedWorkspaces.forEach(ws => {
    const dealsList = ws.deals || [];
    dealsList.forEach(d => {
      allLeads.push({
        ...d,
        workspaceId: ws.id,
        workspaceName: ws.name,
        stages: ws.stages
      });
    });
  });

  const filteredLeads = allLeads.filter(lead =>
    filterByDateRange(lead.created, filterPeriod, customStartDate, customEndDate)
  );

  const activeWsIdObj = filterWorkspace !== 'all' ? filterWorkspace : (GC.crm?.activeWorkspaceId || 'default');
  const activeWsObj = workspaces.find(w => w.id === activeWsIdObj) || workspaces[0];
  const activeStages = activeWsObj?.stages || [
    { key: 'new', label: L('New Lead', 'صفقة جديدة'), color: 'var(--blue)' },
    { key: 'contacted', label: L('Contacted', 'تم التواصل'), color: 'var(--purple)' },
    { key: 'qualified', label: L('Qualified', 'مؤهل'), color: 'var(--amber)' },
    { key: 'proposal', label: L('Proposal Sent', 'تم تقديم العرض'), color: 'var(--a)' },
    { key: 'closed', label: L('Closed Won', 'مكتملة ناجحة'), color: 'var(--green)' },
    { key: 'lost', label: L('Lost', 'خاسرة'), color: 'var(--red)' }
  ];

  const dealsByStage = {};
  activeStages.forEach(s => {
    dealsByStage[s.key] = [];
  });

  filteredLeads.forEach(lead => {
    const stageKey = lead.stage;
    if (dealsByStage[stageKey] !== undefined) {
      dealsByStage[stageKey].push(lead);
    } else {
      const firstKey = activeStages[0]?.key || 'new';
      if (dealsByStage[firstKey] === undefined) {
        dealsByStage[firstKey] = [];
      }
      dealsByStage[firstKey].push(lead);
    }
  });

  // Calculate real incomes
  const crmClosedRevenue = filteredLeads
    .filter(l => {
      const key = (l.stage || '').toLowerCase();
      return key.includes('close') || key.includes('won') || key.includes('complete') || key.includes('done');
    })
    .reduce((sum, l) => sum + (parseFloat(l.value) || 0), 0);

  const getRealBestBrands = () => {
    const brandsMap = {};
    const closedStageKeys = activeStages.filter(s => {
      const key = s.key.toLowerCase();
      return key.includes('close') || key.includes('won') || key.includes('complete') || key.includes('done');
    }).map(s => s.key);

    filteredLeads.forEach(deal => {
      if (closedStageKeys.includes(deal.stage) || deal.stage === 'closed' || deal.stage === 'won' || deal.stage === 'complete') {
        const name = deal.name || 'Brand';
        const val = parseFloat(deal.value) || 0;
        if (!brandsMap[name]) {
          brandsMap[name] = { name, deals: 0, rev: 0 };
        }
        brandsMap[name].deals += 1;
        brandsMap[name].rev += val;
      }
    });
    return Object.values(brandsMap).sort((a, b) => b.rev - a.rev);
  };
  const realBestBrands = getRealBestBrands();

  // Dynamic active and pending deal counts
  const dynamicClosedAndLostKeys = activeStages.filter(s => {
    const key = s.key.toLowerCase();
    return key.includes('close') || key.includes('won') || key.includes('complete') || key.includes('done') || key.includes('lost');
  }).map(s => s.key);

  const activeDealsCount = filteredLeads.filter(l => !dynamicClosedAndLostKeys.includes(l.stage)).length;
  const pendingDealsCount = filteredLeads.filter(l => {
    const key = (l.stage || '').toLowerCase();
    return key.includes('negotiat') || key.includes('qualif') || key.includes('proposal') || key.includes('contract') || key.includes('sent');
  }).length;

  const allProducts = GC.digitalProducts?.products || [];
  const filteredProducts = allProducts.filter(p =>
    filterByDateRange(p.created, filterPeriod, customStartDate, customEndDate)
  );
  const productsRevenue = filteredProducts.reduce((sum, p) => sum + (parseFloat(p.revenue) || 0), 0);

  const coursesList = GC.revenue?.courses || [];
  const filteredCourses = coursesList.filter(c =>
    filterByDateRange(c.created, filterPeriod, customStartDate, customEndDate)
  );
  const coursesRevenue = filteredCourses.reduce((sum, c) => sum + (parseFloat(c.revenue) || 0), 0);

  const coachingSessionsList = coachingSessions || [];
  const filteredCoaching = coachingSessionsList.filter(s =>
    filterByDateRange(s.created, filterPeriod, customStartDate, customEndDate)
  );
  const coachingRevenue = filteredCoaching
    .filter(s => s.s === 'done' || s.sl === L('Completed', 'مكتمل') || s.sl === 'Completed')
    .reduce((sum, s) => sum + (parseFloat(s.price) || 150), 0);

  const affiliatesListRaw = affiliatesList || [];
  const affiliateRevenue = affiliatesListRaw.reduce((sum, a) => {
    const val = parseFloat((a.earn || '').replace(/[^0-9.]/g, '')) || 0;
    return sum + val;
  }, 0);

  const merchListRaw = merchCatalog || [];
  const merchRevenue = merchListRaw.reduce((sum, m) => {
    const price = parseFloat((m.p || '').replace(/[^0-9.]/g, '')) || 0;
    return sum + (price * (m.s || 0));
  }, 0);

  const financeIncomes = (GC.finance?.entries || [])
    .filter(entry => entry.type === 'income' && filterByDateRange(entry.date, filterPeriod, customStartDate, customEndDate))
    .reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0);

  const totalRevenue = crmClosedRevenue + productsRevenue + coursesRevenue + financeIncomes;

  const streams = [
    { name: L('Sponsorships', 'الرعايات'), val: crmClosedRevenue, c: 'var(--a)' },
    { name: L('Digital Products', 'المنتجات الرقمية'), val: productsRevenue, c: 'var(--a2)' },
    { name: L('Courses', 'الكورسات'), val: coursesRevenue, c: 'var(--a3)' },
    { name: L('Services & Other', 'الخدمات والاستشارات'), val: financeIncomes, c: 'var(--go)' }
  ];

  const sortedStreams = [...streams].sort((a, b) => b.val - a.val);
  const bestStream = totalRevenue > 0 ? sortedStreams[0].name : L('None', 'لا يوجد');
  const bestStreamPct = totalRevenue > 0 ? Math.round((sortedStreams[0].val / totalRevenue) * 100) : 0;

  const calculateDiversityScore = () => {
    if (totalRevenue <= 0) return 0;
    const activeCount = streams.filter(s => s.val > 0).length;
    let hhi = 0;
    streams.forEach(s => {
      if (s.val > 0) {
        const pct = s.val / totalRevenue;
        hhi += pct * pct;
      }
    });
    const score = Math.round((1 - hhi) * 100 + (activeCount * 5));
    return Math.min(Math.max(score, 10), 100);
  };
  const diversityScore = calculateDiversityScore();
  const activeStreamsCount = streams.filter(s => s.val > 0).length;

  const streamsLauncherItems = ((DB.streamsLauncher && DB.streamsLauncher[lang]) || [])
    .filter(item => item.e !== '🔗' && item.e !== '🏆' && item.e !== '🎯' && item.e !== '👕')
    .map(item => {
      let isActive = false;
      if (item.e === '📦') isActive = filteredProducts.length > 0;
      else if (item.e === '🎓') isActive = filteredCourses.length > 0;
      else if (item.e === '📧') isActive = true;
      return { ...item, a: isActive };
    });

  const getSvgCircles = () => {
    let accumulatedPercent = 0;
    return streams.map(s => {
      const pct = totalRevenue > 0 ? Math.round((s.val / totalRevenue) * 100) : 0;
      if (pct <= 0) return null;
      const strokeDasharray = `${pct} ${100 - pct}`;
      const strokeDashoffset = -accumulatedPercent;
      accumulatedPercent += pct;
      return {
        strokeDasharray,
        strokeDashoffset,
        color: s.c
      };
    }).filter(Boolean);
  };
  const svgCircles = getSvgCircles();

  const handleAddDeal = () => {
    promptAction(L('Enter Brand/Client Name:', 'أدخل اسم البراند/العميل:'), '', (brand) => {
      if (!brand) return;
      promptAction(L('Enter Deal Value (e.g. 500):', 'أدخل قيمة الصفقة (مثال: 500):'), '500', (valueStr) => {
        if (!valueStr) return;
        const enteredVal = parseArabicAndEnglishFloat(valueStr);
        const rate = rates[currency.code] || 1;
        const value = enteredVal / rate;
        promptAction(L('Enter Content Type:', 'أدخل نوع المحتوى:'), '1x Reel', (type) => {
          if (!type) return;

          const activeWsId = filterWorkspace !== 'all' ? filterWorkspace : (GC.crm?.activeWorkspaceId || 'default');
          const wsList = GC.crm?.workspaces || [];
          const activeWs = wsList.find(w => w.id === activeWsId) || wsList[0];
          if (!activeWs) {
            alert(L('No workspace found to add deal!', 'لم يتم العثور على مساحة عمل لإضافة الصفقة!'));
            return;
          }

          const startingStage = activeWs.stages && activeWs.stages.length > 0 ? activeWs.stages[0].key : 'new';

          const newLead = {
            id: Date.now(),
            name: brand,
            value: value,
            stage: startingStage,
            created: new Date().toISOString(),
            source: 'Revenue Hub',
            phone: '',
            email: '',
            followupDate: '',
            notes: type
          };

          const currentDeals = activeWs.deals || [];

          const updatedWs = { ...activeWs, deals: [...currentDeals, newLead] };
          saveGC({
            ...GC,
            crm: {
              ...(GC.crm || {}),
              workspaces: wsList.map(w => w.id === updatedWs.id ? updatedWs : w)
            }
          });
          alert(L('Deal added successfully!', 'تمت إضافة الصفقة بنجاح!'));
        });
      });
    });
  };

  const handleMoveDeal = (lead) => {
    const wsList = GC.crm?.workspaces || [];
    const ws = wsList.find(w => w.id === lead.workspaceId) || wsList[0];
    if (!ws) return;

    const activeStages = ws.stages || [];
    const options = activeStages.map((s, idx) => ({
      key: s.key,
      label: s.label,
      choiceStr: `${idx + 1}. ${s.label}`
    }));

    const promptMessageAr = `نقل "${lead.name}" إلى:\n` +
      options.map(opt => opt.choiceStr).join('\n') +
      `\n${options.length + 1}. ❌ حذف الصفقة`;

    const promptMessageEn = `Move "${lead.name}" to:\n` +
      options.map(opt => opt.choiceStr).join('\n') +
      `\n${options.length + 1}. ❌ Delete Deal`;

    promptAction(
      L(promptMessageEn, promptMessageAr),
      '1',
      (choice) => {
        if (!choice) return;

        const currentDeals = ws.deals || [];

        const deleteChoiceKey = String(options.length + 1);
        if (choice === deleteChoiceKey) {
          confirmAction(L('Are you sure you want to delete this deal?', 'هل أنت متأكد من حذف هذه الصفقة؟'), () => {
            const updatedWs = { ...ws, deals: currentDeals.filter(l => String(l.id) !== String(lead.id)) };
            saveGC({
              ...GC,
              crm: {
                ...GC.crm,
                workspaces: wsList.map(w => w.id === updatedWs.id ? updatedWs : w)
              }
            });
            alert(L('Deal deleted!', 'تم حذف الصفقة!'));
          });
          return;
        }

        const targetStageIndex = parseInt(choice) - 1;
        if (targetStageIndex >= 0 && targetStageIndex < options.length) {
          const targetCrmStageKey = options[targetStageIndex].key;
          const updatedWs = {
            ...ws,
            deals: currentDeals.map(l => String(l.id) === String(lead.id) ? { ...l, stage: targetCrmStageKey } : l)
          };

          saveGC({
            ...GC,
            crm: {
              ...GC.crm,
              workspaces: wsList.map(w => w.id === updatedWs.id ? updatedWs : w)
            }
          });
          alert(L(`Deal moved to ${options[targetStageIndex].label}!`, `تم نقل الصفقة إلى ${options[targetStageIndex].label}!`));
        }
      }
    );
  };

  const handleDropDeal = (leadId, targetStageKey) => {
    if (!leadId) return;
    const wsList = GC.crm?.workspaces || [];
    let foundWs = null;
    let foundLead = null;
    for (let ws of wsList) {
      const currentDeals = ws.deals || [];
      const lead = currentDeals.find(l => String(l.id) === String(leadId));
      if (lead) {
        foundWs = ws;
        foundLead = lead;
        break;
      }
    }
    if (!foundWs || !foundLead) return;

    const currentDeals = foundWs.deals || [];

    const updatedWs = {
      ...foundWs,
      deals: currentDeals.map(l => String(l.id) === String(leadId) ? { ...l, stage: targetStageKey } : l)
    };
    saveGC({
      ...GC,
      crm: {
        ...GC.crm,
        workspaces: wsList.map(w => w.id === updatedWs.id ? updatedWs : w)
      }
    });
  };

  const handleAddStage = () => {
    promptAction(
      L('Enter New Stage Name:', 'أدخل اسم المرحلة الجديدة:'),
      '',
      (stageName) => {
        if (!stageName || !stageName.trim()) return;

        const activeWsId = filterWorkspace !== 'all' ? filterWorkspace : (GC.crm?.activeWorkspaceId || 'default');
        const wsList = GC.crm?.workspaces || [];
        const activeWs = wsList.find(w => w.id === activeWsId) || wsList[0];
        if (!activeWs) {
          alert(L('No active workspace found!', 'لم يتم العثور على مساحة عمل نشطة!'));
          return;
        }

        const colors = ['var(--blue)', 'var(--purple)', 'var(--amber)', 'var(--a)', 'var(--green)', 'var(--red)', 'var(--orange)', 'var(--pink)'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const stageKey = stageName.toLowerCase().replace(/[^a-z0-9]/g, '_') || `stage_${Date.now()}`;

        const newStage = {
          key: stageKey,
          label: stageName,
          color: randomColor
        };

        const updatedWs = {
          ...activeWs,
          stages: [...(activeWs.stages || []), newStage]
        };

        saveGC({
          ...GC,
          crm: {
            ...GC.crm,
            workspaces: wsList.map(w => w.id === updatedWs.id ? updatedWs : w)
          }
        });
        alert(L('Stage added successfully!', 'تمت إضافة المرحلة بنجاح!'));
      }
    );
  };

  const handleEditStage = (stage) => {
    promptAction(
      L(`Enter new name for stage "${stage.label}":`, `أدخل اسماً جديداً للمرحلة "${stage.label}":`),
      stage.label,
      (newName) => {
        if (!newName || !newName.trim()) return;

        const activeWsId = filterWorkspace !== 'all' ? filterWorkspace : (GC.crm?.activeWorkspaceId || 'default');
        const wsList = GC.crm?.workspaces || [];
        const activeWs = wsList.find(w => w.id === activeWsId) || wsList[0];
        if (!activeWs) return;

        const updatedWs = {
          ...activeWs,
          stages: (activeWs.stages || []).map(s => s.key === stage.key ? { ...s, label: newName } : s)
        };

        saveGC({
          ...GC,
          crm: {
            ...GC.crm,
            workspaces: wsList.map(w => w.id === updatedWs.id ? updatedWs : w)
          }
        });
        alert(L('Stage renamed successfully!', 'تم تعديل اسم المرحلة بنجاح!'));
      }
    );
  };

  const handleDeleteStage = (stage) => {
    confirmAction(
      L(
        `Are you sure you want to delete stage "${stage.label}"? All its deals will be moved to the first stage.`,
        `هل أنت متأكد من حذف المرحلة "${stage.label}"؟ سيتم نقل كافة صفقاتها إلى المرحلة الأولى.`
      ),
      () => {
        const activeWsId = filterWorkspace !== 'all' ? filterWorkspace : (GC.crm?.activeWorkspaceId || 'default');
        const wsList = GC.crm?.workspaces || [];
        const activeWs = wsList.find(w => w.id === activeWsId) || wsList[0];
        if (!activeWs) return;

        const firstStageKey = activeWs.stages?.find(s => s.key !== stage.key)?.key || 'new';

        // Filter out the deleted stage
        const updatedStages = (activeWs.stages || []).filter(s => s.key !== stage.key);

        // Move deals belonging to the deleted stage
        const currentDeals = activeWs.deals || [];

        const updatedDeals = currentDeals.map(d =>
          d.stage === stage.key ? { ...d, stage: firstStageKey } : d
        );

        const updatedWs = {
          ...activeWs,
          stages: updatedStages,
          deals: updatedDeals
        };

        saveGC({
          ...GC,
          crm: {
            ...GC.crm,
            workspaces: wsList.map(w => w.id === updatedWs.id ? updatedWs : w)
          }
        });
        alert(L('Stage deleted successfully!', 'تم حذف المرحلة بنجاح!'));
      }
    );
  };

  const handleCreateWorkspace = () => {
    promptAction(
      L('Enter New Business/Workspace Name:', 'أدخل اسم مساحة العمل/البزنس الجديد:'),
      '',
      (wsName) => {
        if (!wsName || !wsName.trim()) return;

        const newWs = {
          id: `ws_${Date.now()}`,
          name: wsName.trim(),
          stages: [
            { key: 'new', label: L('New Lead', 'صفقة جديدة'), color: 'var(--blue)' },
            { key: 'contacted', label: L('Contacted', 'تم التواصل'), color: 'var(--purple)' },
            { key: 'qualified', label: L('Qualified', 'مؤهل'), color: 'var(--amber)' },
            { key: 'proposal', label: L('Proposal Sent', 'تم تقديم العرض'), color: 'var(--a)' },
            { key: 'closed', label: L('Closed Won', 'مكتملة ناجحة'), color: 'var(--green)' },
            { key: 'lost', label: L('Lost', 'خاسرة'), color: 'var(--red)' }
          ],
          deals: [],
          leads: []
        };

        const updatedWorkspaces = [...(GC.crm?.workspaces || []), newWs];
        saveGC({
          ...GC,
          crm: {
            ...(GC.crm || {}),
            workspaces: updatedWorkspaces,
            activeWorkspaceId: newWs.id
          }
        });

        setFilterWorkspace(newWs.id);
        alert(L('New business pipeline created successfully!', 'تم إنشاء مساحة عمل جديدة بنجاح!'));
      }
    );
  };

  const handleRenameWorkspace = () => {
    const wsList = GC.crm?.workspaces || [];
    const ws = wsList.find(w => w.id === filterWorkspace);
    if (!ws) return;

    promptAction(
      L(`Enter new name for workspace "${ws.name}":`, `أدخل اسماً جديداً لمساحة العمل "${ws.name}":`),
      ws.name,
      (newName) => {
        if (!newName || !newName.trim()) return;

        const updated = wsList.map(w => w.id === ws.id ? { ...w, name: newName.trim() } : w);
        saveGC({
          ...GC,
          crm: {
            ...GC.crm,
            workspaces: updated
          }
        });
        alert(L('Workspace renamed successfully!', 'تم تعديل اسم مساحة العمل بنجاح!'));
      }
    );
  };

  const handleDeleteWorkspace = () => {
    const wsList = GC.crm?.workspaces || [];
    const ws = wsList.find(w => w.id === filterWorkspace);
    if (!ws) return;

    confirmAction(
      L(
        `Are you sure you want to delete workspace "${ws.name}"? All its stages and deals will be lost forever.`,
        `هل أنت متأكد من حذف مساحة العمل "${ws.name}"؟ سيتم مسح كافة المراحل والصفقات التابعة لها نهائياً.`
      ),
      () => {
        const updated = wsList.filter(w => w.id !== ws.id);
        const nextActiveId = updated[0]?.id || 'default';

        saveGC({
          ...GC,
          crm: {
            ...GC.crm,
            workspaces: updated,
            activeWorkspaceId: nextActiveId
          }
        });

        setFilterWorkspace('all');
        alert(L('Workspace deleted successfully!', 'تم حذف مساحة العمل بنجاح!'));
      }
    );
  };

  const handleSaveNegToCRM = () => {
    if (!negResult) return;
    const activeWsId = filterWorkspace !== 'all' ? filterWorkspace : (GC.crm?.activeWorkspaceId || 'default');
    const wsList = GC.crm?.workspaces || [];
    const activeWs = wsList.find(w => w.id === activeWsId) || wsList[0];
    if (!activeWs) return;

    const startingStage = activeWs.stages && activeWs.stages.length > 0 ? activeWs.stages[0].key : 'new';

    const newLead = {
      id: Date.now(),
      name: negBrand || L('Negotiator Deal', 'صفقة المفاوض'),
      value: negResult.amount,
      stage: startingStage,
      created: new Date().toISOString(),
      source: 'Smart Negotiator',
      notes: `${negType} - Exclusivity: ${negExcl}`
    };

    const updatedWs = { ...activeWs, leads: [...(activeWs.leads || []), newLead] };
    saveGC({
      ...GC,
      crm: {
        ...(GC.crm || {}),
        workspaces: wsList.map(w => w.id === updatedWs.id ? updatedWs : w)
      }
    });
    alert(L('Deal saved successfully to CRM!', 'تم حفظ الصفقة بنجاح في CRM!'));
  };

  // 3. Negotiator State
  const [negBrand, setNegBrand] = useState('');
  const [negAmount, setNegAmount] = useState('');
  const [negType, setNegType] = useState('1x Reel');
  const [negExcl, setNegExcl] = useState('No exclusivity');
  const [negResult, setNegResult] = useState(null);

  const handleRunNeg = () => {
    const brandName = negBrand || L('Brand', 'براند');
    const amount = parseInt(negAmount) || 500;

    const eB = negExcl.includes('90') ? 0.5 : negExcl.includes('60') ? 0.35 : negExcl.includes('30') ? 0.2 : 0;
    const tB = negType.includes('Campaign') || negType.includes('Full') || negType.includes('كاملة') ? 2 : 1;
    const fair = Math.round(284 * 0.8 * tB * (1 + eB));
    const ctr = Math.round(fair * 1.25);

    let rating, icon;
    if (amount < fair * 0.7) {
      rating = L('Too Low', 'منخفض جداً');
      icon = '⚠️';
    } else if (amount < fair * 0.9) {
      rating = L('Paper', 'عادل');
      icon = '🟡';
    } else if (amount < fair * 1.2) {
      rating = L('Good', 'جيد');
      icon = '✅';
    } else {
      rating = L('Excellent', 'ممتاز');
      icon = '🌟';
    }

    const col = icon === '⚠️' ? 'var(--red)' : icon === '🌟' ? 'var(--green)' : icon === '✅' ? 'var(--green)' : 'var(--amber)';
    const rec = amount < fair
      ? L(`Counter with $${ctr.toLocaleString()}. Highlight your 63% female audience aged 18–34.`, `قدّمي عرضاً مضاداً بـ $${ctr.toLocaleString()}. ركّزي على جمهورك الأنثوي ٦٣٪ الفئة العمرية ١٨–٣٤.`)
      : L(`${rating} offer. You can push to $${ctr.toLocaleString()} to maximize value.`, `عرض ${rating}. يمكنك المطالبة بـ $${ctr.toLocaleString()} لتعظيم القيمة.`);

    setNegResult({
      icon,
      rating,
      color: col,
      amount,
      fair,
      rec
    });
  };



  // 5. Digital Shop List
  const handleAddProduct = () => {
    promptAction(L('Enter Product Name:', 'أدخل اسم المنتج:'), '', (name) => {
      if (!name) return;
      promptAction(L('Enter Product Type (e.g. Notion Template, PDF):', 'أدخل نوع المنتج (مثال: Notion Template ، PDF):'), 'Notion Template', (type) => {
        if (!type) return;
        promptAction(L('Enter Product Price (e.g. 29):', 'أدخل سعر المنتج (مثال: 29):'), '29', (priceStr) => {
          const priceVal = parseFloat(priceStr) || 29;

          const newProduct = {
            id: Date.now(),
            name: name,
            type: type,
            price: priceVal,
            sales: 0,
            revenue: 0,
            status: 'launched',
            created: new Date().toISOString()
          };

          const updated = [...(GC.digitalProducts?.products || []), newProduct];
          saveGC({
            ...GC,
            digitalProducts: {
              ...(GC.digitalProducts || {}),
              products: updated
            }
          });
          alert(L('Product added successfully to shop!', 'تمت إضافة المنتج بنجاح إلى المتجر!'));
        });
      });
    });
  };

  const trendingCatalog = [
    {
      title: L('30-Day Social Media Content Calendar', 'تقويم محتوى وسائل التواصل الاجتماعي لمدة ٣٠ يومًا'),
      type: L('Notion Template', 'قالب Notion'),
      platform: 'Gumroad',
      price: 27,
      monthly_sales: 340,
      rating: 4.8,
      opp_score: 9,
      emoji: '📅',
      why_trending: L('Creators need structured content planning', 'منشئو المحتوى بحاجة لتخطيط محتوى منظم وسريع'),
      ai_tools: ['Notion AI', 'Claude', 'ChatGPT'],
      creation_days: 3,
      desc: L('A complete Notion workspace to plan, draft, and schedule Instagram and TikTok posts.', 'مساحة عمل كاملة على Notion لتخطيط وصياغة وجدولة منشورات Instagram و TikTok.')
    },
    {
      title: L('ChatGPT Prompt Pack for Coaches', 'حزمة أوامر ChatGPT للكوتشز والمدربين'),
      type: L('AI Prompt Pack', 'حزمة أوامر ذكاء اصطناعي'),
      platform: 'Gumroad',
      price: 19,
      monthly_sales: 520,
      rating: 4.7,
      opp_score: 10,
      emoji: '🤖',
      why_trending: L('AI tools adoption exploding in Arab market', 'اعتماد أدوات الذكاء الاصطناعي يتفجر في السوق العربي'),
      ai_tools: ['Claude', 'ChatGPT', 'Notion'],
      creation_days: 2,
      desc: L('150+ custom prompts to write client proposals, create content, and generate workbook ideas.', 'أكثر من ١٥٠ أمراً مخصصاً لكتابة مقترحات العملاء، وإنشاء المحتوى، وتوليد أفكار كتب العمل.')
    },
    {
      title: L('Business Finance Tracker — Arabic', 'متبع المالية للأعمال والشركات — باللغة العربية'),
      type: L('Excel Template', 'قالب Excel / Sheets'),
      platform: 'Etsy',
      price: 15,
      monthly_sales: 280,
      rating: 4.9,
      opp_score: 8,
      emoji: '💰',
      why_trending: L('Arabic-language finance tools are scarce', 'شح الأدوات المالية المصممة باللغة العربية للشركات'),
      ai_tools: ['Google Sheets', 'Claude', 'ChatGPT'],
      creation_days: 4,
      desc: L('Simple bookkeeping spreadsheet with RTL support, tax calculations, and dashboard graphs.', 'جدول بيانات مبسط لمسك الدفاتر مع دعم الكتابة من اليمين لليسار، وحساب الضرائب ورسوم بيانية.')
    },
    {
      title: L('Instagram Reels Script Bundle (50 Scripts)', 'حزمة سكريبتات ريلز انستجرام (٥٠ سكريبت)'),
      type: L('Swipe File', 'ملف سكريبتات جاهزة'),
      platform: 'Gumroad',
      price: 37,
      monthly_sales: 190,
      rating: 4.6,
      opp_score: 9,
      emoji: '🎬',
      why_trending: L('Video content demand growing 3x in Gulf region', 'الطلب على محتوى الفيديو ينمو بمعدل ٣ أضعاف في منطقة الخليج'),
      ai_tools: ['Claude', 'ChatGPT', 'CapCut'],
      creation_days: 5,
      desc: L('Proven viral hook structures and high-retention body scripts for business consultants.', 'هياكل خطافية فيروسية مثبتة وسيناريوهات عالية الاحتفاظ بالجمهور لمستشاري الأعمال.')
    },
    {
      title: L('Freelancer Client Proposal Template', 'قالب مقترح عميل للمستقلين (Freelancers)'),
      type: L('Canva Template', 'قالب Canva'),
      platform: 'Creative Market',
      price: 22,
      monthly_sales: 410,
      rating: 4.8,
      opp_score: 8,
      emoji: '📋',
      why_trending: L('Freelancing booming in MENA region', 'طفرة العمل الحر والعمل عن بعد في منطقة الشرق الأوسط وشمال إفريقيا'),
      ai_tools: ['Canva', 'Claude', 'ChatGPT'],
      creation_days: 2,
      desc: L('A high-end, 12-page proposal slide deck editable in Canva free or pro accounts.', 'مجموعة شرائح مقترحات راقية مكونة من ١٢ صفحة قابلة للتعديل على حسابات Canva المجانية أو المدفوعة.')
    },
    {
      title: L('Online Course Launch Checklist', 'قائمة مراجعة إطلاق الكورسات أونلاين'),
      type: L('PDF Guide', 'دليل PDF'),
      platform: 'Gumroad',
      price: 9,
      monthly_sales: 680,
      rating: 4.5,
      opp_score: 9,
      emoji: '🚀',
      why_trending: L('Low barrier to entry, high search volume', 'حجم بحث مرتفع جداً وسهولة الإطلاق والدخول للمجال'),
      ai_tools: ['Notion', 'Claude', 'Canva'],
      creation_days: 1,
      desc: L('A step-by-step PDF roadmap summarizing everything from pre-launch validation to sales page setups.', 'خارطة طريق خطوة بخطوة تلخص كل شيء بدءًا من التحقق من صحة ما قبل الإطلاق وحتى إعدادات صفحة المبيعات.')
    }
  ];

  const handleStealProduct = (prod) => {
    confirmAction(
      L(
        `Are you sure you want to replicate and launch "${prod.title}" in your digital products shop?`,
        `هل أنت متأكد من رغبتك في استنساخ وإطلاق "${prod.title}" في متجرك للمنتجات الرقمية؟`
      ),
      () => {
        const newProd = {
          id: Date.now(),
          name: prod.title,
          type: prod.type,
          price: prod.price,
          sales: 0,
          revenue: 0,
          status: 'launched',
          created: new Date().toISOString()
        };
        const updated = [...(GC.digitalProducts?.products || []), newProd];
        saveGC({
          ...GC,
          digitalProducts: {
            ...(GC.digitalProducts || {}),
            products: updated
          }
        });
        alert(
          L(
            `Replicated successfully! "${prod.title}" is now active in your shop.`,
            `تم الاستنساخ بنجاح! "${prod.title}" أصبح نشطاً الآن في متجرك.`
          )
        );
      }
    );
  };

  const handleAddAffLink = () => {
    const name = prompt(L('Enter Program Name:', 'اسم برنامج الأفيليت:'));
    if (!name) return;
    const clicks = Math.floor(Math.random() * 500);
    const earnings = `$${Math.floor(Math.random() * 100)}`;
    const newAff = {
      n: name,
      cl: clicks,
      cv: Math.floor(clicks * 0.03),
      cvr: '3%',
      earn: earnings
    };
    const newList = [...affiliatesList, newAff];
    setAffiliatesList(newList);
    saveRevenueData({ affiliates: newList });
  };

  // 7. Patreon Membership State
  const [patNiche, setPatNiche] = useState('Business & Finance');
  const patTiersList = (DB.patTiers && DB.patTiers[patNiche] && DB.patTiers[patNiche][lang]) || (DB.patTiers && DB.patTiers['Business & Finance'] && DB.patTiers['Business & Finance'][lang]) || [];

  const handleGenLeadMagnet = () => {
    const newM = {
      e: '🧲',
      n: lang === 'ar' ? 'AI مولّد: تحدي ٣٠ يوم للمنشئ' : 'AI: 30-Day Creator Challenge',
      subs: 0,
      cvr: '0%'
    };
    const newList = [newM, ...leadMagnets];
    setLeadMagnets(newList);
    saveRevenueData({ leadMagnets: newList });
  };

  const handleAddCoachingSession = () => {
    const name = prompt(L('Enter client name:', 'أدخل اسم العميل:'));
    if (!name) return;
    const type = prompt(L('Session Type (e.g. 1-on-1 Consulting):', 'نوع الجلسة (مثال: استشارة فردية):'), '1-on-1 Consulting');
    const newSession = {
      n: name,
      ty: type,
      t: L('Tomorrow 4:00 PM', 'غداً ٤:٠٠ م'),
      s: 'bdo',
      sl: L('Pending', 'معلق')
    };
    const newList = [newSession, ...coachingSessions];
    setCoachingSessions(newList);
    saveRevenueData({ coachingSessions: newList });
  };

  const handleAddMerch = () => {
    const name = prompt(L('Merch Item Name:', 'اسم منتج الميرش:'));
    if (!name) return;
    const price = prompt(L('Price:', 'السعر:'), '$25');
    const newMerch = {
      e: '👕',
      n: { en: name, ar: name },
      p: price,
      s: 0,
      c: '#b060ff'
    };
    const newList = [...merchCatalog, newMerch];
    setMerchCatalog(newList);
    saveRevenueData({ merch: newList });
  };

  return (
    <div className="pg on" id="pg-revenue">
      <div className="pg-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--edge2)' }}>
        <div className="pg-title" style={{ margin: 0 }}>
          <span className="pg-icon">💰</span>
          {L('Revenue Hub', 'مركز الإيرادات')}
        </div>

        {/* Global Filter Bar */}
        <div className="rev-filters" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Workspace Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14px' }}>💼</span>
            <select
              className="inp"
              style={{ padding: '4px 8px', fontSize: '12px', width: 'auto', minWidth: '130px', height: '32px', borderRadius: '8px' }}
              value={filterWorkspace}
              onChange={(e) => setFilterWorkspace(e.target.value)}
            >
              <option value="all">{L('All Businesses', 'جميع الأعمال')}</option>
              {workspaces.map(ws => (
                <option key={ws.id} value={ws.id}>{ws.name}</option>
              ))}
            </select>
            {filterWorkspace !== 'all' && filterWorkspace !== 'default' && (
              <>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', padding: '4px' }}
                  onClick={handleRenameWorkspace}
                  title={L('Rename Selected Workspace', 'تعديل اسم مساحة العمل')}
                >
                  ✏️
                </button>
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', padding: '4px' }}
                  onClick={handleDeleteWorkspace}
                  title={L('Delete Selected Workspace', 'حذف مساحة العمل')}
                >
                  🗑️
                </button>
              </>
            )}
          </div>

          {/* Period Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14px' }}>📅</span>
            <select
              className="inp"
              style={{ padding: '4px 8px', fontSize: '12px', width: 'auto', minWidth: '110px', height: '32px', borderRadius: '8px' }}
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
            >
              <option value="all">{L('All Time', 'كل الأوقات')}</option>
              <option value="year">{L('This Year', 'هذا العام')}</option>
              <option value="month">{L('This Month', 'هذا الشهر')}</option>
              <option value="last30">{L('Last 30 Days', 'آخر ٣٠ يوم')}</option>
              <option value="week">{L('This Week', 'هذا الأسبوع')}</option>
              <option value="custom">{L('Custom Range', 'نطاق مخصص')}</option>
            </select>
          </div>

          {/* Custom Date Range Inputs */}
          {filterPeriod === 'custom' && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="date"
                className="inp"
                style={{ padding: '4px 8px', fontSize: '11px', width: '120px', height: '32px', borderRadius: '8px' }}
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
              <span style={{ fontSize: '11px', color: 'var(--t3)' }}>{L('to', 'إلى')}</span>
              <input
                type="date"
                className="inp"
                style={{ padding: '4px 8px', fontSize: '11px', width: '120px', height: '32px', borderRadius: '8px' }}
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="tool-tabs" id="rev-tabs" style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px', marginTop: '16px' }}>
        {[
          { key: 'rv-streams', label: L('Streams', 'مصادر الدخل'), emoji: '💰' },
          { key: 'rv-deals', label: L('Deals', 'الصفقات'), emoji: '🤝', badge: filteredLeads.length },
          { key: 'rv-neg', label: L('Negotiator', 'المفاوض الذكي'), emoji: '🤖' }
        ].map(tab => (
          <button
            key={tab.key}
            className={`tbb ${activeSubTab === tab.key ? 'on' : ''}`}
            onClick={() => setActiveSubTab(tab.key)}
          >
            {tab.emoji} {tab.label} {tab.badge > 0 && <span className="nb-badge" style={{ position: 'static', marginLeft: '5px' }}>{tab.badge}</span>}
          </button>
        ))}
      </div>

      {/* ================= TAB 1: STREAMS ================= */}
      {activeSubTab === 'rv-streams' && (
        <div className="tool-panel on" id="rv-streams">
          <div className="g4 stagger mb">
            <div className="stat-card">
              <div className="stat-lbl">💵 {L('Total Revenue', 'إجمالي الدخل')}</div>
              <div className="stat-val">{formatMoney(totalRevenue)}</div>
              <div className="stat-ch ch-up">▲ {L('Real-time', 'حقيقي')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">🔢 {L('Active Streams', 'المصادر النشطة')}</div>
              <div className="stat-val" style={{ color: 'var(--green)' }}>{activeStreamsCount}</div>
              <div className="stat-ch ch-nu">{L('of 3', 'من 3')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">📈 {L('Best Stream', 'أفضل مصدر')}</div>
              <div className="stat-val" style={{ fontSize: '18px' }}>{bestStream}</div>
              <div className="stat-ch ch-nu">{bestStreamPct}% {L('of income', 'من الدخل')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">🎯 {L('Diversity Score', 'معدل التنوع')}</div>
              <div className="stat-val" style={{ color: diversityScore > 75 ? 'var(--green)' : diversityScore > 45 ? 'var(--amber)' : 'var(--red)' }}>
                {diversityScore}
                <span style={{ fontSize: '14px', color: 'var(--t3)' }}>/100</span>
              </div>
            </div>
          </div>
          <div className="g2">
            <div className="card mb">
              <div className="sh"><div className="st">{L('Income Breakdown', 'تقسيم الدخل')}</div></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <svg width="100" height="100" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--surface3)" strokeWidth="4.5" />
                  {svgCircles.map((circle, idx) => (
                    <circle
                      key={idx}
                      cx="18"
                      cy="18"
                      r="15.9"
                      fill="none"
                      stroke={circle.color}
                      strokeWidth="4.5"
                      strokeDasharray={circle.strokeDasharray}
                      strokeDashoffset={circle.strokeDashoffset}
                      transform="rotate(-90 18 18)"
                    />
                  ))}
                  <text x="18" y="20" textAnchor="middle" fontSize="4.5" fill="var(--t1)" fontWeight="bold">
                    {totalRevenue > 1000 ? `$${(totalRevenue / 1000).toFixed(1)}K` : `$${totalRevenue}`}
                  </text>
                </svg>
                <div className="dleg" style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                  {streams.map((s, idx) => {
                    const pct = totalRevenue > 0 ? Math.round((s.val / totalRevenue) * 100) : 0;
                    const colors = ['var(--a)', 'var(--a2)', 'var(--a3)', 'var(--go)', 'var(--purple)', 'var(--orange)'];
                    return (
                      <div className="dlr" key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="dd" style={{ background: colors[idx], width: '10px', height: '10px', borderRadius: '50%' }}></div>
                        <div style={{ fontSize: '11.5px', color: 'var(--t2)', flex: 1 }}>{s.name}</div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t1)' }}>
                          {formatMoney(s.val)} ({pct}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="card mb">
              <div className="sh"><div className="st">{L('Launch New Stream', 'إطلاق مصدر دخل جديد')}</div></div>
              <div id="stream-launcher" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {streamsLauncherItems.map((s, idx) => (
                  <div className="row" key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid var(--edge)' }}>
                    <div style={{ fontSize: '16px' }}>{s.e}</div>
                    <div style={{ flex: 1 }}>
                      <div className="rn" style={{ fontWeight: 600, fontSize: '12.5px' }}>{s.n}</div>
                      <div className="rs" style={{ fontSize: '11px', color: 'var(--t2)' }}>{s.est} · {s.t}</div>
                    </div>
                    <span className={`badge ${s.a ? 'b-green' : 'b-ai'}`}>
                      {s.a ? L('Active', 'نشط') : L('Not started', 'لم تبدأ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: DEALS ================= */}
      {activeSubTab === 'rv-deals' && (
        <div className="tool-panel on" id="rv-deals">
          <div className="g4 stagger mb">
            <div className="stat-card">
              <div className="stat-lbl">🟢 {L('Active Deals', 'الصفقات النشطة')}</div>
              <div className="stat-val" style={{ color: 'var(--green)' }}>
                {activeDealsCount}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">🟡 {L('Pending Deals', 'الصفقات المعلقة')}</div>
              <div className="stat-val" style={{ color: 'var(--amber)' }}>
                {pendingDealsCount}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">💰 {L('Completed Value', 'الصفقات المكتملة')}</div>
              <div className="stat-val">{formatMoney(crmClosedRevenue)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">📊 {L('Avg Deal', 'متوسط الصفقة')}</div>
              <div className="stat-val">
                {formatMoney(
                  filteredLeads.length > 0
                    ? (filteredLeads.reduce((sum, d) => sum + (parseFloat(d.value) || 0), 0) / filteredLeads.length)
                    : 0
                )}
              </div>
            </div>
          </div>
          <div className="card mb">
            <div className="sh" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div className="st" style={{ minWidth: '220px' }}>{L('Deals Pipeline (Drag & Drop or Click card to Manage)', 'مراحل صفقات المبيعات (اسحب وأسقط أو اضغط لإدارة الصفقة)')}</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '11.5px' }} onClick={handleCreateWorkspace}>
                  💼 {L('+ Add Business/Workspace', '+ إضافة مساحة عمل')}
                </button>
                <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '11.5px' }} onClick={handleAddStage}>
                  ⚙️ {L('+ Add Stage', '+ إضافة مرحلة')}
                </button>
                <button className="btn btn-prime" style={{ padding: '6px 12px', fontSize: '11.5px' }} onClick={handleAddDeal}>
                  + {L('New Deal', 'صفقة جديدة')}
                </button>
              </div>
            </div>
            <div
              className="pipe"
              style={{
                display: 'flex',
                gap: '12px',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                paddingBottom: '12px',
                minHeight: '380px',
                alignItems: 'stretch'
              }}
            >
              {activeStages.map(stage => {
                const stageList = dealsByStage[stage.key] || [];
                return (
                  <div
                    className="pcol"
                    key={stage.key}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const leadId = e.dataTransfer.getData("text/plain");
                      handleDropDeal(leadId, stage.key);
                    }}
                    style={{
                      background: 'var(--surface2)',
                      padding: '12px',
                      borderRadius: '12px',
                      minWidth: '260px',
                      flex: '0 0 260px',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div
                      className="pch"
                      style={{
                        fontWeight: 700,
                        fontSize: '13px',
                        marginBottom: '10px',
                        borderBottom: '2px solid var(--edge)',
                        paddingBottom: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: 'var(--t1)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: stage.color }}></span>
                        <span>{stage.label}</span>
                        <button
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', padding: '2px', opacity: 0.6 }}
                          onClick={(e) => { e.stopPropagation(); handleEditStage(stage); }}
                          title={L('Edit Stage', 'تعديل المرحلة')}
                        >
                          ✏️
                        </button>
                        {activeStages.length > 1 && (
                          <button
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', padding: '2px', opacity: 0.6 }}
                            onClick={(e) => { e.stopPropagation(); handleDeleteStage(stage); }}
                            title={L('Delete Stage', 'حذف المرحلة')}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      <span style={{ background: 'var(--surface3)', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', color: stage.color, fontWeight: 'bold' }}>
                        {stageList.length}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minHeight: '260px' }}>
                      {stageList.length > 0 ? (
                        stageList.map((d, idx) => (
                          <div
                            className="pc card"
                            key={d.id || idx}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/plain", d.id);
                            }}
                            style={{
                              background: 'var(--surface3)',
                              padding: '10px',
                              borderRadius: '8px',
                              cursor: 'grab',
                              borderLeft: `4px solid ${stage.color}`,
                              position: 'relative',
                              transition: 'transform 0.1s ease, box-shadow 0.1s ease'
                            }}
                            onClick={() => handleMoveDeal(d)}
                          >
                            <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--t1)', marginBottom: '3px' }}>{d.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--orange)', fontWeight: 700 }}>{formatMoney(d.value)}</div>
                            {d.notes && <div style={{ fontSize: '11px', color: 'var(--t2)', marginTop: '4px', lineHeight: '1.4' }}>{d.notes}</div>}
                            {d.workspaceName && <div style={{ fontSize: '10px', color: 'var(--t3)', marginTop: '6px' }}>💼 {d.workspaceName}</div>}
                          </div>
                        ))
                      ) : (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--edge)', borderRadius: '8px', padding: '16px', color: 'var(--t3)', fontSize: '11.5px', textAlign: 'center' }}>
                          {L('Drag deal here', 'اسحب الصفقة هنا')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="card mb">
            <div className="sh"><div className="st">{L('Best Brands to Repeat', 'أفضل الماركات للمتابعة')}</div></div>
            <div id="best-brands" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {realBestBrands.length === 0 ? (
                <div style={{ padding: '20px', color: 'var(--t3)', textAlign: 'center', fontSize: '12px' }}>
                  {L('No completed brand deals yet. Close deals in CRM to see insights.', 'لا توجد صفقات براندات مكتملة بعد. أكمل الصفقات في إدارة العملاء لتظهر هنا.')}
                </div>
              ) : (
                realBestBrands.map((b, idx) => (
                  <div className="row" key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--edge)' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--orange-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', color: 'var(--orange)' }}>
                      {b.name[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="rn" style={{ fontWeight: 600, fontSize: '12.5px' }}>{b.name}</div>
                      <div className="rs" style={{ fontSize: '11px', color: 'var(--t2)' }}>
                        {b.deals} {L('deals', 'صفقات')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--orange)' }}>{formatMoney(b.rev)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: NEGOTIATOR ================= */}
      {activeSubTab === 'rv-neg' && (
        <div className="tool-panel on" id="rv-neg">
          <div className="g2">
            <div className="card mb">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Brand Name', 'اسم البراند')}
                  </label>
                  <input
                    className="inp"
                    value={negBrand}
                    onChange={(e) => setNegBrand(e.target.value)}
                    placeholder="e.g. Nike, Samsung..."
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Their Offer', 'عرضهم المالي')}
                  </label>
                  <input
                    className="inp"
                    value={negAmount}
                    onChange={(e) => setNegAmount(e.target.value)}
                    placeholder="$500"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Content Type', 'نوع المحتوى')}
                  </label>
                  <CustomSelect
                    className="inp"
                    value={negType}
                    onChange={(e) => setNegType(e.target.value)}
                  >
                    <option value="1x Reel">1x Reel</option>
                    <option value="1x Carousel">1x Carousel</option>
                    <option value="Stories Package">Stories Package</option>
                    <option value="Full Campaign">Full Campaign</option>
                    <option value="Product Review">Product Review</option>
                  </CustomSelect>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Exclusivity', 'حقوق الحصرية')}
                  </label>
                  <CustomSelect
                    className="inp"
                    value={negExcl}
                    onChange={(e) => setNegExcl(e.target.value)}
                  >
                    <option value="No exclusivity">No exclusivity</option>
                    <option value="30 days">30 days</option>
                    <option value="60 days">60 days</option>
                    <option value="90 days">90 days</option>
                  </CustomSelect>
                </div>
                <button className="btn btn-prime" onClick={handleRunNeg} style={{ width: '100%', justifyContent: 'center' }}>
                  🤖 {L('Analyze Deal', 'تحليل الصفقة')}
                </button>
              </div>
            </div>
            <div className="card mb">
              <div className="sh"><div className="st">{L('AI Analysis', 'تحليل الذكاء')}</div></div>
              <div id="negout">
                {!negResult ? (
                  <div style={{ fontSize: '12px', color: 'var(--t3)', textAlign: 'center', padding: '36px 0' }}>
                    {L('Fill details and analyze', 'املأ التفاصيل واضغط للتحليل')}
                  </div>
                ) : (
                  <div>
                    <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                      <div style={{ fontSize: '32px' }}>{negResult.icon}</div>
                      <div style={{ fontFamily: 'var(--ff)', fontSize: '18px', fontWeight: 800, color: negResult.color, marginTop: '4px' }}>
                        {negResult.rating}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px', marginBottom: '12px' }}>
                      <div className="stat" style={{ textAlign: 'center' }}>
                        <div className="slbl" style={{ justifyContent: 'center' }}>{L('Their Offer', 'عرضهم')}</div>
                        <div className="sval" style={{ color: negResult.color }}>${negResult.amount.toLocaleString()}</div>
                      </div>
                      <div className="stat" style={{ textAlign: 'center' }}>
                        <div className="slbl" style={{ justifyContent: 'center' }}>{L('Fair Value', 'القيمة العادلة')}</div>
                        <div className="sval" style={{ color: 'var(--orange)' }}>${negResult.fair.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="ai" style={{ padding: '10px', background: 'var(--orange-dim)', borderRadius: '8px', border: '1px solid var(--orange-d)' }}>
                      <strong>{L('AI Recommendation', 'توصية الذكاء الاصطناعي')}:</strong>
                      <br /><br />
                      <div className="ai-box" style={{ padding: 0, background: 'transparent', border: 'none', marginBottom: '12px', fontSize: '13px' }} dangerouslySetInnerHTML={{ __html: parseMarkdown(negResult.rec) }} />
                      <button
                        className="btn btn-prime"
                        style={{ marginTop: '12px', width: '100%', justifyContent: 'center', padding: '6px' }}
                        onClick={handleSaveNegToCRM}
                      >
                        ➕ {L('Save to CRM Pipeline', 'حفظ في مراحل CRM')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="card mb">
            <div className="sh"><div className="st">{L('Pricing Templates', 'قوالب التسعير')}</div></div>
            <div className="g3" id="pricetmpl">
              {(DB.priceTmpl[lang] || []).map((t, idx) => (
                <div className="card" key={idx} style={{ borderColor: `${t.c}40` }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: t.c, marginBottom: '5px' }}>
                    🏷️ {t.n}
                  </div>
                  <div style={{ fontFamily: 'var(--ff)', fontSize: '15px', fontWeight: 800, color: 'var(--t1)', marginBottom: '7px' }}>
                    {t.p}
                  </div>
                  {t.items.map((item, i) => (
                    <div style={{ fontSize: '11.5px', color: 'var(--t2)', marginBottom: '2px' }} key={i}>
                      ✓ {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}



      {/* ================= TAB 8: EMAIL ================= */}
      {/* ================= TAB: DIGITAL PRODUCTS ================= */}
      {activeSubTab === 'rv-digital' && (
        <div className="tool-panel on" id="rv-digital">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--t1)', marginBottom: '4px' }}>
              🕵️‍♂️ {L('Digital Products Spy (Trending)', 'جاسوس المنتجات الرقمية (التريندات)')}
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--t2)', margin: 0 }}>
              {L('Explore high-demand products selling now on Gumroad, Etsy, and Stan Store. Steal the idea and activate it in your shop with a single click!', 'استكشف المنتجات الرقمية الأكثر طلباً ومبيعاً حالياً على Gumroad و Etsy. اقتبس الفكرة وفعلها بمتجرك بضغطة زر!')}
            </p>
          </div>

          <div className="g3" id="shopgrid">
            {trendingCatalog.map((prod, idx) => {
              const estRevenue = prod.price * prod.monthly_sales;
              return (
                <div
                  className="prd card"
                  key={idx}
                  style={{ background: 'var(--surface2)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--edge)', display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                  {/* Top Bar with Emoji & Platform */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: 'var(--surface3)', borderBottom: '1px solid var(--edge)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>{prod.emoji}</span>
                      <span className="badge b-purple" style={{ fontSize: '10px', padding: '3px 8px' }}>
                        {prod.type}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--t3)', fontWeight: 600 }}>
                      🔥 {prod.platform}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--t1)', marginBottom: '6px', lineHeight: '1.4' }}>
                        {prod.title}
                      </h4>
                      <p style={{ fontSize: '11.5px', color: 'var(--t2)', marginBottom: '12px', lineHeight: '1.5' }}>
                        {prod.desc}
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px', marginBottom: '14px', padding: '8px 10px', background: 'var(--surface3)', borderRadius: '8px' }}>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--t3)', display: 'block' }}>{L('Est. Revenue / mo', 'الإيراد الشهري المتوقع')}</span>
                        <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--green)' }}>
                          ${estRevenue.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '10px', color: 'var(--t3)', display: 'block' }}>{L('Price Point', 'السعر المقترح')}</span>
                        <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--orange)' }}>
                          ${prod.price}
                        </span>
                      </div>
                    </div>

                    {/* Meta info (why trending & tools) */}
                    <div style={{ fontSize: '11px', color: 'var(--t2)', borderTop: '1px solid var(--edge)', paddingTop: '10px' }}>
                      <div style={{ marginBottom: '6px' }}>
                        <strong>{L('Why Trending:', 'لماذا هو رائج:')} </strong>
                        {prod.why_trending}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                        {prod.ai_tools.map((tool, tIdx) => (
                          <span key={tIdx} style={{ background: 'var(--surface3)', color: 'var(--t1)', padding: '2px 6px', borderRadius: '4px', fontSize: '9.5px' }}>
                            🛠️ {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ padding: '10px 14px', background: 'var(--surface3)', borderTop: '1px solid var(--edge)', display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-prime"
                      style={{ width: '100%', justifyContent: 'center', padding: '6px 12px', fontSize: '12px', background: 'linear-gradient(135deg, var(--orange), var(--purple))' }}
                      onClick={() => handleStealProduct(prod)}
                    >
                      ⚡ {L('Steal & Launch Idea', 'سرقة الفكرة وإطلاق المنتج')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
