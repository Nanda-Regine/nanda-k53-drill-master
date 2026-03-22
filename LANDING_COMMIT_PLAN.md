# Landing Page — Next.js 14 Rebuild: Commit Plan

> This document maps every commit you should make when building the Next.js 14 landing page.
> Follow this order exactly for clean GitHub contribution history.
> Each commit = one logical unit of work. No mega-commits. No WIP commits.

---

## Setup Phase

### Commit 1
```
chore: scaffold Next.js 14 App Router project with Tailwind
```
**What to do:**
```bash
npx create-next-app@14 k53-landing --typescript --tailwind --app --src-dir
cd k53-landing
```
**Files changed:** Everything from create-next-app scaffold.

---

### Commit 2
```
chore: configure SA brand design tokens in Tailwind
```
**What to add in `tailwind.config.ts`:**
```js
colors: {
  green:   '#007A4D',
  gold:    '#FFB612',
  red:     '#DE3831',
  blue:    '#4472CA',
  bg:      '#060D07',
  surface: '#0D1F10',
  border:  '#1A3020',
  text:    '#E8EDE0',
  dim:     '#6B7A62',
},
fontFamily: {
  serif: ['Georgia', 'serif'],
  mono:  ['Courier New', 'monospace'],
},
```
**Files changed:** `tailwind.config.ts`, `src/app/globals.css`

---

### Commit 3
```
chore: add SA flag stripe component and global layout shell
```
**What to do:**
- Create `src/components/FlagStripe.tsx` — 6-colour bar
- Update `src/app/layout.tsx` with metadata, OG tags, JSON-LD
- Add favicon references

**Files changed:** `layout.tsx`, `globals.css`, `FlagStripe.tsx`

---

### Commit 4
```
chore: install framer-motion and configure Next.js image domains
```
```bash
npm install framer-motion
```
**Files changed:** `package.json`, `next.config.ts`

---

## Hero Section

### Commit 5
```
feat: build animated hero section with headline and CTA
```
**What to build:**
- Full-screen hero: `min-h-screen`
- Headline: "Stop Failing. Start Drilling."
- Subtext: "600+ DLTC questions. Real sign images. 3 languages."
- Two CTAs: "Start Practising Free" (primary, green) + "See Pricing" (ghost)
- Background: dark with subtle SA flag gradient bleed bottom-left

**Files changed:** `src/app/page.tsx`, `src/components/Hero.tsx`

---

### Commit 6
```
feat: add animated pass-rate counter with intersection observer
```
**What to build:**
- Counter that animates from 0 → 91% when scrolled into view
- Stat: "91% of users who complete 3 Mock Exams pass first try"
- Uses `useEffect` + `requestAnimationFrame` for smooth count
- Three supporting stats: 600+ questions, 11 modes, 3 languages

**Files changed:** `src/components/StatCounter.tsx`, updated `Hero.tsx`

---

### Commit 7
```
feat: add hero mock-UI card with animated quiz preview
```
**What to build:**
- Right-side card showing a Road Signs question
- Animated: correct answer highlight after 1.5s delay, then progress bar tick
- Loops to show the "drill" feeling
- CSS: `rounded-2xl bg-surface border border-border shadow-2xl`

**Files changed:** `src/components/HeroCard.tsx`, updated `Hero.tsx`

---

## How It Works

### Commit 8
```
feat: add how-it-works 3-step section with icons and copy
```
**What to build:**
```
Step 1: Pick Your Code       Step 2: Drill Daily         Step 3: Walk In Confident
Code 1/2, 8, 10/14           10 free questions            Real exam conditions
                              Weak spots surface           68Q, 45min timer
```
- Numbered steps with animated entrance (stagger on scroll)
- Icon SVGs for each step
- Mobile: stacked. Desktop: 3-column grid.

**Files changed:** `src/components/HowItWorks.tsx`, updated `page.tsx`

---

## Social Proof

### Commit 9
```
feat: add social proof strip with key metrics
```
**What to build:**
- Horizontal scrolling metric strip (mobile) / 4-column grid (desktop)
- Stats: "600+ Questions", "172 Road Signs", "3 Languages", "Offline PWA"
- Each with icon + label + value
- Background: slightly lighter surface, border top/bottom

**Files changed:** `src/components/MetricsStrip.tsx`, updated `page.tsx`

---

### Commit 10
```
feat: add testimonials carousel with SA-specific copy
```
**What to build:**
- 3 testimonial cards (create realistic placeholder copy in SA voice)
- Auto-rotate every 4s with Framer Motion `AnimatePresence`
- Mobile: single card. Desktop: show 2.

**Files changed:** `src/components/Testimonials.tsx`, updated `page.tsx`

---

## Pricing

### Commit 11
```
feat: add pricing tiers section with freemium + premium cards
```
**What to build:**
```
[Free]          [Monthly – R29]     [3-Month – R69]★    [Lifetime – R149]
10Q/day         Unlimited           Unlimited             Unlimited + PDP
No account      All modes           All modes             All codes forever
                AI Tutor            AI Tutor              Group licence
```
- "★ Most Popular" badge on 3-Month (gold, slightly larger)
- CTA: "Get Started" → links to main app
- R prices in ZAR, no USD
- Notes: "Processed by PayFast — South Africa's #1 payment gateway"

**Files changed:** `src/components/Pricing.tsx`, updated `page.tsx`

---

### Commit 12
```
feat: add pricing FAQ accordion
```
**What to build:**
- 5 questions (see below)
- Smooth open/close with Framer Motion height animation
- Mobile-first, full width

**FAQ questions:**
1. What's included in the free tier?
2. Do I need to create an account to use it?
3. How does the monthly plan work?
4. Is my payment secure?
5. Can I use it on my phone without internet?

**Files changed:** `src/components/PricingFAQ.tsx`, updated `page.tsx`

---

## CTA + Footer

### Commit 13
```
feat: add final CTA section with urgency framing
```
**What to build:**
- Full-width dark section: "Your test is booked. Are you ready?"
- Primary CTA: "Start Practising Free — No account needed"
- Secondary: "R29/month after free limit"
- Background: green-tinted with SA flag stripe top

**Files changed:** `src/components/FinalCTA.tsx`, updated `page.tsx`

---

### Commit 14
```
feat: add footer with nav links and legal
```
**What to build:**
- Logo + tagline left
- Links: Privacy Policy, Terms, Disclaimer
- "Built by Nandawula Kabali-Kagwa" + creativelynanda.co.za
- SA Flag stripe at very bottom

**Files changed:** `src/components/LandingFooter.tsx`, updated `page.tsx`

---

## SEO + Performance

### Commit 15
```
feat: add full SEO metadata, OG tags, and JSON-LD schema
```
**What to add in `layout.tsx`:**
```tsx
export const metadata: Metadata = {
  title: 'K53 Drill Master — SA Learner Driver Practice',
  description: 'Pass your K53 learner\'s licence test. 600+ DLTC questions, real road sign images, mock exam. Free to start. R29/month.',
  openGraph: {
    title: 'K53 Drill Master',
    description: 'South Africa\'s best K53 learner driver practice app.',
    url: 'https://k53drillmaster.co.za',
    siteName: 'K53 Drill Master',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'en_ZA',
    type: 'website',
  },
  // + twitter, robots, canonical
};
```
**Files changed:** `layout.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`

---

### Commit 16
```
perf: optimise images and add next/font for Georgia fallback
```
**What to do:**
- Convert OG image from SVG to PNG via sharp
- Wrap all `<img>` in `next/image` with `sizes` prop
- Add `next/font/google` for any Google Font (or self-host Inter as fallback)

**Files changed:** `layout.tsx`, all component files with images

---

### Commit 17
```
perf: add scroll-triggered animations with IntersectionObserver
```
**What to do:**
- Create `src/hooks/useInView.ts` wrapper around IntersectionObserver
- Apply `motion.div` fade-up on: HowItWorks steps, Pricing cards, Testimonials
- Stagger delay: 0.1s per item

**Files changed:** `src/hooks/useInView.ts`, multiple components

---

### Commit 18
```
fix: mobile layout — hero CTA stack, pricing horizontal scroll
```
**What to fix:**
- Hero buttons stack vertically below `sm:`
- Pricing cards: horizontal scroll on mobile (`overflow-x-auto snap-x`)
- HowItWorks: single column on mobile
- Test at 360px and 390px viewport width

**Files changed:** All components — Tailwind responsive classes

---

### Commit 19
```
chore: add Vercel Analytics and SpeedInsights
```
```bash
npm install @vercel/analytics @vercel/speed-insights
```
**Files changed:** `layout.tsx`

---

### Commit 20
```
feat: add nav header with smooth scroll and mobile hamburger
```
**What to build:**
- Sticky header: logo left + nav links right + "Start Free" CTA
- Mobile: hamburger → slide-down menu with Framer Motion
- Scroll-spy: highlight active section
- Transparent → opaque on scroll

**Files changed:** `src/components/Nav.tsx`, `layout.tsx`

---

### Commit 21
```
chore: production build audit — lighthouse, a11y, bundle analysis
```
**What to do:**
```bash
npm run build && npm run start
# Run Lighthouse in Chrome DevTools
# Target: Performance 90+, SEO 100, A11y 95+
```
Fix any issues found. Document scores in commit message.

**Files changed:** Any components needing fixes

---

### Commit 22
```
chore: deploy landing page to Vercel and connect k53drillmaster.co.za
```
**What to do:**
- `git push` → Vercel auto-deploys
- Connect custom domain in Vercel dashboard
- Submit sitemap to Google Search Console

---

## Commit Count Summary

| Phase | Commits |
|-------|---------|
| Setup | 4 |
| Hero | 3 |
| How It Works | 1 |
| Social Proof | 2 |
| Pricing | 2 |
| CTA + Footer | 2 |
| SEO + Performance | 6 |
| Nav | 1 |
| Audit + Deploy | 2 |
| **Total** | **22** |

22 commits across ~7 days = solid, believable contribution cadence.
Space them out: 3–4 per day. Push in the morning and evening to populate both time slots on your GitHub graph.
