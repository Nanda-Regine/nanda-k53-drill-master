import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { T as BaseT, getFontSize, setFontSize } from './theme.js';
import { useLang } from './LangContext.jsx';

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
import RoadSignsQuiz        from './games/RoadSignsQuiz.jsx';
import SignShapeTrainer     from './games/SignShapeTrainer.jsx';
import RoadMarkingsDrill    from './games/RoadMarkingsDrill.jsx';
import ScenarioDrill       from './games/ScenarioDrill.jsx';
import K53LearnerExam      from './games/K53LearnerExam.jsx';
import VoiceMode           from './games/VoiceMode.jsx';
import Landing             from './components/Landing.jsx';
import TestDayPrep          from './components/TestDayPrep.jsx';
import MentalHealthSupport  from './components/MentalHealthSupport.jsx';

// ── Phase C: Community ────────────────────────────────────────────────────────
import PassWall          from './games/PassWall.jsx';
import StudyGroupBattle  from './games/StudyGroupBattle.jsx';
import DLTCTips          from './games/DLTCTips.jsx';
import WeeklyChallenge   from './games/WeeklyChallenge.jsx';
import SchoolDashboard   from './games/SchoolDashboard.jsx';
import CommunityQA       from './games/CommunityQA.jsx';

// ── Phase D: Adaptive Drills ──────────────────────────────────────────────────
import SequenceBuilder   from './games/SequenceBuilder.jsx';
import ConfusablesBattle from './games/ConfusablesBattle.jsx';
import SpeedRecognition  from './games/SpeedRecognition.jsx';
import ContextCluster    from './games/ContextCluster.jsx';
import WeakSpotTargeter  from './games/WeakSpotTargeter.jsx';
import DailyDiagnostic   from './games/DailyDiagnostic.jsx';

// ── Components ─────────────────────────────────────────────────────────────────
import GameErrorBoundary from './components/GameErrorBoundary.jsx';
import Onboarding        from './components/Onboarding.jsx';
import Confetti          from './components/Confetti.jsx';
import { BadgeToast, BadgeGrid, checkAndAwardBadges, hasBadge } from './components/Badges.jsx';
import AuthModal         from './components/AuthModal.jsx';
import ProgressHistory   from './components/ProgressHistory.jsx';
import WeakSpotsReview   from './components/WeakSpotsReview.jsx';
import VehicleChecklist  from './components/VehicleChecklist.jsx';
import Settings          from './components/Settings.jsx';
import Footer            from './components/Footer.jsx';
import NervesPanel       from './components/NervesPanel.jsx';

// ── Utils ──────────────────────────────────────────────────────────────────────
import { recordStudyDay, getStreak } from './utils/streakTracker.js';
import { getWeakNerves } from './utils/masteryStore.js';
import { supabase } from './supabase.js';
import {
  getTier, getRemainingToday, hasPDPAccess, TIER_LABELS, activateTier, TIERS,
  storePremiumToken, isInFreeTrial, daysLeftInTrial,
} from './freemium.js';

// ── Constants ──────────────────────────────────────────────────────────────────
const ONBOARDING_KEY = 'k53_onboarding_complete';
const CODE_PREF_KEY  = 'k53_code_pref';
const LANDING_KEY    = 'k53_landing_seen';
const LAST_GAME_KEY  = 'k53_last_played';

const GAME_NERVE_MAP = {
  gauntlet:'controls', hybrid:'rules', patterns:'rules', road_rules:'rules',
  mockexam:'practical', controls:'controls', pdp:'practical', motorcycle:'controls',
  heavy:'controls', moto_exam:'practical', roadsigns:'signs', sign_shape:'signs',
  road_marks:'markings', scenario:'scenarios', learner_exam:'practical',
  voice:'signs',
  pass_wall:'community', study_battle:'community', weekly_chall:'community',
  dltc_tips:'community', school_dash:'community', community_qa:'community',
  // Phase D
  seq_builder:'practical', confusables:'signs', speed_recog:'rules',
  ctx_cluster:'scenarios', weak_target:'rules', daily_diag:'practical',
};
const NERVE_COLOR_MAP = {
  signs:'#DE3831', rules:'#FFB612', controls:'#007A4D',
  scenarios:'#4472CA', markings:'#6c47ff', practical:'#FF6B35',
  community:'#9B59B6',
};
const NERVE_GAME_MAP = {
  signs:'roadsigns', rules:'road_rules', controls:'gauntlet',
  scenarios:'scenario', markings:'road_marks', practical:'learner_exam',
};
const CATS = [
  { id:'all',       label:'All',       icon:'🗂️' },
  { id:'signs',     label:'Signs',     icon:'🚦' },
  { id:'rules',     label:'Rules',     icon:'📋' },
  { id:'controls',  label:'Controls',  icon:'🔩' },
  { id:'exam',      label:'Exam',      icon:'📄' },
  { id:'scenarios', label:'Scenarios', icon:'🎯' },
  { id:'community', label:'Community', icon:'🤝' },
];

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
const CODES_BASE = [
  { id: 'code12', label: 'Code 1/2', subKey: 'code_motorcycle', icon: '🏍️' },
  { id: 'code8',  label: 'Code 8',   subKey: 'code_light',      icon: '🚗' },
  { id: 'code10', label: 'Code 10',  subKey: 'code_heavy',      icon: '🚛' },
  { id: 'code14', label: 'Code 14',  subKey: 'code_extraheavy', icon: '🚚' },
];

// ── Games catalogue with code relevance ────────────────────────────────────────
const GAMES_BASE = [
  { id: 'motorcycle',   icon: '🏍️', tier: 'free',    diff: 'beginner',     cat: 'controls',  codes: ['code12'] },
  { id: 'moto_exam',    icon: '📝', tier: 'free',    diff: 'intermediate', cat: 'exam',      codes: ['code12'] },
  { id: 'gauntlet',     icon: '⚡', tier: 'free',    diff: 'beginner',     cat: 'controls',  codes: ['code8'] },
  { id: 'mockexam',     icon: '📝', tier: 'free',    diff: 'intermediate', cat: 'exam',      codes: ['code8'] },
  { id: 'hybrid',       icon: '🔥', tier: 'premium', diff: 'advanced',     cat: 'rules',     codes: ['code8'] },
  { id: 'heavy',        icon: '🚛', tier: 'free',    diff: 'beginner',     cat: 'controls',  codes: ['code10', 'code14'] },
  { id: 'pdp',          icon: '🎓', tier: 'pdp',     diff: 'professional', cat: 'exam',      codes: ['code10', 'code14'] },
  { id: 'road_rules',   icon: '🚦', tier: 'free',    diff: 'beginner',     cat: 'rules',     codes: ['code12', 'code8', 'code10', 'code14'] },
  { id: 'controls',     icon: '🔩', tier: 'free',    diff: 'beginner',     cat: 'controls',  codes: ['code12', 'code8', 'code10', 'code14'] },
  { id: 'patterns',     icon: '🔢', tier: 'free',    diff: 'intermediate', cat: 'rules',     codes: ['code12', 'code8', 'code10', 'code14'] },
  { id: 'roadsigns',    icon: '🛑', tier: 'free',    diff: 'beginner',     cat: 'signs',     codes: ['code12', 'code8', 'code10', 'code14'] },
  { id: 'sign_shape',   icon: '🔷', tier: 'free',    diff: 'beginner',     cat: 'signs',     codes: ['code12', 'code8', 'code10', 'code14'] },
  { id: 'road_marks',   icon: '🟡', tier: 'free',    diff: 'intermediate', cat: 'markings',  codes: ['code12', 'code8', 'code10', 'code14'] },
  { id: 'scenario',     icon: '🎯', tier: 'free',    diff: 'intermediate', cat: 'scenarios', codes: ['code12', 'code8', 'code10', 'code14'] },
  { id: 'learner_exam', icon: '📄', tier: 'free',    diff: 'intermediate', cat: 'exam',      codes: ['code8'] },
  { id: 'voice',        icon: '🎙️', tier: 'premium', diff: 'advanced',     cat: 'signs',     codes: ['code12', 'code8', 'code10', 'code14'] },
  // Phase C: Community
  { id: 'pass_wall',    icon: '🏆', tier: 'free',    diff: 'beginner',     cat: 'community', codes: ['code12', 'code8', 'code10', 'code14'] },
  { id: 'study_battle', icon: '⚔️', tier: 'free',    diff: 'intermediate', cat: 'community', codes: ['code12', 'code8', 'code10', 'code14'] },

  { id: 'weekly_chall', icon: '🏅', tier: 'free',    diff: 'intermediate', cat: 'community', codes: ['code12', 'code8', 'code10', 'code14'] },
  { id: 'dltc_tips',    icon: '📌', tier: 'free',    diff: 'beginner',     cat: 'community', codes: ['code12', 'code8', 'code10', 'code14'] },
  { id: 'school_dash',  icon: '🏫', tier: 'free',    diff: 'beginner',     cat: 'community', codes: ['code12', 'code8', 'code10', 'code14'] },
  { id: 'community_qa', icon: '❓', tier: 'free',    diff: 'beginner',     cat: 'community', codes: ['code12', 'code8', 'code10', 'code14'] },
  // Phase D: Adaptive Drills
  { id: 'daily_diag',   icon: '📊', tier: 'free',    diff: 'beginner',     cat: 'exam',      codes: ['code12', 'code8', 'code10', 'code14'] },
  { id: 'weak_target',  icon: '🎯', tier: 'free',    diff: 'intermediate', cat: 'scenarios', codes: ['code12', 'code8', 'code10', 'code14'] },
  { id: 'ctx_cluster',  icon: '🧩', tier: 'free',    diff: 'intermediate', cat: 'scenarios', codes: ['code12', 'code8', 'code10', 'code14'] },
  { id: 'seq_builder',  icon: '📋', tier: 'free',    diff: 'intermediate', cat: 'controls',  codes: ['code12', 'code8', 'code10', 'code14'] },
  { id: 'confusables',  icon: '🥊', tier: 'free',    diff: 'intermediate', cat: 'signs',     codes: ['code12', 'code8', 'code10', 'code14'] },
  { id: 'speed_recog',  icon: '⚡', tier: 'free',    diff: 'intermediate', cat: 'rules',     codes: ['code12', 'code8', 'code10', 'code14'] },
];

const DIFF_COLORS = {
  beginner:     '#007A4D',
  intermediate: '#FFB612',
  advanced:     '#DE3831',
  professional: '#6c47ff',
};

const NAV_ICONS = {
  home: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  exam: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  weak: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  you: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

const NAV_BASE = [
  { id: 'home', labelKey: 'nav_home' },
  { id: 'exam', labelKey: 'nav_exam' },
  { id: 'weak', labelKey: 'nav_weak' },
  { id: 'you',  labelKey: 'nav_you'  },
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
  const { t } = useLang();
  const CODES = CODES_BASE.map(c => ({ ...c, sub: t(c.subKey) }));
  const GAMES = GAMES_BASE.map(g => ({ ...g, label: t(`game_${g.id}`), desc: t(`game_${g.id}_desc`) }));
  const NAV   = NAV_BASE.map(n => ({ ...n, label: t(n.labelKey) }));
  const [T, setT]             = useState(buildLiveTheme);
  const [showLanding, setShowLanding]       = useState(() => !localStorage.getItem(LANDING_KEY) && !localStorage.getItem(ONBOARDING_KEY));
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem(ONBOARDING_KEY));
  const [activeCat, setActiveCat]           = useState('all');
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
  const [refreshKey, setRefreshKey]         = useState(0);

  // ── Persist code preference ─────────────────────────────────────────────────
  const handleCodeSelect = (codeId) => {
    setSelectedCode(codeId);
    localStorage.setItem(CODE_PREF_KEY, codeId);
  };

  // ── Supabase auth ───────────────────────────────────────────────────────────
  useEffect(() => {
    // Auto-trigger Google OAuth when redirected from landing page with ?auth=google
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'google' && supabase) {
      window.history.replaceState({}, '', window.location.pathname);
      supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      return;
    }
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
        setSubMsg('No active subscription found. Email hello@creativelynanda.co.za');
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
    setRefreshKey(k => k + 1); // re-reads mastery store → NervesPanel updates
    const awarded = checkAndAwardBadges({ streakCount: newStreak });
    if (awarded?.length) { setPendingBadge(awarded[0]); setConfettiActive(true); }
  }, [refreshTier]);

  const onGamePass = useCallback(() => setConfettiActive(true), []);

  const handleGameSelect = useCallback((game) => {
    if (game.tier === 'pdp' && !hasPDPAccess()) { setShowPaywall(true); return; }
    if (game.tier === 'premium' && tier === TIERS.FREE) { setShowPaywall(true); return; }
    recordStudyDay();
    localStorage.setItem(LAST_GAME_KEY, game.id);
    setActiveGame(game.id);
  }, [tier]);

  const handleNavTap = useCallback((id) => {
    if (id === 'exam') { recordStudyDay(); localStorage.setItem(LAST_GAME_KEY, 'learner_exam'); setActiveGame('learner_exam'); return; }
    setNavTab(id);
  }, []);

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

  // ── Landing (new users) ─────────────────────────────────────────────────────
  if (showLanding) return <Landing onStart={() => { localStorage.setItem(LANDING_KEY, '1'); setShowLanding(false); }} />;

  // ── Game routes ─────────────────────────────────────────────────────────────
  if (showOnboarding) return <Onboarding onComplete={onOnboardingComplete} />;
  if (activeGame === 'gauntlet')    return <><GameErrorBoundary onBack={onGameBack} gameName="Code 8 Gauntlet"><Gauntlet            onBack={onGameBack} onPass={onGamePass} /></GameErrorBoundary>{confettiOverlay}</>;
  if (activeGame === 'hybrid')      return <><GameErrorBoundary onBack={onGameBack} gameName="Hybrid Gauntlet"><HybridGauntlet      onBack={onGameBack} onPass={onGamePass} /></GameErrorBoundary>{confettiOverlay}</>;
  if (activeGame === 'patterns')    return <><GameErrorBoundary onBack={onGameBack} gameName="Pattern Trainer"><PatternTrainer      onBack={onGameBack} onPass={onGamePass} /></GameErrorBoundary>{confettiOverlay}</>;
  if (activeGame === 'road_rules')  return <><GameErrorBoundary onBack={onGameBack} gameName="Road Rules Gauntlet"><RoadRulesGauntlet   onBack={onGameBack} onPass={onGamePass} /></GameErrorBoundary>{confettiOverlay}</>;
  if (activeGame === 'mockexam')    return <><GameErrorBoundary onBack={onGameBack} gameName="Mock Exam"><MockExam            onBack={onGameBack} onPass={onGamePass} /></GameErrorBoundary>{confettiOverlay}</>;
  if (activeGame === 'controls')    return <><GameErrorBoundary onBack={onGameBack} gameName="Vehicle Controls"><VehicleControls     onBack={onGameBack} onPass={onGamePass} /></GameErrorBoundary>{confettiOverlay}</>;
  if (activeGame === 'pdp')         return <><GameErrorBoundary onBack={onGameBack} gameName="PDP Prep"><PDPPrep             onBack={onGameBack} onPass={onGamePass} /></GameErrorBoundary>{confettiOverlay}</>;
  if (activeGame === 'motorcycle')  return <><GameErrorBoundary onBack={onGameBack} gameName="Motorcycle Gauntlet"><MotorcycleGauntlet  onBack={onGameBack} onPass={onGamePass} /></GameErrorBoundary>{confettiOverlay}</>;
  if (activeGame === 'heavy')       return <><GameErrorBoundary onBack={onGameBack} gameName="Heavy Vehicle Gauntlet"><HeavyVehicleGauntlet onBack={onGameBack} onPass={onGamePass} /></GameErrorBoundary>{confettiOverlay}</>;
  if (activeGame === 'moto_exam')   return <><GameErrorBoundary onBack={onGameBack} gameName="Motorcycle Mock Exam"><MotorcycleMockExam   onBack={onGameBack} onPass={onGamePass} /></GameErrorBoundary>{confettiOverlay}</>;
  if (activeGame === 'roadsigns')   return <><GameErrorBoundary onBack={onGameBack} gameName="Road Signs Quiz"><RoadSignsQuiz         onBack={onGameBack} onPass={onGamePass} /></GameErrorBoundary>{confettiOverlay}</>;
  if (activeGame === 'sign_shape')  return <><GameErrorBoundary onBack={onGameBack} gameName="Sign Shape Trainer"><SignShapeTrainer       onBack={onGameBack} onPass={onGamePass} /></GameErrorBoundary>{confettiOverlay}</>;
  if (activeGame === 'road_marks')  return <><GameErrorBoundary onBack={onGameBack} gameName="Road Markings Drill"><RoadMarkingsDrill      onBack={onGameBack} onPass={onGamePass} /></GameErrorBoundary>{confettiOverlay}</>;
  if (activeGame === 'scenario')    return <><GameErrorBoundary onBack={onGameBack} gameName="Scenario Drill"><ScenarioDrill          onBack={onGameBack} onPass={onGamePass} /></GameErrorBoundary>{confettiOverlay}</>;
  if (activeGame === 'learner_exam') return <><GameErrorBoundary onBack={onGameBack} gameName="K53 Learner's Exam"><K53LearnerExam         onBack={onGameBack} onPass={onGamePass} onGoToGame={(gId) => handleGameSelect(GAMES.find(g => g.id === gId) || { id: gId, tier: 'free' })} /></GameErrorBoundary>{confettiOverlay}</>;
  if (activeGame === 'voice')        return <><GameErrorBoundary onBack={onGameBack} gameName="Voice Mode"><VoiceMode              onBack={onGameBack} onPass={onGamePass} /></GameErrorBoundary>{confettiOverlay}</>;

  // ── Phase C: Community routes ──────────────────────────────────────────────
  if (activeGame === 'pass_wall')    return <GameErrorBoundary onBack={onGameBack} gameName="Pass Wall"><PassWall         onBack={onGameBack} /></GameErrorBoundary>;
  if (activeGame === 'study_battle') return <GameErrorBoundary onBack={onGameBack} gameName="Study Battle"><StudyGroupBattle onBack={onGameBack} /></GameErrorBoundary>;
  if (activeGame === 'dltc_tips')    return <GameErrorBoundary onBack={onGameBack} gameName="DLTC Tips"><DLTCTips          onBack={onGameBack} /></GameErrorBoundary>;
  if (activeGame === 'weekly_chall') return <GameErrorBoundary onBack={onGameBack} gameName="Weekly Challenge"><WeeklyChallenge  onBack={onGameBack} /></GameErrorBoundary>;
  if (activeGame === 'school_dash')  return <GameErrorBoundary onBack={onGameBack} gameName="School Dashboard"><SchoolDashboard  onBack={onGameBack} /></GameErrorBoundary>;
  if (activeGame === 'community_qa') return <GameErrorBoundary onBack={onGameBack} gameName="Community Q&A"><CommunityQA      onBack={onGameBack} /></GameErrorBoundary>;

  // ── Phase D: Adaptive Drills ─────────────────────────────────────────────────
  if (activeGame === 'daily_diag')   return <GameErrorBoundary onBack={onGameBack} gameName="Daily Diagnostic"><DailyDiagnostic  onBack={onGameBack} /></GameErrorBoundary>;
  if (activeGame === 'weak_target')  return <GameErrorBoundary onBack={onGameBack} gameName="Weak Spot Targeter"><WeakSpotTargeter onBack={onGameBack} /></GameErrorBoundary>;
  if (activeGame === 'ctx_cluster')  return <GameErrorBoundary onBack={onGameBack} gameName="Context Cluster"><ContextCluster   onBack={onGameBack} /></GameErrorBoundary>;
  if (activeGame === 'seq_builder')  return <GameErrorBoundary onBack={onGameBack} gameName="Sequence Builder"><SequenceBuilder  onBack={onGameBack} /></GameErrorBoundary>;
  if (activeGame === 'confusables')  return <GameErrorBoundary onBack={onGameBack} gameName="Confusables Battle"><ConfusablesBattle onBack={onGameBack} /></GameErrorBoundary>;
  if (activeGame === 'speed_recog')  return <GameErrorBoundary onBack={onGameBack} gameName="Speed Recognition"><SpeedRecognition onBack={onGameBack} /></GameErrorBoundary>;

  // ── Tab routes ──────────────────────────────────────────────────────────────
  if (navTab === 'checklist') return <VehicleChecklist onBack={() => setNavTab('home')} />;
  if (navTab === 'testday')   return <TestDayPrep      onBack={() => setNavTab('home')} />;
  if (navTab === 'weak')      return <WeakSpotsReview  onBack={() => setNavTab('home')} />;
  if (navTab === 'progress')  return <ProgressHistory  onBack={() => setNavTab('home')} />;
  if (navTab === 'settings' || navTab === 'you') return <Settings onBack={() => setNavTab('home')} onFontSizeChange={handleFontSizeChange} />;

  // ── Dashboard ───────────────────────────────────────────────────────────────
  const inTrial   = isInFreeTrial();
  const trialLeft = daysLeftInTrial();
  const weakNerves = getWeakNerves(1);
  const weakNerve  = weakNerves[0] || null;
  const lastGame   = localStorage.getItem(LAST_GAME_KEY);
  const lastGameObj = GAMES.find(g => g.id === lastGame);
  const filteredGames = GAMES
    .filter(g => g.codes.includes(selectedCode))
    .filter(g => activeCat === 'all' || g.cat === activeCat);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font, fontSize: T.fontSize, paddingBottom: 84 }}>
      <Confetti active={confettiActive} />
      {pendingBadge && <BadgeToast badgeId={pendingBadge} onDismiss={() => { setPendingBadge(null); setConfettiActive(false); }} />}

      {/* ── Slim top bar ─────────────────────────────────────────────────────── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: T.surface, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', height: 3 }}>
          {['#007A4D','#FFB612','#DE3831','#4472CA','#000','#F5F5F0'].map((c,i) => (
            <div key={i} style={{ flex: 1, background: c }} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 14px', height: 50, gap: 8 }}>
          <span style={{ fontWeight: 800, fontSize: T.fontSizeLg, color: T.text, letterSpacing: -0.3, flex: 1 }}>
            K53 <span style={{ fontSize: 16 }}>🇿🇦</span>
          </span>
          <div style={{ background: 'rgba(255,182,18,0.1)', border: '1px solid rgba(255,182,18,0.2)', borderRadius: 99, padding: '3px 9px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 13 }}>🔥</span>
            <span style={{ color: T.gold, fontWeight: 700, fontSize: 11 }}>{streak}</span>
          </div>
          {(inTrial || tier !== TIERS.FREE) && (
            <div style={{ background: 'rgba(0,122,77,0.15)', border: '1px solid rgba(0,122,77,0.3)', borderRadius: 99, padding: '3px 9px' }}>
              <span style={{ color: '#4ade80', fontWeight: 700, fontSize: 10 }}>{inTrial ? `🎁 ${trialLeft}d` : '✅ PRO'}</span>
            </div>
          )}
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => setShowBadgeGrid(true)}
            style={{ background: 'none', border: 'none', color: T.gold, cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 2 }}>
            🏅
          </motion.button>
          {!user ? (
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowAuth(true)}
              style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.border}`, borderRadius: 8, padding: '4px 10px', color: T.dim, cursor: 'pointer', fontSize: 11, fontFamily: T.font }}>
              Sign in
            </motion.button>
          ) : (
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => { supabase?.auth.signOut(); setUser(null); setSubMsg(''); }}
              style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.border}`, borderRadius: 8, padding: '4px 10px', color: T.dim, cursor: 'pointer', fontSize: 11, fontFamily: T.font }}>
              Out
            </motion.button>
          )}
        </div>
      </header>

      <main style={{ padding: '16px 16px 0' }}>

        {/* ── Nervous System Panel ─────────────────────────────────────────────── */}
        <NervesPanel
          refreshKey={refreshKey}
          onPlay={(gameId) => handleGameSelect(GAMES.find(g => g.id === gameId) || { id: gameId, tier: 'free' })}
        />

        {/* ── Quick Start row ──────────────────────────────────────────────────── */}
        <div style={{ overflowX: 'auto', display: 'flex', gap: 10, paddingBottom: 4, marginBottom: 18, scrollbarWidth: 'none' }}>
          <motion.div whileTap={{ scale: 0.96 }}
            onClick={() => handleGameSelect(GAMES.find(g => g.id === 'learner_exam') || { id: 'learner_exam', tier: 'free' })}
            style={{ flexShrink: 0, width: 160, background: 'linear-gradient(135deg,#FF6B35,#e0521c)', borderRadius: 14, padding: '14px 14px 12px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', bottom: -10, right: -8, fontSize: 44, opacity: 0.18, lineHeight: 1 }}>📄</div>
            <div style={{ fontWeight: 800, fontSize: 13, color: '#fff', lineHeight: 1.2, marginBottom: 4 }}>K53 Learner Exam</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', lineHeight: 1.35 }}>64 questions · Official format</div>
            <div style={{ marginTop: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 6, padding: '3px 8px', display: 'inline-block' }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>START NOW →</span>
            </div>
          </motion.div>

          {weakNerve && (
            <motion.div whileTap={{ scale: 0.96 }}
              onClick={() => handleGameSelect(GAMES.find(g => g.id === NERVE_GAME_MAP[weakNerve.id]) || { id: NERVE_GAME_MAP[weakNerve.id], tier: 'free' })}
              style={{ flexShrink: 0, width: 148, background: `linear-gradient(135deg,${weakNerve.color}cc,${weakNerve.color}88)`, borderRadius: 14, padding: '14px 14px 12px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: -10, right: -8, fontSize: 44, opacity: 0.18, lineHeight: 1 }}>⚡</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.75)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>Needs work</div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#fff', lineHeight: 1.2, marginBottom: 4 }}>{weakNerve.label}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)' }}>{weakNerve.score}% mastery</div>
              <div style={{ marginTop: 8, background: 'rgba(255,255,255,0.2)', borderRadius: 6, padding: '3px 8px', display: 'inline-block' }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>DRILL IT →</span>
              </div>
            </motion.div>
          )}

          {lastGameObj && (
            <motion.div whileTap={{ scale: 0.96 }}
              onClick={() => handleGameSelect(lastGameObj)}
              style={{ flexShrink: 0, width: 148, background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 14, padding: '14px 14px 12px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: -10, right: -8, fontSize: 44, opacity: 0.1, lineHeight: 1 }}>{lastGameObj.icon}</div>
              <div style={{ fontSize: 9, fontWeight: 700, color: T.dim, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>Last played</div>
              <div style={{ fontWeight: 800, fontSize: 13, color: T.text, lineHeight: 1.2, marginBottom: 4 }}>{lastGameObj.label}</div>
              <div style={{ marginTop: 8, background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.border}`, borderRadius: 6, padding: '3px 8px', display: 'inline-block' }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: T.dim, letterSpacing: 0.5 }}>CONTINUE →</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Code picker ──────────────────────────────────────────────────────── */}
        <div style={{ overflowX: 'auto', display: 'flex', gap: 8, paddingBottom: 2, marginBottom: 14, scrollbarWidth: 'none' }}>
          {CODES.map(code => {
            const active = selectedCode === code.id;
            return (
              <motion.button key={code.id} whileTap={{ scale: 0.93 }} onClick={() => handleCodeSelect(code.id)}
                style={{
                  flexShrink: 0, background: active ? '#007A4D' : T.surfaceAlt,
                  border: `1px solid ${active ? '#007A4D' : T.border}`,
                  borderRadius: 99, padding: '6px 14px', cursor: 'pointer', fontFamily: T.font,
                  display: 'flex', alignItems: 'center', gap: 5,
                  boxShadow: active ? '0 2px 10px rgba(0,122,77,0.3)' : 'none',
                  transition: 'all 0.15s',
                }}>
                <span style={{ fontSize: 14 }}>{code.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: active ? '#fff' : T.text }}>{code.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* ── Category filter pills ─────────────────────────────────────────────── */}
        <div style={{ overflowX: 'auto', display: 'flex', gap: 7, paddingBottom: 2, marginBottom: 16, scrollbarWidth: 'none' }}>
          {CATS.map(cat => {
            const active = activeCat === cat.id;
            return (
              <motion.button key={cat.id} whileTap={{ scale: 0.92 }} onClick={() => setActiveCat(cat.id)}
                style={{
                  flexShrink: 0, background: active ? T.gold : T.surfaceAlt,
                  border: `1px solid ${active ? T.gold : T.border}`,
                  borderRadius: 99, padding: '5px 12px', cursor: 'pointer', fontFamily: T.font,
                  display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.15s',
                }}>
                <span style={{ fontSize: 12 }}>{cat.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: active ? '#000' : T.dim }}>{cat.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* ── Game list ─────────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.dim, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            {filteredGames.length} {filteredGames.length === 1 ? 'mode' : 'modes'}
          </div>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>
        {filteredGames.map((game, i) => <GameCard key={game.id} game={game} index={i} tier={tier} onSelect={handleGameSelect} />)}
        {filteredGames.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 20px', color: T.dim, fontSize: T.fontSize - 1 }}>
            No modes for this filter.{' '}
            <span style={{ cursor: 'pointer', color: T.gold }} onClick={() => setActiveCat('all')}>Show all</span>
          </div>
        )}

        {/* ── Pricing strip ─────────────────────────────────────────────────────── */}
        {(tier === TIERS.FREE && !inTrial) && <PricingStrip T={T} onPlanSelect={(t) => { window.location.href = `/api/checkout?plan=${t}`; }} />}

        {/* ── Trial upgrade nudge ───────────────────────────────────────────────── */}
        {inTrial && (
          <motion.div whileTap={{ scale: 0.98 }} onClick={() => setShowPaywall(true)}
            style={{ background: `linear-gradient(135deg,rgba(0,122,77,0.15),rgba(255,182,18,0.08))`, border: `1px solid rgba(255,182,18,0.2)`, borderRadius: T.radiusLg, padding: '14px 16px', marginTop: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🚀</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: T.gold, fontSize: T.fontSizeLg }}>{t('lockInTitle')}</div>
              <div style={{ fontSize: T.fontSize - 2, color: T.dim }}>{t('lockInSub')}</div>
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
            <motion.button key={item.id} whileTap={{ scale: 0.88 }} onClick={() => handleNavTap(item.id)}
              style={{ flex: 1, background: 'none', border: 'none', padding: '10px 0 8px', color: active ? T.gold : T.dim, cursor: 'pointer', fontFamily: T.font, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, transition: 'color 0.2s', position: 'relative' }}>
              {active && (
                <motion.div layoutId="nav-active-dot"
                  style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 20, height: 2, background: T.gold, borderRadius: 99 }} />
              )}
              {NAV_ICONS[item.id]}
              <span style={{ fontSize: 9, fontWeight: active ? 700 : 400, letterSpacing: 0.3 }}>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* ── Badges sheet ──────────────────────────────────────────────────────── */}
      <Sheet show={showBadgeGrid} onClose={() => setShowBadgeGrid(false)}>
        <div style={{ background: T.surface, borderRadius: '20px 20px 0 0', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: T.fontSizeXl }}>{t('yourBadges')}</div>
            <button onClick={() => setShowBadgeGrid(false)} style={{ background: 'none', border: 'none', color: T.dim, fontSize: 24, cursor: 'pointer' }}>×</button>
          </div>
          <BadgeGrid />
          <div style={{ height: 20 }} />
        </div>
      </Sheet>

      {/* ── Paywall sheet ─────────────────────────────────────────────────────── */}
      <Sheet show={showPaywall} onClose={() => setShowPaywall(false)}>
        <div style={{ background: T.surface, borderRadius: '20px 20px 0 0', padding: '24px 20px' }}>
          <div style={{ fontWeight: 800, fontSize: T.fontSizeXl, marginBottom: 4 }}>{t('unlockAccess')}</div>
          <div style={{ color: T.dim, fontSize: T.fontSize, marginBottom: 20 }}>
            {t('unlockSub')}
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
                  {plan.highlight && <span style={{ background: T.gold, color: '#000', borderRadius: 6, padding: '1px 7px', fontSize: 9, fontWeight: 800, letterSpacing: 1 }}>{t('bestValue')}</span>}
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
            {t('maybeLater')}
          </button>
        </div>
      </Sheet>

      {/* ── Auth modal ─────────────────────────────────────────────────────────── */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}

// ── Game card component ────────────────────────────────────────────────────────
function GameCard({ game, index, tier, onSelect }) {
  const T = BaseT;
  const { t } = useLang();
  const nerveId    = GAME_NERVE_MAP[game.id] || 'rules';
  const nerveColor = NERVE_COLOR_MAP[nerveId] || '#FFB612';
  const locked = (game.tier === 'pdp' && !hasPDPAccess()) || (game.tier === 'premium' && tier === TIERS.FREE);

  return (
    <motion.div
      custom={index} variants={cardVariants} initial="hidden" animate="visible"
      whileTap={!locked ? { scale: 0.975 } : {}}
      onClick={() => !locked && onSelect(game)}
      style={{
        background: T.surfaceAlt,
        border: `1px solid ${T.border}`,
        borderRadius: 16, marginBottom: 8,
        cursor: locked ? 'default' : 'pointer',
        opacity: locked ? 0.45 : 1,
        position: 'relative', overflow: 'hidden',
        boxShadow: !locked ? `0 1px 3px rgba(0,0,0,0.4)` : 'none',
        display: 'flex',
      }}>
      <div style={{ width: 3, flexShrink: 0, background: nerveColor, borderRadius: '16px 0 0 16px', alignSelf: 'stretch' }} />
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
        <div style={{
          width: 52, height: 52, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${nerveColor}14`, margin: '10px 0 10px 12px', borderRadius: 12,
          border: `1px solid ${nerveColor}28`,
        }}>
          <span style={{ fontSize: 24 }}>{game.icon}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0, padding: '12px 10px 12px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: T.fontSizeLg, lineHeight: 1.2 }}>{game.label}</span>
            <span style={{
              background: `${nerveColor}18`, color: nerveColor, borderRadius: 6,
              padding: '1px 6px', fontSize: 9, fontWeight: 700,
              letterSpacing: 0.5, textTransform: 'uppercase',
            }}>{nerveId}</span>
            {locked && (
              <span style={{
                background: 'rgba(255,255,255,0.05)', color: T.dim, borderRadius: 6,
                padding: '1px 7px', fontSize: T.fontSize - 3, border: `1px solid ${T.border}`,
              }}>🔒 {t('upgradeLabel')}</span>
            )}
          </div>
          <div style={{ color: T.dim, fontSize: T.fontSize - 2, lineHeight: 1.45 }}>{game.desc}</div>
        </div>
        {!locked && (
          <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: `${nerveColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={nerveColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  );
}




// ── Inline pricing strip ──────────────────────────────────────────────────────
function PricingStrip({ T, onPlanSelect }) {
  const { t } = useLang();
  const cols = [
    { label: 'Free',     price: 'R0',   period: '/day',  features: ['10 questions/day', '30-day trial unlimited', 'Progress tracking'], cta: t('currentPlan'), active: true,  tier: null },
    { label: 'Monthly',  price: 'R29',  period: '/mo',   features: ['Unlimited questions', 'All 7 modes', 'Badges + streaks'],           cta: 'Get Monthly',    active: false, tier: TIERS.MONTHLY },
    { label: '3 Months', price: 'R69',  period: '',      features: ['Best value', 'Unlimited + PDP Prep', 'Save R18'],                    cta: `${t('bestValue')} ✦`, active: false, tier: TIERS.BUNDLE, highlight: true },
  ];
  return (
    <div style={{ marginTop: 24, marginBottom: 4 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.dim, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>
        {t('pricingTitle')}
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
        {t('pricingFooter')}
      </div>
    </div>
  );
}

