// api/itn.js — Vercel serverless function
// PayFast Instant Transaction Notification (ITN) handler.
// PayFast POSTs here server-to-server when a payment completes.
// On COMPLETE: creates/finds the Supabase user and upserts their subscriber row,
// then sends them a magic link invitation email automatically.

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const PLAN_DAYS = { monthly: 30, bundle: 90 };

function adminClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function activateSubscriber(email, plan, paymentId) {
  const supabase = adminClient();
  const days = PLAN_DAYS[plan] || 30;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const siteUrl = process.env.SITE_URL || 'https://k53drillmaster.co.za';

  // Invite user by email — creates account if new, sends magic link either way.
  // The subscriber receives a "sign in to activate your account" email automatically.
  const { data, error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: siteUrl,
  });
  if (inviteErr) throw new Error(`Invite failed: ${inviteErr.message}`);

  const userId = data.user.id;

  // Upsert subscriber row (handles renewals / plan changes); store the PayFast id for audit.
  const { error: dbErr } = await supabase
    .from('subscribers')
    .upsert({ user_id: userId, email, plan, expires_at: expiresAt, payfast_payment_id: paymentId ?? null }, { onConflict: 'user_id' });
  if (dbErr) throw new Error(`DB upsert failed: ${dbErr.message}`);

  console.log(`[ITN] Activated: ${email} | plan=${plan} | expires=${expiresAt} | pf=${paymentId}`);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const data = req.body || {};

  // ── 1. Authenticate ───────────────────────────────────────────────────────
  // Mirembe hub forwards already-verified ITNs with x-hub-secret — trust those and
  // skip the local signature check. Only direct PayFast posts are re-verified.
  const fromHub =
    process.env.HUB_INTERNAL_SECRET &&
    req.headers['x-hub-secret'] === process.env.HUB_INTERNAL_SECRET;

  if (!fromHub) {
    const { signature, ...rest } = data;
    const isLive = process.env.PAYFAST_SANDBOX !== 'true';
    const str = Object.entries(rest)
      .filter(([, v]) => v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v).trim()).replace(/%20/g, '+')}`)
      .join('&');
    const withPass = isLive && process.env.PAYFAST_PASSPHRASE
      ? `${str}&passphrase=${encodeURIComponent(process.env.PAYFAST_PASSPHRASE.trim()).replace(/%20/g, '+')}`
      : str;
    const computed = crypto.createHash('md5').update(withPass).digest('hex');
    if (computed !== signature) {
      console.error('[ITN] Invalid signature.');
      return res.status(200).send('OK');
    }
  }

  // ── 2. Activate subscriber on COMPLETE ────────────────────────────────────
  const status = data.payment_status;
  const email  = data.email_address;
  const plan   = data.custom_str1 || 'monthly';
  // Store the m_payment_id — verify.js matches the unlock token's `ref` against it to
  // confirm a real, ITN-confirmed payment before ever granting premium.
  const mPaymentId = data.m_payment_id || null;

  if (status === 'COMPLETE') {
    try {
      await activateSubscriber(email, plan, mPaymentId);
    } catch (err) {
      // Log but still return 200 — PayFast retries on non-200, which we don't want
      console.error('[ITN] Activation error:', err.message);
    }
  } else {
    console.log(`[ITN] Payment ${status}: ${email}`);
  }

  // ── 3. Acknowledge to PayFast ─────────────────────────────────────────────
  res.status(200).send('OK');
}
