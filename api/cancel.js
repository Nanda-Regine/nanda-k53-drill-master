// api/cancel.js — Vercel serverless function
//
// ⚠️⚠️ PAYMENTS — Paystack subscription CANCEL (K53 monthly). DO NOT REMOVE ⚠️⚠️
// A signed-in subscriber taps "Cancel subscription" in Settings. We:
//   1. Verify their Supabase access token server-side → get THEIR OWN email (never trust
//      a client-supplied email — that would let anyone cancel anyone).
//   2. Ask the Mirembe hub to disable the Paystack subscription for that email:
//        POST https://jarvis.mirembemuse.co.za/api/paystack/cancel
//        headers: x-hub-secret: HUB_INTERNAL_SECRET
//        body:    { email, app: 'k53drillmaster' }
//   3. The hub disables it on Paystack (source of truth). Paystack then fires
//      subscription.disable → hub → our /api/paystack-webhook, which flips the
//      subscriber row to status:'cancelled'. Access continues until expires_at
//      (Paystack "non-renewing"): cancel means "won't auto-renew", not "cut off now".

import { createClient } from '@supabase/supabase-js';

const HUB_URL = (process.env.PAYSTACK_HUB_URL || 'https://jarvis.mirembemuse.co.za').replace(/\/$/, '');

function adminClient() {
  return createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  if (!process.env.HUB_INTERNAL_SECRET) {
    return res.status(503).json({ error: 'Cancellation is temporarily unavailable.' });
  }

  // 1. Authenticate the caller by their Supabase token → their own email.
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Please sign in to manage your subscription.' });

  let email;
  try {
    const supabase = adminClient();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user?.email) return res.status(401).json({ error: 'Your session has expired — please sign in again.' });
    email = data.user.email.trim().toLowerCase();
  } catch (e) {
    console.error('[cancel] token verify failed:', e.message);
    return res.status(401).json({ error: 'Could not verify your session.' });
  }

  // 2. Ask the hub to disable this email's K53 subscription on Paystack.
  try {
    const r = await fetch(`${HUB_URL}/api/paystack/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-hub-secret': process.env.HUB_INTERNAL_SECRET },
      body: JSON.stringify({ email, app: 'k53drillmaster' }),
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      // 404 = no active subscription found for this account (already cancelled / never subscribed).
      const msg = r.status === 404
        ? "We couldn't find an active subscription for your account."
        : (body.error || 'Could not cancel right now. Please try again or email hello@creativelynanda.co.za.');
      return res.status(r.status === 404 ? 404 : 502).json({ error: msg });
    }
    // Success — Paystack marked it non-renewing; the webhook will set status:'cancelled'.
    console.log('[cancel] cancelled for', email);
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('[cancel] hub call failed:', e.message);
    return res.status(502).json({ error: 'Could not reach the billing service. Please try again shortly.' });
  }
}
