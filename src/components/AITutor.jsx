import { useState } from "react";
import { T } from "../theme.js";
import { isPremium } from "../freemium.js";

// ── K53 AI Tutor ──────────────────────────────────────────────────────────────
// Shows after a wrong answer. Fetches explanation from OpenAI via import.meta.env.
// Caches by question text in localStorage to avoid repeat API calls.

const CACHE_KEY = "k53_ai_cache";

function getCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function setCache(key, value) {
  try {
    const cache = getCache();
    cache[key] = value;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

function cacheKey(question) {
  // Simple hash-ish key from first 80 chars of question
  return question.slice(0, 80).replace(/\s+/g, "_");
}

export default function AITutor({ question, correctAnswer, chosenAnswer }) {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const fetchExplanation = async () => {
    // Check cache first
    const key = cacheKey(question);
    const cache = getCache();
    if (cache[key]) {
      setExplanation(cache[key]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 150,
          messages: [
            {
              role: "system",
              content: `You are a South African driving instructor explaining K53 road rules to a learner driver. Explain in simple, clear language why the correct answer is right. Reference the specific road rule or safety principle involved. Keep it under 3 sentences. Use friendly, encouraging South African English.`,
            },
            {
              role: "user",
              content: `Question: ${question}. Correct answer: ${correctAnswer}. The learner chose: ${chosenAnswer}. Explain why "${correctAnswer}" is correct.`,
            },
          ],
        }),
      });

      if (!response.ok) throw new Error("API error");

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) {
        setExplanation(text);
        setCache(key, text);
      } else {
        throw new Error("Empty response");
      }
    } catch (err) {
      setError("Couldn't load AI explanation right now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  // Only show for wrong answers; require API key
  if (!apiKey) return null;

  return (
    <div style={{ marginTop: 12 }}>
      {!explanation && !loading && (
        <button
          onClick={fetchExplanation}
          style={{
            background: "transparent",
            border: `1px solid ${T.blue}`,
            color: T.blue,
            borderRadius: 4,
            padding: "9px 16px",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: T.font,
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(68,114,202,0.12)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          🤖 Explain This
        </button>
      )}

      {loading && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          color: T.dim, fontSize: 13, padding: "10px 0",
        }}>
          <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
          K53 AI Tutor is thinking...
        </div>
      )}

      {explanation && (
        <div style={{
          background: "rgba(68,114,202,0.08)",
          border: `1px solid ${T.blue}`,
          borderLeft: `4px solid ${T.blue}`,
          borderRadius: 4,
          padding: "14px 16px",
          marginTop: 4,
        }}>
          <div style={{
            color: T.blue,
            fontSize: 10,
            letterSpacing: 3,
            fontFamily: T.mono,
            fontWeight: 700,
            marginBottom: 8,
          }}>
            🤖 K53 AI TUTOR EXPLAINS
          </div>
          <div style={{ color: T.text, fontSize: 13, lineHeight: 1.7 }}>
            {explanation}
          </div>
        </div>
      )}

      {error && (
        <div style={{ color: T.dim, fontSize: 12, padding: "8px 0" }}>
          {error}{" "}
          <button
            onClick={fetchExplanation}
            style={{ background: "none", border: "none", color: T.blue, cursor: "pointer", fontSize: 12, padding: 0 }}
          >
            Retry
          </button>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
