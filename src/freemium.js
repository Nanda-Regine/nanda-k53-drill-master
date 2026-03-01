// ── K53 Drill Master · Freemium Gate ─────────────────────────────────────────
// First 30 days from first visit are always free (unlimited).
// After that: 10 questions/day for free users.
// Premium users: set localStorage key "k53_premium" = "true"

const STORAGE_KEY = "k53_usage";
const INSTALL_KEY = "k53_install_date";
const DAILY_LIMIT = 10;
const FREE_TRIAL_DAYS = 30;

function getInstallDate() {
  try {
    const stored = localStorage.getItem(INSTALL_KEY);
    if (stored) return new Date(stored);
    const now = new Date();
    localStorage.setItem(INSTALL_KEY, now.toISOString());
    return now;
  } catch {
    return new Date();
  }
}

export function isInFreeTrial() {
  try {
    const install = getInstallDate();
    const daysSince = (Date.now() - install.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince < FREE_TRIAL_DAYS;
  } catch {
    return false;
  }
}

export function daysLeftInTrial() {
  try {
    const install = getInstallDate();
    const daysSince = (Date.now() - install.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(FREE_TRIAL_DAYS - daysSince));
  } catch {
    return 0;
  }
}

function getUsage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const usage = raw ? JSON.parse(raw) : {};
    const today = new Date().toDateString();
    if (usage.date !== today) {
      return { date: today, count: 0 };
    }
    return usage;
  } catch {
    return { date: new Date().toDateString(), count: 0 };
  }
}

function saveUsage(usage) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  } catch {}
}

export function isPremium() {
  try {
    if (localStorage.getItem("k53_premium") === "true") {
      // Check expiry if set (paid subscriptions have an expiry date)
      const expiry = localStorage.getItem("k53_premium_expiry");
      if (expiry) {
        if (new Date(expiry) > new Date()) return true;
        // Expired — clean up and fall through
        localStorage.removeItem("k53_premium");
        localStorage.removeItem("k53_premium_expiry");
        localStorage.removeItem("k53_premium_plan");
        return isInFreeTrial();
      }
      return true; // Manually unlocked (no expiry)
    }
    return isInFreeTrial();
  } catch {
    return false;
  }
}

export function getPremiumPlan() {
  try {
    return localStorage.getItem("k53_premium_plan") || null;
  } catch {
    return null;
  }
}

export function getPremiumExpiry() {
  try {
    const e = localStorage.getItem("k53_premium_expiry");
    return e ? new Date(e) : null;
  } catch {
    return null;
  }
}

export function storePremiumToken(plan, expiry) {
  try {
    localStorage.setItem("k53_premium", "true");
    localStorage.setItem("k53_premium_plan", plan);
    localStorage.setItem("k53_premium_expiry", expiry);
  } catch {}
}

export function getDailyCount() {
  return getUsage().count;
}

export function getRemainingQuestions() {
  if (isPremium()) return Infinity;
  return Math.max(0, DAILY_LIMIT - getUsage().count);
}

export function incrementQuestionCount() {
  if (isPremium()) return true; // always allowed
  const usage = getUsage();
  if (usage.count >= DAILY_LIMIT) return false; // gate hit
  usage.count += 1;
  saveUsage(usage);
  return true;
}

export function isGateHit() {
  if (isPremium()) return false;
  return getUsage().count >= DAILY_LIMIT;
}

export { DAILY_LIMIT, FREE_TRIAL_DAYS };
