// api/verify.js — Vercel serverless function
// Validates the signed unlock token from api/checkout.js AND confirms a real,
// ITN-confirmed payment exists before granting premium. The token alone proves the
// plan was selected at checkout (pre-payment) — it MUST NOT grant access on its own.
// Security: a subscriber row is only written by api/itn.js after PayFast confirms the
// payment (server-to-server, via the Mirembe hub), so requiring it closes the
// "return_url token = free premium" hole.

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  return createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const token = req.query && req.query.token;
  if (!token) return res.status(400).json({ valid: false, error: 'Missing token' });

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return res.json({ valid: false, error: 'Malformed token' });

    const [payload, sig] = parts;

    const expected = crypto
      .createHmac('sha256', process.env.PAYFAST_PASSPHRASE)
      .update(payload)
      .digest('base64url');
    if (expected !== sig) return res.json({ valid: false, error: 'Invalid signature' });

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));

    if (!data.expiry || new Date(data.expiry) <= new Date()) {
      return res.json({ valid: false, error: 'Token expired' });
    }

    // ── Require a real payment ────────────────────────────────────────────────
    // The token carries the m_payment_id as `ref`. api/itn.js stores that same id on
    // the subscriber row ONLY after PayFast confirms payment. No matching row → no grant.
    const ref = data.ref;
    if (!ref) {
      // Legacy token without a ref → cannot be confirmed → never grant.
      return res.json({ valid: false, error: 'Unconfirmable token' });
    }

    const supabase = adminClient();
    const { data: sub } = await supabase
      .from('subscribers')
      .select('plan, expires_at, status')
      .eq('payfast_payment_id', ref)
      .maybeSingle();

    if (!sub || sub.status !== 'active') {
      // Payment not confirmed yet (ITN may still be in flight) — tell the client to retry.
      return res.json({ valid: false, pending: true, error: 'Payment not yet confirmed' });
    }

    return res.json({ ok: true, plan: sub.plan, expires_at: sub.expires_at });
  } catch {
    return res.json({ valid: false, error: 'Parse error' });
  }
}
