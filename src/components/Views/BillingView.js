'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { useAuth } from '../../context/AuthContext';
import { db, libStorage } from '../../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import StripePaymentButton from '../Stripe/StripePaymentButton';


export default function BillingView() {
  const { lang, L, t, tenantConfig, showToast } = useBusiness();
  const { currentUser, userData } = useAuth();
  
  const monthlyPrice = parseFloat(tenantConfig?.plan?.price) || 99;
  const annualPrice = parseFloat(tenantConfig?.planAnnual?.price) || 999;
  const currencySymbol = tenantConfig?.plan?.currency || 'EGP';

  const [selectedMethod, setSelectedMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('monthly');
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [recentPayments, setRecentPayments] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const getMs = (val) => {
    if (!val) return 0;
    if (typeof val === 'string') return new Date(val).getTime();
    if (typeof val === 'number') return val;
    if (val.toDate) return val.toDate().getTime();
    if (val.seconds) return val.seconds * 1000;
    return 0;
  };

  // Determine active payment methods configured by tenant admin
  const paymentMethods = tenantConfig?.paymentMethods || {};
  const activeMethods = Object.keys(paymentMethods).filter(k => paymentMethods[k]?.enabled);

  // Set default method once active methods are loaded
  useEffect(() => {
    if (activeMethods.length > 0 && !selectedMethod) {
      setSelectedMethod(activeMethods[0]);
    }
  }, [activeMethods, selectedMethod]);

  // Real-time listener for the user's submitted payments
  useEffect(() => {
    if (!currentUser?.uid) return;
    const q = query(
      collection(db, 'payments'),
      where('userId', '==', currentUser.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeB - timeA;
      });
      setRecentPayments(data);
      setLoadingHistory(false);
    }, (err) => {
      console.error("Error fetching user payments:", err);
      setLoadingHistory(false);
    });

    return () => unsub();
  }, [currentUser]);

  // Expiration Status Details
  const isTrial = userData?.isTrial || false;
  let statusBadgeColor = 'var(--green)';
  let statusText = L('Active Subscription', 'اشتراك نشط');
  let expiryDateString = '—';
  let daysRemaining = null;

  if (userData?.expiresAt) {
    const expiresMs = getMs(userData.expiresAt);
    expiryDateString = new Date(expiresMs).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    daysRemaining = Math.ceil((expiresMs - Date.now()) / 86400000);
    
    if (expiresMs < Date.now()) {
      statusText = L('Expired', 'منتهي الصلاحية');
      statusBadgeColor = 'var(--red)';
    }
  } else if (userData?.trialStartedAt) {
    const trialDays = tenantConfig?.freeTrial?.days || 7;
    const startMs = getMs(userData.trialStartedAt);
    const expiresMs = startMs + (trialDays * 86400000);
    expiryDateString = new Date(expiresMs).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    daysRemaining = Math.ceil((expiresMs - Date.now()) / 86400000);
    
    if (expiresMs < Date.now()) {
      statusText = L('Trial Expired', 'انتهت التجربة');
      statusBadgeColor = 'var(--red)';
    } else {
      statusText = L('Free Trial', 'تجربة مجانية');
      statusBadgeColor = 'var(--accent)';
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('image/')) {
      setError(L('Please upload an image file (PNG/JPG)', 'يرجى تحميل ملف صورة (PNG/JPG)'));
      return;
    }
    setFile(selectedFile);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMethod) {
      setError(L('Please select a payment method', 'يرجى تحديد طريقة الدفع'));
      return;
    }
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError(L('Please enter a valid amount', 'يرجى إدخال قيمة صحيحة للمبلغ'));
      return;
    }
    if (!file) {
      setError(L('Please attach a proof of payment screenshot', 'يرجى إرفاق صورة إثبات الدفع'));
      return;
    }

    setUploading(true);
    setError('');

    try {
      const storageRef = ref(libStorage, `payments/${currentUser.uid}/receipt_${Date.now()}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setUploadProgress(progress);
        },
        (err) => {
          console.error("Storage upload error:", err);
          setError(L('Failed to upload receipt. Please try again.', 'فشل رفع صورة الإيصال. يرجى المحاولة مرة أخرى.'));
          setUploading(false);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          
          await addDoc(collection(db, 'payments'), {
            userId: currentUser.uid,
            userName: userData?.name || currentUser.email.split('@')[0],
            userEmail: currentUser.email,
            adminId: userData?.adminId || null,
            amount: parseFloat(amount),
            currency: tenantConfig?.currency || 'EGP',
            paymentMethod: selectedMethod,
            planDuration: duration,
            receiptUrl: downloadUrl,
            status: 'pending',
            createdAt: serverTimestamp()
          });

          setUploading(false);
          setSubmitted(true);
          setFile(null);
          setAmount('');
          setUploadProgress(0);
          showToast(L('Payment proof submitted successfully! ✅', 'تم إرسال إثبات الدفع بنجاح! ✅'));
          setTimeout(() => setSubmitted(false), 3000);
        }
      );
    } catch (err) {
      console.error("Failed to submit payment:", err);
      setError(err.message);
      setUploading(false);
    }
  };

  // If user is a team member, managed by owner
  const isTeamMember = userData?.role === 'team_member';
  if (isTeamMember) {
    return (
      <div className="pg on" id="pg-billing">
        <div className="pg-header">
          <div className="pg-title">
            <span className="pg-icon">💳</span>
            {L('Billing & Subscription', 'الاشتراكات والفواتير')}
          </div>
        </div>
        <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '16px' }}>👤</div>
          <h3>{L('Team Member Account', 'حساب عضو فريق')}</h3>
          <p style={{ color: 'var(--t2)', marginTop: '8px', maxWidth: '500px', margin: '8px auto 0' }}>
            {L(
              'Your subscription is managed directly by your team owner. If you have inquiries about billing, please contact the administrator of your workspace.',
              'تتم إدارة اشتراكك مباشرة من قبل مالك الفريق. إذا كان لديك استفسارات بخصوص الفواتير والاشتراك، يرجى التواصل مع مسؤول مساحة العمل الخاصة بك.'
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pg on" id="pg-billing">
      {/* Header */}
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">💳</span>
          {L('Billing & Subscription', 'الاشتراكات والفواتير')}
        </div>
      </div>

      <div className="g21">
        {/* Left Column: Expiry Card and Renewal Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Card 1: Current Status */}
          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">📊 {L('Subscription Details', 'تفاصيل الاشتراك')}</div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--brd)' }}>
              <span style={{ fontSize: '13px', color: 'var(--t2)' }}>{L('Status', 'حالة الاشتراك')}</span>
              <span style={{
                background: `${statusBadgeColor}15`,
                color: statusBadgeColor,
                border: `1px solid ${statusBadgeColor}30`,
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11.5px',
                fontWeight: '700'
              }}>
                ● {statusText}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--brd)' }}>
              <span style={{ fontSize: '13px', color: 'var(--t2)' }}>{L('Expiry Date', 'تاريخ الانتهاء')}</span>
              <span style={{ fontFamily: 'var(--ff)', fontWeight: '700', color: 'var(--t1)' }}>{expiryDateString}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--t2)' }}>{L('Time Remaining', 'الوقت المتبقي')}</span>
              <span style={{ fontFamily: 'var(--ff)', fontWeight: '700', color: daysRemaining !== null && daysRemaining <= 0 ? 'var(--red)' : 'var(--a)' }}>
                {daysRemaining !== null 
                  ? (daysRemaining <= 0 
                      ? L('Expired', 'منتهي') 
                      : `${daysRemaining} ${L('days', 'أيام')}`)
                  : '—'}
              </span>
            </div>
          </div>

          {/* Card 2: Renewal Form */}
          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">⚡ {L('Renew or Upgrade', 'تجديد أو ترقية الاشتراك')}</div>
            </div>

            {activeMethods.length === 0 ? (
              <p style={{ color: 'var(--t3)', fontSize: '12.5px', textAlign: 'center', padding: '15px' }}>
                {L('No payment methods configured by administrator. Please contact support.', 'لم يقم مسؤول النظام بتكوين أي طرق دفع بعد. يرجى التواصل مع الدعم.')}
              </p>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* Gateway Tabs */}
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '6px' }}>
                    {L('Choose Payment Gateway', 'اختر طريقة الدفع')}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
                    {activeMethods.map((method) => {
                      const isActive = selectedMethod === method;
                      let label = '';
                      let icon = '';
                      if (method === 'instapay') { label = L('Instapay', 'انستاباي'); icon = '⚡'; }
                      if (method === 'vodafoneCash') { label = L('Vodafone Cash', 'فودافون كاش'); icon = '📱'; }
                      if (method === 'stripe') { label = L('Credit Card', 'بطاقة ائتمان'); icon = '💳'; }
                      if (method === 'paypal') { label = L('PayPal', 'بايبال'); icon = '🌐'; }

                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setSelectedMethod(method)}
                          className={`btn ${isActive ? 'btn-prime' : 'btn-ghost'}`}
                          style={{
                            padding: '10px 6px',
                            fontSize: '11px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            justifyContent: 'center',
                            borderRadius: '10px'
                          }}
                        >
                          <span style={{ fontSize: '16px' }}>{icon}</span>
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Gateway Instructions Display */}
                <div style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--brd)',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '12.5px',
                  lineHeight: '1.6',
                  color: 'var(--t1)'
                }}>
                  {selectedMethod === 'instapay' && (
                    <div style={{ textAlign: 'start' }}>
                      <div style={{ fontWeight: '700', color: 'var(--a)', marginBottom: '4px' }}>⚡ {L('Instapay Transfer Details', 'تفاصيل التحويل عبر انستاباي')}</div>
                      <div>{L('Please transfer the amount to the address below:', 'يرجى تحويل قيمة الاشتراك إلى العنوان التالي:')}</div>
                      <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        fontWeight: '700',
                        marginTop: '8px',
                        border: '1px dashed var(--brd)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>{paymentMethods.instapay?.address}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(paymentMethods.instapay?.address);
                            showToast(L('Address copied!', 'تم نسخ العنوان!'));
                          }}
                          style={{ background: 'none', border: 'none', color: 'var(--a)', cursor: 'pointer', fontSize: '11px' }}
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedMethod === 'vodafoneCash' && (
                    <div style={{ textAlign: 'start' }}>
                      <div style={{ fontWeight: '700', color: '#EF4444', marginBottom: '4px' }}>📱 {L('Vodafone Cash Transfer Details', 'تفاصيل التحويل عبر فودافون كاش')}</div>
                      <div>{L('Please transfer the amount to the wallet number below:', 'يرجى تحويل قيمة الاشتراك إلى رقم المحفظة التالي:')}</div>
                      <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        fontWeight: '700',
                        marginTop: '8px',
                        border: '1px dashed var(--brd)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>{paymentMethods.vodafoneCash?.number}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(paymentMethods.vodafoneCash?.number);
                            showToast(L('Number copied!', 'تم نسخ الرقم!'));
                          }}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '11px' }}
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedMethod === 'stripe' && (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                      <div style={{ fontWeight: '700', color: 'var(--a)', marginBottom: '8px' }}>💳 {L('Stripe Global Payments', 'الدفع العالمي الآمن عبر كارت الائتمان')}</div>
                      <div style={{ fontSize: '12px', color: 'var(--t2)', marginBottom: '14px' }}>
                        {L('Choose one of the options below to pay securely via Stripe:', 'اختر أحد الخيارات بالأسفل للدفع الآمن عبر Stripe:')}
                      </div>
                      
                      {/* Option A: Automated Direct Checkout */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '0 auto', marginBottom: '16px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--t3)', textTransform: 'uppercase', marginBottom: '4px', textAlign: 'center' }}>
                          ⚡ {L('Automated Instant Activation', 'تفعيل تلقائي وفوري')}
                        </div>
                        <StripePaymentButton
                          amount={monthlyPrice}
                          currency={currencySymbol}
                          planName={L('Pro Plan Monthly', 'الاشتراك الشهري المميز')}
                          planDuration="monthly"
                          userId={currentUser?.uid}
                          adminId={userData?.adminId}
                          buttonText={L(`Subscribe Monthly (${monthlyPrice} ${currencySymbol})`, `اشترك شهرياً (${monthlyPrice} ${currencySymbol})`)}
                        />
                        <StripePaymentButton
                          amount={annualPrice}
                          currency={currencySymbol}
                          planName={L('Pro Plan Annual', 'الاشتراك السنوي المميز')}
                          planDuration="annual"
                          userId={currentUser?.uid}
                          adminId={userData?.adminId}
                          buttonText={L(`Subscribe Annually (${annualPrice} ${currencySymbol})`, `اشترك سنوياً (${annualPrice} ${currencySymbol})`)}
                          className="btn btn-ghost"
                          style={{ borderColor: 'var(--a)', color: 'var(--t1)' }}
                        />
                      </div>


                    </div>
                  )}

                  {selectedMethod === 'paypal' && (
                    <div style={{ textAlign: 'start' }}>
                      <div style={{ fontWeight: '700', color: '#3b82f6', marginBottom: '4px' }}>🌐 {L('PayPal Transfer Details', 'تفاصيل إرسال الدفعة عبر بايبال')}</div>
                      <div>{L('Please send payment to the PayPal address below:', 'يرجى إرسال الدفع إلى عنوان بايبال التالي:')}</div>
                      <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        fontWeight: '700',
                        marginTop: '8px',
                        border: '1px dashed var(--brd)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>{paymentMethods.paypal?.email}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(paymentMethods.paypal?.email);
                            showToast(L('Email copied!', 'تم نسخ الإيميل!'));
                          }}
                          style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '11px' }}
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Amount and Duration Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Paid Amount', 'المبلغ المدفوع')}</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="inp"
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        style={{ paddingRight: lang === 'ar' ? '12px' : '45px', paddingLeft: lang === 'ar' ? '45px' : '12px' }}
                      />
                      <span style={{
                        position: 'absolute',
                        [lang === 'ar' ? 'left' : 'right']: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--t3)',
                        fontSize: '11.5px',
                        fontWeight: '600'
                      }}>
                        {tenantConfig?.currency || 'EGP'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Subscription Plan', 'خطة الاشتراك')}</label>
                    <select className="inp" value={duration} onChange={(e) => setDuration(e.target.value)}>
                      <option value="monthly">{L('Monthly', 'شهري')}</option>
                      <option value="annual">{L('Annual', 'سنوي')}</option>
                      <option value="one-time">{L('One-Time / Life', 'لمرة واحدة / مدى الحياة')}</option>
                    </select>
                  </div>
                </div>

                {/* Screenshot Upload Field */}
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>
                    {L('Proof of Payment Screenshot', 'إرفاق صورة إثبات الدفع / التحويل')}
                  </label>
                  <div style={{
                    border: '1px dashed var(--brd)',
                    borderRadius: '10px',
                    padding: '14px',
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.01)',
                    position: 'relative',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        opacity: 0,
                        cursor: 'pointer',
                        width: '100%',
                        height: '100%'
                      }}
                    />
                    <div style={{ fontSize: '20px', marginBottom: '6px' }}>📷</div>
                    <div style={{ fontSize: '12px', color: 'var(--t1)', fontWeight: '600' }}>
                      {file ? file.name : L('Click to choose screenshot image', 'اضغط هنا لاختيار صورة إثبات التحويل')}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--t3)', marginTop: '3px' }}>
                      {L('Formats: PNG, JPG, JPEG (Max 5MB)', 'الصيغ المدعومة: PNG, JPG, JPEG (بحد أقصى 5 ميجابايت)')}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {uploading && (
                  <div style={{ width: '100%', background: 'var(--surface2)', borderRadius: '10px', height: '6px', overflow: 'hidden', marginTop: '4px' }}>
                    <div style={{
                      width: `${uploadProgress}%`,
                      background: 'var(--a)',
                      height: '100%',
                      transition: 'width 0.2s ease-in-out'
                    }} />
                  </div>
                )}

                {/* Status Messages */}
                {error && (
                  <div style={{ color: 'var(--red)', fontSize: '12px', background: 'rgba(239, 68, 68, 0.1)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.15)', textAlign: 'start' }}>
                    ⚠️ {error}
                  </div>
                )}

                {submitted && (
                  <div style={{ color: 'var(--green)', fontSize: '12px', background: 'rgba(16, 185, 129, 0.1)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.15)', textAlign: 'center' }}>
                    ✓ {L('Proof submitted successfully! Awaiting admin review.', 'تم إرسال إثبات الدفع بنجاح! في انتظار مراجعة الآدمن.')}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading}
                  className="btn btn-prime"
                  style={{ width: '100%', marginTop: '4px', padding: '12px', fontWeight: '700' }}
                >
                  {uploading ? `${L('Uploading proof', 'جاري إرسال الإثبات')} (${uploadProgress}%)` : L('Submit Payment Receipt', 'تأكيد وإرسال إثبات الدفع')}
                </button>

              </form>
            )}
          </div>
        </div>

        {/* Right Column: Recent Payments Log */}
        <div>
          <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="sec-hd">
              <div className="sec-title">🕒 {L('Recent Payment Log', 'سجل الدفعات الأخير')}</div>
            </div>

            {loadingHistory ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--t3)' }}>
                {L('Loading history...', 'جاري تحميل سجل الدفعات...')}
              </div>
            ) : recentPayments.length === 0 ? (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>🧾</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--t2)' }}>
                  {L('No receipts uploaded yet', 'لا توجد إيصالات مرفوعة بعد')}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--t3)', marginTop: '4px', maxWidth: '280px' }}>
                  {L('Any payment receipts you submit for validation will appear here.', 'أي إيصال دفع ستقوم بإرفاقه وتأكيده للمراجعة سيظهر هنا.')}
                </div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', flex: 1 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: lang === 'ar' ? 'right' : 'left', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--brd)', opacity: 0.8 }}>
                      <th style={{ padding: '10px 6px', fontWeight: '700', color: 'var(--t2)' }}>{L('Method', 'الطريقة')}</th>
                      <th style={{ padding: '10px 6px', fontWeight: '700', color: 'var(--t2)' }}>{L('Amount', 'المبلغ')}</th>
                      <th style={{ padding: '10px 6px', fontWeight: '700', color: 'var(--t2)' }}>{L('Status', 'الحالة')}</th>
                      <th style={{ padding: '10px 6px', fontWeight: '700', color: 'var(--t2)' }}>{L('Date', 'التاريخ')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.map((pay) => {
                      let statusColor = 'var(--amber)';
                      let statusLbl = L('Pending', 'قيد المراجعة');
                      if (pay.status === 'approved') { statusColor = 'var(--green)'; statusLbl = L('Approved', 'مقبول'); }
                      if (pay.status === 'rejected') { statusColor = 'var(--red)'; statusLbl = L('Rejected', 'مرفوض'); }

                      const payDate = pay.createdAt?.toDate 
                        ? pay.createdAt.toDate().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US') 
                        : pay.createdAt 
                          ? new Date(pay.createdAt.seconds * 1000).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')
                          : '—';

                      return (
                        <tr key={pay.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '12px 6px', fontWeight: '600', color: 'var(--t1)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {pay.paymentMethod === 'stripe' && '💳 Stripe'}
                              {pay.paymentMethod === 'instapay' && '⚡ Instapay'}
                              {pay.paymentMethod === 'vodafoneCash' && '📱 Cash'}
                              {pay.paymentMethod === 'paypal' && '🌐 PayPal'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 6px', fontFamily: 'var(--mono)', fontWeight: '700', color: 'var(--t1)' }}>
                            {pay.amount} {pay.currency}
                          </td>
                          <td style={{ padding: '12px 6px' }}>
                            <span style={{
                              color: statusColor,
                              background: `${statusColor}10`,
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '10.5px',
                              fontWeight: '700',
                              border: `1px solid ${statusColor}18`,
                              display: 'inline-block'
                            }}>
                              {statusLbl}
                            </span>
                          </td>
                          <td style={{ padding: '12px 6px', fontSize: '11px', color: 'var(--t3)' }}>
                            {payDate}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
