import { useState } from "react";
import { T } from "./theme.js";
import Gauntlet from "./games/Gauntlet.jsx";
import HybridGauntlet from "./games/HybridGauntlet.jsx";
import PatternTrainer from "./games/PatternTrainer.jsx";

// ── SA flag colour stripe ──────────────────────────────────────────────────────
function FlagStripe() {
  return (
    <div style={{ display: "flex", height: 6, width: "100%" }}>
      <div style={{ flex: 1, background: T.black }} />
      <div style={{ flex: 1, background: T.gold }} />
      <div style={{ flex: 1, background: T.green }} />
      <div style={{ flex: 1, background: T.white }} />
      <div style={{ flex: 1, background: T.red }} />
      <div style={{ flex: 1, background: T.blue }} />
    </div>
  );
}

// ── game selection card ────────────────────────────────────────────────────────
function GameCard({ accentColor, tag, title, description, stats, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "block",
        width: "100%",
        background: hover ? T.surfaceAlt : T.surface,
        border: `2px solid ${hover ? accentColor : T.border}`,
        borderRadius: 6,
        padding: "22px 20px",
        textAlign: "left",
        cursor: "pointer",
        fontFamily: T.font,
        transition: "border-color 0.15s, background 0.15s",
      }}
    >
      <div style={{ color: accentColor, fontSize: 11, letterSpacing: 3, marginBottom: 6, fontFamily: T.mono, textTransform: "uppercase" }}>
        {tag}
      </div>
      <div style={{ color: T.white, fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ color: T.dim, fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
        {description}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {stats.map((s, i) => (
          <span key={i} style={{
            background: T.surfaceAlt,
            border: `1px solid ${T.border}`,
            color: accentColor,
            fontSize: 12,
            padding: "3px 10px",
            borderRadius: 3,
            fontFamily: T.mono,
            fontWeight: 700,
          }}>{s}</span>
        ))}
      </div>
    </button>
  );
}

// ── home page ─────────────────────────────────────────────────────────────────
function HomePage({ onSelect }) {
  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.text }}>
      <FlagStripe />

      {/* header */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "28px 20px 24px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: 5, color: T.dim, marginBottom: 10, fontFamily: T.mono, textTransform: "uppercase" }}>
            South Africa · Code 8 · Learner's Licence
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 5, height: 44, background: T.green, borderRadius: 2 }} />
            <h1 style={{ fontSize: 36, fontWeight: 700, color: T.gold, letterSpacing: -0.5, lineHeight: 1 }}>
              K53 Learner's Prep
            </h1>
            <div style={{ width: 5, height: 44, background: T.red, borderRadius: 2 }} />
          </div>
          <p style={{ color: T.dim, fontSize: 15, lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
            Three free drill tools to get you through your learner's licence test. No sign-up. No cost. Just practice.
          </p>
        </div>
      </div>

      {/* game cards */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ color: T.dim, fontSize: 11, letterSpacing: 3, marginBottom: 16, fontFamily: T.mono, textTransform: "uppercase" }}>
          Choose a drill
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <GameCard
            accentColor={T.gold}
            tag="Drill 1 · Standard"
            title="Code 8 Gauntlet"
            description="Nine rounds covering lights, licences, speed limits, road behaviour, safety gear, motorcycles, accidents and more. Plus a 60-question exam simulator."
            stats={["9 rounds", "90 questions", "Exam mode", "Timed mode"]}
            onClick={() => onSelect("gauntlet")}
          />
          <GameCard
            accentColor={T.red}
            tag="Drill 2 · Advanced"
            title="Hybrid Gauntlet"
            description="Ten rounds built around the tricks that fail people — EXCEPT questions, exact numbers, sign codes, hybrid traffic scenarios. The hardest K53 questions curated."
            stats={["10 rounds", "100 questions", "Exam mode", "Timed mode"]}
            onClick={() => onSelect("hybrid")}
          />
          <GameCard
            accentColor={T.green}
            tag="Drill 3 · Pattern Trainer"
            title="Know Your Numbers"
            description="The K53 test is 60% about specific values — distances, speeds, ages, masses. Study all patterns grouped by family, drill them as questions, or race the clock in speed mode."
            stats={["Pattern map", "41 quiz questions", "Speed match (15s)"]}
            onClick={() => onSelect("patterns")}
          />
        </div>

        {/* tip box */}
        <div style={{
          marginTop: 32,
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderLeft: `4px solid ${T.gold}`,
          borderRadius: 4,
          padding: "16px 18px",
        }}>
          <div style={{ color: T.gold, fontSize: 12, letterSpacing: 2, marginBottom: 8, fontFamily: T.mono }}>
            RECOMMENDED APPROACH
          </div>
          <ol style={{ color: T.dim, fontSize: 14, lineHeight: 1.9, paddingLeft: 18 }}>
            <li>Start with <strong style={{ color: T.text }}>Know Your Numbers</strong> — memorise the pattern map first.</li>
            <li>Run through all 9 rounds of the <strong style={{ color: T.text }}>Standard Gauntlet</strong> until you pass each.</li>
            <li>Tackle the <strong style={{ color: T.text }}>Hybrid Gauntlet</strong> to master the tricky wording traps.</li>
            <li>Finish with the <strong style={{ color: T.gold }}>Timed Exam Mode</strong> — 60 random questions, 30 seconds each.</li>
          </ol>
        </div>
      </div>

      {/* footer */}
      <div style={{ borderTop: `1px solid ${T.border}`, padding: "20px", textAlign: "center" }}>
        <p style={{ color: T.dim, fontSize: 13 }}>
          Free for all South African learners · K53 questions based on the NRTA Road Traffic Act
        </p>
      </div>
      <FlagStripe />
    </div>
  );
}

// ── root app ──────────────────────────────────────────────────────────────────
export default function App() {
  const [activeGame, setActiveGame] = useState(null);

  if (activeGame === "gauntlet")  return <Gauntlet      onBack={() => setActiveGame(null)} />;
  if (activeGame === "hybrid")    return <HybridGauntlet onBack={() => setActiveGame(null)} />;
  if (activeGame === "patterns")  return <PatternTrainer  onBack={() => setActiveGame(null)} />;

  return <HomePage onSelect={setActiveGame} />;
}
