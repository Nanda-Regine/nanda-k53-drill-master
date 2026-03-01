import { useState, useEffect, useRef } from "react";
import { T } from "../theme.js";
import { incrementQuestionCount, isPremium } from "../freemium.js";
import FreemiumGate from "../components/FreemiumGate.jsx";

// ── Pull questions from all 4 game files (imported inline data) ───────────────
// We duplicate a cross-section here for the mock exam.
// Total: 68 questions randomly drawn from this pool.

const QUESTION_POOL = [
  // Lights & fitness
  { q:"When MUST headlamps be lit on a light motor vehicle?", options:["Only after dark","Between sunset and sunrise, AND when visibility <150m","Between sunset and sunrise, AND when persons/vehicles aren't visible at 150m","Anytime it's cloudy"], answer:2, category:"Lights & Equipment" },
  { q:"Your dipped beam headlamp must allow you to see objects at least how far ahead?", options:["100m","150m","45m","30m"], answer:2, category:"Lights & Equipment" },
  { q:"Your stop lamp must be visible at what distance in normal sunlight?", options:["45m","20m","100m","30m"], answer:3, category:"Lights & Equipment" },
  { q:"Fog lamps are ONLY permitted in which conditions?", options:["Rain and fog","Snow, fog, mist, dust, smoke","Any time visibility is reduced","At driver's discretion"], answer:1, category:"Lights & Equipment" },
  { q:"Your LMV's hooter must be audible from what distance?", options:["45m","30m","150m","90m"], answer:3, category:"Lights & Equipment" },
  { q:"Minimum visible light transmittance through a windscreen?", options:["50%","60%","70%","80%"], answer:2, category:"Lights & Equipment" },
  { q:"How many red retro-reflectors must a LMV have at the rear?", options:["One on driver's side","One in centre","Two — one each side","None"], answer:2, category:"Lights & Equipment" },
  { q:"Parked within what distance of a lit street lamp may you leave lights off at night?", options:["5m","8m","12m","20m"], answer:2, category:"Lights & Equipment" },

  // Licences & Admin
  { q:"How long is a learner's licence valid?", options:["12 months","18 months","24 months","36 months"], answer:2, category:"Licences & Admin" },
  { q:"You moved house. By when must you notify the registering authority?", options:["7 days","14 days","30 days","No obligation"], answer:1, category:"Licences & Admin" },
  { q:"Vehicle licence disc expired 15 days ago. Legal to drive?", options:["No — illegal from expiry","Yes — 21-day grace period","Yes — 30-day grace period","Only to licensing office"], answer:1, category:"Licences & Admin" },
  { q:"Professional driver's blood alcohol limit?", options:["0.05g/100ml","0.02g/100ml","0.00g (zero)","0.08g/100ml"], answer:1, category:"Licences & Admin" },
  { q:"Code 1 learner's licence minimum age?", options:["14","15","16","17"], answer:2, category:"Licences & Admin" },
  { q:"Under 18 on Code 1 — maximum engine size?", options:["Any size","200cc","125cc","50cc"], answer:2, category:"Licences & Admin" },
  { q:"Code 1 learner — may you carry a pillion passenger?", options:["Yes if helmets worn","Yes if engine >125cc","No — prohibited","Yes in daylight only"], answer:2, category:"Licences & Admin" },
  { q:"Vehicle licence disc must be affixed where?", options:["Rear window centre","Lower LEFT corner inside windscreen","Rear window right","Driver's door window"], answer:1, category:"Licences & Admin" },

  // Speed Limits
  { q:"Speed limit for a bus on a freeway?", options:["120km/h","110km/h","100km/h","80km/h"], answer:2, category:"Speed Limits" },
  { q:"Speed limit for a vehicle towing with a tow-rope?", options:["120km/h","100km/h","80km/h","30km/h"], answer:3, category:"Speed Limits" },
  { q:"At what GVM does the 80km/h limit apply to heavy vehicles?", options:["Over 9000kg","9000kg exactly","Over 10000kg","Over 8000kg"], answer:0, category:"Speed Limits" },
  { q:"Maximum height of any vehicle including load (except double-deck bus)?", options:["3.8m","4.0m","4.3m","4.65m"], answer:2, category:"Speed Limits" },
  { q:"Rear projection over 300mm — what's required at night?", options:["Red flag only","Red retro-reflectors only","White retro-reflectors (front) + red (rear)","No requirement"], answer:2, category:"Speed Limits" },
  { q:"Articulated motor vehicle maximum length?", options:["16m","18.5m","22m","25m"], answer:1, category:"Speed Limits" },

  // Road Behaviour
  { q:"Minimum following distance for LMV in normal conditions?", options:["1 second","2 seconds","3 seconds","4 seconds"], answer:1, category:"Road Behaviour" },
  { q:"When approaching an emergency vehicle with siren and lights — your duty?", options:["Continue if you have right of way","Yield only if asked","Give IMMEDIATE right of way — no conditions","Slow to 60km/h"], answer:2, category:"Road Behaviour" },
  { q:"When may you pass on the LEFT?", options:["Never","When vehicle ahead turns right","When traffic is stationary","Both B and C"], answer:3, category:"Road Behaviour" },
  { q:"After an accident — may you drink alcohol?", options:["Yes immediately","Not until police arrive","Not until reporting, unless on medical instruction","Yes if you weren't driving"], answer:2, category:"Road Behaviour" },
  { q:"No parking within how many metres of a pedestrian crossing (approaching side)?", options:["5m","9m","12m","3m"], answer:1, category:"Road Behaviour" },
  { q:"No parking within how many metres of an intersection?", options:["9m","5m","3m","12m"], answer:1, category:"Road Behaviour" },
  { q:"When being passed by another vehicle — what must you do?", options:["Accelerate slightly","Move LEFT and don't accelerate until they've fully passed","Flash lights","Keep speed constant"], answer:1, category:"Road Behaviour" },
  { q:"Warning triangle must be placed at least how far from a broken-down vehicle?", options:["20m","30m","45m","60m"], answer:2, category:"Road Behaviour" },

  // Safety & Equipment
  { q:"Which vehicles must carry a warning triangle?", options:["All vehicles","Only heavy vehicles and buses","Heavy vehicles, goods vehicles, minibuses, buses","Motorcycles and cars"], answer:2, category:"Safety & Equipment" },
  { q:"Maximum turning radius of a vehicle on a public road?", options:["10m","11.5m","13.1m","15m"], answer:2, category:"Safety & Equipment" },
  { q:"Seated passenger handrail height above seating surface?", options:["300mm","350mm","450mm","900mm"], answer:1, category:"Safety & Equipment" },
  { q:"Standing passenger handrail height above standing surface?", options:["350mm","500mm","750mm","900mm"], answer:3, category:"Safety & Equipment" },

  // Motorcycles
  { q:"Motorcycle headlamps — when must they be on?", options:["At night only","When visibility <150m","At ALL times — day and night","Only in tunnels"], answer:2, category:"Motorcycles" },
  { q:"How many red retro-reflectors must a motorcycle have at the rear?", options:["None","One","Two","Three"], answer:1, category:"Motorcycles" },
  { q:"Minimum following distance for a motorcycle?", options:["1 second","2 seconds","3 seconds","4 seconds"], answer:1, category:"Motorcycles" },

  // Numbers & Patterns
  { q:"Minimum age to apply for a Code 2 learner's licence?", options:["16","17","18","21"], answer:1, category:"Numbers & Ages" },
  { q:"Direction indicators must be visible at what distance?", options:["20m","30m","45m","90m"], answer:1, category:"Numbers & Ages" },
  { q:"Number plate lamp visible at what distance?", options:["20m","30m","45m","60m"], answer:0, category:"Numbers & Ages" },
  { q:"Minimum tyre tread depth for a light motor vehicle?", options:["0.5mm","1mm","1.6mm","2mm"], answer:2, category:"Numbers & Ages" },
  { q:"A child up to what mass may use an adult seatbelt without a child seat?", options:["15kg","18kg","20kg","25kg"], answer:1, category:"Numbers & Ages" },
  { q:"At what age may a learner drive a Code 3 vehicle?", options:["16","17","18","21"], answer:2, category:"Numbers & Ages" },
  { q:"General driver blood alcohol limit (g per 100ml)?", options:["0.00","0.02","0.05","0.08"], answer:2, category:"Numbers & Ages" },
  { q:"Dipped beam must show objects at what distance ahead?", options:["30m","45m","100m","150m"], answer:1, category:"Numbers & Ages" },
  { q:"Main beam must show objects at what distance ahead?", options:["45m","75m","100m","150m"], answer:2, category:"Numbers & Ages" },

  // Road Signs & Markings
  { q:"A solid white centre line means?", options:["Overtaking permitted","No overtaking — may not cross","Advisory only","Cycling lane"], answer:1, category:"Road Signs" },
  { q:"A broken white centre line means?", options:["Never overtake","Overtaking permitted when safe","Emergency stops only","Pedestrian area ahead"], answer:1, category:"Road Signs" },
  { q:"Yellow no-parking lines on kerb mean?", options:["No parking any time","No parking during peak hours","Load/unload only","Resident parking"], answer:0, category:"Road Signs" },
  { q:"A red circle road sign indicates?", options:["Warning","Prohibition","Information","Give way"], answer:1, category:"Road Signs" },
  { q:"A red triangle road sign indicates?", options:["Prohibition","Warning — hazard ahead","Information","Stop"], answer:1, category:"Road Signs" },
  { q:"STOP sign — what is the full stop requirement?", options:["Slow to 5km/h","Stop completely before the line","Stop only if traffic approaching","Stop if instructed"], answer:1, category:"Road Signs" },

  // Intersections
  { q:"At a four-way stop — who goes first?", options:["Largest vehicle","Vehicle on the right","Vehicle that arrived first","Vehicle on main road"], answer:2, category:"Intersections" },
  { q:"At an uncontrolled intersection — you must yield to?", options:["Vehicles on your left","Vehicles on your right","All vehicles","Emergency vehicles only"], answer:1, category:"Intersections" },
  { q:"A yield sign means?", options:["Stop completely","Give way — stop only if necessary","Continue normally","Emergency vehicles only"], answer:1, category:"Intersections" },
  { q:"When turning right at an intersection — where do you wait if traffic doesn't clear?", options:["Behind stop line","In centre of intersection","On the left side","Past the intersection"], answer:1, category:"Intersections" },

  // Towing & Loads
  { q:"Maximum speed when towing with a tow-rope or chain?", options:["60km/h","80km/h","100km/h","30km/h"], answer:3, category:"Towing & Loads" },
  { q:"May passengers ride in a trailer being towed at 30km/h?", options:["No — never legal","Yes — legal at ≤30km/h","Only children","Only with seatbelts"], answer:1, category:"Towing & Loads" },
  { q:"Maximum rear load projection requiring marking?", options:["150mm","200mm","300mm","500mm"], answer:2, category:"Towing & Loads" },

  // Pedestrians
  { q:"At a pedestrian crossing with no traffic officer — who has right of way?", options:["Vehicles always","Pedestrian on the crossing","First to arrive","Vehicles turning"], answer:1, category:"Pedestrians" },
  { q:"You must stop for a school bus with flashing amber lights?", options:["Only if it's stopped","Yes — in both directions","Only if you're behind it","Only if children are visible"], answer:1, category:"Pedestrians" },

  // Parking & Stopping
  { q:"No stopping within how many metres of a fire hydrant?", options:["3m","5m","9m","12m"], answer:1, category:"Parking & Stopping" },
  { q:"On a road with a speed limit over 60km/h — how far from the road edge must you park?", options:["Off the roadway entirely","1.5m from edge","0.5m from edge","Any safe distance"], answer:0, category:"Parking & Stopping" },
  { q:"May you park facing AGAINST the flow of traffic?", options:["Yes if space is limited","No — must face the flow","Only at night","Only with hazards on"], answer:1, category:"Parking & Stopping" },

  // Overtaking
  { q:"May you overtake at a crest or curve?", options:["Yes if you can see ahead","No — unless not encroaching on the right side","Yes at reduced speed","Only on dual carriageway"], answer:1, category:"Overtaking" },
  { q:"You must NOT overtake a vehicle that has stopped at a pedestrian crossing?", options:["True","False — you may pass slowly","False — only if pedestrians present","True only on one-lane roads"], answer:0, category:"Overtaking" },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const EXAM_QUESTIONS = 68;
const PASS_MARK = 0.75; // 75%
const EXAM_SECONDS = 45 * 60; // 45 minutes

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MockExam({ onBack }) {
  const [screen, setScreen] = useState("intro"); // intro | quiz | result
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(EXAM_SECONDS);
  const [showGate, setShowGate] = useState(false);
  const timerRef = useRef(null);

  const currentQ = questions[qIdx];
  const progress = questions.length ? (qIdx / questions.length) * 100 : 0;
  const timerPct = (timeLeft / EXAM_SECONDS) * 100;
  const timerColor = timeLeft > 300 ? T.green : timeLeft > 60 ? T.gold : T.red;
  const isLowTime = timeLeft <= 300;

  useEffect(() => {
    if (screen === "quiz") {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setScreen("result");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [screen]);

  const startExam = () => {
    const pool = shuffle(QUESTION_POOL).slice(0, EXAM_QUESTIONS);
    setQuestions(pool);
    setQIdx(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setWrongAnswers([]);
    setTimeLeft(EXAM_SECONDS);
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
    // Restart timer
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

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (screen === "intro") {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.text, padding: "24px 16px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <button onClick={onBack} style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.dim, fontSize: 13, padding: "7px 14px", cursor: "pointer", fontFamily: T.font, borderRadius: 3, marginBottom: 28 }}>
            ← All Drills
          </button>

          <div style={{ background: T.surface, border: `2px solid ${T.gold}`, borderRadius: 6, padding: "32px 28px", textAlign: "center" }}>
            <div style={{ fontSize: 11, letterSpacing: 4, color: T.dim, fontFamily: T.mono, marginBottom: 12 }}>MOCK EXAM MODE</div>
            <h1 style={{ color: T.gold, fontSize: 32, fontWeight: 700, marginBottom: 16, letterSpacing: -0.5 }}>📝 K53 Licence Test Simulator</h1>
            <p style={{ color: T.dim, fontSize: 15, lineHeight: 1.7, marginBottom: 28, maxWidth: 480, margin: "0 auto 28px" }}>
              Same format as the real DLTC test. 68 questions, 45 minutes, 75% to pass.
              No hints. No explanations until the end.
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 32 }}>
              {[["68", "Questions"], ["45 min", "Time Limit"], ["75%", "Pass Mark"], ["51/68", "Min to Pass"]].map(([val, lbl]) => (
                <div key={lbl}>
                  <div style={{ color: T.gold, fontSize: 28, fontWeight: 700 }}>{val}</div>
                  <div style={{ color: T.dim, fontSize: 11, fontFamily: T.mono, letterSpacing: 2 }}>{lbl}</div>
                </div>
              ))}
            </div>

            <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderLeft: `4px solid ${T.gold}`, borderRadius: 4, padding: "14px 18px", marginBottom: 28, textAlign: "left" }}>
              <div style={{ color: T.gold, fontSize: 11, fontFamily: T.mono, letterSpacing: 2, marginBottom: 8 }}>EXAM RULES</div>
              <ul style={{ color: T.dim, fontSize: 13, lineHeight: 1.9, paddingLeft: 18, margin: 0 }}>
                <li>No hints or explanations during the exam</li>
                <li>You MUST answer before moving to the next question</li>
                <li>Timer runs continuously — answer quickly but carefully</li>
                <li>Results and wrong answers shown at the end</li>
              </ul>
            </div>

            <button onClick={startExam} style={{
              width: "100%", padding: "16px", background: T.gold, color: "#060D07",
              border: "none", borderRadius: 4, fontSize: 16, fontWeight: 700,
              cursor: "pointer", fontFamily: T.font, letterSpacing: 0.3,
            }}>
              Start Mock Exam →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── QUIZ ───────────────────────────────────────────────────────────────────
  if (screen === "quiz" && currentQ) {
    const isCorrect = selected === currentQ.answer;
    return (
      <>
        {showGate && <FreemiumGate onClose={() => { setShowGate(false); setScreen("intro"); }} />}
      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.text, padding: "20px 16px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>

          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ color: T.gold, fontSize: 10, letterSpacing: 3, fontFamily: T.mono }}>📝 MOCK EXAM</div>
              <div style={{ color: T.dim, fontSize: 11, fontFamily: T.mono }}>{currentQ.category}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: isLowTime ? T.red : T.gold, fontSize: 22, fontWeight: 900, fontFamily: T.mono }}>
                {isLowTime && "⚠ "}{formatTime(timeLeft)}
              </div>
              <div style={{ color: T.dim, fontSize: 10, letterSpacing: 2 }}>TIME LEFT</div>
            </div>
          </div>

          {/* Progress */}
          <div style={{ height: 3, background: T.surface, borderRadius: 2, marginBottom: 4 }}>
            <div style={{ height: "100%", width: `${progress}%`, background: T.gold, borderRadius: 2, transition: "width 0.3s" }} />
          </div>

          {/* Timer bar */}
          <div style={{ height: 4, background: T.surface, borderRadius: 2, marginBottom: 18 }}>
            <div style={{ height: "100%", width: `${timerPct}%`, background: timerColor, borderRadius: 2, transition: "width 1s linear" }} />
          </div>

          <div style={{ color: T.dim, fontSize: 11, letterSpacing: 3, marginBottom: 12 }}>
            Q {qIdx + 1} / {questions.length}
          </div>

          {/* Question */}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 4, padding: "20px", marginBottom: 14, color: T.white, fontSize: 14, lineHeight: 1.7, fontWeight: 600 }}>
            {currentQ.q}
          </div>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 14 }}>
            {currentQ.options.map((opt, i) => {
              let bc = T.border, bg = T.surface, tc = "#aaa";
              if (answered) {
                if (i === currentQ.answer) { bc = T.green; bg = "#001a12"; tc = T.green; }
                else if (i === selected) { bc = T.red; bg = "#1a0000"; tc = T.red; }
                else { tc = "#2a2a2a"; }
              }
              return (
                <button key={i} onClick={() => handleSelect(i)}
                  style={{ background: bg, border: `2px solid ${bc}`, borderRadius: 4, padding: "13px 14px", textAlign: "left", cursor: answered ? "default" : "pointer", display: "flex", gap: 10, alignItems: "flex-start", fontFamily: T.font }}
                  onMouseEnter={e => { if (!answered) e.currentTarget.style.borderColor = T.gold; }}
                  onMouseLeave={e => { if (!answered) e.currentTarget.style.borderColor = T.border; }}
                >
                  <span style={{ color: tc, fontSize: 10, fontWeight: 900, minWidth: 18, marginTop: 2 }}>{String.fromCharCode(65 + i)}</span>
                  <span style={{ color: tc, fontSize: 13, lineHeight: 1.5 }}>{opt}</span>
                  {answered && i === currentQ.answer && <span style={{ marginLeft: "auto", color: T.green }}>✓</span>}
                  {answered && i === selected && i !== currentQ.answer && <span style={{ marginLeft: "auto", color: T.red }}>✗</span>}
                </button>
              );
            })}
          </div>

          {/* Answered feedback - no explain in exam mode */}
          {answered && (
            <div style={{ background: isCorrect ? "#001a12" : "#1a0000", border: `1px solid ${isCorrect ? T.green : T.red}`, borderRadius: 4, padding: "10px 14px", marginBottom: 14, fontSize: 12, color: isCorrect ? T.green : T.red, fontWeight: 700, letterSpacing: 1 }}>
              {isCorrect ? "✓ CORRECT" : "✗ INCORRECT — Review at the end"}
            </div>
          )}

          {answered && (
            <button onClick={handleNext} style={{ width: "100%", padding: "13px", background: T.gold, color: "#000", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 900, letterSpacing: 3, cursor: "pointer", fontFamily: T.font }}>
              {qIdx < questions.length - 1 ? "NEXT →" : "FINISH EXAM →"}
            </button>
          )}

        </div>
      </div>
      </>
    );
  }

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (screen === "result") {
    const pct = Math.round((score / EXAM_QUESTIONS) * 100);
    const passed = pct >= PASS_MARK * 100;

    // Category breakdown
    const categoryMap = {};
    questions.forEach(q => {
      if (!categoryMap[q.category]) categoryMap[q.category] = { total: 0, wrong: 0 };
      categoryMap[q.category].total += 1;
    });
    wrongAnswers.forEach(w => {
      if (categoryMap[w.category]) categoryMap[w.category].wrong += 1;
    });

    const waLink = `https://wa.me/?text=${encodeURIComponent(`🚗 I scored ${score}/${EXAM_QUESTIONS} (${pct}%) on my K53 Mock Exam! ${passed ? "PASSED ✅" : "Need more practice 📚"} Train for your test at https://nanda-k53-drill-master.vercel.app`)}`;

    return (
      <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.text, padding: "24px 16px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>

          {/* Score card */}
          <div style={{ background: passed ? "#001a12" : "#1a0000", border: `2px solid ${passed ? T.green : T.red}`, borderRadius: 6, padding: "32px 28px", textAlign: "center", marginBottom: 24 }}>
            <div style={{ color: passed ? T.green : T.red, fontSize: 10, letterSpacing: 4, fontFamily: T.mono, marginBottom: 12 }}>
              📝 MOCK EXAM RESULT
            </div>
            <div style={{ color: T.white, fontSize: 64, fontWeight: 900, lineHeight: 1 }}>
              {score}<span style={{ color: T.border }}>/{EXAM_QUESTIONS}</span>
            </div>
            <div style={{ color: passed ? T.green : T.red, fontSize: 28, fontWeight: 900, marginTop: 6 }}>
              {pct}%
            </div>
            <div style={{ color: T.dim, fontSize: 14, marginTop: 8 }}>
              {passed
                ? "🎉 PASSED — You're ready for the real test!"
                : `Need 75% to pass — you got ${pct}%. Keep practising!`}
            </div>
            <div style={{ color: T.dim, fontSize: 12, marginTop: 6, fontFamily: T.mono }}>
              Time remaining: {formatTime(timeLeft)}
            </div>
          </div>

          {/* Category breakdown */}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: "20px 24px", marginBottom: 20 }}>
            <div style={{ color: T.gold, fontSize: 11, letterSpacing: 3, fontFamily: T.mono, marginBottom: 16 }}>BREAKDOWN BY CATEGORY</div>
            {Object.entries(categoryMap).map(([cat, data]) => {
              const catPct = Math.round(((data.total - data.wrong) / data.total) * 100);
              const color = catPct >= 75 ? T.green : catPct >= 50 ? T.gold : T.red;
              return (
                <div key={cat} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: T.text, fontSize: 12 }}>{cat}</span>
                    <span style={{ color, fontSize: 12, fontFamily: T.mono, fontWeight: 700 }}>{data.total - data.wrong}/{data.total}</span>
                  </div>
                  <div style={{ height: 4, background: T.surfaceAlt, borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${catPct}%`, background: color, borderRadius: 2 }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* WhatsApp share */}
          <a href={waLink} target="_blank" rel="noreferrer" style={{
            display: "block", width: "100%", padding: "15px", background: "#25D366", color: "#fff",
            border: "none", borderRadius: 4, fontSize: 15, fontWeight: 700, cursor: "pointer",
            fontFamily: T.font, textAlign: "center", textDecoration: "none", marginBottom: 12,
          }}>
            📲 Share Result on WhatsApp
          </a>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={startExam} style={{ flex: 1, padding: "13px", background: T.gold, color: "#000", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: T.font }}>
              Retake Exam
            </button>
            <button onClick={onBack} style={{ flex: 1, padding: "13px", background: "transparent", color: T.dim, border: `1px solid ${T.border}`, borderRadius: 4, fontSize: 13, cursor: "pointer", fontFamily: T.font }}>
              ← All Drills
            </button>
          </div>

          {/* Wrong answers review */}
          {wrongAnswers.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <div style={{ color: T.red, fontSize: 11, letterSpacing: 3, fontFamily: T.mono, marginBottom: 16 }}>
                ✗ WRONG ANSWERS TO STUDY ({wrongAnswers.length})
              </div>
              {wrongAnswers.map((w, i) => (
                <div key={i} style={{ background: "#1a0000", border: `1px solid ${T.red}`, borderRadius: 4, padding: "14px 16px", marginBottom: 10 }}>
                  <div style={{ color: T.dim, fontSize: 11, fontFamily: T.mono, marginBottom: 6 }}>{w.category}</div>
                  <div style={{ color: T.text, fontSize: 13, fontWeight: 700, marginBottom: 8, lineHeight: 1.5 }}>{w.q}</div>
                  <div style={{ color: T.red, fontSize: 12, marginBottom: 4 }}>✗ You said: {w.yourAnswer}</div>
                  <div style={{ color: T.green, fontSize: 12 }}>✓ Correct: {w.correctAnswer}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
