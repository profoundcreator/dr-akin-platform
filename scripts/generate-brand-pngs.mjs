#!/usr/bin/env node
/**
 * Generate PNG brand assets from SVG sources (emails + apple-touch-icon).
 * Run: node scripts/generate-brand-pngs.mjs
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const brandDir = resolve(root, "public/brand");

const ASSETS = [
  { svg: "akin-logo-mono.svg", png: "akin-logo-mono.png", width: 336 },
  { svg: "akin-logo-color.svg", png: "akin-logo-color.png", width: 336 },
  { svg: "akin-iconmark.svg", png: "akin-iconmark.png", width: 180 },
];

for (const { svg, png, width } of ASSETS) {
  const input = readFileSync(resolve(brandDir, svg));
  await sharp(input).resize({ width }).png({ compressionLevel: 9 }).toFile(resolve(brandDir, png));
  console.log(`✓ public/brand/${png}`);
}
