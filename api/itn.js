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
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// Exported (with an injectable client) so tests/itn.test.mjs can exercise it.
export async function activateSubscriber(email, plan, paymentId, supabase = adminClient(), now = Date.now()) {
  const days = PLAN_DAYS[plan] || 30;
  const siteUrl = process.env.SITE_URL || 'https://k53drillmaster.co.za';

  // Returning buyer: Supabase refuses to invite an email that already has an account, so
  // inviting first meant a repeat PayFast payment never extended anything. Find them first.
  const { data: existing } = await supabase
    .from('subscribers').select('user_id, expires_at').eq('email', email).maybeSingle();

  let userId = existing && existing.user_id;
  if (!userId) {
    // New buyer: invite creates the account and sends the "sign in to activate" email.
    const { data, error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(email, { redirectTo: siteUrl });
    if (!inviteErr && data && data.user) {
      userId = data.user.id;
    } else {
      // Account exists but has no subscriber row (signed up free, or a past failed activation):
      // a magic link resolves the existing user without creating a duplicate.
      const { data: link, error: linkErr } = await supabase.auth.admin.generateLink({
        type: 'magiclink', email, options: { redirectTo: siteUrl },
      });
      if (linkErr || !link || !link.user) {
        throw new Error(`Invite failed: ${(inviteErr && inviteErr.message) || (linkErr && linkErr.message) || 'no user'}`);
      }
      userId = link.user.id;
    }
  }

  // Paying again while still active adds the days on top of the time they already have.
  const current = existing && existing.expires_at ? Date.parse(existing.expires_at) : 0;
  const base = current > now ? current : now;
  const expiresAt = new Date(base + days * 24 * 60 * 60 * 1000).toISOString();

  // Upsert subscriber row (handles renewals / plan changes); store the PayFast id for audit.
  const { error: dbErr } = await supabase
    .from('subscribers')
    .upsert({ user_id: userId, email, plan, status: 'active', expires_at: expiresAt, payfast_payment_id: paymentId ?? null }, { onConflict: 'user_id' });
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
