'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  RotateCcw, 
  HelpCircle, 
  TrendingUp, 
  Eye, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  Mail,
  ArrowUpRight
} from 'lucide-react';

export default function StoreStatsTab({ store, isRtl }) {
  const [startDate, setStartDate] = useState('2026-07-29');
  const [endDate, setEndDate] = useState('2026-08-29');
  const [isStatsInfoOpen, setIsStatsInfoOpen] = useState(false);

  const pages = store.pages || [];

  const handleReset = () => {
    setStartDate('2026-07-29');
    setEndDate('2026-08-29');
  };

  // Compute aggregate totals
  const totalViews = pages.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalUniqueViews = pages.reduce((acc, p) => acc + (p.uniqueViews || 0), 0);
  const totalOptins = pages.reduce((acc, p) => acc + (p.optins || 0), 0);
  const totalOrders = pages.reduce((acc, p) => acc + (p.orders || 0), 0);
  const totalSalesAmount = pages.reduce((acc, p) => acc + (p.salesAmount || 0), 0);

  return (
    <div style={{ animation: 'fadeIn 0.25s ease' }}>
      {/* Top filter bar matching Screenshot 4 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '16px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setIsStatsInfoOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#2563eb',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            textDecoration: 'underline',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <HelpCircle size={14} />
          <span>{isRtl ? 'فهم الإحصائيات' : 'Understand stats'}</span>
        </button>

        {/* Date Inputs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="date"
              className="inp"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ fontSize: '13px', padding: '6px 10px', height: '36px' }}
            />
          </div>
          <span style={{ color: 'var(--t2)', fontSize: '13px' }}>-</span>
          <div style={{ position: 'relative' }}>
            <input
              type="date"
              className="inp"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ fontSize: '13px', padding: '6px 10px', height: '36px' }}
            />
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          style={{
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '7px 16px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RotateCcw size={14} />
          <span>{isRtl ? 'إعادة تعيين' : 'Reset'}</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--t2)', fontWeight: '700', marginBottom: '6px' }}>
            {isRtl ? 'إجمالي المشاهدات' : 'Total Page Views'}
          </div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--t1)' }}>
            {totalViews.toLocaleString()}
          </div>
          <div style={{ fontSize: '11.5px', color: '#16a34a', marginTop: '4px', fontWeight: '600' }}>
            {totalUniqueViews.toLocaleString()} {isRtl ? 'مشاهد فريد' : 'uniques'}
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--t2)', fontWeight: '700', marginBottom: '6px' }}>
            {isRtl ? 'إجمالي الطلبات' : 'Total Store Orders'}
          </div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#2563eb' }}>
            {totalOrders}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--t2)', marginTop: '4px' }}>
            {isRtl ? 'معدل تحويل' : 'Avg conversion'} {((totalOrders / (totalViews || 1)) * 100).toFixed(1)}%
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--t2)', fontWeight: '700', marginBottom: '6px' }}>
            {isRtl ? 'إجمالي الإيرادات' : 'Total Revenue'}
          </div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#16a34a' }}>
            ${totalSalesAmount.toLocaleString()}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--t2)', marginTop: '4px' }}>
            {isRtl ? 'متوسط السلة' : 'Avg Cart'} ${(totalSalesAmount / (totalOrders || 1)).toFixed(0)}
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: 'var(--t2)', fontWeight: '700', marginBottom: '6px' }}>
            {isRtl ? 'المهتمين / المشتركين' : 'Opt-ins & Leads'}
          </div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--t1)' }}>
            {totalOptins.toLocaleString()}
          </div>
          <div style={{ fontSize: '11.5px', color: '#2563eb', marginTop: '4px', fontWeight: '600' }}>
            {((totalOptins / (totalViews || 1)) * 100).toFixed(1)}% {isRtl ? 'معدل التسجيل' : 'opt-in rate'}
          </div>
        </div>
      </div>

      {/* Main Detailed Stats Table matching Screenshot 4 */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--edge)',
        borderRadius: '12px',
        overflowX: 'auto',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left', minWidth: '950px' }}>
          <thead>
            {/* Top Multi-column Header Row */}
            <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--edge)', fontSize: '12px', fontWeight: '800', color: 'var(--t2)' }}>
              <th style={{ padding: '14px 20px', borderRight: '1px solid var(--edge)', width: '220px' }}>
                {isRtl ? 'الصفحة' : 'Page'}
              </th>
              <th colSpan={2} style={{ padding: '12px 14px', textAlign: 'center', borderRight: '1px solid var(--edge)' }}>
                {isRtl ? 'مشاهدات الصفحة (Page Views)' : 'Page Views'}
              </th>
              <th colSpan={2} style={{ padding: '12px 14px', textAlign: 'center', borderRight: '1px solid var(--edge)' }}>
                {isRtl ? 'المشتركين (Opt-Ins)' : 'Opt-Ins'}
              </th>
              <th colSpan={5} style={{ padding: '12px 14px', textAlign: 'center', borderRight: '1px solid var(--edge)' }}>
                {isRtl ? 'المبيعات (Sales)' : 'Sales'}
              </th>
              <th colSpan={2} style={{ padding: '12px 14px', textAlign: 'center' }}>
                {isRtl ? 'الأرباح / المشاهدة' : 'Earnings/Page View'}
              </th>
            </tr>

            {/* Sub-headers Row matching Screenshot 4 */}
            <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--edge)', fontSize: '11.5px', fontWeight: '700', color: 'var(--t3)' }}>
              <th style={{ padding: '8px 20px', borderRight: '1px solid var(--edge)' }}></th>
              
              {/* Page views sub */}
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>{isRtl ? 'الكل' : 'All'}</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', borderRight: '1px solid var(--edge)' }}>{isRtl ? 'فريد' : 'Uniques'}</th>
              
              {/* Opt-ins sub */}
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>{isRtl ? 'الكل' : 'All'}</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', borderRight: '1px solid var(--edge)' }}>{isRtl ? 'النسبة' : 'Rate'}</th>
              
              {/* Sales sub */}
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>{isRtl ? 'الطلبات' : 'Orders'}</th>
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>{isRtl ? 'النسبة' : 'Rate'}</th>
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>{isRtl ? 'الكمية' : 'Quantity'}</th>
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>{isRtl ? 'المبلغ' : 'Amount'}</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', borderRight: '1px solid var(--edge)' }}>{isRtl ? 'متوسط السلة' : 'Avg. cart value'}</th>
              
              {/* Earnings per view sub */}
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>{isRtl ? 'الكل' : 'All'}</th>
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>{isRtl ? 'فريد' : 'Uniques'}</th>
            </tr>
          </thead>

          <tbody>
            {pages.map((page, idx) => {
              const displayName = isRtl ? (page.nameAr || page.name) : page.name;
              return (
                <tr
                  key={page.id || idx}
                  style={{
                    borderBottom: '1px solid var(--edge)',
                    fontSize: '13px',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Page Name */}
                  <td style={{ padding: '14px 20px', fontWeight: '700', color: 'var(--t1)', borderRight: '1px solid var(--edge)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={15} style={{ color: 'var(--t3)' }} />
                      <span>{displayName}</span>
                    </div>
                  </td>

                  {/* Views */}
                  <td style={{ padding: '14px 10px', textAlign: 'center', color: 'var(--t1)' }}>
                    {page.views ? page.views.toLocaleString() : '-'}
                  </td>
                  <td style={{ padding: '14px 10px', textAlign: 'center', color: 'var(--t2)', borderRight: '1px solid var(--edge)' }}>
                    {page.uniqueViews ? page.uniqueViews.toLocaleString() : '-'}
                  </td>

                  {/* Opt-ins */}
                  <td style={{ padding: '14px 10px', textAlign: 'center', color: 'var(--t1)' }}>
                    {page.optins ? page.optins.toLocaleString() : '-'}
                  </td>
                  <td style={{ padding: '14px 10px', textAlign: 'center', color: 'var(--t2)', borderRight: '1px solid var(--edge)' }}>
                    {page.optinRate || '-'}
                  </td>

                  {/* Sales */}
                  <td style={{ padding: '14px 10px', textAlign: 'center', fontWeight: '700', color: '#2563eb' }}>
                    {page.orders ? page.orders : '-'}
                  </td>
                  <td style={{ padding: '14px 10px', textAlign: 'center', color: 'var(--t2)' }}>
                    {page.salesRate || '-'}
                  </td>
                  <td style={{ padding: '14px 10px', textAlign: 'center', color: 'var(--t1)' }}>
                    {page.salesQty ? page.salesQty : '-'}
                  </td>
                  <td style={{ padding: '14px 10px', textAlign: 'center', fontWeight: '800', color: '#16a34a' }}>
                    {page.salesAmount ? `$${page.salesAmount.toLocaleString()}` : '-'}
                  </td>
                  <td style={{ padding: '14px 10px', textAlign: 'center', color: 'var(--t2)', borderRight: '1px solid var(--edge)' }}>
                    {page.avgCartValue ? `$${page.avgCartValue}` : '-'}
                  </td>

                  {/* Earnings per view */}
                  <td style={{ padding: '14px 10px', textAlign: 'center', color: 'var(--t1)' }}>
                    {page.earningsPerView ? `$${page.earningsPerView}` : '-'}
                  </td>
                  <td style={{ padding: '14px 10px', textAlign: 'center', color: 'var(--t2)' }}>
                    {page.uniqueEarningsPerView ? `$${page.uniqueEarningsPerView}` : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Understand Stats Explanation Modal */}
      {isStatsInfoOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--edge)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '560px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 14px', color: 'var(--t1)' }}>
              {isRtl ? 'دليل ومفاهيم إحصائيات المتجر' : 'Understanding Store Statistics'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--t2)', lineHeight: 1.6 }}>
              <div>
                <strong style={{ color: 'var(--t1)' }}>Page Views:</strong> Total number of visits vs unique individual IP visits.
              </div>
              <div>
                <strong style={{ color: 'var(--t1)' }}>Opt-Ins:</strong> Visitors who entered their email / phone number on that specific store page.
              </div>
              <div>
                <strong style={{ color: 'var(--t1)' }}>Sales & Orders:</strong> Successful checkouts attributed to traffic passing through this step.
              </div>
              <div>
                <strong style={{ color: 'var(--t1)' }}>Earnings / Page View:</strong> Total sales revenue generated divided by total visits (determines your highest-converting pages).
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setIsStatsInfoOpen(false)}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {isRtl ? 'فهمت ذلك' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
