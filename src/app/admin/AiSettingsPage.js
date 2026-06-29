'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Key, DollarSign, Cpu, Save, RefreshCw } from 'lucide-react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

const DEFAULTS = {
  openaiApiKey: '',
  defaultUserCredit: 5.00,
  openaiModel: 'gpt-4o-mini'
};

const AiSettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const isRTL = i18n.language?.startsWith('ar');

  const [settings, setSettings] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Load global AI configuration
  useEffect(() => {
    if (!currentUser?.uid) return;
    getDoc(doc(db, 'tenants', 'global'))
      .then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          setSettings({
            openaiApiKey: data.openaiApiKey || '',
            defaultUserCredit: data.defaultUserCredit !== undefined ? Number(data.defaultUserCredit) : 5.00,
            openaiModel: data.openaiModel || 'gpt-4o-mini'
          });
        }
      })
      .catch(() => setLoadError(isRTL ? 'حدث خطأ أثناء تحميل البيانات' : 'Error loading settings'));
  }, [currentUser?.uid, isRTL]);

  const handleFieldChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'tenants', 'global'), {
        openaiApiKey: settings.openaiApiKey,
        defaultUserCredit: Number(settings.defaultUserCredit),
        openaiModel: settings.openaiModel,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULTS);
    setSaved(false);
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text2)',
    marginBottom: '6px',
    textTransform: 'uppercase',
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--bg3)',
    border: '1px solid var(--line2)',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '13px',
    color: 'var(--text)',
    outline: 'none',
    fontFamily: 'var(--font)',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ animation: 'fadeSlide 0.4s ease', maxWidth: '600px', margin: '0 auto' }}>
      {loadError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px', border: '1px solid rgba(239,68,68,0.2)' }}>
          ⚠️ {loadError}
        </div>
      )}

      <div className="card" style={{ marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '240px',
          height: '240px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '800', color: 'var(--text)', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid var(--line)' }}>
          <Cpu size={16} style={{ color: 'var(--accent)' }} />
          <span>{isRTL ? 'إعدادات مفتاح الذكاء الاصطناعي (OpenAI)' : 'OpenAI AI Integration Settings'}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 1 }}>
          
          {/* OpenAI API Key */}
          <div>
            <label style={labelStyle}>
              <Key size={12} style={{ marginInlineEnd: '4px', verticalAlign: 'middle' }} />
              {isRTL ? 'مفتاح OpenAI API (Secret Key)' : 'OpenAI API Secret Key'}
            </label>
            <input
              type="password"
              placeholder="sk-..."
              value={settings.openaiApiKey}
              onChange={e => handleFieldChange('openaiApiKey', e.target.value)}
              style={inputStyle}
            />
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
              {isRTL ? 'سيتم استخدام هذا المفتاح لتشغيل جميع استفسارات الذكاء الاصطناعي لجميع مستخدمي المنصة.' : 'All users will run their queries using this global API key.'}
            </div>
          </div>

          {/* Default User Credit */}
          <div>
            <label style={labelStyle}>
              <DollarSign size={12} style={{ marginInlineEnd: '4px', verticalAlign: 'middle' }} />
              {isRTL ? 'الرصيد الافتراضي للمستخدمين الجدد ($)' : 'Default Starting Credits for New Users ($)'}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="5.00"
              value={settings.defaultUserCredit}
              onChange={e => handleFieldChange('defaultUserCredit', e.target.value)}
              style={inputStyle}
            />
            <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
              {isRTL ? 'يُعطى هذا المبلغ تلقائياً ككريديت للمشترك الجديد عند إنشائه.' : 'This dollar credit will automatically be assigned to new accounts.'}
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <label style={labelStyle}>
              <Cpu size={12} style={{ marginInlineEnd: '4px', verticalAlign: 'middle' }} />
              {isRTL ? 'النموذج الافتراضي للذكاء الاصطناعي' : 'Default AI Model Selection'}
            </label>
            <select
              value={settings.openaiModel}
              onChange={e => handleFieldChange('openaiModel', e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="gpt-4o-mini">GPT-4o-Mini (Recommended/Cost-efficient)</option>
              <option value="gpt-4o">GPT-4o (High intelligence / Standard rates)</option>
              <option value="o3-mini">o3-mini (Reasoning / Advanced tasks)</option>
              <option value="o1">o1 (Full Reasoning / Premium rates)</option>
              <option value="gpt-3.5-turbo">GPT-3.5-Turbo (Legacy)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', gap: '10px', paddingBottom: '20px' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
          style={{ flex: 1 }}
        >
          <Save size={16} />
          <span>
            {saving 
              ? (isRTL ? 'جاري الحفظ...' : 'Saving...') 
              : saved 
                ? (isRTL ? 'تم الحفظ بنجاح! ✓' : 'Saved Successfully! ✓') 
                : (isRTL ? 'حفظ إعدادات الذكاء الاصطناعي' : 'Save AI Settings')
            }
          </span>
        </button>
        <button 
          onClick={handleReset} 
          className="btn" 
          style={{ background: 'var(--bg3)', border: '1px solid var(--line)', color: 'var(--text2)' }}
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </div>
  );
};

export default AiSettingsPage;
