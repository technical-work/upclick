'use client';

import React, { useState } from 'react';

/**
 * Reusable Stripe Payment Button Component
 * Redirects the user to Stripe hosted checkout securely.
 * 
 * Props:
 * - amount: number (e.g. 29.00)
 * - currency: string (e.g. "EGP", "USD")
 * - planName: string (e.g. "Pro Plan Monthly")
 * - planDuration: string ("monthly", "annual", "one-time")
 * - userId: string (current user UID)
 * - adminId: string (tenant/admin UID)
 * - buttonText: string (optional button label)
 * - className: string (optional CSS classes)
 * - style: object (optional inline styles)
 */
export default function StripePaymentButton({
  amount,
  currency = 'EGP',
  planName,
  planDuration = 'monthly',
  userId,
  adminId,
  buttonText,
  className = 'btn btn-prime',
  style = {}
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          planName,
          planDuration,
          userId,
          adminId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        // Redirect directly to Stripe Checkout hosted page
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned from server');
      }
    } catch (err) {
      console.error('Stripe redirect error:', err);
      setError(err.message || 'Payment request failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'inline-block', width: '100%' }}>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className={className}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          ...style,
        }}
      >
        <span>💳</span>
        <span>
          {loading 
            ? (buttonText ? `${buttonText}...` : 'Redirecting...') 
            : (buttonText || `Pay ${amount} ${currency} securely`)
          }
        </span>
      </button>
      {error && (
        <div style={{ color: 'var(--red)', fontSize: '12px', marginTop: '6px', textAlign: 'center' }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
