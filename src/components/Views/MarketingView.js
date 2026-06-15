'use client';

import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';

export default function MarketingView() {
  const { lang, L, t, GC, formatMoney } = useBusiness();
  const [activeTab, setActiveTab] = useState('research');

  const [competitorsCount, setCompetitorsCount] = useState(0);
  const [audienceCount, setAudienceCount] = useState(0);
  const [trendsCount, setTrendsCount] = useState(0);
  const [personasCount, setPersonasCount] = useState(0);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setCompetitorsCount(parseInt(localStorage.getItem('mkt_competitors_count') || '0'));
      setAudienceCount(parseInt(localStorage.getItem('mkt_audience_count') || '0'));
      setTrendsCount(parseInt(localStorage.getItem('mkt_trends_count') || '0'));
      setPersonasCount(parseInt(localStorage.getItem('mkt_personas_count') || '0'));
    }
  }, []);

  // Sub-tabs states
  const [resTab, setResTab] = useState('comp');
  const [stratTab, setStratTab] = useState('plan');
  const [offTab, setOffTab] = useState('builder');
  const [adsTab, setAdsTab] = useState('meta');
  const [contTab, setContTab] = useState('plan');
  const [funTab, setFunTab] = useState('builder');
  const [analTab, setAnalTab] = useState('kpi');

  // Loading & Output states
  const [loading, setLoading] = useState({});
  const [outputs, setOutputs] = useState({});

  // Input states
  const [inputs, setInputs] = useState({
    // Research
    compNiche: '', compCountry: 'Saudi Arabia', compType: 'Online Course',
    compAdsName: '', compAdsPlatform: 'Meta (Facebook/Instagram)',
    audDesc: '', audProblem: '',
    personaProduct: '', personaAge: '', personaGender: 'Both', personaMarket: '',
    trendNiche: '', trendRegion: 'Arab Market', trendType: 'Market Trends',

    // Strategy
    stratBizType: 'Coaching / Training', stratBudget: '$0 – Organic only', stratGoal: 'Get first 10 clients', stratTimeline: '30 days',
    launchWhat: '', launchDate: '', launchAud: '', launchTarget: '',
    rmCurrent: '', rmGoal: '', rmPeriod: '30 Days', rmChannel: 'Instagram',
    swotS: '', swotW: '', swotO: '', swotT: '',

    // Offers
    offerCore: '', offerPain: '', offerTransform: '', offerPrice: '',
    priceCurrent: '', priceType: '1-on-1 Coaching', priceExp: 'Beginner (0-1 year)', priceIncome: '',
    upsellCore: '', upsellPrice: '', upsellAfter: '',

    // Ads
    metaObj: 'Lead Generation', metaBudget: '', metaAud: '', metaOffer: '',
    googleType: 'Search Ads', googleKw: '', googleGeo: '',
    tiktokObj: 'Conversions', tiktokAge: '18–44 (broad)', tiktokBudget: '',
    copyPlatform: 'Facebook/Instagram', copyOffer: '', copyPain: '', copyStyle: 'Problem-Agitate-Solve', copyLang: 'Arabic',
    creativeType: 'Video Script (30s)', creativeHook: 'Problem-based ("If you\'re struggling with...")', creativeMsg: '',
    budgetTotal: '', budgetObj: 'Lead generation', budgetPlatforms: 'Meta only', budgetAov: '',

    // Content
    planPlatform: 'Instagram', planGoal: 'Build authority', planFreq: '3 posts/week', planMix: '80% value, 20% promo',
    hookTopic: '', hookPlatform: 'Instagram Reels', hookCount: '5 hooks', hookLang: 'Arabic',
    ideasNiche: '', ideasMix: ['Educational'],
    compContName: '', compContPlatform: 'Instagram',

    // Funnels
    funProduct: '', funTraffic: 'Instagram organic', funModel: 'Lead gen → Call → Close', funPrice: '',
    magnetProduct: '', magnetPain: '', magnetFormat: 'Free PDF / Guide',
    lpPlanProduct: '', lpPlanAware: 'Cold (never heard of you)', lpPlanGoal: 'Collect leads',
    convFunnel: '', convDropoff: '', convRate: '',

    // Analytics
    kpiModel: 'Coaching / Services', kpiTarget: '', kpiStage: 'Just starting',
    revAov: '', revLeads: '', revClose: '', revGrowth: 'Organic only',
    leadAud: '', leadMethod: 'Organic content + DM', leadGoal: '',
    roiSpend: '', roiLeads: '', roiClosed: '', roiRev: '',

    // AI Consultant
    aiInp: ''
  });

  const handleInputChange = (key, value) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const triggerAI = async (toolKey, outputId, promptText, systemText) => {
    setLoading(prev => ({ ...prev, [outputId]: true }));
    try {
      const response = await callClaudeAPI(promptText, systemText, lang, GC);
      setOutputs(prev => ({ ...prev, [outputId]: response }));
    } catch (err) {
      setOutputs(prev => ({ ...prev, [outputId]: L('Error generating report. Please try again.', 'حدث خطأ أثناء التوليد. يرجى المحاولة مرة أخرى.') }));
    }
    setLoading(prev => ({ ...prev, [outputId]: false }));
  };

  // ── 1. RESEARCH SUB-ACTIONS ──
  const runCompetitorFinder = () => {
    const prompt = `Find and analyze competitors for: Niche: "${inputs.compNiche}", Country: "${inputs.compCountry}", Product Type: "${inputs.compType}". Identify 3-4 competitor brands or types of businesses, pricing, positioning and gaps we can exploit.`;
    const system = `You are an expert market analyst. Provide direct actionable findings.`;
    triggerAI('competitor-finder', 'comp-out', prompt, system);
    setCompetitorsCount(prev => {
      const next = prev + 1;
      localStorage.setItem('mkt_competitors_count', String(next));
      return next;
    });
  };

  const runCompetitorAds = () => {
    const prompt = `Research competitor ads for "${inputs.compAdsName}" on platform "${inputs.compAdsPlatform}". Outline winning hooks, ad copy angles, creative formats, and conversion strategies.`;
    const system = `You are a PPC & Ad Intelligence specialist.`;
    triggerAI('competitor-ads', 'comp-ads-out', prompt, system);
  };

  const runAudienceResearch = () => {
    const prompt = `Research target audience: Customer description: "${inputs.audDesc}", Core problem solved: "${inputs.audProblem}". Outline demographic details, psychological traits, 5 biggest pain points, desires, buying triggers, and objections.`;
    const system = `You are a customer psychologist.`;
    triggerAI('audience-research', 'aud-out', prompt, system);
    setAudienceCount(prev => {
      const next = prev + 1;
      localStorage.setItem('mkt_audience_count', String(next));
      return next;
    });
  };

  const runBuyerPersona = () => {
    const prompt = `Build detailed Buyer Personas for: Product "${inputs.personaProduct}", Target market: "${inputs.personaMarket}", Age range: "${inputs.personaAge}", Gender: "${inputs.personaGender}". Provide profile name, background, goals, struggles, and buying triggers.`;
    const system = `You are a master brand strategist.`;
    triggerAI('buyer-persona', 'persona-out', prompt, system);
    setPersonasCount(prev => {
      const next = prev + 1;
      localStorage.setItem('mkt_personas_count', String(next));
      return next;
    });
  };

  const runTrendDiscovery = () => {
    const prompt = `Discover current trends in niche: "${inputs.trendNiche}", Region: "${inputs.trendRegion}", Trend Type: "${inputs.trendType}". Highlight 3 rising trends, viral content formats, and immediate marketing opportunities.`;
    const system = `You are a viral trend analyst.`;
    triggerAI('trends', 'trends-out', prompt, system);
    setTrendsCount(prev => {
      const next = prev + 1;
      localStorage.setItem('mkt_trends_count', String(next));
      return next;
    });
  };

  // ── 2. STRATEGY SUB-ACTIONS ──
  const runStrategyBuilder = () => {
    const prompt = `Build a complete marketing strategy: Business type "${inputs.stratBizType}", Budget "${inputs.stratBudget}", Goal "${inputs.stratGoal}", Timeline "${inputs.stratTimeline}". Suggest the best marketing channels, budget allocation, and month-by-month roadmap.`;
    const system = `You are a Chief Marketing Officer.`;
    triggerAI('strategy', 'strat-plan-out', prompt, system);
  };

  const runLaunchPlanner = () => {
    const prompt = `Build a launch plan for: "${inputs.launchWhat}", Date: "${inputs.launchDate}", Audience Size: "${inputs.launchAud}", Target: "${inputs.launchTarget}". Give a 4-week pre-launch, launch week, and post-launch roadmap with daily actions.`;
    const system = `You are a launch launch specialist.`;
    triggerAI('launch-planner', 'launch-out', prompt, system);
  };

  const runGrowthRoadmap = () => {
    const prompt = `Create a growth roadmap: Current Rev "${inputs.rmCurrent}", Goal "${inputs.rmGoal}", Timeline "${inputs.rmPeriod}", Primary Channel "${inputs.rmChannel}". Provide a week-by-week implementation plan.`;
    const system = `You are a business scaling consultant.`;
    triggerAI('growth-roadmap', 'rm-out', prompt, system);
  };

  const runSWOT = () => {
    const prompt = `Analyze this SWOT matrix: Strengths: "${inputs.swotS}", Weaknesses: "${inputs.swotW}", Opportunities: "${inputs.swotO}", Threats: "${inputs.swotT}". Provide strategic takeaways on how to maximize strengths, fix weaknesses, capture opportunities, and mitigate threats.`;
    const system = `You are a strategic SWOT consultant.`;
    triggerAI('swot', 'swot-out', prompt, system);
  };

  // ── 3. OFFERS SUB-ACTIONS ──
  const runOfferBuilder = () => {
    const prompt = `Build an irresistible offer: Core "${inputs.offerCore}", Pain: "${inputs.offerPain}", Transformation: "${inputs.offerTransform}", Price: "${inputs.offerPrice}". Give us a packaging name, list of 3 high-value bonuses, 1 bold risk-reversal guarantee, and urgency scripts.`;
    const system = `You are a high-ticket offer architect.`;
    triggerAI('offer-builder', 'offer-out', prompt, system);
  };

  const runPricingOptimizer = () => {
    const prompt = `Optimize pricing: Current Price "${inputs.priceCurrent}", Product type "${inputs.priceType}", Experience level "${inputs.priceExp}", Target Monthly Income: "${inputs.priceIncome}". Give tiered pricing options (low, medium, high), pricing psychology hacks, and sales volume calculator.`;
    const system = `You are a pricing psychologist.`;
    triggerAI('pricing', 'pricing-out', prompt, system);
  };

  const runUpsellBuilder = () => {
    const prompt = `Build upsell ladder: Core offer "${inputs.upsellCore}", Price "${inputs.upsellPrice}", Client needs after buy: "${inputs.upsellAfter}". Suggest 1 order bump, 1 immediate post-purchase upsell, and 1 high-ticket backend offer.`;
    const system = `You are a funnel monetization expert.`;
    triggerAI('upsell', 'upsell-out', prompt, system);
  };

  // ── 4. ADS SUB-ACTIONS ──
  const runMetaAds = () => {
    const prompt = `Plan a Meta Ads campaign: Objective "${inputs.metaObj}", Budget "${inputs.metaBudget}", Audience description: "${inputs.metaAud}", Promoted Offer: "${inputs.metaOffer}". Layout the campaign structure, 3 target ad sets with interests/lookalikes, and ad budget allocation.`;
    const system = `You are a Meta Ads buyer.`;
    triggerAI('meta-ads', 'meta-out', prompt, system);
  };

  const runGoogleAds = () => {
    const prompt = `Plan a Google Ads campaign: Type "${inputs.googleType}", Keywords: "${inputs.googleKw}", Location/Language: "${inputs.googleGeo}". Suggest ad groups, 10 primary search keywords, bidding strategy, and draft responsive search ads.`;
    const system = `You are a Google Search specialist.`;
    triggerAI('google-ads', 'google-out', prompt, system);
  };

  const runTikTokAds = () => {
    const prompt = `Plan a TikTok Ads campaign: Goal "${inputs.tiktokObj}", Target Age "${inputs.tiktokAge}", Daily Budget "${inputs.tiktokBudget}". Design 3 video ad hooks, UGC content creators instructions, and targeting parameters.`;
    const system = `You are a TikTok Ads media buyer.`;
    triggerAI('tiktok-ads', 'tiktok-out', prompt, system);
  };

  const runAdCopyGen = () => {
    const prompt = `Generate 5 ad copy variations for: Platform "${inputs.copyPlatform}", Offer "${inputs.copyOffer}", Pain Point "${inputs.copyPain}", Copy style "${inputs.copyStyle}", Language: "${inputs.copyLang}". Include hooks, primary text, and call-to-actions.`;
    const system = `You are a direct response copywriter.`;
    triggerAI('ad-copy', 'copy-out', prompt, system);
  };

  const runCreativeBrief = () => {
    const prompt = `Generate a Creative Brief: Type "${inputs.creativeType}", Hook Style "${inputs.creativeHook}", Key Message "${inputs.creativeMsg}". Provide visual directions, hook script, outline, sound recommendations, and guidelines.`;
    const system = `You are an ad creative director.`;
    triggerAI('creative-brief', 'creative-out', prompt, system);
  };

  const runBudgetPlanner = () => {
    const prompt = `Plan ad budget: Total monthly budget "${inputs.budgetTotal}", Objective "${inputs.budgetObj}", Platforms "${inputs.budgetPlatforms}", Average Order Value "${inputs.budgetAov}". Map out the spend distribution, expected acquisition costs (CAC), and metrics checklist.`;
    const system = `You are a performance marketer.`;
    triggerAI('budget-planner', 'budget-out', prompt, system);
  };

  // ── 5. CONTENT SUB-ACTIONS ──
  const runContentPlanner = () => {
    const prompt = `Build content plan: Platform "${inputs.planPlatform}", Goal "${inputs.planGoal}", Frequency "${inputs.planFreq}", Content Mix "${inputs.planMix}". Output a 30-day posting calendar with topics, formats, hooks, and CTAs.`;
    const system = `You are a content strategist.`;
    triggerAI('content-planner', 'plan-out', prompt, system);
  };

  const runHookGen = () => {
    const prompt = `Generate ${inputs.hookCount} viral hooks for topic: "${inputs.hookTopic}" on platform "${inputs.hookPlatform}". Language: "${inputs.hookLang}". Categorize by hook types (curiosity, result-driven, pain-point, controversy).`;
    const system = `You are a viral hook specialist.`;
    triggerAI('hooks', 'hooks-out', prompt, system);
  };

  const runIdeasGen = () => {
    const prompt = `Generate 30 content ideas for niche: "${inputs.ideasNiche}" using mix: "${inputs.ideasMix.join(', ')}". Outline title, video hook, body details, and CTA for each.`;
    const system = `You are a creative content producer.`;
    triggerAI('ideas', 'ideas-out', prompt, system);
  };

  const runCompetitorContent = () => {
    const prompt = `Analyze competitor content: Account name "${inputs.compContName}" on platform "${inputs.compContPlatform}". Outline their top performing posts format, key hooks, what gaps they leave, and how we can outperform them.`;
    const system = `You are a competitor analyst.`;
    triggerAI('competitor-content', 'comp-content-out', prompt, system);
  };

  // ── 6. FUNNELS SUB-ACTIONS ──
  const runFunnelBuilder = () => {
    const prompt = `Build sales funnel for product: "${inputs.funProduct}", Traffic: "${inputs.funTraffic}", Funnel model: "${inputs.funModel}", Price: "${inputs.funPrice}". Describe each step from discovery to conversion, copy assets needed, and email triggers.`;
    const system = `You are a funnel architect.`;
    triggerAI('funnel-builder', 'funnel-out', prompt, system);
  };

  const runLeadMagnet = () => {
    const prompt = `Build lead magnet: Main product "${inputs.magnetProduct}", Pain point: "${inputs.magnetPain}", Format: "${inputs.magnetFormat}". Give us 3 title ideas, full structural outline, landing page copy, and 3 follow-up email templates.`;
    const system = `You are an inbound lead specialist.`;
    triggerAI('lead-magnet', 'magnet-out', prompt, system);
  };

  const runLandingPagePlan = () => {
    const prompt = `Plan landing page: Offer "${inputs.lpPlanProduct}", Awareness level "${inputs.lpPlanAware}", Goal "${inputs.lpPlanGoal}". Output the blueprint layout, copy direction for hero section, benefit sections, social proof, and final checkout.`;
    const system = `You are a conversion rate optimizer.`;
    triggerAI('lp-plan', 'lp-plan-out', prompt, system);
  };

  const runConversionOptimizer = () => {
    const prompt = `Optimize conversions: Funnel description: "${inputs.convFunnel}", Dropoff point: "${inputs.convDropoff}", Current CVR: "${inputs.convRate}". Diagnose the issues and outline 5 specific optimization tests.`;
    const system = `You are a conversion optimization consultant.`;
    triggerAI('conversion', 'conv-out', prompt, system);
  };

  // ── 7. ANALYTICS SUB-ACTIONS ──
  const runKPIPlanner = () => {
    const prompt = `Build KPI planner: Business model "${inputs.kpiModel}", Target monthly rev "${inputs.kpiTarget}", Current stage "${inputs.kpiStage}". Define the exact metrics to track, benchmark ranges, and formulas.`;
    const system = `You are a metrics dashboard analyst.`;
    triggerAI('kpi', 'kpi-out', prompt, system);
  };

  const runRevenueForecast = () => {
    const prompt = `Forecast revenue: Average Sale Value "${inputs.revAov}", Monthly leads "${inputs.revLeads}", Current Close Rate "${inputs.revClose}", Growth Plan "${inputs.revGrowth}". Project revenue for 30, 60, 90 days under conservative, realistic, and aggressive targets.`;
    const system = `You are a financial analyst.`;
    triggerAI('rev-forecast', 'rev-forecast-out', prompt, system);
  };

  const runLeadForecast = () => {
    const prompt = `Forecast leads: Audience size "${inputs.leadAud}", Method "${inputs.leadMethod}", Goal "${inputs.leadGoal}". Suggest the daily audience reach and conversion metrics needed to hit the lead target.`;
    const system = `You are a lead generation strategist.`;
    triggerAI('lead-forecast', 'lead-forecast-out', prompt, system);
  };

  const runROICalculator = () => {
    const spend = parseFloat(inputs.roiSpend) || 0;
    const leads = parseFloat(inputs.roiLeads) || 0;
    const closed = parseFloat(inputs.roiClosed) || 0;
    const revVal = parseFloat(inputs.roiRev) || 0;

    const totalRev = closed * revVal;
    const netProfit = totalRev - spend;
    const cpl = leads > 0 ? spend / leads : 0;
    const cac = closed > 0 ? spend / closed : 0;
    const roas = spend > 0 ? totalRev / spend : 0;
    const roi = spend > 0 ? (netProfit / spend) * 100 : 0;

    const formattedOutput = `
      <h3>${L('ROI Results', 'نتائج عائد الاستثمار')}</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:12px">
        <div class="stat"><div class="slbl">${L('Total Revenue', 'إجمالي الإيرادات')}</div><div class="sval" style="color:var(--green)">$${totalRev.toLocaleString()}</div></div>
        <div class="stat"><div class="slbl">${L('Net Profit', 'صافي الأرباح')}</div><div class="sval" style="color:${netProfit >= 0 ? 'var(--green)' : 'var(--red)'}">$${netProfit.toLocaleString()}</div></div>
        <div class="stat"><div class="slbl">${L('Cost Per Lead (CPL)', 'تكلفة العميل المحتمل')}</div><div class="sval">$${cpl.toFixed(2)}</div></div>
        <div class="stat"><div class="slbl">${L('Acquisition Cost (CAC)', 'تكلفة الاستحواذ (CAC)')}</div><div class="sval">$${cac.toFixed(2)}</div></div>
        <div class="stat"><div class="slbl">${L('Return on Ad Spend (ROAS)', 'العائد على الإنفاق الإعلاني')}</div><div class="sval">${roas.toFixed(2)}x</div></div>
        <div class="stat"><div class="slbl">${L('ROI', 'عائد الاستثمار')}</div><div class="sval" style="color:${roi >= 0 ? 'var(--green)' : 'var(--red)'}">${roi.toFixed(1)}%</div></div>
      </div>
    `;
    setOutputs(prev => ({ ...prev, 'roi-out': formattedOutput }));
  };

  // ── 8. AI CONSULTANT SUB-ACTIONS ──
  const runMktAI = async (customQ = '') => {
    const query = customQ || inputs.aiInp;
    if (!query) return;

    setLoading(prev => ({ ...prev, 'ai-out': true }));
    const system = `You are a CMOSage marketing assistant. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}. Know that the business niche is ${GC.profile.niche}, stage is ${GC.profile.stage}, monthly revenues: $${GC.finance.entries.filter(e=>e.type==='income').reduce((a,b)=>a+b.amount,0)}. Use these variables in recommendations.`;
    try {
      const res = await callClaudeAPI(query, system, lang, GC);
      setOutputs(prev => ({ ...prev, 'ai-out': res }));
    } catch (e) {
      setOutputs(prev => ({ ...prev, 'ai-out': 'Error connecting to AI.' }));
    }
    setLoading(prev => ({ ...prev, 'ai-out': false }));
  };

  // Quick buttons list
  const quickQuestions = lang === 'ar'
    ? ['ليه إعلاناتي مش شغالة؟', 'إيه الخطوة الجاية للتسويق؟', 'إزاي أوصل لـ $10K/شهر؟', 'حلل أداء التسويق عندي']
    : ['Why are my ads not converting?', 'What is my next best marketing move?', 'How do I reach $10K/month?', 'Analyze my current marketing performance'];

  return (
    <div className="pg on" id="pg-marketing">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">📣</span>
          <span>{t('Marketing OS')}</span>
        </div>
        <div className="pg-actions">
          <button className="btn-ai" onClick={() => setActiveTab('ai')}>
            ✦ {L('AI Consultant', 'مستشار التسويق الذكي')}
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="tabs-bar" id="mkt-tabs" style={{ marginBottom: '20px' }}>
        {['research', 'strategy', 'offers', 'ads', 'content', 'funnels', 'analytics', 'ai'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'on' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'research' && `🔍 ${L('Research', 'الأبحاث')}`}
            {tab === 'strategy' && `🧭 ${L('Strategy', 'الاستراتيجية')}`}
            {tab === 'offers' && `🎁 ${L('Offers', 'العروض')}`}
            {tab === 'ads' && `📢 ${L('Ads', 'الإعلانات')}`}
            {tab === 'content' && `✍️ ${L('Content', 'المحتوى')}`}
            {tab === 'funnels' && `🔄 ${L('Funnels', 'المسارات')}`}
            {tab === 'analytics' && `📊 ${L('Analytics', 'التحليلات')}`}
            {tab === 'ai' && `✦ ${L('AI Consultant', 'مستشار AI')}`}
          </button>
        ))}
      </div>

      {/* ── TAB 1: RESEARCH ── */}
      {activeTab === 'research' && (
        <div className="mkt-section on">
          {/* Stats row */}
          <div className="g4 stagger mb">
            <div className="stat-card">
              <div className="stat-lbl">🕵️ {L('Competitors Found', 'المنافسين المكتشفين')}</div>
              <div className="stat-val">{competitorsCount}</div>
              <div className="stat-ch ch-nu">{L('tracked', 'تم تتبعهم')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">🎯 {L('Audience Insights', 'رؤى الجمهور')}</div>
              <div className="stat-val">{audienceCount}</div>
              <div className="stat-ch ch-nu">{L('analyzed', 'تم تحليلها')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">🔥 {L('Trends Tracked', 'الاتجاهات المتابعة')}</div>
              <div className="stat-val">{trendsCount}</div>
              <div className="stat-ch ch-nu">{L('scanned', 'تم مسحها')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">🧑 {L('Personas Built', 'شخصيات المشترين')}</div>
              <div className="stat-val">{personasCount}</div>
              <div className="stat-ch ch-nu">{L('created', 'تم إنشاؤها')}</div>
            </div>
          </div>

          <div className="tabs-bar" style={{ marginBottom: '14px' }}>
            {['comp', 'ads', 'aud', 'persona', 'trends'].map(sub => (
              <button
                key={sub}
                className={`tab-btn ${resTab === sub ? 'on' : ''}`}
                onClick={() => setResTab(sub)}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                {sub === 'comp' && `🕵️ ${L('Competitors', 'المنافسين')}`}
                {sub === 'ads' && `📣 ${L('Competitor Ads', 'إعلانات المنافسين')}`}
                {sub === 'aud' && `👥 ${L('Audience', 'الجمهور')}`}
                {sub === 'persona' && `🧑 ${L('Persona', 'شخصية المشتري')}`}
                {sub === 'trends' && `🔥 ${L('Trends', 'الاتجاهات')}`}
              </button>
            ))}
          </div>

          {resTab === 'comp' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd">
                  <div className="sec-title">🕵️ {L('Competitor Finder', 'مستكشف المنافسين')}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Your Business / Niche', 'مجال عملك / نيشك')}</label>
                    <input className="inp" placeholder="e.g. Online coaching for Arab women" value={inputs.compNiche} onChange={e => handleInputChange('compNiche', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Target Country', 'البلد المستهدف')}</label>
                    <select className="inp" value={inputs.compCountry} onChange={e => handleInputChange('compCountry', e.target.value)}>
                      <option>Saudi Arabia</option><option>UAE</option><option>Egypt</option><option>Kuwait</option><option>Global</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Product Type', 'نوع المنتج')}</label>
                    <select className="inp" value={inputs.compType} onChange={e => handleInputChange('compType', e.target.value)}>
                      <option>Online Course</option><option>Coaching Program</option><option>SaaS / App</option><option>E-commerce</option><option>Service / Agency</option>
                    </select>
                  </div>
                  <button className="btn btn-prime" onClick={runCompetitorFinder} style={{ width: '100%', justifyContent: 'center' }}>
                    🕵️ {L('Find Competitors + Analyze', 'ابحث عن المنافسين وحلل')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div className="sec-title">{L('Results', 'النتائج')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['comp-out'] ? L('Scanning competitors...', 'جاري البحث عن المنافسين...') : (outputs['comp-out'] || L('Find competitor lists, pricing strategies, and marketing positioning.', 'ابحث عن المنافسين واستراتيجيات التسعير والتموضع.'))}
                </div>
              </div>
            </div>
          )}

          {resTab === 'ads' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div className="sec-title">📣 {L('Competitor Ads Research', 'أبحاث إعلانات المنافسين')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Competitor Name / URL', 'اسم المنافس / الرابط')}</label>
                    <input className="inp" placeholder="Competitor brand or website..." value={inputs.compAdsName} onChange={e => handleInputChange('compAdsName', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Ad Platform', 'منصة الإعلانات')}</label>
                    <select className="inp" value={inputs.compAdsPlatform} onChange={e => handleInputChange('compAdsPlatform', e.target.value)}>
                      <option>Meta (Facebook/Instagram)</option><option>TikTok</option><option>Google</option><option>YouTube</option>
                    </select>
                  </div>
                  <button className="btn btn-prime" onClick={runCompetitorAds} style={{ width: '100%', justifyContent: 'center' }}>
                    🔍 {L('Analyze Their Ads', 'حلل إعلاناتهم')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div className="sec-title">{L('Ad Intelligence', 'ذكاء الإعلانات')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['comp-ads-out'] ? L('Analyzing ads...', 'جاري تحليل الإعلانات...') : (outputs['comp-ads-out'] || L('Discover hooks, creatives, and strategies.', 'اكتشف الخطافات والإعلانات والاستراتيجيات.'))}
                </div>
              </div>
            </div>
          )}

          {resTab === 'aud' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div className="sec-title">👥 {L('Audience Research', 'أبحاث الجمهور')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Describe your ideal customer', 'صف عميلك المثالي')}</label>
                    <textarea className="inp" rows="3" placeholder="Arab women 25-40, interested in business and personal growth..." value={inputs.audDesc} onChange={e => handleInputChange('audDesc', e.target.value)}></textarea>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('What problem do you solve?', 'ما المشكلة التي تحلها؟')}</label>
                    <input className="inp" placeholder="Help them build a sustainable online income..." value={inputs.audProblem} onChange={e => handleInputChange('audProblem', e.target.value)} />
                  </div>
                  <button className="btn btn-prime" onClick={runAudienceResearch} style={{ width: '100%', justifyContent: 'center' }}>
                    🔍 {L('Deep Audience Analysis', 'تحليل متعمق للجمهور')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div class="sec-title">{L('Audience Intelligence', 'رؤى الجمهور')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['aud-out'] ? L('Analyzing audience...', 'جاري تحليل الجمهور...') : (outputs['aud-out'] || L('Target demographics, objections, and buying triggers.', 'الديموغرافيا المستهدفة والاعتراضات ومحفزات الشراء.'))}
                </div>
              </div>
            </div>
          )}

          {resTab === 'persona' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div className="sec-title">🧑 {L('Buyer Persona Builder', 'بناء شخصية المشتري')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Product / Offer', 'المنتج / العرض')}</label>
                    <input className="inp" placeholder="12-Week Business Coaching Program" value={inputs.personaProduct} onChange={e => handleInputChange('personaProduct', e.target.value)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Age Range', 'الفئة العمرية')}</label>
                      <input className="inp" placeholder="25-40" value={inputs.personaAge} onChange={e => handleInputChange('personaAge', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Gender Focus', 'التركيز على الجنس')}</label>
                      <select className="inp" value={inputs.personaGender} onChange={e => handleInputChange('personaGender', e.target.value)}>
                        <option>Both</option><option>Female</option><option>Male</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Target Market', 'السوق المستهدف')}</label>
                    <input className="inp" placeholder="Arab Gulf region, middle-class..." value={inputs.personaMarket} onChange={e => handleInputChange('personaMarket', e.target.value)} />
                  </div>
                  <button className="btn btn-prime" onClick={runBuyerPersona} style={{ width: '100%', justifyContent: 'center' }}>
                    🧑 {L('Build Detailed Persona', 'ابني شخصية تفصيلية')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div className="sec-title">{L('Buyer Persona', 'شخصية المشتري')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['persona-out'] ? L('Building buyer personas...', 'جاري بناء شخصية المشتري...') : (outputs['persona-out'] || L('Complete profile of your buyer persona.', 'الملف الكامل لشخصية المشتري الخاصة بك.'))}
                </div>
              </div>
            </div>
          )}

          {resTab === 'trends' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div className="sec-title">🔥 {L('Trend Discovery', 'اكتشاف الترندات')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Your Industry / Niche', 'مجالك / النيش')}</label>
                    <input className="inp" placeholder="Online education, coaching, e-commerce..." value={inputs.trendNiche} onChange={e => handleInputChange('trendNiche', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Region', 'المنطقة')}</label>
                    <select className="inp" value={inputs.trendRegion} onChange={e => handleInputChange('trendRegion', e.target.value)}>
                      <option>Arab Market</option><option>Gulf (GCC)</option><option>Egypt & Levant</option><option>Global</option>
                    </select>
                  </div>
                  <button className="btn btn-prime" onClick={runTrendDiscovery} style={{ width: '100%', justifyContent: 'center' }}>
                    🔥 {L('Discover Trends', 'اكتشف الاتجاهات')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div className="sec-title">{L('Trend Report', 'تقرير الاتجاهات')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['trends-out'] ? L('Scanning trends...', 'جاري مسح الترندات...') : (outputs['trends-out'] || L('Discover what topics and formats are trending.', 'اكتشف الموضوعات والصيغ الرائجة.'))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: STRATEGY ── */}
      {activeTab === 'strategy' && (
        <div className="mkt-section on">
          <div className="tabs-bar" style={{ marginBottom: '14px' }}>
            {['plan', 'launch', 'roadmap', 'swot'].map(sub => (
              <button
                key={sub}
                className={`tab-btn ${stratTab === sub ? 'on' : ''}`}
                onClick={() => setStratTab(sub)}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                {sub === 'plan' && `📋 ${L('Marketing Plan', 'خطة التسويق')}`}
                {sub === 'launch' && `🚀 ${L('Launch Planner', 'مخطط الإطلاق')}`}
                {sub === 'roadmap' && `🗺️ ${L('Growth Roadmap', 'خارطة الطريق')}`}
                {sub === 'swot' && `⚔️ SWOT`}
              </button>
            ))}
          </div>

          {stratTab === 'plan' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div className="sec-title">📋 {L('Marketing Strategy Builder', 'منشئ خطة التسويق')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Business Type', 'نوع البزنس')}</label>
                    <select className="inp" value={inputs.stratBizType} onChange={e => handleInputChange('stratBizType', e.target.value)}>
                      <option>Coaching / Training</option><option>Agency</option><option>E-commerce</option><option>SaaS / Software</option><option>Freelancing</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Monthly Marketing Budget', 'الميزانية التسويقية الشهرية')}</label>
                    <select className="inp" value={inputs.stratBudget} onChange={e => handleInputChange('stratBudget', e.target.value)}>
                      <option>$0 – Organic only</option><option>Under $500</option><option>$500 – $2,000</option><option>$2,000 – $10,000</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Primary Goal', 'الهدف الأساسي')}</label>
                    <select className="inp" value={inputs.stratGoal} onChange={e => handleInputChange('stratGoal', e.target.value)}>
                      <option>Get more leads</option><option>Increase sales</option><option>Build brand awareness</option><option>Launch new product</option>
                    </select>
                  </div>
                  <button className="btn btn-prime" onClick={runStrategyBuilder} style={{ width: '100%', justifyContent: 'center' }}>
                    📋 {L('Build Full Strategy', 'أعد استراتيجية كاملة')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div class="sec-title">{L('Your Marketing Strategy', 'استراتيجيتك التسويقية')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['strat-plan-out'] ? L('Building strategy...', 'جاري بناء الاستراتيجية...') : (outputs['strat-plan-out'] || L('Complete marketing channels, timelines, and budgets blueprint.', 'استراتيجية كاملة للقنوات الإعلانية، الميزانية، والجدول الزمني.'))}
                </div>
              </div>
            </div>
          )}

          {stratTab === 'launch' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div className="sec-title">🚀 {L('Launch Planner', 'مخطط الإطلاق')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('What are you launching?', 'ما الذي تطلقه؟')}</label>
                    <input className="inp" placeholder="e.g. Online course, coaching program..." value={inputs.launchWhat} onChange={e => handleInputChange('launchWhat', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Launch Date', 'تاريخ الإطلاق')}</label>
                    <input 
                      className="inp" 
                      type={inputs.launchDate ? "date" : "text"} 
                      placeholder="dd/mm/yyyy" 
                      onFocus={(e) => e.target.type = 'date'} 
                      onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                      value={inputs.launchDate} 
                      onChange={e => handleInputChange('launchDate', e.target.value)} 
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Audience Size', 'حجم الجمهور')}</label>
                      <input className="inp" placeholder="5,000 followers" value={inputs.launchAud} onChange={e => handleInputChange('launchAud', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Revenue Target', 'الدخل المستهدف')}</label>
                      <input className="inp" placeholder="$10,000" value={inputs.launchTarget} onChange={e => handleInputChange('launchTarget', e.target.value)} />
                    </div>
                  </div>
                  <button className="btn btn-prime" onClick={runLaunchPlanner} style={{ width: '100%', justifyContent: 'center' }}>
                    🚀 {L('Build Launch Plan', 'أعد خطة الإطلاق')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div className="sec-title">{L('Your Launch Plan', 'خطة الإطلاق')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['launch-out'] ? L('Planning launch...', 'جاري التخطيط للإطلاق...') : (outputs['launch-out'] || L('Week-by-week checklist and promotional strategy.', 'المهام الأسبوعية واستراتيجية الترويج للإطلاق.'))}
                </div>
              </div>
            </div>
          )}

          {stratTab === 'roadmap' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div className="sec-title">🗺️ {L('Growth Roadmap', 'خارطة طريق النمو')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Current Revenue', 'الإيرادات الحالية')}</label>
                    <input className="inp" placeholder="$1,500/month" value={inputs.rmCurrent} onChange={e => handleInputChange('rmCurrent', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Revenue Goal', 'هدف الإيرادات')}</label>
                    <input className="inp" placeholder="$5,000/month" value={inputs.rmGoal} onChange={e => handleInputChange('rmGoal', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Primary Channel', 'القناة الأساسية')}</label>
                    <select className="inp" value={inputs.rmChannel} onChange={e => handleInputChange('rmChannel', e.target.value)}>
                      <option>Instagram</option><option>LinkedIn</option><option>YouTube</option><option>TikTok</option><option>Paid Ads</option>
                    </select>
                  </div>
                  <button className="btn btn-prime" onClick={runGrowthRoadmap} style={{ width: '100%', justifyContent: 'center' }}>
                    🗺️ {L('Build Growth Roadmap', 'أعد خارطة طريق النمو')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div className="sec-title">{L('Your Growth Roadmap', 'خارطة طريق النمو')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['rm-out'] ? L('Building roadmap...', 'جاري بناء خارطة الطريق...') : (outputs['rm-out'] || L('90-day execution milestones and weekly tasks.', 'المعالم الأسبوعية لخارطة طريق النمو لمدة ٩٠ يوماً.'))}
                </div>
              </div>
            </div>
          )}

          {stratTab === 'swot' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div className="sec-title">⚔️ {L('SWOT Analyzer', 'تحليل SWOT')}</div></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ background: 'var(--green-d)', border: '1px solid rgba(34,211,160,.2)', borderRadius: '10px', padding: '11px' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--green)', marginBottom: '5px' }}>💪 STRENGTHS</div>
                    <textarea className="inp" rows="3" placeholder="Advantages..." style={{ background: 'transparent', border: 'none', padding: 0 }} value={inputs.swotS} onChange={e => handleInputChange('swotS', e.target.value)} />
                  </div>
                  <div style={{ background: 'var(--red-d)', border: '1px solid rgba(244,63,94,.2)', borderRadius: '10px', padding: '11px' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--red)', marginBottom: '5px' }}>⚠️ WEAKNESSES</div>
                    <textarea className="inp" rows="3" placeholder="Gaps..." style={{ background: 'transparent', border: 'none', padding: 0 }} value={inputs.swotW} onChange={e => handleInputChange('swotW', e.target.value)} />
                  </div>
                  <div style={{ background: 'var(--blue-d)', border: '1px solid rgba(56,189,248,.2)', borderRadius: '10px', padding: '11px' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--blue)', marginBottom: '5px' }}>🚀 OPPORTUNITIES</div>
                    <textarea className="inp" rows="3" placeholder="Openings..." style={{ background: 'transparent', border: 'none', padding: 0 }} value={inputs.swotO} onChange={e => handleInputChange('swotO', e.target.value)} />
                  </div>
                  <div style={{ background: 'var(--amber-d)', border: '1px solid rgba(251,191,36,.2)', borderRadius: '10px', padding: '11px' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--amber)', marginBottom: '5px' }}>🛡️ THREATS</div>
                    <textarea className="inp" rows="3" placeholder="Risks..." style={{ background: 'transparent', border: 'none', padding: 0 }} value={inputs.swotT} onChange={e => handleInputChange('swotT', e.target.value)} />
                  </div>
                </div>
                <button className="btn btn-prime" onClick={runSWOT} style={{ width: '100%', justifyContent: 'center' }}>
                  ⚔️ {L('Analyze SWOT Strategy', 'حلل استراتيجية SWOT')}
                </button>
              </div>
              <div className="card">
                <div className="sec-hd"><div className="sec-title">{L('SWOT Insights', 'رؤى SWOT')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['swot-out'] ? L('Analyzing SWOT...', 'جاري تحليل SWOT...') : (outputs['swot-out'] || L('AI generated SWOT takeaways.', 'توصيات استراتيجية بناءً على مصفوفة SWOT.'))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: OFFERS ── */}
      {activeTab === 'offers' && (
        <div className="mkt-section on">
          <div className="tabs-bar" style={{ marginBottom: '14px' }}>
            {['builder', 'pricing', 'upsell'].map(sub => (
              <button
                key={sub}
                className={`tab-btn ${offTab === sub ? 'on' : ''}`}
                onClick={() => setOffTab(sub)}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                {sub === 'builder' && `🎁 ${L('Offer Builder', 'منشئ العروض')}`}
                {sub === 'pricing' && `💰 ${L('Pricing', 'التسعير')}`}
                {sub === 'upsell' && `⬆️ ${L('Upsells', 'البيع الإضافي')}`}
              </button>
            ))}
          </div>

          {offTab === 'builder' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div className="sec-title">🎁 {L('Offer Builder', 'منشئ العروض')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('What do you sell?', 'ما الذي تبيعه؟')}</label>
                    <input className="inp" placeholder="Coaching program, course, service..." value={inputs.offerCore} onChange={e => handleInputChange('offerCore', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('What transformation do you deliver?', 'ما النتيجة / التحول الذي تقدمه؟')}</label>
                    <input className="inp" placeholder="From 0 to $5K/month in 90 days..." value={inputs.offerTransform} onChange={e => handleInputChange('offerTransform', e.target.value)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Current Price', 'السعر الحالي')}</label>
                      <input className="inp" placeholder="$1,500" value={inputs.offerPrice} onChange={e => handleInputChange('offerPrice', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Target Customer Pain', 'ألم العميل الأساسي')}</label>
                      <input className="inp" placeholder="Not consistent sales" value={inputs.offerPain} onChange={e => handleInputChange('offerPain', e.target.value)} />
                    </div>
                  </div>
                  <button className="btn btn-prime" onClick={runOfferBuilder} style={{ width: '100%', justifyContent: 'center' }}>
                    🎁 {L('Build Irresistible Offer', 'أعد عرضاً لا يقاوم')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div class="sec-title">{L('Your Offer Structure', 'هيكل العرض الخاص بك')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['offer-out'] ? L('Building offer...', 'جاري بناء العرض...') : (outputs['offer-out'] || L('Complete offer framework with core, bonuses, guarantee, and urgency.', 'مكونات العرض، البونصات المرفقة، الضمان وعوامل الاستعجال.'))}
                </div>
              </div>
            </div>
          )}

          {offTab === 'pricing' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div class="sec-title">💰 {L('Pricing Optimizer', 'مُحسن التسعير')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Current Price', 'السعر الحالي')}</label>
                    <input className="inp" placeholder="$500" value={inputs.priceCurrent} onChange={e => handleInputChange('priceCurrent', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Product Type', 'نوع المنتج')}</label>
                    <select className="inp" value={inputs.priceType} onChange={e => handleInputChange('priceType', e.target.value)}>
                      <option>1-on-1 Coaching</option><option>Group Program</option><option>Online Course</option><option>DFY Service</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Experience Level', 'مستوى الخبرة')}</label>
                      <select className="inp" value={inputs.priceExp} onChange={e => handleInputChange('priceExp', e.target.value)}>
                        <option>Beginner (0-1 year)</option><option>Intermediate (1-3 years)</option><option>Expert (5+ years)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Target Monthly Income', 'الدخل الشهري المستهدف')}</label>
                      <input className="inp" placeholder="$5,000" value={inputs.priceIncome} onChange={e => handleInputChange('priceIncome', e.target.value)} />
                    </div>
                  </div>
                  <button className="btn btn-prime" onClick={runPricingOptimizer} style={{ width: '100%', justifyContent: 'center' }}>
                    💰 {L('Optimize My Pricing', 'حسّن التسعير الخاص بي')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div class="sec-title">{L('Pricing Strategy', 'استراتيجية التسعير')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['pricing-out'] ? L('Optimizing prices...', 'جاري تحسين الأسعار...') : (outputs['pricing-out'] || L('Tiered pricing tiers and psychology logic.', 'توزيع الباقات والأسعار النفسية المقترحة.'))}
                </div>
              </div>
            </div>
          )}

          {offTab === 'upsell' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div className="sec-title">⬆️ {L('Upsell & Cross-Sell Builder', 'منشئ البيع الإضافي والتقاطعي')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Main Product', 'المنتج الأساسي')}</label>
                    <input className="inp" placeholder="Your main offer..." value={inputs.upsellCore} onChange={e => handleInputChange('upsellCore', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Main Product Price', 'سعر المنتج الأساسي')}</label>
                    <input className="inp" placeholder="$997" value={inputs.upsellPrice} onChange={e => handleInputChange('upsellPrice', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Customer Needs AFTER Buying', 'احتياجات العميل بعد الشراء مباشرة')}</label>
                    <textarea className="inp" rows="2" placeholder="After buying the course they still need implementation help..." value={inputs.upsellAfter} onChange={e => handleInputChange('upsellAfter', e.target.value)}></textarea>
                  </div>
                  <button className="btn btn-prime" onClick={runUpsellBuilder} style={{ width: '100%', justifyContent: 'center' }}>
                    ⬆️ {L('Build Upsell Sequence', 'أعد تسلسل البيع الإضافي')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div className="sec-title">{L('Upsell Strategy', 'استراتيجية البيع الإضافي')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['upsell-out'] ? L('Building upsell ladder...', 'جاري بناء سلم البيع الإضافي...') : (outputs['upsell-out'] || L('Order bump, one-click upsell, and high-ticket options.', 'العروض المضافة وخيارات ترقية الشراء.'))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: ADS ── */}
      {activeTab === 'ads' && (
        <div className="mkt-section on">
          <div className="tabs-bar" style={{ marginBottom: '14px', overflowX: 'auto', display: 'flex', whiteSpace: 'nowrap' }}>
            {['meta', 'google', 'tiktok', 'copy', 'creative', 'budget'].map(sub => (
              <button
                key={sub}
                className={`tab-btn ${adsTab === sub ? 'on' : ''}`}
                onClick={() => setAdsTab(sub)}
                style={{ padding: '6px 12px', fontSize: '11px' }}
              >
                {sub === 'meta' && `📘 Meta Ads`}
                {sub === 'google' && `🔍 Google Ads`}
                {sub === 'tiktok' && `🎵 TikTok Ads`}
                {sub === 'copy' && `✍️ ${L('Ad Copy', 'نصوص الإعلانات')}`}
                {sub === 'creative' && `🎬 ${L('Creative Brief', 'مخطط الإبداع')}`}
                {sub === 'budget' && `💰 ${L('Budget', 'الميزانية')}`}
              </button>
            ))}
          </div>

          {adsTab === 'meta' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div className="sec-title">📘 Meta Ads Planner</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Campaign Objective', 'هدف الحملة')}</label>
                    <select className="inp" value={inputs.metaObj} onChange={e => handleInputChange('metaObj', e.target.value)}>
                      <option>Lead Generation</option><option>Conversions (Sales)</option><option>Traffic</option><option>Messenger Leads</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Daily Budget', 'الميزانية اليومية')}</label>
                      <input className="inp" placeholder="$20/day" value={inputs.metaBudget} onChange={e => handleInputChange('metaBudget', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Promoted Offer', 'العرض المروّج')}</label>
                      <input className="inp" placeholder="Free webinar" value={inputs.metaOffer} onChange={e => handleInputChange('metaOffer', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Target Audience Description', 'وصف الجمهور المستهدف')}</label>
                    <textarea className="inp" rows="2" placeholder="Arab entrepreneurs, age 25-45, interested in business..." value={inputs.metaAud} onChange={e => handleInputChange('metaAud', e.target.value)}></textarea>
                  </div>
                  <button className="btn btn-prime" onClick={runMetaAds} style={{ width: '100%', justifyContent: 'center' }}>
                    📘 {L('Build Meta Campaign', 'أعد حملة Meta')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div class="sec-title">{L('Campaign Structure', 'هيكل الحملة')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['meta-out'] ? L('Building Meta campaign...', 'جاري بناء الحملة...') : (outputs['meta-out'] || L('Campaign structure, ad sets, and optimization settings.', 'الجمهور المستهدف والمجموعات الإعلانية المقترحة.'))}
                </div>
              </div>
            </div>
          )}

          {adsTab === 'google' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div className="sec-title">🔍 Google Ads Planner</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Campaign Type', 'نوع الحملة')}</label>
                    <select className="inp" value={inputs.googleType} onChange={e => handleInputChange('googleType', e.target.value)}>
                      <option>Search Ads</option><option>Display Ads</option><option>YouTube Ads</option><option>Performance Max</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Keywords Focus', 'الكلمات المفتاحية المستهدفة')}</label>
                    <textarea className="inp" rows="2" placeholder="business coaching, online courses..." value={inputs.googleKw} onChange={e => handleInputChange('googleKw', e.target.value)}></textarea>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Target Location / Language', 'الدولة واللغة المستهدفة')}</label>
                    <input className="inp" placeholder="Saudi Arabia, Arabic" value={inputs.googleGeo} onChange={e => handleInputChange('googleGeo', e.target.value)} />
                  </div>
                  <button className="btn btn-prime" onClick={runGoogleAds} style={{ width: '100%', justifyContent: 'center' }}>
                    🔍 {L('Build Google Campaign', 'أعد حملة Google')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div className="sec-title">{L('Google Campaign Plan', 'خطة حملة Google')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['google-out'] ? L('Building Google campaign...', 'جاري بناء حملة Google...') : (outputs['google-out'] || L('Keywords, bid strategy, and responsive search ads drafts.', 'الكلمات المفتاحية المستهدفة، استراتيجية المزايدة ونصوص الإعلانات.'))}
                </div>
              </div>
            </div>
          )}

          {adsTab === 'tiktok' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div className="sec-title">🎵 TikTok Ads Planner</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Campaign Goal', 'هدف الحملة')}</label>
                    <select className="inp" value={inputs.tiktokObj} onChange={e => handleInputChange('tiktokObj', e.target.value)}>
                      <option>Conversions</option><option>Traffic</option><option>Video Views</option><option>Lead Generation</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Daily Budget', 'الميزانية اليومية')}</label>
                      <input className="inp" placeholder="$30/day" value={inputs.tiktokBudget} onChange={e => handleInputChange('tiktokBudget', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Target Age', 'الفئة العمرية')}</label>
                      <select className="inp" value={inputs.tiktokAge} onChange={e => handleInputChange('tiktokAge', e.target.value)}>
                        <option>18–24</option><option>25–34</option><option>35–44</option><option>18–44 (broad)</option>
                      </select>
                    </div>
                  </div>
                  <button className="btn btn-prime" onClick={runTikTokAds} style={{ width: '100%', justifyContent: 'center' }}>
                    🎵 {L('Build TikTok Campaign', 'أعد حملة TikTok')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div className="sec-title">{L('TikTok Campaign Plan', 'خطة حملة TikTok')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['tiktok-out'] ? L('Building TikTok campaign...', 'جاري بناء حملة TikTok...') : (outputs['tiktok-out'] || L('TikTok video hooks, UGC brief, and ad setups.', 'أفكار الفيديوهات الإبداعية، استهداف الجمهور وإعداد الحملة.'))}
                </div>
              </div>
            </div>
          )}

          {adsTab === 'copy' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div class="sec-title">✍️ {L('Ad Copy Generator', 'مولد نصوص الإعلانات')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Ad Platform', 'منصة الإعلانات')}</label>
                    <select className="inp" value={inputs.copyPlatform} onChange={e => handleInputChange('copyPlatform', e.target.value)}>
                      <option>Facebook/Instagram</option><option>TikTok</option><option>Google</option><option>LinkedIn</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Offer / Product', 'العرض / المنتج')}</label>
                    <input className="inp" placeholder="Free webinar on business growth..." value={inputs.copyOffer} onChange={e => handleInputChange('copyOffer', e.target.value)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Copy Style', 'أسلوب النص')}</label>
                      <select className="inp" value={inputs.copyStyle} onChange={e => handleInputChange('copyStyle', e.target.value)}>
                        <option>Problem-Agitate-Solve</option><option>Story-Based</option><option>Direct Response</option><option>Social Proof Led</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Language', 'اللغة')}</label>
                      <select className="inp" value={inputs.copyLang} onChange={e => handleInputChange('copyLang', e.target.value)}>
                        <option>Arabic</option><option>English</option><option>Both</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Target Customer Pain Point', 'ألم العميل المستهدف')}</label>
                    <input className="inp" placeholder="Stuck at $2K/month..." value={inputs.copyPain} onChange={e => handleInputChange('copyPain', e.target.value)} />
                  </div>
                  <button className="btn btn-prime" onClick={runAdCopyGen} style={{ width: '100%', justifyContent: 'center' }}>
                    ✍️ {L('Generate Ad Copy', 'ولّد نصوص الإعلانات')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div className="sec-title">{L('Generated Ad Copy', 'النصوص المولّدة')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['copy-out'] ? L('Generating copy...', 'جاري توليد النصوص...') : (outputs['copy-out'] || L('5 variations of hooks, primary text, and CTAs.', '٥ نماذج تسويقية من نصوص الإعلانات والخطافات.'))}
                </div>
              </div>
            </div>
          )}

          {adsTab === 'creative' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div className="sec-title">🎬 {L('Creative Brief Generator', 'منشئ مخطط الإبداع')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Creative Type', 'نوع التصميم')}</label>
                    <select className="inp" value={inputs.creativeType} onChange={e => handleInputChange('creativeType', e.target.value)}>
                      <option>Video Script (30s)</option><option>Video Script (60s)</option><option>Static Image Brief</option><option>Carousel Brief</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Hook Style', 'نمط الخطاف')}</label>
                    <select className="inp" value={inputs.creativeHook} onChange={e => handleInputChange('creativeHook', e.target.value)}>
                      <option>Problem-based ("If you're struggling with...")</option><option>Curiosity ("What nobody tells you about...")</option><option>Results ("How I made $X in Y days")</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Key Message', 'الرسالة الأساسية')}</label>
                    <input className="inp" placeholder="Our coaching gets you to $10K/month in 90 days" value={inputs.creativeMsg} onChange={e => handleInputChange('creativeMsg', e.target.value)} />
                  </div>
                  <button className="btn btn-prime" onClick={runCreativeBrief} style={{ width: '100%', justifyContent: 'center' }}>
                    🎬 {L('Generate Creative Brief', 'ولّد المخطط الإبداعي')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div className="sec-title">{L('Creative Brief', 'مخطط الإبداع')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['creative-out'] ? L('Generating brief...', 'جاري التوليد...') : (outputs['creative-out'] || L('Complete visual guide, script and UGC briefing.', 'دليل المشاهد البصرية، الحوار، وإرشادات التصوير.'))}
                </div>
              </div>
            </div>
          )}

          {adsTab === 'budget' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div class="sec-title">💰 {L('Budget Planner', 'مخطط الميزانية الإعلانية')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Total Monthly Budget', 'إجمالي الميزانية الشهرية')}</label>
                    <input className="inp" placeholder="$1,000" value={inputs.budgetTotal} onChange={e => handleInputChange('budgetTotal', e.target.value)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Primary Objective', 'الهدف الأساسي')}</label>
                      <select className="inp" value={inputs.budgetObj} onChange={e => handleInputChange('budgetObj', e.target.value)}>
                        <option>Generate leads</option><option>Drive direct sales</option><option>Build awareness first</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Average Order Value', 'متوسط قيمة الطلب')}</label>
                      <input className="inp" placeholder="$500 per client" value={inputs.budgetAov} onChange={e => handleInputChange('budgetAov', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Platforms to use', 'المنصات المستخدمة')}</label>
                    <select className="inp" value={inputs.budgetPlatforms} onChange={e => handleInputChange('budgetPlatforms', e.target.value)}>
                      <option>Meta only</option><option>Meta + Google</option><option>Meta + TikTok</option><option>All platforms</option>
                    </select>
                  </div>
                  <button className="btn btn-prime" onClick={runBudgetPlanner} style={{ width: '100%', justifyContent: 'center' }}>
                    💰 {L('Plan My Budget', 'خطط ميزانيتي')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div class="sec-title">{L('Budget Allocation Plan', 'خطة توزيع الميزانية')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['budget-out'] ? L('Planning budget...', 'جاري التخطيط...') : (outputs['budget-out'] || L('Budget allocation and expected acquisition costs.', 'توزيع الميزانية وتكلفة الاستحواذ المقدرة.'))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 5: CONTENT ── */}
      {activeTab === 'content' && (
        <div className="mkt-section on">
          <div className="tabs-bar" style={{ marginBottom: '14px' }}>
            {['plan', 'hooks', 'ideas', 'comp'].map(sub => (
              <button
                key={sub}
                className={`tab-btn ${contTab === sub ? 'on' : ''}`}
                onClick={() => setContTab(sub)}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                {sub === 'plan' && `📅 ${L('Content Plan', 'خطة المحتوى')}`}
                {sub === 'hooks' && `🪝 ${L('Viral Hooks', 'خطافات رائجة')}`}
                {sub === 'ideas' && `💡 ${L('Content Ideas', 'أفكار المحتوى')}`}
                {sub === 'comp' && `🔍 ${L('Competitor Content', 'محتوى المنافسين')}`}
              </button>
            ))}
          </div>

          {contTab === 'plan' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div className="sec-title">📅 {L('Content Planner', 'مخطط المحتوى الشهري')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Primary Platform', 'المنصة الأساسية')}</label>
                    <select className="inp" value={inputs.planPlatform} onChange={e => handleInputChange('planPlatform', e.target.value)}>
                      <option>Instagram</option><option>TikTok</option><option>YouTube</option><option>LinkedIn</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Content Goal', 'هدف المحتوى')}</label>
                    <select className="inp" value={inputs.planGoal} onChange={e => handleInputChange('planGoal', e.target.value)}>
                      <option>Build authority</option><option>Generate leads</option><option>Grow audience</option><option>Promote product</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Posts Per Week', 'عدد المنشورات أسبوعياً')}</label>
                      <select className="inp" value={inputs.planFreq} onChange={e => handleInputChange('planFreq', e.target.value)}>
                        <option>3 posts/week</option><option>5 posts/week</option><option>Daily</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Content Mix', 'مزيج المحتوى')}</label>
                      <select className="inp" value={inputs.planMix} onChange={e => handleInputChange('planMix', e.target.value)}>
                        <option>80% value, 20% promo</option><option>70% value, 30% promo</option><option>60% value, 40% promo</option>
                      </select>
                    </div>
                  </div>
                  <button className="btn btn-prime" onClick={runContentPlanner} style={{ width: '100%', justifyContent: 'center' }}>
                    📅 {L('Generate Content Plan', 'ولّد خطة المحتوى')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div className="sec-title">{L('Your Content Plan', 'خطة المحتوى الخاصة بك')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['plan-out'] ? L('Generating content plan...', 'جاري توليد خطة المحتوى...') : (outputs['plan-out'] || L('30-day content calendar with topics, formats, and CTAs.', 'جدول نشر لـ ٣٠ يوماً مع الخطافات والدعوات لإجراء.'))}
                </div>
              </div>
            </div>
          )}

          {contTab === 'hooks' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div class="sec-title">🪝 {L('Viral Hook Generator', 'مولد الخطافات الفيروسية')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Topic / Content Idea', 'الموضوع / فكرة المحتوى')}</label>
                    <textarea className="inp" rows="2" placeholder="How to grow on Instagram without paid ads..." value={inputs.hookTopic} onChange={e => handleInputChange('hookTopic', e.target.value)}></textarea>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Platform', 'المنصة')}</label>
                    <select className="inp" value={inputs.hookPlatform} onChange={e => handleInputChange('hookPlatform', e.target.value)}>
                      <option>Instagram Reels</option><option>TikTok</option><option>YouTube Shorts</option><option>LinkedIn</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Number of Hooks', 'عدد الخطافات')}</label>
                      <select className="inp" value={inputs.hookCount} onChange={e => handleInputChange('hookCount', e.target.value)}>
                        <option>5 hooks</option><option>10 hooks</option><option>20 hooks</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Language', 'اللغة')}</label>
                      <select className="inp" value={inputs.hookLang} onChange={e => handleInputChange('hookLang', e.target.value)}>
                        <option>Arabic</option><option>English</option><option>Both</option>
                      </select>
                    </div>
                  </div>
                  <button className="btn btn-prime" onClick={runHookGen} style={{ width: '100%', justifyContent: 'center' }}>
                    🪝 {L('Generate Viral Hooks', 'ولّد الخطافات')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div className="sec-title">{L('Generated Hooks', 'الخطافات المولّدة')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['hooks-out'] ? L('Generating hooks...', 'جاري التوليد...') : (outputs['hooks-out'] || L('Stop-the-scroll opening lines that grab attention.', 'جمل افتتاحية تخطف انتباه المشاهد فوراً.'))}
                </div>
              </div>
            </div>
          )}

          {contTab === 'ideas' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div class="sec-title">💡 {L('Content Ideas Generator', 'مولد أفكار المحتوى')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Your Niche', 'نيشك')}</label>
                    <input className="inp" placeholder="Business coaching, fitness, real estate..." value={inputs.ideasNiche} onChange={e => handleInputChange('ideasNiche', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Content Mix', 'مزيج الأفكار')}</label>
                    <select className="inp" multiple style={{ height: '80px' }} value={inputs.ideasMix} onChange={e => {
                      const options = Array.from(e.target.selectedOptions, option => option.value);
                      handleInputChange('ideasMix', options);
                    }}>
                      <option value="Educational">Educational</option>
                      <option value="Behind the scenes">Behind the scenes</option>
                      <option value="Social proof">Social proof</option>
                      <option value="Entertainment">Entertainment</option>
                    </select>
                  </div>
                  <button className="btn btn-prime" onClick={runIdeasGen} style={{ width: '100%', justifyContent: 'center' }}>
                    💡 {L('Generate 30 Content Ideas', 'ولّد ٣٠ فكرة محتوى')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div class="sec-title">{L('Content Ideas', 'أفكار المحتوى')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['ideas-out'] ? L('Generating ideas...', 'جاري التوليد...') : (outputs['ideas-out'] || L('30 creative video and carousel ideas.', 'أفكار تسويقية مميزة للفيديو والمنشورات.'))}
                </div>
              </div>
            </div>
          )}

          {contTab === 'comp' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div class="sec-title">🔍 {L('Competitor Content Analyzer', 'محلل محتوى المنافسين')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Competitor Account / Brand', 'حساب المنافس / العلامة التجارية')}</label>
                    <input className="inp" placeholder="@competitor or brand name" value={inputs.compContName} onChange={e => handleInputChange('compContName', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Platform', 'المنصة')}</label>
                    <select className="inp" value={inputs.compContPlatform} onChange={e => handleInputChange('compContPlatform', e.target.value)}>
                      <option>Instagram</option><option>TikTok</option><option>YouTube</option><option>LinkedIn</option>
                    </select>
                  </div>
                  <button className="btn btn-prime" onClick={runCompetitorContent} style={{ width: '100%', justifyContent: 'center' }}>
                    🔍 {L('Analyze Their Content', 'حلل المحتوى الخاص بهم')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div className="sec-title">{L('Competitor Content Intelligence', 'ذكاء محتوى المنافسين')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['comp-content-out'] ? L('Analyzing content...', 'جاري تحليل المحتوى...') : (outputs['comp-content-out'] || L('Discover what topics and formats are winning for them.', 'اكتشف أفضل صيغ المنشورات والموضوعات والفرص المتاحة لديهم.'))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 6: FUNNELS ── */}
      {activeTab === 'funnels' && (
        <div className="mkt-section on">
          <div className="tabs-bar" style={{ marginBottom: '14px' }}>
            {['builder', 'magnet', 'lp', 'conv'].map(sub => (
              <button
                key={sub}
                className={`tab-btn ${funTab === sub ? 'on' : ''}`}
                onClick={() => setFunTab(sub)}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                {sub === 'builder' && `🔄 ${L('Funnel Builder', 'منشئ المسارات')}`}
                {sub === 'magnet' && `🧲 ${L('Lead Magnet', 'مغناطيس العملاء')}`}
                {sub === 'lp' && `⚡ ${L('Landing Page', 'صفحة الهبوط')}`}
                {sub === 'conv' && `📈 ${L('Conversion', 'التحويل')}`}
              </button>
            ))}
          </div>

          {funTab === 'builder' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div class="sec-title">🔄 {L('Sales Funnel Builder', 'منشئ مسارات المبيعات')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Main Product / Offer', 'المنتج الأساسي / العرض')}</label>
                    <input className="inp" placeholder="Coaching program, course..." value={inputs.funProduct} onChange={e => handleInputChange('funProduct', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Traffic Source', 'مصدر الترافيك')}</label>
                    <select className="inp" value={inputs.funTraffic} onChange={e => handleInputChange('funTraffic', e.target.value)}>
                      <option>Instagram organic</option><option>Meta Paid Ads</option><option>YouTube</option><option>Email list</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Funnel Model', 'موديل المسار')}</label>
                      <select className="inp" value={inputs.funModel} onChange={e => handleInputChange('funModel', e.target.value)}>
                        <option>Lead gen → Call → Close</option><option>Webinar funnel</option><option>Free → Paid</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Product Price', 'سعر المنتج')}</label>
                      <input className="inp" placeholder="$1,500" value={inputs.funPrice} onChange={e => handleInputChange('funPrice', e.target.value)} />
                    </div>
                  </div>
                  <button className="btn btn-prime" onClick={runFunnelBuilder} style={{ width: '100%', justifyContent: 'center' }}>
                    🔄 {L('Build My Sales Funnel', 'أعد مسار المبيعات الخاص بي')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div class="sec-title">{L('Funnel Structure', 'هيكل المسار')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['funnel-out'] ? L('Building funnel structure...', 'جاري بناء هيكل المسار...') : (outputs['funnel-out'] || L('Complete funnel steps and trigger maps.', 'مراحل رحلة العميل وخريطة رسائل البريد الإلكتروني التلقائية.'))}
                </div>
              </div>
            </div>
          )}

          {funTab === 'magnet' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div class="sec-title">🧲 {L('Lead Magnet Builder', 'منشئ مغناطيس العملاء')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Your Main Product', 'منتجك الأساسي')}</label>
                    <input className="inp" placeholder="Coaching program..." value={inputs.magnetProduct} onChange={e => handleInputChange('magnetProduct', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Audience Pain Point', 'نقطة ألم الجمهور')}</label>
                    <input className="inp" placeholder="Can't get consistent clients..." value={inputs.magnetPain} onChange={e => handleInputChange('magnetPain', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Lead Magnet Format', 'صيغة المغناطيس')}</label>
                    <select className="inp" value={inputs.magnetFormat} onChange={e => handleInputChange('magnetFormat', e.target.value)}>
                      <option>Free PDF / Guide</option><option>Free Mini Course</option><option>Free Webinar</option><option>Free Consultation</option>
                    </select>
                  </div>
                  <button className="btn btn-prime" onClick={runLeadMagnet} style={{ width: '100%', justifyContent: 'center' }}>
                    🧲 {L('Build Lead Magnet', 'صمّم مغناطيس العملاء')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div class="sec-title">{L('Lead Magnet Plan', 'خطة مغناطيس العملاء')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['magnet-out'] ? L('Building magnet plan...', 'جاري التخطيط...') : (outputs['magnet-out'] || L('Title ideas, structural outline, and followup sequence.', 'مخطط الهيكل، مقترح العنوان، وسلسلة رسائل المتابعة.'))}
                </div>
              </div>
            </div>
          )}

          {funTab === 'lp' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div class="sec-title">⚡ {L('Landing Page Planner', 'مخطط صفحة الهبوط')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Offer / Product', 'العرض / المنتج')}</label>
                    <input className="inp" placeholder="What is the page selling?" value={inputs.lpPlanProduct} onChange={e => handleInputChange('lpPlanProduct', e.target.value)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Visitor Awareness', 'مستوى وعي الزائر')}</label>
                      <select className="inp" value={inputs.lpPlanAware} onChange={e => handleInputChange('lpPlanAware', e.target.value)}>
                        <option>Cold (never heard of you)</option><option>Warm (knows your content)</option><option>Hot (ready to buy)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Page Goal', 'هدف الصفحة')}</label>
                      <select className="inp" value={inputs.lpPlanGoal} onChange={e => handleInputChange('lpPlanGoal', e.target.value)}>
                        <option>Collect leads</option><option>Book a call</option><option>Direct purchase</option>
                      </select>
                    </div>
                  </div>
                  <button className="btn btn-prime" onClick={runLandingPagePlan} style={{ width: '100%', justifyContent: 'center' }}>
                    ⚡ {L('Plan My Landing Page', 'خطط لصفحة الهبوط')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div class="sec-title">{L('Landing Page Blueprint', 'هيكل صفحة الهبوط')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['lp-plan-out'] ? L('Planning landing page...', 'جاري التخطيط...') : (outputs['lp-plan-out'] || L('Section-by-section blueprint with copy templates.', 'توزيع الأقسام ونصوص الإقناع المقترحة.'))}
                </div>
              </div>
            </div>
          )}

          {funTab === 'conv' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div class="sec-title">📈 {L('Conversion Optimizer', 'مُحسن معدلات التحويل')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Describe your current funnel', 'صف مسار المبيعات الحالي الخاص بك')}</label>
                    <textarea className="inp" rows="3" placeholder="Traffic from Instagram → landing page → DM → call → close..." value={inputs.convFunnel} onChange={e => handleInputChange('convFunnel', e.target.value)}></textarea>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Where do people drop off?', 'أين يتوقف الناس في الغالب؟')}</label>
                      <input className="inp" placeholder="Most people don't book..." value={inputs.convDropoff} onChange={e => handleInputChange('convDropoff', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Current conversion rate', 'معدل التحويل الحالي')}</label>
                      <input className="inp" placeholder="2% of leads become clients..." value={inputs.convRate} onChange={e => handleInputChange('convRate', e.target.value)} />
                    </div>
                  </div>
                  <button className="btn btn-prime" onClick={runConversionOptimizer} style={{ width: '100%', justifyContent: 'center' }}>
                    📈 {L('Optimize My Conversions', 'حسن معدلات التحويل')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div class="sec-title">{L('Conversion Analysis', 'تحليل معدلات التحويل')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['conv-out'] ? L('Analyzing conversions...', 'جاري التحليل...') : (outputs['conv-out'] || L('Identify bottlenecks and get optimization ideas.', 'تحديد نقاط التسريب والاختناقات في مسار البيع.'))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 7: ANALYTICS ── */}
      {activeTab === 'analytics' && (
        <div className="mkt-section on">
          <div className="tabs-bar" style={{ marginBottom: '14px' }}>
            {['kpi', 'rev', 'leads', 'roi'].map(sub => (
              <button
                key={sub}
                className={`tab-btn ${analTab === sub ? 'on' : ''}`}
                onClick={() => setAnalTab(sub)}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                {sub === 'kpi' && `📊 ${L('KPIs', 'المؤشرات')}`}
                {sub === 'rev' && `💰 ${L('Revenue Forecast', 'توقعات الأرباح')}`}
                {sub === 'leads' && `👥 ${L('Lead Forecast', 'توقعات العملاء')}`}
                {sub === 'roi' && `📈 ROI`}
              </button>
            ))}
          </div>

          {analTab === 'kpi' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div class="sec-title">📊 {L('KPI Planner', 'مخطط مؤشرات الأداء')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Business Model', 'نموذج العمل')}</label>
                    <select className="inp" value={inputs.kpiModel} onChange={e => handleInputChange('kpiModel', e.target.value)}>
                      <option>Coaching / Services</option><option>Online Courses</option><option>E-commerce</option><option>SaaS / App</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Monthly Revenue Goal', 'هدف الإيرادات الشهري')}</label>
                      <input className="inp" placeholder="$10,000" value={inputs.kpiTarget} onChange={e => handleInputChange('kpiTarget', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Current Stage', 'المرحلة الحالية')}</label>
                      <select className="inp" value={inputs.kpiStage} onChange={e => handleInputChange('kpiStage', e.target.value)}>
                        <option>Just starting</option><option>0-$3K/month</option><option>$3K-$10K/month</option><option>$10K+/month</option>
                      </select>
                    </div>
                  </div>
                  <button className="btn btn-prime" onClick={runKPIPlanner} style={{ width: '100%', justifyContent: 'center' }}>
                    📊 {L('Build My KPI Dashboard', 'أعد لوحة مؤشرات الأداء')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div class="sec-title">{L('Your KPIs', 'مؤشرات الأداء الخاصة بك')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['kpi-out'] ? L('Building KPIs...', 'جاري إعداد المؤشرات...') : (outputs['kpi-out'] || L('Define metrics to track daily, weekly, and monthly.', 'المؤشرات الأساسية للمتابعة اليومية والأسبوعية.'))}
                </div>
              </div>
            </div>
          )}

          {analTab === 'rev' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div class="sec-title">💰 {L('Revenue Forecast', 'توقعات الأرباح')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Average Sale Value', 'متوسط قيمة الصفقة')}</label>
                      <input className="inp" placeholder="$2,000" value={inputs.revAov} onChange={e => handleInputChange('revAov', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Monthly Leads', 'العملاء المحتملون شهرياً')}</label>
                      <input className="inp" placeholder="50 leads" value={inputs.revLeads} onChange={e => handleInputChange('revLeads', e.target.value)} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Current Close Rate', 'معدل الإغلاق الحالي')}</label>
                      <input className="inp" placeholder="20%" value={inputs.revClose} onChange={e => handleInputChange('revClose', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Growth Plan', 'خطة النمو')}</label>
                      <select className="inp" value={inputs.revGrowth} onChange={e => handleInputChange('revGrowth', e.target.value)}>
                        <option>Organic only</option><option>Organic + ads</option><option>Ads focus</option>
                      </select>
                    </div>
                  </div>
                  <button className="btn btn-prime" onClick={runRevenueForecast} style={{ width: '100%', justifyContent: 'center' }}>
                    💰 {L('Generate Revenue Forecast', 'ولّد توقعات الإيرادات')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div class="sec-title">{L('Revenue Projections', 'التوقعات المالية')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['rev-forecast-out'] ? L('Forecasting revenue...', 'جاري الاحتساب...') : (outputs['rev-forecast-out'] || L('30, 60, 90 day projections under different scenarios.', 'النمذجة المالية وتوقعات ٣٠ و ٦٠ و ٩٠ يوماً.'))}
                </div>
              </div>
            </div>
          )}

          {analTab === 'leads' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div class="sec-title">👥 {L('Lead Forecast', 'توقعات العملاء المحتملين')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Current Audience Size', 'حجم الجمهور الحالي')}</label>
                    <input className="inp" placeholder="10,000 followers" value={inputs.leadAud} onChange={e => handleInputChange('leadAud', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Lead Gen Method', 'طريقة جمع العملاء')}</label>
                    <select className="inp" value={inputs.leadMethod} onChange={e => handleInputChange('leadMethod', e.target.value)}>
                      <option>Organic content + DM</option><option>Lead magnet + email</option><option>Paid ads</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Lead Goal (monthly)', 'هدف العملاء المحتملين شهرياً')}</label>
                    <input className="inp" placeholder="100 leads" value={inputs.leadGoal} onChange={e => handleInputChange('leadGoal', e.target.value)} />
                  </div>
                  <button className="btn btn-prime" onClick={runLeadForecast} style={{ width: '100%', justifyContent: 'center' }}>
                    👥 {L('Forecast My Leads', 'توقع أعداد عملائي')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div class="sec-title">{L('Lead Projections', 'توقعات نمو العملاء')}</div></div>
                <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                  {loading['lead-forecast-out'] ? L('Forecasting leads...', 'جاري الاحتساب...') : (outputs['lead-forecast-out'] || L('Monthly lead projections and traffic required.', 'تقدير حركة الزيارات المطلوبة للوصول لأهداف العملاء.'))}
                </div>
              </div>
            </div>
          )}

          {analTab === 'roi' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div class="sec-title">📈 {L('ROI Calculator', 'حاسبة عائد الاستثمار')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Monthly Ad Spend', 'الإنفاق الإعلاني الشهري')}</label>
                      <input className="inp" placeholder="$1,000" value={inputs.roiSpend} onChange={e => handleInputChange('roiSpend', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Leads Generated', 'العملاء المحتملون الناتجون')}</label>
                      <input className="inp" placeholder="40" value={inputs.roiLeads} onChange={e => handleInputChange('roiLeads', e.target.value)} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Clients Closed', 'العملاء المغلقون')}</label>
                      <input className="inp" placeholder="8" value={inputs.roiClosed} onChange={e => handleInputChange('roiClosed', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Revenue Per Client', 'قيمة العميل الواحد')}</label>
                      <input className="inp" placeholder="$2,000" value={inputs.roiRev} onChange={e => handleInputChange('roiRev', e.target.value)} />
                    </div>
                  </div>
                  <button className="btn btn-prime" onClick={runROICalculator} style={{ width: '100%', justifyContent: 'center' }}>
                    📈 {L('Calculate ROI', 'احسب عائد الاستثمار')}
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="sec-hd"><div class="sec-title">{L('ROI Analysis', 'تحليل العائد')}</div></div>
                <div className="ai-box" dangerouslySetInnerHTML={{ __html: outputs['roi-out'] || L('Fill in details and calculate.', 'أدخل البيانات واضغط للحساب.') }}>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 8: AI CONSULTANT ── */}
      {activeTab === 'ai' && (
        <div className="mkt-section on">
          <div className="g4 stagger" style={{ marginBottom: '14px' }}>
            <div className="stat-card">
              <div className="stat-lbl">📣 {L('Active Campaigns', 'الحملات النشطة')}</div>
              <div className="stat-val" style={{ color: 'var(--a)' }}>1</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">👥 {L('Leads in CRM', 'العملاء بالـ CRM')}</div>
              <div className="stat-val">{GC.crm.leads.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">💰 {L('Monthly Revenue', 'الإيراد الشهري')}</div>
              <div className="stat-val" style={{ color: 'var(--green)' }}>
                {formatMoney(GC.finance.entries.filter(e => e.type === 'income').reduce((a, b) => a + b.amount, 0))}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">✦ {L('AI Assistant', 'مستشار AI')}</div>
              <div className="stat-val" style={{ color: 'var(--green)' }}>{L('Online', 'متصل')}</div>
            </div>
          </div>
          <div className="g2">
            <div className="card">
              <div className="sec-hd"><div class="sec-title">✦ {L('Ask Marketing AI', 'اسأل مستشار التسويق AI')}</div></div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--t2)', marginBottom: '8px' }}>{L('Quick Questions:', 'أسئلة سريعة:')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      className="ai-qa-btn"
                      style={{ textAlign: 'left', padding: '8px 12px', border: '1px solid var(--edge)', borderRadius: '8px', cursor: 'pointer', background: 'var(--glass)' }}
                      onClick={() => runMktAI(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '7px' }}>
                <input
                  className="inp"
                  placeholder={L('Ask anything about your marketing...', 'اسأل أي شيء حول تسويق بزنسك...')}
                  style={{ flex: 1 }}
                  value={inputs.aiInp}
                  onChange={e => handleInputChange('aiInp', e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') runMktAI();
                  }}
                />
                <button className="btn btn-prime" onClick={() => runMktAI()}>➤</button>
              </div>
            </div>
            <div className="card">
              <div className="sec-hd"><div class="sec-title">{L('AI Response', 'إجابة مستشار الذكاء الاصطناعي')}</div></div>
              <div className="ai-box" style={{ whiteSpace: 'pre-line' }}>
                {loading['ai-out'] ? L('Thinking...', 'جاري التفكير...') : (outputs['ai-out'] || L('Your AI response will show here.', 'ستظهر إجابة الذكاء الاصطناعي هنا.'))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
