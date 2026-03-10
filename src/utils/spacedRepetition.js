// ── K53 Drill Master · Spaced Repetition (SM-2) ──────────────────────────────
// Implements a simplified SM-2 algorithm.
// Each question is tracked in localStorage with:
//   { questionId, interval, nextReview, easeFactor, repetitions }

const SR_KEY = "k53_sr_v1";

function load() {
  try {
    return JSON.parse(localStorage.getItem(SR_KEY) || "{}");
  } catch {
    return {};
  }
}

function save(data) {
  try {
    localStorage.setItem(SR_KEY, JSON.stringify(data));
  } catch {}
}

function todayStr() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function addDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Record the result of answering a question.
 * @param {string} questionId  - unique question identifier
 * @param {boolean} correct    - whether the user answered correctly
 */
export function recordAnswer(questionId, correct) {
  const data = load();
  const card = data[questionId] || {
    questionId,
    interval: 1,
    easeFactor: 2.5,
    repetitions: 0,
    nextReview: todayStr(),
  };

  if (correct) {
    // Quality score: 4 for correct (good), capped at 5
    const q = 4;
    if (card.repetitions === 0) {
      card.interval = 1;
    } else if (card.repetitions === 1) {
      card.interval = 6;
    } else {
      card.interval = Math.round(card.interval * card.easeFactor);
    }
    card.repetitions += 1;
    // Update ease factor
    card.easeFactor = Math.max(
      1.3,
      card.easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
    );
  } else {
    // Failed — reset repetitions, short interval
    card.repetitions = 0;
    card.interval = 1;
    card.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
  }

  card.nextReview = addDays(card.interval);
  data[questionId] = card;
  save(data);
  return card;
}

/**
 * Returns true if this question is due for review today.
 */
export function isDue(questionId) {
  const data = load();
  const card = data[questionId];
  if (!card) return true; // never seen — always show
  return card.nextReview <= todayStr();
}

/**
 * Returns all question IDs that are due for review today,
 * sorted by most overdue first.
 */
export function getDueIds() {
  const data = load();
  const today = todayStr();
  return Object.values(data)
    .filter((c) => c.nextReview <= today)
    .sort((a, b) => (a.nextReview < b.nextReview ? -1 : 1))
    .map((c) => c.questionId);
}

/**
 * Returns the card data for a specific question, or null if unseen.
 */
export function getCard(questionId) {
  return load()[questionId] || null;
}

/**
 * Returns all stored cards as an array.
 */
export function getAllCards() {
  return Object.values(load());
}

/**
 * Returns summary stats: total tracked, due today, mastered (interval ≥ 21 days).
 */
export function getStats() {
  const cards = getAllCards();
  const today = todayStr();
  return {
    total: cards.length,
    due: cards.filter((c) => c.nextReview <= today).length,
    mastered: cards.filter((c) => c.interval >= 21).length,
  };
}

/**
 * Clears all spaced repetition data.
 */
export function resetSR() {
  try {
    localStorage.removeItem(SR_KEY);
  } catch {}
}
