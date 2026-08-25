// @ts-check
import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import AstroPWA from "@vite-pwa/astro";

const root = path.dirname(fileURLToPath(import.meta.url));

const siteUrl = (process.env.PUBLIC_SITE_URL ?? "https://dr-akin-platform.vercel.app").replace(
  /\/$/,
  "",
);

const PWA_THEME_COLOR = "#f5f2ee";

/** @param {string} page */
function includeInSitemap(page) {
  const pathname = new URL(page).pathname.replace(/\/+$/, "") || "/";
  if (pathname.startsWith("/admin")) return false;
  if (pathname.startsWith("/booking")) return false;
  if (pathname === "/book-dr-akin" || pathname === "/track-booking") return false;
  if (pathname === "/404") return false;
  // Legacy /view redirect shells — canonical URLs are /insights/{slug} etc.
  if (pathname.endsWith("/view")) return false;
  return true;
}

export default defineConfig({
  site: siteUrl,
  integrations: [
    react(),
    sitemap({
      filter: includeInSitemap,
    }),
    AstroPWA({
      registerType: "prompt",
      includeAssets: ["favicon.svg", "brand/akin-iconmark.png"],
      manifest: {
        id: "/",
        name: "Dr. Akin Akinpelu",
        short_name: "Dr. Akin",
        description:
          "Leadership scholar, governance strategist, and institution builder — public platform for insights, events, and booking.",
        theme_color: PWA_THEME_COLOR,
        background_color: PWA_THEME_COLOR,
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/",
        scope: "/",
        categories: ["business", "education"],
        icons: [
          {
            src: "/brand/akin-iconmark.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/brand/akin-iconmark.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/brand/akin-iconmark.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api\//],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2,woff,txt,xml,webmanifest}"],
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["motion/react"],
    },
    resolve: {
      alias: {
        "@": path.resolve(root, "./src"),
      },
    },
  },
});
