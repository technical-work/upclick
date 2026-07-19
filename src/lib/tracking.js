/**
 * Tracking SDK for UpKlick
 * Safely dispatches events to Meta Pixel (fbq) and Google Analytics (gtag)
 */

export const Tracking = {
  /**
   * Track a standard page view
   */
  page: () => {
    if (typeof window !== 'undefined') {
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'PageView');
      }
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'page_view');
      }
    }
  },

  /**
   * Track a new lead capture / signup
   */
  lead: (payload = {}) => {
    if (typeof window !== 'undefined') {
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Lead', payload);
      }
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', payload);
      }
    }
  },

  /**
   * Track a scheduled meeting / booking
   */
  bookMeeting: (payload = {}) => {
    if (typeof window !== 'undefined') {
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Schedule', payload);
      }
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'book_meeting', payload);
      }
    }
  },

  /**
   * Track a purchase event
   * @param {number} value The purchase amount
   * @param {string} currency Currency code (e.g. USD)
   */
  purchase: (value, currency = 'USD', payload = {}) => {
    if (typeof window !== 'undefined') {
      const data = { value, currency, ...payload };
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Purchase', data);
      }
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'purchase', data);
      }
    }
  },

  /**
   * Generic custom event tracker
   * @param {string} eventName The name of the event
   * @param {object} payload Additional metadata
   */
  track: (eventName, payload = {}) => {
    if (typeof window !== 'undefined') {
      if (typeof window.fbq === 'function') {
        window.fbq('trackCustom', eventName, payload);
      }
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, payload);
      }
    }
  }
};
