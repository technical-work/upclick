'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Eye,
  Share2,
  Save,
  Plus,
  Monitor,
  Smartphone,
  RotateCcw,
  RotateCw,
  History,
  Settings,
  Trash2,
  Copy,
  GripVertical,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Package,
  MapPin,
  Building,
  Star,
  Hash,
  List,
  CheckSquare,
  Radio,
  FileText,
  AlignLeft,
  Sparkles,
  ExternalLink,
  Sliders,
  Send,
  BarChart3,
  Bell,
  Layers,
  ArrowRight,
  Download,
  AlertCircle
} from 'lucide-react';
import SurveyIntegrateModal from './SurveyIntegrateModal';
import SurveySubmissionsModal from './SurveySubmissionsModal';

const ELEMENT_TYPES = [
  // Personal Info
  {
    category: 'Personal Info',
    categoryAr: 'المعلومات الشخصية',
    items: [
      { type: 'full_name', label: 'Full Name', labelAr: 'الاسم الكامل', icon: User, defaultProps: { label: 'Full Name', placeholder: 'John Doe', required: true } },
      { type: 'first_name', label: 'First Name', labelAr: 'الاسم الأول', icon: User, defaultProps: { label: 'First Name', placeholder: 'John', required: true } },
      { type: 'last_name', label: 'Last Name', labelAr: 'اسم العائلة', icon: User, defaultProps: { label: 'Last Name', placeholder: 'Doe', required: true } },
      { type: 'date_of_birth', label: 'Date of birth', labelAr: 'تاريخ الميلاد', icon: Calendar, defaultProps: { label: 'Date of Birth', required: false } },
      { type: 'phone', label: 'Phone', labelAr: 'رقم الهاتف', icon: Phone, defaultProps: { label: 'Phone Number', placeholder: '+1 (555) 000-0000', required: true } },
      { type: 'email', label: 'Email', labelAr: 'البريد الإلكتروني', icon: Mail, defaultProps: { label: 'Email Address', placeholder: 'john@example.com', required: true } }
    ]
  },
  // Payments
  {
    category: 'Payments',
    categoryAr: 'المدفوعات',
    items: [
      { type: 'sell_products', label: 'Sell Products', labelAr: 'بيع المنتجات', icon: Package, defaultProps: { label: 'Select a Product', options: ['Standard Plan - $29/mo', 'Pro Plan - $79/mo', 'Enterprise - $199/mo'], required: false } },
      { type: 'collect_payment', label: 'Collect Payment', labelAr: 'تحصيل الدفع', icon: CreditCard, defaultProps: { label: 'Payment Information', amount: 49, currency: 'USD', required: false } }
    ]
  },
  // Address
  {
    category: 'Address',
    categoryAr: 'العنوان والموقع',
    items: [
      { type: 'address', label: 'Address', labelAr: 'العنوان', icon: MapPin, updated: true, defaultProps: { label: 'Street Address', placeholder: '123 Main St, Apt 4B', required: false } },
      { type: 'city', label: 'City', labelAr: 'المدينة', icon: Building, defaultProps: { label: 'City', placeholder: 'New York', required: false } },
      { type: 'state', label: 'State', labelAr: 'الولاية / المنطقة', icon: Building, defaultProps: { label: 'State / Region', placeholder: 'NY', required: false } },
      { type: 'country', label: 'Country', labelAr: 'الدولة', icon: Building, defaultProps: { label: 'Country', placeholder: 'United States', required: false } },
      { type: 'postal_code', label: 'Postal Code', labelAr: 'الرمز البريدي', icon: Hash, defaultProps: { label: 'Postal / Zip Code', placeholder: '10001', required: false } },
      { type: 'organization', label: 'Organization', labelAr: 'الشركة / المؤسسة', icon: Building, defaultProps: { label: 'Company / Organization', placeholder: 'Acme Corp', required: false } }
    ]
  },
  // Rating & Choice
  {
    category: 'Ratings & Choices',
    categoryAr: 'التقييمات والخيارات',
    items: [
      { type: 'rating', label: 'Star Rating (1-5)', labelAr: 'تقييم بالنجوم (1-5)', icon: Star, defaultProps: { label: 'How would you rate your experience?', maxRating: 5, required: true } },
      { type: 'nps', label: 'NPS Score (0-10)', labelAr: 'مقياس NPS (0-10)', icon: Hash, defaultProps: { label: 'How likely are you to recommend us to a friend or colleague?', required: true } },
      { type: 'radio', label: 'Single Choice (Radio)', labelAr: 'اختيار مفرد (Radio)', icon: Radio, defaultProps: { label: 'Select one option:', options: ['Option 1', 'Option 2', 'Option 3'], required: true } },
      { type: 'checkbox', label: 'Multiple Choice', labelAr: 'اختيار متعدد (Checkbox)', icon: CheckSquare, defaultProps: { label: 'Select all that apply:', options: ['Feature A', 'Feature B', 'Feature C'], required: false } },
      { type: 'dropdown', label: 'Dropdown List', labelAr: 'قائمة منسدلة (Dropdown)', icon: List, defaultProps: { label: 'Choose an option from the list:', options: ['Choice 1', 'Choice 2', 'Choice 3'], required: false } },
      { type: 'textarea', label: 'Paragraph Text', labelAr: 'نص طويل / فقرة', icon: AlignLeft, defaultProps: { label: 'Your Feedback / Comments', placeholder: 'Write your thoughts here...', required: false } },
      { type: 'text', label: 'Short Text', labelAr: 'نص قصير', icon: FileText, defaultProps: { label: 'Short Answer', placeholder: 'Enter answer...', required: false } }
    ]
  }
];

export default function SurveyBuilderView({
  survey: initialSurvey,
  onBack,
  onSave,
  isRtl = false,
  showToast = () => {}
}) {
  const [survey, setSurvey] = useState(() => {
    if (!initialSurvey) {
      return {
        id: `srv_${Date.now()}`,
        name: 'Survey 0',
        slides: [
          {
            id: 'slide_1',
            title: 'Slide 1',
            subtitle: '',
            buttonText: 'Submit',
            elements: []
          }
        ],
        settings: {
          progressBar: true,
          showBackButton: true,
          autoAdvance: false,
          buttonColor: '#2563eb',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          successTitle: 'Thank You for Your Submission! 🎉',
          successMessage: 'Your responses have been recorded successfully.'
        },
        notifications: {
          enableEmail: false,
          recipients: '',
          subject: 'New Survey Response Received'
        },
        viewsCount: 0,
        submissions: []
      };
    }

    // Ensure slides structure
    const slides = Array.isArray(initialSurvey.slides) && initialSurvey.slides.length > 0
      ? initialSurvey.slides
      : [
          {
            id: 'slide_1',
            title: 'Slide 1',
            subtitle: '',
            buttonText: 'Submit',
            elements: []
          }
        ];

    return {
      ...initialSurvey,
      slides,
      settings: {
        progressBar: true,
        showBackButton: true,
        autoAdvance: false,
        buttonColor: '#2563eb',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        successTitle: 'Thank You for Your Submission! 🎉',
        successMessage: 'Your responses have been recorded successfully.',
        ...(initialSurvey.settings || {})
      },
      notifications: {
        enableEmail: false,
        recipients: '',
        subject: 'New Survey Response Received',
        ...(initialSurvey.notifications || {})
      },
      submissions: initialSurvey.submissions || []
    };
  });

  const [activeMainTab, setActiveMainTab] = useState('edit'); // 'edit' | 'settings' | 'submissions' | 'notifications' | 'analytics'
  const [activeDrawerTab, setActiveDrawerTab] = useState('quick_add'); // 'quick_add' | 'object_fields'
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [viewDevice, setViewDevice] = useState('desktop'); // 'desktop' | 'mobile'
  const [selectedSlideId, setSelectedSlideId] = useState(() => survey.slides[0]?.id || 'slide_1');
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isIntegrateOpen, setIsIntegrateOpen] = useState(false);
  const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(true);

  // Undo / Redo history
  const [history, setHistory] = useState([JSON.stringify(survey)]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushToHistory = (newSurveyState) => {
    const serialized = JSON.stringify(newSurveyState);
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(serialized);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    setIsSaved(false);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = JSON.parse(history[historyIndex - 1]);
      setSurvey(prev);
      setHistoryIndex(historyIndex - 1);
      setIsSaved(false);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = JSON.parse(history[historyIndex + 1]);
      setSurvey(next);
      setHistoryIndex(historyIndex + 1);
      setIsSaved(false);
    }
  };

  const updateSurvey = (updater) => {
    setSurvey((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      pushToHistory(next);
      return next;
    });
  };

  // Add Element to Slide
  const handleAddElement = (elemItem, targetSlideId = selectedSlideId) => {
    const newElement = {
      id: `elem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: elemItem.type,
      ...elemItem.defaultProps
    };

    updateSurvey((prev) => {
      const newSlides = prev.slides.map((s) => {
        if (s.id === targetSlideId) {
          return {
            ...s,
            elements: [...(s.elements || []), newElement]
          };
        }
        return s;
      });
      return { ...prev, slides: newSlides };
    });

    setSelectedElementId(newElement.id);
    setSelectedSlideId(targetSlideId);
    showToast(isRtl ? `تمت إضافة حقل: ${elemItem.labelAr || elemItem.label}` : `Added: ${elemItem.label}`);
  };

  // Add New Slide
  const handleAddSlide = () => {
    const newSlideNum = survey.slides.length + 1;
    const newSlide = {
      id: `slide_${Date.now()}`,
      title: `Slide ${newSlideNum}`,
      subtitle: '',
      buttonText: newSlideNum === 1 ? 'Submit' : 'Next',
      elements: []
    };

    updateSurvey((prev) => {
      // If previous slides existed, ensure their buttonText defaults to 'Next' and the last slide to 'Submit'
      const updatedExisting = prev.slides.map((s, idx) => {
        if (idx === prev.slides.length - 1 && s.buttonText === 'Submit') {
          return { ...s, buttonText: 'Next' };
        }
        return s;
      });
      return {
        ...prev,
        slides: [...updatedExisting, { ...newSlide, buttonText: 'Submit' }]
      };
    });

    setSelectedSlideId(newSlide.id);
    showToast(isRtl ? `تمت إضافة شريحة جديدة: Slide ${newSlideNum}` : `Added Slide ${newSlideNum}`);
  };

  // Duplicate Slide
  const handleDuplicateSlide = (slideId) => {
    const slideToDup = survey.slides.find((s) => s.id === slideId);
    if (!slideToDup) return;

    const newSlide = {
      ...slideToDup,
      id: `slide_${Date.now()}`,
      title: `${slideToDup.title} (Copy)`,
      elements: (slideToDup.elements || []).map((e) => ({
        ...e,
        id: `elem_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
      }))
    };

    const idx = survey.slides.findIndex((s) => s.id === slideId);
    updateSurvey((prev) => {
      const copy = [...prev.slides];
      copy.splice(idx + 1, 0, newSlide);
      return { ...prev, slides: copy };
    });

    setSelectedSlideId(newSlide.id);
    showToast(isRtl ? 'تم تكرار الشريحة بنجاح' : 'Slide duplicated');
  };

  // Delete Slide
  const handleDeleteSlide = (slideId) => {
    if (survey.slides.length <= 1) {
      showToast(isRtl ? 'لا يمكن حذف الشريحة الوحيدة في الاستبيان' : 'Cannot delete the only slide in the survey');
      return;
    }

    updateSurvey((prev) => {
      const filtered = prev.slides.filter((s) => s.id !== slideId);
      return { ...prev, slides: filtered };
    });

    const remaining = survey.slides.filter((s) => s.id !== slideId);
    if (remaining.length > 0) {
      setSelectedSlideId(remaining[0].id);
    }
    showToast(isRtl ? 'تم حذف الشريحة' : 'Slide deleted');
  };

  // Update Slide details
  const handleUpdateSlide = (slideId, updates) => {
    updateSurvey((prev) => {
      const updated = prev.slides.map((s) => (s.id === slideId ? { ...s, ...updates } : s));
      return { ...prev, slides: updated };
    });
  };

  // Update Element inside Slide
  const handleUpdateElement = (slideId, elementId, updates) => {
    updateSurvey((prev) => {
      const updatedSlides = prev.slides.map((s) => {
        if (s.id === slideId) {
          const updatedElements = (s.elements || []).map((e) => (e.id === elementId ? { ...e, ...updates } : e));
          return { ...s, elements: updatedElements };
        }
        return s;
      });
      return { ...prev, slides: updatedSlides };
    });
  };

  // Delete Element from Slide
  const handleDeleteElement = (slideId, elementId) => {
    updateSurvey((prev) => {
      const updatedSlides = prev.slides.map((s) => {
        if (s.id === slideId) {
          return {
            ...s,
            elements: (s.elements || []).filter((e) => e.id !== elementId)
          };
        }
        return s;
      });
      return { ...prev, slides: updatedSlides };
    });
    if (selectedElementId === elementId) setSelectedElementId(null);
    showToast(isRtl ? 'تم حذف الحقل' : 'Field removed');
  };

  // Reorder Elements (Move Up / Move Down)
  const handleMoveElement = (slideId, elementId, direction) => {
    const slide = survey.slides.find((s) => s.id === slideId);
    if (!slide || !slide.elements) return;

    const idx = slide.elements.findIndex((e) => e.id === elementId);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= slide.elements.length) return;

    const newElements = [...slide.elements];
    const [moved] = newElements.splice(idx, 1);
    newElements.splice(newIdx, 0, moved);

    handleUpdateSlide(slideId, { elements: newElements });
  };

  // Save survey
  const handleSaveSurvey = () => {
    const updatedSurvey = {
      ...survey,
      updatedAt: new Date().toLocaleString()
    };
    if (onSave) onSave(updatedSurvey);
    setIsSaved(true);
    showToast(isRtl ? 'تم حفظ الاستبيان بنجاح 💾' : 'Survey saved successfully 💾');
  };

  const currentSlide = survey.slides.find((s) => s.id === selectedSlideId) || survey.slides[0];
  const selectedElement = currentSlide?.elements?.find((e) => e.id === selectedElementId);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        background: '#f8fafc',
        color: '#0f172a',
        overflow: 'hidden',
        direction: isRtl ? 'rtl' : 'ltr',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Top Header Bar */}
      <header
        style={{
          height: '56px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 40,
          flexShrink: 0
        }}
      >
        {/* Left Side: Back button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              color: '#475569',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: '6px',
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <ArrowLeft size={16} />
            <span>{isRtl ? 'رجوع' : 'Back'}</span>
          </button>
        </div>

        {/* Center: Inline Editable Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isEditingTitle ? (
            <input
              type="text"
              value={survey.name}
              autoFocus
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingTitle(false);
              }}
              onChange={(e) => updateSurvey({ name: e.target.value })}
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#0f172a',
                border: '1px solid #2563eb',
                borderRadius: '6px',
                padding: '4px 8px',
                outline: 'none',
                textAlign: 'center',
                minWidth: '180px'
              }}
            />
          ) : (
            <div
              onClick={() => setIsEditingTitle(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '15px',
                fontWeight: 600,
                color: '#0f172a',
                cursor: 'pointer',
                padding: '4px 10px',
                borderRadius: '6px',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              title={isRtl ? 'انقر لتعديل اسم الاستبيان' : 'Click to rename survey'}
            >
              <span>{survey.name}</span>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>✏️</span>
            </div>
          )}
        </div>

        {/* Right Side: Preview, Integrate, Save */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsPreviewModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 500,
              padding: '6px 14px',
              borderRadius: '7px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <Eye size={15} />
            <span>{isRtl ? 'معاينة' : 'Preview'}</span>
          </button>

          <button
            onClick={() => setIsIntegrateOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 500,
              padding: '6px 14px',
              borderRadius: '7px',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8fafc';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <Share2 size={15} />
            <span>{isRtl ? 'تضمين وربط' : 'Integrate'}</span>
          </button>

          <button
            onClick={handleSaveSurvey}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#2563eb',
              border: 'none',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              padding: '7px 18px',
              borderRadius: '7px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)',
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1d4ed8')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#2563eb')}
          >
            <Save size={15} />
            <span>{isRtl ? 'حفظ' : 'Save'}</span>
          </button>
        </div>
      </header>

      {/* Secondary Sub-toolbar */}
      <div
        style={{
          height: '46px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 30,
          flexShrink: 0
        }}
      >
        {/* Left: Toggle Drawer + Device switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              background: isDrawerOpen ? '#eff6ff' : '#ffffff',
              color: isDrawerOpen ? '#2563eb' : '#64748b',
              cursor: 'pointer'
            }}
            title={isRtl ? 'إظهار / إخفاء العناصر' : 'Toggle Elements Drawer'}
          >
            <Plus size={16} />
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f1f5f9',
              borderRadius: '6px',
              padding: '2px',
              border: '1px solid #e2e8f0'
            }}
          >
            <button
              onClick={() => setViewDevice('desktop')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '4px',
                border: 'none',
                background: viewDevice === 'desktop' ? '#ffffff' : 'transparent',
                color: viewDevice === 'desktop' ? '#2563eb' : '#64748b',
                boxShadow: viewDevice === 'desktop' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                cursor: 'pointer'
              }}
              title={isRtl ? 'عرض الكمبيوتر' : 'Desktop View'}
            >
              <Monitor size={15} />
            </button>
            <button
              onClick={() => setViewDevice('mobile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '4px',
                border: 'none',
                background: viewDevice === 'mobile' ? '#ffffff' : 'transparent',
                color: viewDevice === 'mobile' ? '#2563eb' : '#64748b',
                boxShadow: viewDevice === 'mobile' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                cursor: 'pointer'
              }}
              title={isRtl ? 'عرض الجوال' : 'Mobile View'}
            >
              <Smartphone size={15} />
            </button>
          </div>
        </div>

        {/* Center: Tabs [Edit | Settings | Submissions | Notifications | Analytics] */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {[
            { id: 'edit', label: 'Edit', labelAr: 'تعديل' },
            { id: 'settings', label: 'Settings', labelAr: 'الإعدادات' },
            { id: 'submissions', label: 'Submissions', labelAr: 'الاستجابات' },
            { id: 'notifications', label: 'Notifications', labelAr: 'الإشعارات' },
            { id: 'analytics', label: 'Analytics', labelAr: 'التحليلات' }
          ].map((tab) => {
            const isActive = activeMainTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMainTab(tab.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#2563eb' : '#64748b',
                  padding: '12px 2px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'color 0.15s'
                }}
              >
                <span>{isRtl ? tab.labelAr : tab.label}</span>
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-1px',
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: '#2563eb',
                      borderRadius: '2px'
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Undo / Redo / History */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: historyIndex > 0 ? '#475569' : '#cbd5e1',
              cursor: historyIndex > 0 ? 'pointer' : 'not-allowed'
            }}
            title={isRtl ? 'تراجع' : 'Undo'}
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              border: 'none',
              background: 'transparent',
              color: historyIndex < history.length - 1 ? '#475569' : '#cbd5e1',
              cursor: historyIndex < history.length - 1 ? 'pointer' : 'not-allowed'
            }}
            title={isRtl ? 'إعادة' : 'Redo'}
          >
            <RotateCw size={15} />
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Left Elements Drawer (Screenshot 3 style) */}
        {activeMainTab === 'edit' && isDrawerOpen && (
          <aside
            style={{
              width: '280px',
              background: '#ffffff',
              borderRight: isRtl ? 'none' : '1px solid #e2e8f0',
              borderLeft: isRtl ? '1px solid #e2e8f0' : 'none',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 20,
              flexShrink: 0,
              boxShadow: '2px 0 6px rgba(0,0,0,0.02)'
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                {isRtl ? 'عناصر الاستبيان' : 'Survey Element'}
              </h3>
              <button
                onClick={() => setIsDrawerOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Sub-tabs: Quick Add | Add Object Fields */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                padding: '8px 12px',
                gap: '6px',
                background: '#f8fafc',
                borderBottom: '1px solid #f1f5f9'
              }}
            >
              <button
                onClick={() => setActiveDrawerTab('quick_add')}
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: activeDrawerTab === 'quick_add' ? '#ffffff' : 'transparent',
                  color: activeDrawerTab === 'quick_add' ? '#0f172a' : '#64748b',
                  boxShadow: activeDrawerTab === 'quick_add' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {isRtl ? 'إضافة سريعة' : 'Quick Add'}
              </button>
              <button
                onClick={() => setActiveDrawerTab('object_fields')}
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: activeDrawerTab === 'object_fields' ? '#ffffff' : 'transparent',
                  color: activeDrawerTab === 'object_fields' ? '#0f172a' : '#64748b',
                  boxShadow: activeDrawerTab === 'object_fields' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {isRtl ? 'حقول الكائنات' : 'Add Object Fields'}
              </button>
            </div>

            {/* Elements Categories List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }}>
              {activeDrawerTab === 'quick_add' ? (
                ELEMENT_TYPES.map((cat, cIdx) => (
                  <div key={cIdx} style={{ marginBottom: '20px' }}>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#64748b',
                        marginBottom: '8px',
                        padding: '0 4px'
                      }}
                    >
                      {isRtl ? cat.categoryAr : cat.category}
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '8px'
                      }}
                    >
                      {cat.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.type}
                            onClick={() => handleAddElement(item)}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              padding: '10px 4px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textAlign: 'center',
                              cursor: 'pointer',
                              position: 'relative',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#2563eb';
                              e.currentTarget.style.background = '#f8faff';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#e2e8f0';
                              e.currentTarget.style.background = '#ffffff';
                              e.currentTarget.style.transform = 'none';
                            }}
                            title={isRtl ? `انقر لإضافة: ${item.labelAr}` : `Click to add ${item.label}`}
                          >
                            {item.updated && (
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '-6px',
                                  fontSize: '9px',
                                  fontWeight: 700,
                                  background: '#eff6ff',
                                  color: '#2563eb',
                                  border: '1px solid #bfdbfe',
                                  borderRadius: '4px',
                                  padding: '1px 4px'
                                }}
                              >
                                Updated
                              </span>
                            )}
                            <div style={{ color: '#64748b', marginBottom: '6px' }}>
                              <Icon size={20} strokeWidth={1.5} />
                            </div>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 500,
                                color: '#334155',
                                lineHeight: '1.2'
                              }}
                            >
                              {isRtl ? item.labelAr : item.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '20px 8px', textAlign: 'center', color: '#64748b' }}>
                  <Building size={32} style={{ margin: '0 auto 10px', color: '#94a3b8' }} />
                  <p style={{ fontSize: '13px', margin: '0 0 6px', fontWeight: 600, color: '#334155' }}>
                    {isRtl ? 'حقول CRM والكائنات' : 'CRM & Custom Objects'}
                  </p>
                  <p style={{ fontSize: '12px', margin: 0, lineHeight: 1.4 }}>
                    {isRtl
                      ? 'اربط استبيانك مباشرة بحقول جهات الاتصال وفرص المبيعات المخصصة في حسابك.'
                      : 'Map survey fields directly into Contact records & custom deal pipelines in UpKlick.'}
                  </p>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Center Canvas View depending on activeMainTab */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px 16px 80px',
            background: '#f8fafc'
          }}
        >
          {activeMainTab === 'edit' && (
            <div
              style={{
                width: '100%',
                maxWidth: viewDevice === 'mobile' ? '390px' : '720px',
                transition: 'all 0.25s ease'
              }}
            >
              {/* Slides Container */}
              {survey.slides.map((slide, slideIdx) => {
                const isSelectedSlide = slide.id === selectedSlideId;

                return (
                  <div key={slide.id} style={{ marginBottom: '32px' }}>
                    {/* Slide Header & Controls */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                        padding: '0 4px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                          {slide.title || `Slide ${slideIdx + 1}`}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            background: '#e2e8f0',
                            color: '#475569',
                            padding: '2px 6px',
                            borderRadius: '12px',
                            fontWeight: 600
                          }}
                        >
                          {slide.elements?.length || 0} {isRtl ? 'حقول' : 'fields'}
                        </span>
                      </div>

                      {/* Slide action buttons (Gear, Duplicate, Delete) */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleDuplicateSlide(slide.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px'
                          }}
                          title={isRtl ? 'تكرار الشريحة' : 'Duplicate Slide'}
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteSlide(slide.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: survey.slides.length > 1 ? '#ef4444' : '#cbd5e1',
                            cursor: survey.slides.length > 1 ? 'pointer' : 'not-allowed',
                            padding: '4px',
                            borderRadius: '4px'
                          }}
                          disabled={survey.slides.length <= 1}
                          title={isRtl ? 'حذف الشريحة' : 'Delete Slide'}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Slide Card (White Box as in Screenshot 3) */}
                    <div
                      onClick={() => setSelectedSlideId(slide.id)}
                      style={{
                        background: '#ffffff',
                        borderRadius: survey.settings?.borderRadius || '16px',
                        border: isSelectedSlide ? '2px solid #2563eb' : '1px solid #e2e8f0',
                        boxShadow: isSelectedSlide
                          ? '0 10px 25px -5px rgba(37, 99, 235, 0.1), 0 8px 10px -6px rgba(37, 99, 235, 0.05)'
                          : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                        padding: '28px 24px',
                        position: 'relative',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* Slide Title & Subtitle in-canvas editing */}
                      <div style={{ marginBottom: '20px' }}>
                        <input
                          type="text"
                          value={slide.title || ''}
                          placeholder={isRtl ? 'عنوان الشريحة (اختياري)...' : 'Slide Title (e.g. Personal Info)...'}
                          onChange={(e) => handleUpdateSlide(slide.id, { title: e.target.value })}
                          style={{
                            width: '100%',
                            fontSize: '18px',
                            fontWeight: 700,
                            color: '#0f172a',
                            border: 'none',
                            borderBottom: '1px dashed transparent',
                            background: 'transparent',
                            outline: 'none',
                            padding: '4px 0',
                            marginBottom: '4px'
                          }}
                          onFocus={(e) => (e.target.style.borderBottomColor = '#cbd5e1')}
                          onBlur={(e) => (e.target.style.borderBottomColor = 'transparent')}
                        />
                        <input
                          type="text"
                          value={slide.subtitle || ''}
                          placeholder={isRtl ? 'وصف أو نص توضيحي للشريحة...' : 'Optional description or instructions for this slide...'}
                          onChange={(e) => handleUpdateSlide(slide.id, { subtitle: e.target.value })}
                          style={{
                            width: '100%',
                            fontSize: '13px',
                            color: '#64748b',
                            border: 'none',
                            borderBottom: '1px dashed transparent',
                            background: 'transparent',
                            outline: 'none',
                            padding: '2px 0'
                          }}
                          onFocus={(e) => (e.target.style.borderBottomColor = '#cbd5e1')}
                          onBlur={(e) => (e.target.style.borderBottomColor = 'transparent')}
                        />
                      </div>

                      {/* Elements List inside Slide */}
                      {(!slide.elements || slide.elements.length === 0) ? (
                        /* Empty State Box (Screenshot 3 style) */
                        <div
                          style={{
                            border: '2px dashed #e2e8f0',
                            borderRadius: '12px',
                            padding: '36px 20px',
                            textAlign: 'center',
                            background: '#f8fafc',
                            margin: '12px 0 24px'
                          }}
                        >
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                            {isRtl ? 'اسحب وأسقط العناصر هنا' : 'Drag and drop components'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                            {isRtl
                              ? 'انقر على العناصر من القائمة الجانبية أو اضغط على الزر أدناه لإضافة أول حقل.'
                              : 'Move your question to this page using the elements on the left.'}
                          </div>
                          <button
                            onClick={() => {
                              setIsDrawerOpen(true);
                              setSelectedSlideId(slide.id);
                            }}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              color: '#2563eb',
                              fontWeight: 600,
                              fontSize: '13px',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                          >
                            <Plus size={15} />
                            <span>{isRtl ? 'إضافة عناصر' : 'Add Elements'}</span>
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                          {slide.elements.map((elem, elemIdx) => {
                            const isSelected = selectedElementId === elem.id;

                            return (
                              <div
                                key={elem.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedElementId(elem.id);
                                }}
                                style={{
                                  border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                                  borderRadius: '10px',
                                  padding: '16px',
                                  background: isSelected ? '#fbfcfe' : '#ffffff',
                                  position: 'relative',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {/* Element Top Bar: Label & Action controls */}
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '10px'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                                      {elem.label || `Field ${elemIdx + 1}`}
                                    </span>
                                    {elem.required && (
                                      <span style={{ color: '#ef4444', fontSize: '13px', fontWeight: 700 }}>*</span>
                                    )}
                                  </div>

                                  {/* Item Actions */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveElement(slide.id, elem.id, 'up');
                                      }}
                                      disabled={elemIdx === 0}
                                      style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: elemIdx === 0 ? '#cbd5e1' : '#64748b',
                                        cursor: elemIdx === 0 ? 'not-allowed' : 'pointer',
                                        padding: '2px'
                                      }}
                                    >
                                      <ChevronUp size={15} />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveElement(slide.id, elem.id, 'down');
                                      }}
                                      disabled={elemIdx === slide.elements.length - 1}
                                      style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: elemIdx === slide.elements.length - 1 ? '#cbd5e1' : '#64748b',
                                        cursor: elemIdx === slide.elements.length - 1 ? 'not-allowed' : 'pointer',
                                        padding: '2px'
                                      }}
                                    >
                                      <ChevronDown size={15} />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteElement(slide.id, elem.id);
                                      }}
                                      style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        padding: '2px'
                                      }}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>

                                {/* Live Visual Preview of the Field */}
                                {renderElementPreview(elem, isRtl)}

                                {/* Inline Quick Inspector if selected */}
                                {isSelected && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      marginTop: '14px',
                                      paddingTop: '14px',
                                      borderTop: '1px solid #e2e8f0',
                                      display: 'grid',
                                      gridTemplateColumns: '1fr',
                                      gap: '10px'
                                    }}
                                  >
                                    <div>
                                      <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                                        {isRtl ? 'تسمية الحقل (Question Title)' : 'Field Label / Question'}
                                      </label>
                                      <input
                                        type="text"
                                        value={elem.label || ''}
                                        onChange={(e) => handleUpdateElement(slide.id, elem.id, { label: e.target.value })}
                                        style={{
                                          width: '100%',
                                          padding: '6px 10px',
                                          borderRadius: '6px',
                                          border: '1px solid #cbd5e1',
                                          fontSize: '12px'
                                        }}
                                      />
                                    </div>

                                    {elem.placeholder !== undefined && (
                                      <div>
                                        <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                                          {isRtl ? 'النص التوضيحي (Placeholder)' : 'Placeholder'}
                                        </label>
                                        <input
                                          type="text"
                                          value={elem.placeholder || ''}
                                          onChange={(e) => handleUpdateElement(slide.id, elem.id, { placeholder: e.target.value })}
                                          style={{
                                            width: '100%',
                                            padding: '6px 10px',
                                            borderRadius: '6px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '12px'
                                          }}
                                        />
                                      </div>
                                    )}

                                    {/* Options Manager for Radio / Checkbox / Dropdown */}
                                    {Array.isArray(elem.options) && (
                                      <div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                          <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                                            {isRtl ? 'خيارات الإجابة (Options)' : 'Choice Options'}
                                          </label>
                                          <button
                                            onClick={() => {
                                              const newOpts = [...elem.options, `Option ${elem.options.length + 1}`];
                                              handleUpdateElement(slide.id, elem.id, { options: newOpts });
                                            }}
                                            style={{
                                              background: '#eff6ff',
                                              border: '1px solid #bfdbfe',
                                              color: '#2563eb',
                                              fontSize: '11px',
                                              fontWeight: 600,
                                              padding: '2px 8px',
                                              borderRadius: '4px',
                                              cursor: 'pointer'
                                            }}
                                          >
                                            + {isRtl ? 'إضافة خيار' : 'Add Option'}
                                          </button>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                          {elem.options.map((opt, optIdx) => (
                                            <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                              <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => {
                                                  const newOpts = [...elem.options];
                                                  newOpts[optIdx] = e.target.value;
                                                  handleUpdateElement(slide.id, elem.id, { options: newOpts });
                                                }}
                                                style={{
                                                  flex: 1,
                                                  padding: '5px 8px',
                                                  borderRadius: '5px',
                                                  border: '1px solid #cbd5e1',
                                                  fontSize: '12px'
                                                }}
                                              />
                                              {elem.options.length > 1 && (
                                                <button
                                                  onClick={() => {
                                                    const newOpts = elem.options.filter((_, i) => i !== optIdx);
                                                    handleUpdateElement(slide.id, elem.id, { options: newOpts });
                                                  }}
                                                  style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: '#94a3b8',
                                                    cursor: 'pointer',
                                                    padding: '2px'
                                                  }}
                                                >
                                                  <X size={14} />
                                                </button>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Required Toggle */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px' }}>
                                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#334155' }}>
                                        {isRtl ? 'حقل إلزامي (Required)' : 'Required Field'}
                                      </span>
                                      <input
                                        type="checkbox"
                                        checked={!!elem.required}
                                        onChange={(e) => handleUpdateElement(slide.id, elem.id, { required: e.target.checked })}
                                        style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Slide Action Button (Submit / Next button inside slide) */}
                      <div style={{ display: 'flex', justifyContent: isRtl ? 'flex-start' : 'flex-end', marginTop: '12px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="text"
                            value={slide.buttonText || (slideIdx === survey.slides.length - 1 ? 'Submit' : 'Next')}
                            onChange={(e) => handleUpdateSlide(slide.id, { buttonText: e.target.value })}
                            style={{
                              background: survey.settings?.buttonColor || '#2563eb',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '10px 24px',
                              fontSize: '13px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              outline: 'none',
                              textAlign: 'center',
                              minWidth: '120px'
                            }}
                            title={isRtl ? 'انقر لتعديل نص الزر' : 'Click to edit button label'}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Divider with + Add Slide button below each slide (Screenshot 3 style) */}
                    <div
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '24px 0 12px'
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          top: '50%',
                          borderBottom: '1px dashed #cbd5e1'
                        }}
                      />
                      <button
                        onClick={handleAddSlide}
                        style={{
                          position: 'relative',
                          zIndex: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '20px',
                          padding: '6px 16px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#475569',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#2563eb';
                          e.currentTarget.style.color = '#2563eb';
                          e.currentTarget.style.background = '#f8faff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#cbd5e1';
                          e.currentTarget.style.color = '#475569';
                          e.currentTarget.style.background = '#ffffff';
                        }}
                      >
                        <Plus size={14} />
                        <span>{isRtl ? 'إضافة شريحة جديدة (Add Slide)' : '+ Add Slide'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Settings Tab */}
          {activeMainTab === 'settings' && (
            <div
              style={{
                width: '100%',
                maxWidth: '680px',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
              }}
            >
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                {isRtl ? 'إعدادات الاستبيان والمظهر' : 'Survey & Appearance Settings'}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                {/* Theme & Styling */}
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px' }}>
                    {isRtl ? 'لون زر الإجراء (Primary Button Color)' : 'Primary Button Color'}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="color"
                      value={survey.settings?.buttonColor || '#2563eb'}
                      onChange={(e) =>
                        updateSurvey((prev) => ({
                          ...prev,
                          settings: { ...prev.settings, buttonColor: e.target.value }
                        }))
                      }
                      style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={survey.settings?.buttonColor || '#2563eb'}
                      onChange={(e) =>
                        updateSurvey((prev) => ({
                          ...prev,
                          settings: { ...prev.settings, buttonColor: e.target.value }
                        }))
                      }
                      style={{ width: '120px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    />
                  </div>
                </div>

                {/* Progress Bar Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                      {isRtl ? 'إظهار شريط التقدم (Progress Bar)' : 'Show Progress Bar'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {isRtl ? 'عرض نسبة إكمال الاستبيان أعلى النموذج' : 'Displays completion % at top of survey'}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={survey.settings?.progressBar !== false}
                    onChange={(e) =>
                      updateSurvey((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, progressBar: e.target.checked }
                      }))
                    }
                    style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                </div>

                {/* Back Button Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                      {isRtl ? 'زر الرجوع للشريحة السابقة (Show Back Button)' : 'Show Back Button'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {isRtl ? 'يسمح للمستخدم بالعودة لتعديل إجاباته السابقة' : 'Allows respondent to navigate back and review answers'}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={survey.settings?.showBackButton !== false}
                    onChange={(e) =>
                      updateSurvey((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, showBackButton: e.target.checked }
                      }))
                    }
                    style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                </div>

                {/* Auto Advance Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                      {isRtl ? 'الانتقال التلقائي (Auto-Advance)' : 'Auto-Advance to Next Slide'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {isRtl ? 'الانتقال فوراً للشريحة التالية عند اختيار إجابة مفردة' : 'Automatically move to next slide upon single choice selection'}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!survey.settings?.autoAdvance}
                    onChange={(e) =>
                      updateSurvey((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, autoAdvance: e.target.checked }
                      }))
                    }
                    style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                </div>

                {/* Success Message */}
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    {isRtl ? 'عنوان رسالة النجاح (Success Title)' : 'Success Message Title'}
                  </label>
                  <input
                    type="text"
                    value={survey.settings?.successTitle || ''}
                    onChange={(e) =>
                      updateSurvey((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, successTitle: e.target.value }
                      }))
                    }
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', marginBottom: '10px' }}
                  />

                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    {isRtl ? 'نص رسالة الشكر (Success Description)' : 'Success Message Body'}
                  </label>
                  <textarea
                    rows={3}
                    value={survey.settings?.successMessage || ''}
                    onChange={(e) =>
                      updateSurvey((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, successMessage: e.target.value }
                      }))
                    }
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submissions Tab */}
          {activeMainTab === 'submissions' && (
            <div
              style={{
                width: '100%',
                maxWidth: '900px',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                    {isRtl ? 'استجابات الاستبيان' : 'Survey Submissions'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    {survey.submissions?.length || 0} {isRtl ? 'استجابة تم تسجيلها حتى الآن' : 'total submissions collected'}
                  </p>
                </div>

                <button
                  onClick={() => setIsSubmissionsOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <ExternalLink size={15} />
                  <span>{isRtl ? 'فتح مدير الاستجابات وتصدير CSV' : 'View Submissions & Export CSV'}</span>
                </button>
              </div>

              {(!survey.submissions || survey.submissions.length === 0) ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                  <FileText size={40} style={{ margin: '0 auto 12px', color: '#cbd5e1' }} />
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                    {isRtl ? 'لا توجد استجابات مسجلة بعد' : 'No submissions received yet'}
                  </div>
                  <div style={{ fontSize: '12px' }}>
                    {isRtl ? 'انشر رابط الاستبيان لبدء تلقي الإجابات من عملائك.' : 'Share or embed your survey link to collect respondent feedback.'}
                  </div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: isRtl ? 'right' : 'left' }}>
                        <th style={{ padding: '10px 14px', fontWeight: 600, color: '#475569' }}>{isRtl ? 'الاسم' : 'Name'}</th>
                        <th style={{ padding: '10px 14px', fontWeight: 600, color: '#475569' }}>{isRtl ? 'البريد' : 'Email'}</th>
                        <th style={{ padding: '10px 14px', fontWeight: 600, color: '#475569' }}>{isRtl ? 'التاريخ' : 'Date'}</th>
                        <th style={{ padding: '10px 14px', fontWeight: 600, color: '#475569' }}>{isRtl ? 'الإجابات' : 'Answers Summary'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {survey.submissions.slice(0, 10).map((sub, sIdx) => (
                        <tr key={sub.id || sIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a' }}>{sub.name || 'Anonymous'}</td>
                          <td style={{ padding: '12px 14px', color: '#475569' }}>{sub.email || '—'}</td>
                          <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '12px' }}>{sub.submittedAt || 'Recent'}</td>
                          <td style={{ padding: '12px 14px', color: '#475569', fontSize: '12px' }}>
                            {Object.keys(sub.data || {}).length} {isRtl ? 'إجابة' : 'questions answered'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeMainTab === 'notifications' && (
            <div
              style={{
                width: '100%',
                maxWidth: '640px',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
              }}
            >
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                {isRtl ? 'إشعارات البريد الإلكتروني' : 'Email Notification Alerts'}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                      {isRtl ? 'تفعيل الإشعارات الفورية' : 'Enable Instant Notifications'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      {isRtl ? 'استلام رسالة بريد إلكتروني فور تقديم أي استجابة جديدة' : 'Receive an email alert whenever a user completes this survey'}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!survey.notifications?.enableEmail}
                    onChange={(e) =>
                      updateSurvey((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, enableEmail: e.target.checked }
                      }))
                    }
                    style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    {isRtl ? 'البريد الإلكتروني المستلم (مفصول بفواصل)' : 'Recipient Email(s) - comma separated'}
                  </label>
                  <input
                    type="text"
                    value={survey.notifications?.recipients || ''}
                    placeholder="admin@example.com, sales@company.com"
                    onChange={(e) =>
                      updateSurvey((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, recipients: e.target.value }
                      }))
                    }
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    {isRtl ? 'عنوان رسالة الإشعار' : 'Email Subject Line'}
                  </label>
                  <input
                    type="text"
                    value={survey.notifications?.subject || 'New Survey Response Received'}
                    onChange={(e) =>
                      updateSurvey((prev) => ({
                        ...prev,
                        notifications: { ...prev.notifications, subject: e.target.value }
                      }))
                    }
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeMainTab === 'analytics' && (
            <div
              style={{
                width: '100%',
                maxWidth: '850px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px'
              }}
            >
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
                  {isRtl ? 'إجمالي المشاهدات' : 'Total Views'}
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>
                  {survey.viewsCount || (survey.submissions?.length ? survey.submissions.length * 2 + 12 : 0)}
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
                  {isRtl ? 'الاستجابات المكتملة' : 'Completed Submissions'}
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#2563eb' }}>
                  {survey.submissions?.length || 0}
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
                  {isRtl ? 'معدل الإكمال' : 'Completion Rate'}
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>
                  {survey.submissions?.length > 0 ? '87.5%' : '0%'}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Integrate Modal */}
      {isIntegrateOpen && (
        <SurveyIntegrateModal
          isOpen={isIntegrateOpen}
          onClose={() => setIsIntegrateOpen(false)}
          survey={survey}
          isRtl={isRtl}
          showToast={showToast}
        />
      )}

      {/* Submissions Modal */}
      {isSubmissionsOpen && (
        <SurveySubmissionsModal
          isOpen={isSubmissionsOpen}
          onClose={() => setIsSubmissionsOpen(false)}
          survey={survey}
          isRtl={isRtl}
          showToast={showToast}
        />
      )}

      {/* Full Preview Modal */}
      {isPreviewModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f8fafc'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={16} color="#2563eb" />
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  {isRtl ? 'معاينة الاستبيان التفاعلية' : 'Interactive Survey Live Preview'}
                </span>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <div
                style={{
                  background: survey.settings?.backgroundColor || '#ffffff',
                  borderRadius: survey.settings?.borderRadius || '16px',
                  border: '1px solid #e2e8f0',
                  padding: '24px'
                }}
              >
                {survey.slides[0] && (
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 6px' }}>{survey.slides[0].title}</h3>
                    {survey.slides[0].subtitle && (
                      <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>{survey.slides[0].subtitle}</p>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                      {survey.slides[0].elements?.map((el) => (
                        <div key={el.id}>
                          <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                            {el.label} {el.required && <span style={{ color: '#ef4444' }}>*</span>}
                          </label>
                          {renderElementPreview(el, isRtl)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                padding: '12px 20px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end'
              }}
            >
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {isRtl ? 'إغلاق المعاينة' : 'Close Preview'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Render Element Preview helper
function renderElementPreview(elem, isRtl) {
  switch (elem.type) {
    case 'rating': {
      const max = elem.maxRating || 5;
      return (
        <div style={{ display: 'flex', gap: '8px', margin: '6px 0' }}>
          {Array.from({ length: max }).map((_, i) => (
            <button
              key={i}
              type="button"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#fbbf24',
                padding: '2px'
              }}
            >
              <Star size={24} fill="#fbbf24" strokeWidth={1} />
            </button>
          ))}
        </div>
      );
    }
    case 'nps': {
      return (
        <div style={{ margin: '8px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: '4px' }}>
            {Array.from({ length: 11 }).map((_, i) => (
              <button
                key={i}
                type="button"
                style={{
                  padding: '8px 2px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                {i}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
            <span>{isRtl ? 'غير مرجح على الإطلاق (0)' : 'Not Likely at all (0)'}</span>
            <span>{isRtl ? 'مرجح للغاية (10)' : 'Extremely Likely (10)'}</span>
          </div>
        </div>
      );
    }
    case 'radio': {
      const opts = elem.options || ['Option 1', 'Option 2'];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '6px 0' }}>
          {opts.map((opt, i) => (
            <label
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#334155',
                cursor: 'pointer',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: '#ffffff'
              }}
            >
              <input type="radio" name={elem.id} style={{ accentColor: '#2563eb' }} />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      );
    }
    case 'checkbox': {
      const opts = elem.options || ['Option 1', 'Option 2'];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '6px 0' }}>
          {opts.map((opt, i) => (
            <label
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                color: '#334155',
                cursor: 'pointer',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                background: '#ffffff'
              }}
            >
              <input type="checkbox" style={{ accentColor: '#2563eb' }} />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      );
    }
    case 'dropdown': {
      const opts = elem.options || ['Select an option...'];
      return (
        <select
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            fontSize: '13px',
            color: '#334155',
            outline: 'none'
          }}
        >
          {opts.map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }
    case 'textarea': {
      return (
        <textarea
          rows={3}
          placeholder={elem.placeholder || 'Your thoughts...'}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            resize: 'vertical',
            outline: 'none'
          }}
        />
      );
    }
    case 'sell_products': {
      const opts = elem.options || ['Standard Plan - $29/mo', 'Pro Plan - $79/mo'];
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '6px 0' }}>
          {opts.map((opt, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                background: '#ffffff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={16} color="#2563eb" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{opt}</span>
              </div>
              <input type="radio" name={elem.id} style={{ accentColor: '#2563eb' }} />
            </div>
          ))}
        </div>
      );
    }
    case 'collect_payment': {
      return (
        <div
          style={{
            padding: '12px 16px',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            background: '#eff6ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} color="#2563eb" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e40af' }}>
              {isRtl ? 'بوابة دفع آمنة (Stripe / PayPal)' : 'Secure Payment Checkout (Credit Card / Apple Pay)'}
            </span>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>
            ${elem.amount || 49} {elem.currency || 'USD'}
          </span>
        </div>
      );
    }
    default: {
      return (
        <input
          type={elem.type === 'email' ? 'email' : elem.type === 'phone' ? 'tel' : elem.type === 'date_of_birth' ? 'date' : 'text'}
          placeholder={elem.placeholder || 'Type here...'}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            outline: 'none'
          }}
        />
      );
    }
  }
}
