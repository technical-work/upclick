'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { callClaudeAPI } from '../../utils/ai';

export default function DigitalProductDetailModal() {
  const {
    lang,
    L,
    t,
    dpDetailOpen,
    setDpDetailOpen,
    dpDetailIndex: product,
    GC,
    saveGC,
    confirmAction,
    promptAction
  } = useBusiness();

  const [isTailoring, setIsTailoring] = useState(false);
  const [tailoredResult, setTailoredResult] = useState(null);
  const [error, setError] = useState(null);

  // Reset modal state on product change or open
  useEffect(() => {
    if (dpDetailOpen) {
      setTailoredResult(null);
      setIsTailoring(false);
      setError(null);
    }
  }, [dpDetailOpen, product]);

  if (!dpDetailOpen || !product) return null;

  const priceStr = typeof product.price === 'number' ? `$${product.price}` : product.price;
  const sales = product.monthly_sales || 0;
  const priceVal = typeof product.price === 'number' ? product.price : parseFloat(product.price?.replace('$', '')) || 0;
  const estRev = sales * priceVal;

  const opp = product.opp || product.why_trending || L(
    'Your audience is already asking you about this. The demand is proven — you just need to package your knowledge.',
    'جمهورك يسألك عن هذا بالفعل. الطلب مثبت — فقط تحتاج لتعبئة معرفتك.'
  );

  const challenges = product.challenges || L(
    'Key challenges:\n• Creating the initial content (3–10 hours)\n• Marketing consistently (most creators stop too soon)\n• Pricing confidence (charge what it\'s worth!)',
    'التحديات الرئيسية:\n• إنشاء المحتوى الأولي (٣–١٠ ساعات)\n• التسويق بشكل مستمر (معظم المنشئين يتوقفون مبكراً)\n• ثقة التسعير (اشحن ما تستحق!)'
  );

  const revenueNote = product.revenue || L(
    `Revenue estimate: $${estRev.toLocaleString()}/mo based on typical sales benchmarks.`,
    `تقدير الإيرادات: $${estRev.toLocaleString()}/شهرياً بناءً على مؤشرات المبيعات النموذجية.`
  );

  const handleTailorProduct = async () => {
    setIsTailoring(true);
    setTailoredResult(null);
    setError(null);

    const niche = GC.profile?.niche || 'Fashion & Beauty';
    const audience = GC.profile?.offer?.market || L('General', 'العام');
    const followers = GC.creator?.followers || '284K';
    const stage = GC.profile?.stage || 'Getting started';

    const promptText = `We want to customize this trending digital product:
Title: ${product.title || product.name}
Type: ${product.type || product.ty}
Description: ${product.description || product.desc}

Specifically adapt it for my business:
My Niche: ${niche}
My Target Audience: ${audience}
My Followers: ${followers}
My Stage: ${stage}

Generate a tailored replica that I can sell. Return a valid JSON object ONLY, with these keys:
{
  "title": "Arabic title of the adapted product",
  "type": "Arabic type of the adapted product (e.g. Notion Template, PDF)",
  "desc": "Arabic short description (one line)",
  "price": 29 (suggested price as a number based on my audience and niche),
  "opp": "Arabic explanation of why this fits my audience and connected social profiles perfectly",
  "create": "Arabic step-by-step creation blueprint specifically tailored for my niche",
  "sell": "Arabic marketing and social media promotion strategy customized for my follower tier"
}`;

    const systemText = `You are a digital product marketing expert. Respond ONLY with a valid JSON object. No markdown tags, no backticks, no comments, no explanation.`;

    try {
      const rawText = await callClaudeAPI(promptText, systemText, lang, GC);
      let cleaned = (rawText || '{}').replace(/```json/g, '').replace(/```/g, '').trim();
      if (cleaned.indexOf('{') > -1) {
        cleaned = cleaned.slice(cleaned.indexOf('{'), cleaned.lastIndexOf('}') + 1);
      }
      const parsed = JSON.parse(cleaned);
      if (!parsed.title) {
        throw new Error('Invalid JSON format returned');
      }
      setTailoredResult(parsed);
    } catch (err) {
      console.error(err);
      setError(L('Failed to tailor product idea. Using default adaptation.', 'فشل تخصيص فكرة المنتج. سيتم استخدام النسخة الافتراضية.'));
      setTailoredResult({
        title: lang === 'ar' ? `نسخة مخصصة: ${product.title || product.name}` : `Custom Edition: ${product.title || product.name}`,
        type: product.type || product.ty || 'PDF Guide',
        desc: product.description || product.desc,
        price: priceVal || 19,
        opp: lang === 'ar' 
          ? `هذا المنتج ممتاز لجمهورك في مجال ${niche} ويستغل قاعدة متابعيك البالغة ${followers}.` 
          : `This product fits your ${niche} audience and leverages your ${followers} followers.`,
        create: lang === 'ar' 
          ? `١. خصص الفكرة لتناسب عملاء ${niche}.\n٢. صمم المادة في Canva.\n٣. صدّر كملف جاهز.`
          : `1. Customize the content for ${niche}.\n2. Design in Canva.\n3. Export file.`,
        sell: lang === 'ar'
          ? `شارك الرابط في البيو الخاص بك واصنع ٣ ريلز ترويجية لترويجه لجمهورك.`
          : `Put the link in your bio and create 3 promotional Reels.`
      });
    } finally {
      setIsTailoring(false);
    }
  };

  const handleLaunchTailored = () => {
    if (!tailoredResult) return;
    const newProduct = {
      id: Date.now(),
      name: tailoredResult.title,
      type: tailoredResult.type,
      price: tailoredResult.price,
      sales: 0,
      revenue: 0,
      status: 'draft',
      created: new Date().toISOString()
    };
    const updated = [...(GC.digitalProducts?.products || []), newProduct];
    saveGC({
      ...GC,
      digitalProducts: {
        ...(GC.digitalProducts || {}),
        products: updated
      }
    });
    alert(L('Product created and saved as a Draft! 🚀 Go to "My Products" to customize or edit.', 'تم إنشاء وحفظ المنتج كمسودة! 🚀 انتقل لتبويب "منتجاتي" للتعديل أو النشر.'));
    setDpDetailOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setDpDetailOpen(false)}>
      <div className="modal-box card" style={{ maxWidth: '600px', width: '90%', maxHeight: '92vh', overflowY: 'auto', background: 'var(--surface1)', border: '1px solid var(--edge)', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-close" onClick={() => setDpDetailOpen(false)}>
          ✕
        </div>
        <div style={{ padding: '24px' }}>
          
          {/* Main Spy / Detail View */}
          {!tailoredResult && !isTailoring && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>{product.emoji || '📦'}</div>
                <div style={{ fontFamily: 'var(--ff)', fontSize: '20px', fontWeight: 800, color: 'var(--t1)', marginBottom: '5px' }}>
                  {product.title || product.name || product.n}
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <span className="badge bdp">{product.type || product.ty || L('Template', 'قالب')}</span>
                  <span style={{ fontFamily: 'var(--fn)', fontSize: '16px', fontWeight: 800, color: 'var(--a)' }}>
                    {priceStr}
                  </span>
                </div>
              </div>

              <div style={{ background: 'var(--green-d)', border: '1px solid rgba(30,201,142,.2)', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--green)', marginBottom: '5px' }}>
                  🌟 {L('The Opportunity', 'الفرصة')}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--t1)', lineHeight: 1.6 }}>{opp}</div>
              </div>

              <div style={{ background: 'var(--red-d)', border: '1px solid rgba(240,98,58,.2)', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--red)', marginBottom: '5px' }}>
                  ⚠️ {L('Challenges', 'التحديات')}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--t1)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{challenges}</div>
              </div>

              <div style={{ background: 'var(--amber-d)', border: '1px solid rgba(245,200,66,.2)', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--go)', marginBottom: '5px' }}>
                  💰 {L('Expected Revenue', 'الإيرادات المتوقعة')}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--t1)' }}>{revenueNote}</div>
              </div>

              {product.create && (
                <div style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--t1)', marginBottom: '8px' }}>
                    🛠️ {L('How to Create & Prepare', 'كيف تنشئ وتحضر')}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--t2)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                    {product.create}
                  </div>
                </div>
              )}

              {product.sell && (
                <div style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--t1)', marginBottom: '8px' }}>
                    🚀 {L('How to Sell It', 'كيف تبيع')}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--t2)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                    {product.sell}
                  </div>
                </div>
              )}

              {product.ai_tools && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t1)', marginBottom: '6px' }}>
                    🤖 {L('AI Tools to Build It', 'أدوات ذكاء اصطناعي لإنشائه')}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {product.ai_tools.map((t, idx) => (
                      <span className="badge b-ai" key={idx}>{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {product.sell_on && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t1)', marginBottom: '6px' }}>
                    🛒 {L('Where to Sell', 'أين تبيعه')}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {product.sell_on.map((platformName, idx) => (
                      <span className="badge" style={{ background: 'var(--surface3)', color: 'var(--t2)' }} key={idx}>
                        {platformName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button 
                  className="btn" 
                  style={{ flex: 1, justifyContent: 'center' }} 
                  onClick={() => setDpDetailOpen(false)}
                >
                  {L('Close', 'إغلاق')}
                </button>
                <button 
                  className="btn btn-prime" 
                  style={{ flex: 2, justifyContent: 'center', background: 'linear-gradient(135deg, var(--orange), var(--purple))' }} 
                  onClick={handleTailorProduct}
                >
                  ⚡ {L('Steal & Tailor to My Business', 'سرقة الفكرة وتخصيصها للبزنس')}
                </button>
              </div>
            </>
          )}

          {/* AI Tailoring Loading View */}
          {isTailoring && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: '48px', animation: 'spin 1.5s linear infinite', display: 'inline-block', marginBottom: '16px' }}>🧠</div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--t1)' }}>
                {L('Tailoring Product to Your Niche...', 'جاري تخصيص المنتج ليناسب مجالك وعملائك...')}
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--t2)', marginTop: '6px' }}>
                {L(`Customizing based on niche: "${GC.profile?.niche || 'Fashion'}", audience & Connected profiles.`, `جاري التعديل والتخصيص لنيش: "${GC.profile?.niche || 'الموضة والجمال'}" وقاعدة المتابعين.`)}
              </p>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Tailored Customization Result View */}
          {tailoredResult && !isTailoring && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '32px' }}>✨</span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--orange)', marginTop: '4px' }}>
                  {L('Adapted Niche Blueprint', 'المخطط المخصص لمجالك')}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--t2)' }}>
                  {L('AI successfully tailored this trend to your target audience & niche profile!', 'قام الذكاء الاصطناعي بتخصيص هذا التريند لجمهورك ومجالك التجاري!')}
                </p>
              </div>

              <div style={{ background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--t1)' }}>
                    {tailoredResult.title}
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--green)', fontFamily: 'var(--fn)' }}>
                    ${tailoredResult.price}
                  </span>
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--t2)', marginBottom: '8px' }}>
                  <strong>{L('Category/Type:', 'النوع:')}</strong> {tailoredResult.type}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--t1)', fontStyle: 'italic', marginBottom: '14px' }}>
                  "{tailoredResult.desc}"
                </div>

                <div style={{ borderTop: '1px solid var(--edge)', paddingTop: '12px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--orange)', marginBottom: '4px' }}>
                    🎯 {L('Niche Fit Strategy', 'استراتيجية التناسب')}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--t2)', lineHeight: 1.5 }}>
                    {tailoredResult.opp}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--edge)', paddingTop: '12px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--t1)', marginBottom: '6px' }}>
                    🛠️ {L('How to Create (Tailored)', 'خطوات التصنيع المقترحة')}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--t2)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {tailoredResult.create}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--edge)', paddingTop: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--t1)', marginBottom: '6px' }}>
                    📢 {L('Launch Strategy', 'استراتيجية الترويج الرقمي')}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--t2)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {tailoredResult.sell}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="btn" 
                  style={{ flex: 1, justifyContent: 'center' }} 
                  onClick={() => setTailoredResult(null)}
                >
                  {L('Back', 'رجوع')}
                </button>
                <button 
                  className="btn btn-prime" 
                  style={{ flex: 2, justifyContent: 'center', background: 'var(--green)', color: '#fff' }} 
                  onClick={handleLaunchTailored}
                >
                  ⚡ {L('Launch Draft in Shop', 'إطلاق كمسودة في متجري')}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
