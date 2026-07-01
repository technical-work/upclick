'use client';

import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { callClaudeAPI } from '../../utils/ai';
import { parseMarkdown } from '../../utils/markdown';

export default function ProfileView() {
  const {
    lang,
    setLang,
    theme,
    setTheme,
    L,
    t,
    GC,
    showToast,
    updateProfile,
    resetOnboarding,
    formatMoney,
    setCurrentPage,
    confirmAction
  } = useBusiness();

  const { user, userData, updateUserAccount } = useAuth();

  // Account Settings State
  const [accountName, setAccountName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);

  // Local state for profile fields
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [niche, setNiche] = useState('');
  const [bizType, setBizType] = useState('Coach / Trainer');
  const [stage, setStage] = useState('Idea — Just starting');
  const [level, setLevel] = useState('Beginner');
  const [challenge, setChallenge] = useState('Getting clients & revenue');
  const [offerName, setOfferName] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [revenueGoal, setRevenueGoal] = useState('');

  // Telegram state
  const [tgUserId, setTgUserId] = useState('');
  const [tgBotToken, setTgBotToken] = useState('');
  const [tgConnected, setTgConnected] = useState(false);

  // AI analysis state
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  // Sync state with GC on mount or context changes
  useEffect(() => {
    if (userData || GC.profile) {
      setAccountName(userData?.name || GC.profile?.name || '');
    }

    const activeProfile = userData?.businessProfile || GC.profile;
    if (activeProfile) {
      const resolvedName = activeProfile.name === 'Sara Hassan' ? (userData?.name || '') : (activeProfile.name || userData?.name || '');
      const resolvedNiche = activeProfile.niche === 'Fashion & Lifestyle' ? '' : (activeProfile.niche || '');

      setName(resolvedName);
      setDesc(activeProfile.desc || '');
      setNiche(resolvedNiche);
      setBizType(activeProfile.type || 'Coach / Trainer');
      setStage(activeProfile.stage || 'Idea — Just starting');
      setLevel(activeProfile.level ? activeProfile.level.charAt(0).toUpperCase() + activeProfile.level.slice(1) : 'Beginner');
      setChallenge(activeProfile.challenge || 'Getting clients & revenue');
      setOfferName(activeProfile.offer?.name || '');
      setTargetMarket(activeProfile.offer?.market || '');
      setRevenueGoal(activeProfile.goal || '');
    }

    if (typeof window !== 'undefined') {
      const savedTg = localStorage.getItem('tg_user_id');
      const savedTgToken = localStorage.getItem('tg_bot_token');
      if (savedTg) {
        setTgUserId(savedTg);
        setTgConnected(true);
      }
      if (savedTgToken) {
        setTgBotToken(savedTgToken);
      }
    }
  }, [GC.profile, userData]);

  const handleSave = async () => {
    const profileData = {
      name,
      desc,
      niche,
      type: bizType,
      stage,
      level: level.toLowerCase(),
      challenge,
      offer: {
        name: offerName,
        market: targetMarket
      },
      goal: revenueGoal
    };

    updateProfile(profileData);

    if (user?.uid) {
      try {
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, { businessProfile: profileData }, { merge: true });
      } catch (err) {
        console.error('Failed to save to Firebase:', err);
      }
    }

    showToast(L('Profile saved! ✅', 'تم حفظ الملف الشخصي! ✅'));
  };

  const handleSaveAccount = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      showToast(L('Passwords do not match.', 'كلمات المرور غير متطابقة.'));
      return;
    }
    setSavingAccount(true);
    try {
      await updateUserAccount(accountName, newPassword, lang, theme);
      showToast(L('Account settings updated! ✅', 'تم تحديث إعدادات الحساب! ✅'));
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (err.message.includes('requires-recent-login')) {
        showToast(L('Please log out and log in again to change your password.', 'يرجى تسجيل الخروج وتسجيل الدخول مرة أخرى لتغيير كلمة المرور.'));
      } else {
        showToast(L('Error updating account.', 'خطأ في تحديث الحساب.'));
      }
    }
    setSavingAccount(false);
  };

  const handleAIAnalyze = async () => {
    setLoadingAI(true);
    setAiAnalysis('');
    
    const contextStr = `Name: "${name}", Type: ${bizType}, Niche: ${niche}, Stage: ${stage}, Challenge: ${challenge}, Offer: ${offerName}`;
    const question = `Analyze this business profile: ${contextStr}. Give 3 specific insights and 3 next action steps.`;
    
    try {
      const reply = await callClaudeAPI(
        question, 
        `You are Business Architect AI. Respond in ${lang === 'ar' ? 'Arabic' : 'English'}. Be specific and actionable.`, 
        lang, 
        GC
      );
      setAiAnalysis(reply || L('Could not generate response.', 'تعذر توليد رد من الذكاء الاصطناعي.'));
    } catch (e) {
      setAiAnalysis(L('Connection error. Please try again.', 'خطأ في الاتصال. يرجى المحاولة مرة أخرى.'));
    } finally {
      setLoadingAI(false);
    }
  };

  // Telegram handlers
  const handleConnectTg = () => {
    if (!tgUserId || !/^[0-9]+$/.test(tgUserId.trim())) {
      alert(L('Enter a valid Telegram User ID', 'أدخل رقم معرف تيليجرام صحيح'));
      return;
    }
    const cleanId = tgUserId.trim();
    localStorage.setItem('tg_user_id', cleanId);
    
    if (tgBotToken.trim()) {
      localStorage.setItem('tg_bot_token', tgBotToken.trim());
    } else {
      localStorage.removeItem('tg_bot_token');
    }
    
    setTgConnected(true);
    alert(L('✈️ Telegram connected and saved!', '✈️ تم ربط وحفظ إعدادات تيليجرام بنجاح!'));
  };

  const handleDisconnectTg = () => {
    localStorage.removeItem('tg_user_id');
    localStorage.removeItem('tg_bot_token');
    setTgUserId('');
    setTgBotToken('');
    setTgConnected(false);
    alert(L('Telegram disconnected', 'تم قطع اتصال تيليجرام'));
  };

  const handleTestTg = async () => {
    if (!tgUserId) {
      alert(L('Please enter a Telegram User ID first.', 'يرجى إدخال معرّف تيليجرام أولاً.'));
      return;
    }
    const token = tgBotToken.trim() || localStorage.getItem('tg_bot_token');
    if (!token) {
      alert(L('Please enter your Telegram Bot Token to test the connection.', 'يرجى إدخال توكن البوت لاختبار الاتصال.'));
      return;
    }

    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: tgUserId.trim(),
          text: "🚀 Test message from UpKlick Dashboard!"
        })
      });
      const data = await res.json();
      if (data.ok) {
        alert(L('✈️ Test sent successfully to your Telegram!', '✈️ تم إرسال رسالة الاختبار بنجاح إلى تيليجرام!'));
      } else {
        alert(L('Error sending test: ' + data.description, 'خطأ في الإرسال: ' + data.description));
      }
    } catch (err) {
      alert(L('Network error. Check your connection.', 'خطأ في الشبكة. تحقق من اتصالك.'));
    }
  };

  // Compute profile initials
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  // Stats calculation
  const activeLeads = (GC.crm?.leads || []).filter(l => l.stage !== 'closed' && l.stage !== 'lost').length;
  const openTasks = (GC.tasks?.items || []).filter(t => !t.done).length;
  const monthlyIncome = (GC.finance?.entries || []).filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
  const subscriptionsCount = (GC.finance?.subscriptions || []).length;

  return (
    <div className="pg on" id="pg-profile">
      <div className="pg-header">
        <div className="pg-title">
          <span className="pg-icon">👤</span>
          <span>{L('My Profile', 'الملف الشخصي')}</span>
        </div>
        <div className="pg-actions">
          <button className="btn btn-prime" onClick={handleSave}>
            💾 <span>{L('Save Profile', 'حفظ الملف الشخصي')}</span>
          </button>
        </div>
      </div>

      <div className="g21">
        {/* Left column: Profile details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Account Settings Card */}
          <div className="card">
            <div className="sec-hd">
              <div className="sec-title">⚙️ {L('Account Settings', 'إعدادات الحساب')}</div>
              <button className="btn btn-prime" onClick={handleSaveAccount} disabled={savingAccount} style={{ padding: '6px 12px', fontSize: '12px' }}>
                {savingAccount ? '...' : L('Update Account', 'تحديث الحساب')}
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Full Name', 'الاسم الكامل')}</label>
                <input className="inp" placeholder={L('Your name...', 'اسمك...')} value={accountName} onChange={(e) => setAccountName(e.target.value)} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('New Password', 'كلمة المرور الجديدة')}</label>
                  <input className="inp" type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Confirm Password', 'تأكيد كلمة المرور')}</label>
                  <input className="inp" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Default Language', 'اللغة الافتراضية')}</label>
                  <select className="inp" value={lang} onChange={(e) => setLang(e.target.value)}>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Interface Theme', 'مظهر الواجهة')}</label>
                  <select className="inp" value={theme} onChange={(e) => setTheme(e.target.value)}>
                    <option value="dark">{L('Dark', 'داكن')}</option>
                    <option value="light">{L('Light', 'فاتح')}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb">
          <div className="sec-hd">
            <div className="sec-title">🧑‍💼 {L('Business Profile', 'ملف العمل')}</div>
            <button className="btn-ai" onClick={handleAIAnalyze}>
              ✦ {L('AI Analyze', 'تحليل الذكاء الاصطناعي')}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'var(--surface2)', borderRadius: '12px', marginBottom: '4px' }}>
              <div id="profile-avatar" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--a),var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--ff)', fontWeight: '800', fontSize: '24px', color: '#fff', flexShrink: 0 }}>
                {initials}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--ff)', fontSize: '17px', fontWeight: '700', color: 'var(--t1)' }}>
                  {name || L('Your Name', 'اسمك')}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--t2)', marginTop: '2px' }}>
                  {bizType}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--a)', marginTop: '2px' }}>
                  {stage}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Full Name', 'الاسم الكامل')}</label>
                <input className="inp" placeholder={L('Your name...', 'اسمك...')} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Niche / Industry', 'التخصص / المجال')}</label>
                <input className="inp" placeholder="e.g. Business Coaching" value={niche} onChange={(e) => setNiche(e.target.value)} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('What do you do? (1 sentence)', 'ماذا تفعل؟ (في جملة واحدة)')}</label>
              <textarea className="inp" rows="2" placeholder={L('I help...', 'أنا أساعد...')} value={desc} onChange={(e) => setDesc(e.target.value)}></textarea>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Business Type', 'نوع العمل')}</label>
                <select className="inp" value={bizType} onChange={(e) => setBizType(e.target.value)}>
                  <option>Coach / Trainer</option>
                  <option>Content Creator</option>
                  <option>Agency</option>
                  <option>Consultant</option>
                  <option>Product Business</option>
                  <option>Service Provider</option>
                  <option>Personal Brand</option>
                  <option>Startup</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Business Stage', 'مرحلة العمل')}</label>
                <select className="inp" value={stage} onChange={(e) => setStage(e.target.value)}>
                  <option>Idea — Just starting</option>
                  <option>Validation</option>
                  <option>Launch — Getting first clients</option>
                  <option>Growth — Scaling up</option>
                  <option>Established — Optimizing</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Experience Level', 'مستوى الخبرة')}</label>
                <select className="inp" value={level} onChange={(e) => setLevel(e.target.value)}>
                  <option>Beginner</option>
                  <option>Growing</option>
                  <option>Established</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Biggest Challenge Right Now', 'أكبر تحدي حالياً')}</label>
                <select className="inp" value={challenge} onChange={(e) => setChallenge(e.target.value)}>
                  <option>Getting clients & revenue</option>
                  <option>Marketing & visibility</option>
                  <option>Systems & organization</option>
                  <option>Clear strategy</option>
                  <option>Time management</option>
                  <option>Products & offers</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Main Offer', 'العرض الرئيسي')}</label>
              <input className="inp" placeholder="e.g. 12-Week Business Coaching Program — $2,500" value={offerName} onChange={(e) => setOfferName(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Revenue Goal (Monthly)', 'هدف الدخل الشهري')}</label>
                <input className="inp" placeholder="$5,000/month" value={revenueGoal} onChange={(e) => setRevenueGoal(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Target Market', 'السوق المستهدف')}</label>
                <input className="inp" placeholder="Arab market, Gulf region..." value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Right column: Stats, AI outputs, and Links */}
        <div>
          <div className="card mb">
            <div className="sec-hd">
              <div className="sec-title">📊 {L('Business Stats', 'إحصائيات العمل')}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--brd)' }}>
                <span style={{ fontSize: '13px', color: 'var(--t1)' }}>{L('Active Leads', 'ليدات نشطة')}</span>
                <span style={{ fontFamily: 'var(--ff)', fontWeight: '700', color: 'var(--a)' }}>{activeLeads}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--brd)' }}>
                <span style={{ fontSize: '13px', color: 'var(--t1)' }}>{L('Open Tasks', 'مهام مفتوحة')}</span>
                <span style={{ fontFamily: 'var(--ff)', fontWeight: '700', color: 'var(--amber)' }}>{openTasks}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--brd)' }}>
                <span style={{ fontSize: '13px', color: 'var(--t1)' }}>{L('Monthly Income', 'الدخل الشهري')}</span>
                <span style={{ fontFamily: 'var(--ff)', fontWeight: '700', color: 'var(--green)' }}>{formatMoney(monthlyIncome)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0' }}>
                <span style={{ fontSize: '13px', color: 'var(--t1)' }}>{L('Subscriptions', 'اشتراكات')}</span>
                <span style={{ fontFamily: 'var(--ff)', fontWeight: '700', color: 'var(--red)' }}>{subscriptionsCount}</span>
              </div>
            </div>
          </div>

          <div className="card mb">
            <div className="sec-hd">
              <div className="sec-title">✦ {L('AI Profile Analysis', 'تحليل ملفك الشخصي بالذكاء الاصطناعي')}</div>
            </div>
            {loadingAI ? (
              <div className="ai-box ai-thinking" style={{ padding: '20px' }}>
                {L('Analyzing your profile...', 'جارٍ تحليل ملفك الشخصي...')}
              </div>
            ) : aiAnalysis ? (
              <div className="ai-box" style={{ padding: '12px', lineHeight: '1.5', fontSize: '13px' }} dangerouslySetInnerHTML={{ __html: parseMarkdown(aiAnalysis) }} />
            ) : (
              <div className="empty-state" style={{ padding: '20px' }}>
                <div className="es-icon">✦</div>
                <div className="es-title">{L('Analyze your profile', 'حلّل ملفك الشخصي')}</div>
                <div className="es-sub">{L('AI will analyze your business profile and give personalized recommendations', 'سيقوم الذكاء الاصطناعي بتحليل ملفك وتقديم توصيات مخصصة')}</div>
              </div>
            )}
          </div>

          <div className="card mb">
            <div className="sec-hd">
              <div className="sec-title">🔗 {L('Quick Links', 'روابط سريعة')}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button className="btn btn-ghost" style={{ justifyContent: 'flex-start' }} onClick={() => setCurrentPage('strategy')}>
                🧠 {L('Open Strategy Lab', 'افتح معمل الاستراتيجية')}
              </button>
              <button className="btn btn-ghost" style={{ justifyContent: 'flex-start' }} onClick={() => setCurrentPage('crm')}>
                🎯 {L('View My Leads', 'شاهد عملائي')}
              </button>
              <button className="btn btn-ghost" style={{ justifyContent: 'flex-start' }} onClick={() => setCurrentPage('finance')}>
                💳 {L('Finance Overview', 'نظرة عامة على المالية')}
              </button>
              <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', color: 'var(--red)' }} onClick={() => { confirmAction(L('Reset onboarding setup?', 'هل تريد إعادة تشغيل إعداد التوجيه؟'), () => resetOnboarding()); }}>
                ↺ {L('Reset Onboarding', 'إعادة تعيين التوجيه')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Telegram Bot Integration */}
      <div className="card mb" style={{ borderColor: 'rgba(0,136,204,.25)' }}>
        <div className="sec-hd">
          <div className="sec-title">
            <span style={{ background: '#0088CC', borderRadius: '8px', width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0, marginRight: '8px' }}>✈️</span>
            {L('Telegram Bot Control', 'التحكم في بوت تيليجرام')}
          </div>
          <span className="badge" style={{ background: tgConnected ? 'rgba(76, 175, 80, 0.12)' : 'rgba(0,136,204,.12)', color: tgConnected ? 'var(--green)' : '#0088CC', border: tgConnected ? '1px solid rgba(76, 175, 80, 0.25)' : '1px solid rgba(0,136,204,.25)' }}>
            {tgConnected ? `✅ ${tgUserId}` : L('Not Connected', 'غير متصل')}
          </span>
        </div>
        <div style={{ fontSize: '12.5px', color: 'var(--t2)', marginBottom: '14px' }}>
          {L('Connect your Telegram to control your dashboard, ask AI, and get alerts — all from Telegram. Free forever.', 'اربط حسابك بتيليجرام للتحكم في لوحة التحكم، سؤال الذكاء الاصطناعي، والحصول على تنبيهات — كله من تيليجرام. مجاناً للأبد.')}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
          <div>
            <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Your Telegram User ID', 'معرّف تيليجرام الخاص بك')}</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input className="inp" placeholder="e.g. 123456789" style={{ fontSize: '13px' }} value={tgUserId} onChange={(e) => setTgUserId(e.target.value)} disabled={tgConnected} />
              {!tgConnected && (
                <button className="btn btn-ghost" style={{ flexShrink: 0, fontSize: '12px', padding: '7px 11px' }} onClick={() => window.open('https://t.me/userinfobot', '_blank')}>
                  {L('Get ID', 'احصل على المعرف')}
                </button>
              )}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '3px' }}>
              {L('Send /start to @userinfobot on Telegram', 'أرسل /start إلى @userinfobot على تيليجرام')}
            </div>
          </div>
          <div>
            <label style={{ fontSize: '11.5px', color: 'var(--t2)', display: 'block', marginBottom: '4px' }}>{L('Bot Token', 'توكن البوت')}</label>
            <input className="inp" placeholder={L('Enter your bot token...', 'أدخل توكن البوت الخاص بك...')} style={{ fontSize: '13px' }} value={tgBotToken} onChange={(e) => setTgBotToken(e.target.value)} />
            <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: '3px' }}>
              {L('Create your own bot via @BotFather', 'أنشئ بوتك الخاص عبر @BotFather')}
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--surface2)', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--t1)', marginBottom: '8px' }}>🤖 {L('What you can do from Telegram:', 'ما يمكنك فعله من تيليجرام:')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
            <div style={{ fontSize: '12px', color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'var(--green)', fontSize: '13px' }}>✓</span>{L('Ask AI questions anytime', 'اسأل الذكاء الاصطناعي في أي وقت')}</div>
            <div style={{ fontSize: '12px', color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'var(--green)', fontSize: '13px' }}>✓</span>{L('Get new lead alerts', 'استقبل إشعارات الليدات الجديدة')}</div>
            <div style={{ fontSize: '12px', color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'var(--green)', fontSize: '13px' }}>✓</span>{L('Check today\'s tasks', 'راجع مهام اليوم')}</div>
            <div style={{ fontSize: '12px', color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'var(--green)', fontSize: '13px' }}>✓</span>{L('Revenue updates', 'تحديثات الأرباح')}</div>
            <div style={{ fontSize: '12px', color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'var(--green)', fontSize: '13px' }}>✓</span>{L('Quick CRM updates', 'تحديثات سريعة لـ CRM')}</div>
            <div style={{ fontSize: '12px', color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'var(--green)', fontSize: '13px' }}>✓</span>{L('Set reminders', 'ضبط التذكيرات')}</div>
            <div style={{ fontSize: '12px', color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'var(--green)', fontSize: '13px' }}>✓</span>{L('Daily reports', 'التقارير اليومية')}</div>
            <div style={{ fontSize: '12px', color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ color: 'var(--green)', fontSize: '13px' }}>✓</span>{L('Marketing insights', 'رؤى تسويقية')}</div>
          </div>
        </div>

        {tgConnected && (
          <div id="tg-commands-preview" style={{ background: 'var(--surface2)', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
            <div style={{ fontSize: '11.5px', color: 'var(--t1)', fontWeight: '600', marginBottom: '8px', fontFamily: 'var(--ff)' }}>📋 {L('Available Commands:', 'الأوامر المتاحة:')}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', fontSize: '12px' }}>
              <div><span style={{ color: 'var(--orange)', fontFamily: 'monospace' }}>/ai [question]</span> <span style={{ color: 'var(--t2)' }}>— {L('Ask AI', 'اسأل الذكاء الاصطناعي')}</span></div>
              <div><span style={{ color: 'var(--orange)', fontFamily: 'monospace' }}>/leads</span> <span style={{ color: 'var(--t2)' }}>— {L('Today\'s leads', 'ليدات اليوم')}</span></div>
              <div><span style={{ color: 'var(--orange)', fontFamily: 'monospace' }}>/tasks</span> <span style={{ color: 'var(--t2)' }}>— {L('Pending tasks', 'المهام المعلقة')}</span></div>
              <div><span style={{ color: 'var(--orange)', fontFamily: 'monospace' }}>/revenue</span> <span style={{ color: 'var(--t2)' }}>— {L('Today\'s revenue', 'إيرادات اليوم')}</span></div>
              <div><span style={{ color: 'var(--orange)', fontFamily: 'monospace' }}>/report</span> <span style={{ color: 'var(--t2)' }}>— {L('Daily report', 'التقرير اليومي')}</span></div>
              <div><span style={{ color: 'var(--orange)', fontFamily: 'monospace' }}>/remind [text]</span> <span style={{ color: 'var(--t2)' }}>— {L('Set reminder', 'ضبط تذكير')}</span></div>
              <div><span style={{ color: 'var(--orange)', fontFamily: 'monospace' }}>/status</span> <span style={{ color: 'var(--t2)' }}>— {L('Dashboard overview', 'نظرة عامة')}</span></div>
              <div><span style={{ color: 'var(--orange)', fontFamily: 'monospace' }}>/marketing</span> <span style={{ color: 'var(--t2)' }}>— {L('Marketing tips', 'نصائح التسويق')}</span></div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {!tgConnected ? (
            <button className="btn btn-prime" onClick={handleConnectTg} style={{ flex: 1, justifyContent: 'center', minWidth: '140px' }}>
              ✈️ {L('Connect Telegram', 'ربط تيليجرام')}
            </button>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={handleTestTg} style={{ flex: 1, justifyContent: 'center', minWidth: '140px' }}>
                🔔 {L('Send Test Message', 'إرسال رسالة اختبار')}
              </button>
              <button className="btn btn-ghost" onClick={handleDisconnectTg} style={{ color: 'var(--red)', borderColor: 'rgba(255,61,110,.25)', flex: 1, justifyContent: 'center', minWidth: '120px' }}>
                ✕ {L('Disconnect', 'إلغاء الربط')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
