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

  // ── 2. Invite user + upsert subscriber row ────────────────────────────────
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const plan = tokenData.plan || 'monthly';
  const days = PLAN_DAYS[plan] || 30;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const siteUrl = process.env.SITE_URL || 'https://nanda-k53-drill-master.vercel.app';

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
      { user_id: invite.user.id, email: invite.user.email, plan, expires_at: expiresAt },
      { onConflict: 'user_id' }
    );
  if (dbErr) {
    console.error('[CLAIM] DB error:', dbErr.message);
    return res.json({ ok: false, error: dbErr.message });
  }

  console.log(`[CLAIM] Activated: ${email} | plan=${plan} | expires=${expiresAt}`);
  return res.json({ ok: true });
}
