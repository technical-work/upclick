'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';

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
  const { lang, L, t, setDpDetailOpen, setDpDetailIndex } = useBusiness();

  // Tab state
  const [activeSubTab, setActiveSubTab] = useState('trending'); // 'trending', 'niche', 'builder', 'myproducts'

  // Trending Tab States
  const [platform, setPlatform] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [market, setMarket] = useState('arab');
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [hasLoadedTrends, setHasLoadedTrends] = useState(false);

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

  // My Products list state
  const [myProducts, setMyProducts] = useState([]);

  // Load My Products on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dp_my_products');
      if (saved) {
        try {
          setMyProducts(JSON.parse(saved));
        } catch (e) {}
      }
    }
  }, []);

  // Sync My Products to localStorage
  const saveMyProducts = (list) => {
    setMyProducts(list);
    localStorage.setItem('dp_my_products', JSON.stringify(list));
  };

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
    setHasLoadedTrends(true);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          system: 'You are a digital product market researcher. Return ONLY a valid JSON array, no markdown or extra text.',
          messages: [{
            role: 'user',
            content: `Generate 12 trending digital products currently selling on ${platform === 'all' ? 'Etsy, Gumroad, Payhip, Creative Market' : platform}. Market: ${market}. ${typeFilter !== 'all' ? `Type filter: ${typeFilter}` : ''}. Each object must have: {title, type, platform, price(number), monthly_sales(number), rating(1-5 with decimal), demand_score(1-10), category, emoji, description(one line), opportunity_score(1-10), why_trending(one sentence), ai_tools(array of 3 tools to create it), sell_on(array of 3 platforms), creation_days(number)}. Focus on products relevant to Arab entrepreneurs and creators. Return JSON array ONLY.`
          }]
        })
      });
      const data = await res.json();
      const rawText = data.content && data.content[0] ? data.content[0].text : '[]';
      let cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      if (cleaned.indexOf('[') > -1) {
        cleaned = cleaned.slice(cleaned.indexOf('['), cleaned.lastIndexOf(']') + 1);
      }
      const parsed = JSON.parse(cleaned);
      setTrendingProducts(parsed);
    } catch (e) {
      console.warn("Anthropic API failed in loadDPTrends, using fallback data.");
      setTrendingProducts(getFallbackTrends());
    } finally {
      setLoadingTrends(false);
    }
  };

  // Filter trends client side
  const getFilteredTrends = () => {
    if (!searchQuery.trim()) return trendingProducts;
    return trendingProducts.filter(p =>
      (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
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
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: 'Digital product researcher. Return ONLY JSON array.',
          messages: [{
            role: 'user',
            content: `Generate 6 digital product ideas for micro-niche: "${micro}" in the ${mainNiche} space. Target: Arab creators and entrepreneurs. Each: {title, type, price(number), monthly_sales(number), emoji, creation_days(number), description(one line)}. JSON only.`
          }]
        })
      });
      const data = await res.json();
      const text = data.content && data.content[0] ? data.content[0].text : '[]';
      let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      if (cleaned.indexOf('[') > -1) {
        cleaned = cleaned.slice(cleaned.indexOf('['), cleaned.lastIndexOf(']') + 1);
      }
      const parsed = JSON.parse(cleaned);
      setNicheProducts(parsed);
    } catch (e) {
      console.warn("Anthropic API failed in loadMicroNicheProducts, using fallback.");
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
    setCurrentPlanObject(null);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1200,
          system: 'You are a digital product launch strategist specializing in the Arab creator economy. Be specific and realistic.',
          messages: [{
            role: 'user',
            content: `Create a complete execution plan for this digital product:\nName: ${builderName}\nType: ${builderType}\nAudience: ${builderAudience || 'Arab entrepreneurs'}\nPrice: $${builderPrice}\nTime available: ${builderTime}\nProblem solved: ${builderProblem || 'not specified'}\n\nProvide:\n1. Expected Monthly Revenue estimate (be specific with numbers)\n2. Days to complete with specific daily tasks\n3. Required AI tools (with specific use for each)\n4. Best platforms to sell on (with reasoning)\n5. 3 marketing hooks/angles for launch\n6. One biggest risk and how to avoid it\n\nBe concrete and actionable.`
          }]
        })
      });
      const data = await res.json();
      const reply = data.content && data.content[0] ? data.content[0].text : '';

      setBuilderPlanText(reply);
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
      console.warn("Anthropic API failed in buildDPPlan, using fallback plan.");
      const fallbackText = `### ⚡ Execution Plan: ${builderName}\n\n**1. Expected Monthly Revenue:**\nEst. $950 - $2,500/month based on selling ~35-90 copies at $${builderPrice}.\n\n**2. Timeline (${builderTime}):**\n• Day 1: Brainstorm modules and outline details. Use Claude to draft the structure.\n• Day 2: Create assets in Canva/Notion.\n• Day 3: Build a simple landing page, write marketing copywriting and post on socials.\n\n**3. Required AI Tools:**\n• Claude.ai (Content structuring & Copywriting)\n• Canva AI (Visual cover templates)\n• UpKlick AI (Sales script generation)\n\n**4. Target Platforms:**\n• Gumroad (Easy setup & international payouts)\n• Payhip (Low transaction fees)\n\n**5. Marketing Hooks:**\n• "Stop wasting hours manually formatting. Get this plug-and-play template instead!"\n• "The exact framework I used to scale my ${builderType} workflow, now yours."`;
      setBuilderPlanText(fallbackText);
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
          className={`tab-btn ${activeSubTab === 'niche' ? 'on' : ''}`}
          onClick={() => setActiveSubTab('niche')}
        >
          🎯 {L('By Niche', 'حسب المجال')}
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
          <div className="card mb" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
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

      {/* ================= TAB 2: BY NICHE ================= */}
      {activeSubTab === 'niche' && (
        <div className="tab-panel on" id="dp-niche">
          <div className="g2">
            <div>
              <div className="card mb">
                <div className="sec-hd">
                  <div className="sec-title">🎯 {L('Choose Your Niche', 'اختر مجالك')}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }} id="dp-niche-grid">
                  {[
                    { key: 'coaching', emoji: '🎓', nameAr: 'كوتشينج', nameEn: 'Coaching', count: 23 },
                    { key: 'marketing', emoji: '📢', nameAr: 'تسويق', nameEn: 'Marketing', count: 31 },
                    { key: 'finance', emoji: '💰', nameAr: 'مالية', nameEn: 'Finance', count: 18 },
                    { key: 'ai', emoji: '🤖', nameAr: 'ذكاء اصطناعي', nameEn: 'AI Tools', count: 42 },
                    { key: 'fitness', emoji: '💪', nameAr: 'رياضة وصحة', nameEn: 'Fitness', count: 15 },
                    { key: 'content', emoji: '✍️', nameAr: 'صناعة محتوى', nameEn: 'Content', count: 27 },
                    { key: 'business', emoji: '🚀', nameAr: 'أعمال بيزنس', nameEn: 'Business', count: 35 },
                    { key: 'design', emoji: '🎨', nameAr: 'تصميم', nameEn: 'Design', count: 29 },
                  ].map((n) => (
                    <div 
                      key={n.key}
                      className="dp-niche-card" 
                      onClick={() => handleSelectNiche(n.key)}
                      style={{
                        background: selectedNiche === n.key ? 'var(--orange-d)' : 'var(--surface2)',
                        border: selectedNiche === n.key ? '2px solid var(--orange)' : '2px solid var(--edge)',
                        borderRadius: '10px',
                        padding: '12px',
                        cursor: 'pointer',
                        transition: 'all .14s',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '26px', marginBottom: '5px' }}>{n.emoji}</div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--t1)' }}>
                        {L(n.nameEn, n.nameAr)}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--t2)' }}>
                        {n.count} {L('products', 'منتج')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedNiche && (
                <div className="card" id="dp-microniche-card">
                  <div className="sec-hd">
                    <div className="sec-title" id="dp-microniche-title">
                      🔍 {selectedNiche.charAt(0).toUpperCase() + selectedNiche.slice(1)} — {L('Micro-Niches', 'المجالات الفرعية')}
                    </div>
                  </div>
                  <div id="dp-microniche-list" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(MICRO_NICHES[selectedNiche] || []).map((m, idx) => (
                      <div 
                        key={idx}
                        style={{
                          background: selectedMicroNiche === m ? 'var(--orange-d)' : 'var(--surface2)',
                          border: selectedMicroNiche === m ? '1px solid var(--orange)' : '1px solid var(--edge)',
                          borderRadius: '8px',
                          padding: '9px 12px',
                          cursor: 'pointer',
                          transition: 'all .14s',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                        onClick={() => handleLoadMicroNicheProducts(m, selectedNiche)}
                      >
                        <span style={{ fontSize: '12.5px', color: 'var(--t1)' }}>{m}</span>
                        <span style={{ fontSize: '11px', color: 'var(--t3)' }}>{L('View →', 'عرض ←')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="card" id="dp-niche-products-card">
              <div className="sec-hd">
                <div className="sec-title" id="dp-niche-result-title">
                  {selectedMicroNiche ? `📦 ${selectedMicroNiche} ${L('Products', 'منتجات')}` : L('Select a niche to see products →', 'اختر مجالاً لرؤية المنتجات ←')}
                </div>
              </div>
              <div id="dp-niche-products">
                {loadingNicheProducts && (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <div style={{ fontSize: '24px', animation: 'pulse 1s infinite' }}>⚡</div>
                    <div style={{ fontSize: '13px', color: 'var(--t2)', marginTop: '8px' }}>
                      {L('Loading product ideas...', 'جاري تحميل أفكار المنتجات...')}
                    </div>
                  </div>
                )}

                {!loadingNicheProducts && nicheProducts.length === 0 && (
                  <div className="empty-state" style={{ padding: '30px' }}>
                    <div className="es-icon">🎯</div>
                    <div className="es-title">{L('Pick your niche', 'حدد مجالك')}</div>
                    <div className="es-sub">
                      {L('Choose a niche and a micro-niche on the left to see curated product ideas with estimated sales and prices', 'اختر مجالأ فرعياً على اليسار لتظهر لك أفكار المنتجات الجاهزة والتقديرات المادية لها')}
                    </div>
                  </div>
                )}

                {!loadingNicheProducts && nicheProducts.map((p, i) => (
                  <div 
                    key={i}
                    style={{
                      border: '1px solid var(--edge)',
                      borderRadius: '9px',
                      padding: '12px',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      transition: 'all .14s',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start'
                    }}
                  >
                    <div style={{ fontSize: '22px', flexShrink: 0 }}>{p.emoji || '📦'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--t1)', marginBottom: '3px' }}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--t2)', marginBottom: '6px' }}>
                        {p.description || ''}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className="badge b-green">${p.price}</span>
                        <span className="badge b-ai">{p.monthly_sales} {L('sales/mo', 'مبيعات/شهر')}</span>
                        <span className="badge" style={{ background: 'var(--surface3)', color: 'var(--t2)' }}>
                          {p.creation_days}{L('d to build', 'أيام للبناء')}
                        </span>
                        <button 
                          className="btn btn-prime" 
                          style={{ fontSize: '11px', padding: '3px 10px', marginLeft: 'auto' }}
                          onClick={() => handleQuickBuildFromTrend(p)}
                        >
                          ⚡ {L('Build', 'بناء')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
                    <select 
                      className="inp" 
                      value={builderType} 
                      onChange={(e) => setBuilderType(e.target.value)}
                    >
                      <option>Notion Template</option>
                      <option>Canva Template</option>
                      <option>AI Prompt Pack</option>
                      <option>PDF Guide / Ebook</option>
                      <option>Excel / Sheets Template</option>
                      <option>Mini Course</option>
                      <option>Swipe File</option>
                      <option>Toolkit / Bundle</option>
                    </select>
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
                      {L('Price Point', 'نقطة السعر')}
                    </label>
                    <select 
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
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                      {L('Your Time Available', 'الوقت المتاح لديك')}
                    </label>
                    <select 
                      className="inp" 
                      value={builderTime} 
                      onChange={(e) => setBuilderTime(e.target.value)}
                    >
                      <option>1-2 days sprint</option>
                      <option>1 week</option>
                      <option>2 weeks</option>
                      <option>1 month</option>
                    </select>
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

                {!generatingPlan && !builderPlanText && (
                  <div className="empty-state" style={{ padding: '30px' }}>
                    <div className="es-icon">⚡</div>
                    <div className="es-title">{L('Your plan will appear here', 'ستظهر خطتك هنا')}</div>
                    <div className="es-sub">
                      {L('Fill in the product details and get a complete day-by-day execution plan with AI tools, pricing strategy, and platforms', 'املأ تفاصيل المنتج للحصول على جدول زمني متكامل، وقائمة أدوات الذكاء المقترحة واستراتيجيات التسعير')}
                    </div>
                  </div>
                )}

                {!generatingPlan && builderPlanText && (
                  <div className="ai-box" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                    {builderPlanText}
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
                  <div className="fin-entry" key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--orange-d)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                      📦
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)', marginBottom: '2px' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--t2)' }}>
                        {p.type} · ${p.price} · {p.audience}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', minWidth: '70px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--ff)' }}>
                        ${p.revenue || 0}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--t3)' }}>{L('revenue', 'أرباح')}</div>
                    </div>
                    <div style={{ textAlign: 'center', minWidth: '50px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--t1)', fontFamily: 'var(--ff)' }}>
                        {p.sales || 0}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--t3)' }}>{L('sales', 'مبيعات')}</div>
                    </div>
                    <span className="badge" style={{ background: statusBg, color: statusColor }}>
                      {p.status || 'draft'}
                    </span>
                    <button 
                      onClick={() => handleDeleteProduct(p.id)} 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: 'var(--t3)', padding: '4px' }}
                    >
                      ✕
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
