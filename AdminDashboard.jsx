import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  Smartphone
} from 'lucide-react';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
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
import { initializeApp } from 'firebase/app';
import { db, firebaseConfig } from '../services/firebase';
import { useAuth } from '../auth/AuthContext';
import BrandingSettings from './BrandingSettings';
import PaymentSettingsPage from './PaymentSettingsPage';

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

const AdminDashboard = () => {
  const { currentUser, userData } = useAuth();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'stats';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [tenantFreeTrial, setTenantFreeTrial] = useState({ enabled: false, days: 7 });
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
    subscriptionDuration: '1'
  });

  const generateLicenseKey = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const key = `GS-${segment()}-${segment()}-${segment()}`;
    setNewUser(prev => ({ ...prev, licenseKey: key }));
  };

  const stats = [
    { label: userData?.role === 'super_admin' ? t('admin.totalUsers') : t('admin.myUsers'), value: users.length.toString(), change: 'Real-time', icon: <Users size={20} />, color: 'var(--accent)' },
    userData?.role === 'super_admin' && { label: t('admin.totalProjects'), value: projectCount.toString(), change: 'Sync', icon: <Target size={20} />, color: 'var(--green)' },
    userData?.role === 'admin' && {
      label: t('admin.totalSales'),
      value: `${sales.reduce((acc, s) => acc + Number(s.amount), 0)} ${t('admin.currency')}`,
      change: 'Total',
      icon: <DollarSign size={20} />,
      color: 'var(--green)'
    },
    userData?.role === 'admin' && {
      label: t('admin.avgProfit'),
      value: sales.length ? `${Math.round(sales.reduce((acc, s) => acc + Number(s.amount), 0) / sales.length)} ${t('admin.currency')}` : '0',
      change: 'Avg',
      icon: <TrendingUp size={20} />,
      color: 'var(--accent)'
    },
    { label: userData?.role === 'super_admin' ? t('admin.activeAdmins') : t('admin.accountStatus'), value: userData?.role === 'super_admin' ? adminCount.toString() : t('common.active'), change: 'Live', icon: <Zap size={20} />, color: 'var(--amber)' },
  ].filter(Boolean);

  const fetchUsers = () => {
    setLoading(true);
    let q;
    if (userData?.role === 'super_admin') {
      q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    } else {
      q = query(
        collection(db, 'users'),
        where('adminId', '==', currentUser?.uid || '')
      );
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const allUsers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(allUsers);

      const months = t('months', { returnObjects: true });
      const currentMonth = new Date().getMonth();
      const last7 = [];
      for (let i = 6; i >= 0; i--) {
        const m = (currentMonth - i + 12) % 12;
        const count = allUsers.filter(u => u.createdAt?.toDate().getMonth() === m).length;
        last7.push({ name: months[m], value: count });
      }
      setGrowthData(last7);

      if (userData?.role === 'super_admin') {
        setAdminCount(allUsers.filter(u => u.role === 'admin').length);
      }
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError(t('admin.errorSyncUsers'));
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
      where('adminId', '==', currentUser?.uid || ''),
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
          adminId: currentUser.uid,
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
      where('adminId', '==', currentUser?.uid || ''),
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
      collection(db, 'payments'),
      where('adminId', '==', currentUser?.uid || '')
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
      if (userSnap.exists()) {
        currentExpires = userSnap.data().expiresAt;
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
      
      await setDoc(userRef, {
        expiresAt: newExpiresDate
      }, { merge: true });
      
      await setDoc(doc(db, 'payments', payment.id), {
        status: 'approved',
        approvedAt: serverTimestamp()
      }, { merge: true });
      
      await setDoc(doc(collection(db, 'sales')), {
        userId: payment.userId,
        customerName: payment.userName || payment.userEmail.split('@')[0],
        amount: Number(payment.amount),
        adminId: currentUser.uid,
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
        adminId: currentUser.uid,
        adminEmail: currentUser.email,
        adminName: currentUser.email.split('@')[0],
        subscriptionType: newUser.subscriptionType,
        subscriptionDuration: newUser.subscriptionType === 'lifetime' ? null : newUser.subscriptionDuration,
        expiresAt: expiresAt,
        createdAt: serverTimestamp()
      });

      await signOut(secondaryAuth);
      setShowAddModal(false);
      setNewUser({ name: '', email: '', password: '', phoneNumber: '', licenseKey: '', role: 'user', subscriptionType: 'months', subscriptionDuration: '1' });
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(t('admin.confirmDeleteUser'))) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (err) {
      setError(t('admin.errorDeleteUser') + err.message);
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
    setEditingUser({
      ...user,
      phoneNumber: user.phoneNumber?.replace(countryData[user.country || 'EG'].code, '') || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      let expiresAt = null;
      if (editingUser.subscriptionType === 'days') {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(editingUser.subscriptionDuration));
      } else if (editingUser.subscriptionType === 'months') {
        expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + parseInt(editingUser.subscriptionDuration));
      }

      await setDoc(doc(db, 'users', editingUser.id), {
        name: editingUser.name,
        phoneNumber: `${countryData[editingUser.country || 'EG'].code}${editingUser.phoneNumber}`,
        licenseKey: editingUser.licenseKey,
        country: editingUser.country || 'EG',
        subscriptionType: editingUser.subscriptionType,
        subscriptionDuration: editingUser.subscriptionType === 'lifetime' ? null : editingUser.subscriptionDuration,
        expiresAt: expiresAt
      }, { merge: true });

      setShowEditModal(false);
      setEditingUser(null);
    } catch (err) {
      setError(t('admin.errorUpdateUser') + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    let unsubUsers;
    let unsubSales;
    let unsubPayments;
    let unsubAllPayments;
    if (currentUser && userData) {
      unsubUsers = fetchUsers();
      fetchProjectStats();
      fetchLibraryStats();
      if (userData.role === 'admin') {
        unsubSales = fetchSales();
        unsubPayments = fetchPendingPayments();
        unsubAllPayments = fetchAllPayments();
        getDoc(doc(db, 'tenants', currentUser.uid)).then(snap => {
          if (snap.exists() && snap.data().freeTrial) setTenantFreeTrial(snap.data().freeTrial);
        }).catch(() => {});
      }
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
    const trialDays = tenantFreeTrial.days || 7;
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
    const expiresMs = ts?.toDate ? ts.toDate().getTime() : (ts?.seconds ? ts.seconds * 1000 : 0);
    if (Date.now() > expiresMs) return { expired: true, daysLeft: 0 };
    return { expired: false, daysLeft: Math.max(1, Math.ceil((expiresMs - Date.now()) / 86400000)) };
  };

  const filteredUsers = users.filter(u =>
    (u.email || u.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const dateLocale = isRTL ? 'ar-EG' : 'en-US';

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

  return (
    <div style={{ animation: 'fadeSlide 0.4s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingTop: '8px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text)' }}>
            {activeTab === 'users' ? t('admin.usersTitle') :
             activeTab === 'sales' ? t('admin.salesTitle') :
             activeTab === 'branding' ? t('admin.brandingTitle') :
             activeTab === 'payments' ? t('admin.paymentsTitle') :
             t('admin.statsTitle')}
          </h2>
          <p style={{ color: 'var(--text2)', fontSize: '14px' }}>
            {activeTab === 'users' ? t('admin.usersDesc') :
             activeTab === 'sales' ? t('admin.salesDesc') :
             activeTab === 'branding' ? t('admin.brandingDesc') :
             activeTab === 'payments' ? t('admin.paymentsDesc') :
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
          <div className="grid-4" style={{ marginBottom: '24px' }}>
            {stats.map((stat, i) => (
              <div key={i} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    background: `rgba(255,255,255,0.03)`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--line)',
                    color: stat.color
                  }}>
                    {stat.icon}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    color: stat.change.startsWith('+') ? 'var(--green)' : 'var(--text3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    background: stat.change.startsWith('+') ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                    padding: '4px 8px',
                    borderRadius: '20px'
                  }}>
                    {stat.change}
                    {stat.change.startsWith('+') ? <ArrowUpRight size={10} /> : null}
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text)', marginBottom: '4px', fontFamily: 'var(--mono)' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: '700', textTransform: 'uppercase' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="grid-2">
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text)' }}>{t('admin.userGrowth')}</h3>
                <div className="badge badge-blue">{t('admin.last7Months')}</div>
              </div>
              <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '20px' }}>
                {growthData.map((d, i) => {
                  const max = Math.max(...growthData.map(x => x.value)) || 1;
                  const h = (d.value / max) * 100;
                  return (
                    <div key={i} style={{ flex: 1, position: 'relative' }}>
                      <div style={{
                        height: `${Math.max(h, 5)}%`,
                        background: i === growthData.length - 1 ? 'var(--accent)' : 'var(--bg4)',
                        borderRadius: '6px',
                        transition: 'height 1s ease',
                        boxShadow: i === growthData.length - 1 ? '0 0 20px rgba(59, 130, 246, 0.3)' : 'none'
                      }}></div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text3)', fontWeight: '700' }}>
                {growthData.map((d, i) => <span key={i}>{d.name}</span>)}
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text)' }}>{t('admin.platformDist')}</h3>
                <Activity size={16} color="var(--text3)" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {platformStats.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: '12px', padding: '20px' }}>{t('admin.noPlatformData')}</div>
                ) : platformStats.map((p, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                      <span style={{ fontWeight: '700' }}>{p.name}</span>
                      <span style={{ color: 'var(--text2)' }}>{p.pct}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--bg)', borderRadius: '10px', overflow: 'hidden' }}>
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
              <button className="btn btn-full btn-sm" style={{ marginTop: '24px' }}>{t('admin.downloadReport')}</button>
            </div>
          </div>

          <div className="card" style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text)', marginBottom: '4px' }}>
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
            <div style={{ padding: '20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>{t('admin.salesRecord')}</h3>
              <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                <Search size={16} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                <input
                  className="form-control"
                  style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '36px' }}
                  placeholder={t('admin.searchClient')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ textAlign: 'start' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text3)', fontWeight: '800' }}>{t('admin.totalSalesLabel')}</div>
                  <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--green)' }}>
                    {sales.reduce((acc, s) => acc + Number(s.amount), 0)} {t('admin.currency')}
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
                  {sales.filter(s => (s.customerName || '').toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>{t('admin.noSalesFound')}</td>
                    </tr>
                  ) : (
                    sales.filter(s => (s.customerName || '').toLowerCase().includes(searchTerm.toLowerCase())).map(sale => (
                      <tr key={sale.id} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '16px 20px', fontWeight: '700' }}>{sale.customerName}</td>
                        <td style={{ padding: '16px 20px', color: 'var(--green)', fontWeight: '800' }}>{sale.amount} {t('admin.currency')}</td>
                        <td style={{ padding: '16px 20px', color: 'var(--text2)', fontSize: '12px' }}>
                          {sale.createdAt?.toDate().toLocaleDateString(dateLocale)}
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

          {/* Transactions & Receipt Audit History Card */}
          <div className="card" style={{ padding: '0', overflow: 'hidden', marginTop: '24px' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>{t('branding.allPaymentsTitle')}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text3)', margin: '4px 0 0 0' }}>{t('branding.allPaymentsDesc')}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Search field */}
                <div style={{ position: 'relative', width: '200px' }}>
                  <Search size={14} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                  <input
                    className="form-control"
                    style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '30px', fontSize: '12px', padding: '6px 12px' }}
                    placeholder={t('branding.searchPaymentPlaceholder')}
                    value={paymentSearchTerm}
                    onChange={(e) => setPaymentSearchTerm(e.target.value)}
                  />
                </div>
                {/* Status Filter select */}
                <select
                  className="form-control"
                  style={{ width: '130px', fontSize: '12px', padding: '6px 12px' }}
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                >
                  <option value="all">{t('branding.filterAll')}</option>
                  <option value="approved">{t('branding.filterApproved')}</option>
                  <option value="pending">{t('branding.filterPending')}</option>
                  <option value="rejected">{t('branding.filterRejected')}</option>
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
                      {t('branding.statusCol')}
                    </th>
                    <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '11px', color: 'var(--text2)', fontWeight: '700', textTransform: 'uppercase' }}>
                      {t('branding.receiptCol')}
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
                    const filtered = allPayments.filter(pay => {
                      const matchesSearch = 
                        (pay.userName || '').toLowerCase().includes(paymentSearchTerm.toLowerCase()) ||
                        (pay.userEmail || '').toLowerCase().includes(paymentSearchTerm.toLowerCase());
                      const matchesStatus = 
                        paymentStatusFilter === 'all' || pay.status === paymentStatusFilter;
                      return matchesSearch && matchesStatus;
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: 'var(--text3)', fontSize: '12px' }}>
                            {t('branding.noPaymentsFound')}
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((pay) => (
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
                          <span className={`badge ${
                            pay.status === 'approved' ? 'badge-green' : pay.status === 'pending' ? 'badge-amber' : 'badge-red'
                          }`} style={{
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
          </div>
        </div>
      ) : activeTab === 'branding' && userData?.role === 'admin' ? (
        <BrandingSettings />
      ) : activeTab === 'payments' && userData?.role === 'admin' ? (
        <PaymentSettingsPage />
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '24px' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>{t('admin.myUsersTitle')}</h3>
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <Search size={16} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
              <input
                className="form-control"
                style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '36px' }}
                placeholder={t('admin.searchUser')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}><div className="loader"></div></div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--line)' }}>
                  <th style={{ padding: '16px 20px', textAlign: 'start', fontSize: '12px', color: 'var(--text2)' }}>{t('admin.userCol')}</th>
                  <th style={{ padding: '16px 20px', textAlign: 'start', fontSize: '12px', color: 'var(--text2)' }}>{t('admin.statusCode')}</th>
                  <th style={{ padding: '16px 20px', textAlign: 'start', fontSize: '12px', color: 'var(--text2)' }}>{t('admin.phoneCol')}</th>
                  <th style={{ padding: '16px 20px', textAlign: 'start', fontSize: '12px', color: 'var(--text2)' }}>{t('admin.joinDateCol')}</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '12px', color: 'var(--text2)' }}>{t('admin.operationsCol')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: 'var(--text3)' }}>{t('admin.noUsers')}</td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="user-avatar" style={{ width: '30px', height: '30px', fontSize: '12px' }}>{(user.name || user.email).charAt(0).toUpperCase()}</div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '14px', fontWeight: '700' }}>{user.name || t('admin.newUser')}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text3)' }}>{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        {user.isTrial ? (() => {
                          const ts = getTrialStatus(user);
                          if (!ts) return <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{t('admin.freeTrial')}</span>;
                          if (ts.expired) return (
                            <span style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--red)', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                              ❌ {t('admin.trialExpired')}
                            </span>
                          );
                          return (
                            <span style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                              ⏰ {t('admin.daysLeft', { count: ts.daysLeft })}
                            </span>
                          );
                        })() : (
                          <div>
                            <code style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', color: 'var(--accent)' }}>
                              {user.licenseKey || t('admin.noCode')}
                            </code>
                            {user.expiresAt && (() => {
                              const ss = getSubscriptionStatus(user);
                              if (ss.expired) return <div style={{ color: 'var(--red)', fontSize: '11px', marginTop: '4px', fontWeight: '700' }}>❌ {t('admin.expired')}</div>;
                              return <div style={{ color: 'var(--green)', fontSize: '11px', marginTop: '4px', fontWeight: '700' }}>⏰ {t('admin.daysLeft', { count: ss.daysLeft })}</div>;
                            })()}
                            {!user.expiresAt && <div style={{ color: 'var(--accent)', fontSize: '11px', marginTop: '4px', fontWeight: '700' }}>♾ {t('admin.lifetimeStatus')}</div>}
                            <div style={{ fontSize: '10px', color: (user.devices?.length || 0) >= 2 ? 'var(--amber)' : 'var(--text3)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Smartphone size={9} />
                              {t('admin.devicesCount', { count: user.devices?.length || 0 })}
                            </div>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text2)', fontSize: '13px' }}>
                        {user.phoneNumber || '—'}
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text2)', fontSize: '13px' }}>
                        {user.createdAt?.toDate().toLocaleDateString(dateLocale)}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleEditClick(user)}
                          className="btn btn-ghost btn-sm"
                          title={t('common.edit')}
                          style={{ padding: '6px' }}
                        >
                          <Edit3 size={14} />
                        </button>
                        {!user.isTrial && (
                          <button
                            onClick={() => handleResetDevices(user.id)}
                            className="btn btn-ghost btn-sm"
                            title={`${t('admin.resetDevicesTitle')} (${user.devices?.length || 0}/2)`}
                            style={{ padding: '6px', color: 'var(--amber)' }}
                          >
                            <Smartphone size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="btn btn-ghost btn-sm"
                          title={t('common.delete')}
                          style={{ padding: '6px', color: 'var(--red)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: 0, animation: 'scaleUp 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>{t('admin.editUserTitle')}</h3>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>{editingUser.email}</div>
            </div>
            {error && <div style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '15px' }}>{error}</div>}
            <form onSubmit={handleUpdateUser}>
              <div className="field" style={{ marginBottom: '12px' }}>
                <label className="field-label">{t('admin.userNameLabel')}</label>
                <input
                  className="form-control"
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                  placeholder={t('common.fullName')}
                />
              </div>

              <div className="grid-2" style={{ gap: '12px', marginBottom: '12px' }}>
                <div className="field">
                  <label className="field-label">{t('common.country')}</label>
                  <select
                    className="form-control"
                    value={editingUser.country}
                    onChange={e => setEditingUser({ ...editingUser, country: e.target.value })}
                  >
                    <option value="EG">{t('countries.EG')}</option>
                    <option value="SA">{t('countries.SA')}</option>
                    <option value="AE">{t('countries.AE')}</option>
                    <option value="KW">{t('countries.KW')}</option>
                    <option value="QA">{t('countries.QA')}</option>
                    <option value="JO">{t('countries.JO')}</option>
                    <option value="MA">{t('countries.MA')}</option>
                    <option value="TN">{t('countries.TN')}</option>
                    <option value="OTHER">{t('countries.OTHER')}</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">{t('common.phoneNumber')}</label>
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
                  <label className="field-label">{t('common.subType')}</label>
                  <select
                    className="form-control"
                    value={editingUser.subscriptionType || 'months'}
                    onChange={e => setEditingUser({ ...editingUser, subscriptionType: e.target.value, subscriptionDuration: e.target.value === 'lifetime' ? '' : '1' })}
                  >
                    <option value="days">{t('common.daysOpt')}</option>
                    <option value="months">{t('common.monthsOpt')}</option>
                    <option value="lifetime">{t('common.lifetimeOpt')}</option>
                  </select>
                </div>
                {(editingUser.subscriptionType || 'months') !== 'lifetime' && (
                  <div className="field">
                    <label className="field-label">{t('common.duration')}</label>
                    <input
                      className="form-control"
                      type="number"
                      min="1"
                      required
                      value={editingUser.subscriptionDuration || '1'}
                      onChange={e => setEditingUser({ ...editingUser, subscriptionDuration: e.target.value })}
                      placeholder={t('common.duration')}
                    />
                  </div>
                )}
              </div>

              <div className="field" style={{ marginBottom: '20px' }}>
                <label className="field-label">{t('common.licenseKey')}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    className="form-control"
                    type="text"
                    required
                    readOnly
                    value={editingUser.licenseKey}
                    placeholder="GS-XXXX-XXXX-XXXX"
                    style={{ background: 'rgba(255,255,255,0.03)', cursor: 'default' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                      const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
                      const key = `GS-${segment()}-${segment()}-${segment()}`;
                      setEditingUser(prev => ({ ...prev, licenseKey: key }));
                    }}
                    className="btn btn-sm"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <Zap size={14} /> {t('common.updateCode')}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => { setShowEditModal(false); setError(null); }} className="btn" style={{ flex: 1 }}>{t('common.cancel')}</button>
                <button type="submit" disabled={isCreating} className="btn btn-primary" style={{ flex: 1 }}>
                  {isCreating ? t('common.saving') : t('common.saveChanges')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: 0, animation: 'scaleUp 0.3s ease' }}>
            <h3 style={{ marginBottom: '20px' }}>{t('admin.addNewUserTitle')}</h3>
            {error && <div style={{ color: 'var(--red)', fontSize: '13px', marginBottom: '15px' }}>{error}</div>}
            <form onSubmit={handleAddUser}>
              <div className="field" style={{ marginBottom: '12px' }}>
                <label className="field-label">{t('admin.userNameLabel')}</label>
                <input className="form-control" type="text" required value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder={t('common.fullName')} />
              </div>

              <div className="grid-2" style={{ gap: '12px', marginBottom: '12px' }}>
                <div className="field">
                  <label className="field-label">{t('common.country')}</label>
                  <select className="form-control" value={newUser.country} onChange={e => setNewUser({ ...newUser, country: e.target.value })}>
                    <option value="EG">{t('countries.EG')}</option>
                    <option value="SA">{t('countries.SA')}</option>
                    <option value="AE">{t('countries.AE')}</option>
                    <option value="KW">{t('countries.KW')}</option>
                    <option value="QA">{t('countries.QA')}</option>
                    <option value="JO">{t('countries.JO')}</option>
                    <option value="MA">{t('countries.MA')}</option>
                    <option value="TN">{t('countries.TN')}</option>
                    <option value="OTHER">{t('countries.OTHER')}</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">{t('common.phoneNumber')}</label>
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
                <label className="field-label">{t('common.email')}</label>
                <input className="form-control" type="email" required value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="email@example.com" />
              </div>

              <div className="field" style={{ marginBottom: '12px' }}>
                <label className="field-label">{t('common.password')}</label>
                <input className="form-control" type="password" required value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="••••••••" />
              </div>

              <div className="grid-2" style={{ gap: '12px', marginBottom: '12px' }}>
                <div className="field">
                  <label className="field-label">{t('common.subType')}</label>
                  <select
                    className="form-control"
                    value={newUser.subscriptionType}
                    onChange={e => setNewUser({ ...newUser, subscriptionType: e.target.value, subscriptionDuration: e.target.value === 'lifetime' ? '' : '1' })}
                  >
                    <option value="days">{t('common.daysOpt')}</option>
                    <option value="months">{t('common.monthsOpt')}</option>
                    <option value="lifetime">{t('common.lifetimeOpt')}</option>
                  </select>
                </div>
                {newUser.subscriptionType !== 'lifetime' && (
                  <div className="field">
                    <label className="field-label">{t('common.duration')}</label>
                    <input
                      className="form-control"
                      type="number"
                      min="1"
                      required
                      value={newUser.subscriptionDuration}
                      onChange={e => setNewUser({ ...newUser, subscriptionDuration: e.target.value })}
                      placeholder={t('common.duration')}
                    />
                  </div>
                )}
              </div>

              <div className="field" style={{ marginBottom: '20px' }}>
                <label className="field-label">{t('common.licenseKey')}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    className="form-control"
                    type="text"
                    required
                    readOnly
                    value={newUser.licenseKey}
                    placeholder="GS-XXXX-XXXX-XXXX"
                    style={{ background: 'rgba(255,255,255,0.03)', cursor: 'default' }}
                  />
                  <button type="button" onClick={generateLicenseKey} className="btn btn-sm" style={{ whiteSpace: 'nowrap' }}>
                    <Zap size={14} /> {t('common.generateCode')}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => { setShowAddModal(false); setError(null); }} className="btn" style={{ flex: 1 }}>{t('common.cancel')}</button>
                <button type="submit" disabled={isCreating} className="btn btn-primary" style={{ flex: 1 }}>
                  {isCreating ? t('common.adding') : t('common.createAccount')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Sale Modal */}
      {showSalesModal && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', margin: 0, animation: 'scaleUp 0.3s ease' }}>
            <h3 style={{ marginBottom: '20px' }}>{editingSale ? t('admin.editSaleTitle') : t('admin.addNewSaleTitle')}</h3>
            <form onSubmit={handleAddSale}>
              <div className="field" style={{ marginBottom: '15px', position: 'relative' }}>
                <label className="field-label" style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '5px' }}>{t('admin.selectUser')}</label>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', [isRTL ? 'right' : 'left']: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
                  <input
                    className="form-control"
                    style={{ [isRTL ? 'paddingRight' : 'paddingLeft']: '32px' }}
                    placeholder={t('admin.searchUserPlaceholder')}
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
                        {t('common.noResults')}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="field" style={{ marginBottom: '20px' }}>
                <label className="field-label" style={{ display: 'block', fontSize: '12px', color: 'var(--text2)', marginBottom: '5px' }}>{t('admin.amountEGP')}</label>
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
                <button type="button" onClick={() => { setShowSalesModal(false); setModalSearchTerm(''); }} className="btn" style={{ flex: 1 }}>{t('common.cancel')}</button>
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
    </div>
  );
};

export default AdminDashboard;
