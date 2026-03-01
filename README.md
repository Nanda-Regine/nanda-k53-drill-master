# K53 Drill Master

**South Africa's most accessible learner's licence prep platform.**
Built for township learners, rural communities, and anyone who can't afford to fail twice.

> _"A driving licence is a job offer. We make sure everyone gets to say yes."_

---

## The Problem

Over **1.2 million South Africans** sit for the DLTC learner's licence test each year. The failure rate exceeds **50%**. The reasons are well documented: no affordable study material, no structured practice, and a test format that rewards pattern recognition — not just general knowledge.

Existing solutions are either expensive, cluttered with ads, outdated, or built for a market that already has data and device access. **K53 Drill Master** was built specifically for those that existing EdTech ignores.

---

## What It Does

A progressive web app that turns the official South African DLTC learner's test manuals into five structured drill modes, a mock exam, AI-powered explanations, and a progress dashboard — all accessible on a budget Android phone for **R29/month**, with 10 free questions every day, forever.

| Mode | Description | Questions |
|---|---|---|
| **Code 8 Gauntlet** | 9 rounds covering every K53 category | 90 |
| **Hybrid Gauntlet** | Curated "trick" questions that fail real candidates | 100 |
| **Know Your Numbers** | Pattern-first drilling of all K53 numeric values | 41 + speed mode |
| **Road Rules Gauntlet** | Organised by vehicle code (C1, C3, C10, C14) | 120 |
| **Mock Exam** | 68 questions, 45-min timer, 75% pass mark — DLTC format | 68 |
| **Progress Dashboard** | Streak tracking, accuracy by category, weak-area detection | — |

---

## Tech Stack

```
Frontend         React 18 + Vite 5
Auth             Supabase (magic-link, no passwords)
Database         Supabase Postgres (RLS-enforced subscriber table)
Payments         PayFast (SA's #1 gateway — card, EFT, SnapScan)
AI Tutor         OpenAI gpt-4o-mini (cached, premium-gated)
Analytics        Vercel Analytics
Hosting          Vercel (serverless functions for payment + claim flow)
Styling          Inline React styles — zero CSS framework dependency
Font             Georgia serif + Courier New mono
Colour           South African flag palette (#007A4D, #FFB612, #DE3831)
```

No React Router. No Redux. No UI library. The entire app is intentionally lean so it loads fast on a 3G connection.

---

## Architecture

```
k53-app/
├── api/                        ← Vercel serverless functions
│   ├── checkout.js             ← PayFast signature + redirect
│   ├── notify.js               ← PayFast ITN webhook → Supabase upsert
│   ├── verify.js               ← Token validation after payment return
│   └── claim.js                ← Creates Supabase user + sends magic link
├── public/
│   └── pricing.html            ← Static pricing page (no JS bundle needed)
└── src/
    ├── main.jsx                ← ReactDOM.createRoot entry
    ├── App.jsx                 ← Route state machine (activeGame) + auth listener
    ├── supabase.js             ← Defensive Supabase client (null-safe)
    ├── freemium.js             ← Daily limit logic (localStorage, midnight reset)
    ├── theme.js                ← SA colour palette + typography tokens
    ├── components/
    │   ├── AuthModal.jsx       ← Magic link sign-in + payment claim flow
    │   └── FreemiumGate.jsx    ← Upgrade modal (shown at daily limit)
    └── games/
        ├── Gauntlet.jsx
        ├── HybridGauntlet.jsx
        ├── PatternTrainer.jsx
        ├── RoadRulesGauntlet.jsx
        ├── MockExam.jsx
        └── Progress.jsx
```

### Navigation pattern

App-level state machine — no router library:

```js
const [activeGame, setActiveGame] = useState(null);
// null → home screen
// "gauntlet" | "hybrid" | "patterns" | "roadrules" | "mockexam" | "progress"
```

Each game receives a single `onBack` prop. Internal screens (rounds, results) manage their own local state.

### Auth & subscription flow

```
User pays via PayFast
    → PayFast ITN fires → /api/notify → upsert subscribers table
    → User redirected to /?unlock=TOKEN
    → /api/verify validates token → storePremiumToken() in localStorage
    → AuthModal opens → user enters email
    → /api/claim → creates Supabase auth user → sends magic link
    → User clicks link → onAuthStateChange fires → checkSubscription()
    → Supabase RLS: SELECT WHERE auth.uid() = user_id AND expires_at > NOW()
    → Premium unlocked
```

### Freemium logic

```js
// freemium.js
const DAILY_LIMIT = 10;
// Stored in localStorage as { date: "YYYY-MM-DD", count: N }
// Resets automatically at midnight
// isPremium() checks localStorage token + expiry
// isInFreeTrial() checks account age < 30 days
```

---

## Social Impact

South Africa has a **youth unemployment rate above 45%**. A driver's licence is a direct gateway to formal employment — courier work, taxi driving, delivery services, logistics. The DLTC test is the gatekeeping step.

**K53 Drill Master is priced for the people who need it most:**

| Plan | Price | Who it's for |
|---|---|---|
| Free | R0 forever | Township learner with prepaid data |
| Monthly | R29/month | Student or gig worker on monthly budget |
| 3-Month Bundle | R69 once-off | Dedicated studier — less than a bus week |

R29 is less than a loaf of bread and two litres of milk. The 3-month bundle at R69 is designed specifically for rural learners who may have to travel far to write and need more study time.

**Every question is sourced from the official DLTC manuals** — the same documents the test is drawn from. No guesswork. No third-party summaries.

---

## Question Data

All questions are derived from two official South African Traffic Department publications:

- **Rules of the Road** — K53 road behaviour, speed limits, right of way, licences, vehicle requirements
- **Manual on Road Traffic Signs** — sign recognition, codes, colours, shapes, meanings

Questions are hand-curated and categorised by:
- Vehicle code (Code 1/2 motorcycle, Code 3 LMV, Code 8, Code 10/14 heavy)
- Topic area (lights, speed, alcohol, accidents, signals, road markings, etc.)
- Difficulty pattern (direct recall vs. numeric trap vs. hybrid scenario)

---

## AI Tutor

When a user answers incorrectly, an **Explain This** button appears. The AI Tutor (OpenAI `gpt-4o-mini`) returns a 2–3 sentence explanation referencing the specific K53 rule — in plain South African English. Responses are cached per question to minimise API cost.

```
User answers wrong
    → "Explain This" button appears
    → POST to OpenAI with question + correct answer + K53 context
    → Response cached in memory for session
    → Shown inline, no modal
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- A PayFast merchant account (for payments)
- An OpenAI API key (for AI Tutor)
- Vercel account (for serverless functions)

### Local development

```bash
git clone https://github.com/Nanda-Regine/nanda-k53-drill-master.git
cd nanda-k53-drill-master
npm install
cp .env.example .env
# Fill in your keys
npm run dev
```

### Environment variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENAI_API_KEY=sk-...

# Server-side (Vercel functions only — not prefixed with VITE_)
SUPABASE_SERVICE_KEY=your-service-role-key
PAYFAST_MERCHANT_ID=your-merchant-id
PAYFAST_MERCHANT_KEY=your-merchant-key
PAYFAST_PASSPHRASE=your-passphrase
UNLOCK_SECRET=your-token-signing-secret
```

### Build & deploy

```bash
npm run build      # outputs to dist/
vercel --prod      # or push to main → Vercel auto-deploys
```

---

## Database Schema

```sql
-- Supabase Postgres

create table subscribers (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  plan        text not null,              -- 'monthly' | 'bundle'
  expires_at  timestamptz not null,
  created_at  timestamptz default now()
);

-- Row-level security: users can only read their own row
alter table subscribers enable row level security;
create policy "own row" on subscribers
  for select using (auth.uid() = user_id);
```

---

## Roadmap

- [ ] Afrikaans language toggle (all questions + UI)
- [ ] Zulu and Sesotho question variants
- [ ] Offline-first PWA with service worker caching
- [ ] Road sign image recognition practice
- [ ] WhatsApp study bot (daily question push)
- [ ] Community leaderboard by province

---

## Built by

**Nandawula Kabali-Kagwa**
Creative Technologist · AI Engineer
[creativelynanda.co.za](https://creativelynanda.co.za) · [WhatsApp](https://wa.me/27842916742)

> This project is a proof that you don't need a team, a budget, or a Silicon Valley zip code to build something that matters to millions of people.

---

## License

MIT — fork it, adapt it, translate it. Just don't charge R49 for something that should be R29.
