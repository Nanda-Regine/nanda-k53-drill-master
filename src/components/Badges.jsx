import { T } from "../theme.js";

// ── Badge definitions ─────────────────────────────────────────────────────────
export const BADGE_DEFS = [
  { id: "first_question",   emoji: "🌱", label: "First Step",       desc: "Answered your first question" },
  { id: "ten_questions",    emoji: "🔟", label: "Ten Down",          desc: "Answered 10 questions" },
  { id: "hundred_questions",emoji: "💯", label: "Century",           desc: "Answered 100 questions" },
  { id: "five_hundred",     emoji: "🏅", label: "500 Club",          desc: "Answered 500 questions" },
  { id: "perfect_round",    emoji: "⭐", label: "Perfect Round",     desc: "10/10 on any round" },
  { id: "streak_3",         emoji: "🔥", label: "3-Day Streak",      desc: "Practised 3 days in a row" },
  { id: "streak_7",         emoji: "🏆", label: "7-Day Warrior",     desc: "Practised 7 days in a row" },
  { id: "streak_30",        emoji: "👑", label: "30-Day Legend",     desc: "Practised 30 days in a row" },
  { id: "mock_pass",        emoji: "📋", label: "Ready for DLTC",    desc: "Passed the Mock Exam (75%+)" },
  { id: "all_rounds",       emoji: "🎖️", label: "Gauntlet Complete", desc: "Completed all rounds in any gauntlet" },
  { id: "speed_ace",        emoji: "⚡", label: "Speed Ace",          desc: "85%+ in Speed Match" },
  { id: "accuracy_master",  emoji: "🎯", label: "Accuracy Master",   desc: "80%+ overall accuracy (50+ questions)" },
];

const BADGE_STORAGE_KEY = "k53_badges";

export function getBadges() {
  try {
    return JSON.parse(localStorage.getItem(BADGE_STORAGE_KEY) || "[]");
  } catch { return []; }
}

export function awardBadge(id) {
  try {
    const existing = getBadges();
    if (existing.includes(id)) return false; // already awarded
    localStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify([...existing, id]));
    return true; // newly awarded
  } catch { return false; }
}

export function checkAndAwardBadges({ totalAnswered, streakCount, justPerfectRound, justPassedMock, allRoundsComplete, speedAce, overallAccuracy }) {
  const newBadges = [];

  if (totalAnswered >= 1 && awardBadge("first_question"))     newBadges.push("first_question");
  if (totalAnswered >= 10 && awardBadge("ten_questions"))     newBadges.push("ten_questions");
  if (totalAnswered >= 100 && awardBadge("hundred_questions")) newBadges.push("hundred_questions");
  if (totalAnswered >= 500 && awardBadge("five_hundred"))     newBadges.push("five_hundred");
  if (justPerfectRound && awardBadge("perfect_round"))        newBadges.push("perfect_round");
  if (streakCount >= 3 && awardBadge("streak_3"))             newBadges.push("streak_3");
  if (streakCount >= 7 && awardBadge("streak_7"))             newBadges.push("streak_7");
  if (streakCount >= 30 && awardBadge("streak_30"))           newBadges.push("streak_30");
  if (justPassedMock && awardBadge("mock_pass"))              newBadges.push("mock_pass");
  if (allRoundsComplete && awardBadge("all_rounds"))          newBadges.push("all_rounds");
  if (speedAce && awardBadge("speed_ace"))                    newBadges.push("speed_ace");
  if (overallAccuracy >= 80 && totalAnswered >= 50 && awardBadge("accuracy_master")) newBadges.push("accuracy_master");

  return newBadges;
}

// ── Badge toast notification ──────────────────────────────────────────────────
export function BadgeToast({ badgeId, onDismiss }) {
  if (!badgeId) return null;
  const def = BADGE_DEFS.find(b => b.id === badgeId);
  if (!def) return null;

  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%",
      transform: "translateX(-50%)",
      background: T.surface,
      border: `2px solid ${T.gold}`,
      borderRadius: 8, padding: "14px 24px",
      zIndex: 9997,
      textAlign: "center",
      fontFamily: T.font,
      animation: "slideUp 0.4s ease-out",
      minWidth: 260,
      boxShadow: `0 0 40px rgba(255,182,18,0.25)`,
    }}>
      <style>{`@keyframes slideUp { from { transform: translateX(-50%) translateY(20px); opacity:0; } to { transform: translateX(-50%) translateY(0); opacity:1; } }`}</style>
      <div style={{ color: T.gold, fontSize: 10, letterSpacing: 3, fontFamily: "monospace", marginBottom: 6 }}>
        🏅 BADGE UNLOCKED
      </div>
      <div style={{ fontSize: 32, marginBottom: 4 }}>{def.emoji}</div>
      <div style={{ color: T.white, fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{def.label}</div>
      <div style={{ color: T.dim, fontSize: 12 }}>{def.desc}</div>
      <button
        onClick={onDismiss}
        style={{ marginTop: 10, background: T.gold, border: "none", borderRadius: 3, padding: "6px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#060D07", fontFamily: T.font }}
      >
        Nice!
      </button>
    </div>
  );
}

// ── Badge display grid ────────────────────────────────────────────────────────
export function BadgeGrid() {
  const earned = getBadges();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {BADGE_DEFS.map(def => {
        const has = earned.includes(def.id);
        return (
          <div key={def.id} title={def.desc} style={{
            background: has ? T.surface : T.surfaceAlt,
            border: `1px solid ${has ? T.gold : T.border}`,
            borderRadius: 6, padding: "10px 14px",
            textAlign: "center", minWidth: 80,
            opacity: has ? 1 : 0.35,
            transition: "opacity 0.2s",
          }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{def.emoji}</div>
            <div style={{ color: has ? T.text : T.dim, fontSize: 10, fontFamily: "monospace", lineHeight: 1.3 }}>{def.label}</div>
          </div>
        );
      })}
    </div>
  );
}
