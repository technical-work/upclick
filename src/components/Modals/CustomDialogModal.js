'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBusiness } from '../../context/BusinessContext';

export default function CustomDialogModal() {
  const { lang, L, customDialog } = useBusiness();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (customDialog) {
      setInputValue(customDialog.defaultValue || '');
      // Auto focus the input after mount
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
    }
  }, [customDialog]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!customDialog) return;
      if (e.key === 'Escape') {
        if (customDialog.onCancel) {
          customDialog.onCancel();
        } else if (customDialog.onConfirm) {
          customDialog.onConfirm();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [customDialog, inputValue]);

  if (!customDialog) return null;

  const handleConfirm = () => {
    if (customDialog.type === 'prompt') {
      customDialog.onConfirm(inputValue);
    } else {
      customDialog.onConfirm();
    }
  };

  const handleCancel = () => {
    if (customDialog.onCancel) {
      customDialog.onCancel();
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={handleCancel}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 5, 10, 0.7)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000000
      }}
    >
      <div 
        className="modal-box card stagger" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '440px', 
          width: '90%', 
          background: 'var(--surface2)', 
          border: '1px solid var(--edge)', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          borderRadius: '16px',
          overflow: 'hidden',
          padding: '24px',
          position: 'relative'
        }}
      >
        {/* Header Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: customDialog.type === 'confirm' ? 'var(--purple-dim)' : customDialog.type === 'prompt' ? 'var(--orange-dim)' : 'var(--green-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            {customDialog.type === 'confirm' ? '❓' : customDialog.type === 'prompt' ? '✍️' : '🔔'}
          </div>
          <div style={{ fontFamily: 'var(--ff)', fontSize: '16px', fontWeight: 800, color: 'var(--t1)' }}>
            {customDialog.type === 'confirm' 
              ? L('Confirmation Required', 'تأكيد الإجراء') 
              : customDialog.type === 'prompt' 
                ? L('Input Requested', 'مطلوب إدخال بيانات') 
                : L('Notice', 'تنبيه')}
          </div>
        </div>

        {/* Message */}
        <p style={{ 
          fontSize: '13.5px', 
          color: 'var(--t2)', 
          lineHeight: '1.6', 
          marginBottom: '20px',
          whiteSpace: 'pre-wrap'
        }}>
          {customDialog.message}
        </p>

        {/* Prompt Input */}
        {customDialog.type === 'prompt' && (
          <div style={{ marginBottom: '24px' }}>
            <input 
              ref={inputRef}
              type="text"
              className="inp"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={L('Type here...', 'اكتب هنا...')}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '13px',
                borderRadius: '10px',
                border: '1px solid var(--edge2)',
                background: 'var(--surface3)',
                color: 'var(--t1)',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          {customDialog.type !== 'alert' && (
            <button 
              className="btn" 
              onClick={handleCancel}
              style={{
                padding: '8px 18px',
                borderRadius: '10px',
                fontSize: '13px',
                background: 'var(--surface3)',
                color: 'var(--t2)',
                border: '1px solid var(--edge)',
                cursor: 'pointer'
              }}
            >
              {L('Cancel', 'إلغاء')}
            </button>
          )}
          <button 
            className="btn btn-prime" 
            onClick={handleConfirm}
            style={{
              padding: '8px 22px',
              borderRadius: '10px',
              fontSize: '13px',
              background: customDialog.type === 'confirm' ? 'var(--purple)' : 'var(--orange)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {L('OK', 'موافق')}
          </button>
        </div>
      </div>
    </div>
  );
}
