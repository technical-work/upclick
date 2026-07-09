import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';
import { parseMarkdown } from '../../utils/markdown';
import CustomSelect from '../CustomSelect';

export default function StrategyView() {
  const { lang, L, t, GC, saveGC, checkCredits, tenantConfig } = useBusiness();
  const [activeTab, setActiveTab] = useState('idea');
  const costSwotAnalysis = tenantConfig?.costSwotAnalysis !== undefined ? Number(tenantConfig.costSwotAnalysis) : 15;
  const costStrategyBuilder = tenantConfig?.costStrategyBuilder !== undefined ? Number(tenantConfig.costStrategyBuilder) : 50;
  const [loading, setLoading] = useState({});
  const [showExportModal, setShowExportModal] = useState(false);
  
  // GC.strategy.swot might have been an object previously, we'll ensure it is parsed as string if we output a string, 
  // or we just use a separate key like swot_analysis
  const swotData = typeof GC.strategy.swot === 'string' ? GC.strategy.swot : (GC.strategy.swot_analysis || '');
  
  const [aiOutputs, setAiOutputs] = useState({
    idea: GC.strategy.idea_analysis || '',
    icp: GC.strategy.icp || '',
    swot: swotData,
    roadmap: GC.strategy.roadmap || ''
  });

  // Combined Business Idea & Offer Inputs
  const [bizName, setBizName] = useState(GC.profile.name || '');
  const [bizDesc, setBizDesc] = useState(GC.profile.desc || '');
  const [bizNiche, setBizNiche] = useState(GC.profile.niche || '');
  const [bizStage, setBizStage] = useState(GC.profile.stage || 'Idea');

  const [offerName, setOfferName] = useState(GC.profile.offer?.name || '');
  const [offerTransform, setOfferTransform] = useState(GC.profile.offer?.transform || '');
  const [offerPrice, setOfferPrice] = useState(GC.profile.offer?.price || '');
  const [offerDuration, setOfferDuration] = useState(GC.profile.offer?.duration || '');
  const [offerDeliverables, setOfferDeliverables] = useState('');

  const handleSaveGC = (updatedFields) => {
    const updated = {
      ...GC,
      ...updatedFields
    };
    saveGC(updated);
  };

  // ── Trigger AIs with Streaming ──
  const triggerStrategyAI = async (key, promptText, systemText, saveCallback) => {
    const cost = key === 'swot' 
      ? costSwotAnalysis 
      : key === 'roadmap'
        ? costStrategyBuilder 
        : costSwotAnalysis;

    if (!checkCredits(cost)) {
      setLoading(prev => ({ ...prev, [key]: false }));
      return;
    }

    setAiOutputs(prev => ({ ...prev, [key]: '' }));
    setLoading(prev => ({ ...prev, [key]: true }));
    let accumulated = '';
    let hasReceivedFirstChunk = false;

    try {
      const response = await callClaudeAPI(
        promptText, 
        systemText, 
        lang, 
        GC, 
        `Strategy Lab - ${key}`, 
        (chunk) => {
          if (!hasReceivedFirstChunk) {
            hasReceivedFirstChunk = true;
            setLoading(prev => ({ ...prev, [key]: false }));
          }
          accumulated += chunk;
          setAiOutputs(prev => ({ ...prev, [key]: accumulated }));
        },
        cost
      );
      
      const finalRes = response || accumulated;
      setAiOutputs(prev => ({ ...prev, [key]: finalRes }));
      saveCallback(finalRes);
    } catch (e) {
      console.error(e);
      setAiOutputs(prev => ({ ...prev, [key]: L('Error generating strategy report.', 'حدث خطأ أثناء التوليد.') }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const saveProfileFields = () => {
    handleSaveGC({
      profile: { 
        ...GC.profile, 
        name: bizName, desc: bizDesc, niche: bizNiche, stage: bizStage,
        offer: { ...GC.profile.offer, name: offerName, price: offerPrice, transform: offerTransform, duration: offerDuration }
      }
    });
  };

  const runIdeaStrategy = async () => {
    saveProfileFields();
    const ideaPrompt = `Analyze my business and offer: 
Brand Name: "${bizName}"
Business Description: "${bizDesc}"
Niche/Industry: "${bizNiche}"
Business Stage: "${bizStage}"
Main Offer Name: "${offerName}"
Transformation/Final Result: "${offerTransform}"
Price: "${offerPrice}"
Duration: "${offerDuration}"
Deliverables: "${offerDeliverables}"

Write a comprehensive, professional, and detailed "Business & Offer Analysis" master plan. You must cover:
1. **Value Proposition Analysis**: A deep analysis of the transformation offered compared to the market.
2. **Pricing & Packaging Strategy**: Evaluate the price point of "${offerPrice}" for "${offerDuration}". Offer concrete advice on whether to position as premium, high-ticket, or low-ticket, and how to increase perceived value.
3. **Core Strategic Strengths (3 Items)**: Detailed breakdown of each strength with actionable recommendations on how to leverage it.
4. **Major Strategic Risks (3 Items)**: Identify deep business or market risks with detailed mitigation plans for each.
5. **Detailed Customer Validation Plan**: Step-by-step validation guide on how to test this concept with real potential buyers during the "${bizStage}" stage.
6. **Offer Optimization & Bonuses (3 Items)**: Propose 3 high-value, highly-customized bonus ideas that directly complement the main offer and reduce customer friction.`;
    const ideaSystem = `You are a world-class business architect and strategy consultant. You write highly comprehensive, detailed, masterclass-level reports. Avoid short lists, generic summaries, or brief bullet points. Expand on every point with detailed strategic theories, professional frameworks, and actionable business models. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;

    triggerStrategyAI('idea', ideaPrompt, ideaSystem, (finalRes) => {
      handleSaveGC({ 
        profile: { 
          ...GC.profile, 
          name: bizName, desc: bizDesc, niche: bizNiche, stage: bizStage,
          offer: { ...GC.profile.offer, name: offerName, price: offerPrice, transform: offerTransform, duration: offerDuration }
        },
        strategy: { ...GC.strategy, idea_analysis: finalRes } 
      });
    });
  };

  const runIcpStrategy = async () => {
    saveProfileFields();
    const icpPrompt = `Based on this Business and Offer:
Brand Name: "${bizName}"
Description: "${bizDesc}"
Niche: "${bizNiche}"
Main Offer Name: "${offerName}"
Transformation: "${offerTransform}"
Price: "${offerPrice}"

Build a highly comprehensive "Ideal Client Profile (ICP)" analysis. You must cover:
1. **Demographics & Detailed Psychographics**: Age group, role, income bracket, daily routine, core frustrations, inner hopes, and emotional triggers.
2. **Objection Handling Playbook (3 Key Objections)**: Detail the 3 most likely objections they will raise when pitched this offer (e.g. price, time, authority) and provide the exact response or angle to overcome each objection.
3. **Conversion-Optimized Copywriting Hooks (3 Angles)**: Write 3 highly compelling marketing hooks/headlines designed to capture this target client's attention.
4. **Traffic & Acquisition Channels**: Explain exactly where this specific persona spends time online (specific platforms, communities, search behaviors) and how to reach them.`;
    const icpSystem = `You are an expert consumer psychology and growth marketing strategist. Write a highly detailed, professional, and comprehensive Ideal Client Profile report. Avoid generic advice, short summaries, or brief bullet points. Expand fully on every section with deep behavioral psychology insights. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;

    triggerStrategyAI('icp', icpPrompt, icpSystem, (finalRes) => {
      handleSaveGC({ 
        profile: { 
          ...GC.profile, 
          name: bizName, desc: bizDesc, niche: bizNiche, stage: bizStage,
          offer: { ...GC.profile.offer, name: offerName, price: offerPrice, transform: offerTransform, duration: offerDuration }
        },
        strategy: { ...GC.strategy, icp: finalRes } 
      });
    });
  };

  const runSwotStrategy = async () => {
    saveProfileFields();
    const swotPrompt = `Based on this Business and Offer:
Brand Name: "${bizName}"
Description: "${bizDesc}"
Niche: "${bizNiche}"
Business Stage: "${bizStage}"
Main Offer Name: "${offerName}"

Perform a comprehensive, highly strategic, and localized "SWOT Analysis" and "Tactical Action Plan" specifically for this SaaS/software business. You must analyze the actual market, competitors (like ClickUp, Notion, custom spreadsheets, or WhatsApp workflows), and local business challenges (such as low trust in automation, data security concerns, migration friction, and pricing value perception).

You must cover:
1. **Strengths (S)**: 4 deep-dive, product-specific strengths. Do not list generic terms. Focus on localized value, personalization, all-in-one AI workflows, or specific onboarding support.
2. **Weaknesses (W)**: 4 real internal bottlenecks. Focus on validation stage issues, developer capacity, trust establishment, and high customer friction in migrating data.
3. **Opportunities (O)**: 4 actionable market trends. Focus on the rapid surge of AI adoption in small/medium businesses, demand for productivity consolidation, and the rise of remote team management.
4. **Threats (T)**: 4 real market risks. Focus on fast competitors, high customer churn if they don't see immediate value, pricing pressure, and customer technical illiteracy.
5. **Tactical Action Matrix (The Strategic Brain - عقل يفكر)**: Propose deep, concrete action steps:
   - SO Strategy: How to use your strengths (like localized setup) to capture opportunities (like the demand for AI productivity).
   - WO Strategy: How to leverage opportunities (like the surge in AI interest) to overcome weaknesses (like validation stage or lack of trust) through beta test campaigns or educational workshops.
   - ST Strategy: How to use your strengths (like tailored customization) to defend against threats (like competitors or copycats).
   - WT Strategy: How to minimize internal bottlenecks and defend against threats (e.g., how to build an easy-onboarding program to prevent churn and overcome customer technical illiteracy).`;
    const swotSystem = `You are an elite business advisor, startup strategist, and SaaS consultant specializing in AI applications and productivity platforms. You have deep knowledge of the competitive landscape (Notion, ClickUp, custom CRM solutions) and startup challenges. Write a highly analytical, critical, and strategic report. Avoid generic statements or textbook definitions. Speak like a real board advisor who understands startup mechanics, customer acquisition, and product-led growth. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;

    triggerStrategyAI('swot', swotPrompt, swotSystem, (finalRes) => {
      handleSaveGC({ 
        profile: { 
          ...GC.profile, 
          name: bizName, desc: bizDesc, niche: bizNiche, stage: bizStage,
          offer: { ...GC.profile.offer, name: offerName, price: offerPrice, transform: offerTransform, duration: offerDuration }
        },
        strategy: { ...GC.strategy, swot_analysis: finalRes } 
      });
    });
  };

  const runRoadmapStrategy = async () => {
    saveProfileFields();
    const roadmapPrompt = `Based on this Business and Offer:
Brand Name: "${bizName}"
Niche: "${bizNiche}"
Business Stage: "${bizStage}"
Main Offer Name: "${offerName}"
Price: "${offerPrice}"
Duration/Period: "${offerDuration}"

Build a highly comprehensive, week-by-week Growth Roadmap and Operational Blueprint designed specifically for the duration of "${offerDuration}". This roadmap is not just for marketing; it is a complete business execution plan.

You must cover:
1. **Strategic Timeline & Feedback Loop**: Emphasize that the user will follow this blueprint for "${offerDuration}". Clearly explain that as they log their leads, tasks, chats, and sales in their CRM, the AI will ingest this real-world performance data at the end of the "${offerDuration}" period to analyze conversion metrics, address weaknesses, and generate an even stronger, optimized strategy for the next phase.
2. **Three Concurrent Action Tracks (Product, Marketing, Sales)**: For every single week in the duration of "${offerDuration}" (e.g., if duration is 1 month, write weeks 1 to 4; if 3 months, write weeks 1 to 12. List them individually, e.g. Week 1, Week 2, Week 3, etc.):
   - **Product & Delivery Track**: Specific operational tasks, setup of tools, resource preparation, or beta onboarding.
   - **Marketing & Attraction Track**: Specific campaigns, lead magnets, social content topics, and automated outreach triggers.
   - **Sales & Closing Track**: Sales script adjustments, outreach follow-up schedule, payment links setup, and closing templates.
3. **Actionable Weekly Metrics to Track**: List specific numbers (like connection requests, link clicks, sales calls booked, screenshots received) they must record in their system daily.`;
    const roadmapSystem = `You are a world-class startup consultant, operations manager, and growth strategist. You write highly practical, comprehensive, week-by-week growth blueprints. Do not lump weeks together or give generic high-level marketing tips. For every single week of the specified duration, detail clear tasks for Product/Delivery, Marketing, and Sales. Establish a strong connection showing how logging data in the CRM feeds back into the AI for the next phase. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;

    triggerStrategyAI('roadmap', roadmapPrompt, roadmapSystem, (finalRes) => {
      handleSaveGC({ 
        profile: { 
          ...GC.profile, 
          name: bizName, desc: bizDesc, niche: bizNiche, stage: bizStage,
          offer: { ...GC.profile.offer, name: offerName, price: offerPrice, transform: offerTransform, duration: offerDuration }
        },
        strategy: { ...GC.strategy, roadmap: finalRes } 
      });
    });
  };

  const runCompleteStrategy = async () => {
    runIdeaStrategy();
    runIcpStrategy();
    runSwotStrategy();
    runRoadmapStrategy();
  };

  return (
    <div className="pg on" id="pg-strategy">
      {showExportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '800px', height: '90vh', overflowY: 'auto', position: 'relative', background: 'var(--surface)' }}>
            <button className="btn btn-ghost" style={{ position: 'absolute', top: '15px', right: '15px' }} onClick={() => setShowExportModal(false)}>✕</button>
            <div className="sec-hd"><div className="sec-title">📑 {L('Strategy Overview', 'النظرة العامة للاستراتيجية')}</div></div>
            <div className="ai-box" style={{ background: 'transparent', border: 'none' }} dangerouslySetInnerHTML={{ 
              __html: parseMarkdown(
                `# ${L('Business Idea & Offer', 'فكرة البزنس والعرض')}\n\n${aiOutputs.idea || ''}\n\n---\n\n` +
                `# ${L('Ideal Client Profile', 'العميل المثالي')}\n\n${aiOutputs.icp || ''}\n\n---\n\n` +
                `# ${L('SWOT Analysis', 'تحليل SWOT')}\n\n${aiOutputs.swot || ''}\n\n---\n\n` +
                `# ${L('Growth Roadmap', 'خارطة طريق النمو')}\n\n${aiOutputs.roadmap || ''}`
              ) 
            }} />
          </div>
        </div>
      )}

      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">🧠</span>
          <span>{t('Strategy Lab')}</span>
        </div>
        <div className="pg-actions">
          {activeTab === 'roadmap' && (
            <button className="btn btn-prime" onClick={() => setShowExportModal(true)}>
              📑 {L('Export Overview', 'تصدير النظرة العامة')}
            </button>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="tabs-bar" id="strategy-tabs" style={{ marginBottom: '14px' }}>
        <button className={`tab-btn ${activeTab === 'idea' ? 'on' : ''}`} onClick={() => setActiveTab('idea')}>{L('Business Idea', 'فكرة العمل')}</button>
        <button className={`tab-btn ${activeTab === 'icp' ? 'on' : ''}`} onClick={() => setActiveTab('icp')}>{L('Ideal Client', 'العميل المثالي')}</button>
        <button className={`tab-btn ${activeTab === 'swot' ? 'on' : ''}`} onClick={() => setActiveTab('swot')}>{L('SWOT Analysis', 'تحليل SWOT')}</button>
        <button className={`tab-btn ${activeTab === 'roadmap' ? 'on' : ''}`} onClick={() => setActiveTab('roadmap')}>{L('Roadmap', 'خارطة الطريق')}</button>
      </div>

      {/* ── TAB 1: BUSINESS IDEA & OFFER ── */}
      {activeTab === 'idea' && (
        <div className="g2">
          <div className="card">
            <div className="sec-hd"><div className="sec-title">💡 {L('Business & Offer Setup', 'إعداد البزنس والعرض')}</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Business / Project Name', 'اسم المشروع / البزنس')}</label>
                <input className="inp" placeholder="e.g. Sara's Coaching Academy" value={bizName} onChange={e => setBizName(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('What do you do? (1 sentence)', 'ماذا تفعل؟ (في جملة واحدة)')}</label>
                <textarea className="inp" rows="2" placeholder="I help Arab entrepreneurs..." value={bizDesc} onChange={e => setBizDesc(e.target.value)}></textarea>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Your Niche', 'مجالك (النيش)')}</label>
                <input className="inp" placeholder="e.g. Business Coaching for Women" value={bizNiche} onChange={e => setBizNiche(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Business Stage', 'مرحلة البزنس')}</label>
                <CustomSelect className="inp" value={bizStage} onChange={e => setBizStage(e.target.value)}>
                  <option value="Idea">Idea — Just starting to explore</option>
                  <option value="Validation">Validation — Testing the concept</option>
                  <option value="Launch">Launch — Getting first clients</option>
                  <option value="Growth">Growth — Scaling up</option>
                </CustomSelect>
              </div>
              <hr style={{ border: 'none', borderBottom: '1px dashed var(--edge)', margin: '10px 0' }} />
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Your Main Offer Name', 'اسم عرضك الأساسي')}</label>
                <input className="inp" placeholder="e.g. 12-Week Business Accelerator" value={offerName} onChange={e => setOfferName(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Transformative Result', 'النتيجة / التحول النهائي')}</label>
                <textarea className="inp" rows="2" placeholder="From struggling freelancer to 6-figure agency owner" value={offerTransform} onChange={e => setOfferTransform(e.target.value)}></textarea>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Price', 'السعر')}</label>
                  <input className="inp" placeholder="$2,500" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Duration', 'المدة الزمنية')}</label>
                  <input className="inp" placeholder="12 weeks" value={offerDuration} onChange={e => setOfferDuration(e.target.value)} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Key Deliverables', 'أهم المخرجات والوسائل')}</label>
                <input className="inp" placeholder="Weekly calls, templates, telegram support..." value={offerDeliverables} onChange={e => setOfferDeliverables(e.target.value)} />
              </div>

              <button className="btn btn-prime" onClick={runCompleteStrategy} style={{ justifyContent: 'center', marginTop: '10px', fontSize: '14px', padding: '12px' }} disabled={loading.idea || loading.icp || loading.swot || loading.roadmap}>
                {loading.idea ? L('Generating...', 'جاري التوليد...') : `🧠 ${L('Generate Complete Strategy', 'بناء الاستراتيجية الشاملة')}`}
              </button>
            </div>
          </div>
          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">{L('Idea & Offer Analysis', 'تحليل الفكرة والعرض')}</div>
              <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '11px', minWidth: 'auto' }} onClick={runIdeaStrategy} disabled={loading.idea}>
                ✦ {L('Generate / Update', 'توليد / تحديث')} ({costSwotAnalysis} Credits)
              </button>
            </div>
            <div 
              className="ai-box"
              dangerouslySetInnerHTML={{ 
                __html: loading.idea ? L('Analyzing concept and optimizing offer...', 'جاري تحليل الفكرة وتحسين العرض...') : parseMarkdown(aiOutputs.idea || L('Your analysis report will appear here.', 'سيظهر تقرير التحليل هنا.'))
              }}
            />
          </div>
        </div>
      )}

      {/* ── TAB 2: ICP BUILDER ── */}
      {activeTab === 'icp' && (
        <div className="card">
          <div className="sec-hd">
            <div className="sec-title">🎯 {L('Ideal Client Profile (ICP)', 'الملف المثالي للعميل')}</div>
            <button className="btn-ai" style={{ fontSize: '11.5px', padding: '5px 10px' }} onClick={runIcpStrategy} disabled={loading.icp}>
              ✦ {L('Generate ICP', 'توليد الملف المثالي')} ({costSwotAnalysis} Credits)
            </button>
          </div>
          <div 
            className="ai-box"
            dangerouslySetInnerHTML={{ 
              __html: loading.icp ? L('Building profile based on your business idea...', 'جاري بناء الملف بناءً على فكرة البزنس...') : parseMarkdown(aiOutputs.icp || L('Detailed client profile will automatically generate when you run the strategy.', 'سيتم توليد ملف العميل تلقائياً عند بناء الاستراتيجية.'))
            }}
          />
        </div>
      )}

      {/* ── TAB 3: SWOT ── */}
      {activeTab === 'swot' && (
        <div className="card">
          <div className="sec-hd">
            <div className="sec-title">⚔️ {L('SWOT Analysis', 'تحليل SWOT')}</div>
            <button className="btn-ai" style={{ fontSize: '11.5px', padding: '5px 10px' }} onClick={runSwotStrategy} disabled={loading.swot}>
              ✦ {L('Generate SWOT', 'توليد تحليل SWOT')} ({costSwotAnalysis} Credits)
            </button>
          </div>
          <div 
            className="ai-box"
            dangerouslySetInnerHTML={{ 
              __html: loading.swot ? L('Generating SWOT matrix insights...', 'جاري كتابة تحليلات SWOT...') : parseMarkdown(aiOutputs.swot || L('Actionable SWOT strategies will automatically generate when you run the strategy.', 'سيتم توليد تحليل SWOT تلقائياً عند بناء الاستراتيجية.'))
            }}
          />
        </div>
      )}

      {/* ── TAB 4: ROADMAP ── */}
      {activeTab === 'roadmap' && (
        <div className="card">
          <div className="sec-hd">
            <div className="sec-title">🗺️ {L('Growth Roadmap', 'خارطة طريق النمو')}</div>
            <button className="btn-ai" style={{ fontSize: '11.5px', padding: '5px 10px' }} onClick={runRoadmapStrategy} disabled={loading.roadmap}>
              ✦ {L('Generate Roadmap', 'توليد خارطة الطريق')} ({costStrategyBuilder} Credits)
            </button>
          </div>
          <div 
            className="ai-box"
            dangerouslySetInnerHTML={{ 
              __html: loading.roadmap ? L('Building roadmap...', 'جاري بناء خطة العمل...') : parseMarkdown(aiOutputs.roadmap || L('Your personalized roadmap will automatically generate when you run the strategy.', 'سيتم توليد خارطة الطريق تلقائياً عند بناء الاستراتيجية.'))
            }}
          />
        </div>
      )}
    </div>
  );
}
