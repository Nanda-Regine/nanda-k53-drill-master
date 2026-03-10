import { T } from "../theme.js";

export const BADGE_DEFS = [
  { id: "first_question",    emoji: "🌱", label: "First Step",       desc: "Answered your first question" },
  { id: "ten_questions",     emoji: "🔟", label: "Ten Down",          desc: "Answered 10 questions" },
  { id: "hundred_questions", emoji: "💯", label: "Century",           desc: "Answered 100 questions" },
  { id: "five_hundred",      emoji: "🏅", label: "500 Club",          desc: "Answered 500 questions" },
  { id: "perfect_round",     emoji: "⭐", label: "Perfect Round",     desc: "10/10 on any round" },
  { id: "streak_3",          emoji: "🔥", label: "3-Day Streak",      desc: "Practised 3 days in a row" },
  { id: "streak_7",          emoji: "🏆", label: "7-Day Warrior",     desc: "Practised 7 days in a row" },
  { id: "streak_30",         emoji: "👑", label: "30-Day Legend",     desc: "Practised 30 days in a row" },
  { id: "mock_pass",         emoji: "📋", label: "Ready for DLTC",    desc: "Passed the Mock Exam (75%+)" },
  { id: "all_rounds",        emoji: "🎖️", label: "Gauntlet Complete", desc: "Completed all rounds in any gauntlet" },
  { id: "speed_ace",         emoji: "⚡", label: "Speed Ace",          desc: "85%+ in Speed Match" },
  { id: "accuracy_master",   emoji: "🎯", label: "Accuracy Master",   desc: "80%+ overall accuracy (50+ questions)" },
  { id: "pdp_ready",         emoji: "🎓", label: "PDP Ready",         desc: "Passed all 6 PDP Prep modules at 80%+" },
];

const BADGE_STORAGE_KEY = "k53_badges";

export function getBadges() {
  try { return JSON.parse(localStorage.getItem(BADGE_STORAGE_KEY) || "[]"); }
  catch { return []; }
}

export function awardBadge(id) {
  try {
    const existing = getBadges();
    if (existing.includes(id)) return false;
    localStorage.setItem(BADGE_STORAGE_KEY, JSON.stringify([...existing, id]));
    return true;
  } catch { return false; }
}

export function hasBadge(id) {
  return getBadges().includes(id);
}

export function checkAndAwardBadges({ totalAnswered, streakCount, justPerfectRound, justPassedMock, allRoundsComplete, speedAce, overallAccuracy, pdpComplete }) {
  const newBadges = [];
  if (totalAnswered >= 1   && awardBadge("first_question"))     newBadges.push("first_question");
  if (totalAnswered >= 10  && awardBadge("ten_questions"))      newBadges.push("ten_questions");
  if (totalAnswered >= 100 && awardBadge("hundred_questions"))  newBadges.push("hundred_questions");
  if (totalAnswered >= 500 && awardBadge("five_hundred"))       newBadges.push("five_hundred");
  if (justPerfectRound     && awardBadge("perfect_round"))      newBadges.push("perfect_round");
  if (streakCount >= 3     && awardBadge("streak_3"))           newBadges.push("streak_3");
  if (streakCount >= 7     && awardBadge("streak_7"))           newBadges.push("streak_7");
  if (streakCount >= 30    && awardBadge("streak_30"))          newBadges.push("streak_30");
  if (justPassedMock       && awardBadge("mock_pass"))          newBadges.push("mock_pass");
  if (allRoundsComplete    && awardBadge("all_rounds"))         newBadges.push("all_rounds");
  if (speedAce             && awardBadge("speed_ace"))          newBadges.push("speed_ace");
  if (overallAccuracy >= 80 && totalAnswered >= 50 && awardBadge("accuracy_master")) newBadges.push("accuracy_master");
  if (pdpComplete          && awardBadge("pdp_ready"))          newBadges.push("pdp_ready");
  return newBadges;
}

export function BadgeToast({ badgeId, onDismiss }) {
  if (!badgeId) return null;
  const def = BADGE_DEFS.find(b => b.id === badgeId);
  if (!def) return null;
  return (
    <div style={{
      position: "fixed", bottom: 88, left: "50%", transform: "translateX(-50%)",
      background: "linear-gradient(135deg,#1a1a2e,#0d0d1a)",
      border: `2px solid ${T.gold}`, borderRadius: 16, padding: "16px 24px",
      zIndex: 9997, textAlign: "center", fontFamily: T.font,
      animation: "badgeSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      minWidth: 270, boxShadow: `0 8px 40px rgba(255,182,18,0.35), 0 0 0 1px rgba(255,182,18,0.1)`,
    }}>
      <style>{`@keyframes badgeSlideUp { from { transform: translateX(-50%) translateY(30px); opacity:0; } to { transform: translateX(-50%) translateY(0); opacity:1; } }`}</style>
      <div style={{ color: T.gold, fontSize: 9, letterSpacing: 4, fontFamily: "monospace", marginBottom: 8, textTransform: 'uppercase' }}>
        ✦ Badge Unlocked ✦
      </div>
      <div style={{ fontSize: 36, marginBottom: 6 }}>{def.emoji}</div>
      <div style={{ color: "#fff", fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{def.label}</div>
      <div style={{ color: T.dim, fontSize: 12, marginBottom: 14 }}>{def.desc}</div>
      <button onClick={onDismiss} style={{ background: T.gold, border: "none", borderRadius: 8, padding: "8px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", color: "#060D07", fontFamily: T.font }}>
        Nice!
      </button>
    </div>
  );
}

export function BadgeGrid() {
  const earned = getBadges();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
      {BADGE_DEFS.map(def => {
        const has = earned.includes(def.id);
        return (
          <div key={def.id} title={def.desc} style={{
            background: has ? "linear-gradient(135deg,#1a1a2e,#0d0d1a)" : T.surfaceAlt,
            border: `1px solid ${has ? T.gold + "88" : T.border}`,
            borderRadius: 12, padding: "14px 10px",
            textAlign: "center", opacity: has ? 1 : 0.3,
            boxShadow: has ? `0 0 16px rgba(255,182,18,0.15)` : 'none',
            transition: "all 0.2s",
          }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{def.emoji}</div>
            <div style={{ color: has ? T.gold : T.dim, fontSize: 10, fontWeight: 600, lineHeight: 1.3 }}>{def.label}</div>
          </div>
        );
      })}
    </div>
  );
}
