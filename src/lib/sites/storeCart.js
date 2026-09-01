const KEY = (storeId) => `upklick_cart_${storeId}`;

export function loadStoreCart(storeId) {
  if (!storeId || typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY(storeId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoreCart(storeId, items) {
  if (!storeId || typeof window === 'undefined') return;
  localStorage.setItem(KEY(storeId), JSON.stringify(items || []));
}

export function clearStoreCart(storeId) {
  saveStoreCart(storeId, []);
}

export function cartCount(items = []) {
  return items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
}

export function cartSubtotal(items = []) {
  return items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0);
}

export function upsertCartItem(items, product, qty = 1) {
  if (!product?.id) return items || [];
  const list = Array.isArray(items) ? [...items] : [];
  const idx = list.findIndex((item) => item.id === product.id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], qty: (Number(list[idx].qty) || 0) + qty };
    if (list[idx].qty <= 0) list.splice(idx, 1);
    return list;
  }
  if (qty <= 0) return list;
  list.push({
    id: product.id,
    name: product.name || product.title || 'Product',
    price: Number(product.price) || 0,
    image: product.image || '',
    qty
  });
  return list;
}

export function setCartItemQty(items, productId, qty) {
  const nextQty = Math.max(0, Number(qty) || 0);
  return (items || [])
    .map((item) => (item.id === productId ? { ...item, qty: nextQty } : item))
    .filter((item) => item.qty > 0);
}
