'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Copy, ExternalLink, Globe, Link2 } from 'lucide-react';
import { connectFunnelDomain, getCnameTarget, getProductionUrls, isApexDomain, markDomainStatus, normalizeHost, publishFunnelPublic, publishStorePublic } from '@/lib/sites/publicSite';

export default function DomainSettings({
  funnel,
  stepIdx = 0,
  ownerUid,
  isRtl,
  onSaveFunnel,
  showToast
}) {
  const [domainInput, setDomainInput] = useState(funnel?.domain || '');
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState('');
  const [dns, setDns] = useState(null);

  useEffect(() => {
    setDomainInput(funnel?.domain || '');
  }, [funnel?.id, funnel?.domain]);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const urls = getProductionUrls({ origin, funnel, stepIdx });
  const cnameTarget = getCnameTarget();
  const host = normalizeHost(domainInput);
  const apex = host ? isApexDomain(host) : false;
  const recordName = host.includes('.') ? host.split('.')[0] : 'www';
  const status = funnel?.domainStatus || (funnel?.domain ? 'pending' : '');

  const copyText = async (key, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      window.prompt(isRtl ? 'انسخ' : 'Copy', value);
    }
  };

  const saveDomain = async () => {
    if (!funnel?.id) return;
    setBusy(true);
    try {
      const connected = await connectFunnelDomain({
        funnelId: funnel.id,
        ownerUid,
        host,
        previousHost: funnel.domain
      });
      const nextFunnel = {
        ...funnel,
        domain: connected.host,
        domainStatus: connected.host ? 'pending' : ''
      };
      onSaveFunnel({
        domain: nextFunnel.domain,
        domainStatus: nextFunnel.domainStatus
      });
      const isStore = nextFunnel.kind === 'store' || Array.isArray(nextFunnel.products) || (Array.isArray(nextFunnel.pages) && !Array.isArray(funnel.steps));
      if (isStore) {
        await publishStorePublic({
          store: { ...nextFunnel, pages: nextFunnel.pages || nextFunnel.steps || [] },
          ownerUid,
          defaultPageIdx: stepIdx
        });
      } else if ((funnel.steps || []).some((step) => step.published)) {
        await publishFunnelPublic({ funnel: nextFunnel, ownerUid, defaultStepIdx: stepIdx });
      }
      setDns(null);
      showToast?.(connected.host
        ? (isRtl ? 'تم حفظ الدومين. أكمل سجلات DNS ثم افحص الاتصال.' : 'Domain saved. Add the DNS records, then check connection.')
        : (isRtl ? 'تم إزالة الدومين' : 'Domain removed'));
    } catch (err) {
      showToast?.(err.message || (isRtl ? 'تعذر حفظ الدومين' : 'Could not save domain'));
    } finally {
      setBusy(false);
    }
  };

  const checkDomain = async () => {
    if (!host) return;
    setChecking(true);
    try {
      const res = await fetch('/api/sites/verify-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host })
      });
      const data = await res.json();
      setDns(data);
      const nextStatus = data.matched ? 'connected' : 'pending';
      onSaveFunnel({ domain: host, domainStatus: nextStatus });
      await markDomainStatus(host, nextStatus, { funnelId: funnel.id, ownerUid });
      showToast?.(data.matched
        ? (isRtl ? 'الدومين متصل' : 'Domain DNS looks connected')
        : (isRtl ? 'لم نجد سجل CNAME بعد. انتظر DNS ثم أعد الفحص.' : 'CNAME not found yet. Wait for DNS, then check again.'));
    } catch (err) {
      showToast?.(err.message || (isRtl ? 'فشل فحص DNS' : 'DNS check failed'));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: 12, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, marginBottom: 8 }}>
          <Link2 size={16} />
          {isRtl ? 'رابط الإنتاج على UpKlick' : 'UpKlick production URL'}
        </div>
        <p style={{ color: 'var(--t2)', fontSize: 13, margin: '0 0 12px' }}>
          {isRtl
            ? 'بعد النشر يعمل هذا الرابط من أي جهاز، لأنه يُحمّل من السيرفر وليس من هذا المتصفح فقط.'
            : 'After Publish, this URL works on any device. It loads the public snapshot, not only this browser.'}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input readOnly className="inp" value={urls.appPublished} style={{ flex: 1, fontSize: 13 }} />
          <button type="button" className="btn btn-ghost" onClick={() => copyText('app', urls.appPublished)}>
            {copied === 'app' ? 'Copied' : <Copy size={15} />}
          </button>
          <button type="button" onClick={() => window.open(urls.appPublished, '_blank')} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 10px', cursor: 'pointer' }}>
            <ExternalLink size={15} />
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--edge)', borderRadius: 12, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}>
            <Globe size={16} />
            {isRtl ? 'ربط دومين خاص' : 'Connect your domain'}
          </div>
          {status ? (
            <span style={{ fontSize: 12, fontWeight: 800, color: status === 'connected' ? '#16a34a' : '#f97316' }}>
              {status === 'connected' ? (isRtl ? 'متصل' : 'Connected') : (isRtl ? 'بانتظار DNS' : 'Waiting for DNS')}
            </span>
          ) : null}
        </div>
        <p style={{ color: 'var(--t2)', fontSize: 13, margin: '0 0 12px' }}>
          {isRtl
            ? 'استخدم نطاقًا فرعيًا مثل www أو offers. النطاق الرئيسي (example.com) يحتاج سجل ALIAS/ANAME أو إعادة توجيه إلى www.'
            : 'Use a subdomain such as www or offers. An apex domain (example.com) needs an ALIAS/ANAME record or a redirect to www.'}
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            className="inp"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            placeholder="www.yourbrand.com"
            style={{ flex: 1, minWidth: 220 }}
          />
          <button type="button" onClick={saveDomain} disabled={busy} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}>
            {busy ? '...' : (isRtl ? 'حفظ الدومين' : 'Save domain')}
          </button>
          <button type="button" onClick={checkDomain} disabled={!host || checking} className="btn btn-ghost">
            {checking ? '...' : (isRtl ? 'فحص الاتصال' : 'Check DNS')}
          </button>
        </div>

        {host ? (
          <div style={{ marginTop: 16, background: 'var(--surface2)', border: '1px solid var(--edge)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 10, color: 'var(--t1)' }}>
              {isRtl ? 'أضف هذا السجل عند موزع الدومين' : 'Add this record at your domain registrar'}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ color: 'var(--t2)', textAlign: 'left' }}>
                    <th style={{ padding: '6px 8px' }}>Type</th>
                    <th style={{ padding: '6px 8px' }}>Name / Host</th>
                    <th style={{ padding: '6px 8px' }}>Value / Points to</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px', fontWeight: 800 }}>{apex ? 'ALIAS / ANAME' : 'CNAME'}</td>
                    <td style={{ padding: '8px' }}>{apex ? '@' : recordName}</td>
                    <td style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <code>{cnameTarget}</code>
                      <button type="button" className="btn btn-ghost" style={{ padding: 4 }} onClick={() => copyText('cname', cnameTarget)}>
                        {copied === 'cname' ? 'Copied' : <Copy size={14} />}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {apex ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 10, color: '#f97316', fontSize: 12, fontWeight: 600 }}>
                <AlertCircle size={15} />
                <span>{isRtl ? 'إن لم يدعم موزعك ALIAS، أنشئ www ثم حوّل النطاق الرئيسي إليه.' : 'If your registrar has no ALIAS record, create www and redirect the root domain to it.'}</span>
              </div>
            ) : null}
            <div style={{ marginTop: 12, color: 'var(--t2)', fontSize: 12, lineHeight: 1.6 }}>
              {isRtl
                ? 'بعد حفظ DNS: أضف نفس الدومين في مشروع الاستضافة (Vercel → Project → Settings → Domains) حتى يعمل HTTPS. قد يستغرق الانتشار حتى 24 ساعة.'
                : 'After saving DNS, add the same domain in your host (Vercel → Project → Settings → Domains) so HTTPS can be issued. Propagation can take up to 24 hours.'}
            </div>
            {urls.custom ? (
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <input readOnly className="inp" value={urls.custom} style={{ flex: 1, fontSize: 13 }} />
                <button type="button" className="btn btn-ghost" onClick={() => copyText('custom', urls.custom)}>
                  {copied === 'custom' ? 'Copied' : <Copy size={15} />}
                </button>
                <button type="button" onClick={() => window.open(urls.custom, '_blank')} style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 10px', cursor: 'pointer' }}>
                  <ExternalLink size={15} />
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {dns ? (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: dns.matched ? '#16a34a' : '#f97316' }}>
            {dns.matched ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {dns.matched
              ? (isRtl ? 'وجدنا سجل CNAME الصحيح' : `Found CNAME: ${(dns.cnames || []).join(', ') || 'ok'}`)
              : (isRtl ? 'لم نجد CNAME بعد' : `No matching CNAME yet${dns.cnames?.length ? ` (found ${(dns.cnames || []).join(', ')})` : ''}`)}
          </div>
        ) : null}
      </div>
    </div>
  );
}
