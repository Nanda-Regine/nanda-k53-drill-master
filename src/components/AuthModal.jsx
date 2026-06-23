import { useState } from "react";
import { T } from "../theme.js";
import { apiBase } from "../utils/runtime.js";
import { signInWithGoogle, sendMagicLink } from "../utils/nativeAuth.js";

// ── AuthModal ─────────────────────────────────────────────────────────────────
// Props:
//   onClose     – called when user dismisses the modal
//   claimToken  – if present, the user just paid and we activate their subscription
//                 by POSTing to /api/claim instead of a plain magic link

export default function AuthModal({ onClose, claimToken }) {
  const [email, setEmail] = useState("");
  const [uiState, setUiState] = useState("idle"); // "idle" | "loading" | "sent" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  async function handleGoogle() {
    setUiState("loading");
    try {
      await signInWithGoogle();
    } catch (e) {
      setErrorMsg(e.message || "Auth service unavailable. Contact us on WhatsApp.");
      setUiState("error");
    }
  }

  const isClaiming = Boolean(claimToken);

  async function submit() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      setUiState("error");
      return;
    }
    setUiState("loading");

    if (isClaiming) {
      // New subscriber — validate payment token, create Supabase account,
      // upsert subscriber row, and send invite/magic link, all in one call.
      try {
        const res = await fetch(`${apiBase()}/api/claim`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed, claimToken }),
        });
        const data = await res.json();
        if (data.ok) {
          setUiState("sent");
        } else {
          setErrorMsg(data.error || "Something went wrong. Contact us on WhatsApp.");
          setUiState("error");
        }
      } catch {
        setErrorMsg("Network error. Please try again.");
        setUiState("error");
      }
    } else {
      // Returning subscriber — send a plain magic link
      try {
        await sendMagicLink(trimmed);
        setUiState("sent");
      } catch (e) {
        setErrorMsg(e.message);
        setUiState("error");
      }
    }
  }

  function handleKey(e) {
    if (e.key === "Enter") submit();
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.82)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999, padding: "20px",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: T.surface,
        border: `2px solid ${T.gold}`,
        borderRadius: 8,
        padding: "36px 28px",
        maxWidth: 400,
        width: "100%",
        textAlign: "center",
        fontFamily: T.font,
        boxShadow: `0 0 60px rgba(255,182,18,0.15)`,
      }}>
        <div style={{ fontSize: 40, marginBottom: 14 }}>
          {isClaiming ? "🎉" : "🔑"}
        </div>

        <div style={{
          color: T.gold, fontSize: 11, letterSpacing: 4,
          fontFamily: T.mono, textTransform: "uppercase", marginBottom: 10,
        }}>
          {isClaiming ? "Claim Your Subscription" : "Subscriber Sign In"}
        </div>

        {uiState !== "sent" ? (
          <>
            <h2 style={{
              color: T.white, fontSize: 20, fontWeight: 700,
              marginBottom: 10, lineHeight: 1.3,
            }}>
              {isClaiming ? "Enter your email to activate" : "Sign in with Magic Link"}
            </h2>
            <p style={{ color: T.dim, fontSize: 13, lineHeight: 1.6, marginBottom: 22 }}>
              {isClaiming
                ? "We'll create your account and email you a one-click sign-in link. Use it on any device to get UNLIMITED access."
                : "Enter your email. We'll send you a one-click sign-in link — no password needed."
              }
            </p>

            {!isClaiming && (
              <>
                <button
                  onClick={handleGoogle}
                  disabled={uiState === "loading"}
                  style={{
                    width: "100%", padding: "13px 20px",
                    background: "#fff", color: "#1a1a1a",
                    border: "none", borderRadius: 4,
                    fontSize: 14, fontWeight: 600,
                    cursor: uiState === "loading" ? "default" : "pointer",
                    fontFamily: T.font, marginBottom: 14,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  marginBottom: 14, color: T.dim, fontSize: 12,
                }}>
                  <div style={{ flex: 1, height: 1, background: T.border }} />
                  <span>or sign in with email</span>
                  <div style={{ flex: 1, height: 1, background: T.border }} />
                </div>
              </>
            )}

            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setUiState("idle"); }}
              onKeyDown={handleKey}
              placeholder="your@email.com"
              autoFocus
              style={{
                width: "100%", boxSizing: "border-box",
                background: T.surfaceAlt, border: `1px solid ${uiState === "error" ? T.red : T.border}`,
                borderRadius: 4, padding: "12px 14px",
                fontSize: 15, color: T.text, fontFamily: T.font,
                marginBottom: 8, outline: "none",
              }}
            />

            {uiState === "error" && (
              <p style={{ color: T.red, fontSize: 12, marginBottom: 10, textAlign: "left" }}>
                {errorMsg}
              </p>
            )}

            <button
              onClick={submit}
              disabled={uiState === "loading"}
              style={{
                width: "100%", padding: "14px 20px",
                background: uiState === "loading" ? T.surfaceAlt : T.gold,
                color: uiState === "loading" ? T.dim : "#060D07",
                border: "none", borderRadius: 4,
                fontSize: 15, fontWeight: 700,
                cursor: uiState === "loading" ? "default" : "pointer",
                fontFamily: T.font, marginBottom: 10,
              }}
            >
              {uiState === "loading"
                ? "Activating…"
                : isClaiming ? "Activate My Account →" : "Send Magic Link →"
              }
            </button>

            <button
              onClick={onClose}
              style={{
                width: "100%", padding: "11px 20px",
                background: "transparent", color: T.dim,
                border: `1px solid ${T.border}`, borderRadius: 4,
                fontSize: 13, cursor: "pointer", fontFamily: T.font,
              }}
            >
              {isClaiming ? "I'll do this later" : "Cancel"}
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 14 }}>📬</div>
            <h2 style={{ color: T.white, fontSize: 20, fontWeight: 700, marginBottom: 10 }}>
              Check your email
            </h2>
            <p style={{ color: T.dim, fontSize: 14, lineHeight: 1.7, marginBottom: 6 }}>
              {isClaiming ? "Your account is active! We sent your sign-in link to" : "We sent a sign-in link to"}
            </p>
            <p style={{ color: T.gold, fontSize: 15, fontFamily: T.mono, marginBottom: 20 }}>
              {email.trim().toLowerCase()}
            </p>
            <p style={{ color: T.dim, fontSize: 13, lineHeight: 1.6, marginBottom: 22 }}>
              Click the link in the email to sign in. Your unlimited access is ready on any device.
            </p>
            <button
              onClick={onClose}
              style={{
                width: "100%", padding: "13px 20px",
                background: T.gold, color: "#060D07",
                border: "none", borderRadius: 4,
                fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: T.font,
              }}
            >
              Got it — back to studying →
            </button>
          </>
        )}

        <p style={{ color: T.dim, fontSize: 11, marginTop: 16, fontFamily: T.mono }}>
          {isClaiming
            ? "Your payment is confirmed · This just saves your access across devices"
            : <><a href="https://wa.me/27842916742" target="_blank" rel="noreferrer" style={{ color: T.dim }}>WhatsApp support</a> · Subscribers only</>
          }
        </p>
      </div>
    </div>
  );
}
