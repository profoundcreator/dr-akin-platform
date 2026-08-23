#!/usr/bin/env node
/**
 * Convert stage / social source photos to WebP for OG cards and page heroes.
 *
 * Drop source files in assets/social-images-incoming/:
 *   dr-akin-social-og-source.jpg       — Image 4: side profile on stage (site-wide OG)
 *   dr-akin-speaking-og-source.jpg     — Image 3: keynote + theme screen (Speaking OG)
 *   dr-akin-speaking-hero-source.jpg   — Image 2: wide hall shot (Speaking page hero)
 *   performx-summit-og-source.jpg      — Image 1: PerformX hall (Summit event OG)
 *
 * Then: npm run import:social-images
 *
 * Bootstrap (interim crops from studio portrait until stage sources are added):
 *   npm run import:social-images -- --bootstrap-og     — default link preview only
 *   npm run import:social-images -- --bootstrap        — all four (overwrites stage assets)
 */
import { access, mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const INCOMING_DIR = path.join(ROOT, "assets/social-images-incoming");
const OUTPUT_DIR = path.join(ROOT, "public/images/marketing");
const FORMAL_PORTRAIT = path.join(OUTPUT_DIR, "dr-akin-portrait-formal.webp");

const SOURCE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

/** @typedef {{ basename: string; output: string; width: number; height: number; position: import("sharp").Position; format: "jpeg" | "webp" }} Target */

/** @type {Target[]} */
const TARGETS = [
  {
    basename: "dr-akin-social-og-source",
    output: "dr-akin-social-og.jpg",
    width: 1200,
    height: 630,
    position: "right",
    format: "jpeg",
  },
  {
    basename: "dr-akin-speaking-og-source",
    output: "dr-akin-speaking-og.jpg",
    width: 1200,
    height: 630,
    position: "centre",
    format: "jpeg",
  },
  {
    basename: "dr-akin-speaking-hero-source",
    output: "dr-akin-speaking-hero.webp",
    width: 960,
    height: 1200,
    position: "centre",
    format: "webp",
  },
  {
    basename: "performx-summit-og-source",
    output: "performx-summit-og.jpg",
    width: 1200,
    height: 630,
    position: "centre",
    format: "jpeg",
  },
];

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

async function convertOne(source, target) {
  const dest = path.join(OUTPUT_DIR, target.output);
  let pipeline = sharp(source)
    .rotate()
    .resize(target.width, target.height, { fit: "cover", position: target.position });

  if (target.format === "jpeg") {
    pipeline = pipeline.sharpen({ sigma: 0.8, m1: 0.5, m2: 0.3 }).jpeg({
      quality: 92,
      mozjpeg: true,
      chromaSubsampling: "4:4:4",
    });
  } else {
    pipeline = pipeline.webp({ quality: 88, effort: 6, smartSubsample: false });
  }

  await pipeline.toFile(dest);
  console.log(`✓ ${path.basename(source)} → public/images/marketing/${target.output}`);
}

async function main() {
  const bootstrapAll = process.argv.includes("--bootstrap");
  const bootstrapOg = process.argv.includes("--bootstrap-og");
  await mkdir(INCOMING_DIR, { recursive: true });
  await mkdir(OUTPUT_DIR, { recursive: true });

  if (bootstrapAll || bootstrapOg) {
    try {
      await access(FORMAL_PORTRAIT);
    } catch {
      console.error("Bootstrap requires public/images/marketing/dr-akin-portrait-formal.webp");
      process.exit(1);
    }

    const targets = bootstrapOg && !bootstrapAll ? [TARGETS[0]] : TARGETS;
    console.warn(
      bootstrapOg && !bootstrapAll
        ? "Bootstrap OG: updating default link preview from formal portrait only.\n"
        : "Bootstrap mode: generating interim crops from studio portrait.\n" +
            "Replace by adding stage sources to assets/social-images-incoming/ and rerunning without --bootstrap.\n",
    );
    for (const target of targets) {
      await convertOne(FORMAL_PORTRAIT, target);
    }
    console.log(
      bootstrapOg && !bootstrapAll
        ? "\nDone — default OG updated. Stage assets unchanged."
        : "\nDone — interim social images ready. Add stage JPEGs and rerun to replace.",
    );
    return;
  }

  const available = await readdir(INCOMING_DIR).catch(() => []);
  if (available.length === 0) {
    console.error(`No files found in ${path.relative(ROOT, INCOMING_DIR)}/`);
    console.error("Add *-source.jpg files (see script header), or run with --bootstrap for interim crops.");
    process.exit(1);
  }

  let converted = 0;
  for (const target of TARGETS) {
    const source = await findSource(target.basename);
    if (!source) {
      console.warn(`Skip: missing ${target.basename}.{jpg,jpeg,png,webp}`);
      continue;
    }
    await convertOne(source, target);
    converted += 1;
  }

  if (converted === 0) {
    console.error("No social images converted. Check filenames in assets/social-images-incoming/.");
    process.exit(1);
  }

  console.log(`\nDone — ${converted} social image(s) ready for deploy.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
