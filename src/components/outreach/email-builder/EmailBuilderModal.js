'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Monitor,
  Smartphone,
  Code,
  Sparkles,
  Send,
  Eye,
  Check,
  Undo2,
  Redo2,
  Palette,
  Layers,
  FileText,
  MousePointerClick,
  Heading,
  Type,
  Image as ImageIcon,
  Layout,
  Tag,
  Minus,
  MoveVertical,
  Share2,
  Info,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { BLOCK_TYPES, AVAILABLE_BLOCKS_CATALOG, createDefaultBlock, DEFAULT_EMAIL_THEME } from './defaultBlocks.js';
import { PREBUILT_EMAIL_TEMPLATES } from './emailTemplates.js';
import { compileEmailHtml } from './emailHtmlGenerator.js';

const ICON_MAP = {
  Layout,
  Heading,
  Type,
  MousePointerClick,
  Image: ImageIcon,
  Sparkles,
  Columns: Layers,
  Tag,
  Minus,
  MoveVertical,
  Share2,
  Info
};

export default function EmailBuilderModal({
  isOpen,
  onClose,
  initialBlocks,
  initialTheme,
  campaignName = '',
  onSave,
  onSendTestEmail,
  isRTL = true
}) {
  const [blocks, setBlocks] = useState([]);
  const [theme, setTheme] = useState(DEFAULT_EMAIL_THEME);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [activeSideTab, setActiveSideTab] = useState('elements'); // 'elements' | 'templates' | 'tokens' | 'theme'
  const [viewportMode, setViewportMode] = useState('desktop'); // 'desktop' | 'mobile' | 'code'
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testFeedback, setTestFeedback] = useState(null);
  const [pendingTemplate, setPendingTemplate] = useState(null);
  const [copiedToken, setCopiedToken] = useState(null);
  const [htmlCopied, setHtmlCopied] = useState(false);

  const t = (ar, en) => (isRTL ? ar : en);

  // Initialize blocks and theme on open
  useEffect(() => {
    if (isOpen) {
      const initial = initialBlocks && initialBlocks.length > 0
        ? initialBlocks
        : PREBUILT_EMAIL_TEMPLATES[0].blocks;
      const initialTh = initialTheme || DEFAULT_EMAIL_THEME;
      setBlocks(initial);
      setTheme(initialTh);
      setSelectedBlockId(initial[0]?.id || null);
      setHistory([{ blocks: initial, theme: initialTh }]);
      setHistoryIndex(0);
      setTestFeedback(null);
    }
  }, [isOpen, initialBlocks, initialTheme]);

  const recordHistory = (newBlocks, newTheme = theme) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push({ blocks: newBlocks, theme: newTheme });
    if (nextHistory.length > 30) nextHistory.shift();
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setBlocks(prev.blocks);
      setTheme(prev.theme);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setBlocks(next.blocks);
      setTheme(next.theme);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const selectedBlock = useMemo(() => {
    return blocks.find((b) => b.id === selectedBlockId) || null;
  }, [blocks, selectedBlockId]);

  const compiledHtml = useMemo(() => {
    return compileEmailHtml(blocks, theme);
  }, [blocks, theme]);

  const handleAddBlock = (type, insertAfterId = null) => {
    const newBlock = createDefaultBlock(type);
    let updated;
    if (insertAfterId) {
      const idx = blocks.findIndex((b) => b.id === insertAfterId);
      if (idx !== -1) {
        updated = [...blocks.slice(0, idx + 1), newBlock, ...blocks.slice(idx + 1)];
      } else {
        updated = [...blocks, newBlock];
      }
    } else {
      updated = [...blocks, newBlock];
    }
    setBlocks(updated);
    setSelectedBlockId(newBlock.id);
    recordHistory(updated);
  };

  const handleUpdateBlock = (id, updates) => {
    const updated = blocks.map((b) => (b.id === id ? { ...b, ...updates } : b));
    setBlocks(updated);
    recordHistory(updated);
  };

  const handleDeleteBlock = (id, e) => {
    if (e) e.stopPropagation();
    if (blocks.length <= 1) return;
    const updated = blocks.filter((b) => b.id !== id);
    setBlocks(updated);
    if (selectedBlockId === id) {
      setSelectedBlockId(updated[0]?.id || null);
    }
    recordHistory(updated);
  };

  const handleDuplicateBlock = (id, e) => {
    if (e) e.stopPropagation();
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx === -1) return;
    const original = blocks[idx];
    const clone = {
      ...JSON.parse(JSON.stringify(original)),
      id: `blk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    };
    const updated = [...blocks.slice(0, idx + 1), clone, ...blocks.slice(idx + 1)];
    setBlocks(updated);
    setSelectedBlockId(clone.id);
    recordHistory(updated);
  };

  const handleMoveBlock = (id, direction, e) => {
    if (e) e.stopPropagation();
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === blocks.length - 1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const updated = [...blocks];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;

    setBlocks(updated);
    recordHistory(updated);
  };

  const handleApplyTemplate = (tmpl) => {
    setPendingTemplate(tmpl);
  };

  const handleCopyToken = (token) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(compiledHtml);
    setHtmlCopied(true);
    setTimeout(() => setHtmlCopied(false), 2000);
  };

  const handleSendTest = async () => {
    if (!testEmailInput.trim()) return;
    setTestSending(true);
    setTestFeedback(null);
    try {
      if (onSendTestEmail) {
        await onSendTestEmail({ testEmail: testEmailInput.trim(), htmlBody: compiledHtml });
        setTestFeedback({ ok: true, msg: t('تم إرسال البريد التجريبي بنجاح! تفقد بريدك الوارد.', 'Test email sent successfully! Check your inbox.') });
      } else {
        setTestFeedback({ ok: true, msg: t('تم إرسال بريد تجريبي إلى: ' + testEmailInput, 'Sent test email to: ' + testEmailInput) });
      }
    } catch (err) {
      setTestFeedback({ ok: false, msg: err.message || t('فشل إرسال البريد التجريبي', 'Failed to send test email') });
    } finally {
      setTestSending(false);
    }
  };

  const handleFinalSave = () => {
    if (onSave) {
      onSave({
        blocks,
        theme,
        htmlBody: compiledHtml
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  const MERGE_TOKENS = [
    { tag: '{{name}}', labelAr: 'اسم المشترك', labelEn: 'Contact Name', sample: 'أحمد علي' },
    { tag: '{{email}}', labelAr: 'البريد الإلكتروني', labelEn: 'Contact Email', sample: 'user@example.com' },
    { tag: '{{phone}}', labelAr: 'رقم الهاتف', labelEn: 'Phone Number', sample: '+96650000000' },
    { tag: '{{credits}}', labelAr: 'رصيد الكريدت', labelEn: 'Credit Balance', sample: '500' },
    { tag: '{{plan}}', labelAr: 'اسم الباقة', labelEn: 'Plan Name', sample: 'Growth Pro' },
    { tag: '{{dashboard_url}}', labelAr: 'رابط لوحة التحكم', labelEn: 'Dashboard URL', sample: 'https://upklick.net/dashboard' },
    { tag: '{{unsubscribe_url}}', labelAr: 'رابط إلغاء الاشتراك', labelEn: 'Unsubscribe Link', sample: 'https://upklick.net/unsub' }
  ];

  return (
    <div
      className="email-builder-overlay"
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        background: '#090912',
        display: 'flex',
        flexDirection: 'column',
        color: '#f1f5f9',
        overflow: 'hidden'
      }}
    >
      {/* Top Navigation Bar */}
      <header
        style={{
          height: '60px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#0e0e1a',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #FF6B35 0%, #6C35FF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '18px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(255, 107, 53, 0.35)'
            }}
          >
            ✉️
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{t('مصمم الإيميلات المرئي الذكي', 'Visual Drag & Drop Email Designer')}</span>
              <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', background: 'rgba(255, 107, 53, 0.15)', color: '#FF6B35', border: '1px solid rgba(255, 107, 53, 0.3)' }}>
                GoHighLevel Style
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              {campaignName ? `${t('الحملة:', 'Campaign:')} ${campaignName}` : t('تعديل قالب البريد الإلكتروني', 'Editing email layout & blocks')}
            </div>
          </div>
        </div>

        {/* Viewport and History Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', padding: '3px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              type="button"
              onClick={() => setViewportMode('desktop')}
              style={{
                background: viewportMode === 'desktop' ? '#FF6B35' : 'transparent',
                color: viewportMode === 'desktop' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '7px',
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 700,
                transition: 'all 0.15s ease'
              }}
              title={t('عرض شاشة الكمبيوتر (600px)', 'Desktop preview (600px)')}
            >
              <Monitor size={14} />
              <span>{t('كمبيوتر', 'Desktop')}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('mobile')}
              style={{
                background: viewportMode === 'mobile' ? '#FF6B35' : 'transparent',
                color: viewportMode === 'mobile' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '7px',
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 700,
                transition: 'all 0.15s ease'
              }}
              title={t('عرض هاتف الجوال (375px)', 'Mobile phone preview (375px)')}
            >
              <Smartphone size={14} />
              <span>{t('موبايل', 'Mobile')}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewportMode('code')}
              style={{
                background: viewportMode === 'code' ? '#FF6B35' : 'transparent',
                color: viewportMode === 'code' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '7px',
                padding: '6px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 700,
                transition: 'all 0.15s ease'
              }}
              title={t('عرض كود HTML المصدر', 'HTML Source Code')}
            >
              <Code size={14} />
              <span>HTML</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: historyIndex <= 0 ? '#475569' : '#e2e8f0',
                borderRadius: '8px',
                padding: '6px 10px',
                cursor: historyIndex <= 0 ? 'not-allowed' : 'pointer'
              }}
              title={t('تراجع (Undo)', 'Undo')}
            >
              <Undo2 size={15} />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: historyIndex >= history.length - 1 ? '#475569' : '#e2e8f0',
                borderRadius: '8px',
                padding: '6px 10px',
                cursor: historyIndex >= history.length - 1 ? 'not-allowed' : 'pointer'
              }}
              title={t('إعادة (Redo)', 'Redo')}
            >
              <Redo2 size={15} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={() => { setTestModalOpen(true); setTestFeedback(null); }}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              borderRadius: '10px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Send size={14} color="#FF6B35" />
            <span>{t('إرسال تجريبي', 'Send Test')}</span>
          </button>

          <button
            type="button"
            onClick={handleFinalSave}
            style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #6C35FF 100%)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '10px',
              padding: '8px 22px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(255, 107, 53, 0.4)'
            }}
          >
            <Check size={16} />
            <span>{t('تطبيق وحفظ التصميم', 'Apply & Save Design')}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={t('إغلاق', 'Close')}
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Main Workspace 3-Column Layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Left Side: Blocks, Templates & Variables Drawer */}
        <aside
          style={{
            width: '320px',
            borderRight: isRTL ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
            borderLeft: isRTL ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
            background: '#0e0e1a',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0
          }}
        >
          {/* Drawer Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '6px' }}>
            {[
              { id: 'elements', label: t('العناصر', 'Blocks'), icon: Layers },
              { id: 'templates', label: t('القوالب', 'Templates'), icon: Sparkles },
              { id: 'tokens', label: t('المتغيرات', 'Tokens'), icon: Tag },
              { id: 'theme', label: t('السمة', 'Theme'), icon: Palette }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSideTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSideTab(tab.id)}
                  style={{
                    background: isActive ? 'rgba(255, 107, 53, 0.15)' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 4px',
                    color: isActive ? '#FF6B35' : '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Drawer Content Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {activeSideTab === 'elements' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>
                  {t('اسحب أو اضغط لإضافة العنصر:', 'Click or drag to add element:')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {AVAILABLE_BLOCKS_CATALOG.map((cat) => {
                    const Icon = ICON_MAP[cat.icon] || Layout;
                    return (
                      <button
                        key={cat.type}
                        type="button"
                        onClick={() => handleAddBlock(cat.type, selectedBlockId)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '12px',
                          padding: '12px 10px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          textAlign: 'center',
                          color: '#e2e8f0',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 107, 53, 0.12)';
                          e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.4)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FF6B35'
                          }}
                        >
                          <Icon size={16} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 700 }}>
                          {isRTL ? cat.labelAr : cat.labelEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeSideTab === 'templates' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8' }}>
                  {t('قوالب جاهزة عالية التحويل:', 'High-converting ready templates:')}
                </div>
                {PREBUILT_EMAIL_TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => handleApplyTemplate(tmpl)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(108, 53, 255, 0.12)';
                      e.currentTarget.style.borderColor = 'rgba(108, 53, 255, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '22px' }}>{tmpl.thumbnail}</span>
                      {tmpl.badge && (
                        <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '999px', background: 'rgba(255, 107, 53, 0.15)', color: '#FF6B35', border: '1px solid rgba(255, 107, 53, 0.3)' }}>
                          {tmpl.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>
                        {isRTL ? tmpl.nameAr : tmpl.nameEn}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '4px', lineHeight: 1.4 }}>
                        {isRTL ? tmpl.descriptionAr : tmpl.descriptionEn}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSideTab === 'tokens' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', marginBottom: '2px' }}>
                  {t('المتغيرات الديناميكية (Merge Tags):', 'Dynamic Variables (Tokens):')}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', lineHeight: 1.5 }}>
                  {t('اضغط على أي متغير لنسخه ولصقه في نصوص أو عناوين البريد الإلكتروني:', 'Click any token to copy and paste it into texts:')}
                </div>
                {MERGE_TOKENS.map((tk) => {
                  const isCopied = copiedToken === tk.tag;
                  return (
                    <div
                      key={tk.tag}
                      onClick={() => handleCopyToken(tk.tag)}
                      style={{
                        background: isCopied ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                        border: isCopied ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        padding: '10px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#FF6B35', fontFamily: 'monospace' }}>
                          {tk.tag}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                          {isRTL ? tk.labelAr : tk.labelEn} · <span style={{ color: '#64748b' }}>({tk.sample})</span>
                        </div>
                      </div>
                      <span style={{ fontSize: '11px', color: isCopied ? '#10b981' : '#94a3b8', fontWeight: 700 }}>
                        {isCopied ? `✓ ${t('تم النسخ', 'Copied')}` : t('نسخ', 'Copy')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {activeSideTab === 'theme' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8' }}>
                  {t('الإعدادات العامة للبريد:', 'Global Email Theme:')}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                    {t('اتجاه النص (Direction)', 'Text Direction')}
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setTheme((prev) => ({ ...prev, direction: 'rtl' }))}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '8px',
                        background: theme.direction === 'rtl' ? '#FF6B35' : 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '12px'
                      }}
                    >
                      RTL (عربي)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme((prev) => ({ ...prev, direction: 'ltr' }))}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '8px',
                        background: theme.direction === 'ltr' ? '#FF6B35' : 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '12px'
                      }}
                    >
                      LTR (English)
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                    {t('لون خلفية المحتوى الداخلي', 'Container Background')}
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={theme.containerBackgroundColor || '#12121f'}
                      onChange={(e) => setTheme((prev) => ({ ...prev, containerBackgroundColor: e.target.value }))}
                      style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'none' }}
                    />
                    <input
                      type="text"
                      className="form-control"
                      value={theme.containerBackgroundColor || '#12121f'}
                      onChange={(e) => setTheme((prev) => ({ ...prev, containerBackgroundColor: e.target.value }))}
                      style={{ flex: 1, fontSize: '12px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                    {t('لون الخلفية الخارجية', 'Outer Body Background')}
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={theme.bodyBackgroundColor || '#090912'}
                      onChange={(e) => setTheme((prev) => ({ ...prev, bodyBackgroundColor: e.target.value }))}
                      style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'none' }}
                    />
                    <input
                      type="text"
                      className="form-control"
                      value={theme.bodyBackgroundColor || '#090912'}
                      onChange={(e) => setTheme((prev) => ({ ...prev, bodyBackgroundColor: e.target.value }))}
                      style={{ flex: 1, fontSize: '12px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                    {t('عرض الحاوية الأقصى (Max Width)', 'Max Container Width')}
                  </label>
                  <select
                    className="form-control"
                    value={theme.containerMaxWidth || 600}
                    onChange={(e) => setTheme((prev) => ({ ...prev, containerMaxWidth: Number(e.target.value) }))}
                    style={{ fontSize: '12px' }}
                  >
                    <option value={550}>550px ({t('مضغوط', 'Compact')})</option>
                    <option value={600}>600px ({t('القياسي لمعظم الإيميلات', 'Standard 600px')})</option>
                    <option value={650}>650px ({t('واسع', 'Wide')})</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Center: Interactive Visual Canvas */}
        <main
          style={{
            flex: 1,
            background: theme.bodyBackgroundColor || '#090912',
            overflowY: 'auto',
            padding: viewportMode === 'mobile' ? '40px 20px' : '30px 20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}
        >
          {viewportMode === 'code' ? (
            <div
              style={{
                maxWidth: '800px',
                width: '100%',
                background: '#12121f',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                  {t('كود HTML المصدر للبريد (مترجم تلقائياً):', 'Compiled HTML Source Code:')}
                </div>
                <button
                  type="button"
                  onClick={handleCopyHtml}
                  className="btn btn-ghost btn-sm"
                  style={{ color: htmlCopied ? '#10b981' : '#FF6B35' }}
                >
                  <Copy size={14} />
                  <span>{htmlCopied ? t('تم نسخ الـ HTML!', 'HTML Copied!') : t('نسخ الكود', 'Copy HTML')}</span>
                </button>
              </div>
              <textarea
                readOnly
                value={compiledHtml}
                rows={22}
                style={{
                  width: '100%',
                  background: '#0a0a14',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: '#94a3b8',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  padding: '14px',
                  lineHeight: 1.6,
                  resize: 'vertical'
                }}
              />
            </div>
          ) : (
            <div
              className={`email-canvas-viewport ${viewportMode === 'mobile' ? 'is-mobile-frame' : ''}`}
              style={{
                width: viewportMode === 'mobile' ? '375px' : `${theme.containerMaxWidth || 600}px`,
                maxWidth: '100%',
                background: theme.containerBackgroundColor || '#12121f',
                border: viewportMode === 'mobile' ? '12px solid #27273a' : `1px solid ${theme.containerBorderColor || 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: viewportMode === 'mobile' ? '40px' : `${theme.containerBorderRadius || 16}px`,
                padding: viewportMode === 'mobile' ? '24px 16px' : '24px 28px',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
                position: 'relative',
                transition: 'all 0.3s ease',
                direction: theme.direction === 'rtl' ? 'rtl' : 'ltr'
              }}
            >
              {/* Mobile Phone Top Notch */}
              {viewportMode === 'mobile' && (
                <div
                  style={{
                    width: '120px',
                    height: '18px',
                    background: '#27273a',
                    borderRadius: '0 0 12px 12px',
                    margin: '-24px auto 16px auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#161622' }} />
                  <div style={{ width: '40px', height: '4px', borderRadius: '4px', background: '#161622' }} />
                </div>
              )}

              {/* Blocks Stream */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {blocks.map((block, index) => {
                  const isSelected = selectedBlockId === block.id;
                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={`email-builder-block ${isSelected ? 'is-selected' : ''}`}
                      style={{
                        position: 'relative',
                        borderRadius: '8px',
                        outline: isSelected ? '2px solid #FF6B35' : '1px dashed transparent',
                        background: isSelected ? 'rgba(255, 107, 53, 0.04)' : 'transparent',
                        padding: '4px 6px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {/* Floating Block Actions Bar on Hover / Selection */}
                      {isSelected && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '-14px',
                            [theme.direction === 'rtl' ? 'left' : 'right']: '10px',
                            zIndex: 10,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#1e1e30',
                            border: '1px solid #FF6B35',
                            borderRadius: '6px',
                            padding: '2px 4px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                          }}
                        >
                          <button
                            type="button"
                            onClick={(e) => handleMoveBlock(block.id, 'up', e)}
                            disabled={index === 0}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: index === 0 ? '#475569' : '#e2e8f0',
                              cursor: index === 0 ? 'not-allowed' : 'pointer',
                              padding: '2px 4px'
                            }}
                            title={t('تحريك للأعلى', 'Move Up')}
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleMoveBlock(block.id, 'down', e)}
                            disabled={index === blocks.length - 1}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: index === blocks.length - 1 ? '#475569' : '#e2e8f0',
                              cursor: index === blocks.length - 1 ? 'not-allowed' : 'pointer',
                              padding: '2px 4px'
                            }}
                            title={t('تحريك للأسفل', 'Move Down')}
                          >
                            <ArrowDown size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDuplicateBlock(block.id, e)}
                            style={{ background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer', padding: '2px 4px' }}
                            title={t('تكرار', 'Duplicate')}
                          >
                            <Copy size={13} />
                          </button>
                          {blocks.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteBlock(block.id, e)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px 4px' }}
                              title={t('حذف', 'Delete')}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Render block visual representation on canvas */}
                      <RenderCanvasBlock block={block} theme={theme} isRTL={theme.direction === 'rtl'} />
                    </div>
                  );
                })}
              </div>

              {/* Bottom Inserter Button */}
              <div style={{ marginTop: '16px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setActiveSideTab('elements')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px dashed rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    padding: '8px 18px',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#FF6B35';
                    e.currentTarget.style.color = '#FF6B35';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.color = '#94a3b8';
                  }}
                >
                  <Plus size={14} />
                  <span>{t('إضافة عنصر جديد', 'Add New Block')}</span>
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Right Side: Properties Inspector Panel */}
        <aside
          style={{
            width: '320px',
            borderLeft: isRTL ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
            borderRight: isRTL ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
            background: '#0e0e1a',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0
          }}
        >
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '13px',
              fontWeight: 800,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>{t('خصائص وتصميم العنصر', 'Block Properties & Styling')}</span>
            {selectedBlock && (
              <span style={{ fontSize: '11px', color: '#FF6B35', fontWeight: 700 }}>
                {selectedBlock.type}
              </span>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {selectedBlock ? (
              <BlockPropertiesEditor
                block={selectedBlock}
                onChange={(updates) => handleUpdateBlock(selectedBlock.id, updates)}
                isRTL={isRTL}
                t={t}
              />
            ) : (
              <div style={{ padding: '30px 10px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                {t('حدد أي عنصر من مساحة العمل لتعديل نصوصه وألوانه', 'Select any block on canvas to edit its properties')}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Test Send Email Modal */}
      {testModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setTestModalOpen(false)}
        >
          <div
            style={{
              maxWidth: '460px',
              width: '100%',
              background: '#12121f',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              padding: '22px 24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={18} color="#FF6B35" />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>
                  {t('إرسال بريد تجريبي فوري', 'Send Instant Test Email')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
              {t(
                'أدخل أي بريد إلكتروني لمعاينة الشكل والتنسيق الحقيقي كما سيظهر في Gmail و Apple Mail و Outlook:',
                'Enter any email address to preview the design as it appears in real inboxes:'
              )}
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                {t('البريد الإلكتروني للمستلم', 'Recipient Email Address')}
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="youremail@domain.com"
                value={testEmailInput}
                onChange={(e) => setTestEmailInput(e.target.value)}
                autoFocus
              />
            </div>

            {testFeedback && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '12.5px',
                  background: testFeedback.ok ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  border: testFeedback.ok ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  color: testFeedback.ok ? '#10b981' : '#f87171'
                }}
              >
                {testFeedback.msg}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setTestModalOpen(false)}
              >
                {t('إلغاء', 'Cancel')}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSendTest}
                disabled={testSending || !testEmailInput.trim()}
                style={{
                  background: 'linear-gradient(135deg, #FF6B35 0%, #6C35FF 100%)',
                  border: 'none',
                  color: '#ffffff'
                }}
              >
                {testSending ? t('جارٍ الإرسال…', 'Sending…') : t('إرسال الآن 🚀', 'Send Now 🚀')}
              </button>
            </div>
          </div>
      {/* Custom Confirmation Modal for Applying Templates */}
      {pendingTemplate && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setPendingTemplate(null)}
        >
          <div
            style={{
              maxWidth: '460px',
              width: '100%',
              background: '#12121f',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              padding: '22px 24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              direction: isRTL ? 'rtl' : 'ltr'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(255, 107, 53, 0.15)',
                  color: '#FF6B35',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  flexShrink: 0
                }}
              >
                {pendingTemplate.thumbnail || '✨'}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>
                  {t('تطبيق هذا القالب؟', 'Apply this template?')}
                </h3>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  {isRTL ? pendingTemplate.nameAr : pendingTemplate.nameEn}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPendingTemplate(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '13.5px', color: '#cbd5e1', lineHeight: 1.6 }}>
              {t(
                'هل أنت متأكد من تطبيق هذا القالب؟ سيتم استبدال التصميم الحالي في مساحة العمل بالتصميم الجديد.',
                'Are you sure you want to apply this template? The current canvas layout will be replaced.'
              )}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setPendingTemplate(null)}
              >
                {t('إلغاء', 'Cancel')}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #FF6B35 0%, #6C35FF 100%)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 800,
                  padding: '8px 20px'
                }}
                onClick={() => {
                  setBlocks(pendingTemplate.blocks);
                  setTheme(pendingTemplate.theme || DEFAULT_EMAIL_THEME);
                  setSelectedBlockId(pendingTemplate.blocks[0]?.id || null);
                  recordHistory(pendingTemplate.blocks, pendingTemplate.theme || DEFAULT_EMAIL_THEME);
                  setPendingTemplate(null);
                }}
              >
                {t('تطبيق القالب الآن ✨', 'Apply Template Now ✨')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RenderCanvasBlock({ block, theme, isRTL }) {
  const dir = isRTL ? 'rtl' : 'ltr';
  const textAlign = isRTL ? 'right' : 'left';

  switch (block.type) {
    case BLOCK_TYPES.HEADER:
      return (
        <div style={{ textAlign: block.align || 'center', padding: `${block.paddingTop || 8}px 0 ${block.paddingBottom || 8}px 0` }}>
          {block.logoUrl ? (
            <img src={block.logoUrl} alt={block.logoText || 'Logo'} style={{ maxWidth: `${block.logoWidth || 160}px`, height: 'auto', display: 'inline-block' }} />
          ) : (
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: theme.primaryColor }}>{block.logoText || 'UpKlick'}</h1>
          )}
          {block.showTagline && block.tagline && (
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{block.tagline}</div>
          )}
        </div>
      );

    case BLOCK_TYPES.HEADING:
      return (
        <div style={{ textAlign: block.align || textAlign, padding: `${block.paddingTop || 6}px 0 ${block.paddingBottom || 6}px 0`, direction: dir }}>
          <h2 style={{ margin: 0, fontSize: `${block.fontSize || 22}px`, fontWeight: block.fontWeight || 'bold', color: block.color || '#ffffff', lineHeight: 1.35 }}>
            {block.text}
          </h2>
        </div>
      );

    case BLOCK_TYPES.TEXT:
      return (
        <div
          style={{
            textAlign: block.align || textAlign,
            color: block.color || '#cbd5e1',
            fontSize: `${block.fontSize || 15}px`,
            lineHeight: block.lineHeight || 1.7,
            padding: `${block.paddingTop || 4}px 0 ${block.paddingBottom || 6}px 0`,
            direction: dir,
            whiteSpace: 'pre-wrap'
          }}
        >
          {block.content}
        </div>
      );

    case BLOCK_TYPES.BUTTON:
      const btnBg = block.style === 'gradient'
        ? `linear-gradient(135deg, ${block.gradientStart || '#FF6B35'}, ${block.gradientEnd || '#6C35FF'})`
        : (block.backgroundColor || '#FF6B35');
      return (
        <div style={{ textAlign: block.align || 'center', padding: `${block.paddingTop || 12}px 0 ${block.paddingBottom || 12}px 0` }}>
          <span
            style={{
              display: block.width === 'full' ? 'block' : 'inline-block',
              padding: `${block.paddingY || 14}px ${block.paddingX || 32}px`,
              background: btnBg,
              color: block.textColor || '#ffffff',
              fontWeight: block.fontWeight || 'bold',
              fontSize: `${block.fontSize || 15}px`,
              borderRadius: `${block.borderRadius || 12}px`,
              boxShadow: '0 4px 16px rgba(255, 107, 53, 0.35)',
              userSelect: 'none'
            }}
          >
            {block.text}
          </span>
        </div>
      );

    case BLOCK_TYPES.IMAGE:
      return (
        <div style={{ textAlign: block.align || 'center', padding: `${block.paddingTop || 6}px 0 ${block.paddingBottom || 6}px 0` }}>
          <img
            src={block.imageUrl}
            alt={block.altText || ''}
            style={{
              width: `${block.width || 100}%`,
              maxWidth: '100%',
              borderRadius: `${block.borderRadius || 12}px`,
              display: 'inline-block'
            }}
          />
          {block.caption && (
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{block.caption}</div>
          )}
        </div>
      );

    case BLOCK_TYPES.CARD:
      return (
        <div
          style={{
            background: block.backgroundColor || 'rgba(255, 107, 53, 0.08)',
            border: `1px solid ${block.borderColor || 'rgba(255, 107, 53, 0.3)'}`,
            borderRadius: `${block.borderRadius || 14}px`,
            padding: `${block.padding || 16}px`,
            margin: `${block.paddingTop || 8}px 0 ${block.paddingBottom || 8}px 0`,
            textAlign: block.align || textAlign,
            direction: dir
          }}
        >
          {block.icon && <div style={{ fontSize: '22px', marginBottom: '6px' }}>{block.icon}</div>}
          <div style={{ fontWeight: 'bold', fontSize: '15px', color: block.titleColor || '#FF6B35', marginBottom: '4px' }}>
            {block.title}
          </div>
          <div style={{ fontSize: '13.5px', lineHeight: 1.6, color: block.textColor || '#e2e8f0', whiteSpace: 'pre-wrap' }}>
            {block.description}
          </div>
        </div>
      );

    case BLOCK_TYPES.COLUMNS:
      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            margin: `${block.paddingTop || 8}px 0 ${block.paddingBottom || 8}px 0`,
            direction: dir
          }}
        >
          <div
            style={{
              background: block.cardBackground || 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${block.borderColor || 'rgba(255, 255, 255, 0.08)'}`,
              borderRadius: '12px',
              padding: '12px'
            }}
          >
            {block.col1?.icon && <div style={{ fontSize: '18px', marginBottom: '4px' }}>{block.col1.icon}</div>}
            <div style={{ fontWeight: 'bold', fontSize: '13.5px', color: block.titleColor || '#ffffff', marginBottom: '4px' }}>
              {block.col1?.title}
            </div>
            <div style={{ fontSize: '12px', color: block.textColor || '#94a3b8', lineHeight: 1.5 }}>
              {block.col1?.description}
            </div>
          </div>
          <div
            style={{
              background: block.cardBackground || 'rgba(255, 255, 255, 0.03)',
              border: `1px solid ${block.borderColor || 'rgba(255, 255, 255, 0.08)'}`,
              borderRadius: '12px',
              padding: '12px'
            }}
          >
            {block.col2?.icon && <div style={{ fontSize: '18px', marginBottom: '4px' }}>{block.col2.icon}</div>}
            <div style={{ fontWeight: 'bold', fontSize: '13.5px', color: block.titleColor || '#ffffff', marginBottom: '4px' }}>
              {block.col2?.title}
            </div>
            <div style={{ fontSize: '12px', color: block.textColor || '#94a3b8', lineHeight: 1.5 }}>
              {block.col2?.description}
            </div>
          </div>
        </div>
      );

    case BLOCK_TYPES.COUPON:
      return (
        <div
          style={{
            background: block.backgroundColor || 'rgba(108, 53, 255, 0.1)',
            border: `2px dashed ${block.borderColor || '#6C35FF'}`,
            borderRadius: '14px',
            padding: '16px',
            margin: `${block.paddingTop || 10}px 0 ${block.paddingBottom || 10}px 0`,
            textAlign: 'center',
            direction: dir
          }}
        >
          <div style={{ fontSize: '11px', color: '#a78bfa', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>
            كوبون الخصم الخاص بك
          </div>
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '6px 20px',
              borderRadius: '8px',
              fontSize: '20px',
              fontWeight: 900,
              letterSpacing: '2px',
              color: block.codeColor || '#FF6B35',
              fontFamily: 'monospace',
              margin: '4px 0'
            }}
          >
            {block.code}
          </div>
          <div style={{ fontSize: '13.5px', fontWeight: 'bold', color: '#ffffff', marginTop: '4px' }}>{block.discount}</div>
          {block.expiresText && <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>{block.expiresText}</div>}
        </div>
      );

    case BLOCK_TYPES.DIVIDER:
      return (
        <div style={{ padding: `${block.paddingTop || 12}px 0 ${block.paddingBottom || 12}px 0` }}>
          <div
            style={{
              width: `${block.width || 100}%`,
              margin: '0 auto',
              borderTop: `${block.thickness || 1}px ${block.style || 'solid'} ${block.color || 'rgba(255,255,255,0.1)'}`
            }}
          />
        </div>
      );

    case BLOCK_TYPES.SPACER:
      return <div style={{ height: `${block.height || 24}px` }} />;

    case BLOCK_TYPES.SOCIAL:
      return (
        <div style={{ textAlign: block.align || 'center', padding: `${block.paddingTop || 10}px 0 ${block.paddingBottom || 10}px 0` }}>
          <div style={{ display: 'inline-flex', gap: '8px' }}>
            {(block.platforms || []).map((p, i) => (
              <span
                key={i}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  color: '#ffffff'
                }}
              >
                {p.icon || '🔗'}
              </span>
            ))}
          </div>
        </div>
      );

    case BLOCK_TYPES.FOOTER:
      return (
        <div style={{ textAlign: block.align || 'center', padding: `${block.paddingTop || 16}px 0 ${block.paddingBottom || 16}px 0`, fontSize: '11.5px', color: block.textColor || '#64748b', lineHeight: 1.6, direction: dir }}>
          <div>{block.companyName} · {block.address}</div>
          <div style={{ marginTop: '4px' }}>
            {block.unsubscribeText}{' '}
            <span style={{ color: block.linkColor || '#94a3b8', textDecoration: 'underline' }}>{block.unsubscribeLabel}</span>
          </div>
        </div>
      );

    default:
      return null;
  }
}

function BlockPropertiesEditor({ block, onChange, isRTL, t }) {
  const update = (field, val) => onChange({ [field]: val });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Block Type Header */}
      <div style={{ padding: '8px 12px', background: 'rgba(255, 107, 53, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 107, 53, 0.25)', fontSize: '12px', fontWeight: 700, color: '#FF6B35' }}>
        {t(`تعديل عنصر: ${block.type}`, `Editing block: ${block.type}`)}
      </div>

      {block.type === BLOCK_TYPES.HEADING && (
        <>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>{t('نص العنوان', 'Heading Text')}</label>
            <textarea className="form-control" rows={3} value={block.text || ''} onChange={(e) => update('text', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>{t('حجم الخط', 'Font Size')}</label>
              <input type="number" className="form-control" value={block.fontSize || 24} onChange={(e) => update('fontSize', Number(e.target.value))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>{t('المحاذاة', 'Align')}</label>
              <select className="form-control" value={block.align || 'right'} onChange={(e) => update('align', e.target.value)}>
                <option value="right">{t('يمين', 'Right')}</option>
                <option value="center">{t('وسط', 'Center')}</option>
                <option value="left">{t('يسار', 'Left')}</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>{t('لون النص', 'Text Color')}</label>
            <input type="color" value={block.color || '#ffffff'} onChange={(e) => update('color', e.target.value)} style={{ width: '100%', height: '36px', borderRadius: '8px', border: 'none', cursor: 'pointer' }} />
          </div>
        </>
      )}

      {block.type === BLOCK_TYPES.TEXT && (
        <>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>{t('محتوى الفقرة', 'Paragraph Text')}</label>
            <textarea className="form-control" rows={6} value={block.content || ''} onChange={(e) => update('content', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>{t('حجم الخط', 'Font Size')}</label>
              <input type="number" className="form-control" value={block.fontSize || 15} onChange={(e) => update('fontSize', Number(e.target.value))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>{t('المحاذاة', 'Align')}</label>
              <select className="form-control" value={block.align || 'right'} onChange={(e) => update('align', e.target.value)}>
                <option value="right">{t('يمين', 'Right')}</option>
                <option value="center">{t('وسط', 'Center')}</option>
                <option value="left">{t('يسار', 'Left')}</option>
              </select>
            </div>
          </div>
        </>
      )}

      {block.type === BLOCK_TYPES.BUTTON && (
        <>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>{t('نص الزر', 'Button Text')}</label>
            <input className="form-control" value={block.text || ''} onChange={(e) => update('text', e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>{t('الرابط المستهدف (URL)', 'Button URL')}</label>
            <input className="form-control" value={block.url || ''} onChange={(e) => update('url', e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>{t('نمط الزر', 'Button Style')}</label>
            <select className="form-control" value={block.style || 'gradient'} onChange={(e) => update('style', e.target.value)}>
              <option value="gradient">{t('تدرج لوني جذاب (Gradient)', 'Gradient')}</option>
              <option value="solid">{t('لون موحد (Solid)', 'Solid')}</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>{t('العرض', 'Width')}</label>
              <select className="form-control" value={block.width || 'auto'} onChange={(e) => update('width', e.target.value)}>
                <option value="auto">{t('تلقائي', 'Auto')}</option>
                <option value="full">{t('عرض كامل (100%)', 'Full Width')}</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>{t('انحناء الحواف', 'Border Radius')}</label>
              <input type="number" className="form-control" value={block.borderRadius || 12} onChange={(e) => update('borderRadius', Number(e.target.value))} />
            </div>
          </div>
        </>
      )}

      {block.type === BLOCK_TYPES.IMAGE && (
        <>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>{t('رابط الصورة (URL)', 'Image URL')}</label>
            <input className="form-control" value={block.imageUrl || ''} onChange={(e) => update('imageUrl', e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>{t('رابط عند الضغط (اختياري)', 'Link URL')}</label>
            <input className="form-control" value={block.linkUrl || ''} onChange={(e) => update('linkUrl', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>{t('العرض (%)', 'Width (%)')}</label>
              <input type="number" className="form-control" value={block.width || 100} onChange={(e) => update('width', Number(e.target.value))} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>{t('انحناء الحواف', 'Border Radius')}</label>
              <input type="number" className="form-control" value={block.borderRadius || 12} onChange={(e) => update('borderRadius', Number(e.target.value))} />
            </div>
          </div>
        </>
      )}

      {block.type === BLOCK_TYPES.CARD && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>{t('الأيقونة', 'Icon')}</label>
              <input className="form-control" value={block.icon || '⚡'} onChange={(e) => update('icon', e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>{t('العنوان', 'Title')}</label>
              <input className="form-control" value={block.title || ''} onChange={(e) => update('title', e.target.value)} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>{t('الوصف', 'Description')}</label>
            <textarea className="form-control" rows={3} value={block.description || ''} onChange={(e) => update('description', e.target.value)} />
          </div>
        </>
      )}

      {block.type === BLOCK_TYPES.COUPON && (
        <>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>{t('رمز الكوبون', 'Coupon Code')}</label>
            <input className="form-control" value={block.code || ''} onChange={(e) => update('code', e.target.value.toUpperCase())} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>{t('قيمة الخصم', 'Discount Text')}</label>
            <input className="form-control" value={block.discount || ''} onChange={(e) => update('discount', e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>{t('تنبيه الصلاحية', 'Expiration Notice')}</label>
            <input className="form-control" value={block.expiresText || ''} onChange={(e) => update('expiresText', e.target.value)} />
          </div>
        </>
      )}

      {block.type === BLOCK_TYPES.SPACER && (
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>{t('ارتفاع الفراغ (px)', 'Height (px)')}</label>
          <input type="number" className="form-control" value={block.height || 24} onChange={(e) => update('height', Number(e.target.value))} />
        </div>
      )}

      {block.type === BLOCK_TYPES.FOOTER && (
        <>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>{t('اسم الشركة / المنصة', 'Company Name')}</label>
            <input className="form-control" value={block.companyName || ''} onChange={(e) => update('companyName', e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>{t('العنوان / الحقوق', 'Address / Copyright')}</label>
            <input className="form-control" value={block.address || ''} onChange={(e) => update('address', e.target.value)} />
          </div>
        </>
      )}
    </div>
  );
}
