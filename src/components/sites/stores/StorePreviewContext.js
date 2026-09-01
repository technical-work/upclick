'use client';

import { createContext, useContext } from 'react';

export const StorePreviewContext = createContext(null);

export function useStorePreview() {
  return useContext(StorePreviewContext);
}

export function formatStoreMoney(amount, currency = 'USD') {
  const symbols = { USD: '$', SAR: 'ر.س', AED: 'د.إ', EGP: 'ج.م', EUR: '€' };
  const n = Number(amount) || 0;
  return `${symbols[currency] || '$'}${n.toFixed(2)}`;
}

export function productsToGridItems(products = []) {
  return (products || []).filter((p) => p && p.status !== 'draft').map((p) => {
    const price = Number(p.price) || 0;
    const compare = Number(p.compareAtPrice) || 0;
    return {
      id: p.id,
      title: p.name,
      name: p.name,
      price,
      compareAtPrice: compare > price ? compare : 0,
      discount: compare > price ? `${Math.round((1 - price / compare) * 100)}% off` : '',
      rating: p.rating || 4.8,
      reviewsCount: p.reviewsCount || 24,
      image: p.image,
      description: p.description || '',
      badge1: p.type === 'Digital' ? 'Digital' : p.type === 'Service' ? 'Service' : '',
      badge2: Number(p.inventory) > 0 ? '' : 'Sold out',
      inventory: p.inventory
    };
  });
}

const HREF_TO_TYPE = {
  '/': 'home',
  '/home': 'home',
  '/products': 'catalog',
  '/product-details': 'product_detail',
  '/cart': 'cart',
  '/checkout': 'checkout',
  '/thank-you': 'thankyou',
  '/thankyou': 'thankyou',
  '/contact': 'contact',
  '/contact-us': 'contact'
};

function normPath(input) {
  const raw = String(input || '/').split('?')[0].trim() || '/';
  const withSlash = raw.startsWith('/') ? raw : `/${raw}`;
  if (withSlash.length > 1 && withSlash.endsWith('/')) return withSlash.slice(0, -1);
  return withSlash;
}

export function findStorePage(pages = [], href = '/') {
  const wanted = normPath(href);
  const byPath = pages.find((p) => normPath(p.path || '/') === wanted);
  if (byPath) return byPath;
  const type = HREF_TO_TYPE[wanted];
  if (type) return pages.find((p) => p.type === type) || null;
  return null;
}

export function resolveStorePageIndex(pages = [], href = '/') {
  const match = findStorePage(pages, href);
  if (match) {
    const idx = pages.findIndex((p) => p === match || p.id === match.id);
    if (idx >= 0) return idx;
  }
  return 0;
}

export function buildStorePreviewUrl({
  origin = '',
  storeId,
  pageIdx = 0,
  path = '/',
  isDraft = false,
  productId = ''
}) {
  const qs = new URLSearchParams();
  qs.set('storeId', storeId);
  qs.set('pageIdx', String(pageIdx || 0));
  if (path) qs.set('path', path);
  if (isDraft) qs.set('draft', '1');
  if (productId) qs.set('productId', productId);
  return `${origin}/preview-site?${qs.toString()}`;
}

export function hydrateStorePage(page, store, productId = '') {
  if (!page) return page;
  const products = store?.products || [];
  const items = productsToGridItems(products);
  const selected = products.find((p) => p.id === productId) || products[0];

  const canvas = (page.canvas || []).map((el) => {
    if (el.type === 'store_products_grid') {
      return { ...el, items };
    }
    if (el.type === 'store_filter_bar') {
      return { ...el, totalProducts: items.length };
    }
    if (el.type === 'store_header') {
      return {
        ...el,
        brand: el.brand && el.brand !== 'My Store' ? el.brand : (store?.name || el.brand),
        links: el.links?.length ? el.links : [
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
          { label: 'Contact', href: '/contact-us' }
        ]
      };
    }
    if (el.type === 'store_product_detail' && selected) {
      return {
        ...el,
        productId: selected.id,
        title: selected.name,
        price: selected.price,
        compareAtPrice: selected.compareAtPrice,
        image: selected.image,
        description: selected.description || el.description
      };
    }
    if (el.type === 'store_cart') {
      return { ...el, items: [] };
    }
    return el;
  });

  return { ...page, canvas };
}
