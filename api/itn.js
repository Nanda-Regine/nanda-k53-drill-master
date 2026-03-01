// api/itn.js — Vercel serverless function
// PayFast Instant Transaction Notification (ITN) handler.
// PayFast POSTs here server-to-server when a payment completes/fails.

import crypto from 'crypto';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const data = req.body || {};

  // ── 1. Validate PayFast signature ─────────────────────────────────────────
  const { signature, ...rest } = data;
  const isLive = process.env.NEXT_PUBLIC_PAYFAST_SANDBOX !== 'true';

  const str = Object.entries(rest)
    .filter(([, v]) => v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v).trim()).replace(/%20/g, '+')}`)
    .join('&');

  const withPass = isLive && process.env.PAYFAST_PASSPHRASE
    ? `${str}&passphrase=${encodeURIComponent(process.env.PAYFAST_PASSPHRASE.trim()).replace(/%20/g, '+')}`
    : str;

  const computed = crypto.createHash('md5').update(withPass).digest('hex');

  if (computed !== signature) {
    console.error('[ITN] Invalid signature. Computed:', computed, 'Received:', signature);
    return res.status(400).send('Invalid signature');
  }

  // ── 2. Log the payment ────────────────────────────────────────────────────
  const status = data.payment_status;
  const log = {
    payment_id:  data.pf_payment_id,
    status,
    amount:      data.amount_gross,
    plan:        data.custom_str1,
    email:       data.email_address,
    name:        `${data.name_first || ''} ${data.name_last || ''}`.trim(),
    timestamp:   new Date().toISOString(),
  };

  if (status === 'COMPLETE') {
    console.log('[ITN] Payment COMPLETE:', JSON.stringify(log));
  } else {
    console.log(`[ITN] Payment ${status}:`, JSON.stringify(log));
  }

  // ── 3. Acknowledge to PayFast ─────────────────────────────────────────────
  res.status(200).send('OK');
}
