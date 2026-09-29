import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';
import { sfx } from '../utils/sounds.js';
import { getNerveMastery, recordAnswer, NERVES } from '../utils/masteryStore.js';
import { NERVE_BANK } from '../data/drillBank.js';

const hapticCorrect = () => { try { navigator.vibrate?.(30); } catch {} };
const hapticWrong   = () => { try { navigator.vibrate?.([60, 30, 60]); } catch {} };
const hapticPass    = () => { try { navigator.vibrate?.([60, 30, 60, 30, 60]); } catch {} };

const DRILL_Q = 10;

// ── Per-nerve question banks — verified, source-cited (src/data/drillBank.js) ──
const NERVE_QUESTIONS = NERVE_BANK;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Adapt verified bank items ({q, options, answer}) to this drill's shape ({q, opts, ans}), options shuffled.
const toDrill = (item, nerve) => { const opts = shuffle(item.options); return { id: item.id, nerve, q: item.q, opts, ans: opts.indexOf(item.options[item.answer]), explain: item.explain, ref: item.ref }; };

function buildDrill(nerveId, n) {
  const bank = NERVE_QUESTIONS[nerveId] || [];
  return shuffle(bank).slice(0, n).map(item => toDrill(item, nerveId));
}

function getTargetNerve() {
  const mastery = getNerveMastery();
  const trained = mastery.filter(n => n.answered > 0 && NERVE_QUESTIONS[n.id]);
  if (!trained.length) {
    // No history — pick random
    const ids = Object.keys(NERVE_QUESTIONS);
    return mastery.find(n => n.id === ids[Math.floor(Math.random() * ids.length)]) || mastery[0];
  }
  // Weakest trained nerve
  return trained.sort((a, b) => a.score - b.score)[0];
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function WeakSpotTargeter({ onBack }) {
  const [target]            = useState(() => getTargetNerve());
  const [questions, setQuestions] = useState(() => buildDrill(target?.id || 'rules', DRILL_Q));
  const [qIdx, setQIdx]     = useState(0);
  const [chosen, setChosen] = useState(null);
  const [score, setScore]   = useState(0);
  const [screen, setScreen] = useState('play'); // play | done
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const nerveInfo = NERVES.find(n => n.id === target?.id) || NERVES[1];
  const q = questions[qIdx];

  const handlePick = useCallback((optIdx) => {
    if (chosen !== null) return;
    setChosen(optIdx);
    const correct = optIdx === q.ans;
    if (correct) { sfx('correct'); hapticCorrect(); setScore(s => s + 1); }
    else         { sfx('wrong'); hapticWrong(); }
    recordAnswer(nerveInfo.id, `wst-${nerveInfo.id}-q${qIdx}`, correct);

    setTimeout(() => {
      if (!isMounted.current) return;
      if (qIdx + 1 >= questions.length) {
        sfx('pass'); hapticPass();
        setScreen('done');
      } else {
        setQIdx(i => i + 1);
        setChosen(null);
      }
    }, 1400);
  }, [chosen, q, nerveInfo, qIdx, questions]);

  const handleRestart = useCallback(() => {
    setQuestions(buildDrill(nerveInfo.id, DRILL_Q));
    setQIdx(0);
    setChosen(null);
    setScore(0);
    setScreen('play');
  }, [nerveInfo]);

  const share = useCallback(() => {
    const pct = Math.round((score / questions.length) * 100);
    const text = `I drilled my weakest K53 nerve (${nerveInfo.label}) and scored ${score}/${questions.length} (${pct}%)! 🧠 k53drillmaster.co.za`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }, [score, questions.length, nerveInfo]);

  const pct = Math.round((score / DRILL_Q) * 100);

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
          <div style={{ fontWeight: 800, fontSize: T.fontSizeLg }}>🎯 Weak Spot Targeter</div>
          <div style={{ color: nerveInfo.color, fontSize: T.fontSize - 2, fontWeight: 600 }}>
            Drilling: {nerveInfo.label}
          </div>
        </div>
        {screen === 'play' && (
          <span style={{ color: T.gold, fontWeight: 700 }}>{score}/{qIdx} · Q{qIdx + 1}/{DRILL_Q}</span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {screen === 'play' && (
          <motion.div key={`q-${qIdx}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px' }}>
            {/* Nerve badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: `${nerveInfo.color}22`, border: `1px solid ${nerveInfo.color}66`,
              borderRadius: 99, padding: '6px 14px', marginBottom: 20,
              color: nerveInfo.color, fontWeight: 700, fontSize: T.fontSize - 1,
            }}>
              🎯 Weak nerve: {nerveInfo.label}
              {target?.score != null && (
                <span style={{ opacity: 0.7 }}>· {target.score}% accuracy</span>
              )}
            </div>

            {/* Progress bar */}
            <div style={{ height: 4, background: T.border, borderRadius: 99, marginBottom: 24 }}>
              <div style={{ height: '100%', width: `${(qIdx / DRILL_Q) * 100}%`, background: nerveInfo.color, borderRadius: 99, transition: 'width 0.3s' }} />
            </div>

            <div style={{ fontWeight: 700, fontSize: T.fontSizeLg, marginBottom: 20, lineHeight: 1.4 }}>{q.q}</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {q.opts.map((opt, i) => {
                let bg = T.surfaceAlt, border = T.border, color = T.text;
                if (chosen !== null) {
                  if (i === q.ans)    { bg = `${T.green}28`; border = T.green; color = T.green; }
                  else if (i === chosen) { bg = `${T.red}28`; border = T.red; color = T.red; }
                }
                return (
                  <button key={i} onClick={() => handlePick(i)} disabled={chosen !== null}
                    style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: T.radius, padding: '13px 16px', cursor: chosen === null ? 'pointer' : 'default', fontFamily: T.font, fontSize: T.fontSize, color, textAlign: 'left', lineHeight: 1.4, transition: 'background 0.15s' }}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {screen === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ maxWidth: 440, margin: '0 auto', padding: '32px 16px', textAlign: 'center' }}>
            <div style={{ display: 'flex', height: 5, marginBottom: 28, borderRadius: 99, overflow: 'hidden' }}>
              {['#DE3831','#FFB612','#007A4D','#4472CA'].map(c => <div key={c} style={{ flex: 1, background: c }} />)}
            </div>
            <div style={{ fontSize: 64, marginBottom: 10 }}>{pct >= 90 ? '🏆' : pct >= 75 ? '🥇' : pct >= 60 ? '🥈' : '🎯'}</div>
            <div style={{ color: nerveInfo.color, fontWeight: 900, fontSize: T.fontSizeXxl, marginBottom: 4 }}>{pct}%</div>
            <div style={{ color: T.dim, marginBottom: 8 }}>{score}/{DRILL_Q} on {nerveInfo.label}</div>
            <div style={{ color: T.text, marginBottom: 32 }}>
              {pct >= 90 ? `${nerveInfo.label} is no longer your weak spot! 🚀` : pct >= 75 ? 'Improving! Drill again to solidify.' : 'Keep drilling — targeted practice is the fastest fix.'}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={handleRestart} style={{ background: nerveInfo.color, color: '#fff', border: 'none', borderRadius: 99, padding: '12px 28px', cursor: 'pointer', fontWeight: 800, fontSize: T.fontSizeLg, fontFamily: T.font }}>🔄 Drill Again</button>
              <button onClick={share}         style={{ background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}`, borderRadius: 99, padding: '12px 28px', cursor: 'pointer', fontSize: T.fontSizeLg, fontFamily: T.font }}>📲 Share</button>
              <button onClick={onBack}        style={{ background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: T.fontSizeLg, fontFamily: T.font }}>← Home</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
