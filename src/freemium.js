// ── K53 Drill Master · Freemium Gate ─────────────────────────────────────────
// First 30 days from first visit: unlimited (free trial).
// After that: 10 questions/day for free users.

const STORAGE_KEY     = 'k53_usage';
const INSTALL_KEY     = 'k53_install_date';
export const DAILY_LIMIT     = 10;
export const FREE_TRIAL_DAYS = 30;

// ── Tier constants ─────────────────────────────────────────────────────────────
export const TIERS = {
  FREE:         'free',
  MONTHLY:      'monthly',
  BUNDLE:       'bundle',
  LIFETIME:     'lifetime',
  LIFETIME_PDP: 'lifetime_pdp',
  GROUP:        'group',
};

export const TIER_LABELS = {
  free:         'Free',
  monthly:      'Monthly',
  bundle:       '3-Month Bundle',
  lifetime:     'Lifetime',
  lifetime_pdp: 'Lifetime + PDP',
  group:        'Group',
};

// ── Install date ───────────────────────────────────────────────────────────────
function getInstallDate() {
  try {
    const stored = localStorage.getItem(INSTALL_KEY);
    if (stored) return new Date(stored);
    const now = new Date();
    localStorage.setItem(INSTALL_KEY, now.toISOString());
    return now;
  } catch { return new Date(); }
}

export function isInFreeTrial() {
  try {
    const install = getInstallDate();
    const daysSince = (Date.now() - install.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince < FREE_TRIAL_DAYS;
  } catch { return false; }
}

export function daysLeftInTrial() {
  try {
    const install = getInstallDate();
    const daysSince = (Date.now() - install.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(FREE_TRIAL_DAYS - daysSince));
  } catch { return 0; }
}

// ── Daily usage ────────────────────────────────────────────────────────────────
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getUsage() {
  try {
    const raw   = localStorage.getItem(STORAGE_KEY);
    const usage = raw ? JSON.parse(raw) : {};
    const today = todayKey();
    if (usage.date !== today) return { date: today, count: 0 };
    return usage;
  } catch { return { date: todayKey(), count: 0 }; }
}

function saveUsage(usage) {
  try {
    usage.date = todayKey();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  } catch {}
}

// ── Premium state ──────────────────────────────────────────────────────────────
export function isPremium() {
  try {
    if (localStorage.getItem('k53_premium') === 'true') {
      const expiry = localStorage.getItem('k53_premium_expiry');
      if (expiry) {
        if (new Date(expiry) > new Date()) return true;
        localStorage.removeItem('k53_premium');
        localStorage.removeItem('k53_premium_expiry');
        localStorage.removeItem('k53_premium_plan');
        return isInFreeTrial();
      }
      return true;
    }
    return isInFreeTrial();
  } catch { return false; }
}

export function hasPDPAccess() {
  try {
    const plan = localStorage.getItem('k53_premium_plan');
    return plan === 'lifetime_pdp' || plan === 'group' || isInFreeTrial();
  } catch { return false; }
}

export function getPremiumPlan() {
  try { return localStorage.getItem('k53_premium_plan') || null; } catch { return null; }
}

export function getPremiumExpiry() {
  try {
    const e = localStorage.getItem('k53_premium_expiry');
    return e ? new Date(e) : null;
  } catch { return null; }
}

export function storePremiumToken(plan, expiry) {
  try {
    localStorage.setItem('k53_premium', 'true');
    localStorage.setItem('k53_premium_plan', plan);
    if (expiry) {
      localStorage.setItem('k53_premium_expiry', expiry);
    } else if (plan === 'lifetime' || plan === 'lifetime_pdp' || plan === 'group') {
      const far = new Date();
      far.setFullYear(far.getFullYear() + 20);
      localStorage.setItem('k53_premium_expiry', far.toISOString());
    }
  } catch {}
}

// ── Tier helpers (used by new App.jsx) ─────────────────────────────────────────
export function getTier() {
  const plan = getPremiumPlan();
  if (plan && isPremium()) return plan;
  return TIERS.FREE;
}

export function getRemainingToday() {
  if (isPremium()) return Infinity;
  return Math.max(0, DAILY_LIMIT - getUsage().count);
}

export function activateTier(tier) {
  storePremiumToken(tier, null);
}

// ── Question counting ──────────────────────────────────────────────────────────
export function getDailyCount() {
  return getUsage().count;
}

export function getRemainingQuestions() {
  if (isPremium()) return Infinity;
  return Math.max(0, DAILY_LIMIT - getUsage().count);
}

export function incrementQuestionCount() {
  if (isPremium()) return true;
  const usage = getUsage();
  if (usage.count >= DAILY_LIMIT) return false;
  usage.count += 1;
  saveUsage(usage);
  return true;
}

export function isGateHit() {
  if (isPremium()) return false;
  return getUsage().count >= DAILY_LIMIT;
}
