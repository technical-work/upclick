'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Play,
  Shield,
  Star,
  Search,
  ShoppingCart,
  ShoppingBag,
  X,
  Plus,
  Minus,
  Check,
  CreditCard,
  Truck,
  Lock,
  Heart
} from 'lucide-react';
import { normalizeFormFields, toEmbedUrl } from '@/lib/builder/elementRegistry';
import { htmlLooksFullscreen, sanitizeCustomHtmlForBuilder } from '@/lib/builder/customHtml';
import { StoreCartPanel, StoreCheckoutForm, StoreFilterBar, useVisibleCatalog } from '@/components/sites/stores/StorefrontBlocks';
import { formatStoreMoney, useStorePreview } from '@/components/sites/stores/StorePreviewContext';

function wrapBox(el, extra = {}) {
  return {
    margin: el.margin || extra.margin || '0 auto 8px',
    maxWidth: el.maxWidth || extra.maxWidth || '100%',
    background: el.bg && el.bg !== 'transparent' ? el.bg : extra.background,
    borderRadius: el.radius || extra.borderRadius,
    padding: el.padding || extra.padding,
    textAlign: el.align || extra.textAlign,
    boxShadow: el.shadow ? '0 12px 32px rgba(15, 23, 42, 0.10)' : extra.boxShadow,
    color: el.color || extra.color
  };
}

function openLink(link) {
  if (!link) return;
  const href = String(link).trim();
  if (!href) return;
  window.open(href, '_blank', 'noopener,noreferrer');
}

function ActionButton({ el, label, fallbackBg, interactive }) {
  const storePreview = useStorePreview();
  const text = label || el.content || el.buttonText || 'Continue';
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (!interactive) return;
        const href = el.link || el.buttonLink;
        if (storePreview?.navigateTo && href && String(href).startsWith('/')) {
          storePreview.navigateTo(href);
          return;
        }
        openLink(href);
      }}
      style={{
        background: el.bg || el.buttonBg || fallbackBg || '#2563eb',
        color: el.color || '#ffffff',
        border: 'none',
        borderRadius: el.radius || '10px',
        padding: el.padding || '14px 28px',
        fontSize: el.fontSize || '15px',
        fontWeight: el.weight || '700',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      {text}
      <ArrowRight size={16} />
    </button>
  );
}

function CountdownBlock({ el }) {
  const initial = useMemo(() => ({
    hours: Number(el.hours) || 0,
    minutes: Number(el.minutes) || 0,
    seconds: Number(el.seconds) || 0
  }), [el.hours, el.minutes, el.seconds]);
  const [timeLeft, setTimeLeft] = useState(initial);

  useEffect(() => {
    setTimeLeft(initial);
  }, [initial]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const cell = (value, label, accent) => (
    <div style={{ background: 'rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '8px', minWidth: '64px' }}>
      <div style={{ fontSize: '28px', fontWeight: '900', color: accent || '#fff' }}>{String(value).padStart(2, '0')}</div>
      <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.08em' }}>{label}</div>
    </div>
  );

  return (
    <div style={{ ...wrapBox(el, { background: el.bg || '#0f172a', color: el.color || '#fff', padding: el.padding || '24px', borderRadius: el.radius || '16px', textAlign: 'center', maxWidth: el.maxWidth || '480px' }) }}>
      <div style={{ fontSize: '12px', fontWeight: '800', color: '#f87171', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
        {el.label || 'Offer ends in'}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        {cell(timeLeft.hours, 'HOURS')}
        {cell(timeLeft.minutes, 'MINS')}
        {cell(timeLeft.seconds, 'SECS', '#38bdf8')}
      </div>
    </div>
  );
}

function FaqBlock({ el, interactive }) {
  const items = Array.isArray(el.items) && el.items.length
    ? el.items
    : [
        { q: 'Add your first question', a: 'Select this FAQ block and edit every question from the inspector.' }
      ];
  const [open, setOpen] = useState(0);

  return (
    <div style={{ ...wrapBox(el, { maxWidth: '720px', textAlign: 'left' }) }}>
      {el.title && <h3 style={{ fontSize: '24px', fontWeight: '800', textAlign: 'center', margin: '0 0 16px' }}>{el.title}</h3>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={`${item.q}-${i}`} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (interactive) setOpen(isOpen ? -1 : i);
                }}
                style={{ width: '100%', padding: '14px 18px', background: 'none', border: 'none', textAlign: 'left', fontWeight: '700', fontSize: '15px', color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <span>{item.q}</span>
                {isOpen ? <ChevronUp size={16} color="#2563eb" /> : <ChevronDown size={16} color="#64748b" />}
              </button>
              {isOpen && (
                <div style={{ padding: '0 18px 16px', color: '#475569', fontSize: '14px', lineHeight: 1.65 }}>{item.a}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FormBlock({ el, interactive }) {
  const fields = normalizeFormFields(el.fields);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div style={{ ...wrapBox(el, { background: el.bg || '#f8fafc', padding: el.padding || '32px', borderRadius: el.radius || '16px', maxWidth: el.maxWidth || '480px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }), border: '1px solid #e2e8f0' }}>
      {submitted ? (
        <div style={{ textAlign: 'center' }}>
          <CheckCircle2 size={44} color="#22c55e" style={{ margin: '0 auto 10px' }} />
          <h4 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: '800' }}>{el.successTitle || 'Thank you!'}</h4>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{el.successText || 'Your submission was received.'}</p>
        </div>
      ) : (
        <>
          <h4 style={{ margin: '0 0 6px', fontSize: '20px', fontWeight: '800', textAlign: 'center', color: el.color || '#0f172a' }}>{el.title || 'Sign up'}</h4>
          {el.subtitle && <p style={{ margin: '0 0 16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>{el.subtitle}</p>}
          {fields.map((field, i) => (
            <input
              key={`${field.label}-${i}`}
              type={field.type}
              placeholder={field.placeholder}
              required={field.required}
              readOnly={!interactive}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', marginBottom: '10px', boxSizing: 'border-box' }}
            />
          ))}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (interactive) setSubmitted(true);
            }}
            style={{ width: '100%', background: el.buttonBg || el.bg || '#2563eb', color: '#fff', border: 'none', padding: '13px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
          >
            {el.buttonText || 'Submit'}
          </button>
        </>
      )}
    </div>
  );
}

export default function ElementRenderer({ el, interactive = true }) {
  const storePreview = useStorePreview();
  const catalogItems = useVisibleCatalog(el?.items);
  const goStore = (href, extra) => {
    if (storePreview?.navigateTo) storePreview.navigateTo(href, extra);
  };
  if (!el) return null;
  const type = el.type === 'custom_html' ? 'code' : el.type;

  if (type === 'headline') {
    return <h1 style={{ margin: el.margin || 0, fontSize: el.fontSize || '40px', color: el.color || '#0f172a', textAlign: el.align || 'center', fontWeight: el.weight || '800', lineHeight: 1.2, letterSpacing: '-0.02em' }}>{el.content}</h1>;
  }

  if (type === 'subheadline') {
    return <h3 style={{ margin: el.margin || 0, fontSize: el.fontSize || '22px', color: el.color || '#334155', textAlign: el.align || 'center', fontWeight: el.weight || '600', lineHeight: 1.4 }}>{el.content}</h3>;
  }

  if (type === 'paragraph') {
    return <p style={{ margin: el.margin || 0, fontSize: el.fontSize || '16px', color: el.color || '#475569', textAlign: el.align || 'left', lineHeight: 1.75, fontWeight: el.weight || '400', maxWidth: el.maxWidth || '100%' }}>{el.content}</p>;
  }

  if (type === 'bullet_list' || type === 'numbered_list') {
    const items = el.items || [];
    return (
      <div style={{ ...wrapBox(el, { maxWidth: '640px', textAlign: 'left' }) }}>
        {items.map((item, i) => (
          <div key={`${item}-${i}`} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', margin: '10px 0', color: el.color || '#0f172a', fontSize: el.fontSize || '15px', fontWeight: '600' }}>
            {type === 'numbered_list' ? (
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: el.iconColor || '#2563eb', color: '#fff', fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
            ) : (
              <CheckCircle2 size={18} color={el.iconColor || '#2563eb'} style={{ flexShrink: 0, marginTop: 2 }} />
            )}
            <span>{item}</span>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'quote') {
    return (
      <blockquote style={{ ...wrapBox(el, { background: el.bg || '#f8fafc', padding: el.padding || '28px 32px', borderRadius: el.radius || '16px', textAlign: el.align || 'center' }), borderLeft: '4px solid #2563eb', margin: el.margin || '16px 0' }}>
        <p style={{ margin: 0, fontSize: '18px', fontStyle: 'italic', color: el.color || '#0f172a', lineHeight: 1.6 }}>"{el.content}"</p>
        {(el.author || el.role) && (
          <footer style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: '#64748b' }}>{el.author}{el.role ? ` · ${el.role}` : ''}</footer>
        )}
      </blockquote>
    );
  }

  if (type === 'badge') {
    return (
      <div style={{ textAlign: el.align || 'center' }}>
        <span style={{ display: 'inline-block', background: el.bg || '#eff6ff', color: el.color || '#2563eb', borderRadius: el.radius || '999px', padding: el.padding || '6px 14px', fontSize: el.fontSize || '12px', fontWeight: el.weight || '800' }}>{el.content}</span>
      </div>
    );
  }

  if (type === 'notice') {
    return (
      <div style={{ ...wrapBox(el, { background: el.bg || '#fff7ed', color: el.color || '#9a3412', padding: el.padding || '14px 16px', borderRadius: el.radius || '12px' }), border: '1px solid rgba(234,88,12,0.2)' }}>
        {el.title && <div style={{ fontWeight: 800, marginBottom: 4 }}>{el.title}</div>}
        <div style={{ fontSize: 14 }}>{el.content}</div>
      </div>
    );
  }

  if (type === 'button') {
    return (
      <div style={{ textAlign: el.align || 'center', margin: el.margin || '16px 0' }}>
        <ActionButton el={el} interactive={interactive} />
      </div>
    );
  }

  if (type === 'button_group') {
    return (
      <div style={{ display: 'flex', justifyContent: el.align === 'left' ? 'flex-start' : el.align === 'right' ? 'flex-end' : 'center', gap: 10, flexWrap: 'wrap', margin: '16px 0' }}>
        {(el.items || []).map((btn, i) => (
          <ActionButton key={`${btn.content}-${i}`} el={{ ...btn, radius: '10px', padding: '12px 22px' }} interactive={interactive} />
        ))}
      </div>
    );
  }

  if (type === 'image') {
    return (
      <div style={{ textAlign: el.align || 'center' }}>
        {el.src ? (
          <img src={el.src} alt={el.alt || 'Image'} style={{ maxWidth: el.maxWidth || '100%', width: '100%', borderRadius: el.radius || '16px', objectFit: 'cover', boxShadow: el.shadow ? '0 12px 30px rgba(0,0,0,0.12)' : 'none' }} />
        ) : (
          <div style={{ height: 180, background: '#e2e8f0', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Add an image URL</div>
        )}
      </div>
    );
  }

  if (type === 'video') {
    return (
      <div style={{ maxWidth: el.maxWidth || '760px', margin: '0 auto', borderRadius: el.radius || '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#0f172a' }}>
          <iframe
            src={toEmbedUrl(el.src)}
            title={el.title || 'Video'}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (type === 'photo_gallery') {
    const cols = Number(el.columns) || 3;
    const images = el.items || [];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
        {images.map((img, i) => (
          <img key={`${img.src}-${i}`} src={typeof img === 'string' ? img : img.src} alt={img.alt || `Gallery ${i + 1}`} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: el.radius || '12px' }} />
        ))}
      </div>
    );
  }

  if (type === 'embed' || type === 'map') {
    return (
      <iframe
        src={el.src}
        title={el.title || type}
        style={{ width: '100%', height: el.height || '320px', border: 'none', borderRadius: el.radius || '12px' }}
      />
    );
  }

  if (type === 'icon') {
    return (
      <div style={{ textAlign: el.align || 'center', color: el.color || '#0f172a', fontWeight: el.weight || '700', fontSize: el.fontSize || '16px' }}>
        <div style={{ fontSize: 32, marginBottom: 6 }}>{el.icon}</div>
        <div>{el.content}</div>
      </div>
    );
  }

  if (type === 'logo') {
    return (
      <div style={{ textAlign: el.align || 'center' }}>
        {el.src ? <img src={el.src} alt={el.content || 'Logo'} style={{ maxHeight: 56, objectFit: 'contain' }} /> : <div style={{ fontSize: el.fontSize || 28, fontWeight: el.weight || 800, color: el.color || '#2563eb' }}>{el.content}</div>}
      </div>
    );
  }

  if (type === 'qr_code') {
    const size = Number(el.size) || 160;
    const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(el.value || '')}`;
    return (
      <div style={{ ...wrapBox(el, { background: el.bg || '#f8fafc', padding: '20px', borderRadius: el.radius || '12px', textAlign: 'center', maxWidth: '280px' }), border: '1px solid #e2e8f0' }}>
        <img src={src} alt="QR code" width={size} height={size} style={{ display: 'block', margin: '0 auto 8px' }} />
        <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b' }}>{el.label || 'Scan QR code'}</div>
      </div>
    );
  }

  if (type === 'form') return <FormBlock el={el} interactive={interactive} />;

  if (type === 'whatsapp_button') {
    const href = `https://wa.me/${String(el.phone || '').replace(/[^\d]/g, '')}?text=${encodeURIComponent(el.message || '')}`;
    return (
      <div style={{ textAlign: el.align || 'center', margin: '16px 0' }}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (interactive) window.open(href, '_blank', 'noopener,noreferrer');
          }}
          style={{ background: el.bg || '#22c55e', color: el.color || '#fff', border: 'none', borderRadius: el.radius || '999px', padding: el.padding || '14px 28px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <MessageCircle size={16} /> {el.content}
        </button>
      </div>
    );
  }

  if (type === 'social_icons') {
    return (
      <div style={{ display: 'flex', justifyContent: el.align === 'left' ? 'flex-start' : el.align === 'right' ? 'flex-end' : 'center', gap: 10, flexWrap: 'wrap' }}>
        {(el.items || []).map((item, i) => (
          <a
            key={`${item.network}-${i}`}
            href={interactive ? item.url : undefined}
            onClick={(e) => { if (!interactive) e.preventDefault(); }}
            target="_blank"
            rel="noreferrer"
            style={{ padding: '8px 12px', borderRadius: 999, border: '1px solid #e2e8f0', color: el.color || '#0f172a', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}
          >
            {item.network}
          </a>
        ))}
      </div>
    );
  }

  if (type === 'spacer') {
    return <div style={{ height: el.height || '40px', background: el.bg || 'transparent' }} />;
  }

  if (type === 'divider') {
    return <div style={{ height: 0, borderTop: `${el.thickness || '1px'} solid ${el.color || '#e2e8f0'}`, maxWidth: el.maxWidth || '100%', margin: '12px auto' }} />;
  }

  if (type === 'row') {
    const cols = el.columns || [];
    return (
      <div
        className="uk-row"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.max(cols.length, 1)}, minmax(0, 1fr))`,
          gap: Number(el.gap) || 16,
          alignItems: el.valign || 'stretch',
          background: el.bg && el.bg !== 'transparent' ? el.bg : 'transparent',
          padding: el.padding || 0,
          borderRadius: el.radius || 0
        }}
      >
        {cols.map((col) => (
          <div key={col.id} className="uk-col">
            {(col.canvas || []).map((child) => (
              <div key={child.id} style={{ margin: '10px 0' }}>
                <ElementRenderer el={child} interactive={interactive} />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (type === 'columns') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
        {(el.items || []).map((col, i) => (
          <div key={`${col.title}-${i}`} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
            {col.image && <img src={col.image} alt={col.title} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }} />}
            <h4 style={{ margin: '0 0 8px', fontSize: 17 }}>{col.title}</h4>
            <p style={{ margin: 0, color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{col.text}</p>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'columns_3' || type === 'features_grid') {
    const items = el.items || [];
    return (
      <div>
        {el.title && <h3 style={{ textAlign: 'center', fontSize: 26, fontWeight: 800, margin: '0 0 18px' }}>{el.title}</h3>}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(items.length, 3) || 3}, minmax(0, 1fr))`, gap: 14 }}>
          {items.map((item, i) => (
            <div key={`${item.title}-${i}`} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>{item.title}</div>
              <div style={{ color: '#64748b', fontSize: 13.5, lineHeight: 1.6 }}>{item.text || item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'testimonials') {
    return (
      <div>
        {el.title && <h3 style={{ textAlign: 'center', fontSize: 26, fontWeight: 800, margin: '0 0 18px' }}>{el.title}</h3>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
          {(el.items || []).map((item, i) => (
            <div key={`${item.name}-${i}`} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
              <div style={{ color: '#f59e0b', marginBottom: 8 }}>{'★'.repeat(Number(item.stars) || 5)}</div>
              <p style={{ margin: '0 0 14px', color: '#475569', fontSize: 14, lineHeight: 1.65, fontStyle: 'italic' }}>"{item.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>{item.initial || (item.name || 'U')[0]}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{item.name}</div>
                  <div style={{ color: '#64748b', fontSize: 11 }}>{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'number_counter') {
    return (
      <div style={{ textAlign: el.align || 'center', padding: '20px 0' }}>
        <div style={{ fontSize: el.fontSize || '48px', fontWeight: 900, color: el.color || '#2563eb' }}>{el.number}</div>
        <div style={{ fontSize: 15, color: '#64748b', fontWeight: 700 }}>{el.label}</div>
      </div>
    );
  }

  if (type === 'star_rating') {
    return (
      <div style={{ textAlign: el.align || 'center', color: el.color || '#f59e0b' }}>
        <div style={{ display: 'inline-flex', gap: 4, marginBottom: 6 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={18} fill={i < Number(el.stars || 5) ? 'currentColor' : 'none'} />
          ))}
        </div>
        <div style={{ color: '#475569', fontSize: 14, fontWeight: 600 }}>{el.content}</div>
      </div>
    );
  }

  if (type === 'logo_cloud') {
    return (
      <div style={{ textAlign: 'center' }}>
        {el.title && <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>{el.title}</div>}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          {(el.items || []).map((name, i) => (
            <div key={`${name}-${i}`} style={{ padding: '10px 16px', border: '1px solid #e2e8f0', borderRadius: 10, fontWeight: 800, color: '#334155', background: '#fff' }}>{name}</div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'stats_row') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min((el.items || []).length, 4) || 4}, minmax(0, 1fr))`, gap: 12 }}>
        {(el.items || []).map((item, i) => (
          <div key={`${item.label}-${i}`} style={{ textAlign: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: '#2563eb' }}>{item.number}</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>{item.label}</div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'team_member') {
    return (
      <div style={{ ...wrapBox(el, { background: el.bg || '#0b0f19', color: el.color || '#fff', padding: '28px', borderRadius: el.radius || '16px', maxWidth: '420px' }) }}>
        {el.src && <img src={el.src} alt={el.name} style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', marginBottom: 12 }} />}
        <div style={{ fontSize: 12, color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>{el.role}</div>
        <h3 style={{ margin: '6px 0', fontSize: 24 }}>{el.name}</h3>
        <p style={{ margin: 0, color: '#94a3b8', lineHeight: 1.6 }}>{el.content}</p>
      </div>
    );
  }

  if (type === 'pricing_table') {
    return (
      <div style={{ ...wrapBox(el, { background: el.bg || '#f8fafc', padding: '32px', borderRadius: '16px', maxWidth: '420px', textAlign: 'center' }), border: el.popular ? '2px solid #2563eb' : '1px solid #e2e8f0' }}>
        {el.popular && <div style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', marginBottom: 8 }}>MOST POPULAR</div>}
        <h3 style={{ margin: '0 0 8px', fontSize: 22 }}>{el.title}</h3>
        <div style={{ fontSize: 40, fontWeight: 900, margin: '10px 0 18px' }}>{el.price}</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 18px', textAlign: 'left' }}>
          {(el.features || []).map((feat, i) => (
            <li key={`${feat}-${i}`} style={{ padding: '7px 0', display: 'flex', gap: 8, alignItems: 'center', color: '#334155' }}>
              <CheckCircle2 size={15} color="#22c55e" /> {feat}
            </li>
          ))}
        </ul>
        <ActionButton el={{ ...el, content: el.buttonText, link: el.buttonLink }} interactive={interactive} />
      </div>
    );
  }

  if (type === 'pricing_grid') {
    return (
      <div>
        {el.title && <h3 style={{ textAlign: 'center', fontSize: 26, fontWeight: 800, margin: '0 0 18px' }}>{el.title}</h3>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 14 }}>
          {(el.items || []).map((plan, i) => {
            const features = Array.isArray(plan.features) ? plan.features : String(plan.features || '').split('\n').filter(Boolean);
            return (
              <div key={`${plan.title}-${i}`} style={{ background: plan.popular ? '#2563eb' : '#f8fafc', color: plan.popular ? '#fff' : '#0f172a', borderRadius: 16, padding: 22, border: plan.popular ? 'none' : '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 800 }}>{plan.title}</div>
                <div style={{ fontSize: 32, fontWeight: 900, margin: '10px 0 16px' }}>{plan.price}</div>
                {features.map((feat, idx) => (
                  <div key={`${feat}-${idx}`} style={{ fontSize: 13, padding: '6px 0', borderTop: '1px solid rgba(148,163,184,0.25)' }}>{feat}</div>
                ))}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); if (interactive) openLink(plan.buttonLink); }}
                  style={{ width: '100%', marginTop: 16, border: 'none', borderRadius: 8, padding: 10, fontWeight: 700, cursor: 'pointer', background: plan.popular ? '#fff' : '#2563eb', color: plan.popular ? '#2563eb' : '#fff' }}
                >
                  {plan.buttonText || 'Start'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (type === 'product_card') {
    return (
      <div style={{ ...wrapBox(el, { background: el.bg || '#fff', borderRadius: el.radius || '16px', maxWidth: '420px' }), border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {el.src && <img src={el.src} alt={el.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />}
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 20 }}>{el.title}</h3>
            <strong>{el.price}</strong>
          </div>
          <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{el.content}</p>
          <ActionButton el={{ ...el, content: el.buttonText, link: el.buttonLink }} interactive={interactive} />
        </div>
      </div>
    );
  }

  if (type === 'countdown') return <CountdownBlock el={el} />;

  if (type === 'progress_bar') {
    const value = Math.max(0, Math.min(100, Number(el.value) || 0));
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
          <span>{el.label}</span><span>{value}%</span>
        </div>
        <div style={{ height: 10, background: el.bg || '#e2e8f0', borderRadius: 999 }}>
          <div style={{ width: `${value}%`, height: '100%', background: el.color || '#2563eb', borderRadius: 999 }} />
        </div>
      </div>
    );
  }

  if (type === 'guarantee') {
    return (
      <div style={{ ...wrapBox(el, { background: el.bg || '#ecfdf5', color: el.color || '#065f46', padding: el.padding || '24px', borderRadius: el.radius || '16px' }), display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ fontSize: 28 }}>{el.icon || <Shield size={24} />}</div>
        <div>
          <div style={{ fontWeight: 800, marginBottom: 4 }}>{el.title}</div>
          <div style={{ fontSize: 14, lineHeight: 1.6 }}>{el.content}</div>
        </div>
      </div>
    );
  }

  if (type === 'faq') return <FaqBlock el={el} interactive={interactive} />;

  if (type === 'icon_box') {
    return (
      <div style={{ ...wrapBox(el, { background: el.bg || '#f8fafc', padding: el.padding || '24px', borderRadius: el.radius || '16px', textAlign: el.align || 'center' }), border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>{el.icon}</div>
        <h4 style={{ margin: '0 0 6px' }}>{el.title}</h4>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{el.content}</p>
      </div>
    );
  }

  if (type === 'cta_banner') {
    return (
      <div style={{ ...wrapBox(el, { background: el.bg || '#2563eb', color: el.color || '#fff', padding: el.padding || '40px 32px', borderRadius: el.radius || '20px', textAlign: el.align || 'center' }) }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 28 }}>{el.title}</h3>
        <p style={{ margin: '0 0 16px', opacity: 0.9 }}>{el.content}</p>
        <ActionButton el={{ ...el, content: el.buttonText, link: el.buttonLink, bg: '#fff', color: '#2563eb' }} interactive={interactive} />
      </div>
    );
  }

  if (type === 'navbar') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '12px 8px', background: el.bg || '#fff', color: el.color || '#0f172a', borderBottom: '1px solid #e2e8f0', borderRadius: 12 }}>
        <strong>{el.brand}</strong>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, fontWeight: 600 }}>
          {(el.items || []).map((item, i) => (
            <a key={`${item.label}-${i}`} href={interactive ? item.href : undefined} onClick={(e) => { if (!interactive) e.preventDefault(); }} style={{ color: 'inherit', textDecoration: 'none' }}>{item.label}</a>
          ))}
        </div>
        {el.buttonText && <ActionButton el={{ content: el.buttonText, link: el.buttonLink, padding: '8px 14px', fontSize: '13px' }} interactive={interactive} />}
      </div>
    );
  }

  if (type === 'footer') {
    return (
      <div style={{ ...wrapBox(el, { background: el.bg || '#0f172a', color: el.color || '#e2e8f0', padding: '28px 20px', borderRadius: '16px', textAlign: 'center' }) }}>
        <div style={{ fontWeight: 800, marginBottom: 6 }}>{el.brand}</div>
        <p style={{ margin: '0 0 12px', opacity: 0.8, fontSize: 14 }}>{el.content}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', fontSize: 13 }}>
          {(el.items || []).map((item, i) => (
            <a key={`${item.label}-${i}`} href={interactive ? item.href : undefined} onClick={(e) => { if (!interactive) e.preventDefault(); }} style={{ color: 'inherit' }}>{item.label}</a>
          ))}
        </div>
        <div style={{ marginTop: 14, fontSize: 12, opacity: 0.7 }}>{el.copyright}</div>
      </div>
    );
  }

  if (type === 'hero') {
    return (
      <div style={{ ...wrapBox(el, { background: el.bg || '#0b0f19', color: el.color || '#fff', padding: el.padding || '64px 36px', borderRadius: el.radius || '20px', textAlign: el.align || 'center' }) }}>
        {el.badge && <div style={{ display: 'inline-block', background: 'rgba(56,189,248,0.12)', color: '#38bdf8', borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 800, marginBottom: 12 }}>{el.badge}</div>}
        <h1 style={{ margin: '0 0 12px', fontSize: 42, lineHeight: 1.15 }}>{el.title}</h1>
        <p style={{ margin: '0 auto 20px', maxWidth: 640, opacity: 0.85, fontSize: 17, lineHeight: 1.6 }}>{el.content}</p>
        <div style={{ display: 'flex', justifyContent: el.align === 'left' ? 'flex-start' : 'center', gap: 10, flexWrap: 'wrap' }}>
          <ActionButton el={{ content: el.buttonText, link: el.buttonLink }} interactive={interactive} />
          {el.secondaryText && (
            <button type="button" onClick={(e) => { e.stopPropagation(); if (interactive) openLink(el.secondaryLink); }} style={{ background: 'transparent', color: 'inherit', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10, padding: '12px 18px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Play size={14} /> {el.secondaryText}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (type === 'about_split') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 24, alignItems: 'center' }}>
        {el.src ? <img src={el.src} alt={el.title} style={{ width: '100%', borderRadius: 16, objectFit: 'cover', minHeight: 240 }} /> : <div style={{ minHeight: 240, background: '#e2e8f0', borderRadius: 16 }} />}
        <div>
          <h3 style={{ margin: '0 0 10px', fontSize: 28 }}>{el.title}</h3>
          <p style={{ color: '#475569', lineHeight: 1.7 }}>{el.content}</p>
          {(el.items || []).map((item, i) => (
            <div key={`${item}-${i}`} style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '8px 0', fontWeight: 600 }}>
              <CheckCircle2 size={16} color="#2563eb" /> {item}
            </div>
          ))}
          {el.buttonText && <div style={{ marginTop: 14 }}><ActionButton el={{ content: el.buttonText, link: el.buttonLink }} interactive={interactive} /></div>}
        </div>
      </div>
    );
  }

  if (type === 'calendar_cta') {
    return (
      <div style={{ ...wrapBox(el, { background: el.bg || '#eff6ff', color: el.color || '#0f172a', padding: '28px', borderRadius: el.radius || '16px', textAlign: 'center' }) }}>
        <Calendar size={28} color="#2563eb" style={{ margin: '0 auto 8px' }} />
        <h3 style={{ margin: '0 0 8px' }}>{el.title}</h3>
        <p style={{ margin: '0 0 14px', color: '#475569' }}>{el.content}</p>
        <ActionButton el={{ content: el.buttonText, link: el.buttonLink }} interactive={interactive} />
      </div>
    );
  }

  if (type === 'code') {
    const html = el.code || '<div>Custom HTML</div>';
    if (!interactive) {
      const contained = htmlLooksFullscreen(html);
      return (
        <div
          className="uk-html-sandbox"
          style={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: contained ? 280 : 80,
            maxHeight: 420,
            borderRadius: 12,
            border: '1px dashed #94a3b8',
            background: '#0f172a',
            transform: 'translateZ(0)',
            isolation: 'isolate',
            contain: 'layout paint'
          }}
        >
          <div
            style={{ pointerEvents: 'none', minHeight: contained ? 280 : undefined }}
            dangerouslySetInnerHTML={{ __html: sanitizeCustomHtmlForBuilder(html) }}
          />
          <div style={{ position: 'absolute', inset: 0, zIndex: 2 }} />
          {contained && (
            <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 3, background: 'rgba(15,23,42,0.88)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 8px', borderRadius: 4, pointerEvents: 'none' }}>
              Contained in builder · fullscreen HTML still works on Preview / Publish
            </div>
          )}
        </div>
      );
    }
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

  if (type === 'store_header') {
    return (
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        background: el.bg || '#ffffff',
        color: el.color || '#0f172a',
        borderBottom: '1px solid #e2e8f0',
        width: '100%',
        boxSizing: 'border-box',
        borderRadius: el.radius || '8px',
        margin: '0 0 12px'
      }}>
        <div style={{ fontSize: '18px', fontWeight: '800', color: el.color || '#0f172a' }}>
          {el.brand || 'My Store'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <nav style={{ display: 'flex', gap: '16px', fontSize: '13.5px', fontWeight: '600' }}>
            {(el.links || [{ label: 'Home', href: '/' }, { label: 'Products', href: '/products' }, { label: 'Contact', href: '/contact-us' }]).map((link, i) => (
              <a
                key={i}
                href={link.href || '#'}
                style={{ color: 'inherit', textDecoration: 'none' }}
                onClick={(e) => {
                  e.preventDefault();
                  if (!interactive) return;
                  if (storePreview?.navigateTo) goStore(link.href || '/');
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Search size={17} style={{ cursor: 'pointer', color: '#475569' }} />
            <div
              style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onClick={(e) => {
                e.preventDefault();
                if (interactive && storePreview?.navigateTo) goStore('/cart');
              }}
            >
              <ShoppingCart size={18} style={{ color: '#0f172a' }} />
              <span style={{
                position: 'absolute',
                top: '-7px',
                right: '-7px',
                background: '#0f172a',
                color: '#ffffff',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: '800'
              }}>
                {storePreview?.cartCount || 0}
              </span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  if (type === 'store_hero_banner') {
    return (
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: el.height || '260px',
        backgroundImage: `url(${el.bgImage || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=80'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: el.radius || '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '36px 20px',
        boxSizing: 'border-box',
        margin: '0 0 16px'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.42)', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '640px', width: '100%' }}>
          {el.subtitle && (
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>
              {el.subtitle}
            </div>
          )}
          <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#ffffff', margin: '0', letterSpacing: '-0.5px' }}>
            {el.title || 'Our Products'}
          </h1>
        </div>
      </div>
    );
  }

  if (type === 'store_filter_bar') {
    if (storePreview) return <StoreFilterBar el={el} />;
    return (
      <div style={{ width: '100%', margin: '16px 0 20px', boxSizing: 'border-box' }}>
        {/* Centered Search Bar */}
        <div style={{ maxWidth: '600px', margin: '0 auto 20px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search"
            style={{
              width: '100%',
              padding: '10px 42px 10px 14px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '13.5px',
              background: '#ffffff',
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
            <X size={15} style={{ cursor: 'pointer' }} />
            <Search size={16} />
          </div>
        </div>

        {/* Filter controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Filter:</span>
            <button type="button" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Availability <ChevronDown size={13} />
            </button>
            <button type="button" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Price <ChevronDown size={13} />
            </button>
            <span style={{ background: '#f1f5f9', color: '#0f172a', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Availability: In Stock <X size={11} />
            </span>
            <span style={{ background: '#f1f5f9', color: '#0f172a', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
              $1 - $1000 <X size={11} />
            </span>
            <button type="button" style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: '700', cursor: 'pointer', padding: 0 }}>
              Remove all
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12.5px', color: '#475569' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontWeight: '600' }}>Sort:</span>
              <button type="button" style={{ background: 'none', border: 'none', fontWeight: '700', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                {el.sortOption || 'Featured'} <ChevronDown size={13} />
              </button>
            </div>
            <span style={{ color: '#64748b', fontWeight: '600' }}>{el.totalProducts || 13} products</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'store_products_grid') {
    const items = storePreview ? catalogItems : (el.items || []);
    const cols = Number(el.columns) || 4;
    const currency = storePreview?.store?.settings?.currency || 'USD';

    if (!items.length) {
      return (
        <div style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b' }}>
          <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>No products yet</h3>
          <p style={{ margin: 0 }}>Add products in the store dashboard to show them here.</p>
        </div>
      );
    }

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${cols === 2 ? '320px' : cols === 3 ? '260px' : '220px'}, 1fr))`,
        gap: '20px',
        width: '100%',
        margin: '16px 0',
        boxSizing: 'border-box'
      }}>
        {items.map((prod, idx) => (
          <div
            key={prod.id || idx}
            onClick={() => {
              if (interactive && storePreview?.navigateTo) goStore('/product-details', { productId: prod.id });
            }}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #f1f5f9',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
          >
            <div style={{
              height: '220px',
              background: '#f8fafc',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <img
                src={prod.image}
                alt={prod.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: '700', color: '#0f172a' }}>
                {prod.title}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#f59e0b' }}>
                <span style={{ fontWeight: '800', color: '#0f172a' }}>{prod.rating || '4.3'}</span>
                <div style={{ display: 'flex' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <span style={{ color: '#64748b', fontSize: '11px' }}>({prod.reviewsCount || 45})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                <span style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a' }}>
                  {formatStoreMoney(prod.price, currency)}
                </span>
                {prod.compareAtPrice ? (
                  <span style={{ fontSize: '12px', color: '#94a3b8', textDecoration: 'line-through' }}>
                    {formatStoreMoney(prod.compareAtPrice, currency)}
                  </span>
                ) : null}
                {prod.discount && (
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#16a34a' }}>
                    {prod.discount}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                {prod.badge1 && (
                  <span style={{ background: '#fef2f2', color: '#ef4444', fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px' }}>
                    {prod.badge1}
                  </span>
                )}
                {prod.badge2 && (
                  <span style={{ background: '#fef2f2', color: '#ef4444', fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px' }}>
                    {prod.badge2}
                  </span>
                )}
              </div>
              {storePreview?.addToCart ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!interactive) return;
                    storePreview.addToCart({
                      id: prod.id,
                      name: prod.title || prod.name,
                      title: prod.title || prod.name,
                      price: prod.price,
                      image: prod.image
                    });
                  }}
                  style={{
                    marginTop: 8,
                    width: '100%',
                    background: '#0f172a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 10px',
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  Add to cart
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'store_product_detail') {
    const currency = storePreview?.store?.settings?.currency || 'USD';
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.2fr',
        gap: '32px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '32px',
        margin: '16px 0',
        boxSizing: 'border-box'
      }}>
        <div style={{ height: '380px', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc' }}>
          <img src={el.image} alt={el.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '800', margin: 0, color: '#0f172a' }}>{el.title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#f59e0b' }}>
            <span style={{ fontWeight: '800', color: '#0f172a' }}>{el.rating || '4.8'}</span>
            <div style={{ display: 'flex' }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />)}
            </div>
            <span style={{ color: '#64748b' }}>({el.reviewsCount || 124} reviews)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>{formatStoreMoney(el.price, currency)}</span>
            {el.compareAtPrice ? <span style={{ fontSize: '15px', color: '#94a3b8', textDecoration: 'line-through' }}>{formatStoreMoney(el.compareAtPrice, currency)}</span> : null}
          </div>
          <p style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{el.description}</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => {
                if (!interactive) return;
                storePreview?.addToCart?.({
                  id: el.productId,
                  name: el.title,
                  title: el.title,
                  price: el.price,
                  image: el.image
                });
                goStore('/cart');
              }}
              style={{ flex: 1, background: '#2563eb', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
            >Add to Cart</button>
            <button
              type="button"
              onClick={() => {
                if (!interactive) return;
                storePreview?.addToCart?.({
                  id: el.productId,
                  name: el.title,
                  title: el.title,
                  price: el.price,
                  image: el.image
                });
                goStore('/checkout');
              }}
              style={{ flex: 1, background: '#0f172a', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
            >Buy Now</button>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'store_cart') {
    if (storePreview) return <StoreCartPanel />;
    const cartItems = Array.isArray(el.items) ? el.items : [];
    const fallbackSubtotal = cartItems.reduce((sum, item) => (
      sum + (Number(item.price) || 0) * (Number(item.qty) || 1)
    ), 0);
    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '28px',
        margin: '16px 0',
        maxWidth: '800px'
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 20px', color: '#0f172a' }}>{el.title || 'Your Shopping Cart'}</h3>
        {cartItems.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' }}>
            {cartItems.map((item, idx) => (
              <div key={item.id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {item.image ? <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} /> : null}
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>{item.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Qty: {item.qty || 1}</div>
                  </div>
                </div>
                <span style={{ fontWeight: '800', fontSize: '15px' }}>{formatStoreMoney((Number(item.price) || 0) * (Number(item.qty) || 1))}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#64748b', margin: '0 0 16px' }}>Your cart is empty.</p>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
          <span style={{ fontSize: '16px', fontWeight: '800' }}>Subtotal</span>
          <span style={{ fontSize: '20px', fontWeight: '900', color: '#16a34a' }}>{formatStoreMoney(fallbackSubtotal)}</span>
        </div>
        <button
          type="button"
          onClick={() => { if (interactive && storePreview?.navigateTo) goStore('/checkout'); }}
          style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', marginTop: '16px' }}
        >
          Proceed to Checkout
        </button>
      </div>
    );
  }

  if (type === 'store_checkout') {
    if (storePreview) return <StoreCheckoutForm el={el} />;
    return (
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '32px',
        margin: '16px 0',
        maxWidth: '800px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#0f172a' }}>{el.title || 'Express Secure Checkout'}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <input type="text" placeholder="First Name" style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
          <input type="text" placeholder="Last Name" style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
        </div>
        <input type="email" placeholder="Email Address" style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
        <input type="text" placeholder="Shipping Street Address" style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
        <div style={{ background: '#f8fafc', border: '1px dashed #2563eb', padding: '14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="checkbox" defaultChecked />
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{el.bumpOfferTitle || 'Add 1-Year Extended Care Warranty ($19)'}</span>
        </div>
        <button
          type="button"
          onClick={() => { if (interactive && storePreview?.navigateTo) goStore('/thank-you'); }}
          style={{ width: '100%', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: '800', fontSize: '16px', cursor: 'pointer' }}
        >
          Complete Order · $347.00
        </button>
      </div>
    );
  }

  if (type === 'prebuilt_template') {
    return (
      <div style={{ ...wrapBox(el, { background: el.bg || '#0b0f19', color: el.color || '#fff', padding: '48px 32px', borderRadius: '16px' }) }}>
        <span style={{ fontSize: 12, color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>{el.category}</span>
        <h2 style={{ fontSize: 32, margin: '10px 0 8px' }}>{el.title}</h2>
        <p style={{ color: '#94a3b8', fontSize: 16, maxWidth: 600, lineHeight: 1.6 }}>{el.subtitle}</p>
        {el.buttonText && <div style={{ marginTop: 16 }}><ActionButton el={{ content: el.buttonText, link: el.buttonLink }} interactive={interactive} /></div>}
      </div>
    );
  }

  return (
    <div style={{ padding: 16, border: '1px dashed #cbd5e1', borderRadius: 10, textAlign: 'center', color: '#64748b' }}>
      {el.content || el.title || type}
    </div>
  );
}
