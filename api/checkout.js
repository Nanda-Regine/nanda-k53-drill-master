// api/checkout.js — Vercel serverless function
// Generates a PayFast payment form and a signed unlock token.
// The token is placed in the return_url so the app can auto-unlock on return.

import crypto from 'crypto';

const PLANS = {
  monthly: {
    label:  'K53 Drill Master — 1 Month Unlimited',
    amount: '49.00',
    days:   30,
  },
  bundle: {
    label:  'K53 Drill Master — 3 Months Unlimited',
    amount: '149.00',
    days:   90,
  },
};

function generateToken(plan, days) {
  const expiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const payload = Buffer.from(JSON.stringify({ plan, expiry })).toString('base64url');
  const sig = crypto
    .createHmac('sha256', process.env.PAYFAST_PASSPHRASE)
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
}

function payfastSignature(data, passphrase) {
  const str = Object.entries(data)
    .filter(([, v]) => v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v).trim()).replace(/%20/g, '+')}`)
    .join('&');
  const full = passphrase
    ? `${str}&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`
    : str;
  return crypto.createHash('md5').update(full).digest('hex');
}

export default function handler(req, res) {
  const plan = ((req.query && req.query.plan) || 'monthly').toLowerCase();
  const config = PLANS[plan] || PLANS.monthly;

  const isLive = process.env.NEXT_PUBLIC_PAYFAST_SANDBOX !== 'true';
  const pfUrl  = isLive
    ? 'https://www.payfast.co.za/eng/process'
    : 'https://sandbox.payfast.co.za/eng/process';

  const proto   = req.headers['x-forwarded-proto'] || 'https';
  const host    = req.headers.host || 'localhost:5173';
  const baseUrl = host.startsWith('localhost') ? `http://${host}` : `${proto}://${host}`;

  const token = generateToken(plan, config.days);

  const data = {
    merchant_id:  process.env.PAYFAST_MERCHANT_ID,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY,
    return_url:   `${baseUrl}/?unlock=${encodeURIComponent(token)}`,
    cancel_url:   `${baseUrl}/?cancelled=true`,
    notify_url:   `${baseUrl}/api/itn`,
    m_payment_id: crypto.randomUUID(),
    amount:       config.amount,
    item_name:    config.label,
    custom_str1:  plan,
  };

  data.signature = payfastSignature(
    data,
    isLive ? process.env.PAYFAST_PASSPHRASE : ''
  );

  const inputs = Object.entries(data)
    .map(([k, v]) => `<input type="hidden" name="${k}" value="${String(v).replace(/"/g, '&quot;')}">`)
    .join('\n    ');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redirecting to secure payment...</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #060D07; color: #6B7A62;
      font-family: 'Georgia', serif;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; text-align: center; padding: 20px;
    }
    h2 { color: #FFB612; font-size: 22px; margin-bottom: 12px; }
    p  { font-size: 14px; line-height: 1.7; }
    .spinner {
      width: 32px; height: 32px; border: 3px solid #1A3020;
      border-top-color: #FFB612; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin: 0 auto 20px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div>
    <div class="spinner"></div>
    <h2>Redirecting to secure payment...</h2>
    <p>You're being taken to PayFast — South Africa's trusted payment gateway.<br>Please do not close this window.</p>
  </div>
  <form id="pf" method="POST" action="${pfUrl}" style="display:none">
    ${inputs}
  </form>
  <script>document.getElementById('pf').submit();</script>
</body>
</html>`);
}
