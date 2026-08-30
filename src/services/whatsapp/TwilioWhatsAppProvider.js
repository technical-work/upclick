/**
 * Twilio WhatsApp Business — Content Templates only.
 * Required env:
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_WHATSAPP_FROM   e.g. whatsapp:+14155238886
 *   TWILIO_CONTENT_SID     e.g. HXxxxxxxxx
 */

function env(name) {
  return String(process.env[name] || '').trim();
}

export function isWhatsAppEnabled() {
  return Boolean(
    env('TWILIO_ACCOUNT_SID') &&
    env('TWILIO_AUTH_TOKEN') &&
    env('TWILIO_WHATSAPP_FROM') &&
    env('TWILIO_CONTENT_SID')
  );
}

export function whatsappStatus() {
  return {
    enabled: isWhatsAppEnabled(),
    fromConfigured: Boolean(env('TWILIO_WHATSAPP_FROM')),
    contentSidConfigured: Boolean(env('TWILIO_CONTENT_SID')),
    accountConfigured: Boolean(env('TWILIO_ACCOUNT_SID') && env('TWILIO_AUTH_TOKEN'))
  };
}

function toWhatsAppAddress(phone) {
  const raw = String(phone || '').trim();
  if (!raw) return '';
  if (raw.startsWith('whatsapp:')) return raw;
  const digits = raw.startsWith('+') ? raw : `+${raw.replace(/\D/g, '')}`;
  return `whatsapp:${digits}`;
}

export async function sendWhatsAppTemplate({ to, variables = {} }) {
  if (!isWhatsAppEnabled()) {
    return {
      success: false,
      error: 'Twilio WhatsApp templates are not configured (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, TWILIO_CONTENT_SID).'
    };
  }

  const dest = toWhatsAppAddress(to);
  if (!dest) {
    return { success: false, error: 'Invalid WhatsApp destination' };
  }

  const sid = env('TWILIO_ACCOUNT_SID');
  const token = env('TWILIO_AUTH_TOKEN');
  const from = env('TWILIO_WHATSAPP_FROM').startsWith('whatsapp:')
    ? env('TWILIO_WHATSAPP_FROM')
    : `whatsapp:${env('TWILIO_WHATSAPP_FROM')}`;
  const contentSid = env('TWILIO_CONTENT_SID');

  const body = new URLSearchParams();
  body.set('From', from);
  body.set('To', dest);
  body.set('ContentSid', contentSid);
  if (variables && Object.keys(variables).length > 0) {
    const mapped = {};
    Object.entries(variables).forEach(([key, value], index) => {
      const slot = /^\d+$/.test(key) ? key : String(index + 1);
      mapped[slot] = String(value ?? '');
    });
    body.set('ContentVariables', JSON.stringify(mapped));
  }

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: data?.message || data?.error_message || `Twilio HTTP ${res.status}`
      };
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message || 'Twilio request failed' };
  }
}
