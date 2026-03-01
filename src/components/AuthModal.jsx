import { useState } from "react";
import { T } from "../theme.js";
import { supabase } from "../supabase.js";

// ── AuthModal ─────────────────────────────────────────────────────────────────
// Props:
//   onClose – called when user dismisses the modal

export default function AuthModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [uiState, setUiState] = useState("idle"); // "idle" | "loading" | "sent" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  async function sendMagicLink() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      setUiState("error");
      return;
    }
    setUiState("loading");
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) {
      setErrorMsg(error.message);
      setUiState("error");
    } else {
      setUiState("sent");
    }
  }

  function handleKey(e) {
    if (e.key === "Enter") sendMagicLink();
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
        <div style={{ fontSize: 40, marginBottom: 14 }}>🔑</div>

        <div style={{
          color: T.gold, fontSize: 11, letterSpacing: 4,
          fontFamily: T.mono, textTransform: "uppercase", marginBottom: 10,
        }}>
          Subscriber Sign In
        </div>

        {uiState !== "sent" ? (
          <>
            <h2 style={{
              color: T.white, fontSize: 20, fontWeight: 700,
              marginBottom: 10, lineHeight: 1.3,
            }}>
              Sign in with Magic Link
            </h2>
            <p style={{ color: T.dim, fontSize: 13, lineHeight: 1.6, marginBottom: 22 }}>
              Enter your email. We'll send you a one-click sign-in link — no password needed.
              Unlimited access is restored automatically if your subscription is active.
            </p>

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
              onClick={sendMagicLink}
              disabled={uiState === "loading"}
              style={{
                width: "100%", padding: "14px 20px",
                background: uiState === "loading" ? T.surfaceAlt : T.gold,
                color: uiState === "loading" ? T.dim : "#060D07",
                border: "none", borderRadius: 4,
                fontSize: 15, fontWeight: 700, cursor: uiState === "loading" ? "default" : "pointer",
                fontFamily: T.font, marginBottom: 10,
                transition: "opacity 0.15s",
              }}
            >
              {uiState === "loading" ? "Sending…" : "Send Magic Link →"}
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
              Cancel
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 14 }}>📬</div>
            <h2 style={{
              color: T.white, fontSize: 20, fontWeight: 700,
              marginBottom: 10,
            }}>
              Check your email
            </h2>
            <p style={{ color: T.dim, fontSize: 14, lineHeight: 1.7, marginBottom: 6 }}>
              We sent a sign-in link to
            </p>
            <p style={{ color: T.gold, fontSize: 15, fontFamily: T.mono, marginBottom: 20 }}>
              {email.trim().toLowerCase()}
            </p>
            <p style={{ color: T.dim, fontSize: 13, lineHeight: 1.6, marginBottom: 22 }}>
              Click the link in the email to sign in. You can close this window —
              your session will activate automatically when you return.
            </p>
            <button
              onClick={() => { setEmail(""); setUiState("idle"); }}
              style={{
                width: "100%", padding: "11px 20px",
                background: "transparent", color: T.dim,
                border: `1px solid ${T.border}`, borderRadius: 4,
                fontSize: 13, cursor: "pointer", fontFamily: T.font, marginBottom: 8,
              }}
            >
              Use a different email
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
              Close
            </button>
          </>
        )}

        <p style={{ color: T.dim, fontSize: 11, marginTop: 16, fontFamily: T.mono }}>
          Only paying subscribers get unlimited access · <a href="https://wa.me/27842916742" target="_blank" rel="noreferrer" style={{ color: T.dim }}>WhatsApp support</a>
        </p>
      </div>
    </div>
  );
}
