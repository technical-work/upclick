'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Key, DollarSign, Cpu, Save, RefreshCw, BarChart2, List, Settings, Search } from 'lucide-react';
import { doc, setDoc, serverTimestamp, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

const DEFAULTS = {
  openaiApiKey: '',
  defaultUserCredit: 5.00,
  openaiModel: 'gpt-4o-mini'
};

const AiSettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const isRTL = i18n.language?.startsWith('ar');

  const [activeSubTab, setActiveSubTab] = useState('config'); // 'config' | 'logs' | 'analytics'
  const [settings, setSettings] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Advanced Logs & Analytics State
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [globalStats, setGlobalStats] = useState({
    totalAiSpend: 0,
    totalAiTokens: 0,
    totalAiCalls: 0
  });

  // Load global AI configuration & reactive aggregates
  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsub = onSnapshot(doc(db, 'tenants', 'global'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSettings({
          openaiApiKey: data.openaiApiKey || '',
          defaultUserCredit: data.defaultUserCredit !== undefined ? Number(data.defaultUserCredit) : 5.00,
          openaiModel: data.openaiModel || 'gpt-4o-mini'
        });
        setGlobalStats({
          totalAiSpend: data.totalAiSpend !== undefined ? Number(data.totalAiSpend) : 0,
          totalAiTokens: data.totalAiTokens !== undefined ? Number(data.totalAiTokens) : 0,
          totalAiCalls: data.totalAiCalls !== undefined ? Number(data.totalAiCalls) : 0
        });
      }
    }, (err) => {
      console.error(err);
      setLoadError(isRTL ? 'حدث خطأ أثناء تحميل البيانات' : 'Error loading settings');
    });
    return () => unsub();
  }, [currentUser?.uid, isRTL]);

  // Load live AI logs when switching to logs or analytics sub-tabs
  useEffect(() => {
    if (activeSubTab !== 'logs' && activeSubTab !== 'analytics') return;
    setLoadingLogs(true);
    const q = query(collection(db, 'ai_logs'), orderBy('timestamp', 'desc'), limit(150));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = [];
      snapshot.forEach(docSnap => {
        docs.push({ id: docSnap.id, ...docSnap.data() });
      });
      setLogs(docs);
      setLoadingLogs(false);
    }, (err) => {
      console.error("Error fetching AI logs:", err);
      setLoadingLogs(false);
    });
    return () => unsubscribe();
  }, [activeSubTab]);

  const handleFieldChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'tenants', 'global'), {
        openaiApiKey: settings.openaiApiKey,
        defaultUserCredit: Number(settings.defaultUserCredit),
        openaiModel: settings.openaiModel,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULTS);
    setSaved(false);
  };

  // Compute stats for Analytics Dashboard
  const getAnalytics = () => {
    const userStats = {};
    const toolStats = {};

    logs.forEach(log => {
      // User Aggregates
      const userKey = log.userEmail || log.userId || 'Unknown User';
      if (!userStats[userKey]) {
        userStats[userKey] = { email: userKey, name: log.userName || '', cost: 0, calls: 0 };
      }
      userStats[userKey].cost += (log.cost || 0);
      userStats[userKey].calls += 1;

      // Tool Aggregates
      const toolKey = log.tool || 'General';
      if (!toolStats[toolKey]) {
        toolStats[toolKey] = { tool: toolKey, cost: 0, calls: 0 };
      }
      toolStats[toolKey].cost += (log.cost || 0);
      toolStats[toolKey].calls += 1;
    });

    const topUsers = Object.values(userStats)
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5);

    const topTools = Object.values(toolStats)
      .sort((a, b) => b.calls - a.calls)
      .slice(0, 5);

    return { topUsers, topTools };
  };

  const { topUsers, topTools } = getAnalytics();

  // Filter logs for search
  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    return (
      (log.userEmail || '').toLowerCase().includes(term) ||
      (log.userName || '').toLowerCase().includes(term) ||
      (log.tool || '').toLowerCase().includes(term) ||
      (log.model || '').toLowerCase().includes(term)
    );
  });

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: 'var(--text2)',
    marginBottom: '6px',
    textTransform: 'uppercase',
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--bg3)',
    border: '1px solid var(--line2)',
    borderRadius: '10px',
    padding: '10px 14px',
    fontSize: '13px',
    color: 'var(--text)',
    outline: 'none',
    fontFamily: 'var(--font)',
    transition: 'border-color 0.2s',
  };

  const cardStyle = {
    background: 'var(--panel)',
    border: '1px solid var(--line)',
    borderRadius: '16px',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden'
  };

  const tableHeaderStyle = {
    padding: '12px 16px',
    fontSize: '12px',
    color: 'var(--text2)',
    fontWeight: 'bold',
    borderBottom: '1px solid var(--line)',
    textAlign: isRTL ? 'right' : 'left'
  };

  const tableRowStyle = {
    borderBottom: '1px solid var(--line2)',
    fontSize: '13px',
    color: 'var(--text)'
  };

  const tableCellStyle = {
    padding: '12px 16px',
    verticalAlign: 'middle'
  };

  return (
    <div style={{ animation: 'fadeSlide 0.4s ease', maxWidth: activeSubTab === 'config' ? '600px' : '1000px', margin: '0 auto', transition: 'max-width 0.3s ease' }}>
      
      {/* Sub Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--line)', paddingBottom: '10px' }}>
        <button
          onClick={() => setActiveSubTab('config')}
          style={{
            background: activeSubTab === 'config' ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            color: activeSubTab === 'config' ? 'var(--orange)' : 'var(--text2)',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Settings size={14} />
          <span>{isRTL ? 'إعدادات الخدمة' : 'AI Config'}</span>
        </button>
        <button
          onClick={() => setActiveSubTab('logs')}
          style={{
            background: activeSubTab === 'logs' ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            color: activeSubTab === 'logs' ? 'var(--orange)' : 'var(--text2)',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <List size={14} />
          <span>{isRTL ? 'سجل الاستهلاك الفعلي' : 'Live Usage Logs'}</span>
        </button>
        <button
          onClick={() => setActiveSubTab('analytics')}
          style={{
            background: activeSubTab === 'analytics' ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            color: activeSubTab === 'analytics' ? 'var(--orange)' : 'var(--text2)',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <BarChart2 size={14} />
          <span>{isRTL ? 'لوحة التحليلات' : 'Analytics Dashboard'}</span>
        </button>
      </div>

      {loadError && (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--red)', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '12px', border: '1px solid rgba(239,68,68,0.2)' }}>
          ⚠️ {loadError}
        </div>
      )}

      {/* SUB TAB 1: CONFIGURATION */}
      {activeSubTab === 'config' && (
        <>
          <div className="card" style={cardStyle}>
            <div style={{
              position: 'absolute',
              top: '-100px',
              right: '-100px',
              width: '240px',
              height: '240px',
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
              zIndex: 0
            }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '800', color: 'var(--text)', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid var(--line)' }}>
              <Cpu size={16} style={{ color: 'var(--accent)' }} />
              <span>{isRTL ? 'إعدادات مفتاح الذكاء الاصطناعي (OpenAI)' : 'OpenAI AI Integration Settings'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 1 }}>
              
              {/* OpenAI API Key */}
              <div>
                <label style={labelStyle}>
                  <Key size={12} style={{ marginInlineEnd: '4px', verticalAlign: 'middle' }} />
                  {isRTL ? 'مفتاح OpenAI API (Secret Key)' : 'OpenAI API Secret Key'}
                </label>
                <input
                  type="password"
                  placeholder="sk-..."
                  value={settings.openaiApiKey}
                  onChange={e => handleFieldChange('openaiApiKey', e.target.value)}
                  style={inputStyle}
                />
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
                  {isRTL ? 'سيتم استخدام هذا المفتاح لتشغيل جميع استفسارات الذكاء الاصطناعي لجميع مستخدمي المنصة.' : 'All users will run their queries using this global API key.'}
                </div>
              </div>

              {/* Default User Credit */}
              <div>
                <label style={labelStyle}>
                  <DollarSign size={12} style={{ marginInlineEnd: '4px', verticalAlign: 'middle' }} />
                  {isRTL ? 'الرصيد الافتراضي للمستخدمين الجدد ($)' : 'Default Starting Credits for New Users ($)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="5.00"
                  value={settings.defaultUserCredit}
                  onChange={e => handleFieldChange('defaultUserCredit', e.target.value)}
                  style={inputStyle}
                />
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>
                  {isRTL ? 'يُعطى هذا المبلغ تلقائياً ككريديت للمشترك الجديد عند إنشائه.' : 'This dollar credit will automatically be assigned to new accounts.'}
                </div>
              </div>

              {/* Model Selection */}
              <div>
                <label style={labelStyle}>
                  <Cpu size={12} style={{ marginInlineEnd: '4px', verticalAlign: 'middle' }} />
                  {isRTL ? 'النموذج الافتراضي للذكاء الاصطناعي' : 'Default AI Model Selection'}
                </label>
                <select
                  value={settings.openaiModel}
                  onChange={e => handleFieldChange('openaiModel', e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="gpt-4o-mini">GPT-4o-Mini (Recommended/Cost-efficient)</option>
                  <option value="gpt-4o">GPT-4o (High intelligence / Standard rates)</option>
                  <option value="o3-mini">o3-mini (Reasoning / Advanced tasks)</option>
                  <option value="o1">o1 (Full Reasoning / Premium rates)</option>
                  <option value="gpt-3.5-turbo">GPT-3.5-Turbo (Legacy)</option>
                </select>
              </div>

            </div>
          </div>

          {/* Save Buttons */}
          <div style={{ display: 'flex', gap: '10px', paddingBottom: '20px' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              <Save size={16} />
              <span>
                {saving 
                  ? (isRTL ? 'جاري الحفظ...' : 'Saving...') 
                  : saved 
                    ? (isRTL ? 'تم الحفظ بنجاح! ✓' : 'Saved Successfully! ✓') 
                    : (isRTL ? 'حفظ إعدادات الذكاء الاصطناعي' : 'Save AI Settings')
                }
              </span>
            </button>
            <button 
              onClick={handleReset} 
              className="btn" 
              style={{ background: 'var(--bg3)', border: '1px solid var(--line)', color: 'var(--text2)' }}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </>
      )}

      {/* SUB TAB 2: LIVE USAGE LOGS */}
      {activeSubTab === 'logs' && (
        <div className="card" style={cardStyle}>
          {/* Header & Search */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '800', color: 'var(--text)' }}>
              <List size={16} style={{ color: 'var(--orange)' }} />
              <span>{isRTL ? 'سجلات استهلاك الذكاء الاصطناعي الفورية' : 'Live AI Transactions Logs'}</span>
            </div>
            
            {/* Search Box */}
            <div style={{ position: 'relative', width: '280px' }}>
              <span style={{ position: 'absolute', top: '10px', [isRTL ? 'right' : 'left']: '12px', color: 'var(--text3)' }}>
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder={isRTL ? 'ابحث بالمستخدم، الأداة، الموديل...' : 'Search by email, tool, model...'}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ ...inputStyle, paddingLeft: isRTL ? '14px' : '34px', paddingRight: isRTL ? '34px' : '14px' }}
              />
            </div>
          </div>

          {loadingLogs && logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
              <RefreshCw size={24} style={{ animation: 'spin 1.5s linear infinite', marginBottom: '8px' }} />
              <div>{isRTL ? 'جاري تحميل السجلات الفورية...' : 'Streaming live log entries...'}</div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text3)' }}>
              {isRTL ? 'لم يتم العثور على سجلات تطابق البحث.' : 'No matching transactions logs found.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto', maxHeight: '550px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>{isRTL ? 'المستخدم' : 'User'}</th>
                    <th style={tableHeaderStyle}>{isRTL ? 'الأداة' : 'Feature / Tool'}</th>
                    <th style={tableHeaderStyle}>{isRTL ? 'النموذج' : 'Model'}</th>
                    <th style={tableHeaderStyle}>{isRTL ? 'التوكينز المستهلكة' : 'Tokens Consumed'}</th>
                    <th style={tableHeaderStyle}>{isRTL ? 'التكلفة الإجمالية ($)' : 'Cost Incurred'}</th>
                    <th style={tableHeaderStyle}>{isRTL ? 'الوقت والتاريخ' : 'Date & Time'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => {
                    const ts = log.timestamp;
                    const dateObj = ts?.toDate ? ts.toDate() : (ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts));
                    const formattedDate = dateObj.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    });

                    return (
                      <tr key={log.id} style={tableRowStyle}>
                        <td style={tableCellStyle}>
                          <div style={{ fontWeight: 'bold' }}>{log.userName || 'Anonymous'}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{log.userEmail}</div>
                        </td>
                        <td style={tableCellStyle}>
                          <span style={{ background: 'var(--bg3)', border: '1px solid var(--line2)', borderRadius: '6px', padding: '3px 8px', fontSize: '11.5px', fontWeight: '600' }}>
                            {log.tool || 'General'}
                          </span>
                        </td>
                        <td style={tableCellStyle}>
                          <code style={{ fontSize: '12px', color: 'var(--orange)' }}>{log.model}</code>
                        </td>
                        <td style={tableCellStyle}>
                          <div style={{ fontSize: '12px' }}>
                            📥 {log.inputTokens?.toLocaleString()} / 📤 {log.outputTokens?.toLocaleString()}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text3)' }}>
                            {isRTL ? 'الإجمالي:' : 'Total:'} {((log.inputTokens || 0) + (log.outputTokens || 0)).toLocaleString()}
                          </div>
                        </td>
                        <td style={tableCellStyle}>
                          <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>
                            ${Number(log.cost || 0).toFixed(6)}
                          </span>
                        </td>
                        <td style={{ ...tableCellStyle, color: 'var(--text3)', fontSize: '12px' }}>
                          {formattedDate}
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

      {/* SUB TAB 3: ANALYTICS DASHBOARD */}
      {activeSubTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Global Aggregates Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {/* Spend Card */}
            <div className="card" style={{ ...cardStyle, borderLeft: '4px solid var(--green)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 'bold' }}>
                💰 {isRTL ? 'إجمالي تكلفة المنصة بالدولار' : 'TOTAL PLATFORM SPEND ($)'}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--green)', marginTop: '8px' }}>
                ${globalStats.totalAiSpend.toFixed(4)}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text3)', marginTop: '6px' }}>
                {isRTL ? 'يتم التحديث لحظياً مع كل استعلام' : 'Updates in real-time with each request'}
              </div>
            </div>

            {/* Tokens Card */}
            <div className="card" style={{ ...cardStyle, borderLeft: '4px solid var(--orange)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 'bold' }}>
                ⚡ {isRTL ? 'إجمالي التوكينز المستهلكة' : 'TOTAL TOKENS CONSUMED'}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text)', marginTop: '8px' }}>
                {globalStats.totalAiTokens.toLocaleString()}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text3)', marginTop: '6px' }}>
                {isRTL ? 'الحجم الكلي لمدخلات ومخرجات النصوص' : 'Total size of prompts & responses'}
              </div>
            </div>

            {/* API Calls Card */}
            <div className="card" style={{ ...cardStyle, borderLeft: '4px solid var(--accent)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text3)', fontWeight: 'bold' }}>
                🤖 {isRTL ? 'إجمالي طلبات الذكاء الاصطناعي' : 'TOTAL AI CALLS'}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--accent)', marginTop: '8px' }}>
                {globalStats.totalAiCalls.toLocaleString()}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text3)', marginTop: '6px' }}>
                {isRTL ? 'عدد المعاملات الناجحة المنفذة' : 'Total successful transactions executed'}
              </div>
            </div>
          </div>

          {/* Detailed Analytics Tables */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '16px' }}>
            
            {/* Top Users Card */}
            <div className="card" style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '800', color: 'var(--text)', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid var(--line)' }}>
                <DollarSign size={15} style={{ color: 'var(--green)' }} />
                <span>{isRTL ? 'المستخدمين الأكثر استهلاكاً للرصيد' : 'Top 5 Most Active Users (Cost)'}</span>
              </div>
              
              {topUsers.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '20px 0' }}>
                  {isRTL ? 'لا توجد بيانات كافية للحساب حالياً.' : 'Insufficient data to compute.'}
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={tableHeaderStyle}>{isRTL ? 'المستخدم' : 'User'}</th>
                      <th style={tableHeaderStyle}>{isRTL ? 'الطلبات' : 'Calls'}</th>
                      <th style={tableHeaderStyle}>{isRTL ? 'إجمالي الاستهلاك ($)' : 'Spend ($)'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topUsers.map((user, index) => (
                      <tr key={index} style={tableRowStyle}>
                        <td style={tableCellStyle}>
                          <div style={{ fontWeight: 'bold' }}>{user.name || 'Anonymous'}</div>
                          <div style={{ fontSize: '10.5px', color: 'var(--text3)' }}>{user.email}</div>
                        </td>
                        <td style={tableCellStyle}>{user.calls}</td>
                        <td style={tableCellStyle}>
                          <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>
                            ${user.cost.toFixed(5)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Top Features Card */}
            <div className="card" style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '800', color: 'var(--text)', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid var(--line)' }}>
                <Cpu size={15} style={{ color: 'var(--orange)' }} />
                <span>{isRTL ? 'الأدوات الأكثر استخداماً' : 'Top 5 Used AI Features (Calls)'}</span>
              </div>

              {topTools.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text3)', padding: '20px 0' }}>
                  {isRTL ? 'لا توجد بيانات كافية للحساب حالياً.' : 'Insufficient data to compute.'}
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={tableHeaderStyle}>{isRTL ? 'الأداة / الميزة' : 'Tool / Feature'}</th>
                      <th style={tableHeaderStyle}>{isRTL ? 'الاستخدامات' : 'Uses'}</th>
                      <th style={tableHeaderStyle}>{isRTL ? 'تكلفة التشغيل ($)' : 'Incurred Cost ($)'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topTools.map((tool, index) => (
                      <tr key={index} style={tableRowStyle}>
                        <td style={tableCellStyle}>
                          <span style={{ background: 'var(--bg3)', border: '1px solid var(--line2)', borderRadius: '6px', padding: '3px 8px', fontSize: '12px', fontWeight: '600' }}>
                            {tool.tool}
                          </span>
                        </td>
                        <td style={tableCellStyle}>{tool.calls}</td>
                        <td style={tableCellStyle}>
                          <span style={{ color: 'var(--green)', fontWeight: '600' }}>
                            ${tool.cost.toFixed(5)}
                          </span>
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

    </div>
  );
};

export default AiSettingsPage;
