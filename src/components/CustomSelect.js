'use client';

import React, { useState, useEffect } from 'react';

export default function CustomSelect({ className, value, onChange, children, placeholder, style, ...props }) {
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');

  // Extract all initial option values from children
  const optionValues = React.Children.map(children, child => child?.props?.value) || [];

  // Determine if the value loaded is custom (not in predefined options list)
  const isValueCustom = value && optionValues.length > 0 && !optionValues.includes(value);

  // Sync internal custom state on load/update
  useEffect(() => {
    if (isValueCustom) {
      setIsCustom(true);
      setCustomValue(value);
    }
  }, [value, isValueCustom]);

  const handleSelectChange = (e) => {
    const val = e.target.value;
    if (val === '__custom_other__') {
      setIsCustom(true);
      setCustomValue('');
      if (onChange) onChange({ target: { value: '' } });
    } else {
      setIsCustom(false);
      if (onChange) onChange(e);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setCustomValue(val);
    if (onChange) onChange({ target: { value: val } });
  };

  const handleBackToSelect = () => {
    setIsCustom(false);
    // Revert to first option value or empty string
    const firstOption = optionValues.find(v => v !== '__custom_other__') || '';
    if (onChange) onChange({ target: { value: firstOption } });
  };

  // Detect system language
  const isArabic = typeof window !== 'undefined' && localStorage.getItem('lang') === 'ar';

  if (isCustom) {
    return (
      <div style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}>
        <input
          type="text"
          className={className || "inp"}
          value={isValueCustom ? value : customValue}
          onChange={handleInputChange}
          placeholder={placeholder || (isArabic ? "أدخل قيمة مخصصة..." : "Enter custom value...")}
          style={{ flex: 1, ...style }}
          {...props}
        />
        <button
          type="button"
          onClick={handleBackToSelect}
          style={{
            height: '36px',
            width: '36px',
            borderRadius: '9px',
            border: '1px solid var(--edge2)',
            background: 'var(--surface3)',
            color: 'var(--t2)',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s'
          }}
          title={isArabic ? "الرجوع للقائمة" : "Back to list"}
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <select
      className={className || "inp"}
      value={value}
      onChange={handleSelectChange}
      style={style}
      {...props}
    >
      {children}
      <option value="__custom_other__" style={{ fontStyle: 'italic', color: 'var(--orange)' }}>
        ✨ {isArabic ? 'أخرى... (كتابة قيمة مخصصة)' : 'Other... (Enter custom value)'}
      </option>
    </select>
  );
}
