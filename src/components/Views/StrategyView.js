'use client';

import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';
import { parseMarkdown } from '../../utils/markdown';

export default function StrategyView() {
  const { lang, L, t, GC, saveGC } = useBusiness();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState({});
  const [aiOutputs, setAiOutputs] = useState({
    idea: GC.strategy.idea_analysis || '',
    icp: GC.strategy.icp || '',
    offer: GC.profile.offer.transform ? L('Offer defined.', 'تمت صياغة العرض.') : '',
    swot: '',
    roadmap: GC.strategy.roadmap || ''
  });

  // Local Form Inputs (prefilled from GC)
  const [bizName, setBizName] = useState(GC.profile.name || '');
  const [bizDesc, setBizDesc] = useState(GC.profile.desc || '');
  const [bizNiche, setBizNiche] = useState(GC.profile.niche || '');
  const [bizStage, setBizStage] = useState(GC.profile.stage || 'Idea');

  const [icpDemo, setIcpDemo] = useState('');
  const [icpPains, setIcpPains] = useState('');
  const [icpGoals, setIcpGoals] = useState('');
  const [icpChannels, setIcpChannels] = useState('');

  const [offerName, setOfferName] = useState(GC.profile.offer.name || '');
  const [offerTransform, setOfferTransform] = useState(GC.profile.offer.transform || '');
  const [offerPrice, setOfferPrice] = useState(GC.profile.offer.price || '');
  const [offerDuration, setOfferDuration] = useState(GC.profile.offer.duration || '');
  const [offerDeliverables, setOfferDeliverables] = useState('');

  const [swotS, setSwotS] = useState(GC.strategy.swot.s || '');
  const [swotW, setSwotW] = useState(GC.strategy.swot.w || '');
  const [swotO, setSwotO] = useState(GC.strategy.swot.o || '');
  const [swotT, setSwotT] = useState(GC.strategy.swot.t || '');

  const [rmCurrent, setRmCurrent] = useState('');
  const [rmGoal, setRmGoal] = useState('');
  const [rmHours, setRmHours] = useState('10-20 hours');
  const [rmChannel, setRmChannel] = useState('Instagram / Social Media');

  const handleSaveGC = (updatedFields) => {
    const updated = {
      ...GC,
      ...updatedFields
    };
    saveGC(updated);
  };

  // ── Trigger AIs with Streaming ──
  const triggerStrategyAI = async (key, promptText, systemText, saveCallback) => {
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
        }
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

  const runIdeaAnalysis = async () => {
    const prompt = `Analyze my business idea: Brand Name: "${bizName}", Description: "${bizDesc}", Niche: "${bizNiche}", Stage: "${bizStage}".
Outline 3 core strengths of this idea, 2 major competitor risks, and a clear next-step action plan to validate the concept.`;
    const system = `You are an expert business architect AI. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;

    await triggerStrategyAI('idea', prompt, system, (finalRes) => {
      handleSaveGC({
        profile: { ...GC.profile, name: bizName, desc: bizDesc, niche: bizNiche, stage: bizStage },
        strategy: { ...GC.strategy, idea_analysis: finalRes }
      });
    });
  };

  const runICPBuilder = async () => {
    const prompt = `Build an Ideal Client Profile (ICP): Demographics: "${icpDemo}", Pain points: "${icpPains}", Goals: "${icpGoals}", Online channels: "${icpChannels}".
Provide a clear buyer persona summary, key marketing messages that will resonate with them, and where/how to reach them.`;
    const system = `You are a customer marketing strategist. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;

    await triggerStrategyAI('icp', prompt, system, (finalRes) => {
      handleSaveGC({
        strategy: { ...GC.strategy, icp: finalRes }
      });
    });
  };

  const runOfferClarity = async () => {
    const prompt = `Optimize and clarify my core offer: Name: "${offerName}", Transformation: "${offerTransform}", Price: "${offerPrice}", Duration: "${offerDuration}", Deliverables: "${offerDeliverables}".
Rate this offer on clarity and packaging. Suggest 2 high-value bonuses to include, and rewrite the transformation headline to be irresistible.`;
    const system = `You are a product packaging expert. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;

    await triggerStrategyAI('offer', prompt, system, (finalRes) => {
      handleSaveGC({
        profile: {
          ...GC.profile,
          offer: { name: offerName, price: offerPrice, transform: offerTransform, duration: offerDuration }
        }
      });
    });
  };

  const runSWOTAnalysis = async () => {
    const prompt = `Analyze this SWOT Matrix for my business:
Strengths: "${swotS}"
Weaknesses: "${swotW}"
Opportunities: "${swotO}"
Threats: "${swotT}"
Provide a summary on how to leverage strengths, close weaknesses, capture opportunities, and protect against threats.`;
    const system = `You are a corporate strategist. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;

    await triggerStrategyAI('swot', prompt, system, (finalRes) => {
      handleSaveGC({
        strategy: {
          ...GC.strategy,
          swot: { s: swotS, w: swotW, o: swotO, t: swotT }
        }
      });
    });
  };

  const runRoadmapBuilder = async () => {
    const prompt = `Build a 90-day Growth Roadmap:
Current revenue: "${rmCurrent}"
Revenue goal: "${rmGoal}"
Hours available/week: "${rmHours}"
Primary channel: "${rmChannel}"
Provide a week-by-week implementation guide for the next 12 weeks to hit the target.`;
    const system = `You are a scaling strategist. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;

    await triggerStrategyAI('roadmap', prompt, system, (finalRes) => {
      handleSaveGC({
        strategy: { ...GC.strategy, roadmap: finalRes }
      });
    });
  };

  return (
    <div className="pg on" id="pg-strategy">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">🧠</span>
          <span>{t('Strategy Lab')}</span>
        </div>
        <div className="pg-actions">
          <button className="btn-ai" onClick={() => setActiveTab('swot')}>
            ✦ {L('AI SWOT', 'تحليل SWOT')}
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="tabs-bar" id="strategy-tabs" style={{ marginBottom: '14px' }}>
        <button className={`tab-btn ${activeTab === 'overview' ? 'on' : ''}`} onClick={() => setActiveTab('overview')}>{L('Overview', 'نظرة عامة')}</button>
        <button className={`tab-btn ${activeTab === 'idea' ? 'on' : ''}`} onClick={() => setActiveTab('idea')}>{L('Business Idea', 'فكرة العمل')}</button>
        <button className={`tab-btn ${activeTab === 'icp' ? 'on' : ''}`} onClick={() => setActiveTab('icp')}>{L('ICP Builder', 'منشئ العميل المثالي')}</button>
        <button className={`tab-btn ${activeTab === 'offer' ? 'on' : ''}`} onClick={() => setActiveTab('offer')}>{L('Offer Clarity', 'وضوح العرض')}</button>
        <button className={`tab-btn ${activeTab === 'swot' ? 'on' : ''}`} onClick={() => setActiveTab('swot')}>{L('SWOT', 'تحليل SWOT')}</button>
        <button className={`tab-btn ${activeTab === 'roadmap' ? 'on' : ''}`} onClick={() => setActiveTab('roadmap')}>{L('Roadmap', 'خارطة الطريق')}</button>
      </div>

      {/* ── TAB 1: OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="g3 stagger">
            <div className="card" onClick={() => setActiveTab('idea')} style={{ cursor: 'pointer' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>💡</div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--t1)' }}>{L('Business Idea', 'فكرة البزنس')}</div>
              <div style={{ fontSize: '11px', color: 'var(--t2)', marginTop: '4px' }}>{GC.profile.name ? L('Analyzed & Saved', 'تم التحليل والحفظ') : L('Click to start', 'اضغط للبدء')}</div>
            </div>
            <div className="card" onClick={() => setActiveTab('icp')} style={{ cursor: 'pointer' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯</div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--t1)' }}>{L('Ideal Client Profile (ICP)', 'الملف المثالي للعميل')}</div>
              <div style={{ fontSize: '11px', color: 'var(--t2)', marginTop: '4px' }}>{GC.strategy.icp ? L('Defined', 'تم التحديد') : L('Click to start', 'اضغط للبدء')}</div>
            </div>
            <div className="card" onClick={() => setActiveTab('offer')} style={{ cursor: 'pointer' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎁</div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--t1)' }}>{L('Core Offer Structure', 'هيكل العرض الأساسي')}</div>
              <div style={{ fontSize: '11px', color: 'var(--t2)', marginTop: '4px' }}>{GC.profile.offer.transform ? L('Optimized', 'تم التحسين') : L('Click to start', 'اضغط للبدء')}</div>
            </div>
          </div>
          <div className="card">
            <div className="sec-hd"><div className="sec-title">✦ {L('AI Strategy Insights', 'توصيات الاستراتيجية بالـ AI')}</div></div>
            <div className="ai-box">
              {GC.strategy.idea_analysis ? (
                <div dangerouslySetInnerHTML={{ __html: parseMarkdown(GC.strategy.idea_analysis) }} />
              ) : (
                <div className="empty-state">
                  <div className="es-icon">🧠</div>
                  <div className="es-title">{L('Complete your strategy setup', 'أكمل بيانات الاستراتيجية')}</div>
                  <div className="es-sub">{L('Fill in your Business Idea, ICP, and Offer to unlock personalized AI strategy recommendations.', 'املأ فكرة العمل، الملف المثالي للعميل، وعرضك الأساسي لفتح رؤى مخصصة بالذكاء الاصطناعي.')}</div>
                  <button className="btn btn-prime" onClick={() => setActiveTab('idea')}>
                    {L('Start with Business Idea →', 'ابدأ بفكرة العمل ←')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: BUSINESS IDEA ── */}
      {activeTab === 'idea' && (
        <div className="g2">
          <div className="card">
            <div className="sec-hd"><div className="sec-title">💡 {L('Business Idea Analyzer', 'محلل فكرة البزنس')}</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Business / Project Name', 'اسم المشروع / البزنس')}</label>
                <input className="inp" placeholder="e.g. Sara's Coaching Academy" value={bizName} onChange={e => setBizName(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('What do you do? (1 sentence)', 'ماذا تفعل؟ (في جملة واحدة)')}</label>
                <textarea className="inp" rows="3" placeholder="I help Arab entrepreneurs..." value={bizDesc} onChange={e => setBizDesc(e.target.value)}></textarea>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Your Niche', 'مجالك (النيش)')}</label>
                <input className="inp" placeholder="e.g. Business Coaching for Women" value={bizNiche} onChange={e => setBizNiche(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Business Stage', 'مرحلة البزنس')}</label>
                <select className="inp" value={bizStage} onChange={e => setBizStage(e.target.value)}>
                  <option>Idea — Just starting to explore</option>
                  <option>Validation — Testing the concept</option>
                  <option>Launch — Getting first clients</option>
                  <option>Growth — Scaling up</option>
                </select>
              </div>
              <button className="btn btn-prime" onClick={runIdeaAnalysis} style={{ justifyContent: 'center' }}>
                🧠 {L('Analyze My Business Idea', 'حلّل فكرة مشروعي')}
              </button>
            </div>
          </div>
          <div className="card">
            <div className="sec-hd"><div className="sec-title">{L('AI Analysis Output', 'نتيجة تحليل الذكاء الاصطناعي')}</div></div>
            <div 
              className="ai-box"
              dangerouslySetInnerHTML={{ 
                __html: loading.idea ? L('Analyzing concept...', 'جاري التحليل...') : parseMarkdown(aiOutputs.idea || L('Your analysis report will appear here.', 'سيظهر تقرير التحليل هنا.'))
              }}
            />
          </div>
        </div>
      )}

      {/* ── TAB 3: ICP BUILDER ── */}
      {activeTab === 'icp' && (
        <div className="g2">
          <div className="card">
            <div className="sec-hd"><div className="sec-title">🎯 {L('ICP Builder', 'منشئ ملف العميل المثالي')}</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Target Demographics', 'الخصائص الديموغرافية المستهدفة')}</label>
                <textarea className="inp" rows="2" placeholder="Age 28-45, female, Arab market..." value={icpDemo} onChange={e => setIcpDemo(e.target.value)}></textarea>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Audience Pain Points', 'نقاط ألم الجمهور المستهدف')}</label>
                <textarea className="inp" rows="3" placeholder="Struggling to scale, no systems..." value={icpPains} onChange={e => setIcpPains(e.target.value)}></textarea>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Their Goals & Dreams', 'أهدافهم وأحلامهم')}</label>
                <textarea className="inp" rows="2" placeholder="Financial freedom, impact..." value={icpGoals} onChange={e => setIcpGoals(e.target.value)}></textarea>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Where They Spend Time Online', 'أين يقضون أوقاتهم على الإنترنت')}</label>
                <input className="inp" placeholder="Instagram, Telegram, YouTube..." value={icpChannels} onChange={e => setIcpChannels(e.target.value)} />
              </div>
              <button className="btn btn-prime" onClick={runICPBuilder} style={{ justifyContent: 'center' }}>
                🎯 {L('Build My ICP Profile', 'ابني ملف عميلي المثالي')}
              </button>
            </div>
          </div>
          <div className="card">
            <div className="sec-hd"><div className="sec-title">{L('ICP Profile Output', 'ملف العميل المثالي')}</div></div>
            <div 
              className="ai-box"
              dangerouslySetInnerHTML={{ 
                __html: loading.icp ? L('Building profile...', 'جاري بناء الملف...') : parseMarkdown(aiOutputs.icp || L('Detailed client profile suggestions will show here.', 'سيظهر ملف العميل التفصيلي هنا.'))
              }}
            />
          </div>
        </div>
      )}

      {/* ── TAB 4: OFFER CLARITY ── */}
      {activeTab === 'offer' && (
        <div className="g2">
          <div className="card">
            <div className="sec-hd"><div className="sec-title">🎁 {L('Offer Clarity Tool', 'أداة وضوح العروض')}</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Your Main Offer', 'عرضك الأساسي')}</label>
                <input className="inp" placeholder="e.g. 12-Week Business Accelerator" value={offerName} onChange={e => setOfferName(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Transformative Transformation Deliverable', 'ما هي النتيجة / التحول النهائي؟')}</label>
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
              <button className="btn btn-prime" onClick={runOfferClarity} style={{ justifyContent: 'center' }}>
                ✨ {L('Clarify & Strengthen Offer', 'صُغ وحسّن العرض')}
              </button>
            </div>
          </div>
          <div className="card">
            <div className="sec-hd"><div className="sec-title">{L('Offer Analysis Output', 'تحليل وهيكلة العرض')}</div></div>
            <div 
              className="ai-box"
              dangerouslySetInnerHTML={{ 
                __html: loading.offer ? L('Analyzing offer...', 'جاري التحليل...') : parseMarkdown(aiOutputs.offer || L('Recommendations for pricing, packaging, and headlines.', 'توصيات الهيكلة، التسعير، والعناوين الجذابة.'))
              }}
            />
          </div>
        </div>
      )}

      {/* ── TAB 5: SWOT ── */}
      {activeTab === 'swot' && (
        <div className="g2">
          <div className="card">
            <div className="sec-hd"><div className="sec-title">⚔️ {L('SWOT Analysis Matrix', 'مصفوفة تحليل SWOT')}</div></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              <div style={{ background: 'var(--green-d)', border: '1px solid rgba(34,211,160,.2)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--green)', marginBottom: '6px' }}>💪 STRENGTHS</div>
                <textarea className="inp" rows="4" placeholder="Your advantages..." style={{ background: 'transparent', borderColor: 'transparent' }} value={swotS} onChange={e => setSwotS(e.target.value)} />
              </div>
              <div style={{ background: 'var(--red-d)', border: '1px solid rgba(244,63,94,.2)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--red)', marginBottom: '6px' }}>⚠️ WEAKNESSES</div>
                <textarea className="inp" rows="4" placeholder="Your areas to improve..." style={{ background: 'transparent', borderColor: 'transparent' }} value={swotW} onChange={e => setSwotW(e.target.value)} />
              </div>
              <div style={{ background: 'var(--blue-d)', border: '1px solid rgba(56,189,248,.2)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--blue)', marginBottom: '6px' }}>🚀 OPPORTUNITIES</div>
                <textarea className="inp" rows="4" placeholder="Market opportunities..." style={{ background: 'transparent', borderColor: 'transparent' }} value={swotO} onChange={e => setSwotO(e.target.value)} />
              </div>
              <div style={{ background: 'var(--amber-d)', border: '1px solid rgba(251,191,36,.2)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--amber)', marginBottom: '6px' }}>🛡️ THREATS</div>
                <textarea className="inp" rows="4" placeholder="External risks..." style={{ background: 'transparent', borderColor: 'transparent' }} value={swotT} onChange={e => setSwotT(e.target.value)} />
              </div>
            </div>
            <button className="btn btn-prime" onClick={runSWOTAnalysis} style={{ width: '100%', justifyContent: 'center' }}>
              🧠 {L('Generate AI SWOT Analysis', 'ولّد خطة تحليل SWOT بالـ AI')}
            </button>
          </div>
          <div className="card">
            <div className="sec-hd"><div className="sec-title">{L('AI SWOT Insights', 'تحليلات وتوصيات SWOT')}</div></div>
            <div 
              className="ai-box"
              dangerouslySetInnerHTML={{ 
                __html: loading.swot ? L('Generating SWOT matrix insights...', 'جاري كتابة التحليلات...') : parseMarkdown(aiOutputs.swot || L('Actionable SWOT strategies will show here.', 'ستظهر هنا كيفية استغلال الفرص وتفادي المخاطر.'))
              }}
            />
          </div>
        </div>
      )}

      {/* ── TAB 6: ROADMAP ── */}
      {activeTab === 'roadmap' && (
        <div className="card">
          <div className="sec-hd"><div className="sec-title">🗺️ {L('Growth Roadmap Generator', 'مولد خارطة طريق النمو')}</div></div>
          <div className="g2">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Current Monthly Revenue', 'الدخل الشهري الحالي')}</label>
                <input className="inp" placeholder="$0 — just starting" value={rmCurrent} onChange={e => setRmCurrent(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Revenue Goal in 90 Days', 'الدخل المستهدف خلال ٩٠ يوماً')}</label>
                <input className="inp" placeholder="$5,000/month" value={rmGoal} onChange={e => setRmGoal(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Hours Available per Week', 'الساعات المتاحة أسبوعياً للعمل')}</label>
                <select className="inp" value={rmHours} onChange={e => setRmHours(e.target.value)}>
                  <option>5-10 hours (part-time)</option>
                  <option>10-20 hours</option>
                  <option>20-30 hours</option>
                  <option>Full-time (40+ hours)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Primary Growth Channel', 'قناة النمو التسويقية الأساسية')}</label>
                <select className="inp" value={rmChannel} onChange={e => setRmChannel(e.target.value)}>
                  <option>Instagram / Social Media</option>
                  <option>TikTok</option>
                  <option>Facebook</option>
                  <option>LinkedIn</option>
                  <option>YouTube</option>
                  <option>Paid Ads</option>
                  <option>Content Marketing</option>
                </select>
              </div>
              <button className="btn btn-prime" onClick={runRoadmapBuilder} style={{ width: '100%', justifyContent: 'center' }}>
                🗺️ {L('Build My 90-Day Roadmap', 'أعد خطتي لـ ٩٠ يوماً قادمة')}
              </button>
            </div>
            <div 
              className="ai-box"
              dangerouslySetInnerHTML={{ 
                __html: loading.roadmap ? L('Building week-by-week roadmap...', 'جاري بناء خطة العمل...') : parseMarkdown(aiOutputs.roadmap || L('Your personalized 12-week roadmap will appear here.', 'ستظهر خطتك الأسبوعية لـ ١٢ أسبوعاً القادمة هنا.'))
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
