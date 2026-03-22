import { useState } from 'react';
import { T, getFontSize, setFontSize } from '../theme.js';
import { resetHistory } from '../utils/progressHistory.js';
import { resetStreak } from '../utils/streakTracker.js';
import { resetSR } from '../utils/spacedRepetition.js';
import { useLang } from '../LangContext.jsx';
import { isSoundEnabled, setSoundEnabled, sfx } from '../utils/sounds.js';

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

        {/* ── App Info ── */}
        {SECTION(t('settings_about'))}
        <ROW icon="🇿🇦" label="K53 Drill Master" sub={t('about_app')} right="v2.0" />
        <ROW icon="📋" label={t('about_manual')} sub="National Road Traffic Act 93 of 1996" />
        <ROW icon="🔒" label="Privacy" sub={t('about_privacy')} />

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
