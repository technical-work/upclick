'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, Send, Clock, Ban, RefreshCw, Users, Trash2, Plus, Mail, MessageCircle, CheckCircle2, AlertTriangle, Pencil } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
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

function toIso(v) {
  if (!v) return null;
  if (typeof v.toDate === 'function') return v.toDate().toISOString();
  if (v.seconds) return new Date(v.seconds * 1000).toISOString();
  if (v instanceof Date) return v.toISOString();
  return typeof v === 'string' ? v : null;
}

function serializeClientCampaign(d) {
  const data = d.data() || {};
  return {
    id: d.id,
    ...data,
    createdAt: toIso(data.createdAt),
    scheduledAt: toIso(data.scheduledAt),
    testSentAt: toIso(data.testSentAt),
    confirmedAt: toIso(data.confirmedAt),
    completedAt: toIso(data.completedAt)
  };
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
      name: u.name || u.displayName || u.fullName || u.email || '—',
      email: u.email || u.userEmail || '',
      phone: u.phoneNumber || u.phone || '',
      bucket: u.creditBucket || getCreditBucket(getConsumedCredits(u)),
      creditsUsed: getConsumedCredits(u)
    }))
  };
}

function toDatetimeLocal(v) {
  const iso = toIso(v);
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formFromCampaign(c) {
  const audience = c.audience || {};
  const hasSchedule = Boolean(c.scheduledAt);
  return {
    name: c.name || '',
    channel: c.channel || 'email',
    subject: c.subject || '',
    htmlBody: String(c.htmlBody || '').replace(/<br\s*\/?>/gi, '\n'),
    actionUrl: c.actionUrl || '',
    actionText: c.actionText || '',
    audienceType: audience.type || 'all',
    segment: audience.segment || 'c500',
    trialOnly: audience.trialOnly !== false,
    sendNow: !hasSchedule,
    scheduledAt: hasSchedule ? toDatetimeLocal(c.scheduledAt) : ''
  };
}

function selectedFromCampaign(c, users) {
  return (c.audience?.userIds || []).map((id) => {
    const u = (users || []).find((x) => x.id === id);
    if (!u) return { id, name: id, email: '', phone: '' };
    return {
      id,
      name: u.name || u.displayName || u.email || id,
      email: u.email || u.userEmail || '',
      phone: u.phoneNumber || ''
    };
  });
}

async function loadCampaignsClient() {
  try {
    const snap = await getDocs(query(collection(db, 'campaigns'), orderBy('createdAt', 'desc'), limit(50)));
    return snap.docs.map(serializeClientCampaign);
  } catch {
    const snap = await getDocs(collection(db, 'campaigns'));
    return snap.docs.map(serializeClientCampaign);
  }
}

const EMPTY_FORM = {
  name: '',
  channel: 'email',
  subject: '',
  htmlBody: '',
  actionUrl: '',
  actionText: '',
  audienceType: 'all',
  segment: 'c500',
  trialOnly: true,
  sendNow: true,
  scheduledAt: ''
};

function campaignStatusMeta(status, t) {
  const map = {
    draft: { className: 'draft', label: t('مسودة', 'Draft') },
    sending: { className: 'sending', label: t('جاري الإرسال', 'Sending') },
    scheduled: { className: 'scheduled', label: t('مجدولة', 'Scheduled') },
    paused: { className: 'paused', label: t('متوقفة', 'Paused') },
    completed: { className: 'completed', label: t('مكتملة', 'Completed') },
    cancelled: { className: 'cancelled', label: t('ملغاة', 'Cancelled') }
  };
  return map[status] || { className: 'draft', label: status || '—' };
}

function audienceLabel(c, t) {
  const type = c.audience?.type;
  if (type === 'selected') return t('أشخاص محددون', 'Selected people');
  if (type === 'segment') return t('فئة كريدت', 'Credit segment');
  return t('كل المستخدمين', 'Everyone');
}

export default function OutreachPage({ isRTL, users = [] }) {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQ, setSearchQ] = useState('');
  const [searchTrialOnly, setSearchTrialOnly] = useState(false);
  const [serverSearchResults, setServerSearchResults] = useState([]);
  const [preview, setPreview] = useState(null);
  const [draft, setDraft] = useState(null);
  const [confirmCount, setConfirmCount] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [quotaNotice, setQuotaNotice] = useState(false);
  const [waHintOpen, setWaHintOpen] = useState(false);

  const t = (ar, en) => (isRTL ? ar : en);
  const composeRef = useRef(null);

  // Compute segments directly in memory from `users` — 0 network requests, 0 Firestore reads!
  const { buckets, total: segmentTotal } = useMemo(() => {
    return computeBuckets(users, form.trialOnly);
  }, [users, form.trialOnly]);

  const upsertCampaignInList = (saved) => {
    if (!saved?.id) return;
    setCampaigns((prev) => [saved, ...prev.filter((c) => c.id !== saved.id)]);
  };

  const resetCompose = () => {
    setDraft(null);
    setForm(EMPTY_FORM);
    setSelectedUsers([]);
    setSearchQ('');
    setServerSearchResults([]);
    setPreview(null);
    setConfirmCount('');
    setConfirmText('');
    setInfo('');
  };

  const loadCore = useCallback(async () => {
    const results = await Promise.allSettled([
      adminFetch('/api/admin/outreach/status'),
      adminFetch('/api/admin/outreach/campaigns')
    ]);

    const errors = [];
    const quotaHits = [];
    if (results[0].status === 'fulfilled') {
      setStatus(results[0].value);
    } else {
      const msg = results[0].reason?.message || 'status failed';
      if (/quota/i.test(msg)) quotaHits.push(msg);
      else errors.push(msg);
      setStatus({
        emailConfigured: true,
        whatsapp: { enabled: false, fromConfigured: false, contentSidConfigured: false, accountConfigured: false },
        cronConfigured: null
      });
    }

    if (results[1].status === 'fulfilled') {
      setCampaigns(results[1].value.campaigns || []);
    } else {
      const msg = results[1].reason?.message || 'campaigns failed';
      if (/quota/i.test(msg)) quotaHits.push(msg);
      else errors.push(msg);
      try {
        setCampaigns(await loadCampaignsClient());
      } catch (err) {
        if (/quota/i.test(err.message || '')) quotaHits.push(err.message);
        else errors.push(err.message);
      }
    }

    setQuotaNotice(quotaHits.length > 0);
    if (errors.length) {
      setError(errors.filter(Boolean).join(' · '));
    } else {
      setError('');
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

  useEffect(() => {
    if (!deleteTarget) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && busy !== 'delete') setDeleteTarget(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [deleteTarget, busy]);

  const audience = useMemo(() => {
    const base = { type: form.audienceType, trialOnly: form.trialOnly };
    if (form.audienceType === 'segment') base.segment = form.segment;
    if (form.audienceType === 'selected') base.userIds = selectedUsers.map((u) => u.id);
    return base;
  }, [form.audienceType, form.trialOnly, form.segment, selectedUsers]);

  const campaignPayload = useCallback(() => ({
    campaignId: draft?.id && draft.status === 'draft' ? draft.id : undefined,
    name: form.name,
    channel: form.channel,
    subject: form.subject,
    htmlBody: form.htmlBody.includes('<') ? form.htmlBody : form.htmlBody.replace(/\n/g, '<br/>'),
    actionUrl: form.actionUrl,
    actionText: form.actionText,
    audience,
    previewCount: preview?.count || 0
  }), [draft, form, audience, preview]);

  const runPreview = async () => {
    setBusy('preview');
    setError('');
    try {
      if (audience.type === 'selected') {
        const count = selectedUsers.length;
        const sample = selectedUsers.slice(0, 10).map((u) => ({
          id: u.id,
          name: u.name || u.displayName || u.email || '—',
          email: u.email || u.userEmail || '',
          phone: u.phone || u.phoneNumber || '',
          bucket: u.bucket || getCreditBucket(getConsumedCredits(u)),
          creditsUsed: u.creditsUsed ?? getConsumedCredits(u)
        }));
        setPreview({ count, sample });
        setConfirmCount(String(count));
        setInfo(t(`المستلمون المحددون: ${count}`, `Selected recipients: ${count}`));
        return;
      }

      if (users && users.length > 0) {
        const data = previewFromUsers(users, audience);
        setPreview(data);
        setConfirmCount(String(data.count ?? ''));
        setInfo(t(`المستلمون: ${data.count}`, `Recipients: ${data.count}`));
        return;
      }

      const data = await adminFetch('/api/admin/outreach/preview', {
        method: 'POST',
        body: { audience }
      });
      setPreview(data);
      setConfirmCount(String(data.count ?? ''));
      setInfo(t(`المستلمون الحاليون: ${data.count}`, `Current recipients: ${data.count}`));
    } catch (err) {
      const data = previewFromUsers(users, audience);
      setPreview(data);
      setConfirmCount(String(data.count ?? ''));
      setInfo(t(`المستلمون (محلي): ${data.count}`, `Recipients (local): ${data.count}`));
      if (!users.length) setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const saveDraft = async () => {
    if (!form.name.trim()) {
      setError(t('اكتب اسم الحملة أولاً', 'Enter a campaign name first'));
      return;
    }
    setBusy('save');
    setError('');
    try {
      const payload = campaignPayload();
      let saved = null;
      try {
        if (draft?.id && draft.status === 'draft') {
          const data = await adminFetch(`/api/admin/outreach/campaigns/${draft.id}`, {
            method: 'PATCH',
            body: payload
          });
          saved = data.campaign;
        } else {
          const data = await adminFetch('/api/admin/outreach/campaigns', { method: 'POST', body: payload });
          saved = data.campaign;
        }
      } catch {
        const local = {
          name: form.name.trim(),
          channel: form.channel,
          subject: form.subject,
          htmlBody: payload.htmlBody,
          actionUrl: form.actionUrl,
          actionText: form.actionText,
          audience,
          previewCount: preview?.count || 0,
          status: 'draft',
          total: 0,
          pending: 0,
          sent: 0,
          failed: 0,
          skipped: 0,
          createdBy: { uid: currentUser?.uid, email: currentUser?.email }
        };
        if (draft?.id && draft.status === 'draft') {
          await updateDoc(doc(db, 'campaigns', draft.id), { ...local, updatedAt: serverTimestamp() });
          saved = { ...draft, ...local, id: draft.id, updatedAt: new Date().toISOString() };
        } else {
          const ref = await addDoc(collection(db, 'campaigns'), {
            ...local,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          saved = { ...local, id: ref.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        }
      }
      setDraft(saved);
      upsertCampaignInList(saved);
      setInfo(t('تم حفظ المسودة — يمكنك فتحها أو تعديلها أو حذفها من الجدول', 'Draft saved — open, edit, or delete it from the list'));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const openDraft = (c) => {
    setDraft(c);
    setForm(formFromCampaign(c));
    setSelectedUsers(selectedFromCampaign(c, users));
    setPreview(c.previewCount != null ? { count: c.previewCount, sample: [] } : null);
    setConfirmCount(c.previewCount != null ? String(c.previewCount) : '');
    setConfirmText('');
    setError('');
    setInfo(t('تم فتح المسودة للتعديل — احفظ بعد التغيير', 'Draft opened for editing — save after changes'));
    requestAnimationFrame(() => composeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const requestDeleteDraft = (c) => {
    if (!c?.id) return;
    setDeleteTarget({ id: c.id, name: c.name || '' });
  };

  const openCampaignDetails = async (c) => {
    if (!c?.id) return;
    setDetailsTarget({ campaign: c, recipients: [] });
    setDetailsLoading(true);
    try {
      const data = await adminFetch(`/api/admin/outreach/campaigns/${c.id}`);
      setDetailsTarget({ campaign: data.campaign || c, recipients: data.recipients || [] });
    } catch (err) {
      setError(err.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDeleteModal = () => {
    if (busy === 'delete') return;
    setDeleteTarget(null);
  };

  const deleteDraft = async (id) => {
    if (!id) return;
    setBusy('delete');
    setError('');
    try {
      try {
        await adminFetch(`/api/admin/outreach/campaigns/${id}`, { method: 'DELETE' });
      } catch {
        await deleteDoc(doc(db, 'campaigns', id));
      }
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
      if (draft?.id === id) resetCompose();
      setDeleteTarget(null);
      setInfo(t('تم حذف المسودة', 'Draft deleted'));
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
      const data = await adminFetch('/api/admin/outreach/campaigns/confirm', {
        method: 'POST',
        body: {
          ...campaignPayload(),
          confirmText,
          confirmCount: Number(confirmCount),
          sendNow: form.sendNow,
          scheduledAt: form.sendNow ? undefined : new Date(form.scheduledAt).toISOString()
        }
      });
      setDraft(data.campaign);
      setConfirmText('');
      setInfo(t('تم تأكيد الحملة ودخلت قائمة الإرسال', 'Campaign confirmed and queued'));
      await loadCore();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const abortCampaign = async (id) => {
    if (!window.confirm(t('إيقاف الحملة نهائياً؟', 'Abort this campaign?'))) return;
    setBusy('abort');
    try {
      await adminFetch(`/api/admin/outreach/campaigns/${id}`, { method: 'PATCH', body: { action: 'cancel' } });
      await loadCore();
    } catch (err) {
      try {
        await updateDoc(doc(db, 'campaigns', id), { status: 'cancelled', cancelledAt: serverTimestamp() });
        await loadCore();
      } catch {
        setError(err.message);
      }
    } finally {
      setBusy('');
    }
  };

  const backfill = async () => {
    setBusy('backfill');
    setError('');
    try {
      const data = await adminFetch('/api/admin/outreach/backfill-credits', { method: 'POST', body: {} });
      setInfo(t(`تمت مزامنة ${data.updated} من ${data.scanned} مستخدم`, `Synced ${data.updated} of ${data.scanned} users`));
      await loadCore();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const searchResults = useMemo(() => {
    const term = searchQ.trim().toLowerCase();
    if (!users || !users.length) return serverSearchResults;

    return (users || [])
      .filter((u) => {
        if (!u || u.role === 'admin' || u.role === 'super_admin') return false;
        if (searchTrialOnly && !matchesTrialAudience(u, true)) return false;
        if (!term) return true;
        const hay = `${u.name || ''} ${u.displayName || ''} ${u.fullName || ''} ${u.username || ''} ${u.email || ''} ${u.userEmail || ''} ${u.phoneNumber || ''} ${u.phone || ''} ${u.id || ''}`.toLowerCase();
        return hay.includes(term);
      })
      .slice(0, 50)
      .map((u) => ({
        id: u.id,
        name: u.name || u.displayName || u.fullName || u.email || '—',
        email: u.email || u.userEmail || '',
        phone: u.phoneNumber || u.phone || '',
        bucket: u.creditBucket || getCreditBucket(getConsumedCredits(u)),
        creditsUsed: getConsumedCredits(u)
      }));
  }, [users, searchQ, searchTrialOnly, serverSearchResults]);

  const searchPeople = async () => {
    if (users && users.length > 0) return;
    setBusy('search');
    try {
      const data = await adminFetch(`/api/admin/outreach/users?q=${encodeURIComponent(searchQ)}&trialOnly=${searchTrialOnly ? 'true' : 'false'}`);
      setServerSearchResults(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  const toggleUser = (user) => {
    setSelectedUsers((prev) => {
      if (prev.some((p) => p.id === user.id)) return prev.filter((p) => p.id !== user.id);
      return [...prev, user];
    });
    setPreview(null);
  };

  const selectAllVisible = () => {
    setSelectedUsers((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const toAdd = searchResults.filter((u) => !existingIds.has(u.id));
      return [...prev, ...toAdd];
    });
    setPreview(null);
  };

  const clearSelection = () => {
    setSelectedUsers([]);
    setPreview(null);
  };

  const whatsappReady = Boolean(status?.whatsapp?.enabled);
  const canConfirm = Boolean(
    form.name.trim() &&
    (form.channel !== 'email' || (form.subject.trim() && form.htmlBody.trim())) &&
    preview &&
    String(preview.count) === String(confirmCount) &&
    confirmText.trim().toUpperCase() === 'SEND'
  );
  const editingDraft = Boolean(draft?.id && draft.status === 'draft');
  const checks = [
    { ok: Boolean(form.name.trim()), label: t('اسم الحملة', 'Campaign name') },
    { ok: form.channel !== 'email' || Boolean(form.subject.trim() && form.htmlBody.trim()), label: t('نص الرسالة', 'Message content') },
    { ok: Boolean(preview), label: t('معاينة العدد', 'Preview count') },
    { ok: Boolean(preview && String(preview.count) === String(confirmCount)), label: t('العدد مطابق', 'Count matches') },
    { ok: confirmText.trim().toUpperCase() === 'SEND', label: 'SEND' }
  ];
  const maxSeg = Math.max(1, ...buckets.map((b) => b.count || 0));
  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: 'var(--text2)' };

  return (
    <div className="outreach-page">
      <div className="outreach-pill-row outreach-enter">
        <div className={`outreach-pill ${status?.emailConfigured ? 'is-ok' : 'is-warn'}`}>
          <span className="outreach-pill-dot" />
          <Mail size={15} />
          <div>
            <div className="outreach-pill-label">{t('البريد (Resend)', 'Email (Resend)')}</div>
            <div className="outreach-pill-sub">{status?.emailConfigured ? t('جاهز للإرسال', 'Ready to send') : t('أضف RESEND_API_KEY', 'Add RESEND_API_KEY')}</div>
          </div>
        </div>
        <div className={`outreach-pill ${whatsappReady ? 'is-ok' : 'is-warn'}`}>
          <span className="outreach-pill-dot" />
          <MessageCircle size={15} />
          <div>
            <div className="outreach-pill-label">WhatsApp</div>
            <div className="outreach-pill-sub">{whatsappReady ? t('قوالب مفعّلة', 'Templates on') : t('يحتاج قالب Twilio معتمد', 'Needs approved Twilio template')}</div>
          </div>
        </div>
        <div className={`outreach-pill ${status?.cronConfigured === true ? 'is-ok' : status?.cronConfigured === null ? 'is-warn' : 'is-off'}`}>
          <span className="outreach-pill-dot" />
          <Clock size={15} />
          <div>
            <div className="outreach-pill-label">{t('المجدول', 'Cron')}</div>
            <div className="outreach-pill-sub">
              {status?.cronConfigured === true
                ? t('مُؤمَّن', 'Secured')
                : status?.cronConfigured === null
                  ? t('تعذر التحقق الآن', 'Could not verify now')
                  : t('أضف CRON_SECRET', 'Set CRON_SECRET')}
            </div>
          </div>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={backfill} disabled={!!busy} style={{ marginInlineStart: 'auto' }}>
          <RefreshCw size={14} className={busy === 'backfill' ? 'outreach-spin' : undefined} />
          {t('مزامنة فئات الكريدت', 'Sync credit buckets')}
        </button>
      </div>

      {!whatsappReady && (
        <div className="outreach-banner warn outreach-enter outreach-enter-2">
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <button type="button" onClick={() => setWaHintOpen((v) => !v)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 800, padding: 0 }}>
              {t('واتساب غير مفعّل بعد — عرض التفاصيل', 'WhatsApp is not enabled yet — show details')}
            </button>
            {waHintOpen && (
              <p style={{ margin: '8px 0 0', opacity: 0.95 }}>
                {t(
                  'الإرسال عبر واتساب يحتاج TWILIO_ACCOUNT_SID و TWILIO_AUTH_TOKEN و TWILIO_WHATSAPP_FROM و قالب معتمد TWILIO_CONTENT_SID. الإيميل يعمل بدون ذلك.',
                  'WhatsApp send needs TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, and an approved TWILIO_CONTENT_SID. Email works without that.'
                )}
              </p>
            )}
          </div>
        </div>
      )}

      {quotaNotice && (
        <div className="outreach-banner warn outreach-enter">
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            {t(
              'حصة Firestore اليومية ممتلئة. تقدر تكمل تجهيز المسودات والمعاينة المحلية؛ الإرسال الجماعي قد ينتظر حتى ترجع الحصة أو ترقّي Blaze.',
              'Daily Firestore quota is full. You can still compose drafts and preview locally; bulk send may wait until quota resets or you upgrade to Blaze.'
            )}
          </div>
          <button type="button" className="outreach-banner-close" onClick={() => setQuotaNotice(false)} aria-label={t('إخفاء', 'Dismiss')}>✕</button>
        </div>
      )}

      {error && (
        <div className="outreach-banner err">
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>{error}</div>
          <button type="button" className="outreach-banner-close" onClick={() => setError('')} aria-label={t('إخفاء', 'Dismiss')}>✕</button>
        </div>
      )}
      {info && (
        <div className="outreach-banner ok">
          <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>{info}</div>
        </div>
      )}

      <div className="card outreach-enter outreach-enter-2" style={{ padding: '18px 20px' }}>
        <div className="flex-between" style={{ marginBottom: '14px', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>{t('فئات استهلاك كريدت التجربة', 'Trial credit-usage segments')}</h3>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: 4 }}>
              {t(`الإجمالي ضمن الفلتر: ${segmentTotal.toLocaleString()}`, `Total in filter: ${segmentTotal.toLocaleString()}`)}
            </div>
          </div>
          <label style={{ fontSize: '12px', display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--bg3)', padding: '8px 12px', borderRadius: 999, border: '1px solid var(--line)' }}>
            <input type="checkbox" checked={form.trialOnly} onChange={(e) => { setForm((f) => ({ ...f, trialOnly: e.target.checked })); setPreview(null); }} />
            {t('تجريبيون فقط', 'Trial users only')}
          </label>
        </div>
        <div className="outreach-seg-grid">
          {buckets.map((b) => {
            const active = form.audienceType === 'segment' && form.segment === b.key;
            return (
              <button
                key={b.key}
                type="button"
                className={`outreach-seg-card${active ? ' is-active' : ''}`}
                onClick={() => { setForm((f) => ({ ...f, audienceType: 'segment', segment: b.key })); setPreview(null); }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 700, lineHeight: 1.4 }}>{isRTL ? b.labelAr : b.labelEn}</div>
                <div className="outreach-seg-count">{(b.count || 0).toLocaleString()}</div>
                <div className="outreach-progress">
                  <span style={{ width: `${Math.round(((b.count || 0) / maxSeg) * 100)}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div ref={composeRef} className="card outreach-enter outreach-enter-3" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="flex-between" style={{ gap: '10px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800 }}>
              {editingDraft ? t('تعديل مسودة', 'Edit draft') : t('إنشاء حملة', 'Compose campaign')}
            </h3>
            {editingDraft && (
              <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: 4 }}>
                {t(`المسودة المفتوحة: ${draft.name || '—'}`, `Editing: ${draft.name || '—'}`)}
              </div>
            )}
          </div>
          {editingDraft && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={resetCompose} disabled={!!busy}>
                <Plus size={14} /> {t('مسودة جديدة', 'New draft')}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => requestDeleteDraft(draft)} disabled={!!busy}>
                <Trash2 size={14} /> {t('حذف المسودة', 'Delete draft')}
              </button>
            </div>
          )}
        </div>

        <div className="outreach-steps">
          <span className={`outreach-step${form.name.trim() ? ' is-on' : ''}`}><span className="outreach-step-num">1</span> {t('الرسالة', 'Message')}</span>
          <span className={`outreach-step${form.audienceType ? ' is-on' : ''}`}><span className="outreach-step-num">2</span> {t('الجمهور', 'Audience')}</span>
          <span className={`outreach-step${preview ? ' is-on' : ''}`}><span className="outreach-step-num">3</span> {t('المعاينة', 'Preview')}</span>
          <span className={`outreach-step${canConfirm ? ' is-on' : ''}`}><span className="outreach-step-num">4</span> {t('الإطلاق', 'Launch')}</span>
        </div>

        <div className="outreach-compose-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>{t('اسم الحملة (داخلي)', 'Internal name')}</label>
            <input className="form-control" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder={t('مثال: تذكير التجربة', 'e.g. Trial reminder')} />
          </div>
          <div>
            <label style={labelStyle}>{t('القناة', 'Channel')}</label>
            <select
              className="form-control"
              value={form.channel}
              onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))}
            >
              <option value="email">{t('إيميل عبر Resend', 'Email via Resend')}</option>
              <option value="whatsapp" disabled={!whatsappReady}>
                WhatsApp {whatsappReady ? '' : t('(غير مفعّل)', '(disabled)')}
              </option>
            </select>
          </div>
        </div>

        {form.channel === 'email' && (
          <>
            <div>
              <label style={labelStyle}>{t('عنوان الرسالة', 'Subject')}</label>
              <input className="form-control" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="{{name}} — ..." />
            </div>
            <div>
              <label style={labelStyle}>{t('نص الرسالة (يدعم {{name}})', 'Body (supports {{name}})')}</label>
              <textarea className="form-control" rows={7} value={form.htmlBody} onChange={(e) => setForm((f) => ({ ...f, htmlBody: e.target.value }))} placeholder={t('اكتب الرسالة هنا…', 'Write the message here…')} />
            </div>
            <div className="outreach-compose-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input className="form-control" placeholder={t('رابط الزر (اختياري)', 'Button URL (optional)')} value={form.actionUrl} onChange={(e) => setForm((f) => ({ ...f, actionUrl: e.target.value }))} />
              <input className="form-control" placeholder={t('نص الزر', 'Button label')} value={form.actionText} onChange={(e) => setForm((f) => ({ ...f, actionText: e.target.value }))} />
            </div>
          </>
        )}

        <div>
          <label style={labelStyle}>{t('الجمهور', 'Audience')}</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: t('كل المستخدمين (ضمن الفلتر)', 'Everyone in filter') },
              { id: 'segment', label: t('فئة كريدت', 'Credit segment') },
              { id: 'selected', label: t('أشخاص محددون', 'Specific people') }
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

        {form.audienceType === 'selected' && (
          <div style={{ border: '1px solid var(--line)', borderRadius: '14px', padding: '14px', background: 'var(--bg3)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <Search size={14} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input
                  className="form-control"
                  style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '32px', [isRTL ? 'paddingLeft' : 'paddingRight']: searchQ ? '32px' : '12px' }}
                  placeholder={t('ابحث بالاسم، البريد الإلكتروني، أو رقم الهاتف...', 'Search name, email, or phone...')}
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') searchPeople(); }}
                />
                {searchQ && (
                  <button
                    type="button"
                    onClick={() => setSearchQ('')}
                    style={{ position: 'absolute', [isRTL ? 'left' : 'right']: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '13px', padding: '2px' }}
                    title={t('مسح البحث', 'Clear search')}
                  >
                    ✕
                  </button>
                )}
              </div>
              <label style={{ fontSize: '12px', display: 'flex', gap: '6px', alignItems: 'center', color: 'var(--text2)', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={searchTrialOnly}
                  onChange={(e) => setSearchTrialOnly(e.target.checked)}
                />
                {t('تجريبيون فقط', 'Trial only')}
              </label>
              {searchResults.length > 0 && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={selectAllVisible}>
                  {t('تحديد المعروضين', 'Select all shown')}
                </button>
              )}
              {selectedUsers.length > 0 && (
                <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={clearSelection}>
                  {t('مسح التحديد', 'Clear selection')}
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
              {searchResults.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px' }}>
                  {t('لا توجد نتائج مطابقة لبحثك', 'No users found matching your search')}
                </div>
              ) : (
                searchResults.map((u) => {
                  const isSelected = selectedUsers.some((s) => s.id === u.id);
                  return (
                    <div
                      key={u.id}
                      onClick={() => toggleUser(u)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '10px',
                        background: isSelected ? 'rgba(236,92,49,0.12)' : 'rgba(255,255,255,0.03)',
                        border: isSelected ? '1px solid var(--accent)' : '1px solid var(--line)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'start' }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text)' }}>
                          {u.name}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text3)' }}>
                          {u.email || t('بدون إيميل', 'No email')} {u.phone ? `· 📱 ${u.phone}` : ''} · <span style={{ color: 'var(--orange)' }}>{u.creditsUsed} cr ({u.bucket})</span>
                        </div>
                      </div>
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isSelected ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                          color: isSelected ? '#fff' : 'var(--text3)',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          flexShrink: 0
                        }}
                      >
                        {isSelected ? '✓' : '+'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {selectedUsers.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px', borderTop: '1px solid var(--line)', paddingTop: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)' }}>
                  {t(`تم اختيار ${selectedUsers.length} مستخدم:`, `Selected ${selectedUsers.length} users:`)}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '100px', overflowY: 'auto' }}>
                  {selectedUsers.map((u) => (
                    <span
                      key={u.id}
                      style={{
                        fontSize: '11px',
                        background: 'rgba(236,92,49,0.15)',
                        border: '1px solid rgba(236,92,49,0.3)',
                        borderRadius: '999px',
                        padding: '3px 10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--text)'
                      }}
                    >
                      {u.name || u.email}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleUser(u); }}
                        style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: 0, fontSize: '11px', fontWeight: 'bold' }}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            className={form.sendNow ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
            onClick={() => setForm((f) => ({ ...f, sendNow: true }))}
          >
            <Send size={13} /> {t('إرسال بعد التأكيد مباشرة', 'Send after confirm')}
          </button>
          <button
            type="button"
            className={!form.sendNow ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
            onClick={() => setForm((f) => ({ ...f, sendNow: false }))}
          >
            <Clock size={13} /> {t('جدولة', 'Schedule')}
          </button>
          {!form.sendNow && (
            <input
              type="datetime-local"
              className="form-control"
              style={{ maxWidth: '240px' }}
              value={form.scheduledAt}
              onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
            />
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-ghost" onClick={runPreview} disabled={!!busy}>
            <Users size={16} className={busy === 'preview' ? 'outreach-spin' : undefined} />
            {t('معاينة العدد', 'Preview count')} {preview ? `(${preview.count})` : ''}
          </button>
          <button type="button" className="btn btn-ghost" onClick={saveDraft} disabled={!!busy || !form.name.trim()}>
            {editingDraft ? t('حفظ التعديلات', 'Save changes') : t('حفظ مسودة', 'Save draft')}
          </button>
        </div>

        {preview && (
          <div style={{ background: 'var(--bg3)', borderRadius: '14px', padding: '12px 14px', fontSize: '13px', border: '1px solid var(--line)' }}>
            <strong>{t(`جاهز للإرسال إلى ${preview.count} مستلم`, `Ready to send to ${preview.count} recipients`)}</strong>
            <ul style={{ margin: '8px 0 0', paddingInlineStart: '18px', color: 'var(--text2)' }}>
              {preview.sample?.map((u) => (
                <li key={u.id}>{u.name} — {u.email} ({u.bucket}, {u.creditsUsed} cr)</li>
              ))}
            </ul>
          </div>
        )}

        <div className="outreach-launch">
          <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '10px' }}>
            {t('تأكيد الإطلاق — اكتب العدد ثم SEND', 'Confirm launch — type the count then SEND')}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px', marginBottom: '12px' }}>
            {checks.map((c) => (
              <span key={c.label} className={`outreach-check${c.ok ? ' is-done' : ''}`}>
                <CheckCircle2 size={14} /> {c.label}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input className="form-control" style={{ maxWidth: '120px' }} placeholder={t('العدد', 'Count')} value={confirmCount} onChange={(e) => setConfirmCount(e.target.value)} />
            <input className="form-control" style={{ maxWidth: '140px', letterSpacing: '0.12em', fontWeight: 800 }} placeholder="SEND" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
            <button type="button" className="btn btn-primary" onClick={confirmSend} disabled={!canConfirm || !!busy}>
              <Send size={16} className={busy === 'confirm' ? 'outreach-spin' : undefined} />
              {busy === 'confirm' ? t('جارٍ الإطلاق…', 'Launching…') : t('تأكيد وإطلاق', 'Confirm & launch')}
            </button>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '10px' }}>
            {t('حفظ المسودة اختياري. الإرسال يتم من الخادم فقط.', 'Saving a draft is optional. Sending happens on the server only.')}
          </div>
        </div>
      </div>

      <div className="card outreach-enter outreach-enter-4" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{t('الحملات', 'Campaigns')}</span>
          <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>{campaigns.length}</span>
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
                    {t('لا توجد حملات بعد — احفظ مسودة للبدء', 'No campaigns yet — save a draft to start')}
                  </td>
                </tr>
              ) : campaigns.map((c) => {
                const meta = campaignStatusMeta(c.status, t);
                const total = c.total || c.previewCount || 0;
                const pct = total ? Math.min(100, Math.round(((c.sent || 0) / total) * 100)) : 0;
                const isOpen = draft?.id === c.id;
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--line)', background: isOpen ? 'rgba(236,92,49,0.06)' : 'transparent', transition: 'background 0.2s ease' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700 }}>{c.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: 3 }}>
                        {c.channel === 'whatsapp' ? 'WhatsApp' : t('إيميل', 'Email')} · {audienceLabel(c, t)}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`outreach-status-badge ${meta.className}`}>{meta.label}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text2)', minWidth: 160 }}>
                      <div>{c.sent || 0}/{total} {t('أُرسل', 'sent')} · {c.failed || 0} {t('فشل', 'failed')}</div>
                      <div className="outreach-progress"><span style={{ width: `${pct}%` }} /></div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => openCampaignDetails(c)}
                          title={t('عرض تفاصيل المستلمين والأخطاء', 'View recipient details & error logs')}
                        >
                          👁️ {t('التفاصيل', 'Details')}
                        </button>
                        {['sending', 'scheduled', 'paused'].includes(c.status) && (
                          <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => abortCampaign(c.id)}>
                            <Ban size={14} /> {t('إيقاف', 'Abort')}
                          </button>
                        )}
                        {c.status === 'draft' && (
                          <button type="button" className="btn btn-ghost btn-sm" onClick={() => openDraft(c)} disabled={!!busy}>
                            <Pencil size={13} /> {t('تعديل', 'Edit')}
                          </button>
                        )}
                        {c.status !== 'sending' && (
                          <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={() => requestDeleteDraft(c)} disabled={!!busy} title={t('حذف الحملة', 'Delete campaign')}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {detailsTarget && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="campaign-details-title"
          onClick={() => setDetailsTarget(null)}
        >
          <div
            className="modal-card"
            style={{ maxWidth: '680px', width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ borderBottom: '1px solid var(--line)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(236,92,49,0.12)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}>
                  📊
                </div>
                <div>
                  <h3 id="campaign-details-title" style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                    {detailsTarget.campaign?.name || t('تفاصيل الحملة', 'Campaign Details')}
                  </h3>
                  <div style={{ fontSize: '11.5px', color: 'var(--text3)', marginTop: '2px' }}>
                    {detailsTarget.campaign?.channel === 'whatsapp' ? 'WhatsApp' : 'Email'} · {detailsTarget.campaign?.createdAt ? new Date(detailsTarget.campaign.createdAt).toLocaleString(isRTL ? 'ar-EG' : 'en-US') : ''}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setDetailsTarget(null)}
                aria-label={t('إغلاق', 'Close')}
              >
                ✕
              </button>
            </div>

            <div className="modal-body" style={{ overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Quick metrics grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <div style={{ background: 'var(--bg3)', padding: '10px', borderRadius: '10px', border: '1px solid var(--line)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{t('المستهدفون', 'Total')}</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>{detailsTarget.campaign?.total || detailsTarget.campaign?.previewCount || 0}</div>
                </div>
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.25)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--green)' }}>{t('أُرسل', 'Sent')}</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--green)' }}>{detailsTarget.campaign?.sent || 0}</div>
                </div>
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.25)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--red)' }}>{t('فشل', 'Failed')}</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--red)' }}>{detailsTarget.campaign?.failed || 0}</div>
                </div>
                <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.25)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--amber)' }}>{t('تخطي', 'Skipped')}</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--amber)' }}>{detailsTarget.campaign?.skipped || 0}</div>
                </div>
              </div>

              {/* Subject & Body Preview */}
              {detailsTarget.campaign?.subject && (
                <div style={{ background: 'var(--bg3)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--line)', fontSize: '12.5px' }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--text2)' }}>{t('عنوان الرسالة:', 'Subject:')} {detailsTarget.campaign.subject}</div>
                </div>
              )}

              {/* Recipients list */}
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13.5px', fontWeight: 800 }}>
                  {t('سجل المستلمين والأخطاء:', 'Recipient Logs & Errors:')}
                </h4>
                {detailsLoading ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)' }}>
                    {t('جارٍ تحميل السجل…', 'Loading logs…')}
                  </div>
                ) : !detailsTarget.recipients || detailsTarget.recipients.length === 0 ? (
                  <div style={{ padding: '18px', textAlign: 'center', color: 'var(--text3)', background: 'var(--bg3)', borderRadius: '10px', fontSize: '12px' }}>
                    {t('لا توجد سجلات مستلمين مسجلة لهذه الحملة بعد', 'No recipient logs found for this campaign')}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {detailsTarget.recipients.map((rec) => {
                      const isSent = rec.status === 'sent';
                      const isFailed = rec.status === 'failed';
                      const isSkipped = rec.status === 'skipped';
                      return (
                        <div
                          key={rec.id || rec.userId}
                          style={{
                            background: isFailed ? 'rgba(239, 68, 68, 0.06)' : isSent ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg3)',
                            border: isFailed ? '1px solid rgba(239, 68, 68, 0.25)' : isSent ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--line)',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text)' }}>
                              {rec.name || rec.email || rec.phone || rec.userId}
                            </div>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: isSent ? 'rgba(16, 185, 129, 0.15)' : isFailed ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: isSent ? 'var(--green)' : isFailed ? 'var(--red)' : 'var(--amber)'
                              }}
                            >
                              {isSent ? `✅ ${t('تم الإرسال', 'Sent')}` : isFailed ? `❌ ${t('فشل', 'Failed')}` : `⚠️ ${t('تم التخطي', 'Skipped')}`}
                            </span>
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text3)' }}>
                            {rec.email && <span>📧 {rec.email}</span>}
                            {rec.phone && <span> · 📱 {rec.phone}</span>}
                          </div>
                          {rec.error && (
                            <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', color: 'var(--red)', lineHeight: 1.5 }}>
                              <strong>{t('سبب الفشل من المزود:', 'Error from provider:')}</strong> {rec.error}
                              {String(rec.error).includes('testing emails') && (
                                <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text2)' }}>
                                  💡 {t('ملاحظة: حساب Resend التجريبي يسمح فقط بالإرسال لنفس الإيميل المسجل في حساب Resend. للإرسال لجميع الإيميلات يجب توثيق النطاق على resend.com/domains.', 'Note: Free Resend test keys only allow sending to the email registered in Resend. To send to any recipient, verify your domain on resend.com/domains.')}
                                </div>
                              )}
                            </div>
                          )}
                          {rec.skipReason && (
                            <div style={{ fontSize: '11.5px', color: 'var(--amber)' }}>
                              ℹ️ {t('سبب التخطي:', 'Skip reason:')} {rec.skipReason}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'flex-end', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setDetailsTarget(null)}>
                {t('إغلاق', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-draft-title"
          onClick={closeDeleteModal}
        >
          <div
            className="modal-card"
            style={{ maxWidth: '440px', width: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(239,68,68,0.14)',
                  color: 'var(--red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Trash2 size={20} />
                </div>
                <h3 id="delete-draft-title" style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>
                  {t('حذف الحملة', 'Delete campaign')}
                </h3>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={closeDeleteModal}
                disabled={busy === 'delete'}
                aria-label={t('إغلاق', 'Close')}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.75, color: 'var(--text)' }}>
                {t('حذف هذه الحملة؟ لا يمكن التراجع.', 'Delete this campaign? This cannot be undone.')}
              </p>
              {deleteTarget.name ? (
                <div style={{
                  marginTop: '14px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'var(--bg3)',
                  border: '1px solid var(--line)',
                  fontSize: '13px',
                  fontWeight: 700
                }}>
                  {deleteTarget.name}
                </div>
              ) : null}
            </div>
            <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={closeDeleteModal} disabled={busy === 'delete'}>
                {t('إلغاء', 'Cancel')}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => deleteDraft(deleteTarget.id)}
                disabled={busy === 'delete'}
                style={{
                  background: 'var(--red)',
                  color: '#fff',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Trash2 size={15} />
                {busy === 'delete' ? t('جارٍ الحذف…', 'Deleting…') : t('حذف الحملة', 'Delete campaign')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
