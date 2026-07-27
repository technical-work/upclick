import { ResendProvider } from './providers/ResendProvider';
import {
  getVerificationEmailTemplate,
  getResetPasswordEmailTemplate,
  getWelcomeEmailTemplate,
  getNotificationEmailTemplate
} from './templates';

/**
 * Factory to get the active email provider.
 * Easily extendable by adding new provider classes (e.g. SendGridProvider, SESProvider).
 */
function getEmailProvider() {
  const providerName = (process.env.EMAIL_PROVIDER || 'resend').toLowerCase();

  switch (providerName) {
    case 'resend':
    default:
      return new ResendProvider();
  }
}

class EmailService {
  constructor() {
    this.provider = getEmailProvider();
  }

  /**
   * Send Email Verification Code
   */
  async sendEmailVerification({ to, name, code, verificationLink }) {
    const html = getVerificationEmailTemplate({ name, code, verificationLink });
    const subject = code ? `رمز تفعيل حسابك في UpKlick هو: [ ${code} ]` : 'تأكيد البريد الإلكتروني - UpKlick';
    return this.provider.sendEmail({ to, subject, html });
  }

  /**
   * Send Password Reset Email
   */
  async sendPasswordResetEmail({ to, name, code, resetLink }) {
    const html = getResetPasswordEmailTemplate({ name, code, resetLink });
    const subject = code ? `رمز إعادة تعيين كلمة المرور في UpKlick هو: [ ${code} ]` : 'إعادة تعيين كلمة المرور - UpKlick';
    return this.provider.sendEmail({ to, subject, html });
  }

  /**
   * Send Welcome Email (Future extensibility)
   */
  async sendWelcomeEmail({ to, name, dashboardUrl }) {
    const html = getWelcomeEmailTemplate({ name, dashboardUrl });
    const subject = 'أهلاً بك في منصة UpKlick 🚀';
    return this.provider.sendEmail({ to, subject, html });
  }

  /**
   * Send Generic / Notification Email (Future extensibility)
   */
  async sendNotificationEmail({ to, name, title, message, actionUrl, actionText }) {
    const html = getNotificationEmailTemplate({ name, title, message, actionUrl, actionText });
    const subject = title || 'إشعار جديد - UpKlick';
    return this.provider.sendEmail({ to, subject, html });
  }
}

export const emailService = new EmailService();
export default emailService;
