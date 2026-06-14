import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';
import { sfx } from '../utils/sounds.js';
import { hapticCorrect, hapticWrong, hapticPass } from '../utils/haptics.js';
import { recordGameAnswer } from '../utils/masteryStore.js';
import { ROAD_SIGNS } from '../data/roadSigns.js';

// ── Exam structure (mirrors actual DLTC learner's test) ──────────────────────
// Code B: 28 Road Signs + 28 Rules of Road + 8 Vehicle Controls = 64 questions
// Pass: signs ≥ 23/28 | rules ≥ 22/28 | controls ≥ 6/8
const PASS_MARKS = { signs: 23, rules: 22, controls: 6 };
const SECTION_TOTALS = { signs: 28, rules: 28, controls: 8 };
const EXAM_TIME_SECONDS = 60 * 60; // 60 minutes (generous for practice)

const SA_STRIPE = (
  <div style={{ display: 'flex', height: 4 }}>
    {['#000', '#FFB612', '#007A4D', '#F5F5F0', '#DE3831', '#4472CA'].map((c, i) => (
      <div key={i} style={{ flex: 1, background: c }} />
    ))}
  </div>
);

// ── Rules of Road questions (28 verified K53 questions) ──────────────────────
const RULES_QUESTIONS = [
  { q: 'What is the general speed limit in a built-up area?', options: ['40 km/h','60 km/h','80 km/h','100 km/h'], answer: 1 },
  { q: 'What is the speed limit on a public road outside a built-up area (not a freeway)?', options: ['80 km/h','100 km/h','110 km/h','120 km/h'], answer: 1 },
  { q: 'What is the maximum speed on a freeway?', options: ['100 km/h','110 km/h','120 km/h','140 km/h'], answer: 2 },
  { q: 'What is the minimum following distance you must maintain behind the vehicle in front?', options: ['1 second','2 seconds','3 seconds','4 seconds'], answer: 1 },
  { q: 'What is the legal blood alcohol limit for a non-professional driver?', options: ['0.02 g/100 ml','0.05 g/100 ml','0.08 g/100 ml','0.10 g/100 ml'], answer: 1 },
  { q: 'What is the legal blood alcohol limit for a professional driver?', options: ['0.00 g/100 ml','0.02 g/100 ml','0.05 g/100 ml','0.08 g/100 ml'], answer: 1 },
  { q: 'Your emergency warning triangle must be placed at least how far behind your vehicle on a freeway?', options: ['15 m','30 m','45 m','90 m'], answer: 2 },
  { q: 'Your dipped headlamps must illuminate the road at least how far ahead?', options: ['30 m','45 m','60 m','100 m'], answer: 1 },
  { q: 'Your main beam (high beam) headlamps must illuminate at least how far ahead?', options: ['45 m','60 m','100 m','150 m'], answer: 2 },
  { q: 'You must switch on headlights from:', options: ['Sunset to sunrise only','Between sunset and sunrise AND when persons or vehicles are not visible at 150 m','Only when it is completely dark','From 1 hour after sunset to 1 hour before sunrise'], answer: 1 },
  { q: 'At an uncontrolled intersection, you must yield to traffic:', options: ['Coming from your left','Coming from your right','Approaching from ahead','All traffic regardless of direction'], answer: 1 },
  { q: 'At a four-way stop with simultaneous arrivals, the vehicle with right of way is:', options: ['The vehicle on the left','The vehicle on the right','The vehicle going straight','The largest vehicle'], answer: 1 },
  { q: 'You may NOT overtake when:', options: ['On a wide straight road','Approaching a pedestrian crossing','On a multi-lane road','The road is clear ahead'], answer: 1 },
  { q: 'A solid white line in the centre of the road means:', options: ['You may cross it to overtake if safe','You may NOT cross or straddle it to overtake','You may cross it only to turn right','It is a lane-guidance marking only'], answer: 1 },
  { q: 'You must NOT park within how many metres of an intersection?', options: ['3 m','5 m','9 m','15 m'], answer: 1 },
  { q: 'You must NOT park within how many metres of a fire hydrant?', options: ['1 m','1.5 m','3 m','5 m'], answer: 1 },
  { q: 'You must NOT park within how many metres of a pedestrian crossing?', options: ['3 m','5 m','9 m','15 m'], answer: 2 },
  { q: 'When must you yield to a pedestrian?', options: ['Only at traffic lights on green pedestrian signal','When they are in or about to enter a pedestrian crossing','Only at marked crossings with studs','Only in school zones'], answer: 1 },
  { q: 'When an emergency vehicle with sirens and lights approaches, you must:', options: ['Accelerate to clear the way','Move to the left and stop if necessary to allow it to pass','Stop anywhere immediately','Keep your speed — the emergency vehicle will go around you'], answer: 1 },
  { q: 'Pedestrians walking on a road with no pavement must walk:', options: ['On the left, with traffic','On the right, facing oncoming traffic','In the centre of the road','On either side — they choose'], answer: 1 },
  { q: 'When following a vehicle at night within 150 m, you must:', options: ['Keep high beam to see better','Dip your headlights','Flash to warn the driver ahead','Use hazard lights'], answer: 1 },
  { q: 'You may make a U-turn:', options: ['Only in a built-up area','Where it is safe and not specifically prohibited','On any road with a broken centre line','Only on a one-way road'], answer: 1 },
  { q: 'When joining a freeway from an on-ramp, right of way belongs to:', options: ['The merging vehicle','Traffic already on the freeway','The vehicle that arrives first','The vehicle in the left lane'], answer: 1 },
  { q: 'On a freeway, you must NOT stop except:', options: ['When you need a rest','At an emergency or in a genuine breakdown','When you miss your exit','To allow a passenger to board'], answer: 1 },
  { q: 'The minimum age for a Code B learner\'s licence is:', options: ['16 years','17 years','18 years','21 years'], answer: 1 },
  { q: 'Overtaking on the left is generally:', options: ['Permitted on multi-lane roads if traffic is moving slower in the right lane','Permitted at all times on multi-lane roads','Prohibited at all times','Only permitted on freeways'], answer: 0 },
  { q: 'Before changing lanes, the correct sequence is:', options: ['Signal → Mirror → Blind spot → Move','Mirror → Signal → Blind spot → Move','Blind spot → Signal → Mirror → Move','Move → Signal → Check mirrors'], answer: 1 },
  { q: 'When parking facing uphill with a kerb, you should turn your front wheels:', options: ['Straight ahead','Away from the kerb (to the left)','Into the kerb (to the right)','It does not matter'], answer: 2 },
];

// ── Vehicle Controls questions (8 verified K53 controls questions) ────────────
const CONTROLS_QUESTIONS = [
  { q: 'When must you switch on your headlights?', options: ['Only when it is completely dark','Between sunset and sunrise AND when visibility is poor or persons not visible at 150 m','Only at night after 21:00','Only in a tunnel'], answer: 1 },
  { q: 'What does a red oil pressure warning light mean?', options: ['Oil change is due soon','Critical oil pressure loss — stop and switch off the engine immediately','Low oil level only','Normal at start-up — ignore it'], answer: 1 },
  { q: 'The handbrake must be applied when:', options: ['Stopping at a traffic light','Parking — especially on a slope, where it must be applied firmly','Only on steep inclines','Only on automatic vehicles'], answer: 1 },
  { q: 'A spongy brake pedal that goes close to the floor indicates:', options: ['Normal on older vehicles','Air in the brake lines or low brake fluid — have it checked immediately','Brakes are overheating','Wheel alignment needed'], answer: 1 },
  { q: 'Before driving, you must ensure your seat is adjusted so that:', options: ['You are comfortable','You can fully depress all pedals and see clearly over the steering wheel','Your back is straight only','You can reach the gear lever with ease'], answer: 1 },
  { q: 'The minimum legal tyre tread depth in South Africa is:', options: ['0.5 mm','1 mm','1.6 mm','3 mm'], answer: 2 },
  { q: 'Who is responsible for ensuring all passengers under 14 years are wearing seatbelts?', options: ['The passengers themselves','The driver','The vehicle owner','The parents only'], answer: 1 },
  { q: 'If your hooter (horn) is not working, you:', options: ['May drive normally — the hooter is optional','Must not drive the vehicle — a functioning hooter is a legal requirement','May drive only in daytime','Must display a "No hooter" warning sign'], answer: 1 },
];

// ── Sign question builder from ROAD_SIGNS data ────────────────────────────────
function buildSignQuestions(count = 28) {
  const eligible = ROAD_SIGNS.filter(s => s.options && s.options.length >= 4 && s.name && s.img);
  const shuffled = [...eligible].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map(sign => ({
    signId: sign.id,
    img: sign.img,
    name: sign.name,
    hint: sign.hint,
    q: `What does this road sign mean?`,
    options: sign.options,
    answer: 0, // options[0] is always correct in ROAD_SIGNS
    explanation: sign.meaning + (sign.action ? ' ' + sign.action : ''),
  }));
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

// ── Main component ────────────────────────────────────────────────────────────
export default function K53LearnerExam({ onBack, onPass }) {
  const [screen, setScreen] = useState('intro'); // intro | exam | review | result
  const [section, setSection] = useState(0); // 0=signs 1=rules 2=controls
  const [allQuestions, setAllQuestions] = useState(null);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // flat key → chosen index
  const [chosen, setChosen] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME_SECONDS);
  const [started, setStarted] = useState(false);
  const timerRef = useRef(null);

  const SECTIONS = [
    { key: 'signs',    label: 'Road Signs',       icon: '🚦', questions: allQuestions?.signs    || [], pass: PASS_MARKS.signs,    total: SECTION_TOTALS.signs },
    { key: 'rules',    label: 'Rules of Road',    icon: '📋', questions: allQuestions?.rules    || [], pass: PASS_MARKS.rules,    total: SECTION_TOTALS.rules },
    { key: 'controls', label: 'Vehicle Controls', icon: '🔩', questions: allQuestions?.controls || [], pass: PASS_MARKS.controls, total: SECTION_TOTALS.controls },
  ];

  const startExam = useCallback(() => {
    const signQs = buildSignQuestions(28);
    const rulesQs = shuffle([...RULES_QUESTIONS]).slice(0, 28);
    const controlsQs = shuffle([...CONTROLS_QUESTIONS]).slice(0, 8);
    setAllQuestions({ signs: signQs, rules: rulesQs, controls: controlsQs });
    setSection(0);
    setQIdx(0);
    setAnswers({});
    setChosen(null);
    setRevealed(false);
    setTimeLeft(EXAM_TIME_SECONDS);
    setStarted(true);
    setScreen('exam');
  }, []);

  // Timer
  useEffect(() => {
    if (!started || screen !== 'exam') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setScreen('result'); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [started, screen]);

  const currentSection = SECTIONS[section];
  const currentQ = currentSection?.questions[qIdx];
  const globalKey = `${section}-${qIdx}`;

  const handleAnswer = useCallback((optIdx) => {
    if (revealed) return;
    setChosen(optIdx);
    setRevealed(true);
    const correct = optIdx === currentQ.answer;
    if (correct) { sfx('correct'); hapticCorrect(); }
    else { sfx('wrong'); hapticWrong(); }
    setAnswers(a => ({ ...a, [globalKey]: optIdx }));
    recordGameAnswer('mockexam', globalKey, correct);
  }, [revealed, currentQ, globalKey]);

  const handleNext = useCallback(() => {
    const nextIdx = qIdx + 1;
    if (nextIdx < currentSection.questions.length) {
      setQIdx(nextIdx);
      setChosen(answers[`${section}-${nextIdx}`] ?? null);
      setRevealed(answers[`${section}-${nextIdx}`] !== undefined);
    } else if (section < SECTIONS.length - 1) {
      const nextSection = section + 1;
      setSection(nextSection);
      setQIdx(0);
      setChosen(answers[`${nextSection}-0`] ?? null);
      setRevealed(answers[`${nextSection}-0`] !== undefined);
    } else {
      clearInterval(timerRef.current);
      setScreen('result');
    }
  }, [qIdx, section, currentSection, answers, SECTIONS.length]);

  const handlePrev = useCallback(() => {
    if (qIdx > 0) {
      const prevIdx = qIdx - 1;
      setQIdx(prevIdx);
      setChosen(answers[`${section}-${prevIdx}`] ?? null);
      setRevealed(answers[`${section}-${prevIdx}`] !== undefined);
    } else if (section > 0) {
      const prevSection = section - 1;
      const prevQs = SECTIONS[prevSection].questions;
      const prevIdx = prevQs.length - 1;
      setSection(prevSection);
      setQIdx(prevIdx);
      setChosen(answers[`${prevSection}-${prevIdx}`] ?? null);
      setRevealed(answers[`${prevSection}-${prevIdx}`] !== undefined);
    }
  }, [qIdx, section, answers, SECTIONS]);

  // ── Score calculation ──────────────────────────────────────────────────────
  const scores = SECTIONS.map((sec, si) => {
    const correct = sec.questions.filter((_, qi) => {
      const chosen = answers[`${si}-${qi}`];
      return chosen !== undefined && chosen === sec.questions[qi].answer;
    }).length;
    const answered = sec.questions.filter((_, qi) => answers[`${si}-${qi}`] !== undefined).length;
    return { correct, answered, pass: correct >= sec.pass };
  });
  const allPassed = scores.every(s => s.pass);

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (screen === 'intro') return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {SA_STRIPE}
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack}
          style={{ background: 'none', border: 'none', color: T.dim, fontSize: 22, cursor: 'pointer' }}>←</motion.button>
        <div>
          <div style={{ fontWeight: 800, fontSize: T.fontSizeLg }}>K53 Learner's Exam</div>
          <div style={{ color: T.dim, fontSize: T.fontSize - 2 }}>Official DLTC format — 64 questions</div>
        </div>
      </div>

      <div style={{ padding: '24px 20px' }}>
        <div style={{ background: 'rgba(0,122,77,0.08)', border: '1px solid rgba(0,122,77,0.25)', borderRadius: T.radiusLg, padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: T.green, marginBottom: 10, fontSize: T.fontSizeLg }}>Exam Structure</div>
          {[
            { icon: '🚦', label: 'Road Signs', q: 28, pass: 23 },
            { icon: '📋', label: 'Rules of Road', q: 28, pass: 22 },
            { icon: '🔩', label: 'Vehicle Controls', q: 8, pass: 6 },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${T.border}` }}>
              <span>{s.icon} {s.label}</span>
              <span style={{ color: T.dim }}>{s.q} questions — pass {s.pass}/{s.q}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, color: T.dim, fontSize: T.fontSize - 1 }}>
            You must pass ALL THREE sections to pass the exam. You have 60 minutes.
          </div>
        </div>

        <div style={{ background: T.surface, borderRadius: T.radius, padding: '14px 16px', marginBottom: 20, borderLeft: `3px solid ${T.gold}` }}>
          <div style={{ fontWeight: 700, color: T.gold, marginBottom: 6 }}>Tips</div>
          <div style={{ color: T.dim, fontSize: T.fontSize - 1, lineHeight: 1.6 }}>
            • You can go back and change answers before submitting<br />
            • Road sign questions pull randomly from our 201-sign database<br />
            • Each section is scored independently
          </div>
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={startExam}
          style={{ width: '100%', background: T.green, border: 'none', borderRadius: T.radiusLg, padding: 18, color: '#fff', fontWeight: 800, fontSize: T.fontSizeLg, fontFamily: T.font, cursor: 'pointer' }}>
          Start Exam — 60 Minutes
        </motion.button>
      </div>
    </div>
  );

  // ── Result screen ──────────────────────────────────────────────────────────
  if (screen === 'result') return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {SA_STRIPE}
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>{allPassed ? '🏆' : '📘'}</div>
        <div style={{ fontWeight: 800, fontSize: 28, color: allPassed ? T.green : T.red }}>
          {allPassed ? 'PASS' : 'FAIL'}
        </div>
        <div style={{ color: T.dim, marginTop: 4, marginBottom: 24 }}>
          {allPassed ? 'You are ready for the real test!' : 'Keep practising — you need to pass all three sections.'}
        </div>

        {SECTIONS.map((sec, si) => {
          const s = scores[si];
          const pct = Math.round((s.correct / sec.total) * 100);
          return (
            <div key={sec.key} style={{ background: T.surface, borderRadius: T.radius, padding: '14px 16px', marginBottom: 12, borderLeft: `4px solid ${s.pass ? T.green : T.red}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>{sec.icon} {sec.label}</span>
                <span style={{ color: s.pass ? T.green : T.red, fontWeight: 800 }}>{s.correct}/{sec.total} ({pct}%)</span>
              </div>
              <div style={{ color: T.dim, fontSize: T.fontSize - 2, marginTop: 4 }}>
                {s.pass ? `✓ PASSED (need ${sec.pass})` : `✗ Need ${sec.pass}, got ${s.correct}`}
              </div>
              <div style={{ height: 4, background: T.border, borderRadius: 2, marginTop: 8 }}>
                <div style={{ height: '100%', borderRadius: 2, background: s.pass ? T.green : T.red, width: `${pct}%`, transition: 'width 0.6s' }} />
              </div>
            </div>
          );
        })}

        <div style={{ marginTop: 24, display: 'grid', gap: 12 }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => {
            const sigScore = scores[0]; const ruleScore = scores[1]; const ctrlScore = scores[2];
            const text = `🇿🇦 K53 Learner's Exam Simulator\n🚦 Signs: ${sigScore.correct}/28\n📋 Rules: ${ruleScore.correct}/28\n🔩 Controls: ${ctrlScore.correct}/8\n${allPassed ? '✅ PASS' : '❌ FAIL — keep practising!'}\nK53 Drill Master`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
          }} style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: T.radius, padding: 14, color: '#25d366', fontWeight: 700, fontFamily: T.font, cursor: 'pointer' }}>
            💬 Share Results on WhatsApp
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={startExam}
            style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: 14, color: T.text, fontWeight: 700, fontFamily: T.font, cursor: 'pointer' }}>
            🔄 Try Again (New Questions)
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onBack}
            style={{ background: 'none', border: 'none', color: T.dim, fontFamily: T.font, cursor: 'pointer', padding: 10 }}>
            ← Back to Home
          </motion.button>
        </div>
      </div>
    </div>
  );

  // ── Exam screen ────────────────────────────────────────────────────────────
  if (!currentQ) return null;

  const totalQ = SECTIONS.reduce((a, s) => a + s.questions.length, 0);
  const globalIdx = SECTIONS.slice(0, section).reduce((a, s) => a + s.questions.length, 0) + qIdx;
  const timerColor = timeLeft < 300 ? T.red : timeLeft < 600 ? T.gold : T.green;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {SA_STRIPE}

      {/* Header */}
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: T.surface, borderBottom: `1px solid ${T.border}` }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { clearInterval(timerRef.current); onBack(); }}
          style={{ background: 'none', border: 'none', color: T.dim, fontSize: 20, cursor: 'pointer' }}>←</motion.button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: T.fontSize - 1, color: currentSection.key === 'signs' ? '#FFB612' : currentSection.key === 'rules' ? T.green : '#4472CA' }}>
            {currentSection.icon} {currentSection.label}
          </div>
          <div style={{ color: T.dim, fontSize: T.fontSize - 3 }}>Q{qIdx + 1}/{currentSection.questions.length} · {globalIdx + 1}/{totalQ} total</div>
        </div>
        <div style={{ fontWeight: 800, color: timerColor, fontSize: T.fontSizeLg }}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Section tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}` }}>
        {SECTIONS.map((sec, si) => {
          const sAnswered = sec.questions.filter((_, qi) => answers[`${si}-${qi}`] !== undefined).length;
          const active = si === section;
          return (
            <button key={sec.key} onClick={() => { setSection(si); setQIdx(0); setChosen(answers[`${si}-0`] ?? null); setRevealed(answers[`${si}-0`] !== undefined); }}
              style={{ flex: 1, padding: '8px 4px', background: active ? T.surface : 'transparent', border: 'none', borderBottom: active ? `2px solid ${T.green}` : '2px solid transparent', color: active ? T.text : T.dim, fontSize: T.fontSize - 3, fontFamily: T.font, cursor: 'pointer' }}>
              {sec.icon} {sAnswered}/{sec.total}
            </button>
          );
        })}
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: T.border }}>
        <div style={{ height: '100%', background: T.green, width: `${((globalIdx + 1) / totalQ) * 100}%`, transition: 'width 0.2s' }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={globalKey} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          style={{ padding: '20px 16px' }}>

          {/* Sign image (signs section only) */}
          {currentSection.key === 'signs' && currentQ.img && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <img src={`/signs/${currentQ.img}`} alt="" style={{ width: 140, height: 140, objectFit: 'contain', background: T.surface, borderRadius: 12, padding: 8 }} />
              {revealed && currentQ.hint && (
                <div style={{ marginTop: 6, color: T.dim, fontSize: T.fontSize - 2 }}>{currentQ.hint}</div>
              )}
            </div>
          )}

          {/* Question */}
          <div style={{ fontWeight: 700, fontSize: T.fontSizeLg, lineHeight: 1.4, marginBottom: 16, color: T.text }}>
            {currentQ.q}
          </div>

          {/* Options */}
          <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
            {currentQ.options.map((opt, idx) => {
              const isCorrect = idx === currentQ.answer;
              const isChosen = idx === chosen;
              let bg = T.surface, border = T.border, col = T.text;
              if (!revealed && isChosen) { bg = 'rgba(255,182,18,0.1)'; border = T.gold; col = T.gold; }
              if (revealed && isCorrect) { bg = 'rgba(0,122,77,0.15)'; border = T.green; col = '#4ade80'; }
              if (revealed && isChosen && !isCorrect) { bg = 'rgba(222,56,49,0.15)'; border = T.red; col = '#f87171'; }
              return (
                <motion.button key={idx} whileTap={{ scale: revealed ? 1 : 0.97 }} onClick={() => handleAnswer(idx)}
                  style={{ background: bg, border: `2px solid ${border}`, borderRadius: T.radius, padding: '13px 14px', color: col, fontFamily: T.font, fontSize: T.fontSize - 1, fontWeight: 600, cursor: revealed ? 'default' : 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
                  <span><b style={{ marginRight: 8 }}>{String.fromCharCode(65 + idx)}.</b>{opt}</span>
                  {revealed && isCorrect && <span style={{ fontSize: 18 }}>✓</span>}
                  {revealed && isChosen && !isCorrect && <span style={{ fontSize: 18 }}>✗</span>}
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {revealed && currentQ.explanation && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: T.surfaceAlt || T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '12px 14px', marginBottom: 16, fontSize: T.fontSize - 1, color: T.dim, lineHeight: 1.5 }}>
                {currentQ.explanation}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handlePrev}
              disabled={section === 0 && qIdx === 0}
              style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: 14, color: (section === 0 && qIdx === 0) ? T.dim : T.text, fontFamily: T.font, fontWeight: 700, cursor: (section === 0 && qIdx === 0) ? 'not-allowed' : 'pointer' }}>
              ← Prev
            </motion.button>
            {section < SECTIONS.length - 1 || qIdx < currentSection.questions.length - 1 ? (
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleNext}
                style={{ flex: 2, background: T.green, border: 'none', borderRadius: T.radius, padding: 14, color: '#fff', fontFamily: T.font, fontWeight: 800, cursor: 'pointer' }}>
                Next →
              </motion.button>
            ) : (
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => { clearInterval(timerRef.current); setScreen('result'); if (allPassed) { hapticPass(); onPass?.(); } }}
                style={{ flex: 2, background: '#FFB612', border: 'none', borderRadius: T.radius, padding: 14, color: '#000', fontFamily: T.font, fontWeight: 800, cursor: 'pointer' }}>
                Submit Exam
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
