import { T } from "../theme.js";

// ── FreemiumGate modal ────────────────────────────────────────────────────────
// Props:
//   onClose  – called when user clicks "Maybe Tomorrow"
//   onUpgrade – called when user clicks "Unlock Unlimited" (optional, defaults to pricing page)

export default function FreemiumGate({ onClose, onUpgrade }) {
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      window.open("/pricing.html", "_blank");
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.82)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999,
      padding: "20px",
    }}>
      <div style={{
        background: T.surface,
        border: `2px solid ${T.gold}`,
        borderRadius: 8,
        padding: "36px 28px",
        maxWidth: 420,
        width: "100%",
        textAlign: "center",
        fontFamily: T.font,
        boxShadow: `0 0 60px rgba(255,182,18,0.15)`,
      }}>
        {/* Icon */}
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>

        {/* Heading */}
        <div style={{
          color: T.gold,
          fontSize: 11,
          letterSpacing: 4,
          fontFamily: T.mono,
          textTransform: "uppercase",
          marginBottom: 12,
        }}>
          Daily Limit Reached
        </div>
        <h2 style={{
          color: T.white,
          fontSize: 22,
          fontWeight: 700,
          marginBottom: 14,
          lineHeight: 1.3,
          letterSpacing: -0.3,
        }}>
          You've used your 10 free questions today!
        </h2>
        <p style={{
          color: T.dim,
          fontSize: 14,
          lineHeight: 1.7,
          marginBottom: 28,
        }}>
          Unlock unlimited practice, mock exams, AI tutor explanations, and progress tracking.
          Less than the cost of one driving lesson.
        </p>

        {/* Pricing highlight */}
        <div style={{
          background: T.surfaceAlt,
          border: `1px solid ${T.borderBright}`,
          borderRadius: 6,
          padding: "16px 20px",
          marginBottom: 24,
          display: "flex",
          justifyContent: "center",
          gap: 32,
        }}>
          <div>
            <div style={{ color: T.gold, fontSize: 24, fontWeight: 700 }}>R49</div>
            <div style={{ color: T.dim, fontSize: 11, fontFamily: T.mono, letterSpacing: 2 }}>PER MONTH</div>
          </div>
          <div style={{ width: 1, background: T.border }} />
          <div>
            <div style={{ color: T.green, fontSize: 24, fontWeight: 700 }}>R149</div>
            <div style={{ color: T.dim, fontSize: 11, fontFamily: T.mono, letterSpacing: 2 }}>3 MONTHS</div>
          </div>
        </div>

        {/* CTA buttons */}
        <button
          onClick={handleUpgrade}
          style={{
            width: "100%",
            padding: "15px 20px",
            background: T.gold,
            color: "#060D07",
            border: "none",
            borderRadius: 4,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: T.font,
            letterSpacing: 0.3,
            marginBottom: 10,
            transition: "opacity 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          Unlock Unlimited →
        </button>
        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "13px 20px",
            background: "transparent",
            color: T.dim,
            border: `1px solid ${T.border}`,
            borderRadius: 4,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: T.font,
            transition: "color 0.15s, border-color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.borderColor = T.borderBright; }}
          onMouseLeave={e => { e.currentTarget.style.color = T.dim; e.currentTarget.style.borderColor = T.border; }}
        >
          Maybe Tomorrow
        </button>

        <p style={{ color: T.dim, fontSize: 11, marginTop: 16, fontFamily: T.mono }}>
          Your limit resets at midnight · Free questions restore every day
        </p>
      </div>
    </div>
  );
}
