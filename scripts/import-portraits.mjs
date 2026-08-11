#!/usr/bin/env node
/**
 * Convert incoming portrait JPEG/PNG files to WebP for the site.
 *
 * Drop source files in assets/portraits-incoming/:
 *   dr-akin-portrait-formal.jpg       — blue suit, three-quarter (profile + OG)
 *   dr-akin-portrait-approachable.jpg — navy suit, arms crossed (Meet + Work hubs)
 *
 * Then: npm run import:portraits
 */
import { access, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const INCOMING_DIR = path.join(ROOT, "assets/portraits-incoming");
const OUTPUT_DIR = path.join(ROOT, "public/images/marketing");

const TARGETS = [
  {
    basename: "dr-akin-portrait-formal",
    output: "dr-akin-portrait-formal.webp",
    maxWidth: 1600,
  },
  {
    basename: "dr-akin-portrait-approachable",
    output: "dr-akin-portrait-approachable.webp",
    maxWidth: 1600,
  },
];

const SOURCE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

async function findSource(basename) {
  for (const ext of SOURCE_EXTENSIONS) {
    const candidate = path.join(INCOMING_DIR, `${basename}${ext}`);
    try {
      await access(candidate);
      return candidate;
    } catch {
      /* try next extension */
    }
  }
  return null;
}

async function main() {
  await mkdir(INCOMING_DIR, { recursive: true });
  await mkdir(OUTPUT_DIR, { recursive: true });

  const available = await readdir(INCOMING_DIR).catch(() => []);
  if (available.length === 0) {
    console.error(`No files found in ${path.relative(ROOT, INCOMING_DIR)}/`);
    console.error("Add dr-akin-portrait-formal.jpg and dr-akin-portrait-approachable.jpg, then rerun.");
    process.exit(1);
  }

  let converted = 0;

  for (const target of TARGETS) {
    const source = await findSource(target.basename);
    if (!source) {
      console.warn(`Skip: missing ${target.basename}.{jpg,jpeg,png,webp}`);
      continue;
    }

    const dest = path.join(OUTPUT_DIR, target.output);
    await sharp(source)
      .rotate()
      .resize({ width: target.maxWidth, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(dest);

    console.log(`✓ ${path.basename(source)} → public/images/marketing/${target.output}`);
    converted += 1;
  }

  if (converted === 0) {
    console.error("No portraits converted. Check filenames in assets/portraits-incoming/.");
    process.exit(1);
  }

  console.log(`\nDone — ${converted} portrait(s) ready for deploy.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
