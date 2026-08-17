/**
 * HTML Email Templates for UpKlick
 * Designed with modern responsive styles, dark/purple accent palette, and RTL Arabic support.
 */

const getLogoHeader = () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://upklick.net';
  const logoUrl = `${baseUrl.replace(/\/$/, '')}/best_logo_dark.png`;
  return `
    <div class="logo-header">
      <a href="${baseUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
        <img src="${logoUrl}" alt="UpKlick" class="logo-img" style="max-height: 48px; width: auto; max-width: 220px; display: block; margin: 0 auto; border: 0;" />
      </a>
    </div>
  `;
};

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
  .logo-img {
    max-height: 48px;
    height: auto;
    width: auto;
    max-width: 220px;
    display: inline-block;
    border: 0;
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
      ${getLogoHeader()}
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
      ${getLogoHeader()}
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
      ${getLogoHeader()}
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
      ${getLogoHeader()}
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

/**
 * Trial Email 1 — Welcome (Start of 15-day Free Trial)
 */
export function getTrialWelcomeEmailTemplate({ name, dashboardUrl }) {
  const targetUrl = dashboardUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://upklick.net/dashboard';

  return `
<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>أهلاً بيك في UpKlick | Welcome to UpKlick</title>
  <style>
    ${baseEmailStyle}
    .lang-section-ar {
      direction: rtl;
      text-align: right;
      margin-bottom: 32px;
      padding-bottom: 28px;
      border-bottom: 1px dashed rgba(255, 255, 255, 0.12);
    }
    .lang-section-en {
      direction: ltr;
      text-align: left;
    }
    .highlight-box {
      background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(108, 53, 255, 0.15));
      border: 1px solid rgba(108, 53, 255, 0.3);
      border-radius: 12px;
      padding: 16px 20px;
      font-weight: 700;
      color: #ffffff;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      ${getLogoHeader()}

      <!-- Arabic Version -->
      <div class="lang-section-ar">
        <h2 class="title">أهلاً بيك في UpKlick 👋</h2>
        <p class="text">
          بدأت دلوقتي تجربتك المجانية لمدة 15 يوم.
        </p>
        <p class="text">
          خلال الفترة دي، تقدر تستكشف أدوات UpKlick وتستخدمها في إدارة شغلك، تنظيم العملاء، التسويق، الأتمتة، المنتجات الرقمية وغيرها.
        </p>
        <div class="highlight-box" style="text-align: right;">
          15 يوم عشان تكتشف إزاي UpKlick ممكن يخلي إدارة شغلك أبسط وأذكى.
        </div>
        <div class="btn-wrapper" style="text-align: right; margin: 24px 0 10px 0;">
          <a href="${targetUrl}" target="_blank" class="btn">ابدأ تجربتك الآن ←</a>
        </div>
      </div>

      <!-- English Version -->
      <div class="lang-section-en">
        <h2 class="title" style="text-align: left;">Welcome to UpKlick 👋</h2>
        <p class="text" style="text-align: left;">
          Your <strong>15-day free trial</strong> has officially started.
        </p>
        <p class="text" style="text-align: left;">
          Explore UpKlick and discover the tools you need to manage your business, organize your workflow, automate tasks, and more — all in one place.
        </p>
        <div class="highlight-box" style="text-align: left;">
          15 days to experience a smarter way to work.
        </div>
        <div class="btn-wrapper" style="text-align: left; margin: 24px 0 10px 0;">
          <a href="${targetUrl}" target="_blank" class="btn">Start Exploring UpKlick →</a>
        </div>
      </div>

    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} UpKlick. All rights reserved. | جميع الحقوق محفوظة.
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Trial Email 2 — 7 Days Remaining
 */
export function getTrial7DaysLeftEmailTemplate({ name, dashboardUrl }) {
  const targetUrl = dashboardUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://upklick.net/dashboard';

  return `
<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>فاضل 7 أيام على انتهاء تجربتك المجانية | 7 Days Left in Free Trial</title>
  <style>
    ${baseEmailStyle}
    .lang-section-ar {
      direction: rtl;
      text-align: right;
      margin-bottom: 32px;
      padding-bottom: 28px;
      border-bottom: 1px dashed rgba(255, 255, 255, 0.12);
    }
    .lang-section-en {
      direction: ltr;
      text-align: left;
    }
    .highlight-box {
      background: linear-gradient(135deg, rgba(255, 107, 53, 0.12), rgba(108, 53, 255, 0.18));
      border: 1px solid rgba(255, 107, 53, 0.35);
      border-radius: 12px;
      padding: 16px 20px;
      font-weight: 700;
      color: #ffffff;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      ${getLogoHeader()}

      <!-- Arabic Version -->
      <div class="lang-section-ar">
        <h2 class="title">فاضل 7 أيام على انتهاء تجربتك المجانية مع UpKlick ⏳</h2>
        <p class="text">
          لسه قدامك أسبوع كامل تقدر خلاله تستكشف أدوات UpKlick وتستخدمها على شغلك الحقيقي.
        </p>
        <div class="highlight-box" style="text-align: right;">
          استغل الـ7 أيام المتبقية واكتشف كل اللي ممكن تعمله مع UpKlick.
        </div>
        <div class="btn-wrapper" style="text-align: right; margin: 24px 0 10px 0;">
          <a href="${targetUrl}" target="_blank" class="btn">استكمل تجربتك الآن ←</a>
        </div>
      </div>

      <!-- English Version -->
      <div class="lang-section-en">
        <h2 class="title" style="text-align: left;">You have 7 days left in your UpKlick free trial ⏳</h2>
        <p class="text" style="text-align: left;">
          You still have a full week to explore UpKlick and put its tools to work for your business.
        </p>
        <div class="highlight-box" style="text-align: left;">
          Make the most of your remaining trial and discover what UpKlick can do for you.
        </div>
        <div class="btn-wrapper" style="text-align: left; margin: 24px 0 10px 0;">
          <a href="${targetUrl}" target="_blank" class="btn">Continue Your Trial →</a>
        </div>
      </div>

    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} UpKlick. All rights reserved. | جميع الحقوق محفوظة.
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Trial Email 3 — Trial Ended (15 Days Finished)
 */
export function getTrialEndedEmailTemplate({ name, pricingUrl }) {
  const targetUrl = pricingUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'https://upklick.net'}/#pricing`;

  return `
<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>انتهت تجربتك المجانية | Free Trial Ended</title>
  <style>
    ${baseEmailStyle}
    .lang-section-ar {
      direction: rtl;
      text-align: right;
      margin-bottom: 32px;
      padding-bottom: 28px;
      border-bottom: 1px dashed rgba(255, 255, 255, 0.12);
    }
    .lang-section-en {
      direction: ltr;
      text-align: left;
    }
    .highlight-box {
      background: linear-gradient(135deg, rgba(108, 53, 255, 0.15), rgba(255, 107, 53, 0.15));
      border: 1px solid rgba(108, 53, 255, 0.4);
      border-radius: 12px;
      padding: 16px 20px;
      font-weight: 700;
      color: #ffffff;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      ${getLogoHeader()}

      <!-- Arabic Version -->
      <div class="lang-section-ar">
        <h2 class="title">انتهت تجربتك المجانية لمدة 15 يوم على UpKlick.</h2>
        <p class="text">
          لكن شغلك مش لازم يقف هنا.
        </p>
        <p class="text">
          دلوقتي تقدر تختار الباقة المناسبة لاحتياجاتك وتكمل استخدام أدوات UpKlick لإدارة وتنمية شغلك.
        </p>
        <div class="highlight-box" style="text-align: right;">
          اختر الباقة المناسبة وكمل رحلتك مع UpKlick.
        </div>
        <div class="btn-wrapper" style="text-align: right; margin: 24px 0 10px 0;">
          <a href="${targetUrl}" target="_blank" class="btn">اختر الباقة المناسبة ←</a>
        </div>
      </div>

      <!-- English Version -->
      <div class="lang-section-en">
        <h2 class="title" style="text-align: left;">Your 15-day free trial has ended.</h2>
        <p class="text" style="text-align: left;">
          But your workflow doesn’t have to stop here.
        </p>
        <p class="text" style="text-align: left;">
          Choose the plan that fits your needs and continue using UpKlick to manage and grow your business.
        </p>
        <div class="highlight-box" style="text-align: left;">
          Choose the plan that works for you and keep growing with UpKlick.
        </div>
        <div class="btn-wrapper" style="text-align: left; margin: 24px 0 10px 0;">
          <a href="${targetUrl}" target="_blank" class="btn">Choose Your Plan →</a>
        </div>
      </div>

    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} UpKlick. All rights reserved. | جميع الحقوق محفوظة.
    </div>
  </div>
</body>
</html>
  `;
}


