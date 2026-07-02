'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';

export default function AIGrowthIntelView() {
  const { lang, L, t, GC, saveGC } = useBusiness();

  // Sub tab state
  const [activeTab, setActiveTab] = useState('agi-ads');

  const intelData = GC.aiGrowthIntel || { inputs: {}, outputs: {} };
  const savedInputs = intelData.inputs || {};
  const savedOutputs = intelData.outputs || {};

  // Input states
  const [adsNiche, setAdsNiche] = useState(savedInputs.adsNiche ?? '');
  const [adsPlatform, setAdsPlatform] = useState(savedInputs.adsPlatform ?? 'Meta (Facebook/Instagram)');
  const [adsType, setAdsType] = useState(savedInputs.adsType ?? 'All Types');
  const [adsMarket, setAdsMarket] = useState(savedInputs.adsMarket ?? 'Arab Market (General)');

  const [funnelType, setFunnelType] = useState(savedInputs.funnelType ?? 'Coaching / Consulting');
  const [funnelKind, setFunnelKind] = useState(savedInputs.funnelKind ?? 'Lead Gen Funnel');
  const [funnelPrice, setFunnelPrice] = useState(savedInputs.funnelPrice ?? 'Low Ticket ($10-$100)');

  const [compDomain, setCompDomain] = useState(savedInputs.compDomain ?? '');
  const [compDepth, setCompDepth] = useState(savedInputs.compDepth ?? 'Full Analysis (All)');
  const [compContext, setCompContext] = useState(savedInputs.compContext ?? '');

  const [offerIndustry, setOfferIndustry] = useState(savedInputs.offerIndustry ?? '');
  const [offerCat, setOfferCat] = useState(savedInputs.offerCat ?? 'All Offer Types');
  const [offerMarket, setOfferMarket] = useState(savedInputs.offerMarket ?? 'B2C (Individuals)');

  const [hlCat, setHlCat] = useState(savedInputs.hlCat ?? 'SaaS / Software');
  const [hlGoal, setHlGoal] = useState(savedInputs.hlGoal ?? 'Landing Page Hero');
  const [hlLang, setHlLang] = useState(savedInputs.hlLang ?? 'Arabic (Gulf)');
  const [hlOffer, setHlOffer] = useState(savedInputs.hlOffer ?? '');

  const [lpUrl, setLpUrl] = useState(savedInputs.lpUrl ?? '');
  const [lpType, setLpType] = useState(savedInputs.lpType ?? 'High-ticket coaching');
  const [lpFocus, setLpFocus] = useState(savedInputs.lpFocus ?? 'Full analysis');

  const [techDomain, setTechDomain] = useState(savedInputs.techDomain ?? '');
  const [techFocus, setTechFocus] = useState(savedInputs.techFocus ?? 'Full Stack');

  const [mktIndustry, setMktIndustry] = useState(savedInputs.mktIndustry ?? '');
  const [mktCountry, setMktCountry] = useState(savedInputs.mktCountry ?? 'Arab World (All)');
  const [mktAudience, setMktAudience] = useState(savedInputs.mktAudience ?? '');
  const [mktType, setMktType] = useState(savedInputs.mktType ?? 'Top 10 Opportunities');

  const [revUrl, setRevUrl] = useState(savedInputs.revUrl ?? '');
  const [revDesc, setRevDesc] = useState(savedInputs.revDesc ?? '');
  const [revFocus, setRevFocus] = useState(savedInputs.revFocus ?? 'Everything');

  // Output outputs
  const [loading, setLoading] = useState(false);
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
      setAdsNiche(inputs.adsNiche ?? '');
      setAdsPlatform(inputs.adsPlatform ?? 'Meta (Facebook/Instagram)');
      setAdsType(inputs.adsType ?? 'All Types');
      setAdsMarket(inputs.adsMarket ?? 'Arab Market (General)');
      setFunnelType(inputs.funnelType ?? 'Coaching / Consulting');
      setFunnelKind(inputs.funnelKind ?? 'Lead Gen Funnel');
      setFunnelPrice(inputs.funnelPrice ?? 'Low Ticket ($10-$100)');
      setCompDomain(inputs.compDomain ?? '');
      setCompDepth(inputs.compDepth ?? 'Full Analysis (All)');
      setCompContext(inputs.compContext ?? '');
      setOfferIndustry(inputs.offerIndustry ?? '');
      setOfferCat(inputs.offerCat ?? 'All Offer Types');
      setOfferMarket(inputs.offerMarket ?? 'B2C (Individuals)');
      setHlCat(inputs.hlCat ?? 'SaaS / Software');
      setHlGoal(inputs.hlGoal ?? 'Landing Page Hero');
      setHlLang(inputs.hlLang ?? 'Arabic (Gulf)');
      setHlOffer(inputs.hlOffer ?? '');
      setLpUrl(inputs.lpUrl ?? '');
      setLpType(inputs.lpType ?? 'High-ticket coaching');
      setLpFocus(inputs.lpFocus ?? 'Full analysis');
      setTechDomain(inputs.techDomain ?? '');
      setTechFocus(inputs.techFocus ?? 'Full Stack');
      setMktIndustry(inputs.mktIndustry ?? '');
      setMktCountry(inputs.mktCountry ?? 'Arab World (All)');
      setMktAudience(inputs.mktAudience ?? '');
      setMktType(inputs.mktType ?? 'Top 10 Opportunities');
      setRevUrl(inputs.revUrl ?? '');
      setRevDesc(inputs.revDesc ?? '');
      setRevFocus(inputs.revFocus ?? 'Everything');

      setOutputs({
        'agi-ads': outs['agi-ads'] ?? '',
        'agi-funnel': outs['agi-funnel'] ?? '',
        'agi-competitor': outs['agi-competitor'] ?? '',
        'agi-offer': outs['agi-offer'] ?? '',
        'agi-tech': outs['agi-tech'] ?? '',
        'agi-market': outs['agi-market'] ?? '',
        'agi-reverse': outs['agi-reverse'] ?? '',
        'agi-insights': outs['agi-insights'] ?? ''
      });
    }
  }, [GC.aiGrowthIntel]);

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
    setLoading(true);
    let prompt = '';
    let systemPrompt = 'World-class market intelligence analyst for Arab/MENA markets. Specific and actionable.';

    if (toolKey === 'agi-ads') {
      prompt = `Find 5 winning ads. Industry: ${adsNiche || 'general'} Platform: ${adsPlatform} Market: ${adsMarket} Ad Type: ${adsType}. For each ad, give: Hook, copy, offer, and why it converts.`;
    } else if (toolKey === 'agi-funnel') {
      prompt = `Provide 5 top funnels for business type: ${funnelType}, funnel kind: ${funnelKind}, price point: ${funnelPrice}. Analyze their structure and explain why each works.`;
    } else if (toolKey === 'agi-competitor') {
      prompt = `Analyze competitor: ${compDomain || 'general'}. My context: ${compContext || 'not specified'}. Scope: ${compDepth}. Provide: Overview, offers, funnel setup, strengths, weaknesses, and opportunities.`;
    } else if (toolKey === 'agi-offer') {
      prompt = `Provide 5 winning offers for industry: ${offerIndustry || 'general'}, category: ${offerCat}, targeting: ${offerMarket}. Detail why each converts and when to use.`;
    } else if (toolKey === 'agi-tech') {
      prompt = `For domain: ${techDomain || 'competitor.com'}, focus on: ${techFocus}. Predict and explain their tech stack including CRM, analytics, email platform, and payment gateways.`;
    } else if (toolKey === 'agi-market') {
      prompt = `Top 10 business/marketing opportunities in industry: ${mktIndustry || 'general'} for country/region: ${mktCountry}, targeting audience: ${mktAudience || 'general'}. Detail gaps, underserved niches, and steps to enter.`;
    } else if (toolKey === 'agi-reverse') {
      prompt = `Reverse engineer: URL: ${revUrl || 'none'} or description: ${revDesc || 'none'}. Focus on: ${revFocus}. Provide conversion analysis, copy framework breakdown, and replicable strategies.`;
    } else if (toolKey === 'weekly-insights') {
      prompt = `Generate weekly growth intelligence for Arab market. List top ads format trends, funnel systems, hot offers, trending topics, and 3 specific actions recommended for growth.`;
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
      setLoading(false);
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

  return (
    <div className="pg on" id="pg-ai-growth">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">🔮</span>
          {L('AI Growth Intelligence', 'ذكاء النمو الاصطناعي')}
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

      {loading && (
        <div className="ai-box mb" style={{ textAlign: 'center', padding: '24px', animation: 'pulse 1.5s infinite' }}>
          ✦ {L('AI analyzing and scanning market signals...', 'جاري التحليل وفحص إشارات السوق...')}
        </div>
      )}

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
            <div className="card">
              <div className="sec-hd"><div className="sec-title">{L('Winning Ads Analysis', 'تحليل الإعلانات الرابحة')}</div></div>
              <div id="agi-ads-out">
                {outputs['agi-ads'] ? renderFormattedOutput(outputs['agi-ads']) : (
                  <div className="empty-state">
                    <div className="es-icon">📢</div>
                    <div className="es-title">{L('Discover winning ads', 'اكتشف الإعلانات الرابحة')}</div>
                    <div className="es-sub">{L('Find the best performing ads in your market with hooks, angles, and conversion strategies', 'ابحث عن الإعلانات الأفضل أداء في مجالك واستلهم الهوك والزاوية الترويجية')}</div>
                  </div>
                )}
              </div>
            </div>
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
            <div className="card">
              <div className="sec-hd"><div className="sec-title">{L('Funnel Analysis', 'تحليل الفانل')}</div></div>
              <div id="agi-funnel-out">
                {outputs['agi-funnel'] ? renderFormattedOutput(outputs['agi-funnel']) : (
                  <div className="empty-state">
                    <div className="es-icon">🔄</div>
                    <div className="es-title">{L('Explore top funnels', 'استكشف الفانلات الأبرز')}</div>
                    <div className="es-sub">{L('Discover successful funnel structures, conversion strategies, and copy frameworks', 'اكتشف تصاميم ومراحل صفحات الهبوط والتتابع الناجحة في السوق')}</div>
                  </div>
                )}
              </div>
            </div>
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
            <div className="card">
              <div className="sec-hd"><div className="sec-title">{L('Competitor Report', 'تقرير المنافس')}</div></div>
              <div id="agi-comp-out">
                {outputs['agi-competitor'] ? renderFormattedOutput(outputs['agi-competitor']) : (
                  <div className="empty-state">
                    <div className="es-icon">🕵️</div>
                    <div className="es-title">{L('Competitor intelligence', 'ذكاء المنافسة')}</div>
                    <div className="es-sub">{L('Get a complete breakdown of any competitor: offers, funnels, ads, positioning, and weaknesses', 'احصل على تحليل شامل لبرامج المنافس، وعروضه ونقاط القوة والضعف')}</div>
                  </div>
                )}
              </div>
            </div>
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
            <div className="card">
              <div className="sec-hd"><div className="sec-title">{L('Offer Database', 'قاعدة بيانات العروض')}</div></div>
              <div id="agi-offer-out">
                {outputs['agi-offer'] ? renderFormattedOutput(outputs['agi-offer']) : (
                  <div className="empty-state">
                    <div className="es-icon">🎁</div>
                    <div className="es-title">{L('Offer database', 'دليل العروض الناجحة')}</div>
                    <div className="es-sub">{L('Discover what offers are working in your market and why they convert', 'تعرف على العروض الأكثر طلباً وتأثيراً في قرار الشراء لدى العملاء')}</div>
                  </div>
                )}
              </div>
            </div>
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
            <div className="card">
              <div className="sec-hd"><div className="sec-title">{L('Tech Stack Report', 'تقرير الأدوات')}</div></div>
              <div id="agi-tech-out">
                {outputs['agi-tech'] ? renderFormattedOutput(outputs['agi-tech']) : (
                  <div className="empty-state">
                    <div className="es-icon">⚙️</div>
                    <div className="es-title">{L('Tech stack analysis', 'تحليل البنية التقنية')}</div>
                    <div className="es-sub">{L('Discover what CRM, analytics, automation, and marketing tools any website is using', 'اعرف الخدمات والمقابس البرمجية المستعملة في موقع منافسك')}</div>
                  </div>
                )}
              </div>
            </div>
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
            <div className="card">
              <div className="sec-hd"><div className="sec-title">{L('Market Opportunities Report', 'تقرير فرص السوق')}</div></div>
              <div id="agi-mkt-out">
                {outputs['agi-market'] ? renderFormattedOutput(outputs['agi-market']) : (
                  <div className="empty-state">
                    <div className="es-icon">🌍</div>
                    <div className="es-title">{L('Market opportunities', 'فرص السوق')}</div>
                    <div className="es-sub">{L('Discover untapped markets, underserved niches, and high-potential business opportunities', 'اكتشف النيشات غير المشبعة وفجوات السوق والمشاكل المستجدة في العالم العربي')}</div>
                  </div>
                )}
              </div>
            </div>
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
            <div className="card">
              <div className="sec-hd"><div className="sec-title">{L('Engineering Report', 'تقرير التفكيك')}</div></div>
              <div id="agi-rev-out">
                {outputs['agi-reverse'] ? renderFormattedOutput(outputs['agi-reverse']) : (
                  <div className="empty-state">
                    <div className="es-icon">🔁</div>
                    <div className="es-title">{L('Reverse engineering', 'الهندسة العكسية للمبيعات')}</div>
                    <div className="es-sub">{L('Understand exactly why any page, ad, or funnel converts — and how to replicate it', 'افهم الأسلوب النفسي والاقناعي المستعمل في صفحات مبيعات المنافسين وانسخ أسلوبهم')}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
