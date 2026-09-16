'use client';

import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Smartphone,
  Monitor,
  Undo2,
  Redo2,
  Eye,
  Share2,
  Save,
  Plus,
  X,
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  MapPin,
  Building,
  CheckSquare,
  FileText,
  AlignLeft,
  ChevronDown,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  Settings as SettingsIcon,
  Inbox,
  BarChart3,
  Bell,
  Check,
  Globe,
  Lock,
  Download,
  Search,
  RefreshCw,
  Bold,
  Italic,
  Underline,
  Smile,
  Link2,
  Sparkles,
  HelpCircle,
  Shield,
  UploadCloud,
  FileCode,
  Tag,
  Sliders,
  DollarSign
} from 'lucide-react';
import FormIntegrateModal from './FormIntegrateModal';
import LiveFormModal from './LiveFormModal';

export default function FormBuilderView({
  form: initialForm,
  isRtl,
  onBack,
  onSaveForm,
  showToast
}) {
  const [form, setForm] = useState(JSON.parse(JSON.stringify(initialForm)));
  const [activeBuilderTab, setActiveBuilderTab] = useState('edit'); // 'edit' | 'settings' | 'submissions' | 'notifications' | 'analytics'
  const [deviceMode, setDeviceMode] = useState('desktop'); // 'desktop' | 'mobile'
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(true);
  const [drawerTab, setDrawerTab] = useState('quick_add'); // 'quick_add' | 'object_fields'
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [history, setHistory] = useState([JSON.parse(JSON.stringify(initialForm))]);
  const [historyIdx, setHistoryIdx] = useState(0);

  // Modals
  const [isIntegrateOpen, setIsIntegrateOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Submissions search & filters
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [dateRange, setDateRange] = useState('16 / 08 / 2026 - 16 / 09 / 2026');

  // Helper to record history
  const pushHistory = (newForm) => {
    const newHist = history.slice(0, historyIdx + 1);
    newHist.push(JSON.parse(JSON.stringify(newForm)));
    setHistory(newHist);
    setHistoryIdx(newHist.length - 1);
    setForm(newForm);
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      const prevIdx = historyIdx - 1;
      setHistoryIdx(prevIdx);
      setForm(JSON.parse(JSON.stringify(history[prevIdx])));
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const nextIdx = historyIdx + 1;
      setHistoryIdx(nextIdx);
      setForm(JSON.parse(JSON.stringify(history[nextIdx])));
    }
  };

  // Add field to form
  const handleAddField = (fieldDef) => {
    const newField = {
      id: `f_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: fieldDef.type,
      label: fieldDef.label,
      placeholder: fieldDef.placeholder || '',
      required: fieldDef.required || false,
      width: fieldDef.width || '100%',
      options: fieldDef.options ? [...fieldDef.options] : undefined,
      buttonColor: fieldDef.buttonColor,
      textColor: fieldDef.textColor
    };

    // Insert before submit button if one exists
    const fields = [...(form.fields || [])];
    const submitIdx = fields.findIndex((f) => f.type === 'submit');
    if (submitIdx !== -1 && fieldDef.type !== 'submit') {
      fields.splice(submitIdx, 0, newField);
    } else {
      fields.push(newField);
    }

    const updated = { ...form, fields };
    pushHistory(updated);
    setSelectedFieldId(newField.id);
    if (showToast) showToast(isRtl ? `تمت إضافة حقل ${fieldDef.label}` : `Added ${fieldDef.label}`);
  };

  // Update a specific field
  const handleUpdateField = (fieldId, patch) => {
    const fields = (form.fields || []).map((f) => (f.id === fieldId ? { ...f, ...patch } : f));
    const updated = { ...form, fields };
    pushHistory(updated);
  };

  // Remove a field
  const handleDeleteField = (fieldId) => {
    const fields = (form.fields || []).filter((f) => f.id !== fieldId);
    const updated = { ...form, fields };
    pushHistory(updated);
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
  };

  // Duplicate a field
  const handleDuplicateField = (fieldId) => {
    const idx = (form.fields || []).findIndex((f) => f.id === fieldId);
    if (idx === -1) return;
    const original = form.fields[idx];
    const cloned = {
      ...JSON.parse(JSON.stringify(original)),
      id: `f_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      label: `${original.label} (Copy)`
    };
    const fields = [...form.fields];
    fields.splice(idx + 1, 0, cloned);
    const updated = { ...form, fields };
    pushHistory(updated);
    setSelectedFieldId(cloned.id);
  };

  // Move field up/down
  const handleMoveField = (idx, direction) => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= form.fields.length) return;
    const fields = [...form.fields];
    const temp = fields[idx];
    fields[idx] = fields[targetIdx];
    fields[targetIdx] = temp;
    const updated = { ...form, fields };
    pushHistory(updated);
  };

  // Save changes
  const handleSave = () => {
    const updated = {
      ...form,
      lastUpdated: new Date().toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
    onSaveForm(updated);
    if (showToast) showToast(isRtl ? 'تم حفظ النموذج بنجاح!' : 'Form saved successfully!');
  };

  // Handle live submission
  const handleLiveSubmission = (formId, submission) => {
    const submissions = [submission, ...(form.submissions || [])];
    const views = (form.analytics?.views || 0) + 1;
    const subsCount = submissions.length;
    const updated = {
      ...form,
      submissions,
      analytics: {
        views,
        submissions: subsCount
      }
    };
    setForm(updated);
    onSaveForm(updated);
    if (showToast) showToast(isRtl ? 'تم تسجيل الاستجابة بنجاح!' : 'Submission received!');
  };

  const selectedField = (form.fields || []).find((f) => f.id === selectedFieldId);

  // Available elements categorized matching Screenshot 3
  const elementCategories = [
    {
      name: isRtl ? 'المعلومات الشخصية' : 'Personal Info',
      items: [
        { type: 'full_name', label: 'Full Name', icon: User, placeholder: 'John Doe', width: '100%' },
        { type: 'first_name', label: 'First Name', icon: User, placeholder: 'First Name', width: '50%' },
        { type: 'last_name', label: 'Last Name', icon: User, placeholder: 'Last Name', width: '50%' },
        { type: 'date_of_birth', label: 'Date of birth', icon: Calendar, placeholder: 'MM / DD / YYYY', width: '100%' },
        { type: 'phone', label: 'Phone', icon: Phone, placeholder: '+1 (555) 000-0000', required: true, width: '100%' },
        { type: 'email', label: 'Email', icon: Mail, placeholder: 'your@email.com', required: true, width: '100%' }
      ]
    },
    {
      name: isRtl ? 'زر الإرسال' : 'Submit',
      items: [
        { type: 'submit', label: 'Submit', icon: CheckSquare, buttonColor: '#2563eb', textColor: '#ffffff', width: '100%' }
      ]
    },
    {
      name: isRtl ? 'المدفوعات والمنتجات' : 'Payments',
      items: [
        { type: 'sell_products', label: 'Sell Products', icon: Tag, width: '100%' },
        { type: 'collect_payment', label: 'Collect Payment', icon: CreditCard, width: '100%' }
      ]
    },
    {
      name: isRtl ? 'العنوان والموقع' : 'Address',
      items: [
        { type: 'address', label: 'Address', icon: MapPin, placeholder: 'Street Address', badge: 'Updated', width: '100%' },
        { type: 'city', label: 'City', icon: Building, placeholder: 'City', width: '50%' },
        { type: 'state', label: 'State', icon: MapPin, placeholder: 'State / Province', width: '50%' },
        { type: 'postal_code', label: 'Postal Code', icon: MapPin, placeholder: 'ZIP / Postal Code', width: '50%' },
        { type: 'country', label: 'Country', icon: Globe, placeholder: 'Country', width: '50%' }
      ]
    },
    {
      name: isRtl ? 'حقول قياسية ومخصصة' : 'Standard Fields',
      items: [
        { type: 'text', label: 'Single Line Text', icon: FileText, placeholder: 'Type here...', width: '100%' },
        { type: 'textarea', label: 'Multi-line Text (Text Area)', icon: AlignLeft, placeholder: 'Enter your message...', width: '100%' },
        { type: 'number', label: 'Number', icon: Sliders, placeholder: '0', width: '100%' },
        { type: 'dropdown', label: 'Dropdown', icon: ChevronDown, placeholder: 'Select an option', options: ['Option 1', 'Option 2', 'Option 3'], width: '100%' },
        { type: 'radio', label: 'Radio Select', icon: CheckSquare, options: ['Choice A', 'Choice B'], width: '100%' },
        { type: 'checkbox', label: 'Checkbox Select', icon: CheckSquare, options: ['Option 1', 'Option 2'], width: '100%' },
        { type: 'file_upload', label: 'File Upload', icon: UploadCloud, width: '100%' },
        { type: 'signature', label: 'Digital Signature', icon: FileCode, width: '100%' },
        { type: 'consent_checkbox', label: 'By checking this box, I consent to receive text messages...', icon: Shield, width: '100%' }
      ]
    }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#f1f5f9',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        direction: isRtl ? 'rtl' : 'ltr',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      {/* TOP NAVIGATION BAR matching Screenshots 3, 4, 5 */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          flexShrink: 0
        }}
      >
        {/* Left: Back & Device Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBack}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={15} />
            <span>{isRtl ? 'رجوع' : 'Back'}</span>
          </button>

          <button
            onClick={() => setIsLeftDrawerOpen(!isLeftDrawerOpen)}
            title={isRtl ? 'تبديل قائمة العناصر' : 'Toggle Element Drawer'}
            style={{
              background: isLeftDrawerOpen ? '#eff6ff' : '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '6px 8px',
              color: isLeftDrawerOpen ? '#2563eb' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Plus size={16} />
          </button>

          {/* Desktop / Mobile Switcher matching Screenshot 3 */}
          <div
            style={{
              display: 'flex',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '2px'
            }}
          >
            <button
              onClick={() => setDeviceMode('desktop')}
              style={{
                background: deviceMode === 'desktop' ? '#ffffff' : 'none',
                border: 'none',
                boxShadow: deviceMode === 'desktop' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                borderRadius: '4px',
                padding: '5px 8px',
                color: deviceMode === 'desktop' ? '#2563eb' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Monitor size={15} />
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              style={{
                background: deviceMode === 'mobile' ? '#ffffff' : 'none',
                border: 'none',
                boxShadow: deviceMode === 'mobile' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                borderRadius: '4px',
                padding: '5px 8px',
                color: deviceMode === 'mobile' ? '#2563eb' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Smartphone size={15} />
            </button>
          </div>
        </div>

        {/* Center: Form Name with Pen & Sub-Tabs matching Screenshots 3, 4, 5 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#0f172a',
                border: 'none',
                background: 'transparent',
                textAlign: 'center',
                outline: 'none',
                cursor: 'text',
                width: '180px'
              }}
            />
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>✏️</span>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            {[
              { key: 'edit', label: isRtl ? 'تحرير' : 'Edit' },
              { key: 'settings', label: isRtl ? 'الإعدادات' : 'Settings' },
              { key: 'submissions', label: isRtl ? 'الاستجابات' : 'Submissions' },
              { key: 'notifications', label: isRtl ? 'الإشعارات' : 'Notifications' },
              { key: 'analytics', label: isRtl ? 'التحليلات' : 'Analytics' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveBuilderTab(tab.key)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: activeBuilderTab === tab.key ? '2px solid #2563eb' : '2px solid transparent',
                  color: activeBuilderTab === tab.key ? '#2563eb' : '#64748b',
                  fontSize: '12.5px',
                  fontWeight: activeBuilderTab === tab.key ? '700' : '500',
                  padding: '2px 4px',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: History, Preview, Integrate, Save */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleUndo}
            disabled={historyIdx === 0}
            title="Undo"
            style={{
              background: 'none',
              border: 'none',
              color: historyIdx > 0 ? '#64748b' : '#cbd5e1',
              cursor: historyIdx > 0 ? 'pointer' : 'not-allowed',
              padding: '6px'
            }}
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIdx >= history.length - 1}
            title="Redo"
            style={{
              background: 'none',
              border: 'none',
              color: historyIdx < history.length - 1 ? '#64748b' : '#cbd5e1',
              cursor: historyIdx < history.length - 1 ? 'pointer' : 'not-allowed',
              padding: '6px'
            }}
          >
            <Redo2 size={16} />
          </button>

          <button
            onClick={() => setIsPreviewOpen(true)}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '7px 12px',
              fontSize: '12.5px',
              fontWeight: '600',
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Eye size={14} />
            <span>{isRtl ? 'معاينة' : 'Preview'}</span>
          </button>

          <button
            onClick={() => setIsIntegrateOpen(true)}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '7px 12px',
              fontSize: '12.5px',
              fontWeight: '600',
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Share2 size={14} />
            <span>{isRtl ? 'تضمين ومشاركة' : 'Integrate'}</span>
          </button>

          <button
            onClick={handleSave}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '7px 16px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(37,99,235,0.25)'
            }}
          >
            <Save size={14} />
            <span>{isRtl ? 'حفظ' : 'Save'}</span>
          </button>
        </div>
      </header>

      {/* MAIN BODY SWITCHER */}
      {activeBuilderTab === 'edit' && (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
          
          {/* LEFT DRAWER matching Screenshot 3 */}
          {isLeftDrawerOpen && (
            <aside
              style={{
                width: '280px',
                background: '#ffffff',
                borderRight: isRtl ? 'none' : '1px solid #e2e8f0',
                borderLeft: isRtl ? '1px solid #e2e8f0' : 'none',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                zIndex: 20
              }}
            >
              {/* Drawer Header */}
              <div
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                  {isRtl ? 'عناصر النموذج' : 'Form Element'}
                </span>
                <button
                  onClick={() => setIsLeftDrawerOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Sub-tabs: Quick Add | Add Object Fields */}
              <div style={{ display: 'flex', padding: '8px 12px', gap: '6px', borderBottom: '1px solid #f1f5f9' }}>
                <button
                  onClick={() => setDrawerTab('quick_add')}
                  style={{
                    flex: 1,
                    background: drawerTab === 'quick_add' ? '#ffffff' : '#f8fafc',
                    border: '1px solid',
                    borderColor: drawerTab === 'quick_add' ? '#cbd5e1' : '#e2e8f0',
                    borderRadius: '6px',
                    padding: '6px 0',
                    fontSize: '12px',
                    fontWeight: drawerTab === 'quick_add' ? '700' : '500',
                    color: drawerTab === 'quick_add' ? '#0f172a' : '#64748b',
                    cursor: 'pointer',
                    boxShadow: drawerTab === 'quick_add' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                  }}
                >
                  {isRtl ? 'إضافة سريعة' : 'Quick Add'}
                </button>
                <button
                  onClick={() => setDrawerTab('object_fields')}
                  style={{
                    flex: 1,
                    background: drawerTab === 'object_fields' ? '#ffffff' : '#f8fafc',
                    border: '1px solid',
                    borderColor: drawerTab === 'object_fields' ? '#cbd5e1' : '#e2e8f0',
                    borderRadius: '6px',
                    padding: '6px 0',
                    fontSize: '12px',
                    fontWeight: drawerTab === 'object_fields' ? '700' : '500',
                    color: drawerTab === 'object_fields' ? '#0f172a' : '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  {isRtl ? 'حقول مخصصة' : 'Add Object Fields'}
                </button>
              </div>

              {/* Drawer Elements List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                {elementCategories.map((cat, catIdx) => (
                  <div key={catIdx} style={{ marginBottom: '18px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                      {cat.name}
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {cat.items.map((item, itemIdx) => {
                        const Icon = item.icon || FileText;
                        return (
                          <div
                            key={itemIdx}
                            onClick={() => handleAddField(item)}
                            style={{
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              padding: '10px 8px',
                              background: '#ffffff',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textAlign: 'center',
                              gap: '6px',
                              transition: 'all 0.15s ease',
                              position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#2563eb';
                              e.currentTarget.style.background = '#f8faff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#e2e8f0';
                              e.currentTarget.style.background = '#ffffff';
                            }}
                          >
                            {item.badge && (
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '-6px',
                                  right: '6px',
                                  background: '#eff6ff',
                                  color: '#2563eb',
                                  fontSize: '9px',
                                  fontWeight: '800',
                                  padding: '1px 4px',
                                  borderRadius: '4px',
                                  border: '1px solid #bfdbfe'
                                }}
                              >
                                {item.badge}
                              </span>
                            )}
                            <div style={{ color: '#64748b' }}>
                              <Icon size={18} strokeWidth={1.75} />
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: '600', color: '#334155', lineHeight: 1.2 }}>
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          )}

          {/* CENTER CANVAS matching Screenshot 3 */}
          <main
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '32px 16px',
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: deviceMode === 'mobile' ? '380px' : '620px',
                background: form.settings?.styling?.bg || '#ffffff',
                borderRadius: form.settings?.styling?.borderRadius || '14px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e2e8f0',
                padding: deviceMode === 'mobile' ? '24px 18px' : '36px 32px',
                alignSelf: 'flex-start',
                transition: 'max-width 0.3s ease'
              }}
            >
              {/* Form Canvas Elements list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {form.fields?.length === 0 ? (
                  <div
                    style={{
                      border: '2px dashed #cbd5e1',
                      borderRadius: '10px',
                      padding: '40px 20px',
                      textAlign: 'center',
                      color: '#94a3b8'
                    }}
                  >
                    <Plus size={32} style={{ margin: '0 auto 8px auto' }} />
                    <p style={{ margin: 0, fontSize: '13px' }}>
                      {isRtl ? 'انقر على أي عنصر من القائمة الجانبية لإضافته' : 'Click elements in the left drawer to add them to your form'}
                    </p>
                  </div>
                ) : (
                  form.fields.map((field, idx) => {
                    const isSelected = selectedFieldId === field.id;
                    return (
                      <div
                        key={field.id}
                        onClick={() => setSelectedFieldId(field.id)}
                        style={{
                          border: isSelected ? '2px solid #2563eb' : '1px solid transparent',
                          borderRadius: '8px',
                          padding: '8px',
                          background: isSelected ? 'rgba(37, 99, 235, 0.03)' : 'transparent',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {/* Hover / Selected Action toolbar */}
                        {isSelected && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '-12px',
                              [isRtl ? 'left' : 'right']: '8px',
                              background: '#0f172a',
                              color: '#fff',
                              borderRadius: '6px',
                              padding: '2px 6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              zIndex: 10,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                            }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveField(idx, 'up');
                              }}
                              title="Move Up"
                              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '2px' }}
                            >
                              <MoveUp size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveField(idx, 'down');
                              }}
                              title="Move Down"
                              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '2px' }}
                            >
                              <MoveDown size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateField(field.id);
                              }}
                              title="Duplicate"
                              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '2px' }}
                            >
                              <Copy size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteField(field.id);
                              }}
                              title="Delete"
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}

                        {/* Field Render on Canvas */}
                        {field.type === 'submit' ? (
                          <button
                            type="button"
                            style={{
                              width: '100%',
                              background: field.buttonColor || '#2563eb',
                              color: field.textColor || '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '12px 20px',
                              fontSize: '14px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                            }}
                          >
                            {field.label || 'Submit'}
                          </button>
                        ) : field.type === 'consent_checkbox' ? (
                          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#475569', lineHeight: 1.45, cursor: 'pointer' }}>
                            <input type="checkbox" readOnly checked={false} style={{ marginTop: '2px' }} />
                            <span>{field.label}</span>
                          </label>
                        ) : field.type === 'textarea' ? (
                          <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                              {field.label} {field.required && <span style={{ color: '#dc2626' }}>*</span>}
                            </label>
                            <textarea
                              rows={2}
                              readOnly
                              placeholder={field.placeholder || 'Enter your text...'}
                              style={{
                                width: '100%',
                                padding: '9px 12px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontSize: '13px',
                                background: '#ffffff',
                                outline: 'none'
                              }}
                            />
                          </div>
                        ) : (
                          <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                              {field.label} {field.required && <span style={{ color: '#dc2626' }}>*</span>}
                            </label>
                            <div style={{ position: 'relative' }}>
                              {field.type === 'email' && (
                                <Mail size={14} style={{ position: 'absolute', [isRtl ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                              )}
                              <input
                                type="text"
                                readOnly
                                placeholder={field.placeholder || ''}
                                style={{
                                  width: '100%',
                                  padding: '9px 12px',
                                  [isRtl && field.type === 'email' ? 'paddingRight' : !isRtl && field.type === 'email' ? 'paddingLeft' : 'padding']: '9px 12px',
                                  ...(field.type === 'email' ? { [isRtl ? 'paddingRight' : 'paddingLeft']: '34px' } : {}),
                                  borderRadius: '8px',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '13px',
                                  background: '#ffffff',
                                  outline: 'none'
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Privacy / Terms footer link matching Screenshot 3 */}
              {form.settings?.showTermsLinks !== false && (
                <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '11px', color: '#2563eb' }}>
                  <a href="#privacy" onClick={(e) => e.preventDefault()} style={{ color: '#2563eb', textDecoration: 'none', margin: '0 6px' }}>Privacy Policy</a>
                  <span>|</span>
                  <a href="#terms" onClick={(e) => e.preventDefault()} style={{ color: '#2563eb', textDecoration: 'none', margin: '0 6px' }}>Terms of Service</a>
                </div>
              )}
            </div>
          </main>

          {/* RIGHT PROPERTY INSPECTOR (when an element is selected) */}
          {selectedField && (
            <aside
              style={{
                width: '280px',
                background: '#ffffff',
                borderLeft: isRtl ? 'none' : '1px solid #e2e8f0',
                borderRight: isRtl ? '1px solid #e2e8f0' : 'none',
                padding: '16px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                zIndex: 20
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {isRtl ? 'خصائص الحقل' : 'Field Properties'}
                </span>
                <button
                  onClick={() => setSelectedFieldId(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={15} />
                </button>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                  {isRtl ? 'نص التسمية (Label)' : 'Field Label'}
                </label>
                <input
                  type="text"
                  value={selectedField.label}
                  onChange={(e) => handleUpdateField(selectedField.id, { label: e.target.value })}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              {selectedField.type !== 'submit' && selectedField.type !== 'consent_checkbox' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    {isRtl ? 'النص التوضيحي (Placeholder)' : 'Placeholder'}
                  </label>
                  <input
                    type="text"
                    value={selectedField.placeholder || ''}
                    onChange={(e) => handleUpdateField(selectedField.id, { placeholder: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              )}

              {selectedField.type !== 'submit' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!selectedField.required}
                    onChange={(e) => handleUpdateField(selectedField.id, { required: e.target.checked })}
                  />
                  <span>{isRtl ? 'حقل إلزامي (Required *)' : 'Required field *'}</span>
                </label>
              )}

              {selectedField.type === 'submit' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#334155', marginBottom: '4px' }}>
                    {isRtl ? 'لون الزر' : 'Button Color'}
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={selectedField.buttonColor || '#2563eb'}
                      onChange={(e) => handleUpdateField(selectedField.id, { buttonColor: e.target.value })}
                      style={{ width: '36px', height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={selectedField.buttonColor || '#2563eb'}
                      onChange={(e) => handleUpdateField(selectedField.id, { buttonColor: e.target.value })}
                      style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                </div>
              )}

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <button
                  onClick={() => handleDeleteField(selectedField.id)}
                  style={{
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    padding: '8px',
                    width: '100%',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Trash2 size={13} />
                  <span>{isRtl ? 'حذف هذا الحقل' : 'Delete Field'}</span>
                </button>
              </div>
            </aside>
          )}

        </div>
      )}

      {/* SETTINGS TAB matching Screenshot 4 */}
      {activeBuilderTab === 'settings' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 20px', display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: '100%',
              maxWidth: '720px',
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '28px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
            }}
          >
            {/* Section 1: On Submit matching Screenshot 4 */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                  {isRtl ? 'عند الإرسال (On Submit)' : 'On Submit'}
                </h3>
                <Monitor size={15} style={{ color: '#94a3b8' }} />
              </div>

              {/* On Submit Type Dropdown */}
              <div style={{ marginBottom: '16px' }}>
                <select
                  value={form.settings?.onSubmitType || 'message'}
                  onChange={(e) => {
                    const next = {
                      ...form,
                      settings: {
                        ...(form.settings || {}),
                        onSubmitType: e.target.value
                      }
                    };
                    pushHistory(next);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px',
                    background: '#ffffff',
                    color: '#0f172a',
                    outline: 'none'
                  }}
                >
                  <option value="message">{isRtl ? 'عرض رسالة شكر (Message)' : 'Message'}</option>
                  <option value="redirect">{isRtl ? 'تحويل إلى رابط مخصص (Redirect to URL)' : 'Redirect to URL'}</option>
                </select>
              </div>

              {form.settings?.onSubmitType === 'redirect' ? (
                /* Redirect URL Input */
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                    {isRtl ? 'رابط التحويل المخصص' : 'Target URL'}
                  </label>
                  <input
                    type="url"
                    value={form.settings?.redirectUrl || ''}
                    onChange={(e) => {
                      const next = {
                        ...form,
                        settings: {
                          ...(form.settings || {}),
                          redirectUrl: e.target.value
                        }
                      };
                      pushHistory(next);
                    }}
                    placeholder="https://yourwebsite.com/thank-you"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13.5px',
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  />
                </div>
              ) : (
                /* Rich Text WYSIWYG Editor matching Screenshot 4 */
                <div>
                  {/* Top WYSIWYG formatting bar */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderBottom: 'none',
                      borderRadius: '8px 8px 0 0',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      color: '#475569'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        const html = (form.settings?.messageHtml || '') + ' 😀';
                        setForm({
                          ...form,
                          settings: { ...(form.settings || {}), messageHtml: html }
                        });
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px' }}
                    >
                      😀
                    </button>
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>28px ▾</span>
                    <Link2 size={15} />
                    <Sparkles size={15} />
                  </div>

                  {/* WYSIWYG Textarea */}
                  <textarea
                    rows={5}
                    value={form.settings?.messageHtml || '<div style="text-align:center; padding: 20px 0;"><div style="font-size: 40px; margin-bottom: 12px;">😀</div><h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">We appreciate your feedback!</h3><p style="font-size: 14px; color: #64748b; margin: 0;">Thank you for taking the time to complete this form.</p></div>'}
                    onChange={(e) => {
                      const next = {
                        ...form,
                        settings: {
                          ...(form.settings || {}),
                          messageHtml: e.target.value
                        }
                      };
                      setForm(next);
                    }}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '1px solid #cbd5e1',
                      borderTop: 'none',
                      borderBottom: 'none',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      color: '#0f172a',
                      outline: 'none'
                    }}
                  />

                  {/* Bottom WYSIWYG formatting bar matching Screenshot 4 */}
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '0 0 8px 8px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      color: '#475569',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >
                    <span>Inter ▾</span>
                    <span>Paragraph ▾</span>
                    <span>16px ▾</span>
                    <Bold size={14} />
                    <Italic size={14} />
                    <Underline size={14} />
                  </div>

                  {/* Real-time Preview Box matching Screenshot 4 */}
                  <div style={{ marginTop: '20px' }}>
                    <span style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#64748b', marginBottom: '8px' }}>
                      {isRtl ? 'المعاينة المباشرة (Preview)' : 'Preview'}
                    </span>
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '24px',
                        textAlign: 'center'
                      }}
                      dangerouslySetInnerHTML={{
                        __html:
                          form.settings?.messageHtml ||
                          '<div style="text-align:center; padding: 20px 0;"><div style="font-size: 40px; margin-bottom: 12px;">😀</div><h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">We appreciate your feedback!</h3><p style="font-size: 14px; color: #64748b; margin: 0;">Thank you for taking the time to complete this form.</p></div>'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Message Styling Collapsible Section matching Screenshot 4 */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                {isRtl ? 'تنسيق المظهر (Message Styling)' : 'Message Styling'}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>
                    Background
                  </label>
                  <input
                    type="color"
                    value={form.settings?.styling?.bg || '#ffffff'}
                    onChange={(e) => {
                      const next = {
                        ...form,
                        settings: {
                          ...(form.settings || {}),
                          styling: { ...(form.settings?.styling || {}), bg: e.target.value }
                        }
                      };
                      pushHistory(next);
                    }}
                    style={{ width: '100%', height: '36px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>
                    Corner Radius
                  </label>
                  <select
                    value={form.settings?.styling?.borderRadius || '12px'}
                    onChange={(e) => {
                      const next = {
                        ...form,
                        settings: {
                          ...(form.settings || {}),
                          styling: { ...(form.settings?.styling || {}), borderRadius: e.target.value }
                        }
                      };
                      pushHistory(next);
                    }}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="4px">Small (4px)</option>
                    <option value="8px">Medium (8px)</option>
                    <option value="12px">Large (12px)</option>
                    <option value="20px">Extra Large (20px)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>
                    Font
                  </label>
                  <select
                    value={form.settings?.styling?.font || 'Inter'}
                    onChange={(e) => {
                      const next = {
                        ...form,
                        settings: {
                          ...(form.settings || {}),
                          styling: { ...(form.settings?.styling || {}), font: e.target.value }
                        }
                      };
                      pushHistory(next);
                    }}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Outfit">Outfit</option>
                    <option value="Cairo">Cairo (Arabic)</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUBMISSIONS TAB matching Screenshot 5 */}
      {activeBuilderTab === 'submissions' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            
            {/* Submissions Filter Toolbar matching Screenshot 5 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                marginBottom: '16px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '13px',
                  color: '#334155'
                }}
              >
                <Calendar size={15} style={{ color: '#94a3b8' }} />
                <span>{dateRange}</span>
              </div>

              <button
                onClick={() => {
                  if (showToast) showToast(isRtl ? 'تم تحديث الاستجابات' : 'Refreshed submissions');
                }}
                title="Refresh"
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <RefreshCw size={15} />
              </button>
            </div>

            {/* Submissions Container matching Screenshot 5 */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                overflow: 'hidden'
              }}
            >
              {/* Header inside Submissions */}
              <div
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                  {isRtl ? 'جميع الاستجابات' : 'All submissions'}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                    ⊞ 4/13 {isRtl ? 'أعمدة' : 'columns'}
                  </span>

                  <div style={{ position: 'relative', width: '200px' }}>
                    <Search size={14} style={{ position: 'absolute', [isRtl ? 'right' : 'left']: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder={isRtl ? 'بحث...' : 'Search'}
                      value={submissionSearch}
                      onChange={(e) => setSubmissionSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        [isRtl ? 'paddingRight' : 'paddingLeft']: '28px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12.5px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Submissions Table / Empty State matching Screenshot 5 */}
              {(form.submissions || []).length === 0 ? (
                <div style={{ padding: '80px 20px', textAlign: 'center', color: '#64748b' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: '#f8fafc',
                      border: '1px dashed #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px auto',
                      color: '#94a3b8'
                    }}
                  >
                    <FileText size={28} />
                  </div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                    {isRtl ? 'لا توجد استجابات بعد' : 'No submissions yet'}
                  </h4>
                  <p style={{ margin: '0 auto 20px auto', fontSize: '13px', color: '#64748b', maxWidth: '380px' }}>
                    {isRtl
                      ? 'ستظهر الاستجابات هنا بمجرد أن يقوم شخص ما بتعبئة النموذج الخاص بك.'
                      : 'Submissions will appear here once someone fills out your form.'}
                  </p>
                  <button
                    onClick={() => setIsPreviewOpen(true)}
                    style={{
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 18px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {isRtl ? 'تجربة النموذج الآن' : 'Test Submit Now'}
                  </button>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left' }}>
                  <thead>
                    <tr style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', fontSize: '12.5px', color: '#64748b' }}>
                      <th style={{ padding: '12px 16px', width: '40px' }}>
                        <input type="checkbox" />
                      </th>
                      <th style={{ padding: '12px 16px' }}>{isRtl ? 'تاريخ الإرسال' : 'Submitted at'}</th>
                      <th style={{ padding: '12px 16px' }}>{isRtl ? 'جهة الاتصال' : 'Contact'}</th>
                      <th style={{ padding: '12px 16px' }}>{isRtl ? 'الاسم' : 'Name'}</th>
                      <th style={{ padding: '12px 16px' }}>{isRtl ? 'البريد الإلكتروني' : 'Email'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(form.submissions || []).map((sub, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <input type="checkbox" />
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>
                          {sub.submittedAt || 'Today'}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#2563eb', fontWeight: '600', fontSize: '13px' }}>
                          {sub.name || 'Lead'}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: '600', fontSize: '13px' }}>
                          {sub.name || '-'}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#475569', fontSize: '13px' }}>
                          {sub.email || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeBuilderTab === 'notifications' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 20px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '640px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '28px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
              {isRtl ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', fontWeight: '600', color: '#0f172a', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.notifications?.notifyOwner !== false}
                  onChange={(e) => {
                    const next = {
                      ...form,
                      notifications: { ...(form.notifications || {}), notifyOwner: e.target.checked }
                    };
                    pushHistory(next);
                  }}
                />
                <span>{isRtl ? 'إرسال تنبيه عبر البريد عند كل استجابة جديدة' : 'Send email alert on every new submission'}</span>
              </label>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  {isRtl ? 'إرسال الإشعارات إلى البريد:' : 'Recipient Email Address:'}
                </label>
                <input
                  type="email"
                  value={form.notifications?.notificationEmail || ''}
                  onChange={(e) => {
                    const next = {
                      ...form,
                      notifications: { ...(form.notifications || {}), notificationEmail: e.target.value }
                    };
                    pushHistory(next);
                  }}
                  placeholder="admin@yourbusiness.com"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeBuilderTab === 'analytics' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 20px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '720px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Views</span>
                <h2 style={{ margin: '6px 0 0 0', fontSize: '26px', fontWeight: '800', color: '#0f172a' }}>{form.analytics?.views || 0}</h2>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Submissions</span>
                <h2 style={{ margin: '6px 0 0 0', fontSize: '26px', fontWeight: '800', color: '#2563eb' }}>{form.submissions?.length || 0}</h2>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Conversion</span>
                <h2 style={{ margin: '6px 0 0 0', fontSize: '26px', fontWeight: '800', color: '#16a34a' }}>
                  {(form.analytics?.views || 0) > 0 ? (((form.submissions?.length || 0) / form.analytics.views) * 100).toFixed(1) : '0.0'}%
                </h2>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INTEGRATE MODAL */}
      <FormIntegrateModal
        isOpen={isIntegrateOpen}
        onClose={() => setIsIntegrateOpen(false)}
        form={form}
        isRtl={isRtl}
        showToast={showToast}
      />

      {/* LIVE PREVIEW MODAL */}
      <LiveFormModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        form={form}
        isRtl={isRtl}
        onSubmitResponse={handleLiveSubmission}
        showToast={showToast}
      />

    </div>
  );
}
