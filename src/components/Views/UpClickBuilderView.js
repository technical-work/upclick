'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';

export default function UpClickBuilderView() {
  const {
    lang,
    L,
    t,
    setAiPanelOpen,
    GC,
    saveGC,
    confirmAction
  } = useBusiness();

  const funnels = GC.upclickFunnels?.funnels || [];
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFunnelName, setNewFunnelName] = useState('');
  const [newFunnelType, setNewFunnelType] = useState('Lead Magnet');

  const saveFunnels = (updatedFunnels) => {
    saveGC({
      ...GC,
      upclickFunnels: {
        ...GC.upclickFunnels,
        funnels: updatedFunnels
      }
    });
  };

  const handleCreateFunnel = (e) => {
    e.preventDefault();
    if (!newFunnelName.trim()) {
      alert(L('Please enter a funnel name', 'الرجاء إدخال اسم الفانل'));
      return;
    }

    const newFunnel = {
      id: Date.now(),
      name: newFunnelName,
      type: newFunnelType,
      status: 'Active',
      clicks: 0,
      revenue: 0,
      convRate: '0%'
    };

    const updated = [newFunnel, ...funnels];
    saveFunnels(updated);
    setNewFunnelName('');
    setShowCreateModal(false);
    alert(L('Funnel created successfully! 🚀', 'تم إنشاء الفانل بنجاح! 🚀'));
  };

  const handleLoadTemplate = (templateKey) => {
    const templateData = {
      'lead-magnet': {
        name: L('Lead Magnet Funnel', 'فانل جذب العملاء'),
        type: 'Lead Magnet',
        conv: '12.4%'
      },
      'webinar': {
        name: L('Webinar Funnel', 'فانل الويبينار'),
        type: 'Webinar',
        conv: '8.2%'
      },
      'product': {
        name: L('Product Launch Funnel', 'فانل إطلاق منتج'),
        type: 'Product Launch',
        conv: '4.5%'
      },
      'consultation': {
        name: L('Consultation Funnel', 'فانل الاستشارة'),
        type: 'Consultation',
        conv: '15.1%'
      }
    };

    const selected = templateData[templateKey];
    if (!selected) return;

    // Check if already loaded to prevent duplicates
    if (funnels.some(f => f.type === selected.type)) {
      alert(L(`You already loaded the ${selected.name} template!`, `لقد قمت بتحميل قالب ${selected.name} بالفعل!`));
      return;
    }

    const newFunnel = {
      id: Date.now(),
      name: selected.name,
      type: selected.type,
      status: 'Active',
      clicks: Math.floor(Math.random() * 400) + 100,
      revenue: Math.floor(Math.random() * 2000) + 500,
      convRate: selected.conv
    };

    const updated = [newFunnel, ...funnels];
    saveFunnels(updated);
    alert(L(`${selected.name} template loaded! 🚀`, `تم تحميل قالب ${selected.name}! 🚀`));
  };

  const handleDeleteFunnel = (id) => {
    confirmAction(L('Are you sure you want to delete this funnel?', 'هل أنت متأكد من حذف هذا الفانل؟'), () => {
      const updated = funnels.filter(f => f.id !== id);
      saveFunnels(updated);
    });
  };

  const handleAIStrategy = () => {
    setAiPanelOpen(true);
    alert(L('Consulting AI about your sales funnel strategy in the AI Assistant...', 'جاري استشارة الذكاء الاصطناعي حول استراتيجية الفانل في المساعد الذكي...'));
  };

  // Stats
  const activeFunnelsCount = funnels.filter(f => f.status === 'Active').length;
  const totalClicks = funnels.reduce((sum, f) => sum + f.clicks, 0);
  const totalRevenue = funnels.reduce((sum, f) => sum + f.revenue, 0);
  const avgConvRate = funnels.length > 0 
    ? (funnels.reduce((sum, f) => sum + parseFloat(f.convRate), 0) / funnels.length).toFixed(1) + '%'
    : '0%';

  return (
    <div className="pg on" id="pg-upclick">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">⬆</span>
          <span>{L('UpClick Builder', 'منشئ UpClick')}</span>
        </div>
        <div className="pg-actions">
          <button className="btn-ai" onClick={handleAIStrategy}>
            ✦ {L('AI Strategy', 'استراتيجية الذكاء الاصطناعي')}
          </button>
          <button className="btn btn-prime" onClick={() => setShowCreateModal(true)}>
            + {L('New Funnel', 'فانل جديد')}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="g4 stagger mb">
        <div className="stat-card">
          <div className="stat-lbl">🔄 {L('Active Funnels', 'الفانلات النشطة')}</div>
          <div className="stat-val">{activeFunnelsCount}</div>
          <div className="stat-ch ch-nu">{L('running', 'قيد التشغيل')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">👆 {L('Total Clicks', 'إجمالي النقرات')}</div>
          <div className="stat-val">{totalClicks.toLocaleString()}</div>
          <div className="stat-ch ch-nu">{L('this month', 'هذا الشهر')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">💰 {L('Funnel Revenue', 'أرباح الفانلات')}</div>
          <div className="stat-val ch-up">${totalRevenue.toLocaleString()}</div>
          <div className="stat-ch ch-nu">{L('all time', 'طوال الوقت')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-lbl">📈 {L('Conv. Rate', 'معدل التحويل')}</div>
          <div className="stat-val">{avgConvRate}</div>
          <div className="stat-ch ch-nu">{L('average', 'المعدل المتوسط')}</div>
        </div>
      </div>

      {/* Templates Row */}
      <div className="card mb">
        <div className="sec-hd">
          <div className="sec-title">🚀 {L('Funnel Templates', 'قوالب الفانلات')}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
          <div 
            style={{ background: 'var(--surface2)', borderRadius: '12px', padding: '16px', border: '2px solid var(--edge)', cursor: 'pointer', transition: 'all .15s' }}
            onClick={() => handleLoadTemplate('lead-magnet')}
          >
            <div style={{ fontSize: '26px', marginBottom: '8px' }}>🧲</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--t1)', marginBottom: '4px' }}>
              {L('Lead Magnet Funnel', 'فانل جذب العملاء')}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--t2)', marginBottom: '8px' }}>
              {L('Free resource → Email capture → Offer', 'مصدر مجاني ← تسجيل الإيميل ← تقديم العرض')}
            </div>
            <span className="badge b-green">{L('Most Popular', 'الأكثر شعبية')}</span>
          </div>

          <div 
            style={{ background: 'var(--surface2)', borderRadius: '12px', padding: '16px', border: '2px solid var(--edge)', cursor: 'pointer', transition: 'all .15s' }}
            onClick={() => handleLoadTemplate('webinar')}
          >
            <div style={{ fontSize: '26px', marginBottom: '8px' }}>🎥</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--t1)', marginBottom: '4px' }}>
              {L('Webinar Funnel', 'فانل الويبينار')}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--t2)', marginBottom: '8px' }}>
              {L('Registration → Show → Pitch → Close', 'التسجيل ← حضور الويبينار ← العرض العالي ← الإغلاق')}
            </div>
            <span className="badge b-ai">{L('High Ticket', 'عالي القيمة')}</span>
          </div>

          <div 
            style={{ background: 'var(--surface2)', borderRadius: '12px', padding: '16px', border: '2px solid var(--edge)', cursor: 'pointer', transition: 'all .15s' }}
            onClick={() => handleLoadTemplate('product')}
          >
            <div style={{ fontSize: '26px', marginBottom: '8px' }}>📦</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--t1)', marginBottom: '4px' }}>
              {L('Product Launch', 'إطلاق منتج')}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--t2)', marginBottom: '8px' }}>
              {L('Waitlist → Launch → Upsell', 'قائمة الانتظار ← الإطلاق ← البيع الإضافي')}
            </div>
            <span className="badge" style={{ background: 'var(--surface3)', color: 'var(--t2)' }}>{L('E-commerce', 'التجارة الإلكترونية')}</span>
          </div>

          <div 
            style={{ background: 'var(--surface2)', borderRadius: '12px', padding: '16px', border: '2px solid var(--edge)', cursor: 'pointer', transition: 'all .15s' }}
            onClick={() => handleLoadTemplate('consultation')}
          >
            <div style={{ fontSize: '26px', marginBottom: '8px' }}>📞</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--t1)', marginBottom: '4px' }}>
              {L('Consultation Funnel', 'فانل الاستشارة')}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--t2)', marginBottom: '8px' }}>
              {L('VSL → Application → Call → Close', 'فيديو المبيعات ← تقديم طلب ← المكالمة ← الإغلاق')}
            </div>
            <span className="badge b-amber">{L('Coaching', 'التدريب الشخصي')}</span>
          </div>
        </div>
      </div>

      {/* Funnels List */}
      <div className="card">
        <div className="sec-hd">
          <div className="sec-title">📋 {L('My Funnels', 'فانلاتي')}</div>
        </div>

        {funnels.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px' }}>
            <div className="es-icon">⬆</div>
            <div className="es-title">{L('No funnels yet', 'لا توجد فانلات مبيعات بعد')}</div>
            <div className="es-sub">
              {L('Choose a template above or create a custom funnel to start converting visitors into customers', 'اختر أحد القوالب في الأعلى أو أنشئ فانل مخصص للبدء في تحويل زوار موقعك إلى عملاء')}
            </div>
            <button className="btn btn-prime" onClick={() => setShowCreateModal(true)}>
              + {L('Create First Funnel', 'إنشاء أول فانل')}
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--edge)', background: 'var(--surface2)' }}>
                  <th style={{ padding: '12px' }}>{L('Funnel Name', 'اسم الفانل')}</th>
                  <th style={{ padding: '12px' }}>{L('Type', 'النوع')}</th>
                  <th style={{ padding: '12px' }}>{L('Status', 'الحالة')}</th>
                  <th style={{ padding: '12px' }}>{L('Clicks', 'النقرات')}</th>
                  <th style={{ padding: '12px' }}>{L('Revenue', 'الإيرادات')}</th>
                  <th style={{ padding: '12px' }}>{L('Conv. Rate', 'معدل التحويل')}</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>{L('Actions', 'الإجراءات')}</th>
                </tr>
              </thead>
              <tbody>
                {funnels.map((funnel) => (
                  <tr key={funnel.id} style={{ borderBottom: '1px solid var(--edge)' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: 'var(--t1)' }}>{funnel.name}</td>
                    <td style={{ padding: '12px', color: 'var(--t2)' }}>{funnel.type}</td>
                    <td style={{ padding: '12px' }}>
                      <span className="badge b-green" style={{ fontSize: '11px' }}>{funnel.status}</span>
                    </td>
                    <td style={{ padding: '12px' }}>{funnel.clicks.toLocaleString()}</td>
                    <td style={{ padding: '12px', fontWeight: 700, color: 'var(--green)' }}>${funnel.revenue.toLocaleString()}</td>
                    <td style={{ padding: '12px', color: 'var(--a)', fontWeight: 600 }}>{funnel.convRate}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button 
                        className="btn btn-ghost" 
                        style={{ padding: '3px 8px', fontSize: '11px', color: 'var(--red)', borderColor: 'var(--red)' }}
                        onClick={() => handleDeleteFunnel(funnel.id)}
                      >
                        {L('Delete', 'حذف')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal overlay */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px', padding: '20px', border: '1px solid var(--edge2)', background: 'var(--surface3)' }}>
            <div className="sec-hd" style={{ marginBottom: '14px' }}>
              <div className="sec-title">✨ {L('Create Custom Funnel', 'إنشاء فانل مخصص')}</div>
              <button className="tb-icon" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateFunnel}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Funnel Name', 'اسم الفانل')}</label>
                  <input className="inp" placeholder="e.g. Black Friday Special" value={newFunnelName} onChange={(e) => setNewFunnelName(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Funnel Type', 'نوع الفانل')}</label>
                  <select className="inp" value={newFunnelType} onChange={(e) => setNewFunnelType(e.target.value)}>
                    <option>Lead Magnet</option>
                    <option>Webinar</option>
                    <option>Product Launch</option>
                    <option>Consultation</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>{L('Cancel', 'إلغاء')}</button>
                <button type="submit" className="btn btn-prime">{L('Create Funnel', 'إنشاء الفانل')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
