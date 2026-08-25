#!/usr/bin/env node
/**
 * Convert incoming portrait JPEG/PNG files to WebP for the site.
 *
 * Drop source files in assets/portraits-incoming/:
 *   dr-akin-portrait-formal.jpg       — red tie, arms crossed (profile hero + OG bootstrap)
 *   dr-akin-portrait-approachable.jpg — no tie, arms crossed (Meet + Work hub heroes)
 *   dr-akin-portrait.jpg              — homepage hero ONLY when explicitly requested
 *
 * Then:
 *   npm run import:portraits                  — formal + approachable (homepage unchanged)
 *   npm run import:portraits -- --include-homepage
 *   npm run import:portraits -- --no-beard-pass   — alias; fails if sources match legacy hashes
 *
 * See assets/portraits-incoming/README.md for slot mapping.
 */
import { access, mkdir, readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const INCOMING_DIR = path.join(ROOT, "assets/portraits-incoming");
const OUTPUT_DIR = path.join(ROOT, "public/images/marketing");

/** Known legacy source hashes (renamed IMG_3662/3663) — still contain grey/white beard. */
const LEGACY_SOURCE_SHA256 = new Set([
  "347ad5e2c38e93a0052cb4e7d223e0fbfd7d308502a5a7803574a5ba3c96e18e", // formal / IMG_3662
  "649699c00a421fff6c1b1ffab66205630981a60995f1c66cfa0410a7af050ac2", // approachable / IMG_3663
]);

/** @typedef {{ basename: string; output: string; maxWidth: number; homepage?: boolean }} PortraitTarget */

/** @type {PortraitTarget[]} */
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
  {
    basename: "dr-akin-portrait",
    output: "dr-akin-portrait.webp",
    maxWidth: 1600,
    homepage: true,
  },
];

const SOURCE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".JPG", ".JPEG", ".PNG"];

const includeHomepage = process.argv.includes("--include-homepage");
const noBeardPass = process.argv.includes("--no-beard-pass");

async function sha256File(filePath) {
  const buffer = await readFile(filePath);
  return createHash("sha256").update(buffer).digest("hex");
}

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

  const available = (await readdir(INCOMING_DIR).catch(() => [])).filter(
    (name) => !name.startsWith(".") && name !== "README.md",
  );
  if (available.length === 0) {
    console.error(`No files found in ${path.relative(ROOT, INCOMING_DIR)}/`);
    console.error("Add dr-akin-portrait-formal.jpg and dr-akin-portrait-approachable.jpg, then rerun.");
    process.exit(1);
  }

  let converted = 0;

  for (const target of TARGETS) {
    if (target.homepage && !includeHomepage) {
      console.log("Skip: dr-akin-portrait.webp (homepage — pass --include-homepage to replace)");
      continue;
    }

    const source = await findSource(target.basename);
    if (!source) {
      console.warn(`Skip: missing ${target.basename}.{jpg,jpeg,png,webp}`);
      continue;
    }

    const sourceHash = await sha256File(source);
    if (noBeardPass && LEGACY_SOURCE_SHA256.has(sourceHash)) {
      console.error(
        `\n❌ ${path.basename(source)} matches the legacy unretouched source (grey/white beard still present).\n` +
          "   Replace the file in assets/portraits-incoming/ with your retouched master, commit, push, then rerun.\n",
      );
      process.exit(1);
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
  if (!includeHomepage) {
    console.log("Homepage portrait unchanged.");
    console.log("Do NOT run import:social-images --bootstrap-og unless you intend to replace the stage OG with a studio crop.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
