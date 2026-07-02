'use client';

import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';
import { parseMarkdown } from '../../utils/markdown';

export default function MarketingView() {
  const { lang, L, t, GC, saveGC, formatMoney, confirmAction } = useBusiness();
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
    confirmAction(L('Are you sure you want to delete this report?', 'هل أنت متأكد من حذف هذا التقرير؟'), () => {
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
    });
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
        <div 
          className="ai-box" 
          style={{ flex: 1 }}
          dangerouslySetInnerHTML={{ 
            __html: isLoading ? loadingMsg : parseMarkdown(content || placeholder) 
          }}
        />
      </div>
    );
  };

  const triggerAI = async (toolKey, outputId, promptText, systemText, extraCounts = {}) => {
    setOutputs(prev => ({ ...prev, [outputId]: '' }));
    setLoading(prev => ({ ...prev, [outputId]: true }));
    let accumulated = '';
    let hasReceivedFirstChunk = false;

    try {
      const response = await callClaudeAPI(
        promptText, 
        systemText, 
        lang, 
        GC, 
        `Marketing OS - ${toolKey}`, 
        (chunk) => {
          if (!hasReceivedFirstChunk) {
            hasReceivedFirstChunk = true;
            setLoading(prev => ({ ...prev, [outputId]: false }));
          }
          accumulated += chunk;
          setOutputs(prev => ({ ...prev, [outputId]: accumulated }));
        }
      );
      
      const finalResponse = response || accumulated || L('Error generating report.', 'حدث خطأ أثناء التوليد.');
      
      setOutputs(prev => {
        const next = { ...prev, [outputId]: finalResponse };
        const updatedGC = {
          ...GC,
          marketing: {
            ...(GC?.marketing || {}),
            inputs: inputs,
            outputs: next,
            counts: {
              competitors: competitorsCount,
              audience: audienceCount,
              trends: trendsCount,
              personas: personasCount,
              ...extraCounts
            }
          }
        };
        saveGC(updatedGC);
        return next;
      });

      return finalResponse;
    } catch (err) {
      setOutputs(prev => ({ ...prev, [outputId]: L('Error generating report. Please try again.', 'حدث خطأ أثناء التوليد. يرجى المحاولة مرة أخرى.') }));
    } finally {
      setLoading(prev => ({ ...prev, [outputId]: false }));
    }
  };

  // ── 1. RESEARCH SUB-ACTIONS ──
  const runCompleteResearch = async () => {
    const icpData = GC.strategy?.icp || '';
    const roadmapData = GC.strategy?.roadmap || '';

    const compPrompt = `My business website/page: "${inputs.resWebsite}"
My Niche: "${inputs.resNiche}"
Context (ICP / Target Client): "${icpData}"
Growth Roadmap Context: "${roadmapData}"

Identify 3-4 competitor brands or similar businesses in this space. Provide their pricing, positioning, and highlight the market gaps we can exploit.`;
    const compSystem = `You are an expert market analyst. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;
    
    setOutputs(prev => ({ ...prev, 'comp-out': '', 'comp-ads-out': '', 'direction-out': '' }));
    setLoading(prev => ({ ...prev, 'comp-out': true, 'comp-ads-out': true, 'direction-out': true }));

    await triggerAI('competitor-finder', 'comp-out', compPrompt, compSystem);

    const adsPrompt = `Based on our competitors in Niche "${inputs.resNiche}" (Website/Page: "${inputs.resWebsite}"), outline winning hooks, ad copy angles, creative formats (image/video style), and conversion strategies we should use.`;
    const adsSystem = `You are a PPC & Ad Intelligence specialist. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;
    await triggerAI('competitor-ads', 'comp-ads-out', adsPrompt, adsSystem);

    const dirPrompt = `Generate a Comprehensive Marketing Directions report:
Website/Page: "${inputs.resWebsite}"
Niche: "${inputs.resNiche}"
Target Client (ICP): "${icpData}"
Current Offer: "${GC.profile?.offer?.name || ''}" (${GC.profile?.offer?.price || ''})

Perform a combined analysis merging our service details, ideal client profile, and competitor ad strategies. Provide 3 highly targeted marketing directions/angles, highlighting specific client pain points to hook them, and explain how we can position our service as the ultimate solution compared to competitors.`;
    const dirSystem = `You are a master brand and marketing strategist. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;
    await triggerAI('marketing-directions', 'direction-out', dirPrompt, dirSystem);
  };

  // ── 2. STRATEGY SUB-ACTIONS ──
  const runAutoMarketingPlan = () => {
    const bizIdea = GC.strategy?.idea_analysis || '';
    const offer = GC.profile?.offer?.name || '';
    const price = GC.profile?.offer?.price || '';
    const icp = GC.strategy?.icp || '';

    const prompt = `Create a complete marketing strategy plan based on my Strategy Lab data:
Business Idea & Niche: "${bizIdea}"
Core Offer: "${offer}" at "${price}"
Ideal Client Profile: "${icp}"

Suggest the best organic and paid marketing channels, monthly budget allocation, specific launch tactics, and a month-by-month roadmap. No manual inputs are required, this is fully customized to my profile.`;
    const system = `You are a Chief Marketing Officer. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;
    triggerAI('strategy', 'strat-plan-out', prompt, system);
  };

  const runCampaignPlanner = () => {
    const mktPlan = outputs['strat-plan-out'] || '';
    const offer = GC.profile?.offer?.name || '';
    const icp = GC.strategy?.icp || '';

    const selectedPlatforms = inputs.campaignPlatforms || [];
    const platformsStr = selectedPlatforms.join(', ') || 'Meta (Facebook/Instagram)';

    const prompt = `Based on my Marketing Plan: "${mktPlan}" (Offer: "${offer}", ICP: "${icp}").
Build a highly structured Campaign Planner. 
Target Platforms: "${platformsStr}"
Campaign Start Date: "${inputs.campaignStartDate || 'As soon as possible'}"
Campaign Budget: "${inputs.campaignBudget || 'Organic / Minimal'}"
Campaign Goal: "${inputs.campaignGoal || 'Sales / Conversions'}"

Generate the campaign structure containing:
1. Timeline & Key Milestones (starting from "${inputs.campaignStartDate || 'now'}")
2. Budget Allocation across the selected platforms: "${platformsStr}"
3. Campaign Goals & Main KPI Targets
4. Platform-Specific Copy Blueprint & Visual Hooks (tailored ONLY to the selected platforms: "${platformsStr}").`;

    const system = `You are a senior growth marketing architect. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;
    triggerAI('campaign-planner', 'launcher-out', prompt, system);
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
        </div>
      </div>

      {/* Main Tabs */}
      <div className="tabs-bar" id="mkt-tabs" style={{ marginBottom: '20px' }}>
        {['research', 'strategy', 'offers', 'funnels', 'analytics', 'saved'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'on' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'research' && `🔍 ${L('Research', 'الأبحاث')}`}
            {tab === 'strategy' && `🧭 ${L('Strategy', 'الاستراتيجية')}`}
            {tab === 'offers' && `🎁 ${L('Offers', 'العروض')}`}
            {tab === 'funnels' && `🔄 ${L('Funnels', 'المسارات')}`}
            {tab === 'analytics' && `📊 ${L('Analytics', 'التحليلات')}`}
            {tab === 'saved' && `💾 ${L('Saved Reports', 'التقارير المحفوظة')}`}
          </button>
        ))}
      </div>

      {/* ── TAB 1: RESEARCH ── */}
      {activeTab === 'research' && (
        <div className="mkt-section on">
          <div className="g2">
            <div className="card">
              <div className="sec-hd">
                <div className="sec-title">🔍 {L('Marketing Research Setup', 'إعداد أبحاث التسويق')}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Your Website / Landing Page Link', 'رابط موقعك الإلكتروني أو صفحة الهبوط')}
                  </label>
                  <input 
                    className="inp" 
                    placeholder="https://example.com" 
                    value={inputs.resWebsite || ''} 
                    onChange={e => handleInputChange('resWebsite', e.target.value)} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Brief Niche Description', 'نبذة مختصرة عن المجال')}
                  </label>
                  <textarea 
                    className="inp" 
                    rows="3" 
                    placeholder="e.g. Business coaching program for female founders..." 
                    value={inputs.resNiche || ''} 
                    onChange={e => handleInputChange('resNiche', e.target.value)} 
                  />
                </div>
                <button 
                  className="btn btn-prime" 
                  onClick={runCompleteResearch} 
                  style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
                  disabled={loading['comp-out'] || loading['comp-ads-out'] || loading['direction-out']}
                >
                  {loading['comp-out'] ? L('Generating...', 'جاري التوليد...') : `🕵️ ${L('Generate Complete Research', 'بدء الأبحاث والتحليل')}`}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="tabs-bar" style={{ marginBottom: '4px' }}>
                {['comp', 'ads', 'direction'].map(sub => (
                  <button
                    key={sub}
                    className={`tab-btn ${resTab === sub ? 'on' : ''}`}
                    onClick={() => setResTab(sub)}
                    style={{ padding: '6px 12px', fontSize: '12.5px' }}
                  >
                    {sub === 'comp' && `🕵️ ${L('Competitors', 'المنافسين')}`}
                    {sub === 'ads' && `📣 ${L('Competitor Ads', 'إعلانات المنافسين')}`}
                    {sub === 'direction' && `🧭 ${L('Marketing Directions', 'الاتجاهات التسويقية')}`}
                  </button>
                ))}
              </div>

              {resTab === 'comp' && renderResultCard(
                'المنافسين المقترحين', 'Suggested Competitors', 'comp-out',
                'جاري البحث عن المنافسين...', 'Scanning competitors...',
                'سيظهر تحليل المنافسين ومكامن الفجوات هنا.', 'Competitor list and market gaps will appear here.',
                'Competitors'
              )}

              {resTab === 'ads' && renderResultCard(
                'تحليل إعلانات المنافسين', 'Competitor Ads Analysis', 'comp-ads-out',
                'جاري تحليل إعلانات المنافسين بالـ AI...', 'Analyzing competitor ads...',
                'سيظهر تحليل زوايا الإعلانات والخطافات الإبداعية للمنافسين هنا.', 'Competitor ad angles and hooks will appear here.',
                'Competitor Ads'
              )}

              {resTab === 'direction' && renderResultCard(
                'الاتجاهات التسويقية المقترحة', 'Proposed Marketing Directions', 'direction-out',
                'جاري صياغة الاتجاهات التسويقية...', 'Formulating marketing directions...',
                'سيظهر هنا تحليل الاتجاهات المبتكرة التي تستهدف أوجاع العميل بالمقارنة مع المنافسين.', 'Innovative marketing angles targeting client pain points will appear here.',
                'Marketing Directions'
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: STRATEGY ── */}
      {activeTab === 'strategy' && (
        <div className="mkt-section on">
          <div className="tabs-bar" style={{ marginBottom: '14px' }}>
            {['plan', 'launcher'].map(sub => (
              <button
                key={sub}
                className={`tab-btn ${stratTab === sub ? 'on' : ''}`}
                onClick={() => setStratTab(sub)}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                {sub === 'plan' && `📋 ${L('Marketing Plan', 'خطة التسويق')}`}
                {sub === 'launcher' && `⚡ ${L('Campaign Planner', 'مخطط الحملات')}`}
              </button>
            ))}
          </div>

          {stratTab === 'plan' && (
            <div className="card">
              <div className="sec-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="sec-title">📋 {L('AI Marketing Strategy Plan', 'خطة الاستراتيجية التسويقية بالـ AI')}</div>
                <button 
                  className="btn btn-prime" 
                  onClick={runAutoMarketingPlan}
                  disabled={loading['strat-plan-out']}
                >
                  {loading['strat-plan-out'] ? L('Generating...', 'جاري التوليد...') : `✦ ${L('Generate Marketing Plan', 'إنشاء خطة التسويق')}`}
                </button>
              </div>
              <div 
                className="ai-box"
                style={{ marginTop: '15px' }}
                dangerouslySetInnerHTML={{ 
                  __html: loading['strat-plan-out'] 
                    ? L('Formulating plan from your Strategy Lab setup...', 'جاري كتابة خطة التسويق بناءً على فكرة وعرض البزنس...') 
                    : parseMarkdown(outputs['strat-plan-out'] || L('No plan generated yet. Click the button above to generate.', 'لم يتم إنشاء خطة حتى الآن. اضغط على الزر بالأعلى للتوليد.'))
                }}
              />
            </div>
          )}

          {stratTab === 'launcher' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div className="sec-title">⚡ {L('Campaign Planner', 'مخطط الحملات التسويقية')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Campaign Start Date', 'تاريخ بدء الحملة')}</label>
                    <input 
                      className="inp" 
                      type="date" 
                      value={inputs.campaignStartDate || ''} 
                      onChange={e => handleInputChange('campaignStartDate', e.target.value)} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Campaign Budget', 'ميزانية الحملة')}</label>
                    <input 
                      className="inp" 
                      placeholder="e.g. $500, or Organic" 
                      value={inputs.campaignBudget || ''} 
                      onChange={e => handleInputChange('campaignBudget', e.target.value)} 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Campaign Primary Goal', 'الهدف الأساسي للحملة')}</label>
                    <input 
                      className="inp" 
                      placeholder="e.g. Sales, Lead Gen, Brand Awareness" 
                      value={inputs.campaignGoal || ''} 
                      onChange={e => handleInputChange('campaignGoal', e.target.value)} 
                    />
                  </div>
                  
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '6px' }}>{L('Select Platforms', 'اختر المنصات الإعلانية')}</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {['Meta (Facebook/Instagram)', 'Google Ads', 'TikTok Ads', 'Snapchat Ads', 'YouTube Ads', 'LinkedIn Ads'].map(plat => {
                        const platforms = inputs.campaignPlatforms || [];
                        const isChecked = platforms.includes(plat);
                        return (
                          <label key={plat} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', background: 'var(--surface2)', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--edge)' }}>
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={(e) => {
                                const next = e.target.checked 
                                  ? [...platforms, plat]
                                  : platforms.filter(p => p !== plat);
                                handleInputChange('campaignPlatforms', next);
                              }} 
                            />
                            {plat}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <button className="btn btn-prime" onClick={runCampaignPlanner} style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }} disabled={loading['launcher-out']}>
                    {loading['launcher-out'] ? L('Generating...', 'جاري التوليد...') : `⚡ ${L('Generate Campaign Structure', 'ولّد هيكل الحملات')}`}
                  </button>
                </div>
              </div>
              {renderResultCard('مخطط الحملات والمخرجات', 'Campaign Planner Output', 'launcher-out', 'جاري تخطيط وتوليد الحملات...', 'Generating campaign plan...', 'اختر المنصات وحدد الميزانية لتوليد هيكل الحملات بكل تفاصيلها هنا.', 'Select platforms and budget to generate detailed campaigns structure here.', 'Campaign Planner')}
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
                <div className="sec-hd"><div className="sec-title">💰 {L('Pricing Optimizer', 'مُحسن التسعير')}</div></div>
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
                      <select className="inp" value={inputs.priceExp || ''} onChange={e => handleInputChange('priceExp', e.target.value)}>
                        <option>Beginner (0-1 year)</option><option>Intermediate (1-3 years)</option><option>Expert (5+ years)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Target Monthly Income', 'الدخل الشهري المستهدف')}</label>
                      <input className="inp" placeholder="$5,000" value={inputs.priceIncome || ''} onChange={e => handleInputChange('priceIncome', e.target.value)} />
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
                    <input className="inp" placeholder="Your main offer..." value={inputs.upsellCore || ''} onChange={e => handleInputChange('upsellCore', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Main Product Price', 'سعر المنتج الأساسي')}</label>
                    <input className="inp" placeholder="$997" value={inputs.upsellPrice || ''} onChange={e => handleInputChange('upsellPrice', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Customer Needs AFTER Buying', 'احتياجات العميل بعد الشراء مباشرة')}</label>
                    <textarea className="inp" rows="2" placeholder="After buying the course they still need implementation help..." value={inputs.upsellAfter || ''} onChange={e => handleInputChange('upsellAfter', e.target.value)}></textarea>
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
