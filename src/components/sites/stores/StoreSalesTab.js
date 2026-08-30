'use client';

import React, { useEffect, useState } from 'react';
import { 
  Download, 
  Search, 
  Info, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ExternalLink,
  Eye,
  DollarSign
} from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function StoreSalesTab({ store, isRtl }) {
  const [startDate, setStartDate] = useState('2026-07-29');
  const [endDate, setEndDate] = useState('2026-08-29');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [remoteSales, setRemoteSales] = useState([]);

  useEffect(() => {
    if (!store?.id) return undefined;
    const q = query(collection(db, 'store_orders'), where('storeId', '==', store.id));
    const unsub = onSnapshot(q, (snap) => {
      setRemoteSales(snap.docs.map((d) => d.data()));
    }, () => setRemoteSales([]));
    return () => unsub();
  }, [store?.id]);

  const salesMap = new Map();
  [...remoteSales, ...(store.sales || [])].forEach((item) => {
    if (item?.id) salesMap.set(item.id, item);
    else if (item?.transactionId) salesMap.set(item.transactionId, item);
  });
  const sales = Array.from(salesMap.values());

  const filteredSales = sales.filter(s => {
    const cust = (s.customer || '').toLowerCase();
    const custAr = (s.customerAr || '').toLowerCase();
    const email = (s.email || '').toLowerCase();
    const tx = (s.transactionId || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return cust.includes(q) || custAr.includes(q) || email.includes(q) || tx.includes(q);
  });

  const handleExportCSV = () => {
    const headers = ['Customer', 'Email', 'Product Name', 'Transaction ID', 'Amount', 'Step', 'Purchase Date', 'Status'];
    const rows = filteredSales.map(s => [
      s.customer,
      s.email,
      s.productName,
      s.transactionId,
      s.amount,
      s.step,
      s.purchaseDate,
      s.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `store_sales_${store.name || 'store'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ animation: 'fadeIn 0.25s ease' }}>
      {/* Blue Alert Banner matching Screenshot 5 */}
      <div style={{
        background: 'rgba(37, 99, 235, 0.08)',
        border: '1px solid rgba(37, 99, 235, 0.25)',
        borderRadius: '10px',
        padding: '14px 18px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: '#2563eb',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontWeight: 'bold',
          fontSize: '12px'
        }}>
          i
        </div>
        <div style={{ fontSize: '13px', color: '#1e40af', lineHeight: 1.5 }}>
          {isRtl
            ? 'جميع الطلبات والمبيعات على الإصدار 2 من هذا المتجر متاحة في تبويب المدفوعات -> الطلبات والمعاملات. تعرض هذه الصفحة بيانات المبيعات من الإصدار 1 لهذا المتجر.'
            : 'All orders/sales on version 2 of this store are available in Payments -> Orders and Transactions tabs. This page gives sales data from Version 1 of this store.'
          }
        </div>
      </div>

      {/* Date Filter & Export Row matching Screenshot 5 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
          <Search size={15} style={{ position: 'absolute', [isRtl ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--t2)' }} />
          <input
            type="text"
            className="inp"
            placeholder={isRtl ? 'بحث باسم العميل أو الإيميل...' : 'Search customer or email...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              [isRtl ? 'paddingRight' : 'paddingLeft']: '36px',
              width: '100%',
              fontSize: '13px',
              height: '38px'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="date"
              className="inp"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ fontSize: '12.5px', padding: '6px 10px', height: '38px' }}
            />
            <span style={{ color: 'var(--t2)' }}>-</span>
            <input
              type="date"
              className="inp"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ fontSize: '12.5px', padding: '6px 10px', height: '38px' }}
            />
          </div>

          <button
            onClick={handleExportCSV}
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--edge)',
              color: 'var(--t1)',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '38px'
            }}
          >
            <Download size={15} />
            <span>{isRtl ? 'تصدير CSV' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* Sales Transactions Table matching Screenshot 5 */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--edge)',
        borderRadius: '12px',
        overflowX: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left', minWidth: '850px' }}>
          <thead>
            <tr style={{
              background: 'var(--surface2)',
              borderBottom: '1px solid var(--edge)',
              fontSize: '12px',
              fontWeight: '700',
              color: 'var(--t2)',
              textTransform: 'uppercase'
            }}>
              <th style={{ padding: '14px 20px' }}>{isRtl ? 'العميل' : 'Customer'}</th>
              <th style={{ padding: '14px 20px' }}>{isRtl ? 'البريد الإلكتروني' : 'Email'}</th>
              <th style={{ padding: '14px 20px' }}>{isRtl ? 'اسم المنتج' : 'Product name'}</th>
              <th style={{ padding: '14px 20px' }}>{isRtl ? 'رقم المعاملة' : 'Transaction Id'}</th>
              <th style={{ padding: '14px 20px' }}>{isRtl ? 'المبلغ' : 'Amount'}</th>
              <th style={{ padding: '14px 20px' }}>{isRtl ? 'الخطوة / الصفحة' : 'Step'}</th>
              <th style={{ padding: '14px 20px' }}>{isRtl ? 'تاريخ الشراء' : 'Purchase Date'}</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--t2)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t3)' }}>
                      <Info size={20} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{isRtl ? 'لا توجد مبيعات في هذه الفترة' : 'No data'}</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr
                  key={sale.id}
                  style={{
                    borderBottom: '1px solid var(--edge)',
                    fontSize: '13px',
                    transition: 'background 0.15s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedOrder(sale)}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 20px', fontWeight: '700', color: 'var(--t1)' }}>
                    {isRtl ? (sale.customerAr || sale.customer) : sale.customer}
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--t2)' }}>
                    {sale.email}
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: '600', color: 'var(--t1)' }}>
                    {isRtl ? (sale.productNameAr || sale.productName) : sale.productName}
                  </td>
                  <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--t3)' }}>
                    {sale.transactionId}
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: '800', color: '#16a34a' }}>
                    {sale.amount}
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--t2)' }}>
                    {isRtl ? (sale.stepAr || sale.step) : sale.step}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--t2)' }}>
                    {sale.purchaseDate}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
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
            maxWidth: '520px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--edge)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: 'var(--t1)' }}>
                {isRtl ? 'تفاصيل الطلب' : 'Order Details'}
              </h3>
              <span style={{
                background: 'rgba(22, 163, 74, 0.12)',
                color: '#16a34a',
                fontSize: '11.5px',
                fontWeight: '700',
                padding: '3px 8px',
                borderRadius: '6px'
              }}>
                {selectedOrder.status}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--t2)' }}>{isRtl ? 'العميل' : 'Customer'}:</span>
                <span style={{ fontWeight: '700', color: 'var(--t1)' }}>{selectedOrder.customer}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--t2)' }}>{isRtl ? 'البريد' : 'Email'}:</span>
                <span style={{ fontWeight: '600', color: 'var(--t1)' }}>{selectedOrder.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--t2)' }}>{isRtl ? 'المنتج' : 'Product'}:</span>
                <span style={{ fontWeight: '700', color: '#2563eb' }}>{selectedOrder.productName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--t2)' }}>{isRtl ? 'المبلغ المدفوع' : 'Total Amount'}:</span>
                <span style={{ fontWeight: '800', color: '#16a34a', fontSize: '16px' }}>{selectedOrder.amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--t2)' }}>{isRtl ? 'رقم العملية' : 'Transaction ID'}:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{selectedOrder.transactionId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--t2)' }}>{isRtl ? 'تاريخ العملية' : 'Date'}:</span>
                <span>{selectedOrder.purchaseDate}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--edge)',
                  color: 'var(--t1)',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                {isRtl ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
