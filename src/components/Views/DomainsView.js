'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Globe,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Server,
  Plus,
  Trash2
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';
import { useAuth } from '../../context/AuthContext';
import { authFetch } from '@/lib/domains/client';

function money(n, currency = 'USD') {
  const v = Number(n) || 0;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(v);
  } catch {
    return `$${v.toFixed(2)}`;
  }
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso).slice(0, 10);
  return d.toLocaleDateString();
}

const CONTACT_FIELDS = [
  ['firstName', 'First name'],
  ['lastName', 'Last name'],
  ['organization', 'Organization'],
  ['address1', 'Address'],
  ['city', 'City'],
  ['state', 'State / Province'],
  ['postalCode', 'Postal code'],
  ['country', 'Country (US, EG, SA…)'],
  ['phone', 'Phone'],
  ['email', 'Email']
];

export default function DomainsView() {
  const { currentPage, setCurrentPage, lang, showToast } = useBusiness();
  const { user } = useAuth();
  const isRtl = lang === 'ar';
  const page = currentPage || 'domains';

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [pricing, setPricing] = useState([]);
  const [domains, setDomains] = useState([]);
  const [orders, setOrders] = useState([]);
  const [contact, setContact] = useState({});
  const [busyId, setBusyId] = useState('');
  const [manage, setManage] = useState(null);
  const [dns, setDns] = useState([]);
  const [nsText, setNsText] = useState('');

  const L = (en, ar) => (isRtl ? ar : en);

  const loadMine = async () => {
    try {
      const [d, o] = await Promise.all([
        authFetch('/api/domains'),
        authFetch('/api/domains/orders')
      ]);
      setDomains(d.domains || []);
      setOrders(o.orders || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (page === 'domain-pricing') {
      authFetch('/api/domains/pricing').then((d) => setPricing(d.pricing || [])).catch((e) => setError(e.message));
    }
    if (page === 'my-domains') loadMine();
    if (page === 'domain-settings') {
      authFetch('/api/domains/contact').then((d) => setContact(d.contact || {})).catch((e) => setError(e.message));
    }
  }, [page, user]);

  const search = async (e) => {
    e?.preventDefault?.();
    setError('');
    setSearching(true);
    try {
      const data = await authFetch(`/api/domains/check?domain=${encodeURIComponent(query)}`);
      setResults(data.results || []);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const startRegister = async (row) => {
    setBusyId(row.domain);
    setError('');
    try {
      const created = await authFetch('/api/domains/orders', {
        method: 'POST',
        body: { domain: row.domain, type: 'registration' }
      });
      const checkout = await authFetch('/api/domains/checkout', {
        method: 'POST',
        body: { orderId: created.order.id }
      });
      if (checkout.url) {
        window.location.href = checkout.url;
        return;
      }
      throw new Error('Checkout URL missing');
    } catch (err) {
      setError(err.message);
      if (/Domain Settings|contact/i.test(err.message)) setCurrentPage('domain-settings');
    } finally {
      setBusyId('');
    }
  };

  const saveContact = async (e) => {
    e.preventDefault();
    setBusyId('contact');
    setError('');
    try {
      await authFetch('/api/domains/contact', { method: 'PUT', body: contact });
      if (showToast) showToast(L('Contact saved', 'تم حفظ بيانات التواصل'));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  };

  const openManage = async (row) => {
    setManage(row);
    setNsText((row.nameservers || []).join('\n'));
    setDns([]);
    try {
      const detail = await authFetch(`/api/domains/${row.id}`);
      setManage(detail.domain);
      setNsText((detail.domain.nameservers || []).join('\n'));
    } catch (err) {
      setError(err.message);
    }
  };

  const loadDns = async (id) => {
    const domainId = id || manage?.id;
    if (!domainId) return;
    setBusyId('dns');
    try {
      const data = await authFetch(`/api/domains/${domainId}/dns`);
      setDns(data.records?.length ? data.records : [{ name: '@', type: 'A', address: '', mxPref: '10', ttl: '1799' }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  };

  const saveNs = async () => {
    setBusyId('ns');
    try {
      const nameservers = nsText.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
      const data = await authFetch(`/api/domains/${manage.id}/nameservers`, { method: 'POST', body: { nameservers } });
      setManage((prev) => ({ ...prev, nameservers: data.nameservers }));
      if (showToast) showToast(L('Nameservers updated', 'تم تحديث خوادم الأسماء'));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  };

  const saveDns = async () => {
    setBusyId('dns-save');
    try {
      const data = await authFetch(`/api/domains/${manage.id}/dns`, { method: 'POST', body: { records: dns } });
      setDns(data.records || dns);
      if (showToast) showToast(L('DNS records saved', 'تم حفظ سجلات DNS'));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  };

  const toggleRenew = async (row) => {
    setBusyId(`ar-${row.id}`);
    try {
      const data = await authFetch(`/api/domains/${row.id}/autorenew`, {
        method: 'POST',
        body: { auto_renew: !row.auto_renew }
      });
      setDomains((prev) => prev.map((d) => d.id === row.id ? { ...d, auto_renew: data.auto_renew } : d));
      if (manage?.id === row.id) setManage((p) => ({ ...p, auto_renew: data.auto_renew }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  };

  const renewDomain = async (row) => {
    setBusyId(`rn-${row.id}`);
    try {
      const created = await authFetch(`/api/domains/${row.id}/renew`, { method: 'POST', body: { years: 1 } });
      const checkout = await authFetch('/api/domains/checkout', { method: 'POST', body: { orderId: created.order.id } });
      if (checkout.url) window.location.href = checkout.url;
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  };

  const tabs = [
    { key: 'domains', label: L('Search', 'بحث') },
    { key: 'my-domains', label: L('My domains', 'نطاقاتي') },
    { key: 'domain-pricing', label: L('Pricing', 'الأسعار') },
    { key: 'domain-settings', label: L('Settings', 'الإعدادات') }
  ];

  const title = useMemo(() => {
    if (page === 'my-domains') return L('My Domains', 'نطاقاتي');
    if (page === 'domain-pricing') return L('Domain Pricing', 'أسعار النطاقات');
    if (page === 'domain-settings') return L('Domain Settings', 'إعدادات النطاق');
    return L('Domain Search', 'بحث النطاق');
  }, [page, isRtl]);

  return (
    <div style={{ animation: 'fadeIn 0.25s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{title}</h2>
          <p style={{ margin: '6px 0 0', color: 'var(--t2)', fontSize: 13.5 }}>
            {L('Search, buy, and manage domains through our platform. Namecheap stays the registrar.', 'ابحث واشترِ وأدر النطاقات من المنصة. Namecheap يبقى المسجّل.')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setCurrentPage(tab.key)}
              style={{
                fontWeight: page === tab.key ? 800 : 500,
                borderBottom: page === tab.key ? '2px solid var(--a)' : '2px solid transparent',
                borderRadius: 0
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="card" style={{ marginBottom: 16, borderColor: 'rgba(239,68,68,0.3)', color: 'var(--red)', fontSize: 13 }}>
          {error}
        </div>
      ) : null}

      {page === 'domains' && (
        <>
          <form onSubmit={search} className="card" style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 18 }}>
            <Globe size={18} />
            <input
              className="inp"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={L('mycompany.com', 'شركتي.com')}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-prime" disabled={searching}>
              <Search size={15} />
              {searching ? L('Checking…', 'جاري الفحص…') : L('Search', 'بحث')}
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.map((row) => (
              <div key={row.domain} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '14px 18px' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{row.domain}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--t2)', marginTop: 4 }}>
                    {row.available ? (
                      <span style={{ color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={14} /> {L('Available', 'متاح')}</span>
                    ) : row.unsupported ? (
                      <span>{L('Not offered', 'غير مدعوم')}</span>
                    ) : (
                      <span style={{ color: '#dc2626', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><XCircle size={14} /> {L('Unavailable', 'غير متاح')}</span>
                    )}
                    {row.available ? ` · ${money(row.registration_price, row.currency)}/${L('year', 'سنة')} · ${L('Renew', 'تجديد')} ${money(row.renewal_price, row.currency)} · ${L('Transfer', 'نقل')} ${money(row.transfer_price, row.currency)}` : ''}
                  </div>
                </div>
                {row.available ? (
                  <button type="button" className="btn btn-prime" disabled={busyId === row.domain} onClick={() => startRegister(row)}>
                    {busyId === row.domain ? L('Preparing…', 'جاري التحضير…') : L('Register', 'تسجيل')}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </>
      )}

      {page === 'my-domains' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={loadMine}><RefreshCw size={14} /> {L('Refresh', 'تحديث')}</button>
          </div>
          {!domains.length ? (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--t2)' }}>
              {L('No domains yet. Search and register your first domain.', 'لا توجد نطاقات بعد. ابحث وسجّل نطاقك الأول.')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {domains.map((row) => (
                <div key={row.id} className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16 }}>{row.domain}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--t2)', marginTop: 6, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span>{L('Status', 'الحالة')}: <b>{row.status}</b></span>
                        <span>{L('Registered', 'التسجيل')}: {formatDate(row.registered_at)}</span>
                        <span>{L('Expires', 'الانتهاء')}: {formatDate(row.expires_at)}</span>
                        <span>{L('Auto-renew', 'التجديد التلقائي')}: {row.auto_renew ? L('On', 'مفعّل') : L('Off', 'متوقف')}</span>
                        <span>{L('Registrar', 'المسجّل')}: Namecheap</span>
                        <span>{L('Renewal', 'التجديد')}: {money(row.renewal_price)}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--t2)', marginTop: 6 }}>
                        NS: {(row.nameservers || []).join(', ') || '—'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => openManage(row)}>{L('Manage', 'إدارة')}</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => { openManage(row); loadDns(row.id); }}>{L('DNS', 'DNS')}</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggleRenew(row)} disabled={busyId === `ar-${row.id}`}>
                        {row.auto_renew ? L('Disable auto-renew', 'إيقاف التجديد') : L('Enable auto-renew', 'تفعيل التجديد')}
                      </button>
                      <button type="button" className="btn btn-prime btn-sm" onClick={() => renewDomain(row)} disabled={busyId === `rn-${row.id}`}>
                        {L('Renew', 'تجديد')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {orders.length ? (
            <div className="card" style={{ marginTop: 18 }}>
              <h4 style={{ margin: '0 0 10px' }}>{L('Recent orders', 'آخر الطلبات')}</h4>
              {orders.slice(0, 8).map((o) => (
                <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, padding: '8px 0', borderBottom: '1px solid var(--edge)' }}>
                  <span>{o.domain} · {o.type}</span>
                  <span>{o.status} · {money(o.customer_price, o.currency)}</span>
                </div>
              ))}
            </div>
          ) : null}
        </>
      )}

      {page === 'domain-pricing' && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--t2)' }}>
                <th style={{ padding: 10 }}>{L('Extension', 'الامتداد')}</th>
                <th style={{ padding: 10 }}>{L('Register', 'تسجيل')}</th>
                <th style={{ padding: 10 }}>{L('Renew', 'تجديد')}</th>
                <th style={{ padding: 10 }}>{L('Transfer', 'نقل')}</th>
              </tr>
            </thead>
            <tbody>
              {pricing.map((row) => (
                <tr key={row.extension} style={{ borderTop: '1px solid var(--edge)' }}>
                  <td style={{ padding: 10, fontWeight: 800 }}>.{row.extension}</td>
                  <td style={{ padding: 10 }}>{money(row.registration_price, row.currency)}</td>
                  <td style={{ padding: 10 }}>{money(row.renewal_price, row.currency)}</td>
                  <td style={{ padding: 10 }}>{money(row.transfer_price, row.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {page === 'domain-settings' && (
        <form onSubmit={saveContact} className="card" style={{ maxWidth: 720 }}>
          <p style={{ color: 'var(--t2)', fontSize: 13, marginTop: 0 }}>
            {L('Registrant contact is required before you can pay for a domain. It is sent to the registrar at registration time.', 'بيانات المسجّل مطلوبة قبل الدفع. تُرسل إلى المسجّل عند التسجيل.')}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {CONTACT_FIELDS.map(([key, label]) => (
              <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, fontWeight: 700, color: 'var(--t2)' }}>
                {label}
                <input
                  className="inp"
                  value={contact[key] || ''}
                  onChange={(e) => setContact((p) => ({ ...p, [key]: e.target.value }))}
                  required={['firstName', 'lastName', 'address1', 'city', 'postalCode', 'country', 'phone', 'email'].includes(key)}
                />
              </label>
            ))}
          </div>
          <button type="submit" className="btn btn-prime" style={{ marginTop: 16 }} disabled={busyId === 'contact'}>
            {busyId === 'contact' ? L('Saving…', 'جاري الحفظ…') : L('Save contact', 'حفظ البيانات')}
          </button>
        </form>
      )}

      {manage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setManage(null)}>
          <div className="card" style={{ width: '100%', maxWidth: 720, maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>{manage.domain}</h3>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setManage(null)}>✕</button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--t2)' }}>
              {L('Status', 'الحالة')}: {manage.status} · {L('Expires', 'الانتهاء')}: {formatDate(manage.expires_at)} · {L('Renewal', 'التجديد')}: {money(manage.renewal_price)}
            </p>
            <h4 style={{ marginBottom: 6 }}>{L('Nameservers', 'خوادم الأسماء')}</h4>
            <textarea className="inp" rows={4} value={nsText} onChange={(e) => setNsText(e.target.value)} />
            <button type="button" className="btn btn-ghost" style={{ marginTop: 8 }} onClick={saveNs} disabled={busyId === 'ns'}>
              <Server size={14} /> {L('Save nameservers', 'حفظ خوادم الأسماء')}
            </button>

            <h4 style={{ margin: '18px 0 6px' }}>{L('DNS records', 'سجلات DNS')}</h4>
            <button type="button" className="btn btn-ghost btn-sm" onClick={loadDns} disabled={busyId === 'dns'}>{L('Load DNS', 'تحميل DNS')}</button>
            {dns.map((rec, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 1.4fr 70px 36px', gap: 6, marginTop: 8 }}>
                <input className="inp" value={rec.name} onChange={(e) => setDns((p) => p.map((r, idx) => idx === i ? { ...r, name: e.target.value } : r))} placeholder="@" />
                <select className="inp" value={rec.type} onChange={(e) => setDns((p) => p.map((r, idx) => idx === i ? { ...r, type: e.target.value } : r))}>
                  {['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'URL'].map((t) => <option key={t}>{t}</option>)}
                </select>
                <input className="inp" value={rec.address} onChange={(e) => setDns((p) => p.map((r, idx) => idx === i ? { ...r, address: e.target.value } : r))} placeholder="value" />
                <input className="inp" value={rec.ttl} onChange={(e) => setDns((p) => p.map((r, idx) => idx === i ? { ...r, ttl: e.target.value } : r))} />
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDns((p) => p.filter((_, idx) => idx !== i))}><Trash2 size={14} /></button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDns((p) => [...p, { name: '@', type: 'A', address: '', mxPref: '10', ttl: '1799' }])}><Plus size={14} /> {L('Add record', 'إضافة سجل')}</button>
              <button type="button" className="btn btn-prime btn-sm" onClick={saveDns} disabled={busyId === 'dns-save'}>{L('Save DNS', 'حفظ DNS')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
