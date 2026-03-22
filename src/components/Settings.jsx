import { useState } from 'react';
import { T, getFontSize, setFontSize } from '../theme.js';
import { resetHistory } from '../utils/progressHistory.js';
import { resetStreak } from '../utils/streakTracker.js';
import { resetSR } from '../utils/spacedRepetition.js';
import { useLang } from '../LangContext.jsx';
import { isSoundEnabled, setSoundEnabled, sfx } from '../utils/sounds.js';
import { isPremium, isInFreeTrial, daysLeftInTrial, getRemainingToday, DAILY_LIMIT } from '../freemium.js';

// ── Legal documents ────────────────────────────────────────────────────────────
const LEGAL_DOCS = {
  privacy: {
    title: 'Privacy Policy',
    content: `PRIVACY POLICY — K53 Drill Master
Last updated: March 2026

1. DATA WE COLLECT
All study data (progress, streaks, badges, quiz history) is stored locally on your device using browser localStorage. We do not upload your answers to any server.

If you sign in with a magic link, we store your email address in our Supabase database solely to verify your subscription. We do not sell or share your email.

Payment processing is handled by PayFast. We never see or store your card details.

2. ANALYTICS
We use Vercel Analytics to track aggregate page views. No personally identifiable information is collected.

3. YOUR RIGHTS
Delete all local data via Settings → Reset all progress.
To delete your account, email hello@creativelynanda.co.za.

4. CONTACT
Nandawula Kabali-Kagwa · hello@creativelynanda.co.za`,
  },
  terms: {
    title: 'Terms of Service',
    content: `TERMS OF SERVICE — K53 Drill Master
Last updated: March 2026

1. ACCEPTANCE
By using K53 Drill Master you agree to these terms.

2. SERVICE
K53 Drill Master is an educational tool for the SA DLTC learner's licence test. We do not guarantee pass results.

3. FREE TIER
Free users receive a 30-day unlimited trial from first use.
After the trial: up to ${DAILY_LIMIT} questions per day, free forever.
The ${DAILY_LIMIT}-question daily limit resets at midnight each day.
Each answered question (correct or wrong) counts toward the daily limit.

4. PAID PLANS
Processed via PayFast (ZAR). Monthly plans auto-renew. Lifetime plans are one-time.
No refunds after activation.

5. INTELLECTUAL PROPERTY
Questions sourced from public DLTC manuals. App code is proprietary — do not copy or resell.

6. LIABILITY
Provided "as is". Not liable for test outcomes.

7. CONTACT
hello@creativelynanda.co.za`,
  },
  disclaimer: {
    title: 'Disclaimer',
    content: `EDUCATIONAL DISCLAIMER

K53 Drill Master is independent and NOT affiliated with the SA Department of Transport, DLTC, or any government body.

Questions are based on the publicly available K53 manuals (Rules of the Road and Manual on Road Traffic Signs).

Always study the official manuals alongside this app.

The ${DAILY_LIMIT}-question free daily limit exists to keep the service sustainable. Upgrade for unlimited access.`,
  },
};

function LegalModal({ doc, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'flex-end' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: T.surface, borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '82vh', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 14px', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: T.text, fontFamily: T.font }}>{doc.title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.dim, fontSize: 26, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>
        <div style={{ overflowY: 'auto', padding: '16px 20px 48px', flex: 1 }}>
          <pre style={{ fontFamily: T.font, fontSize: 13, color: T.dim, whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>{doc.content}</pre>
        </div>
      </div>
    </div>
  );
}

const FONT_KEYS = [
  { value: 'small',  key: 'font_small',  preview: 13 },
  { value: 'medium', key: 'font_medium', preview: 15 },
  { value: 'large',  key: 'font_large',  preview: 18 },
  { value: 'xlarge', key: 'font_xlarge', preview: 21 },
];

export default function Settings({ onBack, onFontSizeChange }) {
  const { t, lang, setLang, LANGUAGES } = useLang();
  const [fontSize, setFontSizeState] = useState(getFontSize());
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled);
  const [openLegal, setOpenLegal] = useState(null); // 'privacy' | 'terms' | 'disclaimer'

  const premium = isPremium();
  const inTrial = isInFreeTrial();
  const daysLeft = daysLeftInTrial();
  const remaining = getRemainingToday();

  const handleSoundToggle = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) sfx('correct'); // preview the sound when turning on
  };

  const handleFontChange = (size) => {
    setFontSizeState(size);
    setFontSize(size);
    onFontSizeChange?.(size);
  };

  const handleReset = () => {
    resetHistory();
    resetStreak();
    resetSR();
    try {
      localStorage.removeItem('k53_badges');
      localStorage.removeItem('k53_rrg_progress');
      localStorage.removeItem('k53_pdp_progress');
      localStorage.removeItem('k53_pdp_hours');
      localStorage.removeItem('k53_pdp_cert');
      localStorage.removeItem('k53_checklist_v1');
    } catch {}
    setShowResetConfirm(false);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  };

  const SECTION = (title) => (
    <div style={{ fontWeight: 600, fontSize: T.fontSize, color: T.dim, marginBottom: 10, marginTop: 24, textTransform: 'uppercase', letterSpacing: 1 }}>
      {title}
    </div>
  );

  const ROW = ({ icon, label, sub, right, onClick, danger }) => (
    <div onClick={onClick}
      style={{
        background: T.surfaceAlt, border: `1px solid ${danger ? '#DE383133' : T.border}`,
        borderRadius: 12, padding: '14px 16px', marginBottom: 10,
        display: 'flex', alignItems: 'center', gap: 14,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.opacity = 0.85; }}
      onMouseLeave={e => e.currentTarget.style.opacity = 1}
    >
      <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: T.fontSizeLg, color: danger ? '#f87171' : T.text }}>{label}</div>
        {sub && <div style={{ fontSize: T.fontSize - 2, color: T.dim, marginTop: 2 }}>{sub}</div>}
      </div>
      {right && <div style={{ color: T.dim, fontSize: T.fontSize }}>{right}</div>}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: T.surface, color: T.text, fontFamily: T.font, fontSize: T.fontSize, paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ background: '#1a1a2e', padding: '20px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: T.text, fontSize: 22, cursor: 'pointer' }}>←</button>
          <div style={{ fontWeight: 700, fontSize: T.fontSizeXl }}>{t('settings_title')}</div>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>

        {/* ── Language ── */}
        {SECTION(t('settings_language'))}
        <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginBottom: 10 }}>
          <div style={{ color: T.dim, fontSize: T.fontSize - 1, marginBottom: 14 }}>
            {t('settings_language_sub')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {LANGUAGES.map(l => {
              const isActive = lang === l.code;
              return (
                <button key={l.code} onClick={() => setLang(l.code)}
                  style={{
                    background: isActive ? '#007A4D' : T.surface,
                    border: `2px solid ${isActive ? '#007A4D' : T.border}`,
                    borderRadius: 10, padding: '10px 8px', cursor: 'pointer',
                    color: isActive ? '#fff' : T.text, fontFamily: T.font,
                    display: 'flex', alignItems: 'center', gap: 8,
                    textAlign: 'left',
                  }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{l.flag}</span>
                  <span style={{ fontSize: T.fontSize - 1, fontWeight: isActive ? 700 : 400, lineHeight: 1.2 }}>{l.nativeName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Sound ── */}
        {SECTION('Sound & Haptics')}
        <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: T.fontSize }}>Answer sounds</div>
            <div style={{ color: T.dim, fontSize: T.fontSize - 2, marginTop: 2 }}>Tick on correct, buzz on wrong</div>
          </div>
          <button onClick={handleSoundToggle} style={{
            width: 48, height: 28, borderRadius: 99, border: 'none', cursor: 'pointer',
            background: soundOn ? '#007A4D' : T.border,
            position: 'relative', transition: 'background 0.2s',
          }}>
            <div style={{
              position: 'absolute', top: 3, left: soundOn ? 23 : 3,
              width: 22, height: 22, borderRadius: '50%', background: '#fff',
              transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }} />
          </button>
        </div>

        {/* ── Font Size ── */}
        {SECTION(t('settings_textSize'))}
        <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginBottom: 10 }}>
          <div style={{ color: T.dim, fontSize: T.fontSize - 1, marginBottom: 14 }}>
            {t('settings_textSize_sub')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {FONT_KEYS.map(opt => {
              const isActive = fontSize === opt.value;
              return (
                <button key={opt.value} onClick={() => handleFontChange(opt.value)}
                  style={{
                    background: isActive ? '#007A4D' : T.surface,
                    border: `2px solid ${isActive ? '#007A4D' : T.border}`,
                    borderRadius: 10, padding: '12px 10px', cursor: 'pointer',
                    color: isActive ? '#fff' : T.text, fontFamily: T.font,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  }}>
                  <span style={{ fontSize: opt.preview, fontWeight: 600, lineHeight: 1 }}>Aa</span>
                  <span style={{ fontSize: 12, color: isActive ? 'rgba(255,255,255,0.8)' : T.dim }}>{t(opt.key)}</span>
                </button>
              );
            })}
          </div>
          {/* Preview */}
          <div style={{ marginTop: 14, background: T.surface, borderRadius: 10, padding: '12px 14px', border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: T.fontSizeLg, fontWeight: 500, lineHeight: 1.5, color: T.text }}>
              {t('font_preview')}
            </div>
            <div style={{ fontSize: T.fontSize - 1, color: T.dim, marginTop: 4 }}>
              {t('font_preview_sub')} <strong>{fontSize}</strong> {t('font_preview_size')}
            </div>
          </div>
        </div>

        {/* ── Your Plan ── */}
        {SECTION('Your Plan')}
        <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 16px', marginBottom: 10 }}>
          {premium && !inTrial ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>⭐</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: T.fontSizeLg, color: T.gold }}>Premium — Unlimited</div>
                <div style={{ fontSize: T.fontSize - 2, color: T.dim, marginTop: 2 }}>All questions, all modes, AI Tutor</div>
              </div>
            </div>
          ) : inTrial ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>🎁</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: T.fontSizeLg, color: '#4ade80' }}>Free Trial — Unlimited</div>
                <div style={{ fontSize: T.fontSize - 2, color: T.dim, marginTop: 2 }}>
                  {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining · All features unlocked
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>🆓</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: T.fontSizeLg, color: T.text }}>Free Tier</div>
                  <div style={{ fontSize: T.fontSize - 2, color: T.dim, marginTop: 2 }}>
                    <span style={{ color: remaining === 0 ? T.red : T.text, fontWeight: 600 }}>{remaining}</span>
                    {' '}of {DAILY_LIMIT} questions left today
                  </div>
                </div>
              </div>
              {/* What counts */}
              <div style={{ background: T.surface, borderRadius: 10, padding: '10px 14px', fontSize: T.fontSize - 2, color: T.dim, lineHeight: 1.7 }}>
                <div style={{ fontWeight: 600, color: T.text, marginBottom: 4 }}>How daily questions work</div>
                <div>• Each question you answer (correct or wrong) counts as 1.</div>
                <div>• Counter resets at midnight every day.</div>
                <div>• All 11 game modes share the same daily pool.</div>
                <div style={{ marginTop: 6, color: T.gold }}>Upgrade for unlimited — from R29/month.</div>
              </div>
            </div>
          )}
        </div>

        {/* ── App Info ── */}
        {SECTION(t('settings_about'))}
        <ROW icon="🇿🇦" label="K53 Drill Master" sub={t('about_app')} right="v2.0" />
        <ROW icon="📋" label={t('about_manual')} sub="National Road Traffic Act 93 of 1996" />

        {/* ── Legal ── */}
        {SECTION('Legal')}
        <ROW
          icon="🔒"
          label="Privacy Policy"
          sub="How we handle your data"
          right="›"
          onClick={() => setOpenLegal('privacy')}
        />
        <ROW
          icon="📜"
          label="Terms of Service"
          sub="Usage rules, free tier, refund policy"
          right="›"
          onClick={() => setOpenLegal('terms')}
        />
        <ROW
          icon="⚠️"
          label="Disclaimer"
          sub="Not affiliated with DLTC or RTMC"
          right="›"
          onClick={() => setOpenLegal('disclaimer')}
        />

        {/* ── Data management ── */}
        {SECTION(t('settings_data'))}
        <ROW icon="📊" label="Study data" sub={t('data_study')} />
        <ROW
          icon="🗑️"
          label={t('reset_label')}
          sub={t('reset_sub')}
          danger
          onClick={() => setShowResetConfirm(true)}
        />

        {resetDone && (
          <div style={{ background: '#003d22', border: '1px solid #007A4D', borderRadius: 10, padding: '12px 16px', marginTop: 4, color: '#4ade80', fontWeight: 600 }}>
            {t('reset_done')}
          </div>
        )}

        {/* ── Tips ── */}
        {SECTION(t('settings_tips'))}
        <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 16px', lineHeight: 1.65, fontSize: T.fontSize, color: T.dim }}>
          <div style={{ marginBottom: 8 }}>🎯 <strong style={{ color: T.text }}>{t('tip_weak_label')}</strong> {t('tip_weak')}</div>
          <div style={{ marginBottom: 8 }}>🔁 <strong style={{ color: T.text }}>{t('tip_sr_label')}</strong> {t('tip_sr')}</div>
          <div style={{ marginBottom: 8 }}>✅ <strong style={{ color: T.text }}>{t('tip_checklist_label')}</strong> {t('tip_checklist')}</div>
          <div>📈 <strong style={{ color: T.text }}>{t('tip_progress_label')}</strong> {t('tip_progress')}</div>
        </div>
      </div>

      {/* Reset confirmation modal */}
      {/* Legal doc modal */}
      {openLegal && (
        <LegalModal doc={LEGAL_DOCS[openLegal]} onClose={() => setOpenLegal(null)} />
      )}

      {showResetConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9990, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: T.surface, borderRadius: 16, padding: 24, maxWidth: 340, width: '100%', border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 12 }}>⚠️</div>
            <div style={{ fontWeight: 700, fontSize: T.fontSizeXl, textAlign: 'center', marginBottom: 8 }}>{t('reset_confirm_title')}</div>
            <div style={{ color: T.dim, textAlign: 'center', fontSize: T.fontSize, lineHeight: 1.55, marginBottom: 24 }}>
              {t('reset_confirm_body')}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowResetConfirm(false)}
                style={{ flex: 1, background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14, fontWeight: 600, cursor: 'pointer', fontSize: T.fontSizeLg, fontFamily: T.font }}>
                {t('btn_cancel')}
              </button>
              <button onClick={handleReset}
                style={{ flex: 1, background: '#DE3831', color: '#fff', border: 'none', borderRadius: 10, padding: 14, fontWeight: 700, cursor: 'pointer', fontSize: T.fontSizeLg, fontFamily: T.font }}>
                {t('btn_reset')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
