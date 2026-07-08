'use client';

import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';
import { parseMarkdown } from '../../utils/markdown';
import CustomSelect from '../CustomSelect';

// Helper to generate a unique ID outside component scope
const generateReportId = () => 'rep_' + Date.now();

export default function MarketingView() {
  const { lang, L, t, GC, saveGC, formatMoney, confirmAction, currency } = useBusiness();
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
    offerAudience: '', offerFormat: 'Hybrid Group Program', offerDuration: '8 Weeks', offerGuarantee: '30-Day Money-Back (No Questions Asked)',
    priceCurrent: '', priceType: '1-on-1 Coaching', priceExp: 'Beginner (0-1 year)', priceIncome: '', priceExpenses: '',
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
    kpiModel: 'Coaching / Services', kpiTarget: '', kpiStage: 'Just starting', kpiActualRev: '', kpiActualLeads: '', kpiAov: '', kpiActualConv: '',
    revAov: '', revLeads: '', revClose: '', revGrowth: 'Organic only', revAdBudget: '', revOpCosts: '',
    leadAud: '', leadMethod: 'Organic content + DM', leadGoal: '',
    roiSpend: '', roiLeads: '', roiClosed: '', roiRev: '',

    // One-Click Campaign Launcher
    launchName: '', launchProduct: '', launchAudience: '', launchGoal: 'Sales / Conversions',

    // Campaign Planner enhancements
    campaignType: 'new_product',
    pastResultsStrategy: 'scale',
    pastResultsText: '',
    pastResultsFileName: '',
    pastResultsFileContent: '',
    newProductName: '',
    newProductDesc: '',
    newProductPrice: '',
    newProductAudience: '',

    // AI Consultant
    aiInp: ''
  });

  // Sync state from Firebase GC.marketing when GC changes
  React.useEffect(() => {
    if (GC?.marketing) {
      const timer = setTimeout(() => {
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
      }, 0);
      return () => clearTimeout(timer);
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
      id: generateReportId(),
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
          style={{ flex: 1, overflowY: 'auto', maxHeight: '580px' }}
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

    // Append currency suffix context
    const isArabic = lang === 'ar';
    const currencySuffix = isArabic
      ? `\n\n[ملاحظة هامة جداً للعملة]: يرجى كتابة وعرض جميع المبالغ المالية والأسعار وعائد الاستثمار (ROI/ROAS) والتقديرات المالية في كامل المخرجات والنتائج بالعملة المحددة للحساب: ${currency?.code || 'USD'} (ورمزها: ${currency?.symbol || '$'}).`
      : `\n\n[IMPORTANT CURRENCY INSTRUCTION]: Please format and write all prices, monetary values, ROI/ROAS, and financial estimates in the output using the account's selected currency: ${currency?.code || 'USD'} (symbol: ${currency?.symbol || '$'}).`;
    const finalPrompt = promptText + currencySuffix;

    try {
      const response = await callClaudeAPI(
        finalPrompt, 
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
      
      setOutputs(prev => ({ ...prev, [outputId]: finalResponse }));
      
      const updatedGC = {
        ...GC,
        marketing: {
          ...(GC?.marketing || {}),
          inputs: inputs,
          outputs: { ...(GC?.marketing?.outputs || {}), [outputId]: finalResponse },
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

CRITICAL INSTRUCTION: Do NOT summarize or repeat my own business idea, ICP, or roadmap. I already know this.
Instead, use the context above to understand my market, and then Identify 3-4 ACTUAL competitor brands, influencers, or similar businesses in this specific niche/industry. 
For each competitor, provide:
1. Their brand name
2. Their estimated pricing/offer
3. Their positioning (what makes them unique)
4. The market gaps we can exploit to beat them.`;
    const compSystem = `You are an expert market analyst. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;
    
    setOutputs(prev => ({ ...prev, 'comp-out': '', 'comp-ads-out': '', 'direction-out': '' }));
    setLoading(prev => ({ ...prev, 'comp-out': true, 'comp-ads-out': true, 'direction-out': true }));

    const compResult = await triggerAI('competitor-finder', 'comp-out', compPrompt, compSystem);

    const adsPrompt = `My Niche: "${inputs.resNiche}"
Our Business Description: "${GC.profile?.desc || ''}"
Our Competitors: "${compResult || ''}"

Based on these specific competitors, outline winning competitor hooks, ad copy angles, creative formats (image/video style), and conversion strategies we should deploy. Do not invent other competitor names; build directly on top of the competitors listed above.`;
    const adsSystem = `You are a PPC & Ad Intelligence specialist. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;
    const adsResult = await triggerAI('competitor-ads', 'comp-ads-out', adsPrompt, adsSystem);

    const dirPrompt = `Generate a Comprehensive Marketing Directions report:
Website/Page: "${inputs.resWebsite}"
Niche: "${inputs.resNiche}"
Target Client (ICP): "${icpData}"
Current Offer: "${GC.profile?.offer?.name || ''}" (${GC.profile?.offer?.price || ''})
Competitors: "${compResult || ''}"
Competitor Ad Angles: "${adsResult || ''}"

Perform a combined analysis merging our service details, ideal client profile, and competitor ad strategies. Provide 3 highly targeted marketing directions/angles, highlighting specific client pain points to hook them, and explain how we can position our service as the ultimate solution compared to these competitors. Do NOT repeat or duplicate the competitor lists; focus strictly on our unique marketing angles and directions.`;
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

  const handleCampaignFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 200 * 1024) {
        alert(L('File size too large. Please upload files under 200KB.', 'حجم الملف كبير جداً. يرجى رفع ملفات أقل من 200 كيلوبايت.'));
        return;
      }
      handleInputChange('pastResultsFileName', file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const truncatedText = text.substring(0, 100000);
        handleInputChange('pastResultsFileContent', truncatedText);
        
        const toast = document.getElementById('toast');
        if (toast) {
          toast.innerText = L('Report file loaded successfully!', 'تم تحميل ملف التقرير بنجاح!');
          toast.className = 'toast show';
          setTimeout(() => { toast.className = 'toast'; }, 3000);
        }
      };
      reader.onerror = () => {
        alert(L('Error reading file.', 'حدث خطأ أثناء قراءة الملف.'));
      };
      reader.readAsText(file);
    }
  };

  const clearUploadedFile = () => {
    handleInputChange('pastResultsFileName', '');
    handleInputChange('pastResultsFileContent', '');
    const fileInput = document.getElementById('campaign-file-upload');
    if (fileInput) fileInput.value = '';
  };

  const runCampaignPlanner = () => {
    const mktPlan = outputs['strat-plan-out'] || '';
    const offer = GC.profile?.offer?.name || '';
    const icp = GC.strategy?.icp || '';

    const selectedPlatforms = inputs.campaignPlatforms || [];
    const platformsStr = selectedPlatforms.join(', ') || 'Meta (Facebook/Instagram)';

    let prompt = '';
    let system = '';

    if (inputs.campaignType === 'past_results') {
      system = `You are an expert Chief Growth Officer and digital marketing analyst. Write a highly analytical, data-driven optimization report for next month's campaign. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;
      prompt = `We are optimizing an existing marketing campaign based on past results.
Strategic Direction Chosen: **${inputs.pastResultsStrategy === 'scale' ? 'Scale & Expand (توسيع وتوسيع الميزانية)' : 'Pivot & Adjust Direction (تغيير التوجه واختبار زوايا جديدة)'}**

Offer Details:
- Offer Name: "${offer || GC.profile?.name || ''}"
- Offer Price: "${GC.profile?.offer?.price || ''}"
- Ideal Client Profile (ICP): "${icp}"

Past Campaign Results Summary:
"${inputs.pastResultsText || 'No summary notes provided.'}"

${inputs.pastResultsFileName ? `Uploaded Past Performance Report File Name: "${inputs.pastResultsFileName}"
Uploaded Performance Data:
"""
${inputs.pastResultsFileContent || ''}
"""` : 'No past performance report file uploaded.'}

Campaign Setup Details:
- Target Platforms: "${platformsStr}"
- Start Date: "${inputs.campaignStartDate || 'As soon as possible'}"
- Budget: "${inputs.campaignBudget || 'Organic / Minimal'}"
- Primary Goal: "${inputs.campaignGoal || 'Sales / Conversions'}"

Please analyze the past campaign performance data and write a detailed, data-driven optimization and implementation plan for the new campaign. Make sure to determine and calculate the recommended budget, budget distribution, and target goals:

1. **Data Diagnostics**: Analyze the past performance inputs. Detail conversion bottlenecks, high-performing vs failing assets, and identify what key factors led to the current results.
2. **Budget Allocation & Distribution Plan (CRITICAL)**:
   - Provide a recommended monthly budget size. If the user input "${inputs.campaignBudget}" is "Organic" or unspecified, calculate and recommend a realistic starting advertising budget for their niche.
   - Present a **Markdown Table** showing the recommended budget distribution (in percentages and currency) across:
     - The selected advertising platforms: "${platformsStr}"
     - Funnel stages: Cold Traffic (Prospecting) vs. Warm Traffic (Retargeting)
   - Explain the rationale for this distribution based on past bottlenecks (e.g., if Google had low conversion rates, shift budget to Meta).
3. **KPI Goals & Targets (CRITICAL)**:
   - Present a **Markdown Table** outlining the target goals for the upcoming campaign, including:
     - Target CTR (Click-Through Rate)
     - Target Cost Per Lead (CPL)
     - Target Cost Per Acquisition (CPA)
     - Target Conversion Rate (CVR)
     - Target ROAS (Return on Ad Spend)
   - Base these targets directly on the offer price and the past campaign performance data.
4. **Strategic Realignment & Action Items**:
   ${inputs.pastResultsStrategy === 'scale' 
     ? 'Explain how we can scale up: budget scaling rules (e.g. 20% budget increases, CBO vs ABO), duplication strategies, lookalike audience structures, and broadening parameters while maintaining ROAS.' 
     : 'Explain how we will pivot: define 3 new marketing angles/hooks, adjust target audience segments to avoid previous bottlenecks, and restructure the messaging to tackle price/value objections.'}
5. **Optimized Campaign Structure & Timeline**: Step-by-step launch timeline starting from "${inputs.campaignStartDate || 'now'}".
6. **Ad Creative & Platform Copy Blueprint**: Visual hook recommendations, copy templates, and specific guidelines for "${platformsStr}".`;
    } else {
      system = `You are a Product Launch Specialist and Growth Marketer. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;
      prompt = `We are launching a new product/service campaign.
New Product Details:
- Name: "${inputs.newProductName || 'New Product'}"
- Description & Features: "${inputs.newProductDesc || 'A premium product'}"
- Launch Offer & Price: "${inputs.newProductPrice || 'TBD'}"
- Target Audience: "${inputs.newProductAudience || icp || 'General audience'}"

Campaign Setup Details:
- Target Platforms: "${platformsStr}"
- Start Date: "${inputs.campaignStartDate || 'As soon as possible'}"
- Budget: "${inputs.campaignBudget || 'Organic / Minimal'}"
- Primary Goal: "${inputs.campaignGoal || 'Sales / Conversions'}"

Please design a comprehensive launch campaign blueprint. Make sure to determine and calculate the recommended budget, budget distribution, and target goals:

1. **Launch Positioning & Angle**: How to position "${inputs.newProductName || 'this new product'}" to appeal directly to the target audience and create launch hype.
2. **Budget Allocation & Distribution Plan (CRITICAL)**:
   - Provide a recommended monthly launch budget. If the user input "${inputs.campaignBudget}" is "Organic" or unspecified, calculate and suggest a realistic starting advertising budget for launching this product.
   - Present a **Markdown Table** showing the recommended budget distribution (in percentages and currency) across:
     - The selected advertising platforms: "${platformsStr}"
     - Funnel stages: Cold Traffic (Prospecting / Awareness) vs. Warm Traffic (Retargeting / Launch Offer)
3. **KPI Goals & Targets (CRITICAL)**:
   - Present a **Markdown Table** outlining the target goals and benchmarks for this launch campaign, including:
     - Target CTR (Click-Through Rate)
     - Target Cost Per Lead (CPL)
     - Target Cost Per Acquisition (CPA)
     - Target Conversion Rate (CVR)
     - Target ROAS (Return on Ad Spend)
   - Base these targets directly on the product launch price of "${inputs.newProductPrice || 'TBD'}" and the target audience behavior.
4. **Detailed Multi-Phase Timeline**: Milestones for Pre-Launch (buzz building), Launch Week (hard pitch & urgency), and Post-Launch (follow-up).
5. **Ad Creative Concept & Copy Direction**: Visual hooks, main copy angles (focusing on product features and target audience pain points), and platform specific CTA instructions.`;
    }

    triggerAI('campaign-planner', 'launcher-out', prompt, system);
  };

  const runFeedbackOptimization = async () => {
    const originalPlan = outputs['strat-plan-out'] || L('No prior plan generated.', 'لا توجد خطة سابقة.');
    
    const feedbackPrompt = `My Business Name: "${GC.profile?.name || ''}"
Business Description: "${GC.profile?.desc || ''}"
Previous Strategy/Marketing Plan: "${originalPlan}"
Actual Campaign Results / Feedback of the past month: "${inputs.pastResultsText || ''}"
Uploaded File Reference (if any): "${inputs.feedbackFileName || 'None'}"

Analyze these campaign results and compare them with the previous plan. Propose:
1. **Critical Strategy Assessment**: What worked, what failed, and why (conversion drops, target mismatch).
2. **Channel & Budget Realignment**: Specific modifications to budgets, spend allocations, or channel focus.
3. **Copy & Creative Pivot Rules**: Recommendations to change hooks or messages based on user feedback.
4. **Optimized Marketing Plan for Next Month**: A complete, updated plan to get better results.`;

    const feedbackSystem = `You are a chief growth officer and digital marketing analyst. Write a highly analytical, data-driven optimization report for next month's campaign. Propose concrete changes to the strategy based on the feedback of what failed. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;

    await triggerAI('strategy-feedback-opt', 'strat-feedback-out', feedbackPrompt, feedbackSystem);
  };

  // ── 3. OFFERS SUB-ACTIONS ──
  const runOfferBuilder = () => {
    const isArabic = lang === 'ar';
    const system = isArabic 
      ? `أنت خبير واستشاري في تصميم وصياغة العروض التجارية عالية التحويل والعروض التي لا تقاوم (Irresistible Offers). هدفك هو تحويل فكرة البزنس إلى عرض تجاري متكامل ومحكم يجذب العميل للشراء.` 
      : `You are a world-class High-Ticket Offer Architect and conversion strategist. Your goal is to structure irresistible marketing offers that convert highly.`;

    const prompt = isArabic 
      ? `قم ببناء عرض تجاري كامل ولا يقاوم بناءً على التفاصيل التالية:
- المنتج/الخدمة الأساسية: "${inputs.offerCore || 'غير محدد'}"
- الجمهور المستهدف: "${inputs.offerAudience || 'غير محدد'}"
- التحول/النتيجة النهائية: "${inputs.offerTransform || 'غير محدد'}"
- السعر الحالي: "${inputs.offerPrice || 'غير محدد'}"
- ألم العميل الأساسي: "${inputs.offerPain || 'غير محدد'}"
- طريقة التقديم: "${inputs.offerFormat || 'غير محدد'}"
- مدة العرض/البرنامج: "${inputs.offerDuration || 'غير محدد'}"
- نوع الضمان المقترح: "${inputs.offerGuarantee || 'غير محدد'}"

يرجى إعطاء هيكل عرض تجاري متكامل (وليس مجرد سكريبت فيديو!)، يشتمل على:
1. **اسم العرض المقترح والتموضع (Name & Positioning):** اسم جذاب ومهني للمنتج/الخدمة مع سطر هوك قوي (Hook).
2. **تفصيل الخدمة الجوهرية (Core Deliverable & Transformation):** ما يحصل عليه العميل بالتحديد وكيف يتم تقديمه خلال ${inputs.offerDuration || 'المدة'} لتحقيق التحول.
3. **مكدس القيمة بالتفصيل (The Value Stack & Tiered Pricing):**
   - جدول يقارن بين القيمة الحقيقية لكل مكون (Value) والسعر الفعلي المعروض (Price).
   - توضيح القيمة المتصورة الإجمالية لرفع قيمة العرض.
4. **ثلاثة بونصات عالية القيمة (3 High-Value Bonuses):** بونصات مخصصة تكسر الاعتراضات الشائعة للجمهور وتسهل عليهم التطبيق (مثال: قوالب جاهزة، جروب دعم، مكالمة خاصة...).
5. **صياغة الضمان خالي المخاطر (Risk-Reversal Guarantee):** كتابة صيغة الضمان المختار بشكل قوي يزيل الخوف تماماً ويشجع العميل على الدفع.
6. **محفزات الندرة والاستعجال الفعلية (Urgency & Scarcity Elements):** كيف ندفعه للشراء الآن (مثال: سعة الدفعة الأولى، بونص لأول 5 مسجلين فقط).
7. **خطة تحويل العملاء (Conversion Action Plan / CTA):** الخطوات الدقيقة التي يجب أن يتخذها العميل ليشتري (مثال: حجز مكالمة تأهيلية، الانتقال لصفحة الدفع مباشرة).`
      : `Build a complete, irresistible marketing offer structure based on the following details:
- Core Product/Service: "${inputs.offerCore || 'Not specified'}"
- Target Audience: "${inputs.offerAudience || 'Not specified'}"
- Final Transformation/Dream Outcome: "${inputs.offerTransform || 'Not specified'}"
- Current Price: "${inputs.offerPrice || 'Not specified'}"
- Target Customer Pain Point: "${inputs.offerPain || 'Not specified'}"
- Delivery Format: "${inputs.offerFormat || 'Not specified'}"
- Program/Offer Duration: "${inputs.offerDuration || 'Not specified'}"
- Guarantee Choice: "${inputs.offerGuarantee || 'Not specified'}"

Please design a comprehensive, highly-converting business offer framework (NOT just a video script!). Include the following sections:
1. **Offer Package Name & Hook (Positioning):** Catchy, professional name with a strong hook/tagline.
2. **Core Deliverables Breakdown (Core Transformation):** What exactly the buyer gets, how it is delivered over ${inputs.offerDuration || 'the duration'}, and how it achieves the dream outcome.
3. **The Value Stack & Pricing Matrix:**
   - A markdown table detailing each component, its estimated real value, and the special bundled price.
   - Total perceived value calculation.
4. **3 High-Value Objection-Busting Bonuses:** Strategic bonuses addressing specific customer fears or roadblocks.
5. **The Risk-Reversal Guarantee:** A bold, copy-written guarantee statement based on the chosen guarantee type.
6. **Urgency & Scarcity Hacks:** Real reasons to buy now (e.g., cohort limits, early-bird pricing expiry).
7. **Call to Action (CTA) & Conversion Path:** The exact step-by-step process for the prospect to buy or apply.`;

    triggerAI('offer-builder', 'offer-out', prompt, system);
  };

  const runPricingOptimizer = () => {
    const prompt = `Optimize pricing: Current Price "${inputs.priceCurrent}", Product type "${inputs.priceType}", Experience level "${inputs.priceExp}", Target Monthly Income: "${inputs.priceIncome}", Monthly Expenses: "${inputs.priceExpenses || '0'}". Give tiered pricing options (low, medium, high), pricing psychology hacks, and a detailed sales volume calculator that accounts for monthly expenses to show net profit.`;
    const system = `You are a pricing psychologist.`;
    triggerAI('pricing', 'pricing-out', prompt, system);
  };

  const runUpsellBuilder = () => {
    const isArabic = lang === 'ar';
    const system = isArabic
      ? `أنت خبير واستشاري خبير في تحسين مبيعات القمع ومضاعفة القيمة المالية للعملاء (LTV) وتصميم سلالم البيع الإضافي (Upsell & Cross-Sell).`
      : `You are a world-class Funnel Monetization and Upsell Strategist. You specialize in designing high-value backend ladders that double average customer value (LTV).`;

    const prompt = isArabic
      ? `قم ببناء خطة وسلّم مبيعات إضافية وخلفية متكاملة وعالية التحديد ومخصصة للبزنس.
اسم المنتج/العرض الأساسي: "${inputs.upsellCore || 'منتجي الأساسي'}"
سعر المنتج الأساسي: "${inputs.upsellPrice || '500'}"
احتياجات العميل بعد الشراء التي حددها المستخدم: "${inputs.upsellAfter || 'غير محددة'}"

يرجى تقسيم التحليل بدقة بالغة إلى جزأين رئيسيين وعرضهما بالكامل دون أي اختصار:

### الجزء الأول: اقتراحات وحلول الذكاء الاصطناعي الذكية (AI Smart Upsell Engine)
بناءً على فهمك لمجال عملنا، الجمهور المستهدف، والمنافسين، وما يحتاجه العميل طبيعياً كخطوة تالية بعد شراء المنتج الأساسي:
- اقترح فكرة واحدة لبرنامج تدريبي عملي، معسكر تفاعلي (Cohort)، أو توجيه مباشر عالي القيمة يحل المشكلة التالية التي ستواجه العميل (مثال: إذا اشترى كورس برمجة، فالخطوة التالية الطبيعية هي تدريب عملي ومراجعة كود أو الإعداد للعمل).
- حدد السعر المقترح لتقديم هذا البرنامج وطريقة تنفيذه وهيكلة التدريب.

---

### الجزء الثاني: عروض البيع الإضافي المخصصة بناءً على مدخلاتك (Custom-Built Upsell Ladder)
بناءً على الاحتياجات المحددة التي أدخلها المستخدم ("${inputs.upsellAfter}")، قم بتصميم وتفصيل:
1. **Order Bump (عرض الشراء الفوري الصغير):** صندوق اختيار يظهر في صفحة الدفع.
2. **One-Time Offer (OTO) Upsell (العرض الإضافي المباشر بعد الشراء):** خطوة تالية مباشرة تظهر بعد الدفع.
3. **High-Ticket Backend Program (العرض الخلفي عالي القيمة):** برنامج VIP متكامل للعملاء المميزين.

لكل عرض من هذه العروض الثلاثة، قم بتوفير: اسم المنتج المقترح، الوصف التفصيلي، السعر المقترح بالعملة، والعبارة التسويقية الجاذبة (Copy Hook).`
      : `Build a comprehensive, highly-specific Upsell & Backend Offer Ladder.
Core Offer Name: "${inputs.upsellCore || 'My Main Product'}"
Core Offer Price: "${inputs.upsellPrice || '$500'}"
User-defined Customer Needs after buying: "${inputs.upsellAfter || 'Not specified'}"

Please split your analysis into two main parts:

### الجزء الأول: اقتراحات وحلول الذكاء الاصطناعي الذكية (AI Smart Upsell Engine)
Based on your understanding of our business niche, target audience, competitors, and the typical post-purchase journey, suggest:
- 1 next-step high-value coaching, community, or cohort training idea that solves the customer's unexpressed next bottleneck (e.g. if they bought a coding course, they need live mentorship, portfolio review, or job prep).
- The suggested price point and delivery structure.

---

### الجزء الثاني: عروض البيع الإضافي المخصصة بناءً على مدخلاتك (Custom-Built Upsell Ladder)
Based on the specific customer needs the user entered ("${inputs.upsellAfter}"), build a tailored:
1. **Order Bump (عرض الشراء الفوري الصغير):** Checkbox on checkout page.
2. **One-Time Offer (OTO) Upsell (العرض الإضافي المباشر بعد الشراء):** High-converting next step.
3. **High-Ticket Backend Program (العرض الخلفي عالي القيمة):** Ultimate VIP package.

For each, provide: Product Name, Description, Proposed Price, and Copy Hook.`;

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

  const runKPIPlanner = () => {
    const prompt = `Build KPI planner and status dashboard:
Business Model: "${inputs.kpiModel}"
Target Monthly Revenue: "${inputs.kpiTarget}"
Current Business Stage: "${inputs.kpiStage}"
Average Order/Ticket Value: "${inputs.kpiAov || 'Not specified'}"
Actual Monthly Revenue: "${inputs.kpiActualRev || '0'}"
Actual Monthly Traffic/Leads: "${inputs.kpiActualLeads || '0'}"
Actual Conversion Rate: "${inputs.kpiActualConv || '0'}%"

Please compile a data-driven KPI progress dashboard:
1. Progress analysis compared to the monthly target.
2. Visual KPI progress table detailing target, actual, variance, and status color badges (e.g. green, yellow, red).
3. Leak diagnostics (e.g. is traffic too low? is conversion below industry benchmarks for "${inputs.kpiModel}"?).
4. Tactical action steps to improve.`;
    const system = `You are a high-performance metrics dashboard analyst. You calculate precise KPI conversion rates and traffic-to-revenue projections.`;
    triggerAI('kpi', 'kpi-out', prompt, system);
  };

  const runRevenueForecast = () => {
    const prompt = `Forecast revenue and net profits:
Average Sale Value (AOV): "${inputs.revAov}"
Monthly Leads/Traffic: "${inputs.revLeads}"
Current Closing Rate: "${inputs.revClose}"
Growth Plan Model: "${inputs.revGrowth}"
Monthly Ad Budget: "${inputs.revAdBudget || '0'}"
Monthly Fixed Operational Costs: "${inputs.revOpCosts || '0'}"

Please compute a financial projection for 30, 60, and 90 days under Conservative, Realistic, and Aggressive scenarios. Include:
1. Gross Revenue
2. Total Expenses (Ad Budget + Operating Costs)
3. Net Profit and Profit Margin %
4. Strategic growth advice based on the Growth Plan Model.`;
    const system = `You are an expert financial analyst and SaaS/E-commerce growth CFO. You calculate exact net profit margins, advertising returns, and multi-scenario business projections.`;
    triggerAI('rev-forecast', 'rev-forecast-out', prompt, system);
  };

  const runLeadForecast = () => {
    const isArabic = lang === 'ar';
    const system = isArabic
      ? `أنت خبير نمو واستراتيجي جذب عملاء محتملين. تقوم بتحليل خارطة طريق الأعمال وتوقع نمو أعداد العملاء بناءً على نموذج العمل وقنوات الجذب المحددة بالبزنس.`
      : `You are an expert growth strategist and lead generation analyst. You analyze business roadmaps and project lead growth trajectories based on marketing channels.`;

    const prompt = isArabic
      ? `قم بتحليل وتوقع نمو أعداد العملاء المحتملين (Leads & Clients) بناءً على بيانات الحساب والخطط الاستراتيجية التالية:

بيانات البزنس الحالية:
- المجال: "${GC?.profile?.niche || 'غير محدد'}"
- العرض الأساسي: "${GC?.profile?.offer?.name || 'غير محدد'}"
- سعر الاستثمار: "${GC?.profile?.offer?.price || 'غير محدد'}"
- هدف الإيرادات الشهري: "${GC?.profile?.goal || 'غير محدد'}"
- خارطة الطريق الحالية للنمو (Roadmap):
"${GC?.strategy?.roadmap || 'لا توجد خارطة طريق مسجلة حالياً في النظام'}"

المدخلات المحددة للعملاء:
- حجم الجمهور/المتابعين الحالي: "${inputs.leadAud || '1500'}"
- طريقة جذب العملاء المختارة: "${inputs.leadMethod || 'Paid ads'}"
- هدف العملاء المحتملين شهرياً: "${inputs.leadGoal || '5000'}"

المطلوب صياغة تقرير توقعات متكامل للعملاء (Lead Forecast Dashboard):
1. **تحليل أثر خارطة الطريق الحالية (Roadmap Synergy):** كيف ستؤثر خطوات الـ Roadmap المسجلة حالياً على جلب هؤلاء العملاء.
2. **جدول توقعات النمو لـ 30 و 60 و 90 يوماً (30/60/90 Day Forecast):**
   - توقع أعداد العملاء المحتملين الجدد (Leads).
   - توقع المبيعات الفعلية (Clients) بناءً على طريقة الجذب والمجال.
3. **متطلبات الحملات اليومية والأسبوعية:** كم عدد المشاهدات/النقرات المطلوبة يومياً للوصول للهدف.
4. **التوجيه الاستراتيجي القادم:** نصائح عملية لتنفيذ الـ Roadmap لضمان زيادة العملاء.`
      : `Analyze and forecast lead & client growth based on the following business context and strategy roadmap:

Business Profile Context:
- Niche: "${GC?.profile?.niche || 'Not specified'}"
- Core Offer: "${GC?.profile?.offer?.name || 'Not specified'}"
- Price: "${GC?.profile?.offer?.price || 'Not specified'}"
- Monthly Revenue Goal: "${GC?.profile?.goal || 'Not specified'}"
- Current Strategy Roadmap:
"${GC?.strategy?.roadmap || 'No roadmap saved yet'}"

Lead Generation Settings:
- Current Audience Size: "${inputs.leadAud || '1500'}"
- Lead Generation Method: "${inputs.leadMethod || 'Paid ads'}"
- Target Monthly Leads: "${inputs.leadGoal || '5000'}"

Please compute a comprehensive Lead & Client Growth Forecast:
1. **Roadmap Synergy Analysis:** How the user's strategy roadmap steps will drive lead acquisition.
2. **30/60/90 Day Growth Table:** Projected Leads and Projected Closed Clients.
3. **Daily/Weekly Reach Requirements:** Traffic or ad impressions needed to sustain this volume.
4. **Strategic Alignment Advice:** Recommendations to optimize their roadmap actions for client acquisition.`;

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
      setOutputs(prev => {
        const next = { ...prev, 'ai-out': res };
        saveGC({
          ...GC,
          marketing: {
            ...(GC?.marketing || {}),
            inputs: inputs,
            outputs: next
          }
        });
        return next;
      });
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
            {['plan', 'launcher', 'feedback'].map(sub => (
              <button
                key={sub}
                className={`tab-btn ${stratTab === sub ? 'on' : ''}`}
                onClick={() => setStratTab(sub)}
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                {sub === 'plan' && `📋 ${L('Marketing Plan', 'خطة التسويق')}`}
                {sub === 'launcher' && `⚡ ${L('Campaign Planner', 'مخطط الحملات')}`}
                {sub === 'feedback' && `🔄 ${L('Continuous Optimization', 'التحسين المستمر')}`}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  {/* Mode Toggle */}
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '6px' }}>
                      {L('Campaign Mode', 'نوع الحملة التسويقية')}
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'var(--surface2)', padding: '4px', borderRadius: '8px', border: '1px solid var(--edge)' }}>
                      <button
                        type="button"
                        className={`tab-btn ${inputs.campaignType !== 'past_results' ? 'on' : ''}`}
                        style={{ fontSize: '12px', padding: '6px', borderRadius: '6px', justifyContent: 'center', minHeight: '30px', border: 'none' }}
                        onClick={() => handleInputChange('campaignType', 'new_product')}
                      >
                        🆕 {L('New Product Launch', 'إطلاق منتج جديد')}
                      </button>
                      <button
                        type="button"
                        className={`tab-btn ${inputs.campaignType === 'past_results' ? 'on' : ''}`}
                        style={{ fontSize: '12px', padding: '6px', borderRadius: '6px', justifyContent: 'center', minHeight: '30px', border: 'none' }}
                        onClick={() => handleInputChange('campaignType', 'past_results')}
                      >
                        📈 {L('Based on Past Results', 'تحليل نتائج سابقة')}
                      </button>
                    </div>
                  </div>

                  {/* Mode 1: New Product Form */}
                  {inputs.campaignType !== 'past_results' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', borderTop: '1px solid var(--line)', paddingTop: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                          {L('New Product Name', 'اسم المنتج الجديد')}
                        </label>
                        <input 
                          className="inp" 
                          placeholder={L('e.g., UpKlick Software', 'مثال: منصة أبكليك')} 
                          value={inputs.newProductName || ''} 
                          onChange={e => handleInputChange('newProductName', e.target.value)} 
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                          {L('Product Description & Key Features', 'وصف المنتج وميزاته الأساسية')}
                        </label>
                        <textarea 
                          className="inp" 
                          rows="3" 
                          placeholder={L('e.g., A drag-and-drop landing page builder for Arabic creators...', 'مثال: منشئ صفحات هبوط بالسحب والإفلات لصناع المحتوى...')} 
                          value={inputs.newProductDesc || ''} 
                          onChange={e => handleInputChange('newProductDesc', e.target.value)} 
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                            {L('Price / Launch Offer', 'السعر وتفاصيل العرض')}
                          </label>
                          <input 
                            className="inp" 
                            placeholder={L('e.g., $49/month with 14-day trial', 'مثال: 49$/شهرياً مع فترة تجربة')} 
                            value={inputs.newProductPrice || ''} 
                            onChange={e => handleInputChange('newProductPrice', e.target.value)} 
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                            {L('Target Audience', 'الجمهور المستهدف')}
                          </label>
                          <input 
                            className="inp" 
                            placeholder={L('e.g., Arabic creators & freelancers', 'مثال: المستقلين وصناع المحتوى العرب')} 
                            value={inputs.newProductAudience || ''} 
                            onChange={e => handleInputChange('newProductAudience', e.target.value)} 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode 2: Past Results Form */}
                  {inputs.campaignType === 'past_results' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', borderTop: '1px solid var(--line)', paddingTop: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '6px' }}>
                          {L('Strategic Direction', 'التوجه الاستراتيجي المطلوب')}
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'var(--surface2)', padding: '4px', borderRadius: '8px', border: '1px solid var(--edge)' }}>
                          <button
                            type="button"
                            className={`tab-btn ${inputs.pastResultsStrategy !== 'pivot' ? 'on' : ''}`}
                            style={{ fontSize: '11.5px', padding: '5px', borderRadius: '6px', justifyContent: 'center', minHeight: '28px', border: 'none' }}
                            onClick={() => handleInputChange('pastResultsStrategy', 'scale')}
                          >
                            🚀 {L('Scale Current Direction', 'توسيع وتكبير (Scale)')}
                          </button>
                          <button
                            type="button"
                            className={`tab-btn ${inputs.pastResultsStrategy === 'pivot' ? 'on' : ''}`}
                            style={{ fontSize: '11.5px', padding: '5px', borderRadius: '6px', justifyContent: 'center', minHeight: '28px', border: 'none' }}
                            onClick={() => handleInputChange('pastResultsStrategy', 'pivot')}
                          >
                            🔄 {L('Pivot & New Direction', 'تغيير التوجه (Pivot)')}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                          {L('Past Campaign Results (Notes / Feedback)', 'نتائج الحملة السابقة (ملاحظات ونصوص)')}
                        </label>
                        <textarea 
                          className="inp" 
                          rows="3" 
                          placeholder={L('e.g., Spent $300, CTR was 1.2%, lead quality was poor...', 'مثال: صرفنا 300$، نسبة النقر 1.2%، وجودة العملاء كانت منخفضة...')} 
                          value={inputs.pastResultsText || ''} 
                          onChange={e => handleInputChange('pastResultsText', e.target.value)} 
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                          {L('Upload Past Campaign Data (CSV, TXT, JSON)', 'رفع تقرير أو بيانات الحملة السابقة (CSV, TXT, JSON)')}
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input 
                              type="file" 
                              id="campaign-file-upload" 
                              style={{ display: 'none' }} 
                              accept=".csv,.txt,.json,.tsv,.log"
                              onChange={handleCampaignFileChange}
                            />
                            <button 
                              type="button"
                              className="btn btn-ghost btn-sm" 
                              onClick={() => document.getElementById('campaign-file-upload').click()}
                              style={{ fontSize: '11.5px', padding: '6px 12px' }}
                            >
                              📁 {L('Choose File', 'اختر ملف')}
                            </button>
                            <span style={{ fontSize: '11.5px', color: 'var(--t3)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                              {inputs.pastResultsFileName || L('No file selected', 'لم يتم اختيار ملف')}
                            </span>
                            {inputs.pastResultsFileName && (
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={clearUploadedFile}
                                style={{ color: 'var(--red)', borderColor: 'rgba(239, 68, 68, 0.2)', padding: '2px 6px', fontSize: '10px' }}
                              >
                                ❌ {L('Clear', 'إزالة')}
                              </button>
                            )}
                          </div>
                          {inputs.pastResultsFileContent && (
                            <div style={{ fontSize: '10.5px', color: 'var(--green)', background: 'rgba(16, 185, 129, 0.08)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                              ✓ {L(`Parsed ${inputs.pastResultsFileContent.length} characters of campaign data`, `تم تحليل ${inputs.pastResultsFileContent.length} حرف من بيانات التقرير`)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* General / Shared Form Fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', borderTop: '1px solid var(--line)', paddingTop: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
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
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {['Meta (Facebook/Instagram)', 'Google Ads', 'TikTok Ads', 'Snapchat Ads', 'YouTube Ads', 'LinkedIn Ads'].map(plat => {
                          const platforms = inputs.campaignPlatforms || [];
                          const isChecked = platforms.includes(plat);
                          return (
                            <label key={plat} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', background: 'var(--surface2)', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--edge)', transition: 'all 0.2s ease' }}>
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
                  </div>

                  <button className="btn btn-prime" onClick={runCampaignPlanner} style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }} disabled={loading['launcher-out']}>
                    {loading['launcher-out'] ? L('Generating...', 'جاري التوليد...') : `⚡ ${L('Generate Campaign Structure', 'ولّد هيكل الحملات')}`}
                  </button>
                </div>
              </div>
              {renderResultCard('مخطط الحملات والمخرجات', 'Campaign Planner Output', 'launcher-out', 'جاري تخطيط وتوليد الحملات...', 'Generating campaign plan...', 'اختر المنصات وحدد الميزانية لتوليد هيكل الحملات بكل تفاصيلها هنا.', 'Select platforms and budget to generate detailed campaigns structure here.', 'Campaign Planner')}
            </div>
          )}

          {stratTab === 'feedback' && (
            <div className="g2">
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold' }}>
                  🔄 {L('Feedback Loop & Continuous Optimization', 'حلقة التغذية الراجعة والتحسين المستمر')}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--t2)' }}>
                  {L('Submit results or upload reports from the past month to iterate and generate next month\'s optimized strategy plan.', 'قم بتقديم النتائج أو رفع التقارير من الشهر الماضي للتكرار وتوليد خطة الاستراتيجية المحسنة للشهر القادم.')}
                </div>
                
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Past Month Results & Feedback (Text)', 'نتائج الشهر الماضي والتعليقات (نص)')}
                  </label>
                  <textarea 
                    className="inp" 
                    rows="4" 
                    placeholder={L('e.g., Spent $300 on Meta, got 25 leads, but conversion was low because price was a barrier...', 'مثال: صرفت 300 دولار على ميتا، حصلت على 25 ليد ولكن نسبة الإغلاق كانت ضعيفة بسبب اعتراض السعر...')} 
                    value={inputs.pastResultsText || ''} 
                    onChange={e => handleInputChange('pastResultsText', e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Upload Past Strategy / Performance Report (Optional)', 'رفع تقرير الأداء أو الاستراتيجية السابقة (اختياري)')}
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input 
                      type="file" 
                      id="opt-file-upload" 
                      style={{ display: 'none' }} 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleInputChange('feedbackFileName', file.name);
                        }
                      }}
                    />
                    <button 
                      className="btn btn-ghost" 
                      onClick={() => document.getElementById('opt-file-upload').click()}
                      style={{ fontSize: '11.5px', padding: '6px 12px' }}
                    >
                      📁 {L('Choose File', 'اختر ملف')}
                    </button>
                    <span style={{ fontSize: '11.5px', color: 'var(--t3)' }}>
                      {inputs.feedbackFileName || L('No file selected', 'لم يتم اختيار ملف')}
                    </span>
                  </div>
                </div>

                <button 
                  className="btn btn-prime" 
                  onClick={runFeedbackOptimization} 
                  style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }} 
                  disabled={loading['strat-feedback-out']}
                >
                  {loading['strat-feedback-out'] ? L('Optimizing...', 'جاري التحسين...') : `🔄 ${L('Generate Next Month\'s Plan', 'توليد خطة الشهر القادم ✦')}`}
                </button>
              </div>

              {renderResultCard(
                'خطة تحسين الشهر القادم', 'Next Month\'s Optimized Strategy', 'strat-feedback-out',
                'جاري تحليل النتائج وتوليد خطة التحسين...', 'Analyzing results and optimizing strategy...',
                'سيظهر تحليل الأداء وخطة الشهر القادم المحسنة هنا.', 'Performance analysis and next month\'s optimized plan will appear here.',
                'Strategy Feedback Loop'
              )}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('What do you sell?', 'ما الذي تبيعه؟')}</label>
                      <input className="inp" placeholder="Coaching program, course, service..." value={inputs.offerCore} onChange={e => handleInputChange('offerCore', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Target Audience', 'الجمهور المستهدف')}</label>
                      <input className="inp" placeholder="E-commerce owners, freelancers..." value={inputs.offerAudience || ''} onChange={e => handleInputChange('offerAudience', e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('What transformation do you deliver?', 'ما النتيجة / التحول الذي تقدمه؟')}</label>
                    <input className="inp" placeholder="From 0 to $5K/month in 90 days..." value={inputs.offerTransform} onChange={e => handleInputChange('offerTransform', e.target.value)} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Current Price', 'السعر الحالي')}</label>
                      <input className="inp" placeholder="$1,500" value={inputs.offerPrice} onChange={e => handleInputChange('offerPrice', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Target Customer Pain', 'ألم العميل الأساسي')}</label>
                      <input className="inp" placeholder="Not consistent sales" value={inputs.offerPain} onChange={e => handleInputChange('offerPain', e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Delivery Format', 'طريقة التقديم')}</label>
                      <CustomSelect className="inp" value={inputs.offerFormat || 'Hybrid Group Program'} onChange={e => handleInputChange('offerFormat', e.target.value)}>
                        <option value="1-on-1 Coaching">{L('1-on-1 Coaching', 'جلسات فردية 1-on-1')}</option>
                        <option value="Hybrid Group Program">{L('Hybrid Group Program', 'برنامج جماعي هجين (مجموعات + مسجل)')}</option>
                        <option value="Done-For-You (DFY) Service">{L('Done-For-You (DFY) Service', 'خدمة متكاملة بالنيابة عنك DFY')}</option>
                        <option value="Done-With-You (DWY) Consulting">{L('Done-With-You (DWY) Consulting', 'استشارات ومرافقة DWY')}</option>
                        <option value="Digital Course & Community">{L('Digital Course & Community', 'كورس رقمي ومجتمع تفاعلي')}</option>
                        <option value="Paid Community">{L('Paid Community / Membership', 'اشتراك دوري / مجتمع مغلق')}</option>
                      </CustomSelect>
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Offer Duration', 'مدة العرض/البرنامج')}</label>
                      <CustomSelect className="inp" value={inputs.offerDuration || '8 Weeks'} onChange={e => handleInputChange('offerDuration', e.target.value)}>
                        <option value="4 Weeks">{L('4 Weeks', '٤ أسابيع')}</option>
                        <option value="8 Weeks">{L('8 Weeks', '٨ أسابيع')}</option>
                        <option value="12 Weeks / 90 Days">{L('12 Weeks / 90 Days', '١٢ أسبوع / ٩٠ يوم')}</option>
                        <option value="6 Months">{L('6 Months', '٦ أشهر')}</option>
                        <option value="Lifetime">{L('Lifetime Access', 'وصول مدى الحياة')}</option>
                      </CustomSelect>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Guarantee Choice', 'نوع الضمان المقترح')}</label>
                    <CustomSelect className="inp" value={inputs.offerGuarantee || '30-Day Money-Back (No Questions Asked)'} onChange={e => handleInputChange('offerGuarantee', e.target.value)}>
                      <option value="30-Day Money-Back (No Questions Asked)">{L('30-Day Money-Back (No Questions Asked)', 'ضمان استرداد ٣٠ يوم (بدون طرح أسئلة)')}</option>
                      <option value="Action-Based Conditional Guarantee">{L('Action-Based Conditional Guarantee', 'ضمان مشروط بالتطبيق الفعلي والعملي')}</option>
                      <option value="Double Your Money Back Guarantee">{L('Double Your Money Back Guarantee', 'ضمان استرداد الضعف في حال عدم تحقيق النتيجة')}</option>
                      <option value="No Guarantee (Low Price/High Scarcity)">{L('No Guarantee (Low Price/High Scarcity)', 'بدون ضمان (سعر مخفض / ندرة عالية)')}</option>
                    </CustomSelect>
                  </div>

                  <button className="btn btn-prime" onClick={runOfferBuilder} style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}>
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Current Price', 'السعر الحالي')}</label>
                      <input className="inp" placeholder="$500" value={inputs.priceCurrent} onChange={e => handleInputChange('priceCurrent', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Product Type', 'نوع المنتج')}</label>
                      <CustomSelect className="inp" value={inputs.priceType} onChange={e => handleInputChange('priceType', e.target.value)}>
                        <option value="1-on-1 Coaching">1-on-1 Coaching</option>
                        <option value="Group Program">Group Program</option>
                        <option value="Online Course">Online Course</option>
                        <option value="DFY Service">DFY Service</option>
                      </CustomSelect>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Experience Level', 'مستوى الخبرة')}</label>
                      <CustomSelect className="inp" value={inputs.priceExp || ''} onChange={e => handleInputChange('priceExp', e.target.value)}>
                        <option value="Beginner (0-1 year)">Beginner (0-1 year)</option>
                        <option value="Intermediate (1-3 years)">Intermediate (1-3 years)</option>
                        <option value="Expert (5+ years)">Expert (5+ years)</option>
                      </CustomSelect>
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Target Income', 'الدخل المستهدف')}</label>
                      <input className="inp" placeholder="$5,000" value={inputs.priceIncome || ''} onChange={e => handleInputChange('priceIncome', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Monthly Expenses', 'المصروفات الشهرية')}</label>
                      <input className="inp" placeholder="$1,000" value={inputs.priceExpenses || ''} onChange={e => handleInputChange('priceExpenses', e.target.value)} />
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
                <div className="sec-hd"><div className="sec-title">🔄 {L('Sales Funnel Builder', 'منشئ مسارات المبيعات')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Main Product / Offer', 'المنتج الأساسي / العرض')}</label>
                    <input className="inp" placeholder="Coaching program, course..." value={inputs.funProduct} onChange={e => handleInputChange('funProduct', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Traffic Source', 'مصدر الترافيك')}</label>
                    <CustomSelect className="inp" value={inputs.funTraffic} onChange={e => handleInputChange('funTraffic', e.target.value)}>
                      <option value="Instagram organic">Instagram organic</option>
                      <option value="Meta Paid Ads">Meta Paid Ads</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Email list">Email list</option>
                    </CustomSelect>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Funnel Model', 'موديل المسار')}</label>
                      <CustomSelect className="inp" value={inputs.funModel} onChange={e => handleInputChange('funModel', e.target.value)}>
                        <option value="Lead gen → Call → Close">Lead gen → Call → Close</option>
                        <option value="Webinar funnel">Webinar funnel</option>
                        <option value="Free → Paid">Free → Paid</option>
                      </CustomSelect>
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
                <div className="sec-hd"><div className="sec-title">🧲 {L('Lead Magnet Builder', 'منشئ مغناطيس العملاء')}</div></div>
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
                    <CustomSelect className="inp" value={inputs.magnetFormat} onChange={e => handleInputChange('magnetFormat', e.target.value)}>
                      <option value="Free PDF / Guide">Free PDF / Guide</option>
                      <option value="Free Mini Course">Free Mini Course</option>
                      <option value="Free Webinar">Free Webinar</option>
                      <option value="Free Consultation">Free Consultation</option>
                    </CustomSelect>
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
                <div className="sec-hd"><div className="sec-title">⚡ {L('Landing Page Planner', 'مخطط صفحة الهبوط')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Offer / Product', 'العرض / المنتج')}</label>
                    <input className="inp" placeholder="What is the page selling?" value={inputs.lpPlanProduct} onChange={e => handleInputChange('lpPlanProduct', e.target.value)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Visitor Awareness', 'مستوى وعي الزائر')}</label>
                      <CustomSelect className="inp" value={inputs.lpPlanAware} onChange={e => handleInputChange('lpPlanAware', e.target.value)}>
                        <option value="Cold (never heard of you)">Cold (never heard of you)</option>
                        <option value="Warm (knows your content)">Warm (knows your content)</option>
                        <option value="Hot (ready to buy)">Hot (ready to buy)</option>
                      </CustomSelect>
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Page Goal', 'هدف الصفحة')}</label>
                      <CustomSelect className="inp" value={inputs.lpPlanGoal} onChange={e => handleInputChange('lpPlanGoal', e.target.value)}>
                        <option value="Collect leads">Collect leads</option>
                        <option value="Book a call">Book a call</option>
                        <option value="Direct purchase">Direct purchase</option>
                      </CustomSelect>
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
                <div className="sec-hd"><div className="sec-title">📈 {L('Conversion Optimizer', 'مُحسن معدلات التحويل')}</div></div>
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
                <div className="sec-hd"><div className="sec-title">📊 {L('KPI Planner & Dashboard', 'مخطط ولوحة مؤشرات الأداء')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Business Model', 'نموذج العمل')}</label>
                      <CustomSelect className="inp" value={inputs.kpiModel} onChange={e => handleInputChange('kpiModel', e.target.value)}>
                        <option value="Coaching / Services">Coaching / Services</option>
                        <option value="Online Courses">Online Courses</option>
                        <option value="E-commerce">E-commerce</option>
                        <option value="SaaS / App">SaaS / App</option>
                      </CustomSelect>
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Monthly Revenue Goal', 'هدف الإيرادات الشهري')}</label>
                      <input className="inp" placeholder="$10,000" value={inputs.kpiTarget} onChange={e => handleInputChange('kpiTarget', e.target.value)} />
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Current Stage', 'المرحلة الحالية')}</label>
                      <CustomSelect className="inp" value={inputs.kpiStage} onChange={e => handleInputChange('kpiStage', e.target.value)}>
                        <option value="Just starting">Just starting</option>
                        <option value="0-$3K/month">0-$3K/month</option>
                        <option value="$3K-$10K/month">$3K-$10K/month</option>
                        <option value="$10K+/month">$10K+/month</option>
                      </CustomSelect>
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Average Order Value (AOV)', 'متوسط قيمة الطلب/المبيعة')}</label>
                      <input className="inp" placeholder="$200" value={inputs.kpiAov || ''} onChange={e => handleInputChange('kpiAov', e.target.value)} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Actual Monthly Revenue', 'الإيرادات الشهرية الفعلية')}</label>
                      <input className="inp" placeholder="$3,000" value={inputs.kpiActualRev || ''} onChange={e => handleInputChange('kpiActualRev', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Actual Monthly Traffic/Leads', 'الزيارات/العملاء شهرياً')}</label>
                      <input className="inp" placeholder="500" value={inputs.kpiActualLeads || ''} onChange={e => handleInputChange('kpiActualLeads', e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Actual Conversion Rate (%)', 'معدل التحويل الحالي (%)')}</label>
                    <input className="inp" placeholder="1.5%" value={inputs.kpiActualConv || ''} onChange={e => handleInputChange('kpiActualConv', e.target.value)} />
                  </div>

                  <button className="btn btn-prime" onClick={runKPIPlanner} style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}>
                    📊 {L('Build My KPI Dashboard', 'أعد لوحة مؤشرات الأداء')}
                  </button>
                </div>
              </div>
              {renderResultCard('لوحة مؤشرات الأداء (KPIs)', 'KPI Dashboard', 'kpi-out', 'جاري إعداد وتحليل المؤشرات...', 'Analyzing performance metrics...', 'أدخل بياناتك الفعلية لتوليد لوحة متابعة الأداء مع تحليل الثغرات.', 'Enter your targets and actuals to generate a progress dashboard with leak analysis.', 'KPI Planner')}
            </div>
          )}

          {analTab === 'rev' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div className="sec-title">💰 {L('Revenue & Profit Forecast', 'توقعات الأرباح والإيرادات')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Average Sale Value', 'متوسط قيمة الصفقة')}</label>
                      <input className="inp" placeholder="$200" value={inputs.revAov} onChange={e => handleInputChange('revAov', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Monthly Leads/Traffic', 'العملاء المحتملون شهرياً')}</label>
                      <input className="inp" placeholder="100 leads" value={inputs.revLeads} onChange={e => handleInputChange('revLeads', e.target.value)} />
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Current Close Rate (%)', 'معدل الإغلاق الحالي (%)')}</label>
                      <input className="inp" placeholder="10%" value={inputs.revClose} onChange={e => handleInputChange('revClose', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Growth Plan', 'خطة النمو')}</label>
                      <CustomSelect className="inp" value={inputs.revGrowth} onChange={e => handleInputChange('revGrowth', e.target.value)}>
                        <option value="Organic only">Organic only</option>
                        <option value="Organic + ads">Organic + ads</option>
                        <option value="Ads focus">Ads focus</option>
                      </CustomSelect>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Monthly Ad Budget', 'الميزانية الإعلانية شهرياً')}</label>
                      <input className="inp" placeholder="$1,000" value={inputs.revAdBudget || ''} onChange={e => handleInputChange('revAdBudget', e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Monthly Operating Costs', 'المصروفات التشغيلية شهرياً')}</label>
                      <input className="inp" placeholder="$500" value={inputs.revOpCosts || ''} onChange={e => handleInputChange('revOpCosts', e.target.value)} />
                    </div>
                  </div>

                  <button className="btn btn-prime" onClick={runRevenueForecast} style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}>
                    💰 {L('Generate Revenue Forecast', 'ولّد توقعات الإيرادات والأرباح')}
                  </button>
                </div>
              </div>
              {renderResultCard('التوقعات المالية والأرباح', 'Revenue & Profit Projections', 'rev-forecast-out', 'جاري الاحتساب المالي والتوقعات...', 'Forecasting revenue and margins...', 'النمذجة المالية وتوقعات الأرباح والإيرادات الصافية لـ ٣٠ و ٦٠ و ٩٠ يوماً.', '30, 60, 90 day net profit and gross revenue projections.', 'Revenue Forecast')}
            </div>
          )}

          {analTab === 'leads' && (
            <div className="g2">
              <div className="card">
                <div className="sec-hd"><div className="sec-title">👥 {L('Lead Forecast', 'توقعات العملاء المحتملين')}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Current Audience Size', 'حجم الجمهور الحالي')}</label>
                    <input className="inp" placeholder="10,000 followers" value={inputs.leadAud} onChange={e => handleInputChange('leadAud', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Lead Gen Method', 'طريقة جمع العملاء')}</label>
                    <CustomSelect className="inp" value={inputs.leadMethod} onChange={e => handleInputChange('leadMethod', e.target.value)}>
                      <option value="Organic content + DM">Organic content + DM</option>
                      <option value="Lead magnet + email">Lead magnet + email</option>
                      <option value="Paid ads">Paid ads</option>
                    </CustomSelect>
                  </div>
                  <button className="btn btn-prime" onClick={runLeadForecast} style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}>
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
                <div className="sec-hd"><div className="sec-title">📈 {L('ROI Calculator', 'حاسبة عائد الاستثمار')}</div></div>
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
                <div className="sec-hd"><div className="sec-title">{L('ROI Analysis', 'تحليل العائد')}</div></div>
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
                        <div 
                          className="ai-box" 
                          style={{ overflowY: 'auto', maxHeight: '450px', background: 'var(--surface2)', padding: '14px', borderRadius: '8px' }}
                          dangerouslySetInnerHTML={{ __html: parseMarkdown(report.content) }}
                        />
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
