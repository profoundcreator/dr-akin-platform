#!/usr/bin/env node
/**
 * Process cream iconmark PNGs for favicon + Apple touch icon.
 *
 * Drop sources in assets/brand-incoming/ (attach in Cursor chat or save locally):
 *   akin-iconmark-cream-512.png   — 512×512 cream square (preferred master)
 *   akin-iconmark-cream-180.png   — optional; resized from 512 if omitted
 *
 * Then: npm run import:favicon
 */
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const INCOMING = path.join(ROOT, "assets/brand-incoming");
const OUT = path.join(ROOT, "public/brand");
const FAVICON_SVG = path.join(ROOT, "public/favicon.svg");

const CREAM = { r: 250, g: 250, b: 248 }; // #FAFAF8
const LOCKUP = path.join(ROOT, "public/brand/akin-logo-lockup.png");

const SOURCE_512 = path.join(INCOMING, "akin-iconmark-cream-512.png");
const SOURCE_180 = path.join(INCOMING, "akin-iconmark-cream-180.png");

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function normalizeLogoPixels(buffer, channels) {
  const px = Buffer.from(buffer);
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
  }

  return channels === 4 ? px : Buffer.from(px);
}

async function buildFromLockupFallback() {
  const meta = await sharp(LOCKUP).metadata();
  const height = meta.height ?? 171;
  const width = meta.width ?? 1024;

  const { data, info } = await sharp(LOCKUP).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const cols = [];
  for (let x = 0; x < info.width; x++) {
    let count = 0;
    for (let y = 0; y < info.height; y++) {
      const i = (y * info.width + x) * 4;
      if (data[i + 3] > 20) count++;
    }
    cols.push(count);
  }

  let iconEnd = height;
  let bestGap = 0;
  for (let x = Math.round(height * 0.5); x < Math.round(width * 0.4); x++) {
    if (cols[x] <= 2) {
      const gapStart = x;
      let gapLen = 0;
      while (x < width && cols[x] <= 2) {
        gapLen++;
        x++;
      }
      if (gapLen > bestGap) {
        bestGap = gapLen;
        iconEnd = gapStart;
      }
    }
  }

  const { data: iconData, info: iconInfo } = await sharp(LOCKUP)
    .extract({ left: 0, top: 0, width: iconEnd, height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const normalized = normalizeLogoPixels(iconData, iconInfo.channels);
  const icon = await sharp(normalized, { raw: { width: iconInfo.width, height: iconInfo.height, channels: 4 } })
    .trim({ threshold: 8 })
    .png()
    .toBuffer();

  const iconMeta = await sharp(icon).metadata();
  const maxWidth = Math.round(512 * 0.88);
  const maxHeight = Math.round(512 * 0.55);
  const resizedIcon = await sharp(icon)
    .resize(maxWidth, maxHeight, { fit: "inside" })
    .png()
    .toBuffer();

  const resizedMeta = await sharp(resizedIcon).metadata();
  const left = Math.round((512 - (resizedMeta.width ?? 0)) / 2);
  const top = Math.round((512 - (resizedMeta.height ?? 0)) / 2);

  return sharp({
    create: { width: 512, height: 512, channels: 3, background: CREAM },
  })
    .composite([{ input: resizedIcon, left, top }])
    .png()
    .toBuffer();
}

async function loadMaster512() {
  if (await exists(SOURCE_512)) return readFile(SOURCE_512);
  if (await exists(SOURCE_180)) {
    return sharp(SOURCE_180).resize(512, 512, { fit: "fill" }).png().toBuffer();
  }

  console.warn("No incoming cream iconmark found — building from lockup icon fallback.");
  return buildFromLockupFallback();
}

async function writeFaviconSvg(png32Buffer) {
  const base64 = png32Buffer.toString("base64");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="Akin Akinpelu">
  <rect width="32" height="32" rx="6" fill="#FAFAF8"/>
  <image href="data:image/png;base64,${base64}" x="1" y="1" width="30" height="30" preserveAspectRatio="xMidYMid meet"/>
</svg>
`;
  await writeFile(FAVICON_SVG, svg, "utf8");
}

async function main() {
  await mkdir(INCOMING, { recursive: true });
  await mkdir(OUT, { recursive: true });

  const master512 = await loadMaster512();

  await sharp(master512).png({ compressionLevel: 9 }).toFile(path.join(OUT, "akin-iconmark-512.png"));

  await sharp(master512)
    .resize(180, 180, { fit: "fill" })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, "akin-iconmark.png"));

  const png32 = await sharp(master512).resize(32, 32, { fit: "fill" }).png().toBuffer();
  await writeFaviconSvg(png32);

  const sourceLabel = (await exists(SOURCE_512))
    ? path.relative(ROOT, SOURCE_512)
    : (await exists(SOURCE_180))
      ? path.relative(ROOT, SOURCE_180)
      : "lockup fallback";

  console.log(`✓ ${sourceLabel} → favicon assets`);
  console.log("  public/favicon.svg");
  console.log("  public/brand/akin-iconmark.png (180×180 Apple touch)");
  console.log("  public/brand/akin-iconmark-512.png");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
