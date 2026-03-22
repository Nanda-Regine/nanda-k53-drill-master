# K53 Drill Master

> **The South African learner driver who prepares on this platform passes. The one who doesn't, gambles.**

[![Production](https://img.shields.io/badge/production-k53drillmaster.co.za-007A4D?style=flat-square)](https://k53drillmaster.co.za)
[![PWA](https://img.shields.io/badge/PWA-offline--ready-FFB612?style=flat-square)](https://k53drillmaster.co.za)
[![Stack](https://img.shields.io/badge/stack-React%2018%20%2B%20Vite%205-61DAFB?style=flat-square)](#tech-stack)
[![Languages](https://img.shields.io/badge/languages-EN%20%7C%20AF%20%7C%20isiXhosa-DE3831?style=flat-square)](#internationalisation)

---

## The Problem

South Africa's K53 learner's licence failure rate consistently exceeds **60%** at DLTC testing centres nationwide. The people failing aren't bad drivers — they're underprepared for the question formats, time pressure, and trap-phrasing the examiner uses.

The available alternatives:
- A R150 physical study booklet, out of print at most Checkers stores
- YouTube videos filmed on a feature phone, updated in 2019
- Government PDFs that don't load on MTN 3G
- A legacy quiz site with 40 questions, no timer, and a Flash-era UI

Every year, hundreds of thousands of South Africans pay R225 to sit a test they weren't adequately prepared for. They fail. They pay again. They fail again. For people on minimum wage, this is a material financial injury.

**K53 Drill Master is built to end that cycle.**

---

## The Solution

A mobile-first, offline-capable drill platform covering all K53 vehicle codes — built specifically for the device profiles, connectivity constraints, and languages of the South African learner driver.

- **600+ curated questions** verified against 2024 DLTC examiner guidelines
- **11 distinct game modes** engineered for different learning stages and codes
- **3 languages**: English, Afrikaans, isiXhosa (more coming)
- **Real sign images** extracted from the official SA Learner Driver Manual PDF
- **Spaced repetition** (SM-2 algorithm) to target weak spots
- **Full Mock Exam** conditions: 68Q, 45 minutes, 75% pass threshold — exactly the real thing
- **PWA offline support** — works without internet after first load
- **Freemium model** that converts without friction

---

## Feature Matrix

| Feature | Free | Premium |
|---------|------|---------|
| Gauntlet (Code 8, 90Q) | 10Q/day | Unlimited |
| Road Rules Gauntlet (75Q) | 10Q/day | Unlimited |
| Road Signs Quiz (172Q, real images) | 10Q/day | Unlimited |
| Pattern Trainer (3 modes) | 10Q/day | Unlimited |
| Vehicle Controls (30Q) | 10Q/day | Unlimited |
| Mock Exam (68Q, 45min) | ✗ | ✓ |
| Hybrid Gauntlet (100Q) | ✗ | ✓ |
| Weak Spots Review (SM-2) | ✓ | ✓ |
| Progress History + Heatmap | ✓ | ✓ |
| Vehicle Inspection Checklist | ✓ | ✓ |
| Test Day Prep Guide | ✓ | ✓ |
| AI Tutor (Explain This) | ✗ | ✓ |
| Code 1/2 Motorcycle Exam | 10Q/day | Unlimited |
| Code 10/14 Heavy Vehicle + PDP | 10Q/day | Unlimited |
| Offline (PWA) | ✓ | ✓ |
| Multi-language | ✓ | ✓ |

---

## Tech Stack

| Layer | Technology | Decision Rationale |
|-------|-----------|-------------------|
| **Framework** | React 18 | Concurrent rendering; `useTransition` for game state updates without UI blocking |
| **Build** | Vite 5 | Sub-second HMR; ES module-native; replaces CRA at industry level |
| **Animations** | Framer Motion 12 | `AnimatePresence` handles unmount animations that CSS transitions cannot |
| **Auth** | Supabase Magic Link | Zero password UX; zero support overhead; Supabase free tier covers current MAU |
| **Database** | Supabase PostgreSQL | RLS at DB level; `auth.uid()` policy — no application-layer trust required |
| **Payments** | PayFast | SA's dominant gateway; ZAR-native; 60%+ merchant share; no Stripe ZAR support |
| **AI** | OpenAI gpt-4o-mini | 60× cheaper than GPT-4o; sufficient for question explanations; ~R0.000054/call |
| **PWA** | vite-plugin-pwa | Workbox service worker; offline-first; installable on Android home screen |
| **Analytics** | Vercel Analytics | Zero-config; POPIA-compliant; no cookie consent required |
| **Hosting** | Vercel | Edge CDN; Git-based deploys; preview URLs per PR |
| **i18n** | Custom (no library) | Domain-specific K53 terminology; avoids 40KB library overhead |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                          │
│                                                                  │
│  App.jsx (State Machine)                                         │
│    ├── activeGame: null | "gauntlet" | "mockexam" | ...         │
│    ├── navTab: "home" | "checklist" | "weak" | "progress" | ... │
│    │                                                             │
│    ├── /src/games/          ← 11 self-contained game components  │
│    ├── /src/components/     ← Cross-cutting UI                   │
│    └── /src/utils/          ← Pure functions                     │
│          streakTracker.js   (localStorage k53_streak_v2)         │
│          progressHistory.js (localStorage k53_history_v1)        │
│          spacedRepetition.js (SM-2 algorithm, k53_sr_v1)         │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                     localStorage (Client State)                  │
│  k53_usage     → daily question counter (freemium gate)          │
│  k53_premium   → premium token + expiry                          │
│  k53_sr_v1     → SM-2 state per question                         │
│  k53_history_v1→ per-category daily snapshots                    │
│  k53_streak_v2 → daily streak data                               │
├─────────────────────────────────────────────────────────────────┤
│                         Supabase (Backend)                       │
│  auth.users         → magic link sessions                        │
│  public.subscribers → plan + expires_at (RLS protected)          │
│  Edge Functions     → PayFast ITN → activate subscriber          │
└─────────────────────────────────────────────────────────────────┘
```

### Routing Architecture

Intentionally routerless. `activeGame` is a state machine string — not a URL path. This is deliberate:

1. No URL = no accidental deep-link sharing to gated content
2. Android back button handled via `pushState` trick
3. Game components are fully self-contained; navigation is a concern of App.jsx only

### Code Splitting Strategy

```js
// vite.config.js — loads ~180KB on first paint, rest on demand
manualChunks(id) {
  if (id.includes('framer-motion')) return 'motion';
  if (['Gauntlet','MockExam','PatternTrainer'].some(g => id.includes(g))) return 'games-core';
  if (['PDPPrep','HeavyVehicle','Motorcycle'].some(g => id.includes(g))) return 'games-ext';
  if (id.includes('node_modules')) return 'vendor';
}
```

80% of users (Code 8 learners) never download `games-ext`. Motorcycle and heavy vehicle content loads only when explicitly navigated to.

---

## AI Architecture

The AI Tutor uses `gpt-4o-mini` to explain why a specific K53 answer is correct or incorrect.

```
User taps "Explain This" on a wrong answer
    ↓
AITutor.jsx assembles prompt:
  - Question text + all 5 options + correct answer + user's selection
    ↓
POST to OpenAI Chat Completions API
  model: gpt-4o-mini | max_tokens: 300
  system: "You are a South African K53 road safety instructor..."
    ↓
Streamed response displayed inline
```

**Cost model:** At R0.000054 per explanation, 10,000 AI Tutor uses/month = **R0.54/month** in API costs. Gated to premium — economically viable at any conversion rate above 0%.

---

## Spaced Repetition

Implements the **SM-2 algorithm** adapted for question-answer pairs. Questions answered incorrectly resurface every 24h. Questions answered correctly resurface on an exponentially increasing interval — up to 21 days for well-known material.

The Weak Spots tab surfaces only questions due for review — no manual configuration required.

---

## Road Signs Dataset

- **395 JPEG images** extracted from the official SA Learner Driver Manual PDF (2024 edition)
- Extraction: `pdfjs-dist` + paint operation counting to isolate sign images from page chrome
- **172 quiz questions** across 6 categories: regulatory, warning, guidance, information, temporary, road markings
- SVG fallback on image load failure — zero broken image states in production

---

## Internationalisation

| Language | Locale | Coverage | Notes |
|----------|--------|----------|-------|
| English | `en` | 100% | Default |
| Afrikaans | `af` | 100% | |
| isiXhosa | `xh` | 100% | Native speaker reviewed |

**isiXhosa was prioritised over isiZulu.** Eastern Cape has the highest concentration of underserved isiXhosa-speaking learner drivers and the lowest availability of digital learning tools — a deliberate equity decision.

---

## Freemium Model

```
Free: 10 questions/day (localStorage — no server round-trip)
    ↓ gate hit
FreemiumGate modal → PayFast checkout
    ↓ payment confirmed
PayFast ITN → Supabase Edge Function → subscribers table
    ↓ user signs in
Magic link → session → checkSubscription() → storePremiumToken()
    ↓
Unlimited access
```

Plans: **R29/month · R69/3-month · R149 lifetime**

The freemium gate is client-side localStorage. A technical user can bypass it. We'd rather lose that one user than add 80ms of latency to every answer click for the 99% who don't.

---

## Performance

| Metric | Score |
|--------|-------|
| Lighthouse Performance | 91 |
| Lighthouse SEO | 100 |
| Lighthouse PWA | 100 |
| Initial JS bundle (gzipped) | ~180KB |
| Time to Interactive (3G) | <3.2s |

Designed for: Tecno Camon 20, Chrome Mobile, MTN 3G.

---

## Local Development

```bash
git clone https://github.com/your-handle/k53-learners-prep
cd k53-learners-prep
npm install

# copy and fill in env vars
cp .env.example .env.local
# VITE_SUPABASE_URL=
# VITE_SUPABASE_ANON_KEY=
# VITE_OPENAI_API_KEY=       (optional — AI Tutor only)
# VITE_PAYFAST_MERCHANT_ID=  (optional — payments only)

npm run dev  # → http://localhost:5173
```

App runs fully functional without Supabase credentials. All game modes, question banks, and local state work without a backend.

---

## Deployment

```bash
npm run build   # output: dist/
npm run preview # local preview of production build
```

**Vercel (recommended):** Connect GitHub repo → build: `npm run build` → output: `dist` → add env vars → connect `k53drillmaster.co.za`.

---

## Supabase Setup

```sql
CREATE TABLE subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('monthly','bundle','lifetime','lifetime_pdp','group')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Users can only read their own row
CREATE POLICY "read_own" ON subscribers FOR SELECT USING (auth.uid() = user_id);

-- Only service_role (Edge Function) can insert
CREATE POLICY "service_insert" ON subscribers FOR INSERT WITH CHECK (auth.role() = 'service_role');
```

---

## Roadmap

### Q2 2026
- [ ] Next.js 14 landing page (App Router, Tailwind, Edge SSG)
- [ ] WhatsApp study group score sharing
- [ ] Code 3 (light delivery vehicle) question bank
- [ ] Instructor mode — shareable progress report

### Q3 2026
- [ ] React Native mobile app (iOS + Android)
- [ ] isiZulu + Mandarin language support
- [ ] Driving school B2B seat licensing

### Q4 2026
- [ ] Adaptive difficulty engine (ML-based)
- [ ] Video explanations for complex road signs
- [ ] DLTC test centre locator with slot availability

### 2027
- [ ] SADC expansion: Zimbabwe, Botswana, Namibia
- [ ] Government partnership for pre-DLTC digital training certificates

---

## About

Built by **Nandawula Kabali-Kagwa** — Creative Technologist & AI Engineer.

[creativelynanda.co.za](https://creativelynanda.co.za) · [hello@creativelynanda.co.za](mailto:hello@creativelynanda.co.za)

---

## Legal

POPIA-compliant privacy policy. Question content derived from publicly available DLTC study materials. Not affiliated with or endorsed by the Department of Transport.

MIT License.
