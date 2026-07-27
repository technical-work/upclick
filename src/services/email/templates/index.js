/**
 * HTML Email Templates for UpKlick
 * Designed with modern responsive styles, dark/purple accent palette, and RTL Arabic support.
 */

const baseEmailStyle = `
  body {
    margin: 0;
    padding: 0;
    background-color: #08080f;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #e2e8f0;
    direction: rtl;
  }
  .container {
    max-width: 580px;
    margin: 0 auto;
    padding: 30px 20px;
  }
  .card {
    background-color: #141422;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 36px 30px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
  }
  .logo-header {
    text-align: center;
    margin-bottom: 28px;
  }
  .logo-title {
    color: #ffffff;
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.5px;
    margin: 0;
  }
  .logo-gradient {
    background: linear-gradient(135deg, #FF6B35, #6C35FF);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .title {
    color: #ffffff;
    font-size: 22px;
    font-weight: 700;
    margin-top: 0;
    margin-bottom: 16px;
    text-align: right;
  }
  .text {
    color: #a0aec0;
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 24px;
    text-align: right;
  }
  .btn-wrapper {
    text-align: center;
    margin: 32px 0;
  }
  .btn {
    display: inline-block;
    padding: 14px 32px;
    background: linear-gradient(135deg, #FF6B35, #6C35FF);
    color: #ffffff !important;
    text-decoration: none;
    font-weight: 700;
    font-size: 15px;
    border-radius: 12px;
    box-shadow: 0 6px 20px rgba(255, 107, 53, 0.35);
  }
  .alt-link-text {
    font-size: 12px;
    color: #718096;
    word-break: break-all;
    margin-top: 24px;
    text-align: right;
  }
  .footer {
    text-align: center;
    margin-top: 30px;
    font-size: 13px;
    color: #4a5568;
  }
`;

export function getVerificationEmailTemplate({ name, code, verificationLink }) {
  const recipientName = name ? name : 'عزيزنا المستخدم';
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>رمز تفعيل الحساب - UpKlick</title>
  <style>
    ${baseEmailStyle}
    .code-box {
      background: linear-gradient(135deg, rgba(255, 107, 53, 0.12), rgba(108, 53, 255, 0.18));
      border: 1.5px solid rgba(108, 53, 255, 0.35);
      border-radius: 16px;
      padding: 24px 16px;
      text-align: center;
      margin: 28px 0;
    }
    .code-digits {
      font-family: 'Courier New', Courier, monospace;
      font-size: 38px;
      font-weight: 800;
      letter-spacing: 12px;
      color: #FF6B35;
      margin: 12px 0;
      direction: ltr;
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo-header">
        <h1 class="logo-title"><span class="logo-gradient">UpKlick</span></h1>
      </div>
      <h2 class="title">مرحباً ${recipientName} 👋</h2>
      <p class="text">
        شكراً لتسجيلك في منصة UpKlick! رمز تفعيل حسابك المكون من 6 أرقام هو:
      </p>
      
      <div class="code-box">
        <div style="font-size: 13px; color: #a0aec0; margin-bottom: 6px;">رمز التحقق الخارجي</div>
        <div class="code-digits">${code}</div>
        <div style="font-size: 12px; color: #718096; margin-top: 8px;">الرمز صالح لمدة 15 دقيقة</div>
      </div>

      ${verificationLink ? `
      <div class="btn-wrapper" style="margin-top: 20px;">
        <a href="${verificationLink}" target="_blank" class="btn">أو التفعيل المباشر بنقرة واحدة</a>
      </div>` : ''}

      <p class="text" style="font-size: 13px; color: #718096; margin-top: 24px;">
        أدخل هذا الرمز داخل التطبيق لتأكيد ملكية البريد وتفعيل حسابك بالكامل. إذا لم تطلب هذا الرمز، يمكنك تجاهل هذا البريد.
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} UpKlick. جميع الحقوق محفوظة.
    </div>
  </div>
</body>
</html>
  `;
}

export function getResetPasswordEmailTemplate({ name, code }) {
  const recipientName = name ? name : 'عزيزنا المستخدم';
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>إعادة تعيين كلمة المرور - UpKlick</title>
  <style>
    ${baseEmailStyle}
    .code-box {
      background: linear-gradient(135deg, rgba(255, 107, 53, 0.12), rgba(108, 53, 255, 0.18));
      border: 1.5px solid rgba(108, 53, 255, 0.35);
      border-radius: 16px;
      padding: 26px 18px;
      text-align: center;
      margin: 28px 0;
    }
    .code-digits {
      font-family: 'Courier New', Courier, monospace;
      font-size: 42px;
      font-weight: 800;
      letter-spacing: 14px;
      color: #FF6B35;
      margin: 14px 0;
      direction: ltr;
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo-header">
        <h1 class="logo-title"><span class="logo-gradient">UpKlick</span></h1>
      </div>
      <h2 class="title">طلب إعادة تعيين كلمة المرور 🔐</h2>
      <p class="text">
        مرحباً ${recipientName}، لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في UpKlick.
      </p>

      <div class="code-box">
        <div style="font-size: 13px; color: #a0aec0; margin-bottom: 6px;">رمز إعادة تعيين كلمة المرور</div>
        <div class="code-digits">${code || '000000'}</div>
        <div style="font-size: 12px; color: #718096; margin-top: 8px;">الرمز صالح لمدة 15 دقيقة فقط</div>
      </div>

      <p class="text" style="font-size: 13px; color: #718096; margin-top: 24px;">
        أدخل هذا الرمز المكون من 6 أرقام داخل المنصة لاختيار كلمة المرور الجديدة. إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذه الرسالة، وستظل كلمة المرور الحالية دون تغيير.
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} UpKlick. جميع الحقوق محفوظة.
    </div>
  </div>
</body>
</html>
  `;
}

export function getWelcomeEmailTemplate({ name, dashboardUrl }) {
  const recipientName = name ? name : 'عزيزنا المستخدم';
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>أهلاً بك في UpKlick</title>
  <style>${baseEmailStyle}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo-header">
        <h1 class="logo-title"><span class="logo-gradient">UpKlick</span></h1>
      </div>
      <h2 class="title">أهلاً بك في عائلة UpKlick! 🚀</h2>
      <p class="text">
        مرحباً ${recipientName}، يسعدنا وجودك معنا. يمكنك الآن البدء في بناء وتنمية أعمالك وتسهيل عملياتك باستخدام أدوات UpKlick الذكية.
      </p>
      <div class="btn-wrapper">
        <a href="${dashboardUrl || '#'}" target="_blank" class="btn">الانتقال إلى لوحة التحكم</a>
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} UpKlick. جميع الحقوق محفوظة.
    </div>
  </div>
</body>
</html>
  `;
}

export function getNotificationEmailTemplate({ name, title, message, actionUrl, actionText }) {
  const recipientName = name ? name : 'عزيزنا المستخدم';
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'إشعار جديد - UpKlick'}</title>
  <style>${baseEmailStyle}</style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo-header">
        <h1 class="logo-title"><span class="logo-gradient">UpKlick</span></h1>
      </div>
      <h2 class="title">${title || 'إشعار جديد'}</h2>
      <p class="text">مرحباً ${recipientName}،</p>
      <p class="text">${message}</p>
      ${actionUrl ? `
      <div class="btn-wrapper">
        <a href="${actionUrl}" target="_blank" class="btn">${actionText || 'عرض التفاصيل'}</a>
      </div>` : ''}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} UpKlick. جميع الحقوق محفوظة.
    </div>
  </div>
</body>
</html>
  `;
}
