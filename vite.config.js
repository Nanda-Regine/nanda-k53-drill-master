import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
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
  ],
  base: "./",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React runtime into its own chunk
          vendor: ["react", "react-dom"],
          // Split animation library
          motion: ["framer-motion"],
          // Split heavy game files to load on demand
          "games-core": [
            "./src/games/Gauntlet.jsx",
            "./src/games/MockExam.jsx",
            "./src/games/PatternTrainer.jsx",
          ],
          "games-ext": [
            "./src/games/HybridGauntlet.jsx",
            "./src/games/RoadRulesGauntlet.jsx",
            "./src/games/VehicleControls.jsx",
            "./src/games/PDPPrep.jsx",
            "./src/games/MotorcycleGauntlet.jsx",
            "./src/games/HeavyVehicleGauntlet.jsx",
          ],
        },
      },
    },
  },
});
