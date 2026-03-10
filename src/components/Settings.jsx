import { useState } from 'react';
import { T, getFontSize, setFontSize } from '../theme.js';
import { resetHistory } from '../utils/progressHistory.js';
import { resetStreak } from '../utils/streakTracker.js';
import { resetSR } from '../utils/spacedRepetition.js';

const FONT_OPTIONS = [
  { value: 'small',  label: 'Small',   preview: 13 },
  { value: 'medium', label: 'Medium',  preview: 15 },
  { value: 'large',  label: 'Large',   preview: 18 },
  { value: 'xlarge', label: 'X-Large', preview: 21 },
];

export default function Settings({ onBack, onFontSizeChange }) {
  const [fontSize, setFontSizeState] = useState(getFontSize());
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleFontChange = (size) => {
    setFontSizeState(size);
    setFontSize(size);
    onFontSizeChange?.(size); // bubble up to App to re-render with new theme
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
          <div style={{ fontWeight: 700, fontSize: T.fontSizeXl }}>Settings</div>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>

        {/* ── Font Size ── */}
        {SECTION('Text Size')}
        <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginBottom: 10 }}>
          <div style={{ color: T.dim, fontSize: T.fontSize - 1, marginBottom: 14 }}>
            Adjust text size to suit your reading preference
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {FONT_OPTIONS.map(opt => {
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
                  <span style={{ fontSize: 12, color: isActive ? 'rgba(255,255,255,0.8)' : T.dim }}>{opt.label}</span>
                </button>
              );
            })}
          </div>
          {/* Preview */}
          <div style={{ marginTop: 14, background: T.surface, borderRadius: 10, padding: '12px 14px', border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: T.fontSizeLg, fontWeight: 500, lineHeight: 1.5, color: T.text }}>
              Preview: The vehicle must stop before crossing the line.
            </div>
            <div style={{ fontSize: T.fontSize - 1, color: T.dim, marginTop: 4 }}>
              This is how questions will appear at the <strong>{fontSize}</strong> size.
            </div>
          </div>
        </div>

        {/* ── App Info ── */}
        {SECTION('About')}
        <ROW icon="🇿🇦" label="K53 Drill Master" sub="South African learner's licence prep" right="v2.0" />
        <ROW icon="📋" label="Based on K53 Manual" sub="National Road Traffic Act 93 of 1996" />
        <ROW icon="🔒" label="Privacy" sub="All data stored locally on your device — never uploaded" />

        {/* ── Data management ── */}
        {SECTION('Data')}
        <ROW icon="📊" label="Study data" sub="Progress history, streaks and badges are saved on this device" />
        <ROW
          icon="🗑️"
          label="Reset all progress"
          sub="Clears history, streaks, badges, and quiz progress"
          danger
          onClick={() => setShowResetConfirm(true)}
        />

        {resetDone && (
          <div style={{ background: '#003d22', border: '1px solid #007A4D', borderRadius: 10, padding: '12px 16px', marginTop: 4, color: '#4ade80', fontWeight: 600 }}>
            ✅ All progress reset
          </div>
        )}

        {/* ── Tips ── */}
        {SECTION('Study Tips')}
        <div style={{ background: T.surfaceAlt, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 16px', lineHeight: 1.65, fontSize: T.fontSize, color: T.dim }}>
          <div style={{ marginBottom: 8 }}>🎯 <strong style={{ color: T.text }}>Weak Spots:</strong> Use the Weak Spots Review after 50+ questions for best results.</div>
          <div style={{ marginBottom: 8 }}>🔁 <strong style={{ color: T.text }}>Spaced Repetition:</strong> Questions you get wrong come back sooner — trust the system.</div>
          <div style={{ marginBottom: 8 }}>✅ <strong style={{ color: T.text }}>Checklist:</strong> Run the Vehicle Inspection Checklist the morning of your test.</div>
          <div>📈 <strong style={{ color: T.text }}>Progress:</strong> Aim for 80%+ in every category before booking your test date.</div>
        </div>
      </div>

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 9990, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: T.surface, borderRadius: 16, padding: 24, maxWidth: 340, width: '100%', border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 12 }}>⚠️</div>
            <div style={{ fontWeight: 700, fontSize: T.fontSizeXl, textAlign: 'center', marginBottom: 8 }}>Reset all progress?</div>
            <div style={{ color: T.dim, textAlign: 'center', fontSize: T.fontSize, lineHeight: 1.55, marginBottom: 24 }}>
              This will permanently delete your history, streaks, badges, and quiz progress. This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowResetConfirm(false)}
                style={{ flex: 1, background: T.surfaceAlt, color: T.text, border: `1px solid ${T.border}`, borderRadius: 10, padding: 14, fontWeight: 600, cursor: 'pointer', fontSize: T.fontSizeLg, fontFamily: T.font }}>
                Cancel
              </button>
              <button onClick={handleReset}
                style={{ flex: 1, background: '#DE3831', color: '#fff', border: 'none', borderRadius: 10, padding: 14, fontWeight: 700, cursor: 'pointer', fontSize: T.fontSizeLg, fontFamily: T.font }}>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
