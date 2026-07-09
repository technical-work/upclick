'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';
import { parseMarkdown } from '../../utils/markdown';
import CustomSelect from '../CustomSelect';

const MICRO_NICHES = {
  coaching: ['Business Coaching', 'Life Coaching', 'Career Coaching', 'Relationship Coaching', 'Health Coaching', 'Mindset & Productivity'],
  marketing: ['Social Media Marketing', 'Email Marketing', 'Content Marketing', 'SEO & Blogging', 'Paid Ads Strategy', 'Personal Branding'],
  finance: ['Personal Budgeting', 'Investment Basics', 'Freelancer Finance', 'Business Finance', 'Debt Freedom', 'Passive Income'],
  ai: ['ChatGPT Prompts', 'AI for Business', 'AI Image Prompts', 'AI Writing', 'AI Automation', 'AI Tools Directory'],
  fitness: ['Home Workouts', 'Nutrition Planning', 'Weight Loss', 'Muscle Building', 'Yoga & Wellness', 'Running Plans'],
  content: ['Instagram Growth', 'YouTube Strategy', 'TikTok Content', 'Podcast Launch', 'Newsletter Building', 'Content Calendar'],
  business: ['Freelancing Setup', 'Agency Building', 'SaaS Ideas', 'E-commerce', 'Consulting', 'Online Course Creation'],
  design: ['Canva Templates', 'Brand Identity', 'Social Media Kits', 'Presentation Design', 'Logo Design Pack', 'UX/UI Resources']
};

export default function DigitalProductsView() {
  const { lang, L, t, GC, saveGC, setDpDetailOpen, setDpDetailIndex, confirmAction, promptAction } = useBusiness();

  // Tab state
  const [activeSubTab, setActiveSubTab] = useState('trending'); // 'trending', 'niche', 'builder', 'myproducts'

  // Trending Tab States
  const [platform, setPlatform] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [market, setMarket] = useState('arab');
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingProducts, setTrendingProducts] = useState(GC.digitalProducts?.trendingProducts || []);
  const [loadingTrends, setLoadingTrends] = useState(false);

  // Niche Tab States
  const [selectedNiche, setSelectedNiche] = useState(null);
  const [selectedMicroNiche, setSelectedMicroNiche] = useState(null);
  const [nicheProducts, setNicheProducts] = useState([]);
  const [loadingNicheProducts, setLoadingNicheProducts] = useState(false);

  // Builder Tab States
  const [builderName, setBuilderName] = useState('');
  const [builderType, setBuilderType] = useState('Notion Template');
  const [builderAudience, setBuilderAudience] = useState('');
  const [builderPrice, setBuilderPrice] = useState('27');
  const [builderTime, setBuilderTime] = useState('1-2 days sprint');
  const [builderProblem, setBuilderProblem] = useState('');
  const [builderPlanText, setBuilderPlanText] = useState('');
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [currentPlanObject, setCurrentPlanObject] = useState(null);
  const [builderNiche, setBuilderNiche] = useState('marketing');
  const [builderAudienceSize, setBuilderAudienceSize] = useState('Under 5k followers');
  const [builderFormat, setBuilderFormat] = useState('Notion Workspace');
  const [builderChannel, setBuilderChannel] = useState('Instagram Reels');
  const [builderPlanJson, setBuilderPlanJson] = useState(null);
  const [selectedManageProduct, setSelectedManageProduct] = useState(null);
  const [generatingOutline, setGeneratingOutline] = useState(false);

  // My Products list state
  const myProducts = GC.digitalProducts?.products || [];

  // Sync My Products to context & database
  const saveMyProducts = (list) => {
    saveGC({
      ...GC,
      digitalProducts: {
        ...GC.digitalProducts,
        products: list
      }
    });
  };

  // Pre-select niche on mount or profile change
  useEffect(() => {
    if (GC.profile?.niche) {
      const userNiche = GC.profile.niche.toLowerCase();
      const matchedKey = Object.keys(MICRO_NICHES).find(key => 
        userNiche.includes(key) || key.includes(userNiche)
      );
      if (matchedKey) {
        setSelectedNiche(matchedKey);
        setBuilderNiche(matchedKey);
      } else {
        setSelectedNiche('marketing'); // default fallback
        setBuilderNiche('marketing');
      }
    } else {
      setSelectedNiche('marketing'); // default fallback
      setBuilderNiche('marketing');
    }
  }, [GC.profile?.niche]);

  // Auto-load trends on mount if not loaded yet
  useEffect(() => {
    if (!trendingProducts || trendingProducts.length === 0) {
      loadDPTrends();
    }
  }, []);

  // Fallback trending data
  const getFallbackTrends = () => {
    return [
      {title:'30-Day Social Media Content Calendar',type:'Notion Template',platform:'Gumroad',price:27,monthly_sales:340,rating:4.8,demand_score:9,opportunity_score:8,emoji:'📅',why_trending:'Creators need structured content planning',ai_tools:['Notion AI','Claude','ChatGPT'],sell_on:['Gumroad','Payhip','Etsy'],creation_days:3,description:'A complete Notion workspace to plan, draft, and schedule Instagram and TikTok posts.'},
      {title:'ChatGPT Prompt Pack for Coaches',type:'AI Prompt Pack',platform:'Gumroad',price:19,monthly_sales:520,rating:4.7,demand_score:10,opportunity_score:9,emoji:'🤖',why_trending:'AI tools adoption exploding in Arab market',ai_tools:['Claude','ChatGPT','Notion'],sell_on:['Gumroad','Stan Store','Payhip'],creation_days:2,description:'150+ custom prompts to write client proposals, create content, and generate workbook ideas.'},
      {title:'Business Finance Tracker — Arabic',type:'Excel Template',platform:'Etsy',price:15,monthly_sales:280,rating:4.9,demand_score:8,opportunity_score:7,emoji:'💰',why_trending:'Arabic-language finance tools are scarce',ai_tools:['Google Sheets','Claude','ChatGPT'],sell_on:['Etsy','Payhip','Gumroad'],creation_days:4,description:'Simple bookkeeping spreadsheet with RTL support, tax calculations, and dashboard graphs.'},
      {title:'Instagram Reels Script Bundle (50 Scripts)',type:'Swipe File',platform:'Gumroad',price:37,monthly_sales:190,rating:4.6,demand_score:9,opportunity_score:8,emoji:'🎬',why_trending:'Video content demand growing 3x in Gulf region',ai_tools:['Claude','ChatGPT','CapCut'],sell_on:['Gumroad','Stan Store','Payhip'],creation_days:5,description:'Proven viral hook structures and high-retention body scripts for business consultants.'},
      {title:'Freelancer Client Proposal Template',type:'Canva Template',platform:'Creative Market',price:22,monthly_sales:410,rating:4.8,demand_score:8,opportunity_score:8,emoji:'📋',why_trending:'Freelancing booming in MENA region',ai_tools:['Canva','Claude','ChatGPT'],sell_on:['Creative Market','Gumroad','Etsy'],creation_days:2,description:'A high-end, 12-page proposal slide deck editable in Canva free or pro accounts.'},
      {title:'Online Course Launch Checklist',type:'PDF Guide',platform:'Gumroad',price:9,monthly_sales:680,rating:4.5,demand_score:9,opportunity_score:7,emoji:'🚀',why_trending:'Low barrier to entry, high search volume',ai_tools:['Notion','Claude','Canva'],sell_on:['Gumroad','Payhip','Stan Store'],creation_days:1,description:'A step-by-step PDF roadmap summarizing everything from pre-launch validation to sales page setups.'},
    ];
  };

  // Load Trending Products
  const loadDPTrends = async () => {
    setLoadingTrends(true);
    setTrendingProducts([]);

    try {
      const promptText = `Generate 6 trending digital products currently selling on ${platform === 'all' ? 'Etsy, Gumroad, Payhip, Creative Market' : platform}.
Market: ${market}.
${typeFilter !== 'all' ? `Type filter: ${typeFilter}` : ''}
${selectedNiche && selectedNiche !== 'all' ? `Niche category filter: ${selectedNiche}` : ''}

You MUST return a valid JSON array. Each object in the array must look exactly like this example structure:
[
  {
    "title": "Arabic Social Media Templates Bundle",
    "type": "Canva Templates",
    "platform": "Etsy",
    "price": 25,
    "monthly_sales": 320,
    "rating": 4.8,
    "demand_score": 8,
    "category": "Design",
    "emoji": "🎨",
    "description": "50 high-converting Arabic Canva templates for instagram posts.",
    "opportunity_score": 9,
    "why_trending": "Arab content creators need professional visual designs.",
    "ai_tools": ["Canva", "Midjourney", "Claude"],
    "sell_on": ["Etsy", "Gumroad", "Payhip"],
    "creation_days": 2
  }
]

Focus on trending products relevant to Arab entrepreneurs and creators.
DO NOT write any introduction, description, markdown explanation, or formatting outside of the JSON array. Start your response directly with [ and end with ].`;

      const systemText = 'You are a digital product market researcher. Return ONLY a valid JSON array, no markdown or extra text.';

      const rawText = await callClaudeAPI(promptText, systemText, lang, GC);
      
      let finalProducts = [];
      if (typeof rawText === 'string' && rawText.includes('❌')) {
        finalProducts = getFallbackTrends();
      } else {
        let cleaned = (rawText || '[]').replace(/```json/g, '').replace(/```/g, '').trim();
        if (cleaned.indexOf('[') > -1) {
          cleaned = cleaned.slice(cleaned.indexOf('['), cleaned.lastIndexOf(']') + 1);
        }
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) {
          finalProducts = parsed;
        } else {
          finalProducts = getFallbackTrends();
        }
      }

      setTrendingProducts(finalProducts);
      saveGC({
        ...GC,
        digitalProducts: {
          ...GC.digitalProducts,
          trendingProducts: finalProducts
        }
      });
    } catch (e) {
      console.warn("API failed in loadDPTrends, using fallback data:", e);
      const fallbacks = getFallbackTrends();
      setTrendingProducts(fallbacks);
      saveGC({
        ...GC,
        digitalProducts: {
          ...GC.digitalProducts,
          trendingProducts: fallbacks
        }
      });
    } finally {
      setLoadingTrends(false);
    }
  };

  // Filter trends client side with soft-fallback to avoid displaying empty screens
  const getFilteredTrends = () => {
    let list = trendingProducts;

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.type || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.why_trending || '').toLowerCase().includes(q)
      );
    }

    // 2. Platform Filter
    if (platform !== 'all') {
      const plat = platform.toLowerCase();
      const temp = list.filter(p => (p.platform || '').toLowerCase().includes(plat));
      if (temp.length > 0) {
        list = temp;
      }
    }

    // 3. Type Filter
    if (typeFilter !== 'all') {
      const t = typeFilter.toLowerCase();
      const temp = list.filter(p => {
        const typeStr = (p.type || '').toLowerCase();
        if (t === 'notion') return typeStr.includes('notion');
        if (t === 'canva') return typeStr.includes('canva');
        if (t === 'prompt') return typeStr.includes('prompt') || typeStr.includes('ai');
        if (t === 'excel') return typeStr.includes('excel') || typeStr.includes('sheet');
        if (t === 'pdf') return typeStr.includes('pdf') || typeStr.includes('guide') || typeStr.includes('ebook');
        if (t === 'course') return typeStr.includes('course') || typeStr.includes('academy');
        if (t === 'swipe') return typeStr.includes('swipe') || typeStr.includes('script');
        if (t === 'toolkit') return typeStr.includes('toolkit') || typeStr.includes('bundle');
        return typeStr.includes(t);
      });
      if (temp.length > 0) {
        list = temp;
      }
    }

    // 4. Niche Filter (🎯 حسب المجال)
    if (selectedNiche && selectedNiche !== 'all') {
      const nicheStr = selectedNiche.toLowerCase();
      const temp = list.filter(p => {
        const cat = (p.category || '').toLowerCase();
        const title = (p.title || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        
        if (nicheStr === 'coaching') return cat.includes('coach') || title.includes('coach') || desc.includes('coach');
        if (nicheStr === 'marketing') return cat.includes('market') || title.includes('market') || desc.includes('market') || cat.includes('content') || title.includes('content');
        if (nicheStr === 'finance') return cat.includes('finance') || title.includes('finance') || desc.includes('finance') || cat.includes('money') || title.includes('money');
        if (nicheStr === 'ai') return cat.includes('ai') || title.includes('ai') || desc.includes('ai') || cat.includes('prompt') || title.includes('prompt');
        if (nicheStr === 'fitness') return cat.includes('fit') || title.includes('fit') || desc.includes('fit') || cat.includes('health') || title.includes('health');
        if (nicheStr === 'content') return cat.includes('content') || title.includes('content') || desc.includes('content') || title.includes('write') || desc.includes('write');
        if (nicheStr === 'business') return cat.includes('business') || title.includes('business') || desc.includes('business') || cat.includes('startup') || title.includes('startup');
        if (nicheStr === 'design') return cat.includes('design') || title.includes('design') || desc.includes('design') || cat.includes('art') || title.includes('art');
        return cat.includes(nicheStr) || title.includes(nicheStr) || desc.includes(nicheStr);
      });
      if (temp.length > 0) {
        list = temp;
      }
    }

    return list;
  };

  const handleOpenDPDetail = (product) => {
    setDpDetailIndex(product);
    setDpDetailOpen(true);
  };

  const handleQuickBuildFromTrend = (product) => {
    setBuilderName(product.title || '');
    setBuilderType(product.type || 'Notion Template');
    setBuilderPrice(String(product.price || '27'));
    setActiveSubTab('builder');
  };

  // Select Niche
  const handleSelectNiche = (nicheKey) => {
    setSelectedNiche(nicheKey);
    setSelectedMicroNiche(null);
    setNicheProducts([]);
  };

  // Load Micro Niche Products
  const handleLoadMicroNicheProducts = async (micro, mainNiche) => {
    setSelectedMicroNiche(micro);
    setLoadingNicheProducts(true);
    setNicheProducts([]);

    try {
      const promptText = `Generate 6 digital product ideas for micro-niche: "${micro}" in the "${mainNiche}" space.
Target: Arab creators and entrepreneurs.

You MUST return a valid JSON array. Each object in the array must look exactly like this example structure:
[
  {
    "title": "Ultimate ${micro} Guidebook",
    "type": "PDF Guide",
    "price": 19,
    "monthly_sales": 150,
    "emoji": "📖",
    "creation_days": 3,
    "description": "Step-by-step workbook to dominate ${micro} space."
  }
]

DO NOT write any introduction, description, markdown explanation, or formatting outside of the JSON array. Start your response directly with [ and end with ].`;
      const systemText = 'Digital product researcher. Return ONLY JSON array.';

      const rawText = await callClaudeAPI(promptText, systemText, lang, GC);
      
      if (typeof rawText === 'string' && rawText.includes('❌')) {
        setNicheProducts([
          { title: `Ultimate ${micro} Guidebook`, type: 'PDF Guide', price: 19, monthly_sales: 150, emoji: '📖', creation_days: 3, description: `Step-by-step workbook to dominate ${micro} space.` },
          { title: `${micro} Workflow Dashboard`, type: 'Notion Template', price: 29, monthly_sales: 95, emoji: '⚡', creation_days: 5, description: `A robust digital planning workspace for ${micro} professionals.` },
          { title: `${micro} Starter Toolkit`, type: 'Toolkit / Bundle', price: 47, monthly_sales: 60, emoji: '🛠️', creation_days: 7, description: `A comprehensive bundle containing cheat sheets, scripts, and asset packs.` }
        ]);
        setLoadingNicheProducts(false);
        return;
      }

      let cleaned = (rawText || '[]').replace(/```json/g, '').replace(/```/g, '').trim();
      if (cleaned.indexOf('[') > -1) {
        cleaned = cleaned.slice(cleaned.indexOf('['), cleaned.lastIndexOf(']') + 1);
      }
      const parsed = JSON.parse(cleaned);
      setNicheProducts(parsed);
    } catch (e) {
      console.warn("API failed in loadMicroNicheProducts, using fallback:", e);
      // Fallback micro niche products
      setNicheProducts([
        { title: `Ultimate ${micro} Guidebook`, type: 'PDF Guide', price: 19, monthly_sales: 150, emoji: '📖', creation_days: 3, description: `Step-by-step workbook to dominate ${micro} space.` },
        { title: `${micro} Workflow Dashboard`, type: 'Notion Template', price: 29, monthly_sales: 95, emoji: '⚡', creation_days: 5, description: `A robust digital planning workspace for ${micro} professionals.` },
        { title: `${micro} Starter Toolkit`, type: 'Toolkit / Bundle', price: 47, monthly_sales: 60, emoji: '🛠️', creation_days: 7, description: `A comprehensive bundle containing cheat sheets, scripts, and asset packs.` }
      ]);
    } finally {
      setLoadingNicheProducts(false);
    }
  };

  // Generate execution plan
  const handleBuildDPPlan = async () => {
    if (!builderName.trim()) {
      alert(L('Enter a product name first', 'الرجاء إدخال اسم المنتج أولاً'));
      return;
    }

    setGeneratingPlan(true);
    setBuilderPlanText('');
    setBuilderPlanJson(null);
    setCurrentPlanObject(null);

    const fallbackJson = {
      monthly_revenue_low: Math.round(parseInt(builderPrice) * 5),
      monthly_revenue_high: Math.round(parseInt(builderPrice) * 20),
      break_even_copies: 10,
      timeline_steps: [
        { day: L("Day 1", "اليوم ١"), task: L("Market outline & planning", "التخطيط وتحديد الفصول"), detail: L("Outline the modules using Claude based on target niche.", "صياغة فصول وهيكل المنتج الرقمي باستخدام Claude بناءً على النيش.") },
        { day: L("Day 2", "اليوم ٢"), task: L("Asset Design", "تصميم الأصول والروابط"), detail: L("Build the Notion or Canva layout and design custom graphics.", "تصميم الهيكل على Notion أو Canva وإعداد التصاميم الرسومية.") },
        { day: L("Day 3", "اليوم ٣"), task: L("Landing Page & Copywriting", "صفحة الهبوط والتسويق"), detail: L("Write copy, set up standard payout links on Gumroad/Payhip.", "كتابة نصوص البيع وربط بوابات الدفع على Gumroad أو Payhip.") }
      ],
      ai_tools: [
        { name: "Claude.ai", use: L("Generate outlines, hooks and copywriting scripts", "توليد نصوص تسويقية وصياغة هيكل المنتج") },
        { name: "Canva AI", use: L("Design high-quality mockups and visual cover art", "تصميم أغلفة كروت وعروض بصرية للمنتج") }
      ],
      platforms: [
        { name: "Gumroad", reason: L("Extremely simple setup and Arab region payout compatibility", "سهولة تامة في إعداد صفحة المنتج ومناسب للمشترين العرب") }
      ],
      marketing_hooks: [
        { hook: `هل سئمت من التخطيط اليدوي العشوائي؟ احصل على "${builderName}" الجاهز الآن!`, angle: L("Pain point", "التركيز على حل مشكلة قائمة") },
        { hook: "نفس النظام الذي أستخدمه لإنجاز عملي في دقائق، متاح لك الآن لتنسخه بضغطة زر.", angle: L("Authority", "التركيز على الفعالية والسرعة") }
      ],
      risk: L("No audience to pitch the product directly to.", "عدم وجود جمهور كافي للشراء الفوري عند الإطلاق الأولى."),
      mitigation: L("Offer a 50% discount pre-sale link on social reels/stories to validate interest first.", "تقديم رابط بيع مسبق بخصم ٥٠٪ على المنصات للتحقق من الرغبة قبل بناء الأصول بالكامل.")
    };

    try {
      const promptText = `Create a realistic, actionable execution plan for this digital product:
Name: ${builderName}
Type: ${builderType}
Niche: ${builderNiche}
Target Audience: ${builderAudience || 'Arab creators'}
Audience Size: ${builderAudienceSize}
Format: ${builderFormat}
Primary Promo Channel: ${builderChannel}
Price Point: $${builderPrice}
Time Available: ${builderTime}
Problem Solved: ${builderProblem || 'saving time/effort'}

You MUST return a valid JSON object. Follow this exact structure:
{
  "monthly_revenue_low": number,
  "monthly_revenue_high": number,
  "break_even_copies": number,
  "timeline_steps": [
    { "day": "Day 1", "task": "Task Title in Arabic", "detail": "Specific actionable steps in Arabic..." }
  ],
  "ai_tools": [
    { "name": "Tool Name", "use": "How to use it specifically for this product in Arabic" }
  ],
  "platforms": [
    { "name": "Platform Name", "reason": "Why this platform is best for Arab sellers in Arabic" }
  ],
  "marketing_hooks": [
    { "hook": "Arabic hook text...", "angle": "Hook angle/theme in Arabic (e.g. FOMO, Time-saving)" }
  ],
  "risk": "Biggest launch risk in Arabic",
  "mitigation": "Concrete steps to mitigate this risk in Arabic"
}

Be highly realistic. Adjust revenue numbers based on the user's audience size: if audience size is small, keep revenue realistic (e.g. $100-$500). If it is large, scale it up. Write the text content (hooks, descriptions, details, reasons) in Arabic since the target market is Arab.
Return ONLY valid JSON. Start directly with { and end with }.`;

      const systemText = 'You are a digital product launch strategist specializing in the Arab creator economy. Return ONLY a valid JSON object.';

      const reply = await callClaudeAPI(promptText, systemText, lang, GC);

      let cleaned = (reply || '{}').replace(/```json/g, '').replace(/```/g, '').trim();
      if (cleaned.indexOf('{') > -1) {
        cleaned = cleaned.slice(cleaned.indexOf('{'), cleaned.lastIndexOf('}') + 1);
      }
      const parsed = JSON.parse(cleaned);

      setBuilderPlanJson(parsed);
      setCurrentPlanObject({
        name: builderName,
        type: builderType,
        audience: builderAudience || 'Arab entrepreneurs',
        price: parseInt(builderPrice) || 27,
        time: builderTime,
        status: 'draft',
        created: new Date().toISOString()
      });
    } catch (e) {
      console.warn("API failed in buildDPPlan, using fallback plan:", e);
      setBuilderPlanJson(fallbackJson);
      setCurrentPlanObject({
        name: builderName,
        type: builderType,
        audience: builderAudience || 'Arab entrepreneurs',
        price: parseInt(builderPrice) || 27,
        time: builderTime,
        status: 'draft',
        created: new Date().toISOString()
      });
    } finally {
      setGeneratingPlan(false);
    }
  };

  // Add plan to My Products
  const handleAddToMyProducts = () => {
    if (!currentPlanObject) return;
    const newProduct = {
      ...currentPlanObject,
      id: Date.now(),
      sales: 0,
      revenue: 0,
      status: 'draft'
    };
    const updated = [...myProducts, newProduct];
    saveMyProducts(updated);
    setCurrentPlanObject(null);
    alert(L('Added to My Products! 📦', 'تمت الإضافة إلى منتجاتي! 📦'));
  };

  // Delete product
  const handleDeleteProduct = (id) => {
    const updated = myProducts.filter(p => p.id !== id);
    saveMyProducts(updated);
  };

  const handleUpdateProduct = (updatedProd) => {
    const list = myProducts.map(p => p.id === updatedProd.id ? updatedProd : p);
    saveMyProducts(list);
    setSelectedManageProduct(updatedProd);
  };

  const handleAddSale = () => {
    if (!selectedManageProduct) return;
    const priceVal = parseFloat(selectedManageProduct.price) || 0;
    const updated = {
      ...selectedManageProduct,
      sales: (selectedManageProduct.sales || 0) + 1,
      revenue: (selectedManageProduct.revenue || 0) + priceVal
    };
    handleUpdateProduct(updated);
    alert(L('Sale recorded successfully!', 'تم تسجيل البيع بنجاح وتحديث الأرباح!'));
  };

  const handleToggleTask = (taskIndex) => {
    if (!selectedManageProduct) return;
    const currentChecked = selectedManageProduct.checklist || [];
    let nextChecked;
    if (currentChecked.includes(taskIndex)) {
      nextChecked = currentChecked.filter(idx => idx !== taskIndex);
    } else {
      nextChecked = [...currentChecked, taskIndex];
    }
    const updated = {
      ...selectedManageProduct,
      checklist: nextChecked
    };
    handleUpdateProduct(updated);
  };

  const handleGenerateOutline = async () => {
    if (!selectedManageProduct) return;
    setGeneratingOutline(true);
    try {
      const promptText = `Generate a comprehensive outline/syllabus for this digital product:
Name: ${selectedManageProduct.name}
Type: ${selectedManageProduct.type}
Target Audience: ${selectedManageProduct.audience}

Provide 4 detailed modules or sections, with 3 sub-items each, written in Arabic. Focus on practical deliverables.`;
      const systemText = 'You are a digital product creator. Return a clean markdown list outline.';
      
      const res = await callClaudeAPI(promptText, systemText, lang, GC);
      const updated = {
        ...selectedManageProduct,
        outline: res || ''
      };
      handleUpdateProduct(updated);
    } catch (e) {
      console.warn("API failed in outline generation:", e);
      const fallbackOutline = `### 📋 الهيكل المقترح للمنتج:\n\n**الموديول ١: الأساسيات والتهيئة**\n• تحديد الأهداف وجدولة النشر\n• اختيار القوالب المناسبة\n\n**الموديول ٢: بناء المحتوى البصري**\n• اختيار الألوان والخطوط المتناسقة\n• تصميم غلاف وبوستات احترافية`;
      const updated = {
        ...selectedManageProduct,
        outline: fallbackOutline
      };
      handleUpdateProduct(updated);
    } finally {
      setGeneratingOutline(false);
    }
  };

  // Calculations for Stats Card
  const totalMyProductsCount = myProducts.length;
  const totalRevenueAllTime = myProducts.reduce((sum, p) => sum + (p.revenue || 0), 0);
  const totalSalesCount = myProducts.reduce((sum, p) => sum + (p.sales || 0), 0);

  return (
    <div className="pg on" id="pg-digital">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">📦</span>
          {L('Digital Products Hub', 'مركز المنتجات الرقمية')}
        </div>
        <div className="pg-actions">
          <button 
            className="btn-ai" 
            onClick={() => alert('Ask AI: What digital products are trending right now in the Arab market?')}
          >
            ✦ {L('AI Ideas', 'أفكار الذكاء')}
          </button>
          <button 
            className="btn btn-prime" 
            onClick={() => setActiveSubTab('myproducts')}
          >
            + {L('My Products', 'منتجاتي')}
          </button>
        </div>
      </div>

      <div className="g4 stagger mb">
        <div className="stat-card">
          <div className="stat-lbl">📦 {L('My Products', 'منتجاتي')}</div>
          <div className="stat-val">{totalMyProductsCount}</div>
          <div className="stat-ch ch-nu">{L('created', 'تم إنشاؤها')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">💰 {L('Total Revenue', 'إجمالي الإيرادات')}</div>
          <div className="stat-val ch-up">${totalRevenueAllTime}</div>
          <div className="stat-ch ch-nu">{L('all time', 'طوال الوقت')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">🛒 {L('Sales', 'المبيعات')}</div>
          <div className="stat-val">{totalSalesCount}</div>
          <div className="stat-ch ch-nu">{L('total units', 'إجمالي الوحدات')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">🔥 {L('Trending Ops', 'الفرص الرائجة')}</div>
          <div className="stat-val ch-up">120+</div>
          <div className="stat-ch ch-nu">{L('ideas available', 'أفكار متاحة')}</div>
        </div>
      </div>

      <div className="tabs-bar" id="dp-tabs">
        <button 
          className={`tab-btn ${activeSubTab === 'trending' ? 'on' : ''}`}
          onClick={() => { setActiveSubTab('trending'); if (!hasLoadedTrends) loadDPTrends(); }}
        >
          🔥 {L('Trending Products', 'المنتجات الرائجة')}
        </button>
        <button 
          className={`tab-btn ${activeSubTab === 'builder' ? 'on' : ''}`}
          onClick={() => setActiveSubTab('builder')}
        >
          ⚡ {L('Build Plan', 'خطة البناء')}
        </button>
        <button 
          className={`tab-btn ${activeSubTab === 'myproducts' ? 'on' : ''}`}
          onClick={() => setActiveSubTab('myproducts')}
        >
          📦 {L('My Products', 'منتجاتي')}
        </button>
      </div>

      {/* ================= TAB 1: TRENDING ================= */}
      {activeSubTab === 'trending' && (
        <div className="tab-panel on" id="dp-trending">
          <div className="card mb" style={{ background: 'linear-gradient(135deg, var(--surface2), var(--surface3))', border: '1px solid var(--edge)', display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', marginBottom: '14px' }}>
            <div style={{ fontSize: '32px' }}>🕵️‍♂️</div>
            <div>
              <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--t1)', marginBottom: '4px' }}>
                {L('Tailored Smart Spy Engine Active', 'مستشعر التجسس الذكي المخصص نشط')}
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--t2)', margin: 0, lineHeight: 1.5 }}>
                {L(
                  `Scanning trends optimized for your niche: "${GC.profile?.niche || 'Fashion & Beauty'}" and target market: "${GC.profile?.offer?.market || 'Middle Class'}". Click on any card to automatically adapt it to your profile.`,
                  `يتم فحص التريندات وتوجيهها لتناسب مجالك الحالي: "${GC.profile?.niche || 'الموضة والجمال'}" وسوقك المستهدف. اضغط على أي كارت لتخصيصه فورياً ليناسب بياناتك.`
                )}
              </p>
            </div>
          </div>

          <div className="card mb" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Niche', 'المجال')}
                </label>
                <select className="inp" value={selectedNiche || 'all'} onChange={(e) => setSelectedNiche(e.target.value)} style={{ width: '160px' }}>
                  <option value="all">{L('All Niches', 'جميع المجالات')}</option>
                  <option value="coaching">{L('Coaching', 'كوتشينج')}</option>
                  <option value="marketing">{L('Marketing', 'تسويق')}</option>
                  <option value="finance">{L('Finance', 'مالية')}</option>
                  <option value="ai">{L('AI Tools', 'ذكاء اصطناعي')}</option>
                  <option value="fitness">{L('Fitness & Health', 'رياضة وصحة')}</option>
                  <option value="content">{L('Content Creation', 'صناعة محتوى')}</option>
                  <option value="business">{L('Business', 'أعمال بيزنس')}</option>
                  <option value="design">{L('Design & Arts', 'تصميم')}</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Platform', 'المنصة')}
                </label>
                <select className="inp" value={platform} onChange={(e) => setPlatform(e.target.value)} style={{ width: '160px' }}>
                  <option value="all">{L('All Platforms', 'جميع المنصات')}</option>
                  <option value="etsy">Etsy</option>
                  <option value="gumroad">Gumroad</option>
                  <option value="payhip">Payhip</option>
                  <option value="creative-market">Creative Market</option>
                  <option value="stan-store">Stan Store</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Type', 'النوع')}
                </label>
                <select className="inp" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ width: '170px' }}>
                  <option value="all">{L('All Types', 'جميع الأنواع')}</option>
                  <option value="notion">Notion Template</option>
                  <option value="canva">Canva Template</option>
                  <option value="prompt">AI Prompt Pack</option>
                  <option value="excel">Excel / Sheets</option>
                  <option value="pdf">PDF Guide / Ebook</option>
                  <option value="course">Mini Course</option>
                  <option value="swipe">Swipe File</option>
                  <option value="toolkit">Toolkit / Bundle</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Market', 'السوق')}
                </label>
                <select className="inp" value={market} onChange={(e) => setMarket(e.target.value)} style={{ width: '150px' }}>
                  <option value="arab">{L('Arab Market', 'السوق العربي')}</option>
                  <option value="global">{L('Global', 'عالمي')}</option>
                  <option value="english">{L('English Only', 'إنجليزي فقط')}</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                  {L('Search', 'بحث')}
                </label>
                <input 
                  className="inp" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  placeholder={L('e.g. coaching, business...', 'مثال: كوتشينج، بيزنس...')} 
                  style={{ width: '180px' }}
                />
              </div>
              <button className="btn btn-prime" onClick={loadDPTrends}>
                🔥 {L('Refresh Trends', 'تحديث الرائج')}
              </button>
            </div>
          </div>

          {loadingTrends && (
            <div id="dp-trends-loading" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '32px', animation: 'pulse 1s infinite' }}>🔥</div>
              <div style={{ fontFamily: 'var(--ff)', fontSize: '15px', fontWeight: 600, color: 'var(--t1)', marginTop: '10px' }}>
                {L('Scanning trending products...', 'جاري فحص المنتجات الرائجة...')}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--t2)', marginTop: '4px' }}>
                {L('Analyzing Etsy, Gumroad, Payhip, Creative Market', 'تحليل Etsy و Gumroad و Payhip و Creative Market')}
              </div>
            </div>
          )}

          {!loadingTrends && (
            <div id="dp-trends-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
              {getFilteredTrends().length === 0 ? (
                <div style={{ gridColumn: '1/-1' }}>
                  <div className="empty-state">
                    <div className="es-icon">🔥</div>
                    <div className="es-title">{L('Discover trending digital products', 'اكتشف المنتجات الرقمية الرائجة')}</div>
                    <div className="es-sub">
                      {L('AI scans Etsy, Gumroad, Payhip & Creative Market to find what\'s selling right now', 'يقوم الذكاء الاصطناعي بفحص المنصات لمعرفة المنتجات الأكثر مبيعاً الآن')}
                    </div>
                    <button className="btn btn-prime" onClick={loadDPTrends}>
                      🔥 {L('Load Trending Products', 'تحميل المنتجات الرائجة')}
                    </button>
                  </div>
                </div>
              ) : (
                getFilteredTrends().map((p, i) => {
                  const oColor = p.opportunity_score >= 8 ? 'var(--green)' : p.opportunity_score >= 6 ? 'var(--amber)' : 'var(--t2)';
                  return (
                    <div 
                      className="card" 
                      key={i} 
                      style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'all .2s' }}
                      onClick={() => handleOpenDPDetail(p)}
                    >
                      <div style={{ padding: '14px', borderBottom: '1px solid var(--edge)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                            {p.emoji || '📦'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)', lineHeight: 1.4, marginBottom: '3px' }}>
                              {(p.title || '').slice(0, 50)}{(p.title && p.title.length > 50 ? '...' : '')}
                            </div>
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                              <span className="badge" style={{ background: 'var(--orange-d)', color: 'var(--orange)' }}>
                                {p.type || 'Template'}
                              </span>
                              <span className="badge" style={{ background: 'var(--surface3)', color: 'var(--t2)' }}>
                                {p.platform || 'Gumroad'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                          <div style={{ background: 'var(--surface2)', borderRadius: '7px', padding: '6px 8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--t1)' }}>${p.price || 0}</div>
                            <div style={{ fontSize: '10px', color: 'var(--t3)' }}>{L('Price', 'السعر')}</div>
                          </div>
                          <div style={{ background: 'var(--surface2)', borderRadius: '7px', padding: '6px 8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--green)' }}>{p.monthly_sales || 0}</div>
                            <div style={{ fontSize: '10px', color: 'var(--t3)' }}>{L('Sales/mo', 'مبيعات/شهر')}</div>
                          </div>
                          <div style={{ background: 'var(--surface2)', borderRadius: '7px', padding: '6px 8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--amber)' }}>★{p.rating || 4.5}</div>
                            <div style={{ fontSize: '10px', color: 'var(--t3)' }}>{L('Rating', 'التقييم')}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ fontSize: '11px', color: 'var(--t2)' }}>{L('Opportunity:', 'الفرصة:')}</div>
                          <div style={{ display: 'flex', gap: '3px' }}>
                            {Array.from({ length: 10 }, (_, j) => (
                              <div 
                                key={j} 
                                style={{ width: '14px', height: '6px', borderRadius: '2px', background: j < (p.opportunity_score || 5) ? 'var(--orange)' : 'var(--surface3)' }}
                              ></div>
                            ))}
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: oColor }}>
                            {p.opportunity_score || 5}/10
                          </div>
                        </div>
                      </div>
                      <div style={{ padding: '8px 14px', background: 'var(--surface2)', borderTop: '1px solid var(--edge)', display: 'flex', gap: '6px' }}>
                        <button 
                          className="btn btn-ghost" 
                          style={{ flex: 1, justifyContent: 'center', fontSize: '11.5px', padding: '5px' }}
                          onClick={(e) => { e.stopPropagation(); handleOpenDPDetail(p); }}
                        >
                          {L('View Details', 'تفاصيل')}
                        </button>
                        <button 
                          className="btn btn-prime" 
                          style={{ flex: 1, justifyContent: 'center', fontSize: '11.5px', padding: '5px' }}
                          onClick={(e) => { e.stopPropagation(); handleQuickBuildFromTrend(p); }}
                        >
                          ⚡ {L('Build This', 'ابنِ هذا')}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}



      {/* ================= TAB 3: BUILD PLAN ================= */}
      {activeSubTab === 'builder' && (
        <div className="tab-panel on" id="dp-builder">
          <div className="g2">
            <div className="card">
              <div className="sec-hd">
                <div className="sec-title">⚡ {L('Product Execution Planner', 'مخطط تنفيذ المنتجات')}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Product Name / Idea *', 'اسم المنتج / الفكرة *')}
                  </label>
                  <input 
                    className="inp" 
                    value={builderName} 
                    onChange={(e) => setBuilderName(e.target.value)} 
                    placeholder="e.g. 30-Day Social Media Planner for Coaches"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                      {L('Product Type', 'نوع المنتج')}
                    </label>
                    <CustomSelect 
                      className="inp" 
                      value={builderType} 
                      onChange={(e) => setBuilderType(e.target.value)}
                    >
                      <option value="Notion Template">Notion Template</option>
                      <option value="Canva Template">Canva Template</option>
                      <option value="AI Prompt Pack">AI Prompt Pack</option>
                      <option value="PDF Guide / Ebook">PDF Guide / Ebook</option>
                      <option value="Excel / Sheets Template">Excel / Sheets Template</option>
                      <option value="Mini Course">Mini Course</option>
                      <option value="Swipe File">Swipe File</option>
                      <option value="Toolkit / Bundle">Toolkit / Bundle</option>
                    </CustomSelect>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                      {L('Target Audience', 'الجمهور المستهدف')}
                    </label>
                    <input 
                      className="inp" 
                      value={builderAudience} 
                      onChange={(e) => setBuilderAudience(e.target.value)} 
                      placeholder="e.g. Arab coaches, freelancers"
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                      {L('Niche', 'المجال')}
                    </label>
                    <CustomSelect className="inp" value={builderNiche} onChange={(e) => setBuilderNiche(e.target.value)}>
                      <option value="coaching">{L('Coaching', 'كوتشينج')}</option>
                      <option value="marketing">{L('Marketing', 'تسويق')}</option>
                      <option value="finance">{L('Finance', 'مالية')}</option>
                      <option value="ai">{L('AI Tools', 'ذكاء اصطناعي')}</option>
                      <option value="fitness">{L('Fitness & Health', 'رياضة وصحة')}</option>
                      <option value="content">{L('Content Creation', 'صناعة محتوى')}</option>
                      <option value="business">{L('Business', 'أعمال بيزنس')}</option>
                      <option value="design">{L('Design & Arts', 'تصميم')}</option>
                    </CustomSelect>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                      {L('Audience Size', 'حجم جمهورك الحالي')}
                    </label>
                    <CustomSelect className="inp" value={builderAudienceSize} onChange={(e) => setBuilderAudienceSize(e.target.value)}>
                      <option value="0 - Just starting">{L('0 - Just starting', '٠ - مبتدئ تماماً')}</option>
                      <option value="Under 5k followers">{L('Under 5k followers', 'أقل من ٥ آلاف متابع')}</option>
                      <option value="5k - 20k followers">{L('5k - 20k followers', 'من ٥ إلى ٢٠ ألف متابع')}</option>
                      <option value="20k - 100k followers">{L('20k - 100k followers', 'من ٢٠ إلى ١٠٠ ألف متابع')}</option>
                      <option value="100k+ followers">{L('100k+ followers', 'أكثر من ١٠٠ ألف متابع')}</option>
                    </CustomSelect>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                      {L('Price Point', 'نقطة السعر')}
                    </label>
                    <CustomSelect 
                      className="inp" 
                      value={builderPrice} 
                      onChange={(e) => setBuilderPrice(e.target.value)}
                    >
                      <option value="9">$9 — Impulse buy</option>
                      <option value="19">$19 — Entry level</option>
                      <option value="27">$27 — Sweet spot</option>
                      <option value="47">$47 — Mid-tier</option>
                      <option value="97">$97 — Premium</option>
                      <option value="197">$197 — High-ticket</option>
                    </CustomSelect>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                      {L('Your Time Available', 'الوقت المتاح لديك')}
                    </label>
                    <CustomSelect 
                      className="inp" 
                      value={builderTime} 
                      onChange={(e) => setBuilderTime(e.target.value)}
                    >
                      <option value="1-2 days sprint">1-2 days sprint</option>
                      <option value="1 week">1 week</option>
                      <option value="2 weeks">2 weeks</option>
                      <option value="1 month">1 month</option>
                    </CustomSelect>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                      {L('Deliverable Format', 'صيغة تسليم المنتج')}
                    </label>
                    <CustomSelect className="inp" value={builderFormat} onChange={(e) => setBuilderFormat(e.target.value)}>
                      <option value="Notion Workspace">{L('Notion Workspace', 'مساحة عمل Notion')}</option>
                      <option value="Canva templates link">{L('Canva templates link', 'رابط قالب Canva قابل للتعديل')}</option>
                      <option value="PDF / Google Doc">{L('PDF / Google Doc', 'ملف PDF / مستند جوجل')}</option>
                      <option value="Video course files">{L('Video course files', 'ملفات كورس فيديو')}</option>
                      <option value="ZIP file with assets">{L('ZIP file with assets', 'ملف ZIP مضغوط يحتوي على ملفات')}</option>
                    </CustomSelect>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                      {L('Primary Traffic Channel', 'قناة الترويج الأساسية')}
                    </label>
                    <CustomSelect className="inp" value={builderChannel} onChange={(e) => setBuilderChannel(e.target.value)}>
                      <option value="Instagram Reels">{L('Instagram Reels', 'فيديوهات إنستغرام ريلز')}</option>
                      <option value="TikTok">{L('TikTok', 'تيك توك')}</option>
                      <option value="YouTube">{L('YouTube', 'يوتيوب')}</option>
                      <option value="LinkedIn Articles">{L('LinkedIn Articles', 'منشورات لينكد إن')}</option>
                      <option value="Email Newsletter">{L('Email Newsletter', 'قائمة بريدية / نيوزليتر')}</option>
                      <option value="Paid Ads">{L('Paid Ads', 'إعلانات ممولة')}</option>
                    </CustomSelect>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('What problem does it solve?', 'ما هي المشكلة التي يحلها؟')}
                  </label>
                  <textarea 
                    className="inp" 
                    value={builderProblem} 
                    onChange={(e) => setBuilderProblem(e.target.value)} 
                    rows="2" 
                    placeholder="e.g. Coaches spend hours planning content manually..."
                  ></textarea>
                </div>
                <button 
                  className="btn btn-prime" 
                  onClick={handleBuildDPPlan} 
                  style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                >
                  ⚡ {L('Generate Execution Plan', 'إنشاء خطة التنفيذ')}
                </button>
              </div>
            </div>

            <div className="card">
              <div className="sec-hd">
                <div className="sec-title" id="dp-plan-title">
                  {currentPlanObject ? `⚡ ${L('Plan:', 'خطة:')} ${currentPlanObject.name.slice(0, 30)}` : L('Your Execution Plan', 'خطة التنفيذ')}
                </div>
                {currentPlanObject && (
                  <div id="dp-plan-add-btn">
                    <button 
                      className="btn btn-prime" 
                      style={{ fontSize: '12px', padding: '5px 12px' }} 
                      onClick={handleAddToMyProducts}
                    >
                      ➕ {L('Add to My Products', 'أضف لمنتجاتي')}
                    </button>
                  </div>
                )}
              </div>
              <div id="dp-builder-out">
                {generatingPlan && (
                  <div className="ai-box" style={{ animation: 'pulse 1.5s infinite', textAlign: 'center', padding: '24px' }}>
                    {L('⚡ Building your execution plan...', '⚡ جاري إنشاء خطة التنفيذ الخاصة بك...')}
                    <br />
                    <small style={{ color: 'var(--t2)' }}>
                      {L('Estimating revenue & creating timeline', 'تقدير الإيرادات وجدولة المهام اليومية')}
                    </small>
                  </div>
                )}

                {!generatingPlan && !builderPlanJson && (
                  <div className="empty-state" style={{ padding: '30px' }}>
                    <div className="es-icon">⚡</div>
                    <div className="es-title">{L('Your plan will appear here', 'ستظهر خطتك هنا')}</div>
                    <div className="es-sub">
                      {L('Fill in the product details and get a complete day-by-day execution plan with AI tools, pricing strategy, and platforms', 'املأ تفاصيل المنتج للحصول على جدول زمني متكامل، وقائمة أدوات الذكاء المقترحة واستراتيجيات التسعير')}
                    </div>
                  </div>
                )}

                {!generatingPlan && builderPlanJson && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* 1. Revenue Projections Gauge Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="stat-card" style={{ background: 'var(--surface3)', border: '1px solid var(--edge)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                        <div className="stat-lbl" style={{ color: 'var(--t2)', fontSize: '11px', fontWeight: 600 }}>💵 {L('Monthly Revenue Estimate', 'تقدير الإيرادات الشهرية')}</div>
                        <div className="stat-val" style={{ color: 'var(--green)', fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>
                          ${builderPlanJson.monthly_revenue_low} - ${builderPlanJson.monthly_revenue_high}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--t3)', marginTop: '2px' }}>
                          {L('Based on target market size', 'بناءً على حجم السوق المستهدف')}
                        </div>
                      </div>
                      
                      <div className="stat-card" style={{ background: 'var(--surface3)', border: '1px solid var(--edge)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                        <div className="stat-lbl" style={{ color: 'var(--t2)', fontSize: '11px', fontWeight: 600 }}>🎯 {L('Break-Even Copies', 'نسخ للوصول لنقطة التعادل')}</div>
                        <div className="stat-val" style={{ color: 'var(--orange)', fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>
                          {builderPlanJson.break_even_copies} {L('copies', 'نسخة')}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--t3)', marginTop: '2px' }}>
                          {L('To cover production & hosting', 'لتغطية رسوم الإنتاج والاستضافة')}
                        </div>
                      </div>
                    </div>

                    {/* 2. Timeline Roadmap */}
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)', marginBottom: '8px', borderBottom: '1px solid var(--edge)', paddingBottom: '4px' }}>
                        📅 {L('Implementation Roadmap', 'خريطة الطريق التنفيذية')}
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(builderPlanJson.timeline_steps || []).map((step, idx) => (
                          <div 
                            key={idx} 
                            style={{ 
                              background: 'var(--surface2)', 
                              border: '1px solid var(--edge2)', 
                              borderRadius: '10px', 
                              padding: '10px 14px', 
                              display: 'flex', 
                              gap: '12px', 
                              alignItems: 'flex-start' 
                            }}
                          >
                            <div style={{ background: 'var(--orange-d)', color: 'var(--orange)', borderRadius: '6px', padding: '3px 8px', fontSize: '11.5px', fontWeight: 'bold', flexShrink: 0 }}>
                              {step.day}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)', marginBottom: '2px' }}>{step.task}</div>
                              <div style={{ fontSize: '11.5px', color: 'var(--t2)', lineHeight: 1.4 }}>{step.detail}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3. AI Creator Tools */}
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)', marginBottom: '8px', borderBottom: '1px solid var(--edge)', paddingBottom: '4px' }}>
                        🤖 {L('AI Creator Toolkit', 'حقيبة أدوات الذكاء الاصطناعي')}
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {(builderPlanJson.ai_tools || []).map((tool, idx) => (
                          <div key={idx} style={{ background: 'var(--surface3)', border: '1px solid var(--edge2)', borderRadius: '8px', padding: '8px 12px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--t1)', marginBottom: '2px' }}>⚡ {tool.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--t2)', lineHeight: 1.3 }}>{tool.use}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 4. Sales Platforms */}
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)', marginBottom: '8px', borderBottom: '1px solid var(--edge)', paddingBottom: '4px' }}>
                        🛒 {L('Distribution & Sales Platforms', 'منصات البيع والتوزيع')}
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {(builderPlanJson.platforms || []).map((plat, idx) => (
                          <div key={idx} style={{ fontSize: '11.5px', color: 'var(--t2)', background: 'var(--surface2)', padding: '6px 12px', borderRadius: '8px' }}>
                            <strong style={{ color: 'var(--t1)' }}>{plat.name}</strong>: {plat.reason}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 5. Marketing Launch Hooks */}
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)', marginBottom: '8px', borderBottom: '1px solid var(--edge)', paddingBottom: '4px' }}>
                        📣 {L('Marketing Launch Hooks', 'زوايا النصوص التسويقية')}
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {(builderPlanJson.marketing_hooks || []).map((hk, idx) => (
                          <div 
                            key={idx} 
                            style={{ 
                              background: 'var(--surface3)', 
                              borderRight: '4px solid var(--orange)', 
                              padding: '10px 14px', 
                              borderRadius: '4px 10px 10px 4px', 
                              position: 'relative' 
                            }}
                          >
                            <div style={{ fontSize: '10px', color: 'var(--orange)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                              🎯 {hk.angle}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--t1)', fontStyle: 'italic', lineHeight: 1.4 }}>
                              "{hk.hook}"
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 6. Risks & Mitigation */}
                    <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '18px' }}>⚠️</span>
                        <h4 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--red)', margin: 0 }}>
                          {L('Launch Risk Warning', 'تنبيه مخاطر الإطلاق')}
                        </h4>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t1)', marginBottom: '4px' }}>
                        {builderPlanJson.risk}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--t2)', lineHeight: 1.4 }}>
                        <strong style={{ color: 'var(--green)' }}>✓ {L('Mitigation Strategy:', 'خطة التخفيف:')}</strong> {builderPlanJson.mitigation}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: MY PRODUCTS ================= */}
      {activeSubTab === 'myproducts' && (
        <div className="tab-panel on" id="dp-myproducts">
          <style>{`
            @media (max-width: 650px) {
              .responsive-prod-card {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 12px !important;
                padding: 14px !important;
              }
              .responsive-prod-card .prod-info-wrapper {
                width: 100% !important;
              }
              .responsive-prod-card .prod-stats-row {
                display: flex !important;
                width: 100% !important;
                justify-content: space-between !important;
                align-items: center !important;
                border-top: 1px solid var(--edge) !important;
                padding-top: 10px !important;
                margin-top: 4px !important;
              }
              .responsive-prod-card .prod-badge-delete {
                display: flex !important;
                width: 100% !important;
                justify-content: space-between !important;
                align-items: center !important;
                margin-left: 0 !important;
                margin-top: 4px !important;
                width: 100% !important;
              }
            }
          `}</style>
          <div className="sec-hd" style={{ marginBottom: '14px' }}>
            <div className="sec-title">📦 {L('My Digital Products', 'منتجاتي الرقمية')}</div>
            <button 
              className="btn btn-prime" 
              style={{ fontSize: '12px', padding: '6px 14px' }} 
              onClick={() => setActiveSubTab('builder')}
            >
              + {L('New Product', 'منتج جديد')}
            </button>
          </div>
          <div id="dp-my-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {myProducts.length === 0 ? (
              <div className="empty-state">
                <div className="es-icon">📦</div>
                <div className="es-title">{L('No products yet', 'لا توجد منتجات بعد')}</div>
                <div className="es-sub">
                  {L('Use the Build Plan tab to create your first digital product. It only takes minutes to set up.', 'استخدم تبويب "خطة البناء" لتجهيز أول منتج رقمي لك. يستغرق بضع دقائق فقط.')}
                </div>
                <button 
                  className="btn btn-prime" 
                  onClick={() => setActiveSubTab('builder')}
                >
                  ⚡ {L('Build My First Product', 'ابنِ منتجك الأول')}
                </button>
              </div>
            ) : (
              myProducts.map((p, i) => {
                const statusColor = p.status === 'active' ? 'var(--green)' : 'var(--amber)';
                const statusBg = p.status === 'active' ? 'var(--green-d)' : 'var(--amber-d)';
                return (
                  <div 
                    className="fin-entry responsive-prod-card" 
                    key={p.id} 
                    onClick={() => setSelectedManageProduct(p)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      cursor: 'pointer',
                      transition: 'background 0.2s, transform 0.2s',
                      borderRadius: '10px',
                      padding: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--surface3)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--surface2)';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    {/* Top Row / Header Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }} className="prod-info-wrapper">
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--orange-d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                        📦
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)', marginBottom: '2px', fontFamily: 'Tajawal, sans-serif' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--t2)', fontFamily: 'Tajawal, sans-serif' }}>
                          {p.type} · {p.audience}
                        </div>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="prod-stats-row" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ textAlign: 'center', minWidth: '70px' }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--ff)' }}>
                          ${p.revenue || 0}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--t3)', fontFamily: 'Tajawal, sans-serif' }}>{L('revenue', 'أرباح')}</div>
                      </div>
                      <div style={{ textAlign: 'center', minWidth: '50px' }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--t1)', fontFamily: 'var(--ff)' }}>
                          {p.sales || 0}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--t3)', fontFamily: 'Tajawal, sans-serif' }}>{L('sales', 'مبيعات')}</div>
                      </div>
                      <div style={{ textAlign: 'center', minWidth: '50px' }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--orange)', fontFamily: 'var(--ff)' }}>
                          ${p.price || 0}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--t3)', fontFamily: 'Tajawal, sans-serif' }}>{L('price', 'السعر')}</div>
                      </div>
                    </div>

                    {/* Badge & Delete */}
                    <div className="prod-badge-delete" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
                      <span className="badge" style={{ background: statusBg, color: statusColor, padding: '4px 8px', fontSize: '11px', fontFamily: 'Tajawal, sans-serif' }}>
                        {p.status || 'draft'}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteProduct(p.id); }} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: 'var(--t3)', padding: '4px' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ================= PRODUCT MANAGER MODAL ================= */}
      {selectedManageProduct && (
        <div className="modal-overlay active" style={{ zIndex: 1100 }}>
          <div className="modal-box" style={{ width: '80%', maxWidth: '850px', display: 'flex', flexDirection: 'column', height: '85vh', padding: '24px', boxSizing: 'border-box' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--edge)', paddingBottom: '12px', marginBottom: '14px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>📦</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--t1)' }}>
                    {L('Product Workspace Manager', 'مساحة إدارة وتطوير المنتج')}
                  </h3>
                  <small style={{ color: 'var(--t3)' }}>{selectedManageProduct.type}</small>
                </div>
              </div>
              <button 
                onClick={() => setSelectedManageProduct(null)}
                style={{ background: 'none', border: 'none', color: 'var(--t2)', fontSize: '20px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', paddingRight: '4px' }}>
              
              {/* Left Column: Form Editor & Sales Simulator */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* 1. Details Form */}
                <div className="card" style={{ background: 'var(--surface3)', padding: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--orange)', marginBottom: '10px' }}>
                    ⚙️ {L('Product Configurations', 'تعديل بيانات المنتج الأساسية')}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--t2)', display: 'block', marginBottom: '2px' }}>
                        {L('Product Name', 'اسم المنتج')}
                      </label>
                      <input 
                        className="inp" 
                        value={selectedManageProduct.name}
                        onChange={(e) => handleUpdateProduct({ ...selectedManageProduct, name: e.target.value })}
                      />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--t2)', display: 'block', marginBottom: '2px' }}>
                          {L('Price Point ($)', 'نقطة السعر ($)')}
                        </label>
                        <input 
                          type="number"
                          className="inp" 
                          value={selectedManageProduct.price}
                          onChange={(e) => handleUpdateProduct({ ...selectedManageProduct, price: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--t2)', display: 'block', marginBottom: '2px' }}>
                          {L('Status', 'حالة المنتج')}
                        </label>
                        <select 
                          className="inp" 
                          value={selectedManageProduct.status}
                          onChange={(e) => handleUpdateProduct({ ...selectedManageProduct, status: e.target.value })}
                        >
                          <option value="draft">{L('Draft', 'مسودة')}</option>
                          <option value="active">{L('Launched / Active', 'مطلق / نشط')}</option>
                          <option value="paused">{L('Paused', 'موقوف مؤقتاً')}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--t2)', display: 'block', marginBottom: '2px' }}>
                        {L('Target Audience', 'الجمهور المستهدف')}
                      </label>
                      <input 
                        className="inp" 
                        value={selectedManageProduct.audience || ''}
                        onChange={(e) => handleUpdateProduct({ ...selectedManageProduct, audience: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Mock Payout & Sales Simulator */}
                <div className="card" style={{ background: 'var(--surface3)', padding: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green)', marginBottom: '10px' }}>
                    📈 {L('Live Shop Sales Simulator', 'محاكي المبيعات الفورية للأرباح')}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '10px', textAlign: 'center', border: '1px solid var(--edge2)' }}>
                      <span style={{ fontSize: '10px', color: 'var(--t2)' }}>💵 {L('Revenue Generated', 'إجمالي أرباح المنتج')}</span>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--green)', marginTop: '4px' }}>
                        ${selectedManageProduct.revenue || 0}
                      </div>
                    </div>
                    <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '10px', textAlign: 'center', border: '1px solid var(--edge2)' }}>
                      <span style={{ fontSize: '10px', color: 'var(--t2)' }}>🛒 {L('Units Sold', 'الكمية المباعة')}</span>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--t1)', marginTop: '4px' }}>
                        {selectedManageProduct.sales || 0}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'var(--surface2)', borderRadius: '8px', padding: '10px', border: '1px dashed var(--edge)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--t2)', marginBottom: '6px', lineHeight: 1.3 }}>
                      {L('Test the sales tracking dashboard! Click below to simulate a real customer checkout sale at your active price point.', 'اختبر لوحة التتبع! اضغط أدناه لمحاكاة عملية شراء حقيقية وقيد أرباحها فورياً.')}
                    </div>
                    <button 
                      className="btn btn-prime"
                      style={{ width: '100%', padding: '6px', fontSize: '12px', justifyContent: 'center', background: 'var(--green)', border: 'none' }}
                      onClick={handleAddSale}
                    >
                      ➕ {L('Record 1 Test Sale (+$', 'تسجيل عملية بيع تجريبية (+$')}{selectedManageProduct.price})
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column: Setup Checklist & AI Outlining */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* 1. Setup Checklist */}
                <div className="card" style={{ background: 'var(--surface3)', padding: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--orange)', marginBottom: '10px' }}>
                    📅 {L('Launch Roadmap Checklist', 'خطوات تجهيز وإطلاق المنتج')}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      L('Outline modules & syllabus', 'تحديد محتوى وهيكل فصول المنتج'),
                      L('Build digital assets & files', 'تصميم الأصول والملفات الرقمية'),
                      L('Setup checkout page on Gumroad/Payhip', 'إعداد بوابة ورابط الدفع للمشترين'),
                      L('Write launch marketing hooks & scripts', 'كتابة النصوص الإعلانية والترويجية'),
                      L('Post & promote on primary traffic channels', 'النشر والترويج على حساباتك الاجتماعية')
                    ].map((stepText, idx) => {
                      const isChecked = (selectedManageProduct.checklist || []).includes(idx);
                      return (
                        <div 
                          key={idx} 
                          onClick={() => handleToggleTask(idx)}
                          style={{ 
                            display: 'flex', 
                            flexDirection: 'row',
                            alignItems: 'center', 
                            gap: '10px', 
                            cursor: 'pointer', 
                            padding: '8px 12px', 
                            background: isChecked ? 'rgba(249, 115, 22, 0.08)' : 'var(--surface2)', 
                            borderRadius: '8px',
                            border: isChecked ? '1px solid var(--orange)' : '1px solid var(--edge2)',
                            transition: 'all 0.2s',
                            width: '100%',
                            boxSizing: 'border-box'
                          }}
                        >
                          <span style={{ 
                            width: '18px', 
                            height: '18px', 
                            borderRadius: '4px', 
                            border: isChecked ? '2px solid var(--orange)' : '2px solid var(--t3)', 
                            background: isChecked ? 'var(--orange)' : 'none', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: '#fff', 
                            fontSize: '11px', 
                            fontWeight: 'bold',
                            flexShrink: 0
                          }}>
                            {isChecked && '✓'}
                          </span>
                          <span style={{ 
                            fontSize: '12px', 
                            color: isChecked ? 'var(--t1)' : 'var(--t2)', 
                            textDecoration: isChecked ? 'line-through' : 'none',
                            lineHeight: '1.4'
                          }}>
                            {stepText}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. AI Brainstorm Outlining */}
                <div className="card" style={{ background: 'var(--surface3)', padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }}>
                      🧠 {L('AI Content Outline Builder', 'مولد هيكل المنتج بالذكاء')}
                    </div>
                    <button 
                      className="btn-ai"
                      style={{ fontSize: '10.5px', padding: '3px 8px' }}
                      onClick={handleGenerateOutline}
                      disabled={generatingOutline}
                    >
                      {generatingOutline ? '...' : L('Generate Outline', 'توليد الهيكل')}
                    </button>
                  </div>

                  <div style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--edge2)', borderRadius: '6px', padding: '12px', fontSize: '12px', color: 'var(--t2)', overflowY: 'auto', minHeight: '260px' }}>
                    {generatingOutline ? (
                      <div style={{ animation: 'pulse 1s infinite', textAlign: 'center', padding: '20px' }}>
                        ⚡ {L('Creating syllabus outline...', 'جاري كتابة الفصول والهيكل...')}
                      </div>
                    ) : selectedManageProduct.outline ? (
                      <div 
                        style={{ lineHeight: '1.5' }}
                        dangerouslySetInnerHTML={{ __html: parseMarkdown(selectedManageProduct.outline) }}
                      />
                    ) : (
                      <div style={{ color: 'var(--t3)', textAlign: 'center', paddingTop: '30px' }}>
                        {L('Click "Generate Outline" to brainstorm the complete structure of this product with AI.', 'اضغط على "توليد الهيكل" لمساعدتك في بناء فصول المنتج بالذكاء الاصطناعي.')}
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom bar */}
            <div style={{ borderTop: '1px solid var(--edge)', paddingTop: '10px', marginTop: '12px', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
              <button 
                className="btn"
                style={{ 
                  padding: '8px 24px', 
                  fontSize: '13px', 
                  fontWeight: 600,
                  color: '#fff',
                  background: 'linear-gradient(135deg, var(--orange) 0%, #f43f5e 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                onClick={() => setSelectedManageProduct(null)}
              >
                {L('Done', 'تم الحفظ')}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
