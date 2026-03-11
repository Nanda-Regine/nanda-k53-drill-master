import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T as BaseT, getFontSize, setFontSize } from './theme.js';

// ── Games ──────────────────────────────────────────────────────────────────────
import Gauntlet            from './games/Gauntlet.jsx';
import HybridGauntlet      from './games/HybridGauntlet.jsx';
import PatternTrainer      from './games/PatternTrainer.jsx';
import RoadRulesGauntlet   from './games/RoadRulesGauntlet.jsx';
import MockExam            from './games/MockExam.jsx';
import VehicleControls     from './games/VehicleControls.jsx';
import PDPPrep             from './games/PDPPrep.jsx';
import MotorcycleGauntlet   from './games/MotorcycleGauntlet.jsx';
import HeavyVehicleGauntlet from './games/HeavyVehicleGauntlet.jsx';
import MotorcycleMockExam   from './games/MotorcycleMockExam.jsx';
import TestDayPrep          from './components/TestDayPrep.jsx';

// ── Components ─────────────────────────────────────────────────────────────────
import Onboarding        from './components/Onboarding.jsx';
import Confetti          from './components/Confetti.jsx';
import { BadgeToast, BadgeGrid, checkAndAwardBadges, hasBadge } from './components/Badges.jsx';
import AuthModal         from './components/AuthModal.jsx';
import ProgressHistory   from './components/ProgressHistory.jsx';
import WeakSpotsReview   from './components/WeakSpotsReview.jsx';
import VehicleChecklist  from './components/VehicleChecklist.jsx';
import Settings          from './components/Settings.jsx';
import Footer            from './components/Footer.jsx';

// ── Utils ──────────────────────────────────────────────────────────────────────
import { recordStudyDay, getStreak } from './utils/streakTracker.js';
import { supabase } from './supabase.js';
import {
  getTier, getRemainingToday, hasPDPAccess, TIER_LABELS, activateTier, TIERS,
  storePremiumToken, isInFreeTrial, daysLeftInTrial,
} from './freemium.js';

// ── Constants ──────────────────────────────────────────────────────────────────
const ONBOARDING_KEY = 'k53_onboarding_complete';
const CODE_PREF_KEY  = 'k53_code_pref';

// SVG grainy noise — inline, zero dependencies
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

function buildLiveTheme() {
  const size = getFontSize();
  const scales = {
    small:  { base: 13, lg: 15, xl: 17, xxl: 22, heading: 26 },
    medium: { base: 15, lg: 17, xl: 19, xxl: 24, heading: 28 },
    large:  { base: 17, lg: 19, xl: 21, xxl: 27, heading: 32 },
    xlarge: { base: 20, lg: 22, xl: 24, xxl: 30, heading: 36 },
  };
  const s = scales[size] || scales.medium;
  return { ...BaseT, fontSize: s.base, fontSizeLg: s.lg, fontSizeXl: s.xl, fontSizeXxl: s.xxl, fontSizeHeading: s.heading };
}

// ── Licence codes ──────────────────────────────────────────────────────────────
const CODES = [
  { id: 'code12', label: 'Code 1/2', sub: 'Motorcycle',          icon: '🏍️' },
  { id: 'code8',  label: 'Code 8',   sub: 'Light Motor Vehicle', icon: '🚗' },
  { id: 'code10', label: 'Code 10',  sub: 'Heavy Motor Vehicle', icon: '🚛' },
  { id: 'code14', label: 'Code 14',  sub: 'Extra Heavy + PDP',   icon: '🚚' },
];

// ── Games catalogue with code relevance ────────────────────────────────────────
const GAMES = [
  // ── Code 1/2 (Motorcycle) ────────────────────────────────────────────────
  {
    id: 'motorcycle', label: 'Motorcycle Gauntlet',
    desc: '5 rounds · 50 questions · Code 1 specific',
    icon: '🏍️', tier: 'free', diff: 'beginner',
    codes: ['code12'],
  },
  {
    id: 'moto_exam',  label: 'Motorcycle Mock Exam',
    desc: '40 questions · 30 min · 75% to pass',
    icon: '📝', tier: 'free', diff: 'intermediate',
    codes: ['code12'],
  },
  // ── Code 8 (Light Motor Vehicle) ─────────────────────────────────────────
  {
    id: 'gauntlet',   label: 'Code 8 Gauntlet',
    desc: '9 rounds · 90 questions · all K53 categories',
    icon: '⚡', tier: 'free', diff: 'beginner',
    codes: ['code8'],
  },
  {
    id: 'mockexam',   label: 'Mock Exam',
    desc: '68 questions · 45 min · 75% to pass',
    icon: '📝', tier: 'free', diff: 'intermediate',
    codes: ['code8'],
  },
  {
    id: 'hybrid',     label: 'Hybrid Gauntlet',
    desc: '100 tricky "EXCEPT" trap questions',
    icon: '🔥', tier: 'premium', diff: 'advanced',
    codes: ['code8'],
  },
  // ── Code 10/14 (Heavy Vehicle) ────────────────────────────────────────────
  {
    id: 'heavy',      label: 'Heavy Vehicle Gauntlet',
    desc: '5 rounds · 50 questions · Code 10/14 specific',
    icon: '🚛', tier: 'free', diff: 'beginner',
    codes: ['code10', 'code14'],
  },
  {
    id: 'pdp',        label: 'PDP Prep Programme',
    desc: '6 modules · 100 questions · earn PDP Ready badge',
    icon: '🎓', tier: 'pdp', diff: 'professional',
    codes: ['code10', 'code14'],
  },
  // ── All codes ─────────────────────────────────────────────────────────────
  {
    id: 'road_rules', label: 'Road Rules Gauntlet',
    desc: '15 rounds · 75 questions · timed',
    icon: '🚦', tier: 'free', diff: 'beginner',
    codes: ['code12', 'code8', 'code10', 'code14'],
  },
  {
    id: 'controls',   label: 'Vehicle Controls Test',
    desc: '30 questions · lights, brakes, instruments',
    icon: '🔩', tier: 'free', diff: 'beginner',
    codes: ['code12', 'code8', 'code10', 'code14'],
  },
  {
    id: 'patterns',   label: 'Know Your Numbers',
    desc: '41 K53 values · pattern + speed modes',
    icon: '🔢', tier: 'free', diff: 'intermediate',
    codes: ['code12', 'code8', 'code10', 'code14'],
  },
];

const DIFF_COLORS = {
  beginner:     '#007A4D',
  intermediate: '#FFB612',
  advanced:     '#DE3831',
  professional: '#6c47ff',
};

const NAV = [
  { id: 'home',      icon: '🏠', label: 'Home'      },
  { id: 'testday',   icon: '📋', label: 'Test Day'  },
  { id: 'weak',      icon: '🎯', label: 'Weak Spots'},
  { id: 'progress',  icon: '📈', label: 'Progress'  },
  { id: 'settings',  icon: '⚙️', label: 'Settings'  },
];

const PLANS = [
  { tier: TIERS.MONTHLY, label: 'Monthly',        price: 'R29', period: '/mo',  desc: 'Unlimited questions',          highlight: false },
  { tier: TIERS.BUNDLE,  label: '3-Month Bundle', price: 'R69', period: '',     desc: 'Save R18 vs monthly',          highlight: true  },
  { tier: TIERS.LIFETIME,label: 'Lifetime',       price: 'R149',period: '',     desc: 'One-time · all modes forever', highlight: false },
];

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] } }),
};

const sheetVariants = {
  hidden:  { y: '100%' },
  visible: { y: 0, transition: { type: 'spring', damping: 28, stiffness: 280 } },
  exit:    { y: '100%', transition: { duration: 0.22 } },
};

function shareWhatsApp(streak) {
  const text = ['🇿🇦 K53 Drill Master', `🔥 ${streak}-day study streak!`, '📚 Practising for my SA learner\'s licence', '💪 k53drillmaster.co.za'].join('\n');
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

// ── Sheet modal wrapper ────────────────────────────────────────────────────────
function Sheet({ show, onClose, children }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9990, display: 'flex', alignItems: 'flex-end' }}
          onClick={onClose}
        >
          <motion.div
            variants={sheetVariants} initial="hidden" animate="visible" exit="exit"
            style={{ width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [T, setT]             = useState(buildLiveTheme);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem(ONBOARDING_KEY));
  const [activeGame, setActiveGame]         = useState(null);
  const [navTab, setNavTab]                 = useState('home');
  const [streak, setStreak]                 = useState(() => getStreak());
  const [tier, setTier]                     = useState(() => getTier());
  const [remaining, setRemaining]           = useState(() => getRemainingToday());
  const [selectedCode, setSelectedCode]     = useState(() => localStorage.getItem(CODE_PREF_KEY) || 'code8');
  const [pendingBadge, setPendingBadge]     = useState(null);
  const [confettiActive, setConfettiActive] = useState(false);
  const [showPaywall, setShowPaywall]       = useState(false);
  const [showBadgeGrid, setShowBadgeGrid]   = useState(false);
  const [showAuth, setShowAuth]             = useState(false);
  const [user, setUser]                     = useState(null);
  const [subMsg, setSubMsg]                 = useState('');

  // ── Persist code preference ─────────────────────────────────────────────────
  const handleCodeSelect = (codeId) => {
    setSelectedCode(codeId);
    localStorage.setItem(CODE_PREF_KEY, codeId);
  };

  // ── Supabase auth ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); checkSubscription(session.user); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user || null;
      setUser(u);
      if (u) checkSubscription(u);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function checkSubscription(u) {
    if (!supabase) return;
    try {
      const { data } = await supabase.from('subscribers').select('plan,expires_at').eq('user_id', u.id).single();
      if (data) {
        storePremiumToken(data.plan, data.expires_at);
        refreshTier();
        setSubMsg('');
      } else {
        setSubMsg('No active subscription found. Contact us on WhatsApp.');
      }
    } catch {}
  }

  const refreshTier = useCallback(() => {
    setTier(getTier());
    setRemaining(getRemainingToday());
  }, []);

  useEffect(() => {
    window.addEventListener('focus', refreshTier);
    return () => window.removeEventListener('focus', refreshTier);
  }, [refreshTier]);

  // Handle unlock token from PayFast redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const unlock = params.get('unlock');
    if (unlock) {
      fetch(`/api/verify?token=${unlock}`).then(r => r.json()).then(d => {
        if (d.ok) { storePremiumToken(d.plan, d.expires_at); refreshTier(); setShowAuth(true); }
      }).catch(() => {});
      window.history.replaceState({}, '', '/');
    }
  }, [refreshTier]);

  // Browser back button → return to home instead of exiting the app
  useEffect(() => {
    const onPop = () => { setActiveGame(null); setNavTab('home'); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Push a history entry whenever we enter a game or non-home tab so browser back works
  useEffect(() => {
    if (activeGame !== null || navTab !== 'home') {
      window.history.pushState({ k53: true }, '');
    }
  }, [activeGame, navTab]);

  const onOnboardingComplete = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setShowOnboarding(false);
  }, []);

  const onGameBack = useCallback(() => {
    setActiveGame(null);
    const newStreak = getStreak();
    setStreak(newStreak);
    refreshTier();
    const awarded = checkAndAwardBadges({ streakCount: newStreak });
    if (awarded?.length) { setPendingBadge(awarded[0]); setConfettiActive(true); }
  }, [refreshTier]);

  const onGamePass = useCallback(() => setConfettiActive(true), []);

  const handleGameSelect = useCallback((game) => {
    if (game.tier === 'pdp' && !hasPDPAccess()) { setShowPaywall(true); return; }
    if (game.tier === 'premium' && tier === TIERS.FREE) { setShowPaywall(true); return; }
    recordStudyDay();
    setActiveGame(game.id);
  }, [tier]);

  const handleFontSizeChange = useCallback((size) => {
    setFontSize(size);
    setT(buildLiveTheme());
  }, []);

  // ── Confetti overlay — always render on top of games ────────────────────────
  const confettiOverlay = (
    <>
      <Confetti active={confettiActive} />
      {pendingBadge && <BadgeToast badgeId={pendingBadge} onDismiss={() => { setPendingBadge(null); setConfettiActive(false); }} />}
    </>
  );

  // ── Game routes ─────────────────────────────────────────────────────────────
  if (showOnboarding) return <Onboarding onComplete={onOnboardingComplete} />;
  if (activeGame === 'gauntlet')    return <>{confettiOverlay}<Gauntlet            onBack={onGameBack} onPass={onGamePass} /></>;
  if (activeGame === 'hybrid')      return <>{confettiOverlay}<HybridGauntlet      onBack={onGameBack} onPass={onGamePass} /></>;
  if (activeGame === 'patterns')    return <>{confettiOverlay}<PatternTrainer      onBack={onGameBack} onPass={onGamePass} /></>;
  if (activeGame === 'road_rules')  return <>{confettiOverlay}<RoadRulesGauntlet   onBack={onGameBack} onPass={onGamePass} /></>;
  if (activeGame === 'mockexam')    return <>{confettiOverlay}<MockExam            onBack={onGameBack} onPass={onGamePass} /></>;
  if (activeGame === 'controls')    return <>{confettiOverlay}<VehicleControls     onBack={onGameBack} onPass={onGamePass} /></>;
  if (activeGame === 'pdp')         return <>{confettiOverlay}<PDPPrep             onBack={onGameBack} onPass={onGamePass} /></>;
  if (activeGame === 'motorcycle')  return <>{confettiOverlay}<MotorcycleGauntlet  onBack={onGameBack} onPass={onGamePass} /></>;
  if (activeGame === 'heavy')       return <>{confettiOverlay}<HeavyVehicleGauntlet onBack={onGameBack} onPass={onGamePass} /></>;
  if (activeGame === 'moto_exam')   return <>{confettiOverlay}<MotorcycleMockExam   onBack={onGameBack} onPass={onGamePass} /></>;

  // ── Tab routes ──────────────────────────────────────────────────────────────
  if (navTab === 'checklist') return <VehicleChecklist onBack={() => setNavTab('home')} />;
  if (navTab === 'testday')   return <TestDayPrep      onBack={() => setNavTab('home')} />;
  if (navTab === 'weak')      return <WeakSpotsReview  onBack={() => setNavTab('home')} />;
  if (navTab === 'progress')  return <ProgressHistory  onBack={() => setNavTab('home')} />;
  if (navTab === 'settings')  return <Settings onBack={() => setNavTab('home')} onFontSizeChange={handleFontSizeChange} />;

  // ── Dashboard ───────────────────────────────────────────────────────────────
  const inTrial   = isInFreeTrial();
  const trialLeft = daysLeftInTrial();
  const hasPDP    = hasBadge('pdp_ready');
  const relevantGames = GAMES.filter(g => g.codes.includes(selectedCode));
  const otherGames    = GAMES.filter(g => !g.codes.includes(selectedCode));

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font, fontSize: T.fontSize, paddingBottom: 84 }}>
      <Confetti active={confettiActive} />
      {pendingBadge && <BadgeToast badgeId={pendingBadge} onDismiss={() => { setPendingBadge(null); setConfettiActive(false); }} />}

      {/* ── Hero Header ──────────────────────────────────────────────────────── */}
      <header style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(160deg,#0d1f1a 0%,#0a0a0f 55%,#1a0d0d 100%)' }}>
        {/* Grain overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: GRAIN_SVG, backgroundRepeat: 'repeat', pointerEvents: 'none', zIndex: 1 }} />
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: -60, left: -40, width: 200, height: 200, background: 'radial-gradient(circle,rgba(0,122,77,0.18) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'absolute', top: -30, right: -20, width: 160, height: 160, background: 'radial-gradient(circle,rgba(255,182,18,0.1) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 1 }} />

        {/* SA flag stripe */}
        <div style={{ display: 'flex', height: 4, position: 'relative', zIndex: 2 }}>
          {['#000','#FFB612','#007A4D','#F5F5F0','#DE3831','#4472CA'].map((c, i) => (
            <div key={i} style={{ flex: 1, background: c }} />
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 2, padding: '18px 20px 20px' }}>
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22 }}>🇿🇦</span>
                <span style={{ fontSize: T.fontSizeXxl, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>K53 Drill Master</span>
              </div>
              <p style={{ color: T.dim, fontSize: T.fontSize - 1, marginTop: 2 }}>
                South Africa's learner's licence prep platform
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowBadgeGrid(true)}
                style={{ background: 'rgba(255,182,18,0.1)', border: '1px solid rgba(255,182,18,0.2)', borderRadius: 12, padding: '8px 12px', color: T.gold, cursor: 'pointer', fontSize: 18 }}>
                🏅
              </motion.button>
              {!user ? (
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowAuth(true)}
                  style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.border}`, borderRadius: 12, padding: '7px 13px', color: T.dim, cursor: 'pointer', fontSize: T.fontSize - 2, fontFamily: T.font }}>
                  Sign in
                </motion.button>
              ) : (
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => { supabase?.auth.signOut(); setUser(null); setSubMsg(''); }}
                  style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.border}`, borderRadius: 12, padding: '7px 13px', color: T.dim, cursor: 'pointer', fontSize: T.fontSize - 2, fontFamily: T.font }}>
                  Sign out
                </motion.button>
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 14px', marginBottom: 14, display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {[
              { val: '1.2M', lbl: 'SA learners test yearly' },
              { val: '50%',  lbl: 'fail rate nationally'    },
              { val: '400+', lbl: 'official DLTC questions' },
            ].map(s => (
              <div key={s.lbl} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: T.fontSizeLg, color: T.gold }}>{s.val}</div>
                <div style={{ fontSize: 10, color: T.dim, marginTop: 1 }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          {/* Status pills */}
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,182,18,0.1)', border: '1px solid rgba(255,182,18,0.25)', borderRadius: 99, padding: '4px 11px', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>🔥</span><span style={{ color: T.gold, fontWeight: 700, fontSize: T.fontSize - 2 }}>{streak} day streak</span>
            </div>
            {inTrial && (
              <div style={{ background: 'rgba(0,122,77,0.12)', border: '1px solid rgba(0,122,77,0.3)', borderRadius: 99, padding: '4px 11px' }}>
                <span style={{ color: '#4ade80', fontWeight: 600, fontSize: T.fontSize - 2 }}>🎁 {trialLeft}d free trial</span>
              </div>
            )}
            {!inTrial && tier !== TIERS.FREE && (
              <div style={{ background: 'rgba(0,122,77,0.12)', border: '1px solid rgba(0,122,77,0.3)', borderRadius: 99, padding: '4px 11px' }}>
                <span style={{ color: '#4ade80', fontWeight: 600, fontSize: T.fontSize - 2 }}>✅ {TIER_LABELS[tier]}</span>
              </div>
            )}
            {!inTrial && tier === TIERS.FREE && (
              <div style={{ background: 'rgba(222,56,49,0.1)', border: '1px solid rgba(222,56,49,0.25)', borderRadius: 99, padding: '4px 11px' }}>
                <span style={{ color: '#f87171', fontWeight: 600, fontSize: T.fontSize - 2 }}>📊 {remaining} Q's left today</span>
              </div>
            )}
            {hasPDP && (
              <div style={{ background: 'rgba(108,71,255,0.12)', border: '1px solid rgba(108,71,255,0.3)', borderRadius: 99, padding: '4px 11px' }}>
                <span style={{ color: '#a78bfa', fontWeight: 600, fontSize: T.fontSize - 2 }}>🎓 PDP Ready</span>
              </div>
            )}
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => shareWhatsApp(streak)}
              style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', borderRadius: 99, padding: '4px 11px', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', color: '#25d366', fontWeight: 600, fontSize: T.fontSize - 2, fontFamily: T.font }}>
              💬 Share
            </motion.button>
          </div>

          {subMsg && (
            <div style={{ marginTop: 10, background: 'rgba(222,56,49,0.1)', border: '1px solid rgba(222,56,49,0.25)', borderRadius: 10, padding: '8px 12px', fontSize: T.fontSize - 2, color: '#f87171' }}>
              {subMsg}
            </div>
          )}
        </div>
      </header>

      <main style={{ padding: '18px 20px 0' }}>

        {/* ── Code picker ──────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.dim, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
            Your Licence Code
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {CODES.map(code => {
              const active = selectedCode === code.id;
              return (
                <motion.button key={code.id} whileTap={{ scale: 0.94 }} onClick={() => handleCodeSelect(code.id)}
                  style={{
                    background: active ? 'linear-gradient(135deg,#007A4D,#005a38)' : T.surfaceAlt,
                    border: `1px solid ${active ? '#007A4D' : T.border}`,
                    borderRadius: T.radius, padding: '10px 6px',
                    cursor: 'pointer', fontFamily: T.font,
                    boxShadow: active ? '0 4px 16px rgba(0,122,77,0.3)' : 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    transition: 'box-shadow 0.2s',
                  }}>
                  <span style={{ fontSize: 20 }}>{code.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: active ? '#fff' : T.text }}>{code.label}</span>
                  <span style={{ fontSize: 9, color: active ? 'rgba(255,255,255,0.65)' : T.dim, lineHeight: 1.2, textAlign: 'center' }}>{code.sub}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Quick actions ─────────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { id: 'testday',   icon: '📋', label: 'Test Day Guide',    sub: 'Docs, tips & mindset',  grad: 'rgba(255,182,18,0.1)', border: 'rgba(255,182,18,0.25)'  },
            { id: 'checklist', icon: '✅', label: 'Vehicle Checklist', sub: 'Test-day inspection',   grad: 'rgba(0,122,77,0.12)',  border: 'rgba(0,122,77,0.25)'    },
            { id: 'weak',      icon: '🎯', label: 'Weak Spots Drill',  sub: 'Your missed questions', grad: 'rgba(222,56,49,0.1)',  border: 'rgba(222,56,49,0.25)'   },
            { id: 'progress',  icon: '📈', label: 'My Progress',       sub: 'Streaks & history',     grad: 'rgba(68,114,202,0.1)', border: 'rgba(68,114,202,0.25)'  },
          ].map((a, i) => (
            <motion.div key={a.id} custom={i} variants={cardVariants} initial="hidden" animate="visible"
              whileTap={{ scale: 0.96 }} onClick={() => setNavTab(a.id)}
              style={{ background: `linear-gradient(135deg,${a.grad},transparent)`, border: `1px solid ${a.border}`, borderRadius: T.radiusLg, padding: '14px 14px', cursor: 'pointer' }}>
              <span style={{ fontSize: 26 }}>{a.icon}</span>
              <div style={{ fontWeight: 700, fontSize: T.fontSizeLg, marginTop: 6 }}>{a.label}</div>
              <div style={{ fontSize: T.fontSize - 2, color: T.dim, marginTop: 2 }}>{a.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Relevant games section ────────────────────────────────────────────── */}
        <div style={{ fontSize: 11, fontWeight: 700, color: T.dim, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
          For {CODES.find(c => c.id === selectedCode)?.label} · {CODES.find(c => c.id === selectedCode)?.sub}
        </div>
        {relevantGames.map((game, i) => <GameCard key={game.id} game={game} index={i} tier={tier} onSelect={handleGameSelect} />)}

        {/* ── Road Signs coming soon ────────────────────────────────────────────── */}
        <ComingSoonCard index={relevantGames.length} />

        {/* ── Other modes ───────────────────────────────────────────────────────── */}
        {otherGames.length > 0 && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.dim, letterSpacing: 1.5, textTransform: 'uppercase', margin: '20px 0 10px' }}>
              Other Practice Modes
            </div>
            {otherGames.map((game, i) => <GameCard key={game.id} game={game} index={i} tier={tier} onSelect={handleGameSelect} muted />)}
          </>
        )}

        {/* ── Pricing strip ─────────────────────────────────────────────────────── */}
        {(tier === TIERS.FREE && !inTrial) && <PricingStrip T={T} onPlanSelect={(t) => { window.location.href = `/api/checkout?plan=${t}`; }} />}

        {/* ── Upgrade nudge if in trial ─────────────────────────────────────────── */}
        {inTrial && (
          <motion.div whileTap={{ scale: 0.98 }} onClick={() => setShowPaywall(true)}
            style={{ background: `linear-gradient(135deg,rgba(0,122,77,0.15),rgba(255,182,18,0.08))`, border: `1px solid rgba(255,182,18,0.2)`, borderRadius: T.radiusLg, padding: '14px 16px', marginTop: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🚀</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: T.gold, fontSize: T.fontSizeLg }}>Lock in before trial ends</div>
              <div style={{ fontSize: T.fontSize - 2, color: T.dim }}>From R29/month — unlimited questions forever</div>
            </div>
            <span style={{ color: T.gold, fontSize: 18 }}>›</span>
          </motion.div>
        )}

        <Footer />
      </main>

      {/* ── Bottom nav ────────────────────────────────────────────────────────── */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: T.surface, borderTop: `1px solid ${T.border}`, display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom,0px)' }}>
        {NAV.map(item => {
          const active = navTab === item.id;
          return (
            <motion.button key={item.id} whileTap={{ scale: 0.88 }} onClick={() => setNavTab(item.id)}
              style={{ flex: 1, background: 'none', border: 'none', padding: '10px 0 8px', color: active ? T.gold : T.dim, cursor: 'pointer', fontFamily: T.font, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, borderTop: `2px solid ${active ? T.gold : 'transparent'}`, transition: 'color 0.15s' }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 400 }}>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* ── Badges sheet ──────────────────────────────────────────────────────── */}
      <Sheet show={showBadgeGrid} onClose={() => setShowBadgeGrid(false)}>
        <div style={{ background: T.surface, borderRadius: '20px 20px 0 0', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: T.fontSizeXl }}>Your Badges</div>
            <button onClick={() => setShowBadgeGrid(false)} style={{ background: 'none', border: 'none', color: T.dim, fontSize: 24, cursor: 'pointer' }}>×</button>
          </div>
          <BadgeGrid />
          <div style={{ height: 20 }} />
        </div>
      </Sheet>

      {/* ── Paywall sheet ─────────────────────────────────────────────────────── */}
      <Sheet show={showPaywall} onClose={() => setShowPaywall(false)}>
        <div style={{ background: T.surface, borderRadius: '20px 20px 0 0', padding: '24px 20px' }}>
          <div style={{ fontWeight: 800, fontSize: T.fontSizeXl, marginBottom: 4 }}>Unlock Full Access</div>
          <div style={{ color: T.dim, fontSize: T.fontSize, marginBottom: 20 }}>
            Unlimited questions · all modes · progress saved forever
          </div>
          {PLANS.map(plan => (
            <motion.div key={plan.tier} whileTap={{ scale: 0.97 }}
              onClick={() => { window.location.href = `/api/checkout?plan=${plan.tier}`; }}
              style={{
                background: plan.highlight ? 'linear-gradient(135deg,#007A4D,#005a38)' : T.surfaceAlt,
                border: `1px solid ${plan.highlight ? '#007A4D88' : T.border}`,
                borderRadius: T.radiusLg, padding: '16px', marginBottom: 10, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 14,
                boxShadow: plan.highlight ? '0 6px 24px rgba(0,122,77,0.25)' : 'none',
              }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: T.fontSizeLg, color: plan.highlight ? '#fff' : T.text }}>{plan.label}</span>
                  {plan.highlight && <span style={{ background: T.gold, color: '#000', borderRadius: 6, padding: '1px 7px', fontSize: 9, fontWeight: 800, letterSpacing: 1 }}>BEST VALUE</span>}
                </div>
                <div style={{ fontSize: T.fontSize - 2, color: plan.highlight ? 'rgba(255,255,255,0.65)' : T.dim, marginTop: 2 }}>{plan.desc}</div>
              </div>
              <div>
                <span style={{ fontWeight: 800, fontSize: T.fontSizeXl, color: T.gold }}>{plan.price}</span>
                {plan.period && <span style={{ color: T.dim, fontSize: T.fontSize - 2 }}>{plan.period}</span>}
              </div>
            </motion.div>
          ))}
          <motion.div whileTap={{ scale: 0.97 }}
            onClick={() => { window.location.href = `/api/checkout?plan=${TIERS.LIFETIME_PDP}`; }}
            style={{ background: 'linear-gradient(135deg,#1a0d40,#0d1a40)', border: '1px solid rgba(108,71,255,0.4)', borderRadius: T.radiusLg, padding: '16px', marginBottom: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: T.fontSizeLg, color: '#fff' }}>Lifetime + PDP Prep 🎓</div>
              <div style={{ fontSize: T.fontSize - 2, color: 'rgba(200,180,255,0.65)', marginTop: 2 }}>All modes + Professional Driving modules</div>
            </div>
            <div><span style={{ fontWeight: 800, fontSize: T.fontSizeXl, color: T.gold }}>R199</span></div>
          </motion.div>
          <button onClick={() => setShowPaywall(false)} style={{ width: '100%', marginTop: 4, background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: T.fontSize, padding: '10px 0', fontFamily: T.font }}>
            Maybe later
          </button>
        </div>
      </Sheet>

      {/* ── Auth modal ─────────────────────────────────────────────────────────── */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}

// ── Game card component ────────────────────────────────────────────────────────
function GameCard({ game, index, tier, onSelect, muted = false }) {
  const T = BaseT;
  const locked = (game.tier === 'pdp' && !hasPDPAccess()) || (game.tier === 'premium' && tier === TIERS.FREE);
  const dc = DIFF_COLORS[game.diff];

  return (
    <motion.div
      custom={index} variants={cardVariants} initial="hidden" animate="visible"
      whileTap={!locked ? { scale: 0.97 } : {}}
      onClick={() => onSelect(game)}
      style={{
        background: T.surfaceAlt,
        border: `1px solid ${locked ? T.border : dc + '33'}`,
        borderRadius: T.radiusLg, padding: '14px 14px', marginBottom: 10,
        cursor: locked ? 'default' : 'pointer',
        opacity: locked ? 0.5 : muted ? 0.7 : 1,
        position: 'relative', overflow: 'hidden',
        boxShadow: !locked && !muted ? `0 2px 12px rgba(0,0,0,0.3)` : 'none',
      }}>
      {/* Left colour bar */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: dc, borderRadius: '14px 0 0 14px' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingLeft: 10 }}>
        <span style={{ fontSize: 26, flexShrink: 0 }}>{game.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 3 }}>
            <span style={{ fontWeight: 700, fontSize: T.fontSizeLg }}>{game.label}</span>
            <span style={{ background: dc + '20', color: dc, borderRadius: 99, padding: '1px 8px', fontSize: T.fontSize - 3, fontWeight: 600, textTransform: 'capitalize' }}>{game.diff}</span>
            {locked && <span style={{ background: T.bg, color: T.dim, borderRadius: 99, padding: '1px 8px', fontSize: T.fontSize - 3, border: `1px solid ${T.border}` }}>🔒 Upgrade</span>}
          </div>
          <div style={{ color: T.dim, fontSize: T.fontSize - 1 }}>{game.desc}</div>
        </div>
        <span style={{ fontSize: 16, color: T.dim, flexShrink: 0, marginTop: 2 }}>›</span>
      </div>
    </motion.div>
  );
}

// ── Coming soon card ──────────────────────────────────────────────────────────
function ComingSoonCard({ index }) {
  const T = BaseT;
  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" animate="visible"
      style={{ background: T.surfaceAlt, border: `1px solid rgba(255,182,18,0.2)`, borderRadius: T.radiusLg, padding: '14px 14px', marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'rgba(255,182,18,0.4)', borderRadius: '14px 0 0 14px' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingLeft: 10 }}>
        <span style={{ fontSize: 26, flexShrink: 0 }}>🚧</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: T.fontSizeLg, color: T.dim }}>Road Signs Quiz</span>
            <span style={{ background: 'rgba(255,182,18,0.12)', color: T.gold, borderRadius: 99, padding: '1px 9px', fontSize: T.fontSize - 3, fontWeight: 700, letterSpacing: 0.5 }}>COMING SOON</span>
          </div>
          <div style={{ color: T.dim, fontSize: T.fontSize - 1 }}>Interactive sign recognition · every SA road sign explained</div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Inline pricing strip ──────────────────────────────────────────────────────
function PricingStrip({ T, onPlanSelect }) {
  const cols = [
    { label: 'Free',     price: 'R0',   period: '/day',  features: ['10 questions/day', '30-day trial unlimited', 'Progress tracking'], cta: 'Current plan', active: true,  tier: null },
    { label: 'Monthly',  price: 'R29',  period: '/mo',   features: ['Unlimited questions', 'All 7 modes', 'Badges + streaks'],           cta: 'Get Monthly',  active: false, tier: TIERS.MONTHLY },
    { label: '3 Months', price: 'R69',  period: '',      features: ['Best value', 'Unlimited + PDP Prep', 'Save R18'],                    cta: 'Best Value ✦', active: false, tier: TIERS.BUNDLE, highlight: true },
  ];
  return (
    <div style={{ marginTop: 24, marginBottom: 4 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.dim, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
        Pricing — No Surprises
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
        {cols.map(col => (
          <motion.div key={col.label} whileTap={col.tier ? { scale: 0.96 } : {}}
            onClick={() => col.tier && onPlanSelect(col.tier)}
            style={{
              background: col.highlight ? 'linear-gradient(160deg,#007A4D22,#007A4D0a)' : T.surfaceAlt,
              border: `1px solid ${col.highlight ? '#007A4D55' : T.border}`,
              borderRadius: T.radiusLg, padding: '14px 10px',
              cursor: col.tier ? 'pointer' : 'default',
              position: 'relative', overflow: 'hidden',
              boxShadow: col.highlight ? '0 4px 20px rgba(0,122,77,0.2)' : 'none',
            }}>
            {col.highlight && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#007A4D,#FFB612)' }} />}
            <div style={{ fontWeight: 700, fontSize: T.fontSize, marginBottom: 2 }}>{col.label}</div>
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontWeight: 800, fontSize: T.fontSizeXl, color: T.gold }}>{col.price}</span>
              <span style={{ fontSize: 10, color: T.dim }}>{col.period}</span>
            </div>
            {col.features.map(f => (
              <div key={f} style={{ fontSize: 10, color: T.dim, marginBottom: 3, display: 'flex', gap: 4 }}>
                <span style={{ color: '#007A4D', flexShrink: 0 }}>✓</span>{f}
              </div>
            ))}
            <div style={{ marginTop: 10, background: col.highlight ? '#007A4D' : col.active ? T.border : T.border, borderRadius: 8, padding: '7px 6px', textAlign: 'center', fontSize: 11, fontWeight: 700, color: col.highlight ? '#fff' : col.active ? T.dim : T.text }}>
              {col.cta}
            </div>
          </motion.div>
        ))}
      </div>
      <div style={{ textAlign: 'center', fontSize: 10, color: T.dim, marginTop: 10 }}>
        Paid via PayFast · Card · EFT · SnapScan · Instant activation
      </div>
    </div>
  );
}

