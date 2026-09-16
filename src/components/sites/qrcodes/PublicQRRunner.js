'use client';

import React, { useEffect, useState } from 'react';
import { findLocalQRCodeById, trackQRCodeScan } from '@/lib/sites/userSitesScope';
import {
  Globe,
  Star,
  Phone,
  MessageSquare,
  Mail,
  CreditCard,
  MessageCircle,
  Layers,
  FileText,
  CheckSquare,
  Award,
  UserCheck,
  Contact,
  Briefcase,
  Smartphone,
  ExternalLink,
  QrCode,
  Download,
  ArrowRight
} from 'lucide-react';

export default function PublicQRRunner({ qrId }) {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (!qrId) {
      setLoading(false);
      return;
    }

    const found = findLocalQRCodeById(qrId);
    if (found) {
      setQrCode(found);
      // Track the scan analytics
      trackQRCodeScan(qrId);

      const target = found.targetPayload || found.data?.url || '';
      // If it's a web URL, auto-redirect after a short delay
      if (target && /^https?:\/\//i.test(target)) {
        const timer = setTimeout(() => {
          setRedirected(true);
          window.location.href = target;
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
    setLoading(false);
  }, [qrId]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0a0a0f',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(37,99,235,0.2)',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '16px'
          }}
        />
        <p style={{ fontSize: '14px', color: '#94a3b8' }}>Scanning QR Code...</p>
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0a0a0f',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}
        >
          <QrCode size={32} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 8px' }}>QR Code Not Found</h2>
        <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '400px', margin: 0 }}>
          The requested QR code could not be located or has expired.
        </p>
      </div>
    );
  }

  const target = qrCode.targetPayload || qrCode.data?.url || '#';

  const handleAction = () => {
    if (qrCode.type === 'vcard' || qrCode.type === 'business_card') {
      const blob = new Blob([target], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${qrCode.data?.name || qrCode.name || 'contact'}.vcf`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      window.location.href = target;
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: '#fff',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <div
        style={{
          background: '#13131e',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          maxWidth: '440px',
          width: '100%',
          padding: '32px',
          textAlign: 'center',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.3s ease'
        }}
      >
        {/* QR Preview or Logo */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: qrCode.design?.bgColor || '#ffffff',
            padding: '8px',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
          }}
        >
          {qrCode.previewDataUrl ? (
            <img
              src={qrCode.previewDataUrl}
              alt={qrCode.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <QrCode size={36} color="#0f172a" />
          )}
        </div>

        <h1 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 8px', color: '#fff' }}>
          {qrCode.name}
        </h1>

        <div
          style={{
            display: 'inline-block',
            background: 'rgba(37, 99, 235, 0.15)',
            color: '#60a5fa',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '700',
            marginBottom: '20px',
            textTransform: 'capitalize'
          }}
        >
          {qrCode.type.replace('_', ' ')}
        </div>

        <p style={{ fontSize: '13.5px', color: '#94a3b8', margin: '0 0 24px', lineHeight: 1.6 }}>
          {/^https?:\/\//i.test(target)
            ? 'Redirecting to your destination...'
            : 'Click the button below to proceed.'}
        </p>

        <button
          onClick={handleAction}
          style={{
            width: '100%',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            padding: '14px 20px',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)'
          }}
        >
          <span>
            {qrCode.type === 'vcard' || qrCode.type === 'business_card'
              ? 'Download Contact Card'
              : qrCode.type === 'call'
              ? 'Call Phone Number'
              : qrCode.type === 'whatsapp'
              ? 'Open WhatsApp'
              : qrCode.type === 'sms'
              ? 'Send SMS'
              : qrCode.type === 'email'
              ? 'Send Email'
              : 'Open Link'}
          </span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
