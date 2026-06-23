import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';
import { sfx } from '../utils/sounds.js';
import { getNerveMastery, recordAnswer, NERVES } from '../utils/masteryStore.js';

const hapticCorrect = () => { try { navigator.vibrate?.(30); } catch {} };
const hapticWrong   = () => { try { navigator.vibrate?.([60, 30, 60]); } catch {} };
const hapticPass    = () => { try { navigator.vibrate?.([60, 30, 60, 30, 60]); } catch {} };

const DRILL_Q = 10;

// ── Per-nerve question banks ──────────────────────────────────────────────────
const NERVE_QUESTIONS = {
  signs: [
    { q: 'A red octagonal sign means:', opts: ['Yield','Stop completely','No entry','Danger'], ans: 1 },
    { q: 'A yellow diamond sign indicates:', opts: ['Regulation','Warning','Guide','Prohibition'], ans: 1 },
    { q: 'A circular sign with a red border and diagonal bar is:', opts: ['Prohibition','Warning','Command','Information'], ans: 0 },
    { q: 'The yield sign shape is:', opts: ['Rectangle','Circle','Inverted triangle','Octagon'], ans: 2 },
    { q: 'A green rectangular sign is:', opts: ['Warning','Prohibition','Guidance/direction','Command'], ans: 2 },
    { q: 'A blue circle contains a:', opts: ['Warning','Prohibition','Positive instruction/command','Guide'], ans: 2 },
    { q: 'A "No entry" sign is:', opts: ['Red circle with white horizontal bar','Red octagon','Red triangle','Blue circle'], ans: 0 },
    { q: 'A white rectangular sign with a red border usually gives:', opts: ['Priority info','Prohibition','Speed limit','Parking rules'], ans: 2 },
    { q: 'A "Stop" sign has how many sides?', opts: ['6','7','8','4'], ans: 2 },
    { q: 'An inverted triangle with a red border means:', opts: ['Stop','Yield','No entry','Danger ahead'], ans: 1 },
    { q: 'A "No U-turn" sign is which shape?', opts: ['Octagon','Circle with a cross through the symbol','Triangle','Rectangle'], ans: 1 },
    { q: 'A warning sign on SA roads is typically:', opts: ['Round and blue','Diamond-shaped and yellow','Rectangular and green','Octagonal and red'], ans: 1 },
  ],
  rules: [
    { q: 'Speed limit in a built-up area:', opts: ['40 km/h','60 km/h','80 km/h','100 km/h'], ans: 1 },
    { q: 'Speed limit on a freeway:', opts: ['100 km/h','110 km/h','120 km/h','140 km/h'], ans: 2 },
    { q: 'Minimum following distance in good conditions:', opts: ['1 sec','2 sec','3 sec','4 sec'], ans: 1 },
    { q: 'Minimum following distance in wet conditions:', opts: ['1 sec','2 sec','3 sec','4 sec'], ans: 2 },
    { q: 'Blood alcohol limit for non-professional drivers:', opts: ['0.02 g/100ml','0.05 g/100ml','0.08 g/100ml','0.10 g/100ml'], ans: 1 },
    { q: 'Blood alcohol limit for professional (PDP) drivers:', opts: ['0.00 g/100ml','0.02 g/100ml','0.05 g/100ml','0.08 g/100ml'], ans: 1 },
    { q: 'At a 4-way stop with simultaneous arrivals, who yields?', opts: ['The vehicle from the left','The vehicle from the right','The largest vehicle','The last to arrive'], ans: 0 },
    { q: 'Emergency triangle must be placed at least ___ behind the vehicle:', opts: ['25 m','30 m','45 m','60 m'], ans: 2 },
    { q: 'You must park at least ___ from a pedestrian crossing:', opts: ['5 m','6 m','9 m','12 m'], ans: 2 },
    { q: 'You must park at least ___ from an intersection:', opts: ['3 m','5 m','9 m','12 m'], ans: 1 },
    { q: 'Amber traffic light means:', opts: ['Speed up to clear','Stop if you can safely do so','Always stop','Proceed with caution only'], ans: 1 },
    { q: 'Overtaking on the left is permitted when:', opts: ['Always','Never','In slow-moving queued traffic','On a one-way road only'], ans: 2 },
  ],
  controls: [
    { q: 'The clutch pedal is used to:', opts: ['Apply brakes','Engage/disengage the gearbox','Control throttle','Steer'], ans: 1 },
    { q: 'The accelerator controls:', opts: ['Speed only','Fuel mixture and engine speed','Braking force','Steering angle'], ans: 1 },
    { q: 'Minimum tyre tread depth in SA:', opts: ['0.5 mm','1 mm','1.6 mm','3 mm'], ans: 2 },
    { q: 'When do you use the handbrake while moving?', opts: ['Normal braking','Emergency if footbrake fails','Parking only','Downhill braking always'], ans: 1 },
    { q: 'A red engine warning light means:', opts: ['Service due','Stop safely and investigate immediately','Check tyre pressure','Low fuel'], ans: 1 },
    { q: 'Aquaplaning is most likely to occur when:', opts: ['Driving slowly on dry roads','Tyres are cold','Driving fast on wet roads with worn tyres','Using engine braking'], ans: 2 },
    { q: 'Hill start: what is the biting point?', opts: ['When the engine revs drop slightly as clutch meets gears','When the handbrake releases','When the vehicle starts rolling','When the engine stalls'], ans: 0 },
    { q: 'Seat belts must be worn by:', opts: ['Driver only','Front passengers only','All occupants where fitted','Children under 14 only'], ans: 2 },
    { q: 'The gear you use most when driving in city traffic:', opts: ['1st','2nd','3rd','4th'], ans: 2 },
    { q: 'What causes brake fade?', opts: ['Cold brakes','Wet conditions','Brakes overheating from prolonged use','Using engine braking'], ans: 2 },
    { q: 'Anti-lock braking system (ABS) helps by:', opts: ['Stopping you faster than normal brakes','Preventing wheels from locking during hard braking','Activating automatically on wet roads','Reducing stopping distance by 50%'], ans: 1 },
    { q: 'When reversing, you should look:', opts: ['Only in rear-view mirror','Out of the rear window and use all mirrors','Forward and reverse camera only','Only over your left shoulder'], ans: 1 },
  ],
  scenarios: [
    { q: 'You skid on a wet road. You should:', opts: ['Brake hard and steer hard','Lift off accelerator, steer into the skid','Accelerate out','Apply handbrake'], ans: 1 },
    { q: 'A vehicle ahead is turning right. You should:', opts: ['Overtake on the right','Wait behind or overtake on the left if safe','Hoot repeatedly','Flash high beams'], ans: 1 },
    { q: 'You see a child running toward the road. You should:', opts: ['Hoot and maintain speed','Slow down and be ready to stop','Sound hooter only','Increase speed to pass quickly'], ans: 1 },
    { q: 'Your vehicle catches fire. You should:', opts: ['Drive to the nearest garage','Pull over safely, switch off, get everyone out and move away','Open bonnet to check','Use fire extinguisher while driving'], ans: 1 },
    { q: 'An animal appears on the road at night. You should:', opts: ['Swerve sharply','Brake firmly while checking mirrors, sound hooter','Accelerate through','Flash high beams only'], ans: 1 },
    { q: 'You are dazzled by oncoming high beams. You should:', opts: ['Flash high beams back repeatedly','Look to the left edge of the road and reduce speed','Close your eyes briefly','Speed up to pass quickly'], ans: 1 },
    { q: 'Your tyres blow out at high speed. You should:', opts: ['Brake hard immediately','Hold steering firmly, lift off accelerator, steer straight, brake gently'], ans: 1 },
    { q: 'A drunk pedestrian stumbles onto the road. You should:', opts: ['Hoot and proceed','Reduce speed and be prepared to stop completely','Flash lights and maintain speed','Swerve around them at speed'], ans: 1 },
    { q: 'You are following a truck that suddenly brakes. You should:', opts: ['Rely on ABS and brake hard','Steer around it','If gap insufficient, brake hard and steer to shoulder if clear','Accelerate and swerve'], ans: 2 },
    { q: 'You miss your off-ramp on a freeway. You should:', opts: ['Reverse on the shoulder','Stop on the shoulder','Continue to the next exit','Do a U-turn'], ans: 2 },
    { q: 'You are fatigued on a long trip. You should:', opts: ['Open the window and continue','Stop at a safe place and rest','Drink coffee and push on','Increase speed to reach your destination sooner'], ans: 1 },
    { q: 'You arrive at a flooded road. You should:', opts: ['Drive slowly through it','Rev high and power through','Do not cross if depth is unknown','Drive on the shoulder around it'], ans: 2 },
  ],
  markings: [
    { q: 'A solid white line down the centre of the road means:', opts: ['You may cross to overtake','Do not cross — no overtaking permitted','Indicates the edge of the road','Pedestrian crossing ahead'], ans: 1 },
    { q: 'A broken white centre line means:', opts: ['No overtaking ever','Overtaking is permitted when safe','Emergency vehicles only','Lane ends'], ans: 1 },
    { q: 'A yellow centre line on a road means:', opts: ['No stopping allowed','Road works ahead','Marking separating opposing traffic flows (no crossing)','Parking permitted'], ans: 2 },
    { q: 'Hatched yellow diagonal lines on the road mean:', opts: ['Parking allowed','No stopping or parking — obstruction-free zone','Speed up','Lane merges'], ans: 1 },
    { q: 'A solid white line on the LEFT edge of a road indicates:', opts: ['The edge of the road — do not cross','Overtaking lane','Emergency stopping lane','Bus lane boundary'], ans: 0 },
    { q: 'A "Stop" line is:', opts: ['A broken yellow line','A solid white line across the lane at the stop sign','A red marking','Hatched diagonal lines'], ans: 1 },
    { q: 'Broken white lines across a lane with triangles pointing at you indicate:', opts: ['Stop line','Yield line — you must give way','Speed bump ahead','Pedestrian priority'], ans: 1 },
    { q: 'Chevrons (arrow markings) on the road indicate:', opts: ['Speed up','Turn lane direction','Merge lane direction or hazard in road ahead','Pedestrian area'], ans: 2 },
    { q: 'A zigzag white line near a crossing means:', opts: ['No overtaking in this area','No parking or stopping near the crossing','Speed bump zone','Loading zone'], ans: 1 },
    { q: 'Yellow kerb markings mean:', opts: ['Short-term parking allowed','Parking is prohibited at all times (continuous) or certain times','Emergency vehicles only','Loading zone'], ans: 1 },
    { q: 'A bus lane is marked in which colour?', opts: ['White only','Yellow on road and kerb markings','Blue','Red'], ans: 1 },
    { q: 'Double solid white lines mean:', opts: ['Overtaking permitted for both directions','No overtaking from either direction','One-way road','No stopping'], ans: 1 },
  ],
  practical: [
    { q: 'Before moving off from the kerb, you must:', opts: ['Hoot first','Check mirrors and blind spot, signal, move off safely','Move off and then signal','Signal and immediately move off'], ans: 1 },
    { q: 'During the yard test, the figure-of-8 requires:', opts: ['Reversing only','Driving forward only in a figure-of-8 pattern','Stopping at each corner','Smooth steering with no touches of the cones'], ans: 3 },
    { q: 'The alley docking manoeuvre involves:', opts: ['Parallel parking','Reversing into a marked bay between two bays','Three-point turn','Reversing into a loading bay (90°)'], ans: 3 },
    { q: 'During an emergency stop test, after stopping you should:', opts: ['Proceed immediately','Check mirrors, signal, and move off safely','Sound hooter','Reverse slightly'], ans: 1 },
    { q: 'A "critical error" during the road test results in:', opts: ['Loss of 5 points','Immediate test failure','A warning','Loss of 10 points'], ans: 1 },
    { q: 'The road test section for Code 8 requires a minimum score of:', opts: ['60% overall','75% in each section','80% overall','70% pass mark'], ans: 1 },
    { q: 'During a right turn, you should:', opts: ['Swing wide to the left first','Keep close to the centre line, turn into the closest right lane','Turn from the left lane','Sound hooter before turning'], ans: 1 },
    { q: 'A left turn should be made:', opts: ['From the right lane','Swinging wide right first','From the left lane, close to the kerb','From the centre of the road'], ans: 2 },
    { q: 'During the pre-inspection check you must verify:', opts: ['GPS is working','Tyres, lights, indicators, hooter, windscreen, wipers, seatbelts','Fuel level only','Engine oil only'], ans: 1 },
    { q: 'The learner\'s licence test Code 8 has how many questions?', opts: ['40','60','68','80'], ans: 2 },
    { q: 'A Code 10 licence allows you to drive:', opts: ['Motorcycles','Vehicles up to 3 500 kg','Heavy motor vehicles (trucks) above 3 500 kg','Buses only'], ans: 2 },
    { q: 'The pass mark per section of the learner\'s licence test is:', opts: ['70%','75%','80%','85%'], ans: 1 },
  ],
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDrill(nerveId, n) {
  const bank = NERVE_QUESTIONS[nerveId] || [];
  return shuffle(bank).slice(0, n);
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
