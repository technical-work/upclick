import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';
import { parseMarkdown } from '../../utils/markdown';

export default function StrategyView() {
  const { lang, L, t, GC, saveGC } = useBusiness();
  const [activeTab, setActiveTab] = useState('idea');
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

  const runCompleteStrategy = async () => {
    handleSaveGC({
      profile: { 
        ...GC.profile, 
        name: bizName, desc: bizDesc, niche: bizNiche, stage: bizStage,
        offer: { ...GC.profile.offer, name: offerName, price: offerPrice, transform: offerTransform, duration: offerDuration }
      }
    });

    const ideaPrompt = `Analyze my business and offer: 
Brand: "${bizName}", Desc: "${bizDesc}", Niche: "${bizNiche}", Stage: "${bizStage}".
Offer: "${offerName}", Transformation: "${offerTransform}", Price: "${offerPrice}", Duration: "${offerDuration}", Deliverables: "${offerDeliverables}".
Provide 3 core strengths, 2 major risks, a clear next-step action plan, and rate/optimize the offer with 2 suggested bonuses.`;
    const ideaSystem = `You are an expert business architect. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;

    const icpPrompt = `Based on this Business and Offer:
Brand: "${bizName}", Desc: "${bizDesc}", Niche: "${bizNiche}", Offer: "${offerName}" (${offerTransform}) at ${offerPrice}.
Build an Ideal Client Profile (ICP). Provide demographics, pain points, goals, where they spend time online, and key marketing messages.`;
    const icpSystem = `You are a customer marketing strategist. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;

    const swotPrompt = `Based on this Business and Offer:
Brand: "${bizName}", Desc: "${bizDesc}", Niche: "${bizNiche}", Stage: "${bizStage}", Offer: "${offerName}".
Provide a comprehensive SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats) and a summary of how to leverage strengths and close weaknesses.`;
    const swotSystem = `You are a corporate strategist. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;

    const roadmapPrompt = `Based on this Business and Offer:
Brand: "${bizName}", Niche: "${bizNiche}", Stage: "${bizStage}", Offer: "${offerName}" (${offerPrice}).
Build a 90-day Growth Roadmap. Provide a week-by-week implementation guide for the next 12 weeks to launch/scale this offer successfully.`;
    const roadmapSystem = `You are a scaling strategist. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}.`;

    // Fire concurrently
    triggerStrategyAI('idea', ideaPrompt, ideaSystem, (finalRes) => {
      handleSaveGC({ strategy: { ...GC.strategy, idea_analysis: finalRes } });
    });
    triggerStrategyAI('icp', icpPrompt, icpSystem, (finalRes) => {
      handleSaveGC({ strategy: { ...GC.strategy, icp: finalRes } });
    });
    triggerStrategyAI('swot', swotPrompt, swotSystem, (finalRes) => {
      handleSaveGC({ strategy: { ...GC.strategy, swot_analysis: finalRes } });
    });
    triggerStrategyAI('roadmap', roadmapPrompt, roadmapSystem, (finalRes) => {
      handleSaveGC({ strategy: { ...GC.strategy, roadmap: finalRes } });
    });
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
                <select className="inp" value={bizStage} onChange={e => setBizStage(e.target.value)}>
                  <option>Idea — Just starting to explore</option>
                  <option>Validation — Testing the concept</option>
                  <option>Launch — Getting first clients</option>
                  <option>Growth — Scaling up</option>
                </select>
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
            <div className="sec-hd"><div className="sec-title">{L('Idea & Offer Analysis', 'تحليل الفكرة والعرض')}</div></div>
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
          <div className="sec-hd"><div className="sec-title">🎯 {L('Ideal Client Profile (ICP)', 'الملف المثالي للعميل')}</div></div>
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
          <div className="sec-hd"><div className="sec-title">⚔️ {L('SWOT Analysis', 'تحليل SWOT')}</div></div>
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
          <div className="sec-hd"><div className="sec-title">🗺️ {L('Growth Roadmap', 'خارطة طريق النمو')}</div></div>
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
