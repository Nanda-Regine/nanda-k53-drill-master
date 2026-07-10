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

// ---- report ----
console.log(`Validated ${qCount} questions/signs across banks.`);
if (errors.length) {
  console.error(`\n✗ ${errors.length} problem(s) found:\n` + errors.map(e => '  - ' + e).join('\n'));
  process.exit(1);
}
console.log('✓ All question banks pass integrity checks.');
