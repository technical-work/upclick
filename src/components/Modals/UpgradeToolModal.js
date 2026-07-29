'use client';

import React from 'react';
import { useBusiness } from '@/context/BusinessContext';

export default function UpgradeToolModal({ toolInfo, targetPlans = [], onClose, onSelectPlan }) {
  const { lang, currencySymbol, L } = useBusiness();
  const isRTL = lang === 'ar';

  if (!toolInfo) return null;

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '20px',
        animation: 'fadeIn 0.25s ease'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--card-bg)',
          border: '1px solid var(--accent)',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(59, 130, 246, 0.2)',
          position: 'relative',
          animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            [isRTL ? 'left' : 'right']: '18px',
            background: 'var(--bg2)',
            border: '1px solid var(--line)',
            color: 'var(--text2)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          ✕
        </button>

        {/* Lock Icon & Tool Header */}
        <div style={{ textAlign: 'center', paddingTop: '8px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(239, 68, 68, 0.2) 100%)',
              border: '1px solid var(--orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '30px',
              margin: '0 auto 14px'
            }}
          >
            🔒
          </div>

          <span
            style={{
              fontSize: '11px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--orange)',
              background: 'rgba(249, 115, 22, 0.12)',
              padding: '4px 12px',
              borderRadius: '12px',
              border: '1px solid rgba(249, 115, 22, 0.3)'
            }}
          >
            {isRTL ? 'أداة احترافية مغلقة' : 'Premium Tool Locked'}
          </span>

          <h2 style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text)', margin: '10px 0 6px' }}>
            {isRTL ? toolInfo.labelAr : toolInfo.labelEn}
          </h2>

          <p style={{ fontSize: '13px', color: 'var(--text2)', margin: 0, lineHeight: '1.6' }}>
            {isRTL
              ? 'هذه الأداة غير مفعلة في باقتك الحالية. قم بالترقية للوصول الكامل وفتح جميع الإمكانيات!'
              : 'This tool is not included in your current plan. Upgrade your plan to unlock full access!'}
          </p>
        </div>

        {/* Available Plans List */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>⚡</span>
            <span>{isRTL ? 'الباقات التي تتضمن هذه الأداة:' : 'Plans including this tool:'}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {targetPlans.length > 0 ? (
              targetPlans.map((plan, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg2)',
                    border: '1px solid var(--line)',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text)' }}>
                      {plan.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--orange)', fontWeight: 'bold', marginTop: '2px' }}>
                      {plan.price} {plan.currency || 'ج.م'} <span style={{ color: 'var(--text3)', fontWeight: 'normal', fontSize: '11px' }}>/ {plan.credits} كريديت</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSelectPlan(plan);
                    }}
                    className="btn btn-prime"
                    style={{
                      padding: '8px 16px',
                      fontSize: '12px',
                      borderRadius: '8px',
                      fontWeight: 'bold'
                    }}
                  >
                    {isRTL ? 'ترقية الآن' : 'Upgrade Now'}
                  </button>
                </div>
              ))
            ) : (
              <div
                style={{
                  background: 'var(--bg2)',
                  border: '1px solid var(--line)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text)' }}>
                    {isRTL ? 'باقة المحترفين (Pro Plan)' : 'Pro Plan'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--orange)', fontWeight: 'bold', marginTop: '2px' }}>
                    799 ج.م <span style={{ color: 'var(--text3)', fontWeight: 'normal', fontSize: '11px' }}>/ 10,000 كريديت</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSelectPlan({ name: 'Pro Plan', price: 799, credits: 10000 });
                  }}
                  className="btn btn-prime"
                  style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    borderRadius: '8px',
                    fontWeight: 'bold'
                  }}
                >
                  {isRTL ? 'ترقية الآن' : 'Upgrade Now'}
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '12px',
            background: 'var(--bg2)',
            border: '1px solid var(--line)',
            color: 'var(--text2)',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg4)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg2)'; }}
        >
          {isRTL ? 'إلغاء والعودة' : 'Cancel & Close'}
        </button>
      </div>
    </div>
  );
}
