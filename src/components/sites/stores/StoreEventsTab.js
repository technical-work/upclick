'use client';

import React from 'react';
import { 
  Activity, 
  ShoppingBag, 
  DollarSign, 
  Edit3, 
  Globe, 
  ShieldCheck, 
  Tag, 
  User 
} from 'lucide-react';

export default function StoreEventsTab({ store, isRtl }) {
  const events = [
    {
      id: 'ev_1',
      type: 'order',
      icon: DollarSign,
      color: '#16a34a',
      title: isRtl ? 'طلب شراء جديد تم بنجاح' : 'New Order Completed',
      desc: isRtl ? 'طلب بقيمة $249.00 من العميل Omar Al-Mansouri (منتج: Modern Ergonomic Office Chair)' : 'Order #101 placed by Omar Al-Mansouri ($249.00)',
      time: 'Aug 29, 2026 05:42 AM'
    },
    {
      id: 'ev_2',
      type: 'product',
      icon: ShoppingBag,
      color: '#2563eb',
      title: isRtl ? 'تحديث بيانات المنتج' : 'Product Updated',
      desc: isRtl ? 'تم تحديث سعر ومخزون المنتج Minimalist Oak Coffee Table' : 'Updated price & inventory for Minimalist Oak Coffee Table',
      time: 'Aug 28, 2026 04:12 PM'
    },
    {
      id: 'ev_3',
      type: 'publish',
      icon: Globe,
      color: '#8b5cf6',
      title: isRtl ? 'نشر صفحة جديدة' : 'Page Published',
      desc: isRtl ? 'تم نشر صفحة قائمة المنتجات (Products List) على الإنتاج' : 'Published Products List page live on production',
      time: 'Aug 27, 2026 01:10 PM'
    },
    {
      id: 'ev_4',
      type: 'coupon',
      icon: Tag,
      color: '#f59e0b',
      title: isRtl ? 'استخدام كود خصم' : 'Promo Code Applied',
      desc: isRtl ? 'تم تطبيق كود الخصم SUMMER20 بنجاح في السلة' : 'Discount code SUMMER20 applied in Cart',
      time: 'Aug 26, 2026 09:20 AM'
    },
    {
      id: 'ev_5',
      type: 'security',
      icon: ShieldCheck,
      color: '#0284c7',
      title: isRtl ? 'تجديد شهادة SSL' : 'SSL Security Check Passed',
      desc: isRtl ? 'فحص الأمان وتشفير الدفع تم بنجاح بنسبة 100%' : 'All checkout endpoints passed PCI-DSS validation',
      time: 'Aug 25, 2026 12:00 AM'
    }
  ];

  return (
    <div style={{ animation: 'fadeIn 0.25s ease', maxWidth: '850px' }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--edge)',
        borderRadius: '14px',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Activity size={18} style={{ color: '#2563eb' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: 'var(--t1)' }}>
            {isRtl ? 'سجل نشاطات وأحداث المتجر (Audit Log)' : 'Store Activity & Events Log'}
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {events.map((ev) => {
            const IconComp = ev.icon;
            return (
              <div
                key={ev.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'var(--surface2)',
                  border: '1px solid var(--edge)'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: `${ev.color}15`,
                  color: ev.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <IconComp size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <span style={{ fontWeight: '700', fontSize: '13.5px', color: 'var(--t1)' }}>
                      {ev.title}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--t3)' }}>
                      {ev.time}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--t2)', lineHeight: 1.5 }}>
                    {ev.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
