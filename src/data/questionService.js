import { ROAD_SIGNS } from './roadSigns.js';
import { ROAD_MARKINGS } from './roadMarkings.js';

export const QUESTION_SCHEMA_VERSION = 1;

const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE_QUESTIONS === 'true';

// ── Local data sources ─────────────────────────────────────────────────────────
function _fromLocal(type) {
  switch (type) {
    case 'signs':    return ROAD_SIGNS;
    case 'markings': return ROAD_MARKINGS;
    default:         return [];
  }
}

// ── Supabase data source (Phase B: enable via VITE_USE_SUPABASE_QUESTIONS=true) ─
async function _fromSupabase(type) {
  const { supabase } = await import('../supabase.js');
  if (!supabase) return _fromLocal(type);
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('type', type)
      .is('deleted_at', null);
    if (error) throw error;
    return data?.length ? data : _fromLocal(type);
  } catch {
    // Network failure or DB unavailable — fall back to local data silently
    return _fromLocal(type);
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Fetch questions by type. Returns local JS data until VITE_USE_SUPABASE_QUESTIONS=true.
 * Games call this instead of importing data files directly — zero game changes when we
 * flip to Supabase in Phase B.
 *
 * @param {'signs'|'markings'|'rules'|'controls'|'scenarios'} type
 */
export async function getQuestions(type) {
  if (USE_SUPABASE) return _fromSupabase(type);
  return Promise.resolve(_fromLocal(type));
}

/**
 * Record an answer for spaced repetition. No-op until Phase B wires Supabase.
 * Leitner box: correct → box+1 (max 5), wrong → box 1.
 */
export async function recordAnswer(questionId, correct, userId) {
  if (!USE_SUPABASE || !userId || !questionId) return;
  const { supabase } = await import('../supabase.js');
  if (!supabase) return;
  try {
    const { data: existing } = await supabase
      .from('user_progress')
      .select('box_level')
      .eq('user_id', userId)
      .eq('question_id', questionId)
      .maybeSingle();

    const box = existing?.box_level ?? 1;
    await supabase.from('user_progress').upsert(
      {
        user_id:     userId,
        question_id: questionId,
        correct,
        answered_at: new Date().toISOString(),
        box_level:   correct ? Math.min(box + 1, 5) : 1,
      },
      { onConflict: 'user_id,question_id' }
    );
  } catch {}
}

/**
 * Returns the raw mastery object from localStorage (masteryStore format).
 * Phase B: this will query user_progress table instead.
 */
export function getLocalProgress() {
  try {
    const raw = localStorage.getItem('k53_nerve_mastery_v1');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Returns true if local data has been seeded to Supabase (Phase B seed script sets this).
 */
export function checkSchemaVersion() {
  return parseInt(localStorage.getItem('k53_schema_v') ?? '0', 10) >= QUESTION_SCHEMA_VERSION;
}
