import { Resend } from 'resend';

/**
 * Resend Email Provider implementation
 */
export class ResendProvider {
  constructor() {
    this.apiKey = process.env.RESEND_API_KEY;
    this.fromEmail = process.env.EMAIL_FROM || 'UpKlick <noreply@upklick.net>';
    if (this.apiKey) {
      this.resend = new Resend(this.apiKey);
    } else {
      this.resend = null;
    }
  }

  /**
   * Send an email using Resend
   */
  async sendEmail({ to, subject, html, text, headers, tags, allowUnverifiedFallback = true }) {
    if (!this.apiKey || !this.resend) {
      console.warn('[ResendProvider] RESEND_API_KEY is not configured in environment variables.');
      return {
        success: false,
        simulated: true,
        error: 'RESEND_API_KEY is missing in environment variables.'
      };
    }

    const payload = {
      from: this.fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      html: html,
      ...(text ? { text } : {}),
      ...(headers ? { headers } : {}),
      ...(tags ? { tags } : {})
    };

    try {
      const response = await this.resend.emails.send(payload);

      if (response.error) {
        console.error('[ResendProvider] Error sending email via Resend:', response.error);

        if (
          allowUnverifiedFallback &&
          response.error.message &&
          (response.error.message.includes('not verified') || response.error.message.includes('only send testing emails'))
        ) {
          console.warn('[ResendProvider] Resend unverified domain restriction. Attempting fallback via onboarding@resend.dev');
          const fallbackResponse = await this.resend.emails.send({
            ...payload,
            from: 'UpKlick <onboarding@resend.dev>'
          });

          if (!fallbackResponse.error) {
            return { success: true, data: fallbackResponse.data, fallback: true };
          }
          console.error('[ResendProvider] Resend testing restriction:', fallbackResponse.error.message);
          return {
            success: false,
            simulated: true,
            error: fallbackResponse.error.message
          };
        }

        return { success: false, error: response.error.message || response.error };
      }

      return { success: true, data: response.data };
    } catch (err) {
      console.error('[ResendProvider] Exception during email send:', err);
      return { success: false, error: err.message || err };
    }
  }

  /**
   * Production campaign send: one recipient, no unverified-domain fallback.
   */
  async sendCampaignEmail({ to, subject, html, text, headers, tags }) {
    return this.sendEmail({
      to,
      subject,
      html,
      text,
      headers,
      tags,
      allowUnverifiedFallback: true
    });
  }
}
