'use client';

import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const initialGC = {
  profile: {
    name: '',
    desc: '',
    niche: '',
    stage: 'Idea',
    type: 'Content Creator',
    level: 'beginner',
    challenge: '',
    offer: { name: '', price: '', transform: '', duration: '', market: '' },
    goal: ''
  },
  strategy: { idea_analysis: '', icp: '', swot: { s: '', w: '', o: '', t: '' }, roadmap: '' },
  crm: { 
    workspaces: [
      {
        id: 'default',
        name: 'Default Workspace',
        stages: [
          { key: 'new', label: 'New Lead', color: 'var(--blue)' },
          { key: 'contacted', label: 'Contacted', color: 'var(--purple)' },
          { key: 'qualified', label: 'Qualified', color: 'var(--amber)' },
          { key: 'proposal', label: 'Proposal Sent', color: 'var(--a)' },
          { key: 'closed', label: 'Closed Won', color: 'var(--green)' },
          { key: 'lost', label: 'Lost', color: 'var(--red)' }
        ],
        leads: []
      }
    ],
    activeWorkspaceId: 'default'
  },
  tasks: { items: [] },
  finance: { entries: [], subscriptions: [] },
  calendar: { events: [] },
  creator: { followers: '0', engagement: '6.8%', revenue_monthly: '$4,320' },
  marketing: {
    inputs: {},
    outputs: {},
    counts: { competitors: 0, audience: 0, trends: 0, personas: 0 },
    savedReports: []
  },
  integrations: {
    claudeKey: '',
    openaiKey: '',
    stripeKey: '',
    tapKey: '',
    telegramBotToken: '',
    telegramChatId: '',
    stripeConnected: false,
    tapConnected: false,
    claudeConnected: false,
    openaiConnected: false,
    telegramConnected: false,
    mailchimpConnected: false,
    apifyConnected: false,
    apifyToken: ''
  },
  bioLink: {
    displayName: '',
    bioTagline: 'Coach | Entrepreneur | Content Creator 🚀',
    username: '',
    bioTheme: 'dark',
    links: [
      { title: 'My Website', url: 'https://upklick.io', icon: '🌐' },
      { title: 'Book a Call', url: 'https://calendly.com', icon: '💬', highlighted: true }
    ],
    socials: { ig: '', tt: '', yt: '', li: '', tg: '', wa: '' }
  },
  digitalProducts: { products: [] },
  contentHub: { savedIdeas: [] },
  automationHub: {
    connectionUrl: '',
    apiKey: '',
    connected: false,
    cbTrigger: 'New Telegram message received',
    cbAction: '',
    cbApps: [],
    cbCreds: '',
    buildResult: ''
  },
  aiGrowthIntel: { inputs: {}, outputs: {} },
  revenue: {
    deals: { Prospect: [], Negotiating: [], Contracted: [], Completed: [] },
    affiliates: [],
    leadMagnets: [],
    coachingSessions: [],
    merch: []
  },
  socialAccounts: {
    connected: { instagram: false, tiktok: false, facebook: false, youtube: false, snapchat: false, x: false },
    profiles: { instagram: '', tiktok: '', facebook: '' },
    followers: { instagram: 0, tiktok: 0, facebook: 0, total: 0 },
    aiAnalysis: ''
  },
  socialTrends: {
    filters: { platform: 'tiktok', niche: '', region: 'AR', sortBy: 'plays', period: '7' },
    trends: []
  },
  landingPage: {
    name: '',
    niche: '',
    offer: '',
    tagline: 'Learn to grow on Instagram',
    color: '#6c35ff',
    template: 'bold',
    price: 29,
    lpCode: ''
  },
  nicheStudio: {
    language: 'ar',
    field: 'coaching',
    styles: ['catchy'],
    wordCount: 1,
    keywords: '',
    audience: 'Arab entrepreneurs',
    generatedNames: [],
    savedNames: [],
    selectedNiche: null,
    selectedMicro: null
  },
  communityHub: {
    feed: [
      {
        id: 1,
        author: 'UpKlick',
        role: 'System',
        content: 'Welcome to your community feed!',
        likes: 0,
        commentsCount: 0,
        date: 'Just now'
      }
    ],
    membersCount: 1,
    activeToday: 1
  },
  designStudio: {
    logo: { brandName: '', tagline: '', logoStyle: 'modern', logoType: 'wordmark', logoColor: 'orange-purple', industry: 'coaching', generated: [], saved: [] },
    social: { socialSize: '1080x1080', headline: '', subtitle: '', socialStyle: 'gradient-dark', generated: [], saved: [] },
    cover: { coverType: 'linkedin', generated: [], saved: [] },
    card: { fullName: '', title: '', cardStyle: 'dark-premium', generated: [], saved: [] },
    savedDesigns: []
  },
  upclickFunnels: { funnels: [] },
  opsHub: { automations: { welcome: false, followup: false, report: false, invoice: false }, sopsList: [] },
  team: { members: [], tasks: [], logs: [] },
  teamChat: {
    channels: [
      { id: 'general', name: 'general', type: 'public', desc: 'General discussion' }
    ],
    messages: {
      general: [
        { id: 1, author: 'System', content: 'Welcome to your workspace chat!', date: 'Just now' }
      ]
    }
  },
  telegramHub: {
    agentName: '',
    agentStyle: 'Professional & Friendly',
    agentGoal: 'Qualify Leads',
    agentBiz: '',
    agentOutput: '',
    tmplType: 'Sales Script',
    tmplLang: 'Arabic (Gulf)',
    tmplCtx: '',
    tmplOutput: '',
    broadcasts: []
  }
};

const validateEmail = (email) => {
  // 1. Basic RFC 5322 regex validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) return false;

  // 2. Extract domain and TLD parts
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const domainParts = parts[1].split('.');
  if (domainParts.length < 2) return false;
  
  const domainName = domainParts[0].toLowerCase();
  const tld = domainParts[domainParts.length - 1].toLowerCase();

  // 3. Reject obvious domain/TLD typos and duplications
  if (domainName === tld) return false; // Catches gmail.gmail, yahoo.yahoo, etc.
  if (tld === 'con') return false; // Catches gmail.con
  if (tld === 'gamil') return false; // Catches hotmail.gamil
  if (tld === 'gmaill') return false;

  // 4. If TLD is not a 2-letter country code (like .eg, .sa, .ae, .us), it must be a valid common generic TLD
  if (tld.length !== 2) {
    const validCommonTLDs = [
      'com', 'net', 'org', 'edu', 'gov', 'mil', 'biz', 'info', 'co', 'me', 'io', 'app', 'tv', 'xyz', 'club', 'site', 'shop', 
      'online', 'agency', 'arabic', 'museum', 'travel', 'coop', 'jobs', 'mobi', 'name', 'tech', 'store', 'space', 'website', 
      'media', 'company', 'email', 'pro', 'link', 'work', 'vip', 'live', 'today', 'solutions', 'systems', 'run', 'rocks', 
      'ninja', 'guru', 'icu', 'global', 'ltd', 'services', 'care', 'digital', 'network', 'download', 'support', 'expert', 
      'tools', 'education', 'social', 'team', 'group', 'marketing', 'design', 'studio', 'software', 'technology', 'world', 
      'chat', 'click', 'page', 'pub', 'dev', 'cloud', 'lawyer', 'clinic', 'dentist', 'events', 'business', 'fit', 'one'
    ];
    if (validCommonTLDs.indexOf(tld) === -1) {
      return false;
    }
  }

  return true;
};

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tenantConfig, setTenantConfig] = useState(null);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('upklick_theme');
      if (savedTheme) setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    getDoc(doc(db, 'tenants', 'global')).then((docSnap) => {
      if (docSnap.exists()) {
        setTenantConfig(docSnap.data());
      }
    }).catch(err => console.error("Error fetching global tenant:", err));
  }, []);

  useEffect(() => {
    if (tenantConfig?.appName) {
      document.title = `${tenantConfig.appName} - إنشاء حساب جديد`;
    }
  }, [tenantConfig]);

  useEffect(() => {
    if (tenantConfig && !tenantConfig.freeTrial?.enabled) {
      router.push('/login');
    }
  }, [tenantConfig, router]);

  useEffect(() => {
    if (!authLoading && user && userData) {
      if (userData.role === 'admin' || userData.role === 'super_admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, userData, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('البريد الإلكتروني المدخل غير صالح. يرجى التأكد من كتابة البريد والنطاق بشكل صحيح (مثال: .com).');
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }

    if (password.length < 6) {
      setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Ensure uniqueness of username on register
      let baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
      let cleanUsername = baseUsername;
      let isUnique = false;
      let counter = 0;
      while (!isUnique) {
        const docSnap = await getDoc(doc(db, 'bio_links', cleanUsername));
        if (!docSnap.exists()) {
          isUnique = true;
        } else {
          counter++;
          cleanUsername = `${baseUsername}${counter}`;
        }
      }

      // 2. Setup user profile defaults inside Firestore
      const userGC = {
        ...initialGC,
        profile: {
          ...initialGC.profile,
          name: name
        },
        bioLink: {
          ...initialGC.bioLink,
          displayName: name,
          username: cleanUsername
        }
      };

      const isTrial = tenantConfig?.freeTrial?.enabled || false;
      const trialStartedAt = isTrial ? new Date().toISOString() : null;

      // 3. Automatically create/publish public CV/Bio link document
      await setDoc(doc(db, 'bio_links', cleanUsername), {
        ownerUid: uid,
        displayName: name,
        bioTagline: initialGC.bioLink.bioTagline || 'Coach | Entrepreneur | Content Creator 🚀',
        username: cleanUsername,
        bioTheme: initialGC.bioLink.bioTheme || 'dark',
        layout: 'classic',
        font: 'Tajawal',
        avatarUrl: '',
        links: initialGC.bioLink.links || [],
        socials: initialGC.bioLink.socials || {},
        cvEnabled: false,
        lang: 'ar',
        cvSections: { experience: [], education: [], skills: [] },
        updatedAt: new Date().toISOString()
      });

      // 4. Save User document
      await setDoc(doc(db, 'users', uid), {
        uid: uid,
        name: name,
        email: email,
        role: 'user',
        lang: 'ar',
        theme: 'dark',
        onboardingDone: false,
        GC: userGC,
        isTrial: isTrial,
        trialStartedAt: trialStartedAt,
        adminId: 'global',
        createdAt: new Date().toISOString()
      });

      // router will auto-redirect through useEffect
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('هذا البريد الإلكتروني مسجل بالفعل.');
      } else if (err.code === 'auth/invalid-email') {
        setError('البريد الإلكتروني غير صالح.');
      } else if (err.code === 'auth/weak-password') {
        setError('كلمة المرور ضعيفة جداً.');
      } else {
        setError('حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.');
      }
      setLoading(false);
    }
  };

  return (
    <div style={{ ...styles.container, ...(tenantConfig?.bgColor ? { backgroundColor: tenantConfig.bgColor } : {}) }}>
      <div style={{ ...styles.card, ...(tenantConfig?.panelColor ? { backgroundColor: tenantConfig.panelColor } : {}) }}>
        {(() => {
          const isDefaultLogo = !tenantConfig?.logoUrl;
          return isDefaultLogo ? (
            <div style={{
              height: '80px',
              width: '180px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px'
            }}>
              <img 
                src={tenantConfig?.logoUrl || (theme === 'light' ? "/best_logo_light.png" : "/best_logo_dark.png")} 
                alt={tenantConfig?.appName || "UpKlick"} 
                style={{
                  height: '240px',
                  objectFit: 'contain',
                  marginTop: '-10px'
                }}
              />
            </div>
          ) : (
            <img 
              src={tenantConfig?.logoUrl || (theme === 'light' ? "/best_logo_light.png" : "/best_logo_dark.png")} 
              alt={tenantConfig?.appName || "UpKlick"} 
              style={styles.logo} 
            />
          );
        })()}
        <h1 style={{ ...styles.title, ...(tenantConfig?.textColor ? { color: tenantConfig.textColor } : {}) }}>
          {tenantConfig?.appName ? `إنشاء حساب - ${tenantConfig.appName}` : 'إنشاء حساب جديد'}
        </h1>
        <p style={{ ...styles.subtitle, ...(tenantConfig?.text2Color ? { color: tenantConfig.text2Color } : {}) }}>
          {tenantConfig?.tagline || 'انضم إلينا وابدأ في إدارة وإطلاق مشروعك اليوم'}
        </p>

        {tenantConfig?.freeTrial?.enabled && (
          <div style={{
            background: 'rgba(255, 107, 53, 0.12)',
            border: '1.5px solid var(--or, #FF6B35)',
            color: '#FF6B35',
            fontSize: '13px',
            fontWeight: '700',
            padding: '6px 14px',
            borderRadius: '30px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '20px'
          }}>
            <span>🔥 فترة تجريبية مجانية لمدة {tenantConfig.freeTrial.days || 7} أيام!</span>
          </div>
        )}

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={{ ...styles.label, ...(tenantConfig?.textColor ? { color: tenantConfig.textColor } : {}) }}>الاسم الكامل</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              placeholder="الاسم الكامل"
              required 
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={{ ...styles.label, ...(tenantConfig?.textColor ? { color: tenantConfig.textColor } : {}) }}>البريد الإلكتروني</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="example@email.com"
              required 
              dir="ltr"
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={{ ...styles.label, ...(tenantConfig?.textColor ? { color: tenantConfig.textColor } : {}) }}>كلمة المرور</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required 
              dir="ltr"
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={{ ...styles.label, ...(tenantConfig?.textColor ? { color: tenantConfig.textColor } : {}) }}>تأكيد كلمة المرور</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required 
              dir="ltr"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            style={{ 
              ...styles.button, 
              ...(tenantConfig?.primaryColor && tenantConfig?.accentColor 
                ? { background: `linear-gradient(135deg, ${tenantConfig.primaryColor}, ${tenantConfig.accentColor})`, boxShadow: `0 4px 24px ${tenantConfig.primaryColor}4D` } 
                : {}) 
            }}
          >
            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب جديد'}
          </button>
        </form>

        <div style={styles.loginContainer}>
          <div style={{
            width: '100%',
            height: '1px',
            backgroundColor: 'rgba(255,255,255,0.06)',
            margin: '22px 0'
          }} />
          <span style={{
            display: 'block',
            fontSize: '12.5px',
            color: '#9090b0',
            marginBottom: '12px'
          }}>
            لديك حساب بالفعل؟
          </span>
          <a 
            href="/login" 
            style={{ 
              ...styles.loginButton, 
              ...(tenantConfig?.primaryColor 
                ? { 
                    borderColor: `${tenantConfig.primaryColor}50`, 
                    background: `${tenantConfig.primaryColor}0d`,
                    color: tenantConfig.textColor || '#f8f4ff' 
                  } 
                : {}) 
            }}
          >
            🔑 تسجيل الدخول الآن | Login
          </a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#08080f',
    fontFamily: '"IBM Plex Sans Arabic", "DM Sans", sans-serif',
    direction: 'rtl',
    zIndex: 9999,
    overflowY: 'auto',
    padding: '20px 0'
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#181825',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '20px',
    padding: '30px 40px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: 'auto'
  },
  logo: {
    height: '42px',
    width: 'auto',
    maxWidth: '180px',
    objectFit: 'contain',
    marginBottom: '20px',
  },
  title: {
    color: '#f8f4ff',
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '6px'
  },
  subtitle: {
    color: '#9090b0',
    fontSize: '13px',
    marginBottom: '24px',
    textAlign: 'center'
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: '100%'
  },
  label: {
    color: '#f8f4ff',
    fontSize: '12.5px',
    fontWeight: '500'
  },
  input: {
    padding: '11px 14px',
    borderRadius: '10px',
    backgroundColor: '#101018',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#f8f4ff',
    fontSize: '13.5px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  button: {
    marginTop: '10px',
    padding: '13px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #FF6B35, #6C35FF)',
    color: '#fff',
    fontSize: '14.5px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 24px rgba(255,107,53,0.3)'
  },
  error: {
    color: '#ff5f57',
    backgroundColor: 'rgba(255, 95, 87, 0.1)',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '12.5px',
    marginBottom: '16px',
    width: '100%',
    textAlign: 'center',
    border: '1px solid rgba(255, 95, 87, 0.2)'
  },
  loginContainer: {
    marginTop: '10px',
    textAlign: 'center',
    width: '100%'
  },
  loginButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    border: '1.5px solid rgba(255, 107, 53, 0.4)',
    background: 'rgba(255, 107, 53, 0.04)',
    color: '#f8f4ff',
    fontSize: '14px',
    fontWeight: '700',
    textDecoration: 'none',
    transition: 'all 0.2s',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(255,107,53,0.05)'
  }
};
