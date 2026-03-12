import { useState, useEffect, useCallback } from "react";
import { T } from "../theme.js";

// Sign image from extracted PDF JPEGs
function SignImg({ src, alt, size = 130 }) {
  return (
    <img
      src={`./signs/${src}`}
      alt={alt || "road sign"}
      style={{
        width: size, height: size,
        objectFit: "contain",
        imageRendering: "crisp-edges",
        filter: "brightness(1.1) contrast(1.05)",
      }}
    />
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// QUESTION DATA
// ══════════════════════════════════════════════════════════════════════════════

const CATEGORIES = [
  { id: "regulatory", label: "Regulatory Signs", color: T.red,  desc: "Signs that give instructions drivers must obey — mainly circular or octagonal." },
  { id: "warning",    label: "Warning Signs",    color: T.gold, desc: "Triangular signs alerting drivers to hazards ahead." },
];

const QUESTIONS = [
  // ── REGULATORY ──────────────────────────────────────────────────────────────
  {
    id: "r01", category: "regulatory",
    img: "sign_010.jpg",
    question: "What does this sign mean?",
    options: ["Come to a complete stop and proceed when safe", "Slow down and yield to traffic", "Stop only if there is traffic coming", "Reduce speed to 10 km/h"],
    answer: 0,
    explanation: "A STOP sign requires a complete stop at the stop line. You must only proceed when the way is safe.",
  },
  {
    id: "r02", category: "regulatory",
    img: "sign_016.jpg",
    question: "What does this sign require you to do?",
    options: ["Stop completely", "Give way to traffic on the major road", "Sound your horn before proceeding", "Flash your headlights"],
    answer: 1,
    explanation: "A YIELD sign means you must give way to traffic already on the major road. You may slow down or stop if necessary, but a full stop is only required if traffic is present.",
  },
  {
    id: "r03", category: "regulatory",
    img: "sign_086.jpg",
    question: "What does a speed limit sign inside a red circle mean?",
    options: ["The minimum speed on this road", "The maximum speed — do not exceed this", "Recommended speed for bends ahead", "Speed limit applies only at night"],
    answer: 1,
    explanation: "A speed limit sign inside a red circle is a regulatory maximum — you must not exceed the stated speed at any time while the sign applies.",
  },
  {
    id: "r04", category: "regulatory",
    img: "sign_019.jpg",
    question: "What does this sign mean?",
    options: ["No stopping", "No U-turn", "No entry — do not drive into this road", "One-way traffic ahead"],
    answer: 2,
    explanation: "The no-entry sign (red circle, white bar) prohibits vehicles from entering that road. You will typically see it at the wrong end of a one-way street.",
  },
  {
    id: "r05", category: "regulatory",
    img: "sign_105.jpg",
    question: "What does this sign prohibit?",
    options: ["Parking on this road", "Overtaking (passing) another vehicle", "U-turns at this point", "Hooting in this area"],
    answer: 1,
    explanation: "The no-overtaking sign means you must not pass the vehicle ahead of you while this restriction applies.",
  },
  {
    id: "r06", category: "regulatory",
    img: "sign_107.jpg",
    question: "What does a blue circle with a P and a red diagonal slash mean?",
    options: ["Parking is permitted here", "No parking allowed", "Parking for disabled only", "Pay parking area"],
    answer: 1,
    explanation: "The diagonal red line through the P means parking is prohibited in this area.",
  },
  {
    id: "r07", category: "regulatory",
    img: "sign_108.jpg",
    question: "What does this sign prohibit?",
    options: ["No parking during certain hours", "Absolutely no stopping of any vehicle at any time", "No U-turns", "No dropping off passengers"],
    answer: 1,
    explanation: "The no-stopping sign means no vehicle may stop here at any time for any reason.",
  },
  {
    id: "r08", category: "regulatory",
    img: "sign_020.jpg",
    question: "What does this sign mean?",
    options: ["Turn right only", "One-way traffic in the direction of the arrow", "Detour to the right", "Right lane closed ahead"],
    answer: 1,
    explanation: "The one-way sign indicates all traffic moves in the direction shown by the arrow. Driving against the arrow is prohibited.",
  },
  {
    id: "r09", category: "regulatory",
    img: "sign_028.jpg",
    question: "What does this sign instruct you to do?",
    options: ["Turn left at the next junction", "Keep to the left of an obstruction or island", "No right turn ahead", "Give way to traffic on the left"],
    answer: 1,
    explanation: "Keep left signs are placed at islands, traffic circles, or obstructions — you must pass on the left-hand side.",
  },
  {
    id: "r10", category: "regulatory",
    img: "sign_026.jpg",
    question: "What does a blue circle with a number inside mean?",
    options: ["Maximum speed limit", "Recommended speed", "Minimum speed — do not travel slower", "Advisory speed for curves"],
    answer: 2,
    explanation: "A blue circle speed sign means MINIMUM speed. On freeways this ensures traffic flows safely and you must not go slower.",
  },
  {
    id: "r11", category: "regulatory",
    img: "sign_089.jpg",
    question: "What does this sign mean for a vehicle that exceeds the stated height?",
    options: ["The vehicle may proceed with caution", "The vehicle must not enter — it exceeds the height limit", "Proceed only at night", "Sound horn before entering"],
    answer: 1,
    explanation: "A height restriction sign means no vehicle exceeding that height may pass. Vehicles taller than the stated limit must not enter.",
  },
  {
    id: "r12", category: "regulatory",
    img: "sign_030.jpg",
    question: "What must you do when you see this sign?",
    options: ["You may only turn left — no straight or right", "Turn left is prohibited", "Left lane closed ahead", "Left turn recommended"],
    answer: 0,
    explanation: "A 'turn left only' command sign means you must turn left. Continuing straight or turning right is not permitted at this point.",
  },
  {
    id: "r13", category: "regulatory",
    img: "sign_031.jpg",
    question: "What does this sign require you to do?",
    options: ["Turn right is prohibited here", "You may only turn right — no straight or left", "Right lane merging ahead", "Right turn recommended"],
    answer: 1,
    explanation: "A 'turn right only' command sign means you must turn right. Continuing straight or turning left is not permitted.",
  },
  {
    id: "r14", category: "regulatory",
    img: "sign_101.jpg",
    question: "What does this prohibition sign mean?",
    options: ["Left turns are encouraged", "Left turns are absolutely prohibited", "Left lane closed ahead", "U-turn to the left prohibited"],
    answer: 1,
    explanation: "A left-turn prohibition sign means no vehicle may turn left at this point. You must continue straight or turn right if permitted.",
  },
  {
    id: "r15", category: "regulatory",
    img: "sign_103.jpg",
    question: "What does this sign prohibit?",
    options: ["U-turns are prohibited here", "Three-point turns are permitted", "Left turns only", "Turning in any direction"],
    answer: 0,
    explanation: "A U-turn prohibition sign means you must not make a U-turn at this point. You may still turn left or right if other signs permit.",
  },

  // ── WARNING ─────────────────────────────────────────────────────────────────
  {
    id: "w01", category: "warning",
    img: "sign_272.jpg",
    question: "A triangle with a cross inside warns of what?",
    options: ["Railway crossing ahead", "A dangerous intersection ahead", "A T-junction ahead", "Roadworks zone"],
    answer: 1,
    explanation: "The cross symbol inside a warning triangle indicates a dangerous or uncontrolled intersection ahead. Reduce speed and be prepared to yield.",
  },
  {
    id: "w02", category: "warning",
    img: "sign_276.jpg",
    question: "What does this warning triangle indicate?",
    options: ["A crossroad ahead", "A T-junction ahead", "A roundabout ahead", "End of dual carriageway"],
    answer: 1,
    explanation: "A T-junction warning sign means you are approaching a T-intersection. The road ends ahead — you must turn left or right.",
  },
  {
    id: "w03", category: "warning",
    img: "sign_308.jpg",
    question: "A circular arrow symbol inside a warning triangle means?",
    options: ["U-turns permitted ahead", "Traffic circle (roundabout) ahead", "Lane reversal ahead", "One-way system begins"],
    answer: 1,
    explanation: "The circular arrow inside a triangle warns of a traffic circle ahead. Yield to vehicles already in the circle before entering.",
  },
  {
    id: "w04", category: "warning",
    img: "sign_320.jpg",
    question: "Two arrows pointing in opposite directions inside a triangle warn of what?",
    options: ["Overtaking zone ahead", "Two-way traffic ahead — oncoming vehicles on same road", "Lane merging", "Road narrows to one lane"],
    answer: 1,
    explanation: "This sign warns that the road changes from one-way to two-way traffic, or that oncoming vehicles share the same road. Keep left and watch for approaching vehicles.",
  },
  {
    id: "w05", category: "warning",
    img: "sign_329.jpg",
    question: "A triangle containing a set of traffic lights means?",
    options: ["Traffic lights are out of order", "Traffic lights ahead — be prepared to stop", "No traffic lights on this road", "Emergency vehicle signal ahead"],
    answer: 1,
    explanation: "This warning sign alerts you to traffic lights ahead, especially where visibility is limited. Prepare to stop.",
  },
  {
    id: "w06", category: "warning",
    img: "sign_330.jpg",
    question: "What does this warning triangle mean?",
    options: ["School zone ahead", "Pedestrian crossing ahead", "Children playing area", "Cycle lane begins"],
    answer: 1,
    explanation: "The pedestrian silhouette inside a triangle warns of a pedestrian crossing ahead. Watch for people crossing the road.",
  },
  {
    id: "w07", category: "warning",
    img: "sign_343.jpg",
    question: "A pedestrian figure inside a warning triangle means?",
    options: ["Pedestrian crossing ahead", "Pedestrians may be walking alongside the road", "No pedestrians allowed", "School crossing guard ahead"],
    answer: 1,
    explanation: "This warning sign alerts drivers that pedestrians may be present on or near the road. Reduce speed and watch carefully.",
  },
  {
    id: "w08", category: "warning",
    img: "sign_345.jpg",
    question: "This yellow triangle with two figures is placed near a school. What must you do?",
    options: ["Stop and wait for the guard's signal", "Reduce speed — children may be crossing", "Sound your horn to warn children", "Proceed normally as children are supervised"],
    answer: 1,
    explanation: "A school crossing sign warns you to reduce speed. Children may be crossing. Be prepared to stop.",
  },
  {
    id: "w09", category: "warning",
    img: "sign_357.jpg",
    question: "A triangle with a large X warns of what?",
    options: ["Dangerous junction", "Level (rail) crossing ahead — watch for trains", "Road closed ahead", "No crossing"],
    answer: 1,
    explanation: "The X symbol in a triangle warns of a level crossing with a railway line. Reduce speed, look both ways, and never cross if a train is approaching.",
  },
  {
    id: "w10", category: "warning",
    img: "sign_360.jpg",
    question: "What does this warning sign tell you about the road ahead?",
    options: ["Fast-moving vehicles use this lane", "Slow-moving heavy vehicles may be on the road", "Road closed to heavy vehicles", "Overtaking of trucks is prohibited"],
    answer: 1,
    explanation: "This sign warns that slow-moving heavy vehicles (trucks, buses, construction equipment) may be travelling on the road. Allow extra following distance and overtake with care.",
  },
  {
    id: "w11", category: "warning",
    img: "sign_362.jpg",
    question: "What does this warning sign indicate about the road surface?",
    options: ["Tarred road begins", "Gravel road begins — adjust speed and following distance", "Road under construction", "Loose chippings — reduce speed"],
    answer: 1,
    explanation: "A gravel road warning sign means the tarred surface ends and a gravel road begins. Reduce speed, increase following distance, and steer gently to maintain control.",
  },
  {
    id: "w12", category: "warning",
    img: "sign_373.jpg",
    question: "A series of humps on a road surface symbol inside a triangle warns of?",
    options: ["Bridge ahead", "Speed humps or road bumps ahead", "Rough road surface", "Dip in the road"],
    answer: 1,
    explanation: "Speed humps warning signs alert you to artificial road humps ahead. Reduce speed before reaching them to avoid damaging your vehicle or losing control.",
  },
  {
    id: "w13", category: "warning",
    img: "sign_374.jpg",
    question: "A triangle showing a skidding car means?",
    options: ["Steep decline ahead", "Slippery road surface — reduce speed", "Road ends", "Gravel road begins"],
    answer: 1,
    explanation: "The skidding-car symbol warns of a slippery road — wet, icy, or loose gravel. Reduce speed and avoid sudden braking or sharp steering.",
  },
  {
    id: "w14", category: "warning",
    img: "sign_384.jpg",
    question: "An exclamation mark inside a warning triangle means?",
    options: ["Emergency services nearby", "General hazard ahead — proceed with caution", "Road ends", "High-voltage cables overhead"],
    answer: 1,
    explanation: "The general warning sign with an exclamation mark indicates a hazard that doesn't have its own specific sign. Slow down and be ready for unexpected conditions.",
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// UTILITY
// ══════════════════════════════════════════════════════════════════════════════

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ══════════════════════════════════════════════════════════════════════════════
// QUIZ ENGINE
// ══════════════════════════════════════════════════════════════════════════════

function QuizEngine({ questions, onFinish, timed }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timed ? 30 : null);

  const q = questions[idx];

  const handleAnswer = useCallback((optIdx) => {
    if (revealed) return;
    setSelected(optIdx);
    setRevealed(true);
    if (optIdx === q.answer) setScore(s => s + 1);
  }, [revealed, q]);

  useEffect(() => {
    if (!timed || revealed) return;
    if (timeLeft <= 0) { handleAnswer(-1); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timed, timeLeft, revealed, handleAnswer]);

  useEffect(() => {
    setTimeLeft(timed ? 30 : null);
    setSelected(null);
    setRevealed(false);
  }, [idx, timed]);

  function next() {
    if (idx + 1 >= questions.length) {
      onFinish(score + (selected === q.answer ? 1 : 0));
    } else {
      setIdx(i => i + 1);
    }
  }

  const cat = CATEGORIES.find(c => c.id === q.category);
  const accentColor = cat?.color ?? T.gold;

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "0 16px 40px" }}>
      {/* Progress */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ color: T.dim, fontSize: 13, fontFamily: T.mono }}>
          Question {idx + 1} / {questions.length}
        </div>
        {timed && !revealed && (
          <div style={{
            color: timeLeft <= 10 ? T.red : T.gold,
            fontSize: 20, fontFamily: T.mono, fontWeight: 700,
          }}>
            {timeLeft}s
          </div>
        )}
        <div style={{ color: T.dim, fontSize: 13, fontFamily: T.mono }}>
          Score: {score}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: T.border, height: 4, borderRadius: 2, marginBottom: 24 }}>
        <div style={{
          width: `${((idx + 1) / questions.length) * 100}%`,
          height: "100%", borderRadius: 2, background: accentColor,
          transition: "width 0.3s",
        }} />
      </div>

      {/* Sign display */}
      <div style={{
        background: T.surface,
        border: `2px solid ${T.border}`,
        borderRadius: 8,
        padding: "28px 20px",
        marginBottom: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}>
        <div style={{
          color: accentColor, fontSize: 11, letterSpacing: 3,
          fontFamily: T.mono, textTransform: "uppercase",
        }}>
          {cat?.label}
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <SignImg src={q.img} alt={q.question} size={130} />
        </div>
        <div style={{
          color: T.text, fontSize: 17, fontWeight: 600,
          textAlign: "center", lineHeight: 1.5, fontFamily: T.font,
        }}>
          {q.question}
        </div>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {q.options.map((opt, i) => {
          let bg = T.surface;
          let border = T.border;
          let color = T.text;

          if (revealed) {
            if (i === q.answer) { bg = "#0A2E0F"; border = T.green; color = T.green; }
            else if (i === selected) { bg = "#2E0A0A"; border = T.red; color = T.red; }
            else { color = T.dim; }
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={revealed}
              style={{
                background: bg, border: `2px solid ${border}`,
                borderRadius: 6, padding: "13px 16px",
                textAlign: "left", cursor: revealed ? "default" : "pointer",
                color, fontSize: 15, fontFamily: T.font,
                lineHeight: 1.4, transition: "border-color 0.15s, background 0.15s",
              }}
            >
              <span style={{ color: T.dim, fontFamily: T.mono, marginRight: 10 }}>
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Explanation + next */}
      {revealed && (
        <div>
          <div style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderLeft: `4px solid ${selected === q.answer ? T.green : T.red}`,
            borderRadius: 4, padding: "14px 16px", marginBottom: 16,
          }}>
            <div style={{
              color: selected === q.answer ? T.green : T.red,
              fontSize: 12, letterSpacing: 1, fontFamily: T.mono, marginBottom: 6,
            }}>
              {selected === q.answer ? "CORRECT" : selected === -1 ? "TIME'S UP" : "INCORRECT"}
            </div>
            <div style={{ color: T.dim, fontSize: 14, lineHeight: 1.7, fontFamily: T.font }}>
              {q.explanation}
            </div>
          </div>
          <button
            onClick={next}
            style={{
              width: "100%", padding: "14px 0",
              background: accentColor, border: "none",
              borderRadius: 6, cursor: "pointer",
              color: "#000", fontSize: 15, fontWeight: 700,
              fontFamily: T.font,
            }}
          >
            {idx + 1 >= questions.length ? "See Results" : "Next Question →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// RESULT SCREEN
// ══════════════════════════════════════════════════════════════════════════════

function ResultScreen({ score, total, onRetry, onHome }) {
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 70;
  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: "40px 16px", textAlign: "center" }}>
      <div style={{
        fontSize: 64, fontWeight: 700,
        color: passed ? T.green : T.red,
        fontFamily: T.mono, marginBottom: 8,
      }}>
        {pct}%
      </div>
      <div style={{ color: T.text, fontSize: 22, fontWeight: 700, marginBottom: 8, fontFamily: T.font }}>
        {score} / {total} correct
      </div>
      <div style={{ color: passed ? T.green : T.red, fontSize: 16, marginBottom: 32, fontFamily: T.font }}>
        {passed ? "Well done — you passed!" : "Keep practising — aim for 70%+"}
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button onClick={onRetry} style={{
          padding: "12px 28px", background: T.gold, border: "none",
          borderRadius: 6, cursor: "pointer", color: "#000",
          fontSize: 15, fontWeight: 700, fontFamily: T.font,
        }}>
          Try Again
        </button>
        <button onClick={onHome} style={{
          padding: "12px 28px", background: T.surface,
          border: `2px solid ${T.border}`, borderRadius: 6, cursor: "pointer",
          color: T.text, fontSize: 15, fontFamily: T.font,
        }}>
          ← Home
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STUDY MODE — browse signs with explanations
// ══════════════════════════════════════════════════════════════════════════════

function StudyMode({ catId, onBack }) {
  const questions = catId === "all"
    ? QUESTIONS
    : QUESTIONS.filter(q => q.category === catId);

  const [idx, setIdx] = useState(0);
  const q = questions[idx];
  const cat = CATEGORIES.find(c => c.id === q.category);

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "0 16px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={onBack} style={{
          background: "none", border: `1px solid ${T.border}`,
          color: T.dim, padding: "6px 14px", borderRadius: 4,
          cursor: "pointer", fontSize: 13, fontFamily: T.font,
        }}>← Back</button>
        <div style={{ color: T.dim, fontSize: 13, fontFamily: T.mono }}>
          {idx + 1} / {questions.length}
        </div>
      </div>

      <div style={{
        background: T.surface, border: `2px solid ${cat?.color ?? T.gold}`,
        borderRadius: 8, padding: "28px 20px", textAlign: "center", marginBottom: 16,
      }}>
        <div style={{
          color: cat?.color ?? T.gold, fontSize: 11, letterSpacing: 3,
          fontFamily: T.mono, textTransform: "uppercase", marginBottom: 16,
        }}>
          {cat?.label}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <SignImg src={q.img} alt={q.question} size={140} />
        </div>
        <div style={{ color: T.text, fontSize: 17, fontWeight: 600, fontFamily: T.font, marginBottom: 12 }}>
          {q.question}
        </div>
        <div style={{
          background: "#0A1A0F", borderRadius: 6, padding: "12px 16px",
          color: T.gold, fontSize: 15, fontFamily: T.font, fontWeight: 700,
          marginBottom: 12,
        }}>
          {q.options[q.answer]}
        </div>
        <div style={{ color: T.dim, fontSize: 14, lineHeight: 1.7, fontFamily: T.font }}>
          {q.explanation}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={() => setIdx(i => Math.max(0, i - 1))}
          disabled={idx === 0}
          style={{
            flex: 1, padding: "12px 0", background: T.surface,
            border: `2px solid ${T.border}`, borderRadius: 6,
            cursor: idx === 0 ? "default" : "pointer",
            color: idx === 0 ? T.border : T.text, fontSize: 15, fontFamily: T.font,
          }}
        >← Previous</button>
        <button
          onClick={() => setIdx(i => Math.min(questions.length - 1, i + 1))}
          disabled={idx === questions.length - 1}
          style={{
            flex: 1, padding: "12px 0", background: cat?.color ?? T.gold,
            border: "none", borderRadius: 6,
            cursor: idx === questions.length - 1 ? "default" : "pointer",
            color: "#000", fontSize: 15, fontWeight: 700, fontFamily: T.font,
            opacity: idx === questions.length - 1 ? 0.4 : 1,
          }}
        >Next →</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HOME SCREEN
// ══════════════════════════════════════════════════════════════════════════════

function HomeScreen({ onStart }) {
  const counts = {};
  QUESTIONS.forEach(q => { counts[q.category] = (counts[q.category] ?? 0) + 1; });

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px 40px" }}>
      <div style={{ color: T.dim, fontSize: 11, letterSpacing: 3, marginBottom: 20, fontFamily: T.mono, textTransform: "uppercase" }}>
        Choose a mode
      </div>

      {/* Exam mode */}
      <div style={{
        background: T.surface, border: `2px solid ${T.gold}`,
        borderRadius: 8, padding: "22px 20px", marginBottom: 14,
      }}>
        <div style={{ color: T.gold, fontSize: 11, letterSpacing: 3, fontFamily: T.mono, textTransform: "uppercase", marginBottom: 8 }}>
          EXAM MODE
        </div>
        <div style={{ color: T.text, fontSize: 18, fontWeight: 700, marginBottom: 6, fontFamily: T.font }}>
          All Signs — Mixed Quiz
        </div>
        <div style={{ color: T.dim, fontSize: 14, lineHeight: 1.6, marginBottom: 16, fontFamily: T.font }}>
          {QUESTIONS.length} questions covering all sign categories, shuffled at random. Pass mark: 70%.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onStart("exam", null, false)} style={{
            padding: "10px 22px", background: T.gold, border: "none",
            borderRadius: 5, cursor: "pointer", color: "#000",
            fontSize: 14, fontWeight: 700, fontFamily: T.font,
          }}>Start Quiz</button>
          <button onClick={() => onStart("exam", null, true)} style={{
            padding: "10px 22px", background: T.surface,
            border: `2px solid ${T.gold}`, borderRadius: 5, cursor: "pointer",
            color: T.gold, fontSize: 14, fontFamily: T.font,
          }}>⏱ Timed (30s)</button>
        </div>
      </div>

      {/* Category drills */}
      <div style={{ color: T.dim, fontSize: 11, letterSpacing: 3, margin: "24px 0 14px", fontFamily: T.mono, textTransform: "uppercase" }}>
        Drill by category
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {CATEGORIES.map(cat => (
          <div key={cat.id} style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderLeft: `4px solid ${cat.color}`,
            borderRadius: 6, padding: "16px 18px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <div style={{ color: cat.color, fontSize: 11, letterSpacing: 2, fontFamily: T.mono, marginBottom: 4 }}>
                  {counts[cat.id] ?? 0} questions
                </div>
                <div style={{ color: T.text, fontSize: 17, fontWeight: 700, fontFamily: T.font }}>
                  {cat.label}
                </div>
                <div style={{ color: T.dim, fontSize: 13, lineHeight: 1.5, marginTop: 4, fontFamily: T.font }}>
                  {cat.desc}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <button onClick={() => onStart("category", cat.id, false)} style={{
                padding: "8px 18px", background: cat.color, border: "none",
                borderRadius: 4, cursor: "pointer", color: "#000",
                fontSize: 13, fontWeight: 700, fontFamily: T.font,
              }}>Quiz</button>
              <button onClick={() => onStart("category", cat.id, true)} style={{
                padding: "8px 18px", background: T.surface,
                border: `1px solid ${cat.color}`, borderRadius: 4,
                cursor: "pointer", color: cat.color, fontSize: 13, fontFamily: T.font,
              }}>⏱ Timed</button>
              <button onClick={() => onStart("study", cat.id, false)} style={{
                padding: "8px 18px", background: "transparent",
                border: `1px solid ${T.border}`, borderRadius: 4,
                cursor: "pointer", color: T.dim, fontSize: 13, fontFamily: T.font,
              }}>Study mode</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function RoadSignsQuiz({ onBack, onPass }) {
  const [screen, setScreen] = useState("home");   // "home" | "quiz" | "study" | "result"
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [finalScore, setFinalScore] = useState(null);
  const [timed, setTimed] = useState(false);

  function handleStart(mode, catId, timedMode) {
    setTimed(timedMode);
    const pool = catId ? QUESTIONS.filter(q => q.category === catId) : QUESTIONS;
    if (mode === "study") {
      setActiveQuestions(pool);
      setScreen("study_" + (catId ?? "all"));
    } else {
      setActiveQuestions(shuffle(pool));
      setScreen("quiz");
    }
  }

  function handleFinish(score) {
    setFinalScore(score);
    const pct = Math.round((score / activeQuestions.length) * 100);
    if (pct >= 70 && onPass) onPass();
    setScreen("result");
  }

  const studyCatId = screen.startsWith("study_") ? screen.replace("study_", "") : null;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text }}>
      {/* Header */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "0 16px" }}>
        <div style={{ display: "flex", height: 6 }}>
          {["#000000","#FFB612","#007A4D","#F5F5F0","#DE3831","#4472CA"].map((c, i) => (
            <div key={i} style={{ flex: 1, background: c }} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0" }}>
          <button
            onClick={screen === "home" ? onBack : () => setScreen("home")}
            style={{
              background: "none", border: "none", color: T.dim,
              cursor: "pointer", fontSize: 20, padding: "4px 8px",
            }}
          >←</button>
          <div style={{ color: T.gold, fontSize: 16, fontWeight: 700, fontFamily: T.font }}>
            Road Signs Quiz
          </div>
          <div style={{ width: 36 }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ paddingTop: 24 }}>
        {screen === "home" && <HomeScreen onStart={handleStart} />}
        {screen === "quiz" && (
          <QuizEngine
            questions={activeQuestions}
            onFinish={handleFinish}
            timed={timed}
          />
        )}
        {screen === "result" && (
          <ResultScreen
            score={finalScore}
            total={activeQuestions.length}
            onRetry={() => {
              setActiveQuestions(q => shuffle([...q]));
              setScreen("quiz");
            }}
            onHome={() => setScreen("home")}
          />
        )}
        {studyCatId && (
          <StudyMode catId={studyCatId} onBack={() => setScreen("home")} />
        )}
      </div>
    </div>
  );
}
