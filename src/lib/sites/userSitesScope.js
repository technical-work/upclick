export const LEGACY_FUNNELS_KEY = 'upklick_funnels_v1';
export const LEGACY_STORES_KEY = 'upklick_stores_v1';

export function funnelsStorageKey(uid) {
  return uid ? `${LEGACY_FUNNELS_KEY}_${uid}` : LEGACY_FUNNELS_KEY;
}

export function storesStorageKey(uid) {
  return uid ? `${LEGACY_STORES_KEY}_${uid}` : LEGACY_STORES_KEY;
}

export function stampSiteOwner(item, uid) {
  if (!item || !uid) return item;
  if (item.ownerUid === uid) return item;
  return { ...item, ownerUid: uid };
}

export function listsHaveSameItems(a, b) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

const DEMO_SITE_IDS = new Set(['f1', 'f2', 'store_1', 'store_2', 'store_3', 'store_4']);

export function isSiteOwnedByUser(item, uid) {
  if (!item || !uid) return false;
  if (DEMO_SITE_IDS.has(String(item.id))) return false;
  const owner = item.ownerUid || item.createdBy || '';
  return owner === uid;
}

export function sitesForUser(list, uid) {
  return (Array.isArray(list) ? list : [])
    .filter((item) => isSiteOwnedByUser(item, uid))
    .map((item) => stampSiteOwner(item, uid));
}

/** Load from this user's Firestore document. Never keep another account's items.
 *  Untagged legacy items are kept only when the document has no foreign-owned rows. */
export function sitesFromAccountDocument(list, uid) {
  const arr = Array.isArray(list) ? list : [];
  if (!uid) return [];
  const owned = sitesForUser(arr, uid);
  const foreign = arr.filter((item) => {
    const owner = item?.ownerUid || item?.createdBy || '';
    return owner && owner !== uid && !DEMO_SITE_IDS.has(String(item.id));
  });
  if (owned.length || foreign.length) return owned;
  return arr
    .filter((item) => item && !DEMO_SITE_IDS.has(String(item.id)) && !item.ownerUid && !item.createdBy)
    .map((item) => stampSiteOwner(item, uid));
}

export function mergeUserSites(existing = [], mine = [], uid) {
  const stamped = (Array.isArray(mine) ? mine : [])
    .filter((item) => item)
    .map((item) => stampSiteOwner(item, uid));
  return stamped;
}

export function readJsonList(key) {
  if (typeof window === 'undefined' || !key) return [];
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeJsonList(key, list) {
  if (typeof window === 'undefined' || !key) return;
  localStorage.setItem(key, JSON.stringify(list || []));
}

export function clearLegacySiteKeys() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LEGACY_FUNNELS_KEY);
  localStorage.removeItem(LEGACY_STORES_KEY);
}

export function findLocalStoreById(storeId) {
  if (!storeId || typeof window === 'undefined') return null;
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(LEGACY_STORES_KEY)) continue;
      const found = readJsonList(key).find((s) => s?.id === storeId);
      if (found) return found;
    }
  } catch {
    return null;
  }
  return null;
}

export function findLocalFunnelById(funnelId) {
  if (!funnelId || typeof window === 'undefined') return null;
  const hit = readJsonList(LEGACY_FUNNELS_KEY).find((f) => f?.id === funnelId);
  if (hit) return hit;
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(LEGACY_FUNNELS_KEY)) continue;
      const found = readJsonList(key).find((f) => f?.id === funnelId);
      if (found) return found;
    }
  } catch {
    return null;
  }
  return null;
}
