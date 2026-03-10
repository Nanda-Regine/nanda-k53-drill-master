// ── K53 Drill Master · Streak Tracker ────────────────────────────────────────
// Tracks daily study streaks in localStorage.
// A streak increments once per calendar day when the user answers a question.

const STREAK_KEY = "k53_streak_v2";

function getTodayStr() {
  return new Date().toDateString();
}

function getYesterdayStr() {
  return new Date(Date.now() - 86_400_000).toDateString();
}

function loadStreak() {
  try {
    return JSON.parse(localStorage.getItem(STREAK_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveStreak(data) {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  } catch {}
}

/**
 * Call once when the user answers any question.
 * Returns the current streak count after the update.
 */
export function recordStudyDay() {
  const today = getTodayStr();
  const yesterday = getYesterdayStr();
  const data = loadStreak();

  if (data.lastDay === today) {
    // Already counted today — return current count
    return data.count || 1;
  }

  if (data.lastDay === yesterday) {
    // Consecutive day — increment streak
    data.count = (data.count || 1) + 1;
  } else {
    // Streak broken (or first ever) — reset to 1
    data.count = 1;
  }

  data.lastDay = today;
  saveStreak(data);
  return data.count;
}

/**
 * Returns the current streak count.
 * Returns 0 if there has been no activity today or yesterday
 * (i.e. the streak is dead).
 */
export function getStreak() {
  const today = getTodayStr();
  const yesterday = getYesterdayStr();
  const data = loadStreak();

  if (data.lastDay === today || data.lastDay === yesterday) {
    return data.count || 0;
  }
  return 0; // streak broken
}

/**
 * Returns the raw streak data object { count, lastDay }.
 */
export function getStreakData() {
  return loadStreak();
}

/**
 * Resets the streak entirely (e.g. from a debug/reset button).
 */
export function resetStreak() {
  try {
    localStorage.removeItem(STREAK_KEY);
  } catch {}
}
