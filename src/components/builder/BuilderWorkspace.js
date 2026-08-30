'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowLeft,
  Code,
  Eye,
  ExternalLink,
  Monitor,
  Plus,
  Redo2,
  Smartphone,
  Undo2,
  X
} from 'lucide-react';
import { CheckCircle2 } from 'lucide-react';
import {
  createElement,
  createElements,
  DEFAULT_PAGE,
  PAGE_FONTS,
  PREBUILT_SECTIONS
} from '@/lib/builder/elementRegistry';
import {
  addColumn,
  createLayoutRow,
  duplicateAt,
  findElement,
  insertDestination,
  moveColumn,
  moveElement,
  moveInList,
  removeColumn,
  removeElement,
  updateElement
} from '@/lib/builder/layoutTree';
import LayoutCanvas from './LayoutCanvas';
import ElementInspector from './ElementInspector';
import ElementPalette from './ElementPalette';

const EMPTY_CANVAS = [];

function canvasSnapshot(value) {
  try {
    return JSON.stringify(value ?? null);
  } catch {
    return '';
  }
}

export default function BuilderWorkspace({
  funnel,
  stepIndex,
  onChangeStep,
  onClose,
  onUpdateCanvas,
  onUpdateStep,
  onPublish,
  isStore = false
}) {
  const step = funnel?.steps?.[stepIndex] || funnel?.steps?.[0] || null;
  const canvas = step?.canvas || EMPTY_CANVAS;
  const pageKey = canvasSnapshot({ ...DEFAULT_PAGE, ...(step?.page || {}) });
  const page = useMemo(() => {
    try {
      const parsed = JSON.parse(pageKey);
      return { ...DEFAULT_PAGE, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
    } catch {
      return { ...DEFAULT_PAGE };
    }
  }, [pageKey]);

  const [mounted, setMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [builderDevice, setBuilderDevice] = useState('desktop');
  const [navTab, setNavTab] = useState('rows');
  const [prebuiltCategory, setPrebuiltCategory] = useState('Welcome');
  const [elementsSearch, setElementsSearch] = useState('');
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [activeTarget, setActiveTarget] = useState({ kind: 'root' });
  const [dragOver, setDragOver] = useState(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saveState, setSaveState] = useState('Saved');
  const historyRef = useRef([]);
  const historyIndex = useRef(-1);
  const skipHistory = useRef(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    setSaveState((prev) => (prev === 'Saved' ? prev : 'Saved'));
  }, [canvas]);

  useEffect(() => {
    if (!step) return;
    if (skipHistory.current) {
      skipHistory.current = false;
      return;
    }
    const snapshot = canvasSnapshot(canvas);
    const current = historyRef.current[historyIndex.current];
    if (current === snapshot) return;
    historyRef.current = historyRef.current.slice(0, historyIndex.current + 1);
    historyRef.current.push(snapshot);
    historyIndex.current = historyRef.current.length - 1;
  }, [canvas, step?.id]);

  const selectedElement = useMemo(
    () => findElement(canvas, selectedElementId),
    [canvas, selectedElementId]
  );

  const applyCanvas = (nextCanvas) => {
    const next = nextCanvas || EMPTY_CANVAS;
    if (next === canvas) return;
    if (canvasSnapshot(next) === canvasSnapshot(canvas)) return;
    setSaveState((prev) => (prev === 'Saving...' ? prev : 'Saving...'));
    onUpdateCanvas(next);
  };

  const applyHistory = (index) => {
    const snapshot = historyRef.current[index];
    if (!snapshot) return;
    skipHistory.current = true;
    historyIndex.current = index;
    applyCanvas(JSON.parse(snapshot));
  };

  const addByType = (type, dest = null) => {
    let incoming = [];
    if (String(type).startsWith('prebuilt:')) {
      const id = String(type).slice(9);
      const preset = PREBUILT_SECTIONS.find((s) => s.id === id);
      incoming = createElements(preset?.types || ['hero']);
    } else {
      incoming = [createElement(type)];
    }

    const target = dest || activeTarget || { kind: 'root' };
    applyCanvas(insertDestination(canvas, target, incoming));
    setSelectedElementId(incoming[0]?.id || null);
    if (incoming[0]?.type === 'row') setNavTab('inspector');
    else setNavTab('inspector');
    setDragOver(null);
  };

  const moveSelected = (direction) => {
    applyCanvas(moveInList(canvas, selectedElementId, direction));
  };

  const deleteElement = (elId) => {
    applyCanvas(removeElement(canvas, elId));
    if (selectedElementId === elId) setSelectedElementId(null);
  };

  const duplicateElement = (elId) => {
    const result = duplicateAt(canvas, elId);
    applyCanvas(result.canvas);
    if (result.cloneId) setSelectedElementId(result.cloneId);
  };

  const updateProp = (elId, key, value) => {
    applyCanvas(updateElement(canvas, elId, (el) => ({ ...el, [key]: value })));
  };

  const handleDrop = (dest, e) => {
    e.preventDefault();
    e.stopPropagation();
    const existingId = e.dataTransfer.getData('existing_el_id');
    const newType = e.dataTransfer.getData('element_type');
    if (existingId) {
      applyCanvas(moveElement(canvas, existingId, dest));
      setSelectedElementId(existingId);
    } else if (newType) {
      addByType(newType, dest);
    }
    setActiveTarget(dest.kind === 'column' ? { kind: 'column', rowId: dest.rowId, colId: dest.colId } : { kind: 'root' });
    setDragOver(null);
  };

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        applyHistory(historyIndex.current - 1);
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault();
        applyHistory(historyIndex.current + 1);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedElementId) {
        e.preventDefault();
        duplicateElement(selectedElementId);
      } else if (!typing && (e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        e.preventDefault();
        deleteElement(selectedElementId);
      } else if (e.key === 'Escape') {
        setSelectedElementId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedElementId, canvas]);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const entityId = encodeURIComponent(funnel?.id || '');
  const liveUrl = origin
    ? `${origin}/s/${entityId}`
    : '';
  const savedUrl = origin
    ? (isStore
      ? `${origin}/preview-site?storeId=${entityId}&pageIdx=${stepIndex}&draft=1`
      : `${origin}/preview-site?funnelId=${entityId}&stepIdx=${stepIndex}&draft=1`)
    : '';

  const openPalette = (tab) => {
    setIsDrawerOpen(true);
    setNavTab(tab);
  };

  if (!mounted || typeof document === 'undefined' || !step) return null;

  return createPortal(
    <div className="uk-builder-root" style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', background: '#f8fafc', zIndex: 99999999, display: 'flex', flexDirection: 'column', color: '#0f172a', fontFamily: '"DM Sans", system-ui, sans-serif' }}>
      <style>{`
        .uk-builder-root .inp:not(.uk-builder-code),
        .uk-builder-root input.inp,
        .uk-builder-root textarea.inp:not(.uk-builder-code),
        .uk-builder-root select.inp {
          background: #ffffff !important;
          color: #0f172a !important;
          border: 1px solid #cbd5e1 !important;
          caret-color: #2563eb;
        }
        .uk-builder-root .inp::placeholder {
          color: #94a3b8 !important;
        }
        .uk-builder-root .inp:focus {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12) !important;
        }
        .uk-builder-root option {
          background: #ffffff;
          color: #0f172a;
        }
        .uk-builder-root .uk-html-sandbox {
          transform: translateZ(0);
          isolation: isolate;
          overflow: hidden;
        }
        .uk-builder-root .uk-html-sandbox,
        .uk-builder-root .uk-html-sandbox * {
          pointer-events: none !important;
        }
        .uk-builder-root .uk-html-sandbox iframe {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
          z-index: 0 !important;
        }
      `}</style>
      <div style={{ height: 56, background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 50, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <div style={{ height: 20, width: 1, background: '#e2e8f0' }} />
          <span style={{ background: '#ecfdf5', color: '#15803d', fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>{saveState}</span>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            style={{ background: isDrawerOpen ? '#eff6ff' : '#fff', color: isDrawerOpen ? '#2563eb' : '#475569', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} /> {isDrawerOpen ? 'Hide drawer' : '+ Add element'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select className="inp" value={stepIndex} onChange={(e) => onChangeStep(Number(e.target.value))} style={{ fontSize: 12.5, padding: '4px 12px' }}>
            {funnel?.steps?.map((st, idx) => <option key={st.id} value={idx}>{st.name}</option>)}
          </select>
          <div style={{ display: 'flex', background: '#f1f5f9', padding: 2, borderRadius: 6, border: '1px solid #e2e8f0' }}>
            <button type="button" onClick={() => setBuilderDevice('desktop')} style={{ background: builderDevice === 'desktop' ? '#fff' : 'none', border: 'none', color: builderDevice === 'desktop' ? '#2563eb' : '#64748b', padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}><Monitor size={16} /></button>
            <button type="button" onClick={() => setBuilderDevice('mobile')} style={{ background: builderDevice === 'mobile' ? '#fff' : 'none', border: 'none', color: builderDevice === 'mobile' ? '#2563eb' : '#64748b', padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}><Smartphone size={16} /></button>
          </div>
          <button type="button" onClick={() => applyHistory(historyIndex.current - 1)} style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 6, padding: 6, cursor: 'pointer' }}><Undo2 size={15} /></button>
          <button type="button" onClick={() => applyHistory(historyIndex.current + 1)} style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 6, padding: 6, cursor: 'pointer' }}><Redo2 size={15} /></button>
          <button type="button" onClick={() => setIsCodeModalOpen(true)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f172a', padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Code size={16} color="#2563eb" /> CSS
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button type="button" onClick={() => window.open(savedUrl, '_blank')} style={{ background: '#fff', border: '1px solid #cbd5e1', color: '#334155', padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Eye size={15} /> Preview
          </button>
          <button
            type="button"
            onClick={() => {
              if (onPublish) onPublish();
              setIsPublishModalOpen(true);
            }}
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', padding: '6px 20px', borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            Publish
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {isDrawerOpen && (
          <div style={{ display: 'flex', height: '100%', background: '#fff', borderRight: '1px solid #e2e8f0', zIndex: 40, position: 'relative' }}>
            <div style={{ width: 85, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: 12, overflowY: 'auto' }}>
              {[
                { id: 'rows', label: 'Rows' },
                { id: 'elements', label: 'Elements' },
                { id: 'prebuilt', label: 'Prebuilt' },
                { id: 'inspector', label: 'Inspector' },
                { id: 'page', label: 'Page' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setNavTab(item.id)}
                  style={{ background: navTab === item.id ? '#eff6ff' : 'none', color: navTab === item.id ? '#2563eb' : '#64748b', border: 'none', width: 76, padding: '8px 4px', borderRadius: 8, fontSize: 10.5, fontWeight: navTab === item.id ? 700 : 500, cursor: 'pointer' }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div style={{ width: 320, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 800 }}>
                  {navTab === 'inspector' ? 'Customize element' : navTab === 'page' ? 'Page settings' : navTab === 'prebuilt' ? 'Prebuilt sections' : navTab === 'rows' ? 'Rows & columns' : 'Add any element'}
                </h4>
                <button type="button" onClick={() => setIsDrawerOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={16} /></button>
              </div>

              {navTab === 'inspector' && (
                <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
                  {activeTarget?.kind === 'column' && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: 8, marginBottom: 12, fontSize: 11, color: '#15803d', fontWeight: 700 }}>
                      New elements will drop into the selected column.
                    </div>
                  )}
                  <ElementInspector element={selectedElement} onChange={(key, value) => selectedElement && updateProp(selectedElement.id, key, value)} />
                  {selectedElement?.type === 'row' && (
                    <button type="button" onClick={() => applyCanvas(addColumn(canvas, selectedElement.id))} style={{ width: '100%', marginTop: 8, border: '1px dashed #2563eb', background: '#eff6ff', color: '#2563eb', borderRadius: 8, padding: 9, fontWeight: 700, cursor: 'pointer' }}>
                      + Add another column
                    </button>
                  )}
                </div>
              )}

              {navTab === 'page' && (
                <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
                  {[
                    ['background', 'Page background', 'color'],
                    ['textColor', 'Default text', 'color'],
                    ['maxWidth', 'Content width', 'number'],
                    ['paddingY', 'Vertical padding', 'number'],
                    ['paddingX', 'Side padding', 'number']
                  ].map(([key, label, kind]) => (
                    <div key={key} style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>{label}</label>
                      {kind === 'color' ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input type="color" value={page[key] || '#ffffff'} onChange={(e) => onUpdateStep({ page: { ...page, [key]: e.target.value } })} />
                          <input className="inp" value={page[key] || ''} onChange={(e) => onUpdateStep({ page: { ...page, [key]: e.target.value } })} style={{ flex: 1, fontSize: 12 }} />
                        </div>
                      ) : (
                        <input className="inp" type="number" value={page[key] ?? ''} onChange={(e) => onUpdateStep({ page: { ...page, [key]: Number(e.target.value) } })} style={{ width: '100%', fontSize: 12 }} />
                      )}
                    </div>
                  ))}
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Font family</label>
                    <select className="inp" value={page.fontFamily} onChange={(e) => onUpdateStep({ page: { ...page, fontFamily: e.target.value } })} style={{ width: '100%' }}>
                      {PAGE_FONTS.map((font) => <option key={font.id} value={font.id}>{font.label}</option>)}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateStep({ page: { ...page, showBranding: !page.showBranding } })}
                    style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #cbd5e1', background: page.showBranding ? '#eff6ff' : '#f8fafc', color: page.showBranding ? '#2563eb' : '#64748b', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                  >
                    {page.showBranding ? 'Branding footer on' : 'Branding footer off'}
                  </button>
                </div>
              )}

              {(navTab === 'elements' || navTab === 'prebuilt' || navTab === 'rows') && (
                <ElementPalette
                  search={elementsSearch}
                  onSearch={setElementsSearch}
                  mode={navTab}
                  prebuiltCategory={prebuiltCategory}
                  onPrebuiltCategory={setPrebuiltCategory}
                  onAdd={(type) => addByType(type)}
                  onDragStartType={(type, e) => {
                    e.dataTransfer.setData('element_type', type);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                />
              )}
            </div>
          </div>
        )}

        <div
          onDragOver={(e) => e.preventDefault()}
          onClick={() => { setSelectedElementId(null); setActiveTarget({ kind: 'root' }); }}
          style={{ flex: 1, background: '#f1f5f9', padding: 30, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}
        >
          <style>{page.customCss || ''}</style>
          <div
            style={{
              width: builderDevice === 'mobile' ? 375 : '100%',
              maxWidth: page.maxWidth || 960,
              background: page.background || '#fff',
              color: page.textColor || '#0f172a',
              fontFamily: `"${page.fontFamily || 'DM Sans'}", system-ui, sans-serif`,
              minHeight: 700,
              borderRadius: 12,
              boxShadow: '0 4px 25px rgba(0,0,0,0.06)',
              padding: `${page.paddingY || 40}px ${page.paddingX || 24}px`,
              alignSelf: 'flex-start'
            }}
          >
            {canvas.length === 0 ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver({ kind: 'root', slot: 0 }); }}
                onDrop={(e) => handleDrop({ kind: 'root', slot: 0 }, e)}
                onClick={(e) => { e.stopPropagation(); openPalette('rows'); }}
                style={{ border: '2px dashed #cbd5e1', borderRadius: 12, padding: '80px 20px', textAlign: 'center', cursor: 'pointer' }}
              >
                <Plus size={36} style={{ color: '#94a3b8', marginBottom: 8 }} />
                <h4 style={{ margin: '0 0 6px', fontSize: 17 }}>Add a row, then drop elements into columns</h4>
                <p style={{ margin: 0, color: '#94a3b8' }}>1, 2, 3 or 4 columns. Stack extra rows. Put many blocks in the same column.</p>
              </div>
            ) : (
              <div style={{ border: '2px solid #22c55e', borderRadius: 10, padding: 24, position: 'relative' }}>
                <span style={{ position: 'absolute', top: -12, left: 16, background: '#22c55e', color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 8px', borderRadius: 4 }}>SECTION</span>
                <LayoutCanvas
                  items={canvas}
                  dest={{ kind: 'root' }}
                  selectedId={selectedElementId}
                  activeTarget={activeTarget}
                  dragOver={dragOver}
                  setDragOver={setDragOver}
                  stackColumns={builderDevice === 'mobile'}
                  onSelect={(id) => { setSelectedElementId(id); setNavTab('inspector'); }}
                  onDrop={handleDrop}
                  onMove={(id, direction) => applyCanvas(moveInList(canvas, id, direction))}
                  onDuplicate={duplicateElement}
                  onDelete={deleteElement}
                  onAddColumn={(rowId) => applyCanvas(addColumn(canvas, rowId))}
                  onRemoveColumn={(rowId, colId) => applyCanvas(removeColumn(canvas, rowId, colId))}
                  onMoveColumn={(rowId, colId, direction) => applyCanvas(moveColumn(canvas, rowId, colId, direction))}
                  onAddRowInside={(rowId, colId) => {
                    const row = createLayoutRow(1);
                    applyCanvas(insertDestination(canvas, { kind: 'column', rowId, colId }, [row]));
                    setSelectedElementId(row.id);
                    setActiveTarget({ kind: 'column', rowId: row.id, colId: row.columns[0].id });
                  }}
                  onSetTarget={setActiveTarget}
                  onOpenPalette={openPalette}
                />
                <button type="button" onClick={() => { setActiveTarget({ kind: 'root' }); openPalette('elements'); }} style={{ width: '100%', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: 6, padding: 10, color: '#2563eb', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
                  + Add element
                </button>
                <button type="button" onClick={() => { setActiveTarget({ kind: 'root' }); addByType('row_2'); }} style={{ width: '100%', background: '#f0fdf4', border: '1px dashed #22c55e', borderRadius: 6, padding: 10, color: '#15803d', fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
                  + Add row
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isCodeModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999999, padding: 20 }}>
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 16, width: '100%', maxWidth: 750, color: '#f8fafc' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Code size={18} color="#38bdf8" /> Custom page CSS</h3>
              <button type="button" onClick={() => setIsCodeModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ padding: 20 }}>
              <textarea className="inp uk-builder-code" rows={12} value={page.customCss || ''} onChange={(e) => onUpdateStep({ page: { ...page, customCss: e.target.value } })} style={{ width: '100%', fontFamily: 'monospace', fontSize: 13, background: '#020617', color: '#38bdf8', border: '1px solid #334155' }} />
            </div>
            <div style={{ padding: '14px 24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsCodeModalOpen(false)} style={{ background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 700, cursor: 'pointer' }}>Apply CSS</button>
            </div>
          </div>
        </div>
      )}

      {isPublishModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999999999, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: 24, textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: 20 }}>Page published</h3>
              <p style={{ color: '#64748b', fontSize: 13.5, margin: '0 0 20px' }}>Published URL is the live snapshot. Saved URL always shows your latest edits.</p>
              <div style={{ textAlign: 'left', marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Published URL</div>
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 10 }}>
                  <input readOnly value={liveUrl} style={{ border: 'none', background: 'none', width: '100%', fontSize: 13, fontWeight: 600, outline: 'none' }} />
                  <button type="button" onClick={() => { navigator.clipboard.writeText(liveUrl); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }} style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: copiedLink ? '#16a34a' : '#2563eb' }}>
                    {copiedLink ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div style={{ textAlign: 'left', marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>Saved URL</div>
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 10 }}>
                  <input readOnly value={savedUrl} style={{ border: 'none', background: 'none', width: '100%', fontSize: 13, fontWeight: 600, outline: 'none' }} />
                  <button type="button" onClick={() => { navigator.clipboard.writeText(savedUrl); }} style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#2563eb' }}>
                    Copy
                  </button>
                </div>
              </div>
              <button type="button" onClick={() => window.open(liveUrl, '_blank')} style={{ width: '100%', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                <ExternalLink size={16} /> Open published URL
              </button>
              <button type="button" onClick={() => window.open(savedUrl, '_blank')} style={{ width: '100%', background: '#fff', color: '#2563eb', border: '1px solid #cbd5e1', borderRadius: 8, padding: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                <Eye size={16} /> Open saved URL
              </button>
              <button type="button" onClick={() => { setIsPublishModalOpen(false); onClose(); }} style={{ width: '100%', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, padding: 10, fontWeight: 600, cursor: 'pointer' }}>
                Return to dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
