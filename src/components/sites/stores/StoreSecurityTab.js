'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  RefreshCw
} from 'lucide-react';

export default function StoreSecurityTab({ store, isRtl, onSaveSettings }) {
  const [passwordProtected, setPasswordProtected] = useState(store.security?.passwordProtected || false);
  const [storePassword, setStorePassword] = useState(store.security?.storePassword || '');
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaEnabled, setRecaptchaEnabled] = useState(store.security?.recaptchaEnabled !== false);
  const [sslActive, setSslActive] = useState(true);

  const handleSave = () => {
    onSaveSettings({
      security: {
        passwordProtected,
        storePassword,
        recaptchaEnabled,
        sslActive
      }
    });
    alert(isRtl ? 'تم حفظ إعدادات الأمان بنجاح' : 'Security settings saved successfully');
  };

  return (
    <div style={{ animation: 'fadeIn 0.25s ease', maxWidth: '800px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* SSL Status Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--edge)',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(22, 163, 74, 0.1)',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontWeight: '800', color: 'var(--t1)', fontSize: '15px' }}>
                {isRtl ? 'شهادة الأمان والتشفير (SSL Encryption)' : 'SSL Certificate & 256-bit Encryption'}
              </div>
              <div style={{ color: 'var(--t2)', fontSize: '12.5px', marginTop: '2px' }}>
                {isRtl ? 'متجرك محمي تلقائياً بشهادة TLS/SSL عالمية متوافقة مع معايير الدفع PCI-DSS' : 'Your store is automatically secured with TLS/SSL certificate compliant with PCI-DSS'}
              </div>
            </div>
          </div>
          <span style={{
            background: 'rgba(22, 163, 74, 0.15)',
            color: '#16a34a',
            fontSize: '12px',
            fontWeight: '700',
            padding: '4px 10px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <CheckCircle2 size={14} />
            <span>{isRtl ? 'نشط وآمن' : 'Active & Secure'}</span>
          </span>
        </div>

        {/* Password Protection */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--edge)',
          borderRadius: '14px',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div style={{ fontWeight: '800', color: 'var(--t1)', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={16} style={{ color: '#2563eb' }} />
                <span>{isRtl ? 'حماية المتجر بكلمة مرور' : 'Password Protection'}</span>
              </div>
              <div style={{ color: 'var(--t2)', fontSize: '12.5px', marginTop: '2px' }}>
                {isRtl ? 'اقفل متجرك بكلمة سر أثناء التجهيز أو للعملاء المميزين فقط' : 'Restrict access to your store with a password during launch preparation'}
              </div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={passwordProtected}
                onChange={(e) => setPasswordProtected(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: passwordProtected ? '#2563eb' : 'var(--surface2)',
                border: '1px solid var(--edge)',
                borderRadius: '24px',
                transition: '0.2s'
              }}>
                <span style={{
                  position: 'absolute',
                  height: '16px',
                  width: '16px',
                  left: passwordProtected ? '22px' : '4px',
                  bottom: '3px',
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                  transition: '0.2s'
                }} />
              </span>
            </label>
          </div>

          {passwordProtected && (
            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--edge)' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', marginBottom: '6px', color: 'var(--t1)' }}>
                {isRtl ? 'كلمة المرور' : 'Store Access Password'}
              </label>
              <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="inp"
                  value={storePassword}
                  onChange={(e) => setStorePassword(e.target.value)}
                  placeholder="e.g. VIP2026"
                  style={{ width: '100%', paddingRight: '38px', fontSize: '13px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--t2)',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Spam & Fraud Protection */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--edge)',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontWeight: '800', color: 'var(--t1)', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} style={{ color: '#2563eb' }} />
              <span>{isRtl ? 'حماية من السبام والاحتيال (Google reCAPTCHA v3)' : 'Anti-Spam & Fraud Protection (reCAPTCHA v3)'}</span>
            </div>
            <div style={{ color: 'var(--t2)', fontSize: '12.5px', marginTop: '2px' }}>
              {isRtl ? 'حماية تلقائية لصفحة إتمام الطلب والسلة من البوتات والطلبات الوهمية' : 'Protect checkout and cart forms against bots and fake spam orders'}
            </div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={recaptchaEnabled}
              onChange={(e) => setRecaptchaEnabled(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: recaptchaEnabled ? '#2563eb' : 'var(--surface2)',
              border: '1px solid var(--edge)',
              borderRadius: '24px',
              transition: '0.2s'
            }}>
              <span style={{
                position: 'absolute',
                height: '16px',
                width: '16px',
                left: recaptchaEnabled ? '22px' : '4px',
                bottom: '3px',
                backgroundColor: '#fff',
                borderRadius: '50%',
                transition: '0.2s'
              }} />
            </span>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button
            onClick={handleSave}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              fontWeight: '700',
              fontSize: '13.5px',
              cursor: 'pointer'
            }}
          >
            {isRtl ? 'حفظ إعدادات الأمان' : 'Save Security Settings'}
          </button>
        </div>

      </div>
    </div>
  );
}
