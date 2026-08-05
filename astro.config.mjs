// @ts-check
import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

const root = path.dirname(fileURLToPath(import.meta.url));

const siteUrl = (process.env.PUBLIC_SITE_URL ?? "https://dr-akin-platform.vercel.app").replace(
  /\/$/,
  "",
);

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
