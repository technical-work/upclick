'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { getCoachPortalSettings } from '../../../../lib/membershipsService';

export default function ClientPortalLoginPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const coachUsername = params?.coachUsername || 'moha';
  const redirectUrl = searchParams.get('redirectUrl') || `/portal/${coachUsername}`;

  // State: 'login' | 'signup' | 'otp'
  const [mode, setMode] = useState('login');
  const [portalSettings, setPortalSettings] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('mohamedhesham300000@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['4', '3', '9', '2', '7', '5']);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const otpRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  // Fetch coach portal title
  useEffect(() => {
    async function loadSettings() {
      try {
        const s = await getCoachPortalSettings(coachUsername);
        if (s) setPortalSettings(s);
      } catch (e) {}
    }
    loadSettings();
  }, [coachUsername]);

  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otpDigits];
    next[idx] = val.slice(-1);
    setOtpDigits(next);

    // Auto-advance
    if (val && idx < 5) {
      otpRefs[idx + 1]?.current?.focus();
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      otpRefs[idx - 1]?.current?.focus();
    }
  };

  const handleAuthSuccess = (studentName, studentEmail) => {
    const studentObj = {
      name: studentName || 'mohamed',
      email: studentEmail.toLowerCase(),
      avatar: '/icon.png',
      joinedAt: new Date().toISOString(),
      completedLessons: [],
      joinedCommunities: []
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(`upklick_student_${coachUsername}`, JSON.stringify(studentObj));
      localStorage.setItem('upklick_current_student', JSON.stringify(studentObj));
    }

    router.push(redirectUrl);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (mode === 'login') {
        if (!email) {
          setErrorMsg('Please enter your email.');
          return;
        }
        handleAuthSuccess(email.split('@')[0], email);
      } else if (mode === 'signup') {
        if (!name || !email) {
          setErrorMsg('Please complete all required fields.');
          return;
        }
        handleAuthSuccess(name, email);
      } else if (mode === 'otp') {
        const code = otpDigits.join('');
        if (code.length < 6) {
          setErrorMsg('Please enter all 6 digits of the secure code.');
          return;
        }
        handleAuthSuccess(email.split('@')[0], email);
      }
    }, 600);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      width: '100%',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      background: '#ffffff'
    }}>
      {/* ========================================================================= */}
      {/* LEFT COLUMN: Clean White Auth Forms (Screenshot 1 & 2)                    */}
      {/* ========================================================================= */}
      <div style={{
        flex: '1 1 50%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 24px',
        background: '#ffffff',
        minHeight: '100vh'
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          
          {/* ===================================================================== */}
          {/* MODE 1: LOGIN (Screenshot 1)                                          */}
          {/* ===================================================================== */}
          {mode === 'login' && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '800',
                color: '#111827',
                margin: '0 0 24px 0',
                letterSpacing: '-0.5px'
              }}>
                Login
              </h1>

              {/* Continue with Google */}
              <button
                type="button"
                onClick={() => handleAuthSuccess('Mohamed Hesham', 'mohamedhesham300000@gmail.com')}
                style={{
                  width: '100%',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontSize: '13.5px',
                  fontWeight: '600',
                  color: '#374151',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* Google SVG Logo */}
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                margin: '22px 0',
                color: '#9ca3af',
                fontSize: '12px'
              }}>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                <span style={{ padding: '0 12px', fontSize: '11.5px', color: '#6b7280' }}>
                  Or, sign in with your email
                </span>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
              </div>

              {/* Email Input */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  background: '#ffffff'
                }}>
                  <Mail size={16} color="#9ca3af" style={{ marginRight: '10px' }} />
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      fontSize: '13px',
                      color: '#111827'
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  background: '#ffffff'
                }}>
                  <Lock size={16} color="#9ca3af" style={{ marginRight: '10px' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      fontSize: '13px',
                      color: '#111827'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => alert('Password reset instructions sent to ' + email)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#2563eb',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Forgot password?
                </button>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '14px', textAlign: 'center' }}>
                  {errorMsg}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: '#1d4ed8',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '11px',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(29, 78, 216, 0.3)',
                  marginBottom: '12px',
                  transition: 'background 0.15s'
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              {/* Login with Secure Code Button */}
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setMode('otp');
                }}
                style={{
                  width: '100%',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#374151',
                  cursor: 'pointer',
                  marginBottom: '28px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
              >
                Login with secure code
              </button>

              {/* Sign up link */}
              <div style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
                New user?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setMode('signup');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#2563eb',
                    fontWeight: '700',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Sign up
                </button>
              </div>
            </form>
          )}

          {/* ===================================================================== */}
          {/* MODE 2: ENTER OTP (Screenshot 2)                                      */}
          {/* ===================================================================== */}
          {mode === 'otp' && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '800',
                color: '#111827',
                margin: '0 0 6px 0',
                letterSpacing: '-0.5px'
              }}>
                Enter OTP
              </h1>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 24px 0', fontWeight: '500' }}>
                Secure code
              </p>

              {/* 6 Digit Input Boxes (Screenshot 2) */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '8px',
                marginBottom: '20px'
              }}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={otpRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    style={{
                      width: '48px',
                      height: '52px',
                      borderRadius: '8px',
                      border: '1.5px solid #d1d5db',
                      textAlign: 'center',
                      fontSize: '22px',
                      fontWeight: '800',
                      color: '#111827',
                      outline: 'none',
                      background: '#ffffff',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                    }}
                  />
                ))}
              </div>

              {/* Helper Text */}
              <p style={{
                fontSize: '11.5px',
                color: '#6b7280',
                lineHeight: '1.6',
                margin: '0 0 22px 0'
              }}>
                Please check your email:{' '}
                <strong style={{ color: '#111827' }}>{email}</strong> for the secure code. If you did not receive any email from us,{' '}
                <button
                  type="button"
                  onClick={() => alert('New secure code resent to ' + email)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#2563eb',
                    padding: 0,
                    fontSize: '11.5px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  tap here to resend
                </button>.
              </p>

              {/* Verify Secure Code Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: '#1d4ed8',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '11px',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(29, 78, 216, 0.3)',
                  marginBottom: '16px'
                }}
              >
                {loading ? 'Verifying...' : 'Verify secure code'}
              </button>

              {/* Back to Password Login */}
              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setMode('login');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#2563eb',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Login with password
                </button>
              </div>
            </form>
          )}

          {/* ===================================================================== */}
          {/* MODE 3: SIGN UP / CREATE ACCOUNT                                      */}
          {/* ===================================================================== */}
          {mode === 'signup' && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '800',
                color: '#111827',
                margin: '0 0 24px 0',
                letterSpacing: '-0.5px'
              }}>
                Create Account
              </h1>

              {/* Continue with Google */}
              <button
                type="button"
                onClick={() => handleAuthSuccess('Mohamed Hesham', 'mohamedhesham300000@gmail.com')}
                style={{
                  width: '100%',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontSize: '13.5px',
                  fontWeight: '600',
                  color: '#374151',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                margin: '22px 0',
                color: '#9ca3af',
                fontSize: '12px'
              }}>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                <span style={{ padding: '0 12px', fontSize: '11.5px', color: '#6b7280' }}>
                  Or, sign up with your email
                </span>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
              </div>

              {/* Full Name */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  background: '#ffffff'
                }}>
                  <User size={16} color="#9ca3af" style={{ marginRight: '10px' }} />
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', color: '#111827' }}
                  />
                </div>
              </div>

              {/* Email */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  background: '#ffffff'
                }}>
                  <Mail size={16} color="#9ca3af" style={{ marginRight: '10px' }} />
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', color: '#111827' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '9px 12px',
                  background: '#ffffff'
                }}>
                  <Lock size={16} color="#9ca3af" style={{ marginRight: '10px' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create a Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', border: 'none', outline: 'none', fontSize: '13px', color: '#111827' }}
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '14px', textAlign: 'center' }}>
                  {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: '#1d4ed8',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '11px',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(29, 78, 216, 0.3)',
                  marginBottom: '20px'
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              {/* Back to Login */}
              <div style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setMode('login');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#2563eb',
                    fontWeight: '700',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Log in
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN: Solid Royal Blue "My portal" (Screenshot 1 & 2)             */}
      {/* ========================================================================= */}
      <div style={{
        flex: '1 1 50%',
        background: '#0d6efd',
        backgroundImage: 'linear-gradient(135deg, #0d6efd 0%, #1d4ed8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        color: '#ffffff',
        minHeight: '100vh'
      }}>
        <h2 style={{
          fontSize: '48px',
          fontWeight: '700',
          color: '#ffffff',
          letterSpacing: '-0.5px',
          margin: 0,
          textAlign: 'center'
        }}>
          {portalSettings?.portalTitle || 'My portal'}
        </h2>
      </div>
    </div>
  );
}
