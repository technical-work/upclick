'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  CreditCard, 
  Truck, 
  Percent, 
  Globe, 
  Mail, 
  Phone, 
  Save, 
  CheckCircle2,
  Lock,
  Code
} from 'lucide-react';
import DomainSettings from '../DomainSettings';

export default function StoreSettingsTab({
  store,
  isRtl,
  ownerUid,
  showToast,
  onSaveSettings
}) {
  const [storeName, setStoreName] = useState(store.name || '');
  const [currency, setCurrency] = useState(store.settings?.currency || 'USD');
  const [shippingFee, setShippingFee] = useState(String(store.settings?.shippingFee || '15'));
  const [freeShippingOver, setFreeShippingOver] = useState(String(store.settings?.freeShippingOver || '150'));
  const [allowCashOnDelivery, setAllowCashOnDelivery] = useState(store.settings?.allowCashOnDelivery !== false);
  const [stripeEnabled, setStripeEnabled] = useState(store.settings?.stripeEnabled !== false);
  const [paypalEnabled, setPaypalEnabled] = useState(store.settings?.paypalEnabled !== false);
  const [storeEmail, setStoreEmail] = useState(store.settings?.storeEmail || '');
  const [storePhone, setStorePhone] = useState(store.settings?.storePhone || '');
  const [taxRate, setTaxRate] = useState(String(store.settings?.taxRate || '5'));
  const [metaPixelId, setMetaPixelId] = useState(store.settings?.metaPixelId || '');
  const [tiktokPixelId, setTiktokPixelId] = useState(store.settings?.tiktokPixelId || '');

  const handleSave = (e) => {
    e.preventDefault();
    onSaveSettings({
      name: storeName.trim() || store.name,
      settings: {
        currency,
        shippingFee: parseFloat(shippingFee) || 0,
        freeShippingOver: parseFloat(freeShippingOver) || 0,
        allowCashOnDelivery,
        stripeEnabled,
        paypalEnabled,
        storeEmail: storeEmail.trim(),
        storePhone: storePhone.trim(),
        taxRate: parseFloat(taxRate) || 0,
        metaPixelId: metaPixelId.trim(),
        tiktokPixelId: tiktokPixelId.trim()
      }
    });
    if (showToast) showToast(isRtl ? 'تم حفظ إعدادات المتجر بنجاح' : 'Store settings saved successfully');
  };

  return (
    <div style={{ animation: 'fadeIn 0.25s ease', maxWidth: '850px' }}>
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* General Store Information */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '14px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 16px', color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={18} style={{ color: '#2563eb' }} />
            <span>{isRtl ? 'المعلومات العامة للمتجر' : 'General Store Information'}</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--t1)' }}>
                {isRtl ? 'اسم المتجر' : 'Store Name'}
              </label>
              <input
                type="text"
                className="inp"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                style={{ width: '100%' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--t1)' }}>
                  {isRtl ? 'بريد المتجر الرسمي' : 'Official Store Email'}
                </label>
                <input
                  type="email"
                  className="inp"
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                  placeholder="support@mystore.com"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--t1)' }}>
                  {isRtl ? 'رقم خدمة العملاء (واتساب)' : 'Customer Support WhatsApp/Phone'}
                </label>
                <input
                  type="text"
                  className="inp"
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  placeholder="+966 50 123 4567"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--t1)' }}>
                {isRtl ? 'العملة الأساسية' : 'Default Currency'}
              </label>
              <select
                className="inp"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="SAR">SAR (ر.س) - Saudi Riyal</option>
                <option value="AED">AED (د.إ) - UAE Dirham</option>
                <option value="EGP">EGP (ج.م) - Egyptian Pound</option>
                <option value="EUR">EUR (€) - Euro</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment Gateways */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '14px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 16px', color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} style={{ color: '#16a34a' }} />
            <span>{isRtl ? 'بوابات الدفع الإلكتروني' : 'Payment Gateways'}</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--surface2)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: '700', fontSize: '13.5px', color: 'var(--t1)' }}>Stripe (Cards, Apple Pay, Mada)</span>
              </div>
              <input
                type="checkbox"
                checked={stripeEnabled}
                onChange={(e) => setStripeEnabled(e.target.checked)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--surface2)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: '700', fontSize: '13.5px', color: 'var(--t1)' }}>PayPal Express Checkout</span>
              </div>
              <input
                type="checkbox"
                checked={paypalEnabled}
                onChange={(e) => setPaypalEnabled(e.target.checked)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--surface2)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: '700', fontSize: '13.5px', color: 'var(--t1)' }}>{isRtl ? 'الدفع عند الاستلام (Cash on Delivery)' : 'Cash on Delivery (COD)'}</span>
              </div>
              <input
                type="checkbox"
                checked={allowCashOnDelivery}
                onChange={(e) => setAllowCashOnDelivery(e.target.checked)}
              />
            </div>
          </div>
        </div>

        {/* Shipping & Delivery */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '14px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 16px', color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={18} style={{ color: '#f59e0b' }} />
            <span>{isRtl ? 'الشحن والتوصيل والضرائب' : 'Shipping, Delivery & Taxes'}</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--t1)' }}>
                {isRtl ? 'تكلفة الشحن الثابتة ($)' : 'Flat Shipping Fee ($)'}
              </label>
              <input
                type="number"
                className="inp"
                value={shippingFee}
                onChange={(e) => setShippingFee(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--t1)' }}>
                {isRtl ? 'شحن مجاني للطلبات فوق ($)' : 'Free Shipping Over ($)'}
              </label>
              <input
                type="number"
                className="inp"
                value={freeShippingOver}
                onChange={(e) => setFreeShippingOver(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--t1)' }}>
                {isRtl ? 'نسبة الضريبة (%)' : 'VAT / Tax Rate (%)'}
              </label>
              <input
                type="number"
                className="inp"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Tracking Pixels */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '14px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 16px', color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code size={18} style={{ color: '#8b5cf6' }} />
            <span>{isRtl ? 'بيكسلات التتبع (Tracking Pixels)' : 'E-Commerce Tracking Pixels'}</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--t1)' }}>
                Meta Pixel ID
              </label>
              <input
                type="text"
                className="inp"
                value={metaPixelId}
                onChange={(e) => setMetaPixelId(e.target.value)}
                placeholder="e.g. 1928374619283"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--t1)' }}>
                TikTok Pixel ID
              </label>
              <input
                type="text"
                className="inp"
                value={tiktokPixelId}
                onChange={(e) => setTiktokPixelId(e.target.value)}
                placeholder="e.g. C3N84910JS8"
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Custom Domain Settings */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: '14px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 16px', color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} style={{ color: '#0284c7' }} />
            <span>{isRtl ? 'الدومين المخصص للمتجر' : 'Store Custom Domain'}</span>
          </h3>

          <DomainSettings
            funnel={{ ...store, kind: 'store', steps: store.pages, pages: store.pages }}
            stepIdx={0}
            ownerUid={ownerUid}
            isRtl={isRtl}
            showToast={showToast}
            onSaveFunnel={(patch) => onSaveSettings(patch)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 28px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
            }}
          >
            <Save size={16} />
            <span>{isRtl ? 'حفظ إعدادات المتجر' : 'Save Store Settings'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
