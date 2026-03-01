import { useState, useEffect } from "react";
import { T } from "../theme.js";

// ── Progress Tracking ─────────────────────────────────────────────────────────
// Reads from localStorage. Data is written by game files using trackAnswer().
// Call trackAnswer(category, isCorrect) from each game's handleSelect.

const PROGRESS_KEY = "k53_progress";
const STREAK_KEY = "k53_streak";

export function trackAnswer(category, isCorrect) {
  try {
    const data = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
    if (!data.total) data.total = 0;
    if (!data.correct) data.correct = 0;
    if (!data.categories) data.categories = {};

    data.total += 1;
    if (isCorrect) data.correct += 1;

    if (!data.categories[category]) data.categories[category] = { total: 0, correct: 0 };
    data.categories[category].total += 1;
    if (isCorrect) data.categories[category].correct += 1;

    data.lastActivity = new Date().toDateString();
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));

    // Streak tracking
    updateStreak();
  } catch {}
}

function updateStreak() {
  try {
    const streak = JSON.parse(localStorage.getItem(STREAK_KEY) || '{"count":0,"lastDay":""}');
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (streak.lastDay === today) return; // already counted today
    if (streak.lastDay === yesterday) {
      streak.count += 1;
    } else if (streak.lastDay !== today) {
      streak.count = 1;
    }
    streak.lastDay = today;
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  } catch {}
}

function getStreak() {
  try {
    const streak = JSON.parse(localStorage.getItem(STREAK_KEY) || '{"count":0,"lastDay":""}');
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (streak.lastDay !== today && streak.lastDay !== yesterday) return 0;
    return streak.count;
  } catch {
    return 0;
  }
}

function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
  } catch {
    return {};
  }
}

// ── Progress Page Component ───────────────────────────────────────────────────
export default function Progress({ onBack }) {
  const [data, setData] = useState({});
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setData(getProgress());
    setStreak(getStreak());
  }, []);

  const total = data.total || 0;
  const correct = data.correct || 0;
  const incorrect = total - correct;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const categories = data.categories || {};

  // Find weakest category
  const catEntries = Object.entries(categories).map(([name, d]) => ({
    name,
    total: d.total,
    correct: d.correct,
    pct: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0,
  })).sort((a, b) => a.pct - b.pct);

  const weakest = catEntries[0];
  const strongest = catEntries[catEntries.length - 1];

  const waLink = `https://wa.me/?text=${encodeURIComponent(`📊 My K53 progress: ${correct}/${total} correct (${accuracy}% accuracy) — ${streak} day streak 🔥 Practising at https://nanda-k53-drill-master.vercel.app`)}`;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.text, padding: "24px 16px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>

        <button onClick={onBack} style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.dim, fontSize: 13, padding: "7px 14px", cursor: "pointer", fontFamily: T.font, borderRadius: 3, marginBottom: 24 }}>
          ← All Drills
        </button>

        <div style={{ fontSize: 11, letterSpacing: 4, color: T.dim, fontFamily: T.mono, marginBottom: 8 }}>YOUR PROGRESS</div>
        <h1 style={{ color: T.gold, fontSize: 28, fontWeight: 700, marginBottom: 24, letterSpacing: -0.5 }}>Training Dashboard</h1>

        {total === 0 ? (
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: "40px 28px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
            <div style={{ color: T.text, fontSize: 18, fontWeight: 700, marginBottom: 10 }}>No data yet</div>
            <div style={{ color: T.dim, fontSize: 14, lineHeight: 1.7 }}>
              Start practising with any drill — your progress will appear here automatically.
            </div>
          </div>
        ) : (
          <>
            {/* Streak + summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 20 }}>
              <div style={{ background: T.surface, border: `2px solid ${streak >= 3 ? T.gold : T.border}`, borderRadius: 6, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 36 }}>{streak >= 1 ? "🔥" : "💤"}</div>
                <div style={{ color: T.gold, fontSize: 32, fontWeight: 700 }}>{streak}</div>
                <div style={{ color: T.dim, fontSize: 11, fontFamily: T.mono, letterSpacing: 2 }}>DAY STREAK</div>
              </div>
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 36 }}>🎯</div>
                <div style={{ color: accuracy >= 75 ? T.green : accuracy >= 50 ? T.gold : T.red, fontSize: 32, fontWeight: 700 }}>{accuracy}%</div>
                <div style={{ color: T.dim, fontSize: 11, fontFamily: T.mono, letterSpacing: 2 }}>ACCURACY</div>
              </div>
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: "20px", textAlign: "center" }}>
                <div style={{ color: T.text, fontSize: 32, fontWeight: 700 }}>{total}</div>
                <div style={{ color: T.dim, fontSize: 11, fontFamily: T.mono, letterSpacing: 2 }}>TOTAL ANSWERED</div>
              </div>
              <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: "20px", textAlign: "center" }}>
                <div style={{ color: T.green, fontSize: 32, fontWeight: 700 }}>{correct}</div>
                <div style={{ color: T.dim, fontSize: 11, fontFamily: T.mono, letterSpacing: 2 }}>CORRECT</div>
              </div>
            </div>

            {/* Badges */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              {weakest && (
                <div style={{ background: "#1a0000", border: `1px solid ${T.red}`, borderRadius: 4, padding: "8px 14px" }}>
                  <span style={{ color: T.red, fontSize: 12, fontFamily: T.mono }}>⚠ WEAKEST: {weakest.name} ({weakest.pct}%)</span>
                </div>
              )}
              {strongest && strongest.pct > 0 && (
                <div style={{ background: "#001a12", border: `1px solid ${T.green}`, borderRadius: 4, padding: "8px 14px" }}>
                  <span style={{ color: T.green, fontSize: 12, fontFamily: T.mono }}>✓ STRONGEST: {strongest.name} ({strongest.pct}%)</span>
                </div>
              )}
              {streak >= 7 && (
                <div style={{ background: "#1a1200", border: `1px solid ${T.gold}`, borderRadius: 4, padding: "8px 14px" }}>
                  <span style={{ color: T.gold, fontSize: 12, fontFamily: T.mono }}>🏆 7-DAY WARRIOR</span>
                </div>
              )}
            </div>

            {/* Category breakdown */}
            <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 6, padding: "20px 24px", marginBottom: 20 }}>
              <div style={{ color: T.gold, fontSize: 11, letterSpacing: 3, fontFamily: T.mono, marginBottom: 16 }}>PERFORMANCE BY CATEGORY</div>
              {catEntries.length === 0 && <div style={{ color: T.dim, fontSize: 13 }}>No category data yet.</div>}
              {catEntries.map(cat => {
                const color = cat.pct >= 75 ? T.green : cat.pct >= 50 ? T.gold : T.red;
                return (
                  <div key={cat.name} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ color: T.text, fontSize: 13 }}>{cat.name}</span>
                      <span style={{ color, fontSize: 13, fontFamily: T.mono, fontWeight: 700 }}>
                        {cat.correct}/{cat.total} · {cat.pct}%
                      </span>
                    </div>
                    <div style={{ height: 6, background: T.surfaceAlt, borderRadius: 3 }}>
                      <div style={{ height: "100%", width: `${cat.pct}%`, background: color, borderRadius: 3, transition: "width 0.5s ease-out" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* WhatsApp share */}
            <a href={waLink} target="_blank" rel="noreferrer" style={{
              display: "block", width: "100%", padding: "14px", background: "#25D366",
              color: "#fff", borderRadius: 4, fontSize: 14, fontWeight: 700,
              textAlign: "center", textDecoration: "none", marginBottom: 12,
            }}>
              📲 Share Progress on WhatsApp
            </a>

            {/* Reset */}
            <button
              onClick={() => {
                if (window.confirm("Reset all progress? This cannot be undone.")) {
                  localStorage.removeItem(PROGRESS_KEY);
                  localStorage.removeItem(STREAK_KEY);
                  setData({});
                  setStreak(0);
                }
              }}
              style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.dim, fontSize: 13, padding: "10px 16px", cursor: "pointer", fontFamily: T.font, borderRadius: 4 }}
            >
              Reset Progress
            </button>
          </>
        )}
      </div>
    </div>
  );
}
