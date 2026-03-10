// ── K53 Drill Master · Freemium Gate ─────────────────────────────────────────
// Tracks daily question usage. Gate opens at 10 questions/day for free users.
// Premium users: set localStorage key "k53_premium" = "true"

const STORAGE_KEY = "k53_usage";
const DAILY_LIMIT = 10;

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
    return localStorage.getItem("k53_premium") === "true";
  } catch {
    return false;
  }
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

export { DAILY_LIMIT };
