#!/usr/bin/env node
/**
 * Process the Akin wordmark for site header, footer, and transactional email.
 *
 * Drop the master file in assets/brand-incoming/:
 *   akin-wordmark-source.png   — grey or colour lockup; black or transparent background
 *
 * Then: npm run import:brand
 */
import { access, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const INCOMING = path.join(ROOT, "assets/brand-incoming");
const OUT = path.join(ROOT, "public/brand");
const SOURCE_BASENAMES = ["akin-wordmark-source", "akin-logo-source"];
const SOURCE_EXTENSIONS = [".png", ".webp", ".jpg", ".jpeg"];

/** Rendered width in HTML email clients (height follows aspect ratio). */
export const EMAIL_LOGO_DISPLAY_WIDTH = 200;
const EMAIL_FILE_WIDTH = 440;
const SITE_FILE_WIDTH = 480;

async function findSource() {
  for (const base of SOURCE_BASENAMES) {
    for (const ext of SOURCE_EXTENSIONS) {
      const candidate = path.join(INCOMING, `${base}${ext}`);
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

function normalizeLogoPixels(buffer, channels) {
  const px = Buffer.from(buffer);
  let maxLuma = 0;

  for (let i = 0; i < px.length; i += channels) {
    let r = px[i];
    let g = px[i + 1];
    let b = px[i + 2];
    let a = channels === 4 ? px[i + 3] : 255;

    if (a === 0 && r < 20 && g < 20 && b < 20) continue;

    // Un-premultiply faint anti-aliased exports (common from design tools).
    if (a > 0 && a < 242) {
      const alpha = a / 255;
      r = Math.min(255, Math.round(r / alpha));
      g = Math.min(255, Math.round(g / alpha));
      b = Math.min(255, Math.round(b / alpha));
    }

    // Key near-black backgrounds only — keep dark grey glyphs.
    if (r < 18 && g < 18 && b < 18) {
      a = 0;
    } else if (a > 0) {
      a = 255;
    }

    px[i] = r;
    px[i + 1] = g;
    px[i + 2] = b;
    if (channels === 4) px[i + 3] = a;

    if (a > 0) maxLuma = Math.max(maxLuma, r, g, b);
  }

  return { px: channels === 4 ? px : Buffer.from(px), maxLuma };
}

function boostForLightBackground(px, maxLuma) {
  if (maxLuma >= 100) return px;
  const factor = maxLuma < 55 ? 1.35 : 1.15;
  const offset = maxLuma < 55 ? 24 : 8;

  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] === 0) continue;
    px[i] = Math.min(255, Math.round(px[i] * factor + offset));
    px[i + 1] = Math.min(255, Math.round(px[i + 1] * factor + offset));
    px[i + 2] = Math.min(255, Math.round(px[i + 2] * factor + offset));
  }
  return px;
}

function toDarkModeWordmark(px) {
  const out = Buffer.from(px);
  for (let i = 0; i < out.length; i += 4) {
    if (out[i + 3] === 0) continue;
    out[i] = 232;
    out[i + 1] = 230;
    out[i + 2] = 226;
  }
  return out;
}

async function writePng(raw, width, height, dest, resizeWidth) {
  let pipeline = sharp(raw, { raw: { width, height, channels: 4 } }).png({
    compressionLevel: 9,
    adaptiveFiltering: true,
  });
  if (resizeWidth) {
    pipeline = pipeline.resize(resizeWidth, null, { fit: "inside" });
  }
  await pipeline.toFile(dest);
}

async function main() {
  await mkdir(INCOMING, { recursive: true });
  await mkdir(OUT, { recursive: true });

  const source = await findSource();
  if (!source) {
    console.error(`Missing source in ${path.relative(ROOT, INCOMING)}/`);
    console.error("Add akin-wordmark-source.png, then rerun.");
    process.exit(1);
  }

  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { px: normalized, maxLuma } = normalizeLogoPixels(data, info.channels);
  const light = boostForLightBackground(Buffer.from(normalized), maxLuma);
  const dark = toDarkModeWordmark(normalized);

  await writePng(light, info.width, info.height, path.join(OUT, "akin-wordmark-light.png"), SITE_FILE_WIDTH);
  await writePng(light, info.width, info.height, path.join(OUT, "akin-wordmark-email-light.png"), EMAIL_FILE_WIDTH);
  await writePng(dark, info.width, info.height, path.join(OUT, "akin-wordmark-email-dark.png"), EMAIL_FILE_WIDTH);

  console.log(`✓ ${path.basename(source)} → public/brand/akin-wordmark-*.png`);
  console.log(`  Email: ${EMAIL_LOGO_DISPLAY_WIDTH}px display / ${EMAIL_FILE_WIDTH}px file (@2x)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
