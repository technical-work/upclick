'use client';

import React, { useMemo } from 'react';
import { GripVertical, Search } from 'lucide-react';
import { ELEMENT_CATEGORIES, ELEMENT_REGISTRY, PREBUILT_SECTIONS } from '@/lib/builder/elementRegistry';
import { ROW_PRESETS } from '@/lib/builder/layoutTree';

export default function ElementPalette({ search, onSearch, onAdd, onDragStartType, mode = 'elements', prebuiltCategory, onPrebuiltCategory }) {
  const query = (search || '').trim().toLowerCase();

  const categories = useMemo(() => {
    return ELEMENT_CATEGORIES.map((cat) => ({
      ...cat,
      types: cat.types.filter((type) => {
        const def = ELEMENT_REGISTRY[type];
        if (!query) return true;
        return type.includes(query) || (def?.label || '').toLowerCase().includes(query);
      })
    })).filter((cat) => cat.types.length > 0);
  }, [query]);

  const prebuiltCats = useMemo(() => [...new Set(PREBUILT_SECTIONS.map((s) => s.category))], []);
  const prebuiltCounts = useMemo(() => {
    const counts = {};
    PREBUILT_SECTIONS.forEach((s) => { counts[s.category] = (counts[s.category] || 0) + 1; });
    return counts;
  }, []);
  const prebuiltItems = PREBUILT_SECTIONS.filter((s) => !prebuiltCategory || s.category === prebuiltCategory);

  if (mode === 'rows') {
    return (
      <div style={{ padding: 14, overflowY: 'auto', flex: 1 }}>
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
          Add a row, then drop any elements inside each column. You can add more columns, stack extra rows, and put more than one block in the same column.
        </p>
        {ROW_PRESETS.map((preset) => (
          <div
            key={preset.type}
            draggable
            onDragStart={(e) => onDragStartType(preset.type, e)}
            onClick={() => onAdd(preset.type)}
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, marginBottom: 10, cursor: 'grab' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${preset.count}, 1fr)`, gap: 6, marginBottom: 8 }}>
              {Array.from({ length: preset.count }).map((_, i) => (
                <div key={i} style={{ height: 28, border: '1px dashed #2563eb', borderRadius: 4, background: '#eff6ff' }} />
              ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 800 }}>{preset.label}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{preset.hint}</div>
          </div>
        ))}
      </div>
    );
  }

  if (mode === 'prebuilt') {
    return (
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: 120, background: '#f8fafc', borderRight: '1px solid #e2e8f0', overflowY: 'auto', padding: '6px 0' }}>
          {prebuiltCats.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onPrebuiltCategory(cat)}
              style={{ width: '100%', textAlign: 'left', background: prebuiltCategory === cat ? '#ffffff' : 'none', color: prebuiltCategory === cat ? '#2563eb' : '#475569', fontWeight: prebuiltCategory === cat ? 700 : 500, border: 'none', padding: '8px 10px', fontSize: 11, cursor: 'pointer' }}
            >
              <span>{cat}</span>
              <span style={{ display: 'block', fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>{prebuiltCounts[cat] || 0} layouts</span>
            </button>
          ))}
        </div>
        <div style={{ flex: 1, padding: 12, overflowY: 'auto' }}>
          <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>
            {prebuiltCategory || 'All sections'} · {prebuiltItems.length}
          </div>
          {prebuiltItems.map((section) => (
            <div
              key={section.id}
              draggable
              onDragStart={(e) => onDragStartType(`prebuilt:${section.id}`, e)}
              onClick={() => onAdd(`prebuilt:${section.id}`)}
              style={{ background: '#0b0f19', borderRadius: 8, padding: 12, marginBottom: 10, color: '#fff', cursor: 'grab', border: '1px solid #1e293b' }}
            >
              <span style={{ fontSize: 8.5, color: section.accent || '#38bdf8', fontWeight: 800 }}>{section.category.toUpperCase()}</span>
              <div style={{ fontSize: 11.5, fontWeight: 800, margin: '4px 0 2px' }}>{section.label}</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>{section.hint || 'Adds real editable blocks'}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 14, overflowY: 'auto', flex: 1 }}>
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input className="inp" value={search} onChange={(e) => onSearch(e.target.value)} placeholder="Search elements" style={{ width: '100%', paddingLeft: 30, fontSize: 12 }} />
      </div>
      {categories.map((cat) => (
        <div key={cat.id} style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>{cat.label}</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {cat.types.map((type) => (
              <div
                key={type}
                draggable
                onDragStart={(e) => onDragStartType(type, e)}
                onClick={() => onAdd(type)}
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 8px', fontSize: 11, fontWeight: 600, cursor: 'grab', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <GripVertical size={12} style={{ color: '#94a3b8' }} />
                <span>{ELEMENT_REGISTRY[type]?.label || type}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
