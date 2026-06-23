import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// `vite build --mode capacitor` skips the PWA service worker so the native
// webview doesn't fight workbox caching; the web build keeps the SW.
export default defineConfig(({ mode }) => {
  const isCapBuild = mode === 'capacitor';
  return {
  plugins: [
    react(),
    !isCapBuild && VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.jpg", "favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "K53 Drill Master",
        short_name: "K53 Drill",
        description: "South Africa's learner's licence practice app — 500+ DLTC questions for Code 1, 8, 10 & 14.",
        theme_color: "#007A4D",
        background_color: "#060D07",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        lang: "en-ZA",
        categories: ["education"],
        icons: [
          { src: "favicon.jpg", sizes: "192x192", type: "image/jpeg" },
          { src: "favicon.jpg", sizes: "512x512", type: "image/jpeg" },
          { src: "favicon.jpg", sizes: "512x512", type: "image/jpeg", purpose: "maskable" },
        ],
      },
      workbox: {
        // Cache app shell and all assets
        globPatterns: ["**/*.{js,css,html,ico,jpg,jpeg,svg,png,woff2}"],
        runtimeCaching: [
          {
            // Cache Google Fonts if used
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: { cacheName: "google-fonts-cache", expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ].filter(Boolean),
  base: "./",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor';
          if (id.includes('node_modules/framer-motion')) return 'motion';
          if (id.includes('/games/Gauntlet') || id.includes('/games/MockExam') || id.includes('/games/PatternTrainer')) return 'games-core';
          if (id.includes('/games/HybridGauntlet') || id.includes('/games/RoadRulesGauntlet') || id.includes('/games/VehicleControls') || id.includes('/games/PDPPrep') || id.includes('/games/MotorcycleGauntlet') || id.includes('/games/HeavyVehicleGauntlet')) return 'games-ext';
        },
      },
    },
  },
  };
});
