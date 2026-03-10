// ── K53 Drill Master · Progress History ──────────────────────────────────────
// Records a daily snapshot of questions answered and accuracy.
// Used by the ProgressHistory screen to draw a score-over-time graph.

const HISTORY_KEY = 'k53_history_v1';
const MAX_DAYS    = 60; // keep up to 60 days of history

function todayStr() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function load() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}

function save(entries) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(entries)); } catch {}
}

/**
 * Record a question result for today.
 * @param {boolean} correct
 * @param {string}  category  e.g. 'road_rules', 'controls', 'signs'
 */
export function recordResult(correct, category = 'general') {
  const today = todayStr();
  const entries = load();
  const idx = entries.findIndex(e => e.date === today);

  if (idx >= 0) {
    entries[idx].total    += 1;
    entries[idx].correct  += correct ? 1 : 0;
    if (!entries[idx].byCategory) entries[idx].byCategory = {};
    if (!entries[idx].byCategory[category]) entries[idx].byCategory[category] = { total: 0, correct: 0 };
    entries[idx].byCategory[category].total   += 1;
    entries[idx].byCategory[category].correct += correct ? 1 : 0;
  } else {
    const newEntry = {
      date: today,
      total: 1,
      correct: correct ? 1 : 0,
      byCategory: { [category]: { total: 1, correct: correct ? 1 : 0 } },
    };
    entries.push(newEntry);
  }

  // Trim to MAX_DAYS most recent
  const trimmed = entries.sort((a, b) => a.date.localeCompare(b.date)).slice(-MAX_DAYS);
  save(trimmed);
}

/**
 * Return all history entries sorted oldest → newest.
 * Each entry: { date, total, correct, byCategory }
 */
export function getHistory() {
  return load().sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Aggregate accuracy per category across all history.
 * Returns: [{ category, total, correct, pct }] sorted by pct asc (weakest first).
 */
export function getCategoryStats() {
  const entries = load();
  const map = {};
  for (const entry of entries) {
    const bc = entry.byCategory || {};
    for (const [cat, data] of Object.entries(bc)) {
      if (!map[cat]) map[cat] = { total: 0, correct: 0 };
      map[cat].total   += data.total;
      map[cat].correct += data.correct;
    }
  }
  return Object.entries(map)
    .map(([category, { total, correct }]) => ({
      category,
      total,
      correct,
      pct: total > 0 ? Math.round((correct / total) * 100) : 0,
    }))
    .sort((a, b) => a.pct - b.pct); // weakest first
}

/**
 * Overall lifetime stats.
 */
export function getLifetimeStats() {
  const entries = load();
  const total   = entries.reduce((s, e) => s + e.total, 0);
  const correct = entries.reduce((s, e) => s + e.correct, 0);
  return { total, correct, pct: total > 0 ? Math.round((correct / total) * 100) : 0, days: entries.length };
}

export function resetHistory() {
  try { localStorage.removeItem(HISTORY_KEY); } catch {}
}
