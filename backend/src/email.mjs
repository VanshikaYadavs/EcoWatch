import './loadEnv.mjs';
import sgMail from '@sendgrid/mail';

const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
if (!SENDGRID_KEY) {
  console.warn('SENDGRID_API_KEY not set — email sending disabled');
}
else {
  sgMail.setApiKey(SENDGRID_KEY);
}

// Simple in-memory rate limiter: map userId/email -> lastSent timestamp
const lastSent = new Map();
const MIN_INTERVAL_MS = (process.env.EMAIL_MIN_INTERVAL_MINUTES ? Number(process.env.EMAIL_MIN_INTERVAL_MINUTES) : 15) * 60 * 1000;

export async function sendEmail({ to, subject, text, html, userId }) {
  if (!SENDGRID_KEY) {
    console.warn(`[email] API key not set`);
    return { ok: false, reason: 'no_api_key' };
  }
  
  const key = userId || to;
  const prev = lastSent.get(key) || 0;
  const elapsed = Date.now() - prev;
  
  if (elapsed < MIN_INTERVAL_MS) {
    console.warn(`[email] Rate limited for ${to}`);
    return { ok: false, reason: 'rate_limited' };
  }

  const msg = {
    to,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || 'no-reply@ecowatch.local',
      name: 'EcoWatch Alerts',
    },
    subject,
    text,
    html,
    replyTo: 'noreply@ecowatch.io',
    headers: {
      'List-Unsubscribe': '<https://ecowatch.local/unsubscribe>',
      'X-Priority': '3',
      'X-MSMail-Priority': 'Normal',
      'Importance': 'Normal',
    },
  };

  try {
    const response = await sgMail.send(msg);
    lastSent.set(key, Date.now());
    console.log(`[email] Sent to ${to}`);
    return { ok: true };
  } catch (e) {
    const errorMsg = e?.response?.body?.errors?.[0]?.message || e?.message || String(e);
    console.error(`[email] SendGrid error: ${errorMsg}`);
    return { ok: false, reason: errorMsg };
  }
}

export default { sendEmail };
