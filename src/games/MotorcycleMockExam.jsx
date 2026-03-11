import { useState, useEffect, useRef } from "react";
import { T } from "../theme.js";
import { incrementQuestionCount } from "../freemium.js";
import FreemiumGate from "../components/FreemiumGate.jsx";

const EXAM_QUESTIONS = 40;
const EXAM_SECONDS   = 30 * 60; // 30 minutes
const PASS_MARK      = 0.75;    // 75%

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── 70-question pool — drawn randomly each exam ───────────────────────────────
const QUESTION_POOL = [
  // LICENCE & CODES
  { q: "What is the minimum age to apply for a Code 1 learner's licence?", options: ["14","16","17","18"], answer: 1, category: "Licence & Codes" },
  { q: "Under 18 with a Code 1 learner's licence — what is the maximum engine size you may ride?", options: ["Any size","50cc","125cc","200cc"], answer: 2, category: "Licence & Codes" },
  { q: "You hold a Code 1 learner's licence. May you carry a passenger?", options: ["Yes, with helmets","Yes, under 5km","No — passengers are prohibited","Yes, with supervisor approval"], answer: 2, category: "Licence & Codes" },
  { q: "How long is a Code 1 learner's licence valid from issue?", options: ["12 months","18 months","24 months","36 months"], answer: 2, category: "Licence & Codes" },
  { q: "Your Code 1 learner's licence supervisor must hold which licence?", options: ["Any valid licence","Any driver's licence for 2+ years","A valid Code 1 driver's licence","A Code 8 licence"], answer: 2, category: "Licence & Codes" },
  { q: "Does a Code 8 (car) licence authorise you to ride a motorcycle?", options: ["Yes — higher codes include lower","No — you need a separate Code 1","Yes, under 125cc only","Yes, with a sidecar"], answer: 1, category: "Licence & Codes" },
  { q: "Which code covers motorcycles without a sidecar?", options: ["Code 1","Code 2","Code 8","Code 3"], answer: 0, category: "Licence & Codes" },
  { q: "A full Code 1 holder (18+) wishes to ride a motorcycle with a sidecar. Do they need a new licence?", options: ["Yes — Code 2 required","No — Code 1 covers all motorcycles","Yes — Code 8 required","No — but they need an endorsement"], answer: 1, category: "Licence & Codes" },
  { q: "You are 16 with a Code 1 learner's licence. May you ride alone to school?", options: ["Yes, if under 5km","Yes, in daylight","No — always supervised","Yes, familiar routes only"], answer: 2, category: "Licence & Codes" },
  { q: "At what blood alcohol level does a motorcycle rider commit an offence?", options: ["0.00g/100ml","0.02g/100ml","0.05g/100ml","0.08g/100ml"], answer: 2, category: "Licence & Codes" },

  // PROTECTIVE EQUIPMENT & LIGHTS
  { q: "When must a motorcycle rider wear an approved safety helmet?", options: ["Freeways only","Above 60 km/h","At ALL times on public roads","In poor weather only"], answer: 2, category: "Equipment" },
  { q: "Must a pillion passenger also wear a helmet?", options: ["Yes — everyone on the bike","No — only the rider","Yes, only if over 18","No — passengers choose"], answer: 0, category: "Equipment" },
  { q: "A motorcycle headlamp must be on at what time?", options: ["Sunset to sunrise","Poor visibility only","ALL times — day and night","Above 80 km/h"], answer: 2, category: "Equipment" },
  { q: "How many red rear retro-reflectors must a motorcycle have?", options: ["None","One, centrally mounted","Two, one per side","One on each mudguard"], answer: 1, category: "Equipment" },
  { q: "Motorcycle dipped beam must allow visibility of objects at least how far ahead?", options: ["20m","30m","45m","100m"], answer: 2, category: "Equipment" },
  { q: "Must a motorcycle have both front and rear independent braking systems?", options: ["No — one system is fine","Yes — two independent braking systems","No — rear only","Only above 250cc"], answer: 1, category: "Equipment" },
  { q: "Your motorcycle's stop lamp must be visible at minimum what distance in daylight?", options: ["20m","30m","45m","90m"], answer: 1, category: "Equipment" },
  { q: "What is the maximum width of a motorcycle (including luggage)?", options: ["1.0m","1.5m","2.0m","2.5m"], answer: 1, category: "Equipment" },
  { q: "Your motorcycle's hooter must be audible from at least how far?", options: ["30m","45m","90m","150m"], answer: 2, category: "Equipment" },
  { q: "Is it compulsory for a Code 1 learner's licence holder to wear full protective riding gear (jacket, gloves, boots)?", options: ["Yes — full gear is legally compulsory","Only a helmet is legally required — other gear is recommended","Yes — at speeds above 60 km/h","No — helmet is optional on short trips"], answer: 1, category: "Equipment" },

  // RIDING RULES & ROAD BEHAVIOUR
  { q: "Is lane splitting (riding between lanes of slow-moving traffic) legal in South Africa?", options: ["Yes — motorcycles may lane split","No — lane splitting is illegal","Yes, if traffic is stopped","Yes, below 30 km/h"], answer: 1, category: "Road Behaviour" },
  { q: "You approach a pedestrian crossing with a pedestrian on it. What must you do?", options: ["Hoot and proceed","Swerve around them","Stop and let them cross","Flash lights and slow down"], answer: 2, category: "Road Behaviour" },
  { q: "To carry a pillion passenger legally, the motorcycle must have:", options: ["Nothing specific","Passenger foot pegs fitted","Panniers for stability","A minimum engine size of 125cc"], answer: 1, category: "Road Behaviour" },
  { q: "You are blinded by oncoming headlights at night. What must you do?", options: ["Flash high beam at them","Slow down, move left, look at the road edge","Brake and stop immediately","Accelerate past quickly"], answer: 1, category: "Road Behaviour" },
  { q: "When overtaking, what is the final and most critical check before pulling out?", options: ["Left mirror","Right indicator","Road ahead is clear for the full manoeuvre","Shoulder check right"], answer: 2, category: "Road Behaviour" },
  { q: "A solid white centre line means:", options: ["Overtake when safe","No overtaking and no crossing","Right lane for faster traffic","Caution ahead"], answer: 1, category: "Road Behaviour" },
  { q: "Is it permitted to overtake near a blind rise?", options: ["Yes, if you accelerate quickly","Yes, motorcycles are exempt","No — prohibited near crests, curves and intersections","Only if no oncoming traffic is visible"], answer: 2, category: "Road Behaviour" },
  { q: "When following another vehicle, what is the minimum K53 following distance?", options: ["1 second","2 seconds","3 seconds","10 car lengths"], answer: 2, category: "Road Behaviour" },
  { q: "A flashing red traffic light must be treated as:", options: ["A yield sign","A stop sign","A warning to slow down","An uncontrolled intersection"], answer: 1, category: "Road Behaviour" },
  { q: "At a four-way stop, two vehicles arrive simultaneously. Who goes first?", options: ["The vehicle on the left","The vehicle on the right","The larger vehicle","The first to signal"], answer: 1, category: "Road Behaviour" },

  // NUMBERS & DISTANCES
  { q: "Maximum speed on a freeway for a motorcycle?", options: ["100 km/h","110 km/h","120 km/h","130 km/h"], answer: 2, category: "Numbers" },
  { q: "Default speed limit in an urban area where no sign is posted?", options: ["50 km/h","60 km/h","80 km/h","100 km/h"], answer: 1, category: "Numbers" },
  { q: "Default speed limit on an open road (non-freeway) where no sign is posted?", options: ["80 km/h","100 km/h","110 km/h","120 km/h"], answer: 1, category: "Numbers" },
  { q: "At 100 km/h, a 3-second following distance equals approximately how far?", options: ["30 metres","55 metres","83 metres","100 metres"], answer: 2, category: "Numbers" },
  { q: "How long before a turn or lane change must you signal?", options: ["As you turn","1 second before","At least 3 seconds before","5 seconds before"], answer: 2, category: "Numbers" },
  { q: "Minimum tyre tread depth required by law?", options: ["0.5mm full width","1.0mm across central ¾","1.6mm full width","2.0mm centre groove"], answer: 1, category: "Numbers" },
  { q: "Under 18 with Code 1 — maximum engine size permitted?", options: ["50cc","100cc","125cc","200cc"], answer: 2, category: "Numbers" },
  { q: "Blood alcohol offence limit for a motorcycle rider?", options: ["0.00g/100ml","0.02g/100ml","0.05g/100ml","0.08g/100ml"], answer: 2, category: "Numbers" },
  { q: "Professional driver blood alcohol offence limit?", options: ["0.00g/100ml","0.02g/100ml","0.05g/100ml","0.08g/100ml"], answer: 1, category: "Numbers" },
  { q: "A learner's licence is valid for how long?", options: ["12 months","18 months","24 months","36 months"], answer: 2, category: "Numbers" },

  // ROAD SIGNS & SIGNALS
  { q: "A YIELD sign means:", options: ["Stop completely","Give way to joining road traffic — stop only if needed","Slow to 30 km/h","Give way to traffic from your right only"], answer: 1, category: "Road Signs" },
  { q: "A broken white centre line means:", options: ["No overtaking","Overtaking permitted when safe","Right lane only","No crossing ever"], answer: 1, category: "Road Signs" },
  { q: "A no-overtaking sign means:", options: ["No overtaking for 100m","No overtaking in your direction until derestriction","No overtaking in wet weather","No overtaking by heavy vehicles"], answer: 1, category: "Road Signs" },
  { q: "A solid yellow centre line means:", options: ["Slippery surface ahead","No overtaking, no crossing for that lane","Slow lane — keep left","No parking within 3m"], answer: 1, category: "Road Signs" },
  { q: "A flashing amber traffic light means:", options: ["Treat as stop","Proceed normally","Yield and proceed with caution","Road is closed"], answer: 2, category: "Road Signs" },
  { q: "A traffic officer's instructions override:", options: ["Nothing — signals take precedence","Only road markings","All road signs, signals AND markings","Only in emergencies"], answer: 2, category: "Road Signs" },

  // EMERGENCIES & SAFETY
  { q: "Front tyre blows out at speed — correct response?", options: ["Full brakes immediately","Grip handlebars, ease throttle, brake progressively","Brake hard and steer left","Lean into the blow-out side"], answer: 1, category: "Emergencies" },
  { q: "You are involved in an injury accident. Your FIRST obligation?", options: ["Photograph the scene","Move the bike","Stop and render assistance — call emergency services","Exchange details first"], answer: 2, category: "Emergencies" },
  { q: "You are skidding on wet road. What is the FIRST action?", options: ["Brake hard","Ease off brakes and throttle, steer into the skid","Accelerate through","Switch off the engine"], answer: 1, category: "Emergencies" },
  { q: "At what emergency number can you reach SA police?", options: ["10177","10111","112","911"], answer: 1, category: "Emergencies" },
  { q: "You see a truck shedding its load ahead of you. What should you do?", options: ["Accelerate to get past","Brake and move as far left as possible, keep maximum distance","Overtake on the right immediately","Flash lights to warn the driver"], answer: 1, category: "Emergencies" },

  // PARKING & MISCELLANEOUS
  { q: "You notify the registering authority of a new address within how many days?", options: ["7 days","14 days","30 days","No obligation"], answer: 1, category: "Admin" },
  { q: "A vehicle licence disc expired 10 days ago. May you drive?", options: ["No — illegal from the day it expires","Yes — 21-day grace period applies","Yes — 30-day grace period","Only to a licensing office"], answer: 1, category: "Admin" },
  { q: "You park on the left edge of the road. You should be within how far from the edge?", options: ["0.5m","1.0m","1.5m","No requirement"], answer: 0, category: "Parking" },
  { q: "When parked at night near a lit street lamp (within 12m), must your motorcycle's lights be on?", options: ["Yes — always","No — the 12m street lamp exemption applies","Only if on the roadway","Only if the engine is running"], answer: 1, category: "Parking" },
  { q: "You wish to park your motorcycle facing uphill. What is best practice?", options: ["Leave it in neutral","Turn handlebars towards the kerb, engage gear or use stand","Leave it on the centre stand only","Park facing downhill instead"], answer: 1, category: "Parking" },

  // ADDITIONAL ROAD BEHAVIOUR
  { q: "When being overtaken by another vehicle, you must:", options: ["Accelerate to help them complete faster","Move LEFT and do not accelerate until they have fully passed","Flash hazards to warn oncoming traffic","Hold your position and maintain speed"], answer: 1, category: "Road Behaviour" },
  { q: "You approach a railway crossing with no barriers. What must you do?", options: ["Maintain speed if no train is visible","Stop, look both ways, cross only when clear","Slow to 30 km/h — no need to stop","Sound hooter and proceed"], answer: 1, category: "Road Behaviour" },
  { q: "At night, when must you switch from high beam to dipped beam?", options: ["When within 500m of oncoming traffic","When within 150m of oncoming traffic OR following within 150m of another vehicle","Only in fog or rain","When entering a town"], answer: 1, category: "Road Behaviour" },
  { q: "You want to make a U-turn on a public road. When is this NOT permitted?", options: ["Never on any road","When a no-U-turn sign is displayed, near crests, curves, or where it obstructs traffic","Only at traffic lights","On roads with a speed limit above 80 km/h"], answer: 1, category: "Road Behaviour" },
  { q: "Fog lamps may legally be used when?", options: ["In heavy rain","In snow, fog, mist, dust or smoke — not rain","Anytime visibility is reduced","Only at night"], answer: 1, category: "Road Behaviour" },
  { q: "You want to turn right at an intersection. Traffic is approaching from your left. Who has right of way?", options: ["You — you are on the major road","The approaching traffic — you must yield when turning across oncoming traffic","You — turning vehicles always have right of way","Whoever arrives first"], answer: 1, category: "Road Behaviour" },
  { q: "When approaching a STOP sign, where exactly must you stop?", options: ["3 metres before the sign","At the stop line, or at the edge of the intersection if no line","When you can see traffic","At the sign pole itself"], answer: 1, category: "Road Signs" },
  { q: "You are riding at night and see a vehicle's headlights ahead in your lane. It is the wrong way. You must:", options: ["Flash your lights and maintain position","Move to the left as far as possible, slow down, hoot if needed","Brake and stop in the middle of the road","Accelerate to get past quickly"], answer: 1, category: "Emergencies" },
  { q: "What does a solid white line along the LEFT edge of the road indicate?", options: ["Parking zone","No stopping or parking — often a bus lane edge","Edge of the carriageway — ride to the left of it","Reserved for motorcycles"], answer: 2, category: "Road Signs" },
  { q: "You hold a Code 1 licence and want to tow a small trailer. Is this permitted?", options: ["Yes — motorcycles may tow trailers up to 750kg","No — motorcycles are not legally permitted to tow trailers","Yes, if the trailer has its own brakes","Only with a Code 2 endorsement"], answer: 1, category: "Licence & Codes" },
];

export default function MotorcycleMockExam({ onBack, onPass }) {
  const [screen, setScreen] = useState("intro");
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(EXAM_SECONDS);
  const [showGate, setShowGate] = useState(false);
  const timerRef = useRef(null);
  const passedFiredRef = useRef(false);

  const currentQ = questions[qIdx];
  const progress = questions.length ? (qIdx / questions.length) * 100 : 0;
  const timerPct = (timeLeft / EXAM_SECONDS) * 100;
  const timerColor = timeLeft > 600 ? T.green : timeLeft > 120 ? T.gold : T.red;
  const mins = Math.floor(timeLeft / 60);
  const secs = String(timeLeft % 60).padStart(2, "0");

  useEffect(() => {
    if (screen === "quiz") {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); setScreen("result"); return 0; }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [screen]);

  const startExam = () => {
    setQuestions(shuffle(QUESTION_POOL).slice(0, EXAM_QUESTIONS));
    setQIdx(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setWrongAnswers([]);
    setTimeLeft(EXAM_SECONDS);
    passedFiredRef.current = false;
    setScreen("quiz");
  };

  const handleSelect = (i) => {
    if (answered) return;
    if (!incrementQuestionCount()) { setShowGate(true); return; }
    clearInterval(timerRef.current);
    setSelected(i);
    setAnswered(true);
    if (i === currentQ.answer) {
      setScore(s => s + 1);
    } else {
      setWrongAnswers(w => [...w, {
        q: currentQ.q,
        yourAnswer: currentQ.options[i],
        correctAnswer: currentQ.options[currentQ.answer],
        category: currentQ.category,
      }]);
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setScreen("result"); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleNext = () => {
    if (qIdx < questions.length - 1) {
      setQIdx(i => i + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      clearInterval(timerRef.current);
      setScreen("result");
    }
  };

  // ── INTRO ───────────────────────────────────────────────────────────────────
  if (screen === "intro") {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.text, padding: "24px 16px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <button onClick={onBack} style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.dim, fontSize: 13, padding: "7px 14px", cursor: "pointer", fontFamily: T.font, borderRadius: 3, marginBottom: 28 }}>
            ← All Drills
          </button>
          <div style={{ background: T.surface, border: `2px solid #FFB612`, borderRadius: 6, padding: "32px 28px", textAlign: "center" }}>
            <div style={{ fontSize: 11, letterSpacing: 4, color: T.dim, marginBottom: 12 }}>CODE 1 · MOTORCYCLE</div>
            <h1 style={{ color: "#FFB612", fontSize: 30, fontWeight: 700, marginBottom: 16, letterSpacing: -0.5 }}>🏍️ Motorcycle Mock Exam</h1>
            <p style={{ color: T.dim, fontSize: 14, lineHeight: 1.7, marginBottom: 28, maxWidth: 480, margin: "0 auto 28px" }}>
              Simulates the real Code 1 learner's test. 40 questions, 30 minutes. No hints during the exam — results at the end.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 28, marginBottom: 28, flexWrap: "wrap" }}>
              {[["40", "Questions"], ["30 min", "Time Limit"], ["75%", "Pass Mark"], ["30/40", "Min to Pass"]].map(([val, lbl]) => (
                <div key={lbl}>
                  <div style={{ color: "#FFB612", fontSize: 26, fontWeight: 700 }}>{val}</div>
                  <div style={{ color: T.dim, fontSize: 11, letterSpacing: 2 }}>{lbl}</div>
                </div>
              ))}
            </div>
            <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderLeft: `4px solid #FFB612`, borderRadius: 4, padding: "14px 18px", marginBottom: 28, textAlign: "left" }}>
              <div style={{ color: "#FFB612", fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>EXAM RULES</div>
              <ul style={{ color: T.dim, fontSize: 13, lineHeight: 1.9, paddingLeft: 18, margin: 0 }}>
                <li>No hints or explanations during the exam</li>
                <li>Covers: licences, equipment, riding rules, numbers, road signs</li>
                <li>Timer runs continuously — stay focused</li>
                <li>Wrong answers reviewed at the end</li>
              </ul>
            </div>
            <button onClick={startExam} style={{ width: "100%", padding: "16px", background: "#FFB612", color: "#060D07", border: "none", borderRadius: 4, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>
              Start Mock Exam →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── QUIZ ────────────────────────────────────────────────────────────────────
  if (screen === "quiz" && currentQ) {
    const isCorrect = selected === currentQ.answer;
    return (
      <>
        {showGate && <FreemiumGate onClose={() => { setShowGate(false); setScreen("intro"); }} />}
        <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.text, padding: "20px 16px" }}>
          <div style={{ maxWidth: 640, margin: "0 auto" }}>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ color: "#FFB612", fontSize: 10, letterSpacing: 3 }}>🏍️ CODE 1 MOCK EXAM</div>
                <div style={{ color: T.text, fontSize: 12, fontWeight: 700 }}>{currentQ.category}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: timerColor, fontSize: 20, fontWeight: 900, fontFamily: "Courier New, monospace" }}>{mins}:{secs}</div>
                <div style={{ color: T.dim, fontSize: 10, letterSpacing: 2 }}>REMAINING</div>
              </div>
            </div>

            {/* Timer bar */}
            <div style={{ height: 4, background: T.surfaceAlt, borderRadius: 2, marginBottom: 8, position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${timerPct}%`, background: timerColor, borderRadius: 2, transition: "width 1s linear" }} />
            </div>

            {/* Progress bar */}
            <div style={{ height: 3, background: T.surfaceAlt, borderRadius: 2, marginBottom: 20, position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${progress}%`, background: "#FFB612", borderRadius: 2, transition: "width 0.3s" }} />
            </div>

            <div style={{ color: T.dim, fontSize: 11, letterSpacing: 3, marginBottom: 12 }}>
              Q {qIdx + 1} / {EXAM_QUESTIONS} · <span style={{ color: "#FFB612" }}>{score} correct</span>
            </div>

            {/* Question */}
            <div style={{ background: "rgba(255,182,18,0.07)", border: "1px solid rgba(255,182,18,0.22)", borderRadius: 4, padding: "20px", marginBottom: 14, color: "#F0E8C8", fontSize: 14, lineHeight: 1.7, fontWeight: 600 }}>
              {currentQ.q}
            </div>

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 14 }}>
              {currentQ.options.map((opt, i) => {
                let bc = T.border, bg = T.surface, tc = "#aaa";
                if (answered) {
                  if (i === currentQ.answer) { bc = "#007A4D"; bg = "#001a12"; tc = "#007A4D"; }
                  else if (i === selected)   { bc = "#DE3831"; bg = "#1a0000"; tc = "#DE3831"; }
                  else { tc = "#2a2a2a"; }
                }
                return (
                  <button key={i} onClick={() => handleSelect(i)}
                    style={{ background: bg, border: `2px solid ${bc}`, borderRadius: 4, padding: "13px 14px", textAlign: "left", cursor: answered ? "default" : "pointer", display: "flex", gap: 10, alignItems: "flex-start", fontFamily: T.font, transition: "border-color 0.1s" }}
                    onMouseEnter={e => { if (!answered) e.currentTarget.style.borderColor = "#FFB612"; }}
                    onMouseLeave={e => { if (!answered) e.currentTarget.style.borderColor = T.border; }}
                  >
                    <span style={{ color: tc, fontSize: 10, fontWeight: 900, letterSpacing: 1, minWidth: 18, marginTop: 2 }}>{String.fromCharCode(65 + i)}</span>
                    <span style={{ color: tc, fontSize: 13, lineHeight: 1.5 }}>{opt}</span>
                    {answered && i === currentQ.answer && <span style={{ marginLeft: "auto", color: "#007A4D" }}>✓</span>}
                    {answered && i === selected && i !== currentQ.answer && <span style={{ marginLeft: "auto", color: "#DE3831" }}>✗</span>}
                  </button>
                );
              })}
            </div>

            {/* No explanation in exam mode */}
            {answered && (
              <div style={{ background: isCorrect ? "#001a12" : "#1a0000", border: `1px solid ${isCorrect ? "#007A4D" : "#DE3831"}`, borderRadius: 4, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: isCorrect ? "#007A4D" : "#DE3831", fontWeight: 700, letterSpacing: 1 }}>
                {isCorrect ? "✓ CORRECT" : "✗ INCORRECT — Review at the end"}
              </div>
            )}

            {answered && (
              <button onClick={handleNext} style={{ width: "100%", padding: "13px", background: "#FFB612", color: "#060D07", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 900, letterSpacing: 3, cursor: "pointer", fontFamily: T.font }}>
                {qIdx < EXAM_QUESTIONS - 1 ? "NEXT →" : "SEE RESULTS →"}
              </button>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── RESULT ──────────────────────────────────────────────────────────────────
  if (screen === "result") {
    const pct = Math.round((score / EXAM_QUESTIONS) * 100);
    const passed = pct >= PASS_MARK * 100;
    if (passed && !passedFiredRef.current) { passedFiredRef.current = true; onPass?.(); }

    const categoryMap = {};
    questions.forEach(q => {
      if (!categoryMap[q.category]) categoryMap[q.category] = { total: 0, wrong: 0 };
      categoryMap[q.category].total++;
    });
    wrongAnswers.forEach(w => { if (categoryMap[w.category]) categoryMap[w.category].wrong++; });

    return (
      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.text, padding: "24px 16px", paddingBottom: 60 }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>

          {/* Score card */}
          <div style={{ background: passed ? "#001a12" : "#1a0000", border: `2px solid ${passed ? "#007A4D" : "#DE3831"}`, borderRadius: 6, padding: "32px 28px", textAlign: "center", marginBottom: 24 }}>
            <div style={{ color: passed ? "#007A4D" : "#DE3831", fontSize: 10, letterSpacing: 4, marginBottom: 12 }}>
              🏍️ CODE 1 MOCK EXAM RESULT
            </div>
            <div style={{ color: "#fff", fontSize: 64, fontWeight: 900, lineHeight: 1 }}>
              {score}<span style={{ color: "#1A3020", fontSize: 36 }}>/{EXAM_QUESTIONS}</span>
            </div>
            <div style={{ color: passed ? "#007A4D" : "#DE3831", fontSize: 28, fontWeight: 900, marginTop: 6 }}>{pct}%</div>
            <div style={{ color: T.dim, fontSize: 14, marginTop: 8 }}>
              {passed ? "PASSED — You're ready to ride to that DLTC." : `Need 75% (${Math.ceil(EXAM_QUESTIONS * PASS_MARK)}/${EXAM_QUESTIONS}) — you got ${pct}%. Keep drilling.`}
            </div>
          </div>

          {/* Category breakdown */}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: "20px 24px", marginBottom: 20 }}>
            <div style={{ color: "#FFB612", fontSize: 11, letterSpacing: 3, marginBottom: 16 }}>BREAKDOWN BY CATEGORY</div>
            {Object.entries(categoryMap).map(([cat, data]) => {
              const catPct = Math.round(((data.total - data.wrong) / data.total) * 100);
              const color = catPct >= 75 ? "#007A4D" : catPct >= 50 ? "#FFB612" : "#DE3831";
              return (
                <div key={cat} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: T.text }}>{cat}</span>
                    <span style={{ fontSize: 12, color, fontWeight: 700 }}>{catPct}%</span>
                  </div>
                  <div style={{ height: 4, background: T.surfaceAlt, borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${catPct}%`, background: color, borderRadius: 2, transition: "width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Wrong answers */}
          {wrongAnswers.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: "#DE3831", fontSize: 11, letterSpacing: 3, marginBottom: 14 }}>✗ WRONG ANSWERS ({wrongAnswers.length})</div>
              {wrongAnswers.map((w, i) => (
                <div key={i} style={{ background: T.surface, border: "1px solid #2a0000", borderRadius: 4, padding: "14px", marginBottom: 10 }}>
                  <div style={{ color: T.dim, fontSize: 12, marginBottom: 8, lineHeight: 1.5 }}>{w.q}</div>
                  <div style={{ color: "#DE3831", fontSize: 11, marginBottom: 4 }}>✗ Your answer: {w.yourAnswer}</div>
                  <div style={{ color: "#007A4D", fontSize: 11 }}>✓ Correct: {w.correctAnswer}</div>
                </div>
              ))}
            </div>
          )}

          {wrongAnswers.length === 0 && passed && (
            <div style={{ background: "#001a12", border: "1px solid #007A4D", borderRadius: 4, padding: 20, textAlign: "center", marginBottom: 24 }}>
              <div style={{ color: "#007A4D", fontSize: 16 }}>🏍️ PERFECT EXAM — Not a single mistake!</div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={startExam} style={{ flex: 1, padding: "13px", background: "#DE3831", color: "#fff", border: "none", borderRadius: 4, fontSize: 11, fontWeight: 900, letterSpacing: 2, cursor: "pointer", fontFamily: T.font }}>
              RETRY
            </button>
            <button onClick={onBack} style={{ flex: 1, padding: "13px", background: "#FFB612", color: "#060D07", border: "none", borderRadius: 4, fontSize: 11, fontWeight: 900, letterSpacing: 2, cursor: "pointer", fontFamily: T.font }}>
              BACK HOME
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
