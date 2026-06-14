import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';

const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`;

// ── SA-accurate road sign SVGs (always render, no image deps) ─────────────────
function SignStop() {
  return (
    <svg width="76" height="76" viewBox="0 0 76 76">
      <polygon points="23,3 53,3 73,23 73,53 53,73 23,73 3,53 3,23"
        fill="#C0392B" stroke="white" strokeWidth="4" strokeLinejoin="round"/>
      <polygon points="26,8 50,8 68,26 68,50 50,68 26,68 8,50 8,26"
        fill="none" stroke="white" strokeWidth="1.5" strokeLinejoin="round" strokeDasharray="0"/>
      <text x="38" y="46" textAnchor="middle" fill="white" fontSize="13"
        fontWeight="900" fontFamily="'Inter',system-ui,sans-serif" letterSpacing="1.5">STOP</text>
    </svg>
  );
}

function SignSpeed({ n }) {
  return (
    <svg width="76" height="76" viewBox="0 0 76 76">
      <circle cx="38" cy="38" r="35" fill="white" stroke="#C0392B" strokeWidth="6"/>
      <text x="38" y="52" textAnchor="middle" fill="#1a1a1a" fontSize="30"
        fontWeight="900" fontFamily="'Inter',system-ui,sans-serif">{n}</text>
    </svg>
  );
}

function SignYield() {
  return (
    <svg width="76" height="84" viewBox="0 0 76 84">
      <polygon points="38,3 73,81 3,81" fill="white" stroke="#C0392B" strokeWidth="4" strokeLinejoin="round"/>
      <polygon points="38,20 63,71 13,71" fill="#C0392B"/>
    </svg>
  );
}

// ── Demo questions cycling through the app experience ─────────────────────────
const DEMO = [
  {
    sign: <SignStop />,
    q: 'What does this road sign mean?',
    options: ['Stop — give way to ALL traffic', 'Give way to oncoming traffic', 'Slow down and proceed with care', 'No vehicles beyond this point'],
    correct: 0,
    ref: 'R1 — Stop Sign · Code 8',
  },
  {
    sign: <SignSpeed n="60" />,
    q: 'What does this sign tell the driver?',
    options: ['Maximum speed is 60 km/h', 'Minimum speed is 60 km/h', 'Recommended speed 60 km/h', 'End of the 60 km/h zone'],
    correct: 0,
    ref: 'R210 — Speed Limit · Built-up areas',
  },
  {
    sign: <SignYield />,
    q: 'At this sign you MUST:',
    options: ['Give way to all other traffic', 'Stop completely before proceeding', 'Yield only to pedestrians', 'Stop if another vehicle is close'],
    correct: 0,
    ref: 'R2 — Yield/Give Way',
  },
];

const FEATURES = [
  { icon: '🧠', title: 'Nervous System', desc: 'AI maps exactly which topics are strong, weak, or fading' },
  { icon: '📄', title: 'Full Mock Exam', desc: 'Official 64Q DLTC format — signs, rules, controls scored separately' },
  { icon: '🎯', title: 'Daily Missions', desc: 'Personalised 3-drill sets targeting your exact weak spots' },
  { icon: '🇿🇦', title: 'SA-Official Content', desc: 'All signs from SARTSM, all rules from K53 regulation' },
  { icon: '📴', title: 'Works Offline', desc: 'Full PWA — study on taxi, no internet required after install' },
  { icon: '🔥', title: 'Habit Engine', desc: 'Daily streaks, XP levels, badges — makes studying addictive' },
];

const TESTIMONIALS = [
  { text: '"Passed first attempt after one week of daily drills. The nervous system shows you exactly what to focus on."', name: 'Thabo M.', city: 'Johannesburg' },
  { text: '"Failed twice before this app. The mock exam format is identical to the real DLTC test — nothing surprises you."', name: 'Priya N.', city: 'Durban' },
  { text: '"The WhatsApp share feature made my whole friend group compete. We all passed the same month."', name: 'Aimée D.', city: 'Cape Town' },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Landing({ onStart }) {
  const [demoIdx, setDemoIdx] = useState(0);
  const [chosen, setChosen] = useState(null);

  const q = DEMO[demoIdx % DEMO.length];

  const handleAnswer = (idx) => {
    if (chosen !== null) return;
    setChosen(idx);
    setTimeout(() => {
      setChosen(null);
      setDemoIdx(i => i + 1);
    }, 1300);
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font, overflowX: 'hidden', paddingBottom: 110 }}>

      {/* SA flag stripe */}
      <div style={{ display: 'flex', height: 4 }}>
        {['#000','#FFB612','#007A4D','#F5F5F0','#DE3831','#4472CA'].map((c,i) => (
          <div key={i} style={{ flex: 1, background: c }} />
        ))}
      </div>

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '36px 22px 32px' }}>
        {/* background glows */}
        <div style={{ position: 'absolute', top: -80, left: -60, width: 340, height: 340, background: 'radial-gradient(circle, rgba(0,122,77,0.14) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -20, right: -40, width: 260, height: 260, background: 'radial-gradient(circle, rgba(255,182,18,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(0deg, rgba(10,10,15,0.8) 0%, transparent 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: GRAIN, backgroundRepeat: 'repeat', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge pill */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(0,122,77,0.12)', border: '1px solid rgba(0,122,77,0.35)', borderRadius: 99, padding: '5px 14px', marginBottom: 22 }}>
            <span style={{ fontSize: 14 }}>🇿🇦</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#4ade80', letterSpacing: 1 }}>SOUTH AFRICA'S #1 K53 APP</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.08 }}
            style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.04, letterSpacing: -1.5, margin: '0 0 14px', color: '#ffffff' }}>
            Pass your K53.{' '}
            <span style={{ background: 'linear-gradient(135deg, #FFB612 0%, #4ade80 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              First try.
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.16 }}
            style={{ fontSize: 16, color: 'rgba(238,238,245,0.65)', lineHeight: 1.65, margin: '0 0 26px', maxWidth: 340 }}>
            50% of South Africans fail their first learner's test. 10 minutes of daily drills changes that — proven.
          </motion.p>

          {/* Stats row */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.24 }}
            style={{ display: 'flex', gap: 0, marginBottom: 28, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
            {[
              { n: '1.2M+', l: 'SA learners' },
              { n: '700+',  l: 'Questions'   },
              { n: '14',    l: 'Game modes'  },
            ].map((s, i) => (
              <div key={s.l} style={{ flex: 1, textAlign: 'center', padding: '14px 6px', borderRight: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#FFB612', lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4, letterSpacing: 0.3 }}>{s.l}</div>
              </div>
            ))}
          </motion.div>

          {/* Above-fold CTA */}
          <motion.button initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.45, delay: 0.32 }}
            whileTap={{ scale: 0.97 }} onClick={onStart}
            style={{ width: '100%', background: 'linear-gradient(135deg, #007A4D 0%, #005a38 100%)', border: 'none', borderRadius: 16, padding: '18px', color: '#fff', fontFamily: T.font, fontWeight: 900, fontSize: 17, cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,122,77,0.4)', letterSpacing: 0.3, marginBottom: 10 }}>
            Start Free — No Signup Required
          </motion.button>
          <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
            Free for 30 days · No credit card · Full access
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE DEMO ──────────────────────────────────────────────────── */}
      <div style={{ padding: '0 20px 32px' }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
          Try it now — no signup needed
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={demoIdx}
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.28 }}
            style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 12px 48px rgba(0,0,0,0.6)' }}>

            {/* Card header */}
            <div style={{ background: 'rgba(255,182,18,0.06)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }}
                style={{ width: 7, height: 7, borderRadius: 99, background: '#4ade80' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase' }}>Road Signs Drill · Live</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>Q{(demoIdx % 3) + 1}/3</span>
            </div>

            {/* Sign + question */}
            <div style={{ padding: '24px 18px 6px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
                {q.sign}
              </div>
              <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1.4, marginBottom: 18, color: T.text }}>
                {q.q}
              </div>

              {/* Options */}
              <div style={{ display: 'grid', gap: 9 }}>
                {q.options.map((opt, idx) => {
                  const isCorrect = idx === q.correct;
                  const isChosen = idx === chosen;
                  let bg = 'rgba(255,255,255,0.04)';
                  let border = 'rgba(255,255,255,0.08)';
                  let col = T.text;
                  if (chosen !== null && isCorrect) { bg = 'rgba(0,122,77,0.2)'; border = '#007A4D'; col = '#4ade80'; }
                  if (chosen !== null && isChosen && !isCorrect) { bg = 'rgba(222,56,49,0.15)'; border = '#DE3831'; col = '#f87171'; }
                  return (
                    <motion.button key={idx}
                      whileTap={chosen === null ? { scale: 0.98 } : {}}
                      onClick={() => handleAnswer(idx)}
                      style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 11, padding: '11px 14px', color: col, fontFamily: T.font, fontSize: 13, fontWeight: 500, cursor: chosen === null ? 'pointer' : 'default', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
                      <span><b style={{ marginRight: 7, opacity: 0.4 }}>{String.fromCharCode(65 + idx)}.</b>{opt}</span>
                      {chosen !== null && isCorrect && <span style={{ color: '#4ade80' }}>✓</span>}
                      {chosen !== null && isChosen && !isCorrect && <span style={{ color: '#f87171' }}>✗</span>}
                    </motion.button>
                  );
                })}
              </div>

              {/* Ref footer */}
              <div style={{ padding: '14px 0 10px', fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: 0.3 }}>
                {q.ref}
              </div>
            </div>

            {/* Progress dots */}
            <div style={{ padding: '0 16px 14px', display: 'flex', justifyContent: 'center', gap: 6 }}>
              {DEMO.map((_, i) => (
                <div key={i} style={{ width: i === demoIdx % 3 ? 18 : 6, height: 6, borderRadius: 99, background: i === demoIdx % 3 ? '#FFB612' : 'rgba(255,255,255,0.12)', transition: 'all 0.3s' }} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── FEATURES ──────────────────────────────────────────────────────────── */}
      <div style={{ padding: '0 20px 32px' }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
          Why it works
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.38 }}
              style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 12px' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 13, color: T.text, marginBottom: 5 }}>{f.title}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.55 }}>{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────────── */}
      <div style={{ padding: '0 20px 32px' }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
          What students say
        </div>
        {TESTIMONIALS.map((t, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.38 }}
            style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '16px', marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 1, marginBottom: 8 }}>
              {[0,1,2,3,4].map(s => <span key={s} style={{ color: '#FFB612', fontSize: 12 }}>★</span>)}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(238,238,245,0.8)', marginBottom: 10, fontStyle: 'italic' }}>
              {t.text}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
              <span style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 700 }}>{t.name}</span> · {t.city}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── PRICING TEASER ────────────────────────────────────────────────────── */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(0,122,77,0.1) 0%, rgba(255,182,18,0.06) 100%)', border: '1px solid rgba(0,122,77,0.22)', borderRadius: 20, padding: '22px 18px' }}>
          <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 6, color: T.text }}>Start free today</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 18, lineHeight: 1.5 }}>
            10 questions per day — free forever. Unlimited from R29/mo.
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { label: 'Free',      price: 'R0',  period: '/day',  features: '10 Q/day · Basic modes' },
              { label: 'Unlimited', price: 'R29', period: '/mo',   features: 'All modes · No limits',  highlight: true },
            ].map(p => (
              <div key={p.label}
                style={{ flex: 1, background: p.highlight ? 'rgba(0,122,77,0.18)' : 'rgba(255,255,255,0.04)', border: `1px solid ${p.highlight ? 'rgba(0,122,77,0.4)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 13, padding: '13px 10px' }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: p.highlight ? '#4ade80' : T.dim, marginBottom: 4 }}>{p.label}</div>
                <div style={{ fontWeight: 900, fontSize: 22, color: '#FFB612', lineHeight: 1 }}>
                  {p.price}<span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.35)' }}>{p.period}</span>
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 6, lineHeight: 1.4 }}>{p.features}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
            Paid via PayFast · Card · EFT · SnapScan · Instant activation
          </div>
        </div>
      </div>

      {/* ── STICKY BOTTOM CTA ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring', damping: 22, stiffness: 240 }}
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 20px 28px', background: 'linear-gradient(0deg, rgba(10,10,15,0.98) 50%, rgba(10,10,15,0) 100%)', zIndex: 100 }}>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onStart}
          style={{ width: '100%', background: 'linear-gradient(135deg, #007A4D 0%, #009a60 100%)', border: 'none', borderRadius: 16, padding: '18px', color: '#fff', fontFamily: T.font, fontWeight: 900, fontSize: 17, cursor: 'pointer', boxShadow: '0 8px 36px rgba(0,122,77,0.5)', letterSpacing: 0.3 }}>
          Get Started Free →
        </motion.button>
        <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 9 }}>
          From R29/mo after trial · Cancel any time
        </div>
      </motion.div>
    </div>
  );
}
