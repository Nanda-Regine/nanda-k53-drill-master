import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import App from "./App.jsx";
import { LangProvider } from "./LangContext.jsx";

// Cloudflare Web Analytics (cookieless). Token is a public build-time value (VITE_CF_BEACON_TOKEN);
// nothing is loaded when it is unset, or inside the native Capacitor shell.
const CF_BEACON_TOKEN = import.meta.env.VITE_CF_BEACON_TOKEN;
if (CF_BEACON_TOKEN && !Capacitor.isNativePlatform()) {
  const s = document.createElement("script");
  s.defer = true;
  s.src = "https://static.cloudflareinsights.com/beacon.min.js";
  s.setAttribute("data-cf-beacon", JSON.stringify({ token: CF_BEACON_TOKEN }));
  document.head.appendChild(s);
}

// ── Native shell init (Capacitor) ───────────────────────────────────────────────
if (Capacitor.isNativePlatform()) {
  import("@capacitor/status-bar").then(({ StatusBar, Style }) => {
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: "#0a0a0f" }).catch(() => {});
  });
  // Hardware back button → walk webview history, exit at the root.
  import("@capacitor/app").then(({ App: CapApp }) => {
    CapApp.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) window.history.back();
      else CapApp.exitApp();
    });
  });
  // Complete OAuth / magic-link sign-in when the OS hands back the deep link.
  import("./utils/nativeAuth.js").then(({ initDeepLinkAuth }) => initDeepLinkAuth());
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </StrictMode>
);
