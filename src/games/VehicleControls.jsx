import { useState, useEffect, useRef, useCallback } from 'react';
import { T } from '../theme.js';
import { recordResult } from '../utils/progressHistory.js';
import { recordAnswer } from '../utils/spacedRepetition.js';
import { prepareAll } from '../utils/quizHelpers.js';

// ── Question bank ─────────────────────────────────────────────────────────────
// Covers lights, wipers, bonnet/boot checks, instrument panel, brakes,
// steering — all the hands-on controls tested in the K53 exam.
const QUESTIONS = [
  // ── Lights ────────────────────────────────────────────────────────────────
  { id: 'vc01', cat: 'Lights', q: 'When must you switch on your headlights?', options: ['Only when it is completely dark','30 minutes after sunset until 30 minutes before sunrise, and when visibility is poor','Only at night after 21:00','Only in a tunnel'], answer: 1 },
  { id: 'vc02', cat: 'Lights', q: 'What do you use fog lights for?', options: ['Whenever it is dark','Only when visibility is seriously reduced by fog, mist or rain','As an alternative to headlights','To signal you want to overtake'], answer: 1 },
  { id: 'vc03', cat: 'Lights', q: 'When must you switch from high beam to low beam?', options: ['Only when another driver flashes you','When approaching oncoming traffic and when following another vehicle closely','On any road with street lighting','After 22:00'], answer: 1 },
  { id: 'vc04', cat: 'Lights', q: 'What does a flashing amber warning light on a stationary vehicle mean?', options: ['The vehicle is about to turn','The vehicle is a hazard — proceed with caution','The driver is lost','The vehicle is police'], answer: 1 },
  { id: 'vc05', cat: 'Lights', q: 'Parking lights are used to:', options: ['Illuminate the road ahead','Mark a parked vehicle in low visibility — they are NOT for driving','Replace headlights in fog','Replace indicators'], answer: 1 },
  { id: 'vc06', cat: 'Lights', q: 'A broken tail light means:', options: ['You must drive only in daytime','You must repair it before driving at night — other drivers cannot see you','It is a minor issue, drive carefully','Only applies to trucks'], answer: 1 },

  // ── Wipers & washers ─────────────────────────────────────────────────────
  { id: 'vc07', cat: 'Wipers', q: 'When should you use your windscreen washers?', options: ['Only in heavy rain','Whenever the windscreen is dirty and reducing visibility','Only when wipers are on','Once a week as maintenance'], answer: 1 },
  { id: 'vc08', cat: 'Wipers', q: 'Worn wiper blades are dangerous because they:', options: ['Make noise','Leave streaks that reduce visibility, especially at night','Scratch the windscreen slightly','Use more battery power'], answer: 1 },
  { id: 'vc09', cat: 'Wipers', q: 'You should use rear window wipers when:', options: ['It is raining lightly','Rear window visibility is impaired by rain, mist or dirt','Only on motorways','They come on automatically'], answer: 1 },

  // ── Instrument panel ─────────────────────────────────────────────────────
  { id: 'vc10', cat: 'Instruments', q: 'A red temperature warning light means:', options: ['The heater is on','The engine is critically overheating — stop safely immediately','You need more coolant next service','Normal warm-up'], answer: 1 },
  { id: 'vc11', cat: 'Instruments', q: 'The oil pressure warning light means:', options: ['Oil change is due','Critical oil pressure loss — stop and switch off the engine immediately','Low oil level only','Normal at start-up for a few seconds then should go out'], answer: 3 },
  { id: 'vc12', cat: 'Instruments', q: 'What does the ABS warning light staying on mean?', options: ['ABS is active and working','ABS system fault — normal brakes still work but ABS may be disabled','Low brake fluid','Brake pads worn'], answer: 1 },
  { id: 'vc13', cat: 'Instruments', q: 'A flashing engine management light (check engine) means:', options: ['Immediate stop required','A fault is active — have it checked soon','Oil needs topping up','Normal on cold mornings'], answer: 1 },
  { id: 'vc14', cat: 'Instruments', q: 'The speedometer must be in working order because:', options: ['It is nice to have','Drivers cannot maintain legal speeds without it','Police require it','Insurance demands it'], answer: 1 },
  { id: 'vc15', cat: 'Instruments', q: 'Fuel gauge at empty means:', options: ['You have approximately 50 km left always','You may run out of fuel soon and should stop at the next filling station','The gauge is broken, carry on','Only an issue on a highway'], answer: 1 },

  // ── Bonnet & boot ─────────────────────────────────────────────────────────
  { id: 'vc16', cat: 'Bonnet & Boot', q: 'You must check the engine oil:', options: ['Only at service intervals','Before long trips and periodically — engine cold or warm as per the manual','Only when the light comes on','Never yourself — only a mechanic'], answer: 1 },
  { id: 'vc17', cat: 'Bonnet & Boot', q: 'If coolant is needed, you should:', options: ['Add any water immediately','Wait for the engine to cool completely before opening the radiator cap','Open the cap carefully while hot','Ignore it until the next service'], answer: 1 },
  { id: 'vc18', cat: 'Bonnet & Boot', q: 'The spare tyre in the boot must be:', options: ['Flat — to save space','Inflated to the correct pressure and in good condition','Only checked at a tyre shop','Present but not necessarily roadworthy'], answer: 1 },
  { id: 'vc19', cat: 'Bonnet & Boot', q: 'A warning triangle in the boot is:', options: ['Optional for private vehicles','Legally required — must be placed behind the vehicle in a breakdown','Only for commercial vehicles','Useful but not required'], answer: 1 },

  // ── Brakes ────────────────────────────────────────────────────────────────
  { id: 'vc20', cat: 'Brakes', q: 'A spongy or low brake pedal usually means:', options: ['Normal for an old car','Air in the brake lines or low brake fluid — get it checked immediately','Brakes are overheating','The car needs wheel alignment'], answer: 1 },
  { id: 'vc21', cat: 'Brakes', q: 'When parking on a hill you must apply:', options: ['Footbrake only','Handbrake AND leave in gear (manual) or Park (auto)','Footbrake only if steep','Neither if the road is paved'], answer: 1 },
  { id: 'vc22', cat: 'Brakes', q: 'Brake fade on a long downhill is caused by:', options: ['Low fuel','Brakes overheating from prolonged use — use engine braking to prevent it','Wet roads','Cold weather'], answer: 1 },
  { id: 'vc23', cat: 'Brakes', q: 'If your brakes feel less effective in heavy rain, this is because:', options: ['Nothing — brakes work the same when wet','Water reduces friction in the brake pads temporarily','Your brake fluid is leaking','The ABS is activating'], answer: 1 },

  // ── Steering & vision ─────────────────────────────────────────────────────
  { id: 'vc24', cat: 'Steering', q: 'Excessive steering wheel play (before wheels respond) indicates:', options: ['Normal for older vehicles','Wear in steering components — must be checked by a mechanic','Power steering running low','Wheel alignment only'], answer: 1 },
  { id: 'vc25', cat: 'Steering', q: 'Before moving off, you should check mirrors in which order?', options: ['Left, right, left','Interior mirror, right side mirror, left side mirror, over shoulder','Right, left, right','Side mirrors only'], answer: 1 },
  { id: 'vc26', cat: 'Steering', q: 'Adjusting your seat before driving is important because:', options: ['It is a comfort preference only','You must be able to reach all controls, see over the steering wheel and use pedals fully','It is required by law','Only matters for long trips'], answer: 1 },
  { id: 'vc27', cat: 'Steering', q: 'A vibrating steering wheel at high speed usually indicates:', options: ['Normal','Tyre imbalance or worn suspension — have it checked','Engine misfiring','Low fuel'], answer: 1 },

  // ── Seatbelts ─────────────────────────────────────────────────────────────
  { id: 'vc28', cat: 'Seatbelts', q: 'Who is responsible for ensuring all passengers under 14 are belted?', options: ['The passengers themselves','The driver','The vehicle owner','Only the parent in the vehicle'], answer: 1 },
  { id: 'vc29', cat: 'Seatbelts', q: 'A seat belt must be worn:', options: ['Only on freeways','At all times in a moving vehicle where one is fitted','Only by the driver','Only over 80 km/h'], answer: 1 },
  { id: 'vc30', cat: 'Seatbelts', q: 'Wearing a seatbelt incorrectly (e.g. under the arm) is:', options: ['Acceptable if more comfortable','Dangerous — reduces protection and is still an offence','Legal in SA','Only an issue in a head-on collision'], answer: 1 },
];

const CATEGORIES = [...new Set(QUESTIONS.map(q => q.cat))];

// ── Component ─────────────────────────────────────────────────────────────────
export default function VehicleControls({ onBack, onPass }) {
  const [screen, setScreen]     = useState('menu'); // menu | quiz | result
  const [mode, setMode]         = useState(null);   // 'all' | category name
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex]     = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [correct, setCorrect]   = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [history, setHistory]   = useState({}); // id → 'correct' | 'wrong'
  const timerRef = useRef(null);
  const passedFiredRef = useRef(false);

  // Timer with cleanup
  useEffect(() => {
    if (screen !== 'quiz' || confirmed) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setConfirmed(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, qIndex, confirmed]);

  const startQuiz = useCallback((selectedMode) => {
    const pool = selectedMode === 'all'
      ? [...QUESTIONS]
      : QUESTIONS.filter(q => q.cat === selectedMode);
    const shuffled = prepareAll(pool.sort(() => Math.random() - 0.5));
    setMode(selectedMode);
    setQuestions(shuffled);
    setQIndex(0);
    setSelected(null);
    setConfirmed(false);
    setCorrect(0);
    setTimeLeft(20);
    setScreen('quiz');
  }, []);

  const handleConfirm = () => {
    if (selected === null) return;
    clearInterval(timerRef.current);
    setConfirmed(true);
    const q = questions[qIndex];
    const isCorrect = selected === q.answer;
    if (isCorrect) setCorrect(c => c + 1);
    recordResult(isCorrect, 'controls');
    recordAnswer(q.id, isCorrect);
    setHistory(h => ({ ...h, [q.id]: isCorrect ? 'correct' : 'wrong' }));
  };

  const handleNext = () => {
    if (qIndex + 1 < questions.length) {
      setQIndex(i => i + 1);
      setSelected(null);
      setConfirmed(false);
      setTimeLeft(20);
    } else {
      setScreen('result');
    }
  };

  const q = questions[qIndex];

  // ── Menu ───────────────────────────────────────────────────────────────────
  if (screen === 'menu') {
    return (
      <div style={{ minHeight: '100vh', background: T.surface, color: T.text, fontFamily: T.font, fontSize: T.fontSize, paddingBottom: 60 }}>
        <div style={{ background: '#1a1a2e', padding: '20px 20px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.text, fontSize: 22, cursor: 'pointer' }}>←</button>
            <div>
              <div style={{ fontWeight: 700, fontSize: T.fontSizeXl }}>Vehicle Controls Test</div>
              <div style={{ color: T.dim, fontSize: T.fontSize - 1, marginTop: 1 }}>{QUESTIONS.length} questions · 20 sec each</div>
            </div>
          </div>
        </div>

        <div style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, fontSize: T.fontSizeLg, marginBottom: 14 }}>Choose Mode</div>

          {/* Full test */}
          <div onClick={() => startQuiz('all')}
            style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)', border: `1px solid #FFB61244`, borderRadius: T.radiusLg, padding: '18px 18px', marginBottom: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}
            onMouseEnter={e => e.currentTarget.style.opacity = 0.85}
            onMouseLeave={e => e.currentTarget.style.opacity = 1}
          >
            <span style={{ fontSize: 34 }}>🔩</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: T.fontSizeXl, color: T.gold }}>Full Controls Test</div>
              <div style={{ color: T.dim, fontSize: T.fontSize - 1, marginTop: 3 }}>All {QUESTIONS.length} questions — covers everything</div>
            </div>
            <span style={{ color: T.dim, fontSize: 20 }}>›</span>
          </div>

          {/* By category */}
          <div style={{ fontWeight: 600, fontSize: T.fontSize, color: T.dim, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>By Category</div>
          {CATEGORIES.map(cat => {
            const catQs = QUESTIONS.filter(q => q.cat === cat);
            return (
              <div key={cat} onClick={() => startQuiz(cat)}
                style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                onMouseEnter={e => e.currentTarget.style.opacity = 0.85}
                onMouseLeave={e => e.currentTarget.style.opacity = 1}
              >
                <span style={{ fontWeight: 600, fontSize: T.fontSizeLg, flex: 1 }}>{cat}</span>
                <span style={{ color: T.dim, fontSize: T.fontSize - 1 }}>{catQs.length} questions</span>
                <span style={{ color: T.dim, fontSize: 18, marginLeft: 6 }}>›</span>
              </div>
            );
          })}

          {/* Study tip */}
          <div style={{ background: T.surfaceAlt, borderRadius: 12, padding: '14px 16px', marginTop: 8, fontSize: T.fontSize - 1, color: T.dim, lineHeight: 1.55 }}>
            💡 <strong style={{ color: T.text }}>K53 Tip:</strong> During the test, the examiner will ask you to locate and operate specific controls without looking down. Practice finding each control with your eyes closed.
          </div>
        </div>
      </div>
    );
  }

  // ── Result ─────────────────────────────────────────────────────────────────
  if (screen === 'result') {
    const pct = Math.round((correct / questions.length) * 100);
    const passed = pct >= 80;
    if (passed && !passedFiredRef.current) { passedFiredRef.current = true; onPass?.(); }
    const missed = questions.filter(q => history[q.id] === 'wrong');

    return (
      <div style={{ minHeight: '100vh', background: T.surface, color: T.text, fontFamily: T.font, fontSize: T.fontSize, paddingBottom: 60 }}>
        <div style={{ textAlign: 'center', padding: '32px 20px 20px' }}>
          <div style={{ fontSize: 60, marginBottom: 10 }}>{passed ? '✅' : '📖'}</div>
          <div style={{ fontWeight: 700, fontSize: T.fontSizeHeading }}>{correct}/{questions.length}</div>
          <div style={{ color: passed ? '#007A4D' : '#DE3831', fontWeight: 600, fontSize: T.fontSizeXl, marginTop: 4 }}>{pct}%</div>
          <div style={{ color: T.dim, marginTop: 8, fontSize: T.fontSize }}>{passed ? 'Solid knowledge of vehicle controls!' : 'Keep practising — aim for 80%'}</div>
        </div>

        {missed.length > 0 && (
          <div style={{ padding: '0 20px' }}>
            <div style={{ fontWeight: 600, fontSize: T.fontSizeLg, color: '#DE3831', marginBottom: 12 }}>
              Review Missed ({missed.length})
            </div>
            {missed.map(q => (
              <div key={q.id} style={{ background: '#2a0a0a', border: '1px solid #DE383133', borderRadius: 12, padding: '14px 16px', marginBottom: 10 }}>
                <div style={{ fontSize: T.fontSize - 2, color: T.dim, marginBottom: 6 }}>{q.cat}</div>
                <div style={{ fontWeight: 500, marginBottom: 10, lineHeight: 1.45, fontSize: T.fontSizeLg }}>{q.q}</div>
                <div style={{ background: '#003d22', borderRadius: 8, padding: '10px 12px', color: '#4ade80', fontWeight: 600, fontSize: T.fontSizeLg }}>
                  ✅ {q.options[q.answer]}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: '16px 20px 0', display: 'flex', gap: 10 }}>
          <button onClick={() => startQuiz(mode)}
            style={{ flex: 1, background: '#FFB612', color: '#1a1a2e', border: 'none', borderRadius: 12, padding: 14, fontWeight: 700, fontSize: T.fontSizeLg, cursor: 'pointer', fontFamily: T.font }}>
            Retry
          </button>
          <button onClick={() => setScreen('menu')}
            style={{ flex: 1, background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}`, borderRadius: 12, padding: 14, fontWeight: 700, fontSize: T.fontSizeLg, cursor: 'pointer', fontFamily: T.font }}>
            Back
          </button>
        </div>
      </div>
    );
  }

  // ── Quiz ───────────────────────────────────────────────────────────────────
  const timerColor = timeLeft > 10 ? '#007A4D' : timeLeft > 5 ? '#FFB612' : '#DE3831';

  return (
    <div style={{ minHeight: '100vh', background: T.surface, color: T.text, fontFamily: T.font, fontSize: T.fontSize }}>
      <div style={{ background: '#1a1a2e', padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: T.fontSizeLg }}>🔩 {q?.cat}</div>
            <div style={{ color: '#FFB612', fontSize: T.fontSize - 1 }}>Q{qIndex + 1}/{questions.length}</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: timerColor }}>{timeLeft}s</div>
        </div>
        <div style={{ background: T.border, borderRadius: 99, height: 6 }}>
          <div style={{ background: timerColor, borderRadius: 99, height: 6, width: `${(timeLeft / 20) * 100}%`, transition: 'width 1s linear' }} />
        </div>
      </div>

      <div style={{ padding: 20 }}>
        <div style={{ background: "rgba(255,182,18,0.07)", border: "1px solid rgba(255,182,18,0.22)", borderRadius: T.radiusLg, padding: 18, marginBottom: 18, lineHeight: 1.55, fontWeight: 500, fontSize: T.fontSizeXl, color: "#F0E8C8" }}>
          {q?.q}
        </div>

        {q?.options.map((opt, idx) => {
          let bg = T.surfaceAlt, border = T.border, color = T.text;
          if (selected === idx && !confirmed)   { bg = '#1a1a2e'; border = '#FFB612'; color = '#FFB612'; }
          if (confirmed && idx === q.answer)     { bg = '#003d22'; border = '#007A4D'; color = '#4ade80'; }
          if (confirmed && selected === idx && idx !== q.answer) { bg = '#3d0000'; border = '#DE3831'; color = '#f87171'; }
          if (confirmed && timeLeft === 0 && selected === null && idx === q.answer) { bg = '#003d22'; border = '#007A4D'; color = '#4ade80'; }

          return (
            <button key={idx} onClick={() => { if (!confirmed) setSelected(idx); }}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: bg, border: `2px solid ${border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 10, cursor: confirmed ? 'default' : 'pointer', color, fontSize: T.fontSizeLg, lineHeight: 1.4, transition: 'all 0.15s', fontFamily: T.font }}>
              <span style={{ fontWeight: 700, marginRight: 8 }}>{String.fromCharCode(65 + idx)}.</span>{opt}
            </button>
          );
        })}

        {!confirmed ? (
          <button onClick={handleConfirm} disabled={selected === null}
            style={{ width: '100%', background: selected === null ? T.border : '#FFB612', color: selected === null ? T.dim : '#1a1a2e', border: 'none', borderRadius: 12, padding: 16, fontWeight: 700, fontSize: T.fontSizeLg, cursor: selected === null ? 'not-allowed' : 'pointer', marginTop: 4, fontFamily: T.font }}>
            Confirm
          </button>
        ) : (
          <button onClick={handleNext}
            style={{ width: '100%', background: '#007A4D', color: '#fff', border: 'none', borderRadius: 12, padding: 16, fontWeight: 700, fontSize: T.fontSizeLg, cursor: 'pointer', fontFamily: T.font }}>
            {qIndex + 1 < questions.length ? 'Next →' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  );
}
