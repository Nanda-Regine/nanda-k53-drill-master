import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';
import { sfx } from '../utils/sounds.js';
import { getNerveMastery, recordAnswer, NERVES, getDailyStreak } from '../utils/masteryStore.js';

const hapticCorrect = () => { try { navigator.vibrate?.(30); } catch {} };
const hapticWrong   = () => { try { navigator.vibrate?.([60, 30, 60]); } catch {} };
const hapticPass    = () => { try { navigator.vibrate?.([60, 30, 60, 30, 60]); } catch {} };

const TODAY_KEY = 'k53_daily_diag_date';
const SCORE_KEY = 'k53_daily_diag_score';

// ── Balanced 10-question daily bank (2 per nerve) ─────────────────────────────
// Pulled fresh each day; order is randomised
const DAILY_BANK = [
  // Signs (2)
  { nerve: 'signs',    q: 'A red octagonal sign means:', opts: ['Yield','Stop completely','No entry','Danger'], ans: 1 },
  { nerve: 'signs',    q: 'A yellow diamond sign on SA roads indicates:', opts: ['Prohibition','Warning','Guidance','Command'], ans: 1 },
  // Rules (2)
  { nerve: 'rules',    q: 'The speed limit on a freeway for a passenger car is:', opts: ['100 km/h','110 km/h','120 km/h','140 km/h'], ans: 2 },
  { nerve: 'rules',    q: 'Minimum following distance on a wet road:', opts: ['1 sec','2 sec','3 sec','4 sec'], ans: 2 },
  // Controls (2)
  { nerve: 'controls', q: 'The clutch pedal is used to:', opts: ['Apply brakes','Engage/disengage the gearbox','Control throttle','Steer'], ans: 1 },
  { nerve: 'controls', q: 'Minimum legal tyre tread depth in South Africa:', opts: ['0.5 mm','1 mm','1.6 mm','3 mm'], ans: 2 },
  // Scenarios (2)
  { nerve: 'scenarios', q: 'If you skid on a wet road, you should:', opts: ['Brake hard and steer hard','Lift off accelerator and steer into the skid','Accelerate to regain traction','Apply handbrake immediately'], ans: 1 },
  { nerve: 'scenarios', q: 'You are dazzled by oncoming high beams. You should:', opts: ['Flash your high beams back','Look to the left road edge and slow down','Close your eyes briefly','Speed up to pass quickly'], ans: 1 },
  // Markings (2)
  { nerve: 'markings', q: 'A solid white centre line means:', opts: ['Overtaking is permitted','Do not cross — no overtaking','Lane ends ahead','Emergency vehicle lane'], ans: 1 },
  { nerve: 'markings', q: 'Hatched yellow diagonal road markings mean:', opts: ['No parking','No stopping or parking — obstruction-free zone','Speed bump ahead','Bus route'], ans: 1 },
];

// Supplementary pool for variety (swap in on subsequent days)
const DAILY_POOL_B = [
  { nerve: 'signs',    q: 'A "No entry" sign is:', opts: ['Red circle with white bar','Red octagon','Red triangle','Blue circle'], ans: 0 },
  { nerve: 'signs',    q: 'A blue circle on a road sign contains:', opts: ['Warning','Prohibition','A positive instruction','Guide information'], ans: 2 },
  { nerve: 'rules',    q: 'BAC limit for non-professional drivers:', opts: ['0.02 g/100ml','0.05 g/100ml','0.08 g/100ml','0.10 g/100ml'], ans: 1 },
  { nerve: 'rules',    q: 'Emergency triangle must be placed at least ___ behind the vehicle:', opts: ['25 m','30 m','45 m','60 m'], ans: 2 },
  { nerve: 'controls', q: 'Aquaplaning is most likely when:', opts: ['Driving slowly on dry roads','Driving fast on wet roads with worn tyres','Using engine braking','In a tunnel'], ans: 1 },
  { nerve: 'controls', q: 'ABS brakes help by:', opts: ['Stopping faster than normal','Preventing wheel lock during hard braking','Activating automatically in rain','Reducing stopping distance by half'], ans: 1 },
  { nerve: 'scenarios', q: 'You miss your freeway off-ramp. You should:', opts: ['Reverse on the shoulder','Stop on the shoulder','Continue to the next exit','Do a U-turn on the freeway'], ans: 2 },
  { nerve: 'scenarios', q: 'You are feeling fatigued on a long trip. You should:', opts: ['Open the window and continue','Stop safely and rest','Drink coffee and push on','Speed up to reach your destination sooner'], ans: 1 },
  { nerve: 'markings', q: 'A broken white centre line means:', opts: ['Do not cross','Overtaking permitted when safe','Emergency lane','Pedestrian area'], ans: 1 },
  { nerve: 'markings', q: 'Zigzag white lines near a pedestrian crossing mean:', opts: ['Speed bumps ahead','No parking or overtaking near the crossing','Yield to buses','Road narrows'], ans: 1 },
];

function getTodayKey() {
  return new Date().toDateString();
}

function getPool() {
  const today = getTodayKey();
  const dayNum = Math.floor(Date.now() / 86400000);
  return dayNum % 2 === 0 ? DAILY_BANK : DAILY_POOL_B;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Nerve health bar ──────────────────────────────────────────────────────────
function NerveBar({ nerve, score, answered }) {
  const pct = answered > 0 ? score : null;
  const color = nerve.color;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ color: T.text, fontSize: T.fontSize - 1, fontWeight: 600 }}>{nerve.label}</span>
        <span style={{ color: pct != null ? color : T.dim, fontSize: T.fontSize - 1, fontWeight: 700 }}>
          {pct != null ? `${pct}%` : 'not drilled'}
        </span>
      </div>
      <div style={{ height: 6, background: T.border, borderRadius: 99 }}>
        {pct != null && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7 }}
            style={{ height: '100%', background: color, borderRadius: 99 }}
          />
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function DailyDiagnostic({ onBack }) {
  const alreadyDoneToday = (() => {
    try { return localStorage.getItem(TODAY_KEY) === getTodayKey(); } catch { return false; }
  })();

  const [questions] = useState(() => shuffle(getPool()));
  const [qIdx, setQIdx]     = useState(0);
  const [chosen, setChosen] = useState(null);
  const [score, setScore]   = useState(0);
  const [screen, setScreen] = useState(alreadyDoneToday ? 'results' : 'play');
  const [nerveData, setNerveData] = useState(() => getNerveMastery());
  const [streak]            = useState(() => getDailyStreak());
  const [prevScore]         = useState(() => {
    try { return parseInt(localStorage.getItem(SCORE_KEY) || '0', 10); } catch { return 0; }
  });
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const q = questions[qIdx];

  const handlePick = useCallback((optIdx) => {
    if (chosen !== null) return;
    setChosen(optIdx);
    const correct = optIdx === q.ans;
    if (correct) { sfx.correct(); hapticCorrect(); setScore(s => s + 1); }
    else         { sfx.wrong(); hapticWrong(); }
    recordAnswer(q.nerve, `diag-${q.nerve}-${qIdx}`, correct);

    setTimeout(() => {
      if (!isMounted.current) return;
      if (qIdx + 1 >= questions.length) {
        sfx.success(); hapticPass();
        const finalScore = score + (correct ? 1 : 0);
        try {
          localStorage.setItem(TODAY_KEY, getTodayKey());
          localStorage.setItem(SCORE_KEY, String(finalScore));
        } catch {}
        setNerveData(getNerveMastery());
        setScreen('results');
      } else {
        setQIdx(i => i + 1);
        setChosen(null);
      }
    }, 1400);
  }, [chosen, q, qIdx, questions, score]);

  const share = useCallback(() => {
    const finalScore = alreadyDoneToday ? prevScore : score;
    const pct = Math.round((finalScore / questions.length) * 100);
    const text = `Today's K53 Daily Diagnostic: ${finalScore}/${questions.length} (${pct}%) 🧠 ${streak > 1 ? `${streak}-day streak! ` : ''}k53drillmaster.co.za`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }, [alreadyDoneToday, prevScore, score, questions.length, streak]);

  // Find weakest + recommend
  const weakNerves = [...nerveData]
    .filter(n => n.answered > 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, 2);

  const displayScore = alreadyDoneToday ? prevScore : score;
  const pct = Math.round((displayScore / questions.length) * 100);

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {/* Header */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: 22 }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: T.fontSizeLg }}>📊 Daily Diagnostic</div>
          <div style={{ color: T.dim, fontSize: T.fontSize - 2 }}>
            {streak > 0 ? `🔥 ${streak}-day streak` : 'Start your streak today'}
          </div>
        </div>
        {screen === 'play' && (
          <span style={{ color: T.gold, fontWeight: 700 }}>Q{qIdx + 1}/10</span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Play */}
        {screen === 'play' && (
          <motion.div key={`q-${qIdx}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px' }}>
            {/* Nerve badge */}
            {(() => {
              const nerve = NERVES.find(n => n.id === q.nerve);
              return nerve ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${nerve.color}22`, border: `1px solid ${nerve.color}66`, borderRadius: 99, padding: '4px 12px', marginBottom: 16, color: nerve.color, fontWeight: 600, fontSize: T.fontSize - 2 }}>
                  {nerve.label}
                </div>
              ) : null;
            })()}

            {/* Progress */}
            <div style={{ height: 4, background: T.border, borderRadius: 99, marginBottom: 24 }}>
              <div style={{ height: '100%', width: `${(qIdx / 10) * 100}%`, background: T.green, borderRadius: 99, transition: 'width 0.3s' }} />
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

        {/* Results */}
        {screen === 'results' && (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px' }}>
            {/* SA stripe */}
            <div style={{ display: 'flex', height: 5, marginBottom: 24, borderRadius: 99, overflow: 'hidden' }}>
              {['#DE3831','#FFB612','#007A4D','#4472CA'].map(c => <div key={c} style={{ flex: 1, background: c }} />)}
            </div>

            {alreadyDoneToday && (
              <div style={{ background: `${T.gold}22`, border: `1px solid ${T.gold}66`, borderRadius: T.radius, padding: '10px 16px', marginBottom: 16, color: T.gold, fontWeight: 700, fontSize: T.fontSize - 1 }}>
                ✅ Today's diagnostic already done. Here are your overall nerve scores.
              </div>
            )}

            {/* Score */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 52, marginBottom: 4 }}>{pct >= 90 ? '🏆' : pct >= 75 ? '🥇' : pct >= 60 ? '🥈' : '📋'}</div>
              <div style={{ color: T.gold, fontWeight: 900, fontSize: T.fontSizeXxl }}>{pct}%</div>
              <div style={{ color: T.dim }}>Today's score: {displayScore}/10</div>
              {streak > 1 && <div style={{ color: '#FF6B35', fontWeight: 700, marginTop: 4 }}>🔥 {streak}-day streak!</div>}
            </div>

            {/* Nerve health */}
            <div style={{ background: T.surfaceAlt, borderRadius: T.radiusLg, padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 14, color: T.text }}>Nerve Health</div>
              {NERVES.map(nerve => {
                const nd = nerveData.find(n => n.id === nerve.id);
                return <NerveBar key={nerve.id} nerve={nerve} score={nd?.score || 0} answered={nd?.answered || 0} />;
              })}
            </div>

            {/* Recommendations */}
            {weakNerves.length > 0 && (
              <div style={{ background: T.surfaceAlt, borderRadius: T.radiusLg, padding: '14px 18px', marginBottom: 24, borderLeft: `4px solid ${T.gold}` }}>
                <div style={{ color: T.gold, fontWeight: 700, marginBottom: 8 }}>📌 Focus on these today:</div>
                {weakNerves.map(n => {
                  const nerve = NERVES.find(r => r.id === n.id);
                  return (
                    <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ color: nerve?.color || T.text, fontWeight: 600 }}>{nerve?.label || n.label}</span>
                      <span style={{ color: T.dim, fontSize: T.fontSize - 1 }}>{n.score}% accuracy</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={share}    style={{ background: T.green, color: '#fff', border: 'none', borderRadius: 99, padding: '12px 28px', cursor: 'pointer', fontWeight: 800, fontSize: T.fontSizeLg, fontFamily: T.font }}>📲 Share</button>
              <button onClick={onBack}   style={{ background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}`, borderRadius: 99, padding: '12px 28px', cursor: 'pointer', fontSize: T.fontSizeLg, fontFamily: T.font }}>← Home</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
