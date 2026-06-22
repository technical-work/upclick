'use client';

import { useState, useEffect } from 'react';
import { adminTranslations } from '../data/adminTranslations';

export function useTranslation() {
  const [lang, setLang] = useState('ar');

  // Load initial language preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('upklick_lang') || 'ar';
      setLang(saved);
    }
  }, []);

  // Sync state if someone changes localStorage elsewhere (optional)
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('upklick_lang') || 'ar';
      setLang(saved);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('upklick_lang', newLang);
      document.documentElement.setAttribute('lang', newLang);
      document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr');
      
      // Dispatch storage event to trigger update on other components
      window.dispatchEvent(new Event('storage'));
    }
  };

  const t = (key, options) => {
    let text = adminTranslations[lang]?.[key];
    if (text) {
      if (options) {
        Object.keys(options).forEach(optKey => {
          text = text.replace(new RegExp(`{{${optKey}}}`, 'g'), options[optKey]);
          text = text.replace(new RegExp(`{${optKey}}`, 'g'), options[optKey]);
        });
      }
      return text;
    }
    // Fallback if month array is requested
    if (key === 'months') {
      return adminTranslations[lang]?.months || adminTranslations['ar'].months;
    }
    return key;
  };

  return {
    t,
    i18n: {
      language: lang,
      changeLanguage
    }
  };
}
