// api/health.js — Vercel serverless function
// Lightweight DB ping used by JarvisOS keep-alive cron.
// Returns 200 {"ok":true} on success, 503 {"ok":false} on failure.
import { createClient } from '@supabase/supabase-js';

function adminClient() {
  return createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export default async function handler(req, res) {
  const ts = new Date().toISOString();

  try {
    const { error } = await adminClient()
      .from('subscribers')
      .select('id')
      .limit(1);

    if (error) throw error;

    return res.status(200).json({ ok: true, ts });
  } catch (err) {
    console.error('[k53/health] DB check failed:', err?.message ?? err);
    return res.status(503).json({ ok: false, ts, error: 'db_error' });
  }
}
