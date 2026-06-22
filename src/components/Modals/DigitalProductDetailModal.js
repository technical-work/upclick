'use client';

import React from 'react';
import { useBusiness } from '../../context/BusinessContext';

export default function DigitalProductDetailModal() {
  const {
    lang,
    L,
    t,
    dpDetailOpen,
    setDpDetailOpen,
    dpDetailIndex: product // Assume we store the product object in dpDetailIndex state
  } = useBusiness();

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

  return (
    <div className="modal-overlay" onClick={() => setDpDetailOpen(false)}>
      <div className="modal-box" style={{ maxWidth: '560px', width: '90%', maxHeight: '92vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-close" onClick={() => setDpDetailOpen(false)}>
          ✕
        </div>
        <div style={{ padding: '22px' }}>
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

          <div className="ai" style={{ padding: '10px', borderRadius: '8px', background: 'var(--orange-dim)', border: '1px solid var(--orange-d)' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--a)', marginBottom: '5px' }}>
              💡 BOOM OS Tip
            </div>
            <div style={{ fontSize: '13px' }}>
              {L(
                'Use UpKlick AI Assistant to write promotional captions, and the Landing Page Generator to create a sales page in minutes!',
                'استخدم مساعد ذكاء UpKlick لكتابة كابشن ترويجي، ومولّد صفحة الهبوط لإنشاء صفحة مبيعات في دقائق!'
              )}
            </div>
          </div>

          <button className="btn btn-prime" style={{ width: '100%', justifyContent: 'center', marginTop: '14px' }} onClick={() => setDpDetailOpen(false)}>
            {L('Got it! ✅', 'فهمت! ✅')}
          </button>
        </div>
      </div>
    </div>
  );
}
