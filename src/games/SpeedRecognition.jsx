import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';
import { sfx } from '../utils/sounds.js';

const hapticCorrect = () => { try { navigator.vibrate?.(30); } catch {} };
const hapticWrong   = () => { try { navigator.vibrate?.([60, 30, 60]); } catch {} };
const hapticPass    = () => { try { navigator.vibrate?.([60, 30, 60, 30, 60]); } catch {} };

const FLASH_MS  = 1500; // how long the number is shown
const ROUNDS    = 15;

// ── K53 numbers that appear in flash cards ────────────────────────────────────
// Each card shows a number; question asks what K53 rule uses that number
const FLASH_CARDS = [
  // Speeds
  { value: '60',  unit: 'km/h', question: 'Urban / built-up area speed limit', distractors: ['80 km/h', '80 km/h – national roads', '60 km/h – freeway'] },
  { value: '100', unit: 'km/h', question: 'Speed limit outside urban areas (gravel/paved non-freeway)', distractors: ['80 km/h', '120 km/h', '80 km/h – rural roads'] },
  { value: '120', unit: 'km/h', question: 'Freeway speed limit (passenger vehicles)', distractors: ['110 km/h', '100 km/h', '130 km/h'] },
  { value: '80',  unit: 'km/h', question: 'Maximum speed when towing a trailer', distractors: ['60 km/h', '100 km/h', '90 km/h'] },
  { value: '60',  unit: 'km/h', question: 'Speed limit approaching a level crossing (unless signed otherwise)', distractors: ['80 km/h', '40 km/h', '50 km/h'] },

  // Distances
  { value: '45',  unit: 'm',    question: 'Minimum distance behind vehicle to place emergency triangle', distractors: ['30 m', '60 m', '25 m'] },
  { value: '45',  unit: 'm',    question: 'Dipped (low beam) headlight illumination distance', distractors: ['100 m', '60 m', '30 m'] },
  { value: '100', unit: 'm',    question: 'Main (high beam) headlight illumination distance', distractors: ['150 m', '60 m', '80 m'] },
  { value: '90',  unit: 'm',    question: 'Distance at which your hooter must be audible', distractors: ['60 m', '45 m', '75 m'] },
  { value: '150', unit: 'm',    question: 'Minimum following distance on wet / poor visibility roads (informational)', distractors: ['100 m', '90 m', '200 m'] },

  // Parking clearances
  { value: '5',   unit: 'm',    question: 'Minimum distance from an intersection when parking', distractors: ['3 m', '9 m', '2 m'] },
  { value: '9',   unit: 'm',    question: 'Minimum distance from a pedestrian crossing when parking', distractors: ['5 m', '3 m', '6 m'] },
  { value: '1.5', unit: 'm',    question: 'Minimum distance from a fire hydrant when parking', distractors: ['5 m', '3 m', '2 m'] },

  // Time & BAC
  { value: '2',   unit: 'sec',  question: 'Minimum following distance in good conditions (the 2-second rule)', distractors: ['3 sec', '1 sec', '4 sec'] },
  { value: '3',   unit: 'sec',  question: 'Minimum following distance in wet or low-visibility conditions', distractors: ['2 sec', '4 sec', '5 sec'] },
  { value: '0.05', unit: 'g/100ml', question: 'Blood alcohol limit for non-professional drivers', distractors: ['0.02 g/100ml', '0.08 g/100ml', '0.10 g/100ml'] },
  { value: '0.02', unit: 'g/100ml', question: 'Blood alcohol limit for professional / PDP drivers', distractors: ['0.05 g/100ml', '0.00 g/100ml', '0.03 g/100ml'] },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRounds(n) {
  const pool = shuffle(FLASH_CARDS);
  return Array.from({ length: n }, (_, i) => {
    const card = pool[i % pool.length];
    // Build 4 choices: the correct answer (question) and 3 distractors from other cards
    const wrongPool = FLASH_CARDS.filter(c => c.question !== card.question).map(c => c.question);
    const wrongs = shuffle(wrongPool).slice(0, 3);
    const choices = shuffle([card.question, ...wrongs]);
    return { card, choices };
  });
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function SpeedRecognition({ onBack }) {
  const [rounds]   = useState(() => buildRounds(ROUNDS));
  const [qIdx, setQIdx]     = useState(0);
  const [phase, setPhase]   = useState('flash');   // flash | answer | feedback
  const [chosen, setChosen] = useState(null);
  const [score, setScore]   = useState(0);
  const [screen, setScreen] = useState('play');    // play | done
  const timerRef  = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; clearTimeout(timerRef.current); };
  }, []);

  // Flash phase: show number for FLASH_MS then switch to answer
  useEffect(() => {
    if (phase !== 'flash') return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (isMounted.current) setPhase('answer');
    }, FLASH_MS);
  }, [phase, qIdx]);

  const handlePick = useCallback((choice) => {
    if (phase !== 'answer' || chosen) return;
    setChosen(choice);
    const round = rounds[qIdx];
    const correct = choice === round.card.question;
    if (correct) { sfx.correct(); hapticCorrect(); setScore(s => s + 1); }
    else         { sfx.wrong(); hapticWrong(); }
    setPhase('feedback');

    timerRef.current = setTimeout(() => {
      if (!isMounted.current) return;
      if (qIdx + 1 >= ROUNDS) {
        sfx.success(); hapticPass();
        setScreen('done');
      } else {
        setQIdx(i => i + 1);
        setChosen(null);
        setPhase('flash');
      }
    }, 1600);
  }, [phase, chosen, rounds, qIdx]);

  const handleRestart = useCallback(() => {
    setQIdx(0);
    setScore(0);
    setChosen(null);
    setPhase('flash');
    setScreen('play');
  }, []);

  const share = useCallback(() => {
    const pct = Math.round((score / ROUNDS) * 100);
    const text = `I scored ${score}/${ROUNDS} (${pct}%) on K53 Speed & Numbers flash drill! Can you beat me? 🚗 k53drillmaster.co.za`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }, [score]);

  if (screen === 'done') {
    const pct = Math.round((score / ROUNDS) * 100);
    return (
      <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.font }}>
        <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: 22 }}>←</button>
          <span style={{ fontWeight: 800, fontSize: T.fontSizeLg }}>⚡ Speed Recognition</span>
        </div>
        <div style={{ maxWidth: 440, margin: '0 auto', padding: '32px 16px', textAlign: 'center' }}>
          <div style={{ display: 'flex', height: 5, marginBottom: 28, borderRadius: 99, overflow: 'hidden' }}>
            {['#DE3831','#FFB612','#007A4D','#4472CA'].map(c => <div key={c} style={{ flex: 1, background: c }} />)}
          </div>
          <div style={{ fontSize: 64, marginBottom: 10 }}>{pct >= 90 ? '🏆' : pct >= 75 ? '🥇' : pct >= 60 ? '🥈' : '⚡'}</div>
          <div style={{ color: T.gold, fontWeight: 900, fontSize: T.fontSizeXxl, marginBottom: 4 }}>{pct}%</div>
          <div style={{ color: T.dim, marginBottom: 8 }}>{score}/{ROUNDS} numbers identified correctly</div>
          <div style={{ color: T.text, marginBottom: 32 }}>
            {pct >= 90 ? 'You know your K53 numbers cold!' : pct >= 75 ? 'Strong number knowledge.' : pct >= 60 ? 'Getting there — drill the distances again.' : 'The numbers are critical — keep flashing!'}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={handleRestart} style={{ background: T.green, color: '#fff', border: 'none', borderRadius: 99, padding: '12px 28px', cursor: 'pointer', fontWeight: 800, fontSize: T.fontSizeLg, fontFamily: T.font }}>⚡ Again</button>
            <button onClick={share} style={{ background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}`, borderRadius: 99, padding: '12px 28px', cursor: 'pointer', fontSize: T.fontSizeLg, fontFamily: T.font }}>📲 Share</button>
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: T.fontSizeLg, fontFamily: T.font }}>← Home</button>
          </div>
        </div>
      </div>
    );
  }

  const round = rounds[qIdx];
  const pctDone = Math.round((qIdx / ROUNDS) * 100);

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {/* Header */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: 22 }}>←</button>
        <span style={{ fontWeight: 800, fontSize: T.fontSizeLg }}>⚡ Speed Recognition</span>
        <span style={{ marginLeft: 'auto', color: T.gold, fontWeight: 700 }}>
          {score}/{qIdx} · Q{qIdx + 1}/{ROUNDS}
        </span>
      </div>

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '24px 16px' }}>
        {/* Progress bar */}
        <div style={{ height: 4, background: T.border, borderRadius: 99, marginBottom: 28 }}>
          <div style={{ height: '100%', width: `${pctDone}%`, background: T.green, borderRadius: 99, transition: 'width 0.3s' }} />
        </div>

        <AnimatePresence mode="wait">
          {/* Flash: show the number large */}
          {phase === 'flash' && (
            <motion.div
              key={`flash-${qIdx}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.3, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ textAlign: 'center', padding: '40px 16px' }}
            >
              <div style={{ color: T.dim, fontSize: T.fontSize - 1, marginBottom: 8 }}>Memorise this number!</div>
              <div style={{
                fontWeight: 900, fontSize: 88, lineHeight: 1,
                color: T.gold, fontFamily: T.mono,
                textShadow: `0 0 40px ${T.gold}66`,
              }}>
                {round.card.value}
              </div>
              <div style={{ color: T.dim, fontSize: T.fontSizeLg, marginTop: 4 }}>{round.card.unit}</div>
              <div style={{ marginTop: 24, color: T.border, fontSize: T.fontSize - 2 }}>
                disappears in {(FLASH_MS / 1000).toFixed(1)}s…
              </div>
            </motion.div>
          )}

          {/* Answer: show the question */}
          {(phase === 'answer' || phase === 'feedback') && (
            <motion.div
              key={`ans-${qIdx}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div style={{
                textAlign: 'center', marginBottom: 24,
                background: T.surfaceAlt, borderRadius: T.radiusLg,
                padding: '16px 20px',
              }}>
                <div style={{ color: T.dim, fontSize: T.fontSize - 1, marginBottom: 6 }}>
                  That number is the K53 rule for:
                </div>
                <div style={{ fontWeight: 900, fontSize: T.fontSizeXxl, color: T.gold, fontFamily: T.mono }}>
                  {round.card.value} <span style={{ fontSize: T.fontSizeLg, color: T.dim }}>{round.card.unit}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {round.choices.map((choice, i) => {
                  let bg = T.surfaceAlt;
                  let border = T.border;
                  let color = T.text;
                  if (phase === 'feedback') {
                    if (choice === round.card.question) { bg = `${T.green}28`; border = T.green; color = T.green; }
                    else if (choice === chosen)          { bg = `${T.red}28`;   border = T.red;   color = T.red; }
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handlePick(choice)}
                      disabled={phase === 'feedback'}
                      style={{
                        background: bg, border: `1.5px solid ${border}`,
                        borderRadius: T.radius, padding: '13px 16px',
                        cursor: phase === 'answer' ? 'pointer' : 'default',
                        fontFamily: T.font, fontSize: T.fontSize, color,
                        textAlign: 'left', lineHeight: 1.4, transition: 'background 0.15s',
                      }}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
