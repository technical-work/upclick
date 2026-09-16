'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List as ListIcon,
  Download,
  Copy,
  Trash2,
  Edit3,
  MoreVertical,
  ExternalLink,
  BarChart3,
  Upload,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Globe,
  Star,
  Phone,
  MessageSquare,
  Mail,
  CreditCard,
  MessageCircle,
  Layers,
  FileText,
  CheckSquare,
  Award,
  UserCheck,
  Contact,
  Briefcase,
  Smartphone,
  Wallet,
  Check,
  Flame,
  FileSpreadsheet,
  X,
  AlertTriangle,
  QrCode
} from 'lucide-react';
import { QR_TYPES, generateQRDataURL, generateQRSVGString, generateStyledQRSVGString } from './qrUtils';

function QRThumbnail({ qr, size = 105, style = {} }) {
  const targetPayload = qr?.targetPayload || qr?.data?.url || (typeof window !== 'undefined' ? `${window.location.origin}/s/${qr?.id || ''}` : 'https://app.upklick.io');

  const designOpts = useMemo(() => ({
    bg: qr?.design?.bgColor || '#ffffff',
    dotsColor: qr?.design?.dotsColor || '#000000',
    markerBorderColor: qr?.design?.markerBorderColor || qr?.design?.dotsColor || '#000000',
    markerCenterColor: qr?.design?.markerCenterColor || qr?.design?.dotsColor || '#000000',
    bodyShape: qr?.design?.bodyShape || 'square',
    eyeFrame: qr?.design?.eyeFrame || 'square',
    eyeCenter: qr?.design?.eyeCenter || 'square',
    logo: qr?.design?.logo || null,
    logoPreset: qr?.design?.logoPreset || '',
    size: 240,
    margin: 2
  }), [
    qr?.design?.bgColor,
    qr?.design?.dotsColor,
    qr?.design?.markerBorderColor,
    qr?.design?.markerCenterColor,
    qr?.design?.bodyShape,
    qr?.design?.eyeFrame,
    qr?.design?.eyeCenter,
    qr?.design?.logo,
    qr?.design?.logoPreset
  ]);

  const svgString = useMemo(() => {
    try {
      return generateStyledQRSVGString(targetPayload, designOpts);
    } catch (e) {
      return '';
    }
  }, [targetPayload, designOpts]);

  if (qr?.previewDataUrl && qr.previewDataUrl.startsWith('data:image')) {
    return (
      <img
        src={qr.previewDataUrl}
        alt={qr.name || 'QR Code'}
        style={{ width: '100%', maxWidth: `${size}px`, height: 'auto', display: 'block', margin: '0 auto', ...style }}
      />
    );
  }

  if (svgString) {
    return (
      <div
        style={{ width: `${size}px`, height: `${size}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', ...style }}
        dangerouslySetInnerHTML={{ __html: svgString }}
      />
    );
  }

  return (
    <div style={{ textAlign: 'center', color: 'var(--t2)' }}>
      <QrCode size={32} />
    </div>
  );
}

export default function QRCodeListView({
  qrCodes = [],
  isRtl = false,
  onOpenCreate,
  onEditQR,
  onDuplicateQR,
  onDeleteQR,
  onBulkDelete,
  onOpenAnalytics,
  onOpenBulkModal,
  showToast = () => {}
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [showFeaturesBanner, setShowFeaturesBanner] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // null | { type: 'single', qr } | { type: 'bulk', count, ids }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'bulk') {
      if (onBulkDelete) onBulkDelete(deleteTarget.ids);
      setSelectedIds(new Set());
    } else if (deleteTarget.type === 'single') {
      if (onDeleteQR) onDeleteQR(deleteTarget.qr?.id);
    }
    setDeleteTarget(null);
  };

  // Filtered QR codes
  const filteredQRs = useMemo(() => {
    return qrCodes.filter((qr) => {
      const q = (searchQuery || '').toLowerCase();
      const matchesSearch = !q || (qr.name && qr.name.toLowerCase().includes(q)) || (qr.type && qr.type.toLowerCase().includes(q));
      const matchesType = selectedTypeFilter === 'all' || qr.type === selectedTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [qrCodes, searchQuery, selectedTypeFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredQRs.length && filteredQRs.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredQRs.map((q) => q.id)));
    }
  };

  const toggleSelectOne = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleCopyLink = (qr) => {
    const payload = qr.targetPayload || qr.data?.url || '';
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(payload);
      setCopiedId(qr.id);
      showToast(isRtl ? 'تم نسخ الرابط إلى الحافظة' : 'QR target copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDownload = async (qr, format = 'png') => {
    const designOpts = {
      bg: qr.design?.bgColor || '#ffffff',
      dotsColor: qr.design?.dotsColor || '#000000',
      markerBorderColor: qr.design?.markerBorderColor || qr.design?.dotsColor || '#000000',
      markerCenterColor: qr.design?.markerCenterColor || qr.design?.dotsColor || '#000000',
      bodyShape: qr.design?.bodyShape || 'square',
      eyeFrame: qr.design?.eyeFrame || 'square',
      eyeCenter: qr.design?.eyeCenter || 'square',
      logo: qr.design?.logo || null,
      logoPreset: qr.design?.logoPreset || ''
    };

    if (format === 'png') {
      const dataUrl = qr.previewDataUrl || (await generateQRDataURL(qr.targetPayload || '', { ...designOpts, width: 600 }));
      const link = document.createElement('a');
      link.download = `${qr.name || 'qrcode'}.png`;
      link.href = dataUrl;
      link.click();
    } else {
      const svgString = await generateQRSVGString(qr.targetPayload || '', designOpts);
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${qr.name || 'qrcode'}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
    showToast(isRtl ? `تم تنزيل رمز QR بصيغة ${format.toUpperCase()}` : `Downloaded ${format.toUpperCase()}`);
    setActiveMenuId(null);
  };

  const getTypeMeta = (typeId) => {
    return QR_TYPES.find((t) => t.id === typeId) || { label: typeId || 'Custom', labelAr: 'مخصص', icon: 'Globe' };
  };

  const renderTypeIcon = (iconName, size = 14) => {
    switch (iconName) {
      case 'Globe': return <Globe size={size} />;
      case 'Star': return <Star size={size} />;
      case 'Phone': return <Phone size={size} />;
      case 'MessageSquare': return <MessageSquare size={size} />;
      case 'Mail': return <Mail size={size} />;
      case 'CreditCard': return <CreditCard size={size} />;
      case 'MessageCircle': return <MessageCircle size={size} />;
      case 'Layers': return <Layers size={size} />;
      case 'FileText': return <FileText size={size} />;
      case 'CheckSquare': return <CheckSquare size={size} />;
      case 'Award': return <Award size={size} />;
      case 'UserCheck': return <UserCheck size={size} />;
      case 'Contact': return <Contact size={size} />;
      case 'Briefcase': return <Briefcase size={size} />;
      case 'Smartphone': return <Smartphone size={size} />;
      default: return <Globe size={size} />;
    }
  };

  const isEmpty = qrCodes.length === 0;

  return (
    <div style={{ padding: '0 24px', direction: isRtl ? 'rtl' : 'ltr' }}>
      {/* Top Header Bar matching Screenshot 5 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: 'var(--t1)' }}>
            {isRtl ? 'رموز QR' : 'QR codes'}
          </h2>
          <div style={{ fontSize: '13px', color: 'var(--t2)', marginTop: '2px' }}>
            {isRtl ? 'إدارة وتخصيص وتتبع جميع رموز الاستجابة السريعة الخاصة بك' : 'Create, customize, and track all your dynamic QR codes'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Refresh */}
          <button
            onClick={() => showToast(isRtl ? 'تم تحديث البيانات' : 'Refreshed')}
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--edge)',
              color: 'var(--t1)',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '600'
            }}
            title={isRtl ? 'تحديث' : 'Refresh'}
          >
            <RefreshCw size={15} />
          </button>

          {/* QR Features toggle */}
          <button
            onClick={() => setShowFeaturesBanner(!showFeaturesBanner)}
            style={{
              background: showFeaturesBanner ? 'rgba(245, 158, 11, 0.12)' : 'var(--surface2)',
              border: showFeaturesBanner ? '1px solid #f59e0b' : '1px solid var(--edge)',
              color: showFeaturesBanner ? '#f59e0b' : 'var(--t1)',
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '700'
            }}
          >
            <span>{isRtl ? 'مميزات QR' : 'QR features'}</span>
            <span>🔥</span>
          </button>

          {/* Analytics button */}
          <button
            onClick={onOpenAnalytics}
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--edge)',
              color: 'var(--t1)',
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '700'
            }}
          >
            <BarChart3 size={15} color="var(--a)" />
            <span>{isRtl ? 'التحليلات' : 'Analytics'}</span>
          </button>

          {/* Bulk CSV Upload */}
          <button
            onClick={onOpenBulkModal}
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--edge)',
              color: 'var(--t1)',
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '700'
            }}
          >
            <Upload size={15} />
            <span>{isRtl ? 'إنشاء جماعي CSV' : 'Bulk CSV'}</span>
          </button>

          {/* Create QR Code Primary Button */}
          <button
            onClick={onOpenCreate}
            style={{
              background: 'var(--a)',
              color: '#fff',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
            }}
          >
            <Plus size={16} />
            <span>{isRtl ? 'إنشاء رمز QR' : 'Create QR code'}</span>
          </button>
        </div>
      </div>

      {/* Hero Overview Banner (Always on empty, or toggleable with "QR features 🔥" button) */}
      {(isEmpty || showFeaturesBanner) && (
        <div style={{ marginBottom: '28px', animation: 'fadeIn 0.3s ease' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.04) 0%, rgba(147, 51, 234, 0.04) 100%)',
              border: '1px solid var(--edge)',
              borderRadius: '18px',
              padding: '36px',
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '32px',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: '900', color: 'var(--t1)', margin: '0 0 16px', letterSpacing: '-0.5px' }}>
                {isRtl ? 'إنشاء رموز QR بكل سهولة واحترافية' : 'Create effortless QRs'}
              </h1>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {[
                  isRtl ? 'إنشاء وتخصيص رموز QR ديناميكية ومخصصة بكل سهولة' : 'Create custom and dynamic QR codes easily',
                  isRtl ? 'الحصول على تحليلات وإحصائيات تفصيلية لعدد المسحات' : 'Get detailed scan analytics and insights',
                  isRtl ? 'تخصيص كامل للألوان والأشكال والإطارات وشعار البراند' : 'Customize your QR code design and appearance',
                  isRtl ? 'تتبع فوري ومباشر لزوار ومستخدمي كل كود' : 'Track who scans your QR codes in real time'
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'rgba(34, 197, 94, 0.15)',
                        color: '#16a34a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Check size={13} strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: '14px', color: 'var(--t1)', fontWeight: '600' }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={onOpenCreate}
                style={{
                  background: 'var(--a)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 28px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)'
                }}
              >
                <Plus size={18} />
                <span>{isRtl ? 'إنشاء رمز QR جديد' : 'Create QR code'}</span>
              </button>
            </div>

            {/* Right Graphic Mockup */}
            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--edge)',
                borderRadius: '16px',
                padding: '18px',
                boxShadow: '0 15px 35px rgba(0,0,0,0.06)',
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <div style={{ flex: 1, borderRight: '1px solid var(--edge)', paddingRight: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--t1)', marginBottom: '8px' }}>
                  {isRtl ? 'معالج إنشاء QR' : 'Create QR Code'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {QR_TYPES.slice(0, 6).map((t) => (
                    <div
                      key={t.id}
                      style={{
                        padding: '8px 4px',
                        borderRadius: '6px',
                        background: 'var(--surface2)',
                        border: '1px solid var(--edge)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <div style={{ color: 'var(--a)' }}>{renderTypeIcon(t.icon, 14)}</div>
                      <span style={{ fontSize: '9px', fontWeight: '700', color: 'var(--t1)' }}>{t.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini Smartphone Mockup */}
              <div
                style={{
                  width: '120px',
                  height: '200px',
                  borderRadius: '24px',
                  background: '#1e293b',
                  padding: '6px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    background: '#fff',
                    borderRadius: '18px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                    textAlign: 'center'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(37,99,235,0.1)',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '6px'
                    }}
                  >
                    <Star size={16} fill="#2563eb" />
                  </div>
                  <div style={{ fontSize: '9px', fontWeight: '800', color: '#0f172a' }}>
                    5-Star Review
                  </div>
                  <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={8} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Awesome Feature Cards */}
          <div style={{ marginTop: '28px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--t1)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{isRtl ? 'مميزاتنا الرائعة' : 'Our awesome features'}</span>
              <span>🔥</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {/* Card 1: QR types */}
              <div
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--edge)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                }}
              >
                <div
                  style={{
                    background: 'var(--surface2)',
                    borderRadius: '10px',
                    padding: '12px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '8px'
                  }}
                >
                  {QR_TYPES.slice(0, 10).map((t) => (
                    <div
                      key={t.id}
                      style={{
                        padding: '6px 2px',
                        background: 'var(--surface)',
                        borderRadius: '6px',
                        border: '1px solid var(--edge)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--a)'
                      }}
                      title={t.label}
                    >
                      {renderTypeIcon(t.icon, 13)}
                    </div>
                  ))}
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 6px', color: 'var(--t1)' }}>
                    {isRtl ? 'أنواع QR متعددة' : 'QR types'}
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--t2)', margin: 0, lineHeight: 1.5 }}>
                    {isRtl
                      ? 'أنشئ رموز QR للمواقع، النماذج، الاستبيانات، الاختبارات، واتساب، المكالمات، الدفع والمزيد في مكان واحد.'
                      : 'Create QR codes for websites, forms, SMS, calls, email, payments, and more — all in one place.'}
                  </p>
                </div>
              </div>

              {/* Card 2: Bulk QR codes */}
              <div
                onClick={onOpenBulkModal}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--edge)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                }}
              >
                <div
                  style={{
                    background: 'var(--surface2)',
                    borderRadius: '10px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    border: '1px dashed var(--edge)'
                  }}
                >
                  <FileSpreadsheet size={28} color="var(--a)" />
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--t2)' }}>
                    {isRtl ? 'رفع ملف CSV' : 'Upload CSV File'}
                  </span>
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 6px', color: 'var(--t1)' }}>
                    {isRtl ? 'إنشاء جماعي للرموز' : 'Bulk QR codes'}
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--t2)', margin: 0, lineHeight: 1.5 }}>
                    {isRtl
                      ? 'أنشئ مئات رموز QR في ثوانٍ معدودة عبر رفع ملف CSV واحد لحملاتك الإعلانية وفرق العمل.'
                      : 'Create hundreds of QR codes in seconds with a single CSV upload. Perfect for handling large campaigns.'}
                  </p>
                </div>
              </div>

              {/* Card 3: Analytics */}
              <div
                onClick={onOpenAnalytics}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--edge)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                }}
              >
                <div
                  style={{
                    background: 'var(--surface2)',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--t2)' }}>{isRtl ? 'إجمالي المسحات' : 'Total Scans'}</span>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#16a34a' }}>+24.5%</span>
                  </div>
                  <div style={{ height: '36px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                    {[30, 45, 60, 40, 75, 90, 65, 80, 100, 85].map((h, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: `${h}%`,
                          background: i === 8 ? 'var(--a)' : 'rgba(37, 99, 235, 0.25)',
                          borderRadius: '2px'
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', margin: '0 0 6px', color: 'var(--t1)' }}>
                    {isRtl ? 'تحليلات المسح الدقيقة' : 'Analytics'}
                  </h4>
                  <p style={{ fontSize: '13px', color: 'var(--t2)', margin: 0, lineHeight: 1.5 }}>
                    {isRtl
                      ? 'تتبع إجمالي المسحات والمسحات الفريدة حسب نوع الكود وتاريخ المسح لتقييم الأداء.'
                      : 'Track total and unique QR scans over time, view performance by QR type, and filter data by date.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter / Search / View Mode Controls Bar */}
      {!isEmpty && (
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--edge)',
            borderRadius: '12px',
            padding: '12px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px'
          }}
        >
          {/* Left: Bulk select and actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '700',
                color: 'var(--t1)'
              }}
            >
              <input
                type="checkbox"
                checked={selectedIds.size === filteredQRs.length && filteredQRs.length > 0}
                onChange={toggleSelectAll}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--a)' }}
              />
              <span>
                {selectedIds.size > 0
                  ? (isRtl ? `محدد (${selectedIds.size})` : `Selected (${selectedIds.size})`)
                  : (isRtl ? 'تحديد' : 'Select')}
              </span>
            </label>

            {selectedIds.size > 0 && (
              <button
                onClick={() => {
                  setDeleteTarget({
                    type: 'bulk',
                    count: selectedIds.size,
                    ids: Array.from(selectedIds)
                  });
                }}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={14} />
                <span>{isRtl ? 'حذف المحدد' : 'Delete selected'}</span>
              </button>
            )}
          </div>

          {/* Right: View toggles, Type filter, Search bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* View Mode Switcher */}
            <div
              style={{
                background: 'var(--surface2)',
                border: '1px solid var(--edge)',
                borderRadius: '8px',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  background: viewMode === 'grid' ? 'var(--surface)' : 'none',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  color: viewMode === 'grid' ? 'var(--a)' : 'var(--t2)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
                title={isRtl ? 'عرض شبكي' : 'Grid view'}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  background: viewMode === 'list' ? 'var(--surface)' : 'none',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  color: viewMode === 'list' ? 'var(--a)' : 'var(--t2)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
                title={isRtl ? 'عرض القائمة' : 'List view'}
              >
                <ListIcon size={16} />
              </button>
            </div>

            {/* Type Filter dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--edge)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--t1)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="all">{isRtl ? 'جميع الأنواع' : 'Filter by type'}</option>
                {QR_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {isRtl ? t.labelAr : t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Bar */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                minWidth: '220px'
              }}
            >
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  [isRtl ? 'right' : 'left']: '10px',
                  color: 'var(--t2)'
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? 'بحث في رموز QR...' : 'Search QR codes'}
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--edge)',
                  borderRadius: '8px',
                  padding: isRtl ? '8px 32px 8px 12px' : '8px 12px 8px 32px',
                  fontSize: '13px',
                  color: 'var(--t1)',
                  outline: 'none',
                  width: '100%'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Grid Mode Render matching Screenshot 5 */}
      {viewMode === 'grid' && !isEmpty && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '14px'
          }}
        >
          {filteredQRs.map((qr) => {
            const typeMeta = getTypeMeta(qr.type);
            const isSelected = selectedIds.has(qr.id);
            const totalScans = qr.analytics?.totalScans || qr.scans || 0;

            return (
              <div
                key={qr.id}
                style={{
                  background: 'var(--surface)',
                  border: isSelected ? '2px solid var(--a)' : '1px solid var(--edge)',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  position: 'relative',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Checkbox */}
                <div style={{ position: 'absolute', top: '10px', [isRtl ? 'right' : 'left']: '10px', zIndex: 2 }}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectOne(qr.id)}
                    style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: 'var(--a)' }}
                  />
                </div>

                {/* More Action Menu Button */}
                <div style={{ position: 'absolute', top: '10px', [isRtl ? 'left' : 'right']: '10px', zIndex: 2 }}>
                  <button
                    onClick={() => setActiveMenuId(activeMenuId === qr.id ? null : qr.id)}
                    style={{
                      background: 'var(--surface2)',
                      border: '1px solid var(--edge)',
                      borderRadius: '5px',
                      padding: '3px 5px',
                      color: 'var(--t2)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <MoreVertical size={13} />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenuId === qr.id && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        [isRtl ? 'left' : 'right']: 0,
                        marginTop: '4px',
                        background: 'var(--surface)',
                        border: '1px solid var(--edge)',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        minWidth: '150px',
                        zIndex: 10,
                        padding: '5px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      <button
                        onClick={() => {
                          if (onEditQR) onEditQR(qr);
                          setActiveMenuId(null);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '7px 8px',
                          borderRadius: '5px',
                          color: 'var(--t1)',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '7px',
                          cursor: 'pointer',
                          textAlign: isRtl ? 'right' : 'left',
                          width: '100%'
                        }}
                      >
                        <Edit3 size={13} color="var(--a)" />
                        <span>{isRtl ? 'تعديل' : 'Edit'}</span>
                      </button>

                      <button
                        onClick={() => {
                          if (onDuplicateQR) onDuplicateQR(qr);
                          setActiveMenuId(null);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '7px 8px',
                          borderRadius: '5px',
                          color: 'var(--t1)',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '7px',
                          cursor: 'pointer',
                          textAlign: isRtl ? 'right' : 'left',
                          width: '100%'
                        }}
                      >
                        <Copy size={13} />
                        <span>{isRtl ? 'تكرار' : 'Duplicate'}</span>
                      </button>

                      <button
                        onClick={() => handleDownload(qr, 'png')}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '7px 8px',
                          borderRadius: '5px',
                          color: 'var(--t1)',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '7px',
                          cursor: 'pointer',
                          textAlign: isRtl ? 'right' : 'left',
                          width: '100%'
                        }}
                      >
                        <Download size={13} color="#16a34a" />
                        <span>{isRtl ? 'تنزيل PNG' : 'Download PNG'}</span>
                      </button>

                      <button
                        onClick={() => handleDownload(qr, 'svg')}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '7px 8px',
                          borderRadius: '5px',
                          color: 'var(--t1)',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '7px',
                          cursor: 'pointer',
                          textAlign: isRtl ? 'right' : 'left',
                          width: '100%'
                        }}
                      >
                        <Download size={13} color="#0284c7" />
                        <span>{isRtl ? 'تنزيل SVG' : 'Download SVG'}</span>
                      </button>

                      <div style={{ height: '1px', background: 'var(--edge)', margin: '3px 0' }} />

                      <button
                        onClick={() => {
                          setDeleteTarget({ type: 'single', qr });
                          setActiveMenuId(null);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '7px 8px',
                          borderRadius: '5px',
                          color: '#ef4444',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '7px',
                          cursor: 'pointer',
                          textAlign: isRtl ? 'right' : 'left',
                          width: '100%'
                        }}
                      >
                        <Trash2 size={13} />
                        <span>{isRtl ? 'حذف' : 'Delete'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* QR Code Canvas / Image Display */}
                <div
                  onClick={() => onEditQR && onEditQR(qr)}
                  style={{
                    background: qr.design?.bgColor || '#ffffff',
                    borderRadius: '10px',
                    padding: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    marginTop: '16px',
                    boxShadow: 'inset 0 0 0 1px var(--edge)',
                    minHeight: '125px'
                  }}
                >
                  <QRThumbnail qr={qr} size={105} />
                </div>

                {/* Info */}
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: '800', color: 'var(--t1)', margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {qr.name || 'Unnamed QR'}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                    {/* Type Badge */}
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(37, 99, 235, 0.08)',
                        color: 'var(--a)',
                        padding: '2px 6px',
                        borderRadius: '5px',
                        fontSize: '10.5px',
                        fontWeight: '700'
                      }}
                    >
                      {renderTypeIcon(typeMeta.icon, 10)}
                      <span>{isRtl ? typeMeta.labelAr : typeMeta.label}</span>
                    </div>

                    {/* Scans Count */}
                    <div style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <BarChart3 size={11} />
                      <span>{totalScans} {isRtl ? 'مسحة' : 'scans'}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Footer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--edge)',
                    paddingTop: '8px',
                    marginTop: 'auto'
                  }}
                >
                  <button
                    onClick={() => handleCopyLink(qr)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: copiedId === qr.id ? '#16a34a' : 'var(--t2)',
                      fontSize: '11.5px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    {copiedId === qr.id ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedId === qr.id ? (isRtl ? 'تم النسخ' : 'Copied') : (isRtl ? 'نسخ الرابط' : 'Copy link')}</span>
                  </button>

                  <button
                    onClick={() => handleDownload(qr, 'png')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--a)',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    <Download size={12} />
                    <span>{isRtl ? 'تنزيل' : 'Download'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List Mode Render */}
      {viewMode === 'list' && !isEmpty && (
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--edge)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--edge)' }}>
                <th style={{ padding: '12px 16px', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredQRs.length && filteredQRs.length > 0}
                    onChange={toggleSelectAll}
                    style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: 'var(--a)' }}
                  />
                </th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '800', color: 'var(--t2)', textTransform: 'uppercase' }}>
                  {isRtl ? 'الرمز والاسم' : 'QR Code & Name'}
                </th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '800', color: 'var(--t2)', textTransform: 'uppercase' }}>
                  {isRtl ? 'النوع' : 'Type'}
                </th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '800', color: 'var(--t2)', textTransform: 'uppercase' }}>
                  {isRtl ? 'الهدف / الرابط' : 'Target'}
                </th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '800', color: 'var(--t2)', textTransform: 'uppercase' }}>
                  {isRtl ? 'المسحات' : 'Scans'}
                </th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '800', color: 'var(--t2)', textTransform: 'uppercase' }}>
                  {isRtl ? 'تاريخ الإنشاء' : 'Created'}
                </th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '800', color: 'var(--t2)', textTransform: 'uppercase', textAlign: 'center' }}>
                  {isRtl ? 'الإجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredQRs.map((qr) => {
                const typeMeta = getTypeMeta(qr.type);
                const isSelected = selectedIds.has(qr.id);
                const totalScans = qr.analytics?.totalScans || qr.scans || 0;

                return (
                  <tr
                    key={qr.id}
                    style={{
                      borderBottom: '1px solid var(--edge)',
                      background: isSelected ? 'rgba(37, 99, 235, 0.04)' : 'transparent',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(qr.id)}
                        style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: 'var(--a)' }}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: qr.design?.bgColor || '#fff',
                            border: '1px solid var(--edge)',
                            padding: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            overflow: 'hidden'
                          }}
                        >
                          <QRThumbnail qr={qr} size={34} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: '800', color: 'var(--t1)' }}>
                            {qr.name || 'Unnamed QR'}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--t2)' }}>
                            ID: {qr.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: 'rgba(37, 99, 235, 0.08)',
                          color: 'var(--a)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: '700'
                        }}
                      >
                        {renderTypeIcon(typeMeta.icon, 12)}
                        <span>{isRtl ? typeMeta.labelAr : typeMeta.label}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <span style={{ fontSize: '12.5px', color: 'var(--t2)' }}>
                        {qr.targetPayload || qr.data?.url || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--t1)' }}>
                        {totalScans}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '12.5px', color: 'var(--t2)' }}>
                      {qr.createdAt ? new Date(qr.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleCopyLink(qr)}
                          style={{
                            background: 'var(--surface2)',
                            border: '1px solid var(--edge)',
                            borderRadius: '6px',
                            padding: '6px',
                            color: copiedId === qr.id ? '#16a34a' : 'var(--t2)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title={isRtl ? 'نسخ الرابط' : 'Copy link'}
                        >
                          {copiedId === qr.id ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                        <button
                          onClick={() => handleDownload(qr, 'png')}
                          style={{
                            background: 'var(--surface2)',
                            border: '1px solid var(--edge)',
                            borderRadius: '6px',
                            padding: '6px',
                            color: 'var(--a)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title={isRtl ? 'تنزيل PNG' : 'Download PNG'}
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => onEditQR && onEditQR(qr)}
                          style={{
                            background: 'var(--surface2)',
                            border: '1px solid var(--edge)',
                            borderRadius: '6px',
                            padding: '6px',
                            color: 'var(--t1)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title={isRtl ? 'تعديل' : 'Edit'}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ type: 'single', qr })}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '6px',
                            padding: '6px',
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title={isRtl ? 'حذف' : 'Delete'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CUSTOM CONFIRM DELETE MODAL */}
      {deleteTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px',
            animation: 'fadeIn 0.18s ease-out',
            direction: isRtl ? 'rtl' : 'ltr'
          }}
          onClick={() => setDeleteTarget(null)}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--edge)',
              borderRadius: '22px',
              maxWidth: '460px',
              width: '100%',
              padding: '28px 24px',
              textAlign: 'center',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              style={{
                position: 'absolute',
                top: '16px',
                [isRtl ? 'left' : 'right']: '16px',
                background: 'var(--surface2)',
                border: '1px solid var(--edge)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--t2)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title={isRtl ? 'إغلاق' : 'Close'}
            >
              <X size={16} />
            </button>

            {/* Red Pulsing Danger Icon */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.08) 100%)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                border: '2px solid rgba(239, 68, 68, 0.25)',
                boxShadow: '0 0 24px rgba(239, 68, 68, 0.2)'
              }}
            >
              <Trash2 size={28} strokeWidth={2.2} />
            </div>

            {/* Main Title matching user request */}
            <h3 style={{ fontSize: '19px', fontWeight: '900', color: 'var(--t1)', margin: '0 0 8px', letterSpacing: '-0.3px' }}>
              {deleteTarget.type === 'bulk'
                ? (isRtl ? `هل أنت متأكد من حذف ${deleteTarget.count} رمز QR؟` : `Are you sure you want to delete ${deleteTarget.count} QR codes?`)
                : (isRtl ? 'هل أنت متأكد من حذف 1 رمز QR؟' : 'Are you sure you want to delete 1 QR code?')}
            </h3>

            <p style={{ fontSize: '13px', color: 'var(--t2)', lineHeight: 1.55, margin: '0 0 16px' }}>
              {deleteTarget.type === 'bulk'
                ? (isRtl
                    ? `سيتم حذف جميع الرموز المحددة (${deleteTarget.count}) نهائياً من حسابك وإيقاف إعادة التوجيه لجميع روابطها.`
                    : `All ${deleteTarget.count} selected QR codes will be permanently removed along with their scan analytics.`)
                : (isRtl
                    ? 'سيتم حذف هذا الرمز نهائياً من حسابك وإيقاف إعادة توجيه الروابط والمسحات المرتبطة به فوراً.'
                    : 'This QR code and its scan analytics will be permanently deleted. This action cannot be undone.')}
            </p>

            {/* Single Item Preview Card */}
            {deleteTarget.type === 'single' && deleteTarget.qr && (
              <div
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--edge)',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textAlign: isRtl ? 'right' : 'left'
                }}
              >
                {/* Mini QR Thumbnail */}
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '8px',
                    background: deleteTarget.qr.design?.bgColor || '#ffffff',
                    border: '1px solid var(--edge)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden',
                    padding: '3px'
                  }}
                >
                  <QRThumbnail qr={deleteTarget.qr} size={40} />
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '13.5px',
                      fontWeight: '800',
                      color: 'var(--t1)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {deleteTarget.qr.name || (isRtl ? 'رمز QR بدون اسم' : 'Unnamed QR')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'rgba(37, 99, 235, 0.1)',
                        color: 'var(--a)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}
                    >
                      {renderTypeIcon(getTypeMeta(deleteTarget.qr.type).icon, 11)}
                      <span>{isRtl ? getTypeMeta(deleteTarget.qr.type).labelAr : getTypeMeta(deleteTarget.qr.type).label}</span>
                    </span>

                    <span style={{ fontSize: '11px', color: 'var(--t2)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <BarChart3 size={11} />
                      {deleteTarget.qr.analytics?.totalScans || 0} {isRtl ? 'مسحة' : 'scans'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Bulk items preview */}
            {deleteTarget.type === 'bulk' && (
              <div
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--edge)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Layers size={16} color="var(--a)" />
                <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--t1)' }}>
                  {isRtl ? `تم تحديد ${deleteTarget.count} من عناصر QR للحذف` : `${deleteTarget.count} QR codes selected for deletion`}
                </span>
              </div>
            )}

            {/* Warning Callout Box */}
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px dashed rgba(239, 68, 68, 0.3)',
                borderRadius: '10px',
                padding: '9px 12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textAlign: isRtl ? 'right' : 'left'
              }}
            >
              <AlertTriangle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '11.5px', color: '#ef4444', fontWeight: '700', lineHeight: 1.4 }}>
                {isRtl
                  ? 'تنبيه: هذا الإجراء نهائي ولا يمكن التراجع عنه بأي شكل.'
                  : 'Caution: This action is permanent and cannot be undone.'}
              </span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                style={{
                  flex: 1,
                  background: 'var(--surface2)',
                  border: '1px solid var(--edge)',
                  color: 'var(--t1)',
                  padding: '11px 16px',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{
                  flex: 1.3,
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff',
                  border: 'none',
                  padding: '11px 18px',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  boxShadow: '0 4px 16px rgba(239, 68, 68, 0.35)',
                  transition: 'transform 0.1s ease, filter 0.15s ease'
                }}
              >
                <Trash2 size={16} />
                <span>
                  {deleteTarget.type === 'bulk'
                    ? (isRtl ? `نعم، حذف ${deleteTarget.count} رموز QR` : `Delete ${deleteTarget.count} QRs`)
                    : (isRtl ? 'نعم، حذف 1 رمز QR' : 'Yes, Delete 1 QR Code')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
