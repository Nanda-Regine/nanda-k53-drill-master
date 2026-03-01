import { useState, useEffect } from "react";
import { T } from "./theme.js";
import Gauntlet from "./games/Gauntlet.jsx";
import HybridGauntlet from "./games/HybridGauntlet.jsx";
import PatternTrainer from "./games/PatternTrainer.jsx";
import RoadRulesGauntlet from "./games/RoadRulesGauntlet.jsx";
import MockExam from "./games/MockExam.jsx";
import Progress from "./games/Progress.jsx";
import { getRemainingQuestions, isPremium, isInFreeTrial, daysLeftInTrial, storePremiumToken, DAILY_LIMIT } from "./freemium.js";

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

// ── Daily usage indicator ──────────────────────────────────────────────────────
function UsageBadge() {
  const trial = isInFreeTrial();
  const trialDaysLeft = daysLeftInTrial();
  const explicitPremium = !trial && isPremium();

  if (explicitPremium) {
    return (
      <div style={{
        background: T.surfaceAlt, border: `1px solid ${T.green}`,
        borderRadius: 3, padding: "4px 12px", fontSize: 11, fontFamily: T.mono,
        color: T.green, display: "inline-flex", alignItems: "center", gap: 6,
      }}>
        ✓ UNLIMITED
      </div>
    );
  }
  if (trial) {
    return (
      <div style={{
        background: T.surfaceAlt, border: `1px solid ${T.green}`,
        borderRadius: 3, padding: "4px 12px", fontSize: 11, fontFamily: T.mono,
        color: T.green, display: "inline-flex", alignItems: "center", gap: 6,
      }}>
        🎁 Free trial — {trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} left
      </div>
    );
  }
  const remaining = getRemainingQuestions();
  const color = remaining > 5 ? T.dim : remaining > 2 ? T.gold : T.red;
  return (
    <div style={{
      background: T.surfaceAlt, border: `1px solid ${T.border}`,
      borderRadius: 3, padding: "4px 12px", fontSize: 11, fontFamily: T.mono,
      color, display: "inline-flex", alignItems: "center", gap: 6,
    }}>
      {remaining === 0 ? "⚠ 0 questions left today" : `${remaining}/${DAILY_LIMIT} questions left today`}
    </div>
  );
}

// ── game selection card ────────────────────────────────────────────────────────
function GameCard({ accentColor, tag, title, description, stats, onClick, badge }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "block", width: "100%",
        background: hover ? T.surfaceAlt : T.surface,
        border: `2px solid ${hover ? accentColor : T.border}`,
        borderRadius: 6, padding: "22px 20px", textAlign: "left",
        cursor: "pointer", fontFamily: T.font,
        transition: "border-color 0.15s, background 0.15s",
        position: "relative",
      }}
    >
      {badge && (
        <div style={{
          position: "absolute", top: 12, right: 12,
          background: accentColor, color: "#060D07",
          fontSize: 9, fontFamily: T.mono, fontWeight: 700,
          letterSpacing: 2, padding: "3px 8px", borderRadius: 2,
        }}>
          {badge}
        </div>
      )}
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
            background: T.surfaceAlt, border: `1px solid ${T.border}`,
            color: accentColor, fontSize: 12, padding: "3px 10px",
            borderRadius: 3, fontFamily: T.mono, fontWeight: 700,
          }}>{s}</span>
        ))}
      </div>
    </button>
  );
}

// ── home page ─────────────────────────────────────────────────────────────────
function HomePage({ onSelect }) {
  const remaining = getRemainingQuestions();
  const trial = isInFreeTrial();
  const premium = isPremium(); // true during trial OR with paid key

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.text }}>
      <FlagStripe />

      {/* header */}
      <div style={{ background: T.surface, borderBottom: `1px solid ${T.border}`, padding: "28px 20px 24px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: 5, color: T.dim, marginBottom: 10, fontFamily: T.mono, textTransform: "uppercase" }}>
            South Africa · Codes 1, 2, 3, 8, 10 &amp; 14 · Learner's Licence
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ width: 5, height: 44, background: T.green, borderRadius: 2 }} />
            <h1 style={{ fontSize: 34, fontWeight: 700, color: T.gold, letterSpacing: -0.5, lineHeight: 1.1 }}>
              K53 Drill Master
            </h1>
            <div style={{ width: 5, height: 44, background: T.red, borderRadius: 2 }} />
          </div>
          <div style={{ color: T.dim, fontSize: 12, letterSpacing: 2, fontFamily: T.mono, marginBottom: 14 }}>
            SOUTH AFRICA'S #1 LICENCE PREP PLATFORM
          </div>
          <div style={{ marginBottom: 14 }}>
            <UsageBadge />
          </div>
          <p style={{ color: T.dim, fontSize: 13, lineHeight: 1.6, maxWidth: 480, margin: "0 auto" }}>
            All questions from the official{" "}
            <span style={{ color: T.text }}>South African Traffic Department manuals</span>
            {" "}— the <em>Rules of the Road</em> and the <em>Manual on Road Traffic Signs</em>.
          </p>
        </div>
      </div>

      {/* game cards */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px" }}>

        {/* Freemium notice */}
        {!premium && remaining === 0 && (
          <div style={{
            background: "#1a0c00", border: `1px solid ${T.gold}`,
            borderRadius: 6, padding: "16px 18px", marginBottom: 20,
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
          }}>
            <div>
              <div style={{ color: T.gold, fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                ⚠ You've used your 10 free questions today
              </div>
              <div style={{ color: T.dim, fontSize: 12 }}>
                Unlock unlimited practice for R49/month
              </div>
            </div>
            <a href="/pricing.html" style={{
              background: T.gold, color: "#060D07", borderRadius: 4,
              padding: "9px 18px", fontSize: 13, fontWeight: 700, textDecoration: "none",
              whiteSpace: "nowrap",
            }}>
              Unlock Unlimited →
            </a>
          </div>
        )}

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
          <GameCard
            accentColor={T.blue}
            tag="Drill 4 · Road Rules · By Vehicle Code"
            title="Road Rules Gauntlet"
            description="120 road rules questions organised by vehicle type — general rules for all drivers, then Code 3 LMV, Code 1/2 Motorcycle, and Code 10/14 Heavy Vehicle."
            stats={["12 rounds", "120 questions", "4 vehicle categories", "Exam mode"]}
            onClick={() => onSelect("roadrules")}
          />
          <GameCard
            accentColor={T.gold}
            tag="Mock Exam · DLTC Format"
            title="📝 Mock Exam"
            badge="PREMIUM"
            description="68 questions, 45-minute countdown, no hints. Same format as the real DLTC learner's test. Pass at 75% (51/68). Share your result on WhatsApp."
            stats={["68 questions", "45 min timer", "75% pass mark", "WhatsApp share"]}
            onClick={() => onSelect("mockexam")}
          />
        </div>

        {/* Secondary actions */}
        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <button
            onClick={() => onSelect("progress")}
            style={{
              background: T.surface, border: `1px solid ${T.borderBright}`,
              color: T.text, borderRadius: 4, padding: "11px 18px",
              fontSize: 13, cursor: "pointer", fontFamily: T.font,
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            📊 My Progress
          </button>
          <a
            href="/pricing.html"
            style={{
              background: "transparent", border: `1px solid ${T.gold}`,
              color: T.gold, borderRadius: 4, padding: "11px 18px",
              fontSize: 13, cursor: "pointer", fontFamily: T.font,
              textDecoration: "none", display: "flex", alignItems: "center", gap: 8,
            }}
          >
            ⚡ Start Free — Upgrade Anytime
          </a>
        </div>

        {/* tip box */}
        <div style={{
          marginTop: 28, background: T.surface, border: `1px solid ${T.border}`,
          borderLeft: `4px solid ${T.gold}`, borderRadius: 4, padding: "16px 18px",
        }}>
          <div style={{ color: T.gold, fontSize: 12, letterSpacing: 2, marginBottom: 8, fontFamily: T.mono }}>
            RECOMMENDED APPROACH
          </div>
          <ol style={{ color: T.dim, fontSize: 14, lineHeight: 1.9, paddingLeft: 18 }}>
            <li>Start with <strong style={{ color: T.text }}>Know Your Numbers</strong> — memorise the pattern map first.</li>
            <li>Run through all 9 rounds of the <strong style={{ color: T.text }}>Standard Gauntlet</strong> until you pass each.</li>
            <li>Tackle the <strong style={{ color: T.text }}>Hybrid Gauntlet</strong> to master the tricky wording traps.</li>
            <li>Finish with the <strong style={{ color: T.gold }}>Mock Exam</strong> — 68 questions, real test format.</li>
          </ol>
        </div>
      </div>

      {/* footer */}
      <div style={{ borderTop: `1px solid ${T.border}`, padding: "28px 20px", textAlign: "center" }}>
        <p style={{ color: T.dim, fontSize: 13, marginBottom: 6 }}>
          Questions sourced from the DLTC / Traffic Department official manuals
        </p>
        <p style={{ color: T.dim, fontSize: 13, marginBottom: 10 }}>
          <a href="/pricing.html" style={{ color: T.gold, textDecoration: "none" }}>Pricing</a>
          {" · "}
          <a href="https://wa.me/27842916742" target="_blank" rel="noreferrer" style={{ color: T.text, textDecoration: "none" }}>WhatsApp Support</a>
          {" · "}
          <a href="https://creativelynanda.co.za" target="_blank" rel="noreferrer" style={{ color: T.text, textDecoration: "none" }}>creativelynanda.co.za</a>
        </p>
        <p style={{ color: T.dim, fontSize: 12 }}>
          Built by{" "}
          <a href="https://creativelynanda.co.za" target="_blank" rel="noreferrer" style={{ color: T.text, textDecoration: "none" }}>
            Nanda Regine
          </a>
          {" · "}Creative Technologist · AI Engineer
        </p>
      </div>
      <FlagStripe />
    </div>
  );
}

// ── Unlock banner (shown briefly after PayFast return) ────────────────────────
function UnlockBanner({ status }) {
  if (!status) return null;
  if (status === "checking") return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, background: T.surface, borderBottom: `2px solid ${T.gold}`, padding: "12px 20px", textAlign: "center", fontFamily: T.mono, fontSize: 13, color: T.gold }}>
      ⟳ Verifying your payment...
    </div>
  );
  if (status === "success") return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, background: "#001a12", borderBottom: `2px solid ${T.green}`, padding: "12px 20px", textAlign: "center", fontFamily: T.mono, fontSize: 13, color: T.green }}>
      🎉 Payment confirmed — you're now UNLIMITED! Enjoy.
    </div>
  );
  if (status === "failed") return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, background: "#1a0000", borderBottom: `2px solid ${T.red}`, padding: "12px 20px", textAlign: "center", fontFamily: T.mono, fontSize: 13, color: T.red }}>
      ⚠ Could not verify payment. Please contact Nanda on WhatsApp.
    </div>
  );
  return null;
}

// ── root app ──────────────────────────────────────────────────────────────────
export default function App() {
  const [activeGame, setActiveGame] = useState(null);
  const [unlockStatus, setUnlockStatus] = useState(null); // null | "checking" | "success" | "failed"

  // Handle PayFast return URL: /?unlock=TOKEN or /?cancelled=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("unlock");
    const cancelled = params.get("cancelled");

    // Clean the URL regardless
    if (token || cancelled) {
      window.history.replaceState({}, "", window.location.pathname);
    }

    if (token) {
      setUnlockStatus("checking");
      fetch(`/api/verify?token=${encodeURIComponent(token)}`)
        .then(r => r.json())
        .then(data => {
          if (data.valid) {
            storePremiumToken(data.plan, data.expiry);
            setUnlockStatus("success");
          } else {
            setUnlockStatus("failed");
          }
        })
        .catch(() => setUnlockStatus("failed"));
    }

    // Auto-hide banner after 6 seconds
    if (token || cancelled) {
      setTimeout(() => setUnlockStatus(null), 6000);
    }
  }, []);

  if (activeGame === "gauntlet")   return <Gauntlet          onBack={() => setActiveGame(null)} />;
  if (activeGame === "hybrid")     return <HybridGauntlet    onBack={() => setActiveGame(null)} />;
  if (activeGame === "patterns")   return <PatternTrainer     onBack={() => setActiveGame(null)} />;
  if (activeGame === "roadrules")  return <RoadRulesGauntlet  onBack={() => setActiveGame(null)} />;
  if (activeGame === "mockexam")   return <MockExam           onBack={() => setActiveGame(null)} />;
  if (activeGame === "progress")   return <Progress           onBack={() => setActiveGame(null)} />;

  return (
    <>
      <UnlockBanner status={unlockStatus} />
      <HomePage onSelect={setActiveGame} />
    </>
  );
}
