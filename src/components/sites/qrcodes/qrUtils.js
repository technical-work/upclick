import QRCode from 'qrcode';

export const QR_TYPES = [
  { id: 'website', label: 'Website', labelAr: 'موقع إلكتروني', icon: 'Globe', desc: 'Link directly to any webpage or URL' },
  { id: 'review', label: 'Review link', labelAr: 'رابط التقييم', icon: 'Star', desc: 'Collect Google or platform 5-star reviews' },
  { id: 'call', label: 'Call', labelAr: 'اتصال هاتفي', icon: 'Phone', desc: 'Direct click-to-call phone number' },
  { id: 'sms', label: 'SMS', labelAr: 'رسالة نصية', icon: 'MessageSquare', desc: 'Pre-filled SMS text message' },
  { id: 'email', label: 'Email', labelAr: 'بريد إلكتروني', icon: 'Mail', desc: 'Pre-filled email with subject & body' },
  { id: 'payment', label: 'Payment', labelAr: 'رابط دفع', icon: 'CreditCard', desc: 'Stripe or custom payment checkout link' },
  { id: 'whatsapp', label: 'WhatsApp', labelAr: 'واتساب مباشر', icon: 'MessageCircle', desc: 'Direct WhatsApp chat with prefilled text' },
  { id: 'funnel', label: 'Funnel', labelAr: 'فانل مبيعات', icon: 'Layers', desc: 'Link to any sales funnel step' },
  { id: 'form', label: 'Form', labelAr: 'نموذج ليد', icon: 'FileText', desc: 'Interactive lead capture form' },
  { id: 'survey', label: 'Survey', labelAr: 'استبيان تفاعلي', icon: 'CheckSquare', desc: 'Multi-step survey assessment' },
  { id: 'quiz', label: 'Quiz', labelAr: 'اختبار وتقييم', icon: 'Award', desc: 'Interactive scored quiz assessment' },
  { id: 'profile_card', label: 'Profile card', labelAr: 'بطاقة بروفايل', icon: 'UserCheck', desc: 'Bio link profile with social buttons' },
  { id: 'vcard', label: 'V card', labelAr: 'بطاقة جهة اتصال', icon: 'Contact', desc: 'Downloadable .vcf contact card' },
  { id: 'business_card', label: 'Business card', labelAr: 'بطاقة أعمال', icon: 'Briefcase', desc: 'Digital business contact card' },
  { id: 'apps', label: 'Apps', labelAr: 'تطبيقات الهاتف', icon: 'Smartphone', desc: 'Apple App Store & Google Play links' }
];

export const COUNTRY_CODES = [
  { code: '+20', country: 'EG', flag: '🇪🇬', name: 'Egypt (+20)' },
  { code: '+966', country: 'SA', flag: '🇸🇦', name: 'Saudi Arabia (+966)' },
  { code: '+971', country: 'AE', flag: '🇦🇪', name: 'UAE (+971)' },
  { code: '+1', country: 'US', flag: '🇺🇸', name: 'USA / Canada (+1)' },
  { code: '+44', country: 'GB', flag: '🇬🇧', name: 'United Kingdom (+44)' },
  { code: '+965', country: 'KW', flag: '🇰🇼', name: 'Kuwait (+965)' },
  { code: '+974', country: 'QA', flag: '🇶🇦', name: 'Qatar (+974)' },
  { code: '+968', country: 'OM', flag: '🇴🇲', name: 'Oman (+968)' },
  { code: '+973', country: 'BH', flag: '🇧🇭', name: 'Bahrain (+973)' },
  { code: '+962', country: 'JO', flag: '🇯🇴', name: 'Jordan (+962)' },
  { code: '+961', country: 'LB', flag: '🇱🇧', name: 'Lebanon (+961)' },
  { code: '+212', country: 'MA', flag: '🇲🇦', name: 'Morocco (+212)' },
  { code: '+213', country: 'DZ', flag: '🇩🇿', name: 'Algeria (+213)' },
  { code: '+216', country: 'TN', flag: '🇹🇳', name: 'Tunisia (+216)' },
  { code: '+49', country: 'DE', flag: '🇩🇪', name: 'Germany (+49)' },
  { code: '+33', country: 'FR', flag: '🇫🇷', name: 'France (+33)' },
  { code: '+90', country: 'TR', flag: '🇹🇷', name: 'Turkey (+90)' }
];

export function buildQRTargetPayload(type, data = {}, origin = '') {
  const baseOrigin = origin || (typeof window !== 'undefined' ? window.location.origin : 'https://app.upklick.io');

  switch (type) {
    case 'website':
    case 'review': {
      let url = (data.url || '').trim();
      if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
      return url || `${baseOrigin}`;
    }
    case 'call': {
      const fullPhone = `${data.countryCode || '+20'}${String(data.phone || '').replace(/\D/g, '')}`;
      return `tel:${fullPhone}`;
    }
    case 'whatsapp': {
      const phoneDigits = `${String(data.countryCode || '+20').replace(/\D/g, '')}${String(data.phone || '').replace(/\D/g, '')}`;
      const msg = encodeURIComponent(data.message || 'Hi, I would like more info');
      return `https://wa.me/${phoneDigits}?text=${msg}`;
    }
    case 'sms': {
      const fullPhone = `${data.countryCode || '+20'}${String(data.phone || '').replace(/\D/g, '')}`;
      const msg = encodeURIComponent(data.message || '');
      return `sms:${fullPhone}${msg ? `?body=${msg}` : ''}`;
    }
    case 'email': {
      const to = (data.email || '').trim();
      const sub = encodeURIComponent(data.subject || '');
      const body = encodeURIComponent(data.body || '');
      return `mailto:${to}?subject=${sub}&body=${body}`;
    }
    case 'payment': {
      let url = (data.paymentUrl || data.url || '').trim();
      if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
      return url || `${baseOrigin}/checkout`;
    }
    case 'funnel': {
      const fId = data.funnelId || '';
      return `${baseOrigin}/s/${fId}`;
    }
    case 'form': {
      const formId = data.formId || '';
      return `${baseOrigin}/s/${formId.startsWith('form_') ? formId : `form_${formId}`}`;
    }
    case 'survey': {
      const surveyId = data.surveyId || '';
      return `${baseOrigin}/s/${surveyId.startsWith('survey_') ? surveyId : `survey_${surveyId}`}`;
    }
    case 'quiz': {
      const quizId = data.quizId || '';
      return `${baseOrigin}/s/${quizId.startsWith('quiz_') ? quizId : `quiz_${quizId}`}`;
    }
    case 'vcard':
    case 'business_card': {
      const fn = `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.name || 'Contact';
      const phone = `${data.countryCode || ''} ${data.phone || ''}`.trim();
      const email = data.email || '';
      const org = data.company || '';
      const title = data.jobTitle || '';
      const web = data.website || '';
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${fn}`,
        `ORG:${org}`,
        `TITLE:${title}`,
        `TEL;TYPE=CELL:${phone}`,
        `EMAIL:${email}`,
        `URL:${web}`,
        'END:VCARD'
      ].join('\n');
    }
    case 'profile_card': {
      let url = (data.profileUrl || data.url || '').trim();
      if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
      return url || `${baseOrigin}`;
    }
    case 'apps': {
      let url = (data.appUrl || data.iosUrl || data.androidUrl || '').trim();
      if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
      return url || `${baseOrigin}`;
    }
    default:
      return (data.url || baseOrigin);
  }
}

export const LOGO_PRESET_SVGS = {
  whatsapp: `
    <circle cx="12" cy="12" r="11" fill="#22c55e"/>
    <path d="M17.5 14.3c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 .1.1-.2.2-.4.4-.8.1-.4.2-1.3-.2-1.8-.4-.5-1.5-1.5-2.1-1.5s-1.2.1-1.6.5c-.5.5-1.8 1.8-1.8 4.3 0 2.5 1.8 5 2.1 5.3.3.4 3.6 5.5 8.7 5.5 4.3 0 5.2-2.8 5.4-3.1.2-.4.2-.8.1-.9-.1-.2-.5-.4-.8-.5z" fill="#ffffff" transform="scale(0.7) translate(2,2)"/>
    <path d="M12 4a8 8 0 0 0-6.9 12L4 20l4.1-1.1A8 8 0 1 0 12 4zm0 14.5a6.5 6.5 0 0 1-3.3-.9l-.2-.1-2.5.7.7-2.4-.2-.3A6.5 6.5 0 1 1 12 18.5z" fill="#ffffff"/>
  `,
  phone: `
    <circle cx="12" cy="12" r="11" fill="#2563eb"/>
    <path d="M16.5 13.5v2.2a1.5 1.5 0 0 1-1.6 1.5 14.8 14.8 0 0 1-6.5-2.3 14.6 14.6 0 0 1-4.5-4.5 14.8 14.8 0 0 1-2.3-6.5A1.5 1.5 0 0 1 3.1 2.3h2.2a1.5 1.5 0 0 1 1.5 1.3c.1.7.3 1.4.6 2.1a1.5 1.5 0 0 1-.3 1.6L6.1 8.3a12 12 0 0 0 4.5 4.5l1-1a1.5 1.5 0 0 1 1.6-.3c.7.3 1.4.5 2.1.6a1.5 1.5 0 0 1 1.2 1.4z" fill="#ffffff" transform="translate(1, 1) scale(0.9)"/>
  `,
  star: `
    <circle cx="12" cy="12" r="11" fill="#f59e0b"/>
    <polygon points="12 4 14.5 9 20 9.8 16 13.7 17 19.2 12 16.5 7 19.2 8 13.7 4 9.8 9.5 9 12 4" fill="#ffffff"/>
  `,
  website: `
    <circle cx="12" cy="12" r="11" fill="#0284c7"/>
    <circle cx="12" cy="12" r="6.5" stroke="#ffffff" stroke-width="1.6" fill="none"/>
    <line x1="5.5" y1="12" x2="18.5" y2="12" stroke="#ffffff" stroke-width="1.6"/>
    <path d="M12 5.5a9 9 0 0 1 2.5 6.5 9 9 0 0 1-2.5 6.5 9 9 0 0 1-2.5-6.5 9 9 0 0 1 2.5-6.5z" stroke="#ffffff" stroke-width="1.6" fill="none"/>
  `,
  mail: `
    <circle cx="12" cy="12" r="11" fill="#dc2626"/>
    <rect x="5.5" y="7" width="13" height="10" rx="1.5" fill="none" stroke="#ffffff" stroke-width="1.6"/>
    <polyline points="5.5 8 12 13 18.5 8" fill="none" stroke="#ffffff" stroke-width="1.6"/>
  `,
  upklick: `
    <circle cx="12" cy="12" r="11" fill="#7c3aed"/>
    <path d="M12 4L14 9.5L19.5 12L14 14.5L12 20L10 14.5L4.5 12L10 9.5L12 4Z" fill="#ffffff"/>
  `
};

/**
 * Generate full SVG string for styled QR code (Custom shapes, eye frames, center logo, colors)
 */
export function generateStyledQRSVGString(text, options = {}) {
  const {
    bg = '#ffffff',
    dotsColor = '#000000',
    markerBorderColor = '',
    markerCenterColor = '',
    bodyShape = 'square',       // 'square' | 'rounded' | 'dots' | 'circle' | 'classy'
    eyeFrame = 'square',        // 'square' | 'rounded' | 'circle'
    eyeCenter = 'square',       // 'square' | 'rounded' | 'circle' | 'dot'
    logo = null,                // custom dataUrl or preset name
    logoPreset = '',            // 'none' | 'whatsapp' | 'phone' | 'website' | 'star' | 'mail' | 'upklick'
    size = 400,
    margin = 2
  } = options;

  const actualBorderColor = markerBorderColor || dotsColor || '#000000';
  const actualCenterColor = markerCenterColor || dotsColor || '#000000';

  let qr;
  try {
    qr = QRCode.create(text || 'https://app.upklick.io', { errorCorrectionLevel: 'H' });
  } catch (err) {
    console.error('Failed to create QR matrix:', err);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${bg}"/></svg>`;
  }

  const moduleCount = qr.modules.size;
  const totalCount = moduleCount + margin * 2;
  const moduleSize = size / totalCount;

  // Eye check
  const isEye = (r, c) => {
    if (r < 7 && c < 7) return true;
    if (r < 7 && c >= moduleCount - 7) return true;
    if (r >= moduleCount - 7 && c < 7) return true;
    return false;
  };

  // Center logo check
  const presetKey = (logoPreset && logoPreset !== 'none' && LOGO_PRESET_SVGS[logoPreset]) ? logoPreset : ((logo && LOGO_PRESET_SVGS[logo]) ? logo : null);
  const hasCustomLogo = Boolean(logo && typeof logo === 'string' && (logo.startsWith('data:') || logo.startsWith('http')));
  const hasLogo = Boolean(presetKey || hasCustomLogo);

  const logoModules = hasLogo ? Math.max(5, Math.floor(moduleCount * 0.24)) : 0;
  const logoStart = Math.floor((moduleCount - logoModules) / 2);
  const logoEnd = logoStart + logoModules;

  const isLogoArea = (r, c) => {
    if (!hasLogo) return false;
    return r >= logoStart && r < logoEnd && c >= logoStart && c < logoEnd;
  };

  const elements = [];

  // 1. Background
  elements.push(`<rect width="${size}" height="${size}" fill="${bg}" rx="${(size * 0.04).toFixed(2)}" ry="${(size * 0.04).toFixed(2)}"/>`);

  // 2. Body Dots & Pattern
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (isEye(r, c) || isLogoArea(r, c)) continue;
      if (qr.modules.get(r, c)) {
        const x = (c + margin) * moduleSize;
        const y = (r + margin) * moduleSize;

        if (bodyShape === 'dots' || bodyShape === 'circle') {
          const cx = x + moduleSize / 2;
          const cy = y + moduleSize / 2;
          elements.push(`<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(moduleSize * 0.44).toFixed(2)}" fill="${dotsColor}" />`);
        } else if (bodyShape === 'rounded') {
          const rx = moduleSize * 0.35;
          elements.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${moduleSize.toFixed(2)}" height="${moduleSize.toFixed(2)}" rx="${rx.toFixed(2)}" ry="${rx.toFixed(2)}" fill="${dotsColor}" />`);
        } else if (bodyShape === 'classy') {
          const rx = moduleSize * 0.45;
          elements.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${moduleSize.toFixed(2)}" height="${moduleSize.toFixed(2)}" rx="${rx.toFixed(2)}" ry="${rx.toFixed(2)}" fill="${dotsColor}" />`);
        } else {
          // square
          elements.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${moduleSize.toFixed(2)}" height="${moduleSize.toFixed(2)}" fill="${dotsColor}" />`);
        }
      }
    }
  }

  // 3. Eye Finder Patterns (Top-Left, Top-Right, Bottom-Left)
  const eyeCoords = [
    { r: 0, c: 0 },
    { r: 0, c: moduleCount - 7 },
    { r: moduleCount - 7, c: 0 }
  ];

  eyeCoords.forEach(({ r, c }) => {
    const x = (c + margin) * moduleSize;
    const y = (r + margin) * moduleSize;
    const eyeSize = 7 * moduleSize;
    const innerSize = 5 * moduleSize;
    const centerSize = 3 * moduleSize;
    const cx = x + eyeSize / 2;
    const cy = y + eyeSize / 2;

    // Outer Eye Frame
    if (eyeFrame === 'circle') {
      elements.push(`<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(eyeSize / 2).toFixed(2)}" fill="${actualBorderColor}" />`);
      elements.push(`<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(innerSize / 2).toFixed(2)}" fill="${bg}" />`);
    } else if (eyeFrame === 'rounded') {
      const outerRx = moduleSize * 1.8;
      const innerRx = moduleSize * 1.2;
      elements.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${eyeSize.toFixed(2)}" height="${eyeSize.toFixed(2)}" rx="${outerRx.toFixed(2)}" ry="${outerRx.toFixed(2)}" fill="${actualBorderColor}" />`);
      elements.push(`<rect x="${(x + moduleSize).toFixed(2)}" y="${(y + moduleSize).toFixed(2)}" width="${innerSize.toFixed(2)}" height="${innerSize.toFixed(2)}" rx="${innerRx.toFixed(2)}" ry="${innerRx.toFixed(2)}" fill="${bg}" />`);
    } else {
      // Square
      elements.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${eyeSize.toFixed(2)}" height="${eyeSize.toFixed(2)}" fill="${actualBorderColor}" />`);
      elements.push(`<rect x="${(x + moduleSize).toFixed(2)}" y="${(y + moduleSize).toFixed(2)}" width="${innerSize.toFixed(2)}" height="${innerSize.toFixed(2)}" fill="${bg}" />`);
    }

    // Inner Center Eyeball
    const actualEyeCenter = eyeCenter || eyeFrame;
    if (actualEyeCenter === 'circle' || actualEyeCenter === 'dot') {
      elements.push(`<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(centerSize / 2).toFixed(2)}" fill="${actualCenterColor}" />`);
    } else if (actualEyeCenter === 'rounded') {
      const centerRx = moduleSize * 0.8;
      elements.push(`<rect x="${(x + 2 * moduleSize).toFixed(2)}" y="${(y + 2 * moduleSize).toFixed(2)}" width="${centerSize.toFixed(2)}" height="${centerSize.toFixed(2)}" rx="${centerRx.toFixed(2)}" ry="${centerRx.toFixed(2)}" fill="${actualCenterColor}" />`);
    } else {
      elements.push(`<rect x="${(x + 2 * moduleSize).toFixed(2)}" y="${(y + 2 * moduleSize).toFixed(2)}" width="${centerSize.toFixed(2)}" height="${centerSize.toFixed(2)}" fill="${actualCenterColor}" />`);
    }
  });

  // 4. Center Logo Plate & Icon
  if (hasLogo) {
    const lx = (logoStart + margin) * moduleSize;
    const ly = (logoStart + margin) * moduleSize;
    const lSize = logoModules * moduleSize;
    const lcx = lx + lSize / 2;
    const lcy = ly + lSize / 2;
    const badgeR = (lSize / 2) * 1.06;

    // Background circle plate for logo with border
    elements.push(`<circle cx="${lcx.toFixed(2)}" cy="${lcy.toFixed(2)}" r="${badgeR.toFixed(2)}" fill="${bg}" stroke="${dotsColor}" stroke-width="${(moduleSize * 0.35).toFixed(2)}" />`);

    const iconSize = lSize * 0.72;
    const ix = lcx - iconSize / 2;
    const iy = lcy - iconSize / 2;

    if (presetKey && LOGO_PRESET_SVGS[presetKey]) {
      const scaleFactor = (iconSize / 24).toFixed(3);
      elements.push(`<g transform="translate(${ix.toFixed(2)}, ${iy.toFixed(2)}) scale(${scaleFactor})">
        ${LOGO_PRESET_SVGS[presetKey]}
      </g>`);
    } else if (hasCustomLogo) {
      elements.push(`<image href="${logo}" x="${ix.toFixed(2)}" y="${iy.toFixed(2)}" width="${iconSize.toFixed(2)}" height="${iconSize.toFixed(2)}" preserveAspectRatio="xMidYMid meet" />`);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    ${elements.join('\n')}
  </svg>`;
}

/**
 * Generate QR code as high-resolution Data URL (PNG/SVG) with custom styling
 */
export async function generateQRDataURL(text, options = {}) {
  const svgString = generateStyledQRSVGString(text, options);
  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

  // If in browser, render to Canvas for PNG Data URL
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const targetWidth = options.width || 400;
          canvas.width = targetWidth;
          canvas.height = targetWidth;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = options.bg || '#ffffff';
            ctx.fillRect(0, 0, targetWidth, targetWidth);
            ctx.drawImage(img, 0, 0, targetWidth, targetWidth);
            resolve(canvas.toDataURL('image/png'));
            return;
          }
        } catch (e) {
          console.warn('Canvas rasterization fallback to SVG DataURL:', e);
        }
        resolve(svgDataUrl);
      };
      img.onerror = () => {
        resolve(svgDataUrl);
      };
      img.src = svgDataUrl;
    });
  }

  return svgDataUrl;
}

/**
 * Generate SVG string of QR code
 */
export async function generateQRSVGString(text, options = {}) {
  return generateStyledQRSVGString(text, options);
}
