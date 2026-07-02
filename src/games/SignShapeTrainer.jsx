import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';
import { useLang } from '../LangContext.jsx';
import { ROAD_SIGNS, SHAPE_GROUPS, getConfusablePairs } from '../data/roadSigns.js';

import { sfx } from '../utils/sounds.js';
import { hapticCorrect, hapticWrong, hapticPass } from '../utils/haptics.js';
import { recordGameAnswer } from '../utils/masteryStore.js';

// ── Phase definitions ─────────────────────────────────────────────────────────
const PHASES = [
  { id: 'shape',      label: 'Phase 1: Shape',    desc: 'Identify the sign category from its SHAPE only.', icon: '🔷' },
  { id: 'colour',     label: 'Phase 2: Colour',   desc: 'Shape + colour — identify the sign type.', icon: '🎨' },
  { id: 'full',       label: 'Phase 3: Full Sign', desc: 'Name the sign from the complete image.', icon: '🛑' },
  { id: 'confusable', label: 'Phase 4: Confusables', desc: 'Two similar signs — spot the difference.', icon: '⚔️' },
];

// Shape silhouettes rendered as CSS shapes (zero images needed for phase 1)
const SHAPE_RENDERERS = {
  octagon: ({ size = 80 }) => (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <polygon points="24,5 56,5 75,24 75,56 56,75 24,75 5,56 5,24" fill="#DE3831" stroke="#fff" strokeWidth="3" />
      <text x="40" y="46" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">STOP</text>
    </svg>
  ),
  'inv-triangle': ({ size = 80 }) => (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <polygon points="40,75 5,10 75,10" fill="none" stroke="#DE3831" strokeWidth="5" />
      <polygon points="40,70 10,15 70,15" fill="#fff" />
    </svg>
  ),
  'circle-red': ({ size = 80 }) => (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="35" fill="none" stroke="#DE3831" strokeWidth="7" />
      <circle cx="40" cy="40" r="27" fill="#fff" />
    </svg>
  ),
  'circle-blue': ({ size = 80 }) => (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="35" fill="#4472CA" />
    </svg>
  ),
  'triangle-red': ({ size = 80 }) => (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <polygon points="40,5 75,70 5,70" fill="none" stroke="#DE3831" strokeWidth="5" />
      <polygon points="40,10 70,65 10,65" fill="#fff" />
    </svg>
  ),
  diamond: ({ size = 80 }) => (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <polygon points="40,5 75,40 40,75 5,40" fill="#4472CA" />
    </svg>
  ),
  'rect-bw': ({ size = 80 }) => (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <rect x="5" y="20" width="70" height="40" fill="#fff" stroke="#000" strokeWidth="3" rx="4" />
      <text x="40" y="47" textAnchor="middle" fill="#000" fontSize="22">→</text>
    </svg>
  ),
  'rect-blue': ({ size = 80 }) => (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <rect x="5" y="15" width="70" height="50" fill="#4472CA" rx="4" />
    </svg>
  ),
};

function ShapeSilhouette({ shape, size = 80 }) {
  const Renderer = SHAPE_RENDERERS[shape];
  if (!Renderer) return <div style={{ width: size, height: size, background: T.surface, borderRadius: 8 }} />;
  return <Renderer size={size} />;
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function buildShapeQuestions() {
  const shapes = Object.keys(SHAPE_GROUPS);
  return shapes.flatMap(shape => {
    const signs = ROAD_SIGNS.filter(s => s.shape === shape);
    if (!signs.length) return [];
    const sign = shuffle(signs)[0];
    const wrongShapes = shuffle(shapes.filter(s => s !== shape)).slice(0, 3);
    return [{
      type: 'shape',
      shape,
      sign,
      question: 'What TYPE of sign has this shape?',
      correct: SHAPE_GROUPS[shape].label,
      options: shuffle([SHAPE_GROUPS[shape].label, ...wrongShapes.map(s => SHAPE_GROUPS[s]?.label || s)]),
      explanation: SHAPE_GROUPS[shape].desc,
    }];
  });
}

function buildFullSignQuestions() {
  return shuffle(ROAD_SIGNS).slice(0, 15).map(sign => {
    const wrongs = shuffle(ROAD_SIGNS.filter(s => s.id !== sign.id)).slice(0, 3).map(s => s.name);
    return {
      type: 'full',
      sign,
      question: 'What is this sign called?',
      correct: sign.name,
      options: shuffle([sign.name, ...wrongs]),
      explanation: sign.meaning,
      img: sign.img,
    };
  });
}

function buildConfusableQuestions() {
  const pairs = getConfusablePairs();
  return shuffle(pairs).slice(0, 8).map(({ signA, signB }) => {
    const which = Math.random() > 0.5 ? signA : signB;
    const other = which === signA ? signB : signA;
    return {
      type: 'confusable',
      sign: which,
      pairSign: other,
      question: `Which is "${which.name}"?`,
      correct: which.name,
      options: shuffle([which.name, other.name, ...shuffle(ROAD_SIGNS.filter(s => s.id !== which.id && s.id !== other.id)).slice(0, 2).map(s => s.name)]),
      explanation: `${which.name}: ${which.mnemonic || which.hint}\n${other.name}: ${other.mnemonic || other.hint}`,
      imgA: which.img,
      imgB: other.img,
    };
  });
}

const QUESTIONS_BY_PHASE = {
  shape:      buildShapeQuestions,
  colour:     () => shuffle(ROAD_SIGNS).slice(0, 12).map(sign => ({
    type: 'colour',
    sign,
    question: `A sign with ${sign.signColor?.replace('-', ' and ')} colouring means...`,
    correct: sign.options?.[0] || sign.name,
    options: sign.options || [sign.name],
    explanation: sign.mnemonic || sign.hint,
    img: sign.img,
  })),
  full:       buildFullSignQuestions,
  confusable: buildConfusableQuestions,
};

export default function SignShapeTrainer({ onBack, onPass }) {
  const [phase, setPhase]     = useState(null);
  const [questions, setQs]    = useState([]);
  const [qIdx, setQIdx]       = useState(0);
  const [score, setScore]     = useState(0);
  const [chosen, setChosen]   = useState(null);
  const [screen, setScreen]   = useState('phases'); // phases | quiz | result

  const startPhase = useCallback((phaseId) => {
    const qs = shuffle(QUESTIONS_BY_PHASE[phaseId]());
    setPhase(phaseId);
    setQs(qs);
    setQIdx(0);
    setScore(0);
    setChosen(null);
    setScreen('quiz');
  }, []);

  const current = questions[qIdx];

  const handleAnswer = useCallback((opt) => {
    if (chosen) return;
    setChosen(opt);
    const correct = opt === current.correct;
    recordGameAnswer('sign_shape', qIdx, correct);
    if (correct) { hapticCorrect(); sfx('correct'); setScore(s => s + 1); }
    else { hapticWrong(); sfx('wrong'); }
    setTimeout(() => {
      if (qIdx + 1 >= questions.length) {
        hapticPass();
        setScreen('result');
        if (score + (correct ? 1 : 0) >= Math.ceil(questions.length * 0.75)) onPass?.();
      } else {
        setQIdx(i => i + 1);
        setChosen(null);
      }
    }, 1500);
  }, [chosen, current, qIdx, questions.length, score, onPass]);

  const shareResult = () => {
    const pct = Math.round(((score) / questions.length) * 100);
    const text = `🔷 Sign Shape Trainer\n✅ ${score}/${questions.length} (${pct}%)\n🇿🇦 K53 Drill Master — k53drillmaster.co.za`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const SA_STRIPE = (
    <div style={{ display: 'flex', height: 3 }}>
      {['#000', '#FFB612', '#007A4D', '#F5F5F0', '#DE3831', '#4472CA'].map((c, i) => (
        <div key={i} style={{ flex: 1, background: c }} />
      ))}
    </div>
  );

  // ── Phase picker ──────────────────────────────────────────────────────────────
  if (screen === 'phases') return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {SA_STRIPE}
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          style={{ background: 'none', border: 'none', color: T.dim, fontSize: 22, cursor: 'pointer', padding: 0 }}>←</motion.button>
        <div>
          <div style={{ fontWeight: 800, fontSize: T.fontSizeLg }}>Sign Shape Trainer</div>
          <div style={{ color: T.dim, fontSize: T.fontSize - 2 }}>Learn signs by shape, colour, and recognition</div>
        </div>
      </div>

      <div style={{ padding: '24px 20px', display: 'grid', gap: 14 }}>
        {PHASES.map(p => (
          <motion.button key={p.id} whileTap={{ scale: 0.97 }} onClick={() => startPhase(p.id)}
            style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, padding: '18px 20px', textAlign: 'left', cursor: 'pointer', color: T.text, fontFamily: T.font, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 30 }}>{p.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: T.fontSizeLg }}>{p.label}</div>
              <div style={{ color: T.dim, fontSize: T.fontSize - 1, marginTop: 3 }}>{p.desc}</div>
            </div>
          </motion.button>
        ))}

        <div style={{ background: T.surfaceAlt, borderRadius: T.radius, padding: '14px 18px', marginTop: 4 }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: T.gold }}>Why shapes first?</div>
          {Object.entries(SHAPE_GROUPS).slice(0, 5).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
              <ShapeSilhouette shape={k} size={32} />
              <div style={{ fontSize: T.fontSize - 1 }}>
                <span style={{ fontWeight: 600 }}>{v.label}</span>
                <span style={{ color: T.dim }}> — {v.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Quiz ──────────────────────────────────────────────────────────────────────
  if (screen === 'quiz' && current) return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {SA_STRIPE}
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('phases')}
          style={{ background: 'none', border: 'none', color: T.dim, fontSize: 20, cursor: 'pointer' }}>←</motion.button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: T.fontSize, color: T.gold }}>Sign Shape Trainer</div>
          <div style={{ color: T.dim, fontSize: T.fontSize - 2 }}>{qIdx + 1} / {questions.length}</div>
        </div>
        <div style={{ fontWeight: 700, color: T.green }}>{score} ✓</div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: T.border, margin: '0 20px' }}>
        <div style={{ height: '100%', background: T.green, width: `${((qIdx) / questions.length) * 100}%`, transition: 'width 0.3s' }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={qIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          style={{ padding: '28px 20px 0' }}>

          {/* Question content */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            {current.type === 'shape' && <ShapeSilhouette shape={current.shape} size={110} />}
            {(current.type === 'full' || current.type === 'colour') && current.img && (
              <img src={`/signs/${current.img}`} alt="" style={{ width: 130, height: 130, objectFit: 'contain', borderRadius: 12, imageRendering: 'pixelated' }} />
            )}
            {current.type === 'confusable' && (
              <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <img src={`/signs/${current.imgA}`} alt="" style={{ width: 100, height: 100, objectFit: 'contain', borderRadius: 10, imageRendering: 'pixelated' }} />
                  <div style={{ fontSize: 11, color: T.dim, marginTop: 4 }}>A</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <img src={`/signs/${current.imgB}`} alt="" style={{ width: 100, height: 100, objectFit: 'contain', borderRadius: 10, imageRendering: 'pixelated' }} />
                  <div style={{ fontSize: 11, color: T.dim, marginTop: 4 }}>B</div>
                </div>
              </div>
            )}
            <div style={{ fontWeight: 700, fontSize: T.fontSizeLg, marginTop: 20, lineHeight: 1.3 }}>
              {current.question}
            </div>
          </div>

          {/* Options */}
          <div style={{ display: 'grid', gap: 10 }}>
            {current.options.map(opt => {
              const isCorrect = opt === current.correct;
              const isChosen  = opt === chosen;
              let bg = T.surface;
              let border = T.border;
              let textCol = T.text;
              if (chosen) {
                if (isCorrect) { bg = 'rgba(0,122,77,0.2)'; border = T.green; textCol = '#4ade80'; }
                else if (isChosen) { bg = 'rgba(222,56,49,0.2)'; border = T.red; textCol = '#f87171'; }
              }
              return (
                <motion.button key={opt} whileTap={{ scale: chosen ? 1 : 0.97 }} onClick={() => handleAnswer(opt)}
                  style={{ background: bg, border: `2px solid ${border}`, borderRadius: T.radius, padding: '14px 16px', color: textCol, fontFamily: T.font, fontSize: T.fontSize, fontWeight: 600, cursor: chosen ? 'default' : 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
                  <span>{opt}</span>
                  {chosen && isCorrect && <span style={{ fontSize: 18 }}>✓</span>}
                  {chosen && isChosen && !isCorrect && <span style={{ fontSize: 18 }}>✗</span>}
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {chosen && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: 16, background: T.surfaceAlt, borderRadius: T.radius, padding: '14px 16px', fontSize: T.fontSize - 1, color: T.dim, whiteSpace: 'pre-line' }}>
                {current.explanation}
                {current.sign?.mnemonic && <div style={{ marginTop: 8, color: T.gold, fontWeight: 600 }}>💡 {current.sign.mnemonic}</div>}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );

  // ── Result ─────────────────────────────────────────────────────────────────────
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const passed = pct >= 75;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {SA_STRIPE}
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>{passed ? '🏆' : '📚'}</div>
        <div style={{ fontWeight: 800, fontSize: T.fontSizeHeading }}>{pct}%</div>
        <div style={{ color: passed ? T.green : T.gold, fontWeight: 700, fontSize: T.fontSizeLg, marginTop: 4 }}>
          {passed ? 'Excellent shape recognition!' : 'Keep practising — you\'ll get there!'}
        </div>
        <div style={{ color: T.dim, marginTop: 8 }}>{score} correct out of {questions.length}</div>

        <div style={{ marginTop: 32, display: 'grid', gap: 12 }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={shareResult}
            style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: T.radius, padding: '14px', color: '#25d366', fontWeight: 700, fontFamily: T.font, cursor: 'pointer', fontSize: T.fontSize }}>
            💬 Share on WhatsApp
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => startPhase(phase)}
            style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '14px', color: T.text, fontWeight: 700, fontFamily: T.font, cursor: 'pointer', fontSize: T.fontSize }}>
            🔄 Try Again
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setScreen('phases')}
            style={{ background: 'none', border: 'none', color: T.dim, fontFamily: T.font, cursor: 'pointer', fontSize: T.fontSize, padding: '10px' }}>
            ← Choose another phase
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onBack}
            style={{ background: 'none', border: 'none', color: T.dim, fontFamily: T.font, cursor: 'pointer', fontSize: T.fontSize, padding: '10px' }}>
            ← Back to home
          </motion.button>
        </div>
      </div>
    </div>
  );
}
