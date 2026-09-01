'use client';

import { uid } from './elementRegistry';

export function createColumn(canvas = []) {
  return { id: uid('col'), canvas };
}

export function createLayoutRow(count = 2, overrides = {}) {
  const n = Math.max(1, Math.min(6, Number(count) || 1));
  return {
    id: uid('row'),
    type: 'row',
    gap: 16,
    valign: 'stretch',
    bg: 'transparent',
    padding: '10px',
    columns: Array.from({ length: n }, () => createColumn()),
    ...overrides,
    type: 'row'
  };
}

export function isRow(el) {
  return el?.type === 'row';
}

export function findElement(list, id) {
  for (const el of list || []) {
    if (el.id === id) return el;
    if (isRow(el)) {
      for (const col of el.columns || []) {
        const found = findElement(col.canvas || [], id);
        if (found) return found;
      }
    }
  }
  return null;
}

export function findLocation(list, id, parent = null, colId = null) {
  for (let i = 0; i < (list || []).length; i += 1) {
    const el = list[i];
    if (el.id === id) return { parent, colId, list, index: i };
    if (isRow(el)) {
      for (const col of el.columns || []) {
        const found = findLocation(col.canvas || [], id, el, col.id);
        if (found) return found;
      }
    }
  }
  return null;
}

export function cloneElementDeep(el) {
  const copy = JSON.parse(JSON.stringify(el));
  const reid = (node) => {
    node.id = uid(node.type === 'row' ? 'row' : 'el');
    if (isRow(node)) {
      node.columns = (node.columns || []).map((col) => ({
        id: uid('col'),
        canvas: (col.canvas || []).map((child) => {
          const next = JSON.parse(JSON.stringify(child));
          reid(next);
          return next;
        })
      }));
    }
  };
  reid(copy);
  return copy;
}

export function updateElement(list, id, updater) {
  return (list || []).map((el) => {
    if (el.id === id) return updater(el);
    if (isRow(el)) {
      return {
        ...el,
        columns: (el.columns || []).map((col) => ({
          ...col,
          canvas: updateElement(col.canvas || [], id, updater)
        }))
      };
    }
    return el;
  });
}

export function removeElement(list, id) {
  return (list || []).reduce((acc, el) => {
    if (el.id === id) return acc;
    if (isRow(el)) {
      acc.push({
        ...el,
        columns: (el.columns || []).map((col) => ({
          ...col,
          canvas: removeElement(col.canvas || [], id)
        }))
      });
      return acc;
    }
    acc.push(el);
    return acc;
  }, []);
}

export function extractElement(list, id) {
  const element = findElement(list, id);
  if (!element) return { canvas: list, element: null };
  return { canvas: removeElement(list, id), element };
}

export function insertAt(list, slot, items) {
  const next = [...(list || [])];
  const at = Math.max(0, Math.min(slot == null ? next.length : slot, next.length));
  next.splice(at, 0, ...items);
  return next;
}

export function insertIntoColumn(list, rowId, colId, slot, items) {
  return (list || []).map((el) => {
    if (el.id === rowId && isRow(el)) {
      return {
        ...el,
        columns: (el.columns || []).map((col) => (
          col.id === colId ? { ...col, canvas: insertAt(col.canvas || [], slot, items) } : col
        ))
      };
    }
    if (isRow(el)) {
      return {
        ...el,
        columns: (el.columns || []).map((col) => ({
          ...col,
          canvas: insertIntoColumn(col.canvas || [], rowId, colId, slot, items)
        }))
      };
    }
    return el;
  });
}

export function addColumn(list, rowId) {
  return updateElement(list, rowId, (row) => {
    if ((row.columns || []).length >= 6) return row;
    return { ...row, columns: [...(row.columns || []), createColumn()] };
  });
}

export function removeColumn(list, rowId, colId) {
  return updateElement(list, rowId, (row) => {
    const cols = (row.columns || []).filter((col) => col.id !== colId);
    return { ...row, columns: cols.length ? cols : [createColumn()] };
  });
}

export function moveColumn(list, rowId, colId, direction) {
  return updateElement(list, rowId, (row) => {
    const cols = [...(row.columns || [])];
    const from = cols.findIndex((col) => col.id === colId);
    const to = direction === 'left' ? from - 1 : from + 1;
    if (from < 0 || to < 0 || to >= cols.length) return row;
    [cols[from], cols[to]] = [cols[to], cols[from]];
    return { ...row, columns: cols };
  });
}

export function moveInList(list, id, direction) {
  const loc = findLocation(list, id);
  if (!loc) return list;
  const swapWith = direction === 'up' ? loc.index - 1 : loc.index + 1;
  if (swapWith < 0 || swapWith >= loc.list.length) return list;
  const nextList = [...loc.list];
  [nextList[loc.index], nextList[swapWith]] = [nextList[swapWith], nextList[loc.index]];
  if (!loc.parent) return nextList;
  return updateElement(list, loc.parent.id, (row) => ({
    ...row,
    columns: (row.columns || []).map((col) => (
      col.id === loc.colId ? { ...col, canvas: nextList } : col
    ))
  }));
}

export function insertDestination(list, dest, items) {
  if (dest?.kind === 'column') {
    return insertIntoColumn(list, dest.rowId, dest.colId, dest.slot, items);
  }
  return insertAt(list, dest?.slot, items);
}

export function moveElement(list, elId, dest) {
  const loc = findLocation(list, elId);
  if (!loc) return list;
  const { canvas, element } = extractElement(list, elId);
  if (!element) return list;

  let slot = dest.slot;
  const sameRoot = dest.kind !== 'column' && !loc.parent;
  const sameCol = dest.kind === 'column' && loc.parent?.id === dest.rowId && loc.colId === dest.colId;
  if ((sameRoot || sameCol) && loc.index < slot) slot -= 1;

  return insertDestination(canvas, { ...dest, slot }, [element]);
}

export function duplicateAt(list, elId) {
  const loc = findLocation(list, elId);
  if (!loc) return { canvas: list, cloneId: null };
  const clone = cloneElementDeep(loc.list[loc.index]);
  const dest = loc.parent
    ? { kind: 'column', rowId: loc.parent.id, colId: loc.colId, slot: loc.index + 1 }
    : { kind: 'root', slot: loc.index + 1 };
  return { canvas: insertDestination(list, dest, [clone]), cloneId: clone.id };
}

export const ROW_PRESETS = [
  { type: 'row_1', label: '1 column', count: 1, hint: 'Full-width stack' },
  { type: 'row_2', label: '2 columns', count: 2, hint: 'Side by side' },
  { type: 'row_3', label: '3 columns', count: 3, hint: 'Three across' },
  { type: 'row_4', label: '4 columns', count: 4, hint: 'Four across' }
];
