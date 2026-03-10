import { useState, useEffect } from 'react';
import { T } from '../theme.js';
import { getCategoryStats } from '../utils/progressHistory.js';
import { getDueIds } from '../utils/spacedRepetition.js';

const CATEGORY_LABELS = {
  road_rules:  '🚦 Road Rules',
  controls:    '🔩 Vehicle Controls',
  signs:       '🚧 Road Signs',
  pdp:         '🎓 PDP Prep',
  general:     '📚 General',
  legislation: '📋 Legislation',
  dangerous:   '☢️ Dangerous Goods',
  accidents:   '🚨 Accidents',
  vehicle:     '🔧 Vehicle Inspections',
  passengers:  '🚌 Passenger Safety',
  economy:     '⛽ Economical Driving',
};

// ── Pull weak questions from all question banks ───────────────────────────────
// Question pools per category — subset of hardest / most-failed questions
const WEAK_QUESTIONS = {
  road_rules: [
    { id: 'wr_rr01', q: 'At a four-way stop, two vehicles arrive simultaneously from opposite directions. Who has right of way?', options: ['The vehicle turning right','The vehicle going straight','They go at the same time','The heavier vehicle'], answer: 1, category: 'road_rules' },
    { id: 'wr_rr02', q: 'You approach a flashing red traffic light. What must you do?', options: ['Stop, then go when safe — treat as a stop sign','Slow down and proceed with caution','Wait until it turns green','Treat it as a green light'], answer: 0, category: 'road_rules' },
    { id: 'wr_rr03', q: 'A solid yellow centre line on your side means:', options: ['Overtaking is allowed for fast vehicles','You may NOT cross or straddle the line','Caution only — overtaking allowed','It is a no-stop zone'], answer: 1, category: 'road_rules' },
    { id: 'wr_rr04', q: 'What is the minimum following distance at 100 km/h on a dry road?', options: ['1 second','2 seconds','3 seconds','4 seconds'], answer: 2, category: 'road_rules' },
    { id: 'wr_rr05', q: 'On a freeway you must NOT make a U-turn because:', options: ['It is inconvenient','It is illegal and extremely dangerous','Only trucks may do so','It is permitted in an emergency'], answer: 1, category: 'road_rules' },
  ],
  controls: [
    { id: 'wr_ct01', q: 'What does a flashing battery warning light indicate?', options: ['Low fuel','Battery not charging / alternator fault','Overheating engine','Low oil pressure'], answer: 1, category: 'controls' },
    { id: 'wr_ct02', q: 'When should you NOT use cruise control?', options: ['On a long open highway','In light rain with good visibility','On wet, icy, or winding roads','During daytime driving'], answer: 2, category: 'controls' },
    { id: 'wr_ct03', q: 'ABS (Anti-lock Braking System) is most beneficial because it:', options: ['Stops the vehicle in a shorter distance on all surfaces','Maintains steering control during hard braking','Prevents all skids','Automatically brakes in an emergency'], answer: 1, category: 'controls' },
    { id: 'wr_ct04', q: 'Traction control (TCS) prevents:', options: ['Brake fade','Wheel spin during acceleration','Engine overheating','Brake locking during emergency stops'], answer: 1, category: 'controls' },
    { id: 'wr_ct05', q: 'Which light means stop the engine immediately?', options: ['Temperature gauge high','Oil pressure warning light','Battery warning light','Service reminder'], answer: 0, category: 'controls' },
    { id: 'wr_ct06', q: 'Cadence braking (without ABS) means:', options: ['Pressing the brake as hard as possible','Pumping the brake rapidly to prevent full lockup','Pressing the brake gently at all times','Holding the brake halfway down'], answer: 1, category: 'controls' },
  ],
  vehicle: [
    { id: 'wr_vi01', q: 'Before a trip, you notice one tyre looks low. You should:', options: ['Drive slowly to the nearest garage','Check the pressure and inflate to the correct PSI/kPa before driving','Ignore it if the car drives straight','Only check if the tyre is visibly flat'], answer: 1, category: 'vehicle' },
    { id: 'wr_vi02', q: 'A roadworthy certificate (RWC) is valid for:', options: ['1 year','6 months','Until the vehicle\'s next birthday','It never expires'], answer: 1, category: 'vehicle' },
    { id: 'wr_vi03', q: 'Shock absorbers that are worn affect:', options: ['Only ride comfort','Braking distance, handling and tyre contact with the road','Only tyre wear','Engine temperature'], answer: 1, category: 'vehicle' },
    { id: 'wr_vi04', q: 'When checking engine oil, the level should be:', options: ['At the MAX mark','Between MIN and MAX','Just above MIN','Just below MAX'], answer: 1, category: 'vehicle' },
    { id: 'wr_vi05', q: 'A cracked windscreen directly in the driver\'s line of vision:', options: ['Is acceptable if under 5 cm','Must be repaired or replaced before driving','Can be covered with tape','Is only an issue at night'], answer: 1, category: 'vehicle' },
  ],
  dangerous: [
    { id: 'wr_dg01', q: 'Which class covers toxic and infectious substances?', options: ['Class 4','Class 5','Class 6','Class 8'], answer: 2, category: 'dangerous' },
    { id: 'wr_dg02', q: 'Before loading dangerous goods, the driver must verify:', options: ['The delivery address only','Correct packing, labelling, placarding and documentation','The vehicle\'s insurance only','The receiver is available'], answer: 1, category: 'dangerous' },
    { id: 'wr_dg03', q: 'A segregation table tells you:', options: ['The best route to take','Which dangerous goods cannot be loaded together','How to label the vehicle','Maximum load weight'], answer: 1, category: 'dangerous' },
  ],
  accidents: [
    { id: 'wr_ac01', q: 'The correct compression rate for adult CPR is:', options: ['60/min','80/min','100–120/min','140/min'], answer: 2, category: 'accidents' },
    { id: 'wr_ac02', q: 'You must report an accident involving injury to police within:', options: ['24 hours','48 hours','7 days','30 days'], answer: 0, category: 'accidents' },
    { id: 'wr_ac03', q: 'The recovery position is used for a patient who is:', options: ['Conscious and walking','Unconscious but breathing','Not breathing','In shock with a suspected spinal injury'], answer: 1, category: 'accidents' },
  ],
  passengers: [
    { id: 'wr_ps01', q: 'School learners may be transported at a maximum speed of:', options: ['80 km/h','100 km/h','60 km/h','120 km/h'], answer: 2, category: 'passengers' },
    { id: 'wr_ps02', q: 'A bus first-aid kit is required when carrying more than how many passengers?', options: ['8','12','16','20'], answer: 2, category: 'passengers' },
  ],
  economy: [
    { id: 'wr_ec01', q: 'Aerodynamic drag increases at a rate proportional to speed:', options: ['Linearly','Squared','Cubed','Square root'], answer: 1, category: 'economy' },
    { id: 'wr_ec02', q: 'Which saves more fuel on a long downhill road?', options: ['Neutral and coast','Engine braking in highest appropriate gear','Applying brakes continuously','Switching off the engine'], answer: 1, category: 'economy' },
  ],
};

// Flatten all weak questions into one pool
const ALL_WEAK = Object.values(WEAK_QUESTIONS).flat();

function getWeakPool(catStats) {
  if (catStats.length === 0) return ALL_WEAK;

  // Prioritise questions from categories where accuracy < 70%
  const weakCats = new Set(catStats.filter(c => c.pct < 70).map(c => c.category));

  // Also include spaced-repetition due cards (by id prefix)
  const dueIds = new Set(getDueIds());

  const priority = ALL_WEAK.filter(q => weakCats.has(q.category) || dueIds.has(q.id));
  return priority.length >= 5 ? priority : ALL_WEAK;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function WeakSpotsReview({ onBack }) {
  const [catStats, setCatStats]   = useState([]);
  const [screen, setScreen]       = useState('summary'); // summary | quiz | done
  const [pool, setPool]           = useState([]);
  const [qIndex, setQIndex]       = useState(0);
  const [selected, setSelected]   = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [results, setResults]     = useState([]); // { q, correct }

  useEffect(() => {
    const stats = getCategoryStats();
    setCatStats(stats);
  }, []);

  const startDrill = () => {
    const q = getWeakPool(catStats).sort(() => Math.random() - 0.5).slice(0, 15);
    setPool(q);
    setQIndex(0);
    setSelected(null);
    setConfirmed(false);
    setResults([]);
    setScreen('quiz');
  };

  const handleConfirm = () => {
    if (selected === null) return;
    setConfirmed(true);
    const q = pool[qIndex];
    setResults(r => [...r, { q, correct: selected === q.answer }]);
  };

  const handleNext = () => {
    if (qIndex + 1 < pool.length) {
      setQIndex(i => i + 1);
      setSelected(null);
      setConfirmed(false);
    } else {
      setScreen('done');
    }
  };

  // ── Summary screen ──────────────────────────────────────────────────────────
  if (screen === 'summary') {
    const weak = catStats.filter(c => c.pct < 70 && c.total >= 3);
    const ok   = catStats.filter(c => c.pct >= 70);

    return (
      <div style={{ minHeight: '100vh', background: T.surface, color: T.text, fontFamily: T.font, fontSize: T.fontSize }}>
        <div style={{ background: '#1a1a2e', padding: '20px 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.text, fontSize: 22, cursor: 'pointer' }}>←</button>
            <div style={{ fontWeight: 700, fontSize: T.fontSizeXl }}>Weak Spots Review</div>
          </div>
          <div style={{ color: T.dim, fontSize: T.fontSize - 1, paddingLeft: 34 }}>
            Targeted drills on your weakest categories
          </div>
        </div>

        <div style={{ padding: 20 }}>
          {catStats.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: T.dim }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
              <div style={{ fontSize: T.fontSizeLg, fontWeight: 600, marginBottom: 8 }}>No data yet</div>
              <div>Answer some questions first — then come back here to drill your weak spots.</div>
            </div>
          ) : (
            <>
              {weak.length > 0 && (
                <>
                  <div style={{ fontWeight: 600, fontSize: T.fontSizeLg, color: '#DE3831', marginBottom: 12 }}>
                    ⚠️ Needs Attention ({weak.length})
                  </div>
                  {weak.map(stat => (
                    <div key={stat.category} style={{ background: '#2a0a0a', border: '1px solid #DE383144', borderRadius: 12, padding: '12px 16px', marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: T.fontSizeLg }}>{CATEGORY_LABELS[stat.category] || stat.category}</span>
                        <span style={{ fontWeight: 700, color: '#DE3831', fontSize: T.fontSizeLg }}>{stat.pct}%</span>
                      </div>
                      <div style={{ background: T.border, borderRadius: 99, height: 6 }}>
                        <div style={{ background: '#DE3831', borderRadius: 99, height: 6, width: `${stat.pct}%` }} />
                      </div>
                      <div style={{ fontSize: T.fontSize - 2, color: T.dim, marginTop: 5 }}>
                        {stat.correct}/{stat.total} correct · Need 70%+ to pass this threshold
                      </div>
                    </div>
                  ))}
                </>
              )}

              {ok.length > 0 && (
                <>
                  <div style={{ fontWeight: 600, fontSize: T.fontSizeLg, color: '#007A4D', marginBottom: 12, marginTop: weak.length > 0 ? 20 : 0 }}>
                    ✅ Looking Good ({ok.length})
                  </div>
                  {ok.map(stat => (
                    <div key={stat.category} style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: '12px 16px', marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600 }}>{CATEGORY_LABELS[stat.category] || stat.category}</span>
                        <span style={{ fontWeight: 700, color: '#007A4D' }}>{stat.pct}%</span>
                      </div>
                    </div>
                  ))}
                </>
              )}

              <button onClick={startDrill}
                style={{ width: '100%', marginTop: 24, background: '#DE3831', color: '#fff', border: 'none', borderRadius: 12, padding: 16, fontWeight: 700, fontSize: T.fontSizeLg, cursor: 'pointer' }}>
                {weak.length > 0 ? `🎯 Drill Weak Spots (${Math.min(15, getWeakPool(catStats).length)} questions)` : '🎯 Practice All Categories'}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Done screen ─────────────────────────────────────────────────────────────
  if (screen === 'done') {
    const correct = results.filter(r => r.correct).length;
    const pct = Math.round((correct / results.length) * 100);
    const missed = results.filter(r => !r.correct);

    return (
      <div style={{ minHeight: '100vh', background: T.surface, color: T.text, fontFamily: T.font, fontSize: T.fontSize, padding: 20, paddingBottom: 60 }}>
        <div style={{ textAlign: 'center', padding: '24px 0 20px' }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>{pct >= 80 ? '🎯' : '📖'}</div>
          <div style={{ fontWeight: 700, fontSize: T.fontSizeHeading }}>{correct}/{results.length}</div>
          <div style={{ color: pct >= 80 ? '#007A4D' : '#FFB612', fontWeight: 600, fontSize: T.fontSizeXl, marginTop: 4 }}>{pct}%</div>
          <div style={{ color: T.dim, marginTop: 6 }}>{pct >= 80 ? 'Great drill session!' : 'Keep reviewing — you\'re improving!'}</div>
        </div>

        {missed.length > 0 && (
          <>
            <div style={{ fontWeight: 600, fontSize: T.fontSizeLg, marginBottom: 12, color: '#DE3831' }}>
              Review Missed Questions ({missed.length})
            </div>
            {missed.map(({ q }) => (
              <div key={q.id} style={{ background: '#2a0a0a', border: '1px solid #DE383133', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
                <div style={{ fontWeight: 500, marginBottom: 10, lineHeight: 1.45 }}>{q.q}</div>
                <div style={{ background: '#003d22', border: '1px solid #007A4D', borderRadius: 8, padding: '10px 12px', color: '#4ade80', fontWeight: 600 }}>
                  ✅ {q.options[q.answer]}
                </div>
                <div style={{ fontSize: T.fontSize - 2, color: T.dim, marginTop: 6 }}>
                  {CATEGORY_LABELS[q.category] || q.category}
                </div>
              </div>
            ))}
          </>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button onClick={startDrill}
            style={{ flex: 1, background: '#DE3831', color: '#fff', border: 'none', borderRadius: 12, padding: 14, fontWeight: 700, fontSize: T.fontSizeLg, cursor: 'pointer' }}>
            Drill Again
          </button>
          <button onClick={() => setScreen('summary')}
            style={{ flex: 1, background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}`, borderRadius: 12, padding: 14, fontWeight: 700, fontSize: T.fontSizeLg, cursor: 'pointer' }}>
            Back
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz ────────────────────────────────────────────────────────────────────
  const q = pool[qIndex];

  return (
    <div style={{ minHeight: '100vh', background: T.surface, color: T.text, fontFamily: T.font, fontSize: T.fontSize }}>
      <div style={{ background: '#1a1a2e', padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: T.fontSizeLg }}>🎯 Weak Spots Drill</div>
            <div style={{ color: '#FFB612', fontSize: T.fontSize - 1 }}>{CATEGORY_LABELS[q?.category] || q?.category}</div>
          </div>
          <div style={{ color: T.dim, fontSize: T.fontSize }}>{qIndex + 1} / {pool.length}</div>
        </div>
        <div style={{ background: T.border, borderRadius: 99, height: 5 }}>
          <div style={{ background: '#DE3831', borderRadius: 99, height: 5, width: `${((qIndex + 1) / pool.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>
      </div>

      <div style={{ padding: 20 }}>
        <div style={{ background: T.surfaceAlt, borderRadius: T.radiusLg, padding: 18, marginBottom: 18, lineHeight: 1.55, fontWeight: 500, fontSize: T.fontSizeLg }}>
          {q?.q}
        </div>

        {q?.options.map((opt, idx) => {
          let bg = T.surfaceAlt, border = T.border, color = T.text;
          if (selected === idx && !confirmed)   { bg = '#1a1a2e'; border = '#FFB612'; color = '#FFB612'; }
          if (confirmed && idx === q.answer)     { bg = '#003d22'; border = '#007A4D'; color = '#4ade80'; }
          if (confirmed && selected === idx && idx !== q.answer) { bg = '#3d0000'; border = '#DE3831'; color = '#f87171'; }

          return (
            <button key={idx} onClick={() => { if (!confirmed) setSelected(idx); }}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: bg, border: `2px solid ${border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 10, cursor: confirmed ? 'default' : 'pointer', color, fontSize: T.fontSizeLg, lineHeight: 1.4, transition: 'all 0.15s', fontFamily: T.font }}>
              <span style={{ fontWeight: 700, marginRight: 8 }}>{String.fromCharCode(65 + idx)}.</span>{opt}
            </button>
          );
        })}

        {!confirmed ? (
          <button onClick={handleConfirm} disabled={selected === null}
            style={{ width: '100%', background: selected === null ? T.border : '#DE3831', color: selected === null ? T.dim : '#fff', border: 'none', borderRadius: 12, padding: 16, fontWeight: 700, fontSize: T.fontSizeLg, cursor: selected === null ? 'not-allowed' : 'pointer', marginTop: 4, fontFamily: T.font }}>
            Confirm Answer
          </button>
        ) : (
          <button onClick={handleNext}
            style={{ width: '100%', background: '#007A4D', color: '#fff', border: 'none', borderRadius: 12, padding: 16, fontWeight: 700, fontSize: T.fontSizeLg, cursor: 'pointer', fontFamily: T.font }}>
            {qIndex + 1 < pool.length ? 'Next →' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  );
}
