import { db } from '@/lib/firebase';
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';

export const PUBLISHED_SITES = 'published_sites';
export const SITE_DOMAINS = 'site_domains';

export function normalizeHost(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/:\d+$/, '')
    .replace(/\.$/, '');
}

export function normalizePath(input) {
  const raw = String(input || '/').trim() || '/';
  const withSlash = raw.startsWith('/') ? raw : `/${raw}`;
  if (withSlash.length > 1 && withSlash.endsWith('/')) return withSlash.slice(0, -1);
  return withSlash;
}

export function getCnameTarget() {
  return (
    process.env.NEXT_PUBLIC_SITES_CNAME ||
    (typeof window !== 'undefined' ? window.location.hostname : 'cname.vercel-dns.com')
  );
}

export function isApexDomain(host) {
  const parts = normalizeHost(host).split('.').filter(Boolean);
  return parts.length === 2;
}

export function getStepPath(step, fallbackIdx = 0) {
  if (step?.path) return normalizePath(step.path);
  return fallbackIdx === 0 ? '/' : `/page-${fallbackIdx + 1}`;
}

export function getEntitySteps(entity) {
  if (Array.isArray(entity?.steps) && entity.steps.length) return entity.steps;
  if (Array.isArray(entity?.pages) && entity.pages.length) return entity.pages;
  return [];
}

export function getProductionUrls({ origin, funnel, stepIdx = 0 }) {
  const steps = getEntitySteps(funnel);
  const step = steps[stepIdx] || steps[0];
  const stepPath = getStepPath(step, stepIdx);
  const isStore = funnel?.kind === 'store' || String(funnel?.id || '').startsWith('store_') || Array.isArray(funnel?.products);
  const appPublished = `${origin}/s/${encodeURIComponent(funnel?.id || '')}${stepPath === '/' ? '' : stepPath}`;
  const saved = isStore
    ? `${origin}/preview-site?storeId=${encodeURIComponent(funnel?.id || '')}&pageIdx=${stepIdx}&draft=1`
    : `${origin}/preview-site?funnelId=${encodeURIComponent(funnel?.id || '')}&stepIdx=${stepIdx}&draft=1`;
  const domain = normalizeHost(funnel?.domain);
  const custom = domain ? `https://${domain}${stepPath === '/' ? '' : stepPath}` : '';
  return {
    saved,
    published: custom || appPublished,
    appPublished,
    custom
  };
}

export function pickPublishedStep(site, { stepIdx, path } = {}) {
  const steps = site?.steps || site?.pages || [];
  if (!steps.length) return null;
  const wanted = path ? normalizePath(path) : '';
  if (wanted && wanted !== '/') {
    const byPath = steps.find((s) => normalizePath(s.path) === wanted);
    if (byPath) return byPath;
  }
  if (Number.isFinite(stepIdx) && steps[stepIdx]) return steps[stepIdx];
  if (Number.isFinite(site?.defaultStepIdx) && steps[site.defaultStepIdx]) return steps[site.defaultStepIdx];
  return steps.find((s) => s.published) || steps[0] || null;
}

export async function publishFunnelPublic({ funnel, ownerUid, defaultStepIdx = 0 }) {
  if (!funnel?.id) throw new Error('Missing funnel');
  const steps = (funnel.steps || []).map((step) => ({
    id: step.id,
    name: step.name || 'Page',
    path: getStepPath(step),
    published: !!step.published,
    publishedAt: step.publishedAt || null,
    publishedCanvas: step.publishedCanvas || [],
    publishedPage: step.publishedPage || step.page || {}
  }));

  await setDoc(doc(db, PUBLISHED_SITES, funnel.id), {
    ownerUid: ownerUid || '',
    kind: 'funnel',
    funnelId: funnel.id,
    name: funnel.name || '',
    domain: normalizeHost(funnel.domain),
    domainStatus: funnel.domainStatus || (funnel.domain ? 'pending' : ''),
    defaultStepIdx,
    steps,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

export function storePagesToPublishedSteps(store, { publishAll = true } = {}) {
  return (store?.pages || []).map((page) => {
    const published = publishAll || !!page.published;
    return {
      id: page.id,
      name: page.name || 'Page',
      path: getStepPath(page),
      type: page.type || 'catalog',
      published,
      publishedAt: page.publishedAt || (published ? new Date().toISOString() : null),
      publishedCanvas: published
        ? JSON.parse(JSON.stringify(page.publishedCanvas || page.canvas || []))
        : [],
      publishedPage: published
        ? JSON.parse(JSON.stringify(page.publishedPage || page.page || {}))
        : {},
      canvas: JSON.parse(JSON.stringify(page.canvas || [])),
      page: JSON.parse(JSON.stringify(page.page || {}))
    };
  });
}

export function prepareStoreForPublish(store) {
  const nowIso = new Date().toISOString();
  const pages = (store?.pages || []).map((page) => ({
    ...page,
    published: true,
    publishedAt: nowIso,
    publishedCanvas: JSON.parse(JSON.stringify(page.canvas || page.publishedCanvas || [])),
    publishedPage: JSON.parse(JSON.stringify(page.page || page.publishedPage || {}))
  }));
  return {
    ...store,
    kind: 'store',
    published: true,
    publishedAt: nowIso,
    lastUpdated: new Date().toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    pages
  };
}

export async function publishStorePublic({ store, ownerUid, defaultPageIdx = 0 }) {
  if (!store?.id) throw new Error('Missing store');
  const steps = storePagesToPublishedSteps(store, { publishAll: true });
  const products = JSON.parse(JSON.stringify(store.products || []));
  const settings = JSON.parse(JSON.stringify(store.settings || {}));

  await setDoc(doc(db, PUBLISHED_SITES, store.id), {
    ownerUid: ownerUid || '',
    kind: 'store',
    storeId: store.id,
    funnelId: store.id,
    name: store.name || '',
    domain: normalizeHost(store.domain),
    domainStatus: store.domainStatus || (store.domain ? 'pending' : ''),
    defaultStepIdx: defaultPageIdx,
    steps,
    pages: steps,
    products,
    settings,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

export function publishedSiteToStore(data, fallbackId = '') {
  if (!data) return null;
  const pages = (data.pages || data.steps || []).map((page) => ({
    ...page,
    canvas: page.publishedCanvas || page.canvas || [],
    page: page.publishedPage || page.page || {}
  }));
  return {
    id: data.storeId || data.funnelId || fallbackId,
    name: data.name || 'Store',
    domain: data.domain || '',
    domainStatus: data.domainStatus || '',
    pages,
    products: data.products || [],
    settings: data.settings || {},
    sales: data.sales || [],
    published: true,
    kind: 'store'
  };
}

export async function connectFunnelDomain({ funnelId, ownerUid, host, previousHost }) {
  const normalized = normalizeHost(host);
  const prev = normalizeHost(previousHost);
  if (prev && prev !== normalized) {
    try { await deleteDoc(doc(db, SITE_DOMAINS, prev)); } catch {}
  }
  if (!normalized) {
    if (prev) {
      try { await deleteDoc(doc(db, SITE_DOMAINS, prev)); } catch {}
    }
    return { host: '' };
  }

  const existing = await getDoc(doc(db, SITE_DOMAINS, normalized));
  if (existing.exists() && existing.data()?.funnelId && existing.data().funnelId !== funnelId) {
    throw new Error('This domain is already connected to another website.');
  }

  await setDoc(doc(db, SITE_DOMAINS, normalized), {
    host: normalized,
    funnelId,
    ownerUid: ownerUid || '',
    status: 'pending',
    updatedAt: new Date().toISOString()
  }, { merge: true });

  return { host: normalized };
}

export async function markDomainStatus(host, status, extra = {}) {
  const normalized = normalizeHost(host);
  if (!normalized) return;
  await setDoc(doc(db, SITE_DOMAINS, normalized), {
    host: normalized,
    status,
    checkedAt: new Date().toISOString(),
    ...extra
  }, { merge: true });
}
