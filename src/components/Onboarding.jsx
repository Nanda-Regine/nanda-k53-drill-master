import { useState } from "react";
import { T } from "../theme.js";

const SLIDES = [
  {
    emoji: "🇿🇦",
    title: "Welcome to K53 Drill Master",
    body: "South Africa's most comprehensive learner's licence prep platform. All questions sourced directly from the official DLTC manuals.",
    cta: "Next →",
  },
  {
    emoji: "🎯",
    title: "How to use this app",
    body: (
      <ol style={{ textAlign: "left", paddingLeft: 20, color: "#6B7A62", fontSize: 14, lineHeight: 2 }}>
        <li><strong style={{ color: "#E8EDE0" }}>Know Your Numbers</strong> — memorise the critical K53 values first</li>
        <li><strong style={{ color: "#E8EDE0" }}>Standard Gauntlet</strong> — drill all 9 rounds until you pass each</li>
        <li><strong style={{ color: "#E8EDE0" }}>Hybrid Gauntlet</strong> — master the tricky "EXCEPT" traps</li>
        <li><strong style={{ color: "#FFB612" }}>Mock Exam</strong> — 68 questions, real test format, 45 minutes</li>
      </ol>
    ),
    cta: "Got it →",
  },
  {
    emoji: "🏆",
    title: "You're ready to start",
    body: "Answer questions daily to build your streak 🔥, earn badges, and track your progress by category. The more you drill, the more confident you'll be on test day.",
    cta: "Start Drilling →",
  },
];

export default function Onboarding({ onComplete }) {
  const [slide, setSlide] = useState(0);
  const current = SLIDES[slide];
  const isLast = slide === SLIDES.length - 1;

  const advance = () => {
    if (isLast) {
      localStorage.setItem("k53_onboarding_complete", "true");
      onComplete();
    } else {
      setSlide(s => s + 1);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.88)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: 20,
    }}>
      <div style={{
        background: T.surface,
        border: `2px solid ${T.gold}`,
        borderRadius: 10,
        padding: "40px 32px",
        maxWidth: 460, width: "100%",
        textAlign: "center",
        fontFamily: T.font,
        boxShadow: `0 0 80px rgba(255,182,18,0.18)`,
        position: "relative",
      }}>
        {/* Slide dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 28 }}>
          {SLIDES.map((_, i) => (
            <div key={i} style={{
              width: i === slide ? 24 : 8, height: 8,
              borderRadius: 4,
              background: i === slide ? T.gold : T.border,
              transition: "all 0.3s",
            }} />
          ))}
        </div>

        <div style={{ fontSize: 52, marginBottom: 16 }}>{current.emoji}</div>

        <h2 style={{
          color: T.white, fontSize: 22, fontWeight: 700,
          marginBottom: 16, lineHeight: 1.3,
        }}>
          {current.title}
        </h2>

        <div style={{
          color: T.dim, fontSize: 14, lineHeight: 1.8,
          marginBottom: 32, minHeight: 100,
        }}>
          {current.body}
        </div>

        <button
          onClick={advance}
          style={{
            width: "100%", padding: "15px 20px",
            background: T.gold, color: "#060D07",
            border: "none", borderRadius: 5,
            fontSize: 15, fontWeight: 700,
            cursor: "pointer", fontFamily: T.font,
          }}
        >
          {current.cta}
        </button>

        {!isLast && (
          <button
            onClick={() => {
              localStorage.setItem("k53_onboarding_complete", "true");
              onComplete();
            }}
            style={{
              marginTop: 12, background: "transparent",
              border: "none", color: T.dim, fontSize: 12,
              cursor: "pointer", fontFamily: T.font,
            }}
          >
            Skip intro
          </button>
        )}
      </div>
    </div>
  );
}
