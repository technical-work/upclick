'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Package, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  UploadCloud, 
  Info, 
  DollarSign, 
  Tag, 
  Layers, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function StoreProductsTab({
  store,
  isRtl,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form state
  const [prodName, setProdName] = useState('');
  const [prodNameAr, setProdNameAr] = useState('');
  const [prodType, setProdType] = useState('Physical');
  const [prodPrice, setProdPrice] = useState('');
  const [prodComparePrice, setProdComparePrice] = useState('');
  const [prodInventory, setProdInventory] = useState('50');
  const [prodCategory, setProdCategory] = useState('General');
  const [prodImage, setProdImage] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPriority, setProdPriority] = useState('1');

  const products = store.products || [];

  const filteredProducts = products.filter(p => {
    const name = (p.name || '').toLowerCase();
    const nameAr = (p.nameAr || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || nameAr.includes(q);
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setProdName('');
    setProdNameAr('');
    setProdType('Physical');
    setProdPrice('99');
    setProdComparePrice('120');
    setProdInventory('30');
    setProdCategory('General');
    setProdImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80');
    setProdDesc('');
    setProdPriority(String(products.length + 1));
    setIsProductModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setProdName(p.name || '');
    setProdNameAr(p.nameAr || '');
    setProdType(p.type || 'Physical');
    setProdPrice(String(p.price || ''));
    setProdComparePrice(String(p.compareAtPrice || ''));
    setProdInventory(String(p.inventory || '0'));
    setProdCategory(p.category || 'General');
    setProdImage(p.image || '');
    setProdDesc(p.description || '');
    setProdPriority(String(p.priority || '1'));
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!prodName.trim() && !prodNameAr.trim()) return;

    const nowStr = new Date().toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const payload = {
      name: prodName.trim() || prodNameAr.trim(),
      nameAr: prodNameAr.trim() || prodName.trim(),
      type: prodType,
      typeAr: prodType === 'Physical' ? 'منتج ملموس' : (prodType === 'Digital' ? 'منتج رقمي' : 'خدمة'),
      price: parseFloat(prodPrice) || 0,
      compareAtPrice: parseFloat(prodComparePrice) || 0,
      inventory: parseInt(prodInventory, 10) || 0,
      category: prodCategory,
      image: prodImage.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      description: prodDesc,
      priority: parseInt(prodPriority, 10) || 1,
      status: 'active',
      updatedOn: nowStr
    };

    if (editingProduct) {
      onUpdateProduct(editingProduct.id, payload);
    } else {
      onAddProduct({
        ...payload,
        id: 'prod_' + Date.now()
      });
    }

    setIsProductModalOpen(false);
  };

  return (
    <div style={{ animation: 'fadeIn 0.25s ease' }}>
      {/* Top action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={16} style={{ position: 'absolute', [isRtl ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--t2)' }} />
          <input
            type="text"
            className="inp"
            placeholder={isRtl ? 'البحث عن منتج...' : 'Search for products...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              [isRtl ? 'paddingRight' : 'paddingLeft']: '38px',
              width: '100%',
              fontSize: '13px'
            }}
          />
        </div>

        <button
          onClick={handleOpenAdd}
          style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
          }}
        >
          <Plus size={16} />
          <span>{isRtl ? '+ إضافة منتج جديد' : '+ Add Product'}</span>
        </button>
      </div>

      {/* Empty State matching Screenshot 3 */}
      {products.length === 0 ? (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--edge)',
          borderRadius: '16px',
          padding: '80px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 8px', color: 'var(--t1)' }}>
            {isRtl ? 'لا توجد منتجات لعرضها' : 'No products to display'}
          </h3>
          <p style={{ maxWidth: '420px', color: 'var(--t2)', fontSize: '13.5px', margin: '0 0 24px', lineHeight: 1.6 }}>
            {isRtl
              ? 'لم تقم بإضافة أي منتجات لمتجرك حتى الآن. أضف منتجك الأول لبدء بناء كتالوج متجرك والبيع لعملائك.'
              : "You haven't added any products to your store yet. Add your first item to start building your catalog."
            }
          </p>
          <button
            onClick={handleOpenAdd}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              fontWeight: '700',
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={16} />
            <span>{isRtl ? '+ إضافة منتجك الأول' : '+ Add your first product'}</span>
          </button>
        </div>
      ) : (
        /* Products Table matching Screenshot 3 */
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--edge)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
            <thead>
              <tr style={{
                background: 'var(--surface2)',
                borderBottom: '1px solid var(--edge)',
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--t2)',
                textTransform: 'uppercase'
              }}>
                <th style={{ padding: '14px 20px' }}>{isRtl ? 'اسم المنتج' : 'Product name'}</th>
                <th style={{ padding: '14px 20px' }}>{isRtl ? 'نوع المنتج' : 'Product type'}</th>
                <th style={{ padding: '14px 20px' }}>{isRtl ? 'السعر' : 'Price'}</th>
                <th style={{ padding: '14px 20px' }}>{isRtl ? 'المخزون' : 'Inventory'}</th>
                <th style={{ padding: '14px 20px' }}>{isRtl ? 'تاريخ التحديث' : 'Updated on'}</th>
                <th style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{isRtl ? 'أولوية العرض' : 'Display priority'}</span>
                    <Info size={13} title={isRtl ? 'ترتيب ظهور المنتج في صفحة المتجر' : 'Product sorting rank on store pages'} />
                  </div>
                </th>
                <th style={{ padding: '14px 20px', width: '90px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((prod) => (
                <tr
                  key={prod.id}
                  style={{
                    borderBottom: '1px solid var(--edge)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#f1f5f9',
                        flexShrink: 0,
                        border: '1px solid var(--edge)'
                      }}>
                        <img
                          src={prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'}
                          alt={prod.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: 'var(--t1)', fontSize: '13.5px' }}>
                          {isRtl ? (prod.nameAr || prod.name) : prod.name}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--t2)', marginTop: '2px' }}>
                          {prod.category} · SKU-{prod.id?.slice(-4)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--t2)' }}>
                    <span style={{
                      background: 'rgba(37, 99, 235, 0.1)',
                      color: '#2563eb',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: '700'
                    }}>
                      {isRtl ? (prod.typeAr || prod.type) : prod.type}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontWeight: '800', color: 'var(--t1)', fontSize: '14px' }}>
                    ${prod.price}
                    {prod.compareAtPrice > prod.price && (
                      <span style={{ fontSize: '12px', color: 'var(--t3)', textDecoration: 'line-through', marginInlineStart: '6px' }}>
                        ${prod.compareAtPrice}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px' }}>
                    <span style={{
                      color: prod.inventory > 10 ? '#16a34a' : (prod.inventory > 0 ? '#f59e0b' : '#dc2626'),
                      fontWeight: '700'
                    }}>
                      {prod.inventory > 0 ? `${prod.inventory} in stock` : 'Out of stock'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '12.5px', color: 'var(--t2)' }}>
                    {prod.updatedOn}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '700', color: 'var(--t1)' }}>
                    #{prod.priority || 1}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        style={{
                          background: 'var(--surface2)',
                          border: '1px solid var(--edge)',
                          borderRadius: '6px',
                          padding: '6px',
                          color: 'var(--t1)',
                          cursor: 'pointer'
                        }}
                        title={isRtl ? 'تعديل' : 'Edit'}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(isRtl ? 'هل تريد حذف هذا المنتج؟' : 'Delete this product?')) {
                            onDeleteProduct(prod.id);
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc2626',
                          cursor: 'pointer',
                          padding: '6px'
                        }}
                        title={isRtl ? 'حذف' : 'Delete'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isProductModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--edge)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '620px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--edge)', paddingBottom: '14px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: 'var(--t1)' }}>
                {editingProduct ? (isRtl ? 'تعديل المنتج' : 'Edit Product') : (isRtl ? 'إضافة منتج جديد' : 'Add New Product')}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--t1)' }}>
                  {isRtl ? 'اسم المنتج بالإنجليزية' : 'Product Name (English)'}
                </label>
                <input
                  type="text"
                  className="inp"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Ergonomic Office Chair"
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--t1)' }}>
                  {isRtl ? 'اسم المنتج بالعربية' : 'Product Name (Arabic)'}
                </label>
                <input
                  type="text"
                  className="inp"
                  value={prodNameAr}
                  onChange={(e) => setProdNameAr(e.target.value)}
                  placeholder="مثال: كرسي مريح فاخر للمكتب"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--t1)' }}>
                    {isRtl ? 'السعر ($)' : 'Price ($)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="inp"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="99"
                    style={{ width: '100%' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--t1)' }}>
                    {isRtl ? 'السعر قبل الخصم ($)' : 'Compare at Price ($)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="inp"
                    value={prodComparePrice}
                    onChange={(e) => setProdComparePrice(e.target.value)}
                    placeholder="120"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--t1)' }}>
                    {isRtl ? 'نوع المنتج' : 'Product Type'}
                  </label>
                  <select
                    className="inp"
                    value={prodType}
                    onChange={(e) => setProdType(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="Physical">{isRtl ? 'منتج ملموس (Physical)' : 'Physical Product'}</option>
                    <option value="Digital">{isRtl ? 'منتج رقمي (Digital)' : 'Digital Download'}</option>
                    <option value="Service">{isRtl ? 'خدمة (Service)' : 'Service / Consulting'}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--t1)' }}>
                    {isRtl ? 'الكمية في المخزون' : 'Inventory Stock'}
                  </label>
                  <input
                    type="number"
                    className="inp"
                    value={prodInventory}
                    onChange={(e) => setProdInventory(e.target.value)}
                    placeholder="50"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--t1)' }}>
                  {isRtl ? 'رابط صورة المنتج (URL)' : 'Product Image URL'}
                </label>
                <input
                  type="text"
                  className="inp"
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--t1)' }}>
                  {isRtl ? 'وصف المنتج' : 'Product Description'}
                </label>
                <textarea
                  className="inp"
                  rows={3}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder={isRtl ? 'أدخل وصفاً تفصيلياً للمنتج ومميزاته...' : 'Enter a detailed description and key features...'}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="btn btn-ghost"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 24px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {editingProduct ? (isRtl ? 'حفظ التعديلات' : 'Save Changes') : (isRtl ? 'إنشاء المنتج' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
