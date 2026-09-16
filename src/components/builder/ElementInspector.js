'use client';

import React from 'react';
import { Plus, Sliders, Trash2, CheckCircle2, Star } from 'lucide-react';
import { getElementDef } from '@/lib/builder/elementRegistry';
import { htmlLooksFullscreen } from '@/lib/builder/customHtml';
import { getBuilderString, getElementI18nLabel, getFieldI18nLabel, getFieldOptionLabel } from '@/lib/builder/builderTranslations';

const labelStyle = { fontSize: '11px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' };
const inputStyle = { width: '100%', fontSize: '12.5px', boxSizing: 'border-box' };

function FieldControl({ field, value, onChange, lang = 'en' }) {
  const isRtl = lang === 'ar';

  if (field.type === 'textarea' || field.type === 'code') {
    return (
      <textarea
        className="inp"
        rows={field.type === 'code' ? 8 : 4}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        style={{ ...inputStyle, fontFamily: field.type === 'code' ? 'monospace' : 'inherit', direction: field.type === 'code' ? 'ltr' : (isRtl ? 'rtl' : 'ltr') }}
      />
    );
  }

  if (field.type === 'color') {
    const colorValue = value || '#000000';
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', direction: 'ltr' }}>
        <input type="color" value={/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(colorValue) ? colorValue : '#000000'} onChange={(e) => onChange(e.target.value)} style={{ width: 36, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'none' }} />
        <input type="text" className="inp" value={value || ''} onChange={(e) => onChange(e.target.value)} style={{ flex: 1, fontSize: 12 }} />
      </div>
    );
  }

  if (field.type === 'align') {
    const alignLabels = {
      left: isRtl ? 'يسار' : 'Left',
      center: isRtl ? 'وسط' : 'Center',
      right: isRtl ? 'يمين' : 'Right'
    };
    return (
      <div style={{ display: 'flex', gap: 6 }}>
        {['left', 'center', 'right'].map((al) => (
          <button
            key={al}
            type="button"
            onClick={() => onChange(al)}
            style={{ flex: 1, padding: 6, background: value === al ? '#eff6ff' : '#f8fafc', border: value === al ? '1px solid #2563eb' : '1px solid #cbd5e1', borderRadius: 6, fontSize: 11, fontWeight: 700, color: value === al ? '#2563eb' : '#64748b', cursor: 'pointer' }}
          >
            {alignLabels[al]}
          </button>
        ))}
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <select className="inp" value={value || ''} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
        {(field.options || []).map((opt) => (
          <option key={opt} value={opt}>
            {getFieldOptionLabel(opt, lang)}
          </option>
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
        {value ? (isRtl ? 'مفعّل' : 'On') : (isRtl ? 'معطّل' : 'Off')}
      </button>
    );
  }

  if (field.type === 'number') {
    return <input type="number" className="inp" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} style={inputStyle} />;
  }

  return <input type="text" className="inp" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} style={inputStyle} />;
}

function ListEditor({ value, onChange, lang = 'en' }) {
  const isRtl = lang === 'ar';
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
      <button type="button" onClick={() => onChange([...items, isRtl ? 'عنصر جديد' : 'New item'])} style={{ width: '100%', border: '1px dashed #cbd5e1', background: '#f8fafc', color: '#2563eb', borderRadius: 6, padding: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <Plus size={12} /> {getBuilderString('addItem', lang)}
      </button>
    </div>
  );
}

function OptionsManager({ value, onChange, lang = 'en', correctAnswer = '', onSelectCorrectAnswer }) {
  const isRtl = lang === 'ar';
  const [bulkInput, setBulkInput] = React.useState('');
  const [showBulk, setShowBulk] = React.useState(false);

  // Normalize options to clean array
  const rawOptions = Array.isArray(value)
    ? value
    : typeof value === 'string' && value.trim()
    ? value.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const options = rawOptions.length > 0
    ? rawOptions
    : (isRtl ? ['الخيار 1', 'الخيار 2', 'الخيار 3'] : ['Option 1', 'Option 2', 'Option 3']);

  const handleUpdateOption = (index, newVal) => {
    const oldVal = options[index];
    const updated = [...options];
    updated[index] = newVal;
    onChange(updated);
    if (correctAnswer && correctAnswer === oldVal && onSelectCorrectAnswer) {
      onSelectCorrectAnswer(newVal);
    }
  };

  const handleAddOption = () => {
    const nextIdx = options.length + 1;
    const defaultLabel = isRtl ? `الخيار ${nextIdx}` : `Option ${nextIdx}`;
    onChange([...options, defaultLabel]);
  };

  const handleRemoveOption = (indexToRemove) => {
    const removedVal = options[indexToRemove];
    if (options.length <= 1) {
      const def = isRtl ? ['الخيار 1'] : ['Option 1'];
      onChange(def);
      if (correctAnswer === removedVal && onSelectCorrectAnswer) {
        onSelectCorrectAnswer(def[0]);
      }
      return;
    }
    const updated = options.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
    if (correctAnswer === removedVal && onSelectCorrectAnswer) {
      onSelectCorrectAnswer(updated[0] || '');
    }
  };

  const handleBulkAdd = () => {
    if (!bulkInput.trim()) return;
    const parts = bulkInput.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) {
      onChange([...options, ...parts]);
      setBulkInput('');
      setShowBulk(false);
    }
  };

  const handleToggleCorrect = (opt) => {
    if (!onSelectCorrectAnswer) return;
    if (correctAnswer === opt) {
      onSelectCorrectAnswer('');
    } else {
      onSelectCorrectAnswer(opt);
    }
  };

  return (
    <div style={{ background: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px', marginTop: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: '800', color: '#1e40af' }}>
            📋 {isRtl ? 'قائمة الخيارات التفاعلية (Options)' : 'Interactive Choices List'}
          </span>
          <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: '999px', fontWeight: '700' }}>
            {options.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowBulk(!showBulk)}
          style={{
            background: 'none',
            border: 'none',
            color: '#2563eb',
            fontSize: '11px',
            fontWeight: '700',
            cursor: 'pointer',
            padding: '2px 6px',
            textDecoration: 'underline'
          }}
        >
          {showBulk ? (isRtl ? 'إغلاق الإدخال السريع' : 'Hide Bulk Add') : (isRtl ? '⚡ إدخال سريع' : '⚡ Quick Add')}
        </button>
      </div>

      {showBulk && (
        <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '8px', marginBottom: '10px' }}>
          <textarea
            className="inp"
            rows={2}
            placeholder={isRtl ? 'اكتب عدة خيارات مفصولة بفواصل أو أسطر واضغط إضافة (مثال: أحمر, أزرق, أخضر)' : 'Enter options separated by comma or new line...'}
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            style={{ width: '100%', fontSize: '11.5px', marginBottom: '6px', boxSizing: 'border-box', resize: 'vertical' }}
          />
          <button
            type="button"
            onClick={handleBulkAdd}
            style={{
              width: '100%',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px',
              fontSize: '11.5px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            {isRtl ? '+ إضافة كل الخيارات المكتوبة' : '+ Add All Bulk Options'}
          </button>
        </div>
      )}

      {/* Editable Option Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
        {options.map((opt, optIdx) => {
          const isCorrect = Boolean(correctAnswer && opt === correctAnswer);
          return (
            <div
              key={optIdx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 6px',
                borderRadius: '8px',
                background: isCorrect ? '#f0fdf4' : 'transparent',
                border: isCorrect ? '1.5px solid #10b981' : '1px solid transparent',
                transition: 'all 0.15s ease'
              }}
            >
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: isCorrect ? '#10b981' : '#eff6ff',
                  color: isCorrect ? '#ffffff' : '#2563eb',
                  fontSize: '11px',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: isCorrect ? '1px solid #059669' : '1px solid #dbeafe'
                }}
              >
                {optIdx + 1}
              </span>
              <input
                type="text"
                className="inp"
                value={opt}
                onChange={(e) => handleUpdateOption(optIdx, e.target.value)}
                placeholder={isRtl ? `الخيار ${optIdx + 1}...` : `Option ${optIdx + 1}...`}
                style={{
                  flex: 1,
                  fontSize: '12px',
                  padding: '6px 10px',
                  border: isCorrect ? '1px solid #86efac' : '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontWeight: isCorrect ? '700' : 'normal',
                  color: isCorrect ? '#065f46' : '#0f172a',
                  borderRadius: '6px'
                }}
              />

              {/* Set as Correct Answer Button (Compact) */}
              {onSelectCorrectAnswer && (
                <button
                  type="button"
                  onClick={() => handleToggleCorrect(opt)}
                  title={isCorrect ? (isRtl ? 'إلغاء تحديد هذا الخيار كإجابة صحيحة' : 'Unmark correct answer') : (isRtl ? 'تعيين هذا الخيار كإجابة صحيحة' : 'Mark as correct answer')}
                  style={{
                    height: '26px',
                    border: isCorrect ? '1px solid #10b981' : '1px solid #cbd5e1',
                    background: isCorrect ? '#ecfdf5' : '#f8fafc',
                    color: isCorrect ? '#047857' : '#64748b',
                    borderRadius: '5px',
                    padding: '2px 7px',
                    fontSize: '10.5px',
                    fontWeight: isCorrect ? '800' : '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    cursor: 'pointer',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isCorrect ? (
                    <>
                      <CheckCircle2 size={11} style={{ color: '#10b981' }} />
                      <span>{isRtl ? '✅ صحيحة' : '✅ Correct'}</span>
                    </>
                  ) : (
                    <>
                      <Star size={11} style={{ color: '#94a3b8' }} />
                      <span>{isRtl ? '⭐ تعيين' : '⭐ Set'}</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => handleRemoveOption(optIdx)}
                title={isRtl ? 'حذف هذا الخيار' : 'Delete Option'}
                style={{
                  width: '26px',
                  height: '26px',
                  border: '1px solid #fee2e2',
                  background: '#fef2f2',
                  color: '#dc2626',
                  borderRadius: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  padding: 0
                }}
              >
                <Trash2 size={11} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add New Option Button */}
      <button
        type="button"
        onClick={handleAddOption}
        style={{
          width: '100%',
          border: '1px dashed #3b82f6',
          background: '#eff6ff',
          color: '#1d4ed8',
          borderRadius: '7px',
          padding: '8px 12px',
          fontSize: '12px',
          fontWeight: '800',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          transition: 'all 0.15s ease'
        }}
      >
        <Plus size={13} strokeWidth={3} />
        {isRtl ? 'إضافة خيار جديد إلى القائمة' : 'Add another option to list'}
      </button>

      {/* Dedicated Target Correct Answer Selector Dropdown */}
      {onSelectCorrectAnswer && (
        <div
          style={{
            marginTop: '10px',
            padding: '10px 12px',
            background: correctAnswer ? '#f0fdf4' : '#f8fafc',
            border: `1.5px solid ${correctAnswer ? '#86efac' : '#e2e8f0'}`,
            borderRadius: '9px',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '800', color: correctAnswer ? '#166534' : '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🎯 {isRtl ? 'الإجابة النموذجية الصحيحة:' : 'Target Correct Answer:'}
            </span>
            {correctAnswer ? (
              <span style={{ fontSize: '10.5px', background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '1px 7px', borderRadius: '999px', fontWeight: '800' }}>
                {isRtl ? '✅ تم التعيين' : '✅ Selected'}
              </span>
            ) : (
              <span style={{ fontSize: '10.5px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '1px 7px', borderRadius: '999px', fontWeight: '700' }}>
                {isRtl ? '⚠️ لم تُحدد بعد' : '⚠️ Not Set'}
              </span>
            )}
          </div>
          <select
            className="inp"
            value={correctAnswer || ''}
            onChange={(e) => onSelectCorrectAnswer(e.target.value)}
            style={{
              width: '100%',
              fontSize: '12px',
              padding: '7px 10px',
              background: '#ffffff',
              borderColor: correctAnswer ? '#10b981' : '#cbd5e1',
              fontWeight: correctAnswer ? '700' : 'normal',
              color: correctAnswer ? '#065f46' : '#1e293b',
              borderRadius: '6px'
            }}
          >
            <option value="">{isRtl ? '-- اضغط هنا لاختيار الإجابة الصحيحة من القائمة --' : '-- Choose the correct answer from list --'}</option>
            {options.map((opt, oIdx) => (
              <option key={oIdx} value={opt}>
                {oIdx + 1}. {opt} {opt === correctAnswer ? (isRtl ? '  ✅ [الإجابة الصحيحة]' : '  ✅ [Correct Answer]') : ''}
              </option>
            ))}
          </select>
          {correctAnswer ? (
            <div style={{ marginTop: '6px', fontSize: '11px', color: '#047857', fontWeight: '600' }}>
              ✨ {isRtl ? `تم اعتماد الخيار (${correctAnswer}) كإجابة صحيحة يحصل الطالب/المختبر على النقاط عند اختياره.` : `Option (${correctAnswer}) is marked as the correct answer for automated grading.`}
            </div>
          ) : (
            <div style={{ marginTop: '6px', fontSize: '10.5px', color: '#64748b' }}>
              💡 {isRtl ? 'اضغط على زر "⭐ تعيين كصحيح" بجانب الخيار المطلوب بالأعلى أو اختره مباشرة من هذه القائمة.' : 'Click "⭐ Set Correct" beside the desired option above or select it directly from this dropdown.'}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '8px', fontSize: '10.5px', color: '#64748b', lineHeight: 1.4 }}>
        💡 {isRtl ? 'اكتب اسم الخيار مباشرة في الحقل ليظهر فوراً في القائمة المنسدلة في صفحتك.' : 'Type your choices directly above. Changes appear live on your form.'}
      </div>
    </div>
  );
}

function ItemsEditor({ value, itemFields, onChange, lang = 'en' }) {
  const isRtl = lang === 'ar';
  const items = Array.isArray(value) ? value : [];
  return (
    <div>
      {items.map((item, i) => (
        <div key={item?.id || i} style={{ border: '1px solid #cbd5e1', borderRadius: 10, padding: 12, marginBottom: 12, background: '#f8fafc', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#2563eb', color: '#fff', fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {i + 1}
              </span>
              {isRtl ? `عنصر ${i + 1} (${item?.label || getFieldOptionLabel(item?.type || 'text', lang)})` : `ITEM ${i + 1} (${item?.label || item?.type || 'text'})`}
            </span>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              style={{ border: 'none', background: '#fee2e2', color: '#dc2626', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}
              title={isRtl ? 'حذف هذا الحقل' : 'Delete field'}
            >
              <Trash2 size={12} /> {isRtl ? 'حذف' : 'Delete'}
            </button>
          </div>
          {(itemFields || []).map((field) => {
            if (field.key === 'options') {
              const needsOptions = item?.type === 'dropdown' || item?.type === 'select' || item?.type === 'radio' || item?.type === 'checkbox';
              if (!needsOptions) return null;
              return (
                <div key={field.key} style={{ marginBottom: 10 }}>
                  <OptionsManager
                    value={item?.[field.key] || (isRtl ? ['الخيار 1', 'الخيار 2', 'الخيار 3'] : ['Option 1', 'Option 2', 'Option 3'])}
                    correctAnswer={item?.correctAnswer || ''}
                    onSelectCorrectAnswer={(ans) => {
                      const copy = items.map((row, idx) => idx === i ? { ...row, correctAnswer: ans } : row);
                      onChange(copy);
                    }}
                    onChange={(next) => {
                      const copy = items.map((row, idx) => idx === i ? { ...row, [field.key]: next } : row);
                      onChange(copy);
                    }}
                    lang={lang}
                  />
                </div>
              );
            }

            if (field.key === 'correctAnswer') {
              const hasOptions = item?.type === 'dropdown' || item?.type === 'select' || item?.type === 'radio' || item?.type === 'checkbox';
              if (hasOptions) return null;
            }

            return (
              <div key={field.key} style={{ marginBottom: 8 }}>
                <label style={labelStyle}>{getFieldI18nLabel(field.key, field.label, lang)}</label>
                <FieldControl
                  field={field}
                  value={item?.[field.key]}
                  onChange={(next) => {
                    const copy = items.map((row, idx) => {
                      if (idx !== i) return row;
                      const updatedRow = { ...row, [field.key]: next };
                      if (field.key === 'type' && (next === 'dropdown' || next === 'select' || next === 'radio' || next === 'checkbox')) {
                        if (!updatedRow.options || (Array.isArray(updatedRow.options) && updatedRow.options.length === 0)) {
                          updatedRow.options = isRtl
                            ? ['الخيار 1', 'الخيار 2', 'الخيار 3']
                            : ['Option 1', 'Option 2', 'Option 3'];
                        }
                      }
                      return updatedRow;
                    });
                    onChange(copy);
                  }}
                  lang={lang}
                />
              </div>
            );
          })}
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          const blank = {
            id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            label: isRtl ? `حقل جديد ${items.length + 1}` : `New Field ${items.length + 1}`,
            type: 'text',
            placeholder: '',
            width: '100%',
            required: false,
            options: isRtl ? ['الخيار 1', 'الخيار 2', 'الخيار 3'] : ['Option 1', 'Option 2', 'Option 3'],
            correctAnswer: '',
            points: 10
          };
          (itemFields || []).forEach((field) => {
            if (blank[field.key] === undefined) {
              blank[field.key] = field.type === 'number' ? 0 : (field.type === 'toggle' ? false : '');
            }
          });
          onChange([...items, blank]);
        }}
        style={{
          width: '100%',
          border: '1px dashed #2563eb',
          background: '#eff6ff',
          color: '#1d4ed8',
          borderRadius: 8,
          padding: 10,
          fontSize: 12.5,
          fontWeight: 800,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6
        }}
      >
        <Plus size={14} strokeWidth={2.5} /> {getBuilderString('addItem', lang)}
      </button>
    </div>
  );
}

export default function ElementInspector({ element, onChange, lang = 'en' }) {
  const isRtl = lang === 'ar';

  if (!element) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8', direction: isRtl ? 'rtl' : 'ltr' }}>
        <Sliders size={32} style={{ margin: '0 auto 8px', color: '#cbd5e1' }} />
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{getBuilderString('noElementSelected', lang)}</div>
        <p style={{ fontSize: 11.5, margin: '4px 0 0', color: '#64748b' }}>{getBuilderString('clickBlockToEdit', lang)}</p>
      </div>
    );
  }

  const def = getElementDef(element.type);
  const fields = def.fields || [];

  return (
    <div style={{ direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
      <div style={{ fontSize: 11.5, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', marginBottom: 12 }}>
        {getBuilderString('editing', lang)}: {getElementI18nLabel(element.type, lang)}
      </div>
      {fields.map((field) => (
        <div key={field.key} style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{getFieldI18nLabel(field.key, field.label, lang)}</label>
          {field.type === 'list' ? (
            <ListEditor value={element[field.key]} onChange={(next) => onChange(field.key, next)} lang={lang} />
          ) : field.type === 'items' ? (
            <ItemsEditor value={element[field.key]} itemFields={field.itemFields} onChange={(next) => onChange(field.key, next)} lang={lang} />
          ) : (
            <FieldControl field={field} value={element[field.key]} onChange={(next) => onChange(field.key, next)} lang={lang} />
          )}
        </div>
      ))}
      {(element.type === 'code' || element.type === 'custom_html') && htmlLooksFullscreen(element.code) && (
        <div style={{ background: '#fff7ed', border: '1px solid #fdba74', borderRadius: 8, padding: 10, fontSize: 11.5, color: '#9a3412', lineHeight: 1.5 }}>
          {getBuilderString('fullscreenHtmlNotice', lang)}
        </div>
      )}
    </div>
  );
}
