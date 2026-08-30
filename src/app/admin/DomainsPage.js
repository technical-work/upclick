'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Search, RefreshCw, Save, RotateCcw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

async function adminFetch(path, { method = 'GET', body } = {}) {
  const { auth } = await import('../../lib/firebase');
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const token = await user.getIdToken();
  const res = await fetch(path, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {})
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function money(n) {
  return `$${(Number(n) || 0).toFixed(2)}`;
}

export default function DomainsPage({ isRTL }) {
  const { user } = useAuth();
  const [tab, setTab] = useState('domains');
  const [q, setQ] = useState('');
  const [domains, setDomains] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [settings, setSettings] = useState({ markup: 4.99, markup_type: 'fixed' });
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [configured, setConfigured] = useState(true);

  const load = useCallback(async () => {
    setError('');
    try {
      const [d, o, p, l] = await Promise.all([
        adminFetch(`/api/admin/domains${q ? `?q=${encodeURIComponent(q)}` : ''}`),
        adminFetch('/api/admin/domains/orders'),
        adminFetch('/api/admin/domains/pricing'),
        adminFetch('/api/admin/domains/logs')
      ]);
      setDomains(d.domains || []);
      setOrders(o.orders || []);
      setPricing(p.pricing || []);
      setSettings(p.settings || settings);
      setConfigured(p.namecheapConfigured !== false);
      setLogs(l.logs || []);
    } catch (err) {
      setError(err.message);
    }
  }, [q]);

  useEffect(() => {
    if (user) load();
    // initial load only; search uses Enter / Refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const saveRow = async (row) => {
    setBusy(row.extension);
    try {
      await adminFetch('/api/admin/domains/pricing', {
        method: 'PUT',
        body: {
          extension: row.extension,
          registrar_price: row.registrar_price,
          registration_price: row.registration_price,
          renewal_price: row.renewal_price,
          transfer_price: row.transfer_price,
          markup: row.markup,
          markup_type: row.markup_type,
          enabled: row.enabled
        }
      });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const retry = async (id) => {
    setBusy(id);
    try {
      await adminFetch(`/api/admin/domains/orders/${id}/retry`, { method: 'POST', body: {} });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const L = (en, ar) => (isRTL ? ar : en);

  return (
    <div>
      {!configured ? (
        <div className="card" style={{ marginBottom: 16, borderColor: 'rgba(245,158,11,0.4)' }}>
          <AlertTriangle size={16} /> {L('Namecheap API keys are not set. Add NAMECHEAP_* variables in the environment.', 'مفاتيح Namecheap غير مضبوطة.')}
        </div>
      ) : null}
      {error ? <div className="card" style={{ marginBottom: 16, color: 'var(--red)' }}>{error}</div> : null}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          ['domains', L('Purchased domains', 'النطاقات المشتراة')],
          ['orders', L('Orders', 'الطلبات')],
          ['pricing', L('TLD pricing', 'تسعير الامتدادات')],
          ['logs', L('Registrar errors', 'أخطاء المسجّل')]
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setTab(key)}
            style={{ fontWeight: tab === key ? 800 : 500, borderBottom: tab === key ? '2px solid var(--orange)' : '2px solid transparent', borderRadius: 0 }}
          >
            {label}
          </button>
        ))}
        <button type="button" className="btn btn-ghost btn-sm" onClick={load} style={{ marginInlineStart: 'auto' }}>
          <RefreshCw size={14} /> {L('Refresh', 'تحديث')}
        </button>
      </div>

      {tab === 'domains' && (
        <div className="card">
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <Search size={16} />
            <input className="inp" value={q} onChange={(e) => setQ(e.target.value)} placeholder={L('Search domain or customer', 'بحث بالنطاق أو العميل')} onKeyDown={(e) => e.key === 'Enter' && load()} />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: 'var(--text3)', textAlign: 'left' }}>
                  <th style={{ padding: 8 }}>{L('Domain', 'النطاق')}</th>
                  <th style={{ padding: 8 }}>{L('Customer', 'العميل')}</th>
                  <th style={{ padding: 8 }}>{L('Status', 'الحالة')}</th>
                  <th style={{ padding: 8 }}>{L('Customer price', 'سعر العميل')}</th>
                  <th style={{ padding: 8 }}>{L('Expires', 'الانتهاء')}</th>
                </tr>
              </thead>
              <tbody>
                {domains.map((d) => (
                  <tr key={d.id} style={{ borderTop: '1px solid var(--line)' }}>
                    <td style={{ padding: 8, fontWeight: 700 }}>{d.domain}</td>
                    <td style={{ padding: 8 }}>{d.user_name || d.user_email}<div style={{ fontSize: 11, color: 'var(--text3)' }}>{d.user_id}</div></td>
                    <td style={{ padding: 8 }}>{d.status}</td>
                    <td style={{ padding: 8 }}>{money(d.registration_price)}</td>
                    <td style={{ padding: 8 }}>{String(d.expires_at || '').slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: 'var(--text3)', textAlign: 'left' }}>
                <th style={{ padding: 8 }}>{L('Domain', 'النطاق')}</th>
                <th style={{ padding: 8 }}>{L('Customer', 'العميل')}</th>
                <th style={{ padding: 8 }}>{L('Type', 'النوع')}</th>
                <th style={{ padding: 8 }}>{L('Status', 'الحالة')}</th>
                <th style={{ padding: 8 }}>{L('Cost', 'التكلفة')}</th>
                <th style={{ padding: 8 }}>{L('Price', 'السعر')}</th>
                <th style={{ padding: 8 }}>{L('Profit', 'الربح')}</th>
                <th style={{ padding: 8 }}></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} style={{ borderTop: '1px solid var(--line)' }}>
                  <td style={{ padding: 8 }}>{o.domain}</td>
                  <td style={{ padding: 8 }}>{o.user_email}</td>
                  <td style={{ padding: 8 }}>{o.type}</td>
                  <td style={{ padding: 8 }}>{o.status}{o.error_public ? <div style={{ color: 'var(--red)', fontSize: 11 }}>{o.error_public}</div> : null}</td>
                  <td style={{ padding: 8 }}>{money(o.registrar_cost)}</td>
                  <td style={{ padding: 8 }}>{money(o.customer_price)}</td>
                  <td style={{ padding: 8 }}>{money(o.profit)}</td>
                  <td style={{ padding: 8 }}>
                    {['failed', 'paid', 'processing'].includes(o.status) ? (
                      <button type="button" className="btn btn-ghost btn-sm" disabled={busy === o.id} onClick={() => retry(o.id)}>
                        <RotateCcw size={13} /> {L('Retry', 'إعادة')}
                      </button>
                    ) : null}
                    {o.error_internal ? <div style={{ fontSize: 10, color: 'var(--text3)', maxWidth: 220 }}>{o.error_internal}</div> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'pricing' && (
        <>
          <div className="card" style={{ marginBottom: 14, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end' }}>
            <label style={{ fontSize: 12 }}>
              {L('Default markup', 'الهامش الافتراضي')}
              <input className="inp" type="number" step="0.01" value={settings.markup} onChange={(e) => setSettings((s) => ({ ...s, markup: e.target.value }))} />
            </label>
            <label style={{ fontSize: 12 }}>
              {L('Markup type', 'نوع الهامش')}
              <select className="inp" value={settings.markup_type} onChange={(e) => setSettings((s) => ({ ...s, markup_type: e.target.value }))}>
                <option value="fixed">{L('Fixed $', 'ثابت $')}</option>
                <option value="percent">{L('Percent %', 'نسبة %')}</option>
              </select>
            </label>
            <button type="button" className="btn btn-prime btn-sm" onClick={() => adminFetch('/api/admin/domains/pricing', { method: 'PUT', body: { settings } }).then(load)}>
              <Save size={14} /> {L('Save defaults', 'حفظ الافتراضي')}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => adminFetch('/api/admin/domains/pricing', { method: 'PUT', body: { refreshRegistrar: true } }).then(load)}>
              {L('Refresh Namecheap costs', 'تحديث تكلفة Namecheap')}
            </button>
          </div>
          <div className="card" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ color: 'var(--text3)', textAlign: 'left' }}>
                  <th style={{ padding: 8 }}>TLD</th>
                  <th style={{ padding: 8 }}>{L('Registrar cost', 'تكلفة المسجّل')}</th>
                  <th style={{ padding: 8 }}>{L('Register', 'تسجيل')}</th>
                  <th style={{ padding: 8 }}>{L('Renew', 'تجديد')}</th>
                  <th style={{ padding: 8 }}>{L('Transfer', 'نقل')}</th>
                  <th style={{ padding: 8 }}>{L('Markup', 'الهامش')}</th>
                  <th style={{ padding: 8 }}>{L('Profit', 'الربح')}</th>
                  <th style={{ padding: 8 }}>{L('Enabled', 'مفعّل')}</th>
                  <th style={{ padding: 8 }}></th>
                </tr>
              </thead>
              <tbody>
                {pricing.map((row, i) => (
                  <tr key={row.extension} style={{ borderTop: '1px solid var(--line)' }}>
                    <td style={{ padding: 8, fontWeight: 800 }}>.{row.extension}</td>
                    <td style={{ padding: 8 }}><input className="inp" type="number" step="0.01" value={row.registrar_price} onChange={(e) => setPricing((p) => p.map((r, idx) => idx === i ? { ...r, registrar_price: e.target.value } : r))} style={{ width: 90 }} /></td>
                    <td style={{ padding: 8 }}><input className="inp" type="number" step="0.01" value={row.registration_price} onChange={(e) => setPricing((p) => p.map((r, idx) => idx === i ? { ...r, registration_price: e.target.value } : r))} style={{ width: 90 }} /></td>
                    <td style={{ padding: 8 }}><input className="inp" type="number" step="0.01" value={row.renewal_price} onChange={(e) => setPricing((p) => p.map((r, idx) => idx === i ? { ...r, renewal_price: e.target.value } : r))} style={{ width: 90 }} /></td>
                    <td style={{ padding: 8 }}><input className="inp" type="number" step="0.01" value={row.transfer_price} onChange={(e) => setPricing((p) => p.map((r, idx) => idx === i ? { ...r, transfer_price: e.target.value } : r))} style={{ width: 90 }} /></td>
                    <td style={{ padding: 8 }}>
                      <input className="inp" type="number" step="0.01" value={row.markup} onChange={(e) => setPricing((p) => p.map((r, idx) => idx === i ? { ...r, markup: e.target.value } : r))} style={{ width: 70 }} />
                      <select className="inp" value={row.markup_type} onChange={(e) => setPricing((p) => p.map((r, idx) => idx === i ? { ...r, markup_type: e.target.value } : r))} style={{ width: 80, marginTop: 4 }}>
                        <option value="fixed">$</option>
                        <option value="percent">%</option>
                      </select>
                    </td>
                    <td style={{ padding: 8 }}>{money(row.profit)}</td>
                    <td style={{ padding: 8 }}>
                      <input type="checkbox" checked={row.enabled !== false} onChange={(e) => setPricing((p) => p.map((r, idx) => idx === i ? { ...r, enabled: e.target.checked } : r))} />
                    </td>
                    <td style={{ padding: 8 }}>
                      <button type="button" className="btn btn-ghost btn-sm" disabled={busy === row.extension} onClick={() => saveRow(row)}>
                        <Save size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'logs' && (
        <div className="card">
          {logs.map((log) => (
            <div key={log.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--line)', fontSize: 12.5 }}>
              <div style={{ fontWeight: 700 }}>{log.domain} · {log.orderId} · {log.code || 'error'}</div>
              <div style={{ color: 'var(--red)' }}>{log.message}</div>
              <div style={{ color: 'var(--text3)', fontSize: 11 }}>{log.createdAt}</div>
            </div>
          ))}
          {!logs.length ? <div style={{ color: 'var(--text3)' }}>{L('No registrar errors logged.', 'لا توجد أخطاء مسجّلة.')}</div> : null}
        </div>
      )}
    </div>
  );
}
