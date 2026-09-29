#!/usr/bin/env node
/**
 * Question-bank integrity validator (regression guard).
 * Checks every quiz question across the game banks + the sign data for:
 *   - answer index in range of the options array
 *   - a `correct` string that actually matches one of the options
 *   - at least 2 options, and no duplicate options
 *   - sign entries: unique ids, resolvable image
 * Exits non-zero if any problem is found so it can gate the build / CI.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (rel) => import(pathToFileURL(path.join(ROOT, rel)).href);
const errors = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);

// ---- helper: pull the quoted strings out of an [ ... ] options literal ----
function parseOptions(arrLiteral) {
  const out = [];
  const re = /'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g;
  let m;
  while ((m = re.exec(arrLiteral)) !== null) out.push((m[1] ?? m[2] ?? m[3]));
  return out;
}
function checkOptions(where, opts) {
  if (opts.length < 2) { err(where, `only ${opts.length} option(s)`); return; }
  const seen = new Set();
  for (const o of opts) {
    const k = o.trim().toLowerCase();
    if (seen.has(k)) { err(where, `duplicate option "${o}"`); }
    seen.add(k);
  }
}

// ---- Part A: game .jsx banks (regex scan) ----
const gamesDir = path.join(ROOT, 'src/games');
let qCount = 0;
for (const file of fs.readdirSync(gamesDir).filter(f => /\.jsx$/.test(f))) {
  const text = fs.readFileSync(path.join(gamesDir, file), 'utf8');
  // Match the `options: [ ... ] ... answer: N` shape used by the MCQ banks.
  // (PatternTrainer & ScenarioDrill use a different `correct`-value shape whose
  // options are generated at runtime — those banks are covered by the doc audit.)
  const re = /options:\s*(\[(?:[^\[\]]|\[[^\]]*\])*\])[\s\S]{0,220}?answer:\s*(\d+)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    qCount++;
    const opts = parseOptions(m[1]);
    const line = text.slice(0, m.index).split('\n').length;
    const where = `${file}:${line}`;
    checkOptions(where, opts);
    const idx = Number(m[2]);
    if (idx < 0 || idx >= opts.length) err(where, `answer index ${idx} out of range (0..${opts.length - 1})`);
  }
}

// ---- Part B: sign data (importable) ----
const rs = await imp('src/data/roadSigns.js');
const { SIGN_IMAGES } = await imp('src/data/signImageManifest.js');
const signsDir = path.join(ROOT, 'public/signs');
const ids = new Set();
for (const s of rs.ROAD_SIGNS) {
  qCount++;
  const where = `roadSigns.js#${s.id}`;
  if (ids.has(s.id)) err(where, 'duplicate sign id');
  ids.add(s.id);
  if (Array.isArray(s.options)) checkOptions(where, s.options);
  if (s.img && !SIGN_IMAGES.has(s.img) && !fs.existsSync(path.join(signsDir, s.img))) {
    err(where, `image "${s.img}" missing (not in manifest or /public/signs)`);
  }
}

// ---- generated sign questions ----
const gen = await imp('src/data/signQuestions.js');
for (const q of gen.GENERATED_SIGN_QUESTIONS) {
  qCount++;
  const where = `signQuestions#${q.id}`;
  if (!Array.isArray(q.options)) { err(where, 'no options'); continue; }
  checkOptions(where, q.options);
  if (typeof q.answer === 'number' && (q.answer < 0 || q.answer >= q.options.length))
    err(where, `answer index ${q.answer} out of range`);
}

// ---- verified learner-test bank + adaptive drill bank ----
const ltb = await imp('src/data/learnerTestBank.js');
const seenIds = new Set();
for (const q of [...ltb.RULES, ...ltb.SIGNALS_MARKINGS, ...ltb.CONTROLS_LMV, ...ltb.CONTROLS_MC]) {
  qCount++;
  const where = `learnerTestBank#${q.id}`;
  if (seenIds.has(q.id)) err(where, 'duplicate id');
  seenIds.add(q.id);
  checkOptions(where, q.options);
  if (q.options.length !== 4) err(where, `expected 4 options, got ${q.options.length}`);
  if (q.answer !== 0) err(where, 'bank convention: correct option must be first (answer: 0)');
  if (!q.ref) err(where, 'missing source reference (ref)');
}
// Official format (DLTC §5.4): 28 signs/23, 28 rules/22, 8 controls/6 — and enough questions to fill it.
const fmt = Object.fromEntries(ltb.TEST_FORMAT.sections.map(s => [s.key, s]));
const expect = { signs: [28, 23], rules: [28, 22], controls: [8, 6] };
for (const [k, [count, pass]] of Object.entries(expect)) {
  if (fmt[k]?.count !== count || fmt[k]?.pass !== pass) err('TEST_FORMAT', `${k} must be ${pass}/${count} per DLTC §5.4`);
}
for (const code of ['lmv', 'mc']) {
  if (ltb.rulesFor(code).length < 28) err('learnerTestBank', `${code}: fewer than 28 rules questions`);
  if (ltb.controlsFor(code).length < 8) err('learnerTestBank', `${code}: fewer than 8 controls questions`);
}
const { NERVE_BANK } = await imp('src/data/drillBank.js');
for (const [nerve, items] of Object.entries(NERVE_BANK)) {
  if (items.length < 2) err(`drillBank.${nerve}`, 'needs at least 2 items for the daily diagnostic');
  for (const q of items) { if (!seenIds.has(q.id)) { qCount++; checkOptions(`drillBank#${q.id}`, q.options); } }
}

// ---- road markings ----
const { ROAD_MARKINGS } = await imp('src/data/roadMarkings.js');
const mIds = new Set();
for (const m of ROAD_MARKINGS) {
  qCount++;
  const where = `roadMarkings#${m.id}`;
  if (mIds.has(m.id)) err(where, 'duplicate id');
  mIds.add(m.id);
  if (!m.meaning || !m.action || !m.ref) err(where, 'meaning, action and ref are required');
  if (m.img && !fs.existsSync(path.join(signsDir, m.img))) err(where, `image "${m.img}" missing`);
}

// ---- `correct`-string banks (ScenarioDrill, PatternTrainer): correct must be one of the options ----
const reCorrect = /correct:\s*(['"`])((?:\\.|(?!\1).)*)\1\s*,\s*options:\s*(\[(?:[^\[\]]|\[[^\]]*\])*\])/g;
for (const file of ['ScenarioDrill.jsx', 'PatternTrainer.jsx']) {
  const text = fs.readFileSync(path.join(gamesDir, file), 'utf8');
  let m;
  while ((m = reCorrect.exec(text)) !== null) {
    qCount++;
    const where = `${file}:${text.slice(0, m.index).split('\n').length}`;
    const opts = parseOptions(m[3]);
    checkOptions(where, opts);
    if (!opts.includes(m[2].replace(/\\(.)/g, '$1'))) err(where, `correct answer "${m[2]}" is not among the options`);
  }
}

// ---- known foreign / invented rules must never come back ----
const BANNED = [
  [/yield to (the vehicle on )?(your|the) right[^.]{0,40}(simultaneous|same time)|(simultaneous|same time)[^.]{0,60}(vehicle on (your|the) right|yield to (your|the) right)/i, 'no SA "yield to the right" rule for simultaneous arrivals — first to stop goes first'],
  [/travel anti-?clockwise|go anti-?clockwise|enter anti-?clockwise/i, 'SA traffic circles run clockwise (SGN R137)'],
  [/zig-?zag/i, 'zig-zag markings are UK, not SA'],
  [/1\.6 ?mm[^"'\n]{0,40}(✓|correct)/i, 'SA minimum tread is 1 mm'],
  [/\b68 (questions|Q)\b|\b68Q\b/i, 'learner test is 64 questions (DLTC §5.4)'],
];
for (const dir of ['src/games', 'src/data', 'src/components']) {
  for (const file of fs.readdirSync(path.join(ROOT, dir)).filter(f => /\.(jsx?|mjs)$/.test(f))) {
    const text = fs.readFileSync(path.join(ROOT, dir, file), 'utf8');
    for (const [re, why] of BANNED) {
      const m = text.match(re);
      if (m) err(`${dir}/${file}:${text.slice(0, m.index).split('\n').length}`, `banned claim "${m[0].slice(0, 50)}" — ${why}`);
    }
  }
}

// ---- marketing pages: no fabricated ratings, testimonials or unsourced statistics ----
const PAGE_BANNED = [
  [/aggregateRating/, 'no self-declared star ratings in structured data (no verifiable reviews)'],
  [/testimonial-card|TESTIMONIALS\s*=/, 'no testimonials until real, verifiable reviews exist'],
  [/\b87%|pass first try|failure rate (is|exceeds)|pass rate is around/i, 'unsourced pass/failure-rate statistic'],
  [/\b68Q\b|\b68 questions\b|45-?min/i, 'learner test is 64 questions; no official time limit'],
];
const pages = ['index.html', ...fs.readdirSync(path.join(ROOT, 'public')).filter(f => f.endsWith('.html')).map(f => 'public/' + f), 'src/components/Landing.jsx', 'src/components/MentalHealthSupport.jsx'];
for (const p of pages) {
  const text = fs.readFileSync(path.join(ROOT, p), 'utf8');
  for (const [re, why] of PAGE_BANNED) {
    const m = text.match(re);
    if (m) err(`${p}:${text.slice(0, m.index).split('\n').length}`, `"${m[0]}" — ${why}`);
  }
}

// ---- report ----
console.log(`Validated ${qCount} questions/signs across banks.`);
if (errors.length) {
  console.error(`\n✗ ${errors.length} problem(s) found:\n` + errors.map(e => '  - ' + e).join('\n'));
  process.exit(1);
}
console.log('✓ All question banks pass integrity checks.');
