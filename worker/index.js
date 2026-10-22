// K53 DrillMaster on Cloudflare Workers.
// Static SPA from Workers Static Assets (wrangler.jsonc `assets`), plus the 7 payment/API
// handlers in /api, run UNCHANGED through a small Vercel-compatible req/res adapter, so the
// PayFast + Paystack logic that is live today is byte-for-byte the same code.
import cancel from '../api/cancel.js';
import checkout from '../api/checkout.js';
import claim from '../api/claim.js';
import health from '../api/health.js';
import itn from '../api/itn.js';
import paystackWebhook from '../api/paystack-webhook.js';
import verify from '../api/verify.js';

const ROUTES = {
  '/api/cancel': cancel,
  '/api/checkout': checkout,
  '/api/claim': claim,
  '/api/health': health,
  '/api/itn': itn,
  '/api/paystack-webhook': paystackWebhook,
  '/api/verify': verify,
};

// Parse the body the way Vercel does. URLSearchParams keeps field order, which the
// PayFast ITN signature depends on.
async function parseBody(request) {
  if (request.method === 'GET' || request.method === 'HEAD') return undefined;
  const type = (request.headers.get('content-type') || '').toLowerCase();
  const text = await request.text();
  if (!text) return undefined;
  if (type.includes('application/json')) {
    try { return JSON.parse(text); } catch { return text; }
  }
  if (type.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(text));
  }
  return text;
}

async function runVercelHandler(handler, request, url) {
  const headers = {};
  request.headers.forEach((v, k) => { headers[k] = v; });
  const req = {
    method: request.method,
    url: url.pathname + url.search,
    headers,
    query: Object.fromEntries(url.searchParams),
    body: await parseBody(request),
  };

  let status = 200;
  let body = null;
  const out = new Headers();
  let done;
  const finished = new Promise((r) => { done = r; });
  const res = {
    statusCode: 200,
    status(code) { status = code; this.statusCode = code; return this; },
    setHeader(k, v) { out.set(k, String(v)); return this; },
    getHeader(k) { return out.get(k); },
    writeHead(code, hdrs = {}) { status = code; for (const [k, v] of Object.entries(hdrs)) out.set(k, String(v)); return this; },
    json(obj) { if (!out.has('content-type')) out.set('content-type', 'application/json'); body = JSON.stringify(obj); done(); return this; },
    send(data) {
      if (typeof data === 'object' && data !== null && !(data instanceof Uint8Array)) return this.json(data);
      body = data ?? ''; done(); return this;
    },
    end(data) { if (data !== undefined) body = data; done(); return this; },
    redirect(a, b) { const [code, loc] = typeof a === 'number' ? [a, b] : [302, a]; status = code; out.set('location', loc); done(); return this; },
  };

  // Handlers either return after responding, or respond and keep going; wait for whichever is first.
  await Promise.race([Promise.resolve(handler(req, res)).then(() => done()), finished]);
  return new Response(body, { status, headers: out });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Canonical host is www (as on Vercel). Apex -> www keeps links + SEO intact.
    if (url.hostname === 'k53drillmaster.co.za') {
      url.hostname = 'www.k53drillmaster.co.za';
      return Response.redirect(url.toString(), 308);
    }

    // Jarvis engineering feedback (was a Vercel rewrite)
    if (url.pathname === '/api/engineering/feedback') {
      const target = new URL('https://jarvis.mirembemuse.co.za/api/engineering/feedback' + url.search);
      return fetch(new Request(target, request));
    }

    const handler = ROUTES[url.pathname.replace(/\/$/, '')];
    if (handler) {
      try {
        return await runVercelHandler(handler, request, url);
      } catch (err) {
        console.error('[k53-worker]', url.pathname, err && err.message);
        return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers: { 'content-type': 'application/json' } });
      }
    }
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'content-type': 'application/json' } });
    }

    // Everything else: the SPA (assets.not_found_handling = single-page-application)
    return env.ASSETS.fetch(request);
  },
};
