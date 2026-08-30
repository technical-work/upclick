'use client';

import React from 'react';
import { Plus, Sliders, Trash2 } from 'lucide-react';
import { getElementDef } from '@/lib/builder/elementRegistry';
import { htmlLooksFullscreen } from '@/lib/builder/customHtml';

const labelStyle = { fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' };
const inputStyle = { width: '100%', fontSize: '12.5px', boxSizing: 'border-box' };

function FieldControl({ field, value, onChange }) {
  if (field.type === 'textarea' || field.type === 'code') {
    return (
      <textarea
        className="inp"
        rows={field.type === 'code' ? 8 : 4}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        style={{ ...inputStyle, fontFamily: field.type === 'code' ? 'monospace' : 'inherit' }}
      />
    );
  }

  if (field.type === 'color') {
    const colorValue = value || '#000000';
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input type="color" value={/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(colorValue) ? colorValue : '#000000'} onChange={(e) => onChange(e.target.value)} style={{ width: 36, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'none' }} />
        <input type="text" className="inp" value={value || ''} onChange={(e) => onChange(e.target.value)} style={{ flex: 1, fontSize: 12 }} />
      </div>
    );
  }

  if (field.type === 'align') {
    return (
      <div style={{ display: 'flex', gap: 6 }}>
        {['left', 'center', 'right'].map((al) => (
          <button
            key={al}
            type="button"
            onClick={() => onChange(al)}
            style={{ flex: 1, padding: 6, background: value === al ? '#eff6ff' : '#f8fafc', border: value === al ? '1px solid #2563eb' : '1px solid #cbd5e1', borderRadius: 6, fontSize: 11, fontWeight: 700, color: value === al ? '#2563eb' : '#64748b', cursor: 'pointer' }}
          >
            {al}
          </button>
        ))}
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <select className="inp" value={value || ''} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
        {(field.options || []).map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }

  if (field.type === 'toggle') {
    return (
      <button
        type="button"
        onClick={() => onChange(!value)}
        style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #cbd5e1', background: value ? '#eff6ff' : '#f8fafc', color: value ? '#2563eb' : '#64748b', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
      >
        {value ? 'On' : 'Off'}
      </button>
    );
  }

  if (field.type === 'number') {
    return <input type="number" className="inp" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle} />;
  }

  return <input type="text" className="inp" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} style={inputStyle} />;
}

function ListEditor({ value, onChange }) {
  const items = Array.isArray(value) ? value : [];
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <input className="inp" value={item} onChange={(e) => {
            const next = [...items];
            next[i] = e.target.value;
            onChange(next);
          }} style={{ flex: 1, fontSize: 12 }} />
          <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} style={{ border: 'none', background: '#fef2f2', color: '#dc2626', borderRadius: 6, width: 28, cursor: 'pointer' }}>
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, 'New item'])} style={{ width: '100%', border: '1px dashed #cbd5e1', background: '#f8fafc', color: '#2563eb', borderRadius: 6, padding: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
        <Plus size={12} style={{ marginRight: 4 }} /> Add item
      </button>
    </div>
  );
}

function ItemsEditor({ value, itemFields, onChange }) {
  const items = Array.isArray(value) ? value : [];
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 10, marginBottom: 10, background: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#64748b' }}>ITEM {i + 1}</span>
            <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer' }}>
              <Trash2 size={12} />
            </button>
          </div>
          {(itemFields || []).map((field) => (
            <div key={field.key} style={{ marginBottom: 8 }}>
              <label style={labelStyle}>{field.label}</label>
              <FieldControl
                field={field}
                value={item?.[field.key]}
                onChange={(next) => {
                  const copy = items.map((row, idx) => idx === i ? { ...row, [field.key]: next } : row);
                  onChange(copy);
                }}
              />
            </div>
          ))}
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          const blank = {};
          (itemFields || []).forEach((field) => { blank[field.key] = field.type === 'number' ? 0 : ''; });
          onChange([...items, blank]);
        }}
        style={{ width: '100%', border: '1px dashed #cbd5e1', background: '#fff', color: '#2563eb', borderRadius: 6, padding: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
      >
        <Plus size={12} style={{ marginRight: 4 }} /> Add item
      </button>
    </div>
  );
}

export default function ElementInspector({ element, onChange }) {
  if (!element) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8' }}>
        <Sliders size={32} style={{ margin: '0 auto 8px', color: '#cbd5e1' }} />
        <div style={{ fontSize: 13, fontWeight: 700 }}>No element selected</div>
        <p style={{ fontSize: 11.5, margin: '4px 0 0' }}>Click any block on the canvas to edit every field.</p>
      </div>
    );
  }

  const def = getElementDef(element.type);
  const fields = def.fields || [];

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', marginBottom: 12 }}>
        Editing {def.label}
      </div>
      {fields.map((field) => (
        <div key={field.key} style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{field.label}</label>
          {field.type === 'list' ? (
            <ListEditor value={element[field.key]} onChange={(next) => onChange(field.key, next)} />
          ) : field.type === 'items' ? (
            <ItemsEditor value={element[field.key]} itemFields={field.itemFields} onChange={(next) => onChange(field.key, next)} />
          ) : (
            <FieldControl field={field} value={element[field.key]} onChange={(next) => onChange(field.key, next)} />
          )}
        </div>
      ))}
      {(element.type === 'code' || element.type === 'custom_html') && htmlLooksFullscreen(element.code) && (
        <div style={{ background: '#fff7ed', border: '1px solid #fdba74', borderRadius: 8, padding: 10, fontSize: 11.5, color: '#9a3412', lineHeight: 1.5 }}>
          Fullscreen / fixed iframes stay inside this block while you edit. Use <b>Preview</b> or <b>Publish</b> to see them cover the live page.
        </div>
      )}
    </div>
  );
}
