/**
 * K53 Nervous System — Mastery Store
 *
 * Pure JS data layer. Zero React dependencies.
 * EXPO MIGRATION: Replace `_store` with an AsyncStorage adapter.
 * All reads/writes are synchronous here; swap to async/await when migrating.
 */

// ── Storage adapter ────────────────────────────────────────────────────────────
// EXPO: replace this block with AsyncStorage equivalents
const _store = {
  get: (key, fallback = null) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set: (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
  },
};

const KEYS = {
  mastery: 'k53_nerve_mastery_v1',
  xp:      'k53_xp_v1',
  streak:  'k53_daily_streak_v2',
};

// ── Nerve definitions ──────────────────────────────────────────────────────────
// Angles position nodes on the hexagon: top = -90°, going clockwise every 60°
export const NERVES = [
  { id: 'signs',     label: 'Road Signs',      short: 'SIGNS',  color: '#DE3831', angle: -90 },
  { id: 'rules',     label: 'Road Rules',      short: 'RULES',  color: '#FFB612', angle: -30 },
  { id: 'controls',  label: 'Vehicle Controls', short: 'CTRLS', color: '#007A4D', angle:  30 },
  { id: 'scenarios', label: 'Scenarios',        short: 'SCENE', color: '#4472CA', angle:  90 },
  { id: 'markings',  label: 'Markings',         short: 'MARKS', color: '#6c47ff', angle: 150 },
  { id: 'practical', label: 'Practical Test',   short: 'PRAC',  color: '#FF6B35', angle: 210 },
];

// Maps each game ID to the nerve it trains
export const GAME_NERVE = {
  gauntlet:   'controls',
  hybrid:     'rules',
  patterns:   'rules',
  road_rules: 'rules',
  mockexam:   'practical',
  controls:   'controls',
  pdp:        'practical',
  motorcycle: 'controls',
  heavy:      'controls',
  moto_exam:  'practical',
  roadsigns:  'signs',
  sign_shape: 'signs',
  road_marks: 'markings',
  scenario:   'scenarios',
};

// ── Level ladder ───────────────────────────────────────────────────────────────
export const LEVELS = [
  { level: 1, name: 'Learner',          badge: '🟤', minXP: 0     },
  { level: 2, name: 'Student Driver',   badge: '🔵', minXP: 300   },
  { level: 3, name: 'L-Plate Ready',    badge: '🟡', minXP: 900   },
  { level: 4, name: 'Road Tested',      badge: '🟠', minXP: 2500  },
  { level: 5, name: 'Qualified Driver', badge: '🟢', minXP: 6000  },
  { level: 6, name: 'Traffic Officer',  badge: '🏆', minXP: 15000 },
];

// ── Internal helpers ───────────────────────────────────────────────────────────
function _resolveLevel(xp) {
  let lvl = LEVELS[0];
  for (const l of LEVELS) { if (xp >= l.minXP) lvl = l; }
  return lvl;
}

function _addXP(amount) {
  const prev = _store.get(KEYS.xp, 0);
  const next = prev + amount;
  _store.set(KEYS.xp, next);
  return { xpGained: amount, newXP: next, leveledUp: _resolveLevel(next).level > _resolveLevel(prev).level, newLevel: _resolveLevel(next) };
}

function _touchStreak() {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const s = _store.get(KEYS.streak, { count: 0, lastDate: null });
  if (s.lastDate === today) return s;
  s.count = s.lastDate === yesterday ? s.count + 1 : 1;
  s.lastDate = today;
  _store.set(KEYS.streak, s);
  return s;
}

// ── Public API ─────────────────────────────────────────────────────────────────

/** Record one answer from any game. Returns XP result. */
export function recordAnswer(nerveId, conceptId, correct) {
  const mastery = _store.get(KEYS.mastery, {});
  const key = `${nerveId}.${conceptId}`;
  const e = mastery[key] || { correct: 0, total: 0, lastSeen: 0, streak: 0 };

  e.total   += 1;
  e.lastSeen = Date.now();
  e.streak   = correct ? (e.streak || 0) + 1 : 0;
  if (correct) e.correct += 1;
  mastery[key] = e;
  _store.set(KEYS.mastery, mastery);

  // XP: 10 base + combo bonus (caps at +20), or 2 for a miss
  const combo  = correct && e.streak > 2 ? Math.min((e.streak - 2) * 3, 20) : 0;
  const xpGain = correct ? 10 + combo : 2;
  const result = _addXP(xpGain);
  _touchStreak();

  return { xpGain: result.xpGained, newXP: result.newXP, leveledUp: result.leveledUp, newLevel: result.newLevel, answerStreak: e.streak };
}

/** Convenience wrapper for games that know their game ID. */
export function recordGameAnswer(gameId, questionIndex, correct) {
  const nerveId = GAME_NERVE[gameId] || 'rules';
  return recordAnswer(nerveId, `${gameId}-q${questionIndex}`, correct);
}

/** Returns current XP and level info. */
export function getLevel() {
  const xp  = _store.get(KEYS.xp, 0);
  const lvl = _resolveLevel(xp);
  const idx  = LEVELS.indexOf(lvl);
  const next = LEVELS[idx + 1] || null;
  const progress = next ? (xp - lvl.minXP) / (next.minXP - lvl.minXP) : 1;
  return { ...lvl, xp, nextLevel: next, progress: Math.min(progress, 1), xpToNext: next ? next.minXP - xp : 0 };
}

/** Returns mastery data for all 6 nerves, enriched with health state. */
export function getNerveMastery() {
  const mastery = _store.get(KEYS.mastery, {});
  const now     = Date.now();
  const DECAY   = 3 * 24 * 60 * 60 * 1000; // 3 days
  const FRESH   =     24 * 60 * 60 * 1000; // 1 day

  return NERVES.map(nerve => {
    const entries = Object.entries(mastery)
      .filter(([k]) => k.startsWith(nerve.id + '.'))
      .map(([, v]) => v);

    if (!entries.length) return { ...nerve, score: 0, answered: 0, decaying: false, fresh: false };

    const totalCorrect  = entries.reduce((s, e) => s + e.correct, 0);
    const totalAnswered = entries.reduce((s, e) => s + e.total, 0);
    const lastSeen      = Math.max(...entries.map(e => e.lastSeen));
    const score         = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    return {
      ...nerve,
      score,
      answered: totalAnswered,
      decaying: lastSeen > 0 && (now - lastSeen) > DECAY,
      fresh:    lastSeen > 0 && (now - lastSeen) < FRESH,
    };
  });
}

/** Overall nervous system health (0–100). */
export function getSystemHealth() {
  const nerves   = getNerveMastery();
  const trained  = nerves.filter(n => n.answered > 0);
  if (!trained.length) return { health: 0, status: 'dormant', trained: 0 };
  const avgScore = trained.reduce((s, n) => s + n.score, 0) / trained.length;
  const coverage = (trained.length / NERVES.length) * 100;
  const health   = Math.round(avgScore * 0.65 + coverage * 0.35);
  const status   = health >= 75 ? 'strong' : health >= 45 ? 'active' : health >= 15 ? 'weak' : 'critical';
  return { health, status, trained: trained.length, avgScore: Math.round(avgScore) };
}

/** Returns the N weakest trained nerves (for daily pulse). */
export function getWeakNerves(count = 2) {
  return getNerveMastery()
    .filter(n => n.answered > 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, count);
}

/** Current daily streak. Returns 0 if broken. */
export function getDailyStreak() {
  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const s = _store.get(KEYS.streak, { count: 0, lastDate: null });
  if (s.lastDate !== today && s.lastDate !== yesterday) return 0;
  return s.count;
}
