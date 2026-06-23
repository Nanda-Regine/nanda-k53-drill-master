import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';
import { sfx } from '../utils/sounds.js';

const hapticTap    = () => { try { navigator.vibrate?.(18); } catch {} };
const hapticPass   = () => { try { navigator.vibrate?.([60, 30, 60]); } catch {} };
const hapticWrong  = () => { try { navigator.vibrate?.([80, 30, 80, 30, 80]); } catch {} };

// ── Sequence data ─────────────────────────────────────────────────────────────
const SEQUENCES = [
  {
    id: 'seq_start',
    title: 'Starting a Vehicle',
    icon: '🔑',
    steps: [
      'Adjust seat, steering wheel and head restraint',
      'Adjust rear-view and side mirrors',
      'Fasten seatbelt',
      'Depress the clutch fully',
      'Turn the key to start the engine',
      'Check mirrors and blind spot',
      'Signal if moving into traffic',
      'Release the handbrake',
      'Find the biting point and move off',
    ],
  },
  {
    id: 'seq_3pt',
    title: '3-Point Turn',
    icon: '↩️',
    steps: [
      'Check mirrors front and rear',
      'Signal right and ensure road is clear',
      'Steer hard right and move forward slowly',
      'Stop just before the opposite kerb',
      'Engage reverse and steer hard left',
      'Reverse to near the kerb behind you',
      'Select 1st gear and straighten up',
      'Move forward in the new direction',
    ],
  },
  {
    id: 'seq_park',
    title: 'Parallel Parking',
    icon: '🅿️',
    steps: [
      'Signal left and find a suitable gap',
      'Stop alongside the vehicle ahead of the gap',
      'Reverse slowly, steering full left',
      'When rear clears the front vehicle, steer full right',
      'Continue reversing until parallel with kerb',
      'Straighten wheels and edge forward to centre',
      'Apply handbrake and switch off signal',
    ],
  },
  {
    id: 'seq_hill',
    title: 'Hill Start (Uphill)',
    icon: '⛰️',
    steps: [
      'Keep foot on footbrake',
      'Depress clutch and select 1st gear',
      'Apply handbrake fully',
      'Bring clutch to biting point (engine note drops)',
      'Check mirrors and blind spot',
      'Release handbrake while pressing accelerator gently',
      'Ease clutch out smoothly as vehicle moves off',
    ],
  },
  {
    id: 'seq_emergency',
    title: 'Emergency Stop',
    icon: '🛑',
    steps: [
      'React immediately — check mirror quickly',
      'Press brake pedal firmly and progressively',
      'Keep both hands on the wheel, steer straight',
      'Depress clutch just before vehicle stops',
      'Apply handbrake once stationary',
      'Engage hazard lights',
      'Check mirrors and signal before moving off again',
    ],
  },
  {
    id: 'seq_intersection',
    title: 'Approaching an Intersection',
    icon: '🚦',
    steps: [
      'Check rear-view mirror',
      'Signal in sufficient time',
      'Check side mirror on direction of turn',
      'Reduce speed and select appropriate gear',
      'Watch for pedestrians crossing',
      'Stop at the line if required',
      'Look right, look left, look right again',
      'Proceed only when safe',
    ],
  },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Step pill ─────────────────────────────────────────────────────────────────
function StepPill({ text, state, rank, onClick }) {
  // state: 'idle' | 'selected' | 'correct' | 'wrong'
  const bg = state === 'correct' ? `${T.green}28`
           : state === 'wrong'   ? `${T.red}28`
           : state === 'selected' ? `${T.gold}28`
           : T.surfaceAlt;
  const border = state === 'correct' ? T.green
               : state === 'wrong'   ? T.red
               : state === 'selected' ? T.gold
               : T.border;
  const textColor = state === 'idle' ? T.text : state === 'selected' ? T.gold : state === 'correct' ? T.green : T.red;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      disabled={state !== 'idle'}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', background: bg,
        border: `1.5px solid ${border}`,
        borderRadius: T.radius, padding: '11px 14px',
        cursor: state === 'idle' ? 'pointer' : 'default',
        textAlign: 'left', fontFamily: T.font,
        marginBottom: 8,
        opacity: state === 'selected' ? 0.45 : 1,
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      {rank != null && (
        <span style={{
          width: 24, height: 24, borderRadius: 99, flexShrink: 0,
          background: state === 'correct' ? T.green : state === 'wrong' ? T.red : T.gold,
          color: '#fff', fontWeight: 800, fontSize: T.fontSize - 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {rank}
        </span>
      )}
      <span style={{ color: textColor, fontSize: T.fontSize, lineHeight: 1.4 }}>{text}</span>
      {state === 'correct' && <span style={{ marginLeft: 'auto', flexShrink: 0 }}>✅</span>}
      {state === 'wrong'   && <span style={{ marginLeft: 'auto', flexShrink: 0 }}>❌</span>}
    </motion.button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function SequenceBuilder({ onBack }) {
  const [screen, setScreen]           = useState('intro');    // intro | play | reveal | done
  const [seqIdx, setSeqIdx]           = useState(0);
  const [shuffled, setShuffled]       = useState([]);
  const [selected, setSelected]       = useState([]);         // array of original indices in order selected
  const [stepStates, setStepStates]   = useState([]);         // per-step: 'idle' | 'selected' | 'correct' | 'wrong'
  const [totalScore, setTotalScore]   = useState(0);
  const [totalPossible, setTotalPossible] = useState(0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const startRound = useCallback((idx) => {
    const seq = SEQUENCES[idx];
    const sh = shuffle(seq.steps.map((text, i) => ({ text, origIdx: i })));
    setShuffled(sh);
    setSelected([]);
    setStepStates(sh.map(() => 'idle'));
    setScreen('play');
  }, []);

  useEffect(() => {
    if (screen === 'intro') startRound(0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTap = useCallback((shuffleIdx) => {
    if (stepStates[shuffleIdx] !== 'idle') return;
    hapticTap();
    sfx('click');
    const newSelected = [...selected, shuffleIdx];
    const newStates = [...stepStates];
    newStates[shuffleIdx] = 'selected';
    setSelected(newSelected);
    setStepStates(newStates);

    const seq = SEQUENCES[seqIdx];
    if (newSelected.length === seq.steps.length) {
      // All placed — reveal results
      setTimeout(() => {
        if (!isMounted.current) return;
        let correct = 0;
        const revealStates = newStates.map((_, si) => {
          const rank = newSelected.indexOf(si);
          const item = shuffled[si];
          if (rank !== -1 && item.origIdx === rank) { correct++; return 'correct'; }
          if (rank !== -1) return 'wrong';
          return 'idle';
        });
        const seqScore = correct;
        const seqTotal = seq.steps.length;
        if (correct === seqTotal) { sfx('pass'); hapticPass(); }
        else { sfx('wrong'); hapticWrong(); }
        setStepStates(revealStates);
        setTotalScore(s => s + seqScore);
        setTotalPossible(p => p + seqTotal);
        setScreen('reveal');
      }, 300);
    }
  }, [stepStates, selected, shuffled, seqIdx]);

  const handleNext = useCallback(() => {
    const next = seqIdx + 1;
    if (next >= SEQUENCES.length) {
      setScreen('done');
    } else {
      setSeqIdx(next);
      startRound(next);
    }
  }, [seqIdx, startRound]);

  const handleRestart = useCallback(() => {
    setSeqIdx(0);
    setTotalScore(0);
    setTotalPossible(0);
    startRound(0);
  }, [startRound]);

  const share = useCallback(() => {
    const pct = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
    const text = `I scored ${totalScore}/${totalPossible} (${pct}%) on K53 Sequence Builder! Can you order the driving steps correctly? 🚗 k53drillmaster.co.za`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }, [totalScore, totalPossible]);

  const seq = SEQUENCES[seqIdx];
  const pct = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
  const selectedCount = selected.length;
  const totalSteps = seq?.steps.length || 0;

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {/* Header */}
      <div style={{
        background: T.surface, borderBottom: `1px solid ${T.border}`,
        padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: 22 }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: T.fontSizeLg }}>🔢 Sequence Builder</div>
          {screen === 'play' || screen === 'reveal' ? (
            <div style={{ color: T.dim, fontSize: T.fontSize - 2 }}>
              {seq.icon} {seq.title} · Round {seqIdx + 1}/{SEQUENCES.length}
            </div>
          ) : null}
        </div>
        {(screen === 'play' || screen === 'reveal') && (
          <div style={{
            background: T.surfaceAlt, borderRadius: 99, padding: '4px 12px',
            fontSize: T.fontSize - 2, color: T.gold, fontWeight: 700,
          }}>
            {selectedCount}/{totalSteps}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Play screen */}
        {(screen === 'play' || screen === 'reveal') && (
          <motion.div
            key={`play-${seqIdx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px' }}
          >
            {screen === 'play' && (
              <div style={{
                background: T.surfaceAlt, borderRadius: T.radiusLg,
                padding: '14px 18px', marginBottom: 20,
                borderLeft: `4px solid ${T.gold}`,
              }}>
                <div style={{ color: T.gold, fontWeight: 700, marginBottom: 4 }}>Tap the steps in the correct order</div>
                <div style={{ color: T.dim, fontSize: T.fontSize - 1 }}>
                  Tap step 1 first, then 2, 3… Build the procedure from start to finish.
                </div>
              </div>
            )}

            {screen === 'reveal' && (
              <div style={{
                background: T.surfaceAlt, borderRadius: T.radiusLg,
                padding: '14px 18px', marginBottom: 20,
                borderLeft: `4px solid ${T.green}`,
              }}>
                <div style={{ color: T.text, fontWeight: 700, marginBottom: 2 }}>
                  Correct order (top to bottom):
                </div>
                {seq.steps.map((s, i) => (
                  <div key={i} style={{ color: T.dim, fontSize: T.fontSize - 1, padding: '2px 0' }}>
                    <span style={{ color: T.green, fontWeight: 700, marginRight: 6 }}>{i + 1}.</span>{s}
                  </div>
                ))}
              </div>
            )}

            <div>
              {shuffled.map((item, si) => {
                const rank = selected.indexOf(si);
                return (
                  <StepPill
                    key={item.origIdx}
                    text={item.text}
                    state={stepStates[si]}
                    rank={rank !== -1 ? rank + 1 : null}
                    onClick={() => handleTap(si)}
                  />
                );
              })}
            </div>

            {screen === 'reveal' && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleNext}
                style={{
                  marginTop: 16, width: '100%',
                  background: seqIdx + 1 >= SEQUENCES.length ? T.gold : T.green,
                  color: '#fff', border: 'none', borderRadius: 99,
                  padding: '14px', cursor: 'pointer',
                  fontWeight: 800, fontSize: T.fontSizeLg, fontFamily: T.font,
                }}
              >
                {seqIdx + 1 >= SEQUENCES.length ? '🏁 See Final Score' : '➡️ Next Procedure'}
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Done screen */}
        {screen === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ maxWidth: 440, margin: '0 auto', padding: '32px 16px', textAlign: 'center' }}
          >
            {/* SA stripe */}
            <div style={{ display: 'flex', height: 5, marginBottom: 28, borderRadius: 99, overflow: 'hidden' }}>
              {['#DE3831','#FFB612','#007A4D','#4472CA'].map(c => (
                <div key={c} style={{ flex: 1, background: c }} />
              ))}
            </div>

            <div style={{ fontSize: 64, marginBottom: 10 }}>
              {pct >= 90 ? '🏆' : pct >= 75 ? '🥇' : pct >= 60 ? '🥈' : '📋'}
            </div>
            <div style={{ color: T.gold, fontWeight: 900, fontSize: T.fontSizeXxl, marginBottom: 4 }}>
              {pct}%
            </div>
            <div style={{ color: T.dim, marginBottom: 28 }}>
              {totalScore}/{totalPossible} steps in the right position
            </div>

            <div style={{
              background: T.surfaceAlt, borderRadius: T.radiusLg, padding: 20, marginBottom: 28,
            }}>
              {SEQUENCES.map((s, i) => (
                <div key={s.id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: i < SEQUENCES.length - 1 ? `1px solid ${T.border}` : 'none',
                }}>
                  <span style={{ color: T.dim, fontSize: T.fontSize }}>{s.icon} {s.title}</span>
                  <span style={{ color: T.text, fontWeight: 700, fontSize: T.fontSize }}>{s.steps.length} steps</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                onClick={handleRestart}
                style={{
                  background: T.green, color: '#fff', border: 'none',
                  borderRadius: 99, padding: '12px 28px',
                  cursor: 'pointer', fontWeight: 800, fontSize: T.fontSizeLg,
                  fontFamily: T.font,
                }}
              >🔄 Play Again</button>
              <button
                onClick={share}
                style={{
                  background: T.surfaceAlt, color: T.text,
                  border: `1px solid ${T.border}`, borderRadius: 99,
                  padding: '12px 28px', cursor: 'pointer',
                  fontSize: T.fontSizeLg, fontFamily: T.font,
                }}
              >📲 Share</button>
              <button
                onClick={onBack}
                style={{
                  background: 'none', border: 'none', color: T.dim,
                  cursor: 'pointer', fontSize: T.fontSizeLg, fontFamily: T.font,
                }}
              >← Home</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
