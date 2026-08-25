#!/usr/bin/env node
/**
 * Process the Akin wordmark for site header, footer, and transactional email.
 *
 * Drop the master file in assets/brand-incoming/:
 *   akin-wordmark-source.png   — horizontal lockup; black or transparent background
 *
 * Prefer a wide lockup (~6:1) with the full "akin akinpelu" text visible.
 * Then: npm run import:brand
 */
import { access, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const INCOMING = path.join(ROOT, "assets/brand-incoming");
const OUT = path.join(ROOT, "public/brand");
const FALLBACK_SOURCE = path.join(ROOT, "public/brand/akin-logo-lockup.png");
const SOURCE_BASENAMES = ["akin-wordmark-source", "akin-logo-source"];
const SOURCE_EXTENSIONS = [".png", ".webp", ".jpg", ".jpeg"];

const EMAIL_LOGO_DISPLAY_WIDTH = 200;
const EMAIL_FILE_WIDTH = 440;
const SITE_FILE_WIDTH = 520;
const TRIM_PADDING = 20;

/** Wide lockups are ~5–7:1; square/tall masters truncate in the header. */
const MIN_LOCKUP_ASPECT = 4;

async function isWideLockup(filePath) {
  const { width, height } = await sharp(filePath).metadata();
  if (!width || !height) return false;
  return width / height >= MIN_LOCKUP_ASPECT;
}

async function findSource() {
  for (const base of SOURCE_BASENAMES) {
    for (const ext of SOURCE_EXTENSIONS) {
      const candidate = path.join(INCOMING, `${base}${ext}`);
      try {
        await access(candidate);
        if (await isWideLockup(candidate)) return candidate;
        console.warn(
          `Skipping ${path.relative(ROOT, candidate)} — not a wide lockup (need ≥${MIN_LOCKUP_ASPECT}:1).`,
        );
      } catch {
        /* try next */
      }
    }
  }
  try {
    await access(FALLBACK_SOURCE);
    console.warn(`Using fallback source: ${path.relative(ROOT, FALLBACK_SOURCE)}`);
    return FALLBACK_SOURCE;
  } catch {
    return null;
  }
}

function normalizeLogoPixels(buffer, channels) {
  const px = Buffer.from(buffer);
  let maxLuma = 0;

  for (let i = 0; i < px.length; i += channels) {
    let r = px[i];
    let g = px[i + 1];
    let b = px[i + 2];
    let a = channels === 4 ? px[i + 3] : 255;

    if (a > 0 && a < 242) {
      const alpha = a / 255;
      r = Math.min(255, Math.round(r / alpha));
      g = Math.min(255, Math.round(g / alpha));
      b = Math.min(255, Math.round(b / alpha));
    }

    if (r < 18 && g < 18 && b < 18) {
      a = 0;
    } else if (a > 0) {
      // Charcoal wordmark for light backgrounds (#2E2C2A family).
      const luma = Math.round(r * 0.2126 + g * 0.7152 + b * 0.0722);
      const tone = Math.min(255, Math.round(luma * 0.55 + 28));
      r = tone;
      g = tone;
      b = tone;
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
  if (maxLuma >= 90) return px;
  const out = Buffer.from(px);
  for (let i = 0; i < out.length; i += 4) {
    if (out[i + 3] === 0) continue;
    out[i] = Math.min(255, out[i] + 12);
    out[i + 1] = Math.min(255, out[i + 1] + 12);
    out[i + 2] = Math.min(255, out[i + 2] + 12);
  }
  return out;
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

async function trimTransparentPng(inputBuffer, width, height) {
  return sharp(inputBuffer, { raw: { width, height, channels: 4 } })
    .trim({ threshold: 8 })
    .extend({
      top: TRIM_PADDING,
      bottom: TRIM_PADDING,
      left: TRIM_PADDING,
      right: TRIM_PADDING,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

async function writeSizedPng(inputBuffer, dest, resizeWidth) {
  await sharp(inputBuffer)
    .resize(resizeWidth, null, { fit: "inside", withoutEnlargement: false })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(dest);
}

async function main() {
  await mkdir(INCOMING, { recursive: true });
  await mkdir(OUT, { recursive: true });

  const source = await findSource();
  if (!source) {
    console.error(`Missing source in ${path.relative(ROOT, INCOMING)}/`);
    console.error("Add akin-wordmark-source.png (wide lockup with full name), then rerun.");
    process.exit(1);
  }

  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const { px: normalized, maxLuma } = normalizeLogoPixels(data, info.channels);
  const light = boostForLightBackground(Buffer.from(normalized), maxLuma);
  const dark = toDarkModeWordmark(normalized);

  const lightTrimmed = await trimTransparentPng(light, info.width, info.height);
  const darkTrimmed = await trimTransparentPng(dark, info.width, info.height);

  await writeSizedPng(lightTrimmed, path.join(OUT, "akin-wordmark-light.png"), SITE_FILE_WIDTH);
  await writeSizedPng(lightTrimmed, path.join(OUT, "akin-wordmark-email-light.png"), EMAIL_FILE_WIDTH);
  await writeSizedPng(darkTrimmed, path.join(OUT, "akin-wordmark-email-dark.png"), EMAIL_FILE_WIDTH);

  const meta = await sharp(path.join(OUT, "akin-wordmark-light.png")).metadata();
  console.log(`✓ ${path.basename(source)} → public/brand/akin-wordmark-*.png`);
  console.log(`  Site wordmark: ${meta.width}×${meta.height}px (display ~${meta.height}px tall in header)`);
  console.log(`  Email: ${EMAIL_LOGO_DISPLAY_WIDTH}px wide`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
