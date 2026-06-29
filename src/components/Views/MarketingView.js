'use client';

import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';

export default function MarketingView() {
  const { lang, L, t, GC, saveGC, formatMoney } = useBusiness();
  const [activeTab, setActiveTab] = useState('research');

  const [competitorsCount, setCompetitorsCount] = useState(0);
  const [audienceCount, setAudienceCount] = useState(0);
  const [trendsCount, setTrendsCount] = useState(0);
  const [personasCount, setPersonasCount] = useState(0);

  const [savedReports, setSavedReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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

    // One-Click Campaign Launcher
    launchName: '', launchProduct: '', launchAudience: '', launchGoal: 'Sales / Conversions',

    // AI Consultant
    aiInp: ''
  });

  // Sync state from Firebase GC.marketing when GC changes
  React.useEffect(() => {
    if (GC?.marketing) {
      const m = GC.marketing;
      if (m.counts) {
        setCompetitorsCount(m.counts.competitors || 0);
        setAudienceCount(m.counts.audience || 0);
        setTrendsCount(m.counts.trends || 0);
        setPersonasCount(m.counts.personas || 0);
      }
      if (m.outputs) {
        setOutputs(m.outputs);
      }
      if (m.savedReports) {
        setSavedReports(m.savedReports);
      }
      if (m.inputs) {
        setInputs(prev => ({ ...prev, ...m.inputs }));
      }
    }
  }, [GC]);

  const handleInputChange = (key, value) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const saveAllProgress = () => {
    const updatedGC = {
      ...GC,
      marketing: {
        ...(GC?.marketing || {}),
        inputs: inputs,
        outputs: outputs,
        counts: {
          competitors: competitorsCount,
          audience: audienceCount,
          trends: trendsCount,
          personas: personasCount
        },
        savedReports: savedReports
      }
    };
    saveGC(updatedGC);
    const toast = document.getElementById('toast');
    if (toast) {
      toast.innerText = L('Progress saved successfully!', 'تم حفظ التقدم بنجاح!');
      toast.className = 'toast show';
      setTimeout(() => { toast.className = 'toast'; }, 3000);
    }
  };

  const handleSaveToLibrary = (category, content) => {
    if (!content) return;
    const defaultTitle = `${category} - ${new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}`;
    const title = prompt(
      L('Enter a title for this report:', 'أدخل عنواناً لهذا التقرير:'),
      defaultTitle
    );
    if (title === null) return;
    const finalTitle = title.trim() || defaultTitle;
    const newReport = {
      id: 'rep_' + Date.now(),
      title: finalTitle,
      category: category,
      content: content,
      date: new Date().toISOString()
    };
    const updatedReports = [newReport, ...savedReports];
    setSavedReports(updatedReports);
    
    const updatedGC = {
      ...GC,
      marketing: {
        ...(GC?.marketing || {}),
        savedReports: updatedReports
      }
    };
    saveGC(updatedGC);
    
    const toast = document.getElementById('toast');
    if (toast) {
      toast.innerText = L('Report saved to library!', 'تم حفظ التقرير في المكتبة!');
      toast.className = 'toast show';
      setTimeout(() => { toast.className = 'toast'; }, 3000);
    }
  };

  const handleDeleteReport = (id) => {
    if (!confirm(L('Are you sure you want to delete this report?', 'هل أنت متأكد من حذف هذا التقرير؟'))) return;
    const updated = savedReports.filter(r => r.id !== id);
    setSavedReports(updated);
    if (selectedReportId === id) setSelectedReportId(null);
    
    const updatedGC = {
      ...GC,
      marketing: {
        ...(GC?.marketing || {}),
        savedReports: updated
      }
    };
    saveGC(updatedGC);
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    const toast = document.getElementById('toast');
    if (toast) {
      toast.innerText = L('Copied to clipboard!', 'تم النسخ إلى الحافظة!');
      toast.className = 'toast show';
      setTimeout(() => { toast.className = 'toast'; }, 3000);
    }
  };

  const renderResultCard = (titleAr, titleEn, outputId, loadingMsgAr, loadingMsgEn, placeholderAr, placeholderEn, category) => {
    const title = L(titleEn, titleAr);
    const loadingMsg = L(loadingMsgEn, loadingMsgAr);
    const placeholder = L(placeholderEn, placeholderAr);
    const content = outputs[outputId];
    const isLoading = loading[outputId];

    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="sec-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="sec-title">{title}</div>
          {content && !isLoading && (
            <button 
              className="btn btn-sm btn-ghost"
              onClick={() => handleSaveToLibrary(category, content)}
              style={{ fontSize: '11px', padding: '4px 8px' }}
            >
              💾 {L('Save to Library', 'حفظ للمكتبة')}
            </button>
          )}
        </div>
        <div className="ai-box" style={{ whiteSpace: 'pre-line', flex: 1 }}>
          {isLoading ? loadingMsg : (content || placeholder)}
        </div>
      </div>
    );
  };

  const triggerAI = async (toolKey, outputId, promptText, systemText, extraCounts = {}) => {
    setLoading(prev => ({ ...prev, [outputId]: true }));
    try {
      const response = await callClaudeAPI(promptText, systemText, lang, GC);
      
      // Update local state cleanly (pure function)
      setOutputs(prev => ({ ...prev, [outputId]: response }));

      // Save to Firebase/GC outside the state update callback
      const nextOutputs = { ...outputs, [outputId]: response };
      const currentCounts = {
        competitors: competitorsCount,
        audience: audienceCount,
        trends: trendsCount,
        personas: personasCount,
        ...extraCounts
      };

      const updatedGC = {
        ...GC,
        marketing: {
          ...(GC?.marketing || {}),
          inputs: inputs,
          outputs: nextOutputs,
          counts: currentCounts
        }
      };
      saveGC(updatedGC);
    } catch (err) {
      setOutputs(prev => ({ ...prev, [outputId]: L('Error generating report. Please try again.', 'حدث خطأ أثناء التوليد. يرجى المحاولة مرة أخرى.') }));
    }
    setLoading(prev => ({ ...prev, [outputId]: false }));
  };

  // ── 1. RESEARCH SUB-ACTIONS ──
  const runCompetitorFinder = () => {
    const prompt = `Find and analyze competitors for: Niche: "${inputs.compNiche}", Country: "${inputs.compCountry}", Product Type: "${inputs.compType}". Identify 3-4 competitor brands or types of businesses, pricing, positioning and gaps we can exploit.`;
    const system = `You are an expert market analyst. Provide direct actionable findings.`;
    const nextCount = competitorsCount + 1;
    setCompetitorsCount(nextCount);
    triggerAI('competitor-finder', 'comp-out', prompt, system, { competitors: nextCount });
  };

  const runCompetitorAds = () => {
    const prompt = `Research competitor ads for "${inputs.compAdsName}" on platform "${inputs.compAdsPlatform}". Outline winning hooks, ad copy angles, creative formats, and conversion strategies.`;
    const system = `You are a PPC & Ad Intelligence specialist.`;
    triggerAI('competitor-ads', 'comp-ads-out', prompt, system);
  };

  const runAudienceResearch = () => {
    const prompt = `Research target audience: Customer description: "${inputs.audDesc}", Core problem solved: "${inputs.audProblem}". Outline demographic details, psychological traits, 5 biggest pain points, desires, buying triggers, and objections.`;
    const system = `You are a customer psychologist.`;
    const nextCount = audienceCount + 1;
    setAudienceCount(nextCount);
    triggerAI('audience-research', 'aud-out', prompt, system, { audience: nextCount });
  };

  const runBuyerPersona = () => {
    const prompt = `Build detailed Buyer Personas for: Product "${inputs.personaProduct}", Target market: "${inputs.personaMarket}", Age range: "${inputs.personaAge}", Gender: "${inputs.personaGender}". Provide profile name, background, goals, struggles, and buying triggers.`;
    const system = `You are a master brand strategist.`;
    const nextCount = personasCount + 1;
    setPersonasCount(nextCount);
    triggerAI('buyer-persona', 'persona-out', prompt, system, { personas: nextCount });
  };

  const runTrendDiscovery = () => {
    const prompt = `Discover current trends in niche: "${inputs.trendNiche}", Region: "${inputs.trendRegion}", Trend Type: "${inputs.trendType}". Highlight 3 rising trends, viral content formats, and immediate marketing opportunities.`;
    const system = `You are a viral trend analyst.`;
    const nextCount = trendsCount + 1;
    setTrendsCount(nextCount);
    triggerAI('trends', 'trends-out', prompt, system, { trends: nextCount });
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

  const runCampaignLauncher = () => {
    const prompt = `Create a complete marketing campaign launcher bundle for the campaign: "${inputs.launchName}".
Product/Service to promote: "${inputs.launchProduct}"
Target Audience: "${inputs.launchAudience}"
Campaign Goal: "${inputs.launchGoal}"

Provide a comprehensive and highly cohesive launch bundle structured exactly as follows:
1. TARGET AUDIENCE & ICP PROFILE: A detailed breakdown of our ideal customer profile, their psychographics, and top 3 purchase triggers.
2. AD HOOKS CATALOG: 3 viral hook options customized for this product.
3. AD COPY BUNDLE:
   - Meta Ads (Facebook/Instagram) Primary Text & Headlines
   - TikTok Video script concept (with visual guidelines)
   - Google Search Ads Headlines (3 variations)
4. FOLLOW-UP SEQUENCE: A 3-step sequence of Telegram or Email outreach templates designed to convert leads into sales.`;

    const system = `You are a growth marketing architect. Provide highly detailed, directly copy-pasteable marketing materials and copy.`;
    triggerAI('campaign-launcher', 'launcher-out', prompt, system);
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
        {['research', 'strategy', 'offers', 'ads', 'content', 'funnels', 'analytics', 'saved', 'ai'].map(tab => (
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
            {tab === 'saved' && `💾 ${L('Saved Reports', 'التقارير المحفوظة')}`}
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
              {renderResultCard('النتائج', 'Results', 'comp-out', 'جاري البحث عن المنافسين...', 'Scanning competitors...', 'ابحث عن المنافسين واستراتيجيات التسعير والتموضع.', 'Find competitor lists, pricing strategies, and marketing positioning.', 'Competitor Finder')}
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
              {renderResultCard('ذكاء الإعلانات', 'Ad Intelligence', 'comp-ads-out', 'جاري تحليل الإعلانات...', 'Analyzing ads...', 'اكتشف الخطافات والإعلانات والاستراتيجيات.', 'Discover hooks, creatives, and strategies.', 'Competitor Ads Research')}
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
              {renderResultCard('رؤى الجمهور', 'Audience Intelligence', 'aud-out', 'جاري تحليل الجمهور...', 'Analyzing audience...', 'الديموغرافيا المستهدفة والاعتراضات ومحفزات الشراء.', 'Target demographics, objections, and buying triggers.', 'Audience Research')}
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
              {renderResultCard('شخصية المشتري', 'Buyer Persona', 'persona-out', 'جاري بناء شخصية المشتري...', 'Building buyer personas...', 'الملف الكامل لشخصية المشتري الخاصة بك.', 'Complete profile of your buyer persona.', 'Buyer Persona Builder')}
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
              {renderResultCard('تقرير الاتجاهات', 'Trend Report', 'trends-out', 'جاري مسح الترندات...', 'Scanning trends...', 'اكتشف الموضوعات والصيغ الرائجة.', 'Discover what topics and formats are trending.', 'Trend Discovery')}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: STRATEGY ── */}
      {activeTab === 'strategy' && (
        <div className="mkt-section on">
          <div className="tabs-bar" style={{ marginBottom: '14px' }}>
            {['plan', 'launch', 'roadmap', 'swot', 'launcher'].map(sub => (
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
                {sub === 'launcher' && `⚡ ${L('Campaign Launcher', 'مطلق الحملات السريع')}`}
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
              {renderResultCard('استراتيجيتك التسويقية', 'Your Marketing Strategy', 'strat-plan-out', 'جاري بناء الاستراتيجية...', 'Building strategy...', 'استراتيجية كاملة للقنوات الإعلانية، الميزانية، والجدول الزمني.', 'Complete marketing channels, timelines, and budgets blueprint.', 'Marketing Strategy')}
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
              {renderResultCard('خطة الإطلاق', 'Your Launch Plan', 'launch-out', 'جاري التخطيط للإطلاق...', 'Planning launch...', 'المهام الأسبوعية واستراتيجية الترويج للإطلاق.', 'Week-by-week checklist and promotional strategy.', 'Launch Planner')}
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
                      <option>Instagram</option>
                      <option>TikTok</option>
                      <option>Facebook</option>
                      <option>LinkedIn</option>
                      <option>YouTube</option>
                      <option>Paid Ads</option>
                    </select>
                  </div>
                  <button className="btn btn-prime" onClick={runGrowthRoadmap} style={{ width: '100%', justifyContent: 'center' }}>
                    🗺️ {L('Build Growth Roadmap', 'أعد خارطة طريق النمو')}
                  </button>
                </div>
              </div>
              {renderResultCard('خارطة طريق النمو', 'Your Growth Roadmap', 'rm-out', 'جاري بناء خارطة الطريق...', 'Building roadmap...', 'المعالم الأسبوعية لخارطة طريق النمو لمدة ٩٠ يوماً.', '90-day execution milestones and weekly tasks.', 'Growth Roadmap')}
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
                  <div style={{ background: 'var(--red-d)', border: '1px solid rgba(255,61,110,.2)', borderRadius: '10px', padding: '11px' }}>
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
              {renderResultCard('رؤى SWOT', 'SWOT Insights', 'swot-out', 'جاري تحليل SWOT...', 'Analyzing SWOT...', 'توصيات استراتيجية بناءً على مصفوفة SWOT.', 'AI generated SWOT takeaways.', 'SWOT Analysis')}
            </div>
          )}

          {stratTab === 'launcher' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div className="sec-title">⚡ {L('One-Click Campaign Launcher', 'مُطلق الحملات التسويقية السريع')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Campaign Name', 'اسم الحملة')}</label>
                    <input className="inp" placeholder="e.g. Summer Special 2026" value={inputs.launchName} onChange={e => handleInputChange('launchName', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Product / Service Name', 'اسم المنتج أو الخدمة')}</label>
                    <input className="inp" placeholder="e.g. 1-on-1 Fitness Transformation" value={inputs.launchProduct} onChange={e => handleInputChange('launchProduct', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Target Audience', 'الجمهور المستهدف بالتفصيل')}</label>
                    <textarea className="inp" rows="2" placeholder="e.g. Busy professionals aged 30-45 wanting to lose weight..." value={inputs.launchAudience} onChange={e => handleInputChange('launchAudience', e.target.value)}></textarea>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Campaign Primary Goal', 'الهدف الأساسي للحملة')}</label>
                    <select className="inp" value={inputs.launchGoal} onChange={e => handleInputChange('launchGoal', e.target.value)}>
                      <option>Sales / Conversions</option><option>Lead Generation</option><option>Brand Awareness</option><option>Webinar Attendees</option>
                    </select>
                  </div>
                  <button className="btn btn-prime" onClick={runCampaignLauncher} style={{ width: '100%', justifyContent: 'center' }}>
                    ⚡ {L('Generate Complete Campaign Bundle', 'ولّد حزمة الحملة المتكاملة')}
                  </button>
                </div>
              </div>
              {renderResultCard('مخرجات حزمة الحملة', 'Campaign Bundle Output', 'launcher-out', 'جاري توليد حزمة الحملة...', 'Generating campaign bundle...', 'قم بتوليد تفاصيل العميل، نصوص الإعلانات، والرسائل التتبعية بضغطة زر واحدة.', 'Generate your ICP details, ad hooks, copy, and follow-up templates in one go.', 'Campaign Launcher')}
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
              {renderResultCard('هيكل العرض الخاص بك', 'Your Offer Structure', 'offer-out', 'جاري بناء العرض...', 'Building offer...', 'مكونات العرض، البونصات المرفقة، الضمان وعوامل الاستعجال.', 'Complete offer framework with core, bonuses, guarantee, and urgency.', 'Offer Builder')}
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
              {renderResultCard('استراتيجية التسعير', 'Pricing Strategy', 'pricing-out', 'جاري تحسين الأسعار...', 'Optimizing prices...', 'توزيع الباقات والأسعار النفسية المقترحة.', 'Tiered pricing tiers and psychology logic.', 'Pricing Optimizer')}
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
              {renderResultCard('استراتيجية البيع الإضافي', 'Upsell Strategy', 'upsell-out', 'جاري بناء سلم البيع الإضافي...', 'Building upsell ladder...', 'العروض المضافة وخيارات ترقية الشراء.', 'Order bump, one-click upsell, and high-ticket options.', 'Upsell Builder')}
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
              {renderResultCard('هيكل الحملة', 'Campaign Structure', 'meta-out', 'جاري بناء الحملة...', 'Building Meta campaign...', 'الجمهور المستهدف والمجموعات الإعلانية المقترحة.', 'Campaign structure, ad sets, and optimization settings.', 'Meta Ads Planner')}
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
              {renderResultCard('خطة حملة Google', 'Google Campaign Plan', 'google-out', 'جاري بناء حملة Google...', 'Building Google campaign...', 'الكلمات المفتاحية المستهدفة، استراتيجية المزايدة ونصوص الإعلانات.', 'Keywords, bid strategy, and responsive search ads drafts.', 'Google Ads Planner')}
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
              {renderResultCard('خطة حملة TikTok', 'TikTok Campaign Plan', 'tiktok-out', 'جاري بناء حملة TikTok...', 'Building TikTok campaign...', 'أفكار الفيديوهات الإبداعية، استهداف الجمهور وإعداد الحملة.', 'TikTok video hooks, UGC brief, and ad setups.', 'TikTok Ads Planner')}
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
              {renderResultCard('النصوص المولّدة', 'Generated Ad Copy', 'copy-out', 'جاري توليد النصوص...', 'Generating copy...', '٥ نماذج تسويقية من نصوص الإعلانات والخطافات.', '5 variations of hooks, primary text, and CTAs.', 'Ad Copy Generator')}
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
                      <option>Problem-based ("If you\'re struggling with...")</option><option>Curiosity ("What nobody tells you about...")</option><option>Results ("How I made $X in Y days")</option>
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
              {renderResultCard('مخطط الإبداع', 'Creative Brief', 'creative-out', 'جاري التوليد...', 'Generating brief...', 'دليل المشاهد البصرية، الحوار، وإرشادات التصوير.', 'Complete visual guide, script and UGC briefing.', 'Creative Brief')}
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
              {renderResultCard('خطة توزيع الميزانية', 'Budget Allocation Plan', 'budget-out', 'جاري التخطيط...', 'Planning budget...', 'توزيع الميزانية وتكلفة الاستحواذ المقدرة.', 'Budget allocation and expected acquisition costs.', 'Budget Planner')}
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
              {renderResultCard('خطة المحتوى الخاصة بك', 'Your Content Plan', 'plan-out', 'جاري توليد خطة المحتوى...', 'Generating content plan...', 'جدول نشر لـ ٣٠ يوماً مع الخطافات والدعوات لإجراء.', '30-day content calendar with topics, formats, and CTAs.', 'Content Planner')}
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
              {renderResultCard('الخطافات المولّدة', 'Generated Hooks', 'hooks-out', 'جاري التوليد...', 'Generating hooks...', 'جمل افتتاحية تخطف انتباه المشاهد فوراً.', 'Stop-the-scroll opening lines that grab attention.', 'Viral Hooks')}
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
              {renderResultCard('أفكار المحتوى', 'Content Ideas', 'ideas-out', 'جاري التوليد...', 'Generating ideas...', 'أفكار تسويقية مميزة للفيديو والمنشورات.', '30 creative video and carousel ideas.', 'Content Ideas')}
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
              {renderResultCard('ذكاء محتوى المنافسين', 'Competitor Content Intelligence', 'comp-content-out', 'جاري تحليل المحتوى...', 'Analyzing content...', 'اكتشف أفضل صيغ المنشورات والموضوعات والفرص المتاحة لديهم.', 'Discover what topics and formats are winning for them.', 'Competitor Content')}
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
              {renderResultCard('هيكل المسار', 'Funnel Structure', 'funnel-out', 'جاري بناء هيكل المسار...', 'Building funnel structure...', 'مراحل رحلة العميل وخريطة رسائل البريد الإلكتروني التلقائية.', 'Complete funnel steps and trigger maps.', 'Funnel Builder')}
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
              {renderResultCard('خطة مغناطيس العملاء', 'Lead Magnet Plan', 'magnet-out', 'جاري التخطيط...', 'Building magnet plan...', 'مخطط الهيكل، مقترح العنوان، وسلسلة رسائل المتابعة.', 'Title ideas, structural outline, and followup sequence.', 'Lead Magnet')}
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
              {renderResultCard('هيكل صفحة الهبوط', 'Landing Page Blueprint', 'lp-plan-out', 'جاري التخطيط...', 'Planning landing page...', 'توزيع الأقسام ونصوص الإقناع المقترحة.', 'Section-by-section blueprint with copy templates.', 'Landing Page Blueprint')}
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
              {renderResultCard('تحليل معدلات التحويل', 'Conversion Analysis', 'conv-out', 'جاري التحليل...', 'Analyzing conversions...', 'تحديد نقاط التسريب والاختناقات في مسار البيع.', 'Identify bottlenecks and get optimization ideas.', 'Conversion Optimizer')}
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
              {renderResultCard('مؤشرات الأداء الخاصة بك', 'Your KPIs', 'kpi-out', 'جاري إعداد المؤشرات...', 'Building KPIs...', 'المؤشرات الأساسية للمتابعة اليومية والأسبوعية.', 'Define metrics to track daily, weekly, and monthly.', 'KPI Planner')}
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
              {renderResultCard('التوقعات المالية', 'Revenue Projections', 'rev-forecast-out', 'جاري الاحتساب...', 'Forecasting revenue...', 'النمذجة المالية وتوقعات ٣٠ و ٦٠ و ٩٠ يوماً.', '30, 60, 90 day projections under different scenarios.', 'Revenue Forecast')}
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
              {renderResultCard('توقعات نمو العملاء', 'Lead Projections', 'lead-forecast-out', 'جاري الاحتساب...', 'Forecasting leads...', 'تقدير حركة الزيارات المطلوبة للوصول لأهداف العملاء.', 'Monthly lead projections and traffic required.', 'Lead Forecast')}
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

      {/* ── TAB 9: SAVED REPORTS ── */}
      {activeTab === 'saved' && (
        <div className="mkt-section on">
          <div className="card" style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                className="inp"
                placeholder={L('Search saved reports...', 'ابحث في التقارير المحفوظة...')}
                style={{ flex: 1 }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="btn btn-ghost" onClick={() => setSearchTerm('')}>
                  {L('Clear', 'مسح')}
                </button>
              )}
            </div>
          </div>

          {savedReports.length === 0 ? (
            <div className="empty-state card" style={{ padding: '40px 0', textAlign: 'center' }}>
              <div className="es-icon" style={{ fontSize: '40px', marginBottom: '10px' }}>💾</div>
              <div className="es-title" style={{ fontSize: '18px', fontWeight: 600, color: 'var(--t1)', marginBottom: '6px' }}>
                {L('No saved reports yet', 'لا توجد تقارير محفوظة بعد')}
              </div>
              <div className="es-sub" style={{ fontSize: '13px', color: 'var(--t3)', maxWidth: '400px', margin: '0 auto 14px' }}>
                {L('Generate any analysis in the other tabs and click "Save to Library" to keep it here.', 'قم بتوليد أي تحليل في التبويبات الأخرى واضغط على "حفظ للمكتبة" لحفظها هنا.')}
              </div>
            </div>
          ) : (
            <div className="g2">
              {/* Reports List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '600px', overflowY: 'auto' }}>
                {savedReports
                  .filter(r => 
                    r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    r.category.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(report => {
                    const isSelected = selectedReportId === report.id;
                    return (
                      <div 
                        key={report.id}
                        className={`card ${isSelected ? 'selected-card' : ''}`}
                        onClick={() => setSelectedReportId(report.id)}
                        style={{ 
                          cursor: 'pointer', 
                          border: isSelected ? '1px solid var(--a)' : '1px solid var(--edge)',
                          background: isSelected ? 'var(--orange-dim)' : 'var(--surface)',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--t1)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                            {report.title}
                          </div>
                          <span 
                            className="badge" 
                            style={{ 
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: '1px solid rgba(108,53,255,0.3)',
                              background: 'rgba(108,53,255,0.1)',
                              color: 'var(--purple)',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {report.category}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--t3)' }}>
                          📅 {new Date(report.date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }} onClick={e => e.stopPropagation()}>
                          <button 
                            className="btn btn-ghost" 
                            style={{ fontSize: '11px', padding: '3px 8px', flex: 1 }}
                            onClick={() => setSelectedReportId(report.id)}
                          >
                            👁️ {L('View', 'عرض')}
                          </button>
                          <button 
                            className="btn btn-ghost" 
                            style={{ fontSize: '11px', padding: '3px 8px', flex: 1 }}
                            onClick={() => handleCopyText(report.content)}
                          >
                            📋 {L('Copy', 'نسخ')}
                          </button>
                          <button 
                            className="btn btn-ghost" 
                            style={{ fontSize: '11px', padding: '3px 8px', color: 'var(--red)', borderColor: 'var(--red)', flex: 1 }}
                            onClick={() => handleDeleteReport(report.id)}
                          >
                            🗑️ {L('Delete', 'حذف')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Report Detail */}
              <div>
                {selectedReportId ? (
                  (() => {
                    const report = savedReports.find(r => r.id === selectedReportId);
                    if (!report) return null;
                    return (
                      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--edge)', paddingBottom: '10px' }}>
                          <div>
                            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--t1)' }}>{report.title}</h3>
                            <div style={{ fontSize: '11.5px', color: 'var(--t3)', marginTop: '4px' }}>
                              Category: {report.category} | 📅 {new Date(report.date).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-prime" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={() => handleCopyText(report.content)}>
                              📋 {L('Copy Content', 'نسخ المحتوى')}
                            </button>
                            <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '6px 12px', color: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => handleDeleteReport(report.id)}>
                              🗑️ {L('Delete', 'حذف')}
                            </button>
                          </div>
                        </div>
                        <div className="ai-box" style={{ whiteSpace: 'pre-line', overflowY: 'auto', maxHeight: '450px', background: 'var(--surface2)', padding: '14px', borderRadius: '8px' }}>
                          {report.content}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', color: 'var(--t3)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '30px', marginBottom: '8px' }}>👁️</div>
                      <div>{L('Select a report from the list to view its contents', 'اختر تقريراً من القائمة لعرض محتوياته')}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
