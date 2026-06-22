import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';
import { useLang } from '../LangContext.jsx';
import { ROAD_SIGNS } from '../data/roadSigns.js';
import { sfx } from '../utils/sounds.js';
import { hapticCorrect, hapticWrong, hapticPass } from '../utils/haptics.js';
import { recordGameAnswer } from '../utils/masteryStore.js';

// ── Speech recognition setup ───────────────────────────────────────────────────
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SUPPORTED = Boolean(SpeechRecognition);

const LANG_MAP = { en: 'en-ZA', af: 'af-ZA', xh: 'xh-ZA' };
const SESSION_SIZE = 15;

// SA flag stripe colours
const STRIPE = ['#007A4D', '#FFB612', '#DE3831', '#4472CA', '#FFFFFF'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function normalise(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

function isMatch(spoken, correct) {
  const s = normalise(spoken);
  const c = normalise(correct);
  if (s === c) return true;
  // Partial match: spoken contains the correct word(s) or vice-versa
  if (s.includes(c) || c.includes(s)) return true;
  // Fuzzy: distance ≤ 2 for short answers, ≤ 3 for longer ones
  const threshold = c.length > 8 ? 3 : 2;
  return levenshtein(s, c) <= threshold;
}

// Build question set from road signs with valid images and names
function buildSession() {
  const eligible = ROAD_SIGNS.filter(s => s.img && s.name && s.meaning);
  return shuffle(eligible).slice(0, SESSION_SIZE).map(sign => ({
    sign,
    prompt: `What does this sign mean? Say the name or meaning.`,
    correct: sign.name,
    altCorrect: sign.meaning, // also accept full meaning
    img: sign.img,
    hint: sign.hint || sign.meaning,
  }));
}

export default function VoiceMode({ onBack, onPass }) {
  const { lang, t } = useLang();
  const [screen,   setScreen]   = useState('intro'); // intro | quiz | result
  const [questions, setQuestions] = useState([]);
  const [qIdx,     setQIdx]     = useState(0);
  const [score,    setScore]    = useState(0);
  const [wrong,    setWrong]    = useState([]);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const [spokenText, setSpokenText] = useState('');
  const recogRef = useRef(null);

  const current = questions[qIdx];

  const startSession = useCallback(() => {
    setQuestions(buildSession());
    setQIdx(0);
    setScore(0);
    setWrong([]);
    setTranscript('');
    setFeedback(null);
    setSpokenText('');
    setScreen('quiz');
  }, []);

  const handleAnswer = useCallback((spoken, isTap = false) => {
    if (feedback) return; // already answered
    if (!current) return;

    const correct = isMatch(spoken, current.correct) || isMatch(spoken, current.altCorrect);
    setSpokenText(isTap ? `[Tapped: ${spoken}]` : spoken);
    setFeedback(correct ? 'correct' : 'wrong');

    if (correct) {
      hapticCorrect(); sfx('correct');
      setScore(s => s + 1);
      recordGameAnswer('voice', qIdx, true);
    } else {
      hapticWrong(); sfx('wrong');
      setWrong(w => [...w, current]);
      recordGameAnswer('voice', qIdx, false);
    }

    // Auto-advance after delay
    setTimeout(() => {
      setFeedback(null);
      setTranscript('');
      setSpokenText('');
      if (qIdx + 1 >= questions.length) {
        hapticPass();
        const finalScore = score + (correct ? 1 : 0);
        if (finalScore / questions.length >= 0.75) onPass?.();
        setScreen('result');
      } else {
        setQIdx(i => i + 1);
      }
    }, 1600);
  }, [current, feedback, qIdx, questions.length, score, onPass]);

  // ── Speech Recognition ─────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!SUPPORTED || listening || feedback) return;
    const recog = new SpeechRecognition();
    recog.lang = LANG_MAP[lang] || 'en-ZA';
    recog.interimResults = false;
    recog.maxAlternatives = 3;
    recog.continuous = false;

    recog.onstart = () => setListening(true);
    recog.onend   = () => setListening(false);
    recog.onerror = () => { setListening(false); };

    recog.onresult = (e) => {
      // Try all alternatives for best match
      let bestSpoken = '';
      for (let i = 0; i < e.results[0].length; i++) {
        const alt = e.results[0][i].transcript;
        if (!bestSpoken || isMatch(alt, current?.correct)) {
          bestSpoken = alt;
        }
      }
      setTranscript(bestSpoken);
      handleAnswer(bestSpoken);
    };

    recogRef.current = recog;
    recog.start();
  }, [SUPPORTED, listening, feedback, lang, current, handleAnswer]);

  useEffect(() => {
    return () => { recogRef.current?.abort(); };
  }, []);

  // ── WhatsApp Share ─────────────────────────────────────────────────────────
  const share = useCallback(() => {
    const pct = Math.round((score / SESSION_SIZE) * 100);
    const text = `🎙️ K53 Voice Mode: ${score}/${SESSION_SIZE} (${pct}%) — I answered K53 road sign questions verbally!\n\n📲 Try K53 Drill Master: https://k53drillmaster.co.za`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener');
  }, [score]);

  // ── Intro Screen ───────────────────────────────────────────────────────────
  if (screen === 'intro') return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font, padding: '24px 16px' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.dim, fontSize: 14, cursor: 'pointer', marginBottom: 24 }}>← Back</button>

      <div style={{ textAlign: 'center', maxWidth: 360, margin: '0 auto' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎙️</div>
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Voice Mode</div>
        <div style={{ color: T.dim, fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
          Road signs flash on screen. Say the sign name or meaning aloud. Build instant recognition — the way you'll see signs while actually driving.
        </div>

        {!SUPPORTED && (
          <div style={{ background: 'rgba(222,56,49,0.15)', border: `1px solid ${T.red}`, borderRadius: 10, padding: 16, marginBottom: 24, fontSize: 13, color: T.text }}>
            ⚠️ Voice recognition is not supported in this browser. You'll see tap-to-answer buttons as a fallback.
          </div>
        )}

        <div style={{ background: T.surface, borderRadius: 12, padding: 16, marginBottom: 32, textAlign: 'left' }}>
          {['15 road signs per session', 'Say the name or meaning — both accepted', 'Fuzzy matching handles accent variations', '75%+ to pass · SA English / Afrikaans / isiXhosa'].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < 3 ? 10 : 0, fontSize: 13, color: T.dim }}>
              <span style={{ color: T.green }}>✓</span> {tip}
            </div>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={startSession}
          style={{ width: '100%', background: T.green, color: '#fff', border: 'none', borderRadius: 12, padding: '16px 24px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: T.font }}
        >
          Start Voice Drill →
        </motion.button>
      </div>
    </div>
  );

  // ── Result Screen ──────────────────────────────────────────────────────────
  if (screen === 'result') {
    const pct = Math.round((score / SESSION_SIZE) * 100);
    const passed = pct >= 75;
    return (
      <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font, padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* SA flag stripe */}
        <div style={{ display: 'flex', width: '100%', maxWidth: 360, height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 32 }}>
          {STRIPE.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
        </div>

        <div style={{ fontSize: 52, marginBottom: 8 }}>{passed ? '🎙️✅' : '🎙️'}</div>
        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{score}/{SESSION_SIZE}</div>
        <div style={{ fontSize: 18, color: passed ? T.green : T.red, fontWeight: 700, marginBottom: 24 }}>
          {pct}% — {passed ? 'Voice Trained!' : 'Keep Practising'}
        </div>

        {wrong.length > 0 && (
          <div style={{ width: '100%', maxWidth: 360, background: T.surface, borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: T.dim, letterSpacing: 2, marginBottom: 12 }}>MISSED SIGNS</div>
            {wrong.map((q, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < wrong.length - 1 ? 12 : 0 }}>
                <img src={`./signs/${q.sign.img}`} alt={q.sign.name} style={{ width: 36, height: 36, objectFit: 'contain' }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{q.sign.name}</div>
                  <div style={{ fontSize: 11, color: T.dim }}>{q.sign.hint || q.sign.meaning?.slice(0, 60)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 360 }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={share}
            style={{ background: '#25D366', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: T.font }}>
            💬 Share on WhatsApp
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={startSession}
            style={{ background: T.surface, color: T.text, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 24px', fontSize: 14, cursor: 'pointer', fontFamily: T.font }}>
            Practice Again
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={onBack}
            style={{ background: 'transparent', color: T.dim, border: 'none', borderRadius: 12, padding: '14px 24px', fontSize: 14, cursor: 'pointer', fontFamily: T.font }}>
            ← Back to home
          </motion.button>
        </div>
      </div>
    );
  }

  // ── Quiz Screen ────────────────────────────────────────────────────────────
  if (!current) return null;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font, padding: '16px 16px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.dim, fontSize: 14, cursor: 'pointer' }}>← Back</button>
        <div style={{ fontSize: 13, color: T.dim }}>{qIdx + 1} / {SESSION_SIZE}</div>
        <div style={{ fontSize: 13, color: T.green, fontWeight: 700 }}>{score} correct</div>
      </div>

      {/* Progress bar */}
      <div style={{ background: T.surface, borderRadius: 4, height: 4, marginBottom: 32, overflow: 'hidden' }}>
        <div style={{ background: T.green, height: '100%', width: `${((qIdx) / SESSION_SIZE) * 100}%`, transition: 'width 0.3s' }} />
      </div>

      {/* Sign image */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div style={{ background: T.surface, borderRadius: 16, padding: 24, border: `2px solid ${feedback === 'correct' ? T.green : feedback === 'wrong' ? T.red : T.border}`, transition: 'border-color 0.3s' }}>
          <img src={`./signs/${current.img}`} alt="road sign" style={{ width: 130, height: 130, objectFit: 'contain' }} />
        </div>
      </div>

      {/* Question */}
      <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 600, marginBottom: 8, padding: '0 16px' }}>
        {current.prompt}
      </div>
      <div style={{ textAlign: 'center', color: T.dim, fontSize: 12, marginBottom: 32 }}>
        {current.sign.code && `Sign code: ${current.sign.code}`}
      </div>

      {/* Feedback overlay */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              background: feedback === 'correct' ? 'rgba(0,122,77,0.15)' : 'rgba(222,56,49,0.15)',
              border: `1px solid ${feedback === 'correct' ? T.green : T.red}`,
              borderRadius: 12, padding: 16, marginBottom: 24, textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>{feedback === 'correct' ? '✅' : '❌'}</div>
            {spokenText && <div style={{ color: T.dim, fontSize: 12, marginBottom: 4 }}>You said: "{spokenText}"</div>}
            {feedback === 'wrong' && (
              <div style={{ fontWeight: 700, color: T.text, fontSize: 14 }}>
                Correct: {current.correct}
              </div>
            )}
            {feedback === 'wrong' && current.hint && (
              <div style={{ color: T.dim, fontSize: 12, marginTop: 6 }}>{current.hint}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transcript */}
      {transcript && !feedback && (
        <div style={{ textAlign: 'center', color: T.dim, fontSize: 13, marginBottom: 16, fontStyle: 'italic' }}>
          "{transcript}"
        </div>
      )}

      {/* Mic button */}
      {SUPPORTED && !feedback && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={startListening}
            disabled={listening}
            style={{
              width: 88, height: 88, borderRadius: '50%',
              background: listening ? T.red : T.green,
              border: 'none', cursor: listening ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, boxShadow: listening ? `0 0 0 8px rgba(222,56,49,0.2)` : 'none',
              transition: 'background 0.2s, box-shadow 0.2s',
            }}
          >
            {listening ? '🔴' : '🎙️'}
          </motion.button>
        </div>
      )}

      {listening && (
        <div style={{ textAlign: 'center', color: T.dim, fontSize: 13, marginBottom: 16, animation: 'pulse 1s infinite' }}>
          Listening…
        </div>
      )}

      {/* Tap-to-answer fallback (always shown, labeled differently if speech not supported) */}
      {!feedback && (
        <div>
          <div style={{ textAlign: 'center', color: T.dim, fontSize: 12, marginBottom: 12 }}>
            {SUPPORTED ? 'Or tap an answer:' : 'Tap an answer:'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360, margin: '0 auto' }}>
            {shuffle([
              current.correct,
              ...shuffle(ROAD_SIGNS.filter(s => s.name !== current.correct)).slice(0, 3).map(s => s.name),
            ]).slice(0, 4).map((opt, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAnswer(opt, true)}
                style={{
                  background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: 10, padding: '12px 16px', fontSize: 14,
                  color: T.text, cursor: 'pointer', fontFamily: T.font, textAlign: 'left',
                }}
              >
                {opt}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }`}</style>
    </div>
  );
}
