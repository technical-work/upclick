'use client';

import React from 'react';
import {
  Copy,
  GripVertical,
  MoveDown,
  MoveLeft,
  MoveRight,
  MoveUp,
  Plus,
  Trash2
} from 'lucide-react';
import ElementRenderer from './ElementRenderer';
import { isRow } from '@/lib/builder/layoutTree';

function slotKey(dest, slot) {
  if (dest.kind === 'column') return `col:${dest.rowId}:${dest.colId}:${slot}`;
  return `root:${slot}`;
}

function sameDest(a, b) {
  if (!a || !b) return false;
  if (a.kind !== b.kind || a.slot !== b.slot) return false;
  if (a.kind === 'column') return a.rowId === b.rowId && a.colId === b.colId;
  return true;
}

export default function LayoutCanvas({
  items,
  dest = { kind: 'root' },
  selectedId,
  activeTarget,
  dragOver,
  setDragOver,
  stackColumns,
  onSelect,
  onDrop,
  onMove,
  onDuplicate,
  onDelete,
  onAddColumn,
  onRemoveColumn,
  onMoveColumn,
  onAddRowInside,
  onSetTarget,
  onOpenPalette
}) {
  const renderSlot = (slot) => {
    const destAt = { ...dest, slot };
    const isTarget = sameDest(dragOver, destAt);
    return (
      <div
        key={slotKey(destAt, slot)}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(destAt); }}
        onDragLeave={(e) => { e.preventDefault(); if (sameDest(dragOver, destAt)) setDragOver(null); }}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDrop(destAt, e); }}
        style={{
          height: isTarget ? 34 : 8,
          margin: isTarget ? '6px 0' : '2px 0',
          borderRadius: 6,
          background: isTarget ? 'rgba(37, 99, 235, 0.12)' : 'transparent',
          border: isTarget ? '2px dashed #2563eb' : '2px dashed transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isTarget && <span style={{ fontSize: 11, fontWeight: 800, color: '#2563eb', display: 'flex', alignItems: 'center', gap: 4 }}><Plus size={14} /> Drop here</span>}
      </div>
    );
  };

  return (
    <div>
      {renderSlot(0)}
      {(items || []).map((el, idx) => (
        <React.Fragment key={el.id}>
          <div
            draggable={!isRow(el)}
            onDragStart={(e) => {
              e.stopPropagation();
              e.dataTransfer.setData('existing_el_id', el.id);
              e.dataTransfer.effectAllowed = 'move';
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(el.id);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              const slot = (e.clientY - rect.top) < rect.height / 2 ? idx : idx + 1;
              setDragOver({ ...dest, slot });
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              const slot = (e.clientY - rect.top) < rect.height / 2 ? idx : idx + 1;
              onDrop({ ...dest, slot }, e);
            }}
            style={{
              position: 'relative',
              margin: '8px 0',
              padding: isRow(el) ? 0 : 10,
              border: selectedId === el.id && !isRow(el) ? '2px solid #ea580c' : '1px solid transparent',
              borderRadius: 6,
              cursor: isRow(el) ? 'default' : 'grab'
            }}
          >
            {selectedId === el.id && !isRow(el) && (
              <div style={{ position: 'absolute', right: 8, top: -14, background: '#ea580c', color: '#fff', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4, padding: '2px 6px', zIndex: 20 }}>
                <GripVertical size={12} />
                <button type="button" onClick={(e) => { e.stopPropagation(); onMove(el.id, 'up'); }} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><MoveUp size={12} /></button>
                <button type="button" onClick={(e) => { e.stopPropagation(); onMove(el.id, 'down'); }} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><MoveDown size={12} /></button>
                <button type="button" onClick={(e) => { e.stopPropagation(); onDuplicate(el.id); }} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><Copy size={12} /></button>
                <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(el.id); }} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><Trash2 size={12} /></button>
              </div>
            )}

            {isRow(el) ? (
              <div
                onClick={(e) => { e.stopPropagation(); onSelect(el.id); }}
                style={{
                  border: selectedId === el.id ? '2px solid #2563eb' : '2px dashed #2563eb',
                  borderRadius: 10,
                  padding: 12,
                  background: el.bg && el.bg !== 'transparent' ? el.bg : '#fff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ background: '#2563eb', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
                    ROW · {el.columns?.length || 0} COLUMNS
                  </span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button type="button" onClick={(e) => { e.stopPropagation(); onAddColumn(el.id); }} style={{ border: '1px solid #bfdbfe', background: '#eff6ff', color: '#2563eb', borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+ Column</button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); onMove(el.id, 'up'); }} style={{ border: '1px solid #e2e8f0', background: '#fff', borderRadius: 6, padding: 4, cursor: 'pointer' }}><MoveUp size={12} /></button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); onMove(el.id, 'down'); }} style={{ border: '1px solid #e2e8f0', background: '#fff', borderRadius: 6, padding: 4, cursor: 'pointer' }}><MoveDown size={12} /></button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); onDuplicate(el.id); }} style={{ border: '1px solid #e2e8f0', background: '#fff', borderRadius: 6, padding: 4, cursor: 'pointer' }}><Copy size={12} /></button>
                    <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(el.id); }} style={{ border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', borderRadius: 6, padding: 4, cursor: 'pointer' }}><Trash2 size={12} /></button>
                  </div>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: stackColumns ? '1fr' : `repeat(${Math.max(el.columns?.length || 1, 1)}, minmax(0, 1fr))`,
                  gap: Number(el.gap) || 16,
                  alignItems: el.valign || 'stretch'
                }}>
                  {(el.columns || []).map((col, colIdx) => {
                    const colTarget = { kind: 'column', rowId: el.id, colId: col.id };
                    const isActive = activeTarget?.kind === 'column' && activeTarget.rowId === el.id && activeTarget.colId === col.id;
                    return (
                      <div
                        key={col.id}
                        onClick={(e) => { e.stopPropagation(); onSetTarget(colTarget); onSelect(el.id); }}
                        style={{
                          minHeight: 110,
                          border: isActive ? '2px solid #22c55e' : '1px dashed #94a3b8',
                          borderRadius: 8,
                          padding: 8,
                          background: isActive ? '#f0fdf4' : '#f8fafc'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 9, fontWeight: 800, color: '#64748b' }}>COLUMN {colIdx + 1}</span>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button type="button" onClick={(e) => { e.stopPropagation(); onMoveColumn(el.id, col.id, 'left'); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}><MoveLeft size={12} /></button>
                            <button type="button" onClick={(e) => { e.stopPropagation(); onMoveColumn(el.id, col.id, 'right'); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}><MoveRight size={12} /></button>
                            {(el.columns || []).length > 1 && (
                              <button type="button" onClick={(e) => { e.stopPropagation(); onRemoveColumn(el.id, col.id); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626' }}><Trash2 size={12} /></button>
                            )}
                          </div>
                        </div>
                        <LayoutCanvas
                          items={col.canvas || []}
                          dest={colTarget}
                          selectedId={selectedId}
                          activeTarget={activeTarget}
                          dragOver={dragOver}
                          setDragOver={setDragOver}
                          stackColumns={stackColumns}
                          onSelect={onSelect}
                          onDrop={onDrop}
                          onMove={onMove}
                          onDuplicate={onDuplicate}
                          onDelete={onDelete}
                          onAddColumn={onAddColumn}
                          onRemoveColumn={onRemoveColumn}
                          onMoveColumn={onMoveColumn}
                          onAddRowInside={onAddRowInside}
                          onSetTarget={onSetTarget}
                          onOpenPalette={onOpenPalette}
                        />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onSetTarget(colTarget); onOpenPalette('elements'); }}
                          style={{ width: '100%', marginTop: 6, border: '1px dashed #cbd5e1', background: '#fff', color: '#2563eb', borderRadius: 6, padding: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                        >
                          + Add element
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onAddRowInside(el.id, col.id); }}
                          style={{ width: '100%', marginTop: 6, border: '1px dashed #86efac', background: '#f0fdf4', color: '#15803d', borderRadius: 6, padding: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                        >
                          + Add row in this column
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <ElementRenderer el={el} interactive={false} />
            )}
          </div>
          {renderSlot(idx + 1)}
        </React.Fragment>
      ))}
    </div>
  );
}
