import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';
import { sfx } from '../utils/sounds.js';
import { hapticCorrect, hapticWrong, hapticPass } from '../utils/haptics.js';
import { recordAnswer as recordNerve } from '../utils/masteryStore.js';
import { recordResult } from '../utils/progressHistory.js';
import { recordAnswer as recordSR } from '../utils/spacedRepetition.js';
import { CRISP_SIGNS } from '../data/roadSigns.js';
import {
  TEST_FORMAT, SIGNALS_MARKINGS, rulesFor, controlsFor, shuffle, shuffleOptions,
} from '../data/learnerTestBank.js';
import MentalHealthSupport from '../components/MentalHealthSupport.jsx';

// ── Official learner's licence test format (DLTC Minimum Requirements §5.4) ───
// 28 Road signs, signals & markings (pass 23) · 28 Rules of the road (pass 22)
// · 8 Vehicle controls (pass 6) = 64 questions. EVERY section must be passed.
// The DLTC document prescribes no time limit; 60 minutes is a practice timer.
const EXAM_TIME_SECONDS = 60 * 60;
const SIGN_IMAGE_QUESTIONS = 22; // + 6 signal/marking questions = 28 in the signs section

const VARIANTS = {
  lmv: { title: "K53 Learner's Exam — Code 8 / Code B", short: 'Code 8', gameId: 'learner_exam', controlsLabel: 'Vehicle Controls (car)' },
  mc:  { title: "K53 Learner's Exam — Code 1 (Motorcycle)", short: 'Code 1', gameId: 'moto_exam', controlsLabel: 'Motorcycle Controls' },
};

const SECTION_META = {
  signs:    { icon: '🚦', color: '#FFB612', nerve: 'signs' },
  rules:    { icon: '📋', color: '#007A4D', nerve: 'rules' },
  controls: { icon: '🔩', color: '#4472CA', nerve: 'controls' },
};

const SA_STRIPE = (
  <div style={{ display: 'flex', height: 4 }}>
    {['#000', '#FFB612', '#007A4D', '#F5F5F0', '#DE3831', '#4472CA'].map((c, i) => (
      <div key={i} style={{ flex: 1, background: c }} />
    ))}
  </div>
);

// Sign-image questions: the sign's official name is option 0 in roadSigns.js.
function buildSignQuestions(count) {
  const eligible = CRISP_SIGNS.filter(s => Array.isArray(s.options) && s.options.length >= 4 && s.name && s.img);
  return shuffle(eligible).slice(0, count).map(sign => shuffleOptions({
    id: `sign_${sign.id}`,
    img: sign.img,
    q: 'What does this road sign mean?',
    options: sign.options.slice(0, 4),
    answer: 0,
    explain: `${sign.code ? sign.code + ' — ' : ''}${sign.meaning}${sign.action ? ' ' + sign.action : ''}`,
    ref: 'SGN / RTSigns chart',
    nerve: 'signs',
  }));
}

function buildExam(variant) {
  const code = variant === 'mc' ? 'mc' : 'lmv';
  const [signsCfg, rulesCfg, controlsCfg] = TEST_FORMAT.sections;
  const signs = shuffle([
    ...buildSignQuestions(SIGN_IMAGE_QUESTIONS),
    ...shuffle(SIGNALS_MARKINGS).slice(0, signsCfg.count - SIGN_IMAGE_QUESTIONS).map(q => shuffleOptions({ ...q, nerve: 'markings' })),
  ]);
  const rules = shuffle(rulesFor(code)).slice(0, rulesCfg.count).map(shuffleOptions);
  const controls = shuffle(controlsFor(code)).slice(0, controlsCfg.count).map(shuffleOptions);
  return { signs, rules, controls };
}

const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function K53LearnerExam({ onBack, onPass, onGoToGame, variant = 'lmv' }) {
  const V = VARIANTS[variant] || VARIANTS.lmv;
  const [screen, setScreen] = useState('intro'); // intro | exam | result
  const [practice, setPractice] = useState(false); // true = show answers as you go
  const [showSupport, setShowSupport] = useState(false);
  const [exam, setExam] = useState(null);
  const [section, setSection] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // `${section}-${idx}` → chosen option index
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXAM_TIME_SECONDS);
  const timerRef = useRef(null);
  const submittedRef = useRef(false);

  const SECTIONS = useMemo(() => TEST_FORMAT.sections.map(s => ({
    ...s,
    ...SECTION_META[s.key],
    label: s.key === 'controls' ? V.controlsLabel : s.label,
    questions: exam?.[s.key] || [],
  })), [exam, V.controlsLabel]);

  const startExam = useCallback(() => {
    clearInterval(timerRef.current);
    submittedRef.current = false;
    setExam(buildExam(variant));
    setSection(0);
    setQIdx(0);
    setAnswers({});
    setConfirmSubmit(false);
    setShowSupport(false);
    setTimeLeft(EXAM_TIME_SECONDS);
    setScreen('exam');
  }, [variant]);

  const scores = SECTIONS.map((sec, si) => {
    const correct = sec.questions.filter((q, qi) => answers[`${si}-${qi}`] === q.answer).length;
    const answered = sec.questions.filter((_, qi) => answers[`${si}-${qi}`] !== undefined).length;
    return { correct, answered, pass: correct >= sec.pass };
  });
  const allPassed = scores.every(s => s.pass);
  const totalQ = SECTIONS.reduce((a, s) => a + s.questions.length, 0);
  const totalAnswered = scores.reduce((a, s) => a + s.answered, 0);

  // Finalise: record every answer once, fire pass hooks, show results.
  const submit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    clearInterval(timerRef.current);
    SECTIONS.forEach((sec, si) => sec.questions.forEach((q, qi) => {
      const ok = answers[`${si}-${qi}`] === q.answer;
      recordNerve(q.nerve || sec.nerve, `${V.gameId}-${q.id}`, ok);
      recordResult(ok, sec.key);
      recordSR(`${V.gameId}_${q.id}`, ok);
    }));
    const passed = SECTIONS.every((sec, si) =>
      sec.questions.filter((q, qi) => answers[`${si}-${qi}`] === q.answer).length >= sec.pass);
    if (passed) { sfx('pass'); hapticPass(); onPass?.({ mock: true }); }
    else { sfx('wrong'); hapticWrong(); }
    setScreen('result');
  }, [SECTIONS, answers, onPass, V.gameId]);

  // Timer — submits automatically when time runs out.
  const submitRef = useRef(submit);
  submitRef.current = submit;
  useEffect(() => {
    if (screen !== 'exam') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setTimeout(() => submitRef.current(), 0); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen]);

  const currentSection = SECTIONS[section];
  const currentQ = currentSection?.questions[qIdx];
  const key = `${section}-${qIdx}`;
  const chosen = answers[key];
  const revealed = practice && chosen !== undefined;

  const handleAnswer = useCallback((optIdx) => {
    if (!currentQ || revealed) return;
    setConfirmSubmit(false);
    setAnswers(a => ({ ...a, [key]: optIdx }));
    if (practice) {
      if (optIdx === currentQ.answer) { sfx('correct'); hapticCorrect(); }
      else { sfx('wrong'); hapticWrong(); }
    }
  }, [currentQ, revealed, key, practice]);

  const isFirst = section === 0 && qIdx === 0;
  const isLast = section === SECTIONS.length - 1 && qIdx === (currentSection?.questions.length ?? 1) - 1;
  const goNext = () => {
    if (qIdx < currentSection.questions.length - 1) setQIdx(qIdx + 1);
    else if (section < SECTIONS.length - 1) { setSection(section + 1); setQIdx(0); }
  };
  const goPrev = () => {
    if (qIdx > 0) setQIdx(qIdx - 1);
    else if (section > 0) { setSection(section - 1); setQIdx(SECTIONS[section - 1].questions.length - 1); }
  };

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (screen === 'intro') return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {SA_STRIPE}
      <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} aria-label="Back"
          style={{ background: 'none', border: 'none', color: T.dim, fontSize: 22, cursor: 'pointer' }}>←</motion.button>
        <div>
          <div style={{ fontWeight: 800, fontSize: T.fontSizeLg }}>{V.title}</div>
          <div style={{ color: T.dim, fontSize: T.fontSize - 2 }}>Official DLTC format — {TEST_FORMAT.total} questions</div>
        </div>
      </div>

      <div style={{ padding: '24px 20px' }}>
        <div style={{ background: 'rgba(0,122,77,0.08)', border: '1px solid rgba(0,122,77,0.25)', borderRadius: T.radiusLg, padding: '18px 20px', marginBottom: 20 }}>
          <div style={{ fontWeight: 700, color: T.green, marginBottom: 10, fontSize: T.fontSizeLg }}>Exam structure</div>
          {TEST_FORMAT.sections.map(s => (
            <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: `1px solid ${T.border}` }}>
              <span>{SECTION_META[s.key].icon} {s.key === 'controls' ? V.controlsLabel : s.label}</span>
              <span style={{ color: T.dim, whiteSpace: 'nowrap' }}>pass {s.pass}/{s.count}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, color: T.dim, fontSize: T.fontSize - 1, lineHeight: 1.5 }}>
            You must pass <b style={{ color: T.text }}>every section</b> — a high score in one section cannot make up for another.
            Pass marks: DLTC Minimum Requirements §5.4.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { v: false, label: 'Exam mode', sub: 'Answers revealed at the end — like the real test' },
            { v: true, label: 'Practice mode', sub: 'See the correct answer after each question' },
          ].map(m => (
            <button key={m.label} onClick={() => setPractice(m.v)} aria-pressed={practice === m.v}
              style={{ textAlign: 'left', background: practice === m.v ? 'rgba(255,182,18,0.1)' : T.surface, border: `2px solid ${practice === m.v ? T.gold : T.border}`, borderRadius: T.radius, padding: '12px 12px', color: T.text, fontFamily: T.font, cursor: 'pointer' }}>
              <div style={{ fontWeight: 800, color: practice === m.v ? T.gold : T.text }}>{m.label}</div>
              <div style={{ color: T.dim, fontSize: T.fontSize - 3, marginTop: 4, lineHeight: 1.4 }}>{m.sub}</div>
            </button>
          ))}
        </div>

        <div style={{ background: T.surface, borderRadius: T.radius, padding: '14px 16px', marginBottom: 20, borderLeft: `3px solid ${T.gold}` }}>
          <div style={{ fontWeight: 700, color: T.gold, marginBottom: 6 }}>Tips</div>
          <div style={{ color: T.dim, fontSize: T.fontSize - 1, lineHeight: 1.6 }}>
            • In exam mode you can go back and change answers before you submit<br />
            • Unanswered questions count as wrong<br />
            • 60-minute practice timer (the exam submits automatically when it runs out)
          </div>
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={startExam}
          style={{ width: '100%', background: T.green, border: 'none', borderRadius: T.radiusLg, padding: 18, color: '#fff', fontWeight: 800, fontSize: T.fontSizeLg, fontFamily: T.font, cursor: 'pointer' }}>
          Start {practice ? 'Practice' : 'Exam'} — {TEST_FORMAT.total} Questions
        </motion.button>
      </div>
    </div>
  );

  // ── Support screen (after a fail) ──────────────────────────────────────────
  if (screen === 'result' && showSupport) {
    return (
      <MentalHealthSupport
        failedSections={SECTIONS.filter((_, si) => !scores[si].pass).map(sec => sec.key)}
        score={scores.reduce((sum, s) => sum + s.correct, 0)}
        total={totalQ}
        onRetry={startExam}
        onBack={onBack}
        onGoToGame={onGoToGame}
      />
    );
  }

  // ── Result screen ──────────────────────────────────────────────────────────
  if (screen === 'result') {
    const missed = [];
    SECTIONS.forEach((sec, si) => sec.questions.forEach((q, qi) => {
      const a = answers[`${si}-${qi}`];
      if (a !== q.answer) missed.push({ q, a, sec });
    }));
    const shareText = `🇿🇦 K53 Learner's Exam (${V.short})\n` +
      SECTIONS.map((sec, si) => `${sec.icon} ${sec.label}: ${scores[si].correct}/${sec.count} ${scores[si].pass ? '✅' : '❌'}`).join('\n') +
      `\n${allPassed ? '✅ PASSED all sections' : '📚 Still practising'}\nhttps://k53drillmaster.co.za`;

    return (
      <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font }}>
        {SA_STRIPE}
        <div style={{ padding: '32px 20px', maxWidth: 640, margin: '0 auto' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 8 }}>{allPassed ? '🏆' : '📘'}</div>
            <div style={{ fontWeight: 800, fontSize: 28, color: allPassed ? T.green : T.red }}>{allPassed ? 'PASS' : 'NOT YET'}</div>
            <div style={{ color: T.dim, marginTop: 4, marginBottom: 24 }}>
              {allPassed ? 'You passed every section — you are ready for the DLTC.' : 'You must pass all three sections. Review your mistakes below.'}
            </div>
          </div>

          {SECTIONS.map((sec, si) => {
            const s = scores[si];
            const pct = Math.round((s.correct / sec.count) * 100);
            return (
              <div key={sec.key} style={{ background: T.surface, borderRadius: T.radius, padding: '14px 16px', marginBottom: 12, borderLeft: `4px solid ${s.pass ? T.green : T.red}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700 }}>{sec.icon} {sec.label}</span>
                  <span style={{ color: s.pass ? T.green : T.red, fontWeight: 800, whiteSpace: 'nowrap' }}>{s.correct}/{sec.count}</span>
                </div>
                <div style={{ color: T.dim, fontSize: T.fontSize - 2, marginTop: 4 }}>
                  {s.pass ? `✓ Passed (need ${sec.pass})` : `✗ Need ${sec.pass}, got ${s.correct}`}
                </div>
                <div style={{ height: 4, background: T.border, borderRadius: 2, marginTop: 8 }}>
                  <div style={{ height: '100%', borderRadius: 2, background: s.pass ? T.green : T.red, width: `${pct}%`, transition: 'width 0.6s' }} />
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: 20, display: 'grid', gap: 12 }}>
            {!allPassed && (
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowSupport(true)}
                style={{ background: 'linear-gradient(135deg,rgba(0,122,77,0.2),rgba(68,114,202,0.15))', border: '1px solid rgba(0,122,77,0.35)', borderRadius: T.radius, padding: 16, color: T.text, fontWeight: 800, fontFamily: T.font, cursor: 'pointer' }}>
                💙 Get Support &amp; Study Plan
              </motion.button>
            )}
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')}
              style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: T.radius, padding: 14, color: '#25d366', fontWeight: 700, fontFamily: T.font, cursor: 'pointer' }}>
              💬 Share Results on WhatsApp
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={startExam}
              style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: 14, color: T.text, fontWeight: 700, fontFamily: T.font, cursor: 'pointer' }}>
              🔄 New Exam (New Questions)
            </motion.button>
            <motion.button whileTap={{ scale: 0.97 }} onClick={onBack}
              style={{ background: 'none', border: 'none', color: T.dim, fontFamily: T.font, cursor: 'pointer', padding: 10 }}>
              ← Back to Home
            </motion.button>
          </div>

          {missed.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <div style={{ fontWeight: 800, color: T.gold, marginBottom: 12 }}>Review — {missed.length} to learn</div>
              {missed.map(({ q, a, sec }, i) => (
                <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '14px 16px', marginBottom: 10 }}>
                  <div style={{ color: T.dim, fontSize: T.fontSize - 3, marginBottom: 6 }}>{sec.icon} {sec.label}</div>
                  {q.img && <img src={`/signs/${q.img}`} alt="Road sign" style={{ width: 72, height: 72, objectFit: 'contain', background: '#fff', borderRadius: 8, padding: 4, marginBottom: 8 }} />}
                  <div style={{ fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>{q.q}</div>
                  <div style={{ color: '#f87171', fontSize: T.fontSize - 1, marginBottom: 4 }}>✗ {a === undefined ? 'Not answered' : q.options[a]}</div>
                  <div style={{ color: '#4ade80', fontSize: T.fontSize - 1, marginBottom: 8 }}>✓ {q.options[q.answer]}</div>
                  {q.explain && <div style={{ color: T.dim, fontSize: T.fontSize - 2, lineHeight: 1.5 }}>{q.explain}</div>}
                  {q.ref && <div style={{ color: T.dim, fontSize: T.fontSize - 4, marginTop: 6, opacity: 0.8 }}>Source: {q.ref}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Exam screen ────────────────────────────────────────────────────────────
  if (!currentQ) return null;

  const globalIdx = SECTIONS.slice(0, section).reduce((a, s) => a + s.questions.length, 0) + qIdx;
  const timerColor = timeLeft < 300 ? T.red : timeLeft < 600 ? T.gold : T.green;
  const unanswered = totalQ - totalAnswered;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {SA_STRIPE}

      {/* Header */}
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: T.surface, borderBottom: `1px solid ${T.border}` }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => { clearInterval(timerRef.current); onBack(); }} aria-label="Leave exam"
          style={{ background: 'none', border: 'none', color: T.dim, fontSize: 20, cursor: 'pointer' }}>←</motion.button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: T.fontSize - 1, color: currentSection.color }}>
            {currentSection.icon} {currentSection.label}
          </div>
          <div style={{ color: T.dim, fontSize: T.fontSize - 3 }}>Q{qIdx + 1}/{currentSection.questions.length} · {globalIdx + 1}/{totalQ} total{practice ? ' · practice' : ''}</div>
        </div>
        <div style={{ fontWeight: 800, color: timerColor, fontSize: T.fontSizeLg, fontVariantNumeric: 'tabular-nums' }}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Section tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}` }}>
        {SECTIONS.map((sec, si) => {
          const active = si === section;
          return (
            <button key={sec.key} onClick={() => { setSection(si); setQIdx(0); }}
              style={{ flex: 1, padding: '8px 4px', background: active ? T.surface : 'transparent', border: 'none', borderBottom: active ? `2px solid ${T.green}` : '2px solid transparent', color: active ? T.text : T.dim, fontSize: T.fontSize - 3, fontFamily: T.font, cursor: 'pointer' }}>
              {sec.icon} {scores[si].answered}/{sec.count}
            </button>
          );
        })}
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: T.border }}>
        <div style={{ height: '100%', background: T.green, width: `${(totalAnswered / totalQ) * 100}%`, transition: 'width 0.2s' }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={key} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          style={{ padding: '20px 16px', maxWidth: 640, margin: '0 auto' }}>

          {currentQ.img && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <img src={`/signs/${currentQ.img}`} alt="Road sign" style={{ width: 160, height: 160, objectFit: 'contain', background: '#fff', borderRadius: 12, padding: 8 }} />
            </div>
          )}

          <div style={{ fontWeight: 700, fontSize: T.fontSizeLg, lineHeight: 1.4, marginBottom: 16, color: T.text }}>
            {currentQ.q}
          </div>

          <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
            {currentQ.options.map((opt, idx) => {
              const isCorrect = idx === currentQ.answer;
              const isChosen = idx === chosen;
              let bg = T.surface, border = T.border, col = T.text;
              if (!revealed && isChosen) { bg = 'rgba(255,182,18,0.1)'; border = T.gold; col = T.gold; }
              if (revealed && isCorrect) { bg = 'rgba(0,122,77,0.15)'; border = T.green; col = '#4ade80'; }
              if (revealed && isChosen && !isCorrect) { bg = 'rgba(222,56,49,0.15)'; border = T.red; col = '#f87171'; }
              return (
                <motion.button key={idx} whileTap={{ scale: revealed ? 1 : 0.97 }} onClick={() => handleAnswer(idx)} aria-pressed={isChosen}
                  style={{ background: bg, border: `2px solid ${border}`, borderRadius: T.radius, padding: '13px 14px', color: col, fontFamily: T.font, fontSize: T.fontSize - 1, fontWeight: 600, cursor: revealed ? 'default' : 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}>
                  <span><b style={{ marginRight: 8 }}>{String.fromCharCode(65 + idx)}.</b>{opt}</span>
                  {revealed && isCorrect && <span style={{ fontSize: 18 }}>✓</span>}
                  {revealed && isChosen && !isCorrect && <span style={{ fontSize: 18 }}>✗</span>}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {revealed && currentQ.explain && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: T.surfaceAlt || T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: '12px 14px', marginBottom: 16, fontSize: T.fontSize - 1, color: T.dim, lineHeight: 1.5 }}>
                {currentQ.explain}
                {currentQ.ref && <div style={{ fontSize: T.fontSize - 4, marginTop: 6, opacity: 0.8 }}>Source: {currentQ.ref}</div>}
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: 'flex', gap: 10 }}>
            <motion.button whileTap={{ scale: 0.97 }} onClick={goPrev} disabled={isFirst}
              style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, padding: 14, color: isFirst ? T.dim : T.text, fontFamily: T.font, fontWeight: 700, cursor: isFirst ? 'not-allowed' : 'pointer' }}>
              ← Prev
            </motion.button>
            {!isLast ? (
              <motion.button whileTap={{ scale: 0.97 }} onClick={goNext}
                style={{ flex: 2, background: T.green, border: 'none', borderRadius: T.radius, padding: 14, color: '#fff', fontFamily: T.font, fontWeight: 800, cursor: 'pointer' }}>
                Next →
              </motion.button>
            ) : (
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => (unanswered > 0 && !confirmSubmit ? setConfirmSubmit(true) : submit())}
                style={{ flex: 2, background: '#FFB612', border: 'none', borderRadius: T.radius, padding: 14, color: '#000', fontFamily: T.font, fontWeight: 800, cursor: 'pointer' }}>
                {confirmSubmit ? `Submit with ${unanswered} unanswered?` : 'Submit Exam'}
              </motion.button>
            )}
          </div>
          {!isLast && totalAnswered === totalQ && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={submit}
              style={{ width: '100%', marginTop: 10, background: '#FFB612', border: 'none', borderRadius: T.radius, padding: 14, color: '#000', fontFamily: T.font, fontWeight: 800, cursor: 'pointer' }}>
              All answered — Submit Exam
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
