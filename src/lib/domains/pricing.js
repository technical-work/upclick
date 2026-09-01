import { FieldValue } from 'firebase-admin/firestore';
import {
  computeCustomerPrice,
  DEFAULT_MARKUP,
  DEFAULT_MARKUP_TYPE,
  DEFAULT_TLD_COSTS,
  roundMoney,
  SUGGESTED_TLDS
} from './constants';
import { NamecheapService } from './namecheap';

const COLLECTION = 'domain_pricing';

export function toPublicPricing(row) {
  if (!row || row.enabled === false) return null;
  return {
    extension: row.extension,
    registration_price: roundMoney(row.registration_price),
    renewal_price: roundMoney(row.renewal_price),
    transfer_price: roundMoney(row.transfer_price),
    enabled: true,
    currency: row.currency || 'USD'
  };
}

export function toAdminPricing(row) {
  const registrar = roundMoney(row.registrar_price);
  const registration = roundMoney(row.registration_price);
  return {
    id: row.id || row.extension,
    extension: row.extension,
    registrar_price: registrar,
    registration_price: registration,
    renewal_price: roundMoney(row.renewal_price),
    transfer_price: roundMoney(row.transfer_price),
    markup: Number(row.markup) || DEFAULT_MARKUP,
    markup_type: row.markup_type || DEFAULT_MARKUP_TYPE,
    enabled: row.enabled !== false,
    currency: row.currency || 'USD',
    profit: roundMoney(registration - registrar),
    created_at: row.created_at || null,
    updated_at: row.updated_at || null
  };
}

function buildRow(tld, costs, settings = {}) {
  const markup = settings.markup != null ? Number(settings.markup) : DEFAULT_MARKUP;
  const markupType = settings.markup_type || DEFAULT_MARKUP_TYPE;
  const registrar = roundMoney(costs.registrar_price);
  const renewalCost = roundMoney(costs.renewal_cost ?? costs.registrar_price);
  const transferCost = roundMoney(costs.transfer_cost ?? costs.registrar_price);
  return {
    extension: tld,
    registrar_price: registrar,
    renewal_cost: renewalCost,
    transfer_cost: transferCost,
    markup,
    markup_type: markupType,
    registration_price: computeCustomerPrice(registrar, markup, markupType),
    renewal_price: computeCustomerPrice(renewalCost, markup, markupType),
    transfer_price: computeCustomerPrice(transferCost, markup, markupType),
    enabled: true,
    currency: 'USD',
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp()
  };
}

export async function getSettings(adminDb) {
  const snap = await adminDb.collection('domain_settings').doc('global').get();
  const data = snap.exists ? snap.data() : {};
  return {
    markup: data.markup != null ? Number(data.markup) : DEFAULT_MARKUP,
    markup_type: data.markup_type || DEFAULT_MARKUP_TYPE,
    suggested_tlds: Array.isArray(data.suggested_tlds) && data.suggested_tlds.length
      ? data.suggested_tlds
      : SUGGESTED_TLDS,
    currency: data.currency || 'USD',
    whois_guard: data.whois_guard !== false
  };
}

export async function ensureDefaultPricing(adminDb) {
  const settings = await getSettings(adminDb);
  const existing = await adminDb.collection(COLLECTION).limit(1).get();
  if (!existing.empty) return;

  const batch = adminDb.batch();
  Object.entries(DEFAULT_TLD_COSTS).forEach(([tld, costs]) => {
    const ref = adminDb.collection(COLLECTION).doc(tld);
    batch.set(ref, buildRow(tld, costs, settings));
  });
  await batch.commit();
}

export async function listPricing(adminDb, { enabledOnly = false } = {}) {
  await ensureDefaultPricing(adminDb);
  const snap = await adminDb.collection(COLLECTION).get();
  let rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (enabledOnly) rows = rows.filter((r) => r.enabled !== false);
  rows.sort((a, b) => String(a.extension).localeCompare(String(b.extension)));
  return rows;
}

export async function getPricingForTld(adminDb, tld) {
  const ext = String(tld || '').toLowerCase();
  if (!ext) return null;
  await ensureDefaultPricing(adminDb);
  const snap = await adminDb.collection(COLLECTION).doc(ext).get();
  if (snap.exists) return { id: snap.id, ...snap.data() };
  const fallback = DEFAULT_TLD_COSTS[ext];
  if (!fallback) return null;
  const settings = await getSettings(adminDb);
  return buildRow(ext, fallback, settings);
}

export async function upsertPricing(adminDb, extension, patch = {}) {
  const ext = String(extension || '').replace(/^\./, '').toLowerCase();
  if (!ext) throw new Error('Extension is required');
  const ref = adminDb.collection(COLLECTION).doc(ext);
  const prevSnap = await ref.get();
  const prev = prevSnap.exists ? prevSnap.data() : {};
  const settings = await getSettings(adminDb);

  const markup = patch.markup != null ? Number(patch.markup) : (prev.markup ?? settings.markup);
  const markupType = patch.markup_type || prev.markup_type || settings.markup_type;
  const registrar = patch.registrar_price != null ? Number(patch.registrar_price) : Number(prev.registrar_price) || 0;
  const renewalCost = patch.renewal_cost != null ? Number(patch.renewal_cost) : Number(prev.renewal_cost ?? registrar);
  const transferCost = patch.transfer_cost != null ? Number(patch.transfer_cost) : Number(prev.transfer_cost ?? registrar);

  const registrationPrice = patch.registration_price != null
    ? roundMoney(patch.registration_price)
    : computeCustomerPrice(registrar, markup, markupType, prev.registration_price && patch.markup == null && patch.markup_type == null ? prev.registration_price : undefined);
  const renewalPrice = patch.renewal_price != null
    ? roundMoney(patch.renewal_price)
    : computeCustomerPrice(renewalCost, markup, markupType, prev.renewal_price && patch.markup == null ? prev.renewal_price : undefined);
  const transferPrice = patch.transfer_price != null
    ? roundMoney(patch.transfer_price)
    : computeCustomerPrice(transferCost, markup, markupType, prev.transfer_price && patch.markup == null ? prev.transfer_price : undefined);

  const next = {
    extension: ext,
    registrar_price: roundMoney(registrar),
    renewal_cost: roundMoney(renewalCost),
    transfer_cost: roundMoney(transferCost),
    markup: Number.isFinite(Number(markup)) ? Number(markup) : DEFAULT_MARKUP,
    markup_type: markupType || DEFAULT_MARKUP_TYPE,
    registration_price: registrationPrice,
    renewal_price: renewalPrice,
    transfer_price: transferPrice,
    enabled: patch.enabled != null ? Boolean(patch.enabled) : (prev.enabled !== false),
    currency: patch.currency || prev.currency || 'USD',
    updated_at: FieldValue.serverTimestamp()
  };
  if (!prevSnap.exists) next.created_at = FieldValue.serverTimestamp();
  await ref.set(next, { merge: true });
  const saved = await ref.get();
  return { id: saved.id, ...saved.data() };
}

export async function refreshRegistrarCosts(adminDb) {
  if (!NamecheapService.isConfigured()) {
    throw new Error('Namecheap is not configured');
  }
  const rows = await listPricing(adminDb);
  const tlds = rows.map((r) => r.extension);
  const remote = await NamecheapService.getDomainPricing(tlds);
  const byTld = Object.fromEntries(remote.map((r) => [r.tld, r]));
  const updated = [];
  for (const row of rows) {
    const hit = byTld[row.extension];
    if (!hit) continue;
    const saved = await upsertPricing(adminDb, row.extension, {
      registrar_price: hit.register || row.registrar_price,
      renewal_cost: hit.renew || row.renewal_cost,
      transfer_cost: hit.transfer || row.transfer_cost,
      registration_price: row.registration_price,
      renewal_price: row.renewal_price,
      transfer_price: row.transfer_price,
      markup: row.markup,
      markup_type: row.markup_type,
      enabled: row.enabled
    });
    updated.push(saved);
  }
  return updated;
}

export function customerPriceFor(row, kind = 'registration', premiumPrice) {
  if (premiumPrice && Number(premiumPrice) > 0) {
    return computeCustomerPrice(premiumPrice, row?.markup, row?.markup_type);
  }
  if (kind === 'renewal') return roundMoney(row?.renewal_price);
  if (kind === 'transfer') return roundMoney(row?.transfer_price);
  return roundMoney(row?.registration_price);
}

export function registrarCostFor(row, kind = 'registration', premiumPrice) {
  if (premiumPrice && Number(premiumPrice) > 0) return roundMoney(premiumPrice);
  if (kind === 'renewal') return roundMoney(row?.renewal_cost ?? row?.registrar_price);
  if (kind === 'transfer') return roundMoney(row?.transfer_cost ?? row?.registrar_price);
  return roundMoney(row?.registrar_price);
}
