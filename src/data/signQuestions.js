// Sign question generator.
// Turns the ROAD_SIGNS dataset into a large, varied question bank in the same
// shape the Road Signs quiz already consumes: { id, category, img, question,
// options[], answer, explanation }. Only signs whose image actually exists on
// disk (SIGN_IMAGES manifest) are used, so every generated question renders a
// real, clear sign — broken-image signs are skipped automatically.
//
// Four testing methods per sign:
//   1. Identify the sign        (image -> name)
//   2. Meaning                  (image -> meaning)
//   3. Required action          (image -> "what must you do?")
//   4. Classification           (image -> sign type)
import { ROAD_SIGNS } from './roadSigns.js';
import { SIGN_IMAGES } from './signImageManifest.js';

// roadSigns categories -> quiz category ids
const CAT_MAP = {
  Control: 'control', Command: 'command', Prohibition: 'prohibition',
  Warning: 'warning', Reservation: 'reservation', Guidance: 'guidance',
  Temporary: 'temporary', Marking: 'markings', Markings: 'markings',
  'De-restriction': 'derestriction',
};

const CAT_LABEL = {
  control:      'Regulatory — Control',
  command:      'Regulatory — Command',
  prohibition:  'Regulatory — Prohibition',
  reservation:  'Regulatory — Reservation',
  derestriction:'Regulatory — De-restriction',
  warning:      'Warning',
  guidance:     'Guidance / Direction',
  temporary:    'Temporary',
  markings:     'Road marking',
};

// Deterministic PRNG so the bank is stable between builds (no hydration churn).
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function strSeed(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function shuffleSeeded(arr, seed) {
  const r = mulberry32(seed); const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function distractors(pool, field, correct, n, seed) {
  const seen = new Set([correct]); const out = [];
  for (const v of shuffleSeeded(pool.map(s => s[field]).filter(Boolean), seed)) {
    if (!seen.has(v)) { seen.add(v); out.push(v); if (out.length >= n) break; }
  }
  return out;
}
function options(correct, ds, seed) {
  const opts = shuffleSeeded([correct, ...ds], seed);
  return { options: opts, answer: opts.indexOf(correct) };
}

export function generateSignQuestions() {
  const signs = ROAD_SIGNS.filter(s => s.img && SIGN_IMAGES.has(s.img) && s.meaning);
  const out = [];

  for (const s of signs) {
    const cat = CAT_MAP[s.category] || 'warning';
    const sameCat = signs.filter(o => o.category === s.category && o.id !== s.id);
    const pool = sameCat.length >= 3 ? sameCat : signs.filter(o => o.id !== s.id);
    const seed = strSeed(s.id);

    // 1 — identify the sign (prefer confusable signs as distractors)
    const confNames = (s.confusableWith || [])
      .map(id => ROAD_SIGNS.find(x => x.id === id))
      .filter(x => x && SIGN_IMAGES.has(x.img) && x.name !== s.name)
      .map(x => x.name);
    let nd = [...new Set(confNames)].slice(0, 3);
    if (nd.length < 3) nd = nd.concat(distractors(pool.filter(o => !nd.includes(o.name)), 'name', s.name, 3 - nd.length, seed + 1));
    if (new Set([s.name, ...nd]).size === 4) {
      const { options: o, answer } = options(s.name, nd, seed + 11);
      out.push({ id: `gen-name-${s.id}`, category: cat, img: s.img, question: 'Which sign is this?', options: o, answer, explanation: `This is the ${s.name} sign (${s.code}). ${s.meaning}` });
    }

    // 2 — meaning
    const md = distractors(pool, 'meaning', s.meaning, 3, seed + 2);
    if (new Set([s.meaning, ...md]).size === 4) {
      const { options: o, answer } = options(s.meaning, md, seed + 22);
      out.push({ id: `gen-mean-${s.id}`, category: cat, img: s.img, question: 'What does this sign mean?', options: o, answer, explanation: `${s.name} (${s.code}): ${s.meaning}` });
    }

    // 3 — required action
    if (s.action) {
      const ad = distractors(pool.filter(o => o.action), 'action', s.action, 3, seed + 3);
      if (new Set([s.action, ...ad]).size === 4) {
        const { options: o, answer } = options(s.action, ad, seed + 33);
        out.push({ id: `gen-act-${s.id}`, category: cat, img: s.img, question: 'You see this sign while driving. What must you do?', options: o, answer, explanation: `${s.name} (${s.code}): ${s.action}` });
      }
    }

    // 4 — classification
    const correctLabel = CAT_LABEL[cat];
    const cd = shuffleSeeded(Object.values(CAT_LABEL).filter(l => l !== correctLabel), seed + 4).slice(0, 3);
    const { options: o, answer } = options(correctLabel, cd, seed + 44);
    out.push({ id: `gen-cat-${s.id}`, category: cat, img: s.img, question: 'What type of road sign is this?', options: o, answer, explanation: `${s.name} (${s.code}) is a ${correctLabel.toLowerCase()} sign.` });

    // 5 — confusable pair (teaches the look-alikes learners get wrong)
    if (confNames.length >= 1) {
      const ans = confNames[0];
      const cfd = distractors(pool.filter(x => x.name !== ans && x.name !== s.name && !confNames.includes(x.name)), 'name', ans, 3, seed + 5);
      if (ans !== s.name && new Set([ans, ...cfd]).size === 4) {
        const { options: o5, answer: a5 } = options(ans, cfd, seed + 55);
        out.push({ id: `gen-conf-${s.id}`, category: cat, img: s.img, question: 'This sign is most easily confused with which of these?', options: o5, answer: a5, explanation: `${s.name} (${s.code}) is commonly confused with ${ans}. ${s.mnemonic || s.hint || ''}`.trim() });
      }
    }

    // 6 — memory tip
    if (s.mnemonic) {
      const others = [...new Set(signs.filter(x => x.id !== s.id && x.mnemonic && x.mnemonic !== s.mnemonic).map(x => x.mnemonic))];
      const mnd = shuffleSeeded(others, seed + 6).slice(0, 3);
      if (new Set([s.mnemonic, ...mnd]).size === 4) {
        const { options: o6, answer: a6 } = options(s.mnemonic, mnd, seed + 66);
        out.push({ id: `gen-tip-${s.id}`, category: cat, img: s.img, question: 'Which memory tip matches this sign?', options: o6, answer: a6, explanation: `${s.name} (${s.code}): ${s.mnemonic}` });
      }
    }
  }

  return out;
}

export const GENERATED_SIGN_QUESTIONS = generateSignQuestions();
