#!/usr/bin/env node
/**
 * Convert incoming portrait JPEG/PNG files to WebP for the site.
 *
 * Drop source files in assets/portraits-incoming/:
 *   dr-akin-portrait-formal.jpg       — profile hero (+ default OG when bootstrapped)
 *   dr-akin-portrait-approachable.jpg — Meet + Work hub heroes
 *   dr-akin-portrait.jpg              — homepage hero (opt-in only)
 *
 * Prefer client-retouched masters (no grey/white beard). If only legacy sources
 * exist, a conservative beard-region pass runs automatically unless --no-beard-pass.
 *
 *   npm run import:portraits
 *   npm run import:portraits -- --include-homepage
 *   npm run import:portraits -- --no-beard-pass
 *
 * Legacy filenames IMG_3662.JPG / IMG_3663.JPG are mapped automatically when present.
 */
import { access, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const INCOMING_DIR = path.join(ROOT, "assets/portraits-incoming");
const OUTPUT_DIR = path.join(ROOT, "public/images/marketing");

/** @typedef {{ basename: string; output: string; maxWidth: number; homepage?: boolean; legacyAlias?: string }} PortraitTarget */

/** @type {PortraitTarget[]} */
const TARGETS = [
  {
    basename: "dr-akin-portrait-formal",
    output: "dr-akin-portrait-formal.webp",
    maxWidth: 1600,
    legacyAlias: "IMG_3662",
  },
  {
    basename: "dr-akin-portrait-approachable",
    output: "dr-akin-portrait-approachable.webp",
    maxWidth: 1600,
    legacyAlias: "IMG_3663",
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
const skipBeardPass = process.argv.includes("--no-beard-pass");

async function findSource(basename, legacyAlias) {
  const names = [basename, legacyAlias].filter(Boolean);
  for (const name of names) {
    for (const ext of SOURCE_EXTENSIONS) {
      const candidate = path.join(INCOMING_DIR, `${name}${ext}`);
      try {
        await access(candidate);
        return candidate;
      } catch {
        /* try next */
      }
    }
  }
  return null;
}

/**
 * Darken desaturated grey/white hairs in beard/mustache ellipses only.
 * Interim pass until retouched masters replace legacy sources.
 */
async function applyBeardGreyReduction(sourcePath) {
  const base = sharp(sourcePath).rotate();
  const { data, info } = await base.clone().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  /** @type {{ cx: number; cy: number; rx: number; ry: number; strength: number }[]} */
  const masks = [
    { cx: 0.5, cy: 0.53, rx: 0.14, ry: 0.055, strength: 0.72 },
    { cx: 0.5, cy: 0.72, rx: 0.2, ry: 0.16, strength: 0.88 },
  ];

  function feather(x, y, mask) {
    const nx = (x / width - mask.cx) / mask.rx;
    const ny = (y / height - mask.cy) / mask.ry;
    const dist = nx * nx + ny * ny;
    if (dist > 1) return 0;
    return (1 - dist) * mask.strength;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let regionStrength = 0;
      for (const mask of masks) {
        regionStrength = Math.max(regionStrength, feather(x, y, mask));
      }
      if (regionStrength < 0.05) continue;

      const i = (y * width + x) * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const chroma = max - min;
      const lum = (r + g + b) / 3;

      // Avoid suit fabric, skin midtones, and deep shadows.
      if (b > r + 14 && b > g + 8) continue;
      if (r > g + 18 && g > b + 8 && lum > 95 && chroma > 25) continue;
      if (lum < 50) continue;

      let strength = 0;
      if (chroma < 32 && lum > 115) {
        strength = regionStrength * 0.95;
      } else if (chroma < 40 && lum > 75) {
        const greyWeight = Math.min(1, (38 - chroma) / 38) * Math.min(1, (lum - 70) / 100);
        strength = regionStrength * greyWeight;
      }

      if (strength < 0.08) continue;

      const targetR = 20;
      const targetG = 15;
      const targetB = 12;
      data[i] = Math.round(r * (1 - strength) + targetR * strength);
      data[i + 1] = Math.round(g * (1 - strength) + targetG * strength);
      data[i + 2] = Math.round(b * (1 - strength) + targetB * strength);
    }
  }

  return sharp(data, { raw: { width, height, channels } }).removeAlpha();
}

async function convertPortrait(sourcePath, target, useBeardPass) {
  let pipeline = useBeardPass ? await applyBeardGreyReduction(sourcePath) : sharp(sourcePath).rotate();

  const dest = path.join(OUTPUT_DIR, target.output);
  await pipeline
    .resize({ width: target.maxWidth, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(dest);

  console.log(`✓ ${path.basename(sourcePath)} → public/images/marketing/${target.output}`);
}

async function main() {
  await mkdir(INCOMING_DIR, { recursive: true });
  await mkdir(OUTPUT_DIR, { recursive: true });

  const available = (await readdir(INCOMING_DIR).catch(() => [])).filter(
    (name) => !name.startsWith(".") && name !== "README.md",
  );
  if (available.length === 0) {
    console.error(`No files found in ${path.relative(ROOT, INCOMING_DIR)}/`);
    process.exit(1);
  }

  let converted = 0;
  let usedLegacy = false;

  for (const target of TARGETS) {
    if (target.homepage && !includeHomepage) {
      console.log("Skip: dr-akin-portrait.webp (homepage — pass --include-homepage to replace)");
      continue;
    }

    const source = await findSource(target.basename, target.legacyAlias);
    if (!source) {
      console.warn(`Skip: missing ${target.basename} (or legacy ${target.legacyAlias})`);
      continue;
    }

    if (target.legacyAlias && path.basename(source).toUpperCase().startsWith(target.legacyAlias)) {
      usedLegacy = true;
    }

    await convertPortrait(source, target, !skipBeardPass);
    converted += 1;
  }

  if (converted === 0) {
    console.error("No portraits converted. Check filenames in assets/portraits-incoming/.");
    process.exit(1);
  }

  if (usedLegacy && !skipBeardPass) {
    console.warn(
      "\n⚠️  Legacy sources detected — applied interim beard grey reduction.\n" +
        "   Replace with client-retouched masters (dr-akin-portrait-formal.jpg, etc.) when available,\n" +
        "   then rerun with --no-beard-pass.",
    );
  }

  console.log(`\nDone — ${converted} portrait(s) ready for deploy.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
