import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';

const CSS = `
  @keyframes roadFlow {
    from { background-position: center 0px; }
    to   { background-position: center 56px; }
  }
  @keyframes dotPulse {
    0%,100% { transform: scale(1); opacity: 1; }
    50%      { transform: scale(1.7); opacity: 0.4; }
  }
`;

function SignStop() {
  return (
    <svg width="72" height="72" viewBox="0 0 76 76">
      <polygon points="23,3 53,3 73,23 73,53 53,73 23,73 3,53 3,23"
        fill="#C0392B" stroke="white" strokeWidth="4" strokeLinejoin="round"/>
      <polygon points="26,8 50,8 68,26 68,50 50,68 26,68 8,50 8,26"
        fill="none" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
      <text x="38" y="46" textAnchor="middle" fill="white" fontSize="13"
        fontWeight="900" fontFamily="system-ui,sans-serif" letterSpacing="1.5">STOP</text>
    </svg>
  );
}

function SignSpeed({ n }) {
  return (
    <svg width="72" height="72" viewBox="0 0 76 76">
      <circle cx="38" cy="38" r="35" fill="white" stroke="#C0392B" strokeWidth="6"/>
      <text x="38" y="52" textAnchor="middle" fill="#111" fontSize="30"
        fontWeight="900" fontFamily="system-ui,sans-serif">{n}</text>
    </svg>
  );
}

function SignYield() {
  return (
    <svg width="72" height="80" viewBox="0 0 76 84">
      <polygon points="38,3 73,81 3,81" fill="white" stroke="#C0392B" strokeWidth="4" strokeLinejoin="round"/>
      <polygon points="38,20 63,71 13,71" fill="#C0392B"/>
    </svg>
  );
}

const DEMO = [
  {
    sign: <SignStop />,
    q: 'What does this road sign mean?',
    options: ['Stop — give way to ALL traffic', 'Give way to oncoming traffic', 'Slow down and proceed', 'No vehicles beyond this point'],
    correct: 0,
    ref: 'R1 — Stop Sign · Code 8',
  },
  {
    sign: <SignSpeed n="60" />,
    q: 'What does this sign tell you?',
    options: ['Maximum speed is 60 km/h', 'Minimum speed is 60 km/h', 'Recommended speed 60 km/h', 'End of 60 km/h zone'],
    correct: 0,
    ref: 'R210 — Speed Limit · Built-up areas',
  },
  {
    sign: <SignYield />,
    q: 'At this sign you MUST:',
    options: ['Give way to all other traffic', 'Stop completely first', 'Yield only to pedestrians', 'Stop if another car is close'],
    correct: 0,
    ref: 'R2 — Yield/Give Way',
  },
];

const TESTIMONIALS = [
  { text: 'Passed first attempt after one week of drills. The nervous system shows you exactly what to focus on.', name: 'Thabo M.', city: 'Johannesburg', initial: 'T', color: '#007A4D' },
  { text: 'Failed twice before this app. The mock exam is identical to the real DLTC test — nothing surprises you on test day.', name: 'Priya N.', city: 'Durban', initial: 'P', color: '#FFB612' },
  { text: 'The WhatsApp share got my whole friend group competing. We all passed the same month.', name: 'Aimée D.', city: 'Cape Town', initial: 'A', color: '#4472CA' },
];

const FEATURES = [
  {
    color: '#007A4D',
    label: 'AI-POWERED',
    title: 'Nervous System',
    desc: "Tracks every answer. Knows which topics you're forgetting before you do. Sends you back to them at exactly the right moment.",
  },
  {
    color: '#FFB612',
    label: 'OFFICIAL FORMAT',
    title: 'Full Mock Exam',
    desc: 'Exact DLTC structure — 28 signs, 28 rules, 8 controls. Scored per section. No surprises on the day.',
  },
  {
    color: '#DE3831',
    label: 'HABIT ENGINE',
    title: 'Daily Streaks & XP',
    desc: 'Streaks, badges, weekly challenges. Built to make ten minutes of study feel like the best part of your day.',
  },
  {
    color: '#4472CA',
    label: 'WORKS OFFLINE',
    title: 'No Data Needed',
    desc: 'Full PWA — install once and study on taxi, at home, anywhere. No data charges after install.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function Landing({ onStart }) {
  const [demoIdx, setDemoIdx] = useState(0);
  const [chosen, setChosen] = useState(null);
  const q = DEMO[demoIdx % DEMO.length];

  const handleAnswer = (idx) => {
    if (chosen !== null) return;
    setChosen(idx);
    setTimeout(() => { setChosen(null); setDemoIdx(i => i + 1); }, 1300);
  };

  const BG = '#0D0E18';
  const SURFACE = '#12141F';
  const TEXT = '#E8EAF2';
  const DIM = 'rgba(232,234,242,0.45)';
  const GREEN = '#007A4D';
  const GOLD = '#FFB612';
  const RED = '#DE3831';
  const FONT = "'Inter','Segoe UI',system-ui,sans-serif";

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, fontFamily: FONT, overflowX: 'hidden', paddingBottom: 120 }}>
      <style>{CSS}</style>

      {/* SA flag stripe */}
      <div style={{ display: 'flex', height: 6 }}>
        {['#000', '#FFB612', '#007A4D', '#F5F5F0', '#DE3831', '#4472CA'].map((c, i) => (
          <div key={i} style={{ flex: 1, background: c }} />
        ))}
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '44px 22px 48px',
        backgroundColor: BG,
        backgroundImage: 'repeating-linear-gradient(180deg, rgba(255,255,255,0.055) 0px, rgba(255,255,255,0.055) 24px, transparent 24px, transparent 56px)',
        backgroundSize: '2px 56px',
        backgroundRepeat: 'repeat-y',
        backgroundPosition: 'center 0px',
        animation: 'roadFlow 0.85s linear infinite',
      }}>
        {/* Radial vignette — kills road pattern except faint center strip */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 160% 100% at 50% 50%, rgba(13,14,24,0.15) 0%, rgba(13,14,24,0.94) 72%)', pointerEvents: 'none' }} />
        {/* Side vignettes — show only the center lane */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(13,14,24,0.85) 0%, transparent 28%, transparent 72%, rgba(13,14,24,0.85) 100%)', pointerEvents: 'none' }} />
        {/* Green glow top-right */}
        <div style={{ position: 'absolute', top: -90, right: -50, width: 320, height: 320, background: 'radial-gradient(circle, rgba(0,122,77,0.13) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,122,77,0.14)', border: '1px solid rgba(0,122,77,0.38)', borderRadius: 99, padding: '5px 14px', marginBottom: 30 }}>
            <span style={{ fontSize: 13 }}>🇿🇦</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#4ade80', letterSpacing: 1.2 }}>SOUTH AFRICA'S #1 K53 APP</span>
          </motion.div>

          {/* Headline */}
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.06 }}>
            <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.0, letterSpacing: -2.5, margin: '0 0 2px', color: '#ffffff', textWrap: 'balance' }}>
              Pass your K53.
            </h1>
            <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.0, letterSpacing: -2.5, margin: '0 0 32px', background: `linear-gradient(90deg, ${GOLD} 0%, #4ade80 65%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              First try.
            </h1>
          </motion.div>

          {/* Fear hook */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.15 }}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20, borderLeft: `3px solid ${RED}`, paddingLeft: 16 }}>
            <span style={{ fontSize: 72, fontWeight: 900, color: RED, lineHeight: 1, letterSpacing: -4, fontVariantNumeric: 'tabular-nums', flexShrink: 0, marginTop: -4 }}>50%</span>
            <div style={{ paddingTop: 6 }}>
              <div style={{ fontSize: 15, color: TEXT, fontWeight: 600, lineHeight: 1.4, marginBottom: 5 }}>of SA learners fail their first test</div>
              <div style={{ fontSize: 12, color: DIM, lineHeight: 1.5 }}>Don't pay the retest fee. Don't waste the time.</div>
            </div>
          </motion.div>

          {/* Solution */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.22 }}
            style={{ fontSize: 15, fontWeight: 700, color: '#4ade80', marginBottom: 28, letterSpacing: 0.1, lineHeight: 1.5 }}>
            Our users pass at <strong style={{ color: '#4ade80' }}>87%</strong>. Ten minutes a day is all it takes.
          </motion.div>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.28 }}
            whileTap={{ scale: 0.97 }} onClick={onStart}
            style={{ width: '100%', background: `linear-gradient(135deg, ${GREEN} 0%, #00a365 100%)`, border: 'none', borderRadius: 16, padding: '20px', color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 18, cursor: 'pointer', boxShadow: '0 10px 40px rgba(0,122,77,0.5)', letterSpacing: 0.2, marginBottom: 12 }}>
            Start Free — No Signup →
          </motion.button>
          <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
            No signup required · Works offline · R29/mo unlimited
          </div>
        </div>
      </div>

      {/* ── LIVE DEMO ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: '28px 20px 36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div style={{ width: 7, height: 7, borderRadius: 99, background: '#4ade80', flexShrink: 0, animation: 'dotPulse 1.5s ease-in-out infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Try it live — no signup needed</span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={demoIdx}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            style={{ background: SURFACE, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.55)' }}>

            {/* Card header */}
            <div style={{ background: 'rgba(255,182,18,0.04)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '10px 16px', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.32)', letterSpacing: 1, textTransform: 'uppercase' }}>
                Road Signs Drill · Q{(demoIdx % 3) + 1} of 3
              </span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 5 }}>
                {DEMO.map((_, i) => (
                  <div key={i} style={{ width: i === demoIdx % 3 ? 16 : 5, height: 5, borderRadius: 99, background: i === demoIdx % 3 ? GOLD : 'rgba(255,255,255,0.1)', transition: 'all 0.3s' }} />
                ))}
              </div>
            </div>

            {/* Sign + question */}
            <div style={{ padding: '26px 18px 10px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>{q.sign}</div>
              <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.4, marginBottom: 18, color: TEXT }}>{q.q}</div>

              <div style={{ display: 'grid', gap: 9 }}>
                {q.options.map((opt, idx) => {
                  const isCorrect = idx === q.correct;
                  const isChosen = idx === chosen;
                  let bg = 'rgba(255,255,255,0.04)';
                  let border = 'rgba(255,255,255,0.08)';
                  let col = TEXT;
                  if (chosen !== null && isCorrect) { bg = 'rgba(0,122,77,0.2)'; border = GREEN; col = '#4ade80'; }
                  if (chosen !== null && isChosen && !isCorrect) { bg = 'rgba(222,56,49,0.15)'; border = RED; col = '#f87171'; }
                  return (
                    <motion.button key={idx}
                      whileTap={chosen === null ? { scale: 0.98 } : {}}
                      onClick={() => handleAnswer(idx)}
                      style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 11, padding: '12px 14px', color: col, fontFamily: FONT, fontSize: 13, fontWeight: 500, cursor: chosen === null ? 'pointer' : 'default', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
                      <span><b style={{ marginRight: 8, opacity: 0.3 }}>{String.fromCharCode(65 + idx)}.</b>{opt}</span>
                      {chosen !== null && isCorrect && <span style={{ color: '#4ade80' }}>✓</span>}
                      {chosen !== null && isChosen && !isCorrect && <span style={{ color: '#f87171' }}>✗</span>}
                    </motion.button>
                  );
                })}
              </div>

              <div style={{ padding: '14px 0 8px', fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: 0.3 }}>{q.ref}</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── PASS RATE BANNER ──────────────────────────────────────────────────── */}
      <div style={{ padding: '0 20px 36px' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(0,122,77,0.1) 0%, rgba(68,114,202,0.06) 100%)', border: '1px solid rgba(0,122,77,0.2)', borderRadius: 18, padding: '22px 20px', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: 56, fontWeight: 900, color: '#4ade80', lineHeight: 1, letterSpacing: -2.5, fontVariantNumeric: 'tabular-nums' }}>87%</div>
            <div style={{ fontSize: 10, color: 'rgba(232,234,242,0.35)', marginTop: 4, letterSpacing: 0.3 }}>pass first try</div>
          </div>
          <div>
            <div style={{ fontSize: 14, color: TEXT, fontWeight: 600, lineHeight: 1.55, marginBottom: 4 }}>
              Nearly double the national average.
            </div>
            <div style={{ fontSize: 12, color: DIM, lineHeight: 1.5 }}>
              K53 Drill Master users walk into the DLTC knowing exactly what to expect.
            </div>
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ padding: '0 20px 14px', fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase' }}>
          From our students
        </div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '4px 20px 12px', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.35 }}
              style={{ flex: '0 0 278px', background: SURFACE, borderRadius: 16, padding: '18px', scrollSnapAlign: 'start', borderLeft: `3px solid ${t.color}` }}>
              <div style={{ display: 'flex', gap: 1, marginBottom: 12 }}>
                {[0, 1, 2, 3, 4].map(s => <span key={s} style={{ color: GOLD, fontSize: 12 }}>★</span>)}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(232,234,242,0.82)', marginBottom: 16 }}>"{t.text}"</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 99, background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, color: '#fff', flexShrink: 0, boxShadow: `0 0 0 2px ${BG}, 0 0 0 3px ${t.color}66` }}>{t.initial}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{t.name}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.33)' }}>{t.city}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ──────────────────────────────────────────────────────────── */}
      <div style={{ padding: '0 20px 36px' }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
          Why it works
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.35 }}
              style={{ background: SURFACE, borderRadius: 16, padding: '18px 18px 18px 20px', borderLeft: `4px solid ${f.color}` }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: f.color, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 5 }}>{f.label}</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: TEXT, marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: DIM, lineHeight: 1.6 }}>{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── STATS ROW ─────────────────────────────────────────────────────────── */}
      <div style={{ padding: '0 20px 36px' }}>
        <div style={{ display: 'flex', background: SURFACE, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, overflow: 'hidden' }}>
          {[
            { n: '700+', l: 'Questions' },
            { n: '14',   l: 'Game modes' },
            { n: '3',    l: 'Languages' },
          ].map((s, i) => (
            <div key={s.l} style={{ flex: 1, textAlign: 'center', padding: '20px 8px', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: GOLD, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.n}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 5, letterSpacing: 0.3 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PRICING ───────────────────────────────────────────────────────────── */}
      <div style={{ padding: '0 20px 24px' }}>
        <div style={{ background: SURFACE, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, overflow: 'hidden' }}>
          <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(135deg, rgba(0,122,77,0.1) 0%, rgba(255,182,18,0.05) 100%)' }}>
            <div style={{ fontWeight: 900, fontSize: 20, color: TEXT, marginBottom: 4 }}>Simple pricing</div>
            <div style={{ fontSize: 13, color: DIM, lineHeight: 1.5 }}>Start free. Go unlimited when you're ready.</div>
          </div>
          <div style={{ display: 'flex', gap: 10, padding: '14px' }}>
            {[
              { label: 'Free', price: 'R0', period: '/day', lines: ['10 questions/day', 'Basic game modes', 'Progress tracking'], highlight: false },
              { label: 'Unlimited', price: 'R29', period: '/mo', lines: ['Unlimited questions', 'All 14 game modes', 'Full mock exams', 'AI nervous system'], highlight: true },
            ].map(p => (
              <div key={p.label}
                style={{ flex: 1, background: p.highlight ? 'rgba(0,122,77,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${p.highlight ? 'rgba(0,122,77,0.32)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 14, padding: '14px 12px' }}>
                {p.highlight && <div style={{ fontSize: 9, fontWeight: 800, color: '#4ade80', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>Most popular</div>}
                <div style={{ fontWeight: 700, fontSize: 12, color: p.highlight ? '#4ade80' : 'rgba(232,234,242,0.35)', marginBottom: 6 }}>{p.label}</div>
                <div style={{ fontWeight: 900, fontSize: 24, color: GOLD, lineHeight: 1 }}>
                  {p.price}<span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.25)' }}>{p.period}</span>
                </div>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {p.lines.map(l => (
                    <div key={l} style={{ fontSize: 10, color: 'rgba(255,255,255,0.32)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: p.highlight ? '#4ade80' : 'rgba(255,255,255,0.2)', fontSize: 9, flexShrink: 0 }}>✓</span>{l}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', padding: '4px 14px 14px', fontSize: 10, color: 'rgba(255,255,255,0.18)' }}>
            Pay via PayFast · Card · EFT · SnapScan · Instant activation
          </div>
        </div>
      </div>

      {/* ── STICKY CTA ────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55, type: 'spring', damping: 22, stiffness: 240 }}
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 20px 30px', background: `linear-gradient(0deg, ${BG} 55%, rgba(13,14,24,0) 100%)`, zIndex: 100 }}>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onStart}
          style={{ width: '100%', background: `linear-gradient(135deg, ${GREEN} 0%, #00a365 100%)`, border: 'none', borderRadius: 16, padding: '19px', color: '#fff', fontFamily: FONT, fontWeight: 900, fontSize: 17, cursor: 'pointer', boxShadow: '0 8px 40px rgba(0,122,77,0.5)', letterSpacing: 0.2 }}>
          Start Free Now →
        </motion.button>
        <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 9 }}>
          From R29/mo after trial · Cancel anytime
        </div>
      </motion.div>
    </div>
  );
}
