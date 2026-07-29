// @ts-check
import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  integrations: [react()],
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
