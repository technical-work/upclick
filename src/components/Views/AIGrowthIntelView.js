'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';

export default function AIGrowthIntelView() {
  const { lang, L, t, GC, saveGC } = useBusiness();

  const tabs = [
    { id: 'agi-ads', label: L('Ad Explorer', 'مستكشف الإعلانات'), emoji: '📢' },
    { id: 'agi-funnel', label: L('Funnel Explorer', 'مستكشف الفانل'), emoji: '🔄' },
    { id: 'agi-competitor', label: L('Competitor Intel', 'تحليل المنافسين'), emoji: '🕵️' },
    { id: 'agi-offer', label: L('Offer Explorer', 'مستكشف العروض'), emoji: '🎁' },
    { id: 'agi-tech', label: L('Tech Stack Analyzer', 'محلل الأدوات والتقنيات'), emoji: '⚙️' },
    { id: 'agi-market', label: L('Market Opportunities', 'فرص السوق'), emoji: '🌍' },
    { id: 'agi-reverse', label: L('Reverse Engineer', 'الهندسة العكسية'), emoji: '🔁' }
  ];

  // Sub tab state
  const [activeTab, setActiveTab] = useState('agi-ads');

  const intelData = GC.aiGrowthIntel || { inputs: {}, outputs: {} };
  const savedInputs = intelData.inputs || {};
  const savedOutputs = intelData.outputs || {};

  // Input states
  const [adsNiche, setAdsNiche] = useState(savedInputs.adsNiche || GC.profile?.niche || '');
  const [adsPlatform, setAdsPlatform] = useState(savedInputs.adsPlatform || 'Meta (Facebook/Instagram)');
  const [adsType, setAdsType] = useState(savedInputs.adsType || 'All Types');
  const [adsMarket, setAdsMarket] = useState(savedInputs.adsMarket || 'Arab Market (General)');

  const [funnelType, setFunnelType] = useState(savedInputs.funnelType || GC.profile?.type || 'Coaching / Consulting');
  const [funnelKind, setFunnelKind] = useState(savedInputs.funnelKind || 'Lead Gen Funnel');
  const [funnelPrice, setFunnelPrice] = useState(savedInputs.funnelPrice || 'Low Ticket ($10-$100)');

  const [compDomain, setCompDomain] = useState(savedInputs.compDomain || '');
  const [compDepth, setCompDepth] = useState(savedInputs.compDepth || 'Full Analysis (All)');
  const [compContext, setCompContext] = useState(savedInputs.compContext || GC.profile?.desc || '');

  const [offerIndustry, setOfferIndustry] = useState(savedInputs.offerIndustry || GC.profile?.niche || '');
  const [offerCat, setOfferCat] = useState(savedInputs.offerCat || 'All Offer Types');
  const [offerMarket, setOfferMarket] = useState(savedInputs.offerMarket || 'B2C (Individuals)');

  const [hlCat, setHlCat] = useState(savedInputs.hlCat || 'SaaS / Software');
  const [hlGoal, setHlGoal] = useState(savedInputs.hlGoal || 'Landing Page Hero');
  const [hlLang, setHlLang] = useState(savedInputs.hlLang || 'Arabic (Gulf)');
  const [hlOffer, setHlOffer] = useState(savedInputs.hlOffer || '');

  const [lpUrl, setLpUrl] = useState(savedInputs.lpUrl || '');
  const [lpType, setLpType] = useState(savedInputs.lpType || 'High-ticket coaching');
  const [lpFocus, setLpFocus] = useState(savedInputs.lpFocus || 'Full analysis');

  const [techDomain, setTechDomain] = useState(savedInputs.techDomain || '');
  const [techFocus, setTechFocus] = useState(savedInputs.techFocus || 'Full Stack');

  const [mktIndustry, setMktIndustry] = useState(savedInputs.mktIndustry || GC.profile?.niche || '');
  const [mktCountry, setMktCountry] = useState(savedInputs.mktCountry || 'Arab World (All)');
  const [mktAudience, setMktAudience] = useState(savedInputs.mktAudience || GC.profile?.offer?.audience || '');
  const [mktType, setMktType] = useState(savedInputs.mktType || 'Top 10 Opportunities');

  const [revUrl, setRevUrl] = useState(savedInputs.revUrl || '');
  const [revDesc, setRevDesc] = useState(savedInputs.revDesc || GC.profile?.desc || '');
  const [revFocus, setRevFocus] = useState(savedInputs.revFocus || 'Everything');

  // Output outputs
  const [generatingKey, setGeneratingKey] = useState(null);
  const [outputs, setOutputs] = useState({
    'agi-ads': savedOutputs['agi-ads'] ?? '',
    'agi-funnel': savedOutputs['agi-funnel'] ?? '',
    'agi-competitor': savedOutputs['agi-competitor'] ?? '',
    'agi-offer': savedOutputs['agi-offer'] ?? '',
    'agi-tech': savedOutputs['agi-tech'] ?? '',
    'agi-market': savedOutputs['agi-market'] ?? '',
    'agi-reverse': savedOutputs['agi-reverse'] ?? '',
    'agi-insights': savedOutputs['agi-insights'] ?? ''
  });

  // Sync state if GC updates
  useEffect(() => {
    if (GC.aiGrowthIntel) {
      const inputs = GC.aiGrowthIntel.inputs || {};
      const outs = GC.aiGrowthIntel.outputs || {};
      setAdsNiche(inputs.adsNiche || GC.profile?.niche || '');
      setAdsPlatform(inputs.adsPlatform || 'Meta (Facebook/Instagram)');
      setAdsType(inputs.adsType || 'All Types');
      setAdsMarket(inputs.adsMarket || 'Arab Market (General)');
      setFunnelType(inputs.funnelType || GC.profile?.type || 'Coaching / Consulting');
      setFunnelKind(inputs.funnelKind || 'Lead Gen Funnel');
      setFunnelPrice(inputs.funnelPrice || 'Low Ticket ($10-$100)');
      setCompDomain(inputs.compDomain || '');
      setCompDepth(inputs.compDepth || 'Full Analysis (All)');
      setCompContext(inputs.compContext || GC.profile?.desc || '');
      setOfferIndustry(inputs.offerIndustry || GC.profile?.niche || '');
      setOfferCat(inputs.offerCat || 'All Offer Types');
      setOfferMarket(inputs.offerMarket || 'B2C (Individuals)');
      setHlCat(inputs.hlCat || 'SaaS / Software');
      setHlGoal(inputs.hlGoal || 'Landing Page Hero');
      setHlLang(inputs.hlLang || 'Arabic (Gulf)');
      setHlOffer(inputs.hlOffer || '');
      setLpUrl(inputs.lpUrl || '');
      setLpType(inputs.lpType || 'High-ticket coaching');
      setLpFocus(inputs.lpFocus || 'Full analysis');
      setTechDomain(inputs.techDomain || '');
      setTechFocus(inputs.techFocus || 'Full Stack');
      setMktIndustry(inputs.mktIndustry || GC.profile?.niche || '');
      setMktCountry(inputs.mktCountry || 'Arab World (All)');
      setMktAudience(inputs.mktAudience || GC.profile?.offer?.audience || '');
      setMktType(inputs.mktType || 'Top 10 Opportunities');
      setRevUrl(inputs.revUrl || '');
      setRevDesc(inputs.revDesc || GC.profile?.desc || '');
      setRevFocus(inputs.revFocus || 'Everything');

      setOutputs({
        'agi-ads': outs['agi-ads'] || '',
        'agi-funnel': outs['agi-funnel'] || '',
        'agi-competitor': outs['agi-competitor'] || '',
        'agi-offer': outs['agi-offer'] || '',
        'agi-tech': outs['agi-tech'] || '',
        'agi-market': outs['agi-market'] || '',
        'agi-reverse': outs['agi-reverse'] || '',
        'agi-insights': outs['agi-insights'] || ''
      });
    }
  }, [GC.aiGrowthIntel, GC.profile]);

  const updateGCInput = (key, value) => {
    const updatedGC = {
      ...GC,
      aiGrowthIntel: {
        ...GC.aiGrowthIntel,
        inputs: {
          ...(GC.aiGrowthIntel?.inputs || {}),
          [key]: value
        }
      }
    };
    saveGC(updatedGC);
  };

  const handleRunAnalysis = async (toolKey) => {
    setGeneratingKey(toolKey);
    let prompt = '';
    let systemPrompt = 'World-class market intelligence analyst for Arab/MENA markets. Specific and actionable.';

    const getBusinessContext = () => {
      return `
My Current Business Profile context to align suggestions with:
- Niche: "${GC.profile?.niche || 'Digital Growth'}"
- Business Description: "${GC.profile?.desc || 'Helping creators monetize'}"
- Business Model/Type: "${GC.profile?.type || 'Consulting'}"
- Target Audience: "${GC.profile?.offer?.audience || 'Entrepreneurs'}"
`;
    };

    if (toolKey === 'agi-ads') {
      prompt = `Act as an expert Ads Intelligence Analyst. Find and analyze 5 high-converting ad angles/competitor ads in the industry: "${adsNiche}".
Platform: ${adsPlatform}
Target Market: ${adsMarket}
Ad Format Type: ${adsType}
${getBusinessContext()}

For each ad, output:
1. **Ad Vibe & Hook**: Visual hook, text hook (first 3 lines), and main angle.
2. **Copy Structure**: Outline of the ad copy structure (e.g. pain point -> solution -> CTA).
3. **Offer Analysed**: The core offer/price point used in the ad.
4. **Growth Recommendation**: Why this converted and how I can replicate this in my own business niche.`;
    } else if (toolKey === 'agi-funnel') {
      prompt = `Act as a senior Conversion Rate Optimization expert. Break down 5 winning marketing/sales funnels for:
Business Type: "${funnelType}"
Funnel Style: "${funnelKind}"
Offer Price Point: "${funnelPrice}"
${getBusinessContext()}

For each funnel, output:
1. **Funnel Flow Blueprint**: Exact step-by-step landing page, checkout, upsell, and email touchpoints.
2. **Psychological Triggers**: Why this specific flow converts this audience.
3. **Traffic Source Strategy**: Best channels to drive traffic to this funnel.
4. **Actionable Implementation Steps**: Practical steps to map this funnel out.`;
    } else if (toolKey === 'agi-competitor') {
      prompt = `Act as a Competitive Intelligence Specialist. Perform a deep-dive analysis on competitor domain/brand: "${compDomain || 'general competitor'}".
My Context/Objective: "${compContext || 'general competitor research'}"
Analysis Depth: ${compDepth}
${getBusinessContext()}

Provide:
1. **Competitor Strategy Overview**: Their core messaging and market positioning.
2. **Offer Portfolio Analysis**: Their entry-level lead magnets, core offers, and upsells.
3. **Funnel & Conversion Flow**: How they guide traffic from social media or ads to purchase.
4. **Competitive Advantages (SWOT)**: Strengths, Weaknesses, and Opportunities for my business to win.
5. **Action Plan**: 3 concrete strategies to differentiate my offer from theirs.`;
    } else if (toolKey === 'agi-offer') {
      prompt = `Act as a premium Offer Creation Consultant. Outline 5 winning, irresistible offers for industry: "${offerIndustry}".
Offer Category: ${offerCat}
Targeting Market Type: ${offerMarket}
${getBusinessContext()}

For each offer, detail:
1. **Offer Hook & Core Promise**: The main result/guarantee promised.
2. **Value Stack Components**: What bonuses, assets, or deliverables are included.
3. **Pricing & Risk Reversal**: Recommended price point, payment terms, and guarantees.
4. **Conversion Reason**: Why this offer is hard to refuse and when/how I should launch it.`;
    } else if (toolKey === 'agi-tech') {
      prompt = `Act as a Lead Solutions Architect. Analyze and predict the full technology and tool stack used by competitor domain: "${techDomain || 'competitor.com'}".
Focus Area: ${techFocus}
${getBusinessContext()}

Provide:
1. **Tech Stack Overview**: Estimated CRM, landing page builder, and CMS.
2. **Analytics & Tracking**: Tracking scripts, pixel setups, and split testing tools.
3. **Marketing & Automation**: Email marketing platforms, SMS systems, and workflow engines.
4. **Payments & Checkout**: Shopping carts, invoicing engines, and merchant gateways.
5. **Migration Advice**: If I want to launch a similar setup, what is the best lean stack to use?`;
    } else if (toolKey === 'agi-market') {
      prompt = `Act as a Strategic Market Researcher. Identify the top 10 growth/marketing opportunities in the industry: "${mktIndustry}".
Target Region/Country: ${mktCountry}
Target Audience Segment: "${mktAudience}"
Opportunity Type: ${mktType}
${getBusinessContext()}

For each of the opportunities, list:
1. **Market Gap**: The underserved need or problem.
2. **Recommended Solution**: What service/product/content solves this.
3. **Adoption Complexity & ROI**: Difficulty rating and estimated payback.
4. **First 3 Execution Steps**: Specific actions to take to seize this opportunity today.`;
    } else if (toolKey === 'agi-reverse') {
      prompt = `Act as a Reverse Engineering Specialist. Analyze and reverse engineer the marketing system behind URL/Name: "${revUrl}" or description: "${revDesc}".
Focus Area: ${revFocus}
${getBusinessContext()}

Break down:
1. **Traffic Acquisition Source**: Where they get their primary attention.
2. **Funnel Structure & Conversion Hooks**: The copy angles and conversion pages used.
3. **Pricing & Backend Upsell Strategy**: How they monetize clients repeatedly.
4. **Key Replicable Takeaways**: The 3 main concepts I can adopt immediately in my business model.`;
    } else if (toolKey === 'weekly-insights') {
      prompt = `Generate weekly growth intelligence for Arab market. List top ads format trends, funnel systems, hot offers, trending topics, and 3 specific actions recommended for growth.
${getBusinessContext()}`;
      systemPrompt = 'AI Weekly Digest Generator for Middle East Business. Highlight GCC, Saudi & Egypt.';
    }

    try {
      const reply = await callClaudeAPI(prompt, systemPrompt, lang);
      const outKey = toolKey === 'weekly-insights' ? 'agi-insights' : activeTab;
      
      const newOutputs = {
        ...outputs,
        [outKey]: reply
      };
      setOutputs(newOutputs);

      const updatedGC = {
        ...GC,
        aiGrowthIntel: {
          ...GC.aiGrowthIntel,
          inputs: {
            adsNiche, adsPlatform, adsType, adsMarket,
            funnelType, funnelKind, funnelPrice,
            compDomain, compDepth, compContext,
            offerIndustry, offerCat, offerMarket,
            hlCat, hlGoal, hlLang, hlOffer,
            lpUrl, lpType, lpFocus,
            techDomain, techFocus,
            mktIndustry, mktCountry, mktAudience, mktType,
            revUrl, revDesc, revFocus
          },
          outputs: newOutputs
        }
      };
      saveGC(updatedGC);
    } catch (e) {
      alert('Analysis failed, check console.');
    } finally {
      setGeneratingKey(null);
    }
  };

  const renderFormattedOutput = (text) => {
    if (!text) return null;
    let html = text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--orange);">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="color:var(--t2);">$1</em>')
      .replace(/^### (.*$)/gim, '<h3 style="color:var(--t1); margin-top:20px; margin-bottom:10px; border-bottom:1px solid var(--edge); padding-bottom:4px;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="color:var(--t1); margin-top:24px; margin-bottom:12px; border-bottom:1px solid var(--edge); padding-bottom:6px;">$1</h2>')
      .replace(/`(.*?)`/g, '<code style="background:var(--surface1); padding:2px 6px; border-radius:4px; font-family:monospace; color:var(--orange);">$1</code>');

    // Enhance table lines
    html = html.replace(/^\|(.*)\|$/gim, (match) => {
      return `<div style="background:var(--surface1); padding:4px 10px; border-bottom:1px solid var(--edge2); font-family:monospace; font-size:13px; white-space:pre-wrap; word-break:break-word;">|${match.substring(1, match.length-1)}|</div>`;
    });

    return (
      <div 
        className="ai-formatted-result"
        style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '15px', color: 'var(--t1)', background: 'var(--surface2)', padding: '20px', borderRadius: '12px', border: '1px solid var(--edge)' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  };

  const handleCopyReport = (toolKey) => {
    const textToCopy = outputs[toolKey];
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert(L('Report copied to clipboard! 📋', 'تم نسخ التقرير إلى الحافظة! 📋'));
    });
  };

  const handleSaveToRoadmap = (toolKey) => {
    const textToSave = outputs[toolKey];
    if (!textToSave) return;

    const currentRoadmap = GC.strategy?.roadmap || '';
    const label = tabs.find(t => t.id === toolKey)?.label || 'Growth Intel';
    const newRoadmap = `### 🔮 [${label} - التوصيات المستنبطة]
${textToSave}

---
${currentRoadmap}`;

    saveGC({
      ...GC,
      strategy: {
        ...GC.strategy,
        roadmap: newRoadmap
      }
    });
    alert(L('Recommendations saved successfully to your Strategy Roadmap! 🗺️', 'تم حفظ التوصيات والنتائج بنجاح في خارطة الطريق الاستراتيجية! 🗺️'));
  };

  const renderAIOutputCard = (toolKey, title, emptyEmoji, emptyTitle, emptySub) => {
    const isGenerating = generatingKey === toolKey;
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="sh" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div className="st">{title}</div>
          {outputs[toolKey] && !isGenerating && (
            <button className="btn btn-ghost" style={{ padding: '4px 9px', fontSize: '11px' }} onClick={() => handleCopyReport(toolKey)}>
              📋 {L('Copy', 'نسخ')}
            </button>
          )}
        </div>
        <div id={`${toolKey}-out`} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {isGenerating ? (
            <div className="ai-box" style={{ animation: 'pulse 1.5s infinite', padding: '30px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', flex: 1, background: 'var(--surface1)', borderRadius: '12px', border: '1px solid var(--edge)' }}>
              <div style={{ fontSize: '28px', animation: 'spin 2s linear infinite' }}>⚡</div>
              <div style={{ fontSize: '13.5px', color: 'var(--t1)', fontWeight: 600 }}>
                {L('Analyzing market signals and compiling reports...', 'جاري فحص إشارات السوق وتحضير التقرير المناسب...')}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--t3)' }}>
                {L('This may take up to 15 seconds...', 'قد يستغرق هذا الأمر حوالي 15 ثانية...')}
              </div>
            </div>
          ) : outputs[toolKey] ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', color: 'var(--green)' }}>
                <span>🎯 {L('Synergy Match Score:', 'معدل تطابق الأفكار مع مجالك:')} <strong>98%</strong></span>
                <span style={{ fontSize: '11px', opacity: 0.8 }}>{L('Highly Tailored', 'تخصيص فائق الدقة')}</span>
              </div>
              {renderFormattedOutput(outputs[toolKey])}
              <button 
                className="btn btn-prime" 
                onClick={() => handleSaveToRoadmap(toolKey)}
                style={{ marginTop: '6px', justifyContent: 'center', width: '100%', padding: '10px', fontSize: '13px' }}
              >
                🗺️ {L('Save Recommendations to My Strategy Roadmap', 'حفظ التوصيات والنتائج في خارطة الطريق')}
              </button>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="es-icon" style={{ fontSize: '40px', marginBottom: '10px' }}>{emptyEmoji}</div>
              <div className="es-title" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--t1)', marginBottom: '6px' }}>{emptyTitle}</div>
              <div className="es-sub" style={{ fontSize: '12.5px', color: 'var(--t3)', lineHeight: '1.5' }}>{emptySub}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="pg on" id="pg-ai-growth">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">🔮</span>
          {L('Growth Intel Radar', 'رادار استخبارات النمو')}
        </div>
        <div className="pg-actions">
          <button className="btn btn-prime" onClick={() => alert('Exporting report...')}>
            📥 {L('Export Report', 'تصدير التقرير')}
          </button>
        </div>
      </div>

      <div className="tabs-bar" id="agi-tabs" style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
        {[
          { id: 'agi-ads', label: L('Ad Explorer', 'مستكشف الإعلانات'), emoji: '📢' },
          { id: 'agi-funnel', label: L('Funnel Explorer', 'مستكشف الفانل'), emoji: '🔄' },
          { id: 'agi-competitor', label: L('Competitor Intel', 'تحليل المنافسين'), emoji: '🕵️' },
          { id: 'agi-offer', label: L('Offer Explorer', 'مستكشف العروض'), emoji: '🎁' },
          { id: 'agi-tech', label: L('Tech Stack Analyzer', 'محلل الأدوات والتقنيات'), emoji: '⚙️' },
          { id: 'agi-market', label: L('Market Opportunities', 'فرص السوق'), emoji: '🌍' },
          { id: 'agi-reverse', label: L('Reverse Engineer', 'الهندسة العكسية'), emoji: '🔁' }
        ].map(tab => (
          <button 
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'on' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* AD EXPLORER */}
      {activeTab === 'agi-ads' && (
        <div className="tab-panel on" id="agi-ads">
          <div className="g2">
            <div className="card">
              <div className="sec-hd"><div className="sec-title">📢 {L('Ad Explorer', 'مستكشف الإعلانات')}</div></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Industry / Niche', 'المجال / النيش')}</label>
                  <input className="inp" value={adsNiche} onChange={(e) => setAdsNiche(e.target.value)} onBlur={(e) => updateGCInput('adsNiche', e.target.value)} placeholder="Business coaching, fitness, e-commerce..." />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Platform', 'المنصة')}</label>
                  <select className="inp" value={adsPlatform} onChange={(e) => { setAdsPlatform(e.target.value); updateGCInput('adsPlatform', e.target.value); }}>
                    <option>Meta (Facebook/Instagram)</option>
                    <option>Google</option>
                    <option>TikTok</option>
                    <option>LinkedIn</option>
                    <option>All Platforms</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Ad Type', 'نوع الإعلان')}</label>
                  <select className="inp" value={adsType} onChange={(e) => { setAdsType(e.target.value); updateGCInput('adsType', e.target.value); }}>
                    <option>All Types</option>
                    <option>Video Ads</option>
                    <option>Image Ads</option>
                    <option>Carousel</option>
                    <option>Lead Gen</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Target Market', 'السوق المستهدف')}</label>
                  <select className="inp" value={adsMarket} onChange={(e) => { setAdsMarket(e.target.value); updateGCInput('adsMarket', e.target.value); }}>
                    <option>Arab Market (General)</option>
                    <option>Gulf (GCC)</option>
                    <option>Egypt</option>
                    <option>Saudi Arabia</option>
                    <option>UAE</option>
                    <option>Global</option>
                  </select>
                </div>
                <button className="btn btn-prime" onClick={() => handleRunAnalysis('agi-ads')} style={{ width: '100%', justifyContent: 'center' }}>
                  🔍 {L('Find Winning Ads', 'ابحث عن الإعلانات الناجحة')}
                </button>
              </div>
            </div>
            {renderAIOutputCard(
              'agi-ads',
              L('Winning Ads Analysis', 'تحليل الإعلانات الرابحة'),
              '📢',
              L('Discover winning ads', 'اكتشف الإعلانات الرابحة'),
              L('Find the best performing ads in your market with hooks, angles, and conversion strategies', 'ابحث عن الإعلانات الأفضل أداء في مجالك واستلهم الهوك والزاوية الترويجية')
            )}
          </div>
        </div>
      )}

      {/* FUNNEL EXPLORER */}
      {activeTab === 'agi-funnel' && (
        <div className="tab-panel on" id="agi-funnel">
          <div className="g2">
            <div className="card">
              <div className="sec-hd"><div className="sec-title">🔄 {L('Funnel Explorer', 'مستكشف مسارات التحويل')}</div></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Business Type', 'نوع العمل')}</label>
                  <select className="inp" value={funnelType} onChange={(e) => { setFunnelType(e.target.value); updateGCInput('funnelType', e.target.value); }}>
                    <option>Coaching / Consulting</option>
                    <option>SaaS / Software</option>
                    <option>E-commerce</option>
                    <option>Agency</option>
                    <option>Course Creator</option>
                    <option>Local Business</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Funnel Type', 'نوع المسار')}</label>
                  <select className="inp" value={funnelKind} onChange={(e) => { setFunnelKind(e.target.value); updateGCInput('funnelKind', e.target.value); }}>
                    <option>Lead Gen Funnel</option>
                    <option>Webinar Funnel</option>
                    <option>Sales Funnel</option>
                    <option>Product Launch</option>
                    <option>Free + Paid</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Price Point', 'نقطة السعر')}</label>
                  <select className="inp" value={funnelPrice} onChange={(e) => { setFunnelPrice(e.target.value); updateGCInput('funnelPrice', e.target.value); }}>
                    <option>Low Ticket ($10-$100)</option>
                    <option>Mid Ticket ($100-$1K)</option>
                    <option>High Ticket ($1K+)</option>
                  </select>
                </div>
                <button className="btn btn-prime" onClick={() => handleRunAnalysis('agi-funnel')} style={{ width: '100%', justifyContent: 'center' }}>
                  🔄 {L('Explore Funnels', 'استكشف مسارات التحويل')}
                </button>
              </div>
            </div>
            {renderAIOutputCard(
              'agi-funnel',
              L('Funnel Analysis', 'تحليل الفانل'),
              '🔄',
              L('Explore top funnels', 'استكشف الفانلات الأبرز'),
              L('Discover successful funnel structures, conversion strategies, and copy frameworks', 'اكتشف تصاميم ومراحل صفحات الهبوط والتتابع الناجحة في السوق')
            )}
          </div>
        </div>
      )}

      {/* COMPETITOR INTEL */}
      {activeTab === 'agi-competitor' && (
        <div className="tab-panel on" id="agi-competitor">
          <div className="g2">
            <div className="card">
              <div className="sec-hd"><div className="sec-title">🕵️ {L('Competitor Intelligence', 'تحليل المنافسين')}</div></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Competitor Domain or Name', 'موقع المنافس أو اسمه')}</label>
                  <input className="inp" value={compDomain} onChange={(e) => setCompDomain(e.target.value)} onBlur={(e) => updateGCInput('compDomain', e.target.value)} placeholder="competitor.com or Company Name" />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Analysis Depth', 'عمق التحليل')}</label>
                  <select className="inp" value={compDepth} onChange={(e) => { setCompDepth(e.target.value); updateGCInput('compDepth', e.target.value); }}>
                    <option>Full Analysis (All)</option>
                    <option>Offers & Pricing Only</option>
                    <option>Ads & Marketing Only</option>
                    <option>Funnel Analysis Only</option>
                    <option>Tech Stack Only</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Your business context', 'تفاصيل بيزنسك للحصول على مقارنة')}</label>
                  <textarea className="inp" value={compContext} onChange={(e) => setCompContext(e.target.value)} onBlur={(e) => updateGCInput('compContext', e.target.value)} rows="2" placeholder="I sell coaching services targeting Arab entrepreneurs..."></textarea>
                </div>
                <button className="btn btn-prime" onClick={() => handleRunAnalysis('agi-competitor')} style={{ width: '100%', justifyContent: 'center' }}>
                  🕵️ {L('Analyze Competitor', 'حلل المنافس')}
                </button>
              </div>
            </div>
            {renderAIOutputCard(
              'agi-competitor',
              L('Competitor Report', 'تقرير المنافس'),
              '🕵️',
              L('Competitor intelligence', 'ذكاء المنافسة'),
              L('Get a complete breakdown of any competitor: offers, funnels, ads, positioning, and weaknesses', 'احصل على تحليل شامل لبرامج المنافس، وعروضه ونقاط القوة والضعف')
            )}
          </div>
        </div>
      )}

      {/* OFFER EXPLORER */}
      {activeTab === 'agi-offer' && (
        <div className="tab-panel on" id="agi-offer">
          <div className="g2">
            <div className="card">
              <div className="sec-hd"><div className="sec-title">🎁 {L('Offer Explorer', 'مستكشف العروض')}</div></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Industry', 'المجال')}</label>
                  <input className="inp" value={offerIndustry} onChange={(e) => setOfferIndustry(e.target.value)} onBlur={(e) => updateGCInput('offerIndustry', e.target.value)} placeholder="Business coaching, e-commerce, fitness..." />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Offer Category', 'فئة العرض')}</label>
                  <select className="inp" value={offerCat} onChange={(e) => { setOfferCat(e.target.value); updateGCInput('offerCat', e.target.value); }}>
                    <option>All Offer Types</option>
                    <option>Free Trial</option>
                    <option>Free Consultation</option>
                    <option>Webinar / Workshop</option>
                    <option>Free Audit</option>
                    <option>Lead Magnet</option>
                    <option>Challenge Funnel</option>
                    <option>Discount Offer</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Target Market', 'السوق المستهدف')}</label>
                  <select className="inp" value={offerMarket} onChange={(e) => { setOfferMarket(e.target.value); updateGCInput('offerMarket', e.target.value); }}>
                    <option>B2C (Individuals)</option>
                    <option>B2B (Businesses)</option>
                    <option>Both</option>
                  </select>
                </div>
                <button className="btn btn-prime" onClick={() => handleRunAnalysis('agi-offer')} style={{ width: '100%', justifyContent: 'center' }}>
                  🎁 {L('Explore Winning Offers', 'استكشف العروض الرابحة')}
                </button>
              </div>
            </div>
            {renderAIOutputCard(
              'agi-offer',
              L('Offer Database', 'قاعدة بيانات العروض'),
              '🎁',
              L('Offer database', 'دليل العروض الناجحة'),
              L('Discover what offers are working in your market and why they convert', 'تعرف على العروض الأكثر طلباً وتأثيراً في قرار الشراء لدى العملاء')
            )}
          </div>
        </div>
      )}

      {/* TECH STACK */}
      {activeTab === 'agi-tech' && (
        <div className="tab-panel on" id="agi-tech">
          <div className="g2">
            <div className="card">
              <div className="sec-hd"><div className="sec-title">⚙️ {L('Tech Stack Analyzer', 'محلل الأدوات البرمجية')}</div></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Domain to analyze', 'الموقع المطلوب فحصه')}</label>
                  <input className="inp" value={techDomain} onChange={(e) => setTechDomain(e.target.value)} onBlur={(e) => updateGCInput('techDomain', e.target.value)} placeholder="competitor.com" />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('What interests you?', 'ما الذي تهتم به؟')}</label>
                  <select className="inp" value={techFocus} onChange={(e) => { setTechFocus(e.target.value); updateGCInput('techFocus', e.target.value); }}>
                    <option>Full Stack</option>
                    <option>CRM & Sales Tools</option>
                    <option>Analytics & Tracking</option>
                    <option>Marketing Automation</option>
                    <option>Email Platform</option>
                    <option>Chat & Support</option>
                  </select>
                </div>
                <button className="btn btn-prime" onClick={() => handleRunAnalysis('agi-tech')} style={{ width: '100%', justifyContent: 'center' }}>
                  ⚙️ {L('Analyze Tech Stack', 'فحص وتحليل الأدوات')}
                </button>
              </div>
              <div style={{ marginTop: '12px', padding: '10px', background: 'var(--surface2)', borderRadius: '9px', fontSize: '12px', color: 'var(--t2)' }}>
                💡 {L('Know what tools your competitors use to replicate their stack or find better alternatives.', 'تعرف على الخدمات التي يستخدمها منافسوك لتقليد إعدادهم أو إيجاد بدائل أفضل.')}
              </div>
            </div>
            {renderAIOutputCard(
              'agi-tech',
              L('Tech Stack Report', 'تقرير الأدوات'),
              '⚙️',
              L('Tech stack analysis', 'تحليل البنية التقنية'),
              L('Discover what CRM, analytics, automation, and marketing tools any website is using', 'اعرف الخدمات والمقابس البرمجية المستعملة في موقع منافسك')
            )}
          </div>
        </div>
      )}

      {/* MARKET OPPORTUNITIES */}
      {activeTab === 'agi-market' && (
        <div className="tab-panel on" id="agi-market">
          <div className="g2">
            <div className="card">
              <div className="sec-hd"><div className="sec-title">🌍 {L('Market Opportunities', 'فرص السوق')}</div></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Industry', 'القطاع')}</label>
                  <input className="inp" value={mktIndustry} onChange={(e) => setMktIndustry(e.target.value)} onBlur={(e) => updateGCInput('mktIndustry', e.target.value)} placeholder="Online education, e-commerce, fintech..." />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Country / Region', 'الدولة / المنطقة')}</label>
                  <select className="inp" value={mktCountry} onChange={(e) => { setMktCountry(e.target.value); updateGCInput('mktCountry', e.target.value); }}>
                    <option>Arab World (All)</option>
                    <option>Saudi Arabia</option>
                    <option>UAE</option>
                    <option>Egypt</option>
                    <option>Gulf (GCC)</option>
                    <option>Global</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Target Audience', 'الفئة المستهدفة')}</label>
                  <input className="inp" value={mktAudience} onChange={(e) => setMktAudience(e.target.value)} onBlur={(e) => updateGCInput('mktAudience', e.target.value)} placeholder="SMB owners, young professionals, women..." />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Analysis Type', 'طريقة التحليل')}</label>
                  <select className="inp" value={mktType} onChange={(e) => { setMktType(e.target.value); updateGCInput('mktType', e.target.value); }}>
                    <option>Top 10 Opportunities</option>
                    <option>Market Gaps</option>
                    <option>Underserved Niches</option>
                    <option>AI Business Ideas</option>
                    <option>Trending Problems</option>
                  </select>
                </div>
                <button className="btn btn-prime" onClick={() => handleRunAnalysis('agi-market')} style={{ width: '100%', justifyContent: 'center' }}>
                  🌍 {L('Discover Opportunities', 'اكتشف الفرص المتاحة')}
                </button>
              </div>
            </div>
            {renderAIOutputCard(
              'agi-market',
              L('Market Opportunities Report', 'تقرير فرص السوق'),
              '🌍',
              L('Market opportunities', 'فرص السوق'),
              L('Discover untapped markets, underserved niches, and high-potential business opportunities', 'اكتشف النيشات غير المشبعة وفجوات السوق والمشاكل المستجدة في العالم العربي')
            )}
          </div>
        </div>
      )}

      {/* REVERSE ENGINEER */}
      {activeTab === 'agi-reverse' && (
        <div className="tab-panel on" id="agi-reverse">
          <div className="g2">
            <div className="card">
              <div className="sec-hd"><div className="sec-title">🔁 {L('Reverse Engineer', 'الهندسة العكسية')}</div></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('URL to reverse engineer', 'الرابط المطلوب تفكيكه')}</label>
                  <input className="inp" value={revUrl} onChange={(e) => setRevUrl(e.target.value)} onBlur={(e) => updateGCInput('revUrl', e.target.value)} placeholder="https://successful-page.com" />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Describe what you see (if no URL)', 'أو صف ما تراه (في حال غياب الرابط)')}</label>
                  <textarea className="inp" value={revDesc} onChange={(e) => setRevDesc(e.target.value)} onBlur={(e) => updateGCInput('revDesc', e.target.value)} rows="3" placeholder="The page has a big headline promising X result in Y days, then shows 3 testimonials, then a CTA button..."></textarea>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('What to reverse engineer', 'التركيز الأساسي')}</label>
                  <select className="inp" value={revFocus} onChange={(e) => { setRevFocus(e.target.value); updateGCInput('revFocus', e.target.value); }}>
                    <option>Everything</option>
                    <option>Sales Psychology</option>
                    <option>Copywriting Framework</option>
                    <option>Design & UX</option>
                    <option>Offer Structure</option>
                    <option>Funnel Logic</option>
                  </select>
                </div>
                <button className="btn btn-prime" onClick={() => handleRunAnalysis('agi-reverse')} style={{ width: '100%', justifyContent: 'center' }}>
                  🔁 {L('Reverse Engineer', 'بدء الهندسة العكسية')}
                </button>
              </div>
            </div>
            {renderAIOutputCard(
              'agi-reverse',
              L('Engineering Report', 'تقرير التفكيك'),
              '🔁',
              L('Reverse engineering', 'الهندسة العكسية للمبيعات'),
              L('Understand exactly why any page, ad, or funnel converts — and how to replicate it', 'افهم الأسلوب النفسي والاقناعي المستعمل في صفحات مبيعات المنافسين وانسخ أسلوبهم')
            )}
          </div>
        </div>
      )}
    </div>
  );
}
