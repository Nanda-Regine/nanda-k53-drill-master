// api/claim.js — Vercel serverless function
// Called after a successful PayFast payment when the user enters their email
// to claim their subscription. Validates the signed payment token, creates
// their Supabase account (if new), upserts their subscriber row, and sends
// the magic link invite email — all in one step.

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const PLAN_DAYS = { monthly: 30, bundle: 90 };

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { email, claimToken } = req.body || {};
  if (!email || !claimToken) {
    return res.status(400).json({ ok: false, error: 'Missing email or claimToken' });
  }

  // ── 1. Validate HMAC on the payment token ─────────────────────────────────
  const parts = claimToken.split('.');
  if (parts.length !== 2) {
    return res.json({ ok: false, error: 'Malformed token' });
  }

  const [payload, sig] = parts;
  const expected = crypto
    .createHmac('sha256', process.env.PAYFAST_PASSPHRASE)
    .update(payload)
    .digest('base64url');

  if (expected !== sig) {
    return res.json({ ok: false, error: 'Invalid token' });
  }

  let tokenData;
  try {
    tokenData = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
  } catch {
    return res.json({ ok: false, error: 'Parse error' });
  }

  if (!tokenData.expiry || new Date(tokenData.expiry) <= new Date()) {
    return res.json({ ok: false, error: 'Token expired' });
  }

  // ── 2. Require an ITN-confirmed payment for this token's ref ───────────────
  // A subscriber row with this m_payment_id is written ONLY by api/itn.js after
  // PayFast confirms the payment server-to-server. No confirmed payment → no
  // activation (closes the "valid token = free premium" hole).
  const supabase = createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const ref = tokenData.ref;
  if (!ref) return res.json({ ok: false, error: 'Unconfirmable token' });

  const { data: paid } = await supabase
    .from('subscribers')
    .select('plan, expires_at, status')
    .eq('payfast_payment_id', ref)
    .maybeSingle();
  if (!paid || paid.status !== 'active') {
    return res.json({ ok: false, pending: true, error: 'Payment not yet confirmed' });
  }

  // ── 3. Invite the user + activate with the CONFIRMED plan/expiry ───────────
  const siteUrl = process.env.SITE_URL || 'https://k53drillmaster.co.za';
  const { data: invite, error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(
    email.trim().toLowerCase(),
    { redirectTo: siteUrl }
  );
  if (inviteErr) {
    console.error('[CLAIM] Invite error:', inviteErr.message);
    return res.json({ ok: false, error: inviteErr.message });
  }

  const { error: dbErr } = await supabase
    .from('subscribers')
    .upsert(
      { user_id: invite.user.id, email: invite.user.email, plan: paid.plan, expires_at: paid.expires_at, payfast_payment_id: ref, status: 'active' },
      { onConflict: 'user_id' }
    );
  if (dbErr) {
    console.error('[CLAIM] DB error:', dbErr.message);
    return res.json({ ok: false, error: dbErr.message });
  }

  console.log(`[CLAIM] Activated: ${email} | plan=${paid.plan} | ref=${ref}`);
  return res.json({ ok: true });
}
