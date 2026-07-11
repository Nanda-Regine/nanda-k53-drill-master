import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';
import { sfx } from '../utils/sounds.js';
import { ROAD_SIGNS, CRISP_SIGNS } from '../data/roadSigns.js';

const hapticCorrect = () => { try { navigator.vibrate?.(30); } catch {} };
const hapticWrong   = () => { try { navigator.vibrate?.([60, 30, 60]); } catch {} };
const hapticPass    = () => { try { navigator.vibrate?.([60, 30, 60, 30, 60]); } catch {} };

const ROUNDS = 12;

// ── Build confusable pairs from roadSigns data ─────────────────────────────
function buildPairs() {
  const signMap = {};
  ROAD_SIGNS.forEach(s => { signMap[s.id] = s; });
  const crispIds = new Set(CRISP_SIGNS.map(s => s.id)); // only pair signs with crisp images

  const pairs = [];
  const seen = new Set();

  CRISP_SIGNS.forEach(sign => {
    (sign.confusableWith || []).forEach(otherId => {
      const other = signMap[otherId];
      if (!other || !crispIds.has(otherId)) return;
      const key = [sign.id, otherId].sort().join('|');
      if (!seen.has(key)) {
        seen.add(key);
        pairs.push([sign, other]);
      }
    });
  });

  // Hard-coded important pairs not in confusableWith
  const EXTRA = [
    ['R1', 'R2'],    // Stop vs Yield
    ['R2', 'R2.1'],  // Yield vs Yield to pedestrians
    ['R2', 'R2.2'],  // Yield vs Yield at traffic circle
  ];
  EXTRA.forEach(([a, b]) => {
    const key = [a, b].sort().join('|');
    if (!seen.has(key) && signMap[a] && signMap[b] && crispIds.has(a) && crispIds.has(b)) {
      seen.add(key);
      pairs.push([signMap[a], signMap[b]]);
    }
  });

  return pairs;
}

const ALL_PAIRS = buildPairs();

function buildRounds(n) {
  const rounds = [];
  const shuffled = [...ALL_PAIRS].sort(() => Math.random() - 0.5);

  for (let i = 0; i < n; i++) {
    const pair = shuffled[i % shuffled.length];
    const flip = Math.random() < 0.5;
    const [left, right] = flip ? [pair[1], pair[0]] : [pair[0], pair[1]];
    const target = Math.random() < 0.5 ? 'left' : 'right';
    const targetSign = target === 'left' ? left : right;
    rounds.push({ left, right, target, targetSign });
  }
  return rounds;
}

// ── Sign card ─────────────────────────────────────────────────────────────────
function SignCard({ sign, state, onClick }) {
  const border = state === 'correct' ? `3px solid ${T.green}`
               : state === 'wrong'   ? `3px solid ${T.red}`
               : `2px solid ${T.border}`;
  const overlay = state === 'correct' ? `${T.green}28`
                : state === 'wrong'   ? `${T.red}28`
                : 'transparent';

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={state !== 'idle'}
      style={{
        flex: 1, minWidth: 0, padding: 14, cursor: state === 'idle' ? 'pointer' : 'default',
        background: overlay || T.surfaceAlt,
        border, borderRadius: T.radiusLg,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        fontFamily: T.font, transition: 'border 0.15s',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Sign image */}
      <div style={{ width: '100%', aspectRatio: '1', maxHeight: 120, overflow: 'hidden', borderRadius: T.radius }}>
        <img
          src={`/signs/${sign.img}`}
          alt={sign.name}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* Sign name — hidden until revealed */}
      {state !== 'idle' && (
        <div style={{
          fontSize: T.fontSize - 1, fontWeight: 700,
          color: state === 'correct' ? T.green : state === 'wrong' ? T.red : T.text,
          textAlign: 'center', lineHeight: 1.3,
        }}>
          {sign.name}
        </div>
      )}

      {/* Result badge */}
      {state === 'correct' && (
        <span style={{ fontSize: 22, position: 'absolute', top: 8, right: 8 }}>✅</span>
      )}
      {state === 'wrong' && (
        <span style={{ fontSize: 22, position: 'absolute', top: 8, right: 8 }}>❌</span>
      )}
    </motion.button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function ConfusablesBattle({ onBack, onPass }) {
  const [rounds, setRounds]       = useState(() => buildRounds(ROUNDS));
  const [qIdx, setQIdx]           = useState(0);
  const [chosen, setChosen]       = useState(null);   // 'left' | 'right' | null
  const [score, setScore]         = useState(0);
  const [screen, setScreen]       = useState('play'); // play | done
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const round = rounds[qIdx];

  const handlePick = useCallback((side) => {
    if (chosen) return;
    setChosen(side);
    const correct = side === round.target;
    if (correct) { sfx('correct'); hapticCorrect(); setScore(s => s + 1); }
    else         { sfx('wrong'); hapticWrong(); }

    setTimeout(() => {
      if (!isMounted.current) return;
      if (qIdx + 1 >= ROUNDS) {
        sfx('pass'); hapticPass();
        onPass?.();
        setScreen('done');
      } else {
        setQIdx(i => i + 1);
        setChosen(null);
      }
    }, 1400);
  }, [chosen, round, qIdx]);

  const handleRestart = useCallback(() => {
    setRounds(buildRounds(ROUNDS));
    setQIdx(0);
    setScore(0);
    setChosen(null);
    setScreen('play');
  }, []);

  const share = useCallback(() => {
    const pct = Math.round((score / ROUNDS) * 100);
    const text = `I scored ${score}/${ROUNDS} (${pct}%) on K53 Confusables Battle — spotting similar-looking signs! Can you beat me? 🚗 k53drillmaster.co.za`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }, [score]);

  const pct = Math.round((score / ROUNDS) * 100);

  const leftState  = chosen ? (chosen === 'left'  ? (round.target === 'left'  ? 'correct' : 'wrong') : (round.target === 'left'  ? 'correct' : 'idle')) : 'idle';
  const rightState = chosen ? (chosen === 'right' ? (round.target === 'right' ? 'correct' : 'wrong') : (round.target === 'right' ? 'correct' : 'idle')) : 'idle';

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {/* Header */}
      <div style={{
        background: T.surface, borderBottom: `1px solid ${T.border}`,
        padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: 22 }}>←</button>
        <span style={{ fontWeight: 800, fontSize: T.fontSizeLg }}>🥊 Confusables Battle</span>
        {screen === 'play' && (
          <span style={{ marginLeft: 'auto', color: T.gold, fontWeight: 700 }}>
            {score}/{qIdx} · Q{qIdx + 1}/{ROUNDS}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {screen === 'play' && (
          <motion.div
            key={`q-${qIdx}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            style={{ maxWidth: 500, margin: '0 auto', padding: '24px 16px' }}
          >
            {/* Progress bar */}
            <div style={{ height: 4, background: T.border, borderRadius: 99, marginBottom: 24 }}>
              <div style={{ height: '100%', width: `${((qIdx) / ROUNDS) * 100}%`, background: T.green, borderRadius: 99, transition: 'width 0.4s' }} />
            </div>

            {/* Question */}
            <div style={{
              textAlign: 'center', marginBottom: 24,
              background: T.surfaceAlt, borderRadius: T.radiusLg,
              padding: '16px 20px',
            }}>
              <div style={{ color: T.dim, fontSize: T.fontSize - 1, marginBottom: 6 }}>Which sign is:</div>
              <div style={{ fontWeight: 800, fontSize: T.fontSizeLg, color: T.gold }}>
                "{round.targetSign.name}"
              </div>
              <div style={{ color: T.dim, fontSize: T.fontSize - 1, marginTop: 6 }}>
                {round.targetSign.meaning}
              </div>
            </div>

            {/* Two signs */}
            <div style={{ display: 'flex', gap: 14 }}>
              <SignCard sign={round.left}  state={leftState}  onClick={() => handlePick('left')}  />
              <SignCard sign={round.right} state={rightState} onClick={() => handlePick('right')} />
            </div>

            {/* Reveal: mnemonic */}
            {chosen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: 16, background: T.surfaceAlt,
                  borderRadius: T.radiusLg, padding: '14px 16px',
                  borderLeft: `4px solid ${T.gold}`,
                }}
              >
                <div style={{ color: T.gold, fontWeight: 700, marginBottom: 4, fontSize: T.fontSize - 1 }}>💡 Remember</div>
                <div style={{ color: T.dim, fontSize: T.fontSize - 1 }}>{round.targetSign.mnemonic}</div>
              </motion.div>
            )}
          </motion.div>
        )}

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
              {pct >= 90 ? '🏆' : pct >= 75 ? '🥇' : pct >= 60 ? '🥈' : '🎯'}
            </div>
            <div style={{ color: T.gold, fontWeight: 900, fontSize: T.fontSizeXxl, marginBottom: 4 }}>{pct}%</div>
            <div style={{ color: T.dim, marginBottom: 8 }}>{score}/{ROUNDS} correct</div>
            <div style={{ color: T.text, marginBottom: 32 }}>
              {pct >= 90 ? 'Exceptional sign recognition!' : pct >= 75 ? 'Strong — nearly exam-ready.' : pct >= 60 ? 'Getting there. Drill the similar ones again.' : 'Keep practising — similar signs trip up many learners.'}
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={handleRestart} style={{ background: T.green, color: '#fff', border: 'none', borderRadius: 99, padding: '12px 28px', cursor: 'pointer', fontWeight: 800, fontSize: T.fontSizeLg, fontFamily: T.font }}>
                🔄 Try Again
              </button>
              <button onClick={share} style={{ background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}`, borderRadius: 99, padding: '12px 28px', cursor: 'pointer', fontSize: T.fontSizeLg, fontFamily: T.font }}>
                📲 Share
              </button>
              <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: T.fontSizeLg, fontFamily: T.font }}>
                ← Home
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
