// api/paystack-webhook.js — Vercel serverless function
//
// ⚠️⚠️ PAYMENTS — Paystack subscription receiver (K53 monthly). DO NOT REMOVE ⚠️⚠️
// The Mirembe hub (jarvis.mirembemuse.co.za) forwards verified Paystack events here,
// authenticated with x-hub-secret == HUB_INTERNAL_SECRET. K53 is email-based, so we
// activate/extend the subscriber by the Paystack customer email. Initial charge arrives
// as subscription.create; renewals arrive as charge.success.

import { createClient } from '@supabase/supabase-js';

function adminClient() {
  return createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  if (!process.env.HUB_INTERNAL_SECRET || req.headers['x-hub-secret'] !== process.env.HUB_INTERNAL_SECRET) {
    return res.status(403).send('Forbidden');
  }

  const evt = req.body || {};
  const data = evt.data || {};
  const email = data.customer && data.customer.email;

  try {
    if ((evt.event === 'charge.success' || evt.event === 'subscription.create') && email) {
      const supabase = adminClient();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const siteUrl = process.env.SITE_URL || 'https://k53drillmaster.co.za';

      // Existing subscriber → extend; new → invite (magic link) + create.
      const { data: existing } = await supabase.from('subscribers').select('user_id').eq('email', email).maybeSingle();
      if (existing) {
        await supabase.from('subscribers').update({ plan: 'monthly', status: 'active', expires_at: expiresAt, payfast_payment_id: data.reference || null }).eq('user_id', existing.user_id);
      } else {
        const { data: inv, error } = await supabase.auth.admin.inviteUserByEmail(email, { redirectTo: siteUrl });
        if (!error && inv && inv.user) {
          await supabase.from('subscribers').upsert({ user_id: inv.user.id, email, plan: 'monthly', status: 'active', expires_at: expiresAt, payfast_payment_id: data.reference || null }, { onConflict: 'user_id' });
        }
      }
      console.log('[paystack] activated', email);
    } else if ((evt.event === 'subscription.disable' || evt.event === 'subscription.not_renew') && email) {
      const supabase = adminClient();
      await supabase.from('subscribers').update({ status: 'cancelled' }).eq('email', email);
    }
  } catch (e) {
    console.error('[paystack] activation error:', e.message);
  }

  res.status(200).send('OK');
}
