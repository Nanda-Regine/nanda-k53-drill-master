import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T } from '../theme.js';
import { useLang } from '../LangContext.jsx';

// Support content by section failure type
const SECTION_STUDY_PLANS = {
  signs: {
    icon: '🛑',
    title: 'Signs Section',
    tips: [
      'Learn signs by SHAPE first — shape tells you the category before you read anything.',
      'Use the Sign Shape Trainer to build visual pattern recognition.',
      'Focus on confusable pairs: R216 (Parking Prohibited) vs R217 (Stopping Prohibited).',
      'Create phone wallpapers with signs you struggle with.',
      '5 minutes a day of sign flashcards beats 2 hours once a week.',
    ],
    target: 'sign_shape',
    targetLabel: 'Practice Sign Shape Trainer',
  },
  rules: {
    icon: '📋',
    title: 'Rules of the Road',
    tips: [
      'Group rules by number: distances (2s, 45m, 90m, 150m), speeds (60/100/120), clearances (1.5m/5m/9m).',
      'Use the Pattern Trainer to drill numbers into memory.',
      'Road Rules Gauntlet covers all 15 topic areas — identify which rounds you\'re weakest on.',
      'Alcohol rules: 0.05 for drivers, 0.02 for professionals. Zero for under-18.',
      'BAC = Blood Alcohol Content. Professional = PDP holder driving for reward.',
    ],
    target: 'patterns',
    targetLabel: 'Practice Pattern Trainer',
  },
  controls: {
    icon: '🔩',
    title: 'Vehicle Controls',
    tips: [
      'The Vehicle Controls section covers the daily vehicle inspection and mechanical knowledge.',
      'Group items: engine checks, lights, tyres, safety equipment.',
      'Pre-trip inspection: fuel, oil, water, battery, tyres, lights, wipers, hooter.',
      'Emergency triangle: minimum 45m behind vehicle on freeway, or to the top of the hill.',
      'Use the Gauntlet mode to drill these repeatedly.',
    ],
    target: 'controls',
    targetLabel: 'Practice Vehicle Controls',
  },
};

const ENCOURAGEMENT_EN = [
  { text: 'The SA K53 first-attempt pass rate is around 50%. You are not alone.', sub: 'Half of test-takers don\'t pass the first time.' },
  { text: 'Every world-class driver failed their first test at some point.', sub: 'Failure is the data you need to succeed.' },
  { text: 'Nelson Mandela spent 27 years in prison before changing the world.', sub: 'Persistence is the most South African virtue there is.' },
  { text: 'You now know exactly what to study. That\'s more valuable than guessing.', sub: 'The test showed you the map to your blind spots.' },
];

const ENCOURAGEMENT_AF = [
  { text: 'Die eerste-poging-slaagkoers vir K53 in SA is ongeveer 50%. Jy is nie alleen nie.', sub: 'Die helfte van toetskandidaate slaag nie die eerste keer nie.' },
  { text: 'Elke wêreldklas-bestuurder het eendag by sy eerste toets gedruip.', sub: 'Mislukking is die data wat jy nodig het om te slaag.' },
];

const ENCOURAGEMENT_XH = [
  { text: 'Umyinge wokuphumelela okuqala e-K53 e-SA ungama-50%. Awukho wedwa.', sub: 'Abahlanu kwabathandathu abaphasi okokuqala.' },
  { text: 'Bonke abachweli abakhulu bakhe bahluleka kuvavanyo labo lokuqala.', sub: 'Ukuhluleka yidatha oyidingayo ukuphumelela.' },
];

export default function MentalHealthSupport({ failedSections = [], score, total, onRetry, onBack, onGoToGame }) {
  const { lang } = useLang();
  const [step, setStep] = useState(0); // 0=empathy, 1=plan, 2=action

  const encouragement = lang === 'af' ? ENCOURAGEMENT_AF : lang === 'xh' ? ENCOURAGEMENT_XH : ENCOURAGEMENT_EN;
  const quote = encouragement[Math.floor(Math.random() * encouragement.length)];
  const pct   = total > 0 ? Math.round((score / total) * 100) : 0;

  const plans = failedSections.map(s => SECTION_STUDY_PLANS[s]).filter(Boolean);
  const defaultPlan = SECTION_STUDY_PLANS.signs;

  const SA_STRIPE = (
    <div style={{ display: 'flex', height: 4 }}>
      {['#000', '#FFB612', '#007A4D', '#F5F5F0', '#DE3831', '#4472CA'].map((c, i) => (
        <div key={i} style={{ flex: 1, background: c }} />
      ))}
    </div>
  );

  // Step 0 — Empathy
  if (step === 0) return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {SA_STRIPE}
      <div style={{ padding: '40px 24px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>💙</div>
          <div style={{ fontWeight: 800, fontSize: T.fontSizeHeading, lineHeight: 1.2, marginBottom: 12 }}>
            That was tough. It's okay.
          </div>
          <div style={{ color: T.dim, fontSize: T.fontSizeLg, lineHeight: 1.5 }}>
            You scored {pct}% — and every wrong answer just showed you exactly what to study next.
          </div>
        </div>

        {/* Quote card */}
        <div style={{ background: 'rgba(0,122,77,0.08)', border: '1px solid rgba(0,122,77,0.2)', borderRadius: T.radiusLg, padding: '20px 22px', marginBottom: 28 }}>
          <div style={{ fontWeight: 700, fontSize: T.fontSizeLg, color: '#4ade80', marginBottom: 8, lineHeight: 1.4 }}>
            "{quote.text}"
          </div>
          <div style={{ color: T.dim, fontSize: T.fontSize - 1 }}>{quote.sub}</div>
        </div>

        {/* SA context */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 32 }}>
          {[
            { val: '~50%', lbl: 'SA first-attempt pass rate' },
            { val: '2nd+', lbl: 'Most people pass on attempt 2' },
            { val: 'You', lbl: 'Know exactly what to fix now' },
            { val: 'Next', lbl: 'Test will be your best performance' },
          ].map(s => (
            <div key={s.lbl} style={{ background: T.surface, borderRadius: T.radius, padding: '14px', textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: T.fontSizeXl, color: T.gold }}>{s.val}</div>
              <div style={{ color: T.dim, fontSize: 10, marginTop: 4 }}>{s.lbl}</div>
            </div>
          ))}
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(1)}
          style={{ width: '100%', background: T.green, border: 'none', borderRadius: T.radiusLg, padding: '18px', color: '#fff', fontWeight: 800, fontSize: T.fontSizeLg, fontFamily: T.font, cursor: 'pointer', marginBottom: 12 }}>
          Show me what to study next →
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onBack}
          style={{ width: '100%', background: 'none', border: 'none', color: T.dim, fontFamily: T.font, cursor: 'pointer', fontSize: T.fontSize, padding: '10px' }}>
          Back to home
        </motion.button>
      </div>
    </div>
  );

  // Step 1 — Study plan
  if (step === 1) return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {SA_STRIPE}
      <div style={{ padding: '28px 24px' }}>
        <div style={{ fontWeight: 800, fontSize: T.fontSizeHeading, marginBottom: 6 }}>Your Study Plan</div>
        <div style={{ color: T.dim, fontSize: T.fontSize, marginBottom: 28 }}>
          Based on your result, focus on these areas:
        </div>

        {(plans.length > 0 ? plans : [defaultPlan]).map(plan => (
          <div key={plan.title} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, padding: '20px 20px', marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: T.fontSizeLg, marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
              <span>{plan.icon}</span> {plan.title}
            </div>
            {plan.tips.map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                <span style={{ color: T.green, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                <span style={{ color: T.dim, fontSize: T.fontSize - 1, lineHeight: 1.5 }}>{tip}</span>
              </div>
            ))}
          </div>
        ))}

        {/* General tips */}
        <div style={{ background: 'rgba(255,182,18,0.06)', border: '1px solid rgba(255,182,18,0.2)', borderRadius: T.radius, padding: '16px 18px', marginBottom: 24 }}>
          <div style={{ fontWeight: 700, color: T.gold, marginBottom: 8 }}>Universal K53 Tips</div>
          {[
            '7pm study session + sleep = best retention (your brain consolidates overnight).',
            '5 questions daily beats 50 questions once a week.',
            'Explain each wrong answer aloud to yourself — the Feynman technique.',
            'Set your test date FIRST — a deadline makes study real.',
          ].map((tip, i) => (
            <div key={i} style={{ color: T.dim, fontSize: T.fontSize - 1, marginBottom: 6 }}>• {tip}</div>
          ))}
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(2)}
          style={{ width: '100%', background: T.green, border: 'none', borderRadius: T.radiusLg, padding: '18px', color: '#fff', fontWeight: 800, fontSize: T.fontSizeLg, fontFamily: T.font, cursor: 'pointer', marginBottom: 12 }}>
          I'm ready to practise →
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onBack}
          style={{ width: '100%', background: 'none', border: 'none', color: T.dim, fontFamily: T.font, cursor: 'pointer', fontSize: T.fontSize, padding: '10px' }}>
          Back to home
        </motion.button>
      </div>
    </div>
  );

  // Step 2 — Action
  const actionPlans = plans.length > 0 ? plans : [defaultPlan];
  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font }}>
      {SA_STRIPE}
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>💪</div>
        <div style={{ fontWeight: 800, fontSize: T.fontSizeHeading, marginBottom: 8 }}>Let's fix those weak spots</div>
        <div style={{ color: T.dim, marginBottom: 32 }}>Choose what to practise right now:</div>

        <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
          {actionPlans.map(plan => (
            <motion.button key={plan.title} whileTap={{ scale: 0.97 }}
              onClick={() => onGoToGame?.(plan.target)}
              style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer', color: T.text, fontFamily: T.font, textAlign: 'left' }}>
              <span style={{ fontSize: 28 }}>{plan.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: T.fontSizeLg }}>{plan.targetLabel}</div>
                <div style={{ color: T.dim, fontSize: T.fontSize - 1, marginTop: 2 }}>{plan.title} practice mode</div>
              </div>
            </motion.button>
          ))}

          <motion.button whileTap={{ scale: 0.97 }} onClick={onRetry}
            style={{ background: 'rgba(0,122,77,0.1)', border: '1px solid rgba(0,122,77,0.3)', borderRadius: T.radiusLg, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer', color: T.text, fontFamily: T.font, textAlign: 'left' }}>
            <span style={{ fontSize: 28 }}>📝</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: T.fontSizeLg }}>Retry Mock Exam</div>
              <div style={{ color: T.dim, fontSize: T.fontSize - 1, marginTop: 2 }}>Take the full exam again now</div>
            </div>
          </motion.button>
        </div>

        <div style={{ marginTop: 8, background: T.surfaceAlt, borderRadius: T.radius, padding: '14px 16px', textAlign: 'left' }}>
          <div style={{ fontWeight: 600, marginBottom: 6, color: T.gold }}>Before your next test date:</div>
          <div style={{ color: T.dim, fontSize: T.fontSize - 1 }}>
            Book your re-test as soon as possible — studies show motivation peaks within 2 weeks of a failure. Don't let the momentum fade.
          </div>
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={onBack}
          style={{ marginTop: 20, background: 'none', border: 'none', color: T.dim, fontFamily: T.font, cursor: 'pointer', fontSize: T.fontSize, padding: '10px' }}>
          Back to home
        </motion.button>
      </div>
    </div>
  );
}
