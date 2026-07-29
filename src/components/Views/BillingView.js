'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { useAuth } from '../../context/AuthContext';
import { db, libStorage } from '../../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import StripePaymentButton from '../Stripe/StripePaymentButton';

export default function BillingView() {
  const { lang, L, t, tenantConfig, showToast } = useBusiness();
  const { currentUser, userData } = useAuth();

  const isRTL = lang === 'ar';



  // Dynamic values from tenantConfig or defaults
  const planStarterName = tenantConfig?.planStarterName || 'Starter';
  const planStarterPrice = tenantConfig?.planStarterPrice !== undefined ? Number(tenantConfig.planStarterPrice) : 499;
  const planStarterCredits = tenantConfig?.planStarterCredits !== undefined ? Number(tenantConfig.planStarterCredits) : 200;

  const planGrowthName = tenantConfig?.planGrowthName || 'Growth';
  const planGrowthPrice = tenantConfig?.planGrowthPrice !== undefined ? Number(tenantConfig.planGrowthPrice) : 799;
  const planGrowthCredits = tenantConfig?.planGrowthCredits !== undefined ? Number(tenantConfig.planGrowthCredits) : 600;

  const planProName = tenantConfig?.planProName || 'Pro';
  const planProPrice = tenantConfig?.planProPrice !== undefined ? Number(tenantConfig.planProPrice) : 1497;
  const planProCredits = tenantConfig?.planProCredits !== undefined ? Number(tenantConfig.planProCredits) : 2000;

  const recharge1Credits = tenantConfig?.recharge1Credits !== undefined ? Number(tenantConfig.recharge1Credits) : 100;
  const recharge1Price = tenantConfig?.recharge1Price !== undefined ? Number(tenantConfig.recharge1Price) : 299;

  const recharge2Credits = tenantConfig?.recharge2Credits !== undefined ? Number(tenantConfig.recharge2Credits) : 250;
  const recharge2Price = tenantConfig?.recharge2Price !== undefined ? Number(tenantConfig.recharge2Price) : 599;

  const recharge3Credits = tenantConfig?.recharge3Credits !== undefined ? Number(tenantConfig.recharge3Credits) : 500;
  const recharge3Price = tenantConfig?.recharge3Price !== undefined ? Number(tenantConfig.recharge3Price) : 999;

  const currencySymbol = tenantConfig?.currency || 'EGP';

  const customPlans = tenantConfig?.customPlans || [];
  const customRechargePacks = tenantConfig?.customRechargePacks || [];

  const planStarterConfig = tenantConfig?.planStarterConfig || {};
  const planGrowthConfig = tenantConfig?.planGrowthConfig || {};
  const planProConfig = tenantConfig?.planProConfig || {};

  // User details
  const currentPlanName = userData?.plan || 'Starter';
  const userCredits = userData?.aiCredits !== undefined ? Number(userData.aiCredits) : planStarterCredits;

  const formatBalance = (val) => {
    const num = Number(val || 0);
    return num % 1 === 0 ? String(Math.round(num)) : num.toFixed(2);
  };

  // Find max credits of user's active plan
  let totalPlanCredits = planStarterCredits;
  let planPriceLabel = `${planStarterPrice} ${currencySymbol} / ${isRTL ? 'شهر' : 'Month'}`;
  if (currentPlanName.toLowerCase().includes('growth')) {
    totalPlanCredits = planGrowthCredits;
    planPriceLabel = `${planGrowthPrice} ${currencySymbol} / ${isRTL ? 'شهر' : 'Month'}`;
  } else if (currentPlanName.toLowerCase().includes('pro') || currentPlanName.toLowerCase().includes('lifetime')) {
    totalPlanCredits = planProCredits;
    planPriceLabel = `${planProPrice} ${currencySymbol} / ${isRTL ? 'شهر' : 'Month'}`;
  }

  // Active sub-tab under Billing & Credits page
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'credit-history'
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Manual transfer state

  const handleOpenPaymentModal = (pkg) => {
    setSelectedPackage(pkg);
    setAmount(pkg.amount);
    setDuration(pkg.planDuration);
    setPaymentModalOpen(true);
    setSubmitted(false);
    setError('');
    setFile(null);
    if (!selectedMethod && activeMethods.length > 0) {
      setSelectedMethod(activeMethods[0]);
    }
  };

  const [selectedMethod, setSelectedMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('monthly');
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Real-time collections
  const [recentPayments, setRecentPayments] = useState([]);
  const [creditLogs, setCreditLogs] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingCredits, setLoadingCredits] = useState(true);

  // Sync manual payments & credit history
  useEffect(() => {
    if (!currentUser?.uid) return;

    // Payments listener
    const qPayments = query(
      collection(db, 'payments'),
      where('userId', '==', currentUser.uid)
    );
    const unsubPay = onSnapshot(qPayments, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

    // Credit Logs listener
    const qLogs = query(
      collection(db, 'ai_logs'),
      where('userId', '==', currentUser.uid)
    );
    const unsubLogs = onSnapshot(qLogs, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => {
        const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : (a.timestamp?.seconds ? a.timestamp.seconds * 1000 : 0);
        const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : (b.timestamp?.seconds ? b.timestamp.seconds * 1000 : 0);
        return timeB - timeA;
      });
      setCreditLogs(data);
      setLoadingCredits(false);
    }, (err) => {
      console.error("Error fetching credit logs:", err);
      setLoadingCredits(false);
    });

    return () => {
      unsubPay();
      unsubLogs();
    };
  }, [currentUser]);

  // Expiration / Renewal calculation
  const isTrial = userData?.isTrial || false;
  let statusBadgeColor = 'var(--green)';
  let statusText = L('Active Subscription', 'اشتراك نشط');
  let expiryDateString = '—';

  const getMs = (val) => {
    if (!val) return 0;
    if (typeof val === 'string') return new Date(val).getTime();
    if (typeof val === 'number') return val;
    if (val.toDate) return val.toDate().getTime();
    if (val.seconds) return val.seconds * 1000;
    return 0;
  };

  if (userData?.expiresAt) {
    const expiresMs = getMs(userData.expiresAt);
    expiryDateString = new Date(expiresMs).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (expiresMs < Date.now()) {
      statusText = L('Expired', 'منتهي الصلاحية');
      statusBadgeColor = 'var(--red)';
    }
  } else if (userData?.trialStartedAt) {
    const trialDays = tenantConfig?.freeTrial?.days || 7;
    const expiresMs = getMs(userData.trialStartedAt) + (trialDays * 86400000);
    expiryDateString = new Date(expiresMs).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (expiresMs < Date.now()) {
      statusText = L('Trial Expired', 'انتهت التجربة');
      statusBadgeColor = 'var(--red)';
    } else {
      statusText = L('Free Trial', 'تجربة مجانية');
      statusBadgeColor = 'var(--accent)';
    }
  } else {
    // Default fallback
    const defaultRenewal = new Date();
    defaultRenewal.setDate(defaultRenewal.getDate() + 30);
    expiryDateString = defaultRenewal.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Calculate usage analytics
  const thisMonthCreditsUsed = creditLogs
    .filter(log => {
      const ts = log.timestamp;
      const logDate = ts?.toDate ? ts.toDate() : (ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts));
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return logDate >= monthStart;
    })
    .reduce((sum, log) => sum + (Number(log.creditsDeducted || log.cost || 0)), 0);

  // Find most used tool
  const toolCounts = {};
  creditLogs.forEach(log => {
    const tool = log.tool || 'General';
    toolCounts[tool] = (toolCounts[tool] || 0) + 1;
  });
  let mostUsedTool = '—';
  let maxCount = 0;
  Object.keys(toolCounts).forEach(tool => {
    if (toolCounts[tool] > maxCount) {
      maxCount = toolCounts[tool];
      mostUsedTool = tool;
    }
  });

  // Suggest plan based on usage
  let suggestedPlan = planStarterName;
  if (thisMonthCreditsUsed > planStarterCredits && thisMonthCreditsUsed <= planGrowthCredits) {
    suggestedPlan = planGrowthName;
  } else if (thisMonthCreditsUsed > planGrowthCredits) {
    suggestedPlan = planProName;
  }

  // Plan recommendation logic based on current plan & usage
  let recommendedPlan = planStarterName;
  let recommendedPrice = planStarterPrice;
  let recommendedCredits = planStarterCredits;
  let recommendationText = '';
  let showRecommendButton = true;

  const planLower = currentPlanName.toLowerCase();

  if (planLower.includes('starter') || (!planLower.includes('growth') && !planLower.includes('pro') && !planLower.includes('lifetime'))) {
    // Current is Starter
    if (thisMonthCreditsUsed > planStarterCredits) {
      if (thisMonthCreditsUsed > planGrowthCredits) {
        recommendedPlan = planProName;
        recommendedPrice = planProPrice;
        recommendedCredits = planProCredits;
      } else {
        recommendedPlan = planGrowthName;
        recommendedPrice = planGrowthPrice;
        recommendedCredits = planGrowthCredits;
      }
      recommendationText = isRTL
        ? `بناءً على استهلاكك، فإن باقة (${recommendedPlan}) هي الأنسب لتغطية احتياجاتك التشغيلية وتوفير تكاليف الشحن الإضافي.`
        : `Based on your usage, the (${recommendedPlan}) plan represents the best value for your operational needs.`;
    } else {
      // Recommend next plan (Growth) for upgrade, but say current (Starter) is best fit
      recommendedPlan = planGrowthName;
      recommendedPrice = planGrowthPrice;
      recommendedCredits = planGrowthCredits;
      recommendationText = isRTL
        ? `بناءً على استهلاكك، فإن باقة (Starter) هي الأنسب لتغطية احتياجاتك التشغيلية وتوفير تكاليف الشحن الإضافي.`
        : `Based on your usage, the (Starter) plan represents the best value for your operational needs.`;
    }
  } else if (planLower.includes('growth')) {
    // Current is Growth
    if (thisMonthCreditsUsed > planGrowthCredits) {
      recommendedPlan = planProName;
      recommendedPrice = planProPrice;
      recommendedCredits = planProCredits;
      recommendationText = isRTL
        ? `بناءً على استهلاكك، فإن باقة (${recommendedPlan}) هي الأنسب لتغطية احتياجاتك التشغيلية وتوفير تكاليف الشحن الإضافي.`
        : `Based on your usage, the (${recommendedPlan}) plan represents the best value for your operational needs.`;
    } else {
      // Recommend next plan (Pro) for upgrade, but say current (Growth) is best fit
      recommendedPlan = planProName;
      recommendedPrice = planProPrice;
      recommendedCredits = planProCredits;
      recommendationText = isRTL
        ? `بناءً على استهلاكك، فإن باقة (Growth) هي الأنسب لتغطية احتياجاتك التشغيلية وتوفير تكاليف الشحن الإضافي.`
        : `Based on your usage, the (Growth) plan represents the best value for your operational needs.`;
    }
  } else {
    // Current is Pro/Lifetime (Max plan)
    showRecommendButton = false;
    recommendationText = isRTL
      ? `أنت مشترك بالفعل في الباقة الأعلى (Pro). استهلاكك مغطى بالكامل!`
      : `You are already on the highest tier (Pro) plan. Your usage is fully covered!`;
  }

  // Payment Methods from settings
  const paymentMethods = tenantConfig?.paymentMethods || {};
  const activeMethods = Object.keys(paymentMethods).filter(k => paymentMethods[k]?.enabled);

  useEffect(() => {
    if (activeMethods.length > 0 && !selectedMethod) {
      setSelectedMethod(activeMethods[0]);
    }
  }, [activeMethods, selectedMethod]);

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

  const handleSubmitManual = async (e) => {
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

  const isTeamMember = userData?.role === 'team_member';
  if (isTeamMember) {
    return (
      <div className="pg on" id="pg-billing">
        <div className="pg-header">
          <div className="pg-title">
            <span className="pg-icon">💳</span>
            {L('Billing & Credits', 'الاشتراكات والكريديت')}
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

  const creditProgress = Math.min(100, Math.max(0, (userCredits / totalPlanCredits) * 100));

  return (
    <div className="pg on" id="pg-billing" style={{ maxWidth: '1080px', margin: '0 auto' }}>
      <style>{`
        .billing-grid {
          display: grid;
          grid-template-columns: 2fr 1.2fr;
          gap: 20px;
        }
        .billing-nav {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--edge);
          padding-bottom: 10px;
        }
        .billing-nav button {
          font-weight: 700;
          font-size: 13px;
          padding: 8px 16px;
        }
        .credit-bar-container {
          background: var(--surface2);
          border-radius: 10px;
          height: 12px;
          width: 100%;
          overflow: hidden;
          margin: 10px 0;
          border: 1px solid var(--brd);
        }
        .credit-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--orange) 0%, var(--purple) 100%);
          border-radius: 10px;
          transition: width 0.3s ease;
        }
        .recharge-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin-top: 14px;
        }
        .recharge-card {
          border: 1px solid var(--brd);
          background: var(--surface2);
          padding: 16px;
          border-radius: 12px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          transition: transform 0.2s, border-color 0.2s;
        }
        .recharge-card:hover {
          transform: translateY(-2px);
          border-color: var(--orange);
        }
        .card-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px dashed var(--brd);
          font-size: 13px;
        }
        .card-row:last-child {
          border-bottom: none;
        }
        @media (max-width: 768px) {
          .billing-grid {
            grid-template-columns: 1fr;
          }
          .billing-nav {
            flex-wrap: wrap;
          }
          .billing-nav button {
            flex: 1 1 calc(50% - 8px);
            text-align: center;
          }
        }
      `}</style>

      {/* Page Header */}
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">💳</span>
          {L('Billing & Credits', 'الاشتراكات والكريديت')}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="billing-nav">
        <button
          onClick={() => setActiveTab('overview')}
          className={`btn ${activeTab === 'overview' ? 'btn-prime' : 'btn-ghost'}`}
        >
          💳 {L('Overview & Recharge', 'لوحة التحكم والشحن')}
        </button>
        <button
          onClick={() => setActiveTab('credit-history')}
          className={`btn ${activeTab === 'credit-history' ? 'btn-prime' : 'btn-ghost'}`}
        >
          🕒 {L('Credit Deductions Log', 'سجل استهلاك الكريديت')}
        </button>

      </div>

      {activeTab === 'overview' && (
        <div className="billing-grid">
          {/* Left Column: Credits and Packages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Credits Usage Progress */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800' }}>⚡ {L('Remaining Credits', 'الرصيد المتبقي للعمليات')}</h3>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--orange)' }}>
                  {formatBalance(userCredits)} <span style={{ fontSize: '11px', color: 'var(--t3)' }}>/ {totalPlanCredits} cr</span>
                </span>
              </div>
              <div className="credit-bar-container">
                <div className="credit-bar-fill" style={{ width: `${creditProgress}%` }}></div>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--t3)', margin: '4px 0 0 0' }}>
                {isRTL
                  ? 'يتم الخصم فقط عند اكتمال العمليات بنجاح. إذا فشل النظام، لن يتم خصم أي رصيد.'
                  : 'Credits are only deducted after successful operations. No charge if the operation fails.'}
              </p>
            </div>

            {/* Subscription Plans */}
            <div className="card">
              <div className="sec-hd">
                <div className="sec-title">⭐ {L('Upgrade or Renew Your Plan', 'ترقية أو تجديد باقة الاشتراك')}</div>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--t2)', marginBottom: '14px' }}>
                {isRTL
                  ? 'اختر باقة الاشتراك الشهرية المناسبة لأعمالك. ستحصل على رصيد كريديت فوري متجدد شهرياً.'
                  : 'Choose the subscription plan that fits your business needs. Credits renew every month.'}
              </p>

              <div className="recharge-grid">
                {/* Starter Plan */}
                {planStarterConfig.visible !== false && (
                  <div className="recharge-card" style={currentPlanName.toLowerCase().includes('starter') ? { borderColor: 'var(--accent)' } : {}}>
                    {planStarterConfig.badge && (
                      <span style={{ fontSize: '10px', background: 'rgba(59,130,246,0.15)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold', marginBottom: '4px', display: 'inline-block' }}>
                        {isRTL ? planStarterConfig.badge : (planStarterConfig.badgeEn || planStarterConfig.badge)}
                      </span>
                    )}
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>🌱</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--t1)' }}>{isRTL ? (planStarterConfig.name || planStarterName) : (planStarterConfig.nameEn || planStarterName)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '2px' }}>{planStarterCredits} {L('Credits/mo', 'كريديت شهرياً')}</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--orange)', margin: '8px 0 12px' }}>{planStarterPrice} {planStarterConfig.currency || currencySymbol}</div>
                    
                    {/* Features Bullet List */}
                    {((isRTL ? planStarterConfig.features : planStarterConfig.featuresEn) || []).length > 0 && (
                      <div style={{ fontSize: '11px', color: 'var(--t2)', textAlign: isRTL ? 'right' : 'left', width: '100%', margin: '8px 0', borderTop: '1px dashed var(--brd)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {((isRTL ? planStarterConfig.features : planStarterConfig.featuresEn) || []).map((feat, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: 'var(--green)' }}>✓</span>
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => handleOpenPaymentModal({ planName: planStarterName, amount: planStarterPrice, currency: planStarterConfig.currency || currencySymbol, planDuration: 'monthly', creditsToAdd: planStarterCredits })}
                      disabled={currentPlanName.toLowerCase().includes('starter')}
                      className="btn btn-prime"
                      style={{ padding: '6px 12px', fontSize: '11.5px', borderRadius: '8px', width: '100%', marginTop: '8px' }}
                    >
                      {currentPlanName.toLowerCase().includes('starter') ? (isRTL ? 'باقتك الحالية' : 'Current Plan') : (isRTL ? (planStarterConfig.ctaText || 'اشتراك') : (planStarterConfig.ctaTextEn || 'Subscribe'))}
                    </button>
                  </div>
                )}

                {/* Growth Plan */}
                {planGrowthConfig.visible !== false && (
                  <div className="recharge-card" style={currentPlanName.toLowerCase().includes('growth') ? { borderColor: 'var(--accent)' } : {}}>
                    {planGrowthConfig.badge && (
                      <span style={{ fontSize: '10px', background: 'rgba(59,130,246,0.15)', color: 'var(--accent)', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold', marginBottom: '4px', display: 'inline-block' }}>
                        {isRTL ? planGrowthConfig.badge : (planGrowthConfig.badgeEn || planGrowthConfig.badge)}
                      </span>
                    )}
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>📈</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--t1)' }}>{isRTL ? (planGrowthConfig.name || planGrowthName) : (planGrowthConfig.nameEn || planGrowthName)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '2px' }}>{planGrowthCredits} {L('Credits/mo', 'كريديت شهرياً')}</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--orange)', margin: '8px 0 12px' }}>{planGrowthPrice} {planGrowthConfig.currency || currencySymbol}</div>
                    
                    {/* Features Bullet List */}
                    {((isRTL ? planGrowthConfig.features : planGrowthConfig.featuresEn) || []).length > 0 && (
                      <div style={{ fontSize: '11px', color: 'var(--t2)', textAlign: isRTL ? 'right' : 'left', width: '100%', margin: '8px 0', borderTop: '1px dashed var(--brd)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {((isRTL ? planGrowthConfig.features : planGrowthConfig.featuresEn) || []).map((feat, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: 'var(--green)' }}>✓</span>
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => handleOpenPaymentModal({ planName: planGrowthName, amount: planGrowthPrice, currency: planGrowthConfig.currency || currencySymbol, planDuration: 'monthly', creditsToAdd: planGrowthCredits })}
                      disabled={currentPlanName.toLowerCase().includes('growth')}
                      className="btn btn-prime"
                      style={{ padding: '6px 12px', fontSize: '11.5px', borderRadius: '8px', width: '100%', marginTop: '8px' }}
                    >
                      {currentPlanName.toLowerCase().includes('growth') ? (isRTL ? 'باقتك الحالية' : 'Current Plan') : (isRTL ? (planGrowthConfig.ctaText || 'ترقية') : (planGrowthConfig.ctaTextEn || 'Upgrade'))}
                    </button>
                  </div>
                )}

                {/* Pro Plan */}
                {planProConfig.visible !== false && (
                  <div className="recharge-card" style={currentPlanName.toLowerCase().includes('pro') ? { borderColor: 'var(--accent)' } : {}}>
                    {planProConfig.badge && (
                      <span style={{ fontSize: '10px', background: 'rgba(249,115,22,0.15)', color: 'var(--orange)', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold', marginBottom: '4px', display: 'inline-block' }}>
                        {isRTL ? planProConfig.badge : (planProConfig.badgeEn || planProConfig.badge)}
                      </span>
                    )}
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>👑</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--t1)' }}>{isRTL ? (planProConfig.name || planProName) : (planProConfig.nameEn || planProName)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '2px' }}>{planProCredits} {L('Credits/mo', 'كريديت شهرياً')}</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--orange)', margin: '8px 0 12px' }}>{planProPrice} {planProConfig.currency || currencySymbol}</div>
                    
                    {/* Features Bullet List */}
                    {((isRTL ? planProConfig.features : planProConfig.featuresEn) || []).length > 0 && (
                      <div style={{ fontSize: '11px', color: 'var(--t2)', textAlign: isRTL ? 'right' : 'left', width: '100%', margin: '8px 0', borderTop: '1px dashed var(--brd)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {((isRTL ? planProConfig.features : planProConfig.featuresEn) || []).map((feat, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: 'var(--green)' }}>✓</span>
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => handleOpenPaymentModal({ planName: planProName, amount: planProPrice, currency: planProConfig.currency || currencySymbol, planDuration: 'monthly', creditsToAdd: planProCredits })}
                      disabled={currentPlanName.toLowerCase().includes('pro')}
                      className="btn btn-prime"
                      style={{ padding: '6px 12px', fontSize: '11.5px', borderRadius: '8px', width: '100%', marginTop: '8px' }}
                    >
                      {currentPlanName.toLowerCase().includes('pro') ? (isRTL ? 'باقتك الحالية' : 'Current Plan') : (isRTL ? (planProConfig.ctaText || 'ابدأ الآن') : (planProConfig.ctaTextEn || 'Subscribe'))}
                    </button>
                  </div>
                )}

                {/* Dynamic Custom Subscription Plans */}
                {customPlans.map((plan, idx) => {
                  const isCurrent = currentPlanName.toLowerCase() === (plan.name || '').toLowerCase();
                  return (
                    <div key={plan.id || idx} className="recharge-card" style={isCurrent ? { borderColor: 'var(--accent)' } : {}}>
                      <div style={{ fontSize: '24px', marginBottom: '4px' }}>{plan.icon || '🚀'}</div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--t1)' }}>{plan.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '2px' }}>{plan.credits} {L('Credits/mo', 'كريديت شهرياً')}</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--orange)', margin: '8px 0 12px' }}>{plan.price} {currencySymbol}</div>
                      <button
                        onClick={() => handleOpenPaymentModal({ planName: plan.name, amount: Number(plan.price), currency: currencySymbol, planDuration: 'monthly', creditsToAdd: Number(plan.credits) })}
                        disabled={isCurrent}
                        className="btn btn-prime"
                        style={{ padding: '6px 12px', fontSize: '11.5px', borderRadius: '8px', width: '100%', marginTop: '8px' }}
                      >
                        {isCurrent ? (isRTL ? 'باقتك الحالية' : 'Current Plan') : (isRTL ? 'اشتراك' : 'Subscribe')}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pricing Packages & Recharge Credits */}
            <div className="card">
              <div className="sec-hd">
                <div className="sec-title">🚀 {L('Recharge Credits instantly', 'شحن رصيد إضافي فوري')}</div>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--t2)', marginBottom: '14px' }}>
                {isRTL
                  ? 'اختر باقة الشحن المناسبة لك لإضافة رصيد لحسابك مباشرة والدفع بشكل آمن.'
                  : 'Choose a recharge option to add credits directly to your balance.'}
              </p>

              <div className="recharge-grid">
                <div className="recharge-card">
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>🎁</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--t1)' }}>{recharge1Credits} Credits</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--orange)', margin: '8px 0 12px' }}>{recharge1Price} {currencySymbol}</div>
                  <button
                    onClick={() => handleOpenPaymentModal({ planName: `${recharge1Credits} Credits Pack`, amount: recharge1Price, currency: currencySymbol, planDuration: 'recharge', creditsToAdd: recharge1Credits })}
                    className="btn btn-prime"
                    style={{ padding: '6px 12px', fontSize: '11.5px', borderRadius: '8px', width: '100%', marginTop: '8px' }}
                  >
                    {isRTL ? 'شراء' : 'Buy Now'}
                  </button>
                </div>

                <div className="recharge-card" style={{ borderColor: 'var(--orange)' }}>
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>🔥</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--t1)' }}>{recharge2Credits} Credits</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--orange)', margin: '8px 0 12px' }}>{recharge2Price} {currencySymbol}</div>
                  <button
                    onClick={() => handleOpenPaymentModal({ planName: `${recharge2Credits} Credits Pack`, amount: recharge2Price, currency: currencySymbol, planDuration: 'recharge', creditsToAdd: recharge2Credits })}
                    className="btn btn-prime"
                    style={{ padding: '6px 12px', fontSize: '11.5px', borderRadius: '8px', width: '100%', marginTop: '8px' }}
                  >
                    {isRTL ? 'شراء' : 'Buy Now'}
                  </button>
                </div>

                <div className="recharge-card">
                  <div style={{ fontSize: '24px', marginBottom: '4px' }}>💎</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--t1)' }}>{recharge3Credits} Credits</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--orange)', margin: '8px 0 12px' }}>{recharge3Price} {currencySymbol}</div>
                  <button
                    onClick={() => handleOpenPaymentModal({ planName: `${recharge3Credits} Credits Pack`, amount: recharge3Price, currency: currencySymbol, planDuration: 'recharge', creditsToAdd: recharge3Credits })}
                    className="btn btn-prime"
                    style={{ padding: '6px 12px', fontSize: '11.5px', borderRadius: '8px', width: '100%', marginTop: '8px' }}
                  >
                    {isRTL ? 'شراء' : 'Buy Now'}
                  </button>
                </div>

                {/* Dynamic Custom Recharge Packages */}
                {customRechargePacks.map((pack, idx) => (
                  <div key={pack.id || idx} className="recharge-card">
                    <div style={{ fontSize: '24px', marginBottom: '4px' }}>{pack.icon || '⚡'}</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--t1)' }}>{pack.name || `${pack.credits} Credits`}</div>
                    <div style={{ fontSize: '12px', color: 'var(--t3)', marginTop: '2px' }}>{pack.credits} {L('Credits', 'كريديت')}</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--orange)', margin: '8px 0 12px' }}>{pack.price} {currencySymbol}</div>
                    <button
                      onClick={() => handleOpenPaymentModal({ planName: pack.name || `${pack.credits} Credits Pack`, amount: Number(pack.price), currency: currencySymbol, planDuration: 'recharge', creditsToAdd: Number(pack.credits) })}
                      className="btn btn-prime"
                      style={{ padding: '6px 12px', fontSize: '11.5px', borderRadius: '8px', width: '100%', marginTop: '8px' }}
                    >
                      {isRTL ? 'شراء' : 'Buy Now'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Payments Log */}
            <div className="card">
              <div className="sec-hd">
                <div className="sec-title">🕒 {L('Billing & Payments History', 'سجل الفواتير والدفع')}</div>
              </div>

              {loadingHistory ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--t3)' }}>{L('Loading history...', 'جاري التحميل...')}</div>
              ) : recentPayments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--t3)', fontSize: '12.5px' }}>
                  {L('No billing payments history found.', 'لا يوجد سجل فواتير دفع متوفر حالياً.')}
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--brd)', opacity: 0.8 }}>
                        <th style={{ padding: '8px 6px', fontWeight: '700', color: 'var(--t2)', textAlign: isRTL ? 'right' : 'left' }}>{L('Plan / Type', 'الخطة / النوع')}</th>
                        <th style={{ padding: '8px 6px', fontWeight: '700', color: 'var(--t2)', textAlign: isRTL ? 'right' : 'left' }}>{L('Amount', 'المبلغ')}</th>
                        <th style={{ padding: '8px 6px', fontWeight: '700', color: 'var(--t2)', textAlign: isRTL ? 'right' : 'left' }}>{L('Status', 'الحالة')}</th>
                        <th style={{ padding: '8px 6px', fontWeight: '700', color: 'var(--t2)', textAlign: isRTL ? 'right' : 'left' }}>{L('Date', 'التاريخ')}</th>
                        <th style={{ padding: '8px 6px', fontWeight: '700', color: 'var(--t2)', textAlign: isRTL ? 'right' : 'left' }}>{L('Invoice', 'الفاتورة')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPayments.map((pay) => {
                        let statusColor = 'var(--amber)';
                        let statusLbl = L('Pending', 'معلق');
                        if (pay.status === 'approved') { statusColor = 'var(--green)'; statusLbl = L('Paid', 'تم الدفع'); }
                        if (pay.status === 'rejected') { statusColor = 'var(--red)'; statusLbl = L('Rejected', 'مرفوض'); }

                        const payDate = pay.createdAt?.toDate
                          ? pay.createdAt.toDate().toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')
                          : '—';

                        return (
                          <tr key={pay.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '10px 6px', fontWeight: '600', color: 'var(--t1)' }}>
                              {pay.planDuration === 'recharge'
                                ? L('Credits Recharge', 'شحن رصيد كريديت')
                                : L(pay.planDuration, pay.planDuration === 'annual' ? 'خطة سنوية' : 'خطة شهرية')
                              }
                            </td>
                            <td style={{ padding: '10px 6px', fontWeight: '700', color: 'var(--t1)' }}>
                              {Number(pay.amount || 0).toFixed(2)} {pay.currency}
                            </td>
                            <td style={{ padding: '10px 6px' }}>
                              <span style={{ color: statusColor, background: `${statusColor}10`, padding: '2px 8px', borderRadius: '12px', fontSize: '10.5px', fontWeight: '700' }}>
                                {statusLbl}
                              </span>
                            </td>
                            <td style={{ padding: '10px 6px', color: 'var(--t3)', fontSize: '11.5px' }}>{payDate}</td>
                            <td style={{ padding: '10px 6px' }}>
                              {pay.receiptUrl ? (
                                <a href={pay.receiptUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--orange)', textDecoration: 'underline' }}>
                                  PDF 📥
                                </a>
                              ) : '—'}
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

          {/* Right Column: Plan Card & Card Info & Usage Analytics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Plan Info Card */}
            <div className="card" style={{ borderTop: '4px solid var(--orange)' }}>
              <div className="sec-hd" style={{ marginBottom: '8px' }}>
                <div className="sec-title">⭐ {L('Current Subscription', 'الاشتراك الحالي')}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '10px', border: '1px solid var(--brd)' }}>
                <div className="card-row">
                  <span style={{ color: 'var(--t2)' }}>{L('Subscription Plan', 'خطة الاشتراك')}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--orange)' }}>{currentPlanName}</span>
                </div>
                <div className="card-row">
                  <span style={{ color: 'var(--t2)' }}>{L('Price', 'سعر الاشتراك')}</span>
                  <span>{planPriceLabel}</span>
                </div>
                <div className="card-row">
                  <span style={{ color: 'var(--t2)' }}>{L('Next Renewal', 'التجديد القادم')}</span>
                  <span>{expiryDateString}</span>
                </div>
                <div className="card-row">
                  <span style={{ color: 'var(--t2)' }}>{L('Status', 'الحالة')}</span>
                  <span style={{ color: statusBadgeColor, fontWeight: '700' }}>● {statusText}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Details */}
            <div className="card">
              <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '8px' }}>💳 {L('Payment Method', 'طريقة الدفع المسجلة')}</h3>
              <div style={{ background: 'var(--surface2)', padding: '14px', borderRadius: '10px', border: '1px solid var(--brd)', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--t3)' }}>
                  <span>💳</span>
                  <span>{L('No card on file – payments via Stripe checkout', 'لا توجد بطاقة محفوظة – الدفع عبر بوابة Stripe')}</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '8px', lineHeight: '1.5' }}>
                  {L(
                    'Your card details are securely managed by Stripe. You will be prompted to enter payment details when purchasing a plan or recharging credits.',
                    'يتم إدارة بيانات بطاقتك بشكل آمن عبر Stripe. سيُطلب منك إدخال بيانات الدفع عند شراء باقة أو شحن رصيد.'
                  )}
                </p>
              </div>
            </div>

            {/* Usage Summary Analytics Box (Upsell) */}
            <div className="card" style={{ borderLeft: '4px solid var(--purple)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '10px' }}>📈 {L('Usage Summary', 'ملخص الاستخدام الشهري')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--t2)' }}>{L('Credits Used This Month', 'رصيد مستهلك هذا الشهر')}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--t1)' }}>{thisMonthCreditsUsed.toFixed(2)} Credits</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--t2)' }}>{L('Most Used Tool', 'الأداة الأكثر استخداماً')}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--orange)' }}>{mostUsedTool}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--t2)' }}>{L('Remaining Balance', 'الرصيد المتبقي')}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--green)' }}>{formatBalance(userCredits)} Credits</span>
                </div>

                <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(108,53,255,0.08)', borderRadius: '8px', border: '1px solid rgba(108,53,255,0.15)' }}>
                  <p style={{ fontSize: '11px', color: 'var(--t2)', margin: '0 0 6px 0', lineHeight: '1.4' }}>
                    {recommendationText}
                  </p>
                  {showRecommendButton && (
                    <button
                      onClick={() => handleOpenPaymentModal({ planName: recommendedPlan, amount: recommendedPrice, currency: currencySymbol, planDuration: 'monthly', creditsToAdd: recommendedCredits })}
                      disabled={currentPlanName.toLowerCase() === recommendedPlan.toLowerCase()}
                      className="btn btn-prime"
                      style={{ padding: '6px 12px', fontSize: '11.5px', borderRadius: '8px', width: '100%', marginTop: '8px' }}
                    >
                      {isRTL ? `ترقية إلى ${recommendedPlan}` : `Upgrade to ${recommendedPlan}`}
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'credit-history' && (
        <div className="card">
          <div className="sec-hd">
            <div className="sec-title">🕒 {L('Detailed Credit History log', 'سجل تفاصيل استهلاك الرصيد')}</div>
          </div>

          {loadingCredits ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--t3)' }}>{L('Loading credit history...', 'جاري التحميل...')}</div>
          ) : creditLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '35px', color: 'var(--t3)' }}>
              {L('No credit deduction transactions logged yet.', 'لا يوجد سجل استهلاك كريديت حالياً.')}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--brd)', opacity: 0.8 }}>
                    <th style={{ padding: '10px 8px', fontWeight: '700', color: 'var(--t2)', textAlign: isRTL ? 'right' : 'left' }}>{L('Date & Time', 'الوقت والتاريخ')}</th>
                    <th style={{ padding: '10px 8px', fontWeight: '700', color: 'var(--t2)', textAlign: isRTL ? 'right' : 'left' }}>{L('AI Tool Used', 'الأداة المستخدمة')}</th>
                    <th style={{ padding: '10px 8px', fontWeight: '700', color: 'var(--t2)', textAlign: isRTL ? 'right' : 'left' }}>{L('Credits Used', 'رصيد مستهلك')}</th>
                  </tr>
                </thead>
                <tbody>
                  {creditLogs.map((log) => {
                    const ts = log.timestamp;
                    const logDate = ts?.toDate ? ts.toDate() : (ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts));
                    const formatted = logDate.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    // Deduct credit indicator
                    const consumedCredits = Number(log.creditsDeducted || log.cost || 0);

                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '12px 8px', color: 'var(--t3)', fontSize: '12px' }}>{formatted}</td>
                        <td style={{ padding: '12px 8px', fontWeight: '600', color: 'var(--t1)' }}>
                          <span style={{ background: 'var(--surface2)', padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--brd)', fontSize: '11.5px' }}>
                            {log.tool || 'General AI Query'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', fontWeight: '800', color: 'var(--red)', fontFamily: 'var(--mono)' }}>
                          -{consumedCredits.toFixed(2)} Credits
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}


      {/* Payment Modal */}
      {paymentModalOpen && selectedPackage && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button
              onClick={() => setPaymentModalOpen(false)}
              style={{ position: 'absolute', top: '15px', right: isRTL ? 'auto' : '15px', left: isRTL ? '15px' : 'auto', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--t2)' }}
            >
              ×
            </button>
            <div className="sec-hd" style={{ marginBottom: '15px' }}>
              <div className="sec-title">💳 {L('Complete Your Payment', 'إتمام عملية الدفع')}</div>
            </div>

            <div style={{ background: 'var(--surface2)', padding: '15px', borderRadius: '10px', marginBottom: '20px', border: '1px solid var(--brd)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--t2)', fontSize: '13px' }}>{L('Selected Plan', 'الباقة المختارة')}</span>
                <span style={{ fontWeight: 'bold', color: 'var(--orange)' }}>{selectedPackage.planName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--t2)', fontSize: '13px' }}>{L('Amount to Pay', 'المبلغ المطلوب')}</span>
                <span style={{ fontWeight: 'bold', color: 'var(--t1)' }}>{selectedPackage.amount} {selectedPackage.currency}</span>
              </div>
            </div>

            {activeMethods.length === 0 ? (
              <p style={{ color: 'var(--t3)', fontSize: '12.5px', textAlign: 'center', padding: '15px' }}>
                {L('No payment methods configured by administrator. Please contact support.', 'لم يقم مسؤول النظام بتكوين أي طرق دفع بعد. يرجى التواصل مع الدعم.')}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--t1)', display: 'block', marginBottom: '10px' }}>
                    {L('Choose Payment Method', 'اختر وسيلة الدفع')}
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
                    {activeMethods.map((method) => {
                      const isActive = selectedMethod === method;
                      let label = '';
                      let icon = '';
                      if (method === 'stripe') { label = L('Credit Card', 'بطاقة ائتمان'); icon = '💳'; }
                      if (method === 'instapay') { label = L('Instapay', 'انستاباي'); icon = '⚡'; }
                      if (method === 'vodafoneCash') { label = L('Vodafone Cash', 'فودافون كاش'); icon = '📱'; }
                      if (method === 'paypal') { label = L('PayPal', 'بايبال'); icon = '🌐'; }

                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setSelectedMethod(method)}
                          className={`btn ${isActive ? 'btn-prime' : 'btn-ghost'}`}
                          style={{
                            padding: '12px 6px',
                            fontSize: '11.5px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            justifyContent: 'center',
                            borderRadius: '10px'
                          }}
                        >
                          <span style={{ fontSize: '20px' }}>{icon}</span>
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedMethod === 'stripe' && (
                  <div style={{ marginTop: '10px' }}>
                    <StripePaymentButton
                      amount={selectedPackage.amount}
                      currency={selectedPackage.currency}
                      planName={selectedPackage.planName}
                      planDuration={selectedPackage.planDuration}
                      creditsToAdd={selectedPackage.creditsToAdd}
                      userId={currentUser?.uid}
                      adminId={userData?.adminId}
                      buttonText={isRTL ? 'الدفع الآن باستخدام البطاقة' : 'Pay Now with Card'}
                      style={{ padding: '12px', fontSize: '13px', borderRadius: '8px', width: '100%', fontWeight: 'bold' }}
                    />
                  </div>
                )}

                {selectedMethod !== 'stripe' && selectedMethod !== '' && (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitManual(e).then(() => {
                      if (!error) {
                        setTimeout(() => setPaymentModalOpen(false), 2000);
                      }
                    });
                  }} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>

                    {/* Gateway Transfer instruction details */}
                    <div style={{ background: 'var(--surface2)', border: '1px solid var(--brd)', borderRadius: '12px', padding: '14px', fontSize: '12.5px', color: 'var(--t1)' }}>
                      {selectedMethod === 'instapay' && (
                        <div>
                          <div style={{ fontWeight: '700', color: 'var(--a)', marginBottom: '4px' }}>⚡ {L('Instapay Transfer Details', 'تفاصيل التحويل عبر انستاباي')}</div>
                          <div>{L('Please transfer the amount to the address below:', 'يرجى تحويل قيمة الاشتراك إلى العنوان التالي:')}</div>
                          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px', fontWeight: '700', marginTop: '8px', border: '1px dashed var(--brd)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{paymentMethods.instapay?.address}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(paymentMethods.instapay?.address);
                                showToast(L('Address copied!', 'تم نسخ العنوان!'));
                              }}
                              style={{ background: 'none', border: 'none', color: 'var(--a)', cursor: 'pointer' }}
                            >
                              📋
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedMethod === 'vodafoneCash' && (
                        <div>
                          <div style={{ fontWeight: '700', color: '#EF4444', marginBottom: '4px' }}>📱 {L('Vodafone Cash Transfer Details', 'تفاصيل التحويل عبر فودافون كاش')}</div>
                          <div>{L('Please transfer the amount to the wallet number below:', 'يرجى تحويل قيمة الاشتراك إلى رقم المحفظة التالي:')}</div>
                          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px', fontWeight: '700', marginTop: '8px', border: '1px dashed var(--brd)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{paymentMethods.vodafoneCash?.number}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(paymentMethods.vodafoneCash?.number);
                                showToast(L('Number copied!', 'تم نسخ الرقم!'));
                              }}
                              style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                            >
                              📋
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedMethod === 'paypal' && (
                        <div>
                          <div style={{ fontWeight: '700', color: '#3b82f6', marginBottom: '4px' }}>🌐 {L('PayPal Transfer Details', 'تفاصيل التحويل عبر بايبال')}</div>
                          <div>{L('Please send payment to the PayPal address below:', 'يرجى إرسال الدفع إلى عنوان بايبال التالي:')}</div>
                          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px', fontWeight: '700', marginTop: '8px', border: '1px dashed var(--brd)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{paymentMethods.paypal?.email}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(paymentMethods.paypal?.email);
                                showToast(L('Email copied!', 'تم نسخ الإيميل!'));
                              }}
                              style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}
                            >
                              📋
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Screenshot Proof of Payment', 'إرفاق لقطة شاشة لإثبات التحويل')}</label>
                      <div style={{ border: '1px dashed var(--brd)', borderRadius: '10px', padding: '14px', textAlign: 'center', position: 'relative', cursor: 'pointer' }}>
                        <input type="file" accept="image/*" onChange={handleFileChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                        <div style={{ fontSize: '20px', marginBottom: '4px' }}>📷</div>
                        <div style={{ fontSize: '12px', color: 'var(--t1)', fontWeight: '600' }}>
                          {file ? file.name : L('Choose transfer receipt screenshot', 'اضغط هنا لرفع إيصال التحويل')}
                        </div>
                      </div>
                    </div>

                    {uploading && (
                      <div style={{ width: '100%', background: 'var(--surface2)', borderRadius: '10px', height: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${uploadProgress}%`, background: 'var(--a)', height: '100%', transition: 'width 0.2s' }}></div>
                      </div>
                    )}

                    {error && <div style={{ color: 'var(--red)', fontSize: '12px', background: 'rgba(239,68,68,0.1)', padding: '8px 12px', borderRadius: '8px' }}>⚠️ {error}</div>}
                    {submitted && <div style={{ color: 'var(--green)', fontSize: '12px', background: 'rgba(16,185,129,0.1)', padding: '8px 12px', borderRadius: '8px', textAlign: 'center' }}>✓ {L('Receipt uploaded successfully. Awaiting admin review.', 'تم إرسال إثبات الدفع! بانتظار مراجعة الإدارة.')}</div>}

                    <button type="submit" disabled={uploading} className="btn btn-prime" style={{ width: '100%', padding: '12px', fontWeight: 'bold' }}>
                      {uploading ? `${L('Uploading proof', 'جاري الإرسال')} (${uploadProgress}%)` : L('Submit Payment Receipt', 'تأكيد وإرسال إثبات الدفع')}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
