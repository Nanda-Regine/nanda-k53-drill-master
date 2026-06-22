/**
 * K53 Drill Master — Question Seed Script
 *
 * Usage:
 *   node scripts/seed-questions.mjs
 *
 * Requires env vars (copy from .env.local):
 *   SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_SERVICE_KEY=eyJ...   (service_role key — NOT the anon key)
 *
 * Run this AFTER applying the migrations (migration 001).
 * Safe to re-run: uses upsert on external_id.
 *
 * Sets localStorage key 'k53_schema_v' = 1 in the app via a marker row
 * in the questions table (see checkSchemaVersion() in questionService.js).
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load env ──────────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = join(__dirname, '..', '.env.local');
  try {
    const raw = readFileSync(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        // Don't overwrite vars already set by CI/shell environment
        if (!process.env[key]) {
          process.env[key] = match[2].trim().replace(/^['"]|['"]$/g, '');
        }
      }
    }
  } catch {
    // .env.local not present — expect env vars to be set externally
  }
}
loadEnv();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env vars');
  console.error('   Set SUPABASE_SERVICE_KEY to the service_role key (not the anon key)');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

// ── Data transforms ───────────────────────────────────────────────────────────

/**
 * Transform a roadSigns.js entry → questions row.
 * In roadSigns.js, options[0] is always the correct answer.
 */
function signToRow(s) {
  if (!Array.isArray(s.options) || s.options.length === 0) {
    throw new Error(`Sign ${s.id || s.name} has no options array — fix roadSigns.js before seeding`);
  }
  return {
    external_id:    s.id,
    type:           'signs',
    code:           s.code || null,
    sign_code:      s.code || null,
    category:       s.category || null,
    question_text:  `What does the ${s.name} sign (${s.code || s.id}) mean?`,
    options:        s.options,
    correct_answer: s.options[0],
    img:            s.img || null,
    hint:           s.hint || null,
    explanation:    s.meaning || null,
    mnemonic:       s.mnemonic || null,
    difficulty:     2,
    licence_codes:  ['code12', 'code8', 'code10', 'code14'],
    is_active:      true,
    schema_ver:     1,
  };
}

/**
 * Transform a roadMarkings.js entry → questions row.
 * In roadMarkings.js, options[0] is always the correct answer.
 */
function markingToRow(m) {
  if (!Array.isArray(m.options) || m.options.length === 0) {
    throw new Error(`Marking ${m.id || m.name} has no options array — fix roadMarkings.js before seeding`);
  }
  return {
    external_id:    m.id,
    type:           'markings',
    code:           m.code || null,
    category:       m.category || null,
    question_text:  `What does the ${m.name} road marking mean?`,
    options:        m.options,
    correct_answer: m.options[0],
    img:            m.img || null,
    hint:           m.hint || null,
    explanation:    m.meaning || null,
    difficulty:     2,
    licence_codes:  ['code12', 'code8', 'code10', 'code14'],
    is_active:      true,
    schema_ver:     1,
  };
}

/**
 * Transform a VehicleControls/RoadRules inline question → questions row.
 * These use options[answer] (0-indexed) as correct; we normalise to options[0].
 */
function inlineToRow(q, type, codeSuffix = 'vc') {
  const correct = q.options[q.answer];
  const rotated = [correct, ...q.options.filter((_, i) => i !== q.answer)];
  return {
    external_id:    q.id || `${codeSuffix}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    code:           null,
    category:       q.cat || null,
    question_text:  q.q,
    options:        rotated,
    correct_answer: correct,
    img:            null,
    hint:           null,
    explanation:    null,
    difficulty:     2,
    licence_codes:  ['code8'],
    is_active:      true,
    schema_ver:     1,
  };
}

// ── Load data files (pure ESM, no React/JSX) ──────────────────────────────────
async function loadData() {
  const dataDir = join(__dirname, '..', 'src', 'data');

  const { ROAD_SIGNS }    = await import(join(dataDir, 'roadSigns.js'));
  const { ROAD_MARKINGS } = await import(join(dataDir, 'roadMarkings.js'));

  const signs    = ROAD_SIGNS.map(signToRow);
  const markings = ROAD_MARKINGS.map(markingToRow);

  return { signs, markings };
}

// ── Seed ──────────────────────────────────────────────────────────────────────
async function upsertBatch(rows, label) {
  const BATCH = 50;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await sb.from('questions').upsert(batch, { onConflict: 'external_id' });
    if (error) {
      console.error(`❌  ${label} batch ${i}–${i + batch.length}:`, error.message);
      throw error;
    }
    inserted += batch.length;
    process.stdout.write(`\r   ${label}: ${inserted}/${rows.length}`);
  }
  console.log(`  ✓  ${label}: ${inserted} rows`);
}

async function main() {
  console.log('\n🌱  K53 Drill Master — seeding questions to Supabase\n');
  console.log(`   Target: ${SUPABASE_URL}`);

  const { signs, markings } = await loadData();
  console.log(`\n   Loaded: ${signs.length} signs, ${markings.length} markings`);
  console.log('   Note: vehicle controls & road rules live in game files.');
  console.log('         Extract them to src/data/ in a follow-up task to seed here.\n');

  await upsertBatch(signs,    'Road signs   ');
  await upsertBatch(markings, 'Road markings');

  // Mark schema version so app knows Supabase is seeded
  const { error: verErr } = await sb.from('questions').upsert({
    external_id:    '__schema_version__',
    type:           'signs',
    question_text:  'Schema version marker — do not delete',
    options:        ['1'],
    correct_answer: '1',
    is_active:      false,
    schema_ver:     1,
  }, { onConflict: 'external_id' });
  if (verErr) console.warn('   ⚠️  Could not write schema version marker:', verErr.message);
  else        console.log('   ✓  Schema version marker written (v1)');

  console.log('\n✅  Seed complete. Set VITE_USE_SUPABASE_QUESTIONS=true to enable.\n');
}

main().catch(err => { console.error('\n❌  Seed failed:', err.message); process.exit(1); });
