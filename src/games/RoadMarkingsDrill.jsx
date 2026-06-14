import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';
import { ROAD_MARKINGS, MARKING_CATEGORIES, KEY_MARKING_COLOURS } from '../data/roadMarkings.js';

import { sfx } from '../utils/sounds.js';
import { hapticCorrect, hapticWrong, hapticPass } from '../utils/haptics.js';
import { recordGameAnswer } from '../utils/masteryStore.js';

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

// Build multi-format questions from road markings data
function buildQuestions() {
  const qs = [];

  ROAD_MARKINGS.forEach(marking => {
    // Q1: What is this marking called?
    const wrongNames = shuffle(ROAD_MARKINGS.filter(m => m.id !== marking.id)).slice(0, 3).map(m => m.name);
    qs.push({
      marking,
      qtype: 'name',
      question: `What is this road marking called?`,
      correct: marking.name,
      options: shuffle([marking.name, ...wrongNames]),
      explanation: marking.meaning,
      img: marking.img,
    });

    // Q2: What does the colour mean? (for colour-coded markings)
    if (marking.colour && marking.colour !== 'White') {
      qs.push({
        marking,
        qtype: 'colour',
        question: `A ${marking.colour.toLowerCase()} line or kerb on the road means:`,
        correct: marking.meaning,
        options: shuffle([
          marking.meaning,
          ...shuffle(ROAD_MARKINGS.filter(m => m.colour !== marking.colour)).slice(0, 3).map(m => m.meaning.slice(0, 60) + '...')
        ]).slice(0, 4),
        explanation: `${marking.colour} markings: ${marking.meaning}`,
        img: marking.img,
      });
    }

    // Q3: What must you do?
    if (marking.action && marking.action.length > 10) {
      const wrongActions = shuffle(ROAD_MARKINGS.filter(m => m.id !== marking.id && m.action?.length > 10)).slice(0, 3).map(m => m.action.slice(0, 70));
      qs.push({
        marking,
        qtype: 'action',
        question: `You see ${marking.name} on the road. What must you do?`,
        correct: marking.action.slice(0, 70),
        options: shuffle([marking.action.slice(0, 70), ...wrongActions]),
        explanation: marking.action,
        img: marking.img,
      });
    }
  });

  // Colour rule questions
  KEY_MARKING_COLOURS.forEach(({ colour, meaning }) => {
    const wrongMeanings = KEY_MARKING_COLOURS.filter(c => c.colour !== colour).map(c => c.meaning);
    qs.push({
      qtype: 'colour-rule',
      question: `What do ${colour.toLowerCase()} road markings or kerb lines mean?`,
      correct: meaning,
      options: shuffle([meaning, ...wrongMeanings, 'Guidance only — no legal restriction']).slice(0, 4),
      explanation: `${colour} markings: ${meaning}`,
    });
  });

  // Box junction specific
  qs.push({
    qtype: 'rule',
    question: 'You may enter a yellow box junction ONLY if:',
    correct: 'Your exit road is clear and you can drive straight through without stopping.',
    options: shuffle([
      'Your exit road is clear and you can drive straight through without stopping.',
      'The traffic light is green.',
      'You intend to turn and the way is clear.',
      'No pedestrians are crossing.',
    ]),
    explanation: 'A box junction prevents gridlock. You may only enter if you can EXIT immediately. Even with a green light, you must wait outside if the exit is blocked.',
    img: 'box-junction.jpg',
  });

  // Parking near crossing
  qs.push({
    qtype: 'rule',
    question: 'How far from a pedestrian crossing may you NOT park?',
    correct: 'Within 9 metres of the crossing lines',
    options: shuffle([
      'Within 9 metres of the crossing lines',
      'Within 5 metres',
      'Within 1.5 metres',
      'Within 3 metres',
    ]),
    explanation: 'You may not park within 9 m of a pedestrian crossing. This ensures pedestrians are visible to drivers before they reach the crossing.',
  });

  return shuffle(qs);
}

const COLOUR_BADGE = {
  White:  { bg: 'rgba(255,255,255,0.9)', text: '#000' },
  Yellow: { bg: '#FFB612',               text: '#000' },
  Red:    { bg: '#DE3831',               text: '#fff' },
};

export default function RoadMarkingsDrill({ onBack, onPass }) {
  const [screen, setScreen] = useState('intro');
  const [questions]         = useState(() => buildQuestions().slice(0, 20));
  const [qIdx, setQIdx]     = useState(0);
  const [score, setScore]   = useState(0);
  const [chosen, setChosen] = useState(null);

  const current = questions[qIdx];

  const handleAnswer = useCallback((opt) => {
    if (chosen) return;
    setChosen(opt);
    const correct = opt === current.correct;
    recordGameAnswer('road_marks', qIdx, correct);
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
    }, 1600);
  }, [chosen, current, qIdx, questions.length, score, onPass]);

  const SA_STRIPE = (
    <div style={{ display: 'flex', height: 3 }}>
      {['#000', '#FFB612', '#007A4D', '#F5F5F0', '#DE3831', '#4472CA'].map((c, i) => (
        <div key={i} style={{ flex: 1, background: c }} />
      ))}
    </div>
  );

  // ── Intro ───────────────────────────────────────────────────────────────────
  if (screen === 'intro') return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {SA_STRIPE}
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          style={{ background: 'none', border: 'none', color: T.dim, fontSize: 22, cursor: 'pointer' }}>←</motion.button>
        <div>
          <div style={{ fontWeight: 800, fontSize: T.fontSizeLg }}>Road Markings Drill</div>
          <div style={{ color: T.dim, fontSize: T.fontSize - 2 }}>The most underestimated section of K53</div>
        </div>
      </div>

      <div style={{ padding: '24px 20px' }}>
        <div style={{ background: 'rgba(255,182,18,0.08)', border: '1px solid rgba(255,182,18,0.25)', borderRadius: T.radiusLg, padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: T.gold, marginBottom: 10 }}>The Colour Code</div>
          {KEY_MARKING_COLOURS.map(({ colour, meaning }) => {
            const badge = COLOUR_BADGE[colour] || { bg: T.surface, text: T.text };
            return (
              <div key={colour} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ background: badge.bg, color: badge.text, padding: '2px 10px', borderRadius: 6, fontWeight: 700, fontSize: T.fontSize - 2, flexShrink: 0 }}>{colour}</span>
                <span style={{ color: T.dim, fontSize: T.fontSize - 1 }}>{meaning}</span>
              </div>
            );
          })}
        </div>

        {MARKING_CATEGORIES.map(cat => (
          <div key={cat.id} style={{ marginBottom: 14, background: T.surface, borderRadius: T.radius, padding: '14px 16px', borderLeft: `3px solid ${cat.color}` }}>
            <div style={{ fontWeight: 700, color: cat.color }}>{cat.label}</div>
            <div style={{ color: T.dim, fontSize: T.fontSize - 1, marginTop: 3 }}>{cat.description}</div>
          </div>
        ))}

        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setScreen('quiz')}
          style={{ width: '100%', background: T.green, border: 'none', borderRadius: T.radiusLg, padding: '18px', color: '#fff', fontWeight: 800, fontSize: T.fontSizeLg, fontFamily: T.font, cursor: 'pointer', marginTop: 8 }}>
          Start Drill — {questions.length} Questions
        </motion.button>
      </div>
    </div>
  );

  // ── Quiz ────────────────────────────────────────────────────────────────────
  if (screen === 'quiz' && current) return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {SA_STRIPE}
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setScreen('intro')}
          style={{ background: 'none', border: 'none', color: T.dim, fontSize: 20, cursor: 'pointer' }}>←</motion.button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, color: '#FFB612' }}>Road Markings</div>
          <div style={{ color: T.dim, fontSize: T.fontSize - 2 }}>{qIdx + 1} / {questions.length}</div>
        </div>
        <div style={{ fontWeight: 700, color: T.green }}>{score} ✓</div>
      </div>

      <div style={{ height: 3, background: T.border, margin: '0 20px' }}>
        <div style={{ height: '100%', background: '#FFB612', width: `${(qIdx / questions.length) * 100}%`, transition: 'width 0.3s' }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={qIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          style={{ padding: '24px 20px' }}>

          {current.img && (
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <img src={`/signs/${current.img}`} alt="" style={{ width: 160, height: 120, objectFit: 'contain', borderRadius: 10, background: T.surface, padding: 8 }} />
              {current.marking?.colour && (
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
                  <span style={{
                    ...(COLOUR_BADGE[current.marking.colour] || { bg: T.surface, text: T.dim }),
                    background: COLOUR_BADGE[current.marking.colour]?.bg || T.surface,
                    color: COLOUR_BADGE[current.marking.colour]?.text || T.dim,
                    padding: '3px 12px', borderRadius: 6, fontWeight: 700, fontSize: T.fontSize - 2,
                  }}>
                    {current.marking.colour} marking
                  </span>
                </div>
              )}
            </div>
          )}

          <div style={{ fontWeight: 700, fontSize: T.fontSizeLg, marginBottom: 20, lineHeight: 1.35 }}>
            {current.question}
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            {current.options.map(opt => {
              const isCorrect = opt === current.correct;
              const isChosen  = opt === chosen;
              let bg = T.surface; let border = T.border; let textCol = T.text;
              if (chosen) {
                if (isCorrect) { bg = 'rgba(0,122,77,0.2)'; border = T.green; textCol = '#4ade80'; }
                else if (isChosen) { bg = 'rgba(222,56,49,0.2)'; border = T.red; textCol = '#f87171'; }
              }
              return (
                <motion.button key={opt} whileTap={{ scale: chosen ? 1 : 0.97 }} onClick={() => handleAnswer(opt)}
                  style={{ background: bg, border: `2px solid ${border}`, borderRadius: T.radius, padding: '13px 16px', color: textCol, fontFamily: T.font, fontSize: T.fontSize - 1, fontWeight: 600, cursor: chosen ? 'default' : 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
                  <span style={{ lineClamp: 2 }}>{opt}</span>
                  {chosen && isCorrect && <span>✓</span>}
                  {chosen && isChosen && !isCorrect && <span>✗</span>}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {chosen && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: 16, background: T.surfaceAlt, borderRadius: T.radius, padding: '14px 16px', fontSize: T.fontSize - 1, color: T.dim }}>
                {current.explanation}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );

  // ── Result ───────────────────────────────────────────────────────────────────
  const pct    = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const passed = pct >= 75;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {SA_STRIPE}
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>{passed ? '🎉' : '📘'}</div>
        <div style={{ fontWeight: 800, fontSize: T.fontSizeHeading }}>{pct}%</div>
        <div style={{ color: passed ? T.green : T.gold, fontWeight: 700, fontSize: T.fontSizeLg, marginTop: 4 }}>
          {passed ? 'Road markings mastered!' : 'Keep at it — most people skip these!'}
        </div>
        <div style={{ color: T.dim, marginTop: 6 }}>{score} / {questions.length} correct</div>

        {!passed && (
          <div style={{ marginTop: 20, background: 'rgba(255,182,18,0.08)', border: '1px solid rgba(255,182,18,0.2)', borderRadius: T.radius, padding: '14px 16px', textAlign: 'left' }}>
            <div style={{ fontWeight: 700, color: T.gold, marginBottom: 6 }}>Focus on:</div>
            <div style={{ color: T.dim, fontSize: T.fontSize - 1 }}>
              • Red kerb = No stopping (strictest)<br />
              • Yellow kerb = No parking (brief stops OK)<br />
              • Solid white line = No overtaking<br />
              • Yellow box junction = Only enter if exit is clear
            </div>
          </div>
        )}

        <div style={{ marginTop: 28, display: 'grid', gap: 12 }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => {
            const text = `📍 Road Markings Drill\n✅ ${score}/${questions.length} (${pct}%)\n🇿🇦 K53 Drill Master`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
          }}
            style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: T.radius, padding: '14px', color: '#25d366', fontWeight: 700, fontFamily: T.font, cursor: 'pointer' }}>
            💬 Share on WhatsApp
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setQIdx(0); setScore(0); setChosen(null); setScreen('quiz'); }}
            style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '14px', color: T.text, fontWeight: 700, fontFamily: T.font, cursor: 'pointer' }}>
            🔄 Try Again
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onBack}
            style={{ background: 'none', border: 'none', color: T.dim, fontFamily: T.font, cursor: 'pointer', padding: '10px' }}>
            ← Back to home
          </motion.button>
        </div>
      </div>
    </div>
  );
}
