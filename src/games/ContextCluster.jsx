import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';
import { sfx } from '../utils/sounds.js';
import { recordAnswer } from '../utils/masteryStore.js';

const hapticCorrect = () => { try { navigator.vibrate?.(30); } catch {} };
const hapticWrong   = () => { try { navigator.vibrate?.([60, 30, 60]); } catch {} };
const hapticPass    = () => { try { navigator.vibrate?.([60, 30, 60, 30, 60]); } catch {} };

// ── Scenario clusters ─────────────────────────────────────────────────────────
// Each cluster sets a scene; every question is grounded in that exact scenario
const CLUSTERS = [
  {
    id: 'freeway_night',
    icon: '🌙',
    scenario: 'You are driving on the N2 freeway at 23:00. It is raining lightly. The road is wet and your visibility is reduced.',
    questions: [
      { q: 'What is the maximum speed limit on this road?', opts: ['100 km/h', '120 km/h', '60 km/h', '80 km/h'], ans: 1, nerve: 'rules' },
      { q: 'What following distance should you keep in these conditions?', opts: ['1 second', '2 seconds', '3 seconds', '4 seconds'], ans: 2, nerve: 'rules' },
      { q: 'Your headlights must illuminate how far ahead on main beam?', opts: ['45 m', '60 m', '90 m', '100 m'], ans: 3, nerve: 'rules' },
      { q: 'If your vehicle breaks down on the freeway, you must place the emergency triangle at least ___ behind the vehicle.', opts: ['25 m', '30 m', '45 m', '60 m'], ans: 2, nerve: 'rules' },
    ],
  },
  {
    id: 'intersection_yield',
    icon: '🛑',
    scenario: 'You arrive at a four-way stop at the same time as another vehicle approaching from your right.',
    questions: [
      { q: 'Who has right of way?', opts: ['You do — you were first', 'The vehicle on your right', 'The vehicle on your left', 'Neither — hoot and proceed'], ans: 1, nerve: 'rules' },
      { q: 'What must you do before proceeding?', opts: ['Hoot once and go', 'Come to a complete stop, then yield', 'Slow down and check', 'Flash your lights'], ans: 1, nerve: 'rules' },
      { q: 'The four-way stop sign consists of:', opts: ['A yield plate only', 'A stop sign with a "4 WAY" plate', 'A red circle', 'An octagon only'], ans: 1, nerve: 'signs' },
      { q: 'After stopping at the stop line, when may you proceed?', opts: ['Immediately after stopping', 'Only when all roads are clear', 'When it is safe to do so', 'After counting to three'], ans: 2, nerve: 'rules' },
    ],
  },
  {
    id: 'highway_merge',
    icon: '🛣️',
    scenario: 'You are joining a freeway via an on-ramp. Traffic on the freeway is moving at 110 km/h.',
    questions: [
      { q: 'Who must yield when joining the freeway?', opts: ['Traffic on the freeway', 'You, on the on-ramp', 'Larger vehicles only', 'No one — merge at will'], ans: 1, nerve: 'rules' },
      { q: 'What is the correct procedure before merging?', opts: ['Signal, match speed, check mirrors and blind spot, merge', 'Hoot and merge quickly', 'Stop and wait for a gap', 'Signal and stop'], ans: 0, nerve: 'rules' },
      { q: 'Flashing your high beams at a vehicle ahead signals:', opts: ['Move over — you want to pass', 'Danger ahead', 'Slow down', 'You are turning'], ans: 0, nerve: 'rules' },
      { q: 'When is it legal to overtake on the left (inside lane)?', opts: ['Never', 'When traffic is turning right', 'When the vehicle ahead signals left', 'When lanes are moving slowly in queues'], ans: 3, nerve: 'rules' },
    ],
  },
  {
    id: 'parking_zone',
    icon: '🅿️',
    scenario: 'You want to park in a residential street near an intersection.',
    questions: [
      { q: 'How far from an intersection must you park?', opts: ['3 m', '5 m', '9 m', '15 m'], ans: 1, nerve: 'rules' },
      { q: 'How far from a pedestrian crossing must you NOT park?', opts: ['5 m', '6 m', '9 m', '12 m'], ans: 2, nerve: 'rules' },
      { q: 'How far must you park from a fire hydrant?', opts: ['1 m', '1.5 m', '3 m', '5 m'], ans: 1, nerve: 'rules' },
      { q: 'You must park on which side of the road?', opts: ['Either side', 'Right side only', 'Left side in the direction of travel', 'Closest to your destination'], ans: 2, nerve: 'rules' },
    ],
  },
  {
    id: 'pedestrian_zone',
    icon: '🚶',
    scenario: 'You approach a marked pedestrian crossing. A pedestrian is waiting at the kerb.',
    questions: [
      { q: 'What must you do?', opts: ['Hoot to let them know you are passing', 'Slow down and be prepared to stop', 'Stop and allow the pedestrian to cross', 'Continue — they are not yet on the road'], ans: 2, nerve: 'rules' },
      { q: 'The sign warning of a pedestrian crossing ahead is:', opts: ['A red circle with a person', 'A yield triangle with a person', 'A yellow diamond with a person walking', 'A blue square'], ans: 2, nerve: 'signs' },
      { q: 'If a learner child is crossing, who must you yield to?', opts: ['Only if a school patrol officer is present', 'Only during school hours', 'Any pedestrian using a marked crossing', 'Emergency vehicles only'], ans: 2, nerve: 'rules' },
      { q: 'A pedestrian who is blind uses a white cane. You must:', opts: ['Hoot to alert them', 'Give them extra space and wait until they are safely across', 'Proceed carefully', 'Flash your lights'], ans: 1, nerve: 'rules' },
    ],
  },
  {
    id: 'alcohol_scenario',
    icon: '🍺',
    scenario: 'Your friend had two beers two hours ago. He says he feels fine and wants to drive his bakkie to a party.',
    questions: [
      { q: 'The legal blood alcohol limit for non-professional drivers is:', opts: ['0.02 g/100ml', '0.05 g/100ml', '0.08 g/100ml', '0.10 g/100ml'], ans: 1, nerve: 'rules' },
      { q: 'Your friend holds a PDP (professional driving permit). His legal BAC limit is:', opts: ['0.05 g/100ml', '0.03 g/100ml', '0.02 g/100ml', '0.00 g/100ml'], ans: 2, nerve: 'rules' },
      { q: 'Alcohol primarily affects driving by:', opts: ['Improving reaction time', 'Reducing judgement and reaction time', 'Sharpening focus', 'Improving night vision'], ans: 1, nerve: 'rules' },
      { q: 'If convicted of drunk driving, a driver may face:', opts: ['A warning only', 'A fine only', 'Imprisonment and/or a fine, plus licence suspension', 'Community service only'], ans: 2, nerve: 'rules' },
    ],
  },
  {
    id: 'vehicle_check',
    icon: '🔧',
    scenario: 'You are about to set off on a long road trip. You do a pre-trip check of your vehicle.',
    questions: [
      { q: 'Which of the following is a legal requirement before driving?', opts: ['Full tank of fuel', 'Working hooter, lights, wipers and brakes', 'Air conditioning', 'GPS navigation'], ans: 1, nerve: 'controls' },
      { q: 'Tyre tread depth must be at least:', opts: ['0.5 mm', '1 mm', '1.6 mm', '3 mm'], ans: 2, nerve: 'controls' },
      { q: 'You notice your brake warning light is on. You should:', opts: ['Drive slowly to the garage', 'Do not drive — have the brakes inspected immediately', 'Top up brake fluid and continue', 'Ignore it if brakes feel okay'], ans: 1, nerve: 'controls' },
      { q: 'Seat belts are required for:', opts: ['Front passengers only', 'The driver only', 'All occupants where fitted', 'Children under 12 only'], ans: 2, nerve: 'controls' },
    ],
  },
  {
    id: 'hazardous_weather',
    icon: '⛈️',
    scenario: 'You encounter heavy rain and strong winds on the N1. Visibility drops to 50 metres.',
    questions: [
      { q: 'Which lights should you use in these conditions?', opts: ['High beams only', 'Dipped headlights', 'Hazard lights only', 'No lights needed in rain'], ans: 1, nerve: 'rules' },
      { q: 'You should reduce speed because:', opts: ['It is the law to drive at 40 km/h in rain', 'Stopping distance increases on wet roads', 'Visibility is always zero in rain', 'Wipers reduce your forward view'], ans: 1, nerve: 'rules' },
      { q: 'Aquaplaning occurs when:', opts: ['Tyres grip the road extra firmly', 'A layer of water lifts the tyres off the road surface', 'The engine overheats in rain', 'Brakes become extra powerful'], ans: 1, nerve: 'controls' },
      { q: 'If your vehicle aquaplanes, you should:', opts: ['Brake hard and steer firmly', 'Lift off the accelerator gently and steer straight', 'Accelerate to push through the water', 'Apply the handbrake'], ans: 1, nerve: 'controls' },
    ],
  },
];

// ── Main component ─────────────────────────────────────────────────────────────
export default function ContextCluster({ onBack }) {
  const [clusterIdx, setClusterIdx]  = useState(() => Math.floor(Math.random() * CLUSTERS.length));
  const [qIdx, setQIdx]              = useState(0);
  const [chosen, setChosen]          = useState(null);
  const [results, setResults]        = useState([]);   // per-question: true/false
  const [screen, setScreen]          = useState('play'); // play | cluster-result | done
  const [totalScore, setTotalScore]  = useState(0);
  const [clustersPlayed, setClustersPlayed] = useState(0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const cluster = CLUSTERS[clusterIdx];
  const question = cluster.questions[qIdx];

  const handlePick = useCallback((optIdx) => {
    if (chosen !== null) return;
    setChosen(optIdx);
    const correct = optIdx === question.ans;
    if (correct) { sfx('correct'); hapticCorrect(); }
    else         { sfx('wrong'); hapticWrong(); }

    recordAnswer(question.nerve, `ctx-${cluster.id}-q${qIdx}`, correct);
    const newResults = [...results, correct];
    setResults(newResults);
    if (correct) setTotalScore(s => s + 1);

    setTimeout(() => {
      if (!isMounted.current) return;
      if (qIdx + 1 >= cluster.questions.length) {
        sfx('pass');
        hapticPass();
        setScreen('cluster-result');
      } else {
        setQIdx(i => i + 1);
        setChosen(null);
      }
    }, 1400);
  }, [chosen, question, cluster, qIdx, results]);

  const handleNextCluster = useCallback(() => {
    setClustersPlayed(c => c + 1);
    if (clustersPlayed + 1 >= CLUSTERS.length) {
      setScreen('done');
      return;
    }
    // pick next cluster not yet seen
    const next = (clusterIdx + 1) % CLUSTERS.length;
    setClusterIdx(next);
    setQIdx(0);
    setChosen(null);
    setResults([]);
    setScreen('play');
  }, [clustersPlayed, clusterIdx]);

  const handleRestart = useCallback(() => {
    setClusterIdx(Math.floor(Math.random() * CLUSTERS.length));
    setQIdx(0);
    setChosen(null);
    setResults([]);
    setTotalScore(0);
    setClustersPlayed(0);
    setScreen('play');
  }, []);

  const share = useCallback(() => {
    const total = CLUSTERS.reduce((s, c) => s + c.questions.length, 0);
    const pct   = Math.round((totalScore / total) * 100);
    const text  = `I scored ${totalScore}/${total} (${pct}%) on K53 Context Clusters — scenario-based driving questions! 🚗 k53drillmaster.co.za`;
    if (navigator.share) navigator.share({ text }).catch(() => {});
    else window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }, [totalScore]);

  const clusterScore  = results.filter(Boolean).length;
  const clusterTotal  = cluster.questions.length;
  const clusterPct    = clusterTotal > 0 ? Math.round((clusterScore / clusterTotal) * 100) : 0;
  const overallTotal  = CLUSTERS.reduce((s, c) => s + c.questions.length, 0);
  const overallPct    = overallTotal > 0 ? Math.round((totalScore / overallTotal) * 100) : 0;

  return (
    <div style={{ minHeight: '100dvh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {/* Header */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: 22 }}>←</button>
        <span style={{ fontWeight: 800, fontSize: T.fontSizeLg }}>🎭 Context Clusters</span>
        {screen === 'play' && (
          <span style={{ marginLeft: 'auto', color: T.gold, fontWeight: 700 }}>
            Q{qIdx + 1}/{clusterTotal} · Scene {clustersPlayed + 1}/{CLUSTERS.length}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* Play screen */}
        {screen === 'play' && (
          <motion.div key={`play-${clusterIdx}-${qIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px' }}>
            {/* Scenario context */}
            <div style={{
              background: T.surfaceAlt, borderRadius: T.radiusLg,
              padding: '14px 18px', marginBottom: 20,
              borderLeft: `4px solid ${T.gold}`,
            }}>
              <div style={{ color: T.gold, fontWeight: 700, marginBottom: 6, fontSize: T.fontSize - 1 }}>
                {cluster.icon} SCENARIO
              </div>
              <div style={{ color: T.text, lineHeight: 1.5 }}>{cluster.scenario}</div>
            </div>

            {/* Question */}
            <div style={{ fontWeight: 700, fontSize: T.fontSizeLg, marginBottom: 20, lineHeight: 1.4 }}>
              {question.q}
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {question.opts.map((opt, i) => {
                let bg = T.surfaceAlt;
                let border = T.border;
                let color = T.text;
                if (chosen !== null) {
                  if (i === question.ans) { bg = `${T.green}28`; border = T.green; color = T.green; }
                  else if (i === chosen)  { bg = `${T.red}28`;   border = T.red;   color = T.red; }
                }
                return (
                  <button key={i} onClick={() => handlePick(i)}
                    disabled={chosen !== null}
                    style={{
                      background: bg, border: `1.5px solid ${border}`, borderRadius: T.radius,
                      padding: '13px 16px', cursor: chosen === null ? 'pointer' : 'default',
                      fontFamily: T.font, fontSize: T.fontSize, color, textAlign: 'left',
                      lineHeight: 1.4, transition: 'background 0.15s',
                    }}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Cluster result */}
        {screen === 'cluster-result' && (
          <motion.div key="cluster-result" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            style={{ maxWidth: 440, margin: '0 auto', padding: '32px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 8 }}>
              {clusterPct === 100 ? '🏆' : clusterPct >= 75 ? '✅' : '📋'}
            </div>
            <div style={{ color: T.gold, fontWeight: 900, fontSize: T.fontSizeXxl, marginBottom: 4 }}>
              {clusterScore}/{clusterTotal}
            </div>
            <div style={{ color: T.dim, marginBottom: 8 }}>
              {cluster.icon} {cluster.scenario.slice(0, 60)}…
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
              {results.map((r, i) => (
                <div key={i} style={{ width: 28, height: 28, borderRadius: 99, background: r ? T.green : T.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
                  {r ? '✓' : '✗'}
                </div>
              ))}
            </div>
            <button onClick={handleNextCluster} style={{
              background: clustersPlayed + 1 >= CLUSTERS.length ? T.gold : T.green,
              color: '#fff', border: 'none', borderRadius: 99, padding: '13px 32px',
              cursor: 'pointer', fontWeight: 800, fontSize: T.fontSizeLg, fontFamily: T.font,
            }}>
              {clustersPlayed + 1 >= CLUSTERS.length ? '🏁 Final Score' : '➡️ Next Scenario'}
            </button>
          </motion.div>
        )}

        {/* Done */}
        {screen === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ maxWidth: 440, margin: '0 auto', padding: '32px 16px', textAlign: 'center' }}>
            <div style={{ display: 'flex', height: 5, marginBottom: 28, borderRadius: 99, overflow: 'hidden' }}>
              {['#DE3831','#FFB612','#007A4D','#4472CA'].map(c => <div key={c} style={{ flex: 1, background: c }} />)}
            </div>
            <div style={{ fontSize: 64, marginBottom: 10 }}>{overallPct >= 90 ? '🏆' : overallPct >= 75 ? '🥇' : overallPct >= 60 ? '🥈' : '📋'}</div>
            <div style={{ color: T.gold, fontWeight: 900, fontSize: T.fontSizeXxl, marginBottom: 4 }}>{overallPct}%</div>
            <div style={{ color: T.dim, marginBottom: 32 }}>{totalScore}/{overallTotal} questions across {CLUSTERS.length} scenarios</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={handleRestart} style={{ background: T.green, color: '#fff', border: 'none', borderRadius: 99, padding: '12px 28px', cursor: 'pointer', fontWeight: 800, fontSize: T.fontSizeLg, fontFamily: T.font }}>🔄 Again</button>
              <button onClick={share}         style={{ background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}`, borderRadius: 99, padding: '12px 28px', cursor: 'pointer', fontSize: T.fontSizeLg, fontFamily: T.font }}>📲 Share</button>
              <button onClick={onBack}        style={{ background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: T.fontSizeLg, fontFamily: T.font }}>← Home</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
