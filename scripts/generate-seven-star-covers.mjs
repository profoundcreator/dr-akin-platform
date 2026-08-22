#!/usr/bin/env node
/**
 * Generate WebP book cover placeholders from existing SVG assets.
 * Run: node scripts/generate-seven-star-covers.mjs
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public/images/marketing/books");

const covers = [
  {
    slug: "the-seven-star-student",
    title: "The Seven Star Student",
    svg: "leading-africa-forward.svg",
  },
  {
    slug: "the-seven-star-teacher",
    title: "The Seven Star Teacher",
    svg: "coaching-mindset.svg",
  },
];

await mkdir(outDir, { recursive: true });

for (const cover of covers) {
  const svgPath = path.join(root, "public/images/books", cover.svg);
  const outPath = path.join(outDir, `${cover.slug}.webp`);

  await sharp(svgPath)
    .resize(600, 900, { fit: "cover" })
    .webp({ quality: 85 })
    .toFile(outPath);

  console.log(`Wrote ${path.relative(root, outPath)}`);
}

console.log("Done.");
