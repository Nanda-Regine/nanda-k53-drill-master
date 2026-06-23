import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { inject } from "@vercel/analytics";
import { Capacitor } from "@capacitor/core";
import App from "./App.jsx";
import { LangProvider } from "./LangContext.jsx";

inject();

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
