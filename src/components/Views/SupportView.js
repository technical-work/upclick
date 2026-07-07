'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import CustomSelect from '../CustomSelect';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  arrayUnion,
  serverTimestamp 
} from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

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

export default function SupportView() {
  const { lang, L } = useBusiness();
  const { user, userData } = useAuth();
  
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form states
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketPriority, setTicketPriority] = useState('Medium');
  const [initialMessage, setInitialMessage] = useState('');
  
  // File Attachment States
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  
  // Chat input state
  const [messageInput, setMessageInput] = useState('');
  const chatEndRef = useRef(null);

  const handleUploadFile = (file) => {
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
          console.error("Error uploading file to secondary storage:", error);
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

  // Subscribe to user's tickets in real-time
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'support_tickets'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort client-side because composite index in firestore might be missing initially
      list.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      setTickets(list);

      // Keep active ticket synchronized with real-time updates
      if (activeTicket) {
        const updatedActive = list.find(t => t.id === activeTicket.id);
        if (updatedActive) {
          setActiveTicket(updatedActive);
        }
      }
    });

    return () => unsubscribe();
  }, [user?.uid, activeTicket?.id]);

  // Scroll to bottom of chat when new message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeTicket?.messages?.length]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!ticketTitle.trim() || !initialMessage.trim()) return;

    try {
      let attachment = null;
      if (attachmentFile) {
        attachment = await handleUploadFile(attachmentFile);
      }

      const newTicket = {
        userId: user.uid,
        userName: userData?.name || user?.email?.split('@')[0] || 'Client',
        userEmail: user?.email || '',
        title: ticketTitle.trim(),
        priority: ticketPriority,
        status: 'open',
        attachments: attachment ? [attachment] : [],
        messages: [
          {
            sender: 'client',
            senderName: userData?.name || user?.email?.split('@')[0] || 'Client',
            text: initialMessage.trim(),
            createdAt: new Date().toISOString()
          }
        ],
        createdAt: new Date().toISOString(), // Fallback standard format
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'support_tickets'), newTicket);
      
      setTicketTitle('');
      setInitialMessage('');
      setTicketPriority('Medium');
      setAttachmentFile(null);
      setShowCreateForm(false);
      
      // Set newly created ticket as active
      setActiveTicket({ id: docRef.id, ...newTicket });
    } catch (err) {
      console.error("Error creating ticket: ", err);
      alert(L("Failed to create ticket. Please try again.", "فشل إنشاء التذكرة. يرجى المحاولة مرة أخرى."));
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeTicket) return;

    const messageObj = {
      sender: 'client',
      senderName: userData?.name || user?.email?.split('@')[0] || 'Client',
      text: messageInput.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      const ticketRef = doc(db, 'support_tickets', activeTicket.id);
      await updateDoc(ticketRef, {
        messages: arrayUnion(messageObj),
        updatedAt: new Date().toISOString()
      });
      setMessageInput('');
    } catch (err) {
      console.error("Error sending message: ", err);
    }
  };

  const handleCloseTicket = async (ticketId) => {
    if (!confirm(L("Are you sure you want to close this ticket?", "هل أنت متأكد من إغلاق هذه التذكرة؟"))) return;
    try {
      const ticketRef = doc(db, 'support_tickets', ticketId);
      await updateDoc(ticketRef, {
        status: 'closed',
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Error closing ticket: ", err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="badge b-green">{L('Open', 'مفتوحة')}</span>;
      case 'in_progress':
        return <span className="badge b-ai" style={{ background: 'var(--amber-d)', color: 'var(--amber)' }}>{L('In Progress', 'قيد المتابعة')}</span>;
      case 'closed':
        return <span className="badge" style={{ background: 'var(--surface3)', color: 'var(--t3)' }}>{L('Closed', 'مغلقة')}</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return <span className="badge b-red" style={{ fontSize: '10px' }}>{L('High', 'عالية')}</span>;
      case 'Medium':
        return <span className="badge b-ai" style={{ fontSize: '10px' }}>{L('Medium', 'متوسطة')}</span>;
      case 'Low':
        return <span className="badge" style={{ fontSize: '10px', background: 'var(--surface3)' }}>{L('Low', 'منخفضة')}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="pg on" id="pg-support">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">🛠</span>
          {L('Technical Support', 'الدعم الفني والشكاوى')}
        </div>
        <div className="pg-actions">
          <button 
            className="btn btn-prime"
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setActiveTicket(null);
            }}
          >
            {showCreateForm ? L('Back to Tickets', 'العودة للتذاكر') : `➕ ${L('Open Support Ticket', 'فتح تذكرة دعم جديدة')}`}
          </button>
        </div>
      </div>

      <div className="g2">
        {/* Left Side: Ticket List OR Form */}
        <div>
          {showCreateForm ? (
            <div className="card">
              <div className="sec-hd">
                <div className="sec-title">➕ {L('Create Support Ticket', 'إنشاء تذكرة دعم جديدة')}</div>
              </div>
              <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Ticket Subject / Title *', 'عنوان التذكرة / الموضوع *')}
                  </label>
                  <input 
                    className="inp"
                    required
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                    placeholder={L('e.g. Stripe payout failure or bug on deals tab', 'مثال: فشل تحويل الإيرادات أو خطأ في صفحة الصفقات')}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Priority Level', 'مستوى الأولوية')}
                  </label>
                  <CustomSelect 
                    className="inp"
                    value={ticketPriority}
                    onChange={(e) => setTicketPriority(e.target.value)}
                  >
                    <option value="Low">{L('Low Priority', 'منخفضة')}</option>
                    <option value="Medium">{L('Medium Priority', 'متوسطة')}</option>
                    <option value="High">{L('High Priority', 'عالية (مستعجل)')}</option>
                  </CustomSelect>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Description & Message *', 'تفاصيل المشكلة والرسالة الأولى *')}
                  </label>
                  <textarea 
                    className="inp"
                    required
                    rows="5"
                    value={initialMessage}
                    onChange={(e) => setInitialMessage(e.target.value)}
                    placeholder={L('Describe the issue in detail...', 'اشرح المشكلة بوضوح للوكيل الفني...')}
                  ></textarea>
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    📎 {L('Attach Screenshots or Files', 'إرفاق صور أو ملفات توضيحية')}
                  </label>
                  <input 
                    type="file" 
                    onChange={(e) => setAttachmentFile(e.target.files[0])}
                    style={{ display: 'none' }}
                    id="ticket-file-input"
                    accept="image/*,application/pdf,video/*"
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label 
                      htmlFor="ticket-file-input" 
                      className="btn" 
                      style={{ 
                        cursor: 'pointer', 
                        fontSize: '12px', 
                        padding: '6px 12px', 
                        background: 'var(--surface2)', 
                        border: '1px solid var(--edge2)',
                        borderRadius: '6px'
                      }}
                    >
                      📁 {attachmentFile ? L('Change File', 'تغيير الملف') : L('Choose File', 'اختيار ملف')}
                    </label>
                    {attachmentFile && (
                      <span style={{ fontSize: '11px', color: 'var(--orange)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                        {attachmentFile.name}
                      </span>
                    )}
                  </div>
                  {uploading && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ height: '4px', background: 'var(--edge2)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--orange)', transition: 'width 0.2s' }}></div>
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--t3)', marginTop: '2px' }}>
                        {L(`Uploading: ${uploadProgress}%`, `جاري الرفع: ${uploadProgress}%`)}
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-prime"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px', background: 'linear-gradient(135deg, var(--orange) 0%, #f43f5e 100%)', border: 'none' }}
                >
                  🚀 {L('Submit Support Ticket', 'إرسال تذكرة الدعم')}
                </button>
              </form>
            </div>
          ) : (
            <div className="card">
              <div className="sec-hd">
                <div className="sec-title">📋 {L('My Open Tickets', 'تذاكر الدعم الخاصة بي')}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tickets.length === 0 ? (
                  <div className="empty-state" style={{ padding: '40px' }}>
                    <div className="es-icon">🛠</div>
                    <div className="es-title">{L('No active support tickets', 'لا توجد تذاكر دعم فني')}</div>
                    <div className="es-sub">
                      {L('If you have any platform issues or questions, submit a support ticket to chat with an admin.', 'إذا واجهتك أي مشكلة تقنية أو محاسبية، افتح تذكرة دعم وسيتواصل معك المسؤول فورياً.')}
                    </div>
                  </div>
                ) : (
                  tickets.map((t) => (
                    <div 
                      key={t.id}
                      onClick={() => setActiveTicket(t)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '12px', 
                        background: activeTicket?.id === t.id ? 'var(--orange-d)' : 'var(--surface2)', 
                        border: activeTicket?.id === t.id ? '1px solid var(--orange)' : '1px solid var(--edge2)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1, paddingRight: lang === 'ar' ? '0' : '10px', paddingLeft: lang === 'ar' ? '10px' : '0' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {t.title}
                        </div>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {getStatusBadge(t.status)}
                          {getPriorityBadge(t.priority)}
                          <span style={{ fontSize: '10px', color: 'var(--t3)' }}>
                            {t.createdAt?.toDate ? t.createdAt.toDate().toLocaleDateString() : new Date(t.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <span style={{ fontSize: '14px', color: 'var(--t3)' }}>{lang === 'ar' ? '←' : '→'}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Chat Window */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '65vh' }}>
          {activeTicket ? (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0', overflow: 'hidden' }}>
              
              {/* Chat Header */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--edge)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface3)', flexShrink: 0 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 'bold', color: 'var(--t1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activeTicket.title}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '3px' }}>
                    {getStatusBadge(activeTicket.status)}
                    {getPriorityBadge(activeTicket.priority)}
                  </div>
                </div>
                {activeTicket.status !== 'closed' && (
                  <button 
                    className="btn"
                    style={{ fontSize: '11px', padding: '4px 10px', background: 'rgba(239, 68, 68, 0.12)', color: 'var(--red)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                    onClick={() => handleCloseTicket(activeTicket.id)}
                  >
                    🔒 {L('Close Ticket', 'إغلاق التذكرة')}
                  </button>
                )}
              </div>

              {activeTicket.attachments && activeTicket.attachments.length > 0 && (
                <div style={{ padding: '8px 16px', background: 'var(--surface2)', borderBottom: '1px solid var(--edge)', display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--t2)' }}>
                    📎 {L('Attachments:', 'المرفقات:')}
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
                          background: 'rgba(236, 92, 49, 0.08)', 
                          color: 'var(--orange)', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          border: '1px solid rgba(236, 92, 49, 0.15)',
                          textDecoration: 'none'
                        }}
                      >
                        {att.type?.startsWith('image/') ? '🖼️' : '📄'} {att.name || L('View Attachment', 'عرض المرفق')}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Board */}
              <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--surface1)' }}>
                {(activeTicket.messages || []).map((msg, index) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div 
                      key={index}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isAdmin ? 'flex-start' : 'flex-end',
                        width: '100%'
                      }}
                    >
                      <div style={{ fontSize: '10px', color: 'var(--t3)', marginBottom: '2px', display: 'flex', gap: '4px' }}>
                        <strong>{msg.senderName}</strong>
                        <span>·</span>
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div 
                        style={{
                          maxWidth: '75%',
                          padding: '10px 14px',
                          borderRadius: isAdmin ? '0px 12px 12px 12px' : '12px 12px 0px 12px',
                          background: isAdmin ? 'var(--surface2)' : 'linear-gradient(135deg, var(--orange) 0%, #f43f5e 100%)',
                          border: isAdmin ? '1px solid var(--edge2)' : 'none',
                          color: isAdmin ? 'var(--t1)' : '#fff',
                          fontSize: '12px',
                          lineHeight: '1.4'
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Pinned Bottom Box */}
              {activeTicket.status === 'closed' ? (
                <div style={{ padding: '16px', background: 'var(--surface3)', borderTop: '1px solid var(--edge)', textAlign: 'center', color: 'var(--t3)', fontSize: '12px' }}>
                  🔒 {L('This ticket is closed. Open a new ticket if you still need help.', 'هذه التذكرة مغلقة. افتح تذكرة جديدة إذا كنت بحاجة للمساعدة.')}
                </div>
              ) : (
                <form 
                  onSubmit={handleSendMessage}
                  style={{ padding: '10px 14px', background: 'var(--surface3)', borderTop: '1px solid var(--edge)', display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}
                >
                  <input 
                    className="inp"
                    style={{ flex: 1 }}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={L('Type support reply...', 'اكتب رسالتك للمسؤول...')}
                  />
                  <button 
                    type="submit" 
                    className="btn btn-prime"
                    style={{ padding: '8px 18px', background: 'linear-gradient(135deg, var(--orange) 0%, #f43f5e 100%)', border: 'none' }}
                  >
                    {L('Send', 'إرسال')}
                  </button>
                </form>
              )}

            </div>
          ) : (
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--t3)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                <div style={{ fontSize: '13px' }}>
                  {L('Select a ticket on the left to start support chat', 'اختر تذكرة دعم من القائمة لبدء المحادثة الفورية')}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
