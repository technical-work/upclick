'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Send,
  Clock,
  Ban,
  RefreshCw,
  Users,
  Trash2,
  Plus,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  Smartphone,
  Sparkles,
  Layers,
  Filter,
  Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  CREDIT_BUCKETS,
  getConsumedCredits,
  getCreditBucket,
  matchesTrialAudience
} from '../../lib/credits/buckets';

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
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

function computeBuckets(users, trialOnly) {
  const counts = Object.fromEntries(CREDIT_BUCKETS.map((b) => [b.key, 0]));
  (users || []).forEach((u) => {
    if (!u || u.role === 'admin' || u.role === 'super_admin') return;
    if (!matchesTrialAudience(u, trialOnly)) return;
    const key = u.creditBucket || getCreditBucket(getConsumedCredits(u));
    if (counts[key] !== undefined) counts[key] += 1;
  });
  const buckets = CREDIT_BUCKETS.map((b) => ({ ...b, count: counts[b.key] || 0 }));
  const total = buckets.reduce((sum, b) => sum + b.count, 0);
  return { buckets, total };
}

function previewFromUsers(users, audience) {
  const type = audience?.type || 'all';
  const trialOnly = audience?.trialOnly !== false;
  const matched = (users || []).filter((u) => {
    if (!u) return false;
    if (type === 'selected') return (audience.userIds || []).includes(u.id);
    if (u.role === 'admin' || u.role === 'super_admin') return false;
    if (!matchesTrialAudience(u, trialOnly)) return false;
    if (type === 'all') return true;
    if (type === 'segment') {
      const bucket = u.creditBucket || getCreditBucket(getConsumedCredits(u));
      return bucket === audience.segment;
    }
    return false;
  });
  return {
    count: matched.length,
    sample: matched.slice(0, 10).map((u) => ({
      id: u.id,
      name: u.name || u.displayName || u.email || '—',
      email: u.email || u.userEmail || '',
      phone: u.phoneNumber || u.phone || '',
      bucket: u.creditBucket || getCreditBucket(getConsumedCredits(u)),
      creditsUsed: getConsumedCredits(u)
    }))
  };
}

const EMPTY_WA_FORM = {
  name: '',
  channel: 'whatsapp',
  whatsappVars: { 1: 'عزيزنا العميل', 2: 'https://upklick.net' },
  audienceType: 'all',
  segment: 'c500',
  trialOnly: true,
  sendNow: true,
  scheduledAt: ''
};

export default function WhatsAppOutreachView({ isRTL, users = [] }) {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState(EMPTY_WA_FORM);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQ, setSearchQ] = useState('');
  const [preview, setPreview] = useState(null);
  const [draft, setDraft] = useState(null);
  const [confirmCount, setConfirmCount] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);
  const [waHintOpen, setWaHintOpen] = useState(false);

  const t = (ar, en) => (isRTL ? ar : en);
  const composeRef = useRef(null);

  const { buckets, total: segmentTotal } = useMemo(() => {
    return computeBuckets(users, form.trialOnly);
  }, [users, form.trialOnly]);

  const loadCore = useCallback(async () => {
    const results = await Promise.allSettled([
      adminFetch('/api/admin/outreach/status'),
      adminFetch('/api/admin/outreach/campaigns')
    ]);

    if (results[0].status === 'fulfilled') {
      setStatus(results[0].value);
    }

    if (results[1].status === 'fulfilled') {
      const waOnly = (results[1].value.campaigns || []).filter(c => c.channel === 'whatsapp');
      setCampaigns(waOnly);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    loadCore().catch((err) => setError(err.message));
  }, [currentUser, loadCore]);

  useEffect(() => {
    if (!info) return undefined;
    const timer = setTimeout(() => setInfo(''), 4500);
    return () => clearTimeout(timer);
  }, [info]);

  const audience = useMemo(() => {
    const base = { type: form.audienceType, trialOnly: form.trialOnly };
    if (form.audienceType === 'segment') base.segment = form.segment;
    if (form.audienceType === 'selected') base.userIds = selectedUsers.map((u) => u.id);
    return base;
  }, [form.audienceType, form.trialOnly, form.segment, selectedUsers]);

  const runPreview = () => {
    const data = previewFromUsers(users, audience);
    setPreview(data);
    setConfirmCount(String(data.count ?? ''));
    setInfo(t(`المستلمون المطابقون: ${data.count}`, `Matching recipients: ${data.count}`));
  };

  const saveDraft = async () => {
    if (!form.name.trim()) {
      setError(t('اكتب اسم الحملة أولاً', 'Enter campaign name'));
      return;
    }
    setBusy('save');
    setError('');
    try {
      const payload = {
        name: form.name,
        channel: 'whatsapp',
        whatsappVars: form.whatsappVars,
        audience,
        previewCount: preview?.count || 0
      };
      const res = await adminFetch('/api/admin/outreach/campaigns', { method: 'POST', body: payload });
      setDraft(res.campaign);
      setCampaigns((prev) => [res.campaign, ...prev]);
      setInfo(t('تم حفظ مسودة حملة الواتساب', 'WhatsApp campaign draft saved'));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const confirmSend = async () => {
    setBusy('confirm');
    setError('');
    try {
      await adminFetch('/api/admin/outreach/campaigns/confirm', {
        method: 'POST',
        body: {
          name: form.name,
          channel: 'whatsapp',
          whatsappVars: form.whatsappVars,
          audience,
          confirmText,
          confirmCount: Number(confirmCount),
          sendNow: form.sendNow,
          scheduledAt: form.sendNow ? undefined : new Date(form.scheduledAt).toISOString()
        }
      });
      setConfirmText('');
      setInfo(t('تم تأكيد حملة الواتساب ودخلت قائمة الإرسال 🚀', 'WhatsApp campaign confirmed and queued 🚀'));
      await loadCore();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const whatsappReady = Boolean(status?.whatsapp?.enabled);

  return (
    <div className="outreach-page" style={{ animation: 'fadeSlide 0.35s ease' }}>
      
      {/* WhatsApp Status Pill */}
      <div className="outreach-pill-row" style={{ marginBottom: '20px' }}>
        <div className={`outreach-pill ${whatsappReady ? 'is-ok' : 'is-warn'}`}>
          <span className="outreach-pill-dot" />
          <MessageCircle size={18} />
          <div>
            <div className="outreach-pill-label">WhatsApp Business (Twilio)</div>
            <div className="outreach-pill-sub">
              {whatsappReady ? t('القوالب معتمدة وجاهزة للإرسال', 'Approved Templates Ready') : t('يحتاج قالب Twilio معتمد (Content SID)', 'Needs approved Twilio Content Template')}
            </div>
          </div>
        </div>
      </div>

      {!whatsappReady && (
        <div className="outreach-banner warn" style={{ marginBottom: '20px' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <button
              type="button"
              onClick={() => setWaHintOpen((v) => !v)}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 800, padding: 0 }}
            >
              {t('واتساب غير مفعّل بعد — اضغط لمعرفة متطلبات التفعيل', 'WhatsApp is not enabled yet — click for setup details')}
            </button>
            {waHintOpen && (
              <p style={{ margin: '8px 0 0', opacity: 0.95, fontSize: '12.5px', lineHeight: 1.6 }}>
                {t(
                  'يتطلب إرسال حملات واتساب ربط حساب Twilio وإضافة المتغيرات: TWILIO_ACCOUNT_SID، TWILIO_AUTH_TOKEN، TWILIO_WHATSAPP_FROM وقالب معتمد TWILIO_CONTENT_SID.',
                  'WhatsApp campaigns require Twilio integration with: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM and an approved TWILIO_CONTENT_SID.'
                )}
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="outreach-banner err" style={{ marginBottom: '16px' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <div>{error}</div>
          <button type="button" className="outreach-banner-close" onClick={() => setError('')}>✕</button>
        </div>
      )}

      {info && (
        <div className="outreach-banner ok" style={{ marginBottom: '16px' }}>
          <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
          <div>{info}</div>
        </div>
      )}

      {/* Composer Card */}
      <div
        ref={composeRef}
        className="card"
        style={{
          padding: '22px',
          marginBottom: '24px',
          background: 'var(--bg2)',
          border: '1px solid rgba(16, 185, 129, 0.25)'
        }}
      >
        <div className="flex-between" style={{ marginBottom: '16px', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={18} />
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
              {t('إنشاء حملة واتساب (WhatsApp Campaign)', 'Compose WhatsApp Campaign')}
            </h3>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={saveDraft} disabled={!!busy || !form.name.trim()}>
            {t('حفظ مسودة', 'Save Draft')}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--text2)' }}>
              {t('اسم الحملة', 'Campaign Name')} <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <input
              className="form-control"
              placeholder={t('مثال: رسالة تذكير واتساب', 'e.g. WhatsApp Reminder Blast')}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--text2)' }}>
                {t('المتغير الأول {{1}} (الاسم)', 'Variable {{1}} (Name)')}
              </label>
              <input
                className="form-control"
                value={form.whatsappVars[1] || ''}
                onChange={(e) => setForm((f) => ({ ...f, whatsappVars: { ...f.whatsappVars, 1: e.target.value } }))}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--text2)' }}>
                {t('المتغير الثاني {{2}} (الرابط)', 'Variable {{2}} (Link/Action)')}
              </label>
              <input
                className="form-control"
                value={form.whatsappVars[2] || ''}
                onChange={(e) => setForm((f) => ({ ...f, whatsappVars: { ...f.whatsappVars, 2: e.target.value } }))}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--text2)' }}>
              {t('الجمهور المستهدف', 'Target Audience')}
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: t('كل المستخدمين', 'All Users') },
                { id: 'segment', label: t('فئة كريدت', 'Credit Segment') }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={form.audienceType === opt.id ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
                  onClick={() => { setForm((f) => ({ ...f, audienceType: opt.id })); setPreview(null); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button type="button" className="btn btn-ghost" onClick={runPreview}>
              <Users size={15} />
              <span>{t('معاينة العدد', 'Preview Count')} {preview ? `(${preview.count})` : ''}</span>
            </button>
          </div>

          {preview && (
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '12.5px' }}>
              <strong>{t(`جاهز للإرسال إلى ${preview.count} مستخدم عبر واتساب`, `Ready to send to ${preview.count} WhatsApp users`)}</strong>
            </div>
          )}

          <div className="outreach-launch" style={{ marginTop: '6px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '10px' }}>
              {t('تأكيد الإطلاق — اكتب العدد ثم كلمة SEND:', 'Confirm Launch — type count then SEND:')}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input className="form-control" style={{ maxWidth: '120px' }} placeholder={t('العدد', 'Count')} value={confirmCount} onChange={(e) => setConfirmCount(e.target.value)} />
              <input className="form-control" style={{ maxWidth: '140px', fontWeight: 800 }} placeholder="SEND" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
              <button
                type="button"
                className="btn btn-primary"
                onClick={confirmSend}
                disabled={!whatsappReady || !form.name.trim() || !preview || String(preview.count) !== String(confirmCount) || confirmText.trim().toUpperCase() !== 'SEND' || !!busy}
                style={{ background: '#10b981', border: 'none' }}
              >
                <Send size={15} />
                <span>{busy === 'confirm' ? t('جارٍ الإرسال…', 'Sending…') : t('تأكيد وإرسال واتساب', 'Confirm & Send WhatsApp')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns History */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{t('حملات الواتساب', 'WhatsApp Campaigns')}</span>
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>{campaigns.length}</span>
        </div>
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--line)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'start', fontSize: '12px', color: 'var(--text2)' }}>{t('الحملة', 'Campaign')}</th>
                <th style={{ padding: '12px 16px', textAlign: 'start', fontSize: '12px', color: 'var(--text2)' }}>{t('الحالة', 'Status')}</th>
                <th style={{ padding: '12px 16px', textAlign: 'start', fontSize: '12px', color: 'var(--text2)' }}>{t('التقدم', 'Progress')}</th>
                <th style={{ padding: '12px 16px', textAlign: 'start', fontSize: '12px', color: 'var(--text2)' }}></th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text3)' }}>
                    {t('لا توجد حملات واتساب بعد', 'No WhatsApp campaigns yet')}
                  </td>
                </tr>
              ) : campaigns.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 800 }}>{c.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: 2 }}>WhatsApp</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`outreach-status-badge ${c.status || 'draft'}`}>{c.status || 'draft'}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text2)' }}>
                    {c.sent || 0}/{c.total || c.previewCount || 0} {t('أُرسل', 'sent')}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setDetailsTarget({ campaign: c, recipients: [] })}
                    >
                      👁️ {t('التفاصيل', 'Details')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
