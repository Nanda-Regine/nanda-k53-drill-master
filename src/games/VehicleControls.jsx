import { useState, useEffect, useRef, useCallback } from 'react';
import { T } from '../theme.js';
import { recordResult } from '../utils/progressHistory.js';
import { recordAnswer } from '../utils/spacedRepetition.js';
import { recordGameAnswer } from '../utils/masteryStore.js';
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

  // ── Tyres ─────────────────────────────────────────────────────────────────
  { id: 'vc31', cat: 'Tyres', q: 'The minimum legal tread depth for tyres in South Africa is:', options: ['0.5 mm','1 mm','1.6 mm','3 mm'], answer: 2 },
  { id: 'vc32', cat: 'Tyres', q: 'Overinflated tyres are dangerous because they:', options: ['Wear faster on the edges','Reduce the contact patch and can cause loss of control — especially in corners','Are more fuel efficient but unsafe','Cannot be patched when punctured'], answer: 1 },
  { id: 'vc33', cat: 'Tyres', q: 'Underinflated tyres cause:', options: ['Better wet-weather grip','Excessive heat build-up, faster tread wear on edges, and risk of blowout','No significant danger','Better steering response'], answer: 1 },
  { id: 'vc34', cat: 'Tyres', q: 'When should you check tyre pressure?', options: ['Only when a tyre looks flat','When the tyres are COLD — before a journey or after parking for at least 3 hours','Immediately after driving at high speed','Only at a petrol station'], answer: 1 },
  { id: 'vc35', cat: 'Tyres', q: 'A front tyre blowout at speed will cause the vehicle to:', options: ['Swerve toward the blown tyre side — grip steering firmly and do NOT brake hard','Stop immediately','Swerve away from the blown tyre','Have no effect on steering'], answer: 0 },
  { id: 'vc36', cat: 'Tyres', q: 'The correct response to a rear tyre blowout is:', options: ['Brake hard immediately','Hold the steering firmly, ease off accelerator gradually, and steer straight — brake gently only after stabilising','Accelerate to keep momentum','Swerve to the safe side of the road'], answer: 1 },
  { id: 'vc37', cat: 'Tyres', q: 'Mixing tyres of different sizes or types on the same axle is:', options: ['Acceptable if they are close in size','Dangerous and illegal — it causes unequal braking and handling','Fine for rear wheels only','Only a problem on 4x4 vehicles'], answer: 1 },

  // ── Engine checks ─────────────────────────────────────────────────────────
  { id: 'vc38', cat: 'Engine', q: 'Engine oil must be checked:', options: ['Only at a service','On a level surface with the engine OFF for a few minutes (cold check)','While the engine is running for accuracy','Only when the warning light comes on'], answer: 1 },
  { id: 'vc39', cat: 'Engine', q: 'The correct coolant level should be between:', options: ['As full as possible','The MIN and MAX marks on the coolant reservoir when cold','Any level is fine if the engine is not hot','Only the MAX mark'], answer: 1 },
  { id: 'vc40', cat: 'Engine', q: 'A V-belt (fan belt) that is cracked or frayed must be:', options: ['Monitored for another few months','Replaced immediately — failure stops charging and cooling','Lubricated with belt dressing','Left until the next service'], answer: 1 },
  { id: 'vc41', cat: 'Engine', q: 'A flat or weak battery is indicated by:', options: ['Engine surging at idle','Slow cranking or failure to start, dim lights, warning light on','High fuel consumption','Overheating engine'], answer: 1 },
  { id: 'vc42', cat: 'Engine', q: 'Blue or grey smoke from the exhaust usually means:', options: ['The engine is cold — normal until warm','The engine is burning oil — serious mechanical fault','Too rich a fuel mixture','Water in the fuel'], answer: 1 },
  { id: 'vc43', cat: 'Engine', q: 'White smoke from the exhaust (when warm) usually indicates:', options: ['Diesel engine — normal','Coolant burning in the engine — head gasket or cylinder head failure','Cold morning — normal','Lean fuel mixture'], answer: 1 },

  // ── Gears & Clutch ────────────────────────────────────────────────────────
  { id: 'vc44', cat: 'Gears', q: 'The correct sequence for changing up a gear is:', options: ['Clutch in → change gear → clutch out gradually → accelerate','Accelerate → clutch in → change gear → clutch out','Clutch in → accelerate → change gear','Change gear → clutch in → clutch out'], answer: 0 },
  { id: 'vc45', cat: 'Gears', q: 'Riding the clutch (keeping your foot slightly on it while driving) causes:', options: ['Better fuel economy','Premature clutch wear and overheating — keep your foot off the clutch when not changing gear','Smoother gear changes','No harm on modern vehicles'], answer: 1 },
  { id: 'vc46', cat: 'Gears', q: 'On a steep downhill, you should engage a lower gear to:', options: ['Save fuel','Use engine braking to reduce speed and prevent brake fade','Protect the gearbox','Keep the engine from stalling'], answer: 1 },
  { id: 'vc47', cat: 'Gears', q: 'Coasting (rolling in neutral or with the clutch depressed) downhill is dangerous because:', options: ['It damages the gearbox','You have no engine braking, travel faster, and brake harder causing brake fade','The engine may overspeed','It is illegal at all times'], answer: 1 },
  { id: 'vc48', cat: 'Gears', q: 'When approaching a red traffic light, you should:', options: ['Keep in top gear until just before stopping','Change to lower gears progressively as you slow, then clutch in before stopping','Put it in neutral immediately and coast','Never use the engine — brake only'], answer: 1 },

  // ── Handbrake ─────────────────────────────────────────────────────────────
  { id: 'vc49', cat: 'Handbrake', q: 'The handbrake must always be applied when:', options: ['The vehicle is stopped at a traffic light','The vehicle is parked — on a slope, apply firmly and leave in gear','Only on steep hills','The footbrake fails'], answer: 1 },
  { id: 'vc50', cat: 'Handbrake', q: 'If the handbrake warning light stays on while driving, you should:', options: ['Ignore it — it often stays on','Check that the handbrake is fully released — if released and light persists, check brake fluid','Drive carefully to your destination','Increase brake pressure to compensate'], answer: 1 },
  { id: 'vc51', cat: 'Handbrake', q: 'On an uphill incline start, the handbrake is released:', options: ['Before you find the bite point','After finding the bite point and just as you accelerate away','At the same time as pressing the clutch','Before pressing the accelerator'], answer: 1 },

  // ── Horn ──────────────────────────────────────────────────────────────────
  { id: 'vc52', cat: 'Horn', q: 'Your hooter (horn) must be audible at a minimum distance of:', options: ['30 m','45 m','60 m','90 m'], answer: 3 },
  { id: 'vc53', cat: 'Horn', q: 'You may NOT use your hooter except:', options: ['To greet someone you know','To warn others of danger and to avoid an accident','Whenever you think it necessary','In a built-up area at any time'], answer: 1 },

  // ── Indicators ────────────────────────────────────────────────────────────
  { id: 'vc54', cat: 'Indicators', q: 'At minimum, how far before a turn must you signal in an urban area?', options: ['10 m','20 m','30 m','50 m'], answer: 2 },
  { id: 'vc55', cat: 'Indicators', q: 'You MUST signal when:', options: ['Only in heavy traffic','Changing direction, changing lanes, moving off, or stopping — always indicate your intentions','Only when other vehicles are present','Only on freeways'], answer: 1 },
  { id: 'vc56', cat: 'Indicators', q: 'Hazard lights (all four indicators flashing) may be used when:', options: ['Driving slowly in traffic as a warning','The vehicle is stationary and is a hazard to others, or to warn of a hazard ahead','Whenever it is raining','To thank another driver'], answer: 1 },
  { id: 'vc57', cat: 'Indicators', q: 'If your turn signal fails to cancel automatically after a turn, you must:', options: ['Continue driving — it is a minor issue','Cancel it manually immediately — a signal left on misleads other drivers','Drive to a workshop before continuing','Flash your headlights to warn others'], answer: 1 },

  // ── Mirrors & Visibility ──────────────────────────────────────────────────
  { id: 'vc58', cat: 'Mirrors', q: 'You should check your mirrors approximately every:', options: ['Minute','5–8 seconds in normal driving','30 seconds','Only when you need to manoeuvre'], answer: 1 },
  { id: 'vc59', cat: 'Mirrors', q: 'The interior (rear-view) mirror should be adjusted so you can see:', options: ['The road ahead','The full rear window without moving your head','Both side mirrors','The back seat passengers'], answer: 1 },
  { id: 'vc60', cat: 'Mirrors', q: 'Side mirrors cannot replace the blind spot check because:', options: ['They are too far away','They have a limited field of view that leaves a blind zone beside and slightly behind the vehicle','They are only for parking','The law requires a physical check'], answer: 1 },
  { id: 'vc61', cat: 'Mirrors', q: 'A dirty or fogged rear window must be cleared before driving because:', options: ['It reduces fuel economy','It severely limits rear visibility — illegal to drive with impaired rear vision','Only an issue at night','Traffic police check for this'], answer: 1 },

  // ── Fuel system ───────────────────────────────────────────────────────────
  { id: 'vc62', cat: 'Fuel', q: 'Running a diesel engine completely out of fuel causes:', options: ['No problem — just refuel','Air entry into the fuel system requiring bleeding — costly and time-consuming','Immediate engine cutoff with no damage','Only starter motor wear'], answer: 1 },
  { id: 'vc63', cat: 'Fuel', q: 'A fuel leak from the vehicle is:', options: ['Only dangerous if near a flame','Extremely dangerous — fire and explosion risk. Do not start the engine. Move away from the vehicle.','A minor maintenance issue','Only relevant for petrol, not diesel'], answer: 1 },
  { id: 'vc64', cat: 'Fuel', q: 'Filling a petrol vehicle with diesel (or vice versa) causes:', options: ['Minor engine roughness that clears','Serious engine damage — do not start the engine if misfuelled','No problem if the tank is empty first','Only affects emissions'], answer: 1 },

  // ── Defrost & demisting ───────────────────────────────────────────────────
  { id: 'vc65', cat: 'Vision', q: 'You may only drive when all windows are:', options: ['At least 50% clear','Fully clear of condensation, frost and dirt — all-round visibility is a legal requirement','Only the windscreen — rear window is optional','Clear on the driver\'s side only'], answer: 1 },
  { id: 'vc66', cat: 'Vision', q: 'The fastest way to demist a fogged windscreen is:', options: ['Wipe it with your hand','Turn on the air conditioning (which dries the air) combined with the heater blower aimed at the screen','Open all windows fully','Leave the engine running — it clears automatically'], answer: 1 },
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
    recordGameAnswer('controls', q.id, isCorrect);
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
