// ── K53 Drill Master · Quiz Helpers ──────────────────────────────────────────
// Shuffle options and add distractors to make questions less predictable.

function shuffleArr(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Prepare an index-based question for display.
 * - Picks one random distractor from pool (wrong answers of other questions).
 * - Shuffles all options to randomise answer position.
 * - Updates `answer` index to match new position.
 *
 * @param {Object} q    - { options: string[], answer: number, ...rest }
 * @param {Array}  pool - other questions in the same session (for distractors)
 * @returns new question object with shuffled options and updated answer index
 */
export function prepareQuestion(q, pool = []) {
  const correctText = q.options[q.answer];
  const optionSet = new Set(q.options.map(o => o.trim().toLowerCase()));

  // Gather wrong-answer candidates from the pool
  const candidates = [];
  for (const pq of pool) {
    if (pq === q || pq.id === q.id) continue;
    for (let i = 0; i < (pq.options || []).length; i++) {
      if (i !== pq.answer) {
        const opt = pq.options[i];
        if (!optionSet.has(opt.trim().toLowerCase())) {
          candidates.push(opt);
        }
      }
    }
  }

  const opts = [...q.options];
  if (candidates.length > 0) {
    opts.push(candidates[Math.floor(Math.random() * candidates.length)]);
  }

  shuffleArr(opts);
  return { ...q, options: opts, answer: opts.indexOf(correctText) };
}

/**
 * Prepare all index-based questions in an array.
 * Each question gets a distractor from the others.
 */
export function prepareAll(questions) {
  return questions.map(q => prepareQuestion(q, questions));
}

/**
 * Prepare a string-based question (uses `correct` string property instead of index).
 * - Picks one random distractor from pool.
 * - Shuffles options.
 * - `correct` string property is unchanged (comparison still works).
 *
 * @param {Object} q    - { options: string[], correct: string, ...rest }
 * @param {Array}  pool - other string-based questions for distractors
 */
export function prepareQuestionStr(q, pool = []) {
  const optionSet = new Set(q.options.map(o => o.trim().toLowerCase()));

  const candidates = [];
  for (const pq of pool) {
    if (pq === q) continue;
    for (const opt of (pq.options || [])) {
      if (opt !== pq.correct && !optionSet.has(opt.trim().toLowerCase())) {
        candidates.push(opt);
      }
    }
  }

  const opts = [...q.options];
  if (candidates.length > 0) {
    opts.push(candidates[Math.floor(Math.random() * candidates.length)]);
  }

  shuffleArr(opts);
  return { ...q, options: opts };
}

/**
 * Prepare all string-based questions.
 */
export function prepareAllStr(questions) {
  return questions.map(q => prepareQuestionStr(q, questions));
}

/**
 * Generate a stable ID for spaced-repetition tracking.
 * Uses q.id if present; otherwise derives from question text.
 */
export function stableId(q, prefix = '') {
  if (q.id != null) return prefix + String(q.id);
  const raw = (q.q || q.question || q.text || '').slice(0, 60).replace(/\W+/g, '_').toLowerCase();
  return prefix + raw;
}
