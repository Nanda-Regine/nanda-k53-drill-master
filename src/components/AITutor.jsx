import { useState } from "react";
import { T } from "../theme.js";
import { isPremium } from "../freemium.js";

// ── K53 AI Tutor ──────────────────────────────────────────────────────────────
// Caches explanations in localStorage. Rate-limited to prevent API cost blowout.
// SECURITY NOTE: VITE_OPENAI_API_KEY is client-side. Mitigation: rate limit + cache.
// TODO: migrate to Supabase Edge Function to keep key server-side.

const CACHE_KEY      = "k53_ai_cache";
const RATE_KEY       = "k53_ai_rate";
const FREE_DAILY_MAX = 3;   // free users: 3 AI explanations/day
const MAX_CACHE_ENTRIES = 200; // prune when cache exceeds this

function simpleHash(str) {
  // djb2 — fast, deterministic, good enough for a cache key
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
  return (h >>> 0).toString(36);
}

function getCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); } catch { return {}; }
}

function setCache(key, value) {
  try {
    const cache = getCache();
    const entries = Object.keys(cache);
    // Prune oldest half when over limit — prevents localStorage bloat
    if (entries.length >= MAX_CACHE_ENTRIES) {
      const pruned = {};
      entries.slice(Math.floor(entries.length / 2)).forEach(k => { pruned[k] = cache[k]; });
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ...pruned, [key]: value }));
    } else {
      cache[key] = value;
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    }
  } catch {}
}

function cacheKey(question, correctAnswer) {
  return simpleHash(question + correctAnswer);
}

function getRateData() {
  try { return JSON.parse(localStorage.getItem(RATE_KEY) || "{}"); } catch { return {}; }
}

function canCallAI() {
  if (isPremium()) return true; // premium: unlimited
  const today = new Date().toDateString();
  const rate = getRateData();
  return (rate[today] || 0) < FREE_DAILY_MAX;
}

function recordAICall() {
  const today = new Date().toDateString();
  const rate = getRateData();
  rate[today] = (rate[today] || 0) + 1;
  try { localStorage.setItem(RATE_KEY, JSON.stringify({ [today]: rate[today] })); } catch {}
}

function remainingAICalls() {
  if (isPremium()) return Infinity;
  const today = new Date().toDateString();
  const rate = getRateData();
  return Math.max(0, FREE_DAILY_MAX - (rate[today] || 0));
}

export default function AITutor({ question, correctAnswer, chosenAnswer }) {
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const fetchExplanation = async () => {
    // 1. Cache hit — free, no API call
    const key = cacheKey(question, correctAnswer);
    const cached = getCache()[key];
    if (cached) { setExplanation(cached); return; }

    // 2. Rate limit check
    if (!canCallAI()) {
      setError(`Daily AI limit reached (${FREE_DAILY_MAX} for free users). Upgrade for unlimited explanations.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      recordAICall(); // deduct before call — prevents double-spend on retry
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          max_tokens: 120, // reduced from 150 — 3 sentences needs ~100 tokens
          temperature: 0,  // deterministic = better cache hit rate for same question
          messages: [
            {
              role: "system",
              content: "You are a South African K53 driving instructor. Explain in 2-3 sentences why the correct answer is right. Reference the specific rule. Be encouraging. Plain English.",
            },
            {
              role: "user",
              content: `Q: ${question}\nCorrect: ${correctAnswer}\nLearner chose: ${chosenAnswer}`,
            },
          ],
        }),
      });

      if (!response.ok) throw new Error(`API ${response.status}`);
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content?.trim();
      if (text) { setExplanation(text); setCache(key, text); }
      else throw new Error("Empty");
    } catch {
      setError("Couldn't load explanation. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!apiKey) return null;
  const remaining = remainingAICalls();

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
            cursor: remaining === 0 ? "default" : "pointer",
            fontFamily: T.font,
            display: "flex",
            alignItems: "center",
            gap: 8,
            opacity: remaining === 0 ? 0.5 : 1,
            transition: "background 0.15s",
          }}
          onMouseEnter={e => { if (remaining > 0) e.currentTarget.style.background = "rgba(68,114,202,0.12)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          🤖 Explain This
          {!isPremium() && remaining < FREE_DAILY_MAX && (
            <span style={{ fontSize: 10, opacity: 0.6 }}>{remaining} left today</span>
          )}
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
