'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useBusiness } from '@/context/BusinessContext';

const FB_GROUP_URL = 'https://www.facebook.com/groups/963841463139798';

export default function FacebookCommunityRewardModal({ isOpen, onClose, onClaimSuccess }) {
  const { user, userData } = useAuth();
  const { lang, L } = useBusiness();
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confettiActive, setConfettiActive] = useState(false);
  const canvasRef = useRef(null);

  const isAr = lang === 'ar';

  // Confetti Particle System
  useEffect(() => {
    if (!confettiActive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.offsetWidth || 520;
    canvas.height = canvas.parentElement.offsetHeight || 600;

    const colors = ['#FF6B35', '#6C35FF', '#1877F2', '#00ff88', '#FFD700', '#FF3D6E', '#00F0FF'];
    const particles = Array.from({ length: 90 }, () => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.8) * 16,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 12,
      opacity: 1,
      gravity: 0.35,
      shape: Math.random() > 0.5 ? 'rect' : 'circle'
    }));

    let animationFrame;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let aliveCount = 0;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.rotation += p.vRot;
        p.opacity -= 0.009;

        if (p.opacity > 0) {
          aliveCount++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;

          if (p.shape === 'rect') {
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      });

      if (aliveCount > 0) {
        animationFrame = requestAnimationFrame(render);
      } else {
        setConfettiActive(false);
      }
    };

    animationFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrame);
  }, [confettiActive]);

  if (!isOpen) return null;

  const handleJoinAndClaim = async () => {
    // 1. Open Facebook group in a new tab immediately
    try {
      window.open(FB_GROUP_URL, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.warn('Popup blocked:', e);
    }

    if (!user?.uid) {
      onClose();
      return;
    }

    setClaiming(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/claim-facebook-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setClaimed(true);
        setConfettiActive(true);
        if (onClaimSuccess) onClaimSuccess(data.rewardCredits || 200);
      } else if (data.alreadyClaimed) {
        setClaimed(true);
      } else {
        setErrorMsg(data.error || (isAr ? 'فشل استلام المكافأة' : 'Failed to claim reward'));
      }
    } catch (err) {
      console.error('Claim error:', err);
      setErrorMsg(isAr ? 'حدث خطأ في الاتصال، يرجى المحاولة لاحقاً' : 'Network error, please try again');
    } finally {
      setClaiming(false);
    }
  };

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('upklick_fb_reward_dismissed', 'true');
    }
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 5, 12, 0.82)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        zIndex: 100000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fbModalFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        direction: isAr ? 'rtl' : 'ltr',
        fontFamily: isAr ? '"IBM Plex Sans Arabic", sans-serif' : '"DM Sans", sans-serif'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
    >
      <style>{`
        @keyframes fbModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fbCardPop {
          0% { transform: scale(0.92) translateY(24px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes floatEmblem {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(2deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        @keyframes pulseAura {
          0%, 100% { transform: scale(1); opacity: 0.45; }
          50% { transform: scale(1.18); opacity: 0.85; }
        }
        @keyframes shineSweep {
          0% { left: -100%; }
          100% { left: 200%; }
        }
        @keyframes tokenGlow {
          0%, 100% { box-shadow: 0 0 25px rgba(255, 107, 53, 0.4), inset 0 0 15px rgba(255, 107, 53, 0.2); }
          50% { box-shadow: 0 0 45px rgba(255, 107, 53, 0.8), inset 0 0 25px rgba(255, 107, 53, 0.4); }
        }
        .btn-fb-join {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #1877F2 0%, #6C35FF 50%, #FF6B35 100%);
          background-size: 200% 200%;
          border: none;
          color: #fff;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 30px rgba(24, 119, 242, 0.4), 0 0 35px rgba(255, 107, 53, 0.3);
        }
        .btn-fb-join:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 15px 40px rgba(24, 119, 242, 0.6), 0 0 50px rgba(255, 107, 53, 0.5);
          background-position: right center;
        }
        .btn-fb-join::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
          transform: skewX(-25deg);
          animation: shineSweep 3.5s infinite;
        }
        .fb-benefit-card {
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 14px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.25s ease;
        }
        .fb-benefit-card:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(24, 119, 242, 0.35);
          transform: translateX(${isAr ? '-3px' : '3px'});
        }
      `}</style>

      <div
        style={{
          position: 'relative',
          maxWidth: '520px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: 'linear-gradient(180deg, rgba(20, 22, 38, 0.97) 0%, rgba(10, 10, 18, 0.98) 100%)',
          border: '1.5px solid rgba(24, 119, 242, 0.35)',
          borderRadius: '28px',
          padding: '32px 26px 26px',
          textAlign: 'center',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 60px rgba(24, 119, 242, 0.25)',
          animation: 'fbCardPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        {/* Canvas Confetti */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 20
          }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            top: '18px',
            [isAr ? 'left' : 'right']: '18px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#9090b0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '15px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
            e.currentTarget.style.color = '#9090b0';
          }}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Top Header Glow & Facebook 3D Emblem */}
        <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 16px' }}>
          {/* Animated Glow Aura */}
          <div
            style={{
              position: 'absolute',
              inset: '-12px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(24, 119, 242, 0.6) 0%, rgba(108, 53, 255, 0.3) 50%, transparent 70%)',
              filter: 'blur(16px)',
              animation: 'pulseAura 3s infinite ease-in-out',
              zIndex: 1
            }}
          />

          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #1877F2 0%, #0052CC 60%, #6C35FF 100%)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 15px 35px rgba(24, 119, 242, 0.5)',
              animation: 'floatEmblem 3.5s infinite ease-in-out',
              zIndex: 2
            }}
          >
            {/* Facebook SVG Logo with Crown */}
            <svg width="44" height="44" viewBox="0 0 24 24" fill="#ffffff">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <div
              style={{
                position: 'absolute',
                top: '-10px',
                right: '-6px',
                fontSize: '22px',
                filter: 'drop-shadow(0 2px 8px rgba(255, 215, 0, 0.6))'
              }}
            >
              👑
            </div>
          </div>
        </div>

        {/* Exclusive Gift Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 107, 53, 0.12)', border: '1px solid rgba(255, 107, 53, 0.35)', borderRadius: '20px', padding: '5px 14px', marginBottom: '12px' }}>
          <span style={{ fontSize: '15px' }}>🎁</span>
          <span style={{ fontSize: '12px', fontWeight: '800', color: '#FF8F5E', letterSpacing: '0.3px' }}>
            {isAr ? 'هدية انضمام حصرية للأعضاء الجدد' : 'Exclusive Welcome Gift'}
          </span>
        </div>

        {/* Title */}
        <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#fff', marginBottom: '8px', lineHeight: '1.35' }}>
          {isAr ? (
            <>
              انضم لمجتمع <span style={{ background: 'linear-gradient(90deg, #1877F2, #00D4FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>UpKlick</span> على فيسبوك
            </>
          ) : (
            <>
              Join the <span style={{ background: 'linear-gradient(90deg, #1877F2, #00D4FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>UpKlick</span> Facebook Group
            </>
          )}
        </h2>

        {/* Credits Reward Highlight Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.15) 0%, rgba(108, 53, 255, 0.15) 100%)',
            border: '1.5px solid rgba(255, 107, 53, 0.45)',
            borderRadius: '18px',
            padding: '14px 18px',
            margin: '12px 0 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            animation: 'tokenGlow 3s infinite ease-in-out'
          }}
        >
          <div style={{ fontSize: '32px' }}>⚡</div>
          <div style={{ textAlign: isAr ? 'right' : 'left' }}>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#FFD700', textShadow: '0 2px 14px rgba(255, 215, 0, 0.4)', lineHeight: '1.2' }}>
              {isAr ? '+200 كريديت ذكاء اصطناعي' : '+200 Free AI Credits'}
            </div>
            <div style={{ fontSize: '12px', color: '#e0e0f5', marginTop: '2px' }}>
              {isAr
                ? 'تُضاف فوراً إلى رصيدك لاستخدامها في كافة أدوات الذكاء الاصطناعي!'
                : 'Instantly added to your balance to use across all AI tools!'}
            </div>
          </div>
        </div>

        {/* Benefits Cards Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', textAlign: isAr ? 'right' : 'left' }}>
          <div className="fb-benefit-card">
            <div style={{ fontSize: '20px', width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(24, 119, 242, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              🚀
            </div>
            <div style={{ fontSize: '12.5px', color: '#f0f0ff', lineHeight: '1.45' }}>
              <b>{isAr ? 'استراتيجيات نمو وتسويق حصرية' : 'Exclusive Growth Strategies'}:</b> {isAr ? 'شروحات وتكتيكات يومية مجانية من صناع المحتوى ورواد الأعمال.' : 'Daily tips & viral marketing tactics from top creators.'}
            </div>
          </div>

          <div className="fb-benefit-card">
            <div style={{ fontSize: '20px', width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(108, 53, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              🤝
            </div>
            <div style={{ fontSize: '12.5px', color: '#f0f0ff', lineHeight: '1.45' }}>
              <b>{isAr ? 'علاقات وشراكات أعمال' : 'Networking & Collaborations'}:</b> {isAr ? 'تواصل مع أكثر من 2,400 رائد أعمال وابنِ علاقات تجارية وصفقات ناجحة.' : 'Connect with 2,400+ entrepreneurs, find clients & partners.'}
            </div>
          </div>

          <div className="fb-benefit-card">
            <div style={{ fontSize: '20px', width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0, 255, 136, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              ⚡
            </div>
            <div style={{ fontSize: '12.5px', color: '#f0f0ff', lineHeight: '1.45' }}>
              <b>{isAr ? 'أولوية التحديثات والدعم المباشر' : 'Priority Updates & Direct Help'}:</b> {isAr ? 'إمكانية طلب ميزات جديدة والإجابة على كل استفساراتك مباشرة.' : 'Direct access to founders, early features & instant help.'}
            </div>
          </div>
        </div>

        {/* Claim Status Message */}
        {claimed ? (
          <div
            style={{
              background: 'rgba(0, 255, 136, 0.12)',
              border: '1.5px solid rgba(0, 255, 136, 0.35)',
              borderRadius: '16px',
              padding: '14px 18px',
              marginBottom: '16px',
              animation: 'fbCardPop 0.3s ease'
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '4px' }}>🎉 ✨</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#00ff88', marginBottom: '4px' }}>
              {isAr ? 'مبروك! تمت إضافة 200 كريديت بنجاح' : 'Congratulations! +200 Credits Added'}
            </div>
            <div style={{ fontSize: '12.5px', color: '#c0f0d0' }}>
              {isAr
                ? 'أهلاً بك في عائلة UpKlick! استمتع باستخدام كافة أدوات الذكاء الاصطناعي.'
                : 'Welcome to UpKlick family! Enjoy creating with your new AI credits.'}
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              style={{
                marginTop: '12px',
                padding: '8px 24px',
                borderRadius: '10px',
                border: 'none',
                background: '#00ff88',
                color: '#080812',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              {isAr ? 'ابدأ الاستخدام الآن ➔' : 'Start Creating Now ➔'}
            </button>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div style={{ fontSize: '12px', color: '#ff4d6d', backgroundColor: 'rgba(255, 77, 109, 0.1)', padding: '8px 12px', borderRadius: '10px', marginBottom: '12px' }}>
                {errorMsg}
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="button"
              className="btn-fb-join"
              onClick={handleJoinAndClaim}
              disabled={claiming}
              style={{
                width: '100%',
                padding: '15px 24px',
                borderRadius: '16px',
                fontSize: '15.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginBottom: '10px'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>
                {claiming
                  ? (isAr ? 'جاري التحقق وإضافة الكريديت...' : 'Claiming +200 Credits...')
                  : (isAr ? 'انضم للجروب واستلم 200 كريديت فوراً' : 'Join Facebook Group & Claim +200 Credits')}
              </span>
            </button>

            {/* Dismiss Link */}
            <button
              type="button"
              onClick={handleDismiss}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#7a7a9a',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '6px 12px',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#7a7a9a')}
            >
              {isAr ? 'تخطي والمتابعة لاحقاً' : 'Maybe Later'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
