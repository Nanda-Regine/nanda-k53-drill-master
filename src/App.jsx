import { useState, useEffect, useCallback } from 'react';
import { T as BaseT, getFontSize, setFontSize } from './theme.js';

// ── Games ──────────────────────────────────────────────────────────────────────
import Gauntlet         from './games/Gauntlet.jsx';
import HybridGauntlet   from './games/HybridGauntlet.jsx';
import PatternTrainer   from './games/PatternTrainer.jsx';
import RoadRulesGauntlet from './games/RoadRulesGauntlet.jsx';
import MockExam         from './games/MockExam.jsx';
import VehicleControls  from './games/VehicleControls.jsx';
import PDPPrep          from './games/PDPPrep.jsx';

// ── Components ─────────────────────────────────────────────────────────────────
import Onboarding       from './components/Onboarding.jsx';
import Confetti         from './components/Confetti.jsx';
import { BadgeToast, BadgeGrid, checkAndAwardBadges } from './components/Badges.jsx';
import AuthModal        from './components/AuthModal.jsx';
import ProgressHistory  from './components/ProgressHistory.jsx';
import WeakSpotsReview  from './components/WeakSpotsReview.jsx';
import VehicleChecklist from './components/VehicleChecklist.jsx';
import Settings         from './components/Settings.jsx';
import Footer           from './components/Footer.jsx';

// ── Utils ──────────────────────────────────────────────────────────────────────
import { recordStudyDay, getStreak } from './utils/streakTracker.js';
import { supabase }     from './supabase.js';
import {
  getTier, getRemainingToday, hasPDPAccess, TIER_LABELS, activateTier, TIERS,
  storePremiumToken, isPremium, isInFreeTrial, daysLeftInTrial,
} from './freemium.js';

const ONBOARDING_KEY = 'k53_onboarding_complete';

function buildLiveTheme() {
  const size = getFontSize();
  const scales = {
    small:  { base: 13, lg: 15, xl: 17, xxl: 22, heading: 26 },
    medium: { base: 15, lg: 17, xl: 19, xxl: 24, heading: 28 },
    large:  { base: 17, lg: 19, xl: 21, xxl: 27, heading: 32 },
    xlarge: { base: 20, lg: 22, xl: 24, xxl: 30, heading: 36 },
  };
  const scale = scales[size] || scales.medium;
  return { ...BaseT, fontSize: scale.base, fontSizeLg: scale.lg, fontSizeXl: scale.xl, fontSizeXxl: scale.xxl, fontSizeHeading: scale.heading };
}

// ── Pricing plans (PayFast integration) ────────────────────────────────────────
const PLANS = [
  { tier: TIERS.MONTHLY,      label: 'Monthly',         price: 'R29/month',  desc: 'Cancel anytime',               highlight: false },
  { tier: TIERS.BUNDLE,       label: '3-Month Bundle',  price: 'R69',        desc: 'Best value — save R18',        highlight: true  },
  { tier: TIERS.LIFETIME,     label: 'Lifetime',        price: 'R149',       desc: 'One-time · All modes forever', highlight: false },
  { tier: TIERS.LIFETIME_PDP, label: 'Lifetime + PDP',  price: 'R199',       desc: 'Includes PDP Prep Programme',  highlight: false },
];

// ── Games catalogue ─────────────────────────────────────────────────────────────
const GAMES = [
  { id: 'gauntlet',   label: 'Code 8 Gauntlet',         desc: '9 rounds · 90 questions · all K53 categories', icon: '⚡', tier: 'free',    diff: 'beginner'     },
  { id: 'road_rules', label: 'Road Rules Gauntlet',      desc: '15 rounds · 75 questions · timed',             icon: '🚦', tier: 'free',    diff: 'beginner'     },
  { id: 'controls',   label: 'Vehicle Controls Test',    desc: '30 questions · lights, brakes, instruments',   icon: '🔩', tier: 'free',    diff: 'beginner'     },
  { id: 'patterns',   label: 'Know Your Numbers',        desc: '41 values · pattern + speed modes',            icon: '🔢', tier: 'free',    diff: 'intermediate' },
  { id: 'hybrid',     label: 'Hybrid Gauntlet',          desc: '10 rounds · 100 tricky "EXCEPT" questions',    icon: '🔥', tier: 'premium', diff: 'advanced'     },
  { id: 'mockexam',   label: 'Mock Exam',                desc: '68 questions · 45 min · 75% to pass',          icon: '📝', tier: 'free',    diff: 'intermediate' },
  { id: 'pdp',        label: 'PDP Prep Programme',       desc: '6 modules · 100 questions · certificate',      icon: '🎓', tier: 'pdp',     diff: 'professional' },
];

const DIFF_COLORS = {
  beginner:     '#007A4D',
  intermediate: '#FFB612',
  advanced:     '#DE3831',
  professional: '#6c47ff',
};

const NAV = [
  { id: 'home',      icon: '🏠', label: 'Home'      },
  { id: 'checklist', icon: '✅', label: 'Checklist' },
  { id: 'weak',      icon: '🎯', label: 'Weak Spots'},
  { id: 'progress',  icon: '📈', label: 'Progress'  },
  { id: 'settings',  icon: '⚙️', label: 'Settings'  },
];

function shareWhatsApp(streak) {
  const text = ['🇿🇦 K53 Drill Master', `🔥 ${streak}-day study streak!`, '📚 Practising for my SA learner\'s licence', '💪 Join me — k53drillmaster.co.za'].join('\n');
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

export default function App() {
  const [T, setT]               = useState(buildLiveTheme);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem(ONBOARDING_KEY));
  const [activeGame, setActiveGame]         = useState(null);
  const [navTab, setNavTab]                 = useState('home');
  const [streak, setStreak]                 = useState(() => getStreak());
  const [tier, setTier]                     = useState(() => getTier());
  const [remaining, setRemaining]           = useState(() => getRemainingToday());
  const [pendingBadge, setPendingBadge]     = useState(null);
  const [confettiActive, setConfettiActive] = useState(false);
  const [showPaywall, setShowPaywall]       = useState(false);
  const [showBadgeGrid, setShowBadgeGrid]   = useState(false);

  // ── Auth state ──────────────────────────────────────────────────────────────
  const [showAuth, setShowAuth]     = useState(false);
  const [user, setUser]             = useState(null);
  const [subMsg, setSubMsg]         = useState('');

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); checkSubscription(session.user); }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user || null;
      setUser(u);
      if (u) checkSubscription(u);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function checkSubscription(u) {
    if (!supabase) return;
    try {
      const { data } = await supabase
        .from('subscribers')
        .select('plan, expires_at')
        .eq('user_id', u.id)
        .single();
      if (data) {
        storePremiumToken(data.plan, data.expires_at);
        setTier(getTier());
        setRemaining(getRemainingToday());
        setSubMsg('');
      } else {
        setSubMsg('No active subscription. Contact us on WhatsApp.');
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

  // ── Handle URL unlock token ─────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const unlock = params.get('unlock');
    if (unlock) {
      fetch(`/api/verify?token=${unlock}`)
        .then(r => r.json())
        .then(d => {
          if (d.ok) {
            storePremiumToken(d.plan, d.expires_at);
            refreshTier();
            setShowAuth(true);
          }
        })
        .catch(() => {});
      window.history.replaceState({}, '', '/');
    }
  }, [refreshTier]);

  const handleFontSizeChange = useCallback((size) => {
    setFontSize(size);
    setT(buildLiveTheme());
  }, []);

  const onOnboardingComplete = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setShowOnboarding(false);
    const awarded = checkAndAwardBadges({ totalAnswered: 0 });
    if (awarded?.length) { setPendingBadge(awarded[0]); setConfettiActive(true); }
  }, []);

  const onGameBack = useCallback(() => {
    setActiveGame(null);
    const newStreak = getStreak();
    setStreak(newStreak);
    refreshTier();
    const awarded = checkAndAwardBadges({ streakCount: newStreak });
    if (awarded?.length) { setPendingBadge(awarded[0]); setConfettiActive(true); }
  }, [refreshTier]);

  const handleGameSelect = useCallback((game) => {
    if (game.tier === 'pdp' && !hasPDPAccess()) { setShowPaywall(true); return; }
    if (game.tier === 'premium' && tier === TIERS.FREE) { setShowPaywall(true); return; }
    recordStudyDay();
    setActiveGame(game.id);
  }, [tier]);

  // ── Route to games ──────────────────────────────────────────────────────────
  if (showOnboarding) return <Onboarding onComplete={onOnboardingComplete} />;
  if (activeGame === 'gauntlet')   return <Gauntlet        onBack={onGameBack} />;
  if (activeGame === 'hybrid')     return <HybridGauntlet  onBack={onGameBack} />;
  if (activeGame === 'patterns')   return <PatternTrainer  onBack={onGameBack} />;
  if (activeGame === 'road_rules') return <RoadRulesGauntlet onBack={onGameBack} />;
  if (activeGame === 'mockexam')   return <MockExam        onBack={onGameBack} />;
  if (activeGame === 'controls')   return <VehicleControls onBack={onGameBack} />;
  if (activeGame === 'pdp')        return <PDPPrep         onBack={onGameBack} />;

  // ── Route to nav tabs ───────────────────────────────────────────────────────
  if (navTab === 'checklist') return <VehicleChecklist onBack={() => setNavTab('home')} />;
  if (navTab === 'weak')      return <WeakSpotsReview  onBack={() => setNavTab('home')} />;
  if (navTab === 'progress')  return <ProgressHistory  onBack={() => setNavTab('home')} />;
  if (navTab === 'settings')  return <Settings onBack={() => setNavTab('home')} onFontSizeChange={handleFontSizeChange} />;

  // ── Dashboard (Home) ────────────────────────────────────────────────────────
  const trialLeft = daysLeftInTrial();
  const inTrial   = isInFreeTrial();

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, fontFamily: T.font, fontSize: T.fontSize, paddingBottom: 80 }}>
      <Confetti active={confettiActive} />

      {pendingBadge && (
        <BadgeToast badgeId={pendingBadge} onDismiss={() => { setPendingBadge(null); setConfettiActive(false); }} />
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header style={{ background: 'linear-gradient(135deg,#061209,#0a1f0d)', padding: '0 0 16px', position: 'relative' }}>
        {/* SA flag stripe */}
        <div style={{ display: 'flex', height: 6 }}>
          {['#000','#FFB612','#007A4D','#F5F5F0','#DE3831','#4472CA'].map((c, i) => (
            <div key={i} style={{ flex: 1, background: c }} />
          ))}
        </div>

        <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: T.fontSizeXxl, fontWeight: 800, color: T.white, margin: 0, lineHeight: 1.2 }}>
              🇿🇦 K53 Drill Master
            </h1>
            <p style={{ color: T.dim, fontSize: T.fontSize - 1, margin: '3px 0 0' }}>
              Ace your SA learner's licence
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => setShowBadgeGrid(true)}
              title="Your badges"
              style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${T.border}`, borderRadius: 10, padding: '7px 11px', color: T.gold, cursor: 'pointer', fontSize: 20 }}
            >
              🏅
            </button>
            {!user ? (
              <button
                onClick={() => setShowAuth(true)}
                style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: 8, padding: '6px 12px', color: T.dim, cursor: 'pointer', fontSize: T.fontSize - 2, fontFamily: T.font }}
              >
                Sign in
              </button>
            ) : (
              <button
                onClick={() => { supabase?.auth.signOut(); setUser(null); setSubMsg(''); }}
                style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: 8, padding: '6px 12px', color: T.dim, cursor: 'pointer', fontSize: T.fontSize - 2, fontFamily: T.font }}
              >
                Sign out
              </button>
            )}
          </div>
        </div>

        {/* Status pills */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 20px 0', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,182,18,0.12)', border: '1px solid rgba(255,182,18,0.3)', borderRadius: 99, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span>🔥</span>
            <span style={{ color: T.gold, fontWeight: 700, fontSize: T.fontSize - 1 }}>{streak} day streak</span>
          </div>

          {inTrial && (
            <div style={{ background: 'rgba(0,122,77,0.15)', border: '1px solid rgba(0,122,77,0.35)', borderRadius: 99, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ color: '#4ade80', fontWeight: 600, fontSize: T.fontSize - 1 }}>🎁 Free trial — {trialLeft}d left</span>
            </div>
          )}

          {!inTrial && tier !== TIERS.FREE && (
            <div style={{ background: 'rgba(0,122,77,0.15)', border: '1px solid rgba(0,122,77,0.35)', borderRadius: 99, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ color: '#4ade80', fontWeight: 600, fontSize: T.fontSize - 1 }}>✅ {TIER_LABELS[tier]}</span>
            </div>
          )}

          {!inTrial && tier === TIERS.FREE && remaining !== Infinity && (
            <div style={{ background: 'rgba(222,56,49,0.12)', border: '1px solid rgba(222,56,49,0.3)', borderRadius: 99, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ color: '#f87171', fontWeight: 600, fontSize: T.fontSize - 1 }}>📊 {remaining} questions left today</span>
            </div>
          )}

          <button
            onClick={() => shareWhatsApp(streak)}
            style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)', borderRadius: 99, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', color: '#25d366', fontWeight: 600, fontSize: T.fontSize - 1, fontFamily: T.font }}
          >
            💬 Share
          </button>
        </div>

        {subMsg && (
          <div style={{ margin: '10px 20px 0', background: 'rgba(222,56,49,0.12)', border: '1px solid rgba(222,56,49,0.3)', borderRadius: 8, padding: '8px 12px', fontSize: T.fontSize - 1, color: '#f87171' }}>
            {subMsg}
          </div>
        )}
      </header>

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <main style={{ padding: '16px 20px 0' }}>

        {/* Quick actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { id: 'checklist', icon: '✅', label: 'Vehicle\nChecklist',  color: T.green },
            { id: 'weak',      icon: '🎯', label: 'Weak Spots\nDrill',   color: T.red   },
          ].map(a => (
            <div
              key={a.id}
              onClick={() => setNavTab(a.id)}
              style={{ background: T.surface, border: `1px solid ${a.color}33`, borderRadius: T.radiusLg, padding: '14px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <span style={{ fontSize: 24 }}>{a.icon}</span>
              <span style={{ fontWeight: 600, fontSize: T.fontSize, lineHeight: 1.35, whiteSpace: 'pre-line' }}>{a.label}</span>
            </div>
          ))}
        </div>

        {/* Game cards */}
        <div style={{ fontWeight: 600, fontSize: T.fontSize - 2, color: T.dim, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
          Practice Modes
        </div>

        {GAMES.map(game => {
          const locked = (game.tier === 'pdp' && !hasPDPAccess()) || (game.tier === 'premium' && tier === TIERS.FREE);
          const dc = DIFF_COLORS[game.diff];
          return (
            <div
              key={game.id}
              onClick={() => handleGameSelect(game)}
              style={{
                background: T.surface,
                border: `1px solid ${locked ? T.border : dc + '44'}`,
                borderRadius: T.radiusLg,
                padding: '14px 14px',
                marginBottom: 10,
                cursor: 'pointer',
                opacity: locked ? 0.55 : 1,
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.1s',
              }}
              onMouseEnter={e => { if (!locked) e.currentTarget.style.transform = 'scale(1.01)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: dc }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingLeft: 8 }}>
                <span style={{ fontSize: 26, flexShrink: 0 }}>{game.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: T.fontSizeLg }}>{game.label}</span>
                    <span style={{ background: dc + '22', color: dc, borderRadius: 99, padding: '1px 8px', fontSize: T.fontSize - 3, fontWeight: 600, textTransform: 'capitalize' }}>{game.diff}</span>
                    {locked && <span style={{ background: T.surface, color: T.dim, borderRadius: 99, padding: '1px 8px', fontSize: T.fontSize - 3, border: `1px solid ${T.border}` }}>🔒 Upgrade</span>}
                  </div>
                  <div style={{ color: T.dim, fontSize: T.fontSize - 1 }}>{game.desc}</div>
                </div>
                <span style={{ fontSize: 18, color: T.dim }}>›</span>
              </div>
            </div>
          );
        })}

        {/* Upgrade banner for free users */}
        {tier === TIERS.FREE && !inTrial && (
          <div
            onClick={() => setShowPaywall(true)}
            style={{ background: `linear-gradient(135deg,${T.green}18,${T.gold}18)`, border: `1px solid ${T.green}44`, borderRadius: T.radiusLg, padding: '14px 16px', marginTop: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <span style={{ fontSize: 24 }}>🚀</span>
            <div>
              <div style={{ fontWeight: 700, color: T.gold, fontSize: T.fontSizeLg }}>Unlock Full Access</div>
              <div style={{ fontSize: T.fontSize - 2, color: T.dim }}>From R29/month · All modes + PDP Prep</div>
            </div>
            <span style={{ marginLeft: 'auto', color: T.gold, fontSize: 18 }}>›</span>
          </div>
        )}

        <Footer />
      </main>

      {/* ── Bottom nav ────────────────────────────────────────────────────────── */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: T.surface, borderTop: `1px solid ${T.border}`, display: 'flex', zIndex: 100 }}>
        {NAV.map(item => {
          const active = navTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setNavTab(item.id)}
              style={{
                flex: 1, background: 'none', border: 'none',
                padding: '10px 0 8px',
                color: active ? T.gold : T.dim,
                cursor: 'pointer',
                fontFamily: T.font,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                borderTop: `2px solid ${active ? T.gold : 'transparent'}`,
                transition: 'color 0.15s',
              }}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 400 }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Badge grid modal ──────────────────────────────────────────────────── */}
      {showBadgeGrid && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9990, display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowBadgeGrid(false)}>
          <div style={{ background: T.surface, borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '80vh', overflowY: 'auto', padding: 20 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: T.fontSizeXl }}>Your Badges</div>
              <button onClick={() => setShowBadgeGrid(false)} style={{ background: 'none', border: 'none', color: T.text, fontSize: 24, cursor: 'pointer' }}>×</button>
            </div>
            <BadgeGrid />
          </div>
        </div>
      )}

      {/* ── Paywall modal ──────────────────────────────────────────────────────── */}
      {showPaywall && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9995, display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowPaywall(false)}>
          <div style={{ background: T.surface, borderRadius: '20px 20px 0 0', width: '100%', padding: 24 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: T.fontSizeXl, marginBottom: 4 }}>Unlock Full Access</div>
            <div style={{ color: T.dim, fontSize: T.fontSize, marginBottom: 20 }}>
              Choose a plan — all include unlimited questions
            </div>
            {PLANS.map(plan => (
              <div
                key={plan.tier}
                onClick={() => {
                  // For real payments, redirect to /api/checkout
                  // For dev/demo, activateTier directly
                  activateTier(plan.tier);
                  refreshTier();
                  setShowPaywall(false);
                }}
                style={{
                  background: plan.highlight ? `linear-gradient(135deg,${T.green},#005a38)` : T.surfaceAlt,
                  border: `1px solid ${plan.highlight ? T.green : T.border}`,
                  borderRadius: T.radiusLg,
                  padding: '14px 16px',
                  marginBottom: 10,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: T.fontSizeLg, color: plan.highlight ? '#fff' : T.text }}>
                    {plan.label}
                    {plan.highlight && <span style={{ marginLeft: 8, background: T.gold, color: '#000', borderRadius: 4, padding: '1px 7px', fontSize: 10, fontWeight: 800 }}>BEST</span>}
                  </div>
                  <div style={{ fontSize: T.fontSize - 2, color: plan.highlight ? 'rgba(255,255,255,0.7)' : T.dim }}>{plan.desc}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: T.fontSizeXl, color: T.gold }}>{plan.price}</div>
              </div>
            ))}
            <button
              onClick={() => setShowPaywall(false)}
              style={{ width: '100%', marginTop: 6, background: 'none', border: 'none', color: T.dim, cursor: 'pointer', fontSize: T.fontSize, padding: '8px 0', fontFamily: T.font }}
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* ── Auth modal ─────────────────────────────────────────────────────────── */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
