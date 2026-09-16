'use client';

import React, { useMemo, useState } from 'react';
import { Minus, Plus, Search, Trash2, X } from 'lucide-react';
import { cartSubtotal } from '@/lib/sites/storeCart';
import { formatStoreMoney, productsToGridItems, useStorePreview } from './StorePreviewContext';

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  fontSize: '14px',
  boxSizing: 'border-box'
};

export function StoreFilterBar({ el }) {
  const storePreview = useStorePreview();
  const query = storePreview?.catalogQuery || '';
  const products = productsToGridItems(storePreview?.store?.products || el.items || []);
  const visible = products.filter((p) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (p.title || '').toLowerCase().includes(q) || (p.name || '').toLowerCase().includes(q);
  });

  return (
    <div style={{ width: '100%', margin: '16px 0 20px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto 20px', position: 'relative' }}>
        <input
          type="text"
          placeholder="Search products"
          value={query}
          onChange={(e) => storePreview?.setCatalogQuery?.(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 42px 10px 14px',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '13.5px',
            background: '#ffffff',
            boxSizing: 'border-box',
            outline: 'none'
          }}
        />
        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
          {query ? <X size={15} style={{ cursor: 'pointer' }} onClick={() => storePreview?.setCatalogQuery?.('')} /> : null}
          <Search size={16} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
        {visible.length} products
      </div>
    </div>
  );
}

export function StoreCartPanel() {
  const storePreview = useStorePreview();
  const items = storePreview?.cart || [];
  const currency = storePreview?.store?.settings?.currency || 'USD';
  const shippingFee = Number(storePreview?.store?.settings?.shippingFee) || 0;
  const freeOver = Number(storePreview?.store?.settings?.freeShippingOver) || 0;
  const subtotal = cartSubtotal(items);
  const shipping = freeOver && subtotal >= freeOver ? 0 : shippingFee;
  const total = subtotal + shipping;

  if (!items.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 40, textAlign: 'center', maxWidth: 800 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800 }}>Your cart is empty</h3>
        <p style={{ color: '#64748b', margin: '0 0 16px' }}>Add products from the catalog to place an order.</p>
        <button
          type="button"
          onClick={() => storePreview?.navigateTo?.('/products')}
          style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, cursor: 'pointer' }}
        >
          Continue shopping
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 28, margin: '16px 0', maxWidth: 800 }}>
      <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 20px' }}>Your Shopping Cart</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 20 }}>
        {items.map((item) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              {item.image ? <img src={item.image} alt={item.name} style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }} /> : null}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{formatStoreMoney(item.price, currency)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button type="button" onClick={() => storePreview?.setItemQty?.(item.id, item.qty - 1)} style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 6, width: 28, height: 28, cursor: 'pointer' }}><Minus size={12} /></button>
              <span style={{ fontWeight: 800, minWidth: 16, textAlign: 'center' }}>{item.qty}</span>
              <button type="button" onClick={() => storePreview?.setItemQty?.(item.id, item.qty + 1)} style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 6, width: 28, height: 28, cursor: 'pointer' }}><Plus size={12} /></button>
              <span style={{ fontWeight: 800, minWidth: 70, textAlign: 'right' }}>{formatStoreMoney(item.price * item.qty, currency)}</span>
              <button type="button" onClick={() => storePreview?.setItemQty?.(item.id, 0)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, color: '#475569' }}>
        <span>Shipping</span>
        <span>{shipping === 0 ? 'Free' : formatStoreMoney(shipping, currency)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
        <span style={{ fontSize: 16, fontWeight: 800 }}>Total</span>
        <span style={{ fontSize: 20, fontWeight: 900, color: '#16a34a' }}>{formatStoreMoney(total, currency)}</span>
      </div>
      <button
        type="button"
        onClick={() => storePreview?.navigateTo?.('/checkout')}
        style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: 14, borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: 'pointer', marginTop: 16 }}
      >
        Proceed to Checkout
      </button>
    </div>
  );
}

export function StoreCheckoutForm({ el }) {
  const storePreview = useStorePreview();
  const items = storePreview?.cart || [];
  const settings = storePreview?.store?.settings || {};
  const currency = settings.currency || 'USD';
  const subtotal = cartSubtotal(items);
  const shipping = settings.freeShippingOver && subtotal >= Number(settings.freeShippingOver) ? 0 : Number(settings.shippingFee) || 0;
  const tax = subtotal * ((Number(settings.taxRate) || 0) / 100);
  const bump = el?.bumpPrice ? Number(el.bumpPrice) : 0;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(settings.allowCashOnDelivery === false ? 'card' : 'cod');
  const [bumpOn, setBumpOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const total = subtotal + shipping + tax + (bumpOn ? bump : 0);

  const canCod = settings.allowCashOnDelivery !== false;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!items.length) {
      setError('Your cart is empty.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/stores/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: storePreview?.store?.id,
          firstName,
          lastName,
          email,
          phone,
          address,
          paymentMethod,
          items: bumpOn && bump
            ? [...items, { id: 'bump_warranty', name: el?.bumpOfferTitle || 'Extended warranty', price: bump, qty: 1 }]
            : items
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not place order');
      storePreview?.clearCart?.();
      storePreview?.navigateTo?.('/thank-you');
    } catch (err) {
      setError(err.message || 'Could not place order');
    } finally {
      setBusy(false);
    }
  };

  if (!items.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 32, maxWidth: 800 }}>
        <h3 style={{ margin: '0 0 8px' }}>Checkout</h3>
        <p style={{ color: '#64748b' }}>Add products to your cart before checking out.</p>
        <button type="button" onClick={() => storePreview?.navigateTo?.('/products')} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, cursor: 'pointer' }}>
          Browse products
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 32, margin: '16px 0', maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{el?.title || 'Checkout'}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" style={inputStyle} />
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" style={inputStyle} />
      </div>
      <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" style={inputStyle} />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone / WhatsApp" style={inputStyle} />
      <input required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Shipping address" style={inputStyle} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {canCod ? (
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 700, fontSize: 13 }}>
            <input type="radio" name="pay" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
            Cash on delivery
          </label>
        ) : null}
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 700, fontSize: 13 }}>
          <input type="radio" name="pay" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
          Card / PayPal (marked pending until paid)
        </label>
      </div>

      {el?.bumpOfferTitle ? (
        <label style={{ background: '#f8fafc', border: '1px dashed #2563eb', padding: 14, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 700 }}>
          <input type="checkbox" checked={bumpOn} onChange={(e) => setBumpOn(e.target.checked)} />
          {el.bumpOfferTitle}
        </label>
      ) : null}

      <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14, fontSize: 13 }}>
        {items.map((item) => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span>{item.name} × {item.qty}</span>
            <span>{formatStoreMoney(item.price * item.qty, currency)}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontWeight: 800 }}>
          <span>Total</span>
          <span>{formatStoreMoney(total, currency)}</span>
        </div>
      </div>

      {error ? <div style={{ color: '#dc2626', fontSize: 13, fontWeight: 700 }}>{error}</div> : null}

      <button
        type="submit"
        disabled={busy}
        style={{ width: '100%', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', padding: 14, borderRadius: 10, fontWeight: 800, fontSize: 16, cursor: busy ? 'wait' : 'pointer' }}
      >
        {busy ? 'Placing order...' : `Place order · ${formatStoreMoney(total, currency)}`}
      </button>
    </form>
  );
}

export function useVisibleCatalog(elItems) {
  const storePreview = useStorePreview();
  const query = (storePreview?.catalogQuery || '').toLowerCase();
  const items = useMemo(() => {
    const source = (storePreview?.store?.products?.length
      ? productsToGridItems(storePreview.store.products)
      : (elItems || []));
    if (!query) return source;
    return source.filter((p) => `${p.title || ''} ${p.name || ''}`.toLowerCase().includes(query));
  }, [storePreview?.store?.products, elItems, query]);
  return items;
}
