'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from '../../hooks/useTranslation';
import {
  BarChart3,
  TrendingUp,
  Users,
  Globe,
  Target,
  Zap,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  Search,
  Mail,
  Clock,
  Trash2,
  Edit3,
  CheckCircle2,
  DollarSign,
  Plus,
  Smartphone,
  Crown,
  Download,
  XCircle,
  CheckCircle,
  Calendar,
  X
} from 'lucide-react';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signOut,
  getAuth
} from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, firebaseConfig } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import BrandingSettings from './BrandingSettings';
import PaymentSettingsPage from './PaymentSettingsPage';
import AiSettingsPage from './AiSettingsPage';
import PlansSettingsPage from './PlansSettingsPage';
import TrackingSettingsPage from './TrackingSettingsPage';
import OutreachPage from './OutreachPage';
import DomainsPage from './DomainsPage';

const secondaryFirebaseConfig = {
  apiKey: "AIzaSyCaswftcLmfIepG_F8fzizqGXFl5mnXvj8",
  authDomain: "aibrand-vision.firebaseapp.com",
  projectId: "aibrand-vision",
  storageBucket: "aibrand-vision.firebasestorage.app",
  messagingSenderId: "36898907108",
  appId: "1:36898907108:web:423352bb5b0f5825d65df1",
  measurementId: "G-G0CFX66Q3V"
};

// Initialize secondary Firebase App instance safely
const secondaryApp = getApps().find(app => app.name === 'supportStorageApp') 
  || initializeApp(secondaryFirebaseConfig, 'supportStorageApp');

const supportStorage = getStorage(secondaryApp);

const countryData = {
  EG: { code: '+20', placeholder: '1xxxxxxxxx' },
  SA: { code: '+966', placeholder: '5xxxxxxxx' },
  AE: { code: '+971', placeholder: '5xxxxxxxx' },
  KW: { code: '+965', placeholder: 'xxxxxxxx' },
  QA: { code: '+974', placeholder: 'xxxxxxxx' },
  JO: { code: '+962', placeholder: '7xxxxxxxx' },
  MA: { code: '+212', placeholder: '6xxxxxxxx' },
  TN: { code: '+216', placeholder: 'xxxxxxxx' },
  OTHER: { code: '+', placeholder: '' }
};

const AVAILABLE_TOOLS = [
  { key: 'crm', labelAr: 'CRM الذكي', labelEn: 'Smart CRM' },
  { key: 'telegram', labelAr: 'مركز التليجرام', labelEn: 'Telegram Hub' },
  { key: 'strategy', labelAr: 'مختبر الاستراتيجية', labelEn: 'Strategy Lab' },
  { key: 'marketing', labelAr: 'نظام التسويق', labelEn: 'Marketing OS' },
  { key: 'content', labelAr: 'مركز المحتوى', labelEn: 'Content Hub' },
  { key: 'automation', labelAr: 'مركز الأتمتة', labelEn: 'Automation Hub' },
  { key: 'ai-growth', labelAr: 'رادار استخبارات النمو', labelEn: 'Growth Intel Radar' },
  { key: 'revenue', labelAr: 'مركز المبدع', labelEn: 'Creator Hub' },
  { key: 'social', labelAr: 'الحسابات الاجتماعية', labelEn: 'Social Accounts' },
  { key: 'tiktok-trends', labelAr: 'اتجاهات التواصل', labelEn: 'Social Trends' },
  { key: 'bio', labelAr: 'رابط البايو', labelEn: 'Bio Link' },
  { key: 'landing', labelAr: 'صفحة الهبوط بالذكاء', labelEn: 'Landing Page AI' },
  { key: 'sites', labelAr: 'المواقع والفانلز', labelEn: 'Sites & Funnels' },
  { key: 'domains', labelAr: 'النطاقات', labelEn: 'Domains' },
  { key: 'digital', labelAr: 'المنتجات الرقمية', labelEn: 'Digital Products' },
  { key: 'niche', labelAr: 'استوديو العلامة التجارية', labelEn: 'Niche & Brand Studio' },
  { key: 'community', labelAr: 'مركز المجتمع', labelEn: 'Community Hub' },
  { key: 'design', labelAr: 'استوديو التصميم', labelEn: 'Design Studio' },
  { key: 'upclick', labelAr: 'منشئ اب كليك', labelEn: 'UpClick Builder' },
  { key: 'tasks', labelAr: 'لوحة المهام', labelEn: 'Task Board' },
  { key: 'calendar', labelAr: 'التقويم', labelEn: 'Calendar' },
  { key: 'finance', labelAr: 'المالية', labelEn: 'Finance' },
  { key: 'ops', labelAr: 'مركز العمليات', labelEn: 'Ops Hub' },
  { key: 'team', labelAr: 'إدارة الفريق', labelEn: 'Team' },
  { key: 'teamchat', labelAr: 'دردشة الفريق', labelEn: 'Team Chat' },
  { key: 'integrations', labelAr: 'الربط والدمج', labelEn: 'Integrations' },
  { key: 'analytics', labelAr: 'التحليلات', labelEn: 'Analytics' }
];

const AdminSupportTab = ({ isRTL, t }) => {
  const { currentUser, userData } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyInput, setReplyInput] = useState('');
  const chatEndRef = useRef(null);

  // Reply attachment states for admin
  const [replyFile, setReplyFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleUploadReplyFile = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      setUploading(true);
      setUploadProgress(0);
      
      const fileRef = ref(supportStorage, `support_attachments/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);
      
      uploadTask.on('state_changed',
        (snapshot) => {
          const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(prog);
        },
        (error) => {
          console.error("Admin chat attachment upload error: ", error);
          setUploading(false);
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            setUploading(false);
            resolve({
              name: file.name,
              url: downloadUrl,
              type: file.type
            });
          } catch (err) {
            setUploading(false);
            reject(err);
          }
        }
      );
    });
  };

  // Subscribe to ALL support tickets
  useEffect(() => {
    const q = collection(db, 'support_tickets');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort by updatedAt or createdAt desc
      list.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      setTickets(list);

      if (activeTicket) {
        const updatedActive = list.find(t => t.id === activeTicket.id);
        if (updatedActive) {
          setActiveTicket(updatedActive);
        }
      }
    });
    return () => unsubscribe();
  }, [activeTicket?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTicket?.messages?.length]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyInput.trim() && !replyFile) return;
    if (!activeTicket) return;

    try {
      let attachment = null;
      if (replyFile) {
        attachment = await handleUploadReplyFile(replyFile);
      }

      const msgObj = {
        sender: 'admin',
        senderName: userData?.name || currentUser?.email?.split('@')[0] || 'Support Admin',
        text: replyInput.trim(),
        attachments: attachment ? [attachment] : [],
        createdAt: new Date().toISOString()
      };

      const ticketRef = doc(db, 'support_tickets', activeTicket.id);
      await updateDoc(ticketRef, {
        messages: arrayUnion(msgObj),
        updatedAt: new Date().toISOString()
      });
      setReplyInput('');
      setReplyFile(null);
    } catch (err) {
      console.error("Error sending reply: ", err);
    }
  };

  const handleUpdateStatus = async (statusVal) => {
    if (!activeTicket) return;
    try {
      const ticketRef = doc(db, 'support_tickets', activeTicket.id);
      await updateDoc(ticketRef, {
        status: statusVal,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error updating status: ", err);
    }
  };

  const filtered = tickets.filter(t => {
    const matchesSearch = 
      (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusLabel = (st) => {
    if (st === 'open') return isRTL ? 'مفتوحة' : 'Open';
    if (st === 'in_progress') return isRTL ? 'قيد المتابعة' : 'In Progress';
    return isRTL ? 'مغلقة' : 'Closed';
  };

  const exportTicketsToCSV = () => {
    const headers = [
      isRTL ? 'عنوان التذكرة' : 'Subject',
      isRTL ? 'اسم المستخدم' : 'User Name',
      isRTL ? 'البريد الإلكتروني' : 'User Email',
      isRTL ? 'الحالة' : 'Status',
      isRTL ? 'تاريخ الإنشاء' : 'Created Date'
    ];

    const rows = filtered.map(t => [
      t.title || '—',
      t.userName || '—',
      t.userEmail || '—',
      getStatusLabel(t.status),
      t.createdAt ? new Date(t.createdAt.seconds ? t.createdAt.seconds * 1000 : t.createdAt).toLocaleDateString('ar-EG') : '—'
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `support_tickets_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid-2" style={{ gap: '20px', minHeight: '65vh' }}>
      
      {/* Tickets List */}
      <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>
            🛠️ {isRTL ? 'إدارة تذاكر الدعم الفني' : 'Technical Support Tickets'}
          </h3>
          <button
            type="button"
            onClick={exportTicketsToCSV}
            className="btn btn-ghost btn-sm"
            title={isRTL ? 'تحميل جدول تذاكر الدعم كملف Excel / CSV' : 'Export support tickets as Excel/CSV'}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--green)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '4px 10px',
              fontWeight: 'bold',
              fontSize: '11.5px',
              borderRadius: '8px'
            }}
          >
            <Download size={13} />
            <span>{isRTL ? 'تصدير Excel' : 'Export Excel'}</span>
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex-responsive" style={{ display: 'flex', gap: '10px' }}>
          <input 
            className="form-control"
            style={{ flex: 2 }}
            placeholder={isRTL ? 'البحث عن مستخدم، إيميل أو موضوع...' : 'Search subject, user or email...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="form-control"
            style={{ flex: 1, minWidth: '120px' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">{isRTL ? 'كل الحالات' : 'All Statuses'}</option>
            <option value="open">{isRTL ? 'مفتوحة' : 'Open'}</option>
            <option value="in_progress">{isRTL ? 'قيد المتابعة' : 'In Progress'}</option>
            <option value="closed">{isRTL ? 'مغلقة' : 'Closed'}</option>
          </select>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '55vh' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>
              {isRTL ? 'لا توجد تذاكر دعم مطابقة للبحث.' : 'No support tickets found.'}
            </div>
          ) : (
            filtered.map((t) => {
              const isActive = activeTicket?.id === t.id;
              const statusColor = t.status === 'open' ? 'var(--green)' : t.status === 'in_progress' ? 'var(--amber)' : 'var(--text3)';
              const statusBg = t.status === 'open' ? 'rgba(16, 185, 129, 0.08)' : t.status === 'in_progress' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.02)';
              return (
                <div
                  key={t.id}
                  onClick={() => setActiveTicket(t)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(255,107,53,0.06)' : 'rgba(255,255,255,0.01)',
                    border: isActive ? '1px solid var(--orange)' : '1px solid var(--line)',
                    cursor: 'pointer',
                    transition: 'all 0.14s'
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text)' }}>{t.title}</div>
                    <span style={{ fontSize: '10.5px', padding: '3px 8px', borderRadius: '4px', color: statusColor, background: statusBg, border: `1px solid ${statusColor}33` }}>
                      {getStatusLabel(t.status)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text3)' }}>
                    <span>{t.userName} ({t.userEmail})</span>
                    <span>
                      {t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString() : new Date(t.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Thread Panel */}
      <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {activeTicket ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '65vh' }}>
            {/* Header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: 'var(--text)' }}>{activeTicket.title}</h4>
                  <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>
                    {activeTicket.userName} ({activeTicket.userEmail})
                  </div>
                </div>
                
                {/* Status Update Control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{isRTL ? 'تعديل الحالة:' : 'Change Status:'}</span>
                  <select
                    className="form-control"
                    style={{ width: '120px', fontSize: '12px', padding: '4px 8px' }}
                    value={activeTicket.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                  >
                    <option value="open">{isRTL ? 'مفتوحة' : 'Open'}</option>
                    <option value="in_progress">{isRTL ? 'قيد المتابعة' : 'In Progress'}</option>
                    <option value="closed">{isRTL ? 'مغلقة' : 'Closed'}</option>
                  </select>
                </div>
              </div>

              {/* Attachments Section in Admin */}
              {activeTicket.attachments && activeTicket.attachments.length > 0 && (
                <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--line)', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text2)', marginBottom: '4px' }}>
                    📎 {isRTL ? 'المرفقات وملفات التوضيح:' : 'Attachments / Screenshots:'}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {activeTicket.attachments.map((att, i) => (
                      <a 
                        key={i} 
                        href={att.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          fontSize: '11px', 
                          background: 'rgba(255, 107, 53, 0.08)', 
                          color: 'var(--orange)', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          border: '1px solid rgba(255, 107, 53, 0.15)',
                          textDecoration: 'none'
                        }}
                      >
                        {att.type?.startsWith('image/') ? '🖼️' : '📄'} {att.name || (isRTL ? 'عرض المرفق' : 'View Attachment')}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chat Board Messages */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(0,0,0,0.1)' }}>
              {(activeTicket.messages || []).map((msg, index) => {
                const isAdmin = msg.sender === 'admin';
                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isAdmin ? 'flex-end' : 'flex-start',
                      width: '100%'
                    }}
                  >
                    <div style={{ fontSize: '10px', color: 'var(--text3)', marginBottom: '2px', display: 'flex', gap: '4px' }}>
                      <strong>{msg.senderName}</strong>
                      <span>·</span>
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div
                      style={{
                        maxWidth: '75%',
                        padding: '10px 14px',
                        borderRadius: isAdmin ? '12px 12px 0px 12px' : '0px 12px 12px 12px',
                        background: isAdmin ? 'linear-gradient(135deg, var(--orange) 0%, #f43f5e 100%)' : 'rgba(255,255,255,0.04)',
                        border: isAdmin ? 'none' : '1px solid var(--line)',
                        color: '#fff',
                        fontSize: '12.5px',
                        lineHeight: '1.4'
                      }}
                    >
                      {msg.text}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px', borderTop: isAdmin ? '1px solid rgba(255,255,255,0.15)' : '1px solid var(--line)', paddingTop: '6px' }}>
                          {msg.attachments.map((att, attIdx) => (
                            <a 
                              key={attIdx} 
                              href={att.url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '6px', 
                                fontSize: '11px', 
                                color: isAdmin ? '#fff' : 'var(--orange)', 
                                fontWeight: 500,
                                textDecoration: 'underline'
                              }}
                            >
                              {att.type?.startsWith('image/') ? '🖼️' : '📄'} {att.name || (isRTL ? 'عرض المرفق' : 'View Attachment')}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Reply Input Bar */}
            <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--line)', background: 'rgba(255,255,255,0.02)' }}>
              {(replyFile || uploading) && (
                <div style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: '11px', color: 'var(--orange)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      📎 {replyFile?.name}
                    </span>
                    {uploading && (
                      <span style={{ fontSize: '10px', color: 'var(--text3)' }}>
                        ({uploadProgress}%)
                      </span>
                    )}
                  </div>
                  {!uploading && (
                    <button 
                      type="button" 
                      onClick={() => setReplyFile(null)} 
                      style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: '12px', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
              
              <form
                onSubmit={handleSendReply}
                style={{ padding: '12px 20px', display: 'flex', gap: '10px', alignItems: 'center' }}
              >
                <input 
                  type="file" 
                  onChange={(e) => setReplyFile(e.target.files[0])}
                  style={{ display: 'none' }}
                  id="admin-chat-file-input"
                  accept="image/*,application/pdf,video/*"
                />
                <label 
                  htmlFor="admin-chat-file-input" 
                  style={{ cursor: 'pointer', fontSize: '16px', padding: '6px', color: 'var(--text3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title={isRTL ? 'إرفاق ملف' : 'Attach File'}
                >
                  📎
                </label>
                <input
                  className="form-control"
                  style={{ flex: 1 }}
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder={isRTL ? 'اكتب رد الدعم الفني هنا...' : 'Write agent reply...'}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '8px 24px', background: 'linear-gradient(135deg, var(--orange) 0%, #f43f5e 100%)', border: 'none' }}
                  disabled={uploading}
                >
                  {isRTL ? 'رد وإرسال' : 'Send'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text3)', minHeight: '65vh' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
              <div style={{ fontSize: '13px' }}>
                {isRTL ? 'حدد تذكرة دعم من القائمة لبدء التحدث والرد الفوري' : 'Select a support ticket to start agent chat'}
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

const getUserUsageStats = (user) => {
  if (!user) return { timeSpent: 0, tasksCompleted: 0, consumedCredits: 0, classification: 'inactive', classLabelAr: 'خامل', classLabelEn: 'Inactive', classColor: 'var(--text3)', classBg: 'rgba(255,255,255,0.02)', sections: [] };

  // Calculate real tasks completed dynamically from user.GC
  let tasksCompleted = 0;
  if (user.GC) {
    const gc = user.GC;
    // Count completed leads
    if (gc.crm?.workspaces) {
      gc.crm.workspaces.forEach(ws => {
        if (ws.leads) {
          ws.leads.forEach(lead => {
            if (lead.stage === 'closed' || lead.stage === 'proposal') {
              tasksCompleted++;
            }
          });
        }
      });
    }
    // Count completed tasks
    if (gc.tasks?.items) {
      gc.tasks.items.forEach(task => {
        if (task.done || task.status === 'done' || task.status === 'completed' || task.completed) {
          tasksCompleted++;
        }
      });
    }
    if (gc.team?.tasks) {
      gc.team.tasks.forEach(task => {
        if (task.done || task.status === 'done' || task.status === 'completed' || task.completed) {
          tasksCompleted++;
        }
      });
    }
    // Count broadcast campaigns sent
    if (gc.telegramHub?.broadcasts) {
      tasksCompleted += gc.telegramHub.broadcasts.length;
    }
  }

  // Calculate real hours spent
  const realSeconds = user.totalTimeSpent || 0;
  const timeSpent = realSeconds > 0 ? Number((realSeconds / 3600).toFixed(2)) : 0;

  // Calculate Consumed AI Credits
  const currentCr = user.aiCredits !== undefined ? Number(user.aiCredits) : 500;
  const initialCr = user.initialCredits !== undefined ? Number(user.initialCredits) : 500;
  const consumedCredits = user.creditsUsed !== undefined
    ? Number(user.creditsUsed)
    : (user.aiCreditsUsed !== undefined ? Number(user.aiCreditsUsed) : Math.max(0, initialCr - currentCr));

  // Section breakdown
  const su = user.sectionUsage || {};
  const secDetails = [
    { key: 'marketing', labelAr: 'نظام التسويق (Marketing OS)', labelEn: 'Marketing OS', seconds: su.marketing || 0 },
    { key: 'crm', labelAr: 'CRM الذكي (Smart CRM)', labelEn: 'Smart CRM', seconds: su.crm || 0 },
    { key: 'tasks', labelAr: 'لوحة المهام (Task Board)', labelEn: 'Task Board', seconds: su.tasks || 0 },
    { key: 'telegram', labelAr: 'مركز التليجرام (Telegram Hub)', labelEn: 'Telegram Hub', seconds: su.telegram || 0 },
    { key: 'finance', labelAr: 'المالية (Finance Hub)', labelEn: 'Finance Hub', seconds: su.finance || 0 },
    { key: 'other', labelAr: 'لوحة القيادة والصفحات الأخرى (Dashboard & Other)', labelEn: 'Dashboard & Other', seconds: su.other || 0 }
  ];

  const totalSecs = secDetails.reduce((a, b) => a + b.seconds, 0);

  const formattedSections = secDetails.map(s => {
    const pct = totalSecs > 0 ? Math.round((s.seconds / totalSecs) * 100) : 0;
    const hours = s.seconds > 0 ? Number((s.seconds / 3600).toFixed(2)) : 0;
    return {
      ...s,
      pct,
      hours
    };
  }).sort((a, b) => b.pct - a.pct);

  // Classify based on consumed credits, time spent, and completed tasks
  let classification = 'inactive';
  let classLabelAr = 'خامل (Inactive)';
  let classLabelEn = 'Inactive';
  let classColor = 'var(--text3)';
  let classBg = 'rgba(255, 255, 255, 0.02)';

  if (consumedCredits > 100 || (timeSpent > 50 && tasksCompleted > 10)) {
    classification = 'power';
    classLabelAr = 'عميل خارق (Power)';
    classLabelEn = 'Power User';
    classColor = 'var(--green)';
    classBg = 'rgba(0, 217, 139, 0.08)';
  } else if (consumedCredits > 10 || timeSpent > 5 || tasksCompleted >= 2) {
    classification = 'active';
    classLabelAr = 'نشط (Active)';
    classLabelEn = 'Active';
    classColor = 'var(--accent)';
    classBg = 'rgba(236, 92, 49, 0.08)';
  } else if (consumedCredits > 0 || timeSpent > 0.05 || tasksCompleted >= 1) {
    classification = 'moderate';
    classLabelAr = 'متوسط (Moderate)';
    classLabelEn = 'Moderate';
    classColor = 'var(--purple)';
    classBg = 'rgba(108, 53, 255, 0.08)';
  }

  // Fallback defaults for sections if they have no time logged yet to look clean in UI
  const sectionsToReturn = totalSecs > 0 ? formattedSections : [
    { key: 'marketing', labelAr: 'نظام التسويق (Marketing OS)', labelEn: 'Marketing OS', pct: 0, hours: 0 },
    { key: 'crm', labelAr: 'CRM الذكي (Smart CRM)', labelEn: 'Smart CRM', pct: 0, hours: 0 },
    { key: 'tasks', labelAr: 'لوحة المهام (Task Board)', labelEn: 'Task Board', pct: 0, hours: 0 },
    { key: 'telegram', labelAr: 'مركز التليجرام (Telegram Hub)', labelEn: 'Telegram Hub', pct: 0, hours: 0 },
    { key: 'finance', labelAr: 'المالية (Finance Hub)', labelEn: 'Finance Hub', pct: 0, hours: 0 },
    { key: 'other', labelAr: 'لوحة القيادة والصفحات الأخرى (Dashboard & Other)', labelEn: 'Dashboard & Other', pct: 0, hours: 0 }
  ];

  return {
    timeSpent,
    tasksCompleted,
    consumedCredits,
    classification,
    classLabelAr,
    classLabelEn,
    classColor,
    classBg,
    sections: sectionsToReturn
  };
};

const AdminDashboard = () => {
  const { currentUser, userData, loading: authLoading } = useAuth();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'stats';
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        router.push('/login');
      } else if (userData && userData.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [currentUser, userData, authLoading, router]);



  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [tenantFreeTrial, setTenantFreeTrial] = useState({ enabled: false, days: 7 });
  const [globalDefaultCredits, setGlobalDefaultCredits] = useState(5.00);
  const [projectCount, setProjectCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [libraryCount, setLibraryCount] = useState(0);
  const [platformStats, setPlatformStats] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [sales, setSales] = useState([]);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [newSale, setNewSale] = useState({ userId: '', customerName: '', amount: '' });
  const [editingSale, setEditingSale] = useState(null);
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState('');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedAnalysisUser, setSelectedAnalysisUser] = useState(null);
  const [activityFilter, setActivityFilter] = useState('all');
  const [roleCategoryFilter, setRoleCategoryFilter] = useState('all');

  // Independent Date Filter for General Stats Tab
  const [statsDatePreset, setStatsDatePreset] = useState('all');
  const [statsStartDate, setStatsStartDate] = useState('');
  const [statsEndDate, setStatsEndDate] = useState('');
  const [statsTopActivePage, setStatsTopActivePage] = useState(1);
  const [statsNewestPage, setStatsNewestPage] = useState(1);

  // Independent Date Filter for Users Tab
  const [dateRangePreset, setDateRangePreset] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [processingPaymentId, setProcessingPaymentId] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    licenseKey: '',
    country: 'EG',
    role: 'user',
    subscriptionType: 'months',
    subscriptionDuration: '1',
    aiCredits: '',
    allowedTools: AVAILABLE_TOOLS.map(t => t.key)
  });

  const generateLicenseKey = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const key = `GS-${segment()}-${segment()}-${segment()}`;
    setNewUser(prev => ({ ...prev, licenseKey: key }));
  };

  const stats = [
    { label: t('admin.myUsers'), value: users.length.toString(), change: 'Real-time', icon: <Users size={16} />, color: 'var(--accent)' },
    {
      label: t('admin.totalSales'),
      value: `${sales.reduce((acc, s) => acc + Number(s.amount), 0)} ${t('admin.currency')}`,
      change: 'Total',
      icon: <DollarSign size={16} />,
      color: 'var(--green)'
    },
    {
      label: t('admin.avgProfit'),
      value: sales.length ? `${Math.round(sales.reduce((acc, s) => acc + Number(s.amount), 0) / sales.length)} ${t('admin.currency')}` : '0',
      change: 'Avg',
      icon: <TrendingUp size={16} />,
      color: 'var(--accent)'
    },
    { label: t('admin.accountStatus'), value: t('common.active'), change: 'Live', icon: <Zap size={16} />, color: 'var(--amber)' },
  ];

  const getUserCreatedDate = (user) => {
    if (!user) return null;
    const ts = user.createdAt || user.joinedAt || user.trialStartedAt || user.updatedAt;
    if (!ts) return null;
    if (ts instanceof Date) return ts;
    if (typeof ts === 'string') {
      const d = new Date(ts);
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof ts === 'number') {
      const d = new Date(ts);
      return isNaN(d.getTime()) ? null : d;
    }
    if (ts?.toDate && typeof ts.toDate === 'function') {
      try { return ts.toDate(); } catch (e) { return null; }
    }
    if (ts?.seconds !== undefined) {
      return new Date(ts.seconds * 1000);
    }
    if (ts?._seconds !== undefined) {
      return new Date(ts._seconds * 1000);
    }
    return null;
  };

  const getUserDisplayName = (user) => {
    if (!user) return '—';
    return user.name || user.displayName || user.fullName || user.username || user.email || user.userEmail || (isRTL ? 'مستخدم جديد' : 'New User');
  };

  const getUserEmailDisplay = (user) => {
    if (!user) return '—';
    return user.email || user.userEmail || user.phoneNumber || '—';
  };

  const getUserCategory = (user) => {
    if (!user) return { key: 'user', labelAr: '👤 مستخدم عادي', labelEn: '👤 Regular User', color: 'var(--blue)', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)' };
    if (user.roleCategory === 'team' || user.role === 'admin' || user.isTeamMember) {
      return { key: 'team', labelAr: '👥 ضمن الفريق', labelEn: '👥 Team Member', color: 'var(--purple)', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.35)' };
    }
    return { key: 'user', labelAr: '👤 مستخدم عادي', labelEn: '👤 Regular User', color: 'var(--blue)', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)' };
  };

  const handleToggleUserCategory = async (user) => {
    const currentCat = getUserCategory(user).key;
    const newCat = currentCat === 'team' ? 'user' : 'team';
    try {
      await setDoc(doc(db, 'users', user.id), {
        roleCategory: newCat,
        isTeamMember: newCat === 'team'
      }, { merge: true });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, roleCategory: newCat, isTeamMember: newCat === 'team' } : u));
    } catch (err) {
      console.error("Error toggling user category:", err);
    }
  };

  const fetchUsers = () => {
    setLoading(true);
    const q = collection(db, 'users');
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const allUsers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(allUsers);
      setLoading(false);

      const now = new Date();
      const arabicMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      const englishMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthNames = isRTL ? arabicMonths : englishMonths;

      const last7 = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const targetYear = d.getFullYear();
        const targetMonth = d.getMonth();

        const count = allUsers.filter(u => {
          const uDate = getUserCreatedDate(u);
          if (!uDate) return false;
          return uDate.getFullYear() === targetYear && uDate.getMonth() === targetMonth;
        }).length;

        last7.push({
          name: monthNames[targetMonth],
          value: count
        });
      }

      const totalGraphCount = last7.reduce((a, b) => a + b.value, 0);
      if (totalGraphCount === 0 && allUsers.length > 0) {
        last7[last7.length - 1].value = allUsers.length;
      }

      setGrowthData(last7);
    }, (err) => {
      console.error("Error fetching users snapshot:", err);
      setLoading(false);
    });
    return unsubscribe;
  };

  const fetchProjectStats = async () => {
    try {
      const q = query(collection(db, 'projects'));
      const querySnapshot = await getDocs(q);
      let total = 0;
      const platforms = {};
      querySnapshot.forEach(doc => {
        const list = doc.data().list || [];
        total += list.length;
        list.forEach(p => {
          const name = p.platform || 'other';
          platforms[name] = (platforms[name] || 0) + 1;
        });
      });
      setProjectCount(total);

      const pStats = Object.entries(platforms)
        .map(([name, count]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          pct: total ? Math.round((count / total) * 100) : 0
        }))
        .sort((a, b) => b.pct - a.pct)
        .slice(0, 5);
      setPlatformStats(pStats);
    } catch (err) {
      console.error('Error fetching project stats:', err);
    }
  };

  const fetchLibraryStats = async () => {
    try {
      const bookDoc = await getDocs(collection(db, 'static_data'));
      const books = bookDoc.docs.find(d => d.id === 'books');
      if (books && books.data().data) {
        setLibraryCount(books.data().data.length);
      }
    } catch (err) {
      console.error('Error fetching library stats:', err);
    }
  };

  const fetchSales = () => {
    const q = query(
      collection(db, 'sales'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSales(data);
    });
    return unsub;
  };

  const handleAddSale = async (e) => {
    e.preventDefault();
    if (!newSale.userId) {
      setError(t('admin.errorSelectUser'));
      return;
    }
    setIsCreating(true);
    try {
      if (editingSale) {
        await setDoc(doc(db, 'sales', editingSale.id), {
          userId: newSale.userId,
          customerName: newSale.customerName,
          amount: Number(newSale.amount)
        }, { merge: true });
      } else {
        await setDoc(doc(collection(db, 'sales')), {
          userId: newSale.userId,
          customerName: newSale.customerName,
          amount: Number(newSale.amount),
          adminId: 'global',
          createdAt: serverTimestamp()
        });
      }
      setShowSalesModal(false);
      setNewSale({ userId: '', customerName: '', amount: '' });
      setEditingSale(null);
      setModalSearchTerm('');
    } catch (err) {
      setError(editingSale ? t('admin.errorUpdateSale') : t('admin.errorAddSale'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditSaleClick = (sale) => {
    setEditingSale(sale);
    setNewSale({ userId: sale.userId || '', customerName: sale.customerName, amount: sale.amount });
    setModalSearchTerm(sale.customerName);
    setShowSalesModal(true);
  };

  const handleDeleteSale = async (id) => {
    if (!window.confirm(t('admin.confirmDeleteSale'))) return;
    try {
      await setDoc(doc(db, 'sales', id), { deleted: true }, { merge: true });
    } catch (err) {
      setError(t('admin.errorDeleteSale'));
    }
  };

  const fetchPendingPayments = () => {
    const q = query(
      collection(db, 'payments'),
      where('status', '==', 'pending')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeB - timeA;
      });
      setPendingPayments(data);
    }, (err) => {
      console.error("Error fetching pending payments:", err);
    });
    return unsub;
  };

  const fetchAllPayments = () => {
    const q = query(
      collection(db, 'payments')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeB - timeA;
      });
      setAllPayments(data);
    }, (err) => {
      console.error("Error fetching all payments:", err);
    });
    return unsub;
  };

  const handleApproveSubscription = async (payment) => {
    if (!payment?.id || !payment?.userId) return;
    setProcessingPaymentId(payment.id);
    try {
      const userRef = doc(db, 'users', payment.userId);
      const userSnap = await getDoc(userRef);
      
      let baseDate = Date.now();
      let currentExpires = null;
      let currentUserCredits = 0;
      if (userSnap.exists()) {
        currentExpires = userSnap.data().expiresAt;
        currentUserCredits = userSnap.data().aiCredits !== undefined ? Number(userSnap.data().aiCredits) : 0;
      }
      
      if (currentExpires) {
        const currentMs = currentExpires.toDate ? currentExpires.toDate().getTime() : (currentExpires.seconds ? currentExpires.seconds * 1000 : 0);
        if (currentMs > Date.now()) {
          baseDate = currentMs;
        }
      }
      
      let daysToAdd = 30;
      const duration = payment.planDuration || 'monthly';
      if (duration.includes('year') || duration.includes('سنو')) daysToAdd = 365;
      else if (duration.includes('time') || duration.includes('مرة')) daysToAdd = 9999;
      
      const newExpiresDate = new Date(baseDate);
      newExpiresDate.setDate(newExpiresDate.getDate() + daysToAdd);

      // Fetch global settings to get the credit configuration for this plan
      const globalDoc = await getDoc(doc(db, 'tenants', 'global'));
      let creditToAdd = 0;
      if (globalDoc.exists()) {
        const globalData = globalDoc.data();
        if (duration.includes('year') || duration.includes('سنو')) {
          creditToAdd = globalData.creditAnnualPlan !== undefined ? Number(globalData.creditAnnualPlan) : 120.00;
        } else if (duration.includes('time') || duration.includes('مرة')) {
          creditToAdd = globalData.creditLifetimePlan !== undefined ? Number(globalData.creditLifetimePlan) : 500.00;
        } else {
          creditToAdd = globalData.creditMonthlyPlan !== undefined ? Number(globalData.creditMonthlyPlan) : 10.00;
        }
      } else {
        // Fallback defaults
        if (duration.includes('year') || duration.includes('سنو')) creditToAdd = 120.00;
        else if (duration.includes('time') || duration.includes('مرة')) creditToAdd = 500.00;
        else creditToAdd = 10.00;
      }
      
      await setDoc(userRef, {
        expiresAt: newExpiresDate,
        isTrial: false,
        aiCredits: currentUserCredits + creditToAdd
      }, { merge: true });
      
      await setDoc(doc(db, 'payments', payment.id), {
        status: 'approved',
        approvedAt: serverTimestamp()
      }, { merge: true });
      
      await setDoc(doc(collection(db, 'sales')), {
        userId: payment.userId,
        customerName: payment.userName || payment.userEmail.split('@')[0],
        amount: Number(payment.amount),
        adminId: 'global',
        createdAt: serverTimestamp()
      });
      
      alert(t('branding.approveSuccess') || "Subscription approved and extended!");
    } catch (err) {
      console.error("Failed to approve subscription:", err);
      setError(t('common.error') + ": " + err.message);
    } finally {
      setProcessingPaymentId('');
    }
  };

  const handleRejectSubscription = async (payment) => {
    if (!payment?.id) return;
    if (!window.confirm(isRTL ? "هل أنت متأكد من رفض إثبات الدفع هذا؟" : "Are you sure you want to reject this payment receipt?")) return;
    
    setProcessingPaymentId(payment.id);
    try {
      await setDoc(doc(db, 'payments', payment.id), {
        status: 'rejected',
        rejectedAt: serverTimestamp()
      }, { merge: true });
      
      alert(t('branding.rejectSuccess') || "Payment verification rejected.");
    } catch (err) {
      console.error("Failed to reject subscription:", err);
      setError(t('common.error') + ": " + err.message);
    } finally {
      setProcessingPaymentId('');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');
      const secondaryAuth = getAuth(secondaryApp);
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newUser.email, newUser.password);

      let expiresAt = null;
      if (newUser.subscriptionType === 'days') {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(newUser.subscriptionDuration));
      } else if (newUser.subscriptionType === 'months') {
        expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + parseInt(newUser.subscriptionDuration));
      }

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        name: newUser.name,
        email: newUser.email,
        phoneNumber: `${countryData[newUser.country].code}${newUser.phoneNumber}`,
        licenseKey: newUser.licenseKey,
        country: newUser.country,
        role: 'user',
        adminId: 'global',
        adminEmail: currentUser.email,
        adminName: currentUser.email.split('@')[0],
        subscriptionType: newUser.subscriptionType,
        subscriptionDuration: newUser.subscriptionType === 'lifetime' ? null : newUser.subscriptionDuration,
        expiresAt: expiresAt,
        aiCredits: newUser.aiCredits !== '' ? Number(newUser.aiCredits) : globalDefaultCredits,
        initialCredits: newUser.aiCredits !== '' ? Number(newUser.aiCredits) : globalDefaultCredits,
        creditsUsed: 0,
        creditBucket: 'unused',
        createdAt: serverTimestamp(),
        allowedTools: newUser.allowedTools || AVAILABLE_TOOLS.map(t => t.key)
      });

      await signOut(secondaryAuth);
      setShowAddModal(false);
      setNewUser({ name: '', email: '', password: '', phoneNumber: '', licenseKey: '', role: 'user', country: 'EG', subscriptionType: 'months', subscriptionDuration: '1', allowedTools: AVAILABLE_TOOLS.map(t => t.key) });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isExportingUsers, setIsExportingUsers] = useState(false);

  const exportUsersToCSV = () => {
    const listToExport = filteredUsers.length > 0 ? filteredUsers : users;
    const headers = [
      isRTL ? 'اسم المستخدم' : 'Name',
      isRTL ? 'البريد الإلكتروني' : 'Email',
      isRTL ? 'رقم الهاتف' : 'Phone',
      isRTL ? 'الدولة' : 'Country',
      isRTL ? 'حالة الاشتراك' : 'Subscription Status',
      isRTL ? 'اسم الباقة' : 'Plan Name',
      isRTL ? 'رصيد الذكاء الاصطناعي' : 'AI Credits',
      isRTL ? 'تاريخ الانضمام' : 'Join Date',
      isRTL ? 'نشاط التفاعل' : 'Activity Status'
    ];

    const rows = listToExport.map(u => {
      const trialDet = getTrialStatusDetailed(u);
      const actStatus = getUserActivityStatus(u);
      return [
        u.name || u.email,
        u.email,
        u.phoneNumber || '—',
        u.country || 'EG',
        trialDet.text,
        u.planName || u.plan || 'Starter',
        u.aiCredits !== undefined ? Math.round(u.aiCredits) : 0,
        formatJoinDate(u),
        actStatus.text
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `users_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSalesToCSV = () => {
    const headers = [
      isRTL ? 'اسم العميل' : 'Customer Name',
      isRTL ? 'البريد الإلكتروني' : 'Customer Email',
      isRTL ? 'طريقة الدفع' : 'Payment Method',
      isRTL ? 'المبلغ' : 'Amount',
      isRTL ? 'العملة' : 'Currency',
      isRTL ? 'الحالة' : 'Status',
      isRTL ? 'تاريخ العملية' : 'Transaction Date'
    ];

    const rows = filteredPayments.map(pay => [
      pay.userName || '—',
      pay.userEmail || '—',
      pay.paymentMethod || 'manual',
      pay.amount || 0,
      pay.currency || 'EGP',
      pay.status || 'completed',
      pay.createdAt ? new Date(pay.createdAt.seconds ? pay.createdAt.seconds * 1000 : pay.createdAt).toLocaleDateString('ar-EG') : '—'
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_payments_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete?.id) return;
    setIsDeletingUser(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/admin-delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUid: userToDelete.id })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isRTL ? 'فشل في حذف المستخدم' : 'Failed to delete user account'));
      }
      await deleteDoc(doc(db, 'users', userToDelete.id)).catch(() => {});
      setUserToDelete(null);
    } catch (err) {
      console.error("Delete user error:", err);
      setError((t('admin.errorDeleteUser') || "Error deleting user: ") + err.message);
    } finally {
      setIsDeletingUser(false);
    }
  };

  const handleResetDevices = async (userId) => {
    if (!window.confirm(t('admin.confirmResetDevices'))) return;
    try {
      await setDoc(doc(db, 'users', userId), { devices: [] }, { merge: true });
    } catch (err) {
      setError(t('admin.errorResetDevices'));
    }
  };

  const handleEditClick = (user) => {
    const activePlan = user.planName || user.plan || (user.isTrial ? 'Free Trial' : 'Starter');
    const onFreeTrial = !!(user.isTrial || String(activePlan).toLowerCase() === 'free trial' || String(activePlan).includes('مجاني') || String(activePlan).includes('تجريب'));
    setEditingUser({
      ...user,
      phoneNumber: user.phoneNumber?.replace(countryData[user.country || 'EG'].code, '') || '',
      aiCredits: user.aiCredits !== undefined ? Number(user.aiCredits) : globalDefaultCredits,
      allowedTools: user.allowedTools || AVAILABLE_TOOLS.map(t => t.key),
      subscriptionType: onFreeTrial ? 'days' : (user.subscriptionType || 'months'),
      subscriptionDuration: onFreeTrial ? String(tenantFreeTrial.days || 15) : (user.subscriptionDuration || '1'),
      planName: onFreeTrial ? 'Free Trial' : activePlan,
      plan: onFreeTrial ? 'Free Trial' : activePlan,
      isTrial: onFreeTrial,
      newPassword: ''
    });
    setShowEditModal(true);
  };

  const isFreeTrialPlan = (planName, extra = {}) => {
    const p = String(planName || '').toLowerCase().trim();
    if (extra.isTrial) return true;
    return p === 'free trial' || p === 'free' || p.includes('مجاني') || p.includes('تجريب');
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);
    try {
      // Sync Email & Password in Firebase Auth via Admin API
      try {
        const authRes = await fetch('/api/auth/admin-update-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUid: editingUser.id,
            newEmail: editingUser.email ? editingUser.email.trim() : '',
            newPassword: editingUser.newPassword ? editingUser.newPassword.trim() : ''
          })
        });

        const authData = await authRes.json();
        if (!authRes.ok) {
          console.warn("Auth update warning:", authData.error);
        }
      } catch (authErr) {
        console.warn("Auth update fetch warning:", authErr);
      }

      const assigningFreeTrial = isFreeTrialPlan(editingUser.planName || editingUser.plan, editingUser);

      if (assigningFreeTrial) {
        const trialDays = Number(tenantFreeTrial.days || 15);
        const trialCredits = tenantFreeTrial.credits !== undefined
          ? Number(tenantFreeTrial.credits)
          : Number(editingUser.aiCredits || 500);
        const trialTools = Array.isArray(tenantFreeTrial.allowedTools) && tenantFreeTrial.allowedTools.length
          ? tenantFreeTrial.allowedTools
          : (editingUser.allowedTools || AVAILABLE_TOOLS.map(t => t.key));

        await setDoc(doc(db, 'users', editingUser.id), {
          name: editingUser.name || '',
          email: editingUser.email || '',
          phoneNumber: `${countryData[editingUser.country || 'EG'].code}${editingUser.phoneNumber || ''}`,
          licenseKey: editingUser.licenseKey || '',
          country: editingUser.country || 'EG',
          subscriptionType: 'days',
          subscriptionDuration: String(trialDays),
          expiresAt: null,
          planName: 'Free Trial',
          plan: 'Free Trial',
          isTrial: true,
          trialStartedAt: new Date().toISOString(),
          roleCategory: editingUser.roleCategory || 'user',
          isTeamMember: editingUser.roleCategory === 'team',
          aiCredits: trialCredits,
          allowedTools: trialTools
        }, { merge: true });
      } else {
        const subType = editingUser.subscriptionType || 'months';
        const subDuration = editingUser.subscriptionDuration || '1';

        let expiresAt = null;
        if (subType === 'days') {
          expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + parseInt(subDuration));
        } else if (subType === 'months') {
          expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + parseInt(subDuration));
        } else if (subType === 'lifetime') {
          expiresAt = null;
        }

        const activePlan = editingUser.planName || editingUser.plan || 'Starter';

        await setDoc(doc(db, 'users', editingUser.id), {
          name: editingUser.name || '',
          email: editingUser.email || '',
          phoneNumber: `${countryData[editingUser.country || 'EG'].code}${editingUser.phoneNumber || ''}`,
          licenseKey: editingUser.licenseKey || '',
          country: editingUser.country || 'EG',
          subscriptionType: subType,
          subscriptionDuration: subType === 'lifetime' ? null : subDuration,
          expiresAt: expiresAt,
          planName: activePlan,
          plan: activePlan,
          isTrial: false,
          roleCategory: editingUser.roleCategory || 'user',
          isTeamMember: editingUser.roleCategory === 'team',
          aiCredits: Number(editingUser.aiCredits || 0),
          allowedTools: editingUser.allowedTools || AVAILABLE_TOOLS.map(t => t.key)
        }, { merge: true });
      }

      setShowEditModal(false);
      setEditingUser(null);
    } catch (err) {
      console.error("Failed to update user:", err);
      setError((t('admin.errorUpdateUser') || "Failed to update user: ") + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    let unsubUsers;
    let unsubSales;
    let unsubPayments;
    let unsubAllPayments;
    if (currentUser && userData && userData.role === 'admin') {
      unsubUsers = fetchUsers();
      unsubSales = fetchSales();
      unsubPayments = fetchPendingPayments();
      unsubAllPayments = fetchAllPayments();
      getDoc(doc(db, 'tenants', 'global')).then(snap => {
        if (snap.exists()) {
          if (snap.data().freeTrial) setTenantFreeTrial(snap.data().freeTrial);
          const cpd = snap.data().creditsPerDollar !== undefined ? Number(snap.data().creditsPerDollar) : 100;
          if (snap.data().defaultUserCredit !== undefined) setGlobalDefaultCredits(Number(snap.data().defaultUserCredit) * cpd);
        }
      }).catch(() => {});
    }
    return () => {
      if (unsubUsers) unsubUsers();
      if (unsubSales) unsubSales();
      if (unsubPayments) unsubPayments();
      if (unsubAllPayments) unsubAllPayments();
    };
  }, [currentUser, userData]);

  const getTrialStatus = (user) => {
    if (!user.isTrial || !user.trialStartedAt) return null;
    const trialDays = tenantFreeTrial.days || 15;
    const ts = user.trialStartedAt;
    const startMs = ts?.toDate ? ts.toDate().getTime() : (ts?.seconds ? ts.seconds * 1000 : 0);
    if (!startMs) return null;
    const expiresMs = startMs + trialDays * 86400000;
    if (Date.now() > expiresMs) return { expired: true, daysLeft: 0 };
    return { expired: false, daysLeft: Math.max(1, Math.ceil((expiresMs - Date.now()) / 86400000)) };
  };

  const getSubscriptionStatus = (user) => {
    if (!user.expiresAt) return null;
    const ts = user.expiresAt;
    const expiresMs = ts?.toDate ? ts.toDate().getTime() : (ts?.seconds ? ts.seconds * 1000 : (typeof ts === 'number' ? ts : (typeof ts === 'string' ? new Date(ts).getTime() : 0)));
    if (!expiresMs || Date.now() > expiresMs) return { expired: true, daysLeft: 0 };
    return { expired: false, daysLeft: Math.max(1, Math.ceil((expiresMs - Date.now()) / 86400000)) };
  };

  const getJoinMs = (user) => {
    const d = getUserCreatedDate(user);
    return d ? d.getTime() : 0;
  };

  const getRelativeTimeStr = (user) => {
    const ms = getJoinMs(user);
    if (!ms) return '—';
    const diffMs = Date.now() - ms;
    if (diffMs < 0) return isRTL ? 'الآن' : 'Just now';

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return isRTL ? 'الآن' : 'Just now';
    if (diffMins < 60) return isRTL ? `منذ ${diffMins} دقيقة` : `${diffMins} mins ago`;
    if (diffHours < 24) return isRTL ? `منذ ${diffHours} ساعة` : `${diffHours} hours ago`;
    if (diffDays === 1) return isRTL ? 'أمس' : 'Yesterday';
    if (diffDays <= 7) return isRTL ? `منذ ${diffDays} أيام` : `${diffDays} days ago`;

    const d = new Date(ms);
    return d.toLocaleDateString(dateLocale, { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const getUserActivityStatus = (user) => {
    // Only check actual user activity timestamps (NOT admin updates / updatedAt)
    const ts = user.lastActiveAt || user.lastSeenAt || user.lastActivityAt || user.lastLoginAt;
    if (!ts) return { isOnline: false, text: isRTL ? '⚪ لم ينشط بعد' : '⚪ Never active', color: 'var(--text3)', bg: 'rgba(255,255,255,0.03)' };

    let timeMs = 0;
    if (typeof ts === 'string') timeMs = new Date(ts).getTime();
    else if (typeof ts === 'number') timeMs = ts;
    else if (ts?.toDate) timeMs = ts.toDate().getTime();
    else if (ts?.seconds) timeMs = ts.seconds * 1000;
    else if (ts?._seconds) timeMs = ts._seconds * 1000;

    if (!timeMs || isNaN(timeMs)) return { isOnline: false, text: isRTL ? '⚪ لم ينشط بعد' : '⚪ Never active', color: 'var(--text3)', bg: 'rgba(255,255,255,0.03)' };

    const diffMs = Date.now() - timeMs;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins <= 5) {
      return { isOnline: true, text: isRTL ? '🟢 نشط الآن' : '🟢 Active Now', color: 'var(--green)', bg: 'rgba(16, 185, 129, 0.15)' };
    }
    if (diffMins < 60) {
      return { isOnline: false, text: isRTL ? `🟡 نشط منذ ${diffMins} دقيقة` : `🟡 Active ${diffMins}m ago`, color: 'var(--amber)', bg: 'rgba(245, 158, 11, 0.12)' };
    }
    if (diffHours < 24) {
      return { isOnline: false, text: isRTL ? `🟡 نشط منذ ${diffHours} ساعة` : `🟡 Active ${diffHours}h ago`, color: 'var(--amber)', bg: 'rgba(245, 158, 11, 0.1)' };
    }
    if (diffDays === 1) {
      return { isOnline: false, text: isRTL ? '⚪ نشط أمس' : '⚪ Active yesterday', color: 'var(--text2)', bg: 'var(--bg3)' };
    }
    if (diffDays <= 30) {
      return { isOnline: false, text: isRTL ? `⚪ نشط منذ ${diffDays} يوم` : `⚪ Active ${diffDays}d ago`, color: 'var(--text3)', bg: 'var(--bg3)' };
    }
    return { isOnline: false, text: isRTL ? '⚪ غير نشط' : '⚪ Inactive', color: 'var(--text3)', bg: 'var(--bg3)' };
  };

  const isUserNew = (user) => {
    const ms = getJoinMs(user);
    if (!ms) return false;
    const diffHours = (Date.now() - ms) / 3600000;
    return diffHours <= 48; // Joined in last 48 hours
  };

  const getTrialStatusDetailed = (user) => {
    const trialDays = tenantFreeTrial.days || 15;
    const ms = getJoinMs(user);

    // Paid Plan or Active Subscription
    if (!user.isTrial && user.expiresAt) {
      const ss = getSubscriptionStatus(user);
      if (ss.expired) return { type: 'paid_expired', text: isRTL ? '❌ اشتراك منتهي' : '❌ Plan Expired', daysLeft: 0 };
      return { type: 'paid_active', text: isRTL ? `👑 باقة مدفوعة (متبقي ${ss.daysLeft} يوم)` : `👑 Paid Plan (${ss.daysLeft}d left)`, daysLeft: ss.daysLeft };
    }
    if (!user.isTrial && !user.expiresAt && user.planName && user.planName !== 'starter') {
      return { type: 'lifetime', text: isRTL ? '♾️ اشتراك مدى الحياة' : '♾️ Lifetime', daysLeft: Infinity };
    }

    // Trial Calculation
    const ts = user.trialStartedAt || user.createdAt;
    const startMs = ts?.toDate ? ts.toDate().getTime() : (ts?.seconds ? ts.seconds * 1000 : (typeof ts === 'number' ? ts : (typeof ts === 'string' ? new Date(ts).getTime() : ms)));
    if (!startMs) return { type: 'starter', text: isRTL ? '🆓 تجربة مجانية' : 'Free Trial', daysLeft: 0 };

    const expiresMs = startMs + trialDays * 86400000;
    const daysLeft = Math.ceil((expiresMs - Date.now()) / 86400000);

    if (Date.now() > expiresMs) {
      return { type: 'trial_expired', text: isRTL ? '❌ انتهت الفترة التجريبية' : '❌ Trial Expired', daysLeft: 0, expired: true };
    }
    return { type: 'trial_active', text: isRTL ? `⏰ متبقي ${daysLeft} يوم تجربة` : `⏰ ${daysLeft} days trial left`, daysLeft, expired: false };
  };

  const isDateInSelectedRange = (dateVal, preset = dateRangePreset, start = startDate, end = endDate) => {
    if (preset === 'all' && !start && !end) return true;
    if (!dateVal && preset !== 'all') return false;

    let timeMs = 0;
    if (dateVal instanceof Date) timeMs = dateVal.getTime();
    else if (typeof dateVal === 'string') timeMs = new Date(dateVal).getTime();
    else if (typeof dateVal === 'number') timeMs = dateVal;
    else if (dateVal?.toDate) timeMs = dateVal.toDate().getTime();
    else if (dateVal?.seconds) timeMs = dateVal.seconds * 1000;
    else if (dateVal?._seconds) timeMs = dateVal._seconds * 1000;

    if (!timeMs || isNaN(timeMs)) {
      return preset === 'all' && !start && !end;
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const todayEnd = todayStart + 86400000 - 1;

    if (preset === 'today') {
      return timeMs >= todayStart && timeMs <= todayEnd;
    }

    if (preset === 'yesterday') {
      const yestStart = todayStart - 86400000;
      const yestEnd = todayStart - 1;
      return timeMs >= yestStart && timeMs <= yestEnd;
    }

    if (preset === 'last7') {
      const sevenDaysAgo = todayStart - (6 * 86400000);
      return timeMs >= sevenDaysAgo && timeMs <= todayEnd;
    }

    if (preset === 'thisMonth') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      return timeMs >= monthStart && timeMs <= todayEnd;
    }

    if (preset === 'lastMonth') {
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime();
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).getTime();
      return timeMs >= lastMonthStart && timeMs <= lastMonthEnd;
    }

    if (preset === 'custom' || start || end) {
      let startMs = start ? new Date(start + 'T00:00:00').getTime() : 0;
      let endMs = end ? new Date(end + 'T23:59:59').getTime() : Infinity;
      return timeMs >= startMs && timeMs <= endMs;
    }

    return true;
  };

  const renderStatsDateRangeFilter = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <select
        className="form-control"
        style={{
          width: 'auto',
          minWidth: '130px',
          fontSize: '12px',
          padding: '6px 12px',
          background: 'var(--bg3)',
          borderColor: 'var(--line)',
          color: 'var(--text)',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
        value={statsDatePreset}
        onChange={(e) => {
          setStatsDatePreset(e.target.value);
          if (e.target.value !== 'custom') {
            setStatsStartDate('');
            setStatsEndDate('');
          }
        }}
      >
        <option value="all">{isRTL ? 'جميع الأوقات' : 'All Time'}</option>
        <option value="today">{isRTL ? 'اليوم' : 'Today'}</option>
        <option value="yesterday">{isRTL ? 'أمس' : 'Yesterday'}</option>
        <option value="last7">{isRTL ? 'آخر 7 أيام' : 'Last 7 Days'}</option>
        <option value="thisMonth">{isRTL ? 'هذا الشهر' : 'This Month'}</option>
        <option value="lastMonth">{isRTL ? 'الشهر الماضي' : 'Last Month'}</option>
        <option value="custom">{isRTL ? 'فترة مخصصة...' : 'Custom Period...'}</option>
      </select>

      {statsDatePreset === 'custom' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="date"
            className="form-control"
            style={{ width: 'auto', fontSize: '11px', padding: '4px 8px' }}
            value={statsStartDate}
            onChange={(e) => setStatsStartDate(e.target.value)}
          />
          <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{isRTL ? 'إلى' : 'to'}</span>
          <input
            type="date"
            className="form-control"
            style={{ width: 'auto', fontSize: '11px', padding: '4px 8px' }}
            value={statsEndDate}
            onChange={(e) => setStatsEndDate(e.target.value)}
          />
        </div>
      )}
    </div>
  );

  const renderDateRangeFilter = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <select
        className="form-control"
        style={{
          width: 'auto',
          minWidth: '130px',
          fontSize: '12px',
          padding: '6px 12px',
          background: 'var(--bg3)',
          borderColor: 'var(--line)',
          color: 'var(--text)',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
        value={dateRangePreset}
        onChange={(e) => {
          setDateRangePreset(e.target.value);
          if (e.target.value !== 'custom') {
            setStartDate('');
            setEndDate('');
          }
        }}
      >
        <option value="all">{isRTL ? 'جميع الأوقات' : 'All Time'}</option>
        <option value="today">{isRTL ? 'اليوم' : 'Today'}</option>
        <option value="yesterday">{isRTL ? 'أمس' : 'Yesterday'}</option>
        <option value="last7">{isRTL ? 'آخر 7 أيام' : 'Last 7 Days'}</option>
        <option value="thisMonth">{isRTL ? 'هذا الشهر' : 'This Month'}</option>
        <option value="lastMonth">{isRTL ? 'الشهر الماضي' : 'Last Month'}</option>
        <option value="custom">{isRTL ? 'فترة مخصصة...' : 'Custom Period...'}</option>
      </select>

      {(dateRangePreset === 'custom' || startDate || endDate) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="date"
            className="form-control"
            style={{
              fontSize: '12px',
              padding: '4px 8px',
              background: 'var(--bg3)',
              borderColor: 'var(--line)',
              color: 'var(--text)',
              borderRadius: '8px',
              width: '135px'
            }}
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (dateRangePreset !== 'custom') setDateRangePreset('custom');
            }}
          />
          <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{isRTL ? 'إلى' : 'to'}</span>
          <input
            type="date"
            className="form-control"
            style={{
              fontSize: '12px',
              padding: '4px 8px',
              background: 'var(--bg3)',
              borderColor: 'var(--line)',
              color: 'var(--text)',
              borderRadius: '8px',
              width: '135px'
            }}
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              if (dateRangePreset !== 'custom') setDateRangePreset('custom');
            }}
          />
          {(startDate || endDate) && (
            <button
              type="button"
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setDateRangePreset('all');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text3)',
                fontSize: '12px',
                cursor: 'pointer',
                padding: '2px 6px'
              }}
              title={isRTL ? 'إلغاء الفلتر' : 'Clear Filter'}
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );

  const filteredUsers = users.filter(u => {
    if (!u) return false;
    if (!u.email && !u.name && !u.displayName && !u.userEmail && !u.phoneNumber) return false;

    const matchesSearch = (u.email || u.userEmail || u.name || u.displayName || u.phoneNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (!isDateInSelectedRange(getUserCreatedDate(u))) return false;
    
    if (roleCategoryFilter !== 'all') {
      const catKey = getUserCategory(u).key;
      if (catKey !== roleCategoryFilter) return false;
    }

    if (activityFilter === 'all' || activityFilter === 'time_desc') return true;

    if (activityFilter === 'new_users') {
      return isUserNew(u);
    }

    if (activityFilter === 'active_trial') {
      const trialDet = getTrialStatusDetailed(u);
      return trialDet && (trialDet.type === 'trial_active' || trialDet.type === 'starter') && !trialDet.expired;
    }

    if (activityFilter === 'expired_trial') {
      const trialDet = getTrialStatusDetailed(u);
      return trialDet && (trialDet.type === 'trial_expired' || trialDet.expired === true);
    }

    if (activityFilter === 'paid') {
      const trialDet = getTrialStatusDetailed(u);
      return trialDet && (trialDet.type === 'paid_active' || trialDet.type === 'lifetime' || (u.planName && u.planName !== 'Starter' && u.planName !== 'Free Trial'));
    }

    const uStats = getUserUsageStats(u);
    return uStats.classification === activityFilter;
  }).sort((a, b) => {
    if (activityFilter === 'time_desc') {
      const statsA = getUserUsageStats(a);
      const statsB = getUserUsageStats(b);
      const scoreA = (statsA.consumedCredits * 10) + (statsA.timeSpent * 5) + statsA.tasksCompleted;
      const scoreB = (statsB.consumedCredits * 10) + (statsB.timeSpent * 5) + statsB.tasksCompleted;
      return scoreB - scoreA;
    }
    return getJoinMs(b) - getJoinMs(a);
  });

  const [userPage, setUserPage] = useState(1);
  const USERS_PER_PAGE = 10;

  const totalUserPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const paginatedUsers = filteredUsers.slice((userPage - 1) * USERS_PER_PAGE, userPage * USERS_PER_PAGE);

  useEffect(() => {
    setUserPage(1);
  }, [searchTerm, activityFilter, roleCategoryFilter, dateRangePreset, startDate, endDate]);

  const dateLocale = isRTL ? 'ar-EG' : 'en-US';

  const [salesPage, setSalesPage] = useState(1);
  const SALES_PER_PAGE = 10;

  useEffect(() => {
    setSalesPage(1);
  }, [paymentSearchTerm, paymentStatusFilter]);

  const filteredPayments = allPayments.filter(pay => {
    const matchesSearch = 
      (pay.userName || '').toLowerCase().includes(paymentSearchTerm.toLowerCase()) ||
      (pay.userEmail || '').toLowerCase().includes(paymentSearchTerm.toLowerCase());
    const matchesStatus = 
      paymentStatusFilter === 'all' || pay.status === paymentStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalSalesPages = Math.ceil(filteredPayments.length / SALES_PER_PAGE) || 1;
  const paginatedSales = filteredPayments.slice((salesPage - 1) * SALES_PER_PAGE, salesPage * SALES_PER_PAGE);

  const formatJoinDate = (user) => {
    const ts = user.createdAt || user.trialStartedAt;
    if (!ts) return '—';
    let dateObj = null;
    if (typeof ts === 'string') dateObj = new Date(ts);
    else if (typeof ts === 'number') dateObj = new Date(ts);
    else if (ts?.toDate) dateObj = ts.toDate();
    else if (ts?.seconds) dateObj = new Date(ts.seconds * 1000);

    if (!dateObj || isNaN(dateObj.getTime())) return '—';
    return dateObj.toLocaleDateString(dateLocale, { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const phoneSpanStyle = {
    position: 'absolute',
    [isRTL ? 'right' : 'left']: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text3)',
    fontSize: '13px',
    direction: 'ltr',
    [isRTL ? 'borderLeft' : 'borderRight']: '1px solid var(--line)',
    [isRTL ? 'paddingLeft' : 'paddingRight']: '10px',
    [isRTL ? 'marginLeft' : 'marginRight']: '10px'
  };

  const phoneInputStyle = {
    [isRTL ? 'paddingRight' : 'paddingLeft']: '60px',
    textAlign: 'left',
    direction: 'ltr'
  };

  // Prevent flash rendering for non-authorized users
  if (authLoading || !currentUser || !userData || userData.role !== 'admin') {
    return <div style={{ padding: '40px', color: 'var(--text2)' }}>Loading admin panel...</div>;
  }

  return (
    <div style={{ animation: 'fadeSlide 0.4s ease' }}>
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '24px', paddingTop: '8px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text)' }}>
            {activeTab === 'users' ? t('admin.usersTitle') :
             activeTab === 'sales' ? t('admin.salesTitle') :
             activeTab === 'plans' ? (isRTL ? 'إدارة الباقات والاشتراكات والأسعار' : 'Plans & Subscriptions Management') :
             activeTab === 'branding' ? t('admin.brandingTitle') :
             activeTab === 'payments' ? t('admin.paymentsTitle') :
             activeTab === 'support' ? (isRTL ? 'الدعم الفني والشكاوى' : 'Support Tickets') :
             activeTab === 'tracking' ? t('nav.trackingSettings') :
             activeTab === 'outreach' ? (isRTL ? 'جدولة الإيميل والواتساب' : 'Email & WhatsApp Outreach') :
             activeTab === 'domains' ? (isRTL ? 'النطاقات والمسجّل' : 'Domains & Registrar') :
             t('admin.statsTitle')}
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>
            {activeTab === 'users' ? t('admin.usersDesc') :
             activeTab === 'sales' ? t('admin.salesDesc') :
             activeTab === 'plans' ? (isRTL ? 'تعديل أسعار وميزات الباقات وشحن الرصيد' : 'Configure subscription plans, features, and refill packs') :
             activeTab === 'branding' ? t('admin.brandingDesc') :
             activeTab === 'payments' ? t('admin.paymentsDesc') :
             activeTab === 'support' ? (isRTL ? 'متابعة وحل مشكلات العملاء وفتح المحادثات الفورية' : 'Manage customer issues and open chat threads') :
             activeTab === 'tracking' ? (isRTL ? 'إدارة وتتبع أكواد البيكسل والتحليلات الخاصة بالمنصة' : 'Manage and track platform pixel and analytics configurations') :
             activeTab === 'outreach' ? (isRTL ? 'إرسال حملات إيميل وواتساب حسب فئات استهلاك الكريدت — من الخادم فقط وبعد تأكيد SEND' : 'Send email and WhatsApp campaigns by credit-usage segment — server-side only, after typed SEND confirm') :
             activeTab === 'domains' ? (isRTL ? 'تسعير النطاقات، الطلبات، وإعادة محاولة التسجيل بعد الدفع' : 'Domain pricing, orders, and retry failed registrar purchases') :
             t('admin.statsDesc')}
          </p>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)', padding: '10px 15px', borderRadius: '8px', marginTop: '10px', fontSize: '13px', border: '1px solid rgba(239,68,68,0.2)' }}>⚠️ {error}</div>}
        </div>
        {activeTab === 'users' && (
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <UserPlus size={18} />
            <span>{t('admin.addNewUser')}</span>
          </button>
        )}
        {activeTab === 'sales' && userData?.role === 'admin' && (
          <button onClick={() => { setEditingSale(null); setNewSale({ userId: '', customerName: '', amount: '' }); setModalSearchTerm(''); setShowSalesModal(true); }} className="btn btn-primary">
            <DollarSign size={18} />
            <span>{t('admin.addSale')}</span>
          </button>
        )}
      </div>

      {activeTab === 'stats' ? (
        <>
          {(() => {
            const periodUsers = users.filter(u => isDateInSelectedRange(getUserCreatedDate(u), statsDatePreset, statsStartDate, statsEndDate));
            const periodSales = sales.filter(s => isDateInSelectedRange(s.createdAt, statsDatePreset, statsStartDate, statsEndDate));

            const onlineUsersCount = periodUsers.filter(u => getUserActivityStatus(u).isOnline).length;
            const paidUsersCount = periodUsers.filter(u => {
              const st = getTrialStatusDetailed(u);
              return st.type.startsWith('paid') || st.type === 'lifetime';
            }).length;
            const activeTrialCount = periodUsers.filter(u => getTrialStatusDetailed(u).type === 'trial_active').length;
            const expiredTrialCount = periodUsers.filter(u => getTrialStatusDetailed(u).type === 'trial_expired').length;

            const totalSalesAmount = periodSales.reduce((acc, s) => acc + Number(s.amount || 0), 0);
            const avgSaleAmount = periodSales.length ? Math.round(totalSalesAmount / periodSales.length) : 0;

            // Plan Breakdown
            const starterCount = periodUsers.filter(u => (u.planName || u.plan || 'Starter').toLowerCase() === 'starter').length;
            const growthCount = periodUsers.filter(u => (u.planName || u.plan || '').toLowerCase() === 'growth').length;
            const proCount = periodUsers.filter(u => (u.planName || u.plan || '').toLowerCase() === 'pro').length;
            const customCount = periodUsers.filter(u => !['starter', 'growth', 'pro'].includes((u.planName || u.plan || '').toLowerCase())).length;

            // Countries Breakdown
            const countriesMap = {};
            periodUsers.forEach(u => {
              const c = u.country || 'EG';
              countriesMap[c] = (countriesMap[c] || 0) + 1;
            });

            const countryMeta = {
              EG: { nameAr: 'مصر', nameEn: 'Egypt', flag: '🇪🇬' },
              SA: { nameAr: 'السعودية', nameEn: 'Saudi Arabia', flag: '🇸🇦' },
              AE: { nameAr: 'الإمارات', nameEn: 'UAE', flag: '🇦🇪' },
              KW: { nameAr: 'الكويت', nameEn: 'Kuwait', flag: '🇰🇼' },
              QA: { nameAr: 'قطر', nameEn: 'Qatar', flag: '🇶🇦' },
              JO: { nameAr: 'الأردن', nameEn: 'Jordan', flag: '🇯🇴' },
              MA: { nameAr: 'المغرب', nameEn: 'Morocco', flag: '🇲🇦' },
              TN: { nameAr: 'تونس', nameEn: 'Tunisia', flag: '🇹🇳' },
              OTHER: { nameAr: 'دول أخرى', nameEn: 'Other Countries', flag: '🌐' }
            };

            const formattedCountries = Object.entries(countriesMap).map(([code, count]) => {
              const meta = countryMeta[code] || { nameAr: code, nameEn: code, flag: '🌐' };
              const pct = periodUsers.length ? Math.round((count / periodUsers.length) * 100) : 0;
              return { code, count, pct, ...meta };
            }).sort((a, b) => b.count - a.count);

            const exportExecutiveReport = () => {
              const headers = [isRTL ? 'المؤشر' : 'Metric', isRTL ? 'القيمة' : 'Value'];
              const rows = [
                [isRTL ? 'إجمالي المستخدمين' : 'Total Users', users.length],
                [isRTL ? 'المستخدمين النشطين الآن' : 'Active Users Now', onlineUsersCount],
                [isRTL ? 'المشتركين المدفوعين' : 'Paid Subscribers', paidUsersCount],
                [isRTL ? 'الفترة التجريبية النشطة' : 'Active Trials', activeTrialCount],
                [isRTL ? 'الفترة التجريبية المنتهية' : 'Expired Trials', expiredTrialCount],
                [isRTL ? 'إجمالي المبيعات المحصلة' : 'Total Revenue', `${totalSalesAmount} EGP`],
                [isRTL ? 'متوسط قيمة العملية' : 'Average Order Value', `${avgSaleAmount} EGP`],
                [isRTL ? 'باقة ستارتر' : 'Starter Plan Users', starterCount],
                [isRTL ? 'باقة جروث' : 'Growth Plan Users', growthCount],
                [isRTL ? 'باقة برو' : 'Pro Plan Users', proCount],
                [isRTL ? 'الباقات المخصصة' : 'Custom/Enterprise Users', customCount],
              ];

              const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
                + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `executive_platform_report_${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            };

            const now = new Date();
            const arabicMonths = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
            const englishMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthNames = isRTL ? arabicMonths : englishMonths;

            const computedGrowth = [];
            for (let i = 6; i >= 0; i--) {
              const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
              const targetYear = d.getFullYear();
              const targetMonth = d.getMonth();

              const count = users.filter(u => {
                const uDate = getUserCreatedDate(u);
                if (!uDate) return false;
                return uDate.getFullYear() === targetYear && uDate.getMonth() === targetMonth;
              }).length;

              computedGrowth.push({
                name: monthNames[targetMonth],
                value: count
              });
            }

            const totalCounted = computedGrowth.reduce((a, b) => a + b.value, 0);
            if (totalCounted === 0 && users.length > 0) {
              computedGrowth[computedGrowth.length - 1].value = users.length;
            }

            const activeGrowthList = computedGrowth.length ? computedGrowth : growthData;

            const executiveKpis = [
              { label: isRTL ? '👥 المشتركين بالمحافظة/الفترة' : 'Period Users', value: periodUsers.length.toString(), sub: isRTL ? `من إجمالي ${users.length} مستخدم مسجل` : `of ${users.length} total users`, icon: <Users size={18} />, color: 'var(--accent)' },
              { label: isRTL ? '🟢 نشطين الآن' : 'Active Online Now', value: onlineUsersCount.toString(), sub: isRTL ? 'يتفاعلون بالمنصة حالياً' : 'Online in last 5 mins', icon: <Zap size={18} />, color: 'var(--green)' },
              { label: isRTL ? '👑 الباقات المدفوعة' : 'Paid Subscribers', value: paidUsersCount.toString(), sub: isRTL ? 'اشتراكات سارية ومفعلة بالفترة' : 'Active Paid Subscriptions', icon: <Crown size={18} />, color: 'var(--purple)' },
              { label: isRTL ? '⏰ التجربة المجانية' : 'Active Trials', value: activeTrialCount.toString(), sub: isRTL ? 'في فترة التجربة المجانية بالفترة' : 'Users on Free Trial', icon: <Clock size={18} />, color: 'var(--amber)' },
              { label: isRTL ? '💰 مبيعات الفترة' : 'Period Revenue', value: `${totalSalesAmount} ${t('admin.currency')}`, sub: isRTL ? 'إجمالي الأرباح بالفترة المختارة' : 'Collected Sales in Period', icon: <DollarSign size={18} />, color: 'var(--green)' },
              { label: isRTL ? '📈 متوسط العملية' : 'Avg Order Value', value: `${avgSaleAmount} ${t('admin.currency')}`, sub: isRTL ? 'متوسط قيمة الاشتراك بالفترة' : 'Average Sale in Period', icon: <TrendingUp size={18} />, color: 'var(--accent)' },
              { label: isRTL ? '❌ التجارب المنتهية' : 'Expired Trials', value: expiredTrialCount.toString(), sub: isRTL ? 'تستدعي التواصل للتجديد' : 'Needs Follow-up', icon: <XCircle size={18} />, color: 'var(--red)' },
              { label: isRTL ? '⚡ حالة النظام والـ AI' : 'System Status', value: isRTL ? 'نشط 100%' : '100% Active', sub: isRTL ? 'جميع الخدمات تعمل بكفاءة' : 'All systems operational', icon: <CheckCircle size={18} />, color: 'var(--green)' },
            ];

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Date Filter Control Bar */}
                <div className="card flex-between" style={{ padding: '14px 20px', background: 'var(--bg2)', border: '1px solid var(--line)', margin: 0, flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={18} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text)' }}>
                      {isRTL ? '📅 تصفية الفترة الزمنية للإحصائيات:' : '📅 Filter Statistics Date Range:'}
                    </span>
                  </div>
                  {renderStatsDateRangeFilter()}
                </div>

                {/* KPI Grid */}
                <div className="grid-4" style={{ gap: '14px' }}>
                  {executiveKpis.map((kpi, i) => (
                    <div key={i} className="card" style={{ padding: '16px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: `3px solid ${kpi.color}`, marginBottom: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: '700' }}>{kpi.label}</span>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg3)', border: '1px solid var(--line2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color }}>
                          {kpi.icon}
                        </div>
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text)', fontFamily: 'var(--mono)', lineHeight: '1.2' }}>
                        {kpi.value}
                      </div>
                      <span style={{ fontSize: '10.5px', color: 'var(--text3)' }}>{kpi.sub}</span>
                    </div>
                  ))}
                </div>

                {/* Section 2: Charts & Plan Breakdown */}
                <div className="grid-2" style={{ gap: '20px' }}>
                  
                  {/* User Growth Chart */}
                  <div className="card" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)', margin: 0 }}>{t('admin.userGrowth') || 'User Growth'}</h3>
                        <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{isRTL ? 'معدل الانضمام والتفاعل الفعلي' : 'Real-time join rate'}</span>
                      </div>
                      <div className="badge badge-blue">{t('admin.last7Months')}</div>
                    </div>
                    <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '16px' }}>
                      {activeGrowthList.map((d, i) => {
                        const max = Math.max(...activeGrowthList.map(x => x.value)) || 1;
                        const h = (d.value / max) * 100;
                        return (
                          <div key={i} style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                            <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 'bold', marginBottom: '4px' }}>{d.value}</span>
                            <div style={{
                              width: '100%',
                              height: `${Math.max(h, 8)}%`,
                              background: i === activeGrowthList.length - 1 ? 'var(--accent)' : 'var(--bg4)',
                              borderRadius: '6px',
                              transition: 'height 0.8s ease',
                              boxShadow: i === activeGrowthList.length - 1 ? '0 0 15px rgba(236, 92, 49, 0.4)' : 'none'
                            }}></div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text3)', fontWeight: '700', borderTop: '1px solid var(--line)', paddingTop: '10px' }}>
                      {activeGrowthList.map((d, i) => <span key={i}>{d.name}</span>)}
                    </div>
                  </div>

                  {/* Plan Subscriptions Distribution */}
                  <div className="card" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)', margin: 0 }}>
                          {isRTL ? 'توزيع باقات الاشتراكات الحالية' : 'Current Subscriptions Distribution'}
                        </h3>
                        <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{isRTL ? 'نسبة كل باقة من إجمالي المستخدمين' : 'Share per subscription plan'}</span>
                      </div>
                      <Crown size={18} style={{ color: 'var(--purple)' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {[
                        { name: isRTL ? 'ستارتر (Starter)' : 'Starter', count: starterCount, pct: users.length ? Math.round((starterCount / users.length) * 100) : 0, color: 'var(--blue)' },
                        { name: isRTL ? 'جروث (Growth)' : 'Growth', count: growthCount, pct: users.length ? Math.round((growthCount / users.length) * 100) : 0, color: 'var(--accent)' },
                        { name: isRTL ? 'برو (Pro)' : 'Pro', count: proCount, pct: users.length ? Math.round((proCount / users.length) * 100) : 0, color: 'var(--purple)' },
                        { name: isRTL ? 'باقات مخصصة / مدى الحياة' : 'Custom / Lifetime', count: customCount, pct: users.length ? Math.round((customCount / users.length) * 100) : 0, color: 'var(--green)' }
                      ].map((plan, idx) => (
                        <div key={idx}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                            <span style={{ fontWeight: '700', color: 'var(--text)' }}>{plan.name}</span>
                            <span style={{ color: 'var(--text2)', fontWeight: 'bold' }}>{plan.count} {isRTL ? 'مشترك' : 'users'} ({plan.pct}%)</span>
                          </div>
                          <div style={{ height: '7px', background: 'var(--bg3)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ width: `${plan.pct}%`, height: '100%', background: plan.color, borderRadius: '10px', transition: 'width 0.6s ease' }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Section: Top 5 Active Users & Top 5 Newest Users with Pagination */}
                {(() => {
                  // Filter out empty/invalid user documents
                  const validPeriodUsers = periodUsers.filter(u => u && (u.email || u.name || u.displayName || u.userEmail || u.phoneNumber));

                  // 1. Top Active Users (sorted by time spent desc)
                  const sortedTopActiveUsers = [...validPeriodUsers].sort((a, b) => {
                    const statsA = getUserUsageStats(a);
                    const statsB = getUserUsageStats(b);
                    return statsB.timeSpent - statsA.timeSpent;
                  });
                  const topActivePerPage = 5;
                  const totalTopActivePages = Math.ceil(sortedTopActiveUsers.length / topActivePerPage) || 1;
                  const paginatedTopActive = sortedTopActiveUsers.slice((statsTopActivePage - 1) * topActivePerPage, statsTopActivePage * topActivePerPage);

                  // 2. Newest Users (sorted by created date desc)
                  const sortedNewestUsers = [...validPeriodUsers].sort((a, b) => {
                    const dateA = getJoinMs(a);
                    const dateB = getJoinMs(b);
                    return dateB - dateA;
                  });
                  const newestPerPage = 5;
                  const totalNewestPages = Math.ceil(sortedNewestUsers.length / newestPerPage) || 1;
                  const paginatedNewest = sortedNewestUsers.slice((statsNewestPage - 1) * newestPerPage, statsNewestPage * newestPerPage);

                  return (
                    <div className="grid-2" style={{ gap: '20px' }}>
                      
                      {/* Top 5 Most Active Users Card */}
                      <div className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                              🔥 {isRTL ? 'المستخدمين الأكثر استخداماً ونشاطاً' : 'Top Most Active Users'}
                            </h3>
                            <span style={{ fontSize: '11px', color: 'var(--text3)' }}>
                              {isRTL ? 'مرتبة حسـب إجمالي الوقت المستغرق والتفاعل' : 'Sorted by time spent & interaction'}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--accent)', background: 'rgba(236,92,49,0.1)', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                            Top 5
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {paginatedTopActive.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)', fontSize: '12px' }}>
                              {isRTL ? 'لا توجد بيانات مستخدمين حالياً' : 'No users data'}
                            </div>
                          ) : (
                            paginatedTopActive.map((user) => {
                              const uStats = getUserUsageStats(user);
                              const actStatus = getUserActivityStatus(user);
                              const userName = getUserDisplayName(user);
                              const userEmail = getUserEmailDisplay(user);

                              return (
                                <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg3)', borderRadius: '10px', border: '1px solid var(--line)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', color: 'var(--text)', flexShrink: 0 }}>
                                      {(userName.charAt(0) || 'U').toUpperCase()}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</span>
                                        <span style={{ fontSize: '9px', fontWeight: '800', padding: '1px 6px', borderRadius: '10px', color: actStatus.color, background: actStatus.bg }}>
                                          {actStatus.text}
                                        </span>
                                      </div>
                                      <span style={{ fontSize: '11px', color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail}</span>
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                                    <div style={{ textAlign: 'end' }}>
                                      <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--accent)' }}>
                                        ⏱️ {uStats.timeSpentFormatted}
                                      </div>
                                      <span style={{ fontSize: '9px', fontWeight: '700', color: uStats.classColor, background: uStats.classBg, padding: '1px 6px', borderRadius: '8px' }}>
                                        {isRTL ? uStats.classLabelAr : uStats.classLabelEn}
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleEditClick(user)}
                                      className="btn btn-ghost btn-sm"
                                      style={{ padding: '5px' }}
                                      title={isRTL ? 'تعديل المستخدم' : 'Edit User'}
                                    >
                                      <Edit3 size={13} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Pagination Bar */}
                        {totalTopActivePages > 1 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: '10px', marginTop: 'auto' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text3)' }}>
                              {isRTL ? `صفحة ${statsTopActivePage} من ${totalTopActivePages}` : `Page ${statsTopActivePage} of ${totalTopActivePages}`}
                            </span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                disabled={statsTopActivePage <= 1}
                                onClick={() => setStatsTopActivePage(prev => Math.max(prev - 1, 1))}
                                className="btn btn-ghost btn-sm"
                                style={{ fontSize: '11px', padding: '3px 8px', opacity: statsTopActivePage <= 1 ? 0.4 : 1 }}
                              >
                                {isRTL ? 'السابق' : 'Prev'}
                              </button>
                              <button
                                type="button"
                                disabled={statsTopActivePage >= totalTopActivePages}
                                onClick={() => setStatsTopActivePage(prev => Math.min(prev + 1, totalTopActivePages))}
                                className="btn btn-ghost btn-sm"
                                style={{ fontSize: '11px', padding: '3px 8px', opacity: statsTopActivePage >= totalTopActivePages ? 0.4 : 1 }}
                              >
                                {isRTL ? 'التالي' : 'Next'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Top 5 Newest Registered Users Card */}
                      <div className="card" style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                              🆕 {isRTL ? 'المستخدمين الجدد المضافين مؤخراً' : 'Newest Registered Users'}
                            </h3>
                            <span style={{ fontSize: '11px', color: 'var(--text3)' }}>
                              {isRTL ? 'أحدث المستخدمين المنضمين للمنصة حديثاً' : 'Latest users joined the platform'}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--green)', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                            Top 5
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {paginatedNewest.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)', fontSize: '12px' }}>
                              {isRTL ? 'لا توجد بيانات مستخدمين حالياً' : 'No users data'}
                            </div>
                          ) : (
                            paginatedNewest.map((user) => {
                              const relativeTime = getRelativeTimeStr(user);
                              const joinDate = formatJoinDate(user);
                              const userName = getUserDisplayName(user);
                              const userEmail = getUserEmailDisplay(user);

                              return (
                                <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg3)', borderRadius: '10px', border: '1px solid var(--line)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', color: 'var(--green)', flexShrink: 0 }}>
                                      {(userName.charAt(0) || 'U').toUpperCase()}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName}</span>
                                        <span style={{ fontSize: '9px', fontWeight: '800', padding: '1px 6px', borderRadius: '10px', background: 'rgba(16,185,129,0.12)', color: 'var(--green)' }}>
                                          🆕 {isRTL ? 'جديد' : 'NEW'}
                                        </span>
                                      </div>
                                      <span style={{ fontSize: '11px', color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail}</span>
                                    </div>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                                    <div style={{ textAlign: 'end' }}>
                                      <div style={{ fontSize: '11.5px', fontWeight: '800', color: 'var(--text)' }}>
                                        🕒 {relativeTime}
                                      </div>
                                      <span style={{ fontSize: '9.5px', color: 'var(--text3)' }}>
                                        {joinDate}
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleEditClick(user)}
                                      className="btn btn-ghost btn-sm"
                                      style={{ padding: '5px' }}
                                      title={isRTL ? 'تعديل المستخدم' : 'Edit User'}
                                    >
                                      <Edit3 size={13} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Pagination Bar */}
                        {totalNewestPages > 1 && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: '10px', marginTop: 'auto' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text3)' }}>
                              {isRTL ? `صفحة ${statsNewestPage} من ${totalNewestPages}` : `Page ${statsNewestPage} of ${totalNewestPages}`}
                            </span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                disabled={statsNewestPage <= 1}
                                onClick={() => setStatsNewestPage(prev => Math.max(prev - 1, 1))}
                                className="btn btn-ghost btn-sm"
                                style={{ fontSize: '11px', padding: '3px 8px', opacity: statsNewestPage <= 1 ? 0.4 : 1 }}
                              >
                                {isRTL ? 'السابق' : 'Prev'}
                              </button>
                              <button
                                type="button"
                                disabled={statsNewestPage >= totalNewestPages}
                                onClick={() => setStatsNewestPage(prev => Math.min(prev + 1, totalNewestPages))}
                                className="btn btn-ghost btn-sm"
                                style={{ fontSize: '11px', padding: '3px 8px', opacity: statsNewestPage >= totalNewestPages ? 0.4 : 1 }}
                              >
                                {isRTL ? 'التالي' : 'Next'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })()}

                {/* Section 3: Geographic Distribution & Platform Modules */}
                <div className="grid-2" style={{ gap: '20px' }}>
                  
                  {/* Geographic Distribution */}
                  <div className="card" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)', margin: 0 }}>
                          {isRTL ? '🌍 التوزيع الجغرافي للعملاء' : '🌍 Geographic Distribution'}
                        </h3>
                        <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{isRTL ? 'انتشار المستخدمين حسب الدول' : 'Users by country'}</span>
                      </div>
                      <Globe size={18} style={{ color: 'var(--blue)' }} />
                    </div>

                    {formattedCountries.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '20px', fontSize: '12px' }}>{t('admin.noPlatformData')}</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '220px', overflowY: 'auto' }}>
                        {formattedCountries.map((c, i) => (
                          <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                              <span style={{ fontWeight: '700', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '14px' }}>{c.flag}</span>
                                <span>{isRTL ? c.nameAr : c.nameEn}</span>
                              </span>
                              <span style={{ color: 'var(--text2)', fontWeight: 'bold' }}>{c.count} {isRTL ? 'عميل' : 'users'} ({c.pct}%)</span>
                            </div>
                            <div style={{ height: '6px', background: 'var(--bg3)', borderRadius: '10px', overflow: 'hidden' }}>
                              <div style={{ width: `${c.pct}%`, height: '100%', background: 'var(--accent)', borderRadius: '10px' }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Platform Modules Usage */}
                  <div className="card" style={{ margin: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)', margin: 0 }}>
                          {t('admin.platformDist') || 'Platform Distribution'}
                        </h3>
                        <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{isRTL ? 'توزيع الأنشطة حسب أقسام المنصة' : 'Engagement by section'}</span>
                      </div>
                      <Activity size={18} style={{ color: 'var(--orange)' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {platformStats.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: '12px', padding: '20px' }}>{t('admin.noPlatformData')}</div>
                      ) : platformStats.map((p, i) => (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                            <span style={{ fontWeight: '700', color: 'var(--text)' }}>{p.name}</span>
                            <span style={{ color: 'var(--text2)', fontWeight: 'bold' }}>{p.pct}%</span>
                          </div>
                          <div style={{ height: '6px', background: 'var(--bg3)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${p.pct}%`,
                              height: '100%',
                              background: i === 0 ? 'var(--accent)' : i === 1 ? 'var(--green)' : 'var(--purple)',
                              borderRadius: '10px'
                            }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Executive Report Download Action Card */}
                <div className="card flex-between" style={{ padding: '16px 20px', background: 'rgba(236, 92, 49, 0.05)', border: '1px solid rgba(236, 92, 49, 0.2)', margin: 0, flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      📥 {isRTL ? 'تصدير التقرير التنفيذي الشامل للمنصة' : 'Export Executive Platform Report'}
                    </h4>
                    <span style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px', display: 'block' }}>
                      {isRTL ? 'قم بتنزيل ملف CSV يحتوي على جميع البيانات والإحصائيات الحالية للاحتفاظ بها أو تحليلها' : 'Download a comprehensive CSV file of current platform metrics'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={exportExecutiveReport}
                    className="btn btn-primary btn-sm"
                    style={{ padding: '8px 16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={14} />
                    <span>{t('admin.downloadReport') || 'Download Full Report'}</span>
                  </button>
                </div>

                {/* Video Explanation Card */}
                <div className="card" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)', marginBottom: '4px' }}>
                        {t('admin.dashboardVideoTitle')}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: '600', margin: 0 }}>
                        {t('admin.dashboardVideoSubtitle')}
                      </p>
                    </div>
                  </div>
                  <video
                    src="/admin_dashboard_explaination.mp4"
                    controls
                    style={{
                      width: '100%',
                      borderRadius: '12px',
                      background: 'var(--bg)',
                      outline: 'none',
                      display: 'block'
                    }}
                  />
                </div>

              </div>
            );
          })()}
        </>
      ) : activeTab === 'sales' && userData?.role === 'admin' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
          {/* Pending Approvals Card */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--line)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Clock size={18} style={{ color: 'var(--amber)' }} />
                {t('branding.pendingApprovals')}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text3)', margin: '4px 0 0 0' }}>
                {t('branding.pendingApprovalsDesc')}
              </p>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--line)' }}>
                    <th style={{ padding: '12px 20px', textAlign: 'start', fontSize: '11px', color: 'var(--text2)', fontWeight: '700', textTransform: 'uppercase' }}>
                      {isRTL ? 'العميل' : 'Client / User'}
                    </th>
                    <th style={{ padding: '12px 20px', textAlign: 'start', fontSize: '11px', color: 'var(--text2)', fontWeight: '700', textTransform: 'uppercase' }}>
                      {isRTL ? 'طريقة الدفع' : 'Method'}
                    </th>
                    <th style={{ padding: '12px 20px', textAlign: 'start', fontSize: '11px', color: 'var(--text2)', fontWeight: '700', textTransform: 'uppercase' }}>
                      {isRTL ? 'المبلغ' : 'Amount'}
                    </th>
                    <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '11px', color: 'var(--text2)', fontWeight: '700', textTransform: 'uppercase' }}>
                      {isRTL ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPayments.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: 'var(--text3)', fontSize: '12px' }}>
                        {t('branding.noPendingApprovals')}
                      </td>
                    </tr>
                  ) : (
                    pendingPayments.map((pay) => (
                      <tr key={pay.id} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '12px 20px' }}>
                          <div style={{ fontWeight: '700', color: 'var(--text)' }}>{pay.userName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>{pay.userEmail}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px', fontFamily: 'var(--mono)' }}>
                            {pay.createdAt?.toDate 
                              ? pay.createdAt.toDate().toLocaleString(dateLocale)
                              : pay.createdAt ? new Date(pay.createdAt.seconds * 1000).toLocaleString(dateLocale) : '—'}
                          </div>
                        </td>
                        <td style={{ padding: '12px 20px', fontSize: '12px', fontWeight: '600', color: 'var(--text2)', textTransform: 'capitalize' }}>
                          {pay.paymentMethod === 'instapay' ? 'Instapay ⚡' : 'Vodafone Cash 📱'}
                        </td>
                        <td style={{ padding: '12px 20px', fontSize: '13px', fontWeight: '800', color: 'var(--text)', fontFamily: 'var(--mono)' }}>
                          {pay.amount} {pay.currency}
                        </td>
                        <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => { setSelectedReceiptUrl(pay.receiptUrl); setShowReceiptModal(true); }}
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--accent)', border: '1px solid rgba(59, 130, 246, 0.2)', background: 'rgba(59, 130, 246, 0.05)', fontSize: '12px', padding: '6px 12px' }}
                            >
                              {t('branding.viewReceipt')}
                            </button>
                            
                            <button
                              type="button"
                              disabled={processingPaymentId === pay.id}
                              onClick={() => handleApproveSubscription(pay)}
                              className="btn btn-primary btn-sm"
                              style={{ background: 'var(--green)', color: 'white', border: 'none', fontSize: '12px', padding: '6px 12px' }}
                            >
                              {processingPaymentId === pay.id ? '...' : t('branding.approve')}
                            </button>

                            <button
                              type="button"
                              disabled={processingPaymentId === pay.id}
                              onClick={() => handleRejectSubscription(pay)}
                              className="btn btn-sm"
                              style={{ background: 'rgba(239, 68, 68, 0.12)', color: 'var(--red)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '12px', padding: '6px 12px' }}
                            >
                              {processingPaymentId === pay.id ? '...' : t('branding.reject')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sales Record Card */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>{t('admin.salesRecord')}</h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                {renderDateRangeFilter()}
                <div style={{ position: 'relative', width: '200px' }}>
                  <Search size={14} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                  <input
                    className="form-control"
                    style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '30px', fontSize: '12px', padding: '6px 12px' }}
                    placeholder={t('admin.searchClient')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={exportSalesToCSV}
                  className="btn btn-ghost btn-sm"
                  title={isRTL ? 'تحميل سجل المبيعات كملف Excel / CSV' : 'Export sales table as Excel/CSV'}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: 'var(--green)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    padding: '6px 12px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    borderRadius: '8px'
                  }}
                >
                  <Download size={14} />
                  <span>{isRTL ? 'تصدير Excel' : 'Export Excel'}</span>
                </button>
                <div style={{ textAlign: 'start' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', fontWeight: '800' }}>{t('admin.totalSalesLabel')}</div>
                  <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--green)' }}>
                    {sales.filter(s => isDateInSelectedRange(s.createdAt)).reduce((acc, s) => acc + Number(s.amount), 0)} {t('admin.currency')}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--line)' }}>
                    <th style={{ padding: '16px 20px', textAlign: 'start', fontSize: '12px', color: 'var(--text2)' }}>{t('admin.clientCol')}</th>
                    <th style={{ padding: '16px 20px', textAlign: 'start', fontSize: '12px', color: 'var(--text2)' }}>{t('admin.amountCol')}</th>
                    <th style={{ padding: '16px 20px', textAlign: 'start', fontSize: '12px', color: 'var(--text2)' }}>{t('admin.dateCol')}</th>
                    <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '12px', color: 'var(--text2)' }}>{t('admin.actionCol')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.filter(s => (s.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) && isDateInSelectedRange(s.createdAt)).length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>{t('admin.noSalesFound')}</td>
                    </tr>
                  ) : (
                    sales.filter(s => (s.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) && isDateInSelectedRange(s.createdAt)).map(sale => (
                      <tr key={sale.id} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '16px 20px', fontWeight: '700' }}>{sale.customerName}</td>
                        <td style={{ padding: '16px 20px', color: 'var(--green)', fontWeight: '800' }}>{sale.amount} {t('admin.currency')}</td>
                        <td style={{ padding: '16px 20px', color: 'var(--text2)', fontSize: '12px' }}>
                          {sale.createdAt?.toDate ? sale.createdAt.toDate().toLocaleDateString(dateLocale) : ''}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleEditSaleClick(sale)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--accent)', marginInlineEnd: '8px' }}
                            title={t('common.edit')}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSale(sale.id)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--red)' }}
                            title={t('common.delete')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transactions History */}
          <div className="card" style={{ padding: '0', overflow: 'hidden', marginTop: '24px' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>{t('branding.allPaymentsTitle') || 'All Payments History'}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text3)', margin: '4px 0 0 0' }}>{t('branding.allPaymentsDesc') || 'Track subscriber registration payments and activations.'}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                {renderDateRangeFilter()}
                <div style={{ position: 'relative', width: '200px' }}>
                  <Search size={14} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                  <input
                    className="form-control"
                    style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '30px', fontSize: '12px', padding: '6px 12px' }}
                    placeholder={t('branding.searchPaymentPlaceholder') || 'Search client...'}
                    value={paymentSearchTerm}
                    onChange={(e) => setPaymentSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="form-control"
                  style={{ width: '130px', fontSize: '12px', padding: '6px 12px' }}
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                >
                  <option value="all">{t('branding.filterAll') || 'All Statuses'}</option>
                  <option value="approved">{t('branding.filterApproved') || 'Approved'}</option>
                  <option value="pending">{t('branding.filterPending') || 'Pending'}</option>
                  <option value="rejected">{t('branding.filterRejected') || 'Rejected'}</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--line)' }}>
                    <th style={{ padding: '12px 20px', textAlign: 'start', fontSize: '11px', color: 'var(--text2)', fontWeight: '700', textTransform: 'uppercase' }}>
                      {isRTL ? 'العميل' : 'Client / User'}
                    </th>
                    <th style={{ padding: '12px 20px', textAlign: 'start', fontSize: '11px', color: 'var(--text2)', fontWeight: '700', textTransform: 'uppercase' }}>
                      {isRTL ? 'طريقة الدفع' : 'Method'}
                    </th>
                    <th style={{ padding: '12px 20px', textAlign: 'start', fontSize: '11px', color: 'var(--text2)', fontWeight: '700', textTransform: 'uppercase' }}>
                      {isRTL ? 'المبلغ' : 'Amount'}
                    </th>
                    <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '11px', color: 'var(--text2)', fontWeight: '700', textTransform: 'uppercase' }}>
                      {t('branding.statusCol') || 'Status'}
                    </th>
                    <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '11px', color: 'var(--text2)', fontWeight: '700', textTransform: 'uppercase' }}>
                      {t('branding.receiptCol') || 'Receipt'}
                    </th>
                    <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '11px', color: 'var(--text2)', fontWeight: '700', textTransform: 'uppercase' }}>
                      {isRTL ? 'التاريخ' : 'Date'}
                    </th>
                    <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '11px', color: 'var(--text2)', fontWeight: '700', textTransform: 'uppercase' }}>
                      {isRTL ? 'إجراءات معلقة' : 'Pending Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    if (filteredPayments.length === 0) {
                      return (
                        <tr>
                          <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'var(--text3)', fontSize: '12px' }}>
                            {t('branding.noPaymentsFound') || 'No payment records found.'}
                          </td>
                        </tr>
                      );
                    }

                    return paginatedSales.map((pay) => (
                      <tr key={pay.id} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '12px 20px' }}>
                          <div style={{ fontWeight: '700', color: 'var(--text)' }}>{pay.userName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>{pay.userEmail}</div>
                        </td>
                        <td style={{ padding: '12px 20px', fontSize: '12px', fontWeight: '600', color: 'var(--text2)', textTransform: 'capitalize' }}>
                          {pay.paymentMethod === 'stripe' ? 'Stripe 💳' : pay.paymentMethod === 'instapay' ? 'Instapay ⚡' : 'Vodafone Cash 📱'}
                        </td>
                        <td style={{ padding: '12px 20px', fontSize: '13px', fontWeight: '800', color: 'var(--text)', fontFamily: 'var(--mono)' }}>
                          {pay.amount} {pay.currency}
                        </td>
                        <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                          <span style={{
                            fontSize: '10px',
                            padding: '4px 10px',
                            background: pay.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : pay.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: pay.status === 'approved' ? 'var(--green)' : pay.status === 'pending' ? 'var(--amber)' : 'var(--red)',
                            border: `1px solid ${pay.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : pay.status === 'pending' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                            borderRadius: '20px',
                            fontWeight: '700',
                            display: 'inline-block'
                          }}>
                            {pay.status === 'approved' ? (isRTL ? 'مقبول' : 'Approved') : pay.status === 'pending' ? (isRTL ? 'معلق' : 'Pending') : (isRTL ? 'مرفوض' : 'Rejected')}
                          </span>
                        </td>
                        <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                          {pay.receiptUrl ? (
                            <button
                              type="button"
                              onClick={() => { setSelectedReceiptUrl(pay.receiptUrl); setShowReceiptModal(true); }}
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--accent)', border: '1px solid rgba(59, 130, 246, 0.2)', background: 'rgba(59, 130, 246, 0.05)', fontSize: '11px', padding: '4px 8px' }}
                            >
                              📷 {t('branding.viewReceipt')}
                            </button>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text3)' }}>
                              {pay.paymentMethod === 'stripe' ? (isRTL ? 'دفع إلكتروني' : 'Online Payment') : '—'}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px 20px', textAlign: 'center', fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
                          {pay.createdAt?.toDate 
                            ? pay.createdAt.toDate().toLocaleString(dateLocale)
                            : pay.createdAt ? new Date(pay.createdAt.seconds * 1000).toLocaleString(dateLocale) : '—'}
                        </td>
                        <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                          {pay.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                              <button
                                type="button"
                                disabled={processingPaymentId === pay.id}
                                onClick={() => handleApproveSubscription(pay)}
                                className="btn btn-primary btn-sm"
                                style={{ background: 'var(--green)', color: 'white', border: 'none', fontSize: '11px', padding: '4px 8px' }}
                              >
                                {processingPaymentId === pay.id ? '...' : t('branding.approve')}
                              </button>
                              <button
                                type="button"
                                disabled={processingPaymentId === pay.id}
                                onClick={() => handleRejectSubscription(pay)}
                                className="btn btn-sm"
                                style={{ background: 'rgba(239, 68, 68, 0.12)', color: 'var(--red)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '11px', padding: '4px 8px' }}
                              >
                                {processingPaymentId === pay.id ? '...' : t('branding.reject')}
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{isRTL ? 'مكتمل' : 'Finalized'}</span>
                          )}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            {/* Sales Pagination Controls */}
            {filteredPayments.length > 0 && (
              <div style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderTop: '1px solid var(--line)',
                background: 'var(--bg2)',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ fontSize: '13px', color: 'var(--text3)' }}>
                  {isRTL
                    ? `عرض ${(salesPage - 1) * SALES_PER_PAGE + 1} - ${Math.min(salesPage * SALES_PER_PAGE, filteredPayments.length)} من إجمالي ${filteredPayments.length} عملية دفع`
                    : `Showing ${(salesPage - 1) * SALES_PER_PAGE + 1}-${Math.min(salesPage * SALES_PER_PAGE, filteredPayments.length)} of ${filteredPayments.length} transactions`}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    disabled={salesPage <= 1}
                    onClick={() => setSalesPage(prev => Math.max(prev - 1, 1))}
                    className="btn btn-ghost btn-sm"
                    style={{ opacity: salesPage <= 1 ? 0.4 : 1, cursor: salesPage <= 1 ? 'not-allowed' : 'pointer' }}
                  >
                    {isRTL ? 'السابق' : 'Previous'}
                  </button>

                  {Array.from({ length: totalSalesPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalSalesPages || Math.abs(p - salesPage) <= 1)
                    .map((p, i, arr) => (
                      <React.Fragment key={p}>
                        {i > 0 && arr[i - 1] !== p - 1 && (
                          <span style={{ fontSize: '12px', color: 'var(--text3)', padding: '0 4px' }}>...</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setSalesPage(p)}
                          className="btn btn-ghost btn-sm"
                          style={{
                            fontWeight: salesPage === p ? '800' : '500',
                            background: salesPage === p ? 'var(--orange)' : 'transparent',
                            color: salesPage === p ? '#fff' : 'var(--text2)',
                            borderRadius: '8px',
                            minWidth: '32px',
                            height: '32px',
                            padding: '0'
                          }}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    ))}

                  <button
                    type="button"
                    disabled={salesPage >= totalSalesPages}
                    onClick={() => setSalesPage(prev => Math.min(prev + 1, totalSalesPages))}
                    className="btn btn-ghost btn-sm"
                    style={{ opacity: salesPage >= totalSalesPages ? 0.4 : 1, cursor: salesPage >= totalSalesPages ? 'not-allowed' : 'pointer' }}
                  >
                    {isRTL ? 'التالي' : 'Next'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'plans' && userData?.role === 'admin' ? (
        <PlansSettingsPage />
      ) : activeTab === 'branding' && userData?.role === 'admin' ? (
        <BrandingSettings />
      ) : activeTab === 'payments' && userData?.role === 'admin' ? (
        <PaymentSettingsPage />
      ) : activeTab === 'ai' && userData?.role === 'admin' ? (
        <AiSettingsPage />
      ) : activeTab === 'tracking' && userData?.role === 'admin' ? (
        <TrackingSettingsPage />
      ) : activeTab === 'outreach' && userData?.role === 'admin' ? (
        <OutreachPage isRTL={isRTL} users={users} />
      ) : activeTab === 'domains' && userData?.role === 'admin' ? (
        <DomainsPage isRTL={isRTL} />
      ) : activeTab === 'support' && userData?.role === 'admin' ? (
        <AdminSupportTab isRTL={isRTL} t={t} />
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '24px' }}>
          {/* Summary Stats Bar (Dynamically updated based on Date, Role Category, & Activity Filters) */}
          {(() => {
            const dateFilteredUsers = users.filter(u => {
              if (!isDateInSelectedRange(getUserCreatedDate(u), dateRangePreset, startDate, endDate)) return false;
              if (roleCategoryFilter !== 'all') {
                const catKey = getUserCategory(u).key;
                if (catKey !== roleCategoryFilter) return false;
              }
              if (activityFilter !== 'all' && activityFilter !== 'time_desc') {
                if (activityFilter === 'new_users') return isUserNew(u);
                if (activityFilter === 'active_trial') {
                  const trialDet = getTrialStatusDetailed(u);
                  return trialDet && (trialDet.type === 'trial_active' || trialDet.type === 'starter') && !trialDet.expired;
                }
                if (activityFilter === 'expired_trial') {
                  const trialDet = getTrialStatusDetailed(u);
                  return trialDet && (trialDet.type === 'trial_expired' || trialDet.expired === true);
                }
                if (activityFilter === 'paid') {
                  const trialDet = getTrialStatusDetailed(u);
                  return trialDet && (trialDet.type === 'paid_active' || trialDet.type === 'lifetime' || (u.planName && u.planName !== 'Starter' && u.planName !== 'Free Trial'));
                }
                const uStats = getUserUsageStats(u);
                if (uStats.classification !== activityFilter) return false;
              }
              return true;
            });

            const isFiltered = dateRangePreset !== 'all' || roleCategoryFilter !== 'all' || (activityFilter !== 'all' && activityFilter !== 'time_desc') || (searchTerm && searchTerm.trim());
            const displayList = isFiltered ? (filteredUsers.length > 0 || searchTerm ? filteredUsers : dateFilteredUsers) : users;

            const totalCount = displayList.length;
            const newCount = displayList.filter(u => isUserNew(u)).length;
            const activeTrialCount = displayList.filter(u => {
              const trialDet = getTrialStatusDetailed(u);
              return trialDet && (trialDet.type === 'trial_active' || trialDet.type === 'starter') && !trialDet.expired;
            }).length;
            const expiredTrialCount = displayList.filter(u => {
              const trialDet = getTrialStatusDetailed(u);
              return trialDet && (trialDet.type === 'trial_expired' || trialDet.expired === true);
            }).length;
            const paidCount = displayList.filter(u => {
              const st = getTrialStatusDetailed(u);
              return st && (st.type === 'paid_active' || st.type === 'lifetime' || (u.planName && u.planName !== 'Starter' && u.planName !== 'Free Trial'));
            }).length;

            return (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '10px',
                padding: '16px 20px',
                background: 'rgba(255,255,255,0.015)',
                borderBottom: '1px solid var(--line)'
              }}>
                <div style={{ background: 'var(--bg3)', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '700' }}>
                    {isRTL ? (isFiltered ? '👥 مستخدمي الفلتر' : '👥 إجمالي المستخدمين') : (isFiltered ? '👥 Filter Users' : '👥 Total Users')}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)', marginTop: '2px' }}>{totalCount}</div>
                </div>
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--green)', fontWeight: '700' }}>{isRTL ? '🆕 جدد (آخر 48h)' : '🆕 New (48h)'}</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--green)', marginTop: '2px' }}>{newCount}</div>
                </div>
                <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--amber)', fontWeight: '700' }}>{isRTL ? '⏰ تجربة مجانية نشطة' : '⏰ Active Trial'}</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--amber)', marginTop: '2px' }}>{activeTrialCount}</div>
                </div>
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--red)', fontWeight: '700' }}>{isRTL ? '❌ تجربة منتهية' : '❌ Expired Trial'}</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--red)', marginTop: '2px' }}>{expiredTrialCount}</div>
                </div>
                <div style={{ background: 'rgba(168, 85, 247, 0.08)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--purple)', fontWeight: '700' }}>{isRTL ? '👑 باقات مدفوعة' : '👑 Paid Plans'}</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--purple)', marginTop: '2px' }}>{paidCount}</div>
                </div>
              </div>
            );
          })()}

          <div className="flex-responsive" style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', whiteSpace: 'nowrap' }}>{t('admin.myUsersTitle') || 'My Users List'}</h3>
            <div style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '920px', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
              {renderDateRangeFilter()}
              <select
                className="form-control"
                style={{ width: 'auto', minWidth: '130px', cursor: 'pointer', fontSize: '12px', padding: '6px 12px' }}
                value={roleCategoryFilter}
                onChange={(e) => setRoleCategoryFilter(e.target.value)}
              >
                <option value="all">{isRTL ? 'جميع الفئات' : 'All Categories'}</option>
                <option value="user">{isRTL ? '👤 مستخدمين عاديين' : '👤 Regular Users'}</option>
                <option value="team">{isRTL ? '👥 ضمن الفريق' : '👥 Team Members'}</option>
              </select>
              <select
                className="form-control"
                style={{ width: 'auto', minWidth: '170px', cursor: 'pointer', fontSize: '12px', padding: '6px 12px' }}
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
              >
                <option value="all">{isRTL ? 'جميع الحالات والأنشطة' : 'All Statuses & Activity'}</option>
                <option value="new_users">{isRTL ? '🆕 جدد مؤخراً (آخر 48 ساعة)' : '🆕 New Users (Last 48h)'}</option>
                <option value="active_trial">{isRTL ? '⏰ فترة تجريبية نشطة' : '⏰ Active Trial'}</option>
                <option value="expired_trial">{isRTL ? '❌ تجربة منتهية' : '❌ Expired Trial'}</option>
                <option value="paid">{isRTL ? '👑 باقات مدفوعة' : '👑 Paid Subscribers'}</option>
                <option value="time_desc">{isRTL ? 'الأكثر نشاطاً (الأعلى وقتاً)' : 'Most Active Users (Top Time)'}</option>
                <option value="power">{isRTL ? 'العملاء الخارقين (Power Users)' : 'Power Users only'}</option>
                <option value="active">{isRTL ? 'العملاء النشطين (Active)' : 'Active Users only'}</option>
                <option value="moderate">{isRTL ? 'العملاء المتوسطين (Moderate)' : 'Moderate Users only'}</option>
                <option value="inactive">{isRTL ? 'العملاء غير النشطين (Inactive)' : 'Inactive Users only'}</option>
              </select>
              <div style={{ position: 'relative', width: '180px' }}>
                <Search size={14} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input
                  className="form-control"
                  style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '30px', fontSize: '12px', padding: '6px 12px' }}
                  placeholder={t('admin.searchUser') || 'Search email/name/phone...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={exportUsersToCSV}
                className="btn btn-ghost btn-sm"
                title={isRTL ? 'تحميل جدول المستخدمين كملف Excel / CSV' : 'Export users table as Excel/CSV'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: 'var(--green)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  padding: '6px 12px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  borderRadius: '8px'
                }}
              >
                <Download size={14} />
                <span>{isRTL ? 'تصدير Excel' : 'Export Excel'}</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="loader"></div></div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="table-responsive desktop-only-table">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--line)' }}>
                      <th style={{ padding: '16px 20px', textAlign: 'start', fontSize: '12px', color: 'var(--text2)' }}>{t('admin.userCol') || 'User'}</th>
                      <th style={{ padding: '16px 20px', textAlign: 'start', fontSize: '12px', color: 'var(--text2)' }}>{isRTL ? 'حالة الاشتراك والفترة التجريبية' : 'Subscription & Trial Status'}</th>
                      <th style={{ padding: '16px 20px', textAlign: 'start', fontSize: '12px', color: 'var(--text2)' }}>{t('admin.phoneCol') || 'Phone'}</th>
                      <th style={{ padding: '16px 20px', textAlign: 'start', fontSize: '12px', color: 'var(--text2)' }}>{isRTL ? 'تاريخ الانضمام' : 'Join Date'}</th>
                      <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '12px', color: 'var(--text2)' }}>{t('admin.operationsCol') || 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>{t('admin.noUsers') || 'No users found.'}</td>
                      </tr>
                    ) : (
                      paginatedUsers.map(user => {
                        const uStats = getUserUsageStats(user);
                        const trialDet = getTrialStatusDetailed(user);
                        const actStatus = getUserActivityStatus(user);
                        const catInfo = getUserCategory(user);
                        const isNew = isUserNew(user);
                        const relativeTime = getRelativeTimeStr(user);
                        const displayName = getUserDisplayName(user);
                        const displayEmail = getUserEmailDisplay(user);
                        const cleanPhone = (user.phoneNumber || '').replace(/[^0-9+]/g, '');

                        return (
                          <tr key={user.id} style={{ borderBottom: '1px solid var(--line)' }}>
                            <td style={{ padding: '16px 20px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg4)', borderRadius: '50%', fontWeight: '700' }}>
                                  {(displayName.charAt(0) || 'U').toUpperCase()}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '14px', fontWeight: '700' }}>{displayName}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleUserCategory(user)}
                                      title={isRTL ? 'انقر لتغيير الفئة (ضمن الفريق / مستخدم عادي)' : 'Click to toggle category'}
                                      style={{
                                        fontSize: '9.5px',
                                        fontWeight: '800',
                                        padding: '1px 8px',
                                        borderRadius: '12px',
                                        color: catInfo.color,
                                        background: catInfo.bg,
                                        border: `1px solid ${catInfo.border}`,
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                      }}
                                    >
                                      {isRTL ? catInfo.labelAr : catInfo.labelEn}
                                    </button>
                                    <span style={{
                                      fontSize: '9.5px',
                                      fontWeight: '800',
                                      padding: '1px 7px',
                                      borderRadius: '12px',
                                      color: actStatus.color,
                                      background: actStatus.bg,
                                      border: `1px solid ${actStatus.color}33`,
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {actStatus.text}
                                    </span>
                                    {isNew && (
                                      <span style={{
                                        background: 'rgba(16, 185, 129, 0.15)',
                                        color: 'var(--green)',
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                        padding: '1px 7px',
                                        borderRadius: '12px',
                                        fontSize: '10px',
                                        fontWeight: '800',
                                        whiteSpace: 'nowrap'
                                      }}>
                                        🆕 {isRTL ? 'جديد' : 'NEW'}
                                      </span>
                                    )}
                                  </div>
                                  <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{displayEmail}</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 'bold' }}>
                                      🤖 {(() => {
                                        const val = user.aiCredits !== undefined ? Number(user.aiCredits) : globalDefaultCredits;
                                        return Math.round(val);
                                      })()} cr
                                    </span>
                                    <span style={{
                                      fontSize: '9px',
                                      fontWeight: '700',
                                      padding: '1px 6px',
                                      borderRadius: '12px',
                                      color: uStats.classColor,
                                      background: uStats.classBg,
                                      border: `1px solid ${uStats.classColor}33`,
                                      display: 'inline-block'
                                    }}>
                                      {isRTL ? uStats.classLabelAr : uStats.classLabelEn}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                                <span style={{
                                  background: trialDet.type === 'trial_active' ? 'rgba(245,158,11,0.12)' : trialDet.type === 'trial_expired' ? 'rgba(239,68,68,0.12)' : 'rgba(168,85,247,0.12)',
                                  color: trialDet.type === 'trial_active' ? '#f59e0b' : trialDet.type === 'trial_expired' ? 'var(--red)' : 'var(--purple)',
                                  border: `1px solid ${trialDet.type === 'trial_active' ? 'rgba(245,158,11,0.25)' : trialDet.type === 'trial_expired' ? 'rgba(239,68,68,0.25)' : 'rgba(168,85,247,0.25)'}`,
                                  padding: '4px 12px',
                                  borderRadius: '20px',
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {trialDet.text}
                                </span>
                                <div style={{ fontSize: '10px', color: (user.devices?.length || 0) >= 2 ? 'var(--amber)' : 'var(--text3)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <Smartphone size={9} />
                                  {t('admin.devicesCount', { count: user.devices?.length || 0 }) || `Devices: ${user.devices?.length || 0}`}
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ color: 'var(--text2)', fontSize: '13px', direction: 'ltr', textAlign: isRTL ? 'right' : 'left' }}>
                                  {user.phoneNumber || '—'}
                                </span>
                                {cleanPhone && (
                                  <a
                                    href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-ghost btn-sm"
                                    style={{
                                      color: '#25D366',
                                      background: 'rgba(37, 211, 102, 0.1)',
                                      border: '1px solid rgba(37, 211, 102, 0.25)',
                                      padding: '2px 8px',
                                      fontSize: '11px',
                                      borderRadius: '12px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      width: 'fit-content',
                                      textDecoration: 'none'
                                    }}
                                  >
                                    💬 {isRTL ? 'واتساب' : 'WhatsApp'}
                                  </a>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '16px 20px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)' }}>
                                  {relativeTime}
                                </span>
                                <span style={{ fontSize: '11px', color: 'var(--text3)' }}>
                                  {formatJoinDate(user)}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => setSelectedAnalysisUser(user)}
                                className="btn btn-ghost btn-sm"
                                title={isRTL ? 'تحليل سلوك العميل' : 'Client Behavior Analysis'}
                                style={{ padding: '6px', color: 'var(--accent)' }}
                              >
                                <BarChart3 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEditClick(user)}
                                className="btn btn-ghost btn-sm"
                                title={t('common.edit') || 'Edit'}
                                style={{ padding: '6px' }}
                              >
                                <Edit3 size={14} />
                              </button>
                              {!user.isTrial && (
                                <button
                                  type="button"
                                  onClick={() => handleResetDevices(user.id)}
                                  className="btn btn-ghost btn-sm"
                                  title={`${t('admin.resetDevicesTitle') || 'Reset Devices'} (${user.devices?.length || 0}/2)`}
                                  style={{ padding: '6px', color: 'var(--amber)' }}
                                >
                                  <Smartphone size={14} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setUserToDelete(user)}
                                className="btn btn-ghost btn-sm"
                                title={t('common.delete') || 'Delete'}
                                style={{ padding: '6px', color: 'var(--red)' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="mobile-only-cards">
                {filteredUsers.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text3)' }}>
                    {t('admin.noUsers') || 'No users found.'}
                  </div>
                ) : (
                  paginatedUsers.map(user => {
                    const uStats = getUserUsageStats(user);
                    const trialDet = getTrialStatusDetailed(user);
                    const actStatus = getUserActivityStatus(user);
                    const catInfo = getUserCategory(user);
                    const isNew = isUserNew(user);
                    const relativeTime = getRelativeTimeStr(user);
                    const name = getUserDisplayName(user);
                    const email = getUserEmailDisplay(user);
                    const phone = user.phoneNumber || '—';
                    const cleanPhone = (user.phoneNumber || '').replace(/[^0-9+]/g, '');
                    const joinedDate = formatJoinDate(user);
                    
                    return (
                      <div key={user.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', margin: 0, border: '1px solid var(--line)', background: 'var(--bg2)' }}>
                        {/* Header: Avatar, Name, Email, Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="user-avatar" style={{ width: '36px', height: '36px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg4)', borderRadius: '50%', fontWeight: '700' }}>
                            {(name.charAt(0) || 'U').toUpperCase()}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
                              <button
                                type="button"
                                onClick={() => handleToggleUserCategory(user)}
                                title={isRTL ? 'انقر لتغيير الفئة (ضمن الفريق / مستخدم عادي)' : 'Click to toggle category'}
                                style={{
                                  fontSize: '9.5px',
                                  fontWeight: '800',
                                  padding: '1px 8px',
                                  borderRadius: '12px',
                                  color: catInfo.color,
                                  background: catInfo.bg,
                                  border: `1px solid ${catInfo.border}`,
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {isRTL ? catInfo.labelAr : catInfo.labelEn}
                              </button>
                              <span style={{
                                fontSize: '9.5px',
                                fontWeight: '800',
                                padding: '1px 7px',
                                borderRadius: '12px',
                                color: actStatus.color,
                                background: actStatus.bg,
                                border: `1px solid ${actStatus.color}33`,
                                whiteSpace: 'nowrap'
                              }}>
                                {actStatus.text}
                              </span>
                              {isNew && (
                                <span style={{
                                  background: 'rgba(16, 185, 129, 0.15)',
                                  color: 'var(--green)',
                                  border: '1px solid rgba(16, 185, 129, 0.3)',
                                  padding: '1px 6px',
                                  borderRadius: '10px',
                                  fontSize: '9px',
                                  fontWeight: '800',
                                  flexShrink: 0
                                }}>
                                  🆕 {isRTL ? 'جديد' : 'NEW'}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</span>
                          </div>
                          <span style={{
                            fontSize: '9px',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            color: uStats.classColor,
                            background: uStats.classBg,
                            border: `1px solid ${uStats.classColor}33`,
                            flexShrink: 0
                          }}>
                            {isRTL ? uStats.classLabelAr : uStats.classLabelEn}
                          </span>
                        </div>

                        {/* Divider */}
                        <div style={{ height: '1px', background: 'var(--line)' }} />

                        {/* Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text3)' }}>{t('admin.statusCode') || 'Subscription'}:</span>
                            <span style={{
                              background: trialDet.type === 'trial_active' ? 'rgba(245,158,11,0.12)' : trialDet.type === 'trial_expired' ? 'rgba(239,68,68,0.12)' : 'rgba(168,85,247,0.12)',
                              color: trialDet.type === 'trial_active' ? '#f59e0b' : trialDet.type === 'trial_expired' ? 'var(--red)' : 'var(--purple)',
                              border: `1px solid ${trialDet.type === 'trial_active' ? 'rgba(245,158,11,0.25)' : trialDet.type === 'trial_expired' ? 'rgba(239,68,68,0.25)' : 'rgba(168,85,247,0.25)'}`,
                              padding: '2px 10px',
                              borderRadius: '16px',
                              fontSize: '11px',
                              fontWeight: '800'
                            }}>
                              {trialDet.text}
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text3)' }}>{isRTL ? 'رصيد الذكاء الاصطناعي:' : 'AI Credits:'}</span>
                            <span style={{ color: 'var(--accent)', fontWeight: '700' }}>
                              🤖 {(() => {
                                const val = user.aiCredits !== undefined ? Number(user.aiCredits) : globalDefaultCredits;
                                return Math.round(val);
                              })()} cr
                            </span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text3)' }}>{t('admin.phoneCol') || 'Phone'}:</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ color: 'var(--text2)', direction: 'ltr' }}>{phone}</span>
                              {cleanPhone && (
                                <a
                                  href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: '#25D366',
                                    background: 'rgba(37, 211, 102, 0.1)',
                                    border: '1px solid rgba(37, 211, 102, 0.25)',
                                    padding: '1px 6px',
                                    fontSize: '10px',
                                    borderRadius: '10px',
                                    textDecoration: 'none',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  💬 واتساب
                                </a>
                              )}
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text3)' }}>{t('admin.joinDateCol') || 'Joined'}:</span>
                            <span style={{ color: 'var(--text)', fontWeight: '700' }}>{relativeTime} <span style={{ fontSize: '10px', color: 'var(--text3)', fontWeight: 'normal' }}>({joinedDate})</span></span>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text3)' }}>{isRTL ? 'الأجهزة المتصلة:' : 'Connected Devices:'}</span>
                            <span style={{ color: (user.devices?.length || 0) >= 2 ? 'var(--amber)' : 'var(--text2)', fontWeight: '600' }}>
                              {user.devices?.length || 0} / 2
                            </span>
                          </div>
                        </div>

                        {/* Divider */}
                        <div style={{ height: '1px', background: 'var(--line)' }} />

                        {/* Actions */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedAnalysisUser(user)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--accent)', padding: '6px 10px', border: '1px solid rgba(236,92,49,0.15)', background: 'rgba(236,92,49,0.03)', gap: '4px' }}
                          >
                            <BarChart3 size={12} />
                            <span style={{ fontSize: '11px' }}>{isRTL ? 'التحليلات' : 'Analytics'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditClick(user)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--text)', padding: '6px 10px', border: '1px solid var(--line)', background: 'rgba(255,255,255,0.02)', gap: '4px' }}
                          >
                            <Edit3 size={12} />
                            <span style={{ fontSize: '11px' }}>{t('common.edit') || 'Edit'}</span>
                          </button>
                          {!user.isTrial && (
                            <button
                              type="button"
                              onClick={() => handleResetDevices(user.id)}
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--amber)', padding: '6px 10px', border: '1px solid rgba(245,158,11,0.15)', background: 'rgba(245,158,11,0.03)', gap: '4px' }}
                            >
                              <Smartphone size={12} />
                              <span style={{ fontSize: '11px' }}>{isRTL ? 'تصفير' : 'Reset'}</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setUserToDelete(user)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--red)', padding: '6px 10px', border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.03)', gap: '4px' }}
                          >
                            <Trash2 size={12} />
                            <span style={{ fontSize: '11px' }}>{t('common.delete') || 'Delete'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination Controls */}
              {filteredUsers.length > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  borderTop: '1px solid var(--line)',
                  background: 'var(--bg2)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '13px', color: 'var(--text3)' }}>
                    {isRTL
                      ? `عرض ${(userPage - 1) * USERS_PER_PAGE + 1} - ${Math.min(userPage * USERS_PER_PAGE, filteredUsers.length)} من إجمالي ${filteredUsers.length} مستخدم`
                      : `Showing ${(userPage - 1) * USERS_PER_PAGE + 1}-${Math.min(userPage * USERS_PER_PAGE, filteredUsers.length)} of ${filteredUsers.length} users`}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      disabled={userPage <= 1}
                      onClick={() => setUserPage(prev => Math.max(prev - 1, 1))}
                      className="btn btn-ghost btn-sm"
                      style={{ opacity: userPage <= 1 ? 0.4 : 1, cursor: userPage <= 1 ? 'not-allowed' : 'pointer' }}
                    >
                      {isRTL ? 'السابق' : 'Previous'}
                    </button>

                    {Array.from({ length: totalUserPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalUserPages || Math.abs(p - userPage) <= 1)
                      .map((p, i, arr) => (
                        <React.Fragment key={p}>
                          {i > 0 && arr[i - 1] !== p - 1 && <span style={{ color: 'var(--text3)', fontSize: '12px' }}>...</span>}
                          <button
                            type="button"
                            onClick={() => setUserPage(p)}
                            className={`btn btn-sm ${userPage === p ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ minWidth: '32px', height: '32px', padding: '0 8px', fontSize: '12px' }}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      ))}

                    <button
                      type="button"
                      disabled={userPage >= totalUserPages}
                      onClick={() => setUserPage(prev => Math.min(prev + 1, totalUserPages))}
                      className="btn btn-ghost btn-sm"
                      style={{ opacity: userPage >= totalUserPages ? 0.4 : 1, cursor: userPage >= totalUserPages ? 'not-allowed' : 'pointer' }}
                    >
                      {isRTL ? 'التالي' : 'Next'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Client Analysis Modal */}
      {selectedAnalysisUser && (() => {
        const uStats = getUserUsageStats(selectedAnalysisUser);
        const name = selectedAnalysisUser.name || t('admin.newUser');
        const email = selectedAnalysisUser.email;
        const joinedDate = selectedAnalysisUser.createdAt?.toDate 
          ? selectedAnalysisUser.createdAt.toDate().toLocaleDateString(dateLocale) 
          : '';

        return (
          <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(8, 12, 20, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ width: '100%', maxWidth: '550px', margin: 0, padding: 0, overflow: 'hidden', animation: 'scaleUp 0.3s ease' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--line)', background: 'var(--bg3)' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <BarChart3 size={18} style={{ color: 'var(--accent)' }} />
                    {isRTL ? 'التحليل الشامل لسلوك العميل' : 'Comprehensive Client Analysis'}
                  </h3>
                  <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '2px' }}>{email}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAnalysisUser(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text2)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
                
                {/* Profile Brief */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg3)', padding: '14px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                  <div className="user-avatar" style={{ width: '42px', height: '42px', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg4)', borderRadius: '50%' }}>
                    {(name || email).charAt(0).toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)' }}>{name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{isRTL ? `تاريخ الانضمام: ${joinedDate}` : `Joined: ${joinedDate}`}</span>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    color: uStats.classColor,
                    background: uStats.classBg,
                    border: `1px solid ${uStats.classColor}22`
                  }}>
                    {isRTL ? uStats.classLabelAr : uStats.classLabelEn}
                  </span>
                </div>

                {/* Key KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  <div style={{ background: 'var(--bg3)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--line)', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '700', marginBottom: '4px' }}>
                      {isRTL ? 'الوقت المقضي' : 'Time Spent'}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)', fontFamily: 'var(--mono)' }}>
                      {uStats.timeSpent} {isRTL ? 'ساعة' : 'Hrs'}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(236, 92, 49, 0.08)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(236, 92, 49, 0.2)', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: '700', marginBottom: '4px' }}>
                      {isRTL ? 'الكريديت المستهلك' : 'Consumed Credits'}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--accent)', fontFamily: 'var(--mono)' }}>
                      {uStats.consumedCredits} cr
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg3)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--line)', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: '700', marginBottom: '4px' }}>
                      {isRTL ? 'العمليات المنجزة' : 'Tasks Completed'}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)', fontFamily: 'var(--mono)' }}>
                      {uStats.tasksCompleted} {isRTL ? 'عملية' : 'Tasks'}
                    </div>
                  </div>
                </div>

                {/* Section breakdown usage */}
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text)', marginBottom: '12px' }}>
                    {isRTL ? 'توزيع الاستخدام حسب الأقسام' : 'Usage Breakdown by Section'}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {uStats.sections.map((sec, sIdx) => (
                      <div key={sIdx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', fontWeight: '600' }}>
                          <span style={{ color: 'var(--text2)' }}>{isRTL ? sec.labelAr : sec.labelEn}</span>
                          <span style={{ color: 'var(--text)' }}>
                            {sec.hours} {isRTL ? 'ساعة' : 'hrs'} ({sec.pct}%)
                          </span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--bg)', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${sec.pct}%`,
                            height: '100%',
                            background: sIdx === 0 ? 'var(--accent)' : sIdx === 1 ? 'var(--purple)' : 'var(--green)',
                            borderRadius: '10px'
                          }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Behavioral Insight */}
                <div style={{ background: 'rgba(236, 92, 49, 0.04)', border: '1px dashed rgba(236, 92, 49, 0.2)', padding: '16px', borderRadius: '12px', marginTop: '4px' }}>
                  <h4 style={{ fontSize: '12.5px', fontWeight: '800', color: 'var(--accent)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ✨ {isRTL ? 'تحليل سلوك العميل وتوصيات التعامل' : 'Client Analysis & Retention Insights'}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: '1.6', margin: 0, textAlign: 'justify' }}>
                    {(() => {
                      if (uStats.classification === 'power') {
                        return isRTL
                          ? 'المستخدِم يعتمد بشكل مكثف على أدوات المنصة، خاصة نظام التسويق وCRM الذكي. سلوكه يشير إلى أنه عميل ذو قيمة عالية. نوصي بالتواصل الشخصي معه لتقديم دعم ذو أولوية وعرض ترقيات خاصة بالشبكات الإعلانية للحفاظ على ولائه للمنصة.'
                          : 'The user actively relies on the platform, especially Marketing OS and CRM. Behavioral patterns suggest a high-value customer. We recommend proactive communication, priority support, and showcasing integration options to maximize retention.';
                      } else if (uStats.classification === 'inactive') {
                        return isRTL
                          ? 'المستخدِم يظهر نشاطاً ضعيفاً جداً ولم يقم بإنشاء حملات أو مهام مؤخراً. هناك احتمالية لخطر إلغاء الاشتراك. نوصي بإرسال بريد إلكتروني ترحيبي تذكيري أو عرض جلسة إرشادية سريعة (Onboarding Session) لمساعدته في بدء استخدام المنصة وتفعيل حسابه.'
                          : 'The user has very low activity and hasn\'t created campaigns recently. There is a high churn risk. We recommend automated email reminders or offering a quick onboarding review session to trigger usage.';
                      } else {
                        return isRTL
                          ? 'استخدام العميل معتدل ومستقر، حيث يقسم وقته بين لوحة المهام ونظام التسويق. هذا يشير إلى تبني جيد للمنصة. نوصي بإرسال مقالات تعليمية وتلميحات دورية حول التحديثات الجديدة لمساعدته في استكشاف باقي الأدوات لزيادة تفاعله.'
                          : 'Usage is moderate and stable, distributed across task boards and marketing tools. Suggest sending educational tips and update notices to guide them towards exploring other core features.';
                      }
                    })()}
                  </p>
                </div>

              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 24px', borderTop: '1px solid var(--line)', background: 'var(--bg3)' }}>
                <button
                  type="button"
                  onClick={() => setSelectedAnalysisUser(null)}
                  className="btn"
                  style={{ background: 'var(--bg3)', border: '1px solid var(--line)', color: 'var(--text2)', padding: '8px 18px' }}
                >
                  {isRTL ? 'إغلاق' : 'Close'}
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="card" style={{ width: '95%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', margin: 'auto', animation: 'scaleUp 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>{t('admin.editUserTitle') || 'Edit User'}</h3>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{editingUser.email}</div>
            </div>
            {error && <div style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '15px' }}>{error}</div>}
            <form onSubmit={handleUpdateUser}>
              <div className="grid-2" style={{ gap: '12px', marginBottom: '12px' }}>
                <div className="field">
                  <label className="field-label">{t('admin.userNameLabel') || 'Full Name'}</label>
                  <input
                    className="form-control"
                    type="text"
                    required
                    value={editingUser.name || ''}
                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                    placeholder={t('common.fullName') || 'Full Name'}
                  />
                </div>
                <div className="field">
                  <label className="field-label">{isRTL ? 'البريد الإلكتروني' : 'Email Address'}</label>
                  <input
                    className="form-control"
                    type="email"
                    required
                    value={editingUser.email || ''}
                    onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              <div className="field" style={{ marginBottom: '12px' }}>
                <label className="field-label">{isRTL ? '🔑 تغيير كلمة المرور (اختياري)' : '🔑 Change Password (Optional)'}</label>
                <input
                  className="form-control"
                  type="password"
                  value={editingUser.newPassword || ''}
                  onChange={e => setEditingUser({ ...editingUser, newPassword: e.target.value })}
                  placeholder={isRTL ? 'اترك الحقل فارغاً للإبقاء على كلمة المرور الحالية' : 'Leave blank to keep current password'}
                  minLength={6}
                />
              </div>

              <div className="field" style={{ marginBottom: '12px' }}>
                <label className="field-label">{isRTL ? '🏷️ فئة الحساب والوسام (التاج)' : '🏷️ User Category Tag'}</label>
                <select
                  className="form-control"
                  value={editingUser.roleCategory || 'user'}
                  onChange={e => setEditingUser({ ...editingUser, roleCategory: e.target.value })}
                >
                  <option value="user">{isRTL ? '👤 مستخدم عادي (User)' : '👤 Regular User'}</option>
                  <option value="team">{isRTL ? '👥 ضمن الفريق (Team Member)' : '👥 Team Member'}</option>
                </select>
              </div>

              <div className="grid-2" style={{ gap: '12px', marginBottom: '12px' }}>
                <div className="field">
                  <label className="field-label">{t('common.country') || 'Country'}</label>
                  <select
                    className="form-control"
                    value={editingUser.country || 'EG'}
                    onChange={e => setEditingUser({ ...editingUser, country: e.target.value })}
                  >
                    <option value="EG">{isRTL ? 'مصر (EG)' : 'Egypt (EG)'}</option>
                    <option value="SA">{isRTL ? 'السعودية (SA)' : 'Saudi Arabia (SA)'}</option>
                    <option value="AE">{isRTL ? 'الإمارات (AE)' : 'UAE (AE)'}</option>
                    <option value="KW">{isRTL ? 'الكويت (KW)' : 'Kuwait (KW)'}</option>
                    <option value="QA">{isRTL ? 'قطر (QA)' : 'Qatar (QA)'}</option>
                    <option value="JO">{isRTL ? 'الأردن (JO)' : 'Jordan (JO)'}</option>
                    <option value="MA">{isRTL ? 'المغرب (MA)' : 'Morocco (MA)'}</option>
                    <option value="TN">{isRTL ? 'تونس (TN)' : 'Tunisia (TN)'}</option>
                    <option value="OTHER">{isRTL ? 'أخرى (OTHER)' : 'Other (OTHER)'}</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">{t('common.phoneNumber') || 'Phone Number'}</label>
                  <div style={{ position: 'relative' }}>
                    <span style={phoneSpanStyle}>
                      {countryData[editingUser.country || 'EG'].code}
                    </span>
                    <input
                      className="form-control"
                      type="text"
                      required
                      value={editingUser.phoneNumber}
                      onChange={e => setEditingUser({ ...editingUser, phoneNumber: e.target.value })}
                      placeholder={countryData[editingUser.country || 'EG'].placeholder}
                      style={phoneInputStyle}
                    />
                  </div>
                </div>
              </div>

              <div className="grid-2" style={{ gap: '12px', marginBottom: '12px' }}>
                <div className="field">
                  <label className="field-label">{t('common.subType') || 'Subscription'}</label>
                  <select
                    className="form-control"
                    value={editingUser.subscriptionType || 'months'}
                    disabled={!!editingUser.isTrial}
                    onChange={e => setEditingUser({ ...editingUser, subscriptionType: e.target.value, subscriptionDuration: e.target.value === 'lifetime' ? '' : '1' })}
                  >
                    <option value="days">{isRTL ? 'أيام' : 'Days'}</option>
                    <option value="months">{isRTL ? 'شهور' : 'Months'}</option>
                    <option value="lifetime">{isRTL ? 'مدى الحياة' : 'Lifetime'}</option>
                  </select>
                </div>
                
                <div className="field">
                  <label className="field-label">{t('admin.planNameLabel') || 'Plan Name'}</label>
                  <select
                    className="form-control"
                    value={(() => {
                      const p = (editingUser.planName || '').toLowerCase();
                      if (editingUser.isTrial || p === 'free trial' || p === 'free' || p.includes('مجاني') || p.includes('تجريب')) return 'free-trial';
                      if (['starter', 'growth', 'pro'].includes(p)) return p;
                      return 'custom';
                    })()}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === 'free-trial') {
                        const trialDays = String(tenantFreeTrial.days || 15);
                        const trialCredits = tenantFreeTrial.credits !== undefined ? Number(tenantFreeTrial.credits) : 500;
                        const trialTools = Array.isArray(tenantFreeTrial.allowedTools) && tenantFreeTrial.allowedTools.length
                          ? tenantFreeTrial.allowedTools
                          : AVAILABLE_TOOLS.map(t => t.key);
                        setEditingUser({
                          ...editingUser,
                          planName: 'Free Trial',
                          plan: 'Free Trial',
                          isTrial: true,
                          subscriptionType: 'days',
                          subscriptionDuration: trialDays,
                          aiCredits: trialCredits,
                          allowedTools: trialTools
                        });
                      } else if (val === 'starter') {
                        setEditingUser({ ...editingUser, planName: 'Starter', plan: 'Starter', isTrial: false });
                      } else if (val === 'growth') {
                        setEditingUser({ ...editingUser, planName: 'Growth', plan: 'Growth', isTrial: false });
                      } else if (val === 'pro') {
                        setEditingUser({ ...editingUser, planName: 'Pro', plan: 'Pro', isTrial: false });
                      } else {
                        setEditingUser({ ...editingUser, planName: 'Enterprise', plan: 'Enterprise', isTrial: false });
                      }
                    }}
                  >
                    <option value="free-trial">
                      {isRTL
                        ? `الباقة المجانية (تجربة ${tenantFreeTrial.days || 15} يوم)`
                        : `Free Trial (${tenantFreeTrial.days || 15} days)`}
                    </option>
                    <option value="starter">{isRTL ? 'ستارتر (Starter)' : 'Starter'}</option>
                    <option value="growth">{isRTL ? 'جروث (Growth)' : 'Growth'}</option>
                    <option value="pro">{isRTL ? 'برو (Pro)' : 'Pro'}</option>
                    <option value="custom">{isRTL ? 'باقة مخصصة (Custom Plan)' : 'Custom Plan'}</option>
                  </select>
                </div>
                {editingUser.isTrial && (
                  <div style={{
                    gridColumn: '1 / -1',
                    marginBottom: '4px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    fontSize: '12px',
                    color: 'var(--text2)',
                    lineHeight: 1.5
                  }}>
                    {isRTL
                      ? `سيتم تفعيل التجربة المجانية لمدة ${tenantFreeTrial.days || 15} يوم، مع ${tenantFreeTrial.credits !== undefined ? tenantFreeTrial.credits : 500} كريديت والأدوات المحددة في إعدادات الباقات.`
                      : `Free trial will be applied for ${tenantFreeTrial.days || 15} days, with ${tenantFreeTrial.credits !== undefined ? tenantFreeTrial.credits : 500} credits and the tools configured in Plans settings.`}
                  </div>
                )}
                {(!editingUser.isTrial && !['starter', 'growth', 'pro', 'free trial'].includes((editingUser.planName || '').toLowerCase())) && (
                  <div className="field">
                    <label className="field-label">{isRTL ? 'اسم الباقة المخصصة' : 'Custom Plan Name'}</label>
                    <input
                      className="form-control"
                      type="text"
                      required
                      value={editingUser.planName || ''}
                      onChange={e => setEditingUser({ ...editingUser, planName: e.target.value, plan: e.target.value })}
                      placeholder={isRTL ? 'أدخل اسم الباقة المخصصة' : 'Enter custom plan name'}
                    />
                  </div>
                )}

                {!editingUser.isTrial && (editingUser.subscriptionType || 'months') !== 'lifetime' && (
                  <div className="field">
                    <label className="field-label">{t('common.duration') || 'Duration'}</label>
                    <input
                      className="form-control"
                      type="number"
                      min="1"
                      required
                      value={editingUser.subscriptionDuration || '1'}
                      onChange={e => setEditingUser({ ...editingUser, subscriptionDuration: e.target.value })}
                      placeholder="Duration"
                    />
                  </div>
                )}
              </div>

              <div className="field" style={{ marginBottom: '12px' }}>
                <label className="field-label">{isRTL ? 'رصيد الذكاء الاصطناعي ($)' : 'AI Credits ($)'}</label>
                <input 
                  className="form-control" 
                  type="number" 
                  step="0.01" 
                  min="0"
                  value={editingUser.aiCredits !== undefined ? editingUser.aiCredits : ''} 
                  onChange={e => setEditingUser({ ...editingUser, aiCredits: e.target.value })} 
                  placeholder="0.00" 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => { setShowEditModal(false); setError(null); }} className="btn" style={{ flex: 1 }}>{t('common.cancel') || 'Cancel'}</button>
                <button type="submit" disabled={isCreating} className="btn btn-primary" style={{ flex: 1 }}>
                  {isCreating ? t('common.saving') : (t('common.saveChanges') || 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="card" style={{ width: '95%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', margin: 'auto', animation: 'scaleUp 0.3s ease' }}>
            <h3 style={{ marginBottom: '20px' }}>{t('admin.addNewUserTitle') || 'Create New User'}</h3>
            {error && <div style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '15px' }}>{error}</div>}
            <form onSubmit={handleAddUser}>
              <div className="field" style={{ marginBottom: '12px' }}>
                <label className="field-label">{t('admin.userNameLabel') || 'Full Name'}</label>
                <input className="form-control" type="text" required value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="Full Name" />
              </div>

              <div className="grid-2" style={{ gap: '12px', marginBottom: '12px' }}>
                <div className="field">
                  <label className="field-label">{t('common.country') || 'Country'}</label>
                  <select className="form-control" value={newUser.country} onChange={e => setNewUser({ ...newUser, country: e.target.value })}>
                    <option value="EG">{isRTL ? 'مصر (EG)' : 'Egypt (EG)'}</option>
                    <option value="SA">{isRTL ? 'السعودية (SA)' : 'Saudi Arabia (SA)'}</option>
                    <option value="AE">{isRTL ? 'الإمارات (AE)' : 'UAE (AE)'}</option>
                    <option value="KW">{isRTL ? 'الكويت (KW)' : 'Kuwait (KW)'}</option>
                    <option value="QA">{isRTL ? 'قطر (QA)' : 'Qatar (QA)'}</option>
                    <option value="JO">{isRTL ? 'الأردن (JO)' : 'Jordan (JO)'}</option>
                    <option value="MA">{isRTL ? 'المغرب (MA)' : 'Morocco (MA)'}</option>
                    <option value="TN">{isRTL ? 'تونس (TN)' : 'Tunisia (TN)'}</option>
                    <option value="OTHER">{isRTL ? 'أخرى (OTHER)' : 'Other (OTHER)'}</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">{t('common.phoneNumber') || 'Phone'}</label>
                  <div style={{ position: 'relative' }}>
                    <span style={phoneSpanStyle}>
                      {countryData[newUser.country].code}
                    </span>
                    <input
                      className="form-control"
                      type="text"
                      required
                      value={newUser.phoneNumber}
                      onChange={e => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                      placeholder={countryData[newUser.country].placeholder}
                      style={phoneInputStyle}
                    />
                  </div>
                </div>
              </div>

              <div className="field" style={{ marginBottom: '12px' }}>
                <label className="field-label">{t('common.email') || 'Email'}</label>
                <input className="form-control" type="email" required value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="email@example.com" />
              </div>

              <div className="field" style={{ marginBottom: '12px' }}>
                <label className="field-label">{t('common.password') || 'Password'}</label>
                <input className="form-control" type="password" required value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="••••••••" />
              </div>

              <div className="grid-2" style={{ gap: '12px', marginBottom: '12px' }}>
                <div className="field">
                  <label className="field-label">{t('common.subType') || 'Subscription'}</label>
                  <select
                    className="form-control"
                    value={newUser.subscriptionType}
                    onChange={e => setNewUser({ ...newUser, subscriptionType: e.target.value, subscriptionDuration: e.target.value === 'lifetime' ? '' : '1' })}
                  >
                    <option value="days">{isRTL ? 'أيام' : 'Days'}</option>
                    <option value="months">{isRTL ? 'شهور' : 'Months'}</option>
                    <option value="lifetime">{isRTL ? 'مدى الحياة' : 'Lifetime'}</option>
                  </select>
                </div>
                {newUser.subscriptionType !== 'lifetime' && (
                  <div className="field">
                    <label className="field-label">{t('common.duration') || 'Duration'}</label>
                    <input
                      className="form-control"
                      type="number"
                      min="1"
                      required
                      value={newUser.subscriptionDuration}
                      onChange={e => setNewUser({ ...newUser, subscriptionDuration: e.target.value })}
                      placeholder="Duration"
                    />
                  </div>
                )}
              </div>

              <div className="field" style={{ marginBottom: '12px' }}>
                <label className="field-label">{isRTL ? 'رصيد الذكاء الاصطناعي ($)' : 'AI Credits ($)'}</label>
                <input 
                  className="form-control" 
                  type="number" 
                  step="0.01" 
                  min="0"
                  value={newUser.aiCredits} 
                  onChange={e => setNewUser({ ...newUser, aiCredits: e.target.value })} 
                  placeholder={`Default: $${globalDefaultCredits.toFixed(2)}`} 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => { setShowAddModal(false); setError(null); }} className="btn" style={{ flex: 1 }}>{t('common.cancel') || 'Cancel'}</button>
                <button type="submit" disabled={isCreating} className="btn btn-primary" style={{ flex: 1 }}>
                  {isCreating ? t('common.adding') || 'Creating...' : (t('common.createAccount') || 'Create Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Sale Modal */}
      {showSalesModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="card" style={{ width: '95%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto', margin: 'auto', animation: 'scaleUp 0.3s ease' }}>
            <h3 style={{ marginBottom: '20px' }}>{editingSale ? t('admin.editSaleTitle') : t('admin.addNewSaleTitle')}</h3>
            <form onSubmit={handleAddSale}>
              <div className="field" style={{ marginBottom: '15px', position: 'relative' }}>
                <label className="field-label" style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '5px' }}>{t('admin.selectUser')}</label>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                  <input
                    className="form-control"
                    style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '32px' }}
                    placeholder={t('admin.searchUserPlaceholder') || 'Search User...'}
                    value={modalSearchTerm}
                    required
                    onChange={(e) => {
                      setModalSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                      if (!e.target.value) {
                        setNewSale({ ...newSale, userId: '', customerName: '' });
                      }
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                  />
                </div>

                {isDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'var(--bg2)',
                    border: '1px solid var(--line)',
                    borderRadius: '8px',
                    marginTop: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 10,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    {users
                      .filter(u => (u.name || u.email || '').toLowerCase().includes(modalSearchTerm.toLowerCase()))
                      .map(user => (
                        <div
                          key={user.id}
                          style={{
                            padding: '10px 15px',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--line)',
                            transition: 'background 0.2s',
                            fontSize: '13px'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          onClick={() => {
                            setNewSale({
                              ...newSale,
                              userId: user.id,
                              customerName: user.name || user.email
                            });
                            setModalSearchTerm(user.name || user.email);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <div style={{ fontWeight: '700', color: 'var(--text)' }}>{user.name || t('admin.newUser')}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{user.email}</div>
                        </div>
                      ))}
                    {users.filter(u => (u.name || u.email || '').toLowerCase().includes(modalSearchTerm.toLowerCase())).length === 0 && (
                      <div style={{ padding: '15px', textAlign: 'center', color: 'var(--text3)', fontSize: '12px' }}>
                        {t('common.noResults') || 'No users match.'}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="field" style={{ marginBottom: '20px' }}>
                <label className="field-label" style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '5px' }}>{t('admin.amountEGP') || 'Sale Amount'}</label>
                <input
                  className="form-control"
                  type="number"
                  required
                  placeholder="0.00"
                  value={newSale.amount}
                  onChange={e => setNewSale({ ...newSale, amount: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => { setShowSalesModal(false); setModalSearchTerm(''); }} className="btn" style={{ flex: 1 }}>{t('common.cancel') || 'Cancel'}</button>
                <button type="submit" disabled={isCreating} className="btn btn-primary" style={{ flex: 1 }}>
                  {isCreating ? t('common.saving') : (editingSale ? t('common.saveChanges') : t('admin.saveSale'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {showReceiptModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', margin: '20px', padding: '24px', animation: 'scaleUp 0.3s ease', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>{t('branding.viewReceipt')}</h3>
              <button 
                type="button" 
                onClick={() => { setShowReceiptModal(false); setSelectedReceiptUrl(''); }} 
                className="btn btn-sm"
                style={{ padding: '4px 8px', background: 'var(--bg4)' }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ 
              borderRadius: '12px', 
              overflow: 'hidden', 
              background: '#000', 
              border: '1px solid var(--line)',
              maxHeight: '60vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src={selectedReceiptUrl} 
                alt="Receipt screenshot" 
                style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }} 
              />
            </div>
            
            <button 
              type="button" 
              onClick={() => { setShowReceiptModal(false); setSelectedReceiptUrl(''); }} 
              className="btn btn-full"
            >
              {isRTL ? 'إغلاق المعاينة' : 'Close Preview'}
            </button>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(8, 8, 15, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '16px' }}>
          <div className="card" style={{ width: '95%', maxWidth: '440px', margin: 'auto', padding: '24px', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'var(--panel)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', animation: 'scaleUp 0.25s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)', flexShrink: 0 }}>
                <Trash2 size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text)', margin: 0 }}>
                  {isRTL ? 'تأكيد حذف حساب المستخدم' : 'Confirm Delete User Account'}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text3)' }}>
                  {userToDelete.email}
                </span>
              </div>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '14px', borderRadius: '10px', marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.6', margin: 0 }}>
                {isRTL
                  ? `هل أنت تأكد من رغبتك في حذف حساب "${userToDelete.name || userToDelete.email}" نهائياً؟`
                  : `Are you sure you want to permanently delete user "${userToDelete.name || userToDelete.email}"?`}
              </p>
              <p style={{ fontSize: '11.5px', color: 'var(--red)', margin: '8px 0 0 0', fontWeight: '700' }}>
                ⚠️ {isRTL ? 'سيتم مسح بيانات الحساب من Firestore ونظام المصادقة Auth نهائياً ولا يمكن التراجع عن هذا الإجراء.' : 'This will erase all user data from Firestore & Auth permanently.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeletingUser}
                className="btn"
                style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--line)', color: 'var(--text2)' }}
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                disabled={isDeletingUser}
                className="btn"
                style={{ flex: 1, background: 'var(--red)', border: 'none', color: '#fff', fontWeight: 'bold' }}
              >
                {isDeletingUser ? (isRTL ? 'جاري الحذف...' : 'Deleting...') : (isRTL ? 'تأكيد الحذف النهائي' : 'Confirm Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', color: 'var(--text2)' }}>Loading admin panel...</div>}>
      <AdminDashboard />
    </Suspense>
  );
}
