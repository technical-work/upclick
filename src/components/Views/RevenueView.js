'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { DB } from '../../data/mockData';

export default function RevenueView() {
  const { lang, L, t, formatMoney, GC, saveGC } = useBusiness();

  // Tab state inside Revenue Hub
  const [activeSubTab, setActiveSubTab] = useState('rv-streams'); // 'rv-streams', 'rv-deals', 'rv-neg', etc.

  // 1. Streams State
  const activeStreamsCount = DB.streamsLauncher[lang]?.filter(s => s.a).length || 4;

  const revenueData = GC.revenue || {};

  // 2. Deals / Pipeline State
  const [pipelineDeals, setPipelineDeals] = useState(revenueData.deals && Object.keys(revenueData.deals).length ? revenueData.deals : (DB.deals || {
    Prospect: [],
    Negotiating: [],
    Contracted: [],
    Completed: []
  }));

  // 6. Affiliates State
  const [affiliatesList, setAffiliatesList] = useState(revenueData.affiliates && revenueData.affiliates.length ? revenueData.affiliates : (DB.affLinks || []));

  // 8. Email / Lead Magnets State
  const [leadMagnets, setLeadMagnets] = useState(revenueData.leadMagnets && revenueData.leadMagnets.length ? revenueData.leadMagnets : (DB.leadMagnets[lang] || []));

  // 9. Coaching Sessions State
  const [coachingSessions, setCoachingSessions] = useState(revenueData.coachingSessions && revenueData.coachingSessions.length ? revenueData.coachingSessions : (DB.coachSessions[lang] || []));

  // 10. Merch State
  const [merchCatalog, setMerchCatalog] = useState(revenueData.merch && revenueData.merch.length ? revenueData.merch : (DB.merchItems || []));

  // Sync state if GC updates
  useEffect(() => {
    if (GC.revenue) {
      if (GC.revenue.deals) setPipelineDeals(GC.revenue.deals);
      if (GC.revenue.affiliates) setAffiliatesList(GC.revenue.affiliates);
      if (GC.revenue.leadMagnets) setLeadMagnets(GC.revenue.leadMagnets);
      if (GC.revenue.coachingSessions) setCoachingSessions(GC.revenue.coachingSessions);
      if (GC.revenue.merch) setMerchCatalog(GC.revenue.merch);
    }
  }, [GC.revenue]);

  const saveRevenueData = (updatedFields) => {
    const updatedGC = {
      ...GC,
      revenue: {
        ...(GC.revenue || {}),
        ...updatedFields
      }
    };
    saveGC(updatedGC);
  };

  const handleAddDeal = () => {
    const brand = prompt(L('Enter Brand Name:', 'أدخل اسم البراند:'));
    if (!brand) return;
    const value = prompt(L('Enter Deal Value (e.g. $500):', 'أدخل قيمة الصفقة (مثال: $500):'), '$500');
    if (!value) return;
    const type = prompt(L('Enter Content Type:', 'أدخل نوع المحتوى:'), '1x Reel');

    const newDeal = {
      n: brand,
      a: value,
      ty: { en: type, ar: type }
    };

    const newDeals = {
      ...pipelineDeals,
      Prospect: [...(pipelineDeals.Prospect || []), newDeal]
    };

    setPipelineDeals(newDeals);
    saveRevenueData({ deals: newDeals });
    alert(L('Deal added to Prospect stage!', 'تمت إضافة الصفقة لمرحلة قيد البحث!'));
  };

  // 3. Negotiator State
  const [negBrand, setNegBrand] = useState('');
  const [negAmount, setNegAmount] = useState('');
  const [negType, setNegType] = useState('1x Reel');
  const [negExcl, setNegExcl] = useState('No exclusivity');
  const [negResult, setNegResult] = useState(null);

  const handleRunNeg = () => {
    const brandName = negBrand || L('Brand', 'براند');
    const amount = parseInt(negAmount) || 500;

    const eB = negExcl.includes('90') ? 0.5 : negExcl.includes('60') ? 0.35 : negExcl.includes('30') ? 0.2 : 0;
    const tB = negType.includes('Campaign') || negType.includes('Full') || negType.includes('كاملة') ? 2 : 1;
    const fair = Math.round(284 * 0.8 * tB * (1 + eB));
    const ctr = Math.round(fair * 1.25);

    let rating, icon;
    if (amount < fair * 0.7) {
      rating = L('Too Low', 'منخفض جداً');
      icon = '⚠️';
    } else if (amount < fair * 0.9) {
      rating = L('Paper', 'عادل');
      icon = '🟡';
    } else if (amount < fair * 1.2) {
      rating = L('Good', 'جيد');
      icon = '✅';
    } else {
      rating = L('Excellent', 'ممتاز');
      icon = '🌟';
    }

    const col = icon === '⚠️' ? 'var(--red)' : icon === '🌟' ? 'var(--green)' : icon === '✅' ? 'var(--green)' : 'var(--amber)';
    const rec = amount < fair
      ? L(`Counter with $${ctr.toLocaleString()}. Highlight your 63% female audience aged 18–34.`, `قدّمي عرضاً مضاداً بـ $${ctr.toLocaleString()}. ركّزي على جمهورك الأنثوي ٦٣٪ الفئة العمرية ١٨–٣٤.`)
      : L(`${rating} offer. You can push to $${ctr.toLocaleString()} to maximize value.`, `عرض ${rating}. يمكنك المطالبة بـ $${ctr.toLocaleString()} لتعظيم القيمة.`);

    setNegResult({
      icon,
      rating,
      color: col,
      amount,
      fair,
      rec
    });
  };

  // 4. Course Builder State
  const [courseTopic, setCourseTopic] = useState('');
  const [courseAudience, setCourseAudience] = useState('Beginner creators');
  const [coursePrice, setCoursePrice] = useState('$97');
  const [courseOutlineData, setCourseOutlineData] = useState(null);

  const handleBuildCourse = () => {
    const topic = courseTopic || L('Content Creation Mastery', 'إتقان إنشاء المحتوى');
    const price = coursePrice;
    const aud = courseAudience;

    const students = price.includes('29') ? '50–100' : price.includes('97') ? '30–60' : price.includes('197') ? '15–30' : '5–15';
    const rev = price.includes('29') ? '$1,450–2,900' : price.includes('97') ? '$2,910–5,820' : price.includes('197') ? '$2,955–5,910' : '$2,485–7,455';

    setCourseOutlineData({
      topic,
      price,
      aud,
      rev,
      students,
      outline: DB.courseOutline[lang] || []
    });
  };

  // 5. Digital Shop List
  const handleAddProduct = () => {
    alert(L('Product added! Check Shop layout.', 'تمت إضافة المنتج! تحقق من المتجر.'));
  };

  const handleAddAffLink = () => {
    const name = prompt(L('Enter Program Name:', 'اسم برنامج الأفيليت:'));
    if (!name) return;
    const clicks = Math.floor(Math.random() * 500);
    const earnings = `$${Math.floor(Math.random() * 100)}`;
    const newAff = {
      n: name,
      cl: clicks,
      cv: Math.floor(clicks * 0.03),
      cvr: '3%',
      earn: earnings
    };
    const newList = [...affiliatesList, newAff];
    setAffiliatesList(newList);
    saveRevenueData({ affiliates: newList });
  };

  // 7. Patreon Membership State
  const [patNiche, setPatNiche] = useState('Business & Finance');
  const patTiersList = (DB.patTiers && DB.patTiers[patNiche] && DB.patTiers[patNiche][lang]) || (DB.patTiers && DB.patTiers['Business & Finance'] && DB.patTiers['Business & Finance'][lang]) || [];

  const handleGenLeadMagnet = () => {
    const newM = {
      e: '🧲',
      n: lang === 'ar' ? 'AI مولّد: تحدي ٣٠ يوم للمنشئ' : 'AI: 30-Day Creator Challenge',
      subs: 0,
      cvr: '0%'
    };
    const newList = [newM, ...leadMagnets];
    setLeadMagnets(newList);
    saveRevenueData({ leadMagnets: newList });
  };

  const handleAddCoachingSession = () => {
    const name = prompt(L('Enter client name:', 'أدخل اسم العميل:'));
    if (!name) return;
    const type = prompt(L('Session Type (e.g. 1-on-1 Consulting):', 'نوع الجلسة (مثال: استشارة فردية):'), '1-on-1 Consulting');
    const newSession = {
      n: name,
      ty: type,
      t: L('Tomorrow 4:00 PM', 'غداً ٤:٠٠ م'),
      s: 'bdo',
      sl: L('Pending', 'معلق')
    };
    const newList = [newSession, ...coachingSessions];
    setCoachingSessions(newList);
    saveRevenueData({ coachingSessions: newList });
  };

  const handleAddMerch = () => {
    const name = prompt(L('Merch Item Name:', 'اسم منتج الميرش:'));
    if (!name) return;
    const price = prompt(L('Price:', 'السعر:'), '$25');
    const newMerch = {
      e: '👕',
      n: { en: name, ar: name },
      p: price,
      s: 0,
      c: '#b060ff'
    };
    const newList = [...merchCatalog, newMerch];
    setMerchCatalog(newList);
    saveRevenueData({ merch: newList });
  };

  return (
    <div className="pg on" id="pg-revenue">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">💰</span>
          {L('Revenue Hub', 'مركز الإيرادات')}
        </div>
      </div>

      <div className="tool-tabs" id="rev-tabs" style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
        {[
          { key: 'rv-streams', label: L('Streams', 'مصادر الدخل'), emoji: '💰' },
          { key: 'rv-deals', label: L('Deals', 'الصفقات'), emoji: '🤝', badge: 3 },
          { key: 'rv-neg', label: L('Negotiator', 'المفاوض الذكي'), emoji: '🤖' },
          { key: 'rv-course', label: L('Courses', 'الكورسات'), emoji: '🎓' },
          { key: 'rv-shop', label: L('Shop', 'المتجر'), emoji: '🛍️' },
          { key: 'rv-aff', label: L('Affiliate', 'الأفيليت'), emoji: '🔗' },
          { key: 'rv-pat', label: L('Membership', 'العضويات'), emoji: '🏆' },
          { key: 'rv-email', label: L('Email List', 'قائمة الإيميل'), emoji: '📧' },
          { key: 'rv-coach', label: L('Coaching', 'الكوتشينج'), emoji: '🎯' },
          { key: 'rv-merch', label: L('Merch', 'الميرش'), emoji: '👕' },
          { key: 'rv-score', label: L('Score', 'تقييم التنويع'), emoji: '📈' }
        ].map(tab => (
          <button 
            key={tab.key}
            className={`tbb ${activeSubTab === tab.key ? 'on' : ''}`}
            onClick={() => setActiveSubTab(tab.key)}
          >
            {tab.emoji} {tab.label} {tab.badge && <span className="nb-badge" style={{ position: 'static', marginLeft: '5px' }}>{tab.badge}</span>}
          </button>
        ))}
      </div>

      {/* ================= TAB 1: STREAMS ================= */}
      {activeSubTab === 'rv-streams' && (
        <div className="tool-panel on" id="rv-streams">
          <div className="g4 stagger mb">
            <div className="stat-card">
              <div className="stat-lbl">💵 {L('Total Monthly', 'إجمالي الدخل الشهري')}</div>
              <div className="stat-val">$4,320</div>
              <div className="stat-ch ch-up">▲ +12%</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">🔢 {L('Active Streams', 'المصادر النشطة')}</div>
              <div className="stat-val" style={{ color: 'var(--green)' }}>{activeStreamsCount}</div>
              <div className="stat-ch ch-nu">{L('of 7', 'من 7')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">📈 {L('Best Stream', 'أفضل مصدر')}</div>
              <div className="stat-val" style={{ fontSize: '20px' }}>{L('Sponsorships', 'الرعايات')}</div>
              <div className="stat-ch ch-nu">65% {L('of income', 'من الدخل')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">🎯 {L('Diversity Score', 'معدل التنوع')}</div>
              <div className="stat-val" style={{ color: 'var(--amber)' }}>58<span style={{ fontSize: '14px', color: 'var(--t3)' }}>/100</span></div>
            </div>
          </div>
          <div className="g2">
            <div className="card mb">
              <div className="sh"><div className="st">{L('Income Breakdown', 'تقسيم الدخل')}</div></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <svg width="100" height="100" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--surface3)" stroke-width="4.5"/>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--a)" stroke-width="4.5" stroke-dasharray="65 35" stroke-dashoffset="-25" transform="rotate(-90 18 18)"/>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--green)" stroke-width="4.5" stroke-dasharray="19 81" stroke-dashoffset="-90" transform="rotate(-90 18 18)"/>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--red)" stroke-width="4.5" stroke-dasharray="10 90" stroke-dashoffset="-109" transform="rotate(-90 18 18)"/>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--amber)" stroke-width="4.5" stroke-dasharray="6 94" stroke-dashoffset="-119" transform="rotate(-90 18 18)"/>
                  <text x="18" y="20" text-anchor="middle" font-size="4.5" fill="var(--t1)" font-weight="bold">$4.3K</text>
                </svg>
                <div className="dleg" style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                  {(DB.streamsLegend[lang] || []).map((l, idx) => (
                    <div className="dlr" key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="dd" style={{ background: l.c, width: '10px', height: '10px', borderRadius: '50%' }}></div>
                      <div style={{ fontSize: '11.5px', color: 'var(--t2)', flex: 1 }}>{l.l}</div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t1)' }}>{l.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card mb">
              <div className="sh"><div className="st">{L('Launch New Stream', 'إطلاق مصدر دخل جديد')}</div></div>
              <div id="stream-launcher" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(DB.streamsLauncher[lang] || []).map((s, idx) => (
                  <div className="row" key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid var(--edge)' }}>
                    <div style={{ fontSize: '16px' }}>{s.e}</div>
                    <div style={{ flex: 1 }}>
                      <div className="rn" style={{ fontWeight: 600, fontSize: '12.5px' }}>{s.n}</div>
                      <div className="rs" style={{ fontSize: '11px', color: 'var(--t2)' }}>{s.est} · {s.t}</div>
                    </div>
                    <span className={`badge ${s.a ? 'b-green' : 'b-ai'}`}>
                      {s.a ? L('Active', 'نشط') : L('Not started', 'لم تبدأ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: DEALS ================= */}
      {activeSubTab === 'rv-deals' && (
        <div className="tool-panel on" id="rv-deals">
          <div className="g4 stagger mb">
            <div className="stat">
              <div className="slbl">🟢 {L('Active', 'نشط')}</div>
              <div className="sval" style={{ color: 'var(--green)' }}>3</div>
            </div>
            <div className="stat">
              <div className="slbl">🟡 {L('Pending', 'معلق')}</div>
              <div className="sval" style={{ color: 'var(--amber)' }}>4</div>
            </div>
            <div className="stat">
              <div className="slbl">💰 {L('Revenue', 'الأرباح')}</div>
              <div className="sval">$2,800</div>
            </div>
            <div className="stat">
              <div className="slbl">📊 {L('Avg Deal', 'متوسط الصفقة')}</div>
              <div className="sval">$700</div>
            </div>
          </div>
          <div className="card mb">
            <div className="sh" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div className="st">{L('Deals Pipeline', 'مراحل الصفقات')}</div>
              <button className="btn btn-prime" style={{ padding: '5px 10px', fontSize: '11.5px' }} onClick={handleAddDeal}>
                + {L('New Deal', 'صفقة جديدة')}
              </button>
            </div>
            <div className="pipe" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              {['Prospect', 'Negotiating', 'Contracted', 'Completed'].map(stage => {
                const colors = { Prospect: 'var(--t2)', Negotiating: 'var(--amber)', Contracted: 'var(--purple)', Completed: 'var(--green)' };
                const stagesAR = { Prospect: 'قيد البحث', Negotiating: 'في التفاوض', Contracted: 'متعاقد', Completed: 'مكتمل' };
                const stageList = pipelineDeals[stage] || [];
                return (
                  <div className="pcol" key={stage} style={{ background: 'var(--surface2)', padding: '10px', borderRadius: '10px' }}>
                    <div className="pch" style={{ fontWeight: 700, fontSize: '12.5px', marginBottom: '8px', borderBottom: '1px solid var(--edge)', paddingBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      {lang === 'ar' ? stagesAR[stage] : stage}
                      <span style={{ background: 'var(--surface3)', borderRadius: '5px', padding: '1px 6px', fontSize: '10px', color: colors[stage] }}>
                        {stageList.length}
                      </span>
                    </div>
                    {stageList.map((d, idx) => (
                      <div 
                        className="pc" 
                        key={idx} 
                        style={{ background: 'var(--surface3)', padding: '8px', borderRadius: '6px', marginBottom: '6px', cursor: 'pointer' }}
                        onClick={() => alert(`${d.n} — ${d.a}`)}
                      >
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t1)' }}>{d.n}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--orange)', fontWeight: 600 }}>{d.a}</div>
                        <div style={{ fontSize: '10.5px', color: 'var(--t2)' }}>{d.ty[lang] || d.ty.en}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="card mb">
            <div className="sh"><div className="st">{L('Best Brands to Repeat', 'أفضل الماركات للمتابعة')}</div></div>
            <div id="best-brands" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(DB.bestBrands[lang] || []).map((b, idx) => (
                <div className="row" key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--edge)' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--orange-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', color: 'var(--orange)' }}>
                    {b.n[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="rn" style={{ fontWeight: 600, fontSize: '12.5px' }}>{b.n}</div>
                    <div className="rs" style={{ fontSize: '11px', color: 'var(--t2)' }}>
                      {b.deals} {L('deals', 'صفقات')} · {b.eng}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--orange)' }}>{b.rev}</div>
                    {b.rec && <span className="badge b-green" style={{ fontSize: '10px', padding: '2px 6px' }}>{L('Renew', 'جدد')}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: NEGOTIATOR ================= */}
      {activeSubTab === 'rv-neg' && (
        <div className="tool-panel on" id="rv-neg">
          <div className="g2">
            <div className="card mb">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Brand Name', 'اسم البراند')}
                  </label>
                  <input 
                    className="inp" 
                    value={negBrand} 
                    onChange={(e) => setNegBrand(e.target.value)} 
                    placeholder="e.g. Nike, Samsung..."
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Their Offer', 'عرضهم المالي')}
                  </label>
                  <input 
                    className="inp" 
                    value={negAmount} 
                    onChange={(e) => setNegAmount(e.target.value)} 
                    placeholder="$500"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Content Type', 'نوع المحتوى')}
                  </label>
                  <select 
                    className="inp" 
                    value={negType} 
                    onChange={(e) => setNegType(e.target.value)}
                  >
                    <option>1x Reel</option>
                    <option>1x Carousel</option>
                    <option>Stories Package</option>
                    <option>Full Campaign</option>
                    <option>Product Review</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Exclusivity', 'حقوق الحصرية')}
                  </label>
                  <select 
                    className="inp" 
                    value={negExcl} 
                    onChange={(e) => setNegExcl(e.target.value)}
                  >
                    <option>No exclusivity</option>
                    <option>30 days</option>
                    <option>60 days</option>
                    <option>90 days</option>
                  </select>
                </div>
                <button className="btn btn-prime" onClick={handleRunNeg} style={{ width: '100%', justifyContent: 'center' }}>
                  🤖 {L('Analyze Deal', 'تحليل الصفقة')}
                </button>
              </div>
            </div>
            <div className="card mb">
              <div className="sh"><div className="st">{L('AI Analysis', 'تحليل الذكاء')}</div></div>
              <div id="negout">
                {!negResult ? (
                  <div style={{ fontSize: '12px', color: 'var(--t3)', textAlign: 'center', padding: '36px 0' }}>
                    {L('Fill details and analyze', 'املأ التفاصيل واضغط للتحليل')}
                  </div>
                ) : (
                  <div>
                    <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                      <div style={{ fontSize: '32px' }}>{negResult.icon}</div>
                      <div style={{ fontFamily: 'var(--ff)', fontSize: '18px', fontWeight: 800, color: negResult.color, marginTop: '4px' }}>
                        {negResult.rating}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px', marginBottom: '12px' }}>
                      <div className="stat" style={{ textAlign: 'center' }}>
                        <div className="slbl" style={{ justifyContent: 'center' }}>{L('Their Offer', 'عرضهم')}</div>
                        <div className="sval" style={{ color: negResult.color }}>${negResult.amount.toLocaleString()}</div>
                      </div>
                      <div className="stat" style={{ textAlign: 'center' }}>
                        <div className="slbl" style={{ justifyContent: 'center' }}>{L('Fair Value', 'القيمة العادلة')}</div>
                        <div className="sval" style={{ color: 'var(--orange)' }}>${negResult.fair.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="ai" style={{ padding: '10px', background: 'var(--orange-dim)', borderRadius: '8px', border: '1px solid var(--orange-d)' }}>
                      <strong>{L('AI Recommendation', 'توصية الذكاء الاصطناعي')}:</strong>
                      <br /><br />
                      {negResult.rec}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="card mb">
            <div className="sh"><div className="st">{L('Pricing Templates', 'قوالب التسعير')}</div></div>
            <div className="g3" id="pricetmpl">
              {(DB.priceTmpl[lang] || []).map((t, idx) => (
                <div className="card" key={idx} style={{ borderColor: `${t.c}40` }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: t.c, marginBottom: '5px' }}>
                    🏷️ {t.n}
                  </div>
                  <div style={{ fontFamily: 'var(--ff)', fontSize: '15px', fontWeight: 800, color: 'var(--t1)', marginBottom: '7px' }}>
                    {t.p}
                  </div>
                  {t.items.map((item, i) => (
                    <div style={{ fontSize: '11.5px', color: 'var(--t2)', marginBottom: '2px' }} key={i}>
                      ✓ {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: COURSES ================= */}
      {activeSubTab === 'rv-course' && (
        <div className="tool-panel on" id="rv-course">
          <div className="g4 stagger mb">
            <div className="stat"><div className="slbl">📚 {L('Active Courses', 'الكورسات النشطة')}</div><div className="sval">1</div></div>
            <div className="stat"><div className="slbl">👥 {L('Students', 'الطلاب')}</div><div className="sval">58</div><div className="sch up">▲ +8 this week</div></div>
            <div className="stat"><div className="slbl">💰 {L('Revenue', 'الأرباح')}</div><div className="sval">$5,742</div></div>
            <div className="stat"><div className="slbl">⭐ {L('Rating', 'التقييم')}</div><div className="sval">4.9</div></div>
          </div>
          <div className="g2">
            <div className="card mb">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Course Topic', 'موضوع الكورس')}
                  </label>
                  <input 
                    className="inp" 
                    value={courseTopic} 
                    onChange={(e) => setCourseTopic(e.target.value)} 
                    placeholder="e.g. How to grow on Instagram from 0 to 100K"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Target Audience', 'الجمهور المستهدف')}
                  </label>
                  <select 
                    className="inp" 
                    value={courseAudience} 
                    onChange={(e) => setCourseAudience(e.target.value)}
                  >
                    <option>{L('Beginner creators', 'منشئي محتوى مبتدئين')}</option>
                    <option>{L('Intermediate influencers', 'مؤثرين متوسطين')}</option>
                    <option>{L('Brands & businesses', 'علامات تجارية وشركات')}</option>
                    <option>{L('Arab market creators', 'صناع المحتوى في العالم العربي')}</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Price Point', 'السعر المقترح')}
                  </label>
                  <select 
                    className="inp" 
                    value={coursePrice} 
                    onChange={(e) => setCoursePrice(e.target.value)}
                  >
                    <option>$29</option>
                    <option>$97</option>
                    <option>$197</option>
                    <option>$497</option>
                  </select>
                </div>
                <button className="btn btn-prime" onClick={handleBuildCourse} style={{ width: '100%', justifyContent: 'center' }}>
                  🤖 {L('Generate Structure', 'إنشاء هيكل الكورس')}
                </button>
              </div>
            </div>
            <div className="card mb">
              <div className="sh"><div className="st">{L('Course Outline', 'هيكل الكورس')}</div></div>
              <div id="courseout" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {!courseOutlineData ? (
                  <div style={{ fontSize: '12px', color: 'var(--t3)', textAlign: 'center', padding: '36px 0' }}>
                    {L('Fill details and generate', 'املأ البيانات واضغط للإنشاء')}
                  </div>
                ) : (
                  <div>
                    <div className="ai" style={{ marginBottom: '12px', padding: '10px', background: 'var(--orange-dim)', borderRadius: '8px' }}>
                      <strong>📚 "{courseOutlineData.topic}"</strong>
                      <br />
                      {L('Audience', 'الجمهور')}: {courseOutlineData.aud} · {L('Price', 'السعر')}: {courseOutlineData.price}
                      <br />
                      {L('Expected revenue', 'الإيرادات المتوقعة')} ({courseOutlineData.students} {L('students', 'طالب')}):{' '}
                      <strong style={{ color: 'var(--green)' }}>{courseOutlineData.rev}</strong>
                    </div>
                    {courseOutlineData.outline.map((m, mIdx) => (
                      <div style={{ marginBottom: '10px' }} key={mIdx}>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--orange)', marginBottom: '5px' }}>
                          {m.m} ({m.ls.length} {L('lessons', 'دروس')})
                        </div>
                        {m.ls.map((ls, lIdx) => (
                          <div style={{ fontSize: '12px', color: 'var(--t2)', padding: '3px 0 3px 12px', borderLeft: '2px solid var(--edge2)' }} key={lIdx}>
                            ▸ {ls}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: SHOP ================= */}
      {activeSubTab === 'rv-shop' && (
        <div className="tool-panel on" id="rv-shop">
          <div className="g4 stagger mb">
            <div className="stat"><div className="slbl">📦 {L('Products', 'المنتجات')}</div><div className="sval">6</div></div>
            <div className="stat"><div className="slbl">🛒 {L('Total Sales', 'إجمالي المبيعات')}</div><div className="sval">223</div><div className="sch up">▲ +28%</div></div>
            <div className="stat"><div className="slbl">💵 {L('Revenue', 'الأرباح')}</div><div className="sval">$700</div></div>
            <div className="stat"><div className="slbl">⭐ {L('Avg Rating', 'متوسط التقييم')}</div><div className="sval">4.8</div></div>
          </div>
          <button className="btn btn-prime mb" onClick={handleAddProduct}>
            + {L('Add Product', 'إضافة منتج')}
          </button>
          <div className="g3" id="shopgrid">
            {(DB.products || []).map((p, idx) => (
              <div 
                className="prd" 
                key={idx} 
                style={{ background: 'var(--surface2)', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', border: '1px solid var(--edge)' }}
                onClick={() => alert(`${p.n[lang]} — ${p.price}`)}
              >
                <div className="prdt" style={{ background: `${p.c}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontSize: '32px' }}>
                  {p.e}
                </div>
                <div style={{ padding: '11px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)', marginBottom: '2px' }}>
                    {p.n[lang] || p.n.en}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--t2)', marginBottom: '7px' }}>
                    {p.ty[lang] || p.ty.en}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontFamily: 'var(--ff)', fontSize: '14px', fontWeight: 700, color: 'var(--orange)' }}>
                      {p.price}
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--t3)' }}>
                      {p.sales} {L('sold', 'مباع')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 6: AFFILIATES ================= */}
      {activeSubTab === 'rv-aff' && (
        <div className="tool-panel on" id="rv-aff">
          <div className="g4 stagger mb">
            <div className="stat"><div className="slbl">🔗 {L('Links', 'الروابط')}</div><div className="sval">{affiliatesList.length}</div></div>
            <div className="stat"><div className="slbl">👆 {L('Clicks', 'الزيارات')}</div><div className="sval">28.4K</div><div className="sch up">▲ +9%</div></div>
            <div className="stat"><div className="slbl">🛒 {L('Conversions', 'المبيعات')}</div><div className="sval">842</div></div>
            <div className="stat"><div className="slbl">💰 {L('Earnings', 'الأرباح')}</div><div className="sval">$820</div></div>
          </div>
          <div className="g2">
            <div className="card mb">
              <div className="sh" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div className="st">{L('Link Performance', 'أداء الروابط')}</div>
                <button className="btn btn-prime" style={{ padding: '4px 9px', fontSize: '11px' }} onClick={handleAddAffLink}>
                  + {L('Add', 'إضافة')}
                </button>
              </div>
              <div id="afflinks">
                {affiliatesList.map((a, i) => (
                  <div 
                    key={i} 
                    style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 0', borderBottom: i < affiliatesList.length - 1 ? '1px solid var(--edge)' : 'none' }}
                  >
                    <div style={{ fontSize: '14px' }}>🔗</div>
                    <div style={{ flex: 1 }}>
                      <div className="rn" style={{ fontWeight: 600, fontSize: '12.5px' }}>{a.n}</div>
                      <div className="rs" style={{ fontSize: '11.5px', color: 'var(--t2)' }}>
                        {a.cl} {L('clicks', 'كليكات')} · {a.cv} {L('conversions', 'تحويلات')} ({a.cvr})
                      </div>
                    </div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--green)' }}>{a.earn}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card mb">
              <div className="sh"><div className="st">{L('AI Recommendations', 'توصيات الذكاء')}</div></div>
              <div id="aff-ai">
                <div className="ai" style={{ marginBottom: '10px', fontSize: '12px', padding: '10px', background: 'var(--orange-dim)', borderRadius: '8px' }}>
                  {L('Based on your fashion & beauty audience (63% female, 18–34):', 'بناءً على جمهورك في الموضة والجمال (٦٣٪ إناث، ١٨–٣٤):')}
                </div>
                {(DB.affRecs[lang] || []).map((r, idx) => (
                  <div 
                    className="idea mb" 
                    key={idx} 
                    style={{ padding: '10px', background: 'var(--surface2)', borderRadius: '8px', cursor: 'pointer' }}
                    onClick={() => alert(r.n)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)', flex: 1 }}>{r.n}</div>
                      <span className="badge b-green">CVR {r.cvr}</span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--t2)' }}>{r.why}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 7: MEMBERSHIPS ================= */}
      {activeSubTab === 'rv-pat' && (
        <div className="tool-panel on" id="rv-pat">
          <div className="g4 stagger mb">
            <div className="stat"><div className="slbl">👥 {L('Members', 'الأعضاء')}</div><div className="sval" style={{ color: 'var(--green)' }}>127</div><div className="sch up">▲ +14 this month</div></div>
            <div className="stat"><div className="slbl">💰 {L('Monthly Recurring', 'العائد المتكرر')}</div><div className="sval">$1,290</div></div>
            <div className="stat"><div className="slbl">💎 {L('Avg Tier', 'متوسط قيمة الاشتراك')}</div><div className="sval">$10.2</div></div>
            <div className="stat"><div className="slbl">📉 {L('Churn', 'معدل الإلغاء')}</div><div className="sval" style={{ color: 'var(--green)' }}>3.1%</div></div>
          </div>
          <div className="g2">
            <div className="card mb">
              <div className="sh"><div className="st">{L('Current Tiers', 'الاشتراكات الحالية')}</div></div>
              <div id="pat-tiers">
                {patTiersList.map((t, idx) => (
                  <div key={idx} style={{ background: 'var(--surface2)', borderRadius: '9px', padding: '12px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }}>{t.t}</div>
                      <div style={{ fontFamily: 'var(--ff)', fontSize: '14px', fontWeight: 800, color: 'var(--orange)' }}>
                        {t.p}
                        <span style={{ fontSize: '10px', color: 'var(--t2)' }}>
                          /{L('mo', 'شهر')} · {t.m} {L('members', 'أعضاء')}
                        </span>
                      </div>
                    </div>
                    <div className="gbw" style={{ height: '6px', background: 'var(--surface3)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div className="gbf" style={{ width: `${Math.round((t.m / 65) * 100)}%`, background: 'var(--orange)', height: '100%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card mb">
              <div className="sh"><div className="st">{L('AI Tier Designer', 'مصمم الاشتراكات بالذكاء')}</div></div>
              <select 
                className="inp" 
                value={patNiche} 
                onChange={(e) => setPatNiche(e.target.value)} 
                style={{ marginBottom: '10px', width: '100%' }}
              >
                <option value="Fashion & Beauty">{L('Fashion & Beauty', 'الأزياء والجمال')}</option>
                <option value="Fitness & Health">{L('Fitness & Health', 'الصحة والرشاقة')}</option>
                <option value="Business & Finance">{L('Business & Finance', 'الأعمال والمالية')}</option>
                <option value="Tech & Education">{L('Tech & Education', 'التقنية والتعليم')}</option>
                <option value="Food & Lifestyle">{L('Food & Lifestyle', 'الطبخ ونمط الحياة')}</option>
              </select>
              <div id="pat-ai">
                {patTiersList.map((t, idx) => (
                  <div className="idea" key={idx} style={{ marginBottom: '8px', padding: '10px', background: 'var(--surface2)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }}>{t.t}</div>
                      <div style={{ fontFamily: 'var(--ff)', fontSize: '14px', fontWeight: 800, color: 'var(--orange)' }}>
                        {t.p}<span style={{ fontSize: '10px', color: 'var(--t2)' }}>/{L('mo', 'شهر')}</span>
                      </div>
                    </div>
                    {t.b?.map((benefit, bIdx) => (
                      <div style={{ fontSize: '11.5px', color: 'var(--t2)', padding: '2px 0' }} key={bIdx}>
                        ✓ {benefit}
                      </div>
                    ))}
                    <div style={{ fontSize: '10px', color: 'var(--t3)', marginTop: '5px' }}>
                      {t.m} {L('current members', 'أعضاء حالياً')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 8: EMAIL ================= */}
      {activeSubTab === 'rv-email' && (
        <div className="tool-panel on" id="rv-email">
          <div className="g4 stagger mb">
            <div className="stat"><div className="slbl">📧 {L('Subscribers', 'المشتركين')}</div><div className="sval">8,420</div><div className="sch up">▲ +340 this month</div></div>
            <div className="stat"><div className="slbl">📬 {L('Open Rate', 'معدل الفتح')}</div><div className="sval" style={{ color: 'var(--green)' }}>42%</div><div className="sch up">Industry: 21%</div></div>
            <div className="stat"><div className="slbl">👆 {L('Click Rate', 'معدل النقر')}</div><div className="sval">8.4%</div></div>
            <div className="stat"><div className="slbl">💰 {L('Revenue', 'الأرباح')}</div><div className="sval">$180</div></div>
          </div>
          <div className="g2">
            <div className="card mb">
              <div className="sh"><div className="st">{L('Subscriber Growth', 'نمو المشتركين')}</div></div>
              <div className="bch" style={{ height: '90px', display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '10px 0' }}>
                {[30, 45, 60, 50, 75, 90, 85, 110, 130].map((h, idx) => (
                  <div key={idx} style={{ flex: 1, background: 'var(--orange)', height: `${h}%`, borderRadius: '4px 4px 0 0', position: 'relative' }}></div>
                ))}
              </div>
            </div>
            <div className="card mb">
              <div className="sh"><div className="st">{L('Lead Magnets', 'المغناطيسات')}</div></div>
              <div id="lead-magnets">
                {leadMagnets.map((m, idx) => (
                  <div 
                    key={idx} 
                    style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 0', borderBottom: idx < leadMagnets.length - 1 ? '1px solid var(--edge)' : 'none' }}
                  >
                    <div style={{ fontSize: '18px' }}>{m.e}</div>
                    <div style={{ flex: 1 }}>
                      <div className="rn" style={{ fontWeight: 600, fontSize: '12.5px' }}>{m.n}</div>
                      <div className="rs" style={{ fontSize: '11.5px', color: 'var(--t2)' }}>
                        {m.subs} {L('subscribers', 'مشترك')} · {m.cvr} CVR
                      </div>
                    </div>
                    <span className="badge b-green">{L('Active', 'نشط')}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-prime" onClick={handleGenLeadMagnet} style={{ width: '100%', justifyContent: 'center', marginTop: '9px' }}>
                🤖 {L('Generate Ideas', 'توليد أفكار')}
              </button>
            </div>
          </div>
          <div className="card mb">
            <div className="sh" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div className="st">{L('Active Sequences', 'سلاسل رسائل البريد النشطة')}</div>
              <button className="btn btn-prime" style={{ padding: '4px 9px', fontSize: '11px' }} onClick={() => alert(L('New Sequence Created!', 'تم إنشاء سلسلة جديدة!'))}>
                + {L('New', 'جديد')}
              </button>
            </div>
            <div id="email-seqs">
              {(DB.emailSeqs[lang] || []).map((s, idx) => (
                <div 
                  key={idx}
                  style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 0', borderBottom: idx < DB.emailSeqs[lang].length - 1 ? '1px solid var(--edge)' : 'none' }}
                >
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--orange-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                    📨
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="rn" style={{ fontWeight: 600, fontSize: '12.5px' }}>{s.n}</div>
                    <div className="rs" style={{ fontSize: '11.5px', color: 'var(--t2)' }}>
                      {s.emails} {L('emails', 'رسائل')} · {s.opens} {L('open rate', 'معدل الفتح')}
                    </div>
                  </div>
                  <span className={`badge ${s.s}`}>
                    {s.sl}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 9: COACHING ================= */}
      {activeSubTab === 'rv-coach' && (
        <div className="tool-panel on" id="rv-coach">
          <div className="g4 stagger mb">
            <div className="stat"><div className="slbl">📅 {L('Sessions', 'الجلسات')}</div><div className="sval">12</div><div className="sch up">▲ +3</div></div>
            <div className="stat"><div className="slbl">💰 {L('Revenue', 'الأرباح')}</div><div className="sval">$1,800</div></div>
            <div className="stat"><div className="slbl">⭐ {L('Rating', 'التقييم')}</div><div className="sval">4.9</div></div>
            <div className="stat"><div className="slbl">📈 {L('Book Rate', 'معدل الحجز')}</div><div className="sval">76%</div></div>
          </div>
          <div className="g2">
            <div className="card mb">
              <div className="sh" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div className="st">{L('This Week', 'هذا الأسبوع')}</div>
                <button className="btn btn-prime" style={{ padding: '4px 9px', fontSize: '11px' }} onClick={handleAddCoachingSession}>
                  + {L('Add', 'إضافة')}
                </button>
              </div>
              <div id="coach-sessions">
                {coachingSessions.map((s, idx) => (
                  <div 
                    key={idx}
                    style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 0', borderBottom: idx < coachingSessions.length - 1 ? '1px solid var(--edge)' : 'none' }}
                  >
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--orange-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'var(--orange)' }}>
                      {s.n[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="rn" style={{ fontWeight: 600, fontSize: '12.5px' }}>{s.n}</div>
                      <div className="rs" style={{ fontSize: '11.5px', color: 'var(--t2)' }}>
                        {s.ty} · {s.t}
                      </div>
                    </div>
                    <span className={`badge ${s.s}`}>{s.sl}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card mb">
              <div className="sh"><div className="st">{L('Session Types', 'أنواع الجلسات')}</div></div>
              <div id="coach-types">
                {(DB.coachTypes[lang] || []).map((t, idx) => (
                  <div 
                    key={idx}
                    style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '9px 0', borderBottom: idx < DB.coachTypes[lang].length - 1 ? '1px solid var(--edge)' : 'none' }}
                  >
                    <div style={{ fontSize: '18px' }}>{t.e}</div>
                    <div style={{ flex: 1 }}>
                      <div className="rn" style={{ fontWeight: 600, fontSize: '12.5px' }}>{t.n}</div>
                      <div className="rs" style={{ fontSize: '11.5px', color: 'var(--t2)' }}>
                        {t.b} {L('sessions booked', 'جلسات محجوزة')}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'var(--ff)', fontSize: '14px', fontWeight: 700, color: 'var(--orange)' }}>{t.p}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="card mb">
            <div className="sh"><div className="st">{L('Testimonials', 'آراء العملاء')}</div></div>
            <div id="testimonials" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(DB.testimonials || []).map((t, idx) => (
                <div className="idea" key={idx} style={{ padding: '10px', background: 'var(--surface2)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#fff' }}>
                      {t.i}
                    </div>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--t1)', flex: 1 }}>{t.n}</div>
                    <div style={{ fontSize: '11px', color: 'var(--amber)' }}>{'★'.repeat(t.r)}</div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--t2)', fontStyle: 'italic' }}>
                    "{t.tx[lang] || t.tx.en}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 10: MERCH ================= */}
      {activeSubTab === 'rv-merch' && (
        <div className="tool-panel on" id="rv-merch">
          <div className="g4 stagger mb">
            <div className="stat"><div className="slbl">👕 {L('Products Live', 'المنتجات المنشورة')}</div><div className="sval">5</div></div>
            <div className="stat"><div className="slbl">🛒 {L('Units Sold', 'الوحدات المباعة')}</div><div className="sval">89</div><div className="sch up">▲ +23</div></div>
            <div className="stat"><div className="slbl">💰 {L('Revenue', 'الأرباح')}</div><div className="sval">$2,136</div></div>
            <div className="stat"><div className="slbl">📦 {L('Pending Orders', 'الطلبات المعلقة')}</div><div className="sval" style={{ color: 'var(--amber)' }}>7</div></div>
          </div>
          <div className="g2">
            <div className="card mb">
              <div className="sh" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div className="st">{L('Merch Catalog', 'كتالوج المنتجات')}</div>
                <button className="btn btn-prime" style={{ padding: '4px 9px', fontSize: '11px' }} onClick={handleAddMerch}>
                  + {L('Design', 'تصميم جديد')}
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }} id="merch-grid">
                {merchCatalog.map((m, idx) => (
                  <div 
                    className="prd" 
                    key={idx} 
                    style={{ background: 'var(--surface2)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--edge)', cursor: 'pointer' }}
                    onClick={() => alert(m.n[lang] || m.n.en)}
                  >
                    <div className="prdt" style={{ background: `${m.c}14`, height: '60px', fontSize: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {m.e}
                    </div>
                    <div style={{ padding: '9px' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--t1)' }}>
                        {m.n[lang] || m.n.en}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ fontFamily: 'var(--ff)', fontSize: '13px', fontWeight: 700, color: 'var(--orange)' }}>
                          {m.p}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--t3)' }}>
                          {m.s} {L('sold', 'مباع')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card mb">
              <div className="sh"><div className="st">{L('AI Suggestions', 'مقترحات الذكاء')}</div></div>
              <div id="merch-ai">
                {((lang === 'ar' ? [
                  { idea: 'كيس هاتف "اختر الفوضى"', why: 'عبارتك الفيروسية. تكلفة منخفضة وهامش ربح مرتفع.', p: '$١٨–٢٥' },
                  { idea: 'دبابيس "حياة المنشئ"', why: 'قابل للتجميع، سعر منخفض، معدل مشاركة عالي.', p: '$١٢–١٥' },
                  { idea: 'حزمة خلفيات رقمية', why: 'بدون مخزون. دخل سلبي من التنزيلات.', p: '$٥–٩' }
                ] : [
                  { idea: 'Phone Case "Choose Chaos"', why: 'Your viral phrase. Low cost, high margin.', p: '$18–25' },
                  { idea: 'Enamel Pin Set "Creator Life"', why: 'Collectible, low price, high share rate.', p: '$12–15' },
                  { idea: 'Digital Wallpaper Pack', why: 'Zero inventory. Passive income from downloads.', p: '$5–9' }
                ])).map((m, idx) => (
                  <div className="idea" key={idx} style={{ marginBottom: '7px', padding: '10px', background: 'var(--surface2)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--t1)', marginBottom: '3px' }}>{m.idea}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--t2)', marginBottom: '4px' }}>{m.why}</div>
                    <div style={{ fontSize: '11px', color: 'var(--orange)', fontWeight: 600 }}>{L('Price:', 'السعر:')} {m.p}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 11: SCORE ================= */}
      {activeSubTab === 'rv-score' && (
        <div className="tool-panel on" id="rv-score">
          <div className="g2">
            <div className="card mb">
              <div className="sh"><div className="st">{L('Your Score', 'تقييمك الحالي')}</div></div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 0' }}>
                <svg width="150" height="150" viewBox="0 0 150 150">
                  <circle cx="75" cy="75" r="56" fill="none" stroke="var(--surface3)" stroke-width="14"/>
                  <circle cx="75" cy="75" r="56" fill="none" stroke="var(--orange)" stroke-width="14" stroke-dasharray="207 148" stroke-dashoffset="88" transform="rotate(-90 75 75)" stroke-linecap="round"/>
                  <text x="75" y="71" text-anchor="middle" font-size="26" fill="var(--t1)" font-family="var(--ff)" font-weight="800">58</text>
                  <text x="75" y="89" text-anchor="middle" font-size="12" fill="var(--t2)">/ 100</text>
                </svg>
                <div style={{ fontSize: '17px', fontFamily: 'var(--ff)', fontWeight: 800, color: 'var(--orange)', marginTop: '6px' }}>
                  {L('Moderate', 'متوسط التنوع')}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--t2)', marginTop: '3px', textAlign: 'center' }}>
                  {L('You rely heavily on sponsorships (65%)', 'تعتمد بشكل كبير على الإعلانات (65٪)')}
                </div>
              </div>
              <div id="div-breakdown" style={{ marginTop: '12px' }}>
                {(DB.divBreakdown[lang] || []).map((x, idx) => (
                  <div style={{ marginBottom: '8px' }} key={idx}>
                    <div style={{ display: 'flex', justifyAlignment: 'space-between', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontSize: '11.5px', color: 'var(--t1)' }}>{x.l}</span>
                      <span style={{ fontSize: '11.5px', fontStyle: 'normal', fontWeight: 600 }}>{x.pct}%</span>
                    </div>
                    <div className="gbw" style={{ height: '6px', background: 'var(--surface3)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div className="gbf" style={{ width: `${x.pct}%`, background: x.c, height: '100%' }}></div>
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--t3)', marginTop: '2px' }}>{x.note}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card mb">
              <div className="sh"><div className="st">{L('AI Recommendations', 'توصيات الذكاء')}</div></div>
              <div id="div-recs">
                {(DB.divRecs[lang] || []).map((r, idx) => (
                  <div className="idea" key={idx} style={{ marginBottom: '8px', padding: '10px', background: 'var(--surface2)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
                      <span style={{ fontSize: '18px' }}>{r.icon}</span>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)', flex: 1 }}>{r.t}</div>
                      <span className={`badge ${r.u === L('High', 'عالي') ? 'b-red' : r.u === L('Medium', 'متوسط') ? 'b-orange' : 'b-ai'}`}>
                        {r.u}
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--t2)' }}>{r.d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="card mb">
            <div className="sh"><div className="st">{L('Score History', 'تاريخ التقييم')}</div></div>
            <div className="bch" style={{ height: '90px', display: 'flex', alignItems: 'flex-end', gap: '16px', padding: '10px 0' }}>
              {[40, 42, 45, 48, 52, 58].map((h, idx) => (
                <div key={idx} style={{ flex: 1, background: 'var(--orange)', height: `${h}%`, borderRadius: '4px 4px 0 0', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '-20px', left: 0, right: 0, textAlign: 'center', fontSize: '10px' }}>{h}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
